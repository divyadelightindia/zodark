"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, LogOut, Key, Mail, Lock, CheckCircle2, Shield, Globe, ExternalLink, Sparkles, X } from "lucide-react";

interface ZodarkAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZodarkAuthModal({ isOpen, onClose }: ZodarkAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch active Supabase user session on mount & modal open
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Google 1-Click OAuth Sign-In via Supabase
  const handleGoogleAuth = async () => {
    if (!supabase) {
      setMessage({
        text: "Supabase client not initialized. Please ensure NEXT_PUBLIC_SUPABASE_URL is configured.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ text: err.message || "Google Sign In failed.", type: "error" });
      setLoading(false);
    }
  };

  // Email / Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setMessage({ text: "Supabase configuration missing.", type: "error" });
      return;
    }
    if (!email || !password) {
      setMessage({ text: "Please enter both email and password.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        setMessage({ text: "Sign-in successful! Welcome to Zodark AI.", type: "success" });
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setUser(data.user);
        setMessage({ text: "Account created! Please check your email for confirmation.", type: "success" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Authentication failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    if (!supabase) return;
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    setMessage({ text: "Signed out successfully.", type: "success" });
  };

  // Open Direct Social Account Popup Window
  const openSocialLogin = (url: string) => {
    window.open(url, "_blank", "width=600,height=700,status=no,menubar=no");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(2, 6, 12, 0.92)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "linear-gradient(145deg, rgba(8, 16, 28, 0.98) 0%, rgba(4, 8, 16, 0.99) 100%)",
          border: "1px solid rgba(0, 229, 255, 0.4)",
          borderRadius: "20px",
          boxShadow: "0 0 70px rgba(0, 229, 255, 0.25), 0 20px 50px rgba(0,0,0,0.9)",
          padding: "28px",
          position: "relative",
          color: "#fff",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(0, 229, 255, 0.15)",
              border: "1px solid rgba(0, 229, 255, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "#00e5ff",
              boxShadow: "0 0 20px rgba(0, 229, 255, 0.3)",
            }}
          >
            <Shield size={26} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "0.05em", color: "#fff" }}>
            ZODARK AUTHENTICATION
          </h2>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
            Connect your Google & Supabase account for executive AI session management.
          </p>
        </div>

        {/* Notification Message */}
        {message && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              marginBottom: "16px",
              background: message.type === "success" ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)",
              border: `1px solid ${message.type === "success" ? "rgba(52, 211, 153, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
              color: message.type === "success" ? "#34d399" : "#f87171",
            }}
          >
            {message.text}
          </div>
        )}

        {/* If Logged In: Show User Profile */}
        {user ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                background: "rgba(0, 229, 255, 0.08)",
                border: "1px solid rgba(0, 229, 255, 0.25)",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#00e5ff" }}>
                Authenticated Account
              </div>
              <div style={{ fontSize: "13px", color: "#fff", marginTop: "6px" }}>
                {user.email || user.user_metadata?.email || "Google Authenticated User"}
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                User ID: {user.id}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(248, 113, 113, 0.2)",
                border: "1px solid rgba(248, 113, 113, 0.4)",
                color: "#f87171",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <LogOut size={16} /> Sign Out of Zodark AI
            </button>
          </div>
        ) : (
          <div>
            {/* Google 1-Click OAuth Sign-In */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)",
                border: "none",
                color: "#04080f",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 0 20px rgba(0, 229, 255, 0.3)",
                marginBottom: "18px",
              }}
            >
              <Key size={16} /> Continue with Google (1-Click OAuth)
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "16px 0",
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }} />
              <span>OR EMAIL & PASSWORD</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.15)" }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "4px" }}>
                  Email Address
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(4, 8, 16, 0.8)",
                    border: "1px solid rgba(0, 229, 255, 0.25)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                >
                  <Mail size={15} color="#00e5ff" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    required
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "4px" }}>
                  Password
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(4, 8, 16, 0.8)",
                    border: "1px solid rgba(0, 229, 255, 0.25)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                >
                  <Lock size={15} color="#00e5ff" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(0, 229, 255, 0.15)",
                  border: "1px solid rgba(0, 229, 255, 0.4)",
                  color: "#00e5ff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {loading ? "Processing..." : mode === "signin" ? "Sign In to Zodark" : "Create New Account"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
              {mode === "signin" ? "Don't have an account? " : "Already registered? "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#00e5ff",
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        )}

        {/* Social Accounts Quick Connectors */}
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
            Official Social Accounts Connectors:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button
              onClick={() => openSocialLogin("https://accounts.google.com/ServiceLogin")}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ExternalLink size={12} color="#00e5ff" /> Google & YouTube
            </button>

            <button
              onClick={() => openSocialLogin("https://www.instagram.com/accounts/login/")}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                background: "rgba(236,72,153,0.15)",
                border: "1px solid rgba(236,72,153,0.35)",
                color: "#f472b6",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ExternalLink size={12} color="#ec4899" /> Instagram Studio
            </button>

            <button
              onClick={() => openSocialLogin("https://www.facebook.com/login.php")}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#93c5fd",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ExternalLink size={12} color="#3b82f6" /> Facebook Business
            </button>

            <button
              onClick={() => openSocialLogin("https://chatgpt.com")}
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.35)",
                color: "#6ee7b7",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ExternalLink size={12} color="#10b981" /> ChatGPT / DALL-E
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
