'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentGroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Lastschriftgruppen
          </h1>
          <p className="text-gray-600">
            Verwaltung der Payment Groups für SEPA-Lastschriften
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Payment Groups Management
        </h3>
        <p className="text-blue-700">
          Diese Seite wird über das Payment System verwaltet. 
          Nutzen Sie das Dual-Import-System für automatische Payment Group Zuordnung.
        </p>
      </div>
    </div>
  );
} 