export default function Toast({ message }: { message: string }) {
  return (
    <div className="fixed right-4 top-4 z-[70] flex min-w-64 items-center gap-2.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-xl">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      <span>{message}</span>
    </div>
  );
}
