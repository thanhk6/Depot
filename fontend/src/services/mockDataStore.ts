
export interface ContainerRecord {
  id: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  // Rỗng = chưa có phiếu giám định (không coi là AV).
  condition?: 'AV' | 'CL' | 'DM';
  /** Đã thu tiền phiếu dịch vụ (bảng Payment = PAID) — điều kiện để chuyển sang lập báo giá. */
  paymentStatus?: 'PAID' | 'UNPAID';
  status: string; // GATE_IN, SURVEYING, WAITING_PAYMENT, PAYMENT_SUCCESS, WAITING_FORKLIFT, IN_YARD, WAITING_ESTIMATE, WAITING_APPROVAL, APPROVED, REPAIRING, WAITING_QC, READY_FOR_USE, GATE_OUT
  licensePlate?: string;
  driverName?: string;
  driverPhone?: string;
  gateInDate: string;
  gateOutDate?: string;
  yardLocation?: {
    block: string;
    bay: string;
    row: string;
    tier: string;
  };
  surveyDetails?: {
    surveyorName: string;
    surveyDate: string;
    damages: {
      code: string;
      location: string;
      description: string;
      severity: string;
      image: string;
    }[];
  };
  tariffDetails?: {
    liftFee: number;
    storageFee: number;
    cleaningFee: number;
    total: number;
    paymentStatus: 'UNPAID' | 'PAID';
    paymentMethod?: string;
    transactionId?: string;
  };
  estimateDetails?: {
    estimateNo: string;
    createdAt: string;
    labourHours: number;
    labourCost: number;
    materialCost: number;
    totalCost: number;
    approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED';
    rejectReason?: string;
    confirmedAt?: string;
    confirmedBy?: string;
    approvedAt?: string;
    approvedBy?: string;
    carrierWorkOrderNo?: string;
    carrierAuthCode?: string;
    approvedAmount?: number;
    /** Dòng sửa chữa của báo giá (AEMS) — Lệnh sửa chữa lấy đúng các dòng này sau khi hãng tàu duyệt. */
    items?: {
      damageCode: string;
      repairCode: string;
      description: string;
      locationCode: string;
      locationName: string;
      tpi: string;
      quantity: number;
      manHoursPerPiece: number;
    }[];
  };
  workOrderDetails?: {
    workOrderNo: string;
    technician: string;
    assignedAt: string;
    materialsIssued: { name: string; qty: number; unit: string }[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  };
  qcDetails?: {
    inspector: string;
    inspectedAt: string;
    lightTestPass: boolean;
    waterTightPass: boolean;
    structurePass: boolean;
    result: 'PASS' | 'FAIL';
    comments?: string;
  };
  timeline: {
    status: string;
    time: string;
    actor: string;
    note: string;
  }[];
  // Trạng thái khoá "nhận lệnh xe nâng" đọc thật từ backend (DepotJob.ForkliftClaimed*) — trước đây
  // ForkliftPage tự quản lý claim/progress hoàn toàn cục bộ trên trình duyệt (state React riêng từng
  // tablet), khiến 2 tài xế trên 2 tablet khác nhau có thể cùng nhận và cùng di chuyển 1 container mà
  // hệ thống không hề hay biết. undefined = chưa ai nhận (đang chờ trong hàng đợi).
  forkliftClaim?: {
    operatorId: string;
    operatorName: string;
    vehicleCode?: string;
    claimedAt: string;
    startedAt?: string;
  };
}
