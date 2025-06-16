'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, Calendar, RotateCcw, Check, X, AlertTriangle } from 'lucide-react';
import CourseNavigation from '@/app/components/kursplan/CourseNavigation';

interface TimeSlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days: number[]; // 0=Sonntag, 1=Montag, etc.
  is_active: boolean;
  category?: string;
}

const TimeManagementPage = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    days: [] as number[],
    is_active: true,
    category: 'standard'
  });

  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const timeCategories = [
    { value: 'standard', label: 'Standard', color: 'bg-blue-100 text-blue-800' },
    { value: 'peak', label: 'Peak-Zeit', color: 'bg-red-100 text-red-800' },
    { value: 'off-peak', label: 'Off-Peak', color: 'bg-green-100 text-green-800' },
    { value: 'special', label: 'Spezial', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      
      // Mock-Daten für Demo
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          name: 'Morgen-Slots',
          start_time: '06:00',
          end_time: '10:00',
          days: [1, 2, 3, 4, 5], // Mo-Fr
          is_active: true,
          category: 'off-peak'
        },
        {
          id: '2',
          name: 'Mittag-Peak',
          start_time: '12:00',
          end_time: '14:00',
          days: [1, 2, 3, 4, 5], // Mo-Fr
          is_active: true,
          category: 'peak'
        },
        {
          id: '3',
          name: 'Abend-Prime',
          start_time: '17:00',
          end_time: '21:00',
          days: [1, 2, 3, 4, 5], // Mo-Fr
          is_active: true,
          category: 'peak'
        },
        {
          id: '4',
          name: 'Wochenende',
          start_time: '09:00',
          end_time: '18:00',
          days: [0, 6], // So, Sa
          is_active: true,
          category: 'standard'
        }
      ];

      setTimeSlots(mockSlots);
    } catch (err) {
      setError('Fehler beim Laden der Zeitslots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (slot?: TimeSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        name: slot.name,
        start_time: slot.start_time,
        end_time: slot.end_time,
        days: slot.days,
        is_active: slot.is_active,
        category: slot.category || 'standard'
      });
    } else {
      setEditingSlot(null);
      setFormData({
        name: '',
        start_time: '',
        end_time: '',
        days: [],
        is_active: true,
        category: 'standard'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSlot) {
        console.log('Zeitslot aktualisieren:', formData);
      } else {
        console.log('Neuen Zeitslot erstellen:', formData);
      }
      
      await loadTimeSlots();
      closeModal();
    } catch (err) {
      setError(`Fehler beim ${editingSlot ? 'Aktualisieren' : 'Erstellen'} des Zeitslots`);
      console.error(err);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Zeitslot löschen möchten?')) {
      return;
    }

    try {
      console.log('Zeitslot löschen:', slotId);
      await loadTimeSlots();
    } catch (err) {
      setError('Fehler beim Löschen des Zeitslots');
      console.error(err);
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }));
  };

  const getDayNames = (days: number[]) => {
    if (days.length === 7) return 'Täglich';
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Mo-Fr';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Wochenende';
    return days.map(d => weekDays[d]).join(', ');
  };

  const getCategoryInfo = (category: string) => {
    return timeCategories.find(c => c.value === category) || timeCategories[0];
  };

  const generateStandardSlots = () => {
    const standardSlots = [
      { name: 'Früh-Slots', start: '06:00', end: '09:00', days: [1,2,3,4,5], category: 'off-peak' },
      { name: 'Vormittag', start: '09:00', end: '12:00', days: [1,2,3,4,5], category: 'standard' },
      { name: 'Mittag-Peak', start: '12:00', end: '14:00', days: [1,2,3,4,5], category: 'peak' },
      { name: 'Nachmittag', start: '14:00', end: '17:00', days: [1,2,3,4,5], category: 'standard' },
      { name: 'Abend-Peak', start: '17:00', end: '21:00', days: [1,2,3,4,5], category: 'peak' },
      { name: 'Spät-Slots', start: '21:00', end: '22:00', days: [1,2,3,4,5], category: 'off-peak' },
      { name: 'Wochenend-Slots', start: '09:00', end: '18:00', days: [0,6], category: 'standard' }
    ];

    // Hier würde normalerweise die API aufgerufen werden
    console.log('Standard-Zeitslots generieren:', standardSlots);
  };

  return (
    <div className="space-y-6">
      <CourseNavigation />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            Zeitverwaltung
          </h1>
          <p className="text-gray-600">Verwalten Sie verfügbare Zeitslots und Kurszeiten</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={generateStandardSlots}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Standard-Slots
          </button>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neuer Zeitslot
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Schließen
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Time Slots Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeSlots.map(slot => {
            const categoryInfo = getCategoryInfo(slot.category || 'standard');
            
            return (
              <div key={slot.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Slot Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{slot.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                      {categoryInfo.label}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(slot)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zeitraum</span>
                    <span className="font-medium text-gray-900">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tage</span>
                    <span className="font-medium text-gray-900">
                      {getDayNames(slot.days)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slot.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {(() => {
                          const start = new Date(`2024-01-01T${slot.start_time}`);
                          const end = new Date(`2024-01-01T${slot.end_time}`);
                          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                          return `${duration}h Dauer`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Zeitslot-Kategorien
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {timeCategories.map(category => (
            <div key={category.value} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                {category.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal für Zeitslot erstellen/bearbeiten */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSlot ? 'Zeitslot bearbeiten' : 'Neuer Zeitslot'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grunddaten */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zeitslot-Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. Morgen-Slots, Abend-Peak"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Startzeit *
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endzeit *
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Zeitslot aktiv</span>
                    </label>
                  </div>
                </div>

                {/* Wochentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Wochentage *
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                          formData.days.includes(index)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {formData.days.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">Mindestens ein Tag muss ausgewählt werden</p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={formData.days.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    {editingSlot ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeManagementPage;
