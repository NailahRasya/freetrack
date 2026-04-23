import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib diisi." },
        { status: 400 }
      );
    }

    // Mengirim email reset password menggunakan Supabase Admin
    // Kita arahkan user ke /reset-password setelah klik link di email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Link reset password telah dikirim ke email kamu.",
    });
  } catch (err: any) {
    console.error("Forgot Password API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
