'use client';

import React from 'react';
import { MousePointer } from 'lucide-react';

interface ButtonBlockProps {
  content: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
    size: 'small' | 'medium' | 'large';
    alignment: 'left' | 'center' | 'right';
    fullWidth?: boolean;
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function ButtonBlock({ content, isSelected, template }: ButtonBlockProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const buttonStyleClasses = {
    primary: `${template?.colors?.primary ? `bg-[${template.colors.primary}] hover:bg-[${template.colors.primary}dd]` : 'bg-blue-600 hover:bg-blue-700'} text-white`,
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: `border-2 ${template?.colors?.primary ? `border-[${template.colors.primary}] text-[${template.colors.primary}] hover:bg-[${template.colors.primary}]` : 'border-blue-600 text-blue-600 hover:bg-blue-600'} hover:text-white`
  };

  const buttonSizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <div className="p-4 relative">
      {/* Block Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <MousePointer size={12} />
          Button
        </div>
      )}

      {/* Content */}
      {content.text ? (
        <div className={alignmentClasses[content.alignment]}>
          <button
            className={`
              ${buttonStyleClasses[content.style]}
              ${buttonSizeClasses[content.size]}
              ${content.fullWidth ? 'w-full' : 'inline-block'}
              font-semibold rounded-lg transition-colors
            `}
          >
            {content.text}
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <MousePointer size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-2">Button - Konfigurieren Sie den Button in den Einstellungen</p>
        </div>
      )}
    </div>
  );
} 