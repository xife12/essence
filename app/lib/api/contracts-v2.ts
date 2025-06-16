'use client';

import supabase from '../supabaseClient';

// TypeScript Interfaces für Vertragsarten V2
export interface ContractFormData {
  name: string;
  description?: string;
  terms: Array<{
    duration_months: number;
    base_price: number;
  }>;
  auto_renew: boolean;
  renewal_term_months: number;
  cancellation_period: number;
  cancellation_unit: 'days' | 'months';
  group_discount_enabled: boolean;
  group_discount_type: 'percent' | 'fixed';
  group_discount_value: number;
  module_assignments: Array<{
    module_id: string;
    assignment_type: 'included' | 'optional';
    custom_price?: number;
  }>;
  starter_packages: Array<any>;
  is_campaign_version: boolean;
  campaign_id?: string;
}

export interface ContractModule {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  category_name?: string;
  price_per_month: number;
  price_type: 'fixed' | 'per_month' | 'per_session';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractTerm {
  id: string;
  contract_id: string;
  duration_months: number;
  base_price: number;
  is_default: boolean;
  created_at: string;
}

export interface Contract {
  id: string;
  name: string;
  description?: string;
  auto_renew: boolean;
  renewal_term_months: number;
  cancellation_period: number;
  cancellation_unit: 'days' | 'months';
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  terms?: ContractTerm[];
  modules?: ContractModule[];
}

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

export interface ModuleFormData {
  name: string;
  description?: string;
  category_id: string;
  price_per_month: number;
  price_type: 'fixed' | 'per_month' | 'per_session';
  icon_name?: string;
  is_active: boolean;
}

export interface DocumentFormData {
  name: string;
  description?: string;
  show_payment_calendar: boolean;
  show_service_content: boolean;
  show_member_data: boolean;
  header_template: string;
  footer_template: string;
  css_styles?: string;
  sections: Array<{
    title: string;
    content: string;
    is_mandatory: boolean;
    requires_signature: boolean;
    display_as_checkbox: boolean;
  }>;
}

// API Class
class ContractsV2API {
  
  // Validation
  validateContract(formData: ContractFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!formData.name?.trim()) {
      errors.push('Name ist erforderlich');
    }
    
    if (!formData.terms || formData.terms.length === 0) {
      errors.push('Mindestens eine Laufzeit ist erforderlich');
    }
    
