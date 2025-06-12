'use client';

import React, { useState } from 'react';

// Interface für den Vertragstyp
interface ContractType {
  id: number;
  name: string;
  term: number;
  price_per_month: number;
  has_group_discount: boolean;
  group_discount_rate?: number;
  has_paid_modules: boolean;
  has_free_modules: boolean;
  bonus_period: number;
  active: boolean;
}

export default function Vertragsarten() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractType | null>(null);
  
  // Beispieldaten für Vertragsarten
  const contractTypes: ContractType[] = [
    { 
      id: 1, 
      name: 'Basic', 
      term: 12, 
      price_per_month: 39.90,
      has_group_discount: false,
      has_paid_modules: false,
      has_free_modules: false,
      bonus_period: 0,
      active: true
    },
    { 
      id: 2, 
      name: 'Premium', 
      term: 12, 
      price_per_month: 79.90,
      has_group_discount: true,
      group_discount_rate: 10,
      has_paid_modules: true,
      has_free_modules: true,
      bonus_period: 1,
      active: true
    },
    { 
      id: 3, 
      name: 'Student', 
      term: 6, 
      price_per_month: 29.90,
      has_group_discount: false,
      has_paid_modules: false,
      has_free_modules: true,
      bonus_period: 0,
      active: true
    }
  ];
  
  const handleEdit = (contract: ContractType) => {
    setSelectedContract(contract);
    setShowEditModal(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vertragsarten</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowCreateModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neue Vertragsart
        </button>
      </div>
      
      {/* Übersichtstabelle gemäß Rules */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laufzeit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beitrag
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gruppenrabatt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zubuchbare Module
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kostenfreie Module
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonuszeit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contractTypes.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{contract.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.term} Monate
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    €{contract.price_per_month.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.has_group_discount ? 
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Ja ({contract.group_discount_rate}%)</span> : 
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Nein</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.has_paid_modules ? 
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Ja</span> : 
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Nein</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.has_free_modules ? 
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Ja</span> : 
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Nein</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.bonus_period > 0 ? 
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">+{contract.bonus_period} Monate</span> : 
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Keine</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contract.active ? 
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Aktiv</span> : 
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Inaktiv</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEdit(contract)}
                    >
                      Bearbeiten
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      {contract.active ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal für neue Vertragsart */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Neue Vertragsart anlegen</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreateModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Premium Plus"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <input
                  type="text"
                  id="description"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kurzbeschreibung der Vertragsart"
                />
              </div>
              
              <div>
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Laufzeit in Monaten</label>
                <input
                  type="number"
                  id="term"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                  min="1"
                />
              </div>
              
              <div>
                <label htmlFor="price_per_month" className="block text-sm font-medium text-gray-700 mb-1">Monatlicher Beitrag (€)</label>
                <input
                  type="number"
                  id="price_per_month"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <label htmlFor="bonus_period" className="block text-sm font-medium text-gray-700 mb-1">Bonuszeitraum (Monate)</label>
                <input
                  type="number"
                  id="bonus_period"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">Automatische Verlängerung</label>
                <div className="flex items-center h-full">
                  <label className="inline-flex items-center mr-4">
                    <input 
                      type="radio" 
                      name="auto_renew" 
                      value="true"
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Ja</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="auto_renew" 
                      value="false"
                      className="h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <span className="ml-2">Nein</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="renewal_term" className="block text-sm font-medium text-gray-700 mb-1">Verlängerungsdauer (Monate)</label>
                <input
                  type="number"
                  id="renewal_term"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                  disabled
                />
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">Gruppenrabatt erlaubt</label>
                <div className="flex items-center h-full">
                  <label className="inline-flex items-center mr-4">
                    <input 
                      type="radio" 
                      name="has_group_discount" 
                      value="true"
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Ja</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="has_group_discount" 
                      value="false"
                      className="h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <span className="ml-2">Nein</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="group_discount_rate" className="block text-sm font-medium text-gray-700 mb-1">Rabatt in %</label>
                <input
                  type="number"
                  id="group_discount_rate"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  min="0"
                  max="100"
                  disabled
                />
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">Kostenpflichtige Module erlaubt</label>
                <div className="flex items-center h-full">
                  <label className="inline-flex items-center mr-4">
                    <input 
                      type="radio" 
                      name="has_paid_modules" 
                      value="true"
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Ja</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="has_paid_modules" 
                      value="false"
                      className="h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <span className="ml-2">Nein</span>
                  </label>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-3">Kostenfreie Module erlaubt</label>
                <div className="flex items-center h-full">
                  <label className="inline-flex items-center mr-4">
                    <input 
                      type="radio" 
                      name="has_free_modules" 
                      value="true"
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Ja</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="has_free_modules" 
                      value="false"
                      className="h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <span className="ml-2">Nein</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">Aktiv</label>
              </div>
            </div>
            
            {/* Module-Sektion wenn kostenpflichtige oder kostenfreie Module aktiviert sind */}
            <div className="mb-6 hidden">
              <h3 className="text-md font-medium mb-3">Verfügbare Module</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="module_1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="module_1" className="ml-2 font-medium">Sauna</label>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="€"
                        className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="module_2"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="module_2" className="ml-2 font-medium">Getränke-Flatrate</label>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="€"
                        className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="module_3"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="module_3" className="ml-2 font-medium">Personal Training</label>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="€"
                        className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCreateModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Vertragsart speichern
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal für Vertragsart bearbeiten */}
      {showEditModal && selectedContract && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Vertragsart bearbeiten: {selectedContract.name}</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Hier würde das Bearbeitungsformular angezeigt, ähnlich dem Erstellungsformular */}
            {/* ... */}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowEditModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 