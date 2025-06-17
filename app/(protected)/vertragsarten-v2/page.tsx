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
  Coins,
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
  Star,
  ChevronDown,
  ChevronRight,
  GitBranch,
  History,
  Ban,
  Archive
} from 'lucide-react';

// Tab-Definitionen
const TABS = [
  { id: 'contracts', label: 'Verträge', icon: Package },
  { id: 'modules', label: 'Module', icon: Zap },
  { id: 'documents', label: 'Dokumente', icon: FileText }
] as const;

type TabId = typeof TABS[number]['id'];

export default function VertragsartenV2Page() {
  const [activeTab, setActiveTab] = useState<TabId>('contracts');
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalContracts: 12,
    activeContracts: 8,
    totalModules: 24,
    totalDocuments: 15,
    monthlyRevenue: 45600,
    revenueGrowth: 12.5
  });

  // Mock-Daten für Demo
  const mockContracts = [
    {
      id: '1',
      name: 'Basic Mitgliedschaft',
      description: 'Grundausstattung für Einsteiger',
      version: 2,
      is_active: true,
      total_base_price: 39.99,
      created_at: '2024-01-15'
    },
    {
      id: '2', 
      name: 'Premium Vertrag',
      description: 'Vollausstattung mit allen Features',
      version: 1,
      is_active: true,
      total_base_price: 79.99,
      created_at: '2024-01-20'
    },
    {
      id: '3',
      name: 'Student Tarif',
      description: 'Vergünstigter Tarif für Studenten',
      version: 1,
      is_active: false,
      total_base_price: 29.99,
      created_at: '2024-01-10'
    }
  ];

  const mockModules = [
    {
      id: '1',
      name: 'Fitness Tracking',
      description: 'Umfassendes Fitness-Monitoring',
      category_name: 'Gesundheit',
      price_per_month: 9.99,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Personal Training',
      description: '1:1 Betreuung durch Trainer',
      category_name: 'Training',
      price_per_month: 49.99,
      created_at: '2024-01-20'
    },
    {
      id: '3',
      name: 'Ernährungsberatung',
      description: 'Professionelle Ernährungsberatung',
      category_name: 'Ernährung',
      price_per_month: 19.99,
      created_at: '2024-01-12'
    }
  ];

  const mockDocuments = [
    {
      id: '1',
      name: 'Allgemeine Geschäftsbedingungen',
      template_type: 'AGB',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Mitgliedsvertrag Standard',
      template_type: 'Contract',
      created_at: '2024-01-20'
    },
    {
      id: '3',
      name: 'Datenschutzerklärung',
      template_type: 'Privacy',
      created_at: '2024-01-10'
    }
  ];

  const handleEditContract = (id: string) => {
    window.location.href = `/vertragsarten-v2/contracts/neu?edit=${id}`;
  };

  const handleDuplicateContract = async (id: string) => {
    console.log('Dupliziere Vertrag:', id);
  };

  const handleDeactivateContract = async (id: string) => {
    console.log('Deaktiviere Vertrag:', id);
  };

  const handleArchiveContract = async (id: string) => {
    console.log('Archiviere Vertrag:', id);
  };

  const handleDeleteModule = async (id: string) => {
    console.log('Lösche Modul:', id);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contracts':
        return (
          <ContractsTab
            contracts={mockContracts}
            onDeactivate={handleDeactivateContract}
            onArchive={handleArchiveContract}
            onEdit={handleEditContract}
            onDuplicate={handleDuplicateContract}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />
        );
      case 'modules':
        return (
          <ModulesTab
            modules={mockModules}
            onDelete={handleDeleteModule}
            onEdit={(id) => console.log('Edit module:', id)}
            onView={(id) => console.log('View module:', id)}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />
        );
      case 'documents':
        return (
          <DocumentsTab
            documents={mockDocuments}
            onDelete={(id) => console.log('Delete document:', id)}
            onEdit={(id) => console.log('Edit document:', id)}
            onView={(id) => console.log('View document:', id)}
            formatDate={formatDate}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vertragsarten V2</h1>
              <p className="text-gray-600 mt-2">Moderne Vertragsverwaltung mit Versionierung</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/vertragsarten-v2/contracts/neu"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Neuer Vertrag
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verträge gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalContracts}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Verträge</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeContracts}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Module</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalModules}</p>
              </div>
              <Zap className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monatsumsatz</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(dashboardStats.monthlyRevenue)}</p>
              </div>
              <Coins className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Interfaces und Komponenten
