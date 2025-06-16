import supabase from '../supabaseClient';

// ================================================
// TypeScript Interfaces
// ================================================

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseCategoryData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_visible?: boolean;
}

export interface UpdateCourseCategoryData extends Partial<CreateCourseCategoryData> {
  id: string;
}

// ================================================
// Course Categories API
// ================================================

export const CourseCategoriesAPI = {

  // ================================================
  // GET: Alle Kategorien
  // ================================================
  async getAll(includeInvisible = false): Promise<CourseCategory[]> {
    try {
      let query = supabase
        .from('course_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (!includeInvisible) {
        query = query.eq('is_visible', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Fehler beim Laden der Kurskategorien:', error);
      throw error;
    }
  },

  // ================================================
  // GET: Einzelne Kategorie
  // ================================================
  async getById(id: string): Promise<CourseCategory | null> {
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Fehler beim Laden der Kurskategorie:', error);
      throw error;
    }
  },

  // ================================================
  // POST: Neue Kategorie erstellen
  // ================================================
  async create(data: CreateCourseCategoryData): Promise<CourseCategory> {
    try {
      // Validierung
      if (!data.name || data.name.trim() === '') {
        throw new Error('Kategoriename ist erforderlich');
      }

      // Nächste Sort-Order bestimmen wenn nicht angegeben
      let sortOrder = data.sort_order;
      if (sortOrder === undefined) {
        const { data: maxData, error: maxError } = await supabase
          .from('course_categories')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1);

        if (maxError) throw maxError;
        sortOrder = (maxData?.[0]?.sort_order || 0) + 1;
      }

      const categoryData = {
        name: data.name.trim(),
        description: data.description || null,
        icon: data.icon || '📚',
        color: data.color || '#3B82F6',
        sort_order: sortOrder,
        is_visible: data.is_visible !== false
      };

      const { data: newCategory, error } = await supabase
        .from('course_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return newCategory;
    } catch (error) {
      console.error('Fehler beim Erstellen der Kurskategorie:', error);
      throw error;
    }
  },

  // ================================================
  // PUT: Kategorie aktualisieren
  // ================================================
  async update(id: string, data: Partial<CreateCourseCategoryData>): Promise<CourseCategory> {
    try {
      const updateData: any = {};
      
      if (data.name !== undefined) {
        if (!data.name || data.name.trim() === '') {
          throw new Error('Kategoriename ist erforderlich');
        }
        updateData.name = data.name.trim();
      }
      
      if (data.description !== undefined) updateData.description = data.description;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
      if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;

      const { data: updatedCategory, error } = await supabase
        .from('course_categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedCategory;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kurskategorie:', error);
      throw error;
    }
  },

  // ================================================
  // DELETE: Kategorie löschen
  // ================================================
  async delete(id: string): Promise<void> {
    try {
      // Prüfen ob Kategorie in Verwendung ist
      const { data: coursesUsingCategory, error: checkError } = await supabase
        .from('courses')
        .select('id, name')
        .eq('category_id', id)
        .limit(5);

      if (checkError) throw checkError;

      if (coursesUsingCategory && coursesUsingCategory.length > 0) {
        const courseNames = coursesUsingCategory.map(c => c.name).join(', ');
        throw new Error(`Kategorie wird noch von folgenden Kursen verwendet: ${courseNames}`);
      }

      const { error } = await supabase
        .from('course_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Fehler beim Löschen der Kurskategorie:', error);
      throw error;
    }
  },

  // ================================================
  // Reihenfolge aktualisieren (Drag & Drop)
  // ================================================
  async updateSortOrder(categories: { id: string; sort_order: number }[]): Promise<void> {
    try {
      const updates = categories.map(({ id, sort_order }) =>
        supabase
          .from('course_categories')
          .update({ sort_order })
          .eq('id', id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Reihenfolge:', error);
      throw error;
    }
  },

  // ================================================
  // Sichtbarkeit umschalten
  // ================================================
  async toggleVisibility(id: string): Promise<CourseCategory> {
    try {
      const { data: category, error: fetchError } = await supabase
        .from('course_categories')
        .select('is_visible')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data: updatedCategory, error: updateError } = await supabase
        .from('course_categories')
        .update({ is_visible: !category.is_visible })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedCategory;
    } catch (error) {
      console.error('Fehler beim Umschalten der Sichtbarkeit:', error);
      throw error;
    }
  },

  // ================================================
  // Statistiken
  // ================================================
  async getStats(): Promise<{
    total: number;
    visible: number;
    hidden: number;
    mostUsed: { name: string; count: number }[];
  }> {
    try {
      // Gesamtzahl der Kategorien
      const { data: allCategories, error: allError } = await supabase
        .from('course_categories')
        .select('id, name, is_visible');

      if (allError) throw allError;

      // Verwendung pro Kategorie
      const { data: categoryUsage, error: usageError } = await supabase
        .from('courses')
        .select('category_id, course_categories(name)')
        .not('category_id', 'is', null);

      if (usageError) throw usageError;

      // Statistiken berechnen
      const total = allCategories?.length || 0;
      const visible = allCategories?.filter(c => c.is_visible).length || 0;
      const hidden = total - visible;

      // Meist verwendete Kategorien
      const usageMap = new Map<string, number>();
      categoryUsage?.forEach((course: any) => {
        if (course.course_categories?.name) {
          const count = usageMap.get(course.course_categories.name) || 0;
          usageMap.set(course.course_categories.name, count + 1);
        }
      });

      const mostUsed = Array.from(usageMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total,
        visible,
        hidden,
        mostUsed
      };
    } catch (error) {
      console.error('Fehler beim Laden der Kategorie-Statistiken:', error);
      throw error;
    }
  },

  // ================================================
  // Standard-Kategorien erstellen
  // ================================================
  async createDefaults(): Promise<CourseCategory[]> {
    try {
      const defaultCategories: CreateCourseCategoryData[] = [
        {
          name: 'Yoga',
          description: 'Entspannung und Flexibilität',
          icon: '🧘',
          color: '#8B5CF6',
          sort_order: 1
        },
        {
          name: 'HIIT',
          description: 'High Intensity Interval Training',
          icon: '💪',
          color: '#EF4444',
          sort_order: 2
        },
        {
          name: 'Pilates',
          description: 'Körperbeherrschung und Kraft',
          icon: '🤸',
          color: '#10B981',
          sort_order: 3
        },
        {
          name: 'Spinning',
          description: 'Cardio-Training auf dem Bike',
          icon: '🚴',
          color: '#F59E0B',
          sort_order: 4
        },
        {
          name: 'Zumba',
          description: 'Tanz-Fitness',
          icon: '💃',
          color: '#EC4899',
          sort_order: 5
        },
        {
          name: 'Krafttraining',
          description: 'Muskelaufbau und Stärke',
          icon: '🏋️',
          color: '#6B7280',
          sort_order: 6
        }
      ];

      const createdCategories: CourseCategory[] = [];

      for (const categoryData of defaultCategories) {
        try {
          const newCategory = await this.create(categoryData);
          createdCategories.push(newCategory);
        } catch (error) {
          // Kategorie existiert möglicherweise bereits, fortfahren
          console.warn(`Kategorie "${categoryData.name}" konnte nicht erstellt werden:`, error);
        }
      }

      return createdCategories;
    } catch (error) {
      console.error('Fehler beim Erstellen der Standard-Kategorien:', error);
      throw error;
    }
  }

};

export default CourseCategoriesAPI; 