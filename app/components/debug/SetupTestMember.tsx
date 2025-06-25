'use client';

import { useState } from 'react';

export default function SetupTestMember() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const setupTestMember = async () => {
    if (loading) return; // Prevent double-clicks
    
    setLoading(true);
    setResult('🔧 Erstelle Test-Mitglied über API...');

    try {
      const response = await fetch('/api/setup-test-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult('✅ Test-Mitglied und Mitgliedschaften erfolgreich erstellt!');
        console.log('✅ Setup erfolgreich abgeschlossen');
      } else {
        setResult(`❌ Fehler: ${data.error}\nDetails: ${data.details || 'Keine Details verfügbar'}`);
        console.error('❌ Setup Fehler:', data);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult(`❌ Unerwarteter Fehler: ${errorMessage}`);
      console.error('❌ Setup Fehler:', error);
    }

    setLoading(false);
  };

  const testAPI = async () => {
    setResult('🔧 Teste API...');
    try {
      const response = await fetch('/api/members/550e8400-e29b-41d4-a716-446655440000/memberships');
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setResult(`✅ API Test erfolgreich: ${data.length} Mitgliedschaft(en) gefunden`);
      } else if (Array.isArray(data)) {
        setResult(`⚠️ API Test: Keine Mitgliedschaften gefunden (leeres Array)`);
      } else {
        setResult(`❌ API Test: Unerwartete Antwort: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ API Test Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const resetData = async () => {
    setResult('🔧 Lösche Test-Daten über API...');
    try {
      const response = await fetch('/api/setup-test-member', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult('✅ Test-Daten erfolgreich gelöscht!');
      } else {
        setResult(`❌ Fehler beim Löschen: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Lösch-Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔧 Test-Mitglied Setup</h3>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={setupTestMember}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Wird erstellt...' : 'Test-Mitglied erstellen'}
        </button>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          API testen
        </button>

        <button
          onClick={resetData}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Daten löschen
        </button>
      </div>

      {result && (
        <div className="p-3 bg-white border rounded">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
} 