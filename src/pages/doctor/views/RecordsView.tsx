import { ChevronLeft } from 'lucide-react';
import { patients } from '../data';
import type { Patient } from '../types';
import { SearchInput } from '../components/shared';

export function RecordsView({ onOpenRecord, onNotify }: { onOpenRecord: (code: string) => void; onNotify: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Danh sách Bệnh án điện tử (EMR)</h2>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          <SearchInput placeholder="Tìm Tên / SĐT / Mã BN (VD: PA-019)..." />
          <select className="form-input w-full cursor-pointer bg-white lg:w-44"><option>Lần khám gần nhất</option><option>Tên bệnh nhân</option></select>
          <button type="button" className="secondary-action cursor-pointer active:scale-[0.98] lg:w-32">Tìm kiếm</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500"><tr><th className="px-4 py-3">Mã BN</th><th className="px-4 py-3">Bệnh nhân</th><th className="px-4 py-3">Ngày khám cuối</th><th className="px-4 py-3">Chẩn đoán gần nhất</th><th className="px-4 py-3 text-right">Hành động</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{patients.map((patient) => <tr key={patient.code}><td className="px-4 py-3 font-bold text-slate-600">{patient.code}</td><td className="px-4 py-3"><b>{patient.name}</b><span className="block text-xs text-slate-500">{patient.gender} | {patient.age} tuổi</span></td><td className="px-4 py-3">{patient.visits[0].date}</td><td className="px-4 py-3">{patient.diagnosis}<span className="block text-xs text-slate-500">{patient.doctor}</span></td><td className="px-4 py-3 text-right"><button type="button" onClick={() => onOpenRecord(patient.code)} className="cursor-pointer rounded-md border border-brand px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-sky-50 active:scale-[0.98]">Xem chi tiết</button></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function RecordDetailView({ patient, onBack, onNotify }: { patient: Patient; onBack: () => void; onNotify: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand active:scale-[0.98]"><ChevronLeft size={16} /> Danh sách EMR / <span className="text-brand">{patient.name}</span></button>
      <h2 className="text-xl font-bold text-slate-800">Tổng quan Hồ sơ Bệnh án</h2>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 border-l-4 border-brand pl-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-brand">{patient.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}</span><div><h3 className="text-lg font-bold text-slate-900">{patient.name} <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{patient.code}</span></h3><p className="text-sm text-slate-500">{patient.gender} | {patient.age} tuổi | SĐT: {patient.phone} | {patient.address}</p></div></div>
          <div className="grid grid-cols-4 gap-4 text-center text-sm"><Vital label="Nhóm máu" value={patient.blood} danger /><Vital label="Chiều cao" value={patient.height} /><Vital label="Cân nặng" value={patient.weight} /><Vital label="BMI" value={patient.bmi} normal /></div>
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <article className="panel space-y-4"><h3 className="panel-title">Thông tin y tế cơ bản</h3><InfoBox title="Dị ứng & Chống chỉ định" danger text={patient.allergy} /><InfoBox title="Tiền sử bệnh lý" text={patient.history.join(' · ')} /><InfoBox title="Tiền sử gia đình" text={patient.family} /><InfoBox title="Thuốc đang dùng định kỳ" info text={patient.medication} /></article>
        <article className="panel"><div className="flex gap-4 border-b border-slate-200"><button type="button" className="cursor-pointer border-b-2 border-brand px-2 pb-3 text-sm font-bold text-brand active:scale-[0.98]">Lịch sử khám bệnh</button><button type="button" className="cursor-pointer px-2 pb-3 text-sm font-bold text-slate-500 hover:text-brand active:scale-[0.98]">Kết quả cận lâm sàng</button></div><div className="mt-4 space-y-4">{patient.visits.map((visit) => <div key={`${visit.date}-${visit.department}`} className="border-l border-slate-200 pl-4"><p className="font-bold text-slate-800">{visit.date} - {visit.department}</p><p className="text-xs text-slate-500">{visit.doctor}</p><p className="mt-1 text-sm">Lý do khám: {visit.reason}</p><p className="text-sm font-bold">Chẩn đoán: {visit.diagnosis}</p></div>)}</div></article>
      </section>
    </div>
  );
}

function Vital({ label, value, danger = false, normal = false }: { label: string; value: string; danger?: boolean; normal?: boolean }) { return <div><p className="text-xs font-medium uppercase text-slate-400">{label}</p><p className={`mt-1 text-base font-bold ${danger ? 'text-rose-600' : 'text-slate-800'}`}>{value}</p>{normal ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">Bình thường</span> : null}</div>; }
function InfoBox({ title, text, danger = false, info = false }: { title: string; text: string; danger?: boolean; info?: boolean }) { return <div><h4 className="mb-2 text-sm font-bold text-slate-700">{title}</h4><div className={`rounded-md border px-3 py-2 text-sm ${danger ? 'border-rose-200 bg-rose-50 font-bold text-rose-600' : info ? 'border-sky-100 bg-sky-50 text-slate-600' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{text}</div></div>; }
