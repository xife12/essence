'use client'

import { useState } from 'react'

interface ButtonStyleCardProps {
  label: string
  buttonType: 'primary' | 'secondary' | 'ghost'
  style: {
    radius: string
    padding: string
    fontSize: string
    fontWeight: string
  }
  colors: {
    background: string
    text: string
    border?: string
  }
  onChange: (style: any, colors: any) => void
  className?: string
}

export default function ButtonStyleCard({
  label,
  buttonType,
  style,
  colors,
  onChange,
  className = ''
}: ButtonStyleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateStyle = (key: string, value: string) => {
    const newStyle = { ...style, [key]: value }
    onChange(newStyle, colors)
  }

  const updateColors = (key: string, value: string) => {
    const newColors = { ...colors, [key]: value }
    onChange(style, newColors)
  }

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: style.radius,
      padding: style.padding,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      backgroundColor: colors.background,
      color: colors.text,
      border: colors.border ? `1px solid ${colors.border}` : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }

    // Spezifische Anpassungen je Button-Typ
    switch (buttonType) {
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: `1px solid ${colors.background}`,
          color: colors.background
        }
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: `1px solid ${colors.background}`,
          color: colors.background
        }
      default:
        return baseStyle
    }
  }

  const RADIUS_OPTIONS = [
    { label: 'Keine', value: '0px' },
    { label: 'Klein', value: '4px' },
    { label: 'Standard', value: '6px' },
    { label: 'Mittel', value: '8px' },
    { label: 'Groß', value: '12px' },
    { label: 'Rund', value: '9999px' }
  ]

  const PADDING_OPTIONS = [
    { label: 'Kompakt', value: '8px 16px' },
    { label: 'Standard', value: '12px 24px' },
    { label: 'Komfortabel', value: '16px 32px' },
    { label: 'Groß', value: '20px 40px' }
  ]

  const FONT_SIZE_OPTIONS = [
    { label: 'Klein', value: '14px' },
    { label: 'Standard', value: '16px' },
    { label: 'Groß', value: '18px' }
  ]

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">
          {label}
          <span className="ml-2 text-xs text-gray-500 uppercase">
            ({buttonType})
          </span>
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? 'Weniger' : 'Bearbeiten'}
        </button>
      </div>

      {/* Live-Vorschau */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Vorschau
        </h4>
        <div className="flex items-center space-x-3">
          <button style={getButtonStyle()}>
            {buttonType === 'primary' ? 'Jetzt anmelden' : 
             buttonType === 'secondary' ? 'Mehr erfahren' : 'Kontakt'}
          </button>
          <button 
            style={{
              ...getButtonStyle(),
              opacity: 0.8,
              transform: 'scale(0.98)'
            }}
          >
            Hover-State
          </button>
        </div>
      </div>

      {/* Detailkonfiguration */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rundung
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateStyle('radius', option.value)}
                  className={`px-3 py-2 text-xs border rounded text-center transition-colors ${
                    style.radius === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Innenabstand
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PADDING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateStyle('padding', option.value)}
                  className={`px-3 py-2 text-xs border rounded text-center transition-colors ${
                    style.padding === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schriftgröße */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schriftgröße
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateStyle('fontSize', option.value)}
                  className={`px-3 py-2 text-xs border rounded text-center transition-colors ${
                    style.fontSize === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Farben */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Farben</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) => updateColors('background', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Hintergrund</label>
                  <input
                    type="text"
                    value={colors.background}
                    onChange={(e) => updateColors('background', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={colors.text}
                  onChange={(e) => updateColors('text', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Text</label>
                  <input
                    type="text"
                    value={colors.text}
                    onChange={(e) => updateColors('text', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 