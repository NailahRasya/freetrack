import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

async function getAuth(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

// ── GET — ambil riwayat chat ────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get("userId");

  if (!otherUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id, content, created_at, is_read, sender_id, receiver_id,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url)
    `)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST — kirim pesan ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { receiver_id, content, project_id } = body;

  if (!receiver_id || !content?.trim()) {
    return NextResponse.json({ error: "receiver_id and content are required" }, { status: 400 });
  }

  // Disabled auto-contact creation to support project-contextual chat without forcing a permanent contact relation.

  // 2. Simpan pesan
  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id,
      content: content.trim()
    })
    .select()
    .single();

  if (error) {
    console.error("Insert message error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

// ── DELETE — hapus riwayat chat ──────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get("userId");

  if (!otherUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("messages")
    .delete()
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
// ── PATCH — tandai pesan sebagai dibaca ──────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const { user } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sender_id } = body;
  if (!sender_id) return NextResponse.json({ error: "sender_id is required" }, { status: 400 });

  const adminSupabase = await createAdminClient();

  // Update semua pesan dari sender_id ke user.id menjadi is_read = true
  const { error } = await adminSupabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", sender_id)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
