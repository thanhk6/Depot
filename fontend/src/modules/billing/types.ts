// MODULE CÔNG NỢ HÃNG TÀU – DEPOT CONTAINER (SHIPPING LINE ACCOUNTS RECEIVABLE)

export type DebtStatus = 
  | 'UNPAID'     // 🔴 Chưa thanh toán (RemainingAmount = TotalAmount)
  | 'PARTIAL'    // 🟡 Thanh toán một phần (0 < RemainingAmount < TotalAmount)
  | 'PAID'       // 🟢 Đã thanh toán (RemainingAmount = 0)
  | 'CANCELLED'; // ⚪ Đã hủy

export type PeriodStatus = 'OPEN' | 'CLOSED';

export type PaymentStatus = 'CONFIRMED' | 'REVERSED';

export type CurrencyType = 'VND' | 'USD';

/**
 * Entity: ShippingLineDebt
 * Lưu từng khoản công nợ chi tiết theo Container và Báo giá
 */
export interface ShippingLineDebt {
  id: string;
  shippingLineId: string;       // e.g. 'MAERSK', 'MSC', 'ONE', 'CMA CGM', 'COSCO', 'EVERGREEN'
  shippingLineName: string;
  containerId: string;          // Khóa ngoại tham chiếu Container hiện tại
  containerNo: string;          // Số Container (Lấy tự động từ Báo giá, KHÔNG nhập tay)
  quotationId: string;          // Khóa ngoại tham chiếu Báo giá đã duyệt
  quotationNo: string;          // e.g. 'BG-2026-00125' hoặc 'EST-20260816-00001'
  repairId: string;             // Khóa ngoại tham chiếu Sửa chữa / WorkOrder
  repairNo: string;             // e.g. 'WO-20260816-00001'
  invoiceId?: string;           // Khóa ngoại tham chiếu Hóa đơn (nếu đã xuất)
  invoiceNo?: string;           // Số Hóa đơn e.g. 'HD-2026-00125'
  debtPeriodId: string;         // Khóa ngoại tham chiếu Kỳ công nợ (DebtPeriod)
  debtDate: string;             // Ngày phát sinh nợ / ngày sửa chữa hoàn thành (YYYY-MM-DD)
  dueDate: string;              // Hạn thanh toán (Net 30 days)
  serviceType: 'REPAIR' | 'STORAGE' | 'HANDLING' | 'CLEANING' | 'PTI';
  description: string;          // Nội dung công việc sửa chữa / dịch vụ
  totalAmount: number;          // Tổng tiền phải thu (VNĐ hoặc USD)
  paidAmount: number;           // Số tiền đã thanh toán
  remainingAmount: number;      // Số tiền còn nợ = TotalAmount - PaidAmount
  status: DebtStatus;           // Trạng thái công nợ
  currency: CurrencyType;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  approvalRef?: string;         // Mã phê duyệt của hãng tàu (EDI Auth code)
}

/**
 * Entity: DebtPeriod
 * Quản lý công nợ theo từng kỳ đối soát
 */
export interface DebtPeriod {
  id: string;
  shippingLineId: string;
  shippingLineName: string;
  periodCode: string;           // e.g. '2026-08-01_2026-08-15'
  fromDate: string;
  toDate: string;
  openingBalance: number;       // Dư đầu kỳ (Lấy từ ClosingBalance kỳ trước)
  periodDebit: number;          // Công nợ phát sinh trong kỳ (+)
  periodCredit: number;         // Tiền đã thanh toán trong kỳ (-)
  closingBalance: number;       // Dư cuối kỳ = OpeningBalance + PeriodDebit - PeriodCredit
  status: PeriodStatus;         // 'OPEN' | 'CLOSED'
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
  currency: CurrencyType;
}

/**
 * Entity: Payment
 * Lưu thông tin thanh toán của hãng tàu
 */
export interface Payment {
  id: string;
  shippingLineId: string;
  shippingLineName: string;
  paymentDate: string;
  paymentAmount: number;
  currency: CurrencyType;
  paymentMethod: 'BANK_TRANSFER' | 'SWIFT' | 'CASH' | 'VIETQR' | 'CREDIT_CARD';
  bankName: string;
  referenceNo: string;          // Mã giao dịch / UNC / Swift Ref
  status: PaymentStatus;        // 'CONFIRMED' | 'REVERSED'
  notes?: string;
  recordedBy: string;
  createdAt: string;
  reversedBy?: string;
  reversedAt?: string;
  reversalReason?: string;
  allocations?: PaymentAllocation[];
}

/**
 * Entity: PaymentAllocation
 * Phân bổ một khoản thanh toán cho nhiều khoản công nợ / container
 */
export interface PaymentAllocation {
  id: string;
  paymentId: string;
  shippingLineDebtId: string;
  containerNo: string;
  quotationNo: string;
  allocatedAmount: number;
  currency: CurrencyType;
  createdAt: string;
}

/**
 * Báo cáo tổng hợp theo Hãng tàu
 */
export interface ShippingLineDebtSummary {
  shippingLineId: string;
  shippingLineName: string;
  logoText: string;
  containerCount: number;
  unpaidCount: number;
  partialCount: number;
  paidCount: number;
  openingBalance: number;
  periodDebit: number;
  periodCredit: number;
  closingBalance: number;
  overdueAmount: number;
  currency: CurrencyType;
}

/**
 * Phân tích tuổi nợ (Aging Report)
 */
export interface DebtAgingBucket {
  shippingLineId: string;
  shippingLineName: string;
  currency: CurrencyType;
  bucket0_30: number;
  bucket31_60: number;
  bucket61_90: number;
  bucketOver90: number;
  totalReceivable: number;
}
