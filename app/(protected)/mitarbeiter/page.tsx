'use client';

import React from 'react';
import { UserCog, UserPlus, Search, Mail, Phone, MoreHorizontal } from 'lucide-react';

export default function MitarbeiterPage() {
  return (
    <div>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
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
              {[
                { name: 'Max Mustermann', role: 'Admin' },
                { name: 'Julia Müller', role: 'Studioleiter' },
                { name: 'Thomas Schmidt', role: 'Mitarbeiter' },
                { name: 'Anna Weber', role: 'Mitarbeiter' },
              ].map((staff, index) => (
                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-gray-700">{staff.name.charAt(0)}</span>
                      </div>
                      <span>{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" />
                        <span>{staff.name.toLowerCase().replace(' ', '.')}@fitnessstudio.de</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={14} className="text-gray-400" />
                        <span>+49 123 456789</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      staff.role === 'Admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : staff.role === 'Studioleiter'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {staff.role}
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
    </div>
  );
} 