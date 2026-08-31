import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Search,
  SlidersHorizontal,
  PackageCheck,
  AlertTriangle,
  TrendingDown,
  BarChart2,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react';

interface MaterialItem {
  id: string;
  code: string;
  nameVi: string;
  category: string;
  unit: string;
  quantityInStock: number;
  minStockThreshold: number;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
}

const INITIAL_MATERIALS: MaterialItem[] = [
  { id: 'MAT-001', code: 'STEEL-HP-20', nameVi: 'Thép tấm HP Corten Steel 2.0mm (Vách)', category: 'Tôn & Thép', unit: 'tấm', quantityInStock: 245, minStockThreshold: 50, unitPrice: 380000, supplier: 'Hòa Phát Steel', lastUpdated: '2026-08-04 08:30' },
  { id: 'MAT-002', code: 'STEEL-ROOF-16', nameVi: 'Mái sóng Container 1.6mm', category: 'Tôn & Thép', unit: 'm2', quantityInStock: 120, minStockThreshold: 30, unitPrice: 290000, supplier: 'Hoa Sen Metal', lastUpdated: '2026-08-04 09:15' },
  { id: 'MAT-003', code: 'PAINT-EPOXY-RAL7035', nameVi: 'Sơn Epoxy phủ xám ghi RAL7035', category: 'Sơn & Hóa Chất', unit: 'thùng 20L', quantityInStock: 18, minStockThreshold: 20, unitPrice: 1850000, supplier: 'Jotun Coatings', lastUpdated: '2026-08-03 16:40' },
  { id: 'MAT-004', code: 'PAINT-PRIMER-ZINC', nameVi: 'Sơn lót chống rỉ Zinc Rich Primer', category: 'Sơn & Hóa Chất', unit: 'thùng 20L', quantityInStock: 32, minStockThreshold: 15, unitPrice: 2100000, supplier: 'Kova Industrial', lastUpdated: '2026-08-04 07:20' },
  { id: 'MAT-005', code: 'WOOD-FLOOR-28', nameVi: 'Gỗ ván sàn Container Apitong 28mm', category: 'Ván Sàn', unit: 'tấm', quantityInStock: 85, minStockThreshold: 25, unitPrice: 750000, supplier: 'Gỗ Việt Nam Co.', lastUpdated: '2026-08-02 14:10' },
  { id: 'MAT-006', code: 'SEAL-RUBBER-DOOR', nameVi: 'Gioăng cao su đệm cửa J-Type 2.5m', category: 'Gioăng & Khóa', unit: 'sợi', quantityInStock: 140, minStockThreshold: 40, unitPrice: 160000, supplier: 'Sao Mai Rubber', lastUpdated: '2026-08-04 10:05' },
  { id: 'MAT-007', code: 'LOCK-HANDLE-ROD', nameVi: 'Tay khóa & Tay quay cửa Container', category: 'Gioăng & Khóa', unit: 'bộ', quantityInStock: 12, minStockThreshold: 15, unitPrice: 420000, supplier: 'Minh Khoa Hardware', lastUpdated: '2026-08-01 11:30' }
];

export const InventoryModule: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['ALL', 'Tôn & Thép', 'Sơn & Hóa Chất', 'Ván Sàn', 'Gioăng & Khóa'];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = materials.filter((m) => m.quantityInStock <= m.minStockThreshold).length;
  const totalValuation = materials.reduce((acc, m) => acc + m.quantityInStock * m.unitPrice, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <PackageCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-2xl">
              <Boxes className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Quản Lý Kho Vật Tư Sửa Chữa Container</h2>
              <p className="text-xs text-slate-400 mt-1">
                Theo dõi tồn kho thép tấm, sơn lót, gioăng cao su, ván sàn & cảnh báo định mức tối thiểu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Đã xuất báo cáo tồn kho ra file Excel')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nhập Vật Tư Mới</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
            <p className="text-[11px] text-slate-400">Tổng Loại Vật Tư</p>
            <p className="text-lg font-bold text-white mt-0.5">{materials.length} Danh Mục</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
            <p className="text-[11px] text-slate-400">Tổng Giá Trị Tồn Kho</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{totalValuation.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
            <p className="text-[11px] text-slate-400">Cảnh Báo Chạm Đáy Tồn</p>
            <p className={`text-lg font-bold mt-0.5 ${lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
              {lowStockCount} Vật Tư
            </p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
            <p className="text-[11px] text-slate-400">Nhà Cung Cấp Hợp Tác</p>
            <p className="text-lg font-bold text-blue-400 mt-0.5">5 Đơn Vị</p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'Tất Cả Danh Mục' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên vật tư, mã, NCC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* DataGrid Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="py-3 px-4 font-bold">Mã Vật Tư</th>
                <th className="py-3 px-4 font-bold">Tên Vật Tư Chi Tiết</th>
                <th className="py-3 px-3 font-bold">Phân Loại</th>
                <th className="py-3 px-3 text-right font-bold">Số Lượng Tồn</th>
                <th className="py-3 px-3 text-right font-bold">Đơn Giá Nhập</th>
                <th className="py-3 px-3 text-right font-bold">Tổng Giá Trị</th>
                <th className="py-3 px-4 font-bold">Nhà Cung Cấp</th>
                <th className="py-3 px-3 text-center font-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMaterials.map((mat) => {
                const isLow = mat.quantityInStock <= mat.minStockThreshold;
                const totalItemVal = mat.quantityInStock * mat.unitPrice;

                return (
                  <tr key={mat.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">{mat.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{mat.nameVi}</div>
                      <div className="text-[10px] text-slate-400">Đơn vị tính: {mat.unit}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={isLow ? 'text-rose-400 font-extrabold flex items-center justify-end gap-1' : 'text-emerald-400'}>
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        {mat.quantityInStock} {mat.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {mat.unitPrice.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {totalItemVal.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-slate-300">{mat.supplier}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setMaterials((prev) =>
                            prev.map((p) =>
                              p.id === mat.id ? { ...p, quantityInStock: p.quantityInStock + 10 } : p
                            )
                          );
                          showToast(`Đã nhập thêm +10 ${mat.unit} cho ${mat.nameVi}`);
                        }}
                        className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded font-bold text-[10px] transition cursor-pointer"
                      >
                        + Nhập Kho
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
