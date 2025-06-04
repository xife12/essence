'use client';

import React, { useState } from 'react';
import { File, Plus, Check, X, Clock, BarChart3, Repeat, Edit, Tag, Percent } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Badge from '../../components/ui/Badge';

// Typdefinitionen
type ContractType = {
  id: string;
  name: string;
  description?: string;
  terms: Array<{duration: number, price: number}>;
  group_discount_enabled: boolean;
  group_discount_type: 'percent' | 'fixed'; // Prozent oder fester Betrag
  group_discount_value: number;
  auto_renew: boolean;
  renewal_term?: number;
  active: boolean;
  modules_included: string[];
  modules_optional: string[];
  cancellation_period: number;
  cancellation_unit: 'days' | 'months';
};

type Module = {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  category?: string;
};

// Dummy-Daten
const INITIAL_CONTRACT_TYPES: ContractType[] = [
  { 
    id: '1', 
    name: 'Premium',
    description: 'Premium-Vertrag mit allen Features',
    terms: [
      {duration: 12, price: 59.90},
      {duration: 24, price: 49.90}
    ],
    group_discount_enabled: true,
    group_discount_type: 'percent',
    group_discount_value: 15,
    auto_renew: true,
    renewal_term: 12,
    active: true,
    modules_included: ['1', '2'],
    modules_optional: ['3', '4'],
    cancellation_period: 30,
    cancellation_unit: 'days'
  },
  { 
    id: '2', 
    name: 'Standard',
    description: 'Standard-Vertrag mit allen wichtigen Features',
    terms: [
      {duration: 12, price: 39.90},
      {duration: 24, price: 34.90},
      {duration: 36, price: 29.90}
    ],
    group_discount_enabled: true,
    group_discount_type: 'fixed',
    group_discount_value: 10,
    auto_renew: true,
    renewal_term: 12,
    active: true,
    modules_included: ['1'],
    modules_optional: ['2', '3'],
    cancellation_period: 60,
    cancellation_unit: 'days'
  },
  { 
    id: '3', 
    name: 'Basic',
    description: 'Basisvertrag mit essentiellen Features',
    terms: [
      {duration: 12, price: 29.90}
    ],
    group_discount_enabled: false,
    group_discount_type: 'percent',
    group_discount_value: 0,
    auto_renew: false,
    active: true,
    modules_included: [],
    modules_optional: ['1', '2', '3', '4'],
    cancellation_period: 2,
    cancellation_unit: 'months'
  },
  { 
    id: '4', 
    name: 'Flex',
    description: 'Flexibler Vertrag ohne lange Bindung',
    terms: [
      {duration: 1, price: 69.90},
      {duration: 3, price: 59.90}
    ],
    group_discount_enabled: false,
    group_discount_type: 'percent',
    group_discount_value: 0,
    auto_renew: true,
    renewal_term: 1,
    active: false,
    modules_included: [],
    modules_optional: ['1', '2', '3', '4'],
    cancellation_period: 14,
    cancellation_unit: 'days'
  },
];

// Dummy-Module
const MODULES: Module[] = [
  { 
    id: '1', 
    name: 'Kurse', 
    description: 'Zugang zu allen Gruppenkursen', 
    price: 10.00, 
    active: true,
    category: 'Basis'
  },
  { 
    id: '2', 
    name: 'Sauna', 
    description: 'Zugang zum Wellness- und Saunabereich', 
    price: 15.00, 
    active: true,
    category: 'Wellness' 
  },
  { 
    id: '3', 
    name: 'Personal Training', 
    description: '1 Stunde Personal Training pro Woche', 
    price: 30.00, 
    active: true,
    category: 'Training'
  },
  { 
    id: '4', 
    name: 'Getränkeflatrate', 
    description: 'Unbegrenzter Zugang zu Getränken während des Trainings', 
    price: 20.00, 
    active: true,
    category: 'Extras'
  },
];

