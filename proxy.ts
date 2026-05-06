/**
 * middleware.ts (root)
 * ──────────────────────────────────────────────────────────────────────────────
 * Menghalangi setiap permintaan non-statis dan menerapkan:
 *  1. Penyegaran sesi (via pembantu Supabase SSR)
 *  2. Autentikasi (tidak terautentikasi → /login)
 *  3. Perlindungan URL berbasis peran (Role-Based Access Control)
 */

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import {
  isBlockedForClient,
  CLIENT_FALLBACK_PATH,
} from "@/lib/rbac";

export default async function middleware(request: NextRequest) {
  // ── 1. Segarkan cookie sesi Supabase ──────────────────────────────────────
  const { supabase, response } = await updateSession(request);

  // ── 2. Ambil data user dari sesi saat ini ──────────────────────────────
  const { data: { user }, error } = await supabase.auth.getUser();

  // Jika ada error terkait sesi (seperti Refresh Token Not Found), 
  // kita anggap user tidak terautentikasi tanpa memunculkan error fatal.
  if (error) {
    // Error ini biasanya log otomatis ke console oleh library, 
    // tapi kita pastikan navigasi tetap aman.
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // ── 3. Gerbang autentikasi Dashboard ─────────────────────────────────────
  if (path.startsWith("/dashboard")) {
    if (!user) {
      url.pathname = "/login";
      url.searchParams.delete("error"); // bersihkan parameter error jika ada
      return NextResponse.redirect(url);
    }

    const userRole: string = user.user_metadata?.role ?? "client";

    // ── 3a. Perlindungan sub-dashboard spesifik peran ───────────────────────
    if (path.startsWith("/dashboard/client") && userRole !== "client") {
      url.pathname = "/login";
      url.searchParams.set("role", "client");
      return NextResponse.redirect(url);
    }

    if (
      path.startsWith("/dashboard/freelancer") &&
      userRole !== "freelancer"
    ) {
      url.pathname = "/login";
      url.searchParams.set("role", "freelancer");
      return NextResponse.redirect(url);
    }

    // ── 3b. Pembatasan jalur Milestone (RBAC Client) ──────────────────────
    if (userRole === "client" && isBlockedForClient(path)) {
      url.pathname = CLIENT_FALLBACK_PATH;
      // Parameter query dibaca oleh halaman untuk menampilkan notifikasi toast.
      url.searchParams.set(
        "error",
        "Akses Ditolak: Anda tidak memiliki izin untuk mengubah milestone."
      );
      return NextResponse.redirect(url);
    }
  }

  // ── 4. Izinkan permintaan berlanjut ───────────────────────────────────────────
  return response;
}

// ── Konfigurasi Matcher ───────────────────────────────────────────────────────
// Berjalan pada semua rute KECUALI internal Next.js dan aset statis.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

