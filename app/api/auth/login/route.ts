import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email, password, role: expectedRole } = await request.json();

    if (!email || !password || !expectedRole) {
      return NextResponse.json(
        { error: "Email, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Melakukan login di sisi server
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // 2. Validasi Role dari metadata user
    const actualRole = data.user.user_metadata?.role;

    if (actualRole !== expectedRole) {
      return NextResponse.json(
        { 
          error: `Akun ini terdaftar sebagai ${actualRole}. Silakan login menggunakan role yang sesuai.`,
          code: "INVALID_ROLE" 
        },
        { status: 403 }
      );
    }

    // 3. Jika cocok, kembalikan data session
    return NextResponse.json({
      session: data.session,
      user: data.user
    });

  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
