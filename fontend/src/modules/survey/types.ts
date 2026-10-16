export type SurveyStatus = 
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'EEIR_ISSUED';

export type ContainerConditionGrade = 'AV' | 'CL' | 'DM';

export type QualityGradeType = 'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE' | 'OTHER';

export type CleaningCategoryType = 
  | 'GENERAL_SWEEP'       // Quét dọn rác, bổi & xịt bụi khô
  | 'WATER_PRESSURE'      // Xịt rửa nước áp lực cao (Water Wash)
  | 'HOT_WATER_WASH'      // Xịt rửa nước nóng 80°C
  | 'CHEMICAL_WASH'       // Tẩy rửa hóa chất sinh học / kiềm dầu
  | 'DEODORIZATION'       // Khử mùi tanh hải sản / gia vị
  | 'OIL_REMOVAL'         // Tẩy vết dầu loang ván sàn gỗ
  | 'STICKER_REMOVAL'     // Bóc gỡ tem nhãn cước cũ / nhãn DG
  | 'REEFER_SANITATION'   // Vệ sinh khử trùng khoang lạnh FDA
  | 'FLOOR_TREATMENT'     // Chà nhám / Xử lý bề mặt ván sàn
  | 'SPECIAL_TREATMENT';  // Xử lý nấm mốc / hóa chất độc hại

export type CleaningReasonType = 
  | 'DUST'
  | 'CHEMICAL_SMELL'
  | 'OIL_GREASE'
  | 'CARGO_RESIDUE'
  | 'TRASH_DUNNAGE'
  | 'FLOOR_DIRTY'
  | 'STICKER_LABEL'
  | 'MOLD_MOISTURE'
  | 'OTHER';

export type CleaningMethodType = 
  | 'SWEEPING'
  | 'WATER_PRESSURE'
  | 'CHEMICAL_WASH'
  | 'DEODORIZE'
  | 'STEAM_CLEAN'
  | 'HOT_WASH'
  | 'FLOOR_SANDING';

export interface SurveyCleaningItemRecord {
  id: string;
  cleaningCode: string;
  cleaningName: string;
  category: CleaningCategoryType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  responsibleParty: 'O' | 'U' | 'T'; // O: Chủ vỏ/Hãng tàu, U: Chủ hàng, T: Nhà xe
  chemicalRequired?: string | boolean;
  chemicalName?: string;
  status?: 'REQUIRED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  washerName?: string;
  completedAt?: string;
}

export interface CleaningTariffMasterItem {
  id: string;
  cleaningCode: string; // e.g. "CLN_SWEEP_STD", "CLN_WASH_200BAR", "CLN_HOT_80C", "CLN_CHEM_OIL"
  cedexCode: string;    // CEDEX code e.g. "SW", "WW", "HW", "CW", "DO", "SR", "RF", "FS"
  name: string;
  vietnameseName: string;
  category: CleaningCategoryType;
  description: string;
  applicableSizes: ('20' | '40' | '45')[];
  applicableContainerTypes?: string[]; // Danh sách mã loại container áp dụng (20DC, 40HC, 20RF, 40HR, 20OT, 20FR, 20TK...)
  
  // Base Prices by Size & Type (VND)
  price20DC: number; // Đơn giá cont 20GP/DC khô
  price40DC: number; // Đơn giá cont 40GP/DC khô
  price40HC: number; // Đơn giá cont 40HC cao
  price45HC: number; // Đơn giá cont 45HC
  price20RF: number; // Đơn giá cont 20RF lạnh
  price40HR: number; // Đơn giá cont 40HR lạnh
  priceByContainerType?: Record<string, number>; // Đơn giá chi tiết theo từng mã loại cont trong danh mục (20OT, 40OT, 20FR, 40FR, 20TK...)
  
  currency: 'VND' | 'USD';
  estimatedDurationMin: number; // Thời gian thực hiện (phút)
  waterUsageLiters: number;     // Lượng nước tiêu thụ (lít)
  chemicalRequired: string;     // Hóa chất sử dụng
  equipmentUsed: string;        // Thiết bị chuyên dụng
  responsiblePartyDefault: 'O' | 'U' | 'T'; // Bên chịu chi phí mặc định
  vatPercent: number;           // Thuế VAT % (mặc định 8)
  
