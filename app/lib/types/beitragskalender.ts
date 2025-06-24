// TypeScript Types für Beitragskalender-System (24.06.2025)

export type BeitragskalenderStatus = 
  | 'scheduled'    // Geplant/Vorgemerkt
  | 'processing'   // In Bearbeitung
  | 'processed'    // Erfolgreich verarbeitet
  | 'failed'       // Fehlgeschlagen
  | 'cancelled'    // Storniert
  | 'suspended';   // Ausgesetzt (bei Pausierungen)

export type KalenderCreatedBy = 
  | 'auto_generator'   // Automatisch beim Vertragsabschluss
  | 'manual'          // Manuell durch Admin
  | 'contract_change' // Bei Vertragsänderung
  | 'module_addition' // Bei Modul-Hinzufügung
  | 'reactivation'    // Bei Reaktivierung
  | 'system_trigger'; // Systemgesteuert

export type BeitragskalenderTransactionType = 
  | 'membership_fee' 
  | 'pauschale' 
  | 'modul' 
  | 'setup_fee' 
  | 'penalty_fee';

export type PaymentSchedule = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BeitragskalenderEntry {
  id: string;
  
  // Referenzen
  member_id: string;
  vertrags_id?: string;
  zahllaufgruppe_id?: string;
  parent_entry_id?: string;
  
  // Kalender-Daten
  due_date: string; // ISO Date
  transaction_type: BeitragskalenderTransactionType;
  amount: number;
  description?: string;
  
  // Status und Verarbeitung
  status: BeitragskalenderStatus;
  created_by: KalenderCreatedBy;
  
  // Rekurrenz-Information
  is_recurring: boolean;
  recurrence_pattern?: PaymentSchedule;
  recurrence_end_date?: string; // ISO Date
  
  // Verarbeitungs-Details
  processed_at?: string; // ISO DateTime
  processing_result?: Record<string, any>;
  retry_count: number;
  error_message?: string;
  
  // Sales-Tool Integration
  sales_tool_reference_id?: string;
  sales_tool_origin?: string;
  business_logic_trigger?: string;
  
  // Zusatz-Informationen
  notes?: string;
  tags?: string;
  priority: number;
  
  // Audit-Felder
  created_at: string; // ISO DateTime
  updated_at: string; // ISO DateTime
  created_by_user?: string;
  updated_by_user?: string;
}

export interface BeitragskalenderOverview extends BeitragskalenderEntry {
  // Berechnete Felder aus der DB-View
  effective_status: 'overdue' | 'due_today' | 'upcoming' | BeitragskalenderStatus;
  days_until_due: number;
  due_month: string; // YYYY-MM Format
  due_year: string;  // YYYY Format
}

export interface BeitragskalenderConfig {
  member_id: string;
  vertrags_id: string;
  start_date: string; // ISO Date
  end_date: string; // ISO Date
  payment_schedule: PaymentSchedule;
  base_amount: number;
  transaction_types: BeitragskalenderTransactionType[];
  zahllaufgruppe_id?: string;
  auto_generate: boolean;
}

export interface BeitragskalenderResult {
  success: boolean;
  created_entries: BeitragskalenderEntry[];
  total_amount: number;
  schedule_summary: {
    frequency: PaymentSchedule;
    duration_months: number;
    entries_count: number;
    next_due_date: string;
  };
  error?: string;
}

export interface BeitragskalenderStatistics {
  total_entries: number;
  scheduled_count: number;
  processed_count: number;
  failed_count: number;
  overdue_count: number;
  
  total_scheduled_amount: number;
  total_processed_amount: number;
  
  next_due_date?: string;
  upcoming_7_days: number;
  upcoming_30_days: number;
  
  by_transaction_type: {
    type: BeitragskalenderTransactionType;
    count: number;
    total_amount: number;
  }[];
  
  by_status: {
    status: BeitragskalenderStatus;
    count: number;
    percentage: number;
  }[];
}

export interface MemberBeitragskalenderSummary {
  member_id: string;
  member_name: string;
  
