import React, { useEffect, useState } from 'react';
import { masterDataApi } from '../../../api';
import { fetchCleaningTariffs } from '../../masterdata/utils/cleaningTariffCatalog';
import { CleaningTariffMasterItem } from '../../survey/types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { LoadErrorBanner } from '../../../components/common/LoadErrorBanner';

// Tab "2. Biểu Phí Dịch Vụ Cổng" của Tiếp Nhận Cổng — trước đây là các con số gõ cứng (260.000đ nâng hạ, 7 ngày
// miễn phí...) không liên quan gì tới biểu cước thật, và không có biểu phí vệ sinh. Nay đọc thẳng từ 3 nguồn
// đang dùng để tính tiền: ServiceTariffs (Cước Nâng Hạ), StorageTariffRules (Cước Lưu Bãi), catalog
// CLEANING_TARIFF (Biểu Phí Vệ Sinh). Chỉ hiện dòng đang áp dụng; không có dữ liệu thì báo trống.

interface ServiceTariffRow {
  id: number; code: string; nameVi: string; unit: string;
  price20GP: number; price40HC: number; price45HC: number; price20RF: number; price40RH: number;
  vatPercent: number; currency: string; sortOrder: number;
}
interface StorageTier { tierName: string; fromDay: number; toDay: number | null; price20Dry: number; price40Dry: number; price20Reefer: number; price40Reefer: number; }
interface StorageRuleRow {
  id: number; code: string; shippingLineName: string; defaultFreeDays: number; calculationUnit: string; vatPercent: number; tiers: StorageTier[];
}

const money = (v: number | undefined, currency = 'VND') =>
  v ? `${Number(v).toLocaleString('vi-VN')} ${currency === 'VND' ? 'đ' : currency}` : '—';

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-6 text-center text-xs text-slate-500">{text}</div>
);

export const GateTariffReference: React.FC = () => {
  const [lolo, setLolo] = useState<ServiceTariffRow[]>([]);
  const [storage, setStorage] = useState<StorageRuleRow[]>([]);
  const [cleaning, setCleaning] = useState<CleaningTariffMasterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const load = () => {
    setIsLoading(true);
    setErrors([]);
    const fail = (label: string) => (error: unknown) => setErrors((prev) => [...prev, `${label}: ${getApiErrorMessage(error)}`]);
    Promise.all([
      masterDataApi.getServiceTariffs()
        .then((res: any) => setLolo(((res?.data || []) as ServiceTariffRow[]).slice().sort((a, b) => a.sortOrder - b.sortOrder)))
        .catch(fail('Cước nâng hạ')),
      masterDataApi.getStorageTariffs()
        .then((res: any) => setStorage((res?.data || []) as StorageRuleRow[]))
        .catch(fail('Cước lưu bãi')),
      fetchCleaningTariffs()
        .then((items) => setCleaning(items.filter((x) => x.status === 'ACTIVE').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))))
        .catch(fail('Biểu phí vệ sinh'))
    ]).finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const loadingOr = (rows: unknown[], emptyText: string) =>
    isLoading ? <Empty text="Đang tải…" /> : rows.length === 0 ? <Empty text={emptyText} /> : null;

  return (
    <div className="space-y-4">
      {errors.length > 0 && <LoadErrorBanner message={errors.join(' · ')} onRetry={load} />}

      {/* 1. Cước nâng hạ */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="text-xs font-bold text-sky-600 uppercase">1. Cước Nâng Hạ (Lift-on / Lift-off)</h4>
        {loadingOr(lolo, 'Chưa có biểu cước nâng hạ đang áp dụng — khai báo ở Danh mục › Cước Nâng Hạ (LoLo).') ?? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1.5 pr-2 font-semibold">Dịch vụ</th>
                  <th className="py-1.5 px-2 font-semibold text-right">20GP</th>
                  <th className="py-1.5 px-2 font-semibold text-right">40HC</th>
                  <th className="py-1.5 px-2 font-semibold text-right">45HC</th>
                  <th className="py-1.5 px-2 font-semibold text-right">20RF</th>
                  <th className="py-1.5 px-2 font-semibold text-right">40RH</th>
                  <th className="py-1.5 pl-2 font-semibold text-right">VAT</th>
                </tr>
              </thead>
              <tbody>
                {lolo.map((t) => (
                  <tr key={t.id} className="border-b border-slate-200 last:border-0">
                    <td className="py-1.5 pr-2 text-slate-700">{t.nameVi} <span className="text-slate-400">({t.unit})</span></td>
                    {[t.price20GP, t.price40HC, t.price45HC, t.price20RF, t.price40RH].map((p, i) => (
                      <td key={i} className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap">{money(p, t.currency)}</td>
                    ))}
                    <td className="py-1.5 pl-2 text-right font-mono text-slate-600">{t.vatPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2. Cước lưu bãi */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-emerald-600 uppercase">2. Cước Lưu Bãi (Storage)</h4>
          {loadingOr(storage, 'Chưa có quy tắc lưu bãi đang áp dụng — khai báo ở Danh mục › Cước Lưu Bãi.') ?? (
            <div className="space-y-3">
              {storage.map((r) => (
                <div key={r.id} className="space-y-1 text-xs">
                  <div className="flex justify-between gap-2 font-semibold text-slate-800">
                    <span>{r.shippingLineName}</span>
                    <span className="text-emerald-700 whitespace-nowrap">Miễn phí {r.defaultFreeDays} ngày</span>
                  </div>
                  {(r.tiers || []).map((t, i) => (
                    <div key={i} className="flex justify-between gap-2 py-1 border-b border-slate-200 last:border-0">
                      <span className="text-slate-600">
                        {t.tierName || `Bậc ${i + 1}`} ({t.toDay ? `ngày ${t.fromDay}–${t.toDay}` : `từ ngày ${t.fromDay}`})
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-right">
                        {/* Quy tắc cho container lạnh chỉ khai giá Reefer (giá Dry = 0) */}
                        {!t.price20Dry && !t.price40Dry && (t.price20Reefer || t.price40Reefer)
                          ? <>20'RF: {money(t.price20Reefer)} · 40'RF: {money(t.price40Reefer)}</>
                          : <>20': {money(t.price20Dry)} · 40': {money(t.price40Dry)}</>}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Biểu phí vệ sinh */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-cyan-600 uppercase">3. Biểu Phí Vệ Sinh Container</h4>
          {loadingOr(cleaning, 'Chưa có biểu phí vệ sinh đang áp dụng — khai báo ở Danh mục › Biểu Phí Vệ Sinh Container.') ?? (
            <div className="space-y-1.5 text-xs">
              {cleaning.map((c) => (
                <div key={c.id} className="flex justify-between gap-2 py-1 border-b border-slate-200 last:border-0">
                  <span className="text-slate-600">{c.vietnameseName} <span className="text-slate-400">({c.cleaningCode})</span></span>
                  <span className="font-mono font-bold text-slate-900 text-right whitespace-nowrap">
                    20': {money(c.price20DC, c.currency)} · 40': {money(c.price40DC || c.price40HC, c.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
