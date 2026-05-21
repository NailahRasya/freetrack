/**
 * lib/generateInvoicePDF.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Client-side invoice PDF generation using jsPDF.
 * Produces a premium-styled PDF with FreeTrack branding (navy + cyan).
 */

import jsPDF from "jspdf";

interface InvoiceData {
  invoice_number: string;
  project_title: string;
  milestone_title: string;
  milestone_description?: string | null;
  client_name: string;
  freelancer_name: string;
  client_email?: string | null;
  freelancer_email?: string | null;
  amount: number;
  status: "pending" | "paid" | "overdue";
  issued_at: string;
  due_date: string;
  paid_at?: string | null;
  activity_log?: Array<{
    action: string;
    label: string;
    timestamp: string;
    actor: string;
  }>;
}

function formatRupiahPDF(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDatePDF(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function generateInvoicePDF(invoice: InvoiceData): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ── Colors ──
  const navy = [13, 27, 62] as const;
  const navyLight = [22, 37, 80] as const;
  const cyan = [6, 182, 212] as const;
  const white = [255, 255, 255] as const;
  const gray = [148, 163, 184] as const;
  const darkText = [30, 41, 59] as const;
  const lightBg = [248, 250, 252] as const;

  // ── Header Background ──
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Header gradient accent line
  doc.setFillColor(...cyan);
  doc.rect(0, 55, pageWidth, 2, "F");

  // ── Logo / Brand ──
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FreeTrack", margin, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Platform Freelance Terpercaya", margin, 29);

  // ── Invoice Title ──
  doc.setTextColor(...white);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, 22, { align: "right" });

  // Invoice number
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...cyan);
  doc.text(invoice.invoice_number, pageWidth - margin, 30, { align: "right" });

  // Status badge
  const statusText = invoice.status === "paid" ? "LUNAS" : invoice.status === "overdue" ? "JATUH TEMPO" : "MENUNGGU PEMBAYARAN";
  const statusColor = invoice.status === "paid" ? [16, 185, 129] : invoice.status === "overdue" ? [239, 68, 68] : [245, 158, 11];

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const statusWidth = doc.getTextWidth(statusText) + 12;
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - margin - statusWidth, 35, statusWidth, 8, 2, 2, "F");
  doc.setTextColor(...white);
  doc.text(statusText, pageWidth - margin - statusWidth + 6, 40.5);

  y = 70;

  // ── Date Information ──
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("Tanggal Terbit", margin + 8, y + 8);
  doc.text("Jatuh Tempo", margin + 70, y + 8);
  if (invoice.paid_at) {
    doc.text("Tanggal Bayar", margin + 140, y + 8);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(formatDatePDF(invoice.issued_at), margin + 8, y + 16);
  doc.text(formatDatePDF(invoice.due_date), margin + 70, y + 16);
  if (invoice.paid_at) {
    doc.text(formatDatePDF(invoice.paid_at), margin + 140, y + 16);
  }

  y += 26;

  // ── Parties Section ──
  // Client (Bill To)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyan);
  doc.text("DITAGIHKAN KEPADA", margin, y);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(invoice.client_name, margin, y + 8);

  if (invoice.client_email) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(invoice.client_email, margin, y + 14);
  }

  // Freelancer (From)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyan);
  doc.text("PENYEDIA JASA", pageWidth / 2 + 10, y);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(invoice.freelancer_name, pageWidth / 2 + 10, y + 8);

  if (invoice.freelancer_email) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text(invoice.freelancer_email, pageWidth / 2 + 10, y + 14);
  }

  y += 18;

  // ── Separator ──
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // ── Project & Milestone Details ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyan);
  doc.text("DETAIL PROYEK", margin, y);

  y += 6;

  // Table header
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("Deskripsi", margin + 6, y + 7);
  doc.text("Jumlah", pageWidth - margin - 6, y + 7, { align: "right" });

  y += 14;

  // Project row
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkText);
  doc.text(`Proyek: ${invoice.project_title}`, margin + 6, y);

  y += 7;

  // Milestone row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(`Milestone: ${invoice.milestone_title}`, margin + 6, y);

  y += 7;

  // Description
  if (invoice.milestone_description) {
    const descLines = doc.splitTextToSize(
      invoice.milestone_description,
      contentWidth - 80
    );
    doc.setFontSize(9);
    doc.text(descLines, margin + 6, y);
    y += descLines.length * 5;
  }

  y += 3;

  // Separator line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;

  // ── Total Section ──
  doc.setFillColor(...lightBg);
  doc.roundedRect(pageWidth / 2, y, contentWidth / 2, 20, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("Total Tagihan", pageWidth / 2 + 8, y + 8);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text(
    formatRupiahPDF(invoice.amount),
    pageWidth - margin - 6,
    y + 15,
    { align: "right" }
  );

  y += 22;

  // ── Escrow Info ──
  doc.setFillColor(6, 182, 212, 15);
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, "F");
  doc.setDrawColor(...cyan);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, "S");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyan);
  doc.text("ESCROW PROTECTION", margin + 8, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(
    "Dana dilindungi oleh sistem escrow FreeTrack. Pembayaran dilepas setelah milestone disetujui.",
    margin + 8,
    y + 12
  );

  y += 26;

  // ── Activity Timeline ──
  if (invoice.activity_log && invoice.activity_log.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...cyan);
    doc.text("RIWAYAT AKTIVITAS", margin, y);

    y += 8;

    invoice.activity_log.forEach((entry, idx) => {
      // Timeline dot
      doc.setFillColor(...cyan);
      doc.circle(margin + 4, y + 1, 1.5, "F");

      // Timeline line
      if (idx < invoice.activity_log!.length - 1) {
        doc.setDrawColor(200, 210, 220);
        doc.setLineWidth(0.3);
        doc.line(margin + 4, y + 3, margin + 4, y + 12);
      }

      // Entry text
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text(entry.label, margin + 12, y + 2);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...gray);
      const dateStr = formatDatePDF(entry.timestamp);
      doc.text(`${dateStr} · ${entry.actor}`, margin + 12, y + 7);

      y += 14;
    });
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 20;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(
    "Dokumen ini digenerate otomatis oleh sistem FreeTrack.",
    margin,
    footerY
  );
  doc.text(
    `${invoice.invoice_number} · ${formatDatePDF(invoice.issued_at)}`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  doc.setFontSize(7);
  doc.text(
    "FreeTrack — Platform Freelance Terpercaya | freetrack.id",
    margin,
    footerY + 5
  );

  // ── Save ──
  doc.save(`${invoice.invoice_number}.pdf`);
}
