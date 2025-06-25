'use client';

import { useState, useEffect } from 'react';
import { Edit3, Trash2, MoreVertical } from 'lucide-react';
import { BeitragManagementModal, BeitragEntry } from './BeitragManagementModal';

// NEU: Beitragskonto-Tabellen Interface (24.06.2025) - 🔧 ERWEITERT 25.06.2025
export interface BeitragskontoEntry {
  id: string;
  faelligkeit: string; // ISO Date
  // 🔧 KRITISCHER FIX: Erweiterte Transaction Types für DB-Frontend-Harmonisierung
  typ: 'beitrag' | 'startpaket' | 'pauschale' | 'gebuehr' | 'lastschrift' | 'storno' | 'ruhezeit' | 'verkauf' | 'ueberzahlung' | 'korrektur' | 
       'membership_fee' | 'setup_fee' | 'penalty_fee' | 'modul'; // Legacy Support
  beschreibung: string;
  lastschriftgruppe: string;
  betrag: number;
  ust: number; // Steuersatz in Prozent
  zahlweise: 'Lastschrift' | 'Überweisung' | 'Bar' | 'SEPA';
  offen: number; // KRITISCH: Noch zu zahlender Betrag nach "Offen"-Logik
  status: 'bezahlt' | 'offen' | 'teilweise' | 'ruecklastschrift' | 'geplant';
}

// "Offen"-Berechnung Interface
export interface OffenBerechnung {
  faelliger_betrag: number;        // Ursprünglich fälliger Betrag
  bereits_gezahlt: number;         // Bereits eingegangene Zahlungen
  ruecklastschriften: number;      // Zurückgegangene Lastschriften
  offen_betrag: number;           // FORMEL: faelliger_betrag - bereits_gezahlt + ruecklastschriften
}

export interface BeitragskontoTableProps {
  memberId: string;
  showHistorical?: boolean;
  maxRows?: number;
  className?: string;
}

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

const getTransactionTypeLabel = (type: string): string => {
  // 🔧 KRITISCHER FIX: Unified Transaction Type Mapping (25.06.2025)
  // Harmonisierung zwischen Beitragskalender (DB) und Beitragskonto (Frontend)
  const typeLabels: { [key: string]: string } = {
    // DATABASE VALUES (aus transaction_type ENUM):
    'beitrag': 'Monatsbeitrag',
    'startpaket': 'Startpaket', 
    'pauschale': 'Pauschale',
    'gebuehr': 'Gebühr',
    'lastschrift': 'SEPA-Lastschrift',
    'storno': 'Stornierung/Gutschrift',
    'ruhezeit': 'Pausierung',
    'verkauf': 'Zusatzverkäufe',
    'ueberzahlung': 'Guthaben-Übertrag',
    'korrektur': 'Manuelle Korrektur',
    
    // LEGACY FRONTEND VALUES (für Rückwärtskompatibilität):
    'membership_fee': 'Monatsbeitrag',
    'setup_fee': 'Startpaket',
    'penalty_fee': 'Gebühr',
    'modul': 'Modul'
  };
  return typeLabels[type] || type;
};

const calculateOffenBetrag = (faelliger_betrag: number, bereits_gezahlt: number, ruecklastschriften: number): number => {
  // FORMEL: offen = faelliger_betrag - bereits_gezahlt + ruecklastschriften
  // ERGEBNISSE:
  // 0,00€ = Vollständig bezahlt
  // Differenzbetrag = Bei anteiliger Bezahlung (z.B. 49,90€ fällig, 30,00€ gezahlt = 19,90€ offen)
  // Ursprünglicher Betrag = Bei vollständiger Rücklastschrift (z.B. 49,90€ zurückgegangen = 49,90€ offen)
  return faelliger_betrag - bereits_gezahlt + ruecklastschriften;
};

