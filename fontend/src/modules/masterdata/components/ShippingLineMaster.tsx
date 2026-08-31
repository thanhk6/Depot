import React, { useState, useEffect } from 'react';
import { masterDataApi } from '../../../api';
import {
  Ship,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';

// Trước đây "Danh Mục Hãng Tàu Khai Thác" chỉ là 1 khối tĩnh hardcode ngay trong MasterDataPage.tsx —
// luôn hiện cứng "MAERSK LINE (MAEU)" cùng vài số liệu bịa (IICL-6, Auto-Approve $150, Free Time 5 ngày...)
// bất kể dữ liệu thật trong bảng ShippingLines có gì, không có danh sách, không thêm/sửa/xoá được. Tách
// ra component riêng tự fetch/CRUD thật qua masterDataApi, theo đúng khuôn mẫu các danh mục Master Data
// khác (GradeMaster/LoloTariffMaster...).
interface ShippingLineItem {
  id: number;
  code: string;
  name: string;
  contactEmail: string;
  phone: string;
}

export const ShippingLineMaster: React.FC = () => {
  const [lines, setLines] = useState<ShippingLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchLines = () => {
    setIsLoading(true);
    masterDataApi.getShippingLines()
      .then((response: any) => {
        if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể tải danh mục hãng tàu.');
        setLines((response.data || []).map((item: any): ShippingLineItem => ({
          id: item.id,
          code: item.code,
          name: item.name,
          contactEmail: item.contactEmail || '',
          phone: item.phone || ''
        })));
        setLoadError(null);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : 'Không thể tải danh mục hãng tàu từ backend.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShippingLineItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = lines.filter((item) =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: ShippingLineItem) => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setCode(item.code);
      setName(item.name);
      setContactEmail(item.contactEmail);
      setPhone(item.phone);
    } else {
      setEditingItem(null);
      setCode('');
      setName('');
      setContactEmail('');
      setPhone('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const request = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      contactEmail: contactEmail.trim() || null,
      phone: phone.trim() || null
    };

    setFormError(null);
    setIsSaving(true);
    try {
      const response: any = editingItem
        ? await masterDataApi.updateShippingLine(editingItem.id, request)
        : await masterDataApi.createShippingLine(request);
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể lưu hãng tàu.');
      setShowModal(false);
      fetchLines();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể lưu hãng tàu xuống hệ thống.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: ShippingLineItem) => {
    if (!confirm(`Bạn có chắc muốn xóa hãng tàu ${item.code} - ${item.name}? Các job/container đã tạo trước đó vẫn giữ nguyên lịch sử.`)) return;
    try {
      const response: any = await masterDataApi.deleteShippingLine(item.id);
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể xóa hãng tàu.');
      fetchLines();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không thể xóa hãng tàu xuống hệ thống.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/20 border border-sky-500/30 text-sky-500 rounded-2xl">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-wide">
              Danh Mục Hãng Tàu Khai Thác
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý hãng tàu tham chiếu bởi Gate-In/Container.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Hãng Tàu Mới</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700">
          <span className="font-bold">{loadError}</span>
          <button onClick={() => setLoadError(null)} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã hãng tàu (MAEU, MSC...), Tên hãng tàu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Tổng cộng: <strong className="text-slate-900">{filtered.length}</strong> Hãng Tàu
        </div>
      </div>

      {/* DataGrid */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Mã Hãng Tàu</th>
                <th className="py-3.5 px-4">Tên Hãng Tàu</th>
                <th className="py-3.5 px-4">Email Liên Hệ</th>
                <th className="py-3.5 px-4">Điện Thoại</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Đang tải danh mục hãng tàu...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Chưa có hãng tàu nào trong danh mục.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sky-700 px-2 py-0.5 bg-sky-50 border border-sky-200 rounded-md">
                        {item.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.contactEmail ? (
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" />{item.contactEmail}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.phone ? (
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" />{item.phone}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
                          onClick={() => handleDelete(item)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ship className="w-5 h-5 text-sky-500" />
                <span>{editingItem ? 'Chỉnh Sửa Hãng Tàu' : 'Thêm Hãng Tàu Mới'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mã Hãng Tàu (Code)*</label>
                <input
                  type="text"
                  required
                  disabled={!!editingItem}
                  placeholder="VD: MAEU, MSCU, ONEY..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sky-700 font-mono font-bold focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {editingItem && (
                  <p className="text-[10px] text-slate-400 mt-1">Mã hãng tàu là khóa nghiệp vụ, không thể sửa sau khi tạo.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Hãng Tàu*</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Maersk Line, MSC, ONE..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Liên Hệ</label>
                  <input
                    type="email"
                    placeholder="ops@shippingline.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="028xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Đang lưu...' : editingItem ? 'Lưu Thay Đổi' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
