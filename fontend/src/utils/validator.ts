export const validateContainerNoISO = (containerNo: string): boolean => {
  const clean = containerNo.trim().toUpperCase();
  if (clean.length !== 11) return false;
  const ownerCode = clean.substring(0, 4);
  if (!/^[A-Z]{4}$/.test(ownerCode)) return false;
  const serialNo = clean.substring(4, 10);
  if (!/^\d{6}$/.test(serialNo)) return false;
  return true;
};
