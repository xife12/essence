'use client';

import React from 'react';
import { Edit, Calendar } from 'lucide-react';
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
};

type StundenTableProps = {
  data: StundenEntry[];
  isLoading?: boolean;
  totalHours?: number;
  showStaffColumn?: boolean;
};

export default function StundenTable({
  data,
  isLoading = false,
  totalHours,
  showStaffColumn = true,
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
      accessor: (item: StundenEntry) => (
        <div className="flex justify-end">
          <Link href={`/stunden/${item.id}/edit`}>
            <Button 
              variant="ghost" 
              size="sm"
              icon={<Edit size={16} />}
            >
              Bearbeiten
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
      footer={totalHours !== undefined && (
        <div className="flex justify-between">
          <span>Gesamtstunden</span>
          <span className="font-semibold">{formatHours(totalHours)}</span>
        </div>
      )}
    />
  );
} 