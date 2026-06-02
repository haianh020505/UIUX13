import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed right-4 top-4 z-[70] flex min-w-64 items-center gap-2.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-xl">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 size={16} />
      </span>
      <span>{message}</span>
    </div>
  );
}
