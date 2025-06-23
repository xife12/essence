'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle, Download, Filter, Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PDFUploadForm } from '@/app/components/payment-system/PDFUploadForm';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import Badge from '@/app/components/ui/Badge';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
import type { PaymentMember, BulkImportResult } from '@/app/lib/types/payment-system';

interface ImportStats {
  todayImports: number;
  totalMembers: number;
  totalBalance: number;
  pendingImports: number;
  errorRate: number;
}

export default function MemberPDFUploadPage() {
  const [importStats, setImportStats] = useState<ImportStats>({
    todayImports: 0,
    totalMembers: 0,
    totalBalance: 0,
    pendingImports: 0,
    errorRate: 0
  });
  const [recentImports, setRecentImports] = useState<PaymentMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [importHistory, setImportHistory] = useState<BulkImportResult[]>([]);

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
          pendingImports: 0, // TODO: Implement pending imports
          errorRate: 0 // TODO: Calculate from import history
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

  const handleBulkImportComplete = (result: BulkImportResult) => {
    setImportHistory(prev => [result, ...prev]);
    loadDashboardData(); // Refresh statistics
  };

  const exportImportLog = () => {
    // TODO: Implement CSV export of import history
    console.log('Exporting import log...');
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
          <span className="text-gray-900 font-medium">PDF-Import Dashboard</span>
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
            Mitglieder PDF-Import Dashboard
          </h1>
          <p className="text-gray-600">
            Automatische Mitglieder-Erstellung aus Magicline-PDFs mit Statistics und Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            icon={<Filter size={16} />}
          >
            {showAdvancedSettings ? 'Ausblenden' : 'Erweiterte Einstellungen'}
          </Button>
          <Button
            variant="outline"
            onClick={exportImportLog}
            icon={<Download size={16} />}
          >
            Import-Log exportieren
          </Button>
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
                <p className="text-sm font-medium text-gray-600">Ausstehend</p>
                <p className="text-2xl font-bold text-gray-900">{importStats.pendingImports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold text-gray-900">{(100 - importStats.errorRate).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings Panel */}
      {showAdvancedSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Erweiterte Import-Einstellungen</CardTitle>
            <CardDescription>
              Konfiguration für automatische Verarbeitung und Fehlerbehandlung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-Import</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="manual">Manuell bestätigen</option>
                  <option value="auto">Automatisch importieren</option>
                  <option value="review">Bei Unsicherheit nachfragen</option>
                </select>
                <p className="text-xs text-gray-500">Wie sollen extrahierte Daten verarbeitet werden?</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duplikat-Behandlung</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="skip">Überspringen</option>
                  <option value="update">Aktualisieren</option>
                  <option value="ask">Nachfragen</option>
                </select>
                <p className="text-xs text-gray-500">Verhalten bei bereits existierenden Mitgliedern</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Konfidenz-Schwelle</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="0.8">80% (Sehr sicher)</option>
                  <option value="0.6">60% (Standard)</option>
                  <option value="0.4">40% (Aggressiv)</option>
                </select>
                <p className="text-xs text-gray-500">Mindest-Genauigkeit für automatischen Import</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Upload Component */}
      <PDFUploadForm />

      {/* Recent Imports & Import History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Letzte Importe</CardTitle>
            <CardDescription>
              Die zuletzt importierten Mitglieder (Top 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
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
                <p className="text-sm">Laden Sie PDFs hoch, um zu starten</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import-Verlauf</CardTitle>
            <CardDescription>
              Übersicht über Batch-Import-Vorgänge
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importHistory.length > 0 ? (
              <div className="space-y-3">
                {importHistory.slice(0, 10).map((batch, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        Batch #{index + 1} • {new Date().toLocaleDateString('de-DE')}
                      </p>
                      <Badge variant={batch.errorCount > 0 ? 'yellow' : 'green'}>
                        {batch.successCount}/{batch.successCount + batch.errorCount}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 grid grid-cols-3 gap-2">
                      <span>✓ {batch.summary.newMembers} neu</span>
                      <span>⟲ {batch.summary.updatedAccounts} aktualisiert</span>
                      <span>⊘ {batch.summary.skippedFiles} übersprungen</span>
                    </div>
                    {batch.errorCount > 0 && (
                      <div className="mt-2 text-sm text-red-600">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {batch.errorCount} Fehler aufgetreten
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Noch keine Batch-Importe</p>
                <p className="text-sm">Historie wird nach dem ersten Import angezeigt</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Unterstützte Dateiformate & Features</CardTitle>
          <CardDescription>
            Übersicht über PDF-Verarbeitung und automatische Extraktion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Magicline-Verträge</h4>
                  <p className="text-sm text-gray-600">
                    Automatische Extraktion von Name, IBAN, Vertragsdaten, Startdatum und Tarif-Informationen
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="blue">PDF-Analyse</Badge>
                    <Badge variant="blue">OCR</Badge>
                    <Badge variant="blue">SEPA-Daten</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Magicline-Kontoauszüge</h4>
                  <p className="text-sm text-gray-600">
                    Mitgliedsnummer, aktueller Kontostand und vollständige Transaktionshistorie
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="purple">Saldo-Extraktion</Badge>
                    <Badge variant="purple">Transaction-Log</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  🚀 7-Schritt-Automatisierung
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>1. Upload → 2. PDF-Analyse → 3. Datenextraktion</p>
                  <p>4. Validation → 5. Korrektur → 6. Vertrags-Matching</p>
                  <p>7. Automatischer Import ins Payment-System</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  ✨ Smart Features
                </h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Automatische Duplikat-Erkennung</p>
                  <p>• Intelligente Vertrags-Zuordnung</p>
                  <p>• Bulk-Upload mit Batch-Processing</p>
                  <p>• Konfidenz-basierte Validation</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 