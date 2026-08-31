import axios from 'axios';
import {
  YardZone,
  YardBlock,
  YardContainer,
  YardLocationEntity,
  Forklift,
  ForkliftDispatch,
  YardMoveHistory,
  YardStatistics,
  YardGateLane
} from '../types/yardTypes';

const API_BASE = '/api/yard';

export interface YardFullResponse {
  zones: YardZone[];
  blocks: YardBlock[];
  containers: YardContainer[];
  locations: YardLocationEntity[];
  forklifts: Forklift[];
  dispatches: ForkliftDispatch[];
  gateLanes: YardGateLane[];
  statistics: YardStatistics;
}

export const initialZones: YardZone[] = [
  {
    id: 'ZONE_GATE_IN',
    yardId: 'YARD_HN_01',
    zoneCode: 'GATE_IN',
    zoneName: 'CỔNG VÀO CONTAINER (GATE-IN)',
    zoneType: 'GATE_IN',
    positionX: 50,
    positionY: 50,
    width: 320,
    height: 180,
    description: '3 Làn OCR/RFID - Cân điện tử 80T - Camera giám sát'
  },
  {
    id: 'ZONE_INSPECTION',
    yardId: 'YARD_HN_01',
    zoneCode: 'INSPECTION',
    zoneName: 'KHU VỰC KHẢO SÁT & GIÁM ĐỊNH (IICL SURVEY)',
    zoneType: 'INSPECTION',
    positionX: 420,
    positionY: 50,
    width: 380,
    height: 180,
    description: 'Bệ giám định gầm, vách, nóc & máy lạnh PTI'
  },
  {
    id: 'ZONE_GATE_OUT',
    yardId: 'YARD_HN_01',
    zoneCode: 'GATE_OUT',
    zoneName: 'CỔNG XUẤT CONTAINER (GATE-OUT)',
    zoneType: 'GATE_OUT',
    positionX: 1600,
    positionY: 50,
    width: 320,
    height: 180,
    description: '2 Làn xuất bãi - Đối soát EDO & Seal Hải quan'
  },
  {
    id: 'ZONE_STORAGE_A',
    yardId: 'YARD_HN_01',
    zoneCode: 'STORAGE_A',
    zoneName: 'KHU BÃI BLOCK A (CONTAINER KHÔ TIÊU CHUẨN)',
    zoneType: 'STORAGE',
    positionX: 50,
    positionY: 420,
    width: 520,
    height: 380,
    description: 'Khu bãi chính - 8 Bays x 4 Rows - 4 Tiers'
  },
  {
    id: 'ZONE_STORAGE_B',
    yardId: 'YARD_HN_01',
    zoneCode: 'STORAGE_B',
    zoneName: 'KHU BÃI BLOCK B (CONTAINER LẠNH REEFER / MAERSK & MSC)',
    zoneType: 'STORAGE',
    positionX: 620,
    positionY: 420,
    width: 520,
    height: 380,
    description: 'Trạm cắm điện 380V - 8 Bays x 4 Rows - 4 Tiers'
  },
  {
    id: 'ZONE_STORAGE_C',
    yardId: 'YARD_HN_01',
    zoneCode: 'STORAGE_C',
    zoneName: 'KHU BÃI BLOCK C (CONTAINER RỖNG KHAI THÁC ONE / CMA)',
    zoneType: 'STORAGE',
    positionX: 1190,
    positionY: 420,
    width: 520,
    height: 380,
    description: 'Khu vỏ sạch xuất khẩu - 8 Bays x 4 Rows - 4 Tiers'
  },
  {
    id: 'ZONE_STORAGE_D',
    yardId: 'YARD_HN_01',
    zoneCode: 'STORAGE_D',
    zoneName: 'KHU BÃI BLOCK D (CONTAINER 45HC & ĐẶC BIỆT OT/FR)',
    zoneType: 'STORAGE',
    positionX: 50,
    positionY: 860,
    width: 520,
    height: 380,
    description: 'Bãi hạ container ngoại cỡ & 45 High Cube'
  },
  {
    id: 'ZONE_STORAGE_E',
    yardId: 'YARD_HN_01',
    zoneCode: 'STORAGE_E',
    zoneName: 'KHU BÃI BLOCK E (DỰ PHÒNG & CHUYỂN TẢI CẢNG)',
    zoneType: 'STORAGE',
    positionX: 620,
    positionY: 860,
    width: 520,
    height: 380,
    description: 'Khu bãi chuyển tải nhanh & trung chuyển sà lan'
  },
  {
    id: 'ZONE_REPAIR',
    yardId: 'YARD_HN_01',
    zoneCode: 'REPAIR',
    zoneName: 'KHU VỰC XƯỞNG SỬA CHỮA EMR (REPAIR AREA)',
    zoneType: 'REPAIR',
    positionX: 1760,
    positionY: 340,
    width: 380,
    height: 250,
    description: 'Xưởng hàn cắt, nắn xà, thay vách, vá sàn & sơn'
  },
  {
    id: 'ZONE_CLEANING',
    yardId: 'YARD_HN_01',
    zoneCode: 'CLEANING',
    zoneName: 'BÃI RỬA & VỆ SINH CONTAINER (CLEANING PAD)',
    zoneType: 'CLEANING',
    positionX: 1760,
    positionY: 630,
    width: 380,
    height: 250,
    description: 'Trạm rửa áp lực cao, xịt hóa chất & sấy khô'
  },
  {
    id: 'ZONE_HOLD',
    yardId: 'YARD_HN_01',
    zoneCode: 'HOLD',
    zoneName: 'KHU VỰC NIÊM PHONG TẠM GIỮ (HOLD AREA)',
    zoneType: 'HOLD',
    positionX: 1760,
    positionY: 920,
    width: 380,
    height: 250,
    description: 'Cách ly: Hải quan niêm phong, thiếu chứng từ, tranh chấp'
  },
  {
    id: 'ZONE_STAGING',
    yardId: 'YARD_HN_01',
    zoneCode: 'STAGING',
    zoneName: 'KHU VỰC CHỜ CẤP VỎ / STAGING (PRE GATE-OUT)',
    zoneType: 'STAGING',
    positionX: 1190,
    positionY: 860,
    width: 520,
    height: 200,
    description: 'Khu tập kết container đã kiểm tra AV sẵn sàng nâng lên xe'
  },
  {
    id: 'ZONE_FORKLIFT',
    yardId: 'YARD_HN_01',
    zoneCode: 'FORKLIFT_AREA',
    zoneName: 'BÃI ĐẬU XE NÂNG & BẢO TRÌ (FORKLIFT AREA)',
    zoneType: 'FORKLIFT_AREA',
    positionX: 1190,
    positionY: 1090,
    width: 520,
    height: 150,
    description: 'Trạm bảo dưỡng xe nâng Kalmar/Konecranes & sạc điện'
  }
];

