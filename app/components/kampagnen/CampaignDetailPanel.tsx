'use client';

import React, { useState } from 'react';
import { LayoutGrid, Globe, FileText } from 'lucide-react';
import AdsManager from './ads/AdsManager';
import LandingPageManager from './landingpage/LandingPageManager';
import ContentPlanner from './content/ContentPlanner';

interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  campaign_type?: string;
  target_group?: string;
  channels?: string[];
  contract_type_ids?: string[];
}

interface CampaignDetailPanelProps {
  campaign: Campaign;
  onClose: () => void;
}

export default function CampaignDetailPanel({ campaign, onClose }: CampaignDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'ads' | 'landingpage' | 'content'>('ads');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{campaign.name}</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'ads' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('ads')}
        >
          <LayoutGrid size={16} />
          Werbeanzeigen
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'landingpage' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('landingpage')}
        >
          <Globe size={16} />
          Landingpage
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
            activeTab === 'content' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('content')}
        >
          <FileText size={16} />
          Contentplanung
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'ads' && <AdsManager campaign={campaign} />}
        {activeTab === 'landingpage' && <LandingPageManager campaign={campaign} />}
        {activeTab === 'content' && <ContentPlanner campaign={campaign} />}
      </div>
    </div>
  );
} 