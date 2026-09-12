import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `You are Zodark, an advanced executive AI agent and business automation intelligence inspired by top-tier executive systems (like JARVIS).

INTEGRATED LIVE BROWATION DIRECTIVE:
1. YOU ARE FULLY EQUIPPED WITH AN EMBEDDED INTEGRATED LIVE BROWSER DIRECTLY INSIDE THE ZODARK APP UI.
2. WHEN THE USER ASKS TO OPEN YOUTUBE, GOOGLE, CHATGAT, INSTAGRAM, FACEBOOK, LINKEDIN, OR SEARCH THE WEB, YOU AUTOMATICALLY OPEN THE EMBEDDED BROWSER MODAL DIRECTLY INSIDE ZODARK.
3. YOU DO NOT OPEN EXTERNAL BACKGROUND WINDOWS. EVERYTHING OPERATES 100% INSIDE ZODARK'S UI CONTAINER WHERE THE USER CAN LOG IN, BROWSE, AND AUTOMATE SOCIAL MEDIA.
4. NEVER EVER SAY "I cannot open physical browser windows", "I lack UI control", OR "As an AI assistant I am unable to access your PC". State with full executive confidence that the integrated Zodark Live Browser is open directly on their screen right now!
5. TONE & BEHAVIOR: Professional, executive, polite, and confident at all times. Address the user respectfully as "Sir".
6. CONCISENESS: Keep answers short, direct, and actionable (2 to 3 sentences max).`;

const FAST_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash'
];

/**
 * Handles Zodark Integrated Live Browser Automation without launching external popups
 */
function handleInternalBrowserAutomation(msg: string): { executed: boolean; description: string } {
  const lower = msg.toLowerCase();

  if (lower.includes('youtube')) {
    let query = '';
    const searchMatch = lower.match(/(?:search|play|find|par|pe|sunao)\s+(.+)/i);
    if (searchMatch && searchMatch[1]) {
      query = searchMatch[1].replace(/youtube|open|kholo|search|par|pe|karo/gi, '').trim();
    }
    return {
      executed: true,
      description: query
        ? `Opened Zodark Integrated Browser on YouTube with search query "${query}".`
        : 'Opened YouTube inside Zodark Integrated Live Browser.'
    };
  }

  if (lower.includes('google')) {
    return {
      executed: true,
      description: 'Opened Google Search inside Zodark Integrated Live Browser.'
    };
  }

  if (lower.includes('chatgpt')) {
    return {
      executed: true,
      description: 'Opened ChatGPT inside Zodark Integrated Live Browser.'
    };
  }

  if (lower.includes('instagram')) {
    return {
      executed: true,
      description: 'Opened Instagram inside Zodark Integrated Live Browser.'
    };
  }

  if (lower.includes('facebook')) {
    return {
      executed: true,
      description: 'Opened Facebook inside Zodark Integrated Live Browser.'
    };
  }

  if (lower.includes('linkedin')) {
    return {
      executed: true,
      description: 'Opened LinkedIn inside Zodark Integrated Live Browser.'
    };
  }

  if (lower.includes('browser') || lower.includes('search') || lower.includes('kholo')) {
    return {
      executed: true,
      description: 'Opened Zodark Integrated Live Browser directly inside Zodark UI.'
    };
  }

  return { executed: false, description: '' };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, businessProfile, customApiKey } = body as { 
      message: string; 
      history: { role: 'user' | 'model'; text: string }[];
      customApiKey?: string;
      businessProfile?: {
        businessName?: string;
        websiteUrl?: string;
        businessNiche?: string;
        targetAudience?: string;
        brandTone?: string;
        socialHandles?: string;
      }
    };

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return NextResponse.json(
        { reply: "System configuration notice: GEMINI_API_KEY is missing. Please enter your API key in Settings or .env.local.", error: true },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { reply: "Please provide a message.", error: true },
        { status: 400 }
      );
    }

    // Process Internal Zodark Browser Automation
    const actionResult = handleInternalBrowserAutomation(message);

    const totalMemGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
    const freeMemGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
    const systemContext = `\nREAL-TIME ZODARK EMBEDDED BROWSER AUTOMATION STATUS:
- OS Platform: Windows (${os.release()}, ${os.arch()})
- Host Name: ${os.hostname()}
- Memory: Total ${totalMemGB} GB, Free ${freeMemGB} GB
${actionResult.executed ? `- INTEGRATED ZODARK LIVE BROWSER ACTIVE: ${actionResult.description}` : ''}`;

    let dynamicInstruction = SYSTEM_INSTRUCTION + systemContext;
    if (businessProfile && businessProfile.businessName) {
      dynamicInstruction += `\n\nACTIVE USER BUSINESS BRAND CONTEXT:
- Business Name: ${businessProfile.businessName}
- Business Niche: ${businessProfile.businessNiche || 'General'}`;
    }

    const contents = [];
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const item of recentHistory) {
        if (item.text && item.text.trim()) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }]
          });
        }
      }
    }

    let finalPromptText = message.trim();
    if (actionResult.executed) {
      finalPromptText += `\n\n[ZODARK BROWSER ENGINE NOTE]: The action "${actionResult.description}" HAS BEEN OPENED DIRECTLY INSIDE ZODARK'S EMBEDDED LIVE BROWSER MODAL ON THE SCREEN! Confirm to the user that everything is active inside Zodark without opening external popups!`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: finalPromptText }]
    });

    const requestBody = {
      systemInstruction: {
        parts: [{ text: dynamicInstruction }]
      },
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 180,
      },
      contents: contents
    };

    let replyText: string | null = null;
    let lastError: string = '';

    for (const model of FAST_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) break;
        } else {
          const errData = await response.text();
          lastError = `${model} ${response.status}: ${errData}`;
        }
      } catch (err) {
        lastError = (err as Error).message;
      }
    }

    if (!replyText) {
      return NextResponse.json(
        { reply: "Main abhi connect nahi ho pa raha hoon. Kripya thodi der baad dobara koshish karein.", error: true },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: replyText.trim() });

  } catch (error) {
    console.error("Chat API Route Error:", error);
    return NextResponse.json(
      { reply: "Kuch technical issue aa gaya hai. Kripya dobara poochhein.", error: true },
      { status: 500 }
    );
  }
}
