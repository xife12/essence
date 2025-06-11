import supabase from '../supabaseClient'

export interface CITemplate {
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
  }
  icon_style?: {
    style: 'outline' | 'filled'
    color: 'auto' | 'custom'
    shape: 'round' | 'square'
  }
  block_styles?: any
  spacing_config?: any
  accessibility_aa_compliant?: boolean
  linked_campaign_id?: string
  campaign_scope?: 'single' | 'all'
  is_default: boolean
  parent_ci_id?: string
  is_master_ci: boolean
  category?: string
  target_audience?: any
  target_audience_detailed?: {
    description?: string
    age_min?: number
    age_max?: number
    interests?: string[]
    sports_goals?: string[]
  }
  usage_purpose?: string[]
  logos?: {
    primary?: string
    white?: string
    black?: string
    favicon?: string
  }
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface CILogo {
  id?: string
  ci_template_id: string
  logo_type: 'primary' | 'white' | 'black' | 'favicon' | 'action_special'
  file_asset_id: string
  is_inherited: boolean
  description?: string
  created_at?: string
}

export interface CISetting {
  id?: string
  setting_type: 'category' | 'target_audience_config' | 'usage_purpose'
  setting_key: string
  setting_value: any
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CITargetAudience {
  id?: string
  name: string
  age_min?: number
  age_max?: number
  gender?: 'male' | 'female' | 'all'
  interests?: string[]
  description?: string
  is_active: boolean
  created_at?: string
}

export const CITemplatesAPI = {
  // Template CRUD
  async getAll(): Promise<CITemplate[]> {
    const { data, error } = await supabase
      .from('ci_templates')
      .select('*')
      .order('is_master_ci', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getMasterCIs(): Promise<CITemplate[]> {
    const { data, error } = await supabase
      .from('ci_templates')
      .select('*')
      .eq('is_master_ci', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getSubCIs(parentId: string): Promise<CITemplate[]> {
    const { data, error } = await supabase
      .from('ci_templates')
      .select('*')
      .eq('parent_ci_id', parentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<CITemplate | null> {
    const { data, error } = await supabase
      .from('ci_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async create(template: Omit<CITemplate, 'id' | 'created_at' | 'updated_at'>): Promise<CITemplate> {
    console.log('API: Creating template with data:', template)
    
    const { data, error } = await supabase
      .from('ci_templates')
      .insert(template)
      .select()
      .single()
    
    console.log('API: Create result:', { data, error })
    
    if (error) {
      console.error('API: Create error:', error)
      throw error
    }
    return data
  },

  async update(id: string, template: Partial<CITemplate>): Promise<CITemplate> {
    console.log('API: Updating template', id, 'with data:', template)
    
    const { data, error } = await supabase
      .from('ci_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    console.log('API: Update result:', { data, error })
    
    if (error) {
      console.error('API: Update error:', error)
      throw error
    }
    return data
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ API: Delete called with ID:', id)
    
    if (!id) {
      throw new Error('ID ist erforderlich für delete')
    }
    
    const { error } = await supabase
      .from('ci_templates')
      .delete()
      .eq('id', id)
    
    console.log('🗑️ API: Delete result:', { error })
    
    if (error) {
      console.error('❌ API: Delete error:', error)
      throw error
    }
    
    console.log('✅ API: Delete successful for ID:', id)
  },

  async duplicate(id: string, newName: string): Promise<CITemplate> {
    const original = await this.getById(id)
    if (!original) throw new Error('Template not found')
    
    const { id: _, created_at, updated_at, ...templateData } = original
    const newTemplate = {
      ...templateData,
      name: newName,
      is_default: false // Kopien sind nie Standard
    }
    
    return this.create(newTemplate)
  },

  // Logo-Management
  async getLogos(templateId: string): Promise<CILogo[]> {
    const { data, error } = await supabase
      .from('ci_logos')
      .select(`
        *,
        file_asset:file_asset_id (
          id,
          filename,
          file_url,
          description
        )
      `)
      .eq('ci_template_id', templateId)
    
    if (error) throw error
    return data || []
  },

  async addLogo(logo: Omit<CILogo, 'id' | 'created_at'>): Promise<CILogo> {
    const { data, error } = await supabase
      .from('ci_logos')
      .insert(logo)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateLogo(id: string, logo: Partial<CILogo>): Promise<CILogo> {
    const { data, error } = await supabase
      .from('ci_logos')
      .update(logo)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteLogo(id: string): Promise<void> {
    const { error } = await supabase
      .from('ci_logos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Einstellungs-Management
  async getSettings(settingType?: string): Promise<CISetting[]> {
    let query = supabase
      .from('ci_settings')
      .select('*')
      .eq('is_active', true)
    
    if (settingType) {
      query = query.eq('setting_type', settingType)
    }
    
    const { data, error } = await query.order('setting_type').order('setting_key')
    
    if (error) throw error
    return data || []
  },

  async saveSetting(settingKey: string, value: any): Promise<CISetting> {
    // Vereinfachte Methode für das Speichern von Settings
    return this.updateSetting('category', settingKey, value)
  },

  async updateSetting(settingType: string, settingKey: string, value: any): Promise<CISetting> {
    // Erst prüfen ob Eintrag existiert
    const { data: existing } = await supabase
      .from('ci_settings')
      .select('id')
      .eq('setting_type', settingType)
      .eq('setting_key', settingKey)
      .single()

    if (existing) {
      // Update existierenden Eintrag
      const { data, error } = await supabase
        .from('ci_settings')
        .update({
          setting_value: value,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Neuen Eintrag erstellen
      const { data, error } = await supabase
        .from('ci_settings')
        .insert({
          setting_type: settingType,
          setting_key: settingKey,
          setting_value: value,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Zielgruppen-Management
  async getTargetAudiences(): Promise<CITargetAudience[]> {
    const { data, error } = await supabase
      .from('ci_target_audiences')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  async createTargetAudience(audience: Omit<CITargetAudience, 'id' | 'created_at'>): Promise<CITargetAudience> {
    const { data, error } = await supabase
      .from('ci_target_audiences')
      .insert(audience)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateTargetAudience(id: string, audience: Partial<CITargetAudience>): Promise<CITargetAudience> {
    const { data, error } = await supabase
      .from('ci_target_audiences')
      .update(audience)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTargetAudience(id: string): Promise<void> {
    const { error } = await supabase
      .from('ci_target_audiences')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
  },

  // Brand Guidelines PDF Export
  async exportBrandGuidelines(templateId: string): Promise<Blob> {
    // Hier würde die PDF-Generierung implementiert werden
    // Für jetzt return placeholder
    throw new Error('PDF Export noch nicht implementiert')
  },

  // Utility Functions
  async getInheritedSettings(templateId: string): Promise<CITemplate> {
    const template = await this.getById(templateId)
    if (!template) throw new Error('Template not found')
    
    // Wenn es eine Sub-CI ist, erbe Eigenschaften von der Haupt-CI
    if (template.parent_ci_id) {
      const parentTemplate = await this.getById(template.parent_ci_id)
      if (parentTemplate) {
        // Merge parent properties with template properties
        // Template properties override parent properties
        return {
          ...parentTemplate,
          ...template,
          id: template.id, // Behalte Original-ID
          name: template.name, // Behalte Original-Name
          parent_ci_id: template.parent_ci_id
        }
      }
    }
    
    return template
  },

  // Kontrast-Berechnung
  calculateContrast(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }
} 