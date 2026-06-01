import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import ConfirmDialog from './components/ConfirmDialog';
import DateInput, { parseDisplayDate } from './components/DateInput';
import Field from './components/Field';

type RecordTab = 'profile' | 'visits' | 'chatbot';
type ChatResult = 'transferred' | 'self-care' | 'info-only';

type Visit = {
  date: string;
  specialty: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  note?: string;
};

type ChatSession = {
  id: string;
  date: string;
  time: string;
  symptom: string;
  result: ChatResult;
  resultText: string;
  appointment?: string;
  messages: Array<{ from: 'patient' | 'ai'; text: string }>;
};

type Patient = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  nationalId: string;
  insuranceId: string;
  address: string;
  emergencyContact: string;
  specialty: string;
  lastVisitDate: string;
  lastVisitSummary: string;
  lastDoctor: string;
  visits: Visit[];
  chats: ChatSession[];
};

const initialPatients: Patient[] = [
  {
    id: 'PA-019',
    name: 'Lê Tuấn Anh',
    birthDate: '15/08/1998',
    gender: 'Nam',
    phone: '0988.123.456',
    nationalId: '001201012345',
    insuranceId: 'DN401123456789',
    address: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
    emergencyContact: 'Lê Văn B (Bố) - SĐT: 0904.555.666',
    specialty: 'Tai Mũi Họng',
    lastVisitDate: '10/05/2026',
    lastVisitSummary: '10/05/2026 (Tai Mũi Họng)',
    lastDoctor: 'BS. Nguyễn B',
    visits: [
      {
        date: '12/03/2026',
        specialty: 'Nội Tiêu Hóa',
        doctor: 'BS. Trần Văn A',
        diagnosis: 'Trào ngược dạ dày thực quản (GERD)',
        prescription: 'Omeprazole 20mg x 30 viên; Đã thực hiện Nội soi dạ dày.',
        note: 'Khuyên bệnh nhân hạn chế đồ chua cay, hẹn tái khám sau 1 tháng.',
      },
      {
        date: '05/01/2025',
        specialty: 'Hô Hấp',
        doctor: 'BS. Lê C',
        diagnosis: 'Viêm phế quản cấp',
        prescription: 'Kháng sinh Augmentin 500mg x 10 viên; Chụp X-Quang lồng ngực.',
      },
    ],
    chats: [
      {
        id: 'CHAT-019-1',
        date: '10/05/2026',
        time: '08:15 AM',
        symptom: 'Đau rát họng, ho khan kéo dài 3 ngày. Không sốt.',
        result: 'transferred',
        resultText: 'Khám Tai Mũi Họng (Đã chuyển BS)',
        appointment: '09:00 - 09:30 (10/05/2026)',
        messages: [
          { from: 'patient', text: 'Tôi bị đau họng và ho khan khoảng 3 ngày.' },
          { from: 'ai', text: 'Bạn có sốt, khó thở hoặc dị ứng thuốc không?' },
          { from: 'patient', text: 'Không sốt, không khó thở, không dị ứng thuốc.' },
          { from: 'ai', text: 'Nên đặt lịch khám Tai Mũi Họng để bác sĩ kiểm tra trực tiếp.' },
        ],
      },
      {
        id: 'CHAT-019-2',
        date: '15/02/2026',
        time: '14:30 PM',
        symptom: 'Đau đầu nhẹ, mặt mỏi do thay đổi thời tiết.',
        result: 'self-care',
        resultText: 'Tự xử lý: Đã tư vấn hướng dẫn nghỉ ngơi.',
        messages: [
          { from: 'patient', text: 'Tôi đau đầu nhẹ từ sáng.' },
          { from: 'ai', text: 'Bạn nên nghỉ ngơi, uống đủ nước và theo dõi thêm. Nếu đau tăng, hãy đặt lịch khám.' },
        ],
      },
      {
        id: 'CHAT-019-3',
        date: '02/01/2026',
        time: '09:10 AM',
        symptom: 'Hỏi thông tin bảng giá nhổ răng khôn.',
        result: 'info-only',
        resultText: 'Cung cấp thông tin (Chưa đặt lịch).',
        messages: [
          { from: 'patient', text: 'Cho tôi hỏi giá nhổ răng khôn.' },
          { from: 'ai', text: 'Chi phí phụ thuộc tình trạng răng. Bạn có thể đặt lịch Răng Hàm Mặt để được tư vấn.' },
        ],
      },
    ],
  },
  {
    id: 'PA-020',
    name: 'Nguyễn Thị Hoa',
    birthDate: '20/04/1981',
    gender: 'Nữ',
    phone: '0912.345.678',
    nationalId: '001181045678',
    insuranceId: 'HN401987654321',
    address: '125 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội',
    emergencyContact: 'Nguyễn Văn H (Chồng) - SĐT: 0911.222.333',
    specialty: 'Nội Tổng Hợp',
    lastVisitDate: '02/04/2026',
    lastVisitSummary: '02/04/2026 (Nội Tổng Hợp)',
    lastDoctor: 'BS. Trần Văn A',
    visits: [
      {
        date: '02/04/2026',
        specialty: 'Nội Tổng Hợp',
        doctor: 'BS. Trần Văn A',
        diagnosis: 'Rối loạn tiêu hóa nhẹ',
        prescription: 'Men vi sinh 10 gói; Dặn dò ăn uống điều độ.',
        note: 'Theo dõi thêm nếu đau bụng kéo dài.',
      },
    ],
    chats: [
      {
        id: 'CHAT-020-1',
        date: '01/04/2026',
        time: '20:10 PM',
        symptom: 'Đau bụng âm ỉ, mệt mỏi trong 2 ngày.',
        result: 'transferred',
        resultText: 'Khám Nội Tổng Hợp (Đã chuyển BS)',
        appointment: '08:00 - 08:30 (02/04/2026)',
        messages: [
          { from: 'patient', text: 'Tôi bị đau bụng âm ỉ và hơi mệt.' },
          { from: 'ai', text: 'Bạn nên đặt lịch Nội Tổng Hợp nếu triệu chứng kéo dài trên 24 giờ.' },
        ],
      },
    ],
  },
  {
    id: 'PA-021',
    name: 'Đỗ Minh Khôi',
    birthDate: '12/11/2018',
    gender: 'Nam',
    phone: '0904.111.222',
    nationalId: '001218112233',
    insuranceId: 'TE401112233445',
    address: '36 Minh Khai, Hai Bà Trưng, Hà Nội',
    emergencyContact: 'Đỗ Văn Nam (Bố) - SĐT: 0986.111.222',
    specialty: 'Nhi Khoa',
    lastVisitDate: '11/05/2026',
    lastVisitSummary: '11/05/2026 (Nhi Khoa)',
    lastDoctor: 'BS. Trần Văn C',
    visits: [
      {
        date: '11/05/2026',
        specialty: 'Nhi Khoa',
        doctor: 'BS. Trần Văn C',
        diagnosis: 'Viêm đường hô hấp trên',
        prescription: 'Hạ sốt Paracetamol theo cân nặng; siro ho thảo dược 5 ngày.',
        note: 'Theo dõi nhiệt độ, tái khám nếu sốt cao kéo dài.',
      },
      {
        date: '18/12/2025',
        specialty: 'Nhi Khoa',
        doctor: 'BS. Nguyễn Thu Hương',
        diagnosis: 'Rối loạn tiêu hóa nhẹ',
        prescription: 'Men vi sinh 7 ngày; bù nước Oresol khi cần.',
      },
    ],
    chats: [
      {
        id: 'CHAT-021-1',
        date: '10/05/2026',
        time: '21:00 PM',
        symptom: 'Sốt nhẹ, ho về đêm.',
        result: 'transferred',
        resultText: 'Khám Nhi Khoa (Đã chuyển BS)',
        appointment: '08:30 - 09:00 (11/05/2026)',
        messages: [
          { from: 'patient', text: 'Bé sốt nhẹ và ho về đêm.' },
          { from: 'ai', text: 'Bé có khó thở, li bì hoặc bỏ bú không?' },
          { from: 'patient', text: 'Không khó thở, vẫn ăn được.' },
          { from: 'ai', text: 'Nên đặt lịch Nhi Khoa để bác sĩ kiểm tra trực tiếp.' },
        ],
      },
    ],
  },
  {
    id: 'PA-022',
    name: 'Trần Khánh Vy',
    birthDate: '03/09/1995',
    gender: 'Nữ',
    phone: '0968.222.333',
    nationalId: '001195098765',
    insuranceId: 'DN401445566778',
    address: '78 Nguyễn Du, Hai Bà Trưng, Hà Nội',
    emergencyContact: 'Trần Minh Quân (Anh trai) - SĐT: 0933.222.111',
    specialty: 'Nội Tổng Hợp',
    lastVisitDate: '12/05/2026',
    lastVisitSummary: '12/05/2026 (Nội Tổng Hợp)',
    lastDoctor: 'BS. Lê Nguyễn Công Minh',
    visits: [
      {
        date: '12/05/2026',
        specialty: 'Nội Tổng Hợp',
        doctor: 'BS. Lê Nguyễn Công Minh',
        diagnosis: 'Đau bụng chức năng, nghi rối loạn tiêu hóa',
        prescription: 'Men tiêu hóa 10 ngày; thuốc giảm co thắt khi đau.',
        note: 'Khuyến nghị ăn mềm, theo dõi nếu đau tăng hoặc sốt.',
      },
    ],
    chats: [
      {
        id: 'CHAT-022-1',
        date: '12/05/2026',
        time: '07:20 AM',
        symptom: 'Đau bụng âm ỉ, buồn nôn nhẹ.',
        result: 'transferred',
        resultText: 'Khám Nội Tổng Hợp (Đã chuyển BS)',
        appointment: '13:30 - 14:00 (12/05/2026)',
        messages: [
          { from: 'patient', text: 'Tôi đau bụng âm ỉ và hơi buồn nôn.' },
          { from: 'ai', text: 'Bạn có sốt hoặc nôn nhiều không?' },
          { from: 'patient', text: 'Không sốt, chỉ hơi mệt.' },
          { from: 'ai', text: 'Bạn nên khám Nội Tổng Hợp trong ngày để được đánh giá.' },
        ],
      },
    ],
  },
  {
    id: 'PA-023',
    name: 'Nguyễn Minh Khang',
    birthDate: '22/06/2016',
    gender: 'Nam',
    phone: '0981.555.777',
    nationalId: '001216067890',
    insuranceId: 'TE401998877665',
    address: '12 Lê Thanh Nghị, Bách Khoa, Hà Nội',
    emergencyContact: 'Nguyễn Thu Hà (Mẹ) - SĐT: 0916.777.888',
    specialty: 'Nhi Khoa',
    lastVisitDate: '20/05/2026',
    lastVisitSummary: '20/05/2026 (Nhi Khoa)',
    lastDoctor: 'BS. Nguyễn Thu Hương',
    visits: [
      {
        date: '20/05/2026',
        specialty: 'Nhi Khoa',
        doctor: 'BS. Nguyễn Thu Hương',
        diagnosis: 'Viêm mũi họng cấp',
        prescription: 'Rửa mũi nước muối sinh lý; thuốc ho 5 ngày.',
        note: 'Uống nhiều nước, tái khám nếu sốt hoặc khò khè.',
      },
    ],
    chats: [
      {
        id: 'CHAT-023-1',
        date: '19/05/2026',
        time: '19:45 PM',
        symptom: 'Ho và chảy mũi.',
        result: 'self-care',
        resultText: 'Tự xử lý: Hướng dẫn chăm sóc tại nhà.',
        messages: [
          { from: 'patient', text: 'Bé ho và chảy mũi từ hôm qua.' },
          { from: 'ai', text: 'Bạn có thể rửa mũi bằng nước muối, theo dõi sốt và đặt lịch nếu triệu chứng tăng.' },
        ],
      },
    ],
  },
  {
    id: 'PA-024',
    name: 'Đặng Mỹ Linh',
    birthDate: '09/02/1990',
    gender: 'Nữ',
    phone: '0936.888.999',
    nationalId: '001190022468',
    insuranceId: 'DN401665544332',
    address: '21 Kim Ngưu, Hai Bà Trưng, Hà Nội',
    emergencyContact: 'Đặng Văn Tùng (Chồng) - SĐT: 0902.333.444',
    specialty: 'Nội Tiêu Hóa',
    lastVisitDate: '22/05/2026',
    lastVisitSummary: '22/05/2026 (Nội Tiêu Hóa)',
    lastDoctor: 'BS. Lê Nguyễn Công Minh',
    visits: [
      {
        date: '22/05/2026',
        specialty: 'Nội Tiêu Hóa',
        doctor: 'BS. Lê Nguyễn Công Minh',
        diagnosis: 'Đau dạ dày tái phát',
        prescription: 'PPI 14 ngày; khuyến nghị xét nghiệm H. pylori.',
        note: 'Bệnh nhân hủy lịch gần nhất, cần gọi nhắc đặt lại.',
      },
    ],
    chats: [
      {
        id: 'CHAT-024-1',
        date: '21/05/2026',
        time: '22:05 PM',
        symptom: 'Đau dạ dày tái phát.',
        result: 'transferred',
        resultText: 'Khám Nội Tiêu Hóa (Đã chuyển BS)',
        appointment: '13:30 - 14:00 (22/05/2026)',
        messages: [
          { from: 'patient', text: 'Tôi bị đau dạ dày lại, hay ợ nóng.' },
          { from: 'ai', text: 'Bạn có nôn ra máu hoặc đi ngoài phân đen không?' },
          { from: 'patient', text: 'Không có, chỉ đau âm ỉ.' },
          { from: 'ai', text: 'Bạn nên đặt lịch Nội Tiêu Hóa để bác sĩ đánh giá và điều chỉnh thuốc.' },
        ],
      },
    ],
  },
];

