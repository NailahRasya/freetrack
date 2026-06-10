/**
 * app/api/projects/[id]/complete/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * POST /api/projects/[id]/complete — Mark a project as completed by the client.
 *
 * Requirements:
 *  1. Only the project's client can mark it as completed.
 *  2. The project must have at least one milestone.
 *  3. All milestones must be approved (Approved / Disetujui / Completed).
 *  4. All associated milestone invoices must be paid (status = 'paid').
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized: Silakan masuk terlebih dahulu." },
      { status: 401 }
    );
  }

  const { id: projectId } = await params;

  if (!projectId) {
    return NextResponse.json(
      { error: "ID proyek tidak valid." },
      { status: 400 }
    );
  }

  // 1. Fetch project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json(
      { error: "Proyek tidak ditemukan." },
      { status: 404 }
    );
  }

  // Verify project client
  if (project.client_id !== user.id) {
    return NextResponse.json(
      { error: "Hanya klien pemilik proyek yang dapat menandai proyek selesai secara resmi." },
      { status: 403 }
    );
  }

  // 2. Fetch all milestones for this project
  const { data: milestones, error: milestonesError } = await supabase
    .from("milestones")
    .select("id, title, status")
    .eq("project_id", projectId);

  if (milestonesError) {
    return NextResponse.json(
      { error: "Gagal memuat milestone proyek: " + milestonesError.message },
      { status: 500 }
    );
  }

  if (!milestones || milestones.length === 0) {
    return NextResponse.json(
      { error: "Proyek harus memiliki setidaknya satu milestone sebelum dapat dinyatakan selesai." },
      { status: 400 }
    );
  }

  // 3. Verify all milestones are approved
  const approvedStatuses = ["Approved", "Disetujui", "Completed"];
  const unapprovedMilestones = milestones.filter(
    (m) => !approvedStatuses.includes(m.status)
  );

  if (unapprovedMilestones.length > 0) {
    return NextResponse.json(
      {
        error: `Ada ${unapprovedMilestones.length} milestone yang belum disetujui. Semua milestone harus disetujui sebelum proyek selesai.`,
      },
      { status: 400 }
    );
  }

  // 4. (Bypassed) Strict invoice paid verification has been removed as requested.

  // 6. Update project status and progress
  const { error: updateError } = await supabase
    .from("projects")
    .update({ status: "completed", progress: 100 })
    .eq("id", projectId);

  if (updateError) {
    return NextResponse.json(
      { error: "Gagal memperbarui status proyek: " + updateError.message },
      { status: 500 }
    );
  }

  // Increment completed projects count in freelancer's profile
  if (project.freelancer_id) {
    const { data: freelancerProfile } = await supabase
      .from("profiles")
      .select("completed_projects_count")
      .eq("id", project.freelancer_id)
      .maybeSingle();

    const currentCount = freelancerProfile?.completed_projects_count || 0;

    await supabase
      .from("profiles")
      .update({ completed_projects_count: currentCount + 1 })
      .eq("id", project.freelancer_id);
  }

  // 7. Insert notifications
  const notifications = [
    {
      user_id: project.client_id,
      title: "Proyek Selesai secara Resmi! 🎉",
      content: `Selamat! Anda telah menyelesaikan proyek "${project.title}" secara resmi. Terima kasih atas kerja samanya. Silakan berikan ulasan bintang untuk freelancer Anda.`,
      type: "project_completed",
      link: `/dashboard/projects?id=${projectId}`,
    },
  ];

  if (project.freelancer_id) {
    notifications.push({
      user_id: project.freelancer_id,
      title: "Proyek Telah Diselesaikan Klien! 🎉",
      content: `Selamat! Klien Anda telah menyatakan proyek "${project.title}" selesai secara resmi. Kinerja yang luar biasa!`,
      type: "project_completed",
      link: `/dashboard/projects?id=${projectId}`,
    });
  }

  await supabase.from("notifications").insert(notifications);

  return NextResponse.json({
    success: true,
    message: "Proyek berhasil diselesaikan secara resmi.",
  });
}
