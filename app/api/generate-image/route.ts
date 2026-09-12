import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, platform = 'instagram', width = 1024, height = 1024 } = body as {
      prompt: string;
      platform?: string;
      width?: number;
      height?: number;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Determine aspect ratio based on platform
    let w = width;
    let h = height;
    if (platform === 'youtube' || platform === 'linkedin') {
      w = 1280;
      h = 720; // 16:9 Landscape
    } else if (platform === 'instagram') {
      w = 1080;
      h = 1080; // 1:1 Square
    } else if (platform === 'facebook') {
      w = 1200;
      h = 630; // Facebook landscape
    }

    // Enhance prompt with professional aesthetic markers
    const cleanPromptText = prompt.trim();
    const enhancedPrompt = `${cleanPromptText}, highly detailed, 8k resolution, cinematic lighting, professional digital artwork, trending on artstation`;
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(enhancedPrompt);

    // Primary High Quality FLUX / Pollinations AI Image Generator endpoint
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
    
    // Backup Unsplash Source Keyword Image URL
    const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=${w}&q=80`;

    return NextResponse.json({
      imageUrl,
      fallbackUrl,
      prompt: enhancedPrompt,
      platform,
      width: w,
      height: h
    });

  } catch (error) {
    console.error("Image Generation Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI image." },
      { status: 500 }
    );
  }
}
