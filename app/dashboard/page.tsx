"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const role = user.user_metadata?.role;
        if (role === "client") {
          router.replace("/dashboard/client");
        } else if (role === "freelancer") {
          router.replace("/dashboard/freelancer");
        } else {
          // Fallback if no role or unknown role
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    }

    checkUser();
  }, [router]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#0B1220",
      color: "#fff"
    }}>
      <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "16px" }}>Redirecting...</h2>
        <div className="orb" style={{ width: "40px", height: "40px", margin: "0 auto", animation: "pulse 2s infinite" }} />
      </div>
    </div>
  );
}
