import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Wrench } from 'lucide-react';

type AuthStep = 'login' | 'register' | 'registerSuccess' | 'forgot' | 'otp' | 'resetPassword';
type UserRole = 'PATIENT' | 'DOCTOR' | 'EXPERT' | 'ADMIN';

type MockUser = {
  role: UserRole;
  name: string;
  route: string;
};

const slides = [
  {
    title: 'Sàng lọc thông minh 24/7',
    description: 'Theo dõi triệu chứng và nhận gợi ý phân luồng nhanh trong môi trường y tế số.',
    image: import.meta.env.BASE_URL + 'images/slide-1.png',
  },
  {
    title: 'Đội ngũ chuyên gia hàng đầu',
    description: 'Kết nối bệnh nhân với bác sĩ và chuyên gia phù hợp theo từng nhu cầu chăm sóc.',
    image: import.meta.env.BASE_URL + 'images/slide-2.png',
  },
  {
    title: 'Đặt lịch nhanh chóng, không chờ đợi',
    description: 'Quản lý lịch hẹn rõ ràng, giảm thao tác lặp lại và tối ưu trải nghiệm khám bệnh.',
    image: import.meta.env.BASE_URL + 'images/slide-3.png',
  },
];

const mockAccounts: Record<string, MockUser & { password: string }> = {
  'benhnhan@test.com': {
    password: '123456',
    role: 'PATIENT',
    name: 'Lê Nguyễn Công Minh',
    route: '/patient-dashboard',
  },
  'bacsi@test.com': {
    password: '123456',
    role: 'DOCTOR',
    name: 'BS. Nguyễn Văn A',
    route: '/doctor-dashboard',
  },
  'chuyengia@test.com': {
    password: '123456',
    role: 'EXPERT',
    name: 'PGS.TS Trần Văn B',
    route: '/expert-dashboard',
  },
  'admin@test.com': {
    password: '123456',
    role: 'ADMIN',
    name: 'Quản trị viên',
    route: '/admin-dashboard',
  },
};

const devRoles: Array<{ label: string; user: MockUser }> = [
  { label: 'Vào Role Bệnh nhân', user: { role: 'PATIENT', name: 'Lê Nguyễn Công Minh', route: '/patient-dashboard' } },
  { label: 'Vào Role Bác sĩ', user: { role: 'DOCTOR', name: 'BS. Nguyễn Văn A', route: '/doctor-dashboard' } },
  { label: 'Vào Role Chuyên gia', user: { role: 'EXPERT', name: 'PGS.TS Trần Văn B', route: '/expert-dashboard' } },
  { label: 'Vào Role Quản lý', user: { role: 'ADMIN', name: 'Quản trị viên', route: '/admin-dashboard' } },
];

export default function App() {
  return (
    <main className="md:flex md:h-screen">
      <AuthSlider />
      <AuthFlow />
    </main>
  );
}

function AuthSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = (nextIndex: number) => {
    setActiveIndex((nextIndex + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      className="group relative hidden h-screen w-1/2 overflow-hidden bg-slate-900 md:block"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="TriageAI feature slider"
    >
      {slides.map((slide, index) => (
        <article
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== activeIndex}
        >
          <img src={slide.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-brand/35" />
          <div className="absolute inset-0 bg-black/20" />
        </article>
      ))}

      <div className="relative z-10 flex h-full flex-col justify-end px-12 pb-24 text-white lg:px-16">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex items-center rounded-md bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            TriageAI
          </p>
          <h2 className="text-4xl font-bold leading-tight lg:text-5xl">{slides[activeIndex].title}</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/90">{slides[activeIndex].description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => goToSlide(activeIndex - 1)}
        className="slider-arrow left-6 opacity-0 group-hover:opacity-100"
        aria-label="Slide trước"
      >
        <ArrowLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => goToSlide(activeIndex + 1)}
        className="slider-arrow right-6 opacity-0 group-hover:opacity-100"
        aria-label="Slide tiếp theo"
      >
        <ArrowRight size={20} />
      </button>

      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Chuyển đến ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
}

function AuthFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [recoveryTarget, setRecoveryTarget] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(59);

  const persistAndRedirect = (user: MockUser) => {
    localStorage.setItem('triageai_user', JSON.stringify({ role: user.role, name: user.name }));
    navigate(user.route);
  };

  const goToStep = (nextStep: AuthStep) => {
    setStep(nextStep);
    setError('');
  };

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = mockAccounts[identifier.trim().toLowerCase()];

    if (!account || account.password !== password) {
      setError('Sai tài khoản hoặc mật khẩu');
      return;
    }

    persistAndRedirect(account);
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !phone.trim() || !registerEmail.trim() || !registerPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    if (registerPassword.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    if (!acceptedTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật');
      return;
    }

    goToStep('registerSuccess');
  };

  const handleForgot = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recoveryTarget.trim()) {
      setError('Vui lòng nhập Email hoặc Số điện thoại đã đăng ký');
      return;
    }

    setCountdown(59);
    setOtp(['', '', '', '', '', '']);
    goToStep('otp');
  };

  const handleOtpVerified = () => {
    if (otp.join('').length !== 6) {
      setError('Vui lòng nhập đủ mã xác nhận 6 chữ số');
      return;
    }

    goToStep('resetPassword');
  };

  const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIdentifier(recoveryTarget);
    setPassword('');
    goToStep('login');
  };

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, step]);

  return (
    <section className="flex h-screen w-full items-center justify-center overflow-y-auto bg-[#f4f7fa] px-5 py-10 md:w-1/2 lg:px-12">
      {step === 'login' ? (
        <LoginCard
          identifier={identifier}
          password={password}
          showPassword={showPassword}
          error={error}
          onIdentifierChange={setIdentifier}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((current) => !current)}
          onForgot={() => goToStep('forgot')}
          onRegister={() => goToStep('register')}
          onSubmit={handleLogin}
          onChooseRole={persistAndRedirect}
        />
      ) : null}

      {step === 'register' ? (
        <RegisterCard
          fullName={fullName}
          phone={phone}
          email={registerEmail}
          password={registerPassword}
          confirmPassword={confirmPassword}
          acceptedTerms={acceptedTerms}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          error={error}
          onFullNameChange={setFullName}
          onPhoneChange={setPhone}
          onEmailChange={setRegisterEmail}
          onPasswordChange={setRegisterPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onAcceptedTermsChange={setAcceptedTerms}
          onTogglePassword={() => setShowPassword((current) => !current)}
          onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
          onLogin={() => goToStep('login')}
          onSubmit={handleRegister}
        />
      ) : null}

      {step === 'registerSuccess' ? <RegisterSuccessCard onBackToLogin={() => goToStep('login')} /> : null}

      {step === 'forgot' ? (
        <ForgotPasswordCard
          recoveryTarget={recoveryTarget}
          error={error}
          onRecoveryTargetChange={setRecoveryTarget}
          onBackToLogin={() => goToStep('login')}
          onSubmit={handleForgot}
        />
      ) : null}

      {step === 'otp' ? (
        <OtpCard
          target={recoveryTarget}
          otp={otp}
          countdown={countdown}
          error={error}
          onOtpChange={(nextOtp) => {
            setOtp(nextOtp);
            setError('');
          }}
          onResend={() => {
            setCountdown(59);
            setOtp(['', '', '', '', '', '']);
          }}
          onVerify={handleOtpVerified}
          onBackToLogin={() => goToStep('login')}
        />
      ) : null}

      {step === 'resetPassword' ? (
        <ResetPasswordCard
          newPassword={newPassword}
          confirmNewPassword={confirmNewPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          error={error}
          onNewPasswordChange={setNewPassword}
          onConfirmNewPasswordChange={setConfirmNewPassword}
          onTogglePassword={() => setShowPassword((current) => !current)}
          onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
          onBackToLogin={() => goToStep('login')}
          onSubmit={handleResetPassword}
        />
      ) : null}
    </section>
  );
}

function LoginCard({
  identifier,
  password,
  showPassword,
  error,
  onIdentifierChange,
  onPasswordChange,
  onTogglePassword,
  onForgot,
  onRegister,
  onSubmit,
  onChooseRole,
}: {
  identifier: string;
  password: string;
  showPassword: boolean;
  error: string;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onForgot: () => void;
  onRegister: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChooseRole: (user: MockUser) => void;
}) {
  return (
    <AuthCard>
      <CardHeader title="Đăng nhập hệ thống" subtitle="Chào mừng bạn quay lại" />

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <FieldLabel label="Email hoặc Số điện thoại">
          <input
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value)}
            type="text"
            placeholder="Nhập email hoặc số điện thoại"
            className="auth-input"
            autoComplete="username"
          />
        </FieldLabel>

        <div>
          <FieldLabel label="Mật khẩu">
            <PasswordInput
              value={password}
              placeholder="Nhập mật khẩu"
              show={showPassword}
              autoComplete="current-password"
              onChange={onPasswordChange}
              onToggle={onTogglePassword}
            />
          </FieldLabel>
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={onForgot} className="text-xs font-bold text-brand transition hover:text-[#1f7fb9]">
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

        <button type="submit" className="primary-button mt-7">
          Đăng nhập
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#73829b]">
        Chưa có tài khoản?{' '}
        <button type="button" onClick={onRegister} className="font-bold text-brand transition hover:text-[#1f7fb9]">
          Đăng ký ngay
        </button>
      </p>

      <DevTools onChooseRole={onChooseRole} />
    </AuthCard>
  );
}

