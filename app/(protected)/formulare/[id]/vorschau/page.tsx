'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Send, Loader2, Clock, Database, Monitor, Tablet, Smartphone } from 'lucide-react'
import { FormsAPI, Form, FormField } from '@/app/lib/api/forms'
import FormNavigation from '@/app/components/formbuilder/FormNavigation'

export default function FormPreview() {
  const params = useParams()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [testResults, setTestResults] = useState<any>(null)

  const isMultiStep = fields.some(field => (field.step || 1) > 1)
  const availableSteps = isMultiStep ? Math.max(...fields.map(field => field.step || 1)) : 1

  // Get fields for current step
  const getCurrentStepFields = () => {
    if (!isMultiStep) return fields
    return fields.filter(field => field.step === currentStep)
  }

  const currentStepFields = getCurrentStepFields()

  useEffect(() => {
    loadFormData()
  }, [formId])

  const loadFormData = async () => {
    try {
      setIsLoading(true)
      const [formData, fieldsData] = await Promise.all([
        FormsAPI.getById(formId),
        FormsAPI.getFields(formId)
      ])
      
      if (!formData) {
        alert('Formular nicht gefunden')
        return
      }
      
      setForm(formData)
      setFields(fieldsData)
    } catch (error) {
      console.error('❌ Error loading form data:', error)
      alert('Fehler beim Laden des Formulars')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const validateCurrentStep = () => {
    const requiredFields = currentStepFields.filter(field => field.is_required)
    for (const field of requiredFields) {
      if (!formData[field.field_name] || formData[field.field_name] === '') {
        alert(`Bitte füllen Sie das Feld "${field.label}" aus.`)
        return false
      }
    }
    return true
  }

  const handleNextStep = () => {
    if (validateCurrentStep() && currentStep < availableSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If multi-step and not on last step, go to next step
    if (isMultiStep && currentStep < availableSteps) {
      handleNextStep()
      return
    }
    
    try {
      setIsSubmitting(true)
      
      // Final validation of all fields
      const requiredFields = fields.filter(field => field.is_required)
      for (const field of requiredFields) {
        if (!formData[field.field_name] || formData[field.field_name] === '') {
          alert(`Bitte füllen Sie das Feld "${field.label}" aus.`)
          return
        }
      }
      
      // Lead-spezifische Validierung bei Lead-Formularen
      if (form?.form_type === 'lead_capture') {
        console.log('🧪 Lead validation - checking form data:', formData)
        
        // Robuste Name-Prüfung (verschiedene Feldnamen möglich)
        const hasName = formData.name || 
                       formData.firstname || formData.first_name || formData.vorname ||
                       formData.lastname || formData.last_name || formData.nachname ||
                       formData.surname
        
        if (!hasName) {
          alert('Lead-Formular: Bitte geben Sie mindestens einen Namen (Vor- oder Nachname) ein.')
          return
        }
        
        // Robuste Kontakt-Prüfung (verschiedene Feldnamen möglich)
        const hasContact = formData.email || formData.e_mail || formData.e_mail_adresse || 
                          formData.mail || formData.email_address ||
                          formData.phone || formData.telefon || formData.telefonnummer || 
                          formData.tel || formData.handy || formData.mobile || formData.phone_number
        
        if (!hasContact) {
          alert('Lead-Formular: Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein.')
          return
        }
        
        console.log('✅ Lead validation passed:', { hasName, hasContact })
      }
      
      console.log('🧪 Submitting TEST form data (Vorschau-Modus):', formData)
      
      // Generate test data for all fields
      const testData = generateTestData()
      
      // Create test submission with real database entry
      const result = await FormsAPI.createTestSubmission(formId, testData)
      
      setTestResults({
        success: true,
        submissionId: result.id,
        submittedAt: new Date(),
        data: testData,
        autoLeadCreated: form?.auto_lead_creation || false,
        willBeDeletedAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
      })
      
      console.log('✅ Test submission successful:', result)
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>🧪 Test erfolgreich - Echte Daten erstellt!</span>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 5000)
      
    } catch (error) {
      console.error('❌ Error submitting test form:', error)
      setTestResults({
        success: false,
        error: error.message || 'Unbekannter Fehler'
      })
      alert('Fehler beim Absenden des Test-Formulars: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get view dimensions
  const getViewDimensions = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm'
      case 'tablet': return 'max-w-2xl'
      default: return 'max-w-4xl'
    }
  }

  // Generate test data for all fields
  const generateTestData = () => {
    const testData: Record<string, any> = {}
    
    fields.forEach(field => {
      switch (field.field_type) {
        case 'text':
        case 'email':
          testData[field.field_name] = field.field_type === 'email' ? 'test@example.com' : 'Test Eingabe'
          break
        case 'phone':
          testData[field.field_name] = '+49 123 456789'
          break
        case 'number':
          testData[field.field_name] = '42'
          break
        case 'textarea':
          testData[field.field_name] = 'Dies ist ein Test-Text für das Textarea-Feld.'
          break
        case 'select':
        case 'radio':
          if (field.options && Array.isArray(field.options)) {
            testData[field.field_name] = field.options[0]?.value || 'Option 1'
          }
          break
        case 'checkbox':
          testData[field.field_name] = true
          break
        case 'checkbox_group':
          if (field.options && Array.isArray(field.options)) {
            testData[field.field_name] = [field.options[0]?.value || 'Option 1']
          }
          break
        case 'date':
          testData[field.field_name] = new Date().toISOString().split('T')[0]
          break
        case 'time':
          testData[field.field_name] = '14:30'
          break
        case 'rating':
          testData[field.field_name] = '4'
          break
        case 'slider':
          testData[field.field_name] = '75'
          break
        default:
          testData[field.field_name] = 'Test-Wert'
      }
    })
    
    return testData
  }

  const renderField = (field: FormField) => {
    const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    const widthClass = {
      'full': 'w-full',
      'half': 'w-1/2',
      'third': 'w-1/3'
    }[field.field_width] || 'w-full'
    
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.field_type}
              name={field.field_name}
              placeholder={field.placeholder}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className={commonClasses}
              required={field.is_required}
            />
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              name={field.field_name}
              placeholder={field.placeholder}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className={commonClasses}
              required={field.is_required}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name={field.field_name}
              rows={3}
              placeholder={field.placeholder}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className={commonClasses}
              required={field.is_required}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <select
              name={field.field_name}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className={commonClasses}
              required={field.is_required}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map((option: any, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
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
                      checked={formData[field.field_name] === option.value}
                      onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                      className="mr-2"
                      required={field.is_required}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="flex items-center">
              <input
                type="checkbox"
                name={field.field_name}
                checked={formData[field.field_name] || false}
                onChange={(e) => handleInputChange(field.field_name, e.target.checked)}
                className="mr-2"
                required={field.is_required}
              />
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
          </div>
        )

      case 'checkbox_group':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-2">
                {field.label} {field.is_required && <span className="text-red-500">*</span>}
              </legend>
              <div className="space-y-2">
                {field.options?.map((option: any, index: number) => (
                  <label key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`${field.field_name}[]`}
                      value={option.value}
                      checked={(formData[field.field_name] || []).includes(option.value)}
                      onChange={(e) => {
                        const currentValues = formData[field.field_name] || []
                        if (e.target.checked) {
                          handleInputChange(field.field_name, [...currentValues, option.value])
                        } else {
                          handleInputChange(field.field_name, currentValues.filter((v: string) => v !== option.value))
                        }
                      }}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
          <div key={field.id} className={`${widthClass} p-2`}>
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name={field.field_name}
                  checked={formData[field.field_name] || false}
                  onChange={(e) => handleInputChange(field.field_name, e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required={field.is_required}
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
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-1">
              {Array.from({ length: field.validation_rules?.max_rating || 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInputChange(field.field_name, i + 1)}
                  className={`text-xl transition-colors ${
                    (formData[field.field_name] || 0) > i 
                      ? 'text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {formData[field.field_name] || 0} / {field.validation_rules?.max_rating || 5}
              </span>
            </div>
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'slider':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                name={field.field_name}
                min={field.validation_rules?.min_value || 0}
                max={field.validation_rules?.max_value || 100}
                step={field.validation_rules?.step || 1}
                value={formData[field.field_name] || (field.validation_rules?.min_value || 0)}
                onChange={(e) => handleInputChange(field.field_name, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{field.validation_rules?.min_value || 0}</span>
                <span className="font-medium text-blue-600">
                  {formData[field.field_name] || (field.validation_rules?.min_value || 0)}
                </span>
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
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">✍️</div>
                <p className="text-sm">
                  {formData[field.field_name] ? 'Unterschrift vorhanden' : 'Hier unterschreiben'}
                </p>
              </div>
            </div>
            <input
              type="hidden"
              name={field.field_name}
              value={formData[field.field_name] || ''}
              required={field.is_required}
            />
            {field.help_text && (
              <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
            )}
          </div>
        )

      case 'address':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <input
                type="text"
                name={`${field.field_name}_street`}
                placeholder="Straße und Hausnummer"
                value={formData[`${field.field_name}_street`] || ''}
                onChange={(e) => handleInputChange(`${field.field_name}_street`, e.target.value)}
                className={commonClasses}
                required={field.is_required}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  name={`${field.field_name}_postal_code`}
                  placeholder="PLZ"
                  value={formData[`${field.field_name}_postal_code`] || ''}
                  onChange={(e) => handleInputChange(`${field.field_name}_postal_code`, e.target.value)}
                  className={`${commonClasses} w-24`}
                  required={field.validation_rules?.require_postal_code}
                />
                <input
                  type="text"
                  name={`${field.field_name}_city`}
                  placeholder="Stadt"
                  value={formData[`${field.field_name}_city`] || ''}
                  onChange={(e) => handleInputChange(`${field.field_name}_city`, e.target.value)}
                  className={`${commonClasses} flex-1`}
                  required={field.is_required}
                />
              </div>
              {field.validation_rules?.include_country && (
                <select
                  name={`${field.field_name}_country`}
                  value={formData[`${field.field_name}_country`] || ''}
                  onChange={(e) => handleInputChange(`${field.field_name}_country`, e.target.value)}
                  className={commonClasses}
                  required={field.is_required}
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
          <div key={field.id} className={`${widthClass} p-2`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.field_type}
              name={field.field_name}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className={commonClasses}
              required={field.is_required}
            />
          </div>
        )

      case 'heading':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <h2 className="text-xl font-semibold text-gray-900">{field.label}</h2>
          </div>
        )

      case 'paragraph':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <p className="text-gray-700">{field.label}</p>
          </div>
        )

      case 'divider':
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <hr className="border-gray-300" />
          </div>
        )

      default:
        return (
          <div key={field.id} className={`${widthClass} p-2`}>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              {field.field_type} (noch nicht implementiert)
            </div>
          </div>
        )
    }
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Vielen Dank!
            </h2>
            <p className="text-gray-600 mb-6">
              {form.success_message || 'Ihre Eingabe wurde erfolgreich übermittelt.'}
            </p>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fenster schließen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FormNavigation
        formId={formId}
        formName={form.name}
        currentPage="vorschau"
      />

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              📱 Formular-Vorschau
            </h1>
            
            {/* Multi-Step Navigation */}
            {form.is_multi_step && availableSteps > 1 && (
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
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
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
                onClick={() => setViewMode('tablet')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  viewMode === 'tablet'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tablet className="w-3 h-3" />
                Tablet
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
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className={`max-w-${getViewDimensions()} mx-auto px-4`}>
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {form.title || form.name}
              </h1>
              <button
                onClick={() => window.close()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>🔴 Vorschau-Modus</span>
              <span>•</span>
              <span>{fields.length} Felder</span>
              {isMultiStep && (
                <>
                  <span>•</span>
                  <span>{availableSteps} Schritte</span>
                </>
              )}
            </div>

            {/* Multi-Step Progress */}
            {isMultiStep && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Schritt {currentStep} von {availableSteps}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentStepFields.length} Felder in diesem Schritt
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / availableSteps) * 100}%` }}
                  ></div>
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  {Array.from({ length: availableSteps }, (_, i) => i + 1).map(step => (
                    <button
                      key={step}
                      onClick={() => setCurrentStep(step)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        step === currentStep
                          ? 'bg-blue-600 text-white'
                          : step < currentStep
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {currentStepFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isMultiStep ? (
                  <>
                    <p>Schritt {currentStep} ist leer.</p>
                    <p className="text-sm mt-2">Fügen Sie Felder für diesen Schritt im Builder hinzu.</p>
                  </>
                ) : (
                  <>
                    <p>Dieses Formular hat noch keine Felder.</p>
                    <p className="text-sm mt-2">Fügen Sie Felder im Builder hinzu.</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap -m-2 mb-6">
                  {currentStepFields.map(renderField)}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    {/* Previous Button */}
                    {isMultiStep && currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Zurück
                      </button>
                    ) : (
                      <div></div>
                    )}

                    {/* Next/Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : isMultiStep && currentStep < availableSteps ? (
                        <>
                          Weiter
                          <ChevronRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          🧪 Test-Daten absenden
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>

          {/* Test Results */}
          {testResults && (
            <div className={`mt-6 p-4 rounded-lg border ${
              testResults.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {testResults.success ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium text-green-800">✅ Test erfolgreich!</h3>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>📝 Submission ID: <code className="bg-green-100 px-1 rounded">{testResults.submissionId}</code></p>
                    <p>🕐 Gesendet: {testResults.submittedAt.toLocaleString('de-DE')}</p>
                    <p>👤 Lead erstellt: {testResults.autoLeadCreated ? 'Ja' : 'Nein'}</p>
                    {testResults.autoLeadCreated && (
                      <p>🎯 Test-Lead wird ebenfalls in 3 Stunden gelöscht</p>
                    )}
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      🗑️ Auto-Löschung: {testResults.willBeDeletedAt.toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-red-800 mb-1">❌ Test fehlgeschlagen</h3>
                  <p className="text-sm text-red-700">{testResults.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 