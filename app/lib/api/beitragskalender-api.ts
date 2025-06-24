// Beitragskalender API Service (24.06.2025)

import type {
  BeitragskalenderEntry,
  BeitragskalenderOverview,
  BeitragskalenderListResponse,
  BeitragskalenderStatistics,
  BeitragskalenderFilters,
  CreateBeitragskalenderEntryRequest,
  UpdateBeitragskalenderEntryRequest,
  GenerateBeitragskalenderRequest,
  ProcessBeitragskalenderRequest,
  ProcessBeitragskalenderResponse,
  BulkUpdateBeitragskalenderRequest,
  BulkCancelBeitragskalenderRequest,
  MemberBeitragskalenderSummary,
  BeitragskalenderResult
} from '../types/beitragskalender';

const API_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Base API Client
class BeitragskalenderAPIClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor() {
    this.baseURL = `${API_BASE_URL}/rest/v1`;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': API_KEY,
      'Authorization': `Bearer ${API_KEY}`
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`BeitragskalenderAPI ${endpoint}:`, error);
      throw error;
    }
  }

  // CRUD-Operationen

  /**
   * LISTE - Beitragskalender mit Filtern und Pagination
   */
  async getBeitragskalenderList(filters: BeitragskalenderFilters = {}): Promise<BeitragskalenderListResponse> {
    const params = new URLSearchParams();
    
    // Basis-Filter
    if (filters.member_ids?.length) {
      params.append('member_id', `in.(${filters.member_ids.join(',')})`);
    }
    if (filters.status?.length) {
      params.append('status', `in.(${filters.status.join(',')})`);
    }
    if (filters.transaction_types?.length) {
      params.append('transaction_type', `in.(${filters.transaction_types.join(',')})`);
    }
    
    // Datum-Filter
    if (filters.due_date_from) {
      params.append('due_date', `gte.${filters.due_date_from}`);
    }
    if (filters.due_date_to) {
      params.append('due_date', `lte.${filters.due_date_to}`);
    }

    // Betrag-Filter
    if (filters.amount_min !== undefined) {
      params.append('amount', `gte.${filters.amount_min}`);
    }
    if (filters.amount_max !== undefined) {
      params.append('amount', `lte.${filters.amount_max}`);
    }

    // Sortierung
    if (filters.sort_by) {
      const order = filters.sort_order === 'desc' ? `${filters.sort_by}.desc` : `${filters.sort_by}.asc`;
      params.append('order', order);
    } else {
      params.append('order', 'due_date.asc');
    }

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.page_size || 50;
    const offset = (page - 1) * pageSize;
    
    params.append('limit', pageSize.toString());
    params.append('offset', offset.toString());

    // Verwende beitragskalender_overview für erweiterte Daten
    const entries = await this.request<BeitragskalenderOverview[]>(
      `/beitragskalender_overview?${params.toString()}`
    );

    // Separate Statistik-Abfrage
    const statistics = await this.getBeitragskalenderStatistics(filters);

    // Total Count für Pagination
    const countParams = new URLSearchParams(params);
    countParams.delete('limit');
    countParams.delete('offset');
    countParams.delete('order');
    
    const countResponse = await this.request<{ count: number }[]>(
      `/beitragskalender?${countParams.toString()}&select=count`
    );
    const totalCount = countResponse[0]?.count || 0;

    return {
      entries,
      total_count: totalCount,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(totalCount / pageSize),
      statistics,
      filters_applied: filters
    };
  }

  /**
   * EINZELNER EINTRAG - Get by ID
   */
  async getBeitragskalenderEntry(id: string): Promise<BeitragskalenderEntry> {
    return await this.request<BeitragskalenderEntry>(`/beitragskalender?id=eq.${id}&select=*`);
  }

  /**
   * MITGLIED-KALENDER - Alle Einträge für ein Mitglied
   */
  async getMemberBeitragskalender(memberId: string): Promise<BeitragskalenderOverview[]> {
    return await this.request<BeitragskalenderOverview[]>(
      `/beitragskalender_overview?member_id=eq.${memberId}&order=due_date.asc`
    );
  }

  /**
   * ERSTELLEN - Neuer Beitragskalender-Eintrag
   */
  async createBeitragskalenderEntry(data: CreateBeitragskalenderEntryRequest): Promise<BeitragskalenderEntry> {
    const response = await this.request<BeitragskalenderEntry[]>('/beitragskalender', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      headers: {
        'Prefer': 'return=representation'
      }
    });

    return response[0];
  }

  /**
   * AKTUALISIEREN - Bestehender Eintrag
   */
  async updateBeitragskalenderEntry(id: string, data: UpdateBeitragskalenderEntryRequest): Promise<BeitragskalenderEntry> {
    const response = await this.request<BeitragskalenderEntry[]>(`/beitragskalender?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        updated_at: new Date().toISOString()
      }),
      headers: {
        'Prefer': 'return=representation'
      }
    });

    return response[0];
  }

  /**
   * LÖSCHEN - Eintrag entfernen
   */
  async deleteBeitragskalenderEntry(id: string): Promise<void> {
    await this.request(`/beitragskalender?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * KALENDER GENERIEREN - Automatische Erstellung für Mitglied
   */
  async generateMemberBeitragskalender(data: GenerateBeitragskalenderRequest): Promise<BeitragskalenderResult> {
    try {
      console.log('🔄 API: Generating Beitragskalender for member', data.member_id);

      // Rufe die PostgreSQL-Funktion auf
      const response = await this.request<{
        created_count: number;
        total_amount: number;
        first_due_date: string;
        last_due_date: string;
      }[]>('/rpc/generate_member_beitragskalender', {
        method: 'POST',
        body: JSON.stringify({
          p_member_id: data.member_id,
          p_vertrags_id: data.vertrags_id,
          p_start_date: data.start_date,
          p_end_date: data.end_date,
          p_base_amount: data.base_amount,
          p_transaction_types: data.transaction_types,
          p_payment_schedule: data.payment_schedule,
          p_zahllaufgruppe_id: data.zahllaufgruppe_id || 'default_group'
        })
      });

      const result = response[0];
      
      // Lade die erstellten Einträge
      const createdEntries = await this.getMemberBeitragskalender(data.member_id);

      return {
        success: true,
        created_entries: createdEntries,
        total_amount: result.total_amount,
        schedule_summary: {
          frequency: data.payment_schedule,
          duration_months: this.calculateDurationMonths(data.start_date, data.end_date),
          entries_count: result.created_count,
          next_due_date: result.first_due_date
        }
      };

    } catch (error) {
      console.error('❌ Failed to generate Beitragskalender:', error);
      return {
        success: false,
        created_entries: [],
        total_amount: 0,
        schedule_summary: {
          frequency: data.payment_schedule,
          duration_months: 0,
          entries_count: 0,
          next_due_date: data.start_date
        },
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * VERARBEITUNG - Einträge als verarbeitet markieren
   */
  async processBeitragskalenderEntries(data: ProcessBeitragskalenderRequest): Promise<ProcessBeitragskalenderResponse> {
    const results: ProcessBeitragskalenderResponse['results'] = [];
    let processedCount = 0;
    let failedCount = 0;
    let totalProcessedAmount = 0;

    for (const entryId of data.entry_ids) {
      try {
        const entry = await this.updateBeitragskalenderEntry(entryId, {
          status: 'processed',
          notes: data.notes ? `${data.notes} - Verarbeitet am ${new Date().toLocaleDateString('de-DE')}` : undefined
        });

        results.push({
          entry_id: entryId,
          success: true,
          processed_amount: entry.amount
        });

        processedCount++;
        totalProcessedAmount += entry.amount;

      } catch (error) {
        results.push({
          entry_id: entryId,
          success: false,
          error: error instanceof Error ? error.message : 'Verarbeitung fehlgeschlagen'
        });
        failedCount++;
      }
    }

    return {
      success: processedCount > 0,
      processed_count: processedCount,
      failed_count: failedCount,
      results,
      total_processed_amount: totalProcessedAmount,
      processing_summary: `${processedCount} von ${data.entry_ids.length} Einträgen erfolgreich verarbeitet. Gesamtbetrag: ${totalProcessedAmount.toFixed(2)}€`
    };
  }

  /**
   * BULK-UPDATE - Mehrere Einträge gleichzeitig aktualisieren
   */
  async bulkUpdateBeitragskalender(data: BulkUpdateBeitragskalenderRequest): Promise<BeitragskalenderEntry[]> {
    const response = await this.request<BeitragskalenderEntry[]>(
      `/beitragskalender?id=in.(${data.entry_ids.join(',')})`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          ...data.updates,
          updated_at: new Date().toISOString()
        }),
        headers: {
          'Prefer': 'return=representation'
        }
      }
    );

    return response;
  }

  /**
   * BULK-CANCEL - Mehrere Einträge stornieren
   */
  async bulkCancelBeitragskalender(data: BulkCancelBeitragskalenderRequest): Promise<BeitragskalenderEntry[]> {
    return await this.bulkUpdateBeitragskalender({
      entry_ids: data.entry_ids,
      updates: {
        status: 'cancelled',
        notes: `Storniert: ${data.cancellation_reason}`
      }
    });
  }

  /**
   * STATISTIKEN - Beitragskalender-Übersicht
   */
  async getBeitragskalenderStatistics(filters: BeitragskalenderFilters = {}): Promise<BeitragskalenderStatistics> {
    // Basis-Statistiken
    const allEntries = await this.request<BeitragskalenderOverview[]>(
      `/beitragskalender_overview?${this.buildFilterQuery(filters)}`
    );

    const totalEntries = allEntries.length;
    const scheduledCount = allEntries.filter(e => e.status === 'scheduled').length;
    const processedCount = allEntries.filter(e => e.status === 'processed').length;
    const failedCount = allEntries.filter(e => e.status === 'failed').length;
    const overdueCount = allEntries.filter(e => e.effective_status === 'overdue').length;

    const totalScheduledAmount = allEntries
      .filter(e => e.status === 'scheduled')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalProcessedAmount = allEntries
      .filter(e => e.status === 'processed')
      .reduce((sum, e) => sum + e.amount, 0);

    // Nächste Fälligkeit
    const nextDueEntry = allEntries
      .filter(e => e.status === 'scheduled' && new Date(e.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

    // Kommende Zahlungen
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcoming7Days = allEntries.filter(e => 
      e.status === 'scheduled' && 
      new Date(e.due_date) >= today && 
      new Date(e.due_date) <= in7Days
    ).length;

    const upcoming30Days = allEntries.filter(e => 
      e.status === 'scheduled' && 
      new Date(e.due_date) >= today && 
      new Date(e.due_date) <= in30Days
    ).length;

    // Gruppierung nach Transaktionstyp
    const byTransactionType = this.groupByTransactionType(allEntries);
    const byStatus = this.groupByStatus(allEntries, totalEntries);

    return {
      total_entries: totalEntries,
      scheduled_count: scheduledCount,
      processed_count: processedCount,
      failed_count: failedCount,
      overdue_count: overdueCount,
      
      total_scheduled_amount: totalScheduledAmount,
      total_processed_amount: totalProcessedAmount,
      
      next_due_date: nextDueEntry?.due_date,
      upcoming_7_days: upcoming7Days,
      upcoming_30_days: upcoming30Days,
      
      by_transaction_type: byTransactionType,
      by_status: byStatus
    };
  }

  /**
   * MITGLIED-ZUSAMMENFASSUNG - Kalender-Übersicht für ein Mitglied
   */
  async getMemberBeitragskalenderSummary(memberId: string): Promise<MemberBeitragskalenderSummary> {
    const entries = await this.getMemberBeitragskalender(memberId);
    
    const scheduledEntries = entries.filter(e => e.status === 'scheduled');
    const processedEntries = entries.filter(e => e.status === 'processed');
    const overdueEntries = entries.filter(e => e.effective_status === 'overdue');

    const nextDue = scheduledEntries
      .filter(e => new Date(e.due_date) >= new Date())
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

    const lastProcessed = processedEntries
      .sort((a, b) => new Date(b.processed_at || '').getTime() - new Date(a.processed_at || '').getTime())[0];

    return {
      member_id: memberId,
      member_name: `Mitglied ${memberId}`, // TODO: Lade echten Namen
      
      total_entries: entries.length,
      scheduled_amount: scheduledEntries.reduce((sum, e) => sum + e.amount, 0),
      processed_amount: processedEntries.reduce((sum, e) => sum + e.amount, 0),
      
      next_due_date: nextDue?.due_date,
      next_due_amount: nextDue?.amount,
      
      overdue_entries: overdueEntries.length,
      overdue_amount: overdueEntries.reduce((sum, e) => sum + e.amount, 0),
      
      last_processed_date: lastProcessed?.processed_at,
      last_processed_amount: lastProcessed?.amount,
      
      contract_end_date: entries[0]?.recurrence_end_date,
      remaining_payments: scheduledEntries.length
    };
  }

  // HELPER METHODS

  private buildFilterQuery(filters: BeitragskalenderFilters): string {
    const params = new URLSearchParams();
    
    if (filters.member_ids?.length) {
      params.append('member_id', `in.(${filters.member_ids.join(',')})`);
    }
    if (filters.status?.length) {
      params.append('status', `in.(${filters.status.join(',')})`);
    }
    
    return params.toString();
  }

  private calculateDurationMonths(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Approximation
  }

  private groupByTransactionType(entries: BeitragskalenderOverview[]) {
    const groups = new Map();
    
    entries.forEach(entry => {
      if (!groups.has(entry.transaction_type)) {
        groups.set(entry.transaction_type, { count: 0, total_amount: 0 });
      }
      const group = groups.get(entry.transaction_type);
      group.count++;
      group.total_amount += entry.amount;
    });

    return Array.from(groups.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      total_amount: data.total_amount
    }));
  }

  private groupByStatus(entries: BeitragskalenderOverview[], total: number) {
    const groups = new Map();
    
    entries.forEach(entry => {
      if (!groups.has(entry.status)) {
        groups.set(entry.status, 0);
      }
      groups.set(entry.status, groups.get(entry.status) + 1);
    });

    return Array.from(groups.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }
}

// Singleton Instance
export const beitragskalenderAPI = new BeitragskalenderAPIClient();

// Export individual methods for convenience
export const {
  getBeitragskalenderList,
  getBeitragskalenderEntry,
  getMemberBeitragskalender,
  createBeitragskalenderEntry,
  updateBeitragskalenderEntry,
  deleteBeitragskalenderEntry,
  generateMemberBeitragskalender,
  processBeitragskalenderEntries,
  bulkUpdateBeitragskalender,
  bulkCancelBeitragskalender,
  getBeitragskalenderStatistics,
  getMemberBeitragskalenderSummary
} = beitragskalenderAPI;

export default beitragskalenderAPI; 