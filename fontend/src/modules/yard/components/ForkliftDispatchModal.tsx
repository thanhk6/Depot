import React, { useState, useEffect } from 'react';
import { YardContainer, Forklift, YardBlock } from '../types/yardTypes';
import {
  X,
  Truck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  BatteryCharging,
  Phone,
  AlertTriangle,
  Send,
  User
} from 'lucide-react';

interface ForkliftDispatchModalProps {
  container: YardContainer | null;
  forklifts: Forklift[];
  blocks: YardBlock[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch: (payload: {
    forkliftId: string;
    containerId: string;
    targetLocation: string;
    priority: 'NORMAL' | 'URGENT' | 'HIGH';
  }) => void;
}

export const ForkliftDispatchModal: React.FC<ForkliftDispatchModalProps> = ({
  container,
  forklifts = [],
  blocks = [],
  isOpen,
  onClose,
  onConfirmDispatch
}) => {
  const [selectedForkliftId, setSelectedForkliftId] = useState<string>(
    forklifts[0]?.id || 'FL-01'
  );
  const [destBlock, setDestBlock] = useState<string>('');
  const [destBay, setDestBay] = useState<number>(1);
  const [destRow, setDestRow] = useState<number>(1);
  const [destTier, setDestTier] = useState<number>(1);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'HIGH'>('NORMAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (forklifts.length > 0 && !forklifts.some((f) => f.id === selectedForkliftId)) {
      setSelectedForkliftId(forklifts[0]?.id || 'FL-01');
    }
  }, [forklifts, selectedForkliftId]);

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

  const selectedForklift = forklifts.find((f) => f.id === selectedForkliftId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmDispatch({
        forkliftId: selectedForkliftId,
        containerId: container.id,
        targetLocation: targetLocationCode,
        priority
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in text-xs">
        {/* Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">PHÁT LỆNH ĐIỀU ĐỘ XE NÂNG (FORKLIFT DISPATCH)</h3>
              <p className="text-slate-400 text-xs">
                Chỉ định phương tiện & vạch tuyến di chuyển container trên mặt bằng bãi
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
                Container Chỉ Định
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-mono text-teal-300">
                  {container.containerNo}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">
                  {container.isoType} ({container.size}FT)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                Vị Trí Hiện Tại
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {container.locationCode}
              </span>
            </div>
          </div>

          {/* Destination Slot Builder */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Vị Trí Đích Đến (Destination Slot)</span>
              </span>
              <span className="font-mono font-bold text-teal-400 text-xs">{targetLocationCode}</span>
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
                <label className="text-[10px] text-slate-400 block mb-1">Bay (1 - {maxBay}):</label>
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
                <label className="text-[10px] text-slate-400 block mb-1">Row (1 - {maxRow}):</label>
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
                <label className="text-[10px] text-slate-400 block mb-1">Tier (1 - {maxTier}):</label>
                <select
                  value={destTier}
                  onChange={(e) => setDestTier(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-teal-300 cursor-pointer"
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

          {/* Forklift Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Chọn Xe Nâng Thực Hiện (Available Forklifts)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {forklifts.map((fl) => {
                const isSelected = fl.id === selectedForkliftId;
                return (
                  <div
                    key={fl.id}
                    onClick={() => setSelectedForkliftId(fl.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-lg ring-1 ring-amber-400'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-white text-xs">{fl.code}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          fl.status === 'AVAILABLE'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {fl.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{fl.driverName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Tải: {fl.maxCapacityTons}T</span>
                        <span className="flex items-center gap-1 text-emerald-400 font-mono">
                          <BatteryCharging className="w-3 h-3" />
                          {fl.batteryPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="font-medium text-slate-300 text-[11px]">Mức Độ Ưu Tiên Lệnh:</span>
            <div className="flex items-center gap-2">
              {(['NORMAL', 'URGENT', 'HIGH'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-[10px] ${
                    priority === p
                      ? p === 'HIGH' || p === 'URGENT'
                        ? 'bg-rose-600 text-white'
                        : 'bg-teal-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p === 'NORMAL' ? 'Bình Thường' : p === 'URGENT' ? 'Khẩn Cấp' : 'Ưu Tiên Cao'}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition cursor-pointer"
            >
              HỦY LỆNH
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'ĐANG PHÁT LỆNH...' : 'PHÁT LỆNH ĐIỀU ĐỘ (DISPATCH)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