interface ContractsTabProps {
  contracts: any[];
  onDeactivate: (id: string) => void;
  onArchive: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

function ContractsTab({ contracts, onDeactivate, onArchive, onEdit, onDuplicate, formatPrice, formatDate }: ContractsTabProps) {
  const [versionsModal, setVersionsModal] = useState({
    isOpen: false,
    contractGroupId: '',
    contractName: ''
  });

  const openVersionsModal = (contractGroupId: string, contractName: string) => {
    setVersionsModal({
      isOpen: true,
      contractGroupId,
      contractName
    });
  };

  const closeVersionsModal = () => {
    setVersionsModal({
      isOpen: false,
      contractGroupId: '',
      contractName: ''
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Verträge</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Verträge suchen..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contract.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      v{contract.version}
                    </span>
                  </div>
                  {contract.description && (
                    <p className="text-gray-600 mt-1">{contract.description}</p>
                  )}
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Coins size={16} />
                      {formatPrice(contract.total_base_price || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(contract.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openVersionsModal(contract.id, contract.name)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Versionierung"
                  >
                    <GitBranch size={16} />
                  </button>
                  <button
                    onClick={() => onEdit(contract.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDuplicate(contract.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplizieren"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => onDeactivate(contract.id)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Deaktivieren"
                  >
                    <Ban size={16} />
                  </button>
                  <button
                    onClick={() => onArchive(contract.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Archivieren"
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Versions Modal */}
      <ContractVersionsModal
        isOpen={versionsModal.isOpen}
        onClose={closeVersionsModal}
        contractGroupId={versionsModal.contractGroupId}
        contractName={versionsModal.contractName}
        formatDate={formatDate}
      />
    </>
  );
}

// Versions Modal Component
function ContractVersionsModal({ 
  isOpen, 
  onClose, 
  contractGroupId, 
  contractName,
  formatDate 
}: {
  isOpen: boolean;
  onClose: () => void;
  contractGroupId: string;
  contractName: string;
  formatDate: (date: string) => string;
}) {
  // Mock-Versionen für Demo
  const mockVersions = [
    {
      id: '1',
      version_number: 2,
      version_notes: 'Preisanpassung für 2024',
      description: 'Aktualisierte Preise und neue Module hinzugefügt',
      is_active: true,
      is_campaign_version: false,
      created_at: '2024-01-20'
    },
    {
      id: '2', 
      version_number: 1,
      version_notes: 'Erste Version',
      description: 'Grundausstattung für Einsteiger',
      is_active: false,
      is_campaign_version: false,
      created_at: '2024-01-15'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Versionen: {contractName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {mockVersions.map((version, index) => (
              <div key={version.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        v{version.version_number}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Aktuell
                        </span>
                      )}
                      {version.is_campaign_version && (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          Kampagne
                        </span>
                      )}
                      {!version.is_active && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Inaktiv
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Anzeigen">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg" title="Bearbeiten">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
                
                {version.version_notes && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Änderungen:</span>
                    <p className="text-gray-600 text-sm mt-1">{version.version_notes}</p>
                  </div>
                )}
                
                {version.description && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Beschreibung:</span>
                    <p className="text-gray-600 text-sm mt-1">{version.description}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(version.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModulesTabProps {
  modules: any[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

function ModulesTab({ modules, onDelete, onEdit, onView, formatPrice, formatDate }: ModulesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Module</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                {module.description && (
                  <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                )}
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  <div>{module.category_name}</div>
                  <div className="font-medium text-green-600">
                    {formatPrice(module.price_per_month)}/Monat
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onView(module.id)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Anzeigen"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onEdit(module.id)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(module.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DocumentsTabProps {
  documents: any[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  formatDate: (date: string) => string;
}

function DocumentsTab({ documents, onDelete, onEdit, onView, formatDate }: DocumentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Dokumente</h2>
      </div>

      <div className="space-y-3">
        {documents.map((document) => (
          <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{document.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{document.template_type}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(document.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onView(document.id)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Anzeigen"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onEdit(document.id)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(document.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}