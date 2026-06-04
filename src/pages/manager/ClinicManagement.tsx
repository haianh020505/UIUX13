import { ChevronDown, Eye, EyeOff, Flag, Pencil, Plus, Reply, Trash2, X } from 'lucide-react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { clinicTabs } from './data';
import type { ClinicTab } from './types';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';
import ReviewText from './components/ReviewText';
import SearchBox from './components/SearchBox';
import StatusBadge from './components/StatusBadge';
import UploadArea from './components/UploadArea';

type Specialty = {
  id: string;
  name: string;
  lead: string;
  status: 'active' | 'hidden';
  description?: string;
};

type Service = {
  id: string;
  name: string;
  specialty: string;
  duration: string;
  price: string;
  description: string;
};

type Review = {
  id: string;
  date: string;
  patient: string;
  service: string;
  doctor: string;
  specialty: string;
  stars: number;
  text: string;
  reply?: string;
  flagged?: boolean;
};

type ConfirmState = {
  title: string;
  message: string;
  confirmText?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
};

const doctors = ['BS. Trần Văn A', 'BS. Lê Thị C', 'BS. Phạm Minh D', 'BS. Nguyễn Thu Hương'];
const schedules = ['Thứ 2 - Thứ 7 (08:00 - 17:30)', 'Thứ 2 - Thứ 6 (07:30 - 17:00)', 'Hằng ngày (08:00 - 20:00)'];
const operationStatuses = ['Mở cửa hoạt động', 'Tạm ngưng tiếp nhận', 'Đóng cửa bảo trì'];
const serviceDurations = ['10 - 15 phút', '15 - 20 phút', '20 - 30 phút', '30 - 45 phút', '45 - 60 phút'];

const initialSpecialties: Specialty[] = [
  { id: 'CK-01', name: 'Nội Tổng Hợp', lead: 'BS. Trần Văn A', status: 'active', description: 'Khám và điều trị bệnh lý nội khoa tổng quát.' },
  { id: 'CK-03', name: 'Răng Hàm Mặt', lead: 'BS. Lê Thị C', status: 'hidden', description: 'Tư vấn, điều trị nha khoa và bệnh lý răng hàm mặt.' },
];

const initialServices: Service[] = [
  { id: 'DV-01', name: 'Khám nội tổng quát', specialty: 'Nội Tổng Hợp', duration: '15 - 20 phút', price: '200.000', description: 'Khám lâm sàng, chẩn đoán cơ bản' },
];

const initialReviews: Review[] = [
  {
    id: 'RV-01',
    date: '05/05/2026',
    patient: 'Lê Tuấn Anh',
    service: 'Khám nội tổng quát',
    doctor: 'BS. Trần Văn A',
    specialty: 'Nội Tổng Hợp',
    stars: 5,
    text: 'Bác sĩ tư vấn rất nhiệt tình, sạch sẽ.',
  },
  {
    id: 'RV-02',
    date: '04/05/2026',
    patient: 'Nguyễn Thị Hoa',
    service: 'Chụp X-Quang',
    doctor: 'Phòng XQ-01',
    specialty: 'Nội Tổng Hợp',
    stars: 5,
    text: 'Phải đợi hơi lâu dù đã đặt lịch trước.',
  },
];

