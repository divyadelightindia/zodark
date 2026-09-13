"use client";

/**
 * ZodarkWorld — the main screen for the Zodark AI agent.
 * Layers: app-blue backdrop → clickable orb core (ring + particles) →
 * ReasoningWeb (circuit traces, orbit rings, 18-node roster) → OrbStatusBar
 * (equalizer + status cluster).
 *
 * Full AI conversation & voice intelligence:
 * 1. Continuous Speech Recognition (always listening)
 * 2. 2-second silence detection (auto-replies after user stops talking)
 * 3. Barge-in / Interruption (starts listening immediately if user talks while AI is speaking)
 * 4. Voice Commands ("stop" pauses speech, "continue" resumes)
 * 5. Gemini brain API integration
 */

import { useCallback, useEffect, useRef, useState } from "react";
import ApexHeroOrb, { type OrbState } from "./ApexHeroOrb";
import ReasoningWebJs from "./ReasoningWeb";
import ShaderBackgroundJs from "./ShaderBackground";
import OrbStatusBar from "./OrbStatusBar";
import ZodarkChatBar from "./ZodarkChatBar";
import { useVoice } from "./useVoice";

export type NodeSel = { name: string; key: string; color: string };

// the copied .jsx defaults onSelect to null, which TS infers as `null | undefined`
const ReasoningWeb = ReasoningWebJs as unknown as React.ComponentType<{
  state?: string; trace?: unknown; mode?: string; coreless?: boolean;
  onSelect?: (n: NodeSel) => void; light?: boolean;
}>;
const ShaderBackground = ShaderBackgroundJs as unknown as React.ComponentType<{
  opacity?: number; voiceActive?: boolean; gold?: boolean;
}>;
type AgentInfo = {
  role: string;
  caps: string[];
  asks?: string[];
  status: "online" | "standby" | "integration";
};

export const ROSTER: { key: string; name: string; color: string }[] = [
  { key: "chief_of_staff", name: "Chief of staff", color: "#00e5ff" },
  { key: "memory",         name: "Memory",         color: "#00e5ff" },
  { key: "strategist",     name: "Strategist",     color: "#00e5ff" },
  { key: "researcher",     name: "Researcher",     color: "#00e5ff" },
  { key: "finance",        name: "Finance",        color: "#00e5ff" },
  { key: "editor",         name: "Editor",         color: "#00e5ff" },
  { key: "sales",          name: "Sales",          color: "#f5a623" },
  { key: "marketing",      name: "Marketing",      color: "#f5a623" },
  { key: "ops",            name: "Ops",            color: "#f5a623" },
  { key: "social_media",   name: "Social",         color: "#f5a623" },
  { key: "engineering",    name: "Engineering",    color: "#f5a623" },
  { key: "design",         name: "Design",         color: "#f5a623" },
  { key: "developer",      name: "Developer",      color: "#f5a623" },
  { key: "analytics",      name: "Analytics",      color: "#7f9bb3" },
  { key: "crm",            name: "CRM",            color: "#7f9bb3" },
  { key: "calendar",       name: "Calendar",       color: "#7f9bb3" },
  { key: "email",          name: "Email",          color: "#7f9bb3" },
  { key: "drive",          name: "Drive",          color: "#7f9bb3" },
];