export const initialBlocks: YardBlock[] = [
  {
    id: 'BLOCK_A',
    yardId: 'YARD_HN_01',
    zoneId: 'ZONE_STORAGE_A',
    blockCode: 'A',
    blockName: 'BLOCK A - DRY STANDARD',
    bayCount: 8,
    rowCount: 4,
    maxTier: 4,
    positionX: 65,
    positionY: 455,
    width: 480,
    height: 310,
    status: 'ACTIVE',
    description: 'Block chính chứa vỏ Dry 20GP và 40HC hãng tàu MSK & MSC',
    totalCapacity: 128,
    occupiedCount: 96,
    availableCount: 32,
    repairCount: 8,
    cleaningCount: 4,
    holdCount: 2
  },
  {
    id: 'BLOCK_B',
    yardId: 'YARD_HN_01',
    zoneId: 'ZONE_STORAGE_B',
    blockCode: 'B',
    blockName: 'BLOCK B - REEFER COLD CHAIN',
    bayCount: 8,
    rowCount: 4,
    maxTier: 4,
    positionX: 635,
    positionY: 455,
    width: 480,
    height: 310,
    status: 'ACTIVE',
    description: 'Block chuyên dụng container lạnh có ổ cắm PTI và giám sát nhiệt độ',
    totalCapacity: 128,
    occupiedCount: 84,
    availableCount: 44,
    repairCount: 5,
    cleaningCount: 6,
    holdCount: 3
  },
  {
    id: 'BLOCK_C',
    yardId: 'YARD_HN_01',
    zoneId: 'ZONE_STORAGE_C',
    blockCode: 'C',
    blockName: 'BLOCK C - EXPORT EMPTY',
    bayCount: 8,
    rowCount: 4,
    maxTier: 4,
    positionX: 1205,
    positionY: 455,
    width: 480,
    height: 310,
    status: 'ACTIVE',
    description: 'Block vỏ sạch xuất khẩu cho hãng ONE, CMA CGM và COSCO',
    totalCapacity: 128,
    occupiedCount: 110,
    availableCount: 18,
    repairCount: 2,
    cleaningCount: 3,
    holdCount: 1
  },
  {
    id: 'BLOCK_D',
    yardId: 'YARD_HN_01',
    zoneId: 'ZONE_STORAGE_D',
    blockCode: 'D',
    blockName: 'BLOCK D - 45HC & SPECIALS',
    bayCount: 8,
    rowCount: 4,
    maxTier: 4,
    positionX: 65,
    positionY: 895,
    width: 480,
    height: 310,
    status: 'ACTIVE',
    description: 'Block container 45HC, Open Top và Flat Rack chuyển tải cảng',
    totalCapacity: 128,
    occupiedCount: 62,
    availableCount: 66,
    repairCount: 4,
    cleaningCount: 2,
    holdCount: 4
  },
  {
    id: 'BLOCK_E',
    yardId: 'YARD_HN_01',
    zoneId: 'ZONE_STORAGE_E',
    blockCode: 'E',
    blockName: 'BLOCK E - BUFFER & FEEDER',
    bayCount: 8,
    rowCount: 4,
    maxTier: 4,
    positionX: 635,
    positionY: 895,
    width: 480,
    height: 310,
    status: 'ACTIVE',
    description: 'Block đệm chuyển tải sà lan sông và xe đầu kéo liên vùng',
    totalCapacity: 128,
    occupiedCount: 45,
    availableCount: 83,
    repairCount: 1,
    cleaningCount: 1,
    holdCount: 0
  }
];

