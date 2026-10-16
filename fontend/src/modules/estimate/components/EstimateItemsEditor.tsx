import React, { useState } from 'react';
import { Save, X, Send } from 'lucide-react';
import { Estimate, RepairItem } from '../types';
import { AemsLineItems, AemsHours, blankAemsItem, calcAemsTotals, normalizeAemsItem } from './AemsLineItems';

// Sửa trực tiếp nội dung báo giá ngay trong tab "Chi tiết báo giá" theo cấu trúc Work Order Maersk AEMS:
// sửa / thêm / xoá dòng sửa chữa, đơn giá giờ công, Mode, Cause, VAT, ghi chú.

interface Props {
  estimate: Estimate;
  saving: boolean;
  onCancel: () => void;
  onSave: (updated: Estimate, sendAfter?: boolean) => void;
  /** Nhãn nút lưu + chốt: "Lưu & Xác Nhận" (chưa có API) hoặc "Lưu & Gửi Hãng Tàu". */
  saveAndSendLabel?: string;
}

const VAT_OPTIONS = [0, 0.05, 0.08, 0.1];

export const EstimateItemsEditor: React.FC<Props> = ({ estimate, saving, onCancel, onSave, saveAndSendLabel = 'Lưu & Xác Nhận' }) => {
  const [vatRate, setVatRate] = useState<number>(estimate.vatRate || 0);
  const [laborRate, setLaborRate] = useState<number>(estimate.laborRate || 0);
  const [repairMode, setRepairMode] = useState<string>(estimate.repairMode || '');
  const [cause, setCause] = useState<string>(estimate.cause || '');
  const [shopCode, setShopCode] = useState<string>(estimate.shopCode || '');
  const [vendorRefNo, setVendorRefNo] = useState<string>(estimate.vendorRefNo || '');
  const [hours, setHours] = useState<AemsHours>({
    preparationHours: estimate.preparationHours || 0,
    ordinaryHours: estimate.ordinaryHours || 0,
    ot1Hours: estimate.ot1Hours || 0,
    ot2Hours: estimate.ot2Hours || 0,
    ot3Hours: estimate.ot3Hours || 0
  });
  const [items, setItems] = useState<RepairItem[]>(() =>
    estimate.items.length > 0 ? estimate.items.map((i) => ({ ...i })) : [blankAemsItem(estimate.vatRate || 0)]
  );
  const [notes, setNotes] = useState<string>(estimate.notes || '');
  const [error, setError] = useState<string>('');

  const handleSave = (sendAfter = false) => {
    if (items.length === 0) return setError('Báo giá phải có ít nhất 01 dòng sửa chữa.');
    const bad = items.findIndex((i) => !(i.quantity > 0) || i.unitPrice < 0 || (i.manHoursPerPiece ?? 0) < 0 || !(i.description?.trim() || i.repairCode));
    if (bad >= 0) return setError(`Dòng ${bad + 1}: cần Description (hoặc Repair code), PCS > 0, giờ công và vật tư không âm.`);
    if (items.some((i) => (i.manHoursPerPiece ?? 0) > 0) && !(laborRate > 0)) return setError('Có giờ công nhưng chưa nhập đơn giá giờ công.');
    setError('');
    const finalItems = items.map((i) => normalizeAemsItem(i, laborRate, vatRate));
    const t = calcAemsTotals(finalItems, laborRate, vatRate, hours.preparationHours);
    onSave({
      ...estimate,
      items: finalItems,
      laborRate,
      repairMode,
      cause,
      shopCode,
      vendorRefNo,
      ...hours,
      totalManHours: t.totalManHours,
      laborCost: t.laborCost,
      materialCost: t.materialCost,
      subtotal: t.subtotal,
      vatRate,
      vatAmount: t.vatAmount,
      totalAmount: t.totalAmount,
      notes,
      repairSummary: finalItems.map((i) => i.description || i.repairMethod).filter(Boolean).join(', ') || estimate.repairSummary
    }, sendAfter);
  };

  return (
    <div className="p-4 bg-amber-50/40 rounded-2xl border-2 border-amber-300 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-xs font-bold text-amber-800 uppercase">Đang sửa báo giá {estimate.estimateNo} · cấu trúc AEMS</h4>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-semibold">Thuế VAT:</span>
          <select
            value={vatRate}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVatRate(v);
              setItems((prev) => prev.map((i) => normalizeAemsItem(i, laborRate, v)));
            }}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-700"
          >
            {VAT_OPTIONS.concat(VAT_OPTIONS.includes(vatRate) ? [] : [vatRate]).map((v) => (
              <option key={v} value={v}>{Math.round(v * 1000) / 10}%</option>
            ))}
          </select>
        </label>
      </div>

      <AemsLineItems
        items={items}
        onItemsChange={setItems}
        laborRate={laborRate}
        onLaborRateChange={setLaborRate}
        vatRate={vatRate}
        repairMode={repairMode}
        onRepairModeChange={setRepairMode}
        cause={cause}
        onCauseChange={setCause}
        shippingLine={estimate.shippingLine}
        shopCode={shopCode}
        onShopCodeChange={setShopCode}
        surveyContainerNo={estimate.containerNo}
        hours={hours}
        onHoursChange={setHours}
      />

      <label className="block max-w-xs">
        <span className="block text-[11px] font-semibold text-slate-600 mb-1">Vendor Ref No. (tuỳ chọn):</span>
        <input value={vendorRefNo} onChange={(e) => setVendorRefNo(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-amber-400" />
      </label>

      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Remarks (tối đa 255 ký tự):</label>
        <textarea value={notes} maxLength={255} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Please indicate general condition of box, main damage consists, wear and tear share of repair, repair in other mode required."
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-400" />
      </div>

      {error && <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">{error}</div>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={saving}
          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <X className="w-3.5 h-3.5" /> Huỷ sửa
        </button>
        <button type="button" onClick={() => handleSave(false)} disabled={saving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> {saving ? 'Đang lưu...' : 'Lưu báo giá'}
        </button>
        <button type="button" onClick={() => handleSave(true)} disabled={saving}
          title="Lưu rồi chốt luôn báo giá (gửi API nếu hãng tàu đã cấu hình)"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <Send className="w-3.5 h-3.5" /> {saveAndSendLabel}
        </button>
      </div>
    </div>
  );
};
