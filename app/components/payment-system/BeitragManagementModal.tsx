'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Calculator, Edit3, Trash2 } from 'lucide-react';

export interface BeitragEntry {
  id: string;
  faelligkeit: string;
  typ: string;
  beschreibung: string;
  betrag: number;
  ust: number;
  offen: number;
  status: string;
}

interface BeitragManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BeitragEntry | null;
  onSave: (updatedEntry: BeitragEntry, action: 'edit' | 'storno' | 'reduce') => Promise<void>;
}

type ManagementAction = 'edit' | 'storno' | 'reduce';

export function BeitragManagementModal({ 
  isOpen, 
  onClose, 
  entry, 
  onSave 
}: BeitragManagementModalProps) {
  const [action, setAction] = useState<ManagementAction>('edit');
  const [formData, setFormData] = useState<Partial<BeitragEntry>>({});
  const [stornoReason, setStornoReason] = useState('');
  const [reductionAmount, setReductionAmount] = useState(0);
  const [reductionReason, setReductionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (entry && isOpen) {
      setFormData({ ...entry });
      setReductionAmount(0);
      setStornoReason('');
      setReductionReason('');
      setError(null);
    }
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSave = async () => {
    try {
      setProcessing(true);
      setError(null);

      let updatedEntry: BeitragEntry;

      switch (action) {
        case 'storno':
          if (!stornoReason.trim()) {
            setError('Storno-Grund ist erforderlich');
            return;
          }
          updatedEntry = {
            ...entry,
            offen: 0,
            status: 'storniert',
            beschreibung: `${entry.beschreibung} (STORNIERT: ${stornoReason})`
          };
          break;

        case 'reduce':
          if (reductionAmount <= 0 || reductionAmount >= entry.betrag) {
            setError('Reduktionsbetrag muss zwischen 0 und dem ursprünglichen Betrag liegen');
            return;
          }
          if (!reductionReason.trim()) {
            setError('Reduktions-Grund ist erforderlich');
            return;
          }
          const newAmount = entry.betrag - reductionAmount;
          updatedEntry = {
            ...entry,
            betrag: newAmount,
            offen: Math.max(0, entry.offen - reductionAmount),
            beschreibung: `${entry.beschreibung} (REDUZIERT: -${reductionAmount.toFixed(2)}€ - ${reductionReason})`
          };
          break;

        case 'edit':
          updatedEntry = {
            ...entry,
            ...formData
          } as BeitragEntry;
          break;

        default:
          throw new Error('Unbekannte Aktion');
      }

      await onSave(updatedEntry, action);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Beitrag verwalten
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Beitrag Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Fälligkeit:</span>
              <span className="ml-2 font-medium">{formatDate(entry.faelligkeit)}</span>
            </div>
            <div>
              <span className="text-gray-600">Typ:</span>
              <span className="ml-2 font-medium">{entry.typ}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Beschreibung:</span>
              <span className="ml-2 font-medium">{entry.beschreibung}</span>
            </div>
            <div>
              <span className="text-gray-600">Betrag:</span>
              <span className="ml-2 font-medium">{formatCurrency(entry.betrag)}</span>
            </div>
            <div>
              <span className="text-gray-600">Offen:</span>
              <span className="ml-2 font-medium">{formatCurrency(entry.offen)}</span>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Aktion wählen</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setAction('edit')}
                className={`p-3 rounded-lg border text-center ${
                  action === 'edit' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Edit3 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Bearbeiten</div>
              </button>
              
              <button
                onClick={() => setAction('reduce')}
                className={`p-3 rounded-lg border text-center ${
                  action === 'reduce' 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Calculator className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Reduzieren</div>
              </button>
              
              <button
                onClick={() => setAction('storno')}
                className={`p-3 rounded-lg border text-center ${
                  action === 'storno' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Trash2 className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Stornieren</div>
              </button>
            </div>
          </div>

          {/* Action Forms */}
          {action === 'edit' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Beitrag bearbeiten</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fälligkeit
                  </label>
                  <input
                    type="date"
                    value={formData.faelligkeit?.split('T')[0] || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      faelligkeit: e.target.value + 'T00:00:00Z' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Betrag
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.betrag || 0}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      betrag: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={formData.beschreibung || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    beschreibung: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === 'reduce' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Beitrag reduzieren</h3>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Betragsreduzierung</span>
                </div>
                <p className="text-sm text-orange-700">
                  Ursprünglicher Betrag: {formatCurrency(entry.betrag)}
                </p>
                <p className="text-sm text-orange-700">
                  Neuer Betrag: {formatCurrency(Math.max(0, entry.betrag - reductionAmount))}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reduktionsbetrag
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={entry.betrag - 0.01}
                  value={reductionAmount}
                  onChange={(e) => setReductionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Betrag in €"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grund für Reduktion
                </label>
                <select
                  value={reductionReason}
                  onChange={(e) => setReductionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Grund wählen...</option>
                  <option value="Kulanz">Kulanz</option>
                  <option value="Vertragliche Anpassung">Vertragliche Anpassung</option>
                  <option value="Sonderkonditionen">Sonderkonditionen</option>
                  <option value="Fehlerkorrektur">Fehlerkorrektur</option>
                  <option value="Andere">Andere</option>
                </select>
              </div>
            </div>
          )}

          {action === 'storno' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Beitrag stornieren</h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Warnung</span>
                </div>
                <p className="text-sm text-red-700">
                  Diese Aktion setzt den offenen Betrag auf 0€ und markiert den Eintrag als storniert. 
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grund für Stornierung
                </label>
                <select
                  value={stornoReason}
                  onChange={(e) => setStornoReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Grund wählen...</option>
                  <option value="Kündigung">Kündigung</option>
                  <option value="Stillegung">Stillegung</option>
                  <option value="Fehlerkorrektur">Fehlerkorrektur</option>
                  <option value="Kulanz">Kulanz</option>
                  <option value="Vertragliche Vereinbarung">Vertragliche Vereinbarung</option>
                  <option value="Andere">Andere</option>
                </select>
              </div>
            </div>
          )}

          {/* Error Display */}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={processing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={processing || (action === 'storno' && !stornoReason) || (action === 'reduce' && (!reductionReason || reductionAmount <= 0))}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 ${
                action === 'storno' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : action === 'reduce'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {processing ? 'Speichern...' : 
               action === 'storno' ? 'Stornieren' :
               action === 'reduce' ? 'Reduzieren' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 