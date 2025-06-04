'use client';

import { useState } from 'react';
import { Plus, Filter, Calendar, Clock } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StundenCard from '../../components/stunden/StundenCard';
import StundenModal from '../../components/stunden/StundenModal';
import StundenTabelle from '../../components/stunden/StundenTabelle';

// Mock-Daten für Mitarbeiter
const mockStaff = [
  { id: '1', name: 'Max Mustermann', rolle: 'admin' },
  { id: '2', name: 'Anna Schmidt', rolle: 'studioleiter' },
  { id: '3', name: 'Tim Meyer', rolle: 'mitarbeiter' },
];

// Mock-Daten für Stunden
const mockHours = [
  { id: '1', staff_id: '1', date: '2023-06-05', hours: 8, reason: null },
  { id: '2', staff_id: '1', date: '2023-06-06', hours: 7.5, reason: 'BGM-Termin' },
  { id: '3', staff_id: '1', date: '2023-06-07', hours: 8, reason: null },
  { id: '4', staff_id: '1', date: '2023-06-08', hours: 6, reason: 'Urlaub (halbtags)' },
  { id: '5', staff_id: '1', date: '2023-06-09', hours: 8, reason: null },
  { id: '6', staff_id: '2', date: '2023-06-05', hours: 8, reason: null },
  { id: '7', staff_id: '2', date: '2023-06-06', hours: 8, reason: null },
  { id: '8', staff_id: '2', date: '2023-06-07', hours: 4, reason: 'Krankheit' },
  { id: '9', staff_id: '3', date: '2023-06-05', hours: 6, reason: null },
  { id: '10', staff_id: '3', date: '2023-06-06', hours: 6, reason: null },
];

export default function StundenPage() {
  const [selectedStaff, setSelectedStaff] = useState<string>('1'); // Eigene Stunden standardmäßig anzeigen
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Funktion zum Filtern der Stunden nach Mitarbeiter
  const filteredHours = mockHours.filter(hour => hour.staff_id === selectedStaff);
  
  // Berechnung der Gesamtstunden für die aktuelle Woche
  const weeklyHours = filteredHours.reduce((sum, hour) => sum + Number(hour.hours), 0);
  const weeklyTarget = 40; // Sollstunden pro Woche
  const weeklyPercentage = Math.min(Math.round((weeklyHours / weeklyTarget) * 100), 100);
  
  // Berechnung des Status-Indikators
  const getStatusColor = (percentage: number) => {
    if (percentage < 75) return 'text-red-500 bg-red-100';
    if (percentage < 100) return 'text-yellow-500 bg-yellow-100';
    return 'text-green-500 bg-green-100';
  };

  const openModalForDate = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Stundenerfassung" 
        breadcrumb={['Home', 'Stunden']}
        action={{
          label: "Stunden erfassen",
          onClick: () => setIsModalOpen(true)
        }}
      />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Filter-Leiste */}
        <div className="col-span-12 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="staff-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Mitarbeiter
                </label>
                <select
                  id="staff-select"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="block w-48 rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mockStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Zeitraum
                </label>
                <select
                  id="date-select"
                  className="block w-48 rounded-md border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Juni 2023</option>
                  <option>Mai 2023</option>
                  <option>April 2023</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`p-2 rounded-md ${viewMode === 'week' ? 'bg-blue-50 text-blue-500' : 'text-gray-700'}`}
              >
                <Calendar size={20} />
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`p-2 rounded-md ${viewMode === 'month' ? 'bg-blue-50 text-blue-500' : 'text-gray-700'}`}
              >
                <Clock size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stunden-Karte */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <StundenCard 
            hours={weeklyHours} 
            target={weeklyTarget} 
            percentage={weeklyPercentage}
            statusColor={getStatusColor(weeklyPercentage)}
          />
        </div>
        
        {/* Tabelle mit Stundeneinträgen */}
        <div className="col-span-12">
          <StundenTabelle 
            hours={filteredHours} 
            viewMode={viewMode}
            onEditClick={openModalForDate}
          />
        </div>
      </div>
      
      {/* Modal zum Hinzufügen/Bearbeiten von Stunden */}
      {isModalOpen && (
        <StundenModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
          }}
          staffId={selectedStaff}
          date={selectedDate}
          existingData={selectedDate ? filteredHours.find(h => h.date === selectedDate) : undefined}
        />
      )}
    </div>
  );
} 