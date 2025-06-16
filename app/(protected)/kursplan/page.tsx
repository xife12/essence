'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Filter, Settings, ChevronLeft, ChevronRight, Eye, EyeOff, Grid3X3, List, MapPin, Clock } from 'lucide-react';
import CoursesAPI, { WeekSchedule, CourseFilters } from '../../lib/api/courses';
import CourseCategoriesAPI, { CourseCategory } from '../../lib/api/courseCategories';
import CourseRoomsAPI, { CourseRoom } from '../../lib/api/courseRooms';
import { StaffAPI } from '../../lib/api/staff';
import Link from 'next/link';

interface Staff {
  id: string;
  name: string;
}

type ViewMode = 'week' | 'room' | 'table' | 'day';

interface Course {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  trainer_id?: string;
  trainer_name?: string;
  room_id?: string;
  room_name?: string;
  max_participants: number;
  current_participants: number;
  is_public: boolean;
  schedules: Array<{
    id: string;
    day_of_week?: number;
    start_time: string;
    end_time: string;
    special_date?: string;
  }>;
}

const CourseSchedulePage = () => {
  // State für Ansichtsmodus
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State für Wochenplan
  const [currentWeek, setCurrentWeek] = useState<Date>(getStartOfWeek(new Date()));
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({});
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State für Filter
  const [showFilters, setShowFilters] = useState(false);
  const [showPublicOnly, setShowPublicOnly] = useState(true);
  const [filters, setFilters] = useState<CourseFilters>({});
  
  // Daten für Filter-Optionen
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [rooms, setRooms] = useState<CourseRoom[]>([]);
  const [trainers, setTrainers] = useState<Staff[]>([]);

  // Woche-Hilfsfunktionen
  function getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Montag = Start
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  
  const getWeekRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.getDate()}.${startDate.getMonth() + 1} - ${endDate.getDate()}.${endDate.getMonth() + 1}.${endDate.getFullYear()}`;
  };

  // Daten laden
  const loadWeekSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await CoursesAPI.getWeekSchedule(currentWeek);
      setWeekSchedule(data);
      
      // Alle Kurse für andere Ansichten sammeln
      const coursesArray: Course[] = [];
      Object.values(data).forEach(day => {
        coursesArray.push(...day.courses);
      });
      setAllCourses(coursesArray);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Kursplans');
      console.error('Fehler beim Laden des Kursplans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, roomsData, trainersData] = await Promise.all([
        CourseCategoriesAPI.getAll(),
        CourseRoomsAPI.getAll(),
        StaffAPI.getAll() // Annahme: StaffAPI existiert
      ]);

      setCategories(categoriesData);
      setRooms(roomsData);
      setTrainers(trainersData.filter(staff => staff.rolle !== 'admin')); // Nur Trainer und Studioleiter
    } catch (err) {
      console.error('Fehler beim Laden der Filter-Optionen:', err);
    }
  };

  // Effects
  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadWeekSchedule();
  }, [currentWeek]);

  // Navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(getStartOfWeek(new Date()));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Filter anwenden
  const applyFilters = () => {
    loadWeekSchedule();
  };

  const clearFilters = () => {
    setFilters({});
    setShowPublicOnly(true);
    loadWeekSchedule();
  };

  // Gefilterte Kurse für verschiedene Ansichten
  const getFilteredCourses = () => {
    return allCourses.filter(course => {
      if (showPublicOnly && !course.is_public) return false;
      if (filters.category_id && course.category_id !== filters.category_id) return false;
      if (filters.room_id && course.room_id !== filters.room_id) return false;
      if (filters.trainer_id && course.trainer_id !== filters.trainer_id) return false;
      return true;
    });
  };

  // Kurse für Tagesansicht
  const getCoursesForDay = (date: Date) => {
    const dayKey = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Sonntag = 7
    
    return getFilteredCourses().filter(course => 
      course.schedules.some(schedule => 
        schedule.day_of_week === dayOfWeek || schedule.special_date === dayKey
      )
    );
  };

  // Kurse nach Raum gruppieren
  const getCoursesByRoom = () => {
    const filteredCourses = getFilteredCourses();
    const coursesByRoom: { [roomId: string]: { room: CourseRoom, courses: Course[] } } = {};
    
    filteredCourses.forEach(course => {
      if (!coursesByRoom[course.room_id]) {
        const room = rooms.find(r => r.id === course.room_id);
        if (room) {
          coursesByRoom[course.room_id] = { room, courses: [] };
        }
      }
      if (coursesByRoom[course.room_id]) {
        coursesByRoom[course.room_id].courses.push(course);
      }
    });
    
    return coursesByRoom;
  };

  // View Mode Selector Komponente
  const ViewModeSelector = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode('week')}
        className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
          viewMode === 'week'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
        <span>Woche</span>
      </button>
      <button
        onClick={() => setViewMode('day')}
        className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
          viewMode === 'day'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Clock className="h-4 w-4" />
        <span>Tag</span>
      </button>
      <button
        onClick={() => setViewMode('room')}
        className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
          viewMode === 'room'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <MapPin className="h-4 w-4" />
        <span>Räume</span>
      </button>
      <button
        onClick={() => setViewMode('table')}
        className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
          viewMode === 'table'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <List className="h-4 w-4" />
        <span>Tabelle</span>
      </button>
    </div>
  );

  // Wochenansicht Komponente (bestehende Implementierung)
  const WeekView = () => (
    <>
      {/* Wochennavigation */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Vorherige Woche</span>
        </button>

        <button
          onClick={goToCurrentWeek}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aktuelle Woche
        </button>

        <button
          onClick={() => navigateWeek('next')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>Nächste Woche</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Wochenplan Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header mit Wochentagen */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-200">
            Uhrzeit
          </div>
          {weekDays.map((day, index) => {
            const date = new Date(currentWeek);
            date.setDate(currentWeek.getDate() + index);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day}
                className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday ? 'bg-blue-50 text-blue-700 font-semibold' : 'bg-gray-50 text-gray-700'
                }`}
              >
                <div className="font-medium">{day}</div>
                <div className="text-sm text-gray-500">{date.getDate()}.{date.getMonth() + 1}</div>
              </div>
            );
          })}
        </div>

        {/* Zeitraster */}
        <div className="relative">
          {/* Stunden von 06:00 bis 22:00 */}
          {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[80px]">
              {/* Zeitanzeige */}
              <div className="p-2 border-r border-gray-200 bg-gray-25 flex items-center justify-center">
                <span className="text-sm text-gray-600 font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>

              {/* Kurse für jeden Tag */}
              {weekDays.map((_, dayIndex) => {
                const date = new Date(currentWeek);
                date.setDate(currentWeek.getDate() + dayIndex);
                const dayKey = date.toISOString().split('T')[0];
                const dayCourses = weekSchedule[dayKey]?.courses || [];
                
                // Kurse für diese Stunde filtern
                const hourCourses = dayCourses.filter(course => {
                  const startHour = parseInt(course.schedules[0]?.start_time?.split(':')[0] || '0');
                  return startHour === hour;
                });

                return (
                  <div key={dayIndex} className="p-1 border-r border-gray-200 last:border-r-0">
                    {hourCourses.map(course => {
                      const schedule = course.schedules[0];
                      const occupancyPercentage = Math.round(
                        (course.current_participants / course.max_participants) * 100
                      );
                      
                      return (
                        <Link
                          key={course.id}
                          href={`/kursplan/${course.id}`}
                          className="block mb-1 p-2 rounded text-xs hover:shadow-md transition-shadow cursor-pointer border-l-4"
                          style={{
                            backgroundColor: course.category_color + '20',
                            borderLeftColor: course.category_color,
                          }}
                        >
                          <div className="font-medium text-gray-900">{course.name}</div>
                          <div className="text-gray-600">
                            {schedule?.start_time} - {schedule?.end_time}
                          </div>
                          <div className="text-gray-500">
                            {course.room_name}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-500">
                              {course.current_participants}/{course.max_participants}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${
                              occupancyPercentage >= 90
                                ? 'bg-red-500'
                                : occupancyPercentage >= 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // Tagesansicht Komponente
  const DayView = () => {
    const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    const dayName = weekDays[dayOfWeek - 1];
    const dayKey = selectedDate.toISOString().split('T')[0];
    const dayCourses = getCoursesForDay(selectedDate);
    
    // Kurse nach Räumen gruppieren
    const coursesByRoom = dayCourses.reduce((acc, course) => {
      const roomId = course.room_id;
      if (!acc[roomId]) {
        acc[roomId] = {
          room: rooms.find(r => r.id === roomId) || { id: roomId, name: course.room_name },
          courses: []
        };
      }
      acc[roomId].courses.push(course);
      return acc;
    }, {} as { [roomId: string]: { room: any, courses: Course[] } });

    // Zeitraster von 6:00 bis 22:00 (16 Stunden)
    const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);
    
    // Funktion um Kurs-Position und Höhe zu berechnen
    const getCoursePosition = (startTime: string, endTime: string) => {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startInMinutes = (startHour - 6) * 60 + startMinute; // Relative zu 6:00
      const endInMinutes = (endHour - 6) * 60 + endMinute;
      const durationInMinutes = endInMinutes - startInMinutes;
      
      // Jede Stunde = 80px (wie im Grid), proportional für Minuten
      const pixelsPerMinute = 80 / 60;
      
      return {
        top: startInMinutes * pixelsPerMinute,
        height: Math.max(durationInMinutes * pixelsPerMinute, 40) // Mindesthöhe 40px
      };
    };

    return (
      <>
        {/* Tagesnavigation */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <button
            onClick={() => navigateDay('prev')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Vorheriger Tag</span>
          </button>

          <div className="text-center">
            <div className="font-semibold text-lg">{dayName}</div>
            <div className="text-gray-600">
              {selectedDate.getDate()}.{selectedDate.getMonth() + 1}.{selectedDate.getFullYear()}
            </div>
          </div>

          <button
            onClick={() => navigateDay('next')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>Nächster Tag</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center mb-4">
          <button
            onClick={goToToday}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Heute
          </button>
        </div>

        {/* Zeitstrahl-Layout */}
        {Object.keys(coursesByRoom).length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Kurse für diesen Tag geplant.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                Zeitstrahl für {dayName} ({dayCourses.length} Kurse in {Object.keys(coursesByRoom).length} Räumen)
              </h3>
            </div>

            {/* Zeitstrahl Grid */}
            <div className="flex">
              {/* Zeitachse links */}
              <div className="flex-shrink-0 w-20 border-r border-gray-200">
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">Zeit</span>
                </div>
                {timeSlots.map(hour => (
                  <div key={hour} className="h-20 border-b border-gray-100 flex items-center justify-center bg-gray-25">
                    <span className="text-sm text-gray-600 font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Raum-Spalten */}
              {Object.entries(coursesByRoom).map(([roomId, { room, courses }], roomIndex) => (
                <div key={roomId} className="flex-1 min-w-[200px] border-r border-gray-200 last:border-r-0">
                  {/* Raum Header */}
                  <div className="h-12 border-b border-gray-200 bg-gray-50 px-4 flex items-center">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{room.name}</div>
                      {room.location && (
                        <div className="text-xs text-gray-500">{room.location}</div>
                      )}
                    </div>
                  </div>

                  {/* Zeitraster für diesen Raum */}
                  <div className="relative">
                    {/* Stunden-Raster (Hintergrund) */}
                    {timeSlots.map(hour => (
                      <div key={hour} className="h-20 border-b border-gray-100"></div>
                    ))}

                    {/* Kurse absolut positioniert */}
                    {courses.map(course => {
                      const schedule = course.schedules.find(s => 
                        s.day_of_week === dayOfWeek || s.special_date === dayKey
                      );
                      
                      if (!schedule) return null;

                      const position = getCoursePosition(schedule.start_time, schedule.end_time);
                      const occupancyPercentage = Math.round(
                        (course.current_participants / course.max_participants) * 100
                      );

                      return (
                        <Link
                          key={course.id}
                          href={`/kursplan/${course.id}`}
                          className="absolute left-1 right-1 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group z-10"
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            backgroundColor: course.category_color + '20',
                            borderLeftColor: course.category_color,
                          }}
                        >
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div>
                              <div className="font-medium text-xs text-gray-900 leading-tight">
                                {course.name}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {schedule.start_time} - {schedule.end_time}
                              </div>
                            </div>
                            
                            {position.height >= 60 && (
                              <div className="mt-2">
                                <div className="text-xs text-gray-600">
                                  {course.trainer_name}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-600">
                                    {course.current_participants}/{course.max_participants}
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${
                                    occupancyPercentage >= 90
                                      ? 'bg-red-500'
                                      : occupancyPercentage >= 70
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`} />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Tooltip für kleine Kurse */}
                          {position.height < 60 && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              <div className="font-medium">{course.name}</div>
                              <div>Trainer: {course.trainer_name}</div>
                              <div>Teilnehmer: {course.current_participants}/{course.max_participants}</div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legende */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Verfügbar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Gut besucht</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Ausgebucht</span>
                  </div>
                </div>
                <div className="text-gray-500">
                  Klicken Sie auf einen Kurs für Details
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Raumansicht Komponente
  const RoomView = () => {
    const coursesByRoom = getCoursesByRoom();
    const roomEntries = Object.entries(coursesByRoom);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Kurse nach Räumen ({roomEntries.length} Räume)</h3>
        </div>

        {roomEntries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Kurse für die ausgewählten Filter gefunden.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {roomEntries.map(([roomId, { room, courses }]) => (
              <div key={roomId} className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">{room.name}</h4>
                                             {room.location && (
                         <p className="text-gray-600">{room.location}</p>
                       )}
                       {room.max_capacity && (
                         <p className="text-sm text-gray-500">Kapazität: {room.max_capacity} Personen</p>
                       )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                      <div className="text-sm text-gray-600">Kurse</div>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {courses.map(course => {
                    const schedule = course.schedules[0];
                    const occupancyPercentage = Math.round(
                      (course.current_participants / course.max_participants) * 100
                    );

                    return (
                      <Link
                        key={course.id}
                        href={`/kursplan/${course.id}`}
                        className="block p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: course.category_color }}
                            />
                            <div>
                              <h5 className="font-medium text-gray-900">{course.name}</h5>
                              <p className="text-sm text-gray-600">{course.category_name}</p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {schedule && (
                              <>
                                {weekDays[schedule.day_of_week - 1]} • {schedule.start_time} - {schedule.end_time}
                              </>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {course.trainer_name}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {course.current_participants}/{course.max_participants}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${
                              occupancyPercentage >= 90
                                ? 'bg-red-500'
                                : occupancyPercentage >= 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Tabellenansicht Komponente
  const TableView = () => {
    const filteredCourses = getFilteredCourses();

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Alle Kurse ({filteredCourses.length})</h3>
        </div>
        
        {filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <List className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Kurse für die ausgewählten Filter gefunden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zeit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teilnehmer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map(course => {
                  const schedule = course.schedules[0];
                  const occupancyPercentage = Math.round(
                    (course.current_participants / course.max_participants) * 100
                  );

                  return (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/kursplan/${course.id}`}
                          className="flex items-center hover:text-blue-600"
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: course.category_color }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{course.name}</div>
                            {course.description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {course.description}
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.trainer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.room_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule && (
                          <>
                            <div>{weekDays[schedule.day_of_week - 1]}</div>
                            <div className="text-gray-500">
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {course.current_participants}/{course.max_participants}
                        </div>
                        <div className="text-xs text-gray-500">
                          {occupancyPercentage}% belegt
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            occupancyPercentage >= 90
                              ? 'bg-red-500'
                              : occupancyPercentage >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`} />
                          <span className={`text-xs font-medium ${
                            occupancyPercentage >= 90
                              ? 'text-red-700'
                              : occupancyPercentage >= 70
                              ? 'text-yellow-700'
                              : 'text-green-700'
                          }`}>
                            {occupancyPercentage >= 90
                              ? 'Voll'
                              : occupancyPercentage >= 70
                              ? 'Gut besucht'
                              : 'Verfügbar'
                            }
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kursplan</h1>
            <p className="text-gray-600">
              {viewMode === 'week' && `Wochenübersicht ${getWeekRange(currentWeek)}`}
              {viewMode === 'day' && `Tagesansicht ${selectedDate.getDate()}.${selectedDate.getMonth() + 1}.${selectedDate.getFullYear()}`}
              {viewMode === 'room' && 'Raumübersicht'}
              {viewMode === 'table' && 'Tabellenansicht'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <ViewModeSelector />
          
          <div className="flex items-center space-x-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>

            {/* Öffentliche Kurse Toggle */}
            <button
              onClick={() => setShowPublicOnly(!showPublicOnly)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showPublicOnly
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showPublicOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{showPublicOnly ? 'Nur öffentliche' : 'Alle Kurse'}</span>
            </button>

            {/* Neuer Kurs */}
            <Link
              href="/kursplan/neu"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Neuer Kurs</span>
            </Link>

            {/* Einstellungen */}
            <Link
              href="/kursplan/einstellungen"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Kategorie Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={filters.category_id || ''}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Raum Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raum
              </label>
              <select
                value={filters.room_id || ''}
                onChange={(e) => setFilters({ ...filters, room_id: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Räume</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name} {room.location && `(${room.location})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Trainer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trainer
              </label>
              <select
                value={filters.trainer_id || ''}
                onChange={(e) => setFilters({ ...filters, trainer_id: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Trainer</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Aktionen */}
            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Anwenden
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Error States */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadWeekSchedule}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Ansichts-spezifischer Inhalt */}
      {!loading && !error && (
        <>
          {viewMode === 'week' && <WeekView />}
          {viewMode === 'day' && <DayView />}
          {viewMode === 'room' && <RoomView />}
          {viewMode === 'table' && <TableView />}
        </>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <Link
          href="/kursplan/kategorien"
          className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Kategorien verwalten
        </Link>
        <Link
          href="/kursplan/raeume"
          className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Räume verwalten
        </Link>
        <Link
          href="/kursplan/statistiken"
          className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Statistiken anzeigen
        </Link>
      </div>
    </div>
  );
};

export default CourseSchedulePage; 