// Payment System TypeScript Interfaces
// Comprehensive type definitions for PDF extraction, SEPA processing, and member management

export interface ExtractedMemberData {
  // Basic member information
  firstName: string;
  lastName: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  email?: string;
  
  // Contract details
  memberNumber?: string;
  contractStartDate?: string;
  contractTariff?: string;
  contractPrice?: number;
  
  // Payment information
  iban?: string;
  mandateReference?: string;
  
  // Account data
  accountBalance?: number; // Negative = overpayment, Positive = debt
  
  // PDF metadata
  extractionSuccess: boolean;
  extractionErrors: string[];
  pdfType: 'contract' | 'statement' | 'unknown';
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
  | 'pause_fee';

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