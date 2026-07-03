import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly and early rather than letting every screen silently break
  // with confusing "fetch failed" errors deep in the app.
  console.error(
    "Missing Supabase env vars. Copy .env.example to .env.local and fill in " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (find them in your Supabase " +
      "dashboard under Settings → API)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
