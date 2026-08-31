import { ForkliftOperator, ForkliftVehicle, ForkliftJob, ForkliftHistoryRecord } from './types';

export const FORKLIFT_OPERATORS: ForkliftOperator[] = [
  {
    id: 'OP-01',
    name: 'Trần Văn Bình',
    badgeNo: 'FL-OP-101',
    grade: 'Bậc 5/7 (IICL Safety)',
    phone: '0908.112.233',
    shift: 'Ca Ngày (06:00 - 18:00)'
  },
  {
    id: 'OP-02',
    name: 'Nguyễn Văn An',
    badgeNo: 'FL-OP-102',
    grade: 'Bậc 4/7 (Reach Stacker)',
    phone: '0912.445.566',
    shift: 'Ca Ngày (06:00 - 18:00)'
  },
  {
    id: 'OP-03',
    name: 'Lê Hoàng Phúc',
    badgeNo: 'FL-OP-103',
    grade: 'Bậc 6/7 (Tổ Trưởng Cơ Giới)',
    phone: '0988.776.889',
    shift: 'Ca Đêm (18:00 - 06:00)'
  },
  {
    id: 'OP-04',
    name: 'Đặng Văn Minh',
    badgeNo: 'FL-OP-104',
    grade: 'Bậc 4/7 (Chuyên Cont Lạnh)',
    phone: '0933.221.100',
    shift: 'Ca Ngày (06:00 - 18:00)'
  }
];

export const FORKLIFT_VEHICLES: ForkliftVehicle[] = [
  {
    id: 'VEH-01',
    code: 'FL-001',
    name: 'Kalmar DRG450 Reach Stacker',
    type: 'REACH_STACKER',
    capacityTon: 45,
    assignedArea: 'Block A & B (General Cargo)',
    fuelLevel: 88,
    status: 'ACTIVE'
  },
  {
    id: 'VEH-02',
    code: 'FL-002',
    name: 'Konecranes SMV 4531 TC5',
    type: 'REACH_STACKER',
    capacityTon: 45,
    assignedArea: 'Block C (Reefer Area)',
    fuelLevel: 75,
    status: 'ACTIVE'
  },
  {
    id: 'VEH-03',
    code: 'FL-003',
    name: 'Linde H45D Heavy Duty Forklift',
    type: 'HEAVY_FORKLIFT',
    capacityTon: 32,
    assignedArea: 'Khu Cổng & Giám Định Gate-In',
    fuelLevel: 92,
    status: 'ACTIVE'
  },
  {
    id: 'VEH-04',
    code: 'FL-004',
    name: 'Hyster RS46 Reach Stacker',
    type: 'EMPTY_HANDLER',
    capacityTon: 46,
    assignedArea: 'Khu Bệ Rửa Vệ Sinh & EMR',
    fuelLevel: 64,
    status: 'ACTIVE'
  }
];

export const INITIAL_FORKLIFT_HISTORY: ForkliftHistoryRecord[] = [
  {
    id: 'HIST-01',
    jobNo: 'JOB-20260815-081',
    containerNo: 'MSCU1234567',
    size: '40HC',
    shippingLine: 'MSC',
    condition: 'DM',
    forkliftCode: 'FL-001',
    operatorName: 'Trần Văn Bình',
    fromLocation: 'CỔNG GATE-IN #01 (BÃI HẠ TẠM)',
    plannedLocation: 'BLOCK A - BAY 03 - ROW 02 - TIER 01',
    actualLocation: 'BLOCK A - BAY 03 - ROW 02 - TIER 01',
    isDeviated: false,
    claimedAt: '2026-08-15 08:35',
    startedAt: '2026-08-15 08:38',
    completedAt: '2026-08-15 08:48',
    durationMinutes: 10,
    status: 'COMPLETED',
    note: 'Hạ đúng vị trí khu vực chờ giám định EMR.'
  },
  {
    id: 'HIST-02',
    jobNo: 'JOB-20260815-082',
    containerNo: 'MAEU9821304',
    size: '20GP',
    shippingLine: 'MAEU',
    condition: 'AV',
    forkliftCode: 'FL-003',
    operatorName: 'Nguyễn Văn An',
    fromLocation: 'KHU GIÁM ĐỊNH SURVEY #02',
    plannedLocation: 'BLOCK B - BAY 01 - ROW 04 - TIER 02',
    actualLocation: 'BLOCK B - BAY 01 - ROW 04 - TIER 02',
    isDeviated: false,
    claimedAt: '2026-08-15 09:05',
    startedAt: '2026-08-15 09:08',
    completedAt: '2026-08-15 09:16',
    durationMinutes: 8,
    status: 'COMPLETED',
    note: 'Cont sạch đạt chuẩn, xếp chồng tầng 2.'
  },
  {
    id: 'HIST-03',
    jobNo: 'JOB-20260815-083',
    containerNo: 'COSU6621980',
    size: '40GP',
    shippingLine: 'COSCO',
    condition: 'DM',
    forkliftCode: 'FL-002',
    operatorName: 'Lê Hoàng Phúc',
    fromLocation: 'CỔNG GATE-IN #02',
    plannedLocation: 'BLOCK A - BAY 01 - ROW 02 - TIER 01',
    actualLocation: 'BLOCK A - BAY 01 - ROW 01 - TIER 01',
    isDeviated: true,
    claimedAt: '2026-08-15 09:40',
    startedAt: '2026-08-15 09:42',
    completedAt: '2026-08-15 09:54',
    durationMinutes: 12,
    status: 'COMPLETED',
    note: 'Lệch Row: Chuyển sang Row 01 do Row 02 đang có xe cẩu sửa chữa chiếm lối.'
  }
];
