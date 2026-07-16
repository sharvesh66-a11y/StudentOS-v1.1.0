'use client';

/**
 * StudentOS Junova AI — Voice Conversation Panel
 *
 * A standalone voice conversation UI that can be embedded in any page.
 * Shows the conversation state, transcript, and controls.
 *
 * @see src/features/junova/hooks/use-voice-conversation.ts
 */

import { useState, useCallback } from 'react';
import { Mic, MicOff, Square, Pause, Play, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceSettings } from './voice-settings';
import { useVoiceConversation } from '../../hooks/use-voice-conversation';
import { useVoicePreferences } from '../../hooks/use-voice-preferences';
import { useTeachers } from '../../hooks/use-teachers';
import { useJunovaStore } from '../../store/junova.store';
import { cn } from '@/lib/utils';

export function VoiceConversationPanel() {
  const { activeTeacher } = useJunovaStore();
  const { teachers } = useTeachers();
  const { preferences } = useVoicePreferences();
  const [showSettings, setShowSettings] = useState(false);

  const teacher = activeTeacher ?? teachers[0] ?? null;

  const {
    state,
    messages,
    currentTranscript,
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
  } = useVoiceConversation({
    teacher,
    preferences,
  });

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopAndSend();
    } else {
      startConversation();
    }
  }, [isListening, startConversation, stopAndSend]);

  const statusText = (() => {
    switch (state) {
      case 'listening':
        return 'Listening…';
      case 'processing':
        return 'Thinking…';
      case 'speaking':
        return 'Speaking…';
      case 'paused':
        return 'Paused';
      case 'error':
        return 'Error';
      default:
        return 'Tap the mic to start';
    }
  })();

  return (
    <div className="border-border bg-card/50 flex flex-col rounded-xl border p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-sm font-semibold">Voice Conversation</h2>
          <p className="text-muted-foreground text-xs">
            {teacher ? `Talking with ${teacher.name}` : 'Select a teacher to start'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="h-8 w-8 p-0"
          aria-label="Voice settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Status */}
      <div className="mb-4 flex items-center justify-center">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all',
            state === 'listening' && 'border-destructive bg-destructive/10',
            state === 'processing' && 'border-primary bg-primary/10',
            state === 'speaking' && 'border-primary bg-primary/10',
            state === 'paused' && 'border-amber-500 bg-amber-500/10',
            state === 'idle' && 'border-border bg-background',
          )}
        >
          {state === 'listening' && <Mic className="text-destructive h-8 w-8" />}
          {state === 'processing' && (
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          )}
          {state === 'speaking' && (
            <div className="flex gap-1">
              <span
                className="bg-primary h-4 w-1 animate-pulse rounded-full"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="bg-primary h-6 w-1 animate-pulse rounded-full"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="bg-primary h-3 w-1 animate-pulse rounded-full"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}
          {state === 'paused' && <Pause className="h-8 w-8 text-amber-500" />}
          {state === 'idle' && <Mic className="text-muted-foreground h-8 w-8" />}
        </div>
      </div>

      <p className="text-foreground mb-4 text-center text-sm font-medium">{statusText}</p>

      {/* Live transcript */}
      {currentTranscript && (
        <div className="border-border bg-background/50 mb-3 rounded-lg border p-3 text-sm">
          <span className="text-foreground text-xs font-medium">You: </span>
          <span className="text-muted-foreground">{currentTranscript}</span>
        </div>
      )}

      {/* Message history */}
      {messages.length > 0 && (
        <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {messages.slice(-6).map((msg, i) => (
            <div
              key={i}
              className={cn(
                'border-border rounded-lg border p-2.5 text-xs',
                msg.role === 'user' ? 'bg-primary/5' : 'bg-background/50',
              )}
            >
              <span className="text-foreground font-medium">
                {msg.role === 'user' ? 'You' : (teacher?.name ?? 'AI')}:{' '}
              </span>
              <span className="text-muted-foreground">{msg.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Mic / Send */}
        <Button
          onClick={handleMicClick}
          disabled={!sttSupported || !teacher}
          className={cn(
            'h-12 w-12 rounded-full p-0',
            isListening &&
              'bg-destructive text-destructive-foreground hover:bg-destructive animate-pulse',
          )}
          aria-label={isListening ? 'Stop and send' : 'Start speaking'}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {/* Pause/Resume */}
        {isSpeaking && (
          <Button
            onClick={isPaused ? resume : pause}
            className="h-12 w-12 rounded-full p-0"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        )}

        {/* Interrupt */}
        {isSpeaking && (
          <Button
            onClick={interrupt}
            variant="destructive"
            className="h-12 w-12 rounded-full p-0"
            aria-label="Interrupt"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}

        {/* Clear */}
        {messages.length > 0 && state === 'idle' && (
          <Button
            onClick={clearConversation}
            variant="ghost"
            className="h-12 w-12 rounded-full p-0"
            aria-label="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Browser support warnings */}
      {!sttSupported && (
        <p className="mt-3 text-center text-xs text-amber-500">
          Voice input requires Chrome, Edge, or Safari.
        </p>
      )}
      {!ttsSupported && (
        <p className="mt-1 text-center text-xs text-amber-500">
          Text-to-speech is not supported in this browser.
        </p>
      )}

      {/* Settings dialog */}
      <VoiceSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
