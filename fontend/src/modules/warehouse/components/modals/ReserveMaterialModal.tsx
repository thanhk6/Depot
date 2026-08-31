import React, { useState } from 'react';
import { Material, StockBalance } from '../../types';
import { X, ShieldCheck, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReserveMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  stockBalances: StockBalance[];
  onConfirmReserve: (
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    materialId: number,
    quantity: number,
    repairItemName: string
  ) => { success: boolean; error?: string };
}

export const ReserveMaterialModal: React.FC<ReserveMaterialModalProps> = ({
  isOpen,
  onClose,
  materials = [],
  stockBalances = [],
  onConfirmReserve
}) => {
  const availableWorkOrders = [
    { woNo: 'WO-20260816-00001', contNo: 'MSKU1234567', shippingLine: 'MAERSK LINE' },
    { woNo: 'WO-20260816-00002', contNo: 'MSKU7654321', shippingLine: 'MAERSK LINE' },
    { woNo: 'WO-20260816-00003', contNo: 'MSKU8888999', shippingLine: 'MAERSK LINE' },
    { woNo: 'WO-20260816-00004', contNo: 'MAEU4419208', shippingLine: 'MAERSK LINE' },
    { woNo: 'WO-20260817-00005', contNo: 'MSKU9920112', shippingLine: 'MAERSK LINE' },
    { woNo: 'WO-20260817-00006', contNo: 'MAEU1109482', shippingLine: 'MAERSK LINE' }
  ];

  const [selectedWO, setSelectedWO] = useState<string>(availableWorkOrders[4].woNo);
  const [materialId, setMaterialId] = useState<number>(materials[0]?.id || 1);
  const [quantity, setQuantity] = useState<number>(1);
  const [repairItemName, setRepairItemName] = useState<string>('Thay thế cấu kiện hỏng theo báo giá Estimate');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentWO = availableWorkOrders.find((w) => w.woNo === selectedWO) || availableWorkOrders[0];
  const currentBalance = stockBalances.find((b) => b.materialId === materialId);
  const currentMat = materials.find((m) => m.id === materialId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = onConfirmReserve(
      `WO-${currentWO.woNo.slice(-6)}`,
      currentWO.woNo,
      `CONT-${currentWO.contNo}`,
      currentWO.contNo,
      currentWO.shippingLine,
      Number(materialId),
      Number(quantity),
      repairItemName
    );

    if (!res.success) {
      setErrorMessage(res.error || 'Không thể reserve vật tư.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Tạm Giữ Vật Tư (Reserve cho Work Order)</h2>
              <p className="text-xs text-slate-400">
                Kho: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span>
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

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Lệnh Sửa Chữa & Container <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedWO}
              onChange={(e) => setSelectedWO(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-semibold focus:border-teal-500 focus:outline-none"
            >
              {availableWorkOrders.map((wo) => (
                <option key={wo.woNo} value={wo.woNo}>
                  {wo.woNo} • {wo.contNo} ({wo.shippingLine})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Vật Tư Cần Tạm Giữ <span className="text-rose-400">*</span>
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-teal-500 focus:outline-none"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.materialCode}] {m.materialName} ({m.unit})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Tồn khả dụng hiện tại: <span className="text-emerald-400 font-bold">{currentBalance?.availableQuantity || 0} {currentMat?.unit}</span> (Tồn thực tế: {currentBalance?.quantity || 0})
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Số Lượng Giữ (Reserve) <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={currentBalance?.availableQuantity || 100}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-center focus:border-teal-500 focus:outline-none"
              />
              <span className="text-slate-400 font-semibold w-12">{currentMat?.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Hạng Mục Sửa Chữa Liên Quan</label>
            <input
              type="text"
              value={repairItemName}
              onChange={(e) => setRepairItemName(e.target.value)}
              placeholder="VD: Thay tấm tôn nóc số 2..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl text-teal-300 text-xs">
            <p className="font-semibold mb-1">Quy tắc Reserve vật tư:</p>
            <p className="text-[11px] text-slate-400">
              * Tạm giữ (Reserve) <strong>KHÔNG làm giảm số lượng tồn vật lý thực tế</strong> trong kho, nhưng sẽ làm giảm <strong>Tồn khả dụng (Available)</strong> để ngăn chặn lệnh khác xuất nhầm.
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-teal-600/20 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Xác Nhận Reserve</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
