// NEU: Business-Logic-Engine für automatisierte Payment-Prozesse (24.06.2025)

import type { TransactionType } from '../../../lib/types/payment-system';

// Business-Logic Interfaces
export interface StillegungConfig {
  member_id: string;
  start_date: string; // ISO Date
  end_date: string; // ISO Date
  reason: 'urlaub' | 'krankheit' | 'sonderfall';
  is_retroactive: boolean; // Rückwirkend?
  affected_transactions?: string[]; // IDs bereits erfolgter Abbuchungen
}

export interface StillegungResult {
  success: boolean;
  credit_amount?: number; // Gutschrift bei rückwirkender Stillegung
  extended_end_date?: string; // Verlängertes Vertragsende
  blocked_future_charges: string[]; // Blockierte zukünftige Abbuchungen
  created_transactions: string[]; // Neu erstellte Transaktionen (Gutschriften)
  error?: string;
}

export interface KuendigungConfig {
  member_id: string;
  kuendigung_date: string; // ISO Date
  kuendigung_type: 'sonderkuendigungsrecht' | 'studio_initiated' | 'regular';
  reason: string;
  effective_date: string; // ISO Date - Wann wird es wirksam
  refund_policy: 'full' | 'partial' | 'none';
}

export interface KuendigungResult {
  success: boolean;
  refund_amount?: number; // Erstattungsbetrag
  cancelled_future_charges: string[]; // Stornierte zukünftige Abbuchungen
  final_billing_date: string; // Letzter Abrechnungstag
  created_transactions: string[]; // Neu erstellte Transaktionen
  error?: string;
}

export interface GuthabenVerrechnungConfig {
  member_id: string;
  available_credit: number;
  upcoming_charges: {
    id: string;
    amount: number;
    due_date: string;
    transaction_type: TransactionType;
  }[];
  auto_apply: boolean; // Automatisch verrechnen?
}

export interface GuthabenVerrechnungResult {
  success: boolean;
  applied_credit: number;
  remaining_credit: number;
  offset_charges: {
    charge_id: string;
    offset_amount: number;
    remaining_amount: number;
  }[];
  created_transactions: string[]; // Verrechnungsbuchungen
  error?: string;
}

// Main Business Logic Engine
export class BusinessLogicEngine {
  
