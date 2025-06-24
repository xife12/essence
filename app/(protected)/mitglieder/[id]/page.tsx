'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  User, Edit, Save, ChevronLeft, Calendar, Phone, Mail, 
  Tag, Clock, CreditCard, FileText, CheckCircle, Plus, X,
  AlertTriangle, Pause, Info, Award, Upload, Download, 
  File, Folder, Trash2, Eye, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
// Extrahiere den BadgeVariant-Typ aus der Badge-Komponente
type BadgeVariant = 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import MemberForm, { MemberData } from '../../../components/mitglieder/MemberForm';
import MembershipForm from '../../../components/mitglieder/MembershipForm';
import { MemberPaymentCard } from '@/app/components/payment-system/MemberPaymentCard';
import { AccountCorrectionModal } from '@/app/components/payment-system/AccountCorrectionModal';
import { BeitragskalenderGenerator } from '@/app/lib/services/beitragskalender-generator';
import FileUpload from '../../../components/dateimanager/FileUpload';
import { 
  getFileAssets, 
  deleteFileAsset, 
  getFileAssetById 
} from '../../../lib/api/file-asset';
import type { FileAsset } from '../../../lib/types/file-asset';

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
        status: 'active' as 'active' | 'cancelled' | 'completed' | 'suspended',
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
        status: 'completed' as 'active' | 'cancelled' | 'completed' | 'suspended',
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
        status: 'active' as 'active' | 'cancelled' | 'completed' | 'suspended',
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
        status: 'cancelled' as 'active' | 'cancelled' | 'completed' | 'suspended',
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
    has_group_discount: true,
    group_discount_rate: 10,
    extras: [
      { id: 'extra-1', name: 'Sauna', price: 9.99 },
      { id: 'extra-2', name: 'Getränke-Flatrate', price: 19.99 },
      { id: 'extra-3', name: 'Handtuchservice', price: 4.99 }
    ],
    campaigns: ['Sommerspezial 2023', 'Neujahrsangebot']
  },
  {
    id: '2',
    name: 'Standard',
    terms: [6, 12, 24, 36],
    has_group_discount: true,
    group_discount_rate: 5,
    extras: [
      { id: 'extra-1', name: 'Sauna', price: 14.99 },
      { id: 'extra-3', name: 'Handtuchservice', price: 4.99 }
    ],
    campaigns: ['Frühbucher-Rabatt']
  },
  {
    id: '3',
    name: 'Basis',
    terms: [12],
    has_group_discount: false,
    extras: []
  },
];

type MembershipStatus = 'active' | 'cancelled' | 'completed' | 'suspended' | 'planned';

type ContractExtras = {
  id: string;
  name: string;
  price?: number;
  included: boolean;
};

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
    status: MembershipStatus;
    predecessor_id?: string | null;
    has_group_discount?: boolean;
    extras?: ContractExtras[];
    campaign_name?: string;
  }>;
  consultations: Array<{
    id: string;
    date: string;
    consultant: string;
    result: string;
    notes?: string;
  }>;
};

export type MembershipData = {
  id?: string;
  member_id: string;
  contract_type_id: string;
  term: number;
  start_date: string;
  end_date?: string;
  status: MembershipStatus;
  predecessor_id?: string;
};

