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

  // Đồng bộ đúng chuẩn "Dashboard ERP Tổng Quan" (dashboard/pages/DashboardPage.tsx) theo yêu cầu người
  // dùng 2026-09-06 — xem docs/frontend-theme-unification.md. Banner nền gradient sáng
  // (blue-50→white→indigo-50), KHÔNG còn hộp icon gradient tối, dải tab chuyển sang nền sáng. Giữ nguyên
  // các nút hành động + icon/màu riêng của Kho Vật Tư (amber/emerald).
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-bold font-mono">
            <Warehouse className="w-3.5 h-3.5" />
            <span>MÃ KHO: {WAREHOUSE_INFO.code}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Vật Tư (Nhập - Xuất - Tồn Kho EMR)
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Ghi nhận nhập vật tư, xuất vật tư sửa chữa và tự động tính toán số lượng tồn kho theo thời
            gian thực.
          </p>
        </div>

        {/* Quick Action Buttons — giữ nguyên màu nghiệp vụ riêng (emerald=nhập, amber=xuất) */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={onOpenCreateReceipt}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-sm transition whitespace-nowrap cursor-pointer active:scale-95"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>+ Nhập Vật Tư</span>
          </button>
          <button
            onClick={onOpenCreateIssue}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-1.5 shadow-sm transition whitespace-nowrap cursor-pointer active:scale-95"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>- Xuất Vật Tư</span>
          </button>
          {onOpenCreateMaterial && (
            <button
              onClick={onOpenCreateMaterial}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-sky-600 font-bold text-xs rounded-2xl flex items-center gap-1.5 border border-slate-200 shadow-sm transition whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Mã Vật Tư</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Navigation (nền sáng) */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none relative z-10">
        {tabs.map((t) => {
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectSubTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 bg-white/60 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
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
