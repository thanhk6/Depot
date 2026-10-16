import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info, HelpCircle } from 'lucide-react';
import { STATUS_COLORS } from '../constants/yardConstants';

export const YardLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const legendItems = [
    { label: 'Available (Sẵn Sàng)', color: STATUS_COLORS.AVAILABLE.fillHex, bg: 'bg-emerald-500' },
    { label: 'In Yard (Lưu Bãi)', color: STATUS_COLORS.IN_YARD.fillHex, bg: 'bg-sky-500' },
    { label: 'Repair (Sửa Chữa EMR)', color: STATUS_COLORS.REPAIR.fillHex, bg: 'bg-amber-500' },
    { label: 'Cleaning (Rửa/Vệ Sinh)', color: STATUS_COLORS.CLEANING.fillHex, bg: 'bg-orange-500' },
    { label: 'Hold (Tạm Giữ Khóa)', color: STATUS_COLORS.HOLD.fillHex, bg: 'bg-rose-500' },
    { label: 'Reserved (Đã Đặt Chỗ)', color: STATUS_COLORS.RESERVED.fillHex, bg: 'bg-purple-500' },
    { label: 'Empty Slot (Ô Trống)', color: STATUS_COLORS.EMPTY_SLOT.fillHex, bg: 'bg-slate-200' }
  ];

  return (
    <div className="bg-white backdrop-blur border border-slate-200 rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden text-xs">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2.5 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
      >
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span className="font-bold text-slate-700 tracking-wide">BẢNG CHÚ GIẢI TRẠNG THÁI (LEGEND)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="text-[10px] hidden sm:inline">{isOpen ? 'Thu gọn' : 'Mở rộng'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-3.5 space-y-3">
          {/* Status grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-md shrink-0 shadow-sm border border-black/20"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 font-medium text-[11px] truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Quick instructions & Hotkeys */}
          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span>🖱️ <strong>Cuộn chuột:</strong> Phóng to / Thu nhỏ</span>
              <span>✋ <strong>Giữ & kéo:</strong> Di chuyển toàn bãi (Pan)</span>
              <span>🎯 <strong>Click Slot:</strong> Mở ngăn xếp Tiers (1-4)</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-teal-600">
              <span>Định dạng: BLOCK-BAY-ROW-TIER (VD: A-05-03-02)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
