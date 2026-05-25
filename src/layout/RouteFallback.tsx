/** Shown while a lazy route chunk loads. */
import { Loader2 } from 'lucide-react';

export const RouteFallback = () => (
  <div
    className="flex flex-col items-center justify-center gap-4 min-h-[280px] font-mono text-sm text-on-surface-variant"
    role="status"
    aria-live="polite"
  >
    <Loader2 className="animate-spin text-primary-fixed" size={28} aria-hidden />
    <p>Loading module…</p>
  </div>
);
