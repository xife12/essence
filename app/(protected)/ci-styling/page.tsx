'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Crown, Edit, Trash2, FileText, Copy, X, Globe, Users, Target, Filter, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CITemplatesAPI, CITemplate, CISetting } from '@/app/lib/api/ci-templates'

// Vordefinierte Verwendungszwecke
const PREDEFINED_USAGE_PURPOSES = [
  'Social Media',
  'Print',
  'Web',
  'E-Mail Marketing',
  'Werbeanzeigen',
  'Events',
  'Interne Kommunikation',
  'Landingpages',
  'Newsletter',
  'Flyer & Broschüren'
]

// Vordefinierte Kategorien (falls keine aus der Datenbank geladen werden)
const FALLBACK_CATEGORIES = [
  'Kampagne',
  'Saisonal',
  'Zielgruppe',
  'Kanal-spezifisch',
  'Event',
  'Allgemein'
]

export default function CIStylingDashboard() {
  const [styles, setStyles] = useState<CITemplate[]>([])
  const [masterStyle, setMasterStyle] = useState<CITemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [styleToDelete, setStyleToDelete] = useState<CITemplate | null>(null)
  
  // Filter
  const [filters, setFilters] = useState({
    category: '',
    campaign: '',
    usage_purpose: '',
    target_group: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  
  // Einstellungen
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([])
  
  const router = useRouter()

  useEffect(() => {
    loadStyles()
    loadSettings()
    loadCampaigns()
  }, [])

  const loadStyles = async () => {
    try {
      const allStyles = await CITemplatesAPI.getAll()
      
      // Master-Style finden
      const master = allStyles.find(s => s.is_master_ci) || null
      setMasterStyle(master)
      
      // Andere Styles
      const others = allStyles.filter(s => !s.is_master_ci)
      setStyles(others)
    } catch (error) {
      console.error('Error loading styles:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const settings = await CITemplatesAPI.getSettings()
      
      const categorySettings = settings.find(s => s.setting_key === 'default_categories')
      if (categorySettings && categorySettings.setting_value && categorySettings.setting_value.length > 0) {
        setAvailableCategories(categorySettings.setting_value)
      } else {
        // Fallback auf vordefinierte Kategorien
        setAvailableCategories(FALLBACK_CATEGORIES)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // Fallback auf vordefinierte Kategorien bei Fehler
      setAvailableCategories(FALLBACK_CATEGORIES)
    }
  }

  const loadCampaigns = async () => {
    try {
      // TODO: Implementiere Kampagnen-API Aufruf
      // Placeholder für Kampagnen
      setAvailableCampaigns([
        { id: '1', name: 'Frühjahrskampagne 2025', target_audience: { age_min: 25, age_max: 45, interests: ['Krafttraining', 'Cardio'], sports_goals: ['Gewichtsreduktion', 'Fitness allgemein'] } },
        { id: '2', name: 'Sommerfitness', target_audience: { age_min: 18, age_max: 35, interests: ['Yoga', 'Pilates'], sports_goals: ['Körperstraffung', 'Beweglichkeit steigern'] } }
      ])
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const createNewStyle = () => {
    // Weiterleitung zur Einstellungsseite für neues Style
    router.push('/ci-styling/einstellungen?create=true')
  }

  const deleteStyle = (style: CITemplate) => {
    console.log('🗑️ Delete function called with style:', style)
    
    // Prüfe ob Style ID existiert
    if (!style.id) {
      console.error('❌ Style ID ist undefined oder leer:', style)
      alert('Fehler: Style ID nicht gefunden.')
      return
    }

    // Master-CI darf nicht gelöscht werden
    if (style.is_master_ci) {
      alert('Master-CI kann nicht gelöscht werden.')
      return
    }

    // Setze das zu löschende Style und zeige Modal
    setStyleToDelete(style)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!styleToDelete || !styleToDelete.id) {
      console.error('❌ Kein Style zum Löschen ausgewählt')
      setShowDeleteModal(false)
      return
    }
    
    try {
      console.log('🔄 Löschung startet für ID:', styleToDelete.id)
      setIsLoading(true)
      
      // API-Aufruf mit ausführlichem Logging
      await CITemplatesAPI.delete(styleToDelete.id)
      console.log('✅ API-Aufruf erfolgreich')
      
      // Styles neu laden
      await loadStyles()
      console.log('✅ Styles neu geladen')
      
      // Modal schließen
      setShowDeleteModal(false)
      setStyleToDelete(null)
      
      alert('Style erfolgreich gelöscht!')
    } catch (error) {
      console.error('❌ Fehler beim Löschen:', error)
      console.error('❌ Error Details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      })
      alert('Fehler beim Löschen des Styles: ' + (error as Error).message)
      setShowDeleteModal(false)
    } finally {
      setIsLoading(false)
      console.log('🏁 Löschfunktion beendet')
    }
  }

  const duplicateStyle = async (style: CITemplate) => {
    // Prüfe ob Style ID existiert
    if (!style.id) {
      alert('Fehler: Style ID nicht gefunden.')
      return
    }

    try {
      setIsLoading(true)
      const newName = `${style.name} (Kopie)`
      await CITemplatesAPI.duplicate(style.id, newName)
      await loadStyles()
      alert('Style erfolgreich dupliziert!')
    } catch (error) {
      console.error('Error duplicating style:', error)
      alert('Fehler beim Duplizieren des Styles: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter-Funktionen
  const getFilteredStyles = () => {
    return styles.filter(style => {
      // Kategorie Filter
      if (filters.category && style.category !== filters.category) return false
      
      // Kampagne Filter
      if (filters.campaign && style.linked_campaign_id !== filters.campaign) return false
      
      // Verwendungszweck Filter
      if (filters.usage_purpose && (!style.usage_purpose || !style.usage_purpose.includes(filters.usage_purpose))) return false
      
      // Zielgruppe Filter (vereinfacht - prüft ob Zielgruppe definiert ist)
      if (filters.target_group === 'defined' && !style.target_audience_detailed) return false
      if (filters.target_group === 'undefined' && style.target_audience_detailed) return false
      
      return true
    })
  }

  const resetFilters = () => {
    setFilters({
      category: '',
      campaign: '',
      usage_purpose: '',
      target_group: ''
    })
  }

  const StyleCard = ({ style, isMaster = false }: { style: CITemplate, isMaster?: boolean }) => {
    // Funktion zum Öffnen der Settings-Seite für ein Style
    const openStyleSettings = (styleId: string) => {
      router.push(`/ci-styling/einstellungen?style=${styleId}`)
    }

    return (
      <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow ${
        isMaster 
          ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-white' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        {/* Header mit Titel und Aktionen */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isMaster && <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{style.name}</h3>
                {isMaster && (
                  <span className="text-xs text-yellow-700 font-medium">Master</span>
                )}
              </div>
            </div>
            
            {/* Aktions-Buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => openStyleSettings(style.id!)}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="Einstellungen"
              >
                <Settings className="w-4 h-4" />
              </button>
              <Link 
                href={`/ci-styling/editor?id=${style.id}`}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                title="Bearbeiten"
              >
                <Edit className="w-4 h-4" />
              </Link>
              {!isMaster && (
                <button
                  onClick={() => duplicateStyle(style)}
                  disabled={isLoading}
                  className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Duplizieren"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              {!isMaster && (
                <button
                  onClick={() => deleteStyle(style)}
                  disabled={isLoading}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {style.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3 mr-1" />
                {style.category}
              </span>
            )}
            {style.linked_campaign_id && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <Target className="w-3 h-3 mr-1" />
                Kampagne
              </span>
            )}
            {style.usage_purpose && style.usage_purpose.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                <Globe className="w-3 h-3 mr-1" />
                {style.usage_purpose.length > 1 ? `${style.usage_purpose.length} Zwecke` : style.usage_purpose[0]}
              </span>
            )}
            {style.target_audience_detailed && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                <Users className="w-3 h-3 mr-1" />
                Zielgruppe
              </span>
            )}
          </div>

          {/* Farb-Vorschau */}
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex space-x-1">
              <div 
                className="w-6 h-6 rounded border border-gray-200" 
                style={{ backgroundColor: style.primary_color }}
                title="Primärfarbe"
              />
              <div 
                className="w-6 h-6 rounded border border-gray-200" 
                style={{ backgroundColor: style.secondary_color }}
                title="Sekundärfarbe"
              />
              <div 
                className="w-6 h-6 rounded border border-gray-200" 
                style={{ backgroundColor: style.accent_color }}
                title="Akzentfarbe"
              />
            </div>
            <div className="text-xs text-gray-500 truncate">
              {style.font_family}
            </div>
          </div>

          {/* Mini-Vorschau */}
          <div 
            className="p-3 rounded border"
            style={{ backgroundColor: style.background_color }}
          >
            <div 
              className="text-sm font-medium mb-1"
              style={{ 
                color: style.primary_color,
                fontFamily: style.font_headline 
              }}
            >
              Beispiel-Überschrift
            </div>
            <div 
              className="text-xs mb-2"
              style={{ 
                color: style.text_color,
                fontFamily: style.font_family 
              }}
            >
              Beispieltext für die Vorschau des Styles.
            </div>
            <div 
              className="inline-block px-2 py-1 text-xs rounded text-white"
              style={{ 
                backgroundColor: style.primary_color,
                borderRadius: style.button_style?.radius || '6px'
              }}
            >
              Button
            </div>
          </div>

          {/* Footer mit Datum */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              {style.is_default && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">Standard</span>
              )}
            </div>
            <div>
              {new Date(style.created_at || '').toLocaleDateString('de-DE')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const createMasterStyle = async () => {
    try {
      const masterTemplate: Omit<CITemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: 'Master Corporate Identity',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        accent_color: '#10B981',
        background_color: '#ffffff',
        text_color: '#000000',
        font_family: 'Inter',
        font_headline: 'Inter',
        font_sizes: { h1: '32px', h2: '24px', body: '16px' },
        button_style: { radius: '6px', padding: '12px 24px' },
        icon_style: { style: 'outline', color: 'auto', shape: 'round' },
        block_styles: {},
        is_default: false,
        is_master_ci: true, // Das ist der wichtige Unterschied
        category: 'Master',
        target_audience_detailed: null,
        usage_purpose: ['Alle Anwendungen']
      }

      const createdTemplate = await CITemplatesAPI.create(masterTemplate)
      
      // Weiterleitung zum Design-Editor für das neue Master-Style
      router.push(`/ci-styling/editor?id=${createdTemplate.id}`)
      
    } catch (error) {
      console.error('Error creating master style:', error)
      alert('Fehler beim Erstellen des Master-Styles: ' + (error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CI-Styling Dashboard</h1>
            <p className="text-sm text-gray-600">
              Verwalten Sie alle Ihre Corporate Identity Styles an einem Ort
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href="/ci-styling/einstellungen"
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span>Einstellungen</span>
            </Link>
            <button
              onClick={createNewStyle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Neues Style anlegen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              
              {(filters.category || filters.campaign || filters.usage_purpose || filters.target_group) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Kategorie Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Kategorien</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Kampagne Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampagne</label>
                  <select
                    value={filters.campaign}
                    onChange={(e) => setFilters({...filters, campaign: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Kampagnen</option>
                    {availableCampaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </div>

                {/* Verwendungszweck Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verwendungszweck</label>
                  <select
                    value={filters.usage_purpose}
                    onChange={(e) => setFilters({...filters, usage_purpose: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Zwecke</option>
                    {PREDEFINED_USAGE_PURPOSES.map((purpose) => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>

                {/* Zielgruppe Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zielgruppe</label>
                  <select
                    value={filters.target_group}
                    onChange={(e) => setFilters({...filters, target_group: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle</option>
                    <option value="defined">Mit Zielgruppe</option>
                    <option value="undefined">Ohne Zielgruppe</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified Grid Layout - Master immer als erstes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Master Style - immer als erstes wenn vorhanden */}
          {masterStyle && (
            <StyleCard style={masterStyle} isMaster={true} />
          )}

          {/* Create Master Style if none exists */}
          {!masterStyle && (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">Kein Masterdesign</h3>
              <p className="text-xs text-gray-600 mb-3">
                Erstellen Sie Ihr Master CI-Design
              </p>
              <button
                onClick={() => createMasterStyle()}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
              >
                <Crown className="w-4 h-4" />
                <span>Erstellen</span>
              </button>
            </div>
          )}

          {/* Gefilterte Styles - danach */}
          {getFilteredStyles().map((style) => (
            <StyleCard key={style.id} style={style} />
          ))}

          {/* Empty State für neue Styles */}
          {styles.length === 0 && (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">Erstes Style erstellen</h3>
              <p className="text-xs text-gray-600 mb-3">
                Spezielle Styles für Kampagnen oder Zielgruppen
              </p>
              <button
                onClick={createNewStyle}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Erstellen</span>
              </button>
            </div>
          )}
        </div>

        {/* No Results State */}
        {styles.length > 0 && getFilteredStyles().length === 0 && (
          <div className="mt-8 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Styles gefunden</h3>
            <p className="text-sm text-gray-600 mb-4">Versuchen Sie andere Filtereinstellungen.</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
              <span>Filter zurücksetzen</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && styleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Style löschen</h3>
                <p className="text-sm text-gray-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Möchten Sie das Style <strong>"{styleToDelete.name}"</strong> wirklich löschen?
              </p>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setStyleToDelete(null)
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isLoading ? 'Löschen...' : 'Löschen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 