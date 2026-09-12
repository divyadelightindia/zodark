'use client';

import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ZodarkChatBarProps {
  onSend: (message: string) => void;
  onMicToggle: () => void;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking?: boolean;
  disabled?: boolean;
  lastReply?: string;
  liveSpeech?: string;
}

export default function ZodarkChatBar({
  onSend,
  onMicToggle,
  isListening,
  isProcessing,
  disabled = false,
  liveSpeech = '',
}: ZodarkChatBarProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync live speech input directly into the chat input bar as the user speaks!
  React.useEffect(() => {
    if (liveSpeech) {
      setInputText(liveSpeech);
    }
  }, [liveSpeech]);

  const handleSend = () => {
    if (inputText.trim() && !isProcessing && !disabled) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '620px',
      padding: '0 16px',
      zIndex: 80,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      {/* Main input bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(4, 8, 15, 0.82)',
        backdropFilter: 'blur(20px)',
        border: isListening ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(0, 229, 255, 0.18)',
        borderRadius: '28px',
        padding: '6px 14px',
        width: '100%',
        boxShadow: isListening ? '0 0 35px rgba(0, 229, 255, 0.18)' : '0 0 25px rgba(0, 229, 255, 0.06)',
        transition: 'all 0.3s ease',
        gap: '8px'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening continuously... (speak anytime, or type)" : "Ask Zodark..."}
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '15px',
            padding: '8px 6px',
            fontFamily: 'inherit'
          }}
        />

        {/* Continuous Mic button */}
        <button
          onClick={onMicToggle}
          disabled={disabled}
          title={isListening ? "Mic is active continuously (Click to turn off)" : "Turn on continuous mic"}
          style={{
            position: 'relative',
            background: isListening ? 'rgba(0, 229, 255, 0.16)' : 'rgba(255,255,255,0.05)',
            border: isListening ? '1px solid rgba(0, 229, 255, 0.5)' : '1px solid transparent',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isListening ? '#00e5ff' : 'rgba(255, 255, 255, 0.45)',
            transition: 'all 0.25s',
          }}
        >
          {isListening && (
            <span style={{
              position: 'absolute',
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              borderRadius: '50%',
              border: '1px solid #00e5ff',
              animation: 'pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
            }} />
          )}
          {isListening ? <Mic size={19} /> : <MicOff size={19} />}
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isProcessing || disabled}
          aria-label="Send message"
          style={{
            background: (inputText.trim() && !isProcessing && !disabled) ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
            border: 'none',
            outline: 'none',
            cursor: (!inputText.trim() || isProcessing || disabled) ? 'not-allowed' : 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: (inputText.trim() && !isProcessing && !disabled) ? '#00e5ff' : 'rgba(255, 255, 255, 0.25)',
            transition: 'all 0.2s',
            opacity: isProcessing ? 0.7 : 1,
          }}
        >
          <Send 
            size={18} 
            style={{ 
              animation: isProcessing ? 'pulse 1s infinite' : 'none' 
            }} 
          />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.92); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
