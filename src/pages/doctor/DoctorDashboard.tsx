import { useEffect, useState } from 'react';
import { doctorModules, getPatient, initialAppointments } from './data';
import type { Appointment, DoctorModule, DoctorView } from './types';
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

export default function DoctorDashboard() {
  const [activeModule, setActiveModule] = useState<DoctorModule>('dashboard');
  const [view, setView] = useState<DoctorView>('dashboard');
  const [selectedCode, setSelectedCode] = useState('PA-019');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (message: string) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openModule = (module: DoctorModule) => {
    setActiveModule(module);
    setMobileOpen(false);
    setView(module === 'dashboard' ? 'dashboard' : module);
  };

  const openExam = (appointment: Appointment) => {
    setSelectedCode(appointment.patientCode);
    setAppointments((items) => items.map((item) => (item.id === appointment.id ? { ...item, status: 'Đang khám' } : item)));
    setActiveModule('dashboard');
    setView('exam');
  };

  const openRecord = (code: string) => {
    setSelectedCode(code);
    setActiveModule('records');
    setView('recordDetail');
  };

  const finishExam = () => {
    setAppointments((items) => items.map((item) => (item.patientCode === selectedCode ? { ...item, status: 'Đã khám' } : item)));
    setActiveModule('dashboard');
    setView('dashboard');
    notify('Đã hoàn tất khám và lưu vào EMR');
  };

  const activeLabel = view === 'exam' ? 'Khám bệnh' : doctorModules.find((item) => item.id === activeModule)?.label ?? 'Tổng quan';
  const activeAppointment = appointments.find((appointment) => appointment.patientCode === selectedCode);

  return (
    <main className="min-h-screen bg-[#eef3f7] text-sm text-slate-700 lg:flex">
      {toast ? <Toast message={toast} /> : null}
      <DoctorSidebar activeModule={view === 'exam' ? 'dashboard' : activeModule} mobileOpen={mobileOpen} isExamMode={view === 'exam'} onOpenModule={openModule} />
      {mobileOpen ? <button type="button" className="fixed inset-0 z-30 cursor-pointer bg-slate-900/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" /> : null}

      <div className="min-w-0 flex-1">
        <DoctorHeader title={activeLabel} onOpenMenu={() => setMobileOpen(true)} />
        <section className="mx-auto max-w-[1180px] px-4 py-4 sm:px-5 lg:px-6">
          {view === 'dashboard' ? <DoctorDashboardHome appointments={appointments} onOpenModule={openModule} onOpenRecord={openRecord} onStartExam={openExam} /> : null}
          {view === 'appointments' ? <AppointmentsView appointments={appointments} onCall={openExam} onOpenExam={openExam} onOpenRecord={openRecord} /> : null}
          {view === 'exam' ? <ExamView patient={getPatient(selectedCode)} appointment={activeAppointment} onBack={() => { setActiveModule('dashboard'); setView('dashboard'); }} onFinish={finishExam} onNotify={notify} /> : null}
          {view === 'records' ? <RecordsView onOpenRecord={openRecord} onNotify={notify} /> : null}
          {view === 'recordDetail' ? <RecordDetailView patient={getPatient(selectedCode)} onBack={() => setView('records')} onNotify={notify} /> : null}
          {view === 'orders' ? <OrdersView patient={getPatient(selectedCode)} onNotify={notify} /> : null}
          {view === 'consultation' ? <ConsultationView onNotify={notify} /> : null}
          {view === 'account' ? <AccountView onNotify={notify} /> : null}
        </section>
      </div>

    </main>
  );
}
