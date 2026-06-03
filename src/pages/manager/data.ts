import { BarChart3, Bell, Building2, CalendarDays, FileUser, LayoutDashboard, UserRound, Contact, UserCog } from 'lucide-react';
import type { ClinicTab, ShiftRoleFilterId, ShiftRow } from './types';

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

/**
 * Danh sách phân công ca trực hôm nay — Dashboard.
 * Tên nhân sự liên kết với danh sách chuẩn trong PersonnelManagement & StaffCoordinationManagement.
 * Ca trực thống nhất: Ca Sáng / Ca Chiều / Ca Tối / Cả ngày.
 * Chuyên khoa thống nhất: Tai Mũi Họng, Nội Tổng Hợp, Nội Tiêu Hóa, Hô Hấp, Nhi Khoa.
 */
export const shiftRows: ShiftRow[] = [
  // === Bác sĩ (8 người đang trực theo thống kê) ===
  { name: 'BS. Nguyễn Duy Cương',    role: 'doctor',       specialty: 'Tai Mũi Họng',       shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Phòng 102',       status: 'Đi muộn' },
  { name: 'BS. Lê Nguyễn Công Minh',  role: 'doctor',       specialty: 'Nội Tổng Hợp',       shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Phòng 201',       status: 'Đang trực' },
  { name: 'BS. Hoàng Minh Khang',     role: 'doctor',       specialty: 'Tai Mũi Họng',       shift: 'Cả ngày (08:00 - 17:00)', room: 'Phòng 305',       status: 'Đang trực' },
  { name: 'BS. Đặng Minh Quân',       role: 'doctor',       specialty: 'Nhi Khoa',            shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Phòng 118',       status: 'Đang trực' },
  { name: 'BS. Phạm Minh D',          role: 'doctor',       specialty: 'Nội Tổng Hợp',       shift: 'Ca Chiều (13:00 - 17:00)', room: 'Phòng 201',       status: 'Đang trực' },
  { name: 'BS. Nguyễn Thu Hương',     role: 'doctor',       specialty: 'Nhi Khoa',            shift: 'Ca Chiều (13:00 - 17:00)', room: 'Phòng 118',       status: 'Đang trực' },
  { name: 'BS. Trần Văn C',           role: 'doctor',       specialty: 'Nhi Khoa',            shift: 'Ca Tối (18:00 - 22:00)',   room: 'Phòng 205',       status: 'Chưa đến ca' },
  { name: 'BS. Vũ Hải Nam',           role: 'doctor',       specialty: 'Nội Tổng Hợp',       shift: 'Ca Chiều (13:00 - 17:00)', room: 'Phòng 301',       status: 'Nghỉ phép' },

  // === Điều dưỡng & Y tá (liên kết với 12 trong thống kê) ===
  { name: 'ĐD. Mai Thu Hằng',         role: 'nurse',        specialty: 'Nhi Khoa',            shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Phòng tiêm 01',  status: 'Vắng mặt' },
  { name: 'ĐD. Trần Bảo Ngọc',       role: 'nurse',        specialty: 'Tai Mũi Họng',       shift: 'Ca Chiều (13:00 - 17:00)', room: 'Phòng thủ thuật 03', status: 'Chưa đến ca' },
  { name: 'ĐD. Lê Phương Mai',        role: 'nurse',        specialty: 'Nội Tổng Hợp',       shift: 'Cả ngày (08:00 - 17:00)', room: 'Khu theo dõi A2', status: 'Đang trực' },
  { name: 'ĐD. Hồ Minh Tâm',         role: 'nurse',        specialty: 'Lễ tân & Điều phối', shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Quầy hướng dẫn', status: 'Đang trực' },

  // === Kỹ thuật viên ===
  { name: 'KTV. Phạm Anh Khoa',       role: 'technician',   specialty: 'Không áp dụng',       shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Phòng Siêu âm B1', status: 'Chưa đến ca' },
  { name: 'KTV. Nguyễn Đức Huy',      role: 'technician',   specialty: 'Không áp dụng',       shift: 'Cả ngày (08:00 - 17:00)', room: 'Phòng X-Quang',  status: 'Đang trực' },

  // === Lễ tân ===
  { name: 'LT. Phạm Quỳnh Anh',      role: 'receptionist', specialty: 'Lễ tân & Điều phối', shift: 'Ca Sáng (08:00 - 12:00)',  room: 'Quầy Tiếp Đón 1', status: 'Đi muộn' },
  { name: 'LT. Nguyễn Hoài An',       role: 'receptionist', specialty: 'Lễ tân & Điều phối', shift: 'Ca Chiều (13:00 - 17:00)', room: 'Quầy Tiếp Đón 2', status: 'Đang trực' },
];

export const shiftRoleFilters: Array<{ id: ShiftRoleFilterId; label: string }> = [
  { id: 'all', label: 'Tất cả vai trò' },
  { id: 'doctor', label: 'Bác sĩ' },
  { id: 'nurse', label: 'Điều dưỡng' },
  { id: 'technician', label: 'Kỹ thuật viên' },
  { id: 'receptionist', label: 'Lễ tân' },
];
