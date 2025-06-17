'use client';

import supabase from '../supabaseClient';

// Browser-kompatible UUID-Generierung
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// TypeScript Interfaces für Vertragsarten V2
export interface StarterPackage {
  id: string;
  name: string;
  price: number;
  description?: string;
  is_mandatory: boolean;
}

// Startpaket mit vollständiger Konfiguration
export interface StarterPackageConfig {
  id: string;
  name: string;
  price: number;
  description?: string;
  allow_installments: boolean;
  max_installments?: number;
  included_modules: string[]; // Module IDs
}

// Pauschale
export interface FlatRate {
  id: string;
  name: string;
  price: number;
  payment_interval: 'monthly' | 'quarterly' | 'yearly' | 'fixed_date';
  fixed_date?: string; // Für Stichtag-basierte Zahlung
}

// Preisdynamik-Regel
export interface PriceDynamicRule {
  id: string;
  name: string;
  adjustment_type: 'one_time_on_date' | 'recurring_on_date' | 'after_duration' | 'first_months_free';
  adjustment_value: number; // Prozent oder fester Betrag
  adjustment_value_type: 'percent' | 'fixed';
  // Für Stichtag-basiert
  target_date?: string;
  recurring_day?: number; // 1-31 für monatlich
  // Für Dauer-basiert
  after_weeks?: number;
  after_months?: number;
  // Für "Erste X Monate kostenlos"
  free_months?: number; // Anzahl kostenloser Monate ab Vertragsbeginn
}

// Zahlungsintervall mit Rabatten
export interface PaymentInterval {
  interval: 'monthly' | 'semi_annual' | 'yearly';
  enabled: boolean;
  discount_percent?: number;
}

export interface ContractFormData {
  name: string;
  description?: string;
  terms: Array<{
    duration_months: number;
    base_price: number;
  }>;
  // Verlängerung
  auto_renew: boolean;
  renewal_duration: number;
  renewal_unit: 'days' | 'weeks' | 'months';
  renewal_monthly_price: number;
  renewal_cancellation_period: number;
  renewal_cancellation_unit: 'days' | 'months';
  // Kündigung
  cancellation_period: number;
  cancellation_unit: 'days' | 'months';
  // Gruppenrabatt (buchbar, nicht automatisch)
  group_discount_bookable: boolean;
  group_discount_value: number;
  group_discount_type: 'percent' | 'fixed';
  // Preisdynamik
  price_dynamic_rules: PriceDynamicRule[];
  // Zahlungsintervalle
  payment_intervals: PaymentInterval[];
  // Startpakete (mehrere möglich)
  starter_packages: StarterPackageConfig[];
  // Module (inkl. vs. zubuchbar)
  module_assignments: Array<{
    module_id: string;
    assignment_type: 'included' | 'bookable';
    custom_price?: number;
  }>;
  // Pauschalen (mehrere möglich)
  flat_rates: FlatRate[];
  // Kampagnen-Version Flag
  is_campaign_version: boolean;
  campaign_id?: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  
  // Kampagnen-Überschreibungen
  campaign_override_pricing?: boolean;
  campaign_override_modules?: boolean;
  campaign_override_terms?: boolean;
  campaign_override_packages?: boolean;
  
