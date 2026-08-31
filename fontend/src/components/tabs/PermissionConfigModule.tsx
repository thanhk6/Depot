import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { UserAccountProfile } from '../../data/roleMenuConfig';
import {
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  CheckCircle2,
  XCircle,
  Plus,
  RotateCcw,
  Search,
  Code2,
  SlidersHorizontal,
  KeyRound,
  UserPlus,
  Layers,
  Save,
  Building2,
  Info,
  ChevronRight,
  Terminal,
  FileCode,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  History,
  FileText,
  Users,
  Briefcase,
  Key,
  Shield,
  Laptop,
  Activity,
  Filter,
  ArrowRight,
  Database,
  Server,
  Globe,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  Sparkles,
  Workflow,
  Settings,
  ShieldAlert,
  QrCode,
  Camera,
  Cpu,
  HardDrive,
  Bell,
  Network,
  UserX,
  ToggleLeft,
  ToggleRight,
  Share2,
  FileCheck2,
  BadgeCheck,
  Radio,
  FileDigit,
  Zap
} from 'lucide-react';
import { PortalUserModule } from './PortalUserModule';

// ============================================================================
// DATA STRUCTURES & INTERFACES FOR AUTHORIZATION & IDENTITY MANAGEMENT
// ============================================================================

export interface CompanyItem {
  id: string;
  code: string;
  name: string;
  companyType: 'DEPOT_INTERNAL' | 'SHIPPING_LINE' | 'CUSTOMER' | 'TRANSPORT' | 'REPAIR_PARTNER' | 'SUPPLIER';
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description: string;
  managerName: string;
  userCount: number;
}

export interface PositionItem {
  id: string;
  code: string;
  name: string;
  level: number; // 1: Executive, 2: Manager, 3: Supervisor, 4: Specialist, 5: Staff
  description: string;
}

export interface PermissionGroupItem {
  id: string;
  code: string; // e.g., 'CONTAINER', 'SURVEY', 'OPERATION', 'PAYMENT', 'ESTIMATE', 'REPAIR', 'INVENTORY', 'FINANCE', 'REPORT', 'SYSTEM'
  name: string;
  description: string;
}

export interface PermissionDefinition {
  id: string;
  code: string; // e.g., 'Container.View', 'Survey.Create', 'Payment.Approve'
  name: string;
  groupId: string;
  action: 'View' | 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject' | 'Print' | 'Export' | 'Import';
  description: string;
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  type: 'SYSTEM' | 'PORTAL';
  description: string;
  permissions: string[]; // List of permission codes
}

