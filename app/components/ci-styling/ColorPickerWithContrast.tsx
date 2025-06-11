'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface ColorPickerWithContrastProps {
  label: string
  value: string
  onChange: (color: string) => void
  backgroundColor?: string
  required?: boolean
  className?: string
}

export default function ColorPickerWithContrast({
  label,
  value,
  onChange,
  backgroundColor = '#ffffff',
  required = false,
  className = ''
}: ColorPickerWithContrastProps) {
  const [contrastRatio, setContrastRatio] = useState<number>(0)
  const [accessibilityLevel, setAccessibilityLevel] = useState<'AAA' | 'AA' | 'FAIL'>('FAIL')

  // Berechne Kontrast zwischen zwei Farben
  const calculateContrast = (color1: string, color2: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = hexToRgb(hex)
      if (!rgb) return 0
      
      const { r, g, b } = rgb
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  useEffect(() => {
    if (value && backgroundColor) {
      const ratio = calculateContrast(value, backgroundColor)
      setContrastRatio(ratio)
      
      if (ratio >= 7) {
        setAccessibilityLevel('AAA')
      } else if (ratio >= 4.5) {
        setAccessibilityLevel('AA')
      } else {
        setAccessibilityLevel('FAIL')
      }
    }
  }, [value, backgroundColor])

  const getContrastIndicator = () => {
    switch (accessibilityLevel) {
      case 'AAA':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'AA':
        return <CheckCircle className="w-4 h-4 text-yellow-600" />
      case 'FAIL':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        <div className="flex items-center space-x-2">
          {getContrastIndicator()}
          <span className="text-xs text-gray-500">
            {contrastRatio.toFixed(1)}:1 ({accessibilityLevel})
          </span>
        </div>
      </label>
      
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
            style={{ backgroundColor: value }}
          />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3B82F6"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
        />
        
        {/* Farb-Vorschau mit Hintergrund */}
        <div 
          className="w-16 h-10 rounded border border-gray-300 flex items-center justify-center text-xs font-medium"
          style={{ 
            backgroundColor: backgroundColor,
            color: value 
          }}
        >
          Aa
        </div>
      </div>
      
      {accessibilityLevel === 'FAIL' && (
        <p className="text-xs text-red-600">
          ⚠️ Kontrast zu niedrig für Barrierefreiheit (min. 4.5:1 erforderlich)
        </p>
      )}
    </div>
  )
} 