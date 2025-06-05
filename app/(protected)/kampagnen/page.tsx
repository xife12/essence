'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CampaignTable from '@/app/components/kampagnen/CampaignTable';
import CampaignModal from '@/app/components/kampagnen/CampaignModal';
import CampaignDebug from '@/app/components/kampagnen/CampaignDebug';

interface Campaign {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  campaign_type: string;
  target_group: string;
  bonus_period?: string;
  channels: string[];
  contract_type_ids: string[];
}

export default function KampagnenPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kampagnen:', error);
      alert('Fehler beim Laden der Kampagnen. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setIsModalOpen(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diese Kampagne löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Kampagne aus der lokalen Liste entfernen
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen der Kampagne:', error);
      alert('Fehler beim Löschen der Kampagne. Bitte versuchen Sie es später erneut.');
    }
  };

  const handleSaveCampaign = async (campaign: Campaign) => {
    try {
      console.log("Speichere Kampagne:", campaign);
      
      // Bonus-Periode als Intervall formatieren, wenn vorhanden
      let bonusPeriod = null;
      if (campaign.bonus_period) {
        bonusPeriod = `${campaign.bonus_period}`;
        console.log("Formatierte Bonus-Periode:", bonusPeriod);
      }

      // Prüfen, ob channels ein Array ist
      const channels = Array.isArray(campaign.channels) ? campaign.channels : [];
      console.log("Kanäle:", channels);
      
      // Prüfen, ob contract_type_ids ein Array ist
      const contractTypeIds = Array.isArray(campaign.contract_type_ids) ? campaign.contract_type_ids : [];
      console.log("Vertragsarten-IDs:", contractTypeIds);

      // Wenn es eine neue Kampagne ist (kein ID)
      if (!campaign.id) {
        console.log("Erstelle neue Kampagne...");
        const { data, error } = await supabase
          .from('campaigns')
          .insert([
            { 
              ...campaign,
              bonus_period: bonusPeriod,
              channels: channels,
              contract_type_ids: contractTypeIds
            }
          ])
          .select();

        if (error) {
          console.error("Supabase Fehler:", error);
          throw error;
        }
        
        console.log("Neue Kampagne erstellt:", data);
        // Kampagnenliste aktualisieren
        setCampaigns((prev) => [data[0], ...prev]);
      } 
      // Bestehende Kampagne aktualisieren
      else {
        console.log("Aktualisiere bestehende Kampagne...");
        const { data, error } = await supabase
          .from('campaigns')
          .update({ 
            ...campaign,
            bonus_period: bonusPeriod,
            channels: channels,
            contract_type_ids: contractTypeIds
          })
          .eq('id', campaign.id)
          .select();

        if (error) {
          console.error("Supabase Fehler:", error);
          throw error;
        }
        
        console.log("Kampagne aktualisiert:", data);
        // Kampagnenliste aktualisieren
        setCampaigns((prev) => 
          prev.map((c) => (c.id === campaign.id ? data[0] : c))
        );
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Kampagne:', error);
      throw error;
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kampagnen</h1>
          <p className="text-gray-500 mt-1">Marketing und Werbemaßnahmen</p>
        </div>
        <button 
          className="btn flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          onClick={handleCreateCampaign}
        >
          <Plus size={18} />
          <span>Neue Kampagne</span>
        </button>
      </div>

      <CampaignDebug />
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Kampagnen werden geladen...</p>
        </div>
      ) : (
        <CampaignTable 
          onEdit={handleEditCampaign} 
          onDelete={handleDeleteCampaign} 
        />
      )}

      <CampaignModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSave={handleSaveCampaign}
      />
    </div>
  );
} 