function nextCode(prefix: string, items: { id: string }[]) {
  const maxNumber = items.reduce((max, item) => {
    const value = Number(item.id.replace(`${prefix}-`, ''));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `${prefix}-${String(maxNumber + 1).padStart(2, '0')}`;
}

export default function ClinicManagement({ activeTab, onTabChange, onNotify }: { activeTab: ClinicTab; onTabChange: (tab: ClinicTab) => void; onNotify?: (message: string) => void }) {
  const [specialties, setSpecialties] = useState<Specialty[]>(initialSpecialties);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [formView, setFormView] = useState<'specialty' | 'service' | null>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  if (formView === 'specialty') {
    return (
      <>
      <AddSpecialtyForm
        code={editingSpecialty?.id ?? nextCode('CK', specialties)}
        specialty={editingSpecialty}
        onCancel={() => {
          setEditingSpecialty(null);
          setFormView(null);
        }}
        onSave={(payload) => {
          if (editingSpecialty) {
            setSpecialties((items) => items.map((item) => (item.id === editingSpecialty.id ? { ...item, ...payload } : item)));
            onNotify?.('Đã lưu thay đổi chuyên khoa');
          } else {
            setSpecialties((items) => [...items, { id: nextCode('CK', items), ...payload }]);
            onNotify?.('Đã thêm chuyên khoa');
          }
          setEditingSpecialty(null);
          setFormView(null);
        }}
      />
      {confirm ? <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} /> : null}
      </>
    );
  }

  if (formView === 'service') {
    return (
      <>
      <AddServiceForm
        code={editingService?.id ?? nextCode('DV', services)}
        service={editingService}
        specialties={specialties}
        onCancel={() => {
          setEditingService(null);
          setFormView(null);
        }}
        onSave={(payload) => {
          if (editingService) {
            setServices((items) => items.map((item) => (item.id === editingService.id ? { ...item, ...payload } : item)));
            onNotify?.('Đã lưu thay đổi dịch vụ');
          } else {
            setServices((items) => [...items, { id: nextCode('DV', items), ...payload }]);
            onNotify?.('Đã thêm dịch vụ');
          }
          setEditingService(null);
          setFormView(null);
        }}
      />
      {confirm ? <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} /> : null}
      </>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800">Quản lý phòng khám</h1>
      <ClinicTabs activeTab={activeTab} onTabChange={onTabChange} />
      <div className="mt-5">
        {activeTab === 'info' ? <ClinicInfo onNotify={onNotify} /> : null}
        {activeTab === 'specialties' ? (
          <SpecialtyList
            specialties={specialties}
            onAdd={() => setFormView('specialty')}
            onEdit={(specialty) => {
              setEditingSpecialty(specialty);
              setFormView('specialty');
            }}
            onToggle={(id) => {
              const specialty = specialties.find((item) => item.id === id);
              setConfirm({
                title: specialty?.status === 'active' ? 'Ẩn chuyên khoa?' : 'Hiện chuyên khoa?',
                message: `Bạn có chắc muốn cập nhật trạng thái chuyên khoa ${specialty?.name ?? ''}?`,
                confirmText: 'Cập nhật',
                onConfirm: () => {
                  setSpecialties((items) => items.map((item) => (item.id === id ? { ...item, status: item.status === 'active' ? 'hidden' : 'active' } : item)));
                  onNotify?.('Đã cập nhật trạng thái chuyên khoa');
                },
              });
            }}
            onDelete={(id) => {
              const specialty = specialties.find((item) => item.id === id);
              setConfirm({
                title: 'Xóa chuyên khoa?',
                message: `Chuyên khoa ${specialty?.name ?? ''} sẽ bị xóa khỏi danh sách.`,
                confirmText: 'Xóa',
                tone: 'danger',
                onConfirm: () => {
                  setSpecialties((items) => items.filter((item) => item.id !== id));
                  onNotify?.('Đã xóa chuyên khoa');
                },
              });
            }}
          />
        ) : null}
        {activeTab === 'services' ? (
          <ServiceList
            services={services}
            onAdd={() => setFormView('service')}
            onEdit={(service) => {
              setEditingService(service);
              setFormView('service');
            }}
            onDelete={(id) => {
              const service = services.find((item) => item.id === id);
              setConfirm({
                title: 'Xóa dịch vụ?',
                message: `Dịch vụ ${service?.name ?? ''} sẽ bị xóa khỏi danh sách.`,
                confirmText: 'Xóa',
                tone: 'danger',
                onConfirm: () => {
                  setServices((items) => items.filter((item) => item.id !== id));
                  onNotify?.('Đã xóa dịch vụ');
                },
              });
            }}
          />
        ) : null}
        {activeTab === 'reviews' ? <ReviewList reviews={reviews} specialties={specialties} onChange={setReviews} onNotify={onNotify} /> : null}
      </div>
      {confirm ? <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} /> : null}
    </div>
  );
}

