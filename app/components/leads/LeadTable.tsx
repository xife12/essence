'use client';

import React from 'react';
import { Edit, Phone, Mail, Info, Calendar } from 'lucide-react';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Link from 'next/link';

export type Lead = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  source?: string;
  status: 'open' | 'consultation' | 'converted' | 'lost' | 'contacted' | 'appointment';
  campaign?: {
    id: string;
    name: string;
  };
  created_at: string;
  appointment_date?: string;
  appointment_time?: string;
  contact_attempts?: Array<{
    date: string;
    method: string;
    staff: string;
  }>;
};

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
    const statusConfig: Record<Lead['status'], { label: string; variant: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray' }> = {
      open: { label: 'Offen', variant: 'blue' },
      consultation: { label: 'In Beratung', variant: 'yellow' },
      converted: { label: 'Konvertiert', variant: 'green' },
      lost: { label: 'Verloren', variant: 'red' },
      contacted: { label: 'Kontaktiert', variant: 'purple' },
      appointment: { label: 'Terminiert', variant: 'yellow' },
    };
    
    const config = statusConfig[status];
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const columns = [
    {
      header: 'Name',
      accessor: (item: Lead) => (
        <div>
          <div className="font-medium">{`${item.first_name} ${item.last_name}`}</div>
          <div className="text-xs text-gray-500">ID: {item.id.substring(0, 8)}</div>
        </div>
      ),
    },
    {
      header: 'Kontakt',
      accessor: (item: Lead) => (
        <div className="space-y-1">
          {item.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} className="text-gray-400" />
              <span>{item.phone}</span>
            </div>
          )}
          {item.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} className="text-gray-400" />
              <span>{item.email}</span>
            </div>
          )}
          {!item.phone && !item.email && '-'}
        </div>
      ),
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