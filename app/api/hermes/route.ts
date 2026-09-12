import { NextResponse } from "next/server";
import { exec } from "child_process";
import os from "os";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePct = Math.round((usedMem / totalMem) * 100);

    const systemStats = {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: Math.floor(os.uptime()),
      cpuModel: cpus[0]?.model || "Unknown CPU",
      cpuCores: cpus.length,
      totalMemoryGB: (totalMem / (1024 * 1024 * 1024)).toFixed(2),
      freeMemoryGB: (freeMem / (1024 * 1024 * 1024)).toFixed(2),
      usedMemoryGB: (usedMem / (1024 * 1024 * 1024)).toFixed(2),
      memUsagePct,
      userInfo: os.userInfo().username,
      cwd: process.cwd(),
      hermesServiceExists: fs.existsSync(path.join(process.cwd(), "service", "hermes-agent")),
    };

    return NextResponse.json({ success: true, stats: systemStats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch system stats" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { action, command, query, targetPath } = body;

    // Action 1: Execute terminal command
    if (action === "command" || command) {
      const cmdToRun = command || "dir";

      // Basic security check: disallow high-risk destructive commands
      const lower = cmdToRun.toLowerCase();
      const forbidden = ["rmdir /s", "del /f /s /q c:\\", "format ", "shutdown /s", "mkfs"];
      if (forbidden.some((f) => lower.includes(f))) {
        return NextResponse.json(
          { success: false, output: "Command blocked by Zodark Security Filter." },
          { status: 400 }
        );
      }

      return new Promise<NextResponse>((resolve) => {
        exec(cmdToRun, { cwd: targetPath || process.cwd(), timeout: 15000 }, (err, stdout, stderr) => {
          if (err && !stdout) {
            resolve(
              NextResponse.json({
                success: false,
                output: stderr || err.message || "Command execution failed.",
              })
            );
          } else {
            resolve(
              NextResponse.json({
                success: true,
                output: (stdout || stderr || "Command executed with no output.").trim(),
              })
            );
          }
        });
      });
    }

    // Action 2: File search
    if (action === "file_search") {
      const searchTerm = (query || "").toLowerCase();
      const searchDir = targetPath || process.cwd();

      try {
        const files = fs.readdirSync(searchDir, { withFileTypes: true });
        const results = files
          .filter((f) => !searchTerm || f.name.toLowerCase().includes(searchTerm))
          .slice(0, 30)
          .map((f) => ({
            name: f.name,
            isDir: f.isDirectory(),
            path: path.join(searchDir, f.name),
          }));

        return NextResponse.json({ success: true, dir: searchDir, results });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
      }
    }

    // Action 3: Launch/check Hermes Agent python script
    if (action === "hermes_bootstrap") {
      const hermesDir = path.join(process.cwd(), "service", "hermes-agent");
      if (!fs.existsSync(hermesDir)) {
        return NextResponse.json({
          success: false,
          output: "Hermes agent directory not found at service/hermes-agent",
        });
      }

      return new Promise<NextResponse>((resolve) => {
        exec("python hermes_bootstrap.py --help", { cwd: hermesDir, timeout: 10000 }, (err, stdout, stderr) => {
          resolve(
            NextResponse.json({
              success: true,
              output: (stdout || stderr || "Hermes agent service ready.").trim(),
            })
          );
        });
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
