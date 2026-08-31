/**
 * ISO 6346 Container Number Validation & Specifications Utility
 */

const LETTER_VALUES: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
  K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
  U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38
};

/**
 * Calculates the ISO 6346 Check Digit for a 10-character container prefix (4 letters + 6 digits).
 * Returns a digit between 0 and 9, or null if format is invalid.
 */
export function calculateIsoCheckDigit(containerPrefix10: string): number | null {
  const clean = containerPrefix10.trim().toUpperCase();
  if (clean.length < 10) return null;

  const prefix = clean.substring(0, 10);
  if (!/^[A-Z]{4}\d{6}$/.test(prefix)) return null;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = prefix[i];
    let val: number;
    if (char >= '0' && char <= '9') {
      val = parseInt(char, 10);
    } else {
      val = LETTER_VALUES[char] || 0;
    }
    const weight = Math.pow(2, i);
    sum += val * weight;
  }

  const remainder = sum % 11;
  return remainder === 10 ? 0 : remainder;
}

/**
 * Validates a full 11-character container number against ISO 6346 standard.
 */
export function validateContainerNumber(containerNo: string): {
  isValidFormat: boolean;
  isCheckDigitCorrect: boolean;
  expectedCheckDigit: number | null;
  actualCheckDigit: number | null;
  message: string;
} {
  const clean = containerNo.trim().toUpperCase();
  if (!clean) {
    return {
      isValidFormat: false,
      isCheckDigitCorrect: false,
      expectedCheckDigit: null,
      actualCheckDigit: null,
      message: 'Chưa nhập số container'
    };
  }

  if (clean.length !== 11) {
    return {
      isValidFormat: false,
      isCheckDigitCorrect: false,
      expectedCheckDigit: null,
      actualCheckDigit: null,
      message: `Độ dài hiện tại: ${clean.length}/11 ký tự (Cần đúng 4 chữ cái + 7 chữ số)`
    };
  }

  if (!/^[A-Z]{4}\d{7}$/.test(clean)) {
    return {
      isValidFormat: false,
      isCheckDigitCorrect: false,
      expectedCheckDigit: null,
      actualCheckDigit: null,
      message: 'Định dạng không hợp lệ (4 chữ hoa + 7 chữ số, VD: MSCU1234567)'
    };
  }

  const expected = calculateIsoCheckDigit(clean.substring(0, 10));
  const actual = parseInt(clean.substring(10, 11), 10);

  if (expected === null) {
    return {
      isValidFormat: false,
      isCheckDigitCorrect: false,
      expectedCheckDigit: null,
      actualCheckDigit: actual,
      message: 'Không thể tính toán Check Digit'
    };
  }

  const isCorrect = expected === actual;
  return {
    isValidFormat: true,
    isCheckDigitCorrect: isCorrect,
    expectedCheckDigit: expected,
    actualCheckDigit: actual,
    message: isCorrect
      ? 'Số container chuẩn quốc tế ISO 6346 (Check digit chính xác)'
      : `Check digit không khớp: Nhập '${actual}', chuẩn ISO tính là '${expected}'`
  };
}

export interface ContainerPresetSpec {
  isoCode: string;
  size: string;
  type: string;
  isReefer: boolean;
  tareWeightKg: number;
  maxGrossWeightKg: number;
  payloadKg: number;
  cbm: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  floorType: string;
  material: string;
}

