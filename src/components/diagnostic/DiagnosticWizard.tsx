import React from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { PatientRegistration } from './steps/PatientRegistration';
import { VitalsScreen } from './steps/VitalsScreen';
import { BloodTestScreen } from './steps/BloodTestScreen';
import { BMIScreen } from './steps/BMIScreen';
import { ECGScreen } from './steps/ECGScreen';
import { UltrasoundScreen } from './steps/UltrasoundScreen';
import { SummaryScreen } from './steps/SummaryScreen';
import { useToast } from '@/hooks/use-toast';

const TOTAL_STEPS = 7;

const stepTitles = [
  'Patient Registration',
  'Vital Signs',
  'Blood Tests',
  'BMI Assessment',
  'ECG Analysis', 
  'Ultrasound',
  'Health Summary'
];

const stepIcons = ['👤', '❤️', '🩸', '⚖️', '📈', '🔬', '📋'];

export const DiagnosticWizard: React.FC = () => {
  const { currentStep, setCurrentStep, saveVisit, currentVisit } = useDiagnostic();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      saveVisit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    saveVisit();
    toast({
      title: "Progress Saved",
      description: "Your diagnostic data has been saved successfully.",
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <PatientRegistration />;
      case 2: return <VitalsScreen />;
      case 3: return <BloodTestScreen />;
      case 4: return <BMIScreen />;
      case 5: return <ECGScreen />;
      case 6: return <UltrasoundScreen />;
      case 7: return <SummaryScreen />;
      default: return <PatientRegistration />;
    }
  };

  if (!currentVisit) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No active diagnostic session. Please start a new patient assessment.</p>
      </div>
    );
  }

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card className="shadow-medical">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {stepIcons[currentStep - 1]} {stepTitles[currentStep - 1]}
              </h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex justify-between text-xs">
              {stepTitles.map((title, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center space-y-1 ${
                    index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index + 1 === currentStep ? 'bg-primary text-primary-foreground' :
                    index + 1 < currentStep ? 'bg-success text-success-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1 < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="hidden md:block">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <div className="min-h-[500px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation Controls */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Progress
              </Button>

              {currentStep < TOTAL_STEPS && (
                <Button 
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};