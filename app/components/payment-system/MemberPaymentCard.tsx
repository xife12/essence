import React, { useState, useEffect } from 'react';
import { CreditCard, Euro, TrendingUp, TrendingDown, Clock, Users, AlertCircle, CheckCircle, Plus, Edit3 } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Badge from '@/app/components/ui/Badge';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
import type { PaymentMember, MemberAccount, MemberTransaction, PaymentGroup } from '@/app/lib/types/payment-system';
  // NEU: Erweiterte Beitragskonto-Komponenten (24.06.2025)
  import BeitragskontoHeader from './BeitragskontoHeader';
  import BeitragskontoTable from './BeitragskontoTable';
import BusinessLogicManager from './BusinessLogicManager';
import { PaymentGroupEditModal, IBANEditModal } from './PaymentEditModals';

interface MemberPaymentCardProps {
  memberId: string;
  memberName: string;
  memberNumber?: string;
  isAdmin?: boolean;
}

interface PaymentData {
  paymentMember?: PaymentMember;
  account?: MemberAccount;
  recentTransactions: MemberTransaction[];
  paymentGroup?: PaymentGroup;
}

export function MemberPaymentCard({ 
  memberId, 
  memberName, 
  memberNumber,
  isAdmin = false 
}: MemberPaymentCardProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  
  // Modal states for editing
  const [showPaymentGroupModal, setShowPaymentGroupModal] = useState(false);
  const [showIBANModal, setShowIBANModal] = useState(false);
  const [availablePaymentGroups, setAvailablePaymentGroups] = useState<PaymentGroup[]>([]);

  useEffect(() => {
    loadPaymentData();
    loadAvailablePaymentGroups();
  }, [memberId]);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const api = new PaymentSystemAPI();
      
      // Lade Payment-Member falls vorhanden
      const paymentMemberResponse = await api.getPaymentMemberByMemberId(memberId);
      let paymentMember: PaymentMember | undefined;
      
      if (paymentMemberResponse.success && paymentMemberResponse.data) {
        paymentMember = paymentMemberResponse.data;
        
        // Lade Account-Daten
        const accountResponse = await api.getMemberAccount(paymentMember.id);
        if (accountResponse.success) {
          setPaymentData(prev => ({
            ...prev,
            paymentMember,
            account: accountResponse.data
          }));
        }
        
        // Lade letzte Transaktionen
        const transactionsResponse = await api.getMemberTransactions(paymentMember.id, 5);
        if (transactionsResponse.success) {
          setPaymentData(prev => ({
            ...prev,
            recentTransactions: transactionsResponse.data || []
          }));
        }
        
        // Lade Payment-Group
        if (paymentMember.payment_group_id) {
          const groupResponse = await api.getPaymentGroup(paymentMember.payment_group_id);
          if (groupResponse.success) {
            setPaymentData(prev => ({
              ...prev,
              paymentGroup: groupResponse.data
            }));
          }
        }
      }
      
    } catch (err) {
      setError('Fehler beim Laden der Payment-Daten');
      console.error('Payment data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailablePaymentGroups = async () => {
    try {
      const api = new PaymentSystemAPI();
      const response = await api.getPaymentGroups();
      if (response.success && response.data) {
        setAvailablePaymentGroups(response.data);
      }
    } catch (err) {
      console.error('Error loading payment groups:', err);
    }
  };

  const handlePaymentGroupChange = async (newGroupId: string) => {
    try {
      if (!paymentData.paymentMember) return;
      
      const api = new PaymentSystemAPI();
      // TODO: Implement updatePaymentMemberGroup API method
      console.log('Update payment group:', newGroupId);
      
      // Simulate success and reload data
      await loadPaymentData();
    } catch (err) {
      console.error('Error updating payment group:', err);
      throw err;
    }
  };

  const handleIBANChange = async (newIBAN: string, mandateReference: string) => {
    try {
      if (!paymentData.paymentMember) return;
      
      const api = new PaymentSystemAPI();
      // TODO: Implement updatePaymentMemberIBAN API method
      console.log('Update IBAN:', newIBAN, mandateReference);
      
      // Simulate success and reload data
      await loadPaymentData();
    } catch (err) {
      console.error('Error updating IBAN:', err);
      throw err;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getBalanceStatus = (balance: number) => {
    if (balance > 50) {
      return { variant: 'green' as const, text: 'Guthaben', icon: TrendingUp };
    } else if (balance > 0) {
      return { variant: 'blue' as const, text: 'Kleines Guthaben', icon: CheckCircle };
    } else if (balance >= -50) {
      return { variant: 'yellow' as const, text: 'Geringer Rückstand', icon: Clock };
    } else {
      return { variant: 'red' as const, text: 'Hoher Rückstand', icon: AlertCircle };
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'fee_charged':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'correction':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionDescription = (transaction: MemberTransaction) => {
    switch (transaction.type) {
      case 'payment_received':
        return 'Zahlung erhalten';
      case 'fee_charged':
        return 'Beitrag berechnet';
      case 'correction':
        return 'Manuelle Korrektur';
      default:
        return transaction.description || 'Transaktion';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Fehler beim Laden</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={loadPaymentData}
          >
            Erneut versuchen
          </Button>
        </div>
      </Card>
    );
  }

  // Kein Payment-Member gefunden
  if (!paymentData.paymentMember) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment-Status
            </h3>
            {isAdmin && (
              <Button size="sm" onClick={() => {/* TODO: Import from PDF */}}>
                <Plus className="w-4 h-4 mr-2" />
                Payment importieren
              </Button>
            )}
          </div>
          
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-gray-900 font-medium mb-2">Kein Payment-Konto</h4>
            <p className="text-gray-600 text-sm mb-4">
              Für dieses Mitglied wurde noch kein Payment-Konto aus Magicline-PDFs importiert.
            </p>
            {isAdmin && (
              <Button variant="outline" onClick={() => {/* TODO: Redirect to PDF upload */}}>
                PDF-Upload starten
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const { account } = paymentData;
  const balance = account?.current_balance || 0;
  const balanceStatus = getBalanceStatus(balance);

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment-Konto
          </h3>
          {isAdmin && (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCorrectionModal(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Korrektur
              </Button>
            </div>
          )}
        </div>

        {/* 🔧 KOMPAKTE Finanz-Übersicht */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Kontostand */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Kontostand</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(balance)}
                </p>
              </div>
              <balanceStatus.icon className="w-6 h-6 text-gray-400" />
            </div>
            <Badge variant={balanceStatus.variant} className="mt-1 text-xs">
              {balanceStatus.text}
            </Badge>
          </div>

          {/* Payment-Gruppe mit Bearbeiten-Button */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-600">Payment-Gruppe</p>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-200"
                  onClick={() => setShowPaymentGroupModal(true)}
                  title="Zahllaufgruppe bearbeiten"
                >
                  <Edit3 className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                </Button>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900">
              {paymentData.paymentGroup?.name || 'Nicht zugeordnet'}
            </p>
            {paymentData.paymentGroup && (
              <Badge variant="blue" className="mt-1 text-xs">
                {paymentData.paymentGroup.payment_day}. des Monats
              </Badge>
            )}
          </div>

          {/* IBAN mit Bearbeiten-Button */}
          {/* 🔧 HINWEIS: Mitgliedsnummer entfernt - bereits im Mitglieder-Header sichtbar */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-600">IBAN</p>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-gray-200"
                  onClick={() => setShowIBANModal(true)}
                  title="IBAN bearbeiten"
                >
                  <Edit3 className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                </Button>
              )}
            </div>
            <p className="text-sm font-mono text-gray-900">
              {paymentData.paymentMember.iban ? 
                `****${paymentData.paymentMember.iban.slice(-4)}` : 
                'Nicht hinterlegt'
              }
            </p>
          </div>
        </div>

        {/* 🔧 KOMPAKTE Letzte Transaktionen */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Letzte Transaktionen</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              Alle anzeigen
            </Button>
          </div>
          
          {paymentData.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-xs py-2 text-center bg-gray-50 rounded">
              Noch keine Transaktionen vorhanden
            </p>
          ) : (
            <div className="space-y-1">
              {paymentData.recentTransactions.slice(0, 3).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {getTransactionDescription(transaction)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Beitragskonto-System (Real Data) */}
        <div className="space-y-4">
          <BeitragskontoHeader 
            memberId={memberId}
            memberName={memberName}
            showActions={isAdmin}
            className="mt-2"
          />
          
          <BeitragskontoTable 
            memberId={memberId}
            showHistorical={true}
            maxRows={12}
            className="mt-4"
          />
        </div>

        {/* Business Logic Manager - Nur für Admins */}
        {isAdmin && (
          <BusinessLogicManager
            memberId={memberId}
            memberName={memberName}
            currentBalance={balance}
            className="mt-6"
          />
        )}
      </div>

      {/* Payment Group Edit Modal */}
      <PaymentGroupEditModal
        isOpen={showPaymentGroupModal}
        onClose={() => setShowPaymentGroupModal(false)}
        currentGroup={paymentData.paymentGroup ? {
          id: paymentData.paymentGroup.id,
          name: paymentData.paymentGroup.name,
          payment_day: paymentData.paymentGroup.payment_day
        } : null}
        availableGroups={availablePaymentGroups}
        onSave={handlePaymentGroupChange}
      />

      {/* IBAN Edit Modal */}
      <IBANEditModal
        isOpen={showIBANModal}
        onClose={() => setShowIBANModal(false)}
        currentIBAN={paymentData.paymentMember?.iban || ''}
        memberName={memberName}
        onSave={handleIBANChange}
      />
    </Card>
  );
} 