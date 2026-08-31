import React, { useState, useMemo, useEffect } from 'react';
import { LoLoTariffItem, StorageTariffRule } from '../mockTariffData';
import { masterDataApi } from '../../../api';
import { Calculator, Receipt, Truck, Layers, Printer } from 'lucide-react';

// Tách riêng khỏi màn "Cước Nâng Hạ & Lưu Bãi" gộp chung cũ (`LiftOnLiftOffAndStorageMaster.tsx`, đã
// xoá) theo yêu cầu người dùng — xem docs/frontend-tariff-catalog-split.md. Khác với
// `LoloTariffMaster.tsx`/`StorageTariffMaster.tsx` (mỗi cái chỉ quản lý 1 loại cước), màn này CẦN đọc cả
// 2 catalog (SERVICE_TARIFF + STORAGE_TARIFF) vì công thức tính giá kết hợp cả nâng hạ lẫn lưu bãi — nên
// tự fetch riêng cả 2, không dùng chung state với 2 màn quản lý danh mục kia.

// `loloTariffs`/`storageRules` bắt đầu rỗng, chỉ có dữ liệu thật sau khi tải xong từ backend.
// `calculationResult` bên dưới chạy ngay lúc mount (useMemo không đợi API) — nếu không có 2 placeholder
// này, `.find(...) || arr[0]` sẽ ra `undefined` và dòng đọc `.price20GP`/`.nameVi` ngay sau đó sẽ crash
// trắng màn hình. Xem lịch sử bug tại docs/backend-progress/23-master-data.md mục "Bug thật thứ 2.5".
const EMPTY_LOLO_PLACEHOLDER: LoLoTariffItem = {
  id: '', tariffCode: '', serviceCategory: 'LIFT_EMPTY', nameVi: 'Đang tải dữ liệu...', nameEn: '',
  unit: '', price20GP: 0, price40GP_HC: 0, price45HC: 0, price20RF: 0, price40RH: 0, priceSpecial: 0,
  vatPercent: 0, currency: 'VND', description: '', applicableShift: 'ALL', status: 'ACTIVE', updatedAt: ''
};

const EMPTY_STORAGE_PLACEHOLDER: StorageTariffRule = {
  id: '', ruleCode: '', shippingLineCode: 'ALL', shippingLineName: 'Đang tải dữ liệu...',
  containerTypeCategory: 'DRY_STANDARD', defaultFreeDays: 0, calculationUnit: 'VND/Cont/Day', tiers: [],
  vatPercent: 0, status: 'ACTIVE', notes: '', updatedAt: ''
};

