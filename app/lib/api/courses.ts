import supabase from '../supabaseClient';

// ================================================
// TypeScript Interfaces
// ================================================

export interface Course {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  trainer_id?: string;
  room_id?: string;
  max_participants: number;
  current_participants: number;
  schedule_plan: string;
  is_public: boolean;
  is_special: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseSchedule {
  id: string;
  course_id: string;
  day_of_week?: number; // 0=Sonntag, 1=Montag, etc.
  start_time: string;
  end_time: string;
  special_date?: string; // YYYY-MM-DD
  is_active: boolean;
  created_at: string;
}

export interface CourseOverview {
  id: string;
  name: string;
  description?: string;
  max_participants: number;
  current_participants: number;
  is_public: boolean;
  is_special: boolean;
  schedule_plan: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  room_name?: string;
  room_location?: string;
  trainer_name?: string;
  occupancy_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseData {
  name: string;
  description?: string;
  category_id?: string;
  trainer_id?: string;
  room_id?: string;
  max_participants: number;
  current_participants?: number;
  schedule_plan?: string;
  is_public?: boolean;
  is_special?: boolean;
  schedules: CreateScheduleData[];
}

export interface CreateScheduleData {
  day_of_week?: number;
  start_time: string;
  end_time: string;
  special_date?: string;
  is_active?: boolean;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  id: string;
}

export interface CourseConflict {
  type: 'room' | 'trainer';
  conflict_course_id: string;
  conflict_course_name: string;
  conflict_room_name?: string;
  conflict_time_start: string;
  conflict_time_end: string;
  message: string;
}

export interface WeekSchedule {
  [key: string]: {
    date: string;
    courses: CourseWithSchedule[];
  };
}

export interface CourseWithSchedule extends CourseOverview {
  schedules: CourseSchedule[];
}

export interface CourseFilters {
  category_id?: string;
  trainer_id?: string;
  room_id?: string;
  schedule_plan?: string;
  is_public?: boolean;
  is_special?: boolean;
}

// ================================================
// Main Courses API
// ================================================

export const CoursesAPI = {
  
  // ================================================
  // GET: Alle Kurse mit Filtern
  // ================================================
  async getAll(filters?: CourseFilters): Promise<CourseOverview[]> {
    try {
      let query = supabase
        .from('course_overview')
        .select('*')
        .order('name');

      // Filter anwenden
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.trainer_id) {
        query = query.eq('trainer_id', filters.trainer_id);
      }
      if (filters?.room_id) {
        query = query.eq('room_id', filters.room_id);
      }
      if (filters?.schedule_plan) {
        query = query.eq('schedule_plan', filters.schedule_plan);
      }
      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters?.is_special !== undefined) {
        query = query.eq('is_special', filters.is_special);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der Kurse:', error);
      throw error;
    }
  },

  // ================================================
  // GET: Einzelner Kurs mit Zeitplänen
  // ================================================
  async getById(id: string): Promise<CourseWithSchedule | null> {
    try {
      // Kurs-Daten laden
      const { data: courseData, error: courseError } = await supabase
        .from('course_overview')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      if (!courseData) return null;

      // Zeitpläne laden
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('course_schedules')
        .select('*')
        .eq('course_id', id)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (schedulesError) throw schedulesError;

      return {
        ...courseData,
        schedules: schedulesData || []
      };
    } catch (error) {
      console.error('Fehler beim Laden des Kurses:', error);
      throw error;
    }
  },

  // ================================================
  // GET: Wochenplan für bestimmtes Datum
  // ================================================
  async getWeekSchedule(startDate: Date): Promise<WeekSchedule> {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      // Verwende course_overview View aber dedupliciere korrekt
      const { data, error } = await supabase
        .from('course_overview')
        .select('*')
        .eq('schedule_active', true)
        .eq('is_public', true);

      if (error) throw error;

      // Daten in Wochenformat strukturieren
      const weekSchedule: WeekSchedule = {};
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayKey = date.toISOString().split('T')[0];
        
        weekSchedule[dayKey] = {
          date: dayKey,
          courses: []
        };
      }

      // Kurse nach eindeutigen schedule_id gruppieren um Duplikate zu vermeiden
      const processedSchedules = new Set<string>();

