import {
  ShippingLineDebt,
  DebtPeriod,
  Payment,
  PaymentAllocation,
  DebtAgingBucket
} from './types';

/**
 * Danh sách Hãng tàu đối tác công nợ
 * Hiện tại Depot đang hợp đồng quản lý công nợ trực tiếp với duy nhất Hãng tàu MAERSK LINE
 */
export const SHIPPING_LINES_LIST = [
  {
    id: 'MAERSK',
    name: 'MAERSK LINE A/S',
    code: 'MAEU',
    logo: 'MSK',
    color: 'sky',
    contractNo: 'DEPOT-EMR-MSK-2026',
    creditTerms: 'Net 30 Days',
    creditLimit: 100000000, // 100 triệu VNĐ
    taxCode: '0100109928',
    address: 'Tầng 14, Tòa nhà Bitexco Financial Tower, Quận 1, TP.HCM',
    contactPerson: 'Mr. Johnathan Smith / Ms. Lê Thị Mỹ Linh (EDI EMR Dept)',
    contactEmail: 'vietnam.emr.invoicing@maersk.com',
    bankAccount: '0071008899221 - Vietcombank CN Tân Bình'
  }
];

export const MOCK_BANKS = [
  { id: 'VCB', name: 'Vietcombank (Ngân hàng TMCP Ngoại Thương Việt Nam)', swift: 'BFTVVNVX', account: '0071008899221' },
  { id: 'TCB', name: 'Techcombank (Ngân hàng TMCP Kỹ Thương Việt Nam)', swift: 'VTCBVNVX', account: '1903456789012' },
  { id: 'HSBC', name: 'HSBC Bank Vietnam Ltd.', swift: 'HSBCVNVX', account: '001-987654-001' },
  { id: 'BIDV', name: 'BIDV (Ngân hàng TMCP Đầu Tư & Phát Triển Việt Nam)', swift: 'BIDVVNVX', account: '1241000088990' },
  { id: 'CITI', name: 'Citibank N.A. Vietnam Branch', swift: 'CITIVNVX', account: '0201992019' }
];

/**
 * Danh sách các kỳ công nợ (Debt Period) của MAERSK LINE
 * Thể hiện đúng nguyên tắc kế toán Depot: Dư cuối kỳ trước (ClosingBalance) = Dư đầu kỳ sau (OpeningBalance)
 */
export const INITIAL_DEBT_PERIODS: DebtPeriod[] = [
  // 1. Kỳ tháng 07/2026 (Đã chốt & đối soát hoàn tất)
  {
    id: 'PERIOD-MAERSK-2026-07',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    periodCode: '2026-07-01_2026-07-31',
    fromDate: '2026-07-01',
    toDate: '2026-07-31',
    openingBalance: 0,
    periodDebit: 45000000,
    periodCredit: 33000000,
    closingBalance: 12000000,
    status: 'CLOSED',
    createdAt: '2026-07-01 08:00:00',
    updatedAt: '2026-07-31 17:30:00',
    closedAt: '2026-07-31 17:30:00',
    closedBy: 'Nguyễn Thị Thu (Kế toán trưởng Depot)',
    currency: 'VND'
  },
  // 2. Kỳ 01 tháng 08/2026 (01/08 - 15/08 - Đã chốt) - Dư đầu = 12.000.000 (Từ kỳ tháng 07)
  {
    id: 'PERIOD-MAERSK-2026-08-01',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    periodCode: '2026-08-01_2026-08-15',
    fromDate: '2026-08-01',
    toDate: '2026-08-15',
    openingBalance: 12000000,
    periodDebit: 28500000,
    periodCredit: 22000000,
    closingBalance: 18500000,
    status: 'CLOSED',
    createdAt: '2026-08-01 08:00:00',
    updatedAt: '2026-08-15 17:30:00',
    closedAt: '2026-08-15 17:30:00',
    closedBy: 'Nguyễn Thị Thu (Kế toán trưởng Depot)',
    currency: 'VND'
  },
  // 3. Kỳ 02 tháng 08/2026 (16/08 - 31/08 - ĐANG MỞ) - Dư đầu = 18.500.000 (Từ kỳ 01 tháng 08)
  {
    id: 'PERIOD-MAERSK-2026-08-16',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    periodCode: '2026-08-16_2026-08-31',
    fromDate: '2026-08-16',
    toDate: '2026-08-31',
    openingBalance: 18500000,
    periodDebit: 15000000,
    periodCredit: 8000000,
    closingBalance: 25500000,
    status: 'OPEN',
    createdAt: '2026-08-16 08:00:00',
    updatedAt: '2026-08-18 10:00:00',
    currency: 'VND'
  }
];

