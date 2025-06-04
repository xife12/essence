'use client';

import React, { useState, useEffect } from 'react';
import FormField from '../ui/FormField';
import Button from '../ui/Button';
import { Save, X, Plus, Trash } from 'lucide-react';

export type LeadData = {
  id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  source?: string;
  status: 'open' | 'consultation' | 'converted' | 'lost' | 'contacted' | 'appointment';
  campaign_id?: string;
  member_number?: string;
  // Felder für Status "converted" (Mitglied)
  contract_type_id?: string;
  contract_term?: number;
  contract_start_date?: string;
  group_discount?: boolean;
  additional_modules?: string[];
  // Felder für Status "contacted" (Kontaktiert)
  contact_attempts?: Array<{
    date: string;
    method: string;
    staff: string;
    notes?: string;
  }>;
  // Felder für Status "lost" (Verloren)
  lost_reason?: string;
  // Felder für Status "appointment" (Terminiert)
  appointment_date?: string;
  appointment_time?: string;
};

type Campaign = {
  id: string;
  name: string;
};

type ContractType = {
  id: string;
  name: string;
  terms: number[];
  monthly_fee: number;
  group_discount_enabled: boolean;
  group_discount_value?: number;
  modules_included?: string[];
  modules_optional?: string[];
};

type Module = {
  id: string;
  name: string;
  price: number;
};

type LeadFormProps = {
  onSubmit: (data: LeadData) => void;
  initialData?: Partial<LeadData>;
  campaigns?: Campaign[];
  contractTypes?: ContractType[];
  modules?: Module[];
  isLoading?: boolean;
  onCancel?: () => void;
};

const SOURCE_OPTIONS = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'website', label: 'Webseite' },
  { value: 'referral', label: 'Empfehlung' },
  { value: 'walk_in', label: 'Walk-In' },
  { value: 'phone', label: 'Telefonisch' },
  { value: 'email', label: 'E-Mail' },
  { value: 'event', label: 'Veranstaltung' },
  { value: 'other', label: 'Sonstiges' },
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Offen' },
  { value: 'contacted', label: 'Kontaktiert' },
  { value: 'appointment', label: 'Terminiert' },
  { value: 'consultation', label: 'In Beratung' },
  { value: 'converted', label: 'Konvertiert (Mitglied)' },
  { value: 'lost', label: 'Verloren' },
];

const CONTACT_METHODS = [
  { value: 'phone', label: 'Telefon' },
  { value: 'email', label: 'E-Mail' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'in_person', label: 'Persönlich' },
  { value: 'other', label: 'Sonstiges' },
];

const STAFF_MEMBERS = [
  { value: 'staff1', label: 'Max Mustermann' },
  { value: 'staff2', label: 'Anna Schmidt' },
  { value: 'staff3', label: 'Thomas Müller' },
];

