'use client';

import React, { useState, useEffect } from 'react';
import { CalendarClock, X, Save, ArrowRight } from 'lucide-react';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

type StundenData = {
  id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  has_break?: boolean;
  break_start?: string;
  break_end?: string;
  hours: number;
  staff_id?: string;
  reason?: string;
};

type StundenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StundenData, action?: 'save' | 'saveAndNext') => void;
  initialData?: Partial<StundenData>;
  isLoading?: boolean;
  title?: string;
};

export default function StundenModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Stunden erfassen',
}: StundenModalProps) {
  // Neutraler Startzustand
  const [formData, setFormData] = useState<StundenData>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    has_break: initialData?.has_break || false,
    break_start: initialData?.break_start || '',
    break_end: initialData?.break_end || '',
    hours: initialData?.hours || 0,
    reason: initialData?.reason || '',
    ...(initialData?.id && { id: initialData.id }),
    ...(initialData?.staff_id && { staff_id: initialData.staff_id }),
  });

  // Initialer neutraler Zustand zum Vergleich
  const [initialState, setInitialState] = useState<StundenData>({...formData});
  
  // Zustand zurücksetzen, wenn Modal geöffnet wird
  useEffect(() => {
    if (isOpen) {
      const newData = {
        date: initialData?.date || new Date().toISOString().split('T')[0],
        start_time: initialData?.start_time || '',
        end_time: initialData?.end_time || '',
        has_break: initialData?.has_break || false,
        break_start: initialData?.break_start || '',
        break_end: initialData?.break_end || '',
        hours: initialData?.hours || 0,
        reason: initialData?.reason || '',
        ...(initialData?.id && { id: initialData.id }),
        ...(initialData?.staff_id && { staff_id: initialData.staff_id }),
      };
      setFormData(newData);
      setInitialState({...newData});
    }
  }, [isOpen, initialData]);

  const [errors, setErrors] = useState<Partial<Record<keyof StundenData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // Aktualisiere zuerst die Form-Daten
    setFormData(prev => {
      const updatedData = { ...prev, [name]: newValue };
      
      // Direkt nach der Aktualisierung der Daten berechnen
      setTimeout(() => calculateHours(updatedData), 0);
      
      return updatedData;
    });
    
    // Clear error when field is changed
    if (errors[name as keyof StundenData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const calculateHours = (data = formData) => {
    // Nur berechnen, wenn Start- und Endzeit vorhanden sind
    if (data.start_time && data.end_time) {
      // Zeit in Minuten umrechnen
      const startMinutes = convertTimeToMinutes(data.start_time);
      const endMinutes = convertTimeToMinutes(data.end_time);
      
      let totalWorkMinutes = endMinutes - startMinutes;
      
      // Pausenzeit abziehen, falls Pause aktiviert und Pausenzeiten eingegeben
      if (data.has_break && data.break_start && data.break_end) {
        const breakStartMinutes = convertTimeToMinutes(data.break_start);
        const breakEndMinutes = convertTimeToMinutes(data.break_end);
        
        if (breakStartMinutes >= startMinutes && breakEndMinutes <= endMinutes) {
          totalWorkMinutes -= (breakEndMinutes - breakStartMinutes);
        }
      }
      
      // Exakte Umrechnung in Stunden ohne Rundung
      const hours = totalWorkMinutes / 60;
      
      // Direkt setzen, nicht über setFormData, da wir eventuell mit einer Kopie arbeiten
      setFormData(prev => ({ ...prev, hours }));
    }
  };

  const convertTimeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StundenData, string>> = {};
    
    if (!formData.date) {
      newErrors.date = 'Datum ist erforderlich';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Startzeit ist erforderlich';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'Endzeit ist erforderlich';
    }
    
    // Überprüfe Pausenzeiten nur, wenn Pause aktiviert ist
    if (formData.has_break) {
      if (!formData.break_start) {
        newErrors.break_start = 'Pausenstart ist erforderlich, wenn Pause aktiviert ist';
      }
      
      if (!formData.break_end) {
        newErrors.break_end = 'Pausenende ist erforderlich, wenn Pause aktiviert ist';
      }
      
      // Überprüfe, ob die Pause innerhalb der Arbeitszeit liegt
      if (formData.start_time && formData.end_time && formData.break_start && formData.break_end) {
        const startMinutes = convertTimeToMinutes(formData.start_time);
        const endMinutes = convertTimeToMinutes(formData.end_time);
        const breakStartMinutes = convertTimeToMinutes(formData.break_start);
        const breakEndMinutes = convertTimeToMinutes(formData.break_end);
        
        if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
          newErrors.break_start = 'Pause muss innerhalb der Arbeitszeit liegen';
        }
        
        if (breakEndMinutes <= breakStartMinutes) {
          newErrors.break_end = 'Ende der Pause muss nach Beginn liegen';
        }
      }
    }
    
    if (formData.start_time && formData.end_time) {
      const startMinutes = convertTimeToMinutes(formData.start_time);
      const endMinutes = convertTimeToMinutes(formData.end_time);
      
      if (endMinutes <= startMinutes) {
        newErrors.end_time = 'Endzeit muss nach Startzeit liegen';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prüfen, ob sich etwas geändert hat
  const hasChanges = (): boolean => {
    // Prüfen, ob mindestens Start- und Endzeit eingetragen wurden
    return (formData.start_time !== '' && formData.end_time !== '');
  };

  const handleSubmit = (e: React.FormEvent, action: 'save' | 'saveAndNext' = 'save') => {
    e.preventDefault();
    
    if (action === 'saveAndNext' && !hasChanges()) {
      // Wenn keine Änderungen und "Weiter" geklickt, dann nur zum nächsten Tag wechseln
      const nextDay = new Date(formData.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayString = nextDay.toISOString().split('T')[0];
      
      // Neues Formular mit nächstem Tag erstellen und zurücksetzen
      const newFormData = {
        ...initialState,
        date: nextDayString,
        // Alle Zeitfelder zurücksetzen
        start_time: '',
        end_time: '',
        has_break: false,
        break_start: '',
        break_end: '',
        hours: 0,
        reason: ''
      };
      
      setFormData(newFormData);
      setInitialState({...newFormData});
      
      return;
    }
    
    if (validateForm()) {
      onSubmit(formData, action);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            icon={<X size={18} />}
          >
            Abbrechen
          </Button>
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={(e) => handleSubmit(e, 'save')}
              isLoading={isLoading}
              icon={<Save size={18} />}
            >
              Speichern
            </Button>
            <Button
              variant="outline"
              onClick={(e) => handleSubmit(e, 'saveAndNext')}
              isLoading={isLoading}
              icon={<ArrowRight size={18} />}
            >
              Weiter
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <FormField
          label="Datum"
          htmlFor="date"
          error={errors.date}
          required
        >
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            required
          />
        </FormField>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Anwesenheit von"
            htmlFor="start_time"
            error={errors.start_time}
            required
          >
            <input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              required
            />
          </FormField>
          
          <FormField
            label="Anwesenheit bis"
            htmlFor="end_time"
            error={errors.end_time}
            required
          >
            <input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              required
            />
          </FormField>
        </div>
        
        <div className="flex items-start space-x-2 py-2">
          <div>
            <input
              id="has_break"
              name="has_break"
              type="checkbox"
              checked={formData.has_break}
              onChange={handleChange}
              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-opacity-50 mt-1"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="has_break" className="text-sm font-medium text-gray-700">
              Pause hinzufügen
            </label>
            <p className="text-xs text-gray-500">
              Aktivieren, um eine Pause für diesen Arbeitstag zu erfassen
            </p>
          </div>
        </div>
        
        {formData.has_break && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <FormField
              label="Pause von"
              htmlFor="break_start"
              error={errors.break_start}
              required={formData.has_break}
            >
              <input
                id="break_start"
                name="break_start"
                type="time"
                value={formData.break_start}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                required={formData.has_break}
              />
            </FormField>
            
            <FormField
              label="Pause bis"
              htmlFor="break_end"
              error={errors.break_end}
              required={formData.has_break}
            >
              <input
                id="break_end"
                name="break_end"
                type="time"
                value={formData.break_end}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                required={formData.has_break}
              />
            </FormField>
          </div>
        )}
        
        <FormField
          label="Berechnete Stunden"
          htmlFor="hours"
          error={errors.hours}
          required
        >
          <input
            id="hours"
            name="hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.hours}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            required
          />
        </FormField>
        
        <FormField
          label="Grund"
          htmlFor="reason"
          error={errors.reason}
          helpText="Optional: BGM-Termin, Sonderaufgaben, etc."
        >
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            rows={3}
          />
        </FormField>
      </form>
    </Modal>
  );
} 