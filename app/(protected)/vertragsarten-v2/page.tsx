'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Settings, Search, Filter, BarChart3, FileText, Package, Calendar } from 'lucide-react';
import { ContractsV2API } from '@/app/lib/api/contracts-v2';
import type { ContractWithDetails, ContractModule, ContractDocument } from '@/app/lib/types/contracts-v2';

export default function VertragsartenV2Page() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'modules' | 'documents'>('contracts');
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [modules, setModules] = useState<ContractModule[]>([]);
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contractsData, modulesData, documentsData] = await Promise.all([
        ContractsV2API.getAll(),
        ContractsV2API.getModules(),
        ContractsV2API.getDocuments()
      ]);
      
      setContracts(contractsData);
      setModules(modulesData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && contract.is_active) ||
      (filterStatus === 'inactive' && !contract.is_active);
    return matchesSearch && matchesFilter;
  });

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.is_active).length,
    totalModules: modules.length,
    totalDocuments: documents.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vertragsarten V2</h1>
          <p className="text-gray-600 mt-1">
            Moderne Vertragsverwaltung mit Versionierung, Modulen und Dokumenten
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            href="/vertragsarten"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Alte Version
          </Link>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Einstellungen
          </button>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Verträge gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktive Verträge</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Module</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Dokumente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'contracts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Verträge ({contracts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Module ({modules.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dokumente ({documents.length})
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Suche und Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {activeTab === 'contracts' && (
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Nur Aktive</option>
                  <option value="inactive">Nur Inaktive</option>
                </select>
              </div>
            )}
            
            <Link
              href={`/vertragsarten-v2/${activeTab}/neu`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'contracts' && 'Neuer Vertrag'}
              {activeTab === 'modules' && 'Neues Modul'}
              {activeTab === 'documents' && 'Neues Dokument'}
            </Link>
          </div>

          {/* Content basierend auf aktivem Tab */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'contracts' && (
                <ContractsTable contracts={filteredContracts} onRefresh={loadData} />
              )}
              {activeTab === 'modules' && (
                <ModulesTable modules={filteredModules} onRefresh={loadData} />
              )}
              {activeTab === 'documents' && (
                <DocumentsTable documents={filteredDocuments} onRefresh={loadData} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Verträge Tabelle
function ContractsTable({ contracts, onRefresh }: { contracts: ContractWithDetails[], onRefresh: () => void }) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Verträge gefunden</h3>
        <p className="text-gray-600 mb-4">Erstelle deinen ersten Vertrag um zu beginnen.</p>
        <Link
          href="/vertragsarten-v2/contracts/neu"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ersten Vertrag erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Version</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Laufzeiten</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Module</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Erstellt</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-semibold text-gray-900">{contract.name}</div>
                  {contract.description && (
                    <div className="text-sm text-gray-600">{contract.description}</div>
                  )}
                  {contract.is_campaign_version && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 mt-1">
                      Kampagne
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  v{contract.version_number}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm">
                  {contract.terms?.length || 0} Laufzeit{(contract.terms?.length || 0) !== 1 ? 'en' : ''}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm">
                  <span className="text-green-600">{contract.modules_included_count || 0} inkl.</span>
                  {(contract.modules_optional_count || 0) > 0 && (
                    <span className="text-blue-600 ml-2">{contract.modules_optional_count} opt.</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    contract.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {contract.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Date(contract.created_at).toLocaleDateString('de-DE')}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/vertragsarten-v2/contracts/${contract.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Bearbeiten
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Module Tabelle
function ModulesTable({ modules, onRefresh }: { modules: ContractModule[], onRefresh: () => void }) {
  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Module gefunden</h3>
        <p className="text-gray-600 mb-4">Erstelle dein erstes Modul um zu beginnen.</p>
        <Link
          href="/vertragsarten-v2/modules/neu"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Erstes Modul erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modules.map((module) => (
        <div key={module.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {module.icon_name && (
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                {module.description && (
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                )}
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                module.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {module.is_active ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Preis/Monat:</span>
              <span className="font-semibold">€{module.price_per_month.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href={`/vertragsarten-v2/modules/${module.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Bearbeiten
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Dokumente Tabelle
function DocumentsTable({ documents, onRefresh }: { documents: ContractDocument[], onRefresh: () => void }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Dokumente gefunden</h3>
        <p className="text-gray-600 mb-4">Erstelle dein erstes Dokument um zu beginnen.</p>
        <Link
          href="/vertragsarten-v2/documents/neu"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Erstes Dokument erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Version</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900">Erstellt</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-900">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div>
                  <div className="font-semibold text-gray-900">{document.name}</div>
                  {document.description && (
                    <div className="text-sm text-gray-600">{document.description}</div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  v{document.version_number}
                </span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    document.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {document.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {new Date(document.created_at).toLocaleDateString('de-DE')}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/vertragsarten-v2/documents/${document.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Bearbeiten
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}