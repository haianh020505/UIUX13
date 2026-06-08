import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { Appointment } from '../types';
import { getPatient, hasRecordedAllergy } from '../data';
import SharedPagination from '../../../components/common/Pagination';
import useDynamicPageSize from '../../../components/common/useDynamicPageSize';

type CalendarView = 'day' | 'week' | 'month';
type StatusFilter = 'Tất cả' | 'Đã khám' | 'Đang chờ' | 'Đang khám';
type SelectedAppointment = {
  appointment: Appointment;
  date: Date;
};

const demoDate = new Date(2026, 4, 10);
const viewOptions: Array<{ id: CalendarView; label: string }> = [
  { id: 'day', label: 'Ngày' },
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
];
const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const statusFilters: StatusFilter[] = ['Tất cả', 'Đã khám', 'Đang chờ', 'Đang khám'];
const monthAppointmentDays = [1, 4, 4, 5, 7, 7, 8, 10, 11, 12, 15, 15, 15, 18, 20, 22, 25, 28];

export default function AppointmentsView({
  appointments,
  onCall,
  onOpenExam,
  onOpenRecord,
}: {
  appointments: Appointment[];
  onCall: (appointment: Appointment) => void;
  onOpenExam: (appointment: Appointment) => void;
  onOpenRecord: (code: string) => void;
}) {
  const [calendarView, setCalendarView] = useState<CalendarView>('day');
  const [selectedDate, setSelectedDate] = useState(demoDate);
  const [pickerMonth, setPickerMonth] = useState(demoDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Tất cả');
  const [selectedAppointment, setSelectedAppointment] = useState<SelectedAppointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dayPage, setDayPage] = useState(1);
  const dayPageSize = useDynamicPageSize(8);
  const pickerRef = useRef<HTMLDivElement>(null);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const normalizedAppointments = useMemo(() => appointments.map(normalizeAppointment), [appointments]);
  const filteredAppointments = useMemo(() => filterAppointments(normalizedAppointments, statusFilter), [normalizedAppointments, statusFilter]);
  const nextAppointmentId = useMemo(
    () => filteredAppointments.find((appointment) => appointment.status === 'Đang chờ')?.id ?? null,
    [filteredAppointments],
  );
  const totalDayPages = Math.max(1, Math.ceil(filteredAppointments.length / dayPageSize));
  const pagedDayAppointments = useMemo(
    () => filteredAppointments.slice((dayPage - 1) * dayPageSize, dayPage * dayPageSize),
    [filteredAppointments, dayPage, dayPageSize],
  );

  useEffect(() => {
    if (!datePickerOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setDatePickerOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [datePickerOpen]);

  useEffect(() => {
    setSelectedAppointment(null);
    setIsDrawerOpen(false);
  }, [calendarView, selectedDate]);

  useEffect(() => {
    setDayPage(1);
  }, [statusFilter, selectedDate, calendarView]);

  useEffect(() => {
    setDayPage((current) => Math.min(current, totalDayPages));
  }, [totalDayPages]);

  const moveDate = (direction: -1 | 1) => {
    const next = new Date(selectedDate);
    if (calendarView === 'day') next.setDate(next.getDate() + direction);
    if (calendarView === 'week') next.setDate(next.getDate() + direction * 7);
    if (calendarView === 'month') next.setMonth(next.getMonth() + direction);
    setSelectedDate(next);
    setPickerMonth(next);
    setSelectedAppointment(null);
    setIsDrawerOpen(false);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setPickerMonth(date);
    setDatePickerOpen(false);
    setSelectedAppointment(null);
    setIsDrawerOpen(false);
  };

  const selectMonthDate = (date: Date) => {
    setSelectedDate(date);
    setPickerMonth(date);
    setCalendarView('day');
    setSelectedAppointment(null);
    setIsDrawerOpen(false);
  };

  const openAppointmentDrawer = (appointment: Appointment, date = selectedDate) => {
    setSelectedAppointment({ appointment: normalizeAppointment(appointment), date });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const openSelectedRecord = () => {
    if (!selectedAppointment) return;
    setIsDrawerOpen(false);
    onOpenRecord(selectedAppointment.appointment.patientCode);
  };

  const startSelectedAppointment = () => {
    if (!selectedAppointment) return;
    onCall(selectedAppointment.appointment);
    setIsDrawerOpen(false);
  };

  const enterSelectedAppointment = () => {
    if (!selectedAppointment) return;
    setIsDrawerOpen(false);
    onOpenExam(selectedAppointment.appointment);
  };

  const isSplitLayout = calendarView !== 'week' && isDrawerOpen && selectedAppointment;

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div ref={pickerRef} className="relative flex h-12 w-full max-w-sm items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3">
          <button type="button" onClick={() => moveDate(-1)} className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-semibold text-slate-500 transition hover:bg-white hover:text-brand" aria-label="Lùi lịch">
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              setPickerMonth(selectedDate);
              setDatePickerOpen((current) => !current);
            }}
            className="min-w-0 flex-1 rounded-md px-3 py-2 text-center text-sm font-extrabold text-slate-800 transition hover:bg-white hover:text-brand"
          >
            {formatToolbarTitle(selectedDate, calendarView)}
          </button>
          <button type="button" onClick={() => moveDate(1)} className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-semibold text-slate-500 transition hover:bg-white hover:text-brand" aria-label="Tiến lịch">
            <ChevronRight size={18} />
          </button>
          {datePickerOpen ? (
            <MiniDatePicker month={pickerMonth} selectedDate={selectedDate} onMonthChange={setPickerMonth} onSelectDate={selectDate} />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsDrawerOpen(false);
                  setCalendarView(option.id);
                }}
                className={`h-9 min-w-16 rounded-md px-3 text-sm font-extrabold transition ${calendarView === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-brand'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-600 outline-none transition hover:border-brand hover:text-brand focus:border-brand focus:ring-4 focus:ring-brand/10"
            aria-label="Lọc lịch khám theo trạng thái"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                Trạng thái: {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={isSplitLayout ? "mt-5 min-h-0 flex-1 flex flex-row w-full h-full overflow-hidden items-start gap-4" : "mt-5 min-h-0 flex-1 w-full h-full overflow-hidden"}>
        <div className={isSplitLayout ? "max-h-[calc(100dvh-15.5rem)] min-h-[360px] flex-1 overflow-x-auto overflow-y-scroll pr-1 custom-scrollbar [scrollbar-gutter:stable]" : "w-full h-full overflow-x-auto overflow-y-auto custom-scrollbar"}>
          {calendarView === 'day' ? (
            <div className="space-y-4">
              <DayView
                appointments={pagedDayAppointments}
                selectedDate={selectedDate}
                nextAppointmentId={nextAppointmentId}
                onCall={onCall}
                onOpenExam={onOpenExam}
                onOpenRecord={onOpenRecord}
                onSelectAppointment={openAppointmentDrawer}
              />
              {totalDayPages > 1 ? (
                <SharedPagination page={dayPage} totalPages={totalDayPages} total={filteredAppointments.length} pageSize={dayPageSize} unit="lịch khám" onChange={setDayPage} />
              ) : null}
            </div>
          ) : null}
          {calendarView === 'week' ? <WeekView appointments={filteredAppointments} weekDays={weekDays} selectedDate={selectedDate} onSelectAppointment={openAppointmentDrawer} /> : null}
          {calendarView === 'month' ? <MonthView selectedDate={selectedDate} onSelectDate={selectMonthDate} appointments={filteredAppointments} /> : null}
        </div>
        {isSplitLayout ? (
          <AppointmentDrawer
            selectedAppointment={selectedAppointment}
            onClose={closeDrawer}
            onOpenRecord={openSelectedRecord}
            onStartAppointment={startSelectedAppointment}
            onEnterAppointment={enterSelectedAppointment}
          />
        ) : null}
        {!isSplitLayout && isDrawerOpen && selectedAppointment ? (
          <AppointmentModal
            selectedAppointment={selectedAppointment}
            onClose={closeDrawer}
            onOpenRecord={openSelectedRecord}
            onStartAppointment={startSelectedAppointment}
            onEnterAppointment={enterSelectedAppointment}
          />
        ) : null}
      </div>
    </div>
  );
}

function DayView({
  appointments,
  selectedDate,
  nextAppointmentId,
  onCall,
  onOpenExam,
  onOpenRecord,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  selectedDate: Date;
  nextAppointmentId: string | null;
  onCall: (appointment: Appointment) => void;
  onOpenExam: (appointment: Appointment) => void;
  onOpenRecord: (code: string) => void;
  onSelectAppointment: (appointment: Appointment, date?: Date) => void;
}) {
  return (
    <div className="schedule-table-wrapper">
      <table className="data-table schedule-table">
        <colgroup>
          <col style={{ width: '130px' }} />
          <col style={{ width: '180px' }} />
          <col />
          <col style={{ width: '130px' }} />
          <col style={{ width: '160px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Khung giờ</th>
            <th>Bệnh nhân</th>
            <th>Tóm tắt triệu chứng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const patient = getPatient(appointment.patientCode);
            const hasAllergy = hasRecordedAllergy(patient.allergy);
            const isNext = appointment.id === nextAppointmentId;
            const isDone = appointment.status === 'Đã khám';
            const statusClass =
              appointment.status === 'Đang chờ'
                ? 'status-badge--waiting'
                : appointment.status === 'Đang khám'
                  ? 'status-badge--examining'
                  : 'status-badge--done';

            const openRecord = (event: ReactMouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onOpenRecord(patient.code);
            };

            const callPatient = (event: ReactMouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onCall(appointment);
            };

            const enterExam = (event: ReactMouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onOpenExam(appointment);
            };

            return (
              <tr
                key={appointment.id}
                className={`schedule-row ${isNext ? 'schedule-row--next' : ''} ${isDone ? 'schedule-row--done' : ''}`}
                onClick={() => onSelectAppointment(appointment, selectedDate)}
              >
                <td className="schedule-row__time">
                  <span className="time-session">{getShiftLabel(appointment.time)}</span>
                  <span className="time-range">{appointment.time}</span>
                </td>
                <td className="schedule-row__patient">
                  <span className="patient-name">{patient.name}</span>
                  <span className="patient-code">{patient.code}</span>
                  {hasAllergy ? (
                    <span className="allergy-badge">⚠ {patient.allergy}</span>
                  ) : null}
                </td>
                <td className="schedule-row__symptom" title={appointment.summary}>
                  {appointment.summary}
                </td>
                <td className="schedule-row__status">
                  <span className={`status-badge ${statusClass}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="schedule-row__actions">
                  {appointment.status === 'Đang chờ' ? (
                    <button type="button" className="schedule-action-primary btn--sm" onClick={callPatient}>
                      Gọi khám
                    </button>
                  ) : appointment.status === 'Đã khám' ? (
                    <button type="button" className="schedule-action-secondary btn--sm" onClick={openRecord}>
                      Xem hồ sơ
                    </button>
                  ) : (
                    <button type="button" className="schedule-action-primary btn--sm" onClick={enterExam}>
                      Vào khám
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WeekView({
  appointments,
  weekDays,
  selectedDate,
  onSelectAppointment,
}: {
  appointments: Appointment[];
  weekDays: Date[];
  selectedDate: Date;
  onSelectAppointment: (appointment: Appointment, date?: Date) => void;
}) {
  const columns = weekDays.map((day, index) => ({
    date: day,
    label: weekDayLabels[index],
    items: buildWeekItems(appointments, index),
  }));

  return (
    <div className="week-calendar-wrapper rounded-lg border border-slate-200">
      <div className="week-calendar pb-4">
        {columns.map((column, index) => {
          const today = isSameDay(column.date, selectedDate);
          const weekend = index >= 5;
          return (
            <div key={column.date.toISOString()} className={`week-day-column border-r border-slate-100 last:border-r-0 ${weekend ? 'bg-amber-50/20' : 'bg-white'}`}>
              <div
                className={`flex flex-col items-center justify-center py-3 gap-1 ${
                  today
                    ? 'bg-blue-50/30 border-b-2 border-blue-500'
                    : 'bg-slate-50 border-b border-gray-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    today
                      ? 'text-blue-600 font-bold'
                      : weekend
                        ? 'text-orange-500 font-semibold'
                        : 'text-slate-600'
                  }`}
                >
                  {column.label}
                </p>
                {today ? (
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto text-xs font-semibold">
                    {toCompactDate(column.date)}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm h-8 flex items-center justify-center">
                    {toCompactDate(column.date)}
                  </span>
                )}
              </div>
              <div className="min-h-[640px] space-y-2 p-2">
                {column.items.map((appointment) => (
                  <WeekCard key={`${column.label}-${appointment.id}`} appointment={appointment} date={column.date} onSelectAppointment={onSelectAppointment} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekCard({
  appointment,
  date,
  onSelectAppointment,
}: {
  appointment: Appointment;
  date: Date;
  onSelectAppointment: (appointment: Appointment, date?: Date) => void;
}) {
  const patient = getPatient(appointment.patientCode);
  const tone = getAppointmentBlockTone(appointment.status);

  return (
    <button type="button" onClick={() => onSelectAppointment(appointment, date)} className={`block w-full rounded-md border p-2 text-left shadow-sm transition hover:shadow-md ${tone}`}>
      <p className="text-sm font-extrabold text-slate-500">{getShiftLabel(appointment.time)} · {appointment.time.split(' - ')[0]}</p>
      <p className="mt-1 truncate text-sm font-extrabold">{patient.name}</p>
      <div className="mt-2">
        <StatusBadge status={appointment.status} />
      </div>
    </button>
  );
}

function MonthView({
  selectedDate,
  onSelectDate,
  appointments,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  appointments: Appointment[];
}) {
  const days = buildMonthDays(selectedDate);
  const appointmentCounts = useMemo(() => buildMonthAppointmentCounts(appointments), [appointments]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-7 bg-slate-100 text-center text-sm">
        {weekDayLabels.map((day, index) => {
          const weekend = index >= 5;
          return (
            <div
              key={day}
              className={`border-r border-slate-200 px-3 py-3 last:border-r-0 ${
                weekend ? 'text-orange-500 font-semibold' : 'text-slate-600'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const selected = day.date ? isSameDay(day.date, selectedDate) : false;
          const weekend = index % 7 >= 5;
          const appointmentCount = day.date ? appointmentCounts[day.label] ?? 0 : 0;
          return (
            <button
              key={`${day.label}-${index}`}
              type="button"
              disabled={!day.inMonth || !day.date}
              onClick={() => day.date && onSelectDate(day.date)}
              className={`min-h-28 border-r border-t border-slate-100 p-3 text-left last:border-r-0 flex flex-col ${day.inMonth ? 'cursor-pointer bg-white hover:bg-gray-50' : 'bg-slate-50'} ${weekend ? 'bg-amber-50/20' : ''} ${selected ? 'bg-sky-50 ring-2 ring-inset ring-sky-200' : ''}`}
            >
              {day.inMonth ? (
                <>
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold self-start ${selected ? 'bg-brand text-white' : weekend ? 'text-orange-500' : 'text-slate-700'}`}>{day.label}</span>
                  {appointmentCount > 0 ? (
                    <span className="mt-2 mx-1 block w-[calc(100%-8px)] truncate rounded-sm bg-blue-100 px-2 py-1 text-left text-xs font-medium text-blue-700">
                      {appointmentCount} ca
                    </span>
                  ) : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-5 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
        <span className="ml-auto text-slate-400">Bấm vào ô ngày để xem chi tiết</span>
      </div>
    </div>
  );
}

function AppointmentDrawer({
  selectedAppointment,
  onClose,
  onOpenRecord,
  onStartAppointment,
  onEnterAppointment,
}: {
  selectedAppointment: SelectedAppointment;
  onClose: () => void;
  onOpenRecord: () => void;
  onStartAppointment: () => void;
  onEnterAppointment: () => void;
}) {
  const { appointment, date } = selectedAppointment;
  const patient = getPatient(appointment.patientCode);
  const statusTone = getStatusTone(appointment.status);
  const completed = appointment.status === 'Đã khám';
  const waiting = appointment.status === 'Đang chờ';
  const ctaLabel = waiting ? 'Gọi khám' : appointment.status === 'Đang khám' ? 'Vào khám' : 'Xem hồ sơ';
  const ctaClass = completed
    ? 'h-11 w-full rounded-lg border border-slate-300 bg-white text-sm font-extrabold text-slate-600 shadow-sm transition hover:border-brand hover:text-brand'
    : 'h-11 w-full rounded-lg bg-brand text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1f7fb9]';
  const ctaAction = waiting ? onStartAppointment : appointment.status === 'Đang khám' ? onEnterAppointment : onOpenRecord;

  return (
    <aside
      className="w-[380px] shrink-0 transition-all duration-300 bg-white h-fit rounded-2xl border border-gray-200 shadow-xl overflow-hidden overflow-y-auto max-w-[92vw] max-h-[85vh]"
      style={{ animation: 'drawerIn 220ms ease-out' }}
      role="complementary"
      aria-label="Tóm tắt ca khám"
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Tóm tắt ca khám</h2>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-rose-500 transition hover:text-rose-700">
          Đóng
        </button>
      </header>

      <div className="space-y-4 px-5 py-4">
        <section>
          <h3 className="text-2xl font-bold leading-tight text-slate-900">{patient.name}</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {patient.gender} · {patient.age} tuổi · {patient.code}
          </p>
        </section>

        <section className="space-y-2">
          <p className="text-sm text-slate-900">
            <span className="font-semibold text-slate-500">Thời gian:</span>{' '}
            <span className="font-semibold">{appointment.time}, {toDisplayDate(date)}</span>
          </p>
          <p className="text-sm text-slate-900">
            <span className="font-semibold text-slate-500">Trạng thái:</span>{' '}
            <span className={`font-bold ${statusTone}`}>{appointment.status}</span>
          </p>
        </section>

        <section>
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Lý do khám</p>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{appointment.summary}</p>
          {appointment.note ? <p className="mt-2 text-sm leading-6 text-slate-500">{appointment.note}</p> : null}
        </section>
      </div>

      <footer className="mt-6 border-t border-gray-200 pt-4 px-5 pb-4">
        <button
          type="button"
          onClick={ctaAction}
          className={ctaClass}
        >
          {ctaLabel}
        </button>
      </footer>
    </aside>
  );
}

function AppointmentModal({
  selectedAppointment,
  onClose,
  onOpenRecord,
  onStartAppointment,
  onEnterAppointment,
}: {
  selectedAppointment: SelectedAppointment;
  onClose: () => void;
  onOpenRecord: () => void;
  onStartAppointment: () => void;
  onEnterAppointment: () => void;
}) {
  const { appointment, date } = selectedAppointment;
  const patient = getPatient(appointment.patientCode);
  const statusTone = getStatusTone(appointment.status);
  const completed = appointment.status === 'Đã khám';
  const waiting = appointment.status === 'Đang chờ';
  const ctaLabel = waiting ? 'Gọi khám' : appointment.status === 'Đang khám' ? 'Vào khám' : 'Xem hồ sơ';
  const ctaClass = completed
    ? 'h-11 w-full rounded-lg border border-slate-300 bg-white text-sm font-extrabold text-slate-600 shadow-sm transition hover:border-brand hover:text-brand'
    : 'h-11 w-full rounded-lg bg-brand text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1f7fb9]';
  const ctaAction = waiting ? onStartAppointment : appointment.status === 'Đang khám' ? onEnterAppointment : onOpenRecord;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-[90vw] p-0 relative z-[101] overflow-hidden transform scale-100 transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Tóm tắt ca khám</h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-rose-500 transition hover:text-rose-700">
            Đóng
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <section>
            <h3 className="text-2xl font-bold leading-tight text-slate-900">{patient.name}</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {patient.gender} · {patient.age} tuổi · {patient.code}
            </p>
          </section>

          <section className="space-y-2">
            <p className="text-sm text-slate-900">
              <span className="font-semibold text-slate-500">Thời gian:</span>{' '}
              <span className="font-semibold">{appointment.time}, {toDisplayDate(date)}</span>
            </p>
            <p className="text-sm text-slate-900">
              <span className="font-semibold text-slate-500">Trạng thái:</span>{' '}
              <span className={`font-bold ${statusTone}`}>{appointment.status}</span>
            </p>
          </section>

          <section>
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Lý do khám</p>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{appointment.summary}</p>
            {appointment.note ? <p className="mt-2 text-sm leading-6 text-slate-500">{appointment.note}</p> : null}
          </section>
        </div>

        <footer className="mt-6 border-t border-gray-200 pt-4 px-5 pb-4">
          <button
            type="button"
            onClick={ctaAction}
            className={ctaClass}
          >
            {ctaLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

function MiniDatePicker({
  month,
  selectedDate,
  onMonthChange,
  onSelectDate,
}: {
  month: Date;
  selectedDate: Date;
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
}) {
  const days = buildMonthDays(month);
  const moveMonth = (direction: -1 | 1) => {
    const next = new Date(month);
    next.setMonth(next.getMonth() + direction);
    onMonthChange(next);
  };

  return (
    <div className="absolute left-0 top-14 z-30 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => moveMonth(-1)} className="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-slate-800">{formatMonthTitle(month)}</span>
        <button type="button" onClick={() => moveMonth(1)} className="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
        {weekDayLabels.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const selected = day.date ? isSameDay(day.date, selectedDate) : false;
          return (
            <button
              key={`${day.label}-${index}`}
              type="button"
              disabled={!day.inMonth || !day.date}
              onClick={() => day.date && onSelectDate(day.date)}
              className={`h-9 rounded-md text-sm font-semibold transition ${
                selected
                  ? 'bg-brand text-white'
                  : day.inMonth
                    ? 'text-slate-700 hover:bg-sky-50 hover:text-brand'
                    : 'text-transparent'
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildWeekItems(appointments: Appointment[], dayIndex: number) {
  const pools = [
    appointments,
    [...appointments.slice(2), ...appointments.slice(0, 2)],
    [...appointments.slice(1, 5)],
    [...appointments.slice(0, 4), ...appointments.slice(5)],
    [...appointments.slice(1), appointments[0]].filter(Boolean),
    appointments.slice(3),
    appointments.slice(4),
  ];

  return pools[dayIndex].filter(Boolean) as Appointment[];
}

function buildMonthAppointmentCounts(appointments: Appointment[]) {
  const counts: Record<number, number> = {};
  if (!appointments.length) return counts;

  appointments.forEach((_, index) => {
    const day = monthAppointmentDays[index % monthAppointmentDays.length];
    counts[day] = (counts[day] ?? 0) + 1;
  });

  return counts;
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
        Hiển thị {start}-{end} / {totalItems} lịch khám
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
          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="flex h-7 min-w-6 items-center justify-center text-sm font-extrabold text-brand">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onChange(page)}
                className={`flex h-7 min-w-7 items-center justify-center rounded px-2 text-sm font-extrabold transition ${
                  currentPage === page ? 'bg-brand text-white shadow-sm' : 'text-brand hover:bg-sky-50'
                }`}
              >
                {page}
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

function filterAppointments(appointments: Appointment[], filter: StatusFilter) {
  if (filter === 'Tất cả') return appointments;
  return appointments.filter((appointment) => appointment.status === filter);
}

function normalizeAppointment(appointment: Appointment): Appointment {
  return {
    ...appointment,
    status: normalizeAppointmentStatus(appointment.status),
  };
}

function normalizeAppointmentStatus(status: Appointment['status'] | string): Appointment['status'] {
  return String(status) === 'Chưa đến' ? 'Đang chờ' : (status as Appointment['status']);
}

function getStatusTone(status: Appointment['status']) {
  if (status === 'Đang chờ') return 'text-orange-700';
  if (status === 'Đang khám') return 'text-blue-700';
  return 'text-gray-600';
}

function getAppointmentBlockTone(status: Appointment['status']) {
  if (status === 'Đã khám') return 'border-gray-100 bg-gray-50 text-slate-700 border-l-4 border-l-gray-300';
  if (status === 'Đang khám') return 'border-blue-100 bg-blue-50 text-slate-800 border-l-4 border-l-blue-500';
  return 'border-orange-100 bg-orange-50 text-slate-800 border-l-4 border-l-orange-400';
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const tone =
    status === 'Đã khám'
      ? 'bg-gray-100 text-gray-600'
      : status === 'Đang khám'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-orange-100 text-orange-700';

  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>;
}

function getShiftLabel(time: string) {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return 'Sáng';
  if (hour < 18) return 'Chiều';
  return 'Tối';
}

function formatToolbarTitle(date: Date, view: CalendarView) {
  if (view === 'day') {
    return `${isSameDay(date, demoDate) ? 'Hôm nay, ' : ''}${toDisplayDate(date)}`;
  }
  if (view === 'week') {
    return `Tuần ${toCompactDate(getWeekStart(date))} - ${toCompactDate(getWeekEnd(date))}`;
  }
  return formatMonthTitle(date);
}

function getWeekDays(date: Date) {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function getWeekStart(date: Date) {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = current.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + offset);
  return current;
}

function getWeekEnd(date: Date) {
  const end = getWeekStart(date);
  end.setDate(end.getDate() + 6);
  return end;
}

function buildMonthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: Array<{ label: number; inMonth: boolean; date: Date | null }> = [];

  for (let index = 0; index < startOffset; index += 1) {
    days.push({ label: 0, inMonth: false, date: null });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push({ label: day, inMonth: true, date: new Date(month.getFullYear(), month.getMonth(), day) });
  }

  while (days.length % 7 !== 0) {
    days.push({ label: 0, inMonth: false, date: null });
  }

  return days;
}

function formatMonthTitle(date: Date) {
  return `tháng ${String(date.getMonth() + 1).padStart(2, '0')}, ${date.getFullYear()}`;
}

function toDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function toShortDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
}

function toCompactDate(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date).replace('/', '-');
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