export const initialContainers: YardContainer[] = [
  {
    id: 'CONT-01',
    containerNo: 'MSKU1234567',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'Maersk Line (MSK)',
    condition: 'DM',
    status: 'REPAIR',
    locationCode: 'A-05-03-02',
    blockId: 'BLOCK_A',
    bayNo: 5,
    rowNo: 3,
    tierNo: 2,
    tareWeightKg: 3820,
    maxPayloadKg: 28680,
    grossWeightKg: 32500,
    sealNo: 'ML-VN-9921',
    gateInDate: '2026-08-18 08:30',
    inspectionDate: '2026-08-18 08:45',
    repairDate: '2026-08-18 10:00',
    notes: 'Móp xà nóc & thủng vách phải - Đang chờ hàn đắp'
  },
  {
    id: 'CONT-02',
    containerNo: 'MSKU5555666',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'Maersk Line (MSK)',
    condition: 'AV',
    status: 'IN_YARD',
    locationCode: 'A-05-03-01',
    blockId: 'BLOCK_A',
    bayNo: 5,
    rowNo: 3,
    tierNo: 1,
    tareWeightKg: 3800,
    maxPayloadKg: 28700,
    gateInDate: '2026-08-17 14:15',
    inspectionDate: '2026-08-17 14:30',
    notes: 'Đã nghiệm thu AV Grade - Sẵn sàng bốc'
  },
  {
    id: 'CONT-03',
    containerNo: 'MSKU8888999',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'Maersk Line (MSK)',
    condition: 'CL',
    status: 'CLEANING',
    locationCode: 'A-05-03-03',
    blockId: 'BLOCK_A',
    bayNo: 5,
    rowNo: 3,
    tierNo: 3,
    tareWeightKg: 3850,
    maxPayloadKg: 28650,
    gateInDate: '2026-08-18 09:10',
    notes: 'Bám bẩn sàn dầu nhớt - Chờ rửa xà phòng'
  },
  {
    id: 'CONT-04',
    containerNo: 'MSCU7728192',
    isoType: '40RH',
    size: '40',
    type: 'REEFER',
    shippingLine: 'MSC',
    condition: 'AV',
    status: 'AVAILABLE',
    locationCode: 'B-03-02-01',
    blockId: 'BLOCK_B',
    bayNo: 3,
    rowNo: 2,
    tierNo: 1,
    tareWeightKg: 4200,
    maxPayloadKg: 28300,
    gateInDate: '2026-08-16 11:20',
    inspectionDate: '2026-08-16 11:40',
    notes: 'Container lạnh PTI Pass - Set temp -20°C'
  },
  {
    id: 'CONT-05',
    containerNo: 'MSCU9938120',
    isoType: '40RH',
    size: '40',
    type: 'REEFER',
    shippingLine: 'MSC',
    condition: 'DM',
    status: 'HOLD',
    holdReason: 'DAMAGE_HOLD',
    holdNotes: 'Hỏng máy nén lạnh Carrier & rò gas R134a - Nghiêm cấm cấp cho khách hàng đóng hoa quả',
    locationCode: 'B-03-02-02',
    blockId: 'BLOCK_B',
    bayNo: 3,
    rowNo: 2,
    tierNo: 2,
    tareWeightKg: 4220,
    maxPayloadKg: 28280,
    gateInDate: '2026-08-17 07:45',
    inspectionDate: '2026-08-17 08:00'
  },
  {
    id: 'CONT-06',
    containerNo: 'ONEY1928374',
    isoType: '20GP',
    size: '20',
    type: 'DRY',
    shippingLine: 'ONE (Ocean Network Express)',
    condition: 'AV',
    status: 'AVAILABLE',
    locationCode: 'C-01-01-01',
    blockId: 'BLOCK_C',
    bayNo: 1,
    rowNo: 1,
    tierNo: 1,
    tareWeightKg: 2200,
    maxPayloadKg: 28280,
    gateInDate: '2026-08-15 16:00'
  },
  {
    id: 'CONT-07',
    containerNo: 'ONEY5849201',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'ONE (Ocean Network Express)',
    condition: 'AV',
    status: 'RESERVED',
    locationCode: 'C-01-01-02',
    blockId: 'BLOCK_C',
    bayNo: 1,
    rowNo: 1,
    tierNo: 2,
    tareWeightKg: 3800,
    maxPayloadKg: 28700,
    destinationLocation: 'STAGING-01',
    gateInDate: '2026-08-16 10:00',
    notes: 'Booking EXP-ONE-88392 - Đã chỉ định bốc đóng hàng may mặc'
  },
  {
    id: 'CONT-08',
    containerNo: 'CMAU9918234',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'CMA CGM',
    condition: 'DM',
    status: 'REPAIR',
    locationCode: 'A-02-04-01',
    blockId: 'BLOCK_A',
    bayNo: 2,
    rowNo: 4,
    tierNo: 1,
    tareWeightKg: 3820,
    maxPayloadKg: 28680,
    gateInDate: '2026-08-17 10:20',
    repairDate: '2026-08-18 08:00',
    notes: 'Hỏng gioăng cửa & rách vách trái'
  },
  {
    id: 'CONT-09',
    containerNo: 'COSU6629102',
    isoType: '20GP',
    size: '20',
    type: 'DRY',
    shippingLine: 'COSCO Shipping',
    condition: 'DM',
    status: 'HOLD',
    holdReason: 'CUSTOMS_HOLD',
    holdNotes: 'Chi cục Hải quan Depot yêu cầu niêm phong phục vụ chuyên án soi chiếu',
    locationCode: 'D-04-02-01',
    blockId: 'BLOCK_D',
    bayNo: 4,
    rowNo: 2,
    tierNo: 1,
    tareWeightKg: 2240,
    maxPayloadKg: 28240,
    gateInDate: '2026-08-14 09:00'
  },
  {
    id: 'CONT-10',
    containerNo: 'EMCU4459201',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'Evergreen Marine (EMC)',
    condition: 'AV',
    status: 'AVAILABLE',
    locationCode: 'C-04-03-01',
    blockId: 'BLOCK_C',
    bayNo: 4,
    rowNo: 3,
    tierNo: 1,
    tareWeightKg: 3810,
    maxPayloadKg: 28690,
    gateInDate: '2026-08-17 15:30'
  },
  {
    id: 'CONT-11',
    containerNo: 'HMMU3391820',
    isoType: '45HC',
    size: '45',
    type: 'DRY',
    shippingLine: 'HMM (Hyundai Merchant Marine)',
    condition: 'AV',
    status: 'IN_YARD',
    locationCode: 'D-01-01-01',
    blockId: 'BLOCK_D',
    bayNo: 1,
    rowNo: 1,
    tierNo: 1,
    tareWeightKg: 4500,
    maxPayloadKg: 28000,
    gateInDate: '2026-08-16 08:00'
  },
  {
    id: 'CONT-12',
    containerNo: 'HLXU8829104',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'Hapag-Lloyd',
    condition: 'AV',
    status: 'WAITING_GATE_OUT',
    locationCode: 'STAGING-02',
    blockId: 'STAGING',
    bayNo: 1,
    rowNo: 2,
    tierNo: 1,
    tareWeightKg: 3820,
    maxPayloadKg: 28680,
    gateInDate: '2026-08-15 10:00',
    notes: 'Tài xế xe đầu kéo 29H-88392 đang qua trạm cân'
  },
  {
    id: 'CONT-13',
    containerNo: 'MSKU9948201',
    isoType: '40HC',
    size: '40',
    type: 'DRY',
    shippingLine: 'Maersk Line (MSK)',
    condition: 'DM',
    status: 'HOLD',
    holdReason: 'PAYMENT_HOLD',
    holdNotes: 'Chưa thanh toán phí nâng hạ và lưu bãi 12 ngày (Nợ 1.850.000 VNĐ)',
    locationCode: 'A-01-02-01',
    blockId: 'BLOCK_A',
    bayNo: 1,
    rowNo: 2,
    tierNo: 1,
    tareWeightKg: 3800,
    maxPayloadKg: 28700,
    gateInDate: '2026-08-05 14:00'
  }
];

