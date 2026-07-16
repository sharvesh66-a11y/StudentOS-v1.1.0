'use client';

/**
 * StudentOS Junova AI — Markdown Renderer
 *
 * Renders AI responses with full Markdown support including:
 * - Code blocks with syntax highlighting
 * - Mathematical equations (LaTeX via KaTeX)
 * - Tables
 * - Links, lists, blockquotes
 *
 * @see react-markdown, remark-math, rehype-katex
 */

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import 'katex/dist/katex.min.css';

export interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Code copied');
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className="group border-border relative my-3 overflow-hidden rounded-lg border">
      <div className="border-border bg-muted/50 flex items-center justify-between border-b px-3 py-1.5">
        <span className="text-muted-foreground text-xs font-medium">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: 'transparent',
          fontSize: '0.875rem',
          padding: '0.75rem 1rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-headings:scroll-mt-20 prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-table:overflow-hidden prose-th:border-border prose-th:bg-muted/50 prose-th:px-3 prose-th:py-2 prose-td:border-border prose-td:px-3 prose-td:py-2 max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code className="bg-muted rounded px-1.5 py-0.5 text-sm" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match?.[1] ?? ''} value={String(children).replace(/\n$/, '')} />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
