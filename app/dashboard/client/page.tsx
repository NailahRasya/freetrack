"use client";

import { motion } from "framer-motion";
import StatsCards from "../../components/dashboard/StatsCards";
import ActiveProjects from "../../components/dashboard/ActiveProjects";
import PaymentTracker from "../../components/dashboard/PaymentTracker";
import MessagesPreview from "../../components/dashboard/MessagesPreview";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header Section */}
      <header>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: "900", 
            color: "#fff", 
            letterSpacing: "-0.5px",
            marginBottom: "8px"
          }}>
            Welcome back, <span className="gradient-text">Alex Rivera</span>
          </h1>
          <p style={{ color: "rgba(226, 232, 240, 0.4)", fontSize: "15px" }}>
            Here's what's happening with your projects today.
          </p>
        </motion.div>
      </header>

      {/* Overview Stats */}
      <StatsCards />

      {/* Main Grid Layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(0, 7fr) minmax(0, 5fr)", 
        gap: "32px",
        alignItems: "stretch", 
        width: "100%"
      }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          <ActiveProjects />
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "32px" 
          }}>
            <MessagesPreview />
            <ActivityTimeline />
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", minWidth: 0 }}>
          <PaymentTracker />
          
          {/* Quick Actions / Tips Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{
              padding: "24px",
              background: "var(--gradient-primary)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              border: "none",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            {/* Abstract Shape Overlay */}
            <div style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              filter: "blur(40px)"
            }} />

            <div style={{ zIndex: 1 }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Try FreeTrack Pro</h3>
              <p style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5", marginBottom: "16px" }}>
                Unlock advanced analytics, priority support, and smart contract automation for your enterprise projects.
              </p>
              <button style={{ 
                background: "#fff", 
                color: "var(--primary)", 
                border: "none", 
                padding: "10px 20px", 
                borderRadius: "10px", 
                fontWeight: "700", 
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
              }}>
                Upgrade Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom styles for grid adjustments on smaller screens would be here */}
      <style jsx>{`
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns: 1.8fr 1.2fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
