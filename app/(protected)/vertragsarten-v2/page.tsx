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
  Archive,
  AlertCircle,
  PackageCheck,
  Tag,
  DollarSign,
  X,
  ShoppingCart
} from 'lucide-react';

import contractsAPIInstance, { Contract, ContractModule, ApiResponse } from '@/app/lib/api/contracts-v2';

// Icon Mapping Helper
const getIconFromName = (iconName: string) => {
  const iconMap: Record<string, string> = {
    // Fitness Icons
    'dumbbell': '🏋️',
    'muscle': '💪', 
    'fitness': '🏃',
    'training': '🏋️‍♀️',
    'cardio': '❤️',
    'strength': '💪',
    // Wellness Icons
    'spa': '🧘',
    'sauna': '🌡️',
    'massage': '💆',
    'wellness': '🌿',
    'relaxation': '😌',
    // Course Icons
    'yoga': '🧘‍♀️',
    'pilates': '🤸',
    'dance': '💃',
    'martial-arts': '🥋',
    'swimming': '🏊',
    'cycling': '🚴',
    // General Icons
    'star': '⭐',
    'heart': '❤️',
    'fire': '🔥',
    'lightning': '⚡',
    'trophy': '🏆',
    'medal': '🏅',
    // Service Icons
    'personal': '👤',
    'group': '👥',
    'nutrition': '🥗',
    'diet': '🍎',
    'supplement': '💊',
    // Default fallback
    'default': '📦'
  };
  
  return iconMap[iconName.toLowerCase()] || iconMap['default'];
};

// Tab-Definitionen
const TABS = [
  { id: 'contracts', label: 'Verträge', icon: Package },
  { id: 'modules', label: 'Module', icon: Zap },
  { id: 'documents', label: 'Dokumente', icon: FileText },
  { id: 'archived', label: 'Archiviert', icon: Archive }
] as const;

type TabId = typeof TABS[number]['id'];

