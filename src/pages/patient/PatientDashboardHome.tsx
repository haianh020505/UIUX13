import { CalendarDays, ChevronRight, FolderHeart, MapPin, MessageCircle, QrCode, Stethoscope } from 'lucide-react';
import { healthArticles, popularSpecialties, upcomingAppointment } from './data';
import type { PatientPage } from './types';

export default function PatientDashboardHome({
  onNavigate,
  userName = 'Bệnh nhân',
}: {
  onNavigate: (page: PatientPage) => void;
  userName?: string;
}) {
  const hour = new Date().getHours();
  let timeGreeting = 'Chào buổi sáng';
  if (hour >= 12 && hour < 18) timeGreeting = 'Chào buổi chiều';
  else if (hour >= 18) timeGreeting = 'Chào buổi tối';

  return (
    <div className="patient-dashboard" style={{ gap: 'var(--spacing-md)' }}>
      <header className="saas-greeting">
        <h1 className="saas-greeting-title">{timeGreeting}, Bệnh nhân {userName}!</h1>
        <p className="saas-greeting-sub">
          Bạn có <strong>1</strong> lịch hẹn khám sắp tới vào <strong>{upcomingAppointment.date}</strong>.
        </p>
      </header>

      {/* ── KHỐI 1 — Lịch hẹn sắp tới ── */}
      <section className="patient-appointment-card">
        <div className="patient-appointment-card-inner">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700/70">
              Lịch hẹn tiếp theo của bạn
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-800">
              <CalendarDays size={14} className="mr-1 inline-block -translate-y-px text-brand" />
              {upcomingAppointment.date}
            </p>
            <p className="text-base font-extrabold text-brand">
              {upcomingAppointment.time}
            </p>
            <div className="mt-1.5 space-y-0.5 text-xs text-slate-600">
              <p>
                <Stethoscope size={12} className="mr-1 inline-block -translate-y-px text-slate-400" />
                <span className="font-bold">{upcomingAppointment.doctor}</span>
                <span className="mx-1 text-slate-300">·</span>
                <span className="font-medium">{upcomingAppointment.specialty}</span>
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                <MapPin size={11} className="mr-0.5 inline-block -translate-y-px" />
                {upcomingAppointment.location}
              </p>
            </div>
          </div>
          <div className="hidden items-center justify-center sm:flex">
            <div className="patient-appointment-illustration">
              <CalendarDays size={32} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* ── KHỐI 2 — Quick Actions ── */}
      <section>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            className="patient-quick-action"
            onClick={() => onNavigate('consultation')}
          >
            <span className="patient-quick-action-icon bg-violet-50 text-violet-600">
              <MessageCircle size={22} strokeWidth={1.8} />
            </span>
            <span className="patient-quick-action-label">Tư vấn Y tế</span>
            <span className="patient-quick-action-hint">AI Chatbot & Bác sĩ</span>
          </button>
          <button
            type="button"
            className="patient-quick-action"
            onClick={() => onNavigate('appointments')}
          >
            <span className="patient-quick-action-icon bg-sky-50 text-sky-600">
              <CalendarDays size={22} strokeWidth={1.8} />
            </span>
            <span className="patient-quick-action-label">Lịch hẹn của tôi</span>
            <span className="patient-quick-action-hint">Quản lý & Đặt lịch mới</span>
          </button>
          <button
            type="button"
            className="patient-quick-action"
            onClick={() => onNavigate('health-records')}
          >
            <span className="patient-quick-action-icon bg-emerald-50 text-emerald-600">
              <FolderHeart size={22} strokeWidth={1.8} />
            </span>
            <span className="patient-quick-action-label">Hồ sơ bệnh án</span>
            <span className="patient-quick-action-hint">Tra cứu lịch sử khám</span>
          </button>
        </div>
      </section>

      {/* ── KHỐI 3 — Chuyên khoa phổ biến ── */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Chuyên khoa phổ biến</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-bold text-brand transition hover:text-[#1f7fb9]"
            onClick={() => onNavigate('appointments')}
          >
            Xem tất cả
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {popularSpecialties.map((spec) => {
            const Icon = spec.icon;
            return (
              <button
                key={spec.id}
                type="button"
                className="patient-specialty-card"
                onClick={() => onNavigate('appointments')}
              >
                <span className={`patient-specialty-icon ${spec.bgColor} ${spec.color}`}>
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="mt-1.5 text-xs font-bold text-slate-700">{spec.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── KHỐI 4 — Cẩm nang y tế ── */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Cẩm nang y tế &amp; Sức khỏe</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-bold text-brand transition hover:text-[#1f7fb9]"
            onClick={() => onNavigate('articles')}
          >
            Xem thêm
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {healthArticles.map((article) => (
            <article key={article.id} className="patient-article-card">
              <div className="patient-article-cover">
                <img
                  src={article.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-[11px] font-bold text-brand">{article.category}</p>
                <h3 className="patient-article-title">{article.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
