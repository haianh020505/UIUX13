import { Search } from 'lucide-react';
import type { AppointmentStatus } from '../types';

export function SearchInput({ placeholder, onClick }: { placeholder: string; onClick?: () => void }) {
  return (
    <label className="relative block w-full max-w-md cursor-text">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input onFocus={onClick} className="form-input bg-white pl-9" placeholder={placeholder} />
    </label>
  );
}

export function StatusPill({ status }: { status: AppointmentStatus }) {
  const styles = {
    'Đã khám': 'bg-slate-100 text-slate-500',
    'Đang chờ': 'bg-amber-100 text-amber-700',
    'Đang khám': 'bg-sky-100 text-brand',
    'Sắp đến': 'bg-emerald-100 text-emerald-700',
    'Đang chờ KQ': 'bg-amber-100 text-amber-700',
  };
  const icons = {
    'Đã khám': '✓',
    'Đang chờ': '⏳',
    'Đang khám': '',
    'Sắp đến': '',
    'Đang chờ KQ': '⌛',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[status]}`}>
      {icons[status] ? <span aria-hidden="true">{icons[status]}</span> : null}
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
