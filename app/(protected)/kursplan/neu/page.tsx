'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Save, ArrowLeft, X, AlertTriangle, Calendar, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CoursesAPI, { CreateCourseData, CreateScheduleData, CourseConflict } from '../../../lib/api/courses';
import CourseCategoriesAPI, { CourseCategory } from '../../../lib/api/courseCategories';
import CourseRoomsAPI, { CourseRoom } from '../../../lib/api/courseRooms';
import Link from 'next/link';

// Mock Staff Interface - sollte durch echte Staff API ersetzt werden
interface Staff {
  id: string;
  name: string;
  rolle: string;
}

interface WeeklySchedule {
  [key: number]: { start_time: string; end_time: string }[];
}

interface SpecialDate {
  date: string;
  start_time: string;
  end_time: string;
}

const NewCoursePage = () => {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState<CreateCourseData>({
    name: '',
    description: '',
    category_id: '',
    trainer_id: '',
    room_id: '',
    max_participants: 15,
    current_participants: 0,
    schedule_plan: 'main',
    is_public: true,
    is_special: false,
    schedules: []
  });

  // Weekly Schedule State (0=Sonntag, 1=Montag, etc.)
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    0: [], // Sonntag
    1: [], // Montag
    2: [], // Dienstag
    3: [], // Mittwoch
    4: [], // Donnerstag
    5: [], // Freitag
    6: []  // Samstag
  });

  // Special Dates State
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);

  // Options
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [rooms, setRooms] = useState<CourseRoom[]>([]);
  const [trainers, setTrainers] = useState<Staff[]>([]);

  // Form States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<CourseConflict[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const weekDays = [
    { value: 1, label: 'Montag' },
    { value: 2, label: 'Dienstag' },
    { value: 3, label: 'Mittwoch' },
    { value: 4, label: 'Donnerstag' },
    { value: 5, label: 'Freitag' },
    { value: 6, label: 'Samstag' },
    { value: 0, label: 'Sonntag' }
  ];

  // Load options
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      // Dynamisch die StaffAPI importieren
      const { default: StaffAPI } = await import('../../../lib/api/staff');
      
      const [categoriesData, roomsData, staffData] = await Promise.all([
        CourseCategoriesAPI.getAll(),
        CourseRoomsAPI.getAll(),
        StaffAPI.getAll()
      ]);

      setCategories(categoriesData);
      setRooms(roomsData);
      
      // Nur Trainer und Studioleiter anzeigen (Mitarbeiter können auch Trainer sein)
      const trainers = staffData
        .filter(staff => staff.rolle === 'studioleiter' || staff.rolle === 'mitarbeiter')
        .map(staff => ({
          id: staff.id,
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.email,
          rolle: staff.rolle
        }));
      
      setTrainers(trainers);
    } catch (err) {
      console.error('Fehler beim Laden der Optionen:', err);
      setError('Fehler beim Laden der Formulardaten');
    }
  };

  // Add time slot to weekly schedule
  const addTimeSlot = (dayOfWeek: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayOfWeek]: [...prev[dayOfWeek], { start_time: '09:00', end_time: '10:00' }]
    }));
  };

  // Update time slot in weekly schedule
  const updateTimeSlot = (dayOfWeek: number, index: number, field: 'start_time' | 'end_time', value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Remove time slot from weekly schedule
  const removeTimeSlot = (dayOfWeek: number, index: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index)
    }));
  };

  // Add special date
  const addSpecialDate = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setSpecialDates(prev => [...prev, {
      date: nextWeek.toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00'
    }]);
  };

  // Update special date
  const updateSpecialDate = (index: number, field: keyof SpecialDate, value: string) => {
    setSpecialDates(prev => prev.map((date, i) => 
      i === index ? { ...date, [field]: value } : date
    ));
  };

  // Remove special date
  const removeSpecialDate = (index: number) => {
    setSpecialDates(prev => prev.filter((_, i) => i !== index));
  };

  // Generate time options
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Kursname ist erforderlich';
    }

    if (!formData.category_id) {
      errors.category_id = 'Kategorie ist erforderlich';
    }

    if (!formData.trainer_id) {
      errors.trainer_id = 'Trainer ist erforderlich';
    }

    if (!formData.room_id) {
      errors.room_id = 'Raum ist erforderlich';
    }

    if (formData.max_participants <= 0) {
      errors.max_participants = 'Max. Teilnehmer muss größer als 0 sein';
    }

    // Check if either weekly schedule or special dates are provided
    const hasValidWeeklySchedule = !formData.is_special && Object.values(weeklySchedule).some(day => 
      day.some(slot => slot.start_time && slot.end_time && slot.start_time < slot.end_time)
    );
    const hasValidSpecialDates = formData.is_special && specialDates.some(date => 
      date.date && date.start_time && date.end_time && date.start_time < date.end_time
    );
    
    if (!hasValidWeeklySchedule && !hasValidSpecialDates) {
      if (formData.is_special) {
        errors.schedules = 'Mindestens ein gültiger Kursspezial-Termin ist erforderlich';
      } else {
        errors.schedules = 'Mindestens ein gültiger Zeitplan ist erforderlich';
      }
    }

    // Validate weekly schedule times
    Object.entries(weeklySchedule).forEach(([day, slots]) => {
      slots.forEach((slot, index) => {
        if (slot.start_time >= slot.end_time) {
          errors[`weekly_${day}_${index}`] = 'Startzeit muss vor Endzeit liegen';
        }
      });
    });

    // Validate special dates times
    specialDates.forEach((date, index) => {
      if (date.start_time >= date.end_time) {
        errors[`special_${index}`] = 'Startzeit muss vor Endzeit liegen';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Convert form data to schedules
  const convertToSchedules = (): CreateScheduleData[] => {
    const schedules: CreateScheduleData[] = [];

    // Add weekly schedules
    if (!formData.is_special) {
      Object.entries(weeklySchedule).forEach(([dayOfWeek, slots]) => {
        slots.forEach(slot => {
          if (slot.start_time && slot.end_time && slot.start_time < slot.end_time) {
            schedules.push({
              day_of_week: parseInt(dayOfWeek),
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_active: true
            });
          }
        });
      });
    }

    // Add special dates
    if (formData.is_special) {
      specialDates.forEach(date => {
        if (date.date && date.start_time && date.end_time && date.start_time < date.end_time) {
          schedules.push({
            special_date: date.date,
            start_time: date.start_time,
            end_time: date.end_time,
            is_active: true
          });
        }
      });
    }

    return schedules;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Bitte beheben Sie die Validierungsfehler');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const schedules = convertToSchedules();
      
      // Debug-Log
      console.log('Form Data:', formData);
      console.log('Weekly Schedule:', weeklySchedule);
      console.log('Special Dates:', specialDates);
      console.log('Converted Schedules:', schedules);

      if (schedules.length === 0) {
        throw new Error('Keine gültigen Zeitpläne gefunden. Bitte überprüfen Sie Ihre Eingaben.');
      }

      const courseData: CreateCourseData = {
        ...formData,
        schedules,
        // Sicherstellen dass alle required Felder gesetzt sind
        current_participants: formData.current_participants || 0,
        schedule_plan: formData.schedule_plan || 'main',
        is_public: formData.is_public !== false,
        is_special: formData.is_special || false
      };

      console.log('Final Course Data:', courseData);

      await CoursesAPI.create(courseData);
      router.push('/kursplan');
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Kurses:', err);
      setError(err.message || 'Fehler beim Erstellen des Kurses. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/kursplan"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Neuer Kurs</h1>
            <p className="text-gray-600">Erstellen Sie einen neuen Kurs für den Kursplan</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Speichern...' : 'Kurs speichern'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Konflikte erkannt</h3>
          </div>
          <ul className="space-y-1">
            {conflicts.map((conflict, index) => (
              <li key={index} className="text-yellow-700 text-sm">
                • {conflict.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Allgemeine Kursinformationen */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Allgemeine Kursinformationen</h2>
          
          <div className="space-y-4">
            {/* Kursname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kursname
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="z.B. Yoga Flow"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dynamic yoga class focused on fluid movements"
              />
            </div>

            {/* Trainer und Raum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trainer auswählen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trainer auswählen
                </label>
                <select
                  value={formData.trainer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, trainer_id: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.trainer_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Trainer wählen</option>
                  {trainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                {validationErrors.trainer_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.trainer_id}</p>
                )}
              </div>

              {/* Raum / Ort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raum / Ort
                </label>
                <select
                  value={formData.room_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, room_id: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.room_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Raum wählen</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} {room.location && `(${room.location})`}
                    </option>
                  ))}
                </select>
                {validationErrors.room_id && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.room_id}</p>
                )}
              </div>
            </div>

            {/* Kategorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.category_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Kategorie wählen</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.category_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category_id}</p>
              )}
            </div>

            {/* Öffentlich anzeigen */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="text-gray-700">
                Öffentlich anzeigen
              </label>
            </div>
          </div>
        </div>

        {/* Wochentage & Uhrzeiten */}
        {!formData.is_special && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wochentage & Uhrzeiten</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    {weekDays.map(day => (
                      <th key={day.value} className="text-left py-3 px-4 font-medium text-gray-700 min-w-24">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Calculate max rows needed */}
                  {Array.from({ length: Math.max(1, Math.max(...Object.values(weeklySchedule).map(slots => slots.length))) }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-100">
                      {weekDays.map(day => {
                        const slot = weeklySchedule[day.value][rowIndex];
                        return (
                          <td key={day.value} className="py-2 px-4 align-top">
                            {slot ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={slot.start_time}
                                    onChange={(e) => updateTimeSlot(day.value, rowIndex, 'start_time', e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {generateTimeOptions().map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                  <span className="text-gray-500">—</span>
                                  <select
                                    value={slot.end_time}
                                    onChange={(e) => updateTimeSlot(day.value, rowIndex, 'end_time', e.target.value)}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    {generateTimeOptions().map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => removeTimeSlot(day.value, rowIndex)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                {validationErrors[`weekly_${day.value}_${rowIndex}`] && (
                                  <p className="text-xs text-red-600">{validationErrors[`weekly_${day.value}_${rowIndex}`]}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Add time slot row */}
                  <tr>
                    {weekDays.map(day => (
                      <td key={day.value} className="py-2 px-4">
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day.value)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>weitere Uhrzeit hinzufügen</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            
            {validationErrors.schedules && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.schedules}</p>
            )}
          </div>
        )}

        {/* Teilnehmer */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Teilnehmer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max. Teilnehmerzahl */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max. Teilnehmerzahl
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.max_participants ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.max_participants && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.max_participants}</p>
              )}
            </div>

            {/* Aktuelle Anzahl */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktuelle Anzahl
              </label>
              <input
                type="number"
                min="0"
                value={formData.current_participants}
                onChange={(e) => setFormData(prev => ({ ...prev, current_participants: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Kursspezial */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Kursspezial <span className="text-sm font-normal text-gray-500">(Temporärer Kurs)</span>
          </h2>
          
          <div className="space-y-4">
            {/* Kursspezial Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_special"
                checked={formData.is_special}
                onChange={(e) => setFormData(prev => ({ ...prev, is_special: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_special" className="text-gray-700">
                Kursspezial anzeigen
              </label>
            </div>

            {/* Special Dates */}
            {formData.is_special && (
              <div className="space-y-3">
                {specialDates.map((date, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={date.date}
                        onChange={(e) => updateSpecialDate(index, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Zeit</span>
                      <select
                        value={date.start_time}
                        onChange={(e) => updateSpecialDate(index, 'start_time', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {generateTimeOptions().map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">—</span>
                      <select
                        value={date.end_time}
                        onChange={(e) => updateSpecialDate(index, 'end_time', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {generateTimeOptions().map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecialDate(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSpecialDate}
                  className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Weitere Datum hinzufügen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewCoursePage; 