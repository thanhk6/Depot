import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Building2,
  TrendingUp,
  BarChart2,
  PieChart,
  Layers,
  ArrowRight,
  RotateCcw,
  Smartphone,
  Eye,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import {
  NotificationDashboardKPIs,
  NotificationRecord
} from '../models/notification.types';
import { notificationService } from '../services/notificationService';
import { StatusBadge, ChannelBadge, PriorityBadge } from '../components/NotificationStatus';
import { NotificationDetailDrawer } from '../components/NotificationDetailDrawer';

interface NotificationDashboardProps {
  onNavigateTab: (tab: any) => void;
  onSelectNotification?: (notif: NotificationRecord) => void;
}

export const NotificationDashboard: React.FC<NotificationDashboardProps> = ({
  onNavigateTab
}) => {
  const [kpis, setKpis] = useState<NotificationDashboardKPIs | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<NotificationRecord[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiRes, historyRes] = await Promise.all([
        notificationService.getDashboardMetrics(),
        notificationService.getNotificationHistory({ limit: 10 })
      ]);
      setKpis(kpiRes);
      setRecentNotifications(historyRes.items.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = (item: NotificationRecord) => {
    setSelectedNotif(item);
    setIsDrawerOpen(true);
  };

  const handleResend = async (id: string) => {
    await notificationService.resendNotification(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* 6 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Today */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Tổng Hôm Nay</span>
            <Bell className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {kpis?.totalToday ?? 128}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% so với hôm qua
          </span>
        </div>

        {/* Sent Success */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {kpis?.sentSuccess ?? 119}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            Tỷ lệ đạt: <strong className="text-emerald-600">{kpis?.successRate ?? 93}%</strong>
          </span>
        </div>

        {/* Pending Queue */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Đang Chờ Gửi</span>
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            {kpis?.pendingQueue ?? 5}
          </div>
          <button
            onClick={() => onNavigateTab('queue')}
            className="text-[10px] text-amber-600 font-bold mt-1 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            Xem hàng đợi <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Failed */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Gửi Thất Bại</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {kpis?.failedCount ?? 4}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Tự động retry 3 lần</span>
        </div>

        {/* Employees on Zalo */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Nhân Viên Zalo</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
            {kpis?.activeEmployeesZalo ?? 18}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">18/20 tài khoản kết nối</span>
        </div>

        {/* Customers on Zalo */}
        <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Khách Hàng Zalo</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
            {kpis?.activeCustomersZalo ?? 17}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">17 Hãng tàu & FWD</span>
        </div>
      </div>

      {/* Visual Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* A. 7-Day Trend Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" />
                <span>Số Lượng Thông Báo Gửi Theo Ngày (7 Ngày Gần Nhất)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Thống kê lưu lượng tin nhắn Zalo OA & ZNS</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-50 text-[10px] font-bold text-sky-700 font-mono border border-sky-200">
              7 DAYS
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-4 items-end min-h-[190px]">
            {(kpis?.dailyTrend || []).map((item, idx) => {
              const maxVal = 160;
              const heightPercent = Math.min(100, Math.round((item.sent / maxVal) * 100));
              const isToday = idx === (kpis?.dailyTrend.length || 0) - 1;

              return (
                <div key={item.date} className="flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-900 transition">
                    {item.sent}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-[120px] p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-sky-400 shadow-lg shadow-sky-500/30'
                          : 'bg-gradient-to-t from-blue-900 to-indigo-500 group-hover:from-blue-700 group-hover:to-sky-400'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-medium text-center truncate max-w-full ${isToday ? 'text-sky-600 font-bold' : 'text-slate-500'}`}>
                    {item.date?.split(' ')?.[0] || item.date || ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-400" />
              Tin gửi thành công
            </span>
            <span>Tổng tuần: <strong className="text-slate-900 font-mono">859 tin nhắn</strong></span>
          </div>
        </div>

        {/* B. Audience & Channel Distribution */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          {/* Target Audience Distribution */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>Phân Bổ Đối Tượng Người Nhận</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Hôm nay</span>
            </div>

            <div className="py-3 space-y-3">
              {/* Employee bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Nhân Viên Nội Bộ EMR
                  </span>
                  <span className="font-mono font-bold text-blue-600">62 tin (48%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              {/* Customer bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    Khách Hàng & Hãng Tàu
                  </span>
                  <span className="font-mono font-bold text-indigo-600">66 tin (52%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '52%' }} />
                </div>
              </div>
            </div>

            {/* Channels breakdown */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Zalo OA: <strong className="text-slate-900">74</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> ZNS: <strong className="text-slate-900">45</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> SMS: <strong className="text-slate-900">3</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> App: <strong className="text-slate-900">6</strong>
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Trải Nghiệm Thử Nghiệm Zalo</h4>
              <p className="text-[11px] text-slate-500">Mở giao diện điện thoại mô phỏng tương tác</p>
            </div>
            <button
              onClick={() => onNavigateTab('zalo_mode')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95 shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mở Mode Zalo</span>
            </button>
          </div>
        </div>
      </div>

      {/* C. Recent Notifications DataGrid Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Nhật Ký Thông Báo Gần Đây</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Thời gian thực các sự kiện được gửi từ hệ thống Depot</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('history')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem tất cả lịch sử</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DataGrid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">Loại Thông Báo</th>
                <th className="py-3 px-3">Người Nhận</th>
                <th className="py-3 px-3">Đối Tượng</th>
                <th className="py-3 px-3">Kênh</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentNotifications.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => handleOpenDetail(item)}
                >
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {item.createdAt?.split(' ')?.[1] || item.createdAt || ''}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 truncate max-w-[220px]">
                      {item.title}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Ref: {item.entityReference || item.templateCode}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{item.recipientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.recipientPhone}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.recipientType === 'EMPLOYEE' ? 'Nhân Viên' : 'Khách Hàng'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <ChannelBadge channel={item.channel} />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {item.status === 'FAILED' && (
                        <button
                          onClick={() => handleResend(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition cursor-pointer"
                          title="Gửi lại"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Detail */}
      <NotificationDetailDrawer
        notification={selectedNotif}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onResend={handleResend}
      />
    </div>
  );
};
