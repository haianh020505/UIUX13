import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Star, User } from 'lucide-react';
import { specialtyOptions, doctorOptions, doctorSchedules } from './data';
import type { AppointmentData, SpecialtyOption, TimeSlot, BookingContext } from './types';
import { MedicalSpecialtyIcon } from './MedicalSpecialtyIcon';

type WizardStep = 1 | 2 | 3;

const STEP_LABELS = ['Chọn chuyên khoa', 'Chọn bác sĩ & giờ', 'Xác nhận'];

function getInitials(name: string) {
  const parts = name.replace(/TS\.BS\.|PGS\.TS\.|BS\.CKI\.|BS\./g, '').trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

function getInitialCardDates() {
  const init: Record<string, string> = {};
  for (const sched of doctorSchedules) {
    if (sched.dates.length > 0) {
      init[sched.doctorId] = sched.dates[0].value;
    }
  }
  return init;
}

export default function PatientBooking({
  context,
  onBack,
  onComplete,
}: {
  context: BookingContext;
  onBack: () => void;
  onComplete: (newAppointment: AppointmentData) => void;
}) {
  const isAiBooking = context.source === 'ai-triage' && Boolean(context.prefilledReason);

  /* ── State ── */
  const [step, setStep] = useState<WizardStep>(context.startStep ?? 1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyOption | null>(
    context.prefilledSpecialty
      ? specialtyOptions.find((s) => s.name === context.prefilledSpecialty) ?? null
      : null,
  );

  /* Step 2 — per-card date selection + single global slot selection */
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(
    context.prefilledDoctor
      ? doctorOptions.find((d) => d.name === context.prefilledDoctor)?.id ?? null
      : null,
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  /* Track which date each card is currently viewing */
  const [cardDates, setCardDates] = useState<Record<string, string>>(getInitialCardDates);

  /* Step 3 — confirmation fields */
  const [reason, setReason] = useState(isAiBooking ? context.prefilledReason ?? '' : '');
  const [submitting, setSubmitting] = useState(false);

  /* ── Derived data ── */
  const visibleDoctors = selectedSpecialty
    ? doctorOptions.filter((doc) => doc.specialty === selectedSpecialty.name)
    : [];

  const selectedDoctor = selectedDoctorId
    ? doctorOptions.find((d) => d.id === selectedDoctorId) ?? null
    : null;

  const selectedDateOption = selectedDoctorId
    ? doctorSchedules
        .find((s) => s.doctorId === selectedDoctorId)
        ?.dates.find((d) => d.value === selectedDate) ?? null
    : null;

  /* ── Step validation ── */
  const canProceed = () => {
    switch (step) {
      case 1: return selectedSpecialty !== null;
      case 2: return selectedDoctorId !== null && selectedSlot !== null && selectedDate !== '';
      case 3: return reason.trim().length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 3 && canProceed()) setStep((step + 1) as WizardStep);
  };

  const goPrev = () => {
    if (step > 1) {
      if (step === (context.startStep ?? 1)) {
        onBack();
        return;
      }
      setStep((step - 1) as WizardStep);
    }
  };

  const handleConfirm = () => {
    if (!selectedDoctor || !selectedSpecialty || !selectedSlot || !selectedDate) return;
    setSubmitting(true);
    window.setTimeout(() => {
      onComplete({
        id: `appt-new-${Date.now()}`,
        date: selectedDate,
        time: selectedSlot.time,
        doctor: selectedDoctor.name,
        specialty: selectedSpecialty.name,
        location: selectedDoctor.location,
        reason: reason.trim(),
        status: 'pending',
      });
    }, 1500);
  };

  /* ── Slot selection handler (single-select across all cards) ── */
  const handleSlotSelect = (doctorId: string, slot: TimeSlot, dateValue: string) => {
    if (slot.status !== 'available') return;
    setSelectedDoctorId(doctorId);
    setSelectedSlot(slot);
    setSelectedDate(dateValue);
    setStep(3); // Auto advance to step 3
  };

  /* ── Card date change handler (horizontal scroller) ── */
  const handleCardDateChange = (doctorId: string, newDate: string) => {
    setCardDates((prev) => ({ ...prev, [doctorId]: newDate }));
    /* If this card had the selected slot, deselect it since slots change */
    if (selectedDoctorId === doctorId) {
      setSelectedSlot(null);
      setSelectedDate('');
      setSelectedDoctorId(null);
    }
  };

  const handleSpecialtySelect = (specialty: SpecialtyOption) => {
    setSelectedSpecialty(specialty);
    setSelectedDoctorId(null);
    setSelectedSlot(null);
    setSelectedDate('');
    setCardDates(getInitialCardDates());
    setStep(2); // Auto advance to step 2
  };

  return (
    <div>
      {/* ── Wizard Header ── */}
      <div className="wizard-header">
        <button type="button" className="btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <h1>Đặt lịch khám mới</h1>
      </div>

      {/* ── Reschedule Banner ── */}
      {context.isReschedule && context.fromAppointment ? (
        <div className="reschedule-banner" style={{ marginTop: 'var(--spacing-md)' }}>
          <span>⚠️</span>
          <span>
            Bạn đang dời lịch hẹn cũ với <strong>{context.fromAppointment.doctor}</strong>.
            Lịch cũ sẽ bị hủy sau khi bạn xác nhận lịch mới.
          </span>
        </div>
      ) : null}

      {/* ── Step Indicator ── */}
      <div className="step-indicator">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as WizardStep;
          const state = stepNum < step ? 'completed' : stepNum === step ? 'active' : 'upcoming';
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="step-indicator__step">
                <span className={`step-indicator__circle step-indicator__circle--${state}`}>
                  {state === 'completed' ? <Check size={14} /> : stepNum}
                </span>
                <span className={`step-indicator__label step-indicator__label--${state}`}>{label}</span>
              </div>
              {idx < STEP_LABELS.length - 1 ? (
                <span
                  className={`step-indicator__connector step-indicator__connector--${
                    stepNum < step ? 'completed' : 'upcoming'
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ═══ STEP 1 — Chọn chuyên khoa ═══ */}
      {step === 1 ? (
        <div className="specialty-grid">
          {specialtyOptions.map((sp) => (
            <button
              key={sp.id}
              type="button"
              className={`specialty-card${selectedSpecialty?.id === sp.id ? ' specialty-card--selected' : ''}`}
              onClick={() => handleSpecialtySelect(sp)}
            >
              <MedicalSpecialtyIcon id={sp.id} size={32} />
              <span className="specialty-card__name">{sp.name}</span>
              <span className="specialty-card__count">{sp.doctorCount} bác sĩ</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* ═══ STEP 2 — Chọn bác sĩ & giờ (BookingCare + Horizontal Date Scroller) ═══ */}
      {step === 2 ? (
        <div className="doctor-list">
          {visibleDoctors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-bold text-slate-600">Chưa có bác sĩ khả dụng cho chuyên khoa này.</p>
            </div>
          ) : null}

          {visibleDoctors.map((doc) => {
            const schedule = doctorSchedules.find((s) => s.doctorId === doc.id);
            const currentDateValue = cardDates[doc.id] ?? schedule?.dates[0]?.value ?? '';
            const currentDateOption = schedule?.dates.find((d) => d.value === currentDateValue);
            const isCardSelected = selectedDoctorId === doc.id && selectedSlot !== null;

            return (
              <div
                key={doc.id}
                className={`doctor-card${isCardSelected ? ' doctor-card--selected' : ''}`}
              >
                {/* ── Panel Left ── */}
                <div className="doctor-card__left">
                  <div className="doctor-card__header">
                    <div className="doctor-card__avatar">{getInitials(doc.name)}</div>
                    <div className="doctor-card__info">
                      <div className="doctor-card__name">{doc.name}</div>
                      <div className="doctor-card__specialty">{doc.specialty}</div>
                      <div className="doctor-card__experience">{doc.experience}</div>
                    </div>
                  </div>
                  <div className="doctor-card__tags">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="doctor-card__tag">{tag}</span>
                    ))}
                  </div>
                  <div className="doctor-card__meta">
                    <div className="doctor-card__price">{doc.price}</div>
                    <div className="doctor-card__rating">
                      <Star size={14} fill="currentColor" />
                      {doc.rating}
                      <span className="doctor-card__rating-count">({doc.ratingCount} đánh giá)</span>
                    </div>
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="doctor-card__divider" />

                {/* ── Panel Right ── */}
                <div className="doctor-card__right">
                  {/* Horizontal Date Scroller */}
                  <div className="doctor-card__date-selector">
                    {schedule?.dates.map((d) => {
                      const isActive = d.value === currentDateValue;
                      const hasSlots = d.slots.length > 0;
                      let cls = 'date-item';
                      if (isActive) cls += ' date-item--active';
                      if (!hasSlots) cls += ' date-item--disabled';

                      return (
                        <button
                          key={d.value}
                          type="button"
                          className={cls}
                          disabled={!hasSlots}
                          onClick={() => hasSlots && handleCardDateChange(doc.id, d.value)}
                        >
                          <span className="date-item__dow">{d.dayOfWeek}</span>
                          <span className="date-item__day">{d.dayMonth}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Schedule label */}
                  <div className="doctor-card__schedule-label">LỊCH KHÁM</div>

                  {/* Slot grid */}
                  {currentDateOption && currentDateOption.slots.length > 0 ? (
                    <div className="doctor-card__slots">
                      {currentDateOption.slots.map((slot) => {
                        const isSelected =
                          selectedDoctorId === doc.id &&
                          selectedSlot?.time === slot.time &&
                          selectedDate === currentDateValue;

                        let cls = 'slot';
                        if (isSelected) {
                          cls += ' slot--selected';
                        } else if (slot.status === 'booked') {
                          cls += ' slot--booked';
                        } else {
                          cls += ' slot--available';
                        }

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            className={cls}
                            disabled={slot.status === 'booked'}
                            onClick={() => handleSlotSelect(doc.id, slot, currentDateValue)}
                          >
                            <span>{slot.time}</span>
                            {slot.status === 'booked' ? (
                              <span className="slot__sub">Đã đặt</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                      <span style={{ color: 'var(--color-text-disabled)', fontSize: 'var(--font-size-sm)' }}>
                        Không có lịch khám trong ngày này
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="doctor-card__location">
                    <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    {doc.location}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ═══ STEP 3 — Xác nhận (Enhanced UX) ═══ */}
      {step === 3 ? (
        <div>
          {/* ── Khối: Thông tin lịch hẹn ── */}
          <div className="booking-summary">
            <h2 className="booking-summary__title">Thông tin lịch hẹn</h2>
            <div className="summary-row">
              <span className="summary-label">Chuyên khoa</span>
              <span className="summary-value">{selectedSpecialty?.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Bác sĩ</span>
              <span className="summary-value">{selectedDoctor?.name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Ngày khám</span>
              <span className="summary-value">
                {selectedDateOption
                  ? `${selectedDateOption.label.split(' – ')[0]}, ${selectedDate}`
                  : selectedDate || '—'}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Giờ khám</span>
              <span className="summary-value">{selectedSlot?.time ?? '—'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phòng khám</span>
              <span className="summary-value">{selectedDoctor?.location ?? '—'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phí khám</span>
              <span className="summary-value summary-value--highlight">{selectedDoctor?.price ?? '—'}</span>
            </div>
          </div>

          {/* ── Khối: Thông tin Bệnh nhân (Read-only) ── */}
          <div className="patient-info-block">
            <h3 className="patient-info-block__title">
              <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Thông tin bệnh nhân
            </h3>
            <div className="patient-info-block__row">
              <span className="patient-info-block__label">Họ và tên</span>
              <span className="patient-info-block__value">Lê Nguyễn Công Minh</span>
            </div>
            <div className="patient-info-block__row">
              <span className="patient-info-block__label">Số điện thoại</span>
              <span className="patient-info-block__value">098x.xxx.xxx</span>
            </div>
            <p className="patient-info-block__hint">Thông tin được lấy từ hồ sơ tài khoản của bạn</p>
          </div>

          {/* ── AI source context ── */}
          {isAiBooking ? (
            <div className="toggle-row">
              <span className="toggle-row__label">Nguồn lý do khám</span>
              <span className="toggle-switch__text">Từ AI Triage</span>
            </div>
          ) : null}

          {isAiBooking ? (
            <div className="autofill-banner">
              <span>Đã tự điền từ phiên tư vấn AI.</span>
            </div>
          ) : null}

          {/* ── Lý do khám ── */}
          <div className="booking-form-group">
            <label htmlFor="booking-reason">
              Lý do khám
              <span className="required-star">*</span>
            </label>
            <textarea
              id="booking-reason"
              className="booking-textarea"
              rows={3}
              placeholder={
                isAiBooking
                  ? 'Mô tả ngắn triệu chứng hoặc lý do khám...'
                  : 'Vui lòng mô tả chi tiết triệu chứng, vị trí đau hoặc lý do bạn muốn đi khám để bác sĩ nắm sơ bộ...'
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
      ) : null}

      {/* ── Wizard Footer ── */}
      <div className="wizard-footer">
        <div>
          {step > 1 && step > (context.startStep ?? 1) ? (
            <button type="button" className="appt-btn-secondary" onClick={goPrev}>
              <ArrowLeft size={14} />
              Quay lại
            </button>
          ) : null}
        </div>
        <div>
          {step < 3 ? (
            <button
              type="button"
              className="appt-btn-primary"
              disabled={!canProceed()}
              onClick={goNext}
            >
              Tiếp theo
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="appt-btn-primary"
              disabled={!canProceed() || submitting}
              onClick={handleConfirm}
            >
              {submitting ? (
                <>
                  <span className="appt-spinner" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Xác nhận đặt lịch
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
