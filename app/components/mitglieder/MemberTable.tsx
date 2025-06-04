'use client';

import React from 'react';
import { Edit, Phone, Mail, Calendar, Timer, Tag } from 'lucide-react';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Link from 'next/link';

export type Member = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  member_number?: string;
  created_at: string;
  membership?: {
    id: string;
    contract_type?: {
      id: string;
      name: string;
    };
    start_date: string;
    end_date: string;
    status: 'active' | 'cancelled';
  };
};

type MemberTableProps = {
  data: Member[];
  isLoading?: boolean;
  onEditMemberNumber?: (member: Member) => void;
};

export default function MemberTable({
  data,
  isLoading = false,
  onEditMemberNumber,
}: MemberTableProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateRemainingDays = (endDate?: string) => {
    if (!endDate) return null;
    
    const end = new Date(endDate);
    const today = new Date();
    
    // Set time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const differenceMs = end.getTime() - today.getTime();
    return Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
  };

  const getMembershipStatusBadge = (member: Member) => {
    if (!member.membership) {
      return <Badge variant="gray">Kein Vertrag</Badge>;
    }
    
    const { status, end_date } = member.membership;
    
    if (status === 'cancelled') {
      return <Badge variant="red">Gekündigt</Badge>;
    }
    
    const remainingDays = calculateRemainingDays(end_date);
    
    if (remainingDays === null) {
      return <Badge variant="gray">Unbekannt</Badge>;
    }
    
    if (remainingDays < 0) {
      return <Badge variant="red">Abgelaufen</Badge>;
    }
    
    if (remainingDays < 30) {
      return <Badge variant="red">Läuft ab ({remainingDays} Tage)</Badge>;
    }
    
    if (remainingDays < 90) {
      return <Badge variant="yellow">Demnächst ({remainingDays} Tage)</Badge>;
    }
    
    return <Badge variant="green">Aktiv</Badge>;
  };

  const columns = [
    {
      header: 'Name',
      accessor: (item: Member) => (
        <div>
          <div className="font-medium">{`${item.first_name} ${item.last_name}`}</div>
          {item.member_number && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Tag size={12} />
              <span>Nr. {item.member_number}</span>
              {onEditMemberNumber && (
                <button 
                  className="ml-1 text-blue-500 hover:text-blue-700" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMemberNumber(item);
                  }}
                >
                  <Edit size={12} />
                </button>
              )}
            </div>
          )}
          {!item.member_number && onEditMemberNumber && (
            <button 
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1" 
              onClick={(e) => {
                e.stopPropagation();
                onEditMemberNumber(item);
              }}
            >
              <Tag size={12} />
              <span>Mitgliedsnummer hinzufügen</span>
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Kontakt',
      accessor: (item: Member) => (
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
      header: 'Vertrag',
      accessor: (item: Member) => (
        <div>
          <div className="font-medium">
            {item.membership?.contract_type?.name || 'Kein Vertrag'}
          </div>
          {item.membership && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} />
              <span>
                {formatDate(item.membership.start_date)} - {formatDate(item.membership.end_date)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (item: Member) => getMembershipStatusBadge(item),
    },
    {
      header: 'Seit',
      accessor: (item: Member) => (
        <div className="flex items-center gap-1">
          <Timer size={14} className="text-gray-400" />
          <span>{formatDate(item.created_at)}</span>
        </div>
      ),
    },
    {
      header: 'Aktionen',
      accessor: (item: Member) => (
        <div className="flex justify-end">
          <Link href={`/mitglieder/${item.id}`}>
            <Button 
              variant="ghost" 
              size="sm"
              icon={<Edit size={16} />}
            >
              Details
            </Button>
          </Link>
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
      emptyMessage="Keine Mitglieder vorhanden"
    />
  );
} 