const specialties = ['Tất cả chuyên khoa', 'Tai Mũi Họng', 'Nội Tổng Hợp', 'Nội Tiêu Hóa', 'Hô Hấp', 'Nhi Khoa'];
const chatTimeFilters = ['Tất cả thời gian', 'Năm 2026', 'Năm 2025'];
const chatResultFilters = ['Kết quả', 'Đã chuyển BS', 'Tự xử lý', 'Cung cấp thông tin'];
const genderOptions = ['Nam', 'Nữ', 'Khác'];

export default function PatientRecordsManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState(specialties[0]);
  const [sort, setSort] = useState('Lần khám gần nhất');
  const [confirmExport, setConfirmExport] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const selectedPatient = patients.find((patient) => patient.id === selectedId) ?? null;
  const filteredPatients = patients
    .filter((patient) => {
      const keyword = query.trim().toLowerCase();
      const matchesQuery = !keyword || [patient.id, patient.name, patient.phone].some((value) => value.toLowerCase().includes(keyword));
      const matchesSpecialty = specialty === specialties[0] || patient.specialty === specialty;
      return matchesQuery && matchesSpecialty;
    })
    .sort((a, b) => (sort === 'Tên A-Z' ? a.name.localeCompare(b.name, 'vi') : parseDisplayDate(b.lastVisitDate) - parseDisplayDate(a.lastVisitDate)));

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const pagedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);
  const pageStart = filteredPatients.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredPatients.length);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const updatePatient = (updated: Patient) => {
    setPatients((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  };

  if (selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        onBack={() => setSelectedId(null)}
        onSave={(updated) => {
          updatePatient(updated);
          onNotify?.('Đã lưu hồ sơ bệnh nhân');
          setSelectedId(null);
        }}
      />
    );
  }

  const exportRows = () => {
    const csv = ['Mã BN,Họ và Tên,SĐT,Giới tính,Chuyên khoa,Lần khám gần nhất'].concat(
      filteredPatients.map((patient) => [patient.id, patient.name, patient.phone, patient.gender, patient.specialty, patient.lastVisitSummary].join(',')),
    );
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ho-so-benh-nhan.csv';
    link.click();
    URL.revokeObjectURL(url);
    onNotify?.('Đã xuất file hồ sơ bệnh nhân');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">Hồ sơ bệnh nhân</h1>
      <section className="panel flex min-h-[620px] flex-col p-0">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(260px,1fr)_220px_190px]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="form-input pl-10"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Tên / SĐT / Mã bệnh nhân..."
              />
            </label>
            <SelectMenu
              value={specialty}
              options={specialties}
              onChange={(value) => {
                setSpecialty(value);
                setPage(1);
              }}
            />
            <SelectMenu
              value={sort}
              options={['Lần khám gần nhất', 'Tên A-Z']}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
          </div>
          <button type="button" onClick={() => setConfirmExport(true)} className="secondary-action min-w-32 whitespace-nowrap">
            <Download size={16} />
            Xuất File
          </button>
        </div>
        <div>
          <ResponsiveTable
            columns={['Mã BN', 'Họ và Tên', 'Thông tin chung', 'Lần khám gần nhất', 'Chi tiết']}
            rows={pagedPatients.map((patient) => [
              patient.id,
              <b>{patient.name}</b>,
              <span>
                SĐT: {patient.phone}
                <small className="block text-slate-400">
                  {patient.gender} | {getAge(patient.birthDate)} Tuổi
                </small>
              </span>,
              <span>
                {patient.lastVisitSummary}
                <small className="block text-slate-400">{patient.lastDoctor}</small>
              </span>,
              <button type="button" onClick={() => setSelectedId(patient.id)} className="filter-chip border-transparent bg-sky-50 text-brand">
                Xem
              </button>,
            ])}
          />
          {filteredPatients.length === 0 ? <div className="px-6 py-14 text-center text-sm font-semibold text-slate-400">Không tìm thấy hồ sơ phù hợp.</div> : null}
        </div>
        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            Hiển thị {pageStart} - {pageEnd} trên tổng số {filteredPatients.length} hồ sơ
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-bold transition ${
                  page === pageNumber ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-500 hover:bg-slate-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
      {confirmExport ? (
        <ConfirmDialog
          title="Xuất file hồ sơ?"
          message="Danh sách hồ sơ đang lọc sẽ được tải về dưới dạng CSV."
          confirmText="Xuất file"
          onCancel={() => setConfirmExport(false)}
          onConfirm={() => {
            exportRows();
            setConfirmExport(false);
          }}
        />
      ) : null}
    </div>
  );
}

