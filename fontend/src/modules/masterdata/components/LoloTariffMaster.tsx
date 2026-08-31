import React, { useState, useMemo, useEffect } from 'react';
import { LoLoTariffItem } from '../mockTariffData';
import { masterDataApi } from '../../../api';
import {
  Truck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Percent,
  X
} from 'lucide-react';

// Tách riêng khỏi màn "Cước Nâng Hạ & Lưu Bãi" gộp chung cũ (`LiftOnLiftOffAndStorageMaster.tsx`, đã
// xoá) theo yêu cầu người dùng — mỗi loại cước giờ là 1 danh mục Master Data riêng biệt, giống Loại
// Container hay Mã Hư Hỏng, thay vì gộp chung 1 màn với 3 sub-tab (LOLO/STORAGE/CALCULATOR). Xem
// docs/frontend-tariff-catalog-split.md.

// `loloTariffs` bắt đầu rỗng, chỉ có dữ liệu thật sau khi tải xong từ backend — placeholder này chỉ
// dùng nội bộ nếu cần hiển thị tạm, không liên quan tới việc mất dữ liệu vì component này không có
// phần tính toán nào chạy trước khi tải xong (không giống Calculator).
export const LoloTariffMaster: React.FC = () => {
  const [loloTariffs, setLoloTariffs] = useState<LoLoTariffItem[]>([]);

  useEffect(() => {
    const loadTariffs = async () => {
      const response = await masterDataApi.getServiceTariffs();
      // Bảng `ServiceTariffs` mới có cột thật (không còn JsonData tự do) — map thẳng 1-1, không cần
      // JSON.parse nữa.
      setLoloTariffs((response.data as any[] || []).map((item: any) => ({
        id: String(item.id), tariffCode: item.code, serviceCategory: item.serviceCategory || 'LIFT_EMPTY',
        nameVi: item.nameVi, nameEn: item.nameEn || '', unit: item.unit || 'Lần / Cont',
        price20GP: item.price20GP || 0, price40GP_HC: item.price40HC || 0, price45HC: item.price45HC || 0,
        price20RF: item.price20RF || 0, price40RH: item.price40RH || 0, priceSpecial: item.priceSpecial || 0,
        vatPercent: item.vatPercent || 8, currency: item.currency || 'VND', description: item.description || '',
        applicableShift: item.applicableShift || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', updatedAt: item.lastModifiedAt || item.createdAt || ''
      } as LoLoTariffItem)));
    };
    loadTariffs().catch((error) => console.error('Không thể tải cước nâng hạ từ backend:', error));
  }, []);

  // `ServiceTariff.Id` backend là `long` (vd "1", "42"), KHÔNG phải Guid — xem lịch sử bug id-format ở
  // docs/backend-progress/23-master-data.md mục "Bug thật thứ 3" trước khi đổi lại thành regex Guid.
  const isRealCatalogId = (id: string) => /^\d+$/.test(String(id ?? ''));

  const persistLolo = async (item: LoLoTariffItem) => {
    const request = {
      code: item.tariffCode,
      serviceCategory: item.serviceCategory,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      unit: item.unit,
      price20GP: item.price20GP, price40HC: item.price40GP_HC, price45HC: item.price45HC,
      price20RF: item.price20RF, price40RH: item.price40RH, priceSpecial: item.priceSpecial,
      vatPercent: item.vatPercent, currency: item.currency, applicableShift: item.applicableShift,
      description: item.description,
      isActive: item.status !== 'INACTIVE'
    };
    if (isRealCatalogId(item.id)) {
      await masterDataApi.updateServiceTariff(item.id, request);
    } else {
      const created: any = await masterDataApi.createServiceTariff(request);
      if (created?.data?.id) {
        setLoloTariffs((prev) => prev.map((t) => (t.id === item.id ? { ...t, id: String(created.data.id) } : t)));
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<LoLoTariffItem | null>(null);
  const emptyForm: Partial<LoLoTariffItem> = {
    tariffCode: '', serviceCategory: 'LIFT_EMPTY', nameVi: '', nameEn: '', unit: 'Lần / Cont',
    price20GP: 280000, price40GP_HC: 420000, price45HC: 500000, price20RF: 350000, price40RH: 520000,
    priceSpecial: 650000, vatPercent: 8, currency: 'VND', description: '', applicableShift: 'ALL', status: 'ACTIVE'
  };
  const [form, setForm] = useState<Partial<LoLoTariffItem>>(emptyForm);

  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState<boolean>(false);
  const [bulkPercent, setBulkPercent] = useState<number>(5);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const filteredTariffs = useMemo(() => {
    return loloTariffs.filter((item) => {
      const matchSearch =
        item.tariffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || item.serviceCategory === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [loloTariffs, searchTerm, categoryFilter]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tariffCode || !form.nameVi) {
      alert('Vui lòng nhập Mã biểu cước và Tên dịch vụ nâng hạ');
      return;
    }

    if (editingItem) {
      const savedItem: LoLoTariffItem = { ...editingItem, ...form, updatedAt: new Date().toISOString().substring(0, 10) } as LoLoTariffItem;
      setLoloTariffs((prev) => prev.map((item) => (item.id === editingItem.id ? savedItem : item)));
      void persistLolo(savedItem).catch((error) => console.error('Không thể lưu cước nâng hạ vào backend:', error));
    } else {
      const newItem: LoLoTariffItem = {
        id: `LOLO-${Date.now().toString().slice(-4)}`,
        tariffCode: form.tariffCode || `LOLO_${Date.now().toString().slice(-3)}`,
        serviceCategory: form.serviceCategory || 'LIFT_EMPTY',
        nameVi: form.nameVi || '', nameEn: form.nameEn || '', unit: form.unit || 'Lần / Cont',
        price20GP: Number(form.price20GP) || 0, price40GP_HC: Number(form.price40GP_HC) || 0, price45HC: Number(form.price45HC) || 0,
        price20RF: Number(form.price20RF) || 0, price40RH: Number(form.price40RH) || 0, priceSpecial: Number(form.priceSpecial) || 0,
        vatPercent: Number(form.vatPercent) || 8, currency: 'VND', description: form.description || '',
        applicableShift: form.applicableShift || 'ALL', status: form.status || 'ACTIVE',
        updatedAt: new Date().toISOString().substring(0, 10)
      };
      setLoloTariffs((prev) => [newItem, ...prev]);
      void persistLolo(newItem).catch((error) => console.error('Không thể lưu cước nâng hạ vào backend:', error));
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hạng mục cước nâng hạ này?')) {
      setLoloTariffs((prev) => prev.filter((t) => t.id !== id));
      if (isRealCatalogId(id)) {
        void masterDataApi.deactivateServiceTariff(id).catch((error) => console.error('Không thể vô hiệu hóa cước nâng hạ trên backend:', error));
      }
    }
  };

  const handleOpenEdit = (item: LoLoTariffItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({ ...emptyForm, tariffCode: `LOLO_${Math.floor(100 + Math.random() * 900)}` });
    setIsModalOpen(true);
  };

  const handleApplyBulkAdjust = () => {
    const multiplier = 1 + bulkPercent / 100;
    const updated = loloTariffs.map((item) => ({
      ...item,
      price20GP: Math.round((item.price20GP * multiplier) / 1000) * 1000,
      price40GP_HC: Math.round((item.price40GP_HC * multiplier) / 1000) * 1000,
      price45HC: Math.round((item.price45HC * multiplier) / 1000) * 1000,
      price20RF: Math.round((item.price20RF * multiplier) / 1000) * 1000,
      price40RH: Math.round((item.price40RH * multiplier) / 1000) * 1000,
      priceSpecial: Math.round((item.priceSpecial * multiplier) / 1000) * 1000,
      updatedAt: new Date().toISOString().substring(0, 10)
    }));
    setLoloTariffs(updated);
    void Promise.all(updated.map((item) => persistLolo(item))).catch((error) => console.error('Không thể lưu điều chỉnh cước nâng hạ vào backend:', error));
    alert(`Đã cập nhật ${bulkPercent > 0 ? 'tăng' : 'giảm'} ${Math.abs(bulkPercent)}% toàn bộ biểu cước nâng hạ!`);
    setIsBulkAdjustOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-2xl shadow-lg shrink-0">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                BIỂU CƯỚC NÂNG HẠ VỎ RỖNG (LIFT-ON / LIFT-OFF)
              </h2>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold rounded-full">
                VND / Tự Động Tính Thuế VAT 8%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Cấu hình biểu giá nâng/hạ vỏ rỗng chuyên dụng (Gate-In / Gate-Out), phí đảo chuyển vỏ rỗng bãi và phụ phí ca đêm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkAdjustOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Percent className="w-4 h-4 text-amber-400" />
            <span>Điều Chỉnh % Biểu Giá</span>
          </button>

          <button
            onClick={() => {
              const exportBlob = new Blob([JSON.stringify({ loloTariffs, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(exportBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `DEPOT-LOLO-TARIFFS-${new Date().toISOString().substring(0, 10)}.json`;
              a.click();
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Xuất Biểu Cước JSON</span>
          </button>
        </div>
      </div>

      {/* Toolbar: search + filter + create */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã, tên biểu cước..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tất cả phân loại vỏ rỗng</option>
            <option value="LIFT_EMPTY">Nâng hạ vỏ rỗng (Gate-In / Out)</option>
            <option value="SHIFTING">Đảo chuyển vỏ rỗng bãi (Shifting)</option>
            <option value="NIGHT_SURCHARGE">Phụ phí ca đêm vỏ rỗng</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/30 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Hạng Mục</span>
          </button>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Mã Cước</th>
                <th className="py-3 px-4 min-w-[220px]">Tên Dịch Vụ Nâng Hạ</th>
                <th className="py-3 px-3">Phân Loại</th>
                <th className="py-3 px-3">ĐVT</th>
                <th className="py-3 px-3 text-right bg-cyan-950/20 text-cyan-300">20' GP/DC</th>
                <th className="py-3 px-3 text-right bg-blue-950/20 text-blue-300">40' GP/HC</th>
                <th className="py-3 px-3 text-right bg-indigo-950/20 text-indigo-300">45' HC</th>
                <th className="py-3 px-3 text-right bg-teal-950/20 text-teal-300">20' RF (Lạnh)</th>
                <th className="py-3 px-3 text-right bg-emerald-950/20 text-emerald-300">40' RH (Lạnh)</th>
                <th className="py-3 px-3 text-right bg-amber-950/20 text-amber-300">OOG / Tank / FR</th>
                <th className="py-3 px-3 text-center">VAT</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 bg-slate-950/40">
              {filteredTariffs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">{item.tariffCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{item.nameVi}</div>
                    <div className="text-[11px] text-slate-400">{item.nameEn}</div>
                    {item.applicableShift === 'NIGHT_SURCHARGE' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold">
                        Ca đêm 22h-06h &amp; Lễ
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[11px] font-medium">
                      {item.serviceCategory === 'LIFT_EMPTY' && 'Nâng Hạ Vỏ Rỗng'}
                      {item.serviceCategory === 'SHIFTING' && 'Đảo Vỏ Rỗng'}
                      {item.serviceCategory === 'NIGHT_SURCHARGE' && 'Phụ Phí Đêm'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 font-medium whitespace-nowrap">{item.unit}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-cyan-300 bg-cyan-950/10 whitespace-nowrap">{formatVND(item.price20GP)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-300 bg-blue-950/10 whitespace-nowrap">{formatVND(item.price40GP_HC)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-300 bg-indigo-950/10 whitespace-nowrap">{formatVND(item.price45HC)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-300 bg-teal-950/10 whitespace-nowrap">{formatVND(item.price20RF)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-300 bg-emerald-950/10 whitespace-nowrap">{formatVND(item.price40RH)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-300 bg-amber-950/10 whitespace-nowrap">{formatVND(item.priceSpecial)}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-300">{item.vatPercent}%</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {item.status === 'ACTIVE' ? 'Hoạt Động' : 'Tạm Dừng'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition" title="Chỉnh sửa đơn giá">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 rounded-lg transition" title="Xóa hạng mục">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTariffs.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">Chưa có hạng mục cước nâng hạ nào khớp bộ lọc.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  {editingItem ? 'Cập Nhật Biểu Cước Nâng Hạ (LoLo)' : 'Thêm Mới Hạng Mục Cước Nâng Hạ'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mã Biểu Cước (Tariff Code) *</label>
                  <input
                    type="text"
                    required
                    value={form.tariffCode || ''}
                    onChange={(e) => setForm({ ...form, tariffCode: e.target.value.toUpperCase() })}
                    placeholder="VD: LOLO_MT_NORMAL"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phân Loại Dịch Vụ Vỏ Rỗng *</label>
                  <select
                    value={form.serviceCategory || 'LIFT_EMPTY'}
                    onChange={(e) => setForm({ ...form, serviceCategory: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LIFT_EMPTY">Nâng hạ vỏ container rỗng (Empty Lift-On / Off)</option>
                    <option value="SHIFTING">Đảo chuyển vỏ rỗng nội bộ bãi (Empty Shifting)</option>
                    <option value="NIGHT_SURCHARGE">Phụ phí ca đêm nâng hạ vỏ rỗng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Dịch Vụ (Tiếng Việt) *</label>
                <input
                  type="text"
                  required
                  value={form.nameVi || ''}
                  onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                  placeholder="VD: Cước nâng container rỗng lên xe đầu kéo"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Dịch Vụ (Tiếng Anh)</label>
                <input
                  type="text"
                  value={form.nameEn || ''}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="VD: Empty Container Lift-On to Truck"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Đơn Giá Theo Kích Cỡ Container (VNĐ)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">20' GP / DC</label>
                    <input type="number" value={form.price20GP || 0} onChange={(e) => setForm({ ...form, price20GP: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">40' GP / HC</label>
                    <input type="number" value={form.price40GP_HC || 0} onChange={(e) => setForm({ ...form, price40GP_HC: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-blue-300 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">45' HC</label>
                    <input type="number" value={form.price45HC || 0} onChange={(e) => setForm({ ...form, price45HC: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">20' RF (Lạnh)</label>
                    <input type="number" value={form.price20RF || 0} onChange={(e) => setForm({ ...form, price20RF: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-teal-300 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">40' RH (Lạnh)</label>
                    <input type="number" value={form.price40RH || 0} onChange={(e) => setForm({ ...form, price40RH: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-300 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">OOG / Tank / Flat</label>
                    <input type="number" value={form.priceSpecial || 0} onChange={(e) => setForm({ ...form, priceSpecial: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 font-bold" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Thuế VAT (%)</label>
                  <input type="number" value={form.vatPercent || 8} onChange={(e) => setForm({ ...form, vatPercent: Number(e.target.value) })} className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trạng Thái</label>
                  <select value={form.status || 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                    <option value="ACTIVE">Hoạt Động</option>
                    <option value="INACTIVE">Tạm Ngưng</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30">Lưu Biểu Cước LoLo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADJUST MODAL */}
      {isBulkAdjustOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <span>Điều Chỉnh Tỷ Lệ Biểu Cước Nâng Hạ</span>
              </h3>
              <button onClick={() => setIsBulkAdjustOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mức % Tăng / Giảm (+ / -)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bulkPercent}
                    onChange={(e) => setBulkPercent(Number(e.target.value))}
                    placeholder="VD: 5 hoặc -5"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-300 font-bold"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  (Nhập số dương để tăng giá cước, số âm để giảm giá cước. Giá sẽ tự động làm tròn về hàng nghìn VNĐ).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button onClick={() => setIsBulkAdjustOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Hủy</button>
              <button onClick={handleApplyBulkAdjust} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30">Áp Dụng Cập Nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
