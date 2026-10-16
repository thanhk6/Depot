import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { RepairItem } from '../types';
import { estimateCatalogApi, readCatalogJson, containerApi } from '../../../api';
import { formatVND } from '../../../utils/format';

// Bảng hạng mục sửa chữa theo cấu trúc Work Order của Maersk AEMS (dùng chung cho form Lập báo giá và
// chế độ Sửa trực tiếp ở Chi tiết báo giá):
//   Damage code · Repair code · Description · Rep. loc · TPI · PCS · Man hrs/PC · Mat. cost/PC · Item total
// Item total = PCS × vật tư/PC; tiền công = tổng giờ công × đơn giá giờ; trước thuế = công + vật tư.
// Backend (CreateOrUpdateEstimateAsync) tính lại đúng công thức này, số ở đây chỉ để hiển thị.
// Mọi mã (Damage / Repair / Rep. loc / TPI / Cause / Mode / đơn giá giờ công) lấy từ danh mục riêng của
// Báo giá (menu BÁO GIÁ → DM …, api/estimate-catalog) — không còn danh sách gõ cứng.

export interface AemsTotals {
  totalManHours: number;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
}

const round0 = (n: number) => Math.round(n);

/** Giờ công phần đầu phiếu AEMS: giờ chuẩn bị + phân bổ giờ thường / OT1 / OT2 / OT3. */
export interface AemsHours {
  preparationHours: number;
  ordinaryHours: number;
  ot1Hours: number;
  ot2Hours: number;
  ot3Hours: number;
}

export const emptyAemsHours = (): AemsHours => ({ preparationHours: 0, ordinaryHours: 0, ot1Hours: 0, ot2Hours: 0, ot3Hours: 0 });

/** Tổng giờ công AEMS = Σ PCS × giờ công/PC + giờ chuẩn bị (Preparation Time). */
export const calcAemsTotals = (items: RepairItem[], laborRate: number, vatRate: number, preparationHours = 0): AemsTotals => {
  const totalManHours = items.reduce((s, i) => s + (i.quantity || 0) * (i.manHoursPerPiece || 0), 0) + (preparationHours || 0);
  const laborCost = round0(totalManHours * (laborRate || 0));
  const materialCost = items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const subtotal = laborCost + materialCost;
  const vatAmount = round0(subtotal * (vatRate || 0));
  return { totalManHours, laborCost, materialCost, subtotal, vatAmount, totalAmount: subtotal + vatAmount };
};

/** Chuẩn hoá 1 dòng sau khi sửa: item total, VAT dòng, mã CEDEX ghép. */
export const normalizeAemsItem = (item: RepairItem, laborRate: number, vatRate: number): RepairItem => {
  const amount = (item.quantity || 0) * (item.unitPrice || 0);
  const lineLabor = (item.quantity || 0) * (item.manHoursPerPiece || 0) * (laborRate || 0);
  const vatAmount = (amount + lineLabor) * vatRate;
  return {
    ...item,
    amount,
    vatRate,
    vatAmount,
    totalAmount: amount + lineLabor + vatAmount,
    cedexCode: [item.damageLocationCode, item.damageCode, item.repairCode].filter(Boolean).join('-')
  };
};

