'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface StundenModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  date: string | null;
  existingData?: {
    id: string;
    staff_id: string;
    date: string;
    hours: number;
    reason: string | null;
  };
}

export default function StundenModal({ isOpen, onClose, staffId, date, existingData }: StundenModalProps) {
  const [hours, setHours] = useState<number>(existingData?.hours || 8);
  const [reason, setReason] = useState<string>(existingData?.reason || '');
  const [selectedDate, setSelectedDate] = useState<string>(date || new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    if (existingData) {
      setHours(existingData.hours);
      setReason(existingData.reason || '');
    }
  }, [existingData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die API-Integration zur Speicherung der Daten erfolgen
    console.log('Speichere Stunden:', { staffId, date: selectedDate, hours, reason });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {existingData ? 'Stunden bearbeiten' : 'Stunden erfassen'}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                  Stunden
                </label>
                <input
                  type="number"
                  id="hours"
                  min="0"
                  max="24"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(parseFloat(e.target.value))}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximal 24 Stunden pro Tag möglich. Benutze Dezimalwerte für halbe Stunden (z.B. 7.5).
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Grund (optional)
                </label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Bitte wählen --</option>
                  <option value="BGM-Termin">BGM-Termin</option>
                  <option value="Urlaub">Urlaub</option>
                  <option value="Krankheit">Krankheit</option>
                  <option value="Schulung">Schulung</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 