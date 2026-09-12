import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FAST_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash'
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform = 'instagram', topic, businessProfile, customApiKey } = body as {
      platform?: string;
      topic?: string;
      businessProfile?: {
        businessName?: string;
        websiteUrl?: string;
        businessNiche?: string;
        targetAudience?: string;
        brandTone?: string;
        socialHandles?: string;
      };
      customApiKey?: string;
    };

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is required to compose posts." },
        { status: 400 }
      );
    }

    const businessName = businessProfile?.businessName || "My Business";
    const niche = businessProfile?.businessNiche || "Technology & AI";
    const audience = businessProfile?.targetAudience || "Entrepreneurs & Tech Enthusiasts";
    const tone = businessProfile?.brandTone || "Professional, Engaging & High Energy";
    const queryTopic = topic?.trim() || `Top trends and innovation in ${niche}`;

    const promptText = `You are Zodark, an expert Social Media Strategist & Content Creator.
Compose a high-converting social media post for ${platform.toUpperCase()} for brand "${businessName}".

Target Niche: ${niche}
Target Audience: ${audience}
Brand Tone: ${tone}
Topic / Focus: ${queryTopic}

Provide your response strictly in valid JSON format with the following keys:
{
  "hook": "An attention-grabbing 1-line hook/title",
  "caption": "The main post body formatted with line breaks, emojis, and valuable insights tailored for ${platform}",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
  "imagePrompt": "A highly descriptive AI image generation prompt (in English) depicting visual concepts related to this post",
  "cta": "A clear Call to Action (e.g. Save this post, Visit our link in bio, Comment your thoughts below)"
}

Do not include markdown code block syntax (like \`\`\`json). Return ONLY raw JSON text.`;

    const requestBody = {
      systemInstruction: {
        parts: [{ text: "You are Zodark Social Media AI Generator. Output only valid JSON." }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }]
        }
      ]
    };

    let responseText: string | null = null;
    let lastError: string = '';

    for (const model of FAST_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (res.ok) {
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) break;
        } else {
          lastError = `${model} ${res.status}: ${await res.text()}`;
        }
      } catch (e) {
        lastError = (e as Error).message;
      }
    }

    if (!responseText) {
      return NextResponse.json({ error: "Failed to compose post. " + lastError }, { status: 500 });
    }

    // Clean JSON response string
    let cleanedJsonStr = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsedData = JSON.parse(cleanedJsonStr);

    return NextResponse.json({
      hook: parsedData.hook || `Innovating ${niche}`,
      caption: parsedData.caption || `Check out our latest update in ${niche}!`,
      hashtags: Array.isArray(parsedData.hashtags) ? parsedData.hashtags : ["#business", "#innovation"],
      imagePrompt: parsedData.imagePrompt || `Modern high-tech illustration representing ${niche}`,
      cta: parsedData.cta || "Follow us for more updates!",
      platform,
      topic: queryTopic
    });

  } catch (error) {
    console.error("Social Compose Route Error:", error);
    return NextResponse.json(
      { error: "Failed to compose social media post." },
      { status: 500 }
    );
  }
}
