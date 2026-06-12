import { create } from 'zustand';
import { apiService, generateComprehensiveScore, KYCFlowData, CreditScoreBreakdown, CropDiagnostic } from '../services/api';
// Re-export so screens can use the type directly
export type { CropDiagnostic };
import { webSocketService } from '../services/websocket';
import { useOnboardingStore } from './useOnboardingStore';

interface FarmerState {
  kycDetails: KYCFlowData | null;
  creditScore: CreditScoreBreakdown | null;
  diagnostics: CropDiagnostic[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchKYC: (farmerId: string) => Promise<void>;
  submitKYC: (farmerId: string, data: KYCFlowData, imageBase64?: string) => Promise<void>;
  fetchCreditScore: (farmerId: string, imageBase64: string) => Promise<void>;
  uploadCropImage: (farmerId: string, imageUri: string) => Promise<CropDiagnostic>;
  storeDiagnosticResult: (farmerId: string, diagnostic: CropDiagnostic) => void;
  fetchDiagnostics: (farmerId: string) => Promise<void>;
  resetFarmerStore: () => void;
}

export const useFarmerStore = create<FarmerState>((set, get) => ({
  kycDetails: null,
  creditScore: null,
  diagnostics: [],
  isLoading: false,
  isSaving: false,
  error: null,

  fetchKYC: async (farmerId) => {
    set({ isLoading: true, error: null });
    try {
      const details = await apiService.getKYCDetails(farmerId);
      set({ kycDetails: details, isLoading: false });
      if (details) {
        // Automatically fetch credit score if onboarded.
        // No crop image is available in this flow, so we pass an empty string;
        // the agronomic engine will return baseline scores in that case.
        await get().fetchCreditScore(farmerId, '');
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch KYC details', isLoading: false });
    }
  },

  submitKYC: async (farmerId, data, imageBase64) => {
    set({ isSaving: true, error: null });
    try {
      const cropFieldImage = useOnboardingStore.getState().cropFieldImage;
      const updated = await apiService.submitKYC(farmerId, data, cropFieldImage);
      set({ kycDetails: updated, isSaving: false });
      // Recalculate credit score after KYC changes.
      // Pass the base64 crop image if available!
      await get().fetchCreditScore(farmerId, imageBase64 || '');

      // Notify the lender in real-time via WebSocket
      webSocketService.send('KYC_SUBMITTED', {
        farmerId,
        farmerName: data.fullName,
        details: updated
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to submit KYC details', isSaving: false });
      throw err;
    }
  },

  fetchCreditScore: async (farmerId, imageBase64) => {
    set({ isLoading: true, error: null });
    try {
      const kycDetails = get().kycDetails;
      if (!kycDetails) {
        // No KYC yet — set a reasonable baseline so screens don't crash
        set({
          creditScore: {
            overallScore: 0,
            grade: 'N/A',
            riskRating: 'HIGH',
            cropHealth: 0,
            yieldStability: 0,
            climateRisk: 0,
            farmingPractice: 0,
            financialCapability: 0,
            trustVerification: 0,
          },
          isLoading: false
        });
        return;
      }
      // generateComprehensiveScore now has a built-in local fallback — it will
      // ALWAYS return a valid score even when microservices are offline.
      const score = await generateComprehensiveScore(farmerId, imageBase64, kycDetails);
      set({ creditScore: score });
    } catch (err: any) {
      // Should never reach here since generateComprehensiveScore has its own fallback,
      // but guard just in case.
      set({ error: err.message || 'Failed to generate credit score' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadCropImage: async (farmerId, imageUri) => {
    set({ isSaving: true, error: null });
    try {
      const result = await apiService.uploadCropImage(farmerId, imageUri);
      // Prepend the diagnostic
      set((state) => ({
        diagnostics: [result, ...state.diagnostics],
        isSaving: false
      }));
      return result;
    } catch (err: any) {
      set({ error: err.message || 'Failed to upload crop image', isSaving: false });
      throw err;
    }
  },

  // Directly push a real (engine-derived) diagnostic into local state + in-memory DB
  storeDiagnosticResult: (farmerId, diagnostic) => {
    apiService.storeDiagnosticResult(farmerId, diagnostic);
    set((state) => {
      if (state.diagnostics.some(d => d.id === diagnostic.id)) {
        return { isSaving: false };
      }
      return {
        diagnostics: [diagnostic, ...state.diagnostics],
        isSaving: false
      };
    });
  },

  fetchDiagnostics: async (farmerId) => {
    set({ isLoading: true, error: null });
    try {
      const history = await apiService.getCropDiagnostics(farmerId);
      const uniqueHistory = history.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      set({ diagnostics: uniqueHistory, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch diagnostics', isLoading: false });
    }
  },

  resetFarmerStore: () => {
    set({
      kycDetails: null,
      creditScore: null,
      diagnostics: [],
      error: null,
      isLoading: false,
      isSaving: false,
    });
  }
}));
