import type { Appointment } from '../types';
import { getPatient } from '../data';
import { SearchInput, GhostBlueButton, StatusPill } from '../components/shared';

export default function AppointmentsView({ appointments, onCall, onOpenExam, onOpenRecord }: { appointments: Appointment[]; onCall: (appointment: Appointment) => void; onOpenExam: (appointment: Appointment) => void; onOpenRecord: (code: string) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Lịch khám hôm nay (10/05/2026)</h2>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <SearchInput placeholder="Tìm kiếm nhanh theo tên BN..." />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Giờ khám</th>
                <th className="px-4 py-3">Bệnh nhân</th>
                <th className="px-4 py-3">Tóm tắt triệu chứng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appointment) => {
                const patient = getPatient(appointment.patientCode);
                const active = appointment.status === 'Đang chờ' || appointment.status === 'Đang khám';
                return (
                  <tr key={appointment.id} className={active ? 'bg-sky-50/60' : 'bg-white'}>
                    <td className={`px-4 py-3 font-bold ${active ? 'border-l-4 border-brand text-slate-900' : 'text-slate-500'}`}>{appointment.time}</td>
                    <td className="px-4 py-3">
                      <b className="block text-slate-800">{patient.name}</b>
                      <span className="text-xs text-slate-500">{patient.gender} | {patient.age} tuổi</span>
                    </td>
                    <td className="px-4 py-3"><div className="rounded-md bg-sky-50 px-3 py-2 text-xs text-slate-600"><b className="block text-slate-700">{appointment.summary}</b>{appointment.note}</div></td>
                    <td className="px-4 py-3"><StatusPill status={appointment.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {appointment.status === 'Đang chờ' ? <GhostBlueButton onClick={() => onCall(appointment)}>Gọi khám</GhostBlueButton> : appointment.status === 'Đang khám' ? (
                        <button type="button" onClick={() => onOpenExam(appointment)} className="cursor-pointer rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#1f7fb9] active:scale-[0.98]">Vào khám</button>
                      ) : (
                        <button type="button" onClick={() => onOpenRecord(patient.code)} className="cursor-pointer rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-brand hover:text-brand active:scale-[0.98]">Xem hồ sơ</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
