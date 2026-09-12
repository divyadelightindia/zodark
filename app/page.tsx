'use client';

import React, { useState } from "react";
import ApexWorld from "@/components/ApexWorld";
import ApexOverviewPanel from "@/components/ApexOverviewPanel";
import { ZodarkControlHub } from "@/components/ZodarkControlHub";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main
      id="main"
      style={{ background: "#04080f", color: "#f0ede8", position: "relative", overflow: "hidden" }}
    >
      {/* Top-left overview HUD: clock + weather + social links */}
      <ApexOverviewPanel />

      {/* The world: orb core + orbiting agent graph. Tap the orb to cycle its
          state; click any agent node to open its overview card. */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620 }}>
        <ApexWorld />
      </section>

      {/* Top-Right Header Actions: Settings Button (⚙️) + Zodark Badge */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: "clamp(16px,3vw,40px)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Settings Control Hub Trigger Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Open Zodark Settings & Control Hub"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(0,229,255,0.95)",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: 20,
            padding: "6px 14px",
            background: "rgba(4,8,15,0.7)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 16px rgba(0,229,255,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,229,255,0.15)";
            e.currentTarget.style.borderColor = "rgba(0,229,255,0.6)";
            e.currentTarget.style.transform = "scale(1.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(4,8,15,0.7)";
            e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span>⚙️</span> SETTINGS
        </button>

        {/* Zodark branding badge */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.66rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(0,229,255,0.85)",
            border: "1px solid rgba(0,229,255,0.25)",
            borderRadius: 20,
            padding: "7px 15px",
            background: "rgba(4,8,15,0.5)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 0 12px rgba(0,229,255,0.1)",
          }}
        >
          ◆ Zodark
        </div>
      </div>

      {/* Control Hub Modal Overlay */}
      <ZodarkControlHub
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
