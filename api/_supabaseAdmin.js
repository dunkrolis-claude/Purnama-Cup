// Server-side only. Holds the service_role key — this file must NEVER be sent to
// the browser (it lives under /api, which Vercel only executes server-side).
import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getAdminClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
