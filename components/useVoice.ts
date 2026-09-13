'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

interface UseVoiceOptions {
  onSpeechComplete?: (transcript: string) => void;
  onUserSpeaking?: () => void;
  onStopCommand?: () => void;
  silenceTimeoutMs?: number;
  speaker?: string;
}

// Global Audio Unlocker to bypass Chrome / Edge autoplay restriction
let audioUnlocked = false;
export function unlockAudio() {
  if (audioUnlocked || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    }
    audioUnlocked = true;
  } catch {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', unlockAudio, { capture: true, once: true });
  window.addEventListener('keydown', unlockAudio, { capture: true, once: true });
  window.addEventListener('touchstart', unlockAudio, { capture: true, once: true });
}

/**
 * Converts Devnagari Hindi text to Roman Script Hinglish
 */
export function devnagariToHinglish(text: string): string {
  if (!text) return text;

  const dict: Record<string, string> = {
    'भाई': 'bhai', 'ब्राउज़र': 'browser', 'ब्राउजर': 'browser', 'ब्राउज़र': 'browser',
    'ओपन': 'open', 'कीजिए': 'kije', 'किजिए': 'kije', 'करो': 'karo', 'करें': 'karein',
    'पहले': 'pehle', 'नहीं': 'nahi', 'हुआ': 'hua', 'अभी': 'abhi', 'आपको': 'aapko',
    'फिर': 'firse', 'से': 'se', 'गूगल': 'google', 'यूट्यूब': 'youtube', 'फेसबुक': 'facebook',
    'इंस्टाग्राम': 'instagram', 'चैटजीपीटी': 'chatgpt', 'सर्च': 'search', 'क्या': 'kya',
    'बताओ': 'batao', 'देख': 'dekh', 'स्क्रीन': 'screen', 'पर': 'par', 'ऊपर': 'upar',
    'कौन': 'kaun', 'सा': 'sa', 'वीडियो': 'video', 'क्लिप': 'clip', 'चल': 'chal',
    'रहा': 'raha', 'है': 'hai', 'हैं': 'hain', 'पूछ': 'poochh', 'पूछो': 'poochho',
    'आप': 'aap', 'दिख': 'dikh', 'खोलो': 'kholo', 'चालू': 'chalu', 'नमस्ते': 'namaste',
    'सर': 'sir', 'जवाब': 'jawab', 'दो': 'do', 'कहो': 'kaho', 'सुनो': 'suno'
  };

  let wordResult = text;
  for (const [dev, eng] of Object.entries(dict)) {
    const reg = new RegExp(dev, 'g');
    wordResult = wordResult.replace(reg, eng);
  }

  const devToRom: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'خ': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'f', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ः': 'h', 'ँ': 'n', '्': '', '़': ''
  };

  let finalStr = '';
  for (const char of wordResult) {
    if (devToRom[char] !== undefined) {
      finalStr += devToRom[char];
    } else {
      finalStr += char;
    }
  }

  return finalStr.replace(/\s+/g, ' ').trim();
}

