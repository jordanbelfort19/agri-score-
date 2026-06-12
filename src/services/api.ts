export interface KYCFlowData {
  farmerId?: string;
  cropFieldImage?: string;
  // Personal
  fullName: string;
  mobile: string;
  dob: string;
  gender: string;
  address: string;
  kycIdType: string;
  kycIdNumber: string;
  
  // Farm
  sizeAcres: number;
  ownershipType: 'OWNED' | 'LEASED' | 'SHARED';
  cropType: string;
  sowingDate: string;
  harvestDate: string;
  soilType: string;
  irrigationType: string;

  // Financial
  annualIncome: number;
  existingLoans: boolean;
  outstandingDebt: number;
  bankName: string;
  bankAccountNumber: string;

  // Location
  village: string;
  district: string;
  state: string;
  gpsLat: number;
  gpsLon: number;

  // AI Diagnostic Audit Details
  cropHealthScore?: number;
  diseaseDetected?: string;
  diagnosticSeverity?: 'LOW' | 'MEDIUM' | 'HIGH';
  diagnosticConfidence?: number;
  treatmentRecommendation?: string;
  prevention?: string;
}

export interface CreditScoreBreakdown {
  overallScore: number;
  grade: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  cropHealth: number;          // 20%
  yieldStability: number;      // 20%
  climateRisk: number;         // 15%
  farmingPractice: number;     // 15%
  financialCapability: number; // 20%
  trustVerification: number;   // 10%
}

export interface CropDiagnostic {
  id: string;
  imageUrl: string;
  diseaseDetected: string;
  confidenceScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  treatmentRecommendation: string;
  createdAt: string;
}

export interface LoanProduct {
  id: string;
  bankName: string;
  interestRate: number;
  tenureMonths: number;
  maxAmount: number;
  description: string;
}