export const initialForklifts: Forklift[] = [
  {
    id: 'FL-01',
    code: 'FL-001',
    name: 'Xe Nâng Kalmar 45T (#01)',
    status: 'AVAILABLE',
    currentLocation: 'A-03-02',
    positionX: 380,
    positionY: 340,
    driverName: 'Nguyễn Văn Hùng',
    driverPhone: '0912.345.678',
    batteryPercent: 88,
    maxCapacityTons: 45,
    currentTask: 'Sẵn sàng điều độ bốc hạ vỏ'
  },
  {
    id: 'FL-02',
    code: 'FL-002',
    name: 'Xe Nâng Konecranes 42T (#02)',
    status: 'MOVING',
    currentLocation: 'B-05-01',
    positionX: 950,
    positionY: 340,
    targetPositionX: 1350,
    targetPositionY: 340,
    driverName: 'Trần Đình Nam',
    driverPhone: '0988.765.432',
    batteryPercent: 72,
    maxCapacityTons: 42,
    currentTask: 'Đang chuyển vỏ MSCU7728192 sang Block C'
  },
  {
    id: 'FL-03',
    code: 'FL-003',
    name: 'Xe Nâng Chụp Rỗng Hyster 10T (#03)',
    status: 'AVAILABLE',
    currentLocation: 'FORKLIFT_PAD',
    positionX: 1350,
    positionY: 1140,
    driverName: 'Lê Hoàng Anh',
    driverPhone: '0903.112.233',
    batteryPercent: 95,
    maxCapacityTons: 10,
    currentTask: 'Đậu tại xưởng bảo trì xe nâng'
  }
];

