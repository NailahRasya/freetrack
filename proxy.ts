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
  // ── 1. Segarkan cookie sesi Supabase & ambil user ─────────────────────────
  // updateSession kini menangani sinkronisasi cookie secara aman.
  const { supabaseResponse, user } = await updateSession(request);

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // ── 2. Gerbang autentikasi Dashboard ─────────────────────────────────────
  if (path.startsWith("/dashboard")) {
    if (!user) {
      url.pathname = "/login";
      url.searchParams.delete("error"); // bersihkan parameter error jika ada
      return NextResponse.redirect(url);
    }

    const userRole: string = user.user_metadata?.role ?? "client";

    // ── 2a. Perlindungan sub-dashboard spesifik peran ───────────────────────
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

    // ── 2b. Pembatasan jalur Milestone (RBAC Client) ──────────────────────
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

  // ── 3. Izinkan permintaan berlanjut dengan cookie yang sudah diperbarui ────────
  return supabaseResponse;
}

// ── Konfigurasi Matcher ───────────────────────────────────────────────────────
// Berjalan pada semua rute KECUALI internal Next.js, API, dan aset statis (gambar, dll).
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
