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
  const [multiStepEnabled, setMultiStepEnabled] = useState<boolean>(false)

  // Calculate available steps - only show multi-step if explicitly enabled
  const getAvailableSteps = () => {
    if (fields.length === 0) {
      // If multi-step is enabled but no fields exist, use currentStep
      return multiStepEnabled ? Math.max(currentStep, 1) : 1
    }
    
    // Check if any field has step > 1, then we have multi-step
    const maxStep = Math.max(...fields.map(f => f.step || 1))
    const hasMultipleSteps = fields.some(f => (f.step || 1) > 1) || multiStepEnabled
    
    // When multi-step is enabled, consider currentStep for new empty steps
    if (hasMultipleSteps && multiStepEnabled) {
      return Math.max(maxStep, currentStep, 1)
    }
    
    return hasMultipleSteps ? Math.max(maxStep, 1) : 1
  }

  const availableSteps = getAvailableSteps()
  const isMultiStepForm = availableSteps > 1 || multiStepEnabled

  // Get CI-conform step colors
  const getStepColor = (step: number) => {
    const colors = [
      'border-blue-500 bg-blue-50',     // Schritt 1: Primärfarbe
      'border-green-500 bg-green-50',   // Schritt 2: Erfolg
      'border-purple-500 bg-purple-50', // Schritt 3: Akzent
      'border-orange-500 bg-orange-50', // Schritt 4: Warnung
      'border-red-500 bg-red-50',       // Schritt 5: Fehler
      'border-gray-500 bg-gray-50'      // Schritt 6+: Neutral
    ]
    return colors[(step - 1) % colors.length] || colors[colors.length - 1]
  }

  // Group fields by steps for better organization
  const getFieldsByStep = () => {
    const stepGroups: { [key: number]: FormField[] } = {}
    
    // If multi-step is enabled but no fields exist, create at least step 1
    if (multiStepEnabled && fields.length === 0) {
      stepGroups[currentStep] = []
      return stepGroups
    }
    
    // Initialize all steps up to availableSteps (including empty ones)
    for (let i = 1; i <= availableSteps; i++) {
      stepGroups[i] = []
    }
    
    // Group fields by step (default to step 1 if no step is set)
    fields.forEach(field => {
      const step = field.step || 1
      if (!stepGroups[step]) {
        stepGroups[step] = []
      }
      stepGroups[step].push(field)
    })
    
    // Sort fields within each step by position
    Object.keys(stepGroups).forEach(step => {
      stepGroups[parseInt(step)].sort((a, b) => (a.position || 0) - (b.position || 0))
    })
    
    return stepGroups
  }

  // Filter fields by current step for multi-step forms
  const getVisibleFields = () => {
    if (isPreviewMode && isMultiStepForm) {
      return fields.filter(field => (field.step || 1) === currentStep)
    }
    return fields
  }

  const fieldsByStep = getFieldsByStep()
  const visibleFields = getVisibleFields()

  const handleDrop = (e: React.DragEvent, targetIndex?: number, targetStep?: number) => {
    e.preventDefault()
    console.log('🎯 Drop event triggered at index:', targetIndex ?? dragOverIndex, 'step:', targetStep)
    
    try {
      const fieldData = e.dataTransfer.getData('application/json')
      
      // Check if this is a field being moved within the canvas
      const existingFieldId = e.dataTransfer.getData('text/plain')
      
      if (existingFieldId && fields.find(f => f.id === existingFieldId)) {
        // Handle internal field reordering
        handleInternalFieldMove(existingFieldId, targetIndex, targetStep)
        return
      }
      
      // Handle new field from library
      const fieldDef: FieldDefinition = JSON.parse(fieldData)
      
      // Use targetIndex if provided, otherwise fallback to dragOverIndex, then to end
      const insertPosition = targetIndex !== undefined ? targetIndex : 
                             dragOverIndex !== null ? dragOverIndex : 
                             fields.length
      
      // Determine target step (default to 1 if no multi-step, otherwise use targetStep or current step)
      const insertStep = targetStep || currentStep || 1
      
      console.log('📋 Adding field from drop:', fieldDef.type, 'at position:', insertPosition, 'in step:', insertStep)
      
      // Convert FieldDefinition to FormField data
      const newFieldData: Partial<FormField> = {
        field_type: fieldDef.type,
        step: insertStep,
        position: insertPosition,
        label: fieldDef.defaultConfig.label,
        placeholder: fieldDef.defaultConfig.placeholder || '',
        field_name: fieldDef.defaultConfig.field_name || generateFieldName(fieldDef.defaultConfig.label),
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

  // New function to handle internal field movement
  const handleInternalFieldMove = (fieldId: string, targetIndex?: number, targetStep?: number) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return
    
    const newStep = targetStep || field.step || 1
    const fieldsInTargetStep = fields.filter(f => (f.step || 1) === newStep && f.id !== fieldId)
    const newPosition = targetIndex !== undefined ? targetIndex : fieldsInTargetStep.length
    
    console.log(`🔄 Moving field ${fieldId} to step ${newStep}, position ${newPosition}`)
    
    // Update field with new step and position
    onFieldUpdate(fieldId, { 
      step: newStep, 
      position: newPosition 
    })
    
    // Reorder other fields in target step
    fieldsInTargetStep.forEach((otherField, index) => {
      const adjustedPosition = index >= newPosition ? index + 1 : index
      if (otherField.position !== adjustedPosition) {
        onFieldUpdate(otherField.id, { position: adjustedPosition })
      }
    })
  }

  // Enhanced drag start for internal field movement
  const handleFieldDragStart = (e: React.DragEvent, field: FormField) => {
    console.log('🎯 Internal field drag started:', field.id)
    e.dataTransfer.setData('text/plain', field.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Create new step function with position support
  const handleCreateNewStep = (insertAfterStep?: number) => {
    const targetPosition = insertAfterStep ? insertAfterStep + 1 : availableSteps + 1
    console.log('🆕 Creating new step at position:', targetPosition)
    
    // If we're inserting between existing steps, we need to shift all later steps
    if (insertAfterStep && insertAfterStep < availableSteps) {
      // Shift all fields in steps >= targetPosition by +1
      fields.forEach(field => {
        const fieldStep = field.step || 1
        if (fieldStep >= targetPosition) {
          onFieldUpdate(field.id, { step: fieldStep + 1 })
        }
      })
    }
    
    // Enable multi-step mode and create a visual step immediately
    setMultiStepEnabled(true)
    setCurrentStep(targetPosition)
    
    console.log(`📄 Step ${targetPosition} created and activated, multi-step mode enabled`)
    
    // Show a notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = `📄 Schritt ${targetPosition} erstellt! Ziehen Sie jetzt Felder hierher.`
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 4000)
  }

  // Delete step function - removes step and all its fields
  const handleDeleteStep = (stepToDelete: number) => {
    if (!confirm(`Möchten Sie Schritt ${stepToDelete} wirklich löschen? Alle Felder in diesem Schritt werden ebenfalls gelöscht.`)) {
      return
    }
    
    console.log('🗑️ Deleting step:', stepToDelete)
    
    // Delete all fields in this step
    const fieldsToDelete = fields.filter(field => (field.step || 1) === stepToDelete)
    fieldsToDelete.forEach(field => {
      onFieldDelete(field.id)
    })
    
    // Shift all fields in steps > stepToDelete by -1
    fields.forEach(field => {
      const fieldStep = field.step || 1
      if (fieldStep > stepToDelete) {
        onFieldUpdate(field.id, { step: fieldStep - 1 })
      }
    })
    
    // Adjust currentStep if necessary
    if (currentStep === stepToDelete) {
      setCurrentStep(Math.max(1, stepToDelete - 1))
    } else if (currentStep > stepToDelete) {
      setCurrentStep(currentStep - 1)
    }
    
    // If no steps left, disable multi-step
    if (availableSteps <= 1) {
      setMultiStepEnabled(false)
    }
    
    // Show notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = `🗑️ Schritt ${stepToDelete} gelöscht!`
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  // Helper function to generate field name from label
  const generateFieldName = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  // Enhanced drag over with step support and better visual feedback
  const handleDragOver = (e: React.DragEvent, index?: number, step?: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    // Calculate proper index for drag over indication
    if (step !== undefined && index !== undefined) {
      // For step-specific drops, use the step-based index
      const fieldsInStep = fields.filter(f => (f.step || 1) === step)
      setDragOverIndex(index)
    } else {
      setDragOverIndex(index ?? fields.length)
    }
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

  // Enhanced field duplication with step awareness
  const handleFieldDuplicate = (field: FormField) => {
    console.log('🔄 Duplicating field:', field.id, 'in step:', field.step)
    
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

  const handleFieldReorder = (fieldId: string, direction: 'up' | 'down') => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return
    
    const currentStep = field.step || 1
    const fieldsInStep = fields.filter(f => (f.step || 1) === currentStep)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
    
    const currentIndex = fieldsInStep.findIndex(f => f.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= fieldsInStep.length) return

    console.log(`🔄 Moving field ${direction} within step ${currentStep}:`, fieldId)
    
    // Get the field to swap with
    const fieldToSwap = fieldsInStep[newIndex]
    
    // Update both fields with new positions
    onFieldUpdate(fieldId, { position: fieldToSwap.position })
    onFieldUpdate(fieldToSwap.id, { position: field.position })
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
        draggable={!isPreviewMode}
        onDragStart={(e) => handleFieldDragStart(e, field)}
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
                  handleFieldReorder(field.id, 'up')
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
                  handleFieldReorder(field.id, 'down')
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
          {isPreviewMode && isMultiStepForm && (
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
          onDrop={(e) => handleDrop(e, 0, 1)}
          onDragOver={(e) => handleDragOver(e, 0, 1)}
          onDragLeave={handleDragLeave}
        >
          {fields.length === 0 ? (
            // Empty State - Completely New UX
            <div className="space-y-6">
              <div
                className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg transition-colors ${
                  dragOverIndex !== null 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, 0, 1)}
                onDrop={(e) => handleDrop(e, 0, 1)}
              >
                <Plus className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Formular ist leer
                </h3>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  Ziehen Sie Felder aus der linken Leiste hierher, um Ihr Formular zu erstellen
                </p>
              </div>
              
              {/* New Step Creator for Empty Form */}
              <div className="text-center">
                <button
                  onClick={() => handleCreateNewStep()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Neuer Schritt erstellen
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Erstellt Schritt 1 für Ihr mehrstufiges Formular
                </p>
              </div>
            </div>
          ) : !isPreviewMode && isMultiStepForm ? (
            // NEW Multi-Step Builder Mode - Completely Redesigned
            <div className="space-y-8">
              {Object.entries(fieldsByStep).map(([stepNum, stepFields]) => {
                const step = parseInt(stepNum)
                const stepColor = getStepColor(step)
                
                return (
                  <div key={step} className="space-y-4">
                    <div
                      className={`p-6 rounded-lg border-2 ${stepColor} transition-all`}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('🎯 Drop in step:', step)
                        handleDrop(e, stepFields.length, step)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDragOver(e, stepFields.length, step)
                      }}
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium`}>
                            {step}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Schritt {step}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {stepFields.length} {stepFields.length === 1 ? 'Feld' : 'Felder'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Step Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteStep(step)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 transition-colors"
                          >
                            🗑️ Löschen
                          </button>
                        </div>
                      </div>

                      {/* Step Fields */}
                      {stepFields.length === 0 ? (
                        <div
                          className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-colors ${
                            dragOverIndex !== null 
                              ? 'border-blue-400 bg-blue-50' 
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          <Plus className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Felder hierher ziehen für Schritt {step}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Drop Zone at Top of Step */}
                          <div
                            className={`h-3 border-2 border-dashed rounded-lg transition-colors ${
                              dragOverIndex === 0
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-transparent hover:border-blue-200'
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDragOver(e, 0, step)
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDrop(e, 0, step)
                            }}
                          >
                            {dragOverIndex === 0 && (
                              <div className="text-center text-xs text-blue-600 font-medium py-1">
                                Hier ablegen
                              </div>
                            )}
                          </div>

                          {/* Step Fields arranged in responsive rows */}
                          {(() => {
                            const rows: FormField[][] = []
                            let currentRow: FormField[] = []
                            let currentRowWidth = 0
                            
                            stepFields.forEach((field, index) => {
                              const fieldWidth = field.field_width === 'half' ? 0.5 : 
                                               field.field_width === 'third' ? 0.33 : 1
                              
                              if (currentRowWidth + fieldWidth > 1.0 || viewMode === 'mobile' || fieldWidth === 1) {
                                if (currentRow.length > 0) {
                                  rows.push([...currentRow])
                                  currentRow = []
                                  currentRowWidth = 0
                                }
                              }
                              
                              currentRow.push(field)
                              currentRowWidth += fieldWidth
                              
                              if (currentRowWidth >= 1.0 || index === stepFields.length - 1) {
                                rows.push([...currentRow])
                                currentRow = []
                                currentRowWidth = 0
                              }
                            })
                            
                            return rows.map((row, rowIndex) => (
                              <div key={rowIndex}>
                                <div className="flex flex-wrap -m-2">
                                  {row.map((field) => renderField(field, stepFields.indexOf(field)))}
                                </div>
                                
                                {/* Drop Zone Between Rows in Step */}
                                {rowIndex < rows.length - 1 && (
                                  <div
                                    className={`h-3 my-2 border-2 border-dashed rounded-lg transition-colors ${
                                      dragOverIndex === stepFields.indexOf(row[row.length - 1]) + 1
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-transparent hover:border-blue-200'
                                    }`}
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleDragOver(e, stepFields.indexOf(row[row.length - 1]) + 1, step)
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleDrop(e, stepFields.indexOf(row[row.length - 1]) + 1, step)
                                    }}
                                  />
                                )}
                              </div>
                            ))
                          })()}

                          {/* Drop Zone at Bottom of Step */}
                          <div
                            className={`h-3 border-2 border-dashed rounded-lg transition-colors ${
                              dragOverIndex === stepFields.length
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-transparent hover:border-blue-200'
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDragOver(e, stepFields.length, step)
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDrop(e, stepFields.length, step)
                            }}
                          >
                            {dragOverIndex === stepFields.length && (
                              <div className="text-center text-xs text-blue-600 font-medium py-1">
                                Hier ablegen
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* New Step Creator Button - After Each Step */}
                    <div className="text-center py-4">
                      <button
                        onClick={() => handleCreateNewStep(step)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const newStep = step + 1
                          console.log('🎯 Drop on new step button, creating step:', newStep)
                          handleDrop(e, 0, newStep)
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDragOver(e, 0, step + 1)
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Neuer Schritt erstellen
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Erstellt Schritt {step + 1} oder ziehen Sie Felder hierher
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : isPreviewMode && isMultiStepForm ? (
            // Multi-Step Preview Mode (unchanged)
            <div className="space-y-6">
              {visibleFields.length === 0 ? (
                <div className={`p-8 rounded-lg border-2 border-dashed ${getStepColor(currentStep)}`}>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Schritt {currentStep} ist leer
                    </h3>
                    <p className="text-gray-600">
                      Keine Felder in diesem Schritt vorhanden
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-lg border-2 ${getStepColor(currentStep)}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium`}>
                      {currentStep}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Schritt {currentStep}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({visibleFields.length} {visibleFields.length === 1 ? 'Feld' : 'Felder'})
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {visibleFields.map((field, index) => renderField(field, index))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Single-Step Builder Mode
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
                    handleDrop(e, 0)
                  }}
                />
              )}

              {/* Single-step fields */}
              {(() => {
                const rows: FormField[][] = []
                let currentRow: FormField[] = []
                let currentRowWidth = 0
                
                visibleFields.forEach((field, index) => {
                  const fieldWidth = field.field_width === 'half' ? 0.5 : 
                                   field.field_width === 'third' ? 0.33 : 1
                  
                  if (currentRowWidth + fieldWidth > 1.0 || viewMode === 'mobile' || fieldWidth === 1) {
                    if (currentRow.length > 0) {
                      rows.push([...currentRow])
                      currentRow = []
                      currentRowWidth = 0
                    }
                  }
                  
                  currentRow.push(field)
                  currentRowWidth += fieldWidth
                  
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
                          handleDrop(e, visibleFields.indexOf(row[row.length - 1]) + 1)
                        }}
                      />
                    )}
                  </div>
                ))
              })()}

              {/* Drop Zone at Bottom - nur im Bearbeitungs-Modus */}
              {!isPreviewMode && visibleFields.length > 0 && (
                <div
                  className={`h-6 border-2 border-dashed rounded-lg transition-colors ${
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
                    handleDrop(e, visibleFields.length)
                  }}
                >
                  {dragOverIndex === visibleFields.length && (
                    <div className="text-center text-xs text-blue-600 font-medium py-1">
                      Hier ablegen
                    </div>
                  )}
                </div>
              )}

              {/* Multi-Step Conversion Button */}
              {!isPreviewMode && visibleFields.length > 0 && !isMultiStepForm && (
                <div className="text-center py-6 border-t border-gray-200 mt-8">
                  <button
                    onClick={() => handleCreateNewStep()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    In Multi-Step-Formular umwandeln
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Erstellt Schritt 2 und aktiviert mehrstufige Navigation
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}