export const TariffCalculatorPage: React.FC = () => {
  const [loloTariffs, setLoloTariffs] = useState<LoLoTariffItem[]>([]);
  const [storageRules, setStorageRules] = useState<StorageTariffRule[]>([]);

  useEffect(() => {
    const loadTariffs = async () => {
      const [serviceResponse, storageResponse] = await Promise.all([
        masterDataApi.getServiceTariffs(),
        masterDataApi.getStorageTariffs()
      ]);
      // Cả 2 bảng mới đều có cột thật (không còn JsonData tự do) — map thẳng 1-1.
      setLoloTariffs((serviceResponse.data as any[] || []).map((item: any) => ({
        id: String(item.id), tariffCode: item.code, serviceCategory: item.serviceCategory || 'LIFT_EMPTY',
        nameVi: item.nameVi, nameEn: item.nameEn || '', unit: item.unit || 'Lần / Cont',
        price20GP: item.price20GP || 0, price40GP_HC: item.price40HC || 0, price45HC: item.price45HC || 0,
        price20RF: item.price20RF || 0, price40RH: item.price40RH || 0, priceSpecial: item.priceSpecial || 0,
        vatPercent: item.vatPercent || 8, currency: item.currency || 'VND', description: item.description || '',
        applicableShift: item.applicableShift || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', updatedAt: item.lastModifiedAt || item.createdAt || ''
      } as LoLoTariffItem)));
      setStorageRules((storageResponse.data as any[] || []).map((item: any) => ({
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
    loadTariffs().catch((error) => console.error('Không thể tải tariff từ backend:', error));
  }, []);

  const [calcContSize, setCalcContSize] = useState<'20GP' | '40GP_HC' | '45HC' | '20RF' | '40RH' | 'SPECIAL'>('20GP');
  const [calcLoloAction, setCalcLoloAction] = useState<string>('LOLO_MT_NORMAL');
  const [calcStorageRule, setCalcStorageRule] = useState<string>('STOR_DRY_STANDARD');
  const [calcStorageDays, setCalcStorageDays] = useState<number>(10);
  const [calcNightShift, setCalcNightShift] = useState<boolean>(false);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const calculationResult = useMemo(() => {
    const selectedLolo = loloTariffs.find((t) => t.tariffCode === calcLoloAction) || loloTariffs[0] || EMPTY_LOLO_PLACEHOLDER;
    let loloBasePrice = 0;
    if (calcContSize === '20GP') loloBasePrice = selectedLolo.price20GP;
    else if (calcContSize === '40GP_HC') loloBasePrice = selectedLolo.price40GP_HC;
    else if (calcContSize === '45HC') loloBasePrice = selectedLolo.price45HC;
    else if (calcContSize === '20RF') loloBasePrice = selectedLolo.price20RF;
    else if (calcContSize === '40RH') loloBasePrice = selectedLolo.price40RH;
    else loloBasePrice = selectedLolo.priceSpecial;

    let nightSurcharge = 0;
    if (calcNightShift) {
      const nightTariff = loloTariffs.find((t) => t.applicableShift === 'NIGHT_SURCHARGE');
      if (nightTariff) {
        if (calcContSize === '20GP') nightSurcharge = nightTariff.price20GP;
        else if (calcContSize === '40GP_HC') nightSurcharge = nightTariff.price40GP_HC;
        else if (calcContSize === '45HC') nightSurcharge = nightTariff.price45HC;
        else if (calcContSize === '20RF') nightSurcharge = nightTariff.price20RF;
        else if (calcContSize === '40RH') nightSurcharge = nightTariff.price40RH;
        else nightSurcharge = nightTariff.priceSpecial;
      } else {
        nightSurcharge = loloBasePrice * 0.25;
      }
    }

    const totalLoloCost = loloBasePrice + nightSurcharge;

    const selectedStorage = storageRules.find((r) => r.ruleCode === calcStorageRule) || storageRules[0] || EMPTY_STORAGE_PLACEHOLDER;
    const isReefer = calcContSize === '20RF' || calcContSize === '40RH';
    const isSpecial = calcContSize === 'SPECIAL';

    let totalStorageCost = 0;
    const tierBreakdown: Array<{ name: string; days: number; dailyRate: number; subtotal: number }> = [];

    let remainingDays = calcStorageDays;

    for (const tier of selectedStorage.tiers) {
      if (remainingDays <= 0) break;

      const tierStart = tier.fromDay;
      const tierEnd = tier.toDay !== null ? tier.toDay : 999999;
      const tierCapacity = tierEnd - tierStart + 1;

      if (calcStorageDays >= tierStart) {
        const daysInThisTier = Math.min(calcStorageDays - tierStart + 1, tierCapacity);
        const effectiveDays = Math.max(0, Math.min(remainingDays, daysInThisTier));

        if (effectiveDays > 0) {
          let dailyRate = 0;
          if (isReefer) {
            dailyRate = calcContSize === '20RF' ? tier.price20Reefer : tier.price40Reefer;
          } else if (isSpecial) {
            dailyRate = tier.priceSpecial;
          } else {
            if (calcContSize === '20GP') dailyRate = tier.price20Dry;
            else if (calcContSize === '40GP_HC') dailyRate = tier.price40Dry;
            else dailyRate = tier.price45Dry;
          }

          const tierSubtotal = effectiveDays * dailyRate;
          totalStorageCost += tierSubtotal;

          tierBreakdown.push({ name: tier.tierName, days: effectiveDays, dailyRate, subtotal: tierSubtotal });
          remainingDays -= effectiveDays;
        }
      }
    }

    const totalBeforeVat = totalLoloCost + totalStorageCost;
    const vatRate = 0.08;
    const vatAmount = totalBeforeVat * vatRate;
    const grandTotal = totalBeforeVat + vatAmount;

    return { selectedLolo, loloBasePrice, nightSurcharge, totalLoloCost, selectedStorage, tierBreakdown, totalStorageCost, isReefer, totalBeforeVat, vatAmount, grandTotal };
  }, [loloTariffs, storageRules, calcContSize, calcLoloAction, calcStorageRule, calcStorageDays, calcNightShift]);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-start gap-4 shadow-xl">
        <div className="p-3.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-lg shrink-0">
          <Calculator className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">MÁY TÍNH CƯỚC NÂNG HẠ &amp; LƯU BÃI</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Mô phỏng tự động tính toán tổng số tiền Nâng Hạ + Lưu Bãi lũy tiến + Phụ phí ca đêm + Thuế VAT, dựa trên biểu cước thật đang cấu hình ở 2 danh mục "Cước Nâng Hạ" và "Cước Lưu Bãi".
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs Section */}
        <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <span>Nhập Thông Số Tính Toán Chi Phí</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">1. Kích Cỡ &amp; Quy Cách Container:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '20GP', label: "20' GP / DC" },
                  { id: '40GP_HC', label: "40' GP / HC" },
                  { id: '45HC', label: "45' HC" },
                  { id: '20RF', label: "20' RF (Lạnh)" },
                  { id: '40RH', label: "40' RH (Lạnh)" },
                  { id: 'SPECIAL', label: 'OOG / FlatRack' }
                ].map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setCalcContSize(sz.id as any)}
                    className={`p-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      calcContSize === sz.id ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">2. Nghiệp Vụ Nâng / Hạ (LoLo):</label>
              <select
                value={calcLoloAction}
                onChange={(e) => setCalcLoloAction(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {loloTariffs.map((t) => (
                  <option key={t.tariffCode} value={t.tariffCode}>{t.nameVi} ({t.tariffCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">3. Chính Sách Lưu Bãi Áp Dụng:</label>
              <select
                value={calcStorageRule}
                onChange={(e) => setCalcStorageRule(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {storageRules.map((r) => (
                  <option key={r.ruleCode} value={r.ruleCode}>{r.shippingLineName} ({r.defaultFreeDays} ngày Free)</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>4. Tổng Số Ngày Lưu Bãi Thực Tế:</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-sm rounded-lg">{calcStorageDays} Ngày</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                value={calcStorageDays}
                onChange={(e) => setCalcStorageDays(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 ngày</span>
                <span>15 ngày</span>
                <span>30 ngày</span>
                <span>60 ngày</span>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={calcNightShift}
                onChange={(e) => setCalcNightShift(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
              />
              <div>
                <div className="text-xs font-bold text-white">Nâng hạ ca đêm / Ngày Lễ</div>
                <div className="text-[11px] text-slate-400">Cộng phụ phí ngoài giờ quy định</div>
              </div>
            </label>
          </div>
        </div>

        {/* Detailed Invoice Breakdown Section */}
        <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-400" />
                  <span>Dự Toán Hóa Đơn Chi Tiết (Estimated Tariff Invoice)</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Quy chuẩn Cont: {calcContSize} &bull; Lưu bãi {calcStorageDays} ngày &bull; {calculationResult.selectedStorage.shippingLineName}
                </span>
              </div>
              <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    1. Cước Nâng / Hạ (LoLo)
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{formatVND(calculationResult.loloBasePrice)}</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-5">{calculationResult.selectedLolo.nameVi}</div>
                {calculationResult.nightSurcharge > 0 && (
                  <div className="flex items-center justify-between text-[11px] pl-5 text-amber-300 font-medium">
                    <span>&bull; Phụ phí nâng hạ ca đêm / lễ:</span>
                    <span className="font-mono">+{formatVND(calculationResult.nightSurcharge)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    2. Tiền Lưu Bãi Lũy Tiến ({calcStorageDays} ngày)
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">{formatVND(calculationResult.totalStorageCost)}</span>
                </div>

                <div className="space-y-1 pl-5 border-l-2 border-slate-800">
                  {calculationResult.tierBreakdown.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>&bull; {t.name} ({t.days} ngày x {formatVND(t.dailyRate)}):</span>
                      <span className="font-mono font-bold">{formatVND(t.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 border border-emerald-500/30 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Cộng tiền trước thuế (Subtotal):</span>
              <span className="font-mono text-white font-bold">{formatVND(calculationResult.totalBeforeVat)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Thuế giá trị gia tăng (VAT 8%):</span>
              <span className="font-mono text-emerald-400 font-bold">+{formatVND(calculationResult.vatAmount)}</span>
            </div>
            <div className="h-[1px] bg-slate-800 pt-1" />
            <div className="flex items-center justify-between text-sm sm:text-base font-bold text-white pt-1">
              <span>TỔNG TIỀN PHẢI THANH TOÁN:</span>
              <span className="font-mono text-2xl text-emerald-400 font-black">{formatVND(calculationResult.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
