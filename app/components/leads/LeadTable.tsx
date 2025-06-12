'use client';

import React from 'react';
import { Edit, Phone, Mail, Info, Calendar } from 'lucide-react';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Link from 'next/link';
import { Lead } from '../../lib/api/forms';

type LeadTableProps = {
  data: Lead[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: Lead['status']) => void;
};

export default function LeadTable({
  data,
  isLoading = false,
  onStatusChange,
}: LeadTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return '-';
    
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    return timeStr 
      ? `${dateFormatted}, ${timeStr} Uhr` 
      : dateFormatted;
  };

  const getSourceLabel = (source?: string) => {
    const sourceMap: Record<string, string> = {
      social_media: 'Social Media',
      website: 'Webseite',
      referral: 'Empfehlung',
      walk_in: 'Walk-In',
      phone: 'Telefonisch',
      email: 'E-Mail',
      event: 'Veranstaltung',
      other: 'Sonstiges',
    };
    
    return source ? sourceMap[source] || source : '-';
  };

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = {
      open: { label: 'Offen', variant: 'blue' as const },
      contacted: { label: 'Kontaktiert', variant: 'purple' as const },
      appointment: { label: 'Terminiert', variant: 'yellow' as const },
      consultation: { label: 'In Beratung', variant: 'yellow' as const },
      converted: { label: 'Konvertiert', variant: 'green' as const },
      completed: { label: 'Abgeschlossen', variant: 'green' as const },
      lost: { label: 'Verloren', variant: 'red' as const },
    };
    
    const config = statusConfig[status];
    
    // Debug logging and fallback handling
    if (!config) {
      console.warn('⚠️ Unknown status in LeadTable:', status);
      return (
        <Badge variant="gray">
          {status || 'Unbekannt'}
        </Badge>
      );
    }
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Name',
      accessor: (item: Lead) => {
        const displayName = item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unbekannt';
        return (
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-xs text-gray-500">ID: {item.id.substring(0, 8)}</div>
            {item.is_test_lead && (
              <div className="text-xs text-amber-600 font-medium">🧪 Test</div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Kontakt',
      accessor: (item: Lead) => {
        const hasPhone = item.phone;
        const hasEmail = item.email;
        const contact = item.contact;
        
        return (
          <div className="space-y-1">
            {hasPhone && (
              <div className="flex items-center gap-1">
                <Phone size={14} className="text-gray-400" />
                <span>{hasPhone}</span>
              </div>
            )}
            {hasEmail && (
              <div className="flex items-center gap-1">
                <Mail size={14} className="text-gray-400" />
                <span>{hasEmail}</span>
              </div>
            )}
            {!hasPhone && !hasEmail && contact && (
              <div className="flex items-center gap-1">
                <span>{contact}</span>
              </div>
            )}
            {!hasPhone && !hasEmail && !contact && '-'}
          </div>
        );
      },
    },
    {
      header: 'Quelle',
      accessor: (item: Lead) => getSourceLabel(item.source),
    },
    {
      header: 'Kampagne',
      accessor: (item: Lead) => item.campaign?.name || '-',
    },
    {
      header: 'Status',
      accessor: (item: Lead) => getStatusBadge(item.status),
    },
    {
      header: 'Erstellt am',
      accessor: (item: Lead) => formatDate(item.created_at),
    },
    {
      header: 'Aktionen',
      accessor: (item: Lead) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            icon={<Edit size={16} />}
            onClick={() => onStatusChange && onStatusChange(item.id, item.status)}
          >
            Details
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Keine Leads vorhanden"
    />
  );
} 