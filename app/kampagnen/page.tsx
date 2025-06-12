'use client';

import React, { useState } from 'react';

// Interface für Kampagnentyp
interface Campaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  leads: number;
  conversions: number;
}

export default function Kampagnen() {
  // Status für Modals
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);
  
  // Beispieldaten für Kampagnen
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Sommer-Aktion 2024',
      description: 'Rabatt für Neukunden',
      startDate: '01.06.2024',
      endDate: '31.08.2024',
      status: 'active',
      leads: 32,
      conversions: 8
    },
    {
      id: 2,
      name: 'Instagram-Werbung',
      description: 'Social Media Kampagne',
      startDate: '15.05.2024',
      endDate: '15.07.2024',
      status: 'active',
      leads: 24,
      conversions: 5
    },
    {
      id: 3,
      name: 'Empfehlungsprogramm',
      description: 'Mitglieder werben Mitglieder',
      startDate: '01.04.2024',
      endDate: '30.09.2024',
      status: 'active',
      leads: 18,
      conversions: 12
    }
  ];
  
  const toggleExpandCampaign = (id: number) => {
    if (expandedCampaign === id) {
      setExpandedCampaign(null);
    } else {
      setExpandedCampaign(id);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kampagnen</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowCampaignModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neue Kampagne
        </button>
      </div>
      
      {/* Kampagnen-Tabelle gemäß Rules */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zeitraum
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
            {campaigns.map((campaign) => (
              <React.Fragment key={campaign.id}>
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpandCampaign(campaign.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{campaign.startDate} - {campaign.endDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Hier Bearbeiten-Funktion implementieren
                      }}
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
                
                {/* Aufklappbare Statistik gemäß Rules */}
                {expandedCampaign === campaign.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-4">
                      <div className="py-2">
                        <h3 className="text-md font-medium mb-3">Kampagnenstatistik: {campaign.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* 1. Anzahl generierter Leads */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Generierte Leads</h4>
                            <p className="text-2xl font-bold text-blue-600">{campaign.leads}</p>
                          </div>
                          
                          {/* 2. Anzahl abgeschlossener Mitgliedschaften */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Abgeschlossene Mitgliedschaften</h4>
                            <p className="text-2xl font-bold text-green-600">{campaign.conversions}</p>
                          </div>
                          
                          {/* 3. Conversion-Rate */}
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Conversion-Rate</h4>
                            <p className="text-2xl font-bold text-purple-600">
                              {campaign.leads > 0 ? Math.round((campaign.conversions / campaign.leads) * 100) : 0}%
                            </p>
                          </div>
                          
                          {/* 4. Kanalverteilung */}
                          <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-3 lg:col-span-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Kanalverteilung</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Social Media</span>
                                <span className="text-xs font-medium">16 (50%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Website</span>
                                <span className="text-xs font-medium">10 (31%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '31%' }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Empfehlungen</span>
                                <span className="text-xs font-medium">6 (19%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: '19%' }}></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 5. Vertragsverteilung */}
                          <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-3 lg:col-span-1">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Vertragsverteilung</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Premium</span>
                                <span className="text-xs font-medium">4 (50%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Basic</span>
                                <span className="text-xs font-medium">3 (38%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '38%' }}></div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Student</span>
                                <span className="text-xs font-medium">1 (12%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-pink-600 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal für neue Kampagne gemäß Rules */}
      {showCampaignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Neue Kampagne anlegen</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCampaignModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Sommer-Aktion 2024"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                  <input
                    type="date"
                    id="startDate"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Enddatum</label>
                  <input
                    type="date"
                    id="endDate"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beschreibung der Kampagne..."
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="campaignType" className="block text-sm font-medium text-gray-700 mb-1">Kampagnentyp</label>
                <select
                  id="campaignType"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="online">Online</option>
                  <option value="print">Print</option>
                  <option value="event">Event</option>
                  <option value="referral">Empfehlungsprogramm</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">Zielgruppe</label>
                <select
                  id="target"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="new">Neukunden</option>
                  <option value="existing">Bestandskunden</option>
                  <option value="all">Alle</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="bonusPeriod" className="block text-sm font-medium text-gray-700 mb-1">Bonuszeitraum (Monate)</label>
                <input
                  type="number"
                  id="bonusPeriod"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kanäle</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="channel_social"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="channel_social" className="ml-2 text-sm text-gray-700">Social Media</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="channel_website"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="channel_website" className="ml-2 text-sm text-gray-700">Website</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="channel_flyer"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="channel_flyer" className="ml-2 text-sm text-gray-700">Flyer</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="channel_referral"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="channel_referral" className="ml-2 text-sm text-gray-700">Empfehlung</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vertragsarten</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="contract_basic"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="contract_basic" className="ml-2 text-sm text-gray-700">Basic</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="contract_premium"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="contract_premium" className="ml-2 text-sm text-gray-700">Premium</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="contract_student"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="contract_student" className="ml-2 text-sm text-gray-700">Student</label>
                  </div>
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
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowCampaignModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Kampagne speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 