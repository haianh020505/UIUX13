import { CalendarClock, CheckCircle2, UsersRound } from 'lucide-react';

const metrics = [
  { label: 'Tổng lịch khám hôm nay', value: '18', hint: '+2 ca so với hôm qua', icon: UsersRound, tone: 'bg-sky-50 text-brand' },
  { label: 'Bệnh nhân đang chờ', value: '5', hint: 'Dự kiến trễ: 10 phút', icon: CalendarClock, tone: 'bg-amber-50 text-amber-600' },
  { label: 'Đã khám xong', value: '8', hint: '44% ca trong buổi sáng', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
];

export default function KpiCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.label}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-slate-400">{item.label}</p>
                <p className="mt-1 pl-0.5 text-2xl font-bold leading-none text-slate-900">{item.value}</p>
                <p className="mt-1.5 text-xs font-medium text-slate-400">{item.hint}</p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
