'use client';

/**
 * StudentOS Junova AI — Chat Message
 *
 * Renders a single message in the chat. User messages are right-aligned
 * with a purple accent; assistant messages are left-aligned with the
 * teacher's theme color. Supports:
 * - Markdown rendering (code, math, tables)
 * - Copy response
 * - Regenerate (for last assistant message)
 * - Streaming indicator (blinking cursor)
 * - Attachments (images, PDFs)
 */

import { memo, useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, FileText, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownRenderer } from './markdown-renderer';
import { ReviewBadge } from '@/features/ai-review/components/review-badge';
import { getInitials } from '@/utils/format';
import type { Message, AITeacher } from '../../types';

export interface ChatMessageProps {
  message: Message;
  teacher?: AITeacher | null;
  isLast?: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onContinue?: () => void;
}

function Attachments({ attachments }: { attachments: NonNullable<Message['attachments']> }) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((att, i) => {
        if (att.type === 'image') {
          return (
            <a
              key={i}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border block overflow-hidden rounded-lg border"
            >
              {}
              <img src={att.url} alt={att.filename} className="max-h-32 max-w-xs object-cover" />
            </a>
          );
        }
        return (
          <a
            key={i}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-card text-foreground hover:bg-accent flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
          >
            <FileText className="text-primary h-4 w-4" />
            <span className="max-w-[150px] truncate">{att.filename}</span>
          </a>
        );
      })}
    </div>
  );
}

export const ChatMessage = memo(function ChatMessage({
  message,
  teacher,
  isLast,
  isStreaming,
  onRegenerate,
  onContinue,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const initials = teacher ? getInitials(teacher.name) : '🤖';
  const themeColor = teacher?.themeColor ?? '#7c3aed';

  if (isUser) {
    return (
      <div className="animate-fade-up flex justify-end gap-3">
        <div className="bg-primary text-primary-foreground max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5">
          {message.attachments && message.attachments.length > 0 && (
            <Attachments attachments={message.attachments} />
          )}
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="animate-fade-up flex gap-3">
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: themeColor }}
      >
        {initials}
      </div>

      {/* Message body */}
      <div className="min-w-0 flex-1">
        <div className="border-border bg-card/50 rounded-2xl rounded-tl-sm border px-4 py-3">
          {message.attachments && message.attachments.length > 0 && (
            <Attachments attachments={message.attachments} />
          )}

          {message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : isStreaming ? (
            <div className="text-muted-foreground flex items-center gap-2 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-sm">Thinking…</span>
            </div>
          ) : null}

          {/* Streaming cursor */}
          {isStreaming && message.content && (
            <span className="bg-primary ml-0.5 inline-block h-4 w-1.5 animate-pulse" />
          )}

          {/* Review Engine badge (assistant messages only, after review) */}
          {message.review && !isStreaming && (
            <ReviewBadge review={message.review} className="mt-2" />
          )}
        </div>

        {/* Action bar (non-streaming, last message only) */}
        {!isStreaming && message.content && (
          <div className="mt-1 flex items-center gap-1 px-1">
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            )}
            {isLast && onContinue && !isStreaming && (
              <button
                onClick={onContinue}
                className="text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
              >
                <ChevronRight className="h-3 w-3" />
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
