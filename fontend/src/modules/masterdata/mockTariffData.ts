export interface LoLoTariffItem {
  id: string;
  tariffCode: string;
  serviceCategory: 'LIFT_EMPTY' | 'SHIFTING' | 'NIGHT_SURCHARGE';
  nameVi: string;
  nameEn: string;
  unit: string;
  price20GP: number;
  price40GP_HC: number;
  price45HC: number;
  price20RF: number;
  price40RH: number;
  priceSpecial: number; // OT / FR / Tank Rỗng
  vatPercent: number;
  currency: 'VND' | 'USD';
  description: string;
  applicableShift: 'ALL' | 'DAY_ONLY' | 'NIGHT_SURCHARGE';
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}

export interface StorageTariffTier {
  tierName: string;
  fromDay: number;
  toDay: number | null; // null = above
  price20Dry: number;
  price40Dry: number;
  price45Dry: number;
  price20Reefer: number;
  price40Reefer: number;
  priceSpecial: number;
}

export interface StorageTariffRule {
  id: string;
  ruleCode: string;
  shippingLineCode: string; // 'ALL' or specific shipping line
  shippingLineName: string;
  containerTypeCategory: 'DRY_STANDARD' | 'SPECIAL_OOG' | 'IMO_HAZARDOUS' | 'ISO_TANK';
  defaultFreeDays: number;
  calculationUnit: 'VND/Cont/Day' | 'USD/Cont/Day';
  tiers: StorageTariffTier[];
  vatPercent: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes: string;
  updatedAt: string;
}

export const INITIAL_LOLO_TARIFFS: LoLoTariffItem[] = [
  {
    id: 'LOLO-001',
    tariffCode: 'LOLO_MT_NORMAL',
    serviceCategory: 'LIFT_EMPTY',
    nameVi: 'Cước nâng / hạ vỏ container rỗng tại cổng Gate-In & Gate-Out',
    nameEn: 'Empty Container Lift-On / Lift-Off standard depot operation',
    unit: 'Lần / Cont',
    price20GP: 280000,
    price40GP_HC: 420000,
    price45HC: 500000,
    price20RF: 350000,
    price40RH: 520000,
    priceSpecial: 600000,
    vatPercent: 8,
    currency: 'VND',
    description: 'Áp dụng cho xe đầu kéo hạ bãi vỏ rỗng trả hoặc nhận cấp vỏ rỗng đóng hàng theo lệnh cấp của hãng tàu.',
    applicableShift: 'ALL',
    status: 'ACTIVE',
    updatedAt: '2026-08-14'
  },
  {
    id: 'LOLO-002',
    tariffCode: 'LOLO_YARD_SHIFT',
    serviceCategory: 'SHIFTING',
    nameVi: 'Phí đảo chuyển vị trí vỏ rỗng nội bộ bãi / Đưa bệ vệ sinh & sửa chữa (Yard Shifting)',
    nameEn: 'Internal Empty Yard Shifting / Cleaning Platform & EMR Workshop Move',
    unit: 'Lần / Cont',
    price20GP: 180000,
    price40GP_HC: 260000,
    price45HC: 320000,
    price20RF: 220000,
    price40RH: 320000,
    priceSpecial: 450000,
    vatPercent: 8,
    currency: 'VND',
    description: 'Đảo chuyển vỏ rỗng để lấy cont bên dưới, đưa vào bệ rửa nước/hóa chất, đưa vào xưởng EMR.',
    applicableShift: 'ALL',
    status: 'ACTIVE',
    updatedAt: '2026-08-14'
  },
  {
    id: 'LOLO-003',
    tariffCode: 'LOLO_NIGHT_EXTRA',
    serviceCategory: 'NIGHT_SURCHARGE',
    nameVi: 'Phụ phí nâng hạ vỏ rỗng ca đêm (22h00 - 06h00) & Ngày Lễ / Tết',
    nameEn: 'Empty Lifting Night Shift & Holiday Overtime Surcharge',
    unit: 'Lần / Cont',
    price20GP: 80000,
    price40GP_HC: 120000,
    price45HC: 150000,
    price20RF: 100000,
    price40RH: 150000,
    priceSpecial: 200000,
    vatPercent: 8,
    currency: 'VND',
    description: 'Phụ thu ca đêm và ngày lễ khi nâng hạ vỏ rỗng tại bãi depot.',
    applicableShift: 'NIGHT_SURCHARGE',
    status: 'ACTIVE',
    updatedAt: '2026-08-14'
  }
];

