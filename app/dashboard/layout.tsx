"use client";

import { useState, useEffect, createContext, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

const UserContext = createContext<any>(null);
const SidebarContext = createContext<any>(null);

export const useUser = () => useContext(UserContext);
export const useSidebar = () => useContext(SidebarContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"client" | "freelancer">("client");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          if (error.message.includes("JWN invalid")) {
            await supabase.auth.signOut();
            window.location.href = "/login";
            return;
          }
          console.error("Auth error:", error.message);
        }

        if (user) {
          // Ambil data profile dasar
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) console.error("Profile fetch error:", profileError.message);

          let userSkills: string[] = [];
          
          if (profile) {
            if (profile.role === "freelancer") {
              const { data: obData } = await supabase
                .from("onboarding_freelancer")
                .select("skill_categories, tools")
                .eq("user_id", user.id)
                .maybeSingle();
              
              userSkills = [
                ...(profile.skills || []), 
                ...(obData?.skill_categories || []),
                ...(obData?.tools || [])
              ];
            } else {
              const { data: obData } = await supabase
                .from("onboarding_client")
                .select("project_categories, required_skills")
                .eq("user_id", user.id)
                .maybeSingle();

              userSkills = [
                ...(obData?.project_categories || []),
                ...(obData?.required_skills || [])
              ];
            }
          }

          userSkills = Array.from(new Set(userSkills.filter(Boolean)));

          setUser({ ...user, profile: profile ? { ...profile, skills: userSkills } : null });
          setRole(user.user_metadata?.role || profile?.role || "client");
        } else {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, [pathname]);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div style={{ 
        minHeight: "100vh", 
        background: "#0B1220", 
        color: "#E2E8F0",
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflowX: "hidden"
      }}>
        {/* Background Elements (Out of Grid Flow) */}
        <div className="noise-overlay" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
        <div className="orb" style={{ position: "fixed", width: "600px", height: "600px", background: "rgba(26, 54, 240, 0.08)", top: "-200px", right: "-100px", zIndex: 0, pointerEvents: "none" }} />
        <div className="orb" style={{ position: "fixed", width: "500px", height: "500px", background: "rgba(16, 185, 129, 0.05)", bottom: "-100px", left: "200px", zIndex: 0, pointerEvents: "none" }} />

        {/* Layout Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: collapsed ? "112px 1fr" : "292px 1fr",
          transition: "grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1
        }}>
          <DashboardSidebar />

          <main style={{ 
            gridColumn: "2",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            width: "100%",
            position: "relative"
          }}>
            <DashboardNavbar />
            
            <div style={{ 
              padding: "32px",
              maxWidth: "1400px",
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              boxSizing: "border-box"
            }}>
              {mounted ? children : <div style={{ opacity: 0 }}>{children}</div>}
            </div>
          </main>
        </div>
      </div>
      </SidebarContext.Provider>
    </UserContext.Provider>
  );
}
