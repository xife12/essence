'use client';

import React from 'react';
import { KeyRound, Plus, Search, ExternalLink, Eye, EyeOff, Copy } from 'lucide-react';

export default function PasswoerterPage() {
  const [passwordVisibility, setPasswordVisibility] = React.useState<{[key: number]: boolean}>({});
  
  const togglePasswordVisibility = (index: number) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Passwörter</h1>
          <p className="text-gray-500 mt-1">Sichere Verwaltung aller Zugänge</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>Neues Passwort</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Passwörter & Zugänge</h2>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Passwort suchen..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Benutzername</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Passwort</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Kategorie</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {['Instagram Account', 'CRM System', 'Hosting Provider'].map((name, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-50 p-1.5 rounded">
                        <KeyRound size={16} className="text-purple-500" />
                      </div>
                      <span>{name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">admin@fitnessstudio.de</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type={passwordVisibility[index] ? 'text' : 'password'}
                        value="P@ssw0rd123"
                        readOnly
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-32"
                      />
                      <button 
                        onClick={() => togglePasswordVisibility(index)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {passwordVisibility[index] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {index === 0 ? 'Social Media' : index === 1 ? 'Internes System' : 'Technik'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <ExternalLink size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">Bearbeiten</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 