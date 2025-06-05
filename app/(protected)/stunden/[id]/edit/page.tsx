'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../../components/ui/PageHeader';
import StundenModal from '../../../../components/stunden/StundenModal';
import UrlaubModal from '../../../../components/stunden/UrlaubModal';
import KrankheitModal from '../../../../components/stunden/KrankheitModal';
import AbwesenheitModal from '../../../../components/stunden/AbwesenheitModal';
import Card from '../../../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../../components/ui/Button';

// Dummy-Daten für die Entwicklung - in Produktion durch API-Aufruf ersetzen
const DUMMY_STUNDEN: StundenEntry[] = [
  {
    id: '1',
    date: '2023-05-10',
    hours: 8,
    staff_id: 'user1',
    staff_name: 'Max Mustermann',
    reason: 'Reguläre Arbeitszeit',
    created_at: '2023-05-10T08:00:00Z',
    type: 'arbeitszeit',
  },
  {
    id: '2',
    date: '2023-05-11',
    hours: 4,
    staff_id: 'user1',
    staff_name: 'Max Mustermann',
    reason: 'Schulung',
    created_at: '2023-05-11T08:00:00Z',
    type: 'arbeitszeit',
  },
  {
    id: '3',
    date: '2023-05-12',
    hours: 8,
    staff_id: 'user1',
    staff_name: 'Max Mustermann',
    reason: 'Urlaub',
    created_at: '2023-05-12T08:00:00Z',
    type: 'urlaub',
  },
  {
    id: '4',
    date: '2023-05-15',
    hours: 8,
    staff_id: 'user1',
    staff_name: 'Max Mustermann',
    reason: 'Krankheit',
    created_at: '2023-05-15T08:00:00Z',
    type: 'krankheit',
  },
  {
    id: '5',
    date: '2023-05-16',
    hours: 4,
    staff_id: 'user1',
    staff_name: 'Max Mustermann',
    reason: 'Abwesenheit: Arzttermin',
    created_at: '2023-05-16T08:00:00Z',
    type: 'abwesenheit',
    is_half_day: true,
  },
];

type StundenEntry = {
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

export default function EditStundenPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [entry, setEntry] = useState<StundenEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    // Hier würde in Produktion ein API-Aufruf stehen
    const fetchedEntry = DUMMY_STUNDEN.find(item => item.id === id);
    
    if (fetchedEntry) {
      setEntry(fetchedEntry);
    }
    
    setIsLoading(false);
    setModalOpen(true);
  }, [id]);
  
  const handleClose = () => {
    setModalOpen(false);
    router.push('/stunden');
  };
  
  const handleSubmit = (data: any, action?: 'save' | 'saveAndNext') => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf zum Aktualisieren des Eintrags
    setTimeout(() => {
      setIsLoading(false);
      router.push('/stunden');
    }, 800);
  };
  
  if (isLoading && !entry) {
    return (
      <div className="p-4">
        <Card>
          <div className="p-4 text-center">Eintrag wird geladen...</div>
        </Card>
      </div>
    );
  }
  
  if (!entry) {
    return (
      <div className="p-4">
        <PageHeader title="Fehler" />
        <Card>
          <div className="p-4">
            <p>Der Eintrag konnte nicht gefunden werden.</p>
            <Button 
              className="mt-4"
              onClick={() => router.push('/stunden')}
              icon={<ArrowLeft size={16} />}
            >
              Zurück zur Übersicht
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Je nach Typ des Eintrags das entsprechende Modal öffnen
  const renderModal = () => {
    switch (entry.type) {
      case 'arbeitszeit':
        return (
          <StundenModal
            isOpen={modalOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={{
              date: entry.date,
              hours: entry.hours,
              reason: entry.reason,
            }}
          />
        );
      case 'urlaub':
        return (
          <UrlaubModal
            isOpen={modalOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={{
              start_date: entry.date,
              end_date: entry.date,
              is_half_day: entry.is_half_day || false,
              half_day_date: entry.date,
            }}
          />
        );
      case 'krankheit':
        return (
          <KrankheitModal
            isOpen={modalOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={{
              start_date: entry.date,
              end_date: entry.date,
              is_half_day: entry.is_half_day || false,
              half_day_date: entry.date,
            }}
          />
        );
      case 'abwesenheit':
        return (
          <AbwesenheitModal
            isOpen={modalOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={{
              start_date: entry.date,
              end_date: entry.date,
              is_half_day: entry.is_half_day || false,
              half_day_date: entry.date,
              reason: entry.reason?.replace('Abwesenheit: ', '') || '',
            }}
          />
        );
      default:
        return (
          <StundenModal
            isOpen={modalOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={{
              date: entry.date,
              hours: entry.hours,
              reason: entry.reason,
            }}
          />
        );
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Stundeneintrag bearbeiten" />
        <Button 
          onClick={() => router.push('/stunden')}
          variant="outline"
          icon={<ArrowLeft size={16} />}
        >
          Zurück
        </Button>
      </div>
      
      {renderModal()}
    </div>
  );
} 