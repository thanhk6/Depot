import React from 'react';
import { YardZone, YardContainer } from '../types/yardTypes';
import { ZONE_TYPE_CONFIG, STATUS_COLORS } from '../constants/yardConstants';
import {
  X,
  Layers,
  MapPin,
  Wrench,
  Droplets,
  ShieldAlert,
  LogOut,
  LogIn,
  Truck,
  Eye
} from 'lucide-react';

interface ZoneDetailModalProps {
  zone: YardZone | null;
  containersInZone: YardContainer[];
  isOpen: boolean;
  onClose: () => void;
  onSelectContainer: (container: YardContainer) => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  containersInZone,
  isOpen,
  onClose,
  onSelectContainer
}) => {
  if (!isOpen || !zone) return null;

  const config = ZONE_TYPE_CONFIG[zone.zoneType] || ZONE_TYPE_CONFIG.STORAGE;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in text-xs flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-teal-400 rounded-2xl border border-slate-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{zone.zoneName}</h3>
              <p className="text-slate-400 text-xs">{config.nameVi} • Mã: {zone.zoneCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Zone Description */}
          {zone.description && (
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300">
              {zone.description}
            </div>
          )}

          {/* Container Count Summary */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="font-semibold text-slate-300">
              Tổng số Container đang tập kết tại khu vực:
            </span>
            <span className="font-mono font-bold text-teal-400 text-sm">
              {containersInZone.length} Container
            </span>
          </div>

          {/* Container List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Danh Sách Container Trong Khu Vực
            </span>

            {containersInZone.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500">
                Hiện không có Container nào nằm tại khu vực này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {containersInZone.map((cont) => {
                  const statusConf = STATUS_COLORS[cont.status] || STATUS_COLORS.AVAILABLE;
                  return (
                    <div
                      key={cont.id}
                      onClick={() => {
                        onSelectContainer(cont);
                        onClose();
                      }}
                      className="p-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/50 rounded-2xl transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-sm text-white group-hover:text-teal-300 transition">
                          {cont.containerNo}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusConf.badgeBg}`}
                        >
                          {statusConf.labelVi.split(' ')[0]}
                        </span>
                      </div>

                      <div className="space-y-1 text-[10px] text-slate-400">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sky-400">{cont.shippingLine}</span>
                          <span className="font-mono">{cont.isoType}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 font-mono">
                          <span>Vị trí: <strong className="text-teal-300">{cont.locationCode}</strong></span>
                          <span>Grade {cont.condition}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
