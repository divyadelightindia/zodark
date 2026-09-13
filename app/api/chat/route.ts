import { NextResponse } from 'next/server';
import os from 'os';
import { exec } from 'child_process';
import { captureScreenBase64, typeTextOS, pressKeyOS } from '@/service/zodark-vision';

export const dynamic = 'force-dynamic';

const SYSTEM_INSTRUCTION = `You are Zodark, an advanced executive AI assistant with REAL-TIME ACTIVE VISION ("Zodark Ki Aankhein") and FULL OS OPERATOR AUTOMATION ("Clicking & Writing Active").

OPERATOR & VISION DIRECTIVES:
1. REAL-TIME VISION ("ZODARK KI AANKHEIN"): You have direct real-time vision access to the user's PC screen. When a screenshot is attached to the user message, analyze it with 100% precision and describe the exact video clip, search bar, text, buttons, or webpage currently visible on their screen.
2. OPERATOR AUTOMATION ("CLICKING & WRITING"): When the user asks to open YouTube, Google, ChatGPT, Instagram, Facebook, LinkedIn, type text, or search the web, check [ZODARK OPERATOR ENGINE NOTE] in the prompt. IF an action was executed, confirm it warmly. IF NO ACTION WAS EXECUTED, NEVER CLAIM OR LIE THAT YOU OPENED A BROWSER WINDOW!
3. LOGINS & TABS: All launched sites open in their active Chrome browser right next to localhost:3000 (+ new tab) with their active signed-in accounts.
4. LANGUAGE & SCRIPT MANDATE (STRICT): YOU MUST ALWAYS WRITE AND SPEAK IN HINGLISH USING ENGLISH ALPHABETS / ROMAN SCRIPT ONLY (e.g. "Bhai, maine browser open kar diya hai"). NEVER OUTPUT DEVNAGARI HINDI CHARACTERS (e.g. NEVER write "भाई, मैंने ब्राउज़र ओपन कर दिया है"). ALWAYS USE ROMAN ALPHABETS FOR HINGLISH.
5. TONE & VOICE DIALOGUE: Speak naturally, warmly, and politely in clear Hinglish. Address the user respectfully as "Sir" or "Bhai".
6. CONCISENESS: Keep answers short, direct, and conversational (2 to 3 sentences max).`;

const FAST_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

/**
 * Normalizes Hindi Devnagari and Hinglish transliterations into standard English keywords
 */
function normalizeText(text: string): string {
  let s = text.toLowerCase();
  s = s.replace(/ब्राउज़र|ब्राउजर|ब्राउज़र|ब्राउसर|ब्रोव्सेर/g, 'browser');
  s = s.replace(/ओपन|खोलो|खोल|चालू|लॉन्च|स्टार्ट/g, 'open');
  s = s.replace(/गूगल|गुगल/g, 'google');
  s = s.replace(/यूट्यूब|युटुब|यूटयूब|युट्युब/g, 'youtube');
  s = s.replace(/इंस्टाग्राम|इंस्टा/g, 'instagram');
  s = s.replace(/फेसबुक|एफबी/g, 'facebook');
  s = s.replace(/चैटजीपीटी|चैट जीपीटी/g, 'chatgpt');
  s = s.replace(/सर्च|ढूंढो|खोजो|ढूंढ/g, 'search');
  s = s.replace(/चलाओ|प्ले|सुनाओ/g, 'play');
  s = s.replace(/रोको|पॉज/g, 'pause');
  s = s.replace(/टाइप|लिखो|लिखे|लिख/g, 'type');
  return s;
}

/**
 * Extracts custom domain/website URL (e.g. jordar.in) or search query from user message
 */
