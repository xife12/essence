'use client'

import { useState } from 'react'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { FormsAPI, Form } from '@/app/lib/api/forms'
import { useRouter } from 'next/navigation'

const FORM_TYPES = [
  { value: 'lead_capture', label: 'Lead Capture', description: 'Für die Generierung neuer Leads' },
  { value: 'contact', label: 'Kontakt', description: 'Allgemeine Kontaktanfragen' },
  { value: 'survey', label: 'Umfrage', description: 'Feedback und Meinungsabfragen' },
  { value: 'registration', label: 'Anmeldung', description: 'Anmeldungen für Events oder Services' },
  { value: 'booking', label: 'Buchung', description: 'Terminbuchungen und Reservierungen' },
  { value: 'feedback', label: 'Feedback', description: 'Kundenfeedback und Bewertungen' }
]

export default function NeuesFormular() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    form_type: 'contact' as Form['form_type'],
    is_multi_step: false,
    auto_lead_creation: true,
    success_message: 'Vielen Dank für Ihre Eingabe!'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Bitte geben Sie einen Formularnamen ein')
      return
    }
    
    try {
      setIsLoading(true)
      
      // Create form with auto-generated slug
      const newForm = await FormsAPI.create({
        ...formData,
        slug: formData.name
          .toLowerCase()
          .replace(/[^a-z0-9äöüß]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      })
      
      if (newForm.id) {
        console.log('✅ Form created successfully:', newForm)
        
        // Redirect to form builder
        router.push(`/formulare/${newForm.id}/builder`)
      } else {
        throw new Error('Formular wurde erstellt, aber keine ID erhalten')
      }
    } catch (error) {
      console.error('❌ Error creating form:', error)
      alert('Fehler beim Erstellen des Formulars: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/formulare')}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Neues Formular erstellen</h1>
          <p className="text-gray-600">Definieren Sie die Grundeinstellungen für Ihr neues Formular</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Grundeinstellungen</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Formularname *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Kontaktformular Hauptseite"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Interner Name zur Identifikation des Formulars
                </p>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Öffentlicher Titel
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Kontakt aufnehmen"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Titel, der Besuchern angezeigt wird (optional)
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kurze Beschreibung des Formularzwecks..."
                />
              </div>
            </div>
          </div>

          {/* Form Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Formulartyp</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FORM_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.form_type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="form_type"
                    value={type.value}
                    checked={formData.form_type === type.value}
                    onChange={(e) => handleInputChange('form_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {type.label}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {type.description}
                      </span>
                    </div>
                  </div>
                  {formData.form_type === type.value && (
                    <div className="text-blue-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Erweiterte Einstellungen</h2>
            
            <div className="space-y-4">
              {/* Multi-Step */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Mehrseitiges Formular</h3>
                  <p className="text-sm text-gray-500">Formular in mehrere Schritte aufteilen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_multi_step}
                    onChange={(e) => handleInputChange('is_multi_step', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Auto Lead Creation */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Automatische Lead-Erstellung</h3>
                  <p className="text-sm text-gray-500">Erstellt automatisch Leads aus Formular-Eingaben</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.auto_lead_creation}
                    onChange={(e) => handleInputChange('auto_lead_creation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Success Message */}
              <div>
                <label htmlFor="success_message" className="block text-sm font-medium text-gray-700 mb-1">
                  Erfolgsmeldung
                </label>
                <input
                  type="text"
                  id="success_message"
                  value={formData.success_message}
                  onChange={(e) => handleInputChange('success_message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nachricht nach erfolgreicher Absendung"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.push('/formulare')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Erstellen...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Speichern und weiter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 