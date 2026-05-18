/**
 * app/api/change-requests/[id]/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * REST endpoints for updating a specific Change Request.
 *
 *  PATCH /api/change-requests/[id] → Respond to a change request (Client only)
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

// ── PATCH /api/change-requests/[id] ──────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  if (role !== "client") {
    return unauthorized("Only clients can approve or reject change requests.", 403);
  }

  const { id: changeRequestId } = await params;

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { status, client_note } = body;

  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Allowed values: approved, rejected" },
      { status: 400 }
    );
  }

  // 1. Fetch current change request to verify ownership and get details
  const { data: changeRequest, error: fetchError } = await supabase
    .from("change_requests")
    .select("*, project:projects(title)")
    .eq("id", changeRequestId)
    .single();

  if (fetchError || !changeRequest) {
    return NextResponse.json(
      { error: "Change request not found or not accessible." },
      { status: 404 }
    );
  }

  // Double check assigned client
  if (changeRequest.client_id !== user.id) {
    return unauthorized("You are not the client assigned to this project.", 403);
  }

  if (changeRequest.status !== "pending") {
    return NextResponse.json(
      { error: `This change request has already been ${changeRequest.status}.` },
      { status: 400 }
    );
  }

  // 2. Begin update transactions
  // Update change request record status
  const { data: updatedRequest, error: updateRequestError } = await supabase
    .from("change_requests")
    .update({
      status,
      client_note: client_note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", changeRequestId)
    .select()
    .single();

  if (updateRequestError) {
    console.error("PATCH updateRequestError:", updateRequestError);
    return NextResponse.json({ error: updateRequestError.message }, { status: 500 });
  }

  // 3. If approved, apply the scope changes to the project
  if (status === "approved") {
    const projectUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (changeRequest.new_budget) {
      projectUpdates.budget = changeRequest.new_budget;
    }
    if (changeRequest.new_deadline) {
      projectUpdates.deadline = changeRequest.new_deadline;
    }

    if (Object.keys(projectUpdates).length > 1) {
      const { error: projectUpdateError } = await supabase
        .from("projects")
        .update(projectUpdates)
        .eq("id", changeRequest.project_id);

      if (projectUpdateError) {
        console.error("PATCH projectUpdateError:", projectUpdateError);
        // Continue but log error
      }
    }
  }

  // 4. Send automated message back to the freelancer
  const clientName = user.user_metadata?.full_name || "Client";
  const statusLabel = status === "approved" ? "DISETUJUI" : "DITOLAK";
  const notificationContent = `[SYSTEM] Permintaan Perubahan untuk proyek "${changeRequest.project?.title}" telah ${statusLabel} oleh ${clientName}.${
    client_note ? `\n\nCatatan Klien: "${client_note}"` : ""
  }`;

  const { error: msgError } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: changeRequest.freelancer_id,
      content: notificationContent,
      is_read: false,
    });

  if (msgError) {
    console.error("Failed to send response message to freelancer:", msgError);
  }

  return NextResponse.json({ data: updatedRequest });
}
