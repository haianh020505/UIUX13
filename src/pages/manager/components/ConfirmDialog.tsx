import { AlertTriangle, X } from 'lucide-react';
import type { ReactNode } from 'react';

export default function ConfirmDialog({
  title,
  message,
  confirmText = 'Xác nhận',
  tone = 'primary',
  children,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmText?: string;
  tone?: 'primary' | 'danger';
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="flex gap-3">
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-brand'}`}>
              <AlertTriangle size={18} />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">{title}</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{message}</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="icon-button" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        {children ? <div className="border-b border-slate-100 px-4 py-3">{children}</div> : null}
        <div className="flex justify-end gap-3 px-4 py-3">
          <button type="button" onClick={onCancel} className="ghost-action">
            Hủy
          </button>
          <button type="button" onClick={onConfirm} className={`secondary-action ${tone === 'danger' ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-200' : ''}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