export function useVoice(options: UseVoiceOptions = {}) {
  const {
    onSpeechComplete,
    onUserSpeaking,
    silenceTimeoutMs = 1400,
    speaker = 'kabir'
  } = options;

  const [activeListening, setActiveListening] = useState(true); // Continuous Voice Listening enabled by default
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [supported, setSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeListeningRef = useRef(true);
  const isSpeakingRef = useRef(false);
  isSpeakingRef.current = isSpeaking;
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accumulatedTextRef = useRef('');
  const onSpeechCompleteRef = useRef(onSpeechComplete);
  const onUserSpeakingRef = useRef(onUserSpeaking);
  const onStopCommandRef = useRef(options.onStopCommand);
  const lastSpeechEndTimeRef = useRef(0);

  onSpeechCompleteRef.current = onSpeechComplete;
  onUserSpeakingRef.current = onUserSpeaking;
  onStopCommandRef.current = options.onStopCommand;
  activeListeningRef.current = activeListening;

  // Instantly cancel any ongoing speech (Sarvam Audio element + Browser TTS)
  const cancelSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    lastSpeechEndTimeRef.current = Date.now();
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Resume recognition cleanly when AI finishes speaking
  const resumeListeningAfterSpeaking = useCallback(() => {
    lastSpeechEndTimeRef.current = Date.now();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    accumulatedTextRef.current = '';
    setInterimTranscript('');
    setTranscript('');
    setActiveListening(true);
    activeListeningRef.current = true;

    setTimeout(() => {
      if (!isSpeakingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Already running
        }
      }
    }, 450); // 450ms tail buffer so speaker echo dies down
  }, []);

  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current || isSpeakingRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {
      // Already running
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionConstructor && 'speechSynthesis' in window) {
      setSupported(true);
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Transcribe in Hinglish / Roman script

      recognition.onstart = () => {};

      recognition.onend = () => {
        // Auto-restart recognition continuously if AI is NOT speaking
        if (activeListeningRef.current && !isSpeakingRef.current) {
          setTimeout(() => {
            if (activeListeningRef.current && !isSpeakingRef.current) {
              safeStartRecognition();
            }
          }, 200);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition notice:', event.error);
        }
      };

      recognition.onspeechstart = () => {
        // Ignore speech start while AI is speaking or immediately after AI finishes (echo buffer)
        if (isSpeakingRef.current || (Date.now() - lastSpeechEndTimeRef.current < 450)) {
          return;
        }
        if (onUserSpeakingRef.current) {
          onUserSpeakingRef.current();
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        const currentSpoken = (accumulatedTextRef.current + ' ' + interim + ' ' + final).trim().toLowerCase();

        // 1. Instant STOP Command Check — Runs EVEN IF AI is currently speaking!
        if (
          currentSpoken === 'stop' ||
          currentSpoken === 'ruko' ||
          currentSpoken === 'chup' ||
          currentSpoken === 'quiet' ||
          currentSpoken === 'pause' ||
          currentSpoken === 'shut up' ||
          currentSpoken === 'bas' ||
          currentSpoken.includes('stop') ||
          currentSpoken.includes('ruko') ||
          currentSpoken.includes('chup') ||
          currentSpoken.includes('quiet') ||
          currentSpoken.includes('pause') ||
          currentSpoken.includes('shut up') ||
          currentSpoken.includes('bas')
        ) {
          cancelSpeech();
          accumulatedTextRef.current = '';
          setInterimTranscript('');
          setTranscript('');
          if (onStopCommandRef.current) {
            onStopCommandRef.current();
          }
          return;
        }

        // 2. Echo Guard: Ignore non-stop words while AI is speaking to prevent feedback echo
        if (isSpeakingRef.current || (Date.now() - lastSpeechEndTimeRef.current < 450)) {
          return;
        }

        if (final) {
          accumulatedTextRef.current += final;
          setTranscript(devnagariToHinglish(accumulatedTextRef.current.trim()));
        }
        setInterimTranscript(devnagariToHinglish(interim));

        // Silence Timer
        clearSilenceTimer();
        if (currentSpoken) {
          silenceTimerRef.current = setTimeout(() => {
            const rawQuery = accumulatedTextRef.current.trim() || interim.trim();
            const finalQuery = devnagariToHinglish(rawQuery);
            if (finalQuery && !isSpeakingRef.current) {
              accumulatedTextRef.current = '';
              setInterimTranscript('');
              setTranscript(finalQuery);
              if (onSpeechCompleteRef.current) {
                onSpeechCompleteRef.current(finalQuery);
              }
            }
          }, silenceTimeoutMs);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      cancelSpeech();
    };
  }, [cancelSpeech, clearSilenceTimer, safeStartRecognition, silenceTimeoutMs]);

  const startListening = useCallback(() => {
    setActiveListening(true);
    activeListeningRef.current = true;
    accumulatedTextRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    clearSilenceTimer();

    if (recognitionRef.current && !isSpeakingRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  }, [clearSilenceTimer]);

  const stopListening = useCallback(() => {
    setActiveListening(false);
    activeListeningRef.current = false;
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setInterimTranscript('');
  }, [clearSilenceTimer]);

  // Fallback to browser Web Speech Synthesis if Sarvam API fails
  const speakBrowserFallback = useCallback((cleanText: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resumeListeningAfterSpeaking();
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let selectedVoice = voices.find(v => 
          v.lang.includes('hi') ||
          v.lang.includes('IN') ||
          v.name.includes('India') ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||
          v.name.includes('Natural')
        );
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-'));
        }
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
      };
      utterance.onend = () => {
        resumeListeningAfterSpeaking();
        resolve();
      };
      utterance.onerror = () => {
        resumeListeningAfterSpeaking();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [resumeListeningAfterSpeaking]);

  const activeSpeakTextRef = useRef<string>('');

  // Main Speech Output — Calls Sarvam AI API for ultra-realistic male Hinglish voice
  const speak = useCallback(async (text: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    const cleanText = text
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[*_#`~>]/g, '')
      .trim();
    if (!cleanText) return;

    // Guard against duplicate concurrent speak calls for identical text
    if (isSpeakingRef.current && activeSpeakTextRef.current === cleanText) {
      return;
    }
    activeSpeakTextRef.current = cleanText;

    cancelSpeech();

    // Pause mic recognition while AI speaks to prevent speaker echo feedback
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    accumulatedTextRef.current = '';
    setInterimTranscript('');
    setTranscript('');

    try {
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      let customSarvamKey = undefined;
      let activeSpeaker = speaker || 'aditya';
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zodark_control_hub_settings');
        if (stored) {
          try { 
            const parsed = JSON.parse(stored);
            if (parsed?.sarvamKey) customSarvamKey = parsed.sarvamKey; 
            if (parsed?.speaker) activeSpeaker = parsed.speaker;
          } catch {}
        }
      }

      // 1. Call Sarvam AI TTS API
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, speaker: activeSpeaker, customSarvamKey }),
      });

      const data = await res.json();

      // Play Sarvam Audio
      if (data.audio) {
        unlockAudio();
        return new Promise<void>((resolve) => {
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          audio.volume = 1.0;
          audioRef.current = audio;

          audio.onended = () => {
            audioRef.current = null;
            resumeListeningAfterSpeaking();
            resolve();
          };

          audio.onerror = (e) => {
            console.warn("Sarvam audio element error, using browser fallback.", e);
            audioRef.current = null;
            speakBrowserFallback(cleanText).then(resolve);
          };

          audio.play().then(() => {
            console.log("Sarvam AI audio playing successfully.");
          }).catch((err) => {
            console.warn("Audio play blocked by browser autoplay policy, attempting browser fallback:", err);
            speakBrowserFallback(cleanText).then(resolve);
          });
        });
      } else {
        return speakBrowserFallback(cleanText);
      }
    } catch (err) {
      console.warn("Sarvam TTS request failed, using browser fallback.", err);
      return speakBrowserFallback(cleanText);
    }
  }, [cancelSpeech, resumeListeningAfterSpeaking, speakBrowserFallback, speaker]);

  // Instant Interruption Listener: Keyboard Escape / Spacebar or Mic Voice Energy VAD
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Keyboard Shortcut: Escape or Spacebar -> Instant Stop
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSpeakingRef.current && (e.key === 'Escape' || e.key === ' ')) {
        cancelSpeech();
        if (onStopCommandRef.current) {
          onStopCommandRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 2. Real-time Microphone Audio Energy VAD (Voice Activity Detection)
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let animId: number = 0;
    let vadCooldown = false;

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        stream = s;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        audioCtx = new AudioCtx();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkMicVolume = () => {
          // If AI is currently speaking and user speaks into mic (VAD energy threshold)
          if (isSpeakingRef.current && !vadCooldown) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avgVolume = sum / dataArray.length;

            // Threshold > 28 indicates user speaking or shouting STOP
            if (avgVolume > 28) {
              vadCooldown = true;
              console.log("VAD detected user voice input during AI speech -> INSTANT STOP!");
              cancelSpeech();
              if (onStopCommandRef.current) {
                onStopCommandRef.current();
              }
              setTimeout(() => { vadCooldown = false; }, 1500);
            }
          }
          animId = requestAnimationFrame(checkMicVolume);
        };

        animId = requestAnimationFrame(checkMicVolume);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animId) cancelAnimationFrame(animId);
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (audioCtx) { try { audioCtx.close(); } catch {} }
    };
  }, [cancelSpeech]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => { window.speechSynthesis.getVoices(); };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  return {
    isListening: activeListening,
    isSpeaking,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    supported
  };
}
