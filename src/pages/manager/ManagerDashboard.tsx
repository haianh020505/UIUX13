import { useState } from 'react';
import { CircleDollarSign, CircleUserRound, Download, Star, UserCheck, UserPlus, UsersRound, XCircle } from 'lucide-react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { shiftRoleFilters, shiftRows } from './data';
import type { ShiftRoleFilterId, ShiftStatus } from './types';
import MetricCard from './components/MetricCard';
import PatientFlowChart from './components/PatientFlowChart';
import StaffStatus from './components/StaffStatus';
import StatusBadge from './components/StatusBadge';

const shiftStatusPriority: Record<ShiftStatus, number> = {
  'Vắng mặt': 0,
  'Đi muộn': 1,
  'Chưa đến ca': 2,
  'Đang trực': 3,
  'Nghỉ phép': 4,
};

const shiftRoleLabels: Record<ShiftRoleFilterId, string> = {
  all: 'Tất cả vai trò',
  doctor: 'Bác sĩ',
  nurse: 'Điều dưỡng',
  technician: 'Kỹ thuật viên',
  receptionist: 'Lễ tân',
};

export default function ManagerDashboard({ onOpenStaffSchedule }: { onOpenStaffSchedule: () => void }) {
  const [roleFilter, setRoleFilter] = useState<ShiftRoleFilterId>('all');

  const filteredShiftRows = shiftRows
    .filter((row) => row.status !== 'Nghỉ phép')
    .filter((row) => roleFilter === 'all' || row.role === roleFilter)
    .sort((current, next) => shiftStatusPriority[current.status] - shiftStatusPriority[next.status]);
  const dashboardShiftRows = filteredShiftRows.slice(0, 6);

  const hour = new Date().getHours();
  let timeGreeting = 'Chào buổi sáng';
  if (hour >= 12 && hour < 18) timeGreeting = 'Chào buổi chiều';
  else if (hour >= 18) timeGreeting = 'Chào buổi tối';

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <header className="saas-greeting">
          <h1 className="saas-greeting-title">{timeGreeting}, Quản lý Admin!</h1>
          <p className="saas-greeting-sub">
            Hôm nay hệ thống ghi nhận <strong>142</strong> lượt khám bệnh và <strong>34</strong> bệnh nhân mới đăng ký.
          </p>
        </header>
        <button type="button" className="secondary-action">
          <Download size={16} />
          Tải Báo Cáo
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CircleUserRound} tint="bg-sky-100 text-sky-600" accent="from-sky-500/14 to-cyan-400/5" label="Lượt bệnh nhân" hint="Tổng số đến khám" value="142" trend="+12%" progress={72} sparkline={[18, 24, 22, 31, 28, 36, 34]} />
        <MetricCard icon={CircleDollarSign} tint="bg-emerald-100 text-emerald-600" accent="from-emerald-500/14 to-teal-400/5" label="Doanh thu ước tính" hint="Hôm nay" value="48,5M" suffix="VNĐ" trend="+8%" progress={64} sparkline={[22, 20, 26, 25, 33, 31, 38]} />
        <MetricCard icon={UserPlus} tint="bg-amber-100 text-amber-600" accent="from-amber-400/18 to-orange-300/5" label="Bệnh nhân mới" hint="Lần đầu đến khám" value="34" trend="+5 ca" progress={48} sparkline={[12, 16, 14, 18, 20, 19, 24]} />
        <MetricCard icon={Star} tint="bg-violet-100 text-violet-600" accent="from-violet-500/14 to-fuchsia-400/5" label="Đánh giá CSAT" hint="Mức độ hài lòng" value="4.8" suffix="/5.0" trend="+0.2" progress={96} sparkline={[34, 35, 36, 35, 37, 38, 39]} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_320px]">
        <section className="panel">
          <h2 className="panel-title">Lưu lượng bệnh nhân theo khung giờ</h2>
          <p className="panel-subtitle">Giúp phân bổ nhân sự y tá, lễ tân hợp lý</p>
          <div className="mt-3 h-32">
            <PatientFlowChart />
          </div>
        </section>
        <section className="panel">
          <h2 className="panel-title">Tình hình Nhân sự</h2>
          <p className="panel-subtitle">Thống kê ca trực hôm nay</p>
          <div className="mt-3 space-y-2">
            <StaffStatus icon={UserCheck} label="Bác sĩ đang trực" value="08" tone="sky" />
            <StaffStatus icon={UsersRound} label="Điều dưỡng & Y tá" value="12" tone="emerald" />
            <StaffStatus icon={XCircle} label="Xin nghỉ / Vắng mặt" value="02" tone="rose" />
          </div>
        </section>
      </div>

      <section className="panel mt-3 p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="panel-title">Danh sách phân công Ca trực (Hôm nay)</h2>
          </div>
          <div className="shrink-0">
            <select
              aria-label="Lọc danh sách ca trực theo vai trò"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as ShiftRoleFilterId)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 sm:w-48"
            >
              {shiftRoleFilters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {dashboardShiftRows.length ? (
          <ResponsiveTable
            columns={['Nhân sự', 'Vai trò / chuyên khoa', 'Ca làm việc', 'Phòng', 'Trạng thái']}
            rows={dashboardShiftRows.map((row) => [
              <span className="font-bold text-slate-700">{row.name}</span>,
              <span>
                <span className="font-bold text-slate-700">{shiftRoleLabels[row.role]}</span>
                <span className="block text-xs font-medium text-slate-500">{row.specialty}</span>
              </span>,
              <span className="font-bold text-slate-700">{row.shift}</span>,
              row.room,
              <StatusBadge status={row.status} />,
            ])}
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center" role="status">
            <p className="text-sm font-bold text-slate-500">Không có ca trực phù hợp với bộ lọc đã chọn</p>
            <p className="mt-1 text-xs text-slate-400">Chọn vai trò khác hoặc mở toàn bộ lịch trực nhân sự.</p>
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className="mt-4 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-brand hover:text-brand"
            >
              Xem tất cả vai trò
            </button>
          </div>
        )}
        <div className="border-t border-slate-200 bg-gray-50">
          <button
            type="button"
            onClick={onOpenStaffSchedule}
            className="w-full cursor-pointer py-3 text-center text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            Xem toàn bộ lịch trực nhân sự →
          </button>
        </div>
      </section>
    </div>
  );
}
