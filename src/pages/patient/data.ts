import {
  LayoutDashboard,
  MessageCircle,
  CalendarDays,
  FolderHeart,
  UserRound,
  Heart,
  Baby,
  Ear,
  Newspaper,
  Stethoscope,
} from 'lucide-react';
import type { HealthArticle, PatientMenuItem, Specialty, UpcomingAppointment, AppointmentData, SpecialtyOption, DoctorOption, DoctorSchedule } from './types';
import type { NotificationItem } from '../../components/common/NotificationBell';

/* ── Sidebar Menu ── */
export const patientMenu: PatientMenuItem[] = [
  { id: 'dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { id: 'consultation', label: 'Tư vấn Y tế', icon: MessageCircle },
  { id: 'appointments', label: 'Lịch hẹn của tôi', icon: CalendarDays },
  { id: 'health-records', label: 'Hồ sơ sức khỏe', icon: FolderHeart },
  { id: 'account', label: 'Tài khoản', icon: UserRound },
];

/* ── Upcoming Appointment ── */
export const upcomingAppointment: UpcomingAppointment = {
  date: 'Thứ Năm, 05/06/2026',
  time: '09:00 – 09:30',
  doctor: 'BS. Nguyễn Văn A',
  specialty: 'Tai Mũi Họng',
  location: 'Fakeeh Care Group — Phòng 203, Tầng 2',
};

/* ── Popular Specialties ── */
export const popularSpecialties: Specialty[] = [
  { id: 'cardiology', name: 'Tim mạch', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'pediatrics', name: 'Nhi khoa', icon: Baby, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  { id: 'ent', name: 'Tai Mũi Họng', icon: Ear, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'gastro', name: 'Tiêu hóa', icon: Stethoscope, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

/* ── Health Articles ── */
export const healthArticles: HealthArticle[] = [
  {
    id: 'art-1',
    title: '5 dấu hiệu cảnh báo bệnh tim mà bạn không nên bỏ qua',
    category: 'Tim mạch',
    imageUrl: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=225&fit=crop',
  },
  {
    id: 'art-2',
    title: 'Hướng dẫn chăm sóc trẻ bị sốt tại nhà an toàn và hiệu quả',
    category: 'Nhi khoa',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=225&fit=crop',
  },
  {
    id: 'art-3',
    title: 'Viêm xoang mãn tính: Nguyên nhân và phương pháp điều trị mới',
    category: 'Tai Mũi Họng',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=225&fit=crop',
  },
  {
    id: 'art-4',
    title: 'Chế độ ăn uống lành mạnh cho người bệnh dạ dày trào ngược',
    category: 'Tiêu hóa',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=225&fit=crop',
  },
];

/* ── Notifications for Patient ── */
export const patientNotifications: NotificationItem[] = [
  {
    id: 'patient-appointment-confirmed',
    title: 'Lịch hẹn đã được xác nhận',
    description: 'Lịch khám ngày 05/06/2026 lúc 09:00 với BS. Nguyễn Văn A đã được phòng khám xác nhận.',
    time: '2 giờ trước',
    tone: 'bg-emerald-100 text-emerald-600',
    targetLabel: 'Đặt lịch khám',
  },
  {
    id: 'patient-appointment-reminder',
    title: 'Nhắc lịch khám ngày mai',
    description: 'Bạn có lịch hẹn vào 09:00 ngày 05/06 tại Fakeeh Care Group. Hãy đến trước 15 phút.',
    time: '5 giờ trước',
    tone: 'bg-amber-100 text-amber-600',
    targetLabel: 'Đặt lịch khám',
  },
  {
    id: 'patient-lab-result',
    title: 'Kết quả xét nghiệm đã có',
    description: 'Kết quả xét nghiệm máu ngày 28/05 đã được cập nhật vào hồ sơ sức khỏe.',
    time: '1 ngày trước',
    tone: 'bg-sky-100 text-sky-600',
    targetLabel: 'Hồ sơ sức khỏe',
  },
  {
    id: 'patient-medication-reminder',
    title: 'Nhắc uống thuốc',
    description: 'Đã đến giờ uống Amoxicillin 500mg (1 viên sau bữa ăn sáng).',
    time: '30 phút trước',
    tone: 'bg-violet-100 text-violet-600',
    targetLabel: 'Hồ sơ sức khỏe',
  },
];

/* ══════════════════════════════════════════════════════════
   APPOINTMENT MODULE — MOCK DATA
   ══════════════════════════════════════════════════════════ */

/* ── Appointments ── */
export const initialAppointments: AppointmentData[] = [
  /* TAB 1 — Sắp tới */
  {
    id: 'appt-1',
    date: '10/06/2026',
    time: '09:00 – 09:30',
    doctor: 'TS.BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    location: 'Phòng khám 201 – Tầng 2',
    reason: 'Tái khám sau tư vấn online',
    status: 'upcoming',
  },
  {
    id: 'appt-2',
    date: '15/06/2026',
    time: '14:00 – 14:30',
    doctor: 'BS.CKI. Trần Thị Bình',
    specialty: 'Nội tổng quát',
    location: 'Phòng khám 105 – Tầng 1',
    reason: 'Kiểm tra kết quả xét nghiệm máu',
    status: 'upcoming',
  },
  /* TAB 2 — Chờ xác nhận */
  {
    id: 'appt-3',
    date: '12/06/2026',
    time: '10:30 – 11:00',
    doctor: 'PGS.TS. Lê Minh Tuấn',
    specialty: 'Tim mạch',
    location: 'Phòng khám 301 – Tầng 3',
    reason: 'Khó thở, tức ngực tái phát',
    status: 'pending',
  },
  {
    id: 'appt-4',
    date: '18/06/2026',
    time: '08:00 – 08:30',
    doctor: 'BS.CKI. Phạm Anh Khoa',
    specialty: 'Da liễu',
    location: 'Phòng khám 203 – Tầng 2',
    reason: 'Nổi mẩn đỏ vùng cánh tay',
    status: 'pending',
  },
  /* TAB 3 — Lịch sử khám */
  {
    id: 'appt-5',
    date: '20/05/2026',
    time: '14:00 – 14:30',
    doctor: 'TS.BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    location: 'Phòng khám 201 – Tầng 2',
    reason: 'Ho, đau họng kéo dài',
    status: 'completed',
  },
  {
    id: 'appt-6',
    date: '08/05/2026',
    time: '09:15 – 09:45',
    doctor: 'BS.CKI. Trần Thị Bình',
    specialty: 'Nội tổng quát',
    location: 'Phòng khám 105 – Tầng 1',
    reason: 'Sốt kéo dài, nghi sốt xuất huyết',
    status: 'completed',
  },
  {
    id: 'appt-7',
    date: '01/04/2026',
    time: '11:00 – 11:30',
    doctor: 'PGS.TS. Lê Minh Tuấn',
    specialty: 'Tim mạch',
    location: 'Phòng khám 301 – Tầng 3',
    reason: 'Khó thở, tức ngực',
    status: 'cancelled',
  },
];

/* ── Specialty Options (Wizard Step 1) ── */
export const specialtyOptions: SpecialtyOption[] = [
  { id: 'sp-general', icon: '🏥', name: 'Nội tổng quát', doctorCount: 8 },
  { id: 'sp-ent', icon: '👂', name: 'Tai Mũi Họng', doctorCount: 5 },
  { id: 'sp-cardio', icon: '❤️', name: 'Tim mạch', doctorCount: 4 },
  { id: 'sp-dental', icon: '🦷', name: 'Răng Hàm Mặt', doctorCount: 6 },
  { id: 'sp-derma', icon: '🧴', name: 'Da liễu', doctorCount: 3 },
  { id: 'sp-ortho', icon: '🦴', name: 'Cơ xương khớp', doctorCount: 4 },
];

/* ── Doctor Options (Wizard Step 2 — demo for Tai Mũi Họng) ── */
export const doctorOptions: DoctorOption[] = [
  {
    id: 'doc-1',
    name: 'TS.BS. Nguyễn Văn A',
    specialty: 'Tai Mũi Họng',
    experience: '12 năm kinh nghiệm',
    tags: ['Viêm xoang', 'Ung thư vòm họng', 'Nội soi TMH'],
    price: '350.000đ / lượt',
    rating: '4.9',
    ratingCount: 128,
    location: 'Phòng khám 201 – Tầng 2',
  },
  {
    id: 'doc-2',
    name: 'BS.CKI. Hoàng Thị Mai',
    specialty: 'Tai Mũi Họng',
    experience: '7 năm kinh nghiệm',
    tags: ['Dị ứng mũi', 'Viêm tai giữa', 'Khàn giọng'],
    price: '250.000đ / lượt',
    rating: '4.7',
    ratingCount: 84,
    location: 'Phòng khám 105 – Tầng 1',
  },
  {
    id: 'doc-3',
    name: 'BS. Trần Quốc Bảo',
    specialty: 'Tai Mũi Họng',
    experience: '4 năm kinh nghiệm',
    tags: ['Viêm họng', 'Amidan', 'Trẻ em'],
    price: '180.000đ / lượt',
    rating: '4.5',
    ratingCount: 41,
    location: 'Phòng khám 302 – Tầng 3',
  },
];

/* ── Per-Doctor Schedules (Wizard Step 2 — horizontal date scroller + slots) ── */
export const doctorSchedules: DoctorSchedule[] = [
  {
    doctorId: 'doc-1',
    dates: [
      {
        label: 'Thứ 3 – 03/06', value: '03/06/2026', dayOfWeek: 'T3', dayMonth: '03/06',
        slots: [
          { time: '08:30 – 09:00', status: 'available' },
          { time: '09:00 – 09:30', status: 'booked' },
          { time: '09:30 – 10:00', status: 'available' },
          { time: '10:00 – 10:30', status: 'available' },
          { time: '14:00 – 14:30', status: 'booked' },
          { time: '14:30 – 15:00', status: 'available' },
          { time: '15:00 – 15:30', status: 'available' },
        ],
      },
      {
        label: 'Thứ 4 – 04/06', value: '04/06/2026', dayOfWeek: 'T4', dayMonth: '04/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '09:00 – 09:30', status: 'available' },
          { time: '10:00 – 10:30', status: 'booked' },
          { time: '14:00 – 14:30', status: 'available' },
        ],
      },
      {
        label: 'Thứ 5 – 05/06', value: '05/06/2026', dayOfWeek: 'T5', dayMonth: '05/06',
        slots: [
          { time: '08:30 – 09:00', status: 'booked' },
          { time: '09:30 – 10:00', status: 'available' },
          { time: '14:30 – 15:00', status: 'available' },
        ],
      },
      { label: 'Thứ 6 – 06/06', value: '06/06/2026', dayOfWeek: 'T6', dayMonth: '06/06', slots: [] },
      {
        label: 'Thứ 7 – 07/06', value: '07/06/2026', dayOfWeek: 'T7', dayMonth: '07/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '09:00 – 09:30', status: 'available' },
        ],
      },
      { label: 'CN – 08/06', value: '08/06/2026', dayOfWeek: 'CN', dayMonth: '08/06', slots: [] },
      {
        label: 'Thứ 2 – 09/06', value: '09/06/2026', dayOfWeek: 'T2', dayMonth: '09/06',
        slots: [
          { time: '08:30 – 09:00', status: 'available' },
          { time: '10:00 – 10:30', status: 'available' },
          { time: '14:00 – 14:30', status: 'available' },
          { time: '15:00 – 15:30', status: 'booked' },
        ],
      },
    ],
  },
  {
    doctorId: 'doc-2',
    dates: [
      {
        label: 'Thứ 3 – 03/06', value: '03/06/2026', dayOfWeek: 'T3', dayMonth: '03/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '08:30 – 09:00', status: 'booked' },
          { time: '09:30 – 10:00', status: 'available' },
          { time: '10:30 – 11:00', status: 'available' },
          { time: '13:30 – 14:00', status: 'booked' },
          { time: '15:00 – 15:30', status: 'available' },
        ],
      },
      {
        label: 'Thứ 4 – 04/06', value: '04/06/2026', dayOfWeek: 'T4', dayMonth: '04/06',
        slots: [
          { time: '08:00 – 08:30', status: 'booked' },
          { time: '09:00 – 09:30', status: 'available' },
          { time: '10:00 – 10:30', status: 'available' },
          { time: '14:00 – 14:30', status: 'available' },
          { time: '15:00 – 15:30', status: 'booked' },
        ],
      },
      { label: 'Thứ 5 – 05/06', value: '05/06/2026', dayOfWeek: 'T5', dayMonth: '05/06', slots: [] },
      {
        label: 'Thứ 6 – 06/06', value: '06/06/2026', dayOfWeek: 'T6', dayMonth: '06/06',
        slots: [
          { time: '09:00 – 09:30', status: 'available' },
          { time: '14:00 – 14:30', status: 'available' },
          { time: '15:30 – 16:00', status: 'available' },
        ],
      },
      {
        label: 'Thứ 7 – 07/06', value: '07/06/2026', dayOfWeek: 'T7', dayMonth: '07/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '09:30 – 10:00', status: 'booked' },
        ],
      },
      { label: 'CN – 08/06', value: '08/06/2026', dayOfWeek: 'CN', dayMonth: '08/06', slots: [] },
      {
        label: 'Thứ 2 – 09/06', value: '09/06/2026', dayOfWeek: 'T2', dayMonth: '09/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '10:00 – 10:30', status: 'available' },
        ],
      },
    ],
  },
  {
    doctorId: 'doc-3',
    dates: [
      {
        label: 'Thứ 3 – 03/06', value: '03/06/2026', dayOfWeek: 'T3', dayMonth: '03/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '09:00 – 09:30', status: 'available' },
          { time: '10:00 – 10:30', status: 'booked' },
          { time: '14:00 – 14:30', status: 'available' },
          { time: '14:30 – 15:00', status: 'available' },
        ],
      },
      { label: 'Thứ 4 – 04/06', value: '04/06/2026', dayOfWeek: 'T4', dayMonth: '04/06', slots: [] },
      {
        label: 'Thứ 5 – 05/06', value: '05/06/2026', dayOfWeek: 'T5', dayMonth: '05/06',
        slots: [
          { time: '08:00 – 08:30', status: 'available' },
          { time: '09:30 – 10:00', status: 'booked' },
          { time: '14:00 – 14:30', status: 'available' },
        ],
      },
      {
        label: 'Thứ 6 – 06/06', value: '06/06/2026', dayOfWeek: 'T6', dayMonth: '06/06',
        slots: [
          { time: '09:00 – 09:30', status: 'available' },
          { time: '10:30 – 11:00', status: 'available' },
        ],
      },
      { label: 'Thứ 7 – 07/06', value: '07/06/2026', dayOfWeek: 'T7', dayMonth: '07/06', slots: [] },
      { label: 'CN – 08/06', value: '08/06/2026', dayOfWeek: 'CN', dayMonth: '08/06', slots: [] },
      {
        label: 'Thứ 2 – 09/06', value: '09/06/2026', dayOfWeek: 'T2', dayMonth: '09/06',
        slots: [
          { time: '08:30 – 09:00', status: 'available' },
          { time: '14:00 – 14:30', status: 'available' },
          { time: '15:00 – 15:30', status: 'available' },
        ],
      },
    ],
  },
];
