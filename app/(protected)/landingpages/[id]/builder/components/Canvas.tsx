'use client'

import React from 'react'
import { useDrop, useDrag } from 'react-dnd'
import { Plus, Type, Minus, GripVertical } from 'lucide-react'
import { LandingPage, LandingPageBlock, BlockType } from '../../../../../lib/api/landingpages'

interface CanvasProps {
  landingpage: LandingPage
  blocks: LandingPageBlock[]
  selectedBlock: string | null
  onSelectBlock: (blockId: string | null) => void
  onUpdateBlock: (blockId: string, updates: Partial<LandingPageBlock>) => void
  onDeleteBlock: (blockId: string) => void
  onReorderBlocks: (newBlocks: LandingPageBlock[]) => void
  onAddBlock: (blockType: BlockType, position?: number) => void
  previewDevice: 'desktop' | 'tablet' | 'mobile'
  showPreview: boolean
}

// Simple block renderer for preview
function renderBlock(block: LandingPageBlock) {
  const content = block.content_json || {}
  
  switch (block.block_type) {
    case 'header':
      return (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {content.title || 'Neue Überschrift'}
          </h1>
          {content.subtitle && (
            <p className="text-xl text-gray-600">{content.subtitle}</p>
          )}
        </div>
      )
    case 'text':
      return (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {content.text || 'Fügen Sie hier Ihren Text hinzu...'}
          </p>
        </div>
      )
    case 'button':
      return (
        <div className="text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {content.text || 'Button Text'}
          </button>
        </div>
      )
    case 'image':
      return (
        <div className="text-center">
          <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">📷 Bild</span>
          </div>
        </div>
      )
    default:
      return (
        <div className="bg-gray-100 p-4 rounded text-center">
          <span className="text-gray-600">{block.block_type} Block</span>
        </div>
      )
  }
}

// Drop Zone Component for inserting blocks at specific positions
function DropZone({ 
  position, 
  onAddBlock,
  className = "" 
}: { 
  position: number
  onAddBlock: (blockType: BlockType, position: number) => void
  className?: string
}) {
  const [{ isOver }, drop] = useDrop({
    accept: 'BLOCK',
    drop: (item: { blockType: BlockType }) => {
      console.log('🎯 DropZone: Drop detected!', { blockType: item.blockType, position })
      onAddBlock(item.blockType, position)
      console.log('🎯 DropZone: onAddBlock called')
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  })

  return (
    <div 
      ref={drop as any}
      className={`relative transition-all duration-200 ${className} ${
        isOver 
          ? 'h-20 bg-blue-50 border-2 border-dashed border-blue-400' 
          : 'h-2 bg-transparent hover:h-12 hover:bg-gray-50 hover:border hover:border-dashed hover:border-gray-300'
      }`}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg">
            <Plus size={16} className="inline mr-2" />
            Block hier einfügen
          </div>
        </div>
      )}
      {!isOver && (
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="mx-auto w-40 h-10 flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded text-xs text-gray-500">
            <Plus size={16} className="mr-2" />
            Block hinzufügen
          </div>
        </div>
      )}
    </div>
  )
}

