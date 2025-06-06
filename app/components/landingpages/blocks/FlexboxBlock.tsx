'use client';

import React, { useState } from 'react';
import { Layout, Plus, Settings } from 'lucide-react';

interface FlexboxBlockProps {
  content: {
    direction: 'row' | 'column';
    justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    align: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    wrap: boolean;
    gap: string;
    children: any[];
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function FlexboxBlock({ content, onUpdate, isSelected }: FlexboxBlockProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleChange = (key: string, value: any) => {
    onUpdate({
      ...content,
      [key]: value
    });
  };

  const addChildBlock = () => {
    const newChild = {
      id: `child-${Date.now()}`,
      type: 'text',
      content: 'Neuer Inhalt',
      flex: '1'
    };

    onUpdate({
      ...content,
      children: [...(content.children || []), newChild]
    });
  };

  const removeChild = (index: number) => {
    const updatedChildren = content.children.filter((_, i) => i !== index);
    onUpdate({
      ...content,
      children: updatedChildren
    });
  };

  const updateChild = (index: number, newChildContent: any) => {
    const updatedChildren = [...content.children];
    updatedChildren[index] = { ...updatedChildren[index], ...newChildContent };
    onUpdate({
      ...content,
      children: updatedChildren
    });
  };

  const flexStyles = {
    display: 'flex',
    flexDirection: content.direction || 'row',
    justifyContent: content.justify || 'center',
    alignItems: content.align || 'center',
    flexWrap: content.wrap ? 'wrap' : 'nowrap',
    gap: content.gap || '16px',
    backgroundColor: content.backgroundColor || 'transparent',
    padding: content.padding || '16px',
    borderRadius: content.borderRadius || '0px',
    minHeight: '100px'
  } as React.CSSProperties;

  return (
    <div className="p-4">
      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Richtung
              </label>
              <select
                value={content.direction || 'row'}
                onChange={(e) => handleChange('direction', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="row">Horizontal</option>
                <option value="column">Vertikal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ausrichtung
              </label>
              <select
                value={content.justify || 'center'}
                onChange={(e) => handleChange('justify', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="flex-start">Start</option>
                <option value="center">Mitte</option>
                <option value="flex-end">Ende</option>
                <option value="space-between">Verteilt</option>
                <option value="space-around">Umschlossen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vertikale Ausrichtung
              </label>
              <select
                value={content.align || 'center'}
                onChange={(e) => handleChange('align', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="flex-start">Oben</option>
                <option value="center">Mitte</option>
                <option value="flex-end">Unten</option>
                <option value="stretch">Strecken</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Abstand
              </label>
              <select
                value={content.gap || '16px'}
                onChange={(e) => handleChange('gap', e.target.value)}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="0px">Kein Abstand</option>
                <option value="8px">Klein (8px)</option>
                <option value="16px">Mittel (16px)</option>
                <option value="24px">Groß (24px)</option>
                <option value="32px">Sehr Groß (32px)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Hintergrundfarbe
            </label>
            <input
              type="color"
              value={content.backgroundColor || '#ffffff'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="wrap"
              checked={content.wrap || false}
              onChange={(e) => handleChange('wrap', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="wrap" className="ml-2 text-xs text-gray-700">
              Umbruch erlauben
            </label>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Layout size={16} />
          <span>Flexbox Container</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
          >
            <Settings size={12} />
          </button>
          <button
            onClick={addChildBlock}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Flexbox Container */}
      <div
        style={flexStyles}
        className={`border-2 border-dashed ${
          isSelected ? 'border-blue-300' : 'border-gray-300'
        } rounded-lg transition-colors`}
      >
        {(!content.children || content.children.length === 0) ? (
          <div className="text-center py-8 text-gray-400">
            <Layout size={32} className="mx-auto mb-2" />
            <p className="text-sm">Flexbox Container ist leer</p>
            <button
              onClick={addChildBlock}
              className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Element hinzufügen
            </button>
          </div>
        ) : (
          content.children.map((child: any, index: number) => (
            <div
              key={child.id || index}
              className="relative group border border-gray-200 rounded p-3 min-w-0"
              style={{ flex: child.flex || '1' }}
            >
              <button
                onClick={() => removeChild(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
              
              <div className="text-sm text-gray-600 mb-2">Element {index + 1}</div>
              
              <textarea
                value={child.content || ''}
                onChange={(e) => updateChild(index, { content: e.target.value })}
                placeholder="Inhalt eingeben..."
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 resize-none"
                rows={2}
              />
              
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select
                  value={child.flex || '1'}
                  onChange={(e) => updateChild(index, { flex: e.target.value })}
                  className="text-xs border border-gray-300 rounded px-1 py-1"
                >
                  <option value="0">Feste Größe</option>
                  <option value="1">Flexibel</option>
                  <option value="2">Doppelt</option>
                  <option value="auto">Automatisch</option>
                </select>
                
                <select
                  value={child.type || 'text'}
                  onChange={(e) => updateChild(index, { type: e.target.value })}
                  className="text-xs border border-gray-300 rounded px-1 py-1"
                >
                  <option value="text">Text</option>
                  <option value="image">Bild</option>
                  <option value="button">Button</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 