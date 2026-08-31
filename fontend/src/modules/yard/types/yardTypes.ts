export type ContainerStatus =
  | 'AVAILABLE'
  | 'IN_YARD'
  | 'REPAIR'
  | 'CLEANING'
  | 'HOLD'
  | 'RESERVED'
  | 'EMPTY_SLOT'
  | 'WAITING_GATE_IN'
  | 'WAITING_GATE_OUT'
  | 'GATE_OUT_COMPLETED';

export type HoldReason =
  | 'CUSTOMS_HOLD'
  | 'DOCUMENT_HOLD'
  | 'DAMAGE_HOLD'
  | 'PAYMENT_HOLD'
  | 'OTHER_HOLD';

export type ZoneType =
  | 'STORAGE'
  | 'REPAIR'
  | 'CLEANING'
  | 'HOLD'
  | 'INSPECTION'
  | 'STAGING'
  | 'GATE_IN'
  | 'GATE_OUT'
  | 'FORKLIFT_AREA'
  | 'OFFICE';

export type ForkliftStatus = 'AVAILABLE' | 'BUSY' | 'MOVING' | 'MAINTENANCE';

export interface YardLocationCoord {
  block: string;
  bay: string | number;
  row: string | number;
  tier: string | number;
}

export interface YardLocationEntity {
  id: string;
  yardId: string;
  zoneId: string;
  blockId: string;
  bayNo: number;
  rowNo: number;
  tierNo: number;
  positionCode: string; // e.g. "A-01-03-02"
  containerId?: string | null;
  containerNo?: string | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BLOCKED';
  isOccupied: boolean;
  isReserved: boolean;
  maxWeightKg?: number;
  createdAt: string;
  updatedAt: string;
}

export interface YardContainer {
  id: string;
  containerNo: string;
  isoType: string; // e.g. "40HC", "20GP", "45HC", "40RH"
  size: '20' | '40' | '45';
  type: 'DRY' | 'REEFER' | 'OPEN_TOP' | 'FLAT_RACK' | 'TANK';
  shippingLine: string; // "Maersk Line (MSK)", "MSC", etc.
  condition: 'AV' | 'DM' | 'CL';
  status: ContainerStatus;
  holdReason?: HoldReason;
  holdNotes?: string;
  locationCode: string; // "A-05-03-02"
  blockId: string; // "BLOCK_A"
  bayNo: number;
  rowNo: number;
  tierNo: number;
  tareWeightKg: number;
  maxPayloadKg: number;
  grossWeightKg?: number;
  sealNo?: string;
  gateInDate: string;
  inspectionDate?: string;
  repairDate?: string;
  cleaningDate?: string;
  destinationLocation?: string;
  notes?: string;
}

export interface YardBlock {
  id: string;
  yardId: string;
  zoneId: string;
  blockCode: string; // "A", "B", "C", "D", "E"
  blockName: string;
  bayCount: number;
  rowCount: number;
  maxTier: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation?: number;
  status: 'ACTIVE' | 'FULL' | 'MAINTENANCE';
  description: string;
  totalCapacity: number;
  occupiedCount: number;
  availableCount: number;
  repairCount: number;
  cleaningCount: number;
  holdCount: number;
}

export interface YardZone {
  id: string;
  yardId: string;
  zoneCode: string;
  zoneName: string;
  zoneType: ZoneType;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  fillOpacity?: number;
  description?: string;
  capacity?: number;
  currentCount?: number;
}

export interface YardGateLane {
  id: string;
  laneNo: number;
  gateType: 'IN' | 'OUT';
  laneName: string;
  hasOcr: boolean;
  hasRfid: boolean;
  hasWeighbridge: boolean;
  status: 'OPEN' | 'BUSY' | 'CLOSED';
  currentTruckPlate?: string;
  currentContainerNo?: string;
}

export interface Forklift {
  id: string;
  code: string; // "FL-001"
  name: string;
  status: ForkliftStatus;
  currentLocation: string; // "A-03-02" or "FORKLIFT_PAD"
  positionX: number;
  positionY: number;
  targetPositionX?: number;
  targetPositionY?: number;
  driverName: string;
  driverPhone: string;
  batteryPercent: number;
  maxCapacityTons: number;
  currentTask?: string;
}

export interface ForkliftDispatch {
  id: string;
  dispatchNo: string;
  forkliftId: string;
  forkliftCode: string;
  containerId: string;
  containerNo: string;
  fromLocation: string;
  toLocation: string;
  dispatchedAt: string;
  completedAt?: string;
  status: 'PENDING' | 'MOVING' | 'COMPLETED' | 'CANCELLED';
  driverName: string;
  priority: 'NORMAL' | 'URGENT' | 'HIGH';
  waypoints?: { x: number; y: number }[];
  currentWaypointIndex?: number;
}

export interface YardMoveHistory {
  id: string;
  containerId: string;
  containerNo: string;
  fromLocation: string;
  toLocation: string;
  moveDate: string;
  forkliftId: string;
  forkliftCode: string;
  userId: string;
  userName: string;
  reason: string;
}

export interface YardStatistics {
  totalCapacity: number;
  totalContainers: number;
  availableSlots: number;
  occupancyRate: number;
  repairCount: number;
  cleaningCount: number;
  holdCount: number;
  waitingGateInCount: number;
  waitingGateOutCount: number;
  activeForklifts: number;
}

export interface YardFilterState {
  searchQuery: string;
  shippingLine: string;
  block: string;
  zone: string;
  size: string;
  type: string;
  status: string;
  fromDate?: string;
  toDate?: string;
}

export interface YardRoadConfig {
  id: string;
  name: string;
  type: 'MAIN' | 'SECONDARY' | 'CROSS';
  points: number[];
  width: number;
  lanes: number;
  hasArrow?: boolean;
}
