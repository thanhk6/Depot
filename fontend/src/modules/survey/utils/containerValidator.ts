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

// Nhận diện container lạnh (Reefer) theo mã kích cỡ khi CHƯA có sẵn cờ `isReefer` đáng tin cậy (VD khi
// người dùng mới gõ size dạng chuỗi ở ContainerSearchModal). Chỉ khớp đúng token Reefer (RF/RH/HR) —
// trước đây nhiều nơi dùng `.includes('R')` chung chung nên khớp nhầm cả Flat Rack (FR) thành Reefer.
export function isReeferSizeCode(sizeOrType?: string): boolean {
  if (!sizeOrType) return false;
  return /RF|RH|HR/i.test(sizeOrType);
}
