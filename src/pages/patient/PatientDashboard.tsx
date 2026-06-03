import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, CircleUserRound, Clock, LogOut, Menu } from 'lucide-react';
import LogoMark from '../../components/common/LogoMark';
import NotificationBell from '../../components/common/NotificationBell';
import type { NotificationItem } from '../../components/common/NotificationBell';
import ConfirmDialog from '../manager/components/ConfirmDialog';
import PatientDashboardHome from './PatientDashboardHome';
import PatientConsultation from './PatientConsultation';
import PatientAppointments from './PatientAppointments';
import PatientBooking from './PatientBooking';
import { patientMenu, patientNotifications } from './data';
import type { PatientPage, BookingContext } from './types';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState<PatientPage>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  /* ── Booking module state ── */
  const [bookingContext, setBookingContext] = useState<BookingContext | null>(null);
  const [apptDefaultTab, setApptDefaultTab] = useState<'upcoming' | 'pending' | 'history' | undefined>(undefined);
  const [apptToast, setApptToast] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('triageai_user') || 'null') as {
    role?: string;
    name?: string;
  } | null;
  const userName = (user?.role === 'patient' && user?.name) ? user.name : 'Lê Nguyễn Công Minh';

  const notify = (message: string) => {
    setToast({ id: Date.now(), message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openPage = (nextPage: PatientPage) => {
    setPage(nextPage);
    setMobileOpen(false);
    /* Reset booking context when navigating away */
    if (nextPage !== 'booking') {
      setBookingContext(null);
    }
  };

  const openNotificationTarget = (notification: NotificationItem) => {
    const target = notification.id;

    if (target === 'patient-appointment-confirmed' || target === 'patient-appointment-reminder') {
      setPage('appointments');
    }

    if (target === 'patient-lab-result' || target === 'patient-medication-reminder') {
      setPage('health-records');
    }

    setMobileOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('triageai_user');
    setConfirmLogout(false);
    navigate('/');
  };

  /* ── Navigate to booking wizard ── */
  const handleNavigateToBooking = (ctx: BookingContext) => {
    setBookingContext(ctx);
    setPage('booking');
    setMobileOpen(false);
  };

  /* ── Complete booking wizard → back to appointments ── */
  const handleBookingComplete = (_summary: string) => {
    setBookingContext(null);
    setApptDefaultTab('pending');
    setApptToast('Đặt lịch thành công! Phòng khám sẽ xác nhận trong 24 giờ.');
    setPage('appointments');
  };

  /* ── Back from booking → appointments ── */
  const handleBookingBack = () => {
    setBookingContext(null);
    setPage('appointments');
  };

  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
  const activeLabel = patientMenu.find((item) => item.id === page)?.label ?? (page === 'booking' ? 'Đặt lịch khám' : 'Trang chủ');

  return (
    <main className="patient-shell lg:flex">
      {toast ? <Toast message={toast.message} /> : null}
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

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setPage('dashboard');
            setMobileOpen(false);
          }}
          className="flex h-14 w-full items-center gap-2.5 border-b border-slate-200 px-4 text-left transition hover:bg-slate-50 shrink-0"
          aria-label="Về Trang chủ"
        >
          <LogoMark />
          <span className="text-sm font-semibold text-slate-500">Fakeeh Care Group</span>
        </button>
        <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto px-3 py-4" style={{ maxHeight: 'calc(100vh - 3.5rem)' }}>
          {patientMenu.map((item) => {
            const Icon = item.icon;
            const active = item.id === page || (item.id === 'appointments' && page === 'booking');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openPage(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-brand'
                } ${item.id === 'account' ? 'mt-auto' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Đóng menu"
        />
      ) : null}

      {/* ── MAIN CONTENT ── */}
      <div className="min-w-0 flex-1">
        {/* ── TOP NAVBAR ── */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="icon-button lg:hidden"
            aria-label="Mở menu"
          >
            <Menu size={18} />
          </button>
          <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <CalendarDays size={16} className="text-brand" />
              <div>
                <p className="text-xs font-extrabold uppercase text-slate-400">Hôm nay</p>
                <p className="text-xs font-semibold capitalize text-slate-700">{today}</p>
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <NotificationBell
              notifications={patientNotifications}
              onNotificationClick={openNotificationTarget}
            />
            <button
              type="button"
              onClick={() => openPage('account')}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:border-brand/40 hover:bg-sky-50 active:scale-[0.99]"
              aria-label="Mở tài khoản bệnh nhân"
              title="Mở tài khoản"
            >
              <CircleUserRound className="text-slate-400" size={26} />
              <div className="hidden sm:block">
                <p className="text-sm font-extrabold text-slate-800">{userName}</p>
                <p className="text-xs font-semibold text-slate-400">{activeLabel}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="icon-button hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
              aria-label="Đăng xuất"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        {page === 'consultation' ? (
          <PatientConsultation onNavigateToBooking={handleNavigateToBooking} />
        ) : (
          <section className="mx-auto max-w-[1180px] px-4 py-3 sm:px-5 lg:px-6">
            {page === 'dashboard' ? (
              <PatientDashboardHome onNavigate={openPage} userName={userName} />
            ) : null}

            {page === 'appointments' ? (
              <PatientAppointments
                onNavigateToBooking={handleNavigateToBooking}
                defaultTab={apptDefaultTab}
                toast={apptToast}
              />
            ) : null}

            {page === 'booking' && bookingContext ? (
              <PatientBooking
                context={bookingContext}
                onBack={handleBookingBack}
                onComplete={handleBookingComplete}
              />
            ) : null}

            {page !== 'dashboard' && page !== 'appointments' && page !== 'booking' ? (
              <PlaceholderPanel
                title={activeLabel}
                onBack={() => setPage('dashboard')}
                onNotify={notify}
              />
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}

/* ── Helpers ── */

function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed right-4 top-4 z-[60] flex min-w-64 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold shadow-xl"
      style={{ background: 'var(--color-success)', color: 'var(--color-on-success)' }}
      role="status"
      aria-live="polite"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}
      >
        <CheckCircle2 size={16} />
      </span>
      <span>{message}</span>
    </div>
  );
}

function PlaceholderPanel({
  title,
  onBack,
  onNotify,
}: {
  title: string;
  onBack: () => void;
  onNotify: (message: string) => void;
}) {
  return (
    <section className="panel">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-brand">
          <Clock size={22} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            Mục này hiện chưa có màn chi tiết trong prototype.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-20 items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-brand hover:bg-white"
        >
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
          <span className="text-sm font-extrabold text-slate-700">Quay lại Trang chủ</span>
        </button>
        <button
          type="button"
          onClick={() => onNotify('Tính năng đang được phát triển')}
          className="flex min-h-20 items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-brand hover:bg-white"
        >
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={18} />
          <span className="text-sm font-extrabold text-slate-700">Thông báo thử nghiệm</span>
        </button>
      </div>
    </section>
  );
}
