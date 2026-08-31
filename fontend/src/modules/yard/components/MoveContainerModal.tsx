import React, { useState, useEffect } from 'react';
import { YardContainer, YardBlock } from '../types/yardTypes';
import {
  X,
  MoveRight,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Send,
  FileText
} from 'lucide-react';

interface MoveContainerModalProps {
  container: YardContainer | null;
  blocks: YardBlock[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmMove: (payload: {
    containerId: string;
    targetLocation: string;
    reason: string;
  }) => void;
}

export const MoveContainerModal: React.FC<MoveContainerModalProps> = ({
  container,
  blocks = [],
  isOpen,
  onClose,
  onConfirmMove
}) => {
  const [destBlock, setDestBlock] = useState<string>('');
  const [destBay, setDestBay] = useState<number>(1);
  const [destRow, setDestRow] = useState<number>(1);
  const [destTier, setDestTier] = useState<number>(1);
  const [reason, setReason] = useState<string>('Đảo chuyển vị trí phục vụ bốc xuất / sửa chữa EMR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (container) {
      setDestBlock(container.blockId || blocks[0]?.blockCode || '');
      setDestBay(container.bayNo || 1);
      setDestRow(container.rowNo || 1);
      setDestTier(container.tierNo || 1);
    }
  }, [container, blocks]);

  if (!isOpen || !container) return null;

  const selectedBlockObj = blocks.find((b) => b.blockCode === destBlock) || blocks[0];
  const maxTier = selectedBlockObj?.maxTier || 4;
  const maxBay = selectedBlockObj?.bayCount || 8;
  const maxRow = selectedBlockObj?.rowCount || 4;

  const targetLocationCode = `${destBlock || selectedBlockObj?.blockCode || ''}-${String(destBay).padStart(2, '0')}-${String(
    destRow
  ).padStart(2, '0')}-${String(destTier).padStart(2, '0')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmMove({
        containerId: container.id,
        targetLocation: targetLocationCode,
        reason
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in text-xs">
        {/* Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-600/20 text-teal-400 rounded-2xl border border-teal-500/30">
              <MoveRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">ĐIỀU CHUYỂN VỊ TRÍ CONTAINER (YARD RELOCATE)</h3>
              <p className="text-slate-400 text-xs">
                Cập nhật tọa độ bãi mới & ghi nhận lịch sử đảo chuyển
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Container Info */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Container
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-mono text-teal-300">
                  {container.containerNo}
                </span>
                <span className="text-slate-400">({container.shippingLine})</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                Vị Trí Cũ
              </span>
              <span className="font-mono font-bold text-slate-300 text-sm">
                {container.locationCode}
              </span>
            </div>
          </div>

          {/* Destination Slot Builder */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Vị Trí Mới (Target Slot)</span>
              </span>
              <span className="font-mono font-bold text-teal-400 text-sm">{targetLocationCode}</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {/* Block */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Block:</label>
                <select
                  value={destBlock}
                  onChange={(e) => setDestBlock(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
                >
                  {blocks.map((b) => (
                    <option key={b.id} value={b.blockCode}>
                      Block {b.blockCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bay */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bay (1-{maxBay}):</label>
                <select
                  value={destBay}
                  onChange={(e) => setDestBay(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono cursor-pointer"
                >
                  {Array.from({ length: maxBay }, (_, i) => i + 1).map((b) => (
                    <option key={b} value={b}>
                      Bay {String(b).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Row (1-{maxRow}):</label>
                <select
                  value={destRow}
                  onChange={(e) => setDestRow(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono cursor-pointer"
                >
                  {Array.from({ length: maxRow }, (_, i) => i + 1).map((r) => (
                    <option key={r} value={r}>
                      Row {String(r).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Tier (1-{maxTier}):</label>
                <select
                  value={destTier}
                  onChange={(e) => setDestTier(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-teal-300 font-mono font-bold cursor-pointer"
                >
                  {Array.from({ length: maxTier }, (_, i) => i + 1).map((t) => (
                    <option key={t} value={t}>
                      Tier {String(t).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Lý Do Điều Chuyển (Movement Reason)
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-teal-500"
              placeholder="Nhập lý do đảo chuyển bãi..."
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-2.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              Hệ thống sẽ tự động cập nhật lại tình trạng ô trống (Slot Empty) ở vị trí cũ và chiếm dụng vị trí mới, đồng thời ghi log kiểm toán.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN ĐIỀU CHUYỂN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
