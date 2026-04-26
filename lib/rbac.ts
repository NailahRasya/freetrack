/**
 * lib/rbac.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Central Role-Based Access Control (RBAC) definitions for the FreeTrack
 * platform.  Import from here in both middleware and API route handlers so
 * permission rules live in a single source of truth.
 */

// ── Role types ────────────────────────────────────────────────────────────────

export type UserRole = "freelancer" | "client";

// ── Permission matrix ─────────────────────────────────────────────────────────

/**
 * Milestone fields that a Client is explicitly allowed to mutate.
 * Everything else is considered immutable from their perspective.
 */
export const CLIENT_ALLOWED_MILESTONE_FIELDS = ["status"] as const;
export type ClientAllowedMilestoneField =
  (typeof CLIENT_ALLOWED_MILESTONE_FIELDS)[number];

/**
 * Milestone status values that a Client may set.
 * Freelancers can set any status.
 */
export const CLIENT_ALLOWED_STATUS_TRANSITIONS = [
  "Approved",
  "Rejected",
] as const;
export type ClientAllowedStatus =
  (typeof CLIENT_ALLOWED_STATUS_TRANSITIONS)[number];

// ── URL patterns that are restricted for Clients ──────────────────────────────

/** Exact path segments that Clients must never access. */
export const CLIENT_BLOCKED_PATHS: RegExp[] = [
  /^\/dashboard\/milestones\/upload(\/.*)?$/,
  /^\/dashboard\/milestones\/.*\/edit(\/.*)?$/,
  /^\/dashboard\/milestones\/create(\/.*)?$/,
];

/** Where Clients are redirected when they hit a blocked path. */
export const CLIENT_FALLBACK_PATH = "/dashboard/milestones";

// ── Helper functions ──────────────────────────────────────────────────────────

/** Returns true if the given path is blocked for the Client role. */
export function isBlockedForClient(pathname: string): boolean {
  return CLIENT_BLOCKED_PATHS.some((pattern) => pattern.test(pathname));
}

/**
 * Validate a Client's milestone update payload.
 *
 * Returns an error message string if the payload is invalid, or null if OK.
 */
export function validateClientMilestonePayload(
  body: Record<string, unknown>
): string | null {
  // 1. Check for immutable fields
  const immutableFields = ["title", "description", "deadline"] as const;
  for (const field of immutableFields) {
    if (field in body) {
      return `Unauthorized: Clients cannot modify the '${field}' field.`;
    }
  }

  // 2. Enforce status whitelist
  if ("status" in body) {
    const requested = body.status as string;
    if (
      !CLIENT_ALLOWED_STATUS_TRANSITIONS.includes(
        requested as ClientAllowedStatus
      )
    ) {
      return `Unauthorized: Clients can only set status to 'Approved' or 'Rejected'. Received: '${requested}'.`;
    }
  }

  return null;
}
