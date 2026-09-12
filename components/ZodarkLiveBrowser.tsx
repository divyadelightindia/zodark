"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Search,
  X,
  Volume2,
  VolumeX,
  Youtube,
  MessageSquare,
  Instagram,
  Facebook,
  Linkedin,
  Compass,
  Key,
  LogOut,
  UserCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface ZodarkLiveBrowserProps {
  isOpen: boolean;
  initialUrl?: string;
  initialQuery?: string;
  onClose: () => void;
}

export function ZodarkLiveBrowser({
  isOpen,
  initialUrl = "https://www.google.com",
  initialQuery = "",
  onClose,
}: ZodarkLiveBrowserProps) {
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("https://www.google.com");
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync initial URL or search query when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialQuery && initialQuery.trim()) {
      const formattedSearch = `https://www.google.com/search?q=${encodeURIComponent(initialQuery)}`;
      setCurrentUrl(formattedSearch);
      setInputUrl(formattedSearch);
    } else if (initialUrl) {
      setCurrentUrl(initialUrl);
      setInputUrl(initialUrl);
    }
  }, [isOpen, initialUrl, initialQuery]);

  if (!isOpen) return null;

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = inputUrl.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (url.includes(".") && !url.includes(" ")) {
        url = `https://${url}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    setIsLoading(true);
    setCurrentUrl(url);
    setInputUrl(url);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleBookmarkClick = (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setInputUrl(url);
    setTimeout(() => setIsLoading(false), 800);
  };

  // Real Google Sign-In via Popup Window (Bypasses Google iframe anti-phishing blocks)
  const handleGoogleSignIn = () => {
    const popup = window.open(
      "https://accounts.google.com/ServiceLogin",
      "GoogleSignInPopup",
      "width=520,height=650,left=200,top=100,status=no,menubar=no"
    );
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(true);
      const googleLoginUrl = "https://accounts.google.com/ServiceLogin";
      setCurrentUrl(googleLoginUrl);
      setInputUrl(googleLoginUrl);
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  // Real Google Sign-Out via Popup Window
  const handleGoogleSignOut = () => {
    const popup = window.open(
      "https://accounts.google.com/Logout",
      "GoogleSignOutPopup",
      "width=520,height=650,left=200,top=100,status=no,menubar=no"
    );
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(true);
      const googleLogoutUrl = "https://accounts.google.com/Logout";
      setCurrentUrl(googleLogoutUrl);
      setInputUrl(googleLogoutUrl);
      setTimeout(() => setIsLoading(false), 800);
    }
  // Open active page in Popup Window for 100% login compatibility (Google, Facebook, Instagram, ChatGPT)
  const handlePopoutWindow = (targetUrl?: string) => {
    const urlToOpen = targetUrl || currentUrl;
    window.open(
      urlToOpen,
      "ZodarkAuthPopup",
      "width=560,height=680,left=250,top=100,status=no,menubar=no,toolbar=no"
    );
  };

  // Construct Proxied iframe URL to bypass X-Frame-Options & allow framing
  const proxiedIframeSrc = currentUrl.startsWith("http")
    ? `/api/proxy?url=${encodeURIComponent(currentUrl)}`
    : currentUrl;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
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
          maxWidth: "1180px",
          height: "min(840px, 95vh)",
          background:
            "linear-gradient(145deg, rgba(8, 15, 26, 0.98) 0%, rgba(4, 8, 16, 0.99) 100%)",
          border: "1px solid rgba(0, 229, 255, 0.35)",
          borderRadius: "20px",
          boxShadow:
            "0 0 70px rgba(0, 229, 255, 0.22), 0 20px 50px rgba(0, 0, 0, 0.95)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Browser Top Navigation Bar */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background:
              "linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%)",
          }}
        >
          {/* Window Control Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={onClose}
              title="Close Browser"
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ff5f56",
                border: "none",
                cursor: "pointer",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#ffbd2e",
              }}
            />
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#27c93f",
              }}
            />
          </div>

          {/* Nav Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => handleNavigate()}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => handleNavigate()}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleNavigate()}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              <RotateCcw
                size={15}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* Address Bar */}
          <form
            onSubmit={handleNavigate}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(4, 8, 16, 0.85)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              borderRadius: "24px",
              padding: "6px 16px",
            }}
          >
            <Globe size={15} color="#00e5ff" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Search Google, YouTube, ChatGPT or enter web address..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "13px",
              }}
            />
            <button
              type="button"
              onClick={() => handlePopoutWindow()}
              title="Open current page in popup window for 100% login compatibility"
              style={{
                background: "rgba(0, 229, 255, 0.15)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                color: "#00e5ff",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "11px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ExternalLink size={12} /> Popout Login
            </button>
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                color: "#00e5ff",
                cursor: "pointer",
              }}
            >
              <Search size={15} />
            </button>
          </form>

          {/* Real Google Sign-In & Sign-Out Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleGoogleSignIn}
              title="Sign In to your Google & YouTube Account inside Zodark"
              style={{
                background: "linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)",
                border: "none",
                color: "#04080f",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 0 15px rgba(0, 229, 255, 0.3)",
              }}
            >
              <Key size={14} /> Google Sign In
            </button>

            <button
              onClick={handleGoogleSignOut}
              title="Sign Out of Google Account"
              style={{
                background: "rgba(248, 113, 113, 0.15)",
                border: "1px solid rgba(248, 113, 113, 0.35)",
                color: "#f87171",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              style={{
                background: isMuted
                  ? "rgba(248, 113, 113, 0.2)"
                  : "rgba(0, 229, 255, 0.1)",
                border: `1px solid ${
                  isMuted
                    ? "rgba(248, 113, 113, 0.4)"
                    : "rgba(0, 229, 255, 0.3)"
                }`,
                color: isMuted ? "#f87171" : "#00e5ff",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isMuted ? "Muted" : "Audio On"}
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.6)",
                borderRadius: "8px",
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
          </div>
        </div>

        {/* Quick Bookmarks Bar */}
        <div
          style={{
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(0, 0, 0, 0.25)",
            overflowX: "auto",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.4)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginRight: "4px",
            }}
          >
            Social & AI Accounts:
          </span>

          <button
            onClick={() => handleBookmarkClick("https://www.google.com")}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Compass size={14} color="#00e5ff" /> Google Search
          </button>

          <button
            onClick={() => handleBookmarkClick("https://www.youtube.com")}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#fca5a5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Youtube size={14} color="#ef4444" /> YouTube Studio
          </button>

          <button
            onClick={() => handleBookmarkClick("https://chatgpt.com")}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#6ee7b7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <MessageSquare size={14} color="#10b981" /> ChatGPT / DALL-E
          </button>

          <button
            onClick={() => handleBookmarkClick("https://www.instagram.com/accounts/login/")}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              background: "rgba(236, 72, 153, 0.15)",
              border: "1px solid rgba(236, 72, 153, 0.35)",
              color: "#f472b6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Instagram size={14} color="#ec4899" /> Instagram Login
          </button>

          <button
            onClick={() => handleBookmarkClick("https://www.facebook.com/login.php")}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              color: "#93c5fd",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Facebook size={14} color="#3b82f6" /> Facebook Login
          </button>

          <button
            onClick={() => handleBookmarkClick("https://www.linkedin.com/login")}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "11px",
              background: "rgba(14, 165, 233, 0.15)",
              border: "1px solid rgba(14, 165, 233, 0.35)",
              color: "#7dd3fc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Linkedin size={14} color="#0ea5e9" /> LinkedIn Login
          </button>
        </div>

        {/* Embedded Live Web View Frame */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#040810",
            overflow: "hidden",
          }}
        >
          {isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(4, 8, 16, 0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#00e5ff",
                fontSize: "14px",
                fontWeight: "600",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  className="animate-spin"
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "3px solid rgba(0, 229, 255, 0.2)",
                    borderTopColor: "#00e5ff",
                    borderRadius: "50%",
                  }}
                />
                Loading Live Zodark Proxied Web View...
              </div>
            </div>
          )}

          <iframe
            src={proxiedIframeSrc}
            title="Zodark Live Embedded Browser"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#fff",
            }}
          />
        </div>

        {/* Footer Info & Account Sign-In Bar */}
        <div
          style={{
            padding: "10px 20px",
            background: "rgba(4, 8, 16, 0.98)",
            borderTop: "1px solid rgba(0, 229, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={14} color="#00e5ff" />
            <span>
              <strong>Zodark Integrated Session Container:</strong> Sign-In & Sign-Out enabled via Zodark Web Proxy.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={handleGoogleSignIn}
              style={{
                background: "none",
                border: "none",
                color: "#00e5ff",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Key size={13} /> Sign In Google / YT
            </button>

            <button
              onClick={handleGoogleSignOut}
              style={{
                background: "none",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <LogOut size={13} /> Sign Out Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
