"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await window.fetch("/api/projects");
    const json = await res.json();
    if (json.error) setError(json.error);
    else setProjects(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createProject = async (payload: any) => {
    const res = await window.fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetch();
    return json.data;
  };

  const updateProject = async (id: string, payload: any) => {
    const res = await window.fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetch();
    return json.data;
  };

  const deleteProject = async (id: string) => {
    const res = await window.fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    await fetch();
  };

  return { projects, loading, error, refetch: fetch, createProject, updateProject, deleteProject };
}
