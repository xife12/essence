'use client';

import React, { useState } from 'react';

export default function Leads() {
  // Status für Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showToMemberModal, setShowToMemberModal] = useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowLeadModal(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neuer Lead
        </button>
      </div>
      
      {/* Statistik-Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Offene Leads</p>
          <p className="text-2xl font-bold">32</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+5 (18%)</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Zu Mitgliedern konvertiert</p>
          <p className="text-2xl font-bold">18</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+3 (20%)</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Konversionsrate</p>
          <p className="text-2xl font-bold">56%</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+2%</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Durchschnittliche Kontaktzeit</p>
          <p className="text-2xl font-bold">3.2 Tage</p>
          <div className="flex items-center mt-2">
            <span className="text-red-600 text-sm font-medium">+0.5 Tage</span>
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
              <option value="new">Neu</option>
              <option value="contacted">Kontaktiert</option>
              <option value="interested">Interessiert</option>
              <option value="appointment">Termin vereinbart</option>
              <option value="trial">Probetraining</option>
              <option value="contract">Vertrag angeboten</option>
              <option value="converted">Konvertiert</option>
              <option value="lost">Verloren</option>
            </select>
          </div>
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Quelle</label>
            <select
              id="source"
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle</option>
              <option value="website">Website</option>
              <option value="social">Social Media</option>
              <option value="referral">Empfehlung</option>
              <option value="campaign">Kampagne</option>
              <option value="other">Sonstige</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <input
              type="text"
              id="search"
              placeholder="Name, E-Mail, Telefon..."
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
      
      {/* Leads-Tabelle */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontakt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quelle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letzter Kontakt
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Lead 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Julia Fischer</div>
                  <div className="text-sm text-gray-500">04.06.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">julia.fischer@example.com</div>
                  <div className="text-sm text-gray-500">+49 173 1234567</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Social Media
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select 
                      className="appearance-none bg-green-100 text-green-800 px-2 py-1 text-xs leading-5 font-semibold rounded-full w-full cursor-pointer"
                      defaultValue="interested"
                    >
                      <option value="new">Neu</option>
                      <option value="contacted">Kontaktiert</option>
                      <option value="interested">Interessiert</option>
                      <option value="appointment">Termin vereinbart</option>
                      <option value="trial">Probetraining</option>
                      <option value="contract">Vertrag angeboten</option>
                      <option value="converted">Konvertiert</option>
                      <option value="lost">Verloren</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="h-4 w-4 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  vor 2 Tagen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-green-600 hover:text-green-900">Zu Mitglied</button>
                </td>
              </tr>
              
              {/* Lead 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Thomas Müller</div>
                  <div className="text-sm text-gray-500">02.06.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">thomas.mueller@example.com</div>
                  <div className="text-sm text-gray-500">+49 162 9876543</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Empfehlung
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select 
                      className="appearance-none bg-blue-100 text-blue-800 px-2 py-1 text-xs leading-5 font-semibold rounded-full w-full cursor-pointer"
                      defaultValue="appointment"
                    >
                      <option value="new">Neu</option>
                      <option value="contacted">Kontaktiert</option>
                      <option value="interested">Interessiert</option>
                      <option value="appointment">Termin vereinbart</option>
                      <option value="trial">Probetraining</option>
                      <option value="contract">Vertrag angeboten</option>
                      <option value="converted">Konvertiert</option>
                      <option value="lost">Verloren</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="h-4 w-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Heute
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-green-600 hover:text-green-900">Zu Mitglied</button>
                </td>
              </tr>
              
              {/* Lead 3 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Anna Schmidt</div>
                  <div className="text-sm text-gray-500">01.06.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">anna.schmidt@example.com</div>
                  <div className="text-sm text-gray-500">+49 171 5432198</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    Website
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select 
                      className="appearance-none bg-purple-100 text-purple-800 px-2 py-1 text-xs leading-5 font-semibold rounded-full w-full cursor-pointer"
                      defaultValue="trial"
                    >
                      <option value="new">Neu</option>
                      <option value="contacted">Kontaktiert</option>
                      <option value="interested">Interessiert</option>
                      <option value="appointment">Termin vereinbart</option>
                      <option value="trial">Probetraining</option>
                      <option value="contract">Vertrag angeboten</option>
                      <option value="converted">Konvertiert</option>
                      <option value="lost">Verloren</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="h-4 w-4 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  vor 3 Tagen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-green-600 hover:text-green-900">Zu Mitglied</button>
                </td>
              </tr>
              
              {/* Lead 4 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Markus Weber</div>
                  <div className="text-sm text-gray-500">29.05.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">markus.weber@example.com</div>
                  <div className="text-sm text-gray-500">+49 177 8765432</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
                    Kampagne
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select 
                      className="appearance-none bg-pink-100 text-pink-800 px-2 py-1 text-xs leading-5 font-semibold rounded-full w-full cursor-pointer"
                      defaultValue="contract"
                    >
                      <option value="new">Neu</option>
                      <option value="contacted">Kontaktiert</option>
                      <option value="interested">Interessiert</option>
                      <option value="appointment">Termin vereinbart</option>
                      <option value="trial">Probetraining</option>
                      <option value="contract">Vertrag angeboten</option>
                      <option value="converted">Konvertiert</option>
                      <option value="lost">Verloren</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg className="h-4 w-4 text-pink-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  vor 5 Tagen
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-green-600 hover:text-green-900">Zu Mitglied</button>
                </td>
              </tr>
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
                Zeige <span className="font-medium">1</span> bis <span className="font-medium">10</span> von <span className="font-medium">32</span> Ergebnissen
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
                  8
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
      
      {/* Modal für Statusänderung-Aktion */}
      {showToMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Lead zu Mitglied konvertieren</h2>
            <p className="mb-4 text-gray-700">
              <span className="font-medium">Julia Fischer</span> wird als Mitglied angelegt.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="contract_type" className="block text-sm font-medium text-gray-700 mb-1">Vertragsart</label>
                <select
                  id="contract_type"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="premium">Premium</option>
                  <option value="basic">Basic</option>
                  <option value="student">Student</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
                <input
                  type="date"
                  id="start_date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="contract_duration" className="block text-sm font-medium text-gray-700 mb-1">Vertragslaufzeit</label>
                <select
                  id="contract_duration"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12 Monate</option>
                  <option value="24">24 Monate</option>
                  <option value="0">Monatlich kündbar</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">Zahlungsmethode</label>
                <select
                  id="payment_method"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="sepa">SEPA-Lastschrift</option>
                  <option value="invoice">Rechnung</option>
                  <option value="credit">Kreditkarte</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Zusätzliche Informationen..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowToMemberModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Mitglied anlegen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal für neuen Lead */}
      {showLeadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Neuen Lead anlegen</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowLeadModal(false)}
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
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Quelle</label>
                <select
                  id="source"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="website">Website</option>
                  <option value="social">Social Media</option>
                  <option value="referral">Empfehlung</option>
                  <option value="campaign">Kampagne</option>
                  <option value="other">Sonstige</option>
                </select>
              </div>
              <div>
                <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1">Kampagne</label>
                <select
                  id="campaign"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="summer">Sommer-Aktion</option>
                  <option value="instagram">Instagram-Werbung</option>
                  <option value="referral">Empfehlungsprogramm</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notizen zum Lead..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowLeadModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Lead speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 