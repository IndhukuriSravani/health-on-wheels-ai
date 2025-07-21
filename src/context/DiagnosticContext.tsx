import React, { createContext, useContext, useState, useEffect } from 'react';
import { Visit, Patient, Vitals, BloodTest, BMIData, ECGData, UltrasoundData, HealthSummary } from '@/types/medical';
import { useAuth } from './AuthContext';

interface DiagnosticContextType {
  currentVisit: Visit | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updatePatient: (patient: Partial<Patient>) => void;
  updateVitals: (vitals: Partial<Vitals>) => void;
  updateBloodTest: (bloodTest: Partial<BloodTest>) => void;
  updateBMI: (bmi: Partial<BMIData>) => void;
  updateECG: (ecg: Partial<ECGData>) => void;
  updateUltrasound: (ultrasound: Partial<UltrasoundData>) => void;
  updateHealthSummary: (summary: Partial<HealthSummary>) => void;
  saveVisit: () => void;
  createNewVisit: () => void;
  loadVisit: (visitId: string) => void;
  getAllVisits: () => Visit[];
  isLoading: boolean;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (context === undefined) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};

interface DiagnosticProviderProps {
  children: React.ReactNode;
}

export const DiagnosticProvider: React.FC<DiagnosticProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved visits from localStorage
  const getAllVisits = (): Visit[] => {
    const saved = localStorage.getItem('healthcare_visits');
    return saved ? JSON.parse(saved) : [];
  };

  const saveToStorage = (visits: Visit[]) => {
    localStorage.setItem('healthcare_visits', JSON.stringify(visits));
  };

  const createNewVisit = () => {
    if (!user) return;
    
    const newVisit: Visit = {
      id: Date.now().toString(),
      patientId: '',
      doctorId: user.id,
      patient: {
        id: '',
        fullName: '',
        age: 0,
        gender: 'Male',
        patientId: '',
        contactInfo: '',
        address: '',
        geoCode: '',
        familyHistory: [],
        symptoms: [],
        consentGiven: false,
        createdAt: new Date()
      },
      status: 'In Progress',
      currentStep: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentVisit(newVisit);
    setCurrentStep(1);
  };

  const updatePatient = (patientUpdate: Partial<Patient>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      patient: { ...prev.patient, ...patientUpdate },
      updatedAt: new Date()
    } : null);
  };

  const updateVitals = (vitalsUpdate: Partial<Vitals>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      vitals: { ...prev.vitals, ...vitalsUpdate, timestamp: new Date() } as Vitals,
      updatedAt: new Date()
    } : null);
  };

  const updateBloodTest = (bloodTestUpdate: Partial<BloodTest>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      bloodTest: { ...prev.bloodTest, ...bloodTestUpdate, timestamp: new Date() } as BloodTest,
      updatedAt: new Date()
    } : null);
  };

  const updateBMI = (bmiUpdate: Partial<BMIData>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      bmi: { ...prev.bmi, ...bmiUpdate, timestamp: new Date() } as BMIData,
      updatedAt: new Date()
    } : null);
  };

  const updateECG = (ecgUpdate: Partial<ECGData>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      ecg: { ...prev.ecg, ...ecgUpdate, timestamp: new Date() } as ECGData,
      updatedAt: new Date()
    } : null);
  };

  const updateUltrasound = (ultrasoundUpdate: Partial<UltrasoundData>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      ultrasound: { ...prev.ultrasound, ...ultrasoundUpdate, timestamp: new Date() } as UltrasoundData,
      updatedAt: new Date()
    } : null);
  };

  const updateHealthSummary = (summaryUpdate: Partial<HealthSummary>) => {
    if (!currentVisit) return;
    
    setCurrentVisit(prev => prev ? {
      ...prev,
      healthSummary: { ...prev.healthSummary, ...summaryUpdate, timestamp: new Date() } as HealthSummary,
      updatedAt: new Date()
    } : null);
  };

  const saveVisit = () => {
    if (!currentVisit) return;
    
    setIsLoading(true);
    
    const allVisits = getAllVisits();
    const existingIndex = allVisits.findIndex(v => v.id === currentVisit.id);
    
    if (existingIndex >= 0) {
      allVisits[existingIndex] = { ...currentVisit, updatedAt: new Date() };
    } else {
      allVisits.push({ ...currentVisit, updatedAt: new Date() });
    }
    
    saveToStorage(allVisits);
    setIsLoading(false);
  };

  const loadVisit = (visitId: string) => {
    const allVisits = getAllVisits();
    const visit = allVisits.find(v => v.id === visitId);
    
    if (visit) {
      setCurrentVisit(visit);
      setCurrentStep(visit.currentStep);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (currentVisit) {
      const updated = { ...currentVisit, currentStep };
      setCurrentVisit(updated);
      
      // Auto-save every 30 seconds
      const autoSaveInterval = setInterval(() => {
        if (currentVisit) {
          saveVisit();
        }
      }, 30000);
      
      return () => clearInterval(autoSaveInterval);
    }
  }, [currentStep]);

  const value: DiagnosticContextType = {
    currentVisit,
    currentStep,
    setCurrentStep,
    updatePatient,
    updateVitals,
    updateBloodTest,
    updateBMI,
    updateECG,
    updateUltrasound,
    updateHealthSummary,
    saveVisit,
    createNewVisit,
    loadVisit,
    getAllVisits,
    isLoading
  };

  return (
    <DiagnosticContext.Provider value={value}>
      {children}
    </DiagnosticContext.Provider>
  );
};