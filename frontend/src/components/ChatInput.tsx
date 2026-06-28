import { useRef, useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const MAX_CHARS = 100_000;

export function ChatInput({ onSubmit, isLoading, placeholder = 'Спросите MyAI о чём угодно...' }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setValue(val);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isLoading;
  const charsLeft = MAX_CHARS - value.length;
  const showCounter = value.length > MAX_CHARS * 0.85;

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className="flex items-end gap-2 rounded-2xl p-2 transition-all duration-200"
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${focused ? 'rgba(38, 203, 124, 0.5)' : 'rgba(98, 102, 114, 0.25)'}`,
          boxShadow: focused
            ? '0 0 0 3px rgba(38, 203, 124, 0.08), 0 8px 32px rgba(0,0,0,0.35)'
            : '0 4px 24px rgba(0,0,0,0.25)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={1}
          className="min-h-[44px] max-h-40 w-full resize-none bg-transparent px-3 py-3 text-sm outline-none leading-relaxed"
          style={{
            color: 'var(--color-heading)',
          }}
        />

        <button
          type="submit"
          disabled={!canSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200"
          style={{
            background: canSend ? 'var(--color-accent)' : 'rgba(98, 102, 114, 0.2)',
            color: canSend ? 'rgb(20, 21, 26)' : 'var(--color-subtle)',
            cursor: canSend ? 'pointer' : 'default',
            transform: canSend ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          <Send size={16} style={{ transform: canSend ? 'translateX(1px)' : 'none' }} />
        </button>
      </div>

      {/* Counter */}
      {showCounter && (
        <div
          className="absolute -top-6 right-2 text-xs tabular-nums"
          style={{
            color: charsLeft < 1000 ? 'rgb(255, 120, 80)' : 'var(--color-subtle)',
          }}
        >
          {charsLeft.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>
      )}

      {/* Hint */}
      <p className="mt-2 text-center text-xs" style={{ color: 'var(--color-subtle)' }}>
        Enter — отправить&nbsp;&nbsp;·&nbsp;&nbsp;Shift + Enter — перенос строки
      </p>
    </form>
  );
}
