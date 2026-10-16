import React, { useState, useEffect } from 'react';
import { Material, Supplier } from '../../types';
import { X, ArrowDownToLine, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  suppliers: Supplier[];
  onConfirmReceipt: (
    supplierId: number,
    receiptDate: string,
    note: string,
    items: { materialId: number; quantity: number; unitCost: number; note?: string }[]
  ) => Promise<{ success: boolean; error?: string }>;
}

interface ReceiptItemRow {
  materialId: number;
  quantity: number;
  unitCost: number;
  note?: string;
}

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  isOpen,
  onClose,
  materials = [],
  suppliers = [],
  onConfirmReceipt
}) => {
  const [supplierId, setSupplierId] = useState<number>(suppliers[0]?.id || 1);
  const [receiptDate, setReceiptDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [note, setNote] = useState<string>('Nhập vật tư theo đơn đặt hàng bổ sung kho EMR');
  const [items, setItems] = useState<ReceiptItemRow[]>([
    {
      materialId: materials[0]?.id || 1,
      quantity: 10,
      unitCost: materials[0]?.averageCost || 500000,
      note: ''
    }
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (materials.length > 0 && items.length === 0) {
      setItems([
        {
          materialId: materials[0].id,
          quantity: 10,
          unitCost: materials[0].averageCost,
          note: ''
        }
      ]);
    }
    if (suppliers.length > 0 && !suppliers.some((s) => s.id === supplierId)) {
      setSupplierId(suppliers[0].id);
    }
  }, [materials, suppliers, supplierId, items.length]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultMat = materials[0];
    setItems((prev) => [
      ...prev,
      {
        materialId: defaultMat?.id || 1,
        quantity: 5,
        unitCost: defaultMat?.averageCost || 100000,
        note: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ReceiptItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      if (field === 'materialId') {
        const mat = materials.find((m) => m.id === Number(value));
        if (mat) {
          current.unitCost = mat.lastPurchaseCost || mat.averageCost;
        }
      }
      updated[index] = current;
      return updated;
    });
  };

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    // Chờ kết quả THẬT từ backend trước khi đóng modal — trước đây gọi xong đóng modal ngay, không
    // kiểm tra kết quả gì cả, khiến lỗi ghi nhận nhập kho hoàn toàn vô hình với người dùng.
    const result = await onConfirmReceipt(Number(supplierId), receiptDate, note, items);
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Nhập kho thất bại do lỗi dữ liệu.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Lập Phiếu Nhập Kho Vật Tư (PNK)</h2>
              <p className="text-xs text-slate-500">
                Kho đích: <span className="text-amber-600 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 whitespace-pre-line font-medium">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Nhà Cung Cấp <span className="text-rose-600">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.supplierName} ({s.supplierCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Ngày Nhập Kho <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Diễn Giải / Ghi Chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Nhập thép tấm Corten và que hàn bổ sung..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <span>Danh Sách Vật Tư Nhập</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px]">
                  {items.length} dòng
                </span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-600 rounded-lg flex items-center gap-1.5 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm vật tư</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Vật Tư</th>
                    <th className="px-3 py-2 w-28 text-center">Số Lượng</th>
                    <th className="px-3 py-2 w-36 text-right">Đơn Giá Nhập</th>
                    <th className="px-3 py-2 w-36 text-right">Thành Tiền</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {items.map((row, idx) => {
                    const mat = materials.find((m) => m.id === row.materialId);
                    const rowTotal = Number(row.quantity || 0) * Number(row.unitCost || 0);

                    return (
                      <tr key={idx} className="hover:bg-white">
                        <td className="px-3 py-2">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleItemChange(idx, 'materialId', Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 focus:border-emerald-500 focus:outline-none"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.materialCode}] {m.materialName} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-mono text-center font-bold"
                            />
                            <span className="text-slate-500 text-[10px] w-8">{mat?.unit}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={row.unitCost}
                            onChange={(e) => handleItemChange(idx, 'unitCost', Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-right text-emerald-600 font-mono font-bold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                          {formatVND(rowTotal)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            disabled={items.length <= 1}
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-500 hover:text-rose-600 disabled:opacity-30 transition"
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

          {/* Summary Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs">Tổng số lượng vật tư nhập:</p>
              <p className="text-lg font-bold text-slate-900 font-mono">{totalQuantity} đơn vị</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs">Tổng giá trị phiếu nhập (VND):</p>
              <p className="text-xl font-bold text-emerald-600 font-mono">{formatVND(totalAmount)}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center gap-2 shadow-lg  transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'ĐANG GHI SQL SERVER...' : 'Xác Nhận Nhập Kho'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
