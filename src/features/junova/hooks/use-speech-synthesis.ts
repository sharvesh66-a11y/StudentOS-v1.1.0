'use client';

/**
 * StudentOS Junova AI — useSpeechSynthesis Hook
 *
 * Text-to-Speech hook that wraps the browser's SpeechSynthesis API.
 * Provides speaking, stopping, pausing, resuming, voice listing, and
 * boundary events for lip-sync animation.
 *
 * @see src/features/junova/services/speech.service.ts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  speak as speakText,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  isTTSSupported,
  onVoicesChanged,
  type TTSVoice,
} from '../services/speech.service';
import type { VoicePreferences } from '../types';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [isSupported] = useState(() => isTTSSupported());
  const cancelRef = useRef<(() => void) | null>(null);

  // Load available voices (they load asynchronously)
  useEffect(() => {
    if (!isSupported) return;
    const unsubscribe = onVoicesChanged((v) => setVoices(v));
    return unsubscribe;
  }, [isSupported]);

  const speak = useCallback(
    (
      text: string,
      preferences: VoicePreferences,
      onBoundary?: (charIndex: number, charLength: number) => void,
    ) => {
      if (!isSupported || !text.trim()) return;

      cancelRef.current?.();
      setIsSpeaking(true);
      setIsPaused(false);

      cancelRef.current = speakText(text, preferences, {
        onStart: () => {
          setIsSpeaking(true);
          setIsPaused(false);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          cancelRef.current = null;
        },
        onError: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          cancelRef.current = null;
        },
        onBoundary: (charIndex, charLength) => {
          onBoundary?.(charIndex, charLength);
        },
        onPause: () => setIsPaused(true),
        onResume: () => setIsPaused(false),
      });
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    pauseSpeaking();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    resumeSpeaking();
    setIsPaused(false);
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
}
