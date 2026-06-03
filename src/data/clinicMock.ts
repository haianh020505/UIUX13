export type MockVisit = {
  date: string;
  department: string;
  doctor: string;
  reason: string;
  diagnosis: string;
  prescriptions?: Array<{ name: string; quantity: string; usage: string }>;
  note?: string;
};

export type MockPatient = {
  code: string;
  name: string;
  birthDate: string;
  gender: 'Nam' | 'Nữ';
  phone: string;
  nationalId: string;
  insuranceId: string;
  address: string;
  emergencyContact: string;
  specialty: string;
  doctor: string;
  diagnosis: string;
  allergy: string;
  history: string[];
  family: string;
  medication: string;
  blood: string;
  height: string;
  weight: string;
  bmi: string;
  visits: MockVisit[];
};

export type MockStaff = {
  id: string;
  name: string;
  role: 'Bác sĩ' | 'Điều dưỡng' | 'Kỹ thuật viên' | 'Lễ tân';
  specialty: string;
  phone: string;
  email: string;
};

const firstVisitDates = ['18/05/2026', '12/05/2026', '10/05/2026', '08/05/2026', '02/05/2026', '21/04/2026', '22/05/2026'];
const secondVisitDates = ['12/03/2026', '20/02/2026', '18/01/2026', '05/01/2026', '18/12/2025'];