  total_entries: number;
  scheduled_amount: number;
  processed_amount: number;
  
  next_due_date?: string;
  next_due_amount?: number;
  
  overdue_entries: number;
  overdue_amount: number;
  
  last_processed_date?: string;
  last_processed_amount?: number;
  
  contract_end_date?: string;
  remaining_payments: number;
}

export interface BeitragskalenderFilters {
  member_ids?: string[];
  vertrags_ids?: string[];
  zahllaufgruppe_ids?: string[];
  
  status?: BeitragskalenderStatus[];
  transaction_types?: BeitragskalenderTransactionType[];
  created_by?: KalenderCreatedBy[];
  
  due_date_from?: string; // ISO Date
  due_date_to?: string;   // ISO Date
  
  amount_min?: number;
  amount_max?: number;
  
  is_recurring?: boolean;
  is_overdue?: boolean;
  
  search_query?: string; // Suche in description, notes, tags
  
  // Sortierung
  sort_by?: 'due_date' | 'amount' | 'created_at' | 'status';
  sort_order?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  page_size?: number;
}

export interface BeitragskalenderListResponse {
  entries: BeitragskalenderOverview[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  
  statistics: BeitragskalenderStatistics;
  filters_applied: BeitragskalenderFilters;
}

// API Request/Response Types
export interface CreateBeitragskalenderEntryRequest {
  member_id: string;
  vertrags_id?: string;
  due_date: string;
  transaction_type: BeitragskalenderTransactionType;
  amount: number;
  description?: string;
  zahllaufgruppe_id?: string;
  recurrence_pattern?: PaymentSchedule;
  recurrence_end_date?: string;
  notes?: string;
  tags?: string;
  priority?: number;
}

export interface UpdateBeitragskalenderEntryRequest {
  due_date?: string;
  amount?: number;
  description?: string;
  status?: BeitragskalenderStatus;
  zahllaufgruppe_id?: string;
  notes?: string;
  tags?: string;
  priority?: number;
}

export interface GenerateBeitragskalenderRequest {
  member_id: string;
  vertrags_id: string;
  start_date: string;
  end_date: string;
  base_amount: number;
  transaction_types: BeitragskalenderTransactionType[];
  payment_schedule: PaymentSchedule;
  zahllaufgruppe_id?: string;
}

export interface ProcessBeitragskalenderRequest {
  entry_ids: string[];
  processing_date?: string; // ISO Date, default: heute
  force_process?: boolean;  // Ignoriere Status-Checks
  notes?: string;
}

export interface ProcessBeitragskalenderResponse {
  success: boolean;
  processed_count: number;
  failed_count: number;
  results: {
    entry_id: string;
    success: boolean;
    error?: string;
    processed_amount?: number;
  }[];
  total_processed_amount: number;
  processing_summary: string;
}

// Bulk Operations
export interface BulkUpdateBeitragskalenderRequest {
  entry_ids: string[];
  updates: UpdateBeitragskalenderEntryRequest;
}

export interface BulkCancelBeitragskalenderRequest {
  entry_ids: string[];
  cancellation_reason: string;
  refund_processed_entries?: boolean;
}

// Hooks und Triggers
export interface BeitragskalenderTriggerEvent {
  trigger_type: 'member_created' | 'contract_changed' | 'module_added' | 'contract_cancelled' | 'payment_processed';
  member_id: string;
  vertrags_id?: string;
  trigger_data: Record<string, any>;
  timestamp: string;
}

export interface BeitragskalenderAutomationRule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  
  trigger_conditions: {
    trigger_types: BeitragskalenderTriggerEvent['trigger_type'][];
    member_criteria?: Record<string, any>;
    contract_criteria?: Record<string, any>;
  };
  
  actions: {
    action_type: 'generate_calendar' | 'update_calendar' | 'cancel_calendar' | 'extend_calendar';
    parameters: Record<string, any>;
  }[];
  
  created_at: string;
  updated_at: string;
}

export default BeitragskalenderEntry; 