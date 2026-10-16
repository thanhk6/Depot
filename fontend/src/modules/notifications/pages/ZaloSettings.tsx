import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Radio,
  Sliders,
  Sparkles,
  ExternalLink,
  Copy,
  Key,
  Globe
} from 'lucide-react';
import { ZaloSettingsConfig } from '../models/notification.types';
import { notificationService } from '../services/notificationService';

export const ZaloSettings: React.FC = () => {
  const [settings, setSettings] = useState<ZaloSettingsConfig | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await notificationService.getZaloSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await notificationService.testZaloConnection();
      setTestResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await notificationService.updateZaloSettings(settings);
      setToastMessage('✅ Cập nhật cấu hình Zalo Gateway thành công!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    if (!settings) return;
    navigator.clipboard.writeText(settings.webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="p-5 rounded-3xl bg-[#0b132b] border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-600" />
            <span>CẤU HÌNH ZALO OFFICIAL ACCOUNT (OA) & ZNS GATEWAY</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tích hợp API Zalo Business, Webhook lắng nghe phản hồi và phân bổ Quota tin nhắn
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg  transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Đang Kiểm Tra...' : 'Kiểm Tra Kết Nối OA'}</span>
          </button>
        </div>
      </div>

      {/* Test Connection Results Alert */}
      {testResult && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-black text-emerald-200">
                {testResult.message}
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-700">
              Độ trễ: {testResult.latencyMs}ms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
              <span className="text-[10px] text-emerald-600 font-bold block">TÊN OA DOANH NGHIỆP:</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{testResult.oaName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
              <span className="text-[10px] text-emerald-600 font-bold block">OA ID:</span>
              <span className="font-mono text-slate-900 mt-0.5 block">{testResult.oaId}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
              <span className="text-[10px] text-emerald-600 font-bold block">SỐ NGƯỜI QUAN TÂM:</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">{testResult.followersCount} Followers</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60">
              <span className="text-[10px] text-emerald-600 font-bold block">QUOTA CÒN LẠI HÔM NAY:</span>
              <span className="font-bold text-emerald-700 mt-0.5 block">{testResult.quotaRemaining} tin</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: API & Webhook Credentials (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0b132b] border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-600" />
            <span>1. THÔNG TIN XÁC THỰC ZALO BUSINESS API</span>
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tên Hiển Thị Official Account (OA Name)
              </label>
              <input
                type="text"
                value={settings.oaName}
                onChange={(e) => setSettings({ ...settings, oaName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Zalo OA ID <span className="text-cyan-600">*</span>
                </label>
                <input
                  type="text"
                  value={settings.oaId}
                  onChange={(e) => setSettings({ ...settings, oaId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Zalo App ID <span className="text-cyan-600">*</span>
                </label>
                <input
                  type="text"
                  value={settings.appId}
                  onChange={(e) => setSettings({ ...settings, appId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Secret Key (Bảo Mật API Secret)
              </label>
              <input
                type="password"
                value={settings.secretKey}
                onChange={(e) => setSettings({ ...settings, secretKey: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Webhook URL Nhận Tương Tác / Callbacks</span>
                {copiedWebhook && <span className="text-[10px] text-emerald-600">Đã copy URL!</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-sky-700 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="absolute right-2 top-2 p-1 text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  title="Copy Webhook URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quota & Trigger Automation Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quota Usage Box */}
          <div className="bg-[#0b132b] border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>2. HẠN MỨC & QUOTA TIN NHẮN</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Gói dịch vụ Zalo:</span>
                <span className="font-bold text-slate-900">Zalo OA Doanh Nghiệp (Pro)</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Hạn mức gửi mỗi ngày:</span>
                <span className="font-mono font-bold text-sky-600">{(settings.dailyQuota ?? 0).toLocaleString()} tin/ngày</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Đã sử dụng trong tháng:</span>
                <span className="font-mono font-bold text-amber-700">
                  {(settings.monthlyUsage ?? 0).toLocaleString()} tin
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Thời gian hết hạn Token:</span>
                <span className="font-mono text-emerald-600 font-bold">{settings.tokenExpiresAt}</span>
              </div>
            </div>
          </div>

          {/* Trigger Automation */}
          <div className="bg-[#0b132b] border border-slate-200 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>3. KÍCH HOẠT TỰ ĐỘNG THEO SỰ KIỆN</span>
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Tự động gửi khi Gate-In</span>
                <input
                  type="checkbox"
                  checked={settings.autoSendGateIn}
                  onChange={(e) => setSettings({ ...settings, autoSendGateIn: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Tự động gửi khi duyệt Estimate</span>
                <input
                  type="checkbox"
                  checked={settings.autoSendEstimateApproved}
                  onChange={(e) => setSettings({ ...settings, autoSendEstimateApproved: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Tự động gửi khi QC nghiệm thu đạt</span>
                <input
                  type="checkbox"
                  checked={settings.autoSendQCPassed}
                  onChange={(e) => setSettings({ ...settings, autoSendQCPassed: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <span className="text-xs font-semibold text-slate-700">Tự động gửi xác nhận thanh toán VietQR</span>
                <input
                  type="checkbox"
                  checked={settings.autoSendPaymentReceived}
                  onChange={(e) => setSettings({ ...settings, autoSendPaymentReceived: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-50 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg  transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình Gateway'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