export const mockPatients: MockPatient[] = [
  createPatient('PA-015', 'Trần Đình C.', '11/09/1974', 'Nam', '0904.555.666', 'Đống Đa, Hà Nội', 'Tai Mũi Họng', 'BS. Lê C', 'J01.9 - Viêm xoang cấp', 'Dị ứng kháng sinh nhóm Penicillin', ['Hen suyễn', 'Viêm xoang mạn tính'], 'Mẹ: Hen phế quản.', 'Salbutamol dạng xịt khi khó thở.', 'B+', '168 cm', '72 kg', '25.5', 'Sốt cao, khó thở nhẹ'),
  createPatient('PA-016', 'Nguyễn Duy Cường', '04/03/1987', 'Nam', '0912.345.678', 'Ba Đình, Hà Nội', 'Nội Tổng Hợp', 'BS. Lê Nguyễn Công Minh', 'I10 - Tăng huyết áp vô căn', 'Không ghi nhận dị ứng thuốc.', ['Tăng huyết áp độ 1'], 'Bố: Tăng huyết áp.', 'Losartan 50mg mỗi sáng.', 'O+', '170 cm', '78 kg', '27.0', 'Đau đầu nhẹ và tăng huyết áp'),
  createPatient('PA-017', 'Mai Thu Hằng', '18/07/1992', 'Nữ', '0966.777.888', 'Tây Hồ, Hà Nội', 'Nội Tiêu Hóa', 'BS. Trần Văn A', 'K30 - Khó tiêu chức năng', 'Dị ứng hải sản nhẹ.', ['Viêm dạ dày mạn'], 'Chưa ghi nhận bệnh lý di truyền.', 'Esomeprazole 20mg khi đau thượng vị.', 'A+', '160 cm', '50 kg', '19.5', 'Đầy bụng sau ăn'),
  createPatient('PA-018', 'Phạm Thu Trang', '21/10/1992', 'Nữ', '0912.222.333', 'Thanh Xuân, Hà Nội', 'Tai Mũi Họng', 'BS. Nguyễn Văn A', 'J03.9 - Viêm amidan cấp', 'Không ghi nhận dị ứng thuốc.', ['Viêm amidan tái phát'], 'Chưa ghi nhận bệnh lý di truyền.', 'Chưa dùng thuốc định kỳ.', 'AB+', '158 cm', '52 kg', '20.8', 'Đau họng, nuốt đau'),
  createPatient('PA-019', 'Lê Nguyễn Công Minh', '15/08/1998', 'Nam', '0988.123.456', 'Cầu Giấy, Hà Nội', 'Tai Mũi Họng', 'BS. Nguyễn Văn A', 'J02.9 - Viêm họng cấp', 'Không ghi nhận dị ứng thuốc.', ['Viêm mũi dị ứng theo mùa'], 'Chưa ghi nhận bệnh lý di truyền.', 'Cetirizine 10mg khi có triệu chứng dị ứng.', 'A+', '175 cm', '70 kg', '22.8', 'Ù tai, có dịch mủ tai trái'),
  createPatient('PA-020', 'Nguyễn Thị Hoa', '20/04/1981', 'Nữ', '0988.123.456', 'Hai Bà Trưng, Hà Nội', 'Tai Mũi Họng', 'BS. Nguyễn Văn A', 'H66.0 - Viêm tai giữa', 'Dị ứng Penicillin (Nổi mẩn đỏ)', ['Trào ngược dạ dày thực quản (GERD)', 'Viêm phế quản mạn tính'], 'Bố: Cao huyết áp.', 'Omeprazole 20mg trước ăn sáng.', 'O+', '162 cm', '58 kg', '22.1', 'Đau rát họng, ho khan'),
  createPatient('PA-021', 'Đỗ Minh Khôi', '12/11/2018', 'Nam', '0904.111.222', 'Hai Bà Trưng, Hà Nội', 'Nhi Khoa', 'BS. Trần Văn C', 'J06.9 - Viêm hô hấp trên', 'Không ghi nhận dị ứng thuốc.', ['Viêm tiểu phế quản lúc nhỏ'], 'Mẹ: Viêm mũi dị ứng.', 'Chưa dùng thuốc định kỳ.', 'O+', '126 cm', '25 kg', '15.7', 'Sốt nhẹ, ho về đêm'),
  createPatient('PA-022', 'Đỗ Minh Anh', '03/09/2019', 'Nữ', '0977.888.999', 'Long Biên, Hà Nội', 'Nhi Khoa', 'BS. Đặng Minh Quân', 'H65.0 - Viêm tai giữa thanh dịch', 'Dị ứng Ibuprofen', ['Viêm tai giữa tái diễn'], 'Mẹ: Viêm mũi dị ứng.', 'Chưa dùng thuốc định kỳ.', 'O+', '124 cm', '24 kg', '15.6', 'Đau tai, quấy khóc'),
  createPatient('PA-023', 'Nguyễn Minh Khang', '22/06/2016', 'Nam', '0981.555.777', 'Bách Khoa, Hà Nội', 'Nhi Khoa', 'BS. Nguyễn Thu Hương', 'J00 - Viêm mũi họng cấp', 'Không ghi nhận dị ứng thuốc.', ['Viêm mũi họng tái phát'], 'Chưa ghi nhận bệnh lý di truyền.', 'Rửa mũi nước muối khi nghẹt mũi.', 'A+', '132 cm', '29 kg', '16.7', 'Ho và chảy mũi'),
  createPatient('PA-024', 'Vũ Hải Nam', '09/02/1985', 'Nam', '0901.444.555', 'Hoàn Kiếm, Hà Nội', 'Tai Mũi Họng', 'BS. Nguyễn Văn A', 'R04.0 - Chảy máu mũi', 'Không ghi nhận dị ứng thuốc.', ['Tăng huyết áp nhẹ'], 'Bố: Tăng huyết áp.', 'Amlodipine 5mg mỗi sáng.', 'A+', '172 cm', '76 kg', '25.7', 'Chảy máu mũi tái phát'),
  createPatient('PA-025', 'Đặng Mỹ Linh', '09/02/1990', 'Nữ', '0936.888.999', 'Kim Ngưu, Hà Nội', 'Nội Tiêu Hóa', 'BS. Lê Nguyễn Công Minh', 'K21.0 - Trào ngược dạ dày', 'Không ghi nhận dị ứng thuốc.', ['Đau dạ dày tái phát'], 'Mẹ: Đái tháo đường type 2.', 'Gaviscon khi ợ nóng.', 'B+', '164 cm', '54 kg', '20.1', 'Đau thượng vị và ợ nóng'),
  createPatient('PA-026', 'Hoàng Minh Khang', '12/12/1979', 'Nam', '0977.654.321', 'Nam Từ Liêm, Hà Nội', 'Hô Hấp', 'BS. Phạm H', 'J20.9 - Viêm phế quản cấp', 'Dị ứng bụi nhà.', ['Viêm phế quản mạn'], 'Bố: COPD.', 'Budesonide dạng hít khi cần.', 'O-', '173 cm', '68 kg', '22.7', 'Ho kéo dài và khò khè'),
];

