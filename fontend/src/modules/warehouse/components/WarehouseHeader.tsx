import React from 'react';
import { Warehouse, Plus, ArrowDownToLine, ArrowUpFromLine, Receipt, BookOpen, Layers, Sparkles } from 'lucide-react';
import { WAREHOUSE_INFO } from '../types';

interface WarehouseHeaderProps {
  activeSubTab: string;
  onSelectSubTab: (tabId: string) => void;
  onOpenCreateReceipt: () => void;
  onOpenCreateIssue: () => void;
  onOpenCreateMaterial?: () => void;
}

export const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({
  activeSubTab,
  onSelectSubTab,
  onOpenCreateReceipt,
  onOpenCreateIssue,
  onOpenCreateMaterial
}) => {
  const tabs = [
    { id: 'stock_balance', label: '1. Báo Cáo Nhập - Xuất - Tồn', icon: <Layers className="w-4 h-4 text-amber-400" /> },
    { id: 'receipts', label: '2. Phiếu Nhập Kho (PNK)', icon: <ArrowDownToLine className="w-4 h-4 text-emerald-400" /> },
    { id: 'issues', label: '3. Phiếu Xuất Kho (PXK)', icon: <ArrowUpFromLine className="w-4 h-4 text-rose-400" /> },
    { id: 'transactions', label: '4. Sổ Thẻ Kho & Lịch Sử', icon: <Receipt className="w-4 h-4 text-purple-400" /> },
    { id: 'catalog', label: '5. Danh Mục Vật Tư', icon: <BookOpen className="w-4 h-4 text-sky-400" /> }
  ];

  // Đồng bộ đúng khuôn giao diện của "THÔNG BÁO & ZALO GATEWAY"
  // (`notifications/components/NotificationHeader.tsx`) theo yêu cầu người dùng: banner nền TRẮNG với
  // icon logo trong khối gradient xanh dương→sky→chàm, dải sub-tab bên dưới đổi hẳn sang nền TỐI. Giữ
  // nguyên các nút hành động + icon/màu riêng của Kho Vật Tư (amber/emerald), chỉ đổi khung/bố cục banner
  // và style dải tab cho khớp trang tham chiếu.
  return (
    <div className="bg-white border-b border-slate-200 -mt-3 -mx-3 sm:-mt-4 sm:-mx-4 md:-mt-6 md:-mx-6 mb-6 px-4 sm:px-6 pt-5 pb-0 shadow-sm">
      {/* Top Banner (nền trắng) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                QUẢN LÝ VẬT TƯ (NHẬP - XUẤT - TỒN KHO EMR)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                Mã kho: {WAREHOUSE_INFO.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi nhận nhập vật tư, xuất vật tư sửa chữa và tự động tính toán số lượng tồn kho theo thời gian thực
            </p>
          </div>
        </div>

        {/* Quick Action Buttons — giữ nguyên màu nghiệp vụ riêng (emerald=nhập, amber=xuất) */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <button
            onClick={onOpenCreateReceipt}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition whitespace-nowrap cursor-pointer active:scale-95"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>+ Nhập Vật Tư</span>
          </button>
          <button
            onClick={onOpenCreateIssue}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition whitespace-nowrap cursor-pointer active:scale-95"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>- Xuất Vật Tư</span>
          </button>
          {onOpenCreateMaterial && (
            <button
              onClick={onOpenCreateMaterial}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-sky-600 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Mã Vật Tư</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Navigation (nền tối — đúng dải tab của trang tham chiếu) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 mt-1">
        {tabs.map((t) => {
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectSubTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
                isActive
                  ? 'bg-slate-800/80 text-white border-blue-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
