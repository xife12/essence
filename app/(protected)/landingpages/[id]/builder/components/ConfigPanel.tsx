'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Grid3X3, Palette, Eye, Upload, Square, Columns, Rows, Layers, Type, Image, Layout, Users, Sliders } from 'lucide-react'
import { LandingPage, LandingPageBlock, PresetType } from '../../../../../lib/api/landingpages'
import { CITemplate } from '../../../../../lib/api/ci-templates'
import { LayoutType } from '../../../../../lib/api/landingpages'
import supabase from '../../../../../lib/supabaseClient'

interface ConfigPanelProps {
  landingpage: LandingPage
  selectedBlock: LandingPageBlock | null
  onUpdateBlock: (blockId: string, updates: Partial<LandingPageBlock>) => void
  onUpdateLandingpage: (updates: Partial<LandingPage>) => void
  ciTemplate: CITemplate | null
  onOpenTestimonialWizard?: (blockId: string) => void
}

// Testimonial Interface für Supabase Daten
interface Testimonial {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  gender?: 'Männlich' | 'Weiblich' | 'Divers';
  age?: number;
  rating: number;
  text_content: string;
  file_asset?: {
    id: string;
    filename: string;
    file_url: string;
  };
  tags: string[];
  training_goals: string[];
  member_since?: string;
  is_active: boolean;
}

// ============================================================================
// Preset Definitions for each Block Type
// ============================================================================

const LAYOUT_OPTIONS = {
  default: [
    { value: 'default', label: 'Standard', icon: Square },
    { value: 'wide', label: 'Breit', icon: Columns },
    { value: 'narrow', label: 'Schmal', icon: Rows }
  ],
  header: [
    { value: 'center', label: 'Zentriert', icon: Square },
    { value: 'left', label: 'Linksbündig', icon: Columns },
    { value: 'split', label: 'Geteilt', icon: Layers },
    { value: 'overlay', label: 'Overlay', icon: Rows }
  ],
  testimonial: [
    { value: 'grid', label: 'Raster', icon: Grid3X3 },
    { value: 'carousel', label: 'Karussell', icon: Columns },
    { value: 'stack', label: 'Gestapelt', icon: Rows }
  ]
}