export const mockStaff: MockStaff[] = [
  { id: 'ST-001', name: 'BS. Nguyễn Duy Cương', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0912.345.678', email: 'cuongnd@fakeeh.care' },
  { id: 'ST-045', name: 'Điều dưỡng Nguyễn Nhật Linh', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0988.123.456', email: 'linhnn@fakeeh.care' },
  { id: 'ST-052', name: 'BS. Trần Văn C', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0904.555.666', email: 'tranc@fakeeh.care' },
  { id: 'ST-060', name: 'BS. Lê Nguyễn Công Minh', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0908.888.222', email: 'minhlnc@fakeeh.care' },
  { id: 'ST-077', name: 'KTV. Phạm Anh Khoa', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0933.123.222', email: 'khoapa@fakeeh.care' },
  { id: 'ST-083', name: 'BS. Hoàng Minh Khang', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0977.654.321', email: 'khanghm@fakeeh.care' },
  { id: 'ST-091', name: 'ĐD. Mai Thu Hằng', role: 'Điều dưỡng', specialty: 'Nhi Khoa', phone: '0966.777.888', email: 'hangmt@fakeeh.care' },
  { id: 'ST-104', name: 'LT. Phạm Quỳnh Anh', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0945.888.999', email: 'anhpq@fakeeh.care' },
  { id: 'ST-118', name: 'BS. Vũ Hải Nam', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0932.222.111', email: 'namvh@fakeeh.care' },
  { id: 'ST-126', name: 'KTV. Nguyễn Đức Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0921.555.777', email: 'huynd@fakeeh.care' },
];

export const mockAppointments = mockPatients.map((patient, index) => ({
  id: `apt-${index + 1}`,
  time: buildTimeSlot(index),
  patientCode: patient.code,
  summary: patient.visits[0].reason,
  note: patient.allergy,
  status: index % 7 === 0 ? 'Đã khám' : index % 5 === 0 ? 'Đang khám' : 'Đang chờ',
  triageFlag: index % 4 === 0,
  waitMinutes: (index * 5) % 28,
  riskLevel: index % 4 === 0 ? (index % 8 === 0 ? 'Khẩn cấp' : 'Cần xem sớm') : undefined,
  riskReason: index % 4 === 0 ? 'Triệu chứng cần bác sĩ đánh giá sớm' : undefined,
  startedAt: index % 5 === 0 ? buildStartedAt(index) : undefined,
}));

export const mockConsultationRequests = mockPatients.slice(0, 8).map((patient, index) => ({
  patientCode: patient.code,
  title: index % 3 === 0 ? 'Cần tư vấn sau chatbot' : patient.visits[0].reason,
  summary: `Bệnh nhân hỏi thêm về ${patient.diagnosis.toLocaleLowerCase('vi-VN')}.`,
  timeLabel: `${5 + index * 6} phút trước`,
  urgency: index % 4 === 0 ? 'Khẩn cấp' : 'Bình thường',
}));

const labCategoryPool = ['Nội soi', 'Xét nghiệm', 'X-quang', 'Siêu âm'] as const;
const labTitleByCategory = {
  'Nội soi': 'Nội soi Tai Mũi Họng ống mềm',
  'Xét nghiệm': 'Xét nghiệm máu cơ bản',
  'X-quang': 'X-quang ngực thẳng',
  'Siêu âm': 'Siêu âm ổ bụng tổng quát',
} as const;
const labDescriptionByCategory = {
  'Nội soi': 'Hình ảnh niêm mạc phù nề nhẹ, chưa thấy tổn thương ác tính.',
  'Xét nghiệm': 'Các chỉ số huyết học chính trong ngưỡng theo dõi.',
  'X-quang': 'Phim chụp không ghi nhận tổn thương cấp tính rõ.',
  'Siêu âm': 'Cấu trúc khảo sát chưa ghi nhận bất thường đáng kể.',
} as const;

export const mockLabResults = mockPatients.flatMap((patient, patientIndex) =>
  patient.visits.slice(0, 2).map((visit, visitIndex) => {
    const category = labCategoryPool[(patientIndex + visitIndex) % labCategoryPool.length];
    return {
      id: `lab-${patient.code.toLowerCase()}-${visit.date.replace(/\//g, '')}-${visitIndex + 1}`,
      patientCode: patient.code,
      visitDate: visit.date,
      category,
      title: labTitleByCategory[category],
      description: labDescriptionByCategory[category],
      status: patientIndex % 6 === 0 ? 'Đang chờ KQ' : patientIndex % 4 === 0 ? 'Mới' : 'Đã xem',
      timeLabel: patientIndex % 4 === 0 ? `${patientIndex + 2} phút trước` : visit.date,
      performedAt: `${visit.date} ${String(8 + (patientIndex % 6)).padStart(2, '0')}:${visitIndex ? '35' : '10'}`,
      department: category === 'Xét nghiệm' ? 'Khoa Xét nghiệm' : category === 'X-quang' || category === 'Siêu âm' ? 'Khoa Chẩn đoán hình ảnh' : visit.department,
      doctor: visit.doctor,
      summary: `${labTitleByCategory[category]} hỗ trợ đánh giá ${patient.diagnosis}.`,
      findings: [
        'Thông số chính trong ngưỡng theo dõi.',
        'Không ghi nhận dấu hiệu nguy cơ tức thời.',
        `Đối chiếu lâm sàng với chẩn đoán ${patient.diagnosis}.`,
      ],
      conclusion: patientIndex % 6 === 0 ? 'Đang chờ kết luận chính thức từ phòng cận lâm sàng.' : `Kết quả phù hợp với hướng chẩn đoán ${patient.diagnosis}.`,
      imageLabel: `${category.toUpperCase()}-${patient.code}`,
    };
  }),
);

function createPatient(
  code: string,
  name: string,
  birthDate: string,
  gender: 'Nam' | 'Nữ',
  phone: string,
  address: string,
  specialty: string,
  doctor: string,
  diagnosis: string,
  allergy: string,
  history: string[],
  family: string,
  medication: string,
  blood: string,
  height: string,
  weight: string,
  bmi: string,
  reason: string,
): MockPatient {
  const firstVisitDate = firstVisitDates[Number(code.replace('PA-', '')) % firstVisitDates.length];
  return {
    code,
    name,
    birthDate,
    gender,
    phone,
    nationalId: `001${birthDate.slice(-4)}${code.replace('PA-', '').padStart(6, '0')}`,
    insuranceId: `HN401${code.replace('PA-', '').padStart(9, '0')}`,
    address,
    emergencyContact: `${name.split(' ').slice(-1)[0]} Gia đình - SĐT: ${phone}`,
    specialty,
    doctor,
    diagnosis,
    allergy,
    history,
    family,
    medication,
    blood,
    height,
    weight,
    bmi,
    visits: [
      {
        date: firstVisitDate,
        department: specialty === 'Tai Mũi Họng' ? 'Khoa Tai Mũi Họng' : specialty,
        doctor,
        reason,
        diagnosis,
        prescriptions: [
          { name: 'Paracetamol 500mg', quantity: '10 viên', usage: 'Uống 1 viên khi sốt hoặc đau.' },
          { name: 'Vitamin C 500mg', quantity: '10 viên', usage: 'Uống 1 viên mỗi sáng sau ăn.' },
        ],
        note: 'Theo dõi triệu chứng và tái khám khi cần.',
      },
      {
        date: secondVisitDates[Number(code.replace('PA-', '')) % secondVisitDates.length],
        department: specialty === 'Tai Mũi Họng' ? 'Khoa Tai Mũi Họng' : specialty,
        doctor,
        reason: 'Tái khám và kiểm tra đáp ứng điều trị',
        diagnosis,
        prescriptions: [
          { name: 'Cetirizine 10mg', quantity: '7 viên', usage: 'Uống 1 viên buổi tối khi có triệu chứng.' },
        ],
      },
    ],
  };
}

function buildTimeSlot(index: number) {
  const hour = 8 + Math.floor(index / 2);
  const startMinute = index % 2 === 0 ? '00' : '30';
  const endMinute = index % 2 === 0 ? '30' : '00';
  const endHour = index % 2 === 0 ? hour : hour + 1;
  return `${String(hour).padStart(2, '0')}:${startMinute} - ${String(endHour).padStart(2, '0')}:${endMinute}`;
}

function buildStartedAt(index: number) {
  const hour = 8 + Math.floor(index / 2);
  return `${String(hour).padStart(2, '0')}:${index % 2 === 0 ? '05' : '38'}`;
}
