// Payment System API Layer
// Comprehensive API functions for managing payment members, accounts, and transactions

import { createClient } from '@supabase/supabase-js';
import { 
  PaymentMember, 
  MemberAccount, 
  MemberTransaction, 
  PaymentGroup, 
  PaymentRun, 
  PaymentRunItem, 
  StudioSettings,
  ExtractedMemberData,
  PaymentSystemAPIResponse,
  TransactionType,
  PaymentRunStatus
} from '../types/payment-system';

// Initialize Supabase client (using environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class PaymentSystemAPI {
  
  // ============== PAYMENT MEMBERS ==============
  
  /**
   * Create new payment member from extracted PDF data
   */
  async createPaymentMember(memberData: ExtractedMemberData, paymentGroupId?: string): Promise<PaymentSystemAPIResponse<PaymentMember>> {
    try {
      const newMember = {
        member_number: memberData.memberNumber || `AUTO-${Date.now()}`,
        first_name: memberData.firstName,
        last_name: memberData.lastName,
        birth_date: memberData.birthDate ? new Date(memberData.birthDate) : null,
        address: memberData.address,
        phone: memberData.phone,
        email: memberData.email,
        contract_start_date: memberData.contractStartDate ? new Date(memberData.contractStartDate) : null,
        payment_group_id: paymentGroupId,
        is_active: true,
        notes: `Erstellt aus PDF-Import am ${new Date().toLocaleDateString()}`
      };
      
      const { data, error } = await supabase
        .from('payment_members')
        .insert([newMember])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformMemberFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment member'
      };
    }
  }
  
  /**
   * Get all payment members with optional filtering
   */
  async getPaymentMembers(filters?: {
    isActive?: boolean;
    paymentGroupId?: string;
    search?: string;
  }): Promise<PaymentSystemAPIResponse<PaymentMember[]>> {
    try {
      let query = supabase
        .from('payment_members')
        .select(`
          *,
          payment_groups(name),
          member_accounts(current_balance, iban)
        `);
      
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      
      if (filters?.paymentGroupId) {
        query = query.eq('payment_group_id', filters.paymentGroupId);
      }
      
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,member_number.ilike.%${filters.search}%`);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data: data.map(this.transformMemberFromDB)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment members'
      };
    }
  }
  
  /**
   * Get single payment member by ID
   */
  async getPaymentMember(id: string): Promise<PaymentSystemAPIResponse<PaymentMember>> {
    try {
      const { data, error } = await supabase
        .from('payment_members')
        .select(`
          *,
          payment_groups(name),
          member_accounts(*),
          member_transactions(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformMemberFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment member'
      };
    }
  }
  
  /**
   * Update payment member
   */
  async updatePaymentMember(id: string, updates: Partial<PaymentMember>): Promise<PaymentSystemAPIResponse<PaymentMember>> {
    try {
      const { data, error } = await supabase
        .from('payment_members')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          birth_date: updates.birthDate,
          address: updates.address,
          phone: updates.phone,
          email: updates.email,
          payment_group_id: updates.paymentGroupId,
          is_active: updates.isActive,
          notes: updates.notes,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformMemberFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update payment member'
      };
    }
  }
  
  // ============== MEMBER ACCOUNTS ==============
  
  /**
   * Create member account with SEPA data
   */
  async createMemberAccount(memberId: string, accountData: {
    iban: string;
    mandateReference: string;
    mandateSignedDate?: Date;
    initialBalance?: number;
  }): Promise<PaymentSystemAPIResponse<MemberAccount>> {
    try {
      const newAccount = {
        payment_member_id: memberId,
        iban: accountData.iban,
        mandate_reference: accountData.mandateReference,
        mandate_signed_date: accountData.mandateSignedDate,
        current_balance: accountData.initialBalance || 0,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('member_accounts')
        .insert([newAccount])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformAccountFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create member account'
      };
    }
  }
  
  /**
   * Get member account by member ID
   */
  async getMemberAccount(memberId: string): Promise<PaymentSystemAPIResponse<MemberAccount>> {
    try {
      const { data, error } = await supabase
        .from('member_accounts')
        .select('*')
        .eq('payment_member_id', memberId)
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformAccountFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch member account'
      };
    }
  }
  
  // ============== MEMBER TRANSACTIONS ==============
  
  /**
   * Create member transaction
   */
  async createMemberTransaction(transactionData: {
    paymentMemberId: string;
    transactionType: TransactionType;
    amount: number;
    description?: string;
    referenceDate: Date;
    processedBy?: string;
  }): Promise<PaymentSystemAPIResponse<MemberTransaction>> {
    try {
      const newTransaction = {
        payment_member_id: transactionData.paymentMemberId,
        transaction_type: transactionData.transactionType,
        amount: transactionData.amount,
        description: transactionData.description,
        reference_date: transactionData.referenceDate,
        processed_by: transactionData.processedBy,
        is_reversed: false
      };
      
      const { data, error } = await supabase
        .from('member_transactions')
        .insert([newTransaction])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformTransactionFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create member transaction'
      };
    }
  }
  
  /**
   * Get member transactions with filtering
   */
  async getMemberTransactions(memberId: string, filters?: {
    transactionType?: TransactionType;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
  }): Promise<PaymentSystemAPIResponse<MemberTransaction[]>> {
    try {
      let query = supabase
        .from('member_transactions')
        .select('*')
        .eq('payment_member_id', memberId);
      
      if (filters?.transactionType) {
        query = query.eq('transaction_type', filters.transactionType);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('reference_date', filters.dateFrom.toISOString());
      }
      
      if (filters?.dateTo) {
        query = query.lte('reference_date', filters.dateTo.toISOString());
      }
      
      query = query.order('reference_date', { ascending: false });
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data: data.map(this.transformTransactionFromDB)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch member transactions'
      };
    }
  }
  
  // ============== PAYMENT GROUPS ==============
  
  /**
   * Get all payment groups
   */
  async getPaymentGroups(): Promise<PaymentSystemAPIResponse<PaymentGroup[]>> {
    try {
      const { data, error } = await supabase
        .from('payment_groups')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      return {
        success: true,
        data: data.map(this.transformPaymentGroupFromDB)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment groups'
      };
    }
  }
  
  /**
   * Create payment group
   */
  async createPaymentGroup(groupData: {
    name: string;
    description?: string;
    paymentDay: number;
  }): Promise<PaymentSystemAPIResponse<PaymentGroup>> {
    try {
      const newGroup = {
        name: groupData.name,
        description: groupData.description,
        payment_day: groupData.paymentDay,
        is_active: true
      };
      
      const { data, error } = await supabase
        .from('payment_groups')
        .insert([newGroup])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformPaymentGroupFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment group'
      };
    }
  }
  
  // ============== PAYMENT RUNS ==============
  
  /**
   * Create payment run
   */
  async createPaymentRun(runData: {
    name: string;
    paymentGroupId: string;
    executionDate: Date;
    processedBy: string;
    notes?: string;
  }): Promise<PaymentSystemAPIResponse<PaymentRun>> {
    try {
      const newRun = {
        name: runData.name,
        payment_group_id: runData.paymentGroupId,
        execution_date: runData.executionDate,
        status: 'draft' as PaymentRunStatus,
        total_amount: 0,
        item_count: 0,
        processed_by: runData.processedBy,
        notes: runData.notes
      };
      
      const { data, error } = await supabase
        .from('payment_runs')
        .insert([newRun])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformPaymentRunFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment run'
      };
    }
  }
  
  /**
   * Get payment runs with filtering
   */
  async getPaymentRuns(filters?: {
    status?: PaymentRunStatus;
    paymentGroupId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<PaymentSystemAPIResponse<PaymentRun[]>> {
    try {
      let query = supabase
        .from('payment_runs')
        .select(`
          *,
          payment_groups(name)
        `);
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.paymentGroupId) {
        query = query.eq('payment_group_id', filters.paymentGroupId);
      }
      
      if (filters?.dateFrom) {
        query = query.gte('execution_date', filters.dateFrom.toISOString());
      }
      
      if (filters?.dateTo) {
        query = query.lte('execution_date', filters.dateTo.toISOString());
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data: data.map(this.transformPaymentRunFromDB)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment runs'
      };
    }
  }
  
  // ============== STUDIO SETTINGS ==============
  
  /**
   * Get studio settings
   */
  async getStudioSettings(): Promise<PaymentSystemAPIResponse<StudioSettings>> {
    try {
      const { data, error } = await supabase
        .from('studio_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformStudioSettingsFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch studio settings'
      };
    }
  }
  
  /**
   * Update studio settings
   */
  async updateStudioSettings(settings: Partial<StudioSettings>): Promise<PaymentSystemAPIResponse<StudioSettings>> {
    try {
      const updates = {
        studio_name: settings.studioName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        sepa_creditor_id: settings.sepaCreditorId,
        sepa_creditor_name: settings.sepaCreditorName,
        bank_name: settings.bankName,
        bank_bic: settings.bankBic,
        updated_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('studio_settings')
        .upsert(updates)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: this.transformStudioSettingsFromDB(data)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update studio settings'
      };
    }
  }
  
  // ============== HELPER TRANSFORM METHODS ==============
  
  private transformMemberFromDB(data: any): PaymentMember {
    return {
      id: data.id,
      memberNumber: data.member_number,
      firstName: data.first_name,
      lastName: data.last_name,
      birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
      address: data.address,
      phone: data.phone,
      email: data.email,
      contractStartDate: data.contract_start_date ? new Date(data.contract_start_date) : undefined,
      contractId: data.contract_id,
      paymentGroupId: data.payment_group_id,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private transformAccountFromDB(data: any): MemberAccount {
    return {
      id: data.id,
      paymentMemberId: data.payment_member_id,
      iban: data.iban,
      mandateReference: data.mandate_reference,
      mandateSignedDate: data.mandate_signed_date ? new Date(data.mandate_signed_date) : undefined,
      currentBalance: parseFloat(data.current_balance),
      lastPaymentDate: data.last_payment_date ? new Date(data.last_payment_date) : undefined,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private transformTransactionFromDB(data: any): MemberTransaction {
    return {
      id: data.id,
      paymentMemberId: data.payment_member_id,
      transactionType: data.transaction_type,
      amount: parseFloat(data.amount),
      description: data.description,
      referenceDate: new Date(data.reference_date),
      processedBy: data.processed_by,
      paymentRunId: data.payment_run_id,
      isReversed: data.is_reversed,
      reversalReason: data.reversal_reason,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private transformPaymentGroupFromDB(data: any): PaymentGroup {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      paymentDay: data.payment_day,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private transformPaymentRunFromDB(data: any): PaymentRun {
    return {
      id: data.id,
      name: data.name,
      paymentGroupId: data.payment_group_id,
      executionDate: new Date(data.execution_date),
      status: data.status,
      totalAmount: parseFloat(data.total_amount),
      itemCount: data.item_count,
      xmlFilePath: data.xml_file_path,
      processedBy: data.processed_by,
      submittedAt: data.submitted_at ? new Date(data.submitted_at) : undefined,
      processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  private transformStudioSettingsFromDB(data: any): StudioSettings {
    return {
      id: data.id,
      studioName: data.studio_name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      sepaCreditorId: data.sepa_creditor_id,
      sepaCreditorName: data.sepa_creditor_name,
      bankName: data.bank_name,
      bankBic: data.bank_bic,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

// Export singleton instance
export const paymentSystemAPI = new PaymentSystemAPI(); 