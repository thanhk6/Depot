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
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    fillHex: '#10B981',
    strokeHex: '#059669',
    labelVi: 'Available (Sẵn Sàng)',
    badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800'
  },
  IN_YARD: {
    bg: 'bg-sky-500/20',
    border: 'border-sky-500/50',
    text: 'text-sky-400',
    fillHex: '#0284C7',
    strokeHex: '#0369A1',
    labelVi: 'In Yard (Lưu Bãi)',
    badgeBg: 'bg-sky-950 text-sky-300 border-sky-800'
  },
  REPAIR: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    fillHex: '#F59E0B',
    strokeHex: '#D97706',
    labelVi: 'Repair (Sửa Chữa)',
    badgeBg: 'bg-amber-950 text-amber-300 border-amber-800'
  },
  CLEANING: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    fillHex: '#EA580C',
    strokeHex: '#C2410C',
    labelVi: 'Cleaning (Vệ Sinh)',
    badgeBg: 'bg-orange-950 text-orange-300 border-orange-800'
  },
  HOLD: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    fillHex: '#EF4444',
    strokeHex: '#DC2626',
    labelVi: 'Hold (Tạm Giữ)',
    badgeBg: 'bg-rose-950 text-rose-300 border-rose-800'
  },
  RESERVED: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    fillHex: '#8B5CF6',
    strokeHex: '#7C3AED',
    labelVi: 'Reserved (Đặt Chỗ)',
    badgeBg: 'bg-purple-950 text-purple-300 border-purple-800'
  },
  EMPTY_SLOT: {
    bg: 'bg-slate-800/40',
    border: 'border-slate-700/60',
    text: 'text-slate-500',
    fillHex: '#1E293B',
    strokeHex: '#334155',
    labelVi: 'Empty (Vị Trí Trống)',
    badgeBg: 'bg-slate-900 text-slate-400 border-slate-700'
  },
  WAITING_GATE_IN: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    fillHex: '#3B82F6',
    strokeHex: '#2563EB',
    labelVi: 'Chờ Gate-In',
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-800'
  },
  WAITING_GATE_OUT: {
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/50',
    text: 'text-indigo-400',
    fillHex: '#6366F1',
    strokeHex: '#4F46E5',
    labelVi: 'Chờ Gate-Out',
    badgeBg: 'bg-indigo-950 text-indigo-300 border-indigo-800'
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
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    fillHex: '#1E1B4B',
    strokeHex: '#4338CA'
  },
  REPAIR: {
    nameVi: 'Khu Vực Sửa Chữa (Repair Area)',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    fillHex: '#451A03',
    strokeHex: '#D97706'
  },
  CLEANING: {
    nameVi: 'Khu Vực Vệ Sinh (Cleaning Area)',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    fillHex: '#431407',
    strokeHex: '#EA580C'
  },
  HOLD: {
    nameVi: 'Khu Vực Tạm Giữ (Hold Area)',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    fillHex: '#4C0519',
    strokeHex: '#E11D48'
  },
  INSPECTION: {
    nameVi: 'Khu Vực Giám Định (Inspection Area)',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    fillHex: '#042F2E',
    strokeHex: '#0D9488'
  },
  STAGING: {
    nameVi: 'Khu Chờ Cấp Vỏ (Staging Area)',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    fillHex: '#083344',
    strokeHex: '#0891B2'
  },
  GATE_IN: {
    nameVi: 'Cổng Vào (Gate-In Lanes)',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    fillHex: '#172554',
    strokeHex: '#2563EB'
  },
  GATE_OUT: {
    nameVi: 'Cổng Xuất (Gate-Out Lanes)',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    fillHex: '#064E3B',
    strokeHex: '#059669'
  },
  FORKLIFT_AREA: {
    nameVi: 'Bãi Đậu Xe Nâng (Forklift Parking)',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/40',
    fillHex: '#422006',
    strokeHex: '#CA8A04'
  },
  OFFICE: {
    nameVi: 'Tòa Nhà Điều Hành Depot',
    color: 'text-slate-400',
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
