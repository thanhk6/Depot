import { ServiceOrder, ServiceOrderItem } from './types';

// Danh mục tariff dịch vụ mặc định dùng để tự động tính tiền
export interface StandardTariffItem {
  code: string;
  name: string;
  category: 'LOLO' | 'STORAGE' | 'CLEANING' | 'REEFER_POWER' | 'PTI' | 'YARD_SHIFT' | 'CUSTOMS' | 'EXTRA';
  unit: string;
  rates: {
    '20DC': number;
    '40DC': number;
    '40HC': number;
    '45HC': number;
    '20RF': number;
    '40HR': number;
    'DEFAULT': number;
  };
  vatPercent: number;
}

export const GATE_IN_STANDARD_TARIFFS: StandardTariffItem[] = [
  {
    code: 'LOLO_MT_NORMAL',
    name: 'Phí nâng / hạ container rỗng tại cổng Gate-In (Lift-Off MT)',
    category: 'LOLO',
    unit: 'Lần/Cont',
    rates: {
      '20DC': 280000,
      '40DC': 420000,
      '40HC': 420000,
      '45HC': 500000,
      '20RF': 350000,
      '40HR': 520000,
      'DEFAULT': 420000
    },
    vatPercent: 8
  },
  {
    code: 'STORAGE_DRY_EXCESS',
    name: 'Phí lưu bãi container khô (Sau thời gian Free Time 5 ngày)',
    category: 'STORAGE',
    unit: 'Cont/Ngày',
    rates: {
      '20DC': 350000,
      '40DC': 60000,
      '40HC': 60000,
      '45HC': 75000,
      '20RF': 85000,
      '40HR': 145000,
      'DEFAULT': 60000
    },
    vatPercent: 8
  },
  {
    code: 'CLEAN_SWEEP',
    name: 'Vệ sinh quét dọn rác bổi xốp & xịt bụi khô (Sweeping Clean)',
    category: 'CLEANING',
    unit: 'Cont',
    rates: {
      '20DC': 120000,
      '40DC': 180000,
      '40HC': 200000,
      '45HC': 250000,
      '20RF': 150000,
      '40HR': 220000,
      'DEFAULT': 200000
    },
    vatPercent: 8
  },
  {
    code: 'CLEAN_WASH_200BAR',
    name: 'Vệ sinh xịt rửa nước áp lực cao 200 Bar',
    category: 'CLEANING',
    unit: 'Cont',
    rates: {
      '20DC': 250000,
      '40DC': 380000,
      '40HC': 420000,
      '45HC': 480000,
      '20RF': 300000,
      '40HR': 450000,
      'DEFAULT': 420000
    },
    vatPercent: 8
  },
  {
    code: 'CLEAN_CHEM_HOT',
    name: 'Tẩy rửa hóa chất & nước nóng khử mùi hải sản / dầu mỡ',
    category: 'CLEANING',
    unit: 'Cont',
    rates: {
      '20DC': 450000,
      '40DC': 650000,
      '40HC': 750000,
      '45HC': 850000,
      '20RF': 620000,
      '40HR': 950000,
      'DEFAULT': 750000
    },
    vatPercent: 8
  },
  {
    code: 'PTI_REEFER_STD',
    name: 'Kiểm tra kỹ thuật máy lạnh trước chuyến đi (Pre-Trip Inspection PTI)',
    category: 'PTI',
    unit: 'Cont',
    rates: {
      '20DC': 0,
      '40DC': 0,
      '40HC': 0,
      '45HC': 0,
      '20RF': 650000,
      '40HR': 850000,
      'DEFAULT': 850000
    },
    vatPercent: 8
  },
  {
    code: 'PLUG_POWER_REEFER',
    name: 'Cắm điện duy trì nhiệt độ Reefer tại bãi cắm điện',
    category: 'REEFER_POWER',
    unit: 'Giờ',
    rates: {
      '20DC': 0,
      '40DC': 0,
      '40HC': 0,
      '45HC': 0,
      '20RF': 65000,
      '40HR': 75000,
      'DEFAULT': 75000
    },
    vatPercent: 8
  },
  {
    code: 'YARD_SHIFTING',
    name: 'Đảo chuyển vị trí bãi / Đổi bệ sửa chữa theo yêu cầu',
    category: 'YARD_SHIFT',
    unit: 'Lần/Cont',
    rates: {
      '20DC': 180000,
      '40DC': 260000,
      '40HC': 260000,
      '45HC': 320000,
      '20RF': 220000,
      '40HR': 320000,
      'DEFAULT': 260000
    },
    vatPercent: 8
  },
  {
    code: 'NIGHT_GATE_SURCHARGE',
    name: 'Phụ phí nâng hạ ca đêm (22h:00 - 06:00 sáng)',
    category: 'EXTRA',
    unit: 'Lần/Cont',
    rates: {
      '20DC': 80000,
      '40DC': 120000,
      '40HC': 120000,
      '45HC': 150000,
      '20RF': 100000,
      '40HR': 150000,
      'DEFAULT': 120000
    },
    vatPercent: 8
  }
];

