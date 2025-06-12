import supabase from '../supabaseClient'

// ============================================================================
// TypeScript Interfaces & Types
// ============================================================================

export type BlockType = 
  | 'header' | 'text' | 'image' | 'video' | 'button' | 'form' | 'icon' | 'testimonial'
  | 'pricing' | 'feature' | 'countdown' | 'service' | 'faq' | 'contact' | 'team' 
  | 'statistics' | 'trust_logos' | 'gallery' | 'blog_preview' | 'spacer' | 'courseplan'
  | 'gamification' | 'cta' | 'hero'

export type LayoutType = '1-col' | '2-col' | '3-col' | 'split' | 'fullwidth' | 'grid'

export type PresetType = 
  | 'default' | 'hero-centered' | 'hero-split' | 'image-overlay' | 'minimal' | 'clean-color'
  | 'classic-paragraph' | 'two-column-info' | 'callout-quote' | 'info-card' | 'text-icon'
  | 'lightbox-grid' | 'scroll-carousel' | 'wide-banner' | 'hover-zoom' | 'split-image-text'
  | 'clean-video' | 'framed' | 'side-by-side' | 'overlay-start' | 'youtube-card'
  | 'flat' | 'rounded' | 'ghost' | 'shadowed' | 'icon-text'

export interface LandingPage {
  id: string
  title: string
  slug: string
  headline?: string
  subheadline?: string
  description?: string
  meta_title?: string
  meta_description?: string
  og_image_id?: string
  design_template?: string
  typography_set?: string
  container_width?: string
  background_config?: Record<string, any>
  is_active: boolean
  tracking_pixel_id?: string
  campaign_id?: string
  ci_template_id?: string
  page_template_id?: string
  form_enabled: boolean
  form_target_table?: string
  redirect_url?: string
  qr_code_url?: string
  created_at: string
  updated_at: string
  // Populated relations
  blocks?: LandingPageBlock[]
  block_count?: number
}

export interface LandingPageBlock {
  id: string
  landingpage_id: string
  block_type: BlockType
  position: number
  layout: LayoutType
  preset: PresetType
  content_json: Record<string, any>
  file_asset_id?: string
  form_template_id?: string
  testimonial_id?: string
  created_at: string
  updated_at: string
  // Populated relations
  file_asset?: {
    id: string
    url: string
    file_name: string
    alt_text?: string
  }
}

export interface PageTemplate {
  id: string
  name: string
  description?: string
  category: string
  tags: string[]
  campaign_type?: string
  blocks_config: any[]
  preview_image_id?: string
  is_system: boolean
  usage_count: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateLandingPageData {
  title: string
  slug: string
  headline?: string
  subheadline?: string
  description?: string
  design_template?: string
  campaign_id?: string
  ci_template_id?: string
  page_template_id?: string
  form_enabled?: boolean
}

export interface CreateBlockData {
  landingpage_id: string
  block_type: BlockType
  position: number
  layout?: LayoutType
  preset?: PresetType
  content_json?: Record<string, any>
  file_asset_id?: string
}

export interface UpdateBlockData {
  position?: number
  layout?: LayoutType
  preset?: PresetType
  content_json?: Record<string, any>
  file_asset_id?: string
}

// ============================================================================
// Landingpages API Class
// ============================================================================

class LandingpagesAPI {
  
  // ========================================================================
  // LANDINGPAGE CRUD OPERATIONS
  // ========================================================================

