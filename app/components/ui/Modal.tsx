'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  footer
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Tastatur-Event-Handler (Escape schließt das Modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Blockiere Scrolling im Hintergrund, wenn das Modal geöffnet ist
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Größen für verschiedene maxWidth-Optionen
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-25 backdrop-blur-sm">
      <div 
        className={`relative bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full mx-4 animate-fadeIn`}
        ref={modalRef}
      >
        {title && (
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Schließen"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Schließen"
          >
            <X size={20} />
          </button>
        )}
        
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="border-t p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
} 