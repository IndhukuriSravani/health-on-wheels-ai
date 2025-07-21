import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Visit } from '@/types/medical';

export const generatePDFReport = async (visit: Visit): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(0, 102, 204);
  pdf.text('🏥 Healthcare Diagnostic Report', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Patient Information
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Patient Information', 20, currentY);
  currentY += 10;

  pdf.setFontSize(10);
  const patientInfo = [
    `Name: ${visit.patient.fullName}`,
    `Age: ${visit.patient.age} years`,
    `Gender: ${visit.patient.gender}`,
    `Patient ID: ${visit.patient.patientId}`,
    `Contact: ${visit.patient.contactInfo}`,
    `Address: ${visit.patient.address}`,
    `Date: ${new Date(visit.createdAt).toLocaleDateString()}`
  ];

  patientInfo.forEach((info, index) => {
    pdf.text(info, 20, currentY + (index * 5));
  });
  currentY += 40;

  // Health Summary
  if (visit.healthSummary) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 204);
    pdf.text('Health Summary', 20, currentY);
    currentY += 10;

    // Risk Score
    pdf.setFontSize(12);
    pdf.setTextColor(255, 0, 0);
    pdf.text(`Overall Risk Score: ${visit.healthSummary.overallRiskScore}/100 (${visit.healthSummary.riskLevel})`, 20, currentY);
    currentY += 10;

    // AI Summary
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const summaryLines = pdf.splitTextToSize(visit.healthSummary.aiSummary, pageWidth - 40);
    pdf.text(summaryLines, 20, currentY);
    currentY += summaryLines.length * 5 + 10;
  }

  // Vitals
  if (visit.vitals) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 204);
    pdf.text('Vital Signs', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const vitalsData = [
      `Blood Pressure: ${visit.vitals.systolicBP}/${visit.vitals.diastolicBP} mmHg`,
      `Heart Rate: ${visit.vitals.heartRate} bpm`,
      `Temperature: ${visit.vitals.temperature}°C`,
      `SpO2: ${visit.vitals.spO2}%`
    ];

    vitalsData.forEach((data, index) => {
      pdf.text(data, 20, currentY + (index * 5));
    });
    currentY += 30;
  }

  // Blood Test
  if (visit.bloodTest) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 204);
    pdf.text('Blood Test Results', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const bloodData = [
      `Hemoglobin: ${visit.bloodTest.hemoglobin} g/dL`,
      `Blood Sugar: ${visit.bloodTest.bloodSugar} mg/dL`,
      `HDL Cholesterol: ${visit.bloodTest.hdl} mg/dL`,
      `LDL Cholesterol: ${visit.bloodTest.ldl} mg/dL`,
      `Total Cholesterol: ${visit.bloodTest.totalCholesterol} mg/dL`,
      `Triglycerides: ${visit.bloodTest.triglycerides} mg/dL`
    ];

    bloodData.forEach((data, index) => {
      pdf.text(data, 20, currentY + (index * 5));
    });
    currentY += 40;
  }

  // BMI
  if (visit.bmi) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 204);
    pdf.text('BMI Assessment', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const bmiData = [
      `Height: ${visit.bmi.height} cm`,
      `Weight: ${visit.bmi.weight} kg`,
      `BMI: ${visit.bmi.bmi}`,
      `Category: ${visit.bmi.category}`
    ];

    bmiData.forEach((data, index) => {
      pdf.text(data, 20, currentY + (index * 5));
    });
    currentY += 30;
  }

  // ECG
  if (visit.ecg) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 204);
    pdf.text('ECG Analysis', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const ecgData = [
      `Heart Rate: ${visit.ecg.heartRate} bpm`,
      `QRS Duration: ${visit.ecg.qrsDuration} ms`,
      `QT Interval: ${visit.ecg.qtInterval} ms`,
      `Interpretation: ${visit.ecg.interpretation}`,
      `Risk Level: ${visit.ecg.riskLevel}`
    ];

    ecgData.forEach((data, index) => {
      pdf.text(data, 20, currentY + (index * 5));
    });
    currentY += 35;

    // Try to capture ECG graph if visible
    const ecgElement = document.querySelector('.ecg-graph-container');
    if (ecgElement) {
      try {
        const canvas = await html2canvas(ecgElement as HTMLElement, {
          scale: 1,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (currentY + imgHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      } catch (error) {
        console.warn('Could not capture ECG graph:', error);
      }
    }
  }

  // Recommendations
  if (visit.healthSummary?.recommendations && visit.healthSummary.recommendations.length > 0) {
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 204);
    pdf.text('Recommendations', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    visit.healthSummary.recommendations.forEach((rec, index) => {
      pdf.text(`• ${rec}`, 20, currentY + (index * 5));
    });
    currentY += visit.healthSummary.recommendations.length * 5 + 10;
  }

  // Critical Alerts
  if (visit.healthSummary?.criticalAlerts && visit.healthSummary.criticalAlerts.length > 0) {
    pdf.setFontSize(14);
    pdf.setTextColor(255, 0, 0);
    pdf.text('⚠️ CRITICAL ALERTS', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(255, 0, 0);
    visit.healthSummary.criticalAlerts.forEach((alert, index) => {
      pdf.text(`• ${alert}`, 20, currentY + (index * 5));
    });
    currentY += visit.healthSummary.criticalAlerts.length * 5 + 10;
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('Generated by Healthcare on Wheels - AI-Powered Diagnostic System', pageWidth / 2, footerY, { align: 'center' });
  pdf.text(`Report generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Add QR Code placeholder
  pdf.setFontSize(6);
  pdf.text('QR Code for digital access would be here', pageWidth - 40, footerY);

  // Save the PDF
  const fileName = `Health_Report_${visit.patient.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const generateCSVReport = (visit: Visit): void => {
  const csvData = [];
  
  // Header
  csvData.push(['Healthcare Diagnostic Report']);
  csvData.push(['Generated on:', new Date().toLocaleString()]);
  csvData.push(['']);
  
  // Patient Information
  csvData.push(['Patient Information']);
  csvData.push(['Name', visit.patient.fullName]);
  csvData.push(['Age', visit.patient.age]);
  csvData.push(['Gender', visit.patient.gender]);
  csvData.push(['Patient ID', visit.patient.patientId]);
  csvData.push(['Contact', visit.patient.contactInfo]);
  csvData.push(['Address', visit.patient.address]);
  csvData.push(['Visit Date', new Date(visit.createdAt).toLocaleString()]);
  csvData.push(['']);

  // Health Summary
  if (visit.healthSummary) {
    csvData.push(['Health Summary']);
    csvData.push(['Overall Risk Score', `${visit.healthSummary.overallRiskScore}/100`]);
    csvData.push(['Risk Level', visit.healthSummary.riskLevel]);
    csvData.push(['AI Summary', visit.healthSummary.aiSummary]);
    csvData.push(['']);
  }

  // Vitals
  if (visit.vitals) {
    csvData.push(['Vital Signs']);
    csvData.push(['Systolic BP', `${visit.vitals.systolicBP} mmHg`]);
    csvData.push(['Diastolic BP', `${visit.vitals.diastolicBP} mmHg`]);
    csvData.push(['Heart Rate', `${visit.vitals.heartRate} bpm`]);
    csvData.push(['Temperature', `${visit.vitals.temperature}°C`]);
    csvData.push(['SpO2', `${visit.vitals.spO2}%`]);
    csvData.push(['']);
  }

  // Blood Test
  if (visit.bloodTest) {
    csvData.push(['Blood Test Results']);
    csvData.push(['Hemoglobin', `${visit.bloodTest.hemoglobin} g/dL`]);
    csvData.push(['Blood Sugar', `${visit.bloodTest.bloodSugar} mg/dL`]);
    csvData.push(['HDL Cholesterol', `${visit.bloodTest.hdl} mg/dL`]);
    csvData.push(['LDL Cholesterol', `${visit.bloodTest.ldl} mg/dL`]);
    csvData.push(['Total Cholesterol', `${visit.bloodTest.totalCholesterol} mg/dL`]);
    csvData.push(['Triglycerides', `${visit.bloodTest.triglycerides} mg/dL`]);
    csvData.push(['']);
  }

  // BMI
  if (visit.bmi) {
    csvData.push(['BMI Assessment']);
    csvData.push(['Height', `${visit.bmi.height} cm`]);
    csvData.push(['Weight', `${visit.bmi.weight} kg`]);
    csvData.push(['BMI Value', visit.bmi.bmi]);
    csvData.push(['Category', visit.bmi.category]);
    csvData.push(['']);
  }

  // ECG
  if (visit.ecg) {
    csvData.push(['ECG Analysis']);
    csvData.push(['Heart Rate', `${visit.ecg.heartRate} bpm`]);
    csvData.push(['QRS Duration', `${visit.ecg.qrsDuration} ms`]);
    csvData.push(['QT Interval', `${visit.ecg.qtInterval} ms`]);
    csvData.push(['Interpretation', visit.ecg.interpretation]);
    csvData.push(['Risk Level', visit.ecg.riskLevel]);
    csvData.push(['']);
  }

  // Recommendations
  if (visit.healthSummary?.recommendations && visit.healthSummary.recommendations.length > 0) {
    csvData.push(['Recommendations']);
    visit.healthSummary.recommendations.forEach(rec => {
      csvData.push(['', rec]);
    });
    csvData.push(['']);
  }

  // Critical Alerts
  if (visit.healthSummary?.criticalAlerts && visit.healthSummary.criticalAlerts.length > 0) {
    csvData.push(['Critical Alerts']);
    visit.healthSummary.criticalAlerts.forEach(alert => {
      csvData.push(['', alert]);
    });
  }

  // Convert to CSV string
  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Health_Report_${visit.patient.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};