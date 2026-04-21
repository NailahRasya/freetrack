import { createClient } from "@supabase/supabase-js";

// Mengambil URL dan Service Role Key dari variabel lingkungan (sisi server)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

// Inisialisasi klien Supabase Admin (hanya untuk digunakan di Route Handlers/Middleware)
// Klien ini memiliki akses penuh (bypass RLS), jadi sangat rahasia.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