export const INFO: Record<string, AgentInfo> = {
  chief_of_staff: { role: "Right hand - runs the day", status: "online",
    caps: ["Prioritizes the day and keeps loose ends closed", "Routes every request to the right specialist", "Escalates only what truly needs a human"],
    asks: ["What needs attention today?", "Chase the open quotes"] },
  memory: { role: "Long-term memory", status: "online",
    caps: ["Remembers every client, project and decision", "Feeds context into every task automatically", "Learns preferences over time"],
    asks: ["What did we decide about X?", "History with this client"] },
  strategist: { role: "Big-picture thinking", status: "online",
    caps: ["Weekly strategy reviews", "Goal and milestone tracking", "Spots opportunities and risks early"],
    asks: ["Where should we double down?"] },
  researcher: { role: "Deep research", status: "online",
    caps: ["Market and competitor research", "Technical deep-dives", "Source-checked summaries"],
    asks: ["Research this market", "Compare these suppliers"] },
  finance: { role: "Money watch", status: "online",
    caps: ["Revenue and pipeline tracking", "Pricing sanity checks", "Monthly performance recaps"],
    asks: ["How was this month?", "Is this quote priced right?"] },
  editor: { role: "Quality gate", status: "online",
    caps: ["Rewrites and tightens every draft", "Keeps the brand voice consistent", "Final pass before anything ships"],
    asks: ["Polish this post", "Tighten this email"] },
  sales: { role: "Deal closer", status: "online",
    caps: ["Follow-ups for every lead", "Warm-outreach drafts", "Pipeline nudges so nothing goes cold"],
    asks: ["Draft a follow-up", "Who went quiet?"] },
  marketing: { role: "Growth engine", status: "online",
    caps: ["Campaign generation", "Pricing analysis", "Brand positioning and content calendar"],
    asks: ["Generate campaign", "Competitor research"] },
  ops: { role: "Business operator", status: "online",
    caps: ["Client quotes and proposals", "Project scoping and timelines", "Supplier sourcing"],
    asks: ["Draft client quote", "Build project scope"] },
  social_media: { role: "Voice of the brand", status: "online",
    caps: ["Writes posts and captions", "Creates reel scripts", "Posts to Instagram, LinkedIn and Facebook"],
    asks: ["Write post caption", "Plan content week"] },
  engineering: { role: "Engineering brain", status: "online",
    caps: ["3D-print settings and materials", "Tolerances and fit", "Laser power and speed guidance"],
    asks: ["Review STL file", "Calculate tolerances"] },
  design: { role: "Visual workshop", status: "online",
    caps: ["Background removal and replacement", "Text overlays", "Resize for social media", "Filters and enhancement"],
    asks: ["Remove background", "Resize for IG"] },
  developer: { role: "Keeper of the build log", status: "standby",
    caps: ["Keeps Zodark's development log", "Recaps what shipped - day / week / month", "Future: builds Zodark itself"],
    asks: ["Recap last week"] },
  analytics: { role: "Numbers feed", status: "integration",
    caps: ["Performance metrics across every channel", "Feeds the weekly reviews"] },
  crm: { role: "Client memory bank", status: "integration",
    caps: ["Every lead and client in one pipeline", "Stage tracking from first contact to paid"] },
  calendar: { role: "Schedule sense", status: "integration",
    caps: ["Knows the calendar", "Reminders and follow-up timing"] },
  email: { role: "Inbox hands", status: "integration",
    caps: ["Inbox triage and reply drafts", "Connected and in use"] },
  drive: { role: "File access", status: "integration",
    caps: ["Reads and files documents", "Connected and in use"] },
};

const STATUS_LINE: Record<AgentInfo["status"], { color: string; text: string }> = {
  online: { color: "#34d399", text: "Online - Zodark routes work to it automatically" },
  standby: { color: "#c9a84c", text: "Standby - in active development" },
  integration: { color: "#7f9bb3", text: "Integration - wired into the core" },
};

