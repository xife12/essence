'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageBlockProps {
  content: {
    src: string;
    alt: string;
    caption?: string;
    alignment: 'left' | 'center' | 'right';
    width?: string;
    height?: string;
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function ImageBlock({ content, isSelected }: ImageBlockProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const imageAlignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  };

  return (
    <div className="p-4 relative">
      {/* Block Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <ImageIcon size={12} />
          Bild
        </div>
      )}

      {/* Content */}
      {content.src ? (
        <div className={`${alignmentClasses[content.alignment]}`}>
          <img
            src={content.src}
            alt={content.alt}
            className={`max-w-full h-auto rounded-lg ${imageAlignmentClasses[content.alignment]}`}
            style={{
              width: content.width || 'auto',
              height: content.height || 'auto'
            }}
          />
          {content.caption && (
            <p className="text-sm text-gray-600 mt-2 italic">
              {content.caption}
            </p>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <ImageIcon size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-2">Bildblock - Konfigurieren Sie das Bild in den Einstellungen</p>
        </div>
      )}
    </div>
  );
} 