export interface LoanApplicationData {
  id: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  tenureMonths: number;
  interestRate: number;
  emi: number;
  bankName: string;
  status: 'PENDING' | 'OFFERED' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  offeredInterestRate?: number;
  offeredTenureMonths?: number;
  adminRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK CONFIGURATION
// IMPORTANT: Replace this with your development machine's LAN IP address so
// that physical devices running Expo Go can reach both microservices.
// Do NOT use localhost or 127.0.0.1 — they will not work on real devices.
// ─────────────────────────────────────────────────────────────────────────────
export const LOCAL_IP = '10.20.16.214'; // Your machine's LAN IP (auto-detected)

export const AGRONOMIC_ENGINE_URL = `http://${LOCAL_IP}:5001`;
export const FINANCIAL_ENGINE_URL  = `http://${LOCAL_IP}:5002`;

// Dynamic resolver for HTTP server based on OS and environment
const getHttpUrl = () => {
  try {
    const Constants = require('expo-constants').default;
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.packagerOpts?.hostId;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:8000`;
    }
  } catch (e) {
    // Fallback if expo-constants is unavailable
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000'; // Redirects Android Emulator to host computer
  }
  return 'http://localhost:8000'; // iOS Simulator / Web fallback
};

export const BASE_HTTP_URL = getHttpUrl();

// In-Memory Database State
let KYC_DB: Record<string, KYCFlowData> = {};
let DIAGNOSTICS_DB: Record<string, CropDiagnostic[]> = {};
let APPLICATIONS_DB: LoanApplicationData[] = [];

// Pre-seeded Loan Products in Marketplace
export const MOCK_LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'prod-1',
    bankName: 'National Agri Development Bank',
    interestRate: 6.8,
    tenureMonths: 12,
    maxAmount: 500000,
    description: 'Special short-term crop cultivation loan with subsidized interest rates for high-yield grains.'
  },
  {
    id: 'prod-2',
    bankName: 'State Farmers Cooperative',
    interestRate: 7.5,
    tenureMonths: 24,
    maxAmount: 800000,
    description: 'Medium-term farm machinery, irrigation pumps, and tractor financing with flexible repayment plans.'
  },
  {
    id: 'prod-3',
    bankName: 'Apex MicroFinance Rural Bank',
    interestRate: 8.9,
    tenureMonths: 18,
    maxAmount: 300000,
    description: 'Quick-disbursement organic farming credit. Lower interest rates available for farmers with AgriScore > 75.'
  }
];

// Seed initial KYC data for testing the farmer profile
const seedFarmerKYC = () => {
  const seedId = 'farmer-user-id-123';
  KYC_DB[seedId] = {
    fullName: 'Ramesh Kumar',
    mobile: '9876543210',
    dob: '1984-06-15',
    gender: 'Male',
    address: 'Plot 42, Green Village Road',
    kycIdType: 'Aadhaar Card',
    kycIdNumber: '1234-5678-9012',
    sizeAcres: 8.5,
    ownershipType: 'OWNED',
    cropType: 'Basmati Rice',
    sowingDate: '2026-05-01',
    harvestDate: '2026-09-30',
    soilType: 'Alluvial Soil',
    irrigationType: 'Tubewell / Canal',
    annualIncome: 450000,
    existingLoans: false,
    outstandingDebt: 0,
    bankName: 'National Agri Development Bank',
    bankAccountNumber: '987654321098',
    village: 'Karnal',
    district: 'Karnal',
    state: 'Haryana',
    gpsLat: 29.6857,
    gpsLon: 76.9905,
  };
  
  DIAGNOSTICS_DB[seedId] = [
    {
      id: 'diag-1',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500',
      diseaseDetected: 'Rice Blast (Magnaporthe oryzae)',
      confidenceScore: 94.5,
      severity: 'MEDIUM',
      treatmentRecommendation: 'Spray Tricyclazole 75 WP at 0.6 grams per liter of water. Ensure proper spacing and moderate nitrogen fertilizer application.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  APPLICATIONS_DB.push({
    id: 'loan-app-seed',
    farmerId: seedId,
    farmerName: 'Ramesh Kumar',
    amount: 150000,
    tenureMonths: 12,
    interestRate: 6.8,
    emi: 12970,
    bankName: 'National Agri Development Bank',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });
};
// seedFarmerKYC();

// ─────────────────────────────────────────────────────────────────────────────
// SCORE ORCHESTRATOR
// Calls both ML microservices concurrently, applies rule-based native
// calculations, and merges everything into a single CreditScoreBreakdown.
// ─────────────────────────────────────────────────────────────────────────────

// Internal response types for each microservice
interface AgronomicEngineResponse {
  cropHealthScore: number;
  yieldStabilityScore: number;
  climateRiskScore: number;
}

interface FinancialEngineResponse {
  financialCapabilityScore: number;
  riskTier: string;
  improvementHint: string;
}

/**
 * Maps kycDetails.irrigationType to a Farming Practice Score (0–100).
 * Drip / Sprinkler irrigation = best practice (100).
 * Canal / Tubewell based     = moderate practice (70).
 * Rainfed                    = low practice (40).
 * Any other value defaults to 60.
 */
const calcFarmingPracticeScore = (irrigationType: string): number => {
  const normalized = irrigationType.toLowerCase().trim();
  if (normalized.includes('drip') || normalized.includes('sprinkler')) return 100;
  if (normalized.includes('canal') || normalized.includes('tubewell')) return 70;
  if (normalized.includes('rainfed'))                                   return 40;
  return 60;
};

/**
 * Derives a Trust Verification Score (0–100).
 * Returns 95 when a KYC ID number is present, 50 otherwise.
 */
const calcTrustVerificationScore = (kycIdNumber?: string): number => {
  return kycIdNumber && kycIdNumber.trim().length > 0 ? 95 : 50;
};

/**
 * Maps a numeric AgriScore to its letter grade and risk rating per
 * Section 7 of the AgriScore technical specification:
 *  ≥ 90  → A+  / LOW
 *  80–89 → A   / LOW
 *  70–79 → B+  / MEDIUM
 *  60–69 → B   / MEDIUM
 *  50–59 → C   / MEDIUM
 *   < 50 → D   / HIGH
 */
export const calculateGradeAndRisk = (score: number): { grade: string; riskRating: 'LOW' | 'MEDIUM' | 'HIGH' } => {
  if (score >= 90) return { grade: 'A+', riskRating: 'LOW' };
  if (score >= 80) return { grade: 'A',  riskRating: 'LOW' };
  if (score >= 70) return { grade: 'B+', riskRating: 'MEDIUM' };
  if (score >= 60) return { grade: 'B',  riskRating: 'MEDIUM' };
  if (score >= 50) return { grade: 'C',  riskRating: 'MEDIUM' };
  return           { grade: 'D',  riskRating: 'HIGH' };
};

/**
 * generateComprehensiveScore
 *
 * Asynchronously orchestrates both ML microservices in parallel using
 * Promise.all, calculates rule-based scores natively, applies the
 * 6-factor weighted matrix, and returns a fully-typed CreditScoreBreakdown.
 *
 * @param farmerId    - Unique farmer identifier.
 * @param imageBase64 - Base64-encoded crop image (with or without data URI prefix).
 * @param kycDetails  - Farmer KYC profile object from the Zustand store.
 */
/**
 * Local fallback scoring engine — computes a realistic AgriScore from KYC data
 * using the same weighted matrix as the ML microservices. This ensures the KYC
 * flow always completes even when the Python backends are offline.
 */
const computeLocalFallbackScore = (kycDetails: KYCFlowData): CreditScoreBreakdown => {
  const farmingPracticeScore   = calcFarmingPracticeScore(kycDetails.irrigationType);
  const trustVerificationScore = calcTrustVerificationScore(kycDetails.kycIdNumber);

  // Local crop health estimation (60–100 range)
  let cropHealth = 72;
  if (kycDetails.cropHealthScore && kycDetails.cropHealthScore > 0) {
    cropHealth = Math.max(60, Math.min(100, kycDetails.cropHealthScore));
  } else {
    const cropLower = (kycDetails.cropType || '').toLowerCase();
    if (cropLower.includes('rice') || cropLower.includes('wheat') || cropLower.includes('basmati')) cropHealth = 78;
    else if (cropLower.includes('cotton') || cropLower.includes('sugarcane')) cropHealth = 74;
  }

  // Local yield stability estimation (60–100 range)
  let yieldStability = 68;
  const soil = (kycDetails.soilType || '').toLowerCase();
  if (soil.includes('alluvial') || soil.includes('black')) yieldStability += 12;
  else if (soil.includes('clay')) yieldStability += 5;
  else if (soil.includes('sandy')) yieldStability -= 5;
  if (kycDetails.ownershipType === 'OWNED') yieldStability += 10;
  else if (kycDetails.ownershipType === 'SHARED') yieldStability -= 5;
  if (kycDetails.sizeAcres > 10) yieldStability += 8;
  else if (kycDetails.sizeAcres < 3) yieldStability -= 5;
  yieldStability = Math.max(60, Math.min(100, yieldStability));

  // Local climate risk estimation (60–100 range)
  let climateRisk = 70;
  const irrigation = (kycDetails.irrigationType || '').toLowerCase();
  if (irrigation.includes('drip') || irrigation.includes('sprinkler')) climateRisk += 12;
  else if (irrigation.includes('rainfed')) climateRisk -= 8;
  else climateRisk += 3;
  const lat = kycDetails.gpsLat || 20;
  const lon = kycDetails.gpsLon || 77;
  if (lat >= 24 && lat <= 31 && lon >= 69 && lon <= 79) climateRisk -= 5;
  climateRisk = Math.max(60, Math.min(100, climateRisk));

  // Local financial capability estimation (50–100 range)
  let financialCapability = 60;
  const income = kycDetails.annualIncome || 0;
  const debt   = kycDetails.outstandingDebt || 0;
  const dti    = income > 0 ? debt / income : 1.0;
  if (income >= 500000) financialCapability += 20;
  else if (income >= 250000) financialCapability += 10;
  if (kycDetails.existingLoans && dti > 0.5) financialCapability -= 15;
  else if (!kycDetails.existingLoans) financialCapability += 10;
  if (kycDetails.ownershipType === 'OWNED') financialCapability += 8;
  financialCapability = Math.max(50, Math.min(100, financialCapability));

  // Weighted Scoring Matrix (Section 7 of the tech spec)
  const overallScore = Math.round(
    (cropHealth            * 0.20) +
    (yieldStability        * 0.20) +
    (climateRisk           * 0.15) +
    (farmingPracticeScore  * 0.15) +
    (financialCapability   * 0.20) +
    (trustVerificationScore * 0.10)
  );

  const { grade, riskRating } = calculateGradeAndRisk(overallScore);

  return {
    overallScore,
    grade,
    riskRating,
    cropHealth,
    yieldStability,
    climateRisk,
    farmingPractice:    farmingPracticeScore,
    financialCapability,
    trustVerification:  trustVerificationScore,
  };
};

export const generateComprehensiveScore = async (
  farmerId: string,
  imageBase64: string,
  kycDetails: KYCFlowData
): Promise<CreditScoreBreakdown> => {

  // ── 1. Rule-Based Native Calculations (no network required) ───────────────
  const farmingPracticeScore  = calcFarmingPracticeScore(kycDetails.irrigationType);
  const trustVerificationScore = calcTrustVerificationScore(kycDetails.kycIdNumber);

  // ── 2. Build request payloads ─────────────────────────────────────────────
  const agronomicPayload = {
    imageUri: imageBase64,
    kycDetails,
  };

  const financialPayload = {
    farmerId:        farmerId,
    annualIncome:    kycDetails.annualIncome,
    existingLoans:   kycDetails.existingLoans,
    outstandingDebt: kycDetails.outstandingDebt,
    farmSizeAcres:   kycDetails.sizeAcres,
    ownershipType:   kycDetails.ownershipType,
    bankName:        kycDetails.bankName,
  };

  // ── 3. Try concurrent network calls; fall back gracefully if offline ──────
  let cropHealth: number;
  let yieldStability: number;
  let climateRisk: number;
  let financialCapability: number;

  try {
    const [agronomicRes, financialRes] = await Promise.all([
      fetch(`${AGRONOMIC_ENGINE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agronomicPayload),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Agronomic Engine ${res.status}`);
        return res.json() as Promise<AgronomicEngineResponse>;
      }),

      fetch(`${FINANCIAL_ENGINE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financialPayload),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Financial Engine ${res.status}`);
        return res.json() as Promise<FinancialEngineResponse>;
      }),
    ]);

    cropHealth          = Math.max(60, Math.min(100, agronomicRes.cropHealthScore));
    yieldStability      = Math.max(60, Math.min(100, agronomicRes.yieldStabilityScore));
    climateRisk         = Math.max(60, Math.min(100, agronomicRes.climateRiskScore));
    financialCapability = Math.max(50, Math.min(100, financialRes.financialCapabilityScore));
  } catch (_networkError) {
    // ── Microservices offline — use local rule-based scoring ────────────────
    console.warn('[AgriScore] ML microservices unreachable. Using local fallback engine.');
    return computeLocalFallbackScore(kycDetails);
  }

  // ── 4. Weighted Scoring Matrix ────────────────────────────────────────────
  const overallScore = Math.round(
    (cropHealth            * 0.20) +
    (yieldStability        * 0.20) +
    (climateRisk           * 0.15) +
    (farmingPracticeScore  * 0.15) +
    (financialCapability   * 0.20) +
    (trustVerificationScore * 0.10)
  );

  const { grade, riskRating } = calculateGradeAndRisk(overallScore);

  return {
    overallScore,
    grade,
    riskRating,
    cropHealth,
    yieldStability,
    climateRisk,
    farmingPractice:     farmingPracticeScore,
    financialCapability,
    trustVerification:   trustVerificationScore,
  };
};

export const apiService = {
  // Sync KYC details from WebSocket event
  syncKYCData: (farmerId: string, data: KYCFlowData) => {
    KYC_DB[farmerId] = data;
    console.log(`[API Service] Synchronized KYC details for farmer: ${farmerId}`);
  },

  // Sync Loan Application from WebSocket event
  syncLoanApplication: (app: LoanApplicationData) => {
    const idx = APPLICATIONS_DB.findIndex(a => a.id === app.id);
    if (idx !== -1) {
      APPLICATIONS_DB[idx] = {
        ...APPLICATIONS_DB[idx],
        ...app
      };
      console.log(`[API Service] Synchronized existing loan status: ${app.id}`);
    } else {
      APPLICATIONS_DB.unshift(app);
      console.log(`[API Service] Synchronized new loan application: ${app.id}`);
    }
  },

  // ADMIN: Get all registered farmers
  getAllFarmers: async (): Promise<KYCFlowData[]> => {
    try {
      const res = await fetch(`${BASE_HTTP_URL}/api/farmers`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          json.data.forEach((farmer: any) => {
            const fid = farmer.farmerId || farmer.farmer_id;
            if (fid) {
              KYC_DB[fid] = farmer;
            }
          });
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to get all farmers via HTTP, using local:', e);
    }
    return Object.values(KYC_DB);
  },

  // Fetch Farmer Profile
  getKYCDetails: async (farmerId: string): Promise<KYCFlowData | null> => {
    try {
      const res = await fetch(`${BASE_HTTP_URL}/api/farmer/profile/${farmerId}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          KYC_DB[farmerId] = json.data;
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to get KYC details via HTTP, falling back to local DB:', e);
    }
    return KYC_DB[farmerId] || null;
  },

