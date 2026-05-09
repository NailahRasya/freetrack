import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

  // 1. Pastikan ada koneksi kontak agar muncul di sidebar
  try {
    // Ambil data profil pengirim dan penerima untuk menentukan role
    const [{ data: sender }, { data: receiver }] = await Promise.all([
      supabase.from("profiles").select("id, role, email").eq("id", user.id).single(),
      supabase.from("profiles").select("id, role, email").eq("id", receiver_id).single()
    ]);

    if (sender && receiver) {
      let freelancer_id, client_id;
      if (sender.role === "freelancer") {
        freelancer_id = sender.id;
        client_id = receiver.id;
      } else {
        freelancer_id = receiver.id;
        client_id = sender.id;
      }

      // Cek apakah sudah ada kontak
      const { data: existingContact } = await supabase
        .from("contacts")
        .select("id")
        .eq("freelancer_id", freelancer_id)
        .eq("client_id", client_id)
        .maybeSingle();

      if (!existingContact) {
        // Buat kontak otomatis dengan status accepted
        await supabase.from("contacts").insert({
          freelancer_id,
          client_id,
          status: "accepted",
          invited_by: user.id,
          invited_email: receiver.email
        });
      }
    }
  } catch (err) {
    console.error("Failed to auto-create contact:", err);
    // Kita lanjutkan saja kirim pesan meskipun gagal buat kontak
  }

  // 2. Simpan pesan
  const messageData: any = {
    sender_id: user.id,
    receiver_id,
    content: content.trim()
  };
  
  // Hanya tambahkan project_id jika benar-benar dikirim dari client
  if (project_id) {
    messageData.project_id = project_id;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error("Insert message error:", error);
    // Jika error karena project_id tidak ada, coba lagi tanpa project_id
    if (error.message.includes("project_id") || error.code === "42703") {
      const { data: retryData, error: retryError } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id,
          content: content.trim()
        })
        .select()
        .single();
        
      if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 });
      return NextResponse.json({ data: retryData }, { status: 201 });
    }
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
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sender_id } = body;
  if (!sender_id) return NextResponse.json({ error: "sender_id is required" }, { status: 400 });

  // Update semua pesan dari sender_id ke user.id menjadi is_read = true
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", sender_id)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
