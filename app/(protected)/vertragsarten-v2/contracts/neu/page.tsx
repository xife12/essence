'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ContractsV2API, { 
  type ContractFormData,
  type ContractModule,
  type ModuleCategory
} from '../../../../lib/api/contracts-v2';

export default function NeuerVertragPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ContractModule[]>([]);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    description: '',
    terms: [{ duration_months: 12, base_price: 0 }],
    auto_renew: true,
    renewal_term_months: 12,
    cancellation_period: 3,
    cancellation_unit: 'months',
    group_discount_enabled: false,
    group_discount_type: 'percent',
    group_discount_value: 0,
    module_assignments: [],
    starter_packages: [],
    is_campaign_version: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [modulesResponse, categoriesResponse] = await Promise.all([
        ContractsV2API.getModules({ is_active: true }),
        ContractsV2API.getModuleCategories()
      ]);

      setModules(modulesResponse.data);
      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Validierung
      const validation = ContractsV2API.validateContract(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Vertrag erstellen
      const response = await ContractsV2API.createContract(formData);
      
      if (response.error) {
        setErrors([response.error]);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/vertragsarten-v2');
        }, 1500);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setLoading(false);
    }
  };

  const addTerm = () => {
    setFormData(prev => ({
      ...prev,
      terms: [...prev.terms, { duration_months: 12, base_price: 0 }]
    }));
  };

  const removeTerm = (index: number) => {
    if (formData.terms.length > 1) {
      setFormData(prev => ({
        ...prev,
        terms: prev.terms.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTerm = (index: number, field: 'duration_months' | 'base_price', value: number) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.map((term, i) => 
        i === index ? { ...term, [field]: value } : term
      )
    }));
  };

  const toggleModuleAssignment = (moduleId: string, type: 'included' | 'optional') => {
    setFormData(prev => {
      const existing = prev.module_assignments.find(a => a.module_id === moduleId);
      
      if (existing) {
        if (existing.assignment_type === type) {
          // Remove if same type
          return {
            ...prev,
            module_assignments: prev.module_assignments.filter(a => a.module_id !== moduleId)
          };
        } else {
          // Change type
          return {
            ...prev,
            module_assignments: prev.module_assignments.map(a => 
              a.module_id === moduleId ? { ...a, assignment_type: type } : a
            )
          };
        }
      } else {
        // Add new
        return {
          ...prev,
          module_assignments: [...prev.module_assignments, { module_id: moduleId, assignment_type: type }]
        };
      }
    });
  };

  const getModuleAssignment = (moduleId: string) => {
    return formData.module_assignments.find(a => a.module_id === moduleId);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vertrag erstellt!</h2>
          <p className="text-gray-600">Sie werden automatisch weitergeleitet...</p>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Neuer Vertrag</h1>
              <p className="text-gray-600">Erstellen Sie einen neuen Vertragstyp</p>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-600" size={20} />
              <h3 className="font-medium text-red-800">Fehler beim Speichern</h3>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basis-Informationen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basis-Informationen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Standard Mitgliedschaft"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Beschreibung des Vertrags..."
                />
              </div>
            </div>
          </div>

          {/* Laufzeiten & Preise */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Laufzeiten & Preise</h2>
              <button
                type="button"
                onClick={addTerm}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Laufzeit hinzufügen
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.terms.map((term, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Laufzeit (Monate)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={term.duration_months}
                      onChange={(e) => updateTerm(index, 'duration_months', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grundpreis (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={term.base_price}
                      onChange={(e) => updateTerm(index, 'base_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {formData.terms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTerm(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vertragsbedingungen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vertragsbedingungen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.auto_renew}
                    onChange={(e) => setFormData(prev => ({ ...prev, auto_renew: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-Verlängerung</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kündigungsfrist
                </label>
                <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Module */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Module zuordnen</h2>
            
            {categories.map(category => {
              const categoryModules = modules.filter(m => m.category_id === category.id);
              if (categoryModules.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Zap size={16} />
                    {category.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryModules.map(module => {
                      const assignment = getModuleAssignment(module.id);
                      
                      return (
                        <div key={module.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{module.name}</h4>
                              <p className="text-sm text-gray-600">{module.price_per_month}€/Monat</p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => toggleModuleAssignment(module.id, 'included')}
                                className={`px-2 py-1 text-xs rounded ${
                                  assignment?.assignment_type === 'included'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                                }`}
                              >
                                Inklusive
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleModuleAssignment(module.id, 'optional')}
                                className={`px-2 py-1 text-xs rounded ${
                                  assignment?.assignment_type === 'optional'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                                }`}
                              >
                                Optional
                              </button>
                            </div>
                          </div>
                          
                          {module.description && (
                            <p className="text-xs text-gray-500">{module.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
            <Link
              href="/vertragsarten-v2"
              className="text-gray-600 hover:text-gray-800"
            >
              Abbrechen
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Vertrag erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}