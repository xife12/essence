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
  is_test_submission?: boolean
  test_deletion_at?: string
  created_at: string
}

export const FormsAPI = {
  // Lead-Formular Validierung
  validateLeadFormRequirements(fields: FormField[], formType: string): { isValid: boolean, missingFields: string[], recommendations: string[] } {
    if (formType !== 'lead_capture') {
      return { isValid: true, missingFields: [], recommendations: [] }
    }

    const fieldTypes = fields.map(f => f.field_type)
    const fieldNames = fields.map(f => f.field_name?.toLowerCase() || '')
    
    const missingFields: string[] = []
    const recommendations: string[] = []
    
    // Prüfe Name/Vorname
    const hasName = fieldTypes.includes('text') && fieldNames.some(name => 
      name.includes('name') || name.includes('vorname') || name.includes('nachname')
    )
    if (!hasName) {
      missingFields.push('Name/Vorname')
      recommendations.push('Fügen Sie Textfelder für "Vorname" und "Nachname" hinzu')
    }
    
    // Prüfe E-Mail ODER Telefon
    const hasEmail = fieldTypes.includes('email')
    const hasPhone = fieldTypes.includes('phone') || fieldNames.some(name => 
      name.includes('telefon') || name.includes('phone') || name.includes('handy')
    )
    
    if (!hasEmail && !hasPhone) {
      missingFields.push('E-Mail oder Telefonnummer')
      recommendations.push('Fügen Sie entweder ein E-Mail-Feld oder ein Telefon-Feld hinzu')
    }
    
    // Zusätzliche Empfehlungen für Lead-Formulare
    if (!fieldTypes.includes('consent')) {
      recommendations.push('Empfehlung: Fügen Sie ein Einverständnis-Feld für DSGVO-Konformität hinzu')
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      recommendations
    }
  },

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
    
    // Ensure step is at least 1
    const step = field.step || 1
    
    // Get current fields to calculate proper position
    const existingFields = await this.getFields(formId)
    const fieldsInStep = existingFields.filter(f => (f.step || 1) === step)
    const maxPosition = fieldsInStep.length > 0 
      ? Math.max(...fieldsInStep.map(f => f.position || 0)) 
      : -1
    
    const fieldData = {
      ...field,
      form_id: formId,
      step: step,
      position: field.position !== undefined ? field.position : maxPosition + 1
    }
    
    console.log('📋 API: Adding field with calculated data:', fieldData)
    
    // Validate required fields
    if (!fieldData.field_name) {
      throw new Error('field_name ist erforderlich')
    }
    if (!fieldData.label) {
      throw new Error('label ist erforderlich')
    }
    if (!fieldData.field_type) {
      throw new Error('field_type ist erforderlich')
    }
    
    const { data, error } = await supabase
      .from('form_fields')
      .insert(fieldData)
      .select()
      .single()
    
    console.log('📋 API: Field added result:', { data, error })
    if (error) {
      console.error('❌ Detailed error:', error)
      throw new Error(`Fehler beim Hinzufügen des Feldes: ${error.message}`)
    }
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
    
    console.log('📋 API: Loading submissions for form:', formId)
    
    const { data, error } = await supabase
      .from('form_submissions')
      .select('id, form_id, submission_data, ip_address, user_agent, lead_id, is_test_submission, test_deletion_at, created_at')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching submissions:', error)
      throw error
    }
    
    console.log('📋 API: Submissions loaded:', { 
      count: data?.length, 
      test_count: data?.filter(s => s.is_test_submission).length,
      sample_data: data?.slice(0, 2)
    })
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
    
    // Robuste Datenextraktion aus submission_data
    const data = submission.submission_data
    
    // Name-Extraktion (verschiedene Felder möglich)
    let name = data.name || ''
    let first_name = data.firstname || data.first_name || data.vorname || ''
    let last_name = data.lastname || data.last_name || data.nachname || data.surname || ''
    
    // Falls nur "name" vorhanden, versuche Aufspaltung
    if (!first_name && !last_name && name) {
      const nameParts = name.split(' ')
      first_name = nameParts[0] || ''
      last_name = nameParts.slice(1).join(' ') || ''
    }
    
    // Falls first_name/last_name vorhanden, kombiniere für name
    if (!name && (first_name || last_name)) {
      name = `${first_name} ${last_name}`.trim()
    }
    
    // Kontakt-Daten (verschiedene Feldnamen möglich)
    const email = data.email || data.e_mail || data.e_mail_adresse || data.mail || data.email_address || ''
    const phone = data.phone || data.telefon || data.telefonnummer || data.tel || data.handy || data.mobile || data.phone_number || ''
    
    // Validierung: Mind. Name UND (Email ODER Telefon)
    if (!name) {
      console.error('❌ Cannot create lead: No name found in submission data')
      throw new Error('Lead requires at least a name')
    }
    
    if (!email && !phone) {
      console.error('❌ Cannot create lead: No contact information (email or phone) found')
      throw new Error('Lead requires email or phone number')
    }
    
    // Contact field = primary contact method (email preferred, then phone)
    const contact = email || phone
    
    const leadData = {
      name: name,
      contact: contact,
      first_name: first_name,
      last_name: last_name,
      email: email || null,
      phone: phone || null,
      source: `Formular: ${submission.forms.name}`,
      campaign_id: submission.forms.campaign_id,
      status: 'open'
    }
    
    console.log('👥 Creating lead with data:', leadData)
    
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
  },

  // Test submission with auto-deletion
  async createTestSubmission(formId: string, submissionData: Record<string, any>) {
    try {
      console.log('🧪 Creating test submission for form:', formId)
      
      const { data, error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          submission_data: submissionData,
          is_test_submission: true, // Mark as test
          test_deletion_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now (DEBUG: extended)
          ip_address: 'test-ip',
          user_agent: 'Test-Browser'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating test submission:', error)
        throw error
      }

      console.log('✅ Test submission created:', data.id)

      // Check if form has auto_lead_creation enabled
      const formResponse = await supabase
        .from('forms')
        .select('auto_lead_creation, form_type')
        .eq('id', formId)
        .single()

      if (formResponse.data?.auto_lead_creation) {
        // Create test lead if auto lead creation is enabled
        const testLead = await this.createTestLeadFromSubmission(data, submissionData)
        console.log('✅ Test lead created:', testLead?.id)
      }

      return data
    } catch (error) {
      console.error('❌ Error in createTestSubmission:', error)
      throw error
    }
  },

  // Create test lead from form submission
  async createTestLeadFromSubmission(submission: any, submissionData: Record<string, any>) {
    try {
      // Robuste Datenextraktion (gleiche Logic wie bei echten Leads)
      let name = submissionData.name || ''
      let first_name = submissionData.firstname || submissionData.first_name || submissionData.vorname || ''
      let last_name = submissionData.lastname || submissionData.last_name || submissionData.nachname || submissionData.surname || ''
      
      // Falls nur "name" vorhanden, versuche Aufspaltung
      if (!first_name && !last_name && name) {
        const nameParts = name.split(' ')
        first_name = nameParts[0] || ''
        last_name = nameParts.slice(1).join(' ') || ''
      }
      
      // Falls first_name/last_name vorhanden, kombiniere für name
      if (!name && (first_name || last_name)) {
        name = `${first_name} ${last_name}`.trim()
      }
      
      // Fallback für Test-Daten
      if (!name) {
        name = 'Test Lead'
        first_name = 'Test'
        last_name = 'Lead'
      }
      
      // Kontakt-Daten
      const email = submissionData.email || submissionData.e_mail || submissionData.mail || submissionData.email_address || ''
      const phone = submissionData.phone || submissionData.telefon || submissionData.tel || submissionData.handy || submissionData.mobile || ''
      
      const leadData = {
        name: name,
        contact: email || phone,
        first_name: first_name,
        last_name: last_name,
        email: email || null,
        phone: phone || null,
        source: 'Formular Test',
        status: 'open',
        is_test_lead: true, // Mark as test lead
        test_deletion_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now (DEBUG: extended)
        form_submission_id: submission.id
      }

      console.log('🧪 Creating test lead with data:', leadData)

      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating test lead:', error)
        throw error
      }

      // Update form_submission with lead_id
      await supabase
        .from('form_submissions')
        .update({ lead_id: data.id })
        .eq('id', submission.id)

      console.log('✅ Test lead created and linked to submission:', data.id)
      return data
    } catch (error) {
      console.error('❌ Error in createTestLeadFromSubmission:', error)
      throw error
    }
  },

  // Cleanup expired test data (call this periodically)
  async cleanupExpiredTestData() {
    try {
      const now = new Date()
      
      // Delete expired test submissions
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('is_test_submission', true)
        .lt('test_deletion_at', now.toISOString())

      if (submissionError) {
        console.error('❌ Error deleting expired test submissions:', submissionError)
      }

      // Delete expired test leads
      const { error: leadError } = await supabase
        .from('leads')
        .delete()
        .eq('is_test_lead', true)
        .lt('test_deletion_at', now.toISOString())

      if (leadError) {
        console.error('❌ Error deleting expired test leads:', leadError)
      }

      console.log('✅ Expired test data cleaned up')
    } catch (error) {
      console.error('❌ Error in cleanupExpiredTestData:', error)
    }
  }
}

