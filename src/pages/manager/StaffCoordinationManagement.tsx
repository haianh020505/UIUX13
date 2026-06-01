import { AlertTriangle, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Edit3, MapPin, Plus, Search, Stethoscope, Trash2, UserRound, UsersRound, X, Download } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';

type StaffTab = 'list' | 'schedule' | 'alerts';
type ScheduleView = 'day' | 'week' | 'month';
type StaffStatus = 'active' | 'leave' | 'upcoming';
type StaffRole = 'Bác sĩ' | 'Điều dưỡng' | 'Kỹ thuật viên' | 'Lễ tân';

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  phone: string;
  email: string;
  status: StaffStatus;
};

type AlertItem = {
  id: string;
  title: string;
  shift: string;
  specialty: string;
  reason: string;
  severity: 'high' | 'medium';
  replacementId: string;
};

type SelectedShift = {
  label: string;
  time: string;
  staff: Staff;
  warning?: boolean;
  alertId?: string;
};

const primaryText = 'text-brand';
const primaryBg = 'bg-brand';
const roles: StaffRole[] = ['Bác sĩ', 'Điều dưỡng', 'Kỹ thuật viên', 'Lễ tân'];
const specialties = ['Không áp dụng', 'Tai Mũi Họng', 'Nội Tổng Hợp', 'Nhi Khoa', 'Lễ tân & Điều phối'];

