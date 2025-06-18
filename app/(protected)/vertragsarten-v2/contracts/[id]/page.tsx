'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Package, 
  Zap, 
  Edit,
  Copy,
  Archive,
  FileText,
  Euro,
  Clock,
  Settings,
  GitBranch,
  Users,
  Star
} from 'lucide-react';

import contractsAPIInstance from '@/app/lib/api/contracts-v2';

export default function ContractViewPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<any>(null);
  const [campaignVersions, setCampaignVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const loadContract = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contractsAPIInstance.getContractDetails(contractId);
      if (response.data) {
        setContract(response.data);
        
        // Lade Kampagnenversionen für normale Verträge (nicht für Kampagnenversionen selbst)
        if (!response.data.is_campaign_version) {
          const campaignResponse = await contractsAPIInstance.getCampaignVersions(contractId);
          if (campaignResponse.data) {
            setCampaignVersions(campaignResponse.data);
          }
        }
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Vertrags:', error);
      setError('Fehler beim Laden des Vertrags');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/vertragsarten-v2/contracts/neu?edit=${contractId}`);
  };

  const handleDuplicate = async () => {
    try {
      const response = await contractsAPIInstance.duplicateContract(contractId);
      if (response.data) {
        alert('Vertrag erfolgreich dupliziert!');
        router.push('/vertragsarten-v2');
      } else if (response.error) {
        alert(`Fehler beim Duplizieren: ${response.error}`);
      }
    } catch (error) {
      console.error('Fehler beim Duplizieren:', error);
      alert('Fehler beim Duplizieren des Vertrags');
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
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Lade Vertrag...</span>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">
            {error || 'Vertrag nicht gefunden'}
          </div>
          <Link 
            href="/vertragsarten-v2"
            className="text-blue-600 hover:underline"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/vertragsarten-v2"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Erstellt: {formatDate(contract.created_at)}
              </span>
              {contract.contract_number && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  Nr: {contract.contract_number}
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                contract.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {contract.is_active ? 'Aktiv' : 'Inaktiv'}
              </span>
              {contract.is_campaign_version && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  🎯 Kampagnen-Version
                </span>
              )}
              {contract.campaign_name && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {contract.campaign_name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit size={16} />
            Bearbeiten
          </button>
          <button
            onClick={handleDuplicate}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Copy size={16} />
            Duplizieren
          </button>
        </div>
      </div>

      {/* Kampagnen-Informationen (falls Kampagnenvertrag) */}
      {(contract.is_campaign_version || contract.campaign_name) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
            🎯 Kampagnen-Einstellungen
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kampagnen-Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-purple-800">Kampagnen-Details</h3>
              {contract.campaign_name && (
                <div>
                  <span className="text-sm font-medium text-purple-700">Kampagnenname:</span>
                  <p className="text-purple-600 mt-1">{contract.campaign_name}</p>
                </div>
              )}
              {contract.campaign_start_date && (
                <div>
                  <span className="text-sm font-medium text-purple-700">Kampagnenzeitraum:</span>
                  <p className="text-purple-600 mt-1">
                    {formatDate(contract.campaign_start_date)} - {
                      contract.campaign_end_date ? formatDate(contract.campaign_end_date) : 'Unbegrenzt'
                    }
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-purple-700">Status:</span>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
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
                      
                      if (!startDate) return 'Kampagne aktiv';
                      if (now < startDate) return '⏰ Vorgemerkt';
                      if (endDate && now > endDate) return '❌ Abgelaufen';
                      return '✅ Läuft';
                    })()}
                  </span>
                </p>
              </div>
            </div>

            {/* Angepasste Bereiche */}
            <div className="space-y-4">
              <h3 className="font-medium text-purple-800">Angepasste Bereiche</h3>
              <div className="flex flex-wrap gap-2">
                {contract.campaign_override_pricing && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    💰 Preise
                  </span>
                )}
                {contract.campaign_override_modules && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    ⚡ Module
                  </span>
                )}
                {contract.campaign_override_packages && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    📦 Startpakete
                  </span>
                )}
                {contract.campaign_override_flat_rates && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    💳 Pauschalen
                  </span>
                )}
                {contract.campaign_override_price_dynamics && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    📊 Preisdynamik
                  </span>
                )}
              </div>
              {!contract.campaign_override_pricing && !contract.campaign_override_modules && 
               !contract.campaign_override_packages && !contract.campaign_override_flat_rates && 
               !contract.campaign_override_price_dynamics && (
                <p className="text-purple-600 text-sm">Keine Bereiche angepasst</p>
              )}
            </div>

            {/* Kampagnen-Aktionen */}
            <div className="space-y-4">
              <h3 className="font-medium text-purple-800">Aktionen</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Kampagne bearbeiten
                </button>
                
                {/* Zeige "Kampagnen-Version erstellen" Button nur für normale Verträge */}
                {!contract.is_campaign_version && (
                  <button
                    onClick={() => router.push(`/vertragsarten-v2/contracts/neu?campaign=${contractId}`)}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    🎯 Kampagnen-Version erstellen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basis-Informationen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Vertragsdaten */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} />
            Vertragsdaten
          </h3>
          <div className="space-y-3">
            {contract.description && (
              <div>
                <span className="text-sm font-medium text-gray-700">Beschreibung:</span>
                <p className="text-gray-600 mt-1">{contract.description}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-700">Kündigungsfrist:</span>
              <p className="text-gray-600 mt-1">
                {contract.cancellation_period} {contract.cancellation_unit === 'months' ? 'Monate' : 'Tage'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Verlängerung:</span>
              <p className="text-gray-600 mt-1">
                {contract.auto_renew ? 'Automatisch' : 'Manuell'}
              </p>
            </div>
            {contract.version_note && (
              <div>
                <span className="text-sm font-medium text-gray-700">Versionshinweis:</span>
                <p className="text-gray-600 mt-1">{contract.version_note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Laufzeiten */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} />
            Laufzeiten
          </h3>
          <div className="space-y-3">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={18} />
            Module
          </h3>
          <div className="space-y-3">
            {contract.module_assignments && contract.module_assignments.length > 0 ? (
              contract.module_assignments.map((assignment: any, index: number) => (
                <div key={assignment.module_id || index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium">{assignment.module_name || assignment.module?.name || `Modul ${assignment.module_id}`}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          assignment.assignment_type === 'included' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {assignment.assignment_type === 'included' ? 'Inklusive' : 'Zubuchbar'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">
                      {formatPrice(assignment.custom_price || assignment.module_price || assignment.module?.price_per_month || 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Keine Module zugeordnet</p>
            )}
          </div>
        </div>
      </div>

      {/* Zusätzliche Informationen */}
      {(contract.starter_packages?.length > 0 || contract.flat_rates?.length > 0 || contract.price_dynamic_rules?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Startpakete */}
          {contract.starter_packages?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={18} />
                Startpakete
              </h3>
              <div className="space-y-3">
                {contract.starter_packages.map((pkg: any, index: number) => (
                  <div key={pkg.id || index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium">{pkg.name}</span>
                        {pkg.description && (
                          <p className="text-gray-600 text-xs mt-1">{pkg.description}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          {pkg.included_modules?.length || 0} Module enthalten
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatPrice(pkg.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pauschalen */}
          {contract.flat_rates?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Euro size={18} />
                Pauschalen
              </h3>
              <div className="space-y-3">
                {contract.flat_rates.map((rate: any, index: number) => (
                  <div key={rate.id || index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium">{rate.name}</span>
                        <p className="text-gray-600 text-xs mt-1">
                          {rate.payment_interval === 'monthly' && 'Monatlich'}
                          {rate.payment_interval === 'quarterly' && 'Quartalsweise'}
                          {rate.payment_interval === 'yearly' && 'Jährlich'}
                          {rate.payment_interval === 'fixed_date' && `Stichtag: ${rate.fixed_date}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatPrice(rate.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preisdynamik */}
          {contract.price_dynamic_rules?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings size={18} />
                Preisdynamik
              </h3>
              <div className="space-y-3">
                {contract.price_dynamic_rules.map((rule: any, index: number) => (
                  <div key={rule.id || index} className="p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <span className="text-sm font-medium">{rule.name}</span>
                      <p className="text-gray-600 text-xs mt-1">
                        {rule.adjustment_value_type === 'percent' 
                          ? `${rule.adjustment_value}%` 
                          : formatPrice(rule.adjustment_value)
                        }
                        {rule.target_date && ` ab ${formatDate(rule.target_date)}`}
                        {rule.after_months && ` nach ${rule.after_months} Monaten`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kampagnenversionen (nur für normale Verträge) */}
      {!contract.is_campaign_version && campaignVersions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🎯 Kampagnenversionen
          </h3>
          <div className="space-y-3">
            {campaignVersions.map((version: any) => (
              <div key={version.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-purple-900">
                        {version.campaign_name || version.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (() => {
                          const now = new Date();
                          const startDate = version.campaign_start_date ? new Date(version.campaign_start_date) : null;
                          const endDate = version.campaign_end_date ? new Date(version.campaign_end_date) : null;
                          
                          if (!startDate) return 'bg-purple-100 text-purple-800';
                          if (now < startDate) return 'bg-orange-100 text-orange-800';
                          if (endDate && now > endDate) return 'bg-gray-100 text-gray-800';
                          return 'bg-green-100 text-green-800';
                        })()
                      }`}>
                        {(() => {
                          const now = new Date();
                          const startDate = version.campaign_start_date ? new Date(version.campaign_start_date) : null;
                          const endDate = version.campaign_end_date ? new Date(version.campaign_end_date) : null;
                          
                          if (!startDate) return 'Aktiv';
                          if (now < startDate) return '⏰ Vorgemerkt';
                          if (endDate && now > endDate) return '❌ Abgelaufen';
                          return '✅ Läuft';
                        })()}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        v{version.version_number}-{version.campaign_version}
                      </span>
                    </div>
                    
                    {version.campaign_start_date && (
                      <p className="text-purple-600 text-sm mt-1">
                        📅 {formatDate(version.campaign_start_date)} - {
                          version.campaign_end_date ? formatDate(version.campaign_end_date) : 'Unbegrenzt'
                        }
                      </p>
                    )}

                    {/* Angepasste Bereiche */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {version.campaign_override_pricing && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">💰 Preise</span>
                      )}
                      {version.campaign_override_modules && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">⚡ Module</span>
                      )}
                      {version.campaign_override_packages && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">📦 Startpakete</span>
                      )}
                      {version.campaign_override_flat_rates && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">💳 Pauschalen</span>
                      )}
                      {version.campaign_override_price_dynamics && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">📊 Preisdynamik</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vertragsarten-v2/contracts/${version.id}`}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => router.push(`/vertragsarten-v2/contracts/neu?edit=${version.id}`)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
} 