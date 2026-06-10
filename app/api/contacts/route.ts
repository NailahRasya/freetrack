/**
 * app/api/contacts/route.ts
 * GET   /api/contacts  — daftar kontak yang sudah accepted (untuk dropdown klien)
 * POST  /api/contacts  — undang client via email atau hubungkan via target_id
 * PATCH /api/contacts  — client terima/tolak undangan
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

// ── GET — daftar kontak ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'accepted' | 'pending' | 'all'

  let query = supabase
    .from("contacts")
    .select(`
      *,
      freelancer:profiles!contacts_freelancer_id_fkey(id, full_name, email, avatar_url, role),
      client:profiles!contacts_client_id_fkey(id, full_name, email, avatar_url, role)
    `)
    .order("created_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("status", type);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST — undang/hubungkan kontak ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { invited_email, target_id, status: bodyStatus } = body;
  
  let targetProfile: any = null;

  if (target_id) {
    const { data: p } = await supabase.from("profiles").select("id, full_name, email, role").eq("id", target_id).single();
    if (p) targetProfile = p;
  } else if (invited_email) {
    const { data: p } = await supabase.from("profiles").select("id, full_name, email, role").eq("email", invited_email.trim().toLowerCase()).single();
    if (p) targetProfile = p;
  }

  if (!targetProfile) {
    return NextResponse.json(
      { error: "Pengguna tidak ditemukan." },
      { status: 404 }
    );
  }

  // Tentukan freelancer_id dan client_id berdasarkan role pemanggil
  let freelancer_id: string, client_id: string;
  if (role === "freelancer") {
    freelancer_id = user.id;
    client_id = targetProfile.id;
  } else {
    freelancer_id = targetProfile.id;
    client_id = user.id;
  }

  // check if contact already exists
  const { data: existingContact } = await supabase
    .from("contacts")
    .select("id, status")
    .eq("freelancer_id", freelancer_id)
    .eq("client_id", client_id)
    .maybeSingle();

  let data, error;
  if (existingContact) {
    const nextStatus = bodyStatus || "pending";
    if (existingContact.status === nextStatus || (existingContact.status === "accepted" && nextStatus === "pending")) {
      return NextResponse.json({ error: "Kontak ini sudah ada atau sudah diundang" }, { status: 409 });
    } else {
      const { data: updated, error: updateErr } = await supabase
        .from("contacts")
        .update({ 
          status: nextStatus,
          invited_by: user.id,
          invited_email: targetProfile.email
        })
        .eq("id", existingContact.id)
        .select()
        .single();
      data = updated;
      error = updateErr;
    }
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("contacts")
      .insert({
        freelancer_id,
        client_id,
        invited_by: user.id,
        invited_email: targetProfile.email,
        status: bodyStatus || "pending",
      })
      .select()
      .single();
    data = inserted;
    error = insertErr;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// ── PATCH — terima/tolak undangan ────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status } = body;
  if (!id || !["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "id dan status (accepted/rejected) wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id)
    .or(`freelancer_id.eq.${user.id},client_id.eq.${user.id}`)
    .neq("invited_by", user.id) 
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── DELETE — hapus kontak ───────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  // 1. Ambil data kontak dulu untuk mendapatkan freelancer_id & client_id
  const { data: contact } = await supabase
    .from("contacts")
    .select("freelancer_id, client_id")
    .eq("id", id)
    .single();

  if (contact) {
    // 2. Hapus semua pesan antara freelancer & client tersebut
    await supabase
      .from("messages")
      .delete()
      .or(`and(sender_id.eq.${contact.freelancer_id},receiver_id.eq.${contact.client_id}),and(sender_id.eq.${contact.client_id},receiver_id.eq.${contact.freelancer_id})`);
  }

  // 3. Hapus kontak
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .or(`freelancer_id.eq.${user.id},client_id.eq.${user.id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
