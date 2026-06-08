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

  // Auto clean-up and filter out expired agreed projects (> 60 seconds)
  const now = new Date();
  const validData = [];
  
  if (data) {
    for (const p of data) {
      const match = p.description?.match(/\[agreed_at:([^\]]+)\]/i);
      if (match) {
        const agreedAt = new Date(match[1]);
        const diffSeconds = Math.floor((now.getTime() - agreedAt.getTime()) / 1000);
        if (diffSeconds >= 60) {
          // Asynchronously delete the project in the background so database stays clean
          supabase.from("projects").delete().eq("id", p.id).then();
          continue; // Filter out from response
        }
      }
      validData.push(p);
    }
  }

  return NextResponse.json({ data: validData });
}
