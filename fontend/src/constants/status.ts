export interface StatusConfig {
  code: string;
  label: string;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  description: string;
}

export const CONTAINER_CONDITIONS = {
  AV: {
    code: 'AV',
    label: 'Available (Sẵn sàng)',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    description: 'Vỏ cont sạch, đạt tiêu chuẩn cấp trả'
  },
  CL: {
    code: 'CL',
    label: 'Cleaning Required (Cần vệ sinh)',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    description: 'Vỏ cont dơ/mùi, cần rửa nước/hóa chất'
  },
  DM: {
    code: 'DM',
    label: 'Damaged (Hư hỏng)',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    description: 'Hư hỏng cấu trúc/sàn, cần lập báo giá EMR'
  }
} as const;

export const LIFECYCLE_STATUSES: Record<string, StatusConfig> = {
  GATE_IN: {
    code: 'GATE_IN',
    label: 'Cổng Vào (Gate In)',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-400',
    description: 'Xe container đã Check-in tại cổng'
  },
  SURVEYING: {
    code: 'SURVEYING',
    label: 'Đang Giám Định',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-400',
    description: 'Giám định viên đang kiểm tra IICL'
  },
  WAITING_PAYMENT: {
    code: 'WAITING_PAYMENT',
    label: 'Chờ Thanh Toán VietQR',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    description: 'Đã phát sinh cước nâng hạ/lưu bãi'
  },
  PAYMENT_SUCCESS: {
    code: 'PAYMENT_SUCCESS',
    label: 'Đã Thanh Toán',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    description: 'Đã nhận chuyển khoản VietQR'
  },
  WAITING_FORKLIFT: {
    code: 'WAITING_FORKLIFT',
    label: 'Chờ Xe Nâng',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-400',
    description: 'Lệnh điều bãi đã chuyển sang tài xế'
  },
  IN_YARD: {
    code: 'IN_YARD',
    label: 'Đã Lưu Bãi',
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    bgClass: 'bg-teal-500',
    textClass: 'text-teal-400',
    description: 'Container nằm đúng Block/Bay/Row/Tier'
  },
  WAITING_ESTIMATE: {
    code: 'WAITING_ESTIMATE',
    label: 'Chờ Lập Báo Giá',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-400',
    description: 'Cont DM chờ Chuyên viên EMR báo giá'
  },
  WAITING_APPROVAL: {
    code: 'WAITING_APPROVAL',
    label: 'Chờ Hãng Tàu Duyệt',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    bgClass: 'bg-indigo-500',
    textClass: 'text-indigo-400',
    description: 'Báo giá đã gửi đại diện Shipping Line'
  },
  APPROVED: {
    code: 'APPROVED',
    label: 'Đã Phê Duyệt',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    description: 'Hãng tàu đã duyệt chi phí sửa chữa'
  },
  REPAIRING: {
    code: 'REPAIRING',
    label: 'Đang Sửa Chữa',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-400',
    description: 'Thợ gạt hàn / thay sàn đang thi công'
  },
  WAITING_QC: {
    code: 'WAITING_QC',
    label: 'Chờ QC Nghiệm Thu',
    badgeClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    bgClass: 'bg-fuchsia-500',
    textClass: 'text-fuchsia-400',
    description: 'Chờ Kỹ sư QC kiểm tra ánh sáng & kín nước'
  },
  QC_FAILED: {
    code: 'QC_FAILED',
    label: 'QC Không Đạt',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-400',
    description: 'Yêu cầu thợ làm lại mối hàn / màu sơn'
  },
  READY_FOR_USE: {
    code: 'READY_FOR_USE',
    label: 'Sẵn Sàng Cấp Trả (AV)',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
    description: 'Vỏ hoàn hảo, đã lưu vào kho AV'
  },
  GATE_OUT: {
    code: 'GATE_OUT',
    label: 'Đã Xuất Cổng (Gate Out)',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    bgClass: 'bg-slate-500',
    textClass: 'text-slate-400',
    description: 'Container đã rời khỏi bãi Depot'
  }
};