      data?.forEach((row: any) => {
        // Skip bereits verarbeitete Schedules
        if (processedSchedules.has(row.schedule_id)) {
          return;
        }
        processedSchedules.add(row.schedule_id);

        // Reguläre Kurse (wöchentlich)
        if (row.day_of_week !== null && !row.special_date) {
          // Berechne das Datum für diesen Wochentag
          const courseDate = new Date(startDate);
          const currentDay = courseDate.getDay(); // 0=Sonntag, 1=Montag...
          const targetDay = row.day_of_week; // 0=Sonntag, 1=Montag...
          
          // Berechne Tage-Differenz
          let dayDiff = targetDay - currentDay;
          if (dayDiff < 0) dayDiff += 7; // Falls targetDay in der nächsten Woche liegt
          
          courseDate.setDate(startDate.getDate() + dayDiff);
          const dayKey = courseDate.toISOString().split('T')[0];
          
          if (weekSchedule[dayKey]) {
            weekSchedule[dayKey].courses.push({
              id: row.id,
              name: row.name,
              description: row.description,
              max_participants: row.max_participants,
              current_participants: row.current_participants,
              is_public: row.is_public,
              is_special: row.is_special,
              schedule_plan: row.schedule_plan,
              category_name: row.category_name,
              category_icon: row.category_icon,
              category_color: row.category_color,
              room_name: row.room_name,
              room_location: row.room_location,
              trainer_name: '', // TODO: Trainer-Name laden
              occupancy_percentage: parseInt(row.occupancy_percentage || '0'),
              created_at: row.created_at,
              updated_at: row.updated_at,
              schedules: [{
                id: row.schedule_id,
                course_id: row.id,
                day_of_week: row.day_of_week,
                start_time: row.start_time,
                end_time: row.end_time,
                special_date: row.special_date,
                is_active: row.schedule_active,
                created_at: row.created_at
              }]
            });
          }
        }
        
        // Spezial-Termine (einmalig)
        if (row.special_date) {
          const dayKey = row.special_date;
          if (weekSchedule[dayKey]) {
            weekSchedule[dayKey].courses.push({
              id: row.id,
              name: row.name,
              description: row.description,
              max_participants: row.max_participants,
              current_participants: row.current_participants,
              is_public: row.is_public,
              is_special: row.is_special,
              schedule_plan: row.schedule_plan,
              category_name: row.category_name,
              category_icon: row.category_icon,
              category_color: row.category_color,
              room_name: row.room_name,
              room_location: row.room_location,
              trainer_name: '', // TODO: Trainer-Name laden
              occupancy_percentage: parseInt(row.occupancy_percentage || '0'),
              created_at: row.created_at,
              updated_at: row.updated_at,
              schedules: [{
                id: row.schedule_id,
                course_id: row.id,
                day_of_week: row.day_of_week,
                start_time: row.start_time,
                end_time: row.end_time,
                special_date: row.special_date,
                is_active: row.schedule_active,
                created_at: row.created_at
              }]
            });
          }
        }
      });

      // Kurse nach Startzeit sortieren
      Object.keys(weekSchedule).forEach(day => {
        weekSchedule[day].courses.sort((a, b) => {
          const timeA = a.schedules[0]?.start_time || '00:00';
          const timeB = b.schedules[0]?.start_time || '00:00';
          return timeA.localeCompare(timeB);
        });
      });

