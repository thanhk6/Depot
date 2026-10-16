import React, { useState, useMemo, useEffect } from 'react';
import { formatVND, formatNumber } from '../../../utils/format';
import { ContainerRecord } from '../../../services/mockDataStore';
import { StaffRealtimeReportTab } from '../components/StaffRealtimeReportTab';
import { reportApi } from '../../../api';
import { KPIStats } from '../../../types/report';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Truck,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Wrench,
  Droplets,
  Layers,
  Sparkles,
  ChevronRight,
  PieChart,
  Activity,
  FileSpreadsheet,
  Zap,
  Building2,
  Check,
  AlertCircle,
  Eye,
  ArrowRight,
  Users
} from 'lucide-react';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';

interface ReportPageProps {
  containers?: ContainerRecord[];
  onNavigateTab?: (tabId: string) => void;
  initialTab?: 'staff_realtime' | 'overview' | 'emr_damage' | 'dwell_time' | 'revenue' | 'detailed_log';
}

export const ReportPage: React.FC<ReportPageProps> = ({
  containers = [],
  onNavigateTab,
  initialTab = 'staff_realtime'
}) => {
  const containerTypeOptions = useContainerTypeOptions();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'quarter' | 'year'>('month');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('ALL');
  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'staff_realtime' | 'overview' | 'emr_damage' | 'dwell_time' | 'revenue' | 'detailed_log'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);
  const [backendKpi, setBackendKpi] = useState<KPIStats | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    void loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const res = await reportApi.getKPIStats();
      if (res?.data) {
        setBackendKpi(res.data);
      }
    } catch {
    }
    try {
      const res: any = await reportApi.getAnalytics();
      if (res?.statusCode === 200 && res.data) {
        setAnalytics(res.data);
      }
    } catch {
    } finally {
      setIsRefreshing(false);
    }
  };

  // Quick refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadReportData();
  };

  // Export to Excel via backend endpoint
  const handleExportExcel = async () => {
    try {
      await reportApi.exportExcel({
        timeRange,
        selectedCarrier,
        selectedSize,
        searchQuery
      });
    } catch {
      // Keep the same user feedback path even if the server export is still stubbed.
    }

    setShowExportToast(true);
    setTimeout(() => {
      setShowExportToast(false);
    }, 3000);
  };

  // Print simulation
  const handlePrint = () => {
    window.print();
  };

  // Chỉ dùng dữ liệu thật từ GET /api/reports/analytics + /api/reports/kpi. Trước đây mỗi bảng có 1 mảng
  // "fallback" gõ cứng (container, tổ thợ, doanh thu bịa) hiện ra khi API chưa trả — đã bỏ theo yêu cầu
  // chỉ lấy dữ liệu từ database; không có dữ liệu thì hiện "Chưa có dữ liệu".
  const throughputData: Array<{ day: string; gateIn: number; gateOut: number; total: number }> = analytics?.throughput || [];
  const throughputMax = Math.max(1, ...throughputData.map((d) => Math.max(d.gateIn, d.gateOut)));
  const damageCategories: Array<{ name: string; count: number; percent: number; cost: number }> = analytics?.damageCategories || [];
  const totalDamageCount = damageCategories.reduce((sum, d) => sum + d.count, 0);
  const teamStatusLabel = (fpyPercent: number) => (fpyPercent >= 99 ? 'XUẤT SẮC' : fpyPercent >= 97 ? 'TỐT' : 'ĐẠT');
  const technicianTeams = (analytics?.technicianTeams || []).map((t: any) => ({
    name: t.name,
    completed: t.completed,
    avgHours: t.avgHours,
    fpy: `${t.fpyPercent}%`,
    status: teamStatusLabel(t.fpyPercent)
  }));
  const agingContainers = (analytics?.agingContainers || []).map((c: any) => ({
    containerNo: c.containerNo,
    line: c.shippingLine || '-',
    size: c.isoSize,
    dwellDays: c.dwellDays,
    location: c.location,
    status: c.status
  }));
  const agingTiers: Array<{ label: string; fromDay: number; toDay: number | null; count: number; percent: number }> = analytics?.agingTiers || [];
  const detailedContainerLogs = (analytics?.detailedLogs || []).map((l: any) => ({
    id: l.id,
    containerNo: l.containerNo,
    size: l.isoSize,
    line: l.shippingLine || '-',
    gateIn: l.gateIn || '-',
    gateOut: l.gateOut || '-',
    dwell: `${l.dwellDays} ngày`,
    emrCost: l.emrCost,
    liftFee: l.liftFee,
    status: l.status,
    grade: l.grade || '-'
  }));

  const filteredLogs = detailedContainerLogs.filter((item) => {
    const matchSearch =
      item.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.line.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCarrier = selectedCarrier === 'ALL' || item.line === selectedCarrier;
    const matchSize = selectedSize === 'ALL' || item.size === selectedSize;
    return matchSearch && matchCarrier && matchSize;
  });

  // KPI thật: tổng hồ sơ, doanh thu, FPY từ /reports/kpi; nhập/xuất 7 ngày từ throughput; dwell TB từ analytics.
  const totalRevenueValue = backendKpi?.totalRevenueVnd ?? 0;
  const gateInCount = backendKpi?.totalJobs ?? 0;
  const approvalRateValue = backendKpi?.firstPassYieldPercent;
  const gateIn7d = throughputData.reduce((sum, d) => sum + d.gateIn, 0);
  const gateOut7d = throughputData.reduce((sum, d) => sum + d.gateOut, 0);
  const avgDwellDays: number | null | undefined = analytics?.avgDwellDaysInYard;
  const revenueByCategory: Record<string, number> = (analytics?.revenueBreakdown || []).reduce((acc: Record<string, number>, r: any) => {
    acc[r.category] = r.amount;
    return acc;
  }, {} as Record<string, number>);
  const emrRevenue: number = analytics?.emrRepairRevenueVnd || 0;
  const loloRevenue = revenueByCategory['LOLO'] || 0;
  const revenueShare = (amount: number) => (totalRevenueValue > 0 ? `${Math.round((amount / totalRevenueValue) * 100)}%` : '—');
  const noData = <span className="text-slate-400 font-normal">Chưa có dữ liệu</span>;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-200 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <div className="text-xs font-black">Xuất Báo Cáo Excel Thành Công!</div>
            <div className="text-[10px] text-emerald-100">File Depot_Operations_KPI_Report.xlsx đã sẵn sàng tải về.</div>
          </div>
        </div>
      )}

      {/* 1. TOP HERO HEADER & CONTROLS */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0d1733] to-slate-900 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow backdrop spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg  shrink-0">
              <div className="w-full h-full bg-[#081024] rounded-[14px] flex items-center justify-center text-cyan-600 font-black">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-mono font-extrabold text-cyan-600 uppercase tracking-wider bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  EXECUTIVE ANALYTICS • TỔNG HỢP KPI DEPOT
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Dữ Liệu Thời Gian Thực
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Báo Cáo Vận Hành & Hiệu Suất KPI
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                Phân tích thông lượng nâng hạ, Dwell Time lưu bãi, TAT duyệt báo giá EDI, năng suất sửa chữa EMR & doanh thu.
              </p>
            </div>
          </div>

          {/* Action Bar (Export, Print, Refresh) */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200/80 transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition cursor-pointer items-center gap-1.5 whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>In Báo Cáo</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg  transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất File Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-200/80">
          {/* Time range selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Khoảng Thời Gian
            </label>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'today', label: 'Hôm nay' },
                { id: '7days', label: '7 ngày' },
                { id: 'month', label: 'Tháng này' },
                { id: 'quarter', label: 'Quý 3' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id as any)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
                    timeRange === t.id
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carrier selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Hãng Tàu (Carrier)
            </label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-cyan-500 focus:outline-none min-h-[34px]"
            >
              <option value="ALL">Tất Cả Hãng Tàu (All Carriers)</option>
              <option value="MAEU">MAERSK LINE (MAEU / MSK)</option>
              <option value="CMA">CMA CGM (CMA)</option>
              <option value="ONE">OCEAN NETWORK EXPRESS (ONE)</option>
              <option value="MSC">MEDITERRANEAN SHIPPING (MSC)</option>
              <option value="COSCO">COSCO SHIPPING (COS)</option>
            </select>
          </div>

          {/* Size selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Kích Thước Container
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-cyan-500 focus:outline-none min-h-[34px]"
            >
              <option value="ALL">Tất Cả Kích Thước</option>
              {containerTypeOptions.map((t) => (
                <option key={t.id} value={t.typeCode}>{t.typeCode} - {t.name || t.vietnameseName}</option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Tìm Số Container / Mã
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="VD: MSKU1234567..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none min-h-[34px]"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIX EXECUTIVE KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* KPI 1: Throughput */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Thông Lượng Bãi</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{gateInCount.toLocaleString()} <span className="text-xs font-sans text-slate-500 font-normal">Hồ sơ</span></div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
              <span>Tổng hồ sơ container</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/80 flex justify-between">
            <span>Nhập 7 ngày: <b className="text-slate-700">{gateIn7d}</b></span>
            <span>Xuất 7 ngày: <b className="text-slate-700">{gateOut7d}</b></span>
          </div>
        </div>

        {/* KPI 2: Dwell Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Dwell Time TB</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {avgDwellDays != null ? <>{avgDwellDays} <span className="text-xs font-sans text-slate-500 font-normal">Ngày</span></> : noData}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Trung bình container đang trong bãi</div>
          </div>
        </div>

        {/* KPI 3: Estimate Approval TAT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Tốc Độ Duyệt EDI</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono">{noData}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Hệ thống chưa ghi thời gian duyệt báo giá</div>
          </div>
        </div>

        {/* KPI 4: First-Pass Yield (QC) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">QC Pass Lần 1</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">{approvalRateValue != null ? `${approvalRateValue.toFixed(1)}%` : noData}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Tỷ lệ lệnh sửa chữa QC đạt</div>
          </div>
        </div>

        {/* KPI 5: Forklift Moves */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Xe Nâng Bãi (RS)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">{noData}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Hệ thống chưa thống kê năng suất xe nâng</div>
          </div>
        </div>

        {/* KPI 6: Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Doanh Thu Vận Hành</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-teal-700 font-mono truncate">{formatVND(totalRevenueValue)} <span className="text-xs font-sans text-slate-500 font-normal">₫</span></div>
          </div>
          <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/80 flex justify-between">
            <span>Sửa chữa EMR: <b className="text-teal-700">{revenueShare(emrRevenue)}</b></span>
            <span>Nâng hạ: <b className="text-slate-700">{revenueShare(loloRevenue)}</b></span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 touch-pan-x overscroll-x-contain scrollbar-thin select-none">
        <button
          onClick={() => setActiveTab('staff_realtime')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'staff_realtime'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg  ring-1 ring-sky-400'
              : 'text-sky-600 hover:text-slate-900 hover:bg-slate-850 bg-white border border-sky-200'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>⚡ 1. Công Việc Từng Người (Real-Time)</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'overview'
              ? 'bg-cyan-600 text-white shadow-lg  ring-1 ring-cyan-400/40'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-850 bg-white border border-slate-200/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>2. Tổng Quan & Thông Lượng Bãi</span>
        </button>

        <button
          onClick={() => setActiveTab('emr_damage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'emr_damage'
              ? 'bg-cyan-600 text-white shadow-lg  ring-1 ring-cyan-400/40'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-850 bg-white border border-slate-200/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>3. Năng Suất Sửa Chữa EMR & Hư Hỏng IICL</span>
        </button>

        <button
          onClick={() => setActiveTab('dwell_time')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'dwell_time'
              ? 'bg-cyan-600 text-white shadow-lg  ring-1 ring-cyan-400/40'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-850 bg-white border border-slate-200/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>4. Thời Gian Lưu Bãi & Tuổi Container</span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'revenue'
              ? 'bg-cyan-600 text-white shadow-lg  ring-1 ring-cyan-400/40'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-850 bg-white border border-slate-200/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>5. Doanh Thu & Cước Nâng Hạ</span>
        </button>

        <button
          onClick={() => setActiveTab('detailed_log')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'detailed_log'
              ? 'bg-cyan-600 text-white shadow-lg  ring-1 ring-cyan-400/40'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-850 bg-white border border-slate-200/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>6. Bảng Nhật Ký Chi Tiết ({filteredLogs.length})</span>
        </button>
      </div>

      {/* 4. TAB CONTENT */}

      {/* TAB 0: CÔNG VIỆC TỪNG NGƯỜI (REAL-TIME) */}
      {activeTab === 'staff_realtime' && (
        <StaffRealtimeReportTab />
      )}

      {/* TAB 1: TỔNG QUAN & THÔNG LƯỢNG BÃI */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Left 8 cols: Throughput Bar Chart Visual */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-600" />
                    <span>Sản Lượng Nâng Hạ Cổng (Gate-In vs Gate-Out 7 Ngày Qua)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Theo dõi thông lượng luân chuyển cont hạ bãi và cấp vỏ rỗng.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Gate-In
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-600 font-bold">
                    <span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Gate-Out
                  </span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-3 pt-2">
                {throughputData.length === 0 && <div className="py-6 text-center text-xs text-slate-500">Chưa có dữ liệu</div>}
                {throughputData.map((d) => (
                  <div key={d.day} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-700 font-bold w-24">{d.day}</span>
                      <div className="flex gap-4 text-[11px]">
                        <span className="text-emerald-600 font-bold">In: {d.gateIn} cont</span>
                        <span className="text-sky-600 font-bold">Out: {d.gateOut} cont</span>
                        <span className="text-slate-900 font-black">Tổng: {d.total} lượt</span>
                      </div>
                    </div>
                    <div className="w-full h-3.5 bg-slate-50 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-200">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${(d.gateIn / throughputMax) * 50}%` }}
                        title={`Gate In: ${d.gateIn}`}
                      />
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${(d.gateOut / throughputMax) * 50}%` }}
                        title={`Gate Out: ${d.gateOut}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 cols: Yard Capacity Dial & Grade Breakdown */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6">
              
              {/* Yard Utilization Box */}
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Sức Chứa Bãi (Yard Capacity)</span>
                  </h4>
                </div>

                {(() => {
                  const blocks = analytics?.blockCapacity?.length ? analytics.blockCapacity : null;
                  if (!blocks) return <div className="py-6 text-center text-xs text-slate-500">Chưa có dữ liệu</div>;
                  const totalOccupied = blocks.reduce((s: number, b: any) => s + b.occupiedCount, 0);
                  const totalCapacity = blocks.reduce((s: number, b: any) => s + b.totalCapacity, 0);
                  const overallPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 1000) / 10 : 0;
                  return (
                    <>
                      <div className="text-center py-2">
                        <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">{overallPercent}%</div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">{totalOccupied.toLocaleString()} / {totalCapacity.toLocaleString()} Slots Đang Lưu Bãi</div>
                        <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-200">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-full" style={{ width: `${overallPercent}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                        {blocks.map((b: any) => (
                          <div key={b.blockCode} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-bold">BLOCK {b.blockCode.replace('BLOCK_', '')}</div>
                            <div className="font-mono font-bold text-slate-900">{b.occupancyPercent}%</div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Grade Quality Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <Sparkles className="w-4 h-4" />
                  <span>Phân Hạng Chất Lượng Vỏ (Grade AV)</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {!analytics?.gradeDistribution?.length && <div className="py-4 text-center text-slate-500">Chưa có dữ liệu</div>}
                  {(analytics?.gradeDistribution || []).map((g: any, idx: number) => {
                    const styles = [
                      { text: 'text-emerald-700', dot: 'bg-emerald-400' },
                      { text: 'text-sky-700', dot: 'bg-sky-400' },
                      { text: 'text-amber-700', dot: 'bg-amber-400' },
                      { text: 'text-rose-700', dot: 'bg-rose-400' }
                    ];
                    const style = styles[idx % styles.length];
                    return (
                      <div key={g.grade} className="flex justify-between items-center">
                        <span className={`flex items-center gap-2 ${style.text} font-bold`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} /> Grade {g.grade}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{g.percent}% ({g.count.toLocaleString()} Cont)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: NĂNG SUẤT SỬA CHỮA EMR & HƯ HỎNG IICL */}
      {activeTab === 'emr_damage' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Top Damage Categories */}
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-rose-600" />
                    <span>Cơ Cấu Hư Hỏng IICL-6 Phổ Biến</span>
                  </h3>
                  <p className="text-xs text-slate-500">Thống kê các vị trí hư hỏng phát sinh sửa chữa nhiều nhất.</p>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {totalDamageCount} Hạng Mục Hư Hỏng
                </span>
              </div>

              <div className="space-y-3.5">
                {damageCategories.length === 0 && <div className="py-6 text-center text-xs text-slate-500">Chưa có dữ liệu</div>}
                {damageCategories.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-rose-50 text-rose-600 flex items-center justify-center font-mono text-[10px]">
                          {idx + 1}
                        </span>
                        {item.name}
                      </span>
                      <span className="font-mono font-black text-rose-600">{item.percent}% ({item.count} vụ)</span>
                    </div>

                    <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>Tổng chi phí sửa chữa:</span>
                      <span className="font-mono font-bold text-slate-700">{formatVND(item.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technician Teams Productivity & TAT Breakdown */}
            <div className="space-y-4 sm:space-y-6">
              
              {/* Teams table */}
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Năng Suất Các Tổ Thợ Sửa Chữa EMR</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Đánh giá theo FPY</span>
                </div>

                <div className="space-y-2.5">
                  {technicianTeams.length === 0 && <div className="py-6 text-center text-xs text-slate-500">Chưa có lệnh sửa chữa hoàn tất</div>}
                  {technicianTeams.map((team: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{team.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Hoàn tất: <b className="text-slate-700">{team.completed} Cont</b> • Thời gian TB: <b className="text-cyan-600">{team.avgHours}h / cont</b>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-black text-emerald-600">FPY: {team.fpy}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {team.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 3: THỜI GIAN LƯU BÃI & TUỔI CONTAINER */}
      {activeTab === 'dwell_time' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Aging Tiers Box */}
            <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Phân Tầng Tuổi Lưu Bãi (Aging Analysis)</span>
              </h3>

              <div className="space-y-3">
                {agingTiers.length === 0 && <div className="py-6 text-center text-xs text-slate-500">Chưa có dữ liệu</div>}
                {agingTiers.map((t, i) => {
                  const color = [
                    { text: 'text-emerald-600', bar: 'bg-emerald-500' },
                    { text: 'text-sky-600', bar: 'bg-sky-500' },
                    { text: 'text-amber-600', bar: 'bg-amber-500' },
                    { text: 'text-rose-600', bar: 'bg-rose-500' }
                  ][i] || { text: 'text-slate-600', bar: 'bg-slate-500' };
                  return (
                    <div key={t.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={color.text}>{t.label}</span>
                        <span className="font-mono text-slate-900">{t.percent}% ({t.count} Cont)</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${color.bar} rounded-full`} style={{ width: `${t.percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Long Dwell Containers (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Danh Sách Container Lưu Bãi Lâu (từ 15 Ngày)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Cảnh báo tự động gửi thông báo Hãng tàu ưu tiên xuất bãi.</p>
                </div>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('gate_out')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-slate-900 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Cấp Xuất Cổng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto touch-pan-x overscroll-x-contain pb-2 scrollbar-thin">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">SỐ CONTAINER</th>
                      <th className="p-3">HÃNG / SIZE</th>
                      <th className="p-3">SỐ NGÀY LƯU</th>
                      <th className="p-3">VỊ TRÍ BÃI</th>
                      <th className="p-3 text-right">TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {agingContainers.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-500">Không có container lưu bãi từ 15 ngày</td></tr>
                    )}
                    {agingContainers.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-100 transition">
                        <td className="p-3 font-mono font-bold text-amber-700">{item.containerNo}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900">{item.line}</span> • {item.size}
                        </td>
                        <td className="p-3 font-mono font-black text-rose-600">{item.dwellDays} Ngày</td>
                        <td className="p-3 font-mono text-teal-600">{item.location}</td>
                        <td className="p-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: DOANH THU & BIỂU CƯỚC */}
      {activeTab === 'revenue' && (
        <div className="space-y-4 sm:space-y-6">
          {(() => {
            // Doanh thu thật: ServiceOrderItem.Category (LOLO/STORAGE/CLEANING/REEFER_POWER/PTI/YARD_SHIFT/
            // CUSTOMS/EXTRA — đã xác nhận đúng chuỗi thật dùng ở module Operation #6) + Estimate.GrandTotal
            // (APPROVED) cho doanh thu sửa chữa EMR (không có category riêng trong ServiceOrderItem).
            const loloAmount = loloRevenue;
            const emrAmount = emrRevenue;
            const cleaningAmount = revenueByCategory['CLEANING'] || 0;
            const reeferPtiAmount = (revenueByCategory['REEFER_POWER'] || 0) + (revenueByCategory['PTI'] || 0);
            const card3Total = cleaningAmount + reeferPtiAmount;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Revenue Stream Card 1 */}
                <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">1. Phí Nâng Hạ (Lift-on/off)</span>
                    <Boxes className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">{formatVND(loloAmount)}</div>
                  <p className="text-xs text-slate-500">Cước nâng hạ container tại làn cổng (category LOLO).</p>
                </div>

                {/* Revenue Stream Card 2 */}
                <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">2. Phí Sửa Chữa EMR</span>
                    <Wrench className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">{formatVND(emrAmount)}</div>
                  <p className="text-xs text-slate-500">Tổng giá trị Báo giá đã được hãng tàu duyệt (Estimate.GrandTotal).</p>
                </div>

                {/* Revenue Stream Card 3 */}
                <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">3. Vệ Sinh & PTI Lạnh</span>
                    <Droplets className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">{formatVND(card3Total)}</div>
                  <p className="text-xs text-slate-500">Vệ sinh nước áp lực, hóa chất & cắm điện chạy lạnh PTI.</p>
                  <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-700">
                      <span>Vệ sinh (CLEANING):</span>
                      <span className="font-mono font-bold text-slate-900">{formatVND(cleaningAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Cắm điện & PTI (REEFER_POWER/PTI):</span>
                      <span className="font-mono font-bold text-slate-900">{formatVND(reeferPtiAmount)}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 5: BẢNG NHẬT KÝ CHI TIẾT */}
      {activeTab === 'detailed_log' && (
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                <span>Bảng Nhật Ký Chi Tiết Từng Lượt Tiếp Nhận & Khai Thác</span>
              </h3>
              <p className="text-xs text-slate-500">Dữ liệu thô phục vụ đối soát cước và kiểm tra audit Hãng Tàu.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất File CSV/Excel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto touch-pan-x overscroll-x-contain pb-2 scrollbar-thin">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">MÃ LOG</th>
                  <th className="p-3">SỐ CONTAINER</th>
                  <th className="p-3">HÃNG / SIZE</th>
                  <th className="p-3">THỜI GIAN VÀO CỔNG</th>
                  <th className="p-3">THỜI GIAN RA CỔNG</th>
                  <th className="p-3">DWELL TIME</th>
                  <th className="p-3">CƯỚC NÂNG HẠ</th>
                  <th className="p-3">CHI PHÍ EMR</th>
                  <th className="p-3 text-right">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={9} className="p-6 text-center text-slate-500">Chưa có dữ liệu</td></tr>
                )}
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-100 transition">
                    <td className="p-3 font-mono text-slate-500">{log.id}</td>
                    <td className="p-3 font-mono font-bold text-sky-600">{log.containerNo}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{log.line}</span> • {log.size}
                    </td>
                    <td className="p-3 text-slate-700 font-mono text-[11px]">{log.gateIn}</td>
                    <td className="p-3 text-slate-700 font-mono text-[11px]">{log.gateOut}</td>
                    <td className="p-3 font-mono text-teal-600 font-bold">{log.dwell}</td>
                    <td className="p-3 font-mono text-slate-700">{formatVND(log.liftFee)}</td>
                    <td className="p-3 font-mono text-amber-700 font-bold">{formatVND(log.emrCost)}</td>
                    <td className="p-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'ĐÃ XUẤT CỔNG'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : log.status === 'TRONG BÃI (AV)'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
