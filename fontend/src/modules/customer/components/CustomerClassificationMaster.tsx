import React, { useEffect, useState } from 'react';
import { masterDataApi } from '../../../api';
import {
  Tag,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Layers,
  FolderKanban
} from 'lucide-react';

export interface CustomerClassificationItem {
  id: string;
  code?: string;
  name: string;
  description: string;
}

export const CustomerClassificationMaster: React.FC = () => {
  const [classifications, setClassifications] = useState<CustomerClassificationItem[]>([]);

  useEffect(() => {
    masterDataApi.getCatalog('CUSTOMER_CLASSIFICATION')
      .then((response: any) => {
        if (response?.statusCode === 200) {
          setClassifications((response.data || []).map((item: any) => ({ id: item.id, code: item.code, name: item.nameVi || item.name, description: item.description || '' })));
        }
      })
      .catch((error) => console.error('Không thể tải phân loại khách hàng:', error));
  }, []);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT' | 'VIEW'>('ADD');
  const [selectedItem, setSelectedItem] = useState<CustomerClassificationItem | null>(null);

  // Form State (Only 2 fields: name and description)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Delete Confirm Modal State
  const [deleteItem, setDeleteItem] = useState<CustomerClassificationItem | null>(null);

  // Filtered List
  const filteredList = classifications.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  });

  // Handlers
  const handleOpenAdd = () => {
    setModalMode('ADD');
    setSelectedItem(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenView = (item: CustomerClassificationItem) => {
    setModalMode('VIEW');
    setSelectedItem(item);
    setName(item.name);
    setDescription(item.description);
    setShowModal(true);
  };

  const handleOpenEdit = (item: CustomerClassificationItem) => {
    setModalMode('EDIT');
    setSelectedItem(item);
    setName(item.name);
    setDescription(item.description);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (modalMode === 'ADD') {
      const response: any = await masterDataApi.createCatalog({ catalogType: 'CUSTOMER_CLASSIFICATION', code: `CLASS_${Date.now()}`, name: name.trim(), nameVi: name.trim(), description: description.trim(), jsonData: '{}', isActive: true, sortOrder: classifications.length + 1 });
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể tạo phân loại khách hàng.');
      setClassifications([...classifications, { id: response.data.id, code: response.data.code, name: response.data.nameVi || response.data.name, description: response.data.description || '' }]);
      } else if (modalMode === 'EDIT' && selectedItem) {
      const response: any = await masterDataApi.updateCatalog(selectedItem.id, { catalogType: 'CUSTOMER_CLASSIFICATION', code: selectedItem.code || `CLASS_${selectedItem.id}`, name: name.trim(), nameVi: name.trim(), description: description.trim(), jsonData: '{}', isActive: true, sortOrder: classifications.findIndex((item) => item.id === selectedItem.id) + 1 });
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể cập nhật phân loại khách hàng.');
      setClassifications(classifications.map((c) => c.id === selectedItem.id ? { ...c, name: name.trim(), description: description.trim() } : c));
      }
      setShowModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không thể lưu phân loại khách hàng.');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      const response: any = await masterDataApi.deactivateCatalog(deleteItem.id);
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể vô hiệu hóa phân loại khách hàng.');
      setClassifications(classifications.filter((c) => c.id !== deleteItem.id));
      setDeleteItem(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không thể xóa phân loại khách hàng.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-pink-50 border border-pink-200 text-pink-600 rounded-2xl shadow-lg ">
            <Tag className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Danh Mục Phân Loại Khách Hàng</h2>
              <span className="px-2.5 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-mono font-bold rounded-md">
                {classifications.length} Phân Loại
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý danh sách các nhóm phân loại khách hàng với tên phân loại và mô tả chi tiết.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 justify-center cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Phân Loại Mới</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên phân loại hoặc Mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-pink-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Hiển thị: <strong className="text-slate-900">{filteredList.length}</strong> / {classifications.length} bản ghi
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 w-16 text-center">STT</th>
                <th className="px-5 py-3.5 w-1/3">Tên Phân Loại</th>
                <th className="px-5 py-3.5">Mô Tả</th>
                <th className="px-5 py-3.5 w-40 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    Không tìm thấy phân loại khách hàng nào phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-100 transition">
                    <td className="px-5 py-4 text-center font-mono font-bold text-slate-500">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 text-xs leading-relaxed">
                      {item.description || <span className="text-slate-500 italic">Chưa có mô tả</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => handleOpenView(item)}
                          title="Xem chi tiết"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-sky-600 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Chỉnh sửa"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteItem(item)}
                          title="Xóa phân loại"
                          className="p-2 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm / Sửa / Xem */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 animate-scale-up shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-600" />
                <span>
                  {modalMode === 'ADD' && 'Thêm Phân Loại Khách Hàng Mới'}
                  {modalMode === 'EDIT' && 'Chỉnh Sửa Phân Loại Khách Hàng'}
                  {modalMode === 'VIEW' && 'Chi Tiết Phân Loại Khách Hàng'}
                </span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            {modalMode === 'VIEW' ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="text-slate-500 font-semibold block text-[11px]">Tên Phân Loại:</span>
                  <div className="text-sm font-bold text-slate-900">{name}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="text-slate-500 font-semibold block text-[11px]">Mô Tả:</span>
                  <p className="text-slate-700 leading-relaxed text-xs whitespace-pre-wrap">
                    {description || <span className="text-slate-500 italic">Chưa có mô tả chi tiết.</span>}
                  </p>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Tên Phân Loại <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Doanh Nghiệp Vận Tải (Trucking)..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-pink-500 text-sm font-bold text-slate-900 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Mô Tả
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Nhập nội dung mô tả phân loại khách hàng..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-pink-500 text-xs text-slate-900 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl shadow-lg  cursor-pointer"
                  >
                    {modalMode === 'ADD' ? 'Lưu Phân Loại' : 'Cập Nhật Thay Đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Xác nhận Xóa */}
      {deleteItem && (
        <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 max-w-md w-full space-y-4 animate-scale-up shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Phân Loại</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Bạn có chắc chắn muốn xóa phân loại: <strong className="text-slate-900 font-bold">{deleteItem.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg  cursor-pointer"
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
