import { Pill, X } from 'lucide-react';
import { useState } from 'react';
import type { Patient } from '../types';
import { SearchInput } from '../components/shared';

export default function OrdersView({ patient, onNotify }: { patient: Patient; onNotify: (message: string) => void }) {
  const [tab, setTab] = useState<'lab' | 'prescription'>('lab');
  const [services, setServices] = useState(['Nội soi Tai Mũi Họng ống mềm']);

  return (
    <div className="space-y-4">
      <div><h2 className="text-xl font-bold text-slate-800">Chỉ định & Kê đơn</h2><p className="mt-1 text-sm font-bold text-brand">Đang khám: BN. {patient.name} ({patient.code})</p></div>
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200">
            <button type="button" onClick={() => setTab('lab')} className={`cursor-pointer px-5 py-3 text-sm font-bold transition hover:text-brand active:scale-[0.98] ${tab === 'lab' ? 'border-b-2 border-brand text-brand' : 'text-slate-500'}`}>Cận lâm sàng</button>
            <button type="button" onClick={() => setTab('prescription')} className={`cursor-pointer px-5 py-3 text-sm font-bold transition hover:text-brand active:scale-[0.98] ${tab === 'prescription' ? 'border-b-2 border-brand text-brand' : 'text-slate-500'}`}>Kê đơn thuốc</button>
          </div>
          {tab === 'lab' ? (
            <div className="space-y-4 p-4">
              <h3 className="font-bold text-slate-800">Chỉ định Xét nghiệm / Chẩn đoán hình ảnh *</h3>
              <SearchInput placeholder="Tìm dịch vụ (VD: Siêu âm, X-Quang, Xét nghiệm máu...)" />
              <div className="flex flex-wrap gap-2">{['Nội soi Tai Mũi Họng', 'X-Quang Ngực', 'Công thức máu', 'Siêu âm ổ bụng'].map((item) => <button key={item} type="button" onClick={() => !services.includes(item) && setServices((current) => [...current, item])} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition hover:ring-2 hover:ring-brand/20 active:scale-[0.98] ${services.includes(item) ? 'bg-sky-100 text-brand' : 'bg-slate-100 text-slate-500'}`}>+ {item}</button>)}</div>
              <div className="space-y-2">{services.map((service, index) => <div key={service} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2.5 font-bold text-slate-700"><span>{index + 1}. {service}</span><button type="button" onClick={() => setServices((current) => current.filter((item) => item !== service))} className="cursor-pointer text-rose-500 transition hover:text-rose-700 active:scale-90" aria-label={`Xóa ${service}`}><X size={16} /></button></div>)}</div>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Yêu cầu đặc biệt / Chẩn đoán sơ bộ</span><textarea className="form-textarea min-h-24" defaultValue="Nghi ngờ viêm tai giữa có mủ. Vui lòng kiểm tra kỹ màng nhĩ trái." /></label>
              <div className="flex justify-end"><button type="button" onClick={() => onNotify('Đã thêm chỉ định vào phiếu')} className="secondary-action cursor-pointer active:scale-[0.98]">+ Thêm vào phiếu</button></div>
            </div>
          ) : (
            <PrescriptionForm onNotify={onNotify} />
          )}
        </article>
        <OrderPreview patient={patient} services={services} onNotify={onNotify} />
      </section>
    </div>
  );
}

function PrescriptionForm({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-2"><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Tên thuốc</span><input className="form-input" defaultValue="Paracetamol 500mg" /></label><label><span className="mb-1.5 block text-sm font-medium text-slate-700">Số lượng</span><input className="form-input" defaultValue="10 viên" /></label></div>
      <label><span className="mb-1.5 block text-sm font-medium text-slate-700">Cách dùng</span><textarea className="form-textarea" defaultValue="Uống 1 viên khi sốt trên 38.5 độ, cách nhau tối thiểu 6 giờ." /></label>
      <button type="button" onClick={() => onNotify('Đã thêm thuốc vào đơn')} className="secondary-action cursor-pointer active:scale-[0.98]"><Pill size={15} />Thêm thuốc vào đơn</button>
    </div>
  );
}

function OrderPreview({ patient, services, onNotify }: { patient: Patient; services: string[]; onNotify: (message: string) => void }) {
  return (
    <aside className="flex min-h-[520px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3"><h3 className="panel-title">Phiếu Chỉ định & Đơn thuốc</h3><p className="panel-subtitle">{patient.name} ({patient.code})</p></div>
      <div className="flex-1 space-y-5 p-4"><div><p className="mb-2 text-sm font-bold text-brand">I. Cận lâm sàng (Đã chỉ định)</p>{services.map((service, index) => <div key={service} className="border-b border-dashed border-slate-200 py-2"><p className="font-bold text-slate-800">{index + 1}. {service}</p><p className="text-xs text-slate-500">Chẩn đoán sơ bộ: Viêm tai giữa có mủ.</p><p className="text-xs font-bold italic text-rose-500">Yêu cầu: Kiểm tra kỹ màng nhĩ trái.</p></div>)}</div><div><p className="mb-2 text-sm font-bold text-slate-700">II. Đơn thuốc</p><p className="text-sm italic text-slate-400">(Chưa có đơn thuốc nào được kê)</p></div><label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Hẹn ngày tái khám</span><input className="form-input bg-white" placeholder="- Chưa hẹn -" /></label></div>
      <div className="space-y-2 border-t border-slate-100 p-4"><div className="grid gap-2 sm:grid-cols-2"><button type="button" className="ghost-action cursor-pointer active:scale-[0.98]">Xem & In phiếu</button><button type="button" onClick={() => onNotify('Đã gửi phiếu sang phòng CLS')} className="cursor-pointer rounded-md border border-emerald-300 px-4 py-2 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50 active:scale-[0.98]">Gửi phòng CLS</button></div><button type="button" onClick={() => onNotify('Đã lưu phiếu vào EMR')} className="secondary-action w-full cursor-pointer active:scale-[0.98]">Lưu vào EMR</button></div>
    </aside>
  );
}
