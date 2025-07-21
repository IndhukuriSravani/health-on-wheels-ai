import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { WHO_THRESHOLDS } from '@/types/medical';

export const BMIScreen: React.FC = () => {
  const { currentVisit, updateBMI } = useDiagnostic();
  
  const [formData, setFormData] = useState({
    height: '',
    weight: ''
  });

  useEffect(() => {
    if (currentVisit?.bmi) {
      setFormData({
        height: currentVisit.bmi.height?.toString() || '',
        weight: currentVisit.bmi.weight?.toString() || ''
      });
    }
  }, [currentVisit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const height = field === 'height' ? Number(value) : Number(formData.height);
    const weight = field === 'weight' ? Number(value) : Number(formData.weight);
    
    if (height && weight) {
      const bmi = calculateBMI(height, weight);
      const category = getBMICategory(bmi);
      
      updateBMI({
        height,
        weight,
        bmi,
        category
      });
    }
  };

  const calculateBMI = (height: number, weight: number): number => {
    // Height in cm, convert to meters
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): 'Underweight' | 'Normal' | 'Overweight' | 'Obese' => {
    const { bmi: thresholds } = WHO_THRESHOLDS;
    
    if (bmi < thresholds.underweight) return 'Underweight';
    if (bmi >= thresholds.normal[0] && bmi < thresholds.normal[1]) return 'Normal';
    if (bmi >= thresholds.overweight[0] && bmi < thresholds.overweight[1]) return 'Overweight';
    return 'Obese';
  };

  const getBMIStatus = (bmi: number) => {
    const category = getBMICategory(bmi);
    
    switch (category) {
      case 'Underweight':
        return {
          status: 'warning',
          color: 'text-warning',
          bgColor: 'bg-warning-light',
          message: 'Below normal weight range',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case 'Normal':
        return {
          status: 'normal',
          color: 'text-success',
          bgColor: 'bg-success-light',
          message: 'Healthy weight range',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'Overweight':
        return {
          status: 'warning',
          color: 'text-warning',
          bgColor: 'bg-warning-light',
          message: 'Above normal weight range',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      case 'Obese':
        return {
          status: 'critical',
          color: 'text-danger',
          bgColor: 'bg-danger-light',
          message: 'Significantly above normal range',
          icon: <AlertTriangle className="h-4 w-4" />
        };
    }
  };

  const getHealthRisks = (category: string) => {
    switch (category) {
      case 'Underweight':
        return [
          'Increased risk of osteoporosis',
          'Weakened immune system',
          'Fertility issues',
          'Delayed wound healing'
        ];
      case 'Normal':
        return [
          'Lowest risk of weight-related diseases',
          'Optimal health benefits',
          'Better life expectancy'
        ];
      case 'Overweight':
        return [
          'Increased risk of heart disease',
          'Higher blood pressure risk',
          'Type 2 diabetes risk',
          'Sleep apnea risk'
        ];
      case 'Obese':
        return [
          'High risk of cardiovascular disease',
          'Increased diabetes risk',
          'Joint problems and arthritis',
          'Increased cancer risk',
          'Respiratory problems'
        ];
      default:
        return [];
    }
  };

  const getRecommendations = (category: string) => {
    switch (category) {
      case 'Underweight':
        return [
          'Increase caloric intake with nutrient-dense foods',
          'Add strength training exercises',
          'Consult with a nutritionist',
          'Rule out underlying medical conditions'
        ];
      case 'Normal':
        return [
          'Maintain current healthy lifestyle',
          'Continue regular physical activity',
          'Follow balanced nutrition',
          'Regular health check-ups'
        ];
      case 'Overweight':
        return [
          'Reduce caloric intake by 500-750 calories/day',
          'Increase physical activity to 150+ minutes/week',
          'Focus on whole foods and vegetables',
          'Monitor portion sizes'
        ];
      case 'Obese':
        return [
          'Consult healthcare provider for weight management plan',
          'Consider structured weight loss program',
          'Gradual lifestyle changes',
          'Regular monitoring and support'
        ];
      default:
        return [];
    }
  };

  const height = Number(formData.height);
  const weight = Number(formData.weight);
  const bmi = height && weight ? calculateBMI(height, weight) : 0;
  const category = bmi ? getBMICategory(bmi) : '';
  const status = bmi ? getBMIStatus(bmi) : null;
  const risks = category ? getHealthRisks(category) : [];
  const recommendations = category ? getRecommendations(category) : [];

  // BMI scale visualization (normalized to 0-100)
  const bmiProgress = Math.min((bmi / 40) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              BMI Calculator
            </CardTitle>
            <CardDescription className="text-white/80">
              Enter height and weight measurements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="170"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="70"
              />
            </div>

            {bmi > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                  <p className="text-3xl font-bold text-foreground">{bmi}</p>
                  <Badge variant={status?.status === 'normal' ? 'default' : 'secondary'} className="mt-2">
                    {category}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BMI Analysis */}
        {status && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                BMI Analysis
              </CardTitle>
              <CardDescription>
                WHO classification and health assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${status.bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={status.color}>{status.icon}</span>
                  <span className="font-medium">{category}</span>
                </div>
                <p className="text-sm">{status.message}</p>
              </div>

              {/* BMI Scale */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>BMI Scale</span>
                  <span>{bmi}</span>
                </div>
                <Progress value={bmiProgress} className="h-2" />
                <div className="grid grid-cols-4 text-xs text-muted-foreground">
                  <span>Under</span>
                  <span>Normal</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* WHO BMI Categories */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>WHO BMI Classification</CardTitle>
          <CardDescription>
            World Health Organization body mass index categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg border-2 ${category === 'Underweight' ? 'border-warning bg-warning-light' : 'border-border'}`}>
              <p className="font-medium text-warning">Underweight</p>
              <p className="text-sm text-muted-foreground">&lt; 18.5</p>
            </div>
            <div className={`p-3 rounded-lg border-2 ${category === 'Normal' ? 'border-success bg-success-light' : 'border-border'}`}>
              <p className="font-medium text-success">Normal Weight</p>
              <p className="text-sm text-muted-foreground">18.5 - 24.9</p>
            </div>
            <div className={`p-3 rounded-lg border-2 ${category === 'Overweight' ? 'border-warning bg-warning-light' : 'border-border'}`}>
              <p className="font-medium text-warning">Overweight</p>
              <p className="text-sm text-muted-foreground">25.0 - 29.9</p>
            </div>
            <div className={`p-3 rounded-lg border-2 ${category === 'Obese' ? 'border-danger bg-danger-light' : 'border-border'}`}>
              <p className="font-medium text-danger">Obese</p>
              <p className="text-sm text-muted-foreground">≥ 30.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Risks and Recommendations */}
      {category && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-danger">Health Risks</CardTitle>
              <CardDescription>
                Potential health implications for {category.toLowerCase()} BMI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-danger mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-success">Recommendations</CardTitle>
              <CardDescription>
                Suggested actions for {category.toLowerCase()} BMI
              </CardDescription>
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
        </div>
      )}

      {/* WHO Guidelines Reference */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              WHO Standards
            </Badge>
            <p className="text-sm text-muted-foreground">
              BMI classifications and health assessments follow World Health Organization guidelines and standards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};