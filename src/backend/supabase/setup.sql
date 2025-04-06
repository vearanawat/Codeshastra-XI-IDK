-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
  user_id TEXT PRIMARY KEY,
  user_role TEXT NOT NULL,
  department TEXT,
  employee_status TEXT,
  time_in_position TEXT,
  location TEXT,
  last_security_training TEXT,
  employee_join_date TEXT,
  region TEXT,
  past_violations INTEGER DEFAULT 0
);

-- Access Requests Table
CREATE TABLE IF NOT EXISTS public.access_requests (
  request_id TEXT PRIMARY KEY,
  timestamp TIMESTAMP,
  user_id TEXT REFERENCES public.users(user_id),
  resource_type TEXT,
  resource_sensitivity TEXT,
  action TEXT,
  request_reason TEXT,
  is_approved BOOLEAN DEFAULT FALSE
);

-- IMPORTANT: For initial data loading, we need to disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests DISABLE ROW LEVEL SECURITY;

-- Grant access to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.access_requests TO anon, authenticated;

-- After data loading, you can enable RLS and set up policies:
-- Enable RLS 
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
-- CREATE POLICY "Allow read access for all users" ON public.users
--   FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users
-- CREATE POLICY "Allow full access for authenticated users" ON public.users
--   FOR ALL USING (auth.role() = 'authenticated'); 