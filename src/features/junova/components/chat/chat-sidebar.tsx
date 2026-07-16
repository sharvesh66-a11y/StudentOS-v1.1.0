'use client';

/**
 * StudentOS Junova AI — Chat Sidebar
 *
 * Shows the list of conversations for the active teacher, plus a search bar,
 * "New Chat" button, and conversation actions (rename, pin, delete, export).
 *
 * @see src/features/junova/hooks/use-conversations.ts
 */

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  Download,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConversations } from '../../hooks/use-conversations';
import { chatService } from '../../services/chat.service';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/utils/format';
import type { Conversation } from '../../types';
import { toast } from 'sonner';

export interface ChatSidebarProps {
  teacherId: string;
  activeConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
}

export function ChatSidebar({
  teacherId,
  activeConversation,
  onSelectConversation,
}: ChatSidebarProps) {
  const { conversations, create, rename, togglePin, remove } = useConversations(teacherId);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) => c.title.toLowerCase().includes(q) || c.lastMessagePreview.toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  const handleNewChat = async () => {
    const conv = await create(teacherId);
    if (conv) onSelectConversation(conv);
  };

  const handleRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const handleRenameSubmit = async (conv: Conversation) => {
    if (renameValue.trim()) {
      await rename(conv.id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleExport = async (conv: Conversation) => {
    try {
      const result = await chatService.getRecentMessages(conv.id, 1000);
      if (result.success && result.data) {
        const messages = result.data;
        const lines = messages.map((m) => {
          const role = m.role === 'user' ? 'You' : 'AI';
          return `[${new Date(m.createdAt).toISOString()}] ${role}:\n${m.content}\n`;
        });
        const text = `# ${conv.title}\n\n${lines.join('\n---\n\n')}`;
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_')}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Chat exported');
      }
    } catch {
      toast.error('Failed to export chat');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border border-b p-3">
        <Button onClick={handleNewChat} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="border-border border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats…"
            aria-label="Search conversations"
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            <MessageSquare className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
            {searchQuery ? 'No chats found' : 'No chats yet. Start a new one!'}
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => (renamingId === conv.id ? undefined : onSelectConversation(conv))}
                className={cn(
                  'group cursor-pointer rounded-lg px-3 py-2 transition-colors',
                  activeConversation?.id === conv.id ? 'bg-accent' : 'hover:bg-accent/50',
                )}
              >
                {renamingId === conv.id ? (
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(conv)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(conv);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    className="h-7 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {conv.pinned && <Pin className="text-primary h-3 w-3 shrink-0" />}
                        <p className="text-foreground truncate text-sm font-medium">{conv.title}</p>
                      </div>
                      {conv.lastMessagePreview && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {conv.lastMessagePreview}
                        </p>
                      )}
                      <p className="text-muted-foreground/60 mt-0.5 text-[10px]">
                        {formatRelativeTime(new Date(conv.updatedAt))}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Conversation actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRename(conv)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePin(conv.id, !conv.pinned)}>
                          {conv.pinned ? (
                            <>
                              <PinOff className="mr-2 h-3.5 w-3.5" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="mr-2 h-3.5 w-3.5" />
                              Pin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(conv)}>
                          <Download className="mr-2 h-3.5 w-3.5" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => remove(conv.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
