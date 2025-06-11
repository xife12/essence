'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, Palette, Type, Square, Monitor, Smartphone, ArrowLeft, FileText, Settings, Dumbbell, Heart, Users } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ColorPickerWithContrast from '@/app/components/ci-styling/ColorPickerWithContrast'
import FontSelector from '@/app/components/ci-styling/FontSelector'
import ButtonStyleCard from '@/app/components/ci-styling/ButtonStyleCard'
import { CITemplatesAPI, CITemplate } from '@/app/lib/api/ci-templates'

interface CIPreset {
  id?: string
  name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  font_headline: string
  font_sizes: {
    h1: string
    h2: string
    body: string
  }
  button_style: {
    radius: string
    padding: string
    custom?: boolean
    size?: 'small' | 'medium' | 'large'
  }
  icon_style: {
    style: 'outline' | 'filled'
    color: 'auto' | 'custom'
    shape: 'round' | 'square'
  }
  block_styles: any
  linked_campaign_id?: string
  campaign_scope?: 'single' | 'all'
  is_default: boolean
  parent_ci_id?: string
  is_master_ci: boolean
  category?: string
  target_audience?: any
  usage_purpose?: string[]
}

const DEFAULT_PRESET: CIPreset = {
  name: '',
  primary_color: '#3B82F6',
  secondary_color: '#1E40AF',
  accent_color: '#10B981',
  background_color: '#ffffff',
  text_color: '#000000',
  font_family: 'Inter',
  font_headline: 'Inter',
  font_sizes: {
    h1: '32px',
    h2: '24px',
    body: '16px'
  },
  button_style: {
    radius: '6px',
    padding: '12px 24px'
  },
  icon_style: {
    style: 'outline',
    color: 'auto',
    shape: 'round'
  },
  block_styles: {},
  is_default: false,
  is_master_ci: false
}

