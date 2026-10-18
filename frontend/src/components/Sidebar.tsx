import type { UIEvent } from 'react';
import { LogOut, Menu, MessageSquare, Plus, Trash2, X } from 'lucide-react';
import type { ChatSession } from '../types/chat';
import { cn } from '../utils/cn';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeChatId: string | null;
  hasMore: boolean;
  onNewChat: () => void;
  onSelect: (session: ChatSession) => void;
  onDelete: (sessionId: string) => void;
  onLoadMore: () => void;
  onLogout: () => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  sessions,
  activeChatId,
  hasMore,
  onNewChat,
  onSelect,
  onDelete,
  onLoadMore,
  onLogout,
}: Props) {
  const handleHistoryScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    // infinite scroll: load the next page through the `before` cursor
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) onLoadMore();
  };

  return (
    <aside
      className={cn(
        'relative z-50 flex flex-col bg-[var(--color-surface)] border-r border-[rgba(98,102,114,0.15)] transition-all duration-300 ease-in-out h-full',
        isOpen ? 'w-[240px]' : 'w-[68px]',
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Menu Toggle & New Chat Row */}
        <div className="flex flex-col gap-4 p-3.5 border-b border-[rgba(98,102,114,0.1)]">
          <button
            onClick={onToggle}
            className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-[rgba(98,102,114,0.1)] transition-colors shrink-0"
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? (
              <X size={20} className="animate-in fade-in spin-in-90 duration-300" />
            ) : (
              <Menu size={20} className="animate-in fade-in spin-in-negative-90 duration-300" />
            )}
          </button>

          <button
            onClick={onNewChat}
            className={cn(
              'flex items-center justify-center gap-2 h-10 rounded-xl border border-[rgba(98,102,114,0.2)] hover:bg-[rgba(38,203,124,0.05)] hover:border-[var(--color-accent)] transition-all overflow-hidden shrink-0',
              isOpen ? 'px-4 w-full' : 'w-10',
            )}
            title="New Chat"
          >
            <Plus size={18} className="shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* History Area */}
        <div
          className="flex-1 overflow-y-auto p-3.5 custom-scrollbar"
          onScroll={handleHistoryScroll}
        >
          {isOpen && (
            <>
              <p className="text-[10px] font-bold text-[var(--color-subtle)] uppercase tracking-[0.1em] mb-4">
                History
              </p>

              {sessions.length === 0 ? (
                <div className="text-sm text-[var(--color-subtle)] italic px-1">
                  No chat history yet
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sessions.map((session) => {
                    const isActive = session.id === activeChatId;
                    return (
                      <div
                        key={session.id}
                        className={cn(
                          'group/item flex items-center gap-1 rounded-xl transition-colors',
                          isActive
                            ? 'bg-[rgba(38,203,124,0.08)]'
                            : 'hover:bg-[rgba(98,102,114,0.08)]',
                        )}
                      >
                        <button
                          onClick={() => onSelect(session)}
                          className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left"
                          title={session.title}
                        >
                          <MessageSquare
                            size={14}
                            className={cn(
                              'shrink-0',
                              isActive
                                ? 'text-[var(--color-accent)]'
                                : 'text-[var(--color-subtle)]',
                            )}
                          />
                          <span className="flex min-w-0 flex-col">
                            <span
                              className={cn(
                                'truncate text-sm',
                                isActive
                                  ? 'text-[var(--color-accent)]'
                                  : 'text-[var(--color-text)]',
                              )}
                            >
                              {session.title}
                            </span>
                            <span className="truncate text-[10px] text-[var(--color-subtle)]">
                              {session.model_name}
                            </span>
                          </span>
                        </button>

                        <button
                          onClick={() => onDelete(session.id)}
                          className="mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-subtle)] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover/item:opacity-100"
                          title="Delete chat"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}

                  {hasMore && (
                    <button
                      onClick={onLoadMore}
                      className="mt-2 w-full rounded-xl border border-[rgba(98,102,114,0.2)] py-2 text-xs text-[var(--color-subtle)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      Load more
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Logout Button in Sidebar Footer */}
        <div className="p-3.5 border-t border-[rgba(98,102,114,0.1)]">
          <button
            onClick={onLogout}
            className={cn(
              'flex items-center justify-center gap-2 h-10 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-[var(--color-subtle)] transition-all overflow-hidden shrink-0 w-full',
              isOpen ? 'px-4' : 'px-0',
            )}
            title="Выйти"
          >
            <LogOut size={18} className="shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap animate-in fade-in duration-300">
                Выйти
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
