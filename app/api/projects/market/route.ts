import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ambil profile user untuk mendapatkan skills (untuk filtering)
  const { data: profile } = await supabase
    .from("profiles")
    .select("skills, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Fallback or log if no profile found
  }

  // Fetch projects with status 'published'
  // Kita join dengan onboarding_client untuk mendapatkan kategori (backwards compatibility)
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      client:profiles!projects_client_id_fkey(id, full_name, email, avatar_url),
      onboarding:onboarding_client!onboarding_client_draft_project_id_fkey(project_categories, required_skills, project_type)
    `)
    .or(`status.eq.published,and(client_id.eq.${user.id},status.eq.draft)`)
    .is("freelancer_id", null) 
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filtering berdasarkan kategori (Opsional: bisa dilakukan di klien atau server)
  // Di sini kita biarkan klien yang memfilter agar lebih fleksibel (atau bisa dikirim semuanya dulu)
  
  return NextResponse.json({ data });
}
