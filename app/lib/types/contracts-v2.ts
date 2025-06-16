// Types für Vertragsarten-System V2
// Vollständige TypeScript-Definitionen für alle neuen Entitäten

// ============================================================================
// CORE CONTRACT TYPES
// ============================================================================

export interface Contract {
  id: string;
  
  // Versionierungs-System
  contract_group_id: string;
  version_number: number;
  version_note?: string;
  is_active: boolean;
  created_from_version_id?: string;
  
  // Basis-Informationen
  name: string;
  description?: string;
  
  // Kampagnen-System
  is_campaign_version: boolean;
  campaign_id?: string;
  campaign_extension_date?: string; // ISO Date
  base_version_id?: string;
  auto_reactivate_version_id?: string;
  
  // Vertragsbedingungen
  auto_renew: boolean;
  renewal_term_months?: number;
  cancellation_period: number;
  cancellation_unit: 'days' | 'months';
  
  // Rabatte
  group_discount_enabled: boolean;
  group_discount_type?: 'percent' | 'fixed';
  group_discount_value?: number;
  
  // Zahlungseinstellungen
  payment_runs?: string;
  payment_methods?: string[];
  
  // Metadaten
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Beziehungen (optional geladen)
  terms?: ContractTerm[];
  pricing_rules?: ContractPricing[];
  starter_packages?: ContractStarterPackage[];
  flat_rates?: ContractFlatRate[];
  modules?: ContractModuleAssignment[];
  documents?: ContractDocumentAssignment[];
  campaign?: Campaign;
}

export interface ContractTerm {
  id: string;
  contract_id: string;
  duration_months: number;
  base_price: number;
  sort_order: number;
  created_at: string;
}

export interface ContractPricing {
  id: string;
  contract_id: string;
  name: string;
  pricing_type: 'einmalig' | 'stichtag' | 'wiederholend';
  
  // Stichtag-spezifisch
  trigger_type?: 'monthly_first' | 'manual_date';
  trigger_date?: string; // ISO Date
  trigger_day?: number; // 1-31
  
  // Wiederholend-spezifisch
  repeat_interval?: 'monthly' | 'yearly';
  repeat_after_months?: number;
  
  // Preisanpassung
  adjustment_type: 'fixed_amount' | 'percentage';
  adjustment_value: number;
  
  // Gültigkeit
  valid_from?: string; // ISO Date
  valid_until?: string; // ISO Date
  is_active: boolean;
  
  created_at: string;
}

export interface ContractStarterPackage {
  id: string;
  contract_id: string;
  name: string;
  description?: string;
  price: number;
  is_mandatory: boolean;
  sort_order: number;
  created_at: string;
}

export interface ContractFlatRate {
  id: string;
  contract_id: string;
  name: string;
  description?: string;
  price: number;
  billing_type: 'monthly' | 'yearly' | 'once';
  is_mandatory: boolean;
  sort_order: number;
  created_at: string;
}

// ============================================================================
// MODULE SYSTEM TYPES
// ============================================================================

export interface ModuleCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Lucide Icon Name
  color?: string; // Tailwind Color
  sort_order: number;
  is_active: boolean;
  created_at: string;
  
  // Computed
  module_count?: number;
}

export interface ContractModule {
  id: string;
  name: string;
  description?: string;
  price_per_month: number;
  
  // Kategorisierung
  category_id?: string;
  icon_name?: string; // Lucide Icon
  icon_file_asset_id?: string; // Custom Icon
  
  // Status
  is_active: boolean;
  
  // Metadaten
  created_at: string;
  updated_at: string;
  
  // Beziehungen (optional geladen)
  category?: ModuleCategory;
  assignments?: ContractModuleAssignment[];
  assignment_stats?: {
    included: number;
    optional: number;
    total_contracts: number;
  };
}

export interface ContractModuleAssignment {
  id: string;
  contract_id: string;
  module_id: string;
  assignment_type: 'included' | 'optional';
  custom_price?: number; // Überschreibt Modulpreis
  sort_order: number;
  created_at: string;
  
  // Beziehungen (optional geladen)
  contract?: Contract;
  module?: ContractModule;
}

// ============================================================================
// DOCUMENT SYSTEM TYPES
// ============================================================================

export interface ContractDocument {
  id: string;
  
