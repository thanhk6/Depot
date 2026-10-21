import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Droplets,
  Container as ContainerIcon,
  Sparkles,
  Building,
  User,
  Plus,
  Clock,
  ShieldCheck,
  Box,
  Layers,
  ThermometerSnowflake,
  Info
} from 'lucide-react';
import { CleaningExecutionRecord } from '../types';
import { ContainerTypeMasterItem, CleaningTariffMasterItem } from '../../survey/types';
// Giá theo đúng mã loại container (DM Loại Container) — server tra lại khi tạo lệnh (depot-fullstack-cleaning-tariff-pricing).
import { useDepot } from '../../../context/DepotContext';
import { cleaningApi } from '../../../api';
import { mapCleaningRecordDto } from '../utils/mapCleaningRecord';
import { useShippingLineOptions } from '../../../hooks/useShippingLineOptions';

interface NewCleaningIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCleaningOrder: (order: CleaningExecutionRecord) => void;
  /** DM Loại Container (ISO) thật từ backend. */
  containerTypes?: ContainerTypeMasterItem[];
  /** Biểu Phí Vệ Sinh (catalog CLEANING_TARIFF) thật từ backend — nguồn danh sách dịch vụ + đơn giá. */
  cleaningTariffs?: CleaningTariffMasterItem[];
  // Điền sẵn từ thẻ "chưa tiếp nhận" (container Survey đã chấm CL nhưng chưa có lệnh vệ sinh thật) —
  // tránh người dùng phải tự gõ lại tay số container/loại/hãng tàu đã biết sẵn.
  prefill?: { containerNo: string; typeCode?: string; shippingLine?: string } | null;
}

