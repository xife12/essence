// Vertragsarten V2 - API Layer
// Vollständige API-Implementierung für das moderne Vertragssystem

import supabase from '../supabaseClient';
import type {
  Contract,
  ContractWithDetails,
  ContractTerm,
  ContractPricing,
  ContractStarterPackage,
  ContractFlatRate,
  ContractModule,
  ModuleWithStats,
  ModuleCategory,
  ContractModuleAssignment,
  ContractDocument,
  ContractDocumentSection,
  ContractDocumentAssignment,
  ContractFormData,
  ModuleFormData,
  DocumentFormData,
  ContractFilters,
  ModuleFilters,
  DocumentFilters,
  ApiResponse,
  PaginatedResponse,
  BulkModuleAssignment,
  BulkOperationResult,
  ValidationResult,
  VersionInfo,
  ContractExport,
  ModuleExport
} from '../types/contracts-v2';

// ============================================================================
// CONTRACTS API
// ============================================================================

export class ContractsV2API {
  
  // =====================================
  // CONTRACTS
  // =====================================

  /**
   * Alle Verträge abrufen mit optionaler Filterung
   */
  static async getContracts(
    filters: ContractFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ContractWithDetails>> {
    try {
      let query = supabase
        .from('contracts')
        .select(`
          *,
          terms:contract_terms(duration_months, base_price, sort_order),
          modules:contract_module_assignments(
            assignment_type,
            custom_price,
            module:contract_modules(name, price_per_month, category_id)
          ),
          documents:contract_document_assignments(
            document:contract_documents(name, version_number)
          ),
          pricing:contract_pricing(name, adjustment_value, is_active)
        `, { count: 'exact' });

      // Filter anwenden
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.is_campaign_version !== undefined) {
        query = query.eq('is_campaign_version', filters.is_campaign_version);
      }
      if (filters.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Paginierung
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Sortierung
      query = query.order('updated_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      // Computed fields hinzufügen
      const contractsWithDetails: ContractWithDetails[] = (data || []).map(contract => ({
        ...contract,
        modules_included_count: contract.modules?.filter(m => m.assignment_type === 'included').length || 0,
        modules_optional_count: contract.modules?.filter(m => m.assignment_type === 'optional').length || 0,
        pricing_rules_count: contract.pricing?.filter(p => p.is_active).length || 0,
        total_base_price: contract.terms?.reduce((sum, term) => sum + term.base_price, 0) || 0
      }));

      return {
        data: contractsWithDetails,
        count: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Einzelnen Vertrag mit allen Details abrufen
   */
  static async getContract(id: string): Promise<ApiResponse<ContractWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          terms:contract_terms(*),
          modules:contract_module_assignments(
            *,
            module:contract_modules(
              *,
              category:module_categories(name, icon, color)
            )
          ),
          documents:contract_document_assignments(
            *,
            document:contract_documents(*)
          ),
          pricing:contract_pricing(*),
          starter_packages:contract_starter_packages(*),
          flat_rates:contract_flat_rates(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Computed fields hinzufügen
      const contractWithDetails: ContractWithDetails = {
        ...data,
        modules_included_count: data.modules?.filter(m => m.assignment_type === 'included').length || 0,
        modules_optional_count: data.modules?.filter(m => m.assignment_type === 'optional').length || 0,
        pricing_rules_count: data.pricing?.filter(p => p.is_active).length || 0,
        total_base_price: data.terms?.reduce((sum, term) => sum + term.base_price, 0) || 0
      };

      return { data: contractWithDetails };
    } catch (error) {
      console.error('Error fetching contract:', error);
      return { error: error.message };
    }
  }

  /**
   * Neuen Vertrag erstellen
   */
  static async createContract(formData: ContractFormData): Promise<ApiResponse<Contract>> {
    try {
      // Transaction verwenden für atomare Operation
      const { data: contractData, error: contractError } = await supabase.rpc(
        'create_contract_with_details',
        {
          contract_data: {
            name: formData.name,
            description: formData.description,
            auto_renew: formData.auto_renew,
            renewal_term_months: formData.renewal_term_months,
            cancellation_period: formData.cancellation_period,
            cancellation_unit: formData.cancellation_unit,
            group_discount_enabled: formData.group_discount_enabled,
            group_discount_type: formData.group_discount_type,
            group_discount_value: formData.group_discount_value,
            is_campaign_version: formData.is_campaign_version,
            campaign_id: formData.campaign_id,
            campaign_extension_date: formData.campaign_extension_date,
            base_version_id: formData.base_version_id
          },
          terms_data: formData.terms,
          module_assignments_data: formData.module_assignments,
          starter_packages_data: formData.starter_packages
        }
      );

      if (contractError) throw contractError;

      return { data: contractData, message: 'Vertrag erfolgreich erstellt' };
    } catch (error) {
      console.error('Error creating contract:', error);
      return { error: error.message };
    }
  }

  /**
   * Vertrag aktualisieren
   */
  static async updateContract(id: string, formData: Partial<ContractFormData>): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase.rpc(
        'update_contract_with_details',
        {
          contract_id: id,
          contract_data: formData
        }
      );

      if (error) throw error;

      return { data, message: 'Vertrag erfolgreich aktualisiert' };
    } catch (error) {
      console.error('Error updating contract:', error);
      return { error: error.message };
    }
  }

  /**
   * Vertrag löschen (Soft Delete)
   */
  static async deleteContract(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      return { message: 'Vertrag erfolgreich deaktiviert' };
    } catch (error) {
      console.error('Error deleting contract:', error);
      return { error: error.message };
    }
  }

  /**
   * Neue Vertragsversion erstellen
   */
  static async createContractVersion(
    baseId: string, 
    versionNote?: string,
    modifications?: Partial<ContractFormData>
  ): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase.rpc(
        'create_contract_version',
        {
          base_contract_id: baseId,
          version_note: versionNote,
          modifications: modifications || {}
        }
      );

      if (error) throw error;

      return { data, message: 'Neue Vertragsversion erstellt' };
    } catch (error) {
      console.error('Error creating contract version:', error);
      return { error: error.message };
    }
  }

  /**
   * Versionshistorie abrufen
   */
  static async getContractVersions(contractGroupId: string): Promise<ApiResponse<VersionInfo[]>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('version_number, version_note, created_at, is_active, is_campaign_version, campaign_id')
        .eq('contract_group_id', contractGroupId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching contract versions:', error);
      return { error: error.message };
    }
  }

  // =====================================
  // MODULES
  // =====================================

  /**
   * Alle Module abrufen mit Statistiken
   */
  static async getModules(
    filters: ModuleFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ModuleWithStats>> {
    try {
      let query = supabase
        .from('contract_modules')
        .select(`
          *,
          category:module_categories(name, icon, color),
          assignments:contract_module_assignments(
            assignment_type,
            contract:contracts(name, is_active)
          )
        `, { count: 'exact' });

      // Filter anwenden
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Paginierung
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      query = query.order('name');

      const { data, error, count } = await query;

      if (error) throw error;

      // Statistiken hinzufügen
      const modulesWithStats: ModuleWithStats[] = (data || []).map(module => {
        const activeAssignments = module.assignments?.filter(a => a.contract?.is_active) || [];
        return {
          ...module,
          category_name: module.category?.name,
          category_icon: module.category?.icon,
          category_color: module.category?.color,
          total_assignments: activeAssignments.length,
          included_count: activeAssignments.filter(a => a.assignment_type === 'included').length,
          optional_count: activeAssignments.filter(a => a.assignment_type === 'optional').length
        };
      });

      return {
        data: modulesWithStats,
        count: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  }

  /**
   * Modul erstellen
   */
  static async createModule(formData: ModuleFormData): Promise<ApiResponse<ContractModule>> {
    try {
      const { data, error } = await supabase
        .from('contract_modules')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      return { data, message: 'Modul erfolgreich erstellt' };
    } catch (error) {
      console.error('Error creating module:', error);
      return { error: error.message };
    }
  }

  /**
   * Modul aktualisieren
   */
  static async updateModule(id: string, formData: Partial<ModuleFormData>): Promise<ApiResponse<ContractModule>> {
    try {
      const { data, error } = await supabase
        .from('contract_modules')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, message: 'Modul erfolgreich aktualisiert' };
    } catch (error) {
      console.error('Error updating module:', error);
      return { error: error.message };
    }
  }

  /**
   * Modul löschen
   */
  static async deleteModule(id: string): Promise<ApiResponse<void>> {
    try {
      // Prüfen ob Modul verwendet wird
      const { data: assignments } = await supabase
        .from('contract_module_assignments')
        .select('id')
        .eq('module_id', id)
        .limit(1);

      if (assignments && assignments.length > 0) {
        return { error: 'Modul kann nicht gelöscht werden - es wird in Verträgen verwendet' };
      }

      const { error } = await supabase
        .from('contract_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Modul erfolgreich gelöscht' };
    } catch (error) {
      console.error('Error deleting module:', error);
      return { error: error.message };
    }
  }

  /**
   * Bulk-Modulzuordnung
   */
  static async bulkAssignModules(assignments: BulkModuleAssignment[]): Promise<ApiResponse<BulkOperationResult>> {
    try {
      const { data, error } = await supabase.rpc(
        'bulk_assign_modules',
        { assignments_data: assignments }
      );

      if (error) throw error;

      return { data, message: 'Bulk-Zuordnung erfolgreich durchgeführt' };
    } catch (error) {
      console.error('Error bulk assigning modules:', error);
      return { error: error.message };
    }
  }

  // =====================================
  // MODULE CATEGORIES
  // =====================================

  /**
   * Alle Modulkategorien abrufen
   */
  static async getModuleCategories(): Promise<ApiResponse<ModuleCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('module_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      console.error('Error fetching module categories:', error);
      return { error: error.message };
    }
  }

  /**
   * Modulkategorie erstellen
   */
  static async createModuleCategory(categoryData: Omit<ModuleCategory, 'id' | 'created_at'>): Promise<ApiResponse<ModuleCategory>> {
    try {
      const { data, error } = await supabase
        .from('module_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      return { data, message: 'Kategorie erfolgreich erstellt' };
    } catch (error) {
      console.error('Error creating module category:', error);
      return { error: error.message };
    }
  }

  // =====================================
  // DOCUMENTS
  // =====================================

  /**
   * Alle Dokumente abrufen
   */
  static async getDocuments(
    filters: DocumentFilters = {},
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ContractDocument>> {
    try {
      let query = supabase
        .from('contract_documents')
        .select(`
          *,
          sections:contract_document_sections(id, title, is_mandatory),
          assignments:contract_document_assignments(
            contract:contracts(name, is_active)
          )
        `, { count: 'exact' });

      // Filter anwenden
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Paginierung
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      query = query.order('updated_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Dokument erstellen
   */
  static async createDocument(formData: DocumentFormData): Promise<ApiResponse<ContractDocument>> {
    try {
      const { data, error } = await supabase.rpc(
        'create_document_with_sections',
        {
          document_data: {
            name: formData.name,
            description: formData.description,
            show_payment_calendar: formData.show_payment_calendar,
            show_service_content: formData.show_service_content,
            show_member_data: formData.show_member_data,
            header_template: formData.header_template,
            footer_template: formData.footer_template,
            css_styles: formData.css_styles
          },
          sections_data: formData.sections
        }
      );

      if (error) throw error;

      return { data, message: 'Dokument erfolgreich erstellt' };
    } catch (error) {
      console.error('Error creating document:', error);
      return { error: error.message };
    }
  }

  // =====================================
  // VALIDATION
  // =====================================

  /**
   * Vertragsdaten validieren
   */
  static validateContract(formData: ContractFormData): ValidationResult {
    const errors: string[] = [];

    // Basis-Validierung
    if (!formData.name?.trim()) {
      errors.push('Name ist erforderlich');
    }

    if (formData.name && formData.name.length > 100) {
      errors.push('Name darf maximal 100 Zeichen lang sein');
    }

    // Laufzeiten validieren
    if (!formData.terms || formData.terms.length === 0) {
      errors.push('Mindestens eine Laufzeit ist erforderlich');
    } else {
      formData.terms.forEach((term, index) => {
        if (term.duration_months <= 0) {
          errors.push(`Laufzeit ${index + 1}: Dauer muss größer als 0 sein`);
        }
        if (term.base_price < 0) {
          errors.push(`Laufzeit ${index + 1}: Preis darf nicht negativ sein`);
        }
      });
    }

    // Kündigungsfrist validieren
    if (formData.cancellation_period < 0) {
      errors.push('Kündigungsfrist darf nicht negativ sein');
    }

    // Gruppenrabatt validieren
    if (formData.group_discount_enabled) {
      if (!formData.group_discount_type) {
        errors.push('Rabatttyp ist erforderlich wenn Gruppenrabatt aktiviert ist');
      }
      if (!formData.group_discount_value || formData.group_discount_value <= 0) {
        errors.push('Rabattwert muss größer als 0 sein');
      }
      if (formData.group_discount_type === 'percent' && formData.group_discount_value > 100) {
        errors.push('Prozentualer Rabatt darf nicht über 100% liegen');
      }
    }

    // Kampagnen-Validierung
    if (formData.is_campaign_version) {
      if (!formData.campaign_id) {
        errors.push('Kampagne ist erforderlich für Kampagnenverträge');
      }
      if (!formData.base_version_id) {
        errors.push('Basisversion ist erforderlich für Kampagnenverträge');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Moduldaten validieren
   */
  static validateModule(formData: ModuleFormData): ValidationResult {
    const errors: string[] = [];

    if (!formData.name?.trim()) {
      errors.push('Name ist erforderlich');
    }

    if (formData.name && formData.name.length > 100) {
      errors.push('Name darf maximal 100 Zeichen lang sein');
    }

    if (formData.price_per_month < 0) {
      errors.push('Preis darf nicht negativ sein');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // =====================================
  // IMPORT/EXPORT
  // =====================================

  /**
   * Vertrag exportieren
   */
  static async exportContract(id: string): Promise<ApiResponse<ContractExport>> {
    try {
      const contractResponse = await this.getContract(id);
      if (contractResponse.error || !contractResponse.data) {
        return { error: contractResponse.error || 'Vertrag nicht gefunden' };
      }

      const exportData: ContractExport = {
        contract: contractResponse.data,
        terms: contractResponse.data.terms || [],
        modules: contractResponse.data.modules || [],
        documents: contractResponse.data.documents || [],
        pricing: contractResponse.data.pricing || []
      };

      return { data: exportData };
    } catch (error) {
      console.error('Error exporting contract:', error);
      return { error: error.message };
    }
  }

  /**
   * Modul exportieren
   */
  static async exportModule(id: string): Promise<ApiResponse<ModuleExport>> {
    try {
      const { data: module, error } = await supabase
        .from('contract_modules')
        .select(`
          *,
          category:module_categories(*),
          assignments:contract_module_assignments(
            *,
            contract:contracts(name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const exportData: ModuleExport = {
        module,
        category: module.category,
        assignments: module.assignments || []
      };

      return { data: exportData };
    } catch (error) {
      console.error('Error exporting module:', error);
      return { error: error.message };
    }
  }

  // =====================================
  // STATISTICS
  // =====================================

  /**
   * Dashboard-Statistiken abrufen
   */
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.rpc('get_contracts_dashboard_stats');

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { error: error.message };
    }
  }

  // =====================================
  // SEARCH
  // =====================================

  /**
   * Globale Suche über alle Entitäten
   */
  static async globalSearch(query: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.rpc(
        'global_search_contracts_v2',
        { search_query: query }
      );

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error in global search:', error);
      return { error: error.message };
    }
  }
}

// Convenience exports für einzelne API-Bereiche
export const contractsAPI = ContractsV2API;
export default ContractsV2API;