function RegisterCard({
  fullName,
  phone,
  email,
  password,
  confirmPassword,
  acceptedTerms,
  showPassword,
  showConfirmPassword,
  error,
  onFullNameChange,
  onPhoneChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onAcceptedTermsChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onLogin,
  onSubmit,
}: {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  error: string;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onAcceptedTermsChange: (value: boolean) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onLogin: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard highlighted>
      <CardHeader title="Tạo tài khoản mới" subtitle="Điền thông tin dưới đây để tham gia hệ thống" />

      <form onSubmit={onSubmit} className="mt-9 space-y-4">
        <RequiredField label="Họ và tên">
          <input
            value={fullName}
            onChange={(event) => onFullNameChange(event.target.value)}
            type="text"
            placeholder="Nhập đầy đủ họ và tên"
            className="auth-input"
            autoComplete="name"
          />
        </RequiredField>

        <div className="grid gap-4 sm:grid-cols-2">
          <RequiredField label="Số điện thoại">
            <input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              type="tel"
              placeholder="09xx xxx xxx"
              className="auth-input"
              autoComplete="tel"
            />
          </RequiredField>
          <RequiredField label="Email">
            <input
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              type="email"
              placeholder="VD: user@email.com"
              className="auth-input"
              autoComplete="email"
            />
          </RequiredField>
        </div>

        <RequiredField label="Mật khẩu">
          <PasswordInput
            value={password}
            placeholder="Tối thiểu 8 ký tự"
            show={showPassword}
            autoComplete="new-password"
            onChange={onPasswordChange}
            onToggle={onTogglePassword}
          />
        </RequiredField>

        <RequiredField label="Nhập lại mật khẩu">
          <PasswordInput
            value={confirmPassword}
            placeholder="Xác nhận lại mật khẩu"
            show={showConfirmPassword}
            autoComplete="new-password"
            onChange={onConfirmPasswordChange}
            onToggle={onToggleConfirmPassword}
          />
        </RequiredField>

        <label className="flex items-start gap-2 text-xs font-medium text-[#73829b]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => onAcceptedTermsChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
          />
          <span>
            Tôi đồng ý với{' '}
            <button type="button" className="font-bold text-brand">
              Điều khoản dịch vụ
            </button>{' '}
            &{' '}
            <button type="button" className="font-bold text-brand">
              Chính sách bảo mật
            </button>
          </span>
        </label>

        {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

        <button type="submit" className="primary-button">
          Đăng ký tài khoản
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#73829b]">
        Đã có tài khoản?{' '}
        <button type="button" onClick={onLogin} className="font-bold text-brand transition hover:text-[#1f7fb9]">
          Đăng nhập
        </button>
      </p>
    </AuthCard>
  );
}

function RegisterSuccessCard({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <AuthCard compact>
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check size={30} strokeWidth={3} />
        </div>
      </div>

      <h1 className="mt-8 text-center text-2xl font-extrabold text-[#252f3f]">Đăng ký thành công!</h1>
      <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-6 text-[#73829b]">
        Tài khoản của bạn đã được hệ thống ghi nhận và đang trong quá trình chờ Quản trị viên phê duyệt. Vui lòng kiểm tra
        Email để nhận thông báo kích hoạt.
      </p>

      <button type="button" onClick={onBackToLogin} className="primary-button mx-auto mt-9 max-w-xs">
        Quay lại trang Đăng nhập
      </button>
    </AuthCard>
  );
}

function ForgotPasswordCard({
  recoveryTarget,
  error,
  onRecoveryTargetChange,
  onBackToLogin,
  onSubmit,
}: {
  recoveryTarget: string;
  error: string;
  onRecoveryTargetChange: (value: string) => void;
  onBackToLogin: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard compact>
      <CardHeader
        title="Quên mật khẩu?"
        subtitle="Vui lòng nhập Email hoặc Số điện thoại đã đăng ký. Chúng tôi sẽ gửi mã xác nhận để khôi phục tài khoản."
      />

      <form onSubmit={onSubmit} className="mt-9 space-y-5">
        <FieldLabel label="Email hoặc Số điện thoại">
          <input
            value={recoveryTarget}
            onChange={(event) => onRecoveryTargetChange(event.target.value)}
            type="text"
            placeholder="VD: user@email.com hoặc 09xx..."
            className="auth-input"
            autoComplete="username"
          />
        </FieldLabel>

        {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

        <button type="submit" className="primary-button">
          Gửi mã xác nhận
        </button>
      </form>

      <BackToLoginButton onClick={onBackToLogin} className="mt-8" />
    </AuthCard>
  );
}

function OtpCard({
  target,
  otp,
  countdown,
  error,
  onOtpChange,
  onResend,
  onVerify,
  onBackToLogin,
}: {
  target: string;
  otp: string[];
  countdown: number;
  error: string;
  onOtpChange: (otp: string[]) => void;
  onResend: () => void;
  onVerify: () => void;
  onBackToLogin: () => void;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const maskedTarget = target || 'user@email.com';

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    onOtpChange(nextOtp);

    if (digit && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <AuthCard compact>
      <CardHeader title="Nhập mã xác nhận" subtitle="Vui lòng nhập mã gồm 6 chữ số đã được gửi đến" strongSubtitle={maskedTarget} />

      <div className="mt-9 flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !otp[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
              }
            }}
            className="h-14 w-11 rounded-lg border border-gray-200 bg-[#f8fafc] text-center text-xl font-bold text-[#252f3f] outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            inputMode="numeric"
            maxLength={1}
            aria-label={`Số thứ ${index + 1} của mã xác nhận`}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-[#73829b]">
        Bạn chưa nhận được mã?{' '}
        <button
          type="button"
          onClick={onResend}
          disabled={countdown > 0}
          className="font-bold text-brand transition enabled:hover:text-[#1f7fb9] disabled:cursor-not-allowed"
        >
          Gửi lại
        </button>
        <br />
        <span className="font-bold text-brand">(00:{String(countdown).padStart(2, '0')})</span>
      </p>

      {error ? <p className="mt-4 text-center text-sm font-semibold text-red-500">{error}</p> : null}

      <button type="button" onClick={onVerify} className="primary-button mt-8">
        Xác thực mã
      </button>

      <BackToLoginButton onClick={onBackToLogin} className="mt-7" />
    </AuthCard>
  );
}

function ResetPasswordCard({
  newPassword,
  confirmNewPassword,
  showPassword,
  showConfirmPassword,
  error,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onBackToLogin,
  onSubmit,
}: {
  newPassword: string;
  confirmNewPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  error: string;
  onNewPasswordChange: (value: string) => void;
  onConfirmNewPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onBackToLogin: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AuthCard compact>
      <CardHeader
        title="Đặt lại mật khẩu"
        subtitle="Mật khẩu mới của bạn phải khác với những mật khẩu đã sử dụng trước đó."
      />

      <form onSubmit={onSubmit} className="mt-10 space-y-5">
        <RequiredField label="Mật khẩu mới">
          <PasswordInput
            value={newPassword}
            placeholder="Nhập mật khẩu mới"
            show={showPassword}
            autoComplete="new-password"
            onChange={onNewPasswordChange}
            onToggle={onTogglePassword}
          />
        </RequiredField>

        <RequiredField label="Xác nhận mật khẩu mới">
          <PasswordInput
            value={confirmNewPassword}
            placeholder="Nhập lại mật khẩu mới"
            show={showConfirmPassword}
            autoComplete="new-password"
            onChange={onConfirmNewPasswordChange}
            onToggle={onToggleConfirmPassword}
          />
        </RequiredField>

        {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

        <button type="submit" className="primary-button mt-8">
          Cập nhật mật khẩu
        </button>
      </form>

      <BackToLoginButton onClick={onBackToLogin} className="mt-7" />
    </AuthCard>
  );
}

function AuthCard({
  children,
  highlighted = false,
  compact = false,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`w-full max-w-lg rounded-2xl bg-white px-8 py-12 shadow-sm transition md:px-10 ${highlighted ? 'border-4 border-brand' : 'border border-white'}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  strongSubtitle,
}: {
  title: string;
  subtitle: string;
  strongSubtitle?: string;
}) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-extrabold text-[#252f3f]">{title}</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#73829b]">{subtitle}</p>
      {strongSubtitle ? <p className="mt-2 text-sm font-extrabold text-[#252f3f]">{strongSubtitle}</p> : null}
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#334155]">{label}</span>
      {children}
    </label>
  );
}

function RequiredField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#334155]">
        {label} <span className="text-red-500">*</span>
      </span>
      {children}
    </label>
  );
}

function PasswordInput({
  value,
  placeholder,
  show,
  autoComplete,
  onChange,
  onToggle,
}: {
  value: string;
  placeholder: string;
  show: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className="auth-input pr-12"
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#94a3b8] transition hover:bg-gray-100 hover:text-brand"
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function BackToLoginButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <button type="button" onClick={onClick} className="text-sm font-extrabold text-brand transition hover:text-[#1f7fb9]">
        Quay lại Đăng nhập
      </button>
    </div>
  );
}

function DevTools({ onChooseRole }: { onChooseRole: (user: MockUser) => void }) {
  return (
    <div className="mt-7 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-4">
      <p className="mb-3 flex items-center justify-center gap-2 text-sm font-bold text-[#334155]">
        <Wrench size={15} />
        Dev Tools: Test Roles
      </p>
      <div className="grid grid-cols-2 gap-2">
        {devRoles.map((role) => (
          <button
            key={role.user.role}
            type="button"
            onClick={() => onChooseRole(role.user)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
}
