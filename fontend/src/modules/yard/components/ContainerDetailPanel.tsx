import React from 'react';
import { YardContainer } from '../types/yardTypes';
import { STATUS_COLORS, HOLD_REASON_LABELS } from '../constants/yardConstants';
import {
  X,
  MapPin,
  Calendar,
  Layers,
  Truck,
  History,
  MoveRight,
  ShieldAlert,
  AlertTriangle,
  Weight,
  Tag,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface ContainerDetailPanelProps {
  container: YardContainer | null;
  onClose: () => void;
  onOpenMoveModal: (container: YardContainer) => void;
  onOpenDispatchModal: (container: YardContainer) => void;
  onOpenHistoryModal: (container: YardContainer) => void;
  onViewLifecycle?: (container: YardContainer) => void;
}

export const ContainerDetailPanel: React.FC<ContainerDetailPanelProps> = ({
  container,
  onClose,
  onOpenMoveModal,
  onOpenDispatchModal,
  onOpenHistoryModal,
  onViewLifecycle
}) => {
  if (!container) return null;

  const statusConfig = STATUS_COLORS[container.status] || STATUS_COLORS.AVAILABLE;
  const isHold = container.status === 'HOLD';
  const holdInfo = container.holdReason ? HOLD_REASON_LABELS[container.holdReason] : null;

  return (
    <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-20 text-xs overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl border border-teal-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-black text-slate-900">{container.containerNo}</h3>
            <p className="text-[10px] text-slate-500">{container.shippingLine}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Status & Condition Banner */}
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
              Trạng Thái Bãi
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${statusConfig.badgeBg}`}
            >
              {statusConfig.labelVi}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
              Phân Cấp (Grade)
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-mono ${
                container.condition === 'AV'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : container.condition === 'CL'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              GRADE {container.condition}
            </span>
          </div>
        </div>

        {/* Hold Alert Box if HOLD */}
        {isHold && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-200 animate-pulse">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>CẢNH BÁO NIÊM PHONG (CONTAINER ON HOLD)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              <strong>Lý do:</strong> {holdInfo?.labelVi || container.holdReason}
            </p>
            {container.holdNotes && (
              <p className="text-[10px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                {container.holdNotes}
              </p>
            )}
            <p className="text-[10px] text-amber-700 font-semibold">
              ⚠️ Nghiêm cấm phát lệnh di chuyển hoặc bốc xuất khi chưa có phê duyệt giải tỏa!
            </p>
          </div>
        )}

        {/* Exact Location Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Vị Trí Hiện Tại</span>
            </span>
            <span className="text-[10px] text-teal-600 font-mono">Format: Block-Bay-Row-Tier</span>
          </div>

          <div className="p-3 bg-white border border-teal-200 rounded-xl flex items-center justify-between">
            <span className="text-base font-black font-mono text-teal-700">
              {container.locationCode}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">Block {container.locationCode.split('-')[0]}</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">Bay {container.bayNo}</span>
              <span className="px-1.5 py-0.5 bg-slate-100 rounded">Row {container.rowNo}</span>
              <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded font-bold">
                Tier {container.tierNo}
              </span>
            </div>
          </div>
        </div>

        {/* Container Specs */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Thông Số Kỹ Thuật (ISO Specs)
          </span>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-0.5">
              <span className="text-slate-500">Loại ISO / Kích Thước:</span>
              <p className="font-mono font-bold text-slate-900">
                {container.isoType} ({container.size} FT - {container.type})
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-500">Hãng Tàu (Line):</span>
              <p className="font-mono font-bold text-sky-600">{container.shippingLine}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-500">Trọng Lượng Vỏ (Tare):</span>
              <p className="font-mono text-slate-700">{container.tareWeightKg?.toLocaleString()} kg</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-500">Tải Trọng Max (Payload):</span>
              <p className="font-mono text-slate-700">{container.maxPayloadKg?.toLocaleString()} kg</p>
            </div>

            {container.sealNo && (
              <div className="col-span-2 space-y-0.5 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500">Số Niêm Phong (Seal No):</span>
                <p className="font-mono font-bold text-amber-700">{container.sealNo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps Lifecycle */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Mốc Thời Gian Khai Thác
          </span>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Thời Điểm Gate-In:</span>
              </span>
              <span className="font-mono font-bold text-slate-700">{container.gateInDate}</span>
            </div>

            {container.inspectionDate && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Giám Định IICL:</span>
                </span>
                <span className="font-mono font-bold text-slate-700">{container.inspectionDate}</span>
              </div>
            )}

            {container.repairDate && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sửa Chữa EMR:</span>
                </span>
                <span className="font-mono font-bold text-slate-700">{container.repairDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Operational Action Buttons */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenMoveModal(container)}
              disabled={isHold}
              className={`py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isHold
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg'
              }`}
            >
              <MoveRight className="w-4 h-4" />
              <span>ĐIỀU CHUYỂN</span>
            </button>

            <button
              onClick={() => onOpenDispatchModal(container)}
              disabled={isHold}
              className={`py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isHold
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>ĐIỀU XE NÂNG</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenHistoryModal(container)}
              className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Lịch Sử Vị Trí</span>
            </button>

            {onViewLifecycle && (
              <button
                onClick={() => onViewLifecycle(container)}
                className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-teal-700 hover:text-teal-200 border border-slate-200 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Xem Vòng Đời</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