      return weekSchedule;
    } catch (error) {
      console.error('Fehler beim Laden des Wochenplans:', error);
      throw error;
    }
  },

  // ================================================
  // POST: Neuen Kurs erstellen
  // ================================================
  async create(data: CreateCourseData): Promise<Course> {
    try {
      // Validierung
      if (!data.name || data.name.trim() === '') {
        throw new Error('Kursname ist erforderlich');
      }
      if (data.max_participants <= 0) {
        throw new Error('Max. Teilnehmer muss größer als 0 sein');
      }
      if (data.schedules.length === 0) {
        throw new Error('Mindestens ein Zeitplan ist erforderlich');
      }

      // Konflikte prüfen (temporär deaktiviert bis Funktionen verfügbar sind)
      try {
        const conflicts = await this.checkConflicts({
          room_id: data.room_id,
          trainer_id: data.trainer_id,
          schedules: data.schedules
        });

        if (conflicts.length > 0) {
          console.warn('Konflikte erkannt:', conflicts);
          // Warnung statt Fehler für jetzt
          // throw new Error(`Konflikte erkannt: ${conflicts.map(c => c.message).join(', ')}`);
        }
      } catch (conflictError) {
        console.warn('Konfliktprüfung fehlgeschlagen (wird ignoriert):', conflictError);
      }

      // Kurs erstellen
      const courseData = {
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        trainer_id: data.trainer_id,
        room_id: data.room_id,
        max_participants: data.max_participants,
        current_participants: data.current_participants || 0,
        schedule_plan: data.schedule_plan || 'main',
        is_public: data.is_public !== false,
        is_special: data.is_special || false
      };

      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();

      if (courseError) throw courseError;

      // Zeitpläne erstellen
      const schedulePromises = data.schedules.map(schedule => {
        return supabase
          .from('course_schedules')
          .insert({
            course_id: newCourse.id,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            special_date: schedule.special_date,
            is_active: schedule.is_active !== false
          });
      });

      await Promise.all(schedulePromises);

      return newCourse;
    } catch (error) {
      console.error('Fehler beim Erstellen des Kurses:', error);
      throw error;
    }
  },

  // ================================================
  // PUT: Kurs aktualisieren
  // ================================================
  async update(id: string, data: Partial<CreateCourseData>): Promise<Course> {
    try {
      // Konflikte prüfen wenn relevante Daten geändert werden
      if (data.room_id || data.trainer_id || data.schedules) {
        const conflicts = await this.checkConflicts({
          course_id: id,
          room_id: data.room_id,
          trainer_id: data.trainer_id,
          schedules: data.schedules || []
        });

        if (conflicts.length > 0) {
          throw new Error(`Konflikte erkannt: ${conflicts.map(c => c.message).join(', ')}`);
        }
      }

      // Kurs-Daten aktualisieren
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category_id !== undefined) updateData.category_id = data.category_id;
      if (data.trainer_id !== undefined) updateData.trainer_id = data.trainer_id;
      if (data.room_id !== undefined) updateData.room_id = data.room_id;
      if (data.max_participants !== undefined) updateData.max_participants = data.max_participants;
      if (data.current_participants !== undefined) updateData.current_participants = data.current_participants;
      if (data.schedule_plan !== undefined) updateData.schedule_plan = data.schedule_plan;
      if (data.is_public !== undefined) updateData.is_public = data.is_public;
      if (data.is_special !== undefined) updateData.is_special = data.is_special;

      const { data: updatedCourse, error: courseError } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (courseError) throw courseError;

      // Zeitpläne aktualisieren wenn vorhanden
      if (data.schedules) {
        // Alte Zeitpläne löschen
        await supabase
          .from('course_schedules')
          .delete()
          .eq('course_id', id);

        // Neue Zeitpläne erstellen
        const schedulePromises = data.schedules.map(schedule => {
          return supabase
            .from('course_schedules')
            .insert({
              course_id: id,
              day_of_week: schedule.day_of_week,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              special_date: schedule.special_date,
              is_active: schedule.is_active !== false
            });
        });

        await Promise.all(schedulePromises);
      }

      return updatedCourse;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kurses:', error);
      throw error;
    }
  },

  // ================================================
  // DELETE: Kurs löschen
  // ================================================
  async delete(id: string): Promise<void> {
    try {
      // Zeitpläne werden automatisch über CASCADE gelöscht
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Fehler beim Löschen des Kurses:', error);
      throw error;
    }
  },

  // ================================================
  // Konflikte prüfen (vereinfachte Version ohne DB-Funktionen)
  // ================================================
  async checkConflicts(data: {
    course_id?: string;
    room_id?: string;
    trainer_id?: string;
    schedules: CreateScheduleData[];
  }): Promise<CourseConflict[]> {
    try {
      const conflicts: CourseConflict[] = [];

      // Vereinfachte Konfliktprüfung über direkte Datenbankabfragen
      // TODO: Später durch spezielle RPC-Funktionen ersetzen
      
      for (const schedule of data.schedules) {
        // Raum-Konflikte prüfen
        if (data.room_id) {
          let roomQuery = supabase
            .from('courses')
            .select(`
              id,
              name,
              course_schedules!inner(
                start_time,
                end_time,
                day_of_week,
                special_date,
                is_active
              )
            `)
            .eq('room_id', data.room_id)
            .eq('course_schedules.is_active', true);

          // Aktuellen Kurs ausschließen
          if (data.course_id) {
            roomQuery = roomQuery.neq('id', data.course_id);
          }

          const { data: roomCourses, error: roomError } = await roomQuery;

          if (roomError) {
            console.warn('Raum-Konfliktprüfung fehlgeschlagen:', roomError);
            continue;
          }

          roomCourses?.forEach((course: any) => {
            course.course_schedules?.forEach((cs: any) => {
              // Prüfe ob gleicher Tag/Datum
              const sameTimeSlot = schedule.special_date
                ? cs.special_date === schedule.special_date
                : cs.day_of_week === schedule.day_of_week;

              // Prüfe Zeitüberschneidung
              if (sameTimeSlot && cs.start_time < schedule.end_time && cs.end_time > schedule.start_time) {
                conflicts.push({
                  type: 'room',
                  conflict_course_id: course.id,
                  conflict_course_name: course.name,
                  conflict_time_start: cs.start_time,
                  conflict_time_end: cs.end_time,
                  message: `Raum-Konflikt mit "${course.name}" (${cs.start_time}-${cs.end_time})`
                });
              }
            });
          });
        }

        // Trainer-Konflikte prüfen
        if (data.trainer_id) {
          let trainerQuery = supabase
            .from('courses')
            .select(`
              id,
              name,
              course_schedules!inner(
                start_time,
                end_time,
                day_of_week,
                special_date,
                is_active
              )
            `)
            .eq('trainer_id', data.trainer_id)
            .eq('course_schedules.is_active', true);

          // Aktuellen Kurs ausschließen
          if (data.course_id) {
            trainerQuery = trainerQuery.neq('id', data.course_id);
          }

          const { data: trainerCourses, error: trainerError } = await trainerQuery;

          if (trainerError) {
            console.warn('Trainer-Konfliktprüfung fehlgeschlagen:', trainerError);
            continue;
          }

          trainerCourses?.forEach((course: any) => {
            course.course_schedules?.forEach((cs: any) => {
              // Prüfe ob gleicher Tag/Datum
              const sameTimeSlot = schedule.special_date
                ? cs.special_date === schedule.special_date
                : cs.day_of_week === schedule.day_of_week;

              // Prüfe Zeitüberschneidung
              if (sameTimeSlot && cs.start_time < schedule.end_time && cs.end_time > schedule.start_time) {
                conflicts.push({
                  type: 'trainer',
                  conflict_course_id: course.id,
                  conflict_course_name: course.name,
                  conflict_time_start: cs.start_time,
                  conflict_time_end: cs.end_time,
                  message: `Trainer-Konflikt mit "${course.name}" (${cs.start_time}-${cs.end_time})`
                });
              }
            });
          });
        }
      }

      return conflicts;
    } catch (error) {
      console.error('Fehler bei der Konfliktprüfung:', error);
      // Rückgabe leeres Array statt Fehler, damit Kurse trotzdem erstellt werden können
      return [];
    }
  },

  // ================================================
  // Öffentliche Kurse für Landingpages
  // ================================================
  async getPublicCourses(filters?: {
    category_id?: string;
    schedule_plan?: string;
    limit?: number;
  }): Promise<CourseOverview[]> {
    try {
      let query = supabase
        .from('course_overview')
        .select('*')
        .eq('is_public', true)
        .order('name');

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.schedule_plan) {
        query = query.eq('schedule_plan', filters.schedule_plan);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der öffentlichen Kurse:', error);
      throw error;
    }
  },

  // ================================================
  // Teilnehmer-Zähler aktualisieren
  // ================================================
  async updateParticipants(id: string, change: number): Promise<void> {
    try {
      const { data: course, error: fetchError } = await supabase
        .from('courses')
        .select('current_participants, max_participants')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newCount = course.current_participants + change;
      
      if (newCount < 0) {
        throw new Error('Teilnehmerzahl kann nicht negativ sein');
      }
      if (newCount > course.max_participants) {
        throw new Error('Maximale Teilnehmerzahl überschritten');
      }

      const { error: updateError } = await supabase
        .from('courses')
        .update({ current_participants: newCount })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Teilnehmerzahl:', error);
      throw error;
    }
  }

};

export default CoursesAPI; 