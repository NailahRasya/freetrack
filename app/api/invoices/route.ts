/**
 * app/api/invoices/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * REST endpoints for the Invoices resource.
 *
 *  GET   /api/invoices   → list invoices (Client: own; Freelancer: project-related)
 *  POST  /api/invoices   → auto-create invoice when milestone is approved
 *  PATCH /api/invoices   → update invoice status (e.g., mark as paid)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// ── Shared helper: resolve authenticated user ───────────────────────────────

async function getAuthContext() {
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

// ── Generate unique invoice number: INV-YYYY-NNNN ───────────────────────────

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Use admin client to bypass RLS and count all invoices for this year
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("invoice_number")
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  let nextNumber = 1;

  if (!error && data && data.length > 0) {
    const lastNumber = data[0].invoice_number;
    const lastSeq = parseInt(lastNumber.replace(prefix, ""), 10);
    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

// ── GET /api/invoices ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");
  const status = searchParams.get("status");

  let query = supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter by project if specified
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  // Filter by status if specified
  if (status && ["pending", "paid", "overdue"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, role });
}

// ── POST /api/invoices ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { milestone_id } = body as { milestone_id: string };

  if (!milestone_id) {
    return NextResponse.json(
      { error: "Missing required field: milestone_id." },
      { status: 400 }
    );
  }

  // Check if invoice already exists for this milestone
  const { data: existing } = await supabaseAdmin
    .from("invoices")
    .select("id")
    .eq("milestone_id", milestone_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { data: existing, message: "Invoice already exists for this milestone." },
      { status: 200 }
    );
  }

  // Fetch milestone data
  const { data: milestone, error: milestoneError } = await supabase
    .from("milestones")
    .select("*")
    .eq("id", milestone_id)
    .single();

  if (milestoneError || !milestone) {
    return NextResponse.json(
      { error: "Milestone tidak ditemukan." },
      { status: 404 }
    );
  }

  // Fetch project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", milestone.project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: "Project tidak ditemukan." },
      { status: 404 }
    );
  }

  // Fetch client & freelancer profiles
  const { data: clientProfile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("id", milestone.client_id)
    .single();

  const { data: freelancerProfile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, email")
    .eq("id", milestone.freelancer_id)
    .single();

  // Generate unique invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Calculate due date (14 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  // Build activity log
  const activityLog = [
    {
      action: "invoice_created",
      label: "Invoice berhasil dibuat",
      timestamp: new Date().toISOString(),
      actor: user.user_metadata?.full_name || user.email || "System",
    },
    {
      action: "milestone_approved",
      label: "Milestone disetujui",
      timestamp: new Date().toISOString(),
      actor: user.user_metadata?.full_name || user.email || "System",
    },
  ];

  // Insert invoice using admin client (bypasses RLS for insert)
  const { data: invoice, error: insertError } = await supabaseAdmin
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      project_id: milestone.project_id,
      milestone_id: milestone_id,
      client_id: milestone.client_id,
      freelancer_id: milestone.freelancer_id,
      project_title: project.title,
      milestone_title: milestone.title,
      milestone_description: milestone.description || null,
      client_name: clientProfile?.full_name || "Client",
      freelancer_name: freelancerProfile?.full_name || "Freelancer",
      client_email: clientProfile?.email || null,
      freelancer_email: freelancerProfile?.email || null,
      amount: milestone.amount || 0,
      status: "pending",
      due_date: dueDateStr,
      activity_log: activityLog,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Invoice creation error:", insertError);
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: invoice }, { status: 201 });
}

// ── PATCH /api/invoices ──────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, status } = body as { id: string; status: string };

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing required fields: id, status." },
      { status: 400 }
    );
  }

  if (!["pending", "paid", "overdue"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status. Must be 'pending', 'paid', or 'overdue'." },
      { status: 400 }
    );
  }

  // Fetch current invoice for activity log
  const { data: current } = await supabase
    .from("invoices")
    .select("activity_log, status")
    .eq("id", id)
    .single();

  if (!current) {
    return NextResponse.json(
      { error: "Invoice tidak ditemukan." },
      { status: 404 }
    );
  }

  // Build updated activity log
  const activityLog = [...(current.activity_log || [])];
  const actorName = user.user_metadata?.full_name || user.email || "System";

  if (status === "paid") {
    activityLog.push({
      action: "payment_completed",
      label: "Pembayaran selesai",
      timestamp: new Date().toISOString(),
      actor: actorName,
    });
  }

  const updatePayload: Record<string, unknown> = {
    status,
    activity_log: activityLog,
    updated_at: new Date().toISOString(),
  };

  if (status === "paid") {
    updatePayload.paid_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
