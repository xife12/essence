'use client'

import React, { useState } from 'react'
import { Settings, Palette, Type, Image, Layout, Eye, Grid3X3, Columns, Square, Rows, Layers } from 'lucide-react'
import { LandingPage, LandingPageBlock, LayoutType, PresetType } from '../../../../../lib/api/landingpages'

interface ConfigPanelProps {
  landingpage: LandingPage
  selectedBlock: LandingPageBlock | null
  onUpdateBlock: (blockId: string, updates: Partial<LandingPageBlock>) => void
  onUpdateLandingpage: (updates: Partial<LandingPage>) => void
}

// ============================================================================
// Preset Definitions for each Block Type
// ============================================================================

const BLOCK_PRESETS = {
  header: [
    { value: 'hero-centered', label: 'Hero Zentriert', description: 'Große Überschrift in der Mitte' },
    { value: 'hero-split', label: 'Hero Split', description: 'Text links, Bild rechts' },
    { value: 'image-overlay', label: 'Bild Overlay', description: 'Text über Hintergrundbild' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'clean-color', label: 'Farbig', description: 'Mit Hintergrundfarbe' }
  ],
  text: [
    { value: 'default', label: 'Standard', description: 'Normaler Fließtext' },
    { value: 'classic-paragraph', label: 'Klassisch', description: 'Traditionelles Layout' },
    { value: 'two-column-info', label: 'Zwei Spalten', description: 'Text in zwei Spalten' },
    { value: 'callout-quote', label: 'Zitat', description: 'Hervorgehobenes Zitat' },
    { value: 'info-card', label: 'Info-Card', description: 'Text in einer Karte' }
  ],
  image: [
    { value: 'default', label: 'Standard', description: 'Einfaches Bild' },
    { value: 'lightbox-grid', label: 'Galerie', description: 'Bild-Galerie mit Lightbox' },
    { value: 'scroll-carousel', label: 'Karussell', description: 'Horizontales Scrollen' },
    { value: 'wide-banner', label: 'Banner', description: 'Vollbreites Banner-Bild' },
    { value: 'hover-zoom', label: 'Hover Zoom', description: 'Zoom-Effekt bei Hover' },
    { value: 'split-image-text', label: 'Split Layout', description: 'Bild und Text nebeneinander' }
  ],
  video: [
    { value: 'default', label: 'Standard', description: 'Einfaches Video' },
    { value: 'clean-video', label: 'Clean', description: 'Minimalistisches Design' },
    { value: 'framed', label: 'Gerahmt', description: 'Video mit Rahmen' },
    { value: 'side-by-side', label: 'Nebeneinander', description: 'Video und Text' },
    { value: 'overlay-start', label: 'Overlay Start', description: 'Mit Play-Button Overlay' },
    { value: 'youtube-card', label: 'YouTube Card', description: 'YouTube-ähnliches Design' }
  ],
  button: [
    { value: 'default', label: 'Standard', description: 'Normaler Button' },
    { value: 'flat', label: 'Flach', description: 'Ohne Schatten' },
    { value: 'rounded', label: 'Rund', description: 'Abgerundete Ecken' },
    { value: 'ghost', label: 'Ghost', description: 'Nur Umrandung' },
    { value: 'shadowed', label: 'Schatten', description: 'Mit Schatten-Effekt' },
    { value: 'icon-text', label: 'Mit Icon', description: 'Button mit Icon' }
  ],
  form: [
    { value: 'default', label: 'Standard', description: 'Klassisches Formular' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'clean-color', label: 'Farbig', description: 'Mit Hintergrundfarbe' },
    { value: 'inline', label: 'Inline', description: 'Horizontales Layout' }
  ],
  icon: [
    { value: 'default', label: 'Standard', description: 'Icons in einer Reihe' },
    { value: 'grid', label: 'Grid', description: 'Icons im Raster' },
    { value: 'circular', label: 'Rund', description: 'Runde Icon-Container' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Icons ohne Container' }
  ],
  testimonial: [
    { value: 'default', label: 'Standard', description: 'Klassische Testimonials' },
    { value: 'cards', label: 'Karten', description: 'Als Karten-Layout' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Testimonials' },
    { value: 'centered', label: 'Zentriert', description: 'Ein Testimonial zentriert' }
  ],
  pricing: [
    { value: 'default', label: 'Standard', description: 'Klassische Preistabelle' },
    { value: 'cards', label: 'Karten', description: 'Als separate Karten' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'highlight', label: 'Highlight', description: 'Mit hervorgehobenem Plan' }
  ],
  feature: [
    { value: 'default', label: 'Standard', description: 'Features in einer Liste' },
    { value: 'grid', label: 'Grid', description: 'Features im Raster' },
    { value: 'alternating', label: 'Abwechselnd', description: 'Links-rechts-Layout' },
    { value: 'centered', label: 'Zentriert', description: 'Alle Features zentriert' }
  ],
  countdown: [
    { value: 'default', label: 'Standard', description: 'Klassischer Countdown' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'bold', label: 'Fett', description: 'Große, fette Zahlen' },
    { value: 'circular', label: 'Rund', description: 'Runde Countdown-Boxen' }
  ],
  service: [
    { value: 'default', label: 'Standard', description: 'Services als Liste' },
    { value: 'cards', label: 'Karten', description: 'Services als Karten' },
    { value: 'table', label: 'Tabelle', description: 'Als Tabellen-Layout' },
    { value: 'grid', label: 'Grid', description: 'Services im Raster' }
  ],
  faq: [
    { value: 'default', label: 'Standard', description: 'Klassisches Accordion' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'cards', label: 'Karten', description: 'FAQ als Karten' },
    { value: 'two-column', label: 'Zwei Spalten', description: 'FAQ in zwei Spalten' }
  ],
  contact: [
    { value: 'default', label: 'Standard', description: 'Klassische Kontakt-Info' },
    { value: 'cards', label: 'Karten', description: 'Info als Karten' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'centered', label: 'Zentriert', description: 'Alle Infos zentriert' }
  ],
  team: [
    { value: 'default', label: 'Standard', description: 'Team-Mitglieder als Karten' },
    { value: 'grid', label: 'Grid', description: 'Team im Raster' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Team-Liste' }
  ],
  statistics: [
    { value: 'default', label: 'Standard', description: 'Statistiken in einer Reihe' },
    { value: 'cards', label: 'Karten', description: 'Stats als Karten' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Zahlen und Labels' },
    { value: 'circular', label: 'Rund', description: 'Runde Statistik-Container' }
  ],
  trust_logos: [
    { value: 'default', label: 'Standard', description: 'Logos in einer Reihe' },
    { value: 'grid', label: 'Grid', description: 'Logos im Raster' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Logo-Liste' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Logos ohne Container' }
  ],
  gallery: [
    { value: 'default', label: 'Standard', description: 'Klassische Galerie' },
    { value: 'masonry', label: 'Masonry', description: 'Pinterest-Style Layout' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Galerie' },
    { value: 'lightbox', label: 'Lightbox', description: 'Mit Lightbox-Effekt' }
  ],
  blog_preview: [
    { value: 'default', label: 'Standard', description: 'Blog-Artikel als Karten' },
    { value: 'list', label: 'Liste', description: 'Als einfache Liste' },
    { value: 'grid', label: 'Grid', description: 'Artikel im Raster' },
    { value: 'featured', label: 'Featured', description: 'Mit hervorgehobenem Artikel' }
  ],
  courseplan: [
    { value: 'default', label: 'Standard', description: 'Klassischer Kursplan' },
    { value: 'calendar', label: 'Kalender', description: 'Als Kalender-Layout' },
    { value: 'timeline', label: 'Timeline', description: 'Als Timeline-Layout' },
    { value: 'cards', label: 'Karten', description: 'Kurse als Karten' }
  ],
  gamification: [
    { value: 'default', label: 'Standard', description: 'Klassisches Glücksrad' },
    { value: 'modern', label: 'Modern', description: 'Modernes Design' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'colorful', label: 'Bunt', description: 'Bunte Farbgebung' }
  ],
  cta: [
    { value: 'default', label: 'Standard', description: 'Klassischer Call-to-Action' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'bold', label: 'Fett', description: 'Großer, fetter CTA' },
    { value: 'centered', label: 'Zentriert', description: 'Zentrierter CTA' }
  ],
  hero: [
    { value: 'default', label: 'Standard', description: 'Klassischer Hero-Bereich' },
    { value: 'split', label: 'Split', description: 'Text und Bild nebeneinander' },
    { value: 'overlay', label: 'Overlay', description: 'Text über Hintergrundbild' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' }
  ]
}

const LAYOUT_OPTIONS = {
  header: [
    { value: '1-col', label: 'Eine Spalte', icon: Square },
    { value: 'split', label: 'Split Layout', icon: Columns },
    { value: 'fullwidth', label: 'Vollbreit', icon: Rows }
  ],
  text: [
    { value: '1-col', label: 'Eine Spalte', icon: Square },
    { value: '2-col', label: 'Zwei Spalten', icon: Columns },
    { value: 'fullwidth', label: 'Vollbreit', icon: Rows }
  ],
  image: [
    { value: '1-col', label: 'Eine Spalte', icon: Square },
    { value: '2-col', label: 'Zwei Spalten', icon: Columns },
    { value: '3-col', label: 'Drei Spalten', icon: Grid3X3 },
    { value: 'grid', label: 'Grid Layout', icon: Layers },
    { value: 'fullwidth', label: 'Vollbreit', icon: Rows }
  ],
  default: [
    { value: '1-col', label: 'Eine Spalte', icon: Square },
    { value: '2-col', label: 'Zwei Spalten', icon: Columns },
    { value: 'fullwidth', label: 'Vollbreit', icon: Rows }
  ]
}

export default function ConfigPanel({
  landingpage,
  selectedBlock,
  onUpdateBlock,
  onUpdateLandingpage
}: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'style' | 'page'>('content')

  const updateBlockContent = (key: string, value: any) => {
    if (!selectedBlock) return
    
    const newContent = {
      ...selectedBlock.content_json,
      [key]: value
    }
    
    onUpdateBlock(selectedBlock.id, { content_json: newContent })
  }

  const updateBlockLayout = (layout: LayoutType) => {
    if (!selectedBlock) return
    onUpdateBlock(selectedBlock.id, { layout })
  }

  const updateBlockPreset = (preset: PresetType) => {
    if (!selectedBlock) return
    onUpdateBlock(selectedBlock.id, { preset })
  }

  // ========================================================================
  // Style Configuration
  // ========================================================================

  const renderStyleConfig = () => {
    if (!selectedBlock) return null

    return (
      <div className="space-y-6">
        {/* Typography */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Typografie
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Schriftfamilie</label>
              <select
                value={selectedBlock.content_json.font_family || 'inherit'}
                onChange={(e) => updateBlockContent('font_family', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="inherit">Standard</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Schriftgewicht</label>
              <select
                value={selectedBlock.content_json.font_weight || 'normal'}
                onChange={(e) => updateBlockContent('font_weight', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="300">Light</option>
                <option value="normal">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Textfarbe</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBlock.content_json.text_color || '#000000'}
                  onChange={(e) => updateBlockContent('text_color', e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.content_json.text_color || '#000000'}
                  onChange={(e) => updateBlockContent('text_color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Borders & Shadows */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rahmen & Schatten
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Rahmenbreite (px)</label>
              <input
                type="number"
                value={selectedBlock.content_json.border_width || 0}
                onChange={(e) => updateBlockContent('border_width', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="20"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Rahmenfarbe</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBlock.content_json.border_color || '#e5e7eb'}
                  onChange={(e) => updateBlockContent('border_color', e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.content_json.border_color || '#e5e7eb'}
                  onChange={(e) => updateBlockContent('border_color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="#e5e7eb"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Eckenradius (px)</label>
              <input
                type="number"
                value={selectedBlock.content_json.border_radius || 0}
                onChange={(e) => updateBlockContent('border_radius', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="50"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="box_shadow"
                checked={selectedBlock.content_json.box_shadow || false}
                onChange={(e) => updateBlockContent('box_shadow', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="box_shadow" className="text-sm text-gray-700">
                Schatten hinzufügen
              </label>
            </div>
          </div>
        </div>

        {/* Animation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Animation
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Eingangsanimation</label>
              <select
                value={selectedBlock.content_json.animation || 'none'}
                onChange={(e) => updateBlockContent('animation', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="none">Keine</option>
                <option value="fade-in">Einblenden</option>
                <option value="slide-up">Von unten einblenden</option>
                <option value="slide-down">Von oben einblenden</option>
                <option value="slide-left">Von links einblenden</option>
                <option value="slide-right">Von rechts einblenden</option>
                <option value="zoom-in">Hineinzoomen</option>
                <option value="bounce">Hüpfend</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Animationsdauer (ms)</label>
              <input
                type="number"
                value={selectedBlock.content_json.animation_duration || 500}
                onChange={(e) => updateBlockContent('animation_duration', parseInt(e.target.value) || 500)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="100"
                max="3000"
                step="100"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Verzögerung (ms)</label>
              <input
                type="number"
                value={selectedBlock.content_json.animation_delay || 0}
                onChange={(e) => updateBlockContent('animation_delay', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="5000"
                step="100"
              />
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Benutzerdefiniertes CSS
          </label>
          <textarea
            value={selectedBlock.content_json.custom_css || ''}
            onChange={(e) => updateBlockContent('custom_css', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={6}
            placeholder="/* Benutzerdefiniertes CSS */
.block-custom {
  /* Ihre Styles hier */
}"
          />
          <p className="text-xs text-gray-500 mt-1">
            Erweiterte CSS-Anpassungen für diesen Block
          </p>
        </div>
      </div>
    )
  }

  // ========================================================================
  // Layout & Style Configuration (updated)
  // ========================================================================

  const renderLayoutConfig = () => {
    if (!selectedBlock) return null

    const blockType = selectedBlock.block_type
    const layouts = LAYOUT_OPTIONS[blockType] || LAYOUT_OPTIONS.default
    const presets = BLOCK_PRESETS[blockType] || []

    return (
      <div className="space-y-6">
        {/* Layout Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Layout
          </label>
          <div className="grid grid-cols-1 gap-2">
            {layouts.map((layout) => {
              const IconComponent = layout.icon
              return (
                <button
                  key={layout.value}
                  onClick={() => updateBlockLayout(layout.value as LayoutType)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    selectedBlock.layout === layout.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{layout.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preset Selection */}
        {presets.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stil-Vorlage
            </label>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateBlockPreset(preset.value as PresetType)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedBlock.preset === preset.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{preset.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spacing & Margins */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Abstände
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Oben (px)</label>
              <input
                type="number"
                value={selectedBlock.content_json.margin_top || 0}
                onChange={(e) => updateBlockContent('margin_top', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Unten (px)</label>
              <input
                type="number"
                value={selectedBlock.content_json.margin_bottom || 0}
                onChange={(e) => updateBlockContent('margin_bottom', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Links (px)</label>
              <input
                type="number"
                value={selectedBlock.content_json.padding_left || 0}
                onChange={(e) => updateBlockContent('padding_left', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="200"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Rechts (px)</label>
              <input
                type="number"
                value={selectedBlock.content_json.padding_right || 0}
                onChange={(e) => updateBlockContent('padding_right', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min="0"
                max="200"
              />
            </div>
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Hintergrund
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hintergrundfarbe</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedBlock.content_json.background_color || '#ffffff'}
                  onChange={(e) => updateBlockContent('background_color', e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedBlock.content_json.background_color || '#ffffff'}
                  onChange={(e) => updateBlockContent('background_color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="transparent_bg"
                checked={selectedBlock.content_json.transparent_background || false}
                onChange={(e) => updateBlockContent('transparent_background', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="transparent_bg" className="text-sm text-gray-700">
                Transparenter Hintergrund
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========================================================================
  // Content Configuration for each Block Type
  // ========================================================================

  const renderContentConfig = () => {
    if (!selectedBlock) {
      return (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kein Block ausgewählt
          </h3>
          <p className="text-gray-600">
            Wählen Sie einen Block aus, um dessen Eigenschaften zu bearbeiten.
          </p>
        </div>
      )
    }

    const content = selectedBlock.content_json

    switch (selectedBlock.block_type) {
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Überschrift
              </label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlockContent('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ihre Überschrift hier..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unterüberschrift
              </label>
              <textarea
                value={content.subheadline || ''}
                onChange={(e) => updateBlockContent('subheadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Beschreibung..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={content.button_text || ''}
                onChange={(e) => updateBlockContent('button_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jetzt starten"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button URL
              </label>
              <input
                type="url"
                value={content.button_url || ''}
                onChange={(e) => updateBlockContent('button_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Inhalt
              </label>
              <textarea
                value={content.content || ''}
                onChange={(e) => updateBlockContent('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="Fügen Sie hier Ihren Text hinzu..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Sie können HTML-Tags für Formatierung verwenden.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text-Ausrichtung
              </label>
              <select
                value={content.text_align || 'left'}
                onChange={(e) => updateBlockContent('text_align', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Linksbündig</option>
                <option value="center">Zentriert</option>
                <option value="right">Rechtsbündig</option>
                <option value="justify">Blocksatz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Textgröße
              </label>
              <select
                value={content.font_size || 'medium'}
                onChange={(e) => updateBlockContent('font_size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Klein</option>
                <option value="medium">Normal</option>
                <option value="large">Groß</option>
                <option value="xl">Sehr groß</option>
              </select>
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={content.text || ''}
                onChange={(e) => updateBlockContent('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button Text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <input
                type="url"
                value={content.url || ''}
                onChange={(e) => updateBlockContent('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Stil
              </label>
              <select
                value={content.style || 'primary'}
                onChange={(e) => updateBlockContent('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Primär</option>
                <option value="secondary">Sekundär</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Größe
              </label>
              <select
                value={content.size || 'medium'}
                onChange={(e) => updateBlockContent('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Klein</option>
                <option value="medium">Normal</option>
                <option value="large">Groß</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="new_tab"
                checked={content.open_new_tab || false}
                onChange={(e) => updateBlockContent('open_new_tab', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="new_tab" className="text-sm text-gray-700">
                In neuem Tab öffnen
              </label>
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bild URL
              </label>
              <input
                type="url"
                value={content.image_url || ''}
                onChange={(e) => updateBlockContent('image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={content.alt_text || ''}
                onChange={(e) => updateBlockContent('alt_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bildbeschreibung..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bildunterschrift
              </label>
              <input
                type="text"
                value={content.caption || ''}
                onChange={(e) => updateBlockContent('caption', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL (optional)
              </label>
              <input
                type="url"
                value={content.link_url || ''}
                onChange={(e) => updateBlockContent('link_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
        )

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formular Titel
              </label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kontakt aufnehmen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={content.submit_text || ''}
                onChange={(e) => updateBlockContent('submit_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Absenden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formular Felder
              </label>
              <div className="space-y-2">
                {['name', 'email', 'phone', 'message'].map((field) => (
                  <label key={field} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={content.fields?.includes(field) || false}
                      onChange={(e) => {
                        const fields = content.fields || []
                        const newFields = e.target.checked
                          ? [...fields, field]
                          : fields.filter((f: string) => f !== field)
                        updateBlockContent('fields', newFields)
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'spacer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Höhe (px)
              </label>
              <input
                type="number"
                value={content.height || 50}
                onChange={(e) => updateBlockContent('height', parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="500"
              />
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Unsere Preise'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preispläne (JSON)
              </label>
              <textarea
                value={JSON.stringify(content.plans || [], null, 2)}
                onChange={(e) => {
                  try {
                    const plans = JSON.parse(e.target.value)
                    updateBlockContent('plans', plans)
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder='[{"name": "Basic", "price": 29, "features": ["Feature 1"]}]'
              />
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={content.url || ''}
                onChange={(e) => updateBlockContent('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL (optional)
              </label>
              <input
                type="url"
                value={content.thumbnail || ''}
                onChange={(e) => updateBlockContent('thumbnail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoplay"
                checked={content.autoplay || false}
                onChange={(e) => updateBlockContent('autoplay', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoplay" className="text-sm text-gray-700">
                Autoplay aktivieren
              </label>
            </div>
          </div>
        )

      case 'icon':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unsere Vorteile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icons (JSON)
              </label>
              <textarea
                value={JSON.stringify(content.icons || [], null, 2)}
                onChange={(e) => {
                  try {
                    const icons = JSON.parse(e.target.value)
                    updateBlockContent('icons', icons)
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={6}
                placeholder='[{"icon": "star", "title": "Qualität", "description": "Beschreibung"}]'
              />
            </div>
          </div>
        )

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Was unsere Kunden sagen'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testimonials (JSON)
              </label>
              <textarea
                value={JSON.stringify(content.testimonials || [], null, 2)}
                onChange={(e) => {
                  try {
                    const testimonials = JSON.parse(e.target.value)
                    updateBlockContent('testimonials', testimonials)
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder='[{"name": "Max", "rating": 5, "text": "Super!", "company": "Firma"}]'
              />
            </div>
          </div>
        )

      case 'feature':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Unsere Features'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (JSON)
              </label>
              <textarea
                value={JSON.stringify(content.features || [], null, 2)}
                onChange={(e) => {
                  try {
                    const features = JSON.parse(e.target.value)
                    updateBlockContent('features', features)
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={6}
                placeholder='[{"title": "Feature", "description": "Beschreibung", "icon": "star"}]'
              />
            </div>
          </div>
        )

      case 'countdown':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Begrenzte Zeit!'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enddatum
              </label>
              <input
                type="datetime-local"
                value={content.end_date ? new Date(content.end_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateBlockContent('end_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={content.description || ''}
                onChange={(e) => updateBlockContent('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Aktion läuft ab"
              />
            </div>
          </div>
        )

      case 'faq':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Häufige Fragen'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FAQ Einträge (JSON)
              </label>
              <textarea
                value={JSON.stringify(content.faqs || [], null, 2)}
                onChange={(e) => {
                  try {
                    const faqs = JSON.parse(e.target.value)
                    updateBlockContent('faqs', faqs)
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder='[{"question": "Frage?", "answer": "Antwort"}]'
              />
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Kontakt'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                value={content.address || ''}
                onChange={(e) => updateBlockContent('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Musterstraße 123, 12345 Musterstadt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                value={content.phone || ''}
                onChange={(e) => updateBlockContent('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+49 123 456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={content.email || ''}
                onChange={(e) => updateBlockContent('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@studio.de"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Öffnungszeiten
              </label>
              <textarea
                value={content.hours || ''}
                onChange={(e) => updateBlockContent('hours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Mo-Fr: 6-22 Uhr, Sa-So: 8-20 Uhr"
              />
            </div>
          </div>
        )

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || 'Bereit anzufangen?'}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={content.description || ''}
                onChange={(e) => updateBlockContent('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Werden Sie noch heute Mitglied!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={content.button_text || ''}
                onChange={(e) => updateBlockContent('button_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jetzt anmelden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button URL
              </label>
              <input
                type="url"
                value={content.button_url || ''}
                onChange={(e) => updateBlockContent('button_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
        )

      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateBlockContent('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Willkommen im Fitnessstudio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Untertitel
              </label>
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => updateBlockContent('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Erreichen Sie Ihre Ziele mit uns"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={content.button_text || ''}
                onChange={(e) => updateBlockContent('button_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kostenlos testen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button URL
              </label>
              <input
                type="url"
                value={content.button_url || ''}
                onChange={(e) => updateBlockContent('button_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hintergrund Typ
              </label>
              <select
                value={content.background_type || 'image'}
                onChange={(e) => updateBlockContent('background_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">Bild</option>
                <option value="video">Video</option>
                <option value="color">Farbe</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>

            {content.background_type === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hintergrundbild URL
                </label>
                <input
                  type="url"
                  value={content.background_image || ''}
                  onChange={(e) => updateBlockContent('background_image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Konfiguration folgt
            </h3>
            <p className="text-gray-600">
              Die Konfiguration für {selectedBlock.block_type}-Blöcke wird noch implementiert.
            </p>
          </div>
        )
    }
  }

  const renderPageConfig = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seitentitel
          </label>
          <input
            type="text"
            value={landingpage.title}
            onChange={(e) => onUpdateLandingpage({ title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug
          </label>
          <input
            type="text"
            value={landingpage.slug}
            onChange={(e) => onUpdateLandingpage({ slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL: /lp/{landingpage.slug}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Titel
          </label>
          <input
            type="text"
            value={landingpage.meta_title || ''}
            onChange={(e) => onUpdateLandingpage({ meta_title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO Titel..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Beschreibung
          </label>
          <textarea
            value={landingpage.meta_description || ''}
            onChange={(e) => onUpdateLandingpage({ meta_description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="SEO Beschreibung..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Design Template
          </label>
          <select
            value={landingpage.design_template || 'fitness-modern'}
            onChange={(e) => onUpdateLandingpage({ design_template: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fitness-modern">Fitness Modern</option>
            <option value="wellness-clean">Wellness Clean</option>
            <option value="gym-bold">Gym Bold</option>
            <option value="yoga-minimal">Yoga Minimal</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="form_enabled"
            checked={landingpage.form_enabled}
            onChange={(e) => onUpdateLandingpage({ form_enabled: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="form_enabled" className="text-sm font-medium text-gray-700">
            Lead-Formulare aktiviert
          </label>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Veröffentlicht</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                landingpage.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {landingpage.is_active ? 'Live' : 'Entwurf'}
              </span>
            </div>
            
            {landingpage.qr_code_url && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">QR-Code</span>
                <a 
                  href={landingpage.qr_code_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Anzeigen
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Settings size={16} />
            Inhalt
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
              activeTab === 'layout'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Grid3X3 size={16} />
            Layout
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
              activeTab === 'style'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Palette size={16} />
            Stil
          </button>
          <button
            onClick={() => setActiveTab('page')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
              activeTab === 'page'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Eye size={16} />
            Seite
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Block Info Header (when block is selected) */}
          {(activeTab === 'content' || activeTab === 'layout' || activeTab === 'style') && selectedBlock && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center text-sm font-medium">
                  📦
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {selectedBlock.block_type}-Block
                  </h3>
                  <p className="text-xs text-gray-600">
                    Position {selectedBlock.position + 1}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Content */}
          {activeTab === 'content' && renderContentConfig()}
          {activeTab === 'layout' && renderLayoutConfig()}
          {activeTab === 'style' && renderStyleConfig()}
          {activeTab === 'page' && renderPageConfig()}
        </div>
      </div>
    </div>
  )
} 