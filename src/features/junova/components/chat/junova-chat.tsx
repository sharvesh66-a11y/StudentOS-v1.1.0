'use client';

/**
 * StudentOS Junova AI — Main Chat Interface
 *
 * The full Junova AI chat experience. Layout:
 * - Left: teacher selector + conversation sidebar
 * - Center: active chat (messages + input)
 * - Right: teacher info panel (optional, toggled)
 *
 * If no teacher is selected, shows the teacher list (create/select).
 * If a teacher is selected but no conversation, shows empty state with
 * "Start New Chat" button.
 */

import { useEffect, useRef, useCallback } from 'react';
import { Sparkles, MessageSquarePlus, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeacherList } from '../teacher/teacher-list';
import { TeacherCard } from '../teacher/teacher-card';
import { ChatSidebar } from './chat-sidebar';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useTeachers } from '../../hooks/use-teachers';
import { useConversations } from '../../hooks/use-conversations';
import { useStreamingChat } from '../../hooks/use-streaming-chat';
import { useJunovaStore } from '../../store/junova.store';
import { getInitials } from '@/utils/format';
import { useState } from 'react';
import type { AITeacher } from '../../types';

export function JunovaChat() {
  const { teachers } = useTeachers();
  const { activeTeacher, setActiveTeacher, activeConversation, setActiveConversation } =
    useJunovaStore();

  const { create } = useConversations(activeTeacher?.id);
  const {
    messages,
    isLoading,
    isStreaming,
    suggestions,
    sendMessage,
    regenerate,
    continueResponse,
    stopStreaming,
  } = useStreamingChat(activeConversation, activeTeacher);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTeacherSwitcher, setShowTeacherSwitcher] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If only one teacher exists and none is active, auto-select it
  useEffect(() => {
    if (!activeTeacher && teachers.length === 1) {
      setActiveTeacher(teachers[0]);
    }
  }, [activeTeacher, teachers, setActiveTeacher]);

  // Stable callback so TeacherCard's React.memo doesn't re-render every card
  // when the teacher switcher dropdown toggles.
  const handleSwitchTeacher = useCallback(
    (t: AITeacher) => {
      setActiveTeacher(t);
      setActiveConversation(null);
      setShowTeacherSwitcher(false);
    },
    [setActiveTeacher, setActiveConversation],
  );

  // --- No teacher selected: show teacher list ---
  if (!activeTeacher) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <TeacherList />
      </div>
    );
  }

  const initials = getInitials(activeTeacher.name) || '🤖';

  const handleNewChat = async () => {
    const conv = await create(activeTeacher.id);
    if (conv) setActiveConversation(conv);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar — conversations */}
      <div className="border-border bg-card/30 hidden w-72 shrink-0 border-r lg:flex lg:flex-col">
        {/* Teacher switcher */}
        <div className="border-border border-b p-3">
          <button
            onClick={() => setShowTeacherSwitcher(!showTeacherSwitcher)}
            className="hover:bg-accent flex w-full items-center gap-3 rounded-lg p-2 transition-colors"
            aria-label={`Switch teacher (currently ${activeTeacher.name})`}
            aria-haspopup="true"
            aria-expanded={showTeacherSwitcher}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: activeTeacher.themeColor }}
            >
              {activeTeacher.avatarURL ? (
                <img
                  src={activeTeacher.avatarURL}
                  alt={activeTeacher.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-foreground truncate text-sm font-medium">{activeTeacher.name}</p>
              <p className="text-muted-foreground truncate text-xs">{activeTeacher.subject}</p>
            </div>
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </button>

          {/* Teacher switcher dropdown */}
          {showTeacherSwitcher && (
            <div className="border-border bg-popover mt-2 space-y-1 rounded-lg border p-1">
              <button
                onClick={() => {
                  setActiveTeacher(null);
                  setActiveConversation(null);
                  setShowTeacherSwitcher(false);
                }}
                className="text-muted-foreground hover:bg-accent flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All teachers
              </button>
              {teachers.map((t) => (
                <TeacherCard
                  key={t.id}
                  teacher={t}
                  isActive={t.id === activeTeacher.id}
                  onSelect={handleSwitchTeacher}
                />
              ))}
            </div>
          )}
        </div>

        {/* Conversation list */}
        <ChatSidebar
          teacherId={activeTeacher.id}
          activeConversation={activeConversation}
          onSelectConversation={setActiveConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Sparkles className="text-primary h-6 w-6 animate-pulse" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <div
                      className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-lg font-semibold text-white"
                      style={{ backgroundColor: activeTeacher.themeColor }}
                    >
                      {activeTeacher.avatarURL ? (
                        <img
                          src={activeTeacher.avatarURL}
                          alt={activeTeacher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <h2 className="text-foreground mt-4 text-lg font-semibold">
                      {activeTeacher.name}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">{activeTeacher.bio}</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        teacher={activeTeacher}
                        isLast={i === messages.length - 1}
                        isStreaming={isStreaming && msg.isStreaming}
                        onRegenerate={regenerate}
                        onContinue={continueResponse}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-border bg-background/80 border-t px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl">
                <ChatInput
                  conversationId={activeConversation.id}
                  onSend={sendMessage}
                  isStreaming={isStreaming}
                  onStop={stopStreaming}
                  suggestions={suggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          </>
        ) : (
          // No active conversation — empty state
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl text-xl font-semibold text-white"
              style={{ backgroundColor: activeTeacher.themeColor }}
            >
              {activeTeacher.avatarURL ? (
                <img
                  src={activeTeacher.avatarURL}
                  alt={activeTeacher.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <h2 className="text-foreground mt-4 text-xl font-semibold">
              Chat with {activeTeacher.name}
            </h2>
            <p className="text-muted-foreground mt-1 max-w-md text-center text-sm">
              {activeTeacher.bio || `Your ${activeTeacher.subject} teacher is ready to help.`}
            </p>
            <Button className="mt-6" onClick={handleNewChat}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Start New Chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
