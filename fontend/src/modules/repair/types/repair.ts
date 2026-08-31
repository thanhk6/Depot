export type WorkOrderStatus =
  | 'WAITING'       // Chờ sửa
  | 'IN_PROGRESS'   // Đang sửa
  | 'COMPLETED'     // Đã sửa xong
  | 'QC_PENDING'    // Chờ kiểm tra QC
  | 'QC_PASSED'     // QC đạt
  | 'QC_FAILED'     // QC không đạt
  | 'CANCELLED';    // Hủy

export type RepairItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface RepairPhoto {
  id: string;
  containerNo: string;
  workOrderNo: string;
  repairItemId: string;
  type: 'BEFORE' | 'AFTER' | 'ADDITIONAL';
  url: string;
  photographer: string;
  timestamp: string;
  description?: string;
}

export interface MaterialUsage {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface WorkOrderRepairItem {
  id: string;
  itemNo: number;
  componentCode: string;
  componentNameVi: string;
  locationCode: string;
  locationVi: string;
  damageCode: string;
  damageNameVi: string;
  repairCode: string;
  repairNameVi: string;
  description: string;
  quantity: number;
  unit: string;
  status: RepairItemStatus;
  startedAt?: string;
  completedAt?: string;
  technician?: string;
  executionNotes?: string;
  actualHours?: number;
  materialsUsed: MaterialUsage[];
  photos: RepairPhoto[];
}

export interface AdditionalDamageReport {
  id: string;
  workOrderNo: string;
  containerNo: string;
  location: string;
  damageDescription: string;
  severity: 'MEDIUM' | 'HIGH' | 'URGENT';
  reportedBy: string;
  reportedAt: string;
  photoUrl?: string;
  status: 'PENDING_ESTIMATE' | 'APPROVED_SUPPLEMENT' | 'REJECTED';
}

export interface WorkOrderRecord {
  id: string;
  workOrderNo: string;
  containerId: string;
  containerNo: string;
  estimateNo: string;
  shippingLine: string;
  isoCode: string;
  size: string;
  type: string;
  yardLocation: {
    block: string;
    bay: string;
    row: string;
    tier: string;
  };
  priority: PriorityLevel;
  status: WorkOrderStatus;
  assignedTeam: string;
  leadTechnician: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  deadline: string;
  items: WorkOrderRepairItem[];
  additionalReports: AdditionalDamageReport[];
  qcNotes?: string;
  totalEstimatedHours: number;
  totalActualHours?: number;
}
