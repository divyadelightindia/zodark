'use client';

import React, { useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
  sourceUrl?: string;
}

interface ZodarkChatDrawerProps {
  history: ChatMessage[];
  onClearMemory: () => void;
}

export function ZodarkChatDrawer({ history, onClearMemory }: ZodarkChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Right-Side Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Conversation History & Links"
        style={{
          position: 'fixed',
          right: isOpen ? 345 : 12,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 90,
          background: 'rgba(4, 9, 20, 0.85)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '12px 0 0 12px',
          padding: '12px 10px',
          color: '#00e5ff',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(4, 9, 20, 0.85)';
          e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.35)';
        }}
      >
        <span style={{ fontSize: 16 }}>{isOpen ? '▶' : '📜'}</span>
        <span style={{ writingMode: 'vertical-rl', textTransform: 'uppercase' }}>
          {isOpen ? 'CLOSE' : 'MEMORY LOG'}
        </span>
      </button>

      {/* Slide-out Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(350px, 85vw)',
          zIndex: 85,
          background: 'rgba(4, 8, 18, 0.94)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(0, 229, 255, 0.25)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0,229,255,0.08)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🧠</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
                ZODARK MEMORY LOG
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                Persistent Chat & Reference Links
              </div>
            </div>
          </div>

          <button
            onClick={onClearMemory}
            title="Clear Chat History Memory"
            style={{
              background: 'rgba(255, 75, 75, 0.1)',
              border: '1px solid rgba(255, 75, 75, 0.25)',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 10,
              color: '#ff4b4b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 75, 75, 0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)')}
          >
            Clear Log
          </button>
        </div>

        {/* Messages List Area */}
        <div
          style={{
            flex: 1,
            padding: 16,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              No chat memory yet. Start speaking or click an Agent skill to talk with Zodark!
            </div>
          ) : (
            history.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: isUser ? 'rgba(255,255,255,0.4)' : '#00e5ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{isUser ? 'YOU' : '◆ ZODARK'}</span>
                  </div>

                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isUser ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                      border: isUser ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: 12,
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                      maxWidth: '92%',
                      boxShadow: isUser ? '0 0 12px rgba(0,229,255,0.08)' : 'none',
                    }}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(2, 5, 12, 0.8)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
          }}
        >
          All conversations are stored in permanent local memory.
        </div>
      </div>
    </>
  );
}

// Helper to convert markdown links [title](url) to clickable standard HTML anchor tags
function renderFormattedText(text: string) {
  const parts = [];
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#00e5ff',
          textDecoration: 'underline',
          fontWeight: 500,
          marginLeft: 2,
          marginRight: 2,
        }}
      >
        🔗 {linkText}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
