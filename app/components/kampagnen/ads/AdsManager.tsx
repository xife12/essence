'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, DollarSign, Image, BarChart2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AdCreationModal from './AdCreationModal';
import FacebookAuthButton from './FacebookAuthButton';

interface Campaign {
  id: string;
  name: string;
}

interface Ad {
  id: string;
  campaign_id: string;
  title: string;
  status: string;
  reach?: number;
  cpl?: number;
  clicks?: number;
  created_at: string;
}

interface AdsManagerProps {
  campaign: Campaign;
}

export default function AdsManager({ campaign }: AdsManagerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasFacebookConnection, setHasFacebookConnection] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAds();
    checkFacebookConnection();
  }, [campaign.id]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      // Prüfen ob die Tabelle existiert
      const { data: tableExists } = await supabase
        .from('ads')
        .select('id')
        .limit(1);
      
      // Wenn die Tabelle noch nicht existiert, zeigen wir keine Fehler an
      if (!tableExists) {
        setAds([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Werbeanzeigen:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFacebookConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('*')
        .eq('provider', 'facebook')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Prüfen ob der Token noch gültig ist
        const expiresAt = new Date(data.expires_at);
        if (expiresAt > new Date()) {
          setHasFacebookConnection(true);
        }
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der Facebook-Verbindung:', error);
    }
  };

  const handleCreateAd = () => {
    if (!hasFacebookConnection) {
      alert('Bitte verbinde zuerst dein Facebook-Konto, um Anzeigen zu erstellen.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleAdCreated = (newAd: Ad) => {
    setAds(prev => [newAd, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Werbeanzeigen</h3>
        <button 
          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2"
          onClick={handleCreateAd}
        >
          <Plus size={16} />
          Neue Anzeige
        </button>
      </div>
      
      {/* Facebook-Verbindungsstatus */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-medium">Facebook Ads Verbindung</h4>
            <p className="text-sm text-gray-600 mt-1">
              Verbinde dein Facebook-Konto, um Werbeanzeigen direkt aus MemberCore zu erstellen und zu verwalten.
            </p>
          </div>
          <FacebookAuthButton />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Werbeanzeigen werden geladen...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BarChart2 size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500">Keine Werbeanzeigen für diese Kampagne gefunden.</p>
          <p className="mt-2 text-sm text-gray-500">Erstellen Sie eine neue Anzeige, um Ihre Kampagne zu bewerben.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm inline-flex items-center gap-2"
            onClick={handleCreateAd}
            disabled={!hasFacebookConnection}
          >
            <Plus size={16} />
            Erste Anzeige erstellen
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    <span>Reichweite</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>CPL</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klicks
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{ad.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ad.status === 'active' ? 'bg-green-100 text-green-800' :
                      ad.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.status === 'active' ? 'Aktiv' : 
                       ad.status === 'paused' ? 'Pausiert' : 'Entwurf'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ad.reach ? ad.reach.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ad.cpl ? `${ad.cpl.toFixed(2)} €` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ad.clicks ? ad.clicks.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Bearbeiten
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <AdCreationModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaignId={campaign.id}
          onAdCreated={handleAdCreated}
        />
      )}
    </div>
  );
} 