/**
 * app/api/invoices/[id]/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * GET /api/invoices/[id] — Get single invoice detail
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Invoice tidak ditemukan." },
      { status: 404 }
    );
  }

  const role: string = user.user_metadata?.role ?? "client";

  return NextResponse.json({ data, role });
}
