import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle2,
  Save,
  ArrowLeft,
  Sliders,
  History,
  ShieldCheck,
  Smartphone,
  Eye,
  Send
} from 'lucide-react';
import {
  NotificationCustomer,
  NotificationRecord,
  CustomerNotificationPreference,
  NotificationChannel
} from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { ZaloStatusBadge, StatusBadge, ChannelBadge } from '../components/NotificationStatus';
import { NotificationDetailDrawer } from '../components/NotificationDetailDrawer';

interface CustomerNotificationDetailProps {
  customerId: string;
  onBack: () => void;
  onQuickSend?: (customerId: string) => void;
}

export const CustomerNotificationDetail: React.FC<CustomerNotificationDetailProps> = ({
  customerId,
  onBack,
  onQuickSend
}) => {
  const [customer, setCustomer] = useState<NotificationCustomer | null>(null);
  const [preferences, setPreferences] = useState<CustomerNotificationPreference | null>(null);
  const [historyItems, setHistoryItems] = useState<NotificationRecord[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cust = await notificationService.getCustomerById(customerId);
        if (cust) {
          setCustomer(cust);
          setPreferences({ ...cust.preferences });
        }
        const hist = await notificationService.getNotificationHistory({ search: cust?.code || customerId });
        setHistoryItems(hist.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

  const handleTogglePref = (key: keyof CustomerNotificationPreference) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleSavePreferences = async () => {
    if (!customer || !preferences) return;
    setSaving(true);
    try {
      await notificationService.updateCustomerPreferences(customer.id, preferences);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !customer || !preferences) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Đang tải thông tin khách hàng...
      </div>
    );
  }

  const preferenceFields: { key: keyof CustomerNotificationPreference; label: string; desc: string }[] = [
    { key: 'gateIn', label: 'Gate-In', desc: 'Nhận thông báo khi xe hạ container vào bãi thành công' },
    { key: 'inspection', label: 'Inspection (Giám định)', desc: 'Nhận phiếu giám định IICL-6 và ảnh e-EIR hư hỏng' },
    { key: 'estimate', label: 'Estimate (Báo giá MNR)', desc: 'Nhận bảng báo giá sửa chữa và nút duyệt trực tuyến qua Zalo' },
    { key: 'repair', label: 'Repair (Tiến độ sửa chữa)', desc: 'Cập nhật tiến độ sửa chữa, thay sàn gỗ, hàn vách nóc' },
    { key: 'qc', label: 'QC (Nghiệm thu AV Grade)', desc: 'Chứng thư kiểm định vỏ đạt chuẩn sẵn sàng cấp phát' },
    { key: 'gateOut', label: 'Gate-Out (Cấp vỏ / Xuất)', desc: 'Thông báo cấp vỏ, lệnh Booking DO và bốc container ra cổng' },
    { key: 'invoice', label: 'Invoice (Hóa đơn dịch vụ)', desc: 'Phát hành hóa đơn điện tử VAT cước nâng hạ & lưu bãi' },
    { key: 'payment', label: 'Payment (Xác nhận thanh toán)', desc: 'Biên lai gạch nợ thành công qua Napas247 / VietQR' },
    { key: 'debtReminder', label: 'Công nợ (Sao kê & Nhắc nợ)', desc: 'Bảng kê sao kê đối soát SOA và cảnh báo công nợ quá hạn' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách khách hàng</span>
        </button>

        {onQuickSend && (
          <button
            onClick={() => onQuickSend(customer.id)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-950 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Gửi Tin Nhắn Zalo Cho Khách Hàng Này</span>
          </button>
        )}
      </div>

      {/* 1. THÔNG TIN KHÁCH HÀNG CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-sky-400 text-base">
              {customer.code.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{customer.name}</h2>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 text-sky-300 border border-slate-800">
                  {customer.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {customer.customerType === 'SHIPPING_LINE'
                  ? 'Hãng Tàu Khai Thác (Shipping Line)'
                  : customer.customerType === 'TRUCKING'
                  ? 'Công Ty Vận Tải (Trucking)'
                  : 'Đơn Vị Giao Nhận (Forwarder)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ZaloStatusBadge status={customer.zaloStatus} />
            <span className="px-3 py-1 rounded-full bg-slate-950 text-xs font-mono font-bold text-slate-300 border border-slate-800">
              Đã nhận {customer.notificationCount} thông báo
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Người Liên Hệ:</span>
            <p className="text-white font-bold mt-0.5">{customer.contactPerson}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Số Điện Thoại:</span>
            <p className="text-sky-400 font-mono font-bold mt-0.5">{customer.phone}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Email Liên Hệ:</span>
            <p className="text-slate-300 truncate mt-0.5">{customer.email}</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Tài Khoản Zalo:</span>
            <p className="text-blue-400 font-bold mt-0.5">{customer.zaloName}</p>
          </div>
        </div>
      </div>

      {/* 2. CẤU HÌNH NHẬN THÔNG BÁO (PREFERENCE MATRIX) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>CẤU HÌNH NHẬN THÔNG BÁO NGHIỆP VỤ</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bật/Tắt các loại thông báo tự động gửi đến Zalo & ZNS của khách hàng này
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu cấu hình thành công!
              </span>
            )}
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
            </button>
          </div>
        </div>

        {/* Checkbox Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {preferenceFields.map((field) => {
            const isChecked = !!preferences[field.key];
            return (
              <div
                key={field.key}
                onClick={() => handleTogglePref(field.key)}
                className={`p-4 rounded-2xl border transition cursor-pointer select-none flex items-start gap-3 ${
                  isChecked
                    ? 'bg-blue-950/40 border-blue-600/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTogglePref(field.key)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer mt-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                    ☑ {field.label}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-1">
                    {field.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LỊCH SỬ THÔNG BÁO RIÊNG CỦA KHÁCH HÀNG */}
      <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" />
              <span>LỊCH SỬ THÔNG BÁO ĐÃ GỬI CHO {customer.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Nhật ký toàn bộ tin nhắn đã phát tới đối tác</p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400">
            {historyItems.length} bản ghi
          </span>
        </div>

        {/* DataGrid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">Mã Thông Báo</th>
                <th className="py-3 px-3">Tiêu Đề / Nghiệp Vụ</th>
                <th className="py-3 px-3">Kênh</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {historyItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Chưa có thông báo nào được gửi cho khách hàng này.
                  </td>
                </tr>
              ) : (
                historyItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedNotif(item);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {item.createdAt}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                      {item.trackingCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white truncate max-w-[260px]">
                        {item.title}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ref: {item.entityReference || item.templateCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <ChannelBadge channel={item.channel} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotif(item);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <NotificationDetailDrawer
        notification={selectedNotif}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
