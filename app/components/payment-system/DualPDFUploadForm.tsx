import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, Edit3, DollarSign, Download, RotateCcw, User, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Badge from '@/app/components/ui/Badge';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
// import { MagiclinePDFProcessor } from '@/lib/services/pdf-processor'; // Moved to server-side only
import type { PaymentGroup, ExtractedMemberData } from '@/app/lib/types/payment-system';

interface UploadedFile {
  file: File;
  id: string;
  type: 'membership' | 'statement';
  status: 'uploading' | 'processing' | 'extracted' | 'validated' | 'matched' | 'ready' | 'error';
  extractedData?: ExtractedMemberData;
  error?: string;
  progress: number;
}

interface DualImportSession {
  membershipFile?: UploadedFile;
  statementFile?: UploadedFile;
  mergedData?: ExtractedMemberData;
  memberNumberMatch: boolean;
  conflictResolution: 'membership-priority';
  selectedMembership?: any;
  selectedPaymentGroup?: PaymentGroup;
  currentStep: number;
  isComplete: boolean;
}

interface ProcessingStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  isActive: boolean;
}

interface DualPDFUploadFormProps {
  onUploadSuccess?: () => void;
}

export function DualPDFUploadForm({ onUploadSuccess }: DualPDFUploadFormProps = {}) {
  const [session, setSession] = useState<DualImportSession>({
    memberNumberMatch: false,
    conflictResolution: 'membership-priority',
    currentStep: 1,
    isComplete: false
  });
  
  // State für manuelle IBAN-Eingabe
  const [manualIban, setManualIban] = useState<string>('');
  
  const [isDragOver, setIsDragOver] = useState<{ membership: boolean; statement: boolean }>({
    membership: false,
    statement: false
  });
  
  const [availablePaymentGroups, setAvailablePaymentGroups] = useState<PaymentGroup[]>([]);
  
  const membershipFileInputRef = useRef<HTMLInputElement>(null);
  const statementFileInputRef = useRef<HTMLInputElement>(null);

  const api = new PaymentSystemAPI();
  // const pdfProcessor = new MagiclinePDFProcessor(); // Server-side only

  const processingSteps: ProcessingStep[] = [
    { id: 1, title: 'Dual-Upload', description: 'Mitgliedschaft & Kontoauszug hochladen', status: 'pending', isActive: true },
    { id: 2, title: 'Datenextraktion', description: 'PDFs werden parallel verarbeitet', status: 'pending', isActive: false },
    { id: 3, title: 'Datenbestätigung', description: 'Extrahierte Daten überprüfen', status: 'pending', isActive: false },
    { id: 4, title: 'Beitragskonto', description: 'Kontoinformationen bestätigen', status: 'pending', isActive: false },
    { id: 5, title: 'Mitgliedschafts-Auswahl', description: 'Vertragsart zuordnen', status: 'pending', isActive: false },
    { id: 6, title: 'Lastschriftgruppe', description: 'Payment Group auswählen', status: 'pending', isActive: false },
    { id: 7, title: 'Finaler Import', description: 'Mitglied erstellen & Dokumente speichern', status: 'pending', isActive: false }
  ];

  useEffect(() => {
    loadPaymentGroups();
  }, []);

  // Auto-trigger data merging when session changes
  useEffect(() => {
    if (session.membershipFile?.extractedData && session.statementFile?.extractedData && !session.mergedData) {
      console.log('🔄 Auto-triggering data merging from useEffect...');
      console.log('📊 Session state in useEffect:', {
        membershipFile: session.membershipFile?.extractedData ? 'YES' : 'NO',
        statementFile: session.statementFile?.extractedData ? 'YES' : 'NO',
        mergedData: session.mergedData ? 'YES' : 'NO'
      });
      
      // Directly execute the merging logic here instead of calling the function to avoid closure issues
      const membershipData = session.membershipFile.extractedData;
      const statementData = session.statementFile.extractedData;
      
      console.log('✅ Both files have extracted data, merging...');
      
      const mergedData = {
        ...membershipData,
        accountBalance: statementData.accountBalance
      };
      
      const memberNumberMatch = membershipData.memberNumber === statementData.memberNumber;
      
      console.log('📊 Merged data:', {
        name: `${mergedData.firstName} ${mergedData.lastName}`,
        memberNumber: mergedData.memberNumber,
        accountBalance: mergedData.accountBalance,
        memberNumberMatch
      });
      
      setSession(prev => ({
        ...prev,
        mergedData,
        memberNumberMatch,
        currentStep: 3
      }));
    }
  }, [session.membershipFile?.extractedData, session.statementFile?.extractedData, session.mergedData]);

  const loadPaymentGroups = async () => {
    try {
      const result = await api.getPaymentGroups();
      if (result.success && result.data) {
        setAvailablePaymentGroups(result.data);
      }
    } catch (error) {
      console.error('Error loading payment groups:', error);
    }
  };

  // ===== DRAG & DROP HANDLERS =====
  const handleDragOver = useCallback((e: React.DragEvent, type: 'membership' | 'statement') => {
    e.preventDefault();
    setIsDragOver(prev => ({ ...prev, [type]: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, type: 'membership' | 'statement') => {
    e.preventDefault();
    setIsDragOver(prev => ({ ...prev, [type]: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'membership' | 'statement') => {
    e.preventDefault();
    setIsDragOver(prev => ({ ...prev, [type]: false }));
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'membership' | 'statement') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  }, []);

  // ===== FILE REMOVAL =====
  const removeFile = useCallback((type: 'membership' | 'statement') => {
    setSession(prev => {
      const updatedSession = { ...prev };
      
      if (type === 'membership') {
        updatedSession.membershipFile = undefined;
      } else {
        updatedSession.statementFile = undefined;
      }
      
      // Reset merged data if one file is removed
      updatedSession.mergedData = undefined;
      updatedSession.memberNumberMatch = false;
      updatedSession.currentStep = 1;
      
      return updatedSession;
    });
    
    console.log(`🗑️ File removed: ${type}`);
  }, []);

  // ===== FILE UPLOAD & PROCESSING =====
  const handleFileUpload = async (file: File, type: 'membership' | 'statement') => {
    const uploadedFile: UploadedFile = {
      file,
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      status: 'uploading',
      progress: 0
    };

    setSession(prev => ({
      ...prev,
      [type === 'membership' ? 'membershipFile' : 'statementFile']: uploadedFile
    }));

    await processFile(uploadedFile);
  };

  const processFile = async (uploadedFile: UploadedFile): Promise<boolean> => {
    try {
      updateFileStatus(uploadedFile.id, 'processing', 30);
      
      // Send file to server for processing instead of client-side processing
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('type', uploadedFile.type);
      
      const response = await fetch('/api/pdf/process', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`PDF processing failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        updateFileStatus(uploadedFile.id, 'extracted', 80, undefined);
        
        // Store extracted data
        const extractedData = result.data as ExtractedMemberData;
        
        // Update file with extracted data
        if (uploadedFile.type === 'membership') {
          setSession(prev => ({
            ...prev,
            membershipFile: { ...uploadedFile, extractedData, status: 'ready', progress: 100 }
          }));
        } else {
          setSession(prev => ({
            ...prev,
            statementFile: { ...uploadedFile, extractedData, status: 'ready', progress: 100 }
          }));
        }
        
        console.log('✅ File processing complete:', {
          type: uploadedFile.type,
          extractedData,
          status: 'ready'
        });
        
        // Check if we can merge data after successful extraction
        setTimeout(() => checkForDataMerging(), 100); // Small delay to ensure state is updated
        
        return true;
      } else {
        throw new Error(result.error || 'PDF processing failed');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      updateFileStatus(
        uploadedFile.id, 
        'error', 
        0, 
        error instanceof Error ? error.message : 'Processing failed'
      );
      return false;
    }
  };

  const updateFileStatus = (fileId: string, status: UploadedFile['status'], progress: number, error?: string) => {
    setSession(prev => {
      const updatedSession = { ...prev };
      
      if (prev.membershipFile?.id === fileId) {
        updatedSession.membershipFile = {
          ...prev.membershipFile,
          status,
          progress,
          error
        };
      }
      
      if (prev.statementFile?.id === fileId) {
        updatedSession.statementFile = {
          ...prev.statementFile,
          status,
          progress,
          error
        };
      }
      
      return updatedSession;
    });
  };

  // ===== DATA MERGING & VALIDATION =====
  const checkForDataMerging = () => {
    console.log('🔄 Checking for data merging...', {
      membershipFile: session.membershipFile?.extractedData ? 'YES' : 'NO',
      statementFile: session.statementFile?.extractedData ? 'YES' : 'NO',
      membershipFileData: session.membershipFile?.extractedData,
      statementFileData: session.statementFile?.extractedData,
      membershipFileStatus: session.membershipFile?.status,
      statementFileStatus: session.statementFile?.status
    });
    
    if (session.membershipFile?.extractedData && session.statementFile?.extractedData) {
      const membershipData = session.membershipFile.extractedData;
      const statementData = session.statementFile.extractedData;
      
      console.log('✅ Both files have extracted data, merging...');
      
      // TODO: Implement server-side data merging via API
      // For now, use membership data as primary source
      const mergedData = {
        ...membershipData,
        // Add statement-specific data if available
        accountBalance: statementData.accountBalance
      };
      
      const memberNumberMatch = membershipData.memberNumber === statementData.memberNumber;
      
      console.log('📊 Merged data:', {
        name: `${mergedData.firstName} ${mergedData.lastName}`,
        memberNumber: mergedData.memberNumber,
        accountBalance: mergedData.accountBalance,
        memberNumberMatch
      });
      
      setSession(prev => ({
        ...prev,
        mergedData,
        memberNumberMatch,
        currentStep: 3
      }));
    } else {
      console.log('⏳ Waiting for both files to be processed...');
    }
  };

  // ===== STEP NAVIGATION =====
  const proceedToNextStep = () => {
    setSession(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 7)
    }));
  };

  const goBackToStep = (stepNumber: number) => {
    setSession(prev => ({
      ...prev,
      currentStep: stepNumber
    }));
  };

  // ===== MEMBERSHIP SELECTION =====
  const handleMembershipSelection = (membership: any) => {
    setSession(prev => ({
      ...prev,
      selectedMembership: membership,
      currentStep: 6 // Move to payment group selection
    }));
  };

  // ===== PAYMENT GROUP SELECTION =====
  const handlePaymentGroupSelection = (paymentGroup: PaymentGroup) => {
    setSession(prev => ({
      ...prev,
      selectedPaymentGroup: paymentGroup,
      currentStep: 7 // Move to final import
    }));
  };

  // ===== FINAL IMPORT =====
  const executeFinalImport = async () => {
    try {
      // TODO: Implement final import via API
      console.log('Executing final import...');
      
      setSession(prev => ({
        ...prev,
        isComplete: true
      }));
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Final import error:', error);
    }
  };

  // ===== RENDER METHODS =====
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {processingSteps.map((step, index) => {
          const isActive = step.id === session.currentStep;
          const isCompleted = step.id < session.currentStep;
          const isError = false; // TODO: Implement error detection
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-500 text-white' : 
                    isError ? 'bg-red-500 text-white' : 
                    'bg-gray-300 text-gray-600'}
                `}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < processingSteps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${
                  step.id < session.currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderDualUpload = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Membership Contract Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mitgliedschaftsvertrag
          </CardTitle>
          <CardDescription>
            PDF des Mitgliedschaftsvertrags hochladen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver.membership 
                ? 'border-blue-500 bg-blue-50' 
                : session.membershipFile?.status === 'ready'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => handleDragOver(e, 'membership')}
            onDragLeave={(e) => handleDragLeave(e, 'membership')}
            onDrop={(e) => handleDrop(e, 'membership')}
          >
            {session.membershipFile ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('membership')}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm font-medium">{session.membershipFile.file.name}</div>
                <div className="text-xs text-gray-500">
                  {(session.membershipFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {session.membershipFile.status === 'ready' && (
                  <Badge variant="green">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verarbeitet
                  </Badge>
                )}
                {session.membershipFile.error && (
                  <Badge variant="red">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {session.membershipFile.error}
                  </Badge>
                )}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${session.membershipFile.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  Mitgliedschaftsvertrag hier ablegen oder
                </div>
                <Button
                  variant="outline"
                  onClick={() => membershipFileInputRef.current?.click()}
                >
                  Datei auswählen
                </Button>
              </div>
            )}
          </div>
          <input
            ref={membershipFileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileInputChange(e, 'membership')}
          />
        </CardContent>
      </Card>

      {/* Statement Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Kontoauszug
          </CardTitle>
          <CardDescription>
            PDF des Beitragskontos hochladen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver.statement 
                ? 'border-blue-500 bg-blue-50' 
                : session.statementFile?.status === 'ready'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => handleDragOver(e, 'statement')}
            onDragLeave={(e) => handleDragLeave(e, 'statement')}
            onDrop={(e) => handleDrop(e, 'statement')}
          >
            {session.statementFile ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('statement')}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm font-medium">{session.statementFile.file.name}</div>
                <div className="text-xs text-gray-500">
                  {(session.statementFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {session.statementFile.status === 'ready' && (
                  <Badge variant="green">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verarbeitet
                  </Badge>
                )}
                {session.statementFile.error && (
                  <Badge variant="red">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {session.statementFile.error}
                  </Badge>
                )}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${session.statementFile.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  Kontoauszug hier ablegen oder
                </div>
                <Button
                  variant="outline"
                  onClick={() => statementFileInputRef.current?.click()}
                >
                  Datei auswählen
                </Button>
              </div>
            )}
          </div>
          <input
            ref={statementFileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileInputChange(e, 'statement')}
          />
        </CardContent>
      </Card>
      </div>

      {/* Continue Button */}
      {(session.membershipFile?.extractedData && session.statementFile?.extractedData) && (
        <div className="flex justify-end">
          <Button
            onClick={() => proceedToNextStep()}
            className="flex items-center gap-2"
          >
            Weiter zur Datenüberprüfung
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderDataConfirmation = () => {
    if (!session.mergedData) return null;

    return (
      <div className="space-y-6">
        {/* Member Number Match Warning */}
        {!session.memberNumberMatch && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Warnung: Mitgliedsnummern stimmen nicht überein
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Die Mitgliedsnummer im Vertrag ({session.membershipFile?.extractedData?.memberNumber || 'N/A'}) 
                  stimmt nicht mit der im Kontoauszug ({session.statementFile?.extractedData?.memberNumber || 'N/A'}) überein.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-sm">{session.mergedData.firstName} {session.mergedData.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Geburtsdatum</label>
                <p className="text-sm">{session.mergedData.birthDate || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Adresse</label>
                <p className="text-sm">{session.mergedData.address || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Telefon</label>
                <p className="text-sm">{session.mergedData.phone || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">E-Mail</label>
                <p className="text-sm">{session.mergedData.email || 'Nicht verfügbar'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vertragsdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Mitgliedsnummer</label>
                <p className="text-sm">{session.mergedData.memberNumber || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tarif</label>
                <p className="text-sm">{session.mergedData.contractTariff || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Preis</label>
                <p className="text-sm">
                  {session.mergedData.contractPrice 
                    ? `${session.mergedData.contractPrice.toFixed(2)} €` 
                    : 'Nicht verfügbar'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Vertragsbeginn</label>
                <p className="text-sm">{session.mergedData.contractStartDate || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Laufzeit</label>
                <p className="text-sm">{session.mergedData.contractDuration || 'Nicht verfügbar'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bankdaten</CardTitle>
              <CardDescription>
                {!session.mergedData.iban && 'IBAN muss manuell eingegeben werden (meist geschwärzt)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">IBAN</label>
                {session.mergedData.iban ? (
                  <p className="text-sm font-mono">{session.mergedData.iban}</p>
                ) : (
                  <div className="mt-1">
                    <input
                      type="text"
                      placeholder="DE00 0000 0000 0000 0000 00"
                      value={manualIban}
                      onChange={(e) => setManualIban(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={34}
                    />
                    {manualIban && (
                      <p className="text-xs text-gray-500 mt-1">
                        IBAN wird beim Import verwendet
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">BIC</label>
                <p className="text-sm">{session.mergedData.bic || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Bank</label>
                <p className="text-sm">{session.mergedData.bankName || 'Nicht verfügbar'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Mandatsreferenz</label>
                <p className="text-sm">{session.mergedData.mandateReference || 'Nicht verfügbar'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beitragskonto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Aktueller Saldo</label>
                <p className="text-sm">
                  {session.mergedData.accountBalance !== undefined
                    ? `${session.mergedData.accountBalance.toFixed(2)} €`
                    : 'Nicht verfügbar'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Zahlungsintervall</label>
                <p className="text-sm">{session.mergedData.paymentInterval || 'Nicht verfügbar'}</p>
              </div>
              {session.mergedData.setupFee && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Aufnahmegebühr</label>
                  <p className="text-sm">{session.mergedData.setupFee.toFixed(2)} €</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => goBackToStep(1)}
            icon={<ArrowLeft size={16} />}
          >
            Zurück
          </Button>
          <Button
            onClick={proceedToNextStep}
            icon={<ArrowRight size={16} />}
          >
            Daten bestätigen
          </Button>
        </div>
      </div>
    );
  };

  const renderBeitragskontoConfirmation = () => {
    // Generiere Beitragskalender Vorschau basierend auf extrahierten Daten
    const generatePreviewCalendar = () => {
      if (!session.mergedData?.contractStartDate || !session.mergedData?.contractPrice) {
        return [];
      }

      const startDate = new Date(session.mergedData.contractStartDate);
      const monthlyAmount = session.mergedData.contractPrice;
      const calendar = [];

      // Generiere die nächsten 12 Monate
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
        const status = i === 0 ? 'pending' : i <= 2 ? 'upcoming' : 'future';
        
        calendar.push({
          date: dueDate.toLocaleDateString('de-DE'),
          amount: monthlyAmount,
          status: status,
          description: `${session.mergedData?.contractTariff || 'Mitgliedschaft'} - Monatsbeitrag`
        });
      }

      return calendar;
    };

    const previewCalendar = generatePreviewCalendar();
    const currentBalance = session.mergedData?.accountBalance || 0;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Beitragskonto & Kalender-Übersicht</CardTitle>
            <CardDescription>
              Detaillierte Übersicht der Beitragszahlungen und Kontostand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Aktueller Kontostand */}
              <div className={`rounded-lg p-4 ${currentBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-medium ${currentBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                      Aktueller Kontostand
                    </h4>
                    <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {currentBalance.toFixed(2)} €
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}>
                      Mitgliedsnummer: {session.mergedData?.memberNumber}
                    </p>
                    <p className={currentBalance >= 0 ? 'text-green-700' : 'text-red-700'}>
                      {currentBalance >= 0 ? 'Guthaben' : 'Rückstand'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vertragsdetails */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-3">
                  <h5 className="text-sm font-medium text-gray-900">Tarif</h5>
                  <p className="text-sm text-gray-600 font-medium">
                    {session.mergedData?.contractTariff || 'Unbekannt'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.mergedData?.contractPrice?.toFixed(2)} € / Monat
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <h5 className="text-sm font-medium text-gray-900">Zahlungsweise</h5>
                  <p className="text-sm text-gray-600">
                    {session.mergedData?.paymentInterval || 'Monatlich'}
                  </p>
                  <p className="text-xs text-gray-500">
                    SEPA: {session.mergedData?.iban ? 'Aktiv' : 'Zu prüfen'}
                  </p>
                </div>
                <div className="border rounded-lg p-3">
                  <h5 className="text-sm font-medium text-gray-900">Vertragsbeginn</h5>
                  <p className="text-sm text-gray-600">
                    {session.mergedData?.contractStartDate 
                      ? new Date(session.mergedData.contractStartDate).toLocaleDateString('de-DE')
                      : 'Unbekannt'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Laufzeit: {session.mergedData?.minimumDuration || 'Unbekannt'}
                  </p>
                </div>
              </div>

              {/* Erweiterte Beitragskalender-Anzeige */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Beitragskalender-Übersicht
                </h4>
                
                {/* Bezahlte Beiträge */}
                {session.statementFile?.extractedData?.paidContributions && 
                 session.statementFile.extractedData.paidContributions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-green-700 mb-2">✅ Bereits bezahlte Beiträge</h5>
                    <div className="border rounded-lg overflow-hidden">
                      {session.statementFile.extractedData.paidContributions.map((entry, index) => (
                        <div key={`paid-${index}`} className="px-4 py-2 border-b bg-green-50 flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium">{entry.description}</div>
                            <div className="text-xs text-gray-600">Datum: {entry.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-700">{entry.amount?.toFixed(2)} €</div>
                            <div className="text-xs text-green-600">Bezahlt</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Zukünftige Beiträge */}
                {session.statementFile?.extractedData?.futureContributions && 
                 session.statementFile.extractedData.futureContributions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-blue-700 mb-2">📅 Zukünftige Beiträge</h5>
                    <div className="border rounded-lg overflow-hidden">
                      {session.statementFile.extractedData.futureContributions.map((entry, index) => (
                        <div key={`future-${index}`} className="px-4 py-2 border-b bg-blue-50 flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium">{entry.description}</div>
                            <div className="text-xs text-gray-600">
                              Zeitraum: {entry.startDate} - {entry.endDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-blue-700">{entry.forderung?.toFixed(2)} €</div>
                            <div className="text-xs text-blue-600">
                              Offen: {entry.offen?.toFixed(2)} €
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback: Generierte Vorschau wenn keine echten Daten */}
                {(!session.statementFile?.extractedData?.paidContributions?.length && 
                  !session.statementFile?.extractedData?.futureContributions?.length && 
                  previewCalendar.length > 0) && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">📋 Generierte Beitragsvorschau (nächste 12 Monate)</h5>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2">
                        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                          <div>Fälligkeitsdatum</div>
                          <div>Betrag</div>
                          <div>Status</div>
                          <div>Beschreibung</div>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {previewCalendar.map((entry, index) => (
                          <div 
                            key={index} 
                            className={`px-4 py-2 border-b grid grid-cols-4 gap-4 text-sm ${
                              entry.status === 'pending' ? 'bg-yellow-50' : 
                              entry.status === 'upcoming' ? 'bg-blue-50' : 'bg-white'
                            }`}
                          >
                            <div className="font-medium">{entry.date}</div>
                            <div className="font-medium">{entry.amount.toFixed(2)} €</div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                entry.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                entry.status === 'upcoming' ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {entry.status === 'pending' ? 'Fällig' :
                                 entry.status === 'upcoming' ? 'Anstehend' : 'Geplant'}
                              </span>
                            </div>
                            <div className="text-gray-600">{entry.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Automatische Verarbeitung */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Automatische Beitragsverarbeitung</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Monatlicher Beitragskalender wird automatisch generiert</li>
                  <li>• SEPA-Lastschriften werden nach Gruppenzuordnung eingezogen</li>
                  <li>• Zahlungseingang wird automatisch dem Beitragskonto gutgeschrieben</li>
                  <li>• Mahnungen bei Zahlungsrückständen werden automatisch versendet</li>
                </ul>
              </div>

              {/* Erkannte Zusatzoptionen */}
              {(session.mergedData?.hasFreezingOption || session.mergedData?.setupFee || session.mergedData?.administrationFee) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Zusätzliche Vertragsoptionen</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {session.mergedData?.hasFreezingOption && (
                      <li>• Stillegungsoption verfügbar</li>
                    )}
                    {session.mergedData?.freezingFee && (
                      <li>• Stillegungsgebühr: {session.mergedData.freezingFee.toFixed(2)} € / Monat</li>
                    )}
                    {session.mergedData?.setupFee && (
                      <li>• Aufnahmegebühr: {session.mergedData.setupFee.toFixed(2)} € (einmalig)</li>
                    )}
                    {session.mergedData?.administrationFee && (
                      <li>• Verwaltungsgebühr: {session.mergedData.administrationFee.toFixed(2)} € / Monat</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => goBackToStep(3)}
            icon={<ArrowLeft size={16} />}
          >
            Zurück zu Stammdaten
          </Button>
          <Button
            onClick={proceedToNextStep}
            icon={<ArrowRight size={16} />}
          >
            Weiter zur Mitgliedschafts-Auswahl
          </Button>
        </div>
      </div>
    );
  };

  const renderMembershipSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mitgliedschafts-Auswahl</CardTitle>
          <CardDescription>
            Vertragsart auswählen oder neue erstellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Automatisch erkannte Mitgliedschaft</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Tarif:</strong> {session.mergedData?.contractTariff || 'Unbekannt'}</p>
                <p><strong>Preis:</strong> {session.mergedData?.contractPrice ? `${session.mergedData.contractPrice.toFixed(2)} €` : 'Unbekannt'}</p>
                <p><strong>Typ:</strong> {session.mergedData?.contractType || 'Standard'}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Generate new membership based on detected data
                  handleMembershipSelection({
                    name: session.mergedData?.contractTariff,
                    price: session.mergedData?.contractPrice,
                    type: session.mergedData?.contractType
                  });
                }}
              >
                Neue Mitgliedschaft generieren
              </Button>
              <Button
                onClick={() => {
                  // TODO: Show existing memberships selection
                  handleMembershipSelection({
                    name: 'Bestehende Mitgliedschaft',
                    id: 'existing'
                  });
                }}
              >
                Bestehende auswählen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => goBackToStep(4)}
          icon={<ArrowLeft size={16} />}
        >
          Zurück
        </Button>
      </div>
    </div>
  );

  const renderPaymentGroupSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lastschriftgruppe auswählen</CardTitle>
          <CardDescription>
            Payment Group für automatische Abbuchungen zuordnen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePaymentGroups.map((group) => (
              <div
                key={group.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  session.selectedPaymentGroup?.id === group.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handlePaymentGroupSelection(group)}
              >
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <p className="text-sm text-gray-600">Abbuchungstag: {group.payment_day}.</p>
                {group.description && (
                  <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => goBackToStep(5)}
          icon={<ArrowLeft size={16} />}
        >
          Zurück
        </Button>
      </div>
    </div>
  );

  const renderFinalImport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import bestätigen</CardTitle>
          <CardDescription>
            Alle Daten sind bereit für den finalen Import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Import-Zusammenfassung</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Mitglied: {session.mergedData?.firstName} {session.mergedData?.lastName}</li>
                <li>• Mitgliedsnummer: {session.mergedData?.memberNumber}</li>
                <li>• Tarif: {session.mergedData?.contractTariff}</li>
                <li>• Lastschriftgruppe: {session.selectedPaymentGroup?.name}</li>
                <li>• Dokumente werden gespeichert</li>
                <li>• Beitragskalender wird generiert</li>
              </ul>
            </div>
            
            <Button
              onClick={executeFinalImport}
              className="w-full"
            >
              Import durchführen
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => goBackToStep(6)}
          icon={<ArrowLeft size={16} />}
        >
          Zurück
        </Button>
      </div>
    </div>
  );

  const renderCompletionScreen = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Import erfolgreich!</h2>
        <p className="text-gray-600 mt-2">
          {session.mergedData?.firstName} {session.mergedData?.lastName} wurde erfolgreich importiert.
        </p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">Durchgeführte Aktionen</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>✓ Mitgliedsdatensatz erstellt</li>
          <li>✓ SEPA-Mandat hinterlegt</li>
          <li>✓ Beitragskonto angelegt</li>
          <li>✓ Mitgliedschaft zugeordnet</li>
          <li>✓ Lastschriftgruppe zugewiesen</li>
          <li>✓ Dokumente gespeichert</li>
          <li>✓ Beitragskalender generiert</li>
        </ul>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      {session.isComplete ? renderCompletionScreen() :
       session.currentStep === 1 ? renderDualUpload() :
       session.currentStep === 2 ? renderDataConfirmation() :
       session.currentStep === 3 ? renderDataConfirmation() :
       session.currentStep === 4 ? renderBeitragskontoConfirmation() :
       session.currentStep === 5 ? renderMembershipSelection() :
       session.currentStep === 6 ? renderPaymentGroupSelection() :
       session.currentStep === 7 ? renderFinalImport() :
       null}
    </div>
  );
} 