function extractDomainOrQuery(msg: string): { url: string | null; description: string } {
  // 1. Check for explicit URL or domain name (e.g. jordar.in, google.com, mywebsite.co.in)
  const urlRegex = /(?:https?:\/\/)?([a-zA-Z0-9-]+\.(?:com|in|org|net|co|io|ai|app|gov|edu|dev|me|tech|site|online|xyz)(?:\/[^\s]*)?)/i;
  const match = msg.match(urlRegex);
  
  if (match && match[1]) {
    let domain = match[1].trim();
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = 'https://' + domain;
    }
    return { url: domain, description: `Opened website "${domain}" in active Chrome browser.` };
  }

  // 2. Check for "website open", "site open", "search for X"
  const siteMatch = msg.match(/(?:website|site|web|par)\s+(?:open|kholo|search|dekho)?\s*([a-zA-Z0-9\s.]+)/i) ||
                    msg.match(/(?:open|kholo|search)\s+(?:website|site)?\s*([a-zA-Z0-9\s.]+)/i);
  
  if (siteMatch && siteMatch[1]) {
    const rawName = siteMatch[1].replace(/open|kholo|search|website|site|wali|par|pe|kijiye|karo|bhai/gi, '').trim();
    if (rawName && rawName.length > 2) {
      if (rawName.includes('.')) {
        const fullUrl = 'https://' + rawName.replace(/\s+/g, '');
        return { url: fullUrl, description: `Opened website "${fullUrl}" in active Chrome browser.` };
      }
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(rawName)}`;
      return { url: searchUrl, description: `Searched "${rawName}" on Google in active Chrome browser.` };
    }
  }

  return { url: null, description: '' };
}

/**
 * Handles Zodark Human Operator PC Browser & OS Automation
 */
function handleInternalBrowserAutomation(msg: string): { executed: boolean; description: string; openUrl?: string } {
  const lower = normalizeText(msg);

  let openUrl = '';
  let description = '';

  // Handle Play/Pause
  if ((lower.includes('play') || lower.includes('pause')) && (lower.includes('video') || lower.includes('song') || lower.includes('chalao') || lower.includes('roko'))) {
    pressKeyOS(' '); // Spacebar toggles video play/pause on YouTube / browsers
    return {
      executed: true,
      description: 'Toggled video Play/Pause on active screen.'
    };
  }

  // Handle Typing / Writing
  if ((lower.includes('type') || lower.includes('write') || lower.includes('likho')) && !lower.includes('youtube') && !lower.includes('google')) {
    const typeMatch = lower.match(/(?:type|write|likho)\s+(.+)/i);
    if (typeMatch && typeMatch[1]) {
      const textToType = typeMatch[1].trim();
      typeTextOS(textToType);
      return {
        executed: true,
        description: `Typed "${textToType}" into focused input box on active screen.`
      };
    }
  }

  // Check for custom domain / website request FIRST (e.g. jordar.in, amazon.in)
  const customSite = extractDomainOrQuery(msg);
  if (customSite.url) {
    openUrl = customSite.url;
    description = customSite.description;
  } else if (lower.includes('youtube')) {
    let query = '';
    const searchMatch = lower.match(/(?:search|play|find|par|pe|sunao|chalao)\s+(.+)/i);
    if (searchMatch && searchMatch[1]) {
      query = searchMatch[1].replace(/youtube|open|kholo|search|par|pe|karo|chalao|play/gi, '').trim();
    }
    if (query) {
      openUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      description = `Searched "${query}" on YouTube in active Chrome browser.`;
    } else {
      openUrl = `https://www.youtube.com`;
      description = `Opened YouTube in active Chrome browser.`;
    }
  } else if (lower.includes('google')) {
    let query = '';
    const searchMatch = lower.match(/(?:search|find|par|pe|do|poochho)\s+(.+)/i);
    if (searchMatch && searchMatch[1]) {
      query = searchMatch[1].replace(/google|open|kholo|search|par|pe|karo/gi, '').trim();
    }
    if (query) {
      openUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      description = `Searched "${query}" on Google in active Chrome browser.`;
    } else {
      openUrl = `https://www.google.com`;
      description = `Opened Google in active Chrome browser.`;
    }
  } else if (lower.includes('chatgpt')) {
    openUrl = `https://chatgpt.com`;
    description = `Opened ChatGPT in active Chrome browser.`;
  } else if (lower.includes('instagram')) {
    openUrl = `https://www.instagram.com`;
    description = `Opened Instagram in active Chrome browser.`;
  } else if (lower.includes('facebook')) {
    openUrl = `https://www.facebook.com`;
    description = `Opened Facebook in active Chrome browser.`;
  } else if (lower.includes('linkedin')) {
    openUrl = `https://www.linkedin.com`;
    description = `Opened LinkedIn in active Chrome browser.`;
  } else if (lower.includes('browser') || lower.includes('open') || lower.includes('kholo') || lower.includes('launch') || lower.includes('nahi hua') || lower.includes('firse')) {
    openUrl = `https://www.google.com`;
    description = `Opened Chrome Browser tab.`;
  }

  if (openUrl) {
    try {
      exec(`start chrome "${openUrl}"`, (err) => {
        if (err) console.warn("[Zodark Browser Exec Notice]:", err.message);
      });
    } catch (e) {
      console.warn("[Zodark Browser Exec Exception]:", e);
    }

    return {
      executed: true,
      description,
      openUrl
    };
  }

  return { executed: false, description: '' };
}

