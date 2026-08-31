import React, { useState, useMemo, useEffect } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import {
  LogOut,
  Truck,
  Ship,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Radio,
  FileText,
  Printer,
  QrCode,
  Download,
  Calendar,
  AlertCircle,
  Plus,
  Eye,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  UserCheck,
  LayoutDashboard,
  BarChart3,
  Activity,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { GateOutContainerRecord } from '../types/gateOut';
import { POPULAR_TRUCKING_COMPANIES } from '../data/gateOutMockData';
import { GateOutDispatchModal } from '../components/GateOutDispatchModal';
import { GateOutEirModal } from '../components/GateOutEirModal';
import { apiClient, containerApi } from '../../../api';

interface GateOutPageProps {
  containers?: ContainerRecord[];
  onNavigateTab: (tabId: string) => void;
  onUpdateContainerStatus?: (containerId: string, status: string) => void;
  initialSubTab?: 'OVERVIEW' | 'READY_LIST' | 'GATE_LANE' | 'HISTORY';
}

export const GateOutPage: React.FC<GateOutPageProps> = ({
  containers = [],
  onNavigateTab,
  onUpdateContainerStatus,
  initialSubTab = 'OVERVIEW'
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'READY_LIST' | 'GATE_LANE' | 'HISTORY'>(
    initialSubTab
  );
  const [gateOutList, setGateOutList] = useState<GateOutContainerRecord[]>([]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');

  // Modals
  const [selectedForDispatch, setSelectedForDispatch] = useState<GateOutContainerRecord | null>(null);
  const [viewingEirContainer, setViewingEirContainer] = useState<GateOutContainerRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Gate-Lane form states
  const [quickBookingSearch, setQuickBookingSearch] = useState('');
  const [quickSelectedContId, setQuickSelectedContId] = useState('');
  const [quickTruckPlate, setQuickTruckPlate] = useState('');
  const [quickChassisPlate, setQuickChassisPlate] = useState('');
  const [quickDriverName, setQuickDriverName] = useState('');
  const [quickDriverPhone, setQuickDriverPhone] = useState('');
  const [quickTruckingCo, setQuickTruckingCo] = useState('');
  const [quickSealNo, setQuickSealNo] = useState('');

  // Filter ready containers (waiting for truck arrival) - Any repaired / AV container is a good container ready for dispatch
  const readyContainers = useMemo(() => {
    // 1. From local gateOutList
    const localReady = gateOutList.filter((c) => !c.gateOutDetails);

    // 2. From global containers prop that are repaired or in AV condition
    const fromPropsReady: GateOutContainerRecord[] = (containers || [])
      .filter(
        (c) =>
          (c.condition === 'AV' ||
            c.status === 'READY_FOR_OUT' ||
            c.status === 'READY_FOR_USE' ||
            c.status === 'REPAIRED' ||
            c.status === 'QC_PASSED' ||
            c.status === 'APPROVED' ||
            c.status === 'IN_YARD') &&
          !gateOutList.some((g) => g.containerNo === c.containerNo)
      )
      .map((c, idx) => ({
        id: `GO-PROP-${c.id || idx}`,
        containerId: c.id,
        containerNo: c.containerNo,
        isoCode: c.isoCode || (c.size === '40HC' ? '45G1' : '22G1'),
        size: c.size || '40HC',
        type: c.type || 'Dry General',
        shippingLine: c.shippingLine || 'MAERSK',
        condition: 'AV',
        grade: 'GRADE_A',
        yardLocation: c.yardLocation || {
          block: 'A',
          bay: '01',
          row: '02',
          tier: '1'
        },
        repairedAt: '',
        qcInspectedAt: '',
        qcInspector: '',
        qcCertificateNo: '',
        carrierTransmission: {
          status: 'NOT_SENT',
          transmittedAt: '',
          transactionRef: '',
          ackReferenceNo: '',
          carrierReleaseToken: '',
          carrierMessage: ''
        }
      }));

    return [...localReady, ...fromPropsReady];
  }, [gateOutList, containers]);

  // Filter history containers (already dispatched)
  const historyContainers = useMemo(() => {
    return gateOutList.filter((c) => !!c.gateOutDetails);
  }, [gateOutList]);

  // Tab 2 size filter for picking good containers
  const [laneSizeFilter, setLaneSizeFilter] = useState<'ALL' | '20GP' | '40HC' | 'FOOD_GRADE'>('ALL');

  // Filtered good containers for Tab 2 selection
  const laneAvailableContainers = useMemo(() => {
    return readyContainers.filter((c) => {
      if (laneSizeFilter === '20GP') return c.size === '20GP';
      if (laneSizeFilter === '40HC') return c.size === '40HC';
      if (laneSizeFilter === 'FOOD_GRADE') return c.grade === 'FOOD_GRADE';
      return true;
    });
  }, [readyContainers, laneSizeFilter]);

  // Smart picker: auto-select lowest tier (Tier 1 or 2) good container
  const handleAutoSelectBestContainer = () => {
    const easyToLift = laneAvailableContainers.find(
      (c) => c.yardLocation.tier === '1' || c.yardLocation.tier === '2'
    ) || laneAvailableContainers[0];

    if (easyToLift) {
      setQuickSelectedContId(easyToLift.id);
      setToastMessage(`Đã tự động chọn container tốt tầng thấp dễ gắp nhất: ${easyToLift.containerNo} (Tầng ${easyToLift.yardLocation.tier})`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const selectedContainerObj = useMemo(() => {
    return readyContainers.find((c) => c.id === quickSelectedContId) || null;
  }, [readyContainers, quickSelectedContId]);

  // Filtered list for Tab 1
  const filteredReadyList = useMemo(() => {
    return readyContainers.filter((c) => {
      const matchSearch =
        searchKeyword.trim() === '' ||
        c.containerNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.shippingLine.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.qcCertificateNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.carrierTransmission.ackReferenceNo.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchCarrier =
        carrierFilter === 'ALL' || c.shippingLine.toUpperCase().includes(carrierFilter.toUpperCase());

      const matchSize = sizeFilter === 'ALL' || c.size === sizeFilter;

      return matchSearch && matchCarrier && matchSize;
    });
  }, [readyContainers, searchKeyword, carrierFilter, sizeFilter]);

  // Confirm Gate-Out Dispatch & Deduct from Yard
  const handleConfirmGateOut = async (
    containerId: string,
    dispatchData: {
      bookingNo: string;
      truckPlate: string;
      chassisPlate: string;
      driverName: string;
      driverPhone: string;
      driverIdCard?: string;
      truckingCompany: string;
      sealNo?: string;
      destinationPort?: string;
      forkliftOperator: string;
      gateLane: string;
      note?: string;
    }
  ) => {
    const targetCont = readyContainers.find((c) => c.id === containerId);
    if (!targetCont) return;

    try {
      const response: any = await containerApi.getById(targetCont.containerNo);
      if (response?.statusCode !== 200 || !response.data?.id) {
        throw new Error(response?.message || 'Không tìm thấy Job trong SQL Server.');
      }
      const gateOut = await apiClient.post<any>(`/DepotJobs/${response.data.id}/gate-out`, {
        truckPlate: dispatchData.truckPlate,
        driverName: dispatchData.driverName,
        trailerPlate: dispatchData.chassisPlate,
        sealNo: dispatchData.sealNo
      });
      if (gateOut.data?.statusCode !== 200) {
        throw new Error(gateOut.data?.message || 'Backend không thể Gate-Out container.');
      }

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const eirOutNo = gateOut.data?.data?.gateOutEirNo || `EIR-OUT-${response.data.jobNo}`;

    const updatedTarget: GateOutContainerRecord = {
      ...targetCont,
      gateOutDetails: {
        ...dispatchData,
        eirOutNo,
        gateOutTime: nowStr,
        gateStaff: 'Đặng Quốc Huy (Cán bộ Cổng Xuất)'
      }
    };

    setGateOutList((prev) => {
      const exists = prev.some((c) => c.id === containerId || c.containerNo === targetCont.containerNo);
      if (exists) {
        return prev.map((item) =>
          item.id === containerId || item.containerNo === targetCont.containerNo ? updatedTarget : item
        );
      }
      return [updatedTarget, ...prev];
    });

    // Update global container store to mark GATE_OUT and deduct from yard
    if (onUpdateContainerStatus) {
      onUpdateContainerStatus(targetCont.containerNo, 'GATE_OUT');
      if (targetCont.containerId) {
        onUpdateContainerStatus(targetCont.containerId, 'GATE_OUT');
      }
      onUpdateContainerStatus(containerId, 'GATE_OUT');
    }

    setSelectedForDispatch(null);
    setToastMessage(
      `🎉 CẤP VỎ THÀNH CÔNG! Đã xuất cont ${updatedTarget.containerNo} (${updatedTarget.size}) cho xe ${dispatchData.truckPlate}. ĐÃ TRỪ KHỎI BÃI & Giải phóng vị trí Block ${targetCont.yardLocation.block}-Bay ${targetCont.yardLocation.bay}. Mã e-EIR: ${eirOutNo}`
    );

    // Prompt to view EIR
    setViewingEirContainer(updatedTarget);

    setTimeout(() => setToastMessage(null), 8000);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Không thể kết nối Backend SQL Server.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Quick dispatch from gate lane
  const handleQuickLaneDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSelectedContId) {
      setToastMessage('⚠️ Vui lòng chọn một container đạt chuẩn để cấp phát!');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const targetCont = readyContainers.find((c) => c.id === quickSelectedContId);
    if (!targetCont) return;

    handleConfirmGateOut(quickSelectedContId, {
      bookingNo: quickBookingSearch || `BKG-${targetCont.shippingLine.slice(0, 3)}-99210`,
      truckPlate: quickTruckPlate.toUpperCase(),
      chassisPlate: quickChassisPlate.toUpperCase(),
      driverName: quickDriverName,
      driverPhone: quickDriverPhone,
      truckingCompany: quickTruckingCo,
      sealNo: quickSealNo,
      destinationPort: 'Cảng Cát Lái (VNSGN)',
      forkliftOperator: 'Nguyễn Văn Ba (Xe nâng #02)',
      gateLane: 'LÀN 03 (CỔNG XUẤT HÀNG)',
      note: 'Tiếp nhận trực tiếp tại làn cổng xuất.'
    });

    setQuickSelectedContId('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
            <LogOut className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                11. CỔNG XUẤT &amp; CẤP VỎ CONTAINER (GATE-OUT / DELIVERY ORDER)
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Container Tốt (AV / Sound)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              💡 <strong>Quy tắc cấp vỏ tự do:</strong> Xe đầu kéo đến bãi có thể <strong>lấy bất kỳ container nào</strong>, miễn là container đã hoàn tất sửa chữa (Đạt chuẩn AV / Sound Grade - Container Tốt). Cán bộ cổng có thể linh hoạt chỉ định vỏ phù hợp (ưu tiên tầng thấp 1-2 để xe nâng gắp nhanh nhất).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('shipping_api')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <Radio className="w-4 h-4 text-sky-400" />
            <span>&larr; Bước 10: Truyền API Hãng Tàu</span>
          </button>
          <button
            onClick={() => onNavigateTab('yard_map')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <MapPin className="w-4 h-4" />
            <span>Sơ Đồ Bãi (Yard Map) &rarr;</span>
          </button>
        </div>
      </div>

      {/* Toast message */}
      {toastMessage && (
        <div className="p-4 bg-slate-900 border-2 border-indigo-500 rounded-2xl flex items-center justify-between text-xs text-slate-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Vỏ Đã Sẵn Sàng Cấp (Chờ Xe Đến)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{readyContainers.length}</div>
          <span className="text-[10px] text-slate-500">Đã QC Đạt &bull; Hãng tàu đã xác nhận API</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Đã Báo Hãng Tàu Thành Công</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">100.0%</div>
          <span className="text-[10px] text-slate-500">Có mã ACK &bull; Đã mở khóa trên hệ thống</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Đã Cấp Ra Khỏi Bãi (Gate-Out)</span>
            <Truck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 font-mono">{historyContainers.length}</div>
          <span className="text-[10px] text-slate-500">Đã in phiếu e-EIR Xuất cho tài xế</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'OVERVIEW'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>📊 11. Tổng Quan Cổng Xuất</span>
          </button>

          <button
            onClick={() => setActiveTab('READY_LIST')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'READY_LIST'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>1. Vỏ Chờ Cấp (Ready In Yard) ({readyContainers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GATE_LANE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'GATE_LANE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>2. Tiếp Nhận Làn Cổng Xuất</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Nhật Ký Xuất &amp; Phiếu e-EIR ({historyContainers.length})</span>
          </button>
        </div>

        {/* Filter controls on Tab 1 */}
        {activeTab === 'READY_LIST' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs pt-2">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm số container, hãng tàu, mã xác nhận ACK, chứng chỉ QC..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả Hãng Tàu</option>
                <option value="MAERSK">Maersk Line (APM)</option>
                <option value="ONE">Ocean Network Express (ONE)</option>
                <option value="CMA CGM">CMA CGM Group</option>
                <option value="MSC">MSC Shipping</option>
                <option value="COSCO">COSCO Shipping</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả Kích Thước</option>
                <option value="20GP">20 feet GP</option>
                <option value="40HC">40 feet HC</option>
                <option value="40GP">40 feet GP</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 0: OVERVIEW & GATE-OUT DISPATCH COMMAND DASHBOARD */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Live Lane Status & Operations Command */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    TRUNG TÂM ĐIỀU ĐỘ &amp; KIỂM SOÁT CỔNG XUẤT (GATE-OUT COMMAND)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Giám sát luồng xe đầu kéo vào lấy vỏ &bull; Làn 03 &amp; Làn 04 đang mở phục vụ xuất bãi 24/7
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LÀN 03: ONLINE</span>
                </span>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LÀN 04: ONLINE</span>
                </span>
              </div>
            </div>

            {/* 3 Big Interactive Navigation & Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Card 1 */}
              <div
                onClick={() => setActiveTab('READY_LIST')}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition cursor-pointer group space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
                    <Ship className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold rounded">
                    AV SOUND
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono group-hover:text-cyan-300 transition">
                    {readyContainers.length}
                  </div>
                  <div className="text-xs font-bold text-slate-300">1. Vỏ Chờ Cấp (Ready In Yard)</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kho vỏ tốt đã qua QC &amp; có mã xác thực API hãng tàu.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-cyan-700 font-bold group-hover:translate-x-1 transition">
                  <span>Mở danh sách vỏ tốt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2 */}
              <div
                onClick={() => setActiveTab('GATE_LANE')}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition cursor-pointer group space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/30">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold rounded">
                    TRỰC TIẾP
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono group-hover:text-indigo-300 transition">
                    Làn 03 &bull; 04
                  </div>
                  <div className="text-xs font-bold text-slate-300">2. Tiếp Nhận Làn Cổng Xuất</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tiếp nhận xe đầu kéo, gắp vỏ và in phiếu e-EIR ra cổng.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-bold group-hover:translate-x-1 transition">
                  <span>Mở quầy làm thủ tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3 */}
              <div
                onClick={() => setActiveTab('HISTORY')}
                className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 rounded-2xl transition cursor-pointer group space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold rounded">
                    e-EIR ĐIỆN TỬ
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono group-hover:text-sky-300 transition">
                    {historyContainers.length}
                  </div>
                  <div className="text-xs font-bold text-slate-300">3. Nhật Ký Xuất &amp; Phiếu e-EIR</div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tra cứu lịch sử xe đã lấy vỏ và in lại phiếu giao nhận e-EIR.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-sky-700 font-bold group-hover:translate-x-1 transition">
                  <span>Xem nhật ký xuất bãi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Inventory Breakdown by Shipping Line */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Phân Bổ Vỏ Tốt Sẵn Sàng Cấp Theo Hãng Tàu
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Tổng: {readyContainers.length} cont</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { carrier: 'Maersk Line (APM)', count: readyContainers.filter(c => c.shippingLine.toUpperCase().includes('MAERSK')).length, color: 'bg-cyan-500' },
                    { carrier: 'Ocean Network Express (ONE)', count: readyContainers.filter(c => c.shippingLine.toUpperCase().includes('ONE')).length, color: 'bg-pink-500' },
                    { carrier: 'CMA CGM Group', count: readyContainers.filter(c => c.shippingLine.toUpperCase().includes('CMA')).length, color: 'bg-blue-500' },
                    { carrier: 'MSC Shipping', count: readyContainers.filter(c => c.shippingLine.toUpperCase().includes('MSC')).length, color: 'bg-amber-500' },
                    { carrier: 'COSCO Shipping', count: readyContainers.filter(c => c.shippingLine.toUpperCase().includes('COSCO')).length, color: 'bg-emerald-500' },
                  ].map((item) => {
                    const pct = readyContainers.length > 0 ? Math.round((item.count / readyContainers.length) * 100) : 0;
                    return (
                      <div key={item.carrier} className="space-y-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-bold">{item.carrier}</span>
                          <span className="font-mono text-slate-500">{item.count} cont ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`${item.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>Quy cách kích cỡ có sẵn:</span>
                  <div className="flex items-center gap-2 font-mono font-bold text-[11px]">
                    <span className="text-cyan-700">20GP: {readyContainers.filter(c => c.size === '20GP').length}</span>
                    <span>&bull;</span>
                    <span className="text-indigo-700">40HC: {readyContainers.filter(c => c.size === '40HC').length}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700">Food Grade: {readyContainers.filter(c => c.grade === 'FOOD_GRADE').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Recent Dispatched Trucks Feed */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Nhật Ký Các Chuyến Xe Xuất Bãi Gần Nhất
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('HISTORY')}
                    className="text-xs text-indigo-700 hover:text-indigo-800 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tất cả ({historyContainers.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {historyContainers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Chưa có container nào xuất bãi trong ca hôm nay.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {historyContainers.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-white">{item.containerNo}</span>
                            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px]">
                              {item.size}
                            </span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-indigo-700 font-bold">{item.shippingLine}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Xe: <strong className="text-slate-200">{item.gateOutDetails?.truckPlate}</strong> &bull; TX: {item.gateOutDetails?.driverName} ({item.gateOutDetails?.driverPhone})
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Xuất lúc: {item.gateOutDetails?.gateOutTime} &bull; Phiếu: {item.gateOutDetails?.eirOutNo}
                          </div>
                        </div>

                        <button
                          onClick={() => setViewingEirContainer(item)}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>e-EIR</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: READY CONTAINERS WAITING FOR TRUCK ARRIVAL */}
      {activeTab === 'READY_LIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700 uppercase tracking-wider">
                Vỏ Container Đã Sửa Chữa Hoàn Tất &bull; Hãng Tàu Đã Duyệt Qua API &bull; Chờ Xe Đến Lấy ({filteredReadyList.length})
              </span>
            </div>

            <span className="text-[11px] text-amber-700 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Chỉ cấp vỏ khi xe đầu kéo đến xuất trình Booking</span>
            </span>
          </div>

          {filteredReadyList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Ship className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Không có container nào đang chờ</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Khi các container hoàn tất sửa chữa, kiểm định QC Đạt (Bước 9) và được truyền API báo hãng tàu thành công (Bước 10), chúng sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Số Container &amp; Loại Vỏ</th>
                    <th className="p-4">Hãng Tàu &amp; Phân Hạng</th>
                    <th className="p-4">Vị Trí Trong Bãi</th>
                    <th className="p-4">Xác Nhận Của Hãng Tàu (API)</th>
                    <th className="p-4">Chứng Chỉ QC</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4 text-right">Thao Tác Cấp Vỏ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {filteredReadyList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850 transition duration-150">
                      <td className="p-4">
                        <div className="font-mono font-black text-white text-sm flex items-center gap-2">
                          <span>{item.containerNo}</span>
                          <span className="px-1.5 py-0.2 bg-blue-950 border border-blue-800 text-blue-300 rounded text-[10px]">
                            {item.isoCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.size} {item.type}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-blue-400">{item.shippingLine}</div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                            {item.grade}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 font-mono">
                        <div className="text-amber-400 font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Block {item.yardLocation.block}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Bay {item.yardLocation.bay} &bull; Row {item.yardLocation.row} &bull; Tier {item.yardLocation.tier}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.carrierTransmission.ackReferenceNo}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          Token: {item.carrierTransmission.carrierReleaseToken}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Báo lúc: {item.carrierTransmission.transmittedAt}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px]">
                        <div className="text-purple-400 font-bold">{item.qcCertificateNo}</div>
                        <div className="text-slate-400 text-[10px]">{item.qcInspector}</div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>VỎ TỐT (AV GRADE)</span>
                          </span>
                          <div className="text-[10px] text-amber-300 font-mono">
                            Chờ xe đến gắp
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedForDispatch(item)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 ml-auto cursor-pointer shadow-lg shadow-indigo-950"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Xe Đến Lấy &rarr; Cho Cấp Vỏ</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE GATE-OUT LANE CHECK-IN */}
      {activeTab === 'GATE_LANE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Direct Lane Dispatch Form */}
          <div className="lg:col-span-7 space-y-4">
            <form onSubmit={handleQuickLaneDispatch} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Tiếp Nhận Trực Tiếp Xe Đầu Kéo Tại Làn Cổng Xuất
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-xs font-mono font-bold">
                  LÀN 03 / LÀN 04
                </span>
              </div>

              {/* Step 1: Select container */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-slate-300 font-bold block">
                    1. Chọn Bất Kỳ Container Tốt Đã Sửa Xong Trong Bãi (*):
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSelectBestContainer}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ Gợi Ý Vỏ Tốt Dễ Gắp (Tầng 1-2)</span>
                  </button>
                </div>

                {/* Filter pills for quick container picking */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setLaneSizeFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      laneSizeFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất Cả Vỏ Tốt ({readyContainers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaneSizeFilter('20GP')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      laneSizeFilter === '20GP'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    20GP Tốt ({readyContainers.filter((c) => c.size === '20GP').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaneSizeFilter('40HC')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      laneSizeFilter === '40HC'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    40HC Tốt ({readyContainers.filter((c) => c.size === '40HC').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaneSizeFilter('FOOD_GRADE')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      laneSizeFilter === 'FOOD_GRADE'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Food Grade ({readyContainers.filter((c) => c.grade === 'FOOD_GRADE').length})
                  </button>
                </div>

                <select
                  value={quickSelectedContId}
                  onChange={(e) => setQuickSelectedContId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono text-xs focus:outline-none focus:border-indigo-500 font-bold"
                  required
                >
                  <option value="">-- Bấm chọn container tốt để cấp cho xe này --</option>
                  {laneAvailableContainers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.containerNo} ({c.shippingLine} - {c.size} - {c.grade}) [Block {c.yardLocation.block} &bull; Bay {c.yardLocation.bay} &bull; Tầng {c.yardLocation.tier}] {c.yardLocation.tier === '1' ? '⭐ Dễ gắp' : ''}
                    </option>
                  ))}
                </select>

                {/* Live Selected Container Preview Card */}
                {selectedContainerObj && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-white">
                          {selectedContainerObj.containerNo}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono text-[10px] font-bold">
                          ✅ CONTAINER TỐT (AV GRADE)
                        </span>
                      </div>
                      <span className="text-xs text-sky-300 font-bold font-mono">
                        {selectedContainerObj.shippingLine} &bull; {selectedContainerObj.size} {selectedContainerObj.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300 pt-1 border-t border-indigo-900/50">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Vị trí bãi:</span>
                        <strong className="text-amber-300">
                          Block {selectedContainerObj.yardLocation.block} - Bay {selectedContainerObj.yardLocation.bay} - Row {selectedContainerObj.yardLocation.row} - Tầng {selectedContainerObj.yardLocation.tier}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Chứng chỉ QC:</span>
                        <strong className="text-purple-300">{selectedContainerObj.qcCertificateNo}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Mã ACK Hãng:</span>
                        <strong className="text-emerald-300">{selectedContainerObj.carrierTransmission.ackReferenceNo}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Truck info */}
              <div className="space-y-3 text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-bold block uppercase text-[11px]">
                  2. Nhập Thông Tin Xe Đầu Kéo &amp; Booking Của Khách Hàng:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">Số Booking Hãng Tàu (*)</label>
                    <input
                      type="text"
                      value={quickBookingSearch}
                      onChange={(e) => setQuickBookingSearch(e.target.value)}
                      placeholder="VD: BKG-MAE-882190"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono uppercase font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Biển Số Xe Đầu Kéo (*)</label>
                    <input
                      type="text"
                      value={quickTruckPlate}
                      onChange={(e) => setQuickTruckPlate(e.target.value)}
                      placeholder="51C-992.81"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-indigo-300 rounded-xl font-mono uppercase font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Biển Số Rơ-Moóc</label>
                    <input
                      type="text"
                      value={quickChassisPlate}
                      onChange={(e) => setQuickChassisPlate(e.target.value)}
                      placeholder="51R-091.24"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Tên Tài Xế Nhận Vỏ (*)</label>
                    <input
                      type="text"
                      value={quickDriverName}
                      onChange={(e) => setQuickDriverName(e.target.value)}
                      placeholder="Võ Hoàng Nam"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Số Điện Thoại Tài Xế</label>
                    <input
                      type="text"
                      value={quickDriverPhone}
                      onChange={(e) => setQuickDriverPhone(e.target.value)}
                      placeholder="0909.882.119"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Số Chì Hãng Tàu (Seal No)</label>
                    <input
                      type="text"
                      value={quickSealNo}
                      onChange={(e) => setQuickSealNo(e.target.value)}
                      placeholder="MSK-SEAL-88401"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-amber-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400">Đơn Vị Vận Tải (Trucking / FWD)</label>
                    <select
                      value={quickTruckingCo}
                      onChange={(e) => setQuickTruckingCo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl"
                    >
                      {POPULAR_TRUCKING_COMPANIES.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-indigo-950 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>🚚 XÁC NHẬN CẤP VỎ CHO XE &amp; TRỪ KHỎI BÃI (IN PHIẾU e-EIR)</span>
              </button>
            </form>
          </div>

          {/* Right: Real-time Camera / Gate Status & Guidelines */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Quy Trình Kiểm Soát Cổng Xuất EMR
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <strong className="text-indigo-400 block font-mono">1. Đối Soát Lệnh Booking Hãng Tàu</strong>
                  <p className="text-[11px] text-slate-400">
                    Chỉ cấp vỏ khi lệnh Booking còn hạn, đúng Hãng Tàu, đúng Kích cỡ và đúng Phân hạng Grade yêu cầu.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <strong className="text-emerald-400 block font-mono">2. Điều Xe Nâng Bãi Gắp Cont</strong>
                  <p className="text-[11px] text-slate-400">
                    Lệnh điều độ tự động gửi tới máy tính bảng của tài xế xe nâng (Forklift Tablet) theo vị trí Block - Bay - Row - Tier.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <strong className="text-amber-400 block font-mono">3. Ký Nhận e-EIR &amp; Bàn Giao Chì Seal</strong>
                  <p className="text-[11px] text-slate-400">
                    Tài xế kiểm tra vỏ, nhận chì niêm phong Lead Seal và nhận phiếu xuất bãi e-EIR điện tử có mã QR tra cứu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GATE-OUT HISTORY & EIR RECORDS */}
      {activeTab === 'HISTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Nhật Ký Container Đã Cấp Vỏ &amp; Xuất Bãi Thành Công ({historyContainers.length})
              </span>
            </div>

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(historyContainers, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `GATE-OUT-EXPORT-${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Danh Sách EIR</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Thời Gian Xuất</th>
                  <th className="p-4">Số Phiếu EIR</th>
                  <th className="p-4">Số Container &amp; Loại Vỏ</th>
                  <th className="p-4">Hãng Tàu</th>
                  <th className="p-4">Xe Đầu Kéo / Rơ-Moóc</th>
                  <th className="p-4">Tài Xế / Đơn Vị Vận Tải</th>
                  <th className="p-4">Số Booking</th>
                  <th className="p-4 text-right">Xem / In Phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {historyContainers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850 transition duration-150">
                    <td className="p-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {item.gateOutDetails?.gateOutTime}
                    </td>

                    <td className="p-4 font-bold text-indigo-400 whitespace-nowrap">
                      {item.gateOutDetails?.eirOutNo}
                    </td>

                    <td className="p-4 text-white font-bold whitespace-nowrap">
                      {item.containerNo} ({item.size})
                    </td>

                    <td className="p-4 text-blue-400 font-bold whitespace-nowrap">
                      {item.shippingLine}
                    </td>

                    <td className="p-4 text-emerald-300 font-bold whitespace-nowrap">
                      {item.gateOutDetails?.truckPlate}
                      <span className="text-slate-500 font-normal ml-1">
                        / {item.gateOutDetails?.chassisPlate}
                      </span>
                    </td>

                    <td className="p-4 font-sans text-slate-300">
                      <div className="font-bold text-white">{item.gateOutDetails?.driverName}</div>
                      <div className="text-[10px] text-slate-400">{item.gateOutDetails?.truckingCompany}</div>
                    </td>

                    <td className="p-4 font-mono text-amber-400 font-bold whitespace-nowrap">
                      {item.gateOutDetails?.bookingNo}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setViewingEirContainer(item)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-400" />
                        <span>In Phiếu EIR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Dispatch Container when Truck Arrives */}
      {selectedForDispatch && (
        <GateOutDispatchModal
          container={selectedForDispatch}
          onClose={() => setSelectedForDispatch(null)}
          onConfirmGateOut={handleConfirmGateOut}
        />
      )}

      {/* Modal: View & Print EIR Out */}
      {viewingEirContainer && (
        <GateOutEirModal
          container={viewingEirContainer}
          onClose={() => setViewingEirContainer(null)}
        />
      )}
    </div>
  );
};