/**
 * Danh sách các khoản công nợ chi tiết theo từng Container MAERSK
 * Lấy tự động từ Báo giá đã duyệt (WESTIM/EDI) + Lệnh sửa chữa hoàn thành (EMR QC Pass).
 */
export const INITIAL_SHIPPING_LINE_DEBTS: ShippingLineDebt[] = [
  // 1. MAERSK - Container MSKU1234567
  {
    id: 'DEBT-MSK-001',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-001',
    containerNo: 'MSKU1234567',
    quotationId: 'EST-REC-001',
    quotationNo: 'BG-2026-00125',
    repairId: 'WO-REC-001',
    repairNo: 'WO-20260816-00001',
    invoiceId: 'INV-2026-000125',
    invoiceNo: 'HD-2026-00125',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-16',
    dueDate: '2026-09-15',
    serviceType: 'REPAIR',
    description: 'Nắn nguội vách trái 3 sóng Corten + Hàn vá nóc trần thủng lọt sáng tiêu chuẩn IICL-6',
    totalAmount: 5000000,
    paidAmount: 3000000,
    remainingAmount: 2000000,
    status: 'PARTIAL',
    currency: 'VND',
    createdAt: '2026-08-16 09:30:00',
    updatedAt: '2026-08-17 14:00:00',
    approvalRef: 'MAE-AUTH-99812',
    notes: 'Báo giá duyệt tự động qua EDI WESTIM theo biểu giá EMR MAERSK 2026.'
  },
  // 2. MAERSK - Container MSKU7654321
  {
    id: 'DEBT-MSK-002',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-002',
    containerNo: 'MSKU7654321',
    quotationId: 'EST-REC-002',
    quotationNo: 'BG-2026-00126',
    repairId: 'WO-REC-002',
    repairNo: 'WO-20260816-00002',
    invoiceId: 'INV-2026-000125',
    invoiceNo: 'HD-2026-00125',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-16',
    dueDate: '2026-09-15',
    serviceType: 'REPAIR',
    description: 'Thay mới gioăng cửa cao su chữ J + Nắn thanh khóa gài cong vênh cánh phải',
    totalAmount: 2268000,
    paidAmount: 2000000,
    remainingAmount: 268000,
    status: 'PARTIAL',
    currency: 'VND',
    createdAt: '2026-08-16 10:00:00',
    updatedAt: '2026-08-17 14:00:00',
    approvalRef: 'MAE-AUTH-99813',
    notes: 'Thi công hoàn tất, kiểm định QC Pass đạt chuẩn bốc hàng Dry Foodgrade.'
  },
  // 3. MAERSK - Container MSKU8888999
  {
    id: 'DEBT-MSK-003',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-003',
    containerNo: 'MSKU8888999',
    quotationId: 'EST-REC-007',
    quotationNo: 'BG-2026-00127',
    repairId: 'WO-REC-003',
    repairNo: 'WO-20260816-00003',
    invoiceId: 'INV-2026-000126',
    invoiceNo: 'HD-2026-00126',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-17',
    dueDate: '2026-09-16',
    serviceType: 'REPAIR',
    description: 'Thay 2 tấm ván sàn Apitong 28mm chịu tải xe nâng 7,260kg',
    totalAmount: 4000000,
    paidAmount: 4000000,
    remainingAmount: 0,
    status: 'PAID',
    currency: 'VND',
    createdAt: '2026-08-17 08:30:00',
    updatedAt: '2026-08-17 14:00:00',
    approvalRef: 'MAE-AUTH-99815',
    notes: 'Đã tất toán 100% qua UNC Ngân hàng Vietcombank.'
  },
  // 4. MAERSK - Container MAEU4419208
  {
    id: 'DEBT-MSK-004',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-004',
    containerNo: 'MAEU4419208',
    quotationId: 'EST-REC-008',
    quotationNo: 'BG-2026-00128',
    repairId: 'WO-REC-004',
    repairNo: 'WO-20260816-00004',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-17',
    dueDate: '2026-09-16',
    serviceType: 'REPAIR',
    description: 'Hàn nứt xà gầm crossmember số 3 & số 4 + Sơn lót chống rỉ epoxy chuẩn Maersk Blue',
    totalAmount: 3732000,
    paidAmount: 0,
    remainingAmount: 3732000,
    status: 'UNPAID',
    currency: 'VND',
    createdAt: '2026-08-17 11:00:00',
    updatedAt: '2026-08-17 11:00:00',
    approvalRef: 'MAE-AUTH-99820',
    notes: 'Khoản nợ mới trong hạn Net 30, chưa xuất hóa đơn VAT.'
  },
  // 5. MAERSK - Container MSKU9920112
  {
    id: 'DEBT-MSK-005',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-005',
    containerNo: 'MSKU9920112',
    quotationId: 'EST-REC-009',
    quotationNo: 'BG-2026-00129',
    repairId: 'WO-REC-005',
    repairNo: 'WO-20260817-00005',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-17',
    dueDate: '2026-09-16',
    serviceType: 'REPAIR',
    description: 'Thay tấm tôn nóc số 2 (1.6mm) + Nắn gù đúc góc trên bên trái do va chạm cẩu cảng',
    totalAmount: 6500000,
    paidAmount: 0,
    remainingAmount: 6500000,
    status: 'UNPAID',
    currency: 'VND',
    createdAt: '2026-08-17 14:00:00',
    updatedAt: '2026-08-17 14:00:00',
    approvalRef: 'MAE-AUTH-99825',
    notes: 'Hạng mục sửa chữa lớn, đã có xác nhận điện tử từ Giám sát EMR Maersk.'
  },
  // 6. MAERSK - Container MAEU1109482 (Kỳ 01/08 - Đã trả trọn gói)
  {
    id: 'DEBT-MSK-006',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-006',
    containerNo: 'MAEU1109482',
    quotationId: 'EST-REC-010',
    quotationNo: 'BG-2026-00110',
    repairId: 'WO-REC-006',
    repairNo: 'WO-20260810-00001',
    invoiceId: 'INV-2026-000120',
    invoiceNo: 'HD-2026-00110',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-01',
    debtDate: '2026-08-10',
    dueDate: '2026-09-09',
    serviceType: 'CLEANING',
    description: 'Xịt rửa áp lực cao + Khử mùi tanh dầu mỡ sàn container thực phẩm',
    totalAmount: 1200000,
    paidAmount: 1200000,
    remainingAmount: 0,
    status: 'PAID',
    currency: 'VND',
    createdAt: '2026-08-10 09:00:00',
    updatedAt: '2026-08-14 15:00:00',
    approvalRef: 'MAE-AUTH-99750',
    notes: 'Đã hoàn tất thanh toán trong kỳ 01 tháng 8.'
  },
  // 7. MAERSK - Container MSKU4550198
  {
    id: 'DEBT-MSK-007',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-007',
    containerNo: 'MSKU4550198',
    quotationId: 'EST-REC-011',
    quotationNo: 'BG-2026-00132',
    repairId: 'WO-REC-007',
    repairNo: 'WO-20260816-00006',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-16',
    dueDate: '2026-09-15',
    serviceType: 'REPAIR',
    description: 'Thay tay khóa cửa container + Cắt vá tôn vách phải 600x400mm',
    totalAmount: 4200000,
    paidAmount: 1000000,
    remainingAmount: 3200000,
    status: 'PARTIAL',
    currency: 'VND',
    createdAt: '2026-08-16 15:30:00',
    updatedAt: '2026-08-17 14:00:00',
    approvalRef: 'MAE-AUTH-99830',
    notes: 'Maersk tạm ứng 1.000.000đ khi mở lệnh.'
  },
  // 8. MAERSK - Container MAEU3391024
  {
    id: 'DEBT-MSK-008',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-008',
    containerNo: 'MAEU3391024',
    quotationId: 'EST-REC-012',
    quotationNo: 'BG-2026-00134',
    repairId: 'WO-REC-008',
    repairNo: 'WO-20260817-00007',
    debtPeriodId: 'PERIOD-MAERSK-2026-08-16',
    debtDate: '2026-08-17',
    dueDate: '2026-09-16',
    serviceType: 'PTI',
    description: 'Kiểm tra PTI cắm điện test lạnh dàn lạnh Carrier Transicold 24h',
    totalAmount: 1800000,
    paidAmount: 0,
    remainingAmount: 1800000,
    status: 'UNPAID',
    currency: 'VND',
    createdAt: '2026-08-17 16:00:00',
    updatedAt: '2026-08-17 16:00:00',
    approvalRef: 'MAE-AUTH-99835',
    notes: 'Cont lạnh Reefer chuẩn bị cấp cho chủ hàng thủy sản.'
  },
  // 9. MAERSK - Container MSKU8920194 (Kỳ tháng 7 - Quá hạn nhẹ)
  {
    id: 'DEBT-MSK-009',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    containerId: 'CONT-009',
    containerNo: 'MSKU8920194',
    quotationId: 'EST-REC-005',
    quotationNo: 'BG-2026-00095',
    repairId: 'WO-REC-009',
    repairNo: 'WO-20260718-00001',
    invoiceId: 'INV-2026-000105',
    invoiceNo: 'HD-2026-00095',
    debtPeriodId: 'PERIOD-MAERSK-2026-07',
    debtDate: '2026-07-18',
    dueDate: '2026-08-17', // Quá hạn 1 ngày
    serviceType: 'REPAIR',
    description: 'Đại tu thay 4 ván sàn + Nắn khung cửa và thay gioăng cao su',
    totalAmount: 8000000,
    paidAmount: 4000000,
    remainingAmount: 4000000,
    status: 'PARTIAL',
    currency: 'VND',
    createdAt: '2026-07-18 10:00:00',
    updatedAt: '2026-08-05 11:00:00',
    approvalRef: 'MAE-AUTH-99610',
    notes: 'Còn nợ 4,000,000đ từ kỳ tháng 7, dự kiến thanh toán cùng đợt UNC cuối tháng 8.'
  }
];

