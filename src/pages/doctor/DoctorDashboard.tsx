import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { consultationRequests, doctorModules, getPatient, initialAppointments } from './data';
import type { Appointment, DoctorModule, DoctorView, SavedEmrEntry } from './types';
import DoctorHeader from './components/DoctorHeader';
import DoctorSidebar from './components/DoctorSidebar';
import Toast from './components/Toast';
import DoctorDashboardHome from './components/dashboard/DoctorDashboardHome';
import AppointmentsView from './views/AppointmentsView';
import ExamView from './views/ExamView';
import { RecordsView, RecordDetailView } from './views/RecordsView';
import OrdersView from './views/OrdersView';
import ConsultationView from './views/ConsultationView';
import AccountView from './views/AccountView';
import LabResultsView from './views/LabResultsView';
import type { NotificationItem } from '../../components/common/NotificationBell';
import ConfirmDialog from '../manager/components/ConfirmDialog';

type RecordDeepLinkTab = 'visits' | 'labs';
type PrescriptionRouteState = {
  patientId?: string;
  appointmentId?: string;
  patientName?: string;
  timeSlot?: string;
  fromDashboard?: boolean;
};

type OrdersContext = {
  patientCode: string;
  appointmentId?: string;
  timeSlot?: string;
  fromDashboard?: boolean;
} | null;

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeModule, setActiveModule] = useState<DoctorModule>('dashboard');
  const [view, setView] = useState<DoctorView>('dashboard');
  const [selectedCode, setSelectedCode] = useState('PA-019');
  const [recordDetailInitialTab, setRecordDetailInitialTab] = useState<RecordDeepLinkTab>('visits');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [selectedConsultationCode, setSelectedConsultationCode] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmEndExam, setConfirmEndExam] = useState(false);
  const [confirmFinishOrders, setConfirmFinishOrders] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [ordersContext, setOrdersContext] = useState<OrdersContext>(null);
  const [savedEmrEntries, setSavedEmrEntries] = useState<SavedEmrEntry[]>([]);
  const [resolvedConsultationCodes, setResolvedConsultationCodes] = useState<string[]>([]);
  const [accountResetKey, setAccountResetKey] = useState(0);
  const leavingPrescriptionRef = useRef(false);

  const notify = (message: string) => setToast(message);

  const logout = () => {
    localStorage.removeItem('triageai_user');
    setConfirmLogout(false);
    navigate('/');
  };

  const openAppointmentsModule = () => {
    leavingPrescriptionRef.current = true;
    setOrdersContext(null);
    setActiveModule('appointments');
    setView('appointments');
    setMobileOpen(false);
    navigate('/doctor-dashboard', { replace: location.pathname === '/doctor/prescription' });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    if (!patientId || location.pathname === '/doctor/prescription') return;

    setSelectedCode(patientId);
    setRecordDetailInitialTab(normalizeRecordDeepLinkTab(searchParams.get('tab') ?? searchParams.get('activeTab')));
    setActiveModule('records');
    setView('recordDetail');
    setMobileOpen(false);
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (location.pathname !== '/doctor/prescription') {
      leavingPrescriptionRef.current = false;
      return;
    }

    if (leavingPrescriptionRef.current) return;

    const routeState = (location.state ?? null) as PrescriptionRouteState | null;
    const patientId = searchParams.get('patientId') ?? routeState?.patientId ?? null;
    const appointmentId = searchParams.get('appointmentId') ?? routeState?.appointmentId;
    const appointment = appointmentId
      ? appointments.find((item) => item.id === appointmentId)
      : patientId
        ? appointments.find((item) => item.patientCode === patientId && item.status === 'Đang khám')
        : undefined;

    setActiveModule('orders');
    setView('orders');
    setMobileOpen(false);

    if (!patientId) {
      setOrdersContext(null);
      return;
    }

    setSelectedCode(patientId);
    setActivePatientId(appointment?.id ?? appointmentId ?? null);
    setOrdersContext({
      patientCode: patientId,
      appointmentId: appointment?.id ?? appointmentId,
      timeSlot: routeState?.timeSlot ?? appointment?.time,
      fromDashboard: routeState?.fromDashboard,
    });
  }, [appointments, location.pathname, location.state, searchParams]);

  const openModule = (module: DoctorModule) => {
    if (module === 'orders') {
      leavingPrescriptionRef.current = false;
      const activeAppointment = appointments.find((appointment) => appointment.id === activePatientId && appointment.status === 'Đang khám');
      if (activeAppointment) {
        openPrescriptionForAppointment(activeAppointment);
      } else {
        setSearchParams({});
        setOrdersContext(null);
        setActiveModule('orders');
        setView('orders');
        setMobileOpen(false);
        navigate('/doctor/prescription');
      }
      return;
    }

    setSearchParams({});
    setActiveModule(module);
    setMobileOpen(false);
    setView(module === 'dashboard' ? 'dashboard' : module);
    if (location.pathname !== '/doctor-dashboard') {
      navigate('/doctor-dashboard');
    }
  };

  const callPatient = (appointment: Appointment) => {
    const patient = getPatient(appointment.patientCode);
    const startedAt = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
    setActivePatientId(appointment.id);
    setSelectedCode(appointment.patientCode);
    setAppointments((items) =>
      items.map((item) => ({
        ...item,
        status: item.id === appointment.id ? 'Đang khám' : item.status === 'Đang khám' ? 'Đang chờ' : item.status,
        startedAt: item.id === appointment.id ? startedAt : item.status === 'Đang khám' ? undefined : item.startedAt,
      })),
    );
    notify(`Đã gọi ${patient.name} vào khám`);
  };

  const openExam = (appointment: Appointment) => {
    openPrescriptionForAppointment(appointment);
  };

  const openActiveExam = () => {
    const activeAppointment = appointments.find((appointment) => appointment.id === activePatientId);
    if (!activeAppointment) return;
    openPrescriptionForAppointment(activeAppointment);
  };

  const openPrescriptionForAppointment = (appointment: Appointment) => {
    const patient = getPatient(appointment.patientCode);
    leavingPrescriptionRef.current = false;
    setSelectedCode(appointment.patientCode);
    setActivePatientId(appointment.id);
    setOrdersContext({
      patientCode: appointment.patientCode,
      appointmentId: appointment.id,
      timeSlot: appointment.time,
      fromDashboard: true,
    });
    setActiveModule('orders');
    setView('orders');
    setMobileOpen(false);
    navigate(`/doctor/prescription?patientId=${appointment.patientCode}&appointmentId=${appointment.id}`, {
      state: {
        patientId: appointment.patientCode,
        appointmentId: appointment.id,
        patientName: patient.name,
        timeSlot: appointment.time,
        fromDashboard: true,
      },
    });
  };

  const openRecord = (code: string, tab: RecordDeepLinkTab = 'visits') => {
    setSearchParams({ patientId: code, tab: tab === 'labs' ? 'lab-results' : 'visits' });
    setSelectedCode(code);
    setRecordDetailInitialTab(tab);
    setActiveModule('records');
    setView('recordDetail');
  };

  const openOrdersForPatient = (code: string) => {
    setSelectedCode(code);
    setOrdersContext({ patientCode: code });
    setActiveModule('orders');
    setView('orders');
  };

  const returnToRecordsAfterSave = (entry: SavedEmrEntry) => {
    setSavedEmrEntries((current) => [entry, ...current]);
    setAppointments((items) => items.map((item) => (item.patientCode === entry.patientCode ? { ...item, status: 'Đã khám' } : item)));
    setActivePatientId(null);
    setSelectedCode(entry.patientCode);
    setActiveModule('records');
    setView('recordDetail');
  };

  const openLabResults = () => {
    setActiveModule('labResults');
    setView('labResults');
  };

  const openConsultation = () => {
    setSelectedConsultationCode(undefined);
    setActiveModule('consultation');
    setView('consultation');
  };

  const openAccount = () => {
    setAccountResetKey((current) => current + 1);
    setActiveModule('account');
    setView('account');
    setMobileOpen(false);
  };

  const resolveConsultation = (patientCode: string, action: 'appointment' | 'complete') => {
    setResolvedConsultationCodes((current) => (current.includes(patientCode) ? current : [...current, patientCode]));
    notify(action === 'appointment' ? 'Đã yêu cầu bệnh nhân đặt lịch khám' : 'Đã hoàn tất tư vấn');
  };

  const openConsultationCase = (patientCode: string) => {
    setSelectedConsultationCode(patientCode);
    setActiveModule('consultation');
    setView('consultation');
    setMobileOpen(false);
  };

  const openDoctorNotificationTarget = (notification: NotificationItem) => {
    const target = notification.id;

    if (notification.targetPath === '/emr' && notification.patientId) {
      const tab = normalizeRecordDeepLinkTab(notification.targetTab);
      setSearchParams({ patientId: notification.patientId, tab: notification.targetTab ?? tab });
      setSelectedCode(notification.patientId);
      setRecordDetailInitialTab(tab);
      setActiveModule('records');
      setView('recordDetail');
      setMobileOpen(false);
      return;
    }

    if (target === 'doctor-lab-new') {
      openRecord('PA-020', 'labs');
    }

    if (target === 'doctor-triage-risk') {
      setActiveModule('dashboard');
      setView('dashboard');
    }

    if (target === 'doctor-consultation') {
      openConsultation();
    }

    if (target === 'doctor-record-updated') {
      openRecord('PA-015');
    }

    setMobileOpen(false);
  };

  const finishExam = () => {
    setAppointments((items) => items.map((item) => (item.patientCode === selectedCode || item.id === activePatientId ? { ...item, status: 'Đã khám' } : item)));
    setActivePatientId(null);
    openAppointmentsModule();
    notify('Đã hoàn tất khám và lưu vào EMR');
  };

  const endActiveExam = () => {
    const activeAppointment = appointments.find((appointment) => appointment.id === activePatientId);
    if (!activeAppointment) return;
    setAppointments((items) => items.map((item) => (item.id === activeAppointment.id ? { ...item, status: 'Đã khám' } : item)));
    setActivePatientId(null);
    setConfirmEndExam(false);
    openAppointmentsModule();
    notify('Đã kết thúc ca khám hiện tại');
  };

  const finishOrdersExam = () => {
    const currentPatientCode = ordersContext?.patientCode ?? selectedCode;
    const currentAppointmentId = ordersContext?.appointmentId ?? activePatientId;
    const patient = getPatient(currentPatientCode);

    setActivePatientId(null);
    setConfirmFinishOrders(false);
    openAppointmentsModule();
    setAppointments((items) =>
      items.map((item) => (
        item.id === currentAppointmentId || item.patientCode === currentPatientCode
          ? { ...item, status: 'Đã khám' }
          : item
      )),
    );
    notify(`Đã hoàn thành khám ${patient.name}`);
  };

  const activeLabel = view === 'exam' ? 'Khám bệnh' : doctorModules.find((item) => item.id === activeModule)?.label ?? 'Tổng quan';
  const activeAppointment = appointments.find((appointment) => appointment.patientCode === selectedCode);
  const ordersAppointment = ordersContext?.appointmentId
    ? appointments.find((appointment) => appointment.id === ordersContext.appointmentId)
    : ordersContext?.patientCode
      ? appointments.find((appointment) => appointment.patientCode === ordersContext.patientCode)
      : undefined;
  const ordersPatient = ordersContext?.patientCode ? getPatient(ordersContext.patientCode) : null;
  const unresolvedConsultationCount = consultationRequests.filter((item) => !resolvedConsultationCodes.includes(item.patientCode)).length;

  return (
    <main className="doctor-shell lg:flex">
      {toast ? <Toast message={toast} /> : null}
      {confirmEndExam ? (
        <ConfirmDialog
          title="Hoàn tất ca khám?"
          message={`Xác nhận hoàn tất khám cho ${activeAppointment ? getPatient(activeAppointment.patientCode).name : 'bệnh nhân hiện tại'} và lưu trạng thái vào EMR.`}
          confirmText="Hoàn tất khám"
          tone="warning"
          onCancel={() => setConfirmEndExam(false)}
          onConfirm={endActiveExam}
        />
      ) : null}
      {confirmLogout ? (
        <ConfirmDialog
          title="Đăng xuất khỏi hệ thống?"
          message="Phiên làm việc hiện tại sẽ kết thúc và bạn cần đăng nhập lại."
          confirmText="Đăng xuất"
          tone="danger"
          onCancel={() => setConfirmLogout(false)}
          onConfirm={logout}
        />
      ) : null}
      {confirmFinishOrders && ordersPatient ? (
        <ConfirmDialog
          title="Xác nhận kết thúc khám"
          message={`Xác nhận kết thúc khám cho ${ordersPatient.name}? Phiếu chỉ định và đơn thuốc sẽ được lưu vào hồ sơ.`}
          cancelText="Hủy"
          confirmText="Xác nhận kết thúc"
          tone="danger"
          onCancel={() => setConfirmFinishOrders(false)}
          onConfirm={finishOrdersExam}
        />
      ) : null}
      <DoctorSidebar
        activeModule={view === 'exam' ? 'dashboard' : activeModule}
        mobileOpen={mobileOpen}
        isExamMode={view === 'exam'}
        consultationUnreadCount={unresolvedConsultationCount}
        onOpenModule={openModule}
      />
      {mobileOpen ? <button type="button" className="fixed inset-0 z-30 cursor-pointer bg-slate-900/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" /> : null}

      <div className="min-w-0 flex-1 lg:ml-60">
        <DoctorHeader
          title={activeLabel}
          onOpenMenu={() => setMobileOpen(true)}
          onNotificationClick={openDoctorNotificationTarget}
          onLogout={() => setConfirmLogout(true)}
          onOpenAccount={openAccount}
        />
        <section className="doctor-content page-content">
          {view === 'dashboard' ? (
            <DoctorDashboardHome
              appointments={appointments}
              activePatientId={activePatientId}
              onOpenModule={openModule}
              onOpenRecord={openRecord}
              onOpenOrders={openOrdersForPatient}
              onOpenLabResults={openLabResults}
              onOpenConsultation={openConsultation}
              onOpenConsultationCase={openConsultationCase}
              onCallPatient={callPatient}
              onOpenActiveExam={openActiveExam}
              onEndActiveExam={() => setConfirmEndExam(true)}
            />
          ) : null}
          {view === 'appointments' ? <AppointmentsView appointments={appointments} onCall={callPatient} onOpenExam={openExam} onOpenRecord={openRecord} /> : null}
          {view === 'exam' ? <ExamView patient={getPatient(selectedCode)} appointment={activeAppointment} onBack={() => { setActiveModule('dashboard'); setView('dashboard'); }} onFinish={finishExam} onNotify={notify} /> : null}
          {view === 'records' ? <RecordsView onOpenRecord={openRecord} onNotify={notify} /> : null}
          {view === 'recordDetail' ? (
            <RecordDetailView
              patient={getPatient(selectedCode)}
              initialTab={recordDetailInitialTab}
              savedEntries={savedEmrEntries.filter((entry) => entry.patientCode === selectedCode)}
              onBack={() => {
                setSearchParams({});
                setView('records');
              }}
              onNotify={notify}
              onStartPrescription={openOrdersForPatient}
            />
          ) : null}
          {view === 'orders' ? (
            <OrdersView
              patient={ordersPatient}
              appointment={ordersAppointment}
              onBack={openAppointmentsModule}
              onRequestFinishExam={() => setConfirmFinishOrders(true)}
              onNotify={notify}
              onSavedToEmr={returnToRecordsAfterSave}
            />
          ) : null}
          {view === 'labResults' ? <LabResultsView onOpenRecord={openRecord} /> : null}
          {view === 'consultation' ? (
            <ConsultationView
              selectedPatientCode={selectedConsultationCode}
              resolvedConsultationCodes={resolvedConsultationCodes}
              onResolveConsultation={resolveConsultation}
              onNotify={notify}
            />
          ) : null}
          {view === 'account' ? <AccountView key={`doctor-account-${accountResetKey}`} onNotify={notify} onLogout={() => setConfirmLogout(true)} /> : null}
        </section>
      </div>

    </main>
  );
}

function normalizeRecordDeepLinkTab(tab?: string | null): RecordDeepLinkTab {
  return tab === 'lab-results' || tab === 'labs' ? 'labs' : 'visits';
}
