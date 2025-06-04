'use client';

import React, { useState } from 'react';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import { Save, X } from 'lucide-react';

export type MemberData = {
  id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  member_number?: string;
};

type MemberFormProps = {
  onSubmit: (data: MemberData) => void;
  initialData?: Partial<MemberData>;
  isLoading?: boolean;
  onCancel?: () => void;
};

export default function MemberForm({
  onSubmit,
  initialData,
  isLoading = false,
  onCancel,
}: MemberFormProps) {
  const [formData, setFormData] = useState<MemberData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    birthdate: initialData?.birthdate || '',
    member_number: initialData?.member_number || '',
    ...(initialData?.id && { id: initialData.id }),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MemberData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name as keyof MemberData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MemberData, string>> = {};
    
    if (!formData.first_name) {
      newErrors.first_name = 'Vorname ist erforderlich';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Nachname ist erforderlich';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Vorname"
          htmlFor="first_name"
          error={errors.first_name}
          required
        >
          <input
            id="first_name"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </FormField>
        
        <FormField
          label="Nachname"
          htmlFor="last_name"
          error={errors.last_name}
          required
        >
          <input
            id="last_name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </FormField>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Telefon"
          htmlFor="phone"
          error={errors.phone}
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
        
        <FormField
          label="E-Mail"
          htmlFor="email"
          error={errors.email}
        >
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Geburtsdatum"
          htmlFor="birthdate"
          error={errors.birthdate}
        >
          <input
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
        
        <FormField
          label="Mitgliedsnummer"
          htmlFor="member_number"
          error={errors.member_number}
          helpText="Optional: Nur bei vorhandenem Altbestand"
        >
          <input
            id="member_number"
            name="member_number"
            type="text"
            value={formData.member_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button 
            type="button"
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
            icon={<X size={18} />}
          >
            Abbrechen
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          icon={<Save size={18} />}
        >
          Speichern
        </Button>
      </div>
    </form>
  );
} 