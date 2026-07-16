'use client';

/**
 * StudentOS Junova AI — useStreamingChat Hook
 *
 * Manages a single active conversation: loads messages, sends new messages
 * via the streaming API, handles regenerate/continue, and fetches suggested
 * follow-up questions.
 *
 * Streaming is done via fetch + ReadableStream (Server-Sent Events format).
 *
 * @see src/app/api/junova/chat/route.ts
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { authedFetch } from '@/lib/api-client';
import { chatService } from '../services/chat.service';
import { memoryService } from '../services/memory.service';
import type { AITeacher, Conversation, Message, ChatStreamChunk, StudentMemory } from '../types';
import { toast } from 'sonner';

export function useStreamingChat(conversation: Conversation | null, teacher: AITeacher | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const memoryRef = useRef<StudentMemory | null>(null);

  // Subscribe to messages when a conversation is selected
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const unsubscribe = chatService.subscribeToMessages(
      conversation.id,
      (next) => {
        setMessages(next);
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );

    return unsubscribe;
  }, [conversation]);

  // Send a message and stream the response
  const sendMessage = useCallback(
    async (content: string, attachments?: Message['attachments']) => {
      if (!conversation || !teacher || !content.trim()) return;

      // Abort any existing stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Fetch memory before sending (Phase 2 — personalization)
      try {
        const uid = conversation.uid;
        const memResult = await memoryService.getMemory(uid);
        memoryRef.current = memResult.success ? (memResult.data ?? null) : null;
      } catch {
        memoryRef.current = null;
      }

      // Save user message to Firestore
      void (await chatService.addMessage(conversation.id, 'user', content, attachments));
      await chatService.touchConversation(conversation.id, content);

      // Create a placeholder assistant message for streaming
      const placeholderId = `streaming-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          conversationId: conversation.id,
          role: 'assistant',
          content: '',
          isStreaming: true,
          createdAt: Date.now(),
        },
      ]);

      setIsStreaming(true);

      // Build history from current messages (exclude the placeholder)
      const history = messages
        .filter((m) => !m.isStreaming)
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await authedFetch('/api/junova/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversation.id,
            teacherId: teacher.id,
            teacher,
            message: content,
            history,
            attachments,
            memory: memoryRef.current,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error('Failed to start streaming response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        // Helper — preserve any partial response that was streamed before the
        // error. If nothing was streamed, remove the placeholder entirely.
        // Partial responses are kept locally (not saved to Firestore) so the
        // user can review / continue from where the stream broke without
        // polluting the conversation history with incomplete messages.
        const preservePartialOrRemove = () => {
          setMessages((prev) => {
            if (accumulated.length > 0) {
              return prev.map((m) =>
                m.id === placeholderId ? { ...m, content: accumulated, isStreaming: false } : m,
              );
            }
            return prev.filter((m) => m.id !== placeholderId);
          });
        };

        // Read the stream
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
              const chunk: ChatStreamChunk = JSON.parse(jsonStr);

              if (chunk.type === 'delta' && chunk.content) {
                accumulated += chunk.content;
                // Update the placeholder message
                setMessages((prev) =>
                  prev.map((m) => (m.id === placeholderId ? { ...m, content: accumulated } : m)),
                );
              } else if (chunk.type === 'review-correction' && chunk.content) {
                // Review engine rewrote or blocked the response — replace
                // the accumulated content with the approved version.
                accumulated = chunk.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === placeholderId
                      ? { ...m, content: accumulated, review: chunk.review }
                      : m,
                  ),
                );
                if (chunk.review?.verdict === 'rejected') {
                  toast.warning('Response blocked by Safety AI', {
                    description: 'The response was not safe for students.',
                  });
                } else if (chunk.review?.wasRewritten) {
                  toast.info('Response reviewed & rewritten', {
                    description: 'StudentOS Review Engine improved this response.',
                  });
                }
              } else if (chunk.type === 'review-enhanced' && chunk.content) {
                // Review engine enhanced the response — replace with enhanced version
                accumulated = chunk.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === placeholderId
                      ? { ...m, content: accumulated, review: chunk.review }
                      : m,
                  ),
                );
                toast.success('Response enhanced', {
                  description: 'Learning AI added study tips and practice questions.',
                });
              } else if (chunk.type === 'review-meta' && chunk.review) {
                // Response approved as-is — just attach review metadata
                setMessages((prev) =>
                  prev.map((m) => (m.id === placeholderId ? { ...m, review: chunk.review } : m)),
                );
              } else if (chunk.type === 'done') {
                // Save the complete assistant message to Firestore
                await chatService.addMessage(conversation.id, 'assistant', accumulated, [], {
                  canRegenerate: true,
                });
                await chatService.touchConversation(conversation.id, accumulated);

                // Remove the placeholder
                setMessages((prev) => prev.filter((m) => m.id !== placeholderId));

                // Fetch suggested follow-ups
                fetchSuggestions(teacher, content, accumulated);
              } else if (chunk.type === 'error') {
                toast.error('AI response failed', {
                  description: chunk.error ?? 'Unknown error',
                });
                // Preserve any partial response that was streamed before the
                // error event arrived; remove the placeholder only if nothing
                // was received.
                preservePartialOrRemove();
              }
            } catch {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to send message', {
            description: err instanceof Error ? err.message : 'Unknown error',
          });
        }
        // Preserve any partial response streamed before the network/abort
        // error; remove the placeholder only if nothing was received. For
        // AbortError (user clicked "Stop"), keeping the partial response is
        // the expected behavior — the user wants to keep what was streamed.
        setMessages((prev) => {
          const hasPartial = prev.some((m) => m.id === placeholderId && m.content.length > 0);
          if (hasPartial) {
            return prev.map((m) => (m.id === placeholderId ? { ...m, isStreaming: false } : m));
          }
          return prev.filter((m) => m.id !== placeholderId);
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversation, teacher, messages],
  );

  // Fetch suggested follow-up questions
  const fetchSuggestions = useCallback(
    async (t: AITeacher, userMsg: string, assistantMsg: string) => {
      try {
        const response = await authedFetch('/api/junova/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacher: t,
            lastUserMessage: userMsg,
            lastAssistantResponse: assistantMsg,
          }),
        });
        const data = await response.json();
        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // Silently fail — suggestions are non-critical
      }
    },
    [],
  );

  // Regenerate the last assistant response
  const regenerate = useCallback(async () => {
    if (!conversation || messages.length < 2) return;

    // Find the last user message
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;

    const lastUserMsg = messages[messages.length - 1 - lastUserIdx];
    if (!lastUserMsg) return;

    // Remove all messages after the last user message
    const trimmedMessages = messages.slice(0, messages.length - 1 - lastUserIdx + 1);
    setMessages(trimmedMessages);

    // Re-send the last user message
    await sendMessage(lastUserMsg.content, lastUserMsg.attachments);
  }, [conversation, messages, sendMessage]);

  // Continue the last assistant response — extends a truncated response
  const continueResponse = useCallback(async () => {
    if (!conversation || !teacher || messages.length === 0 || isStreaming) return;

    // Find the last assistant message
    const lastAssistantMsg = [...messages]
      .reverse()
      .find((m) => m.role === 'assistant' && !m.isStreaming);
    if (!lastAssistantMsg || !lastAssistantMsg.content) return;

    const existingContent = lastAssistantMsg.content;

    // Abort any existing stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Mark the last assistant message as streaming again (append mode)
    const streamingId = lastAssistantMsg.id;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamingId ? { ...m, isStreaming: true, content: existingContent } : m,
      ),
    );

    setIsStreaming(true);

    // Build history from current messages (exclude the streaming one)
    const history = messages
      .filter((m) => !m.isStreaming && m.id !== streamingId)
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    // Add the existing assistant response as context, then ask to continue
    const continueInstruction = `Please continue your previous response from where it left off. Here is what you said so far:\n\n"${existingContent}"\n\nContinue naturally from where this ends, without repeating what you already said.`;

    // Declare `accumulated` outside the try block so the catch block can
    // preserve any partial response streamed before the error.
    let accumulated = '';

    try {
      const response = await authedFetch('/api/junova/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          teacherId: teacher.id,
          teacher,
          message: continueInstruction,
          history,
          memory: memoryRef.current,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start streaming response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
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
            const chunk: ChatStreamChunk = JSON.parse(jsonStr);

            if (chunk.type === 'delta' && chunk.content) {
              accumulated += chunk.content;
              // Append to the existing assistant message
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId ? { ...m, content: existingContent + accumulated } : m,
                ),
              );
            } else if (
              (chunk.type === 'review-correction' || chunk.type === 'review-enhanced') &&
              chunk.content
            ) {
              // Review engine modified the response
              accumulated = chunk.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, content: existingContent + accumulated, review: chunk.review }
                    : m,
                ),
              );
              if (chunk.review?.verdict === 'rejected') {
                toast.warning('Response blocked by Safety AI');
              } else if (chunk.review?.wasRewritten) {
                toast.info('Response reviewed & rewritten by StudentOS');
              } else if (chunk.type === 'review-enhanced') {
                toast.success('Response enhanced by Learning AI');
              }
            } else if (chunk.type === 'review-meta' && chunk.review) {
              setMessages((prev) =>
                prev.map((m) => (m.id === streamingId ? { ...m, review: chunk.review } : m)),
              );
            } else if (chunk.type === 'done') {
              // Update the Firestore message with the full continued content
              await chatService.updateMessage(conversation.id, streamingId, {
                content: existingContent + accumulated,
                isStreaming: false,
              });
              await chatService.touchConversation(conversation.id, existingContent + accumulated);

              // Mark as no longer streaming
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, isStreaming: false, content: existingContent + accumulated }
                    : m,
                ),
              );

              // Fetch new suggestions
              fetchSuggestions(teacher, continueInstruction, existingContent + accumulated);
            } else if (chunk.type === 'error') {
              toast.error('Continue failed', {
                description: chunk.error ?? 'Unknown error',
              });
              // Preserve any partial continuation that was streamed before
              // the error; otherwise restore the original content.
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? {
                        ...m,
                        isStreaming: false,
                        content:
                          accumulated.length > 0 ? existingContent + accumulated : existingContent,
                      }
                    : m,
                ),
              );
            }
          } catch {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to continue response', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
      // Preserve any partial continuation streamed before the error
      // (including user-initiated aborts via stopStreaming); otherwise
      // restore the original content.
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? {
                ...m,
                isStreaming: false,
                content: accumulated.length > 0 ? existingContent + accumulated : existingContent,
              }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [conversation, teacher, messages, isStreaming, fetchSuggestions]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    suggestions,
    sendMessage,
    regenerate,
    continueResponse,
    stopStreaming,
  };
}
