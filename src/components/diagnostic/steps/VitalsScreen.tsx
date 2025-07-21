import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Thermometer, Activity, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import { WHO_THRESHOLDS } from '@/types/medical';

interface VitalReading {
  value: number;
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

export const VitalsScreen: React.FC = () => {
  const { currentVisit, updateVitals } = useDiagnostic();
  
  const [formData, setFormData] = useState({
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    temperature: '',
    spO2: ''
  });

  useEffect(() => {
    if (currentVisit?.vitals) {
      setFormData({
        systolicBP: currentVisit.vitals.systolicBP?.toString() || '',
        diastolicBP: currentVisit.vitals.diastolicBP?.toString() || '',
        heartRate: currentVisit.vitals.heartRate?.toString() || '',
        temperature: currentVisit.vitals.temperature?.toString() || '',
        spO2: currentVisit.vitals.spO2?.toString() || ''
      });
    }
  }, [currentVisit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (value) {
      updateVitals({
        [field]: Number(value)
      });
    }
  };

  const analyzeBP = (systolic: number, diastolic: number): VitalReading => {
    const { systolicBP, diastolicBP } = WHO_THRESHOLDS.vitals;
    
    if (systolic >= 180 || diastolic >= 110) {
      return { value: systolic, status: 'critical', message: 'Hypertensive Crisis - Immediate attention required' };
    } else if (systolic >= systolicBP.high[0] || diastolic >= diastolicBP.high[0]) {
      return { value: systolic, status: 'warning', message: 'High Blood Pressure (Stage 2)' };
    } else if (systolic >= 130 || diastolic >= 80) {
      return { value: systolic, status: 'warning', message: 'High Blood Pressure (Stage 1)' };
    } else if (systolic >= systolicBP.normal[0] && diastolic >= diastolicBP.normal[0]) {
      return { value: systolic, status: 'normal', message: 'Normal Blood Pressure' };
    } else {
      return { value: systolic, status: 'warning', message: 'Low Blood Pressure' };
    }
  };

  const analyzeHeartRate = (hr: number): VitalReading => {
    const { heartRate } = WHO_THRESHOLDS.vitals;
    
    if (hr < 50) {
      return { value: hr, status: 'critical', message: 'Severe Bradycardia' };
    } else if (hr < heartRate.low) {
      return { value: hr, status: 'warning', message: 'Bradycardia' };
    } else if (hr > 120) {
      return { value: hr, status: 'critical', message: 'Severe Tachycardia' };
    } else if (hr > heartRate.high) {
      return { value: hr, status: 'warning', message: 'Tachycardia' };
    } else {
      return { value: hr, status: 'normal', message: 'Normal Heart Rate' };
    }
  };

  const analyzeTemperature = (temp: number): VitalReading => {
    const { temperature } = WHO_THRESHOLDS.vitals;
    
    if (temp >= 39.0) {
      return { value: temp, status: 'critical', message: 'High Fever' };
    } else if (temp >= temperature.fever) {
      return { value: temp, status: 'warning', message: 'Fever' };
    } else if (temp >= temperature.normal[0] && temp <= temperature.normal[1]) {
      return { value: temp, status: 'normal', message: 'Normal Temperature' };
    } else {
      return { value: temp, status: 'warning', message: 'Low Temperature' };
    }
  };

  const analyzeSpO2 = (spo2: number): VitalReading => {
    const { spO2: threshold } = WHO_THRESHOLDS.vitals;
    
    if (spo2 < 90) {
      return { value: spo2, status: 'critical', message: 'Severe Hypoxemia' };
    } else if (spo2 < threshold.normal) {
      return { value: spo2, status: 'warning', message: 'Mild Hypoxemia' };
    } else {
      return { value: spo2, status: 'normal', message: 'Normal Oxygen Saturation' };
    }
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

  const systolic = Number(formData.systolicBP);
  const diastolic = Number(formData.diastolicBP);
  const heartRate = Number(formData.heartRate);
  const temperature = Number(formData.temperature);
  const spO2 = Number(formData.spO2);

  const bpAnalysis = systolic && diastolic ? analyzeBP(systolic, diastolic) : null;
  const hrAnalysis = heartRate ? analyzeHeartRate(heartRate) : null;
  const tempAnalysis = temperature ? analyzeTemperature(temperature) : null;
  const spO2Analysis = spO2 ? analyzeSpO2(spO2) : null;

  const criticalAlerts = [bpAnalysis, hrAnalysis, tempAnalysis, spO2Analysis]
    .filter(analysis => analysis?.status === 'critical');

  return (
    <div className="space-y-6">
      {criticalAlerts.length > 0 && (
        <Alert className="border-danger bg-danger-light">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Critical vitals detected! {criticalAlerts.map(alert => alert.message).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-danger text-white">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Blood Pressure
            </CardTitle>
            <CardDescription className="text-white/80">
              Systolic/Diastolic (mmHg)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic</Label>
                <Input
                  id="systolic"
                  type="number"
                  value={formData.systolicBP}
                  onChange={(e) => handleInputChange('systolicBP', e.target.value)}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic</Label>
                <Input
                  id="diastolic"
                  type="number"
                  value={formData.diastolicBP}
                  onChange={(e) => handleInputChange('diastolicBP', e.target.value)}
                  placeholder="80"
                />
              </div>
            </div>
            
            {bpAnalysis && (
              <div className={`p-3 rounded-lg ${getStatusColor(bpAnalysis.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(bpAnalysis.status)}
                  <span className="font-medium">{systolic}/{diastolic} mmHg</span>
                </div>
                <p className="text-sm mt-1">{bpAnalysis.message}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Normal: 90-120 / 60-80 mmHg</p>
              <p>High: ≥140 / ≥90 mmHg</p>
            </div>
          </CardContent>
        </Card>

        {/* Heart Rate */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Heart Rate
            </CardTitle>
            <CardDescription className="text-white/80">
              Beats per minute (BPM)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate</Label>
              <Input
                id="heartRate"
                type="number"
                value={formData.heartRate}
                onChange={(e) => handleInputChange('heartRate', e.target.value)}
                placeholder="72"
              />
            </div>
            
            {hrAnalysis && (
              <div className={`p-3 rounded-lg ${getStatusColor(hrAnalysis.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(hrAnalysis.status)}
                  <span className="font-medium">{heartRate} BPM</span>
                </div>
                <p className="text-sm mt-1">{hrAnalysis.message}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Normal: 60-100 BPM</p>
              <p>Bradycardia: &lt;60 BPM</p>
              <p>Tachycardia: &gt;100 BPM</p>
            </div>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-warning text-white">
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Body Temperature
            </CardTitle>
            <CardDescription className="text-white/80">
              Celsius (°C)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="37.0"
              />
            </div>
            
            {tempAnalysis && (
              <div className={`p-3 rounded-lg ${getStatusColor(tempAnalysis.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(tempAnalysis.status)}
                  <span className="font-medium">{temperature}°C</span>
                </div>
                <p className="text-sm mt-1">{tempAnalysis.message}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Normal: 36.1-37.2°C</p>
              <p>Fever: ≥38.0°C</p>
              <p>High Fever: ≥39.0°C</p>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-success text-white">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Oxygen Saturation
            </CardTitle>
            <CardDescription className="text-white/80">
              SpO₂ (%)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spO2">SpO₂</Label>
              <Input
                id="spO2"
                type="number"
                value={formData.spO2}
                onChange={(e) => handleInputChange('spO2', e.target.value)}
                placeholder="98"
                min="0"
                max="100"
              />
            </div>
            
            {spO2Analysis && (
              <div className={`p-3 rounded-lg ${getStatusColor(spO2Analysis.status)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(spO2Analysis.status)}
                  <span className="font-medium">{spO2}%</span>
                </div>
                <p className="text-sm mt-1">{spO2Analysis.message}</p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>Normal: ≥95%</p>
              <p>Mild Hypoxemia: 90-94%</p>
              <p>Severe Hypoxemia: &lt;90%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WHO Guidelines Reference */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              WHO Compliant
            </Badge>
            <p className="text-sm text-muted-foreground">
              All vital sign thresholds follow World Health Organization (WHO) clinical guidelines and standards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};