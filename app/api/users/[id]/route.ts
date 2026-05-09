import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  try {
    // Ambil data dari tabel profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
