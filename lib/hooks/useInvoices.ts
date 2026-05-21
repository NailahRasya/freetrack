/**
 * lib/hooks/useInvoices.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * React hook for fetching and managing invoice data.
 */

import { useState, useEffect, useCallback } from "react";

export interface Invoice {
  id: string;
  invoice_number: string;
  project_id: string;
  milestone_id: string;
  client_id: string;
  freelancer_id: string;
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
  created_at: string;
  updated_at: string;
}

export function useInvoices(projectId?: string) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = projectId
        ? `/api/invoices?project_id=${projectId}`
        : "/api/invoices";
      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch invoices");
      }

      setInvoices(json.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("useInvoices error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const refresh = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refresh };
}
