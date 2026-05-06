/**
 * app/api/contacts/route.ts
 * GET   /api/contacts  — daftar kontak yang sudah accepted (untuk dropdown klien)
 * POST  /api/contacts  — undang client via email
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

// ── POST — undang client ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { invited_email } = body;
  if (!invited_email?.trim()) {
    return NextResponse.json({ error: "Email klien wajib diisi" }, { status: 400 });
  }

  // Cari user dengan email tersebut di profiles
  const { data: targetProfile, error: findError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("email", invited_email.trim().toLowerCase())
    .single();

  if (findError || !targetProfile) {
    return NextResponse.json(
      { error: "Pengguna dengan email tersebut tidak ditemukan. Pastikan mereka sudah terdaftar." },
      { status: 404 }
    );
  }

  // Tentukan freelancer_id dan client_id berdasarkan role pemanggil
  let freelancer_id: string, client_id: string;
  if (role === "freelancer") {
    if (targetProfile.role !== "client") {
      return NextResponse.json({ error: "Target harus berperan sebagai client" }, { status: 400 });
    }
    freelancer_id = user.id;
    client_id = targetProfile.id;
  } else {
    if (targetProfile.role !== "freelancer") {
      return NextResponse.json({ error: "Target harus berperan sebagai freelancer" }, { status: 400 });
    }
    freelancer_id = targetProfile.id;
    client_id = user.id;
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      freelancer_id,
      client_id,
      invited_by: user.id,
      invited_email: invited_email.trim().toLowerCase(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Kontak ini sudah ada atau sudah diundang" }, { status: 409 });
    }
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
    // hanya penerima undangan yang bisa update
    .or(`freelancer_id.eq.${user.id},client_id.eq.${user.id}`)
    .neq("invited_by", user.id) // tidak bisa accept undangan sendiri
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

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .or(`freelancer_id.eq.${user.id},client_id.eq.${user.id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
