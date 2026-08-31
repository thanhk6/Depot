import React, { useState } from 'react';
import { Material, StockBalance, MaterialDamage } from '../../types';
import { X, AlertOctagon, Plus, CheckCircle2 } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface ReportDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  stockBalances: StockBalance[];
  onConfirmReport: (
    materialId: number,
    quantity: number,
    reason: string,
    resolution: MaterialDamage['resolution'],
    reportedBy: string,
    workOrderNo?: string,
    containerNo?: string
  ) => void;
}

export const ReportDamageModal: React.FC<ReportDamageModalProps> = ({
  isOpen,
  onClose,
  materials = [],
  stockBalances = [],
  onConfirmReport
}) => {
  const [materialId, setMaterialId] = useState<number>(materials[0]?.id || 1);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Rơi vỡ khi vận chuyển bốc xếp trong kho Depot');
  const [resolution, setResolution] = useState<MaterialDamage['resolution']>('PENDING_SURVEY');
  const [reportedBy, setReportedBy] = useState<string>('Trần Văn Mạnh (Thủ kho EMR)');
  const [workOrderNo, setWorkOrderNo] = useState<string>('');
  const [containerNo, setContainerNo] = useState<string>('');

  if (!isOpen) return null;

  const currentBalance = stockBalances.find((b) => b.materialId === materialId);
  const currentMat = materials.find((m) => m.id === materialId);
  const totalCost = quantity * (currentBalance?.averageCost || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || quantity <= 0) return;

    onConfirmReport(
      Number(materialId),
      Number(quantity),
      reason.trim(),
      resolution,
      reportedBy.trim(),
      workOrderNo.trim() || undefined,
      containerNo.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Biên Bản Khai Báo Vật Tư Hỏng / Phế Liệu</h2>
              <p className="text-xs text-slate-400">
                Kho: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span> • Tự động cách ly khỏi Tồn khả dụng
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Vật Tư Bị Hỏng <span className="text-rose-400">*</span>
            </label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:border-rose-500 focus:outline-none"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.materialCode}] {m.materialName} ({m.unit})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Tồn khả dụng hiện tại: <span className="text-emerald-400 font-bold">{currentBalance?.availableQuantity || 0} {currentMat?.unit}</span> (Tồn vật lý: {currentBalance?.quantity || 0})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Số Lượng Hỏng <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={currentBalance?.quantity || 100}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-center focus:border-rose-500 focus:outline-none"
                />
                <span className="text-slate-400 font-semibold w-12">{currentMat?.unit}</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Đề Xuất Xử Lý</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="PENDING_SURVEY">PENDING_SURVEY (Chờ giám định / Hội đồng kho)</option>
                <option value="RETURN_TO_SUPPLIER">RETURN_TO_SUPPLIER (Yêu cầu NCC đổi trả bảo hành)</option>
                <option value="REPAIRED">REPAIRED (Sửa chữa khắc phục nội bộ)</option>
                <option value="DISPOSED">DISPOSED (Thanh lý phế liệu sắt vụn)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Nguyên Nhân Gây Hư Hỏng <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Tuýp keo thủng bị đông cứng / Thép bị cong lệch do va chạm xe nâng..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Mã Lệnh WO (Nếu có)</label>
              <input
                type="text"
                value={workOrderNo}
                onChange={(e) => setWorkOrderNo(e.target.value)}
                placeholder="VD: WO-20260816-00001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Số Container (Nếu có)</label>
              <input
                type="text"
                value={containerNo}
                onChange={(e) => setContainerNo(e.target.value)}
                placeholder="VD: MSKU1234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800/40 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Ước tính giá trị thiệt hại vật tư:</span>
            <span className="text-sm font-bold text-rose-400 font-mono">{formatVND(totalCost)}</span>
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ghi Nhận Hư Hỏng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
