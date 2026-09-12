'use client';

import React, { useState, useEffect } from 'react';

export interface ZodarkSettings {
  // Business Profile
  businessName: string;
  websiteUrl: string;
  businessNiche: string;
  targetAudience: string;
  brandTone: string;
  socialHandles: string;
  
  // YouTube Settings
  youtubeChannelId: string;
  scriptStyle: 'shorts' | 'longform';
  autoScheduleFrequency: string;

  // API Keys
  geminiKey: string;
  sarvamKey: string;
  weatherKey: string;
  newsKey: string;

  // Voice & Persona
  speaker: string; // 'kabir' | 'ashutosh'
  voicePace: number;
  emotionsEnabled: boolean;

  // Hermes Plugins
  hermesEnabled: boolean;
  weatherPlugin: boolean;
  newsPlugin: boolean;
  youtubePlugin: boolean;
}

const DEFAULT_SETTINGS: ZodarkSettings = {
  businessName: '',
  websiteUrl: '',
  businessNiche: 'Technology & AI',
  targetAudience: 'Entrepreneurs, Tech Enthusiasts',
  brandTone: 'Professional, Witty, High Energy',
  socialHandles: '@zodark_ai',
  youtubeChannelId: '',
  scriptStyle: 'shorts',
  autoScheduleFrequency: 'daily',
  geminiKey: '',
  sarvamKey: '',
  weatherKey: '',
  newsKey: '',
  speaker: 'aditya',
  voicePace: 1.00,
  emotionsEnabled: true,
  hermesEnabled: true,
  weatherPlugin: true,
  newsPlugin: true,
  youtubePlugin: true,
};

interface ZodarkControlHubProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: ZodarkSettings) => void;
}

