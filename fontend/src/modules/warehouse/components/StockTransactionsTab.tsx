import React, { useState } from 'react';
import { StockTransaction, MaterialGroup } from '../types';
import { Search, Filter, ArrowDownToLine, ArrowUpFromLine, Receipt, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface StockTransactionsTabProps {
  transactions: StockTransaction[];
  onOpenReceipt: () => void;
  onOpenIssue: () => void;
}

export const StockTransactionsTab: React.FC<StockTransactionsTabProps> = ({
  transactions,
  onOpenReceipt,
  onOpenIssue
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.performedBy && t.performedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || t.transactionType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalReceiptQty = filtered
    .filter((t) => t.transactionType === 'RECEIPT')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalIssueQty = filtered
    .filter((t) => t.transactionType === 'ISSUE')
    .reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Top Controls & Search */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-purple-600" />
            <span>SỔ THẺ KHO & NHẬT KÝ BIẾN ĐỘNG VẬT TƯ (NHẬP - XUẤT)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận chi tiết từng lần Nhập kho, Xuất kho, Tồn trước và Tồn sau của từng mã vật tư
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
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã vật tư, tên vật tư, số phiếu (PNK, PXK)..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none cursor-pointer"
        >
          <option value="ALL">-- Tất Cả Giao Dịch --</option>
          <option value="RECEIPT">📥 Chỉ Nhập Kho (Receipt)</option>
          <option value="ISSUE">📤 Chỉ Xuất Kho (Issue)</option>
          <option value="RETURN">↩️ Trả Lại Vật Tư</option>
          <option value="ADJUSTMENT_IN">➕ Điều Chỉnh Tăng</option>
          <option value="ADJUSTMENT_OUT">➖ Điều Chỉnh Giảm</option>
        </select>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl">
          <div className="text-[11px] text-slate-500 font-bold uppercase">Tổng Giao Dịch</div>
          <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">{filtered.length} lần</div>
        </div>
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-2xl">
          <div className="text-[11px] text-emerald-600 font-bold uppercase">Tổng Nhập Trong Danh Sách</div>
          <div className="text-xl font-mono font-bold text-emerald-700 mt-0.5">+{totalReceiptQty.toLocaleString()} ĐVT</div>
        </div>
        <div className="p-3.5 bg-amber-50 border border-amber-200/60 rounded-2xl">
          <div className="text-[11px] text-amber-600 font-bold uppercase">Tổng Xuất Trong Danh Sách</div>
          <div className="text-xl font-mono font-bold text-amber-700 mt-0.5">-{totalIssueQty.toLocaleString()} ĐVT</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Thời Gian</th>
                <th className="py-3 px-3">Mã Phiếu</th>
                <th className="py-3 px-3">Loại Giao Dịch</th>
                <th className="py-3 px-3">Mã Vật Tư</th>
                <th className="py-3 px-3">Tên Vật Tư</th>
                <th className="py-3 px-2 text-center">ĐVT</th>
                <th className="py-3 px-3 text-right">Tồn Trước</th>
                <th className="py-3 px-3 text-right">Số Lượng</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">Tồn Sau</th>
                <th className="py-3 px-3 text-right">Đơn Giá</th>
                <th className="py-3 px-3">Người Thực Hiện</th>
                <th className="py-3 px-3">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filtered.map((t) => {
                const isReceipt = t.transactionType === 'RECEIPT' || t.transactionType === 'ADJUSTMENT_IN';
                return (
                  <tr key={t.id} className="hover:bg-slate-100 transition">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {t.performedAt}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-600 whitespace-nowrap">
                      {t.referenceId}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isReceipt ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <ArrowDownToLine className="w-3 h-3" /> NHẬP KHO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <ArrowUpFromLine className="w-3 h-3" /> XUẤT KHO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-700 whitespace-nowrap">
                      {t.materialCode}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {t.materialName}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-500 font-mono">
                      {t.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {t.beforeQuantity.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold ${isReceipt ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isReceipt ? `+${t.quantity.toLocaleString()}` : `-${t.quantity.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-sky-700">
                      {t.afterQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                      {formatVND(t.unitCost)}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {t.performedBy}
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate" title={t.note}>
                      {t.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
