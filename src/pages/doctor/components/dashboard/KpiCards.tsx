import { CalendarCheck, Clock3, TrendingUp, UserPlus } from 'lucide-react';

export default function KpiCards({
  totalCount,
  waitingCount,
  newThisWeek,
}: {
  totalCount: number;
  waitingCount: number;
  newThisWeek: number;
}) {
  const cards = [
    {
      label: 'Ca khám hôm nay',
      hint: 'Lịch trong ngày',
      value: totalCount,
      meta: 'Hôm nay',
      trend: '+2 ca',
      progress: 75,
      goalLabel: 'Mục tiêu 8 ca',
      footnote: '3 ca ưu tiên trong buổi sáng',
      sparkline: [2, 3, 3, 4, 5, 5, 6],
      icon: CalendarCheck,
      tint: 'bg-sky-100 text-sky-600',
      accent: 'from-sky-500/14 to-cyan-400/5',
    },
    {
      label: 'Bệnh nhân mới tuần này',
      hint: 'Lần đầu đến khám',
      value: newThisWeek,
      meta: 'Tuần này',
      trend: '+1 BN',
      progress: 57,
      goalLabel: 'Mục tiêu 7 BN',
      footnote: 'Tăng nhẹ so với tuần trước',
      sparkline: [1, 2, 2, 3, 3, 4, 4],
      icon: UserPlus,
      tint: 'bg-emerald-100 text-emerald-600',
      accent: 'from-emerald-500/14 to-teal-400/5',
    },
    {
      label: 'Đang chờ khám',
      hint: 'Cần xử lý tiếp theo',
      value: waitingCount,
      meta: 'Hiện tại',
      trend: 'Cần xử lý',
      progress: 62,
      goalLabel: 'Ngưỡng 8 ca chờ',
      footnote: '2 ca có cảnh báo ưu tiên',
      sparkline: [6, 5, 5, 4, 5, 4, 5],
      icon: Clock3,
      tint: 'bg-amber-100 text-amber-600',
      accent: 'from-amber-400/18 to-orange-300/5',
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-3">
      {cards.map((c) => {
        const max = Math.max(...c.sparkline);
        const min = Math.min(...c.sparkline);
        const points = c.sparkline
          .map((item, index) => {
            const x = 8 + index * 14;
            const y = 34 - ((item - min) / Math.max(max - min, 1)) * 24;
            return `${x},${y}`;
          })
          .join(' ');

        return (
          <article key={c.label} className={`relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br ${c.accent} bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
            <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/50" />
            <div className="relative flex items-start justify-between gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-4 ring-white/55 ${c.tint}`}>
                <c.icon size={21} />
              </div>
              <span className="rounded-full bg-white/85 px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">{c.meta}</span>
            </div>
            <div className="relative mt-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-600">{c.label}</p>
                <p className="text-xs font-medium text-slate-400">{c.hint}</p>
                <div className="mt-2 flex items-end gap-2">
                  <strong className="text-3xl font-bold leading-none text-slate-900">{c.value}</strong>
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-xs font-bold text-emerald-600 shadow-sm">
                    <TrendingUp size={12} />
                    {c.trend}
                  </span>
                </div>
              </div>
              <svg viewBox="0 0 96 40" className="h-10 w-24 shrink-0 text-brand" aria-hidden="true">
                <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="relative mt-4 rounded-md border border-white/70 bg-white/65 p-2.5">
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
                <span>{c.goalLabel}</span>
                <span>{c.progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full rounded-full bg-brand" style={{ width: `${c.progress}%` }} />
              </div>
              <p className="mt-2 truncate text-xs font-medium text-slate-400">{c.footnote}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
