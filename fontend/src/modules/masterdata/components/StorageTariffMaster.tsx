import React, { useState, useMemo, useEffect } from 'react';
import { StorageTariffRule, StorageTariffTier } from '../mockTariffData';
import { masterDataApi } from '../../../api';
import { useContainerTypeOptions } from '../utils/containerTypeCatalog';
import { useShippingLineOptions } from '../../../hooks/useShippingLineOptions';
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

// Cước Lưu Bãi (bảng StorageTariffRules / StorageTariffTier / StorageTariffTierPrices) — depot-fullstack-storage-tariff-pricing:
// - mỗi hãng tàu (hoặc "Mọi hãng") tối đa 1 quy tắc đang dùng; hãng tàu lấy từ DM Hãng Tàu;
// - ngày miễn phí chỉ khai ở "Số ngày miễn phí", bậc đầu bắt đầu ngày (miễn phí + 1), các bậc liền nhau (từ ngày tự tính);
// - giá mỗi bậc theo từng loại đang dùng của DM Loại Container, VND; server kiểm tra lại và tính phí khi Gate-Out.
const ALL_LINES = 'ALL';
const ALL_LINES_NAME = 'Mọi hãng tàu';

const emptyTier = (): StorageTariffTier => ({ tierName: '', fromDay: 0, toDay: null, prices: {} });

/** Từ ngày của từng bậc tính lại theo ngày miễn phí + "đến ngày" của bậc trước (bậc liền nhau). */
const withFromDays = (freeDays: number, tiers: StorageTariffTier[]): StorageTariffTier[] => {
  let next = Math.max(0, freeDays) + 1;
  return tiers.map((t) => {
    const tier = { ...t, fromDay: next };
    next = (t.toDay ?? next) + 1;
    return tier;
  });
};

