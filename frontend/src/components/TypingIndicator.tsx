import { Sparkles } from 'lucide-react';
import { AsciiSpinner } from './AsciiSpinner';

export function TypingIndicator() {
  return (
    <div
      className="flex w-full gap-3 flex-row"
      style={{ animation: 'msgIn 0.2s ease-out both' }}
    >
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-1"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-icon)',
          outline: '1px solid rgba(98, 102, 114, 0.15)',
        }}
      >
        <Sparkles size={14} />
      </div>

      {/* Indicator */}
      <div className="flex flex-col gap-1 items-start">
        <span
          className="text-xs font-medium px-1"
          style={{ color: 'var(--color-subtle)' }}
        >
          MyAI
        </span>
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
          style={{
            background: 'rgba(29, 31, 39, 0.6)',
            border: '1px solid rgba(98, 102, 114, 0.15)',
            color: 'var(--color-subtle)',
          }}
        >
          <AsciiSpinner />
          <span>Ожидание ответа от сервера...</span>
        </div>
      </div>
    </div>
  );
}
