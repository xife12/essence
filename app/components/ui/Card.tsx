'use client';

import React, { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export default function Card({
  children,
  title,
  icon,
  footer,
  className = '',
}: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {(title || icon) && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {icon && <div className="text-blue-500">{icon}</div>}
            {title && <h3 className="font-semibold">{title}</h3>}
          </div>
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {footer && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
} 