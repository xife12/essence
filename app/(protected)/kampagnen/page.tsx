'use client';

import React from 'react';
import { Activity, Plus, ChevronDown, ChevronUp, BarChart } from 'lucide-react';

export default function KampagnenPage() {
  const [expandedCampaigns, setExpandedCampaigns] = React.useState<number[]>([0]);

  const toggleExpand = (index: number) => {
    setExpandedCampaigns(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kampagnen</h1>
          <p className="text-gray-500 mt-1">Marketing und Werbemaßnahmen</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>Neue Kampagne</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold">Aktive Kampagnen</h2>
        </div>
        
        <div>
          {['Sommer-Aktion 2023', 'Instagram-Kampagne', 'Freunde-werben-Freunde'].map((name, index) => (
            <div key={index} className="border-b border-gray-100 last:border-b-0">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Activity size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{name}</h3>
                    <p className="text-sm text-gray-500">01.06.2023 - 30.06.2023</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Aktiv
                  </span>
                  {expandedCampaigns.includes(index) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              {expandedCampaigns.includes(index) && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <BarChart size={18} className="text-blue-500" />
                        <h4 className="font-medium">Leads</h4>
                      </div>
                      <p className="text-2xl font-bold mt-2">27</p>
                      <p className="text-sm text-gray-500">Generierte Interessenten</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <BarChart size={18} className="text-green-500" />
                        <h4 className="font-medium">Konvertiert</h4>
                      </div>
                      <p className="text-2xl font-bold mt-2">8</p>
                      <p className="text-sm text-gray-500">Abgeschlossene Verträge</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <BarChart size={18} className="text-purple-500" />
                        <h4 className="font-medium">Conversion-Rate</h4>
                      </div>
                      <p className="text-2xl font-bold mt-2">29,6%</p>
                      <p className="text-sm text-gray-500">Abschlussquote</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Kampagne bearbeiten
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 