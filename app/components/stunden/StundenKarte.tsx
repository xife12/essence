'use client';

import React, { ReactNode } from 'react';

interface StundenKarteProps {
  icon: ReactNode;
  title: string;
  value: string;
  className?: string;
}

export default function StundenKarte({
  icon,
  title,
  value,
  className = '',
}: StundenKarteProps) {
  return (
    <div className={`bg-white rounded-md shadow-sm p-4 border border-gray-100 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="text-blue-500">{icon}</div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
} 