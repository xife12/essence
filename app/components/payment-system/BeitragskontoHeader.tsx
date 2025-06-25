'use client';

import { useState, useEffect } from 'react';
import { AddPaymentModal, BookCorrectionModal, ManageSuspensionModal } from './BeitragsHeaderActionModals';

// NEU: Beitragskonto-Header Interface (24.06.2025) - 🔧 ERWEITERT 25.06.2025
// 🔧 KRITISCHER FIX (24.01.2025): Null Safety für naechste_faelligkeit
// - Updated TypeScript interface to allow naechste_faelligkeit: null
// - Added conditional rendering to handle null case gracefully
// - Fixed "Cannot read property of null" runtime error
// - Improved UX with proper "Keine Fälligkeit" state
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
    // 🔧 KRITISCHER FIX: Erweiterte Transaction Types für DB-Frontend-Harmonisierung
    type: 'beitrag' | 'startpaket' | 'pauschale' | 'gebuehr' | 'lastschrift' | 'storno' | 'ruhezeit' | 'verkauf' | 'ueberzahlung' | 'korrektur' | 
          'membership_fee' | 'setup_fee' | 'penalty_fee' | 'modul'; // Legacy Support
    description: string;
  } | null; // 🔧 KRITISCHER FIX: Allow null when no upcoming payments
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
  
  // Modal states
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);

  useEffect(() => {
    if (memberId) {
      loadBeitragskontoHeader();
    }
  }, [memberId]);

  const loadBeitragskontoHeader = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🔧 KRITISCHER FIX: Echte API statt Mock-Data (25.06.2025)
      const { PaymentSystemAPI } = await import('@/lib/api/payment-system');
      const api = new PaymentSystemAPI();
      
      const response = await api.getBeitragskontoHeader(memberId);
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      setHeaderData(response.data);
      
    } catch (err) {
      console.error('Beitragskonto Header API Error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      
      // 🔧 FALLBACK: Mock-Data falls API-Aufruf fehlschlägt (Development Safety)
      const fallbackData = {
        saldo: {
          amount: 0,
          status: 'ausgeglichen' as const,
          color: 'green' as const,
          display: '0,00€ ausgeglichen'
        },
        naechste_faelligkeit: null, // ✅ NULL SAFETY - behoben!
        bereits_gezahlt_kumuliert: {
          amount: 179.80,
          seit_vertragsbeginn: '2025-06-25T00:00:00Z',
          anzahl_zahlungen: 2
        }
      };
      
      console.log('🔧 BEITRAGSKONTOHEADER DEBUG: Fallback-Daten mit korrigiertem NULL-Safety:', fallbackData);
      console.log('🔧 BEITRAGSKONTOHEADER DEBUG: Saldo Status:', fallbackData.saldo.status);
      console.log('🔧 BEITRAGSKONTOHEADER DEBUG: Nächste Fälligkeit (NULL):', fallbackData.naechste_faelligkeit);
      setHeaderData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for modal actions
  const handleAddPayment = async (payment: any) => {
    try {
      // TODO: Implement API call to add payment
      console.log('Add payment:', payment);
      
      // Reload header data after successful payment
      await loadBeitragskontoHeader();
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const handleBookCorrection = async (correction: any) => {
    try {
      // TODO: Implement API call to book correction
      console.log('Book correction:', correction);
      
      // Reload header data after successful correction
      await loadBeitragskontoHeader();
    } catch (error) {
      console.error('Error booking correction:', error);
      throw error;
    }
  };

  const handleManageSuspension = async (suspension: any) => {
    try {
      // TODO: Implement API call to manage suspension
      console.log('Manage suspension:', suspension);
      
      // Reload header data after successful suspension
      await loadBeitragskontoHeader();
    } catch (error) {
      console.error('Error managing suspension:', error);
      throw error;
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">🔧 NEUE Beitragskonto-Übersicht (FIX AKTIV)</h2>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              ✅ KORRIGIERT
            </span>
          </div>
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
          {headerData.naechste_faelligkeit ? (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(headerData.naechste_faelligkeit.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(headerData.naechste_faelligkeit.date)} • {getTransactionTypeLabel(headerData.naechste_faelligkeit.type)}
              </div>
              <div className="text-xs text-gray-600">
                {headerData.naechste_faelligkeit.description}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-400">
                Keine Fälligkeit
              </div>
              <div className="text-xs text-gray-400">
                Aktuell keine ausstehenden Zahlungen
              </div>
            </>
          )}
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
          <button 
            onClick={() => setShowAddPaymentModal(true)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Zahlung hinzufügen
          </button>
          <button 
            onClick={() => setShowCorrectionModal(true)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Korrektur buchen
          </button>
          <button 
            onClick={() => setShowSuspensionModal(true)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Stilllegung verwalten
          </button>
        </div>
      )}

      {/* Action Modals */}
      <AddPaymentModal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        memberName={memberName}
        onSave={handleAddPayment}
      />

      <BookCorrectionModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        memberName={memberName}
        currentBalance={headerData?.saldo.amount || 0}
        onSave={handleBookCorrection}
      />

      <ManageSuspensionModal
        isOpen={showSuspensionModal}
        onClose={() => setShowSuspensionModal(false)}
        memberName={memberName}
        onSave={handleManageSuspension}
      />
    </div>
  );
}

export default BeitragskontoHeader; 