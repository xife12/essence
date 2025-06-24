'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Settings, Eye, Edit, Trash2, Plus } from 'lucide-react';
import ZahllaufgruppenModal from './ZahllaufgruppenModal';

// NEU: Zahllaufgruppen Interface (24.06.2025)
export interface ZahllaufgruppeEntry {
  id: string;
  name: string;
  status: 'aktiv' | 'inaktiv';
  faelligkeit: string; // ISO Date
  forderungstypen: ('startpaket' | 'beiträge' | 'pauschale' | 'gebühren' | 'modul')[];
  letzter_lauf: string | null; // ISO Date
  naechster_lauf: string | null; // ISO Date
  mitglieder_anzahl: number;
  gesamtbetrag: number;
  beschreibung?: string;
}

export interface ZahllaufgruppenDashboardProps {
  className?: string;
}

// Helper Functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const getForderungstypLabel = (typ: string): string => {
  const labels: { [key: string]: string } = {
    'startpaket': 'Startpaket',
    'beiträge': 'Beiträge',
    'pauschale': 'Pauschale',
    'gebühren': 'Gebühren',
    'modul': 'Modul'
  };
  return labels[typ] || typ;
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'aktiv': return 'bg-green-100 text-green-800 border-green-200';
    case 'inaktiv': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ZahllaufgruppenDashboard({ className = '' }: ZahllaufgruppenDashboardProps) {
  const [zahllaufgruppen, setZahllaufgruppen] = useState<ZahllaufgruppeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ZahllaufgruppeEntry | null>(null);

  useEffect(() => {
    loadZahllaufgruppen();
  }, []);

  const loadZahllaufgruppen = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: API-Call implementieren
      // const response = await ZahllaufgruppenAPI.getAllZahllaufgruppen();
      
      // MOCK-DATA für Development (wird durch echte API ersetzt)
      const mockData: ZahllaufgruppeEntry[] = [
        {
          id: '1',
          name: 'Monatsbeiträge Standard',
          status: 'aktiv',
          faelligkeit: '2025-07-01T00:00:00Z',
          forderungstypen: ['beiträge'],
          letzter_lauf: '2025-06-01T00:00:00Z',
          naechster_lauf: '2025-07-01T00:00:00Z',
          mitglieder_anzahl: 245,
          gesamtbetrag: 21925.50,
          beschreibung: 'Standard Monatsbeiträge am 1. des Monats'
        },
        {
          id: '2',
          name: 'Startpakete & Gebühren',
          status: 'aktiv',
          faelligkeit: '2025-07-15T00:00:00Z',
          forderungstypen: ['startpaket', 'gebühren'],
          letzter_lauf: '2025-06-15T00:00:00Z',
          naechster_lauf: '2025-07-15T00:00:00Z',
          mitglieder_anzahl: 12,
          gesamtbetrag: 2890.00,
          beschreibung: 'Einmalige Gebühren und Startpakete'
        },
        {
          id: '4',
          name: 'Exklusive Module',
          status: 'aktiv',
          faelligkeit: '2025-07-01T00:00:00Z',
          forderungstypen: ['modul'],
          letzter_lauf: '2025-06-01T00:00:00Z',
          naechster_lauf: '2025-07-01T00:00:00Z',
          mitglieder_anzahl: 18,
          gesamtbetrag: 540.00,
          beschreibung: 'Exklusive Module und Zusatzleistungen'
        },
        {
          id: '3',
          name: 'Pauschalen Quartal',
          status: 'inaktiv',
          faelligkeit: '2025-10-01T00:00:00Z',
          forderungstypen: ['pauschale'],
          letzter_lauf: '2025-04-01T00:00:00Z',
          naechster_lauf: null,
          mitglieder_anzahl: 8,
          gesamtbetrag: 0,
          beschreibung: 'Quartalsweise Pauschalen (aktuell inaktiv)'
        }
      ];
      
      setZahllaufgruppen(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowModal(true);
  };

  const handleEditGroup = (group: ZahllaufgruppeEntry) => {
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Zahllaufgruppe löschen möchten?')) {
      return;
    }
    
    try {
      // TODO: API-Call implementieren
      // await ZahllaufgruppenAPI.deleteZahllaufgruppe(groupId);
      
      // Mock: Entferne aus State
      setZahllaufgruppen(prev => prev.filter(g => g.id !== groupId));
    } catch (err) {
      alert('Fehler beim Löschen der Zahllaufgruppe');
    }
  };

  const handleSaveGroup = async (groupData: Partial<ZahllaufgruppeEntry>) => {
    try {
      if (editingGroup) {
        // TODO: API-Call für Update
        // await ZahllaufgruppenAPI.updateZahllaufgruppe(editingGroup.id, groupData);
        
        // Mock: Update in State
        setZahllaufgruppen(prev => prev.map(g => 
          g.id === editingGroup.id ? { ...g, ...groupData } : g
        ));
      } else {
        // TODO: API-Call für Create
        // const newGroup = await ZahllaufgruppenAPI.createZahllaufgruppe(groupData);
        
        // Mock: Add to State
        const newGroup: ZahllaufgruppeEntry = {
          id: Date.now().toString(),
          mitglieder_anzahl: 0,
          gesamtbetrag: 0,
          letzter_lauf: null,
          naechster_lauf: null,
          ...groupData
        } as ZahllaufgruppeEntry;
        
        setZahllaufgruppen(prev => [...prev, newGroup]);
      }
      
      setShowModal(false);
      setEditingGroup(null);
    } catch (err) {
      alert('Fehler beim Speichern der Zahllaufgruppe');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <span className="text-lg">⚠️</span>
          <h3 className="font-semibold">Fehler beim Laden</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={loadZahllaufgruppen}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistik-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Zahllaufgruppen</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {zahllaufgruppen.length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-600">Aktive Gruppen</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {zahllaufgruppen.filter(g => g.status === 'aktiv').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-600">Mitglieder gesamt</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {zahllaufgruppen.reduce((sum, g) => sum + g.mitglieder_anzahl, 0)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-600">Gesamtvolumen</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {formatCurrency(zahllaufgruppen.reduce((sum, g) => sum + g.gesamtbetrag, 0))}
          </div>
        </div>
      </div>

      {/* Zahllaufgruppen-Liste */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Zahllaufgruppen</h2>
              <p className="text-sm text-gray-600">Verwaltung aller SEPA-Zahllaufgruppen</p>
            </div>
            <button 
              onClick={handleCreateGroup}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              <Plus className="h-4 w-4" />
              Neue Gruppe
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forderungstypen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fälligkeit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mitglieder
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gesamtbetrag
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {zahllaufgruppen.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">{group.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(group.status)}`}>
                            {group.status === 'aktiv' ? '🟢' : '🔴'} {group.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {group.forderungstypen.map((typ) => (
                        <span 
                          key={typ}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getForderungstypLabel(typ)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(group.faelligkeit)}
                    </div>
                    {group.naechster_lauf && (
                      <div className="text-xs text-gray-500 mt-1">
                        Nächster Lauf: {formatDate(group.naechster_lauf)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      {group.mitglieder_anzahl}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(group.gesamtbetrag)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Details anzeigen"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditGroup(group)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {zahllaufgruppen.length === 0 && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Zahllaufgruppen</h3>
            <p className="mt-1 text-sm text-gray-500">
              Erstellen Sie Ihre erste Zahllaufgruppe für SEPA-Zahlläufe.
            </p>
            <div className="mt-6">
              <button 
                onClick={handleCreateGroup}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Erste Zahllaufgruppe erstellen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal für CRUD-Operationen */}
      {showModal && (
        <ZahllaufgruppenModal
          group={editingGroup}
          onSave={handleSaveGroup}
          onCancel={() => {
            setShowModal(false);
            setEditingGroup(null);
          }}
        />
      )}
    </div>
  );
}

export default ZahllaufgruppenDashboard; 