  // Dokument-Info
  name: string;
  description?: string;
  
  // Versionierung
  document_group_id: string;
  version_number: number;
  version_note?: string;
  is_active: boolean;
  created_from_version_id?: string;
  
  // Anzeige-Optionen
  show_payment_calendar: boolean;
  show_service_content: boolean;
  show_member_data: boolean;
  
  // Template-Einstellungen
  header_template?: string;
  footer_template?: string;
  css_styles?: string;
  
  created_at: string;
  updated_at: string;
  
  // Beziehungen (optional geladen)
  sections?: ContractDocumentSection[];
  contract_assignments?: ContractDocumentAssignment[];
}

export interface ContractDocumentSection {
  id: string;
  document_id: string;
  title: string;
  content: string; // HTML Content
  sort_order: number;
  
  // Eigenschaften
  is_mandatory: boolean;
  requires_signature: boolean;
  display_as_checkbox: boolean;
  
  // Bedingte Anzeige
  show_condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: any;
  };
  
  created_at: string;
}

export interface ContractDocumentAssignment {
  id: string;
  contract_id: string;
  document_id: string;
  
  // Überschreibungen
  override_settings?: {
    show_payment_calendar?: boolean;
    show_service_content?: boolean;
    show_member_data?: boolean;
    custom_header?: string;
    custom_footer?: string;
  };
  
  created_at: string;
  
  // Beziehungen (optional geladen)
  contract?: Contract;
  document?: ContractDocument;
}

// ============================================================================
// FORM & UI TYPES
// ============================================================================

export interface ContractFormData {
  // Basis-Info
  name: string;
  description?: string;
  
  // Laufzeiten
  terms: Array<{
    duration_months: number;
    base_price: number;
  }>;
  
  // Vertragsbedingungen
  auto_renew: boolean;
  renewal_term_months?: number;
  cancellation_period: number;
  cancellation_unit: 'days' | 'months';
  
  // Rabatte
  group_discount_enabled: boolean;
  group_discount_type?: 'percent' | 'fixed';
  group_discount_value?: number;
  
  // Zahlungseinstellungen
  payment_runs?: string;
  payment_methods?: string[];
  
  // Module
  modules_included: string[];
  modules_optional: string[];
  
  // Preisdynamiken
  pricing_rules?: Omit<ContractPricing, 'id' | 'contract_id' | 'created_at'>[];
  
  // Startpakete & Pauschalen
  starter_packages?: Omit<ContractStarterPackage, 'id' | 'contract_id' | 'created_at'>[];
  flat_rates?: Omit<ContractFlatRate, 'id' | 'contract_id' | 'created_at'>[];
  
  // Kampagne (falls Kampagnenvertrag)
  is_campaign_version?: boolean;
  campaign_id?: string;
  base_version_id?: string;
}

export interface ModuleFormData {
  name: string;
  description?: string;
  price_per_month: number;
  category_id?: string;
  icon_name?: string;
  icon_file_asset_id?: string;
  is_active: boolean;
}

export interface DocumentFormData {
  name: string;
  description?: string;
  show_payment_calendar: boolean;
  show_service_content: boolean;
  show_member_data: boolean;
  header_template?: string;
  footer_template?: string;
  css_styles?: string;
  
  sections: Array<{
    title: string;
    content: string;
    sort_order: number;
    is_mandatory: boolean;
    requires_signature: boolean;
    display_as_checkbox: boolean;
    show_condition?: ContractDocumentSection['show_condition'];
  }>;
}

// ============================================================================
// VERSIONING & CAMPAIGN TYPES
// ============================================================================

export interface ContractVersion {
  id: string;
  contract_group_id: string;
  version_number: number;
  version_note?: string;
  is_active: boolean;
  is_campaign_version: boolean;
  campaign_id?: string;
  created_at: string;
  created_by?: string;
  
  // Computed
  version_display: string; // "v2.1"
  is_current: boolean;
  type: 'Standard' | 'Kampagne';
  campaign_name?: string;
}

