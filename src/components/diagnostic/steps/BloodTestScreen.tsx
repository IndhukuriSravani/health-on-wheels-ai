import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplets, TestTube, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { WHO_THRESHOLDS } from '@/types/medical';

interface BloodTestReading {
  value: number;
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

export const BloodTestScreen: React.FC = () => {
  const { currentVisit, updateBloodTest } = useDiagnostic();
  
  const [formData, setFormData] = useState({
    hemoglobin: '',
    bloodSugar: '',
    hdl: '',
    ldl: '',
    totalCholesterol: '',
    triglycerides: ''
  });

  useEffect(() => {
    if (currentVisit?.bloodTest) {
      setFormData({
        hemoglobin: currentVisit.bloodTest.hemoglobin?.toString() || '',
        bloodSugar: currentVisit.bloodTest.bloodSugar?.toString() || '',
        hdl: currentVisit.bloodTest.hdl?.toString() || '',
        ldl: currentVisit.bloodTest.ldl?.toString() || '',
        totalCholesterol: currentVisit.bloodTest.totalCholesterol?.toString() || '',
        triglycerides: currentVisit.bloodTest.triglycerides?.toString() || ''
      });
    }
  }, [currentVisit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (value) {
      updateBloodTest({
        [field]: Number(value)
      });
    }
  };

  const analyzeHemoglobin = (hb: number, gender: string): BloodTestReading => {
    const { hemoglobin } = WHO_THRESHOLDS.bloodTest;
    const threshold = gender === 'Male' ? hemoglobin.male : hemoglobin.female;
    
    if (hb < threshold.low) {
      return { value: hb, status: 'critical', message: 'Anemia detected' };
    } else if (hb < threshold.normal[0]) {
      return { value: hb, status: 'warning', message: 'Low hemoglobin' };
    } else if (hb <= threshold.normal[1]) {
      return { value: hb, status: 'normal', message: 'Normal hemoglobin' };
    } else {
      return { value: hb, status: 'warning', message: 'High hemoglobin' };
    }
  };

  const analyzeBloodSugar = (sugar: number): BloodTestReading => {
    const { bloodSugar } = WHO_THRESHOLDS.bloodTest;
    
    if (sugar >= bloodSugar.diabetic) {
      return { value: sugar, status: 'critical', message: 'Diabetic range' };
    } else if (sugar >= bloodSugar.prediabetic[0]) {
      return { value: sugar, status: 'warning', message: 'Prediabetic range' };
    } else if (sugar >= bloodSugar.normal[0] && sugar <= bloodSugar.normal[1]) {
      return { value: sugar, status: 'normal', message: 'Normal blood sugar' };
    } else {
      return { value: sugar, status: 'warning', message: 'Low blood sugar' };
    }
  };

  const analyzeCholesterol = (hdl: number, ldl: number, total: number, tg: number) => {
    const { cholesterol, triglycerides } = WHO_THRESHOLDS.bloodTest;
    const results = [];

    if (hdl) {
      if (hdl >= cholesterol.hdl.borderline) {
        results.push({ type: 'HDL', value: hdl, status: 'normal', message: 'Good HDL cholesterol' });
      } else if (hdl >= cholesterol.hdl.good) {
        results.push({ type: 'HDL', value: hdl, status: 'warning', message: 'Borderline HDL' });
      } else {
        results.push({ type: 'HDL', value: hdl, status: 'critical', message: 'Low HDL cholesterol' });
      }
    }

    if (ldl) {
      if (ldl >= cholesterol.ldl.high) {
        results.push({ type: 'LDL', value: ldl, status: 'critical', message: 'High LDL cholesterol' });
      } else if (ldl >= cholesterol.ldl.borderline[0]) {
        results.push({ type: 'LDL', value: ldl, status: 'warning', message: 'Borderline high LDL' });
      } else {
        results.push({ type: 'LDL', value: ldl, status: 'normal', message: 'Optimal LDL cholesterol' });
      }
    }

    if (total) {
      if (total >= cholesterol.total.high) {
        results.push({ type: 'Total', value: total, status: 'critical', message: 'High total cholesterol' });
      } else if (total >= cholesterol.total.borderline[0]) {
        results.push({ type: 'Total', value: total, status: 'warning', message: 'Borderline high cholesterol' });
      } else {
        results.push({ type: 'Total', value: total, status: 'normal', message: 'Desirable cholesterol' });
      }
    }

    if (tg) {
      if (tg >= triglycerides.high) {
        results.push({ type: 'Triglycerides', value: tg, status: 'critical', message: 'High triglycerides' });
      } else if (tg >= triglycerides.borderline[0]) {
        results.push({ type: 'Triglycerides', value: tg, status: 'warning', message: 'Borderline high triglycerides' });
      } else {
        results.push({ type: 'Triglycerides', value: tg, status: 'normal', message: 'Normal triglycerides' });
      }
    }

    return results;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-danger" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-success-light text-success-foreground';
      case 'warning': return 'bg-warning-light text-warning-foreground';
      case 'critical': return 'bg-danger-light text-danger-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const hemoglobin = Number(formData.hemoglobin);
  const bloodSugar = Number(formData.bloodSugar);
  const hdl = Number(formData.hdl);
  const ldl = Number(formData.ldl);
  const totalCholesterol = Number(formData.totalCholesterol);
  const triglycerides = Number(formData.triglycerides);

  const gender = currentVisit?.patient?.gender || 'Male';
  const hbAnalysis = hemoglobin ? analyzeHemoglobin(hemoglobin, gender) : null;
  const sugarAnalysis = bloodSugar ? analyzeBloodSugar(bloodSugar) : null;
  const cholesterolAnalysis = analyzeCholesterol(hdl, ldl, totalCholesterol, triglycerides);

  const criticalResults = [hbAnalysis, sugarAnalysis, ...cholesterolAnalysis]
    .filter(result => result?.status === 'critical');

  return (
    <div className="space-y-6">
      {criticalResults.length > 0 && (
        <Alert className="border-danger bg-danger-light">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Critical blood test results detected! Review findings below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hemoglobin */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-danger text-white">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Hemoglobin
            </CardTitle>
            <CardDescription className="text-white/80">
              Blood oxygen carrying capacity (g/dL)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hemoglobin">Hemoglobin Level</Label>
              <Input
                id="hemoglobin"
                type="number"
                step="0.1"
                value={formData.hemoglobin}
                onChange={(e) => handleInputChange('hemoglobin', e.target.value)}
                placeholder="14.5"
              />
            </div>
            
            {hbAnalysis && (
              <div className={`p-3 rounded-lg ${getStatusColor(hbAnalysis.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(hbAnalysis.status)}
                  <span className="font-medium">{hemoglobin} g/dL</span>
                </div>
                <p className="text-sm mt-1">{hbAnalysis.message}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Male: 13.8-17.2 g/dL</p>
              <p>Female: 12.1-15.1 g/dL</p>
            </div>
          </CardContent>
        </Card>

        {/* Blood Sugar */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-warning text-white">
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Blood Sugar
            </CardTitle>
            <CardDescription className="text-white/80">
              Fasting glucose level (mg/dL)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bloodSugar">Glucose Level</Label>
              <Input
                id="bloodSugar"
                type="number"
                value={formData.bloodSugar}
                onChange={(e) => handleInputChange('bloodSugar', e.target.value)}
                placeholder="90"
              />
            </div>
            
            {sugarAnalysis && (
              <div className={`p-3 rounded-lg ${getStatusColor(sugarAnalysis.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(sugarAnalysis.status)}
                  <span className="font-medium">{bloodSugar} mg/dL</span>
                </div>
                <p className="text-sm mt-1">{sugarAnalysis.message}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Normal: 70-100 mg/dL</p>
              <p>Prediabetic: 100-126 mg/dL</p>
              <p>Diabetic: ≥126 mg/dL</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lipid Panel */}
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lipid Panel
          </CardTitle>
          <CardDescription className="text-white/80">
            Cholesterol and triglyceride levels (mg/dL)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hdl">HDL (Good)</Label>
              <Input
                id="hdl"
                type="number"
                value={formData.hdl}
                onChange={(e) => handleInputChange('hdl', e.target.value)}
                placeholder="50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ldl">LDL (Bad)</Label>
              <Input
                id="ldl"
                type="number"
                value={formData.ldl}
                onChange={(e) => handleInputChange('ldl', e.target.value)}
                placeholder="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalCholesterol">Total Cholesterol</Label>
              <Input
                id="totalCholesterol"
                type="number"
                value={formData.totalCholesterol}
                onChange={(e) => handleInputChange('totalCholesterol', e.target.value)}
                placeholder="200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="triglycerides">Triglycerides</Label>
              <Input
                id="triglycerides"
                type="number"
                value={formData.triglycerides}
                onChange={(e) => handleInputChange('triglycerides', e.target.value)}
                placeholder="150"
              />
            </div>
          </div>

          {cholesterolAnalysis.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Lipid Analysis:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cholesterolAnalysis.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getStatusColor(result.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.type}: {result.value} mg/dL</span>
                    </div>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">HDL Cholesterol:</p>
              <p>Good: ≥60 mg/dL</p>
              <p>Low: &lt;40 mg/dL</p>
            </div>
            <div>
              <p className="font-medium">LDL Cholesterol:</p>
              <p>Optimal: &lt;100 mg/dL</p>
              <p>High: ≥160 mg/dL</p>
            </div>
            <div>
              <p className="font-medium">Total Cholesterol:</p>
              <p>Desirable: &lt;200 mg/dL</p>
              <p>High: ≥240 mg/dL</p>
            </div>
            <div>
              <p className="font-medium">Triglycerides:</p>
              <p>Normal: &lt;150 mg/dL</p>
              <p>High: ≥200 mg/dL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WHO Guidelines Reference */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              WHO Laboratory Standards
            </Badge>
            <p className="text-sm text-muted-foreground">
              All blood test reference ranges follow WHO clinical laboratory guidelines and international standards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};