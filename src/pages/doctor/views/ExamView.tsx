import { useState } from 'react';
import { labResults } from '../data';
import type { Appointment, Patient } from '../types';

export default function ExamView({
  patient,
  appointment,
  onBack,
  onFinish,
  onNotify,
}: {
  patient: Patient;
  appointment?: Appointment;
  onBack: () => void;
  onFinish: () => void;
  onNotify: (message: string) => void;
}) {
  const [orderText, setOrderText] = useState('');
  const [medicationText, setMedicationText] = useState('');
  const [medications, setMedications] = useState(['Paracetamol 500mg - uống khi sốt hoặc đau']);
  const patientLabResults = labResults.filter((item) => item.patientCode === patient.code);
  const visitType = patient.visits.length > 1 ? 'Tái khám' : 'Khám mới';
  const aiSummary = appointment
    ? `${appointment.summary}. ${appointment.note}`
    : 'Tóm tắt triệu chứng từ chatbot chưa có trong phiên khám này.';

  const addOrder = () => {
    if (!orderText.trim()) {
      onNotify('Vui lòng nhập chỉ định trước khi thêm');
      return;
    }

    setOrderText('');
    onNotify('Đã thêm chỉ định vào hồ sơ khám');
  };

  const addMedication = () => {
    if (!medicationText.trim()) {
      onNotify('Vui lòng nhập thuốc trước khi thêm');
      return;
    }

    setMedications((items) => [...items, medicationText.trim()]);
    setMedicationText('');
    onNotify('Đã thêm thuốc vào đơn');
  };

  const removeMedication = (item: string) => {
    setMedications((items) => items.filter((medication) => medication !== item));
    onNotify('Đã xóa thuốc khỏi đơn');
  };

  return (
    <div className="space-y-4">
      <section className="panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <button type="button" onClick={onBack} className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand active:scale-[0.98]">
              Quay lại Tổng quan
            </button>
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {patient.code} | {appointment?.time ?? 'Chưa có khung giờ'} | {visitType}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {patient.gender} | {patient.age} tuổi | Phòng 202
            </p>
          </div>
          <button type="button" onClick={onFinish} className="secondary-action self-start cursor-pointer active:scale-[0.98]">
            Kết thúc khám
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <article className="rounded-lg border border-sky-100 bg-sky-50 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-brand">
              AI Summary
            </div>
            <details open>
              <summary className="cursor-pointer text-sm font-bold text-slate-700">Tóm tắt triệu chứng từ chatbot</summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">{aiSummary}</p>
            </details>
          </article>

          <article className="panel">
            <h3 className="panel-title">Hồ sơ EMR tóm tắt</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 font-bold text-slate-500">Tiền sử</dt>
                <dd className="text-slate-700">{patient.history.join(', ')}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 font-bold text-slate-500">Dị ứng</dt>
                <dd className="text-rose-600">{patient.allergy}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 font-bold text-slate-500">Thuốc đang dùng</dt>
                <dd className="text-slate-700">{patient.medication}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 font-bold text-slate-500">Gia đình</dt>
                <dd className="text-slate-700">{patient.family}</dd>
              </div>
            </dl>
          </article>

          <article className="panel">
            <h3 className="panel-title">Kết quả cận lâm sàng liên quan</h3>
            <div className="mt-4 space-y-3">
              {patientLabResults.map((item) => (
                <div key={`${item.patientCode}-${item.title}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-slate-800">{item.title}</p>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${item.status === 'Đang chờ KQ' ? 'bg-amber-100 text-amber-700' : item.status === 'Mới' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
              {!patientLabResults.length ? <p className="text-sm font-medium text-slate-400">Chưa có kết quả CLS liên quan.</p> : null}
            </div>
          </article>
        </div>

        <div className="space-y-4">
          <article className="panel">
            <h3 className="panel-title">Chỉ định</h3>
            <textarea className="form-textarea mt-3 min-h-28" value={orderText} onChange={(event) => setOrderText(event.target.value)} placeholder="Nhập chỉ định xét nghiệm, chẩn đoán hình ảnh..." />
            <button type="button" onClick={addOrder} className="secondary-action mt-3 cursor-pointer active:scale-[0.98]">
              Thêm chỉ định
            </button>
          </article>

          <article className="panel">
            <h3 className="panel-title">Kê đơn</h3>
            <div className="mt-3 flex gap-2">
              <input className="form-input" value={medicationText} onChange={(event) => setMedicationText(event.target.value)} placeholder="Tên thuốc, liều dùng..." />
              <button type="button" onClick={addMedication} className="secondary-action shrink-0 cursor-pointer active:scale-[0.98]">
                Thêm
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {medications.map((item) => (
                <div key={item} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                  <button type="button" onClick={() => removeMedication(item)} className="shrink-0 rounded-md px-3 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-50 hover:text-rose-600">
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Ghi chú khám</h3>
            <textarea className="form-textarea mt-3 min-h-40" defaultValue="Niêm mạc họng đỏ, cần theo dõi dấu hiệu viêm tai giữa có mủ." />
          </article>
        </div>
      </section>
    </div>
  );
}
