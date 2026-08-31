import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  Layers,
  Container,
  Scale,
  Maximize2,
  Info,
  Tag
} from 'lucide-react';

export interface ContainerCategory {
  id: string;
  code: string;
  name: string;
  group: 'Dry Freight' | 'Reefer' | 'Special Equipment' | 'Tank';
  isoGroupCode: string;
  lengthFt: number;
  heightFt: number;
  tareWeightKg: number;
  maxPayloadKg: number;
  cubicCapacityCbm: number;
  description: string;
  activeStatus: boolean;
}

const INITIAL_CATEGORIES: ContainerCategory[] = [
  {
    id: 'CAT-01',
    code: '20GP',
    name: 'Container Khô Thường 20 Feet',
    group: 'Dry Freight',
    isoGroupCode: '22G1',
    lengthFt: 20,
    heightFt: 8.6,
    tareWeightKg: 2250,
    maxPayloadKg: 28230,
    cubicCapacityCbm: 33.2,
    description: 'Thích hợp chở hàng khô, đóng bao, bốc xếp thủ công hoặc pallet tiêu chuẩn.',
    activeStatus: true
  },
  {
    id: 'CAT-02',
    code: '40GP',
    name: 'Container Khô Thường 40 Feet',
    group: 'Dry Freight',
    isoGroupCode: '42G1',
    lengthFt: 40,
    heightFt: 8.6,
    tareWeightKg: 3800,
    maxPayloadKg: 26680,
    cubicCapacityCbm: 67.7,
    description: 'Chuyên chở thể tích lớn, khối lượng vừa phải, hàng bách hóa tổng hợp.',
    activeStatus: true
  },
  {
    id: 'CAT-03',
    code: '40HC',
    name: 'Container Khô Cao 40 Feet (High Cube)',
    group: 'Dry Freight',
    isoGroupCode: '45G1',
    lengthFt: 40,
    heightFt: 9.6,
    tareWeightKg: 3950,
    maxPayloadKg: 28550,
    cubicCapacityCbm: 76.4,
    description: 'Loại vỏ phổ biến nhất Depot, tăng 12% thể tích so với 40GP chuẩn.',
    activeStatus: true
  },
  {
    id: 'CAT-04',
    code: '45HC',
    name: 'Container Khô Cao 45 Feet (Ultra High)',
    group: 'Dry Freight',
    isoGroupCode: 'L5G1',
    lengthFt: 45,
    heightFt: 9.6,
    tareWeightKg: 4800,
    maxPayloadKg: 27700,
    cubicCapacityCbm: 86.0,
    description: 'Chuyên chở tuyến hàng nội địa siêu trường, thể tích cực đại.',
    activeStatus: true
  },
  {
    id: 'CAT-05',
    code: '20RF',
    name: 'Container Lạnh 20 Feet (Reefer)',
    group: 'Reefer',
    isoGroupCode: '22R1',
    lengthFt: 20,
    heightFt: 8.6,
    tareWeightKg: 3080,
    maxPayloadKg: 27400,
    cubicCapacityCbm: 28.3,
    description: 'Trang bị máy lạnh Carrier/Daikin, giữ nhiệt từ -30°C đến +30°C.',
    activeStatus: true
  },
  {
    id: 'CAT-06',
    code: '40RH',
    name: 'Container Lạnh Cao 40 Feet (Reefer High Cube)',
    group: 'Reefer',
    isoGroupCode: '45R1',
    lengthFt: 40,
    heightFt: 9.6,
    tareWeightKg: 4480,
    maxPayloadKg: 29520,
    cubicCapacityCbm: 67.9,
    description: 'Thủy hải sản, nông sản xuất khẩu chất lượng cao, có foam cách nhiệt polyurethane.',
    activeStatus: true
  },
  {
    id: 'CAT-07',
    code: '20OT',
    name: 'Container Mái Mở 20 Feet (Open Top)',
    group: 'Special Equipment',
    isoGroupCode: '22U1',
    lengthFt: 20,
    heightFt: 8.6,
    tareWeightKg: 2400,
    maxPayloadKg: 28080,
    cubicCapacityCbm: 32.5,
    description: 'Có bạt che phủ tháo rời, hỗ trợ cẩu hàng từ phía trên mái.',
    activeStatus: true
  },
  {
    id: 'CAT-08',
    code: '40FR',
    name: 'Container Khung Mở 40 Feet (Flat Rack)',
    group: 'Special Equipment',
    isoGroupCode: '45P1',
    lengthFt: 40,
    heightFt: 8.6,
    tareWeightKg: 5300,
    maxPayloadKg: 44700,
    cubicCapacityCbm: 0,
    description: 'Chuyên chở hàng quá khổ quá tải, máy móc công trình hạng nặng.',
    activeStatus: true
  }
];

