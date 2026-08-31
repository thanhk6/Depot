import React, { useState } from 'react';
import { StockBalance, MaterialGroup, StockTransaction } from '../types';
import {
  Search,
  Filter,
  ArrowUpFromLine,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowDownToLine,
  Layers,
  BookOpen,
  PlusCircle,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Package
} from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface StockBalanceTabProps {
  stockBalances: StockBalance[];
  materialGroups: MaterialGroup[];
  transactions: StockTransaction[];
  onOpenStockCard: (materialId: number) => void;
  onOpenReserve?: (materialId: number) => void;
  onOpenIssue: () => void;
  onOpenReceipt: () => void;
  onOpenCreateMaterial?: () => void;
}

export const StockBalanceTab: React.FC<StockBalanceTabProps> = ({
  stockBalances,
  materialGroups,
  transactions,
  onOpenStockCard,
  onOpenIssue,
  onOpenReceipt,
  onOpenCreateMaterial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Compute calculated metrics for each stock balance row — dùng transactions thật (khớp materialCode),
  // trước đây dùng warehouseService (mock in-memory, khớp materialId số) nên luôn ra 0/rỗng.
  const rows = stockBalances.map((b) => {
    const matTrans = transactions.filter((t) => t.materialCode === b.materialCode);
    const totalReceived = matTrans
      .filter((t) => t.transactionType === 'RECEIPT' || t.transactionType === 'ADJUSTMENT_IN')
      .reduce((sum, t) => sum + t.quantity, 0);

    const totalIssued = matTrans
      .filter((t) => t.transactionType === 'ISSUE' || t.transactionType === 'ADJUSTMENT_OUT' || t.transactionType === 'DAMAGE')
      .reduce((sum, t) => sum + t.quantity, 0);

    // Opening Stock = Current Stock - Total Received + Total Issued
    const openingStock = Math.max(0, b.quantity - totalReceived + totalIssued);

    return {
      ...b,
      openingStock,
      totalReceived,
      totalIssued,
      closingStock: b.quantity
    };
  });

  const filtered = rows.filter((b) => {
    const matchesSearch =
      b.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.materialName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'ALL' || b.materialGroup === selectedGroup;
    const matchesStatus = selectedStatus === 'ALL' || b.stockStatus === selectedStatus;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Summary Metrics
  const totalItemsCount = filtered.length;
  const totalStockQty = filtered.reduce((sum, b) => sum + b.closingStock, 0);
  const totalReceivedQty = filtered.reduce((sum, b) => sum + b.totalReceived, 0);
  const totalIssuedQty = filtered.reduce((sum, b) => sum + b.totalIssued, 0);
  const totalStockValue = filtered.reduce((sum, b) => sum + b.totalValue, 0);
  const lowStockCount = filtered.filter((b) => b.stockStatus === 'LOW_STOCK' || b.stockStatus === 'OUT_OF_STOCK').length;

  const getStatusBadge = (status: StockBalance['stockStatus']) => {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 rounded-lg border border-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ĐỦ TỒN
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 rounded-lg border border-amber-800 font-bold text-[11px] inline-flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> SẮP HẾT
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="px-2.5 py-1 bg-rose-950/80 text-rose-300 rounded-lg border border-rose-800 font-bold text-[11px] inline-flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5" /> HẾT HÀNG
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-sky-400" />
            <span>Mặt Hàng</span>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-1.5">
            {totalItemsCount} <span className="text-xs text-slate-400 font-normal">loại</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Danh mục vật tư kho</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Tồn Thực Tế</span>
          </div>
          <div className="text-2xl font-mono font-black text-amber-300 mt-1.5">
            {totalStockQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ĐVT</span>
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            {lowStockCount > 0 ? `⚠️ ${lowStockCount} loại sắp hết hàng` : 'Đảm bảo định mức an toàn'}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Tổng Nhập</span>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-1.5">
            +{totalReceivedQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ĐVT</span>
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Nhập từ nhà cung cấp</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>Tổng Xuất</span>
          </div>
          <div className="text-2xl font-mono font-black text-rose-400 mt-1.5">
            -{totalIssuedQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ĐVT</span>
          </div>
          <div className="text-[11px] text-rose-500/80 mt-1">Xuất sửa chữa container</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Giá Trị Tồn Kho</span>
          </div>
          <div className="text-xl font-mono font-black text-purple-300 mt-1.5 truncate" title={formatVND(totalStockValue)}>
            {formatVND(totalStockValue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tính theo đơn giá bình quân</div>
        </div>
      </div>

      {/* Formula & Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN KHO VẬT TƯ EMR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Công thức chuẩn: <strong className="text-amber-300 font-mono">TỒN HIỆN TẠI = TỒN ĐẦU KỲ + TỔNG NHẬP - TỔNG XUẤT</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReceipt}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>+ Nhập Kho</span>
          </button>
          <button
            onClick={onOpenIssue}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>- Xuất Kho</span>
          </button>
          {onOpenCreateMaterial && (
            <button
              onClick={onOpenCreateMaterial}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Thêm Vật Tư</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Inputs */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã vật tư (VD: MAT-LOCK-001) hoặc tên vật tư..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất Cả Nhóm Cấu Kiện --</option>
            {materialGroups.map((g) => (
              <option key={g.code} value={g.code}>
                {g.code} - {g.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất Cả Trạng Thái --</option>
            <option value="IN_STOCK">Đủ Tồn (In Stock)</option>
            <option value="LOW_STOCK">Sắp Hết (Low Stock)</option>
            <option value="OUT_OF_STOCK">Hết Hàng (Out of Stock)</option>
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Mã Vật Tư</th>
                <th className="py-3 px-3">Tên Vật Tư & Quy Cách</th>
                <th className="py-3 px-2 text-center">ĐVT</th>
                <th className="py-3 px-3 text-right">Tồn Đầu</th>
                <th className="py-3 px-3 text-right text-emerald-400">Tổng Nhập (+)</th>
                <th className="py-3 px-3 text-right text-rose-400">Tổng Xuất (-)</th>
                <th className="py-3 px-3 text-right font-black text-amber-300 bg-slate-950/80">TỒN HIỆN TẠI</th>
                <th className="py-3 px-3 text-right">Đơn Giá TB</th>
                <th className="py-3 px-3 text-right">Thành Tiền Tồn</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3.5 font-mono font-bold text-amber-300 whitespace-nowrap">
                    {b.materialCode}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{b.materialName}</div>
                    <div className="text-[10px] text-slate-500">Nhóm: {b.materialGroup}</div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-400">
                    {b.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {b.openingStock.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    +{b.totalReceived.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                    -{b.totalIssued.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-amber-300 text-sm bg-slate-950/40">
                    {b.closingStock.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {formatVND(b.averageCost)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sky-300 whitespace-nowrap">
                    {formatVND(b.totalValue)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(b.stockStatus)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenStockCard(b.materialId)}
                        title="Xem Thẻ Kho & Lịch Sử"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                      >
                        Thẻ Kho
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
