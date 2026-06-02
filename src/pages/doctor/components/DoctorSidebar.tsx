import LogoMark from '../../../components/common/LogoMark';
import { doctorModules } from '../data';
import type { DoctorModule } from '../types';

export default function DoctorSidebar({
  activeModule,
  mobileOpen,
  isExamMode = false,
  onOpenModule,
}: {
  activeModule: DoctorModule;
  mobileOpen: boolean;
  isExamMode?: boolean;
  onOpenModule: (module: DoctorModule) => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-4">
        <LogoMark />
        <span className="text-sm font-semibold text-slate-700">Fakeeh Care Group</span>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {doctorModules.map((item) => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          const disabledInExam = isExamMode && item.id !== 'dashboard';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenModule(item.id)}
              disabled={disabledInExam}
              className={`manager-nav-item cursor-pointer active:scale-[0.99] ${active ? 'manager-nav-item-active' : ''} ${
                disabledInExam ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
