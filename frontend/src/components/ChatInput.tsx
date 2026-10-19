import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { ArrowUp, Check, ChevronDown, Search } from 'lucide-react';
import type { AIModel } from '../types/chat';
import { modelIcon } from '../constants/modelIcons';
import { cn } from '../utils/cn';

interface Props {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  models: AIModel[];
  selectedModel: AIModel | null;
  onSelectModel: (model: AIModel) => void;
}

const MAX_CHARS = 100_000;

export function ChatInput({
  onSubmit,
  isLoading,
  placeholder = 'Ask MyAI anything...',
  models,
  selectedModel,
  onSelectModel,
}: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsModelMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLoading) setIsModelMenuOpen(false);
  }, [isLoading]);

  const filteredModels = useMemo(
    () =>
      models.filter(
        (m) =>
          m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
          m.provider.toLowerCase().includes(modelSearch.toLowerCase()),
      ),
    [models, modelSearch],
  );

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setValue(val);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    // guard against double submissions while a request is pending
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        {/* ── Model picker ───────────────────────────────────── */}
        <div ref={pickerRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsModelMenuOpen((open) => !open)}
            disabled={isLoading}
            className={cn(
              'flex h-11 items-center gap-1.5 rounded-xl border border-transparent px-2.5 transition-all',
              isLoading
                ? 'cursor-not-allowed opacity-50'
                : 'hover:border-[rgba(98,102,114,0.3)] hover:bg-[rgba(98,102,114,0.05)]',
            )}
            title="Select model"
          >
            <img
              src={modelIcon(selectedModel?.icon_key)}
              className="h-4 w-4 object-contain opacity-90"
              alt=""
            />
            <span className="max-w-[110px] truncate text-xs font-medium text-[var(--color-heading)]">
              {selectedModel?.name || 'Select Model'}
            </span>
            <ChevronDown
              size={12}
              className={cn('transition-transform duration-200', isModelMenuOpen && 'rotate-180')}
            />
          </button>

          {isModelMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-72 overflow-hidden rounded-2xl border border-[rgba(98,102,114,0.2)] bg-[var(--color-surface)] shadow-2xl animate-dropdown-in">
              <div className="border-b border-[rgba(98,102,114,0.1)] p-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)]"
                  />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(98,102,114,0.2)] bg-[rgba(20,21,26,0.5)] py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto py-2 custom-scrollbar">
                {filteredModels.map((model) => {
                  const isSelected = selectedModel?.id === model.id;
                  return (
                    <button
                      type="button"
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model);
                        setIsModelMenuOpen(false);
                        setModelSearch('');
                      }}
                      className={cn(
                        'flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-[rgba(38,203,124,0.08)]',
                        isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={modelIcon(model.icon_key)}
                          className="h-5 w-5 object-contain opacity-80"
                          alt=""
                        />
                        <span className="text-sm font-medium">{model.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-[var(--color-accent)]" />}
                    </button>
                  );
                })}
                {filteredModels.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-[var(--color-subtle)]">
                    No models found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isLoading}
          placeholder={placeholder}
          rows={1}
          className="min-h-[44px] max-h-40 w-full resize-none bg-transparent px-3 py-3 text-sm outline-none leading-relaxed disabled:cursor-not-allowed disabled:opacity-60"
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
          <ArrowUp size={16} />
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
    </form>
  );
}
