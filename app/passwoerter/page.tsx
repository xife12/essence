'use client';

import React from 'react';

export default function Passwoerter() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Passwörter</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neues Passwort
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Gespeicherte Passwörter</h2>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Alle Kategorien</option>
              <option>CRM</option>
              <option>Social Media</option>
              <option>HR</option>
              <option>Finanzen</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Suchen..."
                className="border border-gray-300 rounded-md px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verantwortlicher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ablaufdatum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Passwort 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Fitnessstudio-Website</div>
                  <div className="text-xs text-gray-500">fitness-studio.de</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    CRM
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">Studioleiter</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-green-600">03.12.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
                    Anzeigen
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
                    Kopieren
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              
              {/* Passwort 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Mitgliederverwaltung</div>
                  <div className="text-xs text-gray-500">membercore.app</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    HR
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">Admin</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-yellow-600">15.07.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
                    Anzeigen
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
                    Kopieren
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
              
              {/* Passwort 3 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Abrechnungssystem</div>
                  <div className="text-xs text-gray-500">billing.example.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    Finanzen
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900">Studioleiter</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-red-600">28.06.2024</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
                    Anzeigen
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2">
                    Kopieren
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Formular für neues Passwort */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Neues Passwort hinzufügen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              placeholder="Name für das Passwort"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kategorie auswählen</option>
              <option value="crm">CRM</option>
              <option value="social">Social Media</option>
              <option value="hr">HR</option>
              <option value="finance">Finanzen</option>
              <option value="other">Sonstige</option>
            </select>
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
            <input
              type="text"
              id="username"
              placeholder="Benutzername oder E-Mail"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                placeholder="Passwort eingeben"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Wird verschlüsselt gespeichert (AES-256)</p>
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website/Anwendung</label>
            <input
              type="text"
              id="website"
              placeholder="z.B. example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Ablaufdatum</label>
            <input
              type="date"
              id="expiry"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1">Verantwortliche Person/Rolle</label>
            <select
              id="responsible"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Verantwortlichen auswählen</option>
              <option value="admin">Admin</option>
              <option value="studioleiter">Studioleiter</option>
              <option value="mitarbeiter">Mitarbeiter</option>
            </select>
          </div>
          <div>
            <label htmlFor="twofa" className="block text-sm font-medium text-gray-700 mb-1">2FA Information</label>
            <input
              type="text"
              id="twofa"
              placeholder="2FA-Details, Wiederherstellungscodes etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notizen (optional)</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Zusätzliche Informationen..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          {/* Berechtigungsmatrix */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-md font-semibold mb-3">Sichtbarkeitsmatrix</h3>
            <p className="text-xs text-gray-500 mb-2">Wer darf dieses Passwort sehen, bearbeiten oder löschen?</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolle/Person</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sehen</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bearbeiten</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Löschen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap">Admin</td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" checked disabled className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" checked disabled className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" checked disabled className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap">Studioleiter</td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap">Mitarbeiter</td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" disabled className="h-4 w-4 text-gray-400 rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input type="checkbox" disabled className="h-4 w-4 text-gray-400 rounded border-gray-300" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Sicherheitshinweis</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Alle Passwörter werden verschlüsselt gespeichert und sind nur für berechtigte Personen sichtbar. 
                      Die Sichtbarkeit wird über die Berechtigungsmatrix geregelt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Passwort sicher speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 