import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Droplets,
  Search,
  CheckCircle2,
  Clock,
  Check,
  Square,
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  FileText,
  History,
  Printer,
  X,
  Award,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  CheckCheck,
  Container as ContainerIcon
} from 'lucide-react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { CleaningExecutionRecord } from '../types';
import { fetchContainerTypes } from '../../masterdata/utils/containerTypeCatalog';
import { fetchCleaningTariffs } from '../../masterdata/utils/cleaningTariffCatalog';
import { ContainerTypeMasterItem, CleaningTariffMasterItem } from '../../survey/types';
import { cleaningApi } from '../../../api';
import { mapCleaningRecordDto } from '../utils/mapCleaningRecord';
import { NewCleaningIntakeModal } from '../components/NewCleaningIntakeModal';
import { useDepot } from '../../../context/DepotContext';

interface CleaningModulePageProps {
  initialTab?: 'PENDING' | 'COMPLETED';
  containers?: ContainerRecord[];
  onCompleteCleaning?: (
    containerId: string,
    cleaningData: {
      qualityGrade: 'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE';
      cleaningStaff: string;
      notes: string;
      totalCost: number;
    }
  ) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const CleaningModulePage: React.FC<CleaningModulePageProps> = ({
  initialTab = 'PENDING',
  containers = [],
  onCompleteCleaning,
  onNavigateTab
}) => {
  // Người thao tác = tài khoản đang đăng nhập thật (thay cho tên người mẫu viết cứng trước đây).
  const { loggedInUserProfile } = useDepot();
  const currentUserName = loggedInUserProfile?.fullName || loggedInUserProfile?.username || '';
  // Lệnh vệ sinh đã có trên backend (CleaningRecord) — nguồn dữ liệu thật, nạp qua GET /api/cleaning.
  const [backendRecords, setBackendRecords] = useState<CleaningExecutionRecord[]>([]);
  // DM Loại Container + Biểu Phí Vệ Sinh thật từ backend (trước đây dùng danh sách loại container mẫu).
  const [containerTypes, setContainerTypes] = useState<ContainerTypeMasterItem[]>([]);
  const [cleaningTariffs, setCleaningTariffs] = useState<CleaningTariffMasterItem[]>([]);
  useEffect(() => {
    fetchContainerTypes().then(setContainerTypes).catch(() => setContainerTypes([]));
    fetchCleaningTariffs().then(setCleaningTariffs).catch(() => setCleaningTariffs([]));
  }, []);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const response = await cleaningApi.getAll();
      setBackendRecords((response.data || []).map(mapCleaningRecordDto));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không thể tải danh sách lệnh vệ sinh từ hệ thống.');
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Container đã được Surveyor đánh dấu CL nhưng CHƯA có lệnh vệ sinh (CleaningRecord) trên backend —
  // hiển thị tạm để nhắc "chờ tiếp nhận vào bệ rửa", không có checklist/cước phí cho tới khi tạo lệnh thật.
  const pendingIntakePlaceholders = useMemo<CleaningExecutionRecord[]>(() => {
    const takenContainerNos = new Set(backendRecords.map((r) => r.containerNo));
    return containers
      .filter((container) => container.condition === 'CL' && !takenContainerNos.has(container.containerNo))
      .map((container) => ({
        id: String(container.id), containerId: String(container.id), containerNo: container.containerNo,
        isoCode: container.isoCode, size: container.size, type: container.type,
        shippingLine: container.shippingLine, owner: container.shippingLine, surveyNo: '', eeirNo: '',
        cleaningBay: 'Chờ chỉ định bệ rửa', status: 'PENDING_CLEANING' as const, surveyCondition: 'CL' as const,
        cleaningStaff: '', waterPressureBar: 200, targetQualityGrade: 'GRADE_A' as const, beforeCleaningPhoto: '',
        beforePhotoTimestamp: container.gateInDate, afterCleaningPhoto: '', afterPhotoTimestamp: '', items: [], totalCost: 0
      }));
  }, [containers, backendRecords]);

  const orders = useMemo(() => [...backendRecords, ...pendingIntakePlaceholders], [backendRecords, pendingIntakePlaceholders]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [staffFilter, setStaffFilter] = useState<string>('ALL');
  const [historyViewMode, setHistoryViewMode] = useState<'table' | 'cards'>('table');
  const selectedStaff = currentUserName;
  const [successToast, setSuccessToast] = useState<{ contNo: string; message: string } | null>(null);
  const [certificateModalOrder, setCertificateModalOrder] = useState<CleaningExecutionRecord | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);
  // Bấm "Tiếp Nhận Ngay" trên 1 thẻ placeholder cụ thể thì điền sẵn số container/loại/hãng tàu — tránh
  // người dùng phải tự gõ lại tay (dễ gõ sai số container, tạo lệch với hồ sơ đã có).
  const [intakePrefill, setIntakePrefill] = useState<{ containerNo: string; typeCode?: string; shippingLine?: string } | null>(null);

  // Filter list
  const pendingList = orders.filter(
    (o) => o.status === 'PENDING_CLEANING' || o.status === 'IN_CLEANING'
  );
  const completedList = orders.filter(
    (o) => o.status === 'CLEANED' || o.status === 'HANDOVER_TO_OPERATION'
  );

  // Calculation for History metrics
  const totalRevenue = completedList.reduce((acc, curr) => acc + curr.totalCost, 0);
  const highGradeCount = completedList.filter(
    (o) => o.targetQualityGrade === 'GRADE_A' || o.targetQualityGrade === 'FOOD_GRADE'
  ).length;
  const gradeRate = completedList.length > 0 ? Math.round((highGradeCount / completedList.length) * 100) : 100;

  // Filtered List based on active tab
  const currentList = activeTab === 'PENDING' ? pendingList : completedList;
  const filteredList = currentList.filter((o) => {
    const matchesSearch =
      o.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.eeirNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.cleaningStaff && o.cleaningStaff.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === 'ALL' ||
      o.size.includes(typeFilter) ||
      (o.type && o.type.toLowerCase().includes(typeFilter.toLowerCase())) ||
      (o.isoCode && o.isoCode.toLowerCase().includes(typeFilter.toLowerCase()));

    const matchesGrade = gradeFilter === 'ALL' || o.targetQualityGrade === gradeFilter;
    const matchesStaff = staffFilter === 'ALL' || (o.cleaningStaff && o.cleaningStaff.includes(staffFilter));

    return matchesSearch && matchesType && matchesGrade && matchesStaff;
  });

  // Toggle individual item completion — chỉ áp dụng cho lệnh đã có trên backend (có checklist thật).
  const handleToggleItem = (orderId: string, itemId: string) => {
    const order = backendRecords.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!order?.backendId || !item?.backendId) return;

    cleaningApi.toggleItem(order.backendId, item.backendId, !item.isCompleted, selectedStaff)
      .then((response) => {
        const updated = mapCleaningRecordDto(response.data);
        setBackendRecords((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      })
      .catch((error) => {
        setSuccessToast({ contNo: order.containerNo, message: error instanceof Error ? error.message : 'Không thể cập nhật hạng mục vệ sinh.' });
      });
  };

  // Mark all items done for a container
  const handleSelectAllItems = (orderId: string) => {
    const order = backendRecords.find((o) => o.id === orderId);
    if (!order?.backendId) return;

    cleaningApi.completeAllItems(order.backendId, selectedStaff)
      .then((response) => {
        const updated = mapCleaningRecordDto(response.data);
        setBackendRecords((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      })
      .catch((error) => {
        setSuccessToast({ contNo: order.containerNo, message: error instanceof Error ? error.message : 'Không thể cập nhật hạng mục vệ sinh.' });
      });
  };

  // Change target grade
  const handleChangeGrade = (
    orderId: string,
    grade: 'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE'
  ) => {
    const order = backendRecords.find((o) => o.id === orderId);
    if (!order?.backendId) return;

    setBackendRecords((prev) => prev.map((o) => (o.id === orderId ? { ...o, targetQualityGrade: grade } : o)));
    cleaningApi.updateExecution(order.backendId, { targetQualityGrade: grade }).catch((error) => {
      setSuccessToast({ contNo: order.containerNo, message: error instanceof Error ? error.message : 'Không thể lưu phân hạng Grade.' });
    });
  };

  // Complete and Handover to Operation (AV)
  const handleFinishAndHandover = (order: CleaningExecutionRecord) => {
    if (!order.backendId) return;

    // Backend tự chuyển DepotJob.Status → READY_FOR_OUT ngay trong CleaningService.HandoverAsync (cùng
    // transaction với CleaningRecord) — trước đây frontend tự gọi thêm containerApi.updateStatus bằng
    // order.containerId (thực ra là containerNo dạng chuỗi, không phải DepotJob.Id dạng số mà route
    // /DepotJobs/{id}/status yêu cầu) nên luôn 404 âm thầm, khiến job kẹt ở CLEANING dù lệnh vệ sinh đã
    // báo hoàn tất và Gate-Out sau đó luôn bị từ chối.
    cleaningApi.handover(order.backendId, selectedStaff)
      .then((response) => {
        const updated = mapCleaningRecordDto(response.data);
        setBackendRecords((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

        if (onCompleteCleaning) {
          onCompleteCleaning(order.containerNo, {
            qualityGrade: updated.targetQualityGrade || 'GRADE_A',
            cleaningStaff: selectedStaff,
            notes: `Đã vệ sinh sạch hoàn tất (${updated.items.map((i) => i.cleaningName).join(', ')}). Đạt chuẩn ${updated.targetQualityGrade}.`,
            totalCost: updated.totalCost
          });
        }

        setSuccessToast({
          contNo: order.containerNo,
          message: `Đã hoàn tất vệ sinh container ${order.containerNo} và chuyển sang Khai Thác (Trạng thái AV - Sẵn sàng cấp trả)!`
        });
        setTimeout(() => setSuccessToast(null), 6000);
      })
      .catch((error: any) => {
        // Backend trả lý do chi tiết thật (vd. "Còn 2/3 hạng mục chưa hoàn thành...") qua HTTP 400 — axios
        // tự throw trước khi tới đây nên error.message mặc định chỉ là "Request failed with status code
        // 400" chung chung (giống bug đã sửa ở modal Tiếp Nhận), không phải lý do thật backend từ chối.
        const body = error?.response?.data;
        const detail = [body?.message, body?.data].filter((v: any) => typeof v === 'string' && v).join(': ');
        setSuccessToast({ contNo: order.containerNo, message: detail || (error instanceof Error ? error.message : 'Không thể bàn giao lệnh vệ sinh.') });
      });
  };

  const getGradeBadge = (grade?: string) => {
    switch (grade) {
      case 'FOOD_GRADE':
        return (
          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            Food Grade (Thực Phẩm)
          </span>
        );
      case 'GRADE_A':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Grade A (Xuất Khẩu)
          </span>
        );
      case 'GENERAL_CARGO':
        return (
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
            General Cargo (Bách Hóa)
          </span>
        );
      case 'SCRAP_GRADE':
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
            Scrap Grade (Phế Liệu)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold">
            Grade A
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Lỗi tải danh sách lệnh vệ sinh từ backend */}
      {loadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-xs">
          <span>{loadError}</span>
          <button type="button" onClick={fetchRecords} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition cursor-pointer shrink-0">
            Thử lại
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 text-sm">{successToast.message}</span>
              <p className="text-xs text-emerald-600 mt-0.5">
                Vỏ container đã chuyển sang phân loại AV và sẵn sàng cấp hàng tại cổng Gate-Out.
              </p>
            </div>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('operation')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>Xem Khai Thác</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-2xl shadow-inner">
            <Droplets className="w-7 h-7 text-cyan-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {activeTab === 'PENDING'
                  ? 'DANH SÁCH CONTAINER CẦN VỆ SINH (TO-DO LIST)'
                  : 'LỊCH SỬ CONTAINER ĐÃ VỆ SINH & BÀN GIAO KHAI THÁC (AV)'}
              </h2>
              <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 font-mono text-[10px] font-bold rounded-md border border-cyan-200">
                Tổ Vệ Sinh Bãi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'PENDING'
                ? 'Nhận danh mục dịch vụ từ e-EIR • Thực hiện xịt rửa, bóc tem, quét dọn • Bấm hoàn tất để bàn giao sang Khai Thác (AV).'
                : 'Tra cứu nhật ký nghiệm thu vệ sinh, đơn giá cước phí, cấp chất lượng Grade và chứng từ bàn giao sang Khai Thác.'}
            </p>
          </div>
        </div>

        {/* Action button & Staff selector when in Pending */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIntakePrefill(null);
              setIsIntakeModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg  transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tiếp Nhận Cont Vào Bệ</span>
          </button>

          {activeTab === 'PENDING' && (
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 text-xs">
              <User className="w-4 h-4 text-cyan-600 shrink-0 ml-1" />
              <span className="text-slate-500 text-[11px]">KTV:</span>
              {/* KTV = tài khoản đang đăng nhập — trước đây là dropdown 3 tên nhân viên gõ cứng. */}
              <span className="text-slate-900 font-bold pr-1">{selectedStaff || '—'}</span>
            </div>
          )}
        </div>
      </div>

      {/* History Summary Metric Cards (Visible when activeTab === 'COMPLETED') */}
      {activeTab === 'COMPLETED' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Đã Vệ Sinh Xong</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{completedList.length} <span className="text-xs font-normal text-slate-500">container</span></p>
            <p className="text-[11px] text-emerald-600 font-medium">100% đã chuyển sang AV</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Tổng Cước Vệ Sinh</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600 font-mono">{totalRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span></p>
            <p className="text-[11px] text-slate-500 font-medium">Tính theo biểu phí Depot</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Đạt Grade A / Food Grade</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-600 font-mono">{highGradeCount} <span className="text-xs font-normal text-slate-500">vỏ ({gradeRate}%)</span></p>
            <p className="text-[11px] text-purple-700 font-medium">Đạt chuẩn cấp đóng hàng</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Trạng Thái Cấp Trả</span>
              <CheckCheck className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-xl font-black text-cyan-600 font-mono mt-1">SẴN SÀNG (AV)</p>
            <p className="text-[11px] text-cyan-600 font-medium">Cấp trả Gate-Out ngay</p>
          </div>
        </div>
      )}

      {/* Tabs Switcher & Search & Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main 2 Tabs: Pending vs Completed History */}
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200 w-fit shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md '
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Danh Sách Cần Vệ Sinh</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono rounded-full font-bold ${
                  activeTab === 'PENDING' ? 'bg-white/20 text-slate-900' : 'bg-slate-100 text-amber-600'
                }`}
              >
                {pendingList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'COMPLETED'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md '
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>Lịch Sử Đã Vệ Sinh (Đã Bàn Giao AV)</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono rounded-full font-bold ${
                  activeTab === 'COMPLETED' ? 'bg-white/20 text-slate-900' : 'bg-slate-100 text-emerald-600'
                }`}
              >
                {completedList.length}
              </span>
            </button>
          </div>

          {/* Search box & filter controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm Container No, hãng tàu, e-EIR..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Container Type Filter populated from Container Types Master */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-cyan-700 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tất cả Loại Cont (Danh mục chuẩn)</option>
              {containerTypes.map((ct) => (
                <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                  {ct.typeCode} ({ct.isoCode}) - {ct.vietnameseName.split('(')[0]}
                </option>
              ))}
            </select>

            {/* Extra filters for History Tab */}
            {activeTab === 'COMPLETED' && (
              <>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">Tất cả phân hạng (Grade)</option>
                  <option value="GRADE_A">Grade A (Xuất khẩu)</option>
                  <option value="FOOD_GRADE">Food Grade (Thực phẩm)</option>
                  <option value="GENERAL_CARGO">General Cargo (Bách hóa)</option>
                  <option value="SCRAP_GRADE">Scrap Grade (Phế liệu)</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setHistoryViewMode('table')}
                    title="Xem dạng Bảng"
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      historyViewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryViewMode('cards')}
                    title="Xem dạng Thẻ"
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      historyViewMode === 'cards' ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: TAB PENDING (Danh Sách Cần Vệ Sinh - To-do List) */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4">
          {isLoadingRecords ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500">
              <RefreshCw className="w-6 h-6 text-cyan-600 mx-auto mb-2 animate-spin" />
              <p className="text-xs font-semibold">Đang tải danh sách lệnh vệ sinh...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 space-y-3">
              <Droplets className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-sm text-slate-700">
                Không có container nào đang chờ vệ sinh!
              </p>
              <p className="text-xs text-slate-500">
                Khi Surveyor giám định xếp loại CL (Cần Vệ Sinh) trên e-EIR, container sẽ tự động xuất hiện tại đây.
              </p>
            </div>
          ) : (
            filteredList.map((order) => {
              const completedCount = order.items.filter((i) => i.isCompleted).length;
              const totalItems = order.items.length;

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-3xl border border-slate-200 hover:border-cyan-200 bg-white transition-all shadow-xl space-y-4"
                >
                  {/* Card Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-cyan-600">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-lg tracking-wider">
                            {order.containerNo}
                          </span>
                          <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 font-mono text-xs font-bold rounded-lg border border-cyan-200">
                            {order.size} {order.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>Hãng tàu: <strong className="text-slate-700">{order.shippingLine}</strong></span>
                          <span>&bull;</span>
                          <span>Số e-EIR: <strong className="text-cyan-600 font-mono">{order.eeirNo}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Cước Vệ Sinh:</span>
                        <span className="text-base font-black font-mono text-amber-600">
                          {order.totalCost.toLocaleString('vi-VN')} đ
                        </span>
                      </div>

                      <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>CẦN VỆ SINH</span>
                      </span>
                    </div>
                  </div>

                  {/* Lý do/ghi chú cần vệ sinh — surveyor ghi khi Hoàn Tất Giám Định (bụi bẩn/dầu mỡ/mùi...
                      + ghi chú tự do), Tổ Vệ Sinh cần thấy ngay lý do trước khi bắt tay vào việc. */}
                  {order.cleaningNotes && (
                    <div className="p-3 bg-amber-50 border border-amber-200/40 rounded-2xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-700">Lý do / Ghi chú cần vệ sinh: </span>
                        <span className="text-slate-700">{order.cleaningNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* Container CHƯA có lệnh vệ sinh thật trên backend (chỉ là placeholder suy ra từ
                      Survey.condition === 'CL', hiếm gặp — luồng chính đã tự sinh lệnh vệ sinh ngay khi
                      Hoàn Tất Giám Định). Trước đây vẫn hiện đủ checklist rỗng + nút "HOÀN TẤT VỆ SINH..."
                      như hàng thật, nhưng bấm vào không có phản hồi gì (mọi handler đều cần `backendId`,
                      im lặng return sớm) — không lỗi, không hướng dẫn, người dùng không biết phải làm gì. */}
                  {!order.backendId ? (
                    <div className="p-4 bg-amber-50 border border-amber-200/40 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-amber-200">
                          Container này đã được Surveyor xếp loại CL nhưng <strong>chưa có lệnh vệ sinh</strong> trên
                          hệ thống (chưa tính cước, chưa có checklist). Bấm nút bên dưới để tiếp nhận vào bệ rửa
                          trước khi thao tác.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIntakePrefill({
                            containerNo: order.containerNo,
                            typeCode: order.size,
                            shippingLine: order.shippingLine
                          });
                          setIsIntakeModalOpen(true);
                        }}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>TIẾP NHẬN {order.containerNo} VÀO BỆ RỬA NGAY</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Tasks Checklist */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-600" />
                            <span>Danh mục dịch vụ cần làm ({completedCount}/{totalItems} hoàn thành):</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectAllItems(order.id)}
                            className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold cursor-pointer underline"
                          >
                            {completedCount === totalItems ? 'Bỏ chọn tất cả' : 'Đánh dấu xong tất cả'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleToggleItem(order.id, item.id)}
                              className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs cursor-pointer ${
                                item.isCompleted
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-200'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate max-w-[280px]">
                                {item.isCompleted ? (
                                  <div className="p-1 bg-emerald-500 text-slate-950 rounded-lg">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="p-1 bg-slate-100 text-slate-500 rounded-lg">
                                    <Square className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-mono font-bold text-cyan-600 mr-1.5">[{item.cleaningCode}]</span>
                                  <span className={`font-semibold ${item.isCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>
                                    {item.cleaningName}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {item.chemicalRequired && (
                                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-mono text-[10px] font-bold rounded border border-purple-200/40">
                                    Hóa chất
                                  </span>
                                )}
                                <span className="font-mono font-bold text-amber-600 text-xs">
                                  {item.totalPrice.toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rating Grade & Finish Button */}
                      <div className="pt-3 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Nghiệm thu phân hạng Grade:</span>
                          </span>
                          <select
                            value={order.targetQualityGrade || 'GRADE_A'}
                            onChange={(e) => handleChangeGrade(order.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-emerald-600 font-bold text-xs focus:outline-none focus:border-cyan-500"
                          >
                            <option value="GRADE_A">Grade A - Đạt Chuẩn Xuất Khẩu Cao Cấp</option>
                            <option value="FOOD_GRADE">Food Grade - Nông Sản / Thực Phẩm</option>
                            <option value="GENERAL_CARGO">General Cargo - Hàng Bách Hóa</option>
                            <option value="SCRAP_GRADE">Scrap Grade - Hàng Phế Liệu</option>
                          </select>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {/* Backend giờ chặn cứng bàn giao khi còn hạng mục chưa xong (không còn tự động
                              đánh dấu hết giùm như trước) — khoá luôn nút ở đây để KTV thấy ngay lý do
                              không bấm được, thay vì bấm xong mới nhận lỗi từ server. */}
                          <button
                            type="button"
                            disabled={totalItems === 0 || completedCount < totalItems}
                            onClick={() => handleFinishAndHandover(order)}
                            title={
                              totalItems === 0
                                ? 'Chưa có hạng mục dịch vụ vệ sinh nào'
                                : completedCount < totalItems
                                ? `Còn ${totalItems - completedCount}/${totalItems} hạng mục chưa hoàn thành`
                                : undefined
                            }
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none text-white font-black text-xs rounded-2xl shadow-xl  transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-5 h-5 text-slate-900" />
                            <span>HOÀN TẤT VỆ SINH &amp; CHUYỂN QUA KHAI THÁC (AV)</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          {(totalItems === 0 || completedCount < totalItems) && (
                            <span className="text-[11px] text-amber-600 font-semibold">
                              Còn {totalItems - completedCount}/{totalItems} hạng mục chưa hoàn thành — đánh dấu xong hết mới bàn giao được.
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: TAB COMPLETED (LỊCH SỬ ĐÃ VỆ SINH & BÀN GIAO AV) */}
      {activeTab === 'COMPLETED' && (
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 space-y-3">
              <History className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-sm text-slate-700">
                Không tìm thấy container nào trong lịch sử vệ sinh phù hợp với bộ lọc!
              </p>
              <p className="text-xs text-slate-500">
                Hãy thử xóa bớt từ khóa tìm kiếm hoặc chọn lại phân hạng Grade.
              </p>
            </div>
          ) : historyViewMode === 'table' ? (
            /* Table View of History */
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Container No / ISO</th>
                      <th className="py-3.5 px-3">Hãng Tàu / e-EIR</th>
                      <th className="py-3.5 px-3">Kỹ Thuật Viên Thi Công</th>
                      <th className="py-3.5 px-3">Thời Gian Hoàn Tất</th>
                      <th className="py-3.5 px-3">Hạng Mục Đã Làm</th>
                      <th className="py-3.5 px-3">Phân Hạng (Grade)</th>
                      <th className="py-3.5 px-3">Cước Phí</th>
                      <th className="py-3.5 px-3">Trạng Thái Bàn Giao</th>
                      <th className="py-3.5 px-4 text-right">Biên Bản</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-sans">
                    {filteredList.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-100 transition cursor-pointer"
                        onClick={() => setCertificateModalOrder(order)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm tracking-wider">
                              {order.containerNo}
                            </span>
                            <span className="px-1.5 py-0.2 bg-slate-100 text-cyan-700 font-mono text-[9px] rounded font-bold">
                              {order.size}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{order.type}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-700 block">{order.shippingLine}</span>
                          <span className="font-mono text-[10px] text-cyan-600">{order.eeirNo}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <User className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <span>{order.cleaningStaff}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{order.completedAt || '2026-08-14 08:30'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex items-center gap-1 text-[11px] text-slate-700 truncate max-w-[200px]">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{item.cleaningName}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-[10px] text-cyan-600 font-semibold">
                                +{order.items.length - 2} hạng mục khác
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          {getGradeBadge(order.targetQualityGrade)}
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-amber-600">
                          {order.totalCost.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ĐÃ BÀN GIAO AV</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCertificateModalOrder(order);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-cyan-600 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Phiếu</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View of History */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((order) => (
                <div
                  key={order.id}
                  className="p-5 bg-white border border-emerald-200 rounded-3xl space-y-4 shadow-xl hover:border-emerald-200 transition"
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-lg">{order.containerNo}</span>
                        <span className="px-2 py-0.5 bg-slate-50 text-cyan-700 font-mono text-xs font-bold rounded-lg border border-slate-200">
                          {order.size} {order.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>Hãng tàu: <strong className="text-slate-700">{order.shippingLine}</strong></span>
                        <span>&bull;</span>
                        <span>e-EIR: <strong className="text-cyan-600 font-mono">{order.eeirNo}</strong></span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ĐÃ BÀN GIAO AV</span>
                    </span>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">KTV VỆ SINH:</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-cyan-600" />
                        {order.cleaningStaff}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HOÀN TẤT LÚC:</span>
                      <span className="font-mono font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {order.completedAt || '2026-08-14 08:30'}
                      </span>
                    </div>
                  </div>

                  {/* Checklist Summary */}
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hạng mục đã hoàn thành ({order.items.length}):</span>
                    </span>
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 flex items-center gap-1.5 truncate max-w-[260px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>[{item.cleaningCode}] {item.cleaningName}</span>
                          </span>
                          <span className="font-mono text-amber-600 font-bold">{item.totalPrice.toLocaleString('vi-VN')} đ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Grade & Actions */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      {getGradeBadge(order.targetQualityGrade)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-600 text-sm">
                        {order.totalCost.toLocaleString('vi-VN')} đ
                      </span>
                      <button
                        type="button"
                        onClick={() => setCertificateModalOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Phiếu</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: BIÊN BẢN / PHIẾU NGHIỆM THU VỆ SINH CONTAINER */}
      {certificateModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-cyan-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-2xl border border-cyan-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">PHIẾU NGHIỆM THU VỆ SINH CONTAINER</h3>
                  <p className="text-xs text-slate-500 font-mono">Mã số: {certificateModalOrder.id} • e-EIR: {certificateModalOrder.eeirNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCertificateModalOrder(null)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Printable Certificate Form */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* General Container Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Số Container:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{certificateModalOrder.containerNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Kích Thước / Loại Vỏ:</span>
                  <span className="font-mono font-bold text-cyan-600">{certificateModalOrder.size} {certificateModalOrder.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Hãng Tàu Sở Hữu:</span>
                  <span className="font-bold text-slate-700">{certificateModalOrder.shippingLine}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Kỹ Thuật Viên:</span>
                  <span className="font-semibold text-slate-700">{certificateModalOrder.cleaningStaff}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Thời Gian Bàn Giao:</span>
                  <span className="font-mono font-semibold text-slate-700">{certificateModalOrder.completedAt || '2026-08-14 08:30'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Cấp Chất Lượng:</span>
                  <div>{getGradeBadge(certificateModalOrder.targetQualityGrade)}</div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span>Thông Số Kỹ Thuật Thi Công Vệ Sinh:</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Áp lực nước xịt rửa:</span>
                    <strong className="text-cyan-700 font-mono">{certificateModalOrder.waterPressureBar || 200} Bar</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Hóa chất xử lý:</span>
                    <strong className="text-purple-700 truncate block">{certificateModalOrder.chemicalUsed || 'Nước sạch + Dung dịch khử khuẩn'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nhiệt độ sấy / khử khuẩn:</span>
                    <strong className="text-amber-700 font-mono">{certificateModalOrder.temperatureCelsius || 60}°C</strong>
                  </div>
                </div>
              </div>

              {/* Table of Completed Items */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 text-xs">Chi Tiết Hạng Mục Dịch Vụ Đã Nghiệm Thu:</span>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Mã DV</th>
                        <th className="py-2.5 px-3">Hạng Mục Công Việc</th>
                        <th className="py-2.5 px-3">Thời Gian</th>
                        <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 font-sans">
                      {certificateModalOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-cyan-600">[{item.cleaningCode}]</td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{item.cleaningName}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.completedAt || '08:30'}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                            {item.totalPrice.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-white font-bold">
                        <td colSpan={3} className="py-3 px-3 text-right text-slate-900">TỔNG CỘNG CƯỚC VỆ SINH:</td>
                        <td className="py-3 px-3 text-right font-mono text-amber-600 text-sm">
                          {certificateModalOrder.totalCost.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verification & Signatures */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center pt-3 pb-6">
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold">KỸ THUẬT VIÊN THI CÔNG</span>
                  <span className="text-slate-500 text-[10px]">(Ký và ghi rõ họ tên)</span>
                  <div className="mt-8 font-bold text-cyan-600">{certificateModalOrder.cleaningStaff}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-bold">ĐIỀU ĐỘ / KHAI THÁC TIẾP NHẬN (AV)</span>
                  <span className="text-slate-500 text-[10px]">(Đã kiểm tra sạch sẽ đạt chuẩn)</span>
                  <div className="mt-8 font-bold text-emerald-600">Đã Xác Nhận Nhập Bãi AV</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between gap-3">
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Trạng thái: Đã cập nhật vào cơ sở dữ liệu Khai Thác Bãi</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-cyan-600" />
                  <span>In Phiếu Nghiệm Thu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCertificateModalOrder(null)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Cleaning Intake Modal linked to Container Types Catalog */}
      <NewCleaningIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        prefill={intakePrefill}
        onAddCleaningOrder={(newOrd) => {
          setBackendRecords((prev) => [newOrd, ...prev]);
          setSuccessToast({
            contNo: newOrd.containerNo,
            message: `Đã tiếp nhận container ${newOrd.containerNo} (${newOrd.size}) vào hàng đợi bệ rửa thành công!`
          });
          setTimeout(() => setSuccessToast(null), 5000);
        }}
        containerTypes={containerTypes}
        cleaningTariffs={cleaningTariffs}
      />
    </div>
  );
};
