'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Settings, Globe, Bell, Lock, Zap } from 'lucide-react'
import { FormsAPI, Form } from '@/app/lib/api/forms'
import FormNavigation from '@/app/components/formbuilder/FormNavigation'

export default function FormSettings() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    loadFormData()
  }, [formId])

  const loadFormData = async () => {
    try {
      setIsLoading(true)
      const formData = await FormsAPI.getById(formId)
      
      if (!formData) {
        alert('Formular nicht gefunden')
        router.back()
        return
      }
      
      setForm(formData)
    } catch (error) {
      console.error('❌ Error loading form:', error)
      alert('Fehler beim Laden des Formulars')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!form) return
    
    // Special handling for multi-step activation
    if (field === 'is_multi_step' && value === true && !form.is_multi_step) {
      // When enabling multi-step for the first time, we need to ensure proper step distribution
      handleMultiStepActivation()
    }
    
    setForm({ ...form, [field]: value })
  }

  const handleMultiStepActivation = async () => {
    try {
      // Check if we have any fields
      const fieldsResponse = await FormsAPI.getFields(formId)
      const currentFields = fieldsResponse || []
      
      if (currentFields.length > 0) {
        // Update all existing fields to be in step 1 if they don't have a step
        const fieldsToUpdate = currentFields.filter(field => !field.step || field.step === 0)
        
        for (const field of fieldsToUpdate) {
          await FormsAPI.updateField(field.id, { step: 1 })
        }
        
        console.log('✅ Multi-step activated: All existing fields moved to step 1')
        
        // Show helpful message
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <span>📄 Multi-Step aktiviert!</span>
          </div>
          <div class="text-xs mt-1 opacity-90">
            Alle Felder sind jetzt in Schritt 1. Fügen Sie Felder zu Schritt 2+ im Builder hinzu.
          </div>
        `
        document.body.appendChild(notification)
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 5000)
      }
    } catch (error) {
      console.error('❌ Error activating multi-step:', error)
    }
  }

  const handleSave = async () => {
    if (!form) return
    
    try {
      setIsSaving(true)
      
      const updatedForm = await FormsAPI.update(formId, {
        name: form.name,
        title: form.title,
        description: form.description,
        is_multi_step: form.is_multi_step,
        auto_lead_creation: form.auto_lead_creation,
        success_message: form.success_message,
        redirect_url: form.redirect_url,
        notification_email: form.notification_email,
        form_type: form.form_type,
        submit_limit: form.submit_limit,
        is_active: form.is_active
      })
      
      setForm(updatedForm)
      alert('Einstellungen gespeichert!')
    } catch (error) {
      console.error('❌ Error saving form:', error)
      alert('Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  const FORM_TYPES = [
    { value: 'lead_capture', label: 'Lead Erfassung', description: 'Zur Gewinnung neuer Kontakte' },
    { value: 'contact', label: 'Kontaktformular', description: 'Für allgemeine Anfragen' },
    { value: 'survey', label: 'Umfrage', description: 'Zur Meinungserfassung' },
    { value: 'registration', label: 'Anmeldung', description: 'Für Events oder Kurse' },
    { value: 'booking', label: 'Buchung', description: 'Für Terminvereinbarungen' },
    { value: 'feedback', label: 'Feedback', description: 'Zur Bewertung und Verbesserung' }
  ]

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: Settings },
    { id: 'design', label: 'Design & Layout', icon: Globe },
    { id: 'behavior', label: 'Verhalten', icon: Zap },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'advanced', label: 'Erweitert', icon: Lock }
  ]

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
    <div className="min-h-screen bg-gray-50">
      <FormNavigation
        formId={formId}
        formName={form.name}
        currentPage="einstellungen"
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Formular-Einstellungen</h1>
          <p className="text-gray-600">Konfigurieren Sie alle Aspekte Ihres Formulars</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* Tab 1: Allgemein */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Grundinformationen</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Formularname *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Öffentlicher Titel
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={form.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Beschreibung
                    </label>
                    <textarea
                      id="description"
                      value={form.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Form Type */}
                  <div>
                    <label htmlFor="form_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Formulartyp *
                    </label>
                    <select
                      id="form_type"
                      value={form.form_type}
                      onChange={(e) => handleInputChange('form_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {FORM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      {FORM_TYPES.find(t => t.value === form.form_type)?.description}
                    </p>
                  </div>

                  {/* Multi-Step Enhanced */}
                  <div className="col-span-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="is_multi_step"
                          checked={form.is_multi_step}
                          onChange={(e) => handleInputChange('is_multi_step', e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="is_multi_step" className="text-sm font-medium text-gray-900">
                            Multi-Step Formular aktivieren
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Teilt das Formular in mehrere Schritte auf für bessere Benutzerführung
                          </p>
                          
                          {!form.is_multi_step ? (
                            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">🎯 Was passiert beim Aktivieren:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Alle vorhandenen Felder werden automatisch zu Schritt 1</li>
                                <li>• Sie können im Builder neue Felder zu Schritt 2+ hinzufügen</li>
                                <li>• Drag & Drop zwischen Schritten wird aktiviert</li>
                                <li>• Automatische Schritt-Navigation in der Vorschau</li>
                              </ul>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">✨ Multi-Step Features aktiviert:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Alle Felder starten in Schritt 1</li>
                                <li>• Visuelle Schritt-Rahmen mit CI-konformen Farben</li>
                                <li>• Drag & Drop zwischen Schritten möglich</li>
                                <li>• Automatische Schritt-Nummerierung</li>
                                <li>• Ziehen Sie Felder in den "Neuen Schritt erstellen" Bereich für weitere Schritte</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto Lead Creation Enhanced */}
                  <div className="col-span-full">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="auto_lead_creation"
                          checked={form.auto_lead_creation}
                          onChange={(e) => handleInputChange('auto_lead_creation', e.target.checked)}
                          className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="auto_lead_creation" className="text-sm font-medium text-gray-900">
                            Automatische Lead-Erstellung
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Erstellt automatisch einen Lead-Eintrag aus Formular-Eingaben
                          </p>
                          
                          {/* Form Type specific Lead Logic */}
                          <div className="mt-3 p-3 bg-white rounded border border-green-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Lead-Erstellung für "{FORM_TYPES.find(t => t.value === form.form_type)?.label}":
                            </h4>
                            {form.form_type === 'survey' && (
                              <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                                ⚠️ Bei Umfragen wird standardmäßig kein Lead erstellt (Anonymität). 
                                Aktivieren Sie diese Option nur wenn nötig.
                              </div>
                            )}
                            {form.form_type === 'lead_capture' && (
                              <div className="text-sm text-green-700">
                                ✅ Empfohlen für Lead-Erfassung Formulare
                              </div>
                            )}
                            {['contact', 'registration', 'booking'].includes(form.form_type) && (
                              <div className="text-sm text-blue-700">
                                💡 Optional - je nach Verwendungszweck
                              </div>
                            )}
                            {form.form_type === 'feedback' && (
                              <div className="text-sm text-gray-600">
                                📝 Meist nicht nötig für reines Feedback
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Design & Layout */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout-Einstellungen</h3>
                  
                  {/* Multi-Step */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Mehrseitiges Formular</h4>
                      <p className="text-sm text-gray-500">Formular in mehrere Schritte aufteilen</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_multi_step}
                        onChange={(e) => handleInputChange('is_multi_step', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Verhalten */}
            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formular-Verhalten</h3>
                  
                  {/* Auto Lead Creation */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Automatische Lead-Erstellung</h4>
                      <p className="text-sm text-gray-500">Erstellt automatisch Leads aus Formular-Eingaben</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.auto_lead_creation}
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
                      value={form.success_message || ''}
                      onChange={(e) => handleInputChange('success_message', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nachricht nach erfolgreicher Absendung"
                    />
                  </div>

                  {/* Redirect URL */}
                  <div>
                    <label htmlFor="redirect_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Weiterleitungs-URL
                    </label>
                    <input
                      type="url"
                      id="redirect_url"
                      value={form.redirect_url || ''}
                      onChange={(e) => handleInputChange('redirect_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/danke"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Benachrichtigungen */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">E-Mail-Benachrichtigungen</h3>
                  
                  {/* Notification Email */}
                  <div>
                    <label htmlFor="notification_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Benachrichtigungs-E-Mail
                    </label>
                    <input
                      type="email"
                      id="notification_email"
                      value={form.notification_email || ''}
                      onChange={(e) => handleInputChange('notification_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="admin@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      E-Mail-Adresse für Benachrichtigungen bei neuen Eingaben
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Erweitert */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Erweiterte Einstellungen</h3>
                  
                  {/* Submit Limit */}
                  <div>
                    <label htmlFor="submit_limit" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximale Absendungen pro Nutzer
                    </label>
                    <input
                      type="number"
                      id="submit_limit"
                      value={form.submit_limit || ''}
                      onChange={(e) => handleInputChange('submit_limit', parseInt(e.target.value) || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Unbegrenzt"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leer lassen für unbegrenzte Absendungen
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Formular aktiv</h4>
                      <p className="text-sm text-gray-500">Formular ist öffentlich zugänglich</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || !form.name.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Einstellungen speichern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 