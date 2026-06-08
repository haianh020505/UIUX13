/* ══════════════════════════════════════════════════════════
   HEALTH RECORDS MODULE — MOCK DATA
   ══════════════════════════════════════════════════════════ */

import type {
  HealthMetrics,
  AllergyItem,
  ChronicCondition,
  MetricEntry,
  MetricKey,
  MetricConfig,
  BMICategoryInfo,
  AllergyType,
} from './healthRecordTypes';

/* ── Patient Health Metrics ── */
export const mockHealthMetrics: HealthMetrics = {
  basicInfo: {
    fullName: 'Lê Nguyễn Công Minh',
    dateOfBirth: '15/03/1990',
    age: 36,
    gender: 'Nam',
    bloodType: 'O+',
    nationalId: '001090012345',
    patientCode: 'BN-2024-00158',
  },
  vitals: {
    height: {
      id: 'h-1',
      value: '172',
      date: '10/04/2026',
      source: 'doctor',
      sourceName: 'PGS.TS. Lê Minh Tuấn',
    },
    weight: {
      id: 'w-1',
      value: '68',
      date: '20/05/2026',
      source: 'patient',
    },
    bmi: 23.0,
  },
};

/* ── Metric History ── */
export const mockMetricHistory: Record<MetricKey, MetricEntry[]> = {
  height: [
    { id: 'h-1', value: '172', date: '10/04/2026', source: 'doctor', sourceName: 'PGS.TS. Lê Minh Tuấn' },
    { id: 'h-2', value: '172', date: '15/06/2025', source: 'patient' },
  ],
  weight: [
    { id: 'w-1', value: '68', date: '20/05/2026', source: 'patient' },
    { id: 'w-2', value: '70', date: '10/04/2026', source: 'doctor', sourceName: 'PGS.TS. Lê Minh Tuấn' },
    { id: 'w-3', value: '72', date: '15/01/2026', source: 'patient' },
    { id: 'w-4', value: '71', date: '20/10/2025', source: 'patient' },
    { id: 'w-5', value: '69', date: '15/06/2025', source: 'lab', sourceName: 'Lab kết quả khám tổng quát' },
  ],
};

/* ── Allergy Data (only patient self-reported) ── */
export const mockAllergies: AllergyItem[] = [
  {
    id: 'allergy-1',
    name: 'Hải sản (tôm, cua)',
    type: 'Thực phẩm',
    severity: 'moderate',
    reaction: 'Nổi mẩn đỏ, ngứa toàn thân, khó thở nhẹ',
    source: 'self-reported',
    confirmedDate: '15/06/2024',
  },
  {
    id: 'allergy-2',
    name: 'Phấn hoa',
    type: 'Môi trường (phấn hoa, bụi...)',
    severity: 'mild',
    reaction: 'Hắt hơi, chảy nước mũi, ngứa mắt',
    source: 'self-reported',
    confirmedDate: '20/03/2025',
  },
  {
    id: 'allergy-3',
    name: 'Đậu phộng',
    type: 'Thực phẩm',
    severity: 'severe',
    reaction: 'Sưng môi, khó thở nặng, cần dùng EpiPen',
    source: 'self-reported',
    confirmedDate: '05/01/2024',
  },
];

/* ── Chronic Conditions ── */
export const mockConditions: ChronicCondition[] = [];

/* ── Metric Card Configurations ── */
export const metricConfigs: MetricConfig[] = [
  { key: 'height', label: 'Chiều cao', unit: 'cm', icon: '' },
  { key: 'weight', label: 'Cân nặng', unit: 'kg', icon: '' },
];

/* ── BMI Category Thresholds ── */
export function getBMICategory(bmi: number): BMICategoryInfo {
  if (bmi < 18.5) {
    return { category: 'underweight', label: 'Thiếu cân', colorClass: 'bmi-badge--warning', bgClass: 'bmi-bg--warning' };
  }
  if (bmi < 25) {
    return { category: 'normal', label: 'Bình thường', colorClass: 'bmi-badge--success', bgClass: 'bmi-bg--success' };
  }
  if (bmi < 30) {
    return { category: 'overweight', label: 'Thừa cân', colorClass: 'bmi-badge--warning', bgClass: 'bmi-bg--warning' };
  }
  return { category: 'obese', label: 'Béo phì', colorClass: 'bmi-badge--danger', bgClass: 'bmi-bg--danger' };
}

/** Calculate BMI from height (cm) and weight (kg) */
export function calculateBMI(heightCm: number, weightKg: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/** Check if a date string (DD/MM/YYYY) is older than 6 months */
export function isMetricOutdated(dateStr: string): boolean {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return d < sixMonthsAgo;
}

/** Source display config */
export function getSourceLabel(source: string): { label: string; className: string } {
  switch (source) {
    case 'patient':
      return { label: 'Bệnh nhân tự nhập', className: 'source-badge--patient' };
    case 'doctor':
    case 'doctor-confirmed':
      return { label: 'Bác sĩ nhập', className: 'source-badge--doctor' };
    case 'lab':
    case 'lab-result':
      return { label: 'Lab trả về', className: 'source-badge--lab' };
    case 'self-reported':
      return { label: 'Tự khai báo', className: 'source-badge--patient' };
    default:
      return { label: source, className: 'source-badge--patient' };
  }
}

/** Severity display config */
export function getSeverityConfig(severity: string) {
  switch (severity) {
    case 'severe':
      return { label: 'Nghiêm trọng', icon: '', className: 'severity--severe' };
    case 'moderate':
      return { label: 'Trung bình', icon: '', className: 'severity--moderate' };
    case 'mild':
      return { label: 'Nhẹ', icon: '', className: 'severity--mild' };
    default:
      return { label: severity, icon: '', className: '' };
  }
}

/* ── Allergy autocomplete suggestions by type ── */
export const allergenSuggestionsByType: Record<AllergyType, string[]> = {
  'Kháng sinh': [
    'Penicillin',
    'Amoxicillin',
    'Cephalosporin',
    'Sulfonamide',
    'Tetracycline',
    'Ciprofloxacin',
  ],
  'Thuốc giảm đau / hạ sốt': [
    'Aspirin',
    'Ibuprofen',
    'Naproxen',
    'Paracetamol',
    'Diclofenac',
  ],
  'Thực phẩm': [
    'Hải sản (tôm, cua)',
    'Sữa bò',
    'Đậu phộng',
    'Trứng',
    'Gluten',
    'Đậu nành',
    'Hạt cây',
    'Cá',
  ],
  'Môi trường (phấn hoa, bụi...)': [
    'Phấn hoa',
    'Bụi nhà',
    'Lông mèo',
    'Lông chó',
    'Nấm mốc',
    'Mạt bụi',
  ],
  'Khác': [
    'Latex',
    'Nọc ong',
    'Niken',
    'Thuốc cản quang',
  ],
};

/* ── Condition suggestions ── */
export const commonConditions: string[] = [
  'Tiểu đường type 1',
  'Tiểu đường type 2',
  'Cao huyết áp',
  'Hen suyễn',
  'Bệnh tim mạch',
  'COPD',
  'Viêm gan B',
  'Viêm gan C',
  'Suy thận mạn',
  'Động kinh',
  'Gout',
  'Lupus',
  'Viêm khớp dạng thấp',
];

/* ── Blood type options ── */
export const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
