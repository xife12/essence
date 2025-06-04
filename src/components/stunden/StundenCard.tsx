'use client';

import { Clock } from 'lucide-react';

interface StundenCardProps {
  hours: number;
  target: number;
  percentage: number;
  statusColor: string;
}

export default function StundenCard({ hours, target, percentage, statusColor }: StundenCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">Wochenstunden</h3>
        <div className={`p-2 rounded-full ${statusColor}`}>
          <Clock className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mb-2 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">{hours}</span>
          <span className="text-gray-500 ml-1">/ {target}h</span>
        </div>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${
            percentage < 75 
              ? 'bg-red-500' 
              : percentage < 100 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {percentage < 75 && (
          <p className="text-red-500">Unter Sollzeit</p>
        )}
        {percentage >= 75 && percentage < 100 && (
          <p className="text-yellow-500">Fast erreicht</p>
        )}
        {percentage >= 100 && (
          <p className="text-green-500">Ziel erreicht</p>
        )}
      </div>
    </div>
  );
} 