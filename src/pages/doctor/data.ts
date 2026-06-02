import { CalendarDays, ClipboardList, FileUser, LayoutDashboard, MessageCircle, UserRound } from 'lucide-react';
import type { Appointment, DoctorModuleItem, LabResult, Patient } from './types';

export const doctorModules: DoctorModuleItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'appointments', label: 'Lịch khám trong ngày', icon: CalendarDays },
  { id: 'records', label: 'Hồ sơ bệnh nhân', icon: FileUser },
  { id: 'orders', label: 'Chỉ định & Kê đơn', icon: ClipboardList },
  { id: 'consultation', label: 'Tư vấn trực tiếp', icon: MessageCircle },
  { id: 'account', label: 'Tài khoản', icon: UserRound },
];

export const patients: Patient[] = [
  {
    code: 'PA-020',
    name: 'Nguyễn Thị Hoa',
    gender: 'Nữ',
    age: 45,
    phone: '0988.123.456',
    address: 'Hai Bà Trưng, Hà Nội',
    diagnosis: 'H66.0 - Viêm tai giữa',
    doctor: 'BS. Nguyễn Văn A',
    allergy: 'Dị ứng Penicillin (Nổi mẩn đỏ)',
    history: ['Trào ngược dạ dày thực quản (GERD)', 'Viêm phế quản mạn tính'],
    family: 'Bố: Cao huyết áp.',
    medication: 'Omeprazole 20mg, uống 1 viên trước ăn sáng 30 phút.',
    blood: 'O+',
    height: '162 cm',
    weight: '58 kg',
    bmi: '22.1',
    visits: [
      { date: '10/05/2026', department: 'Khoa Tai Mũi Họng', doctor: 'BS. Nguyễn Văn A', reason: 'Đau rát họng, ho khan', diagnosis: 'H66.0 - Viêm tai giữa' },
      { date: '12/03/2026', department: 'Khoa Nội Tiêu Hóa', doctor: 'BS. Trần Văn A', reason: 'Đau thượng vị, ợ chua', diagnosis: 'K21.0 - Trào ngược dạ dày thực quản' },
    ],
  },
  {
    code: 'PA-019',
    name: 'Lê Nguyễn Công Minh',
    gender: 'Nam',
    age: 28,
    phone: '0988.123.456',
    address: 'Cầu Giấy, Hà Nội',
    diagnosis: 'J02.9 - Viêm họng cấp',
    doctor: 'BS. Nguyễn Văn A',
    allergy: 'Không ghi nhận dị ứng thuốc.',
    history: ['Viêm mũi dị ứng theo mùa'],
    family: 'Chưa ghi nhận bệnh lý di truyền.',
    medication: 'Cetirizine 10mg khi có triệu chứng dị ứng.',
    blood: 'A+',
    height: '175 cm',
    weight: '70 kg',
    bmi: '22.8',
    visits: [
      { date: '10/05/2026', department: 'Khoa Tai Mũi Họng', doctor: 'BS. Nguyễn Văn A', reason: 'Ù tai, có dịch mủ tai trái', diagnosis: 'J02.9 - Viêm họng cấp' },
      { date: '18/01/2026', department: 'Khoa Tai Mũi Họng', doctor: 'BS. Nguyễn Văn A', reason: 'Nghẹt mũi kéo dài', diagnosis: 'J30.9 - Viêm mũi dị ứng' },
    ],
  },
  {
    code: 'PA-015',
    name: 'Trần Đình C.',
    gender: 'Nam',
    age: 52,
    phone: '0904.555.666',
    address: 'Đống Đa, Hà Nội',
    diagnosis: 'J01.9 - Viêm xoang cấp',
    doctor: 'BS. Lê C',
    allergy: 'Dị ứng kháng sinh nhóm Penicillin',
    history: ['Hen suyễn', 'Viêm xoang mạn tính'],
    family: 'Mẹ: Hen phế quản.',
    medication: 'Salbutamol dạng xịt khi khó thở.',
    blood: 'B+',
    height: '168 cm',
    weight: '72 kg',
    bmi: '25.5',
    visits: [
      { date: '02/05/2026', department: 'Khoa Tai Mũi Họng', doctor: 'BS. Lê C', reason: 'Sốt cao, khó thở nhẹ', diagnosis: 'J01.9 - Viêm xoang cấp' },
      { date: '20/02/2026', department: 'Khoa Hô Hấp', doctor: 'BS. Phạm H', reason: 'Khò khè về đêm', diagnosis: 'J45.9 - Hen suyễn' },
    ],
  },
];

export const initialAppointments: Appointment[] = [
  { id: 'apt-1', time: '08:00 - 08:30', patientCode: 'PA-020', summary: 'Đau rát họng, ho khan 3 ngày', note: 'Chưa dùng thuốc gì.', status: 'Đã khám' },
  { id: 'apt-2', time: '08:30 - 09:00', patientCode: 'PA-019', summary: 'Ù tai trái kéo dài kèm dịch mủ, đau tăng khi nuốt và xoay đầu. Bệnh nhân báo hơi chóng mặt từng cơn, nghe kém hơn từ tối qua. Có sốt nhẹ, mệt mỏi, ăn uống kém và đã tự dùng thuốc giảm đau nhưng đáp ứng không rõ.', note: 'Kèm theo hơi chóng mặt.', status: 'Đang chờ' },
  { id: 'apt-3', time: '09:00 - 09:30', patientCode: 'PA-015', summary: 'Sốt cao 39 độ, khó thở nhẹ', note: 'Có tiền sử hen suyễn.', status: 'Đang chờ' },
];

export const labResults: LabResult[] = [
  { patientCode: 'PA-020', title: 'Nội soi Tai Mũi Họng ống mềm', description: 'Niêm mạc phù nề, dịch tai giữa còn mủ.', status: 'Mới' },
  { patientCode: 'PA-019', title: 'Xét nghiệm máu cơ bản', description: 'Các chỉ số trong ngưỡng cho phép.', status: '5p trước' },
  { patientCode: 'PA-015', title: 'X-quang ngực thẳng', description: 'Đang chờ kết quả từ phòng CLS.', status: 'Đang chờ KQ' },
];

export function getPatient(code: string) {
  return patients.find((patient) => patient.code === code) ?? patients[0];
}
