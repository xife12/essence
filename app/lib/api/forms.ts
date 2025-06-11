import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Form {
  id: string
  name: string
  title?: string
  description?: string
  slug?: string
  is_active: boolean
  is_multi_step: boolean
  campaign_id?: string
  ci_template_id?: string
  success_message?: string
  redirect_url?: string
  notification_email?: string
  auto_lead_creation: boolean
  form_type: 'lead_capture' | 'contact' | 'survey' | 'registration' | 'booking' | 'feedback'
  submit_limit?: number
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  form_id: string
  field_type: string
  step: number
  position: number
  label: string
  placeholder?: string
  field_name: string
  is_required: boolean
  validation_rules: any
  options: any[]
  default_value?: string
  conditional_logic: any
  field_width: 'full' | 'half' | 'third'
  help_text?: string
  created_at: string
  updated_at: string
}

export interface FormSubmission {
  id: string
  form_id: string
  submission_data: any
  ip_address?: string
  user_agent?: string
  lead_id?: string
  created_at: string
}

export const FormsAPI = {
  // CRUD Operations für Forms
  async getAll(): Promise<Form[]> {
    console.log('📋 API: Loading all forms')
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('📋 API: Forms loaded:', { count: data?.length, error })
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Form | null> {
    console.log('📋 API: Loading form by ID:', id)
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single()
    
    console.log('📋 API: Form loaded:', { data, error })
    if (error) throw error
    return data
  },

  async create(form: Partial<Form>): Promise<Form> {
    console.log('📋 API: Creating form with data:', form)
    const { data, error } = await supabase
      .from('forms')
      .insert(form)
      .select()
      .single()
    
    console.log('📋 API: Form created:', { data, error })
    if (error) throw error
    return data
  },

  async update(id: string, form: Partial<Form>): Promise<Form> {
    console.log('📋 API: Updating form:', id, form)
    const { data, error } = await supabase
      .from('forms')
      .update(form)
      .eq('id', id)
      .select()
      .single()
    
    console.log('📋 API: Form updated:', { data, error })
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ API: Deleting form:', id)
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id)
    
    console.log('🗑️ API: Form deleted:', { error })
    if (error) throw error
  },

  async duplicate(id: string, newName?: string): Promise<Form> {
    console.log('📋 API: Duplicating form:', id)
    
    // Lade das Original-Formular
    const original = await this.getById(id)
    if (!original) throw new Error('Form not found')
    
    // Erstelle Kopie
    const copy = {
      ...original,
      name: newName || `${original.name} (Kopie)`,
      slug: `${original.slug || original.name.toLowerCase()}-kopie-${Date.now()}`,
      is_active: false
    }
    delete copy.id
    delete copy.created_at
    delete copy.updated_at
    
    return await this.create(copy)
  },

  // Field Management
  async getFields(formId: string): Promise<FormField[]> {
    console.log('📋 API: Loading fields for form:', formId)
    const { data, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('step', { ascending: true })
      .order('position', { ascending: true })
    
    console.log('📋 API: Fields loaded:', { count: data?.length, error })
    if (error) throw error
    return data || []
  },

  async addField(formId: string, field: Partial<FormField>): Promise<FormField> {
    console.log('📋 API: Adding field to form:', formId, field)
    const fieldData = {
      ...field,
      form_id: formId
    }
    
    const { data, error } = await supabase
      .from('form_fields')
      .insert(fieldData)
      .select()
      .single()
    
    console.log('📋 API: Field added:', { data, error })
    if (error) throw error
    return data
  },

  async updateField(fieldId: string, field: Partial<FormField>): Promise<FormField> {
    console.log('📋 API: Updating field:', fieldId, field)
    const { data, error } = await supabase
      .from('form_fields')
      .update(field)
      .eq('id', fieldId)
      .select()
      .single()
    
    console.log('📋 API: Field updated:', { data, error })
    if (error) throw error
    return data
  },

  async deleteField(fieldId: string): Promise<void> {
    console.log('🗑️ API: Deleting field:', fieldId)
    const { error } = await supabase
      .from('form_fields')
      .delete()
      .eq('id', fieldId)
    
    console.log('🗑️ API: Field deleted:', { error })
    if (error) throw error
  },

  async reorderFields(formId: string, fieldOrder: { id: string, position: number, step: number }[]): Promise<void> {
    console.log('📋 API: Reordering fields for form:', formId, fieldOrder)
    
    // Update positions in batch
    const updates = fieldOrder.map(({ id, position, step }) => 
      supabase
        .from('form_fields')
        .update({ position, step })
        .eq('id', id)
    )
    
    await Promise.all(updates)
    console.log('📋 API: Fields reordered successfully')
  },

  // Submissions
  async getSubmissions(formId: string): Promise<FormSubmission[]> {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching submissions:', error)
      throw error
    }
    
    return data || []
  },

  async exportSubmissions(formId: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const supabase = createClientComponentClient()
    
    // Get form and submissions data
    const [formData, submissionsData] = await Promise.all([
      this.getById(formId),
      this.getSubmissions(formId)
    ])
    
    if (!formData || !submissionsData.length) {
      throw new Error('Keine Daten zum Export verfügbar')
    }
    
    // Prepare CSV content
    const headers = ['ID', 'Eingegangen am', 'IP-Adresse', 'Lead erstellt']
    
    // Extract field names from first submission
    if (submissionsData.length > 0 && submissionsData[0].submission_data) {
      const fieldNames = Object.keys(submissionsData[0].submission_data)
      headers.push(...fieldNames)
    }
    
    const csvRows = [headers.join(',')]
    
    submissionsData.forEach(submission => {
      const row = [
        submission.id,
        new Date(submission.created_at).toLocaleString('de-DE'),
        submission.ip_address || '',
        submission.lead_id ? 'Ja' : 'Nein'
      ]
      
      // Add submission data fields
      if (submission.submission_data) {
        Object.keys(submission.submission_data).forEach(key => {
          const value = submission.submission_data[key]
          // Escape commas and quotes in CSV
          const escapedValue = typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : String(value || '')
          row.push(escapedValue)
        })
      }
      
      csvRows.push(row.join(','))
    })
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    return blob
  },

  async submitForm(formId: string, submissionData: any, userInfo?: { ip_address?: string, user_agent?: string }): Promise<FormSubmission> {
    console.log('📋 API: Submitting form:', formId, submissionData)
    
    const submission = {
      form_id: formId,
      submission_data: submissionData,
      ip_address: userInfo?.ip_address,
      user_agent: userInfo?.user_agent
    }
    
    const { data, error } = await supabase
      .from('form_submissions')
      .insert(submission)
      .select()
      .single()
    
    console.log('📋 API: Form submitted:', { data, error })
    if (error) throw error
    
    // Auto Lead Creation falls aktiviert
    const form = await this.getById(formId)
    if (form?.auto_lead_creation) {
      await this.createLeadFromSubmission(data.id)
    }
    
    return data
  },

  async createLeadFromSubmission(submissionId: string): Promise<void> {
    console.log('👥 API: Creating lead from submission:', submissionId)
    
    const { data: submission } = await supabase
      .from('form_submissions')
      .select('*, forms(*)')
      .eq('id', submissionId)
      .single()
    
    if (!submission) throw new Error('Submission not found')
    
    // Extrahiere Lead-Daten aus submission_data
    const leadData = {
      name: submission.submission_data.name || submission.submission_data.firstname + ' ' + submission.submission_data.lastname || 'Unbekannt',
      firstname: submission.submission_data.firstname,
      lastname: submission.submission_data.lastname,
      email: submission.submission_data.email,
      phone: submission.submission_data.phone,
      source: `Formular: ${submission.forms.name}`,
      campaign_id: submission.forms.campaign_id,
      status: 'open'
    }
    
    const { data: lead, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating lead:', error)
      return
    }
    
    // Verknüpfe Lead mit Submission
    await supabase
      .from('form_submissions')
      .update({ lead_id: lead.id })
      .eq('id', submissionId)
    
    console.log('✅ Lead created from submission:', lead.id)
  },

  // Analytics
  async getFormAnalytics(formId: string): Promise<any> {
    console.log('📊 API: Loading analytics for form:', formId)
    
    const { data: submissions } = await supabase
      .from('form_submissions')
      .select('created_at, submission_data')
      .eq('form_id', formId)
    
    const totalSubmissions = submissions?.length || 0
    const thisMonth = submissions?.filter(s => 
      new Date(s.created_at).getMonth() === new Date().getMonth()
    ).length || 0
    
    return {
      totalSubmissions,
      thisMonth,
      conversionRate: 0, // TODO: Calculate based on views
      averageCompletionTime: 0 // TODO: Calculate from field analytics
    }
  }
} 