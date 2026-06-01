import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import LogoMark from '../../components/common/LogoMark';
import type { NotificationTarget } from '../../components/common/NotificationBell';
import AccountSecurityManagement from './AccountSecurityManagement';
import AppointmentManagement from './AppointmentManagement';
import ClinicManagement from './ClinicManagement';
import ManagerDashboard from './ManagerDashboard';
import ManagerHeader from './ManagerHeader';
import NotificationReminderManagement from './NotificationReminderManagement';
import PatientRecordsManagement from './PatientRecordsManagement';
import ReportsAnalyticsManagement from './ReportsAnalyticsManagement';
import StaffCoordinationManagement from './StaffCoordinationManagement';
import PersonnelManagement from './PersonnelManagement';
import { managerMenu } from './data';
import type { ClinicTab, ManagerPage } from './types';

export default function ManagerApp() {
  const [page, setPage] = useState<ManagerPage>('dashboard');
  const [activeTab, setActiveTab] = useState<ClinicTab>('info');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const notify = (message: string) => {
    setToast({ id: Date.now(), message });
  };

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openClinicTab = (tab: ClinicTab) => {
    setPage('clinic');
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const openNotificationTarget = (target: NotificationTarget) => {
    if (target === 'new-appointments') {
      setPage('schedule');
    }

    if (target === 'staff-shortage') {
      setPage('staff');
    }

    if (target === 'review-reply') {
      setPage('clinic');
      setActiveTab('reviews');
    }

    if (target === 'patient-record-update') {
      setPage('records');
    }

    if (target === 'notification-failed') {
      setPage('notifications');
    }

    if (target === 'report-ready') {
      setPage('reports');
    }

    setMobileOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#f1f4f7] text-slate-700 lg:flex">
      {toast ? <Toast message={toast.message} /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center gap-3 border-b border-slate-200 px-7">
          <LogoMark />
          <span className="text-sm font-semibold text-slate-500">Fakeeh Care Group</span>
        </div>
        <nav className="space-y-2 px-5 py-6">
          {managerMenu.map((item) => {
            const Icon = item.icon;
            const active = item.id === page;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPage(item.id as ManagerPage);
                  if (item.id === 'clinic') {
                    setActiveTab('info');
                  }
                  setResetKey((current) => current + 1);
                  setMobileOpen(false);
                }}
                className={`manager-nav-item ${active ? 'manager-nav-item-active' : ''}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {mobileOpen ? (
        <button type="button" className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" />
      ) : null}

      <div className="min-w-0 flex-1">
        <ManagerHeader onOpenMenu={() => setMobileOpen(true)} onNotificationClick={openNotificationTarget} />
        <section className="mx-auto max-w-[1180px] px-4 py-7 sm:px-7 lg:px-10">
          {page === 'dashboard' ? <ManagerDashboard /> : null}
          {page === 'clinic' ? <ClinicManagement key={`clinic-${resetKey}`} activeTab={activeTab} onTabChange={openClinicTab} onNotify={notify} /> : null}
          {page === 'schedule' ? <AppointmentManagement key={`schedule-${resetKey}`} onNotify={notify} /> : null}
          {page === 'records' ? <PatientRecordsManagement key={`records-${resetKey}`} onNotify={notify} /> : null}
          {page === 'personnel' ? <PersonnelManagement key={`personnel-${resetKey}`} onNotify={notify} /> : null}
          {page === 'staff' ? <StaffCoordinationManagement key={`staff-${resetKey}`} onNotify={notify} /> : null}
          {page === 'notifications' ? <NotificationReminderManagement key={`notifications-${resetKey}`} onNotify={notify} /> : null}
          {page === 'reports' ? <ReportsAnalyticsManagement key={`reports-${resetKey}`} onNotify={notify} /> : null}
          {page === 'account' ? <AccountSecurityManagement key={`account-${resetKey}`} onNotify={notify} /> : null}
          {page !== 'dashboard' && page !== 'clinic' && page !== 'schedule' && page !== 'records' && page !== 'personnel' && page !== 'staff' && page !== 'notifications' && page !== 'reports' && page !== 'account' ? (
            <ActionPanel
              icon={<Clock size={22} />}
              title={managerMenu.find((item) => item.id === page)?.label ?? 'Chức năng'}
              subtitle="Mục này hiện chưa có màn chi tiết trong prototype."
              actions={['Quay lại Dashboard', 'Mở Quản lý phòng khám']}
              onPrimary={() => setPage('dashboard')}
              onSecondary={() => setPage('clinic')}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed right-5 top-5 z-[60] flex min-w-72 items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 shadow-xl">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={18} />
      </span>
      <span>{message}</span>
    </div>
  );
}

function ActionPanel({
  icon,
  title,
  subtitle,
  actions,
  onPrimary,
  onSecondary,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actions: string[];
  onPrimary?: () => void;
  onSecondary?: () => void;
}) {
  return (
    <section className="panel">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand">{icon}</div>
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-800">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {actions.map((action, index) => (
          <button
            key={action}
            type="button"
            onClick={index === 0 ? onPrimary : index === 1 ? onSecondary : undefined}
            className="flex min-h-24 items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-brand hover:bg-white"
          >
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
            <span className="text-sm font-extrabold text-slate-700">{action}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
