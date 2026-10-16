import React, { useState } from 'react';
import { GradeMasterItem } from '../types';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface GradeMasterProps {
  grades: GradeMasterItem[];
  onUpdateGrades: (grades: GradeMasterItem[]) => void;
  // Component này được dùng ở 2 nơi: trang "Danh Mục Hệ Thống & Master Data" (MasterDataPage — CRUD ở
  // đây lưu thật xuống bảng MasterCatalogItem qua masterDataApi) và tab "Danh mục Grade" bên trong
  // module Survey (SurveyModulePage — state cục bộ, KHÔNG gọi API). Cờ này quyết định có hiện banner
  // cảnh báo "chỉ lưu tạm trong phiên" hay không — mặc định false (giữ hành vi cũ) để không lỡ ẩn mất
  // cảnh báo ở nơi thực sự chưa lưu thật nếu ai đó quên truyền prop.
  persistedToBackend?: boolean;
}

// Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY" (nền trắng) theo yêu cầu người dùng.
export const GradeMaster: React.FC<GradeMasterProps> = ({
  grades,
  onUpdateGrades,
  persistedToBackend = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GradeMasterItem | null>(null);

  // Form states
  const [gradeCode, setGradeCode] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [description, setDescription] = useState('');
  const [shippingLine, setShippingLine] = useState('ALL');
  const [customer, setCustomer] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('1');

  const filtered = grades.filter((item) => {
    return (
      item.gradeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenModal = (item?: GradeMasterItem) => {
    if (item) {
      setEditingItem(item);
      setGradeCode(item.gradeCode);
      setGradeName(item.gradeName);
      setDescription(item.description);
      setShippingLine(item.shippingLine);
      setCustomer(item.customer);
      setSortOrder(item.sortOrder.toString());
    } else {
      setEditingItem(null);
      setGradeCode('');
      setGradeName('');
      setDescription('');
      setShippingLine('ALL');
      setCustomer('ALL');
      setSortOrder((grades.length + 1).toString());
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeCode || !gradeName) return;

    if (editingItem) {
      const updated = grades.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              gradeCode: gradeCode.toUpperCase(),
              gradeName,
              description,
              shippingLine,
              customer,
              sortOrder: Number(sortOrder) || 1
            }
          : item
      );
      onUpdateGrades(updated);
    } else {
      const newItem: GradeMasterItem = {
        id: 'GR-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        gradeCode: gradeCode.toUpperCase(),
        gradeName,
        description,
        shippingLine,
        customer,
        status: 'ACTIVE',
        sortOrder: Number(sortOrder) || 1
      };
      onUpdateGrades([...grades, newItem]);
    }
    setShowModal(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = grades.map((item) =>
      item.id === id ? { ...item, status: item.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) } : item
    );
    onUpdateGrades(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Hạng Phân Loại (Grade) này?')) {
      onUpdateGrades(grades.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Danh Mục Phân Hạng Vỏ Container (Grade Master)
            </h2>
            <p className="text-xs text-slate-500">
              Thiết lập tiêu chuẩn phân loại Grade A, Food Grade, General Cargo, Scrap Grade theo từng Hãng tàu &amp; Khách hàng.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hạng Vỏ Mới</span>
        </button>
      </div>

      {!persistedToBackend && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Danh mục này hiện chỉ lưu tạm trong phiên làm việc trình duyệt — thêm/sửa/xóa sẽ mất khi tải lại trang hoặc đăng xuất, chưa đồng bộ xuống SQL Server.</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã Grade (GRADE_A, FOOD_GRADE...), Tên hạng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> Hạng Vỏ
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4 w-12 text-center">Thứ Tự</th>
                <th className="py-3.5 px-4">Mã Grade</th>
                <th className="py-3.5 px-4">Tên Hạng Vỏ (Grade Name)</th>
                <th className="py-3.5 px-4">Mục Đích Đóng Hàng &amp; Tiêu Chuẩn</th>
                <th className="py-3.5 px-4">Hãng Tàu Áp Dụng</th>
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
                    <span className="font-mono font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md">
                      {item.gradeCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.gradeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {item.shippingLine}
                    </span>
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
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>{editingItem ? 'Chỉnh Sửa Hạng Vỏ' : 'Thêm Hạng Vỏ Mới'}</span>
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Grade (Code)*</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: GRADE_A, FOOD_GRADE"
                    value={gradeCode}
                    onChange={(e) => setGradeCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-emerald-700 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hãng Tàu Áp Dụng</label>
                  <input
                    type="text"
                    placeholder="ALL hoặc MAERSK, MSC..."
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Hạng Vỏ*</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Grade A (Hàng Xuất Khẩu Cao Cấp / Điện Tử)..."
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mục Đích Đóng Hàng &amp; Tiêu Chuẩn</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tiêu chí chất lượng cho loại hàng hóa tương ứng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Thứ Tự Ưu Tiên</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
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
