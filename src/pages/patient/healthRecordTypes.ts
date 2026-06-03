/* ══════════════════════════════════════════════════════════
   HEALTH RECORDS MODULE — TYPE DEFINITIONS
   ══════════════════════════════════════════════════════════ */

/* ── Metric Types ── */

/** Who entered this data */
export type MetricSource = 'patient' | 'doctor' | 'lab';

/** A single historical metric entry */
export interface MetricEntry {
  id: string;
  value: string;
  date: string;
  source: MetricSource;
  sourceName?: string; // e.g. "PGS.TS. Lê Minh Tuấn"
}

/** Basic patient info (mostly readonly from account) */
export interface PatientBasicInfo {
  fullName: string;
  dateOfBirth: string; // DD/MM/YYYY
  age: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  bloodType: string | null; // e.g. "O+", null if unknown
  nationalId: string;
  patientCode?: string;
}

/** Measured vitals (editable, with history) */
export interface VitalMetrics {
  height: MetricEntry | null;     // cm
  weight: MetricEntry | null;     // kg
  bmi: number | null;             // auto-calculated
}

/** Combined health metrics */
export interface HealthMetrics {
  basicInfo: PatientBasicInfo;
  vitals: VitalMetrics;
}

/** BMI classification */
export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMICategoryInfo {
  category: BMICategory;
  label: string;
  colorClass: string;
  bgClass: string;
}

/* ── Chronic Conditions ── */

export interface ChronicCondition {
  id: string;
  name: string;
  diagnosedDate?: string;
}

/* ── Allergy Types ── */

export type AllergySeverity = 'severe' | 'moderate' | 'mild';

export type AllergyType =
  | 'Kháng sinh'
  | 'Thuốc giảm đau / hạ sốt'
  | 'Thực phẩm'
  | 'Môi trường (phấn hoa, bụi...)'
  | 'Khác';

export type AllergySourceType = 'self-reported' | 'doctor-confirmed' | 'lab-result';

export interface AllergyItem {
  id: string;
  name: string;
  type: AllergyType;
  severity: AllergySeverity;
  reaction: string;
  source: AllergySourceType;
  sourceName?: string;      // e.g. "PGS.TS. Lê Minh Tuấn"
  confirmedDate: string;    // DD/MM/YYYY
}

/** Form state for add/edit allergy modal */
export interface AllergyFormData {
  name: string;
  type: AllergyType;
  severity: AllergySeverity | null;
  reaction: string;
  source: AllergySourceType;
}

/** Validation errors for allergy form */
export interface AllergyFormErrors {
  name?: string;
  severity?: string;
}

/* ── Metric Update Form ── */

export interface MetricUpdateFormData {
  height: string;
  weight: string;
  bloodType: string;
}

/* ── Audit Trail (Doctor Side) ── */

export interface AuditLogEntry {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  drugName: string;
  allergyName: string;
  alertLevel: AllergySeverity;
  overrideReason: string;
  timestamp: string;
}

/* ── Metric key type for history modal ── */
export type MetricKey = 'height' | 'weight';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  icon: string;
}
