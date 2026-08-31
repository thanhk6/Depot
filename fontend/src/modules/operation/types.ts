export type ServiceCategory =
  | 'LOLO'
  | 'STORAGE'
  | 'CLEANING'
  | 'REEFER_POWER'
  | 'PTI'
  | 'YARD_SHIFT'
  | 'CUSTOMS'
  | 'EXTRA'
  | 'OTHER';

export interface ServiceOrderItem {
  id: string;
  serviceCode: string;
  serviceName: string;
  category: ServiceCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatPercent: number;
  amount: number; // quantity * unitPrice
  vatAmount: number; // amount * (vatPercent / 100)
  total: number; // amount + vatAmount
  remarks?: string;
}

export type PaymentStatus = 'UNPAID' | 'PAID' | 'CANCELLED';
export type ServiceOrderStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export interface ServiceOrder {
  id: string;
  orderNo: string; // e.g. SO-20260814-001
  containerId?: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  customerName: string; // Tên khách hàng / Chủ hàng / Đơn vị vận tải
  customerTaxCode?: string;
  driverName: string;
  truckPlate: string;
  driverPhone?: string;
  gateInDate: string;
  createdAt: string;
  createdBy: string;
  // Field phẳng khớp thẳng entity ServiceOrder thật ở backend (Entity=ViewModel, không bọc DTO lồng nhau)
  // — đây là nguồn dữ liệu thật lưu xuống SQL Server. `surveyRef`/`cleaningRef` bên dưới giữ lại cho các
  // field hiển thị tiện lợi khác (surveyor, grade, damagesCount...) hiện chỉ có ở local state lúc tạo
  // phiếu, chưa persist xuống backend.
  condition?: 'AV' | 'CL' | 'DM';
  surveyNote?: string;
  cleaningNote?: string;
  surveyRef?: {
    surveyNo?: string;
    eeirNo?: string;
    condition: 'AV' | 'CL' | 'DM';
    surveyor?: string;
    surveyorName?: string;
    surveyDate?: string;
    grade?: string;
    damagesCount?: number;
    cleaningRequired?: boolean;
    cleaningType?: string;
    surveyNote?: string;
  };
  cleaningRef?: {
    cleaningExecutionNo?: string;
    cleaningStatus?: 'PENDING' | 'IN_CLEANING' | 'COMPLETED' | 'INSPECTED_PASS' | 'NOT_REQUIRED';
    cleaningType?: string;
    chemicalUsed?: string;
    cleaningCost?: number;
    completedBy?: string;
    completedAt?: string;
    notes?: string;
  };
  items: ServiceOrderItem[];
  subtotal: number; // Tổng tiền trước thuế
  totalVat: number; // Tổng thuế VAT
  grandTotal: number; // Tổng tiền thanh toán
  paymentStatus: PaymentStatus;
  paymentMethod?: 'VIETQR' | 'CASH' | 'BANK_TRANSFER' | 'CREDIT_ACCOUNT';
  paidAt?: string;
  transactionId?: string;
  qrPayload: string;
  qrImageUrl: string;
  notes?: string;
  status: ServiceOrderStatus;
}
