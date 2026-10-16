import React from 'react';
import { YardContainer, YardBlock } from '../types/yardTypes';
import { STATUS_COLORS } from '../constants/yardConstants';
import { buildTierStack } from '../utils/yardUtils';
import {
  X,
  Layers,
  MapPin,
  PlusCircle,
  MoveRight,
  History,
  Box,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LocationDetailPanelProps {
  block: YardBlock | null;
  bayNo: number;
  rowNo: number;
  containersInSlot: YardContainer[];
  onClose: () => void;
  onSelectContainer: (container: YardContainer) => void;
  onOpenMoveModal: (container: YardContainer) => void;
  onOpenDispatchModal: (container: YardContainer) => void;
  onPlaceContainer: (locationCode: string) => void;
}

export const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  block,
  bayNo,
  rowNo,
  containersInSlot,
  onClose,
  onSelectContainer,
  onOpenMoveModal,
  onOpenDispatchModal,
  onPlaceContainer
}) => {
  if (!block) return null;

  const maxTier = block.maxTier || 4;
  const tierStack = buildTierStack(maxTier, containersInSlot);
  const slotKey = `${block.blockCode}-${String(bayNo).padStart(2, '0')}-${String(rowNo).padStart(2, '0')}`;

  return (
    <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-20 text-xs overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-black text-slate-900">VỊ TRÍ {slotKey}</h3>
            <p className="text-[10px] text-slate-500">
              Block {block.blockCode} • Bay {String(bayNo).padStart(2, '0')} • Row {String(rowNo).padStart(2, '0')} (Max: {maxTier} Tiers)
            </p>
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
        {/* Slot Capacity Summary */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div>
            <span className="text-[10px] text-slate-500 block">Sức Chứa</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{maxTier} Tiers</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Đang Chứa</span>
            <span className="font-mono font-bold text-teal-600 text-sm">
              {containersInSlot.length} Cont
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Còn Trống</span>
            <span className="font-mono font-bold text-emerald-600 text-sm">
              {maxTier - containersInSlot.length} Slot
            </span>
          </div>
        </div>

        {/* Vertical Tier Stack (From Tier 4 down to Tier 1) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Ngăn Xếp Tầng (Vertical Tier Stack)</span>
            </span>
            <span className="text-[10px] text-slate-500">Từ Tầng Cao Nhất Xuống</span>
          </div>

          <div className="space-y-2">
            {tierStack.map(({ tierNo, container, isOccupied }) => {
              const tierCode = `${slotKey}-${String(tierNo).padStart(2, '0')}`;
              const statusConfig = container ? STATUS_COLORS[container.status] : null;

              return (
                <div
                  key={tierNo}
                  className={`p-3.5 rounded-2xl border transition ${
                    isOccupied
                      ? 'bg-slate-50 border-slate-200/80 hover:border-teal-200 shadow-md'
                      : 'bg-slate-50 border-dashed border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px] font-bold">
                        TIER {String(tierNo).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{tierCode}</span>
                    </div>

                    {isOccupied && statusConfig && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.badgeBg}`}
                      >
                        {statusConfig.labelVi.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {isOccupied && container ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          onClick={() => onSelectContainer(container)}
                          className="font-mono font-black text-sm text-teal-700 hover:underline cursor-pointer"
                        >
                          {container.containerNo}
                        </span>
                        <span className="text-[10px] font-bold text-sky-600 font-mono">
                          {container.shippingLine}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>
                          {container.isoType} • {container.size}FT • Grade {container.condition}
                        </span>
                        <span>Gate-In: {container.gateInDate?.split(' ')?.[0] || container.gateInDate || ''}</span>
                      </div>

                      {/* Micro actions for this container */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                        <button
                          onClick={() => onSelectContainer(container)}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer text-center"
                        >
                          Chi Tiết
                        </button>
                        <button
                          onClick={() => onOpenMoveModal(container)}
                          className="flex-1 py-1.5 px-2 bg-teal-50 hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-medium transition cursor-pointer text-center"
                        >
                          Chuyển Vị Trí
                        </button>
                        <button
                          onClick={() => onOpenDispatchModal(container)}
                          className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-medium transition cursor-pointer text-center"
                        >
                          Điều Xe Nâng
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1 text-slate-500">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Box className="w-3.5 h-3.5 text-slate-600" />
                        <span>Vị Trí Trống (Slot Available)</span>
                      </span>
                      <button
                        onClick={() => onPlaceContainer(tierCode)}
                        className="px-2.5 py-1 bg-white hover:bg-teal-600 hover:text-slate-900 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Đặt Container</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
