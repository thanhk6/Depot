export interface LoLoTariffItem {
  id: string;
  tariffCode: string;
  serviceCategory: 'LIFT_EMPTY' | 'SHIFTING' | 'NIGHT_SURCHARGE' | 'LIFT_LADEN' | 'PTI' | 'CUSTOMS' | 'WEIGHING' | (string & {});
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
  /** Thứ tự hiển thị (ServiceTariff.SortOrder) — phải gửi lại khi lưu, nếu không backend đặt về 0. */
  sortOrder?: number;
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
