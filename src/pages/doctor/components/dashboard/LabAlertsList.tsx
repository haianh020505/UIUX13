import { AlertTriangle, MessageCircle } from 'lucide-react';
import { consultationRequests, getPatient } from '../../data';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function LabAlertsList({ onOpenConsultationCase }: { onOpenConsultationCase: (patientCode: string) => void }) {
  const urgentRequests = consultationRequests.filter((item) => item.urgency === 'Khẩn cấp');

  return (
    <section className="panel flex min-h-0 flex-col p-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4">
        <div className="min-w-0">
          <h3 className="panel-title">Ca tư vấn khẩn cấp từ AI</h3>
          <p className="panel-subtitle">Các cuộc tư vấn trực tiếp được AI gắn nhãn cần xử lý ngay</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle size={20} />
        </span>
      </div>
      <div className="max-h-[360px] space-y-2 overflow-y-auto p-4">
        {urgentRequests.map((item) => {
          const patient = getPatient(item.patientCode);

          return (
            <button
              key={`${item.patientCode}-${item.title}`}
              type="button"
              onClick={() => onOpenConsultationCase(item.patientCode)}
              className="w-full cursor-pointer rounded-lg border border-rose-100 bg-rose-50/60 p-3 text-left shadow-sm transition hover:border-rose-200 hover:bg-white hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-rose-600 shadow-sm" aria-hidden="true">
                    {getInitials(patient.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold text-slate-800">{patient.name}</span>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                      <AlertTriangle size={12} />
                      Khẩn cấp
                    </span>
                  </span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-400">{item.timeLabel}</span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <MessageCircle size={15} className="shrink-0 text-brand" />
                {item.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.summary}</p>
            </button>
          );
        })}
        {!urgentRequests.length ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <p className="text-sm font-bold text-slate-500">Không có ca tư vấn khẩn cấp</p>
            <p className="mt-1 text-xs text-slate-400">AI chưa gắn nhãn khẩn cấp cho ca tư vấn nào.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
