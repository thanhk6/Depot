/**
  Validates ISO 6346 Container Number format (4 letters + 7 numbers, e.g., MSCU1234567)
 */
export function isValidContainerNo(containerNo: string): boolean {
  if (!containerNo) return false;
  const regex = /^[A-Z]{4}\d{7}$/i;
  return regex.test(containerNo.trim());
}

/**
  Validates Vietnam license plate format (e.g., 51C-12345 or 29H-987.65)
 */
export function isValidLicensePlate(plate: string): boolean {
  if (!plate) return false;
  const clean = plate.replace(/[\s.-]/g, '');
  return clean.length >= 7 && clean.length <= 11;
}
