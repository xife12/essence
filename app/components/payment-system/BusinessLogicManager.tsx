'use client';

import { useState } from 'react';
import { Settings, Clock, UserX, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import BusinessLogicEngine, { 
  StillegungConfig, 
  KuendigungConfig, 
  GuthabenVerrechnungConfig,
  StillegungResult,
  KuendigungResult,
  GuthabenVerrechnungResult
} from '../../lib/services/business-logic-engine';

export interface BusinessLogicManagerProps {
  memberId: string;
  memberName: string;
  currentBalance?: number;
  isAdmin?: boolean;
  className?: string;
}

type ProcessType = 'stillegung' | 'kuendigung' | 'guthaben' | null;

// Helper Functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export function BusinessLogicManager({ 
  memberId, 
  memberName, 
  currentBalance = 0,
  isAdmin = false,
  className = '' 
}: BusinessLogicManagerProps) {
  const [activeProcess, setActiveProcess] = useState<ProcessType>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Stillegung Form State
  const [stillegungForm, setStillegungForm] = useState({
    start_date: '',
    end_date: '',
    reason: 'urlaub' as 'urlaub' | 'krankheit' | 'sonderfall',
    is_retroactive: false
  });

  // Kündigung Form State
  const [kuendigungForm, setKuendigungForm] = useState({
    kuendigung_date: '',
    kuendigung_type: 'regular' as 'sonderkuendigungsrecht' | 'studio_initiated' | 'regular',
    reason: '',
    effective_date: '',
    refund_policy: 'none' as 'full' | 'partial' | 'none'
  });

  const resetForms = () => {
    setActiveProcess(null);
    setResult(null);
    setError(null);
    setProcessing(false);
  };

  const handleStillegung = async () => {
    if (!stillegungForm.start_date || !stillegungForm.end_date) {
      setError('Start- und Enddatum sind erforderlich');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const config: StillegungConfig = {
        member_id: memberId,
        start_date: stillegungForm.start_date + 'T00:00:00Z',
        end_date: stillegungForm.end_date + 'T00:00:00Z',
        reason: stillegungForm.reason,
        is_retroactive: stillegungForm.is_retroactive,
        affected_transactions: stillegungForm.is_retroactive ? ['tx_2025_06', 'tx_2025_05'] : undefined
      };

      const result = await BusinessLogicEngine.processStillegung(config);
      setResult(result);
      
      if (result.success) {
        console.log('✅ Stillegung erfolgreich verarbeitet:', result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei Stillegung');
    } finally {
      setProcessing(false);
    }
  };

  const handleKuendigung = async () => {
    if (!kuendigungForm.kuendigung_date || !kuendigungForm.effective_date) {
      setError('Kündigungs- und Wirksamkeitsdatum sind erforderlich');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const config: KuendigungConfig = {
        member_id: memberId,
        kuendigung_date: kuendigungForm.kuendigung_date + 'T00:00:00Z',
        kuendigung_type: kuendigungForm.kuendigung_type,
        reason: kuendigungForm.reason,
        effective_date: kuendigungForm.effective_date + 'T00:00:00Z',
        refund_policy: kuendigungForm.refund_policy
      };

      const result = await BusinessLogicEngine.processKuendigung(config);
      setResult(result);
      
      if (result.success) {
        console.log('✅ Kündigung erfolgreich verarbeitet:', result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei Kündigung');
    } finally {
      setProcessing(false);
    }
  };

  const handleGuthabenVerrechnung = async () => {
    if (currentBalance <= 0) {
      setError('Kein Guthaben vorhanden für Verrechnung');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Mock upcoming charges - würde normalerweise aus API kommen
      const mockUpcomingCharges = [
        {
          id: 'charge_2025_07',
          amount: 89.90,
          due_date: '2025-07-01T00:00:00Z',
          transaction_type: 'membership_fee' as const
        },
        {
          id: 'charge_2025_08',
          amount: 89.90,
          due_date: '2025-08-01T00:00:00Z',
          transaction_type: 'membership_fee' as const
        }
      ];

      const config: GuthabenVerrechnungConfig = {
        member_id: memberId,
        available_credit: Math.abs(currentBalance),
        upcoming_charges: mockUpcomingCharges,
        auto_apply: true
      };

      const result = await BusinessLogicEngine.processGuthabenVerrechnung(config);
      setResult(result);
      
      if (result.success) {
        console.log('✅ Guthaben-Verrechnung erfolgreich verarbeitet:', result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei Guthaben-Verrechnung');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin) {
    return null; // Nur für Admins sichtbar
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900">Business Logic Manager</h3>
        <span className="text-sm text-gray-500">für {memberName}</span>
      </div>

      {!activeProcess && !result && (
        /* Action Selection */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Stillegung */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer" 
               onClick={() => setActiveProcess('stillegung')}>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-6 w-6 text-blue-500" />
              <h4 className="font-medium text-gray-900">Stillegung</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Mitgliedschaft temporär stillegen mit automatischer Gutschrift-Berechnung
            </p>
            <div className="text-xs text-gray-500">
              • Rückwirkende Gutschriften<br/>
              • Verlängerung der Vertragslaufzeit<br/>
              • Blockierung zukünftiger Abbuchungen
            </div>
          </div>

          {/* Kündigung */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 cursor-pointer"
               onClick={() => setActiveProcess('kuendigung')}>
            <div className="flex items-center gap-3 mb-3">
              <UserX className="h-6 w-6 text-red-500" />
              <h4 className="font-medium text-gray-900">Kündigung</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Mitgliedschaft kündigen mit automatischer Erstattungs-Berechnung
            </p>
            <div className="text-xs text-gray-500">
              • Sonderkündigungsrecht<br/>
              • Studio-initiierte Kündigungen<br/>
              • Automatische Erstattungen
            </div>
          </div>

          {/* Guthaben-Verrechnung */}
          <div className={`border rounded-lg p-4 cursor-pointer ${
            currentBalance > 0 
              ? 'border-gray-200 hover:border-green-300' 
              : 'border-gray-100 bg-gray-50 cursor-not-allowed'
          }`}
               onClick={() => currentBalance > 0 && setActiveProcess('guthaben')}>
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className={`h-6 w-6 ${currentBalance > 0 ? 'text-green-500' : 'text-gray-400'}`} />
              <h4 className={`font-medium ${currentBalance > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                Guthaben-Verrechnung
              </h4>
            </div>
            <p className={`text-sm mb-3 ${currentBalance > 0 ? 'text-gray-600' : 'text-gray-500'}`}>
              Verfügbares Guthaben automatisch mit offenen Forderungen verrechnen
            </p>
            <div className={`text-xs ${currentBalance > 0 ? 'text-gray-500' : 'text-gray-400'}`}>
              Aktuelles Guthaben: {formatCurrency(Math.abs(currentBalance))}
              {currentBalance <= 0 && <br/>}
              {currentBalance <= 0 && '(Kein Guthaben verfügbar)'}
            </div>
          </div>

        </div>
      )}

      {/* Stillegung Form */}
      {activeProcess === 'stillegung' && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Stillegung konfigurieren</h4>
            <button onClick={resetForms} className="text-sm text-gray-500 hover:text-gray-700">
              Abbrechen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start-Datum</label>
              <input
                type="date"
                value={stillegungForm.start_date}
                onChange={(e) => setStillegungForm(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End-Datum</label>
              <input
                type="date"
                value={stillegungForm.end_date}
                onChange={(e) => setStillegungForm(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grund</label>
            <select
              value={stillegungForm.reason}
              onChange={(e) => setStillegungForm(prev => ({ ...prev, reason: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="urlaub">Urlaub</option>
              <option value="krankheit">Krankheit</option>
              <option value="sonderfall">Sonderfall</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="retroactive"
              type="checkbox"
              checked={stillegungForm.is_retroactive}
              onChange={(e) => setStillegungForm(prev => ({ ...prev, is_retroactive: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="retroactive" className="text-sm text-gray-700">
              Rückwirkend (automatische Gutschrift bereits erfolgter Abbuchungen)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStillegung}
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Verarbeitung...' : 'Stillegung durchführen'}
            </button>
          </div>
        </div>
      )}

      {/* Kündigung Form */}
      {activeProcess === 'kuendigung' && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Kündigung konfigurieren</h4>
            <button onClick={resetForms} className="text-sm text-gray-500 hover:text-gray-700">
              Abbrechen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kündigungs-Datum</label>
              <input
                type="date"
                value={kuendigungForm.kuendigung_date}
                onChange={(e) => setKuendigungForm(prev => ({ ...prev, kuendigung_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wirksam ab</label>
              <input
                type="date"
                value={kuendigungForm.effective_date}
                onChange={(e) => setKuendigungForm(prev => ({ ...prev, effective_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kündigungs-Typ</label>
            <select
              value={kuendigungForm.kuendigung_type}
              onChange={(e) => setKuendigungForm(prev => ({ ...prev, kuendigung_type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="regular">Reguläre Kündigung</option>
              <option value="sonderkuendigungsrecht">Sonderkündigungsrecht</option>
              <option value="studio_initiated">Studio-initiiert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Erstattungs-Politik</label>
            <select
              value={kuendigungForm.refund_policy}
              onChange={(e) => setKuendigungForm(prev => ({ ...prev, refund_policy: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Keine Erstattung</option>
              <option value="partial">Teilerstattung</option>
              <option value="full">Vollerstattung</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grund</label>
            <textarea
              value={kuendigungForm.reason}
              onChange={(e) => setKuendigungForm(prev => ({ ...prev, reason: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kündigungsgrund..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleKuendigung}
              disabled={processing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? 'Verarbeitung...' : 'Kündigung durchführen'}
            </button>
          </div>
        </div>
      )}

      {/* Guthaben-Verrechnung Form */}
      {activeProcess === 'guthaben' && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Guthaben-Verrechnung</h4>
            <button onClick={resetForms} className="text-sm text-gray-500 hover:text-gray-700">
              Abbrechen
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Verfügbares Guthaben</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(Math.abs(currentBalance))}
            </p>
            <p className="text-sm text-green-600 mt-1">
              Wird automatisch mit nächsten offenen Forderungen verrechnet
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGuthabenVerrechnung}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Verrechnung...' : 'Guthaben verrechnen'}
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Erfolgreich verarbeitet' : 'Fehler aufgetreten'}
              </h4>
            </div>
            <button onClick={resetForms} className="text-sm text-gray-500 hover:text-gray-700">
              Schließen
            </button>
          </div>

          {result.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              {/* Stillegung Results */}
              {activeProcess === 'stillegung' && (
                <div className="space-y-2">
                  <h5 className="font-medium text-green-800">Stillegung erfolgreich durchgeführt</h5>
                  {result.credit_amount && (
                    <p className="text-sm text-green-700">
                      💰 Gutschrift erstellt: {formatCurrency(result.credit_amount)}
                    </p>
                  )}
                  {result.extended_end_date && (
                    <p className="text-sm text-green-700">
                      📅 Vertragsende verlängert auf: {formatDate(result.extended_end_date)}
                    </p>
                  )}
                  <p className="text-sm text-green-700">
                    🚫 {result.blocked_future_charges.length} zukünftige Abbuchungen blockiert
                  </p>
                  <p className="text-sm text-green-700">
                    📝 {result.created_transactions.length} Transaktionen erstellt
                  </p>
                </div>
              )}

              {/* Kündigung Results */}
              {activeProcess === 'kuendigung' && (
                <div className="space-y-2">
                  <h5 className="font-medium text-green-800">Kündigung erfolgreich verarbeitet</h5>
                  {result.refund_amount && (
                    <p className="text-sm text-green-700">
                      💰 Erstattung erstellt: {formatCurrency(result.refund_amount)}
                    </p>
                  )}
                  <p className="text-sm text-green-700">
                    📅 Letzter Abrechnungstag: {formatDate(result.final_billing_date)}
                  </p>
                  <p className="text-sm text-green-700">
                    🚫 {result.cancelled_future_charges.length} zukünftige Abbuchungen storniert
                  </p>
                  <p className="text-sm text-green-700">
                    📝 {result.created_transactions.length} Transaktionen erstellt
                  </p>
                </div>
              )}

              {/* Guthaben-Verrechnung Results */}
              {activeProcess === 'guthaben' && (
                <div className="space-y-2">
                  <h5 className="font-medium text-green-800">Guthaben-Verrechnung abgeschlossen</h5>
                  <p className="text-sm text-green-700">
                    💰 Verrechnet: {formatCurrency(result.applied_credit)}
                  </p>
                  <p className="text-sm text-green-700">
                    💳 Verbleibendes Guthaben: {formatCurrency(result.remaining_credit)}
                  </p>
                  <p className="text-sm text-green-700">
                    📋 {result.offset_charges.length} Forderungen anteilig/vollständig ausgeglichen
                  </p>
                  <p className="text-sm text-green-700">
                    📝 {result.created_transactions.length} Verrechnungs-Transaktionen erstellt
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                ❌ {result.error || 'Unbekannter Fehler bei der Verarbeitung'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessLogicManager; 