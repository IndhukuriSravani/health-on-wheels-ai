import React, { useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, UserPlus, LogOut, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ECGGraph } from '../ECGGraph';
import { generatePDFReport, generateCSVReport } from '@/utils/pdfGenerator';

export const SummaryScreen: React.FC = () => {
  const { currentVisit, updateHealthSummary, saveVisit, createNewVisit } = useDiagnostic();
  const { toast } = useToast();

  useEffect(() => {
    if (currentVisit && !currentVisit.healthSummary) {
      // Generate AI summary and risk score
      const riskScore = calculateRiskScore();
      const riskLevel = getRiskLevel(riskScore);
      const aiSummary = generateAISummary();
      const recommendations = generateRecommendations();
      const criticalAlerts = generateCriticalAlerts();

      updateHealthSummary({
        overallRiskScore: riskScore,
        riskLevel,
        aiSummary,
        recommendations,
        criticalAlerts
      });
    }
  }, [currentVisit]);

  const calculateRiskScore = (): number => {
    let score = 0;
    if (!currentVisit) return score;

    // Vitals risk factors
    if (currentVisit.vitals) {
      const { systolicBP, diastolicBP, heartRate, temperature, spO2 } = currentVisit.vitals;
      if (systolicBP > 140 || diastolicBP > 90) score += 15;
      if (heartRate < 60 || heartRate > 100) score += 10;
      if (temperature > 38) score += 10;
      if (spO2 < 95) score += 20;
    }

    // Blood test risk factors
    if (currentVisit.bloodTest) {
      const { bloodSugar, hdl, ldl } = currentVisit.bloodTest;
      if (bloodSugar > 126) score += 15;
      if (hdl < 40) score += 10;
      if (ldl > 160) score += 10;
    }

    // BMI risk factors
    if (currentVisit.bmi) {
      if (currentVisit.bmi.category === 'Obese') score += 15;
      if (currentVisit.bmi.category === 'Overweight') score += 8;
    }

    // ECG risk factors
    if (currentVisit.ecg) {
      if (currentVisit.ecg.riskLevel === 'Critical') score += 25;
      if (currentVisit.ecg.riskLevel === 'Abnormal') score += 15;
    }

    return Math.min(score, 100);
  };

  const getRiskLevel = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score < 30) return 'Low';
    if (score < 60) return 'Medium';
    return 'High';
  };

  const generateAISummary = (): string => {
    if (!currentVisit) return '';

    const patientName = currentVisit.patient.fullName;
    const age = currentVisit.patient.age;
    const gender = currentVisit.patient.gender;
    const riskScore = calculateRiskScore();
    const riskLevel = getRiskLevel(riskScore);

    let summary = `Patient ${patientName}, ${age}-year-old ${gender.toLowerCase()}, underwent comprehensive health assessment with overall risk score of ${riskScore}/100 (${riskLevel} risk). `;

    // Add specific findings
    const findings = [];

    if (currentVisit.vitals) {
      const { systolicBP, diastolicBP, heartRate, temperature, spO2 } = currentVisit.vitals;
      if (systolicBP > 140 || diastolicBP > 90) {
        findings.push('elevated blood pressure requiring monitoring');
      } else if (systolicBP < 90) {
        findings.push('low blood pressure noted');
      } else {
        findings.push('blood pressure within normal limits');
      }

      if (heartRate < 60) {
        findings.push('bradycardia observed');
      } else if (heartRate > 100) {
        findings.push('tachycardia detected');
      } else {
        findings.push('heart rate normal');
      }

      if (spO2 < 95) {
        findings.push('oxygen saturation below optimal levels');
      }
    }

    if (currentVisit.bloodTest) {
      const { bloodSugar, hdl, ldl, hemoglobin } = currentVisit.bloodTest;
      if (bloodSugar > 126) {
        findings.push('elevated glucose levels suggesting diabetes monitoring needed');
      } else if (bloodSugar < 70) {
        findings.push('low glucose levels detected');
      }

      if (hdl < 40) {
        findings.push('low HDL cholesterol');
      }
      if (ldl > 160) {
        findings.push('elevated LDL cholesterol');
      }
      if (hemoglobin < 12) {
        findings.push('anemia indicators present');
      }
    }

    if (currentVisit.bmi) {
      if (currentVisit.bmi.category === 'Obese') {
        findings.push('obesity requiring weight management intervention');
      } else if (currentVisit.bmi.category === 'Overweight') {
        findings.push('overweight status with lifestyle modification recommendations');
      } else if (currentVisit.bmi.category === 'Underweight') {
        findings.push('underweight status requiring nutritional assessment');
      }
    }

    if (currentVisit.ecg) {
      if (currentVisit.ecg.riskLevel === 'Critical') {
        findings.push('critical ECG abnormalities requiring immediate cardiology consultation');
      } else if (currentVisit.ecg.riskLevel === 'Abnormal') {
        findings.push('ECG abnormalities noted for follow-up');
      } else {
        findings.push('ECG within normal parameters');
      }
    }

    if (findings.length > 0) {
      summary += `Key findings include: ${findings.join(', ')}. `;
    }

    summary += `Recommend regular monitoring and adherence to prescribed interventions. Follow-up assessment scheduled based on risk level and clinical presentation.`;

    return summary;
  };

  const generateRecommendations = (): string[] => {
    const recommendations = [];
    if (!currentVisit) return recommendations;

    if (currentVisit.vitals?.systolicBP && currentVisit.vitals.systolicBP > 130) {
      recommendations.push('Monitor blood pressure regularly');
    }
    if (currentVisit.bmi?.category === 'Overweight' || currentVisit.bmi?.category === 'Obese') {
      recommendations.push('Implement weight management program');
    }
    if (currentVisit.bloodTest?.bloodSugar && currentVisit.bloodTest.bloodSugar > 100) {
      recommendations.push('Follow up on glucose levels');
    }

    return recommendations;
  };

  const generateCriticalAlerts = (): string[] => {
    const alerts = [];
    if (!currentVisit) return alerts;

    if (currentVisit.vitals?.systolicBP && currentVisit.vitals.systolicBP > 180) {
      alerts.push('Hypertensive crisis - immediate attention required');
    }
    if (currentVisit.ecg?.riskLevel === 'Critical') {
      alerts.push('Critical ECG findings detected');
    }

    return alerts;
  };

  const handleDownloadPDF = async () => {
    if (!currentVisit) return;
    
    try {
      await generatePDFReport(currentVisit);
      toast({
        title: "PDF Report Generated",
        description: "Comprehensive health report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCSV = () => {
    if (!currentVisit) return;
    
    try {
      generateCSVReport(currentVisit);
      toast({
        title: "CSV Report Generated",
        description: "Health data exported to CSV format successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate CSV report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddAnotherPatient = () => {
    saveVisit();
    createNewVisit();
    toast({
      title: "New Assessment Started",
      description: "Ready for next patient registration.",
    });
  };

  if (!currentVisit?.healthSummary) {
    return <div className="text-center py-12">Generating health summary...</div>;
  }

  const { overallRiskScore, riskLevel, aiSummary, recommendations, criticalAlerts } = currentVisit.healthSummary;

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <Card className="border-danger bg-danger-light">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <h3 className="font-semibold text-danger">Critical Alerts</h3>
            </div>
            <ul className="space-y-1">
              {criticalAlerts.map((alert, index) => (
                <li key={index} className="text-sm">{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Risk Score */}
      <Card className="shadow-medical">
        <CardHeader className="text-center">
          <CardTitle>Overall Health Risk Assessment</CardTitle>
          <CardDescription>AI-powered comprehensive health analysis</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="relative">
            <div className="text-6xl font-bold text-primary">{overallRiskScore}</div>
            <div className="text-lg text-muted-foreground">/ 100</div>
          </div>
          <Badge variant={riskLevel === 'Low' ? 'default' : riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
            {riskLevel} Risk
          </Badge>
          <Progress value={overallRiskScore} className="h-4" />
        </CardContent>
      </Card>

      {/* AI Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            AI Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{aiSummary}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ECG Display */}
      {currentVisit?.ecg && (
        <ECGGraph ecgData={currentVisit.ecg} height={350} />
      )}

      {/* Action Buttons */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={handleDownloadCSV} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV Data
            </Button>
            <Button variant="outline" onClick={handleAddAnotherPatient} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Another Patient
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Exit Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};