// Mini-Preview-Komponente für Header-Presets
function HeaderPresetPreview({ preset, ciTemplate, imageUrl }: { preset: string, ciTemplate: CITemplate | null, imageUrl?: string }) {
  const bg = ciTemplate?.primary_color || '#2563eb';
  const textColor = ciTemplate?.text_color || '#fff';
  const fontFamily = ciTemplate?.font_headline || ciTemplate?.font_family || 'inherit';
  const accent = ciTemplate?.accent_color || '#a21caf';
  const buttonRadius = ciTemplate?.button_style?.radius || '6px';
  // Bild-Logik
  const img = imageUrl || undefined;
  // Preview-Größe und Style
  const previewStyle = {
    width: 120,
    height: 56,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    position: 'relative' as const
  };
  switch (preset) {
    case 'hero-centered':
      return (
        <div style={previewStyle}>
          <div style={{ background: bg, color: textColor, fontFamily, width: '100%', height: '100%', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: '16px', width: '90%', textAlign: 'center', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Headline</div>
            <div style={{ fontSize: 11, opacity: 0.8, width: '90%', textAlign: 'center', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Subline</div>
            <div style={{ background: accent, color: '#fff', borderRadius: buttonRadius, fontSize: 10, padding: '2px 10px', marginTop: 2, minWidth: 36, textAlign: 'center' }}>Button</div>
          </div>
        </div>
      );
    case 'hero-split':
      return (
        <div style={previewStyle}>
          <div style={{ background: bg, color: textColor, fontFamily, width: '100%', height: '100%', borderRadius: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 6 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: '15px', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Headline</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Subline</div>
              <div style={{ background: accent, color: '#fff', borderRadius: buttonRadius, fontSize: 9, padding: '1.5px 8px', marginTop: 1, minWidth: 28, textAlign: 'center' }}>Button</div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 6, marginLeft: 8, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
              {img ? (
                <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
              ) : (
                <span style={{ color: '#bbb', fontSize: 11 }}>IMG</span>
              )}
            </div>
          </div>
        </div>
      );
    case 'image-overlay':
      return (
        <div style={previewStyle}>
          <div style={{ background: bg, color: textColor, fontFamily, width: '100%', height: '100%', borderRadius: 8, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            {img && <img src={img} alt="Preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, opacity: 0.6 }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', borderRadius: 8 }} />
            <div style={{ zIndex: 2, width: '100%', textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: '15px', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Headline</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Subline</div>
              <div style={{ background: accent, color: '#fff', borderRadius: buttonRadius, fontSize: 9, padding: '1.5px 8px', marginTop: 1, minWidth: 28, textAlign: 'center', display: 'inline-block' }}>Button</div>
            </div>
            <div style={{ position: 'absolute', right: 6, bottom: 6, width: 20, height: 20, borderRadius: 4, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', zIndex: 3 }}>
              {img ? (
                <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <span style={{ color: '#bbb', fontSize: 9 }}>IMG</span>
              )}
            </div>
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div style={previewStyle}>
          <div style={{ background: '#fff', color: textColor, fontFamily, border: `1px solid ${bg}`, width: '100%', height: '100%', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: '16px', width: '90%', textAlign: 'center', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Headline</div>
            <div style={{ fontSize: 11, opacity: 0.6, width: '90%', textAlign: 'center' }}>Subline</div>
          </div>
        </div>
      );
    case 'clean-color':
      return (
        <div style={previewStyle}>
          <div style={{ background: accent, color: '#fff', fontFamily, width: '100%', height: '100%', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: '16px', width: '90%', textAlign: 'center', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Headline</div>
            <div style={{ fontSize: 11, opacity: 0.8, width: '90%', textAlign: 'center' }}>Subline</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Mini-Preview-Komponente für Testimonial-Presets
function TestimonialPresetPreview({ preset, testimonials, config, ciTemplate }: { preset: string, testimonials: any[], config: any, ciTemplate: CITemplate | null }) {
  // Farben aus CI
  const accent = ciTemplate?.accent_color || '#a21caf';
  const cardBg = ciTemplate?.background_color || '#fff';
  const textColor = ciTemplate?.text_color || '#222';
  const starColor = '#fbbf24';
  // Hilfsfunktion für Sterne
  const renderStars = (count: number) => (
    <span style={{ color: starColor, fontSize: 11 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
  );
  // Dummy-Daten fallback
  const data = testimonials && testimonials.length > 0 ? testimonials : [
    { name: 'Max Mustermann', rating: 5, text: 'Super Beratung und tolles Team!', image: '', age: 32 },
    { name: 'Anna Schmidt', rating: 4, text: 'Sehr zufrieden, komme gerne wieder.', image: '', age: 28 },
    { name: 'T. Müller', rating: 5, text: 'Top Studio!', image: '', age: 45 }
  ];
  // Filter & Limit
  const filtered = data.filter(t => !config.min_age || t.age >= config.min_age).slice(0, config.count || 3);
  // Anzeigeoptionen
  const showName = config.show_name ?? true;
  const showStars = config.show_stars ?? true;
  const showFirstname = config.show_firstname ?? false;
  const showNameShort = config.show_name_short ?? false;
  const showText = config.show_text_excerpt ?? true;
  const showImage = config.show_image ?? true;
  // Name-Logik
  const getName = (t: any) => showFirstname ? t.name.split(' ')[0] : (showNameShort ? (t.name[0] + '. ' + t.name.split(' ')[1]) : t.name);
  // Text-Logik
  const getText = (t: any) => showText ? (t.text.length > 30 ? t.text.slice(0, 30) + '…' : t.text) : '';
  // Verschiedene Layouts
  switch (preset) {
    case 'default':
      // Klassisch: 3 nebeneinander
      return (
        <div style={{ display: 'flex', gap: 4, width: 120, height: 56 }}>
          {filtered.slice(0, 3).map((t, i) => (
            <div key={i} style={{ background: cardBg, color: textColor, borderRadius: 6, flex: 1, padding: 4, fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee' }}>
              {showImage && <div style={{ width: 18, height: 18, borderRadius: 9, background: '#eee', marginBottom: 2, overflow: 'hidden' }}>{t.image ? <img src={t.image} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} /> : <span style={{ color: '#bbb', fontSize: 9 }}>IMG</span>}</div>}
              {showStars && renderStars(t.rating)}
              {showName && <div style={{ fontWeight: 600, marginTop: 1 }}>{getName(t)}</div>}
              {showText && <div style={{ fontSize: 9, opacity: 0.7, textAlign: 'center' }}>{getText(t)}</div>}
            </div>
          ))}
        </div>
      );
    case 'cards':
      // Karten-Layout: 2 größere Cards
      return (
        <div style={{ display: 'flex', gap: 6, width: 120, height: 56 }}>
          {filtered.slice(0, 2).map((t, i) => (
            <div key={i} style={{ background: accent, color: '#fff', borderRadius: 8, flex: 1, padding: 6, fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {showImage && <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', marginBottom: 2, overflow: 'hidden' }}>{t.image ? <img src={t.image} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <span style={{ color: '#bbb', fontSize: 9 }}>IMG</span>}</div>}
              {showStars && renderStars(t.rating)}
              {showName && <div style={{ fontWeight: 700, marginTop: 1 }}>{getName(t)}</div>}
              {showText && <div style={{ fontSize: 9, opacity: 0.8, textAlign: 'center' }}>{getText(t)}</div>}
            </div>
          ))}
        </div>
      );
    case 'carousel':
      // Karussell: 1 großes Testimonial mit Pfeilen
      return (
        <div style={{ width: 120, height: 56, background: cardBg, borderRadius: 8, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: accent, opacity: 0.7 }}>{'‹'}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 11 }}>
            {showImage && <div style={{ width: 20, height: 20, borderRadius: 10, background: '#eee', margin: '0 auto 2px', overflow: 'hidden' }}>{filtered[0]?.image ? <img src={filtered[0].image} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <span style={{ color: '#bbb', fontSize: 9 }}>IMG</span>}</div>}
            {showStars && renderStars(filtered[0]?.rating || 5)}
            {showName && <div style={{ fontWeight: 600 }}>{getName(filtered[0] || {})}</div>}
            {showText && <div style={{ fontSize: 9, opacity: 0.7 }}>{getText(filtered[0] || {})}</div>}
          </div>
          <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: accent, opacity: 0.7 }}>{'›'}</div>
        </div>
      );
    case 'centered':
      // Ein großes, zentriertes Testimonial
      return (
        <div style={{ width: 120, height: 56, background: accent, borderRadius: 8, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 12, padding: 6 }}>
          {showImage && <div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', marginBottom: 2, overflow: 'hidden' }}>{filtered[0]?.image ? <img src={filtered[0].image} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 11 }} /> : <span style={{ color: '#bbb', fontSize: 10 }}>IMG</span>}</div>}
          {showStars && renderStars(filtered[0]?.rating || 5)}
          {showName && <div style={{ fontWeight: 700 }}>{getName(filtered[0] || {})}</div>}
          {showText && <div style={{ fontSize: 10, opacity: 0.9, textAlign: 'center' }}>{getText(filtered[0] || {})}</div>}
        </div>
      );
    default:
      return null;
  }
}

export default function ConfigPanel({
  landingpage,
  selectedBlock,
  onUpdateBlock,
  onUpdateLandingpage,
  ciTemplate,
  onOpenTestimonialWizard
}: ConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'testimonials'>('content')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(false)

  // Load testimonials when component mounts or when testimonial block is selected
  useEffect(() => {
    if (selectedBlock?.block_type === 'testimonial') {
      fetchTestimonials()
    }
  }, [selectedBlock?.block_type])

  const fetchTestimonials = async () => {
    setLoadingTestimonials(true)
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          file_asset:file_asset_id (
            id,
            filename,
            file_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setTestimonials(data)
      } else {
        console.error('Error loading testimonials:', error)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoadingTestimonials(false)
    }
  }

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
    
    // WICHTIG: Bewahre alle aktuellen Einstellungen auf und ändere nur das Preset
    const currentContent = selectedBlock.content_json || {}
    const newContent = {
      ...currentContent, // Alle aktuellen Einstellungen beibehalten
      preset: preset     // Nur das Preset ändern
    }
    
    onUpdateBlock(selectedBlock.id, { 
      preset: preset,
      content_json: newContent
    })
  }

  // Handler für Testimonial-Auswahl
  const handleTestimonialToggle = (testimonialId: string) => {
    if (!selectedBlock) return
    
    const currentSelection = selectedBlock.content_json.selectedTestimonials || []
    const isSelected = currentSelection.includes(testimonialId)
    
    if (isSelected) {
      updateBlockContent('selectedTestimonials', currentSelection.filter((id: string) => id !== testimonialId))
    } else {
      updateBlockContent('selectedTestimonials', [...currentSelection, testimonialId])
    }
  }

  // Alle Testimonials auswählen/abwählen
  const handleSelectAllTestimonials = () => {
    if (!selectedBlock) return
    
    const currentSelection = selectedBlock.content_json.selectedTestimonials || []
    const allTestimonialIds = testimonials.map(t => t.id)
    
    if (currentSelection.length === allTestimonialIds.length) {
      // Alle abwählen
      updateBlockContent('selectedTestimonials', [])
    } else {
      // Alle auswählen
      updateBlockContent('selectedTestimonials', allTestimonialIds)
    }
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

    // Testimonial-Presets nur für testimonial-Block
    if (blockType === 'testimonial') {
      const testimonialPresets = [
        { value: 'default', label: 'Standard', description: 'Klassische Reihe' },
        { value: 'cards', label: 'Karten', description: 'Testimonials als Karten' },
        { value: 'carousel', label: 'Karussell', description: 'Scrollbare Einzelansicht' },
        { value: 'centered', label: 'Zentriert', description: 'Ein großes Testimonial' }
      ];
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stil-Vorlage
            </label>
            <div className="space-y-2">
              {testimonialPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateBlockPreset(preset.value as PresetType)}
                  className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all ${
                    selectedBlock.preset === preset.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-32 mr-3">
                    <TestimonialPresetPreview preset={preset.value} testimonials={selectedBlock.content_json?.testimonials || []} config={selectedBlock.content_json} ciTemplate={ciTemplate} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{preset.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

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
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Überschrift</label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlockContent('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hauptüberschrift eingeben..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unterzeile</label>
              <input
                type="text"
                value={content.subheadline || ''}
                onChange={(e) => updateBlockContent('subheadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unterzeile eingeben..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button-Text</label>
              <input
                type="text"
                value={content.button_text || ''}
                onChange={(e) => updateBlockContent('button_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Jetzt starten"
              />
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Überschrift</label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlockContent('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional: Überschrift"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text-Inhalt</label>
              <textarea
                value={content.content || ''}
                onChange={(e) => updateBlockContent('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ihren Text hier eingeben..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schriftgröße</label>
              <select
                value={content.fontSize || 'medium'}
                onChange={(e) => updateBlockContent('fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Klein</option>
                <option value="medium">Mittel</option>
                <option value="large">Groß</option>
              </select>
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button-Text</label>
              <input
                type="text"
                value={content.text || ''}
                onChange={(e) => updateBlockContent('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button-Beschriftung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link-URL</label>
              <input
                type="url"
                value={content.url || ''}
                onChange={(e) => updateBlockContent('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button-Stil</label>
              <select
                value={content.style || 'primary'}
                onChange={(e) => updateBlockContent('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Primär</option>
                <option value="secondary">Sekundär</option>
                <option value="ghost">Ghost</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </div>
        )

      case 'feature':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Überschrift</label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlockContent('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Unsere Features"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="space-y-3">
                {(content.features || []).map((feature, index) => (
                  <div key={index} className="border p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={feature.icon || ''}
                        onChange={(e) => {
                          const newFeatures = [...(content.features || [])]
                          newFeatures[index] = { ...feature, icon: e.target.value }
                          updateBlockContent('features', newFeatures)
                        }}
                        placeholder="Icon (z.B. ⚡)"
                        className="px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        value={feature.title || ''}
                        onChange={(e) => {
                          const newFeatures = [...(content.features || [])]
                          newFeatures[index] = { ...feature, title: e.target.value }
                          updateBlockContent('features', newFeatures)
                        }}
                        placeholder="Titel"
                        className="px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        value={feature.description || ''}
                        onChange={(e) => {
                          const newFeatures = [...(content.features || [])]
                          newFeatures[index] = { ...feature, description: e.target.value }
                          updateBlockContent('features', newFeatures)
                        }}
                        placeholder="Beschreibung"
                        className="px-2 py-1 border rounded"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFeatures = [...(content.features || []), { icon: '⚡', title: 'Neues Feature', description: 'Beschreibung' }]
                    updateBlockContent('features', newFeatures)
                  }}
                  className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  + Feature hinzufügen
                </button>
              </div>
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Überschrift</label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlockContent('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Unsere Preise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preispläne</label>
              <div className="space-y-4">
                {(content.plans || []).map((plan, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={plan.name || ''}
                        onChange={(e) => {
                          const newPlans = [...(content.plans || [])]
                          newPlans[index] = { ...plan, name: e.target.value }
                          updateBlockContent('plans', newPlans)
                        }}
                        placeholder="Plan-Name"
                        className="px-2 py-1 border rounded"
                      />
                      <input
                        type="text"
                        value={plan.price || ''}
                        onChange={(e) => {
                          const newPlans = [...(content.plans || [])]
                          newPlans[index] = { ...plan, price: e.target.value }
                          updateBlockContent('plans', newPlans)
                        }}
                        placeholder="Preis (z.B. 29€)"
                        className="px-2 py-1 border rounded"
                      />
                    </div>
                    <textarea
                      value={(plan.features || []).join('\n')}
                      onChange={(e) => {
                        const newPlans = [...(content.plans || [])]
                        newPlans[index] = { ...plan, features: e.target.value.split('\n').filter(f => f.trim()) }
                        updateBlockContent('plans', newPlans)
                      }}
                      placeholder="Features (eine pro Zeile)"
                      rows={3}
                      className="w-full px-2 py-1 border rounded"
                    />
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={plan.highlighted || false}
                        onChange={(e) => {
                          const newPlans = [...(content.plans || [])]
                          newPlans[index] = { ...plan, highlighted: e.target.checked }
                          updateBlockContent('plans', newPlans)
                        }}
                      />
                      Hervorgehoben
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newPlans = [...(content.plans || []), { name: 'Neuer Plan', price: '29€', features: ['Feature 1'], highlighted: false }]
                    updateBlockContent('plans', newPlans)
                  }}
                  className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  + Plan hinzufügen
                </button>
              </div>
            </div>
          </div>
        )

      case 'faq':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Überschrift</label>
              <input
                type="text"
                value={content.headline || ''}
                onChange={(e) => updateBlockContent('headline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Häufige Fragen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FAQ-Einträge</label>
              <div className="space-y-3">
                {(content.faqs || []).map((faq, index) => (
                  <div key={index} className="border p-3 rounded-lg">
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => {
                        const newFaqs = [...(content.faqs || [])]
                        newFaqs[index] = { ...faq, question: e.target.value }
                        updateBlockContent('faqs', newFaqs)
                      }}
                      placeholder="Frage"
                      className="w-full px-2 py-1 border rounded mb-2"
                    />
                    <textarea
                      value={faq.answer || ''}
                      onChange={(e) => {
                        const newFaqs = [...(content.faqs || [])]
                        newFaqs[index] = { ...faq, answer: e.target.value }
                        updateBlockContent('faqs', newFaqs)
                      }}
                      placeholder="Antwort"
                      rows={2}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newFaqs = [...(content.faqs || []), { question: 'Neue Frage?', answer: 'Neue Antwort...' }]
                    updateBlockContent('faqs', newFaqs)
                  }}
                  className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  + FAQ hinzufügen
                </button>
              </div>
            </div>
          </div>
        )

      case 'spacer':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Höhe ({content.height || 50}px)
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={content.height || 50}
                onChange={(e) => updateBlockContent('height', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <input
                type="number"
                value={content.height || 50}
                onChange={(e) => updateBlockContent('height', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="500"
                placeholder="Höhe in Pixeln"
              />
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

  // ========================================================================
  // Testimonial Selection Configuration
  // ========================================================================

  const renderTestimonialSelection = () => {
    if (!selectedBlock) return null

    const selectedTestimonials = selectedBlock.content_json.selectedTestimonials || []

    return (
      <div className="space-y-6">
        {/* Header mit Auswahl-Actions */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Testimonials auswählen ({selectedTestimonials.length} von {testimonials.length})
          </h4>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAllTestimonials}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedTestimonials.length === testimonials.length && testimonials.length > 0 
                ? 'Alle abwählen' 
                : 'Alle auswählen'
              }
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingTestimonials ? (
          <div className="text-center py-4 text-gray-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
            <p className="mt-2 text-sm">Lade Testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Keine Testimonials gefunden.</p>
            <p className="text-xs mt-1">Erstellen Sie zuerst Testimonials im Dashboard.</p>
          </div>
        ) : (
          /* Testimonial Liste */
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testimonials.map(testimonial => {
              const isSelected = selectedTestimonials.includes(testimonial.id)
              const displayName = testimonial.firstname && testimonial.lastname 
                ? `${testimonial.firstname} ${testimonial.lastname}`
                : testimonial.name || 'Unbekannt'

              return (
                <label
                  key={testimonial.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleTestimonialToggle(testimonial.id)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{displayName}</span>
                      {testimonial.age && (
                        <span className="text-xs text-gray-500">({testimonial.age})</span>
                      )}
                      {testimonial.gender && (
                        <span className="text-xs text-gray-500">
                          {testimonial.gender === 'Männlich' ? '♂' : testimonial.gender === 'Weiblich' ? '♀' : '⚧'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          className={`text-xs ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({testimonial.rating})</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {testimonial.text_content.length > 60 
                        ? testimonial.text_content.slice(0, 60) + '...' 
                        : testimonial.text_content
                      }
                    </p>
                    {testimonial.training_goals && testimonial.training_goals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {testimonial.training_goals.slice(0, 2).map(goal => (
                          <span 
                            key={goal} 
                            className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full"
                          >
                            {goal}
                          </span>
                        ))}
                        {testimonial.training_goals.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{testimonial.training_goals.length - 2} weitere
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        )}

        {/* Selected Count Info */}
        {selectedTestimonials.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>{selectedTestimonials.length}</strong> Testimonial(s) ausgewählt
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-1">
          {selectedBlock?.block_type === 'testimonial' ? (
            // Tab-Navigation für Testimonial-Blöcke
            <>
          <button
            onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
              activeTab === 'content'
                ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings size={16} />
            Inhalt
          </button>
          <button
                onClick={() => setActiveTab('testimonials')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                  activeTab === 'testimonials' 
                ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
                <Users size={16} />
                Testimonials
          </button>
            </>
          ) : (
            // Standard-Tab für andere Block-Typen
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-blue-100 text-blue-700">
              <Settings size={16} />
              Inhalt
          </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Block Info Header (when block is selected) */}
          {selectedBlock && (
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
          {selectedBlock?.block_type === 'testimonial' && activeTab === 'testimonials' 
            ? renderTestimonialSelection() 
            : renderContentConfig()
          }
        </div>
      </div>
    </div>
  )
} 