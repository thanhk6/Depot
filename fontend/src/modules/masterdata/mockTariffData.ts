export interface LoLoTariffItem {
  id: string;
  tariffCode: string;
  serviceCategory: 'LIFT_EMPTY' | 'SHIFTING' | 'NIGHT_SURCHARGE' | 'LIFT_LADEN' | 'PTI' | 'CUSTOMS' | 'WEIGHING' | (string & {});
  nameVi: string;
  nameEn: string;
  unit: string;
  /** Đơn giá theo từng loại container của DM Loại Container: { "40HC": 420000, "40GP": 400000, ... }; thiếu = chưa có giá. */
  prices: Record<string, number>;
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
  toDay: number | null; // null = từ fromDay trở đi (chỉ bậc cuối)
  /** Đơn giá/ngày theo từng loại container của DM Loại Container: { "40HC": 60000, ... }; thiếu / 0 = chưa có giá. */
  prices: Record<string, number>;
}

export interface StorageTariffRule {
  id: string;
  ruleCode: string;
  shippingLineCode: string; // 'ALL' or specific shipping line
  shippingLineName: string;
  /** Ngày miễn phí — bậc đầu bắt đầu ngày (defaultFreeDays + 1). */
  defaultFreeDays: number;
  tiers: StorageTariffTier[];
  vatPercent: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes: string;
  updatedAt: string;
}
