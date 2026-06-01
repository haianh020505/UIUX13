import type { ElementType } from 'react';
import { TrendingUp } from 'lucide-react';

export default function MetricCard({
  icon: Icon,
  tint,
  accent,
  label,
  hint,
  value,
  suffix,
  trend,
  progress,
  sparkline,
}: {
  icon: ElementType;
  tint: string;
  accent: string;
  label: string;
  hint: string;
  value: string;
  suffix?: string;
  trend: string;
  progress: number;
  sparkline: number[];
}) {
  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);
  const points = sparkline
    .map((item, index) => {
      const x = 8 + index * 14;
      const y = 34 - ((item - min) / Math.max(max - min, 1)) * 24;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <article className={`relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br ${accent} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/50" />
      <div className="relative flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-8 ring-white/55 ${tint}`}>
          <Icon size={23} />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-extrabold text-emerald-600 shadow-sm">
          <TrendingUp size={13} />
          {trend}
        </span>
      </div>
      <div className="relative mt-5">
        <p className="font-extrabold text-slate-700">{label}</p>
        <p className="text-sm text-slate-400">{hint}</p>
        <div className="mt-2 flex items-end gap-2">
          <strong className="text-3xl font-extrabold leading-none text-slate-900">{value}</strong>
          {suffix ? <span className="pb-1 text-sm font-extrabold text-slate-700">{suffix}</span> : null}
        </div>
      </div>
      <div className="relative mt-5 flex items-end gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-white/70">
            <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-slate-400">So với mục tiêu ngày: {progress}%</p>
        </div>
        <svg viewBox="0 0 96 40" className="h-10 w-24 shrink-0" aria-hidden="true">
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand" />
        </svg>
      </div>
    </article>
  );
}
