"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, SlidersHorizontal, Briefcase, CheckCircle2, Clock, DollarSign, X } from "lucide-react";
import ProjectCard from "../../components/dashboard/ProjectCard";

const projectsData = [
  {
    id: 1,
    name: "E-Commerce Mobile App",
    freelancer: "Sarah Jenkins",
    progress: 75,
    budget: "Rp 12.5M",
    deadline: "May 15, 2026",
    status: "Active",
    statusColor: "#00E5FF", // cyan
  },
  {
    id: 2,
    name: "Corporate Website Redesign",
    freelancer: "Aris Munandar",
    progress: 40,
    budget: "Rp 8.0M",
    deadline: "June 02, 2026",
    status: "Review",
    statusColor: "#F59E0B", // orange
  },
  {
    id: 3,
    name: "Smart Contract Audit",
    freelancer: "David Chen",
    progress: 100,
    budget: "Rp 15.0M",
    deadline: "Apr 20, 2026",
    status: "Completed",
    statusColor: "#00FFA3", // green
  },
  {
    id: 4,
    name: "AI Content Generator",
    freelancer: "Maria Garcia",
    progress: 20,
    budget: "Rp 25.0M",
    deadline: "July 10, 2026",
    status: "Active",
    statusColor: "#00E5FF",
  },
  {
    id: 5,
    name: "Brand Identity Design",
    freelancer: "James Wilson",
    progress: 90,
    budget: "Rp 5.5M",
    deadline: "May 01, 2026",
    status: "Active",
    statusColor: "#00E5FF",
  },
  {
    id: 6,
    name: "Mobile Game UI Kit",
    freelancer: "Elena Popova",
    progress: 60,
    budget: "Rp 10.2M",
    deadline: "May 25, 2026",
    status: "Review",
    statusColor: "#F59E0B",
  },
];

const stats = [
  { label: "Total Projects", value: "24", icon: Briefcase, color: "#4D63FF" },
  { label: "Active", value: "12", icon: Clock, color: "#00E5FF" },
  { label: "In Review", value: "5", icon: SlidersHorizontal, color: "#F59E0B" },
  { label: "Completed", value: "7", icon: CheckCircle2, color: "#00FFA3" },
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    freelancer: "",
    budget: "",
    deadline: "",
  });
  const [projects, setProjects] = useState(projectsData);

  const handleCreateProject = () => {
    if (!newProject.name.trim() || !newProject.freelancer.trim()) return;
    const created = {
      id: projects.length + 1,
      name: newProject.name,
      freelancer: newProject.freelancer,
      progress: 0,
      budget: newProject.budget || "Rp 0",
      deadline: newProject.deadline || "-",
      status: "Active",
      statusColor: "#00E5FF",
    };
    setProjects([created, ...projects]);
    setNewProject({ name: "", freelancer: "", budget: "", deadline: "" });
    setShowCreateModal(false);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesTab = activeTab === "All" || project.status === activeTab;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.freelancer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap" }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff", marginBottom: "8px" }}>
            My <span className="gradient-text">Projects</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
            Manage and track all your ongoing and completed projects
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 229, 255, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ 
            padding: "12px 24px", 
            borderRadius: "14px", 
            fontSize: "14px", 
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Plus size={18} />
          Create Project
        </motion.button>
      </div>

      {/* Quick Stats Summary */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: "20px" 
      }}>
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card"
            style={{ 
              padding: "20px", 
              background: "rgba(15, 27, 46, 0.4)", 
              display: "flex", 
              alignItems: "center", 
              gap: "16px" 
            }}
          >
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "10px", 
              background: `${stat.color}15`, 
              color: stat.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${stat.color}25`
            }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(226, 232, 240, 0.3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        gap: "24px",
        flexWrap: "wrap"
      }}>
        {/* Tabs */}
        <div style={{ 
          display: "flex", 
          background: "rgba(255, 255, 255, 0.03)", 
          padding: "4px", 
          borderRadius: "14px", 
          border: "1px solid rgba(255, 255, 255, 0.05)" 
        }}>
          {["All", "Active", "Review", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeTab === tab ? "rgba(255, 255, 255, 0.06)" : "transparent",
                color: activeTab === tab ? "var(--cyan)" : "rgba(226, 232, 240, 0.4)",
                transition: "all 0.2s ease"
              }}
            >
              {tab === "Review" ? "In Review" : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(226, 232, 240, 0.3)" }} />
          <input 
            type="text" 
            placeholder="Search project or freelancer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "12px 16px 12px 48px",
              color: "#fff",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProjects.length > 0 ? (
          <motion.div 
            layout
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
              gap: "24px" 
            }}
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              padding: "80px 20px", 
              textAlign: "center", 
              background: "rgba(15, 27, 46, 0.2)", 
              borderRadius: "32px",
              border: "2px dashed rgba(255, 255, 255, 0.03)"
            }}
          >
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              background: "rgba(255,255,255,0.02)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              margin: "0 auto 24px"
            }}>
              <Briefcase size={32} style={{ color: "rgba(226, 232, 240, 0.1)" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "8px" }}>No projects found</h3>
            <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "14px", marginBottom: "24px" }}>
              We couldn't find any projects matching your current filters.
            </p>
            <button className="btn-secondary" onClick={() => { setActiveTab("All"); setSearchQuery(""); }}>
              Clear All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Placeholder */}
      {filteredProjects.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button style={{ 
            padding: "12px 32px", 
            borderRadius: "12px", 
            background: "rgba(255,255,255,0.03)", 
            border: "1px solid rgba(255,255,255,0.06)", 
            color: "rgba(226, 232, 240, 0.6)",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer"
          }}>
            Load More Projects
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card"
              style={{
                width: "100%",
                maxWidth: "480px",
                padding: "32px",
                borderRadius: "24px",
                background: "rgba(15, 27, 46, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>
                    Create <span className="gradient-text">New Project</span>
                  </h2>
                  <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.4)" }}>Fill in the details below</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(226, 232, 240, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: "Project Name *", key: "name", placeholder: "e.g. E-Commerce Mobile App", type: "text" },
                  { label: "Freelancer Name *", key: "freelancer", placeholder: "e.g. Sarah Jenkins", type: "text" },
                  { label: "Budget", key: "budget", placeholder: "e.g. Rp 12.5M", type: "text" },
                  { label: "Deadline", key: "deadline", placeholder: "", type: "date" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "rgba(226, 232, 240, 0.5)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={newProject[key as keyof typeof newProject]}
                      onChange={(e) => setNewProject({ ...newProject, [key]: e.target.value })}
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                        colorScheme: "dark",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim() || !newProject.freelancer.trim()}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: !newProject.name.trim() || !newProject.freelancer.trim() ? "not-allowed" : "pointer",
                    opacity: !newProject.name.trim() || !newProject.freelancer.trim() ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Plus size={16} />
                  Create Project
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
