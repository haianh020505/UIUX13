import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  UserRound, 
  KeyRound, 
  Bell, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Save,
  ShieldCheck,
  X, 
  Star, 
  LogOut, 
  Info, 
  Eye, 
  EyeOff, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

type AccountTab = 'security' | 'notifications';

export default function PatientAccount({ onLogout }: { onLogout: () => void }) {
  const storedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem('triageai_user') || 'null') as { name?: string; role?: string } | null;
  }, []);

  const [activeTab, setActiveTab] = useState<AccountTab>('security');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [localToast, setLocalToast] = useState<{ id: number; message: string; type: 'success' | 'error' } | null>(null);

  /* ── Personal Info States ── */
  const [fullName, setFullName] = useState(storedUser?.name || 'Lê Nguyễn Công Minh');
  const [phone, setPhone] = useState('0901 234 567');
  const [email, setEmail] = useState('leminh@gmail.com');
  const [dob, setDob] = useState('1990-03-15'); // Date format for HTML5 input
  const [address, setAddress] = useState('123 Đường Láng, Đống Đa, Hà Nội');

  /* ── Security States ── */
  const [securityForm, setSecurityForm] = useState({
    currentPassword: 'Patient@123456',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  /* ── Notifications States ── */
  const [notifications, setNotifications] = useState({
    labResult: true,
    appointmentReminder: true,
    medicalNewsletter: false,
    smsAlerts: true,
    pushAlerts: true,
  });

  // Password requirements check: min 8 chars, numbers, uppercase letters
  const hasMinLength = securityForm.newPassword.length >= 8;
  const hasNumber = /[0-9]/.test(securityForm.newPassword);
  const hasUppercase = /[A-Z]/.test(securityForm.newPassword);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase;
  const passwordMismatch = Boolean(securityForm.newPassword && securityForm.confirmPassword && securityForm.newPassword !== securityForm.confirmPassword);
  const canSubmitPassword = Boolean(securityForm.newPassword && securityForm.confirmPassword && isPasswordValid && !passwordMismatch);

  /* ── Helper for showing toast ── */
  const triggerToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setLocalToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setLocalToast(null);
    }, 3000);
  }, []);

  /* ── Submit Profile Handler ── */
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      triggerToast('Họ và Tên không được để trống', 'error');
      return;
    }
    if (!phone.trim()) {
      triggerToast('Số điện thoại không được để trống', 'error');
      return;
    }
    if (!email.trim()) {
      triggerToast('Email không được để trống', 'error');
      return;
    }

    localStorage.setItem('triageai_user', JSON.stringify({ role: storedUser?.role ?? 'patient', name: fullName.trim() }));
    triggerToast('Đã lưu thông tin tài khoản');
  };

  /* ── Change Password Handler ── */
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword) {
      triggerToast('Vui lòng kiểm tra mật khẩu mới', 'error');
      return;
    }

    setSecurityForm({ currentPassword: 'Patient@123456', newPassword: '', confirmPassword: '' });
    triggerToast('Đã cập nhật mật khẩu');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Local Toast System */}
      {localToast ? (
        <div 
          className={`fixed right-4 top-4 z-[999] flex min-w-[320px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold shadow-xl border animate-slide-in-right ${
            localToast.type === 'success' 
              ? 'bg-[#16A34A] text-white border-[#15803d]' 
              : 'bg-[#DC2626] text-white border-[#b91c1c]'
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 shrink-0">
            {localToast.type === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
          </span>
          <span className="flex-1">{localToast.message}</span>
        </div>
      ) : null}

      {/* Header Block */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Cài đặt tài khoản</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý hồ sơ cá nhân, bảo mật và cấu hình thông báo y tế.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-brand/60 text-brand bg-sky-50/50 hover:bg-sky-50 px-4 font-bold text-xs transition duration-200 group active:scale-[0.98] self-start sm:self-auto shadow-sm"
        >
          <MessageSquare size={14} className="group-hover:rotate-6 transition" />
          <span>Đánh giá dịch vụ (Test)</span>
        </button>
      </div>

      {/* Tab selection Horizontal bar (100% consistent with doctor/manager layout) */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex">
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            Thông tin & Bảo mật
          </TabButton>
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
            Cài đặt thông báo
          </TabButton>
        </div>
      </div>

      {/* Tab 1: Thông tin & Bảo mật */}
      {activeTab === 'security' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* LEFT COLUMN: Thông tin cá nhân Form */}
          <form onSubmit={handleProfileSubmit} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-blue-600">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="panel-title">Thông tin cá nhân</h2>
                <p className="panel-subtitle">Cập nhật thông tin cơ bản hiển thị trong hồ sơ bệnh nhân.</p>
              </div>
            </div>

            <div className="flex-grow space-y-4 p-4">
              {/* Profile Avatar Header Block */}
              <div className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/30 mb-2">
                <div className="relative group shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg border-2 border-white shadow-sm">
                    LM
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer">
                    <span className="text-[9px] text-white font-bold">Thay ảnh</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-800">{fullName}</h3>
                  <p className="text-xs font-semibold text-slate-400">Mã BN: BN-2024-00158</p>
                </div>
              </div>

              {/* Form Input fields stacked vertically (like doctor/manager layout) */}
              <Field label="Họ và Tên">
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    className="form-input pl-10" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="Nhập họ và tên..."
                  />
                </div>
              </Field>

              <Field label="Số điện thoại">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    className="form-input pl-10" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
              </Field>

              <Field label="Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    className="form-input pl-10" 
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Nhập email..."
                  />
                </div>
              </Field>

              <Field label="Ngày sinh">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    className="form-input pl-10" 
                    type="date"
                    value={dob} 
                    onChange={e => setDob(e.target.value)} 
                  />
                </div>
              </Field>

              <Field label="Địa chỉ">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input 
                    className="form-input pl-10" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="Nhập địa chỉ của bạn..."
                  />
                </div>
              </Field>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <button type="submit" className="secondary-action cursor-pointer flex items-center gap-2">
                <Save size={16} />
                Lưu thay đổi
              </button>
            </div>
          </form>

          {/* RIGHT COLUMN: Bảo mật & Đổi mật khẩu Form */}
          <form onSubmit={handlePasswordSubmit} className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-blue-600">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="panel-title">Đổi mật khẩu</h2>
                <p className="panel-subtitle">Cập nhật mật khẩu mới và cấu hình xác thực 2 lớp.</p>
              </div>
            </div>

            <div className="flex-grow space-y-4 p-4">
              <PasswordField 
                label="Mật khẩu hiện tại" 
                value={securityForm.currentPassword} 
                onChange={val => setSecurityForm(prev => ({ ...prev, currentPassword: val }))} 
                visible={showPasswords.current} 
                onToggleVisible={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))} 
              />

              <PasswordField 
                label="Mật khẩu mới" 
                value={securityForm.newPassword} 
                onChange={val => setSecurityForm(prev => ({ ...prev, newPassword: val }))} 
                visible={showPasswords.new} 
                onToggleVisible={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))} 
                placeholder="Nhập mật khẩu mới"
              />

              <PasswordField 
                label="Nhập lại mật khẩu mới" 
                value={securityForm.confirmPassword} 
                onChange={val => setSecurityForm(prev => ({ ...prev, confirmPassword: val }))} 
                visible={showPasswords.confirm} 
                onToggleVisible={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))} 
                placeholder="Nhập lại mật khẩu mới"
              />

              {passwordMismatch ? <p className="text-xs font-semibold text-rose-500">Mật khẩu nhập lại chưa khớp.</p> : null}

              {/* Password requirement hint */}
              <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 space-y-2">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Yêu cầu bảo mật mật khẩu</p>
                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className={`text-[10px] ${hasMinLength ? 'text-[#16A34A] font-bold' : 'text-slate-300'}`}>✓</span>
                    <span>Tối thiểu 8 ký tự</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`text-[10px] ${hasNumber ? 'text-[#16A34A] font-bold' : 'text-slate-300'}`}>✓</span>
                    <span>Có chứa chữ số (0-9)</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`text-[10px] ${hasUppercase ? 'text-[#16A34A] font-bold' : 'text-slate-300'}`}>✓</span>
                    <span>Có chứa chữ in hoa (A-Z)</span>
                  </span>
                </div>
              </div>

              {/* 2FA Toggle switch */}
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 mt-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-700">Xác thực 2 lớp</p>
                  <p className="text-xs font-semibold text-slate-400">Yêu cầu mã OTP SMS để đăng nhập tài khoản.</p>
                </div>
                <Toggle 
                  checked={twoFactorEnabled} 
                  onChange={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    triggerToast(twoFactorEnabled ? 'Đã tắt xác thực 2 lớp.' : 'Đã kích hoạt xác thực 2 lớp thành công!');
                  }} 
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <button 
                type="submit" 
                disabled={!canSubmitPassword}
                className="secondary-action cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldCheck size={16} />
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Tab 2: Cài đặt thông báo (100% full width card) */
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col w-full">
          <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-brand">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="panel-title">Cài đặt thông báo</h2>
              <p className="panel-subtitle">Cấu hình các kênh nhận thông báo và nhắc nhở y tế cá nhân.</p>
            </div>
          </div>

          <div className="p-5 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email Category */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Thông báo Email</h3>
                <div className="space-y-2.5">
                  <NotificationToggleRow 
                    label="Cập nhật kết quả khám"
                    description="Nhận thông báo ngay khi có kết quả xét nghiệm hoặc đơn thuốc."
                    checked={notifications.labResult}
                    onChange={() => setNotifications(prev => ({ ...prev, labResult: !prev.labResult }))}
                  />
                  <NotificationToggleRow 
                    label="Nhắc nhở lịch hẹn khám"
                    description="Nhận nhắc nhở lịch hẹn và email thông báo trước ca khám 24 giờ."
                    checked={notifications.appointmentReminder}
                    onChange={() => setNotifications(prev => ({ ...prev, appointmentReminder: !prev.appointmentReminder }))}
                  />
                  <NotificationToggleRow 
                    label="Bản tin y tế & Sức khỏe"
                    description="Nhận email chia sẻ kiến thức y học bổ ích định kỳ."
                    checked={notifications.medicalNewsletter}
                    onChange={() => setNotifications(prev => ({ ...prev, medicalNewsletter: !prev.medicalNewsletter }))}
                  />
                </div>
              </div>

              {/* SMS / Application Push Category */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Thông báo SMS & Đẩy (Push)</h3>
                <div className="space-y-2.5">
                  <NotificationToggleRow 
                    label="Tin nhắn SMS trực tiếp"
                    description="SMS khẩn cấp nhắc hẹn hoặc tin nhắn chứa mã OTP hệ thống."
                    checked={notifications.smsAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, smsAlerts: !prev.smsAlerts }))}
                  />
                  <NotificationToggleRow 
                    label="Thông báo đẩy trên ứng dụng"
                    description="Nhận thông báo nhắc uống thuốc, chỉ dẫn y tế ngay trên thanh trạng thái."
                    checked={notifications.pushAlerts}
                    onChange={() => setNotifications(prev => ({ ...prev, pushAlerts: !prev.pushAlerts }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone: Log Out Banner */}
      <section className="rounded-xl border border-rose-200 bg-rose-50 shadow-sm mt-5">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-rose-700">Đăng xuất khỏi hệ thống</h2>
            <p className="mt-1 text-sm font-semibold text-rose-500">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.</p>
          </div>
          <button 
            type="button" 
            onClick={onLogout} 
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-500 hover:bg-rose-600 px-5 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.98]"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </section>

      {/* ── Component FeedbackModal ── */}
      {showFeedbackModal ? (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)} 
          onSuccess={(rating, selectedChips) => {
            setShowFeedbackModal(false);
            triggerToast(`Gửi đánh giá dịch vụ ${rating} sao thành công!`);
          }}
        />
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPER COMPONENT: TabButton
   ══════════════════════════════════════════════════════════════ */
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-14 min-w-48 cursor-pointer items-center justify-center px-5 text-sm font-extrabold transition ${
        active ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
      }`}
    >
      {children}
      {active ? <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" /> : null}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPER COMPONENT: Field
   ══════════════════════════════════════════════════════════════ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPER COMPONENT: PasswordField
   ══════════════════════════════════════════════════════════════ */
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
        <button 
          type="button" 
          onClick={onToggleVisible} 
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-brand" 
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPER COMPONENT: Toggle
   ══════════════════════════════════════════════════════════════ */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onChange} 
      className={`relative h-6 w-11 rounded-full transition shrink-0 ${checked ? 'bg-brand' : 'bg-slate-200'}`} 
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   HELPER COMPONENT: NotificationToggleRow
   ══════════════════════════════════════════════════════════════ */
interface NotificationToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function NotificationToggleRow({
  label,
  description,
  checked,
  onChange,
}: NotificationToggleRowProps) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 hover:border-slate-200/80 bg-slate-50/20 transition">
      <div className="space-y-0.5 pr-4">
        <span className="text-sm font-bold text-slate-800">{label}</span>
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTS: FeedbackModal (Contextual Quick Chips Rating Model)
   ══════════════════════════════════════════════════════════════ */
interface FeedbackModalProps {
  onClose: () => void;
  onSuccess: (rating: number, selectedChips: string[], comment: string) => void;
}

const positiveChips = ['Tuyệt vời', 'Bác sĩ tận tâm', 'Sạch sẽ', 'Cơ sở vật chất tốt', 'Giải thích rõ ràng'];
const negativeChips = ['Chờ đợi lâu', 'Chưa giải thích rõ', 'Thủ tục phức tạp', 'Cơ sở vật chất cũ', 'Thái độ chưa tốt'];

function FeedbackModal({ onClose, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  // Determine current active chips based on rating: >= 4 is positive, <= 3 is negative
  const isPositive = rating >= 4;
  const currentChips = isPositive ? positiveChips : negativeChips;

  // Clear selected chips when rating group switches from positive to negative or vice versa
  useEffect(() => {
    setSelectedChips([]);
  }, [isPositive]);

  const handleToggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip) 
        : [...prev, chip]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSuccess(rating, selectedChips, comment);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-extrabold text-slate-800">Đánh giá dịch vụ</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Part 1: Clinic Context */}
          <div className="bg-sky-50/50 border border-sky-100/50 rounded-xl p-3.5 flex items-start gap-2.5">
            <Info size={16} className="text-brand shrink-0 mt-0.5" />
            <div className="text-xs text-[#1F7FB9] font-medium leading-relaxed">
              Đánh giá ca khám ngày <strong className="font-bold">04/06/2026</strong> với <strong className="font-bold">TS.BS Nguyễn Văn A</strong>. Ý kiến của bạn giúp chúng tôi nâng cao chất lượng điều trị.
            </div>
          </div>

          {/* Part 2: Star Rating */}
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đánh giá mức độ hài lòng</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => {
                const isLit = (hoveredRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 focus:outline-none transition duration-150 transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Star 
                      size={32} 
                      className={`transition duration-150 ${
                        isLit 
                          ? 'fill-amber-400 stroke-amber-400 text-amber-400' 
                          : 'stroke-slate-300 text-slate-300'
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part 3: Quick Chips based on Star Selection */}
          {rating > 0 ? (
            <div className="space-y-2.5 animate-fade-in">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {isPositive ? 'Điều gì làm bạn hài lòng?' : 'Điều gì làm bạn chưa hài lòng?'}
              </label>
              <div className="flex flex-wrap gap-2">
                {currentChips.map(chip => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleToggleChip(chip)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        isSelected
                          ? isPositive
                            ? 'bg-brand border-brand text-white shadow-sm'
                            : 'bg-amber-500 border-amber-500 text-white shadow-sm'
                          : isPositive
                            ? 'bg-sky-50/70 border-sky-100 text-sky-700 hover:bg-sky-100/80'
                            : 'bg-amber-50/70 border-amber-100 text-amber-700 hover:bg-amber-100/80'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Part 4: Textarea Comment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Ý kiến đóng góp khác
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 bg-white outline-none focus:border-brand transition min-h-[96px] resize-none"
              placeholder="Chia sẻ thêm trải nghiệm của bạn (Không bắt buộc)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            disabled={rating === 0}
            onClick={handleSubmit}
            className="w-full bg-brand text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-brand-hover disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition duration-200 active:scale-[0.99]"
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}