export const blankAemsItem = (vatRate: number): RepairItem => ({
  id: `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  damageLocationCode: '', damageLocationName: '', damageCode: '', damageName: '',
  repairCode: '', repairMethod: '', description: '',
  quantity: 1, unit: 'Cái', unitPrice: 0, amount: 0,
  vatRate, vatAmount: 0, totalAmount: 0, cedexCode: '',
  tpi: '', manHoursPerPiece: 0
});

type CatalogOption = { code: string; name: string; manHours?: number; materialCost?: number; rate?: number; currency?: string };

interface Props {
  items: RepairItem[];
  onItemsChange: (items: RepairItem[]) => void;
  laborRate: number;
  onLaborRateChange: (rate: number) => void;
  vatRate: number;
  repairMode: string;
  onRepairModeChange: (v: string) => void;
  cause: string;
  onCauseChange: (v: string) => void;
  /** Hãng tàu của container — tự lấy đơn giá giờ công theo DM Đơn giá giờ công (khi ô đang trống). */
  shippingLine?: string;
  /** Shop Code AEMS (DM Shop Code). */
  shopCode: string;
  onShopCodeChange: (v: string) => void;
  /** Giờ chuẩn bị + Ordinary / OT1 / OT2 / OT3. */
  hours: AemsHours;
  onHoursChange: (h: AemsHours) => void;
  /** Số container — có thì hiện mục "Lấy lỗi từ giám định" (chọn lỗi giám định đưa vào báo giá). */
  surveyContainerNo?: string;
}

/** Lỗi giám định (DamageItemDto) — giờ công & vật tư là TỔNG của cả lỗi (không nhân số lượng). */
type SurveyDamage = {
  id: number; component: string; locationCode: string; damageCode: string; damageNameVi: string;
  repairCode: string; repairNameVi: string; quantity: number; unit: string;
  laborHours: number; materialCost: number; notes?: string; severity?: string;
};

export const AemsLineItems: React.FC<Props> = ({
  items, onItemsChange, laborRate, onLaborRateChange, vatRate, repairMode, onRepairModeChange, cause, onCauseChange, shippingLine,
  shopCode, onShopCodeChange, hours, onHoursChange, surveyContainerNo
}) => {
  // ===== Lấy lỗi từ phiếu giám định của container =====
  const [surveyDamages, setSurveyDamages] = useState<SurveyDamage[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [pickOpen, setPickOpen] = useState(true);
  const [picked, setPicked] = useState<number[]>([]);
  useEffect(() => {
    setSurveyDamages([]); setPicked([]);
    if (!surveyContainerNo) return;
    setSurveyLoading(true);
    containerApi.getById(surveyContainerNo)
      .then((res: any) => setSurveyDamages(((res?.data ?? res)?.survey?.damages || []) as SurveyDamage[]))
      .catch(() => setSurveyDamages([]))
      .finally(() => setSurveyLoading(false));
  }, [surveyContainerNo]);
  const takenIds = new Set(items.map((i) => i.sourceDamageId).filter((x): x is number => x != null));
  const [shopCodes, setShopCodes] = useState<CatalogOption[]>([]);
  const [locations, setLocations] = useState<CatalogOption[]>([]);
  const [damages, setDamages] = useState<CatalogOption[]>([]);
  const [repairs, setRepairs] = useState<CatalogOption[]>([]);
  const [tpis, setTpis] = useState<CatalogOption[]>([]);
  const [causes, setCauses] = useState<CatalogOption[]>([]);
  const [modes, setModes] = useState<CatalogOption[]>([]);
  const [laborRates, setLaborRates] = useState<CatalogOption[]>([]);

  useEffect(() => {
    const toOpts = (list: any[]): CatalogOption[] =>
      list.map((x) => {
        const j = readCatalogJson(x.jsonData);
        return {
          code: x.code, name: x.name || x.nameVi,
          manHours: Number(j.manHoursPerPiece) || 0, materialCost: Number(j.materialCostPerPiece) || 0,
          rate: Number(j.rate) || 0, currency: j.currency || 'VND'
        };
      });
    Promise.all([
      estimateCatalogApi.list('EST_REPAIR_LOCATION'),
      estimateCatalogApi.list('EST_DAMAGE_CODE'),
      estimateCatalogApi.list('EST_REPAIR_CODE'),
      estimateCatalogApi.list('EST_TPI'),
      estimateCatalogApi.list('EST_CAUSE'),
      estimateCatalogApi.list('EST_MODE'),
      estimateCatalogApi.list('EST_LABOR_RATE'),
      estimateCatalogApi.list('EST_SHOP_CODE')
    ])
      .then(([l, d, r, t, c, m, lr, sc]) => {
        setShopCodes(toOpts(sc));
        // 1 Shop Code duy nhất (thường là chính depot) → tự chọn sẵn khi ô đang trống.
        if (!shopCode && sc.length === 1) onShopCodeChange(sc[0].code);
        setLocations(toOpts(l)); setDamages(toOpts(d)); setRepairs(toOpts(r));
        setTpis(toOpts(t)); setCauses(toOpts(c)); setModes(toOpts(m)); setLaborRates(toOpts(lr));
      })
      .catch((error) => console.error('Không tải được danh mục báo giá:', error));
  }, []);

  // Đơn giá giờ công theo hãng tàu của container (chỉ điền khi ô đang trống — không đè số người báo giá đã nhập).
  const lineRate = laborRates.find((x) => shippingLine && x.code.toUpperCase() === shippingLine.toUpperCase());
  useEffect(() => {
    if (!laborRate && lineRate?.rate) {
      onLaborRateChange(lineRate.rate);
      onItemsChange(items.map((i) => normalizeAemsItem(i, lineRate.rate!, vatRate)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineRate?.code, lineRate?.rate]);

  const update = (id: string, patch: Partial<RepairItem>) =>
    onItemsChange(items.map((i) => (i.id === id ? normalizeAemsItem({ ...i, ...patch }, laborRate, vatRate) : i)));

  // Mã sửa chữa khớp danh mục → gợi ý mô tả, giờ công/PC, vật tư/PC, đơn giá giờ (chỉ điền ô đang trống / = 0).
  const handleRepairCode = (item: RepairItem, code: string) => {
    const hit = repairs.find((r) => r.code.toUpperCase() === code.trim().toUpperCase());
    const patch: Partial<RepairItem> = { repairCode: code, repairMethod: hit?.name || item.repairMethod };
    if (hit) {
      if (!item.description?.trim()) patch.description = hit.name;
      if (!item.manHoursPerPiece && hit.manHours) patch.manHoursPerPiece = hit.manHours;
      if (!item.unitPrice && hit.materialCost) patch.unitPrice = hit.materialCost;
    }
    update(item.id, patch);
  };

  // Đưa các lỗi đã chọn thành dòng báo giá (sửa / bổ sung tiếp như dòng thường). Giờ công & vật tư giám định
  // là tổng của lỗi → chia theo số lượng để ra Man hrs/PC và Mat. cost/PC.
  const addPickedDamages = () => {
    const chosen = surveyDamages.filter((d) => picked.includes(d.id) && !takenIds.has(d.id));
    if (chosen.length === 0) return;
    const newLines = chosen.map((d) => {
      const qty = d.quantity > 0 ? d.quantity : 1;
      return normalizeAemsItem({
        ...blankAemsItem(vatRate),
        id: `ITEM-SV-${d.id}-${Date.now()}`,
        sourceDamageId: d.id,
        damageCode: d.damageCode || '',
        damageName: d.damageNameVi && d.damageNameVi !== d.damageCode ? d.damageNameVi : '',
        repairCode: d.repairCode || '',
        repairMethod: d.repairNameVi && d.repairNameVi !== d.repairCode ? d.repairNameVi : '',
        damageLocationCode: d.locationCode || '',
        damageLocationName: d.component || '',
        description: [d.component, d.notes].filter(Boolean).join(' — ') || d.repairCode || d.damageCode,
        quantity: qty,
        manHoursPerPiece: Math.round(((d.laborHours || 0) / qty) * 100) / 100,
        unitPrice: Math.round((d.materialCost || 0) / qty)
      }, laborRate, vatRate);
    });
    // Dòng trống mặc định (chưa nhập gì) thì thay luôn, không để lại dòng rỗng.
    const isBlank = (i: RepairItem) => !i.damageCode && !i.repairCode && !i.description?.trim() && !i.unitPrice && !i.manHoursPerPiece;
    onItemsChange([...items.filter((i) => !isBlank(i)), ...newLines]);
    setPicked([]);
  };

  const totals = calcAemsTotals(items, laborRate, vatRate, hours.preparationHours);
  const splitHours = hours.ordinaryHours + hours.ot1Hours + hours.ot2Hours + hours.ot3Hours;
  const setHour = (k: keyof AemsHours, v: string) => onHoursChange({ ...hours, [k]: Math.max(0, parseFloat(v) || 0) });
  const cell = 'w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-900 focus:outline-none focus:border-amber-400';
  const num = `${cell} text-right font-mono`;

  return (
    <div className="space-y-3">
      <datalist id="aems-damage-codes">{damages.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}</datalist>
      <datalist id="aems-repair-codes">{repairs.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}</datalist>
      <datalist id="aems-locations">{locations.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</datalist>
      <datalist id="aems-modes">{modes.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}</datalist>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <label className="block">
          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Shop Code:</span>
          <select value={shopCode} onChange={(e) => onShopCodeChange(e.target.value)} className={cell}>
            <option value="">— Chọn —</option>
            {shopCodes.map((x) => <option key={x.code} value={x.code}>{x.code} {x.name}</option>)}
            {shopCode && !shopCodes.some((x) => x.code === shopCode) && <option value={shopCode}>{shopCode} (đã lưu)</option>}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Cause:</span>
          <select value={cause} onChange={(e) => onCauseChange(e.target.value)} className={cell}>
            <option value="">— Chọn —</option>
            {causes.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
            {cause && !causes.some((c) => c.name === cause) && <option value={cause}>{cause} (đã lưu)</option>}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Mode:</span>
          <select value={repairMode} onChange={(e) => onRepairModeChange(e.target.value)} className={cell}>
            <option value="">— Chọn —</option>
            {modes.map((m) => <option key={m.code} value={m.code}>{m.code} {m.name}</option>)}
            {repairMode && !modes.some((m) => m.code === repairMode) && <option value={repairMode}>{repairMode} (đã lưu)</option>}
          </select>
        </label>
        <div className="flex flex-col justify-end">
          <span className="text-sm font-bold text-slate-900">VND</span>
          <span className="text-[10px] text-slate-500">Currency</span>
        </div>
      </div>

      {surveyContainerNo && (
        <div className="border border-sky-200 bg-sky-50/50 rounded-xl text-xs">
          <button type="button" onClick={() => setPickOpen((v) => !v)}
            className="w-full px-3 py-2 flex items-center justify-between font-bold text-sky-800 cursor-pointer">
            <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Lấy lỗi từ giám định ({surveyLoading ? '…' : surveyDamages.length} lỗi)</span>
            {pickOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {pickOpen && (
            <div className="px-3 pb-3 space-y-2">
              {surveyLoading ? <div className="text-slate-500">Đang tải phiếu giám định…</div>
                : surveyDamages.length === 0 ? <div className="text-slate-500 italic">Phiếu giám định của container này không ghi lỗi nào.</div>
                : (
                  <>
                    <div className="overflow-x-auto bg-white border border-sky-100 rounded-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-sky-50 text-[10px] text-slate-500 uppercase">
                          <tr>
                            <th className="py-1.5 px-2 w-8">
                              <input type="checkbox"
                                checked={surveyDamages.filter((d) => !takenIds.has(d.id)).length > 0 && surveyDamages.filter((d) => !takenIds.has(d.id)).every((d) => picked.includes(d.id))}
                                onChange={(e) => setPicked(e.target.checked ? surveyDamages.filter((d) => !takenIds.has(d.id)).map((d) => d.id) : [])} />
                            </th>
                            <th className="py-1.5 px-2">Vị trí</th><th className="py-1.5 px-2">Mã hư hỏng</th><th className="py-1.5 px-2">Mã sửa</th>
                            <th className="py-1.5 px-2 text-right">SL</th><th className="py-1.5 px-2 text-right">Giờ công</th><th className="py-1.5 px-2 text-right">Vật tư</th>
                            <th className="py-1.5 px-2">Ghi chú</th><th className="py-1.5 px-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {surveyDamages.map((d) => {
                            const taken = takenIds.has(d.id);
                            return (
                              <tr key={d.id} className={taken ? 'opacity-50' : ''}>
                                <td className="py-1.5 px-2">
                                  <input type="checkbox" disabled={taken} checked={picked.includes(d.id)}
                                    onChange={(e) => setPicked((p) => (e.target.checked ? [...p, d.id] : p.filter((x) => x !== d.id)))} />
                                </td>
                                <td className="py-1.5 px-2">{d.component || d.locationCode}</td>
                                <td className="py-1.5 px-2 font-mono">{d.damageCode}</td>
                                <td className="py-1.5 px-2 font-mono">{d.repairCode}</td>
                                <td className="py-1.5 px-2 text-right font-mono">{d.quantity}</td>
                                <td className="py-1.5 px-2 text-right font-mono">{d.laborHours}</td>
                                <td className="py-1.5 px-2 text-right font-mono">{formatVND(d.materialCost || 0)}</td>
                                <td className="py-1.5 px-2 text-slate-600 max-w-[220px] truncate" title={d.notes}>{d.notes || '—'}</td>
                                <td className="py-1.5 px-2 text-[10px] text-emerald-700 whitespace-nowrap">{taken ? 'Đã lấy' : ''}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Lỗi đã lấy sang thành dòng báo giá — sửa mã AEMS, số lượng, giờ công, vật tư ngay ở bảng bên dưới.</span>
                      <button type="button" onClick={addPickedDamages} disabled={picked.length === 0}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer disabled:opacity-40">
                        Đưa {picked.length || ''} lỗi vào báo giá
                      </button>
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-left text-xs min-w-[960px]">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
              <th className="py-2 px-2 w-6">#</th>
              <th className="py-2 px-2 w-20">Damage code</th>
              <th className="py-2 px-2 w-20">Repair code</th>
              <th className="py-2 px-2 min-w-[200px]">Description</th>
              <th className="py-2 px-2 w-20">Rep. loc</th>
              <th className="py-2 px-2 w-20">TPI</th>
              <th className="py-2 px-2 w-16 text-right">PCS</th>
              <th className="py-2 px-2 w-20 text-right">Man hrs/PC</th>
              <th className="py-2 px-2 w-28 text-right">Mat. cost/PC</th>
              <th className="py-2 px-2 w-28 text-right">Item total</th>
              <th className="py-2 px-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={item.id} className="align-top">
                <td className="py-2 px-2 pt-3 font-mono text-slate-500">{idx + 1}</td>
                <td className="py-2 px-2">
                  <input list="aems-damage-codes" value={item.damageCode} placeholder="CO, BR…"
                    onChange={(e) => {
                      const hit = damages.find((d) => d.code.toUpperCase() === e.target.value.trim().toUpperCase());
                      update(item.id, { damageCode: e.target.value.toUpperCase(), damageName: hit?.name || '' });
                    }}
                    className={`${cell} font-mono font-bold uppercase`} />
                </td>
                <td className="py-2 px-2">
                  <input list="aems-repair-codes" value={item.repairCode} placeholder="7892…"
                    onChange={(e) => handleRepairCode(item, e.target.value)}
                    className={`${cell} font-mono font-bold`} />
                </td>
                <td className="py-2 px-2">
                  <input value={item.description} placeholder="vd Any Panel - Straighten, Re-weld & Paint"
                    onChange={(e) => update(item.id, { description: e.target.value })} className={cell} />
                </td>
                <td className="py-2 px-2">
                  <input list="aems-locations" value={item.damageLocationCode} placeholder="TX2N…"
                    onChange={(e) => {
                      const hit = locations.find((l) => l.code.toUpperCase() === e.target.value.trim().toUpperCase());
                      update(item.id, { damageLocationCode: e.target.value.toUpperCase(), damageLocationName: hit?.name || '' });
                    }}
                    className={`${cell} font-mono uppercase`} />
                </td>
                <td className="py-2 px-2">
                  <select value={item.tpi || ''} onChange={(e) => update(item.id, { tpi: e.target.value })} className={cell}>
                    <option value="">—</option>
                    {tpis.map((t) => <option key={t.code} value={t.code}>{t.code} · {t.name}</option>)}
                    {item.tpi && !tpis.some((t) => t.code === item.tpi) && <option value={item.tpi}>{item.tpi}</option>}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input type="number" min="1" step="any" value={item.quantity}
                    onChange={(e) => update(item.id, { quantity: parseFloat(e.target.value) || 0 })} className={num} />
                </td>
                <td className="py-2 px-2">
                  <input type="number" min="0" step="any" value={item.manHoursPerPiece ?? 0}
                    onChange={(e) => update(item.id, { manHoursPerPiece: parseFloat(e.target.value) || 0 })} className={num} />
                </td>
                <td className="py-2 px-2">
                  <input type="number" min="0" step="any" value={item.unitPrice}
                    onChange={(e) => update(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className={num} />
                </td>
                <td className="py-2 px-2 pt-3 text-right font-mono font-bold text-emerald-700">
                  {formatVND((item.quantity || 0) * (item.unitPrice || 0))}
                </td>
                <td className="py-2 px-2 pt-2.5">
                  <button type="button" title="Xoá dòng" disabled={items.length <= 1}
                    onClick={() => onItemsChange(items.filter((i) => i.id !== item.id))}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded disabled:opacity-30 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" onClick={() => onItemsChange([...items, blankAemsItem(vatRate)])}
        className="px-3.5 py-2 bg-white border border-slate-900 text-slate-900 hover:bg-slate-50 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
        <Plus className="w-3.5 h-3.5" /> Add repair item
      </button>

      {/* Giờ công theo AEMS: Ordinary / OT1 / OT2 / OT3 + Preparation time */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([['ordinaryHours', 'Ordinary Hours'], ['ot1Hours', 'OT1'], ['ot2Hours', 'OT2'], ['ot3Hours', 'OT3']] as [keyof AemsHours, string][]).map(([k, label]) => (
            <label key={k} className="block">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</span>
              <input type="number" min="0" step="any" value={hours[k]} onChange={(e) => setHour(k, e.target.value)} className={num} />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <label className="block">
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">Preparation Time (giờ):</span>
            <input type="number" min="0" step="any" value={hours.preparationHours} onChange={(e) => setHour('preparationHours', e.target.value)} className={num} />
          </label>
          <label className="block">
            <span className="block text-[11px] font-semibold text-slate-600 mb-1">
              Đơn giá giờ công (VND/giờ):*
              {lineRate?.rate ? <span className="font-normal text-slate-400"> · DM {lineRate.code}: {formatVND(lineRate.rate)}</span> : null}
            </span>
            <input type="number" min="0" step="any" value={laborRate || ''} placeholder="vd 28000"
              onChange={(e) => {
                const rate = parseFloat(e.target.value) || 0;
                onLaborRateChange(rate);
                onItemsChange(items.map((i) => normalizeAemsItem(i, rate, vatRate)));
              }}
              className={num} />
          </label>
          <div className="font-bold text-slate-900">Preparation Time: {hours.preparationHours}</div>
          <div className="font-bold text-slate-900">Total Man Hours: {Math.round(totals.totalManHours * 100) / 100}</div>
        </div>
        {splitHours > 0 && Math.abs(splitHours - totals.totalManHours) > 0.001 && (
          <div className="text-[11px] text-amber-700">
            Ordinary + OT = {Math.round(splitHours * 100) / 100} giờ, khác Total Man Hours ({Math.round(totals.totalManHours * 100) / 100} giờ).
          </div>
        )}
      </div>

      <AemsCostSummary totals={totals} laborRate={laborRate} vatRate={vatRate} />
    </div>
  );
};

/** Bảng Cost Summary theo mẫu AEMS (dùng cả ở chế độ xem). */
export const AemsCostSummary: React.FC<{ totals: AemsTotals; laborRate: number; vatRate: number }> = ({ totals, laborRate, vatRate }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs">
    <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
      <span className="font-bold text-slate-700 uppercase text-[11px]">Cost summary</span>
      <span className="text-slate-600">Total man hours: <strong className="font-mono text-slate-900">{Math.round(totals.totalManHours * 100) / 100}</strong></span>
    </div>
    <table className="w-full">
      <tbody className="divide-y divide-slate-100 font-mono">
        <tr><td className="px-3 py-1.5 font-sans text-slate-600">Total Labor Cost <span className="text-slate-400">({Math.round(totals.totalManHours * 100) / 100} giờ × {formatVND(laborRate || 0)})</span></td><td className="px-3 py-1.5 text-right">{formatVND(totals.laborCost)}</td></tr>
        <tr><td className="px-3 py-1.5 font-sans text-slate-600">Total Material Cost</td><td className="px-3 py-1.5 text-right">{formatVND(totals.materialCost)}</td></tr>
        <tr><td className="px-3 py-1.5 font-sans text-slate-600">Total Cost excl. Tax/VAT</td><td className="px-3 py-1.5 text-right">{formatVND(totals.subtotal)}</td></tr>
        <tr><td className="px-3 py-1.5 font-sans text-slate-600">VAT ({Math.round(vatRate * 1000) / 10}%)</td><td className="px-3 py-1.5 text-right text-amber-700">+{formatVND(totals.vatAmount)}</td></tr>
        <tr className="bg-emerald-50/50"><td className="px-3 py-2 font-sans font-bold text-slate-900">Total Cost incl. Tax/VAT</td><td className="px-3 py-2 text-right font-bold text-emerald-700 text-sm">{formatVND(totals.totalAmount)}</td></tr>
      </tbody>
    </table>
  </div>
);
