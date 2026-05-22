import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function getAuth(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

// ── GET — ambil semua ulasan untuk freelancer tertentu ─────────────────────
export async function GET(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const freelancerId = searchParams.get("freelancerId");
  const projectId = searchParams.get("projectId");

  if (!freelancerId && !projectId) {
    return NextResponse.json({ error: "freelancerId or projectId is required" }, { status: 400 });
  }

  let query = supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at, project_id, client_id, freelancer_id,
      client:profiles!reviews_client_id_fkey(id, full_name, avatar_url),
      project:projects!reviews_project_id_fkey(id, title, project_code)
    `)
    .order("created_at", { ascending: false });

  if (freelancerId) query = query.eq("freelancer_id", freelancerId);
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ── POST — submit ulasan baru dari client ──────────────────────────────────
export async function POST(request: NextRequest) {
  const { user, supabase } = await getAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { project_id, rating, comment } = body;

  if (!project_id || !rating) {
    return NextResponse.json({ error: "project_id and rating are required" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
  }

  // 1. Ambil data proyek — pastikan user adalah client dan proyek sudah selesai
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, status, client_id, freelancer_id")
    .eq("id", project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.client_id !== user.id) {
    return NextResponse.json({ error: "Only the client of this project can submit a review" }, { status: 403 });
  }

  if (project.status !== "completed") {
    return NextResponse.json({ error: "Review can only be submitted for completed projects" }, { status: 400 });
  }

  if (!project.freelancer_id) {
    return NextResponse.json({ error: "This project has no assigned freelancer" }, { status: 400 });
  }

  // 2. Cek apakah client sudah pernah memberi ulasan untuk proyek ini
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("project_id", project_id)
    .eq("client_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You have already submitted a review for this project" }, { status: 409 });
  }

  // 3. Simpan ulasan baru
  const { data: newReview, error: insertError } = await supabase
    .from("reviews")
    .insert({
      project_id,
      client_id: user.id,
      freelancer_id: project.freelancer_id,
      rating: Math.round(rating),
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Insert review error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 4. Hitung ulang rata-rata rating freelancer dan update profil
  try {
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("freelancer_id", project.freelancer_id);

    if (allReviews && allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const averageRating = Math.round((totalRating / allReviews.length) * 100) / 100;

      await supabase
        .from("profiles")
        .update({
          average_rating: averageRating,
          total_reviews: allReviews.length,
        })
        .eq("id", project.freelancer_id);
    }
  } catch (ratingErr) {
    // Rating update gagal tidak perlu block response, ulasan sudah tersimpan
    console.error("Failed to update average rating:", ratingErr);
  }

  return NextResponse.json({ data: newReview }, { status: 201 });
}
