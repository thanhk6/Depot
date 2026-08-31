// Vai trò của người dùng trong quy trình tiếp nhận và sửa chữa container.
export type RoleType =
  | 'SURVEYOR'       // Giám định
  | 'OPERATOR'       // Khai thác
  | 'ACCOUNTANT'     // Kế toán / Thanh toán
  | 'ESTIMATOR'      // Báo giá
  | 'REPAIR_TECH'    // Sửa chữa
  | 'QC_INSPECTOR'   // Kiểm tra chất lượng (QC)
  | 'CLEANING_STAFF' // Tổ vệ sinh vỏ bãi
  | 'FORKLIFT_DRIVER'// Xe nâng
  | 'SHIPPING_LINE'  // Hãng tàu (Phê duyệt báo giá)
  | 'DEPOT_MANAGER'  // Quản lý Depot
  | 'ADMIN';          // Quản trị hệ thống

// Kích thước và loại container theo mã ISO.
export type ContainerSize = '20GP' | '40GP' | '40HC' | '45HC' | '20RF' | '40RH';

// Trạng thái hiện tại của một hồ sơ công việc (job) tại Depot.
export type JobStatus =
  | 'GATE_IN'                   // Mới tiếp nhận
  | 'SURVEYING'                 // Đang giám định
  | 'SURVEYED'                  // Đã giám định
  | 'OPERATION_PENDING'         // Khai thác lập phiếu
  | 'PAYMENT_PENDING'           // Chờ thanh toán dịch vụ
  | 'PAID'                      // Đã thanh toán dịch vụ
  | 'ESTIMATE_PENDING_APPROVAL' // Chờ Hãng tàu duyệt báo giá
  | 'ESTIMATE_APPROVED'         // Hãng tàu đã duyệt báo giá
  | 'ESTIMATE_REJECTED'         // Hãng tàu từ chối báo giá
  | 'REPAIRING'                 // Đang sửa chữa
  | 'QC_PENDING'                // Chờ kiểm tra QC
  | 'QC_PASSED'                 // QC Đạt
  | 'QC_FAILED'                 // QC Không đạt (Sửa lại)
  | 'YARD_STORED'               // Đã lưu bãi
  | 'GATE_OUT';                 // Đã xuất bãi

// Một hạng mục hư hỏng được ghi nhận trong biên bản giám định.
export interface DamageItem {
  id: string;             // Mã hạng mục hư hỏng
  component: string;      // Bộ phận: Vách trái, Vách phải, Mái, Cửa, Sàn, Khung, Cụm máy lạnh...
  damageCode: string;     // Mã hư hỏng: DENT, HOLE, BENT, RUST, CUT, BROKEN, DIRTY
  damageNameVi: string;   // Móp, Thủng, Cong, Rỉ sét, Rách, Vỡ, Bẩn...
  locationCode: string;   // Vị trí: L1, R2, F1, T3, D1...
  repairCode: string;     // Mã sửa chữa: WELD, PATCH, STRAIGHTEN, CLEAN, REPLACE, PAINT
  repairNameVi: string;   // Hàn, Vá, Nắn, Vệ sinh, Thay thế, Sơn...
  quantity: number;       // Số lượng / Kích thước (cm / cái / m2)
  unit: string;           // cm, m2, cái, giờ
  laborHours: number;     // Giờ công
  laborRate: number;      // Đơn giá nhân công (VND/giờ)
  materialCost: number;   // Chi phí vật tư (VND)
  totalCost: number;      // Thành tiền (VND)
  severity: 'LIGHT' | 'MEDIUM' | 'HEAVY'; // Mức độ: nhẹ, trung bình, nặng
  notes?: string;         // Ghi chú bổ sung
  photoUrl?: string;      // Ảnh minh chứng cho hư hỏng
}

// Ảnh container được chụp từ một góc cụ thể khi giám định.
export interface SurveyPhoto {
  id: string;             // Mã ảnh
  angle: 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT' | 'INSIDE' | 'ROOF' | 'REEFER'; // Góc chụp
  angleVi: string;        // Tên góc chụp bằng tiếng Việt
  url: string;            // Đường dẫn ảnh
  timestamp: string;      // Thời điểm chụp
}

