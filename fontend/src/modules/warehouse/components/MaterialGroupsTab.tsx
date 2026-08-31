import React from 'react';
import { MaterialGroup, StockBalance } from '../types';
import { Layers, Package, Boxes, Coins } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialGroupsTabProps {
  materialGroups: MaterialGroup[];
  stockBalances: StockBalance[];
  onSelectGroupFilter: (groupCode: string) => void;
}

export const MaterialGroupsTab: React.FC<MaterialGroupsTabProps> = ({
  materialGroups,
  stockBalances,
  onSelectGroupFilter
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>11 Nhóm Cấu Kiện Vật Tư Container Chuẩn IICL Depot EMR</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Phân loại khoa học theo kết cấu sửa chữa container (Cửa, Sàn gỗ, Vách tôn, Nóc, Khóa, Gioăng, Sơn, Hàn...)
        </p>
      </div>

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materialGroups.map((g) => {
          const items = stockBalances.filter((b) => b.materialGroup === g.code);
          const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
          const totalVal = items.reduce((sum, i) => sum + i.totalValue, 0);
          const reservedQty = items.reduce((sum, i) => sum + i.reservedQuantity, 0);

          return (
            <div
              key={g.id}
              onClick={() => onSelectGroupFilter(g.code)}
              className="p-5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl cursor-pointer transition shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-mono font-bold text-xs">
                    {g.code}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {items.length} mặt hàng
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{g.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{g.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tổng Tồn Kho:</span>
                  <span className="font-mono font-bold text-emerald-400">{totalQty} đơn vị</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Đang Giữ Cho WO:</span>
                  <span className="font-mono font-bold text-sky-400">{reservedQty} đơn vị</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400 block text-[10px]">Tổng Giá Trị Tồn Kho:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">{formatVND(totalVal)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
