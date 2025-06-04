'use client';

import { useState } from 'react';
import { Edit, Eye, EyeOff, Plus, Search, Shield, Trash, Key } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

// Mock-Daten für Passwörter
const mockPasswords = [
  {
    id: '1',
    name: 'CRM-System',
    username: 'admin@essence-fitness.de',
    password: '********',
    url: 'https://crm.essence-fitness.de',
    category: 'CRM',
    description: 'Zugang zum internen CRM-System',
    twoFactor: true,
    responsiblePerson: 'Max Mustermann',
    expiryDate: '2023-12-31',
    permissions: {
      view: ['admin', 'studioleiter'],
      edit: ['admin'],
      delete: ['admin']
    }
  },
  {
    id: '2',
    name: 'Instagram',
    username: 'essence.fitness',
    password: '********',
    url: 'https://instagram.com',
    category: 'Social Media',
    description: 'Instagram-Account des Studios',
    twoFactor: false,
    responsiblePerson: 'Anna Schmidt',
    expiryDate: null,
    permissions: {
      view: ['admin', 'studioleiter', 'mitarbeiter'],
      edit: ['admin', 'studioleiter'],
      delete: ['admin']
    }
  },
  {
    id: '3',
    name: 'Buchhaltungs-Portal',
    username: 'finance@essence-fitness.de',
    password: '********',
    url: 'https://accounting.example.com',
    category: 'Finanzen',
    description: 'Zugang zum Buchhaltungsportal',
    twoFactor: true,
    responsiblePerson: 'Tim Meyer',
    expiryDate: '2024-06-30',
    permissions: {
      view: ['admin', 'studioleiter'],
      edit: ['admin'],
      delete: ['admin']
    }
  }
];

// Kategorien für Filter
const categories = ['Alle', 'CRM', 'Social Media', 'Finanzen', 'HR', 'Sonstige'];

export default function PasswordsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  
  // Filter Passwörter nach Kategorie und Suchbegriff
  const filteredPasswords = mockPasswords.filter(pwd => {
    const matchesCategory = selectedCategory === 'Alle' || pwd.category === selectedCategory;
    const matchesSearch = 
      pwd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pwd.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pwd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pwd.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Toggle Passwort-Sichtbarkeit
  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Editieren eines Passworts
  const editPassword = (id: string) => {
    setEditingPassword(id);
    setIsModalOpen(true);
  };
  
  return (
    <div>
      <PageHeader 
        title="Passwortverwaltung" 
        breadcrumb={['Home', 'Passwortverwaltung']}
        action={{
          label: "Neuer Eintrag",
          onClick: () => {
            setEditingPassword(null);
            setIsModalOpen(true);
          }
        }}
      />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Filter und Suche */}
        <div className="col-span-12 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-40 rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="relative flex-1 min-w-[250px]">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Suche
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nach Namen, Beschreibung suchen..."
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Passwort-Tabelle */}
        <div className="col-span-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzername
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passwort
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verantwortlich
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPasswords.map((pwd) => (
                  <tr key={pwd.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Key className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pwd.name}</div>
                          {pwd.url && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              <a 
                                href={pwd.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {pwd.url}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pwd.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className="font-mono mr-2">
                          {showPassword[pwd.id] ? 'Sichtbar' : pwd.password}
                        </span>
                        <button 
                          onClick={() => togglePasswordVisibility(pwd.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showPassword[pwd.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        {pwd.twoFactor && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            2FA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {pwd.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pwd.responsiblePerson}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        onClick={() => editPassword(pwd.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredPasswords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Keine Passwörter gefunden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal würde hier implementiert */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingPassword ? 'Passwort bearbeiten' : 'Neues Passwort anlegen'}
                </h3>
                {/* Formularfelder würden hier implementiert */}
                <p className="text-gray-500">Formularinhalt hier...</p>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Speichern
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 