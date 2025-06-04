'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, Edit, Save, ChevronLeft, Calendar, Phone, Mail, 
  Tag, Clock, CreditCard, FileText, CheckCircle, Plus, X 
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import MemberForm, { MemberData } from '../../../components/mitglieder/MemberForm';
import MembershipForm from '../../../components/mitglieder/MembershipForm';

// Dummy-Daten für die Entwicklung
const DUMMY_MEMBERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    first_name: 'Max',
    last_name: 'Mustermann',
    phone: '+49 123 4567890',
    email: 'max@example.com',
    birthdate: '1985-05-15',
    member_number: 'M-10033',
    created_at: '2023-01-10T10:30:00Z',
    memberships: [
      {
        id: '1',
        contract_type: {
          id: '1',
          name: 'Premium',
          terms: [12, 24],
        },
        term: 12,
        start_date: '2023-01-15',
        end_date: '2024-01-14',
        status: 'active',
      },
      {
        id: '2',
        contract_type: {
          id: '2',
          name: 'Standard',
          terms: [12, 24, 36],
        },
        term: 24,
        start_date: '2022-01-15',
        end_date: '2023-01-14',
        status: 'completed',
        predecessor_id: null,
      },
    ],
    consultations: [
      {
        id: '1',
        date: '2022-12-28T10:00:00Z',
        consultant: 'Anna Berater',
        result: 'contract_signed',
        notes: 'Kunde wünscht Premium-Mitgliedschaft mit Sauna-Option',
      },
      {
        id: '2',
        date: '2022-12-15T14:30:00Z',
        consultant: 'Thomas Verkäufer',
        result: 'follow_up',
        notes: 'Kunde überlegt noch, will verschiedene Optionen vergleichen',
      },
    ],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    first_name: 'Anna',
    last_name: 'Schmidt',
    phone: '+49 987 6543210',
    email: 'anna@example.com',
    birthdate: '1990-08-21',
    created_at: '2023-03-05T14:20:00Z',
    memberships: [
      {
        id: '3',
        contract_type: {
          id: '2',
          name: 'Standard',
          terms: [12, 24, 36],
        },
        term: 6,
        start_date: '2023-03-10',
        end_date: '2023-09-09',
        status: 'active',
      },
    ],
    consultations: [],
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    first_name: 'Thomas',
    last_name: 'Weber',
    email: 'thomas@example.com',
    birthdate: '1975-12-03',
    member_number: 'M-10034',
    created_at: '2022-11-10T09:15:00Z',
    memberships: [
      {
        id: '4',
        contract_type: {
          id: '3',
          name: 'Basis',
          terms: [12],
        },
        term: 12,
        start_date: '2022-12-01',
        end_date: '2023-11-30',
        status: 'cancelled',
      },
    ],
    consultations: [
      {
        id: '3',
        date: '2022-11-20T09:00:00Z',
        consultant: 'Max Verkäufer',
        result: 'contract_signed',
        notes: 'Kunde entschied sich für Basis-Paket',
      },
    ],
  },
];

