// Tên bước + công đoạn cho nhật ký vòng đời container (JobAuditLog.Action) — hiển thị tiếng Việt thay cho mã kỹ thuật.
export type LifecycleStage = 'GATE' | 'SURVEY' | 'CLEANING' | 'OPERATION' | 'PAYMENT' | 'ESTIMATE' | 'REPAIR' | 'YARD' | 'OTHER';

const LABELS: Record<string, [string, LifecycleStage]> = {
  GATE_IN: ['Tiếp nhận cổng (Gate-In)', 'GATE'],
  GATE_OUT: ['Xuất cổng (Gate-Out)', 'GATE'],
  SURVEY_CLAIMED: ['Nhận giám định', 'SURVEY'],
  SURVEY_DRAFT_SAVED: ['Lưu nháp phiếu giám định', 'SURVEY'],
  SURVEY_SUBMITTED: ['Hoàn tất giám định', 'SURVEY'],
  CLEANING_RECEIVED: ['Tiếp nhận vệ sinh', 'CLEANING'],
  CLEANING_ITEM_DONE: ['Vệ sinh: xong hạng mục', 'CLEANING'],
  CLEANING_ITEM_UNDONE: ['Vệ sinh: bỏ đánh dấu hạng mục', 'CLEANING'],
  CLEANING_ALL_DONE: ['Vệ sinh: xong tất cả hạng mục', 'CLEANING'],
  CLEANING_ALL_UNDONE: ['Vệ sinh: bỏ đánh dấu tất cả', 'CLEANING'],
  CLEANING_EXECUTION_UPDATED: ['Vệ sinh: cập nhật thi công', 'CLEANING'],
  CLEANING_HANDOVER: ['Vệ sinh xong · bàn giao Khai thác', 'CLEANING'],
  CLEANING_CANCELLED: ['Đóng lệnh vệ sinh', 'CLEANING'],
  SERVICE_ORDER_CREATED: ['Khai thác lập phiếu dịch vụ', 'OPERATION'],
  SERVICE_ORDER_UPDATED: ['Khai thác sửa phiếu dịch vụ', 'OPERATION'],
  SERVICE_ORDER_CANCELLED: ['Khai thác huỷ phiếu dịch vụ', 'OPERATION'],
  PAYMENT_RECEIVED: ['Thu tiền', 'PAYMENT'],
  ESTIMATE_CREATED: ['Lập báo giá sửa chữa', 'ESTIMATE'],
  ESTIMATE_UPDATED: ['Sửa / bổ sung báo giá', 'ESTIMATE'],
  ESTIMATE_APPROVED: ['Hãng tàu duyệt báo giá', 'ESTIMATE'],
  ESTIMATE_REJECTED: ['Hãng tàu từ chối báo giá', 'ESTIMATE'],
  SHIPPING_SYNC_SENT: ['Gửi API hãng tàu', 'ESTIMATE'],
  REPAIR_ASSIGNED: ['Phân công sửa chữa', 'REPAIR'],
  REPAIR_STARTED: ['Bắt đầu sửa chữa', 'REPAIR'],
  REPAIR_COMPLETED: ['Hoàn tất sửa chữa', 'REPAIR'],
  QC_PASSED: ['QC đạt', 'REPAIR'],
  QC_FAILED: ['QC không đạt', 'REPAIR'],
  FORKLIFT_CLAIMED: ['Xe nâng nhận lệnh', 'YARD'],
  FORKLIFT_STARTED: ['Xe nâng bắt đầu di chuyển', 'YARD'],
  FORKLIFT_CLAIM_CANCELLED: ['Xe nâng huỷ nhận lệnh', 'YARD'],
  FORKLIFT_MOVE_COMPLETED: ['Xe nâng hạ bãi', 'YARD'],
  YARD_MOVE: ['Dời vị trí bãi', 'YARD'],
  YARD_MOVED: ['Dời vị trí bãi', 'YARD'],
  STATUS_UPDATED: ['Đổi trạng thái hồ sơ', 'OTHER'],
  DUPLICATE_REMOVED: ['Gộp hồ sơ trùng', 'OTHER']
};

export const STAGE_STYLE: Record<LifecycleStage, { label: string; dot: string; chip: string }> = {
  GATE: { label: 'Cổng', dot: 'bg-blue-600', chip: 'bg-blue-50 text-blue-700 border-blue-200' },
  SURVEY: { label: 'Giám định', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  CLEANING: { label: 'Vệ sinh', dot: 'bg-cyan-600', chip: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  OPERATION: { label: 'Khai thác', dot: 'bg-indigo-600', chip: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PAYMENT: { label: 'Thanh toán', dot: 'bg-emerald-600', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ESTIMATE: { label: 'Báo giá', dot: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700 border-orange-200' },
  REPAIR: { label: 'Sửa chữa / QC', dot: 'bg-rose-600', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
  YARD: { label: 'Bãi / Xe nâng', dot: 'bg-teal-600', chip: 'bg-teal-50 text-teal-700 border-teal-200' },
  OTHER: { label: 'Khác', dot: 'bg-slate-500', chip: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export const describeAuditAction = (action: string): { label: string; stage: LifecycleStage } => {
  const hit = LABELS[action];
  return hit ? { label: hit[0], stage: hit[1] } : { label: action, stage: 'OTHER' };
};
