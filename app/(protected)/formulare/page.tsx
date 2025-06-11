'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Settings,
  BarChart3,
  Link,
  Play,
  Pause,
  Copy,
  Trash2
} from 'lucide-react'
import { FormsAPI, Form } from '@/app/lib/api/forms'

const FORM_TYPES = {
  'lead_capture': { label: 'Lead Capture', color: 'bg-blue-100 text-blue-800' },
  'contact': { label: 'Kontakt', color: 'bg-green-100 text-green-800' },
  'survey': { label: 'Umfrage', color: 'bg-purple-100 text-purple-800' },
  'registration': { label: 'Anmeldung', color: 'bg-orange-100 text-orange-800' },
  'booking': { label: 'Buchung', color: 'bg-red-100 text-red-800' },
  'feedback': { label: 'Feedback', color: 'bg-gray-100 text-gray-800' }
}

export default function FormulareOverview() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<Form | null>(null)

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      setIsLoading(true)
      const data = await FormsAPI.getAll()
      setForms(data)
      console.log('📋 Forms loaded:', data.length)
    } catch (error) {
      console.error('❌ Error loading forms:', error)
      alert('Fehler beim Laden der Formulare')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteForm = (form: Form) => {
    setFormToDelete(form)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!formToDelete) return
    
    try {
      setIsLoading(true)
      await FormsAPI.delete(formToDelete.id)
      await loadForms()
      setShowDeleteModal(false)
      setFormToDelete(null)
      alert('Formular erfolgreich gelöscht!')
    } catch (error) {
      console.error('❌ Error deleting form:', error)
      alert('Fehler beim Löschen des Formulars')
    } finally {
      setIsLoading(false)
    }
  }

  const duplicateForm = async (form: Form) => {
    try {
      setIsLoading(true)
      await FormsAPI.duplicate(form.id, `${form.name} (Kopie)`)
      await loadForms()
      alert('Formular erfolgreich dupliziert!')
    } catch (error) {
      console.error('❌ Error duplicating form:', error)
      alert('Fehler beim Duplizieren des Formulars')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFormStatus = async (form: Form) => {
    try {
      await FormsAPI.update(form.id, { is_active: !form.is_active })
      await loadForms()
    } catch (error) {
      console.error('❌ Error updating form status:', error)
      alert('Fehler beim Ändern des Formular-Status')
    }
  }

  // Filter forms based on search and filters
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || form.form_type === typeFilter
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && form.is_active) ||
                         (statusFilter === 'inactive' && !form.is_active)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Mock submission counts (TODO: implement real analytics)
  const getSubmissionCount = (formId: string) => {
    return Math.floor(Math.random() * 200) + 1
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Formulare</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Formulare und analysieren Sie Eingaben</p>
        </div>
        <button
          onClick={() => window.location.href = '/formulare/neu'}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neues Formular
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Formular suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">📊 Alle Typen</option>
            {Object.entries(FORM_TYPES).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">✅ Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || typeFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('')
                setStatusFilter('')
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Forms Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formular
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eingänge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Formulare werden geladen...
                  </td>
                </tr>
              ) : filteredForms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || typeFilter || statusFilter ? 
                      'Keine Formulare gefunden. Versuchen Sie andere Filter.' :
                      'Noch keine Formulare erstellt. Klicken Sie auf "Neues Formular" um zu beginnen.'
                    }
                  </td>
                </tr>
              ) : (
                filteredForms.map((form) => (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{form.name}</div>
                        {form.title && (
                          <div className="text-sm text-gray-500">{form.title}</div>
                        )}
                        {form.description && (
                          <div className="text-xs text-gray-400 mt-1">{form.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${FORM_TYPES[form.form_type]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {FORM_TYPES[form.form_type]?.label || form.form_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getSubmissionCount(form.id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFormStatus(form)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          form.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {form.is_active ? (
                          <>
                            <Play className="w-3 h-3" />
                            Aktiv
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3" />
                            Inaktiv
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Builder */}
                        <button
                          onClick={() => window.location.href = `/formulare/${form.id}/builder`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Builder öffnen"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        {/* Settings */}
                        <button
                          onClick={() => window.location.href = `/formulare/${form.id}/einstellungen`}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                          title="Einstellungen"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        {/* Analytics */}
                        <button
                          onClick={() => window.location.href = `/formulare/${form.id}/auswertung`}
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                          title="Auswertung"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        {/* Embed */}
                        <button
                          onClick={() => window.location.href = `/formulare/${form.id}/einbetten`}
                          className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                          title="Einbetten"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                        
                        {/* Duplicate */}
                        <button
                          onClick={() => duplicateForm(form)}
                          disabled={isLoading}
                          className="p-1.5 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50"
                          title="Duplizieren"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        {/* Delete */}
                        <button
                          onClick={() => deleteForm(form)}
                          disabled={isLoading}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && formToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Formular löschen</h3>
                <p className="text-sm text-gray-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Möchten Sie das Formular <strong>"{formToDelete.name}"</strong> wirklich löschen? 
                Alle zugehörigen Felder und Eingaben werden ebenfalls gelöscht.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setFormToDelete(null)
                }}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isLoading ? 'Löschen...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 