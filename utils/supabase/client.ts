import { createBrowserClient } from "@supabase/ssr";

/**
 * Membuat klien Supabase untuk digunakan di sisi browser (Client Components).
 * Menggunakan variabel lingkungan publik untuk inisialisasi.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Bypass navigator.locks to prevent "Lock was released because another request stole it" console errors in hot-reloading/development environments
        lock: async (name, acquireTimeout, fn) => fn(),
      },
    }
  );
}

