import { CalendarDays, CircleUserRound, LogOut, Menu } from 'lucide-react';
import NotificationBell, { type NotificationItem } from '../../components/common/NotificationBell';

export default function ManagerHeader({
  onOpenMenu,
  onNotificationClick,
  onLogout,
  onOpenAccount,
  activeLabel,
}: {
  onOpenMenu: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onLogout: () => void;
  onOpenAccount: () => void;
  activeLabel: string;
}) {
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:px-6">
      <button type="button" onClick={onOpenMenu} className="icon-button lg:hidden" aria-label="Mở menu">
        <Menu size={18} />
      </button>
      <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase text-emerald-600">Đang vận hành</p>
            <p className="text-xs font-semibold text-emerald-700">Mở cửa 08:00 - 17:30</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <CalendarDays size={16} className="text-brand" />
          <div>
            <p className="text-xs font-extrabold uppercase text-slate-400">Hôm nay</p>
            <p className="text-xs font-semibold capitalize text-slate-700">{today}</p>
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <NotificationBell onNotificationClick={onNotificationClick} />
        <button
          type="button"
          onClick={onOpenAccount}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:border-brand/40 hover:bg-sky-50 active:scale-[0.99]"
          aria-label="Mở tài khoản quản lý"
          title="Mở tài khoản"
        >
          <CircleUserRound className="text-slate-400" size={26} />
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold text-slate-800">Admin</p>
            <p className="text-xs font-semibold text-slate-400">{activeLabel}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="icon-button hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
