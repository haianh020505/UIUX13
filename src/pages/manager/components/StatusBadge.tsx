export default function StatusBadge({ status }: { status: string }) {
  const active = status.includes('Đang');
  const hidden = status.includes('ẩn');

  return (
    <span
      className={`inline-flex rounded-full px-4 py-1 text-xs font-extrabold ${
        active ? 'bg-emerald-100 text-emerald-700' : hidden ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {status}
    </span>
  );
}
