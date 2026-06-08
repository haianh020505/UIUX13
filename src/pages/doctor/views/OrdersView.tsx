import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarDays, ClipboardList, Loader2, Search, X } from 'lucide-react';
import type { Appointment, LabResult, Patient, PrescriptionItem, SavedEmrEntry } from '../types';
import { hasRecordedAllergy } from '../data';

const labServiceCatalog = [
  'Nội soi Tai Mũi Họng ống mềm',
  'Nội soi mũi xoang ống mềm',
  'Nội soi vòm họng ống mềm',
  'Nội soi họng - amidan',
  'X-Quang ngực thẳng',
  'X-Quang xoang Blondeau',
  'Công thức máu',
  'Xét nghiệm CRP',
  'Đông máu cơ bản',
  'Siêu âm ổ bụng',
  'Siêu âm tuyến giáp',
  'Đo thính lực đơn âm',
];

const popularLabServices = ['Nội soi Tai Mũi Họng', 'X-Quang Ngực', 'Công thức máu', 'Siêu âm ổ bụng'];

export default function OrdersView({
  patient,
  appointment,
  onBack,
  onRequestFinishExam,
  onNotify,
  onSavedToEmr,
}: {
  patient: Patient | null;
  appointment?: Appointment;
  onBack: () => void;
  onRequestFinishExam: () => void;
  onNotify: (message: string) => void;
  onSavedToEmr: (entry: SavedEmrEntry) => void;
}) {
  const [tab, setTab] = useState<'lab' | 'prescription'>('lab');
  const [services, setServices] = useState(['Nội soi Tai Mũi Họng ống mềm']);
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [isLabSearchOpen, setIsLabSearchOpen] = useState(false);
  const [highlightedLabIndex, setHighlightedLabIndex] = useState(0);
  const [followUpDate, setFollowUpDate] = useState('');
  const [clsSent, setClsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [preliminaryDiagnosis, setPreliminaryDiagnosis] = useState('Nghi ngờ viêm tai giữa có mủ. Vui lòng kiểm tra kỹ màng nhĩ trái.');
  const [prescribedDrugs, setPrescribedDrugs] = useState<PrescriptionItem[]>([
    { name: 'Paracetamol 500mg', quantity: '10 viên', usage: 'Uống 1 viên khi sốt trên 38.5 độ, cách nhau tối thiểu 6 giờ.' }
  ]);

  const filteredLabServices = labServiceCatalog.filter((service) =>
    normalizeSearchText(service).includes(normalizeSearchText(labSearchQuery)),
  );

  useEffect(() => {
    setHighlightedLabIndex(0);
  }, [labSearchQuery]);

  const addService = (service: string) => {
    const normalizedService = service.trim();
    if (!normalizedService) {
      onNotify('Vui lòng chọn chỉ định trước khi thêm');
      return;
    }

    if (services.includes(normalizedService)) {
      onNotify('Chỉ định đã có trong phiếu');
      setLabSearchQuery('');
      setIsLabSearchOpen(false);
      return;
    }

    setServices((current) => [...current, normalizedService]);
    setClsSent(false);
    setLabSearchQuery('');
    setIsLabSearchOpen(false);
    onNotify(`Đã thêm chỉ định ${normalizedService}`);
  };

  const handleAddServiceFromSearch = () => {
    const selectedService = filteredLabServices[highlightedLabIndex] ?? filteredLabServices[0] ?? labSearchQuery.trim();
    addService(selectedService);
  };

  const handleLabSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isLabSearchOpen && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
      setIsLabSearchOpen(true);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!filteredLabServices.length) return;
      setHighlightedLabIndex((current) => (current + 1) % filteredLabServices.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!filteredLabServices.length) return;
      setHighlightedLabIndex((current) => (current - 1 + filteredLabServices.length) % filteredLabServices.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddServiceFromSearch();
      return;
    }

    if (event.key === 'Escape') {
      setIsLabSearchOpen(false);
    }
  };

  const handleSaveEMR = () => {
    if (!patient) return;
    if (isSubmitting) return;
    setIsSubmitting(true);
    window.setTimeout(() => {
      const today = new Date();
      const visitDate = formatDisplayDate(toIsoDate(today));
      const savedLabResults = services.map<LabResult>((service, index) => ({
        id: `saved-${patient.code}-${today.getTime()}-${index}`,
        patientCode: patient.code,
        visitDate,
        category: inferLabCategory(service),
        title: service,
        description: 'Phiếu chỉ định mới đã được lưu vào EMR, đang chờ phòng cận lâm sàng xử lý.',
        status: clsSent ? 'Đang chờ KQ' : 'Mới',
        timeLabel: clsSent ? 'Đang xử lý' : 'Vừa lưu',
        performedAt: `${visitDate} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`,
        department: 'Phòng Cận lâm sàng',
        doctor: 'BS. Nguyễn Văn A',
        summary: `Chỉ định ${service} được tạo trong lần khám ngày ${visitDate}.`,
        findings: clsSent
          ? ['Đã gửi lệnh đến phòng cận lâm sàng.', 'Đang chờ kỹ thuật viên tiếp nhận và cập nhật kết quả.', 'Kết quả chính thức sẽ được bổ sung sau khi thực hiện.']
          : ['Phiếu chỉ định đã lưu trong EMR.', 'Chưa gửi phòng cận lâm sàng.', 'Chưa có kết quả thực hiện.'],
        conclusion: clsSent ? 'Đang chờ kết quả chính thức từ phòng cận lâm sàng.' : 'Chưa gửi phòng cận lâm sàng.',
        imageLabel: `ORDER-${patient.code}-${index + 1}`,
      }));

      onSavedToEmr({
        patientCode: patient.code,
        visit: {
          date: visitDate,
          department: 'Khoa Tai Mũi Họng',
          doctor: 'BS. Nguyễn Văn A',
          reason: 'Khám / kê đơn mới',
          diagnosis: preliminaryDiagnosis.trim() || patient.diagnosis,
          prescriptions: prescribedDrugs,
          labServices: services,
        },
        labResults: savedLabResults,
      });
      onNotify('Đã lưu hồ sơ bệnh án thành công!');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSendCls = () => {
    if (!services.length) return;
    setClsSent(true);
    onNotify('Đã gửi lệnh đến phòng Cận lâm sàng');
  };

  const handlePrint = () => {
    onNotify('Đang kết nối máy in...');
    window.print();
  };

  const handleAddDrug = (drug: { name: string; quantity: string; usage: string }) => {
    setPrescribedDrugs((current) => [...current, drug]);
    onNotify(`Đã thêm thuốc ${drug.name} vào đơn`);
  };

  const handleRemoveDrug = (index: number) => {
    setPrescribedDrugs((current) => current.filter((_, i) => i !== index));
    onNotify('Đã xóa thuốc khỏi đơn');
  };

  const handleRemoveService = (service: string) => {
    setServices((current) => {
      const next = current.filter((item) => item !== service);
      if (next.length === 0) setClsSent(false);
      return next;
    });
    onNotify('Đã xóa chỉ định');
  };

  if (!patient) {
    return (
      <div className="empty-state">
        <ClipboardList size={40} />
        <h3>Chưa có bệnh nhân đang khám</h3>
        <p>Gọi bệnh nhân vào khám từ lịch khám hôm nay để bắt đầu.</p>
        <button type="button" className="secondary-action" onClick={onBack}>
          Xem lịch khám hôm nay
        </button>
      </div>
    );
  }

  const hasAllergy = hasRecordedAllergy(patient.allergy);

  return (
    <div className="space-y-4">
      <section className="panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <button type="button" onClick={onBack} className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand active:scale-[0.98]">
              ← Quay lại lịch khám
            </button>
            <h2 className="text-xl font-bold text-slate-900">{patient.name} | {patient.code} | {appointment?.time ?? 'Chưa có khung giờ'}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {patient.gender}, {patient.age} tuổi, Phòng 203
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestFinishExam}
            className="inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-bold transition active:scale-[0.98]"
            style={{
              borderColor: 'var(--color-danger)',
              background: 'transparent',
              color: 'var(--color-danger)',
            }}
          >
            Kết thúc khám
          </button>
        </div>
      </section>

      {/* Patient Safety Banner */}
      <div className={`rounded-lg border p-3 flex flex-wrap items-center gap-6 text-sm mb-6 ${hasAllergy ? 'border-red-100 bg-red-50' : 'border-slate-200 bg-white'}`}>
        <span className="font-semibold text-slate-700">Chỉ số sinh tồn:</span>
        <span className="text-slate-600">
          Cân nặng: <strong>{patient.weight}</strong> | Chiều cao: <strong>{patient.height}</strong>
        </span>
        <span className="h-4 w-px bg-slate-200 hidden md:block"></span>
        {hasAllergy ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-rose-700">
            <AlertTriangle size={16} /> DỊ ỨNG: {patient.allergy}
          </span>
        ) : (
          <span className="text-sm font-bold text-slate-500">Dị ứng: {patient.allergy}</span>
        )}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-sky-100 bg-sky-50 p-4 shadow-sm">
          <h3 className="panel-title">AI Summary</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            {appointment ? `${appointment.summary}. ${appointment.note}` : patient.diagnosis}
          </p>
        </article>
        <article className="panel">
          <h3 className="panel-title">Hồ sơ EMR tóm tắt</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-bold text-slate-500">Tiền sử</dt>
              <dd className="text-slate-700">{patient.history.join(', ')}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-bold text-slate-500">Thuốc</dt>
              <dd className="text-slate-700">{patient.medication}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setTab('lab')}
              className={`cursor-pointer px-5 py-3 text-sm font-bold transition hover:text-brand active:scale-[0.98] ${
                tab === 'lab' ? 'border-b-2 border-brand text-brand' : 'text-slate-500'
              }`}
            >
              Cận lâm sàng
            </button>
            <button
              type="button"
              onClick={() => setTab('prescription')}
              className={`cursor-pointer px-5 py-3 text-sm font-bold transition hover:text-brand active:scale-[0.98] ${
                tab === 'prescription' ? 'border-b-2 border-brand text-brand' : 'text-slate-500'
              }`}
            >
              Kê đơn thuốc
            </button>
          </div>
          {tab === 'lab' ? (
            <div className="space-y-4 p-4">
              <h3 className="font-bold text-slate-800">Chỉ định Xét nghiệm / Chẩn đoán hình ảnh *</h3>
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  className="form-input w-full bg-white pl-10"
                  placeholder="Tìm dịch vụ (VD: Siêu âm, X-Quang, Xét nghiệm máu...)"
                  value={labSearchQuery}
                  onChange={(event) => {
                    setLabSearchQuery(event.target.value);
                    setIsLabSearchOpen(true);
                  }}
                  onFocus={() => setIsLabSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsLabSearchOpen(false), 160)}
                  onKeyDown={handleLabSearchKeyDown}
                />
                {isLabSearchOpen && labSearchQuery.trim() ? (
                  <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-xl">
                    {filteredLabServices.length ? (
                      filteredLabServices.map((service, index) => (
                        <button
                          key={service}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setHighlightedLabIndex(index)}
                          onClick={() => addService(service)}
                          className={`block w-full cursor-pointer px-3 py-2 text-left font-semibold transition ${
                            index === highlightedLabIndex
                              ? 'bg-sky-50 text-brand'
                              : 'text-slate-700 hover:bg-sky-50 hover:text-brand'
                          }`}
                        >
                          {service}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm font-medium text-slate-400">Không tìm thấy chỉ định phù hợp.</p>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {popularLabServices.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => addService(item)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition hover:ring-2 hover:ring-brand/20 active:scale-[0.98] ${
                      services.includes(item) ? 'bg-sky-100 text-brand' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {services.map((service, index) => (
                  <div
                    key={service}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2.5 font-bold text-slate-700"
                  >
                    <span>
                      {index + 1}. {service}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(service)}
                      className="cursor-pointer rounded-md px-2 py-1 text-xs font-bold text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 active:scale-90"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Yêu cầu đặc biệt / Chẩn đoán sơ bộ</span>
                <textarea
                  className="form-textarea min-h-24"
                  value={preliminaryDiagnosis}
                  onChange={(event) => setPreliminaryDiagnosis(event.target.value)}
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleAddServiceFromSearch();
                  }}
                  className="secondary-action cursor-pointer active:scale-[0.98]"
                >
                  Thêm dịch vụ
                </button>
              </div>
            </div>
          ) : (
            <PrescriptionForm onAddDrug={handleAddDrug} />
          )}
        </article>
        <OrderPreview
          patient={patient}
          services={services}
          prescribedDrugs={prescribedDrugs}
          onRemoveService={handleRemoveService}
          onRemoveDrug={handleRemoveDrug}
          followUpDate={followUpDate}
          onFollowUpDateChange={setFollowUpDate}
          clsSent={clsSent}
          isSubmitting={isSubmitting}
          onSendCls={handleSendCls}
          onOpenPrintPreview={() => setIsPrintPreviewOpen(true)}
          onSaveEmr={handleSaveEMR}
        />
      </section>
      {isPrintPreviewOpen ? (
        <PrintPreviewModal
          patient={patient}
          services={services}
          prescribedDrugs={prescribedDrugs}
          followUpDate={followUpDate}
          onClose={() => setIsPrintPreviewOpen(false)}
          onPrint={handlePrint}
        />
      ) : null}
    </div>
  );
}

function PrescriptionForm({
  onAddDrug,
}: {
  onAddDrug: (drug: PrescriptionItem) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState('10 viên');
  const [usage, setUsage] = useState('Uống 1 viên khi sốt trên 38.5 độ, cách nhau tối thiểu 6 giờ.');

  const drugList = [
    'Paracetamol 500mg',
    'Omeprazole 20mg',
    'Amoxicillin 500mg',
    'Ibuprofen 400mg',
    'Cetirizine 10mg',
    'Clarithromycin 500mg',
    'Augmentin 1g',
    'Salbutamol 100mcg'
  ];

  const filteredDrugs = drugList.filter(drug =>
    drug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!searchQuery.trim()) return;
    onAddDrug({ name: searchQuery, quantity, usage });
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Tên thuốc</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              className="form-input pl-10 w-full"
              placeholder="Gõ để tìm thuốc trong danh mục..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            />
            {isDropdownOpen && filteredDrugs.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg text-sm">
                {filteredDrugs.map((drug) => (
                  <li
                    key={drug}
                    onMouseDown={() => {
                      setSearchQuery(drug);
                      setIsDropdownOpen(false);
                    }}
                    className="cursor-pointer px-3 py-2 hover:bg-sky-50 hover:text-brand font-medium"
                  >
                    {drug}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <label>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Số lượng</span>
          <input
            className="form-input w-full"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ví dụ: 10 viên"
          />
        </label>
      </div>
      <label>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Cách dùng</span>
        <textarea
          className="form-textarea w-full"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="Ví dụ: Uống ngày 2 lần..."
        />
      </label>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="secondary-action cursor-pointer active:scale-[0.98]"
        >
          Thêm thuốc
        </button>
      </div>
    </div>
  );
}

function OrderPreview({
  patient,
  services,
  prescribedDrugs,
  onRemoveService,
  onRemoveDrug,
  followUpDate,
  onFollowUpDateChange,
  clsSent,
  isSubmitting,
  onSendCls,
  onOpenPrintPreview,
  onSaveEmr,
}: {
  patient: Patient;
  services: string[];
  prescribedDrugs: PrescriptionItem[];
  onRemoveService: (service: string) => void;
  onRemoveDrug: (index: number) => void;
  followUpDate: string;
  onFollowUpDateChange: (value: string) => void;
  clsSent: boolean;
  isSubmitting: boolean;
  onSendCls: () => void;
  onOpenPrintPreview: () => void;
  onSaveEmr: () => void;
}) {
  return (
    <aside className="flex min-h-[520px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="panel-title">Phiếu Chỉ định & Đơn thuốc</h3>
        <p className="panel-subtitle">{patient.name} ({patient.code})</p>
      </div>
      <div className="flex-1 space-y-5 p-4 overflow-y-auto">
        <div>
          <p className="mb-2 text-sm font-bold text-brand">I. Cận lâm sàng (Đã chỉ định)</p>
          {services.length === 0 ? (
            <p className="text-sm italic text-slate-400">(Chưa có dịch vụ nào được chỉ định)</p>
          ) : (
            services.map((service, index) => (
              <div key={service} className="flex justify-between items-start border-b border-dashed border-slate-200 py-2">
                <div>
                  <p className="font-bold text-slate-800">{index + 1}. {service}</p>
                  <p className="text-xs text-slate-500">Chẩn đoán sơ bộ: Viêm tai giữa có mủ.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveService(service)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 hover:bg-rose-50 rounded"
                >
                  Xóa
                </button>
              </div>
            ))
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">II. Đơn thuốc</p>
          {prescribedDrugs.length === 0 ? (
            <p className="text-sm italic text-slate-400">(Chưa có đơn thuốc nào được kê)</p>
          ) : (
            <div className="space-y-2">
              {prescribedDrugs.map((drug, index) => (
                <div key={`${drug.name}-${index}`} className="border-b border-dashed border-slate-200 py-2 flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-slate-800 truncate">{drug.name}</span>
                      <span className="text-blue-600 font-medium text-sm shrink-0">{drug.quantity}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Cách dùng: {drug.usage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveDrug(index)}
                    className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 hover:bg-rose-50 rounded shrink-0"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Hẹn ngày tái khám</span>
          <SmartFollowUpDatePicker value={followUpDate} onChange={onFollowUpDateChange} />
        </label>
      </div>
      <div className="space-y-2 border-t border-slate-100 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onOpenPrintPreview} className="ghost-action cursor-pointer active:scale-[0.98]">Xem & In phiếu</button>
          <button
            type="button"
            disabled={services.length === 0}
            onClick={onSendCls}
            className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-bold transition active:scale-[0.98] ${
              services.length === 0
                ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-50'
                : clsSent
                  ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {clsSent ? 'Đã gửi phòng CLS' : 'Gửi phòng CLS'}
          </button>
        </div>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSaveEmr}
          className="secondary-action w-full cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Đang lưu...
            </span>
          ) : 'Lưu vào EMR'}
        </button>
      </div>
    </aside>
  );
}

function SmartFollowUpDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const quickOptions = [
    { label: '3 ngày', days: 3 },
    { label: '1 tuần', days: 7 },
    { label: '2 tuần', days: 14 },
    { label: '1 tháng', days: 30 },
  ];

  const selectQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onChange(toIsoDate(date));
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!open) {
      setPopoverStyle(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (!trigger || !popover) return;

      const rootStyles = getComputedStyle(document.documentElement);
      const viewportPadding = Number.parseFloat(rootStyles.getPropertyValue('--spacing-md'));
      const triggerGap = Number.parseFloat(rootStyles.getPropertyValue('--spacing-xs'));
      const triggerRect = trigger.getBoundingClientRect();
      const popoverWidth = Math.min(
        Math.max(triggerRect.width, popover.offsetWidth),
        window.innerWidth - viewportPadding * 2,
      );
      const popoverHeight = popover.offsetHeight;
      const openUpward = triggerRect.bottom + triggerGap + popoverHeight > window.innerHeight - viewportPadding;
      const preferredTop = openUpward
        ? triggerRect.top - popoverHeight - triggerGap
        : triggerRect.bottom + triggerGap;
      const maxLeft = Math.max(viewportPadding, window.innerWidth - popoverWidth - viewportPadding);

      setPopoverStyle({
        top: Math.min(
          Math.max(viewportPadding, preferredTop),
          Math.max(viewportPadding, window.innerHeight - popoverHeight - viewportPadding),
        ),
        left: Math.min(Math.max(viewportPadding, triggerRect.right - popoverWidth), maxLeft),
        width: popoverWidth,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setPopoverStyle(null);
          setOpen((current) => !current);
        }}
        className="form-input flex w-full cursor-pointer items-center justify-between bg-white text-left font-semibold text-slate-600"
      >
        <span>{value ? formatFollowUpDisplay(value) : '- Chưa hẹn -'}</span>
        <CalendarDays size={17} className="text-slate-400" />
      </button>

      {open ? (
        <div
          ref={popoverRef}
          className="follow-up-datepicker-popover fixed z-[9999] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
          style={popoverStyle ?? { top: 0, left: 0, visibility: 'hidden' }}
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => selectQuickDate(option.days)}
                className="cursor-pointer rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-sky-100 hover:text-brand active:scale-[0.98]"
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="block border-t border-slate-100 pt-3">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Chọn ngày tùy chỉnh</span>
            <input
              type="date"
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
                setOpen(false);
              }}
              className="form-input w-full bg-white"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function PrintPreviewModal({
  patient,
  services,
  prescribedDrugs,
  followUpDate,
  onClose,
  onPrint,
}: {
  patient: Patient;
  services: string[];
  prescribedDrugs: PrescriptionItem[];
  followUpDate: string;
  onClose: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm print-modal-overlay">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl print-modal-content">
        <div className="no-print flex items-center justify-between border-b border-slate-200 px-5 py-4 print:hidden">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Xem & In phiếu</h3>
            <p className="text-xs font-semibold text-slate-500">Bản xem trước phiếu chỉ định và đơn thuốc</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto bg-slate-100 p-5 print-modal-body">
          <article className="print-content mx-auto min-h-[720px] max-w-[620px] bg-white p-8 text-slate-800 shadow-lg printable-sheet">
            <div className="border-b border-slate-300 pb-4 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">NovaCare Clinic</p>
              <h2 className="mt-2 text-xl font-extrabold uppercase text-slate-900">Phiếu Chỉ định & Đơn thuốc</h2>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <p><strong>Bệnh nhân:</strong> {patient.name}</p>
              <p><strong>Mã BN:</strong> {patient.code}</p>
              <p><strong>Giới tính/Tuổi:</strong> {patient.gender} / {patient.age}</p>
              <p><strong>Ngày in:</strong> {formatDisplayDate(toIsoDate(new Date()))}</p>
            </div>

            <section className="mt-6">
              <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold text-brand">I. Cận lâm sàng</h3>
              <div className="mt-3 space-y-2 text-sm">
                {services.length ? services.map((service, index) => (
                  <p key={service}><strong>{index + 1}. {service}</strong> - Chẩn đoán sơ bộ: Viêm tai giữa có mủ.</p>
                )) : <p className="italic text-slate-400">Chưa có chỉ định cận lâm sàng.</p>}
              </div>
            </section>

            <section className="mt-6">
              <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold text-slate-700">II. Đơn thuốc</h3>
              <div className="mt-3 space-y-3 text-sm">
                {prescribedDrugs.length ? prescribedDrugs.map((drug, index) => (
                  <div key={`${drug.name}-${index}`}>
                     <p><strong>{index + 1}. {drug.name}</strong> <span className="text-blue-600">({drug.quantity})</span></p>
                     <p className="text-slate-500">Cách dùng: {drug.usage}</p>
                  </div>
                )) : <p className="italic text-slate-400">Chưa có thuốc trong đơn.</p>}
              </div>
            </section>

            <section className="mt-6 text-sm">
              <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold text-slate-700">III. Hẹn tái khám</h3>
              <p className="mt-3">{followUpDate ? formatFollowUpDisplay(followUpDate) : '- Chưa hẹn -'}</p>
            </section>

            <div className="mt-12 flex justify-end text-center text-sm">
              <div>
                <p>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                <p className="mt-2 font-bold">Bác sĩ điều trị</p>
                <p className="mt-16 font-bold">BS. Nguyễn Văn A</p>
              </div>
            </div>
          </article>
        </div>

        <div className="no-print flex justify-end gap-2 border-t border-slate-200 px-5 py-4 print:hidden">
          <button type="button" onClick={onClose} className="ghost-action no-print cursor-pointer">Đóng</button>
          <button type="button" onClick={onPrint} className="secondary-action no-print cursor-pointer">In phiếu</button>
        </div>
      </div>
    </div>
  );
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function inferLabCategory(service: string): LabResult['category'] {
  const normalized = normalizeSearchText(service);
  if (normalized.includes('x-quang') || normalized.includes('x quang')) return 'X-quang';
  if (normalized.includes('sieu am')) return 'Siêu âm';
  if (normalized.includes('xet nghiem') || normalized.includes('cong thuc') || normalized.includes('dong mau') || normalized.includes('crp')) return 'Xét nghiệm';
  return 'Nội soi';
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function formatFollowUpDisplay(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  const quickLabel = diffDays === 3
    ? '3 ngày sau'
    : diffDays === 7
      ? '1 tuần sau'
      : diffDays === 14
        ? '2 tuần sau'
        : diffDays === 30
          ? '1 tháng sau'
          : null;

  return quickLabel ? `${formatDisplayDate(value)} (${quickLabel})` : formatDisplayDate(value);
}
