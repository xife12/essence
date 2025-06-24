'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle, Download, Filter, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DualPDFUploadForm } from '@/app/components/payment-system/DualPDFUploadForm';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Badge from '@/app/components/ui/Badge';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
import type { PaymentMember } from '@/app/lib/types/payment-system';

interface ImportStats {
  todayImports: number;
  totalMembers: number;
  totalBalance: number;
  successRate: number;
  dualImports: number;
}

export default function DualMemberImportPage() {
  const [importStats, setImportStats] = useState<ImportStats>({
    todayImports: 0,
    totalMembers: 0,
    totalBalance: 0,
    successRate: 100,
    dualImports: 0
  });
  const [recentImports, setRecentImports] = useState<PaymentMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const api = new PaymentSystemAPI();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load Payment Statistics
      const paymentMembersResult = await api.getPaymentMembers();
      
      if (paymentMembersResult.success && paymentMembersResult.data) {
        const members = paymentMembersResult.data;
        
        // Calculate statistics
        const todayImports = members.filter(m => 
          new Date(m.created_at).toDateString() === new Date().toDateString()
        ).length;
        
        const totalBalance = members.reduce((sum, member) => {
          // @ts-ignore - member_accounts relation from query
          return sum + (member.member_accounts?.[0]?.current_balance || 0);
        }, 0);

        setImportStats({
          todayImports,
          totalMembers: members.length,
          totalBalance,
          successRate: 100, // TODO: Calculate from import history
          dualImports: members.length // TODO: Filter for dual imports
        });

        // Set recent imports (last 10)
        setRecentImports(members.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSuccess = () => {
    loadDashboardData(); // Refresh statistics
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/mitglieder" className="hover:text-gray-700">
            <Users className="w-4 h-4 inline mr-1" />
            Mitglieder
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Dual-Import Dashboard</span>
        </div>
        
        <Link href="/mitglieder">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zu Mitglieder
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Dual-Import: Mitgliedschaft + Kontoauszug
          </h1>
          <p className="text-gray-600">
            Vollautomatischer Import mit Mitgliedschaftsvertrag und Beitragskonto-Analyse
          </p>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Heute importiert</p>
                <p className="text-2xl font-bold text-gray-900">{importStats.todayImports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Mitglieder</p>
                <p className="text-2xl font-bold text-gray-900">{importStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt-Saldo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {importStats.totalBalance.toLocaleString('de-DE', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Dual-Imports</p>
                <p className="text-2xl font-bold text-gray-900">{importStats.dualImports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold text-gray-900">{importStats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Neuer Dual-Import</CardTitle>
              <CardDescription>
                Laden Sie Mitgliedschaftsvertrag und Kontoauszug gleichzeitig hoch für vollautomatische Verarbeitung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DualPDFUploadForm onUploadSuccess={handleImportSuccess} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Imports Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import-Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Heute erfolgreich:</span>
                  <Badge variant="green">{importStats.todayImports}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Erfolgsrate:</span>
                  <Badge variant="green">{importStats.successRate}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dual-Import Modus:</span>
                  <Badge variant="blue">Aktiv</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Imports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Letzte Importe</CardTitle>
              <CardDescription>
                Die 10 zuletzt importierten Mitglieder
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Lade Daten...</p>
                </div>
              ) : recentImports.length > 0 ? (
                <div className="space-y-3">
                  {recentImports.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.member_number} • {member.email || 'Keine E-Mail'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Importiert: {new Date(member.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="green">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktiv
                        </Badge>
                        {member.iban && (
                          <p className="text-xs text-gray-400">SEPA: ✓</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Importe vorhanden</p>
                  <p className="text-sm">Starten Sie den ersten Dual-Import</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dual-Import Vorteile</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Vollständige Datenerfassung aus beiden Dokumenten
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Automatische Beitragskonto-Analyse
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Intelligente Mitgliedschafts-Zuordnung
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Automatische Beitragskalender-Generierung
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Sichere Dokumenten-Ablage
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow-Übersicht: 7-Schritt Dual-Import</CardTitle>
          <CardDescription>
            Vollautomatischer Import-Prozess mit manuellen Bestätigungsschritten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[
              { step: 1, title: 'Dual-Upload', desc: 'Vertrag + Kontoauszug' },
              { step: 2, title: 'Extraktion', desc: 'Parallele PDF-Analyse' },
              { step: 3, title: 'Bestätigung', desc: 'Daten überprüfen' },
              { step: 4, title: 'Beitragskonto', desc: 'Saldo & Besonderheiten' },
              { step: 5, title: 'Mitgliedschaft', desc: 'Vertragsart zuordnen' },
              { step: 6, title: 'Lastschrift', desc: 'Payment Group wählen' },
              { step: 7, title: 'Import', desc: 'Finalisierung' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-2">
                  {item.step}
                </div>
                <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 