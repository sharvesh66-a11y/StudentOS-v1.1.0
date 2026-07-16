'use client';

/**
 * StudentOS Junova AI — Classroom Layout
 *
 * Full-screen live teaching experience with:
 * - Animated AI Teacher avatar (with lip-sync during speech)
 * - Whiteboard (toggleable)
 * - Voice conversation controls
 * - Fullscreen mode
 * - Responsive design (desktop + mobile)
 *
 * Integrates with:
 * - useLiveTeacher — session settings
 * - useVoiceConversation — voice loop + expression state
 * - useVoicePreferences — TTS settings
 *
 * @see src/features/junova/components/live-teacher/avatar.tsx
 * @see src/features/junova/components/live-teacher/whiteboard.tsx
 */

import { useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Pause,
  Play,
  Maximize2,
  Minimize2,
  PenTool,
  Volume2,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from './avatar';
import { Whiteboard } from './whiteboard';
import { useLiveTeacher } from '../../hooks/use-live-teacher';
import { useVoiceConversation } from '../../hooks/use-voice-conversation';
import { useVoicePreferences } from '../../hooks/use-voice-preferences';
import { useTeachers } from '../../hooks/use-teachers';
import { useJunovaStore } from '../../store/junova.store';
import { cn } from '@/lib/utils';
import type { AvatarExpression } from '../../types';

export function ClassroomLayout() {
  const { settings, toggleFullscreen, toggleWhiteboard } = useLiveTeacher();
  const { activeTeacher } = useJunovaStore();
  const { teachers } = useTeachers();
  const { preferences } = useVoicePreferences();

  // Use the active teacher from the store, or the first teacher
  const teacher = activeTeacher ?? teachers[0] ?? null;

  // Map voice conversation expression to avatar expression
  const [avatarExpression, setAvatarExpression] = useState<AvatarExpression>('neutral');

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
  } = useVoiceConversation({
    teacher,
    preferences,
    onExpressionChange: (exp) => {
      const mapped: AvatarExpression =
        exp === 'listening'
          ? 'focused'
          : exp === 'thinking'
            ? 'thinking'
            : exp === 'speaking'
              ? 'speaking'
              : 'neutral';
      setAvatarExpression(mapped);
    },
  });

  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopAndSend();
    } else {
      startConversation();
    }
  }, [isListening, startConversation, stopAndSend]);

  const isFullscreen = settings?.fullscreenMode ?? false;
  const whiteboardEnabled = settings?.whiteboardEnabled ?? false;

  return (
    <div
      className={cn(
        'bg-background flex flex-col overflow-hidden',
        isFullscreen
          ? 'fixed inset-0 z-50'
          : 'border-border min-h-[calc(100vh-4rem)] rounded-xl border',
      )}
    >
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-foreground text-sm font-semibold">
            {teacher?.name ?? 'AI Teacher'} · Live Session
          </h2>
          {state !== 'idle' && (
            <span className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium">
              <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
              {state}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Whiteboard toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWhiteboard}
            className={cn('h-8 gap-1.5', whiteboardEnabled && 'bg-primary/10 text-primary')}
            aria-label="Toggle whiteboard"
            aria-pressed={whiteboardEnabled}
          >
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Whiteboard</span>
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-1 overflow-hidden',
          whiteboardEnabled ? 'flex-col lg:flex-row' : 'flex-col',
        )}
      >
        {/* Avatar section */}
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <Avatar
            expression={avatarExpression}
            isSpeaking={isSpeaking && !isPaused}
            settings={settings}
            teacherName={teacher?.name}
            themeColor={teacher?.themeColor}
          />

          {/* Live transcript */}
          {(currentTranscript || messages.length > 0) && (
            <div className="mt-8 w-full max-w-2xl space-y-2">
              {currentTranscript && (
                <div className="border-border bg-card/50 text-muted-foreground rounded-lg border p-3 text-sm">
                  <span className="text-foreground text-xs font-medium">You: </span>
                  {currentTranscript}
                </div>
              )}
              {messages.slice(-3).map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'border-border rounded-lg border p-3 text-sm',
                    msg.role === 'user' ? 'bg-primary/5' : 'bg-card/50',
                  )}
                >
                  <span className="text-foreground text-xs font-medium">
                    {msg.role === 'user' ? 'You' : (teacher?.name ?? 'AI')}:{' '}
                  </span>
                  <span className="text-muted-foreground">{msg.content}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Whiteboard section */}
        {whiteboardEnabled && (
          <div
            className={cn(
              'border-border border-t lg:border-t-0 lg:border-l',
              isFullscreen ? 'h-1/2' : 'h-64',
            )}
          >
            <Whiteboard className="h-full rounded-none border-0" />
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="border-border bg-card/30 flex items-center justify-center gap-3 border-t px-4 py-4">
        {/* Mic button */}
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

        {/* Pause/Resume (while speaking) */}
        {isSpeaking && (
          <Button
            onClick={isPaused ? resume : pause}
            className="h-12 w-12 rounded-full p-0"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        )}

        {/* Interrupt (while speaking) */}
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

        {/* TTS status */}
        {ttsSupported && (
          <div className="text-muted-foreground ml-2 flex items-center gap-1.5 text-xs">
            <Volume2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{preferences?.voiceURI ?? 'Default voice'}</span>
          </div>
        )}

        {/* Settings */}
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0" aria-label="Voice settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Browser support warnings */}
      {!sttSupported && (
        <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center text-xs text-amber-500">
          Voice input is not supported in this browser. Use Chrome, Edge, or Safari.
        </div>
      )}
      {!ttsSupported && (
        <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center text-xs text-amber-500">
          Text-to-speech is not supported in this browser.
        </div>
      )}
    </div>
  );
}
