'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FieldLibrary from '@/app/components/formbuilder/FieldLibrary'
import FormCanvas from '@/app/components/formbuilder/FormCanvas'
import FieldConfig from '@/app/components/formbuilder/FieldConfig'
import FormNavigation from '@/app/components/formbuilder/FormNavigation'
import { FormsAPI, Form, FormField } from '@/app/lib/api/forms'
import { Loader2, Save, Play, ArrowLeft } from 'lucide-react'

export default function FormBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  // State management
  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggedField, setDraggedField] = useState<any>(null)

  useEffect(() => {
    loadFormData()
  }, [formId])

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
    } catch (error) {
      console.error('❌ Error loading form data:', error)
      alert('Fehler beim Laden des Formulars')
    } finally {
      setIsLoading(false)
    }
  }

  // Field operations
  const handleFieldAdd = async (fieldData: Partial<FormField>) => {
    try {
      console.log('➕ Adding field:', fieldData)
      const newField = await FormsAPI.addField(formId, fieldData)
      setFields(prev => [...prev, newField])
      setSelectedField(newField)
      console.log('✅ Field added successfully')
    } catch (error) {
      console.error('❌ Error adding field:', error)
      alert('Fehler beim Hinzufügen des Feldes')
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
      console.log('✅ Field deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting field:', error)
      alert('Fehler beim Löschen des Feldes')
    }
  }

  const handleFieldReorder = async (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= fields.length) return

    try {
      console.log(`🔄 Moving field ${direction}:`, fieldId)
      
      // Create new array with swapped positions
      const newFields = [...fields]
      const [movedField] = newFields.splice(currentIndex, 1)
      newFields.splice(newIndex, 0, movedField)
      
      // Update positions for all affected fields
      const updatedFields = newFields.map((field, index) => ({ ...field, position: index }))
      
      // Reorder on server
      const fieldOrderData = updatedFields.map(field => ({
        id: field.id,
        position: field.position,
        step: field.step
      }))
      await FormsAPI.reorderFields(formId, fieldOrderData)
      
      setFields(updatedFields)
      console.log('✅ Fields reordered successfully')
    } catch (error) {
      console.error('❌ Error reordering fields:', error)
      alert('Fehler beim Neuordnen der Felder')
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      console.log('💾 Saving form...')
      
      // Here you can add any form-level updates if needed
      console.log('✅ Form saved successfully')
      alert('Formular gespeichert!')
      
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
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Speichern
                </>
              )}
            </button>
            
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Vorschau
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Field Library */}
        <FieldLibrary onFieldDrag={setDraggedField} />

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
            onClose={() => setSelectedField(null)}
            formHasMultiStep={form.is_multi_step}
            maxSteps={Math.max(...fields.map(f => f.step), 5)}
          />
        )}
      </div>
    </div>
  )
} 