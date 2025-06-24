'use client';

import React, { useState } from 'react';
import { X, Calendar, Euro, Save } from 'lucide-react';

interface BeitragskalenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entryId?: string;
  memberId?: string;
}

const BeitragskalenderModal: React.FC<BeitragskalenderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entryId,
  memberId
}) => {
  const [formData, setFormData] = useState({
    member_id: memberId || '',
    due_date: '',
    transaction_type: 'membership_fee',
    amount: 0,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {entryId ? 'Beitragskalender bearbeiten' : 'Neuer Beitragskalender-Eintrag'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mitglieds-ID
                </label>
                <input
                  type="text"
                  value={formData.member_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  placeholder="z.B. MB001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fälligkeitsdatum
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ
                </label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, transaction_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                >
                  <option value="membership_fee">Monatsbeitrag</option>
                  <option value="pauschale">Pauschale</option>
                  <option value="modul">Modul</option>
                  <option value="setup_fee">Startpaket</option>
                  <option value="penalty_fee">Gebühr</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  placeholder="89.90"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  placeholder="Automatisch generiert..."
                />
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {entryId ? 'Aktualisieren' : 'Erstellen'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeitragskalenderModal; 