  // Custom tariff overrides by shipping line
  shippingLinePricing?: {
    shippingLine: string;
    price20: number;
    price40: number;
    price45: number;
  }[];
  
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

export type InspectionZoneKey = 
  | 'ROOF'
  | 'FRONT_WALL'
  | 'LEFT_WALL'
  | 'RIGHT_WALL'
  | 'DOOR'
  | 'FLOOR'
  | 'FRAME'
  | 'CORNER_CASTING'
  | 'UNDERSTRUCTURE'
  | 'REEFER_UNIT'
  | 'CLEANING';

export type ZoneCheckStatus = 'PASS' | 'FAIL' | 'NA';

export interface InspectionChecklistItem {
  zoneKey: InspectionZoneKey;
  zoneName: string;
  status: ZoneCheckStatus;
  notes?: string;
  damageCount: number;
}

export interface DamageRecord {
  id: string;
  locationCode: string;
  locationName: string;
  damageCode: string;
  damageName: string;
  repairCode: string;
  repairName: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lengthMm?: number;
  widthMm?: number;
  quantity?: number;
  photoUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface SurveyPhoto {
  id: string;
  url: string;
  type: 'OVERVIEW' | 'DETAIL' | 'DOOR_SEAL' | 'INTERIOR_FLOOR' | 'REEFER_PANEL' | 'OTHER';
  caption: string;
  damageLocation?: string;
  damageCode?: string;
  surveyor: string;
  uploadedAt: string;
  fileSizeKb: number;
}

export interface SurveyItemRecord {
  id: string;
  surveyNo: string;
  containerNo: string;
  isoCode: string;
  size: string;
  type: string;
  sizeType?: string;
  owner: string;
  shippingLine: string;
  isReefer: boolean;
  gateInTime: string;
  surveyDate: string;
  surveyor: string;
  shift?: string;
  status: SurveyStatus;
  // Khóa "nhận giám định" — set khi 1 surveyor bấm mở hồ sơ, chặn người khác nhận trùng
  // container này cho tới khi nộp phiếu hoặc tự bỏ nhận (xem SurveyModulePage.handleOpenSurvey).
  surveyClaimedByStaffId?: number;
  surveyClaimedByName?: string;
  surveyClaimedAt?: string;
  standard: string; // mã trong DM Tiêu Chuẩn Giám Định
  standardNotes?: string;
  condition: ContainerConditionGrade;
  
  // Physical specifications
  manufactureMonthYear?: string;
  tareWeightKg?: number;
  maxGrossWeightKg?: number;
  payloadKg?: number;
  material?: string;
  floorType?: string;
  cscPlateNo?: string;

  // Gate / Truck / Location Info
  truckPlate?: string;
  trailerPlate?: string;
  driverName?: string;
  driverLicense?: string;
  driverPhone?: string;
  yardLocation?: string; // e.g. "A02-04-03"
  sealNo?: string;
  customsSealNo?: string;
  cargoStatus?: 'EMPTY' | 'FULL_IMPORT' | 'FULL_EXPORT' | 'LCL';

  // Reefer Machinery Info (if Reefer)
  reeferBrand?: 'CARRIER' | 'THERMO_KING' | 'DAIKIN' | 'STAR_COOL';
  reeferModel?: string;
  setTemperature?: number;
  ptiStatus?: 'PASSED' | 'PENDING' | 'FAILED' | 'NOT_REQUIRED';
  compressorHours?: number;
  humidityPercent?: number;
  ventilationCmh?: number;
  
  // AV Grade details
  qualityGrade?: QualityGradeType | string; // mã trong DM Hạng (GRADE_A...)
  
  // CL details
  cleaningReason?: CleaningReasonType[];
  cleaningMethod?: CleaningMethodType;
  cleaningRemarks?: string;
  cleaningEstimatedCost?: number;
  cleaningItems?: SurveyCleaningItemRecord[];
  cleaningTotalCost?: number;

  // DM details
  damages: DamageRecord[];
  
