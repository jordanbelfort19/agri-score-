# 🌾 AgriScore – AI-Powered Farmer Credit Assessment Platform

AgriScore is an AI-driven AgriTech and FinTech platform designed to improve access to agricultural credit for small and marginal farmers. The platform leverages Artificial Intelligence, Machine Learning, Computer Vision, and Financial Risk Analysis to generate a comprehensive Farmer Credit Score, enabling banks and financial institutions to make fair, transparent, and data-driven lending decisions.

---

## 🚀 Problem Statement

Millions of farmers face challenges in accessing formal credit due to limited financial history, lack of reliable farm-level risk assessment, climate uncertainties, and dependence on informal moneylenders. Traditional lending systems often fail to evaluate the true agricultural potential of farmers.

AgriScore addresses this challenge by analyzing crop health, yield potential, climate risks, and financial capability to generate a reliable and explainable credit score.

---

## 🎯 Objectives

* Improve financial inclusion for farmers.
* Enable data-driven lending decisions.
* Reduce dependency on informal lending sources.
* Assess agricultural performance using AI.
* Generate personalized loan recommendations.

---

## 🏗️ System Architecture

```text
Farmer App
     │
     ▼
Data Collection
     │
     ▼
Agronomic Engine
(Crop Health + Yield Prediction + Climate Risk)
     │
     ▼
Farmer Credit Score Engine
     │
     ▼
Financial Engine
     │
     ▼
Lending Marketplace
     │
     ▼
Personalized Loan Offers
```

---

## 📂 Project Structure

```text
agriscore-project/
│
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   └── CropUpload.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── store/
│   │       └── useFarmerStore.ts
│
└── backend/
    ├── agronomic-engine/
    │   ├── models/
    │   │   ├── agriscore_vision_model.h5
    │   │   └── xgboost_yield_model.pkl
    │   ├── app.py
    │   └── requirements.txt
    │
    └── financial-engine/
        ├── models/
        │   └── financial_scorecard.pkl
        ├── main.py
        └── requirements.txt
```

---

## 🤖 AI Modules

### 1. Crop Health Assessment

Uses Computer Vision models to detect crop diseases and evaluate plant health.

**Model:** MobileNetV2 / CNN

**Input:**

* Crop Images

**Output:**

* Disease Classification
* Crop Health Score

---

### 2. Yield Prediction Engine

Predicts expected crop production using agricultural and environmental factors.

**Model:** XGBoost Regressor

**Input:**

* Rainfall
* Temperature
* Soil Information
* Historical Yield Data

**Output:**

* Predicted Yield
* Yield Stability Score

---

### 3. Climate Risk Assessment

Evaluates environmental risks affecting crop productivity.

**Model:** XGBoost / Random Forest

**Input:**

* Weather Data
* Rainfall Patterns
* Temperature Trends

**Output:**

* Climate Vulnerability Score

---

### 4. Financial Capability Engine

Analyzes farmer financial information and repayment capacity.

**Model:** Random Forest / Scorecard Model

**Input:**

* Annual Income
* Outstanding Debt
* Existing Loans
* Land Ownership

**Output:**

* Financial Capability Score
* Risk Tier

---

## 📊 Farmer Credit Score Calculation

The final AgriScore is generated using weighted scoring.

```text
Crop Health Score              = 20%
Yield Stability Score          = 20%
Climate Vulnerability Score    = 15%
Financial Capability Score     = 20%
Farming Practice Score         = 10%
Trust & Verification Score     = 15%
```

```text
Final AgriScore = 0 - 100
```

### Risk Categories

| Score Range | Risk Level  |
| ----------- | ----------- |
| 0 – 40      | High Risk   |
| 41 – 70     | Medium Risk |
| 71 – 100    | Low Risk    |

---

## 🛠️ Technology Stack

### Frontend

* React Native
* Expo
* TypeScript
* Zustand
* React Navigation

### Backend

* FastAPI
* Flask
* Python

### Machine Learning

* TensorFlow
* Keras
* XGBoost
* Scikit-Learn
* Pandas
* NumPy

### Database

* PostgreSQL
* Firebase (Optional)

### Cloud & Deployment

* AWS
* Render
* Railway
* Docker

---

## 📈 Datasets Used

### Crop Health

* PlantVillage Dataset

### Yield Prediction

* ICRISAT Agricultural Dataset
* Crop Production Statistics of India

### Climate Assessment

* NASA POWER Dataset
* IMD Weather Data

### Financial Assessment

* German Credit Dataset
* Loan Default Prediction Dataset

---

## 🔄 Workflow

1. Farmer uploads crop and farm information.
2. Agronomic Engine performs crop and yield analysis.
3. Climate module evaluates environmental risks.
4. Financial Engine assesses repayment capability.
5. Scores are aggregated into a unified AgriScore.
6. Banks and NBFCs receive risk profiles.
7. Personalized loan recommendations are generated.

---

## 🌟 Key Features

* AI-Based Crop Disease Detection
* Yield Prediction Using Machine Learning
* Climate Risk Assessment
* Farmer Credit Scoring
* Lending Marketplace Integration
* Explainable Risk Analysis
* Scalable Microservice Architecture

---

## 👥 Team

Built for Hackathons, AgriTech Innovation Challenges, and Financial Inclusion Initiatives.

**Project Name:** AgriScore

*"Empowering Farmers with Data. Enabling Lenders with Confidence."*