export function ZodarkControlHub({ isOpen, onClose, onSave }: ZodarkControlHubProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'youtube' | 'apikeys' | 'voice' | 'hermes'>('business');
  const [settings, setSettings] = useState<ZodarkSettings>(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zodark_control_hub_settings');
      if (stored) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
        } catch {}
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleChange = (field: keyof ZodarkSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zodark_control_hub_settings', JSON.stringify(settings));
    }
    setSavedSuccess(true);
    if (onSave) onSave(settings);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Zodark Control Hub & Settings"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(2, 6, 16, 0.82)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: 'min(720px, 94vw)',
          maxHeight: '90vh',
          background: 'rgba(8, 14, 28, 0.94)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: 24,
          boxShadow: '0 0 50px rgba(0, 229, 255, 0.15), 0 20px 50px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
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
            <span style={{ fontSize: 18, color: '#00e5ff' }}>⚙️</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: '#fff' }}>
                ZODARK CONTROL HUB
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                Business Profile, API Keys & Automation Settings
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
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
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 16px 0 16px',
            gap: 6,
            background: 'rgba(4, 9, 20, 0.5)',
          }}
        >
          {[
            { id: 'business', label: '🏢 Business Profile' },
            { id: 'youtube', label: '🎬 YouTube Automation' },
            { id: 'apikeys', label: '🔑 API Keys' },
            { id: 'voice', label: '🎙️ Voice & JARVIS' },
            { id: 'hermes', label: '🔌 Hermes Plugins' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px 10px 0 0',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#00e5ff' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid rgba(8, 14, 28, 0.94)' : '1px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content Area */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === 'business' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#00e5ff', fontWeight: 600 }}>BUSINESS & BRAND IDENTITY</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                    Business / Startup Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Solutions"
                    value={settings.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://mycompany.com"
                    value={settings.websiteUrl}
                    onChange={(e) => handleChange('websiteUrl', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                    Industry / Business Niche
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI Software, E-Commerce, Fitness"
                    value={settings.businessNiche}
                    onChange={(e) => handleChange('businessNiche', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                    Social Handles (Instagram / LinkedIn)
                  </label>
                  <input
                    type="text"
                    placeholder="@acme_official, linkedin.com/company/acme"
                    value={settings.socialHandles}
                    onChange={(e) => handleChange('socialHandles', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  Target Audience
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small business owners, tech-savvy founders"
                  value={settings.targetAudience}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  Brand Voice & Tone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Professional, Witty, High-Energy, Direct"
                  value={settings.brandTone}
                  onChange={(e) => handleChange('brandTone', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* TAB 2: YOUTUBE AUTOMATION */}
          {activeTab === 'youtube' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#ff4b4b', fontWeight: 600 }}>YOUTUBE AUTOMATION CONFIGURATION</div>
              
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  YouTube Channel ID / Handle
                </label>
                <input
                  type="text"
                  placeholder="UCxxxxxxxxxxxx or @channelhandle"
                  value={settings.youtubeChannelId}
                  onChange={(e) => handleChange('youtubeChannelId', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                    Script Style Format
                  </label>
                  <select
                    value={settings.scriptStyle}
                    onChange={(e) => handleChange('scriptStyle', e.target.value as any)}
                    style={inputStyle}
                  >
                    <option value="shorts">YouTube Shorts (60-sec Fast Pace)</option>
                    <option value="longform">Long-form Video (5-10 min Detailed Script)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                    Auto-Publish Frequency
                  </label>
                  <select
                    value={settings.autoScheduleFrequency}
                    onChange={(e) => handleChange('autoScheduleFrequency', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="daily">Daily (1 Short / Day)</option>
                    <option value="weekly">Weekly (3 Videos / Week)</option>
                    <option value="manual">Manual Approval Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API KEYS */}
          {activeTab === 'apikeys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#00e5ff', fontWeight: 600 }}>API CREDENTIALS & KEYS</div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  Gemini API Key (Brain)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.geminiKey}
                  onChange={(e) => handleChange('geminiKey', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  Sarvam AI API Key (Voice)
                </label>
                <input
                  type="password"
                  placeholder="Sarvam API Key..."
                  value={settings.sarvamKey}
                  onChange={(e) => handleChange('sarvamKey', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* TAB 4: VOICE & PERSONA */}
          {activeTab === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#00e5ff', fontWeight: 600 }}>JARVIS VOICE & PERSONA CONTROLS</div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  Voice Speaker Model
                </label>
                <select
                  value={settings.speaker}
                  onChange={(e) => handleChange('speaker', e.target.value)}
                  style={inputStyle}
                >
                  <option value="aditya">Aditya (Executive Natural Male - Highly Recommended)</option>
                  <option value="ashutosh">Ashutosh (Natural Conversational Male)</option>
                  <option value="rahul">Rahul (Warm Professional Voice)</option>
                  <option value="ratan">Ratan (Polite Corporate Male)</option>
                  <option value="anand">Anand (Executive Narrator)</option>
                  <option value="kabir">Kabir (Deep Heavy Male Voice)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 4 }}>
                  Voice Speed / Pace: {settings.voicePace}
                </label>
                <input
                  type="range"
                  min="0.80"
                  max="1.15"
                  step="0.02"
                  value={settings.voicePace}
                  onChange={(e) => handleChange('voicePace', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00e5ff' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <input
                  type="checkbox"
                  id="emotions"
                  checked={settings.emotionsEnabled}
                  onChange={(e) => handleChange('emotionsEnabled', e.target.checked)}
                  style={{ accentColor: '#00e5ff', width: 16, height: 16 }}
                />
                <label htmlFor="emotions" style={{ fontSize: 12, color: '#fff', cursor: 'pointer' }}>
                  Enable Dynamic Vocal Emotions (Haha!, Waah!, Surprised, Empathetic inflections)
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: HERMES PLUGINS */}
          {activeTab === 'hermes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#00e5ff', fontWeight: 600 }}>HERMES BACKEND ENGINE & PLUGINS</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(0,229,255,0.06)', borderRadius: 10, border: '1px solid rgba(0,229,255,0.2)' }}>
                <span style={{ fontSize: 12, color: '#fff' }}>Hermes Backend Status:</span>
                <span style={{ fontSize: 11, color: '#00e5ff', fontWeight: 600, padding: '3px 8px', background: 'rgba(0,229,255,0.15)', borderRadius: 12 }}>
                  LOCAL PC ACTIVE (service/hermes-agent)
                </span>
              </div>

              {[
                { key: 'weatherPlugin', title: '🌦️ Live Weather Plugin', desc: 'Real-time weather reports via Open-Meteo' },
                { key: 'newsPlugin', title: '📰 Live News Search Plugin', desc: 'Real-time business & industry news' },
                { key: 'youtubePlugin', title: '🎬 YouTube Automation Engine', desc: 'Auto-scripting & YouTube uploader' },
              ].map((plug) => (
                <div key={plug.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{plug.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{plug.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={(settings as any)[plug.key]}
                    onChange={(e) => handleChange(plug.key as any, e.target.checked)}
                    style={{ accentColor: '#00e5ff', width: 16, height: 16 }}
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(4, 9, 20, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {savedSuccess ? (
            <span style={{ fontSize: 12, color: '#00e5ff', fontWeight: 600 }}>✅ Settings Saved Successfully!</span>
          ) : (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>All settings are saved locally on your machine.</span>
          )}

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
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 20px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                color: '#04080f',
                background: '#00e5ff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(0, 229, 255, 0.2)',
  borderRadius: 8,
  fontSize: 12,
  color: '#fff',
  outline: 'none',
};
