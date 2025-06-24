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
import BeitragskalenderView from './BeitragskalenderView';
import BusinessLogicManager from './BusinessLogicManager';

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

  useEffect(() => {
    loadPaymentData();
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
        <div className="flex items-center justify-between mb-6">
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

        {/* Kontostand */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktueller Kontostand</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance)}
                </p>
              </div>
              <balanceStatus.icon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="mt-2">
              <Badge variant={balanceStatus.variant}>
                {balanceStatus.text}
              </Badge>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment-Gruppe</p>
                <p className="font-medium text-gray-900">
                  {paymentData.paymentGroup?.name || 'Nicht zugeordnet'}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            {paymentData.paymentGroup && (
              <div className="mt-2">
                <Badge variant="blue">
                  {paymentData.paymentGroup.payment_day}. des Monats
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Mitglieder-Info */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Mitgliedsnummer:</span>
              <span className="ml-2 font-mono">{memberNumber || paymentData.paymentMember.member_number}</span>
            </div>
            <div>
              <span className="text-gray-600">IBAN:</span>
              <span className="ml-2 font-mono">
                {paymentData.paymentMember.iban ? 
                  `****${paymentData.paymentMember.iban.slice(-4)}` : 
                  'Nicht hinterlegt'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Letzte Transaktionen */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Letzte Transaktionen</h4>
            <Button variant="ghost" size="sm">
              Alle anzeigen
            </Button>
          </div>
          
          {paymentData.recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Noch keine Transaktionen vorhanden
            </p>
          ) : (
            <div className="space-y-2">
              {paymentData.recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getTransactionDescription(transaction)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(transaction.transaction_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
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

        {/* Beitragskonto-System */}
        <div className="space-y-4">
          <BeitragskontoHeader 
            memberId={memberId}
            memberName={memberName}
            showActions={isAdmin}
            className="mt-6"
          />
          
          <BeitragskontoTable 
            memberId={memberId}
            showHistorical={false}
            maxRows={8}
            className="mt-4"
          />
        </div>

        {/* NEU: Beitragskalender-Ansicht */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Beitragskalender</h3>
            <span className="text-sm text-gray-500">Geplante Zahlungen</span>
          </div>
          
          <BeitragskalenderView 
            memberId={memberId}
            compact={true}
            showAdminControls={false}
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
    </Card>
  );
} 