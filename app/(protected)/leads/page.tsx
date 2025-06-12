'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, X, Calendar } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LeadTable from '../../components/leads/LeadTable';
import Modal from '../../components/ui/Modal';
import LeadForm, { LeadData } from '../../components/leads/LeadForm';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { LeadsAPI, Lead } from '../../lib/api/forms';

// Dummy-Kampagnen
const DUMMY_CAMPAIGNS = [
  { id: '1', name: 'Sommer-Aktion 2023' },
  { id: '2', name: 'Instagram Werbeaktion' },
  { id: '3', name: 'Herbst-Kampagne 2023' },
];

// Dummy-Vertragsarten
const DUMMY_CONTRACT_TYPES = [
  { 
    id: '1', 
    name: 'Premium',
    terms: [12, 24],
    monthly_fee: 69.90,
    group_discount_enabled: true,
    group_discount_value: 15,
    modules_included: ['1', '2'],
    modules_optional: ['3', '4']
  },
  { 
    id: '2', 
    name: 'Standard',
    terms: [12, 24, 36],
    monthly_fee: 49.90,
    group_discount_enabled: true,
    group_discount_value: 10,
    modules_included: ['1'],
    modules_optional: ['2', '3']
  },
  { 
    id: '3', 
    name: 'Basic',
    terms: [12],
    monthly_fee: 29.90,
    group_discount_enabled: false,
    modules_included: [],
    modules_optional: ['1', '2', '3', '4']
  },
];

// Dummy-Module
const DUMMY_MODULES = [
  { id: '1', name: 'Kurse', price: 10.00 },
  { id: '2', name: 'Sauna', price: 15.00 },
  { id: '3', name: 'Personal Training', price: 30.00 },
  { id: '4', name: 'Getränkeflatrate', price: 20.00 },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showTestLeads, setShowTestLeads] = useState(false);
  
  // Details-Modal-Status
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | ''>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [campaignFilter, setCampaignFilter] = useState<string>('');

  // Load leads from database
  useEffect(() => {
    loadLeads()
  }, [showTestLeads])

  const loadLeads = async () => {
    try {
      setIsLoading(true)
      const leadsData = await LeadsAPI.getAll(showTestLeads)
      setLeads(leadsData)
    } catch (error) {
      console.error('❌ Error loading leads:', error)
      alert('Fehler beim Laden der Leads')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter leads when filter criteria change
  useEffect(() => {
    let result = [...leads];
    
    // Filter by search term (name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead => 
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Filter by month
    if (monthFilter) {
      const [year, month] = monthFilter.split('-');
      result = result.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return (
          leadDate.getFullYear() === parseInt(year) &&
          leadDate.getMonth() === parseInt(month) - 1
        );
      });
    }
    
    // Filter by campaign
    if (campaignFilter) {
      result = result.filter(lead => lead.campaign?.id === campaignFilter);
    }
    
    setFilteredLeads(result);
  }, [leads, searchTerm, statusFilter, monthFilter, campaignFilter]);

  const handleCreateLead = (data: LeadData) => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const newLead: Lead = {
        ...data,
        id: `new-${Date.now()}`,
        created_at: new Date().toISOString(),
        campaign: data.campaign_id 
          ? DUMMY_CAMPAIGNS.find(c => c.id === data.campaign_id) 
          : undefined,
        // Zusätzliche Daten basierend auf Status
        ...(data.status === 'appointment' && {
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time
        }),
        ...(data.status === 'contacted' && {
          contact_attempts: data.contact_attempts
        }),
      };
      
      setLeads(prev => [newLead, ...prev]);
      setIsLoading(false);
      setIsModalOpen(false);
    }, 600);
  };
  
  const handleUpdateLead = (data: LeadData) => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      setLeads(prev => 
        prev.map(lead => 
          lead.id === data.id 
            ? {
                ...lead,
                ...data,
                campaign: data.campaign_id 
                  ? DUMMY_CAMPAIGNS.find(c => c.id === data.campaign_id) 
                  : undefined,
                // Zusätzliche Daten basierend auf Status
                ...(data.status === 'appointment' && {
                  appointment_date: data.appointment_date,
                  appointment_time: data.appointment_time
                }),
                ...(data.status === 'contacted' && {
                  contact_attempts: data.contact_attempts
                }),
              } 
            : lead
        )
      );
      
      setIsLoading(false);
      setIsDetailsModalOpen(false);
      setSelectedLead(null);
    }, 600);
  };

  const handleStatusChange = (id: string, status: Lead['status']) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      setSelectedLead(lead);
      setIsDetailsModalOpen(true);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setMonthFilter('');
    setCampaignFilter('');
    setIsFilterOpen(false);
  };

  // Generate month options
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Verwaltung potenzieller Mitglieder"
        action={{
          label: "Neuer Lead",
          icon: <UserPlus size={18} />,
          onClick: () => setIsModalOpen(true),
        }}
      />

      {/* Filter & Suchleiste */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Nach Namen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showTestLeads}
              onChange={(e) => setShowTestLeads(e.target.checked)}
              className="rounded border-gray-300"
            />
            Test-Leads anzeigen
          </label>
        </div>
        
        <Button
          variant={isFilterOpen ? "primary" : "outline"}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          icon={<Filter size={18} />}
        >
          Filter
          {(statusFilter || monthFilter || campaignFilter) && (
            <span className="ml-1 bg-blue-200 text-blue-800 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
              {[statusFilter, monthFilter, campaignFilter].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Erweiterte Filter */}
      {isFilterOpen && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Erweiterte Filter</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              icon={<X size={16} />}
            >
              Filter zurücksetzen
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Lead['status'] | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Status</option>
                <option value="open">Offen</option>
                <option value="contacted">Kontaktiert</option>
                <option value="appointment">Terminiert</option>
                <option value="consultation">In Beratung</option>
                <option value="converted">Konvertiert</option>
                <option value="lost">Verloren</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Monat</label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Monate</option>
                {getMonthOptions().map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Kampagne</label>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Kampagnen</option>
                {DUMMY_CAMPAIGNS.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      <LeadTable 
        data={filteredLeads} 
        onStatusChange={handleStatusChange}
      />

      {/* Modal für neuen Lead */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Neuen Lead anlegen"
        footer={null}
      >
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setIsModalOpen(false)}
          campaigns={DUMMY_CAMPAIGNS}
          contractTypes={DUMMY_CONTRACT_TYPES}
          modules={DUMMY_MODULES}
          isLoading={isLoading}
        />
      </Modal>
      
      {/* Modal für Lead-Details */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedLead(null);
        }}
        title={selectedLead ? `Lead: ${selectedLead.first_name} ${selectedLead.last_name}` : 'Lead-Details'}
        footer={null}
        size="lg"
      >
        {selectedLead && (
          <LeadForm
            initialData={{
              id: selectedLead.id,
              first_name: selectedLead.first_name,
              last_name: selectedLead.last_name,
              phone: selectedLead.phone,
              email: selectedLead.email,
              status: selectedLead.status,
              source: selectedLead.source,
              campaign_id: selectedLead.campaign?.id,
              appointment_date: selectedLead.appointment_date,
              appointment_time: selectedLead.appointment_time,
              contact_attempts: selectedLead.contact_attempts,
            }}
            onSubmit={handleUpdateLead}
            onCancel={() => {
              setIsDetailsModalOpen(false);
              setSelectedLead(null);
            }}
            campaigns={DUMMY_CAMPAIGNS}
            contractTypes={DUMMY_CONTRACT_TYPES}
            modules={DUMMY_MODULES}
            isLoading={isLoading}
          />
        )}
      </Modal>
    </div>
  );
} 