/* ── AGENT OVERVIEW window ── */
export function AgentOverview({ sel, onClose, onSelectSkill }: { sel: NodeSel; onClose: () => void; onSelectSkill?: (agentName: string, taskPrompt: string) => void }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ sx: number; sy: number } | null>(null);
  const info = INFO[sel.key] ?? { role: "Specialist", status: "online" as const, caps: ["Part of the Zodark core"] };
  const c = sel.color;
  const status = STATUS_LINE[info.status];

  useEffect(() => {
    setPos({ x: Math.max(8, window.innerWidth / 2 - 170), y: Math.max(90, window.innerHeight * 0.16) });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pos) return;
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => { if (opener && document.contains(opener)) opener.focus(); };
  }, [pos]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!pos) return;
    dragRef.current = { sx: e.clientX - pos.x, sy: e.clientY - pos.y };
    const move = (ev: MouseEvent) => {
      if (dragRef.current) setPos({ x: ev.clientX - dragRef.current.sx, y: ev.clientY - dragRef.current.sy });
    };
    const up = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  if (!pos) return null;
  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={`${sel.name} overview`} style={{
      position: "fixed", left: pos.x, top: pos.y,
      width: "min(340px, 92vw)", zIndex: 60,
      background: "rgba(4,3,12,0.92)",
      backdropFilter: "blur(24px)",
      border: `1px solid ${c}44`,
      borderRadius: 16,
      boxShadow: `0 0 40px ${c}18, 0 8px 32px rgba(0,0,0,0.6)`,
      overflow: "hidden",
    }}>
      <div onMouseDown={onMouseDown} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
        borderBottom: `1px solid ${c}22`, cursor: "grab", userSelect: "none",
        background: `linear-gradient(135deg, ${c}0a 0%, transparent 100%)`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: `${c}14`,
          border: `1px solid ${c}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, boxShadow: `0 0 10px ${c}` }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", color: c }}>{sel.name.toUpperCase()}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{info.role}</div>
        </div>
        <button onClick={onClose} aria-label="Close"
          style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "6px 8px", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >×</button>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.14em", color: `${c}99`, marginBottom: 8, fontFamily: "var(--font-mono)" }}>WHAT IT HANDLES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {info.caps.map((cap) => (
              <div key={cap} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: `${c}99`, marginTop: 6, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {info.asks && info.asks.length > 0 && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", color: `${c}99`, marginBottom: 8, fontFamily: "var(--font-mono)" }}>EXAMPLE REQUESTS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {info.asks.map((task) => (
                <button
                  key={task}
                  onClick={() => {
                    if (onSelectSkill) {
                      onSelectSkill(sel.name, task);
                    }
                    onClose();
                  }}
                  style={{
                    padding: "6px 12px",
                    background: `${c}18`,
                    border: `1px solid ${c}44`,
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: `0 0 10px ${c}15`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${c}44`;
                    e.currentTarget.style.borderColor = `${c}aa`;
                    e.currentTarget.style.boxShadow = `0 0 16px ${c}66`;
                    e.currentTarget.style.transform = "scale(1.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${c}18`;
                    e.currentTarget.style.borderColor = `${c}44`;
                    e.currentTarget.style.boxShadow = `0 0 10px ${c}15`;
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {task}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 7, borderTop: `1px solid ${c}1a`, paddingTop: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.color, boxShadow: `0 0 8px ${status.color}` }} />
          <span style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{status.text}</span>
        </div>
      </div>
    </div>
  );
}

import { ZodarkChatDrawer } from "@/components/ZodarkChatDrawer";
import { ZodarkSocialStudio } from "@/components/ZodarkSocialStudio";
import { ZodarkHermesStudio } from "@/components/ZodarkHermesStudio";

/* ── Chat history type ── */
type ChatMessage = { role: "user" | "model"; text: string };

