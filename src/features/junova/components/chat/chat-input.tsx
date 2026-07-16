'use client';

/**
 * StudentOS Junova AI — Chat Input
 *
 * Message input with:
 * - Multiline text area (auto-grow)
 * - File upload (images + PDFs to Firebase Storage)
 * - Voice input (Web Speech API)
 * - Send button (disabled while streaming)
 * - Stop button (visible while streaming)
 * - Suggested follow-up questions
 */

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { Send, Paperclip, Mic, Square, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useVoiceInput } from '../../hooks/use-voice-input';
import { uploadFile } from '@/firebase';
import { cn } from '@/lib/utils';
import type { MessageAttachment } from '../../types';

export interface ChatInputProps {
  conversationId: string;
  onSend: (content: string, attachments?: MessageAttachment[]) => Promise<void>;
  isStreaming: boolean;
  onStop: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  suggestions = [],
  onSuggestionClick,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: voiceSupported,
  } = useVoiceInput();

  // Sync voice transcript into input
  useState(() => {
    if (transcript) {
      setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
    }
  });

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isStreaming) return;

    await onSend(content, attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
  }, [input, attachments, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded: MessageAttachment[] = [];
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          toast.error(`${file.name}: only images and PDFs are supported`);
          continue;
        }

        // Use a generic path — in production, use the user's UID
        const path = `chat-uploads/${Date.now()}-${file.name}`;
        const result = await uploadFile(path, file, {
          contentType: file.type,
          customMetadata: { filename: file.name },
        });

        if (result.success && result.data) {
          uploaded.push({
            type: isImage ? 'image' : 'pdf',
            url: result.data,
            filename: file.name,
          });
        } else if (result.error) {
          toast.error(`Failed to upload ${file.name}`, {
            description: result.error.message,
          });
        }
      }
      setAttachments((prev) => [...prev, ...uploaded]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setInput(''); // Clear before listening
      startListening();
    }
  };

  return (
    <div className="space-y-3">
      {/* Suggested follow-ups */}
      {suggestions.length > 0 && !isStreaming && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground rounded-full border px-3 py-1.5 text-xs transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="border-border bg-card relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
            >
              <span className="text-foreground max-w-[120px] truncate">{att.filename}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove attachment ${att.filename}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* File upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming || isUploading}
          aria-label="Attach files"
          className="shrink-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        {/* Voice input */}
        {voiceSupported && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceToggle}
            disabled={isStreaming}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            className={cn('shrink-0', isListening && 'bg-destructive/10 text-destructive')}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your teacher anything…"
          disabled={isStreaming}
          rows={1}
          className="max-h-32 min-h-[40px] flex-1 resize-none"
        />

        {/* Send / Stop */}
        {isStreaming ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={onStop}
            aria-label="Stop streaming"
            className="shrink-0"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isUploading}
            aria-label="Send message"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
