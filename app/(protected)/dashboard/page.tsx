'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, TrendingUp, 
  UserPlus, CalendarClock 
} from 'lucide-react';
import supabase from '../../lib/supabaseClient';

// Komponente für KPI-Karten
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: number; 
  description?: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <div className={`flex items-center mt-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp size={16} className={trend < 0 && 'transform rotate-180'} />
            <span className="ml-1">{Math.abs(trend)}% {trend > 0 ? 'mehr' : 'weniger'}</span>
          </div>
        )}
      </div>
      <div className="bg-blue-50 p-2 rounded-lg">
        <Icon size={24} className="text-blue-500" />
      </div>
    </div>
    {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
  </div>
);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Benutzerinformationen laden
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    
    loadUser();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Willkommen {user?.email}</p>
      </div>

      {/* KPI-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Aktive Mitglieder" 
          value="248" 
          icon={Users} 
          trend={3.2} 
          description="Gesamtanzahl aktiver Mitgliedschaften"
        />
        <StatCard 
          title="Neue Leads" 
          value="27" 
          icon={UserPlus} 
          trend={-5.1}
          description="Neue Interessenten in diesem Monat"
        />
        <StatCard 
          title="Beratungsgespräche" 
          value="18" 
          icon={CalendarClock}
          description="Geplante Termine diese Woche"
        />
        <StatCard 
          title="Umsatz" 
          value="€ 12.480" 
          icon={BarChart3} 
          trend={1.8}
          description="Laufender Monat"
        />
      </div>
      
      {/* Inhaltsbereiche */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Letzte Aktivitäten */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Letzte Aktivitäten</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="bg-blue-50 p-2 rounded-lg mr-4">
                  <UserPlus size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Neuer Lead erstellt</p>
                  <p className="text-sm text-gray-500">Maria Müller hat sich für ein Probetraining angemeldet</p>
                  <p className="text-xs text-gray-400 mt-1">Vor 2 Stunden</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Anstehende Termine */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Anstehende Termine</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 text-center mr-4">
                  <p className="text-sm font-bold bg-blue-50 rounded-t-md py-1">Jun</p>
                  <p className="text-lg font-semibold bg-white border border-blue-100 rounded-b-md py-1">{i + 15}</p>
                </div>
                <div>
                  <p className="font-medium">Beratungsgespräch</p>
                  <p className="text-sm text-gray-500">Thomas Schmidt • 14:30 Uhr</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 