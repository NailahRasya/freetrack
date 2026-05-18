/**
 * app/api/milestones/[id]/evidence/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * REST endpoints for Milestone Evidence resource.
 *
 *  GET    /api/milestones/[id]/evidence  → list all evidence for a milestone
 *  POST   /api/milestones/[id]/evidence  → upload evidence (file or link)
 *  DELETE /api/milestones/[id]/evidence  → soft delete evidence
 *
 * Security layers
 * ───────────────
 *  • Only assigned freelancer can upload evidence
 *  • Only project participants (client + freelancer) can view evidence
 *  • Evidence can only be uploaded when milestone status is "In Progress"
 *  • File validation: type, size, MIME type
 *  • Supabase RLS provides final DB-level enforcement
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const STORAGE_BUCKET = "milestone-evidence";

// ── Shared helper: resolve authenticated user or return 401 ───────────────────

async function getAuthContext(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, role: null, supabase };
  }

  const role: string = user.user_metadata?.role ?? "client";
  return { user, role, supabase };
}

function unauthorized(message: string, status = 403) {
  return NextResponse.json({ error: message }, { status });
}

// ── Helper: Validate URL format ───────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

// ── Helper: Get milestone with authorization check ────────────────────────────

async function getMilestoneWithAuth(
  supabase: any,
  milestoneId: string,
  userId: string,
  requireFreelancer = false
) {
  const { data: milestone, error } = await supabase
    .from("milestones")
    .select(
      `
      *,
      project:projects (
        id,
        client_id,
        freelancer_id,
        title
      )
    `
    )
    .eq("id", milestoneId)
    .single();

  if (error || !milestone) {
    return { milestone: null, error: "Milestone not found" };
  }

  const isClient = milestone.project.client_id === userId;
  const isFreelancer = milestone.project.freelancer_id === userId;
  const isParticipant = isClient || isFreelancer;

  if (requireFreelancer && !isFreelancer) {
    return {
      milestone: null,
      error: "Only the assigned freelancer can upload evidence",
    };
  }

  if (!isParticipant) {
    return {
      milestone: null,
      error: "You don't have access to this milestone",
    };
  }

  return { milestone, error: null };
}

// ── GET /api/milestones/[id]/evidence ─────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  const { id: milestoneId } = await params;

  // Check authorization
  const { milestone, error: authError } = await getMilestoneWithAuth(
    supabase,
    milestoneId,
    user.id
  );

  if (authError) {
    return unauthorized(authError, 403);
  }

  // Fetch evidence using the helper function
  const { data: evidenceData, error } = await supabase
    .from("milestone_evidence")
    .select(`
      id,
      milestone_id,
      evidence_type,
      file_url,
      file_name,
      file_size,
      file_type,
      external_link,
      link_title,
      description,
      uploaded_at,
      uploaded_by,
      profiles (
        full_name,
        role
      )
    `)
    .eq("milestone_id", milestoneId)
    .eq("is_active", true)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching evidence:", error);
    return NextResponse.json(
      { error: `Failed to fetch evidence: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }

  const evidence = (evidenceData || []).map((item: any) => ({
    id: item.id,
    milestone_id: item.milestone_id,
    evidence_type: item.evidence_type,
    file_url: item.file_url,
    file_name: item.file_name,
    file_size: item.file_size,
    file_type: item.file_type,
    external_link: item.external_link,
    link_title: item.link_title,
    description: item.description,
    uploaded_at: item.uploaded_at,
    uploader_id: item.uploaded_by,
    uploader_name: item.profiles?.full_name,
    uploader_role: item.profiles?.role,
  }));

  // Generate signed URLs for files
  const evidenceWithUrls = await Promise.all(
    (evidence || []).map(async (item: any) => {
      if (item.evidence_type === "file" && item.file_url) {
        try {
          const { data: signedUrlData } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(item.file_url, 3600); // 1 hour expiry

          return {
            ...item,
            signed_url: signedUrlData?.signedUrl || null,
          };
        } catch (err) {
          console.error("Error generating signed URL:", err);
          return item;
        }
      }
      return item;
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      evidence: evidenceWithUrls,
      milestone: {
        id: milestone.id,
        title: milestone.title,
        status: milestone.status,
        evidence_count: milestone.evidence_count || 0,
      },
    },
  });
}

// ── POST /api/milestones/[id]/evidence ────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  if (role !== "freelancer") {
    return unauthorized("Only freelancers can upload evidence", 403);
  }

  const { id: milestoneId } = await params;

  // Check authorization and milestone status
  const { milestone, error: authError } = await getMilestoneWithAuth(
    supabase,
    milestoneId,
    user.id,
    true // requireFreelancer
  );

  if (authError) {
    return unauthorized(authError, 403);
  }

  // Check milestone status
  if (milestone.status !== "In Progress") {
    return unauthorized(
      `Cannot upload evidence. Milestone status is "${milestone.status}". Evidence can only be uploaded when status is "In Progress".`,
      403
    );
  }

  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const files = formData.getAll("files") as File[];
  const linksJson = formData.get("links") as string;
  const linkTitlesJson = formData.get("linkTitles") as string;
  const description = formData.get("description") as string;

  let links: string[] = [];
  let linkTitles: string[] = [];

  try {
    if (linksJson) links = JSON.parse(linksJson);
    if (linkTitlesJson) linkTitles = JSON.parse(linkTitlesJson);
  } catch {
    return NextResponse.json(
      { error: "Invalid links or linkTitles format" },
      { status: 400 }
    );
  }

  // Validate: at least one evidence required
  if (files.length === 0 && links.length === 0) {
    return NextResponse.json(
      { error: "At least one file or link is required" },
      { status: 400 }
    );
  }

  // Validate files
  if (files.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 files allowed per submission" },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File "${file.name}" exceeds maximum size of 10MB`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File "${file.name}" has invalid type. Allowed: PNG, JPG, PDF, ZIP`,
        },
        { status: 400 }
      );
    }
  }

  // Validate links
  for (const link of links) {
    if (!isValidUrl(link)) {
      return NextResponse.json(
        { error: `Invalid URL: ${link}` },
        { status: 400 }
      );
    }
  }

  const evidenceIds: string[] = [];
  const uploadErrors: string[] = [];

  // Upload files to Supabase Storage
  for (const file of files) {
    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${milestone.project.id}/${milestoneId}/${timestamp}_${sanitizedFileName}`;

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(`Storage Upload Error for ${file.name}:`, uploadError);
        uploadErrors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      console.log(`Successfully uploaded ${file.name} to ${uploadData?.path}`);

      // Save metadata to database
      const { data: evidenceData, error: dbError } = await supabase
        .from("milestone_evidence")
        .insert({
          milestone_id: milestoneId,
          evidence_type: "file",
          file_url: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          description: description || null,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (dbError) {
        console.error(`Database Insert Error for ${file.name}:`, dbError);
        uploadErrors.push(`Failed to save ${file.name} metadata: ${dbError.message}`);
        // Try to delete the uploaded file
        if (uploadData?.path) {
          await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
        }
        continue;
      }

      evidenceIds.push(evidenceData.id);
    } catch (err) {
      console.error("Unexpected error uploading file:", err);
      uploadErrors.push(`Unexpected error uploading ${file.name}`);
    }
  }

  // Save links to database
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const linkTitle = linkTitles[i] || null;

    try {
      const { data: evidenceData, error: dbError } = await supabase
        .from("milestone_evidence")
        .insert({
          milestone_id: milestoneId,
          evidence_type: "link",
          external_link: link,
          link_title: linkTitle,
          description: description || null,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (dbError) {
        console.error(`Database Insert Error for link ${link}:`, dbError);
        uploadErrors.push(`Failed to save link: ${link}. Error: ${dbError.message}`);
        continue;
      }

      evidenceIds.push(evidenceData.id);
    } catch (err) {
      console.error("Unexpected error saving link:", err);
      uploadErrors.push(`Unexpected error saving link: ${link}`);
    }
  }

  // If no evidence was saved successfully, return error
  if (evidenceIds.length === 0) {
    return NextResponse.json(
      {
        error: "Failed to upload any evidence",
        details: uploadErrors,
      },
      { status: 500 }
    );
  }

  // Update milestone status to "Waiting for Approval"
  const { error: updateError } = await supabase
    .from("milestones")
    .update({
      status: "Waiting for Approval",
      evidence_submitted_at: new Date().toISOString(),
    })
    .eq("id", milestoneId);

  if (updateError) {
    console.error("Error updating milestone status:", updateError);
    // Don't fail the request, evidence is already uploaded
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        evidenceIds,
        milestone: {
          id: milestoneId,
          status: "Waiting for Approval",
          evidence_count: evidenceIds.length,
        },
      },
      warnings: uploadErrors.length > 0 ? uploadErrors : undefined,
    },
    { status: 201 }
  );
}

// ── DELETE /api/milestones/[id]/evidence ──────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  if (role !== "freelancer") {
    return unauthorized("Only freelancers can delete evidence", 403);
  }

  const { searchParams } = new URL(request.url);
  const evidenceId = searchParams.get("evidenceId");

  if (!evidenceId) {
    return NextResponse.json(
      { error: "Missing required query param: evidenceId" },
      { status: 400 }
    );
  }

  // Fetch evidence to check ownership and milestone status
  const { data: evidence, error: fetchError } = await supabase
    .from("milestone_evidence")
    .select(
      `
      *,
      milestone:milestones (
        id,
        status,
        project:projects (
          freelancer_id
        )
      )
    `
    )
    .eq("id", evidenceId)
    .single();

  if (fetchError || !evidence) {
    return NextResponse.json(
      { error: "Evidence not found" },
      { status: 404 }
    );
  }

  // Check ownership
  if (evidence.uploaded_by !== user.id) {
    return unauthorized("You can only delete your own evidence", 403);
  }

  // Check milestone status
  if (["Approved", "Completed"].includes(evidence.milestone.status)) {
    return unauthorized(
      "Cannot delete evidence from approved or completed milestones",
      403
    );
  }

  // Soft delete (set is_active = false)
  const { error: deleteError } = await supabase
    .from("milestone_evidence")
    .update({ is_active: false })
    .eq("id", evidenceId);

  if (deleteError) {
    console.error("Error deleting evidence:", deleteError);
    return NextResponse.json(
      { error: "Failed to delete evidence" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Evidence deleted successfully",
  });
}
