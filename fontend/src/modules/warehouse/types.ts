/**
 * EMR REPAIR MATERIAL WAREHOUSE - TYPES DEFINITIONS
 * Hệ thống Depot EMR: CHỈ CÓ MỘT KHO VẬT TƯ SỬA CHỮA DUY NHẤT ("KHO VẬT TƯ SỬA CHỮA EMR")
 * Không thiết kế Multi-Warehouse, không có WarehouseId, không có Stock Transfer giữa các kho.
 */

export const WAREHOUSE_INFO = {
  id: 1,
  code: 'EMR-MAIN-WH',
  name: 'KHO VẬT TƯ SỬA CHỮA EMR',
  location: 'Khu Xưởng Cơ Khí Sửa Chữa Depot EMR - Bãi Container ICD',
  managedBy: '',
  contactPhone: ''
} as const;

export type MaterialGroupCode =
  | 'DOOR'
  | 'FLOOR'
  | 'SIDE_PANEL'
  | 'ROOF'
  | 'LOCK'
  | 'RUBBER'
  | 'PAINT'
  | 'WELDING'
  | 'ELECTRICAL'
  | 'CONSUMABLE'
  | 'OTHER';

export type MaterialType =
  | 'PART'
  | 'MATERIAL'
  | 'CONSUMABLE'
  | 'TOOL'
  | 'OTHER';

export type MaterialUnit =
  | 'PCS'
  | 'SET'
  | 'KG'
  | 'LITER'
  | 'METER'
  | 'SHEET'
  | 'ROLL'
  | 'BOX'
  | 'CAN';

export interface MaterialGroup {
  id: number;
  code: MaterialGroupCode;
  name: string;
  description: string;
  iconName?: string;
  materialCount?: number;
}

export interface Supplier {
  id: number;
  supplierCode: string;
  supplierName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  rating: number; // 1-5
  isActive: boolean;
  notes?: string;
}

