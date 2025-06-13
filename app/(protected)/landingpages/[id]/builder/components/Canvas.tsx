'use client'

import React from 'react'
import { useDrop, useDrag } from 'react-dnd'
import { Plus, Type, Minus, GripVertical } from 'lucide-react'
import { LandingPage, LandingPageBlock, BlockType, PresetType } from '../../../../../lib/api/landingpages'
import { CITemplate } from '../../../../../lib/api/ci-templates'

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
  ciTemplate: CITemplate | null
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
  showPreview,
  ciTemplate
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
                      ciTemplate={ciTemplate}
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
  onUpdate,
  ciTemplate
}: { 
  block: LandingPageBlock
  isPreview: boolean
  onUpdate: (updates: Partial<LandingPageBlock>) => void
  ciTemplate: CITemplate | null
}) {
  
  const getBlockContent = () => {
    const content = block.content_json

    switch (block.block_type) {
      case 'header':
        // CI-Styles
        const headerBg = ciTemplate?.primary_color || '#2563eb';
        const textColor = ciTemplate?.text_color || '#fff';
        const fontFamily = ciTemplate?.font_headline || ciTemplate?.font_family || 'inherit';
        const headerAccent = ciTemplate?.accent_color || '#a21caf';
        return (
          <div style={{ background: headerBg, color: textColor, fontFamily }} className="py-20 px-8 text-center transition-colors duration-300">
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily }}>{content.headline || 'Neue Überschrift'}</h1>
            <p className="text-xl mb-8 opacity-90" style={{ fontFamily }}>{content.subheadline || 'Beschreibung hinzufügen...'}</p>
            <button style={{ background: headerAccent, color: '#fff', borderRadius: ciTemplate?.button_style?.radius || '6px', padding: ciTemplate?.button_style?.padding || '12px 24px' }} className="font-semibold hover:opacity-90 transition-colors">
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
        // === NEUE LOGIK: Dynamische Testimonial-Preview mit echten Daten ===
        const config = content;
        
        // Debug: Log content to see what's available
        console.log('Testimonial block content:', content);
        
        return (
          <TestimonialDataLoader content={content}>
            {(testimonialData) => {
              const accentTestimonial = ciTemplate?.accent_color || '#a21caf';
              const cardBgTestimonial = ciTemplate?.background_color || '#fff';
              const textColorTestimonial = ciTemplate?.text_color || '#222';
              const starColor = ciTemplate?.accent_color || '#fbbf24';
              const fontFamilyTestimonial = ciTemplate?.font_family || 'inherit';
              
              // Anzeigeoptionen aus BlockWizardModal
              const showName = (config.showFirstname || config.showLastname) || (config.show_name ?? true);
              const showStars = config.showStars ?? (config.show_stars ?? true);
              const showFirstname = config.showFirstname ?? (config.show_firstname ?? false);
              const showLastnameShort = config.showLastnameShort ?? (config.show_name_short ?? false);
              const showText = config.showExcerpt ?? (config.show_text_excerpt ?? true);
              const showImage = config.showImage ?? (config.show_image ?? true);
              const showMemberSince = config.showMemberSince ?? false;
              const showTags = config.showTags ?? false;
              const showGoals = config.showGoals ?? false;
              
              // Name-Logik
              const getName = (t) => {
                if (!t?.name) return '';
                if (showFirstname && !showLastnameShort) return t.name.split(' ')[0];
                if (showLastnameShort) {
                  const parts = t.name.split(' ');
                  return parts[0] + (parts[1] ? ` ${parts[1][0]}.` : '');
                }
                return t.name;
              };
              
              // Text-Logik
              const getText = (t) => showText ? (t.text?.length > 80 ? t.text.slice(0, 80) + '…' : t.text) : '';
              
              // Sterne
              const renderStars = (count) => (
                <span style={{ color: starColor, fontSize: 16 }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
              );
              
              // Badge-Komponenten
              const renderGoalBadge = (goal) => (
                <span key={goal} className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mt-1">{goal}</span>
              );
              
              const renderTagBadge = (tag) => (
                <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mr-1 mt-1">{tag}</span>
              );
              
              const renderGoalsAndTags = (t) => (
                <div className="mt-2">
                  {showGoals && t.goals && t.goals.length > 0 && (
                    <div className="flex flex-wrap">
                      {t.goals.slice(0, 2).map(renderGoalBadge)}
                    </div>
                  )}
                  {showTags && t.tags && t.tags.length > 0 && (
                    <div className="flex flex-wrap">
                      {t.tags.slice(0, 2).map(renderTagBadge)}
                  </div>
                  )}
                </div>
              );
              
              // Bild-Komponente
              const renderImage = (t, size = 'medium', layout = 'default') => {
                if (!showImage) return null;
                
                const sizeClasses = {
                  small: 'w-10 h-10',
                  medium: 'w-14 h-14', 
                  large: 'w-16 h-16'
                };
                
                const centerClass = layout === 'minimal' ? '' : 'mx-auto';
                const initials = t.name ? t.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                
                console.log('🖼️ Rendering image for testimonial:', t.name, 'hasImage:', t.hasImage, 'image:', t.image);
                
                if (t.hasImage && t.image) {
                  return (
                    <div className={`${sizeClasses[size]} rounded-full mb-2 overflow-hidden bg-gray-200 ${centerClass}`}>
                      <img 
                        src={t.image} 
                        alt={t.name || 'Testimonial'}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Image loaded successfully:', t.image)}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', t.image);
                          const target = e.currentTarget;
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-600 font-medium bg-gray-300"><span class="text-sm">${initials}</span></div>`;
                          }
                        }}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className={`${sizeClasses[size]} rounded-full bg-gray-300 mb-2 flex items-center justify-center text-gray-600 font-medium ${centerClass}`}>
                      <span className="text-sm">{initials}</span>
                    </div>
                  );
                }
              };
              
              // Header-Bereich
              const renderHeader = () => {
                if (!config.headline && !config.text) return null;
                
                return (
                  <div className="text-center mb-12">
                    {config.headline && (
                      <h2 className="text-3xl font-bold mb-4" style={{ color: textColorTestimonial }}>
                        {config.headline}
                      </h2>
                    )}
                    {config.text && (
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {config.text}
                      </p>
                    )}
                  </div>
                );
              };
              
              // Fallback wenn keine Testimonials vorhanden
              if (testimonialData.length === 0) {
                return (
                  <div className="py-12 px-8 text-center text-gray-500">
                    {renderHeader()}
                    <p className="text-sm">Keine Testimonials verfügbar</p>
                  </div>
                );
              }

              // Layout-Implementierungen basierend auf dem Preset
              const preset = config.preset || 'default';
              
              console.log('Using testimonial preset:', preset, 'with config:', config);
              console.log('Testimonial data:', testimonialData);
              
              switch (preset) {
                case 'classic':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      <div className="max-w-6xl mx-auto">
                        {/* Desktop Layout: Zwei-Spalten */}
                        <div className="hidden lg:grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                          {/* Text-Bereich links */}
                          <div className="order-2 lg:order-1">
                            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: textColorTestimonial, fontFamily: fontFamilyTestimonial }}>
                              {config.headline || 'See What Our Customers Words'}
                            </h3>
                            <div className="mb-6">
                              <p className="text-base md:text-lg text-gray-700 italic mb-4 leading-relaxed">
                                "{testimonialData[0]?.text || 'Excellent service and great experience!'}"
                              </p>
                              <div className="flex items-center gap-3">
                                {renderImage(testimonialData[0] || {}, 'medium')}
                                <div>
                                  <div className="font-semibold text-sm" style={{ color: textColorTestimonial }}>
                                    {getName(testimonialData[0] || {})}
                                  </div>
                                  {showStars && (
                                    <div className="mt-1">{renderStars(testimonialData[0]?.rating || 5)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Testimonials rechts */}
                          <div className="order-1 lg:order-2 space-y-4 md:space-y-6">
                            {testimonialData.slice(0, 3).map((t, i) => (
                              <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-start gap-3 md:gap-4">
                                  {renderImage(t, 'medium')}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-semibold text-sm truncate" style={{ color: textColorTestimonial }}>{getName(t)}</span>
                                      {showMemberSince && (
                                        <span className="text-xs text-gray-500 hidden sm:inline">• {t.memberSince}</span>
                                      )}
                                    </div>
                                    {showStars && (
                                      <div className="mb-2">{renderStars(t.rating)}</div>
                                    )}
                                    <p className="text-sm text-gray-600 line-clamp-2">{getText(t)}</p>
                                    {renderGoalsAndTags(t)}
                                  </div>
                                </div>
                </div>
              ))}
            </div>
          </div>

                        {/* Mobile Layout: Dominantes Testimonial + Karussell */}
                        <div className="block lg:hidden">
                          {/* Header */}
                          {config.headline && (
                            <h3 className="text-xl font-bold mb-6 text-center" style={{ color: textColorTestimonial, fontFamily: fontFamilyTestimonial }}>
                              {config.headline}
                            </h3>
                          )}
                          
                          {/* Dominantes Testimonial */}
                          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-l-4" style={{ borderLeftColor: accentTestimonial }}>
                            <div className="text-center">
                              {renderImage(testimonialData[0] || {}, 'large')}
                              <h4 className="font-bold text-lg mb-2" style={{ color: textColorTestimonial }}>
                                {getName(testimonialData[0] || {})}
                              </h4>
                              {showStars && (
                                <div className="mb-4 flex justify-center">{renderStars(testimonialData[0]?.rating || 5)}</div>
                              )}
                              <p className="text-base text-gray-700 italic leading-relaxed">
                                "{testimonialData[0]?.text || 'Excellent service and great experience!'}"
                              </p>
                              {renderGoalsAndTags(testimonialData[0] || {})}
                            </div>
                          </div>

                          {/* Karussell mit anderen Testimonials */}
                          {testimonialData.length > 1 && (
                            <div className="relative">
                              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-manipulation">
                                {testimonialData.slice(1).map((t, i) => (
                                  <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-w-[280px] snap-start">
                                    <div className="flex items-start gap-3">
                                      {renderImage(t, 'medium')}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm mb-1" style={{ color: textColorTestimonial }}>{getName(t)}</div>
                                        {showStars && (
                                          <div className="mb-2">{renderStars(t.rating)}</div>
                                        )}
                                        <p className="text-sm text-gray-600 line-clamp-3">{getText(t)}</p>
                                        {renderGoalsAndTags(t)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Scroll-Indikatoren */}
                              <div className="flex justify-center gap-2 mt-4">
                                {testimonialData.slice(1).map((_, i) => (
                                  <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                case 'grid':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-6xl mx-auto">
                        {/* Desktop Grid Layout */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {testimonialData.slice(0, 6).map((t, i) => (
                            <div key={i} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="text-center">
                                {renderImage(t, 'large')}
                                <h4 className="font-semibold mb-1 text-sm md:text-base truncate" style={{ color: textColorTestimonial }}>{getName(t)}</h4>
                                {showStars && (
                                  <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                                )}
                                <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-3">{getText(t)}</p>
                                {renderGoalsAndTags(t)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mobile Karussell */}
                        <div className="block md:hidden">
                          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-manipulation">
                            {testimonialData.slice(0, 6).map((t, i) => (
                              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[260px] snap-start">
                                <div className="text-center">
                                  {renderImage(t, 'large')}
                                  <h4 className="font-semibold mb-1 text-sm truncate" style={{ color: textColorTestimonial }}>{getName(t)}</h4>
                                  {showStars && (
                                    <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                                  )}
                                  <p className="text-xs text-gray-600 mb-4 line-clamp-3">{getText(t)}</p>
                                  {renderGoalsAndTags(t)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Scroll-Indikatoren */}
                          <div className="flex justify-center gap-2 mt-4">
                            {testimonialData.slice(0, 6).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                case 'carousel':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-4xl mx-auto">
                        <div className="relative">
                          <div className="flex items-center justify-center gap-4 md:gap-8">
                            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 touch-manipulation">
                              <span className="text-lg md:text-xl">‹</span>
                            </button>
                            
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-2xl text-center">
                              {renderImage(testimonialData[0] || {}, 'large')}
                              <h4 className="font-bold text-base md:text-lg mb-2 truncate" style={{ color: textColorTestimonial }}>
                                {getName(testimonialData[0] || {})}
                              </h4>
                              {showStars && (
                                <div className="mb-4 flex justify-center">{renderStars(testimonialData[0]?.rating || 5)}</div>
                              )}
                              <p className="text-sm md:text-base text-gray-600 italic mb-4 line-clamp-4">
                                "{testimonialData[0]?.text || 'Excellent service and great value for money!'}"
                              </p>
                              {renderGoalsAndTags(testimonialData[0] || {})}
                            </div>
                            
                            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-600 touch-manipulation">
                              <span className="text-lg md:text-xl">›</span>
                            </button>
                          </div>
                          
                          <div className="flex justify-center gap-2 mt-6">
                            {[0, 1, 2].map(i => (
                              <div key={i} className={`w-2 h-2 rounded-full touch-manipulation ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                case 'minimal':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-5xl mx-auto">
                        <div className="space-y-6 md:space-y-8">
                          {testimonialData.slice(0, 3).map((t, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 p-4 md:p-6 bg-gray-50 rounded-lg">
                              {renderImage(t, 'large', 'minimal')}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  {showStars && <div className="order-2 sm:order-1">{renderStars(t.rating)}</div>}
                                  {showMemberSince && <span className="text-sm text-gray-500 order-3">• {t.memberSince}</span>}
                                </div>
                                <p className="text-sm md:text-base text-gray-700 mb-2 line-clamp-3">"{t.text}"</p>
                                <div className="font-semibold text-sm md:text-base" style={{ color: textColorTestimonial }}>{getName(t)}</div>
                                {renderGoalsAndTags(t)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );

                case 'cards':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-6xl mx-auto">
                        {/* Desktop Layout */}
                        <div className="hidden md:flex md:flex-col sm:flex-row gap-4 md:gap-6 justify-center flex-wrap">
                          {testimonialData.slice(0, 3).map((t, i) => (
                            <div key={i} className="bg-white p-4 md:p-6 rounded-2xl shadow-lg w-full sm:max-w-xs text-center border-t-4" style={{ borderTopColor: accentTestimonial }}>
                              {renderImage(t, 'large')}
                              <h4 className="font-bold mb-2 text-sm md:text-base truncate" style={{ color: textColorTestimonial }}>{getName(t)}</h4>
                              {showStars && (
                                <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                              )}
                              <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-3">"{getText(t)}"</p>
                              {renderGoalsAndTags(t)}
                            </div>
                          ))}
                        </div>

                        {/* Mobile Karussell */}
                        <div className="block md:hidden">
                          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-manipulation">
                            {testimonialData.slice(0, 3).map((t, i) => (
                              <div key={i} className="bg-white p-4 rounded-2xl shadow-lg min-w-[280px] text-center border-t-4 snap-start" style={{ borderTopColor: accentTestimonial }}>
                                {renderImage(t, 'large')}
                                <h4 className="font-bold mb-2 text-sm truncate" style={{ color: textColorTestimonial }}>{getName(t)}</h4>
                                {showStars && (
                                  <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                                )}
                                <p className="text-xs text-gray-600 mb-4 line-clamp-3">"{getText(t)}"</p>
                                {renderGoalsAndTags(t)}
                              </div>
                            ))}
                          </div>
                          
                          {/* Scroll-Indikatoren */}
                          <div className="flex justify-center gap-2 mt-4">
                            {testimonialData.slice(0, 3).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                case 'centered':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl" style={{ borderLeft: `4px solid ${accentTestimonial}` }}>
                          {renderImage(testimonialData[0] || {}, 'large')}
                          <h4 className="font-bold text-lg md:text-xl mb-2 truncate" style={{ color: textColorTestimonial }}>
                            {getName(testimonialData[0] || {})}
                          </h4>
                          {showStars && (
                            <div className="mb-4 flex justify-center">{renderStars(testimonialData[0]?.rating || 5)}</div>
                          )}
                          <p className="text-base md:text-lg text-gray-600 italic mb-4 line-clamp-4">
                            "{testimonialData[0]?.text || 'A fantastic experience from start to finish!'}"
                          </p>
                          {renderGoalsAndTags(testimonialData[0] || {})}
                        </div>
                      </div>
                    </div>
                  );

                case 'compact':
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-6xl mx-auto">
                        {/* Desktop Grid Layout */}
                        <div className="hidden md:grid md:grid-cols-4 gap-3 md:gap-4">
                          {testimonialData.slice(0, 4).map((t, i) => (
                            <div key={i} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                              {renderImage(t, 'medium')}
                              <div className="font-semibold text-xs md:text-sm mb-1 truncate" style={{ color: textColorTestimonial }}>{getName(t)}</div>
                              {showStars && (
                                <div className="mb-2 flex justify-center">{renderStars(t.rating)}</div>
                              )}
                              <p className="text-xs text-gray-600 line-clamp-2">{getText(t)}</p>
                              {renderGoalsAndTags(t)}
                            </div>
                          ))}
                        </div>

                        {/* Mobile Karussell */}
                        <div className="block md:hidden">
                          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-manipulation">
                            {testimonialData.slice(0, 4).map((t, i) => (
                              <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center min-w-[200px] snap-start">
                                {renderImage(t, 'medium')}
                                <div className="font-semibold text-xs mb-1 truncate" style={{ color: textColorTestimonial }}>{getName(t)}</div>
                                {showStars && (
                                  <div className="mb-2 flex justify-center">{renderStars(t.rating)}</div>
                                )}
                                <p className="text-xs text-gray-600 line-clamp-2">{getText(t)}</p>
                                {renderGoalsAndTags(t)}
                              </div>
                            ))}
                          </div>
                          
                          {/* Scroll-Indikatoren */}
                          <div className="flex justify-center gap-2 mt-4">
                            {testimonialData.slice(0, 4).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                case 'default':
                default:
                  return (
                    <div className="py-8 md:py-12 px-4 md:px-8">
                      {renderHeader()}
                      <div className="max-w-5xl mx-auto">
                        {/* Desktop Layout */}
                        <div className="hidden md:flex md:flex-col sm:flex-row gap-4 md:gap-6 justify-center flex-wrap">
                          {testimonialData.slice(0, 3).map((t, i) => (
                            <div key={i} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 w-full sm:max-w-sm text-center">
                              {renderImage(t, 'medium')}
                              <h4 className="font-semibold mb-1 text-sm md:text-base truncate" style={{ color: textColorTestimonial }}>{getName(t)}</h4>
                              {showStars && (
                                <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                              )}
                              <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-3">"{getText(t)}"</p>
                              {renderGoalsAndTags(t)}
                            </div>
                          ))}
                        </div>

                        {/* Mobile Karussell */}
                        <div className="block md:hidden">
                          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide touch-manipulation">
                            {testimonialData.slice(0, 3).map((t, i) => (
                              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[260px] text-center snap-start">
                                {renderImage(t, 'medium')}
                                <h4 className="font-semibold mb-1 text-sm truncate" style={{ color: textColorTestimonial }}>{getName(t)}</h4>
                                {showStars && (
                                  <div className="mb-3 flex justify-center">{renderStars(t.rating)}</div>
                                )}
                                <p className="text-xs text-gray-600 mb-3 line-clamp-3">"{getText(t)}"</p>
                                {renderGoalsAndTags(t)}
                              </div>
                            ))}
                          </div>
                          
                          {/* Scroll-Indikatoren */}
                          <div className="flex justify-center gap-2 mt-4">
                            {testimonialData.slice(0, 3).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
              }
            }}
          </TestimonialDataLoader>
        );

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

      case 'feature':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Unsere Features'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {(content.features || [
                { icon: '⚡', title: 'Feature 1', description: 'Beschreibung des ersten Features' },
                { icon: '🎯', title: 'Feature 2', description: 'Beschreibung des zweiten Features' },
                { icon: '🚀', title: 'Feature 3', description: 'Beschreibung des dritten Features' }
              ]).map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'statistics':
        return (
          <div className="py-12 px-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Unsere Erfolge'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {(content.stats || [
                { value: '1000+', label: 'Zufriedene Kunden' },
                { value: '99%', label: 'Erfolgsrate' },
                { value: '24/7', label: 'Support' },
                { value: '5★', label: 'Bewertung' }
              ]).map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'faq':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Häufige Fragen'}</h3>
            <div className="max-w-3xl mx-auto space-y-4">
              {(content.faqs || [
                { question: 'Wie funktioniert das?', answer: 'Es ist ganz einfach...' },
                { question: 'Was kostet es?', answer: 'Unsere Preise sind fair...' },
                { question: 'Gibt es Support?', answer: 'Ja, 24/7 Support...' }
              ]).map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">{faq.question}</h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'team':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Unser Team'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {(content.members || [
                { name: 'Max Mustermann', role: 'Geschäftsführer', image: '' },
                { name: 'Anna Schmidt', role: 'Trainerin', image: '' },
                { name: 'Tom Meyer', role: 'Berater', image: '' }
              ]).map((member, i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-1">{member.name}</h4>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'contact':
        return (
          <div className="py-12 px-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Kontakt'}</h3>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Kontaktinformationen</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📍</span>
                    <span>{content.address || 'Musterstraße 123, 12345 Musterstadt'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📞</span>
                    <span>{content.phone || '+49 123 456789'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✉️</span>
                    <span>{content.email || 'info@studio.de'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-300 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">🗺️ Karte</span>
              </div>
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Galerie'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">🖼️</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'countdown':
        return (
          <div className="py-12 px-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-2xl font-bold mb-8">{content.headline || 'Limitiertes Angebot'}</h3>
            <div className="flex justify-center gap-8 mb-8">
              {['Tage', 'Stunden', 'Minuten', 'Sekunden'].map((unit, i) => (
                <div key={unit} className="text-center">
                  <div className="text-4xl font-bold mb-2">{[10, 12, 30, 45][i]}</div>
                  <div className="text-sm">{unit}</div>
                </div>
              ))}
            </div>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
              {content.buttonText || 'Jetzt zugreifen'}
            </button>
          </div>
        )

      case 'trust_logos':
        return (
          <div className="py-12 px-8 bg-gray-50">
            <h3 className="text-lg font-semibold text-center mb-8 text-gray-600">
              {content.headline || 'Vertrauen Sie auf unsere Partner'}
            </h3>
            <div className="flex justify-center items-center gap-8 flex-wrap max-w-4xl mx-auto">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm w-32 h-16 flex items-center justify-center">
                  <span className="text-gray-400">Logo {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'hero':
        const heroBg = ciTemplate?.primary_color || '#2563eb'
        const heroAccent = ciTemplate?.accent_color || '#a21caf'
        return (
          <div style={{ background: heroBg, color: '#fff' }} className="py-20 px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">{content.headline || 'Willkommen'}</h1>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {content.subheadline || 'Entdecken Sie neue Möglichkeiten und erreichen Sie Ihre Ziele'}
            </p>
            <div className="flex gap-4 justify-center">
              <button style={{ background: heroAccent }} className="px-8 py-4 rounded-lg font-semibold text-white">
                {content.primaryButton || 'Jetzt starten'}
              </button>
              <button className="px-8 py-4 rounded-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors">
                {content.secondaryButton || 'Mehr erfahren'}
              </button>
            </div>
          </div>
        )

      case 'cta':
        return (
          <div className="py-16 px-8 text-center" style={{ backgroundColor: ciTemplate?.accent_color || '#a21caf', color: '#fff' }}>
            <h3 className="text-3xl font-bold mb-4">{content.headline || 'Bereit durchzustarten?'}</h3>
            <p className="text-lg mb-8 opacity-90">
              {content.text || 'Werden Sie noch heute Teil unserer Community und erreichen Sie Ihre Fitnessziele.'}
            </p>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {content.buttonText || 'Jetzt Mitglied werden'}
            </button>
          </div>
        )

      case 'service':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Unsere Services'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {(content.services || [
                { name: 'Personal Training', description: 'Individuelles 1:1 Training', price: 'ab 60€' },
                { name: 'Gruppenkurse', description: 'Fitness in der Gruppe', price: 'ab 15€' },
                { name: 'Ernährungsberatung', description: 'Professionelle Beratung', price: 'ab 40€' }
              ]).map((service, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold mb-3">{service.name}</h4>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-xl font-bold text-blue-600">{service.price}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'icon':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Warum wir?'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {(content.icons || [
                { icon: '💪', title: 'Stark', description: 'Krafttraining' },
                { icon: '🏃', title: 'Ausdauer', description: 'Cardio-Training' },
                { icon: '🧘', title: 'Balance', description: 'Yoga & Pilates' },
                { icon: '🎯', title: 'Zielgerichtet', description: 'Persönlicher Plan' }
              ]).map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'courseplan':
        return (
          <div className="py-12 px-8 bg-gray-50">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Kursplan'}</h3>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="grid grid-cols-8 bg-gray-100">
                  <div className="p-3 font-semibold">Zeit</div>
                  {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                    <div key={day} className="p-3 font-semibold text-center">{day}</div>
                  ))}
                </div>
                {['09:00', '10:00', '11:00', '18:00', '19:00'].map(time => (
                  <div key={time} className="grid grid-cols-8 border-t">
                    <div className="p-3 font-medium">{time}</div>
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="p-3 text-center border-l">
                        {Math.random() > 0.6 ? 'Yoga' : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'gamification':
        return (
          <div className="py-12 px-8 text-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <h3 className="text-2xl font-bold mb-8">{content.headline || 'Glücksrad drehen'}</h3>
            <div className="max-w-md mx-auto">
              <div className="w-64 h-64 mx-auto mb-8 bg-white rounded-full flex items-center justify-center">
                <div className="text-6xl">🎯</div>
              </div>
              <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg">
                {content.buttonText || 'Jetzt drehen!'}
              </button>
              <p className="text-sm mt-4 opacity-90">
                Gewinne tolle Preise und Rabatte!
              </p>
            </div>
          </div>
        )

      case 'blog_preview':
        return (
          <div className="py-12 px-8">
            <h3 className="text-2xl font-bold text-center mb-12">{content.headline || 'Neueste Artikel'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">📰</span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold mb-3">Artikel {i + 1}</h4>
                    <p className="text-gray-600 mb-4">Kurze Beschreibung des Artikels...</p>
                    <a href="#" className="text-blue-600 font-medium">Weiterlesen →</a>
                  </div>
                </div>
              ))}
            </div>
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
  onMoveBlock,
  ciTemplate
}: {
  block: LandingPageBlock
  index: number
  selectedBlock: string | null
  onSelectBlock: (blockId: string) => void
  onDeleteBlock: (blockId: string) => void
  onMoveBlock: (dragIndex: number, dropIndex: number) => void
  ciTemplate: CITemplate | null
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
        <BlockRenderer block={block} isPreview={false} onUpdate={() => {}} ciTemplate={ciTemplate} />
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

// Testimonial Data Loader Component
function TestimonialDataLoader({ content, children }: { content: any, children: (testimonialData: any[]) => React.ReactNode }) {
  const [realTestimonials, setRealTestimonials] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (content.selectedTestimonials && content.selectedTestimonials.length > 0) {
      setLoading(true);
      // Dynamisches Import um Supabase nur bei Bedarf zu laden
      import('../../../../../lib/supabaseClient').then(({ default: supabase }) => {
        supabase
          .from('testimonials')
          .select(`
            *,
            file_asset:file_asset_id (
              id,
              filename,
              file_url
            )
          `)
          .in('id', content.selectedTestimonials)
          .eq('is_active', true)
          .then(({ data, error }) => {
            if (!error && data) {
              console.log('✅ Loaded real testimonials:', data);
              setRealTestimonials(data);
            } else {
              console.error('❌ Error loading testimonials:', error);
            }
            setLoading(false);
          });
      });
    } else {
      setRealTestimonials([]);
      setLoading(false);
    }
  }, [content.selectedTestimonials]);
  
  // Verarbeite die geladenen Testimonials
  let testimonialData = [];
  
  if (realTestimonials.length > 0) {
    testimonialData = realTestimonials.slice(0, content.count || 3).map(t => ({
      name: t.firstname && t.lastname ? `${t.firstname} ${t.lastname}` : t.name,
      rating: t.rating,
      text: t.text_content,
      image: t.file_asset?.file_url || '',
      age: t.age || 0,
      goals: t.training_goals || [],
      tags: t.tags || [],
      memberSince: t.member_since || '2 Months Ago',
      hasImage: !!t.file_asset?.file_url
    }));
  } else if (Array.isArray(content.testimonials) && content.testimonials.length > 0) {
    // Fallback zu JSON-Testimonials
    testimonialData = content.testimonials.slice(0, content.count || 3);
  } else {
    // Fallback zu Demo-Daten
    testimonialData = [
      { name: 'Max Mustermann', rating: 5, text: 'Super Beratung und tolles Team!', image: '', age: 32, goals: ['Abnehmen'], tags: ['Premium'], memberSince: '2 Months Ago', hasImage: false },
      { name: 'Anna Schmidt', rating: 4, text: 'Sehr zufrieden, komme gerne wieder.', image: '', age: 28, goals: ['Muskelaufbau'], tags: ['VIP'], memberSince: '1 Month Ago', hasImage: false },
      { name: 'T. Müller', rating: 5, text: 'Top Studio!', image: '', age: 45, goals: ['Fitness'], tags: ['Premium'], memberSince: '3 Months Ago', hasImage: false }
    ].slice(0, content.count || 3);
  }
  
  if (loading) {
    return (
      <div className="py-12 px-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Lade Testimonials...</p>
      </div>
    );
  }
  
  return <>{children(testimonialData)}</>;
} 