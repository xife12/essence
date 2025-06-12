'use client'

import React, { useState } from 'react'
import { useDrag } from 'react-dnd'
import { 
  Type, 
  Image, 
  Video, 
  MousePointer, 
  FileText, 
  Star,
  DollarSign,
  Zap,
  Clock,
  Briefcase,
  HelpCircle,
  Mail,
  Users,
  BarChart3,
  Shield,
  Grid3X3,
  Rss,
  Minus,
  Calendar,
  Target,
  Megaphone,
  Crown,
  Plus,
  Search
} from 'lucide-react'
import { BlockType } from '../../../../../lib/api/landingpages'

interface BlockLibraryProps {
  onAddBlock: (blockType: BlockType, position?: number) => void
  selectedBlock: string | null
}

// Block categories and their types
const blockCategories = {
  content: {
    label: 'Inhalt',
    icon: Type,
    blocks: [
      { type: 'header' as BlockType, label: 'Header', icon: Crown, description: 'Hero-Bereiche mit Überschrift und CTA' },
      { type: 'text' as BlockType, label: 'Text', icon: Type, description: 'Richtext-Inhalte und Absätze' },
      { type: 'image' as BlockType, label: 'Bild', icon: Image, description: 'Einzelbilder und Galerien' },
      { type: 'video' as BlockType, label: 'Video', icon: Video, description: 'YouTube/Vimeo Videos' }
    ]
  },
  interactive: {
    label: 'Interaktiv',
    icon: MousePointer,
    blocks: [
      { type: 'button' as BlockType, label: 'Button', icon: MousePointer, description: 'Call-to-Action Buttons' },
      { type: 'form' as BlockType, label: 'Formular', icon: FileText, description: 'Lead-Formulare' },
      { type: 'icon' as BlockType, label: 'Icons', icon: Star, description: 'Icon-Grids mit Beschreibungen' },
      { type: 'testimonial' as BlockType, label: 'Testimonials', icon: Star, description: 'Kundenbewertungen' }
    ]
  },
  functional: {
    label: 'Funktional',
    icon: Zap,
    blocks: [
      { type: 'pricing' as BlockType, label: 'Preise', icon: DollarSign, description: 'Tarif-Vergleichstabellen' },
      { type: 'feature' as BlockType, label: 'Features', icon: Zap, description: 'USP und Vorteile' },
      { type: 'countdown' as BlockType, label: 'Countdown', icon: Clock, description: 'Timer für Aktionen' },
      { type: 'service' as BlockType, label: 'Services', icon: Briefcase, description: 'Dienstleistungs-Übersicht' },
      { type: 'faq' as BlockType, label: 'FAQ', icon: HelpCircle, description: 'Häufige Fragen' },
      { type: 'contact' as BlockType, label: 'Kontakt', icon: Mail, description: 'Kontaktinformationen' },
      { type: 'team' as BlockType, label: 'Team', icon: Users, description: 'Mitarbeiter-Präsentation' },
      { type: 'courseplan' as BlockType, label: 'Kursplan', icon: Calendar, description: 'Trainingsplan-Integration' }
    ]
  },
  advanced: {
    label: 'Erweitert',
    icon: BarChart3,
    blocks: [
      { type: 'statistics' as BlockType, label: 'Statistiken', icon: BarChart3, description: 'Erfolgszahlen animiert' },
      { type: 'trust_logos' as BlockType, label: 'Trust-Logos', icon: Shield, description: 'Partner-Logos' },
      { type: 'gallery' as BlockType, label: 'Galerie', icon: Grid3X3, description: 'Bild-Galerien mit Lightbox' },
      { type: 'blog_preview' as BlockType, label: 'Blog', icon: Rss, description: 'Content-Vorschau' },
      { type: 'spacer' as BlockType, label: 'Abstand', icon: Minus, description: 'Vertikaler Abstand' },
      { type: 'gamification' as BlockType, label: 'Gamification', icon: Target, description: 'Glücksrad & Belohnungen' },
      { type: 'cta' as BlockType, label: 'CTA-Bereich', icon: Megaphone, description: 'Call-to-Action Sektion' },
      { type: 'hero' as BlockType, label: 'Hero', icon: Crown, description: 'Große Hero-Bereiche' }
    ]
  }
}

// Draggable Block Item Component
function DraggableBlockItem({ 
  block, 
  onAddBlock 
}: { 
  block: { type: BlockType, label: string, icon: any, description: string }
  onAddBlock: (blockType: BlockType) => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: 'BLOCK',
    item: { blockType: block.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag as any}
      className={`w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors group cursor-move ${
        isDragging ? 'opacity-50 bg-blue-50' : ''
      }`}
      onClick={() => onAddBlock(block.type)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-white rounded-md shadow-sm border">
          <block.icon size={20} className="text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {block.label}
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            {block.description}
          </p>
          {isDragging && (
            <div className="mt-2 text-xs text-blue-600 font-medium">
              📦 Wird gezogen...
            </div>
          )}
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  )
}

export default function BlockLibrary({ onAddBlock, selectedBlock }: BlockLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string>('content')

  // Filter blocks based on search term
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return blockCategories

    const filtered: Partial<typeof blockCategories> = {}
    
    Object.entries(blockCategories).forEach(([categoryKey, category]) => {
      const filteredBlocks = category.blocks.filter(block =>
        block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (filteredBlocks.length > 0) {
        filtered[categoryKey as keyof typeof blockCategories] = {
          ...category,
          blocks: filteredBlocks
        }
      }
    })
    
    return filtered
  }, [searchTerm])

  const handleAddBlock = (blockType: BlockType) => {
    console.log('📱 BlockLibrary: Attempting to add block:', blockType)
    onAddBlock(blockType)
    console.log('📱 BlockLibrary: onAddBlock called')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Block-Bibliothek
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Blöcke suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Block Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(filteredCategories).map(([categoryKey, category]) => (
          <div key={categoryKey} className="border-b border-gray-200">
            
            {/* Category Header */}
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === categoryKey ? '' : categoryKey
              )}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <category.icon size={16} className="text-gray-600" />
                <span className="font-medium text-gray-900">{category.label}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {category.blocks.length}
                </span>
              </div>
              <Plus 
                size={16} 
                className={`text-gray-400 transition-transform ${
                  expandedCategory === categoryKey ? 'rotate-45' : ''
                }`} 
              />
            </button>

            {/* Category Blocks */}
            {expandedCategory === categoryKey && (
              <div className="bg-gray-50">
                {category.blocks.map((block) => (
                  <DraggableBlockItem
                    key={block.type}
                    block={block}
                    onAddBlock={handleAddBlock}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* No Results */}
        {Object.keys(filteredCategories).length === 0 && (
          <div className="p-8 text-center">
            <Search className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Blöcke gefunden
            </h3>
            <p className="text-gray-600">
              Versuchen Sie einen anderen Suchbegriff.
            </p>
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 mb-3">Häufig verwendet:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'header' as BlockType, label: 'Header', icon: Crown },
            { type: 'text' as BlockType, label: 'Text', icon: Type },
            { type: 'button' as BlockType, label: 'Button', icon: MousePointer },
            { type: 'form' as BlockType, label: 'Formular', icon: FileText }
          ].map((block) => (
            <button
              key={block.type}
              onClick={() => handleAddBlock(block.type)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-xs rounded-md border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <block.icon size={12} />
              {block.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 