export default function VertragsartenV2Page() {
  const [activeTab, setActiveTab] = useState<TabId>('contracts');
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [archivedContracts, setArchivedContracts] = useState<Contract[]>([]);
  const [modules, setModules] = useState<ContractModule[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [contractDetails, setContractDetails] = useState<Record<string, any>>({});
  const [dashboardStats, setDashboardStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    totalModules: 0,
    totalDocuments: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0
  });
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(new Set());

  // Check URL parameter for initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && TABS.some(tab => tab.id === tabParam)) {
        setActiveTab(tabParam as TabId);
      }
    }
  }, []);

  // Daten beim Mount laden
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Lade aktive Verträge
      const contractsResponse = await contractsAPIInstance.getAllContracts();
      if (contractsResponse.data) {
        setContracts(contractsResponse.data);
      }

      // Lade archivierte Verträge separat
      const archivedResponse = await contractsAPIInstance.getArchivedContracts();
      if (archivedResponse.data) {
        setArchivedContracts(archivedResponse.data);
      }

      // Lade nur aktive Module
      const modulesResponse = await contractsAPIInstance.getModules({ is_active: true });
      if (modulesResponse.data) {
        setModules(modulesResponse.data);
      }

      // Lade Dokumente
      const documentsResponse = await contractsAPIInstance.getDocuments();
      if (documentsResponse.data) {
        setDocuments(documentsResponse.data);
      }

      // Lade Dashboard-Statistiken
      const statsResponse = await contractsAPIInstance.getDashboardStats();
      if (statsResponse.data) {
        setDashboardStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditContract = (id: string) => {
    window.location.href = `/vertragsarten-v2/contracts/neu?edit=${id}`;
  };

  const handleDuplicateContract = async (id: string) => {
    setLoading(true);
    try {
      const response = await contractsAPIInstance.duplicateContract(id);
      if (response.data) {
        // Verbesserte Erfolgsmeldung
        alert(response.message || `Vertrag erfolgreich dupliziert: ${response.data.name}`);
        // Daten neu laden
        await loadAllData();
      } else if (response.error) {
        alert(`Fehler beim Duplizieren: ${response.error}`);
      } else {
        alert('Unbekannter Fehler beim Duplizieren des Vertrags');
      }
    } catch (error) {
      console.error('Fehler beim Duplizieren:', error);
      alert('Fehler beim Duplizieren des Vertrags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleContractStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await contractsAPIInstance.updateContractStatus(id, { 
        is_active: !currentStatus 
      });
      
      if (response.error) {
        alert('Fehler beim Ändern des Status');
      } else {
        // Daten neu laden
        await loadAllData();
      }
    } catch (error) {
      console.error('Fehler beim Status-Update:', error);
      alert('Fehler beim Ändern des Status');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveContract = async (id: string) => {
    if (!confirm('Möchten Sie diesen Vertrag wirklich archivieren?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await contractsAPIInstance.updateContractStatus(id, { 
        is_archived: true 
      });
      
      if (response.error) {
        alert('Fehler beim Archivieren des Vertrags');
      } else {
        // Daten neu laden
        await loadAllData();
      }
    } catch (error) {
      console.error('Fehler beim Archivieren:', error);
      alert('Fehler beim Archivieren des Vertrags');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Modul deaktivieren möchten? Es wird nicht gelöscht, sondern nur deaktiviert.')) {
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting module:', id);
      const response = await contractsAPIInstance.deleteModule(id);
      console.log('Delete response:', response);
      
      if (response.error) {
        alert('Fehler beim Deaktivieren: ' + response.error);
      } else {
        await loadAllData();
        alert('Modul erfolgreich deaktiviert');
      }
    } catch (error) {
      console.error('Fehler beim Deaktivieren:', error);
      alert('Fehler beim Deaktivieren des Moduls: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditModule = (id: string) => {
    window.location.href = `/vertragsarten-v2/modules/neu?edit=${id}`;
  };

  const toggleContractExpansion = (contractId: string) => {
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedContracts(newExpanded);
  };

  // Details laden wenn Contract expandiert wird
  const handleToggleExpansion = async (contractId: string) => {
    const wasExpanded = expandedContracts.has(contractId);
    
    // Toggle der Expansion zuerst
    toggleContractExpansion(contractId);
    
    // Lade Details nur wenn wir expandieren (nicht wenn wir kollabieren) und noch nicht geladen
    if (!wasExpanded && !contractDetails[contractId]) {
      try {
        console.log('Lade Contract-Details für:', contractId);
        const response = await contractsAPIInstance.getContractDetails(contractId);
        if (response.data) {
          setContractDetails(prev => ({
            ...prev,
            [contractId]: response.data
          }));
          console.log('Contract-Details geladen:', response.data);
        } else if (response.error) {
          console.error('API-Fehler beim Laden der Details:', response.error);
          alert('Fehler beim Laden der Contract-Details');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Contract-Details:', error);
        alert('Fehler beim Laden der Contract-Details');
      }
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contracts':
        return (
          <ContractsTab
            contracts={contracts}
            expandedContracts={expandedContracts}
            contractDetails={contractDetails}
            onToggleExpansion={handleToggleExpansion}
            onToggleStatus={handleToggleContractStatus}
            onArchive={handleArchiveContract}
            onEdit={handleEditContract}
            onDuplicate={handleDuplicateContract}
            formatPrice={formatPrice}
            formatDate={formatDate}
            loading={loading}
          />
        );
      case 'archived':
        return (
          <ArchivedContractsTab
            contracts={archivedContracts}
            onRestore={async (id: string) => {
              await contractsAPIInstance.updateContractStatus(id, { is_archived: false });
              await loadAllData();
            }}
            formatPrice={formatPrice}
            formatDate={formatDate}
            loading={loading}
          />
        );
      case 'modules':
        return (
          <ModulesTab
            modules={modules}
            onDelete={handleDeleteModule}
            onEdit={handleEditModule}
            onView={() => {}} // View wird im ModulesTab selbst gehandhabt
            formatPrice={formatPrice}
            formatDate={formatDate}
            loading={loading}
          />
        );
      case 'documents':
        return (
          <DocumentsTab
            documents={documents}
            formatDate={formatDate}
            loading={loading}
            onReload={loadAllData}
          />
        );
      default:
        return null;
    }
  };

    return (
    <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
      <div className="flex items-center justify-between mb-8">
            <div>
          <h1 className="text-2xl font-bold text-gray-900">Vertragsarten V2</h1>
          <p className="text-gray-600 mt-1">Verwalte Verträge, Module und Dokumente</p>
            </div>
              <Link 
                href="/vertragsarten-v2/contracts/neu"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Neuer Vertrag
              </Link>
        </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm font-medium text-gray-600">Gesamt Verträge</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalContracts}</p>
              </div>
            <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Verträge</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeContracts}</p>
              </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Module</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalModules}</p>
              </div>
            <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm font-medium text-gray-600">Umsatz/Monat</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(dashboardStats.monthlyRevenue)}</p>
              </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
              const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                  <Icon size={16} />
                    {tab.label}
                  {/* Badge für Archiviert Tab */}
                  {tab.id === 'archived' && archivedContracts.length > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {archivedContracts.length}
                    </span>
                  )}
                  </button>
                );
              })}
            </nav>
          </div>

        {/* Tab Content */}
          <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Lade Daten...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
}

