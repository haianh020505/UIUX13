import { Eye, EyeOff, Pencil } from 'lucide-react';

export default function RowActions({ hidden = false }: { hidden?: boolean }) {
  return (
    <span className="flex items-center gap-4">
      <Pencil className="text-emerald-500" size={18} />
      {hidden ? <EyeOff className="text-slate-500" size={18} /> : <Eye className="text-brand" size={18} />}
    </span>
  );
}
