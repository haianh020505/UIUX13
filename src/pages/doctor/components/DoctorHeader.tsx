import { CircleUserRound, LogOut, Menu } from 'lucide-react';
import NotificationBell, { type NotificationItem } from '../../../components/common/NotificationBell';
import StatusBar from '../../../components/common/StatusBar';

const doctorNotifications: NotificationItem[] = [
  {
    id: 'doctor-lab-new',
    title: 'Có kết quả CLS mới',
    description: 'Nguyễn Thị Hoa (PA-020) đã có kết quả nội soi Tai Mũi Họng cần xem.',
    time: '5 phút trước',
    tone: 'bg-sky-100 text-sky-600',
    targetLabel: 'Kết quả cận lâm sàng',
    patientId: 'PA-020',
    targetPath: '/emr',
    targetTab: 'lab-results',
  },
  {
    id: 'doctor-triage-risk',
    title: 'Bệnh nhân nguy cơ cao đang chờ',
    description: 'Lê Nguyễn Công Minh có cảnh báo triage trong hàng chờ khám.',
    time: '12 phút trước',
    tone: 'bg-rose-100 text-rose-600',
    targetLabel: 'Danh sách chờ khám',
    targetPath: '/dashboard',
  },
  {
    id: 'doctor-consultation',
    title: 'Có yêu cầu tư vấn mới',
    description: 'Bệnh nhân gửi câu hỏi về triệu chứng ù tai và chóng mặt sau khám.',
    time: '28 phút trước',
    tone: 'bg-amber-100 text-amber-600',
    targetLabel: 'Tư vấn trực tiếp',
    targetPath: '/consultation',
  },
  {
    id: 'doctor-record-updated',
    title: 'Hồ sơ bệnh nhân vừa cập nhật',
    description: 'PA-015 được bổ sung tiền sử hen suyễn và dị ứng thuốc.',
    time: '45 phút trước',
    tone: 'bg-emerald-100 text-emerald-600',
    targetLabel: 'Hồ sơ bệnh nhân',
    patientId: 'PA-015',
    targetPath: '/emr',
    targetTab: 'visits',
  },
];

export default function DoctorHeader({
  title,
  onOpenMenu,
  onNotificationClick,
  onLogout,
  onOpenAccount,
}: {
  title: string;
  onOpenMenu: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
  onLogout: () => void;
  onOpenAccount: () => void;
}) {
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:px-6">
      <button type="button" onClick={onOpenMenu} className="icon-button cursor-pointer active:scale-95 lg:hidden" aria-label="Mở menu">
        <Menu size={18} />
      </button>
      <div className="hidden min-w-0 items-center gap-2.5 lg:flex">
        <StatusBar isOpen openTime="08:00" closeTime="17:30" currentDate={today} detail="Khoa Tai Mũi Họng · Phòng 203" />
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <NotificationBell notifications={doctorNotifications} onNotificationClick={onNotificationClick} />
        <button
          type="button"
          onClick={onOpenAccount}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:border-brand/40 hover:bg-sky-50 active:scale-[0.99]"
          aria-label="Mở tài khoản bác sĩ"
          title="Mở tài khoản"
        >
          <CircleUserRound className="text-slate-400" size={26} />
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold text-slate-800">BS. Nguyễn Văn A</p>
            <p className="text-xs font-semibold text-slate-400">{title}</p>
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
