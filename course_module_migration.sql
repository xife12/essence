-- ================================================
-- Kursplan-Modul: Vollständige Datenbank-Migration
-- ================================================

-- Aktiviere UUID Extension falls nicht vorhanden
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Tabelle: course_categories
-- ================================================
CREATE TABLE IF NOT EXISTS public.course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📚',
    color TEXT DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- Tabelle: course_rooms
-- ================================================
CREATE TABLE IF NOT EXISTS public.course_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    max_capacity INTEGER DEFAULT 20 CHECK (max_capacity > 0),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    category_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ================================================
-- Tabelle: courses
-- ================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.course_categories(id) ON DELETE SET NULL,
    trainer_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.course_rooms(id) ON DELETE SET NULL,
    max_participants INTEGER DEFAULT 15 CHECK (max_participants > 0),
    current_participants INTEGER DEFAULT 0 CHECK (current_participants >= 0),
    schedule_plan TEXT DEFAULT 'main',
    is_public BOOLEAN DEFAULT true,
    is_special BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint: current_participants <= max_participants
    CONSTRAINT participants_limit CHECK (current_participants <= max_participants)
);

-- ================================================
-- Tabelle: course_schedules
-- ================================================
CREATE TABLE IF NOT EXISTS public.course_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sonntag, 1=Montag, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    special_date DATE, -- Für Kursspezials
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint: start_time < end_time
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    
    -- Unique Index für reguläre Kurse (verhindert Doppelbelegung)
    CONSTRAINT unique_regular_schedule UNIQUE (course_id, day_of_week, start_time) DEFERRABLE
);

-- ================================================
-- Indizes für Performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_course_categories_visible ON public.course_categories(is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_course_rooms_active ON public.course_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_public ON public.courses(is_public, is_special);
CREATE INDEX IF NOT EXISTS idx_courses_trainer ON public.courses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_day ON public.course_schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_course_schedules_special ON public.course_schedules(special_date) WHERE special_date IS NOT NULL;

-- ================================================
-- RLS Policies
-- ================================================

-- Aktiviere RLS
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS Policies: course_categories
-- ================================================
CREATE POLICY "course_categories_read_all" ON public.course_categories
    FOR SELECT USING (true);

CREATE POLICY "course_categories_write_admin" ON public.course_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid() 
            AND rolle IN ('admin', 'studioleiter')
        )
    );

-- ================================================
-- RLS Policies: course_rooms
-- ================================================
CREATE POLICY "course_rooms_read_all" ON public.course_rooms
    FOR SELECT USING (true);

CREATE POLICY "course_rooms_write_admin" ON public.course_rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid() 
            AND rolle IN ('admin', 'studioleiter')
        )
    );

-- ================================================
-- RLS Policies: courses
-- ================================================
CREATE POLICY "courses_read_public" ON public.courses
    FOR SELECT USING (is_public = true);

CREATE POLICY "courses_read_staff" ON public.courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "courses_write_admin" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid() 
            AND rolle IN ('admin', 'studioleiter')
        )
    );

CREATE POLICY "courses_write_trainer" ON public.courses
    FOR UPDATE USING (
        trainer_id = auth.uid()
    );

-- ================================================
-- RLS Policies: course_schedules
-- ================================================
CREATE POLICY "course_schedules_read_all" ON public.course_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses 
            WHERE id = course_id 
            AND (is_public = true OR EXISTS (
                SELECT 1 FROM public.staff WHERE id = auth.uid()
            ))
        )
    );

CREATE POLICY "course_schedules_write_admin" ON public.course_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid() 
            AND rolle IN ('admin', 'studioleiter')
        )
    );

-- ================================================
-- Trigger: Updated_at automatisch setzen
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_categories_updated_at 
    BEFORE UPDATE ON public.course_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_rooms_updated_at 
    BEFORE UPDATE ON public.course_rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Beispiel-Daten
-- ================================================

-- Kurskategorien
INSERT INTO public.course_categories (name, description, icon, color, sort_order) VALUES
('Yoga', 'Entspannung und Flexibilität', '🧘', '#8B5CF6', 1),
('HIIT', 'High Intensity Interval Training', '💪', '#EF4444', 2),
('Pilates', 'Körperbeherrschung und Kraft', '🤸', '#10B981', 3),
('Spinning', 'Cardio-Training auf dem Bike', '🚴', '#F59E0B', 4),
('Zumba', 'Tanz-Fitness', '💃', '#EC4899', 5),
('Krafttraining', 'Muskelaufbau und Stärke', '🏋️', '#6B7280', 6)
ON CONFLICT DO NOTHING;

