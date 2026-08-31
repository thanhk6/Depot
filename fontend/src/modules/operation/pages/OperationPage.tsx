import React, { useEffect, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { containerApi, serviceOrderApi, paymentApi } from '../../../api';
import { ServiceOrder } from '../types';
import { ServiceOrderListTable } from '../components/ServiceOrderListTable';
import { GateInQueueTable } from '../components/GateInQueueTable';
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
  onConfirmPayment?: (containerId: string) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const OperationPage: React.FC<OperationPageProps> = ({
  containers = [],
  onAddServiceOrder,
  onConfirmPayment,
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
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'queue' | 'tariff'>('orders');

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

  // Containers waiting for service order (surveyed containers)
  const queueContainers = containers.filter(
    (c) => c.status === 'SURVEYING' || c.status === 'GATE_IN' || c.status === 'WAITING_PAYMENT'
  );

  const handleOpenCreateForContainer = (container: ContainerRecord) => {
    setSelectedPrefillContainer(container);
    setIsCreateModalOpen(true);
  };

  const handleCreateNewBlank = () => {
    setSelectedPrefillContainer(null);
    setIsCreateModalOpen(true);
  };

  const handleSaveOrder = async (newOrder: ServiceOrder) => {
    const jobResponse: any = await containerApi.getById(newOrder.containerNo);
    if (jobResponse?.statusCode !== 200 || !jobResponse.data?.jobNo) {
      throw new Error('Không tìm thấy Job SQL cho container này.');
    }
    const response: any = await serviceOrderApi.create({
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
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể lưu phiếu dịch vụ.');
    setOrders([newOrder, ...orders]);
    if (onAddServiceOrder) {
      onAddServiceOrder(newOrder);
    }
  };

  // Trước đây chỉ setState cục bộ (không gọi API nào) — trạng thái "PAID" hiển thị trên UI là ảo, DB thật
  // (ServiceOrder/Payment/DepotJob.Status) vẫn UNPAID, mất khi F5. `paymentApi.processPayment` yêu cầu
  // DepotJob.Id dạng số (route `{jobId:long}`), nên phải tra qua `containers` (prop thật, có id số) theo
  // containerNo — ServiceOrder không tự mang theo id này.
  const [markPaidError, setMarkPaidError] = useState<string | null>(null);

  const handleMarkPaid = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const container = containers.find((c) => c.containerNo === order.containerNo);
    if (!container) {
      setMarkPaidError('Không tìm thấy hồ sơ container để ghi nhận thanh toán.');
      return;
    }

    setMarkPaidError(null);
    try {
      // Nút "Đánh Dấu Đã Thanh Toán" trong Operation là lối tắt thu tiền mặt trực tiếp tại quầy (không
      // qua VietQR) — nếu cần thanh toán VietQR thật, dùng "Chuyển Qua Mục Thanh Toán" sang PaymentPage.
      const transactionRef = 'CASH-' + Date.now();
      const response: any = await paymentApi.processPayment(container.id, 'CASH', transactionRef, order.grandTotal);
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể ghi nhận thanh toán.');

      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const updated: ServiceOrder = {
        ...order,
        paymentStatus: 'PAID',
        status: 'PAID',
        paidAt: now,
        paymentMethod: 'CASH',
        transactionId: transactionRef
      };
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      if (onConfirmPayment) {
        onConfirmPayment(container.id);
      }
    } catch (error) {
      setMarkPaidError(error instanceof Error ? error.message : 'Không thể ghi nhận thanh toán xuống hệ thống.');
    }
  };

  const handleViewExistingTicket = (orderNo: string) => {
    const found = orders.find((o) => o.orderNo === orderNo);
    if (found) {
      setSelectedOrder(found);
      setIsDetailModalOpen(true);
    }
  };

  const handleViewDetail = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order?.orderNo) return;
    const response: any = await serviceOrderApi.cancel(orderId);
    if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể huỷ phiếu dịch vụ.');
    const updated: ServiceOrder = { ...order, status: 'CANCELLED' };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-cyan-600/30">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] font-bold rounded-md">
                3. QUY TRÌNH NGHIỆP VỤ
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                3. KHAI THÁC GATE-IN (GATE-IN OPERATION)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tiếp nhận dữ liệu từ Giám Định & Vệ Sinh &bull; Lập Phiếu Dịch Vụ theo Biểu Phí Tariff (Nâng hạ, Lưu bãi, Vệ sinh...) &bull; Tạo Mã QR &bull; Chuyển Thanh Toán
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateTab && onNavigateTab('payment')}
            className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-700 font-bold text-xs rounded-xl border border-purple-500/30 transition flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Màn Hình Thanh Toán VietQR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCreateNewBlank}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lập Phiếu Dịch Vụ Mới</span>
          </button>
        </div>
      </div>

      {/* Mark Paid Error Banner */}
      {markPaidError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700 shadow-lg">
          <span className="font-bold">{markPaidError}</span>
          <button onClick={() => setMarkPaidError(null)} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

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
            <span>Hàng Đợi Tiếp Nhận Giám Định</span>
            <FileCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {queueContainers.length}
          </div>
          <div className="text-[11px] text-amber-700/80">Container có kết quả e-EIR</div>
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

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
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
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'queue'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Hàng Đợi Tiếp Nhận Từ Giám Định ({queueContainers.length})</span>
          {queueContainers.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
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
          onMarkPaid={handleMarkPaid}
          onNavigateToPayment={(cId) => onNavigateTab && onNavigateTab('payment')}
        />
      )}

      {activeSubTab === 'queue' && (
        <GateInQueueTable
          containers={queueContainers}
          existingOrders={orders.map((o) => ({
            containerNo: o.containerNo,
            orderNo: o.orderNo,
            paymentStatus: o.paymentStatus
          }))}
          onOpenCreateTicket={handleOpenCreateForContainer}
          onViewExistingTicket={handleViewExistingTicket}
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
        onSaveAndNavigateToPayment={async (order) => {
          // await bắt buộc: nếu handleSaveOrder throw (backend từ chối), lỗi phải nổi lên tới catch trong
          // ServiceOrderFormModal để hiện banner lỗi — trước đây gọi không await nên luôn điều hướng sang
          // Thanh Toán bất kể lưu thành công hay thất bại.
          await handleSaveOrder(order);
          if (onNavigateTab) {
            onNavigateTab('payment');
          }
        }}
        prefillContainer={selectedPrefillContainer}
      />

      <ServiceOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onMarkPaid={handleMarkPaid}
        onNavigateToPayment={(cId) => onNavigateTab && onNavigateTab('payment')}
        onCancelOrder={handleCancelOrder}
      />
    </div>
  );
};
