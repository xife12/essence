import supabase from '../supabaseClient';

// ================================================
// TypeScript Interfaces
// ================================================

export interface CourseRoom {
  id: string;
  name: string;
  location?: string;
  max_capacity: number;
  description?: string;
  is_active: boolean;
  category_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCourseRoomData {
  name: string;
  location?: string;
  max_capacity: number;
  description?: string;
  is_active?: boolean;
  category_ids?: string[];
}

export interface UpdateCourseRoomData extends Partial<CreateCourseRoomData> {
  id: string;
}

export interface RoomUsageStats {
  room_id: string;
  room_name: string;
  total_courses: number;
  active_courses: number;
  utilization_percentage: number;
}

// ================================================
// Course Rooms API
// ================================================

export const CourseRoomsAPI = {

  // ================================================
  // GET: Alle Räume
  // ================================================
  async getAll(includeInactive = false): Promise<CourseRoom[]> {
    try {
      let query = supabase
        .from('course_rooms')
        .select('*')
        .order('name', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der Kursräume:', error);
      throw error;
    }
  },

  // ================================================
  // GET: Einzelner Raum
  // ================================================
  async getById(id: string): Promise<CourseRoom | null> {
    try {
      const { data, error } = await supabase
        .from('course_rooms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Fehler beim Laden des Kursraums:', error);
      throw error;
    }
  },

  // ================================================
  // GET: Verfügbare Räume für bestimmte Zeit
  // ================================================
  async getAvailableRooms(
    dayOfWeek?: number,
    startTime?: string,
    endTime?: string,
    specialDate?: string,
    excludeCourseId?: string
  ): Promise<CourseRoom[]> {
    try {
      // Alle aktiven Räume laden
      const allRooms = await this.getAll();

      // Wenn keine Zeit angegeben, alle Räume zurückgeben
      if (!startTime || !endTime) {
        return allRooms;
      }

      // Belegte Räume für die angegebene Zeit finden
      let conflictQuery = supabase
        .from('courses')
        .select(`
          id,
          room_id,
          course_schedules (
            day_of_week,
            start_time,
            end_time,
            special_date
          )
        `)
        .not('room_id', 'is', null);

      if (excludeCourseId) {
        conflictQuery = conflictQuery.neq('id', excludeCourseId);
      }

      const { data: conflictingCourses, error: conflictError } = await conflictQuery;

      if (conflictError) throw conflictError;

      // Belegte Raum-IDs ermitteln
      const occupiedRoomIds = new Set<string>();

      conflictingCourses?.forEach((course: any) => {
        course.course_schedules?.forEach((schedule: any) => {
          // Zeitüberschneidung prüfen
          const hasTimeConflict = startTime < schedule.end_time && endTime > schedule.start_time;

          if (hasTimeConflict) {
            // Reguläre Kurse
            if (!specialDate && schedule.day_of_week === dayOfWeek && !schedule.special_date) {
              occupiedRoomIds.add(course.room_id);
            }
            // Kursspezials
            if (specialDate && schedule.special_date === specialDate) {
              occupiedRoomIds.add(course.room_id);
            }
          }
        });
      });

      // Verfügbare Räume filtern
      return allRooms.filter(room => !occupiedRoomIds.has(room.id));
    } catch (error) {
      console.error('Fehler beim Laden verfügbarer Räume:', error);
      throw error;
    }
  },

  // ================================================
  // POST: Neuen Raum erstellen
  // ================================================
  async create(data: CreateCourseRoomData): Promise<CourseRoom> {
    try {
      // Validierung
      if (!data.name || data.name.trim() === '') {
        throw new Error('Raumname ist erforderlich');
      }
      if (data.max_capacity <= 0) {
        throw new Error('Maximale Kapazität muss größer als 0 sein');
      }

      const roomData = {
        name: data.name.trim(),
        location: data.location || null,
        max_capacity: data.max_capacity,
        description: data.description || null,
        is_active: data.is_active !== false,
        category_ids: data.category_ids || []
      };

      const { data: newRoom, error } = await supabase
        .from('course_rooms')
        .insert(roomData)
        .select()
        .single();

      if (error) throw error;
      return newRoom;
    } catch (error) {
      console.error('Fehler beim Erstellen des Kursraums:', error);
      throw error;
    }
  },

  // ================================================
  // PUT: Raum aktualisieren
  // ================================================
  async update(id: string, data: Partial<CreateCourseRoomData>): Promise<CourseRoom> {
    try {
      const updateData: any = {};
      
      if (data.name !== undefined) {
        if (!data.name || data.name.trim() === '') {
          throw new Error('Raumname ist erforderlich');
        }
        updateData.name = data.name.trim();
      }
      
      if (data.location !== undefined) updateData.location = data.location;
      if (data.max_capacity !== undefined) {
        if (data.max_capacity <= 0) {
          throw new Error('Maximale Kapazität muss größer als 0 sein');
        }
        updateData.max_capacity = data.max_capacity;
      }
      if (data.description !== undefined) updateData.description = data.description;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.category_ids !== undefined) updateData.category_ids = data.category_ids;

      const { data: updatedRoom, error } = await supabase
        .from('course_rooms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedRoom;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kursraums:', error);
      throw error;
    }
  },

  // ================================================
  // DELETE: Raum löschen
  // ================================================
  async delete(id: string): Promise<void> {
    try {
      // Prüfen ob Raum in Verwendung ist
      const { data: coursesUsingRoom, error: checkError } = await supabase
        .from('courses')
        .select('id, name')
        .eq('room_id', id)
        .limit(5);

      if (checkError) throw checkError;

      if (coursesUsingRoom && coursesUsingRoom.length > 0) {
        const courseNames = coursesUsingRoom.map(c => c.name).join(', ');
        throw new Error(`Raum wird noch von folgenden Kursen verwendet: ${courseNames}`);
      }

      const { error } = await supabase
        .from('course_rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Fehler beim Löschen des Kursraums:', error);
      throw error;
    }
  },

  // ================================================
  // Status umschalten (Aktiv/Inaktiv)
  // ================================================
  async toggleActive(id: string): Promise<CourseRoom> {
    try {
      const { data: room, error: fetchError } = await supabase
        .from('course_rooms')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data: updatedRoom, error: updateError } = await supabase
        .from('course_rooms')
        .update({ is_active: !room.is_active })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedRoom;
    } catch (error) {
      console.error('Fehler beim Umschalten des Raum-Status:', error);
      throw error;
    }
  },

