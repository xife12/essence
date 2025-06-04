'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Save, X } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

export type MembershipData = {
  id?: string;
  member_id: string;
  contract_type_id: string;
  term: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'cancelled';
  predecessor_id?: string;
};

type ContractType = {
  id: string;
  name: string;
  terms: number[];
};

type MembershipFormProps = {
  onSubmit: (data: MembershipData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  memberId: string;
  initialData?: Partial<MembershipData>;
  contractTypes: ContractType[];
};

export default function MembershipForm({
  onSubmit,
  onCancel,
  isLoading = false,
  memberId,
  initialData,
  contractTypes,
}: MembershipFormProps) {
  const [formData, setFormData] = useState<MembershipData>({
    member_id: memberId,
    contract_type_id: initialData?.contract_type_id || '',
    term: initialData?.term || (contractTypes[0]?.terms[0] || 12),
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || '',
    status: initialData?.status || 'active',
    ...(initialData?.id && { id: initialData.id }),
    ...(initialData?.predecessor_id && { predecessor_id: initialData.predecessor_id }),
  });
  const [selectedContractType, setSelectedContractType] = useState<ContractType | null>(
    formData.contract_type_id
      ? contractTypes.find(ct => ct.id === formData.contract_type_id) || null
      : contractTypes[0] || null
  );
  const [endDate, setEndDate] = useState<string>('');

  // Funktion zum Formatieren von Datumsangaben für Eingabefelder
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Funktion zum Berechnen des Enddatums basierend auf Startdatum und Laufzeit
  function calculateEndDate(startDate: string, termMonths: number): string {
    if (!startDate || !termMonths) return '';
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + termMonths);
    
    // Korrektur für den letzten Tag des Monats
    end.setDate(end.getDate() - 1);
    
    return formatDateForInput(end);
  }
  
  // Effekt zum Laden der initialen Daten, falls vorhanden
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        contract_type_id: initialData.contract_type_id || '',
        term: initialData.term || 12,
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
        end_date: initialData.end_date || '',
        status: initialData.status || 'active',
        ...(initialData.id && { id: initialData.id }),
        ...(initialData.predecessor_id && { predecessor_id: initialData.predecessor_id }),
      });
    }
  }, [initialData]);
  
  // Effekt zum Aktualisieren des ausgewählten Vertragstyps
  useEffect(() => {
    const selectedType = contractTypes.find(type => type.id === formData.contract_type_id) || null;
    setSelectedContractType(selectedType);
    
    // Wenn Vertragstyp gewechselt wird und es nur eine Laufzeit gibt, diese auswählen
    if (selectedType && selectedType.terms.length === 1) {
      setFormData(prev => ({ ...prev, term: selectedType.terms[0] }));
    } else if (selectedType && selectedType.terms.length > 0 && !formData.term) {
      setFormData(prev => ({ ...prev, term: selectedType.terms[0] }));
    }
  }, [formData.contract_type_id, contractTypes]);
  
  // Effekt zum Berechnen des Enddatums
  useEffect(() => {
    if (formData.start_date && formData.term) {
      const calculatedEndDate = calculateEndDate(formData.start_date, formData.term);
      setEndDate(calculatedEndDate);
    } else {
      setEndDate('');
    }
  }, [formData.start_date, formData.term]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contract_type_id') {
      const contractType = contractTypes.find(ct => ct.id === value) || null;
      setSelectedContractType(contractType);
      
      // If contract type changes, update the term to first available term
      setFormData(prev => ({
        ...prev,
        [name]: value,
        term: contractType?.terms[0] || 12,
      }));
    } else if (name === 'term' || name === 'start_date') {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-calculate end_date when term or start_date changes
        if (newData.start_date && newData.term) {
          const startDate = new Date(newData.start_date);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + parseInt(newData.term as unknown as string));
          newData.end_date = endDate.toISOString().split('T')[0];
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contract_type_id || !formData.term || !formData.start_date) {
      return; // Einfache Validierung
    }
    
    // Bereite die Daten für den API-Aufruf vor
    const submissionData = {
      member_id: memberId,
      contract_type_id: formData.contract_type_id,
      term: formData.term,
      start_date: formData.start_date,
      end_date: endDate,
      status: 'active' as 'active' | 'cancelled',
      ...(formData.id && { id: formData.id }),
      ...(formData.predecessor_id && { predecessor_id: formData.predecessor_id }),
    };
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Vertragsart"
        htmlFor="contract_type_id"
        required
      >
        <select
          id="contract_type_id"
          name="contract_type_id"
          value={formData.contract_type_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          required
        >
          <option value="">Bitte auswählen</option>
          {contractTypes.map(contractType => (
            <option key={contractType.id} value={contractType.id}>
              {contractType.name}
            </option>
          ))}
        </select>
      </FormField>
      
      <FormField
        label="Laufzeit (Monate)"
        htmlFor="term"
        required
      >
        <select
          id="term"
          name="term"
          value={formData.term}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || !selectedContractType}
          required
        >
          <option value="">Bitte auswählen</option>
          {selectedContractType?.terms.map(term => (
            <option key={term} value={term}>
              {term} Monate
            </option>
          ))}
        </select>
      </FormField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Startdatum"
          htmlFor="start_date"
          required
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              required
            />
          </div>
        </FormField>
        
        <FormField
          label="Enddatum"
          htmlFor="end_date"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={endDate}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
              disabled={true}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Wird automatisch berechnet basierend auf Startdatum und Laufzeit.
            </p>
          </div>
        </FormField>
      </div>
      
      {!formData.predecessor_id && (
        <FormField
          label="Status"
          htmlFor="status"
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
            <option value="active">Aktiv</option>
            <option value="cancelled">Gekündigt</option>
          </select>
        </FormField>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          icon={<X size={18} />}
        >
          Abbrechen
        </Button>
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