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
// Phân loại dịch vụ có trong bảng ServiceTariffs thật (VPS có đủ 7 loại). Trước đây màn này chỉ biết 3 loại
// đầu → cột Phân Loại để trống và form sửa tự nhảy về "Nâng hạ vỏ rỗng" với các dòng LIFT_LADEN/PTI/...
const SERVICE_CATEGORY_LABELS: Record<string, { short: string; long: string }> = {
  LIFT_EMPTY: { short: 'Nâng Hạ Vỏ Rỗng', long: 'Nâng hạ vỏ container rỗng (Empty Lift-On / Off)' },
  LIFT_LADEN: { short: 'Nâng Hạ Cont Hàng', long: 'Nâng hạ container có hàng (Laden Lift-On / Off)' },
  SHIFTING: { short: 'Đảo Chuyển Bãi', long: 'Đảo chuyển container nội bộ bãi (Shifting)' },
  NIGHT_SURCHARGE: { short: 'Phụ Phí Đêm', long: 'Phụ phí ca đêm nâng hạ' },
  PTI: { short: 'PTI Cont Lạnh', long: 'Kiểm tra PTI container lạnh (Pre-Trip Inspection)' },
  CUSTOMS: { short: 'Giám Sát Hải Quan', long: 'Giám sát / kiểm hóa hải quan' },
  WEIGHING: { short: 'Cân Container', long: 'Cân container (VGM / Weighing)' }
};
const categoryLabel = (code: string, kind: 'short' | 'long' = 'short') => SERVICE_CATEGORY_LABELS[code]?.[kind] || code;