  // ================================================
  // Raum-Auslastungsstatistiken
  // ================================================
  async getUsageStats(): Promise<RoomUsageStats[]> {
    try {
      const { data: stats, error } = await supabase
        .from('courses')
        .select(`
          room_id,
          course_rooms!inner (name),
          is_public
        `)
        .not('room_id', 'is', null);

      if (error) throw error;

      // Statistiken nach Raum gruppieren
      const roomStatsMap = new Map<string, {
        room_id: string;
        room_name: string;
        total_courses: number;
        active_courses: number;
      }>();

      stats?.forEach((course: any) => {
        const roomId = course.room_id;
        const roomName = course.course_rooms?.name || 'Unbekannt';
        
        if (!roomStatsMap.has(roomId)) {
          roomStatsMap.set(roomId, {
            room_id: roomId,
            room_name: roomName,
            total_courses: 0,
            active_courses: 0
          });
        }

        const roomStats = roomStatsMap.get(roomId)!;
        roomStats.total_courses++;
        
        if (course.is_public) {
          roomStats.active_courses++;
        }
      });

      // Auslastungsrate berechnen
      return Array.from(roomStatsMap.values()).map(stats => ({
        ...stats,
        utilization_percentage: stats.total_courses > 0 
          ? Math.round((stats.active_courses / stats.total_courses) * 100)
          : 0
      })).sort((a, b) => b.utilization_percentage - a.utilization_percentage);

    } catch (error) {
      console.error('Fehler beim Laden der Raum-Statistiken:', error);
      throw error;
    }
  },