// Thông tin kết quả giám định container.
export interface SurveyInfo {
  surveyorId: string;     // Mã nhân viên giám định
  surveyorName: string;   // Tên nhân viên giám định
  surveyDate: string;     // Ngày giám định
  conditionRating: 'A' | 'B' | 'C' | 'D'; // Phân loại chất lượng vỏ container
  damages: DamageItem[];  // Danh sách hư hỏng phát hiện được
  photos: SurveyPhoto[];  // Danh sách ảnh giám định
  generalNotes: string;   // Nhận xét tổng quát
  isCompleted: boolean;   // Đã hoàn tất biên bản giám định chưa
}

// Một dịch vụ được tính trong phiếu dịch vụ của khách hàng.
export interface DepotServiceItem {
  id: string;             // Mã dòng dịch vụ
  code: string;            // Mã dịch vụ
  nameVi: string;          // Tên dịch vụ bằng tiếng Việt
  unitPrice: number;       // Đơn giá (VND)
  quantity: number;        // Số lượng
  totalPrice: number;      // Thành tiền (VND)
}

// Thông tin khách hàng và phương tiện giao container.
export interface CustomerInfo {
  customerName: string;   // Tên khách hàng
  taxCode: string;        // Mã số thuế
  phone: string;          // Số điện thoại liên hệ
  driverName?: string;    // Tên tài xế
  licensePlate?: string;  // Biển số xe đầu kéo
  trailerPlate?: string;  // Biển số rơ moóc
  bookingNo?: string;     // Số booking
  blNo?: string;          // Số vận đơn (B/L)
}

// Phiếu dịch vụ do bộ phận khai thác lập.
export interface OperationInfo {
  operatorId: string;     // Mã nhân viên khai thác
  operatorName: string;   // Tên nhân viên khai thác
  createdDate: string;    // Ngày lập phiếu
  customer: CustomerInfo; // Thông tin khách hàng
  services: DepotServiceItem[]; // Danh sách dịch vụ phát sinh
  subtotal: number;       // Cộng tiền trước thuế
  vatAmount: number;      // Tiền VAT
  totalAmount: number;    // Tổng tiền thanh toán
  serviceTicketNo: string; // Số phiếu dịch vụ (VD: PDV-2026-0089)
}

// Thông tin thu tiền và đối soát thanh toán.
export interface PaymentInfo {
  paymentTicketNo: string; // Số phiếu thu (VD: PT-2026-0089)
  method: 'BANK_TRANSFER' | 'CASH' | 'VIETQR';
  status: 'PENDING' | 'PAID' | 'MISMATCHED';
  amount: number;         // Số tiền thu
  transactionRef?: string; // Mã giao dịch ngân hàng
  bankName?: string;      // Tên ngân hàng
  qrCodeUrl?: string;     // Đường dẫn QR thanh toán
  paidDate?: string;      // Ngày thanh toán
  cashierName?: string;   // Thu ngân thực hiện
  reconciliationNotes?: string; // Ghi chú đối soát
}

// Báo giá sửa chữa dựa trên các hạng mục hư hỏng đã giám định.
export interface RepairEstimate {
  estimateNo: string;      // Số báo giá (VD: EST-2026-0089)
  estimatorName: string;   // Tên người lập báo giá
  createdDate: string;      // Ngày lập báo giá
  damages: DamageItem[];    // Danh sách hư hỏng được báo giá
  totalLaborCost: number;   // Tổng chi phí nhân công
  totalMaterialCost: number; // Tổng chi phí vật tư
  subtotal: number;         // Cộng tiền trước thuế
  vatAmount: number;        // Tiền VAT
  grandTotal: number;       // Tổng tiền cuối cùng
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalDate?: string;
  approvedBy?: string;     // Đại diện Hãng tàu
  rejectionReason?: string;
}

