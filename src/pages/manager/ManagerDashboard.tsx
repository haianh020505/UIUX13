import { useState } from 'react';
import { ChevronDown, CircleDollarSign, CircleUserRound, Download, Filter, Star, UserCheck, UserPlus, UsersRound, XCircle } from 'lucide-react';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { shiftFilters, shiftRows } from './data';
import type { ShiftFilterId } from './types';
import MetricCard from './components/MetricCard';
import PatientFlowChart from './components/PatientFlowChart';
import StaffStatus from './components/StaffStatus';
import StatusBadge from './components/StatusBadge';

export default function ManagerDashboard() {
  const [activeFilters, setActiveFilters] = useState<ShiftFilterId[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredShiftRows = activeFilters.length
    ? shiftRows.filter((row) => activeFilters.every((filterId) => shiftFilters.find((filter) => filter.id === filterId)?.predicate(row)))
    : shiftRows;

  const toggleFilter = (filterId: ShiftFilterId) => {
    setActiveFilters((current) =>
      current.includes(filterId) ? current.filter((item) => item !== filterId) : [...current, filterId],
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng quan hoạt động phòng khám hôm nay</p>
        </div>
        <button type="button" className="secondary-action">
          <Download size={16} />
          Tải Báo Cáo
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CircleUserRound} tint="bg-sky-100 text-sky-600" accent="from-sky-500/14 to-cyan-400/5" label="Lượt bệnh nhân" hint="Tổng số đến khám" value="142" trend="+12%" progress={72} sparkline={[18, 24, 22, 31, 28, 36, 34]} />
        <MetricCard icon={CircleDollarSign} tint="bg-emerald-100 text-emerald-600" accent="from-emerald-500/14 to-teal-400/5" label="Doanh thu ước tính" hint="Hôm nay" value="48,5M" suffix="VNĐ" trend="+8%" progress={64} sparkline={[22, 20, 26, 25, 33, 31, 38]} />
        <MetricCard icon={UserPlus} tint="bg-amber-100 text-amber-600" accent="from-amber-400/18 to-orange-300/5" label="Bệnh nhân mới" hint="Lần đầu đến khám" value="34" trend="+5 ca" progress={48} sparkline={[12, 16, 14, 18, 20, 19, 24]} />
        <MetricCard icon={Star} tint="bg-violet-100 text-violet-600" accent="from-violet-500/14 to-fuchsia-400/5" label="Đánh giá CSAT" hint="Mức độ hài lòng" value="4.8" suffix="/5.0" trend="+0.2" progress={96} sparkline={[34, 35, 36, 35, 37, 38, 39]} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="panel">
          <h2 className="panel-title">Lưu lượng bệnh nhân theo khung giờ</h2>
          <p className="panel-subtitle">Giúp phân bổ nhân sự y tá, lễ tân hợp lý</p>
          <div className="mt-4 h-44">
            <PatientFlowChart />
          </div>
        </section>
        <section className="panel">
          <h2 className="panel-title">Tình hình Nhân sự</h2>
          <p className="panel-subtitle">Thống kê ca trực hôm nay</p>
          <div className="mt-4 space-y-3">
            <StaffStatus icon={UserCheck} label="Bác sĩ đang trực" value="08" tone="sky" />
            <StaffStatus icon={UsersRound} label="Điều dưỡng & Y tá" value="12" tone="emerald" />
            <StaffStatus icon={XCircle} label="Xin nghỉ / Vắng mặt" value="02" tone="rose" />
          </div>
        </section>
      </div>

      <section className="panel mt-4 overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="panel-title">Danh sách phân công Ca trực (Hôm nay)</h2>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {filteredShiftRows.length} / {shiftRows.length} nhân sự phù hợp
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filterId) => {
              const filter = shiftFilters.find((item) => item.id === filterId);
              if (!filter) return null;

              return (
                <button key={filterId} type="button" onClick={() => toggleFilter(filterId)} className="filter-chip">
                  {filter.label}
                  <XCircle size={14} />
                </button>
              );
            })}
            <div className="relative">
              <button type="button" className={`filter-button ${activeFilters.length ? 'border-brand text-brand' : ''}`} onClick={() => setFilterOpen((current) => !current)}>
                <Filter size={15} />
                Bộ lọc
                <ChevronDown size={15} className={filterOpen ? 'rotate-180 transition' : 'transition'} />
              </button>
              {filterOpen ? (
                <div className="absolute right-0 top-11 z-20 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-xs font-extrabold uppercase text-slate-400">Chọn tag lọc</span>
                    <button type="button" onClick={() => setActiveFilters([])} className="text-xs font-extrabold text-brand">
                      Xóa lọc
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {shiftFilters.map((filter) => {
                      const selected = activeFilters.includes(filter.id);
                      return (
                        <button key={filter.id} type="button" onClick={() => toggleFilter(filter.id)} className={`rounded-md border px-3 py-2 text-left text-sm font-bold transition ${selected ? 'border-brand bg-sky-50 text-brand' : 'border-slate-200 bg-white text-slate-600 hover:border-brand/50 hover:bg-sky-50'}`}>
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <ResponsiveTable
          columns={['Bác sĩ / Nhân sự', 'Chuyên khoa', 'Ca làm việc', 'Phòng khám', 'Trạng thái']}
          rows={filteredShiftRows.map((row, index) => [
            <span className="flex items-center gap-3 font-bold text-slate-700">
              <span className={`h-5 w-5 rounded-full ${row.role === 'nurse' ? 'bg-emerald-100' : index === 1 ? 'bg-amber-100' : row.status === 'Chưa đến ca' ? 'bg-rose-100' : 'bg-sky-100'}`} />
              {row.name}
            </span>,
            row.specialty,
            <span className="font-bold text-slate-700">{row.shift}</span>,
            row.room,
            <StatusBadge status={row.status} />,
          ])}
        />
        {!filteredShiftRows.length ? (
          <div className="px-6 py-10 text-center text-sm font-semibold text-slate-400">Không có ca trực phù hợp với bộ lọc đã chọn.</div>
        ) : null}
      </section>
    </div>
  );
}