function PatientDetail({ patient, onBack, onSave }: { patient: Patient; onBack: () => void; onSave: (patient: Patient) => void }) {
  const [activeTab, setActiveTab] = useState<RecordTab>('profile');

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm font-extrabold text-brand transition hover:text-[#1f7fb9]">
        <ArrowLeft size={18} />
        Quay lại danh sách
      </button>
      <p className="text-sm font-semibold text-slate-500">Hồ sơ bệnh nhân / Danh sách / Chi tiết</p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-800">BN. {patient.name} ({patient.id})</h1>
      <div className="mt-6 overflow-x-auto rounded-md border border-slate-200 bg-white">
        <div className="flex min-w-[560px]">
          {[
            ['profile', 'Thông tin cá nhân'],
            ['visits', 'Lịch sử khám bệnh'],
            ['chatbot', 'Lịch sử Chatbot'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as RecordTab)}
              className={`clinic-tab ${activeTab === id ? 'clinic-tab-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        {activeTab === 'profile' ? <ProfileTab patient={patient} onSave={onSave} /> : null}
        {activeTab === 'visits' ? <VisitsTab visits={patient.visits} /> : null}
        {activeTab === 'chatbot' ? <ChatbotTab chats={patient.chats} /> : null}
      </div>
    </div>
  );
}

function ProfileTab({ patient, onSave }: { patient: Patient; onSave: (patient: Patient) => void }) {
  const [form, setForm] = useState(patient);
  const [confirmSave, setConfirmSave] = useState(false);

  const updateField = (key: keyof Patient, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setConfirmSave(true);
  };

  return (
    <form onSubmit={submit} className="panel p-0">
      <div className="border-b border-slate-200 px-7 py-5">
        <h2 className="panel-title">Thông tin định danh</h2>
      </div>
      <div className="grid gap-6 p-7 lg:grid-cols-2">
        <Field label="Họ và Tên">
          <input className="form-input" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
        </Field>
        <Field label="Ngày sinh">
          <DateInput value={form.birthDate} onChange={(value) => updateField('birthDate', value)} />
        </Field>
        <Field label="Giới tính">
          <SelectMenu value={form.gender} options={genderOptions} onChange={(value) => updateField('gender', value)} />
        </Field>
        <Field label="Số điện thoại">
          <input className="form-input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
        </Field>
        <Field label="Số CMND / CCCD">
          <input className="form-input" value={form.nationalId} onChange={(event) => updateField('nationalId', event.target.value)} />
        </Field>
        <Field label="Mã Thẻ BHYT">
          <input className="form-input" value={form.insuranceId} onChange={(event) => updateField('insuranceId', event.target.value)} />
        </Field>
        <Field label="Địa chỉ liên hệ" className="lg:col-span-2">
          <input className="form-input" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
        </Field>
        <Field label="Người thân liên hệ khẩn cấp" className="lg:col-span-2">
          <input className="form-input" value={form.emergencyContact} onChange={(event) => updateField('emergencyContact', event.target.value)} />
        </Field>
      </div>
      <div className="flex items-center justify-end gap-4 border-t border-slate-200 px-7 py-5">
        <button type="submit" className="secondary-action">Lưu thay đổi</button>
      </div>
      {confirmSave ? (
        <ConfirmDialog
          title="Lưu hồ sơ bệnh nhân?"
          message={`Thông tin định danh của ${form.name} sẽ được cập nhật.`}
          confirmText="Lưu"
          onCancel={() => setConfirmSave(false)}
          onConfirm={() => {
            onSave(form);
            setConfirmSave(false);
          }}
        />
      ) : null}
    </form>
  );
}

function VisitsTab({ visits }: { visits: Visit[] }) {
  return (
    <section className="panel min-h-[520px]">
      <h2 className="panel-title">Các lần khám trước đây</h2>
      <div className="mt-7 space-y-5 border-l-2 border-dashed border-slate-200 pl-6">
        {visits.map((visit, index) => (
          <div key={`${visit.date}-${visit.specialty}`} className="relative">
            <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full ${index === 0 ? 'bg-brand' : 'bg-slate-300'}`} />
            <h3 className={`text-sm font-extrabold ${index === 0 ? 'text-brand' : 'text-slate-700'}`}>
              Khám ngày {visit.date} - {visit.specialty}
            </h3>
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-5 text-sm">
              <InfoRow label="Bác sĩ phụ trách:" value={visit.doctor} strong />
              <InfoRow label="Chẩn đoán:" value={visit.diagnosis} strong tone={index === 0 ? 'text-rose-500' : undefined} />
              <InfoRow label="Đơn thuốc / CLS:" value={visit.prescription} />
              {visit.note ? <InfoRow label="Ghi chú:" value={visit.note} /> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChatbotTab({ chats }: { chats: ChatSession[] }) {
  const [timeFilter, setTimeFilter] = useState(chatTimeFilters[0]);
  const [resultFilter, setResultFilter] = useState(chatResultFilters[0]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const filteredChats = chats.filter((chat) => {
    const matchesTime = timeFilter === chatTimeFilters[0] || chat.date.endsWith(timeFilter.replace('Năm ', ''));
    const matchesResult =
      resultFilter === chatResultFilters[0] ||
      (resultFilter === 'Đã chuyển BS' && chat.result === 'transferred') ||
      (resultFilter === 'Tự xử lý' && chat.result === 'self-care') ||
      (resultFilter === 'Cung cấp thông tin' && chat.result === 'info-only');
    return matchesTime && matchesResult;
  });

  return (
    <section className="panel min-h-[520px] p-0">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-7 py-5 md:flex-row md:items-center md:justify-between">
        <h2 className="panel-title">Lịch sử tương tác với AI</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectMenu value={timeFilter} options={chatTimeFilters} onChange={setTimeFilter} />
          <SelectMenu value={resultFilter} options={chatResultFilters} onChange={setResultFilter} />
        </div>
      </div>
      <div className="space-y-4 p-7">
        {filteredChats.map((chat) => (
          <div key={chat.id} className={`rounded-md border border-slate-200 bg-white p-4 ${chat.result === 'transferred' ? 'border-l-4 border-l-brand' : chat.result === 'self-care' ? 'border-l-4 border-l-emerald-500' : ''}`}>
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
              <div>
                <h3 className="text-sm font-extrabold text-brand">
                  Phiên chat: {chat.date} - {chat.time}
                </h3>
                <p className="mt-2 text-xs font-extrabold text-slate-700">Triệu chứng khai báo:</p>
                <p className="mt-1 text-sm font-medium text-slate-600">- {chat.symptom}</p>
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-700">Phân loại AI (Kết quả):</p>
                <p className={`mt-1 text-sm font-extrabold ${chat.result === 'transferred' ? 'text-emerald-600' : 'text-slate-600'}`}>{chat.resultText}</p>
                {chat.appointment ? <p className="mt-1 text-xs font-semibold text-slate-400">Lịch hẹn: {chat.appointment}</p> : null}
              </div>
              <button type="button" onClick={() => setActiveChat(chat)} className="filter-chip justify-center whitespace-nowrap">
                Xem đoạn chat
              </button>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 ? <div className="py-12 text-center text-sm font-semibold text-slate-400">Không có phiên chat phù hợp.</div> : null}
      </div>
      {activeChat ? <ChatModal chat={activeChat} onClose={() => setActiveChat(null)} /> : null}
    </section>
  );
}

function SelectMenu({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="form-input flex items-center justify-between text-left" onClick={() => setOpen((current) => !current)}>
        <span className="truncate">{value}</span>
        <ChevronDown className="shrink-0" size={16} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full px-4 py-2 text-left text-sm font-semibold transition hover:bg-sky-50 hover:text-brand ${option === value ? 'bg-sky-50 text-brand' : 'text-slate-600'}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChatModal({ chat, onClose }: { chat: ChatSession; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="panel-title">Đoạn chat {chat.date}</h2>
            <p className="mt-1 text-xs font-semibold text-slate-400">{chat.resultText}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[420px] space-y-3 overflow-y-auto bg-slate-50 p-5">
          {chat.messages.map((message, index) => (
            <div key={index} className={`flex ${message.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-lg px-4 py-3 text-sm font-medium leading-6 ${message.from === 'patient' ? 'bg-brand text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, strong = false, tone = 'text-slate-700' }: { label: string; value: string; strong?: boolean; tone?: string }) {
  return (
    <div className="grid gap-2 py-1 sm:grid-cols-[150px_1fr]">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <span className={`text-xs ${strong ? 'font-extrabold' : 'font-medium'} ${tone}`}>{value}</span>
    </div>
  );
}

function getAge(birthDate: string) {
  const year = Number(birthDate.split('/')[2]);
  return Number.isFinite(year) ? 2026 - year : '';
}