export const StorageTariffMaster: React.FC = () => {
  const containerTypes = useContainerTypeOptions();
  const shippingLines = useShippingLineOptions();
  const [storageRules, setStorageRules] = useState<StorageTariffRule[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const extractErrorMessage = (error: any, fallback: string): string =>
    error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : fallback);

  const loadRules = async () => {
    const response = await masterDataApi.getStorageTariffs(true);
    setStorageRules((response.data as any[] || []).map((item: any) => ({
      id: String(item.id), ruleCode: item.code, shippingLineCode: item.shippingLineCode || ALL_LINES,
      shippingLineName: item.shippingLineName || '', defaultFreeDays: item.defaultFreeDays ?? 0,
      vatPercent: item.vatPercent ?? 8, status: item.isActive ? 'ACTIVE' : 'INACTIVE', notes: item.notes || '',
      updatedAt: String(item.lastModifiedAt || item.createdAt || '').substring(0, 10),
      tiers: (item.tiers || []).map((t: any) => ({
        tierName: t.tierName, fromDay: t.fromDay, toDay: t.toDay ?? null,
        prices: Object.fromEntries((t.prices || []).map((p: any) => [String(p.containerTypeCode).toUpperCase(), Number(p.price) || 0]))
      }))
    } as StorageTariffRule)));
  };

  useEffect(() => {
    loadRules().catch((error) => setSaveError(extractErrorMessage(error, 'Không thể tải cước lưu bãi từ backend.')));
  }, []);

  const toRequest = (rule: StorageTariffRule) => ({
    code: rule.ruleCode,
    shippingLineCode: rule.shippingLineCode || ALL_LINES,
    defaultFreeDays: rule.defaultFreeDays,
    vatPercent: rule.vatPercent,
    notes: rule.notes,
    isActive: rule.status !== 'INACTIVE',
    tiers: withFromDays(rule.defaultFreeDays, rule.tiers).map((t, idx) => ({
      tierName: t.tierName, fromDay: t.fromDay, toDay: t.toDay, sortOrder: idx + 1,
      prices: Object.entries(t.prices || {}).filter(([, p]) => Number(p) > 0).map(([containerTypeCode, price]) => ({ containerTypeCode, price }))
    }))
  });

  const isRealId = (id: string) => /^\d+$/.test(String(id ?? ''));

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [shippingLineFilter, setShippingLineFilter] = useState<string>('');
  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState<boolean>(false);
  const [bulkPercent, setBulkPercent] = useState<number>(5);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<StorageTariffRule | null>(null);
  const emptyForm: StorageTariffRule = {
    id: '', ruleCode: '', shippingLineCode: ALL_LINES, shippingLineName: ALL_LINES_NAME, defaultFreeDays: 5,
    vatPercent: 8, status: 'ACTIVE', notes: '', updatedAt: '', tiers: [emptyTier()]
  };
  const [form, setForm] = useState<StorageTariffRule>(emptyForm);

  const lineName = (code: string) => code === ALL_LINES ? ALL_LINES_NAME : shippingLines.find((l) => l.code === code)?.name || code;

  const filteredStorageRules = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return storageRules.filter((rule) => {
      const matchSearch = !q || rule.ruleCode.toLowerCase().includes(q) || rule.shippingLineName.toLowerCase().includes(q) || rule.notes.toLowerCase().includes(q);
      const matchLine = !shippingLineFilter || rule.shippingLineCode === shippingLineFilter;
      return matchSearch && matchLine;
    });
  }, [storageRules, searchTerm, shippingLineFilter]);

  // Điều chỉnh % chỉ áp quy tắc đang dùng trong bộ lọc hiện tại.
  const bulkTargets = filteredStorageRules.filter((r) => r.status === 'ACTIVE');

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount);

  const handleApplyBulkAdjust = async () => {
    if (bulkTargets.length === 0) return;
    if (!window.confirm(`${bulkPercent > 0 ? 'Tăng' : 'Giảm'} ${Math.abs(bulkPercent)}% đơn giá cho ${bulkTargets.length} quy tắc đang dùng trong bộ lọc hiện tại?`)) return;
    const multiplier = 1 + bulkPercent / 100;
    setSaveError(null);
    setIsSaving(true);
    try {
      for (const rule of bulkTargets) {
        const tiers = rule.tiers.map((t) => ({
          ...t,
          prices: Object.fromEntries(Object.entries(t.prices).map(([code, p]) => [code, Math.round((p * multiplier) / 1000) * 1000]))
        }));
        await masterDataApi.updateStorageTariff(rule.id, toRequest({ ...rule, tiers }));
      }
      setIsBulkAdjustOpen(false);
    } catch (error) {
      setSaveError(extractErrorMessage(error, 'Không thể lưu điều chỉnh cước lưu bãi — một số quy tắc có thể chưa được cập nhật.'));
    } finally {
      setIsSaving(false);
      await loadRules().catch(() => {});
    }
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setSaveError(null);
    setForm({ ...emptyForm, tiers: [emptyTier()] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: StorageTariffRule) => {
    setEditingRule(rule);
    setSaveError(null);
    setForm({ ...rule, tiers: rule.tiers.map((t) => ({ ...t, prices: { ...t.prices } })) });
    setIsModalOpen(true);
  };

  const handleAddTier = () => setForm((prev) => ({ ...prev, tiers: [...prev.tiers, emptyTier()] }));
  const handleRemoveTier = (index: number) => setForm((prev) => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }));
  const updateTier = (index: number, patch: Partial<StorageTariffTier>) =>
    setForm((prev) => ({ ...prev, tiers: prev.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)) }));
  const setTierPrice = (index: number, code: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === index ? { ...t, prices: { ...t.prices, [code]: value === '' ? 0 : Number(value) } } : t))
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ruleCode.trim() || form.tiers.length === 0) {
      setSaveError('Nhập mã quy tắc và ít nhất 1 bậc giá.');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      const request = toRequest({ ...form, ruleCode: form.ruleCode.trim().toUpperCase() });
      if (editingRule && isRealId(editingRule.id)) await masterDataApi.updateStorageTariff(editingRule.id, request);
      else await masterDataApi.createStorageTariff(request);
      setIsModalOpen(false);
      setEditingRule(null);
      await loadRules();
    } catch (error) {
      setSaveError(extractErrorMessage(error, 'Không thể lưu quy tắc lưu bãi.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (rule: StorageTariffRule) => {
    if (!window.confirm(`Xoá quy tắc lưu bãi ${rule.ruleCode}? (Muốn ngừng tạm thời thì sửa trạng thái sang Tạm Ngưng.)`)) return;
    setSaveError(null);
    try {
      await masterDataApi.deactivateStorageTariff(rule.id);
      await loadRules();
    } catch (error) {
      setSaveError(extractErrorMessage(error, 'Không thể xoá quy tắc lưu bãi.'));
    }
  };

  const formTiers = withFromDays(form.defaultFreeDays, form.tiers);

  return (
    <div className="space-y-6">
      {saveError && !isModalOpen && (
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
                VND / Cont / Ngày
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Mỗi hãng tàu (hoặc Mọi hãng tàu) một quy tắc đang dùng: số ngày miễn phí + các bậc giá theo ngày, đơn giá theo từng loại
              của DM Loại Container. Hệ thống tự tính phí lưu bãi khi Gate-Out (tính cả ngày vào và ngày ra).
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
              data-testid="storage-line-filter"
              value={shippingLineFilter}
              onChange={(e) => setShippingLineFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="">Tất cả quy tắc</option>
              <option value={ALL_LINES}>{ALL_LINES_NAME}</option>
              {shippingLines.map((l) => <option key={l.code} value={l.code}>{l.name} ({l.code})</option>)}
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
        <div className="space-y-4">
          {filteredStorageRules.map((rule) => (
            <div key={rule.id} data-testid="storage-rule-card" className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs rounded-lg">
                      {rule.ruleCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{lineName(rule.shippingLineCode)}</h4>
                    {rule.status === 'INACTIVE' && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-full">Tạm Ngưng</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{rule.notes}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl whitespace-nowrap">
                    Miễn phí {rule.defaultFreeDays} ngày
                  </span>
                  <span className="px-2.5 py-1 bg-white text-slate-600 border border-slate-200 font-bold text-xs rounded-xl whitespace-nowrap">
                    VAT {rule.vatPercent}%
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white text-slate-500 font-bold">
                      <th className="py-2.5 px-3 whitespace-nowrap">Bậc giá (VND / ngày)</th>
                      {containerTypes.map((ct) => (
                        <th key={ct.typeCode} data-testid="storage-price-col" className="py-2.5 px-3 text-right font-mono whitespace-nowrap" title={ct.vietnameseName}>{ct.typeCode}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-slate-700">
                    {rule.tiers.map((tier, tIdx) => (
                      <tr key={tIdx} className="hover:bg-white">
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                          <div className="text-slate-900 font-bold">{tier.tierName}</div>
                          <div className="text-[10px] text-slate-500">
                            {tier.toDay ? `Ngày ${tier.fromDay} - ${tier.toDay}` : `Từ ngày ${tier.fromDay} trở đi`}
                          </div>
                        </td>
                        {containerTypes.map((ct) => {
                          const price = tier.prices[ct.typeCode.toUpperCase()] || 0;
                          return (
                            <td key={ct.typeCode} className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                              {price > 0 ? formatVND(price) : <span className="text-slate-400 font-normal">Chưa có giá</span>}
                            </td>
                          );
                        })}
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
                    title="Sửa quy tắc lưu bãi"
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold transition flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Sửa Biểu Phí
                  </button>
                  <button
                    onClick={() => handleDelete(rule)}
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
            <div className="py-8 text-center text-slate-500 text-xs">Chưa có quy tắc lưu bãi nào khớp bộ lọc.</div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8">
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
              {saveError && (
                <div data-testid="storage-save-error" className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">{saveError}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Quy Tắc (Rule Code) *</label>
                  <input
                    data-testid="storage-code"
                    type="text"
                    required
                    disabled={!!editingRule}
                    value={form.ruleCode}
                    onChange={(e) => setForm({ ...form, ruleCode: e.target.value.toUpperCase() })}
                    placeholder="VD: STOR_DRY_STANDARD"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hãng Tàu Áp Dụng *</label>
                  <select
                    data-testid="storage-line"
                    value={form.shippingLineCode}
                    onChange={(e) => setForm({ ...form, shippingLineCode: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={ALL_LINES}>{ALL_LINES_NAME} (ALL)</option>
                    {shippingLines.map((l) => <option key={l.code} value={l.code}>{l.name} ({l.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Ngày Miễn Phí</label>
                  <input data-testid="storage-free-days" type="number" min={0} value={form.defaultFreeDays} onChange={(e) => setForm({ ...form, defaultFreeDays: Number(e.target.value) })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thuế VAT (%)</label>
                  <input data-testid="storage-vat" type="number" min={0} max={100} value={form.vatPercent} onChange={(e) => setForm({ ...form, vatPercent: Number(e.target.value) })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng Thái</label>
                  <select data-testid="storage-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StorageTariffRule['status'] })} className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900">
                    <option value="ACTIVE">Hoạt Động</option>
                    <option value="INACTIVE">Tạm Ngưng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Bậc Giá Lũy Tiến (sau {Math.max(0, form.defaultFreeDays)} ngày miễn phí)</h4>
                    <p className="text-[11px] text-slate-500">Từ ngày tự tính theo bậc trước; bậc cuối để trống "Đến ngày". Ô giá trống = chưa có giá cho loại đó.</p>
                  </div>
                  <button type="button" onClick={handleAddTier} className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Thêm Bậc
                  </button>
                </div>

                {formTiers.map((tier, idx) => (
                  <div key={idx} data-testid="storage-tier" className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        placeholder={`Tên bậc (VD: Bậc ${idx + 1})`}
                        value={tier.tierName}
                        onChange={(e) => updateTier(idx, { tierName: e.target.value })}
                        className="flex-1 min-w-[160px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-bold"
                      />
                      <span className="text-xs text-slate-500">Từ ngày <b className="font-mono text-slate-900">{tier.fromDay}</b> đến</span>
                      <input
                        data-testid={`storage-tier-to-${idx}`}
                        type="number"
                        placeholder="trở đi"
                        value={tier.toDay ?? ''}
                        onChange={(e) => updateTier(idx, { toDay: e.target.value.trim() === '' ? null : Number(e.target.value) })}
                        className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      {formTiers.length > 1 && (
                        <button type="button" onClick={() => handleRemoveTier(idx)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg" title="Bỏ bậc">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {containerTypes.map((ct) => {
                        const code = ct.typeCode.toUpperCase();
                        return (
                          <div key={code}>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5 font-mono" title={ct.vietnameseName}>{ct.typeCode}</label>
                            <input
                              data-testid={`storage-price-${idx}-${code}`}
                              type="number"
                              min={0}
                              value={tier.prices[code] ? tier.prices[code] : ''}
                              onChange={(e) => setTierPrice(idx, code, e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition">Hủy Bỏ</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-lg">Lưu Quy Tắc Lưu Bãi</button>
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
                <p data-testid="storage-bulk-target-count" className="text-[11px] text-amber-700 mt-1">
                  Áp dụng cho {bulkTargets.length} quy tắc đang dùng trong bộ lọc hiện tại (bỏ qua quy tắc tạm ngưng). Giá làm tròn về hàng nghìn VNĐ.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button onClick={() => setIsBulkAdjustOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Hủy</button>
              <button onClick={handleApplyBulkAdjust} disabled={isSaving || bulkTargets.length === 0} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-lg ">Áp Dụng Cập Nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
