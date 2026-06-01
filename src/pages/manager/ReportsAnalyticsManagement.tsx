import { BarChart3, CheckCircle2, ChevronDown, Download, FileSpreadsheet, FileText, Mail, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LegendPayload } from 'recharts';
import ConfirmDialog from './components/ConfirmDialog';
import Field from './components/Field';

type ReportTab = 'overview' | 'triage' | 'export';

const tabs: Array<{ id: ReportTab; label: string }> = [
  { id: 'overview', label: 'Tổng quan & Doanh thu' },
  { id: 'triage', label: 'Tỉ lệ Hủy & Chatbot' },
  { id: 'export', label: 'Xuất Báo cáo' },
];

const specialtyRows = [
  { name: 'Nội TH', visits: 420, revenue: 300000000 },
  { name: 'Tai Mũi Họng', visits: 300, revenue: 150000000 },
  { name: 'Nhi Khoa', visits: 185, revenue: 120000000 },
  { name: 'Da Liễu', visits: 135, revenue: 90000000 },
];

const periodMultipliers: Record<string, number> = {
  'Tháng này': 1,
  'Tuần này': 0.28,
  'Quý II/2026': 2.7,
  'Năm 2026': 8.4,
};

const specialtyOptions = ['Tất cả chuyên khoa', 'Nội TH', 'Tai Mũi Họng', 'Nhi Khoa', 'Da Liễu'];

const cancelSpecialties = [
  { name: 'Răng Hàm Mặt', rate: '15%', tone: 'text-rose-600 bg-rose-50 border-rose-100' },
  { name: 'Da Liễu', rate: '10%', tone: 'text-slate-600 bg-slate-50 border-slate-100' },
  { name: 'Tai Mũi Họng', rate: '8%', tone: 'text-slate-600 bg-slate-50 border-slate-100' },
];

export default function ReportsAnalyticsManagement({ onNotify }: { onNotify?: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">Báo cáo & Thống kê</h1>
      <ReportTabs activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-5">
        {activeTab === 'overview' ? <OverviewTab /> : null}
        {activeTab === 'triage' ? <TriageTab /> : null}
        {activeTab === 'export' ? <ExportTab onNotify={onNotify} /> : null}
      </div>
    </div>
  );
}

