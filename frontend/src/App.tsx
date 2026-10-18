import { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useChat } from './hooks/useChat';
import { verifySession } from './utils/api';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { ErrorBanner } from './components/ErrorBanner';
import { Sidebar } from './components/Sidebar';
import { AuthView } from './components/Auth/AuthView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Наличие токена в localStorage ещё не значит, что сессия жива:
    // после перезапуска backend токен может быть просрочен или отозван.
    const bootstrap = async () => {
      try {
        const session = await verifySession();
        if (!cancelled) setIsAuthenticated(session);
      } catch {
        // backend недоступен — не выкидываем на логин, ошибку покажет сам чат
        if (!cancelled) setIsAuthenticated(true);
      }
    };

    void bootstrap();

    const handleAuthSuccess = () => setIsAuthenticated(true);
    const handleUnauthorized = () => setIsAuthenticated(false);

    window.addEventListener('auth_success', handleAuthSuccess);
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      cancelled = true;
      window.removeEventListener('auth_success', handleAuthSuccess);
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return <div className="h-screen w-screen bg-[var(--color-canvas)]" />;
  }

  if (isAuthenticated === false) {
    return <AuthView />;
  }

  // Mounted only once authenticated so the history is loaded for the session.
  return <ChatApp onLogout={handleLogout} />;
}

function ChatApp({ onLogout }: { onLogout: () => void }) {
  const {
    messages,
    sessions,
    activeChatId,
    isLoading,
    isLoadingMessages,
    hasMoreSessions,
    hasMoreMessages,
    error,
    models,
    selectedModel,
    setSelectedModel,
    sendMessage,
    startNewChat,
    selectSession,
    removeSession,
    loadMoreSessions,
    loadMoreMessages,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── chat stream scroll handling ──────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const prependingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  const handleChatScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    // infinite scroll upwards: `before` — timestamp of the oldest rendered message
    if (el.scrollTop < 80 && hasMoreMessages && !isLoadingMessages) {
      prevScrollHeightRef.current = el.scrollHeight;
      prependingRef.current = true;
      loadMoreMessages();
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prependingRef.current) {
      // keep the viewport stable when older messages are prepended
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
      prependingRef.current = false;
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const activeChat = sessions.find((s) => s.id === activeChatId) ?? null;
  const isInitial = messages.length === 0 && !isLoading && !isLoadingMessages;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-text)]">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
        sessions={sessions}
        activeChatId={activeChatId}
        hasMore={hasMoreSessions}
        onNewChat={startNewChat}
        onSelect={selectSession}
        onDelete={removeSession}
        onLoadMore={loadMoreSessions}
        onLogout={onLogout}
      />

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* ── Header ────────────────────────────────────────── */}
        <header className="flex items-center h-14 px-4 shrink-0 z-30 bg-[rgba(20,21,26,0.8)] backdrop-blur-md border-b border-[rgba(98,102,114,0.15)]">
          <span className="ml-2 truncate text-sm font-semibold text-[var(--color-heading)]">
            {activeChat?.title || 'MyAI'}
          </span>
        </header>

        {/* ── Main Area ─────────────────────────────────────── */}
        <main
          ref={scrollRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto relative custom-scrollbar"
        >
          <div className="h-full flex flex-col">
            {isInitial ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-full blur-3xl bg-[var(--color-accent)] opacity-20 scale-150" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-[rgba(38,203,124,0.1)] border border-[rgba(38,203,124,0.2)] text-[var(--color-accent)]">
                    <Sparkles size={36} />
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-3 text-[var(--color-heading)] tracking-tight">
                  How can I help today?
                </h1>
                <div className="w-full max-w-2xl mt-8 px-4">
                  <ChatInput
                    onSubmit={sendMessage}
                    isLoading={isLoading}
                    placeholder="Ask anything..."
                    models={models}
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                  />
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl px-4 py-8 flex flex-col gap-8 pb-32">
                {hasMoreMessages && (
                  <div className="text-center text-xs text-[var(--color-subtle)]">
                    {isLoadingMessages
                      ? 'Загрузка истории...'
                      : 'Прокрутите вверх, чтобы загрузить ещё'}
                  </div>
                )}
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                {error && <ErrorBanner message={error} />}
              </div>
            )}
          </div>
        </main>

        {/* ── Bottom Input ──────────────────────────────────── */}
        {!isInitial && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--color-canvas)] via-[var(--color-canvas)] to-transparent pt-12 pointer-events-none">
            <div className="mx-auto max-w-3xl pointer-events-auto">
              <ChatInput
                onSubmit={sendMessage}
                isLoading={isLoading}
                placeholder="Ask anything..."
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
