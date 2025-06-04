'use client';

import React, { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

type StundenData = {
  id?: string;
  date: string;
  hours: number;
  staff_id?: string;
  reason?: string;
};

type StundenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StundenData) => void;
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
  const [formData, setFormData] = useState<StundenData>({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    hours: initialData?.hours || 8,
    reason: initialData?.reason || '',
    ...(initialData?.id && { id: initialData.id }),
    ...(initialData?.staff_id && { staff_id: initialData.staff_id }),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StundenData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name as keyof StundenData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StundenData, string>> = {};
    
    if (!formData.date) {
      newErrors.date = 'Datum ist erforderlich';
    }
    
    if (!formData.hours) {
      newErrors.hours = 'Stunden sind erforderlich';
    } else if (formData.hours <= 0 || formData.hours > 24) {
      newErrors.hours = 'Stunden müssen zwischen 0 und 24 liegen';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
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
          >
            Abbrechen
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Speichern
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </FormField>
        
        <FormField
          label="Stunden"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </FormField>
        
        <FormField
          label="Grund"
          htmlFor="reason"
          error={errors.reason}
          helpText="Optional: Urlaub, Krankheit, BGM-Termin, etc."
        >
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </FormField>
      </form>
    </Modal>
  );
} 