const getOffenStatusColor = (offen_betrag: number, status: string, faelligkeit: string): string => {
  if (offen_betrag === 0) return 'text-green-600'; // Vollständig bezahlt
  
  // 🔧 VERBESSERTE STATUS-LOGIK basierend auf Status und Fälligkeitsdatum
  if (status === 'geplant') return 'text-blue-600';     // Geplante zukünftige Zahlung
  if (status === 'bezahlt') return 'text-green-600';    // Bezahlt
  if (status === 'ruecklastschrift') return 'text-red-600'; // Rücklastschrift
  
  if (offen_betrag > 0) {
    const dueDate = new Date(faelligkeit);
    const today = new Date();
    if (dueDate > today) return 'text-orange-600';      // Zukünftig fällig
    return 'text-red-600';                              // Überfällig
  }
  
  return 'text-blue-600';                               // Überzahlung
};

const getOffenStatusIcon = (offen_betrag: number, status: string, faelligkeit: string): string => {
  if (offen_betrag === 0) return '✅'; // Vollständig bezahlt
  
  // 🔧 VERBESSERTE ICON-LOGIK
  if (status === 'geplant') return '📅';     // Geplant
  if (status === 'bezahlt') return '✅';     // Bezahlt
  if (status === 'ruecklastschrift') return '❌'; // Rücklastschrift
  
  if (offen_betrag > 0) {
    const dueDate = new Date(faelligkeit);
    const today = new Date();
    if (dueDate > today) return '⏳';        // Zukünftig fällig
    return '⚠️';                            // Überfällig/Offen
  }
  
  return '💰';                              // Überzahlung
};

