import { Image, Upload } from 'lucide-react';

export default function UploadArea({ label, icon = 'image' }: { label: string; icon?: 'image' | 'upload' }) {
  return (
    <button type="button" className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-400 transition hover:border-brand hover:bg-sky-50">
      {icon === 'upload' ? <Upload size={24} /> : <Image size={24} />}
      <span>{label}</span>
    </button>
  );
}
