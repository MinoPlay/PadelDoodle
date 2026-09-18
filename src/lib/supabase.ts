import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

export const SUPABASE_URL_STORAGE_KEY = 'padeldoodle_supabase_url';
export const SUPABASE_ANON_KEY_STORAGE_KEY = 'padeldoodle_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentConfigHash = '';

/**
 * Retrieves the Supabase configuration from environment variables (Vite)
 * or falls back to localStorage.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && envUrl.startsWith('http')) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
    };
  }

  // Fallback to localStorage (useful for local dev or manual setup before GitHub Secrets)
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem(SUPABASE_URL_STORAGE_KEY);
    const localKey = localStorage.getItem(SUPABASE_ANON_KEY_STORAGE_KEY);
    if (localUrl && localKey && localUrl.startsWith('http')) {
      return {
        url: localUrl.trim(),
        anonKey: localKey.trim(),
      };
    }
  }

  return null;
}

export function saveLocalSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_URL_STORAGE_KEY, url.trim());
  localStorage.setItem(SUPABASE_ANON_KEY_STORAGE_KEY, anonKey.trim());
  cachedClient = null; // reset client
}

export function clearLocalSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_URL_STORAGE_KEY);
  localStorage.removeItem(SUPABASE_ANON_KEY_STORAGE_KEY);
  cachedClient = null;
}

/**
 * Returns a Supabase client instance if configuration exists.
 */
export function getSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const hash = `${config.url}::${config.anonKey}`;
  if (cachedClient && currentConfigHash === hash) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    currentConfigHash = hash;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * SQL script needed to setup the Supabase table & policies.
 */
export const SUPABASE_SQL_SCHEMA = `-- 1. Create participants table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  selected_dates text[] not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.participants enable row level security;

-- 3. Create policies for public access (trust-based system)
create policy "Allow public read" 
  on public.participants for select 
  using (true);

create policy "Allow public insert" 
  on public.participants for insert 
  with check (true);

create policy "Allow public update" 
  on public.participants for update 
  using (true) 
  with check (true);

create policy "Allow public delete" 
  on public.participants for delete 
  using (true);

-- 4. Enable Realtime updates
alter publication supabase_realtime add table public.participants;
`;
