// Core Payment System Types
export interface PaymentMember {
  id: string;
  member_id: string; // FK to members table
  member_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  iban?: string;
  bic?: string;
  mandate_reference?: string;
  payment_group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MemberAccount {
  id: string;
  payment_member_id: string; // FK to payment_members
  current_balance: number;
  last_payment_date?: string;
  next_payment_due?: string;
  last_updated: string;
  created_at: string;
}

export interface MemberTransaction {
  id: string;
  payment_member_id: string; // FK to payment_members
  type: 'payment_received' | 'fee_charged' | 'correction' | 'refund' | 'adjustment';
  amount: number;
  description?: string;
  transaction_date: string;
  payment_run_id?: string; // FK to payment_runs (if part of SEPA run)
  created_by?: string;
  created_at: string;
}

export interface PaymentGroup {
  id: string;
  name: string;
  description?: string;
  payment_day: number; // Day of month (1-28)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentRun {
  id: string;
  name: string;
  payment_group_id: string; // FK to payment_groups
  run_date: string;
  status: 'draft' | 'prepared' | 'submitted' | 'completed' | 'failed';
  total_amount: number;
  member_count: number;
  sepa_xml_generated?: boolean;
  sepa_xml_path?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRunItem {
  id: string;
  payment_run_id: string; // FK to payment_runs
  payment_member_id: string; // FK to payment_members
  amount: number;
  status: 'pending' | 'processed' | 'failed' | 'cancelled';
  error_message?: string;
  processed_at?: string;
  created_at: string;
}

export interface StudioSettings {
  id: string;
  studio_name: string;
  studio_address?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_bic?: string;
  creditor_id?: string; // SEPA Creditor ID
  sepa_mandate_text?: string;
  payment_reference_prefix?: string;
  auto_payment_enabled: boolean;
  payment_retry_days: number;
  created_at: string;
  updated_at: string;
}

// PDF Processing Types
export interface ExtractedMemberData {
  // Contract Data
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  mandateReference?: string;
  contractStartDate?: string;
  contractTariff?: string;
  contractPrice?: number;
  contractDuration?: string;
  paymentInterval?: string;
  setupFee?: number;
  tariff?: string;
  price?: number;
  
  // Statement Data
  memberNumber?: string;
  accountBalance?: number;
  transactions?: ExtractedTransaction[];
  
  // Enhanced Calendar Data
  paidContributions?: ExtractedContribution[];
  futureContributions?: ExtractedContribution[];
  
  // Meta Data
  pdfType?: 'contract' | 'statement' | 'unknown';
  extractionConfidence?: number;
  errors?: string[];
  suggestions?: string[];
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

export interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type?: 'payment' | 'fee' | 'other';
}

export interface ContractMatchResult {
  contractTypeId?: string;
  contractTypeName?: string;
  suggestedPaymentGroupId?: string;
  confidence: number;
  matches: {
    tariffMatch: boolean;
    priceMatch: boolean;
    dateMatch: boolean;
  };
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Data Types
export interface CreateMemberTransactionData {
  payment_member_id: string;
  type: MemberTransaction['type'];
  amount: number;
  description?: string;
  transaction_date: string;
  payment_run_id?: string; // Optional FK to payment_runs
  created_by?: string;
}

export interface PaymentGroupFormData {
  name: string;
  description?: string;
  payment_day: number;
  is_active: boolean;
}

export interface PaymentRunFormData {
  name: string;
  payment_group_id: string;
  run_date: string;
}

// SEPA Export Types
export interface SEPAExportData {
  creditorName: string;
  creditorIBAN: string;
  creditorBIC: string;
  creditorId: string;
  executionDate: string;
  transactions: SEPATransaction[];
}

export interface SEPATransaction {
  endToEndId: string;
  debtorName: string;
  debtorIBAN: string;
  debtorBIC?: string;
  mandateId: string;
  mandateSignatureDate: string;
  amount: number;
  remittanceInfo: string;
}

// Statistics Types
export interface PaymentStatistics {
  totalMembers: number;
  activeAccounts: number;
  totalBalance: number;
  pendingPayments: number;
  monthlyRevenue: number;
  overdueAccounts: number;
}

export interface MemberPaymentSummary {
  memberId: string;
  memberName: string;
  memberNumber: string;
  currentBalance: number;
  lastPaymentDate?: string;
  totalPaid: number;
  accountStatus: 'current' | 'overdue' | 'credit';
  paymentGroup?: string;
}

// File Processing Types
export interface ProcessedFile {
  filename: string;
  fileType: 'contract' | 'statement' | 'unknown';
  status: 'processed' | 'error' | 'pending';
  extractedData?: ExtractedMemberData;
  matchResult?: ContractMatchResult;
  errorMessage?: string;
  processingTime?: number;
}

export interface BulkImportResult {
  successCount: number;
  errorCount: number;
  processedFiles: ProcessedFile[];
  summary: {
    newMembers: number;
    updatedAccounts: number;
    skippedFiles: number;
  };
} 