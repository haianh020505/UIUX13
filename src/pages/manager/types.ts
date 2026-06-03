export type ClinicTab = 'info' | 'specialties' | 'services' | 'reviews';
export type ManagerPage = 'dashboard' | 'clinic' | 'schedule' | 'records' | 'personnel' | 'staff' | 'notifications' | 'reports' | 'account';
export type ShiftRoleFilterId = 'all' | 'doctor' | 'nurse' | 'technician' | 'receptionist';
export type ShiftStatus = 'Vắng mặt' | 'Đi muộn' | 'Chưa đến ca' | 'Đang trực' | 'Nghỉ phép';

export type ShiftRow = {
  name: string;
  role: 'doctor' | 'nurse' | 'technician' | 'receptionist';
  specialty: string;
  shift: string;
  room: string;
  status: ShiftStatus;
};
