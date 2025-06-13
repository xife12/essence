'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { Settings, BarChart3, Eye, Edit2, ArrowLeft, Monitor, Smartphone, Maximize2, Play, Save, RefreshCw, Loader2, Clock, EyeOff, Minimize2 } from 'lucide-react'

// Import the sophisticated builder components
import BuilderLayout from './components/BuilderLayout'
import BlockLibrary from './components/BlockLibrary'
import Canvas from './components/Canvas'
import ConfigPanel from './components/ConfigPanel'
import BlockWizardModal from './components/BlockWizardModal'
import UniversalBlockWizard from './components/UniversalBlockWizard'

// Import API and types
import { LandingPage, LandingPageBlock, BlockType, LayoutType } from '../../../../lib/api/landingpages'
import LandingpagesAPI from '../../../../lib/api/landingpages'
import { CITemplatesAPI, CITemplate } from '../../../../lib/api/ci-templates'

// Simple mobile detection
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

// Neue Navigation-Komponente wie im Formbuilder
function LandingpageNavigation({ landingpageId, landingpageTitle, currentPage }: { landingpageId: string, landingpageTitle?: string, currentPage: 'builder' | 'einstellungen' | 'auswertung' }) {
  const router = useRouter();
  const navigationItems = [
    { key: 'builder', label: 'Builder', icon: Edit2, path: `/landingpages/${landingpageId}/builder` },
    { key: 'einstellungen', label: 'Einstellungen', icon: Settings, path: `/landingpages/${landingpageId}/einstellungen` },
    { key: 'auswertung', label: 'Auswertung', icon: BarChart3, path: `/landingpages/${landingpageId}/auswertung` },
  ];
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/landingpages')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{landingpageTitle || 'Landingpage bearbeiten'}</h1>
              <p className="text-sm text-gray-600">ID: {landingpageId.substring(0, 8)}...</p>
            </div>
          </div>
          <nav className="flex space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

// Dezente Toolbar wie im Formbuilder
function Toolbar({ onSave, onPreview, isSaving, lastSavedAt, hasUnsavedChanges, isAutoSaving, onTestPreview }: { onSave: () => void, onPreview: () => void, isSaving: boolean, lastSavedAt: Date | null, hasUnsavedChanges: boolean, isAutoSaving: boolean, onTestPreview: () => void }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">Landingpage</span>
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-lg">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">Auto-Save: 90s</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${hasUnsavedChanges ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}`}
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Speichert...</>
            ) : (
              <><Save className="w-4 h-4" /> Speichern</>
            )}
          </button>
          <button
            onClick={onTestPreview}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Test & Vorschau
          </button>
          {/* Gespeichert-Status */}
          {isAutoSaving ? (
            <span className="flex items-center gap-1 text-blue-600"><RefreshCw className="w-3 h-3 animate-spin" /><span className="text-xs">Speichere automatisch...</span></span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1 text-green-600"><RefreshCw className="w-3 h-3" /><span className="text-xs">Gespeichert {lastSavedAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// DeviceBar wie im Formbuilder, eigene Leiste
function DeviceBar({ previewDevice, setPreviewDevice, showPreview, setShowPreview, isFullscreen, onToggleFullscreen, landingpage, ciTemplates, handleChangeCITemplate }: {
  previewDevice: 'desktop' | 'mobile',
  setPreviewDevice: (d: 'desktop' | 'mobile') => void,
  showPreview: boolean,
  setShowPreview: (v: boolean) => void,
  isFullscreen: boolean,
  onToggleFullscreen: () => void,
  landingpage: LandingPage | null,
  ciTemplates: CITemplate[],
  handleChangeCITemplate: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-end gap-2">
      <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
        <button
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${previewDevice === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setPreviewDevice('desktop')}
        >
          <Monitor size={16} /> Desktop
        </button>
        <button
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${previewDevice === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setPreviewDevice('mobile')}
        >
          <Smartphone size={16} /> Mobile
        </button>
      </div>
      {/* CI-Template Dropdown */}
      <select
        value={landingpage?.ci_template_id || ''}
        onChange={handleChangeCITemplate}
        className="ml-4 px-2 py-1 rounded border border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ minWidth: 180 }}
      >
        <option value="">CI-Template wählen…</option>
        {ciTemplates.map((ci) => (
          <option key={ci.id} value={ci.id}>
            {ci.name}
          </option>
        ))}
      </select>
      <button
        className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        {isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
      </button>
      <button
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${showPreview ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        onClick={() => setShowPreview(!showPreview)}
      >
        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
        {showPreview ? 'Bearbeiten' : 'Vorschau'}
      </button>
    </div>
  );
}

export default function LandingPageBuilder() {
  const params = useParams()
  const landingpageId = params.id as string

  // State management
  const [landingpage, setLandingpage] = useState<LandingPage | null>(null)
  const [blocks, setBlocks] = useState<LandingPageBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [ciTemplate, setCITemplate] = useState<CITemplate | null>(null)
  const [ciTemplates, setCITemplates] = useState<CITemplate[]>([])

  // Autosave-Logik wie im Formbuilder
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // New states for Universal Block Wizard
  const [showBlockWizard, setShowBlockWizard] = useState(false)
  const [currentBlockType, setCurrentBlockType] = useState<BlockType | null>(null)
  const [wizardInitialData, setWizardInitialData] = useState<Partial<any> | null>(null)
  const [pendingBlockPosition, setPendingBlockPosition] = useState<number | undefined>(undefined)
  const [currentWizardBlockId, setCurrentWizardBlockId] = useState<string | null>(null)

  // New states for Legacy Testimonial Wizard (keep for backwards compatibility)
  const [showTestimonialWizard, setShowTestimonialWizard] = useState(false)

  // Load landingpage data
  useEffect(() => {
    loadLandingpage()
  }, [landingpageId])

  const loadLandingpage = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API calls
      // const landingpageData = await LandingpagesAPI.getById(landingpageId)
      // const blocksData = await LandingpagesAPI.getBlocks(landingpageId)
      
      // Mock data for now
      const mockLandingpage: LandingPage = {
        id: landingpageId,
        title: 'Neue Landingpage',
        slug: 'neue-landingpage',
        headline: 'Willkommen',
        description: 'Eine neue Landingpage',
        is_active: false,
        form_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ci_template_id: undefined // <- Hier später echte ID setzen
      }
      
      setLandingpage(mockLandingpage)
      setBlocks([])
      
      // CI-Template laden, wenn vorhanden
      if (mockLandingpage.ci_template_id) {
        const ci = await CITemplatesAPI.getById(mockLandingpage.ci_template_id)
        setCITemplate(ci)
      } else {
        setCITemplate(null)
      }
    } catch (error) {
      console.error('Error loading landingpage:', error)
    } finally {
      setLoading(false)
    }
  }

  // Lade alle CI-Templates beim Mount
  useEffect(() => {
    async function fetchCITemplates() {
      try {
        const templates = await CITemplatesAPI.getAll()
        setCITemplates(templates)
      } catch (e) {
        console.error('Fehler beim Laden der CI-Templates:', e)
      }
    }
    fetchCITemplates()
  }, [])

  // Handler für CI-Template-Wechsel
  const handleChangeCITemplate = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    if (!landingpage) return
    try {
      // Update Landingpage in DB (optional: API-Call aktivieren)
      // await LandingpagesAPI.updateLandingpage(landingpage.id, { ci_template_id: newId })
      setLandingpage({ ...landingpage, ci_template_id: newId })
      const ci = await CITemplatesAPI.getById(newId)
      setCITemplate(ci)
    } catch (err) {
      console.error('Fehler beim Wechseln des CI-Templates:', err)
    }
  }

  // Block management functions
  const handleAddBlock = async (blockType: BlockType, position?: number) => {
    // Special handling for testimonials (legacy wizard)
    if (blockType === 'testimonial') {
      setShowTestimonialWizard(true)
      setWizardInitialData({})
      setPendingBlockPosition(position)
      return
    }
    
    // All other block types use the universal wizard
    const blockTypesWithWizard = [
      'header', 'text', 'image', 'video', 'button', 'form', 'pricing',
      'feature', 'statistics', 'faq', 'team', 'contact', 'trust_logos',
      'gallery', 'countdown', 'service', 'icon', 'spacer', 'cta', 'hero',
      'gamification', 'courseplan', 'blog_preview'
    ]
    
    if (blockTypesWithWizard.includes(blockType)) {
      setCurrentBlockType(blockType)
      setShowBlockWizard(true)
      setWizardInitialData({})
      setPendingBlockPosition(position)
      return
    }
    
    // Fallback: Create block directly without wizard
    try {
      const newBlock: LandingPageBlock = {
        id: `block-${Date.now()}`,
        landingpage_id: landingpageId,
        block_type: blockType,
        position: position ?? blocks.length,
        content_json: {
          ...(blockType === 'header' && { headline: 'Neue Überschrift', subheadline: 'Untertitel' }),
          ...(blockType === 'text' && { content: 'Neuer Textblock' }),
          ...(blockType === 'button' && { text: 'Button Text', url: '#', style: 'primary' }),
        },
        layout: '1-col' as LayoutType,
        preset: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const updatedBlocks = [...blocks]
      if (position !== undefined) {
        updatedBlocks.splice(position, 0, newBlock)
        updatedBlocks.forEach((block, index) => { block.position = index })
      } else {
        updatedBlocks.push(newBlock)
      }
      setBlocks(updatedBlocks)
      setSelectedBlock(newBlock.id)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error adding block:', error)
    }
  }

  const handleTestimonialWizardSave = (data: any) => {
    try {
      if (currentWizardBlockId) {
        // Bestehenden Block überschreiben
        const updatedBlocks = blocks.map(block =>
          block.id === currentWizardBlockId 
            ? { 
                ...block, 
                content_json: data,
                preset: data.preset || 'default',
                updated_at: new Date().toISOString() 
              }
            : block
        )
        setBlocks(updatedBlocks)
        setHasUnsavedChanges(true)
      } else {
        // Neuen Block erstellen
        const newBlock: LandingPageBlock = {
          id: `block-${Date.now()}`,
          landingpage_id: landingpageId,
          block_type: 'testimonial',
          position: pendingBlockPosition ?? blocks.length,
          content_json: data,
          layout: '1-col' as LayoutType,
          preset: data.preset || 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedBlocks = [...blocks]
        if (pendingBlockPosition !== undefined) {
          updatedBlocks.splice(pendingBlockPosition, 0, newBlock)
          updatedBlocks.forEach((block, index) => { block.position = index })
        } else {
          updatedBlocks.push(newBlock)
        }
        setBlocks(updatedBlocks)
        setSelectedBlock(newBlock.id)
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Error saving testimonial block:', error)
    } finally {
      setShowTestimonialWizard(false)
      setWizardInitialData(null)
      setPendingBlockPosition(undefined)
      setCurrentWizardBlockId(null)
    }
  }

  const handleUpdateBlock = async (blockId: string, updates: Partial<LandingPageBlock>) => {
    try {
      const updatedBlocks = blocks.map(block =>
        block.id === blockId ? { ...block, ...updates, updated_at: new Date().toISOString() } : block
      )
      setBlocks(updatedBlocks)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error updating block:', error)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const updatedBlocks = blocks.filter(block => block.id !== blockId)
      updatedBlocks.forEach((block, index) => { block.position = index })
      setBlocks(updatedBlocks)
      if (selectedBlock === blockId) {
        setSelectedBlock(null)
      }
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error deleting block:', error)
    }
  }

  const handleReorderBlocks = async (newBlocks: LandingPageBlock[]) => {
    try {
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        position: index,
        updated_at: new Date().toISOString()
      }))
      setBlocks(updatedBlocks)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error reordering blocks:', error)
    }
  }

  const handleUpdateLandingpage = async (updates: Partial<LandingPage>) => {
    try {
      if (!landingpage) return
      
      const updatedLandingpage = {
        ...landingpage,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      setLandingpage(updatedLandingpage)

      // TODO: Save to database
      // await LandingpagesAPI.update(landingpageId, updates)
      
    } catch (error) {
      console.error('Error updating landingpage:', error)
    }
  }

  // Speichern-Funktion für alle Blöcke
  const saveBlocksToDatabase = async () => {
    if (!landingpage) return;
    setIsSaving(true);
    try {
      // 1. Lade aktuelle Blöcke aus der DB
      const { data: dbBlocks } = await LandingpagesAPI.getBlocks(landingpageId);
      const dbBlockIds = dbBlocks.map(b => b.id);
      const localBlockIds = blocks.map(b => b.id);

      // 2. Neue Blöcke anlegen
      for (const block of blocks) {
        if (!dbBlockIds.includes(block.id)) {
          await LandingpagesAPI.createBlock({
            landingpage_id: landingpageId,
            block_type: block.block_type,
            position: block.position,
            layout: block.layout,
            preset: block.preset,
            content_json: block.content_json
          });
        } else {
          // 3. Bestehende Blöcke updaten
          await LandingpagesAPI.updateBlock(block.id, {
            position: block.position,
            layout: block.layout,
            preset: block.preset,
            content_json: block.content_json
          });
        }
      }
      // 4. Gelöschte Blöcke entfernen
      for (const dbBlock of dbBlocks) {
        if (!localBlockIds.includes(dbBlock.id)) {
          await LandingpagesAPI.deleteBlock(dbBlock.id);
        }
      }
      // 5. Reihenfolge aktualisieren
      await LandingpagesAPI.reorderBlocks(landingpageId, blocks.map((b, i) => ({ id: b.id, position: i })));
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setIsSaving(false);
      setIsAutoSaving(false);
    }
  };

  // Autosave-Logik anpassen
  React.useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      if (hasUnsavedChanges && !isSaving && !isAutoSaving) {
        setIsAutoSaving(true);
        saveBlocksToDatabase();
      }
    }, 90000);
    return () => {
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    };
  }, [hasUnsavedChanges, isSaving, isAutoSaving, blocks]);

  // Speichern-Button
  const handleSave = async () => {
    await saveBlocksToDatabase();
  };

  // Test & Vorschau: erst speichern, dann öffnen
  const handleTestPreview = async () => {
    await saveBlocksToDatabase();
    window.open(`/landingpage-preview/${landingpageId}`, '_blank');
  };

  // Handler für das Öffnen des Testimonial-Wizards aus der ConfigPanel
  const handleOpenTestimonialWizard = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      // Setze die initialen Daten basierend auf dem aktuellen Block
      setWizardInitialData({
        preset: block.content_json.preset || 'default',
        selectedTestimonials: block.content_json.selectedTestimonials || [],
        headline: block.content_json.headline || '',
        text: block.content_json.text || '',
        count: block.content_json.count || 3,
        showImage: block.content_json.showImage ?? true,
        showStars: block.content_json.showStars ?? true,
        showFirstname: block.content_json.showFirstname ?? false,
        showLastnameShort: block.content_json.showLastnameShort ?? false,
        showExcerpt: block.content_json.showExcerpt ?? true,
        showMemberSince: block.content_json.showMemberSince ?? false,
        showTags: block.content_json.showTags ?? false,
        showGoals: block.content_json.showGoals ?? false
      });
      setCurrentWizardBlockId(blockId);
      setShowTestimonialWizard(true);
    }
  };

  // Handler für Vollbild
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleUniversalWizardSave = (data: any) => {
    try {
      if (currentWizardBlockId && currentBlockType) {
        // Bestehenden Block überschreiben
        const updatedBlocks = blocks.map(block =>
          block.id === currentWizardBlockId 
            ? { 
                ...block, 
                content_json: data,
                preset: data.preset || 'default',
                updated_at: new Date().toISOString() 
              }
            : block
        )
        setBlocks(updatedBlocks)
        setHasUnsavedChanges(true)
      } else if (currentBlockType) {
        // Neuen Block erstellen
        const newBlock: LandingPageBlock = {
          id: `block-${Date.now()}`,
          landingpage_id: landingpageId,
          block_type: currentBlockType,
          position: pendingBlockPosition ?? blocks.length,
          content_json: data,
          layout: '1-col' as LayoutType,
          preset: data.preset || 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const updatedBlocks = [...blocks]
        if (pendingBlockPosition !== undefined) {
          updatedBlocks.splice(pendingBlockPosition, 0, newBlock)
          updatedBlocks.forEach((block, index) => { block.position = index })
        } else {
          updatedBlocks.push(newBlock)
        }
        setBlocks(updatedBlocks)
        setSelectedBlock(newBlock.id)
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('Error saving universal wizard block:', error)
    } finally {
      setShowBlockWizard(false)
      setCurrentBlockType(null)
      setWizardInitialData(null)
      setPendingBlockPosition(undefined)
      setCurrentWizardBlockId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Builder...</p>
        </div>
      </div>
    )
  }

  if (!landingpage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Fehler beim Laden der Landingpage</p>
          <button 
            onClick={loadLandingpage}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  const selectedBlockData = selectedBlock ? blocks.find(b => b.id === selectedBlock) || null : null

  return (
    <>
      <LandingpageNavigation landingpageId={landingpageId} landingpageTitle={landingpage?.title} currentPage="builder" />
      <Toolbar onSave={handleSave} onPreview={handleTestPreview} isSaving={isSaving} lastSavedAt={lastSavedAt} hasUnsavedChanges={hasUnsavedChanges} isAutoSaving={isAutoSaving} onTestPreview={handleTestPreview} />
      <DeviceBar
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        landingpage={landingpage}
        ciTemplates={ciTemplates}
        handleChangeCITemplate={handleChangeCITemplate}
      />
      <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
        <BuilderLayout 
          showPreview={showPreview} 
          previewDevice={previewDevice}
        >
          {/* Block Library (Left Sidebar) */}
          <BlockLibrary
            onAddBlock={handleAddBlock}
            selectedBlock={selectedBlock}
          />

          {/* Canvas (Center) */}
          <Canvas
            landingpage={landingpage}
            blocks={blocks}
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onReorderBlocks={handleReorderBlocks}
            onAddBlock={handleAddBlock}
            previewDevice={previewDevice}
            showPreview={showPreview}
            ciTemplate={ciTemplate}
          />

          {/* Configuration Panel (Right Sidebar) */}
          <ConfigPanel
            landingpage={landingpage}
            selectedBlock={selectedBlockData}
            onUpdateBlock={handleUpdateBlock}
            onUpdateLandingpage={handleUpdateLandingpage}
            ciTemplate={ciTemplate}
            onOpenTestimonialWizard={handleOpenTestimonialWizard}
          />
        </BuilderLayout>
      </DndProvider>
      
      {/* Universal Block Wizard */}
      <UniversalBlockWizard
        open={showBlockWizard}
        onClose={() => setShowBlockWizard(false)}
        onSave={handleUniversalWizardSave}
        blockType={currentBlockType || 'header'}
        initialData={wizardInitialData || {}}
        ciTemplate={ciTemplate}
      />
      
      {/* Legacy Testimonial Wizard */}
      <BlockWizardModal
        open={showTestimonialWizard}
        onClose={() => setShowTestimonialWizard(false)}
        onSave={handleTestimonialWizardSave}
        initialData={wizardInitialData || {}}
        ciTemplate={ciTemplate}
      />
    </>
  )
} 