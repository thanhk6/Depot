export type EstimateStatus =
  | 'DRAFT'
  | 'READY'
  | 'SENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ERROR';

export type MaerskApiStatus =
  | 'NOT_SENT'
  | 'SENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'RETRYING';

export interface CarrierApprovalInfo {
  status: 'APPROVED' | 'REJECTED' | 'REVISED';
  authCode?: string; // Mã phê duyệt hãng tàu (ví dụ: MSCU-AUTH-9812, MAEU-2026-OK)
  approvedAmount?: number; // Số tiền được hãng tàu duyệt (VND)
  approvedAt?: string;
  approvedBy?: string;
  rejectCode?: string; // Mã lý do từ chối (ví dụ: CEDEX_OVER_TARIFF, WEAR_AND_TEAR, LACK_PHOTOS)
  rejectReason?: string;
  comments?: string;
  suggestedAction?: string;
  /** Số Work Order / lệnh duyệt bên hãng tàu (vd AEMS). */
  workOrderNo?: string;
  /** Kênh nhận duyệt: EMAIL / AEMS / PHONE / DOCUMENT / API. */
  channel?: string;
  /** Nhân viên depot đã ghi nhận lệnh duyệt. */
  enteredBy?: string;
}

export interface RepairItem {
  id: string;
  damageLocationCode: string; // e.g. 'PAN' (Panel), 'ROF' (Roof), 'FLR' (Floor), 'DOR' (Door), 'UFR' (Underframe)
  damageLocationName: string;
  damageCode: string;         // e.g. 'DT' (Dent), 'HO' (Hole), 'CR' (Crack), 'CO' (Corroded), 'BW' (Bowed), 'BR' (Broken)
  damageName: string;
  repairCode: string;         // e.g. 'P' (Patch), 'SN' (Straighten), 'R' (Replace), 'W' (Weld), 'CL' (Clean)
  repairMethod: string;
  description: string;
  quantity: number;
  unit: 'M2' | 'M' | 'Tấm' | 'Cái' | 'Giờ' | 'Bộ' | 'Lần';
  unitPrice: number;          // in VND
  amount: number;             // quantity * unitPrice
  vatRate: number;            // e.g. 0.08 or 0.10
  vatAmount: number;
  totalAmount: number;
  photoUrls?: string[];
  cedexCode?: string;         // e.g. 'PAN-DT-P'
  /** AEMS: bên chịu chi phí — O (Owner) / U (User) / T (Third Party) / W (Wear and Tear). */
  tpi?: string;
  /** AEMS: giờ công cho mỗi PC. unitPrice = vật tư / PC, amount = PCS × vật tư / PC. */
  manHoursPerPiece?: number;
  /** Id lỗi giám định (DamageItem) mà dòng này được lấy sang — chỉ dùng trên form để đánh dấu "đã lấy". */
  sourceDamageId?: number;
}

export interface EstimateApiTransaction {
  id: string;
  attemptNo: number;
  timestamp: string;
  requestId: string;
  transactionId: string;
  endpoint: string;
  httpMethod: 'POST' | 'PUT';
  httpStatusCode: number;
  requestHeaders: Record<string, string>;
  requestPayload: any;
  responseHeaders: Record<string, string>;
  responsePayload: any;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  maerskReferenceNo?: string;
  errorMessage?: string;
  errorCode?: string;
  latencyMs: number;
  operator: string;
}

export interface MaerskApiResponse {
  httpStatusCode: number;
  referenceNo: string;
  requestId: string;
  transactionId: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ERROR';
  message: string;
  rawResponse: any;
  validationWarnings?: string[];
}

export interface Estimate {
  id: string;
  estimateNo: string; // e.g. 'EST-20260816-00001'
  containerId: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  condition: 'CL' | 'DM';

  // Personnel & Timing
  createdBy: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  /** AEMS: đơn giá giờ công, tổng giờ công, tiền công, tiền vật tư, Mode, Cause. */
  laborRate?: number;
  totalManHours?: number;
  laborCost?: number;
  materialCost?: number;
  repairMode?: string;
  cause?: string;
  /** AEMS: Shop Code, Vendor Ref No., giờ chuẩn bị, phân bổ giờ thường / OT1 / OT2 / OT3. */
  shopCode?: string;
  vendorRefNo?: string;
  preparationHours?: number;
  ordinaryHours?: number;
  ot1Hours?: number;
  ot2Hours?: number;
  ot3Hours?: number;
  /** Người báo giá đã xác nhận (chốt) báo giá — chờ hãng tàu duyệt. Sửa báo giá thì phải xác nhận lại. */
  confirmedAt?: string;
  confirmedBy?: string;

  // Repair content
  repairSummary: string;
  items: RepairItem[];

  // Cost breakdown
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: 'VND' | 'USD';
  exchangeRate?: number; // VND to USD if applicable

  // Statuses
  status: EstimateStatus;

  // Inspection & Survey
  surveyReference?: string;
  inspectionPhotos: string[];
  notes?: string;

  // Carrier Approval Decision (Approved or Rejected)
  carrierApproval?: CarrierApprovalInfo;

  // Maersk API Integration Data
  lastApiStatus?: MaerskApiStatus;
  lastApiResponse?: MaerskApiResponse;
  apiTransactionHistory: EstimateApiTransaction[];
}

