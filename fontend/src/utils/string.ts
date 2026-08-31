export const sanitizeContainerNo = (containerNo: string): string => {
  return containerNo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const truncateText = (text: string, maxLength = 30): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
