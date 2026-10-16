import React, { useMemo, useRef, useState } from 'react';
import { X, Layers, Save, CheckCircle2, XCircle, Loader2, Plus, Trash2, Paperclip } from 'lucide-react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { Estimate, RepairItem } from '../types';
import { estimateApi, depotFileApi } from '../../../api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { AemsLineItems, AemsHours, blankAemsItem, calcAemsTotals, emptyAemsHours, normalizeAemsItem } from './AemsLineItems';
import { buildEstimatePayload, newEstimateNo } from '../utils/estimatePayload';

// Lập báo giá cho NHIỀU container — theo màn "Work Orders / Create / Multiple Equipments" của Maersk AEMS:
//   Shop Code · Cause · Mode · Currency
//   Danh sách Equipment Number · Vendor Ref No. (tuỳ chọn) · Image(s) · Action
//   Repair items chung (Damage / Repair / Repair Loc code / TPI / Pcs / Man Hrs/pc / Material cost/pc / Item Total)
//   Ordinary Hours · OT1 · OT2 · OT3 · Preparation Time · Total Man Hours
//   Remarks (255 ký tự)
// Mỗi container được tạo 1 báo giá riêng với cùng phần chung, Vendor Ref + ảnh riêng từng container.

interface Props {
  /** Container đã thu tiền, đang chờ lập báo giá (chưa có báo giá). */
  containers: ContainerRecord[];
  onClose: () => void;
  onDone: (summary: string, hasError: boolean) => void;
}

type EquipmentRow = { key: string; containerNo: string; vendorRefNo: string; photos: string[]; uploading: boolean; uploadError?: string };
type RowResult = { containerNo: string; ok: boolean; message: string };

const VAT_OPTIONS = [0, 0.05, 0.08, 0.1];
const REMARKS_PLACEHOLDER = 'Please indicate general condition of box, main damage consists, wear and tear share of repair, repair in other mode required.';
const newRow = (): EquipmentRow => ({ key: `EQ-${Date.now()}-${Math.random()}`, containerNo: '', vendorRefNo: '', photos: [], uploading: false });

