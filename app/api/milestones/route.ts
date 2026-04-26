/**
 * app/api/milestones/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * REST endpoints for the Milestones resource.
 *
 *  GET  /api/milestones          → list milestones (Freelancer: own; Client: view-only)
 *  POST /api/milestones          → create milestone (Freelancer only)
 *  PUT  /api/milestones/[id]     → update milestone (Freelancer: full; Client: status only)
 *
 * Security layers
 * ───────────────
 *  • Supabase JWT is verified server-side using the service-role client so it
 *    cannot be spoofed by manipulating cookies alone.
 *  • Role is extracted from `user_metadata.role` (set at registration time).
 *  • Payload validation via `validateClientMilestonePayload` from lib/rbac.ts.
 *  • Supabase RLS provides the final DB-level enforcement regardless of what
 *    the API layer allows.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateClientMilestonePayload } from "@/lib/rbac";

// ── Shared helper: resolve authenticated user or return 401 ───────────────────

async function getAuthContext(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, role: null, supabase };
  }

  const role: string = user.user_metadata?.role ?? "client";
  return { user, role, supabase };
}

function unauthorized(message: string, status = 403) {
  return NextResponse.json({ error: message }, { status });
}

// ── GET /api/milestones ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  // RLS on the DB table enforces row-level visibility.
  // The query below will automatically return only the rows the user may see.
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, role });
}

// ── POST /api/milestones ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  // ── Security Shield: Clients cannot create milestones ────────────────────
  if (role === "client") {
    return unauthorized(
      "Unauthorized: Clients cannot create milestone data.",
      403
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { title, description, deadline, project_id, status } = body as any;

  if (!title || !project_id) {
    return NextResponse.json(
      { error: "Missing required fields: title, project_id." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      title,
      description,
      deadline,
      project_id,
      status: status ?? "In Progress",
      payment_status: "Escrowed",
      freelancer_id: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// ── PUT /api/milestones ───────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, ...payload } = body as { id: string } & Record<string, unknown>;

  if (!id) {
    return NextResponse.json(
      { error: "Missing required field: id." },
      { status: 400 }
    );
  }

  // ── Security Shield: Client payload validation ────────────────────────────
  if (role === "client") {
    // Clients attempting direct PUT that aren't just a status change
    const validationError = validateClientMilestonePayload(payload);
    if (validationError) {
      return unauthorized(
        `Unauthorized: Clients cannot update milestone data. ${validationError}`,
        403
      );
    }

    // Extra safety: strip every key except 'status' before hitting the DB
    const safePayload: Record<string, unknown> = {};
    if ("status" in payload) safePayload.status = payload.status;

    if (Object.keys(safePayload).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("milestones")
      .update(safePayload)
      .eq("id", id)
      // RLS enforces client_id match at DB level; this is an extra guard
      .eq("client_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  // ── Freelancer: full update ───────────────────────────────────────────────
  const { data, error } = await supabase
    .from("milestones")
    .update(payload)
    .eq("id", id)
    // RLS enforces freelancer_id match at DB level
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// ── DELETE /api/milestones ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  // ── Security Shield: Clients cannot delete milestones ────────────────────
  if (role === "client") {
    return unauthorized(
      "Unauthorized: Clients cannot delete milestone data.",
      403
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required query param: id." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("freelancer_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
