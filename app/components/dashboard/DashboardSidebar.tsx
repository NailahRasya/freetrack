import { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Flag, 
  MessageSquare, 
  Settings, 
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Sparkles,
  GitPullRequest,
  FileText,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar, useUser } from "../../dashboard/layout";
import { useProjects } from "@/lib/hooks/useProjects";
import { supabase } from "@/lib/supabase";

export default function DashboardSidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const { collapsed, setCollapsed } = useSidebar();
  const { user, role, t } = useUser();

  const { projects } = useProjects();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasChangeRequestAction, setHasChangeRequestAction] = useState(false);
  const [hasInvoiceAction, setHasInvoiceAction] = useState(false);
  const [hasMilestoneAction, setHasMilestoneAction] = useState(false);
  const [hasPaymentAction, setHasPaymentAction] = useState(false);
  
  // Track open state for parent groups
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const menuConfig = [
    { 
      key: "dashboard", 
      label: t("dashboard"), 
      href: "/dashboard", 
      icon: LayoutDashboard 
    },
    { 
      key: "marketplace", 
      label: t("marketplace"), 
      href: "/dashboard/marketplace", 
      icon: Sparkles 
    },
    {
      key: "projects_group",
      label: t("projects_group"),
      icon: Briefcase,
      children: [
        { key: "my_projects", label: t("my_projects"), href: "/dashboard/projects", icon: Briefcase },
        { key: "milestones", label: t("milestones"), href: "/dashboard/milestones", icon: Flag },
        { key: "change_requests", label: t("change_requests"), href: "/dashboard/change-requests", icon: GitPullRequest }
      ]
    },
    {
      key: "communication_group",
      label: t("communication_group"),
      icon: MessageSquare,
      children: [
        { key: "messages", label: t("messages"), href: "/dashboard/messages", icon: MessageSquare },
        { key: "contacts", label: t("contacts"), href: "/dashboard/contacts", icon: Users }
      ]
    },
    {
      key: "finance_group",
      label: t("finance_group"),
      icon: Wallet,
      children: [
        { key: "payments", label: t("payments"), href: "/dashboard/payments", icon: Wallet },
        { key: "invoices", label: t("invoices"), href: "/dashboard/invoices", icon: FileText }
      ]
    },
    {
      key: "account_group",
      label: t("account_group"),
      icon: User,
      children: [
        { key: "my_profile", label: t("my_profile"), href: "/dashboard/profile", icon: User },
        { key: "settings", label: t("settings"), href: "/dashboard/settings", icon: Settings }
      ]
    },
    {
      key: "freetrack_guide",
      label: t("freetrack_guide"),
      href: "/dashboard/guide",
      icon: HelpCircle
    }
  ];

  const fetchUnread = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    } catch (err) {
      console.error("Failed to fetch unread messages:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !role) return;

    const fetchActionStates = async () => {
      try {
        if (role === "client") {
          // 1. Change Requests (pending)
          const { count: crCount } = await supabase
            .from("change_requests")
            .select("*", { count: "exact", head: true })
            .eq("client_id", user.id)
            .eq("status", "pending");
          setHasChangeRequestAction((crCount || 0) > 0);

          // 2. Invoices (pending)
          const { count: invCount } = await supabase
            .from("invoices")
            .select("*", { count: "exact", head: true })
            .eq("client_id", user.id)
            .eq("status", "pending");
          setHasInvoiceAction((invCount || 0) > 0);

          // 3. Milestones (Waiting for Approval)
          const { count: msCount } = await supabase
            .from("milestones")
            .select("*", { count: "exact", head: true })
            .eq("client_id", user.id)
            .in("status", ["Waiting for Approval", "Menunggu Persetujuan"]);
          setHasMilestoneAction((msCount || 0) > 0);

          // 4. Payments (Menunggu DP)
          const { count: payCount } = await supabase
            .from("milestones")
            .select("*", { count: "exact", head: true })
            .eq("client_id", user.id)
            .eq("status", "Menunggu DP");
          setHasPaymentAction((payCount || 0) > 0);
        } else if (role === "freelancer") {
          // Freelancer view
          setHasChangeRequestAction(false);
          setHasInvoiceAction(false);

          // Milestones (Revision Requested)
          const { count: msCount } = await supabase
            .from("milestones")
            .select("*", { count: "exact", head: true })
            .eq("freelancer_id", user.id)
            .in("status", ["Revision Requested", "Requested Revision"]);
          setHasMilestoneAction((msCount || 0) > 0);

          setHasPaymentAction(false);
        }

        // Also check unread count periodically
        fetchUnread();
      } catch (err) {
        console.error("Failed to fetch sidebar action states:", err);
      }
    };

    fetchActionStates();

    // Check states periodically every 5 seconds to keep sidebar red dots in sync
    const interval = setInterval(fetchActionStates, 5000);
    return () => clearInterval(interval);
  }, [user?.id, role, fetchUnread]);

  // Fetch unread count immediately on page navigation
  useEffect(() => {
    if (user?.id) {
      fetchUnread();
    }
  }, [pathname, user?.id, fetchUnread]);

  useEffect(() => {
    if (!user?.id) return;

    fetchUnread();

    // Subscribe ke pesan baru
    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchUnread]);

  // Listen to custom messages-read event to clear the red unread dot on the 'Pesan' tab instantly
  useEffect(() => {
    const handleMessagesRead = () => {
      fetchUnread();
    };
    window.addEventListener("messages-read", handleMessagesRead);
    return () => {
      window.removeEventListener("messages-read", handleMessagesRead);
    };
  }, [fetchUnread]);

  const hasActionableProjects = projects.some(p => 
    (role === "client" && p.status === "pending_client") ||
    (role === "freelancer" && p.status === "pending_freelancer")
  );

  // Auto-expand active parent on load/route change
  useEffect(() => {
    const activeParents: Record<string, boolean> = {};
    menuConfig.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          return child.href === "/dashboard"
            ? (pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer")
            : pathname.startsWith(child.href);
        });
        if (hasActiveChild) {
          activeParents[item.key] = true;
        }
      }
    });
    setExpandedParents(prev => ({
      ...prev,
      ...activeParents
    }));
  }, [pathname]);

  const hasAction = useCallback((href: string) => {
    if (!mounted) return false;
    if (href === "/dashboard/projects") return hasActionableProjects;
    if (href === "/dashboard/messages") return unreadCount > 0;
    if (href === "/dashboard/change-requests") return hasChangeRequestAction;
    if (href === "/dashboard/invoices") return hasInvoiceAction;
    if (href === "/dashboard/milestones") return hasMilestoneAction;
    if (href === "/dashboard/payments") return hasPaymentAction;
    return false;
  }, [mounted, hasActionableProjects, unreadCount, hasChangeRequestAction, hasInvoiceAction, hasMilestoneAction, hasPaymentAction]);

  const showParentDot = useCallback((item: any) => {
    if (!mounted || !item.children) return false;
    // Show parent dot if parent is collapsed OR sidebar is collapsed
    const isCollapsedOrSidebarCollapsed = !expandedParents[item.key] || collapsed;
    if (!isCollapsedOrSidebarCollapsed) return false;
    
    // Check if any child has an action and is not active
    return item.children.some((child: any) => {
      const childActive = child.href === "/dashboard" 
        ? (pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer")
        : pathname.startsWith(child.href);
      return hasAction(child.href) && !childActive;
    });
  }, [mounted, expandedParents, collapsed, pathname, hasAction]);

  const toggleParent = (key: string) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedParents(prev => ({
        ...prev,
        [key]: true
      }));
    } else {
      setExpandedParents(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card"
      style={{
        width: collapsed ? "80px" : "260px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        padding: "24px 12px",
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        borderRadius: 0,
        border: "none",
        borderRight: "1px solid var(--glass-border)",
        background: "rgba(10, 15, 30, 0.95)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Bagian Logo */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px", 
        padding: "0 12px",
        marginBottom: "40px",
        height: "32px",
        overflow: "hidden"
      }}>
        <img src="/logo_icon.png" alt="FreeTrack" style={{ height: "24px", width: "auto", flexShrink: 0 }} />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              fontSize: "18px", 
              fontWeight: "800", 
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #4D63FF, #06B6D4)",
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap"
            }}
          >
            FreeTrack
          </motion.span>
        )}
      </div>

      {/* Menu Navigasi */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {menuConfig.map((item) => {
          if (!item.children) {
            // Flat item
            const isActive = item.href === "/dashboard" 
              ? (pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer")
              : pathname.startsWith(item.href!);
            const showDot = hasAction(item.href!) && !isActive;

            return (
              <Link 
                key={item.href} 
                href={item.href!}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{ x: 4, background: isActive ? "rgba(26, 54, 240, 0.15)" : "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    position: "relative",
                    background: isActive ? "rgba(26, 54, 240, 0.1)" : "transparent",
                    color: isActive ? "var(--cyan-light)" : "rgba(226, 232, 240, 0.5)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      style={{
                        position: "absolute",
                        left: 0,
                        width: "3px",
                        height: "20px",
                        background: "var(--cyan)",
                        borderRadius: "0 4px 4px 0",
                        boxShadow: "0 0 10px var(--cyan)",
                      }}
                    />
                  )}
                  <item.icon size={20} style={{ flexShrink: 0 }} />
                  {showDot && (
                    <span style={{
                      position: "absolute",
                      top: collapsed ? "8px" : "12px",
                      left: collapsed ? "45px" : "28px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#FF4D6A",
                      boxShadow: "0 0 10px #FF4D6A",
                      zIndex: 10
                    }} />
                  )}
                  {!collapsed && (
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          } else {
            // Collapsible parent item
            const isExpanded = !!expandedParents[item.key];
            const isParentActive = item.children.some(child => {
              return child.href === "/dashboard"
                ? (pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer")
                : pathname.startsWith(child.href);
            });
            const showDot = showParentDot(item);

            return (
              <div key={item.key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <motion.div
                  onClick={() => toggleParent(item.key)}
                  whileHover={{ x: 4, background: isParentActive ? "rgba(26, 54, 240, 0.08)" : "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                    padding: "12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    position: "relative",
                    background: isParentActive ? "rgba(26, 54, 240, 0.05)" : "transparent",
                    color: isParentActive ? "var(--cyan-light)" : "rgba(226, 232, 240, 0.5)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <item.icon size={20} style={{ flexShrink: 0, color: isParentActive ? "var(--cyan-light)" : "rgba(226, 232, 240, 0.5)" }} />
                    {!collapsed && (
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.label}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "flex", alignItems: "center", color: isParentActive ? "var(--cyan)" : "rgba(226, 232, 240, 0.3)" }}
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  )}

                  {showDot && (
                    <span style={{
                      position: "absolute",
                      top: collapsed ? "8px" : "12px",
                      left: collapsed ? "45px" : "28px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#FF4D6A",
                      boxShadow: "0 0 10px #FF4D6A",
                      zIndex: 10
                    }} />
                  )}
                </motion.div>

                {/* Submenu Children */}
                <AnimatePresence initial={false}>
                  {isExpanded && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ 
                        overflow: "hidden", 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "4px", 
                        paddingLeft: "12px",
                        marginTop: "2px",
                        borderLeft: "1px dashed rgba(255, 255, 255, 0.08)",
                        marginLeft: "22px",
                        marginBottom: "4px"
                      }}
                    >
                      {item.children.map((child) => {
                        const isChildActive = child.href === "/dashboard" 
                          ? (pathname === "/dashboard" || pathname === "/dashboard/client" || pathname === "/dashboard/freelancer")
                          : pathname.startsWith(child.href);
                        const showChildDot = hasAction(child.href) && !isChildActive;
                        
                        return (
                          <Link key={child.href} href={child.href} style={{ textDecoration: "none" }}>
                            <motion.div
                              whileHover={{ x: 4, background: isChildActive ? "rgba(26, 54, 240, 0.15)" : "rgba(255, 255, 255, 0.04)" }}
                              whileTap={{ scale: 0.97 }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                position: "relative",
                                background: isChildActive ? "rgba(26, 54, 240, 0.08)" : "transparent",
                                color: isChildActive ? "var(--cyan-light)" : "rgba(226, 232, 240, 0.4)",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isChildActive && (
                                <motion.div 
                                  layoutId="active-pill-child"
                                  style={{
                                    position: "absolute",
                                    left: 0,
                                    width: "3px",
                                    height: "16px",
                                    background: "var(--cyan)",
                                    borderRadius: "0 4px 4px 0",
                                    boxShadow: "0 0 10px var(--cyan)",
                                  }}
                                />
                              )}
                              <child.icon size={16} style={{ flexShrink: 0, opacity: isChildActive ? 1 : 0.6 }} />
                              <span style={{ fontSize: "13px", fontWeight: "600" }}>{child.label}</span>
                              {showChildDot && (
                                <span style={{
                                  position: "absolute",
                                  right: "12px",
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: "#FF4D6A",
                                  boxShadow: "0 0 8px #FF4D6A",
                                }} />
                              )}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
        })}
      </nav>

      {/* Aksi Bawah */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ background: "rgba(255, 255, 255, 0.08)", color: "#fff" }}
          whileTap={{ scale: 0.9 }}
          suppressHydrationWarning
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "rgba(226, 232, 240, 0.4)",
            width: "100%",
            padding: "8px",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </motion.button>
      </div>
    </motion.aside>
  );
}

