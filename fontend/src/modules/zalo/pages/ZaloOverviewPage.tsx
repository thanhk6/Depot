import React, { useState, useEffect } from 'react';
import {
  Radio,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  ExternalLink,
  MessageCircle,
  FileCode,
  Settings,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';
import { notificationService } from '../../notifications/services/notificationService';
import { NotificationDashboardKPIs, ZaloSettingsConfig, NotificationRecord } from '../../notifications/models/notification.types';
// Trang này giờ được render bên trong NotificationModule (đã gộp "ZALO GATEWAY & CHAT" vào cùng 1 hub
// "THÔNG BÁO & ZALO GATEWAY" — xem ghi chú gộp module ở NotificationModule.tsx), nên dùng chung type
// sub-tab của module đó thay vì `ZaloSubTab` cũ (đã xoá cùng `ZaloHeader.tsx`/`ZaloModule.tsx`).
import { NotificationSubTab } from '../../notifications/components/NotificationHeader';

interface ZaloOverviewPageProps {
  onNavigateSubTab: (tab: NotificationSubTab) => void;
}

export const ZaloOverviewPage: React.FC<ZaloOverviewPageProps> = ({
  onNavigateSubTab
}) => {
  const [kpis, setKpis] = useState<NotificationDashboardKPIs | null>(null);
  const [settings, setSettings] = useState<ZaloSettingsConfig | null>(null);
  const [recentLogs, setRecentLogs] = useState<NotificationRecord[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [kpiData, setts, logs] = await Promise.all([
        notificationService.getDashboardMetrics(),
        notificationService.getZaloSettings(),
        notificationService.getNotificationHistory({ channel: 'ZALO_OA' })
      ]);
      setKpis(kpiData);
      setSettings(setts);
      setRecentLogs(logs.items.slice(0, 6));
    };
    fetchData();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await notificationService.testZaloConnection();
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Tin Zalo Hôm Nay</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 mt-2">
            {kpis ? kpis.totalToday - 18 : 110} <span className="text-xs text-slate-500 font-normal">tin</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tỉ lệ gửi đạt 99.1%</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Zalo OA Followers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 mt-2">
            1,480 <span className="text-xs text-slate-500 font-normal">người</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Gồm 25 nhân viên + 1,455 khách hàng/tài xế
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>ZNS Hạn Mức Còn Lại</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-600 mt-2">
            {settings ? (settings.dailyQuota - settings.usedQuotaToday).toLocaleString() : '8,850'}{' '}
            <span className="text-xs text-slate-500 font-normal">/ 10,000</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{
                width: `${settings ? (settings.usedQuotaToday / settings.dailyQuota) * 100 : 11.5}%`
              }}
            />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Trạng Thái Webhook</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-600 font-mono text-xl">200 OK</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 truncate font-mono">
            Uptime: 99.98% • Latency: ~140ms
          </div>
        </div>
      </div>

      {/* Main Grid: Connection Health & Quick Actions | Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Zalo OA Gateway Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Trạng Thái Kết Nối Zalo OA</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                CONNECTED
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Tên Official Account:</span>
                <strong className="text-slate-900 font-bold">{settings?.oaName || 'DEPOT EMR - TỔNG ĐÀI CSKH & BÃI VỎ'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Official Account ID:</span>
                <strong className="text-sky-600 font-mono">{settings?.oaId || '182736455241'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Zalo App ID:</span>
                <strong className="text-slate-700 font-mono">{settings?.appId || '391029384756182'}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Access Token:</span>
                <span className="text-emerald-600 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Còn hiệu lực (Hết hạn: {settings?.tokenExpiresAt || '17/09/2026'})</span>
                </span>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Đang Kiểm Tra...' : 'Test Kết Nối Gateway'}</span>
              </button>
              <button
                onClick={() => onNavigateSubTab('zalo_settings')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Cài Đặt</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Thao Tác Nhanh Zalo
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateSubTab('zalo_simulator')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition cursor-pointer group"
              >
                <Smartphone className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Mở Zalo Simulator</div>
                <div className="text-[10px] text-slate-500">Chat & test tương tác</div>
              </button>

              <button
                onClick={() => onNavigateSubTab('zalo_templates')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-300 rounded-2xl text-left transition cursor-pointer group"
              >
                <FileCode className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Mẫu Tin ZNS / OA</div>
                <div className="text-[10px] text-slate-500">12 kịch bản tự động</div>
              </button>

              <button
                onClick={() => onNavigateSubTab('send')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition cursor-pointer group"
              >
                <Send className="w-5 h-5 text-sky-600 mb-1.5 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Phát Tin Nhắn Mới</div>
                <div className="text-[10px] text-slate-500">Gửi đơn hoặc hàng loạt</div>
              </button>

              <button
                onClick={() => onNavigateSubTab('zalo_logs')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition cursor-pointer group"
              >
                <Clock className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition" />
                <div className="font-bold text-slate-900 text-xs">Xem Log Giao Dịch</div>
                <div className="text-[10px] text-slate-500">Payload & phản hồi API</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Zalo Activity Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Tin Nhắn Zalo Gần Nhất (Live Stream)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tự động phát qua Zalo OA khi có sự kiện Gate-In, Báo giá, QC hoặc Phê duyệt
                </p>
              </div>
              <button
                onClick={() => onNavigateSubTab('zalo_logs')}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition"
              >
                <span>Xem Tất Cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-start justify-between gap-3 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
                        <span>Đến: <strong className="text-slate-300">{item.recipientName}</strong> ({item.recipientPhone})</span>
                        <span>•</span>
                        <span>{item.createdAt?.split(' ')?.[1] || item.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 font-bold rounded-full border px-2 py-0.5 text-[10px] bg-emerald-950/70 border-emerald-500/40 text-emerald-400">
                      <CheckCircle2 className="w-2.5 h-2.5" /> SENT
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-1">
                      {item.trackingCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
