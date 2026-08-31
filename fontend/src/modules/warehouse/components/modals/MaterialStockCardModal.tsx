import React from 'react';
import { Material, StockBalance, StockTransaction } from '../../types';
import { X, BookOpen, ArrowDownToLine, ArrowUpFromLine, RotateCcw, SlidersHorizontal, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface MaterialStockCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  stockBalance: StockBalance | null;
  transactions: StockTransaction[];
}

export const MaterialStockCardModal: React.FC<MaterialStockCardModalProps> = ({
  isOpen,
  onClose,
  material,
  stockBalance,
  transactions = []
}) => {
  if (!isOpen || !material) return null;

  const matTransactions = transactions.filter((t) => t.materialId === material.id);

  const getTransactionBadge = (type: StockTransaction['transactionType']) => {
    switch (type) {
      case 'RECEIPT':
        return (
          <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800 font-bold inline-flex items-center gap-1">
            <ArrowDownToLine className="w-3 h-3" /> NHẬP KHO (RECEIPT)
          </span>
        );
      case 'ISSUE':
        return (
          <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 rounded border border-amber-800 font-bold inline-flex items-center gap-1">
            <ArrowUpFromLine className="w-3 h-3" /> XUẤT KHO (ISSUE)
          </span>
        );
      case 'RETURN':
        return (
          <span className="px-2 py-0.5 bg-sky-950/80 text-sky-300 rounded border border-sky-800 font-bold inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> TRẢ VẬT TƯ (RETURN)
          </span>
        );
      case 'ADJUSTMENT_IN':
        return (
          <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 rounded border border-indigo-800 font-bold inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Đ/C TĂNG (ADJ IN)
          </span>
        );
      case 'ADJUSTMENT_OUT':
        return (
          <span className="px-2 py-0.5 bg-purple-950/80 text-purple-300 rounded border border-purple-800 font-bold inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Đ/C GIẢM (ADJ OUT)
          </span>
        );
      case 'DAMAGE':
        return (
          <span className="px-2 py-0.5 bg-rose-950/80 text-rose-300 rounded border border-rose-800 font-bold inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> HỎNG/PHẾ LIỆU (DAMAGE)
          </span>
        );
      case 'RESERVE':
        return (
          <span className="px-2 py-0.5 bg-teal-950/80 text-teal-300 rounded border border-teal-800 font-bold inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> GIỮ CHO WO (RESERVE)
          </span>
        );
      default:
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Thẻ Kho Vật Tư Sửa Chữa (Stock Card)</h2>
              <p className="text-xs text-slate-400">
                Kho: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span> • Theo dõi lịch sử biến động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Material Snapshot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Mã & Tên Vật Tư:</span>
              <span className="font-mono font-bold text-white text-xs block">[{material.materialCode}]</span>
              <span className="text-slate-300 font-medium">{material.materialName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Nhóm & ĐVT:</span>
              <span className="font-semibold text-amber-400 block">{material.materialGroupId}</span>
              <span className="text-slate-300 font-mono">ĐVT: {material.unit}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Số Lượng Tồn Thực Tế:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono block">
                {stockBalance?.quantity || 0} {material.unit}
              </span>
              <span className="text-[11px] text-slate-400">
                (Khả dụng: <strong className="text-white">{stockBalance?.availableQuantity || 0}</strong> • Giữ: <strong className="text-sky-400">{stockBalance?.reservedQuantity || 0}</strong>)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Giá Trị Tồn Kho:</span>
              <span className="text-lg font-bold text-amber-400 font-mono block">
                {formatVND(stockBalance?.totalValue || 0)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Đơn giá TB: {formatVND(stockBalance?.averageCost || 0)}
              </span>
            </div>
          </div>

          {/* Transactions List */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Thời Gian</th>
                  <th className="px-3 py-2.5">Loại Biến Động</th>
                  <th className="px-3 py-2.5">Số Chứng Từ / Tham Chiếu</th>
                  <th className="px-3 py-2.5 w-20 text-center">Tồn Trước</th>
                  <th className="px-3 py-2.5 w-20 text-center">Số Lượng</th>
                  <th className="px-3 py-2.5 w-20 text-center">Tồn Sau</th>
                  <th className="px-3 py-2.5">Người Thực Hiện & Diễn Giải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Chưa có giao dịch biến động nào cho vật tư này.
                    </td>
                  </tr>
                ) : (
                  matTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2.5 font-mono text-slate-400 whitespace-nowrap">
                        {tx.performedAt}
                      </td>
                      <td className="px-3 py-2.5">{getTransactionBadge(tx.transactionType)}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono font-bold text-white block">{tx.referenceId}</span>
                        {tx.containerNo && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Cont: {tx.containerNo}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                        {tx.beforeQuantity}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold">
                        {tx.transactionType === 'RECEIPT' || tx.transactionType === 'ADJUSTMENT_IN' || tx.transactionType === 'RETURN' ? (
                          <span className="text-emerald-400">+{tx.quantity}</span>
                        ) : tx.transactionType === 'ISSUE' || tx.transactionType === 'ADJUSTMENT_OUT' ? (
                          <span className="text-rose-400">-{tx.quantity}</span>
                        ) : (
                          <span className="text-sky-400">{tx.quantity}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-white">
                        {tx.afterQuantity}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-slate-200 block">{tx.performedBy}</span>
                        <span className="text-slate-400 text-[11px]">{tx.note}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
