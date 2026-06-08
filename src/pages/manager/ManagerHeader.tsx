import { CircleUserRound, LogOut, Menu } from 'lucide-react';
import NotificationBell, { type NotificationItem } from '../../components/common/NotificationBell';
import StatusBar from '../../components/common/StatusBar';
import type { OperationStatus } from './types';

export default function ManagerHeader({
  onOpenMenu,
  onNotificationClick,
  onLogout,
  onOpenAccount,
  activeLabel,
  operationStatus,
}: {
  onOpenMenu: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onLogout: () => void;
  onOpenAccount: () => void;
  activeLabel: string;
  operationStatus: OperationStatus;
}) {
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
  const isOpen = operationStatus === 'Mở cửa hoạt động';
  const statusDetail = isOpen ? undefined : operationStatus;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:px-6">
      <button type="button" onClick={onOpenMenu} className="icon-button lg:hidden" aria-label="Mở menu">
        <Menu size={18} />
      </button>
      <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
        <StatusBar isOpen={isOpen} openTime="08:00" closeTime="17:30" currentDate={today} detail={statusDetail} />
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
