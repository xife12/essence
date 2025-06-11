'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, Plus, Trash2, Settings, Crown, Users, Target, Globe, Tag } from 'lucide-react'
import Link from 'next/link'
import { CITemplatesAPI, CITemplate, CISetting } from '@/app/lib/api/ci-templates'

// Vordefinierte Kategorien
const PREDEFINED_CATEGORIES = [
  'Kampagne',
  'Saisonal', 
  'Zielgruppe',
  'Kanal-spezifisch',
  'Event',
  'Allgemein'
]

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

// Vordefinierte Interessen
const PREDEFINED_INTERESTS = [
  'Krafttraining',
  'Cardio',
  'Yoga',
  'Pilates',
  'Functional Training',
  'Wellness',
  'Ernährung',
  'Rehabilitation',
  'Gruppenkurse',
  'Personal Training'
]

// Vordefinierte sportliche Ziele
const PREDEFINED_SPORTS_GOALS = [
  'Gewichtsreduktion',
  'Muskelaufbau',
  'Ausdauer verbessern',
  'Beweglichkeit steigern',
  'Stressabbau',
  'Gesundheit fördern',
  'Wettkampfvorbereitung',
  'Rehabilitation',
  'Körperstraffung',
  'Fitness allgemein'
]

interface StyleSettings {
  name: string
  category?: string
  linked_campaign_id?: string
  target_audience_detailed?: {
    description?: string
    age_min?: number
    age_max?: number
    interests?: string[]
    sports_goals?: string[]
  }
  usage_purpose?: string[]
  tags?: string[]
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const styleId = searchParams.get('style')
  const isCreateMode = searchParams.get('create') === 'true'
  
