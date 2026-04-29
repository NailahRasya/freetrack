import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat klien Supabase untuk digunakan di sisi server (Server Components, Route Handlers).
 * Menangani sinkronisasi cookie secara otomatis.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Metode `setAll` dipanggil dari Server Component.
            // Ini bisa diabaikan jika Anda memiliki middleware yang menyegarkan
            // sesi pengguna (seperti di project ini).
          }
        },
      },
    }
  );
}

