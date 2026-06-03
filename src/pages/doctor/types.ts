import type { ElementType } from 'react';

export type DoctorModule = 'dashboard' | 'appointments' | 'records' | 'orders' | 'labResults' | 'consultation' | 'account';
export type DoctorView = 'dashboard' | 'appointments' | 'exam' | 'records' | 'recordDetail' | 'orders' | 'labResults' | 'consultation' | 'account';
export type AppointmentStatus = 'Đã khám' | 'Đang chờ' | 'Đang khám';

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
  visits: VisitRecord[];
};

export type PrescriptionItem = {
  name: string;
  quantity: string;
  usage: string;
};

export type VisitRecord = {
  date: string;
  department: string;
  doctor: string;
  reason: string;
  diagnosis: string;
  prescriptions?: PrescriptionItem[];
  labServices?: string[];
};

export type SavedEmrEntry = {
  patientCode: string;
  visit: VisitRecord;
  labResults: LabResult[];
};

export type Appointment = {
  id: string;
  time: string;
  patientCode: string;
  summary: string;
  note: string;
  status: AppointmentStatus;
  triageFlag?: boolean;
  waitMinutes: number;
  riskLevel?: 'Khẩn cấp' | 'Cần xem sớm';
  riskReason?: string;
  startedAt?: string;
};

export type LabResult = {
  id: string;
  patientCode: string;
  visitDate: string;
  category: 'Xét nghiệm' | 'X-quang' | 'Nội soi' | 'Siêu âm';
  title: string;
  description: string;
  status: 'Mới' | 'Đang chờ KQ' | 'Đã xem';
  timeLabel: string;
  performedAt: string;
  department: string;
  doctor: string;
  summary: string;
  findings: string[];
  conclusion: string;
  imageLabel: string;
};

export type ConsultationRequest = {
  patientCode: string;
  title: string;
  summary: string;
  timeLabel: string;
  urgency: 'Khẩn cấp' | 'Bình thường';
};