export const ContainerCategoryModule: React.FC = () => {
  const [categories, setCategories] = useState<ContainerCategory[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ContainerCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<ContainerCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ContainerCategory, 'id'>>({
    code: '',
    name: '',
    group: 'Dry Freight',
    isoGroupCode: '',
    lengthFt: 40,
    heightFt: 9.6,
    tareWeightKg: 3800,
    maxPayloadKg: 28500,
    cubicCapacityCbm: 76.4,
    description: '',
    activeStatus: true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      name: '',
      group: 'Dry Freight',
      isoGroupCode: '',
      lengthFt: 40,
      heightFt: 9.6,
      tareWeightKg: 3800,
      maxPayloadKg: 28500,
      cubicCapacityCbm: 76.4,
      description: '',
      activeStatus: true
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cat: ContainerCategory) => {
    setEditingCategory(cat);
    setFormData({
      code: cat.code,
      name: cat.name,
      group: cat.group,
      isoGroupCode: cat.isoGroupCode,
      lengthFt: cat.lengthFt,
      heightFt: cat.heightFt,
      tareWeightKg: cat.tareWeightKg,
      maxPayloadKg: cat.maxPayloadKg,
      cubicCapacityCbm: cat.cubicCapacityCbm,
      description: cat.description,
      activeStatus: cat.activeStatus
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Vui lòng nhập Mã loại vỏ và Tên phân loại!');
      return;
    }

    const newCategory: ContainerCategory = {
      id: `CAT-${String(categories.length + 1).padStart(2, '0')}`,
      ...formData,
      code: formData.code.toUpperCase().trim()
    };

    setCategories([newCategory, ...categories]);
    showToast(`Đã thêm mới phân loại Container ${newCategory.code}`);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              ...formData,
              code: formData.code.toUpperCase().trim()
            }
          : c
      )
    );

    showToast(`Đã cập nhật phân loại Container ${formData.code}`);
    setEditingCategory(null);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      const cat = categories.find((c) => c.id === deletingId);
      setCategories((prev) => prev.filter((c) => c.id !== deletingId));
      showToast(`Đã xóa phân loại Container ${cat?.code || deletingId}`);
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchSearch =
      searchQuery === '' ||
      cat.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.isoGroupCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchGroup = groupFilter === 'ALL' || cat.group === groupFilter;

    return matchSearch && matchGroup;
  });

  const getGroupBadge = (group: string) => {
    switch (group) {
      case 'Dry Freight':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800">Dry Van (Hàng Khô)</span>;
      case 'Reefer':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">Reefer (Hàng Lạnh)</span>;
      case 'Special Equipment':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">Chuyên Dụng (Special)</span>;
      case 'Tank':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">Bồn (ISO Tank)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">{group}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Search & Filter & Create */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã loại (20GP, 40HC...), Tên loại, ISO Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">-- Tất cả nhóm phân loại --</option>
            <option value="Dry Freight">Dry Freight (Hàng Khô)</option>
            <option value="Reefer">Reefer (Hàng Lạnh)</option>
            <option value="Special Equipment">Special Equipment (Chuyên Dụng)</option>
            <option value="Tank">ISO Tank (Container Bồn)</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Phân Loại Container Mới</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Tổng Loại Vỏ Khai Thác</div>
          <div className="text-2xl font-black text-white">{categories.length}</div>
          <div className="text-[10px] text-blue-400">Hệ thống danh mục chuẩn ISO</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Container Hàng Khô (Dry)</div>
          <div className="text-2xl font-black text-blue-400">
            {categories.filter((c) => c.group === 'Dry Freight').length}
          </div>
          <div className="text-[10px] text-slate-400">20GP, 40GP, 40HC, 45HC</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Container Lạnh (Reefer)</div>
          <div className="text-2xl font-black text-cyan-400">
            {categories.filter((c) => c.group === 'Reefer').length}
          </div>
          <div className="text-[10px] text-slate-400">20RF, 40RH cách nhiệt</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400">Thiết Bị Đặc Biệt (Special)</div>
          <div className="text-2xl font-black text-amber-400">
            {categories.filter((c) => c.group === 'Special Equipment' || c.group === 'Tank').length}
          </div>
          <div className="text-[10px] text-slate-400">Open Top, Flat Rack, Bồn</div>
        </div>
      </div>

      {/* Master CRUD Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-semibold tracking-wider uppercase text-[11px]">
                <th className="p-4">Mã Vỏ & Tên Phân Loại</th>
                <th className="p-4">Nhóm Vỏ Depot</th>
                <th className="p-4">ISO Group Code</th>
                <th className="p-4">Chiều Dài x Cao</th>
                <th className="p-4 text-right">Trọng Lượng Vỏ (Tare)</th>
                <th className="p-4 text-right">Tải Trọng Max (Payload)</th>
                <th className="p-4 text-center">Trạng Thái</th>
                <th className="p-4 text-center">Thao Tác (Xem/Sửa/Xóa)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Không tìm thấy phân loại container nào khớp với từ khóa.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/50 transition">
                    {/* Code & Name */}
                    <td className="p-4">
                      <div className="font-mono font-black text-sm text-white tracking-wider flex items-center gap-2">
                        <span>{cat.code}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-normal">({cat.id})</span>
                      </div>
                      <div className="text-slate-300 font-medium text-xs mt-0.5">{cat.name}</div>
                    </td>

                    {/* Group */}
                    <td className="p-4">
                      {getGroupBadge(cat.group)}
                    </td>

                    {/* ISO Code */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-amber-300 font-bold">
                        {cat.isoGroupCode}
                      </span>
                    </td>

                    {/* Length & Height */}
                    <td className="p-4 font-mono text-slate-200">
                      {cat.lengthFt} ft x {cat.heightFt} ft
                    </td>

                    {/* Tare Weight */}
                    <td className="p-4 text-right font-mono text-slate-300">
                      {cat.tareWeightKg.toLocaleString('vi-VN')} Kg
                    </td>

                    {/* Max Payload */}
                    <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                      {cat.maxPayloadKg.toLocaleString('vi-VN')} Kg
                    </td>

                    {/* Active Status */}
                    <td className="p-4 text-center">
                      {cat.activeStatus ? (
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded-full">
                          Đang Khai Thác
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-full">
                          Tạm Ngưng
                        </span>
                      )}
                    </td>

                    {/* Actions: View, Edit, Delete */}
                    <td className="p-4 text-center space-x-1">
                      <button
                        onClick={() => setViewingCategory(cat)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
                        title="Xem thông số chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded border border-amber-800 transition"
                        title="Chỉnh sửa thông số phân loại"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingId(cat.id)}
                        className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded border border-rose-800 transition"
                        title="Xóa phân loại này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAIL MODAL */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Container className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  Chi Tiết Phân Loại Container: <span className="font-mono text-amber-300">{viewingCategory.code}</span>
                </h3>
              </div>
              <button onClick={() => setViewingCategory(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px]">Tên đầy đủ:</div>
                <div className="text-sm font-bold text-white">{viewingCategory.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Nhóm Phân Loại:</span>
                  <span className="font-bold text-slate-200 mt-1 block">{viewingCategory.group}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Mã Chuẩn ISO:</span>
                  <span className="font-mono font-bold text-amber-400 mt-1 block">{viewingCategory.isoGroupCode}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Chiều Dài:</span>
                  <span className="font-mono font-bold text-white mt-1 block">{viewingCategory.lengthFt} Feet</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Chiều Cao:</span>
                  <span className="font-mono font-bold text-white mt-1 block">{viewingCategory.heightFt} Feet</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Thể Tích M3:</span>
                  <span className="font-mono font-bold text-cyan-400 mt-1 block">{viewingCategory.cubicCapacityCbm} CBM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Trọng Lượng Vỏ (Tare):</span>
                  <span className="font-mono font-bold text-slate-200 mt-1 block">{viewingCategory.tareWeightKg.toLocaleString('vi-VN')} Kg</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Tải Trọng Max (Payload):</span>
                  <span className="font-mono font-bold text-emerald-400 mt-1 block">{viewingCategory.maxPayloadKg.toLocaleString('vi-VN')} Kg</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Mô Tả Đặc Tính & Ứng Dụng:</span>
                <p className="text-slate-300 mt-1 text-xs leading-relaxed">{viewingCategory.description || 'Chưa có ghi chú.'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewingCategory(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Thêm Mới Phân Loại Container</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mã Loại Container (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 20OT, 40FR..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mã Chuẩn ISO (ISO Code)</label>
                  <input
                    type="text"
                    placeholder="VD: 22G1, 45G1..."
                    value={formData.isoGroupCode}
                    onChange={(e) => setFormData({ ...formData, isoGroupCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Diễn Giải Phân Loại</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Container Khô Thường 20 Feet..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nhóm Vỏ Depot</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Dry Freight">Dry Freight (Hàng Khô)</option>
                    <option value="Reefer">Reefer (Hàng Lạnh)</option>
                    <option value="Special Equipment">Special Equipment (Chuyên Dụng)</option>
                    <option value="Tank">ISO Tank (Bồn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Chiều Dài (Ft) / Cao (Ft)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Dài (20/40)"
                      value={formData.lengthFt}
                      onChange={(e) => setFormData({ ...formData, lengthFt: Number(e.target.value) })}
                      className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Cao (8.6/9.6)"
                      value={formData.heightFt}
                      onChange={(e) => setFormData({ ...formData, heightFt: Number(e.target.value) })}
                      className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trọng Lượng Vỏ (Kg)</label>
                  <input
                    type="number"
                    value={formData.tareWeightKg}
                    onChange={(e) => setFormData({ ...formData, tareWeightKg: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tải Trọng Max (Kg)</label>
                  <input
                    type="number"
                    value={formData.maxPayloadKg}
                    onChange={(e) => setFormData({ ...formData, maxPayloadKg: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Thể Tích (CBM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cubicCapacityCbm}
                    onChange={(e) => setFormData({ ...formData, cubicCapacityCbm: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ghi Chú Đặc Tính Kỹ Thuật</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về yêu cầu kiểm định, loại hàng phù hợp..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Tạo Phân Loại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <span>Chỉnh Sửa Phân Loại ({editingCategory.code})</span>
              </h3>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mã Loại Container</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mã Chuẩn ISO</label>
                  <input
                    type="text"
                    value={formData.isoGroupCode}
                    onChange={(e) => setFormData({ ...formData, isoGroupCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên Diễn Giải Phân Loại</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nhóm Vỏ Depot</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Dry Freight">Dry Freight (Hàng Khô)</option>
                    <option value="Reefer">Reefer (Hàng Lạnh)</option>
                    <option value="Special Equipment">Special Equipment (Chuyên Dụng)</option>
                    <option value="Tank">ISO Tank (Bồn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dài (Ft) / Cao (Ft)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.lengthFt}
                      onChange={(e) => setFormData({ ...formData, lengthFt: Number(e.target.value) })}
                      className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={formData.heightFt}
                      onChange={(e) => setFormData({ ...formData, heightFt: Number(e.target.value) })}
                      className="w-1/2 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trọng Vỏ (Kg)</label>
                  <input
                    type="number"
                    value={formData.tareWeightKg}
                    onChange={(e) => setFormData({ ...formData, tareWeightKg: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payload Max (Kg)</label>
                  <input
                    type="number"
                    value={formData.maxPayloadKg}
                    onChange={(e) => setFormData({ ...formData, maxPayloadKg: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">CBM Thể Tích</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cubicCapacityCbm}
                    onChange={(e) => setFormData({ ...formData, cubicCapacityCbm: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Ghi Chú Kỹ Thuật</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-950 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Xác Nhận Xóa Phân Loại Container?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hành động này sẽ xóa danh mục phân loại <span className="font-mono text-rose-400">{deletingId}</span> khỏi Master Data bãi.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