// Dummy-Vertragsarten
const CONTRACT_TYPES = [
  {
    id: '1',
    name: 'Premium',
    terms: [12, 24],
  },
  {
    id: '2',
    name: 'Standard',
    terms: [6, 12, 24, 36],
  },
  {
    id: '3',
    name: 'Basis',
    terms: [12],
  },
];

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  birthdate?: string;
  member_number?: string;
  created_at: string;
  memberships: Array<{
    id: string;
    contract_type: {
      id: string;
      name: string;
      terms: number[];
    };
    term: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'cancelled' | 'completed';
    predecessor_id?: string | null;
  }>;
  consultations: Array<{
    id: string;
    date: string;
    consultant: string;
    result: string;
    notes?: string;
  }>;
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'memberships' | 'consultations'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMemberNumberModalOpen, setIsEditMemberNumberModalOpen] = useState(false);
  const [isAddMembershipModalOpen, setIsAddMembershipModalOpen] = useState(false);
  const [newMemberNumber, setNewMemberNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Simuliere API-Aufruf, um Mitgliedsdaten zu laden
    setIsLoading(true);
    
    setTimeout(() => {
      const foundMember = DUMMY_MEMBERS.find(m => m.id === id);
      
      if (foundMember) {
        setMember(foundMember);
        setNewMemberNumber(foundMember.member_number || '');
      }
      
      setIsLoading(false);
    }, 600);
  }, [id]);
  
  const formatDate = (dateStr: string, includeTime = false) => {
    const date = new Date(dateStr);
    
    if (includeTime) {
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  const handleUpdateMember = (data: MemberData) => {
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member) {
        const updatedMember = {
          ...member,
          ...data,
        };
        
        setMember(updatedMember);
      }
      
      setIsSaving(false);
      setIsEditModalOpen(false);
    }, 600);
  };
  
  const handleUpdateMemberNumber = () => {
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member) {
        const updatedMember = {
          ...member,
          member_number: newMemberNumber,
        };
        
        setMember(updatedMember);
      }
      
      setIsSaving(false);
      setIsEditMemberNumberModalOpen(false);
    }, 600);
  };
  
  const handleAddMembership = (data: any) => {
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member) {
        const newMembership = {
          ...data,
          id: `new-${Date.now()}`,
        };
        
        const updatedMember = {
          ...member,
          memberships: [newMembership, ...member.memberships],
        };
        
        setMember(updatedMember);
      }
      
      setIsSaving(false);
      setIsAddMembershipModalOpen(false);
    }, 600);
  };
  
  const getActiveMembership = () => {
    if (!member) return null;
    
    return member.memberships.find(membership => membership.status === 'active');
  };
  
  const renderMembershipStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="green">Aktiv</Badge>;
      case 'cancelled':
        return <Badge variant="red">Gekündigt</Badge>;
      case 'completed':
        return <Badge variant="gray">Abgelaufen</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };
  
  const renderConsultationResult = (result: string) => {
    switch (result) {
      case 'contract_signed':
        return <Badge variant="green">Vertrag abgeschlossen</Badge>;
      case 'follow_up':
        return <Badge variant="yellow">Nachfassen</Badge>;
      case 'not_interested':
        return <Badge variant="red">Kein Interesse</Badge>;
      default:
        return <Badge variant="gray">{result}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Mitglied nicht gefunden</h1>
        <p className="text-gray-500 mb-6">Das angeforderte Mitglied konnte nicht gefunden werden.</p>
        <Link href="/mitglieder">
          <Button variant="primary" icon={<ChevronLeft size={18} />}>
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader
        title={`${member.first_name} ${member.last_name}`}
        description="Mitgliedsdetails"
        action={{
          label: "Bearbeiten",
          icon: <Edit size={18} />,
          onClick: () => setIsEditModalOpen(true),
        }}
        breadcrumbs={[
          { label: 'Mitglieder', href: '/mitglieder' },
          { label: `${member.first_name} ${member.last_name}` },
        ]}
      />
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Übersicht
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'memberships'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('memberships')}
        >
          Mitgliedschaften
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'consultations'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('consultations')}
        >
          Beratungsgespräche
        </button>
      </div>
      
      {/* Übersichtsansicht */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card title="Persönliche Informationen" icon={<User size={18} />}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Mitgliedsnummer</h3>
                    <button 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => setIsEditMemberNumberModalOpen(true)}
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                  <p className="text-gray-900">
                    {member.member_number || <span className="text-gray-400">Keine Nummer</span>}
                  </p>
                </div>
                
                {member.email && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">E-Mail</h3>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">
                        {member.email}
                      </a>
                    </p>
                  </div>
                )}
                
                {member.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <a href={`tel:${member.phone}`} className="text-blue-500 hover:underline">
                        {member.phone}
                      </a>
                    </p>
                  </div>
                )}
                
                {member.birthdate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Geburtsdatum</h3>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {formatDate(member.birthdate)}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mitglied seit</h3>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {formatDate(member.created_at)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card title="Aktuelle Mitgliedschaft" icon={<CreditCard size={18} />}>
              {getActiveMembership() ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">
                        {getActiveMembership()?.contract_type.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Laufzeit: {getActiveMembership()?.term} Monate
                      </p>
                    </div>
                    <div>
                      {renderMembershipStatus(getActiveMembership()?.status || '')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Startdatum</h4>
                      <p className="text-gray-900">
                        {formatDate(getActiveMembership()?.start_date || '')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Enddatum</h4>
                      <p className="text-gray-900">
                        {formatDate(getActiveMembership()?.end_date || '')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setActiveTab('memberships')}
                    >
                      Alle Mitgliedschaften anzeigen
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">Keine aktive Mitgliedschaft vorhanden</p>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={<Plus size={16} />}
                    onClick={() => setIsAddMembershipModalOpen(true)}
                  >
                    Mitgliedschaft hinzufügen
                  </Button>
                </div>
              )}
            </Card>
            
            <div className="mt-6">
              <Card title="Letzte Beratungsgespräche" icon={<FileText size={18} />}>
                {member.consultations.length > 0 ? (
                  <div className="space-y-4">
                    {member.consultations.slice(0, 2).map(consultation => (
                      <div key={consultation.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {formatDate(consultation.date, true)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Berater: {consultation.consultant}
                            </p>
                          </div>
                          <div>
                            {renderConsultationResult(consultation.result)}
                          </div>
                        </div>
                        {consultation.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            {consultation.notes}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {member.consultations.length > 2 && (
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('consultations')}
                        >
                          Alle Beratungsgespräche anzeigen
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    Keine Beratungsgespräche vorhanden
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Mitgliedschaften-Tab */}
      {activeTab === 'memberships' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Mitgliedschaften</h2>
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus size={16} />}
              onClick={() => setIsAddMembershipModalOpen(true)}
            >
              Neue Mitgliedschaft
            </Button>
          </div>
          
          <Card>
            {member.memberships.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Vertragsart</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Laufzeit</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Zeitraum</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.memberships.map(membership => (
                      <tr key={membership.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {membership.contract_type.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {membership.term} Monate
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span>
                              {formatDate(membership.start_date)} - {formatDate(membership.end_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {renderMembershipStatus(membership.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            icon={<Edit size={16} />}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Keine Mitgliedschaften vorhanden</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={<Plus size={16} />}
                  onClick={() => setIsAddMembershipModalOpen(true)}
                >
                  Mitgliedschaft hinzufügen
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* Beratungsgespräche-Tab */}
      {activeTab === 'consultations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Beratungsgespräche</h2>
            <Button variant="primary" size="sm" icon={<Plus size={16} />}>
              Neues Gespräch erfassen
            </Button>
          </div>
          
          <Card>
            {member.consultations.length > 0 ? (
              <div className="space-y-4 divide-y divide-gray-100">
                {member.consultations.map(consultation => (
                  <div key={consultation.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {formatDate(consultation.date, true)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Berater: {consultation.consultant}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {renderConsultationResult(consultation.result)}
                        <Button variant="ghost" size="sm" icon={<Edit size={16} />}>
                          Bearbeiten
                        </Button>
                      </div>
                    </div>
                    {consultation.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          {consultation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Keine Beratungsgespräche vorhanden</p>
                <Button variant="primary" size="sm" icon={<Plus size={16} />}>
                  Gespräch erfassen
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
      
      {/* Modal: Mitglied bearbeiten */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Mitglied bearbeiten"
        footer={null}
      >
        <MemberForm
          initialData={{
            id: member.id,
            first_name: member.first_name,
            last_name: member.last_name,
            phone: member.phone,
            email: member.email,
            birthdate: member.birthdate,
            member_number: member.member_number,
          }}
          onSubmit={handleUpdateMember}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSaving}
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
              disabled={isSaving}
              icon={<X size={18} />}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateMemberNumber}
              isLoading={isSaving}
              icon={<Save size={18} />}
            >
              Speichern
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Mitglied: {member.first_name} {member.last_name}
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
      
      {/* Modal: Mitgliedschaft hinzufügen */}
      <Modal
        isOpen={isAddMembershipModalOpen}
        onClose={() => setIsAddMembershipModalOpen(false)}
        title="Neue Mitgliedschaft hinzufügen"
        footer={null}
      >
        <MembershipForm
          onSubmit={handleAddMembership}
          onCancel={() => setIsAddMembershipModalOpen(false)}
          isLoading={isSaving}
          memberId={member.id}
          contractTypes={CONTRACT_TYPES}
        />
      </Modal>
    </div>
  );
} 