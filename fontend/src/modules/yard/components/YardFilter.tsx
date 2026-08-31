import React from 'react';
import { YardFilterState } from '../types/yardTypes';
import { Search, RotateCcw, Filter, X } from 'lucide-react';

interface YardFilterProps {
  filters: YardFilterState;
  shippingLines: string[];
  blocks: { id: string; code: string; name: string }[];
  onFilterChange: (filters: YardFilterState) => void;
  onSearchSubmit: () => void;
  onResetFilters: () => void;
}

export const YardFilter: React.FC<YardFilterProps> = ({
  filters,
  shippingLines,
  blocks,
  onFilterChange,
  onSearchSubmit,
  onResetFilters
}) => {
  const handleChange = (field: keyof YardFilterState, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.shippingLine !== 'ALL' ||
    filters.block !== 'ALL' ||
    filters.zone !== 'ALL' ||
    filters.size !== 'ALL' ||
    filters.type !== 'ALL' ||
    filters.status !== 'ALL';

  return (
    <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Container Box */}
        <div className="relative flex-1 min-w-[260px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleChange('searchQuery', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm theo Số Container (MSKU...), Vị Trí (A-05-03), Hãng Tàu..."
            className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleChange('searchQuery', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 flex-1">
          {/* Shipping Line */}
          <select
            value={filters.shippingLine}
            onChange={(e) => handleChange('shippingLine', e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer truncate"
          >
            <option value="ALL">Tất cả Hãng Tàu</option>
            {(shippingLines || []).map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>

          {/* Block */}
          <select
            value={filters.block}
            onChange={(e) => handleChange('block', e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Tất cả Block</option>
            {(blocks || []).map((b) => (
              <option key={b.id} value={b.code}>
                Block {b.code}
              </option>
            ))}
          </select>

          {/* Zone Type */}
          <select
            value={filters.zone}
            onChange={(e) => handleChange('zone', e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Tất cả Khu Vực</option>
            <option value="STORAGE">Lưu Bãi (Storage)</option>
            <option value="REPAIR">Khu Sửa Chữa (Repair)</option>
            <option value="CLEANING">Khu Vệ Sinh (Cleaning)</option>
            <option value="HOLD">Khu Tạm Giữ (Hold)</option>
            <option value="STAGING">Khu Chờ Cấp (Staging)</option>
            <option value="GATE_IN">Cổng Vào (Gate-In)</option>
            <option value="GATE_OUT">Cổng Xuất (Gate-Out)</option>
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer font-medium"
          >
            <option value="ALL">Tất cả Trạng Thái</option>
            <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
            <option value="IN_YARD">IN_YARD (Lưu bãi)</option>
            <option value="REPAIR">REPAIR (Sửa chữa)</option>
            <option value="CLEANING">CLEANING (Vệ sinh)</option>
            <option value="HOLD">HOLD (Tạm giữ)</option>
            <option value="RESERVED">RESERVED (Đặt chỗ)</option>
            <option value="WAITING_GATE_OUT">WAITING_GATE_OUT (Chờ xuất)</option>
          </select>

          {/* Container Size */}
          <select
            value={filters.size}
            onChange={(e) => handleChange('size', e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Tất cả Size</option>
            <option value="20">20 Feet (20GP)</option>
            <option value="40">40 Feet (40HC/40DC)</option>
            <option value="45">45 Feet (45HC)</option>
          </select>

          {/* Container Type */}
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Tất cả Loại Cont</option>
            <option value="DRY">Khô Tiêu Chuẩn (DRY)</option>
            <option value="REEFER">Lạnh (REEFER)</option>
            <option value="OPEN_TOP">Mở Nóc (OPEN TOP)</option>
            <option value="FLAT_RACK">Mặt Bằng (FLAT RACK)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchSubmit}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>TÌM KIẾM</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Đặt lại toàn bộ bộ lọc"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
