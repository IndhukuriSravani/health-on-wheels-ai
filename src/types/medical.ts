export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  patientId: string;
  contactInfo: string;
  address: string;
  geoCode: string;
  familyHistory: string[];
  symptoms: string[];
  consentGiven: boolean;
  createdAt: Date;
}

export interface Vitals {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  spO2: number;
  timestamp: Date;
}

export interface BloodTest {
  hemoglobin: number;
  bloodSugar: number;
  hdl: number;
  ldl: number;
  totalCholesterol: number;
  triglycerides: number;
  timestamp: Date;
}

export interface BMIData {
  height: number; // in cm
  weight: number; // in kg
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  timestamp: Date;
}

export interface ECGData {
  heartRate: number;
  qrsDuration: number;
  qtInterval: number;
  interpretation: string;
  riskLevel: 'Normal' | 'Abnormal' | 'Critical';
  waveformData: number[];
  timestamp: Date;
}

export interface UltrasoundData {
  imageUrl: string;
  observations: string;
  timestamp: Date;
}

export interface HealthSummary {
  overallRiskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  aiSummary: string;
  recommendations: string[];
  criticalAlerts: string[];
  timestamp: Date;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  patient: Patient;
  vitals?: Vitals;
  bloodTest?: BloodTest;
  bmi?: BMIData;
  ecg?: ECGData;
  ultrasound?: UltrasoundData;
  healthSummary?: HealthSummary;
  status: 'In Progress' | 'Completed' | 'Draft';
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Doctor' | 'Admin' | 'Patient';
  department?: string;
  licenseNumber?: string;
  createdAt: Date;
}

export interface WHOThresholds {
  vitals: {
    systolicBP: { normal: [number, number]; high: [number, number] };
    diastolicBP: { normal: [number, number]; high: [number, number] };
    heartRate: { normal: [number, number]; low: number; high: number };
    temperature: { normal: [number, number]; fever: number };
    spO2: { normal: number; low: number };
  };
  bloodTest: {
    hemoglobin: { 
      male: { normal: [number, number]; low: number };
      female: { normal: [number, number]; low: number };
    };
    bloodSugar: { normal: [number, number]; prediabetic: [number, number]; diabetic: number };
    cholesterol: {
      hdl: { good: number; borderline: number };
      ldl: { optimal: number; borderline: [number, number]; high: number };
      total: { desirable: number; borderline: [number, number]; high: number };
    };
    triglycerides: { normal: number; borderline: [number, number]; high: number };
  };
  bmi: {
    underweight: number;
    normal: [number, number];
    overweight: [number, number];
    obese: number;
  };
}

export const WHO_THRESHOLDS: WHOThresholds = {
  vitals: {
    systolicBP: { normal: [90, 120], high: [140, 180] },
    diastolicBP: { normal: [60, 80], high: [90, 110] },
    heartRate: { normal: [60, 100], low: 60, high: 100 },
    temperature: { normal: [36.1, 37.2], fever: 38.0 },
    spO2: { normal: 95, low: 90 }
  },
  bloodTest: {
    hemoglobin: {
      male: { normal: [13.8, 17.2], low: 13.8 },
      female: { normal: [12.1, 15.1], low: 12.1 }
    },
    bloodSugar: { normal: [70, 100], prediabetic: [100, 126], diabetic: 126 },
    cholesterol: {
      hdl: { good: 40, borderline: 60 },
      ldl: { optimal: 100, borderline: [100, 130], high: 160 },
      total: { desirable: 200, borderline: [200, 240], high: 240 }
    },
    triglycerides: { normal: 150, borderline: [150, 200], high: 200 }
  },
  bmi: {
    underweight: 18.5,
    normal: [18.5, 25],
    overweight: [25, 30],
    obese: 30
  }
};