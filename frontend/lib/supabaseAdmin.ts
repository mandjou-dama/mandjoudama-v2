import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the service-role key, for server code only (it bypasses row-level
 * security). The browser keeps using the public key in lib/supabase.ts, which can only read.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
