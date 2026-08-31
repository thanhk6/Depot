export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  badgeBg: string;
  permissions: string[];
}

export const PERMISSIONS = {
  // Container
  CONTAINER_VIEW: 'container.view',
  CONTAINER_CREATE: 'container.create',
  CONTAINER_EDIT: 'container.edit',
  CONTAINER_DELETE: 'container.delete',

  // Gate
  GATE_IN: 'gate.in',
  GATE_OUT: 'gate.out',
  GATE_EDI_SYNC: 'gate.edi_sync',

  // Survey
  SURVEY_VIEW: 'survey.view',
  SURVEY_CREATE: 'survey.create',
  SURVEY_EDIT: 'survey.edit',
  SURVEY_APPROVE: 'survey.approve',

  // Operation & Tariff
  OPERATION_VIEW: 'operation.view',
  OPERATION_CREATE: 'operation.create',

  // Payment
  PAYMENT_VIEW: 'payment.view',
  PAYMENT_CREATE: 'payment.create',
  PAYMENT_CONFIRM: 'payment.confirm',

  // Yard & Konva Map
  YARD_VIEW: 'yard.view',
  YARD_MANAGE: 'yard.manage',

  // Forklift Dispatch
  FORKLIFT_VIEW: 'forklift.view',
  FORKLIFT_DISPATCH: 'forklift.dispatch',
  FORKLIFT_COMPLETE: 'forklift.complete',

  // Estimate EMR
  ESTIMATE_VIEW: 'estimate.view',
  ESTIMATE_CREATE: 'estimate.create',
  ESTIMATE_SUBMIT: 'estimate.submit',

  // Approval
  APPROVAL_VIEW: 'approval.view',
  APPROVAL_APPROVE: 'approval.approve',
  APPROVAL_REJECT: 'approval.reject',
  APPROVAL_REVISE: 'approval.revise',

  // Repair
  REPAIR_VIEW: 'repair.view',
  REPAIR_CREATE: 'repair.create',
  REPAIR_ASSIGN: 'repair.assign',
  REPAIR_COMPLETE: 'repair.complete',

  // QC
  QC_VIEW: 'qc.view',
  QC_INSPECT: 'qc.inspect',
  QC_APPROVE: 'qc.approve',
  QC_REJECT: 'qc.reject',

  // Cleaning
  CLEANING_VIEW: 'cleaning.view',
  CLEANING_EXECUTE: 'cleaning.execute',
  CLEANING_HANDOVER: 'cleaning.handover',

  // Warehouse & Inventory
  WAREHOUSE_VIEW: 'warehouse.view',
  WAREHOUSE_IMPORT: 'warehouse.import',
  WAREHOUSE_EXPORT: 'warehouse.export',

  // Billing & Accounting
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_APPROVE: 'billing.approve',

  // Customer & Shipping Line
  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_MANAGE: 'customer.manage',

  // Report
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  // System
  SYSTEM_MANAGE: 'system.manage'
} as const;

