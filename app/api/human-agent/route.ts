import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action = "open_url", url = "https://www.google.com", query = "", caption = "", platform = "instagram" } = body;

    console.log(`[Zodark Human Agent API] Executing action=${action}, platform=${platform}, url=${url}, query="${query}"`);

    const agentScript = path.join(process.cwd(), "service", "zodark-human-agent.js");
    const safeQuery = encodeURIComponent(query || caption || "");
    const command = `node "${agentScript}" --action=${action} --platform=${platform} --url="${url}" --query="${safeQuery}"`;

    // Execute local human agent automation process asynchronously
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[Zodark Human Agent API Error]:", error);
      } else {
        console.log("[Zodark Human Agent Output]:", stdout);
      }
    });

    return NextResponse.json({
      success: true,
      message: `Human Operator Agent launched for ${platform || 'action'}.`,
      action,
      platform,
    });
  } catch (err: any) {
    console.error("[Zodark Human Agent API Exception]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to launch Human Agent" },
      { status: 500 }
    );
  }
}
