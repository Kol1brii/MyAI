import { useEffect, useState } from 'react';

const FRAMES = ['/', '—', '\\', '|'];

export function AsciiSpinner() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 130);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block w-4 text-center font-mono tabular-nums select-none"
      style={{ color: 'var(--color-accent)' }}
    >
      {FRAMES[frame]}
    </span>
  );
}
