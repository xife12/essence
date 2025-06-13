'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { BlockType } from '../../../../../lib/api/landingpages'
import { CITemplate } from '../../../../../lib/api/ci-templates'

// ========================================================================
// BLOCK PRESETS CONFIGURATION
// ========================================================================

export const BLOCK_PRESETS = {
  header: [
    { value: 'hero-centered', label: 'Hero Zentriert', description: 'Klassischer zentrierter Hero-Bereich' },
    { value: 'hero-split', label: 'Hero Split', description: 'Zweispaltig mit Bild und Text' },
    { value: 'image-overlay', label: 'Bild-Overlay', description: 'Text über Hintergrundbild' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziert und modern' },
    { value: 'clean-color', label: 'Farbig', description: 'Mit Farb-Hintergrund' },
    { value: 'gradient', label: 'Gradient', description: 'Mit Verlauf-Hintergrund' },
    { value: 'video-bg', label: 'Video-Hintergrund', description: 'Mit Video im Hintergrund' }
  ],
  text: [
    { value: 'classic-paragraph', label: 'Klassisch', description: 'Standard-Textblock' },
    { value: 'two-column', label: 'Zwei-Spaltig', description: 'Text in zwei Spalten' },
    { value: 'callout-quote', label: 'Zitat-Hervorhebung', description: 'Als großes Zitat formatiert' },
    { value: 'info-card', label: 'Info-Karte', description: 'Text in Karten-Design' },
    { value: 'text-icon', label: 'Text mit Icon', description: 'Icon neben dem Text' },
    { value: 'accordion', label: 'Accordion', description: 'Aufklappbare Textbereiche' }
  ],
  image: [
    { value: 'lightbox-grid', label: 'Lightbox-Grid', description: 'Klickbare Bildergalerie' },
    { value: 'scroll-carousel', label: 'Karussell', description: 'Horizontal scrollbare Bilder' },
    { value: 'wide-banner', label: 'Banner', description: 'Breites Bannerbild' },
    { value: 'hover-zoom', label: 'Hover-Zoom', description: 'Zoom-Effekt bei Hover' },
    { value: 'split-image-text', label: 'Bild-Text-Split', description: 'Bild und Text nebeneinander' },
    { value: 'masonry', label: 'Masonry', description: 'Pinterest-ähnliches Layout' },
    { value: 'before-after', label: 'Vorher-Nachher', description: 'Vergleichsbilder' }
  ],
  video: [
    { value: 'clean-video', label: 'Sauber', description: 'Minimales Video-Design' },
    { value: 'framed', label: 'Gerahmt', description: 'Video mit dekorativem Rahmen' },
    { value: 'side-by-side', label: 'Nebeneinander', description: 'Video und Text parallel' },
    { value: 'overlay-start', label: 'Play-Overlay', description: 'Großer Play-Button' },
    { value: 'youtube-card', label: 'YouTube-Stil', description: 'YouTube-ähnliches Design' },
    { value: 'fullscreen', label: 'Vollbild', description: 'Video im Vollbild-Modus' }
  ],
  button: [
    { value: 'flat', label: 'Flach', description: 'Modernes flaches Design' },
    { value: 'rounded', label: 'Abgerundet', description: 'Runde Ecken' },
    { value: 'ghost', label: 'Ghost', description: 'Transparenter Hintergrund' },
    { value: 'shadowed', label: 'Schatten', description: 'Mit Schlagschatten' },
    { value: 'gradient', label: 'Gradient', description: 'Verlauf-Hintergrund' },
    { value: 'icon-text', label: 'Icon + Text', description: 'Button mit Icon' },
    { value: 'floating', label: 'Schwebend', description: 'Floating Action Button' }
  ],
  form: [
    { value: 'inline', label: 'Inline', description: 'Horizontales Layout' },
    { value: 'stacked', label: 'Gestapelt', description: 'Vertikales Layout' },
    { value: 'card', label: 'Karte', description: 'In Karten-Container' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'floating-labels', label: 'Floating Labels', description: 'Animierte Labels' },
    { value: 'multi-step', label: 'Mehrstufig', description: 'Wizard-Formular' },
    { value: 'newsletter', label: 'Newsletter', description: 'E-Mail-Anmeldung' }
  ],
  pricing: [
    { value: 'cards', label: 'Karten', description: 'Preiskarten nebeneinander' },
    { value: 'table', label: 'Tabelle', description: 'Vergleichstabelle' },
    { value: 'toggle', label: 'Toggle', description: 'Monatlich/Jährlich umschaltbar' },
    { value: 'highlighted', label: 'Hervorgehoben', description: 'Ein Plan hervorgehoben' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'feature-rich', label: 'Feature-Reich', description: 'Mit vielen Details' }
  ],
  testimonial: [
    { value: 'classic', label: 'Klassisch', description: 'Text links, Testimonials rechts' },
    { value: 'grid', label: 'Grid', description: '2-3 Spalten Raster' },
    { value: 'carousel', label: 'Karussell', description: 'Durchblätterbare Testimonials' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'cards', label: 'Karten', description: 'Testimonials als Karten' },
    { value: 'centered', label: 'Zentriert', description: 'Ein großes zentriertes Testimonial' },
    { value: 'compact', label: 'Kompakt', description: 'Viele kleine Testimonials' }
  ],
  // Erweiterte Block-Typen
  feature: [
    { value: 'icon-grid', label: 'Icon-Grid', description: 'Features mit Icons im Raster' },
    { value: 'alternating', label: 'Abwechselnd', description: 'Links-rechts-Layout' },
    { value: 'centered', label: 'Zentriert', description: 'Mittig ausgerichtet' },
    { value: 'cards', label: 'Karten', description: 'Feature-Karten' },
    { value: 'timeline', label: 'Timeline', description: 'Chronologische Darstellung' },
    { value: 'comparison', label: 'Vergleich', description: 'Vor-/Nachteile-Vergleich' }
  ],
  statistics: [
    { value: 'counter', label: 'Zähler', description: 'Animierte Zahlen' },
    { value: 'progress-bars', label: 'Fortschrittsbalken', description: 'Prozent-Balken' },
    { value: 'circular', label: 'Kreisdiagramme', description: 'Runde Progress-Kreise' },
    { value: 'minimal', label: 'Minimal', description: 'Einfache Zahlen' },
    { value: 'chart', label: 'Diagramm', description: 'Balkendiagramme' },
    { value: 'icon-stats', label: 'Icon-Statistiken', description: 'Stats mit Icons' }
  ],
  faq: [
    { value: 'accordion', label: 'Accordion', description: 'Aufklappbare Fragen' },
    { value: 'two-column', label: 'Zwei-Spaltig', description: 'FAQ in zwei Spalten' },
    { value: 'search', label: 'Suchbar', description: 'Mit Suchfunktion' },
    { value: 'categorized', label: 'Kategorisiert', description: 'Nach Themen sortiert' },
    { value: 'floating', label: 'Floating', description: 'Schwebende Panels' },
    { value: 'minimal', label: 'Minimal', description: 'Einfaches Design' }
  ],
  team: [
    { value: 'grid', label: 'Grid', description: 'Mitarbeiter im Raster' },
    { value: 'carousel', label: 'Karussell', description: 'Durchblätterbar' },
    { value: 'detailed', label: 'Detailliert', description: 'Mit Lebenslauf-Details' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Foto und Name' },
    { value: 'social', label: 'Social', description: 'Mit Social-Media-Links' },
    { value: 'org-chart', label: 'Organigramm', description: 'Hierarchische Darstellung' }
  ],
  contact: [
    { value: 'info-form', label: 'Info + Formular', description: 'Kontaktdaten und Formular' },
    { value: 'map-integrated', label: 'Mit Karte', description: 'Google Maps Integration' },
    { value: 'social-focused', label: 'Social-Fokus', description: 'Social Media im Vordergrund' },
    { value: 'minimal', label: 'Minimal', description: 'Nur wichtigste Infos' },
    { value: 'detailed', label: 'Detailliert', description: 'Alle Kontaktmöglichkeiten' },
    { value: 'modern', label: 'Modern', description: 'Zeitgemäßes Design' }
  ]
}

// ========================================================================
// WIZARD DATA INTERFACES
// ========================================================================

interface BaseWizardData {
  preset: string
  headline?: string
  text?: string
  buttonText?: string
  buttonUrl?: string
  backgroundColor?: string
  textColor?: string
  alignment?: 'left' | 'center' | 'right'
}

interface HeaderWizardData extends BaseWizardData {
  subheadline?: string
  backgroundImage?: string
  overlayOpacity?: number
  videoUrl?: string
  ctaStyle?: string
}

interface TextWizardData extends BaseWizardData {
  content?: string
  fontSize?: 'small' | 'medium' | 'large'
  lineHeight?: 'tight' | 'normal' | 'relaxed'
  maxWidth?: string
}

interface ImageWizardData extends BaseWizardData {
  images?: string[]
  caption?: string
  alt?: string
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto'
  objectFit?: 'cover' | 'contain' | 'fill'
}

interface PricingWizardData extends BaseWizardData {
  plans?: Array<{
    name: string
    price: string
    period: string
    features: string[]
    highlighted?: boolean
  }>
  currency?: string
  billingToggle?: boolean
}

type WizardData = BaseWizardData & HeaderWizardData & TextWizardData & ImageWizardData & PricingWizardData

// ========================================================================
// PRESET PREVIEW COMPONENTS
// ========================================================================

function HeaderPresetPreview({ preset, config, ciTemplate }: { preset: string, config: WizardData, ciTemplate?: CITemplate | null }) {
  const primary = ciTemplate?.primary_color || '#2563eb'
  const accent = ciTemplate?.accent_color || '#a21caf'
  
  const previewStyles = {
    'hero-centered': (
      <div className="text-center py-16 px-8" style={{ backgroundColor: primary }}>
        <h1 className="text-3xl font-bold text-white mb-4">{config.headline || 'Überschrift'}</h1>
        <p className="text-lg text-white/90 mb-8">{config.subheadline || 'Unterzeile'}</p>
        <button className="px-6 py-3 rounded-lg text-white" style={{ backgroundColor: accent }}>
          {config.buttonText || 'Jetzt starten'}
        </button>
      </div>
    ),
    'hero-split': (
      <div className="grid grid-cols-2 gap-8 items-center py-12 px-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">{config.headline || 'Überschrift'}</h1>
          <p className="text-gray-600 mb-6">{config.subheadline || 'Beschreibung'}</p>
          <button className="px-6 py-3 rounded-lg text-white" style={{ backgroundColor: primary }}>
            {config.buttonText || 'Mehr erfahren'}
          </button>
        </div>
        <div className="bg-gray-200 h-32 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">🖼️ Bild</span>
        </div>
      </div>
    ),
    'image-overlay': (
      <div className="relative py-20 px-8 bg-gradient-to-r from-gray-900/80 to-gray-900/40">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">{config.headline || 'Überschrift'}</h1>
          <p className="text-lg mb-8">{config.subheadline || 'Unterzeile'}</p>
          <button className="px-6 py-3 rounded-lg" style={{ backgroundColor: accent }}>
            {config.buttonText || 'Call-to-Action'}
          </button>
        </div>
      </div>
    )
  }
  
  return previewStyles[preset] || previewStyles['hero-centered']
}

function TextPresetPreview({ preset, config }: { preset: string, config: WizardData }) {
  const previewStyles = {
    'classic-paragraph': (
      <div className="py-8 px-8">
        <h3 className="text-xl font-semibold mb-4">{config.headline || 'Textüberschrift'}</h3>
        <p className="text-gray-700 leading-relaxed">
          {config.content || 'Dies ist ein Beispieltext. Hier können Sie Ihren Content hinzufügen...'}
        </p>
      </div>
    ),
    'two-column': (
      <div className="py-8 px-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">{config.headline || 'Spalte 1'}</h3>
          <p className="text-gray-700">Linke Spalte mit Inhalt...</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Spalte 2</h3>
          <p className="text-gray-700">Rechte Spalte mit Inhalt...</p>
        </div>
      </div>
    ),
    'callout-quote': (
      <div className="py-8 px-8 text-center">
        <blockquote className="text-2xl font-light italic text-gray-800 border-l-4 border-blue-500 pl-6">
          "{config.content || 'Ein inspirierendes Zitat oder wichtige Botschaft...'}"
        </blockquote>
      </div>
    )
  }
  
  return previewStyles[preset] || previewStyles['classic-paragraph']
}

function ButtonPresetPreview({ preset, config, ciTemplate }: { preset: string, config: WizardData, ciTemplate?: CITemplate | null }) {
  const primary = ciTemplate?.primary_color || '#2563eb'
  
  const previewStyles = {
    'flat': (
      <button className="px-6 py-3 text-white font-semibold" style={{ backgroundColor: primary }}>
        {config.buttonText || 'Button Text'}
      </button>
    ),
    'rounded': (
      <button className="px-6 py-3 text-white font-semibold rounded-full" style={{ backgroundColor: primary }}>
        {config.buttonText || 'Button Text'}
      </button>
    ),
    'ghost': (
      <button className="px-6 py-3 border-2 font-semibold" style={{ borderColor: primary, color: primary }}>
        {config.buttonText || 'Button Text'}
      </button>
    ),
    'shadowed': (
      <button className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg" style={{ backgroundColor: primary }}>
        {config.buttonText || 'Button Text'}
      </button>
    )
  }
  
  return <div className="py-8 text-center">{previewStyles[preset] || previewStyles['flat']}</div>
}

function PricingPresetPreview({ preset, config }: { preset: string, config: WizardData }) {
  const mockPlans = config.plans || [
    { name: 'Basic', price: '29', period: 'Monat', features: ['Feature 1', 'Feature 2'], highlighted: false },
    { name: 'Premium', price: '59', period: 'Monat', features: ['Feature 1', 'Feature 2', 'Feature 3'], highlighted: true },
    { name: 'Pro', price: '99', period: 'Monat', features: ['Alle Features'], highlighted: false }
  ]
  
  const previewStyles = {
    'cards': (
      <div className="grid grid-cols-3 gap-4 py-8 px-4">
        {mockPlans.map((plan, i) => (
          <div key={i} className={`bg-white p-6 rounded-lg border ${plan.highlighted ? 'ring-2 ring-blue-500' : ''}`}>
            <h4 className="font-bold text-lg">{plan.name}</h4>
            <div className="text-2xl font-bold my-4">{plan.price}€<span className="text-sm">/{plan.period}</span></div>
            <ul className="space-y-2">
              {plan.features.map((feature, j) => (
                <li key={j} className="text-sm">✓ {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
    'table': (
      <div className="py-8 px-4">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left">Plan</th>
              <th className="p-3">Basic</th>
              <th className="p-3">Premium</th>
              <th className="p-3">Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 font-semibold">Preis</td>
              <td className="p-3 text-center">29€</td>
              <td className="p-3 text-center">59€</td>
              <td className="p-3 text-center">99€</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  
  return previewStyles[preset] || previewStyles['cards']
}

// ========================================================================
// UNIVERSAL WIZARD COMPONENT
// ========================================================================

interface UniversalBlockWizardProps {
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  blockType: BlockType
  initialData?: any
  ciTemplate?: CITemplate | null
}

export default function UniversalBlockWizard({
  open,
  onClose,
  onSave,
  blockType,
  initialData = {},
  ciTemplate
}: UniversalBlockWizardProps) {
  const [step, setStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({
    preset: '',
    headline: '',
    text: '',
    buttonText: '',
    buttonUrl: '',
    ...initialData
  })

  const presets = BLOCK_PRESETS[blockType] || []
  const totalSteps = 3

  useEffect(() => {
    if (open && presets.length > 0 && !wizardData.preset) {
      setWizardData(prev => ({ ...prev, preset: presets[0].value }))
    }
  }, [open, presets, wizardData.preset])

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSave = () => {
    onSave(wizardData)
    onClose()
    setStep(1)
  }

  const renderPresetPreview = () => {
    switch (blockType) {
      case 'header':
        return <HeaderPresetPreview preset={wizardData.preset} config={wizardData} ciTemplate={ciTemplate} />
      case 'text':
        return <TextPresetPreview preset={wizardData.preset} config={wizardData} />
      case 'button':
        return <ButtonPresetPreview preset={wizardData.preset} config={wizardData} ciTemplate={ciTemplate} />
      case 'pricing':
        return <PricingPresetPreview preset={wizardData.preset} config={wizardData} />
      default:
        return (
          <div className="py-8 px-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {blockType.charAt(0).toUpperCase() + blockType.slice(1)}-Block
            </h3>
            <p className="text-gray-600">Preset: {wizardData.preset}</p>
          </div>
        )
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {blockType.charAt(0).toUpperCase() + blockType.slice(1)}-Block konfigurieren
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Schritt {step} von {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Step 1: Preset Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Preset auswählen</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setWizardData(prev => ({ ...prev, preset: preset.value }))}
                    className={`p-4 text-left border rounded-lg transition-all ${
                      wizardData.preset === preset.value
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-semibold mb-1">{preset.label}</h4>
                    <p className="text-sm text-gray-600">{preset.description}</p>
                  </button>
                ))}
              </div>
              
              {/* Live Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Vorschau</h4>
                <div className="bg-white rounded border">
                  {renderPresetPreview()}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Inhalt anpassen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Überschrift
                  </label>
                  <input
                    type="text"
                    value={wizardData.headline || ''}
                    onChange={(e) => setWizardData(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Geben Sie eine Überschrift ein..."
                  />
                </div>
                
                {blockType === 'header' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unterzeile
                    </label>
                    <input
                      type="text"
                      value={wizardData.subheadline || ''}
                      onChange={(e) => setWizardData(prev => ({ ...prev, subheadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Unterzeile eingeben..."
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button-Text
                  </label>
                  <input
                    type="text"
                    value={wizardData.buttonText || ''}
                    onChange={(e) => setWizardData(prev => ({ ...prev, buttonText: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. Jetzt starten"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button-URL
                  </label>
                  <input
                    type="url"
                    value={wizardData.buttonUrl || ''}
                    onChange={(e) => setWizardData(prev => ({ ...prev, buttonUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              {(blockType === 'text' || blockType === 'feature') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text-Inhalt
                  </label>
                  <textarea
                    value={wizardData.content || ''}
                    onChange={(e) => setWizardData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ihren Text hier eingeben..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Style Configuration */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Styling anpassen</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ausrichtung
                  </label>
                  <select
                    value={wizardData.alignment || 'center'}
                    onChange={(e) => setWizardData(prev => ({ ...prev, alignment: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">Links</option>
                    <option value="center">Zentriert</option>
                    <option value="right">Rechts</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hintergrundfarbe
                  </label>
                  <input
                    type="color"
                    value={wizardData.backgroundColor || ciTemplate?.background_color || '#ffffff'}
                    onChange={(e) => setWizardData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              {/* Live Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Finale Vorschau</h4>
                <div className="bg-white rounded border">
                  {renderPresetPreview()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Zurück
          </button>
          
          <div className="flex gap-3">
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Weiter
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check size={16} />
                Block erstellen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 