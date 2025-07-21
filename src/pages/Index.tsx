import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DiagnosticWizard } from '@/components/diagnostic/DiagnosticWizard';
import { useDiagnostic } from '@/context/DiagnosticContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, FileText, Activity, Users, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { currentVisit, createNewVisit, getAllVisits } = useDiagnostic();
  const [showDashboard, setShowDashboard] = useState(!currentVisit);
  
  const allVisits = getAllVisits();
  const todayVisits = allVisits.filter(v => 
    new Date(v.createdAt).toDateString() === new Date().toDateString()
  );

  const handleStartNewAssessment = () => {
    createNewVisit();
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Healthcare on Wheels - AI Diagnostic System" />
      
      <main className="container mx-auto p-6">
        {showDashboard ? (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="shadow-medical">
              <CardHeader className="bg-gradient-primary text-white">
                <CardTitle className="text-2xl">
                  Welcome, {user?.name}
                </CardTitle>
                <CardDescription className="text-white/80">
                  AI-Powered Diagnostic System - WHO Compliant Healthcare Assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{allVisits.length}</div>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">{todayVisits.length}</div>
                    <p className="text-sm text-muted-foreground">Today's Visits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-warning">
                      {allVisits.filter(v => v.healthSummary?.riskLevel === 'High').length}
                    </div>
                    <p className="text-sm text-muted-foreground">High Risk Cases</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-healthcare-teal">7</div>
                    <p className="text-sm text-muted-foreground">Assessment Steps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-card hover:shadow-medical transition-shadow cursor-pointer" onClick={handleStartNewAssessment}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-lg">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">New Patient Assessment</h3>
                      <p className="text-sm text-muted-foreground">Start comprehensive diagnostic workflow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-success p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Recent Reports</h3>
                      <p className="text-sm text-muted-foreground">View and download PDF reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-healthcare-teal p-3 rounded-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">WHO Standards</h3>
                      <p className="text-sm text-muted-foreground">Compliant diagnostic protocols</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Overview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Complete Diagnostic Suite</CardTitle>
                <CardDescription>7-step WHO-compliant assessment process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { icon: '👤', title: 'Patient Registration', desc: 'Demographics & consent' },
                    { icon: '❤️', title: 'Vital Signs', desc: 'BP, HR, Temp, SpO₂' },
                    { icon: '🩸', title: 'Blood Tests', desc: 'HB, Glucose, Lipids' },
                    { icon: '⚖️', title: 'BMI Assessment', desc: 'WHO weight categories' },
                    { icon: '📈', title: 'ECG Analysis', desc: 'Cardiac rhythm analysis' },
                    { icon: '🔬', title: 'Ultrasound', desc: 'Medical imaging' },
                    { icon: '📋', title: 'AI Summary', desc: 'Risk scoring & PDF' }
                  ].map((step, index) => (
                    <div key={index} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl mb-2">{step.icon}</div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <DiagnosticWizard />
        )}
      </main>
    </div>
  );
};

export default Index;
