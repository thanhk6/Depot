import React, { useState, useMemo, useEffect } from 'react';
import { StorageTariffRule, StorageTariffTier } from '../mockTariffData';
import { masterDataApi } from '../../../api';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Percent,
  X
} from 'lucide-react';

// Tách riêng khỏi màn "Cước Nâng Hạ & Lưu Bãi" gộp chung cũ (`LiftOnLiftOffAndStorageMaster.tsx`, đã
// xoá) theo yêu cầu người dùng — xem docs/frontend-tariff-catalog-split.md. Anh em với
// `LoloTariffMaster.tsx` (cước nâng hạ) nhưng độc lập hoàn toàn về state/API.
const SHIPPING_LINE_NAMES: Record<string, string> = {
  ALL: 'Áp Dụng Mọi Hãng Tàu',
  MSK: 'Maersk Line (MSK)',
  CMA: 'CMA CGM',
  MSC: 'MSC',
  ONE: 'ONE'
};

const emptyTier = (): StorageTariffTier => ({
  tierName: '', fromDay: 0, toDay: null,
  price20Dry: 0, price40Dry: 0, price45Dry: 0, price20Reefer: 0, price40Reefer: 0, priceSpecial: 0
});

export const StorageTariffMaster: React.FC = () => {
  const [storageRules, setStorageRules] = useState<StorageTariffRule[]>([]);
  // Trước đây mọi lỗi lưu/xoá chỉ `console.error`, người dùng không thấy gì — tưởng đã lưu xong nhưng
  // F5 lại mất (vd trùng mã quy tắc). Giờ hiện banner lỗi thật + rollback state khi thất bại.
  const [saveError, setSaveError] = useState<string | null>(null);
  const extractErrorMessage = (error: any, fallback: string): string =>
    error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : fallback);

  const loadRules = async () => {
    const response = await masterDataApi.getStorageTariffs();
    // Bảng `StorageTariffRules`/`StorageTariffTiers` mới có cột thật (không còn JsonData tự do) —
    // map thẳng 1-1, không cần JSON.parse nữa.
    setStorageRules((response.data as any[] || []).map((item: any) => ({
      id: String(item.id), ruleCode: item.code, shippingLineCode: item.shippingLineCode || 'ALL', shippingLineName: item.shippingLineName,
      containerTypeCategory: item.containerTypeCategory || 'DRY_STANDARD', defaultFreeDays: item.defaultFreeDays || 0,
      calculationUnit: item.calculationUnit || 'VND/Cont/Day', vatPercent: item.vatPercent || 8,
      status: item.isActive ? 'ACTIVE' : 'INACTIVE', notes: item.notes || '', updatedAt: item.lastModifiedAt || item.createdAt || '',
      tiers: (item.tiers || []).map((t: any) => ({
        tierName: t.tierName, fromDay: t.fromDay, toDay: t.toDay,
        price20Dry: t.price20Dry || 0, price40Dry: t.price40Dry || 0, price45Dry: t.price45Dry || 0,
        price20Reefer: t.price20Reefer || 0, price40Reefer: t.price40Reefer || 0, priceSpecial: t.priceSpecial || 0
      }))
    } as StorageTariffRule)));
  };

  useEffect(() => {
    loadRules().catch((error) => setSaveError(extractErrorMessage(error, 'Không thể tải cước lưu bãi từ backend.')));
  }, []);

  // `StorageTariffRule.Id` backend là `long` (vd "1", "42"), KHÔNG phải Guid — xem lịch sử bug id-format
  // ở docs/backend-progress/23-master-data.md mục "Bug thật thứ 3" trước khi đổi lại thành regex Guid.
  const isRealCatalogId = (id: string) => /^\d+$/.test(String(id ?? ''));

  const persistStorage = async (rule: StorageTariffRule) => {
    const request = {
      code: rule.ruleCode,
      shippingLineCode: rule.shippingLineCode,
      shippingLineName: rule.shippingLineName,
      containerTypeCategory: rule.containerTypeCategory,
      defaultFreeDays: rule.defaultFreeDays,
      calculationUnit: rule.calculationUnit,
      vatPercent: rule.vatPercent,
      notes: rule.notes,
      isActive: rule.status !== 'INACTIVE',
      tiers: rule.tiers.map((t, idx) => ({ ...t, sortOrder: idx + 1 }))
    };
    if (isRealCatalogId(rule.id)) {
      await masterDataApi.updateStorageTariff(rule.id, request);
    } else {
      const created: any = await masterDataApi.createStorageTariff(request);
      if (created?.data?.id) {
        setStorageRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, id: String(created.data.id) } : r)));
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [shippingLineFilter, setShippingLineFilter] = useState<string>('ALL');
  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState<boolean>(false);
  const [bulkPercent, setBulkPercent] = useState<number>(5);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<StorageTariffRule | null>(null);
  const emptyForm: Partial<StorageTariffRule> = {
    ruleCode: '', shippingLineCode: 'ALL', shippingLineName: SHIPPING_LINE_NAMES.ALL,
    containerTypeCategory: 'DRY_STANDARD', defaultFreeDays: 5, calculationUnit: 'VND/Cont/Day',
    vatPercent: 8, status: 'ACTIVE', notes: '', tiers: [emptyTier()]
  };
  const [form, setForm] = useState<Partial<StorageTariffRule>>(emptyForm);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const filteredStorageRules = useMemo(() => {
    return storageRules.filter((rule) => {
      const matchSearch =
        rule.ruleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.shippingLineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchLine = shippingLineFilter === 'ALL' || rule.shippingLineCode === shippingLineFilter;
      return matchSearch && matchLine;
    });
  }, [storageRules, searchTerm, shippingLineFilter]);

  const handleApplyBulkAdjust = () => {
    const multiplier = 1 + bulkPercent / 100;
    const updated = storageRules.map((rule) => ({
      ...rule,
      tiers: rule.tiers.map((t) => ({
        ...t,
        price20Dry: Math.round((t.price20Dry * multiplier) / 1000) * 1000,
        price40Dry: Math.round((t.price40Dry * multiplier) / 1000) * 1000,
        price45Dry: Math.round((t.price45Dry * multiplier) / 1000) * 1000,
        price20Reefer: Math.round((t.price20Reefer * multiplier) / 1000) * 1000,
        price40Reefer: Math.round((t.price40Reefer * multiplier) / 1000) * 1000,
        priceSpecial: Math.round((t.priceSpecial * multiplier) / 1000) * 1000
      })),
      updatedAt: new Date().toISOString().substring(0, 10)
    }));
    setSaveError(null);
    setStorageRules(updated);
    Promise.all(updated.map((rule) => persistStorage(rule)))
      .then(() => {
        alert(`Đã cập nhật ${bulkPercent > 0 ? 'tăng' : 'giảm'} ${Math.abs(bulkPercent)}% toàn bộ biểu cước lưu bãi!`);
      })
      .catch((error) => {
        // Không rõ chính xác quy tắc nào đã lưu thành công giữa chừng — tải lại thật từ backend để
        // đồng bộ đúng trạng thái, thay vì giữ nguyên state lạc quan có thể sai lệch với DB.
        setSaveError(extractErrorMessage(error, 'Không thể lưu điều chỉnh cước lưu bãi vào backend — một số quy tắc có thể chưa được cập nhật.'));
        void loadRules().catch(() => {});
      });
    setIsBulkAdjustOpen(false);
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setForm({ ...emptyForm, ruleCode: `STOR_${Math.floor(100 + Math.random() * 900)}`, tiers: [emptyTier()] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: StorageTariffRule) => {
    setEditingRule(rule);
    setForm({ ...rule, tiers: rule.tiers.map((t) => ({ ...t })) });
    setIsModalOpen(true);
  };

  const handleAddTier = () => {
    setForm((prev) => ({ ...prev, tiers: [...(prev.tiers || []), emptyTier()] }));
  };

  const handleRemoveTier = (index: number) => {
    setForm((prev) => ({ ...prev, tiers: (prev.tiers || []).filter((_, i) => i !== index) }));
  };

  const handleTierFieldChange = (index: number, field: keyof StorageTariffTier, value: string) => {
    setForm((prev) => ({
      ...prev,
      tiers: (prev.tiers || []).map((t, i) => {
        if (i !== index) return t;
        if (field === 'tierName') return { ...t, tierName: value };
        if (field === 'toDay') return { ...t, toDay: value.trim() === '' ? null : Number(value) };
        return { ...t, [field]: Number(value) };
      })
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ruleCode || !form.shippingLineName || !form.tiers || form.tiers.length === 0) {
      alert('Vui lòng nhập Mã quy tắc, Tên hãng tàu và ít nhất 1 khung thời gian (tier).');
      return;
    }

    const savedRule: StorageTariffRule = {
      id: editingRule?.id || `STOR-${Date.now().toString().slice(-4)}`,
      ruleCode: form.ruleCode || '',
      shippingLineCode: form.shippingLineCode || 'ALL',
      shippingLineName: form.shippingLineName || '',
      containerTypeCategory: form.containerTypeCategory || 'DRY_STANDARD',
      defaultFreeDays: Number(form.defaultFreeDays) || 0,
      calculationUnit: form.calculationUnit || 'VND/Cont/Day',
      vatPercent: Number(form.vatPercent) || 8,
      status: form.status || 'ACTIVE',
      notes: form.notes || '',
      tiers: form.tiers,
      updatedAt: new Date().toISOString().substring(0, 10)
    };

    setSaveError(null);
    const previousRule = editingRule;
    if (editingRule) {
      setStorageRules((prev) => prev.map((r) => (r.id === editingRule.id ? savedRule : r)));
    } else {
      setStorageRules((prev) => [savedRule, ...prev]);
    }
    void persistStorage(savedRule).catch((error) => {
      if (previousRule) {
        setStorageRules((prev) => prev.map((r) => (r.id === previousRule.id ? previousRule : r)));
      } else {
        setStorageRules((prev) => prev.filter((r) => r.id !== savedRule.id));
      }
      setSaveError(extractErrorMessage(error, 'Không thể lưu quy tắc lưu bãi vào backend.'));
    });

    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quy tắc lưu bãi này?')) return;
    const removedRule = storageRules.find((r) => r.id === id);
    setSaveError(null);
    setStorageRules((prev) => prev.filter((r) => r.id !== id));
    if (isRealCatalogId(id)) {
      void masterDataApi.deactivateStorageTariff(id).catch((error) => {
        if (removedRule) setStorageRules((prev) => [...prev, removedRule].sort((a, b) => a.ruleCode.localeCompare(b.ruleCode)));
        setSaveError(extractErrorMessage(error, 'Không thể vô hiệu hóa quy tắc lưu bãi trên backend.'));
      });
    }
  };

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">{saveError}</div>
      )}

      {/* Header Info Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl shadow-lg shrink-0">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                BIỂU CƯỚC LƯU BÃI LŨY TIẾN (STORAGE)
              </h2>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold rounded-full">
                VND / Tự Động Tính Thuế VAT 8%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Chính sách ngày miễn phí (Free Time) và biểu phí lưu bãi lũy tiến theo từng hãng tàu / loại container.
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
              const exportBlob = new Blob([JSON.stringify({ storageRules, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(exportBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `DEPOT-STORAGE-TARIFFS-${new Date().toISOString().substring(0, 10)}.json`;
              a.click();
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Biểu Cước JSON</span>
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo mã, hãng tàu, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={shippingLineFilter}
              onChange={(e) => setShippingLineFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tất cả hãng tàu</option>
              <option value="MSK">Maersk Line (MSK)</option>
              <option value="CMA">CMA CGM</option>
              <option value="MSC">MSC</option>
              <option value="ONE">ONE</option>
            </select>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg  whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Quy Tắc Lưu Bãi</span>
            </button>
          </div>
        </div>

        {/* Storage Rules Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredStorageRules.map((rule) => (
            <div key={rule.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:border-slate-200 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs rounded-lg">
                      {rule.ruleCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{rule.shippingLineName}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{rule.notes}</p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl whitespace-nowrap">
                  {rule.defaultFreeDays} Ngày Free Time
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Khung Thời Gian</th>
                      <th className="py-2.5 px-3 text-right">20' Dry (VND)</th>
                      <th className="py-2.5 px-3 text-right">40' Dry/HC (VND)</th>
                      <th className="py-2.5 px-3 text-right">45' HC (VND)</th>
                      <th className="py-2.5 px-3 text-right text-teal-700">20' Reefer</th>
                      <th className="py-2.5 px-3 text-right text-emerald-700">40' Reefer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-slate-700">
                    {rule.tiers.map((tier, tIdx) => (
                      <tr key={tIdx} className="hover:bg-white">
                        <td className="py-2.5 px-3 font-medium">
                          <div className="text-slate-900 font-bold">{tier.tierName}</div>
                          <div className="text-[10px] text-slate-500">
                            {tier.toDay ? `Ngày ${tier.fromDay} - ${tier.toDay}` : `Từ ngày ${tier.fromDay} trở đi`}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {tier.price20Dry === 0 ? <span className="text-emerald-600">Miễn Phí</span> : formatVND(tier.price20Dry)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {tier.price40Dry === 0 ? <span className="text-emerald-600">Miễn Phí</span> : formatVND(tier.price40Dry)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {tier.price45Dry === 0 ? <span className="text-emerald-600">Miễn Phí</span> : formatVND(tier.price45Dry)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                          {tier.price20Reefer === 0 ? <span className="text-emerald-600">Miễn Phí</span> : formatVND(tier.price20Reefer)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {tier.price40Reefer === 0 ? <span className="text-emerald-600">Miễn Phí</span> : formatVND(tier.price40Reefer)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 text-slate-500 border-t border-slate-200/80">
                <span>Cập nhật ngày: {rule.updatedAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold transition flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Sửa Biểu Phí
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/40 rounded font-bold transition flex items-center gap-1"
                    title="Xóa quy tắc"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredStorageRules.length === 0 && (
            <div className="xl:col-span-2 py-8 text-center text-slate-500 text-xs">Chưa có quy tắc lưu bãi nào khớp bộ lọc.</div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingRule ? 'Cập Nhật Quy Tắc Lưu Bãi' : 'Thêm Mới Quy Tắc Lưu Bãi'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Quy Tắc (Rule Code) *</label>
                  <input
                    type="text"
                    required
                    value={form.ruleCode || ''}
                    onChange={(e) => setForm({ ...form, ruleCode: e.target.value.toUpperCase() })}
                    placeholder="VD: STOR_DRY_STANDARD"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hãng Tàu Áp Dụng *</label>
                  <select
                    value={form.shippingLineCode || 'ALL'}
                    onChange={(e) => setForm({ ...form, shippingLineCode: e.target.value, shippingLineName: SHIPPING_LINE_NAMES[e.target.value] || form.shippingLineName })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(SHIPPING_LINE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>{name} ({code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Hãng Tàu Hiển Thị *</label>
                <input
                  type="text"
                  required
                  value={form.shippingLineName || ''}
                  onChange={(e) => setForm({ ...form, shippingLineName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân Loại Container</label>
                  <select
                    value={form.containerTypeCategory || 'DRY_STANDARD'}
                    onChange={(e) => setForm({ ...form, containerTypeCategory: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="DRY_STANDARD">Dry Tiêu Chuẩn</option>
                    <option value="SPECIAL_OOG">OOG Đặc Biệt</option>
                    <option value="IMO_HAZARDOUS">Hàng Nguy Hiểm (IMO)</option>
                    <option value="ISO_TANK">ISO Tank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Ngày Free Time</label>
                  <input type="number" value={form.defaultFreeDays ?? 0} onChange={(e) => setForm({ ...form, defaultFreeDays: Number(e.target.value) })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn Vị Tính</label>
                  <select value={form.calculationUnit || 'VND/Cont/Day'} onChange={(e) => setForm({ ...form, calculationUnit: e.target.value as any })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900">
                    <option value="VND/Cont/Day">VND/Cont/Ngày</option>
                    <option value="USD/Cont/Day">USD/Cont/Ngày</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thuế VAT (%)</label>
                  <input type="number" value={form.vatPercent ?? 8} onChange={(e) => setForm({ ...form, vatPercent: Number(e.target.value) })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú</label>
                <input
                  type="text"
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái</label>
                <select value={form.status || 'ACTIVE'} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-48 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900">
                  <option value="ACTIVE">Hoạt Động</option>
                  <option value="INACTIVE">Tạm Ngưng</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Khung Thời Gian Lũy Tiến (Tiers)</h4>
                  <button type="button" onClick={handleAddTier} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Thêm Khung
                  </button>
                </div>

                {(form.tiers || []).map((tier, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tên khung (VD: Ngày 1-5 Free)"
                        value={tier.tierName}
                        onChange={(e) => handleTierFieldChange(idx, 'tierName', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-bold"
                      />
                      <input type="number" placeholder="Từ ngày" value={tier.fromDay} onChange={(e) => handleTierFieldChange(idx, 'fromDay', e.target.value)} className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono" />
                      <input type="number" placeholder="Đến ngày (bỏ trống = trở đi)" value={tier.toDay ?? ''} onChange={(e) => handleTierFieldChange(idx, 'toDay', e.target.value)} className="w-36 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono" />
                      {(form.tiers || []).length > 1 && (
                        <button type="button" onClick={() => handleRemoveTier(idx)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">20' Dry</label>
                        <input type="number" value={tier.price20Dry} onChange={(e) => handleTierFieldChange(idx, 'price20Dry', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">40' Dry/HC</label>
                        <input type="number" value={tier.price40Dry} onChange={(e) => handleTierFieldChange(idx, 'price40Dry', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">45' HC</label>
                        <input type="number" value={tier.price45Dry} onChange={(e) => handleTierFieldChange(idx, 'price45Dry', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-teal-600 mb-0.5">20' Reefer</label>
                        <input type="number" value={tier.price20Reefer} onChange={(e) => handleTierFieldChange(idx, 'price20Reefer', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-600 mb-0.5">40' Reefer</label>
                        <input type="number" value={tier.price40Reefer} onChange={(e) => handleTierFieldChange(idx, 'price40Reefer', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-600 mb-0.5">Đặc Biệt</label>
                        <input type="number" value={tier.priceSpecial} onChange={(e) => handleTierFieldChange(idx, 'priceSpecial', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg">Lưu Quy Tắc Lưu Bãi</button>
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
                <span>Điều Chỉnh Tỷ Lệ Biểu Cước Lưu Bãi</span>
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
