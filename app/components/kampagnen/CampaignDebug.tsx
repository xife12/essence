'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CampaignDebug() {
  const [result, setResult] = useState<string>('');
  const [authInfo, setAuthInfo] = useState<string>('Prüfe Authentifizierung...');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Prüfe, ob der Benutzer angemeldet ist
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setAuthInfo(`Auth-Fehler: ${sessionError.message}`);
        return;
      }
      
      if (!sessionData.session) {
        setAuthInfo('Nicht angemeldet! Benutzer muss angemeldet sein.');
        return;
      }
      
      // Prüfe Benutzerrolle
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        setAuthInfo(`Benutzer-Fehler: ${userError.message}`);
        return;
      }
      
      // Prüfe, ob Benutzer in staff-Tabelle existiert
      const userId = userData.user?.id;
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (staffError) {
        if (staffError.code === 'PGRST116') {
          setAuthInfo(`Benutzer ist angemeldet (${userId}), aber nicht in der staff-Tabelle.`);
        } else {
          setAuthInfo(`Staff-Fehler: ${staffError.message}`);
        }
        return;
      }
      
      setAuthInfo(`Angemeldet als ${staffData.rolle} (User ID: ${userId})`);
    } catch (error) {
      setAuthInfo(`Unerwarteter Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const createBasicCampaign = async () => {
    setLoading(true);
    try {
      // Einfache Kampagne ohne komplexe Datentypen
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            name: 'Debug Kampagne',
            description: 'Test-Kampagne zur Fehlerdiagnose',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'aktiv',
            campaign_type: 'test',
            target_group: 'Debugging',
            bonus_period: '14', // einfacher String
            channels: ['test'], // einfaches Array
            contract_type_ids: [] // leeres Array
          }
        ])
        .select();
        
      if (error) {
        console.error('Fehler:', error);
        setResult(`Fehler: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('Erfolg:', data);
        setResult(`Erfolg: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      console.error('Exception:', err);
      setResult(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkPolicies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_campaigns_policies');
      
      if (error) {
        setResult(`Policy-Prüfung fehlgeschlagen: ${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(`Policy-Ergebnis: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setResult(`Policy-Fehler: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border border-red-500 bg-red-50 rounded-md mb-6">
      <h3 className="text-lg font-bold mb-2">Kampagnen-Debug</h3>
      
      <div className="mb-4 p-3 bg-white border border-gray-300 rounded-md">
        <p className="font-bold">Authentifizierung:</p>
        <p className="text-sm">{authInfo}</p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={createBasicCampaign}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {loading ? 'Wird erstellt...' : 'Test-Kampagne erstellen'}
        </button>

        <button
          onClick={checkPolicies}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          RLS-Policies prüfen
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-3 bg-white border border-gray-300 rounded-md overflow-auto max-h-64">
          <pre className="text-xs">{result}</pre>
        </div>
      )}

      <div className="mt-4 p-3 bg-white border border-gray-300 rounded-md">
        <p className="font-bold mb-2">Anleitung zur manuellen RLS-Korrektur:</p>
        <ol className="text-xs list-decimal pl-4 space-y-1">
          <li>Öffne die Supabase-Konsole</li>
          <li>Gehe zu "Authentication" → "Policies"</li>
          <li>Suche nach der Tabelle "campaigns"</li>
          <li>Füge neue Policies hinzu für: INSERT, UPDATE, DELETE</li>
          <li>Verwende als Bedingung: <code>auth.role() = 'authenticated'</code></li>
        </ol>
      </div>
    </div>
  );
} 