'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, CreditCard, AlertTriangle } from 'lucide-react';

// Payment Group Edit Modal
interface PaymentGroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: {
    id: string;
    name: string;
    payment_day: number;
  } | null;
  availableGroups: Array<{
    id: string;
    name: string;
    payment_day: number;
    description?: string;
  }>;
  onSave: (groupId: string) => Promise<void>;
}

export function PaymentGroupEditModal({
  isOpen,
  onClose,
  currentGroup,
  availableGroups,
  onSave
}: PaymentGroupEditModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentGroup) {
      setSelectedGroupId(currentGroup.id);
      setError(null);
    }
  }, [isOpen, currentGroup]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedGroupId) {
      setError('Bitte wählen Sie eine Zahllaufgruppe aus');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await onSave(selectedGroupId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setProcessing(false);
    }
  };

  const selectedGroup = availableGroups.find(g => g.id === selectedGroupId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Zahllaufgruppe ändern
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Wählen Sie eine neue Zahllaufgruppe für dieses Mitglied. Dies bestimmt, 
              wann die SEPA-Lastschriften eingezogen werden.
            </p>
            
            {currentGroup && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Aktuelle Gruppe:</p>
                <p className="font-medium text-gray-900">
                  {currentGroup.name} ({currentGroup.payment_day}. des Monats)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Neue Zahllaufgruppe wählen
            </label>
            
            {availableGroups.map((group) => (
              <div key={group.id} className="relative">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentGroup"
                    value={group.id}
                    checked={selectedGroupId === group.id}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {group.name}
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {group.payment_day}. des Monats
                      </p>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {selectedGroup && selectedGroup.id !== currentGroup?.id && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Neue Einstellung:</strong> Lastschriften werden ab sofort am {selectedGroup.payment_day}. des Monats eingezogen.
              </p>
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
              disabled={processing || !selectedGroupId || selectedGroupId === currentGroup?.id}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// IBAN Edit Modal
interface IBANEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIBAN: string;
  memberName: string;
  onSave: (newIBAN: string, mandateReference: string) => Promise<void>;
}

export function IBANEditModal({
  isOpen,
  onClose,
  currentIBAN,
  memberName,
  onSave
}: IBANEditModalProps) {
  const [iban, setIban] = useState('');
  const [mandateReference, setMandateReference] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIban(currentIBAN || '');
      setMandateReference(`MAND-${Date.now()}`); // Auto-generate mandate reference
      setError(null);
    }
  }, [isOpen, currentIBAN]);

  if (!isOpen) return null;

  const validateIBAN = (iban: string): boolean => {
    // Basic IBAN validation (simplified)
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN) && cleanIBAN.length >= 15 && cleanIBAN.length <= 34;
  };

  const formatIBAN = (value: string): string => {
    // Remove all spaces and convert to uppercase
    const clean = value.replace(/\s/g, '').toUpperCase();
    
    // Add spaces every 4 characters
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIBAN(e.target.value);
    setIban(formatted);
  };

  const handleSave = async () => {
    const cleanIBAN = iban.replace(/\s/g, '');
    
    if (!cleanIBAN) {
      setError('IBAN ist erforderlich');
      return;
    }

    if (!validateIBAN(cleanIBAN)) {
      setError('Ungültige IBAN. Bitte überprüfen Sie die Eingabe.');
      return;
    }

    if (!mandateReference.trim()) {
      setError('Mandat-Referenz ist erforderlich');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await onSave(cleanIBAN, mandateReference);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              IBAN ändern
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Ändern Sie die IBAN für <strong>{memberName}</strong>. 
              Ein neues SEPA-Mandat wird automatisch erstellt.
            </p>
            
            {currentIBAN && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Aktuelle IBAN:</p>
                <p className="font-mono text-gray-900">
                  {formatIBAN(currentIBAN)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neue IBAN
              </label>
              <input
                type="text"
                value={iban}
                onChange={handleIBANChange}
                placeholder="DE00 0000 0000 0000 0000 00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  iban && !validateIBAN(iban.replace(/\s/g, '')) 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {iban && !validateIBAN(iban.replace(/\s/g, '')) && (
                <p className="text-sm text-red-600 mt-1">
                  Ungültige IBAN-Format
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mandat-Referenz
              </label>
              <input
                type="text"
                value={mandateReference}
                onChange={(e) => setMandateReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MAND-..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Eindeutige Referenz für das SEPA-Lastschriftmandat
              </p>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Wichtiger Hinweis</span>
            </div>
            <p className="text-sm text-yellow-700">
              Nach der Änderung muss das neue SEPA-Mandat vom Mitglied unterschrieben werden, 
              bevor Lastschriften eingezogen werden können.
            </p>
          </div>

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
              disabled={processing || !iban || !mandateReference || !validateIBAN(iban.replace(/\s/g, ''))}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Speichern...' : 'IBAN ändern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 