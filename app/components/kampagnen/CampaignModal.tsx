'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Campaign {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  campaign_type: string;
  target_group: string;
  bonus_period?: string;
  channels: string[];
  contract_type_ids: string[];
}

interface ContractType {
  id: string;
  name: string;
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onSave: (campaign: Campaign) => Promise<void>;
}

const INITIAL_CAMPAIGN: Campaign = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'active',
  campaign_type: '',
  target_group: '',
  channels: [],
  contract_type_ids: []
};

const CHANNEL_OPTIONS = [
  'Facebook', 
  'Instagram', 
  'Google Ads', 
  'E-Mail', 
  'Flyer', 
  'Plakate',
  'Website',
  'Empfehlungen',
  'Messen/Events'
];

const CAMPAIGN_TYPE_OPTIONS = [
  'Online',
  'Offline',
  'Mix',
  'Bestandskunden',
  'Neukunden'
];

export default function CampaignModal({ 
  isOpen, 
  onClose, 
  campaign, 
  onSave 
}: CampaignModalProps) {
  const [formData, setFormData] = useState<Campaign>(INITIAL_CAMPAIGN);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [customChannel, setCustomChannel] = useState<string>('');

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isOpen) {
      // Vertragsarten laden
      fetchContractTypes();
      
      // Formulardaten zurücksetzen oder mit Kampagnendaten füllen
      if (campaign) {
        setFormData({
          ...campaign,
          // Sicherstellen, dass Arrays vorhanden sind, auch wenn sie null/undefined sind
          channels: campaign.channels || [],
          contract_type_ids: campaign.contract_type_ids || []
        });
      } else {
        // Für neue Kampagne Startdatum auf heute und Enddatum auf 30 Tage später setzen
        const today = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        
        setFormData({
          ...INITIAL_CAMPAIGN,
          start_date: today.toISOString().split('T')[0],
          end_date: thirtyDaysLater.toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, campaign]);

  const fetchContractTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_types')
        .select('id, name')
        .eq('status', 'active');

      if (error) throw error;
      setContractTypes(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Vertragsarten:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Fehler löschen, wenn Feld ausgefüllt wird
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChannelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedChannel(value);
  };

  const addChannel = () => {
    // Custom-Channel hinzufügen, wenn ausgewählt
    const channelToAdd = selectedChannel === 'custom' ? customChannel.trim() : selectedChannel;
    
    if (channelToAdd && !formData.channels.includes(channelToAdd)) {
      setFormData(prev => ({
        ...prev,
        channels: [...prev.channels, channelToAdd]
      }));
      setSelectedChannel('');
      setCustomChannel('');
    }
  };

  const removeChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.filter(c => c !== channel)
    }));
  };

  const handleContractTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      contract_type_ids: checked 
        ? [...prev.contract_type_ids, value]
        : prev.contract_type_ids.filter(id => id !== value)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Startdatum ist erforderlich';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Enddatum ist erforderlich';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'Enddatum muss nach dem Startdatum liegen';
    }
    
    if (formData.channels.length === 0) {
      newErrors.channels = 'Mindestens ein Kanal ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern der Kampagne:', error);
      alert('Fehler beim Speichern der Kampagne. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose}></div>
        
        <div className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {campaign ? 'Kampagne bearbeiten' : 'Neue Kampagne erstellen'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name und Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                    placeholder="Name der Kampagne"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="active">Aktiv</option>
                    <option value="inactive">Inaktiv</option>
                    <option value="planned">Geplant</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
              </div>
              
              {/* Zeitraum */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${errors.start_date ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                  {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${errors.end_date ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                  />
                  {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
                </div>
              </div>
              
              {/* Kampagnentyp und Zielgruppe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kampagnentyp
                  </label>
                  <select
                    name="campaign_type"
                    value={formData.campaign_type}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Kampagnentyp auswählen</option>
                    {CAMPAIGN_TYPE_OPTIONS.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zielgruppe
                  </label>
                  <input
                    type="text"
                    name="target_group"
                    value={formData.target_group}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="z.B. 'Frauen 25-40 Jahre'"
                  />
                </div>
              </div>
              
              {/* Beschreibung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Beschreibung der Kampagne"
                ></textarea>
              </div>
              
              {/* Kanäle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kanäle <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedChannel}
                    onChange={handleChannelSelect}
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">Kanal auswählen</option>
                    {CHANNEL_OPTIONS.map(channel => (
                      <option key={channel} value={channel}>{channel}</option>
                    ))}
                    <option value="custom">Eigener Kanal...</option>
                  </select>
                  
                  {selectedChannel === 'custom' && (
                    <input
                      type="text"
                      value={customChannel}
                      onChange={(e) => setCustomChannel(e.target.value)}
                      className="flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="Kanalnamen eingeben"
                    />
                  )}
                  
                  <button
                    type="button"
                    onClick={addChannel}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm"
                  >
                    Hinzufügen
                  </button>
                </div>
                
                {formData.channels.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.channels.map(channel => (
                      <div key={channel} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {channel}
                        <button
                          type="button"
                          onClick={() => removeChannel(channel)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Keine Kanäle ausgewählt</p>
                )}
                
                {errors.channels && <p className="mt-1 text-xs text-red-500">{errors.channels}</p>}
              </div>
              
              {/* Verknüpfte Vertragsarten */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verknüpfte Vertragsarten
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {contractTypes.length > 0 ? (
                    <div className="space-y-2">
                      {contractTypes.map(contractType => (
                        <div key={contractType.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`contract-${contractType.id}`}
                            value={contractType.id}
                            checked={formData.contract_type_ids.includes(contractType.id)}
                            onChange={handleContractTypeChange}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <label htmlFor={`contract-${contractType.id}`} className="ml-2 text-sm text-gray-700">
                            {contractType.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Keine aktiven Vertragsarten verfügbar</p>
                  )}
                </div>
              </div>
              
              {/* Bonuszeitraum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonuszeitraum (in Tagen)
                </label>
                <input
                  type="number"
                  name="bonus_period"
                  value={formData.bonus_period || ''}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="z.B. 14 für zwei Wochen Bonus"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Zusätzlicher Zeitraum nach Vertragsabschluss für Sonderkonditionen
                </p>
              </div>
            </div>
            
            {/* Aktionsschaltflächen */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Wird gespeichert...' : (campaign ? 'Aktualisieren' : 'Erstellen')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 