export interface Material {
  id: number; // Số nguyên, không dùng GUID
  materialCode: string;
  materialName: string;
  materialGroupId: MaterialGroupCode;
  materialType: MaterialType;
  unit: MaterialUnit;
  specification: string;
  brand: string;
  manufacturer: string;
  barcode: string;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  averageCost: number;
  lastPurchaseCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockBalance {
  id: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  materialGroup: MaterialGroupCode;
  unit: MaterialUnit;
  quantity: number; // Tồn vật lý thực tế
  reservedQuantity: number; // Đang giữ cho Work Order
  damagedQuantity: number; // Hỏng cách ly
  availableQuantity: number; // Quantity - ReservedQuantity - DamagedQuantity
  averageCost: number;
  totalValue: number; // Quantity * averageCost
  reorderLevel: number;
  minimumStock: number;
  maximumStock: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  lastUpdatedAt: string;
}

export type StockTransactionType =
  | 'RECEIPT'
  | 'ISSUE'
  | 'RETURN'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'DAMAGE'
  | 'RESERVE'
  | 'RELEASE_RESERVE';

export interface StockTransaction {
  id: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  transactionType: StockTransactionType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  beforeQuantity: number;
  afterQuantity: number;
  referenceType: 'RECEIPT' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT' | 'STOCKTAKE' | 'WORK_ORDER' | 'DAMAGE';
  referenceId: string; // e.g. PNK-2026-0001, PXK-2026-0001, WO-2026-00125
  workOrderId?: string;
  workOrderNo?: string;
  containerId?: string;
  containerNo?: string;
  performedBy: string;
  performedAt: string;
  note: string;
}

export interface WorkOrderMaterial {
  id: number;
  workOrderId: string;
  workOrderNo: string;
  containerId: string;
  containerNo: string;
  shippingLine: string;
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  requiredQuantity: number;
  reservedQuantity: number;
  issuedQuantity: number;
  usedQuantity: number;
  returnedQuantity: number;
  damagedQuantity: number;
  unitCost: number;
  totalCost: number; // usedQuantity * unitCost or issuedQuantity * unitCost
  status: 'RESERVED' | 'PARTIALLY_ISSUED' | 'ISSUED' | 'USED' | 'RETURNED' | 'CANCELLED';
  requestedBy: string;
  issuedTo?: string;
  repairItemName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialReceiptDetail {
  id: number;
  receiptId: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  quantity: number;
  unitCost: number;
  totalCost: number;
  note?: string;
}

export interface MaterialReceipt {
  id: number;
  receiptNo: string; // PNK-2026-0001
  receiptDate: string;
  supplierId: number;
  supplierName: string;
  note: string;
  totalAmount: number;
  totalQuantity: number;
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED';
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  details: MaterialReceiptDetail[];
}

export interface MaterialIssueDetail {
  id: number;
  issueId: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  quantity: number;
  unitCost: number;
  totalCost: number;
  note?: string;
}

export interface MaterialIssue {
  id: number;
  issueNo: string; // PXK-2026-0001
  issueDate: string;
  workOrderId: string;
  workOrderNo: string;
  containerId: string;
  containerNo: string;
  shippingLine: string;
  recipientName: string; // Nhân viên nhận (Thợ sửa chữa EMR)
  note: string;
  totalAmount: number;
  totalQuantity: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  details: MaterialIssueDetail[];
}

export interface MaterialReturnDetail {
  id: number;
  returnId: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  quantity: number;
  unitCost: number;
  totalCost: number;
  condition: 'GOOD' | 'DAMAGED';
  damageReason?: string;
}

export interface MaterialReturn {
  id: number;
  returnNo: string; // PTK-2026-0001
  returnDate: string;
  workOrderId: string;
  workOrderNo: string;
  containerId: string;
  containerNo: string;
  shippingLine: string;
  returnedBy: string; // Thợ sửa chữa trả lại
  receivedBy: string; // Thủ kho nhận
  note: string;
  totalQuantity: number;
  goodQuantity: number;
  damagedQuantity: number;
  totalAmount: number;
  createdAt: string;
  details: MaterialReturnDetail[];
}

export interface StockAdjustmentDetail {
  id: number;
  adjustmentId: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';
  beforeQuantity: number;
  adjustedQuantity: number;
  afterQuantity: number;
  unitCost: number;
  totalCost: number;
  note?: string;
}

export interface StockAdjustment {
  id: number;
  adjustmentNo: string; // PDC-2026-0001
  adjustmentDate: string;
  reasonType: 'INVENTORY_DIFFERENCE' | 'BROKEN' | 'LOST' | 'OTHER';
  reason: string;
  status: 'DRAFT' | 'APPROVED';
  adjustedBy: string;
  approvedBy?: string;
  totalItems: number;
  totalDifferenceValue: number;
  createdAt: string;
  details: StockAdjustmentDetail[];
}

export interface StocktakeDetail {
  id: number;
  stocktakeId: number;
  materialId: number;
  materialCode: string;
  materialName: string;
  materialGroup: MaterialGroupCode;
  unit: MaterialUnit;
  systemQuantity: number;
  actualQuantity: number;
  difference: number; // actualQuantity - systemQuantity
  unitCost: number;
  differenceValue: number; // difference * unitCost
  reason: string;
}

export interface Stocktake {
  id: number;
  stocktakeNo: string; // STK-2026-00001
  title: string;
  stocktakeDate: string;
  status: 'DRAFT' | 'COUNTING' | 'REVIEW' | 'APPROVED' | 'POSTED';
  countedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  notes: string;
  totalSystemQty: number;
  totalActualQty: number;
  totalDifferenceQty: number;
  totalDifferenceValue: number;
  createdAt: string;
  postedAt?: string;
  details: StocktakeDetail[];
}

export interface MaterialDamage {
  id: number;
  damageNo: string; // PHG-2026-0001
  materialId: number;
  materialCode: string;
  materialName: string;
  unit: MaterialUnit;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reportedDate: string;
  workOrderId?: string;
  workOrderNo?: string;
  containerNo?: string;
  reportedBy: string;
  reason: string;
  resolution: 'DISPOSED' | 'RETURN_TO_SUPPLIER' | 'REPAIRED' | 'PENDING_SURVEY';
  lossAmount: number;
  createdAt: string;
}

export interface WarehouseKPIs {
  totalMaterials: number; // Tổng danh mục vật tư
  totalStockQuantity: number; // Tổng số lượng tồn vật lý
  totalStockValue: number; // Tổng giá trị tồn kho (VNĐ)
  totalReservedQuantity: number; // Tổng số lượng đang giữ cho WO
  totalDamagedQuantity: number; // Tổng số lượng vật tư hỏng
  totalAvailableQuantity: number; // Tổng số lượng khả dụng
  lowStockCount: number; // Số vật tư sắp hết
  outOfStockCount: number; // Số vật tư hết hàng
  todayReceiptCount: number; // Số phiếu nhập hôm nay
  todayReceiptValue: number; // Giá trị nhập hôm nay
  todayIssueCount: number; // Số phiếu xuất hôm nay
  todayIssueValue: number; // Giá trị xuất hôm nay
}

export interface ContainerMaterialCostReport {
  containerNo: string;
  workOrderNo: string;
  shippingLine: string;
  completedDate: string;
  technicianName: string;
  materialItems: {
    materialCode: string;
    materialName: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
  }[];
  totalMaterialCost: number;
}

export interface ShippingLineMaterialSummaryReport {
  shippingLine: string;
  totalContainers: number;
  totalWorkOrders: number;
  totalMaterialCost: number;
  topConsumedMaterial: string;
}
