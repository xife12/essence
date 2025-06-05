'use client';

import React, { useState } from 'react';
import { CalendarClock, X, Save } from 'lucide-react';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

type UrlaubData = {
  id?: string;
  staff_id?: string;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  half_day_date?: string;
};

type UrlaubModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UrlaubData) => void;
  initialData?: Partial<UrlaubData>;
  isLoading?: boolean;
};

export default function UrlaubModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: UrlaubModalProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<UrlaubData>({
    start_date: initialData?.start_date || today,
    end_date: initialData?.end_date || today,
    is_half_day: initialData?.is_half_day || false,
    half_day_date: initialData?.half_day_date || today,
    ...(initialData?.id && { id: initialData.id }),
    ...(initialData?.staff_id && { staff_id: initialData.staff_id }),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UrlaubData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when field is changed
    if (errors[name as keyof UrlaubData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UrlaubData, string>> = {};
    
    if (!formData.start_date) {
      newErrors.start_date = 'Startdatum ist erforderlich';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Enddatum ist erforderlich';
    }
    
    // Überprüfe, ob das Enddatum nach dem Startdatum liegt
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'Enddatum muss nach Startdatum liegen';
    }
    
    // Wenn halber Tag ausgewählt ist, überprüfe, ob das Datum im Bereich liegt
    if (formData.is_half_day) {
      if (!formData.half_day_date) {
        newErrors.half_day_date = 'Datum für halben Tag ist erforderlich';
      } else if (
        formData.start_date && 
        formData.end_date && 
        (formData.half_day_date < formData.start_date || formData.half_day_date > formData.end_date)
      ) {
        newErrors.half_day_date = 'Datum muss zwischen Start- und Enddatum liegen';
      }
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
      title="Urlaub erfassen"
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
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            icon={<Save size={18} />}
          >
            Speichern
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Von"
            htmlFor="start_date"
            error={errors.start_date}
            required
          >
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              required
            />
          </FormField>
          
          <FormField
            label="Bis"
            htmlFor="end_date"
            error={errors.end_date}
            required
          >
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              required
            />
          </FormField>
        </div>
        
        <div className="flex items-start space-x-2 py-2">
          <div>
            <input
              id="is_half_day"
              name="is_half_day"
              type="checkbox"
              checked={formData.is_half_day}
              onChange={handleChange}
              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 focus:ring-opacity-50 mt-1"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="is_half_day" className="text-sm font-medium text-gray-700">
              Halber Tag
            </label>
            <p className="text-xs text-gray-500">
              Aktivieren, wenn es sich um einen halben Urlaubstag handelt
            </p>
          </div>
        </div>
        
        {formData.is_half_day && (
          <FormField
            label="Datum für halben Tag"
            htmlFor="half_day_date"
            error={errors.half_day_date}
            required
          >
            <input
              id="half_day_date"
              name="half_day_date"
              type="date"
              value={formData.half_day_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              required
            />
          </FormField>
        )}
        
        <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
          <p>Hinweis: Urlaubstage werden automatisch in der Stundenerfassung berücksichtigt.</p>
        </div>
      </form>
    </Modal>
  );
} 