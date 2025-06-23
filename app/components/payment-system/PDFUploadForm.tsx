import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, Edit3, DollarSign, Download, RotateCcw } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Badge from '@/app/components/ui/Badge';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
import { MagiclinePDFProcessor } from '@/lib/services/pdf-processor';
import type { ExtractedMemberData, ContractMatchResult } from '@/app/lib/types/payment-system';

interface UploadedFile {
  file: File;
  id: string;
  status: 'uploading' | 'processing' | 'extracted' | 'validated' | 'matched' | 'imported' | 'error';
  extractedData?: ExtractedMemberData;
  contractMatch?: ContractMatchResult;
  error?: string;
  progress: number;
  importedMemberId?: string;
}

interface ProcessingStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

interface PDFUploadFormProps {
  onUploadSuccess?: () => void;
}

export function PDFUploadForm({ onUploadSuccess }: PDFUploadFormProps = {}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessStats, setShowSuccessStats] = useState(false);
  const [importStats, setImportStats] = useState({ successful: 0, failed: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const api = new PaymentSystemAPI();
  const pdfProcessor = new MagiclinePDFProcessor();

  const processingSteps: ProcessingStep[] = [
    { id: 1, title: 'PDF-Upload', description: 'Dateien werden hochgeladen', status: 'pending' },
    { id: 2, title: 'PDF-Analyse', description: 'Dokumenttyp wird erkannt', status: 'pending' },
    { id: 3, title: 'Datenextraktion', description: 'Mitgliedsdaten werden extrahiert', status: 'pending' },
    { id: 4, title: 'Validation', description: 'Daten werden validiert', status: 'pending' },
    { id: 5, title: 'Korrektur', description: 'Manuelle Nachbearbeitung bei Bedarf', status: 'pending' },
    { id: 6, title: 'Vertrags-Matching', description: 'Zuordnung zu Vertragsarten', status: 'pending' },
    { id: 7, title: 'Import', description: 'Mitglied wird erstellt', status: 'pending' }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);
    setShowSuccessStats(false);

    const stats = { successful: 0, failed: 0, total: newFiles.length };

    for (const uploadedFile of newFiles) {
      const success = await processFile(uploadedFile);
      if (success) {
        stats.successful++;
      } else {
        stats.failed++;
      }
    }

    setImportStats(stats);
    setShowSuccessStats(true);
    setIsProcessing(false);

    if (onUploadSuccess) {
      onUploadSuccess();
    }
  };

  const processFile = async (uploadedFile: UploadedFile): Promise<boolean> => {
    try {
      // Step 1: Upload Simulation
      setCurrentStep(0);
      updateFileStatus(uploadedFile.id, 'uploading', 15);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: PDF Analysis & Data Extraction
      setCurrentStep(1);
      updateFileStatus(uploadedFile.id, 'processing', 35);
      
      // Convert File to Buffer for PDF processing
      const buffer = await uploadedFile.file.arrayBuffer();
      const extractedData = await pdfProcessor.processPDF(Buffer.from(buffer));
      
      if (!extractedData.success || !extractedData.memberData) {
        throw new Error(extractedData.errors.join(', ') || 'PDF-Extraktion fehlgeschlagen');
      }

      // Step 3: Validation
      setCurrentStep(2);
      updateFileStatus(uploadedFile.id, 'extracted', 55);
      const validationIssues = pdfProcessor.validateMemberData(extractedData.memberData);
      const criticalErrors = validationIssues.filter(issue => issue.severity === 'error');
      
      if (criticalErrors.length > 0) {
        updateFileStatus(uploadedFile.id, 'error', 100, criticalErrors.map(e => e.issue).join(', '));
        return false;
      }

      // Step 4: Contract Matching
      setCurrentStep(3);
      updateFileStatus(uploadedFile.id, 'validated', 75);
      const contractMatch = await findMatchingContract(extractedData.memberData);

      // Step 5: Prepare for Import (DO NOT create member yet!)
      setCurrentStep(4);
      updateFileStatus(uploadedFile.id, 'matched', 90);
      
      // Step 6: Store data for later import
      setUploadedFiles(prev => prev.map(file => 
        file.id === uploadedFile.id
          ? {
              ...file,
              status: 'matched', // Stay at matched - user must click import
              extractedData: extractedData.memberData!,
              contractMatch,
              progress: 90 // Not 100 yet
            }
          : file
      ));

      console.log('✅ Datei bereit für Import:', {
        fileName: uploadedFile.file.name,
        memberName: `${extractedData.memberData.firstName} ${extractedData.memberData.lastName}`,
        memberNumber: extractedData.memberData.memberNumber
      });
      
      return true;
    } catch (error) {
      console.error('File processing error:', error);
      updateFileStatus(uploadedFile.id, 'error', 100, 
        error instanceof Error ? error.message : 'Unbekannter Fehler'
      );
      return false;
    }
  };

  // Contract Matching Logic
  const findMatchingContract = async (data: ExtractedMemberData): Promise<ContractMatchResult> => {
    try {
      // TODO: Implement actual contract matching logic
      // For now, return a default payment group
      const groupsResult = await api.getPaymentGroups();
      
      if (groupsResult.success && groupsResult.data && groupsResult.data.length > 0) {
        return {
          contractTypeId: 'default',
          suggestedPaymentGroupId: groupsResult.data[0].id,
          confidence: 0.8,
          matches: {
            tariffMatch: true,
            priceMatch: true,
            dateMatch: true
          }
        };
      }
      
      return {
        contractTypeId: 'default',
        suggestedPaymentGroupId: undefined, // Don't use invalid UUID string
        confidence: 0.5,
        matches: {
          tariffMatch: false,
          priceMatch: false,
          dateMatch: true
        }
      };
    } catch (error) {
      console.error('Contract matching error:', error);
      return {
        contractTypeId: 'default',
        suggestedPaymentGroupId: undefined, // Don't use invalid UUID string
        confidence: 0.3,
        matches: {
          tariffMatch: false,
          priceMatch: false,
          dateMatch: false
        }
      };
    }
  };

  const updateFileStatus = (
    fileId: string, 
    status: UploadedFile['status'], 
    progress: number, 
    error?: string
  ) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId
        ? { ...file, status, progress, error }
        : file
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    const variants = {
      uploading: 'secondary',
      processing: 'secondary',
      extracted: 'default',
      validated: 'default',
      matched: 'blue',
      imported: 'green',
      error: 'red'
    } as const;
    
    const texts = {
      uploading: 'Upload...',
      processing: 'Verarbeitung...',
      extracted: 'Extrahiert',
      validated: 'Validiert',
      matched: 'Bereit für Import',
      imported: 'Importiert',
      error: 'Fehler'
    };
    
    return {
      variant: (variants[status] || 'gray') as 'default' | 'secondary' | 'destructive' | 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray' | 'gold',
      text: texts[status] || status
    };
  };

  const importMemberData = async (uploadedFile: UploadedFile): Promise<boolean> => {
    if (!uploadedFile.extractedData || uploadedFile.status !== 'matched') {
      return false;
    }

    try {
      setIsProcessing(true);
      setCurrentStep(5); // Step 6: Import
      updateFileStatus(uploadedFile.id, 'processing', 95);

      // JETZT erstelle den Payment Member
      const memberResult = await api.createPaymentMember({
        member_id: undefined,
        member_number: uploadedFile.extractedData.memberNumber || `MEMBER_${Date.now()}`,
        first_name: uploadedFile.extractedData.firstName || '',
        last_name: uploadedFile.extractedData.lastName || '',
        email: uploadedFile.extractedData.email || undefined,
        phone: uploadedFile.extractedData.phone || undefined,
        birth_date: uploadedFile.extractedData.birthDate || undefined,
        iban: uploadedFile.extractedData.iban || undefined,
        bic: uploadedFile.extractedData.bic || undefined,
        mandate_reference: uploadedFile.extractedData.mandateReference || undefined,
        payment_group_id: uploadedFile.contractMatch?.suggestedPaymentGroupId || undefined
      });

      if (!memberResult.success) {
        throw new Error(memberResult.error || 'Mitglied-Erstellung fehlgeschlagen');
      }

      // Step 7: Complete
      setCurrentStep(6);
      updateFileStatus(uploadedFile.id, 'imported', 100);
      
      // Update the file with member ID
      setUploadedFiles(prev => prev.map(file => 
        file.id === uploadedFile.id
          ? { ...file, importedMemberId: memberResult.data?.id }
          : file
      ));
      
      // Show success message
      const memberName = `${memberResult.data?.first_name} ${memberResult.data?.last_name}`;
      console.log(`🎉 ${memberName} (${memberResult.data?.member_number}) wurde erfolgreich importiert!`);
      console.log('💡 Wechseln Sie zum "Mitglieder"-Tab im Payment-System um das neue Mitglied zu sehen.');
      
      // Show success toast notification
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center';
      successMessage.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <div>
          <strong>${memberName}</strong> wurde erfolgreich importiert!<br>
          <small>Wechseln Sie zum "Mitglieder"-Tab um das neue Mitglied zu sehen.</small>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 5000);

      // Aktualisiere Import-Statistiken
      setImportStats(prev => ({
        ...prev,
        successful: prev.successful + 1
      }));

      // Trigger callback for parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      return true;
    } catch (error) {
      console.error('Import error:', error);
      updateFileStatus(uploadedFile.id, 'error', 100, 
        error instanceof Error ? error.message : 'Import fehlgeschlagen');
      
      setImportStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>PDF-Upload</CardTitle>
          <CardDescription>
            Laden Sie Magicline-PDFs (Verträge und Kontoauszüge) hoch für automatische Mitglieder-Erstellung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              PDFs hierher ziehen oder klicken zum Auswählen
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Unterstützt: Magicline-Verträge und Kontoauszüge (.pdf)
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Dateien auswählen
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </CardContent>
      </Card>

      {/* Processing Steps Overview */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verarbeitungsschritte</CardTitle>
            <CardDescription>
              7-Schritt-Workflow für automatische Mitglieder-Erstellung
              {isProcessing && (
                <span className="ml-2 text-blue-600 font-medium">
                  • Aktuell: Schritt {currentStep + 1}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-green-600 text-white' // Completed steps
                      : index === currentStep && isProcessing
                      ? 'bg-blue-600 text-white animate-pulse' // Current step
                      : index === currentStep
                      ? 'bg-blue-600 text-white' // Current step (not processing)
                      : 'bg-gray-200 text-gray-500' // Future steps
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <p className={`text-xs transition-colors duration-300 ${
                    index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Current Step Description */}
            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  {processingSteps[currentStep]?.description || 'Verarbeitung läuft...'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Actions */}
      {uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'matched') && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">
                  {uploadedFiles.filter(f => f.status === 'matched').length} Dateien bereit für Import
                </h3>
                <p className="text-sm text-green-600">
                  Alle Daten wurden erfolgreich extrahiert und validiert
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    // Import alle bereiten Dateien
                    const readyFiles = uploadedFiles.filter(f => f.status === 'matched');
                    for (const file of readyFiles) {
                      await importMemberData(file);
                    }
                  }}
                  disabled={isProcessing}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Alle importieren ({uploadedFiles.filter(f => f.status === 'matched').length})
                </Button>
                <Button
                  onClick={async () => {
                    // Einzelimport für erste bereite Datei
                    const firstReady = uploadedFiles.find(f => f.status === 'matched');
                    if (firstReady) {
                      await importMemberData(firstReady);
                    }
                  }}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import starten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hochgeladene Dateien ({uploadedFiles.length})</CardTitle>
              {uploadedFiles.some(f => f.status === 'error') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Retry alle Fehler-Dateien
                    const errorFiles = uploadedFiles.filter(f => f.status === 'error');
                    errorFiles.forEach(file => {
                      updateFileStatus(file.id, 'uploading', 0);
                      processFile(file);
                    });
                  }}
                  disabled={isProcessing}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Fehler wiederholen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                    
                    {/* Extracted Data Preview */}
                    {uploadedFile.extractedData && (
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Extrahiert:</strong> {uploadedFile.extractedData.firstName} {uploadedFile.extractedData.lastName}
                        {uploadedFile.extractedData.memberNumber && ` (${uploadedFile.extractedData.memberNumber})`}
                        {uploadedFile.extractedData.iban && ` • IBAN: ${uploadedFile.extractedData.iban.substring(0, 8)}...`}
                        {uploadedFile.extractedData.accountBalance !== undefined && 
                          ` • Saldo: ${uploadedFile.extractedData.accountBalance}€`}
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {uploadedFile.error && (
                      <div className="mt-2 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {uploadedFile.error}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(uploadedFile.status).variant}>
                      {getStatusBadge(uploadedFile.status).text}
                    </Badge>
                    
                    {uploadedFile.status === 'matched' && (
                      <Button
                        size="sm"
                        onClick={() => {/* TODO: Open import modal */}}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Import
                      </Button>
                    )}
                    
                    {uploadedFile.extractedData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* TODO: Open edit modal */}}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {uploadedFiles.length}
                </p>
                <p className="text-sm text-gray-600">Dateien</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {uploadedFiles.filter(f => f.status === 'imported').length}
                </p>
                <p className="text-sm text-gray-600">Importiert</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {uploadedFiles.filter(f => f.status === 'matched').length}
                </p>
                <p className="text-sm text-gray-600">Bereit</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {uploadedFiles.filter(f => f.status === 'error').length}
                </p>
                <p className="text-sm text-gray-600">Fehler</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 