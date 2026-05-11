"use client";

import { motion } from "framer-motion";
import { Plus, Check, CreditCard, UserPlus, FileText } from "lucide-react";

/**
 * Data dummy untuk riwayat aktivitas terbaru dalam platform.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "../../dashboard/layout";

/**
 * Komponen ActivityTimeline menampilkan log kronologis dari peristiwa penting proyek.
 */
export default function ActivityTimeline() {
  const [activities, setActivities] = useState<any[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) throw error;

        if (data) {
          const mapped = data.map(n => {
            const typeMap: any = {
              "project_agreed": { icon: Check, color: "var(--accent)" },
              "milestone_created": { icon: Plus, color: "var(--cyan)" },
              "payment_released": { icon: CreditCard, color: "var(--primary-light)" },
              "project_updated": { icon: FileText, color: "var(--warning)" },
            };
            const t = typeMap[n.type] || { icon: FileText, color: "var(--warning)" };

            return {
              id: n.id,
              title: n.title,
              desc: n.content,
              time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              icon: t.icon,
              color: t.color
            };
          });
          setActivities(mapped);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, [user?.id]);
  return (
    <div className="glass-card" style={{ padding: "24px", background: "rgba(15, 27, 46, 0.4)", height: "100%" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#fff", marginBottom: "24px" }}>Lini Masa Aktivitas</h3>

      <div style={{ position: "relative" }}>
        {/* Garis Vertikal Latar Belakang */}
        <div style={{
          position: "absolute",
          left: "15px",
          top: "0",
          bottom: "0",
          width: "2px",
          background: "linear-gradient(to bottom, var(--cyan) 0%, rgba(255, 255, 255, 0.05) 100%)",
          opacity: 0.3
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {activities.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(226, 232, 240, 0.2)", fontSize: "12px", padding: "20px" }}>Belum ada aktivitas terbaru.</p>
          ) : activities.map((activity, idx) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ 
                x: 6,
                background: "rgba(255, 255, 255, 0.02)",
              }}
              whileTap={{ scale: 0.98 }}
              style={{ display: "flex", gap: "20px", position: "relative", cursor: "pointer" }}
            >
              {/* Titik / Ikon Aktivitas */}
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(15, 27, 46, 1)",
                border: `2px solid ${activity.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activity.color,
                zIndex: 1,
                boxShadow: `0 0 10px ${activity.color}40`,
                flexShrink: 0,
                transition: "box-shadow 0.3s ease",
              }}>
                <activity.icon size={14} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#E2E8F0" }}>{activity.title}</h4>
                  <span style={{ fontSize: "11px", color: "rgba(226, 232, 240, 0.3)" }}>{activity.time}</span>
                </div>
                <p style={{ fontSize: "12px", color: "rgba(226, 232, 240, 0.4)", lineHeight: "1.5" }}>
                  {activity.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

