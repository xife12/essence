'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CalendarClock, PlusCircle, ChevronLeft, ChevronRight, Clock, Menu, Bed, UserX, AlertTriangle, BarChart } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StundenTable, { StundenEntry } from '../../components/stunden/StundenTable';
import StundenModal from '../../components/stunden/StundenModal';
import UrlaubModal from '../../components/stunden/UrlaubModal';
import KrankheitModal from '../../components/stunden/KrankheitModal';
import AbwesenheitModal from '../../components/stunden/AbwesenheitModal';
import StundenKarte from '../../components/stunden/StundenKarte';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Dropdown from '../../components/ui/Dropdown';
import { ToastProvider, useToast } from '../../components/ui/Toast';
import StundenCard from '../../components/stunden/StundenCard';
import Modal from '../../components/ui/Modal';

// Dummy-Daten für die Entwicklung
const DUMMY_STUNDEN: StundenEntry[] = [
  {
    id: '1',
    date: '2023-08-15',
    hours: 8,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    created_at: '2023-08-15T18:00:00Z',
    type: 'arbeitszeit'
  },
  {
    id: '2',
    date: '2023-08-14',
    hours: 7.5,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    reason: 'BGM-Termin',
    created_at: '2023-08-14T17:30:00Z',
    type: 'arbeitszeit'
  },
  {
    id: '3',
    date: '2023-08-11',
    hours: 8,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    created_at: '2023-08-11T18:00:00Z',
    type: 'arbeitszeit'
  },
  {
    id: '4',
    date: '2023-08-10',
    hours: 4,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    reason: 'Urlaub (halber Tag)',
    created_at: '2023-08-10T13:00:00Z',
    type: 'urlaub',
    is_half_day: true
  },
  {
    id: '5',
    date: '2023-08-09',
    hours: 8,
    staff_id: 'user-1',
    staff_name: 'Max Mustermann',
    created_at: '2023-08-09T18:00:00Z',
    type: 'arbeitszeit'
  },
];

export default function StundenPage() {
  return (
    <ToastProvider>
      <StundenPageContent />
    </ToastProvider>
  );
}