  /**
   * STILLEGUNG-PROZESS
   * Automatische Handhabung von Mitgliedschafts-Stillegungen mit Gutschrift-Berechnung
   */
  static async processStillegung(config: StillegungConfig): Promise<StillegungResult> {
    try {
      console.log('🔄 BusinessLogicEngine: Processing Stillegung for member', config.member_id);
      
      const result: StillegungResult = {
        success: true,
        blocked_future_charges: [],
        created_transactions: []
      };

      // 1. Rückwirkende Stillegung → Gutschrift berechnen
      if (config.is_retroactive && config.affected_transactions) {
        let creditAmount = 0;
        
        for (const transactionId of config.affected_transactions) {
          // TODO: Lade Transaction Details
          // const transaction = await PaymentSystemAPI.getTransaction(transactionId);
          
          // MOCK: Berechne Gutschrift für bereits erfolgte Abbuchung
          const mockTransactionAmount = 89.90; // Mock-Wert
          creditAmount += mockTransactionAmount;
          
          // TODO: Erstelle Gutschrift-Transaction
          // const creditTransaction = await PaymentSystemAPI.createTransaction({
          //   member_id: config.member_id,
          //   type: 'correction',
          //   amount: -mockTransactionAmount, // Negativ = Gutschrift
          //   description: `Gutschrift Stillegung ${config.start_date} - ${config.end_date}`,
          //   business_logic_trigger: 'stillegung_retroactive'
          // });
          
          const mockCreditTransactionId = `credit_${Date.now()}_${transactionId}`;
          result.created_transactions.push(mockCreditTransactionId);
        }
        
        result.credit_amount = creditAmount;
        console.log(`💰 Gutschrift berechnet: ${creditAmount}€ für rückwirkende Stillegung`);
      }

      // 2. Zukünftige Beiträge auf 0 setzen für Stillegungszeit
      const stillegungDuration = this.calculateDaysBetween(config.start_date, config.end_date);
      
      // TODO: Finde alle zukünftigen Abbuchungen im Stillegungszeitraum
      // const futureCharges = await PaymentSystemAPI.getFutureCharges(config.member_id, config.start_date, config.end_date);
      
      // MOCK: Blockiere zukünftige Abbuchungen
      const mockFutureCharges = ['charge_2025_07', 'charge_2025_08']; // Mock IDs
      for (const chargeId of mockFutureCharges) {
        // TODO: Setze Beitrag auf 0 oder markiere als stillgelegt
        result.blocked_future_charges.push(chargeId);
      }

      // 3. Vertragslaufzeit um Stillegungsdauer verlängern
      if (stillegungDuration > 0) {
        // TODO: Ermittle aktuelles Vertragsende
        // const currentContract = await MemberAPI.getContract(config.member_id);
        
        // MOCK: Verlängere Vertragsende
        const mockCurrentEndDate = new Date('2026-01-15');
        const newEndDate = new Date(mockCurrentEndDate.getTime() + (stillegungDuration * 24 * 60 * 60 * 1000));
        result.extended_end_date = newEndDate.toISOString();
        
        console.log(`📅 Vertragsende verlängert um ${stillegungDuration} Tage auf ${result.extended_end_date}`);
      }

      return result;
      
    } catch (error) {
      console.error('❌ BusinessLogicEngine: Stillegung failed', error);
      return {
        success: false,
        blocked_future_charges: [],
        created_transactions: [],
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * KÜNDIGUNGS-PROZESS
   * Automatische Handhabung bei Sonderkündigungsrecht und Studio-initiierten Kündigungen
   */
  static async processKuendigung(config: KuendigungConfig): Promise<KuendigungResult> {
    try {
      console.log('🔄 BusinessLogicEngine: Processing Kündigung for member', config.member_id);
      
      const result: KuendigungResult = {
        success: true,
        cancelled_future_charges: [],
        created_transactions: [],
        final_billing_date: config.effective_date
      };

      // 1. Sonderkündigungsrecht oder Studio-Kündigung → Vollerstattung
      if (config.kuendigung_type === 'sonderkuendigungsrecht' || config.kuendigung_type === 'studio_initiated') {
        if (config.refund_policy === 'full') {
          // TODO: Berechne Erstattung für bereits gezahlte, aber nicht erbrachte Leistungen
          // const paidTransactions = await PaymentSystemAPI.getPaidTransactionsAfterDate(config.member_id, config.effective_date);
          
          // MOCK: Berechne Erstattung
          const mockRefundAmount = 179.80; // Mock: 2 Monate bereits bezahlt
          result.refund_amount = mockRefundAmount;
          
          // TODO: Erstelle Erstattungs-Transaction
          // const refundTransaction = await PaymentSystemAPI.createTransaction({
          //   member_id: config.member_id,
          //   type: 'refund',
          //   amount: -mockRefundAmount,
          //   description: `Erstattung ${config.kuendigung_type}: ${config.reason}`,
          //   business_logic_trigger: 'kuendigung_refund'
          // });
          
          const mockRefundTransactionId = `refund_${Date.now()}_${config.member_id}`;
          result.created_transactions.push(mockRefundTransactionId);
          
          console.log(`💰 Erstattung berechnet: ${mockRefundAmount}€ für ${config.kuendigung_type}`);
        }
      }

      // 2. Alle zukünftigen Abbuchungen ab Kündigungsdatum stornieren
      // TODO: Finde und storniere alle zukünftigen Abbuchungen
      // const futureCharges = await PaymentSystemAPI.getFutureChargesAfterDate(config.member_id, config.effective_date);
      
      // MOCK: Storniere zukünftige Abbuchungen
      const mockFutureCharges = ['charge_2025_08', 'charge_2025_09', 'charge_2025_10'];
      result.cancelled_future_charges = mockFutureCharges;

      // 3. Setze Mitgliedschaftsstatus auf gekündigt
      // TODO: Update Member Status
      // await MemberAPI.updateMemberStatus(config.member_id, 'cancelled', config.effective_date);

      return result;
      
    } catch (error) {
      console.error('❌ BusinessLogicEngine: Kündigung failed', error);
      return {
        success: false,
        cancelled_future_charges: [],
        created_transactions: [],
        final_billing_date: config.effective_date,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * GUTHABEN-VERRECHNUNG
   * Automatische Verrechnung von Guthaben mit offenen Forderungen
   */
  static async processGuthabenVerrechnung(config: GuthabenVerrechnungConfig): Promise<GuthabenVerrechnungResult> {
    try {
      console.log('🔄 BusinessLogicEngine: Processing Guthaben-Verrechnung for member', config.member_id);
      
      const result: GuthabenVerrechnungResult = {
        success: true,
        applied_credit: 0,
        remaining_credit: config.available_credit,
        offset_charges: [],
        created_transactions: []
      };

      let remainingCredit = config.available_credit;

      // Sortiere Forderungen nach Fälligkeit (älteste zuerst)
      const sortedCharges = config.upcoming_charges.sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );

      // Verrechne Guthaben mit Forderungen
      for (const charge of sortedCharges) {
        if (remainingCredit <= 0) break;

        const offsetAmount = Math.min(remainingCredit, charge.amount);
        const remainingChargeAmount = charge.amount - offsetAmount;

        result.offset_charges.push({
          charge_id: charge.id,
          offset_amount: offsetAmount,
          remaining_amount: remainingChargeAmount
        });

        remainingCredit -= offsetAmount;
        result.applied_credit += offsetAmount;

        // TODO: Erstelle Verrechnungs-Transaction
        // const offsetTransaction = await PaymentSystemAPI.createTransaction({
        //   member_id: config.member_id,
        //   type: 'correction',
        //   amount: -offsetAmount,
        //   description: `Guthaben-Verrechnung ${charge.transaction_type} ${new Date(charge.due_date).toLocaleDateString('de-DE')}`,
        //   business_logic_trigger: 'guthaben_verrechnung',
        //   reference_charge_id: charge.id
        // });

        const mockOffsetTransactionId = `offset_${Date.now()}_${charge.id}`;
        result.created_transactions.push(mockOffsetTransactionId);

        console.log(`💰 Verrechnung: ${offsetAmount}€ für Forderung ${charge.id}, verbleibt: ${remainingChargeAmount}€`);
      }

      result.remaining_credit = remainingCredit;
      
      console.log(`✅ Guthaben-Verrechnung abgeschlossen: ${result.applied_credit}€ verrechnet, ${result.remaining_credit}€ verbleibt`);

      return result;
      
    } catch (error) {
      console.error('❌ BusinessLogicEngine: Guthaben-Verrechnung failed', error);
      return {
        success: false,
        applied_credit: 0,
        remaining_credit: config.available_credit,
        offset_charges: [],
        created_transactions: [],
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * HELPER FUNCTIONS
   */
  private static calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * ORCHESTRATOR - Führt automatische Business-Logic basierend auf Triggers aus
   */
  static async executeAutomaticBusinessLogic(trigger: string, memberId: string, additionalData?: any): Promise<any> {
    console.log(`🤖 Auto-Executing Business Logic: ${trigger} for member ${memberId}`);
    
    switch (trigger) {
      case 'stillegung':
        return await this.processStillegung(additionalData as StillegungConfig);
      
      case 'kuendigung':
        return await this.processKuendigung(additionalData as KuendigungConfig);
      
      case 'guthaben_verrechnung':
        return await this.processGuthabenVerrechnung(additionalData as GuthabenVerrechnungConfig);
      
      default:
        console.warn(`⚠️ Unknown business logic trigger: ${trigger}`);
        return { success: false, error: 'Unknown trigger' };
    }
  }
}

export default BusinessLogicEngine; 