  // ================================================
  // Raum-Terminplan für bestimmte Woche
  // ================================================
  async getWeeklySchedule(roomId: string, startDate: Date): Promise<{
    room: CourseRoom;
    schedule: {
      [day: string]: {
        date: string;
        courses: {
          id: string;
          name: string;
          start_time: string;
          end_time: string;
          trainer_name?: string;
          category_name?: string;
          category_color?: string;
          current_participants: number;
          max_participants: number;
        }[];
      };
    };
  }> {
    try {
      // Raum-Daten laden
      const room = await this.getById(roomId);
      if (!room) {
        throw new Error('Raum nicht gefunden');
      }

      // Wochendaten initialisieren
      const schedule: any = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayKey = date.toISOString().split('T')[0];
        
        schedule[dayKey] = {
          date: dayKey,
          courses: []
        };
      }

      // Kurse für den Raum in dieser Woche laden
      const { data: courses, error } = await supabase
        .from('course_overview')
        .select(`
          *,
          course_schedules!inner (
            day_of_week, start_time, end_time, special_date, is_active
          )
        `)
        .eq('room_id', roomId)
        .eq('course_schedules.is_active', true);

      if (error) throw error;

      // Kurse den entsprechenden Tagen zuordnen
      courses?.forEach((course: any) => {
        course.course_schedules?.forEach((scheduleItem: any) => {
          // Reguläre Kurse
          if (scheduleItem.day_of_week !== null && !scheduleItem.special_date) {
            const courseDate = new Date(startDate);
            courseDate.setDate(startDate.getDate() + scheduleItem.day_of_week - 1);
            const dayKey = courseDate.toISOString().split('T')[0];
            
            if (schedule[dayKey]) {
              schedule[dayKey].courses.push({
                id: course.id,
                name: course.name,
                start_time: scheduleItem.start_time,
                end_time: scheduleItem.end_time,
                trainer_name: course.trainer_name,
                category_name: course.category_name,
                category_color: course.category_color,
                current_participants: course.current_participants,
                max_participants: course.max_participants
              });
            }
          }
          
          // Kursspezials
          if (scheduleItem.special_date) {
            const dayKey = scheduleItem.special_date;
            if (schedule[dayKey]) {
              schedule[dayKey].courses.push({
                id: course.id,
                name: course.name,
                start_time: scheduleItem.start_time,
                end_time: scheduleItem.end_time,
                trainer_name: course.trainer_name,
                category_name: course.category_name,
                category_color: course.category_color,
                current_participants: course.current_participants,
                max_participants: course.max_participants
              });
            }
          }
        });
      });

      // Kurse nach Startzeit sortieren
      Object.keys(schedule).forEach(day => {
        schedule[day].courses.sort((a: any, b: any) => 
          a.start_time.localeCompare(b.start_time)
        );
      });

      return { room, schedule };
    } catch (error) {
      console.error('Fehler beim Laden des Raum-Wochenplans:', error);
      throw error;
    }
  },

  // ================================================
  // Standard-Räume erstellen
  // ================================================
  async createDefaults(): Promise<CourseRoom[]> {
    try {
      const defaultRooms: CreateCourseRoomData[] = [
        {
          name: 'Studio 1',
          location: 'Hauptbereich',
          max_capacity: 25,
          description: 'Großer Gruppenfitnessraum',
          is_active: true
        },
        {
          name: 'Studio 2',
          location: 'Obergeschoss',
          max_capacity: 15,
          description: 'Kleinerer Raum für Yoga und Pilates',
          is_active: true
        },
        {
          name: 'Spinning-Raum',
          location: 'Erdgeschoss',
          max_capacity: 20,
          description: 'Spezieller Raum für Spinning-Kurse',
          is_active: true
        },
        {
          name: 'Outdoor-Bereich',
          location: 'Terrasse',
          max_capacity: 30,
          description: 'Außenbereich für Outdoor-Kurse',
          is_active: true
        }
      ];

      const createdRooms: CourseRoom[] = [];

      for (const roomData of defaultRooms) {
        try {
          const newRoom = await this.create(roomData);
          createdRooms.push(newRoom);
        } catch (error) {
          // Raum existiert möglicherweise bereits, fortfahren
          console.warn(`Raum "${roomData.name}" konnte nicht erstellt werden:`, error);
        }
      }

      return createdRooms;
    } catch (error) {
      console.error('Fehler beim Erstellen der Standard-Räume:', error);
      throw error;
    }
  }

};

export default CourseRoomsAPI; 