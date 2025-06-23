import React, { useState } from 'react';
import { X, AlertCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';

interface AccountCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  paymentMemberId: string;
  currentBalance: number;
  onCorrectionComplete: () => void;
}

interface CorrectionFormData {
  amount: string;
  reason: string;
  correctionType: 'adjustment' | 'credit' | 'debit';
}

export function AccountCorrectionModal({
  isOpen,
  onClose,
  memberName,
  paymentMemberId,
  currentBalance,
  onCorrectionComplete
}: AccountCorrectionModalProps) {
  const [formData, setFormData] = useState<CorrectionFormData>({
    amount: '',
    reason: '',
    correctionType: 'adjustment'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.reason) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount === 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const api = new PaymentSystemAPI();
      
      // Bestimme den finalen Betrag basierend auf Korrekturtyp
      let finalAmount = amount;
      if (formData.correctionType === 'debit') {
        finalAmount = -Math.abs(amount);
      } else if (formData.correctionType === 'credit') {
        finalAmount = Math.abs(amount);
      }

      const response = await api.createMemberTransaction({
        payment_member_id: paymentMemberId,
        type: 'correction',
        amount: finalAmount,
        description: formData.reason,
        transaction_date: new Date().toISOString(),
        created_by: 'admin' // TODO: Get actual user
      });

      if (response.success) {
        onCorrectionComplete();
        onClose();
        // Reset form
        setFormData({
          amount: '',
          reason: '',
          correctionType: 'adjustment'
        });
      } else {
        setError(response.error || 'Fehler beim Erstellen der Korrektur');
      }
    } catch (err) {
      setError('Unerwarteter Fehler beim Erstellen der Korrektur');
      console.error('Correction creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError(null);
      setFormData({
        amount: '',
        reason: '',
        correctionType: 'adjustment'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateNewBalance = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return currentBalance;

    let adjustment = amount;
    if (formData.correctionType === 'debit') {
      adjustment = -Math.abs(amount);
    } else if (formData.correctionType === 'credit') {
      adjustment = Math.abs(amount);
    }

    return currentBalance + adjustment;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Kontokorrektur</h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Member Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{memberName}</h3>
            <div className="text-sm text-gray-600">
              <p>Aktueller Kontostand: <span className="font-mono">{formatCurrency(currentBalance)}</span></p>
              <p>Neuer Kontostand: <span className="font-mono font-medium">{formatCurrency(calculateNewBalance())}</span></p>
            </div>
          </div>

          {/* Correction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Korrekturtyp
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, correctionType: 'credit' }))}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  formData.correctionType === 'credit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Gutschrift
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, correctionType: 'debit' }))}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  formData.correctionType === 'debit'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Belastung
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, correctionType: 'adjustment' }))}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  formData.correctionType === 'adjustment'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Anpassung
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Betrag *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Geben Sie den Betrag ohne Vorzeichen ein. Das Vorzeichen wird automatisch gesetzt.
            </p>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Grund der Korrektur *
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Beschreiben Sie den Grund für diese Korrektur..."
                rows={3}
                required
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Wichtiger Hinweis</p>
                <p>
                  Diese Korrektur wird sofort wirksam und erscheint in der Transaktionshistorie. 
                  Sie sollte nur bei berechtigten Anlässen durchgeführt werden.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.amount || !formData.reason}
              className="flex-1"
            >
              {isSubmitting ? 'Wird verarbeitet...' : 'Korrektur durchführen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 