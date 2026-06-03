import { useState, useEffect, useRef } from 'react';
import { CalendarPlus, MapPin, Clock, CheckCircle2, Download, FileText, Pill, X } from 'lucide-react';
import ConfirmDialog from '../manager/components/ConfirmDialog';
import type { AppointmentData, AppointmentStatus, BookingContext } from './types';

type TabId = 'upcoming' | 'pending' | 'history';

type AppointmentClinicalDetail = {
  diagnosis: string;
  instruction: string;
  prescriptionLabel: string;
  labResultLabel: string;
};

type AppointmentDetailPanelProps = {
  open: boolean;
  appointment: AppointmentData | null;
  clinicalDetail?: AppointmentClinicalDetail;
  onClose: () => void;
};

type PreviewModalProps = {
  type: 'prescription' | 'lab-result' | null;
  appointment: AppointmentData;
  clinicalDetail: AppointmentClinicalDetail;
  onClose: () => void;
};

const DEFAULT_CLINICAL_DETAIL: AppointmentClinicalDetail = {
  diagnosis: 'Viêm họng hạt cấp tính',
  instruction: 'Súc miệng nước muối sinh lý 2 lần/ngày. Kiêng đồ ăn lạnh.',
  prescriptionLabel: 'Xem Đơn thuốc',
  labResultLabel: 'Xem Kết quả Cận lâm sàng',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  upcoming: 'Sắp tới',
  pending: 'Chờ xác nhận',
  completed: 'Đã khám',
  cancelled: 'Đã hủy',
  rescheduled: 'Đã dời lịch',
};

function parseDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/');
  return { day, month, year };
}