function StundenPageContent() {
  // Initialisierung des aktuellen Monats mit dem heutigen Datum (Jahr und Monat)
  const initializeCurrentMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const [stunden, setStunden] = useState<StundenEntry[]>(DUMMY_STUNDEN);
  const [isStundenModalOpen, setIsStundenModalOpen] = useState(false);
  const [isUrlaubModalOpen, setIsUrlaubModalOpen] = useState(false);
  const [isKrankheitModalOpen, setIsKrankheitModalOpen] = useState(false);
  const [isAbwesenheitModalOpen, setIsAbwesenheitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<StundenEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(initializeCurrentMonth());
  const [initialDate, setInitialDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<StundenEntry | null>(null);
  const [disabledDates, setDisabledDates] = useState<string[]>([]);
  const { showToast } = useToast();
  const [modalType, setModalType] = useState<'arbeitszeit' | 'urlaub' | 'krankheit' | 'abwesenheit' | 'fortbildung'>('arbeitszeit');

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
      return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    });
  };

  const resetToCurrentMonth = () => {
    setCurrentMonth(initializeCurrentMonth());
  };

  const calculateTotalHours = (entries: StundenEntry[]) => {
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  // Prüft, ob für das angegebene Datum bereits ein Eintrag existiert
  const getExistingEntryForDate = (date: string) => {
    return stunden.find(entry => entry.date === date);
  };

  // Prüft, ob ein neuer Eintrag für das Datum erstellt werden kann
  const canCreateEntryForDate = (date: string, type: 'arbeitszeit' | 'urlaub' | 'krankheit' | 'abwesenheit') => {
    const existingEntry = getExistingEntryForDate(date);
    
    // Wenn kein Eintrag existiert, kann immer ein neuer erstellt werden
    if (!existingEntry) return true;
    
    // Wenn der existierende Eintrag halber Tag ist
    if (existingEntry.is_half_day) {
      // Bei halbem Tag kann noch eine halbe Arbeitszeit eingetragen werden,
      // aber keine weiteren halben Tage anderer Art
      if (type === 'arbeitszeit') return true;
      return false;
    }
    
    // Wenn der existierende Eintrag bereits Arbeitszeit ist
    if (existingEntry.type === 'arbeitszeit') {
      // Eine halbe Arbeitszeit kann mit anderen halben Tagen kombiniert werden
      if (existingEntry.hours <= 4 && ['urlaub', 'krankheit', 'abwesenheit'].includes(type)) return true;
      return false;
    }
    
    // In allen anderen Fällen keine weiteren Einträge erlaubt
    return false;
  };

  // Prüft, ob ein Datum gesperrt ist (nach dem 10. des Folgemonats)
  const isDateLockedForEditing = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    // Erstelle ein Datum für den 10. des aktuellen Monats
    const lockDate = new Date(today.getFullYear(), today.getMonth(), 10);
    
    // Wenn heute nach dem 10. ist, und das Datum aus dem Vormonat stammt
    if (today > lockDate) {
      // Prüfen, ob das Datum aus dem Vormonat oder früher stammt
      if (date.getMonth() < today.getMonth() || 
          (date.getMonth() === 11 && today.getMonth() === 0 && date.getFullYear() < today.getFullYear()) ||
          date.getFullYear() < today.getFullYear()) {
        return true;
      }
    }
    
    return false;
  };
  
  // Prüft, ob ein ganzer Monat gesperrt ist (nach dem 10. des Folgemonats)
  const isMonthLockedForEditing = (year: number, month: number) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Erstelle ein Datum für den 10. des aktuellen Monats
    const lockDate = new Date(currentYear, currentMonth, 10);
    
    // Wenn heute nach dem 10. ist, prüfen, ob der Monat in der Vergangenheit liegt
    if (today > lockDate) {
      // Vergleich des ausgewählten Monats mit dem aktuellen Monat
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return true;
      }
    }
    
    return false;
  };

  // Prüft, ob der aktuell angezeigte Monat gesperrt ist
  const isCurrentMonthLocked = isMonthLockedForEditing(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );

  // Aktualisiere die Liste der gesperrten Daten, wenn sich der Monat ändert
  useEffect(() => {
    const disabledList: string[] = [];
    
    // Durchlaufe alle Stunden-Einträge und prüfe, welche gesperrt werden sollten
    stunden.forEach(entry => {
      if (isDateLockedForEditing(entry.date) && !disabledList.includes(entry.date)) {
        disabledList.push(entry.date);
      }
    });
    
    setDisabledDates(disabledList);
  }, [stunden, currentMonth]);

  // Löschfunktion
  const handleDeleteEntry = (entry: StundenEntry) => {
    setEntryToDelete(entry);
    setIsDeleteModalOpen(true);
  };
  
  // Bestätigte Löschung
  const confirmDelete = () => {
    if (!entryToDelete) return;
    
    setIsLoading(true);
    
    // Prüfen, ob das Datum gesperrt ist
    if (isDateLockedForEditing(entryToDelete.date)) {
      showToast({
        message: 'Einträge aus vergangenen Monaten können nach dem 10. des Folgemonats nicht mehr gelöscht werden.',
        type: 'error'
      });
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
      setIsLoading(false);
      return;
    }
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      setStunden(prev => prev.filter(item => item.id !== entryToDelete.id));
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
      
      showToast({
        message: 'Eintrag wurde erfolgreich gelöscht.',
        type: 'success'
      });
    }, 600);
  };

  // Bearbeiten eines Eintrags
  const handleEditEntry = (entry: StundenEntry) => {
    // Prüfen, ob das Datum gesperrt ist
    if (isDateLockedForEditing(entry.date)) {
      showToast({
        message: 'Einträge aus vergangenen Monaten können nach dem 10. des Folgemonats nicht mehr bearbeitet werden.',
        type: 'error'
      });
      return;
    }
    
    setEditingEntry(entry);

    // Je nach Typ das entsprechende Modal öffnen
    switch (entry.type) {
      case 'arbeitszeit':
        setIsStundenModalOpen(true);
        break;
      case 'urlaub':
        setIsUrlaubModalOpen(true);
        break;
      case 'krankheit':
        setIsKrankheitModalOpen(true);
        break;
      case 'abwesenheit':
        setIsAbwesenheitModalOpen(true);
        break;
      default:
        // Fallback auf Arbeitszeit, wenn kein Typ definiert ist (für ältere Einträge)
        setIsStundenModalOpen(true);
    }
  };

  // Aktualisieren eines Eintrags
  const updateEntry = (updatedEntry: StundenEntry) => {
    setStunden(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  // Speichern der Bearbeitung für Arbeitszeit
  const handleUpdateStunden = (data: any, action?: 'save' | 'saveAndNext') => {
    if (!editingEntry) return handleCreateStunden(data, action);

    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const updatedEntry: StundenEntry = {
        ...editingEntry,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      updateEntry(updatedEntry);
      setIsLoading(false);
      setIsStundenModalOpen(false);
      setEditingEntry(null);
      
      // Erfolgsmeldung anzeigen
      showToast({
        message: 'Arbeitszeiteintrag erfolgreich aktualisiert',
        type: 'success'
      });
      
    }, 600);
  };

  // Speichern der Bearbeitung für Urlaub
  const handleUpdateUrlaub = (data: any) => {
    if (!editingEntry) return handleCreateUrlaub(data);

    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      // Nur die Eigenschaften aktualisieren, nicht die Tage neu erstellen
      const isHalfDay = data.is_half_day;
      
      const updatedEntry: StundenEntry = {
        ...editingEntry,
        hours: isHalfDay ? 4 : 8,
        reason: `Urlaub${isHalfDay ? ' (halber Tag)' : ''}`,
        is_half_day: isHalfDay,
        updated_at: new Date().toISOString()
      };
      
      updateEntry(updatedEntry);
      setIsLoading(false);
      setIsUrlaubModalOpen(false);
      setEditingEntry(null);
    }, 600);
  };

  // Speichern der Bearbeitung für Krankheit
  const handleUpdateKrankheit = (data: any) => {
    if (!editingEntry) return handleCreateKrankheit(data);

    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      // Nur die Eigenschaften aktualisieren, nicht die Tage neu erstellen
      const isHalfDay = data.is_half_day;
      
      const updatedEntry: StundenEntry = {
        ...editingEntry,
        hours: isHalfDay ? 4 : 8,
        reason: `Krankheit${isHalfDay ? ' (halber Tag)' : ''}`,
        is_half_day: isHalfDay,
        updated_at: new Date().toISOString()
      };
      
      updateEntry(updatedEntry);
      setIsLoading(false);
      setIsKrankheitModalOpen(false);
      setEditingEntry(null);
    }, 600);
  };

  // Speichern der Bearbeitung für Abwesenheit
  const handleUpdateAbwesenheit = (data: any) => {
    if (!editingEntry) return handleCreateAbwesenheit(data);

    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      // Nur die Eigenschaften aktualisieren, nicht die Tage neu erstellen
      const isHalfDay = data.is_half_day;
      
      const updatedEntry: StundenEntry = {
        ...editingEntry,
        hours: isHalfDay ? 4 : 8,
        reason: `Abwesenheit: ${data.reason}${isHalfDay ? ' (halber Tag)' : ''}`,
        is_half_day: isHalfDay,
        updated_at: new Date().toISOString()
      };
      
      updateEntry(updatedEntry);
      setIsLoading(false);
      setIsAbwesenheitModalOpen(false);
      setEditingEntry(null);
    }, 600);
  };

  // Filtere Stunden basierend auf dem ausgewählten Monat
  const filteredStunden = stunden.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth.getMonth() && 
           entryDate.getFullYear() === currentMonth.getFullYear();
  });

  // Sortiere die gefilterten Einträge chronologisch (aufsteigend nach Datum)
  const sortedStunden = [...filteredStunden].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Gesamtstunden des aktuellen Monats berechnen
  const totalHours = calculateTotalHours(filteredStunden);
  const targetHours = 160; // 40 Stunden pro Woche, ~4 Wochen pro Monat
  const progress = Math.round((totalHours / targetHours) * 100);
  
  // Stundenkonto berechnen (Überstunden aus allen Monaten)
  const ueberstunden = 14.5; // Hier würde normalerweise die Summe aller Überstunden aus der Datenbank kommen
  
  // Definitionen für die Buttons für die Zeiterfassung
  const modalOptions = [
    {
      label: 'Arbeitszeit',
      icon: <Clock size={16} />,
      type: 'arbeitszeit',
    },
    {
      label: 'Urlaub',
      icon: <CalendarClock size={16} />,
      type: 'urlaub',
    },
    {
      label: 'Krankheit',
      icon: <Bed size={16} />,
      type: 'krankheit',
    },
    {
      label: 'Fortbildung',
      icon: <Bed size={16} />,
      type: 'fortbildung',
    },
  ];

  // Öffnet das entsprechende Modal mit Prüfung, ob ein Eintrag erstellt werden kann
  const openModal = (type: 'arbeitszeit' | 'urlaub' | 'krankheit' | 'abwesenheit' | 'fortbildung', date?: string) => {
    // Aktuelles Datum verwenden, wenn keines angegeben wurde
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Prüfen, ob das Datum gesperrt ist
    if (isDateLockedForEditing(targetDate)) {
      showToast({
        message: 'Einträge für vergangene Monate können nach dem 10. des Folgemonats nicht mehr erstellt werden.',
        type: 'error'
      });
      return;
    }
    
    setInitialDate(targetDate);
    setModalType(type);
    
    // Das entsprechende Modal öffnen
    switch (type) {
      case 'arbeitszeit':
      case 'fortbildung':
        setIsStundenModalOpen(true);
        break;
      case 'urlaub':
        setIsUrlaubModalOpen(true);
        break;
      case 'krankheit':
        setIsKrankheitModalOpen(true);
        break;
      case 'abwesenheit':
        setIsAbwesenheitModalOpen(true);
        break;
    }
  };

  const handleCreateStunden = (data: any, action?: 'save' | 'saveAndNext') => {
    setIsLoading(true);
    
    // Prüfen, ob für das Datum bereits ein Eintrag existiert
    const existingEntry = getExistingEntryForDate(data.date);
    if (existingEntry && !canCreateEntryForDate(data.date, 'arbeitszeit')) {
      showToast({
        message: `Für den ${new Date(data.date).toLocaleDateString('de-DE')} existiert bereits ein Eintrag (${existingEntry.reason || 'Reguläre Arbeitszeit'}). Es ist nur ein Eintrag pro Tag möglich.`,
        type: 'error'
      });
      setIsLoading(false);
      return;
    }
    
    // Prüfen, ob das Datum gesperrt ist
    if (isDateLockedForEditing(data.date)) {
      showToast({
        message: 'Einträge für vergangene Monate können nach dem 10. des Folgemonats nicht mehr erstellt werden.',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const newEntry: StundenEntry = {
        ...data,
        id: `new-${Date.now()}`,
        staff_id: 'user-1',
        staff_name: 'Max Mustermann',
        created_at: new Date().toISOString(),
        type: 'arbeitszeit'
      };
      
      // Sicherstellen, dass bei Fortbildung der Grund auf "Fortbildung" gesetzt ist
      if (modalType === 'fortbildung' && !data.reason) {
        newEntry.reason = 'Fortbildung';
      }
      
      setStunden(prev => [newEntry, ...prev]);
      setIsLoading(false);
      
      if (action === 'saveAndNext') {
        // Vorbereiten für den nächsten Tag
        const nextDay = new Date(data.date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayString = nextDay.toISOString().split('T')[0];
        
        // Prüfen, ob für den nächsten Tag bereits ein Eintrag existiert
        if (!canCreateEntryForDate(nextDayString, 'arbeitszeit')) {
          showToast({
            message: `Für den ${new Date(nextDayString).toLocaleDateString('de-DE')} existiert bereits ein Eintrag. Es kann kein weiterer erstellt werden.`,
            type: 'warning'
          });
          setIsStundenModalOpen(false);
          return;
        }
        
        // Modal offen lassen, aber mit neuem Datum
        setInitialDate(nextDayString);
        setTimeout(() => {
          setIsStundenModalOpen(true);
        }, 100);
      } else {
        setIsStundenModalOpen(false);
      }
    }, 600);
  };

  const handleCreateUrlaub = (data: any) => {
    setIsLoading(true);
    
    // Prüfung für einzelnes Datum (wenn kein Zeitraum ausgewählt wurde)
    if (data.start_date === data.end_date) {
      // Prüfen, ob das Datum gesperrt ist
      if (isDateLockedForEditing(data.start_date)) {
        showToast({
          message: 'Einträge für vergangene Monate können nach dem 10. des Folgemonats nicht mehr erstellt werden.',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
      
      const existingEntry = getExistingEntryForDate(data.start_date);
      if (existingEntry && !canCreateEntryForDate(data.start_date, 'urlaub')) {
        showToast({
          message: `Für den ${new Date(data.start_date).toLocaleDateString('de-DE')} existiert bereits ein Eintrag (${existingEntry.reason || 'Reguläre Arbeitszeit'}). Es ist nur ein Eintrag pro Tag möglich.`,
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
    }
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      // Erzeuge Einträge für jeden Tag im ausgewählten Zeitraum
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const entries: StundenEntry[] = [];
      const skippedDates: string[] = [];
      const lockedDates: string[] = [];
      
      // Iteriere über alle Tage im Bereich
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Überprüfe, ob der aktuelle Tag ein Wochenende ist (0 = Sonntag, 6 = Samstag)
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) {
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Prüfen, ob das Datum gesperrt ist
          if (isDateLockedForEditing(dateString)) {
            lockedDates.push(new Date(dateString).toLocaleDateString('de-DE'));
          }
          // Prüfen, ob für diesen Tag bereits ein Eintrag existiert
          else if (canCreateEntryForDate(dateString, 'urlaub')) {
            // Wenn halber Tag und das Datum stimmt, dann 4 Stunden, sonst 8
            const isHalfDay = data.is_half_day && 
              dateString === data.half_day_date;
            
            entries.push({
              id: `new-urlaub-${Date.now()}-${currentDate.getDate()}`,
              date: dateString,
              hours: isHalfDay ? 4 : 8,
              staff_id: 'user-1',
              staff_name: 'Max Mustermann',
              reason: `Urlaub${isHalfDay ? ' (halber Tag)' : ''}`,
              created_at: new Date().toISOString(),
              type: 'urlaub',
              is_half_day: isHalfDay
            });
          } else {
            // Datum merken, für das kein Eintrag erstellt werden konnte
            skippedDates.push(new Date(dateString).toLocaleDateString('de-DE'));
          }
        }
        
        // Inkrementiere den Tag
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Warnung anzeigen, wenn nicht alle Tage eingetragen werden konnten
      if (skippedDates.length > 0 || lockedDates.length > 0) {
        let message = '';
        
        if (skippedDates.length > 0) {
          message += `Für folgende Tage konnte kein Urlaubseintrag erstellt werden, da bereits Einträge existieren: ${skippedDates.join(', ')}. `;
        }
        
        if (lockedDates.length > 0) {
          message += `Folgende Tage konnten nicht bearbeitet werden, da sie nach dem 10. des Folgemonats liegen: ${lockedDates.join(', ')}`;
        }
        
        showToast({
          message,
          type: 'warning',
          duration: 8000
        });
      }
      
      if (entries.length > 0) {
        setStunden(prev => [...entries, ...prev]);
      }
      
      setIsLoading(false);
      setIsUrlaubModalOpen(false);
    }, 600);
  };

  const handleCreateKrankheit = (data: any) => {
    setIsLoading(true);
    
    // Prüfung für einzelnes Datum (wenn kein Zeitraum ausgewählt wurde)
    if (data.start_date === data.end_date) {
      // Prüfen, ob das Datum gesperrt ist
      if (isDateLockedForEditing(data.start_date)) {
        showToast({
          message: 'Einträge für vergangene Monate können nach dem 10. des Folgemonats nicht mehr erstellt werden.',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
      
      const existingEntry = getExistingEntryForDate(data.start_date);
      if (existingEntry && !canCreateEntryForDate(data.start_date, 'krankheit')) {
        showToast({
          message: `Für den ${new Date(data.start_date).toLocaleDateString('de-DE')} existiert bereits ein Eintrag (${existingEntry.reason || 'Reguläre Arbeitszeit'}). Es ist nur ein Eintrag pro Tag möglich.`,
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
    }
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      // Erzeuge Einträge für jeden Tag im ausgewählten Zeitraum
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const entries: StundenEntry[] = [];
      const skippedDates: string[] = [];
      const lockedDates: string[] = [];
      
      // Iteriere über alle Tage im Bereich
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Überprüfe, ob der aktuelle Tag ein Wochenende ist (0 = Sonntag, 6 = Samstag)
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) {
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Prüfen, ob das Datum gesperrt ist
          if (isDateLockedForEditing(dateString)) {
            lockedDates.push(new Date(dateString).toLocaleDateString('de-DE'));
          }
          // Prüfen, ob für diesen Tag bereits ein Eintrag existiert
          else if (canCreateEntryForDate(dateString, 'krankheit')) {
            // Wenn halber Tag und das Datum stimmt, dann 4 Stunden, sonst 8
            const isHalfDay = data.is_half_day && 
              dateString === data.half_day_date;
            
            entries.push({
              id: `new-krankheit-${Date.now()}-${currentDate.getDate()}`,
              date: dateString,
              hours: isHalfDay ? 4 : 8,
              staff_id: 'user-1',
              staff_name: 'Max Mustermann',
              reason: `Krankheit${isHalfDay ? ' (halber Tag)' : ''}`,
              created_at: new Date().toISOString(),
              type: 'krankheit',
              is_half_day: isHalfDay
            });
          } else {
            // Datum merken, für das kein Eintrag erstellt werden konnte
            skippedDates.push(new Date(dateString).toLocaleDateString('de-DE'));
          }
        }
        
        // Inkrementiere den Tag
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Warnung anzeigen, wenn nicht alle Tage eingetragen werden konnten
      if (skippedDates.length > 0 || lockedDates.length > 0) {
        let message = '';
        
        if (skippedDates.length > 0) {
          message += `Für folgende Tage konnte kein Krankheitseintrag erstellt werden, da bereits Einträge existieren: ${skippedDates.join(', ')}. `;
        }
        
        if (lockedDates.length > 0) {
          message += `Folgende Tage konnten nicht bearbeitet werden, da sie nach dem 10. des Folgemonats liegen: ${lockedDates.join(', ')}`;
        }
        
        showToast({
          message,
          type: 'warning',
          duration: 8000
        });
      }
      
      if (entries.length > 0) {
        setStunden(prev => [...entries, ...prev]);
      }
      
      setIsLoading(false);
      setIsKrankheitModalOpen(false);
    }, 600);
  };

  const handleCreateAbwesenheit = (data: any) => {
    setIsLoading(true);
    
    // Prüfung für einzelnes Datum (wenn kein Zeitraum ausgewählt wurde)
    if (data.start_date === data.end_date) {
      // Prüfen, ob das Datum gesperrt ist
      if (isDateLockedForEditing(data.start_date)) {
        showToast({
          message: 'Einträge für vergangene Monate können nach dem 10. des Folgemonats nicht mehr erstellt werden.',
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
      
      const existingEntry = getExistingEntryForDate(data.start_date);
      if (existingEntry && !canCreateEntryForDate(data.start_date, 'abwesenheit')) {
        showToast({
          message: `Für den ${new Date(data.start_date).toLocaleDateString('de-DE')} existiert bereits ein Eintrag (${existingEntry.reason || 'Reguläre Arbeitszeit'}). Es ist nur ein Eintrag pro Tag möglich.`,
          type: 'error'
        });
        setIsLoading(false);
        return;
      }
    }
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      // Erzeuge Einträge für jeden Tag im ausgewählten Zeitraum
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const entries: StundenEntry[] = [];
      const skippedDates: string[] = [];
      const lockedDates: string[] = [];
      
      // Iteriere über alle Tage im Bereich
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Überprüfe, ob der aktuelle Tag ein Wochenende ist (0 = Sonntag, 6 = Samstag)
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) {
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Prüfen, ob das Datum gesperrt ist
          if (isDateLockedForEditing(dateString)) {
            lockedDates.push(new Date(dateString).toLocaleDateString('de-DE'));
          }
          // Prüfen, ob für diesen Tag bereits ein Eintrag existiert
          else if (canCreateEntryForDate(dateString, 'abwesenheit')) {
            // Wenn halber Tag und das Datum stimmt, dann 4 Stunden, sonst 8
            const isHalfDay = data.is_half_day && 
              dateString === data.half_day_date;
            
            entries.push({
              id: `new-abwesenheit-${Date.now()}-${currentDate.getDate()}`,
              date: dateString,
              hours: isHalfDay ? 4 : 8,
              staff_id: 'user-1',
              staff_name: 'Max Mustermann',
              reason: `Abwesenheit: ${data.reason}${isHalfDay ? ' (halber Tag)' : ''}`,
              created_at: new Date().toISOString(),
              type: 'abwesenheit',
              is_half_day: isHalfDay
            });
          } else {
            // Datum merken, für das kein Eintrag erstellt werden konnte
            skippedDates.push(new Date(dateString).toLocaleDateString('de-DE'));
          }
        }
        
        // Inkrementiere den Tag
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Warnung anzeigen, wenn nicht alle Tage eingetragen werden konnten
      if (skippedDates.length > 0 || lockedDates.length > 0) {
        let message = '';
        
        if (skippedDates.length > 0) {
          message += `Für folgende Tage konnte kein Abwesenheitseintrag erstellt werden, da bereits Einträge existieren: ${skippedDates.join(', ')}. `;
        }
        
        if (lockedDates.length > 0) {
          message += `Folgende Tage konnten nicht bearbeitet werden, da sie nach dem 10. des Folgemonats liegen: ${lockedDates.join(', ')}`;
        }
        
        showToast({
          message,
          type: 'warning',
          duration: 8000
        });
      }
      
      if (entries.length > 0) {
        setStunden(prev => [...entries, ...prev]);
      }
      
      setIsLoading(false);
      setIsAbwesenheitModalOpen(false);
    }, 600);
  };

  return (
    <div>
      {disabledDates.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Hinweis zur Zeiterfassung</p>
            <p className="text-sm text-yellow-700 mt-1">
              Einträge des vergangenen Monats können nur bis zum 10. des Folgemonats bearbeitet werden. 
              Einige Einträge sind gesperrt, da diese Frist abgelaufen ist.
            </p>
          </div>
        </div>
      )}
      
      <PageHeader
        title="Stunden"
        description="Zeiterfassung und Übersicht"
        action={{
          label: "Auswertungen",
          icon: <BarChart size={18} />,
          onClick: () => window.location.href = '/stunden/auswertungen'
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
          title="Verbrauchte Urlaubstage"
          value="12 / 30"
          icon={<Calendar size={20} />}
          description="40% des Jahresurlaubs verbraucht"
          color="orange"
          progress={40}
        />
        
        <StundenCard
          title="Stundenkonto"
          value={`+${ueberstunden}h`}
          icon={<PlusCircle size={20} />}
          description="Angesammelte Überstunden"
          color="green"
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
            <Button
              variant="outline"
              size="sm"
              onClick={resetToCurrentMonth}
              className="ml-2"
            >
              Aktueller Monat
            </Button>
          </div>
          
          <div className="flex gap-2">
            {modalOptions.map((option) => (
              <Button
                key={option.type}
                variant="outline"
                size="sm"
                onClick={() => !isCurrentMonthLocked && openModal(option.type as any)}
                icon={option.icon}
                disabled={isCurrentMonthLocked}
                className={isCurrentMonthLocked ? "opacity-50 cursor-not-allowed" : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isCurrentMonthLocked && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Monat gesperrt</p>
            <p className="text-sm text-red-700 mt-1">
              Für {formatMonth(currentMonth)} können keine Einträge mehr erstellt oder bearbeitet werden, 
              da der Eintragungszeitraum (bis zum 10. des Folgemonats) abgelaufen ist.
            </p>
          </div>
        </div>
      )}

      {sortedStunden.length > 0 ? (
      <StundenTable 
          data={sortedStunden}
        totalHours={totalHours}
        showStaffColumn={false}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          disabledDates={disabledDates}
        />
      ) : (
        <div className="bg-white rounded-md shadow-sm p-8 text-center border border-gray-100">
          <p className="text-gray-500 mb-4">Keine Einträge für {formatMonth(currentMonth)} vorhanden.</p>
          {!isCurrentMonthLocked ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal('arbeitszeit')}
              icon={<Clock size={16} />}
            >
              Arbeitszeit erfassen
            </Button>
          ) : (
            <p className="text-sm text-red-600">
              Für diesen Monat können keine Einträge mehr erstellt werden.
            </p>
          )}
        </div>
      )}

      <StundenModal
        isOpen={isStundenModalOpen}
        onClose={() => {
          setIsStundenModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateStunden : handleCreateStunden}
        isLoading={isLoading}
        initialData={editingEntry ? {
          date: editingEntry.date,
          hours: editingEntry.hours,
          reason: editingEntry.reason,
          // Weitere Felder könnten hier ergänzt werden, wenn sie in editingEntry vorhanden sind
        } : { 
          date: initialDate,
          reason: modalType === 'fortbildung' ? 'Fortbildung' : '' 
        }}
        title={modalType === 'fortbildung' ? 'Fortbildung erfassen' : 'Stunden erfassen'}
      />
      
      <UrlaubModal
        isOpen={isUrlaubModalOpen}
        onClose={() => {
          setIsUrlaubModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateUrlaub : handleCreateUrlaub}
        isLoading={isLoading}
        initialData={editingEntry ? {
          start_date: editingEntry.date,
          end_date: editingEntry.date,
          is_half_day: editingEntry.is_half_day || false,
          half_day_date: editingEntry.date
        } : { start_date: initialDate, end_date: initialDate }}
      />
      
      <KrankheitModal
        isOpen={isKrankheitModalOpen}
        onClose={() => {
          setIsKrankheitModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateKrankheit : handleCreateKrankheit}
        isLoading={isLoading}
        initialData={editingEntry ? {
          start_date: editingEntry.date,
          end_date: editingEntry.date,
          is_half_day: editingEntry.is_half_day || false,
          half_day_date: editingEntry.date
        } : { start_date: initialDate, end_date: initialDate }}
      />
      
      <AbwesenheitModal
        isOpen={isAbwesenheitModalOpen}
        onClose={() => {
          setIsAbwesenheitModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateAbwesenheit : handleCreateAbwesenheit}
        isLoading={isLoading}
        initialData={editingEntry ? {
          start_date: editingEntry.date,
          end_date: editingEntry.date,
          is_half_day: editingEntry.is_half_day || false,
          half_day_date: editingEntry.date,
          reason: editingEntry.reason?.replace('Abwesenheit: ', '') || ''
        } : { start_date: initialDate, end_date: initialDate }}
      />
      
      {/* Lösch-Bestätigungsdialog */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEntryToDelete(null);
        }}
        title="Eintrag löschen"
      >
        <div className="p-6">
          <p className="mb-4">
            Möchten Sie den Eintrag vom {entryToDelete ? new Date(entryToDelete.date).toLocaleDateString('de-DE') : ''} wirklich löschen?
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEntryToDelete(null);
              }}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              isLoading={isLoading}
            >
              Löschen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 