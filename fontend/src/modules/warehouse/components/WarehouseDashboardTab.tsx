import React from 'react';
import {
  WarehouseKPIs,
  StockBalance,
  StockTransaction,
  MaterialGroup,
  WorkOrderMaterial
} from '../types';
import {
  Package,
  Boxes,
  Coins,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface WarehouseDashboardTabProps {
  kpis: WarehouseKPIs;
  stockBalances: StockBalance[];
  transactions: StockTransaction[];
  materialGroups: MaterialGroup[];
  workOrderMaterials: WorkOrderMaterial[];
  onNavigateTab: (tabId: string) => void;
  onOpenCreateReceipt: () => void;
  onOpenCreateIssue: () => void;
  onOpenStockCard: (materialId: number) => void;
}

export const WarehouseDashboardTab: React.FC<WarehouseDashboardTabProps> = ({
  kpis,
  stockBalances,
  transactions,
  materialGroups,
  workOrderMaterials,
  onNavigateTab,
  onOpenCreateReceipt,
  onOpenCreateIssue,
  onOpenStockCard
}) => {
  const lowStockItems = stockBalances.filter((b) => b.stockStatus === 'LOW_STOCK');
  const outOfStockItems = stockBalances.filter((b) => b.stockStatus === 'OUT_OF_STOCK');

  // Group summary
  const groupSummaries = materialGroups.map((g) => {
    const items = stockBalances.filter((b) => b.materialGroup === g.code);
    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalVal = items.reduce((sum, i) => sum + i.totalValue, 0);
    const reservedQty = items.reduce((sum, i) => sum + i.reservedQuantity, 0);
    const lowCount = items.filter((i) => i.stockStatus === 'LOW_STOCK' || i.stockStatus === 'OUT_OF_STOCK').length;
    return {
      group: g,
      itemCount: items.length,
      totalQty,
      totalVal,
      reservedQty,
      lowCount
    };
  });

  return (
    <div className="space-y-6">
      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Card 1: Tổng vật tư */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">TỔNG VẬT TƯ</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-white font-mono">{kpis.totalMaterials}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Danh mục active</p>
          </div>
        </div>

        {/* Card 2: Tổng tồn thực tế */}
        <div
          onClick={() => onNavigateTab('stock_balance')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">TỔNG TỒN THỰC TẾ</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-emerald-400 font-mono">{kpis.totalStockQuantity}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Tồn khả dụng: <strong className="text-white">{kpis.totalAvailableQuantity}</strong></p>
          </div>
        </div>

        {/* Card 3: Giá trị tồn kho */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition flex flex-col justify-between col-span-2 md:col-span-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">GIÁ TRỊ TỒN KHO</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-amber-300 font-mono">{formatVND(kpis.totalStockValue)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Định giá bình quân gia quyền</p>
          </div>
        </div>

        {/* Card 4: Đang Reserve */}
        <div
          onClick={() => onNavigateTab('work_orders')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">ĐANG RESERVE</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-sky-400 font-mono">{kpis.totalReservedQuantity}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Giữ cho Work Orders</p>
          </div>
        </div>

        {/* Card 5: Sắp hết */}
        <div
          onClick={() => onNavigateTab('stock_balance')}
          className={`p-4 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
            kpis.lowStockCount > 0
              ? 'bg-amber-950/40 border-amber-600/60 hover:border-amber-400'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">SẮP HẾT</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-amber-400 font-mono">{kpis.lowStockCount}</p>
            <p className="text-[10px] text-amber-200/80 mt-0.5">≤ Reorder Level</p>
          </div>
        </div>

        {/* Card 6: Hết hàng */}
        <div
          onClick={() => onNavigateTab('stock_balance')}
          className={`p-4 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
            kpis.outOfStockCount > 0
              ? 'bg-rose-950/40 border-rose-600/60 hover:border-rose-400'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">HẾT HÀNG</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-rose-400 font-mono">{kpis.outOfStockCount}</p>
            <p className="text-[10px] text-rose-200/80 mt-0.5">Available = 0</p>
          </div>
        </div>

        {/* Card 7: Hôm nay nhập & xuất */}
        <div
          onClick={() => onNavigateTab('receipts')}
          className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition flex flex-col justify-between col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">HÔM NAY NHẬP</span>
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-emerald-400 font-mono">{kpis.todayReceiptCount} PNK</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{formatVND(kpis.todayReceiptValue)}</p>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="p-4 bg-amber-950/30 border border-amber-600/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Cảnh Báo Định Mức Dự Trữ Kho EMR ({outOfStockItems.length} Hết Hàng, {lowStockItems.length} Sắp Hết)
              </h3>
              <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
                {outOfStockItems.map((item) => (
                  <span
                    key={item.id}
                    onClick={() => onOpenStockCard(item.materialId)}
                    className="px-2 py-0.5 bg-rose-950 border border-rose-700 text-rose-300 rounded font-mono font-bold cursor-pointer hover:bg-rose-900"
                  >
                    [HẾT] {item.materialCode}: {item.materialName}
                  </span>
                ))}
                {lowStockItems.map((item) => (
                  <span
                    key={item.id}
                    onClick={() => onOpenStockCard(item.materialId)}
                    className="px-2 py-0.5 bg-amber-950 border border-amber-700 text-amber-300 rounded font-mono font-bold cursor-pointer hover:bg-amber-900"
                  >
                    [SẮP HẾT] {item.materialCode} (Còn: {item.availableQuantity} {item.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCreateReceipt}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Tạo Phiếu Nhập Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-column Section: Breakdown by Group & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Material Groups Breakdown (2 cols) */}
        <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Cơ Cấu Tồn Kho Theo Nhóm Cấu Kiện (Single Warehouse)</span>
            </h3>
            <button
              onClick={() => onNavigateTab('groups')}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              <span>Xem chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Mã & Nhóm Cấu Kiện</th>
                  <th className="px-4 py-3 text-center">Số Mặt Hàng</th>
                  <th className="px-4 py-3 text-center">Tổng Tồn Thực</th>
                  <th className="px-4 py-3 text-center">Đang Giữ Cho WO</th>
                  <th className="px-4 py-3 text-right">Tổng Giá Trị</th>
                  <th className="px-4 py-3 text-center">Tình Trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {groupSummaries.map((s) => (
                  <tr key={s.group.code} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-amber-400 block">{s.group.code}</span>
                      <span className="text-slate-300">{s.group.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-white">
                      {s.itemCount}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">
                      {s.totalQty}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-sky-400">
                      {s.reservedQty > 0 ? `${s.reservedQty}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">
                      {formatVND(s.totalVal)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.lowCount > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 rounded border border-rose-800 font-bold text-[10px]">
                          {s.lowCount} cảnh báo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800 font-bold text-[10px]">
                          Đủ Tồn
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Stock Transactions Feed */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span>Nhật Ký Biến Động Gần Nhất</span>
              </h3>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px]">
                {transactions.length} sự kiện
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {transactions.slice(0, 7).map((tx) => {
                let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                let sign = '+';
                if (tx.transactionType === 'ISSUE' || tx.transactionType === 'ADJUSTMENT_OUT') {
                  badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  sign = '-';
                } else if (tx.transactionType === 'DAMAGE') {
                  badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                  sign = '✕';
                } else if (tx.transactionType === 'RESERVE') {
                  badgeColor = 'bg-sky-500/20 text-sky-400 border-sky-500/30';
                  sign = '🔒';
                }

                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 hover:border-slate-700 transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badgeColor}`}>
                        {tx.transactionType}
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">{tx.performedAt.slice(5, 16)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-white truncate max-w-[170px]" title={tx.materialName}>
                        {tx.materialName}
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {sign}{tx.quantity} {tx.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="font-mono">{tx.referenceId}</span>
                      <span className="text-slate-400 truncate max-w-[120px]">{tx.performedBy?.split('(')?.[0] || tx.performedBy || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
            >
              <span>Xem Toàn Bộ Sổ Kho Chi Tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
