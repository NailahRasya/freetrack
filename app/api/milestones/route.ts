/**
 * app/api/milestones/route.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * REST endpoints for the Milestones resource.
 *
 *  GET  /api/milestones          → list milestones (Freelancer: own; Client: view-only)
 *  POST /api/milestones          → create milestone (Freelancer only)
 *  PUT  /api/milestones/[id]     → update milestone (Freelancer: full; Client: status only)
 *
 * Security layers
 * ───────────────
 *  • Supabase JWT is verified server-side using the service-role client so it
 *    cannot be spoofed by manipulating cookies alone.
 *  • Role is extracted from `user_metadata.role` (set at registration time).
 *  • Payload validation via `validateClientMilestonePayload` from lib/rbac.ts.
 *  • Supabase RLS provides the final DB-level enforcement regardless of what
 *    the API layer allows.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateClientMilestonePayload } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-server";

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

async function updateProjectProgress(supabase: any, projectId: string) {
  if (!projectId) return;

  // 1. Fetch all milestones for this project
  const { data: milestones, error: fetchError } = await supabase
    .from("milestones")
    .select("status, deadline")
    .eq("project_id", projectId);

  if (fetchError || !milestones) {
    console.error("Error fetching milestones for progress update:", fetchError);
    return;
  }

  // 2. Calculate progress
  const total = milestones.length;
  if (total === 0) {
    await supabase.from("projects").update({ progress: 0 }).eq("id", projectId);
    return;
  }

  const completed = milestones.filter((m: any) => 
    ["Approved", "Disetujui", "Completed", "Waiting for Approval", "Menunggu Persetujuan"].includes(m.status)
  ).length;

  const progress = Math.round((completed / total) * 100);

  // 3. Find max deadline from milestones
  const validDeadlines = milestones
    .map((m: any) => m.deadline)
    .filter((d: any) => d && d.trim() !== "");
    
  let maxDeadline = null;
  if (validDeadlines.length > 0) {
    maxDeadline = validDeadlines.reduce((max: string, d: string) => d > max ? d : max, validDeadlines[0]);
  }

  // 4. Update projects table
  const updatePayload: any = { progress };
  if (maxDeadline) {
    updatePayload.deadline = maxDeadline;
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", projectId);

  if (updateError) {
    console.error("Error updating project progress and deadline:", updateError);
  }
}

// ── GET /api/milestones ───────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  // RLS on the DB table enforces row-level visibility.
  // The query below will automatically return only the rows the user may see.
  let query = supabase
    .from("milestones")
    .select("*")
    .order("created_at", { ascending: true });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, role });
}

// ── POST /api/milestones ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  // ── Security Shield: Clients cannot create milestones ────────────────────
  if (role === "client") {
    return unauthorized(
      "Unauthorized: Clients cannot create milestone data.",
      403
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { title, description, deadline, project_id, status, amount, client_id } = body as any;

  if (!title || !project_id) {
    return NextResponse.json(
      { error: "Missing required fields: title, project_id." },
      { status: 400 }
    );
  }

  // Resolve client_id and budget: try body first, then fallback to project data
  let finalClientId = client_id;
  let projectBudget = 0;
  
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("client_id, budget")
    .eq("id", project_id)
    .single();
  
  if (projectError) {
    console.error("Failed to fetch project details:", projectError);
  } else {
    if (!finalClientId) {
      finalClientId = project?.client_id;
    }
    if (project?.budget) {
      projectBudget = parseInt(project.budget.replace(/[^0-9]/g, ""), 10) || 0;
    }
  }

  if (!finalClientId) {
    return NextResponse.json({ error: "Gagal menghubungkan milestone ke klien. Pastikan proyek memiliki klien yang valid." }, { status: 400 });
  }

  // Budget validation: sum of milestones cannot exceed project budget
  if (projectBudget > 0) {
    const { data: existingMilestones, error: msError } = await supabase
      .from("milestones")
      .select("amount")
      .eq("project_id", project_id);

    if (!msError && existingMilestones) {
      const existingSum = existingMilestones.reduce((sum: number, m: any) => sum + (parseInt(m.amount, 10) || 0), 0);
      const newAmount = parseInt(amount, 10) || 0;
      if (existingSum + newAmount > projectBudget) {
        const fmtSum = new Intl.NumberFormat("id-ID").format(existingSum + newAmount);
        const fmtBudget = new Intl.NumberFormat("id-ID").format(projectBudget);
        return NextResponse.json({ 
          error: `Total nilai milestone (Rp ${fmtSum}) tidak boleh melebihi anggaran proyek (Rp ${fmtBudget}).` 
        }, { status: 400 });
      }
    }
  }

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      title: title?.trim(),
      description: description?.trim() || null,
      deadline: deadline || null,
      project_id,
      amount: amount || null,
      status: status ?? "In Progress",
      payment_status: "Escrowed",
      freelancer_id: user.id,
      client_id: finalClientId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update project progress
  await updateProjectProgress(supabase, project_id);

  return NextResponse.json({ data }, { status: 201 });
}

// ── PUT /api/milestones ───────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, ...payload } = body as { id: string } & Record<string, unknown>;

  if (!id) {
    return NextResponse.json(
      { error: "Missing required field: id." },
      { status: 400 }
    );
  }

  // Fetch current milestone to get project_id before update
  const { data: currentMilestone } = await supabase
    .from("milestones")
    .select("project_id")
    .eq("id", id)
    .single();

  // ── Security Shield: Client payload validation ────────────────────────────
  if (role === "client") {
    // Fetch current milestone to get current status and context
    const { data: currentMilestone } = await supabase
      .from("milestones")
      .select("status, project_id, title, freelancer_id, description, amount, client_id")
      .eq("id", id)
      .single();

    // Clients attempting direct PUT that aren't just a status change
    const validationError = validateClientMilestonePayload(payload, currentMilestone?.status);
    if (validationError) {
      return unauthorized(
        `Unauthorized: Clients cannot update milestone data. ${validationError}`,
        403
      );
    }

    const reviewNotes = payload.review_notes as string | undefined;
    const reviewChecklist = payload.checklist as any;

    // Extra safety: strip every key except 'status', 'payment_status', and 'description' before hitting the DB
    // (payment_status is needed for the client to mark a milestone as Escrowed when paying DP)
    const safePayload: Record<string, unknown> = {};
    if ("status" in payload) safePayload.status = payload.status;
    if ("payment_status" in payload) safePayload.payment_status = payload.payment_status;

    // Store review feedback in description field if milestone is rejected or revision requested
    if (currentMilestone) {
      const currentDesc = currentMilestone.description || "";
      const cleanDesc = currentDesc.split("--- REVIEW FEEDBACK ---")[0].trim();

      if (payload.status === "In Progress" || payload.status === "Rejected") {
        if (reviewNotes || reviewChecklist) {
          const delimiter = "\n\n--- REVIEW FEEDBACK ---";
          const notesPart = reviewNotes && reviewNotes.trim() ? `\nNotes: ${reviewNotes.trim()}` : "";
          const checklistPart = reviewChecklist ? `\nChecklist: ${JSON.stringify(reviewChecklist)}` : "";
          
          safePayload.description = `${cleanDesc}${delimiter}${notesPart}${checklistPart}`;
        }
      } else if (payload.status === "Approved") {
        // Clear previous review feedback on approval
        safePayload.description = cleanDesc || null;
      }
    }

    if (Object.keys(safePayload).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("milestones")
      .update(safePayload)
      .eq("id", id)
      // RLS enforces client_id match at DB level; this is an extra guard
      .eq("client_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-create chat message and in-app notification when client requests revision or rejects
    if (currentMilestone && (payload.status === "In Progress" || payload.status === "Rejected")) {
      const isRevision = payload.status === "In Progress";
      const statusTitle = isRevision ? "Ada Penyesuaian Sedikit" : "Penyerahan Pekerjaan Belum Disetujui";
      const statusEmoji = isRevision ? "😊" : "🙏";
      
      let checklistSummary = "";
      if (reviewChecklist) {
        checklistSummary = "\n\n📋 Hasil Review & Validasi:\n" +
          `${reviewChecklist.uploaded ? "✅" : "❌"} Bukti berhasil diunggah\n` +
          `${reviewChecklist.deliverable ? "✅" : "❌"} Hasil kerja sesuai milestone\n` +
          `${reviewChecklist.quality ? "✅" : "❌"} Kualitas pekerjaan sesuai harapan\n` +
          `${reviewChecklist.completeFiles ? "✅" : "❌"} Kelengkapan dokumen/berkas lengkap\n` +
          `${reviewChecklist.validProgress ? "✅" : "❌"} Progres pekerjaan valid`;
      }

      const notesSummary = reviewNotes && reviewNotes.trim() 
        ? `\n\n💬 Catatan Hangat dari Klien:\n"${reviewNotes.trim()}"`
        : "";

      const messageContent = `${statusEmoji} Halo! Ada pembaruan mengenai milestone "${currentMilestone.title}". Klien menyampaikan masukan: ${statusTitle} (${isRevision ? "Kembali ke status Dalam Pengerjaan" : "Ditolak saat ini"}). Tetap semangat ya, mari kita sesuaikan detailnya.` +
        checklistSummary +
        notesSummary;

      // Send to freelancer
      if (currentMilestone.freelancer_id) {
        // Ensure contact exists between client and freelancer
        try {
          const { data: existingContact } = await supabase
            .from("contacts")
            .select("id")
            .eq("freelancer_id", currentMilestone.freelancer_id)
            .eq("client_id", user.id)
            .maybeSingle();

          if (!existingContact) {
            const { data: freelancerProfile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", currentMilestone.freelancer_id)
              .single();
              
            await supabase.from("contacts").insert({
              freelancer_id: currentMilestone.freelancer_id,
              client_id: user.id,
              status: "accepted",
              invited_by: user.id,
              invited_email: freelancerProfile?.email || ""
            });
          }
        } catch (contactErr) {
          console.error("Auto contact check failed in milestones PUT:", contactErr);
        }

        // Insert chat message
        await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: currentMilestone.freelancer_id,
          content: messageContent,
          is_read: false
        });

        // Insert notification
        await supabase.from("notifications").insert({
          user_id: currentMilestone.freelancer_id,
          title: isRevision ? `Revisi Diminta: ${currentMilestone.title}` : `Submission Ditolak: ${currentMilestone.title}`,
          content: reviewNotes && reviewNotes.trim() 
            ? `Catatan: ${reviewNotes.trim()}`
            : `Klien meminta penyesuaian pada milestone ${currentMilestone.title}. Silakan periksa chat detail.`,
          type: isRevision ? "warning" : "error",
          link: `/dashboard/milestones?project_id=${currentMilestone.project_id}`
        });
      }
    } else if (currentMilestone && payload.status === "Approved") {
      // 1. Auto-create invoice for this milestone
      try {
        const { data: existingInvoice } = await supabaseAdmin
          .from("invoices")
          .select("id")
          .eq("milestone_id", id)
          .maybeSingle();

        if (!existingInvoice) {
          const { data: project } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("id", currentMilestone.project_id)
            .single();

          if (project) {
            const { data: clientProfile } = await supabaseAdmin
              .from("profiles")
              .select("full_name, email")
              .eq("id", currentMilestone.client_id)
              .single();

            const { data: freelancerProfile } = await supabaseAdmin
              .from("profiles")
              .select("full_name, email")
              .eq("id", currentMilestone.freelancer_id)
              .single();

            const year = new Date().getFullYear();
            const prefix = `INV-${year}-`;
            const { data: lastInvoice } = await supabaseAdmin
              .from("invoices")
              .select("invoice_number")
              .like("invoice_number", `${prefix}%`)
              .order("invoice_number", { ascending: false })
              .limit(1);

            let nextNumber = 1;
            if (lastInvoice && lastInvoice.length > 0) {
              const lastNumber = lastInvoice[0].invoice_number;
              const lastSeq = parseInt(lastNumber.replace(prefix, ""), 10);
              if (!isNaN(lastSeq)) {
                nextNumber = lastSeq + 1;
              }
            }
            const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, "0")}`;

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            const dueDateStr = dueDate.toISOString().split("T")[0];

            const activityLog = [
              {
                action: "invoice_created",
                label: "Invoice berhasil dibuat",
                timestamp: new Date().toISOString(),
                actor: user.user_metadata?.full_name || user.email || "System",
              },
              {
                action: "milestone_approved",
                label: "Milestone disetujui",
                timestamp: new Date().toISOString(),
                actor: user.user_metadata?.full_name || user.email || "System",
              },
              {
                action: "payment_completed",
                label: "Pembayaran selesai via Bank Transfer",
                timestamp: new Date().toISOString(),
                actor: "System",
                payment_method: "Bank Transfer",
              },
            ];

            await supabaseAdmin.from("invoices").insert({
              invoice_number: invoiceNumber,
              project_id: currentMilestone.project_id,
              milestone_id: id,
              client_id: currentMilestone.client_id,
              freelancer_id: currentMilestone.freelancer_id,
              project_title: project.title,
              milestone_title: currentMilestone.title,
              milestone_description: currentMilestone.description || null,
              client_name: clientProfile?.full_name || "Client",
              freelancer_name: freelancerProfile?.full_name || "Freelancer",
              client_email: clientProfile?.email || null,
              freelancer_email: freelancerProfile?.email || null,
              amount: currentMilestone.amount || 0,
              status: "paid",
              paid_at: new Date().toISOString(),
              due_date: dueDateStr,
              activity_log: activityLog,
            });
          }
        }
      } catch (invoiceErr) {
        console.error("Failed to auto-create invoice in milestone PUT:", invoiceErr);
      }

      // 2. Chat messages and notifications
      const amountStr = currentMilestone.amount 
        ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(currentMilestone.amount)
        : "sesuai kesepakatan";

      const messageContent = `🎉 Hore! Hasil pekerjaan Anda untuk milestone "${currentMilestone.title}" telah disetujui oleh Klien dan dana sebesar ${amountStr} sudah otomatis dicairkan ke saldo FreeTrack Anda! Terima kasih banyak atas dedikasi dan kerja keras luar biasa Anda. Sukses selalu ya! 🚀`;

      // Send to freelancer
      if (currentMilestone.freelancer_id) {
        // Ensure contact exists between client and freelancer
        try {
          const { data: existingContact } = await supabase
            .from("contacts")
            .select("id")
            .eq("freelancer_id", currentMilestone.freelancer_id)
            .eq("client_id", user.id)
            .maybeSingle();

          if (!existingContact) {
            const { data: freelancerProfile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", currentMilestone.freelancer_id)
              .single();
              
            await supabase.from("contacts").insert({
              freelancer_id: currentMilestone.freelancer_id,
              client_id: user.id,
              status: "accepted",
              invited_by: user.id,
              invited_email: freelancerProfile?.email || ""
            });
          }
        } catch (contactErr) {
          console.error("Auto contact check failed in milestones PUT (approval):", contactErr);
        }

        // Insert chat message
        await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: currentMilestone.freelancer_id,
          content: messageContent,
          is_read: false
        });

        // Insert notification
        await supabase.from("notifications").insert({
          user_id: currentMilestone.freelancer_id,
          title: "🎉 Dana Escrow Cair!",
          content: `Milestone "${currentMilestone.title}" disetujui. Dana sebesar ${amountStr} otomatis ditambahkan ke saldo Anda.`,
          type: "success",
          link: `/dashboard/payments?approved_notification=true&amount=${currentMilestone.amount || 0}&title=${encodeURIComponent(currentMilestone.title || "")}`
        });
      }
    }

    // Update project progress
    if (currentMilestone?.project_id) {
      await updateProjectProgress(supabase, currentMilestone.project_id);
    }

    return NextResponse.json({ data });
  }

  // ── Freelancer: full update (except payment_status ── only client can pay DP) ─
  // Strip payment_status from freelancer payload to prevent freelancers from
  // self-approving their own payments.
  const freelancerPayload = { ...payload };
  delete freelancerPayload.payment_status;

  // Budget Validation if freelancer is changing the amount
  if ("amount" in freelancerPayload && currentMilestone?.project_id) {
    const newAmount = parseInt(freelancerPayload.amount as string, 10) || 0;

    // Fetch project budget
    const { data: project } = await supabase
      .from("projects")
      .select("budget")
      .eq("id", currentMilestone.project_id)
      .single();

    if (project?.budget) {
      const projectBudget = parseInt(project.budget.replace(/[^0-9]/g, ""), 10) || 0;
      if (projectBudget > 0) {
        // Fetch all other milestones for this project (excluding current milestone)
        const { data: otherMilestones } = await supabase
          .from("milestones")
          .select("amount")
          .eq("project_id", currentMilestone.project_id)
          .neq("id", id);

        if (otherMilestones) {
          const otherSum = otherMilestones.reduce((sum: number, m: any) => sum + (parseInt(m.amount, 10) || 0), 0);
          if (otherSum + newAmount > projectBudget) {
            const fmtSum = new Intl.NumberFormat("id-ID").format(otherSum + newAmount);
            const fmtBudget = new Intl.NumberFormat("id-ID").format(projectBudget);
            return NextResponse.json({ 
              error: `Total nilai milestone (Rp ${fmtSum}) tidak boleh melebihi anggaran proyek (Rp ${fmtBudget}).` 
            }, { status: 400 });
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("milestones")
    .update(freelancerPayload)
    .eq("id", id)
    // RLS enforces freelancer_id match at DB level
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update project progress
  if (currentMilestone?.project_id) {
    await updateProjectProgress(supabase, currentMilestone.project_id);
  }

  return NextResponse.json({ data });
}

// ── DELETE /api/milestones ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const { user, role, supabase } = await getAuthContext(request);

  if (!user) {
    return unauthorized("Unauthorized: Please sign in.", 401);
  }

  // ── Security Shield: Clients cannot delete milestones ────────────────────
  if (role === "client") {
    return unauthorized(
      "Unauthorized: Clients cannot delete milestone data.",
      403
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required query param: id." },
      { status: 400 }
    );
  }

  // Fetch current milestone to get project_id before delete
  const { data: currentMilestone } = await supabase
    .from("milestones")
    .select("project_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", id)
    .eq("freelancer_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update project progress
  if (currentMilestone?.project_id) {
    await updateProjectProgress(supabase, currentMilestone.project_id);
  }

  return NextResponse.json({ success: true });
}

