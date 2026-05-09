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

async function updateProjectProgress(supabase: any, projectId: string) {
  if (!projectId) return;

  // 1. Fetch all milestones for this project
  const { data: milestones, error: fetchError } = await supabase
    .from("milestones")
    .select("status")
    .eq("project_id", projectId);

  if (fetchError || !milestones) {
    console.error("Error fetching milestones for progress update:", fetchError);
    return;
  }

  // 2. Calculate progress
  const total = milestones.length;
  if (total === 0) {
    await supabase.from("projects").update({ progress: 0 }).eq("id", projectId);
    return;
  }

  const completed = milestones.filter((m: any) => 
    ["Approved", "Disetujui", "Completed", "Waiting for Approval", "Menunggu Persetujuan"].includes(m.status)
  ).length;

  const progress = Math.round((completed / total) * 100);

  // 3. Update projects table
  const { error: updateError } = await supabase
    .from("projects")
    .update({ progress })
    .eq("id", projectId);

  if (updateError) {
    console.error("Error updating project progress:", updateError);
  }
}

// ── GET /api/milestones ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  // RLS on the DB table enforces row-level visibility.
  // The query below will automatically return only the rows the user may see.
  let query = supabase
    .from("milestones")
    .select("*")
    .order("created_at", { ascending: true });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

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

  const { title, description, deadline, project_id, status, amount, client_id } = body as any;

  if (!title || !project_id) {
    return NextResponse.json(
      { error: "Missing required fields: title, project_id." },
      { status: 400 }
    );
  }

  // Resolve client_id: try body first, then fallback to project data
  let finalClientId = client_id;
  if (!finalClientId && project_id) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", project_id)
      .single();
    
    if (projectError) {
      console.error("Failed to fetch project for client_id resolution:", projectError);
    } else {
      finalClientId = project?.client_id;
    }
  }

  if (!finalClientId) {
    return NextResponse.json({ error: "Gagal menghubungkan milestone ke klien. Pastikan proyek memiliki klien yang valid." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      title: title?.trim(),
      description: description?.trim() || null,
      deadline: deadline || null,
      project_id,
      amount: amount || null,
      status: status ?? "In Progress",
      payment_status: "Escrowed",
      freelancer_id: user.id,
      client_id: finalClientId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update project progress
  await updateProjectProgress(supabase, project_id);

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

  // Fetch current milestone to get project_id before update
  const { data: currentMilestone } = await supabase
    .from("milestones")
    .select("project_id")
    .eq("id", id)
    .single();

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

    // Update project progress
    if (currentMilestone?.project_id) {
      await updateProjectProgress(supabase, currentMilestone.project_id);
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

  // Update project progress
  if (currentMilestone?.project_id) {
    await updateProjectProgress(supabase, currentMilestone.project_id);
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

  // Fetch current milestone to get project_id before delete
  const { data: currentMilestone } = await supabase
    .from("milestones")
    .select("project_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("freelancer_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update project progress
  if (currentMilestone?.project_id) {
    await updateProjectProgress(supabase, currentMilestone.project_id);
  }

  return NextResponse.json({ success: true });
}

