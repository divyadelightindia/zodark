'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Send, Copy, RefreshCw, CheckCircle, Globe, Play } from 'lucide-react';

interface ZodarkSocialStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export function ZodarkSocialStudio({ isOpen, onClose, initialTopic = '' }: ZodarkSocialStudioProps) {
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'chatgpt'>('instagram');
  const [topic, setTopic] = useState(initialTopic);
  const [businessName, setBusinessName] = useState('');
  const [businessNiche, setBusinessNiche] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);

  // Result state
  const [hook, setHook] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [cta, setCta] = useState('');

  const [copied, setCopied] = useState(false);
  const [automateStatus, setAutomateStatus] = useState<string | null>(null);

  // Load business profile from settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zodark_control_hub_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.businessName) setBusinessName(parsed.businessName);
          if (parsed?.businessNiche) {
            setBusinessNiche(parsed.businessNiche);
            if (!topic) setTopic(`Trending innovation in ${parsed.businessNiche}`);
          }
        } catch {}
      }
    }
  }, [topic]);

  if (!isOpen) return null;

  // 1. Generate Social Media Post via Gemini API
  const handleGeneratePost = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setAutomateStatus(null);

    try {
      let customApiKey = undefined;
      let businessProfile = undefined;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zodark_control_hub_settings');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            businessProfile = parsed;
            if (parsed?.geminiKey) customApiKey = parsed.geminiKey;
          } catch {}
        }
      }

      const res = await fetch('/api/social-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          topic: topic || `AI Automation for ${businessNiche || 'Business'}`,
          businessProfile,
          customApiKey,
        }),
      });

      const data = await res.json();
      if (data.caption) {
        setHook(data.hook || '');
        setCaption(data.caption || '');
        setHashtags(data.hashtags || []);
        setImagePrompt(data.imagePrompt || '');
        setCta(data.cta || '');

        // Auto trigger AI image generation for the prompt
        if (data.imagePrompt) {
          handleGenerateAIImage(data.imagePrompt);
        }
      }
    } catch (err) {
      console.error("Social post generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Generate AI Image via Pollinations / FLUX Route
  const handleGenerateAIImage = async (customPrompt?: string) => {
    const activePrompt = customPrompt || imagePrompt || topic || 'Modern futuristic AI technology';
    setIsGeneratingImage(true);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          platform,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error("Image generation error:", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. Trigger Playwright Browser Automation Bridge (Auto-Post via Chrome)
  const handleLaunchPlaywrightAutoPost = async () => {
    if (!caption) return;
    setIsAutomating(true);
    setAutomateStatus(null);

    try {
      const fullText = `${hook ? hook + '\n\n' : ''}${caption}\n\n${cta ? cta + '\n\n' : ''}`;
      const res = await fetch('/api/browser-automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          postText: fullText,
          imageUrl,
          hashtags,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAutomateStatus(data.message);
      }
    } catch (err) {
      setAutomateStatus("Failed to launch Playwright browser session.");
    } finally {
      setIsAutomating(false);
    }
  };

  // 4. Copy Post Text to Clipboard
  const handleCopyPost = () => {
    const fullText = `${hook ? hook + '\n\n' : ''}${caption}\n\n${cta ? cta + '\n\n' : ''}${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Zodark Social Media & Browser Automation Studio"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(2, 6, 16, 0.85)',
        backdropFilter: 'blur(22px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 'min(860px, 95vw)',
          maxHeight: '92vh',
          background: 'rgba(8, 14, 28, 0.95)',
          border: '1px solid rgba(0, 229, 255, 0.28)',
          borderRadius: 24,
          boxShadow: '0 0 50px rgba(0, 229, 255, 0.16), 0 20px 50px rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, color: '#00e5ff' }}>📸</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: '#fff' }}>
                ZODARK SOCIAL MEDIA & PLAYWRIGHT AUTOMATION STUDIO
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                AI Content Compose · FLUX Image Generator · Playwright Live Browser Auto-Post
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close studio"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Target Platform Selector */}
          <div>
            <label style={{ fontSize: 11, color: '#00e5ff', fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              SELECT TARGET PLATFORM
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'instagram', label: '📸 Instagram', color: '#e1306c' },
                { id: 'facebook', label: '📘 Facebook', color: '#1877f2' },
                { id: 'linkedin', label: '💼 LinkedIn', color: '#0a66c2' },
                { id: 'youtube', label: '🎬 YouTube Shorts', color: '#ff0000' },
                { id: 'chatgpt', label: '🤖 ChatGPT / DALL-E', color: '#10a37f' },
              ].map((p) => {
                const isActive = platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id as any)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      background: isActive ? `${p.color}33` : 'rgba(255,255,255,0.04)',
                      border: isActive ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? `0 0 16px ${p.color}44` : 'none',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic & Generator Input Bar */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder={`Enter campaign topic or focus (e.g. Launching new product in ${businessNiche || 'AI'})...`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGeneratePost(); }}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
                borderRadius: 14,
                fontSize: 13,
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              onClick={handleGeneratePost}
              disabled={isGenerating}
              style={{
                padding: '12px 22px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                color: '#04080f',
                background: '#00e5ff',
                border: 'none',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                opacity: isGenerating ? 0.7 : 1,
              }}
            >
              <Sparkles size={16} />
              {isGenerating ? 'Composing...' : 'Generate Post & Image'}
            </button>
          </div>

          {/* Generated Post & AI Image Preview Card */}
          {caption && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: 20,
                background: 'rgba(4, 9, 20, 0.7)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: 18,
                padding: 20,
              }}
            >
              {/* Left Column: Post Text & Caption */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#00e5ff', fontWeight: 600, letterSpacing: '0.06em' }}>
                    POST CAPTION PREVIEW ({platform.toUpperCase()})
                  </span>
                  <button
                    onClick={handleCopyPost}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copied ? '#34d399' : 'rgba(0, 229, 255, 0.8)',
                      cursor: 'pointer',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>

                {hook && (
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                    {hook}
                  </div>
                )}

                <div
                  style={{
                    fontSize: 12.5,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 220,
                    overflowY: 'auto',
                    paddingRight: 6,
                  }}
                >
                  {caption}
                </div>

                {cta && (
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#00e5ff' }}>
                    👉 {cta}
                  </div>
                )}

                {hashtags.length > 0 && (
                  <div style={{ fontSize: 11, color: 'rgba(0, 229, 255, 0.7)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {hashtags.map((h, i) => (
                      <span key={i}>{h}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: AI Generated Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                  <span>AI GENERATED IMAGE</span>
                  <button
                    onClick={() => handleGenerateAIImage()}
                    disabled={isGeneratingImage}
                    style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <RefreshCw size={11} className={isGeneratingImage ? 'spin' : ''} />
                    Regenerate
                  </button>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 230,
                    borderRadius: 14,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(0,229,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {isGeneratingImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#00e5ff' }}>
                      <RefreshCw size={24} style={{ animation: 'spin 1.2s linear infinite' }} />
                      <span style={{ fontSize: 11 }}>Generating AI Image...</span>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="AI generated social post artwork"
                      onError={(e) => {
                        // Fallback to high quality tech artwork if Pollinations image fails
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)' }}>
                      <ImageIcon size={30} style={{ color: '#00e5ff' }} />
                      <span style={{ fontSize: 11 }}>AI Image Ready</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Playwright Browser Automation Status Notice */}
          {automateStatus && (
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 229, 255, 0.12)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                borderRadius: 12,
                fontSize: 12,
                color: '#00e5ff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Globe size={16} />
              <span>{automateStatus}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(4, 9, 20, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Playwright Chrome Bridge launches local browser session via service/hermes-agent.
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            {caption && (
              <button
                onClick={handleLaunchPlaywrightAutoPost}
                disabled={isAutomating}
                style={{
                  padding: '9px 20px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, #1877f2 0%, #00e5ff 100%)',
                  border: 'none',
                  cursor: isAutomating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
                  opacity: isAutomating ? 0.7 : 1,
                }}
              >
                <Play size={14} />
                {isAutomating ? 'Launching Chrome...' : `🚀 Launch Playwright Auto-Post to ${platform.toUpperCase()}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