export default function Canvas({
  landingpage,
  blocks,
  selectedBlock,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onAddBlock,
  previewDevice,
  showPreview
}: CanvasProps) {
  
  // Main drop zone for adding blocks at the end
  const [{ isOver: isMainDropOver }, mainDrop] = useDrop({
    accept: 'BLOCK',
    drop: (item: { blockType: BlockType }, monitor) => {
      if (!monitor.didDrop()) {
        console.log('🎯 Main DropZone: Drop detected!', { blockType: item.blockType })
        onAddBlock(item.blockType)
        console.log('🎯 Main DropZone: onAddBlock called')
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }) && !monitor.didDrop()
    })
  })

  // Device-specific styling
  const getCanvasWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px'
      case 'tablet': return '768px' 
      case 'desktop': return '100%'
      default: return '100%'
    }
  }

  const getCanvasMaxWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px'
      case 'tablet': return '768px'
      case 'desktop': return '1200px'
      default: return '1200px'
    }
  }

  return (
    <div 
      ref={mainDrop as any}
      className={`flex-1 p-8 transition-all duration-200 ${
        isMainDropOver 
          ? 'bg-blue-50/30' 
          : 'bg-gray-50'
      }`}
    >
      {/* Drop indicator overlay - Nur subtile Hintergrundänderung */}
      {isMainDropOver && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-none z-10">
          <Plus size={16} className="inline mr-2" />
          Block am Ende hinzufügen
        </div>
      )}

      {/* Device Frame (for mobile/tablet preview) */}
      <div className="min-h-full flex justify-center py-8 px-4">
        <div 
          className="bg-white shadow-lg transition-all duration-300"
          style={{ 
            width: getCanvasWidth(),
            maxWidth: getCanvasMaxWidth(),
            minHeight: 'calc(100vh - 4rem)'
          }}
        >
          
          {/* Landingpage Header Info */}
          {!showPreview && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{landingpage.title}</h3>
                  <p className="text-sm text-gray-600">/{landingpage.slug}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {blocks.length} Block{blocks.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* Blocks */}
          <div className="relative">
            {blocks.length === 0 ? (
              
              // Empty State
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Landingpage ist leer
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Fügen Sie Blöcke aus der Bibliothek hinzu, um Ihre Landingpage zu erstellen.
                  Ziehen Sie einfach einen Block hierher oder klicken Sie auf "Block hinzufügen".
                </p>
                <button
                  onClick={() => {
                    console.log('🚀 Empty State Button: Clicked to add header block')
                    onAddBlock('header')
                    console.log('🚀 Empty State Button: onAddBlock called')
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  Ersten Block hinzufügen
                </button>
              </div>
              
            ) : (
              // Blocks with drop zones
              <div className="space-y-0 p-4">
                {/* Drop zone before first block */}
                <DropZone 
                  position={0} 
                  onAddBlock={onAddBlock}
                  className="mb-4"
                />
                
                {blocks.map((block, index) => (
                  <React.Fragment key={block.id}>
                    {/* Block */}
                    <DraggableBlock
                      block={block}
                      index={index}
                      selectedBlock={selectedBlock}
                      onSelectBlock={onSelectBlock}
                      onDeleteBlock={onDeleteBlock}
                      onMoveBlock={(dragIndex, dropIndex) => {
                        const newBlocks = [...blocks]
                        const [movedBlock] = newBlocks.splice(dragIndex, 1)
                        newBlocks.splice(dropIndex, 0, movedBlock)
                        onReorderBlocks(newBlocks)
                      }}
                    />
                    
                    {/* Drop zone after each block */}
                    <DropZone 
                      position={index + 1} 
                      onAddBlock={onAddBlock}
                      className="mb-4"
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Block Renderer Component
function BlockRenderer({ 
  block, 
  isPreview, 
  onUpdate 
}: { 
  block: LandingPageBlock
  isPreview: boolean
  onUpdate: (updates: Partial<LandingPageBlock>) => void
}) {
  
  const getBlockContent = () => {
    const content = block.content_json

    switch (block.block_type) {
      case 'header':
        return (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {content.headline || 'Neue Überschrift'}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {content.subheadline || 'Beschreibung hinzufügen...'}
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {content.button_text || 'Jetzt starten'}
            </button>
          </div>
        )

      case 'text':
        return (
          <div className="py-8 px-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: content.content || '<p>Fügen Sie hier Ihren Text hinzu...</p>' 
              }}
            />
          </div>
        )

      case 'image':
        return (
          <div className="py-8 px-8">
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🖼️</div>
                <p>Bild hochladen</p>
              </div>
            </div>
            {content.caption && (
              <p className="text-center text-gray-600 mt-4">{content.caption}</p>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="py-8 px-8">
            <div className="bg-gray-900 h-64 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">▶️</div>
                <p>Video einbetten</p>
              </div>
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="py-8 px-8 text-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {content.text || 'Button Text'}
            </button>
          </div>
        )

      case 'form':
        return (
          <div className="py-12 px-8 bg-gray-50">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8">
                {content.title || 'Kontakt aufnehmen'}
              </h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  disabled={isPreview}
                />
                <input 
                  type="email" 
                  placeholder="E-Mail" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  disabled={isPreview}
                />
                <textarea 
                  placeholder="Nachricht" 
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  disabled={isPreview}
                />
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  {content.submit_text || 'Absenden'}
                </button>
              </div>
            </div>
          </div>
        )

      case 'testimonial':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">Was unsere Kunden sagen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="ml-4">
                      <h4 className="font-semibold">Kunde {i}</h4>
                      <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    "Fantastisches Studio mit super Betreuung!"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pricing':
        return (
          <div className="py-12 px-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-center mb-12">Unsere Preise</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {['Basic', 'Premium', 'VIP'].map((plan, i) => (
                <div key={plan} className={`bg-white p-8 rounded-lg shadow-md ${i === 1 ? 'ring-2 ring-blue-500' : ''}`}>
                  <h4 className="text-xl font-bold mb-4">{plan}</h4>
                  <div className="text-3xl font-bold mb-6">
                    {(30 + i * 20).toFixed(0)}€<span className="text-sm text-gray-600">/Monat</span>
                  </div>
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center">✅ Feature 1</li>
                    <li className="flex items-center">✅ Feature 2</li>
                    <li className="flex items-center">✅ Feature 3</li>
                  </ul>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Wählen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'spacer':
        return (
          <div 
            className="bg-transparent"
            style={{ height: `${content.height || 50}px` }}
          >
            {!isPreview && (
              <div className="h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                Abstand ({content.height || 50}px)
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="py-8 px-8 bg-gray-100 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {block.block_type.charAt(0).toUpperCase() + block.block_type.slice(1)}-Block
            </h3>
            <p className="text-gray-600">
              Dieser Block-Typ wird noch implementiert.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="relative">
      {getBlockContent()}
    </div>
  )
}

// Draggable Block Component
function DraggableBlock({
  block,
  index,
  selectedBlock,
  onSelectBlock,
  onDeleteBlock,
  onMoveBlock
}: {
  block: LandingPageBlock
  index: number
  selectedBlock: string | null
  onSelectBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  onMoveBlock: (dragIndex: number, dropIndex: number) => void
}) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'EXISTING_BLOCK',
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver }, drop] = useDrop({
    accept: 'EXISTING_BLOCK',
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        onMoveBlock(item.index, index)
        item.index = index
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  return (
    <div 
      ref={(node) => {
        dragPreview(node)
        drop(node)
      }}
      className={`relative group transition-all duration-200 mb-4 ${
        selectedBlock === block.id 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-t-4 border-blue-500' : ''}`}
      onClick={() => onSelectBlock(block.id)}
    >
      {/* Block Selection Indicator */}
      {selectedBlock === block.id && (
        <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md z-10">
          {block.block_type}
        </div>
      )}
      
      {/* Drag Handle */}
      <div 
        ref={drag as any}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
        title="Block verschieben"
      >
        <div className="bg-gray-700 text-white p-1 rounded shadow-lg">
          <GripVertical size={16} />
        </div>
      </div>
      
      {/* Block Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[100px]">
        {renderBlock(block)}
      </div>
      
      {/* Block Controls (on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectBlock(block.id)
            }}
            className="p-1 bg-gray-700 text-white rounded hover:bg-gray-800"
            title="Bearbeiten"
          >
            <Type size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteBlock(block.id)
            }}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            title="Löschen"
          >
            <Minus size={12} />
          </button>
        </div>
      </div>
    </div>
  )
} 