'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Activity, ChevronDown, ChevronUp, Eye, Edit, Trash2, BarChart } from 'lucide-react';
import CampaignTag from './CampaignTag';
import CampaignStatsCard from './CampaignStatsCard';
import CampaignDetailPanel from './CampaignDetailPanel';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Campaign, CampaignStats, CampaignTableProps } from '@/app/lib/types/campaign';

export default function CampaignTable({ onEdit, onDelete }: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignStats, setCampaignStats] = useState<{[key: string]: CampaignStats}>({});
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      setCampaigns(data || []);
      
      // Kampagnen-Statistiken laden
      if (data && data.length > 0) {
        await fetchCampaignStats(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kampagnen:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStats = async (campaigns: Campaign[]) => {
    const stats: {[key: string]: CampaignStats} = {};

    for (const campaign of campaigns) {
      try {
        // Leads für diese Kampagne zählen
        const { count: leadsCount, error: leadsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        if (leadsError) throw leadsError;

        // Konvertierte Leads zählen (Status 'converted')
        const { count: conversionsCount, error: conversionsError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'converted');

        if (conversionsError) throw conversionsError;

        const leads = leadsCount || 0;
        const conversions = conversionsCount || 0;
        const conversionRate = leads > 0 ? (conversions / leads) * 100 : 0;

        stats[campaign.id] = {
          leads,
          conversions,
          conversionRate
        };
      } catch (error) {
        console.error(`Fehler beim Laden der Statistiken für Kampagne ${campaign.id}:`, error);
        stats[campaign.id] = { leads: 0, conversions: 0, conversionRate: 0 };
      }
    }

    setCampaignStats(stats);
  };

  const toggleExpand = (id: string) => {
    setExpandedCampaigns(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleEdit = (campaign: Campaign) => {
    onEdit(campaign);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Kampagne löschen möchten?')) {
      onDelete(id);
    }
  };

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedCampaign(null);
  };

  if (loading) {
    return <div className="text-center py-8">Kampagnen werden geladen...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <p className="text-gray-500">Keine Kampagnen gefunden</p>
      </div>
    );
  }

  return (
    <div>
      {showDetailPanel && selectedCampaign ? (
        <CampaignDetailPanel 
          campaign={selectedCampaign} 
          onClose={closeDetailPanel} 
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold">Kampagnen ({campaigns.length})</h2>
          </div>
          
          <div>
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border-b border-gray-100 last:border-b-0">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(campaign.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Activity size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                      </div>
                      {campaign.channels && campaign.channels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {campaign.channels.map((channel, idx) => (
                            <span key={idx} className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {channel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <CampaignTag status={campaign.status} />
                    {expandedCampaigns.includes(campaign.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                {expandedCampaigns.includes(campaign.id) && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    {campaign.description && (
                      <div className="mb-4 text-gray-600">
                        <p>{campaign.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <CampaignStatsCard 
                        title="Leads" 
                        value={campaignStats[campaign.id]?.leads || 0} 
                        subtitle="Generierte Interessenten" 
                        icon={<BarChart size={18} className="text-blue-500" />} 
                      />
                      
                      <CampaignStatsCard 
                        title="Konvertiert" 
                        value={campaignStats[campaign.id]?.conversions || 0} 
                        subtitle="Abgeschlossene Verträge" 
                        icon={<BarChart size={18} className="text-green-500" />} 
                      />
                      
                      <CampaignStatsCard 
                        title="Conversion-Rate" 
                        value={`${campaignStats[campaign.id]?.conversionRate.toFixed(1) || 0}%`} 
                        subtitle="Abschlussquote" 
                        icon={<BarChart size={18} className="text-purple-500" />} 
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-2">
                      <button 
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(campaign);
                        }}
                      >
                        Details & Tabs
                      </button>
                      <button 
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(campaign);
                        }}
                      >
                        <Edit size={16} />
                        Bearbeiten
                      </button>
                      <button 
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(campaign.id);
                        }}
                      >
                        <Trash2 size={16} />
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 