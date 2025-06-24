// NEU: Beitragskalender-Generator für automatische Kalender-Erstellung (24.06.2025)

// Beitragskonto-spezifische Transaction Types (unterschiedlich von MemberTransaction types)
type TransactionType = 'membership_fee' | 'pauschale' | 'modul' | 'setup_fee' | 'penalty_fee';

// Importiere korrekte Types
import type { 
  BeitragskalenderEntry, 
  BeitragskalenderConfig, 
  BeitragskalenderResult,
  PaymentSchedule 
} from '../types/beitragskalender';
import { beitragskalenderAPI } from '../api/beitragskalender-api';

// Main Beitragskalender Generator
export class BeitragskalenderGenerator {

  /**
   * HAUPT-GENERATOR
   * Erstellt vollständigen Beitragskalender basierend auf Vertragsdaten
   */
  static async generateBeitragskalender(config: BeitragskalenderConfig): Promise<BeitragskalenderResult> {
    try {
      console.log('🔄 BeitragskalenderGenerator: Creating calendar for member', config.member_id);
      
      // Verwende API statt direkte DB-Calls
      const generateRequest = {
        member_id: config.member_id,
        vertrags_id: config.vertrags_id,
        start_date: config.start_date,
        end_date: config.end_date,
        base_amount: config.base_amount,
        transaction_types: config.transaction_types,
        payment_schedule: config.payment_schedule,
        zahllaufgruppe_id: config.zahllaufgruppe_id
      };

      const result = await beitragskalenderAPI.generateMemberBeitragskalender(generateRequest);
      
      console.log(`✅ Beitragskalender erstellt: ${result.created_entries.length} Einträge, Gesamt: ${result.total_amount}€`);
      return result;

    } catch (error) {
      console.error('❌ BeitragskalenderGenerator: Failed to generate calendar', error);
      return {
        success: false,
        created_entries: [],
        total_amount: 0,
        schedule_summary: {
          frequency: config.payment_schedule,
          duration_months: 0,
          entries_count: 0,
          next_due_date: config.start_date
        },
        error: error instanceof Error ? error.message : 'Unbekannter Fehler'
      };
    }
  }

  /**
   * KALENDER AKTUALISIEREN
   * Aktualisiert bestehenden Kalender bei Vertragsänderungen
   */
  static async updateBeitragskalender(memberId: string, changes: {
    new_amount?: number;
    new_end_date?: string;
    cancelled_from?: string;
    additional_modules?: TransactionType[];
  }): Promise<BeitragskalenderResult> {
    try {
      console.log('🔄 Updating Beitragskalender for member', memberId);

      // Lade bestehende Einträge
      const existingEntries = await beitragskalenderAPI.getMemberBeitragskalender(memberId);
      
      // Storniere zukünftige Einträge wenn Kündigung
      if (changes.cancelled_from) {
        const futureEntries = existingEntries.filter(entry => 
          new Date(entry.due_date) >= new Date(changes.cancelled_from!)
        );
        
        if (futureEntries.length > 0) {
          await beitragskalenderAPI.bulkCancelBeitragskalender({
            entry_ids: futureEntries.map(e => e.id),
            cancellation_reason: 'Vertrag gekündigt'
          });
        }
      }

      // Erstelle neue Einträge für Module
      if (changes.additional_modules?.length) {
        for (const moduleType of changes.additional_modules) {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          
          await beitragskalenderAPI.createBeitragskalenderEntry({
            member_id: memberId,
            due_date: nextMonth.toISOString().split('T')[0],
            transaction_type: moduleType,
            amount: this.calculateModuleAmount(moduleType),
            description: `${moduleType} ab ${nextMonth.toLocaleDateString('de-DE')}`
          });
        }
      }

      // Aktualisiere Beträge für zukünftige Einträge
      if (changes.new_amount) {
        const futureEntries = existingEntries.filter(entry => 
          new Date(entry.due_date) > new Date() && entry.status === 'scheduled'
        );
        
        for (const entry of futureEntries) {
          await beitragskalenderAPI.updateBeitragskalenderEntry(entry.id, {
            amount: changes.new_amount
          });
        }
      }

      // Lade aktualisierte Einträge
      const updatedEntries = await beitragskalenderAPI.getMemberBeitragskalender(memberId);

      return {
        success: true,
        created_entries: updatedEntries,
        total_amount: updatedEntries.reduce((sum, entry) => sum + entry.amount, 0),
        schedule_summary: {
          frequency: 'monthly',
          duration_months: this.calculateRemainingMonths(updatedEntries),
          entries_count: updatedEntries.length,
          next_due_date: this.getNextDueDate(updatedEntries)
        }
      };

    } catch (error) {
      return {
        success: false,
        created_entries: [],
        total_amount: 0,
        schedule_summary: {
          frequency: 'monthly',
          duration_months: 0,
          entries_count: 0,
          next_due_date: new Date().toISOString()
        },
        error: error instanceof Error ? error.message : 'Fehler beim Update'
      };
    }
  }