// Neue Hilfsfunktion zur Berechnung der Restlaufzeit
const calculateRemainingDays = (endDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  // Differenz in Millisekunden
  const diff = end.getTime() - today.getTime();
  
  // Umrechnen in Tage
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Neue Hilfsfunktion zur Ermittlung der Ampelfarbe
const getRemainingDaysColor = (membership: any): { color: BadgeVariant, tooltip: string } => {
  if (!membership) return { color: 'gray', tooltip: 'Kein aktiver Vertrag' };
  
  const remainingDays = calculateRemainingDays(membership.end_date);
  const totalDays = Math.ceil((new Date(membership.end_date).getTime() - new Date(membership.start_date).getTime()) / (1000 * 60 * 60 * 24));
  const remainingPercentage = (remainingDays / totalDays) * 100;
  
  // Standardmäßig 30 Tage für Kündigungsfrist annehmen
  const noticeThreshold = 30;
  
  if (remainingDays <= noticeThreshold) {
    return { 
      color: 'red', 
      tooltip: 'Innerhalb der Kündigungsfrist' 
    };
  } else if (remainingPercentage < 50) {
    return { 
      color: 'yellow', 
      tooltip: 'Weniger als 50% der Laufzeit verbleibend' 
    };
  } else {
    return { 
      color: 'green', 
      tooltip: 'Mehr als 50% der Laufzeit verbleibend' 
    };
  }
};

// Neue Komponente für das Restlaufzeit-Badge mit Tooltip
const RemainingDaysBadge = ({ membership }) => {
  if (!membership) return null;
  
  const remainingDays = calculateRemainingDays(membership.end_date);
  const { color, tooltip } = getRemainingDaysColor(membership);
  
  return (
    <div className="group relative inline-block">
      <Badge variant={color} className="flex items-center gap-1">
        <Clock size={14} />
        <span>{remainingDays} Tage verbleibend</span>
        <Info size={14} className="cursor-help" />
      </Badge>
      <div className="invisible group-hover:visible absolute z-10 w-60 bg-gray-800 text-white text-xs p-2 rounded mt-1 right-0">
        {tooltip}
        <div className="text-xs mt-1">
          <p>Grün: Mehr als 50% Mitgliedschaft</p>
          <p>Gelb: Weniger als 50% und außerhalb der Kündigungsfrist</p>
          <p>Rot: Innerhalb der Kündigungsfrist (30 Tage)</p>
        </div>
      </div>
    </div>
  );
};

// Neue Komponente für Mitgliedschaftszähler
const MembershipCounter = ({ memberships }) => {
  if (!memberships || memberships.length === 0) return null;
  
  // Zähle abgeschlossene und gekündigte Mitgliedschaften, um zu sehen wie oft verlängert wurde
  const completedMemberships = memberships.filter(m => 
    m.status === 'completed' || m.status === 'cancelled'
  ).length;
  
  let badgeVariant: BadgeVariant = 'gray';
  let badgeText = '';
  
  if (completedMemberships === 0) {
    badgeVariant = 'blue';
    badgeText = 'Neukunde';
  } else if (completedMemberships === 1) {
    badgeVariant = 'purple';
    badgeText = 'Einmalig verlängert';
  } else if (completedMemberships >= 2) {
    badgeVariant = 'purple';
    badgeText = `${completedMemberships}x verlängert`;
  }
  
  return (
    <Badge variant={badgeVariant} className="flex items-center gap-1">
      <Award size={14} />
      <span>{badgeText}</span>
    </Badge>
  );
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'memberships' | 'consultations' | 'documents' | 'payment'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMemberNumberModalOpen, setIsEditMemberNumberModalOpen] = useState(false);
  const [isAddMembershipModalOpen, setIsAddMembershipModalOpen] = useState(false);
  const [isExtendMembershipModalOpen, setIsExtendMembershipModalOpen] = useState(false);
  const [isCancelMembershipModalOpen, setIsCancelMembershipModalOpen] = useState(false);
  const [isSuspendMembershipModalOpen, setIsSuspendMembershipModalOpen] = useState(false);
  const [isOverlapWarningModalOpen, setIsOverlapWarningModalOpen] = useState(false);
  const [newMemberNumber, setNewMemberNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendUntilDate, setSuspendUntilDate] = useState('');
  const [pendingMembershipData, setPendingMembershipData] = useState<any>(null);
  const [isNewMembership, setIsNewMembership] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [expandedMembershipId, setExpandedMembershipId] = useState<string | null>(null);
  const [cancellationDate, setCancellationDate] = useState<string>('');
  const [cancellationType, setCancellationType] = useState<'regular' | 'immediate' | 'custom'>('regular');
  const [fileAssets, setFileAssets] = useState<FileAsset[]>([]);
  
  // Document Management States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showContractUpload, setShowContractUpload] = useState(false);
  
  useEffect(() => {
    // Simuliere API-Aufruf, um Mitgliedsdaten zu laden
    setIsLoading(true);
    
    setTimeout(() => {
      // Prüfe, ob Daten für dieses Mitglied im localStorage vorhanden sind
      const storedMemberData = localStorage.getItem(`member_${id}`);
      let foundMember;
      
      if (storedMemberData) {
        // Wenn ja, diese verwenden
        foundMember = JSON.parse(storedMemberData);
        console.log("Mitgliedsdaten aus localStorage geladen:", foundMember);
      } else {
        // Ansonsten Dummy-Daten verwenden
        foundMember = DUMMY_MEMBERS.find(m => m.id === id);
      }
      
      if (foundMember) {
        // Prüfe auf Verträge, die heute starten sollten und als "planned" markiert sind
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const updatedMemberships = foundMember.memberships.map(membership => {
          // Setze "planned" auf "active", wenn das Startdatum heute oder in der Vergangenheit liegt
          if (membership.status === 'planned') {
            const startDate = new Date(membership.start_date);
            startDate.setHours(0, 0, 0, 0);
            if (startDate.getTime() <= today.getTime()) {
              return { ...membership, status: 'active' as MembershipStatus };
            }
          }
          return membership;
        });
        
        setMember({
          ...foundMember,
          memberships: updatedMemberships
        });
        setNewMemberNumber(foundMember.member_number || '');
      } else {
        setMember(foundMember);
        if (foundMember) {
        setNewMemberNumber(foundMember.member_number || '');
        }
      }
      
      setIsLoading(false);
    }, 600);
  }, [id]);
  
  // Funktion zum Speichern der aktualisierten Mitgliedsdaten im localStorage
  const saveMemberToLocalStorage = (updatedMember) => {
    if (updatedMember) {
      localStorage.setItem(`member_${updatedMember.id}`, JSON.stringify(updatedMember));
      console.log("Mitgliedsdaten in localStorage gespeichert:", updatedMember);
    }
  };
  
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
        // Speichere aktualisierte Daten in localStorage
        saveMemberToLocalStorage(updatedMember);
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
        // Speichere aktualisierte Daten in localStorage
        saveMemberToLocalStorage(updatedMember);
      }
      
      setIsSaving(false);
      setIsEditMemberNumberModalOpen(false);
    }, 600);
  };
  
  const handleAddMembership = (data: any) => {
    // Prüfen, ob es einen aktiven Vertrag gibt und ob das Startdatum innerhalb der Laufzeit liegt
    const activeMembership = getCurrentOrPlannedMembership();
    
    if (activeMembership) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(activeMembership.end_date);
      
      // Immer warnen, wenn der neue Vertrag innerhalb der Laufzeit des bestehenden Vertrags beginnt
      if (startDate <= endDate) {
        // Es gibt eine Überschneidung, warnen
        setPendingMembershipData(data);
        setIsNewMembership(true);
        setIsOverlapWarningModalOpen(true);
        return;
      }
    }
    
    // Sonst direkt fortfahren
    processMembershipAdd(data);
  };
  
  const processMembershipAdd = (data: any) => {
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member) {
        // Finde den ausgewählten Vertragstyp
        const selectedContractType = CONTRACT_TYPES.find(ct => ct.id === data.contract_type_id);
        
        // Prüfe, ob das Startdatum in der Zukunft liegt
        const startDate = new Date(data.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Setze Zeit auf Mitternacht für korrekte Vergleiche
        
        // Status basierend auf Startdatum setzen
        // Verträge mit Startdatum in der Zukunft MÜSSEN den Status 'planned' haben
        const status = startDate.getTime() > today.getTime() ? 'planned' : 'active';
        
        // Neue Mitgliedschaft erstellen
        const newMembership = {
          ...data,
          id: `new-${Date.now()}`,
          status: status as MembershipStatus,
          contract_type: selectedContractType ? {
            id: selectedContractType.id,
            name: selectedContractType.name,
            terms: selectedContractType.terms
          } : { id: '', name: 'Unbekannt', terms: [] }
        };
        
        // Füge die neue Mitgliedschaft hinzu
        // Wenn bereits in confirmOverlap die aktive Mitgliedschaft aktualisiert wurde,
        // müssen wir das hier nicht noch einmal tun
        const updatedMember = {
          ...member,
          memberships: [newMembership, ...member.memberships]
        };
        
        setMember(updatedMember);
        // Speichere aktualisierte Daten in localStorage
        saveMemberToLocalStorage(updatedMember);
        
        // 🎯 AUTOMATISCHE BEITRAGSKALENDER-GENERIERUNG
        // Generiere automatisch den Beitragskalender für die neue Mitgliedschaft
        if (status === 'active' || status === 'planned') {
          console.log('🔄 Generating Beitragskalender for new membership:', newMembership.id);
          
          // Prepare contract data for Beitragskalender generation
          const contractData = {
            id: newMembership.id,
            start_date: data.start_date,
            end_date: data.end_date,
                         monthly_fee: 89.90, // Default fee - TODO: Add monthly_fee to CONTRACT_TYPES
            payment_frequency: 'monthly'
          };
          
          // Trigger automatic generation
          BeitragskalenderGenerator.onMemberCreated(member.id, contractData)
            .then(result => {
              if (result.success) {
                console.log('✅ Beitragskalender generated successfully');
              } else {
                console.warn('⚠️ Beitragskalender generation failed:', result.error);
              }
            })
            .catch(error => {
              console.error('❌ Beitragskalender generation error:', error);
            });
        }
      }
      
      setIsSaving(false);
      setIsAddMembershipModalOpen(false);
    }, 600);
  };
  
  const getCurrentOrPlannedMembership = () => {
    if (!member || !member.memberships || member.memberships.length === 0) return null;
    
    // Priorisierung: Aktive Mitgliedschaft hat Vorrang
    const activeMembership = member.memberships.find(membership => membership.status === 'active');
    if (activeMembership) return activeMembership;
    
    // Danach: Geplante Mitgliedschaft, nach Startdatum sortiert (neueste zuerst)
    const plannedMemberships = member.memberships
      .filter(m => m.status === 'planned')
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    
    return plannedMemberships.length > 0 ? plannedMemberships[0] : null;
  };
  
  const handleExtendMembership = (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    setIsExtendMembershipModalOpen(true);
  };

  const handleCancelMembership = (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    setCancelReason('');
    setIsCancelMembershipModalOpen(true);
  };

  const handleSuspendMembership = (membershipId: string) => {
    setSelectedMembershipId(membershipId);
    setSuspendReason('');
    setSuspendUntilDate('');
    setIsSuspendMembershipModalOpen(true);
  };

  const handleReactivateMembership = (membershipId: string) => {
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member && membershipId) {
        const selectedMembership = member.memberships.find(m => m.id === membershipId);
        
        if (selectedMembership && selectedMembership.status === 'suspended') {
          // Berechne die Zeit zwischen heute und dem geplanten Ende der Stilllegung
          const today = new Date();
          
          // Bestimme das ursprüngliche Enddatum (vor der Stilllegung)
          // Annahme: Wenn ein Vertrag stillgelegt wird, wird sein Enddatum um die Stilllegungszeit verlängert
          // Wir müssen daher die Differenz zwischen dem tatsächlichen Reaktivierungsdatum und dem
          // geplanten Ende der Stilllegung berechnen
          
          // Suche nach Stilllegungsdaten in der Historie (hier simuliert)
          const suspensionEndDate = new Date(); // Beispiel: ein Monat in der Zukunft
          suspensionEndDate.setMonth(suspensionEndDate.getMonth() + 1);
          
          let updatedMember;
          
          // Wenn die Reaktivierung vor dem geplanten Ende der Stilllegung erfolgt,
          // passe die Vertragslaufzeit entsprechend an
          if (today < suspensionEndDate) {
            // Berechne die verbleibende Stilllegungszeit in Tagen
            const remainingTimeMs = suspensionEndDate.getTime() - today.getTime();
            const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));
            
            // Neues Enddatum berechnen:
            // Aktuelles Enddatum minus die verbleibende Stilllegungszeit
            const currentEndDate = new Date(selectedMembership.end_date);
            const newEndDate = new Date(currentEndDate);
            newEndDate.setDate(newEndDate.getDate() - remainingDays);
            
            const updatedMemberships = member.memberships.map(m => {
              if (m.id === membershipId) {
                return {
                  ...m,
                  status: 'active' as MembershipStatus,
                  end_date: newEndDate.toISOString().split('T')[0]
                };
              }
              return m;
            });
            
            updatedMember = {
              ...member,
              memberships: updatedMemberships
            };
            
            setMember(updatedMember);
          } else {
            // Falls keine Anpassung nötig ist (z.B. wenn das Stilllegungsdatum bereits erreicht wurde)
            const updatedMemberships = member.memberships.map(m => {
              if (m.id === membershipId) {
                return { ...m, status: 'active' as MembershipStatus };
              }
              return m;
            });
            
            updatedMember = {
              ...member,
              memberships: updatedMemberships
            };
            
            setMember(updatedMember);
          }
          
          // Speichere aktualisierte Daten in localStorage
          saveMemberToLocalStorage(updatedMember);
        }
      }
      
      setIsSaving(false);
    }, 600);
  };

  const submitExtendMembership = (data: any) => {
    // Prüfen, ob das Startdatum innerhalb der Laufzeit liegt
    if (member && selectedMembershipId) {
      const selectedMembership = member.memberships.find(m => m.id === selectedMembershipId);
      
      if (selectedMembership && (selectedMembership.status === 'active' || selectedMembership.status === 'planned')) {
        const startDate = new Date(data.start_date);
        const endDate = new Date(selectedMembership.end_date);
        
        if (startDate <= endDate) {
          // Es gibt eine Überschneidung, warnen
          setPendingMembershipData(data);
          setIsNewMembership(false);
          setIsOverlapWarningModalOpen(true);
          return;
        }
      }
    }
    
    // Sonst direkt fortfahren
    processExtendMembership(data);
  };
  
  const processExtendMembership = (data: any) => {
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member && selectedMembershipId) {
        const selectedMembership = member.memberships.find(m => m.id === selectedMembershipId);
        
        if (selectedMembership) {
          // Bestimme, ob das Startdatum in der Zukunft liegt
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Setze Zeit auf Mitternacht für korrekte Vergleiche
          const startDate = new Date(data.start_date);
          startDate.setHours(0, 0, 0, 0);
          
          const isFutureStartDate = startDate > today;
          
          // Anpassen des Enddatums des aktuellen Vertrags auf den Tag vor dem Start des neuen Vertrags
          // Nur wenn der Vertrag noch aktiv oder geplant ist
          const updatedMemberships = member.memberships.map(m => {
            if (m.id === selectedMembershipId) {
              // Setze das Enddatum des aktuellen Vertrags auf den Tag vor Beginn des neuen Vertrags
              const newEndDate = new Date(data.start_date);
              newEndDate.setDate(newEndDate.getDate() - 1);
              
              return { 
                ...m, 
                status: 'active' as MembershipStatus, // Status bleibt aktiv, nur das Enddatum wird angepasst
                end_date: newEndDate.toISOString().split('T')[0]
              };
            }
            return m;
          });
          
          // Neue Mitgliedschaft hinzufügen
          const newMembership = {
            id: `new-${Date.now()}`,
            contract_type: selectedMembership.contract_type || { id: '', name: 'Unbekannt', terms: [] },
            term: data.term || selectedMembership.term,
            start_date: data.start_date || new Date().toISOString().split('T')[0],
            end_date: calculateEndDate(data.start_date, data.term || selectedMembership.term),
            status: isFutureStartDate ? 'planned' : 'active' as MembershipStatus, // Bei zukünftigen Terminen auf "geplant" setzen
            predecessor_id: selectedMembershipId
          };
          
          const updatedMember = {
            ...member,
            memberships: [newMembership, ...updatedMemberships]
          };
          
          setMember(updatedMember);
          // Speichere aktualisierte Daten in localStorage
          saveMemberToLocalStorage(updatedMember);
        }
      }
      
      setIsSaving(false);
      setIsExtendMembershipModalOpen(false);
    }, 600);
  };

  const submitCancelMembership = () => {
    // Validieren, dass ein Kündigungsdatum gewählt wurde, wenn fristgerechte Kündigung mit eigenem Datum
    if (cancellationType === 'custom' && !cancellationDate) {
      alert("Bitte geben Sie ein Kündigungsdatum an.");
      return;
    }
    
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member && selectedMembershipId) {
        const selectedMembership = member.memberships.find(m => m.id === selectedMembershipId);
        const updatedMemberships = member.memberships.map(m => {
          if (m.id === selectedMembershipId) {
            // Bei fristloser Kündigung endet der Vertrag sofort
            if (cancellationType === 'immediate') {
              const today = new Date();
              return { 
                ...m, 
                status: 'cancelled' as MembershipStatus,
                end_date: today.toISOString().split('T')[0]
              };
            }
            // Bei Kündigung zu einem benutzerdefinierten Datum
            else if (cancellationType === 'custom' && cancellationDate) {
              return { 
                ...m, 
                status: 'cancelled' as MembershipStatus,
                end_date: cancellationDate
              };
            } 
            // Bei fristgerechter Kündigung läuft der Vertrag bis zum bestehenden Enddatum
            else {
              return { 
                ...m, 
                status: 'cancelled' as MembershipStatus,
                // Bestehende Logik beibehalten
                end_date: cancellationDate || m.end_date 
              };
            }
          }
          return m;
        });
        
        const updatedMember = {
          ...member,
          memberships: updatedMemberships
        };
        
        setMember(updatedMember);
        // Speichere aktualisierte Daten in localStorage
        saveMemberToLocalStorage(updatedMember);
      }
      
      setIsSaving(false);
      setIsCancelMembershipModalOpen(false);
      // Zurücksetzen der Kündigungsformular-Werte
      setCancellationDate('');
      setCancellationType('regular');
    }, 600);
  };

  const submitSuspendMembership = () => {
    // Prüfen, ob das Pflichtfeld "Stilllegung bis" ausgefüllt ist
    if (!suspendUntilDate) {
      alert("Bitte geben Sie ein Datum für 'Stilllegung bis' an.");
      return;
    }
    
    setIsSaving(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      if (member && selectedMembershipId) {
        const selectedMembership = member.memberships.find(m => m.id === selectedMembershipId);
        
        if (selectedMembership) {
          // Berechne die Zeit zwischen heute und dem Ende des Vertrags
          const today = new Date();
          const endDate = new Date(selectedMembership.end_date);
          
          // Berechne das neue Enddatum (Vertragsdauer wird verlängert um die Stilllegungszeit)
          let newEndDate = new Date(selectedMembership.end_date);
          
          // Wenn ein Datum für die Stilllegung angegeben wurde
          const suspendUntil = new Date(suspendUntilDate);
          
          // Speichere das Stilllegungsdatum in einem Datenattribut für spätere Berechnungen
          // Dies würde in einer realen Anwendung wahrscheinlich in der Datenbank gespeichert werden
          
          // Nur verlängern, wenn das Stilllegungsdatum in der Zukunft liegt
          const suspensionTimeMs = suspendUntil.getTime() - today.getTime();
          const suspensionDays = Math.ceil(suspensionTimeMs / (1000 * 60 * 60 * 24));
          
          if (suspensionDays > 0) {
            newEndDate.setDate(newEndDate.getDate() + suspensionDays);
          }
          
          const updatedMemberships = member.memberships.map(m => {
            if (m.id === selectedMembershipId) {
              return { 
                ...m, 
                status: 'suspended' as MembershipStatus,
                end_date: newEndDate.toISOString().split('T')[0],
                // In einer realen Anwendung würden wir ein separates Feld für das Stilllegungsdatum verwenden
                // Hier simulieren wir das durch Hinzufügen eines Kommentars
                suspension_end_date: suspendUntilDate
              };
            }
            return m;
          });
          
          const updatedMember = {
            ...member,
            memberships: updatedMemberships
          };
          
          setMember(updatedMember);
          // Speichere aktualisierte Daten in localStorage
          saveMemberToLocalStorage(updatedMember);
        }
      }
      
      setIsSaving(false);
      setIsSuspendMembershipModalOpen(false);
    }, 600);
  };

  // Hilfsfunktion zum Berechnen des Enddatums
  const calculateEndDate = (startDateStr: string, termMonths: number): string => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + termMonths);
    
    // Korrektur für den letzten Tag des Monats
    endDate.setDate(endDate.getDate() - 1);
    
    return endDate.toISOString().split('T')[0];
  };
  
  const renderMembershipStatus = (status: MembershipStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="green">Aktiv</Badge>;
      case 'cancelled':
        return <Badge variant="red">Gekündigt</Badge>;
      case 'completed':
        return <Badge variant="gray">Abgelaufen</Badge>;
      case 'suspended':
        return <Badge variant="yellow">Stillgelegt</Badge>;
      case 'planned':
        return <Badge variant="blue">Geplant</Badge>;
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
  
  // Funktion zum Bestätigen der Überschneidungswarnung
  const confirmOverlap = () => {
    if (pendingMembershipData) {
      // Wir müssen auch die aktive Mitgliedschaft finden, um sie zu aktualisieren
      const activeMembership = getCurrentOrPlannedMembership();
      
      if (activeMembership && member) {
        // Aktualisiere die bestehende Mitgliedschaft sofort hier
        const updatedMemberships = member.memberships.map(m => {
          if (m.id === activeMembership.id) {
            // Berechne das Enddatum als Tag vor Start des neuen Vertrags
            const newEndDate = new Date(pendingMembershipData.start_date);
            newEndDate.setDate(newEndDate.getDate() - 1);
            
            return { 
              ...m, 
              status: 'active' as MembershipStatus, // Status bleibt aktiv, nur das Enddatum wird angepasst
              end_date: newEndDate.toISOString().split('T')[0] // Enddatum auf Tag vor Start des neuen Vertrags setzen
            };
          }
          return m;
        });
        
        // Aktualisiere den Member-State
        const updatedMember = {
          ...member,
          memberships: updatedMemberships
        };
        
        setMember(updatedMember);
        // Speichere aktualisierte Daten in localStorage
        saveMemberToLocalStorage(updatedMember);
      }
      
      // Dann normal fortfahren mit dem Hinzufügen oder Verlängern
      if (isNewMembership) {
        processMembershipAdd(pendingMembershipData);
      } else {
        processExtendMembership(pendingMembershipData);
      }
    }
    setIsOverlapWarningModalOpen(false);
    setPendingMembershipData(null);
  };

  // Funktion zum Abbrechen der Überschneidung
  const cancelOverlap = () => {
    setIsOverlapWarningModalOpen(false);
    setPendingMembershipData(null);
    
    // Bei Abbruch auch die zugehörigen Modals schließen
    if (isNewMembership) {
      setIsAddMembershipModalOpen(false);
    } else {
      setIsExtendMembershipModalOpen(false);
    }
  };
  
  // Hilfsfunktion zur Prüfung, ob ein Mitgliedschaftsstatus Aktionen erlaubt
  const isActionable = (status: MembershipStatus): boolean => {
    return status === 'active' || status === 'planned';
  };
  
  // Hilfsfunktion zum Überprüfen, ob ein Vertrag abgelaufen ist
  const isExpired = (membership: any) => {
    // Ein Vertrag gilt nur als abgelaufen, wenn
    // 1. sein Enddatum in der Vergangenheit liegt UND
    // 2. sein Status nicht 'cancelled' ist (sonst wurde er durch einen neuen Vertrag ersetzt)
    const endDate = new Date(membership.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Setze Zeit auf Mitternacht für korrekte Vergleiche
    
    return membership.status !== 'cancelled' && endDate < today;
  };
  
  const handleViewMembershipDetails = (membershipId: string) => {
    setExpandedMembershipId(expandedMembershipId === membershipId ? null : membershipId);
  };

  // Load member documents
  const loadMemberDocuments = async () => {
    setIsLoadingFiles(true);
    setFilesError(null);
    try {
      const files = await getFileAssets({
        module_reference: 'system',
        category: 'document',
        tags: [`member_${member?.id}`] // Use member-specific tag for filtering
      });
      setFileAssets(files);
    } catch (error) {
      console.error('Fehler beim Laden der Dokumente:', error);
      setFilesError('Fehler beim Laden der Dokumente');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents' && member) {
      loadMemberDocuments();
    }
  }, [activeTab, member?.id]);

  // Document Management Handlers
  const handleFileUpload = (fileAsset: FileAsset) => {
    setFileAssets(prev => [fileAsset, ...prev]);
    setShowUploadModal(false);
  };

  const handleContractUpload = (fileAsset: FileAsset) => {
    // Add contract-specific tag
    setFileAssets(prev => [fileAsset, ...prev]);
    setShowContractUpload(false);
  };

  const handleViewFile = (file: FileAsset) => {
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleDeleteFile = (file: FileAsset) => {
    setSelectedFile(file);
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!selectedFile) return;

    try {
      const success = await deleteFileAsset(selectedFile.id);
      if (success) {
        setFileAssets(prev => prev.filter(f => f.id !== selectedFile.id));
        setShowDeleteModal(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Datei:', error);
    }
  };

  const getFilteredFiles = () => {
    if (selectedFolder === 'all') return fileAssets;
    return fileAssets.filter(file => 
      file.tags.some(tag => tag.toLowerCase().includes(selectedFolder.toLowerCase()))
    );
  };

  const getFolderCounts = () => {
    const counts = {
      vertraege: fileAssets.filter(f => f.tags.some(t => t.includes('vertrag') || t.includes('contract'))).length,
      zahlungsbelege: fileAssets.filter(f => f.tags.some(t => t.includes('zahlung') || t.includes('beleg'))).length,
      korrespondenz: fileAssets.filter(f => f.tags.some(t => t.includes('korrespondenz') || t.includes('email'))).length,
      sonstiges: fileAssets.filter(f => !f.tags.some(t => 
        t.includes('vertrag') || t.includes('contract') || 
        t.includes('zahlung') || t.includes('beleg') ||
        t.includes('korrespondenz') || t.includes('email')
      )).length
    };
    return counts;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx': return <FileText className="w-6 h-6 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <File className="w-6 h-6 text-green-500" />;
      default: return <File className="w-6 h-6 text-gray-500" />;
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
      
      {/* Badges unter dem Header */}
      <div className="flex flex-wrap gap-2 mb-6 -mt-4">
        {/* Mitgliedsstatus Badge */}
        {member.memberships && member.memberships.length > 0 ? (
          getCurrentOrPlannedMembership() ? 
            renderMembershipStatus(getCurrentOrPlannedMembership()!.status) : 
            (member.memberships[0].status === 'planned' ? 
              renderMembershipStatus('planned') : 
              renderMembershipStatus('completed'))
        ) : (
          <Badge variant="gray">Kein Vertrag</Badge>
        )}
        
        {/* Ampelsystem für aktive Mitgliedschaften */}
        {getCurrentOrPlannedMembership() && getCurrentOrPlannedMembership()!.status === 'active' && 
          <RemainingDaysBadge membership={getCurrentOrPlannedMembership()} />}
        
        {/* Mitgliedschaftszähler */}
        <MembershipCounter memberships={member.memberships} />
      </div>
      
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
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'documents'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('documents')}
        >
          Dokumente
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'payment'
              ? 'text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('payment')}
        >
          Beitragskonto
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
              {getCurrentOrPlannedMembership() ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">
                        {getCurrentOrPlannedMembership()?.contract_type?.name || 'Unbekannt'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Laufzeit: {getCurrentOrPlannedMembership()?.term} Monate
                      </p>
                      {getCurrentOrPlannedMembership()?.campaign_name && (
                        <div className="mt-2">
                          <Badge variant="purple" className="flex items-center gap-1">
                            <Tag size={14} />
                            <span>Kampagne: {getCurrentOrPlannedMembership()?.campaign_name}</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div>
                      {renderMembershipStatus(getCurrentOrPlannedMembership()!.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Startdatum</h4>
                      <p className="text-gray-900">
                        {formatDate(getCurrentOrPlannedMembership()?.start_date || '')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Enddatum</h4>
                      <p className="text-gray-900">
                        {formatDate(getCurrentOrPlannedMembership()?.end_date || '')}
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
                  <p className="text-gray-500 mb-4">Keine aktive oder geplante Mitgliedschaft vorhanden</p>
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
      
      {/* Dokumente-Tab */}
      {activeTab === 'documents' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Dokumente</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={<FileText size={16} />}
                onClick={() => setShowContractUpload(true)}
              >
                Vertrag hochladen
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={<Upload size={16} />}
                onClick={() => setShowUploadModal(true)}
              >
                Dokument hochladen
              </Button>
            </div>
          </div>
          
          {/* Dokumentenübersicht */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Verbesserte Dokumentenstruktur */}
            <div className="lg:col-span-1">
              <Card title="Dokumentenkategorien" icon={<Folder size={18} />}>
                <div className="space-y-2">
                  {(() => {
                    const folderCounts = getFolderCounts();
                    return (
                      <>
                        <div 
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFolder === 'all' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFolder('all')}
                        >
                          <Folder size={16} className="text-blue-500" />
                          <span className="text-sm font-medium">Alle Dokumente</span>
                          <span className="text-xs text-gray-500 ml-auto">{fileAssets.length}</span>
                        </div>
                        
                        <div 
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFolder === 'vertraege' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFolder('vertraege')}
                        >
                          <Folder size={16} className="text-green-500" />
                          <span className="text-sm font-medium">Verträge</span>
                          <span className="text-xs text-gray-500 ml-auto">{folderCounts.vertraege}</span>
                        </div>
                        
                        <div 
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFolder === 'zahlungsbelege' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFolder('zahlungsbelege')}
                        >
                          <Folder size={16} className="text-yellow-500" />
                          <span className="text-sm font-medium">Zahlungsbelege</span>
                          <span className="text-xs text-gray-500 ml-auto">{folderCounts.zahlungsbelege}</span>
                        </div>
                        
                        <div 
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFolder === 'korrespondenz' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFolder('korrespondenz')}
                        >
                          <Folder size={16} className="text-purple-500" />
                          <span className="text-sm font-medium">Korrespondenz</span>
                          <span className="text-xs text-gray-500 ml-auto">{folderCounts.korrespondenz}</span>
                        </div>
                        
                        <div 
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedFolder === 'sonstiges' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedFolder('sonstiges')}
                        >
                          <Folder size={16} className="text-gray-500" />
                          <span className="text-sm font-medium">Sonstiges</span>
                          <span className="text-xs text-gray-500 ml-auto">{folderCounts.sonstiges}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </Card>
            </div>
            
            {/* Verbesserte Dokumentenliste */}
            <div className="lg:col-span-3">
              <Card>
                {/* Filteranzeige */}
                {selectedFolder !== 'all' && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">
                        Gefiltert nach: <strong>{selectedFolder === 'vertraege' ? 'Verträge' : 
                                               selectedFolder === 'zahlungsbelege' ? 'Zahlungsbelege' :
                                               selectedFolder === 'korrespondenz' ? 'Korrespondenz' : 'Sonstiges'}</strong>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFolder('all')}
                        icon={<X size={14} />}
                      >
                        Filter entfernen
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Loading State */}
                  {isLoadingFiles && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Dokumente werden geladen...</p>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {filesError && (
                    <div className="text-center py-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{filesError}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={loadMemberDocuments}
                        >
                          Erneut versuchen
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Gefilterte Dokumente Liste */}
                  {!isLoadingFiles && !filesError && (
                    <>
                      {(() => {
                        const filteredFiles = getFilteredFiles();
                        return filteredFiles.length > 0 ? (
                          filteredFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                  {getFileTypeIcon(file.filename)}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-sm font-medium text-gray-900">{file.filename}</h3>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span className="px-2 py-1 bg-gray-100 rounded">{file.category}</span>
                                    {file.description && (
                                      <>
                                        <span>•</span>
                                        <span>{file.description}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>Hochgeladen: {formatDate(file.created_at)}</span>
                                  </div>
                                  {/* Tags anzeigen */}
                                  {file.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {file.tags.slice(0, 3).map((tag, index) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                          {tag}
                                        </span>
                                      ))}
                                      {file.tags.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                          +{file.tags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  icon={<Eye size={14} />}
                                  onClick={() => handleViewFile(file)}
                                >
                                  Ansehen
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  icon={<Download size={14} />}
                                  onClick={() => window.open(file.file_url, '_blank')}
                                >
                                  Download
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  icon={<Trash2 size={14} />} 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteFile(file)}
                                >
                                  Löschen
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">
                              {selectedFolder === 'all' ? 'Noch keine Dokumente vorhanden' : 
                               `Keine ${selectedFolder === 'vertraege' ? 'Verträge' : 
                                        selectedFolder === 'zahlungsbelege' ? 'Zahlungsbelege' :
                                        selectedFolder === 'korrespondenz' ? 'Korrespondenz' : 'sonstigen Dokumente'} gefunden`}
                            </p>
                            <p className="text-sm mt-2">
                              {selectedFolder === 'all' ? 
                                'Laden Sie das erste Dokument für dieses Mitglied hoch' :
                                `Keine Dokumente in der Kategorie "${selectedFolder}" vorhanden`}
                            </p>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
                
                {/* Verbesserter Upload-Bereich */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Allgemeiner Upload */}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <Upload size={20} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Dokument hochladen</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG</p>
                    </div>
                    
                    {/* Vertrag-spezifischer Upload */}
                    <div 
                      className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer bg-green-50"
                      onClick={() => setShowContractUpload(true)}
                    >
                      <FileText size={20} className="mx-auto text-green-500 mb-2" />
                      <p className="text-sm text-green-700 mb-1 font-medium">Vertrag hochladen</p>
                      <p className="text-xs text-green-600">Spezielle Vertragsablage</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Beitragskonto-Tab */}
      {activeTab === 'payment' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Beitragskonto</h2>
          </div>
          
          <MemberPaymentCard memberId={member.id} memberName={`${member.first_name} ${member.last_name}`} />
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
                            {membership.contract_type?.name || 'Unbekannt'}
                          </div>
                          {membership.campaign_name && (
                            <div className="mt-1">
                              <Badge variant="purple" className="flex items-center gap-1 text-xs">
                                <Tag size={12} />
                                <span>{membership.campaign_name}</span>
                              </Badge>
                            </div>
                          )}
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
                          <div className="flex justify-end gap-2">
                            {isActionable(membership.status) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={<Edit size={14} />}
                                  onClick={() => handleExtendMembership(membership.id)}
                                >
                                  Verlängern
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={<X size={14} />}
                                  onClick={() => handleCancelMembership(membership.id)}
                                >
                                  Kündigen
                                </Button>
                                {membership.status === 'active' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<Pause size={14} />}
                                    onClick={() => handleSuspendMembership(membership.id)}
                                  >
                                    Stilllegen
                                  </Button>
                                )}
                                {membership.status === 'suspended' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={<CheckCircle size={14} />}
                                    onClick={() => handleReactivateMembership(membership.id)}
                                  >
                                    Reaktivieren
                                  </Button>
                                )}
                              </>
                            )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                              icon={<FileText size={14} />}
                              onClick={() => handleViewMembershipDetails(membership.id)}
                          >
                            Details
                          </Button>
                          </div>
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

      {/* Modal: Mitgliedschaft verlängern */}
      <Modal
        isOpen={isExtendMembershipModalOpen}
        onClose={() => setIsExtendMembershipModalOpen(false)}
        title="Mitgliedschaft verlängern"
        footer={null}
      >
        {selectedMembershipId && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Die aktuelle Mitgliedschaft wird mit dem Startdatum der neuen Mitgliedschaft beendet und eine neue Mitgliedschaft wird erstellt.
            </p>
            
            <MembershipForm
              onSubmit={submitExtendMembership}
              onCancel={() => setIsExtendMembershipModalOpen(false)}
              isLoading={isSaving}
              memberId={member.id}
              initialData={{
                member_id: member.id,
                contract_type_id: member.memberships.find(m => m.id === selectedMembershipId)?.contract_type?.id || '',
                term: member.memberships.find(m => m.id === selectedMembershipId)?.term || 12,
                // Standardmäßig das Startdatum einen Tag nach dem Ende des aktuellen Vertrags setzen
                start_date: (() => {
                  const currentMembership = member.memberships.find(m => m.id === selectedMembershipId);
                  if (currentMembership) {
                    const nextDay = new Date(currentMembership.end_date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    return nextDay.toISOString().split('T')[0];
                  }
                  return new Date().toISOString().split('T')[0];
                })(),
                // Status wird in processExtendMembership automatisch gesetzt
                status: 'active' as MembershipStatus,
              }}
              contractTypes={CONTRACT_TYPES}
            />
          </div>
        )}
      </Modal>

      {/* Modal: Mitgliedschaft kündigen */}
      <Modal
        isOpen={isCancelMembershipModalOpen}
        onClose={() => setIsCancelMembershipModalOpen(false)}
        title="Mitgliedschaft kündigen"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsCancelMembershipModalOpen(false)} 
              disabled={isSaving}
              icon={<X size={18} />}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={submitCancelMembership}
              isLoading={isSaving}
              icon={<Save size={18} />}
            >
              Kündigen
            </Button>
          </>
        }
      >
        {selectedMembershipId && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Möchten Sie die Mitgliedschaft "{member.memberships.find(m => m.id === selectedMembershipId)?.contract_type?.name}" wirklich kündigen?
            </p>
            
            <FormField
              label="Kündigungsart"
              htmlFor="cancellation_type"
            >
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="regular_cancellation"
                    type="radio"
                    name="cancellation_type"
                    value="regular"
                    checked={cancellationType === 'regular'}
                    onChange={() => setCancellationType('regular')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="regular_cancellation" className="ml-2 block text-sm text-gray-900">
                    Fristgerechte Kündigung (Reguläres Vertragsende)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="custom_cancellation"
                    type="radio"
                    name="cancellation_type"
                    value="custom"
                    checked={cancellationType === 'custom'}
                    onChange={() => setCancellationType('custom')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="custom_cancellation" className="ml-2 block text-sm text-gray-900">
                    Kündigung zu einem benutzerdefinierten Datum
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="immediate_cancellation"
                    type="radio"
                    name="cancellation_type"
                    value="immediate"
                    checked={cancellationType === 'immediate'}
                    onChange={() => setCancellationType('immediate')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="immediate_cancellation" className="ml-2 block text-sm text-gray-900">
                    Fristlose Kündigung (Sofortige Beendigung)
                  </label>
                </div>
              </div>
            </FormField>
            
            {cancellationType === 'regular' && (
              <FormField
                label="Kündigung zum"
                htmlFor="cancellation_date"
              >
                <div className="flex items-center gap-2">
                  <input
                    id="use_current_enddate"
                    type="checkbox"
                    checked={!cancellationDate}
                    onChange={() => setCancellationDate('')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="use_current_enddate" className="text-sm text-gray-900">
                    Reguläres Vertragsende verwenden ({formatDate(member.memberships.find(m => m.id === selectedMembershipId)?.end_date || '')})
                  </label>
                </div>
                
                {cancellationDate && (
                  <input
                    id="cancellation_date"
                    type="date"
                    value={cancellationDate}
                    onChange={(e) => setCancellationDate(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]} // Mindestens heutiges Datum
                  />
                )}
              </FormField>
            )}
            
            {cancellationType === 'custom' && (
              <FormField
                label="Kündigungsdatum"
                htmlFor="custom_cancellation_date"
                required
              >
                <input
                  id="custom_cancellation_date"
                  type="date"
                  value={cancellationDate}
                  onChange={(e) => setCancellationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]} // Mindestens heutiges Datum
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wählen Sie das gewünschte Datum, zu dem die Mitgliedschaft enden soll.
                </p>
              </FormField>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Mitgliedschaft stilllegen */}
      <Modal
        isOpen={isSuspendMembershipModalOpen}
        onClose={() => setIsSuspendMembershipModalOpen(false)}
        title="Mitgliedschaft stilllegen"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsSuspendMembershipModalOpen(false)} 
              disabled={isSaving}
              icon={<X size={18} />}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={submitSuspendMembership}
              isLoading={isSaving}
              icon={<Pause size={18} />}
            >
              Mitgliedschaft stilllegen
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Die Mitgliedschaft wird temporär ausgesetzt. Der Vertrag bleibt bestehen, aber der Mitgliedszugang ist während dieser Zeit deaktiviert.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Hinweis zur Vertragsverlängerung</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Bei Stilllegung wird die Vertragslaufzeit automatisch um die Dauer der Stilllegung verlängert. 
                    Wenn Sie ein Datum für "Stilllegung bis" angeben, wird die Vertragsdauer entsprechend angepasst.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <FormField
            label="Grund für die Stilllegung"
            htmlFor="suspend_reason"
          >
            <textarea
              id="suspend_reason"
              name="suspend_reason"
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Grund für die Stilllegung eingeben..."
              disabled={isSaving}
            />
          </FormField>
          
          <FormField
            label="Stilllegung bis"
            htmlFor="suspend_until"
            required
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                id="suspend_until"
                name="suspend_until"
                type="date"
                value={suspendUntilDate}
                onChange={(e) => setSuspendUntilDate(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSaving}
                required
              />
            </div>
          </FormField>
        </div>
      </Modal>

      {/* Warnung bei Überschneidung von Verträgen */}
      <Modal
        isOpen={isOverlapWarningModalOpen}
        onClose={cancelOverlap}
        title="Achtung: Vertragslaufzeiten überschneiden sich"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={cancelOverlap} 
              icon={<X size={18} />}
            >
              Abbrechen
            </Button>
            <Button
              variant="primary"
              onClick={confirmOverlap}
              icon={<CheckCircle size={18} />}
            >
              Trotzdem fortfahren
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Vertragslaufzeiten überschneiden sich</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Das Startdatum des neuen Vertrags liegt innerhalb der Laufzeit eines aktiven Vertrags. 
                    Wenn Sie fortfahren, wird der aktuelle Vertrag mit dem Startdatum des neuen Vertrags beendet.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Möchten Sie trotzdem fortfahren und den neuen Vertrag anlegen?
          </p>
        </div>
      </Modal>

      {/* Modal: Mitgliedschaftsdetails */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Mitgliedschaftsdetails"
        footer={
          <Button 
            variant="outline" 
            onClick={() => setIsDetailModalOpen(false)} 
            icon={<X size={18} />}
          >
            Schließen
          </Button>
        }
      >
        {selectedMembershipId && (
          <div className="space-y-6">
            {(() => {
              const membership = member.memberships.find(m => m.id === selectedMembershipId);
              if (!membership) return <p>Mitgliedschaft nicht gefunden</p>;
              
              return (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{membership.contract_type?.name || 'Unbekannt'}</h3>
                      <p className="text-sm text-gray-500">Laufzeit: {membership.term} Monate</p>
                    </div>
                    <div>{renderMembershipStatus(membership.status)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Startdatum</h4>
                      <p className="text-gray-900">{formatDate(membership.start_date)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Enddatum</h4>
                      <p className="text-gray-900">{formatDate(membership.end_date)}</p>
                    </div>
                  </div>
                  
                  {membership.has_group_discount && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <h4 className="text-sm font-medium text-blue-700">Gruppenrabatt aktiviert</h4>
                    </div>
                  )}
                  
                  {membership.campaign_name && (
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <h4 className="text-sm font-medium text-green-700">Abgeschlossen im Rahmen der Aktion: {membership.campaign_name}</h4>
                    </div>
                  )}
                  
                  {membership.extras && membership.extras.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Zusatzleistungen</h4>
                      <ul className="divide-y divide-gray-100">
                        {membership.extras.map(extra => (
                          <li key={extra.id} className="py-2 flex justify-between">
                            <span>{extra.name}</span>
                            {extra.price && <span className="text-gray-600">{extra.price.toFixed(2)} €/Monat</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {membership.predecessor_id && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Dieser Vertrag ist eine Verlängerung eines vorherigen Vertrags.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>
      
      {/* Dokumenten-Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Dokument hochladen"
        footer={
          <Button 
            variant="outline" 
            onClick={() => setShowUploadModal(false)} 
            icon={<X size={18} />}
          >
            Schließen
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Laden Sie ein Dokument für <strong>{member?.first_name} {member?.last_name}</strong> hoch.
          </p>
          
          <FileUpload
            onUploadComplete={handleFileUpload}
            defaultCategory="document"
            defaultModuleReference="system"
          />
        </div>
      </Modal>

      {/* Dokumenten-Ansicht Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedFile?.filename || "Dokument"}
        footer={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.open(selectedFile?.file_url, '_blank')}
              icon={<ExternalLink size={18} />}
            >
              In neuem Tab öffnen
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowViewModal(false)} 
              icon={<X size={18} />}
            >
              Schließen
            </Button>
          </div>
        }
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Kategorie:</span>
                <span className="ml-2">{selectedFile.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Hochgeladen:</span>
                <span className="ml-2">{formatDate(selectedFile.created_at)}</span>
              </div>
              {selectedFile.description && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Beschreibung:</span>
                  <span className="ml-2">{selectedFile.description}</span>
                </div>
              )}
            </div>
            
            {/* Vorschau für PDF-Dateien */}
            {selectedFile.filename.toLowerCase().endsWith('.pdf') && (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={selectedFile.file_url}
                  className="w-full h-96"
                  title={selectedFile.filename}
                />
              </div>
            )}
            
            {/* Vorschau für Bilder */}
            {(selectedFile.filename.toLowerCase().endsWith('.jpg') || 
              selectedFile.filename.toLowerCase().endsWith('.jpeg') || 
              selectedFile.filename.toLowerCase().endsWith('.png')) && (
              <div className="text-center">
                <img
                  src={selectedFile.file_url}
                  alt={selectedFile.filename}
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                />
              </div>
            )}
            
            {/* Fallback für andere Dateitypen */}
            {!selectedFile.filename.toLowerCase().endsWith('.pdf') &&
             !selectedFile.filename.toLowerCase().endsWith('.jpg') &&
             !selectedFile.filename.toLowerCase().endsWith('.jpeg') &&
             !selectedFile.filename.toLowerCase().endsWith('.png') && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getFileTypeIcon(selectedFile.filename)}
                </div>
                <p className="text-gray-600">Vorschau für diesen Dateityp nicht verfügbar</p>
                <p className="text-sm text-gray-500">Klicken Sie auf "In neuem Tab öffnen" um die Datei anzuzeigen</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Dokumenten-Lösch Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Dokument löschen"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)} 
              icon={<X size={18} />}
            >
              Abbrechen
            </Button>
            <Button
              variant="outline"
              onClick={confirmDeleteFile}
              icon={<Trash2 size={18} />}
              className="text-red-600 hover:text-red-700"
            >
              Löschen
            </Button>
          </>
        }
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Achtung: Unwiderrufliche Aktion</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Das Dokument wird dauerhaft gelöscht und kann nicht wiederhergestellt werden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Möchten Sie das folgende Dokument wirklich löschen?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    {getFileTypeIcon(selectedFile.filename)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.filename}</p>
                    <p className="text-xs text-gray-500">
                      Hochgeladen: {formatDate(selectedFile.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Vertrag-Upload Modal */}
      <Modal
        isOpen={showContractUpload}
        onClose={() => setShowContractUpload(false)}
        title="Vertrag hochladen"
        footer={
          <Button 
            variant="outline" 
            onClick={() => setShowContractUpload(false)} 
            icon={<X size={18} />}
          >
            Schließen
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Vertragsupload</h3>
                <p className="text-sm text-green-700 mt-1">
                  Laden Sie hier Vertragsdokumente für <strong>{member?.first_name} {member?.last_name}</strong> hoch. 
                  Diese werden automatisch in der Kategorie "Verträge" abgelegt.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Vertragsdetails</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vertragstyp</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                  <option>Mitgliedschaftsvertrag</option>
                  <option>Zusatzleistungsvertrag</option>
                  <option>Änderungsvereinbarung</option>
                  <option>Kündigungsbestätigung</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vertragsdatum</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          
          <FileUpload
            onUploadComplete={handleContractUpload}
            defaultCategory="document"
            defaultModuleReference="system"
          />
        </div>
      </Modal>
    </div>
  );
} 