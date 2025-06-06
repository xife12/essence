'use client';

import React from 'react';
import { Target } from 'lucide-react';

interface HeroBlockProps {
  content: {
    headline: string;
    subheadline: string;
    buttonText: string;
    buttonLink?: string;
    backgroundImage?: string;
    textAlign: 'left' | 'center' | 'right';
    backgroundColor?: string;
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function HeroBlock({ content, isSelected, template }: HeroBlockProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const backgroundStyle = {
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    backgroundColor: content.backgroundColor || template?.colors?.primary || '#f8fafc',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  // Dynamische Textfarben basierend auf Hintergrund
  const textColor = content.backgroundImage ? 'text-white' : 'text-gray-900';
  const subtextColor = content.backgroundImage ? 'text-gray-200' : 'text-gray-600';
  const buttonColor = template?.colors?.accent || '#3B82F6';

  return (
    <div className="relative">
      {/* Block Indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <Target size={12} />
          Hero
        </div>
      )}

      <div 
        className="min-h-[400px] flex items-center justify-center p-8 relative"
        style={backgroundStyle}
      >
        {/* Overlay für bessere Lesbarkeit bei Hintergrundbild */}
        {content.backgroundImage && (
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        )}
        
        <div className={`relative z-10 max-w-4xl mx-auto ${alignmentClasses[content.textAlign]}`}>
          {content.headline ? (
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${textColor}`}>
              {content.headline}
            </h1>
          ) : (
            <div className="text-center py-8">
              <Target size={48} className={`mx-auto mb-4 ${textColor.replace('text-', 'text-opacity-40 text-')}`} />
              <p className={`text-lg ${textColor.replace('text-', 'text-opacity-60 text-')}`}>
                Hero Section - Konfigurieren Sie den Inhalt in den Einstellungen
              </p>
            </div>
          )}
          
          {content.subheadline && (
            <p className={`text-xl md:text-2xl mb-8 ${subtextColor}`}>
              {content.subheadline}
            </p>
          )}
          
          {content.buttonText && (
            <button 
              className="inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-colors"
              style={{ 
                backgroundColor: buttonColor,
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${buttonColor}dd`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = buttonColor;
              }}
            >
              {content.buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 