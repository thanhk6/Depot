import React, { useState } from 'react';
import { DamageLocationMasterItem } from '../types';
import { useSurveyChecklistTemplate } from '../../masterdata/utils/checklistCatalog';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface DamageLocationMasterProps {
  locations: DamageLocationMasterItem[];
  onUpdateLocations: (locations: DamageLocationMasterItem[]) => void;
  // Component này dùng ở cả trang "Danh Mục Hệ Thống & Master Data" (MasterDataPage — lưu thật qua
  // masterDataApi) và tab Master Data cục bộ trong module Survey (SurveyModulePage — state cục bộ,
  // KHÔNG gọi API). Mặc định false để không lỡ ẩn cảnh báo ở nơi thực sự chưa lưu thật.
  persistedToBackend?: boolean;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
export const DamageLocationMaster: React.FC<DamageLocationMasterProps> = ({
  locations,
  onUpdateLocations,
  persistedToBackend = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<DamageLocationMasterItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [vietnameseName, setVietnameseName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'EXTERIOR' | 'INTERIOR' | 'UNDER' | 'STRUCTURE' | 'REEFER'>('EXTERIOR');
  const [sortOrder, setSortOrder] = useState('1');
  const [checklistZone, setChecklistZone] = useState('');
  // Khu vực Checklist giám định (danh mục SURVEY_CHECKLIST) — hư hỏng ở vị trí này tự đánh "Không Đạt" khu vực đó.
  const checklistZones = useSurveyChecklistTemplate();
  const zoneLabel = (key: string) => checklistZones.find((z) => z.zoneKey === key)?.zoneName || key;

  const filtered = locations.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (item?: DamageLocationMasterItem) => {
    if (item) {
      setEditingItem(item);
      setCode(item.code);
      setName(item.name);
      setVietnameseName(item.vietnameseName);
      setDescription(item.description);
      setCategory(item.category);
      setSortOrder(item.sortOrder.toString());
      setChecklistZone(item.checklistZone || '');
    } else {
      setEditingItem(null);
      setCode('');
      setName('');
      setVietnameseName('');
      setDescription('');
      setCategory('EXTERIOR');
      setSortOrder((locations.length + 1).toString());
      setChecklistZone('');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !vietnameseName) return;

    if (editingItem) {
      const updated = locations.map((loc) =>
        loc.id === editingItem.id
          ? {
              ...loc,
              code: code.toUpperCase(),
              name,
              vietnameseName,
              description,
              category,
              checklistZone,
              sortOrder: Number(sortOrder) || 1
            }
          : loc
      );
      onUpdateLocations(updated);
    } else {
      const newItem: DamageLocationMasterItem = {
        id: 'LOC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        code: code.toUpperCase(),
        name,
        vietnameseName,
        description,
        category,
        checklistZone,
        status: 'ACTIVE',
        sortOrder: Number(sortOrder) || 1
      };
      onUpdateLocations([...locations, newItem]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = locations.map((loc) =>
      loc.id === id ? { ...loc, status: loc.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) } : loc
    );
    onUpdateLocations(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa vị trí hư hỏng này khỏi Master Data?')) {
      onUpdateLocations(locations.filter((loc) => loc.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Danh Mục Vị Trí Hư Hỏng Container (Damage Location Master)
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý danh sách các vùng cấu kiện container theo chuẩn IICL (Nóc, Vách, Sàn, Cửa, Khung dầm, Gù góc, Cụm máy lạnh).
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Vị Trí Mới</span>
        </button>
      </div>

      {!persistedToBackend && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Danh mục này hiện chỉ lưu tạm trong phiên làm việc trình duyệt — thêm/sửa/xóa sẽ mất khi tải lại trang hoặc đăng xuất, chưa đồng bộ xuống SQL Server.</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo Mã Vị Trí (ROOF, LEFT_W...), Tên tiếng Việt, Mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none"
          >
            <option value="ALL">Tất cả phân nhóm cấu kiện</option>
            <option value="EXTERIOR">Ngoại quan (EXTERIOR)</option>
            <option value="INTERIOR">Nội thất &amp; Sàn (INTERIOR)</option>
            <option value="UNDER">Gầm &amp; Dầm đáy (UNDER)</option>
            <option value="STRUCTURE">Khung chịu lực (STRUCTURE)</option>
            <option value="REEFER">Máy lạnh PTI (REEFER)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> vị trí
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">Thứ Tự</th>
                <th className="py-3.5 px-4">Mã Vị Trí (Code)</th>
                <th className="py-3.5 px-4">Tên Tiếng Việt</th>
                <th className="py-3.5 px-4">Tên Quốc Tế (EN)</th>
                <th className="py-3.5 px-4">Phân Nhóm</th>
                <th className="py-3.5 px-4">Khu Vực Checklist</th>
                <th className="py-3.5 px-4">Mô Tả Cấu Kiện</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                    {item.sortOrder}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md">
                      {item.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.vietnameseName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {item.checklistZone ? zoneLabel(item.checklistZone) : <span className="text-slate-400">(không gắn)</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> HOẠT ĐỘNG
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> TẠM KHÓA
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
                        title="Sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>{editingItem ? 'Chỉnh Sửa Vị Trí Hư Hỏng' : 'Thêm Vị Trí Hư Hỏng Mới'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Vị Trí (Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: ROOF, LEFT_W"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phân Nhóm Cấu Kiện</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                  >
                    <option value="EXTERIOR">Ngoại quan (EXTERIOR)</option>
                    <option value="INTERIOR">Nội thất &amp; Sàn (INTERIOR)</option>
                    <option value="UNDER">Gầm &amp; Dầm đáy (UNDER)</option>
                    <option value="STRUCTURE">Khung chịu lực (STRUCTURE)</option>
                    <option value="REEFER">Máy lạnh PTI (REEFER)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Khu Vực Checklist Giám Định</label>
                <select
                  value={checklistZone}
                  onChange={(e) => setChecklistZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none font-medium"
                >
                  <option value="">(không gắn)</option>
                  {checklistZones.map((z) => (
                    <option key={z.zoneKey} value={z.zoneKey}>{z.zoneName}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Hư hỏng ghi ở vị trí này sẽ tự đánh "Không Đạt" khu vực đã chọn trong Checklist giám định.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Tiếng Việt*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nóc / Mái tôn..."
                    value={vietnameseName}
                    onChange={(e) => setVietnameseName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Quốc Tế (EN)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Roof Panel..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mô Tả Cấu Kiện</label>
                  <input
                    type="text"
                    placeholder="Mô tả đặc tính..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Thứ Tự Sắp Xếp</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
