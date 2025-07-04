import supabase from '../supabaseClient';
import type { 
  PaymentMember, 
  MemberAccount, 
  MemberTransaction, 
  PaymentGroup, 
  PaymentRun,
  StudioSettings,
  APIResponse,
  CreateMemberTransactionData
} from '../types/payment-system';

export class PaymentSystemAPI {
  /**
   * Lade Payment-Member anhand der Member-ID
   */
  async getPaymentMemberByMemberId(memberId: string): Promise<APIResponse<PaymentMember>> {
    try {
      const { data, error } = await supabase
        .from('payment_members')
        .select('*')
        .eq('member_id', memberId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not "no rows returned"
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PaymentMember };
    } catch (error) {
      console.error('Error fetching payment member:', error);
      return { success: false, error: 'Fehler beim Laden des Payment-Members' };
    }
  }

  /**
   * Lade Member-Account anhand der Payment-Member-ID
   */
  async getMemberAccount(paymentMemberId: string): Promise<APIResponse<MemberAccount>> {
    try {
      const { data, error } = await supabase
        .from('member_accounts')
        .select('*')
        .eq('payment_member_id', paymentMemberId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as MemberAccount };
    } catch (error) {
      console.error('Error fetching member account:', error);
      return { success: false, error: 'Fehler beim Laden des Member-Accounts' };
    }
  }

  /**
   * Lade Member-Transaktionen
   */
  async getMemberTransactions(
    paymentMemberId: string, 
    limit?: number
  ): Promise<APIResponse<MemberTransaction[]>> {
    try {
      let query = supabase
        .from('member_transactions')
        .select('*')
        .eq('payment_member_id', paymentMemberId)
        .order('reference_date', { ascending: false }); // Use reference_date instead of transaction_date

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      // Map database columns to TypeScript interface
      const mappedData = data?.map(row => ({
        id: row.id,
        payment_member_id: row.payment_member_id,
        type: row.transaction_type, // Map transaction_type to type
        amount: row.amount,
        description: row.description,
        transaction_date: row.reference_date, // Map reference_date to transaction_date
        payment_run_id: row.payment_run_id,
        created_by: row.processed_by, // Map processed_by to created_by
        created_at: row.created_at
      })) || [];

      return { success: true, data: mappedData as MemberTransaction[] };
    } catch (error) {
      console.error('Error fetching member transactions:', error);
      return { success: false, error: 'Fehler beim Laden der Transaktionen' };
    }
  }

  /**
   * Erstelle eine neue Transaktion
   */
  async createMemberTransaction(
    transactionData: CreateMemberTransactionData
  ): Promise<APIResponse<MemberTransaction>> {
    try {
      // Map TypeScript interface to database column names
      const dbData = {
        payment_member_id: transactionData.payment_member_id,
        transaction_type: transactionData.type, // Map type to transaction_type
        amount: transactionData.amount,
        description: transactionData.description,
        reference_date: transactionData.transaction_date, // Map transaction_date to reference_date
        processed_by: transactionData.created_by, // Map created_by to processed_by
        payment_run_id: transactionData.payment_run_id
      };

      const { data, error } = await supabase
        .from('member_transactions')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update account balance
      await this.updateAccountBalance(transactionData.payment_member_id);

      // Map back to TypeScript interface
      const mappedData = {
        id: data.id,
        payment_member_id: data.payment_member_id,
        type: data.transaction_type,
        amount: data.amount,
        description: data.description,
        transaction_date: data.reference_date,
        payment_run_id: data.payment_run_id,
        created_by: data.processed_by,
        created_at: data.created_at
      };

      return { success: true, data: mappedData as MemberTransaction };
    } catch (error) {
      console.error('Error creating member transaction:', error);
      return { success: false, error: 'Fehler beim Erstellen der Transaktion' };
    }
  }

  /**
   * Aktualisiere den Account-Saldo basierend auf Transaktionen
   */
  private async updateAccountBalance(paymentMemberId: string): Promise<void> {
    try {
      // Berechne neuen Saldo aus allen Transaktionen
      const { data: transactions } = await supabase
        .from('member_transactions')
        .select('amount')
        .eq('payment_member_id', paymentMemberId);

      if (transactions) {
        const newBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        await supabase
          .from('member_accounts')
          .update({ 
            current_balance: newBalance,
            last_updated: new Date().toISOString()
          })
          .eq('payment_member_id', paymentMemberId);
      }
    } catch (error) {
      console.error('Error updating account balance:', error);
    }
  }