export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'SO-001',
    orderNo: 'SO-20260810-001',
    containerId: 'CONT-001',
    containerNo: 'MSCU1234567',
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    shippingLine: 'MSC',
    customerName: 'Công ty TNHH Vận Tải Quốc Tế Á Châu',
    customerTaxCode: '0312345678',
    driverName: 'Trần Văn Tùng',
    truckPlate: '51C-889.12',
    driverPhone: '0908123456',
    gateInDate: '2026-08-10 08:30',
    createdAt: '2026-08-10 08:50',
    createdBy: 'Nguyễn Văn Hùng (Khai Thác Cổng)',
    surveyRef: {
      surveyNo: 'SRV-2026-0810-001',
      condition: 'DM',
      surveyor: 'Lê Hoàng Nam (SV-04)',
      surveyDate: '2026-08-10 08:45',
      grade: 'GRADE_C',
      damagesCount: 2,
      surveyNote: 'Rách vách tôn rãnh dọc & rách ron cao su cửa. Phân loại DM.'
    },
    items: [
      {
        id: 'ITM-01',
        serviceCode: 'LOLO_MT_NORMAL',
        serviceName: 'Phí nâng hạ vỏ rỗng Gate-In (Lift-Off 40HC)',
        category: 'LOLO',
        quantity: 1,
        unit: 'Lần',
        unitPrice: 420000,
        vatPercent: 8,
        amount: 420000,
        vatAmount: 33600,
        total: 453600,
        remarks: 'Tiếp nhận hạ vỏ rỗng tại Bãi Khô A'
      },
      {
        id: 'ITM-02',
        serviceCode: 'STORAGE_DRY_EXCESS',
        serviceName: 'Phí lưu bãi container quá hạn (3 ngày)',
        category: 'STORAGE',
        quantity: 3,
        unit: 'Ngày',
        unitPrice: 60000,
        vatPercent: 8,
        amount: 180000,
        vatAmount: 14400,
        total: 194400,
        remarks: 'Lưu bãi vượt quá 5 ngày Free Time của MSC'
      },
      {
        id: 'ITM-03',
        serviceCode: 'CLEAN_SWEEP',
        serviceName: 'Phí quét dọn rác dăm gỗ lót sàn',
        category: 'CLEANING',
        quantity: 1,
        unit: 'Cont',
        unitPrice: 200000,
        vatPercent: 8,
        amount: 200000,
        vatAmount: 16000,
        total: 216000,
        remarks: 'Vệ sinh sơ bộ trước khi vào xưởng EMR'
      }
    ],
    subtotal: 800000,
    totalVat: 64000,
    grandTotal: 864000,
    paymentStatus: 'PAID',
    paymentMethod: 'VIETQR',
    paidAt: '2026-08-10 09:05',
    transactionId: 'FT2608109921',
    qrPayload: 'STB_SOLUTION_DEPOT_MSCU1234567_864000',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STB_SOLUTION_DEPOT_MSCU1234567_864000',
    notes: 'Đã thanh toán thành công qua VietQR Webhook Napas247.',
    status: 'PAID'
  },
  {
    id: 'SO-002',
    orderNo: 'SO-20260810-002',
    containerId: 'CONT-002',
    containerNo: 'MAEU9876543',
    isoCode: '22G1',
    size: '20DC',
    type: 'Dry General Purpose',
    shippingLine: 'MAERSK',
    customerName: 'Công ty CP Tiếp Vận LogiTrans Sài Gòn',
    customerTaxCode: '0309876543',
    driverName: 'Nguyễn Hoàng Dũng',
    truckPlate: '60C-554.21',
    driverPhone: '0912334455',
    gateInDate: '2026-08-10 09:10',
    createdAt: '2026-08-10 09:25',
    createdBy: 'Nguyễn Văn Hùng (Khai Thác Cổng)',
    surveyRef: {
      surveyNo: 'SRV-2026-0810-002',
      condition: 'AV',
      surveyor: 'Nguyễn Văn Minh (SV-01)',
      surveyDate: '2026-08-10 09:20',
      grade: 'GRADE_A',
      damagesCount: 0,
      surveyNote: 'Vỏ đạt chuẩn Grade A sẵn sàng cấp hàng đóng xuất may mặc.'
    },
    items: [
      {
        id: 'ITM-04',
        serviceCode: 'LOLO_MT_NORMAL',
        serviceName: 'Phí nâng hạ vỏ rỗng Gate-In (Lift-Off 20DC)',
        category: 'LOLO',
        quantity: 1,
        unit: 'Lần',
        unitPrice: 280000,
        vatPercent: 8,
        amount: 280000,
        vatAmount: 22400,
        total: 302400,
        remarks: 'Hạ bãi Block A - Khu vực cont sẵn sàng khai thác'
      }
    ],
    subtotal: 280000,
    totalVat: 22400,
    grandTotal: 302400,
    paymentStatus: 'UNPAID',
    qrPayload: 'STB_SOLUTION_DEPOT_MAEU9876543_302400',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STB_SOLUTION_DEPOT_MAEU9876543_302400',
    notes: 'Chờ tài xế quét mã VietQR hoặc đóng tiền mặt tại Quầy Thu Ngân.',
    status: 'ISSUED'
  },
  {
    id: 'SO-003',
    orderNo: 'SO-20260810-003',
    containerId: 'CONT-003',
    containerNo: 'CMAU3456789',
    isoCode: '45R1',
    size: '40HR',
    type: 'Reefer High Cube',
    shippingLine: 'CMA-CGM',
    customerName: 'Tập đoàn Xuất Nhập Khẩu Thủy Sản Biển Đông',
    customerTaxCode: '0315566778',
    driverName: 'Đặng Thanh Tâm',
    truckPlate: '50H-912.44',
    driverPhone: '0977889900',
    gateInDate: '2026-08-10 09:40',
    createdAt: '2026-08-10 09:55',
    createdBy: 'Lê Hoàng Nam (Khai Thác Cổng)',
    surveyRef: {
      surveyNo: 'SRV-2026-0810-003',
      condition: 'CL',
      surveyor: 'Phạm Đức Trọng (SV-06)',
      surveyDate: '2026-08-10 09:50',
      cleaningRequired: true,
      cleaningType: 'CHEMICAL_WASH',
      damagesCount: 0,
      surveyNote: 'Mùi tanh tôm cá nồng nặc & bám cặn sàn nhôm T-Floor. Cần rửa nước nóng + khử mùi Ozone.'
    },
    items: [
      {
        id: 'ITM-05',
        serviceCode: 'LOLO_MT_NORMAL',
        serviceName: 'Phí nâng hạ vỏ lạnh Reefer Gate-In (Lift-Off 40HR)',
        category: 'LOLO',
        quantity: 1,
        unit: 'Lần',
        unitPrice: 520000,
        vatPercent: 8,
        amount: 520000,
        vatAmount: 41600,
        total: 561600,
        remarks: 'Tiếp nhận hạ bãi cắm điện & khu rửa vỏ Reefer'
      },
      {
        id: 'ITM-06',
        serviceCode: 'CLEAN_CHEM_HOT',
        serviceName: 'Phí xịt rửa nước nóng 80°C tẩy nhờn diệt khuẩn',
        category: 'CLEANING',
        quantity: 1,
        unit: 'Cont',
        unitPrice: 620000,
        vatPercent: 8,
        amount: 620000,
        vatAmount: 49600,
        total: 669600,
        remarks: 'Chỉ định theo biên bản giám định e-EIR #SRV-2026-0810-003'
      },
      {
        id: 'ITM-07',
        serviceCode: 'CLEAN_CHEM_HOT',
        serviceName: 'Khử mùi tanh nồng hải sản bằng máy khí Ozone 90 phút',
        category: 'CLEANING',
        quantity: 1,
        unit: 'Cont',
        unitPrice: 950000,
        vatPercent: 8,
        amount: 950000,
        vatAmount: 76000,
        total: 1026000,
        remarks: 'Khử mùi tanh cá biển theo tiêu chuẩn CMA-CGM'
      },
      {
        id: 'ITM-08',
        serviceCode: 'PTI_REEFER_STD',
        serviceName: 'Kiểm tra kỹ thuật máy lạnh trước chuyến (Pre-Trip Inspection)',
        category: 'PTI',
        quantity: 1,
        unit: 'Cont',
        unitPrice: 850000,
        vatPercent: 8,
        amount: 850000,
        vatAmount: 68000,
        total: 918000,
        remarks: 'Test PTI bộ máy lạnh Daikin Scroll'
      }
    ],
    subtotal: 2940000,
    totalVat: 235200,
    grandTotal: 3175200,
    paymentStatus: 'UNPAID',
    qrPayload: 'STB_SOLUTION_DEPOT_CMAU3456789_3175200',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STB_SOLUTION_DEPOT_CMAU3456789_3175200',
    notes: 'Đã xuất phiếu thu, chuyển lệnh sang Quầy Thu Ngân / Tài xế thanh toán VietQR.',
    status: 'ISSUED'
  }
];

