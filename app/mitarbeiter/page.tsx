'use client';

import React, { useState } from 'react';

export default function Mitarbeiter() {
  // Status für Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mitarbeiter</h1>
        <div className="flex space-x-2">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setShowInviteModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Mitarbeiter einladen
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setShowNewEmployeeModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Neuer Mitarbeiter
          </button>
        </div>
      </div>
      
      {/* Statistik-Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Aktive Mitarbeiter</p>
          <p className="text-2xl font-bold">8</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+1</span>
            <span className="text-gray-500 text-sm ml-2">diesen Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Ausstehende Einladungen</p>
          <p className="text-2xl font-bold">2</p>
          <div className="flex items-center mt-2">
            <button className="text-blue-600 text-sm font-medium">Einladungen anzeigen</button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Durchschnittliche Stunden</p>
          <p className="text-2xl font-bold">32.5h</p>
          <div className="flex items-center mt-2">
            <span className="text-gray-500 text-sm">pro Woche</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Berechtigungen</p>
          <p className="text-2xl font-bold">3</p>
          <div className="flex items-center mt-2">
            <span className="text-gray-500 text-sm">Berechtigungsgruppen</span>
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
              <option value="inactive">Inaktiv</option>
              <option value="invited">Eingeladen</option>
            </select>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
            <select
              id="role"
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle</option>
              <option value="trainer">Trainer</option>
              <option value="reception">Empfang</option>
              <option value="management">Management</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
            <input
              type="text"
              id="search"
              placeholder="Name, E-Mail..."
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
      
      {/* Mitarbeiter-Tabelle */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
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
                  Rolle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letzter Login
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Mitarbeiter 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        MS
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Markus Schmidt</div>
                      <div className="text-sm text-gray-500">Seit 15.01.2022</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">markus.schmidt@membercore.de</div>
                  <div className="text-sm text-gray-500">+49 173 1234567</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Administrator
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Aktiv
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm">Heute, 10:45 Uhr</div>
                  <div className="text-xs text-green-600">Online</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-gray-600 hover:text-gray-900">Bearbeiten</button>
                </td>
              </tr>
              
              {/* Mitarbeiter 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        LK
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Lisa Krause</div>
                      <div className="text-sm text-gray-500">Seit 05.03.2022</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">lisa.krause@membercore.de</div>
                  <div className="text-sm text-gray-500">+49 162 9876543</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    Trainer
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Aktiv
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm">Heute, 08:17 Uhr</div>
                  <div className="text-xs text-gray-500">vor 3 Stunden</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-gray-600 hover:text-gray-900">Bearbeiten</button>
                </td>
              </tr>
              
              {/* Mitarbeiter 3 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        TM
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Thomas Müller</div>
                      <div className="text-sm text-gray-500">Seit 10.08.2023</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">thomas.mueller@membercore.de</div>
                  <div className="text-sm text-gray-500">+49 171 5432198</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Empfang
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Aktiv
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm">Gestern, 17:32 Uhr</div>
                  <div className="text-xs text-gray-500">vor 17 Stunden</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Details</button>
                  <button className="text-gray-600 hover:text-gray-900">Bearbeiten</button>
                </td>
              </tr>
              
              {/* Mitarbeiter 4 - Eingeladen */}
              <tr className="hover:bg-gray-50 bg-yellow-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-500 font-medium">
                        SB
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Sarah Becker</div>
                      <div className="text-sm text-gray-500">Eingeladen am 02.06.2024</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">sarah.becker@example.com</div>
                  <div className="text-sm text-gray-500">+49 177 8765432</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    Trainer
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Eingeladen
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="text-sm">-</div>
                  <div className="text-xs text-orange-600">Einladung ausstehend</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Einladung erneut senden</button>
                  <button className="text-red-600 hover:text-red-900">Abbrechen</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Berechtigungsgruppen */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Berechtigungsgruppen</h2>
        <div className="space-y-4">
          {/* Gruppe 1 */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Administrator</h3>
                <p className="text-sm text-gray-500 mt-1">Vollzugriff auf alle Funktionen</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Mitglieder verwalten</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Mitarbeiter verwalten</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Finanzen einsehen</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Kampagnen verwalten</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Systemeinstellungen</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Berechtigungen verwalten</div>
            </div>
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">1</span> Mitarbeiter mit dieser Rolle
            </div>
          </div>
          
          {/* Gruppe 2 */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Trainer</h3>
                <p className="text-sm text-gray-500 mt-1">Zugriff auf Mitglieder und Terminplanung</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Mitglieder ansehen</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Termine verwalten</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Trainingsplan erstellen</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Check-In verwalten</div>
            </div>
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">2</span> Mitarbeiter mit dieser Rolle
            </div>
          </div>
          
          {/* Gruppe 3 */}
          <div className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">Empfang</h3>
                <p className="text-sm text-gray-500 mt-1">Zugriff auf Mitglieder und Check-In</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Mitglieder ansehen</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Check-In verwalten</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Termine einsehen</div>
              <div className="text-xs bg-gray-100 rounded-md py-1 px-2">Leads erfassen</div>
            </div>
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">1</span> Mitarbeiter mit dieser Rolle
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal: Mitarbeiter einladen */}
      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Mitarbeiter einladen</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowInviteModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="invite_email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail-Adresse</label>
                <input
                  type="email"
                  id="invite_email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@beispiel.de"
                />
              </div>
              
              <div>
                <label htmlFor="invite_role" className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                <select
                  id="invite_role"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="trainer">Trainer</option>
                  <option value="reception">Empfang</option>
                  <option value="management">Management</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="invite_message" className="block text-sm font-medium text-gray-700 mb-1">Persönliche Nachricht (optional)</label>
                <textarea
                  id="invite_message"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hallo, ich lade dich ein, unserem Team beizutreten..."
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowInviteModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Einladung senden
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Neuer Mitarbeiter */}
      {showNewEmployeeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl my-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Neuen Mitarbeiter anlegen</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewEmployeeModal(false)}
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
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                <select
                  id="role"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="trainer">Trainer</option>
                  <option value="reception">Empfang</option>
                  <option value="management">Management</option>
                  <option value="admin">Administrator</option>
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
              <div className="md:col-span-2">
                <label htmlFor="permissions" className="block text-sm font-medium text-gray-700 mb-2">Berechtigungen</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      id="perm_leads"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm_leads" className="ml-2 text-sm text-gray-700">Leads verwalten</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm_members"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm_members" className="ml-2 text-sm text-gray-700">Mitglieder verwalten</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm_consultations"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      defaultChecked
                    />
                    <label htmlFor="perm_consultations" className="ml-2 text-sm text-gray-700">Beratungen</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm_campaigns"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm_campaigns" className="ml-2 text-sm text-gray-700">Kampagnen</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm_passwords"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm_passwords" className="ml-2 text-sm text-gray-700">Passwörter</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="perm_staff"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="perm_staff" className="ml-2 text-sm text-gray-700">Mitarbeiter verwalten</label>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
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
                onClick={() => setShowNewEmployeeModal(false)}
              >
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Mitarbeiter anlegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 