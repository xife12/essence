interface BeitragskalenderEntry {
  id?: string;
  member_id: string;
  due_date: string;
  transaction_type: 'membership_fee' | 'pauschale' | 'sonderumlage' | 'adjustment';
  amount: number;
  status: 'scheduled' | 'overdue' | 'paid' | 'cancelled';
  created_by: string;
  description?: string;
  audit_trail?: any;
  payment_date?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

interface BeitragskalenderGenerationOptions {
  member_id: string;
  start_date: string;
  end_date?: string;
  membership_fee: number;
  payment_interval: 'monthly' | 'quarterly' | 'yearly';
  payment_day?: number;
  setup_fee?: number;
  administration_fee?: number;
  key_card_fee?: number;
  contract_tariff?: string;
  source?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class BeitragskalenderAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  /**
   * Generate automatic Beitragskalender entries for a member
   * Called from dual import after member creation
   */
  async generateBeitragskalender(options: BeitragskalenderGenerationOptions): Promise<ApiResponse<BeitragskalenderEntry[]>> {
    try {
      console.log('🗓️ Generating Beitragskalender for member:', options.member_id);
      
      const response = await fetch(`${this.baseUrl}/beitragskalender/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Generated ${result.data?.length || 0} Beitragskalender entries`);
      } else {
        console.error('❌ Beitragskalender generation failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Beitragskalender generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create individual Beitragskalender entry
   */
  async createEntry(entry: Omit<BeitragskalenderEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BeitragskalenderEntry>> {
    try {
      const response = await fetch(`${this.baseUrl}/beitragskalender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create Beitragskalender entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Bulk create multiple entries (for dual import)
   */
  async createBulkEntries(entries: Omit<BeitragskalenderEntry, 'id' | 'created_at' | 'updated_at'>[]): Promise<ApiResponse<BeitragskalenderEntry[]>> {
    try {
      console.log(`📋 Creating ${entries.length} Beitragskalender entries in bulk`);
      
      const response = await fetch(`${this.baseUrl}/beitragskalender/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entries })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Successfully created ${result.data?.length || 0} Beitragskalender entries`);
      }

      return result;
    } catch (error) {
      console.error('Bulk create Beitragskalender entries error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all entries for a specific member
   */
  async getMemberEntries(memberId: string): Promise<ApiResponse<BeitragskalenderEntry[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/beitragskalender/member/${memberId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get member Beitragskalender entries error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update entry status (for payment processing)
   */
  async updateEntryStatus(entryId: string, status: BeitragskalenderEntry['status'], paymentDate?: string, paymentMethod?: string): Promise<ApiResponse<BeitragskalenderEntry>> {
    try {
      const response = await fetch(`${this.baseUrl}/beitragskalender/${entryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          payment_date: paymentDate,
          payment_method: paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update Beitragskalender entry status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get dashboard statistics for Beitragskalender
   */
  async getDashboardStats(): Promise<ApiResponse<{
    totalScheduled: number;
    totalOverdue: number;
    totalPaid: number;
    monthlyRevenue: number;
    upcomingPayments: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/beitragskalender/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get Beitragskalender dashboard stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete entry (admin only)
   */
  async deleteEntry(entryId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/beitragskalender/${entryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete Beitragskalender entry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Search entries with filters
   */
  async searchEntries(filters: {
    member_id?: string;
    status?: BeitragskalenderEntry['status'];
    transaction_type?: BeitragskalenderEntry['transaction_type'];
    due_date_from?: string;
    due_date_to?: string;
    amount_min?: number;
    amount_max?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    entries: BeitragskalenderEntry[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/beitragskalender/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search Beitragskalender entries error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export type { BeitragskalenderEntry, BeitragskalenderGenerationOptions, ApiResponse }; 