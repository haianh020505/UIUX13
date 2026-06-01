import { CalendarDays, CircleUserRound, Menu } from 'lucide-react';
import NotificationBell, { type NotificationTarget } from '../../components/common/NotificationBell';

export default function ManagerHeader({ onOpenMenu, onNotificationClick }: { onOpenMenu: () => void; onNotificationClick: (target: NotificationTarget) => void }) {
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-7 lg:px-10">
      <button type="button" onClick={onOpenMenu} className="icon-button lg:hidden" aria-label="Mở menu">
        <Menu size={20} />
      </button>
      <div className="hidden min-w-0 items-center gap-3 lg:flex">
        <div className="flex h-11 items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase text-emerald-600">Đang vận hành</p>
            <p className="text-xs font-semibold text-emerald-700">Mở cửa 08:00 - 17:30</p>
          </div>
        </div>
        <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
          <CalendarDays size={18} className="text-brand" />
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">Hôm nay</p>
            <p className="text-xs font-semibold capitalize text-slate-700">{today}</p>
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell onNotificationClick={onNotificationClick} />
        <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm">
          <CircleUserRound className="text-slate-400" size={32} />
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold text-slate-800">Admin</p>
            <p className="text-xs font-semibold text-slate-400">Quản lý phòng khám</p>
          </div>
        </div>
      </div>
    </header>
  );
}
