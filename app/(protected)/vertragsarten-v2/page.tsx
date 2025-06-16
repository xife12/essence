'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Edit,
  Eye,
  Trash2,
  Copy,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import ContractsV2API from '../../lib/api/contracts-v2';
import type { 
  ContractWithDetails,
  ModuleWithStats,
  ContractDocument,
  ContractFilters,
  ModuleFilters,
  DocumentFilters 
} from '../../lib/types/contracts-v2';

// Tab-Definitionen
const TABS = [
  { id: 'contracts', label: 'Verträge', icon: Package },
  { id: 'modules', label: 'Module', icon: Zap },
  { id: 'documents', label: 'Dokumente', icon: FileText }
] as const;

type TabId = typeof TABS[number]['id'];

export default function VertragsartenV2Page() {
  const [activeTab, setActiveTab] = useState<TabId>('contracts');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dashboard-Statistiken
  const [dashboardStats, setDashboardStats] = useState({
    total_contracts: 0,
    active_contracts: 0,
    campaign_contracts: 0,
    total_modules: 0,
    active_modules: 0,
    total_documents: 0,
    avg_contract_price: 0
  });

  // Tab-spezifische Daten
  const [contracts, setContracts] = useState<ContractWithDetails[]>([]);
  const [modules, setModules] = useState<ModuleWithStats[]>([]);
  const [documents, setDocuments] = useState<ContractDocument[]>([]);

  // Filter-States
  const [contractFilters, setContractFilters] = useState<ContractFilters>({});
  const [moduleFilters, setModuleFilters] = useState<ModuleFilters>({});
  const [documentFilters, setDocumentFilters] = useState<DocumentFilters>({});

  // Laden der Daten
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeTab, searchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Dashboard-Statistiken laden
      const statsResponse = await ContractsV2API.getDashboardStats();
      if (statsResponse.data) {
        setDashboardStats(statsResponse.data);
      }

      // Erste Tab-Daten laden
      await loadTabData();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      const filters = { search: searchTerm };

      switch (activeTab) {
        case 'contracts':
          const contractsResponse = await ContractsV2API.getContracts({ ...contractFilters, ...filters });
          setContracts(contractsResponse.data);
          break;
        case 'modules':
          const modulesResponse = await ContractsV2API.getModules({ ...moduleFilters, ...filters });
          setModules(modulesResponse.data);
          break;
        case 'documents':
          const documentsResponse = await ContractsV2API.getDocuments({ ...documentFilters, ...filters });
          setDocuments(documentsResponse.data);
          break;
      }
    } catch (error) {
      console.error(`Error loading ${activeTab} data:`, error);
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (!confirm('Vertrag wirklich deaktivieren?')) return;
    
    try {
      await ContractsV2API.deleteContract(id);
      loadTabData();
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Modul wirklich löschen?')) return;
    
    try {
      await ContractsV2API.deleteModule(id);
      loadTabData();
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vertragsarten V2</h1>
            <p className="text-gray-600 mt-1">Moderne Vertragsverwaltung mit modularem Aufbau</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/vertragsarten-v2/contracts/neu"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Neuer Vertrag
            </Link>
            <Link
              href="/vertragsarten-v2/modules/neu"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Neues Modul
            </Link>
            <Link
              href="/vertragsarten-v2/documents/neu"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Neues Dokument
            </Link>
          </div>
        </div>

        {/* Dashboard-Statistiken */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              <span className="text-sm text-gray-600">Verträge</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {dashboardStats.total_contracts}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm text-gray-600">Aktiv</span>
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">
              {dashboardStats.active_contracts}
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="text-orange-600" size={20} />
              <span className="text-sm text-gray-600">Kampagnen</span>
            </div>
            <div className="text-2xl font-bold text-orange-700 mt-1">
              {dashboardStats.campaign_contracts}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="text-purple-600" size={20} />
              <span className="text-sm text-gray-600">Module</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-1">
              {dashboardStats.total_modules}
            </div>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="text-teal-600" size={20} />
              <span className="text-sm text-gray-600">Dokumente</span>
            </div>
            <div className="text-2xl font-bold text-teal-700 mt-1">
              {dashboardStats.total_documents}
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="text-indigo-600" size={20} />
              <span className="text-sm text-gray-600">Ø Preis</span>
            </div>
            <div className="text-2xl font-bold text-indigo-700 mt-1">
              {formatPrice(dashboardStats.avg_contract_price)}
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20} />
              <span className="text-sm text-gray-600">Growth</span>
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">
              +12%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={20} />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`${TABS.find(t => t.id === activeTab)?.label} durchsuchen...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={20} />
              Filter
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'contracts' && (
            <ContractsTab 
              contracts={contracts}
              onDelete={handleDeleteContract}
              onEdit={(id) => window.location.href = `/vertragsarten-v2/contracts/${id}/edit`}
              onView={(id) => window.location.href = `/vertragsarten-v2/contracts/${id}`}
              onDuplicate={(id) => console.log('Duplicate contract:', id)}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'modules' && (
            <ModulesTab 
              modules={modules}
              onDelete={handleDeleteModule}
              onEdit={(id) => window.location.href = `/vertragsarten-v2/modules/${id}/edit`}
              onView={(id) => window.location.href = `/vertragsarten-v2/modules/${id}`}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab 
              documents={documents}
              onDelete={(id) => console.log('Delete document:', id)}
              onEdit={(id) => window.location.href = `/vertragsarten-v2/documents/${id}/edit`}
              onView={(id) => window.location.href = `/vertragsarten-v2/documents/${id}`}
              formatDate={formatDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

interface ContractsTabProps {
  contracts: ContractWithDetails[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDuplicate: (id: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

function ContractsTab({ contracts, onDelete, onEdit, onView, onDuplicate, formatPrice, formatDate }: ContractsTabProps) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Verträge</h3>
        <p className="mt-1 text-sm text-gray-500">
          Erstellen Sie Ihren ersten Vertrag.
        </p>
        <div className="mt-6">
          <Link
            href="/vertragsarten-v2/contracts/neu"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Neuer Vertrag
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div key={contract.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
                
                {/* Status Badges */}
                <div className="flex gap-2">
                  {contract.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle size={12} className="mr-1" />
                      Inaktiv
                    </span>
                  )}
                  
                  {contract.is_campaign_version && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Star size={12} className="mr-1" />
                      Kampagne
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    v{contract.version_number}
                  </span>
                </div>
              </div>
              
              {contract.description && (
                <p className="text-gray-600 mt-1">{contract.description}</p>
              )}
              
              <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <DollarSign size={16} />
                  {formatPrice(contract.total_base_price || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Zap size={16} />
                  {contract.modules_included_count} inkl. / {contract.modules_optional_count} opt.
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(contract.updated_at)}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView(contract.id)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                title="Anzeigen"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onEdit(contract.id)}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                title="Bearbeiten"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDuplicate(contract.id)}
                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                title="Duplizieren"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => onDelete(contract.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                title="Löschen"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ModulesTabProps {
  modules: ModuleWithStats[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

function ModulesTab({ modules, onDelete, onEdit, onView, formatPrice, formatDate }: ModulesTabProps) {
  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Module</h3>
        <p className="mt-1 text-sm text-gray-500">
          Erstellen Sie Ihr erstes Modul.
        </p>
        <div className="mt-6">
          <Link
            href="/vertragsarten-v2/modules/neu"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Neues Modul
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((module) => (
        <div key={module.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {module.category_icon && (
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap size={20} className="text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                {module.category_name && (
                  <span className="text-sm text-gray-500">{module.category_name}</span>
                )}
              </div>
            </div>
            
            {module.is_active ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktiv
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Inaktiv
              </span>
            )}
          </div>
          
          {module.description && (
            <p className="text-gray-600 text-sm mb-3">{module.description}</p>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(module.price_per_month)}
            </span>
            <span className="text-sm text-gray-500">
              {module.total_assignments} Zuordnungen
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {module.included_count} inkl.
              </span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {module.optional_count} opt.
              </span>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => onView(module.id)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                title="Anzeigen"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={() => onEdit(module.id)}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                title="Bearbeiten"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(module.id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Löschen"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface DocumentsTabProps {
  documents: ContractDocument[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  formatDate: (date: string) => string;
}

function DocumentsTab({ documents, onDelete, onEdit, onView, formatDate }: DocumentsTabProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Dokumente</h3>
        <p className="mt-1 text-sm text-gray-500">
          Erstellen Sie Ihr erstes Dokument.
        </p>
        <div className="mt-6">
          <Link
            href="/vertragsarten-v2/documents/neu"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Neues Dokument
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div key={document.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{document.name}</h3>
                
                <div className="flex gap-2">
                  {document.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle size={12} className="mr-1" />
                      Inaktiv
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    v{document.version_number}
                  </span>
                </div>
              </div>
              
              {document.description && (
                <p className="text-gray-600 mt-1">{document.description}</p>
              )}
              
              <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText size={16} />
                  {document.sections?.length || 0} Abschnitte
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {document.assignments?.length || 0} Zuordnungen
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(document.updated_at)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView(document.id)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                title="Anzeigen"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onEdit(document.id)}
                className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                title="Bearbeiten"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(document.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                title="Löschen"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}