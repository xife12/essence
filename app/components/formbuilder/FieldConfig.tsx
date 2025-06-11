'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/app/lib/api/forms'
import { Settings, Plus, Trash2, X, ChevronDown, Info } from 'lucide-react'

interface FieldConfigProps {
  selectedField: FormField | null
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onClose: () => void
  formHasMultiStep?: boolean
  maxSteps?: number
}

export default function FieldConfig({ 
  selectedField, 
  onFieldUpdate, 
  onClose,
  formHasMultiStep = false,
  maxSteps = 5
}: FieldConfigProps) {
  const [localField, setLocalField] = useState<FormField | null>(null)

  useEffect(() => {
    setLocalField(selectedField)
  }, [selectedField])

  const updateField = (updates: Partial<FormField>) => {
    if (!localField) return
    
    const updatedField = { ...localField, ...updates }
    setLocalField(updatedField)
    onFieldUpdate(localField.id, updates)
  }

  const addOption = () => {
    if (!localField?.options) return
    
    const newOptions = [
      ...localField.options,
      { value: `option_${localField.options.length + 1}`, label: `Option ${localField.options.length + 1}` }
    ]
    updateField({ options: newOptions })
  }

  const updateOption = (index: number, key: 'value' | 'label', value: string) => {
    if (!localField?.options) return
    
    const newOptions = [...localField.options]
    newOptions[index] = { ...newOptions[index], [key]: value }
    updateField({ options: newOptions })
  }

  const removeOption = (index: number) => {
    if (!localField?.options) return
    
    const newOptions = localField.options.filter((_, i) => i !== index)
    updateField({ options: newOptions })
  }

  if (!selectedField || !localField) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex flex-col">
        <div className="text-center text-gray-500 mt-8">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Keine Auswahl</h3>
          <p className="text-sm">
            Wählen Sie ein Feld aus dem Builder, um es zu konfigurieren
          </p>
        </div>
      </div>
    )
  }

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'E-Mail' },
    { value: 'phone', label: 'Telefon' },
    { value: 'number', label: 'Zahl' },
    { value: 'textarea', label: 'Textbereich' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'checkbox_group', label: 'Checkbox Gruppe' },
    { value: 'consent', label: 'Einverständnis' },
    { value: 'date', label: 'Datum' },
    { value: 'time', label: 'Uhrzeit' },
    { value: 'file_upload', label: 'Datei Upload' },
    { value: 'rating', label: 'Bewertung' },
    { value: 'slider', label: 'Schieberegler' },
    { value: 'signature', label: 'Unterschrift' },
    { value: 'address', label: 'Adresse' },
    { value: 'heading', label: 'Überschrift' },
    { value: 'paragraph', label: 'Absatz' },
    { value: 'divider', label: 'Trennlinie' },
    { value: 'campaign_offers', label: 'Kampagnen-Angebote' },
    { value: 'contract_types', label: 'Vertragsarten' },
    { value: 'pricing_calculator', label: 'Preis-Rechner' }
  ]

  const hasOptions = ['select', 'radio', 'checkbox_group'].includes(localField.field_type)
  const isDynamic = ['campaign_offers', 'contract_types', 'pricing_calculator'].includes(localField.field_type)
  const isLayout = ['heading', 'paragraph', 'divider'].includes(localField.field_type)

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-semibold text-gray-900">⚙️ Feld-Konfiguration</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Field Type */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Feldtyp
          </label>
          <select
            value={localField.field_type}
            onChange={(e) => updateField({ field_type: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fieldTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Settings */}
        {!isLayout && (
          <>
            {/* Label */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={localField.label}
                onChange={(e) => updateField({ label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Feldbezeichnung"
              />
            </div>

            {/* Placeholder */}
            {!['checkbox', 'radio', 'file_upload', 'rating', 'slider'].includes(localField.field_type) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Platzhalter
                </label>
                <input
                  type="text"
                  value={localField.placeholder || ''}
                  onChange={(e) => updateField({ placeholder: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hinweistext"
                />
              </div>
            )}

            {/* Help Text */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Hilfetext
              </label>
              <textarea
                value={localField.help_text || ''}
                onChange={(e) => updateField({ help_text: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Zusätzliche Erklärung für den Nutzer"
              />
            </div>
          </>
        )}

        {/* Layout Settings for Layout Elements */}
        {isLayout && (
          <>
            {localField.field_type === 'heading' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Überschrift
                  </label>
                  <input
                    type="text"
                    value={localField.label}
                    onChange={(e) => updateField({ label: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Überschriftentext"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Größe
                  </label>
                  <select
                    value={localField.validation_rules?.heading_level || 'h2'}
                    onChange={(e) => updateField({ 
                      validation_rules: { 
                        ...localField.validation_rules, 
                        heading_level: e.target.value 
                      } 
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="h1">H1 - Sehr groß</option>
                    <option value="h2">H2 - Groß</option>
                    <option value="h3">H3 - Mittel</option>
                    <option value="h4">H4 - Klein</option>
                  </select>
                </div>
              </>
            )}

            {localField.field_type === 'paragraph' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Text-Inhalt
                </label>
                <textarea
                  value={localField.validation_rules?.content || localField.label}
                  onChange={(e) => updateField({ 
                    validation_rules: { 
                      ...localField.validation_rules, 
                      content: e.target.value 
                    },
                    label: e.target.value 
                  })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beschreibungstext oder Hinweise"
                />
              </div>
            )}
          </>
        )}

        {/* Dynamic Field Settings */}
        {isDynamic && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-medium text-orange-800 mb-1">
                  Dynamisches Feld
                </h4>
                <p className="text-xs text-orange-700">
                  {localField.field_type === 'campaign_offers' && 
                    'Zeigt automatisch Angebote der verknüpften Kampagne an'}
                  {localField.field_type === 'contract_types' && 
                    'Lädt verfügbare Vertragsarten aus der Datenbank'}
                  {localField.field_type === 'pricing_calculator' && 
                    'Berechnet Preise basierend auf gewählter Vertragsart'}
                </p>
              </div>
            </div>

            {/* Display Mode for dynamic fields */}
            {['campaign_offers', 'contract_types'].includes(localField.field_type) && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Darstellung
                </label>
                <select
                  value={localField.validation_rules?.display_mode || 'cards'}
                  onChange={(e) => updateField({ 
                    validation_rules: { 
                      ...localField.validation_rules, 
                      display_mode: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cards">Karten</option>
                  <option value="list">Liste</option>
                  <option value="radio">Radio Buttons</option>
                  {localField.field_type === 'contract_types' && (
                    <option value="select">Dropdown</option>
                  )}
                </select>
              </div>
            )}

            {/* Show Prices Toggle */}
            {['campaign_offers', 'contract_types'].includes(localField.field_type) && (
              <div className="mt-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localField.validation_rules?.show_prices ?? true}
                    onChange={(e) => updateField({ 
                      validation_rules: { 
                        ...localField.validation_rules, 
                        show_prices: e.target.checked 
                      } 
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700">Preise anzeigen</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Consent Field Settings */}
        {localField.field_type === 'consent' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Einverständnistext
            </label>
            <textarea
              value={localField.validation_rules?.consent_text || ''}
              onChange={(e) => updateField({ 
                validation_rules: { 
                  ...localField.validation_rules, 
                  consent_text: e.target.value 
                } 
              })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Text der Einverständniserklärung"
            />
            
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Datenschutz-Link
              </label>
              <input
                type="text"
                value={localField.validation_rules?.privacy_url || ''}
                onChange={(e) => updateField({ 
                  validation_rules: { 
                    ...localField.validation_rules, 
                    privacy_url: e.target.value 
                  } 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/datenschutz"
              />
            </div>
          </div>
        )}

        {/* Rating Field Settings */}
        {localField.field_type === 'rating' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Maximale Bewertung
            </label>
            <select
              value={localField.validation_rules?.max_rating || 5}
              onChange={(e) => updateField({ 
                validation_rules: { 
                  ...localField.validation_rules, 
                  max_rating: parseInt(e.target.value) 
                } 
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 Sterne</option>
              <option value={5}>5 Sterne</option>
              <option value={10}>10 Punkte</option>
            </select>
          </div>
        )}

        {/* Slider Field Settings */}
        {localField.field_type === 'slider' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Minimum
                </label>
                <input
                  type="number"
                  value={localField.validation_rules?.min_value || 0}
                  onChange={(e) => updateField({ 
                    validation_rules: { 
                      ...localField.validation_rules, 
                      min_value: parseInt(e.target.value) || 0 
                    } 
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Maximum
                </label>
                <input
                  type="number"
                  value={localField.validation_rules?.max_value || 100}
                  onChange={(e) => updateField({ 
                    validation_rules: { 
                      ...localField.validation_rules, 
                      max_value: parseInt(e.target.value) || 100 
                    } 
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Schrittweite
              </label>
              <input
                type="number"
                value={localField.validation_rules?.step || 1}
                onChange={(e) => updateField({ 
                  validation_rules: { 
                    ...localField.validation_rules, 
                    step: parseInt(e.target.value) || 1 
                  } 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
          </div>
        )}

        {/* Address Field Settings */}
        {localField.field_type === 'address' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localField.validation_rules?.include_country ?? true}
                onChange={(e) => updateField({ 
                  validation_rules: { 
                    ...localField.validation_rules, 
                    include_country: e.target.checked 
                  } 
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">Land einbeziehen</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localField.validation_rules?.require_postal_code ?? true}
                onChange={(e) => updateField({ 
                  validation_rules: { 
                    ...localField.validation_rules, 
                    require_postal_code: e.target.checked 
                  } 
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700">PLZ erforderlich</span>
            </label>
          </div>
        )}

        {/* File Upload Settings */}
        {localField.field_type === 'file_upload' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Erlaubte Dateitypen
            </label>
            <input
              type="text"
              value={localField.validation_rules?.accepted_types || 'image/*,application/pdf'}
              onChange={(e) => updateField({ 
                validation_rules: { 
                  ...localField.validation_rules, 
                  accepted_types: e.target.value 
                } 
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="image/*,application/pdf"
            />
            <p className="text-xs text-gray-500 mt-1">
              Beispiel: image/*,application/pdf,.doc,.docx
            </p>
          </div>
        )}

        {/* Required Field */}
        {!isLayout && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localField.is_required}
                onChange={(e) => updateField({ is_required: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700">Pflichtfeld</span>
            </label>
          </div>
        )}

        {/* Field Width */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Feldbreite
          </label>
          <select
            value={localField.field_width}
            onChange={(e) => updateField({ field_width: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full">Volle Breite (100%)</option>
            <option value="half">Halbe Breite (50%)</option>
            <option value="third">Drittel Breite (33%)</option>
          </select>
        </div>

        {/* Multi-Step Settings */}
        {formHasMultiStep && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Schritt
            </label>
            <select
              value={localField.step}
              onChange={(e) => updateField({ step: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: Math.max(10, maxSteps) }, (_, i) => i + 1).map(step => (
                <option key={step} value={step}>
                  Schritt {step}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Options for Select/Radio/Checkbox */}
        {hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Optionen
              </label>
              <button
                onClick={addOption}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              >
                <Plus className="w-3 h-3" />
                Hinzufügen
              </button>
            </div>
            
            <div className="space-y-2">
              {localField.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                    placeholder="Wert"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    placeholder="Anzeige"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            {(!localField.options || localField.options.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-4">
                Keine Optionen definiert
              </div>
            )}
          </div>
        )}

        {/* Advanced Validation */}
        {['text', 'email', 'phone', 'number', 'textarea'].includes(localField.field_type) && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">Validierung</h4>
            
            <div className="space-y-2">
              {['text', 'textarea'].includes(localField.field_type) && (
                <>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Min. Zeichen</label>
                      <input
                        type="number"
                        value={localField.validation_rules?.min_length || ''}
                        onChange={(e) => updateField({ 
                          validation_rules: { 
                            ...localField.validation_rules, 
                            min_length: parseInt(e.target.value) || undefined 
                          } 
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Max. Zeichen</label>
                      <input
                        type="number"
                        value={localField.validation_rules?.max_length || ''}
                        onChange={(e) => updateField({ 
                          validation_rules: { 
                            ...localField.validation_rules, 
                            max_length: parseInt(e.target.value) || undefined 
                          } 
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </>
              )}

              {localField.field_type === 'number' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Min. Wert</label>
                    <input
                      type="number"
                      value={localField.validation_rules?.min_value || ''}
                      onChange={(e) => updateField({ 
                        validation_rules: { 
                          ...localField.validation_rules, 
                          min_value: parseInt(e.target.value) || undefined 
                        } 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Max. Wert</label>
                    <input
                      type="number"
                      value={localField.validation_rules?.max_value || ''}
                      onChange={(e) => updateField({ 
                        validation_rules: { 
                          ...localField.validation_rules, 
                          max_value: parseInt(e.target.value) || undefined 
                        } 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Error Message */}
        {!isLayout && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Fehlermeldung
            </label>
            <input
              type="text"
              value={localField.validation_rules?.error_message || ''}
              onChange={(e) => updateField({ 
                validation_rules: { 
                  ...localField.validation_rules, 
                  error_message: e.target.value 
                } 
              })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Individuelle Fehlermeldung"
            />
          </div>
        )}
      </div>
    </div>
  )
} 