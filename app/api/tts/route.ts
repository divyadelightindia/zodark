import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, speaker = 'kabir', customSarvamKey } = body as { text: string; speaker?: string; customSarvamKey?: string };

    const apiKey = customSarvamKey || process.env.SARVAM_API_KEY;
    if (!apiKey || apiKey === 'your_sarvam_key_here') {
      console.warn("SARVAM_API_KEY is not configured.");
      return NextResponse.json({ audio: null, fallback: true }, { status: 400 });
    }

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Strip HTTP URLs, markdown link targets [text](url), emojis, and symbols so Sarvam NEVER reads URLs out loud!
    const cleanText = text
      .replace(/https?:\/\/\S+/gi, '') // Strip raw URLs
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Convert [Link Title](url) -> Link Title
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#`~>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return NextResponse.json({ audio: null, fallback: true }, { status: 400 });
    }

    // Use natural human conversational pace (1.00 - 1.02) to prevent robotic audio stretching
    const pace = 1.0;
    const selectedSpeaker = speaker || 'aditya'; // 'aditya' is Sarvam's highest quality natural male executive voice

    // Call Sarvam AI TTS (bulbul:v3)
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [cleanText],
        target_language_code: 'hi-IN',
        speaker: selectedSpeaker,
        pace: pace,
        speech_sample_rate: 24000, // 24kHz HD Audio
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Sarvam TTS API Error:", response.status, errText);
      return NextResponse.json({ audio: null, fallback: true, error: errText }, { status: response.status });
    }

    const data = await response.json();
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      return NextResponse.json({ audio: null, fallback: true }, { status: 500 });
    }

    return NextResponse.json({ audio: audioBase64 });

  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ audio: null, fallback: true }, { status: 500 });
  }
}
