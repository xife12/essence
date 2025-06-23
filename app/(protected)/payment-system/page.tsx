'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Users, FileText, Settings, TrendingUp, RefreshCw } from 'lucide-react';
import Card from '@/app/components/ui/Card';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
import type { PaymentMember, MemberAccount, PaymentGroup } from '@/app/lib/types/payment-system';

type TabType = 'members' | 'payments' | 'settings';

interface MemberWithDetails extends PaymentMember {
  member_accounts?: MemberAccount[];
  payment_groups?: Pick<PaymentGroup, 'name' | 'payment_day'>;
}

export default function PaymentSystemPage() {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    successRate: 0
  });

  const api = new PaymentSystemAPI();

  // Load members and calculate stats
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const result = await api.getPaymentMembers();
      
      if (result.success && result.data) {
        setMembers(result.data);
        
        // Calculate stats
        const totalBalance = result.data.reduce((sum, member) => {
          const balance = member.member_accounts?.[0]?.current_balance || 0;
          return sum + balance;
        }, 0);
        
        const overdueMembers = result.data.filter(member => 
          (member.member_accounts?.[0]?.current_balance || 0) < 0
        );
        
        setStats({
          totalMembers: result.data.length,
          pendingPayments: overdueMembers.length,
          monthlyRevenue: totalBalance,
          successRate: result.data.length > 0 ? Math.round(((result.data.length - overdueMembers.length) / result.data.length) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  // Refresh members after successful upload
  const handleUploadSuccess = () => {
    loadMembers();
  };

  const tabs = [
    {
      id: 'members' as TabType,
      label: 'Mitglieder',
      icon: Users,
      description: 'Mitglieder-Finanzen und Kontostände'
    },
    {
      id: 'payments' as TabType,
      label: 'Zahlläufe',
      icon: CreditCard,
      description: 'SEPA-Zahlläufe erstellen und verwalten'
    },
    {
      id: 'settings' as TabType,
      label: 'Einstellungen',
      icon: Settings,
      description: 'System-Konfiguration und SEPA-Setup'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Finanzen
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">BETA</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Finanz-Management, Mitgliederbeiträge und SEPA-Zahlläufe
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mitglieder</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offene Zahlungen</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.pendingPayments}</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt-Saldo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '-' : `${stats.monthlyRevenue.toFixed(2)}€`}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '-' : `${stats.successRate}%`}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'members' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Mitglieder-Verwaltung</h2>
              <p className="text-gray-600">
                Übersicht aller Payment-Mitglieder mit Kontosalden und Zahlungsstatus
              </p>
            </div>
            
            {/* Members Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Aktive Mitglieder</p>
                      <p className="text-xl font-bold text-gray-900">{stats.totalMembers}</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Durchschn. Saldo</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.totalMembers > 0 ? (stats.monthlyRevenue / stats.totalMembers).toFixed(2) : '0.00'}€
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Überfällige Konten</p>
                      <p className="text-xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">SEPA bereit</p>
                      <p className="text-xl font-bold text-gray-900">{stats.totalMembers}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Member Actions */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
                  Alle auswählen
                </button>
                <button className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
                  Filter
                </button>
                <button className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
                  Export
                </button>
                <button 
                  onClick={refreshMembers}
                  disabled={refreshing}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Aktualisiere...' : 'Aktualisieren'}
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                  Zahllauf erstellen
                </button>
                <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Neues Mitglied
                </button>
              </div>
            </div>

            {/* Members Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitglied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mitgliedsnummer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IBAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktueller Saldo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Lade Mitglieder...</span>
                          </div>
                        </td>
                      </tr>
                    ) : members.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="w-12 h-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Payment-Mitglieder</h3>
                            <p className="text-gray-500 mb-4">
                              Laden Sie PDFs hoch oder erstellen Sie manuell Mitglieder
                            </p>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setActiveTab('upload')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                PDF hochladen
                              </button>
                              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                Manuell erstellen
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const account = member.member_accounts?.[0];
                        const balance = account?.current_balance || 0;
                        const initials = `${member.first_name[0] || ''}${member.last_name[0] || ''}`.toUpperCase();
                        
                        return (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="rounded" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">{initials}</span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {member.first_name} {member.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">{member.email || 'Keine E-Mail'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.member_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.iban ? 
                                `${member.iban.slice(0, 4)} ${member.iban.slice(4, 8)} ${member.iban.slice(8, 12)} ${member.iban.slice(12)}` :
                                'Keine IBAN'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                balance >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {balance >= 0 ? '+' : ''}{balance.toFixed(2)}€
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {member.payment_groups?.name || 'Keine Gruppe'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Aktiv
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">Details</button>
                                <button className="text-green-600 hover:text-green-900">Zahlung</button>
                                <button className="text-gray-600 hover:text-gray-900">Bearbeiten</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Vorherige
                  </button>
                  <button className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Nächste
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Zeige <span className="font-medium">1</span> bis <span className="font-medium">10</span> von{' '}
                      <span className="font-medium">0</span> Ergebnissen
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        Vorherige
                      </button>
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        1
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        Nächste
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">SEPA-Zahlläufe</h2>
              <p className="text-gray-600">
                Erstellen und verwalten Sie SEPA-Zahlläufe für automatische Beitragseinzüge
              </p>
            </div>
            <Card>
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">SEPA Payment Runs</h3>
                <p className="text-gray-500 mb-4">
                  Wird in Phase 8 implementiert - SEPA XML Generation & Payment Processing
                </p>
                <div className="text-sm text-gray-400">
                  ✅ SEPA Library (better-sepa) installed<br />
                  ✅ Database Schema ready<br />
                  🚧 UI Implementation in progress
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">System-Einstellungen</h2>
              <p className="text-gray-600">
                SEPA-Konfiguration, Zahlungsgruppen und Studio-Settings
              </p>
            </div>
            <Card>
              <div className="p-8 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
                <p className="text-gray-500 mb-4">
                  Wird in Phase 9 implementiert - SEPA Setup & Studio Settings
                </p>
                <div className="text-sm text-gray-400">
                  ✅ Database Structure ready<br />
                  ✅ Default Payment Groups created<br />
                  🚧 Configuration UI in progress
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 