// Module List Item Component
interface ModuleListItemProps {
  module: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (module: any) => void;
  formatPrice: (price: number) => string;
}

function ModuleListItem({ module, onEdit, onDelete, onView, formatPrice }: ModuleListItemProps) {
  const [contractsCount, setContractsCount] = useState<{included: number, bookable: number}>({included: 0, bookable: 0});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContractsCount();
  }, [module.id]);

  const loadContractsCount = async () => {
    setLoading(true);
    try {
      const contractsResponse = await contractsAPIInstance.getAllContracts();
      if (contractsResponse.data) {
        let includedCount = 0;
        let bookableCount = 0;
        
        for (const contract of contractsResponse.data) {
          const details = await contractsAPIInstance.getContractDetails(contract.id);
          if (details.data?.module_assignments) {
            for (const assignment of details.data.module_assignments) {
              if (assignment.module_id === module.id) {
                if (assignment.assignment_type === 'included') {
                  includedCount++;
                } else if (assignment.assignment_type === 'bookable') {
                  bookableCount++;
                }
                break;
              }
            }
          }
        }
        
        setContractsCount({ included: includedCount, bookable: bookableCount });
      }
    } catch (error) {
      console.error('Error loading contracts count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Module Name & Description */}
        <div className="col-span-4">
          <div className="flex items-center gap-3">
            {module.icon_name && (
              <span className="text-lg" title={`Icon: ${module.icon_name}`}>
                {getIconFromName(module.icon_name)}
              </span>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{module.name}</h3>
              {module.description && (
                <p className="text-sm text-gray-600 truncate max-w-xs">{module.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <Tag size={12} />
            {module.category_name || 'Ohne Kategorie'}
          </span>
        </div>

        {/* Price */}
        <div className="col-span-2">
          <span className="font-semibold text-green-600">
            {formatPrice(module.price_per_month)}/Monat
          </span>
        </div>

        {/* Contracts Count */}
        <div className="col-span-2">
          {loading ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Lädt...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {contractsCount.included > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <CheckCircle size={10} />
                  {contractsCount.included} inkludiert
                </span>
              )}
              {contractsCount.bookable > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <ShoppingCart size={10} />
                  {contractsCount.bookable} zubuchbar
                </span>
              )}
              {contractsCount.included === 0 && contractsCount.bookable === 0 && (
                <span className="text-xs text-gray-400">Nicht zugeordnet</span>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="col-span-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            module.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {module.is_active ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(module)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Details anzeigen"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onEdit(module.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Bearbeiten"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(module.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Löschen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interfaces und Komponenten
interface ContractsTabProps {
  contracts: any[];
  expandedContracts: Set<string>;
  contractDetails: Record<string, any>;
  onToggleExpansion: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onArchive: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
  loading: boolean;
}

function ContractsTab({ contracts, expandedContracts, contractDetails, onToggleExpansion, onToggleStatus, onArchive, onEdit, onDuplicate, formatPrice, formatDate, loading }: ContractsTabProps) {
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
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Alle Verträge</option>
              <option value="normal">Normale Verträge</option>
              <option value="campaign">🎯 Kampagnenverträge</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {contracts.map((contract) => {
            const isExpanded = expandedContracts.has(contract.id);
            
            return (
              <div key={contract.id} className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleExpansion(contract.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown size={20} className="text-gray-600" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-600" />
                          )}
                        </button>
                    <h3 className="text-lg font-semibold text-gray-900">{contract.name}</h3>
                        {/* Status Badge mit Kampagnen-Status */}
                        {(contract.is_campaign_version || contract.campaign_name) ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (() => {
                              const now = new Date();
                              const startDate = contract.campaign_start_date ? new Date(contract.campaign_start_date) : null;
                              const endDate = contract.campaign_end_date ? new Date(contract.campaign_end_date) : null;
                              
                              if (!startDate) return 'bg-purple-100 text-purple-800';
                              if (now < startDate) return 'bg-orange-100 text-orange-800';
                              if (endDate && now > endDate) return 'bg-gray-100 text-gray-800';
                              return 'bg-green-100 text-green-800';
                            })()
                          }`}>
                            {(() => {
                              const now = new Date();
                              const startDate = contract.campaign_start_date ? new Date(contract.campaign_start_date) : null;
                              const endDate = contract.campaign_end_date ? new Date(contract.campaign_end_date) : null;
                              
                              if (!startDate) return 'Kampagne';
                              if (now < startDate) return 'Vorgemerkt';
                              if (endDate && now > endDate) return 'Abgelaufen';
                              return 'Aktiv';
                            })()}
                          </span>
                        ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contract.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contract.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                        )}
                        
                        {/* Campaign Badge */}
                        {(contract.is_campaign_version || contract.campaign_name) && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            🎯 {contract.campaign_name || 'Kampagnenvertrag'}
                          </span>
                        )}
                        
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          v{contract.version || contract.version_number || 1}
                    </span>
                  </div>
                  {contract.description && (
                        <p className="text-gray-600 mt-1 ml-8">{contract.description}</p>
                  )}
                      <div className="flex items-center gap-6 mt-3 ml-8 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Coins size={16} />
                          {formatPrice(contract.total_base_price || contract.base_price || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(contract.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                        onClick={() => openVersionsModal(contract.contract_group_id || contract.id, contract.name)}
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
                        onClick={() => onToggleStatus(contract.id, contract.is_active)}
                        className={`p-2 hover:bg-orange-50 rounded-lg transition-colors ${
                          contract.is_active ? 'text-orange-600' : 'text-green-600'
                        }`}
                        title={contract.is_active ? "Deaktivieren" : "Aktivieren"}
                      >
                        {contract.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
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

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-white">
                    <div className="p-4 space-y-4">
                      {contractDetails[contract.id] ? (
                        <ContractDetailsExpanded 
                          contract={contractDetails[contract.id]}
                          formatPrice={formatPrice}
                          formatDate={formatDate}
                        />
                      ) : (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-gray-600">Lade Details...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

// Neue Komponente für erweiterte Contract-Details
function ContractDetailsExpanded({ 
  contract, 
  formatPrice, 
  formatDate 
}: { 
  contract: any; 
  formatPrice: (price: number) => string; 
  formatDate: (date: string) => string; 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Laufzeiten */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={16} />
          Laufzeiten
        </h4>
        <div className="space-y-2">
          {contract.terms && contract.terms.length > 0 ? (
            contract.terms.map((term: any, index: number) => (
              <div key={term.id || index} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {term.duration_months} Monate
                    {term.is_default && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Standard
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(term.base_price)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Keine Laufzeiten konfiguriert</p>
          )}
        </div>
      </div>

      {/* Module */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Zap size={16} />
          Module
        </h4>
        <div className="space-y-1">
          {contract.module_assignments && contract.module_assignments.length > 0 ? (
            contract.module_assignments.map((assignment: any, index: number) => (
              <div key={assignment.module_id || index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{assignment.module_name || 'Unbekanntes Modul'}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    assignment.assignment_type === 'included' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {assignment.assignment_type === 'included' ? 'Inkl.' : 'Zubuchbar'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-purple-600">
                  {formatPrice(assignment.custom_price || assignment.module_price || 0)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Keine Module zugeordnet</p>
          )}
        </div>
      </div>

      {/* Startpakete & Zusatzinfos */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <PackageCheck size={16} />
          Zusatzleistungen
        </h4>
        <div className="space-y-2">
          {/* Kündigung */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm">
              <span className="font-medium">Kündigungsfrist:</span>
              <div className="text-gray-600 mt-1">
                {contract.cancellation_period} {contract.cancellation_unit === 'months' ? 'Monate' : 'Tage'}
              </div>
            </div>
          </div>
          
          {/* Auto-Verlängerung */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm">
              <span className="font-medium">Verlängerung:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  contract.auto_renew 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {contract.auto_renew ? 'Automatisch' : 'Manuell'}
                </span>
              </div>
            </div>
          </div>

          {/* Kampagnen-Info */}
          {(contract.campaign_name || contract.is_campaign_version) && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-purple-800">🎯 Kampagnen-Vertrag</span>
                </div>
                {contract.campaign_name && (
                  <div className="text-purple-700 font-medium mb-1">
                    {contract.campaign_name}
                  </div>
                )}
                {contract.campaign_start_date && (
                  <div className="text-purple-600 text-xs">
                    Gültig: {formatDate(contract.campaign_start_date)} - {
                      contract.campaign_end_date ? formatDate(contract.campaign_end_date) : 'Unbegrenzt'
                    }
                  </div>
                )}
                
                {/* Kampagnen-Anpassungen anzeigen */}
                {contract.campaign_overrides && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-purple-600 font-medium">Angepasste Bereiche:</div>
                    <div className="flex flex-wrap gap-1">
                      {contract.campaign_overrides.pricing && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Preise</span>
                      )}
                      {contract.campaign_overrides.modules && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Module</span>
                      )}
                      {contract.campaign_overrides.startPackages && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Startpakete</span>
                      )}
                      {contract.campaign_overrides.flatRates && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Pauschalen</span>
                      )}
                      {contract.campaign_overrides.priceDynamics && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Preisdynamik</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contractGroupId) {
      loadVersions();
    }
  }, [isOpen, contractGroupId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const response = await contractsAPIInstance.getContractVersions(contractGroupId);
      if (response.data) {
        setVersions(response.data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Versionen:', error);
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Lade Versionen...</span>
            </div>
          ) : (
          <div className="space-y-4">
              {versions.map((version, index) => (
              <div key={version.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        v{version.version_number}
                      </span>
                        {version.is_active && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Aktiv
                        </span>
                      )}
                      {version.is_campaign_version && (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          Kampagne
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(`/vertragsarten-v2/contracts/${version.id}`, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" 
                        title="Anzeigen"
                      >
                      <Eye size={16} />
                    </button>
                      <button 
                        onClick={() => window.location.href = `/vertragsarten-v2/contracts/neu?edit=${version.id}`}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg" 
                        title="Bearbeiten"
                      >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
                
                  {version.version_note && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">Änderungen:</span>
                      <p className="text-gray-600 text-sm mt-1">{version.version_note}</p>
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
                    {version.campaign_start_date && (
                      <span className="flex items-center gap-1">
                        <Star size={14} />
                        Kampagne: {formatDate(version.campaign_start_date)}
                      </span>
                    )}
                </div>
              </div>
            ))}
              
              {versions.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  Keine Versionen gefunden.
          </div>
              )}
            </div>
          )}
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
  loading: boolean;
}

function ModulesTab({ modules, onDelete, onEdit, onView, formatPrice, formatDate, loading }: ModulesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [moduleContracts, setModuleContracts] = useState<{included: any[], bookable: any[]}>({included: [], bookable: []});
  
  // Filter modules based on search and category
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || module.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(modules.map(m => m.category_id).filter(Boolean)))
    .map(id => modules.find(m => m.category_id === id))
    .filter(Boolean);

  const handleViewModule = async (module: any) => {
    setSelectedModule(module);
    setShowDetailModal(true);
    
         // Load contracts that use this module
     try {
       const contractsResponse = await contractsAPIInstance.getAllContracts();
       if (contractsResponse.data) {
         const included = [];
         const bookable = [];
         
         for (const contract of contractsResponse.data) {
           const details = await contractsAPIInstance.getContractDetails(contract.id);
          if (details.data?.module_assignments) {
            for (const assignment of details.data.module_assignments) {
              if (assignment.module_id === module.id) {
                if (assignment.assignment_type === 'included') {
                  included.push(contract);
                } else if (assignment.assignment_type === 'bookable') {
                  bookable.push(contract);
                }
                break;
              }
            }
          }
        }
        
        setModuleContracts({ included, bookable });
      }
    } catch (error) {
      console.error('Error loading module contracts:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Module</h2>
        <button
          onClick={() => window.location.href = '/vertragsarten-v2/modules/neu'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Neues Modul
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Module durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
                  </div>
                </div>
        
        <div className="min-w-[200px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
              </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredModules.length} von {modules.length} Modulen angezeigt
      </div>

      {/* Modules List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Modul</div>
            <div className="col-span-2">Kategorie</div>
            <div className="col-span-2">Preis</div>
            <div className="col-span-2">Verträge</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Aktionen</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredModules.map((module) => (
            <ModuleListItem 
              key={module.id} 
              module={module} 
              onEdit={onEdit}
              onDelete={onDelete}
              onView={handleViewModule}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          {searchTerm || selectedCategory ? (
            <div>
              <p className="text-lg font-medium mb-2">Keine Module gefunden</p>
              <p>Versuchen Sie andere Suchbegriffe oder Filter.</p>
                <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="mt-3 text-blue-600 hover:text-blue-700"
              >
                Filter zurücksetzen
                </button>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">Noch keine Module vorhanden</p>
              <p className="mb-4">Erstellen Sie Ihr erstes Modul für Vertragsarten.</p>
                <button
                onClick={() => window.location.href = '/vertragsarten-v2/modules/neu'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                <Plus size={16} />
                Erstes Modul erstellen
                </button>
            </div>
          )}
        </div>
      )}

      {/* Module Detail Modal */}
      {showDetailModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {selectedModule.icon_name && (
                    <span className="text-2xl">
                      {getIconFromName(selectedModule.icon_name)}
                    </span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedModule.name}</h3>
                    <p className="text-gray-600">{selectedModule.category_name || 'Ohne Kategorie'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Module Details */}
              <div className="space-y-6">
                {selectedModule.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Beschreibung</h4>
                    <p className="text-gray-700">{selectedModule.description}</p>
            </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Preis</h4>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(selectedModule.price_per_month)}/Monat
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedModule.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedModule.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>

                {/* Contract Assignments */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Vertragsverknüpfungen</h4>
                  
                  {moduleContracts.included.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        Inkludiert in Verträgen ({moduleContracts.included.length})
                      </h5>
                      <div className="space-y-2">
                        {moduleContracts.included.map((contract) => (
                          <div key={contract.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <span className="text-green-600">✓</span>
                            <span className="font-medium">{contract.name}</span>
                            <span className="text-sm text-gray-500">v{contract.version_number || 1}</span>
          </div>
        ))}
      </div>
                    </div>
                  )}

                  {moduleContracts.bookable.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ShoppingCart size={16} className="text-blue-600" />
                        Zubuchbar in Verträgen ({moduleContracts.bookable.length})
                      </h5>
                      <div className="space-y-2">
                        {moduleContracts.bookable.map((contract) => (
                          <div key={contract.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <span className="text-blue-600">+</span>
                            <span className="font-medium">{contract.name}</span>
                            <span className="text-sm text-gray-500">v{contract.version_number || 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {moduleContracts.included.length === 0 && moduleContracts.bookable.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Package size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Dieses Modul ist noch nicht mit Verträgen verknüpft.</p>
                    </div>
                  )}
                </div>

                {/* Meta Information */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Erstellt:</span> {formatDate(selectedModule.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Geändert:</span> {formatDate(selectedModule.updated_at || selectedModule.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Schließen
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onEdit(selectedModule.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit size={16} />
                  Bearbeiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DocumentsTabProps {
  documents: any[];
  formatDate: (date: string) => string;
  loading: boolean;
  onReload: () => void;
}

function DocumentsTab({ documents, formatDate, loading, onReload }: DocumentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditDocument = (id: string) => {
    window.location.href = `/vertragsarten-v2/documents/neu?edit=${id}`;
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      return;
    }

    try {
      const response = await contractsAPIInstance.deleteDocument(id);
      if (response.error) {
        alert('Fehler beim Löschen: ' + response.error);
      } else {
        onReload();
        alert('Dokument erfolgreich gelöscht');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Dokuments');
    }
  };

  const handleViewDocument = async (document: any) => {
    setSelectedDocument(document);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Vertragsdokumente</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verwalten Sie Ihre Dokumentenvorlagen
          </p>
      </div>

        <Link
          href="/vertragsarten-v2/documents/neu"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Neues Dokument
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredDocuments.length} von {documents.length} Dokument{documents.length !== 1 ? 'en' : ''}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Dokumente...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? (
              <>
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Keine Dokumente gefunden für "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                >
                  Suche zurücksetzen
                </button>
              </>
            ) : (
              <>
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Noch keine Dokumente erstellt.</p>
                <p className="text-sm mt-1">Klicken Sie auf "Neues Dokument" um zu beginnen.</p>
              </>
            )}
          </div>
        ) : (
          filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900">{document.name}</h3>
                    
                    {/* Status Badges */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      document.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {document.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      v{document.version_number || 1}
                  </span>
                </div>
                  
                  {document.description && (
                    <p className="text-gray-600 mt-1 ml-8">{document.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 mt-3 ml-8 text-sm text-gray-500">
                    <span>
                      <strong>Verträge:</strong> {document.assigned_contract_names?.length || 0} zugeordnet
                    </span>
                    <span>
                      <strong>Erstellt:</strong> {formatDate(document.created_at)}
                    </span>
                    {document.updated_at && document.updated_at !== document.created_at && (
                      <span>
                        <strong>Geändert:</strong> {formatDate(document.updated_at)}
                      </span>
                    )}
              </div>
                  
                  {/* Contract Assignments Preview */}
                  {document.assigned_contract_names?.length > 0 && (
                    <div className="mt-3 ml-8">
                      <div className="flex flex-wrap gap-1">
                        {document.assigned_contract_names.slice(0, 3).map((contractName: string, index: number) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {contractName}
                          </span>
                        ))}
                        {document.assigned_contract_names.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            +{document.assigned_contract_names.length - 3} weitere
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                <button
                    onClick={() => handleViewDocument(document)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Details anzeigen"
                >
                  <Eye size={16} />
                </button>
                  
                <button
                    onClick={() => handleEditDocument(document.id)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                  
                <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            </div>
          ))
        )}
      </div>

      {/* Document Detail Modal */}
      {showDetailModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Dokument-Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Grundinformationen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{selectedDocument.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Version:</span>
                      <p className="font-medium">v{selectedDocument.version_number || 1}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedDocument.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDocument.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Erstellt:</span>
                      <p className="font-medium">{formatDate(selectedDocument.created_at)}</p>
                    </div>
                  </div>
                  
                  {selectedDocument.description && (
                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Beschreibung:</span>
                      <p className="font-medium">{selectedDocument.description}</p>
                    </div>
                  )}
                </div>

                {/* Contract Assignments */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Vertragsverknüpfungen</h3>
                  {selectedDocument.assigned_contract_names?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDocument.assigned_contract_names.map((contractName: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <FileText size={16} className="text-blue-600" />
                          <span className="font-medium">{contractName}</span>
          </div>
        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Dieses Dokument ist noch nicht mit Verträgen verknüpft.</p>
                    </div>
                  )}
                </div>

                {/* Module Configuration */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Modulkonfiguration</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings size={16} className="text-gray-500" />
                        <span className="font-medium text-sm">Pflichtmodule</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <div>Vertragsinformationen: {selectedDocument.required_modules?.contract_info?.enabled ? 'Aktiv' : 'Inaktiv'}</div>
                        <div>Datenschutz: {selectedDocument.required_modules?.privacy_policy?.enabled ? 'Aktiv' : 'Inaktiv'}</div>
                        <div>AGBs: {selectedDocument.required_modules?.terms_conditions?.enabled ? 'Aktiv' : 'Inaktiv'}</div>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Plus size={16} className="text-gray-500" />
                        <span className="font-medium text-sm">Optionale Module</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <div>Beitragskalender: {selectedDocument.optional_modules?.payment_calendar?.enabled ? 'Aktiv' : 'Inaktiv'}</div>
                        <div>Leistungsübersicht: {selectedDocument.optional_modules?.service_overview?.enabled ? 'Aktiv' : 'Inaktiv'}</div>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" />
                        <span className="font-medium text-sm">Individuelle Blöcke</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {selectedDocument.custom_sections?.length || 0} Block{(selectedDocument.custom_sections?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Schließen
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditDocument(selectedDocument.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Bearbeiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ArchivedContractsTabProps {
  contracts: any[];
  onRestore: (id: string) => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
  loading: boolean;
}

function ArchivedContractsTab({ contracts, onRestore, formatPrice, formatDate, loading }: ArchivedContractsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Archivierte Verträge</h2>
        <div className="text-sm text-gray-500">
          {contracts.length} archiviert{contracts.length !== 1 ? 'e' : 'er'} Vertrag{contracts.length !== 1 ? 'äge' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {contracts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Archive size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Keine archivierten Verträge vorhanden.</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div key={contract.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-75">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Archive size={20} className="text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-700">{contract.name}</h3>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Archiviert
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      v{contract.version || contract.version_number || 1}
                    </span>
                  </div>
                  {contract.description && (
                    <p className="text-gray-500 mt-1 ml-8">{contract.description}</p>
                  )}
                  <div className="flex items-center gap-6 mt-3 ml-8 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Coins size={16} />
                      {formatPrice(contract.total_base_price || contract.base_price || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      Archiviert: {formatDate(contract.updated_at || contract.created_at)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRestore(contract.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
                    title="Wiederherstellen"
                  >
                    <History size={16} />
                    <span className="text-sm">Wiederherstellen</span>
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Dauerhaft löschen"
                    onClick={() => {
                      if (confirm('Möchten Sie diesen Vertrag DAUERHAFT löschen? Dies kann nicht rückgängig gemacht werden!')) {
                        // TODO: Implement permanent delete
                        console.log('Permanent delete:', contract.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}