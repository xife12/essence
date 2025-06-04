'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// Mock-Daten für Kampagnen
const mockCampaigns = [
  {
    id: '1',
    name: 'Sommerkampagne 2023',
    description: 'Sonderaktion für neue Mitglieder im Sommer',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    status: 'active',
    // Statistiken
    stats: {
      leads: 145,
      memberships: 62,
      conversionRate: 42.8,
      channelDistribution: [
        { name: 'Social Media', value: 68 },
        { name: 'Empfehlung', value: 45 },
        { name: 'Flyer', value: 32 },
      ],
      contractDistribution: [
        { name: 'Premium', value: 30 },
        { name: 'Standard', value: 25 },
        { name: 'Flex', value: 7 },
      ]
    }
  },
  {
    id: '2',
    name: 'Studenten-Special',
    description: 'Rabattaktion für Studenten zum Semesterbeginn',
    startDate: '2023-09-01',
    endDate: '2023-10-15',
    status: 'active',
    // Statistiken
    stats: {
      leads: 85,
      memberships: 41,
      conversionRate: 48.2,
      channelDistribution: [
        { name: 'Social Media', value: 45 },
        { name: 'Campus-Aktion', value: 30 },
        { name: 'Empfehlung', value: 10 },
      ],
      contractDistribution: [
        { name: 'Student-Basis', value: 25 },
        { name: 'Student-Premium', value: 16 },
      ]
    }
  },
  {
    id: '3',
    name: 'Winter-Wellness',
    description: 'Winteraktion mit Fokus auf Gesundheit & Wellness',
    startDate: '2023-11-15',
    endDate: '2024-01-31',
    status: 'inactive',
    // Statistiken
    stats: {
      leads: 0,
      memberships: 0,
      conversionRate: 0,
      channelDistribution: [],
      contractDistribution: []
    }
  }
];

export default function KampagnenPage() {
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Formatieren des Datums für die Anzeige
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const toggleExpand = (campaignId: string) => {
    setExpandedCampaignId(expandedCampaignId === campaignId ? null : campaignId);
  };
  
  return (
    <div>
      <PageHeader 
        title="Kampagnen" 
        breadcrumb={['Home', 'Kampagnen']}
        action={{
          label: "Neue Kampagne",
          onClick: () => setIsModalOpen(true)
        }}
      />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Kampagnen-Tabelle */}
        <div className="col-span-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                {mockCampaigns.map((campaign) => (
                  <>
                    <tr 
                      key={campaign.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleExpand(campaign.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedCampaignId === campaign.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-400 mr-2" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Hier würde die Bearbeitungslogik aufgerufen
                            console.log('Bearbeite Kampagne', campaign.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Ausgeklappte Statistik */}
                    {expandedCampaignId === campaign.id && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <h4 className="font-semibold mb-2">Kampagnenstatistik</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase">Generierte Leads</div>
                                <div className="text-2xl font-bold">{campaign.stats.leads}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase">Abgeschlossene Mitgliedschaften</div>
                                <div className="text-2xl font-bold">{campaign.stats.memberships}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase">Conversion-Rate</div>
                                <div className="text-2xl font-bold">{campaign.stats.conversionRate}%</div>
                              </div>
                            </div>
                            
                            {campaign.stats.leads > 0 && (
                              <>
                                <h5 className="font-medium mb-2">Kanalverteilung</h5>
                                <div className="mb-4">
                                  {campaign.stats.channelDistribution.map((channel, index) => (
                                    <div key={index} className="mb-2">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>{channel.name}</span>
                                        <span>{Math.round((channel.value / campaign.stats.leads) * 100)}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                          className="h-1.5 rounded-full bg-blue-500"
                                          style={{ width: `${(channel.value / campaign.stats.leads) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <h5 className="font-medium mb-2">Vertragsverteilung</h5>
                                <div>
                                  {campaign.stats.contractDistribution.map((contract, index) => (
                                    <div key={index} className="mb-2">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>{contract.name}</span>
                                        <span>{Math.round((contract.value / campaign.stats.memberships) * 100)}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                          className="h-1.5 rounded-full bg-green-500"
                                          style={{ width: `${(contract.value / campaign.stats.memberships) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal für neue Kampagne würde hier implementiert */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Neue Kampagne anlegen</h3>
                {/* Formularfelder würden hier implementiert */}
                <p className="text-gray-500">Formularinhalt hier...</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Speichern
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 