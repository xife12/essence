'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Settings } from 'lucide-react';
import type { ZahllaufgruppeEntry } from './ZahllaufgruppenDashboard';

export interface ZahllaufgruppenModalProps {
  group: ZahllaufgruppeEntry | null;
  onSave: (data: Partial<ZahllaufgruppeEntry>) => Promise<void>;
  onCancel: () => void;
}

// Forderungstypen Interface
interface ForderungstypOption {
  value: 'startpaket' | 'beiträge' | 'pauschale' | 'gebühren' | 'modul';
  label: string;
  description: string;
}

const FORDERUNGSTYP_OPTIONS: ForderungstypOption[] = [
  {
    value: 'startpaket',
    label: 'Startpaket',
    description: 'Einmalige Startpakete und Aufnahmegebühren'
  },
  {
    value: 'beiträge',
    label: 'Beiträge',
    description: 'Monatliche oder wöchentliche Mitgliedsbeiträge'
  },
  {
    value: 'pauschale',
    label: 'Pauschale',
    description: 'Pauschalgebühren und Flatrates'
  },
  {
    value: 'gebühren',
    label: 'Gebühren',
    description: 'Zusatzgebühren, Strafgebühren, Verwaltungskosten'
  },
  {
    value: 'modul',
    label: 'Modul',
    description: 'Exklusive Module und Zusatzleistungen'
  }
];

export function ZahllaufgruppenModal({ group, onSave, onCancel }: ZahllaufgruppenModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'aktiv' as 'aktiv' | 'inaktiv',
    faelligkeit: '',
    forderungstypen: [] as string[],
    beschreibung: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        status: group.status,
        faelligkeit: group.faelligkeit.split('T')[0], // ISO Date zu YYYY-MM-DD
        forderungstypen: [...group.forderungstypen],
        beschreibung: group.beschreibung || ''
      });
    } else {
      setFormData({
        name: '',
        status: 'aktiv',
        faelligkeit: '',
        forderungstypen: [],
        beschreibung: ''
      });
    }
  }, [group]);

  const handleForderungstypToggle = (typ: string) => {
    setFormData(prev => ({
      ...prev,
      forderungstypen: prev.forderungstypen.includes(typ)
        ? prev.forderungstypen.filter(t => t !== typ)
        : [...prev.forderungstypen, typ]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    
    if (!formData.faelligkeit) {
      setError('Fälligkeit ist erforderlich');
      return;
    }
    
    if (formData.forderungstypen.length === 0) {
      setError('Mindestens ein Forderungstyp muss ausgewählt werden');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const saveData: Partial<ZahllaufgruppeEntry> = {
        name: formData.name.trim(),
        status: formData.status,
        faelligkeit: formData.faelligkeit + 'T00:00:00Z', // YYYY-MM-DD zu ISO Date
        forderungstypen: formData.forderungstypen as any,
        beschreibung: formData.beschreibung.trim() || undefined
      };

      await onSave(saveData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              {group ? 'Zahllaufgruppe bearbeiten' : 'Neue Zahllaufgruppe'}
            </h2>
          </div>
          <button 
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name der Zahllaufgruppe *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. Monatsbeiträge Standard"
            />
          </div>

          {/* Status & Fälligkeit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'aktiv' | 'inaktiv' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="aktiv">Aktiv</option>
                <option value="inaktiv">Inaktiv</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fälligkeit *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.faelligkeit}
                  onChange={(e) => setFormData(prev => ({ ...prev, faelligkeit: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Forderungstypen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Forderungstypen * 
              <span className="text-xs text-gray-500 ml-1">(Mindestens einen auswählen)</span>
            </label>
            <div className="space-y-3">
              {FORDERUNGSTYP_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      id={`forderungstyp-${option.value}`}
                      type="checkbox"
                      checked={formData.forderungstypen.includes(option.value)}
                      onChange={() => handleForderungstypToggle(option.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label 
                      htmlFor={`forderungstyp-${option.value}`}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {option.label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung (Optional)
            </label>
            <textarea
              value={formData.beschreibung}
              onChange={(e) => setFormData(prev => ({ ...prev, beschreibung: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Zusätzliche Informationen zur Zahllaufgruppe..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-600">
                <span className="text-sm">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Speichern...' : (group ? 'Aktualisieren' : 'Erstellen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ZahllaufgruppenModal; 