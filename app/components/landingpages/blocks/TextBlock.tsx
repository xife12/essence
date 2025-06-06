'use client';

import React from 'react';
import { Type } from 'lucide-react';

interface TextBlockProps {
  content: {
    content: string;
    textAlign: 'left' | 'center' | 'right';
    fontSize: 'small' | 'medium' | 'large';
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function TextBlock({ content, isSelected, template }: TextBlockProps) {
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Verwende Template-Farben falls verfügbar
  const textColor = template?.colors?.primary ? 'text-gray-900' : 'text-gray-900';

  return (
    <div className="p-4 relative">
      {/* Block Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <Type size={12} />
          Text
        </div>
      )}

      {/* Content */}
      {content.content ? (
        <div 
          className={`whitespace-pre-wrap ${fontSizeClasses[content.fontSize]} ${alignmentClasses[content.textAlign]} ${textColor}`}
        >
          {content.content}
        </div>
      ) : (
        <div className="text-gray-400 italic text-center py-8">
          <Type size={32} className="mx-auto mb-2" />
          <p>Textblock - Konfigurieren Sie den Inhalt in den Einstellungen</p>
        </div>
      )}
    </div>
  );
} 