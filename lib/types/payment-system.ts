// Payment System TypeScript Interfaces
// Comprehensive type definitions for PDF extraction, SEPA processing, and member management

export interface ExtractedMemberData {
  // Basic member information
  firstName: string;
  lastName: string;
  salutation?: string; // "Herr", "Frau", etc.
  birthDate?: string;
  address?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  email?: string;
  
  // Contract details - ERWEITERT für vollständige Vertragserfassung
  memberNumber?: string;
  contractNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractDuration?: string; // "24 Monate" / "unbefristet"
  trainingStartDate?: string; // Kann unterschiedlich zum Vertragsbeginn sein
  contractTariff?: string;
  contractPrice?: number;
  contractType?: string; // "Fitness", "Wellness", "Premium"
  
  // Extended contract details
  setupFee?: number; // Aufnahmegebühr
  administrationFee?: number; // Verwaltungsgebühr
  keyCardFee?: number; // Kartengebühr
  contractTerms?: string; // Kündigungsbedingungen
  noticePeriod?: string; // Kündigungsfrist
  minimumDuration?: string; // Mindestlaufzeit
  extensionPeriod?: string; // Verlängerungszeitraum
  extensionAmount?: number; // Betrag des Verlängerungszeitraums
  
  // Payment information - ERWEITERT
  iban?: string;
  bic?: string; // Bank Identifier Code
  bankName?: string; // Name der Bank
  accountHolder?: string; // Kontoinhaber (falls abweichend)
  mandateReference?: string;
  mandateSignedDate?: string;
  paymentInterval?: string; // "monatlich", "quartalsweise", "jährlich"
  paymentDay?: number; // Abbuchungstag im Monat
  
  // Special contract features
  hasFreezingOption?: boolean; // Stillegungsoption
  freezingFee?: number; // Stillegungsgebühr
  hasGuestPrivileges?: boolean; // Gastnutzung
  includedServices?: string[]; // Inkludierte Leistungen
  additionalModules?: ContractModule[]; // Zusatzmodule
  
  // Detected financial items
  detectedPauschalen?: DetectedPauschale[];
  detectedRuhezeiten?: DetectedRuhezeit[];
  detectedDiscounts?: DetectedDiscount[];
  
  // Account data
  accountBalance?: number; // Negative = overpayment, Positive = debt
  
  // Enhanced Calendar Data - Added 2025-01-03
  paidContributions?: ExtractedContribution[];
  futureContributions?: ExtractedContribution[];
  
  // PDF metadata
  extractionSuccess: boolean;
  extractionErrors: string[];
  pdfType: 'contract' | 'statement' | 'unknown';
  extractionConfidence?: number; // 0-100 Confidence score
}