// Helper tính cước tự động dựa trên Container và Kết quả giám định
export function autoCalculateServiceTicket(
  container: {
    containerNo: string;
    isoCode?: string;
    size?: string;
    type?: string;
    shippingLine?: string;
    licensePlate?: string;
    driverName?: string;
    driverPhone?: string;
    customerName?: string;
    gateInDate?: string;
    condition?: 'AV' | 'CL' | 'DM';
    surveyDetails?: any;
  }
): ServiceOrder {
  const sizeKey = (container.size?.toUpperCase() || '40HC') as any;
  const isReefer = container.type?.toLowerCase().includes('reefer') || container.size?.includes('RF') || container.size?.includes('HR');

  const items: ServiceOrderItem[] = [];

  // 1. Phí Nâng Hạ (LoLo)
  const loloTariff = GATE_IN_STANDARD_TARIFFS.find(t => t.code === 'LOLO_MT_NORMAL');
  const loloPrice = isReefer
    ? (sizeKey.includes('20') ? 350000 : 520000)
    : (loloTariff?.rates[sizeKey as keyof typeof loloTariff.rates] || (sizeKey.includes('20') ? 280000 : 420000));

  items.push({
    id: 'ITM-' + Math.random().toString(36).substring(2, 7),
    serviceCode: 'LOLO_MT_NORMAL',
    serviceName: `Phí nâng hạ vỏ rỗng Gate-In (${container.size || '40HC'} ${container.shippingLine || ''})`,
    category: 'LOLO',
    quantity: 1,
    unit: 'Lần',
    unitPrice: loloPrice,
    vatPercent: 8,
    amount: loloPrice,
    vatAmount: Math.round(loloPrice * 0.08),
    total: Math.round(loloPrice * 1.08),
    remarks: 'Nâng hạ tiếp nhận tại cổng bãi Depot'
  });

  // 2. Dịch vụ Vệ Sinh (Nếu kết quả Giám định = 'CL')
  if (container.condition === 'CL') {
    const cleanTariff = GATE_IN_STANDARD_TARIFFS.find(t => t.code === (isReefer ? 'CLEAN_CHEM_HOT' : 'CLEAN_WASH_200BAR'));
    const cleanPrice = cleanTariff?.rates[sizeKey as keyof typeof cleanTariff.rates] || (isReefer ? 620000 : 420000);

    items.push({
      id: 'ITM-' + Math.random().toString(36).substring(2, 7),
      serviceCode: isReefer ? 'CLEAN_CHEM_HOT' : 'CLEAN_WASH_200BAR',
      serviceName: isReefer ? 'Phí tẩy rửa hóa chất & khử mùi vi sinh Reefer' : 'Phí xịt rửa nước áp lực cao 200 Bar',
      category: 'CLEANING',
      quantity: 1,
      unit: 'Cont',
      unitPrice: cleanPrice,
      vatPercent: 8,
      amount: cleanPrice,
      vatAmount: Math.round(cleanPrice * 0.08),
      total: Math.round(cleanPrice * 1.08),
      remarks: 'Chỉ định theo kết quả Giám định e-EIR'
    });
  }

  // 3. Phí PTI nếu là Reefer
  if (isReefer) {
    const ptiTariff = GATE_IN_STANDARD_TARIFFS.find(t => t.code === 'PTI_REEFER_STD');
    const ptiPrice = ptiTariff?.rates[sizeKey as keyof typeof ptiTariff.rates] || 850000;
    if (ptiPrice > 0) {
      items.push({
        id: 'ITM-' + Math.random().toString(36).substring(2, 7),
        serviceCode: 'PTI_REEFER_STD',
        serviceName: 'Kiểm tra kỹ thuật lạnh trước chuyến (PTI Test)',
        category: 'PTI',
        quantity: 1,
        unit: 'Cont',
        unitPrice: ptiPrice,
        vatPercent: 8,
        amount: ptiPrice,
        vatAmount: Math.round(ptiPrice * 0.08),
        total: Math.round(ptiPrice * 1.08),
        remarks: 'Kiểm tra hệ thống máy lạnh Daikin / Carrier'
      });
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const grandTotal = subtotal + totalVat;

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const orderNo = 'SO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

  return {
    id: 'SO-' + Math.random().toString(36).substring(2, 9),
    orderNo,
    containerNo: container.containerNo,
    isoCode: container.isoCode || '45G1',
    size: container.size || '40HC',
    type: container.type || 'Dry High Cube',
    shippingLine: container.shippingLine || 'GEN',
    customerName: container.customerName || `Khách hàng đại diện Hãng ${container.shippingLine || 'Tàu'}`,
    customerTaxCode: '0318899221',
    driverName: container.driverName || 'Tài xế giao nhận',
    truckPlate: container.licensePlate || '51C-000.00',
    driverPhone: container.driverPhone || '0900000000',
    gateInDate: container.gateInDate || now,
    createdAt: now,
    createdBy: 'Nhân Viên Khai Thác Gate-In',
    surveyRef: {
      condition: container.condition || 'AV',
      surveyor: container.surveyDetails?.surveyorName || 'Giám Định Viên Depot',
      surveyDate: container.surveyDetails?.surveyDate || now,
      damagesCount: container.surveyDetails?.damages?.length || 0,
      surveyNote: container.condition === 'DM' ? 'Có hư hỏng theo IICL-6' : container.condition === 'CL' ? 'Yêu cầu xịt rửa vệ sinh' : 'Đạt chuẩn cấp AV'
    },
    items,
    subtotal,
    totalVat,
    grandTotal,
    paymentStatus: 'UNPAID',
    qrPayload: `STB_SOLUTION_DEPOT_${container.containerNo}_${grandTotal}`,
    qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STB_SOLUTION_DEPOT_${container.containerNo}_${grandTotal}`,
    notes: 'Tạo tự động từ kết quả Giám định Cổng Gate-In.',
    status: 'ISSUED'
  };
}
