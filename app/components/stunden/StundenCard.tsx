'use client';

import React, { ReactNode } from 'react';

type StundenCardProps = {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  progress?: number;
};

const colorStyles = {
  blue: 'bg-blue-50 text-blue-500',
  green: 'bg-green-50 text-green-500',
  red: 'bg-red-50 text-red-500',
  yellow: 'bg-amber-50 text-amber-500',
  purple: 'bg-purple-50 text-purple-500',
  orange: 'bg-orange-50 text-orange-500',
};

const progressColorStyles = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export default function StundenCard({
  title,
  value,
  icon,
  description,
  color = 'blue',
  progress,
}: StundenCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
      
      {typeof progress === 'number' && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 rounded-full ${progressColorStyles[color]}`} 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">{progress}% erreicht</p>
        </div>
      )}
    </div>
  );
} 