'use client';

import React from 'react';

export default function Beratung() {
  // Platzhalter für Kalenderdaten (in einer realen Anwendung würden diese aus der API kommen)
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('de-DE', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  // Platzhalter für Termine
  const appointments = [
    { id: 1, name: 'Michael Schneider', type: 'Erstberatung', time: '10:00', duration: '30 Min', trainer: 'Alex' },
    { id: 2, name: 'Jana Becker', type: 'Probetraining', time: '13:30', duration: '60 Min', trainer: 'Lisa' },
    { id: 3, name: 'Lukas Hoffmann', type: 'Vertragsgespräch', time: '16:15', duration: '30 Min', trainer: 'Markus' },
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Beratung & Termine</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Neuer Termin
        </button>
      </div>
      
      {/* Kopfzeile mit Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Offene Termine (diese Woche)</p>
            <p className="text-2xl font-bold">7</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Erledigte Termine (diese Woche)</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
      </div>
      
      {/* Auswertung - Abschlüsse pro Vertragsart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Abschlüsse pro Vertragsart</h2>
          <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Diese Woche</option>
            <option>Letzter Monat</option>
            <option>Letztes Quartal</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Premium</span>
              <span className="text-green-600 font-bold">+8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>65% aller Abschlüsse</span>
              <span>8 von 12</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Basic</span>
              <span className="text-green-600 font-bold">+3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>25% aller Abschlüsse</span>
              <span>3 von 12</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Student</span>
              <span className="text-green-600 font-bold">+1</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>10% aller Abschlüsse</span>
              <span>1 von 12</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kalender-Sektion */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{currentMonth} {currentYear}</h2>
              <div className="flex space-x-2">
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => (
                <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {/* Platzhalter für leere Tage am Anfang des Monats */}
              <div className="p-2 text-center text-gray-300"></div>
              <div className="p-2 text-center text-gray-300"></div>
              
              {/* Tage des Monats */}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <div 
                  key={day} 
                  className={`p-2 text-center hover:bg-gray-100 cursor-pointer rounded-md ${day === currentDate.getDate() ? 'bg-blue-100 text-blue-800 font-bold' : ''}`}
                >
                  {day}
                  {/* Indikator für Termine */}
                  {[4, 12, 16, 23].includes(day) && (
                    <div className="w-1.5 h-1.5 mx-auto mt-1 rounded-full bg-blue-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tagesübersicht */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Heute - {currentDate.toLocaleDateString('de-DE')}</h2>
            <div className="space-y-4">
              {/* Stundenraster */}
              {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
                <div key={hour} className="flex">
                  <div className="w-16 text-right pr-4 text-gray-500 font-medium">
                    {hour}:00
                  </div>
                  <div className="flex-1 min-h-[60px] border-l border-gray-200 pl-4 relative">
                    {/* Termin bei 10:00 */}
                    {hour === 10 && (
                      <div className="absolute left-4 right-2 top-0 h-[60px] bg-blue-50 rounded-md p-2 border-l-4 border-blue-500">
                        <div className="font-medium">Michael Schneider</div>
                        <div className="text-sm text-gray-500">Erstberatung (30 Min)</div>
                      </div>
                    )}
                    
                    {/* Termin bei 13:30 (zeige über 13:00) */}
                    {hour === 13 && (
                      <div className="absolute left-4 right-2 top-[30px] h-[90px] bg-green-50 rounded-md p-2 border-l-4 border-green-500">
                        <div className="font-medium">Jana Becker</div>
                        <div className="text-sm text-gray-500">Probetraining (60 Min)</div>
                      </div>
                    )}
                    
                    {/* Termin bei 16:15 */}
                    {hour === 16 && (
                      <div className="absolute left-4 right-2 top-[15px] h-[60px] bg-purple-50 rounded-md p-2 border-l-4 border-purple-500">
                        <div className="font-medium">Lukas Hoffmann</div>
                        <div className="text-sm text-gray-500">Vertragsgespräch (30 Min)</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Rechte Seitenleiste */}
        <div>
          {/* Anstehende Termine */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Anstehende Termine</h2>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{appointment.name}</p>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                      <p className="text-sm text-gray-500">{appointment.time} ({appointment.duration}) • Trainer: {appointment.trainer}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="text-gray-600 hover:text-gray-800" 
                        title="Termin verschieben"
                        onClick={() => {}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Formular für neuen Termin */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Termin hinzufügen</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">Kunde</label>
                <input
                  type="text"
                  id="client"
                  placeholder="Name des Kunden"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Terminart</label>
                <select
                  id="type"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="first">Erstberatung</option>
                  <option value="trial">Probetraining</option>
                  <option value="contract">Vertragsgespräch</option>
                  <option value="followup">Follow-Up</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                  <input
                    type="date"
                    id="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
                  <input
                    type="time"
                    id="time"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Dauer</label>
                <select
                  id="duration"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30">30 Minuten</option>
                  <option value="45">45 Minuten</option>
                  <option value="60">60 Minuten</option>
                  <option value="90">90 Minuten</option>
                </select>
              </div>
              <div>
                <label htmlFor="trainer" className="block text-sm font-medium text-gray-700 mb-1">Trainer / Mitarbeiter</label>
                <select
                  id="trainer"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="alex">Alex</option>
                  <option value="lisa">Lisa</option>
                  <option value="markus">Markus</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Zusätzliche Informationen..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2">
                  Abbrechen
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Termin speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal für Terminverschiebung (ausgeblendet, würde in echter Anwendung über state gesteuert) */}
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 hidden">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Termin verschieben</h2>
          <p className="mb-4 text-gray-700">
            Termin für <span className="font-medium">Michael Schneider</span> am 04.06.2024 um 10:00 Uhr verschieben
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reschedule_date" className="block text-sm font-medium text-gray-700 mb-1">Neues Datum</label>
                <input
                  type="date"
                  id="reschedule_date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="reschedule_time" className="block text-sm font-medium text-gray-700 mb-1">Neue Uhrzeit</label>
                <input
                  type="time"
                  id="reschedule_time"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="reschedule_reason" className="block text-sm font-medium text-gray-700 mb-1">Grund der Verschiebung</label>
              <select
                id="reschedule_reason"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bitte auswählen</option>
                <option value="customer">Kundenwunsch</option>
                <option value="trainer">Trainer nicht verfügbar</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="reschedule_notes" className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
              <textarea
                id="reschedule_notes"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Zusätzliche Informationen zur Verschiebung..."
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Abbrechen
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Termin verschieben
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 