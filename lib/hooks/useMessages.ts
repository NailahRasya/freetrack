"use client";
import { useState, useEffect, useCallback } from "react";

export function useMessages(userId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await window.fetch(`/api/messages?userId=${userId}`);
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();
    
    // Polling setiap 3 detik untuk mensimulasikan real-time
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!userId || !content.trim()) return;
    try {
      const res = await window.fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: userId, content }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      // Update local state immediately
      if (json.data) {
        setMessages((prev) => [...prev, json.data]);
      }
      return json.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const markAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      // Optimistically update local state immediately so we don't trigger multiple rapid markAsRead calls
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === userId ? { ...m, is_read: true } : m
        )
      );

      const res = await window.fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: userId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to mark messages as read on server:", errorData.error || res.statusText);
      } else {
        // Dispatch custom event to instantly sync other components (DashboardSidebar, etc.)
        window.dispatchEvent(
          new CustomEvent("messages-read", {
            detail: { senderId: userId },
          })
        );
      }
    } catch (e) {
      console.error("Failed to mark messages as read:", e);
    }
  }, [userId]);

  return { messages, loading, sendMessage, markAsRead, refetch: fetchMessages };
}
