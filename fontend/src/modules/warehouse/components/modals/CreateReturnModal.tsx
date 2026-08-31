import React, { useState } from 'react';
import { Material, WorkOrderMaterial } from '../../types';
import { X, RotateCcw, Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  workOrderMaterials: WorkOrderMaterial[];
  onConfirmReturn: (
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    returnedBy: string,
    receivedBy: string,
    note: string,
    items: { materialId: number; quantity: number; condition: 'GOOD' | 'DAMAGED'; damageReason?: string }[]
  ) => void;
}

interface ReturnItemRow {
  materialId: number;
  quantity: number;
  condition: 'GOOD' | 'DAMAGED';
  damageReason?: string;
}

export const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  isOpen,
  onClose,
  materials = [],
  workOrderMaterials = [],
  onConfirmReturn
}) => {
  const availableWorkOrders = [
    { woNo: 'WO-20260816-00001', contNo: 'MSKU1234567', shippingLine: 'MAERSK LINE', defaultTech: 'Nguyễn Văn Hùng (Thợ gò hàn EMR)' },
    { woNo: 'WO-20260816-00002', contNo: 'MSKU7654321', shippingLine: 'MAERSK LINE', defaultTech: 'Lê Văn Tuấn (Thợ sửa cửa EMR)' },
    { woNo: 'WO-20260816-00003', contNo: 'MSKU8888999', shippingLine: 'MAERSK LINE', defaultTech: 'Vũ Đình Hải (Thợ sàn gỗ EMR)' },
    { woNo: 'WO-20260816-00004', contNo: 'MAEU4419208', shippingLine: 'MAERSK LINE', defaultTech: 'Nguyễn Văn Hùng (Thợ gò hàn EMR)' }
  ];

  const [selectedWO, setSelectedWO] = useState<string>(availableWorkOrders[0].woNo);
  const [returnedBy, setReturnedBy] = useState<string>(availableWorkOrders[0].defaultTech);
  const [receivedBy, setReceivedBy] = useState<string>('Trần Văn Mạnh (Thủ kho EMR)');
  const [note, setNote] = useState<string>('Hoàn trả vật tư thừa sau khi hoàn thành sửa chữa');
  const [items, setItems] = useState<ReturnItemRow[]>([
    {
      materialId: materials[0]?.id || 1,
      quantity: 1,
      condition: 'GOOD',
      damageReason: ''
    }
  ]);

  if (!isOpen) return null;

  const currentWO = availableWorkOrders.find((w) => w.woNo === selectedWO) || availableWorkOrders[0];

  const handleAddItem = () => {
    const defaultMat = materials[0];
    setItems((prev) => [
      ...prev,
      {
        materialId: defaultMat?.id || 1,
        quantity: 1,
        condition: 'GOOD',
        damageReason: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof ReturnItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    onConfirmReturn(
      `WO-${currentWO.woNo.slice(-6)}`,
      currentWO.woNo,
      `CONT-${currentWO.contNo}`,
      currentWO.contNo,
      currentWO.shippingLine,
      returnedBy,
      receivedBy,
      note,
      items.map((i) => ({ ...i, quantity: Number(i.quantity) }))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lập Phiếu Trả Vật Tư Sửa Chữa (PTK)</h2>
              <p className="text-xs text-slate-400">
                Nhập hoàn kho: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Lệnh Sửa Chữa & Cont <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedWO}
                onChange={(e) => {
                  setSelectedWO(e.target.value);
                  const matched = availableWorkOrders.find((w) => w.woNo === e.target.value);
                  if (matched) setReturnedBy(matched.defaultTech);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-semibold focus:border-sky-500 focus:outline-none"
              >
                {availableWorkOrders.map((wo) => (
                  <option key={wo.woNo} value={wo.woNo}>
                    {wo.woNo} • {wo.contNo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Thợ Hoàn Trả <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={returnedBy}
                onChange={(e) => setReturnedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Thủ Kho Tiếp Nhận</label>
              <input
                type="text"
                required
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Ghi Chú Hoàn Trả</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Thừa 1kg que hàn và 1 tấm tôn do tối ưu cắt gọt..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span>Danh Sách Vật Tư Trả</span>
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full text-[10px]">
                  {items.length} dòng
                </span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg flex items-center gap-1.5 font-medium transition"
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
                    <th className="px-3 py-2 w-24 text-center">Số Lượng</th>
                    <th className="px-3 py-2 w-36 text-center">Tình Trạng</th>
                    <th className="px-3 py-2">Lý Do Hỏng / Ghi Chú</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((row, idx) => {
                    const mat = materials.find((m) => m.id === row.materialId);

                    return (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="px-3 py-2">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleItemChange(idx, 'materialId', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:border-sky-500 focus:outline-none"
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
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-white"
                            />
                            <span className="text-slate-400 text-[10px] w-6">{mat?.unit}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.condition}
                            onChange={(e) => handleItemChange(idx, 'condition', e.target.value)}
                            className={`w-full border rounded-lg px-2 py-1.5 font-bold focus:outline-none ${
                              row.condition === 'GOOD'
                                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                                : 'bg-rose-950/80 border-rose-700 text-rose-300'
                            }`}
                          >
                            <option value="GOOD">TỐT (Cộng tồn khả dụng)</option>
                            <option value="DAMAGED">HỎNG (Cách ly kho phế liệu)</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.damageReason || ''}
                            onChange={(e) => handleItemChange(idx, 'damageReason', e.target.value)}
                            placeholder={row.condition === 'DAMAGED' ? 'Bắt buộc nhập lý do hỏng...' : 'Ghi chú thêm...'}
                            className={`w-full bg-slate-900 border rounded-lg px-2 py-1.5 text-white ${
                              row.condition === 'DAMAGED' && !row.damageReason
                                ? 'border-amber-500/80 bg-amber-950/20'
                                : 'border-slate-700'
                            }`}
                          />
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

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-slate-400 text-xs leading-relaxed space-y-1">
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Vật tư TỐT (GOOD): Tự động cộng lại vào Tồn khả dụng (Available = Quantity - Reserved - Damaged).</span>
            </p>
            <p className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Vật tư HỎNG (DAMAGED): Ghi nhận vào DamagedQuantity (không cộng vào Available) và tạo biên bản phế liệu.</span>
            </p>
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
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/20 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xác Nhận Nhận Trả Kho</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
