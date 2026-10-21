import React, { useEffect, useState } from 'react';
import { masterDataApi } from '../../../api';
import { fetchCleaningTariffs } from '../../masterdata/utils/cleaningTariffCatalog';
import { CleaningTariffMasterItem } from '../../survey/types';
import { getApiErrorMessage } from '../../../utils/apiError';
import { LoadErrorBanner } from '../../../components/common/LoadErrorBanner';
import { priceMapOf, ServiceTariffPriceRow } from '../../masterdata/utils/tariffPricing';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';

// Tab "2. Biểu Phí Dịch Vụ Cổng" của Tiếp Nhận Cổng — trước đây là các con số gõ cứng (260.000đ nâng hạ, 7 ngày
// miễn phí...) không liên quan gì tới biểu cước thật, và không có biểu phí vệ sinh. Nay đọc thẳng từ 3 nguồn
// đang dùng để tính tiền: ServiceTariffs (Cước Nâng Hạ), StorageTariffRules (Cước Lưu Bãi), catalog
// CLEANING_TARIFF (Biểu Phí Vệ Sinh). Chỉ hiện dòng đang áp dụng; không có dữ liệu thì báo trống.

interface ServiceTariffRow {
  id: number; code: string; nameVi: string; unit: string;
  prices: ServiceTariffPriceRow[];
  vatPercent: number; currency: string; sortOrder: number;
}
interface StorageTier { tierName: string; fromDay: number; toDay: number | null; prices: ServiceTariffPriceRow[]; }
interface StorageRuleRow {
  id: number; code: string; shippingLineCode: string; shippingLineName: string; defaultFreeDays: number; calculationUnit: string; vatPercent: number; tiers: StorageTier[];
}


const money = (v: number | undefined, currency = 'VND') =>
  v ? `${Number(v).toLocaleString('vi-VN')} ${currency === 'VND' ? 'đ' : currency}` : '—';

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-6 text-center text-xs text-slate-500">{text}</div>
);

export const GateTariffReference: React.FC = () => {
  const [lolo, setLolo] = useState<ServiceTariffRow[]>([]);
  const [storage, setStorage] = useState<StorageRuleRow[]>([]);
  // Cột giá nâng hạ = các loại đang dùng của DM Loại Container (mỗi loại 1 giá riêng — tariffPricing.ts).
  const containerTypes = useContainerTypeOptions();
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
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-1.5 pr-2 font-semibold">Dịch vụ</th>
                  {containerTypes.map((ct) => (
                    <th key={ct.typeCode} className="py-1.5 px-2 font-semibold text-right font-mono" title={ct.vietnameseName}>{ct.typeCode}</th>
                  ))}
                  <th className="py-1.5 pl-2 font-semibold text-right">VAT</th>
                </tr>
              </thead>
              <tbody>
                {lolo.map((t) => {
                  const priceMap = priceMapOf(t.prices);
                  return (
                  <tr key={t.id} className="border-b border-slate-200 last:border-0">
                    <td className="py-1.5 pr-2 text-slate-700 whitespace-nowrap">{t.nameVi} <span className="text-slate-400">({t.unit})</span></td>
                    {containerTypes.map((ct) => (
                      <td key={ct.typeCode} className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {priceMap[ct.typeCode.toUpperCase()] ? money(priceMap[ct.typeCode.toUpperCase()], t.currency) : <span className="font-sans font-normal text-amber-700">Chưa có giá</span>}
                      </td>
                    ))}
                    <td className="py-1.5 pl-2 text-right font-mono text-slate-600">{t.vatPercent}%</td>
                  </tr>
                  );
                })}
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
                    <span>{r.shippingLineCode === 'ALL' ? 'Mọi hãng tàu' : r.shippingLineName} <span className="font-mono text-slate-400">{r.code}</span></span>
                    <span className="text-emerald-700 whitespace-nowrap">Miễn phí {r.defaultFreeDays} ngày</span>
                  </div>
                  {(r.tiers || []).map((t, i) => (
                    <div key={i} className="flex justify-between gap-2 py-1 border-b border-slate-200 last:border-0">
                      <span className="text-slate-600">
                        {t.tierName || `Bậc ${i + 1}`} ({t.toDay ? `ngày ${t.fromDay}–${t.toDay}` : `từ ngày ${t.fromDay}`})
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-right">
                        {/* Giá/ngày theo từng loại container của DM (bảng StorageTariffTierPrices) — loại chưa có giá không hiện. */}
                        {(() => {
                          const map = priceMapOf(t.prices);
                          return containerTypes.filter((ct) => (map[ct.typeCode.toUpperCase()] || 0) > 0)
                            .map((ct) => `${ct.typeCode}: ${money(map[ct.typeCode.toUpperCase()])}`).join(' · ') || 'Chưa có giá';
                        })()}
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
                  <span className="font-mono font-bold text-slate-900 text-right">
                    {/* Giá theo từng loại container của DM (bảng CleaningTariffPrices) — loại chưa có giá không hiện. */}
                    {containerTypes.filter((ct) => (c.prices?.[ct.typeCode.toUpperCase()] || 0) > 0)
                      .map((ct) => `${ct.typeCode}: ${money(c.prices[ct.typeCode.toUpperCase()], c.currency)}`).join(' · ') || 'Chưa có giá'}
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
