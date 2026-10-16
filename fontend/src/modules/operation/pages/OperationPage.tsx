import React, { useCallback, useEffect, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { containerApi, serviceOrderApi, cleaningApi } from '../../../api';
import type { CleaningRecordDto } from '../../../api/cleaning.api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { ServiceOrder } from '../types';
import { ServiceOrderListTable } from '../components/ServiceOrderListTable';
import { CleaningWatchTable } from '../components/CleaningWatchTable';
import { ServiceOrderFormModal } from '../components/ServiceOrderFormModal';
import { ServiceOrderDetailModal } from '../components/ServiceOrderDetailModal';
// "Cước Nâng Hạ & Lưu Bãi" đã tách thành 3 danh mục riêng theo yêu cầu người dùng (thay cho component
// gộp chung `LiftOnLiftOffAndStorageMaster.tsx` cũ, đã xoá) — xem docs/frontend-tariff-catalog-split.md.
// Tab "Biểu Phí Tariff Niêm Yết & Máy Tính Cước" ở đây trước đây hiển thị cả 3 phần cùng lúc, nên giữ
// nguyên bằng cách xếp chồng cả 3 component mới thay vì chỉ chọn 1.
import { LoloTariffMaster } from '../../masterdata/components/LoloTariffMaster';
import { StorageTariffMaster } from '../../masterdata/components/StorageTariffMaster';
import { TariffCalculatorPage } from '../../masterdata/components/TariffCalculatorPage';
import { formatVND } from '../../../utils/format';
import {
  Receipt,
  Plus,
  QrCode,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';

interface OperationPageProps {
  containers?: ContainerRecord[];
  onAddServiceOrder?: (order: ServiceOrder) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const OperationPage: React.FC<OperationPageProps> = ({
  containers = [],
  onAddServiceOrder,
  onNavigateTab
}) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    serviceOrderApi.getAll()
      .then((response: any) => {
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          setOrders(response.data as ServiceOrder[]);
        }
      })
      .catch((error) => console.warn('Không thể tải ServiceOrder từ SQL Server:', error));
  }, []);

  // Theo dõi Tổ Vệ Sinh: lệnh vệ sinh chưa bàn giao (chỉ xem, để đôn đốc) + lệnh đã bàn giao Khai thác nhưng
  // container chưa có phiếu dịch vụ (Khai thác cần lập phiếu).
  const [allCleanings, setAllCleanings] = useState<CleaningRecordDto[]>([]);
  const [cleaningLoading, setCleaningLoading] = useState(false);
  const [cleaningError, setCleaningError] = useState<string | null>(null);
  const [cleaningLoadedAt, setCleaningLoadedAt] = useState<Date | null>(null);
  const loadActiveCleanings = useCallback(async () => {
    setCleaningLoading(true);
    try {
      const response: any = await cleaningApi.getAll();
      const list: CleaningRecordDto[] = Array.isArray(response?.data) ? response.data : [];
      setAllCleanings(list);
      setCleaningError(null);
      setCleaningLoadedAt(new Date());
    } catch (error) {
      setCleaningError(getApiErrorMessage(error, 'Không tải được danh sách vệ sinh.'));
    } finally {
      setCleaningLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadActiveCleanings();
    const timer = setInterval(() => void loadActiveCleanings(), 60000);
    return () => clearInterval(timer);
  }, [loadActiveCleanings]);
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'queue' | 'tariff'>('queue');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPrefillContainer, setSelectedPrefillContainer] = useState<any>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Stats calculation
  const totalOrders = orders.length;
  const totalAmountCalculated = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  // Mã dịch vụ vệ sinh thật (CLEAN_SWEEP, CLEAN_WASH_200BAR...) không chứa chuỗi con 'CLN' — so theo
  // `category` (enum nghiệp vụ) thay vì đoán qua serviceCode, tránh KPI luôn hiện 0 dù có dữ liệu thật.
  const cleaningOrdersCount = orders.filter((o) => o.items.some((i) => i.category === 'CLEANING')).length;

  // Container còn trong bãi (chưa Gate-Out) — lệnh vệ sinh của container đã xuất không cần theo dõi nữa.
  const activeContainerByNo = new Map(containers.filter((c) => c.status !== 'GATE_OUT').map((c) => [c.containerNo, c]));
  const activeCleanings = allCleanings.filter((r) => r.status !== 'HANDOVER_TO_OPERATION');
  // Đã bàn giao nhưng chưa có phiếu dịch vụ nào lập SAU thời điểm bàn giao cho container đó.
  // Mỗi hồ sơ (DepotJob) chỉ có 1 phiếu dịch vụ — hồ sơ đã có phiếu (kể cả đã huỷ / đã thu) thì không còn "chờ lập".
  // Trước đây so theo ngày lập phiếu với ngày bàn giao nên container đã có phiếu vẫn hiện, bấm lập thì lỗi 400.
  const jobHasOrder = (jobId: string, containerNo: string) =>
    orders.some((o: any) => (o.depotJobId != null ? String(o.depotJobId) === String(jobId) : o.containerNo === containerNo));
  const handedOverAwaitingOrder = allCleanings
    .filter((r) => r.status === 'HANDOVER_TO_OPERATION' && activeContainerByNo.has(r.containerNo))
    .filter((r) => !jobHasOrder(activeContainerByNo.get(r.containerNo)!.id, r.containerNo))
    // mỗi container chỉ 1 dòng (lệnh bàn giao mới nhất)
    .filter((r, idx, arr) => arr.findIndex((x) => x.containerNo === r.containerNo) === idx);
  const watchCount = activeCleanings.length + handedOverAwaitingOrder.length;

  // Lập phiếu dịch vụ cho container vừa vệ sinh xong — điền sẵn chi phí vệ sinh thật của lệnh vệ sinh.
  const handleCreateFromCleaning = (rec: CleaningRecordDto) => {
    const container = activeContainerByNo.get(rec.containerNo);
    if (!container) return;
    setSelectedPrefillContainer({
      ...container,
      cleaningDetails: {
        status: 'COMPLETED',
        code: rec.code,
        cleaningType: rec.items.map((i) => i.cleaningName).join(', '),
        totalCost: Number(rec.totalCostVnd) || 0
      }
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateNewBlank = () => {
    setSelectedPrefillContainer(null);
    setIsCreateModalOpen(true);
  };

  // Trả về phiếu đã lưu với SỐ PHIẾU / ID THẬT do backend cấp (trước đây hiển thị số ngẫu nhiên trình duyệt tự sinh
  // cho tới khi F5).
  const handleSaveOrder = async (newOrder: ServiceOrder): Promise<ServiceOrder> => {
    const jobResponse: any = await containerApi.getById(newOrder.containerNo);
    if (jobResponse?.statusCode !== 200 || !jobResponse.data?.jobNo) {
      throw new Error('Không tìm thấy Job SQL cho container này.');
    }
    let response: any;
    try {
    response = await serviceOrderApi.create({
      jobNo: jobResponse.data.jobNo,
      containerNo: newOrder.containerNo,
      shippingLineCode: newOrder.shippingLine,
      isoCode: newOrder.isoCode,
      size: newOrder.size,
      type: newOrder.type,
      customerName: newOrder.customerName,
      customerTaxCode: newOrder.customerTaxCode,
      driverName: newOrder.driverName,
      truckPlate: newOrder.truckPlate,
      driverPhone: newOrder.driverPhone,
      condition: newOrder.condition,
      surveyNote: newOrder.surveyNote,
      cleaningNote: newOrder.cleaningNote,
      notes: newOrder.notes,
      items: newOrder.items.map((item) => ({
        serviceCode: item.serviceCode, serviceName: item.serviceName, category: item.category,
        quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice,
        vatPercent: item.vatPercent, remarks: item.remarks
      }))
    });
    } catch (error) {
      // Hiện đúng lý do backend trả về (vd "đã có phiếu dịch vụ SO-...") thay vì "lỗi 400".
      throw new Error(getApiErrorMessage(error, 'Không thể lưu phiếu dịch vụ.'));
    }
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể lưu phiếu dịch vụ.');
    const persisted = response.data || {};
    const saved: ServiceOrder = {
      ...newOrder,
      id: persisted.id != null ? String(persisted.id) : newOrder.id,
      ...(persisted.depotJobId != null ? { depotJobId: persisted.depotJobId } : {}),
      orderNo: persisted.orderNo || newOrder.orderNo,
      subtotal: persisted.subtotal ?? newOrder.subtotal,
      totalVat: persisted.totalVat ?? newOrder.totalVat,
      grandTotal: persisted.grandTotal ?? newOrder.grandTotal,
      createdAt: persisted.createdAt || newOrder.createdAt
    };
    setOrders((prev) => [saved, ...prev]);
    if (onAddServiceOrder) {
      onAddServiceOrder(saved);
    }
    return saved;
  };

  // Lưu & In: lưu xong mở chứng từ của phiếu vừa lưu và in ngay.
  const [autoPrintDoc, setAutoPrintDoc] = useState<'ORDER' | 'RECEIPT' | 'EEIR' | null>(null);
  const handleSaveAndPrint = async (order: ServiceOrder, document: 'ORDER' | 'RECEIPT' | 'EEIR') => {
    const saved = await handleSaveOrder(order);
    setSelectedOrder(saved);
    setAutoPrintDoc(document);
    setIsDetailModalOpen(true);
  };

  const handleViewDetail = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner — đồng bộ đúng chuẩn "Dashboard ERP Tổng Quan" (dashboard/pages/DashboardPage.tsx)
          theo yêu cầu người dùng 2026-09-06, xem docs/frontend-theme-unification.md. */}
      <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-bold font-mono">
            <Receipt className="w-3.5 h-3.5" />
            <span>3. QUY TRÌNH NGHIỆP VỤ</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Khai Thác Gate-In (Gate-In Operation)
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Tiếp nhận dữ liệu từ Giám Định &amp; Vệ Sinh &bull; Lập Phiếu Dịch Vụ theo Biểu Phí Tariff
            (Nâng hạ, Lưu bãi, Vệ sinh...) &bull; Tạo Mã QR &bull; Chuyển Thanh Toán.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => onNavigateTab && onNavigateTab('payment')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-600" />
            <span>Màn Hình Thanh Toán VietQR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCreateNewBlank}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lập Phiếu Dịch Vụ Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Tổng Phiếu Dịch Vụ</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalOrders}</div>
          <div className="text-[11px] text-slate-500">Đã phát hành tại cổng Gate-In</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Đang Chờ / Đang Vệ Sinh</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {activeCleanings.length}
          </div>
          <div className="text-[11px] text-amber-700/80">
            Theo dõi tiến độ Tổ Vệ Sinh{handedOverAwaitingOrder.length > 0 ? ` · ${handedOverAwaitingOrder.length} đã bàn giao chờ lập phiếu` : ''}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Phiếu Phát Sinh Vệ Sinh CL</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {cleaningOrdersCount} <span className="text-xs text-slate-500 font-normal">phiếu</span>
          </div>
          <div className="text-[11px] text-purple-700/80">Áp dụng xịt rửa áp lực cao</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Tổng Tiền Dịch Vụ Theo Biểu Phí</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {formatVND(totalAmountCalculated)}
          </div>
          <div className="text-[11px] text-slate-500">Tự động tính theo Tariff hãng tàu</div>
        </div>
      </div>

      {/* Vệ sinh xong & đã bàn giao — Khai thác phải thấy ngay để lập phiếu, ở bất kỳ tab nào. */}
      {handedOverAwaitingOrder.length > 0 && activeSubTab !== 'queue' && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <div className="font-bold text-sm">
                {handedOverAwaitingOrder.length} container đã vệ sinh xong, Tổ Vệ Sinh đã bàn giao — chờ Khai thác lập phiếu dịch vụ
              </div>
              <div className="font-mono mt-0.5">{handedOverAwaitingOrder.map((r) => r.containerNo).join(', ')}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSubTab('queue')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Xem &amp; Lập Phiếu
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'queue'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Lập Phiếu Dịch Vụ &amp; Theo Dõi Vệ Sinh ({watchCount})</span>
          {watchCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
              : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Danh Sách Phiếu Dịch Vụ ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tariff')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tariff'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Biểu Phí Tariff Niêm Yết & Máy Tính Cước</span>
        </button>
      </div>

      {/* Sub Tab Contents */}
      {activeSubTab === 'orders' && (
        <ServiceOrderListTable
          orders={orders}
          onViewDetail={handleViewDetail}
        />
      )}

      {activeSubTab === 'queue' && (
        <CleaningWatchTable
          records={activeCleanings}
          handedOver={handedOverAwaitingOrder}
          onCreateOrder={handleCreateFromCleaning}
          isLoading={cleaningLoading}
          loadError={cleaningError}
          lastLoadedAt={cleaningLoadedAt}
          onRefresh={() => void loadActiveCleanings()}
        />
      )}

      {activeSubTab === 'tariff' && (
        <div className="space-y-6">
          <LoloTariffMaster />
          <StorageTariffMaster />
          <TariffCalculatorPage />
        </div>
      )}

      {/* Modals */}
      <ServiceOrderFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveOrder}
        onSaveAndPrint={handleSaveAndPrint}
        prefillContainer={selectedPrefillContainer}
        selectableContainers={containers
          // Đúng thứ tự vòng đời: đã giám định xong, không còn lệnh vệ sinh dở dang, chưa có phiếu.
          .filter((c) =>
            !['GATE_OUT', 'GATE_IN', 'SURVEYING', 'CLEANING'].includes(c.status) &&
            !activeCleanings.some((r) => r.containerNo === c.containerNo) &&
            !jobHasOrder(c.id, c.containerNo))
          .map((c) => ({ id: c.id, containerNo: c.containerNo, shippingLine: c.shippingLine, size: c.size }))}
      />

      <ServiceOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        autoPrint={autoPrintDoc}
        onAutoPrinted={() => setAutoPrintDoc(null)}
      />
    </div>
  );
};
