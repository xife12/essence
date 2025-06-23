'use client';

import React, { ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray' | 'gold';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-700',
  destructive: 'bg-red-100 text-red-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-amber-100 text-amber-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-800',
  gold: 'bg-amber-200 text-amber-900',
};

export default function Badge({ 
  children, 
  variant = 'gray',
  className = ''
}: BadgeProps) {
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Named export for compatibility
export { Badge }; 