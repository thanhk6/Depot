import React, { useEffect, useMemo, useState } from 'react';
import { CleaningTariffMasterItem, ContainerTypeMasterItem } from '../../survey/types';
import { Droplets, Plus, Search, Edit2, Trash2, Percent, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { masterDataApi } from '../../../api';
import { useContainerTypeOptions } from '../utils/containerTypeCatalog';
import { cleaningTariffRequest, fetchCleaningTariffs } from '../utils/cleaningTariffCatalog';

// Biểu Phí Vệ Sinh Container — bảng riêng CleaningTariffs, giá theo từng loại container của DM Loại Container
// (depot-fullstack-cleaning-tariff-pricing), cùng khuôn với Cước Nâng Hạ (LoloTariffMaster):
// - cột / ô giá dựng theo các loại đang dùng của DM (loại mới tự có ô trống, trống = chưa có giá);
// - mỗi thao tác lưu đúng 1 dòng qua /MasterData/cleaning-tariffs (không ghi lại cả danh sách như persistCatalog cũ);
// - điều chỉnh % chỉ áp dịch vụ đang dùng + đang lọc, có xác nhận;
// - đã bỏ mục "đơn giá thoả thuận theo hãng tàu" (chưa từng được lưu / áp dụng).

export interface CleaningMasterProps {
  cleaningTariffs: CleaningTariffMasterItem[];
  /** Cập nhật state hiển thị ở trang cha sau khi lưu (màn này tự gọi API). */
  onUpdateCleaningTariffs: (updated: CleaningTariffMasterItem[]) => void;
  /** Giữ để tương thích trang cha; danh sách loại lấy từ DM Loại Container (đang dùng). */
  containerTypes?: ContainerTypeMasterItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL_SWEEP: 'Vệ sinh tổng quát / quét dọn',
  WATER_PRESSURE: 'Xịt rửa nước áp lực',
  HOT_WATER_WASH: 'Xịt rửa nước nóng',
  CHEMICAL_WASH: 'Tẩy rửa hoá chất',
  DEODORIZATION: 'Khử mùi',
  OIL_REMOVAL: 'Tẩy dầu',
  STICKER_REMOVAL: 'Bóc tem nhãn',
  REEFER_SANITATION: 'Khử trùng khoang lạnh',
  FLOOR_TREATMENT: 'Xử lý ván sàn',
  SPECIAL_TREATMENT: 'Xử lý đặc biệt',
  FOOD_GRADE: 'Vệ sinh chuẩn thực phẩm',
  ODOR_REMOVAL: 'Khử mùi chuyên sâu',
  FUMIGATION: 'Hun trùng kiểm dịch'
};
const PARTY_LABELS: Record<string, string> = { U: 'U - Người dùng / chủ hàng', O: 'O - Chủ vỏ / hãng tàu', T: 'T - Bên thứ ba', C: 'C - Khách hàng' };

const TYPE_GROUPS: { label: string; match: (category: string) => boolean }[] = [
  { label: 'Container khô', match: (c) => c === 'DRY' },
  { label: 'Container lạnh', match: (c) => c === 'REEFER' },
  { label: 'Mở nóc / mặt bằng / bồn / thông gió / đặc biệt', match: (c) => c !== 'DRY' && c !== 'REEFER' }
];

const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : fallback);

const emptyForm = (sortOrder: number): CleaningTariffMasterItem => ({
  id: '', cleaningCode: '', cedexCode: '', name: '', vietnameseName: '', category: 'GENERAL_SWEEP' as any, description: '',
  applicableSizes: ['20', '40', '45'], prices: {}, currency: 'VND', estimatedDurationMin: 0, waterUsageLiters: 0,
  chemicalRequired: '', equipmentUsed: '', responsiblePartyDefault: 'U', vatPercent: 8, status: 'ACTIVE', sortOrder
} as CleaningTariffMasterItem);

export const CleaningMaster: React.FC<CleaningMasterProps> = ({ cleaningTariffs, onUpdateCleaningTariffs }) => {
  const containerTypes = useContainerTypeOptions();
  const [tariffs, setTariffs] = useState<CleaningTariffMasterItem[]>(cleaningTariffs);
  // Prop tới sau khi trang cha tải xong — đồng bộ lại state (useState chỉ đọc prop 1 lần lúc khởi tạo).
  useEffect(() => { setTariffs(cleaningTariffs); }, [cleaningTariffs]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CleaningTariffMasterItem | null>(null);
  const [form, setForm] = useState<CleaningTariffMasterItem>(emptyForm(1));
  const [modalError, setModalError] = useState<string | null>(null);

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState(5);

  const reload = async () => {
    const list = await fetchCleaningTariffs(true);
    setTariffs(list);
    onUpdateCleaningTariffs(list);
  };

  const filtered = useMemo(() => tariffs.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q || t.cleaningCode.toLowerCase().includes(q) || (t.vietnameseName || '').toLowerCase().includes(q) || (t.name || '').toLowerCase().includes(q);
    return matchSearch && (categoryFilter === 'ALL' || t.category === categoryFilter) && (statusFilter === 'ALL' || t.status === statusFilter);
  }), [tariffs, searchTerm, categoryFilter, statusFilter]);

  const openModal = (item?: CleaningTariffMasterItem) => {
    setEditing(item || null);
    setForm(item ? { ...item, prices: { ...(item.prices || {}) } } : emptyForm(tariffs.reduce((m, t) => Math.max(m, t.sortOrder ?? 0), 0) + 1));
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cleaningCode.trim() || !form.vietnameseName.trim()) {
      setModalError('Vui lòng nhập Mã dịch vụ và Tên tiếng Việt.');
      return;
    }
    setBusy(true);
    setModalError(null);
    try {
      const request = cleaningTariffRequest({ ...form, cleaningCode: form.cleaningCode.trim().toUpperCase() });
      if (editing) await masterDataApi.updateCleaningTariff(editing.id, request);
      else await masterDataApi.createCleaningTariff(request);
      setIsModalOpen(false);
      await reload();
      setNotice({ type: 'success', text: editing ? `Đã cập nhật ${request.code}.` : `Đã thêm ${request.code}.` });
    } catch (error) {
      setModalError(errorMessage(error, 'Không lưu được biểu phí vệ sinh.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item: CleaningTariffMasterItem) => {
    if (!window.confirm(`Xoá biểu phí vệ sinh "${item.vietnameseName}" (${item.cleaningCode})?`)) return;
    setBusy(true);
    try {
      await masterDataApi.deleteCleaningTariff(item.id);
      await reload();
      setNotice({ type: 'success', text: `Đã xoá ${item.cleaningCode}.` });
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error, 'Không xoá được biểu phí vệ sinh.') });
    } finally {
      setBusy(false);
    }
  };

  // Điều chỉnh % chỉ áp dịch vụ ĐANG DÙNG và ĐANG HIỆN theo bộ lọc, nhân mọi giá theo loại; lưu tuần tự từng dòng.
  const bulkTargets = filtered.filter((t) => t.status === 'ACTIVE');
  const handleBulkAdjust = async () => {
    if (bulkTargets.length === 0) {
      setNotice({ type: 'error', text: 'Không có biểu phí đang dùng nào trong bộ lọc hiện tại để điều chỉnh.' });
      setIsBulkOpen(false);
      return;
    }
    if (!window.confirm(`${bulkPercent >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(bulkPercent)}% giá cho ${bulkTargets.length} biểu phí đang dùng: ${bulkTargets.map((t) => t.cleaningCode).join(', ')}?`)) return;
    const factor = 1 + bulkPercent / 100;
    setIsBulkOpen(false);
    setBusy(true);
    const failed: string[] = [];
    for (const t of bulkTargets) {
      const prices = Object.fromEntries(Object.entries(t.prices || {}).map(([code, p]) => [code, Math.round((Number(p) * factor) / 1000) * 1000]));
      try { await masterDataApi.updateCleaningTariff(t.id, cleaningTariffRequest({ ...t, prices })); }
      catch (error) { failed.push(`${t.cleaningCode}: ${errorMessage(error, 'lỗi lưu')}`); }
    }
    await reload().catch(() => {});
    setBusy(false);
    setNotice(failed.length
      ? { type: 'error', text: `Đã điều chỉnh ${bulkTargets.length - failed.length}/${bulkTargets.length} biểu phí. Lỗi: ${failed.join(' · ')}` }
      : { type: 'success', text: `Đã ${bulkPercent >= 0 ? 'tăng' : 'giảm'} ${Math.abs(bulkPercent)}% giá cho ${bulkTargets.length} biểu phí đang dùng.` });
  };

  const activeCount = tariffs.filter((t) => t.status === 'ACTIVE').length;
  const inputCls = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500';

  return (
    <div className="space-y-6">
      {notice && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs border ${notice.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {notice.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[['Tổng biểu phí', tariffs.length], ['Đang dùng', activeCount], ['Tạm ngưng', tariffs.length - activeCount]].map(([label, value]) => (
          <div key={label as string} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">{label}</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{value}</div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyan-50 border border-cyan-200 text-cyan-600 rounded-2xl"><Droplets className="w-8 h-8" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">DANH MỤC BIỂU PHÍ VỆ SINH CONTAINER (CLEANING TARIFF MASTER)</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Đơn giá theo từng loại container của DM Loại Container (VND, VAT theo từng biểu phí). Hệ thống tự tra giá theo loại của hồ sơ khi
              lập phiếu giám định, lệnh vệ sinh và phiếu dịch vụ — không sửa tay giá trên phiếu.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setIsBulkOpen(true)} disabled={busy} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Percent className="w-4 h-4 text-amber-600" /> <span>Điều Chỉnh % Đơn Giá</span>
          </button>
          <button onClick={() => openModal()} disabled={busy} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50">
            <Plus className="w-4 h-4" /> <span>+ Thêm Biểu Phí</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input type="text" placeholder="Tìm theo mã, tên dịch vụ vệ sinh..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
          <option value="ALL">Tất cả nhóm dịch vụ</option>
          {Array.from(new Set([...Object.keys(CATEGORY_LABELS), ...tariffs.map((t) => t.category)])).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
          <option value="ALL">Mọi trạng thái</option>
          <option value="ACTIVE">Đang dùng</option>
          <option value="INACTIVE">Tạm ngưng</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                <th className="py-3 px-4">Mã</th>
                <th className="py-3 px-4 min-w-[200px]">Dịch vụ vệ sinh</th>
                <th className="py-3 px-3">Nhóm</th>
                {containerTypes.map((ct) => (
                  <th key={ct.typeCode} data-testid="cleaning-price-col" className="py-3 px-3 text-right bg-cyan-50 text-cyan-700 font-mono whitespace-nowrap" title={ct.vietnameseName}>{ct.typeCode}</th>
                ))}
                <th className="py-3 px-3 text-center">VAT</th>
                <th className="py-3 px-3 text-center">Bên chịu phí</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-600 whitespace-nowrap">{item.cleaningCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.vietnameseName}</div>
                    <div className="text-[11px] text-slate-500">{item.name}{item.cedexCode ? ` · CEDEX ${item.cedexCode}` : ''}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">{CATEGORY_LABELS[item.category] || item.category}</td>
                  {containerTypes.map((ct) => {
                    const price = item.prices?.[ct.typeCode.toUpperCase()] || 0;
                    return (
                      <td key={ct.typeCode} className="py-3 px-3 text-right font-mono font-bold text-cyan-700 bg-cyan-50/60 whitespace-nowrap">
                        {price > 0 ? formatVND(price) : <span className="font-sans font-normal text-amber-700">Chưa có giá</span>}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-center font-bold">{item.vatPercent}%</td>
                  <td className="py-3 px-3 text-center font-mono">{item.responsiblePartyDefault}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      {item.status === 'ACTIVE' ? 'Đang dùng' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openModal(item)} disabled={busy} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg" title="Chỉnh sửa biểu phí"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(item)} disabled={busy} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg" title="Xóa biểu phí"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7 + containerTypes.length} className="py-8 text-center text-slate-500">Không có biểu phí vệ sinh nào khớp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl my-8">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <h3 className="font-bold text-slate-900 text-base">{editing ? 'Cập Nhật Biểu Phí Vệ Sinh' : 'Thêm Biểu Phí Vệ Sinh'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã dịch vụ *</label>
                  <input data-testid="cleaning-code" value={form.cleaningCode} disabled={!!editing} onChange={(e) => setForm({ ...form, cleaningCode: e.target.value.toUpperCase() })}
                    title={editing ? 'Không đổi mã sau khi tạo — phiếu tham chiếu theo mã' : undefined} placeholder="VD: CLN_CHEMICAL" className={`${inputCls} font-mono disabled:bg-slate-100 disabled:text-slate-500`} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhóm dịch vụ</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })} className={inputCls}>
                    {Array.from(new Set([...Object.keys(CATEGORY_LABELS), form.category])).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã CEDEX</label>
                  <input value={form.cedexCode} onChange={(e) => setForm({ ...form, cedexCode: e.target.value.toUpperCase() })} className={`${inputCls} font-mono`} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên tiếng Việt *</label>
                  <input value={form.vietnameseName} onChange={(e) => setForm({ ...form, vietnameseName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên tiếng Anh</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Đơn Giá Theo Loại Container — DM Loại Container (VNĐ)</h4>
                <p className="text-[11px] text-slate-500">Mỗi loại một giá riêng. Để trống = chưa có giá (thêm dịch vụ này cho loại đó sẽ bị chặn).</p>
                {containerTypes.length === 0 && <p className="text-[11px] text-amber-700">Chưa tải được DM Loại Container — không nhập được giá.</p>}
                {TYPE_GROUPS.map((group) => {
                  const types = containerTypes.filter((ct) => group.match(String(ct.category || '').toUpperCase()));
                  if (types.length === 0) return null;
                  return (
                    <div key={group.label} className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-600">{group.label}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {types.map((ct) => {
                          const code = ct.typeCode.toUpperCase();
                          return (
                            <div key={code}>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1 font-mono" title={ct.vietnameseName}>{ct.typeCode}</label>
                              <input type="number" min={0} data-testid={`cleaning-price-${code}`} value={form.prices?.[code] || ''} placeholder="Chưa có giá"
                                onChange={(e) => setForm({ ...form, prices: { ...(form.prices || {}), [code]: Number(e.target.value) || 0 } })}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-cyan-700 font-bold placeholder:font-sans placeholder:font-normal" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">VAT (%)</label>
                  <input type="number" value={form.vatPercent} onChange={(e) => setForm({ ...form, vatPercent: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bên chịu phí mặc định</label>
                  <select value={form.responsiblePartyDefault} onChange={(e) => setForm({ ...form, responsiblePartyDefault: e.target.value as any })} className={inputCls}>
                    {Object.entries(PARTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian (phút)</label>
                  <input type="number" min={0} value={form.estimatedDurationMin} onChange={(e) => setForm({ ...form, estimatedDurationMin: Number(e.target.value) })} className={inputCls} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nước (lít)</label>
                  <input type="number" min={0} value={form.waterUsageLiters} onChange={(e) => setForm({ ...form, waterUsageLiters: Number(e.target.value) })} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hoá chất sử dụng</label>
                  <input value={form.chemicalRequired} onChange={(e) => setForm({ ...form, chemicalRequired: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thiết bị</label>
                  <input value={form.equipmentUsed} onChange={(e) => setForm({ ...form, equipmentUsed: e.target.value })} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Mô tả</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className={inputCls}>
                    <option value="ACTIVE">Đang dùng</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                  </select>
                </div>
              </div>
              {modalError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800"><AlertTriangle className="w-4 h-4 shrink-0" /> <span>{modalError}</span></div>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">Hủy Bỏ</button>
                <button type="submit" disabled={busy} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow disabled:opacity-50">Lưu Biểu Phí</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><Percent className="w-5 h-5 text-amber-600" /> Điều Chỉnh % Đơn Giá Vệ Sinh</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tỷ lệ điều chỉnh (%)</label>
              <input type="number" value={bulkPercent} onChange={(e) => setBulkPercent(Number(e.target.value))} className={inputCls} />
              <p className="text-[11px] text-slate-500 mt-1">Số dương tăng, số âm giảm; giá làm tròn hàng nghìn, áp cho mọi loại container của biểu phí.</p>
              <p data-testid="cleaning-bulk-target-count" className="text-[11px] text-amber-700 mt-1">
                Áp dụng cho {bulkTargets.length} biểu phí đang dùng trong bộ lọc hiện tại (bỏ qua biểu phí tạm ngưng).
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button onClick={() => setIsBulkOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
              <button onClick={handleBulkAdjust} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow">Áp Dụng Cập Nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
