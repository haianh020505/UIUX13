export default function StatusBadge({ status }: { status: string }) {
  const active = status.includes('Đang');
  const hidden = status.includes('ẩn');

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
        active ? 'bg-emerald-100 text-emerald-700' : hidden ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {status}
    </span>
  );
}
