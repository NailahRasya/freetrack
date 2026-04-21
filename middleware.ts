import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 1. Update session untuk sinkronisasi cookie & auth
  const { supabase, response } = await updateSession(request);

  // 2. Ambil data user dari session saat ini
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // 3. Proteksi Rute /dashboard
  if (path.startsWith("/dashboard")) {
    // Jika tidak ada user (belum login), kembalikan ke halaman login
    if (!user) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Role yang tersimpan di metadata saat registrasi (Permanen)
    const userRole = user.user_metadata?.role;

    // Proteksi Dashboard Client: Hanya boleh diakses oleh role 'client'
    if (path.startsWith("/dashboard/client") && userRole !== "client") {
      url.pathname = "/login";
      url.searchParams.set("role", "client");
      return NextResponse.redirect(url);
    }

    // Proteksi Dashboard Freelancer: Hanya boleh diakses oleh role 'freelancer'
    if (path.startsWith("/dashboard/freelancer") && userRole !== "freelancer") {
      url.pathname = "/login";
      url.searchParams.set("role", "freelancer");
      return NextResponse.redirect(url);
    }
  }

  // Izinkan request berlanjut jika validasi lolos
  return response;
}

// Konfigurasi Matcher: Tentukan rute mana saja yang akan diproses oleh middleware ini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