export const INITIAL_STORAGE_TARIFFS: StorageTariffRule[] = [
  {
    id: 'STOR-001',
    ruleCode: 'STOR_DRY_STANDARD',
    shippingLineCode: 'ALL',
    shippingLineName: 'Tiêu Chuẩn Chung Toàn Bãi (Áp dụng các Hãng Tàu)',
    containerTypeCategory: 'DRY_STANDARD',
    defaultFreeDays: 5,
    calculationUnit: 'VND/Cont/Day',
    tiers: [
      {
        tierName: 'Bậc 1 (Miễn phí ngày đầu)',
        fromDay: 1,
        toDay: 5,
        price20Dry: 0,
        price40Dry: 0,
        price45Dry: 0,
        price20Reefer: 0,
        price40Reefer: 0,
        priceSpecial: 0
      },
      {
        tierName: 'Bậc 2 (Từ ngày 6 đến 15)',
        fromDay: 6,
        toDay: 15,
        price20Dry: 35000,
        price40Dry: 60000,
        price45Dry: 75000,
        price20Reefer: 70000,
        price40Reefer: 120000,
        priceSpecial: 110000
      },
      {
        tierName: 'Bậc 3 (Từ ngày 16 đến 30)',
        fromDay: 16,
        toDay: 30,
        price20Dry: 55000,
        price40Dry: 95000,
        price45Dry: 120000,
        price20Reefer: 110000,
        price40Reefer: 190000,
        priceSpecial: 160000
      },
      {
        tierName: 'Bậc 4 (Quá 30 ngày - Lưu bãi dài ngày)',
        fromDay: 31,
        toDay: null,
        price20Dry: 85000,
        price40Dry: 145000,
        price45Dry: 180000,
        price20Reefer: 170000,
        price40Reefer: 290000,
        priceSpecial: 240000
      }
    ],
    vatPercent: 8,
    status: 'ACTIVE',
    notes: 'Biểu tính lũy tiến chuẩn áp dụng cho container bách hóa thông thường.',
    updatedAt: '2026-08-14'
  },
  {
    id: 'STOR-002',
    ruleCode: 'STOR_MAERSK_SPECIAL',
    shippingLineCode: 'MSK',
    shippingLineName: 'Maersk Line (A.P. Moller - Maersk Policy)',
    containerTypeCategory: 'DRY_STANDARD',
    defaultFreeDays: 7,
    calculationUnit: 'VND/Cont/Day',
    tiers: [
      {
        tierName: 'Bậc 1 (Free time hợp đồng Maersk 7 ngày)',
        fromDay: 1,
        toDay: 7,
        price20Dry: 0,
        price40Dry: 0,
        price45Dry: 0,
        price20Reefer: 0,
        price40Reefer: 0,
        priceSpecial: 0
      },
      {
        tierName: 'Bậc 2 (Từ ngày 8 đến 20)',
        fromDay: 8,
        toDay: 20,
        price20Dry: 32000,
        price40Dry: 55000,
        price45Dry: 70000,
        price20Reefer: 65000,
        price40Reefer: 110000,
        priceSpecial: 100000
      },
      {
        tierName: 'Bậc 3 (Từ ngày 21 trở đi)',
        fromDay: 21,
        toDay: null,
        price20Dry: 60000,
        price40Dry: 105000,
        price45Dry: 135000,
        price20Reefer: 120000,
        price40Reefer: 210000,
        priceSpecial: 180000
      }
    ],
    vatPercent: 8,
    status: 'ACTIVE',
    notes: 'Hợp đồng liên minh hãng tàu Maersk - Cấp Free time 7 ngày cho vỏ rỗng.',
    updatedAt: '2026-08-14'
  },
  {
    id: 'STOR-004',
    ruleCode: 'STOR_OOG_DG',
    shippingLineCode: 'ALL',
    shippingLineName: 'Hàng Nguy Hiểm (IMO/DG) & Quá Khổ (Flat Rack / Open Top)',
    containerTypeCategory: 'IMO_HAZARDOUS',
    defaultFreeDays: 3,
    calculationUnit: 'VND/Cont/Day',
    tiers: [
      {
        tierName: 'Bậc 1 (Miễn phí 3 ngày)',
        fromDay: 1,
        toDay: 3,
        price20Dry: 0,
        price40Dry: 0,
        price45Dry: 0,
        price20Reefer: 0,
        price40Reefer: 0,
        priceSpecial: 0
      },
      {
        tierName: 'Bậc 2 (Từ ngày 4 đến 10)',
        fromDay: 4,
        toDay: 10,
        price20Dry: 60000,
        price40Dry: 110000,
        price45Dry: 140000,
        price20Reefer: 120000,
        price40Reefer: 210000,
        priceSpecial: 190000
      },
      {
        tierName: 'Bậc 3 (Từ ngày 11 trở đi)',
        fromDay: 11,
        toDay: null,
        price20Dry: 110000,
        price40Dry: 195000,
        price45Dry: 240000,
        price20Reefer: 220000,
        price40Reefer: 370000,
        priceSpecial: 330000
      }
    ],
    vatPercent: 8,
    status: 'ACTIVE',
    notes: 'Khu vực bãi cách ly an toàn PCCC cho hàng hóa chất và thiết bị OOG.',
    updatedAt: '2026-08-14'
  }
];