  /**
   * Lade Payment-Group
   */
  async getPaymentGroup(groupId: string): Promise<APIResponse<PaymentGroup>> {
    try {
      const { data, error } = await supabase
        .from('payment_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PaymentGroup };
    } catch (error) {
      console.error('Error fetching payment group:', error);
      return { success: false, error: 'Fehler beim Laden der Payment-Gruppe' };
    }
  }

  /**
   * Lade alle Payment-Groups
   */
  async getPaymentGroups(): Promise<APIResponse<PaymentGroup[]>> {
    try {
      const { data, error } = await supabase
        .from('payment_groups')
        .select('*')
        .order('name');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PaymentGroup[] };
    } catch (error) {
      console.error('Error fetching payment groups:', error);
      return { success: false, error: 'Fehler beim Laden der Payment-Gruppen' };
    }
  }

  /**
   * Lade alle Payment-Members mit Statistiken
   */
  async getPaymentMembers(): Promise<APIResponse<PaymentMember[]>> {
    try {
      const { data, error } = await supabase
        .from('payment_members')
        .select(`
          *,
          member_accounts(*),
          payment_groups(name, payment_day)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as PaymentMember[] };
    } catch (error) {
      console.error('Error fetching payment members:', error);
      return { success: false, error: 'Fehler beim Laden der Payment-Members' };
    }
  }

  /**
   * Erstelle Payment-Member aus PDF-Daten
   */
  async createPaymentMember(memberData: Partial<PaymentMember>): Promise<APIResponse<PaymentMember>> {
    try {
      // Clean up data - remove undefined UUID fields to avoid PostgreSQL errors
      const cleanData = { ...memberData };
      if (cleanData.member_id === undefined || cleanData.member_id === '') {
        delete cleanData.member_id;
      }
      if (cleanData.payment_group_id === undefined || cleanData.payment_group_id === '') {
        delete cleanData.payment_group_id;
      }

      const { data, error } = await supabase
        .from('payment_members')
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: `Datenbankfehler: ${error.message}` };
      }

      // Erstelle zugehöriges Account mit der korrekten Tabellenstruktur
      await supabase
        .from('member_accounts')
        .insert([{
          payment_member_id: data.id,
          member_id: data.id, // Required field
          iban: data.iban || '',
          bic: data.bic || '',
          account_holder: `${data.first_name} ${data.last_name}`,
          mandate_reference: data.mandate_reference,
          current_balance: 0.00,
          is_active: true
        }]);

      return { success: true, data: data as PaymentMember };
    } catch (error) {
      console.error('Error creating payment member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Payment-Members' 
      };
    }
  }

  /**
   * Lade Studio-Einstellungen
   */
  async getStudioSettings(): Promise<APIResponse<StudioSettings>> {
    try {
      const { data, error } = await supabase
        .from('studio_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as StudioSettings };
    } catch (error) {
      console.error('Error fetching studio settings:', error);
      return { success: false, error: 'Fehler beim Laden der Studio-Einstellungen' };
    }
  }

  /**
   * Update Studio-Einstellungen
   */
  async updateStudioSettings(settings: Partial<StudioSettings>): Promise<APIResponse<StudioSettings>> {
    try {
      const { data, error } = await supabase
        .from('studio_settings')
        .upsert([settings])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as StudioSettings };
    } catch (error) {
      console.error('Error updating studio settings:', error);
      return { success: false, error: 'Fehler beim Aktualisieren der Studio-Einstellungen' };
    }
  }

  /**
   * Lade Beitragskonto-Einträge für ein Mitglied
   * Nutzt die beitragskalender Tabelle für geplante/wiederkehrende Beiträge
   * und member_transactions für bereits verarbeitete Transaktionen
   */
  async getBeitragskontoEntries(
    memberId: string, 
    options?: { includeHistorical?: boolean; limit?: number }
  ): Promise<APIResponse<any[]>> {
    try {
      console.log('🔧 getBeitragskontoEntries called for memberId:', memberId, 'options:', options);
      
      const { includeHistorical = false, limit = 8 } = options || {};
      
      // Query beitragskalender für zukünftige/geplante Beiträge
      let beitragsQuery = supabase
        .from('beitragskalender_overview')
        .select('*')
        .eq('member_id', memberId);

      // Filter historische Einträge falls nicht gewünscht
      if (!includeHistorical) {
        const today = new Date().toISOString().split('T')[0];
        beitragsQuery = beitragsQuery.gte('due_date', today);
      }

      beitragsQuery = beitragsQuery
        .order('due_date', { ascending: true })
        .limit(limit);

      const { data: beitragsData, error: beitragsError } = await beitragsQuery;

      if (beitragsError) {
        console.error('Error fetching beitragskalender:', beitragsError);
        throw new Error(`Beitragskalender Error: ${beitragsError.message}`);
      }

      // Konvertiere zu BeitragskontoEntry Format
      const entries = (beitragsData || []).map(entry => ({
        id: entry.id,
        faelligkeit: entry.due_date + 'T00:00:00Z', // ISO Format
        typ: this.mapTransactionType(entry.transaction_type),
        beschreibung: entry.description || `${entry.transaction_type} ${new Date(entry.due_date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
        lastschriftgruppe: entry.zahllaufgruppe_id || 'Standard',
        betrag: parseFloat(entry.amount) || 0,
        ust: 19, // Standard UST-Satz
        zahlweise: 'Lastschrift' as const,
        offen: this.calculateOffenBetrag(entry),
        status: this.mapStatusToBeitragskontoStatus(entry.status, entry.effective_status)
      }));

      console.log('✅ Beitragskonto-Einträge geladen:', entries.length);
      
      return { 
        success: true, 
        data: entries
      };
      
    } catch (error) {
      console.error('Error in getBeitragskontoEntries:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch beitragskonto entries'
      };
    }
  }

