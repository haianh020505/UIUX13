function toIsoDate(value: string) {
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) {
    return '';
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function toDisplayDate(value: string) {
  const [year, month, day] = value.split('-');
  if (!day || !month || !year) {
    return '';
  }

  return `${day}/${month}/${year}`;
}

export default function DateInput({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <input
      type="date"
      className={`form-input ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
      value={toIsoDate(value)}
      onChange={(event) => onChange(toDisplayDate(event.target.value))}
      disabled={disabled}
    />
  );
}

export function parseDisplayDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return 0;
  }

  return new Date(year, month - 1, day).getTime();
}
