import React, { useState, useMemo, useEffect } from 'react';
import { StorageTariffRule } from '../mockTariffData';
import { masterDataApi } from '../../../api';
import {
  Layers,
  Search,
  Plus,
  Download,
  Percent,
  X
} from 'lucide-react';

// Tách riêng khỏi màn "Cước Nâng Hạ & Lưu Bãi" gộp chung cũ (`LiftOnLiftOffAndStorageMaster.tsx`, đã
// xoá) theo yêu cầu người dùng — xem docs/frontend-tariff-catalog-split.md. Anh em với
// `LoloTariffMaster.tsx` (cước nâng hạ) nhưng độc lập hoàn toàn về state/API.
//
// Lưu ý kế thừa nguyên trạng: nút "+ Thêm Quy Tắc Lưu Bãi" và "Sửa Biểu Phí" trong màn gốc trước đây chỉ
// là `alert(...)` (chưa có form tạo/sửa thật) — giữ nguyên y hệt hành vi cũ khi tách, KHÔNG tự ý thêm
// form thật vì ngoài phạm vi yêu cầu "tách ra danh mục riêng" lần này.
export const StorageTariffMaster: React.FC = () => {
  const [storageRules, setStorageRules] = useState<StorageTariffRule[]>([]);

  useEffect(() => {
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
    loadRules().catch((error) => console.error('Không thể tải cước lưu bãi từ backend:', error));
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
    setStorageRules(updated);
    void Promise.all(updated.map((rule) => persistStorage(rule))).catch((error) => console.error('Không thể lưu điều chỉnh cước lưu bãi vào backend:', error));
    alert(`Đã cập nhật ${bulkPercent > 0 ? 'tăng' : 'giảm'} ${Math.abs(bulkPercent)}% toàn bộ biểu cước lưu bãi!`);
    setIsBulkAdjustOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl shadow-lg shrink-0">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                BIỂU CƯỚC LƯU BÃI LŨY TIẾN (STORAGE)
              </h2>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold rounded-full">
                VND / Tự Động Tính Thuế VAT 8%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Chính sách ngày miễn phí (Free Time) và biểu phí lưu bãi lũy tiến theo từng hãng tàu / loại container.
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
              const exportBlob = new Blob([JSON.stringify({ storageRules, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(exportBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `DEPOT-STORAGE-TARIFFS-${new Date().toISOString().substring(0, 10)}.json`;
              a.click();
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Xuất Biểu Cước JSON</span>
          </button>
        </div>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, hãng tàu, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={shippingLineFilter}
              onChange={(e) => setShippingLineFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tất cả hãng tàu</option>
              <option value="MSK">Maersk Line (MSK)</option>
              <option value="CMA">CMA CGM</option>
              <option value="MSC">MSC</option>
              <option value="ONE">ONE</option>
            </select>

            <button
              onClick={() => alert('Mở form tạo mới quy tắc lưu bãi hãng tàu')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Quy Tắc Lưu Bãi</span>
            </button>
          </div>
        </div>

        {/* Storage Rules Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredStorageRules.map((rule) => (
            <div key={rule.id} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-xs rounded-lg">
                      {rule.ruleCode}
                    </span>
                    <h4 className="font-bold text-white text-sm">{rule.shippingLineName}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{rule.notes}</p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl whitespace-nowrap">
                  {rule.defaultFreeDays} Ngày Free Time
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold">
                      <th className="py-2.5 px-3">Khung Thời Gian</th>
                      <th className="py-2.5 px-3 text-right">20' Dry (VND)</th>
                      <th className="py-2.5 px-3 text-right">40' Dry/HC (VND)</th>
                      <th className="py-2.5 px-3 text-right">45' HC (VND)</th>
                      <th className="py-2.5 px-3 text-right text-teal-300">20' Reefer</th>
                      <th className="py-2.5 px-3 text-right text-emerald-300">40' Reefer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {rule.tiers.map((tier, tIdx) => (
                      <tr key={tIdx} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-medium">
                          <div className="text-white font-bold">{tier.tierName}</div>
                          <div className="text-[10px] text-slate-400">
                            {tier.toDay ? `Ngày ${tier.fromDay} - ${tier.toDay}` : `Từ ngày ${tier.fromDay} trở đi`}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {tier.price20Dry === 0 ? <span className="text-emerald-400">Miễn Phí</span> : formatVND(tier.price20Dry)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {tier.price40Dry === 0 ? <span className="text-emerald-400">Miễn Phí</span> : formatVND(tier.price40Dry)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {tier.price45Dry === 0 ? <span className="text-emerald-400">Miễn Phí</span> : formatVND(tier.price45Dry)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-300">
                          {tier.price20Reefer === 0 ? <span className="text-emerald-400">Miễn Phí</span> : formatVND(tier.price20Reefer)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-300">
                          {tier.price40Reefer === 0 ? <span className="text-emerald-400">Miễn Phí</span> : formatVND(tier.price40Reefer)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 text-slate-400 border-t border-slate-800/80">
                <span>Cập nhật ngày: {rule.updatedAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Chỉnh sửa quy tắc ${rule.ruleCode}`)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold transition"
                  >
                    Sửa Biểu Phí
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

      {/* BULK ADJUST MODAL */}
      {isBulkAdjustOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <span>Điều Chỉnh Tỷ Lệ Biểu Cước Lưu Bãi</span>
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
