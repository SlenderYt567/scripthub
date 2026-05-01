-- ==============================================================================
-- DATABASE SCHEMA FOR SCRIPT HUB
-- Copy and paste this into your new Supabase project's SQL Editor
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  youtube_url TEXT,
  discord_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. ADMIN USERS TABLE
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Owner', 'Admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin users are viewable by everyone" ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Admins can insert" ON public.admin_users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete" ON public.admin_users FOR DELETE USING (auth.role() = 'authenticated');

-- 3. SUPPORTED GAMES TABLE
CREATE TABLE public.supported_games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.supported_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Supported games viewable by everyone" ON public.supported_games FOR SELECT USING (true);
CREATE POLICY "Only authenticated can insert games" ON public.supported_games FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated can delete games" ON public.supported_games FOR DELETE USING (auth.role() = 'authenticated');

-- 4. SCRIPTS TABLE
CREATE TABLE public.scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  game_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  author TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  raw_link TEXT,
  shortener_link TEXT,
  verified BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  key_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scripts are viewable by everyone." ON public.scripts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create scripts." ON public.scripts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update scripts." ON public.scripts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete scripts." ON public.scripts FOR DELETE USING (auth.role() = 'authenticated');

-- 5. TASKS TABLE (For the key system / unlock steps)
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks are viewable by everyone." ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tasks." ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update tasks." ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete tasks." ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');

-- 6. EXECUTORS TABLE
CREATE TABLE public.executors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  download_url TEXT,
  status TEXT DEFAULT 'Working',
  platform TEXT DEFAULT 'Windows',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.executors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Executors are viewable by everyone." ON public.executors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can modify executors." ON public.executors FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================
-- You must also create a storage bucket called "images" in the Supabase Storage UI.
-- Make sure to set it to "Public".
