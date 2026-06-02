import { getPatient } from '../../data';
import type { Appointment } from '../../types';
import { StatusPill } from '../shared';

export default function WaitingListTable({ appointments, onCall, onOpenRecord }: { appointments: Appointment[]; onCall: (appointment: Appointment) => void; onOpenRecord: (code: string) => void }) {
  const firstWaitingIndex = appointments.findIndex((appointment) => appointment.status === 'Đang chờ');

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="panel-title">Danh sách chờ khám</h3>
          <p className="panel-subtitle">Ca sáng, ưu tiên bệnh nhân có cảnh báo triage</p>
        </div>
        <button type="button" className="filter-button cursor-pointer active:scale-[0.98]">Cập nhật hàng đợi</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Khung giờ</th>
              <th className="px-4 py-3">Bệnh nhân</th>
              <th className="px-4 py-3">Tóm tắt triệu chứng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((row, index) => {
              const patient = getPatient(row.patientCode);
              const waiting = row.status === 'Đang chờ';
              const firstWaiting = waiting && index === firstWaitingIndex;
              return (
                <tr key={row.id} className={firstWaiting ? 'bg-sky-50/70' : 'bg-white'}>
                  <td className={`px-4 py-3 font-bold ${firstWaiting ? 'border-l-4 border-brand text-slate-900' : 'text-slate-500'}`}>{row.time}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{patient.name}</td>
                  <td className="max-w-md px-4 py-3 leading-5 text-slate-500">{row.summary}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {waiting ? (
                      <button
                        type="button"
                        onClick={() => onCall(row)}
                        className={`rounded-md px-3 py-1.5 text-xs transition active:scale-[0.98] ${
                          firstWaiting
                            ? 'bg-blue-500 font-medium text-white hover:bg-blue-600'
                            : 'border border-blue-500 bg-transparent font-bold text-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        Gọi vào khám
                      </button>
                    ) : (
                      <button type="button" onClick={() => onOpenRecord(patient.code)} className="rounded-md px-3 py-1.5 text-xs font-bold text-gray-500 transition hover:bg-gray-100 hover:text-blue-500 active:scale-[0.98]">
                        Xem hồ sơ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