function ClinicTabs({ activeTab, onTabChange }: { activeTab: ClinicTab; onTabChange: (tab: ClinicTab) => void }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <div className="flex min-w-[680px]">
        {clinicTabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} className={`clinic-tab ${activeTab === tab.id ? 'clinic-tab-active' : ''}`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ClinicInfo({ onNotify }: { onNotify?: (message: string) => void }) {
  const [schedule, setSchedule] = useState(schedules[0]);
  const [operationStatus, setOperationStatus] = useState(operationStatuses[0]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <section className="panel">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Tên phòng khám / Cơ sở y tế">
          <input className="form-input" defaultValue="Phòng khám Đa khoa Fakeeh Care" />
        </Field>
        <Field label="Số điện thoại liên hệ">
          <input className="form-input" defaultValue="1900 1234 - 0988.123.456" />
        </Field>
      </div>
      <Field label="Địa chỉ cơ sở" className="mt-5">
        <input className="form-input" defaultValue="Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội" />
      </Field>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Field label="Giờ tiếp nhận theo ngày">
          <SelectMenu value={schedule} options={schedules} onChange={setSchedule} />
        </Field>
        <Field label="Trạng thái vận hành">
          <SelectMenu
            value={operationStatus}
            options={operationStatuses}
            onChange={setOperationStatus}
            renderValue={(value) => (
              <span className={`inline-flex items-center gap-2 font-bold ${value === 'Mở cửa hoạt động' ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span className={`h-2 w-2 rounded-full ${value === 'Mở cửa hoạt động' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {value}
              </span>
            )}
          />
        </Field>
      </div>
      <Field label="Ảnh đại diện & Hình ảnh cơ sở" className="mt-5">
        <UploadArea label="Kéo thả hoặc nhấn để tải ảnh lên (PNG/JPG)" />
      </Field>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={() => setConfirmOpen(true)} className="secondary-action">Lưu thông tin</button>
      </div>
      {confirmOpen ? (
        <ConfirmDialog
          title="Lưu thông tin cơ sở?"
          message="Các thay đổi về giờ tiếp nhận và trạng thái vận hành sẽ được cập nhật."
          confirmText="Lưu thông tin"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            onNotify?.('Đã lưu thông tin cơ sở');
          }}
        />
      ) : null}
    </section>
  );
}

function SpecialtyList({
  specialties,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: {
  specialties: Specialty[];
  onAdd: () => void;
  onEdit: (specialty: Specialty) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const visibleSpecialties = specialties.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="panel p-0">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox placeholder="Tìm kiếm chuyên khoa..." value={query} onChange={setQuery} />
        <button type="button" onClick={onAdd} className="secondary-action">
          <Plus size={16} />
          Thêm mới
        </button>
      </div>
      <ResponsiveTable
        columns={['Mã Khoa', 'Tên Chuyên Khoa', 'Trưởng khoa', 'Trạng thái', 'Hành động']}
        rows={visibleSpecialties.map((specialty) => [
          specialty.id,
          <b>{specialty.name}</b>,
          specialty.lead,
          <StatusBadge status={specialty.status === 'active' ? 'Đang hoạt động' : 'Đã ẩn'} />,
          <TableActions
            hidden={specialty.status === 'hidden'}
            onEdit={() => onEdit(specialty)}
            onToggle={() => onToggle(specialty.id)}
            onDelete={() => onDelete(specialty.id)}
          />,
        ])}
      />
    </section>
  );
}

export function AddSpecialtyForm({
  code,
  specialty,
  onCancel,
  onSave,
}: {
  code?: string;
  specialty?: Specialty | null;
  onCancel: () => void;
  onSave?: (payload: Omit<Specialty, 'id'>) => void;
}) {
  const [name, setName] = useState(specialty?.name ?? '');
  const [lead, setLead] = useState(specialty?.lead ?? doctors[0]);
  const [status, setStatus] = useState<Specialty['status']>(specialty?.status ?? 'active');
  const [description, setDescription] = useState(specialty?.description ?? '');
  const [pendingPayload, setPendingPayload] = useState<Omit<Specialty, 'id'> | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPendingPayload({ name: name.trim() || 'Chuyên khoa mới', lead, status, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm font-semibold text-slate-500">
        Quản lý phòng khám / Danh mục chuyên khoa / <span className="text-brand">{specialty ? 'Chỉnh sửa' : 'Thêm mới'}</span>
      </p>
      <h1 className="mt-2 border-l-4 border-brand pl-3 text-xl font-bold text-slate-800">{specialty ? 'Chỉnh sửa Chuyên khoa' : 'Thêm mới Chuyên khoa'}</h1>
      <section className="panel mt-4 p-0">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="panel-title">Thông tin chuyên khoa</h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Mã khoa *">
              <input className="form-input cursor-not-allowed bg-slate-100 text-slate-500" value={code ?? 'CK-05'} readOnly aria-readonly="true" />
              <p className="mt-2 text-xs font-medium text-slate-400">Mã khoa được tạo tự động bởi hệ thống.</p>
            </Field>
            <Field label="Tên chuyên khoa *">
              <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập tên chuyên khoa (VD: Nhi khoa, Tim mạch...)" />
            </Field>
            <Field label="Bác sĩ Trưởng khoa">
              <SelectMenu value={lead} options={doctors} onChange={setLead} />
            </Field>
            <Field label="Trạng thái *">
              <div className="flex h-12 items-center gap-8 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium">
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" checked={status === 'active'} onChange={() => setStatus('active')} className="text-brand" />
                  Đang hoạt động
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="status" checked={status === 'hidden'} onChange={() => setStatus('hidden')} className="text-brand" />
                  Ẩn / Tạm ngưng
                </label>
              </div>
            </Field>
          </div>
          <Field label="Mô tả chuyên khoa">
            <textarea className="form-textarea" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nhập thông tin giới thiệu, chức năng nhiệm vụ của chuyên khoa này..." />
          </Field>
          <Field label="Hình ảnh đại diện / Icon">
            <UploadArea label="Kéo thả hình ảnh vào đây, hoặc Chọn tệp" icon="upload" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-4 py-3">
          <button type="button" onClick={onCancel} className="ghost-action">Hủy</button>
          <button type="submit" className="secondary-action">{specialty ? 'Lưu thay đổi' : 'Thêm chuyên khoa'}</button>
        </div>
      </section>
      {pendingPayload ? (
        <ConfirmDialog
          title={specialty ? 'Lưu thay đổi chuyên khoa?' : 'Thêm chuyên khoa?'}
          message={specialty ? 'Các thông tin chuyên khoa sẽ được cập nhật.' : 'Chuyên khoa mới sẽ được thêm vào danh sách.'}
          confirmText={specialty ? 'Lưu thay đổi' : 'Thêm'}
          onCancel={() => setPendingPayload(null)}
          onConfirm={() => {
            onSave?.(pendingPayload);
            setPendingPayload(null);
            if (!onSave) {
              onCancel();
            }
          }}
        />
      ) : null}
    </form>
  );
}

function ServiceList({ services, onAdd, onEdit, onDelete }: { services: Service[]; onAdd: () => void; onEdit: (service: Service) => void; onDelete: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const visibleServices = services.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) || item.specialty.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="panel p-0">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox placeholder="Tìm kiếm dịch vụ..." value={query} onChange={setQuery} />
        <button type="button" onClick={onAdd} className="secondary-action">
          <Plus size={16} />
          Thêm mới
        </button>
      </div>
      <ResponsiveTable
        columns={['Tên Dịch Vụ', 'Thuộc Chuyên Khoa', 'Thời gian TH', 'Giá niêm yết', 'Hành động']}
        rows={visibleServices.map((service) => [
          <span>
            <b>{service.name}</b>
            <small className="block text-slate-400">{service.description}</small>
          </span>,
          service.specialty,
          service.duration,
          <b className="text-emerald-600">{service.price} VNĐ</b>,
          <span className="flex gap-3 text-slate-400">
            <button type="button" onClick={() => onEdit(service)} className="text-emerald-500" aria-label={`Sửa ${service.name}`}>
              <Pencil size={18} />
            </button>
            <button type="button" onClick={() => onDelete(service.id)} className="text-rose-500" aria-label={`Xóa ${service.name}`}>
              <Trash2 size={18} />
            </button>
          </span>,
        ])}
      />
    </section>
  );
}

function AddServiceForm({
  code,
  service,
  specialties,
  onCancel,
  onSave,
}: {
  code: string;
  service: Service | null;
  specialties: Specialty[];
  onCancel: () => void;
  onSave: (payload: Omit<Service, 'id'>) => void;
}) {
  const [name, setName] = useState(service?.name ?? '');
  const [specialty, setSpecialty] = useState(service?.specialty ?? specialties[0]?.name ?? '');
  const [duration, setDuration] = useState(service?.duration ?? '15 - 20 phút');
  const [price, setPrice] = useState(service?.price ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [pendingPayload, setPendingPayload] = useState<Omit<Service, 'id'> | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const specialtyNames = specialties.map((item) => item.name);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const newErrors: { name?: string; price?: string } = {};
    if (!name.trim()) newErrors.name = 'Tên dịch vụ không được để trống';
    const priceClean = price.replace(/\./g, '').replace(/,/g, '');
    const priceNum = Number(priceClean);
    if (!price.trim()) {
      newErrors.price = 'Giá dịch vụ không được để trống';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Giá dịch vụ phải là số và lớn hơn 0';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setPendingPayload({
      name: name.trim(),
      specialty: specialty || specialtyNames[0] || 'Chưa phân khoa',
      duration,
      price: price.trim(),
      description: description.trim() || 'Chưa có mô tả',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-sm font-semibold text-slate-500">
        Quản lý phòng khám / Dịch vụ khám / <span className="text-brand">{service ? 'Chỉnh sửa' : 'Thêm mới'}</span>
      </p>
      <h1 className="mt-2 border-l-4 border-brand pl-3 text-xl font-bold text-slate-800">{service ? 'Chỉnh sửa Dịch vụ' : 'Thêm mới Dịch vụ'}</h1>
      <section className="panel mt-4 p-0">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="panel-title">Thông tin dịch vụ</h2>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <Field label="Mã dịch vụ *">
            <input className="form-input cursor-not-allowed bg-slate-100 text-slate-500" value={code} readOnly aria-readonly="true" />
            <p className="mt-2 text-xs font-medium text-slate-400">Mã dịch vụ được tạo tự động bởi hệ thống.</p>
          </Field>
          <Field label="Tên dịch vụ *">
            <input className={`form-input ${errors.name ? 'border-red-400' : ''}`} value={name} onChange={(event) => { setName(event.target.value); if (errors.name) setErrors(e => ({ ...e, name: undefined })); }} placeholder="Nhập tên dịch vụ" />
            {errors.name ? <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p> : null}
          </Field>
          <Field label="Thuộc chuyên khoa">
            <SelectMenu value={specialty} options={specialtyNames} onChange={setSpecialty} />
          </Field>
          <Field label="Thời gian thực hiện">
            <SelectMenu value={duration} options={serviceDurations} onChange={setDuration} />
          </Field>
          <Field label="Giá niêm yết *">
            <input className={`form-input ${errors.price ? 'border-red-400' : ''}`} value={price} onChange={(event) => { setPrice(event.target.value); if (errors.price) setErrors(e => ({ ...e, price: undefined })); }} placeholder="VD: 200.000" />
            {errors.price ? <p className="mt-1 text-xs font-semibold text-red-500">{errors.price}</p> : null}
          </Field>
          <Field label="Mô tả ngắn">
            <input className="form-input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nhập mô tả hiển thị dưới tên dịch vụ" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-4 py-3">
          <button type="button" onClick={onCancel} className="ghost-action">Hủy</button>
          <button type="submit" className="secondary-action">{service ? 'Lưu thay đổi' : 'Thêm dịch vụ'}</button>
        </div>
      </section>
      {pendingPayload ? (
        <ConfirmDialog
          title={service ? 'Lưu thay đổi dịch vụ?' : 'Thêm dịch vụ?'}
          message={service ? 'Các thông tin dịch vụ sẽ được cập nhật.' : 'Dịch vụ mới sẽ được thêm vào danh sách.'}
          confirmText={service ? 'Lưu thay đổi' : 'Thêm'}
          onCancel={() => setPendingPayload(null)}
          onConfirm={() => {
            onSave(pendingPayload);
            setPendingPayload(null);
          }}
        />
      ) : null}
    </form>
  );
}

function ReviewList({ reviews, specialties, onChange, onNotify }: { reviews: Review[]; specialties: Specialty[]; onChange: (reviews: Review[]) => void; onNotify?: (message: string) => void }) {
  const [stars, setStars] = useState('Tất cả số sao');
  const [specialty, setSpecialty] = useState('Tất cả chuyên khoa');
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const specialtyOptions = ['Tất cả chuyên khoa', ...specialties.map((item) => item.name)];
  const starOptions = ['Tất cả số sao', '5 sao', '4 sao', '3 sao', '2 sao', '1 sao'];
  const filteredReviews = reviews.filter((review) => {
    const starMatch = stars === 'Tất cả số sao' || review.stars === Number(stars.charAt(0));
    const specialtyMatch = specialty === 'Tất cả chuyên khoa' || review.specialty === specialty;
    return starMatch && specialtyMatch;
  });

  const updateReview = (id: string, updater: (review: Review) => Review) => {
    onChange(reviews.map((review) => (review.id === id ? updater(review) : review)));
  };

  return (
    <section className="panel p-0">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row">
        <SelectMenu buttonClassName="filter-button min-w-48 justify-between" value={stars} options={starOptions} onChange={setStars} />
        <SelectMenu buttonClassName="filter-button min-w-52 justify-between" value={specialty} options={specialtyOptions} onChange={setSpecialty} />
      </div>
      <ResponsiveTable
        columns={['Ngày / Bệnh nhân', 'Dịch vụ / Bác sĩ', 'Đánh giá & Phản hồi', 'Hành động']}
        rows={filteredReviews.map((review) => [
          <span>
            {review.date}
            <b className="block text-slate-700">{review.patient}</b>
          </span>,
          <span>
            {review.service}
            <small className="block text-slate-400">{review.doctor}</small>
          </span>,
          <span>
            <ReviewText text={review.text} />
            {review.reply ? <small className="mt-2 block rounded-md bg-sky-50 px-3 py-2 text-brand">Phản hồi: {review.reply}</small> : null}
            {review.flagged ? <small className="mt-2 block font-bold text-rose-500">Đã gắn cờ cần xử lý</small> : null}
          </span>,
          <span className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-brand"
              onClick={() => {
                setReplyingReview(review);
                setReplyText(review.reply ?? '');
              }}
            >
              <Reply size={16} /> Phản hồi
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-rose-500"
              onClick={() => {
                setConfirm({
                  title: review.flagged ? 'Bỏ cờ đánh giá?' : 'Gắn cờ đánh giá?',
                  message: `Bạn có chắc muốn ${review.flagged ? 'bỏ cờ' : 'gắn cờ'} đánh giá của ${review.patient}?`,
                  confirmText: review.flagged ? 'Bỏ cờ' : 'Gắn cờ',
                  tone: review.flagged ? 'primary' : 'danger',
                  onConfirm: () => {
                    updateReview(review.id, (item) => ({ ...item, flagged: !item.flagged }));
                    onNotify?.(review.flagged ? 'Đã bỏ cờ đánh giá' : 'Đã gắn cờ đánh giá');
                  },
                });
              }}
            >
              <Flag size={16} /> {review.flagged ? 'Bỏ cờ' : 'Gắn cờ'}
            </button>
          </span>,
        ])}
      />

      {replyingReview ? (
        <Modal title={`Phản hồi ${replyingReview.patient}`} onClose={() => setReplyingReview(null)}>
          <Field label="Nội dung phản hồi">
            <textarea className="form-textarea" value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Nhập phản hồi gửi bệnh nhân..." />
          </Field>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setReplyingReview(null)} className="ghost-action">Hủy</button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                const currentReview = replyingReview;
                setConfirm({
                  title: 'Lưu phản hồi đánh giá?',
                  message: `Phản hồi cho bệnh nhân ${currentReview.patient} sẽ được lưu lại.`,
                  confirmText: 'Lưu phản hồi',
                  onConfirm: () => {
                    updateReview(currentReview.id, (review) => ({ ...review, reply: replyText.trim() }));
                    setReplyingReview(null);
                    onNotify?.('Đã lưu phản hồi đánh giá');
                  },
                });
              }}
            >
              Lưu phản hồi
            </button>
          </div>
        </Modal>
      ) : null}
      {confirm ? <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} /> : null}
    </section>
  );
}