  /**
   * Hilfsfunktion: Mappe transaction_type zu UI-kompatiblen Typen
   */
  private mapTransactionType(dbType: string): string {
    const typeMapping: Record<string, string> = {
      'membership_fee': 'membership_fee',
      'beitrag': 'beitrag',
      'setup_fee': 'setup_fee',
      'startpaket': 'startpaket',
      'pauschale': 'pauschale',
      'gebuehr': 'gebuehr',
      'penalty_fee': 'penalty_fee',
      'modul': 'modul'
    };
    
    return typeMapping[dbType] || dbType;
  }

  /**
   * Hilfsfunktion: Berechne offenen Betrag basierend auf Status
   */
  private calculateOffenBetrag(entry: any): number {
    const amount = parseFloat(entry.amount) || 0;
    
    // Bei verarbeiteten/bezahlten Einträgen ist nichts offen
    if (entry.status === 'processed' || entry.effective_status === 'processed') {
      return 0;
    }
    
    // Bei geplanten Einträgen ist der volle Betrag offen
    if (entry.status === 'scheduled' || entry.effective_status === 'upcoming') {
      return amount;
    }
    
    // Bei überfälligen Einträgen ist der volle Betrag offen
    if (entry.effective_status === 'overdue') {
      return amount;
    }
    
    // Default: voller Betrag offen
    return amount;
  }

  /**
   * Hilfsfunktion: Mappe DB-Status zu UI-Status
   */
  private mapStatusToBeitragskontoStatus(dbStatus: string, effectiveStatus?: string): string {
    if (effectiveStatus) {
      const effectiveMapping: Record<string, string> = {
        'overdue': 'offen',
        'due_today': 'offen', 
        'upcoming': 'geplant',
        'processed': 'bezahlt'
      };
      
      if (effectiveMapping[effectiveStatus]) {
        return effectiveMapping[effectiveStatus];
      }
    }
    
    const statusMapping: Record<string, string> = {
      'scheduled': 'geplant',
      'processing': 'offen',
      'processed': 'bezahlt',
      'failed': 'ruecklastschrift',
      'cancelled': 'offen',
      'suspended': 'offen'
    };
    
    return statusMapping[dbStatus] || 'offen';
  }
} 