import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Heart, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const commonSymptoms = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Chest Pain',
  'Shortness of Breath', 'Dizziness', 'Abdominal Pain', 'Joint Pain',
  'Back Pain', 'Muscle Aches', 'Sore Throat', 'Runny Nose', 'Vomiting'
];

const familyHistoryOptions = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Cancer', 'Stroke',
  'Asthma', 'Kidney Disease', 'Mental Health Issues', 'Autoimmune Disorders'
];

export const PatientRegistration: React.FC = () => {
  const { currentVisit, updatePatient } = useDiagnostic();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: '',
    patientId: '',
    contactInfo: '',
    address: '',
    geoCode: '',
    symptoms: [] as string[],
    familyHistory: [] as string[],
    consentGiven: false
  });

  useEffect(() => {
    if (currentVisit?.patient) {
      setFormData({
        fullName: currentVisit.patient.fullName || '',
        age: currentVisit.patient.age?.toString() || '',
        gender: currentVisit.patient.gender || '',
        patientId: currentVisit.patient.patientId || '',
        contactInfo: currentVisit.patient.contactInfo || '',
        address: currentVisit.patient.address || '',
        geoCode: currentVisit.patient.geoCode || '',
        symptoms: currentVisit.patient.symptoms || [],
        familyHistory: currentVisit.patient.familyHistory || [],
        consentGiven: currentVisit.patient.consentGiven || false
      });
    }
  }, [currentVisit]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    updatePatient({
      [field]: field === 'age' ? Number(value) : value,
      id: currentVisit?.patient.id || Date.now().toString()
    });
  };

  const toggleSymptom = (symptom: string) => {
    const updatedSymptoms = formData.symptoms.includes(symptom)
      ? formData.symptoms.filter(s => s !== symptom)
      : [...formData.symptoms, symptom];
    
    setFormData(prev => ({ ...prev, symptoms: updatedSymptoms }));
    updatePatient({ symptoms: updatedSymptoms });
  };

  const toggleFamilyHistory = (condition: string) => {
    const updatedHistory = formData.familyHistory.includes(condition)
      ? formData.familyHistory.filter(h => h !== condition)
      : [...formData.familyHistory, condition];
    
    setFormData(prev => ({ ...prev, familyHistory: updatedHistory }));
    updatePatient({ familyHistory: updatedHistory });
  };

  const generatePatientId = () => {
    const id = `PAT-${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({ ...prev, patientId: id }));
    updatePatient({ patientId: id });
    
    toast({
      title: "Patient ID Generated",
      description: `New Patient ID: ${id}`,
    });
  };

  const isFormValid = () => {
    return formData.fullName && 
           formData.age && 
           formData.gender && 
           formData.patientId && 
           formData.contactInfo &&
           formData.consentGiven;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medical">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Registration
          </CardTitle>
          <CardDescription className="text-white/80">
            Enter patient information for diagnostic assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter patient's full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter age"
                min="0"
                max="150"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID *</Label>
              <div className="flex gap-2">
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  placeholder="Patient ID"
                />
                <Button variant="outline" onClick={generatePatientId}>
                  Generate
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                  placeholder="Phone number or email"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="geoCode">Geo Code</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="geoCode"
                  value={formData.geoCode}
                  onChange={(e) => handleInputChange('geoCode', e.target.value)}
                  placeholder="GPS coordinates or area code"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Current Symptoms
          </CardTitle>
          <CardDescription>
            Select all symptoms the patient is experiencing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {commonSymptoms.map((symptom) => (
              <Badge
                key={symptom}
                variant={formData.symptoms.includes(symptom) ? 'default' : 'outline'}
                className="cursor-pointer justify-center p-2 h-auto"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </Badge>
            ))}
          </div>
          {formData.symptoms.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Selected symptoms:</p>
              <div className="flex flex-wrap gap-1">
                {formData.symptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Medical History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-danger" />
            Family Medical History
          </CardTitle>
          <CardDescription>
            Select any conditions that run in the patient's family
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {familyHistoryOptions.map((condition) => (
              <Badge
                key={condition}
                variant={formData.familyHistory.includes(condition) ? 'destructive' : 'outline'}
                className="cursor-pointer justify-center p-2 h-auto"
                onClick={() => toggleFamilyHistory(condition)}
              >
                {condition}
              </Badge>
            ))}
          </div>
          {formData.familyHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Family history:</p>
              <div className="flex flex-wrap gap-1">
                {formData.familyHistory.map((condition) => (
                  <Badge key={condition} variant="destructive">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consentGiven}
              onCheckedChange={(checked) => handleInputChange('consentGiven', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Patient Consent for Treatment and Data Processing *
              </Label>
              <p className="text-xs text-muted-foreground">
                I consent to the medical examination, diagnostic tests, and processing of my health data 
                in accordance with WHO guidelines and NDHM compliance standards.
              </p>
            </div>
          </div>
          
          {!isFormValid() && (
            <div className="mt-4 p-3 bg-warning-light rounded-lg">
              <p className="text-sm text-warning-foreground">
                Please complete all required fields (*) and provide consent to continue.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};