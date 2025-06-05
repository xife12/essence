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
  status: 'active' | 'cancelled' | 'completed' | 'suspended' | 'planned';
  predecessor_id?: string;
};

type ContractType = {
  id: string;
  name: string;
  terms: number[];
  has_group_discount?: boolean;
  group_discount_rate?: number;
  extras?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
  campaigns?: string[];
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
  const [hasGroupDiscount, setHasGroupDiscount] = useState<boolean>(false);
  const [selectedExtras, setSelectedExtras] = useState<Array<{id: string, name: string, price?: number, included: boolean}>>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');

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
    
    // Stelle sicher, dass termMonths als Zahl behandelt wird
    const months = typeof termMonths === 'string' ? parseInt(termMonths, 10) : termMonths;
    
    // Parse das Startdatum
    const start = new Date(startDate);
    
    // Berechne das Enddatum manuell, um Probleme mit der JavaScript-Datumsberechnung zu vermeiden
    let year = start.getFullYear();
    let month = start.getMonth(); // 0-11
    let day = start.getDate();
    
    // Füge Monate hinzu und korrigiere das Jahr, wenn nötig
    month += months;
    year += Math.floor(month / 12);
    month = month % 12;
    
    // Erstelle das neue Datum
    const end = new Date(year, month, day);
    
    // Korrektur für den letzten Tag des Monats
    // Wenn der letzte Tag des aktuellen Monats kleiner ist als der Tag des Startdatums,
    // setze den Tag auf den letzten Tag des Monats
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
      const termValue = typeof formData.term === 'string' ? parseInt(formData.term, 10) : formData.term;
      const calculatedEndDate = calculateEndDate(formData.start_date, termValue);
      setEndDate(calculatedEndDate);
      
      // Aktualisiere auch das formData.end_date
      setFormData(prev => ({
        ...prev,
        end_date: calculatedEndDate
      }));
    } else {
      setEndDate('');
    }
  }, [formData.start_date, formData.term]);
  
  // Effekt zum Aktualisieren der ausgewählten Extras, wenn der Vertragstyp sich ändert
  useEffect(() => {
    if (selectedContractType && selectedContractType.extras) {
      // Initialisiere die Extras mit "nicht ausgewählt"
      const initialExtras = selectedContractType.extras.map(extra => ({
        ...extra,
        included: false
      }));
      setSelectedExtras(initialExtras);
    } else {
      setSelectedExtras([]);
    }
  }, [selectedContractType]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'contract_type_id') {
      const contractType = contractTypes.find(ct => ct.id === value) || null;
      setSelectedContractType(contractType);
      
      // If contract type changes, update the term to first available term
      const newTerm = contractType?.terms[0] || 12;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        term: newTerm,
      }));
      
      // Da wir term geändert haben, berechnen wir auch das neue Enddatum
      if (formData.start_date && newTerm) {
        const newEndDate = calculateEndDate(formData.start_date, newTerm);
        setEndDate(newEndDate);
        // Aktualisiere formData.end_date direkt
        setFormData(prev => ({
          ...prev,
          [name]: value,
          term: newTerm,
          end_date: newEndDate
        }));
      }
    } else if (name === 'term') {
      // Stelle sicher, dass term als Zahl behandelt wird
      const termValue = parseInt(value, 10);
      setFormData(prev => {
        const newData = { ...prev, [name]: termValue };
        
        // Auto-calculate end_date when term changes
        if (newData.start_date && termValue) {
          const newEndDate = calculateEndDate(newData.start_date, termValue);
          setEndDate(newEndDate);
          newData.end_date = newEndDate;
        }
        
        return newData;
      });
    } else if (name === 'start_date') {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-calculate end_date when start_date changes
        if (value && prev.term) {
          const termValue = typeof prev.term === 'string' ? parseInt(prev.term, 10) : prev.term;
          const newEndDate = calculateEndDate(value, termValue);
          setEndDate(newEndDate);
          newData.end_date = newEndDate;
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleExtrasChange = (extraId: string, checked: boolean) => {
    setSelectedExtras(prev => 
      prev.map(extra => 
        extra.id === extraId ? { ...extra, included: checked } : extra
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contract_type_id || !formData.term || !formData.start_date) {
      return; // Einfache Validierung
    }
    
    // Filtere nur die ausgewählten Extras
    const includedExtras = selectedExtras.filter(extra => extra.included);
    
    // Bereite die Daten für den API-Aufruf vor
    const submissionData = {
      member_id: memberId,
      contract_type_id: formData.contract_type_id,
      term: formData.term,
      start_date: formData.start_date,
      end_date: endDate,
      status: 'active' as 'active' | 'cancelled' | 'completed' | 'suspended' | 'planned',
      has_group_discount: hasGroupDiscount,
      extras: includedExtras.length > 0 ? includedExtras : undefined,
      campaign_name: selectedCampaign || undefined,
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
      
      {/* Gruppenrabatt, wenn verfügbar */}
      {selectedContractType?.has_group_discount && (
        <div className="mt-4">
          <div className="flex items-center">
            <input
              id="group_discount"
              name="group_discount"
              type="checkbox"
              checked={hasGroupDiscount}
              onChange={(e) => setHasGroupDiscount(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="group_discount" className="ml-2 block text-sm text-gray-900">
              Gruppenrabatt aktivieren
              {selectedContractType.group_discount_rate && (
                <span className="text-green-600 ml-1">
                  ({selectedContractType.group_discount_rate}% Rabatt)
                </span>
              )}
            </label>
          </div>
        </div>
      )}
      
      {/* Zusatzleistungen, wenn verfügbar */}
      {selectedContractType?.extras && selectedContractType.extras.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zusatzleistungen
          </label>
          <div className="space-y-2 border p-3 rounded-md bg-gray-50">
            {selectedExtras.map(extra => (
              <div key={extra.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id={`extra-${extra.id}`}
                    name={`extra-${extra.id}`}
                    type="checkbox"
                    checked={extra.included}
                    onChange={(e) => handleExtrasChange(extra.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor={`extra-${extra.id}`} className="ml-2 block text-sm text-gray-900">
                    {extra.name}
                  </label>
                </div>
                {extra.price && (
                  <span className="text-sm text-gray-500">
                    +{extra.price.toFixed(2)} €/Monat
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Aktionsauswahl, wenn verfügbar */}
      {selectedContractType?.campaigns && selectedContractType.campaigns.length > 0 && (
        <FormField
          label="Abgeschlossen im Rahmen der Aktion"
          htmlFor="campaign"
        >
          <select
            id="campaign"
            name="campaign"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Keine Aktion ausgewählt</option>
            {selectedContractType.campaigns.map(campaign => (
              <option key={campaign} value={campaign}>
                {campaign}
              </option>
            ))}
          </select>
        </FormField>
      )}
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
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
          disabled={isLoading}
          isLoading={isLoading}
          icon={<Save size={18} />}
        >
          Speichern
        </Button>
      </div>
    </form>
  );
} 