-- Fix Payment System Schema - Add missing BIC column
-- Execute this to fix the "Could not find the 'bic' column" error

-- Check if payment_members table exists and add missing columns
DO $$
BEGIN
    -- Add BIC column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_members' 
        AND column_name = 'bic' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_members ADD COLUMN bic TEXT;
        RAISE NOTICE 'Added BIC column to payment_members table';
    END IF;

    -- Add other potentially missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_members' 
        AND column_name = 'mandate_reference' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_members ADD COLUMN mandate_reference TEXT;
        RAISE NOTICE 'Added mandate_reference column to payment_members table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_members' 
        AND column_name = 'payment_group_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_members ADD COLUMN payment_group_id UUID;
        RAISE NOTICE 'Added payment_group_id column to payment_members table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_members' 
        AND column_name = 'birth_date' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_members ADD COLUMN birth_date DATE;
        RAISE NOTICE 'Added birth_date column to payment_members table';
    END IF;

    -- Ensure updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_members' 
        AND column_name = 'updated_at' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_members ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to payment_members table';
    END IF;
END $$;

-- Create payment_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    payment_day INTEGER NOT NULL CHECK (payment_day BETWEEN 1 AND 28),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment groups if they don't exist
INSERT INTO public.payment_groups (name, description, payment_day) VALUES 
    ('Monatsanfang', 'Abbuchung am 1. des Monats', 1),
    ('Monatsmitte', 'Abbuchung am 15. des Monats', 15),
    ('Monatsende', 'Abbuchung am 28. des Monats', 28)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_members_member_number ON public.payment_members(member_number);
CREATE INDEX IF NOT EXISTS idx_payment_members_payment_group ON public.payment_members(payment_group_id);

-- Verify the schema is correct
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_members' 
AND table_schema = 'public'
ORDER BY ordinal_position;
