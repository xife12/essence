'use client';

import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* 1. Zielerreichung */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">🎯 Zielerreichung</h2>
        <div className="mb-2 flex justify-between">
          <span className="text-gray-600">Aktuelle Mitglieder: 124 - Kündigungen: 8</span>
          <span className="font-medium">128 von 150 (85%)</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Berechnung: (aktive Mitglieder - Kündigungen) * 1,1
        </div>
      </div>
      
      {/* 2. Leads Monatsziel */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">📈 Leads Monatsziel</h2>
        <div className="mb-2 flex justify-between">
          <span className="text-gray-600">Juni 2024</span>
          <span className="font-medium">32 von 50 (64%)</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '64%' }}></div>
        </div>
      </div>
      
      {/* 3. Kampagnenübersicht */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">📊 Kampagnenübersicht</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kampagne</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads generiert</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verträge abgeschl.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktion</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">Sommer-Aktion 2024</td>
                <td className="px-6 py-4 whitespace-nowrap">32</td>
                <td className="px-6 py-4 whitespace-nowrap">8</td>
                <td className="px-6 py-4 whitespace-nowrap">25%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href="/kampagnen" className="text-blue-600 hover:text-blue-900">Zur Kampagne</a>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">Instagram-Werbung</td>
                <td className="px-6 py-4 whitespace-nowrap">18</td>
                <td className="px-6 py-4 whitespace-nowrap">5</td>
                <td className="px-6 py-4 whitespace-nowrap">28%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href="/kampagnen" className="text-blue-600 hover:text-blue-900">Zur Kampagne</a>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">Empfehlungsprogramm</td>
                <td className="px-6 py-4 whitespace-nowrap">12</td>
                <td className="px-6 py-4 whitespace-nowrap">6</td>
                <td className="px-6 py-4 whitespace-nowrap">50%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a href="/kampagnen" className="text-blue-600 hover:text-blue-900">Zur Kampagne</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 4. Monatsvergleich */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">📅 Monatsvergleich: Neuzugänge vs. Kündigungen</h2>
        <div className="h-64 bg-gray-100 flex items-center justify-center rounded">
          <div className="w-full px-8">
            <div className="flex justify-between mb-2">
              <div className="text-sm text-gray-600">Jan</div>
              <div className="text-sm text-gray-600">Feb</div>
              <div className="text-sm text-gray-600">Mär</div>
              <div className="text-sm text-gray-600">Apr</div>
              <div className="text-sm text-gray-600">Mai</div>
              <div className="text-sm text-gray-600">Jun</div>
            </div>
            
            {/* Vereinfachtes Diagramm */}
            <div className="grid grid-cols-6 gap-4">
              {/* Januar */}
              <div className="flex flex-col items-center space-y-1">
                <div className="bg-blue-500 w-full" style={{ height: '40px' }}></div>
                <div className="bg-red-500 w-full" style={{ height: '20px' }}></div>
              </div>
              
              {/* Februar */}
              <div className="flex flex-col items-center space-y-1">
                <div className="bg-blue-500 w-full" style={{ height: '50px' }}></div>
                <div className="bg-red-500 w-full" style={{ height: '25px' }}></div>
              </div>
              
              {/* März */}
              <div className="flex flex-col items-center space-y-1">
                <div className="bg-blue-500 w-full" style={{ height: '60px' }}></div>
                <div className="bg-red-500 w-full" style={{ height: '20px' }}></div>
              </div>
              
              {/* April */}
              <div className="flex flex-col items-center space-y-1">
                <div className="bg-blue-500 w-full" style={{ height: '45px' }}></div>
                <div className="bg-red-500 w-full" style={{ height: '30px' }}></div>
              </div>
              
              {/* Mai */}
              <div className="flex flex-col items-center space-y-1">
                <div className="bg-blue-500 w-full" style={{ height: '70px' }}></div>
                <div className="bg-red-500 w-full" style={{ height: '15px' }}></div>
              </div>
              
              {/* Juni */}
              <div className="flex flex-col items-center space-y-1">
                <div className="bg-blue-500 w-full" style={{ height: '55px' }}></div>
                <div className="bg-red-500 w-full" style={{ height: '25px' }}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-4 space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm">Neuzugänge</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Kündigungen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 5. Vertragsverteilung */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">📐 Vertragsverteilung</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium mb-3">Anzahl Verträge je Vertragsart</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Premium</span>
                  <span>48 (40%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Basic</span>
                  <span>52 (43%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '43%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Student</span>
                  <span>20 (17%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '17%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-3">Durchschnittliche Restlaufzeit</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Premium</span>
                  <span>8,2 Monate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Basic</span>
                  <span>5,4 Monate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Student</span>
                  <span>3,8 Monate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 6. Kündigungswarnung */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">⚠️ Kündigungswarnung</h2>
        <p className="text-sm text-gray-500 mb-4">Mitglieder mit Vertragslaufzeit kürzer als 90 Tage</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mitglied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vertragsende</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontakt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontaktiert</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">Michael Schmidt</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-red-600 font-medium">15.06.2024 (10 Tage)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>0172 1234567</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">Lisa Müller</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-yellow-600 font-medium">28.07.2024 (53 Tage)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>lisa.mueller@email.de</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked />
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">Thomas Weber</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-yellow-600 font-medium">15.08.2024 (71 Tage)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>0151 9876543</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked />
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">Anna König</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-600 font-medium">28.08.2024 (84 Tage)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>anna.koenig@email.de</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 