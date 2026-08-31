import { UserAccount, PermissionGroup, AuditLogEntry, SecurityPolicyConfig } from '../types/rbac';
import { PERMISSIONS } from '../../../constants/permissions';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-001',
    username: 'admin.thanh',
    fullName: 'Nguyễn Tất Thành',
    email: 'admin@solutiondepot.vn',
    phone: '0908.123.456',
    roleId: 'ROLE_ADMIN',
    roleCode: 'ADMIN',
    roleName: 'Quản Lý Tổng Depot (Admin)',
    department: 'Ban Giám Đốc & Vận Hành',
    employeeCode: 'EMP-001',
    status: 'ACTIVE',
    is2FAEnabled: true,
    lastLoginAt: '2026-08-16 09:50:12',
    lastLoginIp: '113.161.44.12 (Depot Cát Lái)',
    createdAt: '2025-01-01',
    notes: 'Quản trị viên cấp cao toàn quyền quản lý hệ thống Depot.'
  },
  {
    id: 'USR-002',
    username: 'surveyor.nam',
    fullName: 'Lê Hoàng Nam',
    email: 'nam.le@depot-survey.vn',
    phone: '0912.345.678',
    roleId: 'ROLE_SURVEYOR',
    roleCode: 'SURVEYOR',
    roleName: 'Giám Định Viên (Surveyor)',
    department: 'Phòng Giám Định IICL-6',
    employeeCode: 'EMP-014',
    status: 'ACTIVE',
    is2FAEnabled: true,
    lastLoginAt: '2026-08-16 08:35:00',
    lastLoginIp: '113.161.44.18 (Gate Tablet #01)',
    createdAt: '2025-02-15',
    notes: 'Chứng chỉ giám định viên quốc tế IICL-6 số VN-9982.'
  },
  {
    id: 'USR-003',
    username: 'surveyor.tuan',
    fullName: 'Phạm Thanh Tuấn',
    email: 'tuan.pham@depot-survey.vn',
    phone: '0933.771.229',
    roleId: 'ROLE_SURVEYOR',
    roleCode: 'SURVEYOR',
    roleName: 'Giám Định Viên (Surveyor)',
    department: 'Phòng Giám Định IICL-6',
    employeeCode: 'EMP-019',
    status: 'ACTIVE',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-16 07:45:10',
    lastLoginIp: '113.161.44.19 (Gate Tablet #02)',
    createdAt: '2025-03-01',
    notes: 'Chuyên trách giám định container lạnh (Reefer Box PTI).'
  },
  {
    id: 'USR-004',
    username: 'gate.huy',
    fullName: 'Đặng Quốc Huy',
    email: 'huy.dang@depot-gate.vn',
    phone: '0944.556.789',
    roleId: 'ROLE_GATE_OPERATOR',
    roleCode: 'GATE_OP',
    roleName: 'Khai Thác Cổng (Gate Operator)',
    department: 'Phòng Khai Thác Cổng (Gate-In & Gate-Out)',
    employeeCode: 'EMP-022',
    status: 'ACTIVE',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-16 06:15:00',
    lastLoginIp: '113.161.44.20 (Lane 01 PC)',
    createdAt: '2025-02-01',
    notes: 'Trực ca ngày tại Làn 01 & Làn 03 Cổng Xuất.'
  },
  {
    id: 'USR-005',
    username: 'cashier.mai',
    fullName: 'Trần Thị Tuyết Mai',
    email: 'mai.tran@depot-finance.vn',
    phone: '0977.889.900',
    roleId: 'ROLE_CASHIER',
    roleCode: 'CASHIER',
    roleName: 'Thu Ngân / Kế Toán (Cashier)',
    department: 'Phòng Kế Toán & Thu Ngân',
    employeeCode: 'EMP-008',
    status: 'ACTIVE',
    is2FAEnabled: true,
    lastLoginAt: '2026-08-16 08:00:22',
    lastLoginIp: '113.161.44.15 (Finance Office)',
    createdAt: '2025-01-10',
    notes: 'Quản lý thu ngân VietQR & xuất hóa đơn điện tử VAT.'
  },
  {
    id: 'USR-006',
    username: 'estimator.khoa',
    fullName: 'Bùi Đăng Khoa',
    email: 'khoa.bui@depot-emr.vn',
    phone: '0988.112.334',
    roleId: 'ROLE_ESTIMATOR',
    roleCode: 'ESTIMATOR',
    roleName: 'Chuyên Viên Báo Giá (Estimator)',
    department: 'Phòng Kỹ Thuật & Báo Giá EMR',
    employeeCode: 'EMP-031',
    status: 'ACTIVE',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-16 09:10:45',
    lastLoginIp: '113.161.44.25 (EMR Estimator Room)',
    createdAt: '2025-04-01',
    notes: 'Chuyên viên lập báo giá MNR định mức IICL & hãng tàu Maersk.'
  },
  {
    id: 'USR-007',
    username: 'carrier.maersk',
    fullName: 'Michael Hansen (Maersk Rep)',
    email: 'm.hansen@maersk.com',
    phone: '+45 3363 3363',
    roleId: 'ROLE_SHIPPING_LINE',
    roleCode: 'CARRIER',
    roleName: 'Đại Diện Hãng Tàu (Carrier)',
    department: 'Maersk Line Equipment M&R Team',
    employeeCode: 'EXT-MSK-01',
    status: 'ACTIVE',
    is2FAEnabled: true,
    lastLoginAt: '2026-08-16 08:20:15',
    lastLoginIp: '194.255.48.91 (Copenhagen / VN VPN)',
    createdAt: '2025-01-15',
    notes: 'Đại diện Hãng Tàu Maersk phê duyệt báo giá sửa chữa từ xa qua Web Portal.'
  },
  {
    id: 'USR-008',
    username: 'tech.son',
    fullName: 'Hoàng Văn Sơn',
    email: 'son.hoang@depot-repair.vn',
    phone: '0966.334.556',
    roleId: 'ROLE_TECHNICIAN',
    roleCode: 'TECHNICIAN',
    roleName: 'Thợ Sửa Chữa (Repair Tech)',
    department: 'Xưởng Sửa Chữa Cơ Khí Container',
    employeeCode: 'EMP-055',
    status: 'ACTIVE',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-16 07:00:00',
    lastLoginIp: '113.161.44.40 (Workshop Tablet #01)',
    createdAt: '2025-03-10',
    notes: 'Tổ trưởng tổ hàn vách, nắn đà đáy và thay ván sàn gỗ.'
  },
  {
    id: 'USR-009',
    username: 'qc.viet',
    fullName: 'Vũ Quốc Việt',
    email: 'viet.vu@depot-qc.vn',
    phone: '0903.998.811',
    roleId: 'ROLE_QC',
    roleCode: 'QC_ENG',
    roleName: 'Kỹ Sư QC (Inspection)',
    department: 'Ban Kiểm Soát Chất Lượng QC & M&R',
    employeeCode: 'EMP-005',
    status: 'ACTIVE',
    is2FAEnabled: true,
    lastLoginAt: '2026-08-16 08:00:00',
    lastLoginIp: '113.161.44.35 (QC Station)',
    createdAt: '2025-01-05',
    notes: 'Kỹ sư trưởng QC nghiệm thu chất lượng vỏ Grade AV.'
  },
  {
    id: 'USR-010',
    username: 'forklift.ba',
    fullName: 'Nguyễn Văn Ba',
    email: 'ba.nguyen@depot-yard.vn',
    phone: '0909.223.344',
    roleId: 'ROLE_FORKLIFT',
    roleCode: 'FORKLIFT',
    roleName: 'Tài Xế Xe Nâng (Forklift)',
    department: 'Đội Xe Cơ Giới Bãi',
    employeeCode: 'EMP-070',
    status: 'ACTIVE',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-16 06:00:00',
    lastLoginIp: '113.161.44.60 (Reach Stacker #02 Tablet)',
    createdAt: '2025-02-20',
    notes: 'Lái xe nâng Reach Stacker 45T chuyên gắp cont hạ bãi Block A & B.'
  },
  {
    id: 'USR-011',
    username: 'cleaning.phuong',
    fullName: 'Trần Minh Phương',
    email: 'phuong.tran@depot-clean.vn',
    phone: '0918.776.554',
    roleId: 'ROLE_CLEANING_STAFF',
    roleCode: 'CLEANING',
    roleName: 'Tổ Vệ Sinh Bãi (Cleaning Staff)',
    department: 'Khu Vực Bệ Rửa (Cleaning Bay)',
    employeeCode: 'EMP-082',
    status: 'ACTIVE',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-16 07:15:30',
    lastLoginIp: '113.161.44.75 (Cleaning Bay Kiosk)',
    createdAt: '2025-05-01',
    notes: 'Tổ trưởng tổ vệ sinh xịt rửa 200 Bar & khử mùi hóa chất.'
  },
  {
    id: 'USR-012',
    username: 'locked.user',
    fullName: 'Đoàn Văn Tiến',
    email: 'tien.doan@depot-guest.vn',
    phone: '0901.000.999',
    roleId: 'ROLE_GATE_OPERATOR',
    roleCode: 'GATE_OP',
    roleName: 'Khai Thác Cổng (Gate Operator)',
    department: 'Phòng Khai Thác Cổng',
    employeeCode: 'EMP-099',
    status: 'LOCKED',
    is2FAEnabled: false,
    lastLoginAt: '2026-08-10 17:30:00',
    lastLoginIp: '113.161.44.20',
    createdAt: '2025-06-01',
    notes: 'Tài khoản tạm khóa do chuyển công tác.'
  }
];

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

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-08-16 09:50:12',
    userId: 'USR-001',
    userName: 'Nguyễn Tất Thành',
    userRole: 'Quản Lý Tổng Depot (Admin)',
    action: 'LOGIN',
    actionLabel: 'Đăng Nhập Thành Công',
    targetResource: 'Hệ Thống ERP Depot Core',
    ipAddress: '113.161.44.12',
    deviceInfo: 'Chrome 128 / macOS 15.1',
    status: 'SUCCESS',
    details: 'Đăng nhập thành công với xác thực 2 bước (2FA OTP).'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-08-16 09:35:40',
    userId: 'USR-001',
    userName: 'Nguyễn Tất Thành',
    userRole: 'Quản Lý Tổng Depot (Admin)',
    action: 'CHANGE_PERMISSIONS',
    actionLabel: 'Cập Nhật Quyền Hạn Vai Trò',
    targetResource: 'ROLE_QC (Kỹ Sư QC)',
    ipAddress: '113.161.44.12',
    deviceInfo: 'Chrome 128 / macOS 15.1',
    status: 'SUCCESS',
    details: 'Đã bổ sung quyền "gate.out" cho vai trò Kỹ sư QC để kiểm tra trước khi xuất bãi.'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-08-16 08:30:15',
    userId: 'USR-007',
    userName: 'Michael Hansen',
    userRole: 'Đại Diện Hãng Tàu (Carrier)',
    action: 'APPROVE_REPAIR',
    actionLabel: 'Phê Duyệt Báo Giá Sửa Chữa',
    targetResource: 'Báo Giá #EST-MSK-412 (APMU6621980)',
    ipAddress: '194.255.48.91',
    deviceInfo: 'Firefox 129 / Windows 11',
    status: 'SUCCESS',
    details: 'Maersk Line Equipment team phê duyệt hạn mức sửa chữa $65.00 USD.'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-08-16 08:14:22',
    userId: 'USR-009',
    userName: 'Vũ Quốc Việt',
    userRole: 'Kỹ Sư QC (Inspection)',
    action: 'API_TRANSMIT',
    actionLabel: 'Truyền API Báo Hãng Tàu',
    targetResource: 'Maersk M&R API Gateway v3',
    ipAddress: '113.161.44.35',
    deviceInfo: 'Edge 127 / Windows 11',
    status: 'SUCCESS',
    details: 'Đã truyền thành công 2 container (MSKU9082341, MRKU4521098). Mã ACK: MAE-ACK-2026-9812401.'
  },
  {
    id: 'AUD-905',
    timestamp: '2026-08-16 06:30:15',
    userId: 'USR-004',
    userName: 'Đặng Quốc Huy',
    userRole: 'Khai Thác Cổng (Gate Operator)',
    action: 'GATE_OUT_RELEASE',
    actionLabel: 'Xuất Bãi & Cấp Vỏ (Gate-Out)',
    targetResource: 'Container COSU6629104',
    ipAddress: '113.161.44.20',
    deviceInfo: 'Chrome 128 / Windows 10',
    status: 'SUCCESS',
    details: 'Cấp cont cho xe 51C-672.19 theo Booking BKG-COS-991823. Mã EIR: EIR-OUT-2026-0891.'
  },
  {
    id: 'AUD-906',
    timestamp: '2026-08-15 22:15:00',
    userId: 'USR-012',
    userName: 'Đoàn Văn Tiến',
    userRole: 'Khai Thác Cổng',
    action: 'LOGIN',
    actionLabel: 'Đăng Nhập Bị Chặn',
    targetResource: 'Hệ Thống ERP Depot Core',
    ipAddress: '14.162.88.200',
    deviceInfo: 'Mobile Safari / iOS 17.5',
    status: 'DENIED',
    details: 'Tài khoản đang bị khóa bởi Quản trị viên. Từ chối truy cập.'
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
  enforce2FAForAdmins: true,
  ipWhitelistEnabled: true,
  allowedIpRanges: ['113.161.44.0/24', '14.161.12.0/24', '194.255.48.0/24']
};
