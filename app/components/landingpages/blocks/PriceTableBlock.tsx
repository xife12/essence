'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Check, Star, Settings } from 'lucide-react';
import supabase from '../../../lib/supabaseClient';

interface ContractType {
  id: string;
  name: string;
  description?: string;
  term: number;
  price_per_month: number;
  bonus_period?: number;
  auto_renew: boolean;
  has_group_discount: boolean;
  group_discount_rate?: number;
  active: boolean;
}

interface PriceTableBlockProps {
  content: {
    contract_type_id: string;
    columns: number;
    highlighted_column: number;
    show_features: boolean;
    button_text: string;
    color_scheme: 'blue' | 'green' | 'purple' | 'orange';
    layout: 'cards' | 'table';
    show_popular_badge: boolean;
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function PriceTableBlock({ content, onUpdate, isSelected, template }: PriceTableBlockProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [selectedContracts, setSelectedContracts] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showSettings) {
      loadContractTypes();
    }
  }, [showSettings]);

  useEffect(() => {
    if (content.contract_type_id) {
      loadSelectedContracts();
    }
  }, [content.contract_type_id]);

  const loadContractTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contract_types')
        .select('*')
        .eq('active', true)
        .order('price_per_month', { ascending: true });

      if (error) throw error;
      setContractTypes(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Vertragsarten:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedContracts = async () => {
    try {
      if (content.contract_type_id === 'all') {
        // Alle aktiven Vertragsarten laden
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .eq('active', true)
          .order('price_per_month', { ascending: true })
          .limit(content.columns || 3);

        if (error) throw error;
        setSelectedContracts(data || []);
      } else {
        // Spezifische Vertragsart laden
        const { data, error } = await supabase
          .from('contract_types')
          .select('*')
          .eq('id', content.contract_type_id)
          .single();

        if (error) throw error;
        setSelectedContracts(data ? [data] : []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der ausgewählten Verträge:', error);
      setSelectedContracts([]);
    }
  };

  const handleChange = (key: string, value: any) => {
    onUpdate({
      ...content,
      [key]: value
    });
  };

  const getColorClasses = (scheme: string) => {
    const schemes = {
      blue: {
        primary: 'bg-blue-600 text-white',
        secondary: 'bg-blue-50 text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        badge: 'bg-blue-100 text-blue-800'
      },
      green: {
        primary: 'bg-green-600 text-white',
        secondary: 'bg-green-50 text-green-600',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        badge: 'bg-green-100 text-green-800'
      },
      purple: {
        primary: 'bg-purple-600 text-white',
        secondary: 'bg-purple-50 text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700 text-white',
        badge: 'bg-purple-100 text-purple-800'
      },
      orange: {
        primary: 'bg-orange-600 text-white',
        secondary: 'bg-orange-50 text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700 text-white',
        badge: 'bg-orange-100 text-orange-800'
      }
    };
    return schemes[scheme as keyof typeof schemes] || schemes.blue;
  };

  const renderPriceCard = (contract: ContractType, index: number) => {
    const colors = getColorClasses(content.color_scheme || 'blue');
    const isHighlighted = index === (content.highlighted_column || 0);

    return (
      <div
        key={contract.id}
        className={`relative border rounded-lg p-6 ${
          isHighlighted
            ? 'border-2 ' + colors.secondary.replace('bg-', 'border-').replace('-50', '-200') + ' shadow-lg scale-105'
            : 'border-gray-200 shadow-sm'
        } transition-all`}
      >
        {/* Popular Badge */}
        {isHighlighted && content.show_popular_badge && (
          <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
            <Star size={12} className="inline mr-1" />
            Beliebt
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{contract.name}</h3>
          {contract.description && (
            <p className="text-sm text-gray-600">{contract.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900">
              {contract.price_per_month}€
            </span>
            <span className="text-lg text-gray-600 ml-1">/Monat</span>
          </div>
          {contract.bonus_period && (
            <p className="text-sm text-green-600 mt-1">
              +{contract.bonus_period} Monate gratis!
            </p>
          )}
        </div>

        {/* Features */}
        {content.show_features && (
          <div className="mb-6">
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                {contract.term} Monate Laufzeit
              </li>
              {contract.auto_renew && (
                <li className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  Automatische Verlängerung
                </li>
              )}
              {contract.has_group_discount && (
                <li className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  {contract.group_discount_rate}% Gruppenrabatt
                </li>
              )}
              <li className="flex items-center text-sm text-gray-600">
                <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                Alle Geräte inklusive
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                Kursbereich inklusive
              </li>
            </ul>
          </div>
        )}

        {/* Button */}
        <button
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${colors.button}`}
        >
          {content.button_text || 'Jetzt buchen'}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vertragsarten
            </label>
            {loading ? (
              <div className="text-center py-2 text-sm text-gray-600">
                Lade Vertragsarten...
              </div>
            ) : (
              <select
                value={content.contract_type_id || ''}
                onChange={(e) => handleChange('contract_type_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Bitte wählen...</option>
                <option value="all">Alle anzeigen</option>
                {contractTypes.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.name} - {contract.price_per_month}€/Monat
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Anzahl Spalten
              </label>
              <select
                value={content.columns || 3}
                onChange={(e) => handleChange('columns', parseInt(e.target.value))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="1">1 Spalte</option>
                <option value="2">2 Spalten</option>
                <option value="3">3 Spalten</option>
                <option value="4">4 Spalten</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Hervorhebung
              </label>
              <select
                value={content.highlighted_column || 0}
                onChange={(e) => handleChange('highlighted_column', parseInt(e.target.value))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="0">1. Spalte</option>
                <option value="1">2. Spalte</option>
                <option value="2">3. Spalte</option>
                <option value="3">4. Spalte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Farbschema
              </label>
              <select
                value={content.color_scheme || 'blue'}
                onChange={(e) => handleChange('color_scheme', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="blue">Blau</option>
                <option value="green">Grün</option>
                <option value="purple">Lila</option>
                <option value="orange">Orange</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Layout
              </label>
              <select
                value={content.layout || 'cards'}
                onChange={(e) => handleChange('layout', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="cards">Karten</option>
                <option value="table">Tabelle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={content.button_text || 'Jetzt buchen'}
              onChange={(e) => handleChange('button_text', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_features"
                checked={content.show_features !== false}
                onChange={(e) => handleChange('show_features', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show_features" className="ml-2 text-xs text-gray-700">
                Features anzeigen
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_popular_badge"
                checked={content.show_popular_badge !== false}
                onChange={(e) => handleChange('show_popular_badge', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="show_popular_badge" className="ml-2 text-xs text-gray-700">
                "Beliebt" Badge anzeigen
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign size={16} />
          <span>Preistabelle</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
        >
          <Settings size={12} />
        </button>
      </div>

      {/* Price Table */}
      <div className="bg-white">
        {selectedContracts.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <DollarSign size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 mb-2">Keine Vertragsarten ausgewählt</p>
            <p className="text-sm text-gray-500">
              Wählen Sie Vertragsarten aus, um eine Preistabelle zu erstellen
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            selectedContracts.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            selectedContracts.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            selectedContracts.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {selectedContracts.map((contract, index) => renderPriceCard(contract, index))}
          </div>
        )}
      </div>
    </div>
  );
} 