/**
 * lib/rbac.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Definisi Central Role-Based Access Control (RBAC) untuk platform FreeTrack.
 * Impor dari sini baik di middleware maupun handler route API agar aturan
 * izin tetap berada dalam satu sumber kebenaran (source of truth).
 */

// ── Tipe Role ────────────────────────────────────────────────────────────────

export type UserRole = "freelancer" | "client";

// ── Matriks Izin ─────────────────────────────────────────────────────────────

/**
 * Field Milestone yang diizinkan untuk diubah oleh Client secara eksplisit.
 * Selain ini dianggap tidak dapat diubah (immutable) dari perspektif mereka.
 */
export const CLIENT_ALLOWED_MILESTONE_FIELDS = ["status"] as const;
export type ClientAllowedMilestoneField =
  (typeof CLIENT_ALLOWED_MILESTONE_FIELDS)[number];

/**
 * Nilai status Milestone yang boleh diatur oleh Client.
 * Freelancer dapat mengatur status apa pun.
 */
export const CLIENT_ALLOWED_STATUS_TRANSITIONS = [
  "Approved",
  "Rejected",
] as const;
export type ClientAllowedStatus =
  (typeof CLIENT_ALLOWED_STATUS_TRANSITIONS)[number];

// ── Pola URL yang dibatasi untuk Client ──────────────────────────────────────

/** Segmen path eksak yang tidak boleh diakses oleh Client. */
export const CLIENT_BLOCKED_PATHS: RegExp[] = [
  /^\/dashboard\/milestones\/upload(\/.*)?$/,
  /^\/dashboard\/milestones\/.*\/edit(\/.*)?$/,
  /^\/dashboard\/milestones\/create(\/.*)?$/,
];

/** Path tujuan pengalihan (redirect) saat Client mencoba mengakses path terlarang. */
export const CLIENT_FALLBACK_PATH = "/dashboard/milestones";

// ── Fungsi Pembantu (Helper) ──────────────────────────────────────────────────

/** Mengembalikan true jika path yang diberikan diblokir untuk role Client. */
export function isBlockedForClient(pathname: string): boolean {
  return CLIENT_BLOCKED_PATHS.some((pattern) => pattern.test(pathname));
}

/**
 * Validasi payload pembaruan milestone dari Client.
 *
 * Mengembalikan pesan kesalahan (string) jika payload tidak valid, atau null jika OK.
 */
export function validateClientMilestonePayload(
  body: Record<string, unknown>
): string | null {
  // 1. Periksa field yang tidak boleh diubah (immutable)
  const immutableFields = ["title", "description", "deadline"] as const;
  for (const field of immutableFields) {
    if (field in body) {
      return `Unauthorized: Client tidak dapat mengubah field '${field}'.`;
    }
  }

  // 2. Terapkan whitelist status
  if ("status" in body) {
    const requested = body.status as string;
    if (
      !CLIENT_ALLOWED_STATUS_TRANSITIONS.includes(
        requested as ClientAllowedStatus
      )
    ) {
      return `Unauthorized: Client hanya dapat mengatur status ke 'Approved' atau 'Rejected'. Menerima: '${requested}'.`;
    }
  }

  return null;
}

