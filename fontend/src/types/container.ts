import { JobStatus, ContainerGrade, ISOSize } from '../constants/enums';

export type { JobStatus, ContainerGrade, ISOSize };

export interface YardLocation {
  block: string;      // Mã block
  bay: number;        // Dãy
  row: number;        // Hàng
  tier: number;       // Tầng
}

export interface DamageItem {
  id: string;                         // Mã hạng mục hư hỏng
  componentCode: string;              // Mã bộ phận
  componentNameVi: string;            // Tên bộ phận tiếng Việt
  damageTypeCode: string;             // Mã kiểu hư hỏng
  damageTypeNameVi: string;           // Tên kiểu hư hỏng tiếng Việt
  locationCode: string;               // Mã vị trí
  lengthCm: number;                   // Chiều dài (cm)
  widthCm: number;                    // Chiều rộng (cm)
  quantity: number;                   // Số lượng
  unit: string;                       // Đơn vị
  responsibility: 'SHIPPING_LINE' | 'CONSIGNEE' | 'DEPOT'; // Trách nhiệm
  estimatedHours: number;            // Số giờ ước tính
  materialCostVnd: number;           // Chi phí vật tư
  laborCostVnd: number;               // Chi phí nhân công
  totalCostVnd: number;               // Tổng chi phí
  photoUrl?: string;                  // Ảnh minh chứng
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPAIRED'; // Trạng thái
}

export interface PhotoRecord {
  id: string;            // Mã ảnh
  url: string;           // Đường dẫn ảnh
  description: string;   // Mô tả ảnh
  timestamp: string;     // Thời điểm chụp
  angleVi: string;       // Góc chụp tiếng Việt
}

export interface SurveyDamagePayload {
  component: string;
  locationCode: string;
  damageCode: string;
  repairCode: string;
  quantity: number;
  unit: string;
  laborHours: number;
  laborRate: number;
  materialCost: number;
  severity: string;
  notes?: string;
  lengthMm?: number;
  widthMm?: number;
  photoUrl?: string;
}

export interface SurveyCleaningItemPayload {
  cleaningCode: string;
  cleaningName: string;
  category: string;
  chemicalRequired: boolean;
  chemicalName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  responsibleParty: string;
  status: string;
  notes?: string;
  washerName?: string;
}

export interface SurveyChecklistItemPayload {
  zoneKey: string;
  zoneName: string;
  status: string;
  notes?: string;
  damageCount: number;
}

export interface SurveyPhotoPayload {
  url: string;
  type: string;
  caption: string;
  surveyorName: string;
  uploadedAt: string;
  fileSizeKb: number;
}

// Khớp đúng shape thật gửi lên POST /DepotJobs/{id}/survey (xem SurveyModulePage.handleSaveSurvey) —
// trước đây khai báo structureClean/odorClean/floorCondition/generalNotes là field bắt buộc dù KHÔNG
// BAO GIỜ được gửi thật (payload thật dùng `notes`, không phải `generalNotes`, và không hề có 3 field
// kia) — chỉ "sống sót" qua type-check vì call site cast `as any`, nên type cũ chỉ gây hiểu nhầm.
export interface SurveyRecord {
  surveyorName: string;
  surveyorStaffId?: number;
  // Backend nhận đúng string "A"/"B"/"C"/"D" (xem SubmitSurveyAsync), không phải TS enum ContainerGrade.
  conditionRating: 'A' | 'B' | 'C' | 'D';
  notes: string;
  damages: SurveyDamagePayload[];
  cleaningMethod?: string;
  cleaningRemarks?: string;
  cleaningReason: string[];
  cleaningItems: SurveyCleaningItemPayload[];
  checklist: SurveyChecklistItemPayload[];
  photos: SurveyPhotoPayload[];
  // true = "Lưu Tạm" (job giữ nguyên SURVEYING); false/mặc định = nộp phiếu thật.
  isDraft?: boolean;
}

export interface OperationTicket {
  ticketNo: string;        // Số phiếu
  createdDate: string;     // Ngày lập phiếu
  operatorName: string;    // Tên nhân viên khai thác
  truckNo: string;         // Biển số đầu kéo
  driverName: string;      // Tên tài xế
  driverPhone: string;     // Số điện thoại tài xế
  bookingOrEirNo: string;   // Số booking hoặc EIR
  feeAmount: number;       // Số tiền phí
  forkliftDriverName: string; // Tên tài xế xe nâng
  assignedLocation: YardLocation; // Vị trí được phân
  notes?: string;          // Ghi chú
}

export interface PaymentRecord {
  receiptNo: string;       // Số phiếu thu
  paymentDate: string;     // Ngày thanh toán
  amount: number;          // Số tiền
  method: string;          // Phương thức thanh toán
  transactionRef: string;  // Mã giao dịch
  isPaid: boolean;         // Đã thanh toán hay chưa
  cashierName: string;     // Thu ngân
}

export interface EstimateSheet {
  estimateNo: string;      // Số báo giá
  createdDate: string;     // Ngày tạo
  estimatorName: string;   // Người lập báo giá
  items: DamageItem[];     // Danh sách hạng mục
  totalLaborVnd: number;   // Tổng nhân công
  totalMaterialVnd: number; // Tổng vật tư
  taxVnd: number;          // Thuế
  grandTotalVnd: number;   // Tổng cộng
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;     // Người duyệt
  approvedDate?: string;   // Ngày duyệt
  rejectedReason?: string; // Lý do từ chối
}

export interface RepairWorkOrder {
  workOrderNo: string;     // Số lệnh công việc
  assignedTeam: string;    // Tổ sửa chữa
  assignedWorkers: string[]; // Danh sách công nhân
  issuedMaterials: { name: string; quantity: number; unit: string }[]; // Vật tư cấp phát
  startDate?: string;      // Ngày bắt đầu
  completedDate?: string;  // Ngày hoàn thành
  qcPassedDate?: string;   // Ngày QC đạt
  qcInspectorName?: string; // Người QC
  qcChecklist?: { code: string; label: string; passed: boolean }[]; // Danh sách kiểm tra
  postRepairPhotos?: PhotoRecord[]; // Ảnh sau sửa chữa
  qcComments?: string;     // Ghi chú QC
}

export interface DepotJob {
  id: string;              // Mã hồ sơ
  containerNo: string;     // Số container
  isoSize: ISOSize;        // Kích thước ISO
  ownerType: string;       // Loại chủ hàng
  shippingLine: string;    // Hãng tàu
  tareWeightKg: number;    // Trọng lượng vỏ
  maxPayloadKg: number;    // Tải trọng tối đa
  manufactureYear: number; // Năm sản xuất
  gateInDate: string;      // Thời gian vào depot
  gateOutDate?: string;    // Thời gian ra depot
  truckNo: string;         // Biển số xe đầu kéo
  driverName: string;      // Tên tài xế
  driverPhone: string;     // Số điện thoại tài xế
  driverIdCard?: string;   // Số CCCD/CMND
  status: JobStatus;
  currentLocation: YardLocation;
  survey?: SurveyRecord;   // Phiếu giám định
  operationTicket?: OperationTicket; // Phiếu khai thác
  payment?: PaymentRecord; // Thông tin thanh toán
  estimate?: EstimateSheet; // Báo giá
  repairWorkOrder?: RepairWorkOrder; // Lệnh sửa chữa
}
