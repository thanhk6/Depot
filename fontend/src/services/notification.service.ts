export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const notificationService = {
  getNotifications: (): SystemNotification[] => [
    {
      id: 'NOTIF-1',
      title: 'Xác nhận Gate-In',
      message: 'Container TCNU8829101 đã hạ bãi thành công tại Block A - Bay 12',
      timestamp: '5 phút trước',
      isRead: false,
      type: 'success',
    },
    {
      id: 'NOTIF-2',
      title: 'Phê duyệt Báo Giá',
      message: 'Hãng tàu MAERSK đã duyệt Báo giá EST-2026-004 giá trị 1.850.000 VNĐ',
      timestamp: '25 phút trước',
      isRead: false,
      type: 'info',
    },
    {
      id: 'NOTIF-3',
      title: 'Nghiệm thu QC',
      message: 'Container TEMU1928374 đã đạt nghiệm thu QC, sẵn sàng xuất cổng',
      timestamp: '1 giờ trước',
      isRead: true,
      type: 'success',
    },
  ],
};
