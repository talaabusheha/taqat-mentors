-- ================================================
-- TAQAT QR ATTENDANCE MVP - SUPABASE SCHEMA & FIX PERMISSIONS
-- ================================================

-- 1. Table: students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    student_code TEXT UNIQUE NOT NULL,
    phone TEXT,
    passcode TEXT DEFAULT '1234',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure passcode column exists if table was created previously
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS passcode TEXT DEFAULT '1234';

-- 2. Table: sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL DEFAULT CURRENT_TIME,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
    qr_code_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'PRESENT', -- PRESENT, LATE
    notes TEXT,
    UNIQUE(session_id, student_id)
);

-- Disable RLS for MVP Public Access (Fixes permission denied errors)
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;

-- Grant Full Database Table Permissions to Anon & Authenticated Roles
GRANT ALL ON TABLE public.students TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.sessions TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.attendance TO anon, authenticated, postgres, service_role;