// Lệnh công việc dùng để điều phối một đợt sửa chữa container.
export interface RepairWorkOrder {
  workOrderNo: string;     // Lệnh sửa chữa (VD: WO-2026-0089)
  repairTeam: string;      // Tổ sửa chữa A, B, C
  assignedWorkers: string[]; // Danh sách công nhân được phân công
  issuedMaterials: {
    itemCode: string;
    itemName: string;
    quantity: number;
    unit: string;
  }[];
  startDate?: string;      // Ngày bắt đầu sửa chữa
  completedDate?: string;  // Ngày hoàn thành sửa chữa
  preRepairPhotos: string[]; // Ảnh trước sửa chữa
  postRepairPhotos: string[]; // Ảnh sau sửa chữa
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

// Kết quả kiểm tra chất lượng sau khi sửa chữa.
export interface QCInspection {
  inspectorName: string;   // Tên kiểm tra QC
  inspectionDate?: string; // Ngày kiểm tra
  result: 'PENDING' | 'PASSED' | 'FAILED';
  checklist: {
    item: string;          // Hạng mục kiểm tra
    passed: boolean;       // Đạt hay không
    note?: string;         // Ghi chú
  }[];
  comments?: string;       // Nhận xét bổ sung
}

// Vị trí xếp container trong bãi theo block, dãy, hàng và tầng.
export interface YardLocation {
  block: 'BLOCK_A' | 'BLOCK_B' | 'BLOCK_C' | 'BLOCK_R' | 'BLOCK_Q'; // A: 20ft, B: 40ft, C: Reefer, R: Sửa chữa, Q: Khu QC
  bay: number;              // Dãy (1 - 10)
  row: number;              // Hàng (1 - 6)
  tier: number;             // Tầng (1 - 4)
}

// Yêu cầu xe nâng di chuyển container giữa các vị trí trong Depot.
export interface ForkliftMoveOrder {
  id: string;               // Mã yêu cầu
  jobId: string;            // Mã job
  containerNo: string;      // Số container
  fromLocation: YardLocation; // Vị trí đi
  toLocation: YardLocation; // Vị trí đến
  forkliftId: string;      // Xe nâng 01, Xe nâng 02...
  driverName: string;       // Tên tài xế xe nâng
  requestedBy: string;      // Người yêu cầu
  requestedAt: string;      // Thời điểm yêu cầu
  completedAt?: string;     // Thời điểm hoàn tất
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  purpose: 'SURVEY' | 'REPAIR' | 'QC' | 'YARD_STORAGE' | 'GATE_OUT';
}

// Nhật ký thao tác phục vụ truy vết và kiểm toán hệ thống.
export interface AuditLogEntry {
  id: string;               // Mã nhật ký
  timestamp: string;        // Thời điểm ghi log
  role: RoleType;
  userName: string;         // Tên người dùng
  action: string;           // Hành động thực hiện
  details: string;          // Chi tiết log
}

// Hồ sơ công việc xuyên suốt vòng đời của một container tại Depot.
export interface DepotJob {
  id: string;              // Job ID (VD: JOB-2026-001)
  containerNo: string;     // Số Container (VD: MSKU1234567)
  isoSize: ContainerSize;  // Kích thước ISO
  shippingLine: string;    // Hãng tàu (Maersk, MSC, COSCO...)
  tareWeightKg: number;    // Trọng lượng vỏ (kg)
  maxPayloadKg: number;    // Tải trọng tối đa (kg)
  gateInDate: string;      // Thời gian vào depot
  gateOutDate?: string;    // Thời gian ra depot
  status: JobStatus;
  currentLocation: YardLocation;
  
  survey?: SurveyInfo;
  operation?: OperationInfo;
  payment?: PaymentInfo;
  estimate?: RepairEstimate;
  repairOrder?: RepairWorkOrder;
  qcInspection?: QCInspection;
  
  moveHistory: ForkliftMoveOrder[];
  auditLogs: AuditLogEntry[];
}
