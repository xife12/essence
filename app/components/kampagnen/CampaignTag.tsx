'use client';

import React from 'react';

interface CampaignTagProps {
  status: string;
}

export default function CampaignTag({ status }: CampaignTagProps) {
  let colorClasses = 'bg-gray-100 text-gray-800'; // Standard für unbekannte Status
  
  switch (status?.toLowerCase()) {
    case 'active':
    case 'aktiv':
      colorClasses = 'bg-green-100 text-green-800';
      break;
    case 'inactive':
    case 'inaktiv':
      colorClasses = 'bg-gray-100 text-gray-800';
      break;
    case 'planned':
    case 'geplant':
      colorClasses = 'bg-blue-100 text-blue-800';
      break;
    case 'completed':
    case 'abgeschlossen':
      colorClasses = 'bg-purple-100 text-purple-800';
      break;
  }

  // Lokalisierung des Status für die Anzeige
  let displayStatus = status;
  switch (status?.toLowerCase()) {
    case 'active':
      displayStatus = 'Aktiv';
      break;
    case 'inactive':
      displayStatus = 'Inaktiv';
      break;
    case 'planned':
      displayStatus = 'Geplant';
      break;
    case 'completed':
      displayStatus = 'Abgeschlossen';
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}>
      {displayStatus}
    </span>
  );
} 