  /**
   * Get all landingpages with optional filtering
   */
  async getLandingpages(filters?: {
    is_active?: boolean
    campaign_id?: string
    search?: string
  }) {
    try {
      console.log('🔍 API: Loading landingpages with filters:', filters)
      
      let query = supabase
        .from('landingpage')
        .select(`
          *,
          blocks:landingpage_block(count)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      
      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id)
      }
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,slug.ilike.%${filters.search}%,headline.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error loading landingpages:', error)
        throw error
      }

      // Process block counts
      const processedData = data?.map(page => ({
        ...page,
        block_count: page.blocks?.[0]?.count || 0
      })) || []

      console.log('✅ Landingpages loaded:', processedData.length)
      return { data: processedData, error: null }
      
    } catch (error) {
      console.error('❌ Exception in getLandingpages:', error)
      return { data: null, error }
    }
  }

  /**
   * Get single landingpage by ID with blocks
   */
  async getLandingpage(id: string, includeBlocks = true) {
    try {
      console.log('🔍 API: Loading landingpage by ID:', id)
      
      let query = supabase
        .from('landingpage')
        .select('*')
        .eq('id', id)
        .single()

      const { data: landingpage, error: pageError } = await query

      if (pageError) {
        console.error('❌ Error loading landingpage:', pageError)
        throw pageError
      }

      if (!landingpage) {
        throw new Error('Landingpage not found')
      }

      let blocks: LandingPageBlock[] = []
      
      if (includeBlocks) {
        const { data: blocksData, error: blocksError } = await this.getBlocks(id)
        if (blocksError) {
          console.warn('⚠️ Error loading blocks:', blocksError)
        } else {
          blocks = blocksData || []
        }
      }

      const result = {
        ...landingpage,
        blocks
      }

      console.log('✅ Landingpage loaded with', blocks.length, 'blocks')
      return { data: result, error: null }
      
    } catch (error) {
      console.error('❌ Exception in getLandingpage:', error)
      return { data: null, error }
    }
  }

  /**
   * Create new landingpage
   */
  async createLandingpage(landingpageData: CreateLandingPageData) {
    try {
      console.log('🆕 API: Creating landingpage:', landingpageData.title)
      
      // Check slug uniqueness
      const { data: existing } = await supabase
        .from('landingpage')
        .select('id')
        .eq('slug', landingpageData.slug)
        .single()

      if (existing) {
        throw new Error('Eine Landingpage mit diesem Slug existiert bereits')
      }

      const { data, error } = await supabase
        .from('landingpage')
        .insert([{
          ...landingpageData,
          design_template: landingpageData.design_template || 'fitness-modern',
          form_enabled: landingpageData.form_enabled || false
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating landingpage:', error)
        throw error
      }

      console.log('✅ Landingpage created:', data.id)
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Exception in createLandingpage:', error)
      return { data: null, error }
    }
  }

  /**
   * Update landingpage
   */
  async updateLandingpage(id: string, updates: Partial<CreateLandingPageData & {
    is_active?: boolean
    meta_title?: string
    meta_description?: string
    tracking_pixel_id?: string
    qr_code_url?: string
  }>) {
    try {
      console.log('🔄 API: Updating landingpage:', id)
      
      // If slug is being updated, check uniqueness
      if (updates.slug) {
        const { data: existing } = await supabase
          .from('landingpage')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', id)
          .single()

        if (existing) {
          throw new Error('Eine Landingpage mit diesem Slug existiert bereits')
        }
      }

      const { data, error } = await supabase
        .from('landingpage')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating landingpage:', error)
        throw error
      }

      console.log('✅ Landingpage updated:', id)
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Exception in updateLandingpage:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete landingpage and all blocks
   */
  async deleteLandingpage(id: string) {
    try {
      console.log('🗑️ API: Deleting landingpage:', id)
      
      // Delete blocks first (CASCADE should handle this, but being explicit)
      await supabase
        .from('landingpage_block')
        .delete()
        .eq('landingpage_id', id)

      // Delete landingpage
      const { error } = await supabase
        .from('landingpage')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting landingpage:', error)
        throw error
      }

      console.log('✅ Landingpage deleted:', id)
      return { error: null }
      
    } catch (error) {
      console.error('❌ Exception in deleteLandingpage:', error)
      return { error }
    }
  }

  // ========================================================================
  // BLOCK CRUD OPERATIONS
  // ========================================================================

  /**
   * Get all blocks for a landingpage
   */
  async getBlocks(landingpageId: string) {
    try {
      console.log('🔍 API: Loading blocks for landingpage:', landingpageId)
      
      const { data, error } = await supabase
        .from('landingpage_block')
        .select(`
          *,
          file_asset:file_asset_id(id, file_url, filename)
        `)
        .eq('landingpage_id', landingpageId)
        .order('position', { ascending: true })

      if (error) {
        console.error('❌ Error loading blocks:', error)
        throw error
      }

      console.log('✅ Blocks loaded:', data?.length || 0)
      return { data: data || [], error: null }
      
    } catch (error) {
      console.error('❌ Exception in getBlocks:', error)
      return { data: [], error }
    }
  }

  /**
   * Create new block
   */
  async createBlock(blockData: CreateBlockData) {
    try {
      console.log('🆕 API: Creating block:', blockData.block_type, 'at position', blockData.position)
      
      const { data, error } = await supabase
        .from('landingpage_block')
        .insert([{
          landingpage_id: blockData.landingpage_id,
          block_type: blockData.block_type,
          position: blockData.position,
          layout: blockData.layout || '1-col',
          preset: blockData.preset || 'default',
          content_json: blockData.content_json || {}
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating block:', error)
        throw error
      }

      console.log('✅ Block created:', data.id)
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Exception in createBlock:', error)
      return { data: null, error }
    }
  }

  /**
   * Update block
   */
  async updateBlock(blockId: string, updates: UpdateBlockData) {
    try {
      console.log('🔄 API: Updating block:', blockId)
      
      const { data, error } = await supabase
        .from('landingpage_block')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', blockId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating block:', error)
        throw error
      }

      console.log('✅ Block updated:', blockId)
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Exception in updateBlock:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete block
   */
  async deleteBlock(blockId: string) {
    try {
      console.log('🗑️ API: Deleting block:', blockId)
      
      // Get block info first for position adjustment
      const { data: block } = await supabase
        .from('landingpage_block')
        .select('landingpage_id, position')
        .eq('id', blockId)
        .single()

      const { error } = await supabase
        .from('landingpage_block')
        .delete()
        .eq('id', blockId)

      if (error) {
        console.error('❌ Error deleting block:', error)
        throw error
      }

      // Adjust positions of remaining blocks
      if (block) {
        await this._adjustBlockPositions(block.landingpage_id, block.position, 'delete')
      }

      console.log('✅ Block deleted:', blockId)
      return { error: null }
      
    } catch (error) {
      console.error('❌ Exception in deleteBlock:', error)
      return { error }
    }
  }

  /**
   * Reorder blocks
   */
  async reorderBlocks(landingpageId: string, blockOrders: { id: string; position: number }[]) {
    try {
      console.log('🔄 API: Reordering blocks for landingpage:', landingpageId)
      
      // Update each block's position
      const updates = blockOrders.map(({ id, position }) => 
        supabase
          .from('landingpage_block')
          .update({ 
            position,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      )

      await Promise.all(updates)

      console.log('✅ Blocks reordered:', blockOrders.length, 'blocks')
      return { error: null }
      
    } catch (error) {
      console.error('❌ Exception in reorderBlocks:', error)
      return { error }
    }
  }

  // ========================================================================
  // TEMPLATE OPERATIONS
  // ========================================================================

  /**
   * Get page templates
   */
  async getPageTemplates(filters?: {
    category?: string
    is_system?: boolean
  }) {
    try {
      console.log('🔍 API: Loading page templates')
      
      let query = supabase
        .from('page_templates')
        .select('*')
        .order('usage_count', { ascending: false })

      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      
      if (filters?.is_system !== undefined) {
        query = query.eq('is_system', filters.is_system)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error loading page templates:', error)
        throw error
      }

      console.log('✅ Page templates loaded:', data?.length || 0)
      return { data: data || [], error: null }
      
    } catch (error) {
      console.error('❌ Exception in getPageTemplates:', error)
      return { data: null, error }
    }
  }

  /**
   * Create landingpage from template
   */
  async createFromTemplate(templateId: string, landingpageData: CreateLandingPageData) {
    try {
      console.log('🎨 API: Creating landingpage from template:', templateId)
      
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('page_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) {
        throw templateError
      }

      // Create landingpage
      const { data: landingpage, error: createError } = await this.createLandingpage({
        ...landingpageData,
        page_template_id: templateId
      })

      if (createError || !landingpage) {
        throw createError || new Error('Failed to create landingpage')
      }

      // Create blocks from template
      if (template.blocks_config && Array.isArray(template.blocks_config)) {
        for (let i = 0; i < template.blocks_config.length; i++) {
          const blockConfig = template.blocks_config[i]
          await this.createBlock({
            landingpage_id: landingpage.id,
            block_type: blockConfig.block_type,
            position: i,
            layout: blockConfig.layout,
            preset: blockConfig.preset,
            content_json: blockConfig.content_json || {}
          })
        }
      }

      // Increment template usage count
      await supabase
        .from('page_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', templateId)

      console.log('✅ Landingpage created from template')
      return { data: landingpage, error: null }
      
    } catch (error) {
      console.error('❌ Exception in createFromTemplate:', error)
      return { data: null, error }
    }
  }

  // ========================================================================
  // PUBLISHING & QR CODE
  // ========================================================================

  /**
   * Publish landingpage (activate and generate QR code)
   */
  async publishLandingpage(id: string) {
    try {
      console.log('🚀 API: Publishing landingpage:', id)
      
      // Get landingpage info
      const { data: landingpage } = await supabase
        .from('landingpage')
        .select('slug')
        .eq('id', id)
        .single()

      if (!landingpage) {
        throw new Error('Landingpage not found')
      }

      // Generate QR code URL (simplified - in production you'd use a QR service)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://membercore.app'
      const landingpageUrl = `${baseUrl}/lp/${landingpage.slug}`
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(landingpageUrl)}`

      // Update landingpage
      const { data, error } = await supabase
        .from('landingpage')
        .update({
          is_active: true,
          qr_code_url: qrCodeUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error publishing landingpage:', error)
        throw error
      }

      console.log('✅ Landingpage published with QR code')
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Exception in publishLandingpage:', error)
      return { data: null, error }
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Adjust block positions when inserting or deleting
   */
  private async _adjustBlockPositions(landingpageId: string, position: number, action: 'insert' | 'delete') {
    try {
      if (action === 'insert') {
        // Move all blocks at or after this position down by 1
        await supabase
          .rpc('increment_block_positions', {
            page_id: landingpageId,
            from_position: position
          })
      } else if (action === 'delete') {
        // Move all blocks after this position up by 1
        await supabase
          .from('landingpage_block')
          .update({ 
            position: supabase.rpc('position - 1'),
            updated_at: new Date().toISOString()
          })
          .eq('landingpage_id', landingpageId)
          .gt('position', position)
      }
    } catch (error) {
      console.warn('⚠️ Could not adjust block positions:', error)
    }
  }

  /**
   * Get landingpage analytics
   */
  async getAnalytics(landingpageId: string, dateRange?: { from: Date; to: Date }) {
    // TODO: Implement analytics when tracking is set up
    console.log('📊 Analytics not yet implemented for:', landingpageId)
    return {
      views: 0,
      conversions: 0,
      conversion_rate: 0,
      bounce_rate: 0
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export default new LandingpagesAPI() 