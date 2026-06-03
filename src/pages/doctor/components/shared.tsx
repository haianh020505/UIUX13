import type { AppointmentStatus } from '../types';

export function SearchInput({
  placeholder,
  onClick,
  value,
  onChange,
  className = '',
}: {
  placeholder: string;
  onClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`relative block w-full max-w-md cursor-text ${className}`}>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={onClick}
        className="form-input bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}

export function StatusPill({ status }: { status: AppointmentStatus }) {
  const styles = {
    'Đã khám': 'status-pill--done',
    'Đang chờ': 'status-pill--waiting',
    'Đang khám': 'status-pill--examining',
  };

  return (
    <span className={`status-pill ${styles[status]}`}>
      {status}
    </span>
  );
}

export function GhostBlueButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-md border border-brand bg-transparent px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-sky-50 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

export function SolidButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#1f7fb9] active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}
