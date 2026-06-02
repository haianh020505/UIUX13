import { CheckCircle2, Clock3 } from 'lucide-react';
import { getPatient, labResults } from '../../data';
import { StatusPill } from '../shared';

export default function RecentLabResults() {
  return (
    <article className="h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="panel-title">Kết quả cận lâm sàng mới</h3>
          <p className="panel-subtitle">Các kết quả cần bác sĩ xem</p>
        </div>
        <button type="button" className="cursor-pointer text-xs font-bold text-brand transition hover:text-[#1f7fb9] active:scale-95">Xem tất cả</button>
      </div>
      <div className="space-y-3">
        {labResults.map((item) => {
          const patient = getPatient(item.patientCode);
          const pending = item.status === 'Đang chờ KQ';
          return (
            <article
              key={`${item.patientCode}-${item.title}`}
              className="flex w-full items-start gap-3 rounded-md p-1 text-left"
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${pending ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {pending ? <Clock3 size={15} /> : <CheckCircle2 size={15} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-800">{patient.name} <span className="text-slate-500">({patient.code})</span></span>
                <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{item.title}: {item.description}</span>
              </span>
              {pending ? <StatusPill status="Đang chờ KQ" /> : <span className={`rounded px-2 py-0.5 text-xs font-bold ${item.status === 'Mới' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>}
            </article>
          );
        })}
      </div>
    </article>
  );
}
