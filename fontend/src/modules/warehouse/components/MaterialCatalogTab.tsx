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
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            <span>Danh Mục Master Vật Tư Sửa Chữa Container EMR</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-900">{materials.length}</strong> vật tư, phụ tùng và vật liệu chuẩn IICL-6
          </p>
        </div>

        <button
          onClick={onOpenCreateMaterial}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg  transition"
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
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none w-full md:w-auto"
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
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    Không tìm thấy vật tư nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-white transition">
                    <td className="px-3.5 py-3 font-mono font-bold text-amber-600 whitespace-nowrap">
                      {m.materialCode}
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="font-semibold text-slate-900 block">{m.materialName}</span>
                      <span className="text-[11px] text-slate-500">Hiệu: {m.brand || 'OEM'}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded font-semibold text-[10px]">
                        {m.materialGroupId}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center font-bold text-slate-700 font-mono">
                      {m.unit}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono">
                        {m.materialType}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-700 max-w-xs truncate" title={m.specification}>
                      {m.specification || '-'}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-amber-700">
                      {formatVND(m.averageCost)}
                    </td>
                    <td className="px-3.5 py-3 text-center font-mono text-xs">
                      <span className="text-slate-500">{m.minimumStock}</span> /{' '}
                      <span className="text-slate-500">{m.maximumStock}</span> /{' '}
                      <strong className="text-amber-600 font-bold">{m.reorderLevel}</strong>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <button
                        onClick={() => onEditMaterial(m)}
                        title="Chỉnh sửa vật tư"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded-lg transition"
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