export interface PortalUserItem {
  id: string;
  companyId: string;
  companyName: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleCode: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface LoginHistoryItem {
  id: string;
  username: string;
  fullName: string;
  userType: 'SYSTEM' | 'PORTAL';
  ipAddress: string;
  browser: string;
  device: string;
  loginTime: string;
  result: 'SUCCESS' | 'FAILED' | 'LOCKED';
  failureReason?: string;
}

export interface AuditLogItem {
  id: string;
  username: string;
  fullName: string;
  module: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'PAYMENT' | 'PRINT' | 'EXPORT' | 'IMPORT' | 'LOGIN' | 'LOGOUT';
  description: string;
  ipAddress: string;
  timestamp: string;
  dataBefore?: Record<string, any>;
  dataAfter?: Record<string, any>;
}

export interface RoleGroupItem {
  id: string;
  code: string;
  name: string;
  description: string;
  rolesCount: number;
  usersCount: number;
  isSystemDefault: boolean;
}

export interface DataScopeRuleItem {
  id: string;
  scopeType: 'GLOBAL' | 'COMPANY' | 'BRANCH' | 'DEPOT' | 'DEPARTMENT' | 'GROUP' | 'ROLE' | 'USER' | 'ASSIGNED_CONTAINER' | 'SHIPPING_LINE';
  name: string;
  description: string;
  appliesTo: string;
  filterCondition: string;
  isActive: boolean;
}

export interface WorkflowRuleItem {
  id: string;
  code: string;
  name: string;
  module: string;
  triggerEvent: string;
  approvalSteps: string[];
  maxThresholdVnd: number;
  autoEscalationHours: number;
  isActive: boolean;
}

export interface SystemConfigCategory {
  category: string;
  name: string;
  description: string;
  icon: string;
  settings: {
    key: string;
    label: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'password';
    options?: string[];
    description: string;
  }[];
}

// ============================================================================
// ADDITIONAL MOCK DATA FOR 10-POINT SYSTEM ADMIN HIERARCHY
// ============================================================================

export const MOCK_ROLE_GROUPS: RoleGroupItem[] = [
  { id: 'RG-01', code: 'SYS_ADMIN', name: 'Quản Trị Hệ Thống (System Admin)', description: 'Toàn quyền cấu hình tham số, phân quyền & quản trị dữ liệu', rolesCount: 3, usersCount: 2, isSystemDefault: true },
  { id: 'RG-02', code: 'BOARD', name: 'Ban Giám Đốc (Executive Board)', description: 'Xem báo cáo doanh thu, chỉ số KPI & phê duyệt hạn mức đặc biệt', rolesCount: 2, usersCount: 3, isSystemDefault: true },
  { id: 'RG-03', code: 'DEPOT_MGMT', name: 'Ban Quản Lý Bãi (Depot Management)', description: 'Điều hành tổng thể tác nghiệp bãi Cát Lái & theo dõi năng suất', rolesCount: 3, usersCount: 4, isSystemDefault: true },
  { id: 'RG-04', code: 'GATE_OPS', name: 'Khai Thác Cổng (Gate Operations)', description: 'Lập phiếu Gate In/Out, phát hành EIR & giao nhận container', rolesCount: 2, usersCount: 18, isSystemDefault: false },
  { id: 'RG-05', code: 'SURVEY_MNR', name: 'Giám Định Vỏ Container (Survey M&R)', description: 'Giám định hư hỏng IICL-6, lập biên bản & chụp ảnh hiện trạng', rolesCount: 2, usersCount: 12, isSystemDefault: false },
  { id: 'RG-06', code: 'ESTIMATION', name: 'Báo Giá Sửa Chữa (Estimate Team)', description: 'Lập báo giá M&R, tính giờ công thợ & gửi hãng tàu phê duyệt', rolesCount: 2, usersCount: 6, isSystemDefault: false },
  { id: 'RG-07', code: 'REPAIR_TEAM', name: 'Tổ Thợ Sửa Chữa (Repair Crew)', description: 'Thực hiện gõ rỉ, hàn nắn vách, vá tôn & sơn vỏ container', rolesCount: 2, usersCount: 25, isSystemDefault: false },
  { id: 'RG-08', code: 'QC_TEAM', name: 'Kiểm Tra Chất Lượng (QC Team)', description: 'Nghiệm thu tiêu chuẩn kỹ thuật container đủ điều kiện xuất bãi', rolesCount: 1, usersCount: 5, isSystemDefault: false },
  { id: 'RG-09', code: 'YARD_STEVEDORE', name: 'Điều Độ & Xe Nâng (Yard Stevedoring)', description: 'Tài xế xe nâng reach stacker, xếp dỡ & đảo chuyển container', rolesCount: 2, usersCount: 14, isSystemDefault: false },
  { id: 'RG-10', code: 'FINANCE_CASHIER', name: 'Kế Toán & Thu Ngân (Cashier & Finance)', description: 'Thu phí nâng hạ, thu tiền mặt, gạch nợ VietQR & xuất hóa đơn', rolesCount: 2, usersCount: 8, isSystemDefault: false },
  { id: 'RG-11', code: 'WAREHOUSE_INV', name: 'Kho & Vật Tư Cơ Khí (Warehouse Inventory)', description: 'Quản lý tôn tấm, xà gồ, sơn, gioăng cao su & phụ tùng cơ khí', rolesCount: 2, usersCount: 4, isSystemDefault: false },
  { id: 'RG-12', code: 'SHIPPING_PORTAL', name: 'Portal Khách Hàng Hãng Tàu (Shipping Line)', description: 'Tài khoản hãng tàu đăng nhập Portal duyệt báo giá & tải EIR', rolesCount: 2, usersCount: 45, isSystemDefault: false },
  { id: 'RG-13', code: 'CUSTOMER_PORTAL', name: 'Portal Khách Hàng Chủ Hàng (Shipper/Consignee)', description: 'Tra cứu tình trạng cont, tra cứu hóa đơn & gửi yêu cầu cấp vỏ', rolesCount: 2, usersCount: 120, isSystemDefault: false },
  { id: 'RG-14', code: 'PARTNER_CONTRACTOR', name: 'Đối Tác Thầu Khai Thác (Partner Contractor)', description: 'Các tổ thợ sửa chữa gia công bên ngoài kết nối dữ liệu Depot', rolesCount: 1, usersCount: 10, isSystemDefault: false },
  { id: 'RG-15', code: 'AUDIT_GUEST', name: 'Nhóm Giám Sát Thanh Tra (Auditor / Inspector)', description: 'Quyền xem duy nhất (Read-only) phục vụ kiểm toán độc lập', rolesCount: 1, usersCount: 2, isSystemDefault: true }
];

export const MOCK_DATA_SCOPES: DataScopeRuleItem[] = [
  { id: 'DS-01', scopeType: 'GLOBAL', name: 'Toàn Hệ Thống (Global Scope)', description: 'Truy cập toàn bộ dữ liệu của tất cả Công ty, Chi nhánh, Depot & Hãng tàu', appliesTo: 'Super Admin, System Admin', filterCondition: 'CompanyId = ALL AND DepotId = ALL', isActive: true },
  { id: 'DS-02', scopeType: 'COMPANY', name: 'Theo Pháp Nhân Công Ty (Company Scope)', description: 'Chỉ truy cập dữ liệu thuộc pháp nhân công ty đăng ký', appliesTo: 'Company Manager, Accountant', filterCondition: 'CompanyId = User.CompanyId', isActive: true },
  { id: 'DS-03', scopeType: 'BRANCH', name: 'Theo Chi Nhánh (Branch Scope)', description: 'Chỉ thấy dữ liệu các bãi Depot thuộc chi nhánh khu vực', appliesTo: 'Branch Director, Regional Mgr', filterCondition: 'BranchId = User.BranchId', isActive: true },
  { id: 'DS-04', scopeType: 'DEPOT', name: 'Theo Depot Tác Nghiệp (Depot Scope)', description: 'Giới hạn duy nhất trong phạm vi Depot Tân Cảng Cát Lái', appliesTo: 'Depot Staff, Gate Ops, Surveyors', filterCondition: 'DepotId = User.DepotId', isActive: true },
  { id: 'DS-05', scopeType: 'DEPARTMENT', name: 'Theo Phòng Ban Nghiệp Vụ', description: 'Chỉ xem dữ liệu do nhân sự phòng ban mình khởi tạo hoặc xử lý', appliesTo: 'Department Members', filterCondition: 'CreatedByDept = User.DeptId', isActive: true },
  { id: 'DS-06', scopeType: 'SHIPPING_LINE', name: 'Theo Mã Hãng Tàu (Shipping Line Scope)', description: 'Chỉ cho phép tài khoản Hãng tàu thấy Container gắn mã Prefix hãng mình', appliesTo: 'Portal Shipping Line Users', filterCondition: 'Container.OperatorCode = PortalUser.ShippingLineCode', isActive: true },
  { id: 'DS-07', scopeType: 'USER', name: 'Cá Nhân Khởi Tạo (User Scope)', description: 'Nhân viên chỉ thấy các chứng từ, báo giá do chính mình tạo', appliesTo: 'Field Staff, Temporary Workers', filterCondition: 'CreatedBy = User.Id', isActive: true },
  { id: 'DS-08', scopeType: 'ASSIGNED_CONTAINER', name: 'Container Được Phân Công Work-Order', description: 'Tổ thợ chỉ xem danh sách container được trưởng ca gán lệnh sửa chữa', appliesTo: 'Repair Mechanics', filterCondition: 'AssignedMechanicId = User.Id', isActive: true }
];

export const MOCK_WORKFLOWS: WorkflowRuleItem[] = [
  { id: 'WF-01', code: 'WF_SURVEY', name: 'Quy Trình Phê Duyệt Giám Định IICL', module: 'Giám Định (Survey)', triggerEvent: 'Surveyor hoàn tất giám định', approvalSteps: ['Giám định viên lập biên bản', 'Trưởng phòng Giám định duyệt hình ảnh', 'Tự động gửi báo giá'], maxThresholdVnd: 50000000, autoEscalationHours: 4, isActive: true },
  { id: 'WF-02', code: 'WF_ESTIMATE_LINE', name: 'Quy Trình Phê Duyệt Báo Giá Hãng Tàu', module: 'Báo Giá M&R', triggerEvent: 'Báo giá được khởi tạo thành công', approvalSteps: ['Lập báo giá M&R', 'Gửi Portal Hãng tàu', 'Hãng tàu duyệt / từ chối', 'Chuyển lệnh Sửa chữa'], maxThresholdVnd: 100000000, autoEscalationHours: 24, isActive: true },
  { id: 'WF-03', code: 'WF_REPAIR_QC', name: 'Quy Trình Sửa Chữa & Nghiệm Thu QC', module: 'Sửa Chữa & QC', triggerEvent: 'Hãng tàu đồng ý báo giá', approvalSteps: ['Phân công tổ thợ', 'Xuất vật tư cơ khí', 'Thực hiện sửa chữa', 'QC kiểm tra & ký nghiệm thu', 'Đổi trạng thái cont AV (Available)'], maxThresholdVnd: 0, autoEscalationHours: 12, isActive: true },
  { id: 'WF-04', code: 'WF_PAYMENT_GATE', name: 'Quy Trình Thanh Toán & Giải Phóng Gate Out', module: 'Thu Ngân & Cổng', triggerEvent: 'Tài xế yêu cầu lấy container', approvalSteps: ['Kiểm tra lệnh EIR / D/O', 'Tính phí nâng hạ & lưu bãi', 'Tạo mã VietQR tự động', 'Hệ thống nhận Webhook thanh toán', 'Phát hành E-EIR & mở barie Gate Out'], maxThresholdVnd: 20000000, autoEscalationHours: 1, isActive: true },
  { id: 'WF-05', code: 'WF_USER_PERMISSION', name: 'Quy Trình Cấp Quyền & Mở Khóa Tài Khoản', module: 'Quản Trị Hệ Thống', triggerEvent: 'Đề xuất gán quyền mới', approvalSteps: ['Admin tạo tài khoản / cấp quyền', 'Trưởng phòng IT phê duyệt', 'Gửi email kích hoạt & mật khẩu OTP'], maxThresholdVnd: 0, autoEscalationHours: 8, isActive: true }
];

export const MOCK_SYSTEM_CONFIGS: SystemConfigCategory[] = [
  {
    category: 'GENERAL',
    name: '1. Cấu Hình Chung Bãi Depot',
    description: 'Tên bãi, mã cảng VNACCS, địa chỉ & múi giờ làm việc',
    icon: 'Building2',
    settings: [
      { key: 'DEPOT_NAME', label: 'Tên Depot Hiện Tại', value: 'DEPOT TÂN CẢNG CÁT LÁI - KCN THẠNH MỸ LỢI', type: 'string', description: 'Tên hiển thị trên hóa đơn & phiếu EIR' },
      { key: 'VNACCS_PORT_CODE', label: 'Mã Cảng VNACCS Hải Quan', value: 'VNCTL', type: 'string', description: 'Mã khai báo hải quan điện tử' },
      { key: 'WORK_TIMEZONE', label: 'Múi Giờ Hệ Thống', value: 'Asia/Ho_Chi_Minh (UTC+7)', type: 'string', description: 'Múi giờ tiêu chuẩn ghi nhận timestamps' },
      { key: 'AUTO_GATE_OUT_RELEASE', label: 'Tự Động Mở Barie Khi Thanh Toán VietQR', value: 'true', type: 'boolean', description: 'Tự động mở cổng khi có Webhook xác nhận ngân hàng' }
    ]
  },
  {
    category: 'EMAIL_SMTP',
    name: '2. Cấu Hình Email SMTP Thông Báo',
    description: 'Máy chủ gửi Email thông báo tự động báo giá & hóa đơn',
    icon: 'Mail',
    settings: [
      { key: 'SMTP_HOST', label: 'SMTP Host Server', value: 'smtp.office365.com', type: 'string', description: 'Địa chỉ máy chủ Mail' },
      { key: 'SMTP_PORT', label: 'SMTP Port', value: '587', type: 'number', description: 'Cổng kết nối TLS/SSL' },
      { key: 'SMTP_USER', label: 'Email Gửi Tự Động', value: 'notifications@depottancang.com.vn', type: 'string', description: 'Email phát thư hệ thống' },
      { key: 'SMTP_ENABLE_SSL', label: 'Bật Mã Hóa SSL/TLS', value: 'true', type: 'boolean', description: 'Đảm bảo an toàn kết nối mail' }
    ]
  },
  {
    category: 'VIETQR_PAYMENT',
    name: '3. Tích Hợp Cổng Thanh Toán VietQR & Napas',
    description: 'Cấu hình ngân hàng thụ hưởng & Webhook nhận tiền gạch nợ tự động',
    icon: 'QrCode',
    settings: [
      { key: 'BANK_NAME', label: 'Ngân Hàng Thụ Hưởng', value: 'MBBANK - Ngân Hàng Quân Đội', type: 'string', description: 'Tên ngân hàng tạo mã VietQR' },
      { key: 'ACCOUNT_NO', label: 'Số Tài Khoản Depot', value: '0301992831999', type: 'string', description: 'Số tài khoản công ty' },
      { key: 'ACCOUNT_NAME', label: 'Tên Chủ Tài Khoản', value: 'CONG TY TNHH LOGISTICS DEPOT TAN CANG', type: 'string', description: 'Tên khớp với hệ thống Napas247' },
      { key: 'WEBHOOK_SECRET', label: 'VietQR Webhook Secret Key', value: 'sec_vqr_live_8912839128391', type: 'password', description: 'Khóa xác thực Webhook tự động gạch nợ' }
    ]
  },
  {
    category: 'AI_OCR_ENGINE',
    name: '4. AI OCR & Camera ANPR Nhận Dạng Xe / Container',
    description: 'Cấu hình AI Gemini OCR đọc số container & Camera quét biển số xe',
    icon: 'Camera',
    settings: [
      { key: 'AI_OCR_MODEL', label: 'Mô Hình AI Vision OCR', value: 'gemini-2.5-flash-vision', type: 'string', description: 'AI đọc số container & độ rỉ sét vỏ cont' },
      { key: 'OCR_CONFIDENCE_THRESHOLD', label: 'Độ Tin Cậy Tối Thiểu (%)', value: '92', type: 'number', description: 'Ngưỡng chấp nhận tự động điền form' },
      { key: 'ANPR_CAMERA_GATE1_IP', label: 'Camera Cổng In #1 IP', value: '192.168.1.105:8080', type: 'string', description: 'Camera chụp biển số đầu kéo' },
      { key: 'RFID_GATE_READER', label: 'Đầu Đọc RFID Thẻ Tài Xế', value: 'ENABLED', type: 'string', description: 'Bật nhận dạng thẻ từ RFID giao nhận' }
    ]
  },
  {
    category: 'SECURITY_JWT',
    name: '5. Bảo Mật Session & Khóa Mật Khẩu',
    description: 'Thời gian hết hạn phiên đăng nhập JWT Token & quy tắc bảo mật',
    icon: 'Lock',
    settings: [
      { key: 'JWT_EXPIRATION_MINUTES', label: 'Thời Gian Hết Hạn Token (Phút)', value: '480', type: 'number', description: '8 giờ làm việc ca trực' },
      { key: 'MAX_FAILED_LOGIN', label: 'Số Lần Sai Mật Khẩu Tối Đa', value: '5', type: 'number', description: 'Tự động khóa tài khoản khi vượt quá' },
      { key: 'PASSWORD_MIN_LENGTH', label: 'Độ Dài Mật Khẩu Tối Thiểu', value: '8', type: 'number', description: 'Bao gồm chữ hoa, chữ số & ký tự đặc biệt' },
      { key: 'REQUIRE_2FA_ADMIN', label: 'Bắt Buộc OTP 2FA Với Admin', value: 'true', type: 'boolean', description: 'Yêu cầu Google Authenticator với Super Admin' }
    ]
  }
];

// ============================================================================
// INITIAL MOCK DATA
// ============================================================================

export const MOCK_COMPANIES: CompanyItem[] = [
  {
    id: 'COMP-001',
    code: 'DEPOT-MAIN',
    name: 'CÔNG TY TNHH LOGISTICS DEPOT TÂN CẢNG',
    companyType: 'DEPOT_INTERNAL',
    taxCode: '0301992831',
    address: 'KCN Cát Lái, Phường Thạnh Mỹ Lợi, TP. Thủ Đức, TP.HCM',
    phone: '028-3742-1234',
    email: 'contact@depottancang.com.vn',
    website: 'https://depottancang.com.vn',
    contactPerson: 'Ông Nguyễn Văn Hùng (Tổng Giám Đốc)',
    isActive: true
  },
  {
    id: 'COMP-002',
    code: 'MAERSK',
    name: 'MAERSK LINE A/S VIETNAM CO., LTD.',
    companyType: 'SHIPPING_LINE',
    taxCode: '0302881920',
    address: 'Số 54-56 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    phone: '028-3823-0011',
    email: 'hans.nielsen@maersk.com',
    website: 'https://www.maersk.com',
    contactPerson: 'Mr. Hans Nielsen (Trưởng M&R)',
    isActive: true
  },
  {
    id: 'COMP-003',
    code: 'MSC',
    name: 'MEDITERRANEAN SHIPPING COMPANY (MSC) S.A.',
    companyType: 'SHIPPING_LINE',
    taxCode: '0305119283',
    address: 'Bitexco Financial Tower, 2 Hải Triều, Q.1, TP.HCM',
    phone: '028-3914-1122',
    email: 'msc.vietnam@msc.com',
    website: 'https://www.msc.com',
    contactPerson: 'Mr. Marco Rossi (Equipment Director)',
    isActive: true
  },
  {
    id: 'COMP-004',
    code: 'LOGISTICS-TB',
    name: 'CÔNG TY CP VẬN TẢI & LOGISTICS TÂN BÌNH',
    companyType: 'TRANSPORT',
    taxCode: '0312994821',
    address: 'Số 120 Đường Trường Chinh, Q. Tân Bình, TP.HCM',
    phone: '0903-882-112',
    email: 'operation@tanbinhlogistics.vn',
    website: 'https://tanbinhlogistics.vn',
    contactPerson: 'Ông Trần Văn Nam (Điều Hành Đội Xe)',
    isActive: true
  },
  {
    id: 'COMP-005',
    code: 'REPAIR-HOANGHA',
    name: 'CÔNG TY TNHH DỊCH VỤ CƠ KHÍ SỬA CHỮA HOÀNG HÀ',
    companyType: 'REPAIR_PARTNER',
    taxCode: '0309981273',
    address: 'Xưởng sửa chữa số 3, Cảng Cát Lái, TP. Thủ Đức',
    phone: '0918-334-991',
    email: 'hoangha.container@gmail.com',
    website: '',
    contactPerson: 'Ông Hoàng Văn Hà (Đội Trưởng Thợ Cơ Khí)',
    isActive: true
  }
];

export const MOCK_DEPARTMENTS: DepartmentItem[] = [
  { id: 'DEP-01', code: 'BGD', name: 'Ban Giám Đốc', description: 'Chỉ đạo định hướng chiến lược & phê duyệt hạn mức', managerName: 'Nguyễn Văn Hùng', userCount: 3 },
  { id: 'DEP-02', code: 'GĐ', name: 'Phòng Giám Định (Survey)', description: 'Giám định hư hỏng vỏ Container theo tiêu chuẩn IICL-6', managerName: 'Trần Văn Mạnh', userCount: 12 },
  { id: 'DEP-03', code: 'KT', name: 'Phòng Khai Thác Cổng (Gate Ops)', description: 'Điều hành xe ra vào cổng, phát hành EIR & giao nhận cont', managerName: 'Lê Hoàng Nam', userCount: 18 },
  { id: 'DEP-04', code: 'KTTI', name: 'Phòng Kế Toán & Thu Ngân', description: 'Quản lý thu ngân VietQR, hóa đơn VAT & công nợ hãng tàu', managerName: 'Phạm Thị Thảo', userCount: 8 },
  { id: 'DEP-05', code: 'BG', name: 'Phòng Báo Giá M&R', description: 'Lập báo giá vật tư, giờ công sửa chữa gửi Hãng tàu', managerName: 'Đặng Tuấn Anh', userCount: 6 },
  { id: 'DEP-06', code: 'SC', name: 'Phòng Sửa Chữa Container', description: 'Tổ thợ hàn, gõ rỉ, nắn vách & làm sạch container', managerName: 'Vũ Đức Cường', userCount: 25 },
  { id: 'DEP-07', code: 'QC', name: 'Phòng Kiểm Tra Chất Lượng (QC)', description: 'Nghiệm thu chất lượng sửa chữa đạt tiêu chuẩn xuất bãi', managerName: 'Nguyễn Tiến Dũng', userCount: 5 },
  { id: 'DEP-08', code: 'XN', name: 'Đội Xe Nâng & Điều Độ Bãi', description: 'Vận hành xe nâng reach stacker, đảo bãi & xếp hạ cont', managerName: 'Phạm Văn Long', userCount: 14 },
  { id: 'DEP-09', code: 'KHO', name: 'Phòng Kho & Vật Tư Cơ Khí', description: 'Quản lý kho tôn, sơn, xà gồ, gioăng cao su & phụ tùng', managerName: 'Bùi Thị Dung', userCount: 4 },
  { id: 'DEP-10', code: 'IT', name: 'Phòng Công Nghệ Thông Tin (IT)', description: 'Quản trị hệ thống ERP, hạ tầng mạng & tích hợp API Portal', managerName: 'Đỗ Minh Tuấn', userCount: 5 }
];

export const MOCK_POSITIONS: PositionItem[] = [
  { id: 'POS-01', code: 'DIR', name: 'Giám Đốc / Tổng Giám Đốc', level: 1, description: 'Cấp lãnh đạo cao nhất doanh nghiệp' },
  { id: 'POS-02', code: 'MGR', name: 'Trưởng Phòng / Quản Lý Bãi', level: 2, description: 'Quản lý điều hành toàn bộ công việc phòng ban' },
  { id: 'POS-03', code: 'SUP', name: 'Giám Sát Viên / Đội Trưởng', level: 3, description: 'Giám sát trực tiếp ca trực vận hành bãi' },
  { id: 'POS-04', code: 'TL', name: 'Tổ Trưởng Chuyên Môn', level: 4, description: 'Hướng dẫn kỹ thuật tổ thợ & giám định viên' },
  { id: 'POS-05', code: 'STAFF', name: 'Chuyên Viên / Nhân Viên', level: 5, description: 'Thực hiện trực tiếp tác nghiệp nghiệp vụ hàng ngày' },
  { id: 'POS-06', code: 'INTERN', name: 'Thực Tập Sinh', level: 6, description: 'Hỗ trợ nhập liệu & học việc nghiệp vụ' }
];

export const MOCK_PERMISSION_GROUPS: PermissionGroupItem[] = [
  { id: 'PG-01', code: 'CONTAINER', name: 'Nhóm Quản Lý Container', description: 'Truy vấn, tra cứu lịch sử & trạng thái container' },
  { id: 'PG-02', code: 'SURVEY', name: 'Nhóm Giám Định (Survey)', description: 'Chụp ảnh hư hỏng, lập biên bản IICL & phân loại hư hỏng' },
  { id: 'PG-03', code: 'OPERATION', name: 'Nhóm Khai Thác Cổng (Gate)', description: 'Lập phiếu Gate-In, Gate-Out, in phiếu EIR & giao nhận' },
  { id: 'PG-04', code: 'PAYMENT', name: 'Nhóm Thu Ngân & Tài Chính', description: 'Thu tiền mặt, gạch nợ VietQR, phát hành hóa đơn điện tử' },
  { id: 'PG-05', code: 'ESTIMATE', name: 'Nhóm Báo Giá Sửa Chữa (Estimate)', description: 'Lập báo giá M&R, gửi báo giá & duyệt/từ chối báo giá' },
  { id: 'PG-06', code: 'REPAIR', name: 'Nhóm Sửa Chữa & QC', description: 'Phân công tổ thợ, cập nhật vật tư, nghiệm thu chất lượng' },
  { id: 'PG-07', code: 'INVENTORY', name: 'Nhóm Quản Lý Kho & Vật Tư', description: 'Nhập xuất tồn tôn tấm, xà gồ, sơn & gioăng cao su' },
  { id: 'PG-08', code: 'FINANCE', name: 'Nhóm Báo Cáo Công Nợ Hãng Tàu', description: 'Đối soát công nợ, bảng kê chi tiết sửa chữa & hóa đơn' },
  { id: 'PG-09', code: 'REPORT', name: 'Nhóm Báo Cáo Thống Kê', description: 'Báo cáo sản lượng cổng, tồn bãi, doanh thu & hiệu suất' },
  { id: 'PG-10', code: 'SYSTEM', name: 'Nhóm Quản Trị Hệ Thống & RBAC', description: 'Cấu hình phân quyền, quản lý tài khoản & audit log' }
];

export const MOCK_ROLES: RoleItem[] = [
  {
    id: 'ROLE-01',
    code: 'ADMIN',
    name: 'Quản Trị Hệ Thống (Administrator)',
    type: 'SYSTEM',
    description: 'Toàn quyền truy cập, cấu hình phân quyền & quản trị tài khoản',
    permissions: ['Container.View', 'Container.Create', 'Container.Update', 'Container.Delete', 'Survey.Create', 'Survey.Update', 'Payment.Approve', 'Estimate.Send', 'Estimate.Approve', 'Repair.Assign', 'System.Admin']
  },
  {
    id: 'ROLE-02',
    code: 'DEPOT_MANAGER',
    name: 'Quản Lý Bãi Depot (Depot Manager)',
    type: 'SYSTEM',
    description: 'Điều hành toàn bộ hoạt động bãi, duyệt báo giá & xem báo cáo tổng hợp',
    permissions: ['Container.View', 'Container.Create', 'Survey.Create', 'Survey.Update', 'Payment.Approve', 'Estimate.Send', 'Estimate.Approve', 'Repair.Assign', 'Report.View']
  },
  {
    id: 'ROLE-03',
    code: 'SURVEYOR',
    name: 'Giám Định Viên (Surveyor)',
    type: 'SYSTEM',
    description: 'Chụp ảnh & lập biên bản giám định hư hỏng vỏ container',
    permissions: ['Container.View', 'Survey.Create', 'Survey.Update', 'Survey.Complete']
  },
  {
    id: 'ROLE-04',
    code: 'OPERATOR',
    name: 'Nhân Viên Khai Thác Cổng (Gate Ops)',
    type: 'SYSTEM',
    description: 'Thực hiện thủ tục xe ra vào cổng, lập lệnh EIR & kiểm tra giấy tờ',
    permissions: ['Container.View', 'GateIn.Execute', 'GateOut.Execute', 'EIR.Print']
  },
  {
    id: 'ROLE-05',
    code: 'ACCOUNTANT',
    name: 'Thu Ngân & Kế Toán (Accountant)',
    type: 'SYSTEM',
    description: 'Thu phí nâng hạ, thu phí vệ sinh sửa chữa & gạch nợ VietQR',
    permissions: ['Container.View', 'Payment.Process', 'Payment.Approve', 'Invoice.Export']
  },
  {
    id: 'ROLE-06',
    code: 'PORTAL_SHIPPING_LINE',
    name: 'Khách Hàng Hãng Tàu (Portal User)',
    type: 'PORTAL',
    description: 'Xem container thuộc hãng tàu mình, duyệt/từ chối báo giá & tải hóa đơn',
    permissions: ['Container.ViewOwn', 'Estimate.Approve', 'Estimate.Reject', 'Photos.View', 'Invoice.Download']
  }
];

export const MOCK_PORTAL_USERS: PortalUserItem[] = [
  {
    id: 'PU-001',
    companyId: 'COMP-002',
    companyName: 'MAERSK LINE A/S VIETNAM CO., LTD.',
    username: 'maersk.portal',
    fullName: 'Hans Nielsen',
    email: 'hans.nielsen@maersk.com',
    phone: '028-3823-0011',
    roleCode: 'PORTAL_SHIPPING_LINE',
    isActive: true,
    lastLogin: '2026-08-04 14:22:10'
  },
  {
    id: 'PU-002',
    companyId: 'COMP-003',
    companyName: 'MEDITERRANEAN SHIPPING COMPANY (MSC) S.A.',
    username: 'msc.portal',
    fullName: 'Marco Rossi',
    email: 'msc.vietnam@msc.com',
    phone: '028-3914-1122',
    roleCode: 'PORTAL_SHIPPING_LINE',
    isActive: true,
    lastLogin: '2026-08-04 11:05:45'
  },
  {
    id: 'PU-003',
    companyId: 'COMP-004',
    companyName: 'CÔNG TY CP VẬN TẢI & LOGISTICS TÂN BÌNH',
    username: 'tanbinh.transport',
    fullName: 'Trần Văn Nam',
    email: 'nam.tv@tanbinhlogistics.vn',
    phone: '0903-882-112',
    roleCode: 'PORTAL_TRANSPORT',
    isActive: true,
    lastLogin: '2026-08-03 16:40:00'
  }
];

export const MOCK_LOGIN_HISTORY: LoginHistoryItem[] = [
  { id: 'LOG-101', username: 'admin.depot', fullName: 'Nguyễn Văn Minh', userType: 'SYSTEM', ipAddress: '113.161.42.10', browser: 'Chrome 122.0 / Windows 11', device: 'Desktop', loginTime: '2026-08-04 16:15:02', result: 'SUCCESS' },
  { id: 'LOG-102', username: 'maersk.portal', fullName: 'Hans Nielsen', userType: 'PORTAL', ipAddress: '14.241.220.88', browser: 'Safari 17.3 / macOS', device: 'MacBook Pro', loginTime: '2026-08-04 14:22:10', result: 'SUCCESS' },
  { id: 'LOG-103', username: 'survey.manh', fullName: 'Trần Văn Mạnh', userType: 'SYSTEM', ipAddress: '113.161.42.12', browser: 'Chrome Mobile / Android', device: 'Galaxy Tab S9 (Tablet Giám định)', loginTime: '2026-08-04 13:45:00', result: 'SUCCESS' },
  { id: 'LOG-104', username: 'accountant.thao', fullName: 'Phạm Thị Thảo', userType: 'SYSTEM', ipAddress: '113.161.42.15', browser: 'Edge 121.0 / Windows 10', device: 'Desktop', loginTime: '2026-08-04 08:01:22', result: 'SUCCESS' },
  { id: 'LOG-105', username: 'msc.portal', fullName: 'Marco Rossi', userType: 'PORTAL', ipAddress: '118.69.182.5', browser: 'Chrome 122.0 / Windows 11', device: 'Desktop', loginTime: '2026-08-04 07:55:10', result: 'FAILED', failureReason: 'Sai mật khẩu 2 lần' }
];

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-801',
    username: 'admin.depot',
    fullName: 'Nguyễn Văn Minh',
    module: 'Cấu Hình Phân Quyền (RBAC)',
    action: 'UPDATE',
    description: 'Cập nhật quyền menu tab "Báo Giá Hãng Tàu" cho vai trò [OPERATOR]',
    ipAddress: '113.161.42.10',
    timestamp: '2026-08-04 16:20:11',
    dataBefore: { role: 'OPERATOR', allowedTabs: ['dashboard', 'jobs', 'survey', 'operation'] },
    dataAfter: { role: 'OPERATOR', allowedTabs: ['dashboard', 'jobs', 'survey', 'operation', 'estimate'] }
  },
  {
    id: 'AUD-802',
    username: 'accountant.thao',
    fullName: 'Phạm Thị Thảo',
    module: 'Thu Ngân & VietQR',
    action: 'PAYMENT',
    description: 'Xác nhận gạch nợ thành công hóa đơn phí vệ sinh cont MSKU9012837 (220,000 VND)',
    ipAddress: '113.161.42.15',
    timestamp: '2026-08-04 15:10:04',
    dataBefore: { paymentStatus: 'UNPAID', totalAmount: 220000 },
    dataAfter: { paymentStatus: 'PAID', paidAt: '2026-08-04 15:10:04', reference: 'FT26080499182' }
  },
  {
    id: 'AUD-803',
    username: 'maersk.portal',
    fullName: 'Hans Nielsen',
    module: 'Portal Hãng Tàu',
    action: 'APPROVE',
    description: 'Hãng tàu Maersk duyệt báo giá sửa chữa #EST-2026-0891 (3,450,000 VND)',
    ipAddress: '14.241.220.88',
    timestamp: '2026-08-04 14:25:30',
    dataBefore: { estimateStatus: 'PENDING_APPROVAL' },
    dataAfter: { estimateStatus: 'APPROVED', approvedBy: 'Hans Nielsen (Maersk)', approvedAt: '2026-08-04 14:25:30' }
  }
];