export const initialDispatches: ForkliftDispatch[] = [
  {
    id: 'DISP-01',
    dispatchNo: 'DISP-2026-001',
    forkliftId: 'FL-02',
    forkliftCode: 'FL-002',
    containerId: 'CONT-01',
    containerNo: 'MSKU1234567',
    fromLocation: 'A-01-02-01',
    toLocation: 'A-05-03-02',
    dispatchedAt: '2026-08-18 09:30',
    status: 'COMPLETED',
    driverName: 'Trần Đình Nam',
    priority: 'NORMAL'
  },
  {
    id: 'DISP-02',
    dispatchNo: 'DISP-2026-002',
    forkliftId: 'FL-01',
    forkliftCode: 'FL-001',
    containerId: 'CONT-07',
    containerNo: 'ONEY5849201',
    fromLocation: 'C-01-01-02',
    toLocation: 'STAGING-01',
    dispatchedAt: '2026-08-18 10:15',
    status: 'MOVING',
    driverName: 'Nguyễn Văn Hùng',
    priority: 'URGENT'
  }
];

export const initialMoveHistories: YardMoveHistory[] = [
  {
    id: 'HIST-01',
    containerId: 'CONT-01',
    containerNo: 'MSKU1234567',
    fromLocation: 'INSPECTION-PAD',
    toLocation: 'A-01-02-01',
    moveDate: '2026-08-18 08:50',
    forkliftId: 'FL-01',
    forkliftCode: 'FL-001',
    userId: 'USR-001',
    userName: 'Nguyễn Văn Hùng',
    reason: 'Hạ bãi sau khi hoàn tất giám định IICL'
  },
  {
    id: 'HIST-02',
    containerId: 'CONT-01',
    containerNo: 'MSKU1234567',
    fromLocation: 'A-01-02-01',
    toLocation: 'A-05-03-02',
    moveDate: '2026-08-18 09:30',
    forkliftId: 'FL-02',
    forkliftCode: 'FL-002',
    userId: 'USR-003',
    userName: 'Lê Hoàng Nam',
    reason: 'Đảo chuyển sang khu vực chờ sửa chữa Block A Bay 05'
  },
  {
    id: 'HIST-03',
    containerId: 'CONT-04',
    containerNo: 'MSCU7728192',
    fromLocation: 'GATE-IN-LANE1',
    toLocation: 'B-03-02-01',
    moveDate: '2026-08-16 11:35',
    forkliftId: 'FL-01',
    forkliftCode: 'FL-001',
    userId: 'USR-001',
    userName: 'Nguyễn Văn Hùng',
    reason: 'Hạ bãi cắm điện trạm lạnh Reefer Block B'
  }
];