    formData.terms?.forEach((term, index) => {
      if (term.duration_months <= 0) {
        errors.push(`Laufzeit ${index + 1}: Dauer muss größer als 0 sein`);
      }
      if (term.base_price < 0) {
        errors.push(`Laufzeit ${index + 1}: Preis kann nicht negativ sein`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Contracts
  async getAllContracts(): Promise<ApiResponse<any[]>> {
    try {
      // Temporäre sichere Implementierung
      return { data: [] };
      
      /* Deaktiviert bis View existiert
      const { data, error } = await supabase
        .from('contracts_with_details')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return { data: data || [] };
      */
    } catch (error: any) {
      console.error('Fehler beim Laden der Verträge:', error);
      return { error: error.message || 'Fehler beim Laden der Verträge' };
    }
  }

  async getContract(id: string): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          contract_terms(*),
          contract_module_assignments(
            id,
            assignment_type,
            custom_price,
            module:contract_modules(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const contract = {
        ...data,
        modules: data.contract_module_assignments?.map((assignment: any) => assignment.module) || []
      };

      return { data: contract };
    } catch (error: any) {
      console.error('Fehler beim Laden des Vertrags:', error);
      return { error: error.message || 'Fehler beim Laden des Vertrags' };
    }
  }

  async createContract(contractData: ContractFormData): Promise<ApiResponse<Contract>> {
    try {
      // 1. Contract erstellen
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          name: contractData.name,
          description: contractData.description,
          auto_renew: contractData.auto_renew,
          renewal_term_months: contractData.renewal_term_months,
          cancellation_period: contractData.cancellation_period,
          cancellation_unit: contractData.cancellation_unit,
          group_discount_enabled: contractData.group_discount_enabled,
          group_discount_type: contractData.group_discount_type,
          group_discount_value: contractData.group_discount_value,
          is_campaign_version: contractData.is_campaign_version,
          campaign_id: contractData.campaign_id,
          is_active: true,
          version: 1
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // 2. Contract Terms erstellen
      if (contractData.terms && contractData.terms.length > 0) {
        const termsData = contractData.terms.map((term, index) => ({
          contract_id: contract.id,
          duration_months: term.duration_months,
          base_price: term.base_price,
          is_default: index === 0, // Erstes Term als Default
          sort_order: index
        }));

        const { error: termsError } = await supabase
          .from('contract_terms')
          .insert(termsData);

        if (termsError) throw termsError;
      }

      // 3. Module zuweisen
      if (contractData.module_assignments && contractData.module_assignments.length > 0) {
        const moduleAssignments = contractData.module_assignments.map(assignment => ({
          contract_id: contract.id,
          module_id: assignment.module_id,
          assignment_type: assignment.assignment_type,
          custom_price: assignment.custom_price
        }));

        const { error: modulesError } = await supabase
          .from('contract_module_assignments')
          .insert(moduleAssignments);

        if (modulesError) throw modulesError;
      }

      const result = await this.getContract(contract.id);
      return { data: result.data, message: 'Vertrag erfolgreich erstellt' };
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Vertrags:', error);
      return { error: error.message || 'Fehler beim Erstellen des Vertrags' };
    }
  }

  async updateContract(id: string, contractData: Partial<ContractFormData>): Promise<ApiResponse<Contract>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({
          name: contractData.name,
          description: contractData.description,
          auto_renew: contractData.auto_renew,
          renewal_term_months: contractData.renewal_term_months,
          cancellation_period: contractData.cancellation_period,
          cancellation_unit: contractData.cancellation_unit,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const result = await this.getContract(id);
      return { data: result.data, message: 'Vertrag erfolgreich aktualisiert' };
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Vertrags:', error);
      return { error: error.message || 'Fehler beim Aktualisieren des Vertrags' };
    }
  }

  async deleteContract(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      return { message: 'Vertrag erfolgreich deaktiviert' };
    } catch (error: any) {
      console.error('Fehler beim Löschen des Vertrags:', error);
      return { error: error.message || 'Fehler beim Löschen des Vertrags' };
    }
  }

  // Modules
  async getModules(filters: { is_active?: boolean } = {}): Promise<PaginatedResponse<ContractModule>> {
    try {
      let query = supabase
        .from('contract_modules')
        .select(`
          *,
          category:module_categories(name, icon, color)
        `, { count: 'exact' });

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      query = query.order('name');

      const { data, error, count } = await query;

      if (error) throw error;

      const modules = data?.map(module => ({
        ...module,
        category_name: module.category?.name,
        category_icon: module.category?.icon,
        category_color: module.category?.color
      })) || [];

      return {
        data: modules,
        count: count || 0,
        page: 1,
        limit: 100,
        total_pages: 1
      };
    } catch (error: any) {
      console.error('Fehler beim Laden der Module:', error);
      throw new Error(error.message || 'Fehler beim Laden der Module');
    }
  }

  async getModule(id: string): Promise<ApiResponse<ContractModule>> {
    try {
      const { data, error } = await supabase
        .from('contract_modules')
        .select(`
          *,
          category:module_categories(name, icon, color)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const module = {
        ...data,
        category_name: data.category?.name,
        category_icon: data.category?.icon,
        category_color: data.category?.color
      };

      return { data: module };
    } catch (error: any) {
      console.error('Fehler beim Laden des Moduls:', error);
      return { error: error.message || 'Fehler beim Laden des Moduls' };
    }
  }

  // Module Categories
  async getModuleCategories(): Promise<ApiResponse<ModuleCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('module_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return { data: data || [] };
    } catch (error: any) {
      console.error('Fehler beim Laden der Kategorien:', error);
      return { error: error.message || 'Fehler beim Laden der Kategorien' };
    }
  }

  async getAllCategories(): Promise<ModuleCategory[]> {
    const result = await this.getModuleCategories();
    return result.data || [];
  }

  async createModule(moduleData: ModuleFormData): Promise<ApiResponse<ContractModule>> {
    try {
      const { data, error } = await supabase
        .from('contract_modules')
        .insert([moduleData])
        .select()
        .single();

      if (error) throw error;

      return { data, message: 'Modul erfolgreich erstellt' };
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Moduls:', error);
      return { error: error.message || 'Fehler beim Erstellen des Moduls' };
    }
  }

  validateModule(formData: ModuleFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!formData.name?.trim()) {
      errors.push('Name ist erforderlich');
    }
    
    if (!formData.category_id) {
      errors.push('Kategorie ist erforderlich');
    }
    
    if (formData.price_per_month < 0) {
      errors.push('Preis kann nicht negativ sein');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async createDocument(documentData: DocumentFormData): Promise<ApiResponse<any>> {
    try {
      // Transform the data for database storage
      const dbData = {
        name: documentData.name,
        description: documentData.description,
        show_payment_calendar: documentData.show_payment_calendar,
        show_service_content: documentData.show_service_content,
        show_member_data: documentData.show_member_data,
        header_template: documentData.header_template,
        footer_template: documentData.footer_template,
        css_styles: documentData.css_styles,
        sections: JSON.stringify(documentData.sections), // Store sections as JSON
        version_number: 1,
        is_active: true
      };

      const { data, error } = await supabase
        .from('contract_documents')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      return { data, message: 'Dokument erfolgreich erstellt' };
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Dokuments:', error);
      return { error: error.message || 'Fehler beim Erstellen des Dokuments' };
    }
  }

  // Helper Functions
  async getModulesByCategory(categoryId: string): Promise<ApiResponse<ContractModule[]>> {
    try {
      const { data, error } = await supabase
        .from('contract_modules')
        .select(`
          *,
          category:module_categories(name, icon, color)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const modules = data?.map(module => ({
        ...module,
        category_name: module.category?.name,
        category_icon: module.category?.icon,
        category_color: module.category?.color
      })) || [];

      return { data: modules };
    } catch (error: any) {
      console.error('Fehler beim Laden der Module nach Kategorie:', error);
      return { error: error.message || 'Fehler beim Laden der Module nach Kategorie' };
    }
  }

  async calculateContractPrice(contractId: string, termId: string): Promise<number> {
    try {
      const contractResult = await this.getContract(contractId);
      if (contractResult.error || !contractResult.data) {
        throw new Error('Vertrag nicht gefunden');
      }

      const contract = contractResult.data;
      
      // Term-Basisdaten laden
      const term = contract.terms?.find(t => t.id === termId);
      if (!term) throw new Error('Vertragslaufzeit nicht gefunden');

      // Module-Preise berechnen
      const modulePrice = contract.modules?.reduce((sum, module) => {
        return sum + (module.price_per_month || 0);
      }, 0) || 0;

      // Gesamtpreis berechnen
      const monthlyPrice = term.base_price + modulePrice;
      const totalPrice = monthlyPrice * term.duration_months;

      return Math.round(totalPrice * 100) / 100; // Auf 2 Dezimalstellen runden
    } catch (error: any) {
      console.error('Fehler beim Berechnen des Vertragspreises:', error);
      throw new Error(error.message || 'Fehler beim Berechnen des Vertragspreises');
    }
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      // Temporäre Mock-Daten
      const stats = {
        total_contracts: 0,
        active_contracts: 0,
        campaign_contracts: 0,
        total_modules: 0,
        active_modules: 0,
        total_documents: 0,
        avg_contract_price: 0
      };

      return { data: stats };
      
      /* Deaktiviert bis Tabellen existieren
      // Verträge-Statistiken
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('id, is_active, is_campaign_version');

      if (contractsError) throw contractsError;

      // Module-Statistiken
      const { data: modulesData, error: modulesError } = await supabase
        .from('contract_modules')
        .select('id, is_active');

      if (modulesError) throw modulesError;

      // Dokumente-Statistiken
      const { data: documentsData, error: documentsError } = await supabase
        .from('contract_documents')
        .select('id, is_active');

      if (documentsError) throw documentsError;

      // Durchschnittspreis berechnen
      const { data: termsData, error: termsError } = await supabase
        .from('contract_terms')
        .select('base_price');

      if (termsError) throw termsError;

      const avgPrice = termsData && termsData.length > 0 
        ? termsData.reduce((sum, term) => sum + term.base_price, 0) / termsData.length 
        : 0;

      const stats = {
        total_contracts: contractsData?.length || 0,
        active_contracts: contractsData?.filter(c => c.is_active)?.length || 0,
        campaign_contracts: contractsData?.filter(c => c.is_campaign_version)?.length || 0,
        total_modules: modulesData?.length || 0,
        active_modules: modulesData?.filter(m => m.is_active)?.length || 0,
        total_documents: documentsData?.length || 0,
        avg_contract_price: Math.round(avgPrice * 100) / 100
      };

      return { data: stats };
      */
    } catch (error: any) {
      console.error('Fehler beim Laden der Dashboard-Statistiken:', error);
      return { error: error.message || 'Fehler beim Laden der Dashboard-Statistiken' };
    }
  }

  // Alias for getAllContracts with filters
  async getContracts(filters: any = {}): Promise<ApiResponse<any[]>> {
    return this.getAllContracts();
  }

  // Documents
  async getDocuments(filters: any = {}): Promise<ApiResponse<any[]>> {
    try {
      // Temporäre sichere Implementierung
      return { data: [] };
      
      /* Deaktiviert bis Tabelle existiert
      const { data, error } = await supabase
        .from('contract_documents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return { data: data || [] };
      */
    } catch (error: any) {
      console.error('Fehler beim Laden der Dokumente:', error);
      return { error: error.message || 'Fehler beim Laden der Dokumente' };
    }
  }

  async deleteModule(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('contract_modules')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      return { message: 'Modul erfolgreich deaktiviert' };
    } catch (error: any) {
      console.error('Fehler beim Löschen des Moduls:', error);
      return { error: error.message || 'Fehler beim Löschen des Moduls' };
    }
  }
}

export default new ContractsV2API(); 