function SelectMenu({
  value,
  options,
  onChange,
  renderValue,
  buttonClassName = 'form-input flex items-center justify-between text-left',
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  renderValue?: (value: string) => ReactNode;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const safeOptions = useMemo(() => (options.length ? options : ['Chưa có dữ liệu']), [options]);

  return (
    <div className="relative">
      <button type="button" className={buttonClassName} onClick={() => setOpen((current) => !current)}>
        <span>{renderValue ? renderValue(value || safeOptions[0]) : value || safeOptions[0]}</span>
        <ChevronDown size={16} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {safeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`block w-full px-4 py-2 text-left text-sm font-semibold transition hover:bg-sky-50 hover:text-brand ${option === value ? 'bg-sky-50 text-brand' : 'text-slate-600'}`}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TableActions({ hidden, onEdit, onToggle, onDelete }: { hidden: boolean; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <span className="flex items-center gap-4">
      <button type="button" onClick={onEdit} className="text-emerald-500" aria-label="Sửa">
        <Pencil size={18} />
      </button>
      <button type="button" onClick={onToggle} className={hidden ? 'text-slate-500' : 'text-brand'} aria-label={hidden ? 'Hiện' : 'Ẩn'}>
        {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
      <button type="button" onClick={onDelete} className="text-rose-500" aria-label="Xóa">
        <Trash2 size={18} />
      </button>
    </span>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="panel-title">{title}</h2>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