function ReportTabs({ activeTab, onChange }: { activeTab: ReportTab; onChange: (tab: ReportTab) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex min-w-[640px]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex h-14 min-w-56 items-center justify-center px-5 text-sm font-extrabold transition ${
              activeTab === tab.id ? 'text-brand' : 'text-slate-500 hover:text-brand'
            }`}
          >
            {tab.label}
            {activeTab === tab.id ? <span className="absolute bottom-0 left-0 h-1 w-full bg-brand" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewTab() {
  const [period, setPeriod] = useState('Tháng này');
  const [specialty, setSpecialty] = useState('Tất cả chuyên khoa');
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const multiplier = periodMultipliers[period] ?? 1;
  const filteredRows = specialtyRows
    .filter((row) => specialty === 'Tất cả chuyên khoa' || row.name === specialty)
    .map((row) => ({
      ...row,
      visits: Math.round(row.visits * multiplier),
      revenue: Math.round(row.revenue * multiplier),
    }));
  const totalVisits = filteredRows.reduce((sum, row) => sum + row.visits, 0);
  const totalRevenue = filteredRows.reduce((sum, row) => sum + row.revenue, 0);
  const averageRevenue = totalVisits ? Math.round(totalRevenue / totalVisits) : 0;
  const trendText = period === 'Tuần này' ? '+8%' : period === 'Quý II/2026' ? '+18%' : period === 'Năm 2026' ? '+24%' : '+15%';

  const handleLegendClick = (payload: LegendPayload) => {
    if (!payload.dataKey) {
      return;
    }

    const key = String(payload.dataKey);
    setHiddenSeries((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div className="w-full lg:max-w-72">
          <SelectMenu value={period} options={Object.keys(periodMultipliers)} onChange={setPeriod} />
        </div>
        <div className="w-full lg:max-w-72">
          <SelectMenu value={specialty} options={specialtyOptions} onChange={setSpecialty} />
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">
          Đang xem: <span className="text-brand">{period}</span> / <span className="text-slate-700">{specialty}</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Tổng lượt khám (Kỳ này)" value={totalVisits.toLocaleString('vi-VN')} trend={trendText} trendTone="up" helper="so với kỳ trước" />
        <MetricCard label="Tổng Doanh thu (VNĐ)" value={totalRevenue.toLocaleString('vi-VN')} trend="+20%" trendTone="up" helper="so với kỳ trước" />
        <MetricCard label="Doanh thu TB / Lượt khám" value={averageRevenue.toLocaleString('vi-VN')} helper="Mức chi tiêu trung bình ổn định" />
      </div>
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="panel-title">Lượt khám & Doanh thu theo Chuyên khoa</h2>
            <p className="panel-subtitle">So sánh số lượt khám và doanh thu quy đổi theo từng chuyên khoa.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredRows} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={78}
              tickFormatter={(value) => `${Number(value) / 1000000}tr`}
            />
            <Tooltip content={<RevenueChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              onClick={handleLegendClick}
            />
            <Bar yAxisId="left" dataKey="visits" name="Lượt khám" fill="#3b82f6" radius={[4, 4, 0, 0]} hide={hiddenSeries.visits} isAnimationActive animationDuration={900} />
            <Bar yAxisId="right" dataKey="revenue" name="Doanh thu" fill="#bfdbfe" radius={[4, 4, 0, 0]} hide={hiddenSeries.revenue} isAnimationActive animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function TriageTab() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="panel-title">Tỉ lệ Hủy lịch</h2>
          <p className="panel-subtitle">Theo dõi các chuyên khoa có nguy cơ hủy lịch cao.</p>
        </div>
        <div className="space-y-5 p-6">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-extrabold text-rose-700">Tỉ lệ hủy lịch</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-extrabold text-rose-600">8.5%</span>
              <span className="mb-1 inline-flex items-center gap-1 text-sm font-bold text-slate-500">
                <TrendingDown size={15} /> Giảm 3% so với tháng trước
              </span>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-extrabold text-slate-700">Chuyên khoa có tỉ lệ hủy cao nhất</h3>
            <div className="space-y-3">
              {cancelSpecialties.map((item, index) => (
                <div key={item.name} className={`rounded-lg border px-4 py-3 text-sm font-extrabold ${item.tone}`}>
                  {index + 1}. {item.name} ({item.rate})
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="panel-title">Hiệu suất Triage của Chatbot AI</h2>
          <p className="panel-subtitle">Đánh giá khả năng tự xử lý và chuyển đúng chuyên khoa.</p>
        </div>
        <div className="space-y-5 p-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-extrabold text-blue-700">Tỉ lệ Tự xử lý thành công</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-extrabold text-blue-600">65%</span>
              <span className="mb-1 text-sm font-bold text-slate-500">35% ca phức tạp được chuyển cho Bác sĩ</span>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-extrabold text-emerald-700">Tỉ lệ đặt lịch thành công sau khi Chat</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">40%</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-extrabold text-slate-700">Top nhóm bệnh được hỏi nhiều nhất</h3>
            <div className="space-y-3">
              {['Triệu chứng Hô hấp (Ho, Sốt, Sổ mũi)', 'Tiêu hóa (Đau dạ dày, Trào ngược)', 'Tai Mũi Họng (Đau họng, ù tai)'].map((item, index) => (
                <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                  {index + 1}. {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type ChartTooltipPayload = {
  dataKey?: string | number;
  value?: number;
};

function RevenueChartTooltip({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) {
    return null;
  }

  const visits = payload.find((item) => item.dataKey === 'visits')?.value;
  const revenue = payload.find((item) => item.dataKey === 'revenue')?.value;

  return (
    <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-extrabold text-slate-800">{label}</p>
      {typeof visits === 'number' ? <p className="font-semibold text-slate-600">Lượt khám: <span className="font-extrabold text-blue-600">{visits.toLocaleString('vi-VN')}</span></p> : null}
      {typeof revenue === 'number' ? <p className="mt-1 font-semibold text-slate-600">Doanh thu: <span className="font-extrabold text-blue-600">{revenue.toLocaleString('vi-VN')}đ</span></p> : null}
    </div>
  );
}

function ExportTab({ onNotify }: { onNotify?: (message: string) => void }) {
  const [range, setRange] = useState('Từ ngày 01/05/2026 - Đến ngày 31/05/2026');
  const [includeRevenue, setIncludeRevenue] = useState(true);
  const [includeChatbot, setIncludeChatbot] = useState(true);
  const [autoEmail, setAutoEmail] = useState(true);
  const [email, setEmail] = useState('admin.fakeeh@gmail.com');
  const [schedule, setSchedule] = useState('08:00 AM - Thứ 2 hằng tuần');
  const [confirmExport, setConfirmExport] = useState<'PDF' | 'Excel' | null>(null);
  const [confirmSaveEmail, setConfirmSaveEmail] = useState(false);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="panel-title">Tùy chọn Xuất dữ liệu thủ công</h2>
          <p className="panel-subtitle">Chọn kỳ báo cáo và các nhóm chỉ số cần xuất.</p>
        </div>
        <div className="space-y-5 p-6">
          <Field label="Chọn kỳ báo cáo">
            <SelectMenu value={range} options={['Từ ngày 01/05/2026 - Đến ngày 31/05/2026', 'Tuần này', 'Quý II/2026']} onChange={setRange} />
          </Field>
          <div>
            <p className="mb-3 text-sm font-extrabold text-slate-700">Bao gồm các dữ liệu</p>
            <div className="space-y-3">
              <CheckLine checked={includeRevenue} onChange={() => setIncludeRevenue((value) => !value)} label="Doanh thu & Lượt khám" />
              <CheckLine checked={includeChatbot} onChange={() => setIncludeChatbot((value) => !value)} label="Báo cáo hiệu suất Chatbot" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row">
          <button type="button" onClick={() => setConfirmExport('PDF')} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-rose-500 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-600">
            <FileText size={17} />
            Xuất PDF
          </button>
          <button type="button" onClick={() => setConfirmExport('Excel')} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-600">
            <FileSpreadsheet size={17} />
            Xuất Excel
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="panel-title">Báo cáo định kỳ (Email)</h2>
          <p className="panel-subtitle">Tự động gửi báo cáo cho quản trị viên.</p>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <Mail size={16} className="text-brand" />
              Gửi tự động hằng tuần
            </span>
            <Toggle checked={autoEmail} onChange={() => setAutoEmail((value) => !value)} />
          </div>
          <Field label="Email người nhận">
            <input className="form-input" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Thời gian gửi (Cron)">
            <SelectMenu value={schedule} options={['08:00 AM - Thứ 2 hằng tuần', '05:00 PM - Thứ 6 hằng tuần', '08:00 AM - Ngày 1 hằng tháng']} onChange={setSchedule} />
          </Field>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-6 py-5">
          <button type="button" onClick={() => setConfirmSaveEmail(true)} className="secondary-action">
            <Save size={16} />
            Lưu lịch gửi
          </button>
        </div>
      </section>

      {confirmExport ? (
        <ConfirmDialog
          title={`Xuất báo cáo ${confirmExport}?`}
          message={`Hệ thống sẽ tạo file ${confirmExport} cho kỳ báo cáo: ${range}.`}
          confirmText={`Xuất ${confirmExport}`}
          onCancel={() => setConfirmExport(null)}
          onConfirm={() => {
            setConfirmExport(null);
            onNotify?.(`Đã xuất báo cáo ${confirmExport}`);
          }}
        />
      ) : null}
      {confirmSaveEmail ? (
        <ConfirmDialog
          title="Lưu lịch gửi báo cáo?"
          message={`Báo cáo định kỳ sẽ được gửi tới ${email} theo lịch ${schedule}.`}
          confirmText="Lưu"
          onCancel={() => setConfirmSaveEmail(false)}
          onConfirm={() => {
            setConfirmSaveEmail(false);
            onNotify?.('Đã lưu lịch gửi báo cáo');
          }}
        />
      ) : null}
    </div>
  );
}

function MetricCard({ label, value, trend, trendTone, helper }: { label: string; value: string; trend?: string; trendTone?: 'up' | 'down'; helper: string }) {
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-800">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-400">
        {trend ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${trendTone === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {trendTone === 'down' ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {trend}
          </span>
        ) : null}
        <span>{helper}</span>
      </div>
    </article>
  );
}

function SelectMenu({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="form-input flex items-center justify-between text-left" onClick={() => setOpen((current) => !current)}>
        <span className="truncate">{value}</span>
        <ChevronDown size={16} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
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

function CheckLine({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-3 text-sm font-bold text-slate-600">
      <span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'}`}>
        {checked ? <CheckCircle2 size={14} /> : null}
      </span>
      {label}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand' : 'bg-slate-200'}`} aria-pressed={checked}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}