/**
 * Checks if the message requires Zodark's Real-Time Active Screen Vision
 */
function isVisionIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  const visionKeywords = [
    'screen', 'dekh', 'dikhta', 'video', 'clip', 'kya hai', 'padho', 
    'view', 'screenshot', 'show', 'page', 'chal raha', 'image', 'look', 
    'dikh', 'batao', 'aankh', 'aankhein', 'puchh', 'poochh'
  ];
  return visionKeywords.some(kw => lower.includes(kw));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, businessProfile, customApiKey, clientScreenshot } = body as { 
      message: string; 
      history: { role: 'user' | 'model'; text: string }[];
      customApiKey?: string;
      clientScreenshot?: string;
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

    // Process Internal Zodark Browser & OS Automation
    const actionResult = handleInternalBrowserAutomation(message);

    // Check if Vision is requested or needed
    const needsVision = isVisionIntent(message);
    let screenshotBase64: string | null = clientScreenshot || null;
    if (!screenshotBase64 && needsVision) {
      screenshotBase64 = captureScreenBase64();
    }

    const totalMemGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
    const freeMemGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
    const systemContext = `\nREAL-TIME ZODARK PC OPERATOR & VISION STATUS:
- OS Platform: Windows (${os.release()}, ${os.arch()})
- Host Name: ${os.hostname()}
- Memory: Total ${totalMemGB} GB, Free ${freeMemGB} GB
- Real-Time Desktop Vision ("Zodark Ki Aankhein"): ${screenshotBase64 ? 'ACTIVE CAPTURED' : (needsVision ? 'ATTEMPTED' : 'READY')}
${actionResult.executed ? `- PC AUTOMATION EXECUTED: ${actionResult.description}` : ''}`;

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

    let userParts: any[] = [];

    // Attach Base64 screenshot image if Vision is active!
    if (screenshotBase64) {
      // Remove any data URL prefix if present
      const cleanB64 = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
      userParts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanB64
        }
      });
    }

    let finalPromptText = message.trim();
    if (actionResult.executed) {
      finalPromptText += `\n\n[ZODARK OPERATOR ENGINE NOTE]: Action "${actionResult.description}" HAS BEEN EXECUTED DIRECTLY ON THE USER'S PC SCREEN! Warmly inform the user in Hinglish what was done.`;
    }
    if (screenshotBase64) {
      finalPromptText += `\n\n[ZODARK VISION ENGINE NOTE]: The attached PNG image is a REAL-TIME SCREENSHOT of the user's active screen taken RIGHT NOW! Analyze what video, text, or webpage is visible on screen and answer the user's question with 100% precision.`;
    }

    userParts.push({ text: finalPromptText });

    contents.push({
      role: 'user',
      parts: userParts
    });

    const requestBody = {
      systemInstruction: {
        parts: [{ text: dynamicInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
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
          console.warn(`[ZODARK CHAT] Model ${model} returned error:`, errData);
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

    return NextResponse.json({ reply: replyText.trim(), openUrl: actionResult.openUrl || null });

  } catch (error) {
    console.error("Chat API Route Error:", error);
    return NextResponse.json(
      { reply: "Kuch technical issue aa gaya hai. Kripya dobara poochhein.", error: true },
      { status: 500 }
    );
  }
}


