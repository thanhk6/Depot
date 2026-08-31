import dayjs from 'dayjs';

export function formatDate(dateStr?: string | Date | null, format = 'DD/MM/YYYY HH:mm'): string {
  if (!dateStr) return '—';
  return dayjs(dateStr).format(format);
}

export function formatRelativeTime(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  const diffMinutes = dayjs().diff(dayjs(dateStr), 'minute');
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = dayjs().diff(dayjs(dateStr), 'hour');
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = dayjs().diff(dayjs(dateStr), 'day');
  return `${diffDays} ngày trước`;
}

export function calculateDaysBetween(startStr?: string, endStr?: string): number {
  if (!startStr) return 0;
  const start = dayjs(startStr);
  const end = endStr ? dayjs(endStr) : dayjs();
  const diff = end.diff(start, 'day');
  return Math.max(1, diff);
}
