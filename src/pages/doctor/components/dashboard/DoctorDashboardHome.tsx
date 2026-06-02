import { useState } from 'react';
import { AlertTriangle, CalendarClock, Clock, ShieldAlert, UserRound, X } from 'lucide-react';
import { getPatient } from '../../data';
import type { Appointment, DoctorModule } from '../../types';
import KpiCards from './KpiCards';
import RecentLabResults from './RecentLabResults';
import WaitingListTable from './WaitingListTable';

export default function DoctorDashboardHome({
  appointments,
  onOpenModule,
  onOpenRecord,
  onStartExam,
}: {
  appointments: Appointment[];
  onOpenModule: (module: DoctorModule) => void;
  onOpenRecord: (code: string) => void;
  onStartExam: (appointment: Appointment) => void;
}) {
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const highRiskAppointment = appointments.find((appointment) => appointment.patientCode === 'PA-015') ?? appointments.find((appointment) => appointment.status === 'Đang chờ') ?? appointments[0];
  const highRiskPatient = highRiskAppointment ? getPatient(highRiskAppointment.patientCode) : null;
  const nextAppointment = appointments.find((appointment) => appointment.status === 'Đang chờ');

  const receiveHighRiskCase = () => {
    if (!highRiskAppointment) return;
    setShowHighRiskModal(false);
    onStartExam(highRiskAppointment);
  };

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[13px] text-[#6B7280]">Chào buổi sáng, Bác sĩ Nguyễn Văn A</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Tổng quan</h2>
          <p className="mt-1 text-[15px] font-medium text-[#0891B2]">Ca sáng 08:00 - 12:00</p>
        </div>
        <button type="button" onClick={() => onOpenModule('appointments')} className="secondary-action cursor-pointer active:scale-[0.98]">
          <CalendarClock size={15} />
          Mở lịch khám
        </button>
      </section>
      <section className="flex flex-col gap-3 rounded-lg border border-rose-200 border-l-4 border-l-[#EF4444] bg-[#FEF2F2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm font-bold text-rose-700">
          <AlertTriangle size={18} />
          <span>1 bệnh nhân nguy cơ cao cần xem xét ngay</span>
        </div>
        <button type="button" onClick={() => setShowHighRiskModal(true)} className="self-start rounded-md bg-white px-3 py-1.5 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 sm:self-auto">
          Xem ngay →
        </button>
      </section>
      <KpiCards />
      {nextAppointment ? <NextPatientCard appointment={nextAppointment} /> : null}
      <RecentLabResults />
      <WaitingListTable appointments={appointments} onCall={onStartExam} onOpenRecord={onOpenRecord} />

      {showHighRiskModal && highRiskAppointment && highRiskPatient ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <section className="w-full max-w-xl rounded-lg bg-white shadow-2xl" style={{ animation: 'modalIn 160ms ease-out' }}>
            <div className="flex items-start justify-between gap-4 border-b border-rose-100 bg-rose-50 px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                  <ShieldAlert size={18} />
                  Cảnh báo nguy cơ cao
                </div>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{highRiskPatient.name}</h3>
              </div>
              <button type="button" onClick={() => setShowHighRiskModal(false)} className="icon-button h-8 w-8 shrink-0" aria-label="Đóng cảnh báo cấp cứu">
                <X size={15} />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoMetric label="Mã BN" value={highRiskPatient.code} />
                <InfoMetric label="Khung giờ" value={highRiskAppointment.time} />
                <InfoMetric label="Tuổi" value={`${highRiskPatient.age} tuổi`} />
              </div>
              <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3">
                <p className="text-xs font-bold uppercase text-rose-500">Triệu chứng</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{highRiskAppointment.summary}. {highRiskAppointment.note}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-bold uppercase text-slate-400">Tiền sử & dị ứng</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{highRiskPatient.history.join(', ')}</p>
                <p className="mt-1 text-sm font-bold text-rose-600">{highRiskPatient.allergy}</p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowHighRiskModal(false)} className="ghost-action">
                Để sau
              </button>
              <button type="button" onClick={receiveHighRiskCase} className="secondary-action">
                Tiếp nhận ca này
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function NextPatientCard({ appointment }: { appointment: Appointment }) {
  const patient = getPatient(appointment.patientCode);

  return (
    <section className="rounded-lg border border-sky-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold uppercase text-brand">
              <UserRound size={14} />
              Bệnh nhân tiếp theo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              <Clock size={14} />
              {appointment.time}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold leading-7 text-slate-900">{patient.name}</h3>
            <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">Dị ứng kháng sinh nhóm Penicillin</span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{appointment.summary}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-center lg:w-64">
          <InfoMetric label="Mã BN" value={patient.code} />
          <InfoMetric label="Tuổi" value={`${patient.age}`} />
          <InfoMetric label="Giới" value={patient.gender} />
        </div>
      </div>
    </section>
  );
}

function InfoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
