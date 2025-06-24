'use client';

import { useState, useEffect } from 'react';

// NEU: Beitragskonto-Header Interface (24.06.2025)
export interface BeitragskontoHeader {
  saldo: {
    amount: number;
    status: 'offen' | 'ausgeglichen' | 'guthaben';
    color: 'red' | 'green' | 'blue';
    display: string; // "49,90€ offen", "Ausgeglichen", "23,50€ Guthaben"
  };
  naechste_faelligkeit: {
    date: string; // ISO Date
    amount: number;
    type: 'membership_fee' | 'pauschale' | 'setup_fee' | 'penalty_fee' | 'modul';
    description: string;
  };
  bereits_gezahlt_kumuliert: {
    amount: number;
    seit_vertragsbeginn: string; // ISO Date
    anzahl_zahlungen: number;
  };
}

export interface BeitragskontoHeaderProps {
  memberId: string;
  memberName: string;
  showActions?: boolean;
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
    month: 'short',
    day: 'numeric'
  });
};

const getTransactionTypeLabel = (type: string): string => {
  const typeLabels: { [key: string]: string } = {
    'membership_fee': 'Monatsbeitrag',
    'pauschale': 'Pauschale',
    'setup_fee': 'Startpaket',
    'penalty_fee': 'Gebühr'
  };
  return typeLabels[type] || type;
};

export function BeitragskontoHeader({ 
  memberId, 
  memberName, 
  showActions = true,
  className = '' 
}: BeitragskontoHeaderProps) {
  const [headerData, setHeaderData] = useState<BeitragskontoHeader | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBeitragskontoHeader();
  }, [memberId]);

  const loadBeitragskontoHeader = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: API-Call implementieren
      // const response = await PaymentSystemAPI.getBeitragskontoHeader(memberId);
      
      // MOCK-DATA für Development (wird durch echte API ersetzt)
      const mockData: BeitragskontoHeader = {
        saldo: {
          amount: 49.90,
          status: 'offen',
          color: 'red',
          display: '49,90€ offen'
        },
        naechste_faelligkeit: {
          date: '2025-07-01T00:00:00Z',
          amount: 89.90,
          type: 'membership_fee',
          description: 'Monatsbeitrag Juli 2025'
        },
        bereits_gezahlt_kumuliert: {
          amount: 1438.20,
          seit_vertragsbeginn: '2024-01-15T00:00:00Z',
          anzahl_zahlungen: 16
        }
      };
      
      setHeaderData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const getSaldoColorClass = (status: string): string => {
    switch (status) {
      case 'offen': return 'text-red-600 bg-red-50 border-red-200';
      case 'ausgeglichen': return 'text-green-600 bg-green-50 border-green-200';
      case 'guthaben': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSaldoTextColor = (color: string): string => {
    switch (color) {
      case 'red': return 'text-red-600';
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
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
          onClick={loadBeitragskontoHeader}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!headerData) return null;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Beitragskonto-Übersicht</h2>
          <p className="text-sm text-gray-600">Finanzstatus für {memberName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getSaldoColorClass(headerData.saldo.status)}`}>
          {headerData.saldo.display}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 🎯 SALDO-ANZEIGE */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="text-lg">💳</span>
            Aktueller Saldo
          </div>
          <div className={`text-2xl font-bold ${getSaldoTextColor(headerData.saldo.color)}`}>
            {headerData.saldo.display}
          </div>
          <div className="text-xs text-gray-500">
            Status: {headerData.saldo.status === 'offen' ? 'Offene Beträge' : 
                    headerData.saldo.status === 'ausgeglichen' ? 'Ausgeglichen' : 'Guthaben vorhanden'}
          </div>
        </div>

        {/* 📅 NÄCHSTE FÄLLIGKEIT */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="text-lg">📅</span>
            Nächste Fälligkeit
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(headerData.naechste_faelligkeit.amount)}
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(headerData.naechste_faelligkeit.date)} • {getTransactionTypeLabel(headerData.naechste_faelligkeit.type)}
          </div>
          <div className="text-xs text-gray-600">
            {headerData.naechste_faelligkeit.description}
          </div>
        </div>

        {/* 💰 KUMULIERTE ZAHLUNGEN */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span className="text-lg">📈</span>
            Bereits gezahlt
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(headerData.bereits_gezahlt_kumuliert.amount)}
          </div>
          <div className="text-xs text-gray-500">
            {headerData.bereits_gezahlt_kumuliert.anzahl_zahlungen} Zahlungen seit {formatDate(headerData.bereits_gezahlt_kumuliert.seit_vertragsbeginn)}
          </div>
        </div>

      </div>

      {/* 🔧 ACTION-BUTTONS (Optional) */}
      {showActions && (
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Zahlung hinzufügen
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Korrektur buchen
          </button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Stilllegung verwalten
          </button>
        </div>
      )}
    </div>
  );
}

export default BeitragskontoHeader; 