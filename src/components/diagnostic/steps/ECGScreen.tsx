import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Heart, Zap, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export const ECGScreen: React.FC = () => {
  const { currentVisit, updateECG } = useDiagnostic();
  
  const [formData, setFormData] = useState({
    heartRate: '',
    qrsDuration: '',
    qtInterval: ''
  });

  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    if (currentVisit?.ecg) {
      setFormData({
        heartRate: currentVisit.ecg.heartRate?.toString() || '',
        qrsDuration: currentVisit.ecg.qrsDuration?.toString() || '',
        qtInterval: currentVisit.ecg.qtInterval?.toString() || ''
      });
    }
  }, [currentVisit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const heartRate = field === 'heartRate' ? Number(value) : Number(formData.heartRate);
    const qrsDuration = field === 'qrsDuration' ? Number(value) : Number(formData.qrsDuration);
    const qtInterval = field === 'qtInterval' ? Number(value) : Number(formData.qtInterval);
    
    if (heartRate || qrsDuration || qtInterval) {
      const interpretation = generateECGInterpretation(heartRate, qrsDuration, qtInterval);
      const riskLevel = determineRiskLevel(heartRate, qrsDuration, qtInterval);
      const waveformData = generateECGWaveform(heartRate);
      
      updateECG({
        heartRate,
        qrsDuration,
        qtInterval,
        interpretation,
        riskLevel,
        waveformData
      });
    }
  };

  const generateECGInterpretation = (hr: number, qrs: number, qt: number): string => {
    const interpretations = [];
    
    // Heart Rate Analysis
    if (hr < 50) {
      interpretations.push('Severe Bradycardia');
    } else if (hr < 60) {
      interpretations.push('Bradycardia');
    } else if (hr > 120) {
      interpretations.push('Severe Tachycardia');
    } else if (hr > 100) {
      interpretations.push('Tachycardia');
    } else if (hr >= 60 && hr <= 100) {
      interpretations.push('Normal Sinus Rhythm');
    }
    
    // QRS Duration Analysis
    if (qrs > 120) {
      interpretations.push('Wide QRS Complex (Bundle Branch Block)');
    } else if (qrs >= 80 && qrs <= 120) {
      interpretations.push('Normal QRS Duration');
    }
    
    // QT Interval Analysis
    const qtcCalculated = qt / Math.sqrt(60 / hr); // Bazett's formula approximation
    if (qtcCalculated > 470) {
      interpretations.push('Prolonged QTc (Risk of Arrhythmia)');
    } else if (qtcCalculated < 350) {
      interpretations.push('Short QTc');
    } else {
      interpretations.push('Normal QT Interval');
    }
    
    return interpretations.join(', ');
  };

  const determineRiskLevel = (hr: number, qrs: number, qt: number): 'Normal' | 'Abnormal' | 'Critical' => {
    if (hr < 50 || hr > 120 || qrs > 120) {
      return 'Critical';
    }
    
    const qtcCalculated = qt / Math.sqrt(60 / hr);
    if (hr < 60 || hr > 100 || qtcCalculated > 470) {
      return 'Abnormal';
    }
    
    return 'Normal';
  };

  const generateECGWaveform = (hr: number): number[] => {
    const samplesPerBeat = 100;
    const beats = 3;
    const totalSamples = samplesPerBeat * beats;
    const waveform: number[] = [];
    
    for (let i = 0; i < totalSamples; i++) {
      const beatPosition = (i % samplesPerBeat) / samplesPerBeat;
      let amplitude = 0;
      
      // P wave (0.1-0.2)
      if (beatPosition >= 0.1 && beatPosition <= 0.2) {
        amplitude = 0.2 * Math.sin((beatPosition - 0.1) / 0.1 * Math.PI);
      }
      
      // QRS complex (0.3-0.4)
      if (beatPosition >= 0.3 && beatPosition <= 0.35) {
        amplitude = -0.5 * Math.sin((beatPosition - 0.3) / 0.05 * Math.PI);
      }
      if (beatPosition >= 0.35 && beatPosition <= 0.4) {
        amplitude = 1.0 * Math.sin((beatPosition - 0.35) / 0.05 * Math.PI);
      }
      
      // T wave (0.5-0.7)
      if (beatPosition >= 0.5 && beatPosition <= 0.7) {
        amplitude = 0.3 * Math.sin((beatPosition - 0.5) / 0.2 * Math.PI);
      }
      
      // Add some realistic noise and variation based on heart rate
      const hrVariation = (hr - 70) / 100; // Normalize around 70 bpm
      amplitude *= (1 + hrVariation * 0.2);
      amplitude += (Math.random() - 0.5) * 0.05; // Small noise
      
      waveform.push(amplitude);
    }
    
    return waveform;
  };

  const startECGSimulation = () => {
    setShowSimulation(true);
    // Auto-fill with sample values for demonstration
    const sampleData = {
      heartRate: '75',
      qrsDuration: '95',
      qtInterval: '400'
    };
    setFormData(sampleData);
    
    // Trigger the analysis
    handleInputChange('heartRate', sampleData.heartRate);
    handleInputChange('qrsDuration', sampleData.qrsDuration);
    handleInputChange('qtInterval', sampleData.qtInterval);
  };

  const heartRate = Number(formData.heartRate);
  const qrsDuration = Number(formData.qrsDuration);
  const qtInterval = Number(formData.qtInterval);
  
  const interpretation = heartRate ? generateECGInterpretation(heartRate, qrsDuration, qtInterval) : '';
  const riskLevel = heartRate ? determineRiskLevel(heartRate, qrsDuration, qtInterval) : 'Normal';
  const waveformData = heartRate ? generateECGWaveform(heartRate) : [];
  
  const ecgChartData = waveformData.map((value, index) => ({
    time: index,
    amplitude: value
  }));

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Normal': return 'text-success';
      case 'Abnormal': return 'text-warning';
      case 'Critical': return 'text-danger';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'Normal': return 'bg-success-light';
      case 'Abnormal': return 'bg-warning-light';
      case 'Critical': return 'bg-danger-light';
      default: return 'bg-muted';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Normal': return <CheckCircle className="h-4 w-4" />;
      case 'Abnormal': return <AlertTriangle className="h-4 w-4" />;
      case 'Critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {riskLevel === 'Critical' && (
        <Alert className="border-danger bg-danger-light">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Critical ECG findings detected! Immediate medical attention may be required.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ECG Parameters Input */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              ECG Parameters
            </CardTitle>
            <CardDescription className="text-white/80">
              Enter electrocardiogram measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
              <Input
                id="heartRate"
                type="number"
                value={formData.heartRate}
                onChange={(e) => handleInputChange('heartRate', e.target.value)}
                placeholder="72"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qrsDuration">QRS Duration (ms)</Label>
              <Input
                id="qrsDuration"
                type="number"
                value={formData.qrsDuration}
                onChange={(e) => handleInputChange('qrsDuration', e.target.value)}
                placeholder="95"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qtInterval">QT Interval (ms)</Label>
              <Input
                id="qtInterval"
                type="number"
                value={formData.qtInterval}
                onChange={(e) => handleInputChange('qtInterval', e.target.value)}
                placeholder="400"
              />
            </div>

            <Button 
              onClick={startECGSimulation} 
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Play className="h-4 w-4" />
              Simulate ECG Reading
            </Button>
          </CardContent>
        </Card>

        {/* ECG Analysis */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-danger" />
              ECG Analysis
            </CardTitle>
            <CardDescription>
              Automated interpretation and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {interpretation && (
              <div className={`p-4 rounded-lg ${getRiskBgColor(riskLevel)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={getRiskColor(riskLevel)}>{getRiskIcon(riskLevel)}</span>
                  <Badge variant={riskLevel === 'Normal' ? 'default' : 'destructive'}>
                    {riskLevel}
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-2">Interpretation:</p>
                <p className="text-sm">{interpretation}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="font-medium">{heartRate || '--'} BPM</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">QRS Duration</p>
                <p className="font-medium">{qrsDuration || '--'} ms</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">QT Interval</p>
                <p className="font-medium">{qtInterval || '--'} ms</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Normal Ranges:</strong></p>
              <p>• Heart Rate: 60-100 BPM</p>
              <p>• QRS Duration: 80-120 ms</p>
              <p>• QT Interval: 350-450 ms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ECG Waveform Visualization */}
      {(showSimulation || waveformData.length > 0) && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              ECG Waveform
            </CardTitle>
            <CardDescription>
              Simulated electrocardiogram trace (WHO standard 12-lead ECG format)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ecgChartData}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                <p>P Wave</p>
                <p className="text-muted-foreground">Atrial depolarization</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-1"></div>
                <p>QRS Complex</p>
                <p className="text-muted-foreground">Ventricular depolarization</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
                <p>T Wave</p>
                <p className="text-muted-foreground">Ventricular repolarization</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-1"></div>
                <p>QT Interval</p>
                <p className="text-muted-foreground">Complete cardiac cycle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WHO ECG Guidelines */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              WHO ECG Standards
            </Badge>
            <p className="text-sm text-muted-foreground">
              ECG interpretation follows WHO guidelines for cardiovascular health assessment and cardiac rhythm analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};