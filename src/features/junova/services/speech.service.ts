/**
 * StudentOS Junova AI — Speech Service
 *
 * Wraps the browser's SpeechSynthesis API for Text-to-Speech (TTS).
 * Provides voice listing, speaking, stopping, pausing, and resuming.
 * Emits boundary events for lip-sync animation.
 *
 * Browser-native — no external dependency. Supported in all modern browsers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */

import type { VoicePreferences } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A available TTS voice. */
export interface TTSVoice {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}

/** Callbacks for TTS events. */
export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  /** Fired on word/sentence boundary — used for lip-sync. */
  onBoundary?: (charIndex: number, charLength: number) => void;
  onPause?: () => void;
  onResume?: () => void;
}

// ---------------------------------------------------------------------------
// Voice listing
// ---------------------------------------------------------------------------

/** Get all available TTS voices. Returns empty array if unsupported. */
export function getAvailableVoices(): TTSVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().map((v) => ({
    name: v.name,
    lang: v.lang,
    voiceURI: v.voiceURI,
    default: v.default,
  }));
}

/** Subscribe to voice list changes (voices load asynchronously). */
export function onVoicesChanged(callback: (voices: TTSVoice[]) => void): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    callback([]);
    return () => {};
  }

  const handler = () => callback(getAvailableVoices());
  window.speechSynthesis.addEventListener('voiceschanged', handler);
  // Fire immediately in case voices are already loaded
  handler();

  return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
}

/** Check if TTS is supported in the current browser. */
export function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// ---------------------------------------------------------------------------
// Speak
// ---------------------------------------------------------------------------

/**
 * Speak text using TTS. Applies voice preferences (voice, rate, pitch, volume).
 * Returns a cancel function.
 */
export function speak(
  text: string,
  preferences: VoicePreferences,
  callbacks: TTSCallbacks = {},
): () => void {
  if (!isTTSSupported()) {
    callbacks.onError?.('Text-to-speech is not supported in this browser.');
    return () => {};
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Apply preferences
  utterance.rate = preferences.rate;
  utterance.pitch = preferences.pitch;
  utterance.volume = preferences.volume;
  utterance.lang = preferences.language;

  // Select voice
  if (preferences.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.voiceURI === preferences.voiceURI);
    if (voice) utterance.voice = voice;
  } else {
    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find((v) => v.lang.startsWith(preferences.language.split('-')[0]));
    if (langVoice) utterance.voice = langVoice;
  }

  // Wire callbacks
  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => callbacks.onEnd?.();
  utterance.onerror = (e) => callbacks.onError?.(e.error ?? 'Speech error');
  utterance.onboundary = (e) => callbacks.onBoundary?.(e.charIndex, e.charLength ?? 0);
  utterance.onpause = () => callbacks.onPause?.();
  utterance.onresume = () => callbacks.onResume?.();

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    window.speechSynthesis.cancel();
  };
}

/** Stop all speech. */
export function stopSpeaking(): void {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
}

/** Pause speech. */
export function pauseSpeaking(): void {
  if (isTTSSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

/** Resume speech. */
export function resumeSpeaking(): void {
  if (isTTSSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/** Check if currently speaking. */
export function isSpeaking(): boolean {
  return isTTSSupported() && window.speechSynthesis.speaking;
}

/** Check if currently paused. */
export function isPaused(): boolean {
  return isTTSSupported() && window.speechSynthesis.paused;
}
