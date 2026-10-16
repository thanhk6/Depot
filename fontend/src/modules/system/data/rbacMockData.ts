import { UserAccount, PermissionGroup, AuditLogEntry, SecurityPolicyConfig } from '../types/rbac';
import { PERMISSIONS } from '../../../constants/permissions';

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'PG_CONTAINER',
    name: 'Quản Lý Container & Danh Sách',
    description: 'Quyền xem, thêm mới, sửa và xóa hồ sơ vòng đời container',
    iconName: 'Boxes',
    permissions: [
      { code: PERMISSIONS.CONTAINER_VIEW, name: 'Xem Danh Sách & Chi Tiết Container', description: 'Cho phép tra cứu lịch sử, vị trí bãi và trạng thái' },
      { code: PERMISSIONS.CONTAINER_CREATE, name: 'Tạo Mới Hồ Sơ Container', description: 'Cho phép thêm container thủ công hoặc nhập excel' },
      { code: PERMISSIONS.CONTAINER_EDIT, name: 'Chỉnh Sửa Thông Tin Container', description: 'Cập nhật ISO code, hãng tàu, phân hạng vỏ' },
      { code: PERMISSIONS.CONTAINER_DELETE, name: 'Xóa / Huỷ Hồ Sơ Container', description: 'Xóa hồ sơ container khỏi hệ thống' }
    ]
  },
  {
    id: 'PG_GATE',
    name: 'Khai Thác Cổng (Gate In / Gate Out)',
    description: 'Quy trình tiếp nhận xe đầu kéo, in phiếu cổng và đồng bộ EDI',
    iconName: 'LogIn',
    permissions: [
      { code: PERMISSIONS.GATE_IN, name: 'Thực Hiện Check-in Cổng Nhập (Gate-In)', description: 'Tiếp nhận xe, quét OCR và mở phiếu e-EIR nhập bãi' },
      { code: PERMISSIONS.GATE_OUT, name: 'Thực Hiện Cấp Vỏ & Xuất Bãi (Gate-Out)', description: 'Khớp lệnh Booking, điều xe nâng và in phiếu EIR xuất' },
      { code: PERMISSIONS.GATE_EDI_SYNC, name: 'Đồng Bộ Điện Tử CODECO EDI', description: 'Gửi điện tín Gate-In/Gate-Out CODECO tới hãng tàu' }
    ]
  },
  {
    id: 'PG_SURVEY',
    name: 'Giám Định Vỏ (Survey IICL-6)',
    description: 'Kiểm tra hư hỏng, chụp ảnh e-EIR và phân loại Grade',
    iconName: 'ClipboardCheck',
    permissions: [
      { code: PERMISSIONS.SURVEY_VIEW, name: 'Xem Phiếu Giám Định & Ảnh Khuyết Tật', description: 'Tra cứu kết quả survey IICL' },
      { code: PERMISSIONS.SURVEY_CREATE, name: 'Lập Phiếu Giám Định e-EIR Mới', description: 'Ghi nhận mã hư hỏng IICL, kích thước và upload ảnh' },
      { code: PERMISSIONS.SURVEY_EDIT, name: 'Chỉnh Sửa Phiếu Giám Định', description: 'Cập nhật bổ sung khuyết tật theo yêu cầu' },
      { code: PERMISSIONS.SURVEY_APPROVE, name: 'Duyệt & Ký Số Phiếu Giám Định', description: 'Ký xác nhận chuyên môn giám định viên IICL' }
    ]
  },
  {
    id: 'PG_OPERATION_PAYMENT',
    name: 'Khai Thác & Thu Phí Dịch Vụ',
    description: 'Tính cước nâng hạ, lưu bãi và thu tiền tự động qua VietQR',
    iconName: 'CreditCard',
    permissions: [
      { code: PERMISSIONS.OPERATION_VIEW, name: 'Xem Bảng Khai Thác Gate-In & Tariff', description: 'Tra cứu biểu cước nâng hạ, lưu bãi' },
      { code: PERMISSIONS.OPERATION_CREATE, name: 'Lập Lệnh Dịch Vụ Cổng (SO)', description: 'Tính toán phí nâng hạ & lưu bãi cho tài xế' },
      { code: PERMISSIONS.PAYMENT_VIEW, name: 'Xem Bảng Thu Ngân & Giao Dịch', description: 'Theo dõi tiến trình thanh toán của tài xế' },
      { code: PERMISSIONS.PAYMENT_CREATE, name: 'Tạo Mã Thanh Toán VietQR', description: 'Sinh mã QR động Napas247' },
      { code: PERMISSIONS.PAYMENT_CONFIRM, name: 'Xác Nhận & Gạch Nợ Thủ Công', description: 'Gạch nợ khi nhận tiền mặt hoặc chuyển khoản ngân hàng' }
    ]
  },
  {
    id: 'PG_YARD_FORKLIFT',
    name: 'Sơ Đồ Bãi (Konva 2D) & Xe Nâng',
    description: 'Quản lý phân khu Block, tầng cao và điều xe nâng bãi',
    iconName: 'Grid3X3',
    permissions: [
      { code: PERMISSIONS.YARD_VIEW, name: 'Xem Sơ Đồ Bãi 2D/3D', description: 'Quan sát bố cục Block, Bay, Row, Tier' },
      { code: PERMISSIONS.YARD_MANAGE, name: 'Thiết Lập & Đảo Chuyển Vị Trí Vỏ', description: 'Đổi Block lưu cont, đổi phân khu AV/CL/DM' },
      { code: PERMISSIONS.FORKLIFT_VIEW, name: 'Xem Bảng Điều Xe Nâng', description: 'Danh sách lệnh xe nâng cần thực hiện' },
      { code: PERMISSIONS.FORKLIFT_DISPATCH, name: 'Phát Lệnh Điều Độ Xe Nâng', description: 'Giao việc gắp hạ cont cho tài xế xe nâng' },
      { code: PERMISSIONS.FORKLIFT_COMPLETE, name: 'Xác Nhận Hoàn Tất Gắp Hạ Bãi', description: 'Tài xế xe nâng bấm hoàn thành trên Tablet' }
    ]
  },
  {
    id: 'PG_ESTIMATE_APPROVAL',
    name: 'Báo Giá EMR & Phê Duyệt Hãng Tàu',
    description: 'Lập dự toán chi phí sửa chữa MERC+ và gửi Hãng tàu phê duyệt',
    iconName: 'Calculator',
    permissions: [
      { code: PERMISSIONS.ESTIMATE_VIEW, name: 'Xem Báo Giá Estimate', description: 'Tra cứu chi phí vật tư và nhân công' },
      { code: PERMISSIONS.ESTIMATE_CREATE, name: 'Lập & Tính Toán Dự Toán Báo Giá', description: 'Áp biểu giá MERC+/IICL-5' },
      { code: PERMISSIONS.ESTIMATE_SUBMIT, name: 'Gửi Báo Giá Sang Hãng Tàu', description: 'Chuyển dự toán sang trạng thái Chờ Hãng Tàu Duyệt' },
      { code: PERMISSIONS.APPROVAL_VIEW, name: 'Truy Cập Cổng Phê Duyệt Hãng Tàu', description: 'Xem hồ sơ duyệt cho Shipping Line' },
      { code: PERMISSIONS.APPROVAL_APPROVE, name: 'Phê Duyệt Báo Giá (Approve)', description: 'Chấp thuận ngân sách sửa chữa' },
      { code: PERMISSIONS.APPROVAL_REJECT, name: 'Từ Chối Báo Giá (Reject)', description: 'Bác bỏ báo giá kèm lý do' },
      { code: PERMISSIONS.APPROVAL_REVISE, name: 'Yêu Cầu Điều Chỉnh Báo Giá (Revise)', description: 'Yêu cầu Depot sửa lại khối lượng công việc' }
    ]
  },
  {
    id: 'PG_REPAIR_QC',
    name: 'Sửa Chữa (Work Order) & Kỹ Thuật QC',
    description: 'Quản lý thi công sửa chữa, vật tư và nghiệm thu chất lượng AV',
    iconName: 'Wrench',
    permissions: [
      { code: PERMISSIONS.REPAIR_VIEW, name: 'Xem Lệnh Sửa Chữa (WO)', description: 'Bảng Kanban tiến độ thi công của các tổ' },
      { code: PERMISSIONS.REPAIR_CREATE, name: 'Lập & Phân Công Lệnh Sửa Chữa', description: 'Giao lệnh cho tổ hàn, tổ ván sàn' },
      { code: PERMISSIONS.REPAIR_ASSIGN, name: 'Chỉ Định Thợ Sửa Chữa', description: 'Gán kỹ thuật viên chịu trách nhiệm' },
      { code: PERMISSIONS.REPAIR_COMPLETE, name: 'Báo Cáo Sửa Chữa Hoàn Tất', description: 'Chuyển cont sang chờ nghiệm thu QC' },
      { code: PERMISSIONS.QC_VIEW, name: 'Xem Hồ Sơ Kiểm Tra QC', description: 'Tra cứu lịch sử nghiệm thu chất lượng' },
      { code: PERMISSIONS.QC_INSPECT, name: 'Thực Hiện Kiểm Định & Đăng Ảnh QC', description: 'Test độ kín sáng, nước, mối hàn' },
      { code: PERMISSIONS.QC_APPROVE, name: 'Cấp Chứng Chỉ Nghiệm Thu ĐẠT (AV Grade)', description: 'Mở khóa trạng thái vỏ sẵn sàng cấp trả' },
      { code: PERMISSIONS.QC_REJECT, name: 'Trả Về Sửa Chữa Lại (QC Reject)', description: 'Yêu cầu thợ khắc phục khuyết tật' }
    ]
  },
  {
    id: 'PG_CLEANING_WAREHOUSE',
    name: 'Vệ Sinh Bãi & Kho Vật Tư EMR',
    description: 'Quy trình bệ rửa hóa chất và quản lý nhập xuất tồn vật tư',
    iconName: 'Droplets',
    permissions: [
      { code: PERMISSIONS.CLEANING_VIEW, name: 'Xem Danh Sách Cần Vệ Sinh (CL)', description: 'Theo dõi vỏ dơ bẩn tại bệ rửa' },
      { code: PERMISSIONS.CLEANING_EXECUTE, name: 'Thực Hiện Xịt Rửa & Vệ Sinh', description: 'Ghi nhận hóa chất và phương pháp rửa' },
      { code: PERMISSIONS.CLEANING_HANDOVER, name: 'Bàn Giao Vỏ Sạch Lên Bãi (AV)', description: 'Hoàn tất vệ sinh' },
      { code: PERMISSIONS.WAREHOUSE_VIEW, name: 'Xem Tồn Kho Vật Tư Sửa Chữa', description: 'Tra cứu thép lá, sơn phủ, ván ép' },
      { code: PERMISSIONS.WAREHOUSE_IMPORT, name: 'Nhập Kho Vật Tư Mới', description: 'Tạo phiếu nhập kho và tăng tồn' },
      { code: PERMISSIONS.WAREHOUSE_EXPORT, name: 'Xuất Kho Vật Tư Theo Lệnh WO', description: 'Trừ tồn kho khi thợ nhận vật tư' }
    ]
  },
  {
    id: 'PG_BILLING_SYSTEM',
    name: 'Công Nợ, Báo Cáo & Quản Trị Hệ Thống',
    description: 'Quyết toán công nợ hãng tàu, KPI và toàn quyền quản trị RBAC',
    iconName: 'Settings',
    permissions: [
      { code: PERMISSIONS.BILLING_VIEW, name: 'Xem Báo Cáo Công Nợ Hãng Tàu', description: 'Theo dõi Aging Debt và kỳ quyết toán' },
      { code: PERMISSIONS.BILLING_CREATE, name: 'Lập Bảng Kê Đối Soát Hóa Đơn', description: 'Tổng hợp chi phí EMR gửi hãng tàu' },
      { code: PERMISSIONS.BILLING_APPROVE, name: 'Duyệt Quyết Toán Công Nợ', description: 'Ký duyệt hồ sơ tài chính' },
      { code: PERMISSIONS.CUSTOMER_VIEW, name: 'Xem Danh Mục Khách Hàng & FWD', description: 'Tra cứu thông tin nhà xe, chủ hàng' },
      { code: PERMISSIONS.CUSTOMER_MANAGE, name: 'Thêm/Sửa Danh Mục Khách Hàng', description: 'Cấu hình hạn mức tín dụng' },
      { code: PERMISSIONS.REPORT_VIEW, name: 'Xem Báo Cáo Thống Kê & KPI', description: 'Biểu đồ năng suất khai thác depot' },
      { code: PERMISSIONS.REPORT_EXPORT, name: 'Xuất Dữ Liệu Excel / PDF', description: 'Download báo cáo toàn diện' },
      { code: PERMISSIONS.SYSTEM_MANAGE, name: 'Toàn Quyền Quản Trị Hệ Thống (RBAC & Users)', description: 'Tạo tài khoản, phân quyền vai trò và audit logs' }
    ]
  }
];

export const INITIAL_SECURITY_POLICY: SecurityPolicyConfig = {
  passwordMinLength: 8,
  requireSpecialChar: true,
  requireUppercase: true,
  requireDigits: true,
  passwordExpireDays: 90,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  sessionTimeoutMinutes: 60,
  // Giá trị hiển thị tạm trước khi tải chính sách thật từ backend (khớp mặc định SystemSecurityPolicy) — bỏ 3 dải IP bịa.
  enforce2FAForAdmins: false,
  ipWhitelistEnabled: false,
  allowedIpRanges: []
};