/**
 * Danh sách phiếu thanh toán (Payment) của MAERSK LINE
 */
export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'PAY-MSK-2026-001',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    paymentDate: '2026-08-17',
    paymentAmount: 8000000,
    currency: 'VND',
    paymentMethod: 'BANK_TRANSFER',
    bankName: 'Vietcombank (VCB - CN Tân Bình)',
    referenceNo: 'VCB-FT-20260817-MAE9921',
    status: 'CONFIRMED',
    notes: 'Thanh toán phân bổ đợt 1 tháng 8 cho các container sửa chữa hoàn thành (MSKU1234567, MSKU7654321, MSKU8888999)',
    recordedBy: 'Nguyễn Thị Thu (Kế toán AR Depot)',
    createdAt: '2026-08-17 14:00:00',
    allocations: [
      {
        id: 'ALC-MSK-001',
        paymentId: 'PAY-MSK-2026-001',
        shippingLineDebtId: 'DEBT-MSK-001',
        containerNo: 'MSKU1234567',
        quotationNo: 'BG-2026-00125',
        allocatedAmount: 2000000,
        currency: 'VND',
        createdAt: '2026-08-17 14:00:00'
      },
      {
        id: 'ALC-MSK-002',
        paymentId: 'PAY-MSK-2026-001',
        shippingLineDebtId: 'DEBT-MSK-002',
        containerNo: 'MSKU7654321',
        quotationNo: 'BG-2026-00126',
        allocatedAmount: 2000000,
        currency: 'VND',
        createdAt: '2026-08-17 14:00:00'
      },
      {
        id: 'ALC-MSK-003',
        paymentId: 'PAY-MSK-2026-001',
        shippingLineDebtId: 'DEBT-MSK-003',
        containerNo: 'MSKU8888999',
        quotationNo: 'BG-2026-00127',
        allocatedAmount: 4000000,
        currency: 'VND',
        createdAt: '2026-08-17 14:00:00'
      }
    ]
  },
  {
    id: 'PAY-MSK-2026-002',
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    paymentDate: '2026-08-14',
    paymentAmount: 22000000,
    currency: 'VND',
    paymentMethod: 'BANK_TRANSFER',
    bankName: 'Vietcombank (VCB - CN Tân Bình)',
    referenceNo: 'VCB-FT-20260814-MAE8810',
    status: 'CONFIRMED',
    notes: 'Thanh toán đối soát tất toán kỳ 01 tháng 08/2026',
    recordedBy: 'Nguyễn Thị Thu (Kế toán AR Depot)',
    createdAt: '2026-08-14 15:00:00',
    allocations: [
      {
        id: 'ALC-MSK-004',
        paymentId: 'PAY-MSK-2026-002',
        shippingLineDebtId: 'DEBT-MSK-006',
        containerNo: 'MAEU1109482',
        quotationNo: 'BG-2026-00110',
        allocatedAmount: 1200000,
        currency: 'VND',
        createdAt: '2026-08-14 15:00:00'
      }
    ]
  }
];

/**
 * Báo cáo tuổi nợ (Debt Aging Report) của MAERSK LINE
 */
export const INITIAL_AGING_DATA: DebtAgingBucket[] = [
  {
    shippingLineId: 'MAERSK',
    shippingLineName: 'MAERSK LINE A/S',
    currency: 'VND',
    bucket0_30: 21500000, // Các khoản nợ trong hạn phát sinh tháng 8
    bucket31_60: 4000000,  // Khoản nợ còn lại từ kỳ tháng 7 (MSKU8920194)
    bucket61_90: 0,
    bucketOver90: 0,
    totalReceivable: 25500000 // 21.500.000 + 4.000.000 = 25.500.000
  }
];
