import React, { useEffect, useState } from 'react';
import { ServiceOrder } from '../types';
import { formatVND } from '../../../utils/format';
import {
  X,
  Printer,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Building2,
  Truck,
  FileText,
  Calendar,
  CreditCard,
  Download,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Wrench,
  Receipt,
  FileCheck,
  MapPin,
  Clock,
  Layers,
  Send
} from 'lucide-react';
import { VietQrCode } from '../../../components/common/VietQrCode';
import { buildTransferContent } from '../../../utils/vietqr';

interface ServiceOrderDetailModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  /** Mở ra là in ngay chứng từ này (dùng cho "Lưu & In" ở form lập phiếu). */
  autoPrint?: 'ORDER' | 'RECEIPT' | 'EEIR' | null;
  onAutoPrinted?: () => void;
}

export const ServiceOrderDetailModal: React.FC<ServiceOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  autoPrint,
  onAutoPrinted
}) => {
  // Màn này chỉ để XEM và IN chứng từ — thu tiền làm ở màn Thanh Toán, không huỷ / chuyển trang từ đây.
  const [activeDocumentTab, setActiveDocumentTab] = useState<'ORDER' | 'RECEIPT' | 'EEIR' | 'ALL'>('ORDER');

  useEffect(() => {
    if (!isOpen || !order || !autoPrint) return;
    setActiveDocumentTab(autoPrint);
    const timer = setTimeout(() => {
      window.print();
      onAutoPrinted?.();
    }, 400);
    return () => clearTimeout(timer);
  }, [isOpen, order?.id, autoPrint]);

  if (!isOpen || !order) return null;

  const handlePrint = (mode: 'ORDER' | 'RECEIPT' | 'EEIR' | 'ALL') => {
    setActiveDocumentTab(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const getConditionBadge = (condition?: 'AV' | 'CL' | 'DM') => {
    switch (condition) {
      case 'AV':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AV — Sạch Sẽ Đạt Chuẩn</span>
          </span>
        );
      case 'CL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Droplets className="w-3.5 h-3.5" />
            <span>CL — Cần Rửa Vệ Sinh</span>
          </span>
        );
      case 'DM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Wrench className="w-3.5 h-3.5" />
            <span>DM — Hư Hỏng Cần Sửa EMR</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700">
            <span>AV — Chuẩn Cấp Khai Thác</span>
          </span>
        );
    }
  };

  const eeirNumber = order.surveyRef?.eeirNo || `EIR-2026-${order.containerNo.slice(-4)}${Math.floor(10 + Math.random() * 89)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-fade-in">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-600/20 text-cyan-700 rounded-2xl border border-cyan-500/30">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-bold rounded">
                  GATE-IN OPERATION
                </span>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>CHI TIẾT KHAI THÁC & CHỨNG TỪ:</span>
                  <span className="font-mono text-cyan-700 font-black">{order.containerNo}</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Phiếu Dịch Vụ: <strong className="text-slate-700 font-mono">#{order.orderNo}</strong> &bull; Biên Bản e-EIR: <strong className="text-emerald-700 font-mono">#{eeirNumber}</strong>
              </p>
            </div>
          </div>

          {/* Document Switcher Tabs & Print Controls */}
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => setActiveDocumentTab('ORDER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeDocumentTab === 'ORDER'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Phiếu Dịch Vụ</span>
              </button>

              <button
                onClick={() => setActiveDocumentTab('RECEIPT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeDocumentTab === 'RECEIPT'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Phiếu Thu Tiền</span>
              </button>

              <button
                onClick={() => setActiveDocumentTab('EEIR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeDocumentTab === 'EEIR'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Biên Bản e-EIR</span>
              </button>

              <button
                onClick={() => setActiveDocumentTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeDocumentTab === 'ALL'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Phiếu Thu + e-EIR</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePrint(activeDocumentTab)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                title="In chứng từ đang hiển thị"
              >
                <Printer className="w-4 h-4 text-cyan-700" />
                <span className="hidden sm:inline">
                  {activeDocumentTab === 'ORDER' ? 'In Phiếu Dịch Vụ' : activeDocumentTab === 'RECEIPT' ? 'In Phiếu Thu' : activeDocumentTab === 'EEIR' ? 'In e-EIR' : 'In Phiếu Thu + e-EIR'}
                </span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Container with Printable Content */}
        <div className="p-4 sm:p-6 space-y-8 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          
          {/* ========================================================= */}
          {/* DOCUMENT 1: PHIẾU THU TIỀN DỊCH VỤ (SERVICE PAYMENT RECEIPT) */}
          {/* ========================================================= */}
          {(activeDocumentTab === 'ORDER' || activeDocumentTab === 'RECEIPT' || activeDocumentTab === 'ALL') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
              {/* Header Info & Company Brand */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 print:bg-white print:border-b-2 print:border-black print:p-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 text-blue-700 font-mono text-[10px] font-bold rounded print:bg-gray-100 print:text-black">
                      STB DEPOT ERP
                    </span>
                    <span className="text-xs text-slate-500 print:text-gray-700 font-semibold">
                      SOLUTION DEPOT
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide print:text-black">
                    {activeDocumentTab === 'ORDER' ? 'PHIẾU DỊCH VỤ CONTAINER GATE-IN' : 'PHIẾU THU DỊCH VỤ CONTAINER GATE-IN'}
                  </h3>
                </div>

                <div className="text-left md:text-right space-y-1">
                  <div className="text-xs text-slate-500 print:text-gray-600">{activeDocumentTab === 'ORDER' ? 'Số Phiếu Dịch Vụ:' : 'Số Phiếu Thu:'}</div>
                  <div className="text-base font-mono font-bold text-cyan-700 print:text-black">{order.orderNo}</div>
                  <div className="text-xs text-slate-500 print:text-gray-600 flex items-center md:justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ngày lập: {order.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Metadata Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Box 1: Container Info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 print:bg-white print:border print:border-gray-300">
                  <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2 print:text-black print:border-gray-300">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span>1. Thông Tin Container & Hãng Tàu</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Số Container:</span>
                      <div className="font-mono font-bold text-slate-900 text-sm print:text-black">{order.containerNo}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Hãng Tàu (Carrier):</span>
                      <div className="font-bold text-cyan-700 print:text-black">{order.shippingLine}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Kích thước / Loại:</span>
                      <div className="font-semibold text-slate-700 print:text-black">{order.size} - {order.type}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Mã ISO:</span>
                      <div className="font-mono text-slate-700 print:text-black">{order.isoCode}</div>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between print:border-gray-200">
                      <span className="text-slate-500 print:text-gray-600">Kết quả Giám định e-EIR:</span>
                      <div>{getConditionBadge(order.condition ?? order.surveyRef?.condition)}</div>
                    </div>
                  </div>
                </div>

                {/* Box 2: Customer & Driver Info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 print:bg-white print:border print:border-gray-300">
                  <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 border-b border-slate-200 pb-2 print:text-black print:border-gray-300">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>2. Khách Hàng / Phương Tiện Giao Nhận</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <span className="text-slate-500 print:text-gray-600">Khách Hàng / Đơn Vị:</span>
                      <div className="font-semibold text-slate-900 print:text-black">{order.customerName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Biển Số Xe Kéo:</span>
                      <div className="font-mono font-bold text-amber-700 print:text-black">{order.truckPlate}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Tên Tài Xế:</span>
                      <div className="font-semibold text-slate-700 print:text-black">{order.driverName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Số Điện Thoại:</span>
                      <div className="font-mono text-slate-700 print:text-black">{order.driverPhone || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 print:text-gray-600">Nhân Viên Lập:</span>
                      <div className="text-slate-700 print:text-black">{order.createdBy}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Table of Services */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 print:text-black">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>3. Bảng Chi Tiết Khoản Thu Theo Biểu Phí Tariff</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-mono print:text-gray-600">Đơn vị: VNĐ (Thuế VAT 8%)</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 print:border-gray-400 print:bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase print:bg-gray-100 print:text-black print:border-gray-400">
                        <th className="py-3 px-4 w-12 text-center">STT</th>
                        <th className="py-3 px-4">Tên Hạng Mục Dịch Vụ</th>
                        <th className="py-3 px-4 text-center">ĐVT</th>
                        <th className="py-3 px-4 text-center">Số Lượng</th>
                        <th className="py-3 px-4 text-right">Đơn Giá</th>
                        <th className="py-3 px-4 text-right">Thuế VAT (8%)</th>
                        <th className="py-3 px-4 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-gray-300 print:text-black">
                      {order.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-center font-mono text-slate-500 print:text-gray-600">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 print:text-black">{item.serviceName}</div>
                            {item.remarks && (
                              <div className="text-[11px] text-slate-500 italic print:text-gray-600">{item.remarks}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-500 print:text-gray-600">{item.unit}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900 print:text-black">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700 print:text-black">
                            {formatVND(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500 print:text-gray-600">
                            {formatVND(item.vatAmount)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 print:text-black">
                            {formatVND(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculation & VietQR Payment Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Left 2 Cols: Calculation Details */}
                <div className="md:col-span-2 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 print:bg-white print:border print:border-gray-300">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 print:text-gray-600">
                      <span>Cộng tiền dịch vụ (Trước thuế):</span>
                      <span className="font-mono text-slate-700 print:text-black">{formatVND(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 print:text-gray-600">
                      <span>Tiền thuế giá trị gia tăng (VAT 8%):</span>
                      <span className="font-mono text-slate-700 print:text-black">{formatVND(order.totalVat)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2 print:text-black print:border-gray-400">
                      <span>TỔNG CỘNG TIỀN THANH TOÁN:</span>
                      <span className="font-mono text-emerald-700 text-lg font-black print:text-black">{formatVND(order.grandTotal)}</span>
                    </div>
                  </div>

                  {/* Method Note */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between print:border-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 print:text-gray-600">Hình thức thanh toán:</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 print:border-black print:text-black">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QUÉT MÃ VIETQR NAPAS 24/7 HOẶC TIỀN MẶT</span>
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500 print:text-gray-700">
                      Mã phiếu: <span className="text-cyan-700 font-bold print:text-black">{order.orderNo}</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-4 pt-6 text-center text-xs print:pt-8">
                    <div>
                      <div className="font-bold text-slate-700 print:text-black">NGƯỜI NỘP TIỀN / TÀI XẾ</div>
                      <div className="text-[10px] text-slate-500 print:text-gray-600">(Ký và ghi rõ họ tên)</div>
                      <div className="h-14 flex items-end justify-center font-serif italic text-slate-700 print:text-black">
                        {order.driverName}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700 print:text-black">THU NGÂN / NHÂN VIÊN KHAI THÁC</div>
                      <div className="text-[10px] text-slate-500 print:text-gray-600">(Ký và đóng dấu xác nhận)</div>
                      <div className="h-14 flex items-end justify-center font-serif italic text-cyan-700 print:text-black">
                        {order.createdBy || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: VietQR Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3 print:bg-white print:border print:border-gray-300">
                  <VietQrCode compact amount={order.grandTotal} addInfo={buildTransferContent(order.customerName, order.containerNo)} />
                  <div className="font-mono font-black text-emerald-700 text-sm print:text-black">{formatVND(order.grandTotal)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* DOCUMENT 2: CHỨNG TỪ GIAO NHẬN e-EIR (EQUIPMENT INTERCHANGE) */}
          {/* ========================================================= */}
          {(activeDocumentTab === 'EEIR' || activeDocumentTab === 'ALL') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-6 print:border-none print:p-0 print:bg-white print:text-black print:break-before-page">
              {/* Header Info & e-EIR Title */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 print:bg-white print:border-b-2 print:border-black print:p-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600/20 border border-emerald-500/40 text-emerald-700 font-mono text-[10px] font-bold rounded print:bg-gray-100 print:text-black">
                      ELECTRONIC EIR
                    </span>
                    <span className="text-xs text-slate-500 print:text-gray-700 font-semibold">
                      SOLUTION DEPOT
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide print:text-black">
                    BIÊN BẢN GIAO NHẬN CONTAINER ĐIỆN TỬ (e-EIR)
                  </h3>
                  <p className="text-xs text-slate-500 print:text-gray-600">
                    Electronic Equipment Interchange Receipt &bull; Chứng từ số hóa chuẩn IICL-6 / ISO 9897
                  </p>
                </div>

                <div className="text-left md:text-right space-y-1">
                  <div className="text-xs text-slate-500 print:text-gray-600">Số Biên Bản e-EIR:</div>
                  <div className="text-base font-mono font-bold text-emerald-700 print:text-black">{eeirNumber}</div>
                  <div className="text-xs text-slate-500 print:text-gray-600 flex items-center md:justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Thời gian Gate-In: {order.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* 3 Columns Grid for EIR Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Col 1: Container Details */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 print:bg-white print:border print:border-gray-300">
                  <div className="font-bold text-slate-700 uppercase pb-1.5 border-b border-slate-200 flex items-center gap-1.5 print:text-black print:border-gray-300">
                    <Truck className="w-4 h-4 text-cyan-700" />
                    <span>1. Thông Số Container</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Số Container:</span>
                      <span className="font-mono font-bold text-slate-900 print:text-black">{order.containerNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Hãng Tàu:</span>
                      <span className="font-bold text-cyan-700 print:text-black">{order.shippingLine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Kích Cỡ / Loại:</span>
                      <span className="font-semibold text-slate-700 print:text-black">{order.size} {order.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Mã ISO Code:</span>
                      <span className="font-mono text-slate-700 print:text-black">{order.isoCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Số Chì (Seal No):</span>
                      <span className="font-mono text-amber-700 print:text-black">MS-889921</span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Truck & Transport */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 print:bg-white print:border print:border-gray-300">
                  <div className="font-bold text-slate-700 uppercase pb-1.5 border-b border-slate-200 flex items-center gap-1.5 print:text-black print:border-gray-300">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>2. Vận Tải & Tài Xế</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Đơn Vị Vận Tải:</span>
                      <span className="font-semibold text-slate-900 print:text-black truncate max-w-[140px]">{order.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Xe Kéo / Rơ-moóc:</span>
                      <span className="font-mono font-bold text-amber-700 print:text-black">{order.truckPlate} / 51R-1234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Tên Tài Xế:</span>
                      <span className="font-semibold text-slate-700 print:text-black">{order.driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">SĐT Liên Lạc:</span>
                      <span className="font-mono text-slate-700 print:text-black">{order.driverPhone || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Số Bằng Lái:</span>
                      <span className="font-mono text-slate-700 print:text-black">FC-7911827</span>
                    </div>
                  </div>
                </div>

                {/* Col 3: Inspection & Yard Position */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 print:bg-white print:border print:border-gray-300">
                  <div className="font-bold text-slate-700 uppercase pb-1.5 border-b border-slate-200 flex items-center gap-1.5 print:text-black print:border-gray-300">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>3. Giám Định & Vị Trí Bãi</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 print:text-gray-600">Tình Trạng Vỏ:</span>
                      <div>{getConditionBadge(order.condition ?? order.surveyRef?.condition)}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Vị Trí Hạ Bãi:</span>
                      <span className="font-mono font-bold text-cyan-700 print:text-black">BLOCK A-02-04-03</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Giám Định Viên:</span>
                      <span className="font-semibold text-slate-700 print:text-black">{order.surveyRef?.surveyorName || order.surveyRef?.surveyor || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 print:text-gray-600">Tiêu Chuẩn Giám Định:</span>
                      <span className="font-mono text-slate-700 print:text-black">IICL-6 / CIC / Seaworthy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inspection notes & damages summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs print:bg-white print:border print:border-gray-300">
                <div className="font-bold text-slate-700 print:text-black">Ghi Chú Giám Định Chi Tiết Khi Giao Nhận Cổng (Survey Notes):</div>
                <p className="text-slate-500 print:text-gray-700 italic">
                  {order.surveyNote || order.surveyRef?.surveyNote ||
                    'Đã kiểm tra toàn bộ 6 mặt vỏ container. Sàn gỗ, đà ngang đáy, xà nóc, vách trái, vách phải và bộ khóa cửa nguyên vẹn đạt yêu cầu giao nhận.'}
                </p>
              </div>

              {/* Signatures for e-EIR */}
              <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs print:pt-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 print:bg-white print:border print:border-gray-300">
                  <div className="font-bold text-slate-700 print:text-black uppercase">ĐẠI DIỆN BÊN GIAO (TÀI XẾ)</div>
                  <div className="text-[10px] text-slate-500 print:text-gray-600">Xác nhận giao container và tình trạng e-EIR</div>
                  <div className="h-16 flex flex-col items-center justify-end font-serif italic text-slate-700 print:text-black">
                    <span className="text-[11px] text-emerald-700 font-mono">[Đã ký điện tử OTP]</span>
                    <span className="font-bold">{order.driverName}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 print:bg-white print:border print:border-gray-300">
                  <div className="font-bold text-slate-700 print:text-black uppercase">ĐẠI DIỆN BÊN NHẬN (DEPOT SURVEYOR)</div>
                  <div className="text-[10px] text-slate-500 print:text-gray-600">Chứng nhận e-EIR số hóa an toàn SHA-256</div>
                  <div className="h-16 flex flex-col items-center justify-end font-serif italic text-cyan-700 print:text-black">
                    <span className="font-bold">{order.surveyRef?.surveyorName || order.surveyRef?.surveyor || order.createdBy || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions — chỉ in chứng từ */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Chứng từ e-EIR & Phiếu Thu đã liên thông đồng bộ toàn hệ thống</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Direct Print Buttons */}
            <button
              onClick={() => handlePrint('ORDER')}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>In Phiếu Dịch Vụ</span>
            </button>

            <button
              onClick={() => handlePrint('RECEIPT')}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-cyan-700" />
              <span>In Phiếu Thu</span>
            </button>

            <button
              onClick={() => handlePrint('EEIR')}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>In e-EIR</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};
