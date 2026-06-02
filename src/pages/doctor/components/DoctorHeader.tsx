import { Bell, Menu, Stethoscope, UserRound } from 'lucide-react';

export default function DoctorHeader({ title, onOpenMenu }: { title: string; onOpenMenu: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onOpenMenu} className="icon-button cursor-pointer active:scale-95 lg:hidden" aria-label="Mở menu">
          <Menu size={18} />
        </button>
        <div className="hidden min-w-0 lg:block">
          <p className="text-xs font-medium text-slate-400">Vai trò bác sĩ</p>
          <h1 className="truncate text-base font-bold text-slate-800">{title}</h1>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <button type="button" className="hidden cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-brand hover:text-brand active:scale-[0.98] md:flex">
          <Stethoscope size={15} className="text-brand" />
          Khoa Tai Mũi Họng
        </button>
        <button type="button" className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand hover:text-brand active:scale-95" aria-label="Thông báo">
          <Bell size={17} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>
        <button type="button" className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition hover:border-brand active:scale-[0.98]">
          <UserRound size={24} className="text-slate-400" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-bold text-slate-800">BS. Nguyễn Văn A</p>
            <p className="text-[15px] font-medium text-[#0891B2]">Ca sáng 08:00 - 12:00</p>
          </div>
        </button>
      </div>
    </header>
  );
}
