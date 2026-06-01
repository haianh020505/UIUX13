export type ClinicTab = 'info' | 'specialties' | 'services' | 'reviews';
export type ManagerPage = 'dashboard' | 'clinic' | 'schedule' | 'records' | 'personnel' | 'staff' | 'notifications' | 'reports' | 'account';
export type ShiftFilterId = 'active' | 'pending' | 'morning' | 'afternoon' | 'fullDay' | 'doctor' | 'nurse';

export type ShiftRow = {
  name: string;
  role: 'doctor' | 'nurse';
  specialty: string;
  shift: string;
  room: string;
  status: string;
};
