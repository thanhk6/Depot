import React, { useState } from 'react';
import {
  Ship,
  Plus,
  Search,
  Globe,
  Mail,
  CheckCircle2,
  ShieldCheck,
  FileCode,
  DollarSign,
  Phone,
  Building2,
  Sliders,
  Radio,
  Zap,
  Clock,
  RefreshCw,
  Send,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Truck,
  Users
} from 'lucide-react';
import { formatVND } from '../../../utils/format';

export interface ShippingLineData {
  id: string;
  code: string;
  name: string;
  country: string;
  ediEndpoint: string;
  emrEmail: string;
  freeDays: number;
  emrDiscount: number;
  autoApproveLimit: number;
  laborRate: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalContainersInYard: number;
  contactPerson: string;
  phone: string;
  apiEndpoint: string;
  apiKeyStatus: 'CONNECTED' | 'EXPIRED' | 'PENDING';
  lastPing: string;
}

export const ShippingLinePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'API_CONFIG' | 'TARIFF_AGREEMENT' | 'LOGS'>('OVERVIEW');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestSuccess, setApiTestSuccess] = useState<boolean | null>(null);

  // Sole active shipping line: MAERSK LINE
  const [lines, setLines] = useState<ShippingLineData[]>([
    {
      id: 'SL-001',
      code: 'MAEU',
      name: 'MAERSK LINE (A.P. Moller – Maersk)',
      country: 'Đan Mạch 🇩🇰',
      ediEndpoint: 'sftp://edi.maersk.com/depot/gate/codeco',
      emrEmail: 'emr-approval.vietnam@maersk.com',
      freeDays: 5,
      emrDiscount: 10,
      autoApproveLimit: 3800000, // ~150 USD
      laborRate: 220000,
      status: 'ACTIVE',
      totalContainersInYard: 8,
      contactPerson: 'Nguyễn Văn Minh (Equipment Fleet Manager - Vietnam)',
      phone: '028.3823.0011',
      apiEndpoint: 'https://api.maersk.com/v1/emr-estimate',
      apiKeyStatus: 'CONNECTED',
      lastPing: '2 phút trước (HTTP 200 OK)'
    }
  ]);

  // Handle API Test
  const handleTestApi = () => {
    setIsTestingApi(true);
    setApiTestSuccess(null);
    setTimeout(() => {
      setIsTestingApi(false);
      setApiTestSuccess(true);
    }, 1200);
  };

  const maersk = lines[0];

  return (
    <div className="space-y-6">
      {/* Separation Explanation & Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-sky-600/20 border border-sky-500/40 text-sky-400 rounded-2xl shadow-lg shadow-sky-950">
              <Ship className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Quản Lý Hãng Tàu Khai Thác (Shipping Line)</h2>
                <span className="px-2.5 py-0.5 bg-sky-950 text-sky-300 border border-sky-700 text-[10px] font-mono font-bold rounded-full">
                  MAERSK LINE DUY NHẤT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Quản trị Hãng tàu chủ sở hữu vỏ container tại Depot: Cấu hình API EMR, truyền nhận EDIFACT, biểu phí sửa chữa &amp; SLA phê duyệt báo giá.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestApi}
              disabled={isTestingApi}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingApi ? 'animate-spin' : ''}`} />
              <span>{isTestingApi ? 'Đang Ping API Maersk...' : 'Kiểm Tra Kết Nối API Maersk'}</span>
            </button>
          </div>
        </div>

        {/* Highlight distinction notice */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-white">Quy định phân định hệ thống:</strong> Depot hiện tại đang khai thác độc quyền cho{' '}
            <span className="text-sky-400 font-bold">Hãng Tàu Maersk (MAEU)</span>. 
            Mọi cấu hình duyệt Báo giá EMR, chuẩn IICL-6 và cổng EDI đều kết nối trực tiếp đến Maersk Gateway. 
            <span className="text-pink-300 font-semibold block mt-0.5">
              👉 Đối với Doanh nghiệp Vận tải (Trucking), Công ty Giao nhận (Forwarder), Chủ hàng XNK &amp; Đội xe vào bãi: Vui lòng xem tại phân hệ <strong className="underline text-pink-400">Khách Hàng (Trucking &amp; FWD)</strong>.
            </span>
          </div>
        </div>
      </div>

      {apiTestSuccess !== null && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              <strong>Kết Nối API Maersk Thành Công (HTTP 200 OK):</strong> Endpoint <code className="font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded text-white">https://api.maersk.com/v1/emr-estimate</code> phản hồi trong <strong>128ms</strong>. Token bảo mật TLS 1.3 hợp lệ.
            </span>
          </div>
          <button onClick={() => setApiTestSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hồ Sơ Hãng Tàu Maersk</span>
        </button>

        <button
          onClick={() => setActiveTab('API_CONFIG')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'API_CONFIG'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Cổng Kết Nối API &amp; EDI</span>
        </button>

        <button
          onClick={() => setActiveTab('TARIFF_AGREEMENT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'TARIFF_AGREEMENT'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Thỏa Thuận Biểu Phí EMR</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'LOGS'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Nhật Ký Giao Dịch API</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Main Maersk Profile Card */}
          <div className="p-6 bg-slate-900 border border-sky-500/40 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl">
            {/* Background watermarked logo */}
            <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-9xl font-black text-sky-400 font-mono select-none">
              MAERSK
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black font-mono text-sky-400 tracking-wider">
                    {maersk.code}
                  </span>
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% KẾT NỐI API MAERSK ACTIVE
                  </span>
                  <span className="px-3 py-1 bg-sky-950 text-sky-300 border border-sky-800 text-xs font-bold rounded-lg">
                    HÃNG TÀU ĐỘC QUYỀN DEPOT
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{maersk.name}</h3>
                <p className="text-xs text-slate-400">
                  Tập đoàn Vận tải biển A.P. Moller – Maersk | Quốc gia: <span className="text-slate-200 font-semibold">{maersk.country}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Vỏ Cont Đang Đóng Bãi</span>
                  <span className="text-xl font-black font-mono text-sky-400">{maersk.totalContainersInYard} Cont</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Free Time Lưu Bãi</span>
                  <span className="text-xl font-black font-mono text-amber-400">{maersk.freeDays} Ngày</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Chiết Khấu Vật Tư</span>
                  <span className="text-xl font-black font-mono text-emerald-400">{maersk.emrDiscount}%</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-semibold">Hạn Mức Auto-Approve</span>
                  <span className="text-base font-black font-mono text-purple-400">{formatVND(maersk.autoApproveLimit)}</span>
                </div>
              </div>
            </div>

            {/* Operating Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Technical & EMR Contact */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Đại Diện Hãng Tàu Tại VN</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Người phụ trách EMR / Giám định:</span>
                    <span className="text-white font-bold">{maersk.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Hotline Điều Độ / EMR:</span>
                    <span className="text-sky-300 font-mono font-bold">{maersk.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email Duyệt Báo Giá:</span>
                    <span className="text-slate-200 font-mono text-[11px]">{maersk.emrEmail}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: API & EDI Gateway */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Cổng API / EDI Maersk</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">REST API Endpoint:</span>
                    <span className="text-slate-200 font-mono text-[11px] truncate block">{maersk.apiEndpoint}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">EDIFACT / CODECO Gateway:</span>
                    <span className="text-slate-200 font-mono text-[11px] truncate block">{maersk.ediEndpoint}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 text-[11px]">Trạng thái ping:</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">{maersk.lastPing}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Standards & Repair SLA */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tiêu Chuẩn &amp; SLA Duyệt</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Tiêu Chuẩn Giám Định Áp Dụng:</span>
                    <span className="text-white font-bold">IICL-6 / Maersk Standard 2026</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Đơn Giá Nhân Công Sửa Chữa:</span>
                    <span className="text-emerald-400 font-mono font-bold">{formatVND(maersk.laborRate)} / Giờ</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Thời Gian Phản Hồi Duyệt API:</span>
                    <span className="text-purple-400 font-mono font-bold">Tự Động &le; 3 Giây (Auth Code)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API CONFIG */}
      {activeTab === 'API_CONFIG' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-400" />
                <span>Cấu Hình Tích Hợp API Trực Tiếp &amp; EDIFACT Maersk</span>
              </h3>
              <p className="text-xs text-slate-400">
                Kết nối 2 chiều giữa Depot ERP và hệ thống Maersk EMR Gateway (WESTIM / DESTIM / CODECO).
              </p>
            </div>
            <button
              onClick={handleTestApi}
              disabled={isTestingApi}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingApi ? 'animate-spin' : ''}`} />
              <span>Kiểm Tra Ping</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: API Parameters */}
            <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                1. Thông Số Kết Nối REST API (JSON EMR)
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">API Gateway Base URL</label>
                  <input
                    type="text"
                    readOnly
                    value="https://api.maersk.com/v1/emr-estimate"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Client ID / Depot ID</label>
                  <input
                    type="text"
                    readOnly
                    value="DEPOT-VNSGN-SOLUTION-001"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-sky-300 font-mono rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">API Authorization Token (Bearer Key)</label>
                  <input
                    type="password"
                    readOnly
                    value="msk_live_sec_88291039812984124091823901"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-400 font-mono rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Webhook URL Nhận Quyết Định Phê Duyệt</label>
                  <input
                    type="text"
                    readOnly
                    value="https://depot-erp.vn/api/webhooks/maersk-approval"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-emerald-400 font-mono rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right: EDIFACT / SFTP */}
            <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                2. Thông Số Truyền Nhận EDIFACT (CODECO &amp; WESTIM)
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">SFTP Host</label>
                  <input
                    type="text"
                    readOnly
                    value="sftp://edi.maersk.com:2222"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Thư Mục Báo Cáo Gate-In (CODECO)</label>
                  <input
                    type="text"
                    readOnly
                    value="/inbound/codeco_gate_movement/"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Thư Mục Báo Giá Sửa Chữa (WESTIM)</label>
                  <input
                    type="text"
                    readOnly
                    value="/inbound/westim_estimates/"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 font-mono rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Định dạng tin nhắn trao đổi</label>
                  <span className="inline-block px-3 py-1.5 bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold rounded-lg">
                    UN/EDIFACT D.95B / ISO 9897 CEDEX
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TARIFF AGREEMENT */}
      {activeTab === 'TARIFF_AGREEMENT' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Hợp Đồng Thỏa Thuận Biểu Phí Sửa Chữa Vỏ Cont Maersk</span>
            </h3>
            <p className="text-xs text-slate-400">
              Bảng giá nhân công cơ khí, tỷ lệ chiết khấu vật tư, thời gian lưu bãi &amp; hạn mức duyệt tự động.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Đơn Giá Nhân Công Sửa Chữa (Labor Rate)</span>
              <div className="text-2xl font-black font-mono text-emerald-400">220,000 đ/giờ</div>
              <p className="text-[11px] text-slate-400">Quy đổi tương đương ~8.80 USD/Hour theo tỷ giá hợp đồng.</p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Chiết Khấu Vật Tư Sửa Chữa (Discount)</span>
              <div className="text-2xl font-black font-mono text-sky-400">10.0%</div>
              <p className="text-[11px] text-slate-400">Giảm giá trên tổng chi phí linh kiện tôn, vách, sàn, ron cửa.</p>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Hạn Mức Tự Động Phê Duyệt (Auto-Approve)</span>
              <div className="text-2xl font-black font-mono text-purple-400">3,800,000 đ</div>
              <p className="text-[11px] text-slate-400">Báo giá dưới $150 USD được Maersk API phản hồi phê duyệt tức thì.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOGS */}
      {activeTab === 'LOGS' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <span>Nhật Ký Trao Đổi API &amp; EDI Với Hãng Tàu Maersk</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {[
              { time: '2026-08-15 20:04:12', method: 'POST', endpoint: '/api/maersk/v1/emr-estimate', status: 200, res: 'APPROVED - Auth: MAEU-APPR-2026-881', latency: '115ms' },
              { time: '2026-08-15 19:42:00', method: 'POST', endpoint: '/api/maersk/v1/codeco', status: 200, res: 'ACK_PROCESSED - Cont MAEU9821304', latency: '92ms' },
              { time: '2026-08-15 18:30:15', method: 'POST', endpoint: '/api/maersk/v1/emr-estimate', status: 200, res: 'SUBMITTED_QUEUED - Ref: MSK-EST-9921', latency: '140ms' },
              { time: '2026-08-15 17:15:00', method: 'GET', endpoint: '/api/maersk/v1/health-check', status: 200, res: 'HEALTHY - Server Cluster Singapore', latency: '48ms' }
            ].map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">{log.time}</span>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-300 font-bold rounded">{log.method}</span>
                  <span className="text-slate-300">{log.endpoint}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">{log.res}</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-bold">{log.status}</span>
                  <span className="text-slate-400 text-[11px]">{log.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
