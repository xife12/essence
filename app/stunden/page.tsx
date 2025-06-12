'use client';

import React from 'react';

export default function Stunden() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stundenerfassung</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neue Erfassung
        </button>
      </div>
      
      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Erfasste Stunden (gesamt)</p>
          <p className="text-2xl font-bold">1.284,5</p>
          <div className="flex items-center mt-2">
            <span className="text-green-600 text-sm font-medium">+125 (10.8%)</span>
            <span className="text-gray-500 text-sm ml-2">vs. letzten Monat</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Erfasste Stunden (diese Woche)</p>
          <p className="text-2xl font-bold">86,5</p>
          <div className="flex items-center mt-2">
            <span className="text-gray-500 text-sm">Auslastung: <span className="font-medium">72%</span></span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Soll-Stunden (diese Woche)</p>
          <p className="text-2xl font-bold">120,0</p>
          <div className="flex items-center mt-2">
            <span className="text-orange-600 text-sm font-medium">-33.5 Stunden</span>
            <span className="text-gray-500 text-sm ml-2">Differenz</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Mitarbeiter mit erfassten Stunden</p>
          <p className="text-2xl font-bold">8</p>
          <div className="flex items-center mt-2">
            <span className="text-gray-500 text-sm">von <span className="font-medium">8</span> aktiven Mitarbeitern</span>
          </div>
        </div>
      </div>
      
      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">Zeitraum</label>
            <select
              id="timeframe"
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Diese Woche</option>
              <option value="lastweek">Letzte Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="lastmonth">Letzter Monat</option>
              <option value="custom">Benutzerdefiniert</option>
            </select>
          </div>
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
            <select
              id="employee"
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Mitarbeiter</option>
              <option value="1">Markus Schmidt</option>
              <option value="2">Lisa Krause</option>
              <option value="3">Thomas Müller</option>
              <option value="4">Sarah Becker</option>
            </select>
          </div>
          <div className="ml-auto self-end">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md">
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>
      
      {/* Ist-/Soll-Vergleich */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Ist-/Soll-Vergleich (Diese Woche)</h2>
        
        <div className="space-y-6">
          {/* Gesamtübersicht */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Gesamtübersicht</span>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Erfüllung: 72%</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Untererfüllung</span>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: '72%' }}></div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-500">
              <span>Ist: 86,5 Stunden</span>
              <span>Soll: 120,0 Stunden</span>
            </div>
          </div>
          
          {/* Mitarbeiter-Vergleiche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mitarbeiter 1 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Markus Schmidt</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Erfüllung: 95%</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">OK</span>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '95%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Ist: 38,0 Stunden</span>
                <span>Soll: 40,0 Stunden</span>
              </div>
            </div>
            
            {/* Mitarbeiter 2 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Lisa Krause</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Erfüllung: 103%</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">OK</span>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Ist: 21,7 Stunden</span>
                <span>Soll: 21,0 Stunden</span>
              </div>
            </div>
            
            {/* Mitarbeiter 3 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Thomas Müller</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Erfüllung: 45%</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Kritisch</span>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Ist: 13,5 Stunden</span>
                <span>Soll: 30,0 Stunden</span>
              </div>
            </div>
            
            {/* Mitarbeiter 4 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Sarah Becker</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Erfüllung: 76%</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Untererfüllung</span>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '76%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Ist: 13,3 Stunden</span>
                <span>Soll: 17,5 Stunden</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stundentabelle */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mitarbeiter
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Von - Bis
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stunden
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
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
              {/* Eintrag 1 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Markus Schmidt</div>
                  <div className="text-sm text-gray-500">Administrator</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  04.06.2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  08:00 - 16:30
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8,5
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Regelmäßig
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    OK
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Bearbeiten</button>
                  <button className="text-red-600 hover:text-red-900">Löschen</button>
                </td>
              </tr>
              
              {/* Eintrag 2 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Lisa Krause</div>
                  <div className="text-sm text-gray-500">Trainer</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  04.06.2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  12:00 - 20:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8,0
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Regelmäßig
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    OK
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Bearbeiten</button>
                  <button className="text-red-600 hover:text-red-900">Löschen</button>
                </td>
              </tr>
              
              {/* Eintrag 3 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Thomas Müller</div>
                  <div className="text-sm text-gray-500">Empfang</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  04.06.2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  10:00 - 13:30
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3,5
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Überstunden
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Untererfüllung
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Bearbeiten</button>
                  <button className="text-red-600 hover:text-red-900">Löschen</button>
                </td>
              </tr>
              
              {/* Eintrag 4 */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Sarah Becker</div>
                  <div className="text-sm text-gray-500">Trainer</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  03.06.2024
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  14:00 - 21:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  7,0
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Regelmäßig
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                    Prüfen
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Bearbeiten</button>
                  <button className="text-red-600 hover:text-red-900">Löschen</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Paginierung */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Zeige <span className="font-medium">1</span> bis <span className="font-medium">4</span> von <span className="font-medium">24</span> Einträgen
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
      
      {/* Zeiterfassungsformular */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-lg font-semibold mb-4">Neue Zeiterfassung</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
            <select
              id="employee_id"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte auswählen</option>
              <option value="1">Markus Schmidt</option>
              <option value="2">Lisa Krause</option>
              <option value="3">Thomas Müller</option>
              <option value="4">Sarah Becker</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input
              type="date"
              id="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">Von</label>
            <input
              type="time"
              id="start_time"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
            <input
              type="time"
              id="end_time"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
            <select
              id="type"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="regular">Regelmäßig</option>
              <option value="overtime">Überstunden</option>
              <option value="special">Sondereinsatz</option>
              <option value="training">Schulung</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="break" className="block text-sm font-medium text-gray-700 mb-1">Pause (Min.)</label>
            <input
              type="number"
              id="break"
              min="0"
              step="5"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
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
          
          <div className="md:col-span-2 flex justify-end">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2">
              Abbrechen
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 