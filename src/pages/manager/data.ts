import { BarChart3, Bell, Building2, CalendarDays, FileUser, LayoutDashboard, UserRound, Contact, UserCog } from 'lucide-react';
import type { ClinicTab, ShiftFilterId, ShiftRow } from './types';

export const managerMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clinic', label: 'Quản lý phòng khám', icon: Building2 },
  { id: 'schedule', label: 'Quản lý lịch khám', icon: CalendarDays },
  { id: 'records', label: 'Hồ sơ bệnh nhân', icon: FileUser },
  { id: 'personnel', label: 'Hồ sơ nhân sự', icon: Contact },
  { id: 'staff', label: 'Lịch trực & Điều phối', icon: UserCog },
  { id: 'notifications', label: 'Thông báo & Nhắc lịch', icon: Bell },
  { id: 'reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
  { id: 'account', label: 'Tài khoản', icon: UserRound },
];

export const clinicTabs: Array<{ id: ClinicTab; label: string }> = [
  { id: 'info', label: 'Thông tin cơ sở' },
  { id: 'specialties', label: 'Danh mục chuyên khoa' },
  { id: 'services', label: 'Dịch vụ khám' },
  { id: 'reviews', label: 'Đánh giá từ bệnh nhân' },
];

export const shiftRows: ShiftRow[] = [
  { name: 'BS. Nguyễn Văn A', role: 'doctor', specialty: 'Tai Mũi Họng', shift: 'Ca Sáng (08:00 - 12:00)', room: 'Phòng 102', status: 'Đang trực' },
  { name: 'BS. Trần Văn C', role: 'doctor', specialty: 'Nội Tiêu hóa', shift: 'Cả ngày (08:00 - 17:00)', room: 'Phòng 201', status: 'Đang trực' },
  { name: 'BS. Lê B', role: 'doctor', specialty: 'Nội Hô hấp', shift: 'Ca Chiều (13:00 - 17:00)', room: 'Phòng 205', status: 'Chưa đến ca' },
  { name: 'Y tá. Nguyễn Thị M', role: 'nurse', specialty: 'Lễ tân & Điều phối', shift: 'Cả ngày (08:00 - 17:00)', room: 'Quầy Tiếp Đón 1', status: 'Đang trực' },
];

export const shiftFilters: Array<{ id: ShiftFilterId; label: string; predicate: (row: ShiftRow) => boolean }> = [
  { id: 'active', label: 'Đang trực', predicate: (row) => row.status === 'Đang trực' },
  { id: 'pending', label: 'Chưa đến ca', predicate: (row) => row.status === 'Chưa đến ca' },
  { id: 'morning', label: 'Ca sáng', predicate: (row) => row.shift.includes('Sáng') },
  { id: 'afternoon', label: 'Ca chiều', predicate: (row) => row.shift.includes('Chiều') },
  { id: 'fullDay', label: 'Cả ngày', predicate: (row) => row.shift.includes('Cả ngày') },
  { id: 'doctor', label: 'Bác sĩ', predicate: (row) => row.role === 'doctor' },
  { id: 'nurse', label: 'Y tá', predicate: (row) => row.role === 'nurse' },
];
