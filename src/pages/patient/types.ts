import type { ElementType } from 'react';

export type PatientPage = 'dashboard' | 'consultation' | 'appointments' | 'health-records' | 'articles' | 'account' | 'ai-chat' | 'booking';

export type PatientMenuItem = {
  id: PatientPage;
  label: string;
  icon: ElementType;
};

export type UpcomingAppointment = {
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  location: string;
};

export type Specialty = {
  id: string;
  name: string;
  icon: ElementType;
  color: string;
  bgColor: string;
};

export type HealthArticle = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  content: string[];
  author: string;
  readTime: string;
  publishedAt: string;
};

/* ── Appointment Module Types ── */

export type AppointmentStatus = 'upcoming' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';

export type AppointmentData = {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  location: string;
  reason: string;
  status: AppointmentStatus;
};

export type SpecialtyOption = {
  id: string;
  icon: string;
  name: string;
  doctorCount: number;
};

export type DoctorOption = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  tags: string[];
  price: string;
  rating: string;
  ratingCount: number;
  location: string;
};

export type TimeSlotStatus = 'available' | 'booked';

export type TimeSlot = {
  time: string;
  status: TimeSlotStatus;
};

export type DoctorDateOption = {
  label: string;
  value: string;
  dayOfWeek: string;
  dayMonth: string;
  slots: TimeSlot[];
};

export type DoctorSchedule = {
  doctorId: string;
  dates: DoctorDateOption[];
};

export type BookingContext = {
  isReschedule: boolean;
  fromAppointment: AppointmentData | null;
  source?: 'ai-triage' | 'manual' | 'appointment-history';
  prefilledSpecialty?: string;
  prefilledDoctor?: string;
  prefilledReason?: string;
  startStep?: 1 | 2 | 3;
};
