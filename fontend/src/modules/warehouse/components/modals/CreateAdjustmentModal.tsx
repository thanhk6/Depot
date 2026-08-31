import React, { useState } from 'react';
import { Material, StockBalance } from '../../types';
import { X, SlidersHorizontal, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface CreateAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  stockBalances: StockBalance[];
  onConfirmAdjustment: (
    reasonType: 'INVENTORY_DIFFERENCE' | 'BROKEN' | 'LOST' | 'OTHER',
    reason: string,
    items: { materialId: number; type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'; quantity: number; note?: string }[]
  ) => void;
}

interface AdjustmentItemRow {
  materialId: number;
  type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';
  quantity: number;
  note?: string;
}

export const CreateAdjustmentModal: React.FC<CreateAdjustmentModalProps> = ({
  isOpen,
  onClose,
  materials = [],
  stockBalances = [],
  onConfirmAdjustment
}) => {
  const [reasonType, setReasonType] = useState<'INVENTORY_DIFFERENCE' | 'BROKEN' | 'LOST' | 'OTHER'>('INVENTORY_DIFFERENCE');
  const [reason, setReason] = useState<string>('Khớp chênh lệch kiểm kê định kỳ thực tế so với sổ sách');
  const [items, setItems] = useState<AdjustmentItemRow[]>([
    {
      materialId: materials[0]?.id || 1,
      type: 'ADJUSTMENT_OUT',
      quantity: 1,
      note: 'Lệch số đếm thực tế'
    }
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultMat = materials[0];
    setItems((prev) => [
      ...prev,
      {
        materialId: defaultMat?.id || 1,
        type: 'ADJUSTMENT_OUT',
        quantity: 1,
        note: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof AdjustmentItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !reason.trim()) return;

    onConfirmAdjustment(
      reasonType,
      reason,
      items.map((i) => ({ ...i, quantity: Number(i.quantity) }))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lập Phiếu Điều Chỉnh Tồn Kho (PDC)</h2>
              <p className="text-xs text-slate-400">
                Kho áp dụng: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span> (Bắt buộc lý do)
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Phân Loại Lý Do <span className="text-rose-400">*</span>
              </label>
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-indigo-500 focus:outline-none"
              >
                <option value="INVENTORY_DIFFERENCE">INVENTORY_DIFFERENCE (Lệch kiểm kê định kỳ)</option>
                <option value="BROKEN">BROKEN (Hư hỏng / Rơi vỡ trong kho)</option>
                <option value="LOST">LOST (Thất thoát / Không tìm thấy)</option>
                <option value="OTHER">OTHER (Khác / Cắt mẫu thí nghiệm IICL)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Mô Tả Chi Tiết Lý Do <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Cắt mẫu thử nghiệm kéo uốn thép Corten..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span>Vật Tư Cần Điều Chỉnh</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px]">
                  {items.length} dòng
                </span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg flex items-center gap-1.5 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm vật tư</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Vật Tư</th>
                    <th className="px-3 py-2 w-28 text-center">Tồn Hiện Tại</th>
                    <th className="px-3 py-2 w-36 text-center">Loại Biến Động</th>
                    <th className="px-3 py-2 w-28 text-center">Số Lượng Đ/C</th>
                    <th className="px-3 py-2 w-28 text-center">Tồn Sau Đ/C</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((row, idx) => {
                    const balance = stockBalances.find((b) => b.materialId === row.materialId);
                    const currentQty = balance?.quantity || 0;
                    const delta = row.type === 'ADJUSTMENT_IN' ? Number(row.quantity || 0) : -Number(row.quantity || 0);
                    const afterQty = Math.max(0, currentQty + delta);

                    return (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="px-3 py-2">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleItemChange(idx, 'materialId', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:border-indigo-500 focus:outline-none"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.materialCode}] {m.materialName} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-slate-300">
                          {currentQty} {balance?.unit}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.type}
                            onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                            className={`w-full border rounded-lg px-2 py-1.5 font-bold focus:outline-none ${
                              row.type === 'ADJUSTMENT_IN'
                                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                                : 'bg-rose-950/80 border-rose-700 text-rose-300'
                            }`}
                          >
                            <option value="ADJUSTMENT_IN">+ Tăng Tồn Kho</option>
                            <option value="ADJUSTMENT_OUT">- Giảm Tồn Kho</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-white"
                          />
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-amber-400">
                          {afterQty} {balance?.unit}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            disabled={items.length <= 1}
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Điều Chỉnh Tồn</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
