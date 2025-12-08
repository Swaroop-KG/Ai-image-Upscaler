import { createClient } from "@supabase/supabase-js";

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL/ANON_KEY not set.");
    return null;
  }

  return createClient(url, anonKey);
}


