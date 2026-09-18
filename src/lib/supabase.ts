import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

export const SUPABASE_URL_STORAGE_KEY = 'padeldoodle_supabase_url';
export const SUPABASE_ANON_KEY_STORAGE_KEY = 'padeldoodle_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentConfigHash = '';

/**
 * Robustly sanitizes a Supabase URL:
 * - Trims whitespace
 * - Strips surrounding single or double quotes
 * - Removes accidental /rest/v1 or /auth/v1 endpoints
 * - Removes trailing slashes
 * - Resolves to origin (https://[project-ref].supabase.co)
 */
export function sanitizeSupabaseUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '').trim();

  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('supabase.co')) {
      return parsed.origin;
    }
    let pathname = parsed.pathname
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/auth\/v1\/?$/i, '')
      .replace(/\/+$/, '');
    return `${parsed.origin}${pathname}`;
  } catch {
    return url
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/auth\/v1\/?$/i, '')
      .replace(/\/+$/, '');
  }
}

/**
 * Robustly sanitizes an anon key (trims whitespace, removes quotes)
 */
export function sanitizeSupabaseKey(rawKey: string | undefined | null): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '').trim();
}

export interface ConfigSourceInfo {
  config: SupabaseConfig | null;
  source: 'env' | 'localStorage' | 'none';
  hasEnv: boolean;
}

/**
 * Safely masks a Supabase URL to obscure the project ref from public view
 * e.g. https://abcdefghijklm.supabase.co -> https://••••••••.supabase.co
 */
export function maskSupabaseUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '';
  const clean = sanitizeSupabaseUrl(rawUrl);
  try {
    const parsed = new URL(clean);
    if (parsed.hostname.endsWith('supabase.co')) {
      return 'https://••••••••.supabase.co';
    }
    return `${parsed.protocol}//••••••••${parsed.port ? `:${parsed.port}` : ''}`;
  } catch {
    return 'https://••••••••.supabase.co';
  }
}

/**
 * Safely masks an API key or PAT for display
 */
export function maskSupabaseKey(rawKey: string | undefined | null): string {
  if (!rawKey) return '';
  return '••••••••••••••••••••••••••••••••';
}

/**
 * Checks if a key looks like a Supabase Personal Access Token (starts with sbp_)
 */
export function isLikelyPAT(rawKey: string | undefined | null): boolean {
  if (!rawKey) return false;
  return rawKey.trim().startsWith('sbp_');
}

/**
 * Retrieves the Supabase configuration from localStorage (override)
 * or Vite environment variables, with full URL sanitization and source detection.
 */
export function getSupabaseConfigWithSource(): ConfigSourceInfo {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const cleanEnvUrl = sanitizeSupabaseUrl(envUrl);
  const cleanEnvKey = sanitizeSupabaseKey(envKey);
  const hasEnv = Boolean(cleanEnvUrl.startsWith('http') && cleanEnvKey);

  // Check localStorage first so users can override configuration live in browser if desired
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem(SUPABASE_URL_STORAGE_KEY);
    const localKey = localStorage.getItem(SUPABASE_ANON_KEY_STORAGE_KEY);
    if (localUrl && localKey) {
      const cleanUrl = sanitizeSupabaseUrl(localUrl);
      const cleanKey = sanitizeSupabaseKey(localKey);
      if (cleanUrl.startsWith('http') && cleanKey) {
        return {
          config: { url: cleanUrl, anonKey: cleanKey },
          source: 'localStorage',
          hasEnv,
        };
      }
    }
  }

  // Fallback to Vite environment variables from build/actions secrets
  if (hasEnv) {
    return {
      config: { url: cleanEnvUrl, anonKey: cleanEnvKey },
      source: 'env',
      hasEnv: true,
    };
  }

  return { config: null, source: 'none', hasEnv: false };
}

export function getSupabaseConfig(): SupabaseConfig | null {
  return getSupabaseConfigWithSource().config;
}

export function saveLocalSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(anonKey);
  localStorage.setItem(SUPABASE_URL_STORAGE_KEY, cleanUrl);
  localStorage.setItem(SUPABASE_ANON_KEY_STORAGE_KEY, cleanKey);
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
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
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
