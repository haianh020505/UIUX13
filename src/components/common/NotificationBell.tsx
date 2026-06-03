import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

export type NotificationItem = {
  id: NotificationTarget;
  title: string;
  description: string;
  time: string;
  tone: string;
  targetLabel: string;
  patientId?: string;
  targetPath?: string;
  targetTab?: string;
};

const defaultNotifications: NotificationItem[] = [
  {
    id: 'new-appointments',
    title: 'Có 3 lịch khám chờ xác nhận',
    description: 'Nguyễn Duy Cương và 2 bệnh nhân khác cần xác nhận trong khung 09:00 - 10:00',
    time: '5 phút trước',
    tone: 'bg-sky-100 text-sky-600',
    targetLabel: 'Quản lý lịch khám',
  },
  {
    id: 'staff-shortage',
    title: 'Thiếu bác sĩ ca chiều',
    description: 'BS. Trần Văn C xin nghỉ đột xuất, cần điều phối người thay thế trước 13:30',
    time: '18 phút trước',
    tone: 'bg-amber-100 text-amber-600',
    targetLabel: 'Lịch trực & Điều phối',
  },
  {
    id: 'review-reply',
    title: 'Đánh giá cần phản hồi',
    description: 'Bệnh nhân Nguyễn Thị Hoa phản ánh thời gian chờ',
    time: '35 phút trước',
    tone: 'bg-rose-100 text-rose-600',
    targetLabel: 'Đánh giá từ bệnh nhân',
  },
  {
    id: 'patient-record-update',
    title: 'Hồ sơ bệnh nhân vừa cập nhật',
    description: 'BN. Lê Tuấn Anh có thay đổi thông tin liên hệ khẩn cấp',
    time: '48 phút trước',
    tone: 'bg-emerald-100 text-emerald-600',
    targetLabel: 'Hồ sơ bệnh nhân',
  },
  {
    id: 'notification-failed',
    title: 'Có 1 thông báo gửi thất bại',
    description: 'Nguyễn Thị C chưa nhận được email kết quả xét nghiệm',
    time: '1 giờ trước',
    tone: 'bg-red-100 text-red-600',
    targetLabel: 'Thông báo & Nhắc lịch',
  },
  {
    id: 'report-ready',
    title: 'Báo cáo tháng đã sẵn sàng',
    description: 'Dữ liệu doanh thu tháng 05/2026 đã được tổng hợp',
    time: '2 giờ trước',
    tone: 'bg-indigo-100 text-indigo-600',
    targetLabel: 'Báo cáo & Thống kê',
  },
];

export type NotificationTarget =
  | 'new-appointments'
  | 'staff-shortage'
  | 'review-reply'
  | 'patient-record-update'
  | 'notification-failed'
  | 'report-ready'
  | 'doctor-lab-new'
  | 'doctor-triage-risk'
  | 'doctor-consultation'
  | 'doctor-record-updated';

export default function NotificationBell({
  notifications = defaultNotifications,
  onNotificationClick,
}: {
  notifications?: NotificationItem[];
  onNotificationClick?: (notification: NotificationItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<NotificationTarget[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-500 shadow-sm transition hover:border-brand hover:text-brand ${
          open ? 'border-brand text-brand ring-4 ring-brand/10' : 'border-slate-200'
        }`}
        aria-label="Thông báo"
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-30 w-[320px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Thông báo</h3>
              <p className="text-xs font-semibold text-slate-400">{unreadCount === 0 ? 'Không còn mục mới chưa đọc' : `${unreadCount} mục mới cần xử lý`}</p>
            </div>
            <button type="button" onClick={() => setReadNotificationIds(notifications.map((item) => item.id))} className="text-xs font-extrabold text-brand transition hover:text-[#1f7fb9]">
              Đánh dấu đã đọc tất cả
            </button>
          </div>
          <div className="max-h-72 divide-y divide-slate-100 overflow-y-scroll">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`flex w-full gap-2.5 px-3 py-2.5 text-left transition hover:bg-slate-50 focus:bg-sky-50 focus:outline-none ${
                  readNotificationIds.includes(item.id) ? 'bg-slate-50/50 opacity-75' : ''
                }`}
                onClick={() => {
                  setReadNotificationIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
                  onNotificationClick?.(item);
                  setOpen(false);
                }}
              >
                <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                  <Bell size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold text-slate-800">{item.title}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{item.description}</span>
                  <span className="mt-1 block text-xs font-extrabold text-brand">{item.targetLabel}</span>
                  <span className="mt-1 block text-xs font-bold text-slate-400">{item.time}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