export const initialGateLanes: YardGateLane[] = [
  {
    id: 'LANE-IN-01',
    laneNo: 1,
    gateType: 'IN',
    laneName: 'Làn Vào 01 (Xe Tải Nặng / Cân Điện Tử)',
    hasOcr: true,
    hasRfid: true,
    hasWeighbridge: true,
    status: 'BUSY',
    currentTruckPlate: '51D-892.12',
    currentContainerNo: 'MSKU9938120'
  },
  {
    id: 'LANE-IN-02',
    laneNo: 2,
    gateType: 'IN',
    laneName: 'Làn Vào 02 (Tự Động Smart OCR)',
    hasOcr: true,
    hasRfid: true,
    hasWeighbridge: false,
    status: 'OPEN'
  },
  {
    id: 'LANE-IN-03',
    laneNo: 3,
    gateType: 'IN',
    laneName: 'Làn Vào 03 (Ưu Tiên Cont Rỗng)',
    hasOcr: true,
    hasRfid: true,
    hasWeighbridge: false,
    status: 'OPEN'
  },
  {
    id: 'LANE-OUT-01',
    laneNo: 1,
    gateType: 'OUT',
    laneName: 'Làn Xuất 01 (Kiểm Soát Seal & EDO)',
    hasOcr: true,
    hasRfid: true,
    hasWeighbridge: true,
    status: 'BUSY',
    currentTruckPlate: '29H-883.92',
    currentContainerNo: 'HLXU8829104'
  },
  {
    id: 'LANE-OUT-02',
    laneNo: 2,
    gateType: 'OUT',
    laneName: 'Làn Xuất 02 (Cấp Vỏ Nhanh)',
    hasOcr: true,
    hasRfid: true,
    hasWeighbridge: false,
    status: 'OPEN'
  }
];

// Chuyển đổi Status thật của DepotJob (GATE_IN/SURVEYING/ESTIMATING/REPAIRING/READY_FOR_OUT/GATE_OUT/PAID...)
// sang ContainerStatus hiển thị trên sơ đồ bãi 2D — bảng màu hiển thị chỉ có 1 nhóm nhãn cố định,
// trong khi nghiệp vụ có nhiều trạng thái chi tiết hơn, nên đây là quy đổi hiển thị (không đổi dữ liệu gốc).
function mapJobStatusToContainerStatus(jobStatus: string, condition: string): YardContainer['status'] {
  if (condition === 'CL') return 'CLEANING';
  switch (jobStatus) {
    case 'REPAIRING':
      return 'REPAIR';
    case 'GATE_IN':
      return 'WAITING_GATE_IN';
    case 'READY_FOR_OUT':
      return 'WAITING_GATE_OUT';
    case 'GATE_OUT':
      return 'GATE_OUT_COMPLETED';
    default:
      return 'IN_YARD';
  }
}

function mapContainerDto(dto: any): YardContainer {
  return {
    id: dto.id,
    containerNo: dto.containerNo,
    isoType: dto.isoType,
    size: (dto.isoType || '').startsWith('20') ? '20' : (dto.isoType || '').startsWith('45') ? '45' : '40',
    type: (dto.isoType || '').includes('R') ? 'REEFER' : 'DRY',
    shippingLine: dto.shippingLine || '',
    condition: dto.condition,
    status: mapJobStatusToContainerStatus(dto.status, dto.condition),
    locationCode: dto.locationCode,
    blockId: dto.blockId,
    bayNo: dto.bayNo,
    rowNo: dto.rowNo,
    tierNo: dto.tierNo,
    tareWeightKg: dto.tareWeightKg,
    maxPayloadKg: dto.maxPayloadKg,
    gateInDate: dto.gateInDate,
    notes: dto.notes || undefined
  };
}

