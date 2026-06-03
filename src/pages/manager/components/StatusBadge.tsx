export default function StatusBadge({ status }: { status: string }) {
  const toneClass =
    status === 'Vắng mặt' ? 'bg-red-100 text-red-700'
    : status === 'Đi muộn' ? 'bg-amber-100 text-amber-700'
    : status === 'Chưa đến ca' ? 'bg-slate-100 text-slate-600'
    : status === 'Đang trực' ? 'bg-emerald-100 text-emerald-700'
    : status === 'Nghỉ phép' ? 'bg-slate-100 text-slate-400'
    : status.includes('Đang') ? 'bg-emerald-100 text-emerald-700'
    : status.includes('ẩn') ? 'bg-slate-100 text-slate-500'
    : 'bg-slate-100 text-slate-500';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${toneClass}`}>
      {status}
    </span>
  );
}
