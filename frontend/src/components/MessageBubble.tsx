import { useState } from 'react';
import { Copy, Check, Sparkles, User, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types/chat';

interface Props {
  message: Message;
}

const markdownComponents: any = {
  p: ({ children }: any) => (
    <p className="mb-3 last:mb-0 leading-relaxed break-words">{children}</p>
  ),
  code: ({ children, className }: any) => {
    const isBlock = className?.includes('language-');
    return isBlock ? (
      <code className="block">{children}</code>
    ) : (
      <code
        className="px-1.5 py-0.5 rounded text-xs font-mono"
        style={{
          background: 'rgba(20, 21, 26, 0.8)',
          color: 'var(--color-accent)',
          border: '1px solid rgba(38, 203, 124, 0.2)',
        }}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => (
    <pre
      className="overflow-x-auto rounded-xl p-4 my-3 text-xs font-mono"
      style={{
        background: 'rgb(20, 21, 26)',
        border: '1px solid rgba(98, 102, 114, 0.25)',
        color: 'var(--color-text)',
      }}
    >
      {children}
    </pre>
  ),
  a: ({ children, href }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2 transition-opacity hover:opacity-80"
      style={{ color: 'var(--color-accent)' }}
    >
      {children}
    </a>
  ),
  strong: ({ children }: any) => (
    <strong style={{ color: 'var(--color-heading)', fontWeight: 600 }}>
      {children}
    </strong>
  ),
  em: ({ children }: any) => (
    <em style={{ color: 'var(--color-icon)' }}>{children}</em>
  ),
  ul: ({ children }: any) => (
    <ul className="pl-5 space-y-1 my-2 list-disc">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="pl-5 space-y-1 my-2 list-decimal">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="leading-relaxed" style={{ color: 'var(--color-text)' }}>
      {children}
    </li>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-lg font-semibold mb-2 mt-3" style={{ color: 'var(--color-heading)' }}>
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-semibold mb-2 mt-3" style={{ color: 'var(--color-heading)' }}>
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-semibold mb-1 mt-2" style={{ color: 'var(--color-heading)' }}>
      {children}
    </h3>
  ),
  blockquote: ({ children }: any) => (
    <blockquote
      className="border-l-2 pl-4 my-2 italic"
      style={{
        borderColor: 'var(--color-accent)',
        color: 'var(--color-subtle)',
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-3" style={{ borderColor: 'rgba(98, 102, 114, 0.3)' }} />
  ),
};

function ThoughtBlock({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 rounded-xl border border-[rgba(98, 102, 114, 0.2)] bg-[rgba(20,21,26,0.4)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-[var(--color-subtle)] hover:text-[var(--color-text)] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles size={12} className="text-[var(--color-accent)] opacity-70" />
          Thinking...
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-xs leading-relaxed text-[var(--color-text)] opacity-80 border-t border-[rgba(98,102,114,0.1)] pt-2 italic whitespace-pre-wrap">
          {content.trim()}
        </div>
      )}
    </div>
  );
}

export function MessageBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeLabel = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'msgIn 0.25s ease-out both' }}
    >
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1"
        style={
          isUser
            ? {
                background: 'rgba(38, 203, 124, 0.12)',
                color: 'var(--color-accent)',
                outline: '1px solid rgba(38, 203, 124, 0.2)',
              }
            : {
                background: 'var(--color-surface)',
                color: 'var(--color-icon)',
                outline: '1px solid rgba(98, 102, 114, 0.15)',
              }
        }
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Label row */}
        <div
          className="flex items-center gap-2 px-1"
          style={{ color: 'var(--color-subtle)' }}
        >
          <span className="text-xs font-medium">
            {isUser ? 'You' : 'MyAI'}
          </span>
          <span className="text-xs opacity-60">{timeLabel}</span>
        </div>

        {/* Bubble */}
        <div
          className={`relative px-4 py-3 text-sm leading-relaxed ${
            isUser ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'
          }`}
          style={
            isUser
              ? {
                  background: 'var(--color-surface)',
                  color: 'var(--color-heading)',
                  border: '1px solid rgba(98, 102, 114, 0.2)',
                }
              : {
                  background: 'rgba(29, 31, 39, 0.6)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(98, 102, 114, 0.15)',
                }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="prose-ai">
              {(() => {
                const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
                const parts = [];
                let lastIndex = 0;
                let match;

                while ((match = thinkRegex.exec(message.content)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(message.content.substring(lastIndex, match.index));
                  }
                  parts.push({ type: 'think', content: match[1] });
                  lastIndex = thinkRegex.lastIndex;
                }

                if (lastIndex < message.content.length) {
                  parts.push(message.content.substring(lastIndex));
                }

                if (parts.length === 0) {
                  return (
                    <ReactMarkdown components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  );
                }

                return parts.map((part, i) => {
                  if (typeof part === 'string') {
                    return (
                      <ReactMarkdown key={i} components={markdownComponents}>
                        {part}
                      </ReactMarkdown>
                    );
                  } else {
                    return <ThoughtBlock key={i} content={part.content} />;
                  }
                });
              })()}
            </div>
          )}
        </div>

        {/* Copy button — appears on hover */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--color-subtle)' }}
          title="Copy"
        >
          {copied ? (
            <>
              <Check size={12} style={{ color: 'var(--color-accent)' }} />
              <span style={{ color: 'var(--color-accent)' }}>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
