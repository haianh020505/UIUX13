import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export default function ConfirmDialog({
  title,
  message,
  cancelText = 'Hủy bỏ',
  confirmText = 'Xác nhận',
  tone = 'primary',
  iconless = false,
  showCloseButton = true,
  children,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  tone?: 'primary' | 'danger' | 'warning';
  iconless?: boolean;
  showCloseButton?: boolean;
  children?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const toneStyles = {
    primary: {
      iconBackground: 'var(--color-primary-light)',
      iconColor: 'var(--color-primary)',
      confirmBackground: 'var(--color-primary)',
      confirmColor: 'var(--color-on-primary)',
    },
    danger: {
      iconBackground: 'var(--color-danger-light)',
      iconColor: 'var(--color-danger)',
      confirmBackground: 'var(--color-danger)',
      confirmColor: 'var(--color-on-danger)',
    },
    warning: {
      iconBackground: 'var(--color-warning-light)',
      iconColor: 'var(--color-warning)',
      confirmBackground: 'var(--color-warning)',
      confirmColor: 'var(--color-on-warning)',
    },
  }[tone];

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="presentation"
      style={{ background: 'color-mix(in srgb, var(--color-text-primary) 40%, transparent)' }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        style={{ background: 'var(--color-bg-surface)' }}
      >
        <div className="flex items-start justify-between gap-4 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex gap-3">
            {!iconless ? (
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: toneStyles.iconBackground, color: toneStyles.iconColor }}
              >
                <AlertTriangle size={18} />
              </span>
            ) : null}
            <div>
              <h2 id="confirm-dialog-title" className="text-base font-extrabold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
              <p id="confirm-dialog-desc" className="mt-1 text-sm font-medium leading-6" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
            </div>
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-9 w-9 items-center justify-center rounded-md border transition"
              aria-label="Đóng"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-surface)',
                color: 'var(--color-secondary)',
              }}
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
        {children ? <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>{children}</div> : null}
        <div className="flex justify-end gap-3 px-4 py-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-4"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-surface)',
              color: 'var(--color-secondary)',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold shadow-sm transition focus:outline-none focus:ring-4"
            style={{
              background: toneStyles.confirmBackground,
              color: toneStyles.confirmColor,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
