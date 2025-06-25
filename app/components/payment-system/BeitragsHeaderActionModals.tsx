'use client';

import React, { useState } from 'react';
import { X, Plus, Edit3, Pause, AlertTriangle, Calendar, Euro } from 'lucide-react';

// Zahlung hinzufügen Modal
interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onSave: (payment: NewPayment) => Promise<void>;
}

interface NewPayment {
  amount: number;
  description: string;
  payment_date: string;
  payment_method: 'lastschrift' | 'überweisung' | 'bar' | 'karte';
  transaction_type: 'payment_received' | 'correction' | 'refund';
}

export function AddPaymentModal({ isOpen, onClose, memberName, onSave }: AddPaymentModalProps) {
  const [formData, setFormData] = useState<NewPayment>({
    amount: 0,
    description: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'lastschrift',
    transaction_type: 'payment_received'
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.amount || formData.amount <= 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }
    if (!formData.description.trim()) {
      setError('Bitte geben Sie eine Beschreibung ein');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await onSave(formData);
      onClose();
      setFormData({
        amount: 0,
        description: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'lastschrift',
        transaction_type: 'payment_received'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Zahlung hinzufügen</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Neue Zahlung für <strong>{memberName}</strong> hinzufügen
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betrag
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Monatsbeitrag Juli 2025"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zahlungsart
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lastschrift">Lastschrift</option>
                  <option value="überweisung">Überweisung</option>
                  <option value="bar">Barzahlung</option>
                  <option value="karte">Kartenzahlung</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, transaction_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="payment_received">Zahlung erhalten</option>
                  <option value="correction">Korrektur</option>
                  <option value="refund">Rückerstattung</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={processing || !formData.amount || !formData.description}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Speichern...' : 'Zahlung hinzufügen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Korrektur buchen Modal
interface BookCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  currentBalance: number;
  onSave: (correction: CorrectionEntry) => Promise<void>;
}

interface CorrectionEntry {
  amount: number;
  description: string;
  reason: string;
  correction_type: 'adjustment' | 'error_fix' | 'goodwill' | 'other';
}

export function BookCorrectionModal({ isOpen, onClose, memberName, currentBalance, onSave }: BookCorrectionModalProps) {
  const [formData, setFormData] = useState<CorrectionEntry>({
    amount: 0,
    description: '',
    reason: '',
    correction_type: 'adjustment'
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (formData.amount === 0) {
      setError('Bitte geben Sie einen Korrekturbetrag ein');
      return;
    }
    if (!formData.description.trim()) {
      setError('Bitte geben Sie eine Beschreibung ein');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Bitte geben Sie einen Grund ein');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await onSave(formData);
      onClose();
      setFormData({
        amount: 0,
        description: '',
        reason: '',
        correction_type: 'adjustment'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const newBalance = currentBalance + formData.amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Korrektur buchen</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Kontokorrrektur für <strong>{memberName}</strong>
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-gray-600">Aktueller Kontostand:</div>
            <div className={`text-lg font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(currentBalance)}
            </div>
            {formData.amount !== 0 && (
              <>
                <div className="text-sm text-gray-600 mt-2">Neuer Kontostand:</div>
                <div className={`text-lg font-bold ${newBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(newBalance)}
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Korrekturbetrag
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Positiv: Guthaben | Negativ: Belastung"
              />
              <p className="text-xs text-gray-500 mt-1">
                Positive Werte erhöhen das Guthaben, negative Werte belasten das Konto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Korrekturtyp
              </label>
              <select
                value={formData.correction_type}
                onChange={(e) => setFormData(prev => ({ ...prev, correction_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="adjustment">Anpassung</option>
                <option value="error_fix">Fehlerkorrektur</option>
                <option value="goodwill">Kulanz</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Manuelle Kontoanpassung"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grund
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Detaillierte Begründung für die Korrektur..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={processing || formData.amount === 0 || !formData.description || !formData.reason}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Speichern...' : 'Korrektur buchen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stilllegung verwalten Modal
interface ManageSuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  onSave: (suspension: SuspensionEntry) => Promise<void>;
}

interface SuspensionEntry {
  start_date: string;
  end_date: string;
  reason: string;
  suspension_type: 'temporary' | 'permanent' | 'medical' | 'other';
  notes: string;
}

export function ManageSuspensionModal({ isOpen, onClose, memberName, onSave }: ManageSuspensionModalProps) {
  const [formData, setFormData] = useState<SuspensionEntry>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reason: '',
    suspension_type: 'temporary',
    notes: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.start_date) {
      setError('Bitte geben Sie ein Startdatum ein');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Bitte geben Sie einen Grund ein');
      return;
    }
    if (formData.suspension_type === 'temporary' && !formData.end_date) {
      setError('Für temporäre Stilllegungen ist ein Enddatum erforderlich');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await onSave(formData);
      onClose();
      setFormData({
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reason: '',
        suspension_type: 'temporary',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Pause className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Stilllegung verwalten</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Mitgliedschaft für <strong>{memberName}</strong> stilllegen
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stilllegungstyp
              </label>
              <select
                value={formData.suspension_type}
                onChange={(e) => setFormData(prev => ({ ...prev, suspension_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="temporary">Temporär</option>
                <option value="permanent">Permanent</option>
                <option value="medical">Medizinisch</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Startdatum
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enddatum {formData.suspension_type === 'temporary' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formData.suspension_type === 'permanent'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grund
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Grund wählen...</option>
                <option value="Krankheit">Krankheit</option>
                <option value="Urlaub">Urlaub</option>
                <option value="Finanzielle Gründe">Finanzielle Gründe</option>
                <option value="Umzug">Umzug</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notizen
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Zusätzliche Informationen..."
              />
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Wichtiger Hinweis</span>
            </div>
            <p className="text-sm text-yellow-700">
              Während der Stilllegung werden keine Beiträge berechnet. Die Mitgliedschaft bleibt bestehen.
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={processing || !formData.start_date || !formData.reason || (formData.suspension_type === 'temporary' && !formData.end_date)}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {processing ? 'Speichern...' : 'Stilllegung aktivieren'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 