  // Versionierung
  contract_group_id?: string;
  version_number?: number;
  version_notes?: string;
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
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('is_archived', false) // Archivierte Verträge ausblenden
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
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
          *
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const contract = {
        ...data,
        modules: [], // Lade Module separat falls benötigt
        terms: [] // Lade Terms separat falls benötigt
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
      // Wenn contract_group_id vorhanden, verwende diese (Versionierung)
      // Ansonsten neue Gruppe erstellen (neuer Vertrag)
      const contractGroupId = contractData.contract_group_id || generateUUID();
      const versionNumber = contractData.version_number || 1;
      
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          contract_group_id: contractGroupId,
          name: contractData.name,
          description: contractData.description,
          auto_renew: contractData.auto_renew || false,
          renewal_term_months: contractData.renewal_duration,
          renewal_monthly_price: contractData.renewal_monthly_price,
          renewal_cancellation_period: contractData.renewal_cancellation_period,
          renewal_cancellation_unit: contractData.renewal_cancellation_unit,
          cancellation_period: contractData.cancellation_period,
          cancellation_unit: contractData.cancellation_unit,
          group_discount_enabled: contractData.group_discount_bookable || false,
          group_discount_type: contractData.group_discount_type,
          group_discount_value: contractData.group_discount_value,
          is_campaign_version: contractData.is_campaign_version || false,
          ...(contractData.campaign_id && contractData.campaign_id.length > 10 ? { campaign_id: contractData.campaign_id } : {}),
          ...(contractData.campaign_start_date ? { campaign_start_date: contractData.campaign_start_date } : {}),
          ...(contractData.campaign_end_date ? { campaign_end_date: contractData.campaign_end_date } : {}),
          campaign_override_pricing: contractData.campaign_override_pricing || false,
          campaign_override_modules: contractData.campaign_override_modules || false,
          campaign_override_terms: contractData.campaign_override_terms || false,
          campaign_override_packages: contractData.campaign_override_packages || false,
          is_active: true,
          version_number: versionNumber,
          ...(contractData.version_notes ? { version_notes: contractData.version_notes } : {})
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
        // Validiere Module-IDs bevor sie in die DB geschrieben werden
        const validModuleAssignments = contractData.module_assignments
          .filter(assignment => {
            const isValidUUID = assignment.module_id && assignment.module_id.length > 10;
            if (!isValidUUID) {
              console.warn('Ungültige Module-ID übersprungen:', assignment.module_id);
            }
            return isValidUUID;
          })
          .map(assignment => ({
            contract_id: contract.id,
            module_id: assignment.module_id,
            assignment_type: assignment.assignment_type,
            custom_price: assignment.custom_price
          }));

        if (validModuleAssignments.length > 0) {
          const { error: modulesError } = await supabase
            .from('contract_module_assignments')
            .insert(validModuleAssignments);

          if (modulesError) throw modulesError;
        }
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
          renewal_term_months: contractData.renewal_duration,
          renewal_monthly_price: contractData.renewal_monthly_price,
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

  async updateContractStatus(id: string, updates: { is_active?: boolean; is_archived?: boolean }): Promise<ApiResponse<void>> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.is_active !== undefined) {
        updateData.is_active = updates.is_active;
      }
      if (updates.is_archived !== undefined) {
        updateData.is_archived = updates.is_archived;
      }

