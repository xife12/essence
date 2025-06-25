'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Euro, Filter, Search, Plus, FileText, Download } from 'lucide-react';
import type { 
  BeitragskalenderOverview, 
  BeitragskalenderFilters, 
  BeitragskalenderStatistics,
  BeitragskalenderStatus,
  BeitragskalenderTransactionType,
  PaymentSchedule 
} from '../../lib/types/beitragskalender';
import { beitragskalenderAPI } from '../../lib/api/beitragskalender-api';
import { BeitragManagementModal, BeitragEntry } from './BeitragManagementModal';

interface BeitragskalenderViewProps {
  memberId?: string; // Wenn gesetzt, zeige nur Einträge für dieses Mitglied
  showAdminControls?: boolean;
  compact?: boolean;
}

const BeitragskalenderView: React.FC<BeitragskalenderViewProps> = ({
  memberId,
  showAdminControls = false,
  compact = false
}) => {
  // State Management
  const [entries, setEntries] = useState<BeitragskalenderOverview[]>([]);
  const [statistics, setStatistics] = useState<BeitragskalenderStatistics | null>(null);
  const [filters, setFilters] = useState<BeitragskalenderFilters>({
    member_ids: memberId ? [memberId] : undefined,
    page: 1,
    page_size: compact ? 10 : 50,
    sort_by: 'due_date',
    sort_order: 'asc'
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  
  // Modal states
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BeitragEntry | null>(null);

  // Data Loading - 🔧 NEUE ECHTE DATENBERECHNUNG
  useEffect(() => {
    if (memberId) {
      loadRealBeitragskalender();
    } else {
      loadBeitragskalender();
    }
  }, [filters, memberId]);

  // 🔧 VEREINFACHTE FUNKTION: Lade nur echte Beiträge aus der beitragskalender Tabelle
  const loadRealBeitragskalender = async () => {
    try {
      setLoading(true);
      
      // Hole Beitragskalender-Daten direkt aus der Datenbank
      const { supabase } = await import('../../lib/supabaseClient');
      
      let query = supabase
        .from('beitragskalender_overview')
        .select('*')
        .eq('member_id', memberId);

      // Standard-Filter anwenden
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.transaction_types && filters.transaction_types.length > 0) {
        query = query.in('transaction_type', filters.transaction_types);
      }

      if (filters.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }

      if (filters.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      // Sortierung und Limit
      query = query
        .order(filters.sort_by || 'due_date', { ascending: filters.sort_order !== 'desc' })
        .range((filters.page - 1) * filters.page_size, filters.page * filters.page_size - 1);

      const { data: beitragsData, error: beitragsError } = await query;

      if (beitragsError) {
        console.error('❌ Fehler beim Laden der Beitragskalender-Daten:', beitragsError);
        setEntries([]);
        setStatistics({
          total_entries: 0,
          scheduled_count: 0,
          processed_count: 0,
          failed_count: 0,
          overdue_count: 0,
          total_scheduled_amount: 0,
          total_processed_amount: 0,
          upcoming_7_days: 0,
          upcoming_30_days: 0,
          by_transaction_type: [],
          by_status: []
        });
        return;
      }

      console.log('✅ Beitragskalender-Daten aus DB geladen:', beitragsData?.length);
      
      if (!beitragsData || beitragsData.length === 0) {
        console.log('ℹ️ Keine Beitragskalender-Daten in der Datenbank gefunden - zeige leere Ansicht');
        
        setEntries([]);
        setStatistics({
          total_entries: 0,
          scheduled_count: 0,
          processed_count: 0,
          failed_count: 0,
          overdue_count: 0,
          total_scheduled_amount: 0,
          total_processed_amount: 0,
          upcoming_7_days: 0,
          upcoming_30_days: 0,
          by_transaction_type: [],
          by_status: []
        });
        return;
      }
      
      // Konvertiere DB-Daten zu BeitragskalenderOverview Format
      const formattedEntries: BeitragskalenderOverview[] = beitragsData.map(entry => ({
        id: entry.id,
        member_id: entry.member_id,
        vertrags_id: entry.vertrags_id,
        zahllaufgruppe_id: entry.zahllaufgruppe_id || 'default_group',
        parent_entry_id: entry.parent_entry_id,
        due_date: entry.due_date,
        transaction_type: entry.transaction_type as BeitragskalenderTransactionType,
        amount: parseFloat(entry.amount) || 0,
        description: entry.description || `${entry.transaction_type} ${new Date(entry.due_date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
        status: entry.status as BeitragskalenderStatus,
        created_by: entry.created_by || 'auto_generator',
        is_recurring: entry.is_recurring || true,
        recurrence_pattern: entry.recurrence_pattern || 'monthly',
        recurrence_end_date: entry.recurrence_end_date,
        processed_at: entry.processed_at,
        processing_result: entry.processing_result,
        retry_count: entry.retry_count || 0,
        error_message: entry.error_message,
        sales_tool_reference_id: entry.sales_tool_reference_id,
        sales_tool_origin: entry.sales_tool_origin,
        business_logic_trigger: entry.business_logic_trigger,
        notes: entry.notes,
        tags: entry.tags,
        priority: entry.priority || 1,
        created_at: entry.created_at,
        updated_at: entry.updated_at || entry.created_at,
        created_by_user: entry.created_by_user,
        updated_by_user: entry.updated_by_user,
        effective_status: (entry.effective_status || 'scheduled') as 'overdue' | 'due_today' | 'upcoming' | BeitragskalenderStatus,
        days_until_due: entry.days_until_due || 0,
        due_month: entry.due_month || new Date(entry.due_date).toISOString().substring(0, 7),
        due_year: entry.due_year || new Date(entry.due_date).getFullYear().toString()
      }));
      
      console.log('🔧 FORMATIERTE BEITRAGSKALENDER-EINTRÄGE:', formattedEntries.length);
      
      setEntries(formattedEntries);
      setStatistics({
        total_entries: formattedEntries.length,
        scheduled_count: formattedEntries.filter(e => e.status === 'scheduled').length,
        processed_count: formattedEntries.filter(e => e.status === 'processed').length,
        failed_count: formattedEntries.filter(e => e.status === 'failed').length,
        overdue_count: formattedEntries.filter(e => e.effective_status === 'overdue').length,
        total_scheduled_amount: formattedEntries.filter(e => e.status === 'scheduled').reduce((sum, e) => sum + e.amount, 0),
        total_processed_amount: formattedEntries.filter(e => e.status === 'processed').reduce((sum, e) => sum + e.amount, 0),
        upcoming_7_days: formattedEntries.filter(e => e.days_until_due <= 7 && e.days_until_due > 0).length,
        upcoming_30_days: formattedEntries.filter(e => e.days_until_due <= 30 && e.days_until_due > 0).length,
        by_transaction_type: [],
        by_status: []
      });
      
    } catch (error) {
      console.error('❌ Fehler beim Laden der echten Beitragsdaten:', error);
      setEntries([]);
      setStatistics({
        total_entries: 0,
        scheduled_count: 0,
        processed_count: 0,
        failed_count: 0,
        overdue_count: 0,
        total_scheduled_amount: 0,
        total_processed_amount: 0,
        upcoming_7_days: 0,
        upcoming_30_days: 0,
        by_transaction_type: [],
        by_status: []
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 NEUE FUNKTION: Generiere echte Beiträge aus Mitgliedschaftsdaten
  const generateRealBeitragskalenderFromMembership = (membership: any): BeitragskalenderOverview[] => {
    if (!membership) return [];
    
    const entries: BeitragskalenderOverview[] = [];
    const startDate = new Date(membership.start_date);
    const contractType = membership.contract_type || {};
    const monthlyFee = 89.90; // Fallback since price data structure is complex
    const membershipName = contractType.name || 'Premium';
    
    console.log('🔧 VERTRAGSSTARTDATUM:', startDate);
    console.log('🔧 MONATSBEITRAG:', monthlyFee);
    console.log('🔧 MITGLIEDSCHAFTSNAME:', membershipName);
    
    // Generiere 12 Monate ab Vertragsstartdatum
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);
      dueDate.setDate(1); // Immer der 1. des Monats
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      // Status basierend auf Datum bestimmen
      let status: BeitragskalenderStatus = 'scheduled';
      let effectiveStatus: 'overdue' | 'due_today' | 'upcoming' | BeitragskalenderStatus = 'upcoming';
      
      if (dueDate < today) {
        // Vergangene Beiträge - simuliere teilweise als bezahlt
        status = i % 3 === 0 ? 'processed' : 'scheduled';
        if (status === 'scheduled') {
          effectiveStatus = 'overdue';
        } else {
          effectiveStatus = 'processed';
        }
      }
      
      const entry: BeitragskalenderOverview = {
        id: `real-${membership.id}-${i}`,
        member_id: memberId!,
        vertrags_id: membership.id,
        zahllaufgruppe_id: 'default_group',
        due_date: dueDate.toISOString().split('T')[0],
        transaction_type: 'membership_fee' as BeitragskalenderTransactionType,
        amount: monthlyFee,
        status: status,
        effective_status: effectiveStatus,
        description: `Monatsbeitrag ${membershipName} ${dueDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
        days_until_due: Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        recurrence_pattern: 'monthly' as PaymentSchedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'auto_generator',
        is_recurring: true,
        retry_count: 0,
        priority: 1,
        due_month: dueDate.toISOString().substring(0, 7),
        due_year: dueDate.getFullYear().toString()
      };
      
      entries.push(entry);
    }
    
    // Setup-Gebühr hinzufügen (falls vorhanden) - Note: setup_fee not available in current schema
    if (false) { // Disabled until setup_fee is available in contract_types view
      const setupEntry: BeitragskalenderOverview = {
        id: `setup-${membership.id}`,
        member_id: memberId!,
        vertrags_id: membership.id,
        zahllaufgruppe_id: 'default_group',
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'setup_fee',
        amount: 0, // contractType.setup_fee,
        status: startDate < new Date() ? 'processed' : 'scheduled',
        effective_status: startDate < new Date() ? 'processed' : 'upcoming',
        description: `Startpaket`,
        days_until_due: Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        recurrence_pattern: 'monthly',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'auto_generator',
        is_recurring: false,
        retry_count: 0,
        priority: 1,
        due_month: startDate.toISOString().substring(0, 7),
        due_year: startDate.getFullYear().toString()
      };
      
      entries.unshift(setupEntry);
    }
    
    return entries.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  const loadBeitragskalender = async () => {
    try {
      setLoading(true);
      const response = await beitragskalenderAPI.getBeitragskalenderList(filters);
      setEntries(response.entries);
      setStatistics(response.statistics);
    } catch (error) {
      console.error('❌ Failed to load Beitragskalender:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Updates
  const updateFilters = (newFilters: Partial<BeitragskalenderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      member_ids: memberId ? [memberId] : undefined,
      page: 1,
      page_size: compact ? 10 : 50,
      sort_by: 'due_date',
      sort_order: 'asc'
    });
  };

  // Helper Functions for Modal Integration
  const convertToBeitragEntry = (entry: BeitragskalenderOverview): BeitragEntry => ({
    id: entry.id,
    faelligkeit: entry.due_date,
    typ: entry.transaction_type,
    beschreibung: entry.description,
    betrag: entry.amount,
    ust: 19, // Default UST
    offen: entry.amount, // Simplified logic
    status: entry.status === 'processed' ? 'bezahlt' : 'offen'
  });

  // 🔧 FIX: Korrigierte Beschreibung im Format "Name TT.MM.JJ-TT.MM.JJ"
  const generateBeitragsBeschreibung = (entry: BeitragskalenderOverview): string => {
    const dueDate = new Date(entry.due_date);
    const startOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);
    const endOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0);
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${day}.${month}.${year}`;
    };

    if (entry.transaction_type === 'membership_fee') {
      return `Monatsbeitrag Premium ${formatDate(startOfMonth)}-${formatDate(endOfMonth)}`;
    } else if (entry.transaction_type === 'setup_fee') {
      return `Startpaket ${formatDate(dueDate)}`;
    } else if (entry.transaction_type === 'pauschale') {
      return `Pauschale ${formatDate(dueDate)}`;
    } else {
      return entry.description;
    }
  };

  // 🔧 FIX: Korrigierte Status-Logik (nicht "überfällig" wenn 0€)
  const getCorrectedStatus = (entry: BeitragskalenderOverview): BeitragskalenderStatus => {
    // Wenn der Betrag 0€ ist, sollte der Status "processed" (bezahlt) sein
    if (entry.amount === 0) {
      return 'processed';
    }

    const dueDate = new Date(entry.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    // Wenn bereits als processed markiert, beibehalten
    if (entry.status === 'processed') {
      return 'processed';
    }

    // Wenn überfällig UND Betrag > 0, dann überfällig
    if (dueDate < today && entry.amount > 0) {
      return 'overdue' as BeitragskalenderStatus;
    }

    // Ansonsten original Status verwenden
    return entry.status;
  };

  const handleEditEntry = (entry: BeitragskalenderOverview) => {
    setSelectedEntry(convertToBeitragEntry(entry));
    setShowManagementModal(true);
  };

  const handleSaveEntry = async (updatedEntry: BeitragEntry, action: 'edit' | 'storno' | 'reduce') => {
    try {
      console.log(`🔧 ${action.toUpperCase()} Beitragskalender-Eintrag:`, updatedEntry);
      
      if (action === 'edit') {
        // 🔧 BEARBEITUNG: Aktualisiere den lokalen Entry
        setEntries(prevEntries => 
          prevEntries.map(entry => 
            entry.id === updatedEntry.id 
              ? {
                  ...entry,
                  amount: updatedEntry.betrag,
                  description: updatedEntry.beschreibung,
                  due_date: updatedEntry.faelligkeit,
                  transaction_type: updatedEntry.typ,
                  status: updatedEntry.status === 'bezahlt' ? 'processed' : 'scheduled',
                  updated_at: new Date().toISOString()
                }
              : entry
          )
        );
        console.log('✅ Eintrag erfolgreich bearbeitet');
        
      } else if (action === 'storno') {
        // 🔧 STORNO: Markiere als storniert
        setEntries(prevEntries => 
          prevEntries.map(entry => 
            entry.id === updatedEntry.id 
              ? {
                  ...entry,
                  status: 'cancelled' as any,
                  amount: 0,
                  description: `[STORNIERT] ${entry.description}`,
                  updated_at: new Date().toISOString()
                }
              : entry
          )
        );
        console.log('✅ Eintrag erfolgreich storniert');
        
      } else if (action === 'reduce') {
        // 🔧 REDUZIERUNG: Reduziere den Betrag
        setEntries(prevEntries => 
          prevEntries.map(entry => 
            entry.id === updatedEntry.id 
              ? {
                  ...entry,
                  amount: updatedEntry.betrag,
                  description: `${entry.description} [REDUZIERT]`,
                  updated_at: new Date().toISOString()
                }
              : entry
          )
        );
        console.log('✅ Eintrag erfolgreich reduziert');
      }

      // TODO: In Zukunft echte API-Calls implementieren
      // await beitragskalenderAPI.updateEntry(updatedEntry);
      
    } catch (error) {
      console.error('❌ Fehler beim Speichern des Beitragskalender-Eintrags:', error);
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      console.log('🔧 LÖSCHE Beitragskalender-Eintrag:', entryId);
      
      // 🔧 LÖSCHEN: Entferne Entry aus der Liste
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      
      console.log('✅ Eintrag erfolgreich gelöscht');
      
      // TODO: In Zukunft echte API-Calls implementieren
      // await beitragskalenderAPI.deleteEntry(entryId);
      
    } catch (error) {
      console.error('❌ Fehler beim Löschen des Beitragskalender-Eintrags:', error);
      alert('Fehler beim Löschen des Eintrags: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  };

  // Status Badge Component
  const StatusBadge: React.FC<{ status: BeitragskalenderStatus; effectiveStatus?: string }> = ({ 
    status, 
    effectiveStatus 
  }) => {
    const getStatusConfig = () => {
      if (effectiveStatus === 'overdue') {
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Überfällig' };
      }
      if (effectiveStatus === 'due_today') {
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Heute fällig' };
      }
      
      switch (status) {
        case 'scheduled':
          return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Geplant' };
        case 'processed':
          return { bg: 'bg-green-100', text: 'text-green-800', label: 'Verarbeitet' };
        case 'failed':
          return { bg: 'bg-red-100', text: 'text-red-800', label: 'Fehlgeschlagen' };
        case 'cancelled':
          return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Storniert' };
        case 'suspended':
          return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Ausgesetzt' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
      }
    };

    const config = getStatusConfig();
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Transaction Type Badge
  const TransactionTypeBadge: React.FC<{ type: BeitragskalenderTransactionType }> = ({ type }) => {
    const getTypeConfig = () => {
      switch (type) {
        case 'membership_fee':
          return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Beitrag' };
        case 'pauschale':
          return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Pauschale' };
        case 'modul':
          return { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Modul' };
        case 'setup_fee':
          return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Startpaket' };
        case 'penalty_fee':
          return { bg: 'bg-red-100', text: 'text-red-800', label: 'Gebühr' };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
      }
    };

    const config = getTypeConfig();
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Statistics Cards
  const StatisticsCards: React.FC = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Geplant</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.scheduled_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Überfällig</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.overdue_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Euro className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Offener Betrag</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.total_scheduled_amount.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-indigo-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Gesamt</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.total_entries}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter Panel
  const FilterPanel: React.FC = () => {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
      updateFilters(localFilters);
      setShowFilters(false);
    };

    if (!showFilters) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              multiple
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={localFilters.status || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as BeitragskalenderStatus[];
                setLocalFilters(prev => ({ ...prev, status: values }));
              }}
            >
              <option value="scheduled">Geplant</option>
              <option value="processed">Verarbeitet</option>
              <option value="failed">Fehlgeschlagen</option>
              <option value="cancelled">Storniert</option>
              <option value="suspended">Ausgesetzt</option>
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typ</label>
            <select 
              multiple
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={localFilters.transaction_types || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value) as BeitragskalenderTransactionType[];
                setLocalFilters(prev => ({ ...prev, transaction_types: values }));
              }}
            >
              <option value="membership_fee">Beitrag</option>
              <option value="pauschale">Pauschale</option>
              <option value="modul">Modul</option>
              <option value="setup_fee">Startpaket</option>
              <option value="penalty_fee">Gebühr</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fälligkeitsdatum</label>
            <div className="space-y-2">
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={localFilters.due_date_from || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, due_date_from: e.target.value }))}
                placeholder="Von"
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={localFilters.due_date_to || ''}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, due_date_to: e.target.value }))}
                placeholder="Bis"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setShowFilters(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Zurücksetzen
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Anwenden
          </button>
        </div>
      </div>
    );
  };

  // Entry Row Component
  const EntryRow: React.FC<{ entry: BeitragskalenderOverview }> = ({ entry }) => {
    const dueDate = new Date(entry.due_date);
    const isSelected = selectedEntries.includes(entry.id);

    return (
      <tr className={`${isSelected ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>
        {showAdminControls && (
          <td className="px-6 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEntries(prev => [...prev, entry.id]);
                } else {
                  setSelectedEntries(prev => prev.filter(id => id !== entry.id));
                }
              }}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </td>
        )}

        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {dueDate.toLocaleDateString('de-DE')}
          {entry.days_until_due >= 0 && entry.days_until_due <= 7 && (
            <span className="ml-2 text-xs text-orange-600">
              ({entry.days_until_due === 0 ? 'Heute' : `in ${entry.days_until_due}d`})
            </span>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <TransactionTypeBadge type={entry.transaction_type} />
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {generateBeitragsBeschreibung(entry)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {entry.zahllaufgruppe_id || 'default_group'}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {entry.amount.toFixed(2)}€
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          19%
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={getCorrectedStatus(entry)} effectiveStatus={entry.effective_status} />
        </td>

        {!compact && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {entry.recurrence_pattern ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                {entry.recurrence_pattern === 'monthly' ? 'Monatlich' :
                 entry.recurrence_pattern === 'quarterly' ? 'Quartalsweise' :
                 entry.recurrence_pattern === 'yearly' ? 'Jährlich' : 
                 entry.recurrence_pattern}
              </span>
            ) : '-'}
          </td>
        )}

        {showAdminControls && (
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              onClick={() => handleEditEntry(entry)}
              className="text-blue-600 hover:text-blue-900 mr-4"
            >
              Bearbeiten
            </button>
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="text-red-600 hover:text-red-900"
            >
              Löschen
            </button>
          </td>
        )}
      </tr>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Lade Beitragskalender...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">
              🔧 NEUER {memberId ? 'Beitragskalender' : 'Alle Beitragskalender'} (FIX AKTIV)
            </h2>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              ✅ KORRIGIERT
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Übersicht über geplante und verarbeitete Beiträge
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {showAdminControls && (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              
              <button
                onClick={() => {/* TODO: Add New Entry */}}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Neu
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      {!compact && <StatisticsCards />}

      {/* Filter Panel */}
      <FilterPanel />

      {/* Bulk Actions */}
      {showAdminControls && selectedEntries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedEntries.length} Eintrag(e) ausgewählt
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => {/* TODO: Bulk Process */}}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Als verarbeitet markieren
              </button>
              <button
                onClick={() => {/* TODO: Bulk Cancel */}}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Stornieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showAdminControls && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === entries.length && entries.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries(entries.map(entry => entry.id));
                        } else {
                          setSelectedEntries([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fälligkeit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beschreibung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zahlgruppe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USt.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {!compact && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rhythmus
                  </th>
                )}
                {showAdminControls && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.length === 0 ? (
                <tr>
                  <td 
                    colSpan={showAdminControls ? 10 : 8} 
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Keine Beitragskalender gefunden</p>
                    <p className="text-sm">
                      {memberId 
                        ? 'Für dieses Mitglied wurden noch keine Beitragskalender angelegt.'
                        : 'Es wurden noch keine Beitragskalender erstellt.'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <EntryRow key={entry.id} entry={entry} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {entries.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => updateFilters({ page: Math.max(1, (filters.page || 1) - 1) })}
                  disabled={(filters.page || 1) <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Zurück
                </button>
                <button
                  onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Weiter
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Zeige <span className="font-medium">1</span> bis{' '}
                    <span className="font-medium">{Math.min(filters.page_size || 50, entries.length)}</span> von{' '}
                    <span className="font-medium">{statistics?.total_entries || entries.length}</span> Einträgen
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => updateFilters({ page: Math.max(1, (filters.page || 1) - 1) })}
                      disabled={(filters.page || 1) <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Zurück
                    </button>
                    <button
                      onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Weiter
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Beitrag Management Modal */}
      <BeitragManagementModal
        isOpen={showManagementModal}
        onClose={() => {
          setShowManagementModal(false);
          setSelectedEntry(null);
        }}
        entry={selectedEntry}
        onSave={handleSaveEntry}
      />
    </div>
  );
};

export default BeitragskalenderView; 