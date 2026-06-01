import { Search } from 'lucide-react';

export default function SearchBox({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (value: string) => void }) {
  return (
    <label className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input className="form-input pl-10" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} />
    </label>
  );
}
