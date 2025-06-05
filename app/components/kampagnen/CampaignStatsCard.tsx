'use client';

import React, { ReactElement } from 'react';

interface CampaignStatsCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon?: ReactElement;
}

export default function CampaignStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon 
}: CampaignStatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
} 