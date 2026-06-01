import { Check, ChevronDown, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import DateInput from './components/DateInput';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';

type AppointmentStatus = 'pending' | 'waiting' | 'examining' | 'cancelled';
type ViewMode = 'day' | 'week' | 'month';
type StatusFilter = 'all' | AppointmentStatus;

type Appointment = {
  id: string;
  time: string;
  date: string;
  patient: string;
  specialty: string;
  doctor: string;
  room: string;
  status: AppointmentStatus;
  symptoms: string;
  note: string;
};

const patientProfiles: Record<string, { age: number; phone: string; note: string }> = {
  'Nhật Linh': { age: 29, phone: '0912.345.678', note: 'Xin khám sớm vì chiều phải đi thi.' },
  'Nguyễn Duy Cương': { age: 34, phone: '0988.111.222', note: 'Xin khám sớm vì chiều phải đi công tác.' },
  'Đỗ Minh Khôi': { age: 8, phone: '0904.111.222', note: 'Phụ huynh muốn đổi sang buổi sáng nếu còn slot.' },
  'Mai Anh Thư': { age: 27, phone: '0976.333.555', note: 'Có thể đến trước giờ hẹn 10 phút.' },
  'Vũ Thu Trang': { age: 31, phone: '0968.222.333', note: 'Ưu tiên khám nhanh do đang đau nhiều.' },
  'Hoàng Gia Bảo': { age: 6, phone: '0936.888.999', note: 'Bé dễ nôn khi uống thuốc, cần bác sĩ lưu ý.' },
  'Trần Khánh Vy': { age: 31, phone: '0968.222.333', note: 'Đã tới phòng khám và chờ bác sĩ.' },
  'Phạm Quốc Huy': { age: 42, phone: '0919.444.555', note: 'Bệnh nhân xin gọi lại nếu lịch thay đổi.' },
};

const primaryBlue = '#2A93D5';
const specialties = ['Tất cả chuyên khoa / Bác sĩ', 'Nội Tổng Hợp', 'Tai Mũi Họng', 'Nhi Khoa'];
const doctorsBySpecialty: Record<string, string[]> = {
  'Nội Tổng Hợp': ['BS. Lê Nguyễn Công Minh', 'BS. Phạm Minh D'],
  'Tai Mũi Họng': ['BS. Nguyễn Văn A', 'BS. Hoàng Minh K'],
  'Nhi Khoa': ['BS. Trần Văn C', 'BS. Nguyễn Thu Hương'],
};
const rooms = ['Phòng khám 101', 'Phòng khám 105', 'Phòng khám 202'];
const slots = ['08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '10:30 - 11:00', '13:30 - 14:00'];

const initialAppointments: Appointment[] = [
  {
    id: 'LH-001',
    date: '10/05/2026',
    time: '08:00 - 08:30',
    patient: 'Nhật Linh',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Lê Nguyễn Công Minh',
    room: 'Phòng khám 101',
    status: 'waiting',
    symptoms: 'Đau bụng âm ỉ, mệt mỏi trong 2 ngày. Không sốt.',
    note: '',
  },
  {
    id: 'LH-002',
    date: '10/05/2026',
    time: '09:00 - 09:30',
    patient: 'Nguyễn Duy Cương',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Nguyễn Văn A',
    room: 'Phòng khám 202',
    status: 'pending',
    symptoms: 'Đau rát họng, ho khan kéo dài 3 ngày.',
    note: '',
  },
  {
    id: 'LH-003',
    date: '11/05/2026',
    time: '08:30 - 09:00',
    patient: 'Đỗ Minh Khôi',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Trần Văn C',
    room: 'Phòng khám 105',
    status: 'cancelled',
    symptoms: 'Sốt nhẹ, ho về đêm.',
    note: 'Bệnh nhân báo bận và hủy lịch.',
  },
  {
    id: 'LH-004',
    date: '11/05/2026',
    time: '09:00 - 09:30',
    patient: 'Mai Anh Thư',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Phạm Minh D',
    room: 'Phòng khám 101',
    status: 'pending',
    symptoms: 'Đau đầu nhẹ, chóng mặt sau khi làm việc lâu.',
    note: '',
  },
  {
    id: 'LH-005',
    date: '11/05/2026',
    time: '10:30 - 11:00',
    patient: 'Vũ Thu Trang',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Hoàng Minh K',
    room: 'Phòng khám 202',
    status: 'waiting',
    symptoms: 'Nghẹt mũi, ù tai, đau họng nhẹ.',
    note: '',
  },
  {
    id: 'LH-006',
    date: '12/05/2026',
    time: '08:00 - 08:30',
    patient: 'Hoàng Gia Bảo',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Nguyễn Thu Hương',
    room: 'Phòng khám 105',
    status: 'pending',
    symptoms: 'Sốt nhẹ, ho về đêm.',
    note: '',
  },
  {
    id: 'LH-007',
    date: '12/05/2026',
    time: '13:30 - 14:00',
    patient: 'Trần Khánh Vy',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Lê Nguyễn Công Minh',
    room: 'Phòng khám 101',
    status: 'examining',
    symptoms: 'Đau bụng âm ỉ, buồn nôn nhẹ.',
    note: '',
  },
  {
    id: 'LH-008',
    date: '13/05/2026',
    time: '08:30 - 09:00',
    patient: 'Phạm Quốc Huy',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Nguyễn Văn A',
    room: 'Phòng khám 202',
    status: 'cancelled',
    symptoms: 'Ho khan kéo dài.',
    note: 'Bệnh nhân xin đổi lịch.',
  },
  {
    id: 'LH-009',
    date: '13/05/2026',
    time: '15:00 - 15:30',
    patient: 'Lâm Minh Châu',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Trần Văn C',
    room: 'Phòng khám 105',
    status: 'waiting',
    symptoms: 'Tái khám sau sốt virus.',
    note: '',
  },
  {
    id: 'LH-010',
    date: '14/05/2026',
    time: '09:00 - 09:30',
    patient: 'Ngô Thanh Tùng',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Phạm Minh D',
    room: 'Phòng khám 101',
    status: 'pending',
    symptoms: 'Mệt mỏi, khó ngủ trong 1 tuần.',
    note: '',
  },
  {
    id: 'LH-011',
    date: '15/05/2026',
    time: '10:30 - 11:00',
    patient: 'Bùi Hải Nam',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Hoàng Minh K',
    room: 'Phòng khám 202',
    status: 'waiting',
    symptoms: 'Đau tai trái, nghe kém.',
    note: '',
  },
  {
    id: 'LH-012',
    date: '20/05/2026',
    time: '08:00 - 08:30',
    patient: 'Nguyễn Minh Khang',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Nguyễn Thu Hương',
    room: 'Phòng khám 105',
    status: 'pending',
    symptoms: 'Ho và chảy mũi.',
    note: '',
  },
  {
    id: 'LH-013',
    date: '22/05/2026',
    time: '13:30 - 14:00',
    patient: 'Đặng Mỹ Linh',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Lê Nguyễn Công Minh',
    room: 'Phòng khám 101',
    status: 'cancelled',
    symptoms: 'Đau dạ dày tái phát.',
    note: 'Bệnh nhân đã báo hủy.',
  },
  {
    id: 'LH-014',
    date: '27/05/2026',
    time: '09:00 - 09:30',
    patient: 'Tạ Hoàng Long',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Nguyễn Văn A',
    room: 'Phòng khám 202',
    status: 'waiting',
    symptoms: 'Khàn tiếng kéo dài.',
    note: '',
  },
  {
    id: 'LH-015',
    date: '10/05/2026',
    time: '10:30 - 11:00',
    patient: 'Phan Minh Đức',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Phạm Minh D',
    room: 'Phòng khám 101',
    status: 'pending',
    symptoms: 'Đau tức ngực nhẹ khi vận động, mệt mỏi.',
    note: '',
  },
  {
    id: 'LH-016',
    date: '10/05/2026',
    time: '13:30 - 14:00',
    patient: 'Nguyễn Thảo My',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Nguyễn Thu Hương',
    room: 'Phòng khám 105',
    status: 'waiting',
    symptoms: 'Sốt 38 độ, biếng ăn, ho nhẹ.',
    note: '',
  },
  {
    id: 'LH-017',
    date: '12/05/2026',
    time: '09:00 - 09:30',
    patient: 'Trịnh Bảo An',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Hoàng Minh K',
    room: 'Phòng khám 202',
    status: 'examining',
    symptoms: 'Ù tai trái, chóng mặt từng cơn.',
    note: 'Đã chuyển vào phòng khám.',
  },
  {
    id: 'LH-018',
    date: '14/05/2026',
    time: '08:30 - 09:00',
    patient: 'Lê Hoài Nam',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Lê Nguyễn Công Minh',
    room: 'Phòng khám 101',
    status: 'waiting',
    symptoms: 'Đau thượng vị sau ăn, ợ hơi.',
    note: '',
  },
  {
    id: 'LH-019',
    date: '15/05/2026',
    time: '13:30 - 14:00',
    patient: 'Đinh Khánh Ngọc',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Trần Văn C',
    room: 'Phòng khám 105',
    status: 'pending',
    symptoms: 'Tái khám sau viêm phổi, còn ho ít.',
    note: '',
  },
  {
    id: 'LH-020',
    date: '16/05/2026',
    time: '08:00 - 08:30',
    patient: 'Võ Thành Đạt',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Nguyễn Văn A',
    room: 'Phòng khám 202',
    status: 'cancelled',
    symptoms: 'Nghẹt mũi kéo dài, đau xoang.',
    note: 'Bệnh nhân xin chuyển sang tuần sau.',
  },
  {
    id: 'LH-021',
    date: '18/05/2026',
    time: '10:30 - 11:00',
    patient: 'Hoàng Lan Chi',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Phạm Minh D',
    room: 'Phòng khám 101',
    status: 'pending',
    symptoms: 'Mất ngủ, hồi hộp, ăn uống kém.',
    note: '',
  },
  {
    id: 'LH-022',
    date: '19/05/2026',
    time: '09:00 - 09:30',
    patient: 'Bùi Nhật Minh',
    specialty: 'Nhi Khoa',
    doctor: 'BS. Nguyễn Thu Hương',
    room: 'Phòng khám 105',
    status: 'waiting',
    symptoms: 'Đau bụng quanh rốn, buồn nôn nhẹ.',
    note: '',
  },
  {
    id: 'LH-023',
    date: '21/05/2026',
    time: '08:30 - 09:00',
    patient: 'Đặng Hà My',
    specialty: 'Tai Mũi Họng',
    doctor: 'BS. Hoàng Minh K',
    room: 'Phòng khám 202',
    status: 'pending',
    symptoms: 'Viêm họng tái phát, nuốt đau.',
    note: '',
  },
  {
    id: 'LH-024',
    date: '24/05/2026',
    time: '13:30 - 14:00',
    patient: 'Phạm Minh Quang',
    specialty: 'Nội Tổng Hợp',
    doctor: 'BS. Lê Nguyễn Công Minh',
    room: 'Phòng khám 101',
    status: 'examining',
    symptoms: 'Đường huyết cao sau ăn, khát nước nhiều.',
    note: 'Cần kiểm tra chỉ số đường huyết.',
  },
];

const statusLabels: Record<AppointmentStatus, string> = {
  pending: 'Chờ xác nhận',
  waiting: 'Chờ khám',
  examining: 'Đang khám',
  cancelled: 'Đã hủy',
};

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'waiting', label: 'Chờ khám' },
  { id: 'examining', label: 'Đang khám' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export default function AppointmentManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailModalId, setDetailModalId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ id: string; action: 'confirm' | 'reject' } | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState(specialties[0]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [anchorDate, setAnchorDate] = useState(() => parseDisplayDate('10/05/2026'));
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const selectedAppointment = appointments.find((appointment) => appointment.id === selectedId) ?? null;
  const detailAppointment = appointments.find((appointment) => appointment.id === detailModalId) ?? null;
  const scopedAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => isInViewRange(parseDisplayDate(appointment.date), anchorDate, viewMode))
        .filter((appointment) => specialtyFilter === specialties[0] || appointment.specialty === specialtyFilter || appointment.doctor === specialtyFilter)
        .sort(sortAppointments),
    [appointments, anchorDate, specialtyFilter, viewMode],
  );
  const filteredAppointments = scopedAppointments.filter((appointment) => statusFilter === 'all' || appointment.status === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const pagedAppointments = filteredAppointments.slice((page - 1) * pageSize, page * pageSize);
  const groupedAppointments = groupByDate(pagedAppointments);
  const statusCounts = getStatusCounts(scopedAppointments);
  const actionAppointment = pendingAction ? appointments.find((appointment) => appointment.id === pendingAction.id) ?? null : null;

  useEffect(() => {
    setPage(1);
  }, [anchorDate, specialtyFilter, statusFilter, viewMode]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    onNotify?.(status === 'waiting' ? 'Đã xác nhận lịch hẹn' : 'Đã từ chối lịch hẹn');
  };

  const saveAppointment = (updated: Appointment) => {
    setAppointments((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedId(null);
    onNotify?.(updated.status === 'cancelled' ? 'Đã hủy lịch hẹn' : 'Đã lưu điều phối lịch khám');
  };

  if (selectedAppointment) {
    return <AppointmentDetail appointment={selectedAppointment} onBack={() => setSelectedId(null)} onSave={saveAppointment} />;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">Quản lý lịch khám</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <AppointmentToolbar
          specialtyFilter={specialtyFilter}
          onSpecialtyChange={setSpecialtyFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          anchorDate={anchorDate}
          onDateSelect={setAnchorDate}
          onMoveDate={(direction) => setAnchorDate((current) => moveDate(current, viewMode, direction))}
        />
        <StatusFilterTabs active={statusFilter} counts={statusCounts} onChange={setStatusFilter} />
        <AppointmentTable groups={groupedAppointments} onView={setDetailModalId} onConfirm={(id) => setPendingAction({ id, action: 'confirm' })} onReject={(id) => setPendingAction({ id, action: 'reject' })} />
        <Pagination currentPage={page} totalPages={totalPages} totalItems={filteredAppointments.length} pageSize={pageSize} onChange={setPage} />
      </section>
      {detailAppointment ? (
        <AppointmentDetailsModal
          appointment={detailAppointment}
          onClose={() => setDetailModalId(null)}
          onConfirm={() => {
            updateStatus(detailAppointment.id, 'waiting');
            setDetailModalId(null);
          }}
          onReject={() => {
            updateStatus(detailAppointment.id, 'cancelled');
            setDetailModalId(null);
          }}
        />
      ) : null}
      {pendingAction && actionAppointment ? (
        <ConfirmActionModal
          appointment={actionAppointment}
          action={pendingAction.action}
          onClose={() => setPendingAction(null)}
          onConfirm={() => {
            updateStatus(actionAppointment.id, pendingAction.action === 'confirm' ? 'waiting' : 'cancelled');
            setPendingAction(null);
          }}
        />
      ) : null}
    </div>
  );
}

function AppointmentToolbar({
  specialtyFilter,
  onSpecialtyChange,
  viewMode,
  onViewModeChange,
  anchorDate,
  onDateSelect,
  onMoveDate,
}: {
  specialtyFilter: string;
  onSpecialtyChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  anchorDate: Date;
  onDateSelect: (value: Date) => void;
  onMoveDate: (direction: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="w-full max-w-sm">
        <SelectMenu value={specialtyFilter} options={[...specialties, ...Object.values(doctorsBySpecialty).flat()]} onChange={onSpecialtyChange} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <DateNavigator anchorDate={anchorDate} viewMode={viewMode} onDateSelect={onDateSelect} onMoveDate={onMoveDate} />
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}

function DateNavigator({
  anchorDate,
  viewMode,
  onDateSelect,
  onMoveDate,
}: {
  anchorDate: Date;
  viewMode: ViewMode;
  onDateSelect: (value: Date) => void;
  onMoveDate: (direction: -1 | 1) => void;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) {
      return;
    }

    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (pickerInput.showPicker) {
      pickerInput.showPicker();
      return;
    }

    pickerInput.focus();
    pickerInput.click();
  };

  return (
    <div className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
      <button type="button" onClick={() => onMoveDate(-1)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-blue-500" aria-label="Khoảng trước">
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={openDatePicker}
        className="relative flex h-9 min-w-56 cursor-pointer items-center justify-center rounded-md px-3 text-center text-sm font-extrabold text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
        aria-label="Chọn ngày"
      >
        <span>{formatDateNavigator(anchorDate, viewMode)}</span>
        <input
          ref={dateInputRef}
          type={viewMode === 'day' ? 'date' : viewMode === 'week' ? 'week' : 'month'}
          value={getPickerValue(anchorDate, viewMode)}
          onChange={(event) => {
            if (event.target.value) {
              onDateSelect(getDateFromPickerValue(event.target.value, viewMode));
            }
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-label="Chọn ngày"
        />
      </button>
      <button type="button" onClick={() => onMoveDate(1)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-blue-500" aria-label="Khoảng sau">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <div className="inline-flex h-11 w-fit overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
      {[
        ['day', 'Ngày'],
        ['week', 'Tuần'],
        ['month', 'Tháng'],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id as ViewMode)}
          className={`h-9 rounded-md px-4 text-xs font-extrabold transition ${value === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-blue-500'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StatusFilterTabs({ active, counts, onChange }: { active: StatusFilter; counts: Record<StatusFilter, number>; onChange: (value: StatusFilter) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
      {statusTabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-9 items-center rounded-full border px-4 text-xs font-extrabold transition ${
              isActive ? 'border-blue-500 bg-blue-500 text-white shadow-sm' : 'border-sky-200 bg-sky-50 text-blue-500 hover:border-blue-500 hover:bg-white'
            }`}
          >
            {tab.label}: {counts[tab.id]}
          </button>
        );
      })}
    </div>
  );
}

function AppointmentTable({
  groups,
  onView,
  onConfirm,
  onReject,
}: {
  groups: Array<{ date: string; items: Appointment[] }>;
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (!groups.length) {
    return <div className="px-6 py-16 text-center text-sm font-semibold text-slate-400">Không có lịch hẹn phù hợp với bộ lọc hiện tại.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Khung giờ</th>
            <th className="px-4 py-3">Bệnh nhân</th>
            <th className="px-4 py-3">Chuyên khoa & Bác sĩ</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <TableGroup key={group.date} group={group} onView={onView} onConfirm={onConfirm} onReject={onReject} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = buildPaginationItems(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Hiển thị {start}-{end} / {totalItems} lịch hẹn
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
          className="flex h-7 w-7 items-center justify-center rounded text-sky-300 transition hover:bg-sky-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="flex h-7 min-w-6 items-center justify-center text-sm font-extrabold text-brand">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onChange(page)}
              className={`flex h-7 min-w-7 items-center justify-center rounded px-2 text-sm font-extrabold transition ${
                currentPage === page ? 'bg-brand text-white shadow-sm' : 'text-brand hover:bg-sky-50'
              }`}
            >
              {page}
            </button>
          ),
        )}
        </div>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
          className="flex h-7 w-7 items-center justify-center rounded text-brand transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ConfirmActionModal({
  appointment,
  action,
  onClose,
  onConfirm,
}: {
  appointment: Appointment;
  action: 'confirm' | 'reject';
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isConfirm = action === 'confirm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-extrabold text-slate-800">{isConfirm ? 'Xác nhận lịch hẹn?' : 'Từ chối lịch hẹn?'}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {appointment.patient} - {appointment.time}, {appointment.date}
          </p>
        </div>
        <div className="p-5">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {isConfirm
              ? 'Lịch sẽ chuyển sang trạng thái Chờ khám và bệnh nhân sẽ được thông báo.'
              : 'Lịch sẽ chuyển sang trạng thái Đã hủy. Hãy chắc chắn bệnh nhân đã được liên hệ nếu cần.'}
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="ghost-action">
              Quay lại
            </button>
            <button type="button" onClick={onConfirm} className={`secondary-action ${isConfirm ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'}`}>
              {isConfirm ? 'Xác nhận' : 'Từ chối'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableGroup({
  group,
  onView,
  onConfirm,
  onReject,
}: {
  group: { date: string; items: Appointment[] };
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <>
      <tr className="bg-gray-100">
        <td colSpan={5} className="px-4 py-2.5 text-sm font-extrabold text-slate-700">
          {formatGroupDate(group.date)}
        </td>
      </tr>
      {group.items.map((appointment) => (
        <tr key={appointment.id} onClick={() => onView(appointment.id)} className="cursor-pointer border-b border-slate-100 bg-white transition hover:bg-slate-50">
          <td className="px-4 py-3 font-semibold text-slate-600">{appointment.time}</td>
          <td className="px-4 py-3">
            <b className="text-slate-800">{appointment.patient}</b>
          </td>
          <td className="px-4 py-3 text-slate-600">
            {appointment.specialty}
            <small className="block text-slate-400">{appointment.doctor}</small>
          </td>
          <td className="px-4 py-3">
            <AppointmentStatusBadge status={appointment.status} />
          </td>
          <td className="px-4 py-3">
            <QuickActions appointment={appointment} onView={onView} onConfirm={onConfirm} onReject={onReject} />
          </td>
        </tr>
      ))}
    </>
  );
}

function QuickActions({
  appointment,
  onView,
  onConfirm,
  onReject,
}: {
  appointment: Appointment;
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (appointment.status === 'pending') {
    return (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onView(appointment.id);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-blue-500 transition hover:bg-sky-100"
          aria-label="Xem chi tiết"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onConfirm(appointment.id);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
          aria-label="Xác nhận lịch"
        >
          <Check size={17} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onReject(appointment.id);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-500 transition hover:bg-rose-100"
          aria-label="Từ chối lịch"
        >
          <X size={17} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onView(appointment.id);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-blue-500 transition hover:bg-sky-100"
        aria-label="Xem chi tiết"
      >
        <Eye size={18} />
      </button>
    </div>
  );
}

function AppointmentDetailsModal({
  appointment,
  onClose,
  onConfirm,
  onReject,
}: {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const patient = patientProfiles[appointment.patient] ?? { age: 32, phone: '0900.000.000', note: 'Bệnh nhân chưa để lại ghi chú thêm.' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Chi tiết Lịch hẹn</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {appointment.id} - {appointment.date}
            </p>
          </div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <AppointmentStatusBadge status={appointment.status} />
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-extrabold text-slate-800">Thông tin Bệnh nhân</h3>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <InfoItem label="Họ tên" value={appointment.patient} />
              <InfoItem label="Tuổi" value={`${patient.age} tuổi`} />
              <InfoItem label="Số điện thoại" value={patient.phone} />
              <InfoItem label="Mã lịch hẹn" value={appointment.id} />
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <h3 className="text-sm font-extrabold text-slate-800">Thông tin Khám</h3>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <InfoItem label="Chuyên khoa" value={appointment.specialty} />
              <InfoItem label="Bác sĩ chỉ định" value={appointment.doctor} />
              <InfoItem label="Thời gian" value={`${appointment.time}, ${appointment.date}`} />
              <InfoItem label="Phòng khám" value={appointment.room} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Lý do khám / Triệu chứng</h3>
            <p className="mt-2 rounded-lg bg-sky-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">{appointment.symptoms}</p>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Ghi chú của bệnh nhân</h3>
            <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700">{appointment.note || patient.note}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center">
          <button type="button" onClick={onClose} className="ghost-action sm:mr-auto">
            Đóng
          </button>
          {appointment.status === 'pending' ? (
            <>
              <button type="button" onClick={onReject} className="ghost-action border-rose-200 bg-white text-rose-500 hover:bg-rose-50">
                Từ chối
              </button>
              <button type="button" onClick={onConfirm} className="secondary-action bg-emerald-600 hover:bg-emerald-700">
                Xác nhận lịch
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
    </div>
  );
}

function AppointmentDetail({ appointment, onBack, onSave }: { appointment: Appointment; onBack: () => void; onSave: (appointment: Appointment) => void }) {
  const [specialty, setSpecialty] = useState(appointment.specialty);
  const [doctor, setDoctor] = useState(appointment.doctor);
  const [appointmentDate, setAppointmentDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);
  const [room, setRoom] = useState(appointment.room);
  const [note, setNote] = useState(appointment.note);
  const [pendingAction, setPendingAction] = useState<'save' | 'cancel' | null>(null);
  const availableDoctors = useMemo(() => doctorsBySpecialty[specialty] ?? [], [specialty]);
  const locked = appointment.status === 'examining' || appointment.status === 'cancelled';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPendingAction('save');
  };

  const saveChanges = () => {
    onSave({ ...appointment, specialty, doctor, room, note, date: appointmentDate, time, status: 'waiting' });
  };

  const cancelAppointment = () => {
    onSave({ ...appointment, specialty, doctor, room, note, date: appointmentDate, time, status: 'cancelled' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm font-semibold text-slate-500">
        Quản lý lịch khám / <span className="text-blue-500">Chi tiết</span>
      </p>
      <h1 className="mt-2 border-l-4 border-blue-500 pl-3 text-xl font-bold text-slate-800">{appointment.status === 'examining' ? 'Hồ sơ bệnh nhân' : 'Chi tiết Lịch hẹn'}</h1>
      <section className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 p-4">
          <div>
            <AppointmentStatusBadge status={appointment.status} />
            <h2 className="mt-4 text-lg font-bold text-slate-800">
              {appointment.status === 'examining' ? `Hồ sơ bệnh nhân: ${appointment.patient}` : `Yêu cầu Đặt lịch: ${appointment.patient}`}
            </h2>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-extrabold text-slate-700">Triệu chứng ban đầu (Từ Chatbot):</h3>
            <div className="rounded-md bg-sky-50 px-4 py-3 text-sm font-medium leading-6 text-slate-600">- {appointment.symptoms}</div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Chuyên khoa">
              <SelectMenu
                value={specialty}
                options={specialties.filter((item) => item !== specialties[0])}
                disabled={locked}
                onChange={(value) => {
                  setSpecialty(value);
                  setDoctor(doctorsBySpecialty[value]?.[0] ?? '');
                }}
              />
            </Field>
            <Field label="Bác sĩ phân công">
              <SelectMenu value={doctor} options={availableDoctors.length ? availableDoctors : [doctor]} onChange={setDoctor} disabled={locked} />
            </Field>
            <Field label="Khung giờ">
              <SelectMenu value={time} options={slots} onChange={setTime} disabled={locked} />
            </Field>
            <Field label="Ngày khám">
              <DateInput value={appointmentDate} onChange={setAppointmentDate} disabled={locked} />
            </Field>
            <Field label="Phòng khám">
              <SelectMenu value={room} options={rooms} onChange={setRoom} disabled={locked} />
            </Field>
          </div>
          <Field label="Ghi chú nội bộ">
            <textarea className="form-textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Thêm ghi chú gửi bác sĩ..." />
          </Field>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="max-w-2xl text-xs font-semibold leading-5 text-slate-400">{getDetailHelperText(appointment.status)}</p>
          <div className="flex shrink-0 flex-wrap justify-end gap-3 sm:flex-nowrap">
            <button type="button" onClick={onBack} className="ghost-action min-w-28 whitespace-nowrap">Quay lại</button>
            {appointment.status === 'pending' ? (
              <>
                <button type="button" onClick={() => setPendingAction('cancel')} className="ghost-action min-w-28 whitespace-nowrap">Hủy lịch</button>
                <button type="submit" className="secondary-action min-w-44 whitespace-nowrap">Xác nhận Lịch hẹn</button>
              </>
            ) : null}
            {appointment.status === 'waiting' ? (
              <>
                <button type="button" onClick={() => setPendingAction('cancel')} className="ghost-action min-w-28 whitespace-nowrap">Hủy lịch</button>
                <button type="submit" className="secondary-action min-w-36 whitespace-nowrap">Lưu điều phối</button>
              </>
            ) : null}
          </div>
        </div>
      </section>
      {pendingAction ? (
        <ConfirmDialog
          title={pendingAction === 'cancel' ? 'Hủy lịch hẹn?' : appointment.status === 'pending' ? 'Xác nhận lịch hẹn?' : 'Lưu điều phối?'}
          message={
            pendingAction === 'cancel'
              ? `Lịch của ${appointment.patient} sẽ chuyển sang trạng thái Đã hủy.`
              : appointment.status === 'pending'
                ? `Lịch của ${appointment.patient} sẽ chuyển sang trạng thái Chờ khám.`
                : `Thông tin điều phối của ${appointment.patient} sẽ được cập nhật.`
          }
          confirmText={pendingAction === 'cancel' ? 'Hủy lịch' : appointment.status === 'pending' ? 'Xác nhận' : 'Lưu'}
          tone={pendingAction === 'cancel' ? 'danger' : 'primary'}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            if (pendingAction === 'cancel') {
              cancelAppointment();
            } else {
              saveChanges();
            }
            setPendingAction(null);
          }}
        />
      ) : null}
    </form>
  );
}

function SelectMenu({ value, options, onChange, disabled = false }: { value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        className={`form-input flex items-center justify-between text-left ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="shrink-0" size={16} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full px-4 py-2 text-left text-sm font-semibold transition hover:bg-sky-50 hover:text-blue-500 ${option === value ? 'bg-sky-50 text-blue-500' : 'text-slate-600'}`}
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

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const tone: Record<AppointmentStatus, string> = {
    examining: 'bg-blue-100 text-blue-700',
    waiting: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-slate-100 text-slate-500',
  };

  return <span className={`inline-flex rounded-full px-4 py-1 text-xs font-extrabold ${tone[status]}`}>{statusLabels[status]}</span>;
}

function parseDisplayDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function toDisplayDate(value: Date) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value);
}

function getPickerValue(value: Date, viewMode: ViewMode) {
  if (viewMode === 'day') {
    return toIsoInput(value);
  }

  if (viewMode === 'week') {
    return toIsoWeekInput(value);
  }

  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function getDateFromPickerValue(value: string, viewMode: ViewMode) {
  if (viewMode === 'day') {
    return fromIsoInput(value);
  }

  if (viewMode === 'week') {
    return fromIsoWeekInput(value);
  }

  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function toIsoInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromIsoInput(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoWeekInput(value: Date) {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber =
    1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function fromIsoWeekInput(value: string) {
  const [yearPart, weekPart] = value.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay();
  const monday = new Date(simple);
  monday.setDate(simple.getDate() + (day <= 4 ? 1 - day : 8 - day));
  return monday;
}

function sortAppointments(a: Appointment, b: Appointment) {
  return parseDisplayDate(a.date).getTime() - parseDisplayDate(b.date).getTime() || a.time.localeCompare(b.time);
}

function isInViewRange(date: Date, anchorDate: Date, viewMode: ViewMode) {
  const value = startOfDay(date).getTime();
  const start = getRangeStart(anchorDate, viewMode).getTime();
  const end = getRangeEnd(anchorDate, viewMode).getTime();
  return value >= start && value <= end;
}

function getRangeStart(date: Date, viewMode: ViewMode) {
  const current = startOfDay(date);
  if (viewMode === 'day') {
    return current;
  }

  if (viewMode === 'week') {
    const day = current.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + offset);
    return current;
  }

  return new Date(current.getFullYear(), current.getMonth(), 1);
}

function getRangeEnd(date: Date, viewMode: ViewMode) {
  const start = getRangeStart(date, viewMode);
  if (viewMode === 'day') {
    return start;
  }

  if (viewMode === 'week') {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  }

  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
}

function moveDate(date: Date, viewMode: ViewMode, direction: -1 | 1) {
  const next = new Date(date);
  if (viewMode === 'day') {
    next.setDate(next.getDate() + direction);
  } else if (viewMode === 'week') {
    next.setDate(next.getDate() + direction * 7);
  } else {
    next.setMonth(next.getMonth() + direction);
  }
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateNavigator(date: Date, viewMode: ViewMode) {
  if (viewMode === 'day') {
    return `Hôm nay, ${toDisplayDate(date)}`;
  }

  if (viewMode === 'week') {
    return `${toDisplayDate(getRangeStart(date, 'week'))} - ${toDisplayDate(getRangeEnd(date, 'week'))}`;
  }

  return new Intl.DateTimeFormat('vi-VN', { month: '2-digit', year: 'numeric' }).format(date).replace('/', '/');
}

function groupByDate(appointments: Appointment[]) {
  const groups = appointments.reduce<Record<string, Appointment[]>>((acc, appointment) => {
    acc[appointment.date] = [...(acc[appointment.date] ?? []), appointment];
    return acc;
  }, {});

  return Object.entries(groups)
    .sort(([a], [b]) => parseDisplayDate(a).getTime() - parseDisplayDate(b).getTime())
    .map(([date, items]) => ({ date, items: items.sort(sortAppointments) }));
}

function getStatusCounts(appointments: Appointment[]) {
  return appointments.reduce<Record<StatusFilter, number>>(
    (counts, appointment) => {
      counts.all += 1;
      counts[appointment.status] += 1;
      return counts;
    },
    { all: 0, pending: 0, waiting: 0, examining: 0, cancelled: 0 },
  );
}

function buildPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

function formatGroupDate(date: string) {
  const value = parseDisplayDate(date);
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(value);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date}`;
}

function getDetailHelperText(status: AppointmentStatus) {
  if (status === 'pending') {
    return 'Lịch đang chờ xác nhận. Khi quản lý xác nhận, trạng thái sẽ chuyển sang Chờ khám và hệ thống gửi SMS & Email tới bệnh nhân.';
  }

  if (status === 'waiting') {
    return 'Bệnh nhân đang chờ khám. Quản lý chỉ cập nhật điều phối hoặc hủy lịch nếu có thay đổi.';
  }

  if (status === 'examining') {
    return 'Bệnh nhân đang trong phiên khám. Quản lý chỉ xem hồ sơ và thông tin điều phối, thao tác khám do bác sĩ thực hiện.';
  }

  return 'Lịch đã hủy. Thông tin chỉ còn ở chế độ xem, không thể xác nhận hoặc điều phối tiếp.';
}
