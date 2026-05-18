/**
 * app/api/change-requests/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * REST endpoints for Change Requests.
 *
 *  GET  /api/change-requests    → list change requests for active user
 *  POST /api/change-requests   → submit a new change request (Freelancer only)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

// ── GET /api/change-requests ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  let query = supabase
    .from("change_requests")
    .select(`
      *,
      project:projects(title),
      freelancer:profiles!change_requests_freelancer_id_fkey(full_name, avatar_url),
      client:profiles!change_requests_client_id_fkey(full_name, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (role === "freelancer") {
    query = query.eq("freelancer_id", user.id);
  } else {
    query = query.eq("client_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("GET change-requests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, role });
}

// ── POST /api/change-requests ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  if (role === "client") {
    return unauthorized("Only freelancers can propose change requests.", 403);
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { project_id, reason, new_budget, new_deadline } = body;

  if (!project_id || !reason) {
    return NextResponse.json(
      { error: "Missing required fields: project_id and reason are required." },
      { status: 400 }
    );
  }

  // Verify project exists and get the client_id and title
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("title, client_id, freelancer_id")
    .eq("id", project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: "Project not found or not accessible." },
      { status: 404 }
    );
  }

  // Double check assigned freelancer
  if (project.freelancer_id !== user.id) {
    return unauthorized("You are not the freelancer assigned to this project.", 403);
  }

  // Insert change request
  const { data: changeRequest, error: insertError } = await supabase
    .from("change_requests")
    .insert({
      project_id,
      freelancer_id: user.id,
      client_id: project.client_id,
      reason,
      new_budget: new_budget || null,
      new_deadline: new_deadline || null,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    console.error("POST change-request insert error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Send an automated notification message to the client
  const freelancerName = user.user_metadata?.full_name || "Freelancer";
  const notificationContent = `[SYSTEM] ${freelancerName} telah mengajukan Permintaan Perubahan untuk proyek "${project.title}".\n\nAlasan: "${reason}"\n${new_budget ? `• Anggaran Baru: Rp ${new_budget}\n` : ""}${new_deadline ? `• Tenggat Waktu Baru: ${new_deadline}\n` : ""}\nSilakan tinjau permintaan ini di menu Permintaan Perubahan.`;

  const { error: msgError } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: project.client_id,
      content: notificationContent,
      is_read: false,
    });

  if (msgError) {
    console.error("Failed to send automated message for change request:", msgError);
  }

  return NextResponse.json({ data: changeRequest }, { status: 201 });
}
