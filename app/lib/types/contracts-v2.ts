// Vertragsarten V2 - TypeScript Definitionen
// Vollständige Type-Definitionen für das moderne Vertragssystem

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Contract {
  id: string;
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
  campaign_extension_date?: string;
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
  trigger_date?: string;
  trigger_day?: number;
  
  // Wiederholend-spezifisch
  repeat_interval?: 'monthly' | 'yearly';
  repeat_after_months?: number;
  
  // Preisanpassung
  adjustment_type: 'fixed_amount' | 'percentage';
  adjustment_value: number;
  
  // Gültigkeit
  valid_from?: string;
  valid_until?: string;
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
// MODULE SYSTEM
// ============================================================================

export interface ModuleCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ContractModule {
  id: string;
  name: string;
  description?: string;
  price_per_month: number;
  
  // Kategorisierung
  category_id?: string;
  category?: ModuleCategory;
  icon_name?: string;
  icon_file_asset_id?: string;
  
  // Status
  is_active: boolean;
  
  // Metadaten
  created_at: string;
  updated_at: string;
  
  // Zuordnungs-Statistiken (computed)
  assignments?: ContractModuleAssignment[];
  total_assignments?: number;
  included_count?: number;
  optional_count?: number;
}

export interface ContractModuleAssignment {
  id: string;
  contract_id: string;
  module_id: string;
  assignment_type: 'included' | 'optional';
  custom_price?: number;
  sort_order: number;
  created_at: string;
  
  // Relations
  contract?: Contract;
  module?: ContractModule;
}

// ============================================================================
// DOCUMENT SYSTEM
// ============================================================================

export interface ContractDocument {
  id: string;
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
  
  // Relations
  sections?: ContractDocumentSection[];
  assignments?: ContractDocumentAssignment[];
}

export interface ContractDocumentSection {
  id: string;
  document_id: string;
  title: string;
  content: string;
  sort_order: number;
  
  // Abschnitts-Eigenschaften
  is_mandatory: boolean;
  requires_signature: boolean;
  display_as_checkbox: boolean;
  
  // Bedingte Anzeige
  show_condition?: any; // JSONB
  
  created_at: string;
}

export interface ContractDocumentAssignment {
  id: string;
  contract_id: string;
  document_id: string;
  override_settings?: any; // JSONB
  created_at: string;
  
  // Relations
  contract?: Contract;
  document?: ContractDocument;
}

// ============================================================================
// EXTENDED TYPES
// ============================================================================

export interface ContractWithDetails extends Contract {
  terms?: ContractTerm[];
  pricing?: ContractPricing[];
  starter_packages?: ContractStarterPackage[];
  flat_rates?: ContractFlatRate[];
  modules?: ContractModuleAssignment[];
  documents?: ContractDocumentAssignment[];
  
  // Computed fields
  modules_included_count?: number;
  modules_optional_count?: number;
  pricing_rules_count?: number;
  total_base_price?: number;
}

export interface ModuleWithStats extends ContractModule {
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  total_assignments?: number;
  included_count?: number;
  optional_count?: number;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface ContractFormData {
  // Basis-Informationen
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
  
  // Module-Zuordnungen
  module_assignments: Array<{
    module_id: string;
    assignment_type: 'included' | 'optional';
    custom_price?: number;
  }>;
  
  // Startpakete
  starter_packages: Array<{
    name: string;
    description?: string;
    price: number;
    is_mandatory: boolean;
  }>;
  
  // Kampagnen-Einstellungen
  is_campaign_version: boolean;
  campaign_id?: string;
  campaign_extension_date?: string;
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
    is_mandatory: boolean;
    requires_signature: boolean;
    display_as_checkbox: boolean;
  }>;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ContractFilters {
  is_active?: boolean;
  is_campaign_version?: boolean;
  campaign_id?: string;
  search?: string;
}

export interface ModuleFilters {
  is_active?: boolean;
  category_id?: string;
  search?: string;
}

export interface DocumentFilters {
  is_active?: boolean;
  search?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ContractStatus = 'active' | 'inactive' | 'campaign';
export type ModuleAssignmentType = 'included' | 'optional';
export type DocumentSectionType = 'text' | 'signature' | 'checkbox';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface IconOption {
  name: string;
  component: any;
  category?: string;
}

// ============================================================================
// CAMPAIGN INTEGRATION
// ============================================================================

export interface CampaignContract {
  id: string;
  campaign_id: string;
  base_contract_id: string;
  campaign_contract_id: string;
  modifications: any; // JSONB
  start_date: string;
  end_date?: string;
  auto_revert: boolean;
  created_at: string;
}

// ============================================================================
// VERSIONING TYPES
// ============================================================================

export interface VersionInfo {
  version_number: number;
  version_note?: string;
  created_at: string;
  created_by?: string;
  changes_summary?: string;
  is_active: boolean;
  is_campaign_version: boolean;
}

export interface VersionComparison {
  field: string;
  old_value: any;
  new_value: any;
  change_type: 'added' | 'removed' | 'modified';
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkModuleAssignment {
  module_id: string;
  assignments: Array<{
    contract_id: string;
    assignment_type: 'included' | 'optional' | 'none';
    custom_price?: number;
  }>;
}

export interface BulkOperationResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    item_id: string;
    error_message: string;
  }>;
}

// ============================================================================
// IMPORT/EXPORT TYPES
// ============================================================================

export interface ContractExport {
  contract: Contract;
  terms: ContractTerm[];
  modules: ContractModuleAssignment[];
  documents: ContractDocumentAssignment[];
  pricing: ContractPricing[];
}

export interface ModuleExport {
  module: ContractModule;
  category: ModuleCategory;
  assignments: ContractModuleAssignment[];
}

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

export interface AuditLog {
  id: string;
  entity_type: 'contract' | 'module' | 'document';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'version_create';
  old_values?: any;
  new_values?: any;
  user_id?: string;
  created_at: string;
}

export interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  api_status: 'healthy' | 'warning' | 'error';
  last_check: string;
  issues: string[];
}