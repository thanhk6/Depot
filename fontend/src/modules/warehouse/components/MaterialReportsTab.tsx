import React, { useState } from 'react';
import {
  StockBalance,
  StockTransaction,
  WorkOrderMaterial,
  ContainerMaterialCostReport,
  ShippingLineMaterialSummaryReport,
  MaterialGroup
} from '../types';
import {
  FileSpreadsheet,
  Coins,
  TrendingDown,
  AlertTriangle,
  AlertOctagon,
  Ship,
  Wrench,
  RotateCcw,
  BookOpen,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal
} from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialReportsTabProps {
  stockBalances: StockBalance[];
  transactions: StockTransaction[];
  workOrderMaterials: WorkOrderMaterial[];
  containerReports: ContainerMaterialCostReport[];
  shippingLineSummaries: ShippingLineMaterialSummaryReport[];
  materialGroups: MaterialGroup[];
}

export const MaterialReportsTab: React.FC<MaterialReportsTabProps> = ({
  stockBalances,
  transactions,
  workOrderMaterials,
  containerReports,
  shippingLineSummaries,
  materialGroups
}) => {
  const [activeReport, setActiveReport] = useState<number>(1);

  const reportMenu = [
    { id: 1, label: '1. Báo cáo Chi phí vật tư theo Container', icon: Wrench },
    { id: 2, label: '2. Báo cáo Tiêu hao theo Hãng tàu', icon: Ship },
    { id: 3, label: '3. Báo cáo Giá trị tồn kho theo Nhóm', icon: Coins },
    { id: 4, label: '4. Báo cáo Vật tư Sắp hết & Hết hàng', icon: AlertTriangle },
    { id: 5, label: '5. Sổ Nhật ký biến động kho (Audit Ledger)', icon: BookOpen },
    { id: 6, label: '6. Báo cáo Quyết toán theo Work Order', icon: FileSpreadsheet }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Trung Tâm Báo Cáo & Thống Kê Vật Tư Sửa Chữa Container EMR</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hệ thống báo cáo chi tiết: Minh bạch 100% chi phí vật tư cho từng Container, từng Lệnh sửa chữa, Hãng tàu và Định giá kho.
        </p>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {reportMenu.map((r) => {
          const Icon = r.icon;
          const isActive = activeReport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT 1: Container Material Cost Report */}
      {activeReport === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                BÁO CÁO CHI PHÍ VẬT TƯ THEO TỪNG CONTAINER (CONTAINER COST BREAKDOWN)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bao gồm danh sách các cấu kiện, số lượng thực dùng, đơn vị tính và tổng thành tiền vật tư đã sử dụng.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Tổng chi phí vật tư Container:</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {formatVND(containerReports.reduce((s, c) => s + c.totalMaterialCost, 0))}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {containerReports.map((c, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-4 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-base">{c.containerNo}</span>
                        <span className="px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded text-[10px] font-mono font-bold">
                          {c.shippingLine}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px]">
                          {c.workOrderNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Thợ phụ trách: <strong className="text-slate-200">{c.technicianName}</strong> • Hoàn tất: <span className="font-mono">{c.completedDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Tổng chi phí vật tư:</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {formatVND(c.totalMaterialCost)}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3.5 py-2">Mã Vật Tư</th>
                        <th className="px-3.5 py-2">Tên Cấu Kiện Sử Dụng</th>
                        <th className="px-3.5 py-2 text-center">ĐVT</th>
                        <th className="px-3.5 py-2 text-center">Số Lượng Thực Dùng</th>
                        <th className="px-3.5 py-2 text-right">Đơn Giá TB</th>
                        <th className="px-3.5 py-2 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {c.materialItems.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="px-3.5 py-2 font-mono font-bold text-amber-400">{item.materialCode}</td>
                          <td className="px-3.5 py-2 text-white font-medium">{item.materialName}</td>
                          <td className="px-3.5 py-2 text-center font-mono text-slate-400">{item.unit}</td>
                          <td className="px-3.5 py-2 text-center font-mono font-bold text-emerald-400">{item.quantity}</td>
                          <td className="px-3.5 py-2 text-right font-mono text-slate-300">{formatVND(item.unitCost)}</td>
                          <td className="px-3.5 py-2 text-right font-mono font-bold text-amber-300">{formatVND(item.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT CONTENT 2: Shipping Line Material Summary */}
      {activeReport === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              BÁO CÁO TIÊU HAO VẬT TƯ THEO HÃNG TÀU (SHIPPING LINE SUMMARY)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tổng hợp số lượng container đã sửa chữa và tổng giá trị vật tư xuất dùng theo từng hãng tàu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingLineSummaries.map((s, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-lg font-bold font-mono text-xs">
                      {s.shippingLine}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {s.totalContainers} container ({s.totalWorkOrders} Lệnh WO)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Thống kê chi phí vật tư đã dùng</h4>
                  <p className="text-xs text-slate-400">
                    Vật tư tiêu hao nhiều nhất: <strong className="text-amber-400">{s.topConsumedMaterial}</strong>
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Tổng Giá Trị Vật Tư:</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {formatVND(s.totalMaterialCost)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT CONTENT 3: Stock Value by Material Group */}
      {activeReport === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              BÁO CÁO ĐỊNH GIÁ TỒN KHO THEO NHÓM CẤU KIỆN (STOCK VALUATION)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân tích cơ cấu vốn ứ đọng và giá trị dự trữ tại Kho Vật Tư Sửa Chữa EMR.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nhóm Cấu Kiện</th>
                  <th className="px-4 py-3 text-center">Số Mặt Hàng</th>
                  <th className="px-4 py-3 text-center">Tổng Tồn Thực Tế</th>
                  <th className="px-4 py-3 text-center">Tồn Khả Dụng</th>
                  <th className="px-4 py-3 text-right">Tổng Giá Trị (VND)</th>
                  <th className="px-4 py-3 text-right">Tỷ Trọng Vốn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {materialGroups.map((g) => {
                  const items = stockBalances.filter((b) => b.materialGroup === g.code);
                  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
                  const totalAvailable = items.reduce((sum, i) => sum + i.availableQuantity, 0);
                  const totalVal = items.reduce((sum, i) => sum + i.totalValue, 0);
                  const allStockVal = stockBalances.reduce((sum, b) => sum + b.totalValue, 0);
                  const ratio = allStockVal > 0 ? (totalVal / allStockVal) * 100 : 0;

                  return (
                    <tr key={g.code} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-amber-400 block">{g.code}</span>
                        <span className="text-slate-300">{g.name}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-white font-bold">{items.length}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">{totalQty}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-white">{totalAvailable}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-300">{formatVND(totalVal)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-sky-400">{ratio.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 4: Low Stock & Out of Stock Report */}
      {activeReport === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              BÁO CÁO VẬT TƯ CẦN ĐẶT HÀNG BỔ SUNG (LOW STOCK & OUT OF STOCK)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Danh sách các mặt hàng có Tồn khả dụng nhỏ hơn hoặc bằng Mức đặt hàng lại (Reorder Level) hoặc bằng 0.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3.5 py-3">Mã Vật Tư</th>
                  <th className="px-3.5 py-3">Tên Vật Tư</th>
                  <th className="px-3.5 py-3 text-center">ĐVT</th>
                  <th className="px-3.5 py-3 text-center">Tồn Khả Dụng</th>
                  <th className="px-3.5 py-3 text-center">Mức Báo Động</th>
                  <th className="px-3.5 py-3 text-center">Số Lượng Cần Đặt</th>
                  <th className="px-3.5 py-3 text-right">Đơn Giá TB</th>
                  <th className="px-3.5 py-3 text-right">Ước Tính Vốn Đặt (VND)</th>
                  <th className="px-3.5 py-3 text-center">Tình Trạng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockBalances
                  .filter((b) => b.stockStatus === 'LOW_STOCK' || b.stockStatus === 'OUT_OF_STOCK')
                  .map((b) => {
                    const suggestedOrderQty = Math.max(1, b.maximumStock - b.availableQuantity);
                    const suggestedCost = suggestedOrderQty * b.averageCost;

                    return (
                      <tr key={b.id} className="hover:bg-slate-900/40">
                        <td className="px-3.5 py-3 font-mono font-bold text-amber-400">{b.materialCode}</td>
                        <td className="px-3.5 py-3 text-white font-semibold">{b.materialName}</td>
                        <td className="px-3.5 py-3 text-center font-bold text-slate-400 font-mono">{b.unit}</td>
                        <td className="px-3.5 py-3 text-center font-mono font-bold text-rose-400">{b.availableQuantity}</td>
                        <td className="px-3.5 py-3 text-center font-mono text-amber-400">{b.reorderLevel}</td>
                        <td className="px-3.5 py-3 text-center font-mono font-bold text-emerald-400">+{suggestedOrderQty}</td>
                        <td className="px-3.5 py-3 text-right font-mono text-slate-300">{formatVND(b.averageCost)}</td>
                        <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-300">{formatVND(suggestedCost)}</td>
                        <td className="px-3.5 py-3 text-center">
                          {b.stockStatus === 'OUT_OF_STOCK' ? (
                            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800 font-bold text-[10px]">
                              HẾT HÀNG
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded border border-amber-800 font-bold text-[10px]">
                              SẮP HẾT
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 5: Audit Ledger (All Transactions) */}
      {activeReport === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              SỔ NHẬT KÝ BIẾN ĐỘNG KHO VẬT TƯ (STOCK TRANSACTIONS AUDIT LEDGER)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ghi nhận toàn bộ biến động: Nhập, Xuất, Trả, Điều chỉnh, Kiểm kê, Tạm giữ và Cách ly hỏng hóc.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3.5 py-2.5">Thời Gian</th>
                  <th className="px-3.5 py-2.5">Loại Biến Động</th>
                  <th className="px-3.5 py-2.5">Mã & Tên Vật Tư</th>
                  <th className="px-3.5 py-2.5 text-center">Số Chứng Từ</th>
                  <th className="px-3.5 py-2.5 text-center">Cont / Lệnh WO</th>
                  <th className="px-3.5 py-2.5 text-center">Số Lượng</th>
                  <th className="px-3.5 py-2.5 text-right">Tổng Tiền (VND)</th>
                  <th className="px-3.5 py-2.5">Người Thực Hiện & Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="px-3.5 py-2.5 font-mono text-slate-400 whitespace-nowrap">{tx.performedAt}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-200 rounded font-bold text-[10px]">
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="font-mono font-bold text-amber-400 block">[{tx.materialCode}]</span>
                      <span className="text-white">{tx.materialName}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-mono font-bold text-white">{tx.referenceId}</td>
                    <td className="px-3.5 py-2.5 text-center font-mono">
                      {tx.containerNo ? (
                        <span className="text-amber-300">{tx.containerNo}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-mono font-bold">
                      {tx.transactionType === 'RECEIPT' || tx.transactionType === 'RETURN' || tx.transactionType === 'ADJUSTMENT_IN' ? (
                        <span className="text-emerald-400">+{tx.quantity} {tx.unit}</span>
                      ) : tx.transactionType === 'ISSUE' || tx.transactionType === 'ADJUSTMENT_OUT' ? (
                        <span className="text-rose-400">-{tx.quantity} {tx.unit}</span>
                      ) : (
                        <span className="text-sky-400">{tx.quantity} {tx.unit}</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-200">
                      {formatVND(tx.totalCost)}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="font-semibold text-slate-200 block">{tx.performedBy?.split('(')?.[0] || tx.performedBy || ''}</span>
                      <span className="text-[11px] text-slate-400">{tx.note}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 6: Work Order Settlement */}
      {activeReport === 6 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              BÁO CÁO QUYẾT TOÁN VẬT TƯ THEO LỆNH SỬA CHỮA (WORK ORDER SETTLEMENT)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tổng hợp đối soát toàn diện giữa Số lượng Yêu cầu, Đã xuất, Thực dùng, Trả lại và Vật tư hỏng của từng Lệnh WO.
            </p>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3.5 py-2.5">Lệnh WO / Cont</th>
                  <th className="px-3.5 py-2.5">Vật Tư</th>
                  <th className="px-3.5 py-2.5 text-center">ĐVT</th>
                  <th className="px-3.5 py-2.5 text-center">Yêu Cầu</th>
                  <th className="px-3.5 py-2.5 text-center">Đã Xuất</th>
                  <th className="px-3.5 py-2.5 text-center">Thực Dùng</th>
                  <th className="px-3.5 py-2.5 text-center">Trả Lại</th>
                  <th className="px-3.5 py-2.5 text-center">Hỏng</th>
                  <th className="px-3.5 py-2.5 text-right">Chi Phí Quyết Toán</th>
                  <th className="px-3.5 py-2.5">Thợ Nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workOrderMaterials.map((w) => {
                  const actualUsed = w.usedQuantity > 0 ? w.usedQuantity : w.issuedQuantity;
                  const itemCost = actualUsed * w.unitCost;

                  return (
                    <tr key={w.id} className="hover:bg-slate-900/40">
                      <td className="px-3.5 py-2.5 font-mono">
                        <span className="font-bold text-amber-400 block">{w.workOrderNo}</span>
                        <span className="text-white text-[11px]">{w.containerNo}</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="font-semibold text-white block">{w.materialName}</span>
                        <span className="text-[11px] text-slate-400">[{w.materialCode}]</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-slate-400 font-mono">{w.unit}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono text-slate-400">{w.requiredQuantity}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono font-bold text-amber-400">{w.issuedQuantity}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono font-bold text-emerald-400">{actualUsed}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono font-bold text-sky-400">{w.returnedQuantity}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono font-bold text-rose-400">{w.damagedQuantity}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-amber-300">{formatVND(itemCost)}</td>
                      <td className="px-3.5 py-2.5 text-slate-300">{w.issuedTo || 'Chưa xuất'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
