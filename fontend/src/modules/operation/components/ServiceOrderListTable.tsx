import React, { useState } from 'react';
import { ServiceOrder } from '../types';
import { formatVND } from '../../../utils/format';
import {
  Search,
  Receipt,
  QrCode,
  Eye,
  Building2,
  Printer,
  Sparkles,
  Filter
} from 'lucide-react';
import { QuickQrModal } from './QuickQrModal';

interface ServiceOrderListTableProps {
  orders: ServiceOrder[];
  onViewDetail: (order: ServiceOrder) => void;
}

export const ServiceOrderListTable: React.FC<ServiceOrderListTableProps> = ({
  orders,
  onViewDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lineFilter, setLineFilter] = useState<string>('ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('ALL');

  // Quick QR popup state for Operation
  const [qrModalOrder, setQrModalOrder] = useState<ServiceOrder | null>(null);

  const shippingLines = Array.from(new Set(orders.map((o) => o.shippingLine).filter(Boolean)));

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchLine = lineFilter === 'ALL' ? true : order.shippingLine === lineFilter;

    // So khớp theo `category` (enum nghiệp vụ thật, VD 'CLEANING'/'LOLO') thay vì đoán qua substring của
    // serviceCode — mã dịch vụ thật (CLEAN_SWEEP, LOLO_MT_NORMAL...) không chứa 'CLN'/'LIFT' nên 2 nút lọc
    // này trước đây luôn trả rỗng dù dữ liệu tồn tại.
    const matchServiceType =
      serviceTypeFilter === 'ALL'
        ? true
        : serviceTypeFilter === 'CLEANING'
        ? order.items.some((i) => i.category === 'CLEANING')
        : order.items.some((i) => i.category === 'LOLO');

    return matchSearch && matchLine && matchServiceType;
  });

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Số Cont, Số Phiếu SO, Tên Khách Hàng, Tài Xế..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setServiceTypeFilter('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                serviceTypeFilter === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất Cả Dịch Vụ ({orders.length})
            </button>
            <button
              onClick={() => setServiceTypeFilter('LIFT')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                serviceTypeFilter === 'LIFT'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Nâng Hạ
            </button>
            <button
              onClick={() => setServiceTypeFilter('CLEANING')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                serviceTypeFilter === 'CLEANING'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Có Vệ Sinh (CL)
            </button>
          </div>

          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none shadow-sm"
          >
            <option value="ALL">Tất Cả Hãng Tàu</option>
            {shippingLines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Số Phiếu & Ngày Tạo</th>
              <th className="py-3 px-4">Container & Hãng Tàu</th>
              <th className="py-3 px-4">Khách Hàng / Xe Kéo</th>
              <th className="py-3 px-4">Dịch Vụ Áp Dụng</th>
              <th className="py-3 px-4 text-right">Tổng Tiền (Gồm VAT)</th>
              <th className="py-3 px-4 text-center">Mã QR Quét Thanh Toán</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Không tìm thấy phiếu dịch vụ nào phù hợp điều kiện lọc.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-cyan-700 text-sm">
                      {order.orderNo}
                    </div>
                    <div className="text-[11px] text-slate-500">{order.createdAt}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {order.containerNo}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {order.size} ({order.shippingLine})
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px] truncate">
                    <div className="font-semibold text-slate-900 truncate">{order.customerName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <span>Tài xế: {order.driverName}</span>
                      <span className="font-mono text-amber-700">({order.truckPlate})</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span className="truncate max-w-[200px]">{item.serviceName}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-black text-emerald-700 text-sm">
                      {formatVND(order.grandTotal)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      VAT 8%: {formatVND(order.totalVat)}
                    </div>
                  </td>

                  {/* Nút hiển thị Mã QR VietQR sắc nét để quét thanh toán */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setQrModalOrder(order)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-purple-600/20 transition inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      title="Hiện mã QR VietQR Napas 24/7 để quét thanh toán"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Hiện Mã QR</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer"
                      title="Xem Chi Tiết & In Phiếu Dịch Vụ / e-EIR"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Xem Phiếu</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pop-up hiển thị mã QR nhanh của Khai Thác */}
      {qrModalOrder && (
        <QuickQrModal
          isOpen={!!qrModalOrder}
          onClose={() => setQrModalOrder(null)}
          orderNo={qrModalOrder.orderNo}
          containerNo={qrModalOrder.containerNo}
          shippingLine={qrModalOrder.shippingLine}
          customerName={qrModalOrder.customerName}
          driverName={qrModalOrder.driverName}
          truckPlate={qrModalOrder.truckPlate}
          grandTotal={qrModalOrder.grandTotal}
        />
      )}
    </div>
  );
};
