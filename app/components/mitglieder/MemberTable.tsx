'use client';

import React from 'react';
import { Edit, Phone, Mail, Calendar, Timer, Tag, Clock, Info } from 'lucide-react';
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
    status: 'active' | 'cancelled' | 'completed' | 'suspended' | 'planned';
  };
};

type MemberTableProps = {
  data: Member[];
  isLoading?: boolean;
  onEditMemberNumber?: (member: Member) => void;
  showStatusBadges?: boolean;
};

type BadgeVariant = 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray';

export default function MemberTable({
  data,
  isLoading = false,
  onEditMemberNumber,
  showStatusBadges = false,
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
    
    const { status, end_date, start_date } = member.membership;
    
    if (status === 'cancelled') {
      return <Badge variant="red">Gekündigt</Badge>;
    }

    if (status === 'suspended') {
      return <Badge variant="yellow">Stillgelegt</Badge>;
    }

    if (status === 'completed' || status === 'active' && calculateRemainingDays(end_date) < 0) {
      return <Badge variant="gray">Abgelaufen</Badge>;
    }
    
    if (status === 'planned') {
      // Berechne Tage bis zum Vertragsstart
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);
      
      const daysUntilStart = Math.ceil(
        (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return <Badge variant="blue">Geplant (in {daysUntilStart} Tagen)</Badge>;
    }
    
    // Ab hier nur noch für aktive Verträge
    const remainingDays = calculateRemainingDays(end_date);
    
    if (remainingDays === null) {
      return <Badge variant="gray">Unbekannt</Badge>;
    }
    
    if (remainingDays < 30) {
      return <Badge variant="red">Läuft ab ({remainingDays} Tage)</Badge>;
    }
    
    if (remainingDays < 90) {
      return <Badge variant="yellow">Demnächst ({remainingDays} Tage)</Badge>;
    }
    
    return <Badge variant="green">Aktiv</Badge>;
  };

  const getRemainingDaysBadge = (membership?: Member['membership']) => {
    if (!membership) return null;
    
    // Berechne die verbleibenden Tage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(membership.end_date);
    endDate.setHours(0, 0, 0, 0);
    
    // Differenz in Millisekunden
    const diffMs = endDate.getTime() - today.getTime();
    
    // Umrechnen in Tage
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    // Berechne die Gesamtlaufzeit in Tagen
    const startDate = new Date(membership.start_date);
    startDate.setHours(0, 0, 0, 0);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Berechne den Prozentsatz der verbleibenden Laufzeit
    const remainingPercentage = (remainingDays / totalDays) * 100;
    
    // Standardmäßig 30 Tage für Kündigungsfrist
    const noticeThreshold = 30;
    
    // Bestimme die Farbe basierend auf den Regeln
    let color: BadgeVariant = 'green';
    let tooltip = 'Mehr als 50% der Laufzeit verbleibend';
    
    if (remainingDays <= noticeThreshold) {
      color = 'red';
      tooltip = 'Innerhalb der Kündigungsfrist';
    } else if (remainingPercentage < 50) {
      color = 'yellow';
      tooltip = 'Weniger als 50% der Laufzeit verbleibend';
    }
    
    return (
      <div className="group relative inline-block ml-2">
        <Badge variant={color} className="flex items-center gap-1">
          <Clock size={14} />
          <span>{remainingDays} Tage</span>
          <Info size={14} className="cursor-help" />
        </Badge>
        <div className="invisible group-hover:visible absolute z-10 w-48 bg-gray-800 text-white text-xs p-2 rounded mt-1 right-0">
          {tooltip}
        </div>
      </div>
    );
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
      accessor: (item: Member) => {
        // Prüfen, ob Mitgliedschaft existiert
        if (!item.membership) {
          return (
            <div className="flex items-center flex-wrap gap-1">
              <Badge variant="gray">Kein Vertrag</Badge>
            </div>
          );
        }
        
        // Statusanzeige ohne zusätzliche Tagesanzeigen für abgelaufene oder gekündigte Verträge
        if (item.membership.status === 'cancelled' || item.membership.status === 'completed' || 
            (item.membership.status === 'active' && calculateRemainingDays(item.membership.end_date) < 0)) {
          return (
            <div className="flex items-center flex-wrap gap-1">
              {getMembershipStatusBadge(item)}
            </div>
          );
        }
        
        // Restliche Tage berechnen (können negativ sein bei abgelaufenen Verträgen)
        const remainingDays = calculateRemainingDays(item.membership.end_date);
        
        return (
          <div className="flex items-center flex-wrap gap-1">
            {getMembershipStatusBadge(item)}
            {/* Ampelsystem nur anzeigen, wenn:
                1. showStatusBadges aktiviert ist
                2. Vertrag aktiv ist
                3. Restlaufzeit positiv ist */}
            {showStatusBadges && 
             item.membership.status === 'active' && 
             remainingDays !== null && 
             remainingDays > 0 && 
             getRemainingDaysBadge(item.membership)}
          </div>
        );
      },
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
      onRowClick={(member) => window.location.href = `/mitglieder/${member.id}`}
    />
  );
} 