  // Checklist
  checklist: InspectionChecklistItem[];

  // Photos
  photos: SurveyPhoto[];

  // General remarks & action
  remarks?: string;
  actionRequired?: 'AVAILABLE_FOR_DISPATCH' | 'SEND_TO_WASHING' | 'SEND_TO_REPAIR' | 'HOLD_FOR_SURVEYOR_REVIEW';

  // e-EIR metadata
  eeirNo?: string;
  eeirIssuedAt?: string;
}

// Master Data Types
export interface DamageLocationMasterItem {
  id: string;
  code: string;
  name: string;
  vietnameseName: string;
  description: string;
  category: 'EXTERIOR' | 'INTERIOR' | 'UNDER' | 'STRUCTURE' | 'REEFER';
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

export interface DamageCodeMasterItem {
  id: string;
  code: string;
  name: string;
  vietnameseName: string;
  damageType: 'HOLE' | 'CUT' | 'DENT' | 'BENT' | 'CORROSION' | 'DELAMINATION' | 'BROKEN' | 'MISSING' | 'OTHER';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  standard: 'IICL-6' | 'MCIC' | 'MRIC' | 'UNIVERSAL';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RepairCodeMasterItem {
  id: string;
  repairCode: string;
  stsCode: string;
  name: string;
  vietnameseName: string;
  description: string;
  repairType: 'WELDING' | 'STRAIGHTEN' | 'PATCH' | 'REPLACE' | 'SEALING' | 'CLEANING' | 'WOOD_REPAIR';
  labourRate: number; // VND per hour
  labourHours: number; // e.g. 1.5 hrs
  materialEstimatedCost: number; // VND
  status: 'ACTIVE' | 'INACTIVE';
}

export interface GradeMasterItem {
  id: string;
  gradeCode: string;
  gradeName: string;
  description: string;
  shippingLine: string; // 'ALL' or specific line
  customer: string; // 'ALL' or specific
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

export interface InspectionStandardMasterItem {
  id: string;
  standardCode: string;
  standardName: string;
  shippingLine: string;
  containerType: string;
  containerSize: string;
  version: string;
  effectiveDate: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type ContainerSizeCategory = '10' | '20' | '40' | '45';
export type ContainerCategoryType = 'DRY' | 'REEFER' | 'OPEN_TOP' | 'FLAT_RACK' | 'TANK' | 'BULK' | 'VENTILATED' | 'SPECIAL';
export type ContainerMaterialType = 'CORTEN_STEEL' | 'STAINLESS_STEEL' | 'ALUMINUM' | 'FRP';
export type ContainerFloorType = 'WOOD_PLYWOOD' | 'STEEL' | 'ALUMINUM_T_FLOOR' | 'BAMBOO';

export interface ContainerTypeMasterItem {
  id: string;
  typeCode: string; // e.g. "20DC", "40HC", "20RF", "40HR", "45HC", "20OT", "40OT", "20FR", "40FR", "20TK", "40TK", "20VH"
  isoCode: string; // e.g. "22G1", "45G1", "22R1", "45R1", "L5G1", "22U1", "45U1", "22P1", "45P1", "22T1", "22V0"
  name: string;
  vietnameseName: string;
  size: ContainerSizeCategory;
  category: ContainerCategoryType;
  isReefer: boolean;
  
  // Dimensions (mm)
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  internalLengthMm: number;
  internalWidthMm: number;
  internalHeightMm: number;
  doorWidthMm: number;
  doorHeightMm: number;

  // Weight & Capacity
  cbm: number; // Volume in m3
  tareWeightKg: number; // Trọng lượng bì
  maxPayloadKg: number; // Tải trọng hàng hóa tối đa
  maxGrossWeightKg: number; // Tổng trọng tải cả bì và hàng
  teuRatio: number; // 1 for 20ft, 2 for 40ft, 2.25 for 45ft, 0.5 for 10ft

  // Reefer Specs (if applicable)
  tempRangeMin?: number; // e.g. -30
  tempRangeMax?: number; // e.g. +30

  // Construction
  material: ContainerMaterialType;
  floorType: ContainerFloorType;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}
