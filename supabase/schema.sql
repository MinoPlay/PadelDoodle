-- ==============================================================================
-- PadelDoodle Supabase Schema & Security Setup
-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create the participants table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  selected_dates text[] not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.participants enable row level security;

-- 3. Create trust-based public policies
-- (Since this is a trust-based poll without individual logins)

-- Allow anyone to read all participants' votes
create policy "Allow public read" 
  on public.participants for select 
  using (true);

-- Allow anyone to cast a vote
create policy "Allow public insert" 
  on public.participants for insert 
  with check (true);

-- Allow anyone to modify selections (trust-based system)
create policy "Allow public update" 
  on public.participants for update 
  using (true) 
  with check (true);

-- Allow anyone to remove a participant if needed
create policy "Allow public delete" 
  on public.participants for delete 
  using (true);

-- 4. Enable Realtime updates so all connected users see votes instantly
alter publication supabase_realtime add table public.participants;
