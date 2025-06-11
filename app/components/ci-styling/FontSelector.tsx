'use client'

import { useState } from 'react'

interface FontSelectorProps {
  label: string
  value: string
  onChange: (font: string) => void
  type: 'headline' | 'body'
  className?: string
}

const FONT_OPTIONS = [
  { name: 'Inter', family: 'Inter, sans-serif', category: 'Sans-serif' },
  { name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans-serif' },
  { name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'Sans-serif' },
  { name: 'Lato', family: 'Lato, sans-serif', category: 'Sans-serif' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Sans-serif' },
  { name: 'Poppins', family: 'Poppins, sans-serif', category: 'Sans-serif' },
  { name: 'Playfair Display', family: 'Playfair Display, serif', category: 'Serif' },
  { name: 'Merriweather', family: 'Merriweather, serif', category: 'Serif' },
  { name: 'Source Serif Pro', family: 'Source Serif Pro, serif', category: 'Serif' },
]

export default function FontSelector({
  label,
  value,
  onChange,
  type,
  className = ''
}: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedFont = FONT_OPTIONS.find(font => font.name === value) || FONT_OPTIONS[0]
  
  const getPreviewText = () => {
    return type === 'headline' 
      ? 'Das ist eine Überschrift' 
      : 'Das ist ein Beispieltext für Fließtext. Lorem ipsum dolor sit amet.'
  }
  
  const getPreviewStyle = () => {
    return type === 'headline'
      ? { fontSize: '24px', fontWeight: '600' }
      : { fontSize: '16px', fontWeight: '400' }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Font Dropdown */}
      <div className="relative">
        <button
          type="button"
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{selectedFont.name}</span>
              <span className="ml-2 text-sm text-gray-500">({selectedFont.category})</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.name}
                type="button"
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${
                  font.name === value ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => {
                  onChange(font.name)
                  setIsOpen(false)
                }}
              >
                <div style={{ fontFamily: font.family }}>
                  <span className="font-medium">{font.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({font.category})</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Vorschau */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          Vorschau {type === 'headline' ? 'Überschrift' : 'Fließtext'}
        </h4>
        <div 
          style={{ 
            fontFamily: selectedFont.family,
            ...getPreviewStyle()
          }}
          className="text-gray-900"
        >
          {getPreviewText()}
        </div>
      </div>
      
      {/* Typografie-Hierarchie Vorschau */}
      {type === 'headline' && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Typografie-Hierarchie
          </h4>
          <div className="space-y-2">
            <div style={{ fontFamily: selectedFont.family, fontSize: '32px', fontWeight: '700' }}>
              H1 - Hauptüberschrift
            </div>
            <div style={{ fontFamily: selectedFont.family, fontSize: '24px', fontWeight: '600' }}>
              H2 - Unterüberschrift
            </div>
            <div style={{ fontFamily: selectedFont.family, fontSize: '20px', fontWeight: '500' }}>
              H3 - Abschnittsüberschrift
            </div>
            <div style={{ fontFamily: selectedFont.family, fontSize: '16px', fontWeight: '400' }}>
              Body - Normaler Text
            </div>
            <div style={{ fontFamily: selectedFont.family, fontSize: '14px', fontWeight: '400' }}>
              Small - Kleinerer Text
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 