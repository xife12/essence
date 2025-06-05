'use client';

import React from 'react';
import { Edit, Calendar, Trash2 } from 'lucide-react';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Link from 'next/link';

export type StundenEntry = {
  id: string;
  date: string;
  hours: number;
  staff_id: string;
  staff_name?: string;
  reason?: string;
  created_at: string;
  updated_at?: string;
  type?: 'arbeitszeit' | 'urlaub' | 'krankheit' | 'abwesenheit';
  is_half_day?: boolean;
};

type StundenTableProps = {
  data: StundenEntry[];
  isLoading?: boolean;
  totalHours?: number;
  showStaffColumn?: boolean;
  onEdit?: (entry: StundenEntry) => void;
  onDelete?: (entry: StundenEntry) => void;
  disabledDates?: string[];
};

export default function StundenTable({
  data,
  isLoading = false,
  totalHours,
  showStaffColumn = true,
  onEdit,
  onDelete,
  disabledDates = []
}: StundenTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatHours = (hours: number) => {
    return `${hours.toString().replace('.', ',')} h`;
  };
  
  // Prüft, ob ein Datum gesperrt ist (nach dem 10. des Folgemonats)
  const isDateDisabled = (dateStr: string) => {
    return disabledDates.includes(dateStr);
  };

  const columns = [
    {
      header: 'Datum',
      accessor: (item: StundenEntry) => (
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>{formatDate(item.date)}</span>
        </div>
      ),
    },
    ...(showStaffColumn ? [{
      header: 'Mitarbeiter',
      accessor: (item: StundenEntry) => item.staff_name || '-',
    }] : []),
    {
      header: 'Stunden',
      accessor: (item: StundenEntry) => formatHours(item.hours),
    },
    {
      header: 'Grund',
      accessor: (item: StundenEntry) => item.reason || 'Reguläre Arbeitszeit',
    },
    {
      header: 'Aktionen',
      accessor: (item: StundenEntry) => {
        const isDisabled = isDateDisabled(item.date);
        const disabledClass = isDisabled ? 'opacity-50 cursor-not-allowed' : '';
        
        return (
          <div className="flex justify-end gap-2">
            <Link href={isDisabled ? '#' : `/stunden/${item.id}/edit`} onClick={(e) => {
              if (isDisabled) {
                e.preventDefault();
                return;
              }
              if (onEdit) {
                e.preventDefault();
                onEdit(item);
              }
            }}>
              <Button 
                variant="ghost" 
                size="sm"
                icon={<Edit size={16} className={isDisabled ? "text-gray-400" : "text-blue-500"} />}
                disabled={isDisabled}
                className={isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-50"}
              >
                Bearbeiten
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm"
              icon={<Trash2 size={16} className={isDisabled ? "text-gray-400" : "text-red-500"} />}
              onClick={() => onDelete && onDelete(item)}
              disabled={isDisabled}
              className={isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"}
            >
              Löschen
            </Button>
          </div>
        );
      },
      className: 'text-right',
    },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      isLoading={isLoading}
      footer={totalHours !== undefined && (
        <div className="flex justify-between">
          <span>Gesamtstunden</span>
          <span className="font-semibold">{formatHours(totalHours)}</span>
        </div>
      )}
    />
  );
} 