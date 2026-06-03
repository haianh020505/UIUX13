import { CalendarDays, ClipboardList, FileUser, LayoutDashboard, MessageCircle, UserRound } from 'lucide-react';
import { mockAppointments, mockConsultationRequests, mockLabResults, mockPatients } from '../../data/clinicMock';
import type { Appointment, ConsultationRequest, DoctorModuleItem, LabResult, Patient } from './types';

export const doctorModules: DoctorModuleItem[] = [
  { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { id: 'appointments', label: 'Quản lý lịch khám', icon: CalendarDays },
  { id: 'records', label: 'Hồ sơ bệnh nhân', icon: FileUser },
  { id: 'orders', label: 'Chỉ định & Kê đơn', icon: ClipboardList },
  { id: 'consultation', label: 'Tư vấn trực tiếp', icon: MessageCircle },
  { id: 'account', label: 'Tài khoản', icon: UserRound },
];

export const patients: Patient[] = mockPatients.map((patient) => ({
  code: patient.code,
  name: patient.name,
  gender: patient.gender,
  age: getAge(patient.birthDate),
  phone: patient.phone,
  address: patient.address,
  diagnosis: patient.diagnosis,
  doctor: patient.doctor,
  allergy: patient.allergy,
  history: patient.history,
  family: patient.family,
  medication: patient.medication,
  blood: patient.blood,
  height: patient.height,
  weight: patient.weight,
  bmi: patient.bmi,
  visits: patient.visits.map((visit) => ({
    date: visit.date,
    department: visit.department,
    doctor: visit.doctor,
    reason: visit.reason,
    diagnosis: visit.diagnosis,
    prescriptions: visit.prescriptions,
    labServices: mockLabResults
      .filter((result) => result.patientCode === patient.code && result.visitDate === visit.date)
      .map((result) => result.title),
  })),
}));

export const initialAppointments: Appointment[] = mockAppointments.map((appointment) => ({
  ...appointment,
  status: appointment.status as Appointment['status'],
  riskLevel: appointment.riskLevel as Appointment['riskLevel'],
}));

export const labResults: LabResult[] = mockLabResults.map((result) => ({
  ...result,
  category: result.category as LabResult['category'],
  status: result.status as LabResult['status'],
}));

export const consultationRequests: ConsultationRequest[] = mockConsultationRequests.map((request) => ({
  ...request,
  urgency: request.urgency as ConsultationRequest['urgency'],
}));

export function getPatient(code: string) {
  return patients.find((patient) => patient.code === code) ?? patients[0];
}

function getAge(birthDate: string) {
  const year = Number(birthDate.split('/')[2]);
  return Number.isFinite(year) ? 2026 - year : 0;
}
