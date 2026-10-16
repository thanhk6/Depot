import type { ShippingSyncLogItem } from '../../../api';

export const logStatusLabel = (log: ShippingSyncLogItem): string => {
  if (log.status === 'SENT') return `Đã gửi — HTTP ${log.httpStatusCode ?? ''}`.trim();
  if (log.status === 'SIMULATED') return 'Giả lập cũ — chưa từng gửi thật';
  return log.httpStatusCode ? `Lỗi — HTTP ${log.httpStatusCode}` : 'Lỗi — không kết nối được';
};

export const formatLogTime = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('vi-VN');
};

/** Định dạng lại JSON nếu parse được, không thì trả nguyên văn (phản hồi hãng tàu có thể là text/XML). */
export const prettyJson = (raw?: string | null): string => {
  if (!raw) return '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};
