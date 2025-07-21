import React, { useState, useEffect } from 'react';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, FileImage } from 'lucide-react';

export const UltrasoundScreen: React.FC = () => {
  const { currentVisit, updateUltrasound } = useDiagnostic();
  
  const [formData, setFormData] = useState({
    observations: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (currentVisit?.ultrasound) {
      setFormData({
        observations: currentVisit.ultrasound.observations || '',
        imageUrl: currentVisit.ultrasound.imageUrl || ''
      });
    }
  }, [currentVisit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    updateUltrasound({ [field]: value });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl }));
      updateUltrasound({ imageUrl });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Ultrasound Imaging
          </CardTitle>
          <CardDescription className="text-white/80">
            Upload ultrasound images and add clinical observations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="ultrasound-upload">Upload Ultrasound Image</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {formData.imageUrl ? (
                <div className="space-y-4">
                  <img 
                    src={formData.imageUrl} 
                    alt="Ultrasound" 
                    className="max-w-full h-64 mx-auto object-contain rounded-lg"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('ultrasound-upload')?.click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button onClick={() => document.getElementById('ultrasound-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Support for DICOM, JPG, PNG formats
                    </p>
                  </div>
                </div>
              )}
              <Input
                id="ultrasound-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Clinical Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Enter detailed observations about the ultrasound findings..."
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              Medical Imaging Standards
            </Badge>
            <p className="text-sm text-muted-foreground">
              Ultrasound imaging follows WHO diagnostic imaging guidelines and clinical best practices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};