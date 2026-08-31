import React, { useState } from 'react';
import { MaerskApiConfig } from '../types';
import { maerskIntegrationService } from '../services/maerskIntegrationService';
import { 
  Settings, 
  Key, 
  Server, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  Check, 
  AlertTriangle,
  Globe,
  Sliders
} from 'lucide-react';

interface MaerskApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: MaerskApiConfig) => void;
}

export const MaerskApiConfigModal: React.FC<MaerskApiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<MaerskApiConfig>(() => maerskIntegrationService.getConfig());
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = maerskIntegrationService.updateConfig(config);
    onConfigSaved(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono font-bold">
                  INTEGRATION SERVICE CONFIG
                </span>
                <span className="text-xs font-bold text-amber-400">MAERSK EMR API v2</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Cấu Hình Kết Nối API Hãng Tàu Maersk
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
          {/* Environment & Endpoint */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-400" />
              <span>1. Cổng Kết Nối &amp; Môi Trường (Gateway Endpoint)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Môi Trường (Environment):
                </label>
                <select
                  value={config.environment}
                  onChange={(e) =>
                    setConfig({ ...config, environment: e.target.value as 'SANDBOX' | 'PRODUCTION' })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="SANDBOX">SANDBOX (Môi trường Thử nghiệm)</option>
                  <option value="PRODUCTION">PRODUCTION (Môi trường Thực tế)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Endpoint URL (REST API / CEDEX):
                </label>
                <input
                  type="url"
                  value={config.endpointUrl}
                  onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
                  placeholder="https://api.maersk.com/emr/v2/estimates"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Authentication Credentials */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              <span>2. Thông Tin Xác Thực &amp; Mã Depot (Credentials)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Client ID:
                </label>
                <input
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Client Secret / API Key:
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Mã ICD / Depot Code:
                </label>
                <input
                  type="text"
                  value={config.depotCode}
                  onChange={(e) => setConfig({ ...config, depotCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Chuẩn CEDEX ISO:
                </label>
                <input
                  type="text"
                  value={config.cedexVersion}
                  onChange={(e) => setConfig({ ...config, cedexVersion: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Test Error Simulation Mode (Section 6.5 Requirement) */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>3. Kiểm Thử Xử Lý Lỗi API &amp; Gửi Lại (Section 6.5 Test Mode)</span>
              </h4>
              <span className="text-[10px] text-amber-300 font-mono">Simulate Error Scenarios</span>
            </div>

            <p className="text-xs text-slate-400">
              Chọn kịch bản lỗi giả lập để kiểm thử tính năng hiển thị lỗi chi tiết và nút "Gửi lại (Retry)" theo yêu cầu đề bài:
            </p>

            <select
              value={config.simulateErrorMode || 'NONE'}
              onChange={(e) => setConfig({ ...config, simulateErrorMode: e.target.value as any })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-600/50 rounded-xl text-xs font-bold text-white focus:outline-none"
            >
              <option value="NONE">✅ Chế độ Bình Thường (Phản hồi 200 OK Thành Công)</option>
              <option value="BAD_REQUEST_400">❌ HTTP 400: Lỗi sai định dạng CEDEX ISO line item</option>
              <option value="AUTH_ERROR_401">❌ HTTP 401: Lỗi Token / API Key không hợp lệ</option>
              <option value="VALIDATION_422">❌ HTTP 422: Container chưa đăng ký hạ bãi với Maersk</option>
              <option value="SERVER_503">❌ HTTP 503: Cổng Maersk Gateway đang bảo trì định kỳ</option>
            </select>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-2 flex items-center justify-between">
            {showSavedToast ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Đã lưu cấu hình Maersk Integration Service!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Thông số sẽ được lưu an toàn trong Storage của trình duyệt.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