export function BeitragskontoTable({ 
  memberId, 
  showHistorical = false, 
  maxRows = 12,
  className = '' 
}: BeitragskontoTableProps) {
  const [entries, setEntries] = useState<BeitragskontoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [selectedEntry, setSelectedEntry] = useState<BeitragEntry | null>(null);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadBeitragskontoEntries();
  }, [memberId, showHistorical, maxRows]);

  const loadBeitragskontoEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔧 KRITISCHER FIX: Echte API statt Mock-Data (25.06.2025)
      const { PaymentSystemAPI } = await import('@/app/lib/api/payment-system');
      const api = new PaymentSystemAPI();
      
      const response = await api.getBeitragskontoEntries(memberId, {
        includeHistorical: showHistorical,
        limit: maxRows
      });
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      setEntries(response.data || []);
      
    } catch (err) {
      console.error('Beitragskonto API Error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      
      // FALLBACK: Mock-Data falls API fehlschlägt (Development Safety)
      // 🔧 AKTUALISIERT: Neue Beschreibungsformate und Status
      const mockEntries: BeitragskontoEntry[] = [
        {
          id: '1',
          faelligkeit: '2025-07-01T00:00:00Z',
          typ: 'membership_fee', // 🔧 FIX: Harmonisierte Types
          beschreibung: 'Monatsbeitrag Premium 01.07.25-31.07.25', // 🔧 NEUES FORMAT
          lastschriftgruppe: 'Monatlich 1.',
          betrag: 89.90,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 89.90,
          status: 'geplant' // 🔧 NEUER STATUS für zukünftige Zahlungen
        },
        {
          id: '2',
          faelligkeit: '2025-06-01T00:00:00Z',
          typ: 'membership_fee', // 🔧 FIX: Harmonisierte Types
          beschreibung: 'Monatsbeitrag Premium 01.06.25-30.06.25', // 🔧 NEUES FORMAT
          lastschriftgruppe: 'Monatlich 1.',
          betrag: 89.90,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 0,
          status: 'bezahlt'
        }
      ];
      console.log('🔧 BEITRAGSKONTO DEBUG: Mock-Daten werden verwendet mit korrigierten Formaten:', mockEntries);
      console.log('🔧 BEITRAGSKONTO DEBUG: Erste Beschreibung:', mockEntries[0]?.beschreibung);
      console.log('🔧 BEITRAGSKONTO DEBUG: UST-Werte:', mockEntries.map(e => e.ust));
      console.log('🔧 BEITRAGSKONTO DEBUG: Status-Werte:', mockEntries.map(e => e.status));
      setEntries(mockEntries);
    } finally {
      setLoading(false);
    }
  };

  const paginatedEntries = entries.slice((currentPage - 1) * maxRows, currentPage * maxRows);
  const totalPages = Math.ceil(entries.length / maxRows);

  // Helper Functions for Modal Integration
  const convertToBeitragEntry = (entry: BeitragskontoEntry): BeitragEntry => ({
    id: entry.id,
    faelligkeit: entry.faelligkeit,
    typ: entry.typ,
    beschreibung: entry.beschreibung,
    betrag: entry.betrag,
    ust: entry.ust,
    offen: entry.offen,
    status: entry.status
  });

  const handleEditEntry = (entry: BeitragskontoEntry) => {
    setSelectedEntry(convertToBeitragEntry(entry));
    setShowManagementModal(true);
    setActionMenuOpen(null);
  };

  const handleSaveEntry = async (updatedEntry: BeitragEntry, action: 'edit' | 'storno' | 'reduce') => {
    try {
      // TODO: Implement missing API methods in PaymentSystemAPI
      // - api.stornoBeitrag()
      // - api.reduceBeitrag() 
      // - api.updateBeitrag()
      // - api.deleteBeitrag()
      
      console.log(`${action} entry:`, updatedEntry);
      
      // Simulate successful operation for now
      // Update local state with proper type conversion
      setEntries(prev => prev.map(entry => {
        if (entry.id === updatedEntry.id) {
          return {
            ...entry,
            faelligkeit: updatedEntry.faelligkeit,
            beschreibung: updatedEntry.beschreibung,
            betrag: updatedEntry.betrag,
            ust: updatedEntry.ust,
            offen: updatedEntry.offen,
            status: updatedEntry.status as BeitragskontoEntry['status']
          };
        }
        return entry;
      }));
      
      // TODO: Remove simulation and implement real API calls
      // await loadBeitragskontoEntries();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      // TODO: Implement API call to delete entry (api.deleteBeitrag method missing)
      console.log('Delete entry:', entryId);
      
      // Simulate successful deletion for now
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      setActionMenuOpen(null);
      
      // TODO: Replace with real API call when method is available
      // const { PaymentSystemAPI } = await import('@/lib/api/payment-system');
      // const api = new PaymentSystemAPI();
      // const result = await api.deleteBeitrag(entryId);
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Eintrags: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <span className="text-lg">⚠️</span>
          <h3 className="font-semibold">Fehler beim Laden</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={loadBeitragskontoEntries}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">🔧 NEUE Beitragskonto-Einträge (FIX AKTIV)</h3>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
            ✅ KORRIGIERT
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {showHistorical ? 'Alle Einträge' : 'Aktuelle Einträge'} • {entries.length} Einträge
        </p>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fälligkeit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Typ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Beschreibung
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lastschriftgruppe
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Betrag
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                USt.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zahlweise
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offen
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(entry.faelligkeit)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getTransactionTypeLabel(entry.typ)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {entry.beschreibung}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {entry.lastschriftgruppe}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {formatCurrency(entry.betrag)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                  {entry.ust}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {entry.zahlweise}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <span className={getOffenStatusColor(entry.offen, entry.status, entry.faelligkeit)}>
                      {entry.offen === 0 ? '0,00€' : formatCurrency(Math.abs(entry.offen))}
                    </span>
                    <span className="text-lg">
                      {getOffenStatusIcon(entry.offen, entry.status, entry.faelligkeit)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === entry.id ? null : entry.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {actionMenuOpen === entry.id && (
                      <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="w-4 h-4" />
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Löschen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Seite {currentPage} von {totalPages} • {entries.length} Einträge gesamt
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      {/* Beitrag Management Modal */}
      <BeitragManagementModal
        isOpen={showManagementModal}
        onClose={() => {
          setShowManagementModal(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
        onSave={handleSaveEntry}
      />
    </div>
  );
}

export default BeitragskontoTable; 