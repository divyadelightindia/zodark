'use client';

import React, { useState, useEffect } from "react";
import ApexWorld from "@/components/ApexWorld";
import ApexOverviewPanel from "@/components/ApexOverviewPanel";
import { ZodarkControlHub } from "@/components/ZodarkControlHub";
import { ZodarkAuthModal } from "@/components/ZodarkAuthModal";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <main
      id="main"
      style={{ background: "#04080f", color: "#f0ede8", position: "relative", overflow: "hidden" }}
    >
      {/* Top-left overview HUD: clock + weather + social links */}
      <ApexOverviewPanel />

      {/* The world: orb core + orbiting agent graph */}
      <section style={{ position: "relative", height: "100vh", minHeight: 620 }}>
        <ApexWorld />
      </section>

      {/* Top-Right Header Actions */}
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
        {/* Sign In / User Profile Button */}
        <button
          onClick={() => setIsAuthOpen(true)}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: user ? "#34d399" : "#00e5ff",
            border: `1px solid ${user ? "rgba(52,211,153,0.4)" : "rgba(0,229,255,0.4)"}`,
            borderRadius: 20,
            padding: "6px 14px",
            background: user ? "rgba(52,211,153,0.12)" : "rgba(0,229,255,0.12)",
            backdropFilter: "blur(10px)",
            boxShadow: `0 0 18px ${user ? "rgba(52,211,153,0.2)" : "rgba(0,229,255,0.25)"}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: "700",
          }}
        >
          <span>{user ? "👤" : "🔑"}</span> {user ? (user.email ? user.email.split("@")[0] : "ACCOUNT") : "SIGN IN"}
        </button>

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

      {/* Zodark Authentication Modal */}
      <ZodarkAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Control Hub Modal Overlay */}
      <ZodarkControlHub
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
