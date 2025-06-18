'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Zap,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import contractsAPIInstance, {
  type ModuleFormData,
  type ModuleCategory
} from '../../../../lib/api/contracts-v2';

// Icon Picker Component
function IconPicker({ value, onChange }: { value: string; onChange: (iconName: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const iconOptions = [
    { name: 'dumbbell', emoji: '🏋️', label: 'Krafttraining' },
    { name: 'muscle', emoji: '💪', label: 'Muskelaufbau' },
    { name: 'fitness', emoji: '🏃', label: 'Fitness' },
    { name: 'cardio', emoji: '❤️', label: 'Cardio' },
    { name: 'yoga', emoji: '🧘‍♀️', label: 'Yoga' },
    { name: 'pilates', emoji: '🤸', label: 'Pilates' },
    { name: 'dance', emoji: '💃', label: 'Tanzen' },
    { name: 'swimming', emoji: '🏊', label: 'Schwimmen' },
    { name: 'cycling', emoji: '🚴', label: 'Radfahren' },
    { name: 'sauna', emoji: '🌡️', label: 'Sauna' },
    { name: 'spa', emoji: '🧘', label: 'Wellness' },
    { name: 'massage', emoji: '💆', label: 'Massage' },
    { name: 'nutrition', emoji: '🥗', label: 'Ernährung' },
    { name: 'personal', emoji: '👤', label: 'Personal Training' },
    { name: 'group', emoji: '👥', label: 'Gruppenkurs' },
    { name: 'star', emoji: '⭐', label: 'Premium' },
    { name: 'fire', emoji: '🔥', label: 'Intensiv' },
    { name: 'trophy', emoji: '🏆', label: 'Wettkampf' }
  ];

  const selectedIcon = iconOptions.find(icon => icon.name === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-2">
          {selectedIcon ? (
            <>
              <span className="text-lg">{selectedIcon.emoji}</span>
              <span>{selectedIcon.label}</span>
            </>
          ) : (
            <span className="text-gray-500">Icon auswählen...</span>
          )}
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <span className="text-gray-400">Kein Icon</span>
            </button>
            {iconOptions.map((icon) => (
              <button
                key={icon.name}
                type="button"
                onClick={() => {
                  onChange(icon.name);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-lg">{icon.emoji}</span>
                <span>{icon.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NeuesModulPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ModuleFormData>({
    name: '',
    description: '',
    price_per_month: 0,
    price_type: 'per_month',
    category_id: '',
    icon_name: '',
    is_active: true
  });

  useEffect(() => {
    loadCategories();
    
    // Check if editing
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get('edit');
    if (editParam) {
      setIsEdit(true);
      setEditId(editParam);
      loadModuleForEdit(editParam);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await contractsAPIInstance.getModuleCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadModuleForEdit = async (moduleId: string) => {
    try {
      console.log('Loading module for edit:', moduleId);
      const response = await contractsAPIInstance.getModule(moduleId);
      console.log('API Response:', response);
      
      if (response.error) {
        console.error('API Error:', response.error);
        setErrors([`Fehler beim Laden: ${response.error}`]);
        return;
      }
      
      if (response.data) {
        const module = response.data as any; // Cast to any to access icon_name
        console.log('Module data loaded:', module);
        
        const newFormData = {
          name: module.name,
          description: module.description || '',
          price_per_month: Number(module.price_per_month) || 0,
          price_type: module.price_type || 'per_month',
          category_id: module.category_id || '',
          icon_name: module.icon_name || '',
          is_active: module.is_active !== false
        };
        
        console.log('Setting form data:', newFormData);
        setFormData(newFormData);
      } else {
        setErrors(['Modul nicht gefunden']);
      }
    } catch (error) {
      console.error('Exception in loadModuleForEdit:', error);
      setErrors(['Fehler beim Laden des Moduls']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      // Validierung
      const validation = contractsAPIInstance.validateModule(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      let response;
      if (isEdit && editId) {
        // Modul bearbeiten
        response = await contractsAPIInstance.updateModule(editId, formData);
      } else {
        // Modul erstellen
        response = await contractsAPIInstance.createModule(formData);
      }
      
      if (response.error) {
        setErrors([response.error]);
      } else {
        setSuccess(true);
        setTimeout(() => {
          // Navigiere zu Module-Tab statt Dashboard
          router.push('/vertragsarten-v2?tab=modules');
        }, 1500);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Modul aktualisiert!' : 'Modul erstellt!'}
          </h2>
          <p className="text-gray-600">Sie werden automatisch weitergeleitet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/vertragsarten-v2?tab=modules"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Modul bearbeiten' : 'Neues Modul'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Bearbeiten Sie das Vertragsmodul' : 'Erstellen Sie ein neues Vertragsmodul'}
              </p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Modul-Informationen
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Sauna-Zugang"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Beschreibung des Moduls..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preis pro Monat (€) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price_per_month}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_per_month: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Keine Kategorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon auswählen
                </label>
                <IconPicker
                  value={formData.icon_name}
                  onChange={(iconName) => setFormData(prev => ({ ...prev, icon_name: iconName }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Wählen Sie ein Icon für die bessere Anzeige des Moduls
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Modul aktiv</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Inaktive Module können nicht neuen Verträgen zugeordnet werden
                </p>
              </div>
            </div>
          </div>

          {/* Vorschau */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vorschau</h2>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {formData.name || 'Modulname'}
                    </h3>
                    {formData.category_id && (
                      <span className="text-sm text-gray-500">
                        {categories.find(c => c.id === formData.category_id)?.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  formData.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {formData.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
              
              {formData.description && (
                <p className="text-gray-600 text-sm mb-3">{formData.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(formData.price_per_month)}
                </span>
                <span className="text-sm text-gray-500">pro Monat</span>
              </div>
            </div>
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
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Modul erstellen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}