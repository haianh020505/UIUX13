import type { ElementType } from 'react';

export type DoctorModule = 'dashboard' | 'appointments' | 'records' | 'orders' | 'consultation' | 'account';
export type DoctorView = 'dashboard' | 'appointments' | 'exam' | 'records' | 'recordDetail' | 'orders' | 'consultation' | 'account';
export type AppointmentStatus = 'Đã khám' | 'Đang chờ' | 'Đang khám' | 'Sắp đến' | 'Đang chờ KQ';

export type DoctorModuleItem = {
  id: DoctorModule;
  label: string;
  icon: ElementType;
};

export type Patient = {
  code: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  address: string;
  diagnosis: string;
  doctor: string;
  allergy: string;
  history: string[];
  family: string;
  medication: string;
  blood: string;
  height: string;
  weight: string;
  bmi: string;
  visits: Array<{ date: string; department: string; doctor: string; reason: string; diagnosis: string }>;
};

export type Appointment = {
  id: string;
  time: string;
  patientCode: string;
  summary: string;
  note: string;
  status: AppointmentStatus;
};

export type LabResult = {
  patientCode: string;
  title: string;
  description: string;
  status: 'Mới' | '5p trước' | 'Đang chờ KQ';
};