export interface PaymentMember {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  address?: string;
  phone?: string;
  email?: string;
  contractStartDate?: Date;
  contractId?: string;
  paymentGroupId?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberAccount {
  id: string;
  paymentMemberId: string;
  iban: string;
  mandateReference: string;
  mandateSignedDate?: Date;
  currentBalance: number;
  lastPaymentDate?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 
  | 'membership_fee'
  | 'setup_fee' 
  | 'additional_service'
  | 'penalty_fee'
  | 'refund'
  | 'correction'
  | 'chargeback'
  | 'manual_adjustment'
  | 'pause_fee'
  | 'pauschale' // NEU: Erweitert für Beitragskonto-System (24.06.2025)
  | 'modul'; // NEU: Exklusive Module (24.06.2025)

export interface MemberTransaction {
  id: string;
  paymentMemberId: string;
  transactionType: TransactionType;
  amount: number;
  description?: string;
  referenceDate: Date;
  processedBy?: string;
  paymentRunId?: string;
  isReversed: boolean;
  reversalReason?: string;
  // NEU: Sales-Tool-Integration (24.06.2025)
  salesToolReferenceId?: string;
  salesToolOrigin?: 'sales_tool' | 'manual' | 'import' | 'automatic';
  businessLogicTrigger?: string; // 'stillegung', 'kuendigung', 'guthaben_verrechnung'
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentGroup {
  id: string;
  name: string;
  description?: string;
  paymentDay: number; // 1-31
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentRunStatus = 
  | 'draft'
  | 'ready' 
  | 'submitted'
  | 'processed'
  | 'failed'
  | 'cancelled';

export interface PaymentRun {
  id: string;
  name: string;
  paymentGroupId: string;
  executionDate: Date;
  status: PaymentRunStatus;
  totalAmount: number;
  itemCount: number;
  xmlFilePath?: string;
  processedBy: string;
  submittedAt?: Date;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRunItem {
  id: string;
  paymentRunId: string;
  memberAccountId: string;
  amount: number;
  description: string;
  mandateReference: string;
  status: 'pending' | 'processed' | 'failed' | 'returned';
  returnReason?: string;
  // NEU: Enhanced Status-Tracking für "Offen"-Berechnung (24.06.2025)
  partialPaymentAmount?: number;
  returnPartialAmount?: number;
  outstandingAmount?: number; // Computed: amount - partialPayment + returnAmount
  createdAt: Date;
  updatedAt: Date;
}

export interface StudioSettings {
  id: string;
  studioName: string;
  address: string;
  phone?: string;
  email?: string;
  sepaCreditorId: string;
  sepaCreditorName: string;
  bankName?: string;
  bankBic?: string;
  createdAt: Date;
  updatedAt: Date;
}

// PDF Processing Types
export interface PDFProcessingResult {
  memberData: ExtractedMemberData;
  rawText: string;
  processingTime: number;
  success: boolean;
  errors: string[];
}

export interface ValidationIssue {
  field: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface MemberValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  autoFixedFields: string[];
  requiredActions: string[];
}

// SEPA Export Types
export interface SEPAExportData {
  creditorId: string;
  creditorName: string;
  paymentDate: Date;
  transactions: SEPATransaction[];
}

export interface SEPATransaction {
  debtorName: string;
  debtorIban: string;
  amount: number;
  reference: string;
  mandateId: string;
  mandateSignedDate: Date;
}

export interface SEPAExportResult {
  xmlContent: string;
  fileName: string;
  totalAmount: number;
  transactionCount: number;
  success: boolean;
  errors: string[];
}

// Contract Matching Types
export interface ContractMatchResult {
  contractId?: string;
  confidence: number; // 0-100
  matchedOn: string[]; // ['name', 'price', 'duration']
  alternatives: ContractAlternative[];
  requiresManualReview: boolean;
}

export interface ContractAlternative {
  contractId: string;
  contractName: string;
  confidence: number;
  differences: string[];
}

// API Response Types
export interface PaymentSystemAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Form Data Types
export interface MemberUploadFormData {
  contractFile?: File;
  statementFile?: File;
  paymentGroupId?: string;
  notes?: string;
}

export interface PaymentRunFormData {
  name: string;
  paymentGroupId: string;
  executionDate: Date;
  notes?: string;
}

// Zusätzliche Interfaces für erweiterte Datenstrukturen
export interface ContractModule {
  name: string;
  price: number;
  interval: string; // "monatlich", "einmalig"
  description?: string;
}

export interface DetectedPauschale {
  type: string; // "setup", "administration", "keycard"
  amount: number;
  description: string;
  isOneTime: boolean;
}

export interface DetectedRuhezeit {
  startDate?: string;
  endDate?: string;
  fee?: number;
  reason?: string;
}

export interface DetectedDiscount {
  type: string; // "student", "family", "senior"
  amount: number;
  percentage?: number;
  validUntil?: string;
}

export interface ExtractedContribution {
  date?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  forderung?: number;
  offen?: number;
  type: string;
  description: string;
  status: 'paid' | 'future' | 'pending';
} 