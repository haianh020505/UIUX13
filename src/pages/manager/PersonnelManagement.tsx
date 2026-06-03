import { useState, FormEvent, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockStaff } from '../../data/clinicMock';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';

type StaffRole = 'Bác sĩ' | 'Điều dưỡng' | 'Kỹ thuật viên' | 'Lễ tân';

type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  specialty: string;
  phone: string;
  email: string;
};

const roles: StaffRole[] = ['Bác sĩ', 'Điều dưỡng', 'Kỹ thuật viên', 'Lễ tân'];
const specialties = ['Nội Tổng Hợp', 'Tai Mũi Họng', 'Nhi Khoa', 'Lễ tân & Điều phối', 'Không áp dụng'];

const initialStaff: Staff[] = [
  { id: 'ST-001', name: 'BS. Nguyễn Duy Cương', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0912.345.678', email: 'cuongnd@fakeeh.care' },
  { id: 'ST-045', name: 'Điều dưỡng Nguyễn Nhật Linh', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0988.123.456', email: 'linhnn@fakeeh.care' },
  { id: 'ST-052', name: 'BS. Trần Văn C', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0904.555.666', email: 'tranc@fakeeh.care' },
  { id: 'ST-060', name: 'BS. Lê Nguyễn Công Minh', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0908.888.222', email: 'minhlnc@fakeeh.care' },
  { id: 'ST-077', name: 'KTV. Phạm Anh Khoa', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0933.123.222', email: 'khoapa@fakeeh.care' },
  { id: 'ST-083', name: 'BS. Hoàng Minh Khang', role: 'Bác sĩ', specialty: 'Tai Mũi Họng', phone: '0977.654.321', email: 'khanghm@fakeeh.care' },
  { id: 'ST-091', name: 'ĐD. Mai Thu Hằng', role: 'Điều dưỡng', specialty: 'Nhi Khoa', phone: '0966.777.888', email: 'hangmt@fakeeh.care' },
  { id: 'ST-104', name: 'LT. Phạm Quỳnh Anh', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0945.888.999', email: 'anhpq@fakeeh.care' },
  { id: 'ST-118', name: 'BS. Vũ Hải Nam', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0932.222.111', email: 'namvh@fakeeh.care' },
  { id: 'ST-126', name: 'KTV. Nguyễn Đức Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0921.555.777', email: 'huynd@fakeeh.care' },
  { id: 'ST-139', name: 'ĐD. Trần Bảo Ngọc', role: 'Điều dưỡng', specialty: 'Tai Mũi Họng', phone: '0919.333.444', email: 'ngoctb@fakeeh.care' },
  { id: 'ST-150', name: 'BS. Đặng Minh Quân', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0981.222.333', email: 'quandm@fakeeh.care' },
  { id: 'ST-163', name: 'LT. Nguyễn Hoài An', role: 'Lễ tân', specialty: 'Lễ tân & Điều phối', phone: '0909.321.456', email: 'annh@fakeeh.care' },
  { id: 'ST-174', name: 'ĐD. Lê Phương Mai', role: 'Điều dưỡng', specialty: 'Nội Tổng Hợp', phone: '0938.654.777', email: 'mailp@fakeeh.care' },
  { id: 'ST-185', name: 'BS. Phạm Minh D', role: 'Bác sĩ', specialty: 'Nội Tổng Hợp', phone: '0962.444.555', email: 'minhdp@fakeeh.care' },
  { id: 'ST-196', name: 'BS. Nguyễn Thu Hương', role: 'Bác sĩ', specialty: 'Nhi Khoa', phone: '0971.222.888', email: 'huongnt@fakeeh.care' },
  { id: 'ST-207', name: 'KTV. Trương Gia Huy', role: 'Kỹ thuật viên', specialty: 'Không áp dụng', phone: '0915.333.777', email: 'huytg@fakeeh.care' },
  { id: 'ST-218', name: 'ĐD. Hồ Minh Tâm', role: 'Điều dưỡng', specialty: 'Lễ tân & Điều phối', phone: '0906.888.111', email: 'tamhm@fakeeh.care' },
];

const standardizedStaff: Staff[] = mockStaff.map((item) => ({
  id: item.id,
  name: item.name,
  role: item.role,
  specialty: item.specialty,
  phone: item.phone,
  email: item.email,
}));

function nextStaffCode(staffList: Staff[]) {
  const max = staffList.reduce((value, item) => Math.max(value, Number(item.id.replace('ST-', '')) || 0), 0);
  return `ST-${String(max + 1).padStart(3, '0')}`;
}

export default function PersonnelManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const [staff, setStaff] = useState<Staff[]>(standardizedStaff);
  const [query, setQuery] = useState('');
  const [editingStaff, setEditingStaff] = useState<Staff | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Search filter
  const filteredStaff = staff.filter((item) => {
    const keyword = query.trim().toLowerCase();
    return !keyword || [item.id, item.name, item.phone, item.specialty, item.role].some((val) => val.toLowerCase().includes(keyword));
  });

  const totalStaffCount = filteredStaff.length;

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const pagedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);
  const pageStart = filteredStaff.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(page * pageSize, filteredStaff.length);

  const handleSave = (payload: Staff) => {
    if (editingStaff === 'new') {
      setStaff((items) => [...items, payload]);
      onNotify?.('Đã thêm nhân sự mới thành công');
    } else {
      setStaff((items) => items.map((item) => (item.id === payload.id ? payload : item)));
      onNotify?.('Đã lưu thay đổi thông tin nhân sự');
    }
    setEditingStaff(null);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Quản lý Hồ sơ Nhân sự</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý thông tin hồ sơ gốc của đội ngũ y bác sĩ và nhân viên phòng khám</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingStaff('new')}
          className="secondary-action"
        >
          <Plus size={16} />
          Thêm nhân sự mới
        </button>
      </div>

      {/* Main Container */}
      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Search Toolbar */}
        <div className="border-b border-slate-100 p-5">
          <label className="relative block max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="form-input pl-10"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm nhân sự theo tên, mã hoặc số điện thoại..."
            />
          </label>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-extrabold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã NS</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Chức vụ</th>
                <th className="px-4 py-3">Chuyên khoa</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center font-medium text-slate-400">
                    Không tìm thấy nhân sự nào khớp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                pagedStaff.map((item) => (
                  <tr key={item.id} className="bg-white transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-600">{item.id}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.role === 'Bác sĩ' ? 'bg-blue-50 text-blue-700' :
                        item.role === 'Điều dưỡng' ? 'bg-emerald-50 text-emerald-700' :
                        item.role === 'Kỹ thuật viên' ? 'bg-purple-50 text-purple-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{item.specialty}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{item.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingStaff(item)}
                          className="text-emerald-500 transition hover:text-emerald-600"
                          aria-label={`Sửa ${item.name}`}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="text-rose-500 transition hover:text-rose-600"
                          aria-label={`Xóa ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Hiển thị {pageStart}-{pageEnd} trên tổng số {totalStaffCount}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-bold transition ${
                  page === pageNum ? 'bg-brand text-white shadow-sm' : 'text-brand hover:bg-sky-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* CRUD Form Modal */}
      {editingStaff ? (
        <PersonnelFormModal
          code={editingStaff === 'new' ? nextStaffCode(staff) : editingStaff.id}
          staff={editingStaff === 'new' ? null : editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={handleSave}
        />
      ) : null}

      {/* Confirm Delete Dialog */}
      {deleteTarget ? (
        <ConfirmDialog
          title="Xóa hồ sơ nhân sự?"
          message={`${deleteTarget.name} sẽ bị xóa hoàn toàn khỏi danh sách nhân sự.`}
          confirmText="Xóa"
          tone="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            setStaff((items) => items.filter((item) => item.id !== deleteTarget.id));
            setDeleteTarget(null);
            onNotify?.('Đã xóa nhân sự khỏi hệ thống');
          }}
        />
      ) : null}
    </div>
  );
}

interface PersonnelFormModalProps {
  code: string;
  staff: Staff | null;
  onClose: () => void;
  onSave: (payload: Staff) => void;
}

function PersonnelFormModal({ code, staff, onClose, onSave }: PersonnelFormModalProps) {
  const [name, setName] = useState(staff?.name ?? '');
  const [role, setRole] = useState<StaffRole>(staff?.role ?? 'Bác sĩ');
  const [specialty, setSpecialty] = useState(staff?.specialty ?? specialties[0]);
  const [phone, setPhone] = useState(staff?.phone ?? '');
  const [email, setEmail] = useState(staff?.email ?? '');
  const [error, setError] = useState('');
  const isEdit = staff !== null;

  // Escape to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập Họ và Tên');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập Số điện thoại');
      return;
    }
    setError('');
    onSave({
      id: code,
      name: name.trim(),
      role,
      specialty,
      phone: phone.trim(),
      email: email.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl animate-[modalIn_0.25s_ease-out] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-800">Thông tin cá nhân & Công việc</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {error ? (
            <div className="mx-4 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">{error}</div>
          ) : null}
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <Field label="Mã nhân sự">
              <input
                type="text"
                className="form-input cursor-not-allowed bg-slate-100 text-slate-500 font-semibold"
                value={code}
                disabled
              />
            </Field>

            <Field label="Họ và Tên *">
              <input
                type="text"
                className="form-input font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: BS. Lê Nguyễn Công Minh"
                required
              />
            </Field>

            <Field label="Vai trò (Chức vụ) *">
              <select
                className="form-input font-semibold bg-white cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>

            <Field label="Chuyên khoa *">
              <select
                className="form-input font-semibold bg-white cursor-pointer"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </Field>

            <Field label="Số điện thoại *">
              <input
                type="text"
                className="form-input font-semibold"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0908.888.222"
                required
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                className="form-input font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: minhlnc@fakeeh.care"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f7fb9]"
            >
              Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