export default function VertragsartenPage() {
  const [contractTypes, setContractTypes] = useState<ContractType[]>(INITIAL_CONTRACT_TYPES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState<ContractType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form-Zustand
  const [formData, setFormData] = useState<Omit<ContractType, 'id'>>({
    name: '',
    description: '',
    terms: [{duration: 12, price: 0}],
    group_discount_enabled: false,
    group_discount_type: 'percent',
    group_discount_value: 0,
    auto_renew: false,
    renewal_term: undefined,
    active: true,
    modules_included: [],
    modules_optional: [],
    cancellation_period: 30,
    cancellation_unit: 'days',
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      terms: [{duration: 12, price: 0}],
      group_discount_enabled: false,
      group_discount_type: 'percent',
      group_discount_value: 0,
      auto_renew: false,
      renewal_term: undefined,
      active: true,
      modules_included: [],
      modules_optional: [],
      cancellation_period: 30,
      cancellation_unit: 'days',
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (e.target as HTMLInputElement).checked 
      }));
    } else if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleModuleChange = (moduleId: string, field: 'modules_included' | 'modules_optional') => {
    setFormData(prev => {
      const currentModules = [...prev[field]];
      const index = currentModules.indexOf(moduleId);
      
      if (index === -1) {
        return { ...prev, [field]: [...currentModules, moduleId] };
      } else {
        currentModules.splice(index, 1);
        return { ...prev, [field]: currentModules };
      }
    });
  };
  
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const newContract: ContractType = {
        ...formData,
        id: `contract-${Date.now()}`,
      };
      
      setContractTypes(prev => [...prev, newContract]);
      setIsLoading(false);
      setIsCreateModalOpen(false);
      resetForm();
    }, 500);
  };
  
  const handleEditContract = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (currentContract) {
        setContractTypes(prev => prev.map(contract => 
          contract.id === currentContract.id ? { ...formData, id: currentContract.id } : contract
        ));
      }
      setIsLoading(false);
      setIsEditModalOpen(false);
      setCurrentContract(null);
      resetForm();
    }, 500);
  };
  
  const handleDeleteContract = () => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (currentContract) {
        setContractTypes(prev => prev.filter(contract => contract.id !== currentContract.id));
      }
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCurrentContract(null);
    }, 500);
  };
  
  const openEditModal = (contract: ContractType) => {
    setCurrentContract(contract);
    setFormData({
      name: contract.name,
      description: contract.description || '',
      terms: [...contract.terms],
      group_discount_enabled: contract.group_discount_enabled,
      group_discount_type: contract.group_discount_type,
      group_discount_value: contract.group_discount_value,
      auto_renew: contract.auto_renew,
      renewal_term: contract.renewal_term,
      active: contract.active,
      modules_included: [...contract.modules_included],
      modules_optional: [...contract.modules_optional],
      cancellation_period: contract.cancellation_period,
      cancellation_unit: contract.cancellation_unit,
    });
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (contract: ContractType) => {
    setCurrentContract(contract);
    setIsDeleteModalOpen(true);
  };
  
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} €`;
  };
  
  const getModuleNames = (moduleIds: string[]): string => {
    return moduleIds
      .map(id => MODULES.find(m => m.id === id)?.name || '')
      .filter(Boolean)
      .join(', ');
  };

  // Neue Handler-Funktionen für die dynamischen Laufzeiten
  const handleAddTerm = () => {
    setFormData(prev => {
      // Standardpreis basierend auf dem Durchschnitt der vorhandenen Preise oder 0, wenn keine vorhanden
      const defaultPrice = prev.terms.length > 0 
        ? prev.terms.reduce((sum, term) => sum + term.price, 0) / prev.terms.length 
        : 0;
      
      return {
        ...prev,
        terms: [...prev.terms, {duration: 0, price: defaultPrice}]
      };
    });
  };

  const handleRemoveTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index)
    }));
  };

  const handleTermChange = (index: number, field: 'duration' | 'price', value: number) => {
    setFormData(prev => {
      const newTerms = [...prev.terms];
      newTerms[index] = {
        ...newTerms[index],
        [field]: value
      };
      return {
        ...prev,
        terms: newTerms
      };
    });
  };
  
  const renderContractForm = (formType: 'create' | 'edit') => {
    const isCreate = formType === 'create';
    const formId = isCreate ? '' : 'edit-';
    
    return (
      <form onSubmit={isCreate ? handleCreateContract : handleEditContract}>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormField
            label="Name"
            htmlFor={`${formId}name`}
            required
          >
            <input
              id={`${formId}name`}
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
        </div>
        
        <FormField
          label="Beschreibung"
          htmlFor={`${formId}description`}
        >
          <textarea
            id={`${formId}description`}
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </FormField>
        
        {/* Laufzeiten mit dynamischer Hinzufügung */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Verfügbare Laufzeiten</label>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Plus size={16} />}
              onClick={handleAddTerm}
            >
              Laufzeit hinzufügen
            </Button>
          </div>
          
          <div className="space-y-3 border border-gray-200 rounded-md p-3">
            {formData.terms.map((term, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-grow grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Laufzeit (Monate)</label>
                    <input
                      type="number"
                      min="1"
                      value={term.duration}
                      onChange={(e) => handleTermChange(index, 'duration', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Preis/Monat (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={term.price}
                      onChange={(e) => handleTermChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {formData.terms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<X size={16} />}
                    onClick={() => handleRemoveTerm(index)}
                    className="mt-5"
                  >
                    Entfernen
                  </Button>
                )}
              </div>
            ))}
            {formData.terms.length === 0 && (
              <p className="text-sm text-gray-500 p-2">
                Bitte fügen Sie mindestens eine Laufzeit hinzu.
              </p>
            )}
          </div>
        </div>
        
        {/* Kündigungsfrist */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Kündigungsfrist</label>
          <div className="flex gap-3">
            <div className="flex-grow">
              <input
                type="number"
                min="1"
                value={formData.cancellation_period}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cancellation_period: parseInt(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/3">
              <select
                value={formData.cancellation_unit}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cancellation_unit: e.target.value as 'days' | 'months'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="days">Tage</option>
                <option value="months">Monate</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="group_discount_enabled"
                checked={formData.group_discount_enabled}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Gruppenrabatt aktivieren</span>
            </label>
          </div>
          
          {formData.group_discount_enabled && (
            <div className="pl-6 border-l-2 border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rabatttyp</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="group_discount_type"
                      value="percent"
                      checked={formData.group_discount_type === 'percent'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Prozent (%)</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="group_discount_type"
                      value="fixed"
                      checked={formData.group_discount_type === 'fixed'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Fester Betrag (€)</span>
                  </label>
                </div>
              </div>
              
              <FormField
                label={formData.group_discount_type === 'percent' ? 'Rabatt (%)' : 'Rabatt (€)'}
                htmlFor={`${formId}group_discount_value`}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.group_discount_type === 'percent' ? (
                      <Percent size={16} className="text-gray-400" />
                    ) : (
                      <span className="text-gray-400">€</span>
                    )}
                  </div>
                  <input
                    id={`${formId}group_discount_value`}
                    name="group_discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.group_discount_type === 'percent' ? 100 : undefined}
                    value={formData.group_discount_value}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </FormField>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="auto_renew"
                checked={formData.auto_renew}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>Automatische Verlängerung aktivieren</span>
            </label>
          </div>
          
          {formData.auto_renew && (
            <div className="pl-6 border-l-2 border-gray-200">
              <FormField
                label="Verlängerungszeitraum (Monate)"
                htmlFor={`${formId}renewal_term`}
              >
                <input
                  id={`${formId}renewal_term`}
                  name="renewal_term"
                  type="number"
                  min="1"
                  value={formData.renewal_term || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Enthaltene Module</h3>
          <div className="space-y-2 border border-gray-200 rounded p-3 bg-gray-50">
            {MODULES.map(module => (
              <label key={module.id} className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.modules_included.includes(module.id)}
                    onChange={() => handleModuleChange(module.id, 'modules_included')}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">{module.name}</span>
                </div>
                <span className="text-sm text-gray-500">(im Preis enthalten)</span>
              </label>
            ))}
            {MODULES.length === 0 && (
              <p className="text-sm text-gray-500 p-2">Keine Module verfügbar. <Link href="/vertragsarten/module" className="text-blue-500 hover:underline">Module verwalten</Link></p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Optionale Module (zubuchbar)</h3>
          <div className="space-y-2 border border-gray-200 rounded p-3 bg-gray-50">
            {MODULES.map(module => (
              <label key={module.id} className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.modules_optional.includes(module.id)}
                    onChange={() => handleModuleChange(module.id, 'modules_optional')}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">{module.name}</span>
                </div>
                <span className="text-sm text-gray-500">+{formatPrice(module.price)}/Monat</span>
              </label>
            ))}
            {MODULES.length === 0 && (
              <p className="text-sm text-gray-500 p-2">Keine Module verfügbar. <Link href="/vertragsarten/module" className="text-blue-500 hover:underline">Module verwalten</Link></p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Aktiv</span>
          </label>
        </div>
      </form>
    );
  };

  const activeContracts = contractTypes.filter(c => c.active);

  return (
    <div>
      <PageHeader
        title="Vertragsarten"
        description="Verwaltung von Verträgen und Konditionen"
        action={{
          label: "Neue Vertragsart",
          icon: <Plus size={18} />,
          onClick: () => setIsCreateModalOpen(true),
        }}
      />
      
      <div className="mb-6 flex flex-wrap gap-4">
        <Link href="/vertragsarten/module">
          <Button
            variant="outline"
            icon={<Tag size={18} />}
          >
            Module verwalten
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {activeContracts.map((contract) => (
          <Card
            key={contract.id}
            className="overflow-hidden"
            title={contract.name}
            icon={<File size={18} />}
            footer={
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openEditModal(contract)}
                >
                  Details & Bearbeiten
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                {formatPrice(contract.terms[0].price)}
                <span className="text-sm font-normal text-gray-500"> / Monat</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Clock size={18} className="text-gray-400 mt-1" />
                  <div>
                    <span className="font-medium">Laufzeiten:</span>
                    <ul className="text-sm mt-1 space-y-1">
                      {contract.terms.map((term, index) => (
                        <li key={index}>
                          {term.duration} {term.duration === 1 ? 'Monat' : 'Monate'}: {formatPrice(term.price)}/Monat
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                
                <li className="flex items-center gap-2">
                  {contract.auto_renew ? (
                    <>
                      <Check size={18} className="text-green-500" />
                      <span>Automatische Verlängerung um {contract.renewal_term} {contract.renewal_term === 1 ? 'Monat' : 'Monate'}</span>
                    </>
                  ) : (
                    <>
                      <X size={18} className="text-red-500" />
                      <span className="text-gray-500">Keine automatische Verlängerung</span>
                    </>
                  )}
                </li>
                
                <li className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  <span>
                    Kündigungsfrist: {contract.cancellation_period} {contract.cancellation_unit === 'days' ? 'Tage' : 'Monate'}
                  </span>
                </li>
                
                <li className="flex items-center gap-2">
                  {contract.group_discount_enabled ? (
                    <>
                      <Check size={18} className="text-green-500" />
                      <span>
                        Gruppenrabatt: {contract.group_discount_type === 'percent' 
                          ? `${contract.group_discount_value}%` 
                          : formatPrice(contract.group_discount_value)}
                      </span>
                    </>
                  ) : (
                    <>
                      <X size={18} className="text-red-500" />
                      <span className="text-gray-500">Kein Gruppenrabatt</span>
                    </>
                  )}
                </li>
                
                {contract.modules_included.length > 0 && (
                  <li className="flex items-start gap-2">
                    <Check size={18} className="text-green-500 mt-1" />
                    <div>
                      <span className="font-medium">Inklusive:</span>
                      <div className="text-sm">{getModuleNames(contract.modules_included)}</div>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Laufzeit</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Basispreis</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Gruppenrabatt</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Module</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {contractTypes.map((contract) => (
                <tr key={contract.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 p-1.5 rounded">
                        <File size={16} className="text-blue-500" />
                      </div>
                      <span>{contract.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {contract.terms.sort((a, b) => a.duration - b.duration).map(t => t.duration).join(', ')} Monate
                  </td>
                  <td className="px-4 py-3">{formatPrice(contract.terms[0].price)} / Monat</td>
                  <td className="px-4 py-3">
                    {contract.group_discount_enabled ? (
                      contract.group_discount_type === 'percent' 
                        ? `${contract.group_discount_value}%` 
                        : formatPrice(contract.group_discount_value)
                    ) : 'Nein'}
                  </td>
                  <td className="px-4 py-3">
                    {contract.modules_included.length > 0 || contract.modules_optional.length > 0 ? 'Ja' : 'Nein'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={contract.active ? 'green' : 'gray'}>
                      {contract.active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(contract)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(contract)}
                      >
                        Löschen
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Erstellungs-Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Neue Vertragsart erstellen"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)} 
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateContract}
              isLoading={isLoading}
              disabled={formData.terms.length === 0}
            >
              Vertragsart erstellen
            </Button>
          </>
        }
        size="lg"
      >
        {renderContractForm('create')}
      </Modal>

      {/* Bearbeitungs-Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Vertragsart bearbeiten: ${currentContract?.name}`}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)} 
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={handleEditContract}
              isLoading={isLoading}
              disabled={formData.terms.length === 0}
            >
              Speichern
            </Button>
          </>
        }
        size="lg"
      >
        {renderContractForm('edit')}
      </Modal>

      {/* Lösch-Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Vertragsart löschen"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)} 
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteContract}
              isLoading={isLoading}
            >
              Löschen
            </Button>
          </>
        }
      >
        <p>
          Sind Sie sicher, dass Sie die Vertragsart <strong>{currentContract?.name}</strong> löschen möchten?
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Diese Aktion kann nicht rückgängig gemacht werden. Wenn diese Vertragsart bereits in Mitgliedschaften verwendet wird, wird der Löschvorgang abgelehnt.
        </p>
      </Modal>
    </div>
  );
} 