export const NewCleaningIntakeModal: React.FC<NewCleaningIntakeModalProps> = ({
  isOpen,
  onClose,
  onAddCleaningOrder,
  containerTypes = [],
  cleaningTariffs = [],
  prefill = null
}) => {
  const shippingLineOptions = useShippingLineOptions();
  const [containerNo, setContainerNo] = useState('');
  const { loggedInUserProfile } = useDepot();
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('');
  const [shippingLine, setShippingLine] = useState('');
  const [cleaningBay, setCleaningBay] = useState('CLEANING-BAY-01 (Trạm Xịt Rửa Áp Lực Cao)');
  const [cleaningStaff, setCleaningStaff] = useState(loggedInUserProfile?.fullName || '');
  const [targetGrade, setTargetGrade] = useState<'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE'>('GRADE_A');
  const [selectedPresetServices, setSelectedPresetServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal luôn được mount sẵn (cha chỉ toggle `isOpen`), nên `useState(prefill...)` ban đầu chỉ đọc đúng
  // 1 lần lúc mount — nếu không đồng bộ lại mỗi lần mở, lần mở thứ 2 với `prefill` khác (hoặc null) vẫn
  // hiện dữ liệu cũ của lần mở trước đó.
  useEffect(() => {
    if (!isOpen) return;
    setContainerNo(prefill?.containerNo || '');
    if (prefill?.typeCode) setSelectedTypeCode(prefill.typeCode);
    if (prefill?.shippingLine) setShippingLine(prefill.shippingLine);
    setSubmitError(null);
  }, [isOpen, prefill]);

  // Selected container item from Master Data Catalog
  const selectedContainerType = useMemo(() => {
    return (
      containerTypes.find((ct) => ct.typeCode === selectedTypeCode) ||
      containerTypes[0] ||
      null
    );
  }, [containerTypes, selectedTypeCode]);

  // Group container types by category for the select dropdown
  const groupedContainerTypes = useMemo(() => {
    const dry = containerTypes.filter((t) => t.category === 'DRY');
    const reefer = containerTypes.filter((t) => t.category === 'REEFER' || t.isReefer);
    const openTop = containerTypes.filter((t) => t.category === 'OPEN_TOP');
    const flatRack = containerTypes.filter((t) => t.category === 'FLAT_RACK');
    const tank = containerTypes.filter((t) => t.category === 'TANK');
    const other = containerTypes.filter(
      (t) => !['DRY', 'REEFER', 'OPEN_TOP', 'FLAT_RACK', 'TANK'].includes(t.category) && !t.isReefer
    );

    return { dry, reefer, openTop, flatRack, tank, other };
  }, [containerTypes]);

  if (!isOpen) return null;

  const handleToggleService = (code: string) => {
    setSelectedPresetServices((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Dịch vụ + đơn giá lấy từ Biểu Phí Vệ Sinh thật (bảng CleaningTariffs), giá theo đúng loại container đang chọn;
  // 0 = chưa có giá cho loại đó (không chọn được, server cũng chặn).
  const servicePresets = cleaningTariffs
    .filter((t) => t.status !== 'INACTIVE')
    .map((t) => ({
      code: t.cleaningCode,
      name: t.vietnameseName || t.name,
      price: t.prices?.[(selectedContainerType?.typeCode || '').toUpperCase()] || 0,
      chemicalName: t.chemicalRequired || '',
      durationMin: t.estimatedDurationMin || 0,
      responsibleParty: t.responsiblePartyDefault || 'U'
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!containerNo.trim() || isSubmitting) return;
    if (!selectedContainerType) {
      setSubmitError('Chưa có loại container nào trong DM Loại Container (ISO).');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await cleaningApi.create({
        containerNo: containerNo.trim().toUpperCase(),
        isoCode: selectedContainerType.isoCode,
        sizeType: selectedContainerType.typeCode,
        typeName: selectedContainerType.vietnameseName || selectedContainerType.name,
        shippingLine,
        cleaningBay,
        cleaningStaff,
        targetQualityGrade: targetGrade,
        notes: notes || `Tiếp nhận vỏ ${selectedContainerType.typeCode} [${selectedContainerType.isoCode}] vào bệ rửa theo danh mục loại container.`,
        items: selectedPresetServices.map((code) => {
          const p = servicePresets.find((s) => s.code === code);
          return {
            cleaningCode: code,
            cleaningName: p ? p.name : code,
            chemicalRequired: Boolean(p?.chemicalName),
            chemicalName: p?.chemicalName || undefined,
            estimatedDurationMin: p?.durationMin || 0,
            unitPrice: p ? p.price : 0,
            responsibleParty: p?.responsibleParty || 'U'
          };
        })
      });

      const newOrder: CleaningExecutionRecord = mapCleaningRecordDto(response.data);
      onAddCleaningOrder(newOrder);
      onClose();
    } catch (error: any) {
      // Backend trả lỗi thật (vd. trùng lệnh vệ sinh) qua HTTP 400 kèm lý do chi tiết trong body — axios
      // tự throw trước khi tới đây nên error.message mặc định chỉ là "Request failed with status code
      // 400" chung chung, không phải lý do thật (giống bug đã sửa ở màn Survey).
      const body = error?.response?.data;
      const detail = [body?.message, body?.data].filter((v: any) => typeof v === 'string' && v).join(': ');
      setSubmitError(detail || (error instanceof Error ? error.message : 'Không thể tạo lệnh vệ sinh trên hệ thống.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-scale-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-xl">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Tiếp Nhận Container Vào Bệ Rửa (Cleaning Intake)</h3>
              <p className="text-xs text-slate-500">Tạo lệnh vệ sinh vỏ mới đồng bộ với Danh Mục Loại Container (ISO 6346)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Container No (11 ký tự ISO)*</label>
              <input
                type="text"
                required
                value={containerNo}
                onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
                placeholder="VD: TCLU1234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 text-xs focus:outline-none focus:border-cyan-500 uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hãng Tàu / Chủ Vỏ</label>
              <select
                value={shippingLine}
                onChange={(e) => setShippingLine(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-cyan-500"
              >
                {shippingLineOptions.map((l) => (
                  <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                ))}
              </select>
            </div>

            {/* Container Type Select directly from Master Data Catalog */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-cyan-700 text-xs flex items-center gap-1.5">
                  <ContainerIcon className="w-4 h-4 text-cyan-600" />
                  <span>Loại Container (Lấy từ Danh mục ISO-6346)*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {containerTypes.length} loại quy cách chuẩn
                </span>
              </div>

              <select
                value={selectedTypeCode}
                onChange={(e) => setSelectedTypeCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-cyan-200 rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-cyan-400 ring-1 ring-cyan-500/30"
              >
                {groupedContainerTypes.dry.length > 0 && (
                  <optgroup label="📦 CONTAINER KHÔ (DRY GENERAL / HIGH CUBE)">
                    {groupedContainerTypes.dry.map((ct) => (
                      <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                        {ct.typeCode} - {ct.vietnameseName} [Mã ISO: {ct.isoCode}]
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedContainerTypes.reefer.length > 0 && (
                  <optgroup label="❄️ CONTAINER LẠNH (REEFER / CONTROLLED TEMP)">
                    {groupedContainerTypes.reefer.map((ct) => (
                      <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                        {ct.typeCode} - {ct.vietnameseName} [Mã ISO: {ct.isoCode}]
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedContainerTypes.openTop.length > 0 && (
                  <optgroup label="🏗️ CONTAINER MỞ NÓC (OPEN TOP)">
                    {groupedContainerTypes.openTop.map((ct) => (
                      <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                        {ct.typeCode} - {ct.vietnameseName} [Mã ISO: {ct.isoCode}]
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedContainerTypes.flatRack.length > 0 && (
                  <optgroup label="🔲 CONTAINER MẶT BẰNG (FLAT RACK / OOG)">
                    {groupedContainerTypes.flatRack.map((ct) => (
                      <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                        {ct.typeCode} - {ct.vietnameseName} [Mã ISO: {ct.isoCode}]
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedContainerTypes.tank.length > 0 && (
                  <optgroup label="🛢️ CONTAINER BỒN XI TEC (ISO TANK)">
                    {groupedContainerTypes.tank.map((ct) => (
                      <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                        {ct.typeCode} - {ct.vietnameseName} [Mã ISO: {ct.isoCode}]
                      </option>
                    ))}
                  </optgroup>
                )}

                {groupedContainerTypes.other.length > 0 && (
                  <optgroup label="🚪 CÁC LOẠI CONTAINER ĐẶC CHỦNG KHÁC">
                    {groupedContainerTypes.other.map((ct) => (
                      <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                        {ct.typeCode} - {ct.vietnameseName} [Mã ISO: {ct.isoCode}]
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Master Data Container Specs Preview Card */}
              {selectedContainerType && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Mã ISO &amp; Quy Cách:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-black text-cyan-600 text-xs">
                        {selectedContainerType.typeCode}
                      </span>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono text-[10px] rounded border border-slate-200">
                        {selectedContainerType.isoCode}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Kích Thước Dài x Cao:</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {selectedContainerType.size}' ({selectedContainerType.lengthMm ? Math.round(selectedContainerType.lengthMm / 1000) : selectedContainerType.size}m) - {selectedContainerType.heightMm || '—'}mm
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Dung Tích Khối (CBM):</span>
                    <span className="font-mono font-bold text-amber-600 mt-0.5 block">
                      {selectedContainerType.cbm || '—'} m³
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Tải Trọng Tối Đa:</span>
                    <span className="font-mono font-bold text-emerald-600 mt-0.5 block">
                      {selectedContainerType.maxPayloadKg ? `${(selectedContainerType.maxPayloadKg / 1000).toFixed(1)} Tấn` : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chỉ Định Bệ Rửa (Cleaning Bay)</label>
              <select
                value={cleaningBay}
                onChange={(e) => setCleaningBay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-cyan-700 font-bold text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="CLEANING-BAY-01 (Trạm Xịt Rửa Áp Lực Cao)">Cleaning Bay 01 - Áp lực cao 200 Bar / Reefer</option>
                <option value="CLEANING-BAY-02 (Khu Quét Dọn & Rửa Nước)">Cleaning Bay 02 - Quét dọn & Rửa nước khô</option>
                <option value="CLEANING-BAY-03 (Trạm Sấy Khô Sàn & Bóc Nhãn)">Cleaning Bay 03 - Sấy sàn gỗ & Cạo sticker IMO</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mục Tiêu Nghiệm Thu Grade</label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-emerald-700 font-bold text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="GRADE_A">Grade A (Xuất Khẩu Cao Cấp / Điện Tử)</option>
                <option value="FOOD_GRADE">Food Grade (Nông Sản / Thực Phẩm)</option>
                <option value="GENERAL_CARGO">General Cargo (Bách Hóa)</option>
                <option value="SCRAP_GRADE">Scrap Grade (Phế Liệu / Vật Liệu Nặng)</option>
              </select>
            </div>
          </div>

          {/* Preset Services */}
          <div>
            <label className="block font-bold text-slate-700 mb-2 text-xs">
              Chọn Danh Mục Dịch Vụ Vệ Sinh Yêu Cầu ({selectedPresetServices.length} đã chọn):
            </label>
            {servicePresets.length === 0 && (
              <p className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-[11px] text-slate-500">
                Chưa có dịch vụ nào trong Biểu Phí Vệ Sinh Container (Master Data).
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {servicePresets.map((sp) => {
                const isChecked = selectedPresetServices.includes(sp.code);
                return (
                  <div
                    key={sp.code}
                    onClick={() => { if (sp.price > 0 || isChecked) handleToggleService(sp.code); }}
                    title={sp.price > 0 ? undefined : 'Chưa có giá cho loại container này — nhập giá ở Biểu Phí Vệ Sinh Container'}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                      isChecked
                        ? 'bg-cyan-50 border-cyan-200 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-600">[{sp.code}]</span>
                      <span className="font-semibold text-[11px] truncate max-w-[180px]">{sp.name}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-600 text-[10px]">
                      {sp.price > 0 ? `${sp.price.toLocaleString('vi-VN')} đ` : 'Chưa có giá'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 text-xs">Ghi chú giám định / Yêu cầu đặc biệt</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu kiểm tra mùi đáy, xịt sạch rãnh sàn T-Floor hoặc sấy khô sàn gỗ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Error message */}
          {submitError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang tiếp nhận...' : 'Tiếp Nhận & Đưa Vào Hàng Đợi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
