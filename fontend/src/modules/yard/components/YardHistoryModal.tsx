import React from 'react';
import { YardContainer, YardMoveHistory } from '../types/yardTypes';
import {
  X,
  History,
  MapPin,
  ArrowRight,
  User,
  Truck,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

interface YardHistoryModalProps {
  container: YardContainer | null;
  histories: YardMoveHistory[];
  isOpen: boolean;
  onClose: () => void;
}

export const YardHistoryModal: React.FC<YardHistoryModalProps> = ({
  container,
  histories,
  isOpen,
  onClose
}) => {
  if (!isOpen || !container) return null;

  const contHistories = histories.filter(
    (h) => h.containerId === container.id || h.containerNo === container.containerNo
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in text-xs flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                LỊCH SỬ ĐẢO CHUYỂN VỊ TRÍ – {container.containerNo}
              </h3>
              <p className="text-slate-400 text-xs">
                Toàn bộ nhật ký di dời bãi, phương tiện & nhân sự điều độ
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

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {contHistories.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-600" />
              <p>Chưa có lịch sử đảo chuyển nào cho Container này.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contHistories.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded font-bold">
                        #{contHistories.length - idx}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                        <span className="text-slate-400">{item.fromLocation}</span>
                        <ArrowRight className="w-4 h-4 text-teal-400" />
                        <span className="text-teal-300">{item.toLocation}</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.moveDate}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <strong>Lý do:</strong> {item.reason}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-amber-400" />
                      <span>Xe nâng: <strong className="text-slate-200">{item.forkliftCode}</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-400" />
                      <span>Điều độ: <strong className="text-slate-200">{item.userName}</strong></span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
