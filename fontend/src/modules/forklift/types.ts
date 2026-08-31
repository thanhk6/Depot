export type ForkliftJobStatus = 'WAITING' | 'CLAIMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export type JobPriority = 'URGENT' | 'HIGH' | 'NORMAL';

export interface YardCoordinate {
  block: string; // 'A' | 'B' | 'C' | 'D'
  bay: string;   // '01', '02', '03', '04', '05'
  row: string;   // '01', '02', '03', '04'
  tier: string;  // '01', '02', '03', '04'
}

export interface ForkliftOperator {
  id: string;
  name: string;
  badgeNo: string;
  grade: string;
  phone: string;
  avatar?: string;
  shift: string;
}

export interface ForkliftVehicle {
  id: string;
  code: string;
  name: string;
  type: 'REACH_STACKER' | 'HEAVY_FORKLIFT' | 'EMPTY_HANDLER';
  capacityTon: number;
  assignedArea: string;
  fuelLevel: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE';
}

export interface ForkliftJob {
  id: string;
  jobNo: string;
  containerId: string;
  containerNo: string;
  isoCode: string;
  size: string;
  shippingLine: string;
  condition: 'AV' | 'CL' | 'DM';
  cargoStatus: 'EMPTY' | 'FULL';
  weightKg?: number;
  
  // Locations
  fromLocation: string; // e.g. 'CỔNG GATE-IN #01', 'BỆ RỬA CLEANING #02', 'KHU GIÁM ĐỊNH'
  plannedLocation: YardCoordinate;
  actualLocation?: YardCoordinate;
  isLocationDeviated?: boolean;
  deviationReason?: string;

  // Status & Priority
  status: ForkliftJobStatus;
  priority: JobPriority;
  waitingSince: string;
  waitingDurationMinutes?: number;

  // Assignment details (Self-claimed)
  claimedByOperatorId?: string;
  claimedByOperatorName?: string;
  assignedForkliftId?: string;
  assignedForkliftCode?: string;
  claimedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  // Notes
  driverNote?: string;
  operationNote?: string;
}

export interface ForkliftHistoryRecord {
  id: string;
  jobNo: string;
  containerNo: string;
  size: string;
  shippingLine: string;
  condition: 'AV' | 'CL' | 'DM';
  forkliftCode: string;
  operatorName: string;
  fromLocation: string;
  plannedLocation: string;
  actualLocation: string;
  isDeviated: boolean;
  claimedAt: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  status: 'COMPLETED' | 'CANCELLED' | 'FAILED';
  note?: string;
}
