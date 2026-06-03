import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { labResults, patients } from '../data';
import type { LabResult, Patient, SavedEmrEntry } from '../types';
import { SearchInput } from '../components/shared';

type PatientSortMode = 'recent' | 'nameAsc' | 'nameDesc';
type RecordTab = 'visits' | 'labs';

export function RecordsView({ onOpenRecord, onNotify }: { onOpenRecord: (code: string) => void; onNotify: (message: string) => void }) {
  const [searchInput, setSearchInput] = useState('');
  const [sortMode, setSortMode] = useState<PatientSortMode>('recent');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const visiblePatients = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchInput);
    const collator = new Intl.Collator('vi-VN', { sensitivity: 'base' });

    const filteredPatients = normalizedQuery
      ? patients.filter((patient) => {
        const searchableText = [
          patient.name,
          patient.phone,
          patient.code,
        ].join(' ');

        return normalizeSearchText(searchableText).includes(normalizedQuery);
      })
      : patients;

    return [...filteredPatients].sort((first, second) => {
      if (sortMode === 'nameAsc') return collator.compare(first.name, second.name);
      if (sortMode === 'nameDesc') return collator.compare(second.name, first.name);

      return parseVisitDate(second.visits[0].date).getTime() - parseVisitDate(first.visits[0].date).getTime();
    });
  }, [searchInput, sortMode]);
  const totalPages = Math.max(1, Math.ceil(visiblePatients.length / pageSize));
  const pagedPatients = visiblePatients.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Danh sách Bệnh án điện tử (EMR)</h2>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
          <SearchInput
            placeholder="Tìm Tên / SĐT / Mã BN (VD: PA-019)..."
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              setPage(1);
            }}
            className="max-w-none lg:flex-1"
          />
          <select
            value={sortMode}
            onChange={(event) => {
              setSortMode(event.target.value as PatientSortMode);
              setPage(1);
            }}
            className="form-input w-full cursor-pointer bg-white lg:w-44"
          >
            <option value="recent">Lần khám gần nhất</option>
            <option value="nameAsc">Tên A-Z</option>
            <option value="nameDesc">Tên Z-A</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500"><tr><th className="px-4 py-3">Mã BN</th><th className="px-4 py-3">Bệnh nhân</th><th className="px-4 py-3">Ngày khám cuối</th><th className="px-4 py-3">Chẩn đoán gần nhất</th><th className="px-4 py-3 text-right">Hành động</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {pagedPatients.map((patient) => (
                <tr
                  key={patient.code}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onOpenRecord(patient.code)}
                >
                  <td className="px-4 py-3 font-bold text-slate-600">{patient.code}</td>
                  <td className="px-4 py-3">
                    <b>{patient.name}</b>
                    <span className="block text-xs text-slate-500">
                      {patient.gender} | {patient.age} tuổi
                    </span>
                  </td>
                  <td className="px-4 py-3">{patient.visits[0].date}</td>
                  <td className="px-4 py-3">
                    {patient.diagnosis}
                    <span className="block text-xs text-slate-500">{patient.doctor}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRecord(patient.code);
                      }}
                      className="cursor-pointer rounded-md border border-brand px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-sky-50 active:scale-[0.98]"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visiblePatients.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
              Không tìm thấy hồ sơ bệnh nhân phù hợp.
            </div>
          ) : null}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} totalItems={visiblePatients.length} pageSize={pageSize} onChange={setPage} />
      </section>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = buildPaginationItems(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Hiển thị {start}-{end} / {totalItems} hồ sơ
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
          className="flex h-7 w-7 items-center justify-center rounded text-sky-300 transition hover:bg-sky-50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          {pages.map((pageItem, index) =>
            pageItem === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="flex h-7 min-w-6 items-center justify-center text-sm font-extrabold text-brand">
                ...
              </span>
            ) : (
              <button
                key={pageItem}
                type="button"
                onClick={() => onChange(pageItem)}
                className={`flex h-7 min-w-7 items-center justify-center rounded px-2 text-sm font-extrabold transition ${
                  currentPage === pageItem ? 'bg-brand text-white shadow-sm' : 'text-brand hover:bg-sky-50'
                }`}
              >
                {pageItem}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
          className="flex h-7 w-7 items-center justify-center rounded text-brand transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function buildPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}

function parseVisitDate(date: string) {
  const [day, month, year] = date.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function RecordDetailView({
  patient,
  initialTab = 'visits',
  savedEntries = [],
  onBack,
  onNotify,
  onStartPrescription,
}: {
  patient: Patient;
  initialTab?: RecordTab;
  savedEntries?: SavedEmrEntry[];
  onBack: () => void;
  onNotify: (message: string) => void;
  onStartPrescription: (code: string) => void;
}) {
  const visits = useMemo(
    () => [...savedEntries.map((entry) => entry.visit), ...patient.visits],
    [patient.visits, savedEntries],
  );
  const savedLabResults = useMemo(
    () => savedEntries.flatMap((entry) => entry.labResults),
    [savedEntries],
  );
  const [selectedVisit, setSelectedVisit] = useState<typeof visits[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRecordTab, setActiveRecordTab] = useState<RecordTab>('visits');
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null);
  const [viewedLabResultIds, setViewedLabResultIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveRecordTab(initialTab);
  }, [initialTab, patient.code]);

  const getDisplayLabResult = (result: LabResult): LabResult => (
    viewedLabResultIds.includes(result.id) && result.status === 'Mới'
      ? { ...result, status: 'Đã xem' }
      : result
  );

  const openLabResult = (result: LabResult) => {
    if (result.status === 'Mới') {
      setViewedLabResultIds((current) => (current.includes(result.id) ? current : [...current, result.id]));
    }

    setSelectedLabResult(getDisplayLabResult({ ...result, status: result.status === 'Mới' ? 'Đã xem' : result.status }));
  };

  const patientLabResults = useMemo(
    () => [...savedLabResults, ...labResults]
      .filter((item) => item.patientCode === patient.code)
      .map((item) => getDisplayLabResult(item)),
    [patient.code, savedLabResults, viewedLabResultIds],
  );

  const handleOpenVisitDetails = (visit: typeof visits[0]) => {
    setSelectedVisit(visit);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedVisit(null), 300);
  };

  const visitDetails = selectedVisit ? getVisitDetails(selectedVisit.date, selectedVisit.diagnosis) : null;
  const selectedVisitPrescription = selectedVisit?.prescriptions?.length
    ? selectedVisit.prescriptions.map((drug) => ({
      name: drug.name,
      dosage: drug.name.replace(/^.*?(\d+\s*(mg|mcg|g)).*$/i, '$1'),
      quantity: drug.quantity,
      instruction: drug.usage,
    }))
    : visitDetails?.prescription ?? [];
  const selectedVisitLabResults = selectedVisit
    ? patientLabResults.filter((item) => item.visitDate === selectedVisit.date)
    : [];

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-brand active:scale-[0.98]">Danh sách EMR / <span className="text-brand">{patient.name}</span></button>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-800">Tổng quan Hồ sơ Bệnh án</h2>
        <button
          type="button"
          onClick={() => onStartPrescription(patient.code)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-bold text-sm shadow-sm active:scale-[0.98]"
        >
          Khám / Kê đơn mới
        </button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 border-l-4 border-brand pl-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-lg font-bold text-brand">{patient.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}</span><div><h3 className="text-lg font-bold text-slate-900">{patient.name} <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{patient.code}</span></h3><p className="text-sm text-slate-500">{patient.gender} | {patient.age} tuổi | SĐT: {patient.phone} | {patient.address}</p></div></div>
          <div className="grid grid-cols-4 gap-4 text-center text-sm"><Vital label="Nhóm máu" value={patient.blood} danger /><Vital label="Chiều cao" value={patient.height} /><Vital label="Cân nặng" value={patient.weight} /><Vital label="BMI" value={patient.bmi} normal /></div>
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.4fr]">
        <article className="panel space-y-4"><h3 className="panel-title">Thông tin y tế cơ bản</h3><InfoBox title="Dị ứng (BN tự khai báo)" danger text={patient.allergy} /><InfoBox title="Tiền sử bệnh lý" text={patient.history.join(' · ')} /><InfoBox title="Tiền sử gia đình" text={patient.family} /><InfoBox title="Thuốc đang dùng định kỳ" info text={patient.medication} /></article>
        <article className="panel">
          <div className="flex gap-4 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveRecordTab('visits')}
              className={`cursor-pointer border-b-2 px-2 pb-3 text-sm font-bold active:scale-[0.98] ${
                activeRecordTab === 'visits' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-brand'
              }`}
            >
              Lịch sử khám & Đơn thuốc
            </button>
            <button
              type="button"
              onClick={() => setActiveRecordTab('labs')}
              className={`cursor-pointer border-b-2 px-2 pb-3 text-sm font-bold active:scale-[0.98] ${
                activeRecordTab === 'labs' ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-brand'
              }`}
            >
              Kết quả cận lâm sàng
            </button>
          </div>

          {activeRecordTab === 'visits' ? (
            <div className="mt-4 space-y-2 border-l border-slate-200 pl-4">
              {visits.map((visit) => (
                <div
                  key={`${visit.date}-${visit.department}`}
                  className="relative cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-r-lg p-3 -ml-3 group"
                  onClick={() => handleOpenVisitDetails(visit)}
                >
                  <div className="absolute -left-[9px] top-[18px] w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-500/30" />
                  
                  <p className="font-bold text-slate-800">{visit.date} - {visit.department}</p>
                  <p className="text-xs text-slate-500">{visit.doctor}</p>
                  <p className="mt-1 text-sm">Lý do khám: {visit.reason}</p>
                  <p className="text-sm font-bold">Chẩn đoán: {visit.diagnosis}</p>
                  <p className="mt-1 text-gray-500 text-sm font-normal">
                    Thuốc đã kê: {formatPrescriptionSummary(visit.prescriptions)}
                  </p>
                  <div className="mt-1">
                    <span className="inline-block text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Xem chi tiết đợt khám →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {patientLabResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => openLabResult(result)}
                  className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-brand hover:bg-sky-50/40 active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{result.title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {result.category} | {result.performedAt} | {result.department}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getLabStatusClass(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{result.description}</p>
                  <p className="mt-2 text-xs font-bold text-blue-600">Xem hình ảnh & kết quả chi tiết →</p>
                </button>
              ))}
              {!patientLabResults.length ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  Chưa có kết quả cận lâm sàng cho hồ sơ này.
                </div>
              ) : null}
            </div>
          )}
        </article>
      </section>

      {selectedVisit && visitDetails
        ? createPortal(
          <>
            {/* Drawer Overlay Backdrop */}
            <div
              className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={handleCloseDrawer}
            />

            {/* Slide-over Drawer */}
            <aside
              className={`fixed inset-y-0 right-0 z-[101] flex h-dvh w-[550px] max-w-[95vw] flex-col border-l border-slate-200 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
                drawerOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">Báo cáo Y khoa Chi tiết</h3>
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="text-slate-400 hover:text-rose-500 transition active:scale-95 p-1 rounded-lg hover:bg-slate-100 animate-pulse-once"
              aria-label="Đóng bảng"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-left">
            {/* Treatment Meta info */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span className="text-sm font-bold text-slate-800">Ngày khám: {selectedVisit.date}</span>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  {selectedVisit.department}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Bác sĩ điều trị: <strong className="text-slate-700">{selectedVisit.doctor}</strong>
              </p>
            </div>

            {/* Vitals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinh hiệu (Vitals)</h4>
              <div className="bg-slate-50 rounded-xl p-3.5 grid grid-cols-3 gap-2 border border-slate-100 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Huyết áp</p>
                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">{visitDetails.vitals.bp}</p>
                </div>
                <div className="border-x border-slate-200/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Nhịp tim</p>
                  <p className="text-sm font-extrabold text-slate-700 mt-0.5">{visitDetails.vitals.hr}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Nhiệt độ</p>
                  <p className="text-sm font-extrabold text-rose-600 mt-0.5">{visitDetails.vitals.temp}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chẩn đoán lâm sàng</h4>
              <div className="space-y-3 bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Lý do khám</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{selectedVisit.reason}</p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-400">Tóm tắt triệu chứng</p>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{visitDetails.symptoms}</p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-400">Mã bệnh ICD-10</p>
                  <p className="text-sm font-extrabold text-blue-700 bg-blue-50/60 border border-blue-100/50 rounded-md px-2.5 py-1.5 mt-1 inline-block">
                    {visitDetails.icd10}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Đơn thuốc chi tiết</h4>
              <div className="overflow-hidden border border-slate-200/80 rounded-xl">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Tên thuốc / Hàm lượng</th>
                      <th className="px-3 py-2.5 text-right">SL</th>
                      <th className="px-3 py-2.5">Cách dùng / Liều lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {selectedVisitPrescription.map((drug) => (
                      <tr key={drug.name} className="hover:bg-slate-50/40">
                        <td className="px-3 py-3">
                          <p className="font-bold text-slate-800">{drug.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Hàm lượng: {drug.dosage}</p>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-700">{drug.quantity}</td>
                        <td className="px-3 py-3 text-slate-600 leading-relaxed font-medium">{drug.instruction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Labs list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chỉ định Cận lâm sàng</h4>
              <div className="space-y-2">
                {selectedVisitLabResults.map((result) => (
                  <div key={result.id} className="flex justify-between items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-xs">
                    <span className="font-semibold text-slate-700">{result.title}</span>
                    <button
                      type="button"
                      onClick={() => openLabResult(result)}
                      className="shrink-0 text-blue-600 font-bold hover:underline active:scale-95 transition"
                    >
                      Xem kết quả ↗
                    </button>
                  </div>
                ))}
                {!selectedVisitLabResults.length ? (
                  <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-500">
                    Chưa có kết quả cận lâm sàng cho đợt khám này.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 flex justify-end bg-slate-50/50">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition active:scale-95"
            >
              Đóng báo cáo
            </button>
          </div>
            </aside>
          </>,
          document.body,
        )
        : null}

      {selectedLabResult
        ? createPortal(
          <LabResultDetailModal
            result={selectedLabResult}
            patient={patient}
            onClose={() => setSelectedLabResult(null)}
          />,
          document.body,
        )
        : null}
    </div>
  );
}

function LabResultDetailModal({
  result,
  patient,
  onClose,
}: {
  result: LabResult;
  patient: Patient;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[120] bg-slate-900/45 backdrop-blur-sm" onClick={onClose} />
      <section
        className="fixed left-1/2 top-1/2 z-[121] flex max-h-[90dvh] w-[760px] max-w-[94vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết kết quả cận lâm sàng"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kết quả cận lâm sàng</p>
            <h3 className="mt-1 text-base font-extrabold text-slate-900">{result.title}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {patient.name} ({patient.code}) | {result.performedAt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-rose-500 active:scale-95"
            aria-label="Đóng kết quả"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 p-4">
                <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{result.imageLabel}</span>
                  <span>{result.category}</span>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-900">
                  <div className="absolute inset-4 rounded-full border border-cyan-300/25 bg-cyan-200/10 blur-sm" />
                  <div className="absolute left-1/2 top-1/2 h-32 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/50 bg-cyan-300/15 shadow-[0_0_60px_rgba(34,211,238,0.25)]" />
                  <div className="absolute inset-x-8 top-1/3 h-px bg-cyan-200/40" />
                  <div className="absolute inset-y-8 left-1/2 w-px bg-cyan-200/30" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded bg-slate-950/70 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-100">
                    <span>Medical preview</span>
                    <span>{result.status}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <DetailMeta label="Khoa thực hiện" value={result.department} />
                  <DetailMeta label="Bác sĩ" value={result.doctor} />
                  <DetailMeta label="Ngày khám" value={result.visitDate} />
                  <DetailMeta label="Trạng thái" value={result.status} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <section className="rounded-xl border border-slate-100 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tóm tắt</h4>
                <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
              </section>

              <section className="rounded-xl border border-slate-100 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông số / ghi nhận</h4>
                <ul className="mt-3 space-y-2">
                  {result.findings.map((finding) => (
                    <li key={finding} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      {finding}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">Kết luận</h4>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{result.conclusion}</p>
              </section>
            </div>
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            Đóng kết quả
          </button>
        </footer>
      </section>
    </>
  );
}

function DetailMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
    </div>
  );
}

function getLabStatusClass(status: LabResult['status']) {
  if (status === 'Mới') return 'bg-rose-50 text-rose-600';
  if (status === 'Đang chờ KQ') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-500';
}

function formatPrescriptionSummary(prescriptions?: Array<{ name: string }>) {
  if (!prescriptions?.length) return 'Paracetamol 500mg, Omeprazole...';
  return prescriptions.map((item) => item.name).join(', ');
}

function Vital({ label, value, danger = false, normal = false }: { label: string; value: string; danger?: boolean; normal?: boolean }) { return <div><p className="text-xs font-medium uppercase text-slate-400">{label}</p><p className={`mt-1 text-base font-bold ${danger ? 'text-rose-600' : 'text-slate-800'}`}>{value}</p>{normal ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">Bình thường</span> : null}</div>; }
function InfoBox({ title, text, danger = false, info = false }: { title: string; text: string; danger?: boolean; info?: boolean }) { return <div><h4 className="mb-2 text-sm font-bold text-slate-700">{title}</h4><div className={`rounded-md border px-3 py-2 text-sm ${danger ? 'border-rose-200 bg-rose-50 font-bold text-rose-600' : info ? 'border-sky-100 bg-sky-50 text-slate-600' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{text}</div></div>; }

interface VisitDetails {
  vitals: { bp: string; hr: string; temp: string };
  symptoms: string;
  icd10: string;
  prescription: Array<{ name: string; dosage: string; quantity: string; instruction: string }>;
  labs: Array<{ name: string; status: string }>;
}

function getVisitDetails(date: string, diagnosis: string): VisitDetails {
  if (diagnosis.includes('H66.0') || diagnosis.includes('Viêm tai giữa')) {
    return {
      vitals: { bp: '120/80 mmHg', hr: '78 nhịp/phút', temp: '38.2 °C' },
      symptoms: 'Đau buốt tai trái tăng dần về đêm, ù tai nhiều, chảy mủ vàng nhạt qua lỗ tai. Họng đỏ nhẹ.',
      icd10: 'H66.0 - Viêm tai giữa cấp mủ',
      prescription: [
        { name: 'Cefuroxime 500mg', dosage: '500mg', quantity: '14 viên', instruction: 'Uống 1 viên x 2 lần/ngày sau ăn.' },
        { name: 'Ibuprofen 400mg', dosage: '400mg', quantity: '10 viên', instruction: 'Uống 1 viên x 2 lần/ngày khi đau nhiều.' },
        { name: 'Otipax', dosage: 'Nhỏ tai', quantity: '1 lọ', instruction: 'Nhỏ tai trái 3-4 giọt x 3 lần/ngày.' }
      ],
      labs: [
        { name: 'Nội sơ tai trái ống mềm', status: 'Đã có kết quả' }
      ]
    };
  }

  if (diagnosis.includes('J02.9') || diagnosis.includes('Viêm họng')) {
    return {
      vitals: { bp: '115/75 mmHg', hr: '76 nhịp/phút', temp: '37.5 °C' },
      symptoms: 'Đau rát họng khi nuốt, ho khan kéo dài 3 ngày, sốt nhẹ đầu chiều, mệt mỏi ăn uống kém.',
      icd10: 'J02.9 - Viêm họng cấp tính không xác định',
      prescription: [
        { name: 'Amoxicillin 500mg', dosage: '500mg', quantity: '15 viên', instruction: 'Uống 1 viên x 3 lần/ngày sau ăn.' },
        { name: 'Paracetamol 500mg', dosage: '500mg', quantity: '10 viên', instruction: 'Uống 1 viên khi sốt trên 38.5 °C.' },
        { name: 'Strepsils Cool', dosage: 'Kẹo ngậm', quantity: '2 vỉ', instruction: 'Ngậm 1 viên mỗi 2-3 giờ khi đau rát họng.' }
      ],
      labs: [
        { name: 'Công thức máu (CBC)', status: 'Đã có kết quả' },
        { name: 'Nội soi vòm họng ống mềm', status: 'Đã có kết quả' }
      ]
    };
  }

  if (diagnosis.includes('K21.0') || diagnosis.includes('Trào ngược')) {
    return {
      vitals: { bp: '125/80 mmHg', hr: '72 nhịp/phút', temp: '36.8 °C' },
      symptoms: 'Nóng rát sau xương ức, ợ chua nhiều sau ăn, hay bị đắng miệng vào buổi sáng khi ngủ dậy.',
      icd10: 'K21.0 - Bệnh trào ngược dạ dày - thực quản có viêm thực quản',
      prescription: [
        { name: 'Esomeprazole 40mg', dosage: '40mg', quantity: '14 viên', instruction: 'Uống 1 viên trước ăn sáng 30 phút.' },
        { name: 'Gaviscon Dual Action', dosage: 'Hỗn dịch', quantity: '20 gói', instruction: 'Uống 1 gói sau ăn 1 giờ và trước khi ngủ.' }
      ],
      labs: [
        { name: 'Nội soi thực quản - dạ dày - tá tràng', status: 'Đã có kết quả' }
      ]
    };
  }

  return {
    vitals: { bp: '120/80 mmHg', hr: '80 nhịp/phút', temp: '37.0 °C' },
    symptoms: 'Triệu chứng lâm sàng ổn định, đau đầu nhẹ về chiều, nghẹt mũi nhẹ.',
    icd10: diagnosis || 'J00 - Viêm mũi họng cấp',
    prescription: [
      { name: 'Paracetamol 500mg', dosage: '500mg', quantity: '10 viên', instruction: 'Uống 1 viên khi sốt hoặc đau đầu.' }
    ],
    labs: [
      { name: 'Nội soi mũi xoang ống mềm', status: 'Đã có kết quả' }
    ]
  };
}
