import { useState } from 'react';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types/chat';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeLabel = message.timestamp.toLocaleTimeString('ru-RU', {
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
            {isUser ? 'Вы' : 'MyAI'}
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
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed break-words">{children}</p>
                  ),
                  code: ({ children, className }) => {
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
                  pre: ({ children }) => (
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
                  a: ({ children, href }) => (
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
                  strong: ({ children }) => (
                    <strong style={{ color: 'var(--color-heading)', fontWeight: 600 }}>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ color: 'var(--color-icon)' }}>{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="pl-5 space-y-1 my-2 list-disc">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="pl-5 space-y-1 my-2 list-decimal">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed" style={{ color: 'var(--color-text)' }}>
                      {children}
                    </li>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg font-semibold mb-2 mt-3" style={{ color: 'var(--color-heading)' }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mb-2 mt-3" style={{ color: 'var(--color-heading)' }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1 mt-2" style={{ color: 'var(--color-heading)' }}>
                      {children}
                    </h3>
                  ),
                  blockquote: ({ children }) => (
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
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button — appears on hover */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100"
          style={{ color: 'var(--color-subtle)' }}
          title="Скопировать"
        >
          {copied ? (
            <>
              <Check size={12} style={{ color: 'var(--color-accent)' }} />
              <span style={{ color: 'var(--color-accent)' }}>Скопировано</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Копировать</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
