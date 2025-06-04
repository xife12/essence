'use client';

import React, { useState } from 'react';
import { CalendarClock, PlusCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StundenTable, { StundenEntry } from '../../components/stunden/StundenTable';
import StundenModal from '../../components/stunden/StundenModal';
import StundenCard from '../../components/stunden/StundenCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Dummy-Daten für die Entwicklung
const DUMMY_STUNDEN: StundenEntry[] = [
  {
    id: '1',
    date: '2023-08-15',
    hours: 8,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    created_at: '2023-08-15T18:00:00Z',
  },
  {
    id: '2',
    date: '2023-08-14',
    hours: 7.5,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    reason: 'BGM-Termin',
    created_at: '2023-08-14T17:30:00Z',
  },
  {
    id: '3',
    date: '2023-08-11',
    hours: 8,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    created_at: '2023-08-11T18:00:00Z',
  },
  {
    id: '4',
    date: '2023-08-10',
    hours: 4,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    reason: 'Urlaub (halber Tag)',
    created_at: '2023-08-10T13:00:00Z',
  },
  {
    id: '5',
    date: '2023-08-09',
    hours: 8,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    created_at: '2023-08-09T18:00:00Z',
  },
];

export default function StundenPage() {
  const [stunden, setStunden] = useState<StundenEntry[]>(DUMMY_STUNDEN);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric',
    });
  };

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const calculateTotalHours = (entries: StundenEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  const handleCreateStunden = (data: any) => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const newEntry: StundenEntry = {
        ...data,
        id: `new-${Date.now()}`,
        staff_id: 'user-1',
        staff_name: 'Max Mustermann',
        created_at: new Date().toISOString(),
      };
      
      setStunden(prev => [newEntry, ...prev]);
      setIsLoading(false);
      setIsModalOpen(false);
    }, 600);
  };

  const totalHours = calculateTotalHours(stunden);
  const targetHours = 40 * 4; // 40 Stunden pro Woche, ~4 Wochen pro Monat
  const progress = Math.round((totalHours / targetHours) * 100);

  return (
    <div>
      <PageHeader
        title="Stunden"
        description="Zeiterfassung und Übersicht"
        action={{
          label: "Stunden erfassen",
          icon: <PlusCircle size={18} />,
          onClick: () => setIsModalOpen(true),
        }}
      />

      {/* KPI-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StundenCard
          title="Monatliche Stunden"
          value={`${totalHours} / ${targetHours}h`}
          icon={<Clock size={20} />}
          description={`${progress}% des Monatsziels erreicht`}
          color="blue"
          progress={progress}
        />
        
        <StundenCard
          title="Durchschnitt pro Tag"
          value={`${(totalHours / 20).toFixed(1)}h`}
          icon={<CalendarClock size={20} />}
          description="Basierend auf 20 Arbeitstagen"
          color="green"
        />
        
        <StundenCard
          title="Letzte Erfassung"
          value={new Date(stunden[0]?.created_at || new Date()).toLocaleDateString('de-DE')}
          icon={<PlusCircle size={20} />}
          description={stunden[0]?.reason || "Reguläre Arbeitszeit"}
          color="purple"
        />
      </div>

      {/* Monatsübersicht */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              icon={<ChevronLeft size={16} />}
            >
              &nbsp;
            </Button>
            <h2 className="text-lg font-semibold">{formatMonth(currentMonth)}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              icon={<ChevronRight size={16} />}
            >
              &nbsp;
            </Button>
          </div>
        </div>
      </div>

      <StundenTable 
        data={stunden}
        totalHours={totalHours}
        showStaffColumn={false}
      />

      <StundenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStunden}
      />
    </div>
  );
} 