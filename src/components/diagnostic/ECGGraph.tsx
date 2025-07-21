import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ECGData } from '@/types/medical';

interface ECGGraphProps {
  ecgData: ECGData;
  width?: number;
  height?: number;
  showGrid?: boolean;
}

export const ECGGraph: React.FC<ECGGraphProps> = ({ 
  ecgData, 
  width = 800, 
  height = 300, 
  showGrid = true 
}) => {
  // Generate ECG waveform data based on input parameters
  const generateECGWaveform = () => {
    const data = [];
    const duration = 3; // 3 seconds
    const samplingRate = 250; // 250 Hz
    const totalSamples = duration * samplingRate;
    
    // Calculate heart rate cycles
    const cyclesPerSecond = ecgData.heartRate / 60;
    const samplesPerCycle = samplingRate / cyclesPerSecond;
    
    for (let i = 0; i < totalSamples; i++) {
      const time = (i / samplingRate) * 1000; // Convert to milliseconds
      const cyclePosition = (i % samplesPerCycle) / samplesPerCycle;
      
      let amplitude = 0;
      
      // P wave (0.08-0.12 of cycle)
      if (cyclePosition >= 0.08 && cyclePosition <= 0.12) {
        const pPhase = (cyclePosition - 0.08) / 0.04;
        amplitude = 0.2 * Math.sin(pPhase * Math.PI);
      }
      
      // QRS complex (0.15-0.25 of cycle)
      else if (cyclePosition >= 0.15 && cyclePosition <= 0.25) {
        const qrsPhase = (cyclePosition - 0.15) / 0.1;
        if (qrsPhase < 0.3) {
          // Q wave
          amplitude = -0.3 * Math.sin(qrsPhase * Math.PI / 0.3);
        } else if (qrsPhase < 0.7) {
          // R wave
          amplitude = 1.2 * Math.sin((qrsPhase - 0.3) * Math.PI / 0.4);
        } else {
          // S wave
          amplitude = -0.4 * Math.sin((qrsPhase - 0.7) * Math.PI / 0.3);
        }
      }
      
      // T wave (0.35-0.55 of cycle)
      else if (cyclePosition >= 0.35 && cyclePosition <= 0.55) {
        const tPhase = (cyclePosition - 0.35) / 0.2;
        amplitude = 0.4 * Math.sin(tPhase * Math.PI);
      }
      
      // Add some baseline noise
      amplitude += (Math.random() - 0.5) * 0.02;
      
      // Adjust for abnormal conditions
      if (ecgData.riskLevel === 'Critical') {
        amplitude *= 1.3; // Increased amplitude for critical conditions
        if (Math.random() < 0.1) amplitude += (Math.random() - 0.5) * 0.3; // Irregular spikes
      } else if (ecgData.riskLevel === 'Abnormal') {
        if (Math.random() < 0.05) amplitude += (Math.random() - 0.5) * 0.2; // Slight irregularities
      }
      
      data.push({
        time: Math.round(time),
        amplitude: Number(amplitude.toFixed(3))
      });
    }
    
    return data;
  };

  const waveformData = generateECGWaveform();

  const getLineColor = () => {
    switch (ecgData.riskLevel) {
      case 'Critical': return '#dc2626'; // red-600
      case 'Abnormal': return '#f59e0b'; // amber-500
      default: return '#059669'; // emerald-600
    }
  };

  return (
    <div className="ecg-graph-container bg-card p-4 rounded-lg border shadow-medical">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">ECG Waveform</h3>
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4 mt-2">
          <div>Heart Rate: {ecgData.heartRate} bpm</div>
          <div>QRS Duration: {ecgData.qrsDuration} ms</div>
          <div>QT Interval: {ecgData.qtInterval} ms</div>
          <div>Risk Level: <span className={`font-medium ${
            ecgData.riskLevel === 'Critical' ? 'text-danger' :
            ecgData.riskLevel === 'Abnormal' ? 'text-warning' : 'text-success'
          }`}>{ecgData.riskLevel}</span></div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={waveformData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && (
              <CartesianGrid strokeDasharray="1 1" stroke="hsl(var(--muted))" strokeWidth={0.5} />
            )}
            <XAxis 
              dataKey="time" 
              type="number"
              scale="linear"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[-0.8, 1.5]}
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="amplitude" 
              stroke={getLineColor()}
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium text-foreground">{ecgData.interpretation}</p>
      </div>
    </div>
  );
};