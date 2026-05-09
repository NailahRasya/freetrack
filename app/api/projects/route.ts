/**
 * app/api/projects/route.ts
 * GET  /api/projects  — ambil proyek milik user
 * POST /api/projects  — buat proyek baru (freelancer / client)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function getAuth(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, role: null, supabase };
  const role: string = user.user_metadata?.role ?? "client";
  return { user, role, supabase };
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      freelancer:profiles!projects_freelancer_id_fkey(id, full_name, email, avatar_url),
      client:profiles!projects_client_id_fkey(id, full_name, email, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, client_id, freelancer_id, budget, deadline, description, send_to_client, category_id, required_skills, status: bodyStatus } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Nama proyek wajib diisi" }, { status: 400 });
  }

  // Generate project_code unik
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  const project_code = `PRJ-${suffix}`;

  let status = "draft";
  let final_freelancer_id = freelancer_id;
  let final_client_id = client_id;

  if (role === "client") {
    // Jika ada status published eksplisit (dari marketplace post)
    if (bodyStatus === "published") {
      status = "published";
    } else {
      status = send_to_client ? "pending_freelancer" : "draft";
    }
    final_client_id = user.id;
    final_freelancer_id = freelancer_id;
  } else {
    // Freelancer buat proyek
    status = send_to_client ? "pending_client" : "draft";
    final_freelancer_id = user.id;
    final_client_id = client_id;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      project_code,
      title: title.trim(),
      description: description?.trim() || null,
      budget: budget?.trim() || null,
      deadline: deadline || null,
      status,
      freelancer_id: final_freelancer_id || null,
      client_id: final_client_id || null,
      category_id: category_id || null,
      required_skills: required_skills || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (role === "client" && send_to_client && final_freelancer_id) {
    const msgContent = `Halo! Saya telah menginisiasi proyek "${title.trim()}" dengan penawaran anggaran ${budget || "yang belum ditentukan"}. Mari diskusikan detailnya di sini.`;
    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: final_freelancer_id,
      content: msgContent
    });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, ...payload } = body;
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  // Ambil state proyek saat ini untuk mengecek perubahan status (Nego count)
  const { data: currentProject } = await supabase
    .from("projects")
    .select("status, negotiation_count")
    .eq("id", id)
    .single();

  let nextNegoCount = currentProject?.negotiation_count || 0;
  if (payload.status && currentProject && payload.status !== currentProject.status) {
    if (
      (role === "client" && payload.status === "pending_freelancer" && currentProject.status !== "draft") ||
      (role === "freelancer" && payload.status === "pending_client")
    ) {
      nextNegoCount += 1;
    }
  }

  // Client update
  if (role === "client") {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (nextNegoCount > (currentProject?.negotiation_count || 0)) updateData.negotiation_count = nextNegoCount;
    if (payload.status) updateData.status = payload.status;
    if (payload.rejection_reason !== undefined) updateData.rejection_reason = payload.rejection_reason || null;
    if (payload.title) updateData.title = payload.title;
    if (payload.budget !== undefined) updateData.budget = payload.budget;
    if (payload.deadline !== undefined) updateData.deadline = payload.deadline;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.freelancer_id !== undefined) updateData.freelancer_id = payload.freelancer_id;
    if (payload.category_id !== undefined) updateData.category_id = payload.category_id;
    if (payload.required_skills !== undefined) updateData.required_skills = payload.required_skills;

    const { data, error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .eq("client_id", user.id)
      .select()
      .single();
      
    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.warn("No rows updated. Check if ID and ClientID match:", { id, client_id: user.id });
      return NextResponse.json({ error: "Proyek tidak ditemukan atau Anda bukan pemiliknya" }, { status: 404 });
    }

    if (payload.status === "pending_freelancer" && data.freelancer_id) {
      const isInitiation = currentProject?.status === "draft";
      const msgContent = isInitiation 
        ? `Halo! Saya telah menginisiasi proyek "${data.title}" dengan penawaran anggaran ${data.budget || "yang belum ditentukan"}. Mari diskusikan detailnya di sini.`
        : `Halo! Saya telah memperbarui detail/penawaran untuk proyek "${data.title}". Silakan tinjau kembali.`;
        
      await supabase.from("messages").insert({
        project_id: data.id,
        sender_id: user.id,
        receiver_id: data.freelancer_id,
        content: msgContent
      });
    }

    return NextResponse.json({ data });
  }

  // Freelancer update
  const updateData: any = { updated_at: new Date().toISOString() };
  if (nextNegoCount > (currentProject?.negotiation_count || 0)) updateData.negotiation_count = nextNegoCount;
  if (payload.status) updateData.status = payload.status;
  if (payload.rejection_reason !== undefined) updateData.rejection_reason = payload.rejection_reason || null;
  if (payload.title) updateData.title = payload.title;
  if (payload.budget !== undefined) updateData.budget = payload.budget;
  if (payload.deadline !== undefined) updateData.deadline = payload.deadline;
  if (payload.description !== undefined) updateData.description = payload.description;

  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .eq("freelancer_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (payload.status === "pending_client" && data.client_id) {
    const msgContent = `Halo, Klien. Saya mengajukan revisi/penawaran baru untuk proyek "${data.title}" dengan anggaran ${data.budget || "yang belum ditentukan"}. Bagaimana menurut Anda?`;
    await supabase.from("messages").insert({
      project_id: data.id,
      sender_id: user.id,
      receiver_id: data.client_id,
      content: msgContent
    });
  }

  return NextResponse.json({ data });
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  // Cari proyek untuk memastikan izin
  const { data: project } = await supabase.from("projects").select("freelancer_id, client_id, status").eq("id", id).single();
  if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });

  const isOwner = role === "freelancer" ? project.freelancer_id === user.id : project.client_id === user.id;
  if (!isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
