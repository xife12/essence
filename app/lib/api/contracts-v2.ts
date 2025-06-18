'use client';

import { supabase } from '../supabaseClient';

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
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
  campaign_extension_date?: string;
  campaign_name?: string;
  
  // Kampagnen-Überschreibungen
  campaign_override_pricing?: boolean;
  campaign_override_modules?: boolean;
  campaign_override_terms?: boolean;
  campaign_override_packages?: boolean;
  
  // Versionierung & Status
  contract_group_id?: string;
  base_contract_id?: string;
  version?: number;
  version_number?: number;
  version_note?: string;
  is_active?: boolean;
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
  
  // Vertragsverknüpfungen
  assigned_contracts: string[]; // Contract IDs
  
  // Strukturierte Module
  required_modules: {
    contract_info: {
      enabled: boolean;
      include_terms: boolean;
      include_cancellation: boolean;
      include_renewal: boolean;
      include_dynamics: boolean;
      include_sepa: boolean;
      include_parties: boolean;
    };
    privacy_policy: {
      enabled: boolean;
      content: string;
      requires_signature: boolean;
    };
    terms_conditions: {
      enabled: boolean;
      content: string;
      requires_signature: boolean;
    };
  };
  
  // Optionale Module
  optional_modules: {
    payment_calendar: {
      enabled: boolean;
      show_due_dates: boolean;
      show_amounts: boolean;
    };
    service_overview: {
      enabled: boolean;
      include_modules: boolean;
      include_benefits: boolean;
    };
  };
  
  // Individuelle Blöcke
  custom_sections: Array<{
    id: string;
    title: string;
    content: string;
    sort_order: number;
    is_mandatory: boolean;
    requires_signature: boolean;
    display_as_checkbox: boolean;
    signature_label?: string;
    checkbox_label?: string;
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
      // Einfache Abfrage: Nur aktive Verträge laden
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Gruppiere nach contract_group_id und nimm nur die neueste Version
      const contractGroups = new Map();
      
      contracts?.forEach(contract => {
        const groupId = contract.contract_group_id || contract.id;
        const existing = contractGroups.get(groupId);
        
        if (!existing || (contract.version_number || 1) > (existing.version_number || 1)) {
          contractGroups.set(groupId, contract);
        }
      });

      const latestContracts = Array.from(contractGroups.values());

      return { data: latestContracts };
    } catch (error: any) {
      console.error('❌ Fehler beim Laden der Verträge:', error);
      return { error: error.message || 'Fehler beim Laden der Verträge' };
    }
  }

  // Neue Methode für inaktive Verträge (statt archivierte)
  async getArchivedContracts(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('is_active', false) // Inaktive Verträge als "archiviert"
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
    } catch (error: any) {
      console.error('Fehler beim Laden der archivierten Verträge:', error);
      return { error: error.message || 'Fehler beim Laden der archivierten Verträge' };
    }
  }

  // Alle Verträge (aktive + archivierte)
  async getAllContractsIncludingArchived(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [] };
    } catch (error: any) {
      console.error('Fehler beim Laden aller Verträge:', error);
      return { error: error.message || 'Fehler beim Laden aller Verträge' };
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
      const contractId = generateUUID();
      
      // Basis-Vertragsdaten mit korrekter Versionierung
      const newContractData = {
        id: contractId,
          name: contractData.name,
        description: contractData.description || '',
          auto_renew: contractData.auto_renew || false,
        renewal_term_months: contractData.renewal_duration || 12,
        renewal_monthly_price: contractData.renewal_monthly_price || 0,
        cancellation_period: contractData.cancellation_period || 30,
        cancellation_unit: contractData.cancellation_unit || 'days',
          is_active: true,
        
        // Versionierungs-Felder (neuer Vertrag = Version 1)
        contract_group_id: contractId, // Neue Gruppe = Contract ID
        version_number: 1,
        version_note: contractData.version_note || 'Initiale Version',
        
        // Kampagnen-Felder
        is_campaign_version: contractData.is_campaign_version || false,
        campaign_id: contractData.campaign_id || null,
        campaign_extension_date: contractData.campaign_extension_date || null,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: contract, error } = await supabase
        .from('contracts')
        .insert([newContractData])
        .select()
        .single();

      if (error) throw error;

      // Laufzeiten hinzufügen
      if (contractData.terms && contractData.terms.length > 0) {
        const terms = contractData.terms.map((term, index) => ({
          id: generateUUID(),
          contract_id: contract.id,
          duration_months: term.duration_months,
          base_price: term.base_price,
          is_default: index === 0, // Erste Laufzeit ist Standard
          created_at: new Date().toISOString()
        }));

        const { error: termsError } = await supabase
          .from('contract_terms')
          .insert(terms);

        if (termsError) throw termsError;
      }

      // Modul-Zuordnungen hinzufügen (falls vorhanden)
      if (contractData.module_assignments && contractData.module_assignments.length > 0) {
        const moduleAssignments = contractData.module_assignments.map(assignment => ({
          id: generateUUID(),
            contract_id: contract.id,
            module_id: assignment.module_id,
            assignment_type: assignment.assignment_type,
          custom_price: assignment.custom_price || null,
          created_at: new Date().toISOString()
          }));

          const { error: modulesError } = await supabase
            .from('contract_module_assignments')
          .insert(moduleAssignments);

        if (modulesError) {
          console.warn('Fehler beim Hinzufügen von Modul-Zuordnungen:', modulesError);
          // Nicht kritisch - Vertrag ist bereits erstellt
        }
      }

      // **NEU**: Startpakete hinzufügen (falls vorhanden)
      if (contractData.starter_packages && contractData.starter_packages.length > 0) {
        const starterPackages = contractData.starter_packages.map((pkg, index) => ({
          id: generateUUID(),
          contract_id: contract.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          is_mandatory: pkg.allow_installments || false,
          sort_order: index,
          created_at: new Date().toISOString()
        }));

        const { error: packagesError } = await supabase
          .from('contract_starter_packages')
          .insert(starterPackages);

        if (packagesError) {
          console.warn('Fehler beim Hinzufügen von Startpaketen:', packagesError);
        }
      }

      // **NEU**: Pauschalen hinzufügen (falls vorhanden)
      if (contractData.flat_rates && contractData.flat_rates.length > 0) {
        const flatRates = contractData.flat_rates.map((rate, index) => ({
          id: generateUUID(),
          contract_id: contract.id,
          name: rate.name,
          description: `Pauschale: ${rate.name}`,
          price: rate.price,
          billing_type: rate.payment_interval === 'yearly' ? 'yearly' : 'monthly',
          is_mandatory: false,
          sort_order: index,
          created_at: new Date().toISOString()
        }));

        const { error: ratesError } = await supabase
          .from('contract_flat_rates')
          .insert(flatRates);

        if (ratesError) {
          console.warn('Fehler beim Hinzufügen von Pauschalen:', ratesError);
        }
      }

      return { 
        data: contract, 
        message: 'Vertrag erfolgreich erstellt' 
      };
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Vertrags:', error);
      return { error: error.message || 'Fehler beim Erstellen des Vertrags' };
    }
  }

  async updateContract(id: string, contractData: Partial<ContractFormData>): Promise<ApiResponse<Contract>> {
    try {
      // 1. Hole aktuellen Vertrag
      const { data: currentContract, error: currentError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (currentError) throw currentError;
      if (!currentContract) throw new Error('Vertrag nicht gefunden');

      // 2. **ERWEITERT**: Erstelle neue Vertragsversion mit Vertragsnummer
      const nextVersionNumber = currentContract.version_number + 1;
      const contractNumber = this.generateContractNumber(
        currentContract.contract_group_id, 
        nextVersionNumber,
        // Kampagnen-Version falls Campaign-Contract
        contractData.is_campaign_version ? ((currentContract.campaign_version || 0) + 1) : undefined
      );

      // 3. **KORRIGIERT**: Erstelle neue Version nur mit existierenden DB-Spalten
      const newContractData = {
        // Basis-Felder (kopiere alle bestehenden als Fallback)
        id: generateUUID(), // Neue ID für neue Version
        name: contractData.name !== undefined ? contractData.name : currentContract.name,
        description: contractData.description !== undefined ? contractData.description : currentContract.description,
        
        // Verlängerung (verwende korrekte DB-Spaltennamen)
        auto_renew: contractData.auto_renew !== undefined ? contractData.auto_renew : currentContract.auto_renew,
        renewal_term_months: contractData.renewal_duration !== undefined ? contractData.renewal_duration : currentContract.renewal_term_months,
        
        // Kündigung
        cancellation_period: contractData.cancellation_period !== undefined ? contractData.cancellation_period : currentContract.cancellation_period,
        cancellation_unit: contractData.cancellation_unit !== undefined ? contractData.cancellation_unit : currentContract.cancellation_unit,
        
        // Gruppenrabatt (korrekte DB-Spaltennamen)
        group_discount_enabled: contractData.group_discount_bookable !== undefined ? contractData.group_discount_bookable : currentContract.group_discount_enabled,
        group_discount_value: contractData.group_discount_value !== undefined ? contractData.group_discount_value : currentContract.group_discount_value,
        group_discount_type: contractData.group_discount_type !== undefined ? contractData.group_discount_type : currentContract.group_discount_type,
        
        // Kampagnen-Felder (falls vorhanden)
        is_campaign_version: contractData.is_campaign_version !== undefined ? contractData.is_campaign_version : currentContract.is_campaign_version,
        campaign_id: contractData.campaign_id !== undefined ? contractData.campaign_id : currentContract.campaign_id,
        campaign_extension_date: contractData.campaign_extension_date !== undefined ? contractData.campaign_extension_date : currentContract.campaign_extension_date,
        
        // Versionierungs-Felder
        contract_group_id: currentContract.contract_group_id,
        version_number: nextVersionNumber,
        contract_number: contractNumber, // **NEU**: Vertragsnummer hinzufügen
        version_note: contractData.version_note || `Version ${nextVersionNumber}`,
        is_active: true, // Neue Version wird aktiv
        created_from_version_id: currentContract.id, // Referenz zur alten Version
        
        // Meta-Felder
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Erstelle neue Version:', {
        oldVersion: currentContract.version_number,
        newVersion: nextVersionNumber,
        contractNumber: contractNumber,
        isCampaign: contractData.is_campaign_version
      });

      // 4. Deaktiviere alte Version
      const { error: deactivateError } = await supabase
        .from('contracts')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (deactivateError) throw deactivateError;

      // 5. Erstelle neue Version
      const { data: newContract, error: insertError } = await supabase
        .from('contracts')
        .insert([newContractData])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Fehler beim Erstellen der neuen Version:', insertError);
        throw insertError;
      }

      console.log('✅ Neue Vertragsversion erstellt:', newContract.id);

      // 6. Kopiere/Erstelle Vertragskonditionen
      if (contractData.terms && contractData.terms.length > 0) {
        console.log('🔄 Speichere neue Terms:', contractData.terms.length);
        
        for (const term of contractData.terms) {
          await supabase
            .from('contract_terms')
            .insert({
              id: generateUUID(),
              contract_id: newContract.id,
              duration_months: term.duration_months,
              base_price: term.base_price,
              sort_order: 0,
              created_at: new Date().toISOString()
            });
        }
      } else {
        // Kopiere bestehende Terms zur neuen Version
        const { data: existingTerms } = await supabase
          .from('contract_terms')
          .select('*')
          .eq('contract_id', id);

        if (existingTerms && existingTerms.length > 0) {
          console.log('🔄 Kopiere bestehende Terms:', existingTerms.length);
          
          const newTerms = existingTerms.map(term => ({
            id: generateUUID(),
            contract_id: newContract.id,
            duration_months: term.duration_months,
            base_price: term.base_price,
            sort_order: term.sort_order || 0,
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('contract_terms')
            .insert(newTerms);
        }
      }

      // 7. **KORRIGIERT**: Verarbeite Modul-Zuordnungen (verwende contract_module_assignments)
      if (contractData.module_assignments && contractData.module_assignments.length > 0) {
        console.log('🔄 Speichere neue Module-Zuordnungen:', contractData.module_assignments.length);
        
        const newModuleAssignments = contractData.module_assignments.map(assignment => ({
          id: generateUUID(),
          contract_id: newContract.id,
          module_id: assignment.module_id,
          assignment_type: assignment.assignment_type,
          custom_price: assignment.custom_price || null,
          created_at: new Date().toISOString()
        }));

        const { error: moduleError } = await supabase
          .from('contract_module_assignments')
          .insert(newModuleAssignments);

        if (moduleError) {
          console.error('❌ Fehler beim Speichern der Module:', moduleError);
        } else {
          console.log('✅ Module erfolgreich gespeichert:', newModuleAssignments.length);
        }
      } else {
        // Kopiere bestehende Module-Zuordnungen
        const { data: existingModuleAssignments } = await supabase
          .from('contract_module_assignments')
          .select('*')
          .eq('contract_id', id);

        if (existingModuleAssignments && existingModuleAssignments.length > 0) {
          console.log('🔄 Kopiere bestehende Module-Zuordnungen:', existingModuleAssignments.length);
          
          const newModuleAssignments = existingModuleAssignments.map(assignment => ({
            id: generateUUID(),
            contract_id: newContract.id,
            module_id: assignment.module_id,
            assignment_type: assignment.assignment_type,
            custom_price: assignment.custom_price,
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('contract_module_assignments')
            .insert(newModuleAssignments);
        }
      }

      // 8. **NEU**: Verarbeite Startpakete (separate Tabelle)
      if (contractData.starter_packages && contractData.starter_packages.length > 0) {
        console.log('🔄 Speichere Startpakete:', contractData.starter_packages.length);
        
        const newStarterPackages = contractData.starter_packages.map((pkg, index) => ({
          id: generateUUID(),
          contract_id: newContract.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          is_mandatory: pkg.allow_installments || false, // Mapping anpassen
          sort_order: index,
          created_at: new Date().toISOString()
        }));

        const { error: packageError } = await supabase
          .from('contract_starter_packages')
          .insert(newStarterPackages);

        if (packageError) {
          console.error('❌ Fehler beim Speichern der Startpakete:', packageError);
        } else {
          console.log('✅ Startpakete erfolgreich gespeichert:', newStarterPackages.length);
        }
      } else {
        // Kopiere bestehende Startpakete
        const { data: existingPackages } = await supabase
          .from('contract_starter_packages')
          .select('*')
          .eq('contract_id', id);

        if (existingPackages && existingPackages.length > 0) {
          console.log('🔄 Kopiere bestehende Startpakete:', existingPackages.length);
          
          const newStarterPackages = existingPackages.map(pkg => ({
            id: generateUUID(),
            contract_id: newContract.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            is_mandatory: pkg.is_mandatory,
            sort_order: pkg.sort_order,
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('contract_starter_packages')
            .insert(newStarterPackages);
        }
      }

      // 9. **NEU**: Verarbeite Pauschalen (separate Tabelle)
      if (contractData.flat_rates && contractData.flat_rates.length > 0) {
        console.log('🔄 Speichere Pauschalen:', contractData.flat_rates.length);
        
        const newFlatRates = contractData.flat_rates.map((rate, index) => ({
          id: generateUUID(),
          contract_id: newContract.id,
          name: rate.name,
          description: `Pauschale: ${rate.payment_interval}`, // Nutze payment_interval als description
          price: rate.price,
          billing_type: rate.payment_interval === 'fixed_date' ? 'once' : 
                       rate.payment_interval === 'quarterly' ? 'quarterly' : 
                       rate.payment_interval === 'yearly' ? 'yearly' : 'monthly',
          is_mandatory: false,
          sort_order: index,
          created_at: new Date().toISOString()
        }));

        const { error: flatRateError } = await supabase
          .from('contract_flat_rates')
          .insert(newFlatRates);

        if (flatRateError) {
          console.error('❌ Fehler beim Speichern der Pauschalen:', flatRateError);
        } else {
          console.log('✅ Pauschalen erfolgreich gespeichert:', newFlatRates.length);
        }
      } else {
        // Kopiere bestehende Pauschalen
        const { data: existingFlatRates } = await supabase
          .from('contract_flat_rates')
          .select('*')
          .eq('contract_id', id);

        if (existingFlatRates && existingFlatRates.length > 0) {
          console.log('🔄 Kopiere bestehende Pauschalen:', existingFlatRates.length);
          
          const newFlatRates = existingFlatRates.map(rate => ({
            id: generateUUID(),
            contract_id: newContract.id,
            name: rate.name,
            description: rate.description,
            price: rate.price,
            billing_type: rate.billing_type,
            is_mandatory: rate.is_mandatory,
            sort_order: rate.sort_order,
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('contract_flat_rates')
            .insert(newFlatRates);
        }
      }

      // 10. **NEU**: Verarbeite Preisdynamik (contract_pricing Tabelle)
      if (contractData.price_dynamic_rules && contractData.price_dynamic_rules.length > 0) {
        console.log('🔄 Speichere Preisdynamik-Regeln:', contractData.price_dynamic_rules.length);
        
        const newPricingRules = contractData.price_dynamic_rules.map(rule => {
          // Mapping Frontend-Typen zu DB-Typen
          let pricing_type = 'einmalig';
          let trigger_type = null;
          let trigger_date = null;
          let trigger_day = null;
          let repeat_interval = null;
          let repeat_after_months = null;

          if (rule.adjustment_type === 'one_time_on_date') {
            pricing_type = 'stichtag';
            trigger_type = 'manual_date';
            trigger_date = rule.target_date || null;
          } else if (rule.adjustment_type === 'recurring_on_date') {
            pricing_type = 'wiederholend';
            trigger_type = 'monthly_first';
            trigger_day = rule.recurring_day || 1;
            repeat_interval = 'monthly';
          } else if (rule.adjustment_type === 'after_duration') {
            pricing_type = 'wiederholend';
            repeat_after_months = rule.after_months || 1;
            repeat_interval = 'monthly';
          }

          return {
            id: generateUUID(),
            contract_id: newContract.id,
            name: rule.name,
            pricing_type,
            trigger_type,
            trigger_date,
            trigger_day,
            repeat_interval,
            repeat_after_months,
            adjustment_type: rule.adjustment_value_type === 'percent' ? 'percentage' : 'fixed_amount',
            adjustment_value: rule.adjustment_value,
            is_active: true,
            created_at: new Date().toISOString()
          };
        });

        const { error: pricingError } = await supabase
          .from('contract_pricing')
          .insert(newPricingRules);

        if (pricingError) {
          console.error('❌ Fehler beim Speichern der Preisdynamik:', pricingError);
        } else {
          console.log('✅ Preisdynamik erfolgreich gespeichert:', newPricingRules.length);
        }
      } else {
        // Kopiere bestehende Preisdynamik
        const { data: existingPricing } = await supabase
          .from('contract_pricing')
          .select('*')
          .eq('contract_id', id);

        if (existingPricing && existingPricing.length > 0) {
          console.log('🔄 Kopiere bestehende Preisdynamik:', existingPricing.length);
          
          const newPricingRules = existingPricing.map(pricing => ({
            id: generateUUID(),
            contract_id: newContract.id,
            name: pricing.name,
            pricing_type: pricing.pricing_type,
            trigger_type: pricing.trigger_type,
            trigger_date: pricing.trigger_date,
            trigger_day: pricing.trigger_day,
            repeat_interval: pricing.repeat_interval,
            repeat_after_months: pricing.repeat_after_months,
            adjustment_type: pricing.adjustment_type,
            adjustment_value: pricing.adjustment_value,
            valid_from: pricing.valid_from,
            valid_until: pricing.valid_until,
            is_active: pricing.is_active,
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('contract_pricing')
            .insert(newPricingRules);
        }
      }

      // 11. **NEU**: Verarbeite Zahlungsintervalle (in eigene Tabelle speichern)
      if (contractData.payment_intervals && contractData.payment_intervals.length > 0) {
        console.log('🔄 Speichere Payment Intervals:', contractData.payment_intervals.length);
        
        const newPaymentIntervals = contractData.payment_intervals.map(interval => ({
          id: generateUUID(),
          contract_id: newContract.id,
          interval_type: interval.interval,
          is_enabled: interval.enabled,
          discount_percent: interval.discount_percent || 0,
          created_at: new Date().toISOString()
        }));

        const { error: intervalError } = await supabase
          .from('contract_payment_intervals')
          .insert(newPaymentIntervals);

        if (intervalError) {
          console.error('❌ Fehler beim Speichern der Payment Intervals:', intervalError);
        } else {
          console.log('✅ Payment Intervals erfolgreich gespeichert:', newPaymentIntervals.length);
        }
      } else {
        // **NEU**: Kopiere bestehende Payment Intervals
        const { data: existingIntervals } = await supabase
          .from('contract_payment_intervals')
          .select('*')
          .eq('contract_id', id);

        if (existingIntervals && existingIntervals.length > 0) {
          console.log('🔄 Kopiere bestehende Payment Intervals:', existingIntervals.length);
          
          const newPaymentIntervals = existingIntervals.map(interval => ({
            id: generateUUID(),
            contract_id: newContract.id,
            interval_type: interval.interval_type,
            is_enabled: interval.is_enabled,
            discount_percent: interval.discount_percent,
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('contract_payment_intervals')
            .insert(newPaymentIntervals);
        }
      }

      // **NEU**: Verarbeite Starter-Package Module-Zuordnungen (nach Starter-Paketen)
      if (contractData.starter_packages && contractData.starter_packages.length > 0) {
        console.log('🔄 Verarbeite Starter-Package Module-Zuordnungen...');
        
        // Für jedes Starter-Paket die Module-Zuordnungen speichern
        for (let packageIndex = 0; packageIndex < contractData.starter_packages.length; packageIndex++) {
          const starterPackage = contractData.starter_packages[packageIndex];
          
          if (starterPackage.included_modules && starterPackage.included_modules.length > 0) {
            console.log(`📦 Package ${packageIndex + 1}: ${starterPackage.included_modules.length} Module`);
            
            // Finde das entsprechende gespeicherte Starter-Paket
            const { data: savedPackages } = await supabase
              .from('contract_starter_packages')
              .select('id')
              .eq('contract_id', newContract.id)
              .eq('sort_order', packageIndex)
              .single();
            
            if (savedPackages) {
              const packageModuleAssignments = starterPackage.included_modules.map(moduleId => ({
                id: generateUUID(),
                starter_package_id: savedPackages.id,
                module_id: moduleId,
                is_included: true,
                custom_price: null,
                created_at: new Date().toISOString()
              }));

              const { error: packageModuleError } = await supabase
                .from('contract_starter_package_modules')
                .insert(packageModuleAssignments);

              if (packageModuleError) {
                console.error(`❌ Fehler beim Speichern der Module für Package ${packageIndex + 1}:`, packageModuleError);
              } else {
                console.log(`✅ Module für Package ${packageIndex + 1} gespeichert:`, packageModuleAssignments.length);
              }
            }
          }
        }
      }

      console.log('✅ Vertragsupdate abgeschlossen - Version', nextVersionNumber);

      return { 
        data: newContract, 
        message: `Neue Version ${nextVersionNumber} erfolgreich erstellt` 
      };
    } catch (error: any) {
      console.error('❌ Fehler beim Aktualisieren des Vertrags:', error);
      return { error: error.message || 'Fehler beim Aktualisieren des Vertrags' };
    }
  }

  async updateContractStatus(id: string, updates: { is_active?: boolean; is_archived?: boolean }): Promise<ApiResponse<void>> {
    try {
      // Konvertiere is_archived zu is_active (inverse logic)
      const dbUpdates: any = {};

      if (updates.is_active !== undefined) {
        dbUpdates.is_active = updates.is_active;
      }
      
      if (updates.is_archived !== undefined) {
        dbUpdates.is_active = !updates.is_archived; // Archiviert = inaktiv
      }

      const { error } = await supabase
        .from('contracts')
        .update(dbUpdates)
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
      // Zuerst versuchen mit Join
      let { data, error } = await supabase
        .from('contract_modules')
        .select(`
          *,
          module_categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      // Falls Join fehlschlägt, versuche ohne Join
      if (error) {
        console.warn('Join failed, trying without join:', error.message);
        const fallbackResult = await supabase
          .from('contract_modules')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fallbackResult.error) throw fallbackResult.error;
        
        data = fallbackResult.data;
        
        // Separat category laden falls vorhanden
        if (data.category_id) {
          const categoryResult = await supabase
            .from('module_categories')
            .select('name')
            .eq('id', data.category_id)
            .single();
          
          if (!categoryResult.error && categoryResult.data) {
            data.module_categories = { name: categoryResult.data.name };
          }
        }
      }

      const module = {
        ...data,
        category_name: data.module_categories?.name || null
      };

      return { data: module };
    } catch (error: any) {
      console.error('Fehler beim Laden des Moduls:', error);
      return { error: error.message || 'Fehler beim Laden des Moduls' };
    }
  }

  // 🆕 NEU: Update Module Method
  async updateModule(id: string, moduleData: ModuleFormData): Promise<ApiResponse<ContractModule>> {
    try {
      const updateData = {
        name: moduleData.name,
        description: moduleData.description || null,
        category_id: moduleData.category_id || null,
        price_per_month: moduleData.price_per_month,
        price_type: moduleData.price_type,
        icon_name: moduleData.icon_name || null,
        is_active: moduleData.is_active,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('contract_modules')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          module_categories (
            name
          )
        `)
        .single();

      if (error) throw error;

      const updatedModule = {
        ...data,
        category_name: data.module_categories?.name || null
      };

      return { data: updatedModule };
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Moduls:', error);
      return { error: error.message || 'Fehler beim Aktualisieren des Moduls' };
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
        // Store structured data as JSON
        required_modules: JSON.stringify(documentData.required_modules),
        optional_modules: JSON.stringify(documentData.optional_modules),
        custom_sections: JSON.stringify(documentData.custom_sections),
        assigned_contracts: JSON.stringify(documentData.assigned_contracts),
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
      const { data, error } = await supabase
        .from('contract_documents')
        .select(`
          *,
          contract_assignments:contract_document_assignments(
            contract_id,
            contracts(name)
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Transform data to include contract assignments
      const documents = data?.map(doc => ({
        ...doc,
        assigned_contracts: doc.contract_assignments?.map((a: any) => a.contract_id) || [],
        assigned_contract_names: doc.contract_assignments?.map((a: any) => a.contracts?.name).filter(Boolean) || []
      })) || [];

      return { data: documents };
    } catch (error: any) {
      console.error('Fehler beim Laden der Dokumente:', error);
      return { error: error.message || 'Fehler beim Laden der Dokumente' };
    }
  }

  async getDocument(id: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('contract_documents')
        .select(`
          *,
          sections:contract_document_sections(*),
          assignments:contract_document_assignments(
            contract_id,
            override_settings,
            contracts(name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Parse JSON fields safely
      const document = {
        ...data,
        required_modules: this.parseJsonField(data.required_modules),
        optional_modules: this.parseJsonField(data.optional_modules),
        custom_sections: this.parseJsonField(data.custom_sections),
        assigned_contracts: this.parseJsonField(data.assigned_contracts) || [],
        assigned_contract_names: data.assignments?.map((a: any) => a.contracts?.name).filter(Boolean) || []
      };

      return { data: document };
    } catch (error: any) {
      console.error('Fehler beim Laden des Dokuments:', error);
      return { error: error.message || 'Fehler beim Laden des Dokuments' };
    }
  }

  async updateDocument(id: string, documentData: Partial<DocumentFormData>): Promise<ApiResponse<any>> {
    try {
      const updateData: any = {
        name: documentData.name,
        description: documentData.description,
        show_payment_calendar: documentData.show_payment_calendar,
        show_service_content: documentData.show_service_content,
        show_member_data: documentData.show_member_data,
        header_template: documentData.header_template,
        footer_template: documentData.footer_template,
        css_styles: documentData.css_styles,
        updated_at: new Date().toISOString()
      };

      // Only update structured data if provided
      if (documentData.required_modules) {
        updateData.required_modules = JSON.stringify(documentData.required_modules);
      }
      if (documentData.optional_modules) {
        updateData.optional_modules = JSON.stringify(documentData.optional_modules);
      }
      if (documentData.custom_sections) {
        updateData.custom_sections = JSON.stringify(documentData.custom_sections);
      }
      if (documentData.assigned_contracts) {
        updateData.assigned_contracts = JSON.stringify(documentData.assigned_contracts);
      }

      const { data, error } = await supabase
        .from('contract_documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data, message: 'Dokument erfolgreich aktualisiert' };
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Dokuments:', error);
      return { error: error.message || 'Fehler beim Aktualisieren des Dokuments' };
    }
  }

  async generateDocumentPreview(documentId: string, contractId?: string): Promise<ApiResponse<string>> {
    try {
      // Lade Dokument-Daten
      const documentResponse = await this.getDocument(documentId);
      if (documentResponse.error || !documentResponse.data) {
        return { error: 'Dokument nicht gefunden' };
      }

      const document = documentResponse.data;
      
      // Lade Vertragsdaten falls ID vorhanden
      let contract = null;
      if (contractId) {
        const contractResponse = await this.getContractDetails(contractId);
        if (contractResponse.data) {
          contract = contractResponse.data;
        }
      } else if (document.assigned_contracts?.length > 0) {
        // Verwende ersten zugeordneten Vertrag als Standard
        const contractResponse = await this.getContractDetails(document.assigned_contracts[0]);
        if (contractResponse.data) {
          contract = contractResponse.data;
        }
      }

      // Generiere HTML für PDF-Vorschau
      let html = this.generateDocumentHTML(document, contract);
      
      return { data: html };
    } catch (error: any) {
      console.error('Fehler beim Generieren der Dokumentvorschau:', error);
      return { error: error.message || 'Fehler beim Generieren der Dokumentvorschau' };
    }
  }

  async generateDocumentPreviewFromData(documentData: any, contractId?: string): Promise<ApiResponse<string>> {
    try {
      // Lade Vertragsdaten falls ID vorhanden
      let contract = null;
      if (contractId) {
        const contractResponse = await this.getContractDetails(contractId);
        if (contractResponse.data) {
          contract = contractResponse.data;
        }
      }

      // Generiere HTML für PDF-Vorschau mit übergebenen Daten
      let html = this.generateDocumentHTML(documentData, contract);
      
      return { data: html };
    } catch (error: any) {
      console.error('Fehler beim Generieren der Dokumentvorschau:', error);
      return { error: error.message || 'Fehler beim Generieren der Dokumentvorschau' };
    }
  }

  private parseJsonField(field: any): any {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return null;
      }
    }
    return field;
  }

  private generateDocumentHTML(document: any, contract: any): string {
    // Vollständige Testkunden-Daten basierend auf Screenshots
    const mockMemberData = this.getTestCustomerData(contract);

    // Studio-Informationen für Fußzeile
    const studioData = this.getStudioData();

    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
            .logo-placeholder { width: 100px; height: 60px; background: #f0f0f0; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px; }
            .section { margin-bottom: 40px; }
            .section-title { color: #333; font-size: 18px; margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-left: 4px solid #007bff; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
            .grid-4 { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 10px; }
            .field { margin-bottom: 10px; }
            .field-label { font-weight: bold; color: #666; font-size: 12px; }
            .field-value { padding: 8px; background: #f5f5f5; border: 1px solid #ddd; margin-top: 2px; }
            .signature-field { border-bottom: 1px solid #333; width: 300px; margin-top: 30px; padding-bottom: 5px; }
            .signature-label { font-size: 12px; color: #666; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #666; text-align: center; display: flex; justify-content: space-between; align-items: center; }
            .page-break { page-break-before: always; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f8f9fa; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
    `;

    // Kopfzeile mit Logo
    html += `
      <div class="header">
        <div>
          <h1 style="margin: 0; color: #333; font-size: 24px;">${document.name}</h1>
        </div>
        <div style="text-align: right;">
          <div class="logo-placeholder">LOGO</div>
        </div>
      </div>
    `;

    // Persönliche Daten Sektion
    html += this.generateContractInfoSection(contract, document.required_modules.contract_info);

    // Optional: Payment Calendar
    if (document.optional_modules?.payment_calendar?.enabled) {
      html += `
        <div class="page-break section">
          <h2 class="section-title">ZAHLUNGSKALENDER</h2>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Art</th>
                <th>Beschreibung</th>
                <th class="text-right">Betrag</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>18.06.2025</td><td>Vertrag</td><td>All In<br>01.04.2025 - 30.04.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>18.06.2025</td><td>Vertrag</td><td>All In<br>01.05.2025 - 31.05.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>18.06.2025</td><td>Vertrag</td><td>All In<br>01.06.2025 - 30.06.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>18.06.2025</td><td>Startpaket</td><td>All In</td><td class="text-right">19,99 €</td></tr>
              <tr><td>01.07.2025</td><td>Vertrag</td><td>All In<br>01.07.2025 - 31.07.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.08.2025</td><td>Vertrag</td><td>All In<br>01.08.2025 - 31.08.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.09.2025</td><td>Vertrag</td><td>All In<br>01.09.2025 - 30.09.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.10.2025</td><td>Vertrag</td><td>All In<br>01.10.2025 - 31.10.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.11.2025</td><td>Vertrag</td><td>All In<br>01.11.2025 - 30.11.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.12.2025</td><td>Vertrag</td><td>All In<br>01.12.2025 - 31.12.2025</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.01.2026</td><td>Vertrag</td><td>All In<br>01.01.2026 - 31.01.2026</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.02.2026</td><td>Vertrag</td><td>All In<br>01.02.2026 - 28.02.2026</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.03.2026</td><td>Vertrag</td><td>All In<br>01.03.2026 - 31.03.2026</td><td class="text-right">50,00 €</td></tr>
              <tr><td>01.04.2026</td><td>Vertrag</td><td>All In<br>01.04.2026 - 30.04.2026</td><td class="text-right">50,00 €</td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Custom Sections
    if (document.custom_sections && document.custom_sections.length > 0) {
      const sortedSections = document.custom_sections.sort((a: any, b: any) => a.sort_order - b.sort_order);
      sortedSections.forEach((section: any) => {
        html += `
          <div class="section">
            <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">${section.title}</h3>
            <div style="margin-bottom: 15px;">${section.content || ''}</div>
            ${section.requires_signature ? '<div class="signature-field"><div class="signature-label">Unterschrift</div></div>' : ''}
          </div>
        `;
      });
    }

    // Fußzeile mit Studio-Informationen
    html += `
      <div class="footer">
        <div style="text-align: left;">
          <strong>${studioData.name}</strong><br>
          ${studioData.address} // ${studioData.postal_code} ${studioData.city} // ${studioData.phone} // ${studioData.website}
        </div>
        <div style="text-align: right;">
          Sparkasse Neunkirchen IBAN ${studioData.iban} BIC ${studioData.bic} // ${studioData.ust_id}
        </div>
      </div>
    `;

    html += `
        </body>
      </html>
    `;

    return html;
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('contract_documents')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      return { message: 'Dokument erfolgreich deaktiviert' };
    } catch (error: any) {
      console.error('Fehler beim Deaktivieren des Dokuments:', error);
      return { error: error.message || 'Fehler beim Deaktivieren des Dokuments' };
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
      // Suche sowohl nach contract_group_id als auch nach der ID selbst (für Legacy-Verträge)
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          name,
          description,
          version_number,
          version_note,
          is_active,
          is_archived,
          is_campaign_version,
          campaign_id,
          campaign_start_date,
          campaign_end_date,
          campaign_extension_date,
          contract_group_id,
          created_at,
          updated_at
        `)
        .or(`contract_group_id.eq.${contractGroupId},id.eq.${contractGroupId}`)
        .eq('is_archived', false) // Nur nicht-archivierte Versionen
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
      // 1. Hole Basis-Vertragsdaten (nicht Detail-Call da der möglicherweise komplex ist)
      const { data: originalContract, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;
      if (!originalContract) throw new Error('Vertrag nicht gefunden');

      // 2. Erstelle Duplikat mit korrigierter Datenstruktur
      const newContractData = {
        name: newName || `${originalContract.name} (Kopie)`,
        description: originalContract.description || '',
        auto_renew: originalContract.auto_renew || false,
        renewal_term_months: originalContract.renewal_term_months || 12,
        cancellation_period: originalContract.cancellation_period || 30,
        cancellation_unit: originalContract.cancellation_unit || 'days',
        is_active: true, // Neue Verträge sind standardmäßig aktiv
        // Felder die nicht kopiert werden sollten
        contract_group_id: generateUUID(), // Neue Gruppe für Duplikat
        version_number: 1,
        version_note: 'Dupliziert von: ' + originalContract.name
      };

      const { data: newContract, error: insertError } = await supabase
        .from('contracts')
        .insert([newContractData])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('Vertrag erfolgreich dupliziert:', newContract);
      return { 
        data: newContract, 
        message: `Vertrag "${newContract.name}" erfolgreich erstellt` 
      };
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
          version_note
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

      // **ERWEITERT**: Module-Zuordnungen laden
      let moduleAssignments: any[] = [];
      try {
        // 1. Lade Module Assignments
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('contract_module_assignments')
          .select('id, module_id, assignment_type, custom_price')
          .eq('contract_id', contractId);

        if (!assignmentError && assignmentData && assignmentData.length > 0) {
          // 2. Lade Module-Details für jede Assignment
          const moduleIds = assignmentData.map(a => a.module_id);
          const { data: moduleDetails, error: moduleDetailsError } = await supabase
            .from('contract_modules')
            .select('id, name, description, price_per_month')
            .in('id', moduleIds);

          if (!moduleDetailsError && moduleDetails) {
            // 3. Kombiniere Assignments mit Module-Details
            moduleAssignments = assignmentData.map(assignment => {
              const moduleDetail = moduleDetails.find(m => m.id === assignment.module_id);
              return {
                ...assignment,
                module_name: moduleDetail?.name || 'Unbekanntes Modul',
                module_description: moduleDetail?.description,
                module_price: moduleDetail?.price_per_month,
                module: moduleDetail || null
              };
            });
            console.log('✅ Module Assignments geladen:', moduleAssignments.length);
          }
        }
      } catch (moduleError) {
        console.log('Module assignments not available:', moduleError);
      }

      // **NEU**: Startpakete laden
      let starterPackages: any[] = [];
      try {
        const { data: packagesData, error: packagesError } = await supabase
          .from('contract_starter_packages')
          .select('*')
          .eq('contract_id', contractId)
          .order('sort_order');

        if (!packagesError && packagesData) {
          starterPackages = packagesData.map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            allow_installments: pkg.is_mandatory, // Mapping anpassen
            max_installments: 12, // Default
            included_modules: [] // Default - wird unten erweitert
          }));

          // **NEU**: Lade Module-Zuordnungen für jedes Starter-Paket
          for (let i = 0; i < starterPackages.length; i++) {
            const starterPackage = starterPackages[i];
            
            try {
              const { data: packageModules, error: packageModulesError } = await supabase
                .from('contract_starter_package_modules')
                .select('module_id, is_included')
                .eq('starter_package_id', starterPackage.id)
                .eq('is_included', true);

              if (!packageModulesError && packageModules) {
                starterPackage.included_modules = packageModules.map(pm => pm.module_id);
                console.log(`📦 Package "${starterPackage.name}": ${starterPackage.included_modules.length} Module geladen`);
              }
            } catch (moduleError) {
              console.log(`Package modules for ${starterPackage.name} not available`);
              starterPackage.included_modules = [];
            }
          }
        }
      } catch (packageError) {
        console.log('Starter packages not available:', packageError);
      }

      // **NEU**: Pauschalen laden
      let flatRates: any[] = [];
      try {
        const { data: flatRatesData, error: flatRatesError } = await supabase
          .from('contract_flat_rates')
          .select('*')
          .eq('contract_id', contractId)
          .order('sort_order');

        if (!flatRatesError && flatRatesData) {
          flatRates = flatRatesData.map(rate => ({
            id: rate.id,
            name: rate.name,
            price: rate.price,
            payment_interval: rate.billing_type === 'quarterly' ? 'quarterly' : 
                             rate.billing_type === 'yearly' ? 'yearly' : 
                             rate.billing_type === 'once' ? 'fixed_date' : 'monthly',
            fixed_date: rate.billing_type === 'once' ? new Date().toISOString().split('T')[0] : undefined
          }));
        }
      } catch (flatRateError) {
        console.log('Flat rates not available:', flatRateError);
      }

      // **NEU**: Preisdynamik laden
      let priceDynamicRules: any[] = [];
      try {
        const { data: pricingData, error: pricingError } = await supabase
          .from('contract_pricing')
          .select('*')
          .eq('contract_id', contractId)
          .eq('is_active', true);

        if (!pricingError && pricingData) {
          priceDynamicRules = pricingData.map(pricing => {
            // Mapping DB-Typen zu Frontend-Typen
            let adjustment_type = 'one_time_on_date';
            let target_date = undefined;
            let recurring_day = undefined;
            let after_months = undefined;

            if (pricing.pricing_type === 'stichtag' && pricing.trigger_type === 'manual_date') {
              adjustment_type = 'one_time_on_date';
              target_date = pricing.trigger_date;
            } else if (pricing.pricing_type === 'wiederholend' && pricing.trigger_type === 'monthly_first') {
              adjustment_type = 'recurring_on_date';
              recurring_day = pricing.trigger_day;
            } else if (pricing.pricing_type === 'wiederholend' && pricing.repeat_after_months) {
              adjustment_type = 'after_duration';
              after_months = pricing.repeat_after_months;
            }

            return {
              id: pricing.id,
              name: pricing.name,
              adjustment_type,
              adjustment_value: pricing.adjustment_value,
              adjustment_value_type: pricing.adjustment_type === 'percentage' ? 'percent' : 'fixed',
              target_date,
              recurring_day,
              after_months
            };
          });
        }
      } catch (pricingError) {
        console.log('Price dynamic rules not available:', pricingError);
      }

      // **ERWEITERT**: Payment Intervals aus Datenbank laden
      let paymentIntervals = [
        { interval: 'monthly', enabled: true, discount_percent: 0 },
        { interval: 'semi_annual', enabled: false, discount_percent: 5 },
        { interval: 'yearly', enabled: false, discount_percent: 10 }
      ];

      try {
        const { data: intervalData, error: intervalError } = await supabase
          .from('contract_payment_intervals')
          .select('*')
          .eq('contract_id', contractId)
          .order('interval_type');

        if (!intervalError && intervalData && intervalData.length > 0) {
          paymentIntervals = intervalData.map(interval => ({
            interval: interval.interval_type,
            enabled: interval.is_enabled,
            discount_percent: interval.discount_percent || 0
          }));
          console.log('✅ Payment Intervals aus DB geladen:', paymentIntervals.length);
        } else {
          console.log('📝 Verwende Standard Payment Intervals (keine DB-Daten gefunden)');
        }
      } catch (intervalError) {
        console.log('Payment intervals table not available, using defaults');
      }

      // Kombiniere alle Daten
      const detailedContract = {
        ...contractData,
        terms: termsData?.map(term => ({
          duration_months: term.duration_months,
          base_price: term.base_price
        })) || [],
        module_assignments: moduleAssignments.map(ma => {
          const mappedAssignment = {
            module_id: ma.module?.id || ma.module_id,
            module_name: ma.module_name || ma.module?.name || 'Unbekanntes Modul',
            module_description: ma.module_description || ma.module?.description,
            module_price: ma.module_price || ma.module?.price_per_month,
            assignment_type: ma.assignment_type,
            custom_price: ma.custom_price
          };
          // Debug removed - problem solved
          return mappedAssignment;
        }),
        starter_packages: starterPackages,
        flat_rates: flatRates,
        price_dynamic_rules: priceDynamicRules,
        payment_intervals: paymentIntervals,
        
        // Mapping DB-Felder zu Frontend-Felder
        group_discount_bookable: contractData.group_discount_enabled || false,
        renewal_duration: contractData.renewal_term_months || 12
      };

      console.log('🔍 Contract Details geladen:', {
        contractId,
        termsCount: detailedContract.terms.length,
        moduleAssignmentsCount: detailedContract.module_assignments.length,
        starterPackagesCount: detailedContract.starter_packages.length,
        flatRatesCount: detailedContract.flat_rates.length,
        priceDynamicRulesCount: detailedContract.price_dynamic_rules.length
      });

      return { 
        data: detailedContract,
        message: 'Vertragsdaten erfolgreich geladen'
      };
    } catch (error: any) {
      console.error('Fehler beim Laden der Vertragsdetails:', error);
      return { error: error.message || 'Fehler beim Laden der Vertragsdetails' };
    }
  }

  // Neueste aktive Version eines Vertrags finden
  async getLatestContractVersion(contractGroupId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('contract_group_id', contractGroupId)
        .eq('is_active', true)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return { data };
    } catch (error: any) {
      console.error('Fehler beim Laden der neuesten Vertragsversion:', error);
      return { error: error.message || 'Fehler beim Laden der neuesten Vertragsversion' };
    }
  }

  // **ERWEITERT**: Generiere Vertragsnummer mit Kampagnen-Support (Format: 10000-2 oder 10000-3-1)
  generateContractNumber(contractGroupId: string, versionNumber: number, campaignVersion?: number): string {
    // Extrahiere die ersten 5 Ziffern der Group-ID als Basis-Nummer
    const cleanId = contractGroupId.replace(/-/g, '').replace(/[^0-9A-F]/gi, '');
    const baseNumber = parseInt(cleanId.substring(0, 8), 16).toString().substring(0, 5).padStart(5, '0');
    
    if (campaignVersion) {
      // Kampagnen-Format: 10000-3-1
      return `${baseNumber}-${versionNumber}-${campaignVersion}`;
    } else {
      // Standard-Format: 10000-2
      return `${baseNumber}-${versionNumber}`;
    }
  }

  // **ERWEITERT**: Parse Vertragsnummer mit Kampagnen-Support
  parseContractNumber(contractNumber: string): { 
    contractGroupId: string, 
    versionNumber: number, 
    campaignVersion?: number,
    isCampaignContract: boolean 
  } | null {
    // Kampagnen-Format: 10000-3-1
    const campaignMatch = contractNumber.match(/^(\d{5})-(\d+)-(\d+)$/);
    if (campaignMatch) {
      const [, baseNumber, version, campaignVer] = campaignMatch;
      return {
        contractGroupId: `${baseNumber}-0000-4000-8000-000000000000`, // Approximative Group-ID
        versionNumber: parseInt(version, 10),
        campaignVersion: parseInt(campaignVer, 10),
        isCampaignContract: true
      };
    }
    
    // Standard-Format: 10000-2
    const standardMatch = contractNumber.match(/^(\d{5})-(\d+)$/);
    if (standardMatch) {
      const [, baseNumber, version] = standardMatch;
      return {
        contractGroupId: `${baseNumber}-0000-4000-8000-000000000000`, // Approximative Group-ID
        versionNumber: parseInt(version, 10),
        isCampaignContract: false
      };
    }
    
    return null;
  }

  // **NEU**: Lade alle Kampagnenversionen eines Basis-Vertrags
  async getCampaignVersions(baseContractId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data: baseContract } = await this.getContract(baseContractId);
      if (!baseContract) {
        return { error: 'Basis-Vertrag nicht gefunden' };
      }

      const { data: campaignVersions, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('contract_group_id', (baseContract as any).contract_group_id || baseContract.id)
        .eq('is_campaign_version', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: campaignVersions || [] };
    } catch (error: any) {
      console.error('Fehler beim Laden der Kampagnenversionen:', error);
      return { error: error.message || 'Fehler beim Laden der Kampagnenversionen' };
    }
  }

  // **NEU**: Erstelle Kampagnen-Version eines bestehenden Vertrags
  async createCampaignVersion(
    baseContractId: string, 
    campaignId: string, 
    campaignData: Partial<ContractFormData>
  ): Promise<ApiResponse<any>> {
    try {
      console.log('🎯 Erstelle Kampagnen-Version für Contract:', baseContractId);
      
      // 1. Lade den Basis-Vertrag
      const baseResponse = await this.getContractDetails(baseContractId);
      if (baseResponse.error || !baseResponse.data) {
        return { error: 'Basis-Vertrag nicht gefunden' };
      }
      
      const baseContract = baseResponse.data;
      
      // 2. Bestimme nächste Kampagnen-Versionsnummer
      const { data: existingCampaigns } = await supabase
        .from('contracts')
        .select('version_number, campaign_version')
        .eq('contract_group_id', baseContract.contract_group_id)
        .eq('version_number', baseContract.version_number)
        .not('campaign_version', 'is', null)
        .order('campaign_version', { ascending: false });
      
      const nextCampaignVersion = existingCampaigns && existingCampaigns.length > 0 
        ? (existingCampaigns[0].campaign_version || 0) + 1 
        : 1;
      
      // 3. Generiere Kampagnen-Vertragsnummer
      const campaignContractNumber = this.generateContractNumber(
        baseContract.contract_group_id,
        baseContract.version_number,
        nextCampaignVersion
      );
      
      // 4. Erstelle Kampagnen-Vertrag
      const campaignContract = {
        ...baseContract,
        ...campaignData,
        id: generateUUID(),
        contract_group_id: baseContract.contract_group_id,
        version_number: baseContract.version_number,
        campaign_version: nextCampaignVersion,
        contract_number: campaignContractNumber,
        is_campaign_version: true,
        campaign_id: campaignId,
        name: `${baseContract.name} (Kampagne ${nextCampaignVersion})`,
        is_active: true
      };
      
      console.log('🎯 Kampagnen-Vertrag:', {
        contractNumber: campaignContractNumber,
        baseVersion: baseContract.version_number,
        campaignVersion: nextCampaignVersion
      });
      
      // 5. Speichere den Kampagnen-Vertrag
      const createResponse = await this.createContract(campaignContract);
      
      return createResponse;
    } catch (error: any) {
      console.error('Fehler beim Erstellen der Kampagnen-Version:', error);
      return { error: error.message || 'Fehler beim Erstellen der Kampagnen-Version' };
    }
  }

  private getTestCustomerData(contract: any) {
    return {
      member_number: '1-123',
      salutation: 'Herr',
      first_name: 'Max',
      last_name: 'Mustermann',
      street: 'Musterstraße',
      house_number: '1a',
      postal_code: '20000',
      city: 'Musterstadt',
      phone: '0123-4567890',
      mobile: '0123-4567891',
      email: 'max.mustermann@example.com',
      birth_date: '21.05.1983',
      // Bankdaten
      account_holder: 'Max Mustermann',
      iban: 'DE10XXXXXXXXXXXXXXX0001',
      bic: 'HASPDEHXXX',
      bank_name: 'Sparkasse Musterstadt',
      // Vertragsdaten
      contract_name: contract?.name || 'All In',
      monthly_fee: '50,00 €',
      setup_fee: '19,99 €',
      term_months: '24 Monate',
      cancellation_period: '1 Monat',
      contract_start: '01.01.2025',
      usage_start: '01.01.2025',
      // Verlängerung
      renewal_contract: 'Essential',
      renewal_fee: '59,00 €',
      renewal_payment: 'monatlich',
      renewal_term: '1 Monat',
      renewal_extension_period: '1 Monat',
      renewal_cancellation_period: '28 Tage',
      // Startpaket
      starter_package: 'Startpaket',
      starter_fee: '49,00 €',
      starter_payment: 'einmalig'
    };
  }

  private getStudioData() {
    return {
      name: 'Essence Sports- & Wellnessclub',
      address: 'Boxbergerweg 1',
      postal_code: '66538',
      city: 'Neunkirchen',
      phone: '+49 6821 4932890',
      website: 'www.essence-fitness.de',
      iban: 'DE07 5929 5204 0010 0429 15',
      bic: 'SALADE51NKS',
      ust_id: 'USt-ID: DE304653382'
    };
  }

  private generateContractInfoSection(contract: any, config: any): string {
    const mockMemberData = this.getTestCustomerData(contract);
    
    let html = `
      <div class="section">
        <h2 class="section-title">PERSÖNLICHE DATEN</h2>
        <div class="field">
          <div class="field-label">Mitgliedsnummer</div>
          <div class="field-value">${mockMemberData.member_number}</div>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Anrede</div>
            <div class="field-value">${mockMemberData.salutation}</div>
          </div>
          <div class="field">
            <div class="field-label">Vorname</div>
            <div class="field-value">${mockMemberData.first_name}</div>
          </div>
        </div>
        <div class="field">
          <div class="field-label">Nachname</div>
          <div class="field-value">${mockMemberData.last_name}</div>
        </div>
        <div class="grid-4" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Straße</div>
            <div class="field-value">${mockMemberData.street}</div>
          </div>
          <div class="field">
            <div class="field-label">Hausnummer</div>
            <div class="field-value">${mockMemberData.house_number}</div>
          </div>
          <div class="field">
            <div class="field-label">PLZ</div>
            <div class="field-value">${mockMemberData.postal_code}</div>
          </div>
          <div class="field">
            <div class="field-label">Ort</div>
            <div class="field-value">${mockMemberData.city}</div>
          </div>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Telefonnummer</div>
            <div class="field-value">${mockMemberData.phone}</div>
          </div>
          <div class="field">
            <div class="field-label">E-Mail-Adresse</div>
            <div class="field-value">${mockMemberData.email}</div>
          </div>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Mobil</div>
            <div class="field-value">${mockMemberData.mobile}</div>
          </div>
          <div class="field">
            <div class="field-label">Geburtsdatum</div>
            <div class="field-value">${mockMemberData.birth_date}</div>
          </div>
        </div>
      </div>
    `;

    // Vertragsdaten Sektion
    html += `
      <div class="section">
        <h2 class="section-title">VERTRAGSDATEN</h2>
        <p style="margin-bottom: 20px; color: #666;">Ich habe mich für den nachfolgenden Tarif entschieden:</p>
        <div class="field">
          <div class="field-label">Tarifname</div>
          <div class="field-value">${mockMemberData.contract_name}</div>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Höhe Beitrag</div>
            <div class="field-value">${mockMemberData.monthly_fee}</div>
          </div>
          <div class="field">
            <div class="field-label">Zahlweise</div>
            <div class="field-value">monatlich</div>
          </div>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Aufnahmegebühr</div>
            <div class="field-value">${mockMemberData.setup_fee}</div>
          </div>
          <div class="field">
            <div class="field-label">Mindestlaufzeit</div>
            <div class="field-value">${mockMemberData.term_months}</div>
          </div>
        </div>
        <div class="grid-2" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Vertragsbeginn</div>
            <div class="field-value">${mockMemberData.contract_start}</div>
          </div>
          <div class="field">
            <div class="field-label">Nutzungsbeginn</div>
            <div class="field-value">${mockMemberData.usage_start}</div>
          </div>
        </div>
        <div class="field">
          <div class="field-label">Kündigungsfrist</div>
          <div class="field-value">${mockMemberData.cancellation_period}</div>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Es gelten die beigefügten AGB des Vertragsgebers, namentlich Essence Sports- & Wellnessclub.
        </p>
      </div>
    `;

    // Verlängerung in Folgevertrag
    html += `
      <div class="section">
        <h2 class="section-title">VERLÄNGERUNG IN FOLGEVERTRAG</h2>
        <div class="grid-3">
          <div class="field">
            <div class="field-label">Tarifname</div>
            <div class="field-value">${mockMemberData.renewal_contract}</div>
          </div>
          <div class="field">
            <div class="field-label">Höhe Beitrag</div>
            <div class="field-value">${mockMemberData.renewal_fee}</div>
          </div>
          <div class="field">
            <div class="field-label">Zahlweise</div>
            <div class="field-value">${mockMemberData.renewal_payment}</div>
          </div>
        </div>
        <div class="grid-3" style="margin-top: 10px;">
          <div class="field">
            <div class="field-label">Mindestlaufzeit</div>
            <div class="field-value">${mockMemberData.renewal_term}</div>
          </div>
          <div class="field">
            <div class="field-label">Vertragsverlängerungsdauer</div>
            <div class="field-value">${mockMemberData.renewal_extension_period}</div>
          </div>
          <div class="field">
            <div class="field-label">Kündigungsfrist</div>
            <div class="field-value">${mockMemberData.renewal_cancellation_period}</div>
          </div>
        </div>
      </div>
    `;

    // Pauschalen des Folgevertrags
    html += `
      <div class="section">
        <h2 class="section-title">PAUSCHALEN DES FOLGEVERTRAGS</h2>
        <div class="grid-3">
          <div class="field">
            <div class="field-label">Bezeichnung</div>
            <div class="field-value">${mockMemberData.starter_package}</div>
          </div>
          <div class="field">
            <div class="field-label">Höhe Beitrag</div>
            <div class="field-value">${mockMemberData.starter_fee}</div>
          </div>
          <div class="field">
            <div class="field-label">Zahlweise</div>
            <div class="field-value">${mockMemberData.starter_payment}</div>
          </div>
        </div>
      </div>
    `;

    // Preisdynamik (wenn aktiviert)
    if (config?.include_dynamics) {
      html += `
        <div class="section">
          <h2 class="section-title">PREISDYNAMIK UND ANPASSUNGEN</h2>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #555;">Beitragsanpassungen</h3>
            <p style="margin-bottom: 15px; color: #666; font-size: 14px;">
              Die Mitgliedsbeiträge können unter folgenden Bedingungen angepasst werden:
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <div class="field">
                  <div class="field-label">Erste 3 Monate</div>
                  <div class="field-value">-20% Rabatt (40,00 €)</div>
                </div>
              </div>
              <div>
                <div class="field">
                  <div class="field-label">Ab dem 4. Monat</div>
                  <div class="field-value">Vollpreis (50,00 €)</div>
                </div>
              </div>
            </div>
            <div style="margin-top: 15px;">
              <div class="field">
                <div class="field-label">Jährliche Anpassung</div>
                <div class="field-value">Max. 3% zum 01.01. jeden Jahres</div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #555;">Sonderaktionen</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Neujahrs-Aktion:</strong> Bei Vertragsabschluss bis 31.01. entfällt die Aufnahmegebühr.
              </p>
            </div>
          </div>
        </div>
      `;
    }
    
    // SEPA-Lastschriftmandat (neue Seite)
    if (config?.include_sepa) {
      html += `
        <div class="page-break section">
          <h2 class="section-title">SEPA-LASTSCHRIFTMANDAT</h2>
          <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.6;">
            <p>Ich ermächtige Essence Neunkirchen, Zahlungen von meinem Konto unter Angabe der Gläubiger ID-Nr DE79GHS00002620069 mittels Lastschrift einzuziehen.</p>
            <p>Zugleich weise ich mein Kreditinstitut an, die von Essence Neunkirchen auf meinem Konto gezogenen Lastschriften einzulösen.</p>
          </div>
          
          <div class="grid-2" style="margin-bottom: 20px;">
            <div class="field">
              <div class="field-label">Vorname und Name (Kontoinhaber)</div>
              <div class="field-value">${mockMemberData.account_holder}</div>
            </div>
            <div class="field">
              <div class="field-label">BIC</div>
              <div class="field-value">${mockMemberData.bic}</div>
            </div>
          </div>
          
          <div class="grid-2" style="margin-bottom: 20px;">
            <div class="field">
              <div class="field-label">Kreditinstitut (Name)</div>
              <div class="field-value">${mockMemberData.bank_name}</div>
            </div>
            <div class="field">
              <div class="field-label">SEPA Mandatsreferenz-Nummer</div>
              <div class="field-value">MLREF-MUSTER</div>
            </div>
          </div>
          
          <div class="field" style="margin-bottom: 30px;">
            <div class="field-label">IBAN</div>
            <div class="field-value" style="letter-spacing: 2px;">${mockMemberData.iban}</div>
          </div>
          
          <div class="grid-2" style="margin-top: 40px;">
            <div class="signature-field">
              <div style="margin-bottom: 40px;">Neunkirchen, 18.06.2025</div>
              <div class="signature-label">Ort, Datum/Unterschrift Kontoinhaber</div>
            </div>
            <div class="signature-field">
              <div style="margin-bottom: 40px;">Neunkirchen, 18.06.2025</div>
              <div class="signature-label">Ort, Datum/Unterschrift Erziehungsberechtigter bei Minderjährigen</div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Zahlungskalender
    if (config?.show_payment_calendar) {
      html += this.generatePaymentCalendar();
    }
    
    // Service-Übersicht (optional)
    if (config?.optional_modules?.service_overview?.enabled) {
      html += this.generateServiceOverview(config.optional_modules.service_overview);
    }

    // Datenschutzerklärung
    if (config?.required_modules?.privacy_policy?.enabled) {
      html += this.generatePrivacySection(config.required_modules.privacy_policy);
    }

    // Allgemeine Geschäftsbedingungen
    if (config?.required_modules?.terms_conditions?.enabled) {
      html += this.generateTermsSection(config.required_modules.terms_conditions);
    }

    // Individuelle Blöcke
    if (config?.custom_sections && config.custom_sections.length > 0) {
      html += this.generateCustomSections(config.custom_sections);
    }

    // Footer
    const studioData = this.getStudioData();
    html += `
      <div class="footer">
        <div style="text-align: left;">
          <strong>${studioData.name}</strong><br>
          ${studioData.address} // ${studioData.postal_code} ${studioData.city} // ${studioData.phone} // ${studioData.website}
        </div>
        <div style="text-align: right;">
          Sparkasse Neunkirchen IBAN ${studioData.iban} BIC ${studioData.bic} // ${studioData.ust_id}
        </div>
      </div>
    `;

    html += `
        </body>
      </html>
    `;

    return html;
  }

  private generatePaymentCalendar(): string {
    return `
      <div class="page-break section">
        <h2 class="section-title">ZAHLUNGSKALENDER</h2>
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Art</th>
              <th>Beschreibung</th>
              <th class="text-right">Betrag</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>18.06.2025</td><td>Vertrag</td><td>All In<br>01.04.2025 - 30.04.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>18.06.2025</td><td>Vertrag</td><td>All In<br>01.05.2025 - 31.05.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>18.06.2025</td><td>Vertrag</td><td>All In<br>01.06.2025 - 30.06.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>18.06.2025</td><td>Startpaket</td><td>All In</td><td class="text-right">19,99 €</td></tr>
            <tr><td>01.07.2025</td><td>Vertrag</td><td>All In<br>01.07.2025 - 31.07.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.08.2025</td><td>Vertrag</td><td>All In<br>01.08.2025 - 31.08.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.09.2025</td><td>Vertrag</td><td>All In<br>01.09.2025 - 30.09.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.10.2025</td><td>Vertrag</td><td>All In<br>01.10.2025 - 31.10.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.11.2025</td><td>Vertrag</td><td>All In<br>01.11.2025 - 30.11.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.12.2025</td><td>Vertrag</td><td>All In<br>01.12.2025 - 31.12.2025</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.01.2026</td><td>Vertrag</td><td>All In<br>01.01.2026 - 31.01.2026</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.02.2026</td><td>Vertrag</td><td>All In<br>01.02.2026 - 28.02.2026</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.03.2026</td><td>Vertrag</td><td>All In<br>01.03.2026 - 31.03.2026</td><td class="text-right">50,00 €</td></tr>
            <tr><td>01.04.2026</td><td>Vertrag</td><td>All In<br>01.04.2026 - 30.04.2026</td><td class="text-right">50,00 €</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  private generateServiceOverview(overviewData: any): string {
    return `
      <div class="page-break section">
        <h2 class="section-title">SERVICE-ÜBERSICHT</h2>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; margin-bottom: 15px; color: #555;">Inbegriffene Leistungen - All In Tarif</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h4 style="color: #333; margin-bottom: 10px;">Krafttraining</h4>
              <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Freie Gewichte</li>
                <li>Kraftgeräte</li>
                <li>Funktionales Training</li>
                <li>Einweisung & Betreuung</li>
              </ul>
            </div>
            <div>
              <h4 style="color: #333; margin-bottom: 10px;">Kurse</h4>
              <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Pilates & Yoga</li>
                <li>Zumba & Aerobic</li>
                <li>Spinning</li>
                <li>Alle Gruppenkurse</li>
              </ul>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="color: #333; margin-bottom: 10px;">Wellness</h4>
              <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Sauna</li>
                <li>Dampfbad</li>
                <li>Ruhebereich</li>
                <li>Getränkestation</li>
              </ul>
            </div>
            <div>
              <h4 style="color: #333; margin-bottom: 10px;">Zusätzliche Services</h4>
              <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Parkplätze kostenfrei</li>
                <li>WLAN</li>
                <li>Schließfächer</li>
                <li>Handtuchservice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private generatePrivacySection(privacyData: any): string {
    return `
      <div class="page-break section">
        ${privacyData.content}
        ${privacyData.requires_signature ? `
          <div class="grid-2" style="margin-top: 40px;">
            <div class="signature-field">
              <div style="margin-bottom: 40px;">Neunkirchen, 18.06.2025</div>
              <div class="signature-label">Ort, Datum/Unterschrift Mitglied</div>
            </div>
            <div></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateTermsSection(termsData: any): string {
    return `
      <div class="page-break section">
        ${termsData.content}
        ${termsData.requires_signature ? `
          <div class="grid-2" style="margin-top: 40px;">
            <div class="signature-field">
              <div style="margin-bottom: 40px;">Neunkirchen, 18.06.2025</div>
              <div class="signature-label">Ort, Datum/Unterschrift Mitglied</div>
            </div>
            <div></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private generateCustomSections(sections: any[]): string {
    return sections
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(section => `
        <div class="page-break section">
          <h2 class="section-title">${section.title.toUpperCase()}</h2>
          <div style="margin-bottom: 20px;">${section.content}</div>
          ${section.display_as_checkbox ? `
            <div style="margin: 20px 0;">
              <label style="display: flex; align-items: center; color: #333; font-size: 14px;">
                <input type="checkbox" style="margin-right: 10px; transform: scale(1.2);">
                ${section.checkbox_label}
              </label>
            </div>
          ` : ''}
          ${section.requires_signature ? `
            <div class="grid-2" style="margin-top: 40px;">
              <div class="signature-field">
                <div style="margin-bottom: 40px;">Neunkirchen, 18.06.2025</div>
                <div class="signature-label">${section.signature_label || 'Ort, Datum/Unterschrift'}</div>
              </div>
              <div></div>
            </div>
          ` : ''}
        </div>
      `).join('');
  }
}

export default new ContractsV2API();