export const BulkEstimateModal: React.FC<Props> = ({ containers, onClose, onDone }) => {
  const byNo = useMemo(() => new Map(containers.map((c) => [c.containerNo.toUpperCase(), c])), [containers]);
  const [rows, setRows] = useState<EquipmentRow[]>([newRow()]);
  const [shopCode, setShopCode] = useState('');
  const [cause, setCause] = useState('');
  const [repairMode, setRepairMode] = useState('');
  const [vatRate, setVatRate] = useState<number>(0.08);
  const [laborRate, setLaborRate] = useState<number>(0);
  const [hours, setHours] = useState<AemsHours>(emptyAemsHours());
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<RepairItem[]>([blankAemsItem(0.08)]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [error, setError] = useState('');
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const resolved = rows.map((r) => ({ row: r, container: byNo.get(r.containerNo.trim().toUpperCase()) }));
  const shippingLine = resolved.find((x) => x.container)?.container?.shippingLine || '';
  const totals = calcAemsTotals(items, laborRate, vatRate, hours.preparationHours);
  const patchRow = (key: string, patch: Partial<EquipmentRow>) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const rowError = (r: EquipmentRow, c?: ContainerRecord): string => {
    const no = r.containerNo.trim().toUpperCase();
    if (!no) return '';
    if (!c) return 'Không có trong danh sách đã thu tiền chờ báo giá';
    if (rows.filter((x) => x.containerNo.trim().toUpperCase() === no).length > 1) return 'Trùng số container';
    if (shippingLine && c.shippingLine !== shippingLine) return `Khác hãng tàu (${c.shippingLine} ≠ ${shippingLine})`;
    return '';
  };

  const uploadImages = async (r: EquipmentRow, files: FileList | null) => {
    const c = byNo.get(r.containerNo.trim().toUpperCase());
    if (!files || files.length === 0) return;
    if (!c) { patchRow(r.key, { uploadError: 'Nhập Equipment Number hợp lệ trước khi đính ảnh.' }); return; }
    patchRow(r.key, { uploading: true, uploadError: undefined });
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const res: any = await depotFileApi.upload(file, Number(c.id), 'DepotJob', 1);
        if (res?.data?.url) urls.push(res.data.url);
      }
      setRows((prev) => prev.map((x) => (x.key === r.key ? { ...x, photos: [...x.photos, ...urls], uploading: false } : x)));
    } catch (e) {
      patchRow(r.key, { uploading: false, uploadError: getApiErrorMessage(e, 'Không tải được ảnh lên.') });
    }
  };

  const run = async (confirmAfter: boolean) => {
    const filled = resolved.filter((x) => x.row.containerNo.trim());
    if (filled.length === 0) return setError('Nhập ít nhất 01 Equipment Number.');
    const bad = filled.find((x) => rowError(x.row, x.container));
    if (bad) return setError(`${bad.row.containerNo.trim().toUpperCase()}: ${rowError(bad.row, bad.container)}.`);
    if (rows.some((r) => r.uploading)) return setError('Đang tải ảnh lên, đợi xong rồi lưu.');
    const badLine = items.findIndex((i) => !(i.quantity > 0) || i.unitPrice < 0 || (i.manHoursPerPiece ?? 0) < 0 || !(i.description?.trim() || i.repairCode));
    if (badLine >= 0) return setError(`Repair item ${badLine + 1}: cần Repair code (hoặc mô tả), Pcs > 0, giờ công và vật tư không âm.`);
    if (totals.totalManHours > 0 && !(laborRate > 0)) return setError('Có giờ công nhưng chưa nhập đơn giá giờ công.');
    setError('');
    setRunning(true);
    const finalItems = items.map((i) => normalizeAemsItem(i, laborRate, vatRate));
    const out: RowResult[] = [];
    for (const { row, container: c } of filled) {
      if (!c) continue;
      const est: Estimate = {
        id: '', estimateNo: newEstimateNo(), containerId: c.id, containerNo: c.containerNo,
        isoCode: c.isoCode || '', size: c.size, type: c.type || '', shippingLine: c.shippingLine,
        condition: c.condition === 'CL' ? 'CL' : 'DM', createdBy: '', createdById: '', createdAt: '', updatedAt: '',
        repairSummary: finalItems.map((i) => i.description || i.repairMethod).filter(Boolean).join(', '),
        items: finalItems.map((i) => ({ ...i })), laborRate, repairMode, cause, shopCode,
        vendorRefNo: row.vendorRefNo.trim(), ...hours,
        totalManHours: totals.totalManHours, laborCost: totals.laborCost, materialCost: totals.materialCost,
        subtotal: totals.subtotal, vatRate, vatAmount: totals.vatAmount, totalAmount: totals.totalAmount,
        currency: 'VND', status: 'READY', notes, inspectionPhotos: row.photos, apiTransactionHistory: []
      };
      try {
        const res: any = await estimateApi.createEstimate(c.id, buildEstimatePayload(est));
        if (res?.statusCode !== 200) throw new Error(res?.message || 'Không lưu được báo giá.');
        if (confirmAfter) await estimateApi.confirmEstimate(c.id);
        out.push({ containerNo: c.containerNo, ok: true, message: `${est.estimateNo}${confirmAfter ? ' · đã xác nhận' : ''}` });
      } catch (e) {
        out.push({ containerNo: c.containerNo, ok: false, message: getApiErrorMessage(e, e instanceof Error ? e.message : 'Lỗi máy chủ.') });
      }
      setResults([...out]);
    }
    setRunning(false);
    const okCount = out.filter((r) => r.ok).length;
    onDone(`Đã lập ${okCount}/${out.length} báo giá${confirmAfter ? ' và xác nhận' : ''}${shippingLine ? ` (hãng ${shippingLine})` : ''}.`, okCount < out.length);
  };

  const input = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl"><Layers className="w-6 h-6" /></div>
            <div>
              <div className="text-[11px] text-slate-500">Work Orders / Create / <strong className="text-slate-700">Multiple Equipments</strong></div>
              <h3 className="text-lg font-bold text-slate-900">Lập Báo Giá Cho Nhiều Container</h3>
              <p className="text-xs text-slate-500">Nhập 1 lần phần chung — mỗi container được tạo 1 báo giá riêng.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={running} className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <datalist id="bulk-equipment-numbers">
            {containers.map((c) => <option key={c.id} value={c.containerNo}>{c.shippingLine} · {c.size}</option>)}
          </datalist>

          {/* Equipment list */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
            <div className="grid grid-cols-[1fr_1fr_1.2fr_60px] gap-3 text-xs font-semibold text-slate-700">
              <span>Equipment Number</span><span>Vendor Ref No. (Optional)</span><span>Image(s)</span><span>Action</span>
            </div>
            {resolved.map(({ row, container }) => {
              const err = rowError(row, container);
              const r = results?.find((x) => x.containerNo === container?.containerNo);
              return (
                <div key={row.key} className="grid grid-cols-[1fr_1fr_1.2fr_60px] gap-3 items-start">
                  <div>
                    <input list="bulk-equipment-numbers" value={row.containerNo} disabled={running || !!results}
                      onChange={(e) => patchRow(row.key, { containerNo: e.target.value.toUpperCase(), photos: [] })}
                      placeholder="vd XINU1579876" className={`${input} font-mono font-bold uppercase ${err ? 'border-rose-300' : ''}`} />
                    {err ? <div className="text-[10px] text-rose-600 mt-0.5">{err}</div>
                      : container ? <div className="text-[10px] text-slate-500 mt-0.5">{container.shippingLine} · {container.size}{container.condition ? ` · ${container.condition}` : ''}</div> : null}
                    {r && (
                      <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${r.ok ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {r.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}<span>{r.message}</span>
                      </div>
                    )}
                  </div>
                  <input value={row.vendorRefNo} disabled={running || !!results} onChange={(e) => patchRow(row.key, { vendorRefNo: e.target.value })} className={input} />
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="file" accept="image/*" multiple className="hidden" ref={(el) => { fileInputs.current[row.key] = el; }}
                      onChange={(e) => { void uploadImages(row, e.target.files); e.target.value = ''; }} />
                    <button type="button" title="Đính ảnh" disabled={running || !!results || row.uploading}
                      onClick={() => fileInputs.current[row.key]?.click()}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50">
                      {row.uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                    </button>
                    {row.photos.map((u, i) => (
                      <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-700 underline">Ảnh {i + 1}</a>
                    ))}
                    {row.uploadError && <span className="text-[10px] text-rose-600">{row.uploadError}</span>}
                  </div>
                  <button type="button" title="Xoá dòng" disabled={running || !!results || rows.length <= 1}
                    onClick={() => setRows((prev) => prev.filter((x) => x.key !== row.key))}
                    className="p-2 w-9 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-1">
              <button type="button" disabled={running || !!results} onClick={() => setRows((prev) => [...prev, newRow()])}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer disabled:opacity-50">
                <Plus className="w-3.5 h-3.5" /> Thêm container
              </button>
              <span className="text-[11px] text-slate-500">{containers.length} container đã thu tiền đang chờ báo giá (gợi ý khi gõ số)</span>
            </div>
          </div>

          {/* Header + repair items + hours (AEMS) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-end">
              <label className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-semibold">Thuế VAT:</span>
                <select value={vatRate} onChange={(e) => { const v = parseFloat(e.target.value); setVatRate(v); setItems((p) => p.map((i) => normalizeAemsItem(i, laborRate, v))); }}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-700">
                  {VAT_OPTIONS.map((v) => <option key={v} value={v}>{Math.round(v * 1000) / 10}%</option>)}
                </select>
              </label>
            </div>
            <AemsLineItems
              items={items} onItemsChange={setItems}
              laborRate={laborRate} onLaborRateChange={setLaborRate}
              vatRate={vatRate}
              repairMode={repairMode} onRepairModeChange={setRepairMode}
              cause={cause} onCauseChange={setCause}
              shippingLine={shippingLine}
              shopCode={shopCode} onShopCodeChange={setShopCode}
              hours={hours} onHoursChange={setHours}
            />
            <p className="text-[11px] text-slate-500">Tổng ở trên là cho <strong>mỗi</strong> container. Sau khi tạo vẫn sửa riêng từng báo giá được ở Chi tiết báo giá.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
            <textarea value={notes} maxLength={255} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={REMARKS_PLACEHOLDER}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-400" />
            <div className="text-right text-[11px] text-slate-500">{notes.length} / 255</div>
          </div>

          {error && <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-slate-600">
            {results ? `Kết quả: ${results.filter((r) => r.ok).length} thành công, ${results.filter((r) => !r.ok).length} lỗi`
              : `Sẽ tạo ${resolved.filter((x) => x.container && !rowError(x.row, x.container)).length} báo giá`}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={running}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50">
              {results ? 'Đóng' : 'Huỷ'}
            </button>
            <button type="button" onClick={() => run(false)} disabled={running || !!results}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Lưu báo giá
            </button>
            <button type="button" onClick={() => run(true)} disabled={running || !!results}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Submit (Lưu &amp; Xác nhận)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