/* ── The world ── */
export default function ApexWorld() {
  const [selected, setSelected] = useState<NodeSel | null>(null);
  const [isSocialStudioOpen, setIsSocialStudioOpen] = useState(false);
  const [isHermesStudioOpen, setIsHermesStudioOpen] = useState(false);
  const [reduced, setReduced] = useState(false);

  // AI conversation state — drives the orb, backdrop and reasoning web
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [lastReply, setLastReply] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [pausedReply, setPausedReply] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  chatHistoryRef.current = chatHistory;

  // Load persistent conversation memory from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zodark_chat_history_memory");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setChatHistory(parsed);
        } catch {}
      }
    }
  }, []);

  // Save persistent conversation memory to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && chatHistory.length > 0) {
      try {
        localStorage.setItem("zodark_chat_history_memory", JSON.stringify(chatHistory.slice(-50)));
      } catch {}
    }
  }, [chatHistory]);

  const handleClearMemory = useCallback(() => {
    setChatHistory([]);
    setLastReply("");
    setPausedReply("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("zodark_chat_history_memory");
    }
  }, []);

  // Send message to Gemini API
  const handleSend = useCallback(async (message: string) => {
    if (!message || !message.trim()) return;
    const cleanMsg = message.trim();

    // Check for voice commands:
    const lower = cleanMsg.toLowerCase();
    if (
      lower === "stop" ||
      lower === "ruko" ||
      lower === "pause" ||
      lower === "chup" ||
      lower === "quiet" ||
      lower === "shut up" ||
      lower.includes("stop") ||
      lower.includes("ruko") ||
      lower.includes("chup") ||
      lower.includes("pause")
    ) {
      if (abortRef.current) abortRef.current.abort();
      voice.cancelSpeech();
      spokenReplyRef.current = "";
      setOrbState("idle");
      return;
    }

    // Command: "continue" / "aage bolo" / "resume"
    if (
      (lower === "continue" || lower === "resume" || lower === "aage bolo" || lower === "boliye" || lower.includes("continue") || lower.includes("aage")) &&
      pausedReply
    ) {
      if (abortRef.current) abortRef.current.abort();
      voice.cancelSpeech();
      spokenReplyRef.current = "";
      setOrbState("speaking");
      setLastReply(pausedReply);
      voice.speak(pausedReply).then(() => {
        setOrbState("idle");
      }).catch(() => {
        setOrbState("idle");
      });
      return;
    }

    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setOrbState("thinking");
    setLastReply("");
    spokenReplyRef.current = "";

    const currentHist = chatHistoryRef.current;
    const newHistory: ChatMessage[] = [...currentHist, { role: "user", text: cleanMsg }];
    setChatHistory(newHistory);

    try {
      let businessProfile = null;
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("zodark_control_hub_settings");
        if (stored) {
          try { businessProfile = JSON.parse(stored); } catch {}
        }
      }

      let finalMsg = cleanMsg;

      // Zodark Digital Marketing, Social Media & Hermes PC Access Agent Trigger
      if (lower.includes("instagram") || lower.includes("facebook") || lower.includes("social") || lower.includes("marketing") || lower.includes("caption") || lower.includes("post")) {
        setIsSocialStudioOpen(true);
      } else if (lower.includes("pc access") || lower.includes("hermes") || lower.includes("automation") || lower.includes("terminal") || lower.includes("system") || lower.includes("file")) {
        setIsHermesStudioOpen(true);
      }

      // Check if request is asking for news / trending topics
      const isNewsQuery = lower.includes("news") || lower.includes("khabar") || lower.includes("trending") || lower.includes("headline") || lower.includes("bulletin");
      if (isNewsQuery) {
        try {
          const nicheQuery = businessProfile?.businessNiche || "technology business AI";
          const newsRes = await fetch(`/api/news?q=${encodeURIComponent(nicheQuery)}`);
          if (newsRes.ok) {
            const newsData = await newsRes.json();
            if (newsData.articles && newsData.articles.length > 0) {
              const headlines = newsData.articles.slice(0, 3).map((a: any, i: number) => `${i + 1}. "${a.title}" (${a.source}) - [Read Article](${a.link})`).join("\n");
              finalMsg = `${cleanMsg}\n\n[LIVE REAL-TIME NEWS HEADLINES WITH CLICKABLE SOURCE LINKS]:\n${headlines}\n\nSummarize these news headlines warmly in JARVIS voice. Include the markdown links [Source Title](url) at the end of your text response so the user can click to read full articles in the Chat Log Drawer!`;
            }
          }
        } catch (e) {
          console.warn("Live news fetch notice:", e);
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: finalMsg, 
          history: currentHist, 
          businessProfile,
          customApiKey: businessProfile?.geminiKey 
        }),
        signal: abortRef.current.signal,
      });

      const data = await res.json();
      const reply = data.reply || "I am connected and ready. Please ask your question.";

      setChatHistory((prev) => [...prev, { role: "model", text: reply }]);
      setLastReply(reply);
      setPausedReply(reply);

      // Trigger speech synthesis
      setOrbState("speaking");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setLastReply("I encountered an issue connecting to my core. Please check your network or API key.");
      setOrbState("idle");
    }
  }, [pausedReply]);

  // Voice I/O Hook with continuous listening, 2s silence detection, and user-interruption handling
  const voice = useVoice({
    silenceTimeoutMs: 2000, // 2-second silence triggers automatic response
    onSpeechComplete: (text) => {
      if (text && text.trim()) {
        handleSend(text);
      }
    },
    onUserSpeaking: () => {
      // User started talking -> Immediate barge-in / interruption
      if (abortRef.current) {
        abortRef.current.abort();
      }
      setOrbState("listening");
    },
    onStopCommand: () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      spokenReplyRef.current = "";
      setOrbState("idle");
    }
  });

  const spokenReplyRef = useRef<string>("");

  // When orbState transitions to 'speaking', speak the reply
  useEffect(() => {
    if (orbState === "speaking" && lastReply && spokenReplyRef.current !== lastReply) {
      spokenReplyRef.current = lastReply;
      voice.speak(lastReply).then(() => {
        setOrbState("idle");
      }).catch(() => {
        setOrbState("idle");
      });
    }
  }, [orbState, lastReply, voice]);

  // Tap orb → toggle continuous voice listening
  const handleOrbTap = useCallback(() => {
    if (voice.isSpeaking) {
      voice.cancelSpeech();
      setOrbState("idle");
      return;
    }

    if (voice.isListening) {
      voice.stopListening();
      setOrbState("idle");
    } else {
      voice.startListening();
      setOrbState("listening");
    }
  }, [voice]);

  // Mic button toggle from chat bar
  const handleMicToggle = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
      setOrbState("idle");
    } else {
      voice.startListening();
      setOrbState("listening");
    }
  }, [voice]);

  // Open agent drawer / studio
  const openAgent = (n: NodeSel) => {
    if (n.key === 'social_media') {
      setIsSocialStudioOpen(true);
    } else if (n.key === 'ops' || n.key === 'chief_of_staff' || n.key === 'developer' || n.key === 'drive') {
      setIsHermesStudioOpen(true);
    } else {
      setSelected(n);
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Sync live hearing state to orb when user is speaking
  const liveSpeech = voice.interimTranscript || voice.transcript;
  useEffect(() => {
    if (liveSpeech && orbState !== "thinking" && orbState !== "speaking") {
      setOrbState("listening");
    }
  }, [liveSpeech, orbState]);

  // Orb state → reasoning web activity level
  const webState = orbState === "thinking" ? "processing"
    : orbState === "speaking" ? "speaking"
    : orbState === "listening" ? "processing"
    : "standby";

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", userSelect: "none" }}>
      {/* backdrop */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 95% 88% at 50% 42%, #122c43 0%, #0c1d30 38%, #07111f 72%, #050b14 100%)",
      }} />

      {/* background waves */}
      {!reduced && (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <ShaderBackground opacity={0.12} voiceActive={orbState === "speaking"} gold={false} />
        </div>
      )}

      {/* cyan LIGHT-CAST */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", mixBlendMode: "screen",
        background: `radial-gradient(circle at 50% 42%, rgba(13,210,255,${orbState === "speaking" ? 0.32 : orbState === "listening" ? 0.26 : 0.18}) 0%, rgba(13,170,228,0.08) 30%, rgba(8,17,31,0) 62%)`,
        transition: "background 0.5s ease",
      }} />

      {/* reasoning web */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <ReasoningWeb
          state={webState}
          mode="full"
          coreless
          onSelect={(n: NodeSel) => { openAgent(n); }}
        />
      </div>

      {/* Accessible agent list */}
      <nav className="visually-hidden" aria-label="Zodark agents">
        <ul>
          {ROSTER.map((a) => (
            <li key={a.key}>
              <button type="button" onClick={() => openAgent({ key: a.key, name: a.name, color: a.color })}>
                {a.name} - {INFO[a.key]?.role ?? "Specialist"}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* the core — painted ABOVE the web */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: "min(560px, 58vw)", height: "min(500px, 56vw, 70vh)", transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "none" }}>
        <ApexHeroOrb state={orbState} interactive={false} />
      </div>

      {/* central tap disc */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zodark core - tap to toggle voice"
        onClick={handleOrbTap}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOrbTap(); } }}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: "min(340px, 36vw)", height: "min(340px, 36vw)", borderRadius: "50%",
          zIndex: 4, cursor: "pointer", background: "transparent", border: "none", userSelect: "none",
        }}
      />

      {/* status bar */}
      <OrbStatusBar state={orbState} />

      {/* Continuous Chat & Voice Bar */}
      <ZodarkChatBar
        onSend={handleSend}
        onMicToggle={handleMicToggle}
        isListening={voice.isListening}
        isProcessing={orbState === "thinking"}
        isSpeaking={orbState === "speaking"}
        lastReply={lastReply}
        liveSpeech={liveSpeech}
      />

      {selected && (
        <AgentOverview
          sel={selected}
          onClose={() => setSelected(null)}
          onSelectSkill={(agentName, taskPrompt) => {
            handleSend(`[${agentName} Agent] ${taskPrompt}`);
          }}
        />
      )}

      {/* Social Media & Browser Automation Studio Modal */}
      <ZodarkSocialStudio
        isOpen={isSocialStudioOpen}
        onClose={() => setIsSocialStudioOpen(false)}
      />

      {/* Hermes Local PC Automation Studio Modal */}
      <ZodarkHermesStudio
        isOpen={isHermesStudioOpen}
        onClose={() => setIsHermesStudioOpen(false)}
      />

      {/* Integrated Zodark Live Interactive Browser Modal */}
      <ZodarkLiveBrowser
        isOpen={isLiveBrowserOpen}
        initialUrl={liveBrowserUrl}
        initialQuery={liveBrowserQuery}
        onClose={() => setIsLiveBrowserOpen(false)}
      />

      {/* Right-Side Slide-out Memory & Links Drawer */}
      <ZodarkChatDrawer
        history={chatHistory}
        onClearMemory={handleClearMemory}
      />
    </div>
  );
}
