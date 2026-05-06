"use client";
import { useState, useEffect, useCallback } from "react";

export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [acc, pend] = await Promise.all([
      window.fetch("/api/contacts?type=accepted").then(r => r.json()),
      window.fetch("/api/contacts?type=pending").then(r => r.json()),
    ]);
    setContacts(acc.data ?? []);
    setInvitations(pend.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const inviteContact = async (invited_email: string) => {
    const res = await window.fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invited_email }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchAll();
    return json.data;
  };

  const respondInvitation = async (id: string, status: "accepted" | "rejected") => {
    const res = await window.fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetchAll();
    return json.data;
  };

  return { contacts, invitations, loading, refetch: fetchAll, inviteContact, respondInvitation };
}
