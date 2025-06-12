'use client'

import React from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

interface PreviewToggleProps {
  device: 'desktop' | 'tablet' | 'mobile'
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
}

export default function PreviewToggle({ device, onDeviceChange }: PreviewToggleProps) {
  const devices = [
    { key: 'desktop' as const, icon: Monitor, label: 'Desktop', width: '1200px' },
    { key: 'tablet' as const, icon: Tablet, label: 'Tablet', width: '768px' },
    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile', width: '375px' }
  ]

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      {devices.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onDeviceChange(key)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            device === key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={label}
        >
          <Icon size={16} />
          <span className="hidden sm:inline text-sm">{label}</span>
        </button>
      ))}
    </div>
  )
} 