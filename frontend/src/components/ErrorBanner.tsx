import { AlertCircle, X } from 'lucide-react';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm mx-auto max-w-2xl"
      style={{
        background: 'rgba(255, 80, 80, 0.08)',
        border: '1px solid rgba(255, 80, 80, 0.25)',
        color: 'rgb(255, 130, 110)',
        animation: 'msgIn 0.2s ease-out both',
      }}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
