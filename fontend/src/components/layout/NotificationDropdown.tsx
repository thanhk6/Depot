import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Thanh toán VietQR Thành Công',
      message: 'Container MSCU1234567 vừa gạch nợ 500,000đ nâng hạ.',
      time: '2 phút trước',
      type: 'success',
      read: false
    },
    {
      id: '2',
      title: 'Báo Giá Đã Được Hãng Tàu Duyệt',
      message: 'Maersk Line đã phê duyệt Estimate #EST-9921 cho cont MAEU98213.',
      time: '15 phút trước',
      type: 'info',
      read: false
    },
    {
      id: '3',
      title: 'Cảnh Báo Bãi Đầy (Block A)',
      message: 'Block A đạt 92% công suất lưu bãi. Yêu cầu đảo bãi.',
      time: '1 giờ trước',
      type: 'warning',
      read: true
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-2xl border border-slate-200 transition cursor-pointer relative shadow-sm"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Thông Báo Vận Hành</span>
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllRead();
                }}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto scrollbar-thin my-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl my-1 transition ${
                  n.read ? 'bg-transparent opacity-70' : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                  {n.type === 'info' && <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{n.message}</p>
                    <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