// Leads API
export interface Lead {
  id: string
  name: string
  contact?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  source?: string
  status: 'open' | 'contacted' | 'appointment' | 'lost' | 'converted' | 'completed' | 'consultation'
  campaign_id?: string
  is_test_lead?: boolean
  test_deletion_at?: string
  form_submission_id?: string
  created_at: string
  updated_at?: string
  // UI helper properties
  campaign?: {
    id: string
    name: string
  }
  appointment_date?: string
  appointment_time?: string
  contact_attempts?: Array<{
    date: string
    method: string
    staff: string
  }>
}

export const LeadsAPI = {
  async getAll(includeTestLeads = false): Promise<Lead[]> {
    console.log('👥 API: Loading all leads, includeTestLeads:', includeTestLeads)
    
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Filter out test leads unless explicitly requested
    if (!includeTestLeads) {
      query = query.or('is_test_lead.is.null,is_test_lead.eq.false')
    }
    
    const { data, error } = await query
    
    console.log('👥 API: Leads loaded:', { 
      count: data?.length, 
      test_count: data?.filter(l => l.is_test_lead).length 
    })
    
    if (error) {
      console.error('❌ Error fetching leads:', error)
      throw error
    }
    
    return data || []
  },

  async getById(id: string): Promise<Lead | null> {
    console.log('👥 API: Loading lead by ID:', id)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Error fetching lead:', error)
      throw error
    }
    
    return data
  },

  async create(lead: Partial<Lead>): Promise<Lead> {
    console.log('👥 API: Creating lead:', lead)
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating lead:', error)
      throw error
    }
    
    return data
  },

  async update(id: string, lead: Partial<Lead>): Promise<Lead> {
    console.log('👥 API: Updating lead:', id, lead)
    const { data, error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating lead:', error)
      throw error
    }
    
    return data
  },

  async delete(id: string): Promise<void> {
    console.log('🗑️ API: Deleting lead:', id)
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Error deleting lead:', error)
      throw error
    }
  }
} 