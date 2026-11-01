import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readValue, writeValue, removeValue } from './storage';

/**
 * Supabase connection.
 *
 * Credentials are resolved in this order:
 *   1. Build-time env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — the
 *      standard approach for a deployed app.
 *   2. Runtime values the user pastes into Settings → Supabase. Stored in
 *      localStorage so you can connect without a redeploy, and included in
 *      Backup exports / the Danger Zone wipe.
 *
 * With neither set, the app still works fully offline and file uploads fall
 * back to local storage (see lib/files.ts).
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const CONFIG_KEY = 'supabaseConfig';

/** Live credentials: env vars win, then any values saved in Settings. */
export function getCredentials(): SupabaseConfig | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) return { url: envUrl, anonKey: envKey };

  const saved = readValue<SupabaseConfig | null>(CONFIG_KEY, null);
  if (saved?.url && saved?.anonKey) return saved;

  return null;
}

/** True when usable credentials exist — drives the "Connect Supabase" UI. */
export function isSupabaseConfigured(): boolean {
  return getCredentials() !== null;
}

/** Save (or with an empty url, clear) the runtime credentials from Settings. */
export function saveCredentials(url: string, anonKey: string) {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  if (!cleanUrl || !anonKey.trim()) {
    removeValue(CONFIG_KEY);
    cached = null;
    return;
  }
  writeValue(CONFIG_KEY, { url: cleanUrl, anonKey: anonKey.trim() });
  cached = null; // force a fresh client with the new credentials
}

let cached: { key: string; client: SupabaseClient } | null = null;

/** Lazily create/reuse the client so a missing config never throws at import. */
export function getSupabase(): SupabaseClient | null {
  const creds = getCredentials();
  if (!creds) return null;
  const cacheKey = `${creds.url}|${creds.anonKey}`;
  if (cached && cached.key === cacheKey) return cached.client;

  const client = createClient(creds.url, creds.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  cached = { key: cacheKey, client };
  return client;
}

/** Bucket that holds uploaded documents/images. */
export const STORAGE_BUCKET = 'vault';
