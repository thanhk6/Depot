import { ContainerStatus, HoldReason, ZoneType } from '../types/yardTypes';

export const STATUS_COLORS: Record<
  ContainerStatus,
  {
    bg: string;
    border: string;
    text: string;
    fillHex: string;
    strokeHex: string;
    labelVi: string;
    badgeBg: string;
  }
> = {
  AVAILABLE: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    fillHex: '#10B981',
    strokeHex: '#059669',
    labelVi: 'Available (Sẵn Sàng)',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  IN_YARD: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-600',
    fillHex: '#0284C7',
    strokeHex: '#0369A1',
    labelVi: 'In Yard (Lưu Bãi)',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  REPAIR: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    fillHex: '#F59E0B',
    strokeHex: '#D97706',
    labelVi: 'Repair (Sửa Chữa)',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  CLEANING: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    fillHex: '#EA580C',
    strokeHex: '#C2410C',
    labelVi: 'Cleaning (Vệ Sinh)',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  HOLD: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    fillHex: '#EF4444',
    strokeHex: '#DC2626',
    labelVi: 'Hold (Tạm Giữ)',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  RESERVED: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    fillHex: '#8B5CF6',
    strokeHex: '#7C3AED',
    labelVi: 'Reserved (Đặt Chỗ)',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  EMPTY_SLOT: {
    bg: 'bg-slate-100',
    border: 'border-slate-200/60',
    text: 'text-slate-500',
    fillHex: '#1E293B',
    strokeHex: '#334155',
    labelVi: 'Empty (Vị Trí Trống)',
    badgeBg: 'bg-white text-slate-500 border-slate-200'
  },
  WAITING_GATE_IN: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    fillHex: '#3B82F6',
    strokeHex: '#2563EB',
    labelVi: 'Chờ Gate-In',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  WAITING_GATE_OUT: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    fillHex: '#6366F1',
    strokeHex: '#4F46E5',
    labelVi: 'Chờ Gate-Out',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  GATE_OUT_COMPLETED: {
    bg: 'bg-zinc-500/20',
    border: 'border-zinc-500/50',
    text: 'text-zinc-400',
    fillHex: '#71717A',
    strokeHex: '#52525B',
    labelVi: 'Đã Xuất Bãi',
    badgeBg: 'bg-zinc-950 text-zinc-300 border-zinc-800'
  }
};

export const HOLD_REASON_LABELS: Record<HoldReason, { labelVi: string; desc: string }> = {
  CUSTOMS_HOLD: {
    labelVi: 'Customs Hold (Hải Quan Giữ)',
    desc: 'Container đang bị niêm phong hải quan hoặc chờ kiểm hóa chuyên ngành'
  },
  DOCUMENT_HOLD: {
    labelVi: 'Document Hold (Thiếu Chứng Từ)',
    desc: 'Chưa có lệnh giao vỏ D/O hoặc lệnh hạ bãi hợp lệ'
  },
  DAMAGE_HOLD: {
    labelVi: 'Damage Hold (Hư Hỏng Nặng)',
    desc: 'Thủng vách hoặc biến dạng góc đúc không an toàn xếp tầng'
  },
  PAYMENT_HOLD: {
    labelVi: 'Payment Hold (Nợ Cước / Phí)',
    desc: 'Chưa hoàn tất thanh toán phí nâng hạ hoặc phí lưu bãi quá hạn'
  },
  OTHER_HOLD: {
    labelVi: 'Other Hold (Khác)',
    desc: 'Yêu cầu tạm giữ từ hãng tàu hoặc ban giám đốc depot'
  }
};

export const ZONE_TYPE_CONFIG: Record<
  ZoneType,
  {
    nameVi: string;
    color: string;
    borderColor: string;
    fillHex: string;
    strokeHex: string;
  }
> = {
  STORAGE: {
    nameVi: 'Khu Vực Lưu Bãi (Storage Block)',
    color: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    fillHex: '#1E1B4B',
    strokeHex: '#4338CA'
  },
  REPAIR: {
    nameVi: 'Khu Vực Sửa Chữa (Repair Area)',
    color: 'text-amber-600',
    borderColor: 'border-amber-200',
    fillHex: '#451A03',
    strokeHex: '#D97706'
  },
  CLEANING: {
    nameVi: 'Khu Vực Vệ Sinh (Cleaning Area)',
    color: 'text-orange-600',
    borderColor: 'border-orange-200',
    fillHex: '#431407',
    strokeHex: '#EA580C'
  },
  HOLD: {
    nameVi: 'Khu Vực Tạm Giữ (Hold Area)',
    color: 'text-rose-600',
    borderColor: 'border-rose-200',
    fillHex: '#4C0519',
    strokeHex: '#E11D48'
  },
  INSPECTION: {
    nameVi: 'Khu Vực Giám Định (Inspection Area)',
    color: 'text-teal-600',
    borderColor: 'border-teal-200',
    fillHex: '#042F2E',
    strokeHex: '#0D9488'
  },
  STAGING: {
    nameVi: 'Khu Chờ Cấp Vỏ (Staging Area)',
    color: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    fillHex: '#083344',
    strokeHex: '#0891B2'
  },
  GATE_IN: {
    nameVi: 'Cổng Vào (Gate-In Lanes)',
    color: 'text-blue-600',
    borderColor: 'border-blue-200',
    fillHex: '#172554',
    strokeHex: '#2563EB'
  },
  GATE_OUT: {
    nameVi: 'Cổng Xuất (Gate-Out Lanes)',
    color: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    fillHex: '#064E3B',
    strokeHex: '#059669'
  },
  FORKLIFT_AREA: {
    nameVi: 'Bãi Đậu Xe Nâng (Forklift Parking)',
    color: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    fillHex: '#422006',
    strokeHex: '#CA8A04'
  },
  OFFICE: {
    nameVi: 'Tòa Nhà Điều Hành Depot',
    color: 'text-slate-500',
    borderColor: 'border-slate-500/40',
    fillHex: '#0F172A',
    strokeHex: '#475569'
  }
};

export const DEFAULT_CANVAS_WIDTH = 2200;
export const DEFAULT_CANVAS_HEIGHT = 1400;

export const CELL_WIDTH = 48;
export const CELL_HEIGHT = 30;
export const CELL_GAP = 4;
export const BAY_LABEL_HEIGHT = 20;
export const ROW_LABEL_WIDTH = 24;
