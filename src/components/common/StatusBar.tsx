import { CalendarDays } from 'lucide-react';

export default function StatusBar({
  isOpen,
  openTime,
  closeTime,
  currentDate,
  detail,
}: {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  currentDate: string;
  detail?: string;
}) {
  return (
    <div className="status-bar">
      <span className={`status-dot ${isOpen ? 'status-dot--open' : 'status-dot--closed'}`} />
      <span className="status-label">{isOpen ? 'ĐANG VẬN HÀNH' : 'ĐÓNG CỬA'}</span>
      {isOpen ? (
        <span className="status-time">Mở cửa {openTime} - {closeTime}</span>
      ) : detail ? null : (
        <span className="status-time">Ngoài giờ tiếp nhận</span>
      )}
      {detail ? <span className="status-detail">{detail}</span> : null}
      <span className="status-divider">|</span>
      <CalendarDays size={14} />
      <span className="status-date">HÔM NAY</span>
      <span className="status-divider">|</span>
      <span className="status-date">{currentDate}</span>
    </div>
  );
}
