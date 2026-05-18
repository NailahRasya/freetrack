/**
 * app/api/projects/route.ts
 * GET  /api/projects  — ambil proyek milik user
 * POST /api/projects  — buat proyek baru (freelancer / client)
 * PATCH /api/projects — update proyek (negosiasi / kesepakatan)
 * DELETE /api/projects — hapus proyek
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

async function getAuth(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, role: null, supabase };
  const role: string = user.user_metadata?.role ?? "client";
  return { user, role, supabase };
}

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

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  const project_code = `PRJ-${suffix}`;

  let status = "draft";
  let final_freelancer_id = freelancer_id;
  let final_client_id = client_id;

  if (role === "client") {
    if (bodyStatus === "published") {
      status = "published";
    } else {
      status = send_to_client ? "pending_freelancer" : "draft";
    }
    final_client_id = user.id;
    final_freelancer_id = freelancer_id;
  } else {
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
    .maybeSingle();

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

export async function PATCH(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, ...payload } = body;
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  const { data: currentProject } = await supabase
    .from("projects")
    .select("status, negotiation_count")
    .eq("id", id)
    .maybeSingle();

  let nextNegoCount = currentProject?.negotiation_count || 0;
  if (payload.status && currentProject && payload.status !== currentProject.status) {
    if (
      (role === "client" && payload.status === "pending_freelancer" && currentProject.status !== "draft") ||
      (role === "freelancer" && payload.status === "pending_client")
    ) {
      nextNegoCount += 1;
    }
  }

  // "agreed" adalah sinyal kesepakatan — langsung promosikan ke "active"
  const isAgreement = payload.status === "agreed";
  if (isAgreement) {
    payload.status = "active";
  }

  let data: any;
  let error: any;

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
    if (payload.planning_context !== undefined) updateData.planning_context = payload.planning_context;
    if (payload.proposal_reason !== undefined) updateData.proposal_reason = payload.proposal_reason;

    const { data: updateRes, error: updateErr } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .eq("client_id", user.id)
      .select()
      .maybeSingle();
      
    data = updateRes;
    error = updateErr;

    if (!error && data && payload.status === "pending_freelancer" && data.freelancer_id) {
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
  } else {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (nextNegoCount > (currentProject?.negotiation_count || 0)) updateData.negotiation_count = nextNegoCount;
    if (payload.status) updateData.status = payload.status;
    if (payload.rejection_reason !== undefined) updateData.rejection_reason = payload.rejection_reason || null;
    if (payload.title) updateData.title = payload.title;
    if (payload.budget !== undefined) updateData.budget = payload.budget;
    if (payload.deadline !== undefined) updateData.deadline = payload.deadline;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.planning_context !== undefined) updateData.planning_context = payload.planning_context;
    if (payload.proposal_reason !== undefined) updateData.proposal_reason = payload.proposal_reason;

    const { data: checkProject } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    const isApplying = checkProject?.status === "published" && !checkProject.freelancer_id;

    if (isApplying) {
      const { data: newData, error: newError } = await supabase
        .from("projects")
        .insert({
          project_code: `PRJ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          title: checkProject.title,
          description: (checkProject.description || "") + `\n\n[source_id:${checkProject.id}]`,
          budget: checkProject.budget,
          deadline: checkProject.deadline,
          status: "pending_client",
          freelancer_id: user.id,
          client_id: checkProject.client_id,
          category_id: checkProject.category_id,
          required_skills: checkProject.required_skills,
        })
        .select()
        .maybeSingle();
      data = newData;
      error = newError;
    } else {
      const { data: updateRes, error: updateErr } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .eq("freelancer_id", user.id)
        .select()
        .maybeSingle();
      data = updateRes;
      error = updateErr;
    }

    if (!error && data && payload.status === "pending_client" && data.client_id) {
      const msgContent = `Halo, Klien. Saya mengajukan revisi/penawaran baru untuk proyek "${data.title}" dengan anggaran ${data.budget || "yang belum ditentukan"}. Bagaimana menurut Anda?`;
      await supabase.from("messages").insert({
        project_id: data.id,
        sender_id: user.id,
        receiver_id: data.client_id,
        content: msgContent
      });
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Gagal memproses permintaan proyek." }, { status: 404 });
  
  if (isAgreement) {
    const notifyClient = data.client_id;
    const notifyFreelancer = data.freelancer_id;

    if (notifyClient && notifyFreelancer) {
      await supabase.from("notifications").insert([
        {
          user_id: notifyClient,
          title: "Proyek Disepakati! 🎉",
          content: `Proyek "${data.title}" telah disetujui oleh kedua pihak. Mari mulai pengerjaan!`,
          type: "project_agreed",
          link: `/dashboard/projects?id=${data.id}`
        },
        {
          user_id: notifyFreelancer,
          title: "Proyek Disepakati! 🎉",
          content: `Selamat! Proyek "${data.title}" telah disetujui. Segera buat rencana milestone pengerjaan.`,
          type: "project_agreed",
          link: `/dashboard/projects?id=${data.id}`
        }
      ]);

      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Cari ID postingan asli dari deskripsi
      const sourceIdMatch = data.description?.match(/\[source_id:([a-f0-9-]+)\]/);
      const sourceId = sourceIdMatch ? sourceIdMatch[1] : null;

      if (sourceId) {
        await supabaseAdmin
          .from("projects")
          .delete()
          .eq("id", sourceId);
      } else {
        // Fallback: cari berdasarkan judul jika ID tidak ditemukan (untuk data lama)
        await supabaseAdmin
          .from("projects")
          .delete()
          .eq("client_id", data.client_id)
          .eq("status", "published")
          .ilike("title", data.title.trim());
      }
    }
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

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
