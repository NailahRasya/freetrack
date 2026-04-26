/**
 * middleware.ts  (root)
 * ──────────────────────────────────────────────────────────────────────────────
 * Intercepts every non-static request and enforces:
 *  1. Session refresh  (via Supabase SSR helper)
 *  2. Authentication   (unauthenticated → /login)
 *  3. Role-based URL protection (Client blocked paths → monitoring page +
 *     a redirect query param so the UI can show a toast)
 */

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import {
  isBlockedForClient,
  CLIENT_FALLBACK_PATH,
} from "@/lib/rbac";

export default async function proxy(request: NextRequest) {
  // ── 1. Refresh Supabase session cookie ────────────────────────────────────
  const { supabase, response } = await updateSession(request);

  // ── 2. Ambil data user dari session saat ini ──────────────────────────────
  const { data: { user }, error } = await supabase.auth.getUser();

  // Jika ada error terkait session (seperti Refresh Token Not Found), 
  // kita anggap user tidak terautentikasi tanpa memunculkan error fatal.
  if (error) {
    // Error ini biasanya log otomatis ke console oleh library, 
    // tapi kita pastikan navigasi tetap aman.
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // ── 3. Dashboard authentication gate ─────────────────────────────────────
  if (path.startsWith("/dashboard")) {
    if (!user) {
      url.pathname = "/login";
      url.searchParams.delete("error"); // clean slate
      return NextResponse.redirect(url);
    }

    const userRole: string = user.user_metadata?.role ?? "client";

    // ── 3a. Existing role-specific sub-dashboard protection ───────────────
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

    // ── 3b. Milestone restricted paths (Client RBAC) ──────────────────────
    if (userRole === "client" && isBlockedForClient(path)) {
      url.pathname = CLIENT_FALLBACK_PATH;
      // The query param is read by the page to display a toast notification.
      url.searchParams.set(
        "error",
        "Access Denied: You do not have permission to modify milestones."
      );
      return NextResponse.redirect(url);
    }
  }

  // ── 4. Allow request to proceed ───────────────────────────────────────────
  return response;
}

// ── Matcher config ────────────────────────────────────────────────────────────
// Runs on all routes EXCEPT Next.js internals and static assets.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
