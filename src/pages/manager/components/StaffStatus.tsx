import type { ElementType } from 'react';

export default function StaffStatus({ icon: Icon, label, value, tone }: { icon: ElementType; label: string; value: string; tone: 'sky' | 'emerald' | 'rose' }) {
  const tones = {
    sky: 'border-sky-100 bg-sky-50 text-sky-600',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    rose: 'border-rose-200 bg-rose-50 text-rose-600',
  };

  return (
    <div className={`flex items-center justify-between rounded-md border px-3 py-2.5 ${tones[tone]}`}>
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <Icon size={17} />
        {label}
      </span>
      <b className="text-base font-bold">{value}</b>
    </div>
  );
}
