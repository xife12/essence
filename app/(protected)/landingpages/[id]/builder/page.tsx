'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

// Import the sophisticated builder components
import BuilderLayout from './components/BuilderLayout'
import BlockLibrary from './components/BlockLibrary'
import Canvas from './components/Canvas'
import ConfigPanel from './components/ConfigPanel'

// Import API and types
import { LandingPage, LandingPageBlock, BlockType, LayoutType } from '../../../../lib/api/landingpages'

// Simple mobile detection
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function LandingPageBuilder() {
  const params = useParams()
  const landingpageId = params.id as string

  // State management
  const [landingpage, setLandingpage] = useState<LandingPage | null>(null)
  const [blocks, setBlocks] = useState<LandingPageBlock[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

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
        updated_at: new Date().toISOString()
      }
      
      setLandingpage(mockLandingpage)
      setBlocks([])
      
    } catch (error) {
      console.error('Error loading landingpage:', error)
    } finally {
      setLoading(false)
    }
  }

  // Block management functions
  const handleAddBlock = async (blockType: BlockType, position?: number) => {
    try {
      const newBlock: LandingPageBlock = {
        id: `block-${Date.now()}`,
        landingpage_id: landingpageId,
        block_type: blockType,
        position: position ?? blocks.length,
        content_json: {
          // Default content based on block type
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
        // Update positions of subsequent blocks
        updatedBlocks.forEach((block, index) => {
          block.position = index
        })
      } else {
        updatedBlocks.push(newBlock)
      }

      setBlocks(updatedBlocks)
      setSelectedBlock(newBlock.id)

      // TODO: Save to database
      // await LandingpagesAPI.addBlock(newBlock)
      
    } catch (error) {
      console.error('Error adding block:', error)
    }
  }

  const handleUpdateBlock = async (blockId: string, updates: Partial<LandingPageBlock>) => {
    try {
      const updatedBlocks = blocks.map(block =>
        block.id === blockId ? { ...block, ...updates, updated_at: new Date().toISOString() } : block
      )
      setBlocks(updatedBlocks)

      // TODO: Save to database
      // await LandingpagesAPI.updateBlock(blockId, updates)
      
    } catch (error) {
      console.error('Error updating block:', error)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const updatedBlocks = blocks.filter(block => block.id !== blockId)
      // Update positions
      updatedBlocks.forEach((block, index) => {
        block.position = index
      })
      
      setBlocks(updatedBlocks)
      
      if (selectedBlock === blockId) {
        setSelectedBlock(null)
      }

      // TODO: Delete from database
      // await LandingpagesAPI.deleteBlock(blockId)
      
    } catch (error) {
      console.error('Error deleting block:', error)
    }
  }

  const handleReorderBlocks = async (newBlocks: LandingPageBlock[]) => {
    try {
      // Update positions
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        position: index,
        updated_at: new Date().toISOString()
      }))
      
      setBlocks(updatedBlocks)

      // TODO: Save new order to database
      // await LandingpagesAPI.reorderBlocks(landingpageId, updatedBlocks)
      
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
        />

        {/* Configuration Panel (Right Sidebar) */}
        <ConfigPanel
          landingpage={landingpage}
          selectedBlock={selectedBlockData}
          onUpdateBlock={handleUpdateBlock}
          onUpdateLandingpage={handleUpdateLandingpage}
        />
      </BuilderLayout>
    </DndProvider>
  )
} 