// Utility functions for color calculations
const calculateAccessibleColor = (color: string): string => {
  // Simple function to darken a color for better accessibility
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Darken by 20%
  const newR = Math.floor(r * 0.8)
  const newG = Math.floor(g * 0.8)
  const newB = Math.floor(b * 0.8)
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

const generateAccentColor = (primary: string, secondary: string): string => {
  // Generate accent color based on primary and secondary colors
  const primaryHex = primary.replace('#', '')
  const secondaryHex = secondary.replace('#', '')
  
  const primaryR = parseInt(primaryHex.substring(0, 2), 16)
  const primaryG = parseInt(primaryHex.substring(2, 4), 16)
  const primaryB = parseInt(primaryHex.substring(4, 6), 16)
  
  const secondaryR = parseInt(secondaryHex.substring(0, 2), 16)
  const secondaryG = parseInt(secondaryHex.substring(2, 4), 16)
  const secondaryB = parseInt(secondaryHex.substring(4, 6), 16)
  
  // Create a complementary color by mixing and shifting
  const accentR = Math.floor((primaryR + secondaryR) / 2)
  const accentG = Math.floor((primaryG + secondaryG) / 2 + 50) % 255
  const accentB = Math.floor((primaryB + secondaryB) / 2)
  
  return `#${accentR.toString(16).padStart(2, '0')}${accentG.toString(16).padStart(2, '0')}${accentB.toString(16).padStart(2, '0')}`
}

const getButtonPadding = (size: string): string => {
  switch (size) {
    case 'small': return '8px 16px'
    case 'large': return '16px 32px'
    default: return '12px 24px' // medium
  }
}

export default function CIStylingEditor() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const styleId = searchParams?.get('id')
  const isNew = searchParams?.get('new') === 'true'
  const initialName = searchParams?.get('name')

  const [preset, setPreset] = useState<CIPreset>(DEFAULT_PRESET)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobilePreview, setIsMobilePreview] = useState(false)
  const [showTertiaryColor, setShowTertiaryColor] = useState(false)

  // Logo-State hinzufügen
  const [logos, setLogos] = useState({
    primary: null as string | null,
    white: null as string | null,
    black: null as string | null,
    favicon: null as string | null
  })

  // Button-Styles für die drei Typen
  const [buttonStyles, setButtonStyles] = useState({
    primary: {
      style: { radius: '6px', padding: '12px 24px', fontSize: '16px', fontWeight: '500' },
      colors: { background: '#3B82F6', text: '#ffffff' }
    },
    secondary: {
      style: { radius: '6px', padding: '12px 24px', fontSize: '16px', fontWeight: '500' },
      colors: { background: '#6B7280', text: '#ffffff' }
    },
    ghost: {
      style: { radius: '6px', padding: '12px 24px', fontSize: '16px', fontWeight: '500' },
      colors: { background: '#3B82F6', text: '#3B82F6' }
    }
  })

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Scroll zu Basis-Informationen Funktion
  const scrollToSettings = () => {
    const basisInfoElement = document.getElementById('basis-informationen')
    if (basisInfoElement) {
      basisInfoElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
      // Kurzes Highlight-Effekt
      basisInfoElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)'
      setTimeout(() => {
        basisInfoElement.style.boxShadow = ''
      }, 2000)
    }
  }

  // Google Fonts laden
  useEffect(() => {
    const loadGoogleFont = (fontName: string) => {
      // Remove special characters and spaces for proper font loading
      const cleanFontName = fontName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '+')
      const fontId = `font-${cleanFontName.replace(/\+/g, '-').toLowerCase()}`
      
      // Remove existing font link if it exists
      const existingLink = document.getElementById(fontId)
      if (existingLink) {
        existingLink.remove()
      }
      
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${cleanFontName}:wght@300;400;500;600;700&display=swap`
      link.rel = 'stylesheet'
      link.id = fontId
      
      document.head.appendChild(link)
    }

    // Alle verwendeten Fonts laden
    loadGoogleFont(preset.font_headline)
    loadGoogleFont(preset.font_family)
    
    // Force repaint after a short delay to ensure fonts are loaded
    setTimeout(() => {
      const previewElement = document.querySelector('[data-preview="live"]') as HTMLElement
      if (previewElement) {
        previewElement.style.visibility = 'hidden'
        previewElement.offsetHeight // Trigger reflow
        previewElement.style.visibility = 'visible'
      }
    }, 100)
  }, [preset.font_headline, preset.font_family])

  // Logo-Upload-Handler
  const handleLogoUpload = (type: 'primary' | 'white' | 'black' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogos(prev => ({
          ...prev,
          [type]: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (styleId) {
      loadStyle(styleId)
    } else if (isNew && initialName) {
      setPreset(prev => ({ ...prev, name: decodeURIComponent(initialName) }))
      // Logos vom Masterdesign laden wenn neues Style erstellt wird
      loadMasterLogos()
    }
  }, [styleId, isNew, initialName])

  const loadMasterLogos = async () => {
    try {
      const masterTemplates = await CITemplatesAPI.getMasterCIs()
      const masterTemplate = masterTemplates[0] // Nehme das erste Masterdesign
      if (masterTemplate && masterTemplate.block_styles && masterTemplate.block_styles.logos) {
        setLogos(masterTemplate.block_styles.logos)
      }
    } catch (error) {
      console.error('Error loading master logos:', error)
    }
  }

  const loadStyle = async (id: string) => {
    try {
      const template = await CITemplatesAPI.getById(id)
      if (template) {
        setPreset({
          id: template.id,
          name: template.name,
          primary_color: template.primary_color,
          secondary_color: template.secondary_color,
          accent_color: template.accent_color,
          background_color: template.background_color,
          text_color: template.text_color,
          font_family: template.font_family,
          font_headline: template.font_headline,
          font_sizes: template.font_sizes,
          button_style: template.button_style,
          icon_style: template.icon_style || { style: 'outline', color: 'auto', shape: 'round' },
          block_styles: template.block_styles || {},
          linked_campaign_id: template.linked_campaign_id,
          campaign_scope: template.campaign_scope,
          is_default: template.is_default,
          parent_ci_id: template.parent_ci_id,
          is_master_ci: template.is_master_ci,
          category: template.category,
          target_audience: template.target_audience_detailed || template.target_audience,
          usage_purpose: template.usage_purpose
        })
        setShowTertiaryColor(!!template.accent_color)
        
        // Button-Styles wiederherstellen wenn vorhanden
        if (template.block_styles && template.block_styles.button_styles) {
          setButtonStyles(template.block_styles.button_styles)
        }
        
        // Logos wiederherstellen wenn vorhanden
        if (template.block_styles && template.block_styles.logos) {
          setLogos(template.block_styles.logos)
        } else if (!template.is_master_ci) {
          // Wenn kein eigenes Logo vorhanden und es kein Masterdesign ist, dann Master-Logos laden
          loadMasterLogos()
        }
      }
    } catch (error) {
      console.error('Error loading style:', error)
      alert('Fehler beim Laden des Styles: ' + (error as Error).message)
    }
  }

  const updatePreset = (field: string, value: any) => {
    setPreset(prev => ({ ...prev, [field]: value }))
  }

  const updateButtonStyle = (type: 'primary' | 'secondary' | 'ghost', style: any, colors: any) => {
    setButtonStyles(prev => ({
      ...prev,
      [type]: { style, colors }
    }))
  }

  const savePreset = async (navigateAfterSave: boolean = false) => {
    if (!preset.name.trim()) {
      alert('Bitte geben Sie einen Namen für das Style ein.')
      return
    }

    setIsLoading(true)
    console.log('Saving preset:', preset)
    
    try {
      const templateData: Omit<CITemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: preset.name,
        primary_color: preset.primary_color || '#3B82F6',
        secondary_color: preset.secondary_color || '#1E40AF',
        accent_color: preset.accent_color || '#10B981',
        background_color: preset.background_color || '#ffffff',
        text_color: preset.text_color || '#000000',
        font_family: preset.font_family || 'Inter',
        font_headline: preset.font_headline || 'Inter',
        font_sizes: preset.font_sizes || { h1: '32px', h2: '24px', body: '16px' },
        button_style: preset.button_style || { radius: '6px', padding: '12px 24px' },
        icon_style: preset.icon_style || { style: 'outline', color: 'auto', shape: 'round' },
        block_styles: { 
          ...preset.block_styles,
          button_styles: buttonStyles,
          logos: logos
        },
        linked_campaign_id: preset.linked_campaign_id || null,
        campaign_scope: preset.campaign_scope || null,
        is_default: preset.is_default || false,
        parent_ci_id: preset.parent_ci_id || null,
        is_master_ci: preset.is_master_ci || false,
        category: preset.category || null,
        target_audience_detailed: preset.target_audience || null,
        usage_purpose: preset.usage_purpose || null
      }

      console.log('Template data to save:', templateData)

      if (preset.id) {
        console.log('Updating existing template with ID:', preset.id)
        const updatedTemplate = await CITemplatesAPI.update(preset.id, templateData)
        console.log('Update result:', updatedTemplate)
        alert('CI-Style erfolgreich aktualisiert!')
        
        // Nur navigieren wenn gewünscht
        if (navigateAfterSave) {
          router.push('/ci-styling')
        }
      } else {
        console.log('Creating new template')
        const newTemplate = await CITemplatesAPI.create(templateData)
        console.log('Create result:', newTemplate)
        setPreset(prev => ({ ...prev, id: newTemplate.id }))
        alert('CI-Style erfolgreich erstellt!')
        
        // Nur navigieren wenn gewünscht
        if (navigateAfterSave) {
          router.push('/ci-styling')
        }
      }
    } catch (error) {
      console.error('Error saving style:', error)
      console.error('Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        preset: preset
      })
      alert('Fehler beim Speichern des Styles: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const generateLivePreview = () => {
    return (
      <div 
        className={`bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
          isMobilePreview ? 'max-w-sm mx-auto' : 'w-full'
        }`}
        style={{ backgroundColor: preset.background_color }}
        data-preview="live"
      >
        {/* Header */}
        <div 
          className="px-6 py-8 text-center"
          style={{ backgroundColor: preset.primary_color, color: preset.background_color }}
        >
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              fontFamily: preset.font_headline,
              fontSize: isMobilePreview ? '24px' : preset.font_sizes.h1,
              color: preset.background_color
            }}
          >
            Ihr Fitnessstudio
          </h1>
          <p 
            className="text-lg opacity-90"
            style={{ 
              fontFamily: preset.font_family,
              color: preset.background_color,
              fontSize: isMobilePreview ? '14px' : '18px'
            }}
          >
            Erreichen Sie Ihre Fitnessziele
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 
              className="font-semibold mb-3"
              style={{ 
                fontFamily: preset.font_headline,
                fontSize: isMobilePreview ? '20px' : preset.font_sizes.h2,
                color: preset.text_color
              }}
            >
              Unsere Angebote
            </h2>
            <p 
              className="leading-relaxed mb-4"
              style={{ 
                fontFamily: preset.font_family,
                fontSize: isMobilePreview ? '14px' : preset.font_sizes.body,
                color: preset.text_color
              }}
            >
              Entdecken Sie unser vielfältiges Angebot an Kursen und Trainingsmöglichkeiten. 
              Von Krafttraining bis Yoga - wir haben für jeden etwas dabei.
            </p>
          </div>

          {/* Button Examples */}
          <div className="space-y-3">
            {/* Primary Button */}
            <button
              className="w-full transition-all hover:opacity-90"
              style={{
                borderRadius: preset.button_style?.radius || '6px',
                padding: getButtonPadding(preset.button_style?.size || 'medium'),
                backgroundColor: preset.button_style?.custom ? 
                  (buttonStyles.primary?.colors?.background || preset.primary_color) : 
                  preset.primary_color,
                color: preset.button_style?.custom ? 
                  (buttonStyles.primary?.colors?.text || '#ffffff') : 
                  '#ffffff',
                fontFamily: preset.font_family,
                fontSize: isMobilePreview ? '14px' : '16px',
                fontWeight: '500',
                border: 'none'
              }}
            >
              Jetzt Mitglied werden
            </button>
            
            {/* Secondary Button */}
            <button
              className="w-full transition-all hover:opacity-80"
              style={{
                borderRadius: preset.button_style?.radius || '6px',
                padding: getButtonPadding(preset.button_style?.size || 'medium'),
                backgroundColor: 'transparent',
                border: `1px solid ${preset.button_style?.custom ? 
                  (buttonStyles.secondary?.colors?.background || preset.secondary_color) : 
                  preset.secondary_color}`,
                color: preset.button_style?.custom ? 
                  (buttonStyles.secondary?.colors?.background || preset.secondary_color) : 
                  preset.secondary_color,
                fontFamily: preset.font_family,
                fontSize: isMobilePreview ? '14px' : '16px',
                fontWeight: '500'
              }}
            >
              Mehr erfahren
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { name: 'Krafttraining', icon: Dumbbell },
              { name: 'Cardio', icon: Heart },
              { name: 'Yoga', icon: Users }
            ].map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="p-3">
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: generateAccentColor(preset.primary_color, preset.secondary_color) + '20' }}
                  >
                    <IconComponent 
                      className="w-4 h-4" 
                      style={{ color: preset.primary_color }}
                    />
                  </div>
                  <p 
                    className="text-xs"
                    style={{ 
                      fontFamily: preset.font_family,
                      color: preset.text_color
                    }}
                  >
                    {feature.name}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Testimonial */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: generateAccentColor(preset.primary_color, preset.secondary_color) + '20',
              borderRadius: preset.button_style?.radius || '6px'
            }}
          >
            <p 
              className="text-sm italic mb-2"
              style={{ 
                fontFamily: preset.font_family,
                color: preset.text_color
              }}
            >
              "Das ist das beste Produkt, das ich ja verwendet habe!"
            </p>
            <div className="flex items-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format"
                alt="Julia Meyer"
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
              <div>
                <p 
                  className="text-xs font-medium"
                  style={{ 
                    color: preset.secondary_color,
                    fontFamily: preset.font_family
                  }}
                >
                  Julia Meyer
                </p>
                <p 
                  className="text-xs text-gray-500"
                  style={{ fontFamily: preset.font_family }}
                >
                  Auditin
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 
              className="font-semibold mb-3"
              style={{ 
                fontFamily: preset.font_headline,
                color: preset.text_color,
                fontSize: isMobilePreview ? '16px' : '18px'
              }}
            >
              Mit uns in Kontakt treten
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border border-gray-300 rounded"
                style={{
                  borderRadius: preset.button_style?.radius || '6px',
                  fontFamily: preset.font_family,
                  fontSize: '14px'
                }}
              />
              <input
                type="email"
                placeholder="E-Mail"
                className="w-full p-2 border border-gray-300 rounded"
                style={{
                  borderRadius: preset.button_style?.radius || '6px',
                  fontFamily: preset.font_family,
                  fontSize: '14px'
                }}
              />
              <button
                className="w-full transition-all hover:opacity-90"
                style={{
                  borderRadius: preset.button_style?.radius || '6px',
                  padding: getButtonPadding('medium'),
                  backgroundColor: generateAccentColor(preset.primary_color, preset.secondary_color),
                  color: '#ffffff',
                  fontFamily: preset.font_family,
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none'
                }}
              >
                Senden
              </button>
            </div>
          </div>

          {/* Logo placeholder */}
          <div className="text-center pt-4 border-t border-gray-200">
            {logos.primary ? (
              <img 
                src={logos.primary} 
                alt="Logo"
                className="mx-auto mb-2 max-h-12 object-contain"
              />
            ) : (
              <div 
                className="mx-auto mb-2 text-4xl"
                style={{ 
                  color: preset.text_color,
                  fontFamily: preset.font_headline
                }}
              >
                Logo
              </div>
            )}
          </div>
        </div>
      </div>
    )
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
              <span>Zurück zum Dashboard</span>
            </Link>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-bold text-gray-900">
                {preset.name || 'Neues CI-Style'}
              </h1>
              <p className="text-sm text-gray-600">
                Gestalten Sie Ihr Corporate Identity Design
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Mobile/Desktop Toggle Switch */}
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-gray-500" />
              <div 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isMobilePreview ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setIsMobilePreview(!isMobilePreview)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isMobilePreview ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <Smartphone className="w-4 h-4 text-gray-500" />
            </div>
            
            {/* Settings Button */}
            <button
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Style-Einstellungen"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => savePreset(false)}
              disabled={isLoading || !preset.name.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Speichert...' : 'Speichern'}</span>
            </button>
            <button
              onClick={() => savePreset(true)}
              disabled={isLoading || !preset.name.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Speichert...' : 'Speichern & Zurück'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Linke Seite: Konfiguration */}
        <div className="w-1/2 p-6 overflow-y-auto max-h-screen">
          <div className="space-y-6">
            {/* Basis-Informationen */}
            <div className="bg-white rounded-lg p-6 shadow-sm" id="basis-informationen">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Basis-Informationen
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Style-Name *
                  </label>
                  <input
                    type="text"
                    value={preset.name}
                    onChange={(e) => updatePreset('name', e.target.value)}
                    placeholder="z.B. Frühjahrskampagne 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {!preset.is_master_ci && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Dieses Style erbt vom Masterdesign und kann individuell angepasst werden
                    </p>
                  )}
                </div>
                
                {preset.is_master_ci && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">👑</span>
                      <span className="text-sm font-medium text-yellow-800">Master Corporate Identity</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Dieses Design dient als Grundlage für alle anderen Styles
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Farbkonfiguration */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Farbkonfiguration</h2>
              
              <div className="space-y-6">
                {/* Primärfarbe */}
                <div>
                  <ColorPickerWithContrast
                    label="Primärfarbe"
                    value={preset.primary_color}
                    onChange={(color) => {
                      updatePreset('primary_color', color)
                      // Automatische Vererbung an Primary Button
                      updateButtonStyle('primary', buttonStyles.primary.style, {
                        background: color,
                        text: '#ffffff'
                      })
                    }}
                    backgroundColor={preset.background_color}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🔄 Wird automatisch an Primary Buttons vererbt
                  </p>
                  
                  {/* Barrierefreiheit Alternative */}
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700">Barrierefreiheit-Alternative (AA konform)</span>
                      <div 
                        className="w-8 h-8 rounded border-2 border-green-300 cursor-pointer"
                        style={{ backgroundColor: calculateAccessibleColor(preset.primary_color) }}
                        onClick={() => updatePreset('primary_color', calculateAccessibleColor(preset.primary_color))}
                        title="Klicken zum Übernehmen"
                      />
                    </div>
                  </div>
                </div>

                {/* Sekundärfarbe */}
                <div>
                  <ColorPickerWithContrast
                    label="Sekundärfarbe"
                    value={preset.secondary_color}
                    onChange={(color) => {
                      updatePreset('secondary_color', color)
                      // Automatische Vererbung an Secondary Button
                      updateButtonStyle('secondary', buttonStyles.secondary.style, {
                        background: color,
                        text: '#ffffff'
                      })
                    }}
                    backgroundColor={preset.background_color}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    🔄 Wird automatisch an Secondary Buttons vererbt
                  </p>
                </div>

                {/* Akzentfarbe - automatisch generiert */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Akzentfarbe (automatisch generiert)
                  </label>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{ backgroundColor: generateAccentColor(preset.primary_color, preset.secondary_color) }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Basiert auf Primär- und Sekundärfarbe
                      </p>
                      <p className="text-xs text-gray-500">
                        {generateAccentColor(preset.primary_color, preset.secondary_color)}
                      </p>
                    </div>
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => {
                        const newAccent = generateAccentColor(preset.primary_color, preset.secondary_color)
                        updatePreset('accent_color', newAccent)
                      }}
                    >
                      Neu generieren
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Schriftarten */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Type className="w-5 h-5 mr-2" />
                Schriftarten
              </h2>
              
              <div className="space-y-4">
                {/* Überschriften */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Überschriften
                  </label>
                  <select
                    value={preset.font_headline}
                    onChange={(e) => updatePreset('font_headline', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter (Sans-serif)</option>
                    <option value="Poppins">Poppins (Sans-serif)</option>
                    <option value="Roboto">Roboto (Sans-serif)</option>
                    <option value="Open Sans">Open Sans (Sans-serif)</option>
                    <option value="Montserrat">Montserrat (Sans-serif)</option>
                    <option value="Lato">Lato (Sans-serif)</option>
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="Merriweather">Merriweather (Serif)</option>
                    <option value="Crimson Text">Crimson Text (Serif)</option>
                    <option value="Source Sans Pro">Source Sans Pro (Sans-serif)</option>
                    <option value="Nunito">Nunito (Sans-serif)</option>
                    <option value="Raleway">Raleway (Sans-serif)</option>
                  </select>
                  
                  <div className="mt-2 p-3 bg-gray-50 rounded" style={{ fontFamily: preset.font_headline }}>
                    <div className="text-2xl font-bold mb-1">Das ist eine Überschrift</div>
                    <div className="text-lg font-semibold">Beispiel für Unterüberschrift</div>
                  </div>
                </div>

                {/* Standard-Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard-Text
                  </label>
                  <select
                    value={preset.font_family}
                    onChange={(e) => updatePreset('font_family', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter (Sans-serif)</option>
                    <option value="Poppins">Poppins (Sans-serif)</option>
                    <option value="Roboto">Roboto (Sans-serif)</option>
                    <option value="Open Sans">Open Sans (Sans-serif)</option>
                    <option value="Montserrat">Montserrat (Sans-serif)</option>
                    <option value="Lato">Lato (Sans-serif)</option>
                    <option value="Source Sans Pro">Source Sans Pro (Sans-serif)</option>
                    <option value="Nunito">Nunito (Sans-serif)</option>
                    <option value="Raleway">Raleway (Sans-serif)</option>
                    <option value="PT Sans">PT Sans (Sans-serif)</option>
                    <option value="Noto Sans">Noto Sans (Sans-serif)</option>
                  </select>
                  
                  <div className="mt-2 p-3 bg-gray-50 rounded" style={{ fontFamily: preset.font_family }}>
                    <p className="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing citi. Donec tincidunt vulputate libero, eit amet finibus nunc.</p>
                    <p className="text-sm text-gray-600">Beispieltext für die Vorschau der gewählten Schriftart.</p>
                  </div>
                </div>
                
                {/* Typografie-Hierarchie */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Typografie-Hierarchie</h4>
                  <div className="space-y-1 text-blue-700" style={{ fontFamily: preset.font_headline }}>
                    <div className="text-2xl font-bold">H1 - Hauptüberschrift</div>
                    <div className="text-xl font-semibold">H2 - Unterüberschrift</div>
                    <div className="text-lg font-medium">H3 - Sektion</div>
                    <div style={{ fontFamily: preset.font_family }} className="text-base">Standard-Text für Absätze</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Button-Stil */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Square className="w-5 h-5 mr-2" />
                Button-Stil
              </h2>
              
              <div className="space-y-6">
                {/* Individuelle Anpassung Toggle */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={preset.button_style?.custom || false}
                      onChange={(e) => updatePreset('button_style', { 
                        ...preset.button_style, 
                        custom: e.target.checked 
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-yellow-800">Individuell anpassen</span>
                      <p className="text-xs text-yellow-700">Aktivieren um eigene Button-Farben zu definieren</p>
                    </div>
                  </label>
                </div>

                {/* Button-Stil Einstellungen */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Radius</label>
                    <select
                      value={preset.button_style?.radius || '6px'}
                      onChange={(e) => updatePreset('button_style', { 
                        ...preset.button_style, 
                        radius: e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0px">Eckig (0px)</option>
                      <option value="4px">Leicht gerundet (4px)</option>
                      <option value="6px">Standard (6px)</option>
                      <option value="8px">Rund (8px)</option>
                      <option value="12px">Sehr rund (12px)</option>
                      <option value="9999px">Vollrund</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Größe</label>
                    <select
                      value={preset.button_style?.size || 'medium'}
                      onChange={(e) => updatePreset('button_style', { 
                        ...preset.button_style, 
                        size: e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="small">Klein (8px 16px)</option>
                      <option value="medium">Standard (12px 24px)</option>
                      <option value="large">Groß (16px 32px)</option>
                    </select>
                  </div>
                </div>

                {/* Button-Typen */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Button-Typen</h3>
                  
                  {/* Primary Button */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Primary Button</span>
                      {!(preset.button_style?.custom) && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          🔄 Vererbt von Primärfarbe
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Hintergrund</label>
                        <input
                          type="color"
                          value={preset.button_style?.custom ? 
                            (buttonStyles.primary?.colors?.background || preset.primary_color) : 
                            preset.primary_color
                          }
                          onChange={(e) => {
                            if (preset.button_style?.custom) {
                              updateButtonStyle('primary', buttonStyles.primary.style, {
                                ...buttonStyles.primary.colors,
                                background: e.target.value
                              })
                            }
                          }}
                          disabled={!preset.button_style?.custom}
                          className="w-full h-8 border border-gray-300 rounded disabled:opacity-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Text</label>
                        <input
                          type="color"
                          value={preset.button_style?.custom ? 
                            (buttonStyles.primary?.colors?.text || '#ffffff') : 
                            '#ffffff'
                          }
                          onChange={(e) => {
                            if (preset.button_style?.custom) {
                              updateButtonStyle('primary', buttonStyles.primary.style, {
                                ...buttonStyles.primary.colors,
                                text: e.target.value
                              })
                            }
                          }}
                          disabled={!preset.button_style?.custom}
                          className="w-full h-8 border border-gray-300 rounded disabled:opacity-50"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <button
                        className="w-full transition-all hover:opacity-90"
                        style={{
                          borderRadius: preset.button_style?.radius || '6px',
                          padding: getButtonPadding(preset.button_style?.size || 'medium'),
                          backgroundColor: preset.button_style?.custom ? 
                            (buttonStyles.primary?.colors?.background || preset.primary_color) : 
                            preset.primary_color,
                          color: preset.button_style?.custom ? 
                            (buttonStyles.primary?.colors?.text || '#ffffff') : 
                            '#ffffff',
                          fontFamily: preset.font_family
                        }}
                      >
                        Primary Button Beispiel
                      </button>
                    </div>
                  </div>

                  {/* Secondary Button */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Secondary Button</span>
                      {!(preset.button_style?.custom) && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          🔄 Vererbt von Sekundärfarbe
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <button
                        className="w-full transition-all hover:opacity-80"
                        style={{
                          borderRadius: preset.button_style?.radius || '6px',
                          padding: getButtonPadding(preset.button_style?.size || 'medium'),
                          backgroundColor: 'transparent',
                          border: `1px solid ${preset.button_style?.custom ? 
                            (buttonStyles.secondary?.colors?.background || preset.secondary_color) : 
                            preset.secondary_color}`,
                          color: preset.button_style?.custom ? 
                            (buttonStyles.secondary?.colors?.background || preset.secondary_color) : 
                            preset.secondary_color,
                          fontFamily: preset.font_family
                        }}
                      >
                        Secondary Button Beispiel
                      </button>
                    </div>
                  </div>

                  {/* Ghost Button */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Ghost Button</span>
                      {!(preset.button_style?.custom) && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          🔄 Vererbt von Primärfarbe
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <button
                        className="w-full transition-all hover:opacity-80"
                        style={{
                          borderRadius: preset.button_style?.radius || '6px',
                          padding: getButtonPadding(preset.button_style?.size || 'medium'),
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: preset.button_style?.custom ? 
                            (buttonStyles.ghost?.colors?.text || preset.primary_color) : 
                            preset.primary_color,
                          fontFamily: preset.font_family,
                          textDecoration: 'underline'
                        }}
                      >
                        Ghost Button Beispiel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo-Verwaltung */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                📷 <span className="ml-2">Logo-Verwaltung</span>
              </h2>
              
              {!preset.is_master_ci && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">👑</span>
                    <span className="text-sm font-medium text-blue-800">Master-Design Vererbung</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Logos werden automatisch vom Masterdesign übernommen. Mit "Alternative hochladen" können Sie diese überschreiben.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Logo Upload Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: 'Primary', desc: 'Hauptlogo für normale Verwendung', bg: 'bg-gray-100' },
                    { type: 'White', desc: 'Für dunkle Hintergründe', bg: 'bg-gray-800' },
                    { type: 'Black', desc: 'Für helle Hintergründe', bg: 'bg-white border' },
                    { type: 'Favicon', desc: 'Für Browser-Tabs (quadratisch)', bg: 'bg-blue-500' }
                  ].map((logo) => {
                    const logoKey = logo.type.toLowerCase() as keyof typeof logos
                    const hasLogo = logos[logoKey]
                    
                    return (
                      <div key={logo.type} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{logo.type} Logo</label>
                        <div className={`${logo.bg} rounded-lg p-4 text-center h-24 flex items-center justify-center relative group cursor-pointer hover:opacity-75 transition-opacity`}>
                          {hasLogo ? (
                            <img 
                              src={hasLogo} 
                              alt={`${logo.type} Logo`}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">Logo hochladen</span>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            onChange={(e) => handleLogoUpload(logoKey, e)} 
                          />
                        </div>
                        <p className="text-xs text-gray-500">{logo.desc}</p>
                        {!preset.is_master_ci && (
                          <button className="text-xs text-blue-600 hover:text-blue-700">
                            Alternative hochladen
                          </button>
                        )}
                        {hasLogo && (
                          <button 
                            onClick={() => setLogos(prev => ({ ...prev, [logoKey]: null }))}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Logo entfernen
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {/* Logo Empfehlungen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">📋 Empfehlungen</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Format: PNG mit transparentem Hintergrund</li>
                    <li>• Auflösung: Mindestens 300 DPI für Druckqualität</li>
                    <li>• Größe: Zwischen 500px - 2000px Breite</li>
                    <li>• Favicon: 512x512px quadratisch</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Seite: Live-Vorschau */}
        <div className="w-1/2 p-6 bg-gray-100">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Live-Vorschau
              </h2>
              <span className="text-sm text-gray-500">
                {isMobilePreview ? 'Mobile Ansicht' : 'Desktop Ansicht'}
              </span>
            </div>
            
            {/* Browser Tab Mockup für Favicon */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Browser Vorschau (Favicon)</h3>
              
              {/* Detailgetreues Browser-Fenster */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden max-w-md">
                {/* Browser-Titelleiste */}
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-600 font-medium">Safari</span>
                  </div>
                </div>

                {/* Tab-Leiste */}
                <div className="bg-gray-50 flex">
                  {/* Aktiver Tab */}
                  <div className="bg-white border-r border-gray-200 px-3 py-2 flex items-center space-x-2 min-w-0 flex-1 max-w-[200px]">
                    {logos.favicon ? (
                      <img 
                        src={logos.favicon} 
                        alt="Favicon"
                        className="w-4 h-4 object-contain flex-shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-blue-500 rounded-sm flex-shrink-0 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">🏋️</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-900 truncate font-medium">
                      {preset.name || 'Ihr Fitnessstudio'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0 w-4 h-4 flex items-center justify-center">
                      <span className="text-xs">×</span>
                    </button>
                  </div>
                  
                  {/* Inaktiver Tab */}
                  <div className="bg-gray-100 border-r border-gray-200 px-3 py-2 flex items-center space-x-2 min-w-0 max-w-[140px]">
                    <div className="w-4 h-4 bg-gray-300 rounded-sm flex-shrink-0"></div>
                    <span className="text-xs text-gray-600 truncate">Google</span>
                    <button className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0 w-4 h-4 flex items-center justify-center">
                      <span className="text-xs">×</span>
                    </button>
                  </div>
                  
                  {/* Plus Button für neuen Tab */}
                  <button className="px-2 py-2 text-gray-400 hover:text-gray-600">
                    <span className="text-sm">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Logo-Vorschau auf verschiedenen Hintergründen */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Logo-Vorschau</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-500 mb-2">Heller Hintergrund</div>
                  <div className="h-12 flex items-center justify-center">
                    {logos.black || logos.primary ? (
                      <img 
                        src={logos.black || logos.primary} 
                        alt="Logo auf hellem Hintergrund"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">Logo Vorschau</div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-300 mb-2">Dunkler Hintergrund</div>
                  <div className="h-12 flex items-center justify-center">
                    {logos.white || logos.primary ? (
                      <img 
                        src={logos.white || logos.primary} 
                        alt="Logo auf dunklem Hintergrund"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-500 text-xs">Logo Vorschau</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {generateLivePreview()}
          </div>
        </div>
      </div>
      
      {/* Comprehensive Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">CI-Style Einstellungen</h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Style-Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style-Name *
                </label>
                <input
                  type="text"
                  value={preset.name}
                  onChange={(e) => updatePreset('name', e.target.value)}
                  placeholder="z.B. Frühjahrskampagne 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Kampagnenverknüpfung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kampagnenverknüpfung (optional)
                </label>
                <select
                  value={preset.linked_campaign_id || ''}
                  onChange={(e) => updatePreset('linked_campaign_id', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Keine Kampagne verknüpfen</option>
                  <option value="kampagne1">Frühjahrskampagne 2025</option>
                  <option value="kampagne2">Sommerkampagne 2025</option>
                  <option value="kampagne3">Herbstkampagne 2025</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Bei Verknüpfung werden Zielgruppen-Informationen automatisch übernommen
                </p>
              </div>

              {/* Kategorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie (optional)
                </label>
                <select
                  value={preset.category || ''}
                  onChange={(e) => updatePreset('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kategorie wählen...</option>
                  <option value="fitness">Fitness</option>
                  <option value="wellness">Wellness</option>
                  <option value="sport">Sport</option>
                  <option value="gesundheit">Gesundheit</option>
                  <option value="ernährung">Ernährung</option>
                </select>
              </div>

              {/* Verwendungszweck */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Verwendungszweck
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {[
                      { id: 'social_media', label: 'Social Media' },
                      { id: 'web', label: 'Web' },
                      { id: 'werbeanzeigen', label: 'Werbeanzeigen' },
                      { id: 'interne_kommunikation', label: 'Interne Kommunikation' },
                      { id: 'newsletter', label: 'Newsletter' }
                    ].map((purpose) => (
                      <label key={purpose.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preset.usage_purpose?.includes(purpose.id) || false}
                          onChange={(e) => {
                            const currentPurposes = preset.usage_purpose || []
                            if (e.target.checked) {
                              updatePreset('usage_purpose', [...currentPurposes, purpose.id])
                            } else {
                              updatePreset('usage_purpose', currentPurposes.filter(p => p !== purpose.id))
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{purpose.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'print', label: 'Print' },
                      { id: 'email_marketing', label: 'E-Mail Marketing' },
                      { id: 'events', label: 'Events' },
                      { id: 'landingpages', label: 'Landingpages' },
                      { id: 'flyer_broschüren', label: 'Flyer & Broschüren' }
                    ].map((purpose) => (
                      <label key={purpose.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preset.usage_purpose?.includes(purpose.id) || false}
                          onChange={(e) => {
                            const currentPurposes = preset.usage_purpose || []
                            if (e.target.checked) {
                              updatePreset('usage_purpose', [...currentPurposes, purpose.id])
                            } else {
                              updatePreset('usage_purpose', currentPurposes.filter(p => p !== purpose.id))
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{purpose.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Zielgruppendefinition */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Zielgruppendefinition (optional)
                </h3>
                
                {/* Beschreibung */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={preset.target_audience?.description || ''}
                    onChange={(e) => updatePreset('target_audience', { 
                      ...preset.target_audience, 
                      description: e.target.value 
                    })}
                    placeholder="Kurze Beschreibung der Zielgruppe..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Alter */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alter von
                    </label>
                    <input
                      type="number"
                      value={preset.target_audience?.age_from || ''}
                      onChange={(e) => updatePreset('target_audience', { 
                        ...preset.target_audience, 
                        age_from: e.target.value 
                      })}
                      placeholder="z.B. 18"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alter bis
                    </label>
                    <input
                      type="number"
                      value={preset.target_audience?.age_to || ''}
                      onChange={(e) => updatePreset('target_audience', { 
                        ...preset.target_audience, 
                        age_to: e.target.value 
                      })}
                      placeholder="z.B. 35"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Interessen */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interessen
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {[
                        { id: 'krafttraining', label: 'Krafttraining' },
                        { id: 'yoga', label: 'Yoga' },
                        { id: 'functional_training', label: 'Functional Training' },
                        { id: 'ernährung', label: 'Ernährung' },
                        { id: 'gruppenkurse', label: 'Gruppenkurse' }
                      ].map((interest) => (
                        <label key={interest.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={preset.target_audience?.interests?.includes(interest.id) || false}
                            onChange={(e) => {
                              const currentInterests = preset.target_audience?.interests || []
                              const newInterests = e.target.checked 
                                ? [...currentInterests, interest.id]
                                : currentInterests.filter(i => i !== interest.id)
                              updatePreset('target_audience', { 
                                ...preset.target_audience, 
                                interests: newInterests 
                              })
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{interest.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'cardio', label: 'Cardio' },
                        { id: 'pilates', label: 'Pilates' },
                        { id: 'wellness', label: 'Wellness' },
                        { id: 'rehabilitation', label: 'Rehabilitation' },
                        { id: 'personal_training', label: 'Personal Training' }
                      ].map((interest) => (
                        <label key={interest.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={preset.target_audience?.interests?.includes(interest.id) || false}
                            onChange={(e) => {
                              const currentInterests = preset.target_audience?.interests || []
                              const newInterests = e.target.checked 
                                ? [...currentInterests, interest.id]
                                : currentInterests.filter(i => i !== interest.id)
                              updatePreset('target_audience', { 
                                ...preset.target_audience, 
                                interests: newInterests 
                              })
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{interest.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sportliche Ziele */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sportliche Ziele
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {[
                        { id: 'gewichtsverlust', label: 'Gewichtsverlust' },
                        { id: 'muskelaufbau', label: 'Muskelaufbau' },
                        { id: 'ausdauer', label: 'Ausdauer' },
                        { id: 'beweglichkeit', label: 'Beweglichkeit' }
                      ].map((goal) => (
                        <label key={goal.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={preset.target_audience?.goals?.includes(goal.id) || false}
                            onChange={(e) => {
                              const currentGoals = preset.target_audience?.goals || []
                              const newGoals = e.target.checked 
                                ? [...currentGoals, goal.id]
                                : currentGoals.filter(g => g !== goal.id)
                              updatePreset('target_audience', { 
                                ...preset.target_audience, 
                                goals: newGoals 
                              })
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{goal.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: 'entspannung', label: 'Entspannung' },
                        { id: 'rehabilitation', label: 'Rehabilitation' },
                        { id: 'kraftsteigerung', label: 'Kraftsteigerung' },
                        { id: 'körperformung', label: 'Körperformung' }
                      ].map((goal) => (
                        <label key={goal.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={preset.target_audience?.goals?.includes(goal.id) || false}
                            onChange={(e) => {
                              const currentGoals = preset.target_audience?.goals || []
                              const newGoals = e.target.checked 
                                ? [...currentGoals, goal.id]
                                : currentGoals.filter(g => g !== goal.id)
                              updatePreset('target_audience', { 
                                ...preset.target_audience, 
                                goals: newGoals 
                              })
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{goal.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Einstellungen übernehmen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 