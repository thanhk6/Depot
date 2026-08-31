export const formatVND = (amount?: number): string => {
  if (amount === undefined || amount === null) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatNumber = (num?: number): string => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const calculateVAT = (amount: number, vatRate = 0.08): number => {
  return Math.round(amount * vatRate);
};
