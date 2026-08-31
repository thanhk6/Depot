import React, { useState, useEffect } from 'react';
import { Stocktake, StocktakeDetail } from '../../types';
import { X, ClipboardCheck, Save, Send, CheckCircle2, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface StocktakeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocktake: Stocktake | null;
  onSaveCounts: (stocktakeId: number, counts: { detailId: number; actualQuantity: number; reason?: string }[], nextStatus?: Stocktake['status']) => void;
  onPostStocktake: (stocktakeId: number, approvedBy: string) => void;
}

export const StocktakeDetailModal: React.FC<StocktakeDetailModalProps> = ({
  isOpen,
  onClose,
  stocktake,
  onSaveCounts,
  onPostStocktake
}) => {
  const [details, setDetails] = useState<StocktakeDetail[]>([]);
  const [approverName, setApproverName] = useState<string>('Nguyễn Thị Thu (Kế toán trưởng)');

  useEffect(() => {
    if (stocktake) {
      setDetails([...stocktake.details]);
      setApproverName(stocktake.approvedBy || 'Nguyễn Thị Thu (Kế toán trưởng)');
    }
  }, [stocktake, isOpen]);

  if (!isOpen || !stocktake) return null;

  const isEditable = stocktake.status === 'DRAFT' || stocktake.status === 'COUNTING' || stocktake.status === 'REVIEW';
  const canPost = stocktake.status === 'APPROVED' || stocktake.status === 'REVIEW';
  const isPosted = stocktake.status === 'POSTED';

  const handleActualQtyChange = (detailId: number, actual: number) => {
    setDetails((prev) =>
      prev.map((d) => {
        if (d.id === detailId) {
          const diff = actual - d.systemQuantity;
          return {
            ...d,
            actualQuantity: actual,
            difference: diff,
            differenceValue: diff * d.unitCost
          };
        }
        return d;
      })
    );
  };

  const handleReasonChange = (detailId: number, reason: string) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === detailId ? { ...d, reason } : d))
    );
  };

  const totalSystem = details.reduce((sum, d) => sum + d.systemQuantity, 0);
  const totalActual = details.reduce((sum, d) => sum + d.actualQuantity, 0);
  const totalDiff = details.reduce((sum, d) => sum + d.difference, 0);
  const totalDiffValue = details.reduce((sum, d) => sum + d.differenceValue, 0);

  const handleSaveProgress = (status: Stocktake['status']) => {
    const counts = details.map((d) => ({
      detailId: d.id,
      actualQuantity: d.actualQuantity,
      reason: d.reason
    }));
    onSaveCounts(stocktake.id, counts, status);
  };

  const handlePost = () => {
    onPostStocktake(stocktake.id, approverName);
    onClose();
  };

  const getStatusBadge = (status: Stocktake['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-bold border border-slate-700">1. NHÁP (DRAFT)</span>;
      case 'COUNTING':
        return <span className="px-2.5 py-1 bg-sky-950 text-sky-400 rounded-lg font-bold border border-sky-800">2. ĐANG ĐẾM (COUNTING)</span>;
      case 'REVIEW':
        return <span className="px-2.5 py-1 bg-amber-950 text-amber-400 rounded-lg font-bold border border-amber-800">3. ĐỐI SOÁT (REVIEW)</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-indigo-950 text-indigo-400 rounded-lg font-bold border border-indigo-800">4. ĐÃ DUYỆT (APPROVED)</span>;
      case 'POSTED':
        return <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 rounded-lg font-bold border border-emerald-800">5. ĐÃ CHỐT TỒN KHO (POSTED)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{stocktake.stocktakeNo}</h2>
                {getStatusBadge(stocktake.status)}
              </div>
              <p className="text-xs text-slate-400">{stocktake.title}</p>
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
          {/* Info Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Ngày kiểm kê:</span>
              <span className="font-semibold text-white font-mono">{stocktake.stocktakeDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Người kiểm đếm:</span>
              <span className="font-semibold text-white">{stocktake.countedBy}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Người duyệt:</span>
              <span className="font-semibold text-white">{stocktake.approvedBy || 'Chờ duyệt'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kho:</span>
              <span className="font-semibold text-amber-400">Kho Duy Nhất EMR</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Vật Tư</th>
                  <th className="px-3 py-2.5 w-20 text-center">ĐVT</th>
                  <th className="px-3 py-2.5 w-24 text-center">Tồn Sổ Sách</th>
                  <th className="px-3 py-2.5 w-28 text-center">Tồn Thực Tế</th>
                  <th className="px-3 py-2.5 w-24 text-center">Chênh Lệch</th>
                  <th className="px-3 py-2.5 w-32 text-right">Giá Trị Lệch</th>
                  <th className="px-3 py-2.5">Giải Trình / Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {details.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-900/40 ${row.difference !== 0 ? 'bg-amber-950/20' : ''}`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold text-slate-200 block">[{row.materialCode}]</span>
                      <span className="text-slate-400">{row.materialName}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-400 font-semibold">{row.unit}</td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-300">
                      {row.systemQuantity}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditable ? (
                        <input
                          type="number"
                          min="0"
                          value={row.actualQuantity}
                          onChange={(e) => handleActualQtyChange(row.id, Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:border-purple-500 focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono font-bold text-white block text-center">
                          {row.actualQuantity}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold">
                      {row.difference === 0 ? (
                        <span className="text-emerald-400">0</span>
                      ) : row.difference > 0 ? (
                        <span className="text-sky-400">+{row.difference}</span>
                      ) : (
                        <span className="text-rose-400">{row.difference}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold">
                      {row.differenceValue === 0 ? (
                        <span className="text-slate-400">0 đ</span>
                      ) : row.differenceValue > 0 ? (
                        <span className="text-sky-400">+{formatVND(row.differenceValue)}</span>
                      ) : (
                        <span className="text-rose-400">{formatVND(row.differenceValue)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditable ? (
                        <input
                          type="text"
                          value={row.reason}
                          onChange={(e) => handleReasonChange(row.id, e.target.value)}
                          placeholder="Lý do chênh lệch..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white focus:border-purple-500 focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-300">{row.reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900/80 font-bold border-t border-slate-800">
                <tr>
                  <td colSpan={2} className="px-3 py-2.5 text-white">TỔNG CỘNG:</td>
                  <td className="px-3 py-2.5 text-center font-mono text-slate-300">{totalSystem}</td>
                  <td className="px-3 py-2.5 text-center font-mono text-white">{totalActual}</td>
                  <td className="px-3 py-2.5 text-center font-mono">
                    <span className={totalDiff === 0 ? 'text-emerald-400' : totalDiff > 0 ? 'text-sky-400' : 'text-rose-400'}>
                      {totalDiff > 0 ? `+${totalDiff}` : totalDiff}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={totalDiffValue === 0 ? 'text-slate-400' : totalDiffValue > 0 ? 'text-sky-400' : 'text-rose-400'}>
                      {totalDiffValue > 0 ? `+${formatVND(totalDiffValue)}` : formatVND(totalDiffValue)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Workflow Actions */}
          {!isPosted && (
            <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Chuyển trạng thái đợt kiểm kê:</span>
                {stocktake.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={() => handleSaveProgress('COUNTING')}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition"
                  >
                    Bắt đầu đếm (COUNTING)
                  </button>
                )}
                {stocktake.status === 'COUNTING' && (
                  <button
                    type="button"
                    onClick={() => handleSaveProgress('REVIEW')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition"
                  >
                    Gửi đối soát (REVIEW)
                  </button>
                )}
                {stocktake.status === 'REVIEW' && (
                  <button
                    type="button"
                    onClick={() => handleSaveProgress('APPROVED')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
                  >
                    Phê duyệt kết quả (APPROVED)
                  </button>
                )}
              </div>

              {canPost && (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    placeholder="Tên kế toán / trưởng phòng duyệt..."
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <button
                    type="button"
                    onClick={handlePost}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CHỐT TỒN KHO (POSTED)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <span className="text-slate-400 text-xs">
            {isPosted ? `Đã chốt cập nhật tồn kho vào lúc: ${stocktake.postedAt}` : 'Lưu lại tiến độ đếm bất kỳ lúc nào'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs"
            >
              Đóng
            </button>
            {isEditable && (
              <button
                type="button"
                onClick={() => handleSaveProgress(stocktake.status)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Tiến Độ Đếm</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