  // Submit KYC Profile
  submitKYC: async (farmerId: string, data: KYCFlowData, cropFieldImage?: string | null): Promise<KYCFlowData> => {
    KYC_DB[farmerId] = { ...data, cropFieldImage: cropFieldImage || undefined };

    try {
      if (cropFieldImage) {
        const formData = new FormData();
        formData.append('farmerId', farmerId);
        Object.keys(data).forEach((key) => {
          const val = (data as any)[key];
          if (val !== undefined && val !== null) {
            formData.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
          }
        });

        const uriParts = cropFieldImage.split('/');
        const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';
        const fileType = fileName.split('.').pop() || 'jpeg';

        formData.append('cropFieldImage', {
          uri: cropFieldImage,
          name: fileName,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        } as any);

        const res = await fetch(`${BASE_HTTP_URL}/api/farmer/profile-multipart`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            KYC_DB[farmerId] = json.data;
            return json.data;
          }
        }
      } else {
        const res = await fetch(`${BASE_HTTP_URL}/api/farmer/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ farmerId, ...data })
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            KYC_DB[farmerId] = json.data;
            return json.data;
          }
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to submit KYC via HTTP, falling back to local DB:', e);
    }
    return KYC_DB[farmerId];
  },

  // Calculate Credit Score based on farmer details by calling the real ML engines
  fetchCreditScore: async (farmerId: string): Promise<CreditScoreBreakdown> => {
    const kyc = KYC_DB[farmerId];
    if (!kyc) {
      // No KYC yet — return a zero-state baseline (not a fake score)
      return {
        overallScore: 0,
        grade: 'N/A',
        riskRating: 'HIGH',
        cropHealth: 0,
        yieldStability: 0,
        climateRisk: 0,
        farmingPractice: 0,
        financialCapability: 0,
        trustVerification: 0,
      };
    }
    // Call the real dynamic scorer using the farmer's registered crop field image (if any)
    // generateComprehensiveScore has a built-in local fallback so this always succeeds.
    const imagePayload = kyc.cropFieldImage || '';
    return generateComprehensiveScore(farmerId, imagePayload, kyc);
  },

  // Store a real diagnostic result directly (from engine output — bypasses mock)
  storeDiagnosticResult: (farmerId: string, diagnostic: CropDiagnostic): void => {
    if (!DIAGNOSTICS_DB[farmerId]) {
      DIAGNOSTICS_DB[farmerId] = [];
    }
    if (!DIAGNOSTICS_DB[farmerId].some(d => d.id === diagnostic.id)) {
      DIAGNOSTICS_DB[farmerId].unshift(diagnostic);
    }
  },

  // Legacy mock upload — kept for backward compat but NOT used in main flow
  uploadCropImage: async (farmerId: string, imageUri: string): Promise<CropDiagnostic> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDiagnostic: CropDiagnostic = {
          id: `diag-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl: imageUri,
          diseaseDetected: 'Healthy Crop (Simulation)',
          confidenceScore: 98.2,
          severity: 'LOW',
          treatmentRecommendation: 'No action required.',
          createdAt: new Date().toISOString(),
        };

        if (!DIAGNOSTICS_DB[farmerId]) {
          DIAGNOSTICS_DB[farmerId] = [];
        }
        DIAGNOSTICS_DB[farmerId].unshift(newDiagnostic);
        resolve(newDiagnostic);
      }, 1000);
    });
  },

  // Fetch crop diagnosis history
  getCropDiagnostics: async (farmerId: string): Promise<CropDiagnostic[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(DIAGNOSTICS_DB[farmerId] || []);
      }, 400);
    });
  },

  // Submit Loan Application
  submitLoanApplication: async (
    farmerId: string, 
    farmerName: string,
    amount: number, 
    tenureMonths: number, 
    interestRate: number, 
    bankName: string
  ): Promise<LoanApplicationData> => {
    // Generate base mock local app
    const monthlyRate = (interestRate / 100) / 12;
    const emi = Math.round(
      (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );

    const mockApp: LoanApplicationData = {
      id: `loan-app-${Math.random().toString(36).substr(2, 9)}`,
      farmerId,
      farmerName,
      amount,
      tenureMonths,
      interestRate,
      emi,
      bankName,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${BASE_HTTP_URL}/api/loans/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          farmerName,
          amount,
          tenureMonths,
          interestRate,
          bankName
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          APPLICATIONS_DB.unshift(json.data);
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to submit loan application via HTTP, using mock:', e);
    }

    APPLICATIONS_DB.unshift(mockApp);
    return mockApp;
  },

  // Get active applications for a specific farmer
  getFarmerLoanApplications: async (farmerId: string): Promise<LoanApplicationData[]> => {
    try {
      const res = await fetch(`${BASE_HTTP_URL}/api/loans/farmer/${farmerId}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          // Merge/sync with local DB
          const remoteApps = json.data;
          remoteApps.forEach((app: any) => {
            const idx = APPLICATIONS_DB.findIndex(a => a.id === app.id);
            if (idx !== -1) {
              APPLICATIONS_DB[idx] = app;
            } else {
              APPLICATIONS_DB.push(app);
            }
          });
          return APPLICATIONS_DB.filter(app => app.farmerId === farmerId);
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to get farmer loan applications via HTTP:', e);
    }
    return APPLICATIONS_DB.filter(app => app.farmerId === farmerId);
  },

  // ADMIN: Get all applications
  getAllLoanApplications: async (): Promise<LoanApplicationData[]> => {
    try {
      const res = await fetch(`${BASE_HTTP_URL}/api/loans`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          APPLICATIONS_DB = json.data;
          return APPLICATIONS_DB;
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to get all applications via HTTP:', e);
    }
    return APPLICATIONS_DB;
  },

  // ADMIN: Submit Loan offer adjustments or update status
  adminSubmitOffer: async (
    applicationId: string,
    offeredInterestRate: number,
    offeredTenureMonths: number,
    status: 'OFFERED' | 'APPROVED' | 'REJECTED',
    remarks: string
  ): Promise<LoanApplicationData> => {
    const appIndex = APPLICATIONS_DB.findIndex(app => app.id === applicationId);
    const app = appIndex !== -1 ? APPLICATIONS_DB[appIndex] : null;
    
    const monthlyRate = (offeredInterestRate / 100) / 12;
    const newEmi = app ? Math.round(
      (app.amount * monthlyRate * Math.pow(1 + monthlyRate, offeredTenureMonths)) /
      (Math.pow(1 + monthlyRate, offeredTenureMonths) - 1)
    ) : 0;

    const mockUpdatedApp: LoanApplicationData = app ? {
      ...app,
      status,
      offeredInterestRate,
      offeredTenureMonths,
      emi: newEmi,
      adminRemarks: remarks,
      updatedAt: new Date().toISOString(),
    } : {
      id: applicationId,
      farmerId: '',
      farmerName: 'Unknown',
      amount: 0,
      tenureMonths: offeredTenureMonths,
      interestRate: offeredInterestRate,
      emi: newEmi,
      bankName: '',
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (appIndex !== -1) {
      APPLICATIONS_DB[appIndex] = mockUpdatedApp;
    }

    try {
      const res = await fetch(`${BASE_HTTP_URL}/api/loans/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          farmerId: app ? app.farmerId : '',
          status,
          offeredInterestRate,
          offeredTenureMonths,
          adminRemarks: remarks
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          if (appIndex !== -1) {
            APPLICATIONS_DB[appIndex] = json.data;
          }
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[API Service] Failed to update offer via HTTP:', e);
    }

    return mockUpdatedApp;
  },

  // ADMIN: Action loan offer (by farmer: accept/reject)
  farmerActionOffer: async (applicationId: string, accept: boolean): Promise<LoanApplicationData> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const appIndex = APPLICATIONS_DB.findIndex(app => app.id === applicationId);
        if (appIndex === -1) {
          reject(new Error('Loan application not found.'));
          return;
        }

        const app = APPLICATIONS_DB[appIndex];
        const updatedApp: LoanApplicationData = {
          ...app,
          status: accept ? 'APPROVED' : 'REJECTED',
          updatedAt: new Date().toISOString(),
        };

        APPLICATIONS_DB[appIndex] = updatedApp;
        resolve(updatedApp);
      }, 800);
    });
  },

  // ADMIN: Get overall statistics
  getAdminStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalRegistered = Object.keys(KYC_DB).length;
        
        // Calculate average credit score
        const activeFarmerIds = Object.keys(KYC_DB);
        let sumScore = 0;
        
        activeFarmerIds.forEach(fid => {
          // Sync calculation (mock)
          const kyc = KYC_DB[fid];
          let score = 35;
          if (kyc) {
            let cropHealth = 70, yieldStability = 65, climateRisk = 80, farmingPractice = 75, financialCapability = 60, trustVerification = 95;
            if (kyc.ownershipType === 'OWNED') { yieldStability += 15; financialCapability += 10; }
            if (kyc.sizeAcres > 10) { financialCapability += 15; yieldStability += 10; }
            if (kyc.irrigationType.toLowerCase().includes('drip')) { farmingPractice += 15; cropHealth += 10; }
            if (kyc.existingLoans) financialCapability -= 25;
            score = Math.round(cropHealth*0.2 + yieldStability*0.2 + climateRisk*0.15 + farmingPractice*0.15 + financialCapability*0.2 + trustVerification*0.1);
          }
          sumScore += score;
        });

        const averageCreditScore = totalRegistered > 0 ? Math.round(sumScore / totalRegistered) : 72;
        const totalLoanVolume = APPLICATIONS_DB
          .filter(app => app.status === 'APPROVED' || app.status === 'DISBURSED')
          .reduce((sum, app) => sum + app.amount, 0);

        const pendingApplications = APPLICATIONS_DB.filter(app => app.status === 'PENDING').length;

        resolve({
          totalRegistered,
          averageCreditScore,
          totalLoanVolume,
          pendingApplications,
          activeLendersCount: 4,
          systemRiskFlagCount: APPLICATIONS_DB.filter(app => app.status === 'REJECTED').length
        });
      }, 500);
    });
  }
};
