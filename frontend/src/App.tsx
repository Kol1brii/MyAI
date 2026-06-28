import { useEffect, useRef } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

import { useChat } from './hooks/useChat';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { SuggestionChips } from './components/SuggestionChips';
import { ErrorBanner } from './components/ErrorBanner';

export default function App() {
  const { messages, isLoading, error, sendMessage, reset } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitial = messages.length === 0 && !isLoading;

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  // Auto-scroll on new message / typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ background: 'var(--color-canvas)' }}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 h-14 shrink-0 z-20"
        style={{
          background: 'rgba(20, 21, 26, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${isInitial ? 'transparent' : 'rgba(98, 102, 114, 0.15)'}`,
          transition: 'border-color 0.4s ease',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: 'rgba(38, 203, 124, 0.15)',
              color: 'var(--color-accent)',
            }}
          >
            <Sparkles size={15} />
          </div>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: 'var(--color-heading)', letterSpacing: '-0.02em' }}
          >
            MyAI
          </span>
        </div>

        {/* New chat button — only when chatting */}
        {!isInitial && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.03] active:scale-95"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-icon)',
              border: '1px solid rgba(98, 102, 114, 0.2)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-heading)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(98, 102, 114, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-icon)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(98, 102, 114, 0.2)';
            }}
          >
            <RotateCcw size={12} />
            Новый чат
          </button>
        )}
      </header>

      {/* ── Messages area ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {isInitial ? (
          /* Landing screen */
          <div
            className="flex h-full flex-col items-center justify-center px-4 pb-8"
            style={{ animation: 'landingIn 0.5s ease-out both' }}
          >
            {/* Glow orb behind logo */}
            <div className="relative mb-6">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ background: 'var(--color-accent)', transform: 'scale(2.5)' }}
              />
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(38, 203, 124, 0.12)',
                  border: '1px solid rgba(38, 203, 124, 0.25)',
                  color: 'var(--color-accent)',
                }}
              >
                <Sparkles size={28} />
              </div>
            </div>

            <h1
              className="text-4xl font-semibold mb-2"
              style={{ color: 'var(--color-heading)', letterSpacing: '-0.03em' }}
            >
              MyAI
            </h1>
            <p
              className="text-base mb-10"
              style={{ color: 'var(--color-subtle)' }}
            >
              Чем я могу помочь сегодня?
            </p>

            {/* Input */}
            <div className="w-full max-w-2xl">
              <ChatInput
                onSubmit={sendMessage}
                isLoading={isLoading}
                placeholder="Спросите что угодно..."
              />
              <SuggestionChips onSelect={handleSuggestion} />
            </div>
          </div>
        ) : (
          /* Chat log */
          <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-4 flex flex-col gap-7">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && <TypingIndicator />}

            {error && (
              <ErrorBanner message={error} onDismiss={() => { /* handled by useChat reset */ }} />
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* ── Sticky bottom input (chat mode) ─────────────────── */}
      {!isInitial && (
        <div
          className="shrink-0 w-full px-4 pb-5 pt-3"
          style={{
            background: `linear-gradient(to top, var(--color-canvas) 60%, transparent)`,
          }}
        >
          <div className="mx-auto max-w-3xl">
            <ChatInput onSubmit={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
