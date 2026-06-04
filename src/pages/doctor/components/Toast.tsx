import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed right-4 top-4 z-[9999] flex min-w-64 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold shadow-xl"
      style={{ background: 'var(--color-success)', color: 'var(--color-on-success)', animation: 'toastSlideIn 0.35s ease-out' }}
      role="status"
      aria-live="polite"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
        <CheckCircle2 size={16} />
      </span>
      <span>{message}</span>
    </div>
  );
}