function mapMoveHistoryDto(dto: any): YardMoveHistory {
  return {
    id: String(dto.id),
    containerId: dto.containerNo,
    containerNo: dto.containerNo,
    fromLocation: dto.fromLocation,
    toLocation: dto.toLocation,
    moveDate: dto.moveDate,
    forkliftId: dto.forkliftCode || '',
    forkliftCode: dto.forkliftCode || '',
    userId: dto.performedBy || '',
    userName: dto.performedBy || 'Điều Độ Bãi',
    reason: dto.reason || ''
  };
}

export const yardApi = {
  async getPositions(): Promise<any[]> {
    try {
      const res = await axios.get(`${API_BASE}`);
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.positions)) return payload.positions;
      if (payload && Array.isArray(payload.locations)) return payload.locations;
      return [];
    } catch {
      return [];
    }
  },

  async getYardOverview(): Promise<YardFullResponse> {
    const res = await axios.get(`${API_BASE}/overview`);
    const data = res.data?.data;
    return {
      zones: data?.zones || [],
      blocks: data?.blocks || [],
      containers: (data?.containers || []).map(mapContainerDto),
      locations: data?.locations || [],
      forklifts: data?.forklifts || [],
      dispatches: data?.dispatches || [],
      gateLanes: data?.gateLanes || [],
      statistics: data?.statistics || {
        totalCapacity: 0, totalContainers: 0, availableSlots: 0, occupancyRate: 0,
        repairCount: 0, cleaningCount: 0, holdCount: 0, waitingGateInCount: 0,
        waitingGateOutCount: 0, activeForklifts: 0
      }
    };
  },

  async searchContainers(query: string): Promise<YardContainer[]> {
    const res = await axios.get(`${API_BASE}/containers/search`, { params: { containerNo: query } });
    return (res.data?.data || []).map(mapContainerDto);
  },

  async getContainerById(id: string): Promise<YardContainer | null> {
    try {
      const res = await axios.get(`${API_BASE}/containers/${id}`);
      return res.data?.data ? mapContainerDto(res.data.data) : null;
    } catch {
      return null;
    }
  },

  async getMoveHistories(containerId?: string): Promise<YardMoveHistory[]> {
    const res = await axios.get(`${API_BASE}/history`, { params: { containerId } });
    return (res.data?.data || []).map(mapMoveHistoryDto);
  },

  async moveContainer(payload: {
    containerId: string;
    targetLocation: string; // e.g. "BLOCK_A-02-03-01"
    forkliftId?: string;
    reason: string;
    operatorName?: string;
  }): Promise<{ success: boolean; message: string; container?: YardContainer }> {
    try {
      const res = await axios.post(`${API_BASE}/container/move`, {
        containerId: payload.containerId,
        targetLocation: payload.targetLocation,
        forkliftCode: payload.forkliftId,
        reason: payload.reason,
        operatorName: payload.operatorName
      });
      return { success: true, message: res.data?.message || 'Di chuyển thành công', container: res.data?.data ? mapContainerDto(res.data.data) : undefined };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể di chuyển container.' };
    }
  },

  async dispatchForklift(payload: {
    forkliftId: string;
    containerId: string;
    targetLocation: string;
    priority?: 'NORMAL' | 'URGENT' | 'HIGH';
  }): Promise<{ success: boolean; message: string; dispatch?: ForkliftDispatch }> {
    try {
      const res = await axios.post(`${API_BASE}/forklift/dispatch`, payload);
      return { success: true, message: res.data?.message || 'Phát lệnh điều xe nâng thành công', dispatch: res.data?.data };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể phát lệnh điều xe nâng.' };
    }
  },

  async updateBlockLayout(blockCode: string, payload: {
    blockName: string;
    description?: string;
    bayCount: number;
    rowCount: number;
    maxTier: number;
    status: string;
  }): Promise<{ success: boolean; message: string; block?: YardBlock }> {
    try {
      const res = await axios.put(`${API_BASE}/blocks/${blockCode}`, payload);
      return { success: true, message: res.data?.message || 'Cập nhật Block thành công', block: res.data?.data };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Không thể cập nhật Block.' };
    }
  }
};