export const PermissionConfigModule: React.FC = () => {
  const { userProfiles, updateRoleTabs, addUserAccount, resetPermissionsToDefault, activeRole, setActiveRole } = useDepot();

  // Active Main Subtab
  const [activeTab, setActiveTab] = useState<
    'system_users' | 'role_groups' | 'roles' | 'permission_groups' | 'matrix' | 'data_scope' | 'workflows' | 'audit_logs' | 'system_config' | 'companies' | 'departments' | 'positions' | 'portal_users' | 'login_history' | 'architecture'
  >('matrix');

  // State for Lists
  const [companies, setCompanies] = useState<CompanyItem[]>(MOCK_COMPANIES);
  const [departments, setDepartments] = useState<DepartmentItem[]>(MOCK_DEPARTMENTS);
  const [positions, setPositions] = useState<PositionItem[]>(MOCK_POSITIONS);
  const [roles, setRoles] = useState<RoleItem[]>(MOCK_ROLES);
  const [roleGroups, setRoleGroups] = useState<RoleGroupItem[]>(MOCK_ROLE_GROUPS);
  const [dataScopes, setDataScopes] = useState<DataScopeRuleItem[]>(MOCK_DATA_SCOPES);
  const [workflows, setWorkflows] = useState<WorkflowRuleItem[]>(MOCK_WORKFLOWS);
  const [systemConfigs, setSystemConfigs] = useState<SystemConfigCategory[]>(MOCK_SYSTEM_CONFIGS);
  const [portalUsers, setPortalUsers] = useState<PortalUserItem[]>(MOCK_PORTAL_USERS);
  const [loginHistory] = useState<LoginHistoryItem[]>(MOCK_LOGIN_HISTORY);
  const [auditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('USR-001');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  
  const [isAuditDiffModalOpen, setIsAuditDiffModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null);

  // Add System User Form
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Phòng Khai Thác Cổng (Gate Ops)');
  const [newJobTitle, setNewJobTitle] = useState('Chuyên Viên Vận Hành');
  const [assignedRole, setAssignedRole] = useState<any>('OPERATOR');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Matrix tab toggle handlers
  const ALL_SYSTEM_TABS = [
    { id: 'dashboard', name: '1. Dashboard', code: 'Dashboard.View' },
    { id: 'jobs', name: '2. Container Jobs', code: 'Jobs.List' },
    { id: 'operation', name: '3. Gate Khai Thác', code: 'Gate.Execute' },
    { id: 'survey', name: '4. Giám Định', code: 'Survey.Manage' },
    { id: 'qc', name: '5. Nghiệm Thu QC', code: 'QC.Inspect' },
    { id: 'estimate', name: '6. Báo Giá', code: 'Estimate.Manage' },
    { id: 'repair', name: '7. Sửa Chữa', code: 'Repair.Execute' },
    { id: 'payment', name: '8. Thanh Toán', code: 'Payment.Process' },
    { id: 'yard', name: '9. Sơ Đồ Bãi', code: 'Yard.Manage' },
    { id: 'forklift', name: '10. Xe Nâng', code: 'Forklift.Move' },
    { id: 'inventory', name: '11. Vật Tư Kho', code: 'Inventory.Manage' },
    { id: 'masterdata', name: '12. Master Data', code: 'MasterData.Admin' },
    { id: 'portal_users', name: '13. Portal User', code: 'Portal.Manage' },
    { id: 'permissions', name: '14. Phân Quyền', code: 'RBAC.Admin' },
    { id: 'report', name: '15. Báo Cáo', code: 'Report.View' },
    { id: 'dotnet', name: '16. .NET 8 Arch', code: 'System.Arch' }
  ];

  const handleToggleTabForRole = (profileId: string, tabId: string) => {
    const profile = userProfiles.find((p) => p.id === profileId);
    if (!profile) return;
    const currentTabs = profile.allowedTabs || [];
    let updatedTabs: string[];
    if (currentTabs.includes(tabId)) {
      updatedTabs = currentTabs.filter((t) => t !== tabId);
    } else {
      updatedTabs = [...currentTabs, tabId];
    }
    updateRoleTabs(profileId, updatedTabs);
    showToast(`Đã cập nhật quyền Menu [${tabId}] cho ${profile.fullName}`);
  };

  const handleSelectAllTabs = (profileId: string) => {
    const allTabIds = ALL_SYSTEM_TABS.map((t) => t.id);
    updateRoleTabs(profileId, allTabIds);
    showToast(`Đã cấp toàn bộ quyền Menu cho vai trò.`);
  };

  const handleDeselectAllTabs = (profileId: string) => {
    updateRoleTabs(profileId, ['jobs']);
    showToast(`Đã thu hồi tất cả menu ngoại trừ Danh sách Jobs.`);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newUsername) return;

    const newProfile: UserAccountProfile = {
      id: `USR-${Date.now().toString().slice(-3)}`,
      role: assignedRole,
      username: newUsername.trim(),
      passwordHash: newPassword.trim(),
      fullName: newFullName.trim(),
      jobTitle: newJobTitle,
      department: newDepartment,
      email: newEmail || `${newUsername.trim()}@depotcontainer.vn`,
      avatarBg: 'bg-indigo-600',
      avatarText: newFullName.substring(0, 2).toUpperCase(),
      badgeBg: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      badgeText: 'Tài Khoản Mới',
      allowedTabs: ['dashboard', 'jobs', 'survey', 'operation'],
      roleDescription: `Tài khoản nhân sự thuộc ${newDepartment}`
    };

    addUserAccount(newProfile);
    setNewFullName('');
    setNewUsername('');
    showToast(`Thêm tài khoản thành công: ${newProfile.fullName}`);
    setActiveTab('system_users');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Module Phân Quyền & Quản Lý Định Danh (Authorization & Identity ERP)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                  .NET 8 RBAC MULTI-COMPANY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Quản lý Đa công ty (Multi-Company), Phòng ban, Chức vụ, Vai trò (Role), Ma trận Phân quyền (Permissions), Nhân viên nội bộ, Người dùng Portal Hãng tàu & Nhật ký Audit Log.
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetPermissionsToDefault}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Mặc Định</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Kiến Trúc .NET 8 & DB</span>
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS BAR */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {[
            { id: 'system_users', label: '1. Người Dùng (Users)', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'role_groups', label: '2. Nhóm Vai Trò', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
            { id: 'roles', label: '3. Vai Trò (Roles)', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'permission_groups', label: '4. Nhóm Quyền & Quyền', icon: <Key className="w-3.5 h-3.5" /> },
            { id: 'matrix', label: '5. Ma Trận & Menu', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'data_scope', label: '6. Phạm Vi Dữ Liệu', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'workflows', label: '7. Quy Trình Workflow', icon: <Workflow className="w-3.5 h-3.5" /> },
            { id: 'audit_logs', label: '8. Nhật Ký Hệ Thống', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'system_config', label: '9. Cấu Hình Hệ Thống', icon: <Settings className="w-3.5 h-3.5" /> },
            { id: 'companies', label: '10. Công Ty & Phòng Ban', icon: <Building2 className="w-3.5 h-3.5" /> },
            { id: 'portal_users', label: '11. Portal Hãng Tàu', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'architecture', label: '12. .NET 8 & DB Schema', icon: <Code2 className="w-3.5 h-3.5" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: MA TRẬN PHÂN QUYỀN (ROLE-PERMISSION MATRIX) */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Ma Trận Phân Quyền Menu & Chức Năng Hệ Thống (RBAC Matrix)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Bật / Tắt trực tiếp từng Menu Tab của các tài khoản nhân sự. Thanh sidebar sẽ tự động điều chỉnh tương ứng khi chọn tài khoản.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhân viên, vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse min-w-[1000px] text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                  <th className="py-3 px-4 font-bold sticky left-0 bg-slate-950 z-10 shadow-r">Nhân Sự & Vai Trò</th>
                  {ALL_SYSTEM_TABS.map((tab) => (
                    <th key={tab.id} className="py-3 px-2 text-center font-semibold text-[11px] border-l border-slate-800/60">
                      <span className="block text-slate-200 font-bold">{tab.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono font-normal">{tab.code}</span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center font-bold border-l border-slate-800">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {userProfiles
                  .filter(
                    (p) =>
                      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.department.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((usr) => {
                    const isCurrentLogged = usr.role === activeRole;
                    return (
                      <tr
                        key={usr.id}
                        className={`hover:bg-slate-800/50 transition ${
                          isCurrentLogged ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 sticky left-0 bg-slate-900 z-10 shadow-r border-r border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${usr.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                              {usr.avatarText}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-100">{usr.fullName}</span>
                                {isCurrentLogged && (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                    Đang Chọn
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{usr.jobTitle}</p>
                            </div>
                          </div>
                        </td>

                        {ALL_SYSTEM_TABS.map((tab) => {
                          const isAllowed = (usr.allowedTabs || []).includes(tab.id);
                          return (
                            <td key={tab.id} className="py-3 px-2 text-center border-l border-slate-800/60">
                              <button
                                onClick={() => handleToggleTabForRole(usr.id, tab.id)}
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition cursor-pointer ${
                                  isAllowed
                                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-500'
                                    : 'bg-slate-950 text-slate-600 hover:text-slate-400 hover:bg-slate-800 border border-slate-800'
                                }`}
                                title={`${isAllowed ? 'Thu hồi' : 'Cấp'} quyền [${tab.name}]`}
                              >
                                {isAllowed ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-center border-l border-slate-800">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setActiveRole(usr.role);
                                showToast(`Đã chuyển sang vai trò ${usr.fullName} (${usr.badgeText})`);
                              }}
                              className="px-2 py-1 bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-purple-200 text-[10px] rounded font-semibold transition cursor-pointer"
                              title="Chuyển ngay sang vai trò này để kiểm tra giao diện menu"
                            >
                              Thử vai trò
                            </button>
                            <button
                              onClick={() => handleSelectAllTabs(usr.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] rounded font-semibold transition cursor-pointer"
                            >
                              Tất cả
                            </button>
                            <button
                              onClick={() => handleDeselectAllTabs(usr.id)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] rounded font-semibold transition cursor-pointer"
                            >
                              Xóa hết
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: QUẢN LÝ CÔNG TY (MULTI-COMPANY) */}
      {/* ========================================================================= */}
      {activeTab === 'companies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Sách Công Ty & Đối Tác (Multi-Company Directory)</h3>
                <p className="text-xs text-slate-400">Quản lý các pháp nhân doanh nghiệp nội bộ Depot, Hãng tàu, Công ty Vận tải & Tổ thợ sửa chữa</p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingCompany(null);
                setIsCompanyModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Mới Công Ty</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Mã</th>
                  <th className="py-3.5 px-4">Tên Doanh Nghiệp / Công Ty</th>
                  <th className="py-3.5 px-3">Loại Hình</th>
                  <th className="py-3.5 px-3">Mã Số Thuế</th>
                  <th className="py-3.5 px-4">Người Liên Hệ</th>
                  <th className="py-3.5 px-3">Điện Thoại</th>
                  <th className="py-3.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{c.code}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{c.address}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-300 border border-slate-700">
                        {c.companyType === 'DEPOT_INTERNAL' && 'Nội Bộ Depot'}
                        {c.companyType === 'SHIPPING_LINE' && 'Hãng Tàu'}
                        {c.companyType === 'TRANSPORT' && 'Đơn Vị Vận Tải'}
                        {c.companyType === 'REPAIR_PARTNER' && 'Đối Tác Sửa Chữa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">{c.taxCode}</td>
                    <td className="py-3.5 px-4 text-slate-200">{c.contactPerson}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">{c.phone}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        onClick={() => {
                          setCompanies((prev) =>
                            prev.map((item) => (item.id === c.id ? { ...item, isActive: !item.isActive } : item))
                          );
                          showToast('Đã đổi trạng thái công ty.');
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                          c.isActive
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {c.isActive ? 'Hoạt Động' : 'Khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCompany(c);
                            setIsCompanyModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-amber-600 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: PHÒNG BAN (DEPARTMENTS) */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Sách Phòng Ban Cấu Trúc Depot (Departments)</h3>
                <p className="text-xs text-slate-400">Phân định sơ đồ tổ chức phòng ban nghiệp vụ & số lượng nhân sự trực thuộc</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở form thêm phòng ban mới')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Phòng Ban</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dep) => (
              <div key={dep.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    {dep.code}
                  </span>
                  <span className="text-xs text-blue-400 font-bold bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800">
                    {dep.userCount} nhân sự
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{dep.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{dep.description}</p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span>Trưởng phòng: <strong className="text-slate-100">{dep.managerName}</strong></span>
                  <div className="flex gap-1">
                    <button className="p-1 text-slate-400 hover:text-amber-400">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CHỨC VỤ (POSITIONS) */}
      {/* ========================================================================= */}
      {activeTab === 'positions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-xl text-white">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Mục Chức Vụ Chức Danh (Positions & Titles)</h3>
                <p className="text-xs text-slate-400">Định nghĩa cấp bậc thẩm quyền xử lý công việc & ký duyệt văn bản</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở form thêm mới chức vụ')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chức Vụ</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Mã Chức Vụ</th>
                  <th className="py-3.5 px-4">Tên Chức Vụ / Chức Danh</th>
                  <th className="py-3.5 px-3">Cấp Bậc (Level)</th>
                  <th className="py-3.5 px-6">Mô Tả Nhiệm Vụ</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{pos.code}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{pos.name}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        Cấp {pos.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-300">{pos.description}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-amber-600 transition">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-950 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: QUẢN LÝ VAI TRÒ (ROLES) */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Sách Vai Trò Động (Role Definitions)</h3>
                <p className="text-xs text-slate-400">Tạo mẫu vai trò công việc & sao chép phân quyền giữa các nhóm vai trò</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở form tạo Role động mới')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Role Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    {r.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {r.type === 'SYSTEM' ? 'Hệ Thống Nội Bộ' : 'Portal Hãng Tàu'}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{r.name}</h4>
                <p className="text-xs text-slate-400">{r.description}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{r.permissions.length} quyền đã cấp</span>
                  <button
                    onClick={() => showToast(`Đã sao chép phân quyền từ role ${r.code}`)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded text-[11px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sao chép quyền</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: NHÂN VIÊN NỘI BỘ (SYSTEM USERS) */}
      {/* ========================================================================= */}
      {activeTab === 'system_users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Sách Tài Khoản Nhân Viên Nội Bộ (System Users)</h3>
                <p className="text-xs text-slate-400">Quản lý tài khoản đăng nhập cán bộ nhân sự bãi Depot & gán phân quyền vai trò</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('matrix')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Nhân Viên Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Họ Và Tên Cán Bộ</th>
                  <th className="py-3.5 px-3">Username</th>
                  <th className="py-3.5 px-4">Phòng Ban</th>
                  <th className="py-3.5 px-3">Chức Danh</th>
                  <th className="py-3.5 px-3">Vai Trò (Role)</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {userProfiles.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${u.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                          {u.avatarText}
                        </div>
                        <div>
                          <div>{u.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">{u.username}</td>
                    <td className="py-3.5 px-4 text-slate-300">{u.department}</td>
                    <td className="py-3.5 px-3 text-slate-300">{u.jobTitle}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${u.badgeBg}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => showToast(`Đặt lại mật khẩu cho ${u.username} thành 123456`)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-bold"
                          title="Reset Password"
                        >
                          <Key className="w-3 h-3 inline mr-1" />
                          Reset Mật Khẩu
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 7: NGƯỜI DÙNG PORTAL (DEDICATED PORTAL MODULE SEPARATED) */}
      {/* ========================================================================= */}
      {activeTab === 'portal_users' && <PortalUserModule />}

      {/* ========================================================================= */}
      {/* SUBTAB 8: LỊCH SỬ ĐĂNG NHẬP (LOGIN HISTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'login_history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600 rounded-xl text-white">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nhật Ký Đăng Nhập Hệ Thống (Login History)</h3>
                <p className="text-xs text-slate-400">Theo dõi địa chỉ IP, thiết bị, trình duyệt & lịch sử đăng nhập thành công/thất bại</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Tài Khoản</th>
                  <th className="py-3.5 px-3">Loại Người Dùng</th>
                  <th className="py-3.5 px-3">IP Address</th>
                  <th className="py-3.5 px-4">Trình Duyệt & Thiết Bị</th>
                  <th className="py-3.5 px-4">Thời Gian Đăng Nhập</th>
                  <th className="py-3.5 px-3 text-center">Kết Quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loginHistory.map((lh) => (
                  <tr key={lh.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{lh.fullName}</div>
                      <div className="text-[10px] font-mono text-amber-300">{lh.username}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {lh.userType === 'SYSTEM' ? 'Nhân Viên Depot' : 'Portal Hãng Tàu'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-blue-300">{lh.ipAddress}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{lh.browser}</div>
                      <div className="text-[10px] text-slate-400">{lh.device}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{lh.loginTime}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          lh.result === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {lh.result === 'SUCCESS' ? 'Thành Công' : 'Thất Bại'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 9: NHẬT KÝ THAO TÁC (AUDIT LOGS) */}
      {/* ========================================================================= */}
      {activeTab === 'audit_logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-600 rounded-xl text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nhật Ký Thao Tác Hệ Thống (Audit Trail Logs)</h3>
                <p className="text-xs text-slate-400">Ghi nhận chi tiết mọi hành vi Thêm, Sửa, Xóa, Phê duyệt, Thanh toán & so sánh Diff dữ liệu</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Thời Gian</th>
                  <th className="py-3.5 px-4">Người Thực Hiện</th>
                  <th className="py-3.5 px-3">Phân Hệ (Module)</th>
                  <th className="py-3.5 px-3">Hành Động</th>
                  <th className="py-3.5 px-6">Chi Tiết Hành Vi</th>
                  <th className="py-3.5 px-4 text-center">Xem Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-300">{al.timestamp}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{al.fullName}</div>
                      <div className="text-[10px] font-mono text-amber-300">{al.username} ({al.ipAddress})</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">{al.module}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                        {al.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-200">{al.description}</td>
                    <td className="py-3.5 px-4 text-center">
                      {al.dataBefore && (
                        <button
                          onClick={() => {
                            setSelectedAuditLog(al);
                            setIsAuditDiffModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded text-[10px] font-bold flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Chi Tiết Diff</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: NHÓM VAI TRÒ (ROLE GROUPS) */}
      {/* ========================================================================= */}
      {activeTab === 'role_groups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-xl text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Sách Nhóm Vai Trò Hệ Thống (Role Groups Directory)</h3>
                <p className="text-xs text-slate-400">Phân loại 15 Nhóm Vai Trò cấp cao quản lý tập hợp các Vai Trò chi tiết theo phòng ban & chức năng</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Đã mở form tạo Nhóm Vai Trò mới')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Nhóm Vai Trò</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleGroups.map((rg) => (
              <div key={rg.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    {rg.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    rg.isSystemDefault ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {rg.isSystemDefault ? 'Mặc Định Hệ Thống' : 'Tùy Chỉnh Bãi'}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{rg.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rg.description}</p>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-blue-400"><strong>{rg.rolesCount}</strong> Vai trò</span>
                    <span className="font-mono text-emerald-400"><strong>{rg.usersCount}</strong> Nhân sự</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => showToast(`Cấu hình nhóm ${rg.code}`)} className="p-1 text-slate-400 hover:text-amber-400">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => showToast(`Gán quyền hàng loạt cho ${rg.code}`)} className="p-1 text-slate-400 hover:text-purple-400">
                      <Key className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: NHÓM QUYỀN & QUYỀN CHỨC NĂNG (PERMISSION GROUPS & ACTIONS) */}
      {/* ========================================================================= */}
      {activeTab === 'permission_groups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl text-white">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Danh Mục Nhóm Quyền & Quyền Chức Năng (Permissions Catalog)</h3>
                <p className="text-xs text-slate-400">Định nghĩa 22 Nhóm Quyền & Quyền thao tác Granular theo quy chuẩn Security Claim .NET 8</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở form định nghĩa Quyền Chức Năng mới')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Claim Quyền Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PERMISSION_GROUPS.map((pg) => (
              <div key={pg.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {pg.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ClaimType: Permission.{pg.code}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{pg.name}</h4>
                <p className="text-xs text-slate-400">{pg.description}</p>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {['View', 'Create', 'Update', 'Delete', 'Approve', 'Print', 'Export'].map((act) => (
                    <span key={act} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                      {pg.code}.{act}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: PHẠM VI DỮ LIỆU (DATA SCOPE RULES) */}
      {/* ========================================================================= */}
      {activeTab === 'data_scope' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cấu Hình Phạm Vi Dữ Liệu (Data Scope & Row-Level Security)</h3>
                <p className="text-xs text-slate-400">Thiết lập quy tắc lọc dữ liệu tự động ở tầng Database Query (Global, Company, Branch, Depot, Dept, Role, User)</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở form cấu hình Data Scope mới')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Quy Tắc Scope</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[11px]">
                  <th className="py-3.5 px-4">Tên Scope & Cấp Độ</th>
                  <th className="py-3.5 px-4">Đối Tượng Áp Dụng</th>
                  <th className="py-3.5 px-6">Điều Kiện Lọc SQL / LINQ Filter</th>
                  <th className="py-3.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dataScopes.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {ds.scopeType}
                        </span>
                        <span>{ds.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{ds.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-semibold">{ds.appliesTo}</td>
                    <td className="py-3.5 px-6 font-mono text-amber-300 text-[11px]">{ds.filterCondition}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        onClick={() => {
                          setDataScopes((prev) =>
                            prev.map((item) => (item.id === ds.id ? { ...item, isActive: !item.isActive } : item))
                          );
                          showToast('Đã chuyển đổi trạng thái Data Scope.');
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                          ds.isActive ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {ds.isActive ? 'Hoạt Động' : 'Tắt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => showToast(`Sửa quy tắc ${ds.name}`)} className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 7: QUY TRÌNH WORKFLOW (APPROVAL WORKFLOWS) */}
      {/* ========================================================================= */}
      {activeTab === 'workflows' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600 rounded-xl text-white">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Engine Quy Trình Phê Duyệt Tự Động (Approval Workflows)</h3>
                <p className="text-xs text-slate-400">Cấu hình các bước duyệt tự động cho Giám định, Báo giá Hãng tàu, QC Nghiệm thu, VietQR & Cấp quyền tài khoản</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Mở form tạo Workflow mới')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Quy Trình Workflow</span>
            </button>
          </div>

          <div className="space-y-4">
            {workflows.map((wf) => (
              <div key={wf.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {wf.code}
                    </span>
                    <h4 className="font-bold text-white text-sm">{wf.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Phân hệ: <strong className="text-slate-200">{wf.module}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      Sự kiện: {wf.triggerEvent}
                    </span>
                  </div>
                </div>

                {/* Workflow Steps Line */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Các Bước Thực Thi Trong Quy Trình:</label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {wf.approvalSteps.map((step, idx) => (
                      <React.Fragment key={idx}>
                        <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold shrink-0 flex items-center gap-2 shadow-sm">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                        {idx < wf.approvalSteps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                  <span>Hạn mức tự động: <strong className="text-amber-300 font-mono">{wf.maxThresholdVnd ? `${wf.maxThresholdVnd.toLocaleString('vi-VN')} VND` : 'Không giới hạn'}</strong></span>
                  <span>Thời gian tự chuyển cấp: <strong className="text-blue-300 font-mono">{wf.autoEscalationHours} giờ</strong></span>
                  <button onClick={() => showToast(`Cấu hình chi tiết workflow ${wf.code}`)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold">
                    Cấu hình chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 9: CẤU HÌNH HỆ THỐNG (SYSTEM CONFIGURATION & SETTINGS) */}
      {/* ========================================================================= */}
      {activeTab === 'system_config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cấu Hình Tham Số Hệ Thống ERP (System Settings)</h3>
                <p className="text-xs text-slate-400">Thiết lập tham số bãi, máy chủ Email SMTP, Cổng VietQR, AI OCR Engine & bảo mật JWT Session</p>
              </div>
            </div>

            <button
              onClick={() => showToast('Đã lưu toàn bộ cấu hình hệ thống thành công!')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Tham Số</span>
            </button>
          </div>

          <div className="space-y-6">
            {systemConfigs.map((cat) => (
              <div key={cat.category} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-400" />
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.settings.map((setting) => (
                    <div key={setting.key} className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">{setting.label}</label>
                        <span className="text-[10px] font-mono text-slate-500">{setting.key}</span>
                      </div>
                      
                      {setting.type === 'boolean' ? (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => {
                              setting.value = setting.value === 'true' ? 'false' : 'true';
                              setSystemConfigs([...systemConfigs]);
                              showToast(`Đã thay đổi ${setting.key}`);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                              setting.value === 'true'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {setting.value === 'true' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            <span>{setting.value === 'true' ? 'Bật (ENABLED)' : 'Tắt (DISABLED)'}</span>
                          </button>
                        </div>
                      ) : (
                        <input
                          type={setting.type === 'password' ? 'password' : 'text'}
                          defaultValue={setting.value}
                          onChange={(e) => { setting.value = e.target.value; }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      )}
                      
                      <p className="text-[10px] text-slate-400">{setting.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 10: ARCHITECTURE, USE CASES, DB ERD & .NET 8 APIS */}
      {/* ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tài Liệu Sơ Đồ Nghiệp Vụ, Cơ Sở Dữ Liệu ERD & API .NET 8</h3>
              <p className="text-xs text-slate-400">Thiết kế hoàn chỉnh phục vụ triển khai backend thương mại bằng .NET 8 Core & SQL Server</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* SECTION 1: BUSINESS FLOW & USE CASES */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Sparkles className="w-4 h-4" />
                1. Sơ Đồ Luồng Nghiệp Vụ Phân Quyền (Business Flow & RBAC)
              </h4>
              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p><strong>1. Đăng nhập & Xác thực JWT Token:</strong> Người dùng nhập Username/Password -&gt; API xác thực trả về JWT chứa Claims (UserId, CompanyId, DepartmentId, Roles, Permissions).</p>
                <p><strong>2. Kiểm tra RBAC Middleware:</strong> Mọi API endpoint .NET 8 kiểm tra Policy Authorization (ví dụ <code className="text-amber-300">[Authorize(Policy = "RequireSurveyorAccess")]</code>).</p>
                <p><strong>3. Lọc dữ liệu Multi-Tenant / Multi-Company:</strong> Company User (Hãng tàu) chỉ truy vấn dữ liệu có <code className="text-purple-300">CompanyId == CurrentUser.CompanyId</code>.</p>
                <p><strong>4. Ghi vết Audit Trail:</strong> Mọi lệnh Mutation (POST/PUT/DELETE) được Interceptor của Entity Framework Core tự động lưu vào bảng <code className="text-emerald-300">AuditLogs</code> kèm JSON Diff.</p>
              </div>
            </div>

            {/* SECTION 2: DATABASE ERD SCHEMA */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                <Database className="w-4 h-4" />
                2. Thiết Kế Cơ Sở Dữ Liệu SQL Server (Entity Framework Core Schema)
              </h4>
              <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 overflow-x-auto">
                <p className="text-amber-300">// Bảng Công ty & Tổ chức</p>
                <p>Companies (Id, Code, Name, CompanyType, TaxCode, Address, Phone, Email, IsActive)</p>
                <p className="text-amber-300">// Bảng Phòng ban & Chức vụ</p>
                <p>Departments (Id, CompanyId, Code, Name, ManagerId)</p>
                <p>Positions (Id, Code, Name, Level)</p>
                <p className="text-amber-300">// Bảng Vai trò & Quyền</p>
                <p>Roles (Id, Code, Name, RoleType, Description)</p>
                <p>Permissions (Id, GroupId, Code, Name, Action)</p>
                <p>RolePermissions (RoleId, PermissionId)</p>
                <p className="text-amber-300">// Bảng Tài khoản & Audit</p>
                <p>Users (Id, CompanyId, DepartmentId, PositionId, Username, PasswordHash, FullName, Email, IsActive)</p>
                <p>UserRoles (UserId, RoleId)</p>
                <p>AuditLogs (Id, UserId, Module, Action, Description, DataBeforeJson, DataAfterJson, Timestamp)</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: .NET 8 C# SAMPLE CODE */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2 font-sans">
              <Server className="w-4 h-4" />
              3. Mã Nguồn C# .NET 8 Authorization Policy Handler & AuditInterceptor
            </h4>
            <pre className="text-slate-300 overflow-x-auto p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
{`public class HasPermissionRequirement : IAuthorizationRequirement
{
    public string PermissionCode { get; }
    public HasPermissionRequirement(string permissionCode) => PermissionCode = permissionCode;
}

public class HasPermissionHandler : AuthorizationHandler<HasPermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HasPermissionRequirement requirement)
    {
        var hasPermission = context.User.Claims.Any(c => c.Type == "Permission" && c.Value == requirement.PermissionCode);
        if (hasPermission || context.User.IsInRole("ADMIN"))
        {
            context.Succeed(requirement);
        }
        return Task.CompletedTask;
    }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIT LOG DIFF MODAL VIEWER */}
      {/* ========================================================================= */}
      {isAuditDiffModalOpen && selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">CHI TIẾT SO SÁNH DỮ LIỆU (AUDIT DATA DIFF)</h3>
              </div>
              <button onClick={() => setIsAuditDiffModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div>Thao tác bởi: <strong className="text-white">{selectedAuditLog.fullName}</strong> (<span className="text-amber-300 font-mono">{selectedAuditLog.username}</span>)</div>
                <div>Phân hệ: <span className="text-blue-300">{selectedAuditLog.module}</span> • Thời gian: <span className="font-mono text-slate-400">{selectedAuditLog.timestamp}</span></div>
                <div className="text-slate-300 mt-1">{selectedAuditLog.description}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-bold text-xs text-rose-400 mb-2">Dữ Liệu Trước Khi Sửa (Before)</h5>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto">
                    {JSON.stringify(selectedAuditLog.dataBefore, null, 2)}
                  </pre>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-emerald-400 mb-2">Dữ Liệu Sau Khi Sửa (After)</h5>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    {JSON.stringify(selectedAuditLog.dataAfter, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAuditDiffModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPANY EDIT / CREATE MODAL */}
      {/* ========================================================================= */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCompany ? `CHỈNH SỬA CÔNG TY [ ${editingCompany.code} ]` : 'THÊM MỚI CÔNG TY ĐỐI TÁC'}
                </h3>
              </div>
              <button onClick={() => setIsCompanyModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã Công Ty *</label>
                  <input
                    type="text"
                    defaultValue={editingCompany?.code || ''}
                    placeholder="VD: MAERSK"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại Hình Doanh Nghiệp</label>
                  <select
                    defaultValue={editingCompany?.companyType || 'SHIPPING_LINE'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="DEPOT_INTERNAL">Nội Bộ Depot</option>
                    <option value="SHIPPING_LINE">Hãng Tàu</option>
                    <option value="TRANSPORT">Công Ty Vận Tải</option>
                    <option value="REPAIR_PARTNER">Đối Tác Sửa Chữa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Công Ty Đầy Đủ *</label>
                <input
                  type="text"
                  defaultValue={editingCompany?.name || ''}
                  placeholder="VD: MAERSK LINE VIETNAM CO., LTD."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã Số Thuế</label>
                  <input
                    type="text"
                    defaultValue={editingCompany?.taxCode || ''}
                    placeholder="VD: 0302881920"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Điện Thoại</label>
                  <input
                    type="text"
                    defaultValue={editingCompany?.phone || ''}
                    placeholder="VD: 028-3823-0011"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Địa Chỉ Đăng Ký Kinh Doanh</label>
                <input
                  type="text"
                  defaultValue={editingCompany?.address || ''}
                  placeholder="VD: Số 54-56 Nguyễn Trãi, Q.1, TP.HCM"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  showToast('Đã lưu thông tin công ty thành công.');
                  setIsCompanyModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg"
              >
                Lưu Công Ty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
