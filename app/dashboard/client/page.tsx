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