  /**
   * TRIGGER-FUNCTIONS für automatische Kalender-Erstellung
   */
  
  // Bei neuer Mitgliedschaft
  static async onMemberCreated(memberId: string, contractData: any): Promise<BeitragskalenderResult> {
    console.log('🎯 TRIGGER: Member created - generating Beitragskalender');
    
    const config: BeitragskalenderConfig = {
      member_id: memberId,
      vertrags_id: contractData.id,
      start_date: contractData.start_date,
      end_date: contractData.end_date,
      payment_schedule: contractData.payment_frequency || 'monthly',
      base_amount: contractData.monthly_fee || 89.90,
      transaction_types: ['membership_fee'],
      auto_generate: true
    };

    return await this.generateBeitragskalender(config);
  }

  // Bei Vertragsänderung
  static async onContractChanged(memberId: string, oldContract: any, newContract: any): Promise<BeitragskalenderResult> {
    console.log('🎯 TRIGGER: Contract changed - updating Beitragskalender');
    
    return await this.updateBeitragskalender(memberId, {
      new_amount: newContract.monthly_fee,
      new_end_date: newContract.end_date
    });
  }

  // Bei Modul-Hinzufügung
  static async onModuleAdded(memberId: string, moduleData: any): Promise<BeitragskalenderResult> {
    console.log('🎯 TRIGGER: Module added - extending Beitragskalender');
    
    return await this.updateBeitragskalender(memberId, {
      additional_modules: ['modul']
    });
  }

  // Bei Vertragskündigung
  static async onContractCancelled(memberId: string, cancellationDate: string): Promise<BeitragskalenderResult> {
    console.log('🎯 TRIGGER: Contract cancelled - updating Beitragskalender');
    
    return await this.updateBeitragskalender(memberId, {
      cancelled_from: cancellationDate
    });
  }

  // Bei Pausierung
  static async onContractSuspended(memberId: string, suspensionStart: string, suspensionEnd: string): Promise<BeitragskalenderResult> {
    console.log('🎯 TRIGGER: Contract suspended - updating Beitragskalender');
    
    try {
      const existingEntries = await beitragskalenderAPI.getMemberBeitragskalender(memberId);
      
      // Markiere Einträge im Pausierungszeitraum als suspended
      const suspendedEntries = existingEntries.filter(entry => {
        const dueDate = new Date(entry.due_date);
        return dueDate >= new Date(suspensionStart) && dueDate <= new Date(suspensionEnd);
      });

      if (suspendedEntries.length > 0) {
        await beitragskalenderAPI.bulkUpdateBeitragskalender({
          entry_ids: suspendedEntries.map(e => e.id),
          updates: {
            status: 'suspended',
            notes: `Pausiert vom ${suspensionStart} bis ${suspensionEnd}`
          }
        });
      }

      const updatedEntries = await beitragskalenderAPI.getMemberBeitragskalender(memberId);
      
      return {
        success: true,
        created_entries: updatedEntries,
        total_amount: updatedEntries.reduce((sum, entry) => sum + entry.amount, 0),
        schedule_summary: {
          frequency: 'monthly',
          duration_months: this.calculateRemainingMonths(updatedEntries),
          entries_count: updatedEntries.length,
          next_due_date: this.getNextDueDate(updatedEntries)
        }
      };

    } catch (error) {
      return {
        success: false,
        created_entries: [],
        total_amount: 0,
        schedule_summary: {
          frequency: 'monthly',
          duration_months: 0,
          entries_count: 0,
          next_due_date: new Date().toISOString()
        },
        error: error instanceof Error ? error.message : 'Fehler bei Pausierung'
      };
    }
  }

  // HELPER METHODS

  private static calculateModuleAmount(moduleType: TransactionType): number {
    const moduleAmounts = {
      'membership_fee': 89.90,
      'pauschale': 45.00,
      'modul': 29.90,
      'setup_fee': 179.90,
      'penalty_fee': 15.00
    };
    
    return moduleAmounts[moduleType] || 29.90;
  }

  private static calculateRemainingMonths(entries: BeitragskalenderEntry[]): number {
    const futureEntries = entries.filter(entry => 
      new Date(entry.due_date) > new Date() && entry.status === 'scheduled'
    );
    
    if (futureEntries.length === 0) return 0;
    
    const earliestDate = new Date(Math.min(...futureEntries.map(e => new Date(e.due_date).getTime())));
    const latestDate = new Date(Math.max(...futureEntries.map(e => new Date(e.due_date).getTime())));
    
    const diffTime = latestDate.getTime() - earliestDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // Approximation
  }

  private static getNextDueDate(entries: BeitragskalenderEntry[]): string {
    const futureEntries = entries.filter(entry => 
      new Date(entry.due_date) >= new Date() && entry.status === 'scheduled'
    );
    
    if (futureEntries.length === 0) return new Date().toISOString();
    
    const nextEntry = futureEntries.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )[0];
    
    return nextEntry.due_date;
  }
}

export default BeitragskalenderGenerator; 