import { useNavigate } from 'react-router-dom';
import { CircleUserRound, LogOut } from 'lucide-react';
import LogoMark from './LogoMark';
import NotificationBell from './NotificationBell';

export default function RoleDashboardShell({ title }: { title: string }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('triageai_user') || 'null') as {
    role?: string;
    name?: string;
  } | null;

  const logout = () => {
    localStorage.removeItem('triageai_user');
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-[#eef3f7]">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-xs font-semibold text-brand">Fakeeh Care Group</p>
            <h1 className="text-base font-extrabold text-slate-800">Dashboard {title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 sm:flex">
            <CircleUserRound className="text-slate-400" size={28} />
            {user?.name || title}
          </div>
          <button type="button" onClick={logout} className="icon-button" aria-label="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-brand">TriageAI Dashboard</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-800">{title}</h2>
          <p className="mt-3 text-sm text-slate-500">
            {user?.name ? `Đã đăng nhập: ${user.name}` : 'Chưa có thông tin đăng nhập trong localStorage.'}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Chuông thông báo đã được thêm ở header để các role đều có điểm nhận thông báo nhất quán.
          </p>
        </div>
      </section>
    </main>
  );
}
