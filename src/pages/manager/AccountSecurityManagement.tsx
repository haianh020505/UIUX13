import { Eye, EyeOff, KeyRound, LogOut, Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';

type ConfirmAction = 'profile' | 'password' | 'logout' | null;

export default function AccountSecurityManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const navigate = useNavigate();
  const storedUser = useMemo(() => {
    return JSON.parse(localStorage.getItem('triageai_user') || 'null') as { name?: string; role?: string } | null;
  }, []);
  const [fullName, setFullName] = useState(storedUser?.name || 'Nguyễn Quang Linh (Admin)');
  const [email, setEmail] = useState('linh.admin@fakeehcare.com');
  const [phone, setPhone] = useState('0912 345 678');
  const [currentPassword, setCurrentPassword] = useState('Admin@123456');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const passwordMismatch = Boolean(newPassword && confirmPassword && newPassword !== confirmPassword);
  const passwordTooShort = Boolean(newPassword && newPassword.length < 6);
  const canSubmitPassword = Boolean(newPassword && confirmPassword && !passwordMismatch && !passwordTooShort);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    setConfirmAction('profile');
  };

  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitPassword) {
      onNotify?.('Vui lòng kiểm tra mật khẩu mới');
      return;
    }
    setConfirmAction('password');
  };

  const confirmProfile = () => {
    localStorage.setItem('triageai_user', JSON.stringify({ role: storedUser?.role ?? 'MANAGER', name: fullName }));
    setConfirmAction(null);
    onNotify?.('Đã lưu thông tin tài khoản');
  };

  const confirmPasswordChange = () => {
    setNewPassword('');
    setConfirmPassword('');
    setConfirmAction(null);
    onNotify?.('Đã cập nhật mật khẩu');
  };

  const confirmLogout = () => {
    localStorage.removeItem('triageai_user');
    setConfirmAction(null);
    navigate('/');
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">Hồ sơ cá nhân & Bảo mật</h1>

      <div className="mb-5 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="relative flex h-14 min-w-48 items-center justify-center px-5 text-sm font-extrabold text-brand">
          Thông tin & Bảo mật
          <span className="absolute bottom-0 left-0 h-1 w-full bg-brand" />
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={saveProfile} className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-brand">
              <UserRound size={22} />
            </div>
            <div>
              <h2 className="panel-title">Thông tin cá nhân</h2>
              <p className="panel-subtitle">Cập nhật thông tin hiển thị trong hệ thống quản lý.</p>
            </div>
          </div>
          <div className="space-y-4 p-4">
            <Field label="Họ và Tên">
              <input className="form-input" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
            <Field label="Email đăng nhập">
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
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-700">
                <ShieldCheck size={17} />
                Vai trò: Quản lý phòng khám
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-600">Tài khoản có quyền vận hành các module quản lý, báo cáo và điều phối.</p>
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-100 px-4 py-3">
            <button type="submit" className="secondary-action">
              <Save size={16} />
              Lưu thay đổi
            </button>
          </div>
        </form>

        <form onSubmit={savePassword} className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-start gap-4 border-b border-slate-100 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-brand">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="panel-title">Đổi mật khẩu</h2>
                <p className="panel-subtitle">Mật khẩu mới cần tối thiểu 6 ký tự.</p>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <PasswordField
                label="Mật khẩu hiện tại"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggleVisible={() => setShowCurrentPassword((value) => !value)}
              />
              <PasswordField
                label="Mật khẩu mới"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggleVisible={() => setShowNewPassword((value) => !value)}
                placeholder="Nhập mật khẩu mới"
              />
              <PasswordField
                label="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirmPassword}
                onToggleVisible={() => setShowConfirmPassword((value) => !value)}
                placeholder="Nhập lại mật khẩu mới"
              />
              {passwordTooShort ? <p className="text-sm font-semibold text-rose-500">Mật khẩu mới cần tối thiểu 6 ký tự.</p> : null}
              {passwordMismatch ? <p className="text-sm font-semibold text-rose-500">Mật khẩu nhập lại chưa khớp.</p> : null}
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-700">Xác thực 2 lớp</p>
                  <p className="text-xs font-semibold text-slate-400">Khuyến nghị bật để bảo vệ tài khoản vận hành.</p>
                </div>
                <Toggle checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled((value) => !value)} />
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-4 py-3">
              <button type="submit" className="secondary-action disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSubmitPassword}>
                Cập nhật mật khẩu
              </button>
            </div>
        </form>
      </div>

      <section className="mt-5 rounded-xl border border-rose-200 bg-rose-50 shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-rose-700">Đăng xuất khỏi hệ thống</h2>
            <p className="mt-1 text-sm font-semibold text-rose-500">Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.</p>
          </div>
          <button type="button" onClick={() => setConfirmAction('logout')} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-rose-500 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-600">
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </section>

      {confirmAction === 'profile' ? (
        <ConfirmDialog
          title="Lưu thông tin tài khoản?"
          message="Thông tin cá nhân của bạn sẽ được cập nhật trong hệ thống."
          confirmText="Lưu"
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmProfile}
        />
      ) : null}
      {confirmAction === 'password' ? (
        <ConfirmDialog
          title="Cập nhật mật khẩu?"
          message="Bạn nên ghi nhớ mật khẩu mới trước khi xác nhận thay đổi."
          confirmText="Cập nhật"
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmPasswordChange}
        />
      ) : null}
      {confirmAction === 'logout' ? (
        <ConfirmDialog
          title="Đăng xuất khỏi hệ thống?"
          message="Phiên làm việc hiện tại sẽ kết thúc và bạn cần đăng nhập lại."
          confirmText="Đăng xuất"
          tone="danger"
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmLogout}
        />
      ) : null}
    </div>
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
        <button type="button" onClick={onToggleVisible} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-brand" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand' : 'bg-slate-200'}`} aria-pressed={checked}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}