      const { error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      return { message: 'Vertragsstatus erfolgreich aktualisiert' };
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Vertragsstatus:', error);
      return { error: error.message || 'Fehler beim Aktualisieren des Vertragsstatus' };
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
      // Erst versuchen mit Kategorien, bei Fehler ohne
      let query = supabase
        .from('contract_modules')
        .select('*', { count: 'exact' });

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      query = query.order('name');

      const { data, error, count } = await query;

      if (error) throw error;

      const modules = data?.map(module => ({
        ...module,
        category_name: 'Standard', // Fallback
        category_icon: 'dumbbell',
        category_color: '#3b82f6'
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
      // Echte Daten laden
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('id, is_active, is_campaign_version');

      if (contractsError) throw contractsError;

      const { data: modulesData, error: modulesError } = await supabase
        .from('contract_modules')
        .select('id, is_active');

      if (modulesError) throw modulesError;

      const { data: termsData, error: termsError } = await supabase
        .from('contract_terms')
        .select('base_price');

      if (termsError) throw termsError;

      const avgPrice = termsData && termsData.length > 0 
        ? termsData.reduce((sum, term) => sum + Number(term.base_price), 0) / termsData.length 
        : 0;

      const stats = {
        total_contracts: contractsData?.length || 0,
        active_contracts: contractsData?.filter(c => c.is_active)?.length || 0,
        campaign_contracts: contractsData?.filter(c => c.is_campaign_version)?.length || 0,
        total_modules: modulesData?.length || 0,
        active_modules: modulesData?.filter(m => m.is_active)?.length || 0,
        total_documents: 0,
        avg_contract_price: Math.round(avgPrice * 100) / 100
      };

      return { data: stats };
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

  // Startpaket-Methoden
  async getStarterPackagesForContract(contractId: string): Promise<ApiResponse<StarterPackage[]>> {
    try {
      // Temporäre Mock-Daten für Startpakete
      const mockStarterPackages: StarterPackage[] = [
        {
          id: 'starter-1',
          name: 'Grundausstattung',
          price: 49.90,
          description: 'Handtuch, Schließfach-Chip, Begrüßungspaket',
          is_mandatory: true
        },
        {
          id: 'starter-2',
          name: 'Premium-Set',
          price: 89.90,
          description: 'Trinkflasche, Handtuch, Trainingsplan, Körperanalyse',
          is_mandatory: false
        },
        {
          id: 'starter-3',
          name: 'Personal Training Schnupperpaket',
          price: 120.00,
          description: '2x Personal Training Einheiten (60 Min)',
          is_mandatory: false
        }
      ];

      return { data: mockStarterPackages };
    } catch (error: any) {
      console.error('Fehler beim Laden der Startpakete:', error);
      return { error: error.message || 'Fehler beim Laden der Startpakete' };
    }
  }

  async calculateStarterPackageTotal(packageIds: string[]): Promise<number> {
    try {
      const { data: packages } = await this.getStarterPackagesForContract('');
      if (!packages) return 0;

      return packageIds.reduce((total, packageId) => {
        const pkg = packages.find(p => p.id === packageId);
        return total + (pkg?.price || 0);
      }, 0);
    } catch (error) {
      console.error('Fehler beim Berechnen der Startpaket-Summe:', error);
      return 0;
    }
  }

  // Versionierung und Kampagnen-Verträge
  async getContractVersions(contractGroupId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          name,
          description,
          version_number,
          version_notes,
          is_active,
          is_campaign_version,
          campaign_id,
          campaign_start_date,
          campaign_end_date,
          created_at,
          updated_at
        `)
        .eq('contract_group_id', contractGroupId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
    } catch (error: any) {
      console.error('Fehler beim Laden der Vertragsversionen:', error);
      return { error: error.message || 'Fehler beim Laden der Vertragsversionen' };
    }
  }

  // Vertrag duplizieren (neueste Version)
  async duplicateContract(contractId: string, newName?: string): Promise<ApiResponse<any>> {
    try {
      // 1. Hole Vertragsdaten
      const contractResponse = await this.getContractDetails(contractId);
      if (!contractResponse.data) {
        throw new Error('Vertrag nicht gefunden');
      }

      const originalContract = contractResponse.data;

      // 2. Erstelle Duplikat
      const duplicateData: ContractFormData = {
        name: newName || `${originalContract.name} (Kopie)`,
        description: originalContract.description || '',
        terms: originalContract.terms || [{ duration_months: 12, base_price: 49.99 }],
        auto_renew: originalContract.auto_renew || false,
        renewal_duration: originalContract.renewal_term_months || 12,
        renewal_unit: 'months',
        renewal_monthly_price: originalContract.renewal_monthly_price || 0,
        renewal_cancellation_period: 3,
        renewal_cancellation_unit: 'months',
        cancellation_period: originalContract.cancellation_period || 3,
        cancellation_unit: originalContract.cancellation_unit || 'months',
        group_discount_bookable: false,
        group_discount_type: 'percent',
        group_discount_value: 0,
        price_dynamic_rules: [],
        payment_intervals: [
          { interval: 'monthly', enabled: true, discount_percent: 0 },
          { interval: 'semi_annual', enabled: false, discount_percent: 5 },
          { interval: 'yearly', enabled: false, discount_percent: 10 }
        ],
        starter_packages: [],
        module_assignments: originalContract.module_assignments || [],
        flat_rates: [],
        is_campaign_version: false,
        campaign_id: undefined
      };

      return await this.createContract(duplicateData);
    } catch (error: any) {
      console.error('Fehler beim Duplizieren des Vertrags:', error);
      return { error: error.message || 'Fehler beim Duplizieren des Vertrags' };
    }
  }

  async getContractDetails(contractId: string): Promise<ApiResponse<any>> {
    try {
      // Basis-Vertragsdaten mit allen relevanten Feldern
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select(`
          *,
          contract_group_id,
          version_number,
          version_notes
        `)
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;

      // Laufzeiten laden
      const { data: termsData, error: termsError } = await supabase
        .from('contract_terms')
        .select('*')
        .eq('contract_id', contractId)
        .order('duration_months');

      // Module-Zuordnungen laden (ignoriere Fehler wenn Tabelle nicht existiert)
      let moduleAssignments: any[] = [];
      try {
        const { data: moduleData, error: moduleError } = await supabase
          .from('contract_module_assignments')
          .select(`
            id,
            assignment_type,
            custom_price,
            module:contract_modules(id, name, description, price_per_month, price_type)
          `)
          .eq('contract_id', contractId);

        if (!moduleError && moduleData) {
          moduleAssignments = moduleData;
        }
      } catch (moduleError) {
        console.log('Module assignments not available:', moduleError);
      }

      const contractDetails = {
        ...contractData,
        terms: termsData || [],
        module_assignments: moduleAssignments,
        modules: moduleAssignments?.map((assignment: any) => ({
          ...assignment.module,
          assignment_type: assignment.assignment_type,
          custom_price: assignment.custom_price
        })) || []
      };

      console.log('Contract details loaded:', contractDetails);
      return { data: contractDetails };
    } catch (error: any) {
      console.error('Fehler beim Laden der Vertragsdetails:', error);
      return { error: error.message || 'Fehler beim Laden der Vertragsdetails' };
    }
  }
}

export default new ContractsV2API(); 