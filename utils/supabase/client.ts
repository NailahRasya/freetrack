import { createBrowserClient } from "@supabase/ssr";

/**
 * Membuat klien Supabase untuk digunakan di sisi browser (Client Components).
 * Menggunakan variabel lingkungan publik untuk inisialisasi.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

