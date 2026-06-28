import { SUGGESTIONS } from '../constants/suggestions';

interface Props {
  onSelect: (text: string) => void;
}

export function SuggestionChips({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-6">
      {SUGGESTIONS.map((s) => (
        <button
          key={s.text}
          onClick={() => onSelect(s.text)}
          className="group flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(98, 102, 114, 0.2)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(38, 203, 124, 0.35)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(38, 203, 124, 0.05)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(98, 102, 114, 0.2)';
            (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
          }}
        >
          <span className="text-base leading-none mt-0.5">{s.emoji}</span>
          <span className="leading-snug" style={{ color: 'var(--color-text)' }}>
            {s.text}
          </span>
        </button>
      ))}
    </div>
  );
}
