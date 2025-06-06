'use client';

import React, { useState } from 'react';
import { UserCog, UserPlus, Search, Mail, Phone, MoreHorizontal, Users, Shield } from 'lucide-react';
import FilePermissionsTab from '../../components/mitarbeiter/FilePermissionsTab';

// Mock-Daten für Mitarbeiter (später durch echte API ersetzen)
const mockStaff = [
  { 
    id: '1', 
    email: 'max.mustermann@fitnessstudio.de', 
    rolle: 'admin' as const,
    first_name: 'Max',
    last_name: 'Mustermann'
  },
  { 
    id: '2', 
    email: 'julia.mueller@fitnessstudio.de', 
    rolle: 'studioleiter' as const,
    first_name: 'Julia',
    last_name: 'Müller'
  },
  { 
    id: '3', 
    email: 'thomas.schmidt@fitnessstudio.de', 
    rolle: 'mitarbeiter' as const,
    first_name: 'Thomas',
    last_name: 'Schmidt'
  },
  { 
    id: '4', 
    email: 'anna.weber@fitnessstudio.de', 
    rolle: 'mitarbeiter' as const,
    first_name: 'Anna',
    last_name: 'Weber'
  }
];

type TabType = 'uebersicht' | 'dateirechte';

export default function MitarbeiterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('uebersicht');

  const tabs = [
    { id: 'uebersicht' as TabType, label: 'Übersicht', icon: Users },
    { id: 'dateirechte' as TabType, label: 'Dateimanager-Rechte', icon: Shield }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mitarbeiter</h1>
          <p className="text-gray-500 mt-1">Verwaltung des Teams</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          <span>Mitarbeiter hinzufügen</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'uebersicht' && (
            <div>
              {/* Suchbereich */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Team-Mitglieder</h2>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>Alle Rollen</option>
                      <option>Admin</option>
                      <option>Studioleiter</option>
                      <option>Mitarbeiter</option>
                    </select>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Mitarbeiter suchen..."
                        className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mitarbeiter-Tabelle */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Kontakt</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Rolle</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Letzter Login</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStaff.map((staff) => (
                      <tr key={staff.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                              <span className="font-medium text-gray-700">
                                {staff.first_name?.charAt(0)}{staff.last_name?.charAt(0)}
                              </span>
                            </div>
                            <span>{staff.first_name} {staff.last_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Mail size={14} className="text-gray-400" />
                              <span>{staff.email}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone size={14} className="text-gray-400" />
                              <span>+49 123 456789</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            staff.rolle === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : staff.rolle === 'studioleiter'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {staff.rolle}
                          </span>
                        </td>
                        <td className="px-4 py-3">Heute, 09:45 Uhr</td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button className="text-gray-500 hover:text-gray-700">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dateirechte' && (
            <FilePermissionsTab 
              staffList={mockStaff}
              onRefresh={() => {
                // Hier würde ein Refresh der Mitarbeiterdaten stattfinden
                console.log('Refresh triggered');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 