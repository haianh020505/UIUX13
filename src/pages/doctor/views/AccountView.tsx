import { ChevronLeft, ChevronRight, Eye, EyeOff, KeyRound, LogOut, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

type AccountTab = 'security' | 'schedule';

export default function AccountView({
  onNotify,
  onLogout,
}: {
  onNotify: (message: string) => void;
  onLogout: () => void;
}) {
  const storedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem('triageai_user') || 'null') as { name?: string; role?: string } | null;
  }, []);
  const [activeTab, setActiveTab] = useState<AccountTab>('security');
  const [fullName, setFullName] = useState(storedUser?.name || 'BS. Nguyễn Văn A');
  const [email, setEmail] = useState('nguyenvana@fakeehcare.com');
  const [phone, setPhone] = useState('0901 222 333');
  const [currentPassword, setCurrentPassword] = useState('Doctor@123456');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const passwordMismatch = Boolean(newPassword && confirmPassword && newPassword !== confirmPassword);
  const passwordTooShort = Boolean(newPassword && newPassword.length < 6);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem('triageai_user', JSON.stringify({ role: storedUser?.role ?? 'DOCTOR', name: fullName }));
    onNotify('Đã lưu thông tin tài khoản');
  };

  const updatePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!newPassword || !confirmPassword || passwordMismatch || passwordTooShort) {
      onNotify('Vui lòng kiểm tra mật khẩu mới');
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    onNotify('Đã cập nhật mật khẩu');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tài khoản bác sĩ</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý hồ sơ, bảo mật và lịch trực cá nhân.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex">
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            Thông tin & Bảo mật
          </TabButton>
          <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
            Lịch trực cá nhân
          </TabButton>
        </div>
      </div>

      {activeTab === 'security' ? (
        <>
          <div className="grid items-stretch gap-5 xl:grid-cols-2">
            <form onSubmit={saveProfile} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-brand">
                  <UserRound size={22} />
                </div>
                <div>
                  <h2 className="panel-title">Thông tin cá nhân</h2>
                  <p className="panel-subtitle">Cập nhật thông tin hiển thị trong hồ sơ bác sĩ.</p>
                </div>
              </div>
              <div className="flex-1 space-y-4 p-4">
                <Field label="Họ và Tên">
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input className="form-input pl-10" value={fullName} onChange={(event) => setFullName(event.target.value)} />
                  </div>
                </Field>
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input className="form-input pl-10" value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </Field>
                <Field label="Số điện thoại">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input className="form-input pl-10" value={phone} onChange={(event) => setPhone(event.target.value)} />
                  </div>
                </Field>
              </div>
              <div className="flex justify-end border-t border-slate-100 px-4 py-3">
                <button type="submit" className="secondary-action cursor-pointer">
                  <Save size={16} />
                  Lưu thay đổi
                </button>
              </div>
            </form>

            <form onSubmit={updatePassword} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-brand">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h2 className="panel-title">Bảo mật</h2>
                  <p className="panel-subtitle">Quản lý mật khẩu và thông báo bảo mật.</p>
                </div>
              </div>
              <div className="flex-1 space-y-4 p-4">
                <PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={setCurrentPassword} visible={showCurrentPassword} onToggleVisible={() => setShowCurrentPassword((value) => !value)} />
                <PasswordField label="Mật khẩu mới" value={newPassword} onChange={setNewPassword} visible={showNewPassword} onToggleVisible={() => setShowNewPassword((value) => !value)} placeholder="Nhập mật khẩu mới" />
                <PasswordField label="Nhập lại mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirmPassword} onToggleVisible={() => setShowConfirmPassword((value) => !value)} placeholder="Nhập lại mật khẩu mới" />
                {passwordTooShort ? <p className="text-sm font-semibold text-rose-500">Mật khẩu mới cần tối thiểu 6 ký tự.</p> : null}
                {passwordMismatch ? <p className="text-sm font-semibold text-rose-500">Mật khẩu nhập lại chưa khớp.</p> : null}
                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-extrabold text-slate-700">Nhận SMS thông báo ca Cấp cứu</p>
                    <p className="text-xs font-semibold text-slate-400">Nhận nhắc nhở khi có ca nguy cơ cao cần xử lý.</p>
                  </div>
                  <Toggle checked={smsEnabled} onChange={() => setSmsEnabled((value) => !value)} />
                </div>
              </div>
              <div className="flex justify-end border-t border-slate-100 px-4 py-3">
                <button type="submit" className="secondary-action cursor-pointer">
                  <ShieldCheck size={16} />
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>

          <section className="rounded-xl border border-rose-200 bg-rose-50 shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-rose-700">Đăng xuất khỏi hệ thống</h2>
                <p className="mt-1 text-sm font-semibold text-rose-500">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.</p>
              </div>
              <button type="button" onClick={onLogout} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-500 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-600">
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          </section>
        </>
      ) : (
        <ScheduleTab />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-14 min-w-48 cursor-pointer items-center justify-center px-5 text-sm font-extrabold transition ${
        active ? 'text-brand' : 'text-slate-500 hover:text-brand'
      }`}
    >
      {children}
      {active ? <span className="absolute bottom-0 left-0 h-1 w-full bg-brand" /> : null}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          className="form-input pr-12"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <button type="button" onClick={onToggleVisible} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-brand" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex h-7 w-12 cursor-pointer items-center rounded-full p-0.5 transition ${checked ? 'bg-brand' : 'bg-slate-300'}`}
      aria-pressed={checked}
    >
      <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function ScheduleTab() {
  const shifts = [
    { date: '2026-05-10', dayLabel: 'Thứ 2', shiftLabel: 'Ca Sáng', time: '08:00 - 12:00', room: 'Phòng 202', isCover: false },
    { date: '2026-05-11', dayLabel: 'Thứ 3', shiftLabel: 'Ca Sáng', time: '08:00 - 12:00', room: 'Phòng 203', isCover: false },
    { date: '2026-05-13', dayLabel: 'Thứ 5', shiftLabel: 'Ca Chiều', time: '13:00 - 17:00', room: 'Trực thay bác sĩ B', isCover: true },
  ];
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date('2026-05-10T00:00:00'));
  const weekRange = getWeekRange(anchorDate);
  const visibleWeekShifts = shifts.filter((shift) => {
    const date = parseIsoDate(shift.date);
    return date >= weekRange.start && date <= weekRange.end;
  });
  const visibleMonthShifts = shifts.filter((shift) => {
    const date = parseIsoDate(shift.date);
    return date.getFullYear() === anchorDate.getFullYear() && date.getMonth() === anchorDate.getMonth();
  });
  const title = viewMode === 'week'
    ? `Tuần ${formatShortDate(toIsoDate(weekRange.start))} - ${formatShortDate(toIsoDate(weekRange.end))}`
    : `Lịch trực tháng ${anchorDate.getMonth() + 1}/${anchorDate.getFullYear()}`;

  const movePeriod = (direction: -1 | 1) => {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (viewMode === 'week') {
        next.setDate(next.getDate() + direction * 7);
      } else {
        next.setMonth(next.getMonth() + direction);
      }
      return next;
    });
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-brand">
            <UserRound size={22} />
          </div>
          <div>
            <h2 className="panel-title">{title}</h2>
            <p className="panel-subtitle">Theo dõi lịch trực cá nhân theo tuần hoặc tháng.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1">
            <button type="button" onClick={() => movePeriod(-1)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-brand" aria-label="Trang trước">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setAnchorDate(new Date())} className="h-8 rounded-md px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-brand">
              Hôm nay
            </button>
            <button type="button" onClick={() => movePeriod(1)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-brand" aria-label="Trang sau">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {(['week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`h-8 rounded-md px-3 text-xs font-extrabold transition ${
                  viewMode === mode ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:text-brand'
                }`}
              >
                {mode === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4">
        {viewMode === 'week' ? (
          <div className="space-y-3">
            {visibleWeekShifts.map((shift) => (
              <article
                key={`${shift.date}-${shift.shiftLabel}`}
                className={`rounded-lg border p-4 ${
                  shift.isCover ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-sky-200 bg-sky-50 text-brand'
                }`}
              >
                <div>
                  <p className="text-sm font-extrabold">{formatShiftDate(shift)}</p>
                  <p className="mt-1 text-base font-extrabold text-slate-900">{shift.shiftLabel} {shift.time}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{shift.room}</p>
                </div>
              </article>
            ))}
            {!visibleWeekShifts.length ? <EmptyScheduleState /> : null}
          </div>
        ) : (
          <MonthScheduleGrid anchorDate={anchorDate} shifts={visibleMonthShifts} />
        )}
      </div>
    </section>
  );
}

function MonthScheduleGrid({
  anchorDate,
  shifts,
}: {
  anchorDate: Date;
  shifts: Array<{ date: string; dayLabel: string; shiftLabel: string; time: string; room: string; isCover: boolean }>;
}) {
  const days = buildMonthGrid(anchorDate);
  const todayIso = toIsoDate(new Date());

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-7 bg-slate-50 text-center text-xs font-extrabold uppercase text-slate-400">
        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map((day) => (
          <div key={day} className="border-r border-slate-200 px-2 py-2 last:border-r-0">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const iso = toIsoDate(date);
          const inMonth = date.getMonth() === anchorDate.getMonth();
          const dayShifts = shifts.filter((shift) => shift.date === iso);
          const today = iso === todayIso;
          return (
            <div
              key={iso}
              className={`min-h-28 border-r border-t border-slate-200 p-2 last:border-r-0 ${
                inMonth ? 'bg-white' : 'bg-slate-50/70 text-slate-300'
              } ${today ? 'ring-2 ring-inset ring-brand/50' : ''}`}
            >
              <p className={`text-sm font-extrabold ${today ? 'text-brand' : inMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                {date.getDate()}
              </p>
              <div className="mt-2 space-y-1">
                {dayShifts.map((shift) => (
                  <span
                    key={`${shift.date}-${shift.shiftLabel}`}
                    className={`block truncate rounded px-1.5 py-1 text-xs font-bold ${
                      shift.isCover ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {shift.isCover ? 'Chiều (Thay)' : `${shift.shiftLabel.replace('Ca ', '')} - ${shift.room.replace('Phòng ', 'P.')}`}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyScheduleState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-400">
      Không có ca trực trong khoảng thời gian này.
    </div>
  );
}

function getWeekRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function buildMonthGrid(anchorDate: Date) {
  const firstOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = new Date(firstOfMonth);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  const days: Date[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    days.push(date);
  }
  return days;
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDate(value: string) {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
}

function formatShiftDate(shift: { date: string; dayLabel: string }) {
  const [year, month, day] = shift.date.split('-');
  return `${shift.dayLabel} (${day}/${month}/${year})`;
}
