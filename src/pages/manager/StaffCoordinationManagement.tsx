import { AlertTriangle, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, FileText, MapPin, Pencil, Plus, Search, Stethoscope, Trash2, UserRound, UsersRound, X, Download } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { mockStaff } from '../../data/clinicMock';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';
import SharedPagination from '../../components/common/Pagination';
import useDynamicPageSize from '../../components/common/useDynamicPageSize';

type StaffTab = 'list' | 'schedule' | 'alerts';
type ScheduleView = 'day' | 'week' | 'month';
type StaffRole = 'Bác sĩ' | 'Điều dưỡng' | 'Kỹ thuật viên' | 'Lễ tân';
type OverrideStatus = 'PRESENT' | 'ABSENT' | 'APPROVED_LEAVE' | null;
type AttendanceState = 'upcoming' | 'present' | 'late' | 'absent' | 'approvedLeave';
type AbsenceSource = 'manual' | 'auto' | null;

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  phone: string;
  email: string;
  shiftStart: string;
  shiftEnd: string;
  checkInAt: string | null;
  overrideStatus: OverrideStatus;
  manualCheckInBy?: string;
  manualCheckInAt?: string;
  absenceReportedBy?: string;
  absenceReportedAt?: string;
};

type DerivedAttendance = {
  attendanceState: AttendanceState;
  absenceSource: AbsenceSource;
  effectiveCheckInAt: string | null;
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

type ReportAbsenceRequest = {
  id: string;
  name: string;
};

type ShiftLabel = 'Sáng' | 'Chiều' | 'Tối' | 'Cả ngày';

type CreatedShift = {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  label: ShiftLabel;
  startTime: string;
  endTime: string;
  location: string;
  note: string;
};

const shiftTimeDefaults: Record<ShiftLabel, { start: string; end: string }> = {
  'Sáng': { start: '08:00', end: '12:00' },
  'Chiều': { start: '13:00', end: '17:00' },
  'Tối': { start: '18:00', end: '22:00' },
  'Cả ngày': { start: '08:00', end: '17:00' },
};

const primaryText = 'text-brand';
const primaryBg = 'bg-brand';
const roles: StaffRole[] = ['Bác sĩ', 'Điều dưỡng', 'Kỹ thuật viên', 'Lễ tân'];
const specialties = ['Không áp dụng', 'Tai Mũi Họng', 'Nội Tổng Hợp', 'Nhi Khoa', 'Lễ tân & Điều phối'];
const attendanceGraceMinutes = 30;
const demoCurrentTime = '2026-06-01T08:45:00';
const currentManagerUserId = 'manager-demo';

function getDefaultShiftWindow(role: StaffRole) {
  if (role === 'Bác sĩ') return { shiftStart: '2026-06-01T08:00:00', shiftEnd: '2026-06-01T12:00:00' };
  if (role === 'Điều dưỡng') return { shiftStart: '2026-06-01T13:00:00', shiftEnd: '2026-06-01T17:00:00' };
  if (role === 'Kỹ thuật viên') return { shiftStart: '2026-06-01T08:00:00', shiftEnd: '2026-06-01T17:00:00' };
  return { shiftStart: '2026-06-01T08:00:00', shiftEnd: '2026-06-01T17:00:00' };
}

function createStaff(
  staff: Omit<Staff, 'shiftStart' | 'shiftEnd' | 'checkInAt' | 'overrideStatus'> & Partial<Pick<Staff, 'shiftStart' | 'shiftEnd' | 'checkInAt' | 'overrideStatus' | 'manualCheckInBy' | 'manualCheckInAt' | 'absenceReportedBy' | 'absenceReportedAt'>>
): Staff {
  const shift = getDefaultShiftWindow(staff.role);
  return {
    ...staff,
    shiftStart: staff.shiftStart ?? shift.shiftStart,
    shiftEnd: staff.shiftEnd ?? shift.shiftEnd,
    checkInAt: staff.checkInAt ?? null,
    overrideStatus: staff.overrideStatus ?? null,
  };
}

function addMinutes(value: string, minutes: number) {
  return new Date(new Date(value).getTime() + minutes * 60 * 1000);
}

function deriveAttendance(staff: Staff, currentTime = demoCurrentTime): DerivedAttendance {
  if (staff.overrideStatus === 'APPROVED_LEAVE') {
    return { attendanceState: 'approvedLeave', absenceSource: null, effectiveCheckInAt: null };
  }

  if (staff.overrideStatus === 'ABSENT') {
    return { attendanceState: 'absent', absenceSource: 'manual', effectiveCheckInAt: null };
  }

  if (staff.overrideStatus === 'PRESENT') {
    return { attendanceState: 'present', absenceSource: null, effectiveCheckInAt: staff.manualCheckInAt ?? currentTime };
  }

  const effectiveCheckInAt = staff.checkInAt;
  const graceDeadline = addMinutes(staff.shiftStart, attendanceGraceMinutes);

  if (effectiveCheckInAt) {
    return {
      attendanceState: new Date(effectiveCheckInAt) <= graceDeadline ? 'present' : 'late',
      absenceSource: null,
      effectiveCheckInAt,
    };
  }

  if (new Date(currentTime) < graceDeadline) {
    return { attendanceState: 'upcoming', absenceSource: null, effectiveCheckInAt: null };
  }

  return { attendanceState: 'absent', absenceSource: 'auto', effectiveCheckInAt: null };
}

function isStaffAvailable(staff: Staff) {
  const state = deriveAttendance(staff).attendanceState;
  return state === 'present' || state === 'late' || state === 'upcoming';
}

function formatShiftTimeRange(staff: Staff) {
  return `${formatTime(staff.shiftStart)} - ${formatTime(staff.shiftEnd)}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

const initialStaff: Staff[] = [
  createStaff({ id: 'ST-001', name: 'BS. Nguyễn Duy Cương', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0912.345.678', email: 'cuongnd@fakeeh.care', checkInAt: '2026-06-01T08:05:00' }),
  createStaff({ id: 'ST-045', name: 'Điều dưỡng Nguyễn Nhật Linh', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0988.123.456', email: 'linhnn@fakeeh.care', overrideStatus: 'APPROVED_LEAVE' }),
  createStaff({ id: 'ST-052', name: 'BS. Trần Văn C', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0904.555.666', email: 'tranc@fakeeh.care' }),
  createStaff({ id: 'ST-060', name: 'BS. Lê Nguyễn Công Minh', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0908.888.222', email: 'minhlnc@fakeeh.care', checkInAt: '2026-06-01T08:45:00' }),
  createStaff({ id: 'ST-077', name: 'KTV. Phạm Anh Khoa', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0933.123.222', email: 'khoapa@fakeeh.care' }),
  createStaff({ id: 'ST-083', name: 'BS. Hoàng Minh Khang', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0977.654.321', email: 'khanghm@fakeeh.care', checkInAt: '2026-06-01T07:55:00' }),
  createStaff({ id: 'ST-091', name: 'ĐD. Mai Thu Hằng', role: 'Điều dưỡng', specialty: 'Nhi Khoa', phone: '0966.777.888', email: 'hangmt@fakeeh.care' }),
  createStaff({ id: 'ST-104', name: 'LT. Phạm Quỳnh Anh', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0945.888.999', email: 'anhpq@fakeeh.care', checkInAt: '2026-06-01T08:10:00' }),
  createStaff({ id: 'ST-118', name: 'BS. Vũ Hải Nam', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0932.222.111', email: 'namvh@fakeeh.care', overrideStatus: 'ABSENT', absenceReportedBy: currentManagerUserId, absenceReportedAt: '2026-06-01T08:20:00' }),
  createStaff({ id: 'ST-126', name: 'KTV. Nguyễn Đức Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0921.555.777', email: 'huynd@fakeeh.care', checkInAt: '2026-06-01T08:25:00' }),
  createStaff({ id: 'ST-139', name: 'ĐD. Trần Bảo Ngọc', role: 'Điều dưỡng', specialty: 'Tai Mũi Họng', phone: '0919.333.444', email: 'ngoctb@fakeeh.care' }),
  createStaff({ id: 'ST-150', name: 'BS. Đặng Minh Quân', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0981.222.333', email: 'quandm@fakeeh.care', checkInAt: '2026-06-01T08:32:00' }),
  createStaff({ id: 'ST-163', name: 'LT. Nguyễn Hoài An', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0909.321.456', email: 'annh@fakeeh.care', overrideStatus: 'PRESENT', manualCheckInBy: currentManagerUserId, manualCheckInAt: '2026-06-01T08:35:00' }),
  createStaff({ id: 'ST-174', name: 'ĐD. Lê Phương Mai', role: 'Điều dưỡng', specialty: 'Nội Tổng Hợp', phone: '0938.654.777', email: 'mailp@fakeeh.care' }),
  createStaff({ id: 'ST-185', name: 'BS. Phạm Minh D', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0962.444.555', email: 'minhdp@fakeeh.care', checkInAt: '2026-06-01T08:00:00' }),
  createStaff({ id: 'ST-196', name: 'BS. Nguyễn Thu Hương', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0971.222.888', email: 'huongnt@fakeeh.care', checkInAt: '2026-06-01T08:18:00' }),
  createStaff({ id: 'ST-207', name: 'KTV. Trương Gia Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0915.333.777', email: 'huytg@fakeeh.care', overrideStatus: 'APPROVED_LEAVE' }),
  createStaff({ id: 'ST-218', name: 'ĐD. Hồ Minh Tâm', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0906.888.111', email: 'tamhm@fakeeh.care' }),
];

const standardizedStaff: Staff[] = mockStaff.map((item, index) => createStaff({
  id: item.id,
  name: item.name,
  role: item.role,
  specialty: item.specialty,
  phone: item.phone,
  email: item.email,
  checkInAt: index % 5 === 0 ? '2026-06-01T08:45:00' : index % 3 === 0 ? '2026-06-01T08:05:00' : undefined,
  overrideStatus: index === 1 || index === 16 ? 'APPROVED_LEAVE' : index === 8 ? 'ABSENT' : null,
  absenceReportedBy: index === 8 ? currentManagerUserId : undefined,
  absenceReportedAt: index === 8 ? '2026-06-01T08:20:00' : undefined,
}));

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
  const [staff, setStaff] = useState(standardizedStaff);
  const [activeTab, setActiveTab] = useState<StaffTab>('list');
  const [selectedAlertId, setSelectedAlertId] = useState(alerts[0].id);
  const [warningList, setWarningList] = useState<AlertItem[]>(alerts);
  const [createdShifts, setCreatedShifts] = useState<CreatedShift[]>([]);
  const [pendingAbsence, setPendingAbsence] = useState<ReportAbsenceRequest | null>(null);

  const handleRequestAbsence = (request: ReportAbsenceRequest) => {
    setPendingAbsence(request);
  };

  const handleMarkPresent = (staffId: string, name: string) => {
    const checkInAt = new Date().toISOString();
    setStaff((items) =>
      items.map((item) => (
        item.id === staffId
          ? {
              ...item,
              overrideStatus: 'PRESENT',
              manualCheckInBy: currentManagerUserId,
              manualCheckInAt: checkInAt,
              absenceReportedBy: undefined,
              absenceReportedAt: undefined,
            }
          : item
      ))
    );
    onNotify?.('✓ Đã xác nhận có mặt và ghi nhận vào báo cáo chấm công');
  };

  const handleCancelAbsence = (staffId: string, name: string) => {
    setStaff((items) =>
      items.map((item) => (
        item.id === staffId && item.overrideStatus === 'ABSENT'
          ? {
              ...item,
              overrideStatus: null,
              absenceReportedBy: undefined,
              absenceReportedAt: undefined,
            }
          : item
      ))
    );
    onNotify?.(`Đã hủy báo vắng cho ${name}`);
  };

  const confirmReportAbsence = () => {
    if (!pendingAbsence) {
      return;
    }

    setStaff((items) =>
      items.map((item) => (
        item.id === pendingAbsence.id
          ? {
              ...item,
              overrideStatus: 'ABSENT',
              absenceReportedBy: currentManagerUserId,
              absenceReportedAt: demoCurrentTime,
            }
          : item
      ))
    );
    onNotify?.(`Đã ghi nhận báo vắng cho ${pendingAbsence.name}`);
    setPendingAbsence(null);
  };

  const handleCreateShift = (shift: CreatedShift) => {
    setCreatedShifts((prev) => [...prev, shift]);
    onNotify?.('Phân công ca trực thành công ✓');
  };

  return (
    <div>
      {pendingAbsence ? (
        <ConfirmDialog
          title="Xác nhận báo vắng"
          message={`Xác nhận báo vắng nhân sự ${pendingAbsence.name}?`}
          cancelText="Hủy bỏ"
          confirmText="Xác nhận"
          tone="danger"
          iconless
          showCloseButton={false}
          onCancel={() => setPendingAbsence(null)}
          onConfirm={confirmReportAbsence}
        />
      ) : null}
      <h1 className="mb-4 text-xl font-bold text-slate-800">Lịch trực & Điều phối</h1>
      <StaffTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-5">
        {activeTab === 'list' ? (
          <StaffList
            staff={staff}
            onMarkPresent={handleMarkPresent}
            onRequestAbsence={handleRequestAbsence}
            onCancelAbsence={handleCancelAbsence}
            onNotify={onNotify}
          />
        ) : null}
        {activeTab === 'schedule' ? (
          <ScheduleTab
            staff={staff}
            createdShifts={createdShifts}
            onCreateShift={handleCreateShift}
            onNavigateToAlert={(alertId) => {
              setSelectedAlertId(alertId);
              setActiveTab('alerts');
            }}
          />
        ) : null}
        {activeTab === 'alerts' ? (
          <AlertsTab
            staff={staff}
            alerts={warningList}
            selectedAlertId={selectedAlertId}
            onSelectAlert={setSelectedAlertId}
            onAssign={(replacement) => {
              setStaff((items) => items.map((item) => (
                item.id === replacement.id
                  ? { ...item, overrideStatus: 'PRESENT', manualCheckInBy: currentManagerUserId, manualCheckInAt: new Date().toISOString() }
                  : item
              )));
              setWarningList((current) => {
                const next = current.filter((alert) => alert.id !== selectedAlertId);
                setSelectedAlertId(next[0]?.id ?? '');
                return next;
              });
              onNotify?.(`✓ Đã xác nhận điều phối. ${replacement.name} sẽ nhận ca.`);
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

function StaffList({
  staff,
  onMarkPresent,
  onRequestAbsence,
  onCancelAbsence,
  onNotify,
}: {
  staff: Staff[];
  onMarkPresent: (staffId: string, name: string) => void;
  onRequestAbsence: (request: ReportAbsenceRequest) => void;
  onCancelAbsence: (staffId: string, name: string) => void;
  onNotify?: (message: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = useDynamicPageSize(5);
  const hasActiveFilters = Boolean(query.trim());
  const filteredStaff = staff.filter((item) => {
    const keyword = query.trim().toLowerCase();
    return !keyword || [item.id, item.name, item.phone, item.specialty].some((value) => value.toLowerCase().includes(keyword));
  });
  const totalStaffCount = filteredStaff.length;
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const pagedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);
  const pageStart = filteredStaff.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredStaff.length);
  const attendanceSummary = staff.reduce(
    (summary, item) => {
      const state = deriveAttendance(item).attendanceState;
      if (state === 'present') summary.present += 1;
      if (state === 'late') summary.late += 1;
      if (state === 'absent') summary.absent += 1;
      if (state === 'approvedLeave') summary.approvedLeave += 1;
      return summary;
    },
    { present: 0, late: 0, absent: 0, approvedLeave: 0 }
  );
  const stats = [
    { label: 'Tổng ca trực hôm nay', value: staff.length, icon: UsersRound, tone: 'bg-sky-50 text-brand', valueClass: 'text-slate-800' },
    { label: 'Có mặt / Đi muộn', value: attendanceSummary.present + attendanceSummary.late, icon: CalendarDays, tone: 'bg-emerald-50 text-emerald-600', valueClass: 'text-green-600' },
    { label: 'Vắng mặt / Nghỉ phép', value: attendanceSummary.absent + attendanceSummary.approvedLeave, icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600', valueClass: 'text-rose-600' },
  ];

  const getTodayShift = (item: Staff) => {
    if (item.role === 'Bác sĩ') return `Ca Sáng ${formatShiftTimeRange(item)}`;
    if (item.role === 'Điều dưỡng') return `Ca Chiều ${formatShiftTimeRange(item)}`;
    if (item.role === 'Kỹ thuật viên') return `Cả ngày ${formatShiftTimeRange(item)}`;
    return `Hành chính ${formatShiftTimeRange(item)}`;
  };

  const getCoordinationStatusBadge = (state: AttendanceState) => {
    const baseClass = 'inline-flex rounded-full px-3 py-1 text-xs font-extrabold';
    if (state === 'present') {
      return <span className={baseClass} style={{ background: 'var(--color-success-light)', color: 'color-mix(in srgb, var(--color-success) 70%, var(--color-text-primary))' }}>Có mặt</span>;
    }
    if (state === 'late') {
      return <span className={baseClass} style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>Đi muộn</span>;
    }
    if (state === 'approvedLeave') {
      return <span className={baseClass} style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>Nghỉ phép</span>;
    }
    if (state === 'upcoming') {
      return <span className={baseClass} style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-secondary)' }}>Chưa đến</span>;
    }
    return <span className={baseClass} style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>Vắng mặt</span>;
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
        {hasActiveFilters ? (
          <button
            type="button"
            className="filter-clear-btn"
            onClick={() => {
              setQuery('');
              setPage(1);
            }}
          >
            <X size={14} /> Xóa bộ lọc
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onNotify?.('Xuất báo cáo chấm công thành công!')}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition shadow-sm"
        >
          <Download size={16} />
          Xuất báo cáo chấm công
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table min-w-full text-left text-sm">
          <colgroup>
            <col style={{ width: '100px' }} />
            <col style={{ width: '180px' }} />
            <col />
            <col style={{ width: '160px' }} />
            <col style={{ width: '140px' }} />
            <col style={{ width: '190px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Mã NS</th>
              <th>Họ và tên</th>
              <th>Ca trực hôm nay</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pagedStaff.map((item) => {
              const shift = getTodayShift(item);
              const attendance = deriveAttendance(item);
              const canReportAbsent = attendance.attendanceState === 'upcoming';
              const canManualPresent = attendance.attendanceState === 'upcoming' || (attendance.attendanceState === 'absent' && attendance.absenceSource === 'auto');
              const canCancelManualAbsence = attendance.attendanceState === 'absent' && attendance.absenceSource === 'manual';

              return (
                <tr key={item.id} className="bg-white transition hover:bg-slate-50">
                  <td className="text-slate-600">{item.id}</td>
                  <td className="font-extrabold text-slate-800">{item.name}</td>
                  <td className="font-semibold text-slate-600">
                    {shift}
                  </td>
                  <td className="font-semibold text-slate-600">
                    {getShiftLocation(item)}
                  </td>
                  <td>{getCoordinationStatusBadge(attendance.attendanceState)}</td>
                  <td>
                    {canReportAbsent ? (
                      <div className="attendance-actions">
                        <button
                          type="button"
                          onClick={() => onMarkPresent(item.id, item.name)}
                          className="attendance-action-button attendance-action-button--success"
                        >
                          Xác nhận có mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestAbsence({ id: item.id, name: item.name })}
                          className="attendance-action-button attendance-action-button--danger"
                        >
                          Báo vắng
                        </button>
                      </div>
                    ) : null}
                    {canManualPresent && !canReportAbsent ? (
                      <div className="attendance-actions">
                        <button
                          type="button"
                          onClick={() => onMarkPresent(item.id, item.name)}
                          className="attendance-action-button attendance-action-button--success"
                        >
                          Xác nhận có mặt
                        </button>
                      </div>
                    ) : null}
                    {canCancelManualAbsence ? (
                      <div className="attendance-actions">
                        <button
                          type="button"
                          onClick={() => onCancelAbsence(item.id, item.name)}
                          className="attendance-action-button attendance-action-button--neutral"
                        >
                          Hủy báo vắng
                        </button>
                      </div>
                    ) : null}
                    {attendance.attendanceState === 'present' ? (
                      <div className="attendance-actions">
                        <button type="button" disabled className="attendance-action-button attendance-action-button--disabled">
                          Đã ghi nhận {attendance.effectiveCheckInAt ? formatTime(attendance.effectiveCheckInAt) : ''}
                        </button>
                      </div>
                    ) : null}
                    {attendance.attendanceState === 'late' ? (
                      <div className="attendance-actions">
                        <button type="button" disabled className="attendance-action-button attendance-action-button--disabled">
                          Đi muộn
                        </button>
                      </div>
                    ) : null}
                    {attendance.attendanceState === 'approvedLeave' ? (
                      <div className="attendance-actions">
                        <button type="button" disabled className="attendance-action-button attendance-action-button--disabled">
                          Nghỉ phép
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SharedPagination page={page} totalPages={totalPages} total={totalStaffCount} pageSize={pageSize} unit="nhân sự" onChange={setPage} />
    </section>
  );
}

function ScheduleTab({ staff, createdShifts, onCreateShift, onNavigateToAlert }: { staff: Staff[]; createdShifts: CreatedShift[]; onCreateShift: (shift: CreatedShift) => void; onNavigateToAlert?: (alertId: string) => void }) {
  const [view, setView] = useState<ScheduleView>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date(2026, 4, 10));
  const [selectedShift, setSelectedShift] = useState<SelectedShift | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleMonthDayClick = (day: number) => {
    setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth(), day));
    setView('day');
  };

  const handleShiftClick = (shift: SelectedShift) => {
    setSelectedShift(shift);
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ScheduleDateNavigator view={view} anchorDate={anchorDate} onChange={setAnchorDate} />
        <div className="flex items-center gap-3">
          <ScheduleToggle value={view} onChange={setView} />
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1f7fb9] hover:shadow-md active:translate-y-0 active:shadow-sm"
          >
            <Plus size={16} />
            Phân công ca trực
          </button>
        </div>
      </div>
      {view === 'day' ? <DaySchedule staff={staff} createdShifts={createdShifts} anchorDate={anchorDate} onWarningClick={onNavigateToAlert} onShiftClick={handleShiftClick} onCreateShift={() => setShowCreateModal(true)} /> : null}
      {view === 'week' ? <WeekSchedule staff={staff} createdShifts={createdShifts} onWarningClick={onNavigateToAlert} onShiftClick={handleShiftClick} /> : null}
      {view === 'month' ? <MonthSchedule onDayClick={handleMonthDayClick} /> : null}
      {selectedShift ? <ShiftDetailModal shift={selectedShift} onClose={() => setSelectedShift(null)} /> : null}
      {showCreateModal ? (
        <CreateShiftModal
          staff={staff}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(shift) => {
            onCreateShift(shift);
            setShowCreateModal(false);
          }}
        />
      ) : null}
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
    { label: 'Sáng', time: '11:30 - 13:30', staffIndex: 9, warning: false },
    { label: 'Sáng', time: '11:30 - 13:30', staffIndex: 12, warning: true, alertId: 'AL-07' },
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

function DaySchedule({ staff, createdShifts, anchorDate, onWarningClick, onShiftClick, onCreateShift }: { staff: Staff[]; createdShifts: CreatedShift[]; anchorDate: Date; onWarningClick?: (alertId: string) => void; onShiftClick?: (shift: SelectedShift) => void; onCreateShift?: () => void }) {
  const day = anchorDate.getDate();
  const mockShifts = dayShiftData[day] ?? [];

  // Merge dynamic shifts for this date
  const dateStr = `${anchorDate.getFullYear()}-${String(anchorDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dynamicShifts = createdShifts.filter((s) => s.date === dateStr);

  const hasAnyShifts = mockShifts.length > 0 || dynamicShifts.length > 0;
  const shiftRows = [
    ...mockShifts.map((shift, index) => {
      const staffMember = staff[shift.staffIndex];
      return {
        id: `mock-${shift.label}-${shift.time}-${index}`,
        label: shift.label,
        time: shift.time,
        staff: staffMember,
        warning: shift.warning,
        alertId: shift.alertId,
        isNew: false,
      };
    }),
    ...dynamicShifts.map((shift) => ({
      id: `new-${shift.id}`,
      label: shift.label,
      time: `${shift.startTime} - ${shift.endTime}`,
      staff: staff.find((item) => item.id === shift.staffId),
      warning: false,
      alertId: undefined,
      isNew: true,
    })),
  ];

  if (!hasAnyShifts) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center text-slate-400" role="status">
        <CalendarDays size={40} className="mb-3 opacity-30" />
        <p className="text-sm font-bold text-slate-500">Chưa có ca trực ngày {day}/{anchorDate.getMonth() + 1}</p>
        <p className="mt-1 text-xs text-slate-400">Bắt đầu bằng cách phân công ca trực cho nhân sự.</p>
        {onCreateShift ? (
          <button
            type="button"
            onClick={onCreateShift}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1f7fb9] hover:shadow-md"
          >
            <Plus size={16} />
            Phân công ca trực
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="shift-day-table-wrapper">
      <table className="data-table shift-day-table">
        <colgroup>
          <col style={{ width: '80px' }} />
          <col style={{ width: '160px' }} />
          <col style={{ width: '200px' }} />
          <col />
          <col style={{ width: '120px' }} />
          <col style={{ width: '120px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Ca</th>
            <th>Khung giờ</th>
            <th>Họ và tên</th>
            <th>Chuyên khoa / Vị trí</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {shiftRows.map((shift) => {
            const handleClick = () => {
              if (shift.warning && shift.alertId) {
                onWarningClick?.(shift.alertId);
                return;
              }
              if (shift.staff) {
                onShiftClick?.({
                  label: shift.label,
                  time: shift.time,
                  staff: shift.staff,
                  warning: shift.warning,
                  alertId: shift.alertId,
                });
              }
            };

            return (
              <tr
                key={shift.id}
                className={shift.warning ? 'shift-row--alert' : ''}
                onClick={handleClick}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleClick();
                  }
                }}
                tabIndex={0}
              >
                <td>
                  <span className="shift-session-badge">{shift.label}</span>
                  {shift.isNew ? <span className="shift-new-badge"><Plus size={10} /> Mới</span> : null}
                </td>
                <td>{shift.time}</td>
                <td className="shift-name">{shift.staff?.name ?? 'Chưa xác định'}</td>
                <td>{shift.staff?.specialty ?? 'Không áp dụng'}</td>
                <td>
                  {shift.warning ? (
                    <span className="shift-status-badge shift-status-badge--danger">
                      <AlertTriangle size={13} />
                      Cảnh báo
                    </span>
                  ) : (
                    <span className="shift-status-badge shift-status-badge--success">
                      <CheckCircle2 size={13} />
                      Bình thường
                    </span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="shift-detail-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClick();
                    }}
                  >
                    {shift.warning ? 'Cảnh báo' : 'Chi tiết'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WeekSchedule({ staff, createdShifts, onWarningClick, onShiftClick }: { staff: Staff[]; createdShifts: CreatedShift[]; onWarningClick?: (alertId: string) => void; onShiftClick?: (shift: SelectedShift) => void }) {
  const days = ['Thứ 2 (10/05)', 'Thứ 3 (11/05)', 'Thứ 4 (12/05)', 'Thứ 5 (13/05)', 'Thứ 6 (14/05)', 'Thứ 7 (15/05)', 'CN (16/05)'];
  const shortLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dateLabels = ['10/05', '11/05', '12/05', '13/05', '14/05', '15/05', '16/05'];
  const shifts: { day: string; label: string; time: string; staff: Staff; warning: boolean; alertId?: string }[] = [
    // Thứ 2
    { day: 'Thứ 2 (10/05)', label: 'Sáng', time: '08:00', staff: staff[0], warning: false },
    { day: 'Thứ 2 (10/05)', label: 'Sáng', time: '08:00', staff: staff[3], warning: false },
    { day: 'Thứ 2 (10/05)', label: 'Sáng', time: '11:30', staff: staff[12], warning: true, alertId: 'AL-07' },
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
              {(() => {
                // Merge dynamic shifts for this day
                const dayDateMap: Record<string, string> = {
                  'Thứ 2 (10/05)': '2026-05-10', 'Thứ 3 (11/05)': '2026-05-11',
                  'Thứ 4 (12/05)': '2026-05-12', 'Thứ 5 (13/05)': '2026-05-13',
                  'Thứ 6 (14/05)': '2026-05-14', 'Thứ 7 (15/05)': '2026-05-15',
                  'CN (16/05)': '2026-05-16',
                };
                const dayDate = dayDateMap[day];
                const dynShifts = dayDate ? createdShifts.filter((s) => s.date === dayDate) : [];
                const allEmpty = dayShifts.length === 0 && dynShifts.length === 0;

                return allEmpty ? (
                  <p className="mt-8 text-center text-xs font-semibold text-slate-300">Không có ca</p>
                ) : (
                  <>
                    {dayShifts.map((shift, i) => {
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
                    })}
                    {dynShifts.map((s) => {
                      const member = staff.find((st) => st.id === s.staffId);
                      return (
                        <WeekShiftCard
                          key={`new-${s.id}`}
                          label={s.label}
                          time={s.startTime}
                          staff={member}
                          isNew
                          onClick={() => onShiftClick?.({
                            label: s.label,
                            time: `${s.startTime} - ${s.endTime}`,
                            staff: member!,
                          })}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Compact card specifically designed for the narrow Week View columns */
function WeekShiftCard({ label, time, staff, warning = false, isNew = false, onClick }: { label: string; time: string; staff?: Staff; warning?: boolean; isNew?: boolean; onClick?: () => void }) {
  const shiftColors: Record<string, string> = {
    'Sáng': 'border-l-emerald-400 bg-emerald-50',
    'Chiều': 'border-l-sky-400 bg-sky-50',
    'Tối': 'border-l-indigo-400 bg-indigo-50',
  };
  const colorClass = warning ? 'border-l-rose-400 bg-rose-50' : isNew ? 'border-l-brand bg-sky-50 ring-1 ring-brand/20' : (shiftColors[label] ?? 'border-l-slate-300 bg-slate-50');
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
          <AlertTriangle size={11} /> Xem cảnh báo <ChevronRight size={11} />
        </p>
      ) : null}
      {isNew ? (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-brand"><Plus size={10} /> Mới phân công</p>
      ) : null}
    </div>
  );
}

function MonthSchedule({ onDayClick }: { onDayClick?: (day: number) => void }) {
  // May 2026: 31 days, starts on Friday (day index 4 when Mon=0)
  const totalDays = 31;
  const startOffset = 4; // 0=Mon, 4=Fri; May 1 is a Friday
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
  const attendance = deriveAttendance(staff);
  if (attendance.attendanceState === 'present') return { text: 'Đúng giờ', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (attendance.attendanceState === 'late') return { text: 'Đi muộn', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (attendance.attendanceState === 'absent') return { text: 'Vắng mặt', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  if (attendance.attendanceState === 'approvedLeave') return { text: 'Nghỉ phép', color: 'text-brand bg-sky-50 border-sky-200' };
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

  const shiftColorMap: Record<string, { bg: string; label: string }> = {
    'Sáng': { bg: 'from-emerald-500 to-teal-600', label: 'Ca sáng' },
    'Chiều': { bg: 'from-sky-500 to-blue-600', label: 'Ca chiều' },
    'Tối': { bg: 'from-indigo-500 to-violet-600', label: 'Ca tối' },
  };
  const shiftStyle = shiftColorMap[tempLabel] ?? shiftColorMap[shift.label] ?? { bg: 'from-slate-500 to-slate-600', label: 'Ca trực' };

  const handleSave = () => {
    // Toast will be shown via parent — shift saved visually
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
        <div className={`relative rounded-t-2xl bg-gradient-to-r ${shiftStyle.bg} px-4 py-3`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
          <p className="text-sm font-semibold text-white/80">Chi tiết ca trực</p>
          <p className="mt-1 text-lg font-bold text-white">
            {shiftStyle.label} · {tempLabel === 'Sáng' ? '08:00' : tempLabel === 'Chiều' ? '13:00' : tempLabel === 'Tối' ? '18:00' : shift.time}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="space-y-4 px-4 py-3">
          {/* Staff info */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-800">{shift.staff.name}</p>
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
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-3">
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
                <Pencil size={15} />
                Chỉnh sửa ca
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function CreateShiftModal({ staff, onClose, onSubmit }: { staff: Staff[]; onClose: () => void; onSubmit: (shift: CreatedShift) => void }) {
  const availableStaff = staff.filter((s) => {
    const state = deriveAttendance(s).attendanceState;
    return state === 'present' || state === 'late' || state === 'upcoming';
  });
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [shiftLabel, setShiftLabel] = useState<ShiftLabel>('Sáng');
  const [startTime, setStartTime] = useState(shiftTimeDefaults['Sáng'].start);
  const [endTime, setEndTime] = useState(shiftTimeDefaults['Sáng'].end);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-fill times when shift label changes
  const handleShiftLabelChange = (label: ShiftLabel) => {
    setShiftLabel(label);
    setStartTime(shiftTimeDefaults[label].start);
    setEndTime(shiftTimeDefaults[label].end);
  };

  // Validation
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const errors: Record<string, string> = {};
  if (!staffId) errors.staffId = 'Vui lòng chọn nhân sự';
  if (!date) errors.date = 'Vui lòng chọn ngày trực';
  else if (date < todayStr) errors.date = 'Không thể chọn ngày trong quá khứ';
  if (!location.trim()) errors.location = 'Vui lòng nhập vị trí làm việc. VD: Phòng khám 102';
  const isValid = Object.keys(errors).length === 0;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ staffId: true, date: true, location: true });
    if (!isValid) return;
    onSubmit({
      id: `CS-${Date.now()}`,
      staffId,
      date,
      label: shiftLabel,
      startTime,
      endTime,
      location: location.trim(),
      note: note.trim(),
    });
  };

  const selectedStaff = staff.find((s) => s.id === staffId);

  const shiftColorMap: Record<ShiftLabel, { bg: string; label: string }> = {
    'Sáng': { bg: 'from-emerald-500 to-teal-600', label: 'Ca sáng' },
    'Chiều': { bg: 'from-sky-500 to-blue-600', label: 'Ca chiều' },
    'Tối': { bg: 'from-indigo-500 to-violet-600', label: 'Ca tối' },
    'Cả ngày': { bg: 'from-amber-500 to-orange-500', label: 'Cả ngày' },
  };
  const shiftStyle = shiftColorMap[shiftLabel];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Phân công ca trực mới"
    >
      <div className="w-full max-w-lg animate-[modalIn_0.25s_ease-out] rounded-2xl bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className={`relative rounded-t-2xl bg-gradient-to-r ${shiftStyle.bg} px-5 py-4`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
          <p className="text-sm font-semibold text-white/80">Phân công ca trực mới</p>
          <p className="mt-1 text-lg font-bold text-white">
            {shiftStyle.label} · {startTime} - {endTime}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {/* Staff select */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nhân sự <span className="text-rose-500">*</span>
            </label>
            <select
              className={`form-input w-full cursor-pointer ${touched.staffId && errors.staffId ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
              value={staffId}
              onChange={(e) => { setStaffId(e.target.value); setTouched((t) => ({ ...t, staffId: true })); }}
              onBlur={() => setTouched((t) => ({ ...t, staffId: true }))}
            >
              <option value="">-- Chọn nhân sự --</option>
              {availableStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role} ({s.specialty})
                </option>
              ))}
            </select>
            {touched.staffId && errors.staffId ? (
              <p className="mt-1 text-xs font-semibold text-rose-500" role="alert">{errors.staffId}</p>
            ) : null}
            {selectedStaff ? (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400">
                  <UserRound size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700">{selectedStaff.name}</p>
                  <p className="text-xs text-slate-400">{selectedStaff.role} · {selectedStaff.specialty} · {selectedStaff.id}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Date + Shift type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ngày trực <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className={`form-input w-full ${touched.date && errors.date ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
                value={date}
                min={todayStr}
                onChange={(e) => { setDate(e.target.value); setTouched((t) => ({ ...t, date: true })); }}
                onBlur={() => setTouched((t) => ({ ...t, date: true }))}
              />
              {touched.date && errors.date ? (
                <p className="mt-1 text-xs font-semibold text-rose-500" role="alert">{errors.date}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Ca trực <span className="text-rose-500">*</span>
              </label>
              <select
                className="form-input w-full cursor-pointer"
                value={shiftLabel}
                onChange={(e) => handleShiftLabelChange(e.target.value as ShiftLabel)}
              >
                <option value="Sáng">Sáng (08:00 - 12:00)</option>
                <option value="Chiều">Chiều (13:00 - 17:00)</option>
                <option value="Tối">Tối (18:00 - 22:00)</option>
                <option value="Cả ngày">Cả ngày (08:00 - 17:00)</option>
              </select>
            </div>
          </div>

          {/* Time row (auto-filled, editable) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Giờ bắt đầu</label>
              <input
                type="time"
                className="form-input w-full"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Giờ kết thúc</label>
              <input
                type="time"
                className="form-input w-full"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Vị trí làm việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className={`form-input w-full ${touched.location && errors.location ? 'border-rose-400 ring-1 ring-rose-200' : ''}`}
              placeholder="VD: Phòng khám 102, Quầy tiếp đón 1..."
              value={location}
              onChange={(e) => { setLocation(e.target.value); setTouched((t) => ({ ...t, location: true })); }}
              onBlur={() => setTouched((t) => ({ ...t, location: true }))}
            />
            {touched.location && errors.location ? (
              <p className="mt-1 text-xs font-semibold text-rose-500" role="alert">{errors.location}</p>
            ) : null}
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Ghi chú <span className="text-xs text-slate-400">(tùy chọn)</span>
            </label>
            <textarea
              className="form-input w-full resize-none"
              rows={2}
              placeholder="VD: Thay thế cho BS. Trần Văn C nghỉ phép..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </form>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 px-5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-200"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as FormEvent)}
            disabled={!isValid && Object.keys(touched).length > 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1f7fb9] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} />
            Lưu phân công
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertsTab({
  staff,
  alerts,
  selectedAlertId,
  onSelectAlert,
  onAssign,
}: {
  staff: Staff[];
  alerts: AlertItem[];
  selectedAlertId: string;
  onSelectAlert: (id: string) => void;
  onAssign: (staff: Staff) => void;
}) {
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0] ?? null;
  const automaticReplacement = selectedAlert ? staff.find((item) => item.id === selectedAlert.replacementId) ?? null : null;
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(automaticReplacement);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [confirmAssign, setConfirmAssign] = useState(false);

  useEffect(() => {
    setSelectedStaff(automaticReplacement);
    setSearchQuery('');
    setRoleFilter('');
    setAvailabilityFilter('');
    setConfirmAssign(false);
  }, [automaticReplacement?.id, selectedAlert?.id]);

  const hasStaffSearchFilters = Boolean(searchQuery.trim() || roleFilter || availabilityFilter);
  const searchResults = staff.filter((item) => {
    const query = normalizeStaffSearch(searchQuery);
    const matchesQuery = !query || normalizeStaffSearch(
      `${item.id} ${item.name} ${item.phone} ${item.role} ${item.specialty}`,
    ).includes(query);
    const matchesRole =
      !roleFilter
      || (roleFilter === 'doctor' && item.role === 'Bác sĩ')
      || (roleFilter === 'nurse' && item.role === 'Điều dưỡng')
      || (roleFilter === 'technician' && item.role === 'Kỹ thuật viên')
      || (roleFilter === 'admin' && item.role === 'Lễ tân');
    const available = isStaffAvailable(item);
    const matchesAvailability =
      !availabilityFilter
      || (availabilityFilter === 'available' && available)
      || (availabilityFilter === 'busy' && !available);

    return matchesQuery && matchesRole && matchesAvailability;
  });

  if (!selectedAlert) {
    return (
      <div className="empty-state">
        <CheckCircle2 size={32} className="text-success" />
        <h3>Tất cả cảnh báo đã được xử lý</h3>
        <p>Không có sự cố nào cần điều phối lúc này.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-row items-start gap-4 overflow-x-auto">
      <div className="flex w-1/3 min-w-72 flex-col gap-3 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
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
      <div className="w-2/3 min-w-[520px] rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="panel-title">Chi tiết & Xử lý</h2>
        <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="flex items-center gap-2 font-extrabold text-rose-600"><AlertTriangle size={18} /> {selectedAlert.title}</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">Chuyên khoa: {selectedAlert.specialty}</p>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">Lý do: {selectedAlert.reason}</p>
        </div>
        <div className="mt-5 rounded-lg border border-gray-100 bg-slate-50 p-4">
          <h3 className="mb-4 text-sm font-extrabold text-slate-700">Gợi ý nhân sự sẵn sàng thay thế</h3>
          {automaticReplacement ? (
            <div className="staff-search-results staff-search-results--suggestion">
              <StaffOption staff={automaticReplacement} selected={selectedStaff?.id === automaticReplacement.id} onSelect={() => setSelectedStaff(automaticReplacement)} />
            </div>
          ) : null}

          <div className="staff-search-panel">
            <p className="staff-search-panel__label">Hoặc tìm nhân sự khác:</p>
            <div className="staff-search-row">
              <div className="staff-search-input">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Tên, mã NS, hoặc SĐT..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery ? (
                  <button type="button" onClick={() => setSearchQuery('')} aria-label="Xóa nội dung tìm kiếm">
                    <X size={12} />
                  </button>
                ) : null}
              </div>
              <select
                className="filter-select-sm"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Lọc theo vai trò"
              >
                <option value="">Tất cả vai trò</option>
                <option value="doctor">Bác sĩ</option>
                <option value="nurse">Điều dưỡng</option>
                <option value="technician">Kỹ thuật viên</option>
                <option value="admin">Hành chính</option>
              </select>
              <select
                className="filter-select-sm"
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
                aria-label="Lọc theo trạng thái sẵn sàng"
              >
                <option value="">Tất cả</option>
                <option value="available">Đang rảnh</option>
                <option value="busy">Đang có ca</option>
              </select>
            </div>
            {hasStaffSearchFilters ? (
              <div className="staff-search-results">
                {searchResults.length === 0 ? (
                  <div className="staff-search-empty">Không tìm thấy nhân sự phù hợp</div>
                ) : (
                  searchResults.map((item) => (
                    <StaffOption
                      key={item.id}
                      staff={item}
                      selected={selectedStaff?.id === item.id}
                      onSelect={() => setSelectedStaff(item)}
                    />
                  ))
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!selectedStaff}
            onClick={() => setConfirmAssign(true)}
            className="mt-5 w-full rounded-lg bg-brand py-3 font-bold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 lg:ml-auto"
          >
            {selectedStaff ? `Xác nhận: ${selectedStaff.name}` : 'Xác nhận Điều phối'}
          </button>
        </div>
        {confirmAssign && selectedStaff ? (
          <ConfirmDialog
            title="Xác nhận điều phối thay thế?"
            message={`${selectedStaff.name} sẽ được phân công xử lý cảnh báo: ${selectedAlert.title}.`}
            confirmText="Xác nhận điều phối"
            onCancel={() => setConfirmAssign(false)}
            onConfirm={() => {
              onAssign(selectedStaff);
              setConfirmAssign(false);
            }}
          />
        ) : null}
      </div>
    </section>
  );
}

function StaffOption({ staff, selected, onSelect }: { staff: Staff; selected: boolean; onSelect: () => void }) {
  const available = isStaffAvailable(staff);

  return (
    <button
      type="button"
      className={`staff-result-item ${selected ? 'staff-result-item--selected' : ''}`}
      onClick={onSelect}
    >
      <span className="staff-result-item__left">
        <span className="staff-result-item__name">{staff.name}</span>
        <span className="staff-result-item__meta">{staff.role} · {staff.specialty || 'Không áp dụng'}</span>
      </span>
      <span className={`staff-result-item__status ${available ? 'text-success' : 'text-warning'}`}>
        {available ? 'Đang rảnh' : 'Đang có ca'}
      </span>
    </button>
  );
}

function normalizeStaffSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
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

function AttendanceStateBadge({ status }: { status: AttendanceState }) {
  const tone: Record<AttendanceState, string> = {
    present: 'bg-emerald-100 text-emerald-700 border-transparent',
    late: 'bg-amber-100 text-amber-700 border-transparent',
    absent: 'bg-rose-100 text-rose-700 border-transparent',
    approvedLeave: 'bg-sky-100 text-brand border-transparent',
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

const statusLabels: Record<AttendanceState, string> = {
  present: 'Đang trực',
  late: 'Đi muộn',
  absent: 'Vắng mặt',
  approvedLeave: 'Nghỉ phép',
  upcoming: 'Chưa đến ca',
};
