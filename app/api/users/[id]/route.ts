import { createClient, createAdminClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const cleanId = id.trim();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user || user.id !== cleanId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const adminClient = await createAdminClient();

    // 2. Hapus dari tabel profiles (dan tabel lain yang cascading)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", cleanId);

    if (profileError) throw profileError;

    // 3. Hapus dari auth.users
    const { error: adminError } = await adminClient.auth.admin.deleteUser(cleanId);
    
    if (adminError) throw adminError;

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const cleanId = id.trim();

  try {
    // Coba ambil data lengkap termasuk bio
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, bio")
      .eq("id", cleanId)
      .single();

    if (error) {
      // Jika error karena kolom bio tidak ada, coba ambil tanpa bio
      if (error.message.includes("column") && error.message.includes("bio")) {
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .select("id, full_name, email, role, avatar_url")
          .eq("id", cleanId)
          .single();
        if (retryError) throw retryError;
        return NextResponse.json({ data: { ...retryData, bio: "" } });
      }
      throw error;
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const cleanId = id.trim();

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user || user.id !== cleanId) {
    let reason = "Unauthorized";
    if (authError) reason = `Auth Error: ${authError.message}`;
    else if (!user) reason = "No session found";
    else if (user.id !== cleanId) reason = `ID Mismatch: Session=${user.id}, URL=${cleanId}`;
    
    return NextResponse.json({ error: reason }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, bio } = body;

    // 2. Update Auth Metadata (for full_name)
    if (full_name) {
      await supabase.auth.updateUser({
        data: { full_name }
      });
    }

    // 3. Update Profiles table
    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    
    // Kita coba update bio jika dikirim
    if (bio !== undefined) updateData.bio = bio;

    const { data, error: profileError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", cleanId)
      .select()
      .single();

    if (profileError) {
      // Handle missing bio column error (flexible check based on user screenshot)
      const isMissingBio = profileError.message.toLowerCase().includes("column") && 
                          profileError.message.toLowerCase().includes("bio");

      if (isMissingBio) {
        console.warn("Column 'bio' is missing in profiles table. Retrying without bio.");
        delete updateData.bio;
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", cleanId)
          .select()
          .single();
        
        if (retryError) throw retryError;
        
        return NextResponse.json({ 
          data: retryData, 
          warning: "Data nama tersimpan, namun kolom 'bio' belum tersedia di database Supabase Anda. Silakan tambahkan kolom 'bio' di tabel profiles." 
        });
      }
      throw profileError;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
