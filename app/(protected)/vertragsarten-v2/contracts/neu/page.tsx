'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Settings, Plus, Trash2, Edit } from 'lucide-react';
import contractsAPI from '@/app/lib/api/contracts-v2';
import type { 
  ContractFormData, 
  PriceDynamicRule, 
  StarterPackageConfig, 
  FlatRate,
  PaymentInterval,
  ContractModule
} from '@/app/lib/api/contracts-v2';

export default function NeuerVertragPage() {
  const [modules, setModules] = useState<ContractModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalContract, setOriginalContract] = useState<any>(null);
  const [changeDescription, setChangeDescription] = useState('');
  
  // Check for edit mode from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      loadContractForEdit(editId);
    }
  }, []);

  const loadContractForEdit = async (contractId: string) => {
    try {
      const response = await contractsAPI.getContractDetails(contractId);
      if (response.data) {
        const contract = response.data;
        setOriginalContract(contract);
        
        // Map contract data to form structure
        setFormData({
          name: contract.name || '',
          description: contract.description || '',
          terms: contract.terms || [{ duration_months: 12, base_price: 49.99 }],
          auto_renew: contract.auto_renew || false,
          renewal_duration: contract.renewal_term_months || 12,
          renewal_unit: 'months',
          renewal_monthly_price: contract.renewal_monthly_price || 0,
          renewal_cancellation_period: 3,
          renewal_cancellation_unit: 'months',
          cancellation_period: contract.cancellation_period || 3,
          cancellation_unit: contract.cancellation_unit || 'months',
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
          module_assignments: contract.module_assignments || [],
          flat_rates: [],
          is_campaign_version: contract.is_campaign_version || false,
          campaign_id: contract.campaign_id
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden des Vertrags:', error);
    }
  };

  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    description: '',
    terms: [{ duration_months: 12, base_price: 49.99 }],
    
    // 1. Vertragsverlängerung
    auto_renew: true,
    renewal_duration: 12,
    renewal_unit: 'months',
    renewal_monthly_price: 49.99,
    renewal_cancellation_period: 3,
    renewal_cancellation_unit: 'months',
    
    // Kündigungsfrist (getrennt)
    cancellation_period: 3,
    cancellation_unit: 'months',
    
    // 2. Gruppenrabatt
    group_discount_bookable: false,
    group_discount_type: 'percent',
    group_discount_value: 0,
    
    // 3. Preisdynamik
    price_dynamic_rules: [],
    
    // 4. Zahlungsintervalle
    payment_intervals: [
      { interval: 'monthly', enabled: true, discount_percent: 0 },
      { interval: 'semi_annual', enabled: false, discount_percent: 5 },
      { interval: 'yearly', enabled: false, discount_percent: 10 }
    ],
    
    // 5. Startpakete
    starter_packages: [],
    
    // 6. Module
    module_assignments: [],
    
    // 7. Pauschalen
    flat_rates: [],
    
    // 8. Kampagnen-Vertrag
    is_campaign_version: false,
    campaign_id: undefined
  });

  // Load modules on component mount
  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await contractsAPI.getModules({ is_active: true });
        if (response.data) {
          setModules(response.data);
      }
    } catch (error) {
        console.error('Fehler beim Laden der Module:', error);
        // Demo modules if API fails - mit gültigen UUID
        setModules([
          { id: '11111111-2222-3333-4444-555555555555', name: 'Gerätetraining', description: 'Zugang zu allen Fitnessgeräten', category_id: 'fitness', price_per_month: 15, price_type: 'per_month', is_active: true, created_at: '', updated_at: '' },
          { id: '22222222-3333-4444-5555-666666666666', name: 'Kurse', description: 'Teilnahme an Gruppenkursen', category_id: 'kurse', price_per_month: 10, price_type: 'per_month', is_active: true, created_at: '', updated_at: '' },
          { id: '33333333-4444-5555-6666-777777777777', name: 'Personal Training', description: '1:1 Betreuung', category_id: 'personal', price_per_month: 80, price_type: 'per_session', is_active: true, created_at: '', updated_at: '' },
          { id: '44444444-5555-6666-7777-888888888888', name: 'Sauna', description: 'Saunazugang', category_id: 'wellness', price_per_month: 25, price_type: 'per_month', is_active: true, created_at: '', updated_at: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      // Edit Mode: Versionierung
      if (!changeDescription.trim()) {
        alert('Bitte geben Sie eine Beschreibung der Änderungen an.');
        return;
      }

      try {
        // 1. Alte Version archivieren
        await contractsAPI.updateContractStatus(originalContract.id, { is_active: false });
        
        // 2. Neue Version erstellen
        const newVersionData = {
          ...formData,
          // Verbinde mit der gleichen Contract Group
          contract_group_id: originalContract.contract_group_id,
          // Inkrementiere Version
          version_number: (originalContract.version_number || 1) + 1,
          // Änderungsbeschreibung speichern
          version_notes: changeDescription
        };

        const response = await contractsAPI.createContract(newVersionData);
        if (response.data) {
          alert('Neue Version erfolgreich erstellt!');
          window.location.href = '/vertragsarten-v2';
        } else {
          alert('Fehler: ' + (response.error || 'Unbekannter Fehler'));
        }
      } catch (error) {
        console.error('Fehler beim Erstellen der neuen Version:', error);
        alert('Fehler beim Erstellen der neuen Version');
      }
    } else {
      // Create Mode: Neuer Vertrag
      try {
        const response = await contractsAPI.createContract(formData);
        if (response.data) {
          alert('Vertrag erfolgreich erstellt!');
          // Weiterleitung zum Dashboard
          window.location.href = '/vertragsarten-v2';
        } else {
          alert('Fehler: ' + (response.error || 'Unbekannter Fehler'));
        }
      } catch (error) {
        console.error('Fehler beim Erstellen:', error);
        alert('Fehler beim Erstellen des Vertrags');
      }
    }
  };

  // States for modals
  const [showPriceRuleModal, setShowPriceRuleModal] = useState(false);
  const [showStarterPackageModal, setShowStarterPackageModal] = useState(false);
  const [showAllModulesModal, setShowAllModulesModal] = useState(false);
  const [showFlatRateModal, setShowFlatRateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingPriceRule, setEditingPriceRule] = useState<PriceDynamicRule | null>(null);
  const [editingStarterPackage, setEditingStarterPackage] = useState<StarterPackageConfig | null>(null);
  const [editingFlatRate, setEditingFlatRate] = useState<FlatRate | null>(null);

  // 3. Preisdynamik Modal
  const openPriceRuleModal = (rule?: PriceDynamicRule) => {
    setEditingPriceRule(rule || null);
    setShowPriceRuleModal(true);
  };

  // 5. Startpaket Modal
  const openStarterPackageModal = (pkg?: StarterPackageConfig) => {
    setEditingStarterPackage(pkg || null);
    setShowStarterPackageModal(true);
  };

  // 8. Kampagnen-Version Modal
  const openCampaignModal = () => {
    setShowCampaignModal(true);
  };

  // Remove price rule
  const removePriceRule = (id: string) => {
      setFormData(prev => ({
        ...prev,
      price_dynamic_rules: prev.price_dynamic_rules.filter(rule => rule.id !== id)
      }));
  };

  // Remove starter package
  const removeStarterPackage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      starter_packages: prev.starter_packages.filter(pkg => pkg.id !== id)
    }));
  };

  // Toggle module assignment
  const toggleModuleAssignment = (moduleId: string, assignmentType: 'included' | 'bookable') => {
    setFormData(prev => {
      const existing = prev.module_assignments.find(ma => ma.module_id === moduleId);
      
      if (existing) {
        if (existing.assignment_type === assignmentType) {
          // Remove if same type
          return {
            ...prev,
            module_assignments: prev.module_assignments.filter(ma => ma.module_id !== moduleId)
          };
        } else {
          // Update type
          return {
            ...prev,
            module_assignments: prev.module_assignments.map(ma => 
              ma.module_id === moduleId 
                ? { ...ma, assignment_type: assignmentType }
                : ma
            )
          };
        }
      } else {
        // Add new
        return {
          ...prev,
          module_assignments: [...prev.module_assignments, {
            module_id: moduleId,
            assignment_type: assignmentType
          }]
        };
      }
    });
  };

  // Flat rate modal
  const openFlatRateModal = (rate?: FlatRate) => {
    setEditingFlatRate(rate || null);
    setShowFlatRateModal(true);
  };

  // Remove flat rate
  const removeFlatRate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      flat_rates: prev.flat_rates.filter(rate => rate.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Lade Module...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/vertragsarten-v2"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
                        <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Vertrag bearbeiten' : 'Neuer Vertrag'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Änderungen werden als neue Version gespeichert' : 'Vollständige Konfiguration nach Ihren Anforderungen'}
          </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basis-Informationen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basis-Informationen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Standard Mitgliedschaft"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Beschreibung des Vertrags..."
                />
              </div>
            </div>
          </div>

          {/* Laufzeiten & Preise */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Laufzeiten & Preise
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Definieren Sie die verfügbaren Vertragslaufzeiten und Preise. Sie können mehrere Optionen anbieten.
              </p>
              
              {formData.terms.map((term, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      Laufzeit (Monate)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={term.duration_months}
                        onChange={(e) => {
                          const newTerms = [...formData.terms];
                          newTerms[index] = { ...term, duration_months: parseInt(e.target.value) || 1 };
                          setFormData(prev => ({ ...prev, terms: newTerms }));
                        }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="z.B. 12"
                    />
                  </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monatlicher Grundpreis (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={term.base_price}
                        onChange={(e) => {
                          const newTerms = [...formData.terms];
                          newTerms[index] = { ...term, base_price: parseFloat(e.target.value) || 0 };
                          setFormData(prev => ({ ...prev, terms: newTerms }));
                        }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="z.B. 49.99"
                    />
                  </div>
                  
                    <div className="flex items-end">
                  {formData.terms.length > 1 && (
                    <button
                      type="button"
                          onClick={() => {
                            const newTerms = formData.terms.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, terms: newTerms }));
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                    </button>
                  )}
                    </div>
                  </div>
                  
                  {/* Zusätzliche Info */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Laufzeit:</strong> {term.duration_months} Monate | 
                      <strong> Gesamtpreis:</strong> {(term.base_price * term.duration_months).toFixed(2)}€ | 
                      <strong> Monatlich:</strong> {term.base_price}€
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Neue Laufzeit hinzufügen */}
              <button
                type="button"
                onClick={() => {
                  const newTerm = { duration_months: 6, base_price: 39.99 };
                  setFormData(prev => ({ ...prev, terms: [...prev.terms, newTerm] }));
                }}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Weitere Laufzeit hinzufügen
              </button>
            </div>
          </div>

          {/* 1. Vertragsverlängerung */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              1. Vertragsverlängerung
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.auto_renew}
                    onChange={(e) => setFormData(prev => ({ ...prev, auto_renew: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-Verlängerung aktivieren</span>
                </label>
              </div>
              
              {formData.auto_renew && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-6">
                  {/* Verlängerungseinstellungen - stacked layout für bessere Übersicht */}
                  <div className="space-y-4">
                    {/* Dauer */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verlängern um
                      </label>
                      <div className="flex gap-2 max-w-xs">
                        <input
                          type="number"
                          min="1"
                          value={formData.renewal_duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, renewal_duration: parseInt(e.target.value) || 1 }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={formData.renewal_unit}
                          onChange={(e) => setFormData(prev => ({ ...prev, renewal_unit: e.target.value as 'days' | 'weeks' | 'months' }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="days">Tage</option>
                          <option value="weeks">Wochen</option>
                          <option value="months">Monate</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Preis */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monatlicher Preis bei Verlängerung
                      </label>
                      <div className="max-w-xs">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.renewal_monthly_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, renewal_monthly_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="z.B. 49.99"
                        />
                      </div>
                    </div>
                    
                    {/* Kündigungsfrist für Verlängerung */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kündigungsfrist für Verlängerung
                      </label>
                      <div className="flex gap-2 max-w-xs">
                        <input
                          type="number"
                          min="0"
                          value={formData.renewal_cancellation_period}
                          onChange={(e) => setFormData(prev => ({ ...prev, renewal_cancellation_period: parseInt(e.target.value) || 0 }))}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={formData.renewal_cancellation_unit}
                          onChange={(e) => setFormData(prev => ({ ...prev, renewal_cancellation_unit: e.target.value as 'days' | 'months' }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="days">Tage</option>
                          <option value="months">Monate</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kündigungsfrist (visuell getrennt) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Kündigungsfrist
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kündigungsfrist
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.cancellation_period}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellation_period: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.cancellation_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellation_unit: e.target.value as 'days' | 'months' }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="days">Tage</option>
                    <option value="months">Monate</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-end">
                <p className="text-sm text-gray-500">
                  Geben Sie die Frist an, in der Mitglieder vor Ende der Laufzeit kündigen müssen.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Gruppenrabatt */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              2. Gruppenrabatt (buchbar)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.group_discount_bookable}
                    onChange={(e) => setFormData(prev => ({ ...prev, group_discount_bookable: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Gruppenrabatt kann gebucht werden</span>
                </label>
                <p className="text-sm text-gray-500 ml-6">
                  Nicht automatisch - muss von Mitglied explizit gebucht und mit anderem Mitglied verknüpft werden
                </p>
              </div>
              
              {formData.group_discount_bookable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rabatt-Art
                    </label>
                    <select
                      value={formData.group_discount_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, group_discount_type: e.target.value as 'percent' | 'fixed' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percent">Prozent (%)</option>
                      <option value="fixed">Fester Betrag (€)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rabatt-Wert
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.group_discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, group_discount_value: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.group_discount_type === 'percent' ? 'z.B. 10' : 'z.B. 5.00'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Preisdynamik */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">3. Preisdynamik</h2>
              <button
                type="button"
                onClick={() => openPriceRuleModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Preisregel hinzufügen
              </button>
            </div>
            
            {formData.price_dynamic_rules.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Keine Preisregeln definiert. Klicken Sie "Preisregel hinzufügen" um stichtagbasierte oder zeitabhängige Preisanpassungen zu konfigurieren.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.price_dynamic_rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-gray-600">
                        {rule.adjustment_type === 'one_time_on_date' && `Einmalig am ${rule.target_date}`}
                        {rule.adjustment_type === 'recurring_on_date' && `Monatlich am ${rule.recurring_day}.`}
                        {rule.adjustment_type === 'after_duration' && `Nach ${rule.after_months} Monaten`}
                        {' - '}
                        {rule.adjustment_value}{rule.adjustment_value_type === 'percent' ? '%' : '€'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openPriceRuleModal(rule)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePriceRule(rule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Zahlungsintervalle */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Zahlungsintervalle</h2>
            
            <div className="space-y-3">
              {formData.payment_intervals.map((interval, index) => (
                <div key={interval.interval} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={interval.enabled}
                      onChange={(e) => {
                        const newIntervals = [...formData.payment_intervals];
                        newIntervals[index].enabled = e.target.checked;
                        setFormData(prev => ({ ...prev, payment_intervals: newIntervals }));
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-medium">
                      {interval.interval === 'monthly' && 'Monatlich'}
                      {interval.interval === 'semi_annual' && 'Halbjährlich'}
                      {interval.interval === 'yearly' && 'Jährlich'}
                    </span>
                  </div>
                  
                  {interval.enabled && interval.interval !== 'monthly' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rabatt:</span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={interval.discount_percent || 0}
                        onChange={(e) => {
                          const newIntervals = [...formData.payment_intervals];
                          newIntervals[index].discount_percent = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, payment_intervals: newIntervals }));
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Startpakete */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">5. Startpakete</h2>
              <button
                type="button"
                onClick={() => openStarterPackageModal()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Startpaket hinzufügen
              </button>
            </div>
            
            {formData.starter_packages.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Keine Startpakete konfiguriert. Erstellen Sie Pakete mit Ausrüstung und Services für neue Mitglieder.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.starter_packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-gray-600">{pkg.description}</div>
                      <div className="text-lg font-bold text-green-600">{pkg.price.toFixed(2)} €</div>
                      {pkg.allow_installments && (
                        <div className="text-xs text-gray-500">
                          Ratenzahlung möglich (max. {pkg.max_installments} Raten)
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openStarterPackageModal(pkg)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStarterPackage(pkg.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Module */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">6. Module (inkl. vs. zubuchbar)</h2>
            
            {modules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Keine Module verfügbar.</p>
                <Link 
                  href="/vertragsarten-v2/modules/neu"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Erstes Modul erstellen
                </Link>
              </div>
            ) : (
              <div>
                {/* Module Table */}
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Modulname
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inklusive
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zubuchbar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modules.slice(0, 10).map((module) => {
                        const assignment = formData.module_assignments.find(ma => ma.module_id === module.id);
                      
                      return (
                          <tr key={module.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                                <div className="text-sm font-medium text-gray-900">{module.name}</div>
                                <div className="text-sm text-gray-500">{module.price_per_month.toFixed(2)} €/Monat</div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => toggleModuleAssignment(module.id, 'included')}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  assignment?.assignment_type === 'included'
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {assignment?.assignment_type === 'included' && '✓'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => toggleModuleAssignment(module.id, 'bookable')}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  assignment?.assignment_type === 'bookable'
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {assignment?.assignment_type === 'bookable' && '✓'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                            </div>
                
                {modules.length > 10 && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllModulesModal(true)}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Alle {modules.length} Module anzeigen
                    </button>
                  </div>
                )}
              </div>
            )}
                          </div>
                          
          {/* 7. Pauschalen */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">7. Pauschalen</h2>
              <button
                type="button"
                onClick={() => openFlatRateModal()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Pauschale hinzufügen
              </button>
            </div>
            
            {formData.flat_rates.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Keine Pauschalen definiert. Erstellen Sie Flatrate-Angebote mit verschiedenen Zahlungsintervallen.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.flat_rates.map((rate) => (
                  <div key={rate.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">{rate.name}</div>
                      <div className="text-sm text-gray-600">
                        {rate.price.toFixed(2)} € - {
                          rate.payment_interval === 'monthly' ? 'Monatlich' :
                          rate.payment_interval === 'quarterly' ? 'Quartalsweise' :
                          rate.payment_interval === 'yearly' ? 'Jährlich' :
                          `Stichtag: ${rate.fixed_date}`
                        }
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openFlatRateModal(rate)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFlatRate(rate.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                          )}
                        </div>

          {/* 8. Kampagnen-Vertrag */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">8. Kampagnen-Vertrag</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">
                  Erstellen Sie eine kampagnenspezifische Version dieses Vertrags mit individuellen Konditionen.
                </p>
                <p className="text-sm text-gray-500">
                  Alle Einstellungen können in der Kampagnen-Version individuell angepasst werden.
                </p>
                  </div>
              <button
                type="button"
                onClick={openCampaignModal}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Settings size={16} />
                Kampagnen-Version erstellen
              </button>
                </div>
          </div>

          {/* Change Description Field (only in edit mode) */}
          {isEditMode && (
            <div className="pt-6 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung der Änderungen *
              </label>
              <textarea
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Beschreiben Sie die vorgenommenen Änderungen..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Diese Beschreibung wird in der Versionierungsansicht angezeigt.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Link
              href="/vertragsarten-v2"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Save size={20} />
              {isEditMode ? 'Neue Version speichern' : 'Vertrag erstellen'}
            </button>
          </div>
        </form>

        {/* Modals */}
        {showPriceRuleModal && (
          <PriceRuleModal
            rule={editingPriceRule}
            onSave={(rule) => {
              if (editingPriceRule) {
                // Update existing
                setFormData(prev => ({
                  ...prev,
                  price_dynamic_rules: prev.price_dynamic_rules.map(r => 
                    r.id === rule.id ? rule : r
                  )
                }));
              } else {
                // Add new
                setFormData(prev => ({
                  ...prev,
                  price_dynamic_rules: [...prev.price_dynamic_rules, { ...rule, id: Date.now().toString() }]
                }));
              }
              setShowPriceRuleModal(false);
              setEditingPriceRule(null);
            }}
            onClose={() => {
              setShowPriceRuleModal(false);
              setEditingPriceRule(null);
            }}
          />
        )}

        {showStarterPackageModal && (
          <StarterPackageModal
            package={editingStarterPackage}
            modules={modules}
            onSave={(pkg) => {
              if (editingStarterPackage) {
                // Update existing
                setFormData(prev => ({
                  ...prev,
                  starter_packages: prev.starter_packages.map(p => 
                    p.id === pkg.id ? pkg : p
                  )
                }));
              } else {
                // Add new
                setFormData(prev => ({
                  ...prev,
                  starter_packages: [...prev.starter_packages, { ...pkg, id: Date.now().toString() }]
                }));
              }
              setShowStarterPackageModal(false);
              setEditingStarterPackage(null);
            }}
            onClose={() => {
              setShowStarterPackageModal(false);
              setEditingStarterPackage(null);
            }}
          />
        )}

        {showFlatRateModal && (
          <FlatRateModal
            flatRate={editingFlatRate}
            onSave={(rate) => {
              if (editingFlatRate) {
                // Update existing
                setFormData(prev => ({
                  ...prev,
                  flat_rates: prev.flat_rates.map(r => 
                    r.id === rate.id ? rate : r
                  )
                }));
              } else {
                // Add new
                setFormData(prev => ({
                  ...prev,
                  flat_rates: [...prev.flat_rates, { ...rate, id: Date.now().toString() }]
                }));
              }
              setShowFlatRateModal(false);
              setEditingFlatRate(null);
            }}
            onClose={() => {
              setShowFlatRateModal(false);
              setEditingFlatRate(null);
            }}
          />
        )}

        {showAllModulesModal && (
          <AllModulesModal
            modules={modules}
            assignments={formData.module_assignments}
            onToggleAssignment={toggleModuleAssignment}
            onClose={() => setShowAllModulesModal(false)}
          />
        )}

        {showCampaignModal && (
          <CampaignModal
            contractData={formData}
            onSave={(campaignData) => {
              console.log('Kampagnen-Vertrag erstellen:', campaignData);
              alert('Kampagnen-Vertrag würde erstellt werden!');
              setShowCampaignModal(false);
            }}
            onClose={() => setShowCampaignModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Modal Components
function PriceRuleModal({ 
  rule, 
  onSave, 
  onClose 
}: { 
  rule: PriceDynamicRule | null;
  onSave: (rule: PriceDynamicRule) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<PriceDynamicRule>(
    rule || {
      id: '',
      name: '',
      adjustment_type: 'one_time_on_date',
      adjustment_value: 0,
      adjustment_value_type: 'percent',
      target_date: '2025-01-01'
    }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {rule ? 'Preisregel bearbeiten' : 'Neue Preisregel'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Preiserhöhung Januar"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
            <select
              value={formData.adjustment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, adjustment_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="one_time_on_date">Einmalig zu Stichtag</option>
              <option value="recurring_on_date">Monatlich wiederkehrend</option>
              <option value="after_duration">Nach bestimmter Dauer</option>
              <option value="first_months_free">Erste X Monate kostenlos</option>
            </select>
          </div>
          
          {formData.adjustment_type !== 'first_months_free' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wert</label>
                <input
                  type="number"
                  value={formData.adjustment_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, adjustment_value: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Art</label>
                <select
                  value={formData.adjustment_value_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, adjustment_value_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percent">Prozent</option>
                  <option value="fixed">Fester Betrag</option>
                </select>
              </div>
            </div>
          )}
          
          {formData.adjustment_type === 'one_time_on_date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stichtag</label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {formData.adjustment_type === 'recurring_on_date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag im Monat</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.recurring_day || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, recurring_day: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="15"
              />
            </div>
          )}
          
          {formData.adjustment_type === 'after_duration' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nach Monaten</label>
              <input
                type="number"
                min="1"
                value={formData.after_months || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, after_months: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="6"
              />
            </div>
          )}
          
          {formData.adjustment_type === 'first_months_free' && (
            <div>
              <div className="p-3 bg-green-50 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  <strong>Erste Monate kostenlos:</strong> Die angegebene Anzahl von Monaten ab Vertragsbeginn sind für das Mitglied kostenfrei.
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anzahl kostenloser Monate</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.free_months || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, free_months: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="3"
              />
              <p className="text-xs text-gray-500 mt-1">Maximaler Wert: 12 Monate</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function StarterPackageModal({
  package: pkg,
  modules,
  onSave,
  onClose
}: {
  package: StarterPackageConfig | null;
  modules: ContractModule[];
  onSave: (pkg: StarterPackageConfig) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<StarterPackageConfig>(
    pkg || {
      id: '',
      name: '',
      price: 0,
      description: '',
      allow_installments: false,
      max_installments: 3,
      included_modules: []
    }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {pkg ? 'Startpaket bearbeiten' : 'Neues Startpaket'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Premium Starter Set"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Beschreibung des Startpakets..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="99.99"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allow_installments}
                onChange={(e) => setFormData(prev => ({ ...prev, allow_installments: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Ratenzahlung erlauben</span>
            </label>
          </div>
          
          {formData.allow_installments && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max. Anzahl Raten</label>
              <input
                type="number"
                min="2"
                max="12"
                value={formData.max_installments}
                onChange={(e) => setFormData(prev => ({ ...prev, max_installments: parseInt(e.target.value) || 3 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enthaltene Module</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {modules.map((module) => (
                <label key={module.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.included_modules.includes(module.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          included_modules: [...prev.included_modules, module.id]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          included_modules: prev.included_modules.filter(id => id !== module.id)
                        }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{module.name} ({module.price_per_month}€/Monat)</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function FlatRateModal({
  flatRate,
  onSave,
  onClose
}: {
  flatRate: FlatRate | null;
  onSave: (rate: FlatRate) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<FlatRate>(
    flatRate || {
      id: '',
      name: '',
      price: 0,
      payment_interval: 'monthly'
    }
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {flatRate ? 'Pauschale bearbeiten' : 'Neue Pauschale'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Wartungsgebühr"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="29.99"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zahlungsintervall</label>
            <select
              value={formData.payment_interval}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_interval: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monatlich</option>
              <option value="quarterly">Quartalsweise</option>
              <option value="yearly">Jährlich</option>
              <option value="fixed_date">Fester Stichtag</option>
            </select>
          </div>
          
          {formData.payment_interval === 'fixed_date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stichtag</label>
              <input
                type="date"
                value={formData.fixed_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fixed_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function AllModulesModal({
  modules,
  assignments,
  onToggleAssignment,
  onClose
}: {
  modules: ContractModule[];
  assignments: Array<{ module_id: string; assignment_type: 'included' | 'bookable'; custom_price?: number; }>;
  onToggleAssignment: (moduleId: string, assignmentType: 'included' | 'bookable') => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Alle Module ({modules.length})</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modulname
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inklusive
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zubuchbar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module) => {
                const assignment = assignments.find(ma => ma.module_id === module.id);
                
                return (
                  <tr key={module.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{module.name}</div>
                        <div className="text-sm text-gray-500">{module.description}</div>
                        <div className="text-sm text-gray-500">{module.price_per_month.toFixed(2)} €/Monat</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => onToggleAssignment(module.id, 'included')}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          assignment?.assignment_type === 'included'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {assignment?.assignment_type === 'included' && '✓'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => onToggleAssignment(module.id, 'bookable')}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          assignment?.assignment_type === 'bookable'
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {assignment?.assignment_type === 'bookable' && '✓'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignModal({
  contractData,
  onSave,
  onClose
}: {
  contractData: ContractFormData;
  onSave: (data: ContractFormData) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<ContractFormData>({
    ...contractData,
    is_campaign_version: true,
    name: contractData.name + ' (Kampagnen-Version)'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Kampagnen-Vertrag erstellen</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kampagnen-Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-3">🎯 Kampagnen-Anpassungen</h4>
            <div className="text-sm text-orange-800 space-y-2">
              <p>✅ <strong>Vollständige Anpassungen möglich:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Laufzeiten & Monatliche Grundpreise</li>
                <li>• Pauschalen & Zahlungsintervalle</li>
                <li>• Startpakete & Preisdynamik</li>
                <li>• Module & Gruppenrabatte</li>
                <li>• Verlängerungskonditionen</li>
              </ul>
              <p className="mt-3"><strong>📅 Zeitlich begrenzt:</strong> Nur während Kampagnenzeitraum buchbar</p>
            </div>
          </div>

          {/* Kampagnen-spezifische Überschreibungen */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b border-orange-200 pb-2">
              Was möchten Sie für die Kampagne anpassen?
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.campaign_override_pricing || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    campaign_override_pricing: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">📊 Preise & Laufzeiten</span>
                  <p className="text-xs text-gray-500">Spezielle Kampagnen-Preise</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.campaign_override_modules || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    campaign_override_modules: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">🧩 Module anpassen</span>
                  <p className="text-xs text-gray-500">Andere Inklusiv-Module</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.campaign_override_packages || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    campaign_override_packages: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">📦 Startpakete</span>
                  <p className="text-xs text-gray-500">Spezielle Starter-Angebote</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.campaign_override_terms || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    campaign_override_terms: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">⚙️ Vertragsbedingungen</span>
                  <p className="text-xs text-gray-500">Verlängerung, Kündigung</p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Bedingte Anpassungsblöcke */}
          {formData.campaign_override_pricing && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h5 className="font-medium text-green-900 mb-3">📊 Preis-Anpassungen</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampagnen-Preis (€/Monat)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.terms[0]?.base_price || 0}
                    onChange={(e) => {
                      const newPrice = parseFloat(e.target.value) || 0;
                      setFormData(prev => ({
                        ...prev,
                        terms: prev.terms.map((term, index) => 
                          index === 0 ? { ...term, base_price: newPrice } : term
                        )
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="39.99"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampagnen-Laufzeit (Monate)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.terms[0]?.duration_months || 12}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value) || 12;
                      setFormData(prev => ({
                        ...prev,
                        terms: prev.terms.map((term, index) => 
                          index === 0 ? { ...term, duration_months: newDuration } : term
                        )
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-sm text-green-700 mt-2">
                💡 <strong>Tipp:</strong> Sie können hier auch mehrere Laufzeiten mit verschiedenen Preisen anbieten!
              </p>
            </div>
          )}

          {formData.campaign_override_modules && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-3">🧩 Modul-Anpassungen</h5>
              <p className="text-sm text-blue-700 mb-3">
                Ändern Sie, welche Module in der Kampagne inklusive sind oder als Zusatzoption angeboten werden.
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                onClick={() => {/* openAllModulesModal() */}}
              >
                Module für Kampagne anpassen
              </button>
            </div>
          )}

          {formData.campaign_override_packages && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-3">📦 Startpaket-Anpassungen</h5>
              <p className="text-sm text-purple-700 mb-3">
                Erstellen Sie spezielle Startpakete nur für diese Kampagne.
              </p>
              <div className="space-y-2">
                {formData.starter_packages.map((pkg) => (
                  <div key={pkg.id} className="text-sm bg-white p-2 rounded border">
                    <strong>{pkg.name}</strong> - {pkg.price.toFixed(2)}€
                  </div>
                ))}
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  onClick={() => {/* openStarterPackageModal() */}}
                >
                  + Kampagnen-Startpaket hinzufügen
                </button>
              </div>
            </div>
          )}

          {formData.campaign_override_terms && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-900 mb-3">⚙️ Vertragsbedingungen</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kündigungsfrist (Monate)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cancellation_period || 3}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cancellation_period: parseInt(e.target.value) || 3 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.auto_renew || false}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        auto_renew: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">Automatische Verlängerung</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampagnen-Start</label>
              <input
                type="date"
                value={formData.campaign_start_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, campaign_start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kampagnen-Ende</label>
              <input
                type="date"
                value={formData.campaign_end_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, campaign_end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">📊 Kampagnen-Beispiel</h5>
            <div className="text-sm text-blue-800">
              <p><strong>Sommer-Aktion 2025:</strong></p>
              <p>• Normal: 49.99€/Monat für 12 Monate = 599.88€</p>
              <p>• Kampagne: 39.99€/Monat für 6 Monate = 239.94€</p>
              <p>• Ersparnis: 359.94€ gegenüber normalem 6-Monats-Vertrag</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Kampagnen-Vertrag erstellen
          </button>
        </div>
      </div>
    </div>
  );
}