const initialStaff: Staff[] = [
  { id: 'ST-001', name: 'BS. Nguyễn Duy Cương', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0912.345.678', email: 'cuongnd@fakeeh.care', status: 'active' },
  { id: 'ST-045', name: 'Điều dưỡng Nguyễn Nhật Linh', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0988.123.456', email: 'linhnn@fakeeh.care', status: 'leave' },
  { id: 'ST-052', name: 'BS. Trần Văn C', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0904.555.666', email: 'tranc@fakeeh.care', status: 'upcoming' },
  { id: 'ST-060', name: 'BS. Lê Nguyễn Công Minh', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0908.888.222', email: 'minhlnc@fakeeh.care', status: 'active' },
  { id: 'ST-077', name: 'KTV. Phạm Anh Khoa', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0933.123.222', email: 'khoapa@fakeeh.care', status: 'upcoming' },
  { id: 'ST-083', name: 'BS. Hoàng Minh Khang', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0977.654.321', email: 'khanghm@fakeeh.care', status: 'active' },
  { id: 'ST-091', name: 'ĐD. Mai Thu Hằng', role: 'Điều dưỡng', specialty: 'Nhi Khoa', phone: '0966.777.888', email: 'hangmt@fakeeh.care', status: 'upcoming' },
  { id: 'ST-104', name: 'LT. Phạm Quỳnh Anh', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0945.888.999', email: 'anhpq@fakeeh.care', status: 'active' },
  { id: 'ST-118', name: 'BS. Vũ Hải Nam', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0932.222.111', email: 'namvh@fakeeh.care', status: 'leave' },
  { id: 'ST-126', name: 'KTV. Nguyễn Đức Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0921.555.777', email: 'huynd@fakeeh.care', status: 'active' },
  { id: 'ST-139', name: 'ĐD. Trần Bảo Ngọc', role: 'Điều dưỡng', specialty: 'Tai Mũi Họng', phone: '0919.333.444', email: 'ngoctb@fakeeh.care', status: 'upcoming' },
  { id: 'ST-150', name: 'BS. Đặng Minh Quân', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0981.222.333', email: 'quandm@fakeeh.care', status: 'active' },
  { id: 'ST-163', name: 'LT. Nguyễn Hoài An', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0909.321.456', email: 'annh@fakeeh.care', status: 'active' },
  { id: 'ST-174', name: 'ĐD. Lê Phương Mai', role: 'Điều dưỡng', specialty: 'Nội Tổng Hợp', phone: '0938.654.777', email: 'mailp@fakeeh.care', status: 'upcoming' },
  { id: 'ST-185', name: 'BS. Phạm Minh D', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0962.444.555', email: 'minhdp@fakeeh.care', status: 'active' },
  { id: 'ST-196', name: 'BS. Nguyễn Thu Hương', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0971.222.888', email: 'huongnt@fakeeh.care', status: 'active' },
  { id: 'ST-207', name: 'KTV. Trương Gia Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0915.333.777', email: 'huytg@fakeeh.care', status: 'leave' },
  { id: 'ST-218', name: 'ĐD. Hồ Minh Tâm', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0906.888.111', email: 'tamhm@fakeeh.care', status: 'active' },
];

const alerts: AlertItem[] = [
  {
    id: 'AL-01',
    title: 'Thiếu Bác sĩ - Ca chiều',
    shift: '14:00 - 18:00, Thứ 3 (11/05)',
    specialty: 'Nhi Khoa',
    reason: 'BS. Trần Văn C xin nghỉ đột xuất, cần điều phối người thay thế trước 13:30.',
    severity: 'high',
    replacementId: 'ST-060',
  },
  {
    id: 'AL-02',
    title: 'Trùng lịch phòng khám 202',
    shift: '09:00 - 11:00, Thứ 5 (13/05)',
    specialty: 'Tai Mũi Họng',
    reason: 'Hai ca khám đang được xếp cùng phòng 202 trong cùng khung giờ.',
    severity: 'medium',
    replacementId: 'ST-001',
  },
  {
    id: 'AL-03',
    title: 'Thiếu điều dưỡng hỗ trợ',
    shift: '08:00 - 12:00, Thứ 6 (14/05)',
    specialty: 'Lễ tân & Điều phối',
    reason: 'Điều dưỡng phụ trách nghỉ phép, cần bổ sung người hỗ trợ tiếp nhận bệnh nhân.',
    severity: 'medium',
    replacementId: 'ST-045',
  },
  {
    id: 'AL-04',
    title: 'Thiếu lễ tân tiếp nhận',
    shift: '07:30 - 11:30, Thứ 2 (10/05)',
    specialty: 'Lễ tân & Điều phối',
    reason: 'Quầy tiếp nhận 1 có lượng bệnh nhân tăng cao nhưng thiếu nhân sự hỗ trợ check-in.',
    severity: 'medium',
    replacementId: 'ST-104',
  },
  {
    id: 'AL-05',
    title: 'Kỹ thuật viên X-Quang vắng',
    shift: '13:00 - 17:00, Thứ 4 (12/05)',
    specialty: 'Không áp dụng',
    reason: 'KTV phụ trách X-Quang báo nghỉ bệnh, cần điều phối người thay thế cho các ca CLS.',
    severity: 'high',
    replacementId: 'ST-126',
  },
  {
    id: 'AL-06',
    title: 'Bác sĩ Nội Tổng Hợp quá tải',
    shift: '08:00 - 12:00, Thứ 6 (14/05)',
    specialty: 'Nội Tổng Hợp',
    reason: 'Số lịch chờ khám vượt ngưỡng trong ca sáng, cần bổ sung bác sĩ hỗ trợ.',
    severity: 'high',
    replacementId: 'ST-060',
  },
  {
    id: 'AL-07',
    title: 'Thiếu kỹ thuật viên xét nghiệm',
    shift: '08:00 - 12:00, Thứ 2 (10/05)',
    specialty: 'Không áp dụng',
    reason: 'KTV. Trương Gia Huy nghỉ phép, số ca xét nghiệm buổi sáng tăng cao cần bổ sung người hỗ trợ.',
    severity: 'medium',
    replacementId: 'ST-126',
  },
  {
    id: 'AL-08',
    title: 'Thiếu điều dưỡng Nhi Khoa',
    shift: '13:00 - 17:00, Thứ 3 (11/05)',
    specialty: 'Nhi Khoa',
    reason: 'Ca chiều Nhi Khoa có nhiều lịch khám trẻ em, cần thêm điều dưỡng hỗ trợ đo sinh hiệu và hướng dẫn phụ huynh.',
    severity: 'medium',
    replacementId: 'ST-091',
  },
  {
    id: 'AL-09',
    title: 'Bác sĩ Tai Mũi Họng kín lịch',
    shift: '09:00 - 12:00, Thứ 5 (13/05)',
    specialty: 'Tai Mũi Họng',
    reason: 'Số bệnh nhân chờ khám Tai Mũi Họng vượt ngưỡng, cần mở thêm bàn khám hoặc điều phối bác sĩ thay thế.',
    severity: 'high',
    replacementId: 'ST-083',
  },
  {
    id: 'AL-10',
    title: 'Quầy tiếp nhận quá tải',
    shift: '07:30 - 10:30, Thứ 6 (14/05)',
    specialty: 'Lễ tân & Điều phối',
    reason: 'Lượng bệnh nhân check-in đầu giờ tăng cao, cần bổ sung lễ tân tại quầy số 2.',
    severity: 'medium',
    replacementId: 'ST-163',
  },
];

function nextStaffCode(staff: Staff[]) {
  const max = staff.reduce((value, item) => Math.max(value, Number(item.id.replace('ST-', '')) || 0), 0);
  return `ST-${String(max + 1).padStart(3, '0')}`;
}

export default function StaffCoordinationManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const [staff, setStaff] = useState(initialStaff);
  const [activeTab, setActiveTab] = useState<StaffTab>('list');
  const [selectedAlertId, setSelectedAlertId] = useState(alerts[0].id);

  const handleReportAbsence = (staffId: string) => {
    setStaff((items) =>
      items.map((item) => (item.id === staffId ? { ...item, status: 'leave' } : item))
    );
    onNotify?.('Đã báo vắng nhân sự thành công');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">Lịch trực & Điều phối</h1>
      <StaffTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-5">
        {activeTab === 'list' ? (
          <StaffList staff={staff} onReportAbsence={handleReportAbsence} />
        ) : null}
        {activeTab === 'schedule' ? (
          <ScheduleTab
            staff={staff}
            onNavigateToAlert={(alertId) => {
              setSelectedAlertId(alertId);
              setActiveTab('alerts');
            }}
          />
        ) : null}
        {activeTab === 'alerts' ? (
          <AlertsTab
            staff={staff}
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
            onAssign={(replacement) => {
              setStaff((items) => items.map((item) => (item.id === replacement.id ? { ...item, status: 'active' } : item)));
              onNotify?.('Đã xác nhận điều phối thay thế');
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function StaffTabs({ activeTab, onChange }: { activeTab: StaffTab; onChange: (tab: StaffTab) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex min-w-[640px]">
        {[
          ['list', 'Tổng quan hôm nay (01/06/2026)'],
          ['schedule', 'Lịch trực'],
          ['alerts', 'Cảnh báo & Điều phối'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id as StaffTab)}
            className={`relative flex h-14 min-w-44 items-center justify-center px-5 text-sm font-extrabold transition ${
              activeTab === id ? primaryText : 'text-slate-500 hover:text-brand'
            }`}
          >
            {label}
            {activeTab === id ? <span className="absolute bottom-0 left-0 h-1 w-full bg-brand" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function StaffList({ staff, onReportAbsence }: { staff: Staff[]; onReportAbsence: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalStaffCount = 45;
  const filteredStaff = staff.filter((item) => {
    const keyword = query.trim().toLowerCase();
    return !keyword || [item.id, item.name, item.phone, item.specialty].some((value) => value.toLowerCase().includes(keyword));
  });
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const pagedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);
  const pageStart = filteredStaff.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredStaff.length);
  const stats = [
    { label: 'Tổng ca trực hôm nay', value: 25, icon: UsersRound, tone: 'bg-sky-50 text-brand', valueClass: 'text-slate-800' },
    { label: 'Đã có mặt', value: 22, icon: CalendarDays, tone: 'bg-emerald-50 text-emerald-600', valueClass: 'text-green-600' },
    { label: 'Vắng mặt / Đi muộn', value: 3, icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600', valueClass: 'text-rose-600' },
  ];

  const getTodayShift = (item: Staff) => {
    if (item.role === 'Bác sĩ') return 'Ca sáng 08:00 - 12:00';
    if (item.role === 'Điều dưỡng') return 'Ca chiều 13:00 - 17:00';
    return 'Hành chính 08:00 - 17:00';
  };

  const getCoordinationStatusBadge = (status: StaffStatus) => {
    if (status === 'active') {
      return <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-700">Có mặt</span>;
    }
    if (status === 'upcoming') {
      return <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">Chưa đến</span>;
    }
    return <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-700">Vắng mặt</span>;
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-400">{stat.label}</p>
                  <p className={`mt-2 text-4xl font-extrabold ${stat.valueClass}`}>{stat.value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="form-input pl-10"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm tên, mã NS..."
          />
        </label>
        <button
          type="button"
          onClick={() => alert('Xuất báo cáo chấm công thành công!')}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition shadow-sm"
        >
          <Download size={16} />
          Xuất báo cáo chấm công
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4">Mã NS</th>
              <th className="px-6 py-4">Họ và tên</th>
              <th className="px-6 py-4">Ca trực hôm nay</th>
              <th className="px-6 py-4">Vị trí</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedStaff.map((item) => (
              <tr key={item.id} className="bg-white transition hover:bg-slate-50">
                <td className="px-6 py-5 text-slate-600">{item.id}</td>
                <td className="px-6 py-5 font-extrabold text-slate-800">{item.name}</td>
                <td className="px-6 py-5 text-slate-600 font-semibold">
                  {getTodayShift(item)}
                </td>
                <td className="px-6 py-5 text-slate-600 font-semibold">
                  {getShiftLocation(item)}
                </td>
                <td className="px-6 py-5">{getCoordinationStatusBadge(item.status)}</td>
                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onReportAbsence(item.id)}
                      className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded px-2.5 py-1 text-sm font-semibold transition"
                    >
                      Báo vắng
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between border-t p-4">
        <p className="text-sm font-semibold text-gray-500">
          Hiển thị {pageStart} - {pageEnd} trên tổng số {totalStaffCount} nhân sự
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="flex h-8 w-8 items-center justify-center rounded text-sky-300 transition hover:bg-sky-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-extrabold transition ${
                page === pageNumber ? 'bg-brand text-white shadow-sm' : 'text-brand hover:bg-sky-50'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="flex h-8 w-8 items-center justify-center rounded text-brand transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ScheduleTab({ staff, onNavigateToAlert }: { staff: Staff[]; onNavigateToAlert?: (alertId: string) => void }) {
  const [view, setView] = useState<ScheduleView>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date(2026, 4, 10));
  const [selectedShift, setSelectedShift] = useState<SelectedShift | null>(null);

  const handleMonthDayClick = (day: number) => {
    setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day));
    setView('day');
  };

  const handleShiftClick = (shift: SelectedShift) => {
    setSelectedShift(shift);
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ScheduleDateNavigator view={view} anchorDate={anchorDate} onChange={setAnchorDate} />
        <ScheduleToggle value={view} onChange={setView} />
      </div>
      {view === 'day' ? <DaySchedule staff={staff} anchorDate={anchorDate} onWarningClick={onNavigateToAlert} onShiftClick={handleShiftClick} /> : null}
      {view === 'week' ? <WeekSchedule staff={staff} onWarningClick={onNavigateToAlert} onShiftClick={handleShiftClick} /> : null}
      {view === 'month' ? <MonthSchedule onDayClick={handleMonthDayClick} /> : null}
      {selectedShift ? <ShiftDetailModal shift={selectedShift} onClose={() => setSelectedShift(null)} /> : null}
    </section>
  );
}

function ScheduleDateNavigator({ view, anchorDate, onChange }: { view: ScheduleView; anchorDate: Date; onChange: (date: Date) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const move = (direction: -1 | 1) => onChange(moveScheduleDate(anchorDate, view, direction));
  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) {
      return;
    }

    if (input.showPicker) {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="inline-flex h-11 w-fit items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
      <button type="button" onClick={() => move(-1)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-brand" aria-label="Khoảng trước">
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={openPicker} className="relative flex h-9 min-w-52 items-center justify-center rounded-md px-3 text-center text-sm font-extrabold text-slate-700 transition hover:bg-white">
        {formatScheduleRange(anchorDate, view)}
        <input
          ref={inputRef}
          type={view === 'day' ? 'date' : view === 'week' ? 'week' : 'month'}
          value={getSchedulePickerValue(anchorDate, view)}
          onChange={(event) => {
            if (event.target.value) {
              onChange(getScheduleDateFromPicker(event.target.value, view));
            }
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          tabIndex={-1}
          aria-label="Chọn thời gian"
        />
      </button>
      <button type="button" onClick={() => move(1)} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-brand" aria-label="Khoảng sau">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function ScheduleToggle({ value, onChange }: { value: ScheduleView; onChange: (value: ScheduleView) => void }) {
  return (
    <div className="inline-flex h-10 w-fit overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-1">
      {[
        ['day', 'Ngày'],
        ['week', 'Tuần'],
        ['month', 'Tháng'],
      ].map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id as ScheduleView)} className={`h-8 rounded px-4 text-xs font-extrabold ${value === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-brand'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** Day-level mock shift data keyed by day-of-month (May 2026) */
const dayShiftData: Record<number, { label: string; time: string; staffIndex: number; warning?: boolean; alertId?: string }[]> = {
  10: [
    { label: 'Sáng', time: '07:30 - 11:30', staffIndex: 7, warning: false },
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 0, warning: false },
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 3, warning: false },
    { label: 'Trưa', time: '11:30 - 13:30', staffIndex: 9, warning: false },
    { label: 'Trưa', time: '11:30 - 13:30', staffIndex: 12, warning: true, alertId: 'AL-07' },
    { label: 'Chiều', time: '14:00 - 18:00', staffIndex: 2, warning: true, alertId: 'AL-04' },
    { label: 'Chiều', time: '14:00 - 18:00', staffIndex: 11, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 10, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 5, warning: false },
  ],
  11: [
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 3, warning: false },
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 9, warning: false },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 2, warning: true, alertId: 'AL-01' },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 14, warning: true, alertId: 'AL-08' },
    { label: 'Chiều', time: '14:00 - 18:00', staffIndex: 7, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 5, warning: false },
  ],
  12: [
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 0, warning: false },
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 9, warning: false },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 8, warning: true, alertId: 'AL-05' },
    { label: 'Chiều', time: '14:00 - 18:00', staffIndex: 4, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 6, warning: false },
  ],
  13: [
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 3, warning: false },
    { label: 'Sáng', time: '09:00 - 11:00', staffIndex: 0, warning: true, alertId: 'AL-02' },
    { label: 'Sáng', time: '09:30 - 12:00', staffIndex: 5, warning: true, alertId: 'AL-09' },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 11, warning: false },
    { label: 'Chiều', time: '14:00 - 18:00', staffIndex: 5, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 10, warning: false },
  ],
  14: [
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 3, warning: true, alertId: 'AL-06' },
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 1, warning: true, alertId: 'AL-03' },
    { label: 'Sáng', time: '07:30 - 10:30', staffIndex: 17, warning: true, alertId: 'AL-10' },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 11, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 6, warning: false },
  ],
  15: [
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 4, warning: false },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 10, warning: false },
    { label: 'Tối', time: '18:00 - 21:00', staffIndex: 5, warning: false },
  ],
  16: [
    { label: 'Sáng', time: '08:00 - 12:00', staffIndex: 5, warning: false },
    { label: 'Chiều', time: '13:00 - 17:00', staffIndex: 0, warning: false },
  ],
};

function DaySchedule({ staff, anchorDate, onWarningClick, onShiftClick }: { staff: Staff[]; anchorDate: Date; onWarningClick?: (alertId: string) => void; onShiftClick?: (shift: SelectedShift) => void }) {
  const day = anchorDate.getDate();
  const shifts = dayShiftData[day] ?? [];

  if (shifts.length === 0) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center text-slate-400">
        <CalendarDays size={36} className="mb-3 opacity-40" />
        <p className="text-sm font-semibold">Không có ca trực ngày {day}/{anchorDate.getMonth() + 1}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift, i) => {
        const staffMember = staff[shift.staffIndex];
        const handleClick = shift.warning && shift.alertId
          ? () => onWarningClick?.(shift.alertId!)
          : () => onShiftClick?.({ label: shift.label, time: shift.time, staff: staffMember, warning: shift.warning, alertId: shift.alertId });
        return (
          <ShiftCard
            key={`${shift.label}-${shift.time}-${i}`}
            label={shift.label}
            time={shift.time}
            staff={staffMember}
            warning={shift.warning}
            onClick={handleClick}
          />
        );
      })}
    </div>
  );
}

function WeekSchedule({ staff, onWarningClick, onShiftClick }: { staff: Staff[]; onWarningClick?: (alertId: string) => void; onShiftClick?: (shift: SelectedShift) => void }) {
  const days = ['Thứ 2 (10/05)', 'Thứ 3 (11/05)', 'Thứ 4 (12/05)', 'Thứ 5 (13/05)', 'Thứ 6 (14/05)', 'Thứ 7 (15/05)', 'CN (16/05)'];
  const shortLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dateLabels = ['10/05', '11/05', '12/05', '13/05', '14/05', '15/05', '16/05'];
  const shifts: { day: string; label: string; time: string; staff: Staff; warning: boolean; alertId?: string }[] = [
    // Thứ 2
    { day: 'Thứ 2 (10/05)', label: 'Sáng', time: '08:00', staff: staff[0], warning: false },
    { day: 'Thứ 2 (10/05)', label: 'Sáng', time: '08:00', staff: staff[3], warning: false },
    { day: 'Thứ 2 (10/05)', label: 'Trưa', time: '11:30', staff: staff[12], warning: true, alertId: 'AL-07' },
    { day: 'Thứ 2 (10/05)', label: 'Chiều', time: '13:00', staff: staff[7], warning: false },
    { day: 'Thứ 2 (10/05)', label: 'Chiều', time: '14:00', staff: staff[2], warning: true, alertId: 'AL-04' },
    { day: 'Thứ 2 (10/05)', label: 'Tối', time: '18:00', staff: staff[10], warning: false },
    // Thứ 3
    { day: 'Thứ 3 (11/05)', label: 'Sáng', time: '08:00', staff: staff[9], warning: false },
    { day: 'Thứ 3 (11/05)', label: 'Chiều', time: '13:00', staff: staff[2], warning: true, alertId: 'AL-01' },
    { day: 'Thứ 3 (11/05)', label: 'Chiều', time: '15:00', staff: staff[14], warning: true, alertId: 'AL-08' },
    { day: 'Thứ 3 (11/05)', label: 'Chiều', time: '14:00', staff: staff[7], warning: false },
    { day: 'Thứ 3 (11/05)', label: 'Tối', time: '18:00', staff: staff[5], warning: false },
    // Thứ 4
    { day: 'Thứ 4 (12/05)', label: 'Sáng', time: '08:00', staff: staff[9], warning: false },
    { day: 'Thứ 4 (12/05)', label: 'Sáng', time: '08:00', staff: staff[0], warning: false },
    { day: 'Thứ 4 (12/05)', label: 'Chiều', time: '13:00', staff: staff[8], warning: true, alertId: 'AL-05' },
    { day: 'Thứ 4 (12/05)', label: 'Tối', time: '18:00', staff: staff[6], warning: false },
    // Thứ 5
    { day: 'Thứ 5 (13/05)', label: 'Sáng', time: '08:00', staff: staff[3], warning: false },
    { day: 'Thứ 5 (13/05)', label: 'Sáng', time: '09:00', staff: staff[0], warning: true, alertId: 'AL-02' },
    { day: 'Thứ 5 (13/05)', label: 'Sáng', time: '09:30', staff: staff[5], warning: true, alertId: 'AL-09' },
    { day: 'Thứ 5 (13/05)', label: 'Chiều', time: '13:00', staff: staff[11], warning: false },
    { day: 'Thứ 5 (13/05)', label: 'Tối', time: '18:00', staff: staff[10], warning: false },
    // Thứ 6
    { day: 'Thứ 6 (14/05)', label: 'Sáng', time: '08:00', staff: staff[3], warning: true, alertId: 'AL-06' },
    { day: 'Thứ 6 (14/05)', label: 'Sáng', time: '08:00', staff: staff[1], warning: true, alertId: 'AL-03' },
    { day: 'Thứ 6 (14/05)', label: 'Sáng', time: '07:30', staff: staff[17], warning: true, alertId: 'AL-10' },
    { day: 'Thứ 6 (14/05)', label: 'Chiều', time: '13:00', staff: staff[11], warning: false },
    { day: 'Thứ 6 (14/05)', label: 'Tối', time: '18:00', staff: staff[6], warning: false },
    // Thứ 7
    { day: 'Thứ 7 (15/05)', label: 'Sáng', time: '08:00', staff: staff[4], warning: false },
    { day: 'Thứ 7 (15/05)', label: 'Chiều', time: '13:00', staff: staff[10], warning: false },
    { day: 'Thứ 7 (15/05)', label: 'Tối', time: '18:00', staff: staff[5], warning: false },
    // Chủ nhật
    { day: 'CN (16/05)', label: 'Sáng', time: '08:00', staff: staff[5], warning: false },
    { day: 'CN (16/05)', label: 'Chiều', time: '13:00', staff: staff[0], warning: false },
  ];

  const today = 'Thứ 2 (10/05)';

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <div className="grid grid-cols-7" style={{ minWidth: '900px' }}>
        {/* ── Header row ── */}
        {days.map((day, index) => {
          const isToday = day === today;
          return (
            <div
              key={`h-${day}`}
              className={`flex flex-col items-center justify-center border-b border-r border-slate-200 px-1 py-3 last:border-r-0 ${
                isToday
                  ? 'bg-brand text-white'
                  : index >= 5
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="text-xs font-extrabold uppercase tracking-wide">{shortLabels[index]}</span>
              <span className={`mt-0.5 text-[11px] font-semibold ${isToday ? 'text-white/80' : 'opacity-60'}`}>{dateLabels[index]}</span>
            </div>
          );
        })}

        {/* ── Body columns ── */}
        {days.map((day, index) => {
          const dayShifts = shifts.filter((shift) => shift.day === day);
          const isToday = day === today;
          return (
            <div
              key={`b-${day}`}
              className={`flex min-h-[420px] flex-col gap-2 border-r border-slate-100 p-2 last:border-r-0 ${
                isToday ? 'bg-sky-50/60' : index >= 5 ? 'bg-amber-50/30' : 'bg-white'
              }`}
            >
              {dayShifts.length === 0 ? (
                <p className="mt-8 text-center text-xs font-semibold text-slate-300">Không có ca</p>
              ) : (
                dayShifts.map((shift, i) => {
                  const handleClick = shift.warning && shift.alertId
                    ? () => onWarningClick?.(shift.alertId!)
                    : () => onShiftClick?.({ label: shift.label, time: shift.time, staff: shift.staff, warning: shift.warning, alertId: shift.alertId });
                  return (
                    <WeekShiftCard
                      key={`${shift.day}-${shift.label}-${i}`}
                      label={shift.label}
                      time={shift.time}
                      staff={shift.staff}
                      warning={shift.warning}
                      onClick={handleClick}
                    />
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Compact card specifically designed for the narrow Week View columns */
function WeekShiftCard({ label, time, staff, warning = false, onClick }: { label: string; time: string; staff?: Staff; warning?: boolean; onClick?: () => void }) {
  const shiftColors: Record<string, string> = {
    'Sáng': 'border-l-emerald-400 bg-emerald-50',
    'Chiều': 'border-l-sky-400 bg-sky-50',
    'Trưa': 'border-l-amber-400 bg-amber-50',
    'Tối': 'border-l-indigo-400 bg-indigo-50',
  };
  const colorClass = warning ? 'border-l-rose-400 bg-rose-50' : (shiftColors[label] ?? 'border-l-slate-300 bg-slate-50');
  const interactiveClass = warning && onClick
    ? 'cursor-pointer hover:ring-2 hover:ring-red-400'
    : onClick
      ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
      : '';

  return (
    <div
      className={`rounded-md border border-slate-200 border-l-[3px] p-2 text-xs shadow-sm transition-all ${colorClass} ${interactiveClass}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <p className="font-extrabold text-slate-500">{label} · {time}</p>
      <p className="mt-1 truncate font-extrabold text-slate-700" title={staff?.name}>{staff?.name}</p>
      <p className="truncate text-[10px] font-semibold text-slate-400">{staff?.specialty}</p>
      {warning ? (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-rose-500">
          <AlertTriangle size={11} /> Xem cảnh báo →
        </p>
      ) : null}
    </div>
  );
}

function MonthSchedule({ onDayClick }: { onDayClick?: (day: number) => void }) {
  // May 2026: 31 days, starts on Friday (day index 4 when Mon=0)
  const totalDays = 31;
  const startOffset = 4; // 0=Mon … 4=Fri → May 1 is a Friday
  const busyDays = new Set([1, 2, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 22, 25, 26, 27, 28, 30]);
  const warningDays = new Set([11, 13, 14, 22]);
  const todayDay = 10; // highlight "today"

  // Build 35 cells (5 rows × 7 cols), first `startOffset` cells are empty
  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to fill the last row
  while (cells.length < 35) {
    cells.push(null);
  }

  const weekdayHeaders = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div>
      {/* ── Weekday header ── */}
      <div className="grid grid-cols-7 rounded-t-lg border border-b-0 border-slate-200 bg-slate-100">
        {weekdayHeaders.map((label, index) => (
          <div
            key={label}
            className={`py-2.5 text-center text-xs font-extrabold uppercase tracking-wider ${
              index >= 5 ? 'text-amber-600' : 'text-slate-500'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Calendar grid: 5 rows × 7 cols ── */}
      <div className="grid grid-cols-7 rounded-b-lg border border-slate-200">
        {cells.map((day, index) => {
          const colIndex = index % 7;
          const isWeekend = colIndex >= 5;
          const isToday = day === todayDay;
          const hasBusy = day !== null && busyDays.has(day);
          const hasWarning = day !== null && warningDays.has(day);
          const isClickable = day !== null;

          return (
            <div
              key={index}
              onClick={isClickable ? () => onDayClick?.(day) : undefined}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDayClick?.(day); } } : undefined}
              className={`relative min-h-[82px] border-b border-r border-slate-100 p-2 transition-colors last:border-r-0 [&:nth-child(7n)]:border-r-0 ${
                day === null
                  ? 'bg-slate-50/60'
                  : isToday
                    ? 'bg-sky-50 ring-2 ring-inset ring-brand/40 cursor-pointer hover:bg-sky-100/70'
                    : isWeekend
                      ? 'bg-amber-50/40 cursor-pointer hover:bg-blue-50'
                      : 'bg-white cursor-pointer hover:bg-blue-50'
              }`}
            >
              {day !== null ? (
                <>
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                      isToday ? 'bg-brand text-white' : isWeekend ? 'text-amber-600' : 'text-slate-600'
                    }`}
                  >
                    {day}
                  </span>
                  {/* Color dots indicator area */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    {hasBusy ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-brand shadow-sm" title="Có ca trực" />
                    ) : null}
                    {hasWarning ? (
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 shadow-sm" title="Cảnh báo trùng lịch" />
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Có lịch trực
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" /> Cảnh báo trùng lịch
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[9px] font-extrabold text-white">10</span> Hôm nay
        </span>
        <span className="ml-auto text-[10px] italic text-slate-400">Bấm vào ô ngày để xem chi tiết</span>
      </div>
    </div>
  );
}

function ShiftCard({ label, time, staff, warning = false, onClick }: { label: string; time: string; staff?: Staff; warning?: boolean; onClick?: () => void }) {
  const interactiveClass = warning && onClick
    ? 'cursor-pointer hover:ring-2 hover:ring-red-400'
    : onClick
      ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
      : '';

  return (
    <div
      className={`rounded-md border p-3 text-sm shadow-sm transition-all ${warning ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-200 bg-white text-slate-700'} ${interactiveClass}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <p className="text-xs font-extrabold text-slate-400">{label} · {time}</p>
      <p className="mt-2 font-extrabold">{staff?.name}</p>
      <p className="text-xs font-semibold">{staff?.specialty}</p>
      {warning ? (
        <p className="mt-2 flex items-center gap-1 text-xs font-extrabold">
          <AlertTriangle size={14} /> {onClick ? 'Xem cảnh báo →' : 'Trùng lịch / Nghỉ phép'}
        </p>
      ) : null}
    </div>
  );
}

/** Mock location data based on staff role */
function getShiftLocation(staff: Staff): string {
  const locations: Record<StaffRole, string[]> = {
    'Bác sĩ': ['Phòng khám 102', 'Phòng khám 201', 'Phòng khám 305', 'Phòng khám 118'],
    'Điều dưỡng': ['Phòng tiêm 01', 'Phòng thủ thuật 03', 'Khu theo dõi A2'],
    'Kỹ thuật viên': ['Phòng X-Quang', 'Phòng Siêu âm B1', 'Phòng XN Huyết học'],
    'Lễ tân': ['Quầy tiếp đón 1', 'Quầy tiếp đón 2', 'Bàn hướng dẫn sảnh'],
  };
  const pool = locations[staff.role] ?? ['Phòng khám 102'];
  // Deterministic pick based on staff id
  const idx = parseInt(staff.id.replace('ST-', ''), 10) % pool.length;
  return pool[idx];
}

function getShiftStatusInfo(staff: Staff): { text: string; color: string } {
  if (staff.status === 'active') return { text: 'Đúng giờ', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (staff.status === 'leave') return { text: 'Nghỉ phép', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { text: 'Chưa đến ca', color: 'text-slate-500 bg-slate-50 border-slate-200' };
}

function ShiftDetailModal({ shift, onClose }: { shift: SelectedShift; onClose: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const location = getShiftLocation(shift.staff);
  const [tempLabel, setTempLabel] = useState(shift.label);
  const [tempLoc, setTempLoc] = useState(location);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const statusInfo = getShiftStatusInfo(shift.staff);

  const shiftColorMap: Record<string, { bg: string; icon: string }> = {
    'Sáng': { bg: 'from-emerald-500 to-teal-600', icon: '🌅' },
    'Trưa': { bg: 'from-amber-500 to-orange-500', icon: '☀️' },
    'Chiều': { bg: 'from-sky-500 to-blue-600', icon: '🌤️' },
    'Tối': { bg: 'from-indigo-500 to-violet-600', icon: '🌙' },
  };
  const shiftStyle = shiftColorMap[tempLabel] ?? shiftColorMap[shift.label] ?? { bg: 'from-slate-500 to-slate-600', icon: '📋' };

  const handleSave = () => {
    alert('Đã cập nhật ca trực!');
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết ca trực"
    >
      <div className="w-full max-w-md animate-[modalIn_0.25s_ease-out] rounded-2xl bg-white shadow-2xl">
        {/* ── Header with gradient ── */}
        <div className={`relative rounded-t-2xl bg-gradient-to-r ${shiftStyle.bg} px-6 py-5`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
          <p className="text-sm font-semibold text-white/80">Chi tiết ca trực</p>
          <p className="mt-1 text-xl font-extrabold text-white">
            {shiftStyle.icon} {tempLabel} · {tempLabel === 'Sáng' ? '08:00' : tempLabel === 'Chiều' ? '13:00' : tempLabel === 'Tối' ? '18:00' : shift.time}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="space-y-4 px-6 py-5">
          {/* Staff info */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800">{shift.staff.name}</p>
              <p className="text-sm font-semibold text-slate-500">{shift.staff.role} · {shift.staff.specialty}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Detail rows */}
          <div className="grid gap-3">
            {isEditing ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-brand">
                  <Clock size={17} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Thời gian</p>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:border-blue-500 outline-none text-sm font-semibold bg-white cursor-pointer"
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                  >
                    <option value="Sáng">Sáng - 08:00</option>
                    <option value="Chiều">Chiều - 13:00</option>
                    <option value="Tối">Tối - 18:00</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-brand">
                  <Clock size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Thời gian</p>
                  <p className="text-sm font-extrabold text-slate-700">
                    {tempLabel} — {tempLabel === 'Sáng' ? '08:00 - 12:00' : tempLabel === 'Chiều' ? '13:00 - 17:00' : tempLabel === 'Tối' ? '18:00 - 22:00' : shift.time}
                  </p>
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
                  <MapPin size={17} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Vị trí làm việc</p>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:border-blue-500 outline-none text-sm font-semibold"
                    value={tempLoc}
                    onChange={(e) => setTempLoc(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-500">
                  <MapPin size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Vị trí làm việc</p>
                  <p className="text-sm font-extrabold text-slate-700">{tempLoc}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                <Stethoscope size={17} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase text-slate-400">Chuyên khoa</p>
                <p className="text-sm font-extrabold text-slate-700">{shift.staff.specialty}</p>
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-3 pt-2">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <span className="text-xs font-semibold text-slate-400">Mã NS: {shift.staff.id}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setTempLabel(shift.label);
                  setTempLoc(location);
                  setIsEditing(false);
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 px-5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-green-500 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-600"
              >
                Lưu thay đổi
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 px-5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-200"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1f7fb9]"
              >
                <Edit3 size={15} />
                Chỉnh sửa ca
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ staff, selectedAlertId, onSelectAlert, onAssign }: { staff: Staff[]; selectedAlertId: string; onSelectAlert: (id: string) => void; onAssign: (staff: Staff) => void }) {
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];
  const replacement = staff.find((item) => item.id === selectedAlert.replacementId) ?? staff[0];
  const [confirmAssign, setConfirmAssign] = useState(false);

  return (
    <section className="flex flex-row items-start gap-6 overflow-x-auto">
      <div className="flex w-1/3 min-w-72 flex-col gap-3 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="panel-title">Danh sách cảnh báo</h2>
        </div>
        <div className="max-h-[520px] space-y-3 overflow-y-auto p-4">
          {alerts.map((alert) => {
            const active = selectedAlert.id === alert.id;
            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => onSelectAlert(alert.id)}
                className={`block w-full rounded-lg border p-4 text-left transition ${
                  active ? 'border-2 border-red-300 bg-red-50' : 'border-gray-100 bg-white hover:border-brand'
                }`}
              >
                <p className="font-extrabold text-slate-800">{alert.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{alert.shift}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-2/3 min-w-[520px] rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="panel-title">Chi tiết & Xử lý</h2>
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="flex items-center gap-2 font-extrabold text-rose-600"><AlertTriangle size={18} /> {selectedAlert.title}</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">Chuyên khoa: {selectedAlert.specialty}</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">Lý do: {selectedAlert.reason}</p>
        </div>
        <div className="mt-5 rounded-lg border border-gray-100 bg-slate-50 p-4">
          <h3 className="mb-4 text-sm font-extrabold text-slate-700">Gợi ý nhân sự sẵn sàng thay thế</h3>
          <div className="flex items-center gap-3 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-slate-800">{replacement.name}</p>
              <p className="text-sm font-semibold text-emerald-600">Đang rảnh - Có thể nhận ca thay thế</p>
            </div>
          </div>
          <button type="button" onClick={() => setConfirmAssign(true)} className="mt-5 w-full rounded-lg bg-brand py-3 font-bold text-white shadow-md transition hover:bg-[#1f7fb9] lg:ml-auto">
            Xác nhận Điều phối
          </button>
        </div>
        {confirmAssign ? (
          <ConfirmDialog
            title="Xác nhận điều phối thay thế?"
            message={`${replacement.name} sẽ được phân công xử lý cảnh báo: ${selectedAlert.title}.`}
            confirmText="Xác nhận điều phối"
            onCancel={() => setConfirmAssign(false)}
            onConfirm={() => {
              onAssign(replacement);
              setConfirmAssign(false);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}

function SelectMenu({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="form-input flex items-center justify-between text-left" onClick={() => setOpen((current) => !current)}>
        <span className="truncate">{value}</span>
        <ChevronDown size={16} />
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

function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const tone: Record<StaffStatus, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-transparent',
    leave: 'bg-slate-100 text-slate-500 border-transparent',
    upcoming: 'bg-white text-slate-500 border-slate-300',
  };

  return <span className={`inline-flex rounded-full border px-4 py-1 text-xs font-extrabold ${tone[status]}`}>{statusLabels[status]}</span>;
}

function moveScheduleDate(date: Date, view: ScheduleView, direction: -1 | 1) {
  const next = new Date(date);
  if (view === 'day') {
    next.setDate(next.getDate() + direction);
  } else if (view === 'week') {
    next.setDate(next.getDate() + direction * 7);
  } else {
    next.setMonth(next.getMonth() + direction);
  }
  return next;
}

function formatScheduleRange(date: Date, view: ScheduleView) {
  if (view === 'day') {
    return toDisplayDate(date);
  }

  if (view === 'week') {
    return `Tuần ${toShortDate(getWeekStart(date))} - ${toShortDate(getWeekEnd(date))}`;
  }

  return new Intl.DateTimeFormat('vi-VN', { month: '2-digit', year: 'numeric' }).format(date).replace('/', ', ');
}

function getSchedulePickerValue(date: Date, view: ScheduleView) {
  if (view === 'day') {
    return toIsoInput(date);
  }

  if (view === 'week') {
    return toIsoWeekInput(date);
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getScheduleDateFromPicker(value: string, view: ScheduleView) {
  if (view === 'day') {
    return fromIsoInput(value);
  }

  if (view === 'week') {
    return fromIsoWeekInput(value);
  }

  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function toDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function toShortDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
}

function toIsoInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fromIsoInput(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getWeekStart(date: Date) {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = current.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + offset);
  return current;
}

function getWeekEnd(date: Date) {
  const end = getWeekStart(date);
  end.setDate(end.getDate() + 6);
  return end;
}

function toIsoWeekInput(value: Date) {
  const date = new Date(value);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
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

const statusLabels: Record<StaffStatus, string> = {
  active: 'Đang trực',
  leave: 'Nghỉ phép',
  upcoming: 'Chưa đến ca',
};
