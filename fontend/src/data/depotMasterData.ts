import {
  DepotJob,
  DepotServiceItem
} from '../types/depot';

export const SHIPPING_LINES = [
  'Maersk Line (MSK)',
  'MSC (Mediterranean Shipping)',
  'CMA CGM',
  'COSCO Shipping',
  'Evergreen Marine (EMC)',
  'ONE (Ocean Network Express)',
  'HMM (Hyundai Merchant Marine)',
  'Yang Ming',
  'Hapag-Lloyd'
];

export const MASTER_DAMAGE_CODES = [
  { code: 'DENT', nameVi: 'Móp méo', defaultRepair: 'STRAIGHTEN', defaultRepairVi: 'Nắn nắn chỉnh', unitPriceLabor: 150000, unitPriceMaterial: 80000 },
  { code: 'HOLE', nameVi: 'Thủng lỗ', defaultRepair: 'PATCH', defaultRepairVi: 'Vá inox/thép', unitPriceLabor: 250000, unitPriceMaterial: 200000 },
  { code: 'BENT', nameVi: 'Cong biến dạng', defaultRepair: 'STRAIGHTEN', defaultRepairVi: 'Nắn thẳng', unitPriceLabor: 200000, unitPriceMaterial: 100000 },
  { code: 'RUST', nameVi: 'Rỉ sét bề mặt', defaultRepair: 'PAINT', defaultRepairVi: 'Đánh rỉ & sơn chống rỉ', unitPriceLabor: 180000, unitPriceMaterial: 150000 },
  { code: 'CUT', nameVi: 'Rách vách/xà', defaultRepair: 'WELD', defaultRepairVi: 'Hàn đắp / Vá ghép', unitPriceLabor: 220000, unitPriceMaterial: 180000 },
  { code: 'DIRTY', nameVi: 'Bám bẩn / Mùi hôi', defaultRepair: 'CLEAN', defaultRepairVi: 'Rửa hóa chất & sấy dry', unitPriceLabor: 120000, unitPriceMaterial: 50000 },
  { code: 'BROKEN', nameVi: 'Vỡ/Hỏng linh kiện', defaultRepair: 'REPLACE', defaultRepairVi: 'Thay thế phụ tùng mới', unitPriceLabor: 300000, unitPriceMaterial: 450000 }
];

export const MASTER_COMPONENTS = [
  'Vách trái (Left Side Wall)',
  'Vách phải (Right Side Wall)',
  'Mái container (Roof Panel)',
  'Cửa container (Rear Door)',
  'Sàn gỗ/thép (Floor Board)',
  'Xà dọc trên (Top Side Rail)',
  'Xà dọc dưới (Bottom Side Rail)',
  'Góc đúc (Corner Casting)',
  'Gioăng cửa (Door Gasket)',
  'Cụm máy lạnh (Reefer Unit)'
];

export const STANDARD_DEPOT_TARIFF: DepotServiceItem[] = [
  { id: 'SRV-01', code: 'LIFT_ON_OFF', nameVi: 'Nâng / Hạ Container tại bãi', unitPrice: 450000, quantity: 1, totalPrice: 450000 },
  { id: 'SRV-02', code: 'STORAGE_FEE', nameVi: 'Phí lưu bãi Depot (3 ngày)', unitPrice: 60000, quantity: 3, totalPrice: 180000 },
  { id: 'SRV-03', code: 'WASHING_DRY', nameVi: 'Vệ sinh xịt rửa container khô', unitPrice: 150000, quantity: 1, totalPrice: 150000 },
  { id: 'SRV-04', code: 'PTI_INSPECTION', nameVi: 'Kiểm tra kỹ thuật PTI container lạnh', unitPrice: 500000, quantity: 1, totalPrice: 500000 },
  { id: 'SRV-05', code: 'PLUGGING_POWER', nameVi: 'Cắm điện Container Lạnh (24h)', unitPrice: 250000, quantity: 1, totalPrice: 250000 },
];

export const FORKLIFT_UNITS = [
  { id: 'XN-01', name: 'Xe nâng Kalmar 45T (#01)', driver: 'Nguyễn Văn Hùng', status: 'READY' },
  { id: 'XN-02', name: 'Xe nâng Konecranes 42T (#02)', driver: 'Trần Đình Nam', status: 'READY' },
  { id: 'XN-03', name: 'Xe nâng Hyster 10T (#03)', driver: 'Lê Hoàng Anh', status: 'READY' },
  { id: 'XN-04', name: 'Xe nâng Taylor 45T (#04)', driver: 'Phạm Minh Đức', status: 'READY' }
];

// No static mock data: All job records are fetched exclusively from Backend SQL API (/api/jobs)
export const INITIAL_DEPOT_JOBS: DepotJob[] = [];
