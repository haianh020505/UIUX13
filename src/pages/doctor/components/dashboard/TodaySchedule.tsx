import { ChevronRight } from 'lucide-react';
import { getPatient } from '../../data';
import type { Appointment } from '../../types';
import { GhostBlueButton, StatusPill } from '../shared';

export default function TodaySchedule({
  appointments,
  activePatientId,
  onOpenAppointments,
  onCallPatient,
  onOpenRecord,
  onOpenActiveExam,
}: {
  appointments: Appointment[];
  activePatientId: string | null;
  onOpenAppointments: () => void;
  onCallPatient: (appointment: Appointment) => void;
  onOpenRecord: (code: string) => void;
  onOpenActiveExam: () => void;
}) {
  const sorted = [...appointments]
    .filter((appointment) => appointment.status !== 'Đã khám')
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <section className="panel flex min-h-0 flex-col p-0">
      <div className="border-b border-slate-200 px-4 py-4">
        <h3 className="panel-title">Lịch khám hôm nay</h3>
        <p className="panel-subtitle">Danh sách ca khám trong ngày của bác sĩ</p>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        <table className="data-table min-w-full text-left text-sm">
          <colgroup>
            <col style={{ width: '112px' }} />
            <col style={{ width: '176px' }} />
            <col />
            <col style={{ width: '128px' }} />
            <col style={{ width: '128px' }} />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th>Giờ</th>
              <th>Bệnh nhân</th>
              <th>Tóm tắt</th>
              <th>Trạng thái</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((appointment) => {
              const patient = getPatient(appointment.patientCode);
              const isActive = appointment.id === activePatientId;

              return (
                <tr key={appointment.id} className={isActive ? 'bg-sky-50/70' : 'bg-white'}>
                  <td className={`px-4 py-3 font-bold ${isActive ? 'border-l-4 border-brand text-slate-900' : 'text-slate-600'}`}>{appointment.time}</td>
                  <td className="px-4 py-3">
                    <b className="block truncate text-slate-800">{patient.name}</b>
                    <span className="text-xs text-slate-500">{patient.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 text-xs font-medium leading-5 text-slate-500">{appointment.summary}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={appointment.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {appointment.status === 'Đang chờ' ? (
                      <GhostBlueButton onClick={() => onCallPatient(appointment)}>Gọi khám</GhostBlueButton>
                    ) : appointment.status === 'Đang khám' ? (
                      <button type="button" onClick={onOpenActiveExam} className="cursor-pointer rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#1f7fb9] active:scale-[0.98]">
                        Vào khám
                      </button>
                    ) : (
                      <button type="button" onClick={() => onOpenRecord(patient.code)} className="cursor-pointer rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-brand hover:text-brand active:scale-[0.98]">
                        Hồ sơ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-gray-50">
        <button
          type="button"
          onClick={onOpenAppointments}
          className="w-full cursor-pointer py-3 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
        >
          <span className="inline-flex items-center justify-center gap-1">Xem lịch khám chi tiết <ChevronRight size={14} /></span>
        </button>
      </div>
    </section>
  );
}
