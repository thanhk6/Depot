import { CONTAINER_SIZES, SHIPPING_LINES } from '../constants/container';

export interface ContainerRecord {
  id: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  shippingLine: string;
  condition: 'AV' | 'CL' | 'DM';
  status: string; // GATE_IN, SURVEYING, WAITING_PAYMENT, PAYMENT_SUCCESS, WAITING_FORKLIFT, IN_YARD, WAITING_ESTIMATE, WAITING_APPROVAL, APPROVED, REPAIRING, WAITING_QC, READY_FOR_USE, GATE_OUT
  licensePlate?: string;
  driverName?: string;
  driverPhone?: string;
  gateInDate: string;
  gateOutDate?: string;
  yardLocation?: {
    block: string;
    bay: string;
    row: string;
    tier: string;
  };
  surveyDetails?: {
    surveyorName: string;
    surveyDate: string;
    damages: {
      code: string;
      location: string;
      description: string;
      severity: string;
      image: string;
    }[];
  };
  tariffDetails?: {
    liftFee: number;
    storageFee: number;
    cleaningFee: number;
    total: number;
    paymentStatus: 'UNPAID' | 'PAID';
    paymentMethod?: string;
    transactionId?: string;
  };
  estimateDetails?: {
    estimateNo: string;
    createdAt: string;
    labourHours: number;
    labourCost: number;
    materialCost: number;
    totalCost: number;
    approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED';
    rejectReason?: string;
  };
  workOrderDetails?: {
    workOrderNo: string;
    technician: string;
    assignedAt: string;
    materialsIssued: { name: string; qty: number; unit: string }[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  };
  qcDetails?: {
    inspector: string;
    inspectedAt: string;
    lightTestPass: boolean;
    waterTightPass: boolean;
    structurePass: boolean;
    result: 'PASS' | 'FAIL';
    comments?: string;
  };
  timeline: {
    status: string;
    time: string;
    actor: string;
    note: string;
  }[];
}

// Global Mock Containers Database - All containers belong to Maersk Line (MAEU)
export const INITIAL_MOCK_CONTAINERS: ContainerRecord[] = [
  {
    id: 'CONT-001',
    containerNo: 'MSKU1234567',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MAEU',
    condition: 'DM',
    status: 'WAITING_APPROVAL',
    licensePlate: '51C-889.12',
    driverName: 'Trần Văn Tùng',
    driverPhone: '0908123456',
    gateInDate: '2026-08-10 08:30',
    yardLocation: { block: 'A', bay: '03', row: '02', tier: '01' },
    surveyDetails: {
      surveyorName: 'Lê Hoàng Nam',
      surveyDate: '2026-08-10 08:45',
      damages: [
        {
          code: 'CUT',
          location: 'Vách phải (Right Panel)',
          description: 'Rách vách tôn rãnh dọc 120mm x 40mm',
          severity: 'HIGH',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
        },
        {
          code: 'DELAMINATION',
          location: 'Sàn gỗ (Floor)',
          description: 'Gỗ sàn bị hở ván lót 300mm',
          severity: 'MEDIUM',
          image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    tariffDetails: {
      liftFee: 550000,
      storageFee: 180000,
      cleaningFee: 0,
      total: 730000,
      paymentStatus: 'PAID',
      paymentMethod: 'VietQR',
      transactionId: 'FT2608109921'
    },
    estimateDetails: {
      estimateNo: 'EST-MSK-901',
      createdAt: '2026-08-10 09:30',
      labourHours: 4.5,
      labourCost: 990000,
      materialCost: 1450000,
      totalCost: 2440000,
      approvalStatus: 'PENDING'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-10 08:30', actor: 'Cổng Vận Hành', note: 'Xe 51C-889.12 hạ bãi' },
      { status: 'SURVEYING', time: '2026-08-10 08:45', actor: 'Lê Hoàng Nam', note: 'Phát hiện 2 điểm tổn thất IICL (Phân loại DM)' },
      { status: 'PAYMENT_SUCCESS', time: '2026-08-10 09:00', actor: 'VietQR Webhook', note: 'Đã nhận 730,000đ gạch nợ nâng hạ' },
      { status: 'IN_YARD', time: '2026-08-10 09:15', actor: 'Xe nâng #02', note: 'Hạ vị trí Block A - Bay 03 - Row 02 - Tier 01' },
      { status: 'WAITING_APPROVAL', time: '2026-08-10 09:30', actor: 'Chuyên viên Báo giá', note: 'Gửi Báo giá #EST-MSK-901 cho đại diện Maersk Line' }
    ]
  },
  {
    id: 'CONT-002',
    containerNo: 'MAEU9821304',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry General',
    shippingLine: 'MAEU',
    condition: 'AV',
    status: 'READY_FOR_USE',
    licensePlate: '29H-771.22',
    driverName: 'Nguyễn Văn Hùng',
    driverPhone: '0912345678',
    gateInDate: '2026-08-09 14:20',
    yardLocation: { block: 'B', bay: '01', row: '04', tier: '02' },
    surveyDetails: {
      surveyorName: 'Phạm Thanh Tuấn',
      surveyDate: '2026-08-09 14:35',
      damages: []
    },
    tariffDetails: {
      liftFee: 350000,
      storageFee: 100000,
      cleaningFee: 0,
      total: 450000,
      paymentStatus: 'PAID',
      paymentMethod: 'VietQR',
      transactionId: 'FT2608091102'
    },
    qcDetails: {
      inspector: 'Vũ Quốc Việt',
      inspectedAt: '2026-08-09 16:00',
      lightTestPass: true,
      waterTightPass: true,
      structurePass: true,
      result: 'PASS',
      comments: 'Vỏ đạt tiêu chuẩn cấp trả cho chủ hàng'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-09 14:20', actor: 'Cổng Vận Hành', note: 'Check-in thành công' },
      { status: 'SURVEYING', time: '2026-08-09 14:35', actor: 'Phạm Thanh Tuấn', note: 'Vỏ cont sạch tốt, phân loại AV' },
      { status: 'IN_YARD', time: '2026-08-09 15:00', actor: 'Xe nâng #01', note: 'Lưu bãi Block B - Bay 01' },
      { status: 'READY_FOR_USE', time: '2026-08-09 16:00', actor: 'QC Vũ Quốc Việt', note: 'Nghiệm thu ĐẠT, sẵn sàng cấp trả' }
    ]
  },
  {
    id: 'CONT-003',
    containerNo: 'MRKU7712390',
    isoCode: '45R1',
    size: '40RH',
    type: 'Reefer Container',
    shippingLine: 'MAEU',
    condition: 'CL',
    status: 'WAITING_PAYMENT',
    licensePlate: '60C-991.02',
    driverName: 'Đỗ Văn Khải',
    driverPhone: '0988776655',
    gateInDate: '2026-08-10 11:10',
    yardLocation: { block: 'C', bay: '02', row: '01', tier: '01' },
    surveyDetails: {
      surveyorName: 'Lê Hoàng Nam',
      surveyDate: '2026-08-10 11:20',
      damages: [
        {
          code: 'CORROSION',
          location: 'Mặt sàn trong cont',
          description: 'Dơ bẩn nhiều bùn đất hôi thối do chở cá',
          severity: 'MEDIUM',
          image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    tariffDetails: {
      liftFee: 550000,
      storageFee: 0,
      cleaningFee: 450000,
      total: 1000000,
      paymentStatus: 'UNPAID'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-10 11:10', actor: 'Cổng Vận Hành', note: 'Cont lạnh MRKU7712390 nhập cổng' },
      { status: 'SURVEYING', time: '2026-08-10 11:20', actor: 'Lê Hoàng Nam', note: 'Phân loại CL (Cần rửa hóa chất khử mùi)' },
      { status: 'WAITING_PAYMENT', time: '2026-08-10 11:25', actor: 'Thu ngân', note: 'Phát sinh tổng phí 1,000,000đ. Chờ quẹt VietQR' }
    ]
  },
  {
    id: 'CONT-004',
    containerNo: 'APMU6621980',
    isoCode: '42G1',
    size: '40GP',
    type: 'Dry General',
    shippingLine: 'MAEU',
    condition: 'DM',
    status: 'REPAIRING',
    licensePlate: '51D-122.90',
    driverName: 'Đặng Quốc Huy',
    driverPhone: '0933445566',
    gateInDate: '2026-08-08 09:00',
    yardLocation: { block: 'A', bay: '01', row: '01', tier: '01' },
    surveyDetails: {
      surveyorName: 'Phạm Thanh Tuấn',
      surveyDate: '2026-08-08 09:15',
      damages: [
        {
          code: 'DENT',
          location: 'Vách trái (Left Panel)',
          description: 'Vách móp méo lõm >60mm',
          severity: 'HIGH',
          image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
        }
      ]
    },
    tariffDetails: {
      liftFee: 550000,
      storageFee: 270000,
      cleaningFee: 0,
      total: 820000,
      paymentStatus: 'PAID',
      paymentMethod: 'Chuyển Khoản',
      transactionId: 'FT260808001'
    },
    estimateDetails: {
      estimateNo: 'EST-MSK-412',
      createdAt: '2026-08-08 10:00',
      labourHours: 3.0,
      labourCost: 660000,
      materialCost: 850000,
      totalCost: 1510000,
      approvalStatus: 'APPROVED'
    },
    workOrderDetails: {
      workOrderNo: 'WO-2026-0881',
      technician: 'Hoàng Văn Sơn (Tổ gạt hàn)',
      assignedAt: '2026-08-10 08:00',
      materialsIssued: [
        { name: 'Thép lá rãnh 2.0mm', qty: 2, unit: 'Tấm' },
        { name: 'Sơn phủ chống rỉ xám', qty: 1, unit: 'Lít' }
      ],
      status: 'IN_PROGRESS'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-08 09:00', actor: 'Cổng Vận Hành', note: 'Check-in bãi EMR' },
      { status: 'APPROVED', time: '2026-08-09 11:00', actor: 'Đại diện Maersk Line', note: 'Đã duyệt báo giá $65.00 USD' },
      { status: 'REPAIRING', time: '2026-08-10 08:00', actor: 'Thợ Hoàng Văn Sơn', note: 'Bắt đầu gạt phẳng mối hàn vách' }
    ]
  },
  {
    id: 'CONT-005',
    containerNo: 'MAEU9021435',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MAEU',
    condition: 'AV',
    status: 'WAITING_PAYMENT',
    licensePlate: '51D-921.84',
    driverName: 'Nguyễn Tuấn Anh',
    driverPhone: '0903.882.119',
    gateInDate: '2026-08-14 08:15',
    surveyDetails: {
      surveyorName: 'Lê Hoàng Nam',
      surveyDate: '2026-08-14 08:25',
      damages: []
    },
    tariffDetails: {
      liftFee: 453600,
      storageFee: 0,
      cleaningFee: 0,
      total: 453600,
      paymentStatus: 'UNPAID'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-14 08:15', actor: 'Cổng Gate-In #01', note: 'Xe kéo 51D-921.84 vào cổng' },
      { status: 'SURVEYING', time: '2026-08-14 08:25', actor: 'Lê Hoàng Nam', note: 'Vỏ đạt chuẩn AV' },
      { status: 'WAITING_PAYMENT', time: '2026-08-14 08:30', actor: 'Khai thác Gate-In', note: 'Xuất phiếu thu #SO-2026-001 (453,600đ). Chờ thu tiền.' }
    ]
  },
  {
    id: 'CONT-006',
    containerNo: 'MSKU7829104',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry General',
    shippingLine: 'MAEU',
    condition: 'CL',
    status: 'WAITING_PAYMENT',
    licensePlate: '51C-733.91',
    driverName: 'Lê Hoàng Long',
    driverPhone: '0918.455.677',
    gateInDate: '2026-08-14 09:00',
    surveyDetails: {
      surveyorName: 'Phạm Thanh Tuấn',
      surveyDate: '2026-08-14 09:10',
      damages: []
    },
    tariffDetails: {
      liftFee: 302400,
      storageFee: 0,
      cleaningFee: 270000,
      total: 572400,
      paymentStatus: 'UNPAID'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-14 09:00', actor: 'Cổng Gate-In #02', note: 'Xe kéo 51C-733.91 hạ rỗng' },
      { status: 'SURVEYING', time: '2026-08-14 09:10', actor: 'Phạm Thanh Tuấn', note: 'Phân loại CL (Xịt rửa 200 Bar)' },
      { status: 'WAITING_PAYMENT', time: '2026-08-14 09:15', actor: 'Khai thác Gate-In', note: 'Xuất phiếu thu #SO-2026-002 (572,400đ). Chờ thu tiền.' }
    ]
  },
  {
    id: 'CONT-007',
    containerNo: 'MRKU3381902',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MAEU',
    condition: 'AV',
    status: 'WAITING_PAYMENT',
    licensePlate: '61C-455.12',
    driverName: 'Trương Gia Bình',
    driverPhone: '0977.223.344',
    gateInDate: '2026-08-14 09:40',
    surveyDetails: {
      surveyorName: 'Lê Hoàng Nam',
      surveyDate: '2026-08-14 09:50',
      damages: []
    },
    tariffDetails: {
      liftFee: 453600,
      storageFee: 120000,
      cleaningFee: 0,
      total: 573600,
      paymentStatus: 'UNPAID'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-14 09:40', actor: 'Cổng Gate-In #01', note: 'Xe kéo 61C-455.12 vào cổng' },
      { status: 'WAITING_PAYMENT', time: '2026-08-14 09:55', actor: 'Khai thác Gate-In', note: 'Xuất phiếu thu #SO-2026-003 (573,600đ).' }
    ]
  },
  {
    id: 'CONT-008',
    containerNo: 'APMU5521901',
    isoCode: '22G1',
    size: '20GP',
    type: 'Dry General',
    shippingLine: 'MAEU',
    condition: 'CL',
    status: 'WAITING_PAYMENT',
    licensePlate: '50H-882.19',
    driverName: 'Bùi Văn Nam',
    driverPhone: '0938.991.223',
    gateInDate: '2026-08-14 10:15',
    surveyDetails: {
      surveyorName: 'Phạm Thanh Tuấn',
      surveyDate: '2026-08-14 10:25',
      damages: []
    },
    tariffDetails: {
      liftFee: 302400,
      storageFee: 0,
      cleaningFee: 410400,
      total: 712800,
      paymentStatus: 'UNPAID'
    },
    timeline: [
      { status: 'GATE_IN', time: '2026-08-14 10:15', actor: 'Cổng Gate-In #02', note: 'Xe kéo 50H-882.19 vào cổng' },
      { status: 'WAITING_PAYMENT', time: '2026-08-14 10:30', actor: 'Khai thác Gate-In', note: 'Xuất phiếu thu #SO-2026-004 (712,800đ).' }
    ]
  }
];
