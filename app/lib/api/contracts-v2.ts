// API-Layer für Vertragsarten-System V2
// Vollständige CRUD-Operationen und spezialisierte Funktionen

import { createClient } from '@supabase/supabase-js';
import type {
  Contract,
  ContractTerm,
  ContractPricing,
  ContractStarterPackage,
  ContractFlatRate,
  ContractModule,
  ModuleCategory,
  ContractModuleAssignment,
  ContractDocument,
  ContractDocumentSection,
  ContractDocumentAssignment,
  ContractFormData,
  ModuleFormData,
  DocumentFormData,
  ContractWithDetails,
  ModuleWithStats,
  ContractVersion,
  VersionComparison,
  ModuleAssignment,
  BulkAssignmentResult,
  ContractFilters,
  ModuleFilters,
  ValidationResult,
  ValidationError
} from '../types/contracts-v2';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// CONTRACTS API
// ============================================================================

export const ContractsV2API = {
  
  // Alle Verträge laden mit optionalen Details
  async getAll(filters?: ContractFilters, includeDetails = false): Promise<Contract[]> {
    let query = supabase
      .from('contracts')
      .select(includeDetails ? `
        *,
        terms:contract_terms(*),
        pricing_rules:contract_pricing(*),
        starter_packages:contract_starter_packages(*),
        flat_rates:contract_flat_rates(*),
        campaign:campaigns(id, name),
        modules:contract_module_assignments(
          *,
          module:contract_modules(*)
        )
      ` : '*')
      .order('created_at', { ascending: false });

    // Filter anwenden
    if (filters) {
      if (filters.is_campaign_version !== undefined) {
        query = query.eq('is_campaign_version', filters.is_campaign_version);
      }
      if (filters.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Einzelnen Vertrag mit Details laden
  async getById(id: string): Promise<ContractWithDetails | null> {
    const { data, error } = await supabase
      .from('contracts_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Aktive Verträge für Auswahl laden
  async getActive(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        terms:contract_terms(*),
        campaign:campaigns(id, name)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Neuen Vertrag erstellen
  async create(contractData: ContractFormData): Promise<Contract> {
    const { data: user } = await supabase.auth.getUser();
    
    // Contract Group ID generieren
    const contractGroupId = crypto.randomUUID();
    
    // Haupt-Vertrag erstellen
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        contract_group_id: contractGroupId,
        version_number: 1,
        version_note: 'Erste Version',
        is_active: true,
        name: contractData.name,
        description: contractData.description,
        auto_renew: contractData.auto_renew,
        renewal_term_months: contractData.renewal_term_months,
        cancellation_period: contractData.cancellation_period,
        cancellation_unit: contractData.cancellation_unit,
        group_discount_enabled: contractData.group_discount_enabled,
        group_discount_type: contractData.group_discount_type,
        group_discount_value: contractData.group_discount_value,
        payment_runs: contractData.payment_runs,
        payment_methods: contractData.payment_methods,
        is_campaign_version: contractData.is_campaign_version || false,
        campaign_id: contractData.campaign_id,
        base_version_id: contractData.base_version_id,
        created_by: user?.user?.id
      })
      .select()
      .single();

    if (contractError) throw contractError;

    // Contract Terms erstellen
    if (contractData.terms.length > 0) {
      const termsData = contractData.terms.map((term, index) => ({
        contract_id: contract.id,
        duration_months: term.duration_months,
        base_price: term.base_price,
        sort_order: index
      }));

      const { error: termsError } = await supabase
        .from('contract_terms')
        .insert(termsData);

      if (termsError) throw termsError;
    }

    // Modul-Zuordnungen erstellen
    await this.updateModuleAssignments(contract.id, [
      ...contractData.modules_included.map(moduleId => ({
        module_id: moduleId,
        assignment_type: 'included' as const
      })),
      ...contractData.modules_optional.map(moduleId => ({
        module_id: moduleId,
        assignment_type: 'optional' as const
      }))
    ]);

    // Pricing Rules erstellen
    if (contractData.pricing_rules) {
      const pricingData = contractData.pricing_rules.map(rule => ({
        contract_id: contract.id,
        ...rule
      }));

      const { error: pricingError } = await supabase
        .from('contract_pricing')
        .insert(pricingData);

      if (pricingError) throw pricingError;
    }

    // Startpakete erstellen
    if (contractData.starter_packages) {
      const packagesData = contractData.starter_packages.map((pkg, index) => ({
        contract_id: contract.id,
        sort_order: index,
        ...pkg
      }));

      const { error: packagesError } = await supabase
        .from('contract_starter_packages')
        .insert(packagesData);

      if (packagesError) throw packagesError;
    }

    // Pauschalen erstellen  
    if (contractData.flat_rates) {
      const ratesData = contractData.flat_rates.map((rate, index) => ({
        contract_id: contract.id,
        sort_order: index,
        ...rate
      }));

      const { error: ratesError } = await supabase
        .from('contract_flat_rates')
        .insert(ratesData);

      if (ratesError) throw ratesError;
    }

    return contract;
  },

  // Vertrag aktualisieren (erstellt neue Version)
  async update(id: string, updates: Partial<ContractFormData>, versionNote?: string): Promise<Contract> {
    // Neue Version über Stored Procedure erstellen
    const { data, error } = await supabase.rpc('create_contract_version', {
      p_base_contract_id: id,
      p_version_note: versionNote,
      p_changes: updates
    });

    if (error) throw error;

    const newContractId = data;

    // Terms aktualisieren falls vorhanden
    if (updates.terms) {
      // Alte Terms löschen
      await supabase
        .from('contract_terms')
        .delete()
        .eq('contract_id', newContractId);

      // Neue Terms erstellen
      const termsData = updates.terms.map((term, index) => ({
        contract_id: newContractId,
        duration_months: term.duration_months,
        base_price: term.base_price,
        sort_order: index
      }));

      await supabase
        .from('contract_terms')
        .insert(termsData);
    }

    // Module aktualisieren falls vorhanden
    if (updates.modules_included || updates.modules_optional) {
      await this.updateModuleAssignments(newContractId, [
        ...(updates.modules_included || []).map(moduleId => ({
          module_id: moduleId,
          assignment_type: 'included' as const
        })),
        ...(updates.modules_optional || []).map(moduleId => ({
          module_id: moduleId,
          assignment_type: 'optional' as const
        }))
      ]);
    }

    // Aktualisierten Vertrag laden
    return await this.getById(newContractId) as Contract;
  },

  // Vertrag deaktivieren
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Modul-Zuordnungen aktualisieren
  async updateModuleAssignments(contractId: string, assignments: Array<{
    module_id: string;
    assignment_type: 'included' | 'optional';
    custom_price?: number;
  }>): Promise<void> {
    // Alte Zuordnungen löschen
    await supabase
      .from('contract_module_assignments')
      .delete()
      .eq('contract_id', contractId);

    // Neue Zuordnungen erstellen
    if (assignments.length > 0) {
      const assignmentData = assignments.map((assignment, index) => ({
        contract_id: contractId,
        module_id: assignment.module_id,
        assignment_type: assignment.assignment_type,
        custom_price: assignment.custom_price,
        sort_order: index
      }));

      const { error } = await supabase
        .from('contract_module_assignments')
        .insert(assignmentData);

      if (error) throw error;
    }
  },

  // Versionshistorie laden
  async getVersionHistory(contractGroupId: string): Promise<ContractVersion[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        version_number,
        version_note,
        is_active,
        is_campaign_version,
        campaign_id,
        created_at,
        created_by,
        campaigns(name)
      `)
      .eq('contract_group_id', contractGroupId)
      .order('version_number', { ascending: false });

    if (error) throw error;

    return (data || []).map(v => ({
      ...v,
      version_display: `v${v.version_number}`,
      is_current: v.is_active,
      type: v.is_campaign_version ? 'Kampagne' : 'Standard',
      campaign_name: v.campaigns?.name || null
    }));
  },

  // Kampagnenvertrag erstellen
  async createCampaignContract(
    baseContractId: string,
    campaignId: string,
    modifications: Partial<ContractFormData>
  ): Promise<Contract> {
    const { data, error } = await supabase.rpc('create_campaign_contract', {
      p_base_contract_id: baseContractId,
      p_campaign_id: campaignId,
      p_modifications: modifications
    });

    if (error) throw error;
    return await this.getById(data) as Contract;
  },

  // Validierung
  validate(contractData: ContractFormData): ValidationResult {
    const errors: ValidationError[] = [];

    if (!contractData.name?.trim()) {
      errors.push({ field: 'name', message: 'Name ist erforderlich' });
    }

    if (!contractData.terms || contractData.terms.length === 0) {
      errors.push({ field: 'terms', message: 'Mindestens eine Laufzeit erforderlich' });
    }

    contractData.terms?.forEach((term, index) => {
      if (term.duration_months <= 0) {
        errors.push({ field: `terms.${index}.duration_months`, message: 'Laufzeit muss größer als 0 sein' });
      }
      if (term.base_price < 0) {
        errors.push({ field: `terms.${index}.base_price`, message: 'Preis darf nicht negativ sein' });
      }
    });

    if (contractData.cancellation_period <= 0) {
      errors.push({ field: 'cancellation_period', message: 'Kündigungsperiode muss größer als 0 sein' });
    }

    if (contractData.group_discount_enabled && !contractData.group_discount_value) {
      errors.push({ field: 'group_discount_value', message: 'Rabattwert erforderlich wenn Gruppenrabatt aktiviert' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================================
// MODULES API
// ============================================================================

export const ModulesV2API = {

  // Alle Module laden
  async getAll(filters?: ModuleFilters): Promise<ModuleWithStats[]> {
    let query = supabase
      .from('contract_modules')
      .select(`
        *,
        category:module_categories(*),
        assignments:contract_module_assignments(
          *,
          contract:contracts(id, name)
        )
      `)
      .order('name');

    if (filters) {
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters.price_range) {
        if (filters.price_range.min !== undefined) {
          query = query.gte('price_per_month', filters.price_range.min);
        }
        if (filters.price_range.max !== undefined) {
          query = query.lte('price_per_month', filters.price_range.max);
        }
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    // Assignment Stats berechnen
    return (data || []).map(module => ({
      ...module,
      assignment_stats: {
        included: module.assignments?.filter(a => a.assignment_type === 'included').length || 0,
        optional: module.assignments?.filter(a => a.assignment_type === 'optional').length || 0,
        total_contracts: module.assignments?.length || 0,
        contracts: module.assignments?.map(a => ({
          id: a.contract.id,
          name: a.contract.name,
          assignment_type: a.assignment_type,
          custom_price: a.custom_price
        })) || []
      }
    }));
  },

  // Einzelnes Modul laden
  async getById(id: string): Promise<ContractModule | null> {
    const { data, error } = await supabase
      .from('contract_modules')
      .select(`
        *,
        category:module_categories(*),
        assignments:contract_module_assignments(
          *,
          contract:contracts(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Modul erstellen
  async create(moduleData: ModuleFormData): Promise<ContractModule> {
    const { data, error } = await supabase
      .from('contract_modules')
      .insert(moduleData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Modul aktualisieren
  async update(id: string, updates: Partial<ModuleFormData>): Promise<ContractModule> {
    const { data, error } = await supabase
      .from('contract_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Modul löschen
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contract_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Bulk-Assignment für Module
  async updateBulkAssignments(moduleId: string, assignments: ModuleAssignment[]): Promise<BulkAssignmentResult> {
    try {
      const assignmentData = assignments
        .filter(a => a.newType !== 'none')
        .map(a => ({
          contract_id: a.contractId,
          assignment_type: a.newType,
          custom_price: a.customPrice
        }));

      const { error } = await supabase.rpc('update_module_assignments', {
        p_module_id: moduleId,
        p_assignments: assignmentData
      });

      if (error) throw error;

      return {
        success: true,
        modified_contracts: assignments.filter(a => a.currentType !== a.newType).length
      };
    } catch (error) {
      return {
        success: false,
        modified_contracts: 0,
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler']
      };
    }
  },

  // Validierung
  validate(moduleData: ModuleFormData): ValidationResult {
    const errors: ValidationError[] = [];

    if (!moduleData.name?.trim()) {
      errors.push({ field: 'name', message: 'Name ist erforderlich' });
    }

    if (moduleData.price_per_month < 0) {
      errors.push({ field: 'price_per_month', message: 'Preis darf nicht negativ sein' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================================
// MODULE CATEGORIES API
// ============================================================================

export const ModuleCategoriesAPI = {

  // Alle Kategorien laden
  async getAll(): Promise<ModuleCategory[]> {
    const { data, error } = await supabase
      .from('module_categories')
      .select(`
        *,
        contract_modules(count)
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    return (data || []).map(cat => ({
      ...cat,
      module_count: cat.contract_modules?.[0]?.count || 0
    }));
  },

  // Kategorie erstellen
  async create(categoryData: Omit<ModuleCategory, 'id' | 'created_at' | 'module_count'>): Promise<ModuleCategory> {
    const { data, error } = await supabase
      .from('module_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Kategorie aktualisieren
  async update(id: string, updates: Partial<ModuleCategory>): Promise<ModuleCategory> {
    const { data, error } = await supabase
      .from('module_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Sortierung aktualisieren
  async updateOrder(categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map((id, index) => ({
      id,
      sort_order: index + 1
    }));

    for (const update of updates) {
      await supabase
        .from('module_categories')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }
  }
};

// ============================================================================
// DOCUMENTS API
// ============================================================================

export const ContractDocumentsAPI = {

  // Alle Dokumente laden
  async getAll(): Promise<ContractDocument[]> {
    const { data, error } = await supabase
      .from('contract_documents')
      .select(`
        *,
        sections:contract_document_sections(*),
        contract_assignments:contract_document_assignments(
          *,
          contract:contracts(id, name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Einzelnes Dokument laden
  async getById(id: string): Promise<ContractDocument | null> {
    const { data, error } = await supabase
      .from('contract_documents')
      .select(`
        *,
        sections:contract_document_sections(*),
        contract_assignments:contract_document_assignments(
          *,
          contract:contracts(id, name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Dokument erstellen
  async create(documentData: DocumentFormData): Promise<ContractDocument> {
    const documentGroupId = crypto.randomUUID();

    const { data: document, error: docError } = await supabase
      .from('contract_documents')
      .insert({
        document_group_id: documentGroupId,
        version_number: 1,
        is_active: true,
        name: documentData.name,
        description: documentData.description,
        show_payment_calendar: documentData.show_payment_calendar,
        show_service_content: documentData.show_service_content,
        show_member_data: documentData.show_member_data,
        header_template: documentData.header_template,
        footer_template: documentData.footer_template,
        css_styles: documentData.css_styles
      })
      .select()
      .single();

    if (docError) throw docError;

    // Abschnitte erstellen
    if (documentData.sections.length > 0) {
      const sectionsData = documentData.sections.map(section => ({
        document_id: document.id,
        ...section
      }));

      const { error: sectionsError } = await supabase
        .from('contract_document_sections')
        .insert(sectionsData);

      if (sectionsError) throw sectionsError;
    }

    return document;
  },

  // Dokument aktualisieren
  async update(id: string, updates: Partial<DocumentFormData>): Promise<ContractDocument> {
    const { data, error } = await supabase
      .from('contract_documents')
      .update({
        name: updates.name,
        description: updates.description,
        show_payment_calendar: updates.show_payment_calendar,
        show_service_content: updates.show_service_content,
        show_member_data: updates.show_member_data,
        header_template: updates.header_template,
        footer_template: updates.footer_template,
        css_styles: updates.css_styles
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Abschnitte aktualisieren falls vorhanden
    if (updates.sections) {
      // Alte Abschnitte löschen
      await supabase
        .from('contract_document_sections')
        .delete()
        .eq('document_id', id);

      // Neue Abschnitte erstellen
      if (updates.sections.length > 0) {
        const sectionsData = updates.sections.map(section => ({
          document_id: id,
          ...section
        }));

        await supabase
          .from('contract_document_sections')
          .insert(sectionsData);
      }
    }

    return data;
  },

  // Dokument zu Verträgen zuordnen
  async assignToContracts(documentId: string, contractIds: string[]): Promise<void> {
    // Alte Zuordnungen löschen
    await supabase
      .from('contract_document_assignments')
      .delete()
      .eq('document_id', documentId);

    // Neue Zuordnungen erstellen
    if (contractIds.length > 0) {
      const assignmentData = contractIds.map(contractId => ({
        document_id: documentId,
        contract_id: contractId
      }));

      const { error } = await supabase
        .from('contract_document_assignments')
        .insert(assignmentData);

      if (error) throw error;
    }
  },

  // Validierung
  validate(documentData: DocumentFormData): ValidationResult {
    const errors: ValidationError[] = [];

    if (!documentData.name?.trim()) {
      errors.push({ field: 'name', message: 'Name ist erforderlich' });
    }

    if (!documentData.sections || documentData.sections.length === 0) {
      errors.push({ field: 'sections', message: 'Mindestens ein Abschnitt erforderlich' });
    }

    documentData.sections?.forEach((section, index) => {
      if (!section.title?.trim()) {
        errors.push({ field: `sections.${index}.title`, message: 'Abschnittstitel erforderlich' });
      }
      if (!section.content?.trim()) {
        errors.push({ field: `sections.${index}.content`, message: 'Abschnittsinhalt erforderlich' });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const ContractsV2Utils = {
  
  // Formatierungen
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  },

  formatVersion: (version: number): string => {
    return `v${version}`;
  },

  // Berechnungen
  calculateTotalPrice: (contract: ContractWithDetails, selectedModules: string[] = []): number => {
    let total = contract.terms[0]?.base_price || 0;
    
    selectedModules.forEach(moduleId => {
      const module = contract.modules_optional.find(m => m.id === moduleId);
      if (module) {
        total += module.assignment.custom_price || module.price_per_month;
      }
    });

    return total;
  },

  // Status Helpers
  isActive: (contract: Contract): boolean => {
    return contract.is_active && !contract.is_campaign_version;
  },

  isCampaign: (contract: Contract): boolean => {
    return contract.is_campaign_version;
  },

  // Error Handling
  handleApiError: (error: any): string => {
    if (error?.message) {
      return error.message;
    }
    if (error?.error_description) {
      return error.error_description;
    }
    return 'Ein unbekannter Fehler ist aufgetreten';
  }
};

// Default Export
export default {
  contracts: ContractsV2API,
  modules: ModulesV2API,
  categories: ModuleCategoriesAPI,
  documents: ContractDocumentsAPI,
  utils: ContractsV2Utils
};