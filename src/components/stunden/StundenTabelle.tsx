'use client';

import { Edit, Trash } from 'lucide-react';

interface StundenData {
  id: string;
  staff_id: string;
  date: string;
  hours: number;
  reason: string | null;
}

interface StundenTabelleProps {
  hours: StundenData[];
  viewMode: 'week' | 'month';
  onEditClick: (date: string) => void;
}

export default function StundenTabelle({ hours, viewMode, onEditClick }: StundenTabelleProps) {
  // Formatieren des Datums für die Anzeige
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Wochentag ermitteln
  const getWeekday = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(date);
  };

  // Sortiere die Stunden nach Datum (neueste zuerst)
  const sortedHours = [...hours].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-700">
          {viewMode === 'week' ? 'Wochenübersicht' : 'Monatsübersicht'}
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wochentag
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stunden
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grund
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedHours.length > 0 ? (
              sortedHours.map((hour) => (
                <tr key={hour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(hour.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getWeekday(hour.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {hour.hours} h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {hour.reason || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditClick(hour.date)}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <Trash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Keine Einträge vorhanden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Gesamt: <strong>{hours.reduce((sum, hour) => sum + Number(hour.hours), 0)} Stunden</strong>
          </span>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            Drucken
          </button>
        </div>
      </div>
    </div>
  );
} 