"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Cpu,
  HardDrive,
  Activity,
  FolderSearch,
  Play,
  RotateCcw,
  Copy,
  Check,
  X,
  ShieldAlert,
  Server,
  FileCode,
  Zap,
} from "lucide-react";

interface ZodarkHermesStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemStats {
  platform: string;
  type: string;
  release: string;
  arch: string;
  hostname: string;
  uptimeSeconds: number;
  cpuModel: string;
  cpuCores: number;
  totalMemoryGB: string;
  freeMemoryGB: string;
  usedMemoryGB: string;
  memUsagePct: number;
  userInfo: string;
  cwd: string;
  hermesServiceExists: boolean;
}

export function ZodarkHermesStudio({ isOpen, onClose }: ZodarkHermesStudioProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [commandInput, setCommandInput] = useState("dir");
  const [terminalLogs, setTerminalLogs] = useState<
    { type: "cmd" | "out" | "err" | "info"; text: string; time: string }[]
  >([
    {
      type: "info",
      text: "[ZODARK HERMES SYSTEM AUTOMATION BRIDGE ENGINE INITIALIZED]",
      time: new Date().toLocaleTimeString(),
    },
    {
      type: "info",
      text: "Connected to local PC shell process. Type any Windows CLI / PowerShell command below or click a quick action preset.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"terminal" | "search">("terminal");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; isDir: boolean; path: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal log
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Fetch live system metrics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/hermes");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun || commandInput).trim();
    if (!cmd || isExecuting) return;

    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, { type: "cmd", text: `> ${cmd}`, time: timeStr }]);
    setIsExecuting(true);

    try {
      const res = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "command", command: cmd }),
      });
      const data = await res.json();
      const resultTime = new Date().toLocaleTimeString();

      if (data.success) {
        setTerminalLogs((prev) => [
          ...prev,
          { type: "out", text: data.output || "[Command completed cleanly with no output]", time: resultTime },
        ]);
      } else {
        setTerminalLogs((prev) => [
          ...prev,
          { type: "err", text: data.output || data.error || "Execution error", time: resultTime },
        ]);
      }
    } catch (err: any) {
      setTerminalLogs((prev) => [
        ...prev,
        { type: "err", text: `Network error: ${err.message}`, time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsExecuting(false);
      setCommandInput("");
    }
  };

  const handleFileSearch = async () => {
    if (isSearching) return;
    setIsSearching(true);
    try {
      const res = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "file_search", query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRunHermesBootstrap = async () => {
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      ...prev,
      { type: "cmd", text: "> Launching Local Hermes Python Agent (hermes_bootstrap.py)...", time: timeStr },
    ]);
    setIsExecuting(true);

    try {
      const res = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hermes_bootstrap" }),
      });
      const data = await res.json();
      setTerminalLogs((prev) => [
        ...prev,
        {
          type: data.success ? "out" : "err",
          text: data.output || "Hermes Agent response",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      setTerminalLogs((prev) => [
        ...prev,
        { type: "err", text: err.message, time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyTerminalOutput = () => {
    const fullText = terminalLogs.map((l) => `[${l.time}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(2, 6, 12, 0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          height: "min(720px, 90vh)",
          background: "linear-gradient(145deg, rgba(8, 15, 26, 0.95) 0%, rgba(4, 8, 16, 0.98) 100%)",
          border: "1px solid rgba(0, 229, 255, 0.25)",
          borderRadius: "20px",
          boxShadow: "0 0 50px rgba(0, 229, 255, 0.15), 0 20px 40px rgba(0, 0, 0, 0.8)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(0, 229, 255, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(90deg, rgba(0, 229, 255, 0.08) 0%, transparent 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(0, 229, 255, 0.12)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#00e5ff",
                boxShadow: "0 0 15px rgba(0, 229, 255, 0.2)",
              }}
            >
              <Terminal size={22} />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", letterSpacing: "0.05em" }}>
                HERMES LOCAL PC AUTOMATION STUDIO
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.45)", letterSpacing: "0.04em" }}>
                Local Terminal Execution • Process Control • System Diagnostics & File Engine
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={fetchStats}
              disabled={loadingStats}
              title="Refresh System Stats"
              style={{
                background: "rgba(0, 229, 255, 0.1)",
                border: "1px solid rgba(0, 229, 255, 0.25)",
                color: "#00e5ff",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              <RotateCcw size={14} className={loadingStats ? "animate-spin" : ""} />
              Stats
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.6)",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live System Diagnostics Dashboard Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            padding: "14px 24px",
            background: "rgba(0, 0, 0, 0.25)",
            borderBottom: "1px solid rgba(0, 229, 255, 0.1)",
          }}
        >
          {/* CPU Card */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(0, 229, 255, 0.04)",
              border: "1px solid rgba(0, 229, 255, 0.12)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Cpu size={20} color="#00e5ff" />
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                CPU Architecture
              </div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>
                {stats ? `${stats.cpuCores} Cores (${stats.arch})` : "Loading..."}
              </div>
            </div>
          </div>

          {/* Memory RAM Card */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(245, 166, 35, 0.04)",
              border: "1px solid rgba(245, 166, 35, 0.15)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <HardDrive size={20} color="#f5a623" />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                RAM Memory Used
              </div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>
                {stats ? `${stats.usedMemoryGB} / ${stats.totalMemoryGB} GB (${stats.memUsagePct}%)` : "Loading..."}
              </div>
            </div>
          </div>

          {/* Uptime Card */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(52, 211, 153, 0.04)",
              border: "1px solid rgba(52, 211, 153, 0.15)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Activity size={20} color="#34d399" />
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                System Uptime
              </div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#fff" }}>
                {stats ? formatUptime(stats.uptimeSeconds) : "Loading..."}
              </div>
            </div>
          </div>

          {/* Hermes Agent Status */}
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(168, 85, 247, 0.04)",
              border: "1px solid rgba(168, 85, 247, 0.15)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Server size={20} color="#a855f7" />
            <div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                Hermes Agent Service
              </div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#a855f7" }}>
                {stats?.hermesServiceExists ? "Ready (service/hermes-agent)" : "Not Detected"}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector & Presets Bar */}
        <div
          style={{
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("terminal")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: activeTab === "terminal" ? "rgba(0, 229, 255, 0.15)" : "transparent",
                border: activeTab === "terminal" ? "1px solid rgba(0, 229, 255, 0.3)" : "1px solid transparent",
                color: activeTab === "terminal" ? "#00e5ff" : "rgba(255, 255, 255, 0.5)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Terminal size={14} /> CLI Terminal Console
            </button>

            <button
              onClick={() => setActiveTab("search")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: activeTab === "search" ? "rgba(0, 229, 255, 0.15)" : "transparent",
                border: activeTab === "search" ? "1px solid rgba(0, 229, 255, 0.3)" : "1px solid transparent",
                color: activeTab === "search" ? "#00e5ff" : "rgba(255, 255, 255, 0.5)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FolderSearch size={14} /> Local File Inspector
            </button>
          </div>

          {/* Preset Command Buttons */}
          {activeTab === "terminal" && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleExecuteCommand("git status")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Git Status
              </button>
              <button
                onClick={() => handleExecuteCommand("tasklist")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Processes
              </button>
              <button
                onClick={() => handleExecuteCommand("dir")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                List Files
              </button>
              <button
                onClick={handleRunHermesBootstrap}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  background: "rgba(168, 85, 247, 0.15)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  color: "#d8b4fe",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Zap size={12} /> Hermes Python Agent
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "16px 24px" }}>
          {activeTab === "terminal" ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "rgba(2, 6, 12, 0.9)",
                border: "1px solid rgba(0, 229, 255, 0.15)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {/* Terminal Title Bar */}
              <div
                style={{
                  padding: "8px 14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)" }}>
                  Windows PowerShell • {stats?.cwd || "C:\\Workspace"}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setTerminalLogs([])}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Clear Console
                  </button>
                  <button
                    onClick={copyTerminalOutput}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#00e5ff",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Terminal Logs Scroll Window */}
              <div
                style={{
                  flex: 1,
                  padding: "14px",
                  overflowY: "auto",
                  fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontSize: "12px",
                  lineHeight: "1.6",
                }}
              >
                {terminalLogs.map((log, index) => (
                  <div key={index} style={{ marginBottom: "6px", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", marginRight: "8px" }}>
                      [{log.time}]
                    </span>
                    {log.type === "cmd" && <span style={{ color: "#00e5ff", fontWeight: "600" }}>{log.text}</span>}
                    {log.type === "out" && <span style={{ color: "#e2e8f0" }}>{log.text}</span>}
                    {log.type === "err" && <span style={{ color: "#f87171" }}>{log.text}</span>}
                    {log.type === "info" && <span style={{ color: "#f5a623" }}>{log.text}</span>}
                  </div>
                ))}
                {isExecuting && (
                  <div style={{ color: "#00e5ff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="animate-pulse">⚡ Executing command on local PC...</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Command Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteCommand();
                }}
                style={{
                  display: "flex",
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.4)",
                  borderTop: "1px solid rgba(0, 229, 255, 0.15)",
                  gap: "10px",
                }}
              >
                <div style={{ color: "#00e5ff", fontWeight: "bold", fontSize: "13px", alignSelf: "center" }}>
                  PS&gt;
                </div>
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Type a CLI command (e.g. dir, node -v, git status)..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#fff",
                    fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                    fontSize: "13px",
                  }}
                />
                <button
                  type="submit"
                  disabled={isExecuting || !commandInput.trim()}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)",
                    border: "none",
                    color: "#04080f",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: isExecuting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Play size={14} /> Run
                </button>
              </form>
            </div>
          ) : (
            /* File Search Inspector Tab */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search filenames in project directory (e.g. .ts, package, route)..."
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    background: "rgba(4, 8, 16, 0.8)",
                    border: "1px solid rgba(0, 229, 255, 0.2)",
                    borderRadius: "10px",
                    color: "#fff",
                    outline: "none",
                    fontSize: "13px",
                  }}
                />
                <button
                  onClick={handleFileSearch}
                  disabled={isSearching}
                  style={{
                    padding: "10px 20px",
                    background: "#00e5ff",
                    border: "none",
                    borderRadius: "10px",
                    color: "#04080f",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FolderSearch size={16} /> Search Files
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  background: "rgba(2, 6, 12, 0.9)",
                  border: "1px solid rgba(0, 229, 255, 0.15)",
                  borderRadius: "12px",
                  padding: "14px",
                  overflowY: "auto",
                }}
              >
                {searchResults.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "40px", fontSize: "13px" }}>
                    Click "Search Files" to inspect workspace directory files.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {searchResults.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 14px",
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {item.isDir ? <FileCode size={18} color="#f5a623" /> : <FileCode size={18} color="#00e5ff" />}
                          <span style={{ fontSize: "13px", color: "#fff" }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{item.path}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
