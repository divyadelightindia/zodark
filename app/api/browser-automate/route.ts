import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform = 'instagram', postText, imageUrl, hashtags = [], query } = body as {
      platform?: string;
      postText: string;
      imageUrl?: string;
      hashtags?: string[];
      query?: string;
    };

    let targetUrl = 'https://www.instagram.com/';
    let action = 'open_url';
    if (platform === 'facebook') targetUrl = 'https://www.facebook.com/';
    else if (platform === 'linkedin') targetUrl = 'https://www.linkedin.com/feed/';
    else if (platform === 'youtube') {
      targetUrl = 'https://www.youtube.com/';
      action = query ? 'search_youtube' : 'open_url';
    } else if (platform === 'chatgpt') {
      targetUrl = 'https://chatgpt.com/';
      action = query ? 'chatgpt_prompt' : 'open_url';
    }

    const scriptPath = path.join(process.cwd(), 'service', 'zodark-human-agent.js');
    
    if (fs.existsSync(scriptPath)) {
      // Trigger Playwright Human Agent in Side-by-Side visible window!
      const encodedQuery = query ? encodeURIComponent(query) : '';
      const cmd = `node "${scriptPath}" --action=${action} --url="${targetUrl}" --query="${encodedQuery}"`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) console.warn("[Browser Automate Bridge Notice]:", stderr || err.message);
        else console.log("[Browser Automate Bridge Success]:", stdout);
      });
    } else {
      // Fallback: Launch side-by-side Chrome browser window (right half of screen)
      const chromeCmd = `start chrome --new-window --window-position=950,50 --window-size=950,980 "${targetUrl}"`;
      exec(chromeCmd);
    }

    return NextResponse.json({
      success: true,
      platform,
      message: `🚀 Zodark Human Automation Agent Active! Opening ${platform.toUpperCase()} side-by-side on your screen...`,
      targetUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Browser Automate Bridge Error:", error);
    return NextResponse.json(
      { error: "Failed to trigger Playwright browser automation." },
      { status: 500 }
    );
  }
}
