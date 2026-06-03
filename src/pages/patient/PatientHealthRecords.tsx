import { useState, useMemo, useCallback } from 'react';
import { TrendingUp, Plus, Edit3, Trash2, X, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import type {
  AllergyItem,
  AllergyFormData,
  AllergyFormErrors,
  AllergySeverity,
  AllergyType,
  AllergySourceType,
  ChronicCondition,
  MetricKey,
  MetricEntry,
  HealthMetrics,
  MetricUpdateFormData,
} from './healthRecordTypes';
import {
  mockHealthMetrics,
  mockAllergies,
  mockConditions,
  mockMetricHistory,
  metricConfigs,
  getBMICategory,
  calculateBMI,
  isMetricOutdated,
  getSourceLabel,
  getSeverityConfig,
  allergenSuggestionsByType,
  commonConditions,
  bloodTypeOptions,
} from './healthRecordData';

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT — Single-Page Dashboard
   ══════════════════════════════════════════════════════════════ */
export default function PatientHealthRecords() {
  const [metrics, setMetrics] = useState<HealthMetrics>(mockHealthMetrics);
  const [allergies, setAllergies] = useState<AllergyItem[]>(mockAllergies);
  const [conditions, setConditions] = useState<ChronicCondition[]>(mockConditions);
  const [metricHistory, setMetricHistory] = useState(mockMetricHistory);

  /* ── Modal states ── */
  const [historyModal, setHistoryModal] = useState<MetricKey | null>(null);
  const [allergyFormModal, setAllergyFormModal] = useState<{ mode: 'add' | 'edit'; item?: AllergyItem } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AllergyItem | null>(null);
  const [updateMetricsModal, setUpdateMetricsModal] = useState(false);
  const [conditionInput, setConditionInput] = useState('');
  const [showConditionSuggest, setShowConditionSuggest] = useState(false);

  /* ── Allergy handlers ── */
  const handleSaveAllergy = useCallback((data: AllergyFormData, editId?: string) => {
    if (editId) {
      setAllergies(prev => prev.map(a => a.id === editId ? {
        ...a, name: data.name, type: data.type, severity: data.severity!, reaction: data.reaction, source: data.source,
      } : a));
    } else {
      const newAllergy: AllergyItem = {
        id: `allergy-${Date.now()}`,
        name: data.name,
        type: data.type,
        severity: data.severity!,
        reaction: data.reaction,
        source: data.source,
        confirmedDate: new Date().toLocaleDateString('vi-VN'),
      };
      setAllergies(prev => [newAllergy, ...prev]);
    }
    setAllergyFormModal(null);
  }, []);

  const handleDeleteAllergy = useCallback((item: AllergyItem) => {
    setAllergies(prev => prev.filter(a => a.id !== item.id));
    setDeleteConfirm(null);
  }, []);

  /* ── Metric update handler ── */
  const handleUpdateMetrics = useCallback((formData: MetricUpdateFormData) => {
    const now = new Date().toLocaleDateString('vi-VN');
    const updatedVitals = { ...metrics.vitals };
    const newHistory = { ...metricHistory };

    if (formData.height && formData.height !== (metrics.vitals.height?.value || '')) {
      const entry: MetricEntry = { id: `h-${Date.now()}`, value: formData.height, date: now, source: 'patient' };
      updatedVitals.height = entry;
      newHistory.height = [entry, ...newHistory.height];
    }
    if (formData.weight && formData.weight !== (metrics.vitals.weight?.value || '')) {
      const entry: MetricEntry = { id: `w-${Date.now()}`, value: formData.weight, date: now, source: 'patient' };
      updatedVitals.weight = entry;
      newHistory.weight = [entry, ...newHistory.weight];
    }

    // Recalculate BMI
    const h = parseFloat(updatedVitals.height?.value || '0');
    const w = parseFloat(updatedVitals.weight?.value || '0');
    updatedVitals.bmi = h > 0 && w > 0 ? calculateBMI(h, w) : null;

    const updatedBasicInfo = { ...metrics.basicInfo };
    if (formData.bloodType) {
      updatedBasicInfo.bloodType = formData.bloodType;
    }

    setMetrics({ basicInfo: updatedBasicInfo, vitals: updatedVitals });
    setMetricHistory(newHistory);
    setUpdateMetricsModal(false);
  }, [metrics, metricHistory]);

  /* ── Delete metric history entry ── */
  const handleDeleteHistoryEntry = useCallback((metricKey: MetricKey, entryId: string) => {
    setMetricHistory(prev => ({
      ...prev,
      [metricKey]: prev[metricKey].filter(e => e.id !== entryId),
    }));
  }, []);

  /* ── Add condition ── */
  const handleAddCondition = useCallback((name: string) => {
    if (!name.trim()) return;
    if (conditions.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) return;
    setConditions(prev => [...prev, { id: `cond-${Date.now()}`, name: name.trim() }]);
    setConditionInput('');
    setShowConditionSuggest(false);
  }, [conditions]);

  const handleRemoveCondition = useCallback((id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  }, []);

  const severeCount = useMemo(() => allergies.filter(a => a.severity === 'severe').length, [allergies]);

  return (
    <div className="panel" style={{ padding: 0, overflow: 'visible' }}>
      {/* ── Single-Page Content ── */}
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <div className="hr-content-grid">
          {/* ── LEFT COLUMN: Health Metrics ── */}
          <div>
            <HealthMetricsSection
              metrics={metrics}
              conditions={conditions}
              conditionInput={conditionInput}
              showConditionSuggest={showConditionSuggest}
              onOpenHistory={setHistoryModal}
              onOpenUpdateMetrics={() => setUpdateMetricsModal(true)}
              onConditionInputChange={setConditionInput}
              onShowConditionSuggest={setShowConditionSuggest}
              onAddCondition={handleAddCondition}
              onRemoveCondition={handleRemoveCondition}
            />
          </div>

          {/* ── RIGHT COLUMN: Allergy Profile ── */}
          <div className="hr-allergy-column-wrapper">
            <AllergyProfileSection
              allergies={allergies}
              severeCount={severeCount}
              onAdd={() => setAllergyFormModal({ mode: 'add' })}
              onEdit={(item) => setAllergyFormModal({ mode: 'edit', item })}
              onDelete={setDeleteConfirm}
            />
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {historyModal ? (
        <MetricHistoryModal
          metricKey={historyModal}
          entries={metricHistory[historyModal]}
          onClose={() => setHistoryModal(null)}
          onDeleteEntry={(entryId) => handleDeleteHistoryEntry(historyModal, entryId)}
          onOpenUpdate={() => { setHistoryModal(null); setUpdateMetricsModal(true); }}
        />
      ) : null}

      {allergyFormModal ? (
        <AllergyFormModal
          mode={allergyFormModal.mode}
          initialData={allergyFormModal.item}
          existingNames={allergies.map(a => a.name)}
          onSave={handleSaveAllergy}
          onClose={() => setAllergyFormModal(null)}
        />
      ) : null}

      {deleteConfirm ? (
        <DeleteAllergyConfirm
          item={deleteConfirm}
          onConfirm={() => handleDeleteAllergy(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      ) : null}

      {updateMetricsModal ? (
        <UpdateMetricsModal
          metrics={metrics}
          onSave={handleUpdateMetrics}
          onClose={() => setUpdateMetricsModal(false)}
        />
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEALTH METRICS SECTION (Left Column)
   ══════════════════════════════════════════════════════════════ */
function HealthMetricsSection({
  metrics, conditions, conditionInput, showConditionSuggest,
  onOpenHistory, onOpenUpdateMetrics,
  onConditionInputChange, onShowConditionSuggest, onAddCondition, onRemoveCondition,
}: {
  metrics: HealthMetrics;
  conditions: ChronicCondition[];
  conditionInput: string;
  showConditionSuggest: boolean;
  onOpenHistory: (key: MetricKey) => void;
  onOpenUpdateMetrics: () => void;
  onConditionInputChange: (v: string) => void;
  onShowConditionSuggest: (v: boolean) => void;
  onAddCondition: (name: string) => void;
  onRemoveCondition: (id: string) => void;
}) {
  const { basicInfo, vitals } = metrics;
  const bmiInfo = vitals.bmi ? getBMICategory(vitals.bmi) : null;

  const filteredConditionSuggestions = commonConditions.filter(
    c => c.toLowerCase().includes(conditionInput.toLowerCase()) && !conditions.some(ex => ex.name.toLowerCase() === c.toLowerCase())
  );

  return (
    <section>
      {/* Section Header */}
      <div className="hr-section-header">
        <h2 className="hr-section-title">
          <span className="hr-section-title-icon"><TrendingUp size={18} /></span>
          Chỉ số cơ thể
        </h2>
        <button type="button" className="hr-btn-primary hr-btn-sm" onClick={onOpenUpdateMetrics}>
          <Edit3 size={14} /> Cập nhật
        </button>
      </div>

      {/* Basic Info */}
      <div className="hr-basic-info">
        <div className="hr-info-item">
          <span className="hr-info-label">Họ tên</span>
          <span className="hr-info-value">{basicInfo.fullName}</span>
        </div>
        <div className="hr-info-item">
          <span className="hr-info-label">Ngày sinh</span>
          <span className="hr-info-value">{basicInfo.dateOfBirth} ({basicInfo.age} tuổi)</span>
        </div>
        <div className="hr-info-item">
          <span className="hr-info-label">Giới tính</span>
          <span className="hr-info-value">{basicInfo.gender}</span>
        </div>
        <div className="hr-info-item">
          <span className="hr-info-label">Nhóm máu</span>
          {basicInfo.bloodType ? (
            <span className="hr-info-value">
              <span className="hr-blood-type-badge">{basicInfo.bloodType}</span>
            </span>
          ) : (
            <span className="hr-info-value hr-info-value--unknown">
              <span className="hr-tooltip-wrapper">
                Chưa xác định
                <span className="hr-tooltip">Quan trọng trong cấp cứu — hãy bổ sung!</span>
              </span>
            </span>
          )}
        </div>
        <div className="hr-info-item">
          <span className="hr-info-label">CCCD</span>
          <span className="hr-info-value">{basicInfo.nationalId}</span>
        </div>
        {basicInfo.patientCode ? (
          <div className="hr-info-item">
            <span className="hr-info-label">Mã bệnh nhân</span>
            <span className="hr-info-value" style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)' }}>{basicInfo.patientCode}</span>
          </div>
        ) : null}
      </div>

      {/* Metric Cards — 3 cards: Height, Weight, BMI */}
      <div className="hr-metric-grid">
        {metricConfigs.map(cfg => {
          const entry = vitals[cfg.key];
          const outdated = entry && isMetricOutdated(entry.date);

          if (!entry) {
            return (
              <div key={cfg.key} className="hr-metric-card hr-metric-card--empty">
                <div className="hr-metric-card__label">{cfg.icon} {cfg.label}</div>
                <div className="hr-metric-card__empty-text">Chưa có dữ liệu</div>
                <button type="button" className="hr-metric-card__empty-cta" onClick={onOpenUpdateMetrics}>
                  + Cập nhật ngay
                </button>
              </div>
            );
          }

          return (
            <div key={cfg.key} className="hr-metric-card">
              <div className="hr-metric-card__header">
                <span className="hr-metric-card__label">{cfg.icon} {cfg.label}</span>
                {outdated ? <span className="hr-outdated-badge">⚠️ Chưa cập nhật</span> : null}
              </div>
              <div>
                <span className="hr-metric-card__value">{entry.value}</span>
                <span className="hr-metric-card__unit">{cfg.unit}</span>
              </div>
              <div className="hr-metric-card__updated">
                Cập nhật: {entry.date}
              </div>
              <button type="button" className="hr-metric-card__history-btn" onClick={() => onOpenHistory(cfg.key)}>
                <TrendingUp size={12} /> Xem lịch sử
              </button>
            </div>
          );
        })}

        {/* BMI Card — Auto-calculated, readonly */}
        <div className={`hr-bmi-card`}
          style={bmiInfo ? {
            background: bmiInfo.category === 'normal' ? 'var(--color-success-light)' :
              bmiInfo.category === 'obese' ? 'var(--color-danger-light)' : 'var(--color-warning-light)'
          } : { background: 'var(--color-bg-subtle)' }}
        >
          <span className="hr-metric-card__label">📊 BMI</span>
          {vitals.bmi ? (
            <>
              <span className="hr-bmi-card__value" style={{
                color: bmiInfo?.category === 'normal' ? 'var(--color-success)' :
                  bmiInfo?.category === 'obese' ? 'var(--color-danger)' : 'var(--color-warning)'
              }}>{vitals.bmi}</span>
              {bmiInfo ? <span className={`bmi-badge ${bmiInfo.colorClass}`}>{bmiInfo.label}</span> : null}
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Hệ thống tự tính từ chiều cao & cân nặng
              </span>
            </>
          ) : (
            <span className="hr-metric-card__empty-text" style={{ fontSize: 'var(--font-size-xs)' }}>
              Nhập chiều cao & cân nặng để tính
            </span>
          )}
        </div>
      </div>

      {/* Chronic Conditions — Pulled up right after metrics for balance */}
      <div className="hr-conditions-group">
        <h3 className="hr-conditions-group__title">Bệnh nền / Tiền sử bệnh mạn tính</h3>
        <div className="hr-conditions-chips">
          {conditions.map(c => (
            <span key={c.id} className="hr-condition-chip">
              {c.name}
              <button type="button" className="hr-condition-chip__remove" onClick={() => onRemoveCondition(c.id)} title="Xóa">×</button>
            </span>
          ))}
          {conditions.length === 0 ? (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              Chưa có bệnh nền nào được ghi nhận
            </span>
          ) : null}
        </div>
        <div className="hr-autocomplete hr-autocomplete--conditions">
          <button
            type="button"
            className="hr-add-btn"
            onClick={() => onShowConditionSuggest(!showConditionSuggest)}
          >
            <Plus size={12} /> Thêm bệnh nền
          </button>
          {showConditionSuggest ? (
            <div className="hr-autocomplete__list hr-autocomplete__list--dropup hr-condition-suggest-list">
              <div style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', position: 'sticky', top: 0, background: 'var(--color-bg-surface)', zIndex: 1 }}>
                <input
                  className="hr-form-input"
                  placeholder="Tìm bệnh nền..."
                  value={conditionInput}
                  onChange={e => onConditionInputChange(e.target.value)}
                  autoFocus
                  style={{ fontSize: 'var(--font-size-xs)' }}
                />
              </div>
              {filteredConditionSuggestions.map(name => (
                <button key={name} type="button" className="hr-autocomplete__item" onClick={() => onAddCondition(name)}>
                  {name}
                </button>
              ))}
              {conditionInput.trim() && !filteredConditionSuggestions.includes(conditionInput.trim()) ? (
                <button type="button" className="hr-autocomplete__item" onClick={() => onAddCondition(conditionInput)}>
                  + Thêm "{conditionInput.trim()}"
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   ALLERGY PROFILE SECTION (Right Column)
   ══════════════════════════════════════════════════════════════ */
function AllergyProfileSection({
  allergies, severeCount, onAdd, onEdit, onDelete,
}: {
  allergies: AllergyItem[];
  severeCount: number;
  onAdd: () => void;
  onEdit: (item: AllergyItem) => void;
  onDelete: (item: AllergyItem) => void;
}) {
  return (
    <section className="hr-allergy-section">
      <div className="hr-section-header">
        <h2 className="hr-section-title">
          <span className="hr-section-title-icon" style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
            <ShieldCheck size={18} />
          </span>
          Tiền sử dị ứng
        </h2>
        <button type="button" className="hr-btn-primary hr-btn-sm" onClick={onAdd}>
          <Plus size={14} /> Thêm dị ứng
        </button>
      </div>

      {/* Alert Banner */}
      {severeCount > 0 ? (
        <div className="hr-allergy-alert-banner">
          <span>
            Hồ sơ này có <strong>{severeCount} dị ứng nghiêm trọng</strong>. Bác sĩ sẽ được cảnh báo khi kê đơn.
          </span>
        </div>
      ) : null}

      {/* Allergy List */}
      {allergies.length > 0 ? (
        <div className="hr-allergy-list">
          {allergies.map(item => {
            const sevCfg = getSeverityConfig(item.severity);
            const srcCfg = getSourceLabel(item.source);
            // 🚨 CRITICAL: Only self-reported allergies can be edited/deleted by patient
            const isSelfReported = item.source === 'self-reported';

            return (
              <div key={item.id} className={`hr-allergy-item hr-allergy-item--${item.severity}`}>
                <div className="hr-allergy-item__top">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <span className="hr-allergy-item__name">{item.name}</span>
                      <span className={`hr-severity-badge hr-severity-badge--${item.severity}`}>
                        {sevCfg.label}
                      </span>
                    </div>
                    <div className="hr-allergy-item__type">{item.type}</div>
                  </div>
                  {isSelfReported ? (
                    <div className="hr-allergy-item__actions">
                      <button type="button" className="hr-btn-ghost" onClick={() => onEdit(item)} title="Sửa">
                        <Edit3 size={13} />
                      </button>
                      <button type="button" className="hr-btn-ghost hr-btn-ghost--danger" onClick={() => onDelete(item)} title="Xóa">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="hr-allergy-item__reaction">
                  <span className="hr-allergy-item__reaction-label">Phản ứng: </span>
                  {item.reaction}
                </div>
                <div className="hr-allergy-item__footer">
                  <span className="hr-allergy-item__source">
                    <span className={`hr-source-badge ${srcCfg.className}`}>{srcCfg.label}</span>
                    {item.sourceName ? ` • ${item.sourceName}` : ''} • {item.confirmedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="hr-empty-state">
          <div className="hr-empty-state__icon">🛡️</div>
          <div className="hr-empty-state__title">Chưa có thông tin dị ứng</div>
          <div className="hr-empty-state__desc">Hãy thêm để bác sĩ có thể kê đơn an toàn hơn.</div>
          <button type="button" className="hr-btn-primary hr-btn-sm" onClick={onAdd}>
            <Plus size={14} /> Thêm dị ứng đầu tiên
          </button>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   METRIC HISTORY MODAL
   ══════════════════════════════════════════════════════════════ */
function MetricHistoryModal({
  metricKey, entries, onClose, onDeleteEntry, onOpenUpdate,
}: {
  metricKey: MetricKey;
  entries: MetricEntry[];
  onClose: () => void;
  onDeleteEntry: (entryId: string) => void;
  onOpenUpdate: () => void;
}) {
  const cfg = metricConfigs.find(c => c.key === metricKey);
  if (!cfg) return null;

  // Simple SVG sparkline
  const chartPoints = entries.length > 1 ? (() => {
    const values = [...entries].reverse().map(e => parseFloat(e.value.split('/')[0]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 100;
    const h = 80;
    const padding = 10;
    return values.map((v, i) => ({
      x: padding + (i / (values.length - 1)) * (w - 2 * padding),
      y: padding + (1 - (v - min) / range) * (h - 2 * padding),
    }));
  })() : null;

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal hr-modal--lg" onClick={e => e.stopPropagation()}>
        <div className="hr-modal__header">
          <h3 className="hr-modal__title">{cfg.icon} Lịch sử {cfg.label}</h3>
          <button type="button" className="hr-modal__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="hr-modal__body">
          {/* Sparkline Chart */}
          {chartPoints && chartPoints.length > 1 ? (
            <div className="hr-sparkline">
              <svg viewBox="0 0 100 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {/* Fill area */}
                <path
                  d={`M ${chartPoints[0].x} ${chartPoints[0].y} ${chartPoints.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${chartPoints[chartPoints.length - 1].x} 75 L ${chartPoints[0].x} 75 Z`}
                  fill="url(#sparkFill)"
                />
                {/* Line */}
                <polyline
                  points={chartPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots */}
                {chartPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-bg-surface)" stroke="var(--color-primary)" strokeWidth="2" />
                ))}
              </svg>
            </div>
          ) : null}

          {/* History Table */}
          {entries.length > 0 ? (
            <table className="hr-history-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giá trị</th>
                  <th>Nguồn</th>
                  <th style={{ width: 48 }}></th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const src = getSourceLabel(entry.source);
                  const canDelete = entry.source === 'patient';
                  return (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td style={{ fontWeight: 'var(--font-weight-bold)' as any }}>{entry.value} {cfg.unit}</td>
                      <td>
                        <span className={`hr-source-badge ${src.className}`}>{src.label}</span>
                        {entry.sourceName ? <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: 'var(--spacing-xs)' }}>{entry.sourceName}</span> : null}
                      </td>
                      <td>
                        {canDelete ? (
                          <button type="button" className="hr-btn-ghost hr-btn-ghost--danger" onClick={() => onDeleteEntry(entry.id)} title="Xóa">
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-disabled)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="hr-empty-state" style={{ padding: 'var(--spacing-lg)' }}>
              <div className="hr-empty-state__icon">📊</div>
              <div className="hr-empty-state__title">Chưa có lịch sử</div>
              <div className="hr-empty-state__desc">Cập nhật chỉ số để bắt đầu theo dõi xu hướng.</div>
            </div>
          )}
        </div>
        <div className="hr-modal__footer">
          <button type="button" className="hr-btn-primary" onClick={onOpenUpdate}>
            <Plus size={14} /> Thêm chỉ số mới
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ALLERGY FORM MODAL
   ══════════════════════════════════════════════════════════════ */
function AllergyFormModal({
  mode, initialData, existingNames, onSave, onClose,
}: {
  mode: 'add' | 'edit';
  initialData?: AllergyItem;
  existingNames: string[];
  onSave: (data: AllergyFormData, editId?: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AllergyFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'Kháng sinh',
    severity: initialData?.severity || null,
    reaction: initialData?.reaction || '',
    source: initialData?.source === 'doctor-confirmed' ? 'doctor-confirmed' :
      initialData?.source === 'lab-result' ? 'lab-result' : 'self-reported',
  });
  const [errors, setErrors] = useState<AllergyFormErrors>({});
  const [showSuggest, setShowSuggest] = useState(false);
  const [touched, setTouched] = useState(false);

  const isDuplicate = mode === 'add' && form.name.trim() &&
    existingNames.some(n => n.toLowerCase() === form.name.trim().toLowerCase());

  const filteredSuggestions = allergenSuggestionsByType[form.type].filter(
    a => a.toLowerCase().includes(form.name.toLowerCase()) && a.toLowerCase() !== form.name.toLowerCase()
  );

  const validate = (): boolean => {
    const errs: AllergyFormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Tên chất gây dị ứng cần ít nhất 2 ký tự';
    if (!form.severity) errs.severity = 'Vui lòng chọn mức độ phản ứng';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!validate()) return;
    if (isDuplicate) return;
    onSave(form, initialData?.id);
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal" onClick={e => e.stopPropagation()}>
        <div className="hr-modal__header">
          <h3 className="hr-modal__title">
            {mode === 'add' ? '➕ Thêm thông tin dị ứng' : '✏️ Sửa thông tin dị ứng'}
          </h3>
          <button type="button" className="hr-modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="hr-modal__body">
          {/* Field 1: Name */}
          <div className="hr-form-group">
            <label className="hr-form-label hr-form-label--required">Tên thuốc / chất gây dị ứng</label>
            <div className="hr-autocomplete">
              <input
                className={`hr-form-input ${touched && errors.name ? 'hr-form-input--error' : ''}`}
                placeholder="VD: Penicillin, Aspirin, Hải sản..."
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
              />
              {showSuggest && filteredSuggestions.length > 0 ? (
                <div className="hr-autocomplete__list hr-allergen-suggest-list">
                  {filteredSuggestions.slice(0, 6).map(s => (
                    <button key={s} type="button" className="hr-autocomplete__item" onClick={() => { setForm(f => ({ ...f, name: s })); setShowSuggest(false); }}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {touched && errors.name ? <span className="hr-form-error">{errors.name}</span> : null}
            {isDuplicate ? (
              <div className="hr-inline-warning">
                <AlertTriangle size={14} /> Bạn đã có dị ứng với "{form.name.trim()}". Cập nhật thông tin hiện tại?
              </div>
            ) : null}
          </div>

          {/* Field 2: Type */}
          <div className="hr-form-group">
            <label className="hr-form-label">Loại</label>
            <select
              className="hr-form-select"
              value={form.type}
              onChange={e => {
                setForm(f => ({ ...f, type: e.target.value as AllergyType }));
                setShowSuggest(true);
              }}
            >
              <option>Kháng sinh</option>
              <option>Thuốc giảm đau / hạ sốt</option>
              <option>Thực phẩm</option>
              <option>Môi trường (phấn hoa, bụi...)</option>
              <option>Khác</option>
            </select>
          </div>

          {/* Field 3: Severity */}
          <div className="hr-form-group">
            <label className="hr-form-label hr-form-label--required">Mức độ phản ứng</label>
            <div className="hr-severity-selector">
              {(['mild', 'moderate', 'severe'] as AllergySeverity[]).map(level => {
                const cfg = getSeverityConfig(level);
                return (
                  <button
                    key={level}
                    type="button"
                    className={`hr-severity-btn hr-severity-btn--${level} ${form.severity === level ? 'hr-severity-btn--active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, severity: level }))}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            {touched && errors.severity ? <span className="hr-form-error">{errors.severity}</span> : null}
            {form.severity === 'severe' ? (
              <div className="hr-inline-warning">
                <AlertTriangle size={14} />
                <span>Dị ứng mức <strong>Nghiêm trọng</strong> sẽ tạo cảnh báo đỏ cho bác sĩ khi kê đơn.</span>
              </div>
            ) : null}
          </div>

          {/* Field 4: Reaction description */}
          <div className="hr-form-group">
            <label className="hr-form-label">Mô tả phản ứng</label>
            <textarea
              className="hr-form-textarea"
              placeholder="VD: Nổi mề đay, khó thở, sốc phản vệ..."
              value={form.reaction}
              onChange={e => setForm(f => ({ ...f, reaction: e.target.value }))}
            />
          </div>

          {/* Source is always self-reported for patient-side form — no dropdown needed */}
        </div>
        <div className="hr-modal__footer">
          <button type="button" className="hr-btn-secondary" onClick={onClose}>Hủy</button>
          <button
            type="button"
            className="hr-btn-primary"
            onClick={handleSubmit}
            disabled={!!isDuplicate}
          >
            {mode === 'add' ? 'Lưu dị ứng' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DELETE ALLERGY CONFIRM
   ══════════════════════════════════════════════════════════════ */
function DeleteAllergyConfirm({
  item, onConfirm, onCancel,
}: {
  item: AllergyItem;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDoctorConfirmed = item.source === 'doctor-confirmed';
  const isLabResult = item.source === 'lab-result';

  if (isLabResult) {
    return (
      <div className="hr-modal-overlay" onClick={onCancel}>
        <div className="hr-modal hr-confirm-dialog" onClick={e => e.stopPropagation()}>
          <div className="hr-modal__body" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="hr-confirm-dialog__icon hr-confirm-dialog__icon--warning">
              <Info size={24} />
            </div>
            <div className="hr-confirm-dialog__text">
              <div className="hr-confirm-dialog__title">Không thể xóa</div>
              <div className="hr-confirm-dialog__desc">
                Dị ứng <strong>{item.name}</strong> được ghi nhận từ kết quả xét nghiệm. Chỉ bác sĩ mới có quyền xóa thông tin này.
              </div>
            </div>
            <button type="button" className="hr-btn-secondary" onClick={onCancel}>Đã hiểu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-modal-overlay" onClick={onCancel}>
      <div className="hr-modal hr-confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="hr-modal__body" style={{ padding: 'var(--spacing-xl)' }}>
          <div className="hr-confirm-dialog__icon hr-confirm-dialog__icon--danger">🗑️</div>
          <div className="hr-confirm-dialog__text">
            <div className="hr-confirm-dialog__title">Xóa dị ứng "{item.name}"?</div>
            <div className="hr-confirm-dialog__desc">
              Hành động này sẽ xóa thông tin dị ứng khỏi hồ sơ của bạn.
            </div>
            {isDoctorConfirmed ? (
              <div className="hr-confirm-dialog__desc--warning">
                ⚠️ Dị ứng này đã được <strong>bác sĩ xác nhận</strong>. Thay đổi này sẽ ảnh hưởng đến cảnh báo kê đơn.
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
            <button type="button" className="hr-btn-secondary" onClick={onCancel}>Hủy bỏ</button>
            <button type="button" className="hr-btn-danger" onClick={onConfirm}>Xác nhận xóa</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UPDATE METRICS MODAL — Simplified: Height + Weight + Blood Type
   ══════════════════════════════════════════════════════════════ */
function UpdateMetricsModal({
  metrics, onSave, onClose,
}: {
  metrics: HealthMetrics;
  onSave: (data: MetricUpdateFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MetricUpdateFormData>({
    height: metrics.vitals.height?.value || '',
    weight: metrics.vitals.weight?.value || '',
    bloodType: metrics.basicInfo.bloodType || '',
  });

  const previewBMI = form.height && form.weight
    ? calculateBMI(parseFloat(form.height), parseFloat(form.weight))
    : null;
  const previewBMIInfo = previewBMI ? getBMICategory(previewBMI) : null;

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="hr-modal-overlay" onClick={onClose}>
      <div className="hr-modal" onClick={e => e.stopPropagation()}>
        <div className="hr-modal__header">
          <h3 className="hr-modal__title">📝 Cập nhật chỉ số cơ thể</h3>
          <button type="button" className="hr-modal__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="hr-modal__body">
          <div className="hr-update-form-grid">
            <div className="hr-form-group">
              <label className="hr-form-label">Chiều cao (cm)</label>
              <input
                className="hr-form-input"
                type="number"
                placeholder="VD: 172"
                value={form.height}
                onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
              />
            </div>
            <div className="hr-form-group">
              <label className="hr-form-label">Cân nặng (kg)</label>
              <input
                className="hr-form-input"
                type="number"
                placeholder="VD: 68"
                value={form.weight}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
              />
            </div>
          </div>

          {/* Blood Type */}
          <div className="hr-form-group" style={{ marginTop: 'var(--spacing-sm)' }}>
            <label className="hr-form-label">Nhóm máu</label>
            <select
              className="hr-form-select"
              value={form.bloodType}
              onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
            >
              <option value="">— Chọn nhóm máu —</option>
              {bloodTypeOptions.map(bt => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
            <span className="hr-form-hint">Thông tin nhóm máu rất quan trọng trong trường hợp cấp cứu.</span>
          </div>

          {/* BMI Preview */}
          {previewBMI && previewBMIInfo ? (
            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
            }}>
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>BMI DỰ KIẾN</span>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{previewBMI}</div>
              </div>
              <span className={`bmi-badge ${previewBMIInfo.colorClass}`}>{previewBMIInfo.label}</span>
            </div>
          ) : null}
        </div>
        <div className="hr-modal__footer">
          <button type="button" className="hr-btn-secondary" onClick={onClose}>Hủy</button>
          <button type="button" className="hr-btn-primary" onClick={handleSubmit}>
            Lưu chỉ số
          </button>
        </div>
      </div>
    </div>
  );
}