export const ROLES: RoleDefinition[] = [
  {
    id: 'ROLE_ADMIN',
    name: 'Quản Lý Tổng Depot (Admin)',
    code: 'ADMIN',
    description: 'Toàn quyền vận hành, phân quyền, cấu hình tariff và báo cáo chỉ số KPI toàn hệ thống',
    badgeBg: 'bg-slate-800 text-slate-100 border-slate-700',
    permissions: Object.values(PERMISSIONS)
  },
  {
    id: 'ROLE_SURVEYOR',
    name: 'Giám Định Viên (Surveyor)',
    code: 'SURVEYOR',
    description: 'Kiểm tra vỏ cont tại cổng, nhập mã hư hỏng IICL, chụp ảnh e-EIR & phân loại AV/CL/DM',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.SURVEY_VIEW,
      PERMISSIONS.SURVEY_CREATE,
      PERMISSIONS.SURVEY_EDIT,
      PERMISSIONS.YARD_VIEW
    ]
  },
  {
    id: 'ROLE_GATE_OPERATOR',
    name: 'Khai Thác Cổng (Gate Operator)',
    code: 'GATE_OP',
    description: 'Tiếp nhận xe đầu kéo, quét số container, in Phiếu Dịch Vụ Cổng & thực hiện Gate-Out',
    badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.GATE_IN,
      PERMISSIONS.GATE_OUT,
      PERMISSIONS.GATE_EDI_SYNC,
      PERMISSIONS.OPERATION_VIEW,
      PERMISSIONS.OPERATION_CREATE,
      PERMISSIONS.PAYMENT_VIEW
    ]
  },
  {
    id: 'ROLE_CASHIER',
    name: 'Thu Ngân / Kế Toán (Cashier)',
    code: 'CASHIER',
    description: 'Quản lý gạch nợ VietQR tự động, thu tiền mặt/chuyển khoản, đối soát cước lưu bãi & hóa đơn',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.PAYMENT_VIEW,
      PERMISSIONS.PAYMENT_CREATE,
      PERMISSIONS.PAYMENT_CONFIRM,
      PERMISSIONS.BILLING_VIEW,
      PERMISSIONS.REPORT_VIEW
    ]
  },
  {
    id: 'ROLE_ESTIMATOR',
    name: 'Chuyên Viên Báo Giá (Estimator)',
    code: 'ESTIMATOR',
    description: 'Tính giờ công thợ & vật tư định mức MERC+/IICL, lập báo giá EMR & gửi Hãng tàu',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.SURVEY_VIEW,
      PERMISSIONS.ESTIMATE_VIEW,
      PERMISSIONS.ESTIMATE_CREATE,
      PERMISSIONS.ESTIMATE_SUBMIT,
      PERMISSIONS.WAREHOUSE_VIEW
    ]
  },
  {
    id: 'ROLE_SHIPPING_LINE',
    name: 'Đại Diện Hãng Tàu (Carrier)',
    code: 'CARRIER',
    description: 'Truy cập Portal Hãng tàu, tra cứu lịch sử container, xem ảnh hư hỏng IICL & Phê duyệt Báo giá',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.SURVEY_VIEW,
      PERMISSIONS.ESTIMATE_VIEW,
      PERMISSIONS.APPROVAL_VIEW,
      PERMISSIONS.APPROVAL_APPROVE,
      PERMISSIONS.APPROVAL_REJECT,
      PERMISSIONS.APPROVAL_REVISE,
      PERMISSIONS.BILLING_VIEW
    ]
  },
  {
    id: 'ROLE_TECHNICIAN',
    name: 'Thợ Sửa Chữa (Repair Tech)',
    code: 'TECHNICIAN',
    description: 'Nhận Lệnh Sửa Chữa Work Order, xuất kho thép/sơn/nhôm & cập nhật tiến độ gạt hàn',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.REPAIR_VIEW,
      PERMISSIONS.REPAIR_COMPLETE,
      PERMISSIONS.WAREHOUSE_VIEW,
      PERMISSIONS.WAREHOUSE_EXPORT
    ]
  },
  {
    id: 'ROLE_QC',
    name: 'Kỹ Sư QC (Inspection)',
    code: 'QC_ENG',
    description: 'Nghiệm thu kiểm tra kín sáng/nước, độ mịn mối hàn & chuyển trạng thái vỏ sang AV',
    badgeBg: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.REPAIR_VIEW,
      PERMISSIONS.QC_VIEW,
      PERMISSIONS.QC_INSPECT,
      PERMISSIONS.QC_APPROVE,
      PERMISSIONS.QC_REJECT
    ]
  },
  {
    id: 'ROLE_FORKLIFT',
    name: 'Tài Xế Xe Nâng (Forklift)',
    code: 'FORKLIFT',
    description: 'Màn hình Tablet điều bãi: Nhận vị trí Gate-In -> Di chuyển & Hạ bãi Block A/B/C',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.YARD_VIEW,
      PERMISSIONS.FORKLIFT_VIEW,
      PERMISSIONS.FORKLIFT_COMPLETE
    ]
  },
  {
    id: 'ROLE_CLEANING_STAFF',
    name: 'Tổ Vệ Sinh Bãi (Cleaning Staff)',
    code: 'CLEANING',
    description: 'Bảng công việc chuyên biệt: Nhận danh sách vỏ cần làm (CL), xịt rửa 200 Bar / hóa chất & bàn giao sang Khai Thác (AV)',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    permissions: [
      PERMISSIONS.CONTAINER_VIEW,
      PERMISSIONS.CLEANING_VIEW,
      PERMISSIONS.CLEANING_EXECUTE,
      PERMISSIONS.CLEANING_HANDOVER,
      PERMISSIONS.YARD_VIEW
    ]
  }
];