export default function LeadForm({
  onSubmit,
  initialData,
  campaigns = [],
  contractTypes = [],
  modules = [],
  isLoading = false,
  onCancel,
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    birthdate: initialData?.birthdate || '',
    source: initialData?.source || '',
    status: initialData?.status || 'open',
    campaign_id: initialData?.campaign_id || '',
    member_number: initialData?.member_number || '',
    // Zusätzliche Felder
    contract_type_id: initialData?.contract_type_id || '',
    contract_term: initialData?.contract_term || undefined,
    contract_start_date: initialData?.contract_start_date || new Date().toISOString().split('T')[0],
    group_discount: initialData?.group_discount || false,
    additional_modules: initialData?.additional_modules || [],
    contact_attempts: initialData?.contact_attempts || [{ date: new Date().toISOString().split('T')[0], method: 'phone', staff: '', notes: '' }],
    lost_reason: initialData?.lost_reason || '',
    appointment_date: initialData?.appointment_date || new Date().toISOString().split('T')[0],
    appointment_time: initialData?.appointment_time || '10:00',
    ...(initialData?.id && { id: initialData.id }),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadData, string>>>({});
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(null);

  // Aktualisiere den ausgewählten Vertragstyp, wenn sich contract_type_id ändert
  useEffect(() => {
    if (formData.contract_type_id) {
      const contractType = contractTypes.find(ct => ct.id === formData.contract_type_id) || null;
      setSelectedContractType(contractType);

      // Setze die erste verfügbare Laufzeit, wenn noch keine ausgewählt ist
      if (contractType && !formData.contract_term && contractType.terms.length > 0) {
        setFormData(prev => ({
          ...prev,
          contract_term: contractType.terms[0]
        }));
      }
    } else {
      setSelectedContractType(null);
    }
  }, [formData.contract_type_id, contractTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (e.target as HTMLInputElement).checked 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Zusätzliche Logik für bestimmte Felder
    if (name === 'status') {
      // Status wurde geändert, setze Standardwerte für den neuen Status
      const newStatus = value as LeadData['status'];
      
      if (newStatus === 'appointment' && !formData.appointment_date) {
        // Setze Standarddatum für Termin, wenn nicht vorhanden
        setFormData(prev => ({
          ...prev,
          status: newStatus,
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: '10:00'
        }));
      } else if (newStatus === 'contacted' && (!formData.contact_attempts || formData.contact_attempts.length === 0)) {
        // Setze leeren Kontaktversuch, wenn nicht vorhanden
        setFormData(prev => ({
          ...prev,
          status: newStatus,
          contact_attempts: [{ date: new Date().toISOString().split('T')[0], method: 'phone', staff: '', notes: '' }]
        }));
      } else {
        setFormData(prev => ({ ...prev, status: newStatus }));
      }
    }
    
    // Clear error when field is changed
    if (errors[name as keyof LeadData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setFormData(prev => {
      const currentModules = prev.additional_modules || [];
      const isSelected = currentModules.includes(moduleId);
      
      if (isSelected) {
        return { ...prev, additional_modules: currentModules.filter(id => id !== moduleId) };
      } else {
        return { ...prev, additional_modules: [...currentModules, moduleId] };
      }
    });
  };

  const handleContactAttemptChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newContactAttempts = [...(prev.contact_attempts || [])];
      
      if (newContactAttempts[index]) {
        newContactAttempts[index] = {
          ...newContactAttempts[index],
          [field]: value
        };
      }
      
      return { ...prev, contact_attempts: newContactAttempts };
    });
  };

  const addContactAttempt = () => {
    setFormData(prev => ({
      ...prev,
      contact_attempts: [
        ...(prev.contact_attempts || []),
        { date: new Date().toISOString().split('T')[0], method: 'phone', staff: '', notes: '' }
      ]
    }));
  };

  const removeContactAttempt = (index: number) => {
    setFormData(prev => {
      const newContactAttempts = [...(prev.contact_attempts || [])];
      newContactAttempts.splice(index, 1);
      return { ...prev, contact_attempts: newContactAttempts };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadData, string>> = {};
    
    if (!formData.first_name) {
      newErrors.first_name = 'Vorname ist erforderlich';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Nachname ist erforderlich';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    // Validierung abhängig vom Status
    switch (formData.status) {
      case 'converted':
        if (!formData.contract_type_id) {
          newErrors.contract_type_id = 'Bitte wählen Sie eine Vertragsart';
        }
        if (!formData.contract_start_date) {
          newErrors.contract_start_date = 'Bitte geben Sie ein Startdatum an';
        }
        break;
        
      case 'lost':
        if (!formData.lost_reason) {
          newErrors.lost_reason = 'Bitte geben Sie einen Grund an';
        }
        break;
        
      case 'appointment':
        if (!formData.appointment_date) {
          newErrors.appointment_date = 'Bitte geben Sie ein Datum an';
        }
        if (!formData.appointment_time) {
          newErrors.appointment_time = 'Bitte geben Sie eine Uhrzeit an';
        }
        break;
        
      case 'contacted':
        if (!formData.contact_attempts || formData.contact_attempts.length === 0) {
          newErrors.contact_attempts = 'Bitte geben Sie mindestens einen Kontaktversuch an';
        } else {
          formData.contact_attempts.forEach((attempt, index) => {
            if (!attempt.staff) {
              newErrors[`contact_attempts_${index}_staff` as keyof LeadData] = 'Bitte wählen Sie einen Mitarbeiter';
            }
          });
        }
        break;
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Quelle"
          htmlFor="source"
          error={errors.source}
        >
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte auswählen</option>
            {SOURCE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField
          label="Kampagne"
          htmlFor="campaign_id"
          error={errors.campaign_id}
        >
          <select
            id="campaign_id"
            name="campaign_id"
            value={formData.campaign_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Keine Kampagne</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      
      <FormField
        label="Status"
        htmlFor="status"
        error={errors.status}
        required
      >
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
      
      {/* Zusätzliche Felder je nach Status */}
      {formData.status === 'converted' && (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-4">Mitgliedschaftsdaten</h3>
          
          <FormField
            label="Vertragsart"
            htmlFor="contract_type_id"
            error={errors.contract_type_id}
            required
          >
            <select
              id="contract_type_id"
              name="contract_type_id"
              value={formData.contract_type_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Bitte auswählen</option>
              {contractTypes.map(contractType => (
                <option key={contractType.id} value={contractType.id}>
                  {contractType.name} - {contractType.monthly_fee.toFixed(2)} €/Monat
                </option>
              ))}
            </select>
          </FormField>
          
          {selectedContractType && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  label="Laufzeit"
                  htmlFor="contract_term"
                  error={errors.contract_term}
                  required
                >
                  <select
                    id="contract_term"
                    name="contract_term"
                    value={formData.contract_term}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Bitte auswählen</option>
                    {selectedContractType.terms.map(term => (
                      <option key={term} value={term}>
                        {term} Monate
                      </option>
                    ))}
                  </select>
                </FormField>
                
                <FormField
                  label="Vertragsbeginn"
                  htmlFor="contract_start_date"
                  error={errors.contract_start_date}
                  required
                >
                  <input
                    id="contract_start_date"
                    name="contract_start_date"
                    type="date"
                    value={formData.contract_start_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </FormField>
              </div>
              
              {selectedContractType.group_discount_enabled && (
                <div className="mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="group_discount"
                      checked={formData.group_discount}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>
                      Gruppenrabatt aktivieren ({selectedContractType.group_discount_value || 0}% Rabatt)
                    </span>
                  </label>
                </div>
              )}
              
              {selectedContractType.modules_optional && selectedContractType.modules_optional.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Zusatzmodule</h4>
                  <div className="space-y-2">
                    {modules
                      .filter(module => selectedContractType.modules_optional?.includes(module.id))
                      .map(module => (
                        <label key={module.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.additional_modules?.includes(module.id)}
                            onChange={() => handleModuleChange(module.id)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span>
                            {module.name} (+{module.price.toFixed(2)} €/Monat)
                          </span>
                        </label>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {selectedContractType.modules_included && selectedContractType.modules_included.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Inkludierte Module</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {modules
                      .filter(module => selectedContractType.modules_included?.includes(module.id))
                      .map(module => (
                        <li key={module.id}>{module.name} (inklusive)</li>
                      ))
                    }
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {formData.status === 'contacted' && (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Kontaktversuche</h3>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={addContactAttempt}
              icon={<Plus size={16} />}
            >
              Kontaktversuch hinzufügen
            </Button>
          </div>
          
          {errors.contact_attempts && (
            <p className="text-red-500 text-sm mb-2">{errors.contact_attempts}</p>
          )}
          
          {formData.contact_attempts && formData.contact_attempts.length > 0 ? (
            <div className="space-y-4">
              {formData.contact_attempts.map((attempt, index) => (
                <div key={index} className="border border-gray-200 rounded p-3 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Kontaktversuch #{index + 1}</h4>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeContactAttempt(index)}
                      icon={<Trash size={16} />}
                    >
                      Entfernen
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      label="Datum"
                      htmlFor={`contact_attempt_${index}_date`}
                      error={errors[`contact_attempts_${index}_date` as keyof LeadData]}
                    >
                      <input
                        id={`contact_attempt_${index}_date`}
                        type="date"
                        value={attempt.date}
                        onChange={(e) => handleContactAttemptChange(index, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                    
                    <FormField
                      label="Methode"
                      htmlFor={`contact_attempt_${index}_method`}
                      error={errors[`contact_attempts_${index}_method` as keyof LeadData]}
                    >
                      <select
                        id={`contact_attempt_${index}_method`}
                        value={attempt.method}
                        onChange={(e) => handleContactAttemptChange(index, 'method', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CONTACT_METHODS.map(method => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    
                    <FormField
                      label="Mitarbeiter"
                      htmlFor={`contact_attempt_${index}_staff`}
                      error={errors[`contact_attempts_${index}_staff` as keyof LeadData]}
                    >
                      <select
                        id={`contact_attempt_${index}_staff`}
                        value={attempt.staff}
                        onChange={(e) => handleContactAttemptChange(index, 'staff', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Bitte auswählen</option>
                        {STAFF_MEMBERS.map(staff => (
                          <option key={staff.value} value={staff.value}>
                            {staff.label}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  
                  <FormField
                    label="Notizen"
                    htmlFor={`contact_attempt_${index}_notes`}
                    error={errors[`contact_attempts_${index}_notes` as keyof LeadData]}
                  >
                    <textarea
                      id={`contact_attempt_${index}_notes`}
                      value={attempt.notes}
                      onChange={(e) => handleContactAttemptChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </FormField>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Keine Kontaktversuche vorhanden. Fügen Sie einen hinzu.</p>
          )}
        </div>
      )}
      
      {formData.status === 'lost' && (
        <FormField
          label="Grund"
          htmlFor="lost_reason"
          error={errors.lost_reason}
          required
        >
          <textarea
            id="lost_reason"
            name="lost_reason"
            value={formData.lost_reason}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Warum wurde der Lead verloren?"
            required
          />
        </FormField>
      )}
      
      {formData.status === 'appointment' && (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-4">Termindaten</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Datum"
              htmlFor="appointment_date"
              error={errors.appointment_date}
              required
            >
              <input
                id="appointment_date"
                name="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </FormField>
            
            <FormField
              label="Uhrzeit"
              htmlFor="appointment_time"
              error={errors.appointment_time}
              required
            >
              <input
                id="appointment_time"
                name="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </FormField>
          </div>
        </div>
      )}
      
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