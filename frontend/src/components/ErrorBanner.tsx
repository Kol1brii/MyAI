import { RotateCcw } from 'lucide-react';

interface Props {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-500">
          !
        </div>
        <p className="text-sm font-medium text-red-400">{message}</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-500 text-xs font-semibold hover:bg-red-500/30 transition-colors"
      >
        <RotateCcw size={12} />
        Retry
      </button>
    </div>
  );
}