export const LoloTariffMaster: React.FC = () => {
  const [loloTariffs, setLoloTariffs] = useState<LoLoTariffItem[]>([]);
  // BUG-032: trong lúc chờ API trước đây bảng hiện "Chưa có hạng mục…" như thể không có dữ liệu.
  const [isLoading, setIsLoading] = useState(true);
  // Trước đây mọi lỗi lưu/xoá chỉ `console.error`, người dùng không thấy gì — tưởng đã lưu xong nhưng
  // F5 lại mất (vd trùng mã biểu cước). Giờ hiện banner lỗi thật + rollback state khi thất bại.
  const [saveError, setSaveError] = useState<string | null>(null);
  const extractErrorMessage = (error: any, fallback: string): string =>
    error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : fallback);

  const loadTariffs = async () => {
    const response = await masterDataApi.getServiceTariffs({ includeInactive: true });
    // Bảng `ServiceTariffs` mới có cột thật (không còn JsonData tự do) — map thẳng 1-1, không cần
    // JSON.parse nữa.
    setLoloTariffs((response.data as any[] || []).map((item: any) => ({
      id: String(item.id), tariffCode: item.code, serviceCategory: item.serviceCategory || 'LIFT_EMPTY',
      nameVi: item.nameVi, nameEn: item.nameEn || '', unit: item.unit || 'Lần / Cont',
      price20GP: item.price20GP || 0, price40GP_HC: item.price40HC || 0, price45HC: item.price45HC || 0,
      price20RF: item.price20RF || 0, price40RH: item.price40RH || 0, priceSpecial: item.priceSpecial || 0,
      vatPercent: item.vatPercent ?? 8, currency: item.currency || 'VND', description: item.description || '',
      applicableShift: item.applicableShift || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', updatedAt: item.lastModifiedAt || item.createdAt || '',
      sortOrder: item.sortOrder ?? 0
    } as LoLoTariffItem)));
  };

  useEffect(() => {
    loadTariffs()
      .catch((error) => setSaveError(extractErrorMessage(error, 'Không thể tải cước nâng hạ từ backend.')))
      .finally(() => setIsLoading(false));
  }, []);

  // `ServiceTariff.Id` backend là `long` (vd "1", "42"), KHÔNG phải Guid — xem lịch sử bug id-format ở
  // docs/backend-progress/23-master-data.md mục "Bug thật thứ 3" trước khi đổi lại thành regex Guid.
  const isRealCatalogId = (id: string) => /^\d+$/.test(String(id ?? ''));

  const deriveShift = (item: Pick<LoLoTariffItem, 'serviceCategory' | 'applicableShift'>): LoLoTariffItem['applicableShift'] =>
    item.serviceCategory === 'NIGHT_SURCHARGE' ? 'NIGHT_SURCHARGE' : (item.applicableShift === 'NIGHT_SURCHARGE' ? 'ALL' : item.applicableShift);

  const persistLolo = async (item: LoLoTariffItem) => {
    const request = {
      code: item.tariffCode,
      serviceCategory: item.serviceCategory,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      unit: item.unit,
      price20GP: item.price20GP, price40HC: item.price40GP_HC, price45HC: item.price45HC,
      price20RF: item.price20RF, price40RH: item.price40RH, priceSpecial: item.priceSpecial,
      vatPercent: item.vatPercent, currency: item.currency,
      // Calculator tìm phụ phí đêm theo applicableShift === 'NIGHT_SURCHARGE' — form không có ô chọn ca
      // riêng nên suy ra theo Phân loại, nếu không hạng mục "Phụ phí ca đêm" tạo mới sẽ không bao giờ được dùng.
      applicableShift: deriveShift(item),
      description: item.description,
      isActive: item.status !== 'INACTIVE',
      // Trước đây không gửi → backend ghi SortOrder = 0 cho mọi hạng mục vừa sửa, xáo trộn thứ tự.
      sortOrder: item.sortOrder ?? 0
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
    // Không điền sẵn giá mẫu — đơn giá phải do người dùng nhập, tránh lưu nhầm giá "mẫu" thành giá thật.
    tariffCode: '', serviceCategory: 'LIFT_EMPTY', nameVi: '', nameEn: '', unit: 'Lần / Cont',
    price20GP: 0, price40GP_HC: 0, price45HC: 0, price20RF: 0, price40RH: 0,
    priceSpecial: 0, vatPercent: 8, currency: 'VND', description: '', applicableShift: 'ALL', status: 'ACTIVE'
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

    setSaveError(null);
    if (editingItem) {
      const previousItem = editingItem;
      const savedItem: LoLoTariffItem = { ...editingItem, ...form, updatedAt: new Date().toISOString().substring(0, 10) } as LoLoTariffItem;
      savedItem.applicableShift = deriveShift(savedItem);
      setLoloTariffs((prev) => prev.map((item) => (item.id === editingItem.id ? savedItem : item)));
      void persistLolo(savedItem).catch((error) => {
        setLoloTariffs((prev) => prev.map((item) => (item.id === previousItem.id ? previousItem : item)));
        setSaveError(extractErrorMessage(error, 'Không thể lưu cước nâng hạ vào backend.'));
      });
    } else {
      const newItem: LoLoTariffItem = {
        id: `LOLO-${Date.now().toString().slice(-4)}`,
        tariffCode: form.tariffCode || `LOLO_${Date.now().toString().slice(-3)}`,
        serviceCategory: form.serviceCategory || 'LIFT_EMPTY',
        nameVi: form.nameVi || '', nameEn: form.nameEn || '', unit: form.unit || 'Lần / Cont',
        price20GP: Number(form.price20GP) || 0, price40GP_HC: Number(form.price40GP_HC) || 0, price45HC: Number(form.price45HC) || 0,
        price20RF: Number(form.price20RF) || 0, price40RH: Number(form.price40RH) || 0, priceSpecial: Number(form.priceSpecial) || 0,
        vatPercent: Number(form.vatPercent ?? 8), currency: 'VND', description: form.description || '',
        applicableShift: deriveShift({ serviceCategory: form.serviceCategory || 'LIFT_EMPTY', applicableShift: form.applicableShift || 'ALL' }), status: form.status || 'ACTIVE',
        updatedAt: new Date().toISOString().substring(0, 10),
        sortOrder: loloTariffs.reduce((max, t) => Math.max(max, t.sortOrder ?? 0), 0) + 1
      };
      setLoloTariffs((prev) => [newItem, ...prev]);
      void persistLolo(newItem).catch((error) => {
        setLoloTariffs((prev) => prev.filter((item) => item.id !== newItem.id));
        setSaveError(extractErrorMessage(error, 'Không thể lưu cước nâng hạ vào backend.'));
      });
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hạng mục cước nâng hạ này?')) {
      const removedItem = loloTariffs.find((t) => t.id === id);
      setSaveError(null);
      setLoloTariffs((prev) => prev.filter((t) => t.id !== id));
      if (isRealCatalogId(id)) {
        void masterDataApi.deactivateServiceTariff(id).catch((error) => {
          if (removedItem) setLoloTariffs((prev) => [...prev, removedItem].sort((a, b) => a.tariffCode.localeCompare(b.tariffCode)));
          setSaveError(extractErrorMessage(error, 'Không thể vô hiệu hóa cước nâng hạ trên backend.'));
        });
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
    setForm({ ...emptyForm });
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
    setSaveError(null);
    setLoloTariffs(updated);
    Promise.all(updated.map((item) => persistLolo(item)))
      .then(() => {
        alert(`Đã cập nhật ${bulkPercent > 0 ? 'tăng' : 'giảm'} ${Math.abs(bulkPercent)}% toàn bộ biểu cước nâng hạ!`);
      })
      .catch((error) => {
        // Không rõ chính xác hạng mục nào đã lưu thành công giữa chừng — tải lại thật từ backend để
        // đồng bộ đúng trạng thái, thay vì giữ nguyên state lạc quan có thể sai lệch với DB.
        setSaveError(extractErrorMessage(error, 'Không thể lưu điều chỉnh cước nâng hạ vào backend — một số hạng mục có thể chưa được cập nhật.'));
        void loadTariffs().catch(() => {});
      });
    setIsBulkAdjustOpen(false);
  };

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">{saveError}</div>
      )}

      {/* Header Info Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded-2xl shadow-lg shrink-0">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                BIỂU CƯỚC NÂNG HẠ VỎ RỖNG (LIFT-ON / LIFT-OFF)
              </h2>
              <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-[11px] font-bold rounded-full">
                VND / Tự Động Tính Thuế VAT 8%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Cấu hình biểu giá nâng/hạ vỏ rỗng chuyên dụng (Gate-In / Gate-Out), phí đảo chuyển vỏ rỗng bãi và phụ phí ca đêm.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsBulkAdjustOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Percent className="w-4 h-4 text-amber-600" />
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
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Biểu Cước JSON</span>
          </button>
        </div>
      </div>

      {/* Toolbar: search + filter + create */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã, tên biểu cước..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Tất cả phân loại</option>
            {Array.from(new Set([...Object.keys(SERVICE_CATEGORY_LABELS), ...loloTariffs.map((t) => t.serviceCategory)])).map((code) => (
              <option key={code} value={code}>{categoryLabel(code)}</option>
            ))}
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg  whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Hạng Mục</span>
          </button>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                <th className="py-3 px-4">Mã Cước</th>
                <th className="py-3 px-4 min-w-[220px]">Tên Dịch Vụ Nâng Hạ</th>
                <th className="py-3 px-3">Phân Loại</th>
                <th className="py-3 px-3">ĐVT</th>
                <th className="py-3 px-3 text-right bg-cyan-50 text-cyan-700">20' GP/DC</th>
                <th className="py-3 px-3 text-right bg-blue-50 text-blue-700">40' GP/HC</th>
                <th className="py-3 px-3 text-right bg-indigo-50 text-indigo-700">45' HC</th>
                <th className="py-3 px-3 text-right bg-teal-50 text-teal-700">20' RF (Lạnh)</th>
                <th className="py-3 px-3 text-right bg-emerald-50 text-emerald-700">40' RH (Lạnh)</th>
                <th className="py-3 px-3 text-right bg-amber-50 text-amber-700">OOG / Tank / FR</th>
                <th className="py-3 px-3 text-center">VAT</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-slate-700 bg-slate-50">
              {filteredTariffs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 whitespace-nowrap">{item.tariffCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.nameVi}</div>
                    <div className="text-[11px] text-slate-500">{item.nameEn}</div>
                    {item.applicableShift === 'NIGHT_SURCHARGE' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                        Ca đêm 22h-06h &amp; Lễ
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                      {categoryLabel(item.serviceCategory)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-medium whitespace-nowrap">{item.unit}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-cyan-700 bg-cyan-50 whitespace-nowrap">{formatVND(item.price20GP)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-blue-700 bg-blue-50 whitespace-nowrap">{formatVND(item.price40GP_HC)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700 bg-indigo-50 whitespace-nowrap">{formatVND(item.price45HC)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-700 bg-teal-50 whitespace-nowrap">{formatVND(item.price20RF)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50 whitespace-nowrap">{formatVND(item.price40RH)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-700 bg-amber-50 whitespace-nowrap">{formatVND(item.priceSpecial)}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">{item.vatPercent}%</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      {item.status === 'ACTIVE' ? 'Hoạt Động' : 'Tạm Dừng'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition" title="Chỉnh sửa đơn giá">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 rounded-lg transition" title="Xóa hạng mục">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTariffs.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">{isLoading ? 'Đang tải biểu cước nâng hạ…' : 'Chưa có hạng mục cước nâng hạ nào khớp bộ lọc.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Cập Nhật Biểu Cước Nâng Hạ (LoLo)' : 'Thêm Mới Hạng Mục Cước Nâng Hạ'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Biểu Cước (Tariff Code) *</label>
                  <input
                    type="text"
                    required
                    value={form.tariffCode || ''}
                    onChange={(e) => setForm({ ...form, tariffCode: e.target.value.toUpperCase() })}
                    placeholder="VD: LOLO_MT_NORMAL"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân Loại Dịch Vụ *</label>
                  <select
                    value={form.serviceCategory || 'LIFT_EMPTY'}
                    onChange={(e) => setForm({ ...form, serviceCategory: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    {Array.from(new Set([...Object.keys(SERVICE_CATEGORY_LABELS), form.serviceCategory || 'LIFT_EMPTY'])).map((code) => (
                      <option key={code} value={code}>{categoryLabel(code, 'long')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Dịch Vụ (Tiếng Việt) *</label>
                <input
                  type="text"
                  required
                  value={form.nameVi || ''}
                  onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                  placeholder="VD: Cước nâng container rỗng lên xe đầu kéo"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Dịch Vụ (Tiếng Anh)</label>
                <input
                  type="text"
                  value={form.nameEn || ''}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="VD: Empty Container Lift-On to Truck"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Đơn Giá Theo Kích Cỡ Container (VNĐ)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">20' GP / DC</label>
                    <input type="number" value={form.price20GP || 0} onChange={(e) => setForm({ ...form, price20GP: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-cyan-700 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">40' GP / HC</label>
                    <input type="number" value={form.price40GP_HC || 0} onChange={(e) => setForm({ ...form, price40GP_HC: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-blue-700 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">45' HC</label>
                    <input type="number" value={form.price45HC || 0} onChange={(e) => setForm({ ...form, price45HC: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-indigo-700 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">20' RF (Lạnh)</label>
                    <input type="number" value={form.price20RF || 0} onChange={(e) => setForm({ ...form, price20RF: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-teal-700 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">40' RH (Lạnh)</label>
                    <input type="number" value={form.price40RH || 0} onChange={(e) => setForm({ ...form, price40RH: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">OOG / Tank / Flat</label>
                    <input type="number" value={form.priceSpecial || 0} onChange={(e) => setForm({ ...form, priceSpecial: Number(e.target.value) })} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-amber-700 font-bold" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thuế VAT (%)</label>
                  <input type="number" value={form.vatPercent ?? 8} onChange={(e) => setForm({ ...form, vatPercent: Number(e.target.value) })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái</label>
                  <select value={form.status || 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900">
                    <option value="ACTIVE">Hoạt Động</option>
                    <option value="INACTIVE">Tạm Ngưng</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg ">Lưu Biểu Cước LoLo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADJUST MODAL */}
      {isBulkAdjustOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-600" />
                <span>Điều Chỉnh Tỷ Lệ Biểu Cước Nâng Hạ</span>
              </h3>
              <button onClick={() => setIsBulkAdjustOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức % Tăng / Giảm (+ / -)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bulkPercent}
                    onChange={(e) => setBulkPercent(Number(e.target.value))}
                    placeholder="VD: 5 hoặc -5"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-amber-700 font-bold"
                  />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  (Nhập số dương để tăng giá cước, số âm để giảm giá cước. Giá sẽ tự động làm tròn về hàng nghìn VNĐ).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button onClick={() => setIsBulkAdjustOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Hủy</button>
              <button onClick={handleApplyBulkAdjust} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg ">Áp Dụng Cập Nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
