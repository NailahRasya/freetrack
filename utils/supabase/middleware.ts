import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Menyegarkan sesi Supabase di dalam Middleware.
 * Fungsi ini memastikan token sesi tetap valid dan cookie sinkron antara request dan response.
 */
export async function updateSession(request: NextRequest) {
  // Buat respons default
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          // Buat respons baru dengan request yang sudah di-update
          supabaseResponse = NextResponse.next({
            request,
          });
          // Update response cookies untuk dikirim ke browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Memanggil getUser() akan memicu setAll() jika sesi perlu disegarkan.
  const { data: { user } } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}

