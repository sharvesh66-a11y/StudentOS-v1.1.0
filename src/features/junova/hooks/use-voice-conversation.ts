'use client';

/**
 * StudentOS Junova AI — useVoiceConversation Hook
 *
 * Orchestrates a full voice conversation loop:
 *   1. Listen (STT via Web Speech API)
 *   2. Transcribe
 *   3. Send to AI (via /api/junova/chat with teacher + memory)
 *   4. Receive AI response
 *   5. Speak response (TTS via SpeechSynthesis)
 *   6. Animate avatar (via boundary events)
 *
 * Supports: interrupt, pause, resume, multi-language.
 * Integrates with existing Teacher DNA + Memory system.
 *
 * @see src/features/junova/hooks/use-voice-input.ts — STT
 * @see src/features/junova/hooks/use-speech-synthesis.ts — TTS
 * @see src/features/junova/services/memory.service.ts — memory
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { authedFetch } from '@/lib/api-client';
import { useVoiceInput } from './use-voice-input';
import { useSpeechSynthesis } from './use-speech-synthesis';
import { memoryService } from '../services/memory.service';
import type {
  AITeacher,
  StudentMemory,
  VoicePreferences,
  VoiceConversationState,
  VoiceMessage,
} from '../types';
import { toast } from 'sonner';

export interface UseVoiceConversationParams {
  teacher: AITeacher | null;
  preferences: VoicePreferences | null;
  /** Called when the avatar should change expression. */
  onExpressionChange?: (expression: 'listening' | 'thinking' | 'speaking' | 'neutral') => void;
}

export function useVoiceConversation({
  teacher,
  preferences,
  onExpressionChange,
}: UseVoiceConversationParams) {
  const [state, setState] = useState<VoiceConversationState>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: sttSupported,
    reset,
  } = useVoiceInput();
  const {
    isSupported: ttsSupported,
    isSpeaking,
    isPaused,
    speak,
    stop: stopTTS,
    pause: pauseTTS,
    resume: resumeTTS,
  } = useSpeechSynthesis();

  const memoryRef = useRef<StudentMemory | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync transcript from STT
  useEffect(() => {
    if (transcript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript]);

  // Update state based on STT/TTS status
  useEffect(() => {
    if (isListening) {
      setState('listening');
      onExpressionChange?.('listening');
    } else if (isSpeaking && !isPaused) {
      setState('speaking');
      onExpressionChange?.('speaking');
    } else if (state === 'listening' && !isListening && !isSpeaking) {
      // STT just finished, waiting for processing
      // Don't change state yet — handleSend will set 'processing'
    }
  }, [isListening, isSpeaking, isPaused, onExpressionChange, state]);

  /** Send text to the AI and get a response */
  const sendToAI = useCallback(
    async (text: string): Promise<string | null> => {
      if (!teacher) return null;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Fetch memory for personalization
      try {
        const uid = teacher.uid;
        const memResult = await memoryService.getMemory(uid);
        memoryRef.current = memResult.success ? (memResult.data ?? null) : null;
      } catch {
        memoryRef.current = null;
      }

      // Build history from recent messages
      const history = messages.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await authedFetch('/api/junova/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: `voice-${Date.now()}`,
            teacherId: teacher.id,
            teacher,
            message: text,
            history,
            memory: memoryRef.current,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('Failed to get AI response');
        }

        // Read the full response (non-streaming for voice — we need the complete text before TTS)
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const chunk = JSON.parse(jsonStr);
              if (chunk.type === 'delta' && chunk.content) {
                fullText += chunk.content;
              } else if (chunk.type === 'error') {
                throw new Error(chunk.error ?? 'AI error');
              }
            } catch {
              // Ignore parse errors
            }
          }
        }

        return fullText || null;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
        return null;
      }
    },
    [teacher, messages],
  );

  /** Start listening — begins the voice conversation loop */
  const startConversation = useCallback(() => {
    if (!sttSupported) {
      toast.error('Voice input not supported', {
        description: 'Please use Chrome, Edge, or Safari for voice conversations.',
      });
      return;
    }
    setError(null);
    reset();
    setCurrentTranscript('');
    startListening();
  }, [sttSupported, reset, startListening]);

  /** Stop listening and send the transcript to AI */
  const stopAndSend = useCallback(async () => {
    stopListening();

    // Wait a tick for final transcript
    await new Promise((resolve) => setTimeout(resolve, 300));

    const text = currentTranscript.trim();
    if (!text) {
      setState('idle');
      onExpressionChange?.('neutral');
      return;
    }

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: text, timestamp: Date.now() }]);
    setCurrentTranscript('');
    reset();

    // Process
    setState('processing');
    onExpressionChange?.('thinking');

    const aiResponse = await sendToAI(text);

    if (aiResponse) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse, timestamp: Date.now() },
      ]);

      // Speak the response if TTS is supported and enabled
      if (ttsSupported && preferences?.enabled && preferences.autoSpeak) {
        setState('speaking');
        onExpressionChange?.('speaking');
        speak(aiResponse, preferences);
      } else {
        setState('idle');
        onExpressionChange?.('neutral');
      }
    } else {
      setState('idle');
      onExpressionChange?.('neutral');
    }
  }, [
    stopListening,
    currentTranscript,
    reset,
    sendToAI,
    ttsSupported,
    preferences,
    speak,
    onExpressionChange,
  ]);

  /** Interrupt the AI while speaking */
  const interrupt = useCallback(() => {
    stopTTS();
    setState('idle');
    onExpressionChange?.('neutral');
  }, [stopTTS, onExpressionChange]);

  /** Pause speaking */
  const pause = useCallback(() => {
    pauseTTS();
    setState('paused');
  }, [pauseTTS]);

  /** Resume speaking */
  const resume = useCallback(() => {
    resumeTTS();
    setState('speaking');
    onExpressionChange?.('speaking');
  }, [resumeTTS, onExpressionChange]);

  /** Clear the conversation */
  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentTranscript('');
    setError(null);
    setState('idle');
    reset();
  }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopTTS();
    };
  }, [stopTTS]);

  return {
    state,
    messages,
    currentTranscript,
    error,
    isListening,
    isSpeaking,
    isPaused,
    sttSupported,
    ttsSupported,
    startConversation,
    stopAndSend,
    interrupt,
    pause,
    resume,
    clearConversation,
  };
}