export default function PatientAppointments({
  onNavigateToBooking,
  defaultTab,
  toast: externalToast,
  appointments,
  onAppointmentsChange,
}: {
  onNavigateToBooking: (ctx: BookingContext) => void;
  defaultTab?: TabId;
  toast?: string | null;
  appointments: AppointmentData[];
  onAppointmentsChange: (updater: AppointmentData[] | ((prev: AppointmentData[]) => AppointmentData[])) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab ?? 'upcoming');
  const [cancelTarget, setCancelTarget] = useState<AppointmentData | null>(null);
  const [detailTarget, setDetailTarget] = useState<AppointmentData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(externalToast ?? null);
  const detailCloseTimer = useRef<number | null>(null);

  /* Auto-dismiss toast after 3s */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* Sync default tab from parent */
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  /* Sync external toast from parent */
  useEffect(() => {
    if (externalToast) setToast(externalToast);
  }, [externalToast]);

  useEffect(() => {
    return () => {
      if (detailCloseTimer.current) {
        window.clearTimeout(detailCloseTimer.current);
      }
    };
  }, []);

  /* ── Filter appointments by tab ── */
  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const pending = appointments.filter((a) => a.status === 'pending');
  const history = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rescheduled',
  );

  const tabItems: { id: TabId; label: string; count?: number; badgeClass?: string }[] = [
    { id: 'upcoming', label: 'Sắp tới', count: upcoming.length },
    { id: 'pending', label: 'Chờ xác nhận', count: pending.length, badgeClass: 'appt-tab-badge--warning' },
    { id: 'history', label: 'Lịch sử khám' },
  ];

  const currentList =
    activeTab === 'upcoming' ? upcoming : activeTab === 'pending' ? pending : history;

  /* ── Cancel flow ── */
  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    onAppointmentsChange((prev) =>
      prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: 'cancelled' as AppointmentStatus } : a)),
    );
    setCancelTarget(null);
    setToast('Đã hủy lịch hẹn. Phòng khám sẽ được thông báo.');

    /* Move card to history tab after 2s */
    window.setTimeout(() => {
      setActiveTab('history');
    }, 2000);
  };

  /* ── Reschedule ── */
  const handleReschedule = (appt: AppointmentData) => {
    onNavigateToBooking({
      isReschedule: true,
      fromAppointment: appt,
      source: 'appointment-history',
      prefilledSpecialty: appt.specialty,
      prefilledDoctor: appt.doctor,
      startStep: 2,
    });
  };

  /* ── Re-book ── */
  const handleRebook = (appt: AppointmentData) => {
    onNavigateToBooking({
      isReschedule: false,
      fromAppointment: appt,
      source: 'appointment-history',
      prefilledSpecialty: appt.specialty,
      prefilledDoctor: appt.doctor,
      startStep: 2,
    });
  };

  const handleOpenDetail = (appt: AppointmentData) => {
    if (detailCloseTimer.current) {
      window.clearTimeout(detailCloseTimer.current);
    }
    setDetailTarget(appt);
    window.requestAnimationFrame(() => setDetailOpen(true));
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    detailCloseTimer.current = window.setTimeout(() => {
      setDetailTarget(null);
    }, 300);
  };

  return (
    <>
      {/* ── Toast ── */}
      {toast ? (
        <div className="appt-toast appt-toast--success" role="status" aria-live="polite">
          <span className="appt-toast__icon">
            <CheckCircle2 size={16} />
          </span>
          <span>{toast}</span>
        </div>
      ) : null}

      {/* ── Cancel Dialog ── */}
      {cancelTarget ? (
        <ConfirmDialog
          title="Xác nhận hủy lịch hẹn"
          message={`Bạn có chắc muốn hủy lịch khám với ${cancelTarget.doctor} vào lúc ${cancelTarget.time}, ngày ${cancelTarget.date}? Thao tác này sẽ thông báo đến phòng khám và không thể hoàn tác.`}
          cancelText="Giữ lịch hẹn"
          confirmText="Xác nhận hủy"
          tone="danger"
          onCancel={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
        />
      ) : null}

      <AppointmentDetailPanel
        open={detailOpen}
        appointment={detailTarget}
        clinicalDetail={DEFAULT_CLINICAL_DETAIL}
        onClose={handleCloseDetail}
      />

      {/* ── Page Header ── */}
      <div className="appt-page-header">
        <div>
          <h1>Lịch hẹn của tôi</h1>
        </div>
        <div>
          <button
            type="button"
            className="appt-btn-primary"
            onClick={() => onNavigateToBooking({ isReschedule: false, fromAppointment: null, source: 'manual', startStep: 1 })}
          >
            <CalendarPlus size={16} />
            Đặt lịch khám mới
          </button>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <nav className="appt-tab-bar" role="tablist">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`appt-tab${activeTab === tab.id ? ' appt-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span className={`appt-tab-badge${tab.badgeClass ? ` ${tab.badgeClass}` : ''}`}>
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* ── Tab Content ── */}
      <div className="appt-tab-content" role="tabpanel">
        {/* Info banner for pending tab */}
        {activeTab === 'pending' && pending.length > 0 ? (
          <div className="appt-info-banner">
            Các lịch hẹn đang chờ phòng khám xác nhận. Bạn sẽ nhận thông báo khi có cập nhật.
          </div>
        ) : null}

        {/* Empty state */}
        {currentList.length === 0 ? (
          <div className="appt-empty-state" role="status">
            <span className="appt-empty-state__icon">📋</span>
            <h3>
              {activeTab === 'upcoming'
                ? 'Chưa có lịch hẹn sắp tới'
                : activeTab === 'pending'
                  ? 'Không có lịch chờ xác nhận'
                  : 'Chưa có lịch sử khám'}
            </h3>
            <p>
              {activeTab === 'upcoming'
                ? 'Đặt lịch khám mới để bắt đầu chăm sóc sức khỏe.'
                : activeTab === 'pending'
                  ? 'Khi bạn đặt lịch mới, chúng sẽ xuất hiện ở đây.'
                  : 'Lịch sử khám bệnh của bạn sẽ được hiển thị tại đây.'}
            </p>
            {activeTab !== 'history' ? (
              <button
                type="button"
                className="appt-btn-primary"
                onClick={() => onNavigateToBooking({ isReschedule: false, fromAppointment: null, source: 'manual', startStep: 1 })}
              >
                <CalendarPlus size={16} />
                Đặt lịch khám mới
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Appointment cards */}
        {currentList.map((appt) => {
          const { day, month, year } = parseDate(appt.date);
          return (
            <div key={appt.id} className="appointment-card">
              {/* Left: Date & Time */}
              <div className="appointment-card__left">
                <div className="appointment-card__date-block">
                  <span className="appointment-card__day">{day}</span>
                  <span className="appointment-card__month">Tháng {month}/{year}</span>
                  <span className="appointment-card__time">
                    <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    {appt.time}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="appointment-card__divider" />

              {/* Info */}
              <div className="appointment-card__info">
                <div className="appointment-card__doctor">{appt.doctor}</div>
                <div className="appointment-card__specialty">{appt.specialty}</div>
                <div className="appointment-card__location">
                  <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {appt.location}
                </div>
                <div className="appointment-card__reason">Lý do: {appt.reason}</div>
              </div>

              {/* Right: Status + Actions */}
              <div className="appointment-card__right">
                <span className={`appt-status appt-status--${appt.status}`}>
                  {STATUS_LABELS[appt.status]}
                </span>

                <div className="appointment-card__actions">
                  {/* Tab Sắp tới */}
                  {appt.status === 'upcoming' ? (
                    <>
                      <button
                        type="button"
                        className="appt-btn-secondary"
                        onClick={() => handleReschedule(appt)}
                      >
                        Dời lịch
                      </button>
                      <button
                        type="button"
                        className="appt-btn-danger-outline"
                        onClick={() => setCancelTarget(appt)}
                      >
                        Hủy lịch
                      </button>
                    </>
                  ) : null}

                  {/* Tab Chờ xác nhận */}
                  {appt.status === 'pending' ? (
                    <button
                      type="button"
                      className="appt-btn-danger-outline"
                      onClick={() => setCancelTarget(appt)}
                      title="Lịch hẹn đang chờ phòng khám xác nhận"
                    >
                      Hủy yêu cầu
                    </button>
                  ) : null}

                  {/* Tab Lịch sử — Đã khám */}
                  {appt.status === 'completed' ? (
                    <>
                      <button
                        type="button"
                        className="appt-btn-secondary"
                        onClick={() => handleOpenDetail(appt)}
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        className="appt-btn-primary-outline"
                        onClick={() => handleRebook(appt)}
                      >
                        Đặt lịch lại
                      </button>
                    </>
                  ) : null}

                  {/* Tab Lịch sử — Đã hủy */}
                  {appt.status === 'cancelled' ? (
                    <button
                      type="button"
                      className="appt-btn-primary-outline"
                      onClick={() => handleRebook(appt)}
                    >
                      Đặt lịch lại
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AppointmentDetailPanel({
  open,
  appointment,
  clinicalDetail = DEFAULT_CLINICAL_DETAIL,
  onClose,
}: AppointmentDetailPanelProps) {
  const [activeModal, setActiveModal] = useState<null | 'prescription' | 'lab-result'>(null);

  if (!appointment) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-out ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/40"
        aria-label="Đóng chi tiết ca khám"
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:w-[480px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết ca khám"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <h2 className="text-base font-extrabold text-slate-900">Chi tiết ca khám</h2>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Đóng panel chi tiết"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section className="rounded-lg border border-emerald-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-emerald-600">Đã hoàn thành</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  {appointment.time}, {appointment.date}
                </p>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-400">Bác sĩ</dt>
                <dd className="mt-1 font-bold text-slate-800">{appointment.doctor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-400">Chuyên khoa</dt>
                <dd className="mt-1 font-bold text-slate-800">{appointment.specialty}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-5 rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-extrabold text-slate-800">Kết luận lâm sàng</h3>
            <dl className="mt-3 grid gap-3 text-sm leading-6">
              <div>
                <dt className="font-semibold text-slate-500">Chẩn đoán</dt>
                <dd className="mt-1 font-bold text-slate-800">{clinicalDetail.diagnosis}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Lời dặn</dt>
                <dd className="mt-1 font-medium text-slate-700">{clinicalDetail.instruction}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-extrabold text-slate-800">Hồ sơ đính kèm</h3>
            <div className="mt-3 grid gap-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                onClick={() => setActiveModal('prescription')}
              >
                <Pill size={17} />
                {clinicalDetail.prescriptionLabel}
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                onClick={() => setActiveModal('lab-result')}
              >
                <FileText size={17} />
                {clinicalDetail.labResultLabel}
              </button>
            </div>
          </section>
        </div>
      </aside>

      <PreviewModal
        type={activeModal}
        appointment={appointment}
        clinicalDetail={clinicalDetail}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

function PreviewModal({
  type,
  appointment,
  clinicalDetail,
  onClose,
}: PreviewModalProps) {
  if (!type) return null;

  const isPrescription = type === 'prescription';
  const title = isPrescription ? 'Đơn thuốc điện tử' : 'Kết quả Cận lâm sàng';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-6">
      <section
        className="flex max-h-[88vh] w-full max-w-[600px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <h2 className="min-w-0 text-lg font-extrabold text-slate-900">{title}</h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-extrabold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
            >
              <Download size={16} />
              Tải xuống
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Đóng modal xem trước"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm md:grid-cols-2">
            <dl className="grid gap-3">
              <div>
                <dt className="font-semibold text-slate-500">Tên bệnh nhân</dt>
                <dd className="mt-1 font-bold text-slate-800">Lê Nguyễn Công Minh</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Tuổi</dt>
                <dd className="mt-1 font-bold text-slate-800">32</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Giới tính</dt>
                <dd className="mt-1 font-bold text-slate-800">Nam</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Chẩn đoán</dt>
                <dd className="mt-1 font-bold text-slate-800">{clinicalDetail.diagnosis}</dd>
              </div>
            </dl>

            <dl className="grid gap-3">
              {isPrescription ? (
                <>
                  <div>
                    <dt className="font-semibold text-slate-500">Mã đơn thuốc</dt>
                    <dd className="mt-1 font-bold text-slate-800">RX-{appointment.id}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Ngày kê đơn</dt>
                    <dd className="mt-1 font-bold text-slate-800">{appointment.date}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Bác sĩ chỉ định</dt>
                    <dd className="mt-1 font-bold text-slate-800">{appointment.doctor}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="font-semibold text-slate-500">Loại xét nghiệm</dt>
                    <dd className="mt-1 font-bold text-slate-800">Huyết học</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Ngày lấy mẫu</dt>
                    <dd className="mt-1 font-bold text-slate-800">{appointment.date}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Phòng xét nghiệm</dt>
                    <dd className="mt-1 font-bold text-slate-800">Lab Trung tâm</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {isPrescription ? (
            <PrescriptionPreview appointment={appointment} />
          ) : (
            <LabResultPreview />
          )}
        </div>
      </section>
    </div>
  );
}

function PrescriptionPreview({ appointment }: { appointment: AppointmentData }) {
  return (
    <>
      <section className="mt-6">
        <h3 className="text-base font-extrabold text-slate-900">Danh sách thuốc</h3>
        <div className="mt-3 grid gap-3">
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-extrabold text-slate-900">1. Amoxicillin 500mg</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Số lượng: 20 viên. Cách dùng: Uống ngày 2 lần, mỗi lần 1 viên sau ăn.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-extrabold text-slate-900">2. Paracetamol 500mg</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Số lượng: 10 viên. Cách dùng: Uống 1 viên khi sốt &gt; 38.5 độ.
            </p>
          </article>
        </div>
      </section>

      <footer className="mt-6 rounded-lg border border-dashed border-slate-200 bg-white p-4">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500">Lời dặn của bác sĩ</p>
            <p className="mt-1 text-sm font-bold text-slate-800">Tái khám sau 5 ngày nếu không đỡ</p>
          </div>
          <div className="shrink-0 text-right opacity-40">
            <div className="rotate-[-8deg] rounded-full border-2 border-blue-500 px-5 py-3 text-xs font-black uppercase tracking-wide text-blue-600">
              Đã ký
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">{appointment.doctor}</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function LabResultPreview() {
  return (
    <section className="mt-6">
      <h3 className="text-base font-extrabold text-slate-900">Bảng kết quả</h3>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Chỉ số</th>
              <th className="px-4 py-3">Kết quả</th>
              <th className="px-4 py-3">Trị số bình thường</th>
              <th className="px-4 py-3">Đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="px-4 py-3 font-bold text-slate-800">Hồng cầu - RBC</td>
              <td className="px-4 py-3 text-slate-700">
                <strong className="text-red-600">3.5</strong> T/L
              </td>
              <td className="px-4 py-3 font-medium text-slate-500">4.0 - 5.8</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-600">
                  Thấp
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-800">Bạch cầu (WBC)</td>
              <td className="px-4 py-3 font-semibold text-slate-800">6.8 G/L</td>
              <td className="px-4 py-3 font-medium text-slate-500">4.0 - 10.0</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-600">
                  Bình thường
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