-- Kursräume
INSERT INTO public.course_rooms (name, location, max_capacity, description) VALUES
('Studio 1', 'Hauptbereich', 25, 'Großer Gruppenfitnessraum'),
('Studio 2', 'Obergeschoss', 15, 'Kleinerer Raum für Yoga und Pilates'),
('Spinning-Raum', 'Erdgeschoss', 20, 'Spezieller Raum für Spinning-Kurse'),
('Outdoor-Bereich', 'Terrasse', 30, 'Außenbereich für Outdoor-Kurse')
ON CONFLICT DO NOTHING;

-- ================================================
-- Funktionen für Konflikterkennung
-- ================================================

CREATE OR REPLACE FUNCTION check_room_conflicts(
    p_course_id UUID,
    p_room_id UUID,
    p_day_of_week INTEGER,
    p_start_time TIME,
    p_end_time TIME,
    p_special_date DATE DEFAULT NULL
)
RETURNS TABLE (
    conflict_course_id UUID,
    conflict_course_name TEXT,
    conflict_time_start TIME,
    conflict_time_end TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conflict_course_id,
        c.name as conflict_course_name,
        cs.start_time as conflict_time_start,
        cs.end_time as conflict_time_end
    FROM public.courses c
    JOIN public.course_schedules cs ON c.id = cs.course_id
    WHERE c.room_id = p_room_id
    AND c.id != COALESCE(p_course_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND cs.is_active = true
    AND (
        -- Reguläre Kurse
        (p_special_date IS NULL AND cs.day_of_week = p_day_of_week AND cs.special_date IS NULL)
        OR
        -- Kursspezials
        (p_special_date IS NOT NULL AND cs.special_date = p_special_date)
    )
    AND (
        -- Zeitüberschneidung prüfen
        (p_start_time < cs.end_time AND p_end_time > cs.start_time)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_trainer_conflicts(
    p_course_id UUID,
    p_trainer_id UUID,
    p_day_of_week INTEGER,
    p_start_time TIME,
    p_end_time TIME,
    p_special_date DATE DEFAULT NULL
)
RETURNS TABLE (
    conflict_course_id UUID,
    conflict_course_name TEXT,
    conflict_room_name TEXT,
    conflict_time_start TIME,
    conflict_time_end TIME
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conflict_course_id,
        c.name as conflict_course_name,
        cr.name as conflict_room_name,
        cs.start_time as conflict_time_start,
        cs.end_time as conflict_time_end
    FROM public.courses c
    JOIN public.course_schedules cs ON c.id = cs.course_id
    LEFT JOIN public.course_rooms cr ON c.room_id = cr.id
    WHERE c.trainer_id = p_trainer_id
    AND c.id != COALESCE(p_course_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND cs.is_active = true
    AND (
        -- Reguläre Kurse
        (p_special_date IS NULL AND cs.day_of_week = p_day_of_week AND cs.special_date IS NULL)
        OR
        -- Kursspezials
        (p_special_date IS NOT NULL AND cs.special_date = p_special_date)
    )
    AND (
        -- Zeitüberschneidung prüfen
        (p_start_time < cs.end_time AND p_end_time > cs.start_time)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- Views für bessere Datenabfrage
-- ================================================

CREATE OR REPLACE VIEW course_overview AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.max_participants,
    c.current_participants,
    c.is_public,
    c.is_special,
    c.schedule_plan,
    cc.name as category_name,
    cc.icon as category_icon,
    cc.color as category_color,
    cr.name as room_name,
    cr.location as room_location,
    s.name as trainer_name,
    COALESCE(
        ROUND(
            (c.current_participants::numeric / c.max_participants::numeric) * 100, 
            0
        ), 
        0
    ) as occupancy_percentage,
    c.created_at,
    c.updated_at
FROM public.courses c
LEFT JOIN public.course_categories cc ON c.category_id = cc.id
LEFT JOIN public.course_rooms cr ON c.room_id = cr.id
LEFT JOIN auth.users au ON c.trainer_id = au.id
LEFT JOIN public.staff s ON c.trainer_id = s.id;

-- Grant permissions
GRANT SELECT ON course_overview TO authenticated;

COMMENT ON TABLE public.course_categories IS 'Kurskategorien wie Yoga, HIIT, Pilates';
COMMENT ON TABLE public.course_rooms IS 'Verfügbare Kursräume mit Kapazitäten';
COMMENT ON TABLE public.courses IS 'Haupttabelle für alle Kurse';
COMMENT ON TABLE public.course_schedules IS 'Zeitpläne für Kurse (regulär und spezial)';
COMMENT ON VIEW course_overview IS 'Vollständige Kursübersicht mit allen Informationen';

-- Migration abgeschlossen
SELECT 'Kursplan-Modul Datenbank-Migration erfolgreich abgeschlossen!' AS status; 