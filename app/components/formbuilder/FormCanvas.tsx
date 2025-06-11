'use client'

import { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Eye, EyeOff, Monitor, Smartphone, Upload, Target, CreditCard, Euro, PenTool } from 'lucide-react'
import { FormField } from '@/app/lib/api/forms'
import { FieldDefinition } from './FieldLibrary'

interface FormCanvasProps {
  fields: FormField[]
  onFieldAdd: (fieldData: Partial<FormField>) => void
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void
  onFieldDelete: (fieldId: string) => void
  onFieldReorder: (fieldId: string, direction: 'up' | 'down') => void
  onFieldSelect: (field: FormField | null) => void
  selectedField: FormField | null
  isPreviewMode: boolean
  onPreviewToggle: () => void
}

export default function FormCanvas({
  fields,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldReorder,
  onFieldSelect,
  selectedField,
  isPreviewMode,
  onPreviewToggle
}: FormCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Calculate available steps
  const availableSteps = fields.length > 0 ? 
    Math.max(1, Math.max(...fields.map(f => f.step))) : 1

  // Filter fields by current step for multi-step forms
  const getVisibleFields = () => {
    if (isPreviewMode && availableSteps > 1) {
      return fields.filter(field => field.step === currentStep)
    }
    return fields
  }

  const visibleFields = getVisibleFields()

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault()
    console.log('🎯 Drop event triggered at index:', targetIndex ?? dragOverIndex)
    
    try {
      const fieldData = e.dataTransfer.getData('application/json')
      const fieldDef: FieldDefinition = JSON.parse(fieldData)
      
      // Use targetIndex if provided, otherwise fallback to dragOverIndex, then to end
      const insertPosition = targetIndex !== undefined ? targetIndex : 
                             dragOverIndex !== null ? dragOverIndex : 
                             fields.length
      
      console.log('📋 Adding field from drop:', fieldDef.type, 'at position:', insertPosition)
      
      // Convert FieldDefinition to FormField data
      const newFieldData: Partial<FormField> = {
        field_type: fieldDef.type,
        step: 1,
        position: insertPosition,
        label: fieldDef.defaultConfig.label,
        placeholder: fieldDef.defaultConfig.placeholder || '',
        field_name: generateFieldName(fieldDef.defaultConfig.label),
        is_required: fieldDef.defaultConfig.is_required || false,
        validation_rules: fieldDef.defaultConfig.validation_rules || {},
        options: fieldDef.defaultConfig.options || null,
        default_value: fieldDef.defaultConfig.default_value || '',
        conditional_logic: {},
        field_width: fieldDef.defaultConfig.field_width || 'full',
        help_text: fieldDef.defaultConfig.help_text || ''
      }
      
      onFieldAdd(newFieldData)
      setDragOverIndex(null)
    } catch (error) {
      console.error('❌ Error parsing dropped field:', error)
    }
  }

  // Helper function to generate field name from label
  const generateFieldName = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverIndex(index ?? fields.length)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the canvas area completely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }

  const handleFieldDuplicate = (field: FormField) => {
    console.log('🔄 Duplicating field:', field.id)
    
    // Create duplicate field data
    const duplicateFieldData: Partial<FormField> = {
      field_type: field.field_type,
      step: field.step,
      position: field.position + 1,
      label: field.label + ' (Kopie)',
      placeholder: field.placeholder,
      field_name: field.field_name + '_copy',
      is_required: field.is_required,
      validation_rules: field.validation_rules,
      options: field.options,
      default_value: field.default_value,
      conditional_logic: field.conditional_logic,
      field_width: field.field_width,
      help_text: field.help_text
    }
    
    onFieldAdd(duplicateFieldData)
  }

  const handleFieldDelete = (fieldId: string) => {
    if (confirm('Möchten Sie dieses Feld wirklich löschen?')) {
      console.log('🗑️ Deleting field:', fieldId)
      onFieldDelete(fieldId)
    }
  }

  const renderField = (field: FormField, index: number) => {
    const isSelected = selectedField?.id === field.id
    
    // Responsive width calculation
    const getFieldWidth = () => {
      if (viewMode === 'mobile') {
        return 'w-full' // Mobile always full width
      }
      
      switch (field.field_width) {
        case 'half': return 'w-1/2'
        case 'third': return 'w-1/3'
        default: return 'w-full'
      }
    }

    const widthClass = getFieldWidth()

    if (isPreviewMode) {
      return (
        <div key={field.id} className={`${widthClass} p-2`}>
          {renderPreviewField(field, 'w-full')}
        </div>
      )
    }

    return (
      <div
        key={field.id}
        className={`${widthClass} p-2 group`}
        onClick={() => onFieldSelect(field)}
      >
        <div
          className={`relative border-2 rounded-lg p-4 transition-all cursor-pointer ${
            isSelected 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white group-hover:border-blue-200'
          }`}
        >
          {/* Field Controls - nur im Bearbeitungs-Modus */}
          {!isPreviewMode && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-md shadow-sm border p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFieldReorder(field.id, 'up')
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                disabled={index === 0}
                title="Nach oben verschieben"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFieldReorder(field.id, 'down')
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                disabled={index === visibleFields.length - 1}
                title="Nach unten verschieben"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFieldDuplicate(field)
                }}
                className="p-1 text-gray-400 hover:text-green-600 rounded"
                title="Feld duplizieren"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFieldDelete(field.id)
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Feld löschen"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Field Content */}
          {renderPreviewField(field, 'w-full')}
          
          {/* Field Info - nur im Bearbeitungs-Modus */}
          {!isPreviewMode && (
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>{field.field_type} • {field.field_width} • {field.is_required ? 'Pflicht' : 'Optional'}</span>
              {field.step > 1 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Schritt {field.step}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderPreviewField = (field: FormField, widthClass: string) => {
    const commonClasses = `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      isPreviewMode ? 'bg-white' : 'bg-gray-50'
    }`
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.field_type}
              placeholder={field.placeholder}
              className={commonClasses}
              disabled={!isPreviewMode}
              readOnly={!isPreviewMode}
            />
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'number':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              placeholder={field.placeholder}
              className={commonClasses}
              disabled={!isPreviewMode}
              readOnly={!isPreviewMode}
            />
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={3}
              placeholder={field.placeholder}
              className={commonClasses}
              disabled={!isPreviewMode}
              readOnly={!isPreviewMode}
            />
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <select className={commonClasses} disabled={!isPreviewMode}>
              <option value="">{field.placeholder}</option>
              {field.options?.map((option: any, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'radio':
        return (
          <div className={widthClass}>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.is_required && <span className="text-red-500">*</span>}
              </legend>
              <div className="space-y-2">
                {field.options?.map((option: any, index: number) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={field.field_name}
                      value={option.value}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={!isPreviewMode}
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
              {field.help_text && (
                <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
              )}
            </fieldset>
          </div>
        )

      case 'checkbox':
        return (
          <div className={widthClass}>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={!isPreviewMode}
              />
              <span className="text-sm text-gray-900">
                {field.label} {field.is_required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1 ml-6">{field.help_text}</p>
            )}
          </div>
        )

      case 'checkbox_group':
        return (
          <div className={widthClass}>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.is_required && <span className="text-red-500">*</span>}
              </legend>
              <div className="space-y-2">
                {field.options?.map((option: any, index: number) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option.value}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={!isPreviewMode}
                    />
                    <span className="text-sm text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
              {field.help_text && (
                <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
              )}
            </fieldset>
          </div>
        )

      case 'consent':
        return (
          <div className={widthClass}>
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={!isPreviewMode}
                />
                <div className="text-sm">
                  <span className="text-gray-900">
                    {field.label} {field.is_required && <span className="text-red-500">*</span>}
                  </span>
                  {field.validation_rules?.consent_text && (
                    <p className="text-xs text-gray-600 mt-1">
                      {field.validation_rules.consent_text}
                    </p>
                  )}
                  {field.validation_rules?.privacy_url && (
                    <a 
                      href={field.validation_rules.privacy_url}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Datenschutzerklärung
                    </a>
                  )}
                </div>
              </label>
            </div>
          </div>
        )

      case 'rating':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: field.validation_rules?.max_rating || 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="text-gray-300 hover:text-yellow-400 text-xl"
                  disabled={!isPreviewMode}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                0 / {field.validation_rules?.max_rating || 5}
              </span>
            </div>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'slider':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={field.validation_rules?.min_value || 0}
                max={field.validation_rules?.max_value || 100}
                step={field.validation_rules?.step || 1}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={!isPreviewMode}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{field.validation_rules?.min_value || 0}</span>
                <span>{Math.floor(((field.validation_rules?.min_value || 0) + (field.validation_rules?.max_value || 100)) / 2)}</span>
                <span>{field.validation_rules?.max_value || 100}</span>
              </div>
            </div>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'signature':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <PenTool className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Unterschrift hier zeichnen</p>
              </div>
            </div>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'address':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Straße und Hausnummer"
                className={commonClasses}
                disabled={!isPreviewMode}
                readOnly={!isPreviewMode}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PLZ"
                  className={`${commonClasses} w-24`}
                  disabled={!isPreviewMode}
                  readOnly={!isPreviewMode}
                />
                <input
                  type="text"
                  placeholder="Stadt"
                  className={`${commonClasses} flex-1`}
                  disabled={!isPreviewMode}
                  readOnly={!isPreviewMode}
                />
              </div>
              {field.validation_rules?.include_country && (
                <select
                  className={commonClasses}
                  disabled={!isPreviewMode}
                >
                  <option value="">Land auswählen</option>
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                </select>
              )}
            </div>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'date':
      case 'time':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.field_type}
              className={commonClasses}
              disabled={!isPreviewMode}
              readOnly={!isPreviewMode}
            />
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'heading':
        const HeadingTag = (field.validation_rules?.heading_level || 'h2') as keyof JSX.IntrinsicElements
        return (
          <div className={widthClass}>
            <HeadingTag className="font-semibold text-gray-900 mb-2">
              {field.label}
            </HeadingTag>
          </div>
        )

      case 'paragraph':
        return (
          <div className={widthClass}>
            <p className="text-gray-700 leading-relaxed">
              {field.validation_rules?.content || field.label}
            </p>
          </div>
        )

      case 'divider':
        return (
          <div className={widthClass}>
            <hr className="border-gray-300 my-4" />
          </div>
        )

      case 'file_upload':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className={`${commonClasses} cursor-pointer hover:bg-gray-50 ${!isPreviewMode ? 'pointer-events-none' : ''}`}>
              <div className="flex items-center justify-center py-2">
                <Upload className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Datei auswählen</span>
              </div>
            </div>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      // Dynamic fields placeholder
      case 'campaign_offers':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Kampagnen-Angebote</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Zeigt dynamisch Angebote der verknüpften Kampagne
              </p>
            </div>
          </div>
        )

      case 'contract_types':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">Vertragsarten</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Lädt verfügbare Verträge aus der Datenbank
              </p>
            </div>
          </div>
        )

      case 'pricing_calculator':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <Euro className="w-4 h-4" />
                <span className="text-sm font-medium">Preis-Rechner</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Interaktive Preisberechnung basierend auf Auswahl
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className={widthClass}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <div className="text-sm font-medium">Feldtyp: {field.field_type}</div>
              <span className="text-xs">Noch nicht implementiert</span>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📝 Formular-Builder
          </h2>
          
          {/* Multi-Step Navigation - nur im Vorschau-Modus wenn mehr als 1 Schritt */}
          {isPreviewMode && availableSteps > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Schritt:</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {Array.from({ length: availableSteps }, (_, i) => i + 1).map(step => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {visibleFields.length} Felder in diesem Schritt
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle - nur im Bearbeitungs-Modus */}
          {!isPreviewMode && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-3 h-3" />
                Desktop
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                Mobile
              </button>
            </div>
          )}

          {/* Preview Toggle - immer sichtbar */}
          <button
            onClick={onPreviewToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isPreviewMode
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                Bearbeiten
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Vorschau
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas Area - jetzt scrollbar */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={`p-6 min-h-full transition-all duration-200 ${
            viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-4xl mx-auto'
          }`}
          onDrop={(e) => handleDrop(e, 0)}
          onDragOver={(e) => handleDragOver(e, 0)}
          onDragLeave={handleDragLeave}
        >
          {visibleFields.length === 0 ? (
            // Empty State
            <div
              className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg transition-colors ${
                dragOverIndex !== null 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragOver={(e) => handleDragOver(e, 0)}
            >
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isPreviewMode && availableSteps > 1 ? 
                  `Schritt ${currentStep} ist leer` : 
                  'Formular ist leer'
                }
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {isPreviewMode ? 
                  'Keine Felder in diesem Schritt vorhanden' :
                  'Ziehen Sie Felder aus der linken Leiste hierher, um Ihr Formular zu erstellen'
                }
              </p>
            </div>
          ) : (
            // Form Fields - mit flexbox für responsive Layout
            <div className="space-y-4">
              {/* Drop Zone at Top */}
              {!isPreviewMode && (
                <div
                  className={`h-3 border-2 border-dashed rounded-lg transition-colors ${
                    dragOverIndex === 0
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-transparent hover:border-blue-200'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDragOver(e, 0)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🎯 Drop at top, position 0')
                    handleDrop(e, 0)
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation()
                    handleDragLeave(e)
                  }}
                >
                  {dragOverIndex === 0 && (
                    <div className="text-center text-xs text-blue-600 font-medium py-1">
                      Hier ablegen
                    </div>
                  )}
                </div>
              )}

              {/* Group fields by rows for responsive layout */}
              {(() => {
                const rows: FormField[][] = []
                let currentRow: FormField[] = []
                let currentRowWidth = 0
                
                visibleFields.forEach((field, index) => {
                  const fieldWidth = field.field_width === 'half' ? 0.5 : 
                                   field.field_width === 'third' ? 0.33 : 1
                  
                  // If adding this field would exceed 1.0 width or viewMode is mobile, start new row
                  if (currentRowWidth + fieldWidth > 1.0 || viewMode === 'mobile' || fieldWidth === 1) {
                    if (currentRow.length > 0) {
                      rows.push([...currentRow])
                      currentRow = []
                      currentRowWidth = 0
                    }
                  }
                  
                  currentRow.push(field)
                  currentRowWidth += fieldWidth
                  
                  // If we've reached exactly 1.0 or it's the last field
                  if (currentRowWidth >= 1.0 || index === visibleFields.length - 1) {
                    rows.push([...currentRow])
                    currentRow = []
                    currentRowWidth = 0
                  }
                })
                
                return rows.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    <div className="flex flex-wrap -m-2">
                      {row.map((field, fieldIndex) => renderField(field, visibleFields.indexOf(field)))}
                    </div>
                    
                    {/* Drop Zone Between Rows */}
                    {!isPreviewMode && rowIndex < rows.length - 1 && (
                      <div
                        className={`h-3 my-2 border-2 border-dashed rounded-lg transition-colors ${
                          dragOverIndex === visibleFields.indexOf(row[row.length - 1]) + 1
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-transparent hover:border-blue-200'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDragOver(e, visibleFields.indexOf(row[row.length - 1]) + 1)
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const dropIndex = visibleFields.indexOf(row[row.length - 1]) + 1
                          console.log('🎯 Drop between rows at position:', dropIndex)
                          handleDrop(e, dropIndex)
                        }}
                        onDragLeave={(e) => {
                          e.stopPropagation()
                          handleDragLeave(e)
                        }}
                      >
                        {dragOverIndex === visibleFields.indexOf(row[row.length - 1]) + 1 && (
                          <div className="text-center text-xs text-blue-600 font-medium py-1">
                            Hier ablegen
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              })()}
              
              {/* Drop Zone at Bottom */}
              {!isPreviewMode && (
                <div
                  className={`h-3 border-2 border-dashed rounded-lg transition-colors ${
                    dragOverIndex === visibleFields.length
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-transparent hover:border-blue-200'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDragOver(e, visibleFields.length)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🎯 Drop at bottom, position:', visibleFields.length)
                    handleDrop(e, visibleFields.length)
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation()
                    handleDragLeave(e)
                  }}
                >
                  {dragOverIndex === visibleFields.length && (
                    <div className="text-center text-xs text-blue-600 font-medium py-1">
                      Hier ablegen
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Spacer at bottom for better scrolling */}
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  )
} 