export interface VersionComparison {
  version1: Contract;
  version2: Contract;
  differences: {
    basic_info: Array<{
      field: string;
      old_value: any;
      new_value: any;
    }>;
    pricing: Array<{
      type: 'added' | 'removed' | 'changed';
      term?: ContractTerm;
      old_price?: number;
      new_price?: number;
    }>;
    modules: Array<{
      type: 'added' | 'removed' | 'changed';
      module: ContractModule;
      old_assignment?: 'included' | 'optional';
      new_assignment?: 'included' | 'optional';
    }>;
    conditions: Array<{
      field: string;
      old_value: any;
      new_value: any;
    }>;
  };
  change_summary: string;
}

export interface CampaignContract {
  id: string;
  base_contract: Contract;
  campaign: Campaign;
  modifications: Partial<ContractFormData>;
  is_active: boolean;
  auto_activation_date?: string;
  auto_deactivation_date?: string;
  extension_date?: string;
}

// ============================================================================
// BULK OPERATIONS TYPES
// ============================================================================

export interface ModuleAssignment {
  contractId: string;
  contractName: string;
  currentType: 'none' | 'included' | 'optional';
  newType: 'none' | 'included' | 'optional';
  customPrice?: number;
  standardPrice: number;
}

export interface BulkAssignmentResult {
  success: boolean;
  modified_contracts: number;
  errors?: string[];
}

export interface ModuleBulkUpdate {
  module_id: string;
  assignments: Array<{
    contract_id: string;
    assignment_type: 'included' | 'optional' | null;
    custom_price?: number;
  }>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ContractWithDetails extends Contract {
  terms: ContractTerm[];
  modules_included_count: number;
  modules_optional_count: number;
  pricing_rules_count: number;
  
  // Erweiterte Beziehungen
  modules_included: Array<ContractModule & {
    assignment: ContractModuleAssignment;
  }>;
  modules_optional: Array<ContractModule & {
    assignment: ContractModuleAssignment;
  }>;
}

export interface ModuleWithStats extends ContractModule {
  assignment_stats: {
    included: number;
    optional: number;
    total_contracts: number;
    contracts: Array<{
      id: string;
      name: string;
      assignment_type: 'included' | 'optional';
      custom_price?: number;
    }>;
  };
}

// ============================================================================
// PDF GENERATION TYPES
// ============================================================================

export interface PDFGenerationOptions {
  document: ContractDocument;
  member?: Member;
  contract?: Contract;
  membership?: Membership;
  outputPath?: string;
}

export interface PreviewContext {
  member?: Member;
  contract?: Contract;
  membership?: Membership;
}

export interface DocumentVariable {
  key: string;
  label: string;
  description: string;
  generator: (context: PreviewContext) => string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ContractStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type PricingType = 'einmalig' | 'stichtag' | 'wiederholend';
export type AdjustmentType = 'fixed_amount' | 'percentage';
export type AssignmentType = 'included' | 'optional';
export type BillingType = 'monthly' | 'yearly' | 'once';
export type CancellationUnit = 'days' | 'months';

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Filter & Search Types
export interface ContractFilters {
  status?: ContractStatus[];
  is_campaign_version?: boolean;
  campaign_id?: string;
  has_modules?: boolean;
  search?: string;
}

export interface ModuleFilters {
  category_id?: string;
  is_active?: boolean;
  price_range?: {
    min?: number;
    max?: number;
  };
  search?: string;
}

// Import/Export Types
export interface ContractExport {
  contract: Contract;
  terms: ContractTerm[];
  modules: ContractModuleAssignment[];
  pricing_rules: ContractPricing[];
  starter_packages: ContractStarterPackage[];
  flat_rates: ContractFlatRate[];
}

export interface ModuleExport {
  module: ContractModule;
  category: ModuleCategory;
  assignments: Array<{
    contract_name: string;
    assignment_type: AssignmentType;
    custom_price?: number;
  }>;
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Für Rückwärtskompatibilität mit altem contract_types System
export interface LegacyContractType {
  id: string;
  name: string;
  description?: string;
  term: number;
  price_per_month: number;
  bonus_period: number;
  auto_renew: boolean;
  renewal_term?: number;
  has_group_discount: boolean;
  group_discount_rate?: number;
  has_paid_modules: boolean;
  has_free_modules: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EXTERNAL DEPENDENCIES (from other modules)
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Member {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  address?: string;
  birthdate?: string;
}

export interface Membership {
  id: string;
  member_id: string;
  contract_id: string;
  term: number;
  start_date: string;
  end_date: string;
  monthly_price: number;
  status: string;
}