  // Global Settings State
  const [globalCategories, setGlobalCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Style Settings State
  const [currentStyle, setCurrentStyle] = useState<CITemplate | null>(null)
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    name: '',
    category: undefined,
    linked_campaign_id: undefined,
    target_audience_detailed: {
      description: '',
      age_min: undefined,
      age_max: undefined,
      interests: [],
      sports_goals: []
    },
    usage_purpose: [],
    tags: []
  })

  // Campaigns (placeholder)
  const [availableCampaigns] = useState([
    { id: '1', name: 'Frühjahrskampagne 2025' },
    { id: '2', name: 'Sommerfitness' }
  ])

  useEffect(() => {
    loadGlobalSettings()
    if (styleId) {
      loadStyleSettings()
    }
  }, [styleId])

  const loadGlobalSettings = async () => {
    try {
      const settings = await CITemplatesAPI.getSettings()
      const categorySettings = settings.find(s => s.setting_key === 'default_categories')
      if (categorySettings && categorySettings.setting_value) {
        setGlobalCategories(categorySettings.setting_value)
      } else {
        setGlobalCategories(PREDEFINED_CATEGORIES)
      }
    } catch (error) {
      console.error('Error loading global settings:', error)
      setGlobalCategories(PREDEFINED_CATEGORIES)
    }
  }

  const loadStyleSettings = async () => {
    if (!styleId) return
    
    try {
      const style = await CITemplatesAPI.getById(styleId)
      setCurrentStyle(style)
      setStyleSettings({
        name: style.name,
        category: style.category,
        linked_campaign_id: style.linked_campaign_id,
        target_audience_detailed: style.target_audience_detailed || {
          description: '',
          age_min: undefined,
          age_max: undefined,
          interests: [],
          sports_goals: []
        },
        usage_purpose: style.usage_purpose || [],
        tags: style.tags || []
      })
    } catch (error) {
      console.error('Error loading style:', error)
    }
  }

  const saveGlobalSettings = async () => {
    setIsLoading(true)
    try {
      await CITemplatesAPI.saveSetting('default_categories', globalCategories)
      alert('Globale Einstellungen erfolgreich gespeichert!')
    } catch (error) {
      console.error('Error saving global settings:', error)
      alert('Fehler beim Speichern der globalen Einstellungen.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveStyleSettings = async () => {
    if (!styleId || !currentStyle) return
    
    setIsLoading(true)
    try {
      const updatedStyle: CITemplate = {
        ...currentStyle,
        name: styleSettings.name,
        category: styleSettings.category,
        linked_campaign_id: styleSettings.linked_campaign_id,
        target_audience_detailed: styleSettings.target_audience_detailed,
        usage_purpose: styleSettings.usage_purpose,
        tags: styleSettings.tags
      }
      
      await CITemplatesAPI.update(styleId, updatedStyle)
      alert('Style-Einstellungen erfolgreich gespeichert!')
      router.push('/ci-styling')
    } catch (error) {
      console.error('Error saving style settings:', error)
      alert('Fehler beim Speichern der Style-Einstellungen.')
    } finally {
      setIsLoading(false)
    }
  }

  const createNewStyle = async () => {
    if (!styleSettings.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Style ein.')
      return
    }

    setIsLoading(true)
    try {
      const newTemplate: Omit<CITemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: styleSettings.name,
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
        is_master_ci: false,
        category: styleSettings.category,
        target_audience_detailed: styleSettings.target_audience_detailed,
        usage_purpose: styleSettings.usage_purpose,
        linked_campaign_id: styleSettings.linked_campaign_id,
        tags: styleSettings.tags || []
      }

      const createdTemplate = await CITemplatesAPI.create(newTemplate)
      
      // Weiterleitung zum Design-Editor
      router.push(`/ci-styling/editor?id=${createdTemplate.id}`)
      
    } catch (error) {
      console.error('Error creating style:', error)
      alert('Fehler beim Erstellen des Styles: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (isCreateMode) {
      await createNewStyle()
    } else if (styleId) {
      await saveStyleSettings()
    } else {
      await saveGlobalSettings()
    }
  }

  const getPageTitle = () => {
    if (isCreateMode) return 'Neues CI-Style erstellen'
    if (styleId && currentStyle) return 'Style-Einstellungen'
    return 'CI-Styling Einstellungen'
  }

  const getPageDescription = () => {
    if (isCreateMode) return 'Definieren Sie die Einstellungen für Ihr neues CI-Style'
    if (styleId && currentStyle) return `Einstellungen für ${currentStyle.name}`
    return 'Globale Einstellungen für das CI-Styling System'
  }

  const getButtonText = () => {
    if (isCreateMode) return isLoading ? 'Erstellt...' : 'Speichern & weiter'
    if (styleId) return isLoading ? 'Speichert...' : 'Speichern'
    return isLoading ? 'Speichert...' : 'Speichern'
  }

  const addCategory = () => {
    if (newCategory.trim() && !globalCategories.includes(newCategory.trim())) {
      setGlobalCategories([...globalCategories, newCategory.trim()])
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    setGlobalCategories(globalCategories.filter(c => c !== category))
  }

  const toggleInterest = (interest: string) => {
    const currentInterests = styleSettings.target_audience_detailed?.interests || []
    const updated = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest]
    
    setStyleSettings({
      ...styleSettings,
      target_audience_detailed: {
        ...styleSettings.target_audience_detailed,
        interests: updated
      }
    })
  }

  const toggleSportsGoal = (goal: string) => {
    const currentGoals = styleSettings.target_audience_detailed?.sports_goals || []
    const updated = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal]
    
    setStyleSettings({
      ...styleSettings,
      target_audience_detailed: {
        ...styleSettings.target_audience_detailed,
        sports_goals: updated
      }
    })
  }

  const toggleUsagePurpose = (purpose: string) => {
    const current = styleSettings.usage_purpose || []
    const updated = current.includes(purpose)
      ? current.filter(p => p !== purpose)
      : [...current, purpose]
    
    setStyleSettings({
      ...styleSettings,
      usage_purpose: updated
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/ci-styling" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                {getPageDescription()}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{getButtonText()}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Style Settings */}
        {(styleId || isCreateMode) ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Style Info Card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3 mb-4">
                {currentStyle?.is_master_ci ? (
                  <Crown className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Settings className="w-6 h-6 text-blue-500" />
                )}
                <h2 className="text-lg font-semibold">
                  {isCreateMode ? 'Neues Style konfigurieren' : 
                   currentStyle?.is_master_ci ? 'Master Style Einstellungen' : 'Style-Details'}
                </h2>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style-Name *
                  </label>
                  <input
                    type="text"
                    value={styleSettings.name}
                    onChange={(e) => setStyleSettings({...styleSettings, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Name des Styles"
                  />
                </div>

                {/* Kategorie */}
                {(!currentStyle || !currentStyle.is_master_ci) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategorie
                    </label>
                    <select
                      value={styleSettings.category || ''}
                      onChange={(e) => setStyleSettings({...styleSettings, category: e.target.value || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Keine Kategorie</option>
                      {globalCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Kampagnenverknüpfung */}
                {(!currentStyle || !currentStyle.is_master_ci) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kampagnenverknüpfung
                    </label>
                    <select
                      value={styleSettings.linked_campaign_id || ''}
                      onChange={(e) => setStyleSettings({...styleSettings, linked_campaign_id: e.target.value || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Keine Kampagne</option>
                      {availableCampaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Verwendungszweck */}
                {(!currentStyle || !currentStyle.is_master_ci) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verwendungszwecke
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                      {PREDEFINED_USAGE_PURPOSES.map((purpose) => (
                        <label key={purpose} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={styleSettings.usage_purpose?.includes(purpose) || false}
                            onChange={() => toggleUsagePurpose(purpose)}
                            className="mr-2 text-blue-600"
                          />
                          <span>{purpose}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Zielgruppe */}
            {(!currentStyle || !currentStyle.is_master_ci) && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-orange-500" />
                  <h2 className="text-lg font-semibold">Zielgruppendefinition</h2>
                </div>

                <div className="space-y-4">
                  {/* Beschreibung */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      value={styleSettings.target_audience_detailed?.description || ''}
                      onChange={(e) => setStyleSettings({
                        ...styleSettings,
                        target_audience_detailed: {
                          ...styleSettings.target_audience_detailed,
                          description: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Kurze Beschreibung der Zielgruppe..."
                    />
                  </div>

                  {/* Altersbereich */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alter von
                      </label>
                      <input
                        type="number"
                        value={styleSettings.target_audience_detailed?.age_min || ''}
                        onChange={(e) => setStyleSettings({
                          ...styleSettings,
                          target_audience_detailed: {
                            ...styleSettings.target_audience_detailed,
                            age_min: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="z.B. 18"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alter bis
                      </label>
                      <input
                        type="number"
                        value={styleSettings.target_audience_detailed?.age_max || ''}
                        onChange={(e) => setStyleSettings({
                          ...styleSettings,
                          target_audience_detailed: {
                            ...styleSettings.target_audience_detailed,
                            age_max: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="z.B. 35"
                      />
                    </div>
                  </div>

                  {/* Interessen */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interessen
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                      {PREDEFINED_INTERESTS.map((interest) => (
                        <label key={interest} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={styleSettings.target_audience_detailed?.interests?.includes(interest) || false}
                            onChange={() => toggleInterest(interest)}
                            className="mr-2 text-blue-600"
                          />
                          <span>{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sportliche Ziele */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sportliche Ziele
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-3">
                      {PREDEFINED_SPORTS_GOALS.map((goal) => (
                        <label key={goal} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={styleSettings.target_audience_detailed?.sports_goals?.includes(goal) || false}
                            onChange={() => toggleSportsGoal(goal)}
                            className="mr-2 text-blue-600"
                          />
                          <span>{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Global Settings */
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Kategorien verwalten */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Tag className="w-6 h-6 text-blue-500" />
                <h2 className="text-lg font-semibold">Kategorien verwalten</h2>
              </div>
              
              <div className="space-y-4">
                {/* Neue Kategorie hinzufügen */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Neue Kategorie hinzufügen..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Kategorien Liste */}
                <div className="space-y-2">
                  {globalCategories.map((category) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">{category}</span>
                      <button
                        onClick={() => removeCategory(category)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CIStylingSettings() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <SettingsContent />
    </Suspense>
  )
} 