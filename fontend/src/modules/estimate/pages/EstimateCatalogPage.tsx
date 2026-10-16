import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Power, Search, X, Save, BookOpen } from 'lucide-react';
import { estimateCatalogApi, readCatalogJson } from '../../../api';
import type { EstimateCatalogItem, EstimateCatalogType } from '../../../api';
import { useDepot } from '../../../context/DepotContext';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatVND } from '../../../utils/format';
import { useShippingLineOptions } from '../../../hooks/useShippingLineOptions';

// Danh mục riêng của phân hệ Báo giá (cấu trúc Work Order Maersk AEMS). Mỗi mục menu nhóm "BÁO GIÁ" mở
// màn này với 1 cấu hình; dữ liệu lưu ở MasterCatalogItems qua api/estimate-catalog/{type}.

type ExtraField = { key: string; label: string; kind: 'number' | 'text' | 'currency'; placeholder?: string };
type TypeConfig = {
  type: EstimateCatalogType;
  tabLabel: string;
  codeLabel: string;
  codePlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  /** Mã lấy từ danh mục Hãng tàu (đơn giá giờ công theo hãng). */
  codeFromShippingLine?: boolean;
  extra: ExtraField[];
  hint: string;
};

export const ESTIMATE_CATALOG_MENUS: Record<string, { title: string; subtitle: string; types: TypeConfig[] }> = {
  est_damage_codes: {
    title: 'Mã Hư Hỏng (Damage Code)',
    subtitle: 'Mã hư hỏng theo AEMS dùng ở cột "Damage code" của báo giá (vd CO, BR, BT, HO, LO).',
    types: [{
      type: 'EST_DAMAGE_CODE', tabLabel: 'Damage code', codeLabel: 'Damage code', codePlaceholder: 'CO',
      nameLabel: 'Mô tả', namePlaceholder: 'Corroded', extra: [],
      hint: 'Gõ mã ở báo giá sẽ gợi ý theo danh mục này.'
    }]
  },
  est_repair_codes: {
    title: 'Mã Sửa Chữa (Repair Code)',
    subtitle: 'Mã sửa chữa AEMS kèm mô tả, giờ công/PC và vật tư/PC mặc định — chọn mã ở báo giá sẽ tự điền.',
    types: [{
      type: 'EST_REPAIR_CODE', tabLabel: 'Repair code', codeLabel: 'Repair code', codePlaceholder: '7892',
      nameLabel: 'Description', namePlaceholder: 'Any Panel - Straighten, Re-weld & Paint',
      extra: [
        { key: 'manHoursPerPiece', label: 'Man hrs/PC', kind: 'number', placeholder: '0.3' },
        { key: 'materialCostPerPiece', label: 'Mat. cost/PC (VND)', kind: 'number', placeholder: '283123' },
        { key: 'pieceNote', label: 'Quy ước 1 PC', kind: 'text', placeholder: '1 pc = 5 screws' }
      ],
      hint: 'Giờ công / vật tư ở đây là giá trị mặc định, người báo giá vẫn sửa được trên từng báo giá.'
    }]
  },
  est_repair_locations: {
    title: 'Vị Trí Sửa Chữa (Rep. Loc)',
    subtitle: 'Mã vị trí CEDEX 4 ký tự dùng ở cột "Rep. loc" (vd TX2N, BX5N, FG23, DG23).',
    types: [{
      type: 'EST_REPAIR_LOCATION', tabLabel: 'Rep. loc', codeLabel: 'Mã vị trí', codePlaceholder: 'TX2N',
      nameLabel: 'Tên vị trí', namePlaceholder: 'Top side rail', extra: [],
      hint: 'Gõ mã ở báo giá sẽ gợi ý theo danh mục này.'
    }]
  },
  est_labor_rates: {
    title: 'Đơn Giá Giờ Công Theo Hãng Tàu',
    subtitle: 'Mỗi hãng tàu một đơn giá giờ công — lập báo giá tự lấy theo hãng tàu của container.',
    types: [{
      type: 'EST_LABOR_RATE', tabLabel: 'Đơn giá giờ công', codeLabel: 'Hãng tàu', codePlaceholder: '',
      nameLabel: 'Ghi chú', namePlaceholder: 'Theo hợp đồng 2026', codeFromShippingLine: true,
      extra: [
        { key: 'rate', label: 'Đơn giá / giờ', kind: 'number', placeholder: '28000' },
        { key: 'currency', label: 'Tiền tệ', kind: 'currency' }
      ],
      hint: 'Tiền công = Tổng giờ công × đơn giá giờ của hãng tàu.'
    }]
  },
  est_misc_codes: {
    title: 'TPI · Cause · Mode · Shop Code',
    subtitle: 'Các bảng mã chọn nhanh trên báo giá: TPI (bên chịu chi phí), Cause (nguyên nhân), Mode sửa chữa, Shop Code của depot.',
    types: [
      { type: 'EST_TPI', tabLabel: 'TPI', codeLabel: 'Mã TPI', codePlaceholder: 'T', nameLabel: 'Ý nghĩa', namePlaceholder: 'Third Party', extra: [], hint: 'Cột TPI của từng dòng báo giá.' },
      { type: 'EST_CAUSE', tabLabel: 'Cause', codeLabel: 'Mã', codePlaceholder: 'WEAR_TEAR', nameLabel: 'Cause', namePlaceholder: 'Wear and Tear', extra: [], hint: 'Ô Cause ở đầu báo giá.' },
      { type: 'EST_MODE', tabLabel: 'Mode', codeLabel: 'Mode', codePlaceholder: '01', nameLabel: 'Ý nghĩa', namePlaceholder: 'BOX REPAIR, ALUMINIUM DRY', extra: [], hint: 'Ô Mode ở đầu báo giá.' },
      { type: 'EST_SHOP_CODE', tabLabel: 'Shop Code', codeLabel: 'Shop Code', codePlaceholder: '3HY', nameLabel: 'Tên xưởng / depot', namePlaceholder: 'MATRAN', extra: [], hint: 'Ô Shop Code ở đầu báo giá (mã xưởng do hãng tàu cấp).' }
    ]
  }
};

