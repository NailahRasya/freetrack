"use client";

import { useState, createContext, useContext } from "react";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: (val: boolean) => {},
});

const UserContext = createContext({
  user: null as any,
  role: null as string | null,
  loading: true,
});

export const useSidebar = () => useContext(SidebarContext);
export const useUser = () => useContext(UserContext);

import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setRole(user.user_metadata?.role || "client");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

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
              {children}
            </div>
          </main>
        </div>
      </div>
      </SidebarContext.Provider>
    </UserContext.Provider>
  );
}
