import React, { useEffect, useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { paymentApi } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatVND } from '../../../utils/format';
import {
  QrCode,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Search,
  Filter,
  Printer,
  AlertCircle,
  Truck,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Receipt,
  DollarSign,
  Check,
  Eye,
  Banknote,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  Calculator
} from 'lucide-react';
import { VietQrCode } from '../../../components/common/VietQrCode';
import { buildTransferContent } from '../../../utils/vietqr';
import { PaymentLogTab } from '../components/PaymentLogTab';

interface PaymentPageProps {
  containers: ContainerRecord[];
  onConfirmPayment: (containerId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  containers,
  onConfirmPayment,
  onNavigateTab
}) => {
  // Navigation sub-tabs in Payment Module
  const [activeTab, setActiveTab] = useState<'PENDING_LIST' | 'PAID_HISTORY' | 'PAYMENT_LOG'>('PENDING_LIST');
  // Tăng sau mỗi lần thu để tab Nhật Ký Thanh Toán tải lại.
  const [paymentLogRefresh, setPaymentLogRefresh] = useState(0);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);

  useEffect(() => {
    paymentApi.getServiceOrders()
      .then((response: any) => {
        if (response?.statusCode === 200 && Array.isArray(response.data)) setServiceOrders(response.data);
      })
      .catch((error) => console.error('Không thể tải phiếu dịch vụ từ backend:', error));
  }, []);

  // Phiếu dịch vụ hiệu lực của container: bỏ phiếu đã huỷ, ưu tiên phiếu chưa thanh toán, rồi phiếu mới nhất.
  const getServiceOrder = (container: ContainerRecord) =>
    serviceOrders
      .filter((order) => order.containerNo === container.containerNo && order.status !== 'CANCELLED')
      .sort((a, b) =>
        (a.paymentStatus === 'UNPAID' ? 0 : 1) - (b.paymentStatus === 'UNPAID' ? 0 : 1) ||
        String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      )[0];
  const getOrderAmount = (container: ContainerRecord) => getServiceOrder(container)?.grandTotal || 0;
  const getOrderFee = (container: ContainerRecord, category: string) =>
    (getServiceOrder(container)?.items || [])
      .filter((item: any) => item.category === category)
      .reduce((sum: number, item: any) => sum + (item.total || 0), 0);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [shippingLineFilter, setShippingLineFilter] = useState('ALL');
  const [feeTypeFilter, setFeeTypeFilter] = useState('ALL');

  // Pending & Paid container collections
  const pendingContainers = useMemo(() => {
    return containers.filter(
      (c) => getServiceOrder(c)?.paymentStatus === 'UNPAID'
    );
    // serviceOrders tải bất đồng bộ sau lần render đầu — thiếu trong deps thì danh sách không bao giờ được tính lại.
  }, [containers, serviceOrders]);

  const paidContainers = useMemo(() => {
    return containers.filter(
      (c) =>
        getServiceOrder(c)?.paymentStatus === 'PAID'
    );
  }, [containers, serviceOrders]);

  // Selected container state: click a row in the list to select
  const [selectedContId, setSelectedContId] = useState<string>(
    pendingContainers[0]?.id || containers[0]?.id || ''
  );

  // Hình thức thu tại quầy: tiền mặt | chuyển khoản (thu ngân đối chiếu sao kê rồi nhập mã giao dịch).
  const [paymentMethodTab, setPaymentMethodTab] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  // Nhân viên tích sau khi đã thấy tiền về tài khoản (app / sao kê ngân hàng).
  const [transferChecked, setTransferChecked] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [lastPayment, setLastPayment] = useState<{ method: 'CASH' | 'BANK_TRANSFER'; transactionRef: string; amount: number; invoiceNo?: string | null; cashierName?: string | null; change?: number } | null>(null);

  // Cash payment specific inputs
  const [cashReceived, setCashReceived] = useState<string>('');
  const [cashNote, setCashNote] = useState<string>('Nộp trực tiếp tại quầy thu ngân cổng');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPaidCont, setLastPaidCont] = useState<ContainerRecord | null>(null);
  const [receiptModalCont, setReceiptModalCont] = useState<ContainerRecord | null>(null);

  // Selected container object
  const currentCont = containers.find((c) => c.id === selectedContId) || pendingContainers[0];
  const amount = currentCont ? getOrderAmount(currentCont) : 0;
  const liftFee = currentCont ? getOrderFee(currentCont, 'LOLO') : 0;
  const cleaningFee = currentCont ? getOrderFee(currentCont, 'CLEANING') : 0;
  const storageFee = currentCont ? getOrderFee(currentCont, 'STORAGE') : 0;
  const vatFee = currentCont ? (getServiceOrder(currentCont)?.totalVat || 0) : 0;

  // Filtered Pending List
  const filteredPendingList = useMemo(() => {
    return pendingContainers.filter((c) => {
      const matchSearch =
        c.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.driverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.shippingLine || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchShipping = shippingLineFilter === 'ALL' || c.shippingLine === shippingLineFilter;

      const matchFee =
        feeTypeFilter === 'ALL' ||
        (feeTypeFilter === 'CLEANING' && getOrderFee(c, 'CLEANING') > 0) ||
        (feeTypeFilter === 'STORAGE' && getOrderFee(c, 'STORAGE') > 0) ||
        (feeTypeFilter === 'LOLO' && getOrderFee(c, 'LOLO') > 0);

      return matchSearch && matchShipping && matchFee;
    });
  }, [pendingContainers, searchTerm, shippingLineFilter, feeTypeFilter, serviceOrders]);

  // Filtered Paid List
  const filteredPaidList = useMemo(() => {
    return paidContainers.filter((c) => {
      const matchSearch =
        c.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.driverName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.shippingLine || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchShipping = shippingLineFilter === 'ALL' || c.shippingLine === shippingLineFilter;

      return matchSearch && matchShipping;
    });
  }, [paidContainers, searchTerm, shippingLineFilter]);

  // Unique shipping lines for filter dropdown
  const shippingLines = useMemo(() => {
    const lines = new Set<string>();
    containers.forEach((c) => {
      if (c.shippingLine) lines.add(c.shippingLine);
    });
    return Array.from(lines);
  }, [containers]);

  // Total sums
  const totalPendingAmount = pendingContainers.reduce(
    (sum, c) => sum + getOrderAmount(c),
    0
  );
  const totalPaidAmount = paidContainers.reduce(
    (sum, c) => sum + getOrderAmount(c),
    0
  );

  // Ghi nhận thanh toán thật xuống backend (ServiceOrder + Payment + nhật ký). Lỗi hiện rõ trên màn hình
  // (trước đây chỉ console.error nên bấm mà không có gì xảy ra).
  const submitPayment = async (container: ContainerRecord, method: 'CASH' | 'BANK_TRANSFER') => {
    if (isProcessing) return;
    setPaymentError(null);
    if (method === 'CASH' && parsedCash < amount) {
      setPaymentError(`Tiền khách đưa chưa đủ: cần ${formatVND(amount)}.`);
      return;
    }
    if (method === 'BANK_TRANSFER' && !transferChecked) {
      setPaymentError('Tích xác nhận đã kiểm tra tiền về tài khoản trước khi gạch nợ.');
      return;
    }
    setIsProcessing(true);
    try {
      const response: any = await paymentApi.processPayment(String(container.id), method, amount, method === 'CASH'
        ? { cashReceived: parsedCash, notes: cashNote }
        : { notes: 'Khách quét VietQR / chuyển khoản, nhân viên đã kiểm tra tiền về' });
      const result = response?.data;
      const transactionRef = result?.transactionRef || '';
      setServiceOrders((orders) => orders.map((order) => order.containerNo === container.containerNo && order.paymentStatus === 'UNPAID'
        ? { ...order, status: 'PAID', paymentStatus: 'PAID', paymentMethod: method, transactionId: transactionRef, paidAt: result?.paidAt }
        : order));
      setLastPayment({
        method,
        transactionRef,
        amount: result?.amount ?? amount,
        invoiceNo: result?.invoiceNo,
        cashierName: result?.cashierName,
        change: method === 'CASH' ? cashChange : undefined
      });
      setLastPaidCont(container);
      setIsSuccess(true);
      setCashReceived('');
      setTransferChecked(false);
      onConfirmPayment(container.id);
    } catch (error) {
      setIsSuccess(false);
      setPaymentError(getApiErrorMessage(error, 'Không ghi nhận được thanh toán.'));
    } finally {
      setIsProcessing(false);
      setPaymentLogRefresh((n) => n + 1);
    }
  };

  const handlePrintReceipt = (container: ContainerRecord) => {
    setReceiptModalCont(container);
  };

  // Quick cash calculations
  // Bỏ trống ô tiền khách đưa = khách đưa đúng số tiền phải thu (trước đây bắt buộc nhập nên nút xác nhận bị khoá,
  // trông như bấm không được).
  const parsedCash = cashReceived.trim() ? parseFloat(cashReceived.replace(/\D/g, '')) || 0 : amount;
  const cashChange = parsedCash > amount ? parsedCash - amount : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg ">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 text-[11px] font-bold rounded-md">
                5. NGHIỆP VỤ THU NGÂN
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                5. THANH TOÁN DỊCH VỤ (TIỀN MẶT & CHUYỂN KHOẢN)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn container từ danh sách để xem đầy đủ thông tin phí &bull; Thu <strong>Tiền mặt</strong> hoặc <strong>Chuyển khoản</strong> (khách quét mã VietQR, nhân viên kiểm tra tiền về rồi xác nhận) &bull; Gạch nợ phiếu dịch vụ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('operation')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-cyan-600" />
            <span>Khai Thác Cổng</span>
          </button>

          <button
            onClick={() => onNavigateTab('estimate')}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-50 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Lập Báo Giá EMR</span>
          </button>

          <button
            onClick={() => onNavigateTab('forklift')}
            className="px-3.5 py-2.5 bg-sky-50 hover:bg-sky-50 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-sky-600" />
            <span>Lệnh Xe Nâng</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Container Chờ Thanh Toán</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {pendingContainers.length} <span className="text-xs text-slate-500 font-normal">vỏ</span>
          </div>
          <div className="text-[11px] text-amber-600">Nhấp chọn dòng để nạp chi tiết</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Tổng Tiền Cần Thu</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {formatVND(totalPendingAmount)}
          </div>
          <div className="text-[11px] text-slate-500">Doanh thu chờ gạch nợ</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Đã Gạch Nợ Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {paidContainers.length} <span className="text-xs text-slate-500 font-normal">vỏ</span>
          </div>
          <div className="text-[11px] text-emerald-600">Phiếu dịch vụ đã thu tiền</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Doanh Thu Đã Thu</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {formatVND(totalPaidAmount)}
          </div>
          <div className="text-[11px] text-slate-500">Tiền mặt & chuyển khoản tại quầy</div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('PENDING_LIST');
              setIsSuccess(false);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'PENDING_LIST'
                ? 'bg-amber-600 text-white shadow-lg '
                : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>1. DANH SÁCH CHỜ THANH TOÁN ({pendingContainers.length})</span>
            {pendingContainers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('PAID_HISTORY');
              setIsSuccess(false);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'PAID_HISTORY'
                ? 'bg-emerald-600 text-white shadow-lg '
                : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. LỊCH SỬ ĐÃ THANH TOÁN ({paidContainers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('PAYMENT_LOG');
              setIsSuccess(false);
            }}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'PAYMENT_LOG'
                ? 'bg-purple-600 text-white shadow-lg '
                : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>3. NHẬT KÝ THANH TOÁN</span>
          </button>
        </div>

        {/* Global search quick input */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm cont, tài xế, xe kéo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      </div>

      {/* SUCCESS BANNER WHEN PAYMENT IS COMPLETED */}
      {isSuccess && lastPaidCont && (
        <div className="p-6 bg-white border border-emerald-200 rounded-3xl text-center space-y-4 animate-fade-in shadow-2xl">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-wide">
              GẠCH NỢ THÀNH CÔNG — PAYMENT COMPLETED!
            </h3>
            <p className="text-xs text-slate-700 font-mono">
              Container <strong className="text-emerald-600">{lastPaidCont.containerNo}</strong> ({lastPaidCont.shippingLine}) đã thanh toán{' '}
              <strong className="text-emerald-600">{formatVND(lastPayment?.amount ?? 0)}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-500">
            <span className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              Phương thức: <strong className="text-purple-600">{lastPayment?.method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt tại quầy'}</strong>
            </span>
            <span className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              Mã giao dịch: <strong className="text-cyan-600 font-bold">{lastPayment?.transactionRef || '—'}</strong>
            </span>
            {lastPayment?.invoiceNo && (
              <span className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                Số phiếu thu: <strong className="text-slate-700 font-bold">{lastPayment.invoiceNo}</strong>
              </span>
            )}
            {lastPayment?.method === 'CASH' && (lastPayment.change ?? 0) > 0 && (
              <span className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                Tiền thừa trả khách: <strong className="text-amber-600 font-bold">{formatVND(lastPayment.change ?? 0)}</strong>
              </span>
            )}
            {lastPayment?.cashierName && (
              <span className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                Người thu: <strong className="text-slate-700 font-bold">{lastPayment.cashierName}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('estimate')}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black rounded-xl shadow-lg  cursor-pointer transition flex items-center gap-2 ring-2 ring-amber-400/40"
            >
              <Calculator className="w-4 h-4" />
              <span>Chuyển Sang Lập Báo Giá EMR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('forklift')}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-50 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 cursor-pointer transition flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Xem Lệnh Xe Nâng</span>
            </button>

            <button
              onClick={() => handlePrintReceipt(lastPaidCont)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-cyan-600" />
              <span>In Biên Lai</span>
            </button>

            <button
              onClick={() => {
                setIsSuccess(false);
                if (pendingContainers.length > 0) {
                  setSelectedContId(pendingContainers[0].id);
                }
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition"
            >
              Tiếp Tục Thu Cont Khác
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH CHỜ THANH TOÁN (LEFT) + CHI TIẾT & CHỌN PHƯƠNG THỨC (RIGHT) */}
      {/* ========================================================================= */}
      {activeTab === 'PENDING_LIST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI (6 COLS): DANH SÁCH CONTAINER CẦN THANH TOÁN */}
          <div className="lg:col-span-6 space-y-4">
            {/* Filter controls */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-purple-600" />
                  <span>Bộ lọc:</span>
                </span>

                <select
                  value={shippingLineFilter}
                  onChange={(e) => setShippingLineFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:outline-none"
                >
                  <option value="ALL">Tất Cả Hãng Tàu</option>
                  {shippingLines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>

                <select
                  value={feeTypeFilter}
                  onChange={(e) => setFeeTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs focus:outline-none"
                >
                  <option value="ALL">Tất Cả Khoản Phí</option>
                  <option value="LOLO">Có Phí Nâng Hạ</option>
                  <option value="CLEANING">Có Phí Vệ Sinh (CL)</option>
                  <option value="STORAGE">Có Phí Lưu Bãi</option>
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Tìm thấy: <strong className="text-amber-600">{filteredPendingList.length}</strong> container
              </div>
            </div>

            {/* List container cards/table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Danh Sách Container Chờ Thu Phí
                  </h3>
                </div>
                <span className="text-[11px] text-cyan-600 font-semibold">
                  👉 Nhấp vào dòng để xem chi tiết
                </span>
              </div>

              {filteredPendingList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">Không có container nào chờ thanh toán</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Tất cả container Gate-In đã hoàn tất thanh toán hoặc chưa có phiếu dịch vụ nào được lập.
                  </p>
                  <button
                    onClick={() => onNavigateTab('operation')}
                    className="px-4 py-2 bg-cyan-50 hover:bg-cyan-50 text-cyan-700 text-xs font-bold rounded-xl border border-cyan-200 transition cursor-pointer"
                  >
                    Vào Phân Hệ Khai Thác Lập Phiếu
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/60 max-h-[600px] overflow-y-auto">
                  {filteredPendingList.map((cont) => {
                    const isSelected = cont.id === currentCont?.id;
                    const total = getOrderAmount(cont);
                    const clean = getOrderFee(cont, 'CLEANING');

                    return (
                      <div
                        key={cont.id}
                        onClick={() => setSelectedContId(cont.id)}
                        className={`p-4 transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-50 border-l-4 border-purple-500 shadow-inner'
                            : 'hover:bg-slate-100 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm">
                              {cont.containerNo}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-200 text-[10px] font-bold">
                              {cont.shippingLine}
                            </span>
                            {cont.condition === 'CL' && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                                CL - Vệ sinh
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Tài xế: <strong className="text-slate-700">{cont.driverName || '—'}</strong></span>
                            <span>&bull;</span>
                            <span className="font-mono text-amber-600">{cont.licensePlate || '—'}</span>
                          </div>

                          <div className="text-[11px] text-slate-500">
                            Quy cách: <span className="text-slate-700">{cont.size}</span> &bull; Trạng thái: <span className="text-amber-600 font-semibold">Chờ thu tiền</span>
                          </div>
                        </div>

                        <div className="text-right space-y-1 shrink-0">
                          <div className="font-mono font-black text-emerald-600 text-sm">
                            {formatVND(total)}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-[11px]">
                            {isSelected ? (
                              <span className="px-2 py-0.5 bg-purple-600 text-white font-bold rounded-md flex items-center gap-1 shadow">
                                <span>Đang chọn</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="text-slate-500 hover:text-slate-700 flex items-center gap-0.5">
                                <span>Chọn</span>
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI (6 COLS): CHI TIẾT CONTAINER ĐÃ CHỌN & CHỌN PHƯƠNG THỨC THANH TOÁN */}
          <div className="lg:col-span-6 space-y-4">
            {currentCont ? (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* Header Thông Tin Container Được Chọn */}
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">THÔNG TIN CONTAINER:</span>
                        <span className="font-mono font-black text-cyan-600 text-base">
                          {currentCont.containerNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {currentCont.shippingLine} &bull; {currentCont.size} &bull; Tài xế: <strong className="text-slate-700">{currentCont.driverName || '—'}</strong> ({currentCont.licensePlate || '—'})
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold uppercase">
                    Chờ Thu Phí
                  </span>
                </div>

                {/* Chi Tiết Bảng Phí Cần Thu */}
                <div className="p-5 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-700 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                      <Info className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Chi Tiết Các Khoản Phí Gate-In Theo Tariff</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-slate-500">
                        <span>1. Phí nâng hạ rỗng ({currentCont.size}):</span>
                        <span className="font-mono text-slate-700">{formatVND(liftFee)}</span>
                      </div>

                      {cleaningFee > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>2. Phí vệ sinh:</span>
                          <span className="font-mono text-cyan-600">{formatVND(cleaningFee)}</span>
                        </div>
                      )}

                      {storageFee > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>3. Phí lưu bãi quá hạn:</span>
                          <span className="font-mono text-amber-600">{formatVND(storageFee)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-500">
                        <span>4. Thuế giá trị gia tăng (VAT):</span>
                        <span className="font-mono text-slate-700">{formatVND(vatFee)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>TỔNG CỘNG TIỀN THANH TOÁN:</span>
                        <span className="font-mono font-black text-emerald-600 text-lg">
                          {formatVND(amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TAB CHỌN PHƯƠNG THỨC: [1] QUÉT MÃ QR VIETQR | [2] TIỀN MẶT TẠI QUẦY */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>Chọn Hình Thức Thu Tiền:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                      <button
                        onClick={() => { setPaymentMethodTab('CASH'); setPaymentError(null); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          paymentMethodTab === 'CASH'
                            ? 'bg-emerald-600 text-white shadow-lg '
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>1. Tiền Mặt</span>
                      </button>

                      <button
                        onClick={() => { setPaymentMethodTab('BANK_TRANSFER'); setPaymentError(null); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          paymentMethodTab === 'BANK_TRANSFER'
                            ? 'bg-purple-600 text-white shadow-lg '
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>2. Chuyển Khoản</span>
                      </button>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">{paymentError}</div>
                  )}

                  {/* CHUYỂN KHOẢN: hiện mã VietQR + số tiền; khách quét chuyển, nhân viên kiểm tra tiền về rồi tích xác nhận */}
                  {paymentMethodTab === 'BANK_TRANSFER' && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fade-in text-xs">
                      <VietQrCode amount={amount} addInfo={buildTransferContent(getServiceOrder(currentCont)?.customerName, currentCont.containerNo)} />
                      <label className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={transferChecked}
                          onChange={(e) => { setTransferChecked(e.target.checked); setPaymentError(null); }}
                          className="mt-0.5 accent-purple-600"
                        />
                        <span className="text-slate-700">
                          Đã kiểm tra: tiền <strong className="font-mono text-emerald-700">{formatVND(amount)}</strong> đã về tài khoản công ty.
                        </span>
                      </label>
                      <button
                        onClick={() => void submitPayment(currentCont, 'BANK_TRANSFER')}
                        disabled={isProcessing || !transferChecked}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>{isProcessing ? 'Đang ghi nhận...' : 'Xác Nhận Đã Nhận Chuyển Khoản & Gạch Nợ'}</span>
                      </button>
                    </div>
                  )}

                  {/* GIAO DIỆN PHƯƠNG THỨC 2: TIỀN MẶT TẠI QUẦY */}
                  {paymentMethodTab === 'CASH' && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fade-in text-xs">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <Banknote className="w-4 h-4" />
                        <span>THU TIỀN MẶT TRỰC TIẾP TẠI CỔNG THU NGÂN</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-500 mb-1">Số tiền phải thu:</label>
                          <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-emerald-600 font-black text-base">
                            {formatVND(amount)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-500 mb-1">Số tiền tài xế đưa (VNĐ):</label>
                          <input
                            type="text"
                            placeholder="Bỏ trống nếu khách đưa đúng số tiền"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 text-sm"
                          />
                        </div>

                        {cashReceived.trim() !== '' && parsedCash > 0 && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                            <span className="text-slate-500">Tiền thừa trả lại tài xế:</span>
                            <span className="font-mono font-bold text-amber-600 text-sm">
                              {formatVND(cashChange)}
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-slate-500 mb-1">Ghi chú phiếu thu tiền mặt:</label>
                          <input
                            type="text"
                            value={cashNote}
                            onChange={(e) => setCashNote(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none text-xs"
                          />
                        </div>
                      </div>

                      {parsedCash > 0 && parsedCash < amount && (
                        <p className="text-[11px] font-bold text-rose-600">Còn thiếu {formatVND(amount - parsedCash)}.</p>
                      )}
                      <button
                        onClick={() => void submitPayment(currentCont, 'CASH')}
                        disabled={isProcessing || parsedCash < amount || amount <= 0}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg  transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>{isProcessing ? 'Đang ghi nhận...' : 'Xác Nhận Đã Thu Đủ Tiền Mặt & Gạch Nợ'}</span>
                      </button>
                    </div>
                  )}

                  {/* In Biên Lai Thử */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handlePrintReceipt(currentCont)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Xem & In Biên Lai Thu Tiền</span>
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-slate-500 text-xs">
                Vui lòng chọn 1 container trong danh sách bên trái để nạp thông tin phí và chọn hình thức thanh toán.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {activeTab === 'PAYMENT_LOG' && <PaymentLogTab refreshKey={paymentLogRefresh} />}

      {/* TAB 2: LỊCH SỬ ĐÃ THANH TOÁN (PAID ARCHIVE) */}
      {/* ========================================================================= */}
      {activeTab === 'PAID_HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Lịch Sử Các Giao Dịch Đã Gạch Nợ & Thu Tiền Thành Công
              </h3>
            </div>
            <span className="text-xs text-emerald-600 font-bold">
              Tổng tiền đã thu: {formatVND(totalPaidAmount)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                  <th className="py-3 px-4">Container & Hãng Tàu</th>
                  <th className="py-3 px-3">Tài Xế / Xe Kéo</th>
                  <th className="py-3 px-3">Phương Thức</th>
                  <th className="py-3 px-3">Mã Giao Dịch</th>
                  <th className="py-3 px-3 text-right">Số Tiền Đã Thu</th>
                  <th className="py-3 px-3 text-center">Trạng Thái Xe Nâng</th>
                  <th className="py-3 px-3 text-center">Thao Tác Nghiệp Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-slate-700">
                {filteredPaidList.map((cont) => (
                  <tr key={cont.id} className="hover:bg-slate-100 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{cont.containerNo}</div>
                      <div className="text-[11px] text-slate-500">
                        {cont.shippingLine} &bull; {cont.size}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-700">{cont.driverName || '—'}</div>
                      <div className="font-mono text-amber-600 text-[11px]">{cont.licensePlate || '—'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                        {getServiceOrder(cont)?.paymentMethod || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-600">
                      {getServiceOrder(cont)?.transactionId || '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-600 text-sm">
                      {formatVND(getOrderAmount(cont))}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200 text-[10px] font-bold">
                        ĐÃ PHÁT LỆNH GẮP
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onNavigateTab('estimate')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200 transition flex items-center gap-1 cursor-pointer"
                          title="Lập Báo Giá EMR"
                        >
                          <Calculator className="w-3 h-3 text-amber-600" />
                          <span>Báo Giá EMR</span>
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(cont)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                          title="In Lại Biên Lai"
                        >
                          <Printer className="w-3 h-3 text-cyan-600" />
                          <span>In</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL IN BIÊN LAI THU TIỀN ĐIỆN TỬ */}
      {/* ========================================================================= */}
      {receiptModalCont && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-fade-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">BIÊN LAI THU TIỀN DỊCH VỤ GATE-IN</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-cyan-600" />
                  <span>In Biên Lai</span>
                </button>
                <button
                  onClick={() => setReceiptModalCont(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 print:p-0 print:text-black">
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <h2 className="text-base font-black text-slate-900">CÔNG TY CỔ PHẦN CẢNG & TIẾP VẬN STB</h2>
                <p className="text-xs text-slate-500">BIÊN LAI THU CƯỚC NÂNG HẠ & DỊCH VỤ GATE-IN</p>
                <div className="text-xs font-mono text-cyan-600 font-bold">Số phiếu: {getServiceOrder(receiptModalCont)?.orderNo || '—'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Số Container:</span>
                  <div className="font-mono font-bold text-slate-900">{receiptModalCont.containerNo}</div>
                </div>
                <div>
                  <span className="text-slate-500">Hãng Tàu:</span>
                  <div className="font-bold text-cyan-600">{receiptModalCont.shippingLine}</div>
                </div>
                <div>
                  <span className="text-slate-500">Khách Hàng / Tài Xế:</span>
                  <div className="font-semibold text-slate-700">{receiptModalCont.driverName || '—'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Biển Số Xe Kéo:</span>
                  <div className="font-mono text-amber-600">{receiptModalCont.licensePlate || '—'}</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2.5">Nội Dung Thu</th>
                      <th className="p-2.5 text-right">Số Tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-2.5">Phí nâng hạ rỗng Gate-In ({receiptModalCont.size})</td>
                      <td className="p-2.5 text-right font-mono">{formatVND(getOrderFee(receiptModalCont, 'LOLO'))}</td>
                    </tr>
                    {getOrderFee(receiptModalCont, 'CLEANING') > 0 && (
                      <tr>
                        <td className="p-2.5">Phí vệ sinh</td>
                        <td className="p-2.5 text-right font-mono">{formatVND(getOrderFee(receiptModalCont, 'CLEANING'))}</td>
                      </tr>
                    )}
                    <tr className="font-bold bg-slate-50 text-slate-900">
                      <td className="p-2.5">TỔNG TIỀN ĐÃ THANH TOÁN (gồm VAT):</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 text-sm">
                        {formatVND(getOrderAmount(receiptModalCont))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <div className="text-slate-500 space-y-0.5">
                  <div>Thời gian thu: {getServiceOrder(receiptModalCont)?.paidAt ? new Date(getServiceOrder(receiptModalCont)!.paidAt).toLocaleString('vi-VN') : 'Chưa thanh toán'}</div>
                  <div>
                    Hình thức: {getServiceOrder(receiptModalCont)?.paymentMethod === 'CASH' ? 'Tiền mặt' : getServiceOrder(receiptModalCont)?.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : getServiceOrder(receiptModalCont)?.paymentMethod || '—'}
                    {getServiceOrder(receiptModalCont)?.transactionId ? ` · Mã GD: ${getServiceOrder(receiptModalCont)!.transactionId}` : ''}
                  </div>
                </div>
                <div className={`font-bold font-mono ${getServiceOrder(receiptModalCont)?.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {getServiceOrder(receiptModalCont)?.paymentStatus === 'PAID' ? '[ĐÃ GẠCH NỢ]' : '[CHƯA THANH TOÁN]'}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setReceiptModalCont(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
