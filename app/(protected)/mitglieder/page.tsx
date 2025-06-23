'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, X, Edit, Save, FileText, Upload, CreditCard, BarChart3, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../components/ui/PageHeader';
import MemberTable, { Member } from '../../components/mitglieder/MemberTable';
import Modal from '../../components/ui/Modal';
import MemberForm, { MemberData } from '../../components/mitglieder/MemberForm';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import FormField from '../../components/ui/FormField';
import Badge from '../../components/ui/Badge';
import { PaymentSystemAPI } from '@/app/lib/api/payment-system';
import type { PaymentMember, MemberAccount } from '@/app/lib/types/payment-system';

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
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [paymentMembers, setPaymentMembers] = useState<PaymentMember[]>([]);
  
  // Payment System API
  const paymentAPI = new PaymentSystemAPI();
  
  // Filter-Zustand
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    contractTypeId: '',
    status: '',
  });
  
  // Load Payment Members
  const loadPaymentMembers = async () => {
    try {
      const result = await paymentAPI.getPaymentMembers();
      if (result.success && result.data) {
        setPaymentMembers(result.data);
        console.log('✅ Payment Members loaded:', result.data.length);
      }
    } catch (error) {
      console.error('Error loading payment members:', error);
    }
  };
  
  // Combine normal members with payment members
  const getAllMembers = (): Member[] => {
    const combinedMembers = [...members];
    
    // Add payment members that are not already in the list
    paymentMembers.forEach(paymentMember => {
      const exists = combinedMembers.find(m => 
        m.first_name === paymentMember.first_name && 
        m.last_name === paymentMember.last_name
      );
      
      if (!exists) {
        // Convert PaymentMember to Member format
        const member: Member = {
          id: paymentMember.id,
          first_name: paymentMember.first_name,
          last_name: paymentMember.last_name,
          email: paymentMember.email || undefined,
          phone: paymentMember.phone || undefined,
          birthdate: paymentMember.birth_date || undefined,
          member_number: paymentMember.member_number,
          created_at: paymentMember.created_at,
          // Payment members don't have regular memberships yet
          // But we can show their payment status
          paymentStatus: paymentMember.member_accounts?.[0] ? {
            balance: paymentMember.member_accounts[0].current_balance,
            iban: paymentMember.iban,
            paymentGroup: paymentMember.payment_groups?.name
          } : undefined
        };
        combinedMembers.push(member);
      }
    });
    
    return combinedMembers;
  };
  
  // Beim ersten Laden alle Mitglieder aus localStorage abrufen, falls vorhanden
  useEffect(() => {
    loadPaymentMembers(); // Load payment members first
    
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
    <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Mitglieder
          </h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie alle Mitgliedschaften und automatisierte Imports
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Link href="/mitglieder/pdf-upload">
            <Button variant="outline" className="bg-blue-50 border-blue-200 hover:bg-blue-100">
              <Upload className="w-4 h-4 mr-2" />
              PDF-Upload
            </Button>
          </Link>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neues Mitglied
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktiv</p>
                <p className="text-2xl font-bold text-green-600">{members.filter(m => m.membership?.status === 'active').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausstehend</p>
                <p className="text-2xl font-bold text-yellow-600">{members.filter(m => m.membership?.status === 'planned').length}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gekündigt</p>
                <p className="text-2xl font-bold text-red-600">{members.filter(m => m.membership?.status === 'cancelled').length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment-Konten</p>
                <p className="text-2xl font-bold text-purple-600">3</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-3 gap-4">
          <Link href="/mitglieder/pdf-upload" className="group">
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">PDF-Upload für Mitglieder</h4>
                <p className="text-sm text-gray-600">
                  Magicline-Verträge hochladen und automatisch Mitglieder erstellen
                </p>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Mitglied manuell hinzufügen</h4>
              <p className="text-sm text-gray-600">
                Neues Mitglied ohne PDF-Import erstellen
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Payment-System</h4>
              <p className="text-sm text-gray-600">
                SEPA-Abrechnung und Kontoverwaltung
              </p>
            </div>
          </div>
        </div>
              </div>
              
      {/* Search and Filter */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
              placeholder="Mitglied suchen..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
            </div>
            
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showPaymentStatus}
              onChange={(e) => setShowPaymentStatus(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Payment-Status anzeigen</span>
          </label>

              <select
                value={filters.contractTypeId}
                onChange={(e) => setFilters(prev => ({ ...prev, contractTypeId: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Vertragsarten</option>
                {CONTRACT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterOptions['status'] }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="cancelled">Gekündigt</option>
                <option value="no-contract">Kein Vertrag</option>
                <option value="planned">Geplant</option>
              </select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
            </div>
          </div>
          
      {/* Members Table */}
      <Card>
        <div className="p-6">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Mitglieder</h3>
              <p className="text-gray-600 mb-6">
                Beginnen Sie mit dem Upload von Magicline-PDFs oder erstellen Sie manuell ein neues Mitglied.
              </p>
              <div className="flex justify-center space-x-3">
                <Link href="/mitglieder/pdf-upload">
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    PDF-Upload starten
                  </Button>
                </Link>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Manuell hinzufügen
            </Button>
          </div>
        </div>
          ) : (
      <MemberTable 
        data={paginatedMembers}
        isLoading={isLoading}
        onEditMemberNumber={openEditMemberNumberModal}
        showStatusBadges={true}
              showPaymentStatus={showPaymentStatus}
      />
          )}
        </div>
      </Card>
      
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