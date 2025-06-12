'use client';

import React, { useState } from 'react';

export default function Mitglieder() {
  // Platzhalter-Daten für Mitglieder
  const members = [
    { id: 1, name: 'Anna Müller', status: 'Aktiv', contract: 'Premium', since: '01.01.2023', expires: '31.12.2024', last_visit: '04.06.2024' },
    { id: 2, name: 'Thomas Schmidt', status: 'Aktiv', contract: 'Basic', since: '15.03.2023', expires: '14.03.2025', last_visit: '02.06.2024' },
    { id: 3, name: 'Laura Weber', status: 'Gekündigt', contract: 'Student', since: '10.09.2022', expires: '09.09.2023', last_visit: '25.05.2024' },
    { id: 4, name: 'Michael Fischer', status: 'Aktiv', contract: 'Premium', since: '05.05.2023', expires: '04.05.2025', last_visit: '03.06.2024' },
  ];
  
  // Status für Modals und Tabs
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'vertrag' | 'besuche' | 'kurse' | 'zahlungen' | 'notizen'>('details');
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mitglieder</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowMemberModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neues Mitglied
        </button>
      </div>
      
      {/* Statistik-Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Aktive Mitglieder</p>
          <p className="text-2xl font-bold">127</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+8 (6.7%)</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Vertragsverlängerungen</p>
          <p className="text-2xl font-bold">12</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+3 (33%)</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Kündigungen</p>
          <p className="text-2xl font-bold">4</p>
          <div className="flex items-center mt-2">
            <span className="text-red-600 text-sm font-medium">+1 (33%)</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Durchschn. Vertragslaufzeit</p>
          <p className="text-2xl font-bold">18.3 Mo</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+0.7 Mo</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
      </div>
      
      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle</option>
              <option value="active">Aktiv</option>
              <option value="paused">Pausiert</option>
              <option value="cancelled">Gekündigt</option>
              <option value="expired">Abgelaufen</option>
            </select>
          </div>
          <div>
            <label htmlFor="contract" className="block text-sm font-medium text-gray-700 mb-1">Vertragsart</label>
            <select
              id="contract"
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle</option>
              <option value="premium">Premium</option>
              <option value="basic">Basic</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <input
              type="text"
              id="search"
              placeholder="Name, ID, E-Mail..."
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="ml-auto self-end">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md">
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>
      
      {/* Mitglieder-Tabelle */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mitglied
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vertragsart
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vertrag bis
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letzter Besuch
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">ID: #{member.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {member.contract}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 
                      member.status === 'Gekündigt' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.since}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.expires}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.last_visit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                    <button className="text-gray-600 hover:text-gray-900">Bearbeiten</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginierung */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Zurück
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Weiter
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Zeige <span className="font-medium">1</span> bis <span className="font-medium">4</span> von <span className="font-medium">127</span> Mitgliedern
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Zurück</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  13
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Weiter</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mitglied-Details Modal (würde in einer echten Anwendung als modales Fenster implementiert) */}
      {showMemberDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Anna Müller</h2>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-500">Mitglied seit 01.01.2023 | ID: #1</p>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Details
                </button>
                <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'vertrag' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Vertrag
                </button>
                <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'besuche' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Besuche
                </button>
                <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'kurse' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Kurse
                </button>
                <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'zahlungen' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Zahlungen
                </button>
                <button className={`px-6 py-3 text-sm font-medium ${activeTab === 'notizen' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  Notizen
                </button>
              </nav>
            </div>
            
            {/* Tab-Inhalte */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Details-Tab (angezeigt) */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Persönliche Daten</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">Anna Müller</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Geburtsdatum</p>
                          <p className="font-medium">15.05.1990</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">E-Mail</p>
                          <p className="font-medium">anna.mueller@example.com</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Telefon</p>
                          <p className="font-medium">+49 123 4567890</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="font-medium">Musterstraße 123, 12345 Berlin</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Statistiken</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Besuche (gesamt)</p>
                          <p className="font-medium">87</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Besuche (letzter Monat)</p>
                          <p className="font-medium">12</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Durchschnittliche Besuche pro Woche</p>
                          <p className="font-medium">2.8</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Letzte Vertragsverlängerung</p>
                          <p className="font-medium">01.01.2024</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kundenwert</p>
                          <p className="font-medium">€1,284.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Letzte Aktivitäten</h3>
                    <div className="border rounded-md divide-y">
                      <div className="p-4 flex items-start">
                        <div className="rounded-full bg-blue-100 p-2 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Check-In</p>
                          <p className="text-sm text-gray-500">04.06.2024, 17:30 Uhr</p>
                        </div>
                      </div>
                      <div className="p-4 flex items-start">
                        <div className="rounded-full bg-green-100 p-2 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Zahlung eingegangen</p>
                          <p className="text-sm text-gray-500">01.06.2024, €39.99</p>
                        </div>
                      </div>
                      <div className="p-4 flex items-start">
                        <div className="rounded-full bg-purple-100 p-2 mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Kurs gebucht</p>
                          <p className="text-sm text-gray-500">30.05.2024, Yoga-Kurs (Mittwochs, 18:00 Uhr)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Vertrag-Tab */}
              {activeTab === 'vertrag' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Aktueller Vertrag</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Vertragsart</p>
                          <div className="flex items-center">
                            <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                              Premium
                            </span>
                            <span className="text-sm text-gray-500">€39.99 / Monat</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                            Aktiv
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Vertragsbeginn</p>
                          <p className="font-medium">01.01.2023</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nächste Verlängerung</p>
                          <p className="font-medium">31.12.2024</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mindestlaufzeit</p>
                          <p className="font-medium">12 Monate</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kündigungsfrist</p>
                          <p className="font-medium">1 Monat zum Vertragsende</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex space-x-3">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          Vertrag verlängern
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Vertrag kündigen
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Vertragsverlauf</h3>
                      <div className="border rounded-md divide-y">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Premium</p>
                              <p className="text-sm text-gray-500">01.01.2023 - 31.12.2024</p>
                            </div>
                            <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                              Aktiv
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Vertragsverlängerung am 01.01.2024 um 12 Monate
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Basic</p>
                              <p className="text-sm text-gray-500">01.01.2022 - 31.12.2022</p>
                            </div>
                            <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Abgelaufen
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Upgrade auf Premium am 01.01.2023
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Zahlungsinformationen</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Zahlungsmethode</p>
                          <p className="font-medium">SEPA-Lastschrift</p>
                          <p className="text-sm text-gray-500 mt-1">DE89 3704 0044 0532 0130 00</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rechnungsadresse</p>
                          <p className="font-medium">Anna Müller</p>
                          <p className="text-sm text-gray-500">Musterstraße 123, 12345 Berlin</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nächste Abbuchung</p>
                          <p className="font-medium">01.07.2024</p>
                          <p className="text-sm text-gray-500">€39.99</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Zahlungsstatus</p>
                          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                            Keine ausstehenden Zahlungen
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Andere Tabs würden hier implementiert */}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal für neues Mitglied */}
      {showMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Neues Mitglied anlegen</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowMemberModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input
                  type="email"
                  id="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
                <input
                  type="date"
                  id="birthdate"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="memberNumber" className="block text-sm font-medium text-gray-700 mb-1">Mitgliedsnummer</label>
                <input
                  type="text"
                  id="memberNumber"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">Vertragsart</label>
                <select
                  id="contractType"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="premium">Premium</option>
                  <option value="basic">Basic</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                <input
                  type="date"
                  id="startDate"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMemberModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Mitglied speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 