export const CONTAINER_TYPE_PRESETS: Record<string, ContainerPresetSpec> = {
  '20DC': {
    isoCode: '22G1',
    size: '20DC',
    type: 'Dry Standard (GP)',
    isReefer: false,
    tareWeightKg: 2230,
    maxGrossWeightKg: 30480,
    payloadKg: 28250,
    cbm: 33.2,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    floorType: 'Gỗ dán Plywood (28mm)',
    material: 'Thép Corten Steel chống ăn mòn'
  },
  '40DC': {
    isoCode: '42G1',
    size: '40DC',
    type: 'Dry Standard (GP)',
    isReefer: false,
    tareWeightKg: 3750,
    maxGrossWeightKg: 32500,
    payloadKg: 28750,
    cbm: 67.7,
    lengthMm: 12192,
    widthMm: 2438,
    heightMm: 2591,
    floorType: 'Gỗ dán Plywood (28mm)',
    material: 'Thép Corten Steel chống ăn mòn'
  },
  '40HC': {
    isoCode: '45G1',
    size: '40HC',
    type: 'Dry High Cube',
    isReefer: false,
    tareWeightKg: 3900,
    maxGrossWeightKg: 32500,
    payloadKg: 28600,
    cbm: 76.4,
    lengthMm: 12192,
    widthMm: 2438,
    heightMm: 2896,
    floorType: 'Gỗ dán Plywood (28mm)',
    material: 'Thép Corten Steel chống ăn mòn'
  },
  '45HC': {
    isoCode: 'L5G1',
    size: '45HC',
    type: 'Dry High Cube 45ft',
    isReefer: false,
    tareWeightKg: 4800,
    maxGrossWeightKg: 34000,
    payloadKg: 29200,
    cbm: 86.0,
    lengthMm: 13716,
    widthMm: 2438,
    heightMm: 2896,
    floorType: 'Gỗ dán Plywood (28mm)',
    material: 'Thép Corten Steel chống ăn mòn'
  },
  '20RF': {
    isoCode: '22R1',
    size: '20RF',
    type: 'Reefer Container (Lạnh)',
    isReefer: true,
    tareWeightKg: 2980,
    maxGrossWeightKg: 30480,
    payloadKg: 27500,
    cbm: 28.3,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    floorType: 'Sàn nhôm rãnh T (T-Floor)',
    material: 'Vách Inox 304 / Nhôm bọc xốp PU Foam'
  },
  '40HR': {
    isoCode: '45R1',
    size: '40HR',
    type: 'Reefer High Cube (Lạnh)',
    isReefer: true,
    tareWeightKg: 4480,
    maxGrossWeightKg: 34000,
    payloadKg: 29520,
    cbm: 67.0,
    lengthMm: 12192,
    widthMm: 2438,
    heightMm: 2896,
    floorType: 'Sàn nhôm rãnh T (T-Floor)',
    material: 'Vách Inox 304 / Nhôm bọc xốp PU Foam'
  },
  '20OT': {
    isoCode: '22U1',
    size: '20OT',
    type: 'Open Top Container (Mở nóc bạt)',
    isReefer: false,
    tareWeightKg: 2350,
    maxGrossWeightKg: 30480,
    payloadKg: 28130,
    cbm: 32.0,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    floorType: 'Gỗ dán Plywood chịu nước',
    material: 'Thép Corten Steel + Kèo bạt nóc'
  },
  '40OT': {
    isoCode: '45U1',
    size: '40OT',
    type: 'Open Top High Cube',
    isReefer: false,
    tareWeightKg: 4100,
    maxGrossWeightKg: 32500,
    payloadKg: 28400,
    cbm: 75.0,
    lengthMm: 12192,
    widthMm: 2438,
    heightMm: 2896,
    floorType: 'Gỗ dán Plywood chịu nước',
    material: 'Thép Corten Steel + Kèo bạt nóc'
  },
  '20FR': {
    isoCode: '22P1',
    size: '20FR',
    type: 'Flat Rack (Mặt bằng)',
    isReefer: false,
    tareWeightKg: 2750,
    maxGrossWeightKg: 35000,
    payloadKg: 32250,
    cbm: 0,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    floorType: 'Gỗ cứng dầu chịu tải nặng (Hardwood)',
    material: 'Dầm thép chịu lực siêu cường'
  },
  '40FR': {
    isoCode: '45P1',
    size: '40FR',
    type: 'Flat Rack High Cube',
    isReefer: false,
    tareWeightKg: 5300,
    maxGrossWeightKg: 45000,
    payloadKg: 39700,
    cbm: 0,
    lengthMm: 12192,
    widthMm: 2438,
    heightMm: 2896,
    floorType: 'Gỗ cứng dầu chịu tải nặng (Hardwood)',
    material: 'Dầm thép chịu lực siêu cường'
  },
  '20TK': {
    isoCode: '22T1',
    size: '20TK',
    type: 'ISO Tank Container (Bồn)',
    isReefer: false,
    tareWeightKg: 3400,
    maxGrossWeightKg: 36000,
    payloadKg: 32600,
    cbm: 26.0,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    floorType: 'Không (Bồn Inox treo khung)',
    material: 'Thép không gỉ Inox 316L cách nhiệt'
  }
};

// Ánh xạ mã loại cont hiển thị trên UI (CONTAINER_TYPE_PRESETS, VD "20DC"/"40HR") sang IsoSize mà
// backend chấp nhận cho Gate-In — DepotJobService.ValidateGateInRequest chỉ cho đúng 6 mã cố định
// (20GP/40GP/40HC/45HC/20RF/40RH), không khớp 1-1 với key ở đây (VD "20DC"→"20GP", "40HR"→"40RH" đảo
// thứ tự chữ). Loại nào không có trong map (OT/FR/TK) nghĩa là backend chưa hỗ trợ Gate-In qua API này.
export const BACKEND_ISO_SIZE_MAP: Record<string, string> = {
  '20DC': '20GP',
  '40DC': '40GP',
  '40HC': '40HC',
  '45HC': '45HC',
  '20RF': '20RF',
  '40HR': '40RH'
};

// Ánh xạ mã hãng tàu hiển thị trên UI (dễ đọc, dùng xuyên suốt dữ liệu mock của module Survey) sang
// đúng ShippingLine.Code đã seed thật trong Postgres (DbSeeder.cs dùng mã BIC 4 ký tự viết hoa).
// EVERGREEN/YANG-MING chưa có bản ghi ShippingLine tương ứng nên không map được — Gate-In tự động sẽ
// báo lỗi rõ ràng thay vì gửi thẳng mã sai lên backend.
// Nhận diện container lạnh (Reefer) theo mã kích cỡ khi CHƯA có sẵn cờ `isReefer` đáng tin cậy (VD khi
// người dùng mới gõ size dạng chuỗi ở ContainerSearchModal). Chỉ khớp đúng token Reefer (RF/RH/HR) —
// trước đây nhiều nơi dùng `.includes('R')` chung chung nên khớp nhầm cả Flat Rack (FR) thành Reefer.
export function isReeferSizeCode(sizeOrType?: string): boolean {
  if (!sizeOrType) return false;
  return /RF|RH|HR/i.test(sizeOrType);
}

export const BACKEND_SHIPPING_LINE_MAP: Record<string, string> = {
  MAERSK: 'MAEU',
  MSC: 'MSCU',
  ONE: 'ONEY',
  'CMA-CGM': 'CMAC',
  COSCO: 'COSU'
};
