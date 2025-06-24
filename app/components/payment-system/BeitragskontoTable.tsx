'use client';

import { useState, useEffect } from 'react';

// NEU: Beitragskonto-Tabellen Interface (24.06.2025)
export interface BeitragskontoEntry {
  id: string;
  faelligkeit: string; // ISO Date
  typ: 'membership_fee' | 'pauschale' | 'setup_fee' | 'penalty_fee' | 'modul';
  beschreibung: string;
  lastschriftgruppe: string;
  betrag: number;
  ust: number; // Steuersatz in Prozent
  zahlweise: 'Lastschrift' | 'Überweisung' | 'Bar' | 'SEPA';
  offen: number; // KRITISCH: Noch zu zahlender Betrag nach "Offen"-Logik
  status: 'bezahlt' | 'offen' | 'teilweise' | 'ruecklastschrift';
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
  const typeLabels: { [key: string]: string } = {
    'membership_fee': 'Monatsbeitrag',
    'pauschale': 'Pauschale',
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

const getOffenStatusColor = (offen_betrag: number): string => {
  if (offen_betrag === 0) return 'text-green-600'; // Vollständig bezahlt
  if (offen_betrag > 0) return 'text-red-600';     // Offen
  return 'text-blue-600';                          // Überzahlung (negativer "Offen"-Betrag)
};

const getOffenStatusIcon = (offen_betrag: number): string => {
  if (offen_betrag === 0) return '✅'; // Vollständig bezahlt
  if (offen_betrag > 0) return '⚠️';    // Offen
  return '💰';                         // Überzahlung
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

  useEffect(() => {
    loadBeitragskontoEntries();
  }, [memberId, showHistorical, maxRows]);

  const loadBeitragskontoEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: API-Call implementieren
      // const response = await PaymentSystemAPI.getBeitragskontoEntries(memberId, {
      //   includeHistorical: showHistorical,
      //   limit: maxRows
      // });
      
      // MOCK-DATA für Development (wird durch echte API ersetzt)
      const mockEntries: BeitragskontoEntry[] = [
        {
          id: '1',
          faelligkeit: '2025-07-01T00:00:00Z',
          typ: 'membership_fee',
          beschreibung: 'Monatsbeitrag Juli 2025',
          lastschriftgruppe: 'Monatlich 1.',
          betrag: 89.90,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 89.90, // Noch nicht gezahlt
          status: 'offen'
        },
        {
          id: '2',
          faelligkeit: '2025-06-01T00:00:00Z',
          typ: 'membership_fee',
          beschreibung: 'Monatsbeitrag Juni 2025',
          lastschriftgruppe: 'Monatlich 1.',
          betrag: 89.90,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 0, // Vollständig bezahlt
          status: 'bezahlt'
        },
        {
          id: '3',
          faelligkeit: '2025-05-01T00:00:00Z',
          typ: 'membership_fee',
          beschreibung: 'Monatsbeitrag Mai 2025',
          lastschriftgruppe: 'Monatlich 1.',
          betrag: 89.90,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 89.90, // Rücklastschrift
          status: 'ruecklastschrift'
        },
        {
          id: '4',
          faelligkeit: '2025-04-01T00:00:00Z',
          typ: 'membership_fee',
          beschreibung: 'Monatsbeitrag April 2025',
          lastschriftgruppe: 'Monatlich 1.',
          betrag: 89.90,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 19.90, // Anteilige Bezahlung (70€ von 89.90€ gezahlt)
          status: 'teilweise'
        },
        {
          id: '5',
          faelligkeit: '2025-01-15T00:00:00Z',
          typ: 'setup_fee',
          beschreibung: 'Startpaket Premium',
          lastschriftgruppe: 'Einmalig',
          betrag: 149.00,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 0, // Vollständig bezahlt
          status: 'bezahlt'
        },
        {
          id: '6',
          faelligkeit: '2025-06-15T00:00:00Z',
          typ: 'modul',
          beschreibung: 'Exklusiv-Modul: Personal Training',
          lastschriftgruppe: 'Module 15.',
          betrag: 30.00,
          ust: 19,
          zahlweise: 'Lastschrift',
          offen: 0, // Vollständig bezahlt
          status: 'bezahlt'
        }
      ];
      
      setEntries(mockEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const paginatedEntries = entries.slice((currentPage - 1) * maxRows, currentPage * maxRows);
  const totalPages = Math.ceil(entries.length / maxRows);

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
        <h3 className="text-lg font-semibold text-gray-900">Beitragskonto-Einträge</h3>
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
                    <span className={getOffenStatusColor(entry.offen)}>
                      {entry.offen === 0 ? '0,00€' : formatCurrency(Math.abs(entry.offen))}
                    </span>
                    <span className="text-lg">
                      {getOffenStatusIcon(entry.offen)}
                    </span>
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
    </div>
  );
}

export default BeitragskontoTable; 