'use client';

import React, { useState } from 'react';
import BeitragskontoTable from '../components/payment-system/BeitragskontoTable';
import BeitragskontoHeader from '../components/payment-system/BeitragskontoHeader';
import { MemberPaymentCard } from '../components/payment-system/MemberPaymentCard';
import BeitragskalenderView from '../components/payment-system/BeitragskalenderView';

export default function TestAdminFunctionsPage() {
  const [selectedTest, setSelectedTest] = useState('beitragskonto-table');
  
  // Mock Member ID für Testing
  const TEST_MEMBER_ID = "test-member-123";
  const TEST_MEMBER_NAME = "Max Mustermann";

  const renderTestComponent = () => {
    switch (selectedTest) {
      case 'beitragskonto-table':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 BeitragskontoTable - Mit Edit/Delete Buttons</h3>
              <p className="text-blue-700 text-sm">
                Suchen Sie nach der <strong>neuen "Aktionen" Spalte</strong> ganz rechts in der Tabelle.
                Klicken Sie auf die <strong>⋮ (3-Punkte) Buttons</strong> um Edit/Delete-Menüs zu öffnen.
              </p>
            </div>
            <BeitragskontoTable 
              memberId={TEST_MEMBER_ID}
              showHistorical={true}
              maxRows={10}
            />
          </div>
        );
        
      case 'beitragskonto-header':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">🔧 BeitragskontoHeader - Action Buttons</h3>
              <p className="text-green-700 text-sm">
                Schauen Sie nach den <strong>3 neuen Buttons</strong> am unteren Rand:
                <br />• "Zahlung hinzufügen" • "Korrektur buchen" • "Stilllegung verwalten"
              </p>
            </div>
            <BeitragskontoHeader 
              memberId={TEST_MEMBER_ID}
              memberName={TEST_MEMBER_NAME}
              showActions={true}
            />
          </div>
        );
        
      case 'member-payment-card':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🔧 MemberPaymentCard - Edit Buttons</h3>
              <p className="text-purple-700 text-sm">
                Suchen Sie nach den <strong>✏️ Edit-Buttons</strong> neben "Payment-Gruppe" und "IBAN" 
                in der kompakten 3-Spalten Ansicht im oberen Bereich.
              </p>
            </div>
            <MemberPaymentCard 
              memberId={TEST_MEMBER_ID}
              memberName={TEST_MEMBER_NAME}
            />
          </div>
        );
        
      case 'beitragskalender-view':
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">🔧 BeitragskalenderView - Edit/Delete</h3>
              <p className="text-orange-700 text-sm">
                Mit <strong>showAdminControls=true</strong> erscheinen "Bearbeiten" und "Löschen" Buttons 
                in der rechten "Aktionen" Spalte jeder Zeile.
              </p>
            </div>
            <BeitragskalenderView 
              memberId={TEST_MEMBER_ID}
              showAdminControls={true}
              compact={false}
            />
          </div>
        );
        
      default:
        return <div>Test nicht gefunden</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Admin Functions Test Page
          </h1>
          <p className="text-gray-600">
            Diese Seite zeigt alle implementierten Admin-Funktionen. 
            Wählen Sie eine Komponente aus, um die neuen Features zu testen.
          </p>
        </div>

        {/* Test Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test-Komponenten wählen:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <button
                onClick={() => setSelectedTest('beitragskonto-table')}
                className={`p-4 rounded-lg border text-left ${
                  selectedTest === 'beitragskonto-table'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">BeitragskontoTable</div>
                <div className="text-sm text-gray-600">Edit/Delete per Zeile</div>
              </button>

              <button
                onClick={() => setSelectedTest('beitragskonto-header')}
                className={`p-4 rounded-lg border text-left ${
                  selectedTest === 'beitragskonto-header'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">BeitragskontoHeader</div>
                <div className="text-sm text-gray-600">Action Buttons</div>
              </button>

              <button
                onClick={() => setSelectedTest('member-payment-card')}
                className={`p-4 rounded-lg border text-left ${
                  selectedTest === 'member-payment-card'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">MemberPaymentCard</div>
                <div className="text-sm text-gray-600">Payment Edit Buttons</div>
              </button>

              <button
                onClick={() => setSelectedTest('beitragskalender-view')}
                className={`p-4 rounded-lg border text-left ${
                  selectedTest === 'beitragskalender-view'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">BeitragskalenderView</div>
                <div className="text-sm text-gray-600">Calendar Edit/Delete</div>
              </button>
            </div>
          </div>
        </div>

        {/* Active Test Component */}
        <div className="space-y-6">
          {renderTestComponent()}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-3">💡 Was Sie testen sollten:</h3>
          <div className="space-y-2 text-yellow-700">
            <div>• <strong>BeitragskontoTable:</strong> Klicken Sie auf ⋮ → "Bearbeiten" oder "Löschen"</div>
            <div>• <strong>BeitragskontoHeader:</strong> Klicken Sie auf "Zahlung hinzufügen", "Korrektur buchen", "Stilllegung verwalten"</div>
            <div>• <strong>MemberPaymentCard:</strong> Klicken Sie auf ✏️ neben Payment-Gruppe oder IBAN</div>
            <div>• <strong>BeitragskalenderView:</strong> Klicken Sie auf "Bearbeiten" oder "Löschen" in der Tabelle</div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">✅ Implementierungsstatus:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>BeitragManagementModal (Edit/Storno/Reduce)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>PaymentEditModals (IBAN/Payment-Gruppe)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>BeitragsHeaderActionModals (Add/Correct/Suspend)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Aktions-Spalten in allen Tabellen</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Modal-Integration & Error-Handling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">🔄</span>
                <span>API-Calls (momentan Console-Logs)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 