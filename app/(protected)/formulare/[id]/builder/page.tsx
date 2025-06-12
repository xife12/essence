'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FieldLibrary from '@/app/components/formbuilder/FieldLibrary'
import FormCanvas from '@/app/components/formbuilder/FormCanvas'
import FieldConfig from '@/app/components/formbuilder/FieldConfig'
import FormNavigation from '@/app/components/formbuilder/FormNavigation'
import { FormsAPI, Form, FormField } from '@/app/lib/api/forms'
import { Loader2, Save, Play, ArrowLeft, Clock, Wifi, WifiOff } from 'lucide-react'

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  // Auto-save refs
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChangesRef = useRef(false)

  // State management
  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggedField, setDraggedField] = useState<any>(null)

  // Auto-save setup
  useEffect(() => {
    // Start auto-save interval (90 seconds)
    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChangesRef.current && !isSaving && !isAutoSaving) {
        console.log('⏰ Auto-save triggered after 90 seconds')
        handleAutoSave()
      }
    }, 90000) // 90 seconds

    // Cleanup interval on unmount
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }
  }, [])

  // Track unsaved changes
  const markAsUnsaved = () => {
    setHasUnsavedChanges(true)
    hasUnsavedChangesRef.current = true
  }

  const markAsSaved = () => {
    setHasUnsavedChanges(false)
    hasUnsavedChangesRef.current = false
    setLastSavedAt(new Date())
  }

  // Auto-save function
  const handleAutoSave = async () => {
    if (!hasUnsavedChanges || isSaving) return
    
    try {
      setIsAutoSaving(true)
      console.log('🔄 Auto-saving form...')
      
      // Auto-save logic here (similar to manual save but silent)
      markAsSaved()
      console.log('✅ Auto-save completed')
    } catch (error) {
      console.error('❌ Auto-save failed:', error)
      // Don't show alert for auto-save failures, just log
    } finally {
      setIsAutoSaving(false)
    }
  }

  useEffect(() => {
    loadFormData()
  }, [formId])

  // Lead-Formular Validierung
  const leadValidation = form ? FormsAPI.validateLeadFormRequirements(fields, form.form_type) : null

  const loadFormData = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading form data for ID:', formId)
      
      const [formData, fieldsData] = await Promise.all([
        FormsAPI.getById(formId),
        FormsAPI.getFields(formId)
      ])

      console.log('📋 Form loaded:', formData?.name)
      console.log('📝 Fields loaded:', fieldsData?.length, 'fields')

      setForm(formData)
      setFields(fieldsData || [])
      markAsSaved() // Initial load is considered saved
    } catch (error) {
      console.error('❌ Error loading form data:', error)
      alert('Fehler beim Laden des Formulars')
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced field operations with auto-save tracking
  const handleFieldAdd = async (fieldData: Partial<FormField>) => {
    try {
      console.log('➕ Adding field:', fieldData)
      
      // Ensure new fields have at least step 1 if no step is specified
      const fieldWithStep = {
        ...fieldData,
        step: fieldData.step || 1
      }
      
      console.log('➕ Field data with step:', fieldWithStep)
      
      const newField = await FormsAPI.addField(formId, fieldWithStep)
      setFields(prev => [...prev, newField])
      setSelectedField(newField)
      markAsUnsaved() // Mark as unsaved
      console.log('✅ Field added successfully to step:', newField.step)
    } catch (error) {
      console.error('❌ Error adding field:', error)
      
      // Bessere Fehlermeldung für den User
      let errorMessage = 'Unbekannter Fehler beim Hinzufügen des Feldes'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`Fehler beim Hinzufügen des Feldes:\n\n${errorMessage}\n\nDetails in der Browser-Konsole (F12)`)
    }
  }

  const handleFieldUpdate = async (fieldId: string, updates: Partial<FormField>) => {
    try {
      console.log('✏️ Updating field:', fieldId, updates)
      const updatedField = await FormsAPI.updateField(fieldId, updates)
      setFields(prev => prev.map(field => 
        field.id === fieldId ? updatedField : field
      ))
      if (selectedField?.id === fieldId) {
        setSelectedField(updatedField)
      }
      markAsUnsaved() // Mark as unsaved
      console.log('✅ Field updated successfully')
    } catch (error) {
      console.error('❌ Error updating field:', error)
      alert('Fehler beim Aktualisieren des Feldes')
    }
  }

  const handleFieldDelete = async (fieldId: string) => {
    try {
      console.log('🗑️ Deleting field:', fieldId)
      await FormsAPI.deleteField(fieldId)
      setFields(prev => prev.filter(field => field.id !== fieldId))
      if (selectedField?.id === fieldId) {
        setSelectedField(null)
      }
      markAsUnsaved() // Mark as unsaved
      console.log('✅ Field deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting field:', error)
      alert('Fehler beim Löschen des Feldes')
    }
  }

  const handleFieldReorder = async (fieldId: string, direction: 'up' | 'down') => {
    // This function is now handled by FormCanvas directly
    // We keep this for compatibility but it's no longer used
    console.log('🔄 Field reorder request:', fieldId, direction)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      console.log('💾 Manual save triggered...')
      
      // Here you can add any form-level updates if needed
      markAsSaved()
      console.log('✅ Form saved successfully')
      
      // Show success feedback
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successMessage.textContent = '💾 Formular gespeichert!'
      document.body.appendChild(successMessage)
      
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 3000)
      
    } catch (error) {
      console.error('❌ Error saving form:', error)
      alert('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    const previewUrl = `/formulare/${formId}/vorschau`
    window.open(previewUrl, '_blank', 'width=800,height=900')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Formular wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Formular nicht gefunden</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <FormNavigation
        formId={formId}
        formName={form.name}
        currentPage="builder"
      />
      
      {/* Save/Preview Actions */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{fields.length} Felder</span>
            {form.is_multi_step && (
              <span className="flex items-center gap-1">
                📄 Multi-Step
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                  {Math.max(...fields.map(f => f.step), 1)} Schritte
                </span>
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
              form.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {form.is_active ? '🟢 Aktiv' : '⚪ Inaktiv'}
            </span>

            {/* Auto-Save Status */}
            <div className="flex items-center gap-2">
              {isAutoSaving ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Speichere automatisch...</span>
                </span>
              ) : hasUnsavedChanges ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <WifiOff className="w-3 h-3" />
                  <span className="text-xs">Ungespeicherte Änderungen</span>
                </span>
              ) : lastSavedAt ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-3 h-3" />
                  <span className="text-xs">
                    Gespeichert {lastSavedAt.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Manual Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || isAutoSaving}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichert...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {hasUnsavedChanges ? 'Speichern' : 'Gespeichert'}
                </>
              )}
            </button>

            {/* Enhanced Test Button */}
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Test & Vorschau
            </button>

            {/* Auto-Save Indicator */}
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-lg">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">Auto-Save: 90s</span>
            </div>
          </div>
        </div>

        {/* Warning for unsaved changes */}
        {hasUnsavedChanges && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
            ⚠️ Sie haben ungespeicherte Änderungen. Diese werden automatisch in {
              (() => {
                const now = new Date()
                const lastChange = lastSavedAt || now
                const timeSinceLastChange = now.getTime() - lastChange.getTime()
                const remaining = Math.max(0, 90000 - timeSinceLastChange)
                return Math.ceil(remaining / 1000)
              })()
            } Sekunden gespeichert.
          </div>
        )}

        {/* Lead-Formular Validierung Warning */}
        {leadValidation && !leadValidation.isValid && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start gap-2">
              <div className="text-red-600 font-medium text-sm">
                ⚠️ Lead-Formular unvollständig
              </div>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p className="font-medium">Fehlende Pflichtfelder für Lead-Erstellung:</p>
              <ul className="list-disc list-inside mt-1">
                {leadValidation.missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-red-600">
                💡 <strong>Lead-Formulare benötigen:</strong> Name/Vorname + (E-Mail ODER Telefonnummer)
              </div>
            </div>
          </div>
        )}

        {/* Lead-Formular Empfehlungen */}
        {leadValidation && leadValidation.isValid && leadValidation.recommendations.length > 0 && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-blue-800 font-medium text-sm mb-2">
              💡 Empfehlungen für Ihr Lead-Formular:
            </div>
            <ul className="list-disc list-inside text-sm text-blue-700">
              {leadValidation.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Field Library */}
        <FieldLibrary 
          onFieldDrag={setDraggedField} 
          formType={form.form_type}
        />

        {/* Form Canvas */}
        <FormCanvas
          fields={fields}
          onFieldAdd={handleFieldAdd}
          onFieldUpdate={handleFieldUpdate}
          onFieldDelete={handleFieldDelete}
          onFieldReorder={handleFieldReorder}
          onFieldSelect={setSelectedField}
          selectedField={selectedField}
          isPreviewMode={isPreviewMode}
          onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        />

        {/* Field Configuration */}
        {selectedField && (
          <FieldConfig
            selectedField={selectedField}
            onFieldUpdate={handleFieldUpdate}
            allFields={fields}
            onClose={() => setSelectedField(null)}
            formHasMultiStep={form.is_multi_step}
            maxSteps={Math.max(...fields.map(f => f.step || 1), 5)}
          />
        )}
      </div>
    </div>
  )
} 