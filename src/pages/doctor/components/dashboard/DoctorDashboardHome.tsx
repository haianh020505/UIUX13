import { consultationRequests } from '../../data';
import type { Appointment, DoctorModule } from '../../types';
import KpiCards from './KpiCards';
import LabAlertsList from './LabAlertsList';
import TodaySchedule from './TodaySchedule';

export default function DoctorDashboardHome({
  appointments,
  activePatientId,
  onOpenModule,
  onOpenRecord,
  onOpenOrders,
  onOpenLabResults,
  onOpenConsultation,
  onOpenConsultationCase,
  onCallPatient,
  onOpenActiveExam,
  onEndActiveExam,
}: {
  appointments: Appointment[];
  activePatientId: string | null;
  onOpenModule: (module: DoctorModule) => void;
  onOpenRecord: (code: string) => void;
  onOpenOrders: (code: string) => void;
  onOpenLabResults: () => void;
  onOpenConsultation: () => void;
  onOpenConsultationCase: (patientCode: string) => void;
  onCallPatient: (appointment: Appointment) => void;
  onOpenActiveExam: () => void;
  onEndActiveExam: () => void;
}) {
  const waitingList = appointments.filter((a) => a.status === 'Đang chờ');
  const urgentConsultationCount = consultationRequests.filter((request) => request.urgency === 'Khẩn cấp').length;

  return (
    <div className="saas-dashboard">
      <header className="saas-greeting">
        <h1 className="saas-greeting-title">Chào buổi sáng, Bác sĩ Nguyễn Văn A!</h1>
        <p className="saas-greeting-sub">
          Hôm nay bạn có <strong>{appointments.length}</strong> ca khám
          và <strong>{urgentConsultationCount}</strong> ca tư vấn khẩn cấp từ AI.
        </p>
      </header>

      <KpiCards
        totalCount={appointments.length}
        waitingCount={waitingList.length}
        newThisWeek={4}
      />

      <div className="saas-boards-grid">
        <LabAlertsList onOpenConsultationCase={onOpenConsultationCase} />

        <TodaySchedule
          appointments={appointments}
          activePatientId={activePatientId}
          onOpenAppointments={() => onOpenModule('appointments')}
          onCallPatient={onCallPatient}
          onOpenRecord={onOpenRecord}
          onOpenActiveExam={onOpenActiveExam}
        />
      </div>
    </div>
  );
}
