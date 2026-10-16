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
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-bold inline-flex items-center gap-1">
            <ArrowDownToLine className="w-3 h-3" /> NHẬP KHO (RECEIPT)
          </span>
        );
      case 'ISSUE':
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 font-bold inline-flex items-center gap-1">
            <ArrowUpFromLine className="w-3 h-3" /> XUẤT KHO (ISSUE)
          </span>
        );
      case 'RETURN':
        return (
          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded border border-sky-200 font-bold inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> TRẢ VẬT TƯ (RETURN)
          </span>
        );
      case 'ADJUSTMENT_IN':
        return (
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-bold inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Đ/C TĂNG (ADJ IN)
          </span>
        );
      case 'ADJUSTMENT_OUT':
        return (
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 font-bold inline-flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Đ/C GIẢM (ADJ OUT)
          </span>
        );
      case 'DAMAGE':
        return (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 font-bold inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> HỎNG/PHẾ LIỆU (DAMAGE)
          </span>
        );
      case 'RESERVE':
        return (
          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200 font-bold inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> GIỮ CHO WO (RESERVE)
          </span>
        );
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Thẻ Kho Vật Tư Sửa Chữa (Stock Card)</h2>
              <p className="text-xs text-slate-500">
                Kho: <span className="text-amber-600 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span> • Theo dõi lịch sử biến động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Material Snapshot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Mã & Tên Vật Tư:</span>
              <span className="font-mono font-bold text-slate-900 text-xs block">[{material.materialCode}]</span>
              <span className="text-slate-700 font-medium">{material.materialName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Nhóm & ĐVT:</span>
              <span className="font-semibold text-amber-600 block">{material.materialGroupId}</span>
              <span className="text-slate-700 font-mono">ĐVT: {material.unit}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Số Lượng Tồn Thực Tế:</span>
              <span className="text-lg font-bold text-emerald-600 font-mono block">
                {stockBalance?.quantity || 0} {material.unit}
              </span>
              <span className="text-[11px] text-slate-500">
                (Khả dụng: <strong className="text-slate-900">{stockBalance?.availableQuantity || 0}</strong> • Giữ: <strong className="text-sky-600">{stockBalance?.reservedQuantity || 0}</strong>)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Giá Trị Tồn Kho:</span>
              <span className="text-lg font-bold text-amber-600 font-mono block">
                {formatVND(stockBalance?.totalValue || 0)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Đơn giá TB: {formatVND(stockBalance?.averageCost || 0)}
              </span>
            </div>
          </div>

          {/* Transactions List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-200/60">
                {matTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Chưa có giao dịch biến động nào cho vật tư này.
                    </td>
                  </tr>
                ) : (
                  matTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white">
                      <td className="px-3 py-2.5 font-mono text-slate-500 whitespace-nowrap">
                        {tx.performedAt}
                      </td>
                      <td className="px-3 py-2.5">{getTransactionBadge(tx.transactionType)}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono font-bold text-slate-900 block">{tx.referenceId}</span>
                        {tx.containerNo && (
                          <span className="text-[10px] text-amber-600 font-mono">
                            Cont: {tx.containerNo}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-slate-500">
                        {tx.beforeQuantity}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold">
                        {tx.transactionType === 'RECEIPT' || tx.transactionType === 'ADJUSTMENT_IN' || tx.transactionType === 'RETURN' ? (
                          <span className="text-emerald-600">+{tx.quantity}</span>
                        ) : tx.transactionType === 'ISSUE' || tx.transactionType === 'ADJUSTMENT_OUT' ? (
                          <span className="text-rose-600">-{tx.quantity}</span>
                        ) : (
                          <span className="text-sky-600">{tx.quantity}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-900">
                        {tx.afterQuantity}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-slate-700 block">{tx.performedBy}</span>
                        <span className="text-slate-500 text-[11px]">{tx.note}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
