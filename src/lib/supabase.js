import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseAnonKey !== "your-anon-key-here"
);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase URL dan Anon Key belum dikonfigurasi di file .env. Silakan isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY."
  );
}

// Client initialization
const validUrl = isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co";
const validKey = isSupabaseConfigured ? supabaseAnonKey : "placeholder-key";

export const supabase = createClient(validUrl, validKey);
