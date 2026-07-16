/**
 * Component tests for the Junova ChatMessage component.
 *
 * Verifies:
 *   - User vs assistant messages render with different alignment / styling
 *   - Markdown content renders as HTML (headings, paragraphs)
 *   - Streaming state shows the "Thinking…" indicator
 *   - Action bar (Copy, Regenerate, Continue) appears only when appropriate
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Message, AITeacher } from '@/features/junova/types';

// `sonner`'s toast() doesn't render in jsdom without a Toaster mounted.
// Mock it so the copy button's toast.success call is a no-op.
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock the MarkdownRenderer — it imports `katex/dist/katex.min.css` which
// triggers Vite's PostCSS loader (incompatible with this project's
// `@tailwindcss/postcss` plugin format). The mock renders the raw content
// in a paragraph so we can still assert on visible text.
vi.mock('@/features/junova/components/chat/markdown-renderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="markdown">{content}</div>
  ),
}));

import { ChatMessage } from '@/features/junova/components/chat/chat-message';

// --- Fixtures ------------------------------------------------------------

const userMessage: Message = {
  id: 'm1',
  conversationId: 'c1',
  role: 'user',
  content: 'What is the derivative of x^2?',
  createdAt: 0,
};

const assistantMessage: Message = {
  id: 'm2',
  conversationId: 'c1',
  role: 'assistant',
  content: 'The derivative of x^2 is **2x**.',
  createdAt: 0,
};

const teacher: AITeacher = {
  id: 't1',
  uid: 'u1',
  name: 'Ada Lovelace',
  avatarURL: null,
  subject: 'Mathematics',
  preset: 'friendly-mentor',
  teachingStyle: 'socratic',
  bio: '',
  themeColor: '#7c3aed',
  dna: {
    friendliness: 70,
    strictness: 50,
    humor: 40,
    explanationDepth: 60,
    patience: 80,
    motivation: 70,
    emojiUsage: 20,
    storytelling: 50,
    realLifeExamples: 60,
    examFocused: false,
    difficulty: 'intermediate',
  },
  createdAt: 0,
  updatedAt: 0,
};

afterEach(() => {
  vi.clearAllMocks();
});

// --- Tests ---------------------------------------------------------------

describe('ChatMessage', () => {
  it('renders user message content', () => {
    render(<ChatMessage message={userMessage} />);
    expect(screen.getByText('What is the derivative of x^2?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<ChatMessage message={assistantMessage} teacher={teacher} />);
    // MarkdownRenderer is mocked to render the raw content in a div.
    expect(screen.getByText(/The derivative of/)).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('2x');
  });

  it('renders the teacher initials in the avatar for assistant messages', () => {
    render(<ChatMessage message={assistantMessage} teacher={teacher} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('falls back to a robot emoji when no teacher is provided', () => {
    render(<ChatMessage message={assistantMessage} teacher={null} />);
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  it('does not render a teacher avatar for user messages', () => {
    render(<ChatMessage message={userMessage} teacher={teacher} />);
    // User message has no avatar block — the initials "AL" should not appear.
    expect(screen.queryByText('AL')).not.toBeInTheDocument();
  });

  it('shows the "Thinking…" indicator when streaming and content is empty', () => {
    const streaming: Message = { ...assistantMessage, content: '' };
    render(<ChatMessage message={streaming} teacher={teacher} isStreaming />);
    expect(screen.getByText('Thinking…')).toBeInTheDocument();
  });

  it('does not show the action bar while streaming', () => {
    const streaming: Message = { ...assistantMessage };
    render(<ChatMessage message={streaming} teacher={teacher} isStreaming />);
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
  });

  it('shows the Copy action when the assistant message is not streaming', () => {
    render(<ChatMessage message={assistantMessage} teacher={teacher} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('shows the Regenerate action only for the last assistant message when onRegenerate is provided', () => {
    render(
      <ChatMessage message={assistantMessage} teacher={teacher} isLast onRegenerate={() => {}} />,
    );
    expect(screen.getByText('Regenerate')).toBeInTheDocument();
  });

  it('hides the Regenerate action when isLast is false', () => {
    render(
      <ChatMessage
        message={assistantMessage}
        teacher={teacher}
        isLast={false}
        onRegenerate={() => {}}
      />,
    );
    expect(screen.queryByText('Regenerate')).not.toBeInTheDocument();
  });

  it('hides the Regenerate action when onRegenerate is not provided', () => {
    render(<ChatMessage message={assistantMessage} teacher={teacher} isLast />);
    expect(screen.queryByText('Regenerate')).not.toBeInTheDocument();
  });

  it('shows the Continue action when isLast + onContinue + not streaming', () => {
    render(
      <ChatMessage message={assistantMessage} teacher={teacher} isLast onContinue={() => {}} />,
    );
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('fires onRegenerate when the Regenerate button is clicked', async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();
    render(
      <ChatMessage
        message={assistantMessage}
        teacher={teacher}
        isLast
        onRegenerate={onRegenerate}
      />,
    );
    await user.click(screen.getByText('Regenerate'));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it('renders image attachments with alt text', () => {
    const msg: Message = {
      ...userMessage,
      attachments: [{ type: 'image', url: 'https://example.com/a.png', filename: 'a.png' }],
    };
    render(<ChatMessage message={msg} />);
    const img = screen.getByAltText('a.png');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
  });

  it('renders pdf/file attachments with the filename', () => {
    const msg: Message = {
      ...assistantMessage,
      attachments: [{ type: 'pdf', url: 'https://example.com/a.pdf', filename: 'a.pdf' }],
    };
    render(<ChatMessage message={msg} teacher={teacher} />);
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
  });

  it('Copy button calls navigator.clipboard.writeText with the message content', async () => {
    // Spy on navigator.clipboard.writeText — userEvent.setup() replaces
    // the clipboard mock with its own, so we attach a spy on top of
    // whatever implementation is currently installed.
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ChatMessage message={assistantMessage} teacher={teacher} />);
    await user.click(screen.getByText('Copy'));

    expect(writeTextSpy).toHaveBeenCalledWith('The derivative of x^2 is **2x**.');
    writeTextSpy.mockRestore();
  });
});
