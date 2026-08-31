import React, { useState } from 'react';
import { Material, MaterialGroup } from '../types';
import { Search, Plus, Edit, Package, CheckCircle2, XCircle } from 'lucide-react';
import { formatVND } from '../../../utils/format';

interface MaterialCatalogTabProps {
  materials: Material[];
  materialGroups: MaterialGroup[];
  onOpenCreateMaterial: () => void;
  onEditMaterial: (mat: Material) => void;
}

export const MaterialCatalogTab: React.FC<MaterialCatalogTabProps> = ({
  materials,
  materialGroups,
  onOpenCreateMaterial,
  onEditMaterial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'ALL' || m.materialGroupId === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Danh Mục Master Vật Tư Sửa Chữa Container EMR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tổng cộng: <strong className="text-white">{materials.length}</strong> vật tư, phụ tùng và vật liệu chuẩn IICL-6
          </p>
        </div>

        <button
          onClick={onOpenCreateMaterial}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Vật Tư Mới</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã (MAT-...), Tên vật tư, Thương hiệu (CIMCO, Jotun...)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">-- Tất Cả Nhóm Cấu Kiện --</option>
          {materialGroups.map((g) => (
            <option key={g.code} value={g.code}>
              {g.code} - {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-3">Mã Vật Tư</th>
                <th className="px-3.5 py-3">Tên Vật Tư Container</th>
                <th className="px-3.5 py-3">Nhóm Cấu Kiện</th>
                <th className="px-3.5 py-3 text-center">ĐVT</th>
                <th className="px-3.5 py-3 text-center">Phân Loại</th>
                <th className="px-3.5 py-3">Quy Cách Kỹ Thuật</th>
                <th className="px-3.5 py-3 text-right">Đơn Giá TB</th>
                <th className="px-3.5 py-3 text-center">Mức Tồn (Min/Max/Reorder)</th>
                <th className="px-3.5 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    Không tìm thấy vật tư nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/60 transition">
                    <td className="px-3.5 py-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {m.materialCode}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="font-semibold text-white block">{m.materialName}</span>
                      <span className="text-[11px] text-slate-400">Hiệu: {m.brand || 'OEM'}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded font-semibold text-[10px]">
                        {m.materialGroupId}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center font-bold text-slate-300 font-mono">
                      {m.unit}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono">
                        {m.materialType}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-300 max-w-xs truncate" title={m.specification}>
                      {m.specification || '-'}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-300">
                      {formatVND(m.averageCost)}
                    </td>
                    <td className="px-3.5 py-3 text-center font-mono text-xs">
                      <span className="text-slate-400">{m.minimumStock}</span> /{' '}
                      <span className="text-slate-400">{m.maximumStock}</span> /{' '}
                      <strong className="text-amber-400 font-bold">{m.reorderLevel}</strong>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <button
                        onClick={() => onEditMaterial(m)}
                        title="Chỉnh sửa vật tư"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
