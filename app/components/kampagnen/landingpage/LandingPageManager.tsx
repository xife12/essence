'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Copy, Edit, Globe, Code, RefreshCw } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LandingPageEditor from './LandingPageEditor';

interface Campaign {
  id: string;
  name: string;
}

interface LandingPage {
  id: string;
  campaign_id: string;
  url_slug: string;
  template_type: string;
  headline: string;
  content: any; // JSON-Daten
  is_published: boolean;
  visits: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

interface LandingPageManagerProps {
  campaign: Campaign;
}

export default function LandingPageManager({ campaign }: LandingPageManagerProps) {
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchLandingPage();
  }, [campaign.id]);

  const fetchLandingPage = async () => {
    setLoading(true);
    try {
      // Prüfen ob die Tabelle existiert
      const { data: tableExists } = await supabase
        .from('landingpages')
        .select('id')
        .limit(1);
      
      // Wenn die Tabelle noch nicht existiert, zeigen wir keine Fehler an
      if (!tableExists) {
        setLandingPage(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('landingpages')
        .select('*')
        .eq('campaign_id', campaign.id)
        .maybeSingle();

      if (error) throw error;
      setLandingPage(data);
    } catch (error) {
      console.error('Fehler beim Laden der Landingpage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLandingPage = () => {
    setIsEditorOpen(true);
  };

  const handleEditLandingPage = () => {
    setIsEditorOpen(true);
  };

  const handleSaveLandingPage = async (pageData: Partial<LandingPage>) => {
    try {
      setLoading(true);
      
      if (landingPage) {
        // Update
        const { data, error } = await supabase
          .from('landingpages')
          .update({
            ...pageData,
            updated_at: new Date().toISOString()
          })
          .eq('id', landingPage.id)
          .select()
          .single();
          
        if (error) throw error;
        setLandingPage(data);
      } else {
        // Insert
        const { data, error } = await supabase
          .from('landingpages')
          .insert([{
            campaign_id: campaign.id,
            url_slug: `${campaign.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            ...pageData,
            is_published: false,
            visits: 0,
            conversions: 0
          }])
          .select()
          .single();
          
        if (error) throw error;
        setLandingPage(data);
      }
      
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Fehler beim Speichern der Landingpage:', error);
      alert('Fehler beim Speichern der Landingpage. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const copyLandingPageUrl = () => {
    if (!landingPage) return;
    
    const url = `${window.location.origin}/lp/${landingPage.url_slug}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('URL wurde in die Zwischenablage kopiert!');
      })
      .catch((err) => {
        console.error('Fehler beim Kopieren:', err);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Landingpage</h3>
        {!landingPage ? (
          <button 
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2"
            onClick={handleCreateLandingPage}
          >
            <Plus size={16} />
            Landingpage erstellen
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center gap-2"
              onClick={copyLandingPageUrl}
            >
              <Copy size={16} />
              URL kopieren
            </button>
            <button 
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2"
              onClick={handleEditLandingPage}
            >
              <Edit size={16} />
              Bearbeiten
            </button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Landingpage wird geladen...</p>
        </div>
      ) : !landingPage ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Globe size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500">Keine Landingpage für diese Kampagne gefunden.</p>
          <p className="mt-2 text-sm text-gray-500">Erstellen Sie eine Landingpage, um Besucher zu konvertieren.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm inline-flex items-center gap-2"
            onClick={handleCreateLandingPage}
          >
            <Plus size={16} />
            Landingpage erstellen
          </button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{landingPage.headline || 'Landingpage'}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="inline-flex items-center mr-3">
                    <Code size={14} className="mr-1" />
                    Template: {landingPage.template_type || 'Standard'}
                  </span>
                  <span className="inline-flex items-center">
                    <Globe size={14} className="mr-1" />
                    /{landingPage.url_slug}
                  </span>
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  landingPage.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {landingPage.is_published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <h5 className="text-sm font-medium text-gray-500 mb-1">Besucher</h5>
                <p className="text-2xl font-bold">{landingPage.visits || 0}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <h5 className="text-sm font-medium text-gray-500 mb-1">Conversions</h5>
                <p className="text-2xl font-bold">{landingPage.conversions || 0}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <h5 className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</h5>
                <p className="text-2xl font-bold">
                  {landingPage.visits 
                    ? ((landingPage.conversions / landingPage.visits) * 100).toFixed(1) 
                    : '0.0'}%
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">Vorschau</h5>
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <div className="relative pb-[56.25%] overflow-hidden rounded bg-white">
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src={`/api/landingpage-preview?id=${landingPage.id}`}
                    title="Landingpage Vorschau"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && (
        <LandingPageEditor 
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          campaignId={campaign.id}
          landingPage={landingPage}
          onSave={handleSaveLandingPage}
        />
      )}
    </div>
  );
} 