type FormState = { id?: number; code: string; name: string; nameVi: string; isActive: boolean; sortOrder: number; extra: Record<string, string> };

const emptyForm = (cfg: TypeConfig): FormState => ({
  code: '', name: '', nameVi: '', isActive: true, sortOrder: 0,
  extra: Object.fromEntries(cfg.extra.map((f) => [f.key, f.kind === 'currency' ? 'VND' : '']))
});

export const EstimateCatalogPage: React.FC<{ menuId: string }> = ({ menuId }) => {
  const menu = ESTIMATE_CATALOG_MENUS[menuId];
  const { showToast } = useDepot();
  // showToast của context đổi tham chiếu mỗi lần render — giữ qua ref để không làm vòng tải danh mục chạy lặp.
  const toastRef = useRef(showToast);
  toastRef.current = showToast;
  const shippingLines = useShippingLineOptions();
  const [tabIdx, setTabIdx] = useState(0);
  const cfg = menu.types[Math.min(tabIdx, menu.types.length - 1)];
  const [items, setItems] = useState<EstimateCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTabIdx(0); setForm(null); setSearch(''); }, [menuId]);

  const load = useCallback(() => {
    setLoading(true);
    estimateCatalogApi.list(cfg.type, true)
      .then(setItems)
      .catch((e) => toastRef.current(getApiErrorMessage(e, 'Không tải được danh mục.'), 'error'))
      .finally(() => setLoading(false));
  }, [cfg.type]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => `${i.code} ${i.name} ${i.nameVi || ''}`.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const openEdit = (item: EstimateCatalogItem) => {
    const j = readCatalogJson(item.jsonData);
    setForm({
      id: item.id, code: item.code, name: item.name, nameVi: item.nameVi || '', isActive: item.isActive, sortOrder: item.sortOrder,
      extra: Object.fromEntries(cfg.extra.map((f) => [f.key, j[f.key] != null ? String(j[f.key]) : (f.kind === 'currency' ? 'VND' : '')]))
    });
  };

  const buildJson = (f: FormState) => JSON.stringify(Object.fromEntries(cfg.extra
    .filter((x) => f.extra[x.key] !== '' && f.extra[x.key] != null)
    .map((x) => [x.key, x.kind === 'number' ? Number(f.extra[x.key]) : f.extra[x.key]])));

  const handleSave = async () => {
    if (!form) return;
    const code = form.code.trim();
    const name = form.name.trim() || (cfg.codeFromShippingLine ? shippingLines.find((s) => s.code === code)?.name || code : '');
    if (!code || !name) return showToast(`Cần nhập ${cfg.codeLabel} và ${cfg.nameLabel}.`, 'error');
    const bad = cfg.extra.find((x) => x.kind === 'number' && form.extra[x.key] !== '' && (Number.isNaN(Number(form.extra[x.key])) || Number(form.extra[x.key]) < 0));
    if (bad) return showToast(`${bad.label} phải là số không âm.`, 'error');
    if (cfg.type === 'EST_LABOR_RATE' && !(Number(form.extra.rate) > 0)) return showToast('Nhập đơn giá giờ công lớn hơn 0.', 'error');
    const request = { code, name, nameVi: form.nameVi.trim() || null, description: null, jsonData: buildJson(form), isActive: form.isActive, sortOrder: Number(form.sortOrder) || 0 };
    setSaving(true);
    try {
      if (form.id) await estimateCatalogApi.update(cfg.type, form.id, request);
      else await estimateCatalogApi.create(cfg.type, request);
      showToast(form.id ? `Đã cập nhật ${code}.` : `Đã thêm ${code}.`);
      setForm(null);
      load();
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Không lưu được danh mục.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: EstimateCatalogItem) => {
    try {
      await estimateCatalogApi.update(cfg.type, item.id, {
        code: item.code, name: item.name, nameVi: item.nameVi, description: item.description,
        jsonData: item.jsonData || '{}', isActive: !item.isActive, sortOrder: item.sortOrder
      });
      load();
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Không đổi được trạng thái.'), 'error');
    }
  };

  const handleDelete = async (item: EstimateCatalogItem) => {
    if (!window.confirm(`Xoá ${item.code} — ${item.name} khỏi danh mục?`)) return;
    try {
      await estimateCatalogApi.remove(cfg.type, item.id);
      showToast(`Đã xoá ${item.code}.`);
      load();
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Không xoá được.'), 'error');
    }
  };

  const renderExtra = (item: EstimateCatalogItem, f: ExtraField) => {
    const v = readCatalogJson(item.jsonData)[f.key];
    if (v == null || v === '') return <span className="text-slate-400">—</span>;
    if (f.key === 'rate') return <span className="font-mono">{readCatalogJson(item.jsonData).currency === 'USD' ? `${v} USD` : formatVND(Number(v))}</span>;
    if (f.key === 'materialCostPerPiece') return <span className="font-mono">{formatVND(Number(v))}</span>;
    return <span className="font-mono">{String(v)}</span>;
  };

  const input = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400';

  return (
    <div className="space-y-5">
      <div className="p-5 bg-white border border-slate-200 rounded-3xl flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase">Danh mục báo giá · AEMS</div>
            <h2 className="text-lg font-bold text-slate-900">{menu.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{menu.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={() => setForm(emptyForm(cfg))}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-4 h-4" /> Thêm {cfg.tabLabel}
        </button>
      </div>

      {menu.types.length > 1 && (
        <div className="flex gap-2">
          {menu.types.map((t, i) => (
            <button key={t.type} type="button" onClick={() => { setTabIdx(i); setForm(null); setSearch(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border ${i === tabIdx ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {t.tabLabel}
            </button>
          ))}
        </div>
      )}

      {form && (
        <div className="p-4 bg-amber-50/50 border-2 border-amber-300 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-800 uppercase">{form.id ? `Sửa ${form.code}` : `Thêm ${cfg.tabLabel}`}</h4>
            <button type="button" onClick={() => setForm(null)} className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <label className="block">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">{cfg.codeLabel}:*</span>
              {cfg.codeFromShippingLine ? (
                <select value={form.code} disabled={!!form.id} onChange={(e) => setForm({ ...form, code: e.target.value })} className={input}>
                  <option value="">— Chọn hãng tàu —</option>
                  {shippingLines.map((s) => <option key={s.code} value={s.code}>{s.code} · {s.name}</option>)}
                </select>
              ) : (
                <input value={form.code} disabled={!!form.id} placeholder={cfg.codePlaceholder}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={`${input} font-mono font-bold uppercase`} />
              )}
            </label>
            <label className="block md:col-span-2">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">{cfg.nameLabel}:{cfg.codeFromShippingLine ? '' : '*'}</span>
              <input value={form.name} placeholder={cfg.namePlaceholder} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            </label>
            <label className="block">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">Tên tiếng Việt:</span>
              <input value={form.nameVi} onChange={(e) => setForm({ ...form, nameVi: e.target.value })} className={input} />
            </label>
            {cfg.extra.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-[11px] font-semibold text-slate-600 mb-1">{f.label}:</span>
                {f.kind === 'currency' ? (
                  <select value={form.extra[f.key]} onChange={(e) => setForm({ ...form, extra: { ...form.extra, [f.key]: e.target.value } })} className={input}>
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                ) : (
                  <input type={f.kind === 'number' ? 'number' : 'text'} step="any" min={f.kind === 'number' ? 0 : undefined}
                    value={form.extra[f.key]} placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, extra: { ...form.extra, [f.key]: e.target.value } })}
                    className={`${input} ${f.kind === 'number' ? 'text-right font-mono' : ''}`} />
                )}
              </label>
            ))}
            <label className="block">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">Thứ tự:</span>
              <input type="number" step="1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })} className={`${input} text-right font-mono`} />
            </label>
            <label className="flex items-center gap-2 mt-5">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span className="text-[11px] font-semibold text-slate-700">Đang áp dụng</span>
            </label>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">{cfg.hint}</span>
            <button type="button" onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Tìm ${cfg.codeLabel.toLowerCase()}, mô tả...`}
              className="pl-9 pr-3 py-2 w-72 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-400" />
          </div>
          <span className="text-xs text-slate-500">{loading ? 'Đang tải...' : `${filtered.length} / ${items.length} mục`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50">
              <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                <th className="py-2.5 px-4">{cfg.codeLabel}</th>
                <th className="py-2.5 px-4">{cfg.nameLabel}</th>
                <th className="py-2.5 px-4">Tên tiếng Việt</th>
                {cfg.extra.filter((f) => f.kind !== 'currency').map((f) => <th key={f.key} className="py-2.5 px-4 text-right">{f.label}</th>)}
                <th className="py-2.5 px-4">Trạng thái</th>
                <th className="py-2.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6 + cfg.extra.length} className="p-10 text-center text-slate-500">
                    {loading ? 'Đang tải...' : `Chưa có mục nào. Bấm "Thêm ${cfg.tabLabel}" để tạo.`}
                  </td>
                </tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 ${item.isActive ? '' : 'opacity-60'}`}>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{item.code}</td>
                  <td className="py-2.5 px-4 text-slate-700">{item.name}</td>
                  <td className="py-2.5 px-4 text-slate-600">{item.nameVi || '—'}</td>
                  {cfg.extra.filter((f) => f.kind !== 'currency').map((f) => <td key={f.key} className="py-2.5 px-4 text-right">{renderExtra(item, f)}</td>)}
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${item.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {item.isActive ? 'Đang áp dụng' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex justify-end gap-1">
                      <button type="button" title="Sửa" onClick={() => openEdit(item)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                      <button type="button" title={item.isActive ? 'Tạm ngưng' : 'Áp dụng lại'} onClick={() => toggleActive(item)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"><Power className="w-3.5 h-3.5" /></button>
                      <button type="button" title="Xoá" onClick={() => handleDelete(item)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
