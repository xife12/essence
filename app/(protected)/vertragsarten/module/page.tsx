'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash, Tag, DollarSign, Info } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';

// Typdefinitionen
type Module = {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  category?: string;
};

// Dummy-Daten
const INITIAL_MODULES: Module[] = [
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

// Modul-Kategorien
const MODULE_CATEGORIES = [
  { value: 'Basis', label: 'Basis' },
  { value: 'Wellness', label: 'Wellness' },
  { value: 'Training', label: 'Training' },
  { value: 'Ernährung', label: 'Ernährung' },
  { value: 'Extras', label: 'Extras' },
];

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form-Zustand
  const [formData, setFormData] = useState<Omit<Module, 'id'>>({
    name: '',
    description: '',
    price: 0,
    active: true,
    category: '',
  });
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      active: true,
      category: '',
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
  
  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const newModule: Module = {
        ...formData,
        id: `module-${Date.now()}`,
      };
      
      setModules(prev => [...prev, newModule]);
      setIsLoading(false);
      setIsCreateModalOpen(false);
      resetForm();
    }, 500);
  };
  
  const handleEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (currentModule) {
        setModules(prev => prev.map(module => 
          module.id === currentModule.id ? { ...formData, id: currentModule.id } : module
        ));
      }
      setIsLoading(false);
      setIsEditModalOpen(false);
      setCurrentModule(null);
      resetForm();
    }, 500);
  };
  
  const handleDeleteModule = () => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (currentModule) {
        setModules(prev => prev.filter(module => module.id !== currentModule.id));
      }
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCurrentModule(null);
    }, 500);
  };
  
  const openEditModal = (module: Module) => {
    setCurrentModule(module);
    setFormData({
      name: module.name,
      description: module.description,
      price: module.price,
      active: module.active,
      category: module.category || '',
    });
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (module: Module) => {
    setCurrentModule(module);
    setIsDeleteModalOpen(true);
  };
  
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} €`;
  };
  
  const columns = [
    {
      header: 'Name',
      accessor: (item: Module) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      header: 'Kategorie',
      accessor: (item: Module) => item.category || '-',
    },
    {
      header: 'Beschreibung',
      accessor: (item: Module) => item.description,
    },
    {
      header: 'Preis',
      accessor: (item: Module) => formatPrice(item.price),
    },
    {
      header: 'Status',
      accessor: (item: Module) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.active ? 'Aktiv' : 'Inaktiv'}
        </span>
      ),
    },
    {
      header: 'Aktionen',
      accessor: (item: Module) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit size={16} />}
            onClick={() => openEditModal(item)}
          >
            Bearbeiten
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash size={16} />}
            onClick={() => openDeleteModal(item)}
          >
            Löschen
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Module"
        description="Verwaltung von Zusatzleistungen für Verträge"
        action={{
          label: "Neues Modul",
          icon: <Plus size={18} />,
          onClick: () => setIsCreateModalOpen(true),
        }}
        breadcrumbs={[
          { label: 'Vertragsarten', href: '/vertragsarten' },
          { label: 'Module' },
        ]}
      />

      <div className="mb-8">
        <Card>
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-blue-500" />
              <p className="text-sm text-gray-700">
                Module können zu Vertragsarten hinzugefügt werden. Sie können als kostenlos (bereits im Vertrag enthalten) oder kostenpflichtig konfiguriert werden.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Table
        data={modules}
        columns={columns}
        emptyMessage="Keine Module vorhanden"
      />

      {/* Erstellungs-Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Neues Modul erstellen"
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
              onClick={handleCreateModule}
              isLoading={isLoading}
            >
              Modul erstellen
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateModule}>
          <FormField
            label="Name"
            htmlFor="name"
            required
          >
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          
          <FormField
            label="Kategorie"
            htmlFor="category"
          >
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen</option>
              {MODULE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </FormField>
          
          <FormField
            label="Beschreibung"
            htmlFor="description"
          >
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </FormField>
          
          <FormField
            label="Preis (€ pro Monat)"
            htmlFor="price"
            required
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </FormField>
          
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
      </Modal>

      {/* Bearbeitungs-Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modul bearbeiten: ${currentModule?.name}`}
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
              onClick={handleEditModule}
              isLoading={isLoading}
            >
              Speichern
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditModule}>
          <FormField
            label="Name"
            htmlFor="edit-name"
            required
          >
            <input
              id="edit-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </FormField>
          
          <FormField
            label="Kategorie"
            htmlFor="edit-category"
          >
            <select
              id="edit-category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen</option>
              {MODULE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </FormField>
          
          <FormField
            label="Beschreibung"
            htmlFor="edit-description"
          >
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </FormField>
          
          <FormField
            label="Preis (€ pro Monat)"
            htmlFor="edit-price"
            required
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign size={16} className="text-gray-400" />
              </div>
              <input
                id="edit-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </FormField>
          
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
      </Modal>

      {/* Lösch-Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Modul löschen"
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
              onClick={handleDeleteModule}
              isLoading={isLoading}
            >
              Löschen
            </Button>
          </>
        }
      >
        <p>
          Sind Sie sicher, dass Sie das Modul <strong>{currentModule?.name}</strong> löschen möchten?
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Diese Aktion kann nicht rückgängig gemacht werden. Wenn dieses Modul in Vertragsarten verwendet wird, wird es aus diesen entfernt.
        </p>
      </Modal>
    </div>
  );
} 