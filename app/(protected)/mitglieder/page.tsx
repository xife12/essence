'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, X, Edit, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import MemberTable, { Member } from '../../components/mitglieder/MemberTable';
import Modal from '../../components/ui/Modal';
import MemberForm, { MemberData } from '../../components/mitglieder/MemberForm';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FormField from '../../components/ui/FormField';
import Badge from '../../components/ui/Badge';

// Dummy-Vertragsarten für Filter
const CONTRACT_TYPES = [
  { id: '1', name: 'Premium' },
  { id: '2', name: 'Standard' },
  { id: '3', name: 'Basis' },
];

// Dummy-Daten für die Entwicklung
const DUMMY_MEMBERS: Member[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    first_name: 'Max',
    last_name: 'Mustermann',
    phone: '+49 123 4567890',
    email: 'max@example.com',
    birthdate: '1985-05-15',
    created_at: '2023-01-10T10:30:00Z',
    membership: {
      id: '1',
      contract_type: {
        id: '1',
        name: 'Premium',
      },
      start_date: '2023-01-15',
      end_date: '2024-01-14',
      status: 'active',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    first_name: 'Anna',
    last_name: 'Schmidt',
    phone: '+49 987 6543210',
    email: 'anna@example.com',
    birthdate: '1990-08-21',
    created_at: '2023-03-05T14:20:00Z',
    membership: {
      id: '2',
      contract_type: {
        id: '2',
        name: 'Standard',
      },
      start_date: '2023-03-10',
      end_date: '2023-09-09',
      status: 'active',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    first_name: 'Thomas',
    last_name: 'Weber',
    email: 'thomas@example.com',
    birthdate: '1975-12-03',
    member_number: 'M-10034',
    created_at: '2022-11-10T09:15:00Z',
    membership: {
      id: '3',
      contract_type: {
        id: '3',
        name: 'Basis',
      },
      start_date: '2022-12-01',
      end_date: '2023-11-30',
      status: 'cancelled',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    first_name: 'Julia',
    last_name: 'Meyer',
    phone: '+49 111 2223344',
    birthdate: '1988-04-17',
    created_at: '2023-06-15T16:45:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    first_name: 'Martin',
    last_name: 'Schneider',
    phone: '+49 222 3334455',
    email: 'martin@example.com',
    birthdate: '1982-09-27',
    member_number: 'M-10035',
    created_at: '2023-02-20T11:25:00Z',
    membership: {
      id: '4',
      contract_type: {
        id: '1',
        name: 'Premium',
      },
      start_date: '2023-03-01',
      end_date: '2024-02-28',
      status: 'active',
    },
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    first_name: 'Laura',
    last_name: 'Wagner',
    phone: '+49 333 4445566',
    email: 'laura@example.com',
    birthdate: '1992-03-12',
    created_at: '2023-04-05T15:30:00Z',
    membership: {
      id: '5',
      contract_type: {
        id: '2',
        name: 'Standard',
      },
      start_date: '2023-04-10',
      end_date: '2023-10-09',
      status: 'cancelled',
    },
  },
];

type FilterOptions = {
  searchQuery: string;
  contractTypeId: string;
  status: '' | 'active' | 'cancelled' | 'no-contract' | 'planned';
};

export default function MitgliederPage() {
  const [members, setMembers] = useState<Member[]>(DUMMY_MEMBERS);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(DUMMY_MEMBERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMemberNumberModalOpen, setIsEditMemberNumberModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newMemberNumber, setNewMemberNumber] = useState('');
  
  // Filter-Zustand
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    contractTypeId: '',
    status: '',
  });
  
  // Beim ersten Laden alle Mitglieder aus localStorage abrufen, falls vorhanden
  useEffect(() => {
    // Funktion zum Laden der Mitgliedsdaten aus localStorage
    const loadMembersFromLocalStorage = () => {
      const updatedMembers = [...DUMMY_MEMBERS];
      let hasUpdates = false;

      // Durchsuche localStorage nach gespeicherten Mitgliedern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('member_')) {
          try {
            const storedMemberData = localStorage.getItem(key);
            if (storedMemberData) {
              const storedMember = JSON.parse(storedMemberData);
              
              // Finde den Index des Mitglieds in unserem Array
              const memberIndex = updatedMembers.findIndex(m => m.id === storedMember.id);
              
              // Wenn das Mitglied existiert, aktualisiere es
              if (memberIndex !== -1) {
                // Suche zuerst nach aktivem Vertrag, dann nach geplantem Vertrag
                const activeMembership = storedMember.memberships?.find(
                  m => m.status === 'active'
                );
                
                const plannedMembership = !activeMembership && storedMember.memberships?.find(
                  m => m.status === 'planned'
                );
                
                updatedMembers[memberIndex] = {
                  ...storedMember,
                  membership: activeMembership ? {
                    id: activeMembership.id,
                    contract_type: activeMembership.contract_type,
                    start_date: activeMembership.start_date,
                    end_date: activeMembership.end_date,
                    status: activeMembership.status
                  } : plannedMembership ? {
                    id: plannedMembership.id,
                    contract_type: plannedMembership.contract_type,
                    start_date: plannedMembership.start_date,
                    end_date: plannedMembership.end_date,
                    status: plannedMembership.status
                  } : undefined
                };
                
                hasUpdates = true;
              }
            }
          } catch (error) {
            console.error('Fehler beim Laden von Mitglied aus localStorage:', error);
          }
        }
      }

      // Wenn Änderungen gefunden wurden, aktualisiere den State
      if (hasUpdates) {
        console.log('Mitgliedsdaten aus localStorage geladen', updatedMembers);
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
      }
    };

    // Lade die Daten
    loadMembersFromLocalStorage();
  }, []);
  
  // Pagination-Logik
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Effekt zum Filtern der Mitglieder bei Änderung der Filter
  useEffect(() => {
    let result = members;
    
    // Textsuche (Name)
    if (filters.searchQuery.trim()) {
      const searchLower = filters.searchQuery.toLowerCase();
      result = result.filter(member => 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.member_number?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter nach Vertragstyp
    if (filters.contractTypeId) {
      result = result.filter(member => 
        member.membership?.contract_type?.id === filters.contractTypeId
      );
    }
    
    // Filter nach Status
    if (filters.status) {
      if (filters.status === 'no-contract') {
        result = result.filter(member => !member.membership);
      } else {
        result = result.filter(member => 
          member.membership?.status === filters.status
        );
      }
    }
    
    setFilteredMembers(result);
    setCurrentPage(1); // Zurück zur ersten Seite bei Filteränderung
  }, [filters, members]);
  
  const handleCreateMember = (data: MemberData) => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const newMember: Member = {
        ...data,
        id: `new-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      
      setMembers(prev => [newMember, ...prev]);
      setIsLoading(false);
      setIsCreateModalOpen(false);
    }, 600);
  };
  
  const handleEditMemberNumber = () => {
    setIsLoading(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (selectedMember) {
        const updatedMembers = members.map(member => 
          member.id === selectedMember.id 
            ? { ...member, member_number: newMemberNumber }
            : member
        );
        
        setMembers(updatedMembers);
      }
      
      setIsLoading(false);
      setIsEditMemberNumberModalOpen(false);
      setSelectedMember(null);
      setNewMemberNumber('');
    }, 600);
  };
  
  const openEditMemberNumberModal = (member: Member) => {
    setSelectedMember(member);
    setNewMemberNumber(member.member_number || '');
    setIsEditMemberNumberModalOpen(true);
  };
  
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      contractTypeId: '',
      status: '',
    });
  };
  
  const clearSearchQuery = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  };

  return (
    <div>
      <PageHeader
        title="Mitglieder"
        description="Verwalte alle Mitgliedschaften"
        action={{
          label: "Neues Mitglied",
          icon: <Plus size={18} />,
          onClick: () => setIsCreateModalOpen(true),
        }}
      />
      
      {/* Filterbereich */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Filter</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Suchfeld */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              
              <input
                type="text"
                placeholder="Suche nach Name, E-Mail oder Mitgliedsnummer"
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {filters.searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={clearSearchQuery}
                >
                  <X size={18} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Vertragstyp-Filter */}
            <div>
              <select
                value={filters.contractTypeId}
                onChange={(e) => setFilters(prev => ({ ...prev, contractTypeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Vertragsarten</option>
                {CONTRACT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status-Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterOptions['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="cancelled">Gekündigt</option>
                <option value="no-contract">Kein Vertrag</option>
                <option value="planned">Geplant</option>
              </select>
            </div>
          </div>
          
          {/* Filter-Aktionsbuttons */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={<X size={16} />}
              onClick={resetFilters}
              disabled={!filters.searchQuery && !filters.contractTypeId && !filters.status}
            >
              Filter zurücksetzen
            </Button>
          </div>
        </div>
      </Card>

      {/* Mitgliedertabelle */}
      <MemberTable 
        data={paginatedMembers}
        isLoading={isLoading}
        onEditMemberNumber={openEditMemberNumberModal}
        showStatusBadges={true}
      />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Zeige {Math.min(filteredMembers.length, (currentPage - 1) * itemsPerPage + 1)}-
            {Math.min(filteredMembers.length, currentPage * itemsPerPage)} von {filteredMembers.length} Mitgliedern
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Zurück
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Weiter
            </Button>
          </div>
          
          <div className="text-sm">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 25, 50].map(value => (
                <option key={value} value={value}>
                  {value} pro Seite
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Modal: Neues Mitglied anlegen */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Neues Mitglied anlegen"
        footer={null}
      >
        <MemberForm
          onSubmit={handleCreateMember}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
      
      {/* Modal: Mitgliedsnummer bearbeiten */}
      <Modal
        isOpen={isEditMemberNumberModalOpen}
        onClose={() => setIsEditMemberNumberModalOpen(false)}
        title="Mitgliedsnummer bearbeiten"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsEditMemberNumberModalOpen(false)} 
              disabled={isLoading}
              icon={<X size={18} />}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={handleEditMemberNumber}
              isLoading={isLoading}
              icon={<Save size={18} />}
            >
              Speichern
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Mitglied: {selectedMember?.first_name} {selectedMember?.last_name}
          </p>
          
          <FormField
            label="Mitgliedsnummer"
            htmlFor="member_number"
          >
            <input
              id="member_number"
              name="member_number"
              type="text"
              value={newMemberNumber}
              onChange={(e) => setNewMemberNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. M-12345"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
} 