import React, { useState, useEffect } from 'react';
import {
  SurveyItemRecord,
  SurveyStatus,
  ContainerConditionGrade,
  CleaningReasonType,
  CleaningMethodType,
  CleaningTariffMasterItem,
  InspectionZoneKey,
  ZoneCheckStatus,
  DamageRecord,
  SurveyPhoto,
  DamageLocationMasterItem,
  DamageCodeMasterItem,
  RepairCodeMasterItem,
  GradeMasterItem,
  InspectionStandardMasterItem,
  ContainerTypeMasterItem
} from '../types';
import { validateContainerNumber } from '../utils/containerValidator';
import { fetchContainerTypes } from '../../masterdata/utils/containerTypeCatalog';
import { masterDataApi } from '../../../api';
import { useSurveyChecklistTemplate } from '../../masterdata/utils/checklistCatalog';
import { recomputeChecklistFromDamages } from '../utils/checklistSync';
import {
  ClipboardCheck,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  ShieldCheck,
  Camera,
  Plus,
  Trash2,
  X,
  Truck,
  Thermometer,
  Zap,
  Clock,
  Sparkle,
  Droplets,
  CheckSquare,
  Square
} from 'lucide-react';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Trả về false khi lưu thất bại (vd Gate-In bị từ chối) để form giữ nguyên dữ liệu đã nhập.
  onSaveSurvey: (newSurvey: SurveyItemRecord, openImmediately?: boolean) => boolean | void | Promise<boolean | void>;
  locations: DamageLocationMasterItem[];
  damageCodes: DamageCodeMasterItem[];
  repairCodes: RepairCodeMasterItem[];
  grades: GradeMasterItem[];
  standards: InspectionStandardMasterItem[];
  cleaningTariffs: CleaningTariffMasterItem[];
  currentUser?: string;
  initialContainerNo?: string;
  initialShippingLine?: string;
  initialSize?: string;
}

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  isOpen,
  onClose,
  onSaveSurvey,
  locations,
  damageCodes,
  repairCodes,
  grades,
  standards,
  cleaningTariffs,
  currentUser = '',
  initialContainerNo = '',
  initialShippingLine = '',
  initialSize = ''
}) => {
  // Active wizard / section tab
  const [activeTab, setActiveTab] = useState<'CONTAINER' | 'OPERATION' | 'GRADING' | 'DAMAGES_PHOTOS'>('CONTAINER');

  // Form State
  const [containerNo, setContainerNo] = useState<string>(initialContainerNo);
  const [shippingLine, setShippingLine] = useState<string>(initialShippingLine);
  const [sizeType, setSizeType] = useState<string>(initialSize);
  // Danh mục thật từ DB — trước đây là 12 hãng tàu + 11 loại container gõ cứng kèm tên chủ sở hữu và thông số.
  const [containerTypeOptions, setContainerTypeOptions] = useState<ContainerTypeMasterItem[]>([]);
  const [shippingLineOptions, setShippingLineOptions] = useState<Array<{ code: string; name: string }>>([]);
  useEffect(() => {
    fetchContainerTypes().then(setContainerTypeOptions).catch(() => setContainerTypeOptions([]));
    masterDataApi.getShippingLines()
      .then((res: any) => setShippingLineOptions((res?.data || []).map((l: any) => ({ code: l.code, name: l.name }))))
      .catch(() => setShippingLineOptions([]));
  }, []);
  const [isoCode, setIsoCode] = useState<string>('');
  const [containerTypeName, setContainerTypeName] = useState<string>('');
  const [isReefer, setIsReefer] = useState<boolean>(false);
  const [tareWeightKg, setTareWeightKg] = useState<number>(0);
  const [payloadKg, setPayloadKg] = useState<number>(0);
  // Vật liệu / loại sàn lấy theo DM Loại Container (không có ô nhập — giống Tiếp Nhận Cổng).
  const [material, setMaterial] = useState<string>('');
  const [floorType, setFloorType] = useState<string>('');

  // Operations & Logistics
  // Giờ giám định / giờ Gate-In chỉ để hiển thị tạm trong phiên — backend tự ghi giờ thật khi lưu.
  const surveyDate = new Date().toISOString().substring(0, 16).replace('T', ' ');
  const surveyor = currentUser;
  const [shift, setShift] = useState<string>('Ca 1 (06:00 - 14:00)');
  const [truckPlate, setTruckPlate] = useState<string>('');
  const [trailerPlate, setTrailerPlate] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [driverLicense] = useState<string>('');
  const [sealNo, setSealNo] = useState<string>('');
  const [customsSealNo, setCustomsSealNo] = useState<string>('');
  const [cargoStatus, setCargoStatus] = useState<'EMPTY' | 'FULL_IMPORT' | 'FULL_EXPORT' | 'LCL'>('EMPTY');

  // Grading & Standards
  const [standard, setStandard] = useState<string>('');
  const activeStandards = standards.filter((st) => st.status === 'ACTIVE');
  const [standardNotes, setStandardNotes] = useState<string>('');
  // Không chọn sẵn — giám định viên phải tự đánh giá (trước đây mặc định AV + GRADE_A).
  const [condition, setCondition] = useState<ContainerConditionGrade | ''>('');
  const [qualityGrade, setQualityGrade] = useState<string>('');
  // Thẻ Grade động lấy tên + mô tả trực tiếp từ Danh Mục Grade thật trong SQL — số thẻ AV/DM = số Grade
  // ACTIVE, không cố định. Xem giải thích đầy đủ ở SurveyDetailForm.tsx (chia theo vị trí sortOrder:
  // nửa đầu = AV, nửa sau = DM). CL không có Grade tương ứng nên giữ là 1 thẻ cố định riêng.
  const activeGrades = grades.filter((g) => g.status === 'ACTIVE').sort((a, b) => a.sortOrder - b.sortOrder);
  const [cleaningReasons, setCleaningReasons] = useState<CleaningReasonType[]>(['DUST', 'FLOOR_DIRTY']);
  const [cleaningMethod, setCleaningMethod] = useState<CleaningMethodType>('WATER_PRESSURE');
  const [cleaningRemarks, setCleaningRemarks] = useState<string>('');
  const [selectedCleaningCodes, setSelectedCleaningCodes] = useState<string[]>(['CLN_WASH_200BAR']);
  const [cleaningResponsibleParty, setCleaningResponsibleParty] = useState<'O' | 'U' | 'T'>('U');
  const [cleaningEstimatedCost, setCleaningEstimatedCost] = useState<number>(0);

  // Helper to calculate price of a cleaning tariff for current container size & type
  const getTariffCost = (tariff: CleaningTariffMasterItem): number => {
    const exact = tariff.priceByContainerType?.[sizeType];
    if (exact && exact > 0) return exact;
    if (isReefer) {
      if (sizeType.includes('20')) return tariff.price20RF;
      return tariff.price40HR;
    }
    if (sizeType.includes('20')) return tariff.price20DC;
    if (sizeType.includes('45')) return tariff.price45HC;
    if (sizeType.includes('HC')) return tariff.price40HC;
    return tariff.price40DC;
  };

  // Re-calculate cost whenever sizeType, isReefer, or selectedCleaningCodes change
  useEffect(() => {
    if (condition === 'CL') {
      const sum = selectedCleaningCodes.reduce((total, code) => {
        const item = cleaningTariffs.find((t) => t.cleaningCode === code);
        return total + (item ? getTariffCost(item) : 0);
      }, 0);
      setCleaningEstimatedCost(sum);
    }
  }, [selectedCleaningCodes, sizeType, isReefer, condition, cleaningTariffs]);

  // Thuế suất hiệu dụng theo VAT % của từng dịch vụ đã chọn trong biểu phí (trước đây gõ cứng 8%).
  const cleaningVatRate = (() => {
    let base = 0;
    let vat = 0;
    for (const code of selectedCleaningCodes) {
      const item = cleaningTariffs.find((t) => t.cleaningCode === code);
      if (!item) continue;
      const price = getTariffCost(item);
      base += price;
      vat += (price * (item.vatPercent || 0)) / 100;
    }
    return base > 0 ? vat / base : 0;
  })();

  // Reefer Specs
  const [reeferBrand, setReeferBrand] = useState<'CARRIER' | 'THERMO_KING' | 'DAIKIN' | 'STAR_COOL'>('CARRIER');
  const [reeferModel] = useState<string>('');
  const [setTemperature, setSetTemperature] = useState<number>(-18);
  const [ptiStatus, setPtiStatus] = useState<'PASSED' | 'PENDING' | 'FAILED' | 'NOT_REQUIRED'>('PENDING');
  const [compressorHours, setCompressorHours] = useState<number>(0);
  const [humidityPercent] = useState<number>(0);
  const [ventilationCmh] = useState<number>(0);

  // Checklist & Damages & Photos
  // Checklist mẫu từ danh mục SURVEY_CHECKLIST (DB); điền vào khi tải xong nếu người dùng chưa đánh giá gì.
  const checklistTemplate = useSurveyChecklistTemplate();
  const [checklist, setChecklist] = useState<typeof checklistTemplate>([]);
  useEffect(() => {
    if (checklistTemplate.length > 0) setChecklist((prev) => (prev.length > 0 ? prev : checklistTemplate.map((c) => ({ ...c }))));
  }, [checklistTemplate]);
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [photos, setPhotos] = useState<SurveyPhoto[]>([]);
  const [remarks, setRemarks] = useState<string>('');
  const [actionRequired, setActionRequired] = useState<'' | 'AVAILABLE_FOR_DISPATCH' | 'SEND_TO_WASHING' | 'SEND_TO_REPAIR' | 'HOLD_FOR_SURVEYOR_REVIEW'>('');

  // Quick Damage Entry in Modal
  const [dmgLocation, setDmgLocation] = useState<string>('');
  const [dmgCode, setDmgCode] = useState<string>('');
  // Mã 'RP_STR_PANEL' (Straighten Corrugation) — 'RP_STRAIGHT' không tồn tại trong INITIAL_REPAIR_CODES
  // nên dropdown "Phương Án Sửa Chữa" hiển thị lệch với state ngay từ lần render đầu tiên.
  const [dmgRepair, setDmgRepair] = useState<string>('');
  const [dmgSeverity, setDmgSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [dmgLength, setDmgLength] = useState<string>('');
  const [dmgWidth, setDmgWidth] = useState<string>('');
  const [dmgQty] = useState<string>('1');
  const [dmgNote, setDmgNote] = useState<string>('');

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  // ISO Check calculation state
  const validationResult = validateContainerNumber(containerNo);

  // Synchronize when sizeType changes
  const handleSizeTypeChange = (selectedSize: string) => {
    setSizeType(selectedSize);
    const type = containerTypeOptions.find((t) => t.typeCode === selectedSize);
    if (type) {
      setIsoCode(type.isoCode);
      setContainerTypeName(type.name || type.vietnameseName);
      setIsReefer(type.isReefer);
      setTareWeightKg(type.tareWeightKg);
      setPayloadKg(type.maxPayloadKg);
      setFloorType(type.floorType);
      setMaterial(type.material);
    }
  };



  // Add Damage Record
  const handleAddInlineDamage = () => {
    const locItem = locations.find((l) => l.code === dmgLocation);
    const codeItem = damageCodes.find((d) => d.code === dmgCode);
    const repItem = repairCodes.find((r) => r.repairCode === dmgRepair);
    // Chỉ nhận mã có trong danh mục DB — trước đây chọn sẵn mã gõ cứng (RIGHT_W/DENT/RP_STR_PANEL) nên vẫn thêm
    // được hư hỏng với mã không tồn tại trong DM Vị Trí / Mã Hư Hỏng / Phương Án Sửa Chữa.
    if (!locItem || !codeItem || !repItem) {
      setValidationError('Chọn đủ Vị Trí Cấu Kiện, Mã Hư Hỏng và Phương Án Sửa Chữa từ danh mục trước khi thêm tổn thất.');
      return;
    }
    setValidationError(null);

    const newRecord: DamageRecord = {
      id: 'DMG-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      locationCode: dmgLocation,
      locationName: locItem ? locItem.vietnameseName : dmgLocation,
      damageCode: dmgCode,
      damageName: codeItem ? codeItem.vietnameseName : dmgCode,
      repairCode: dmgRepair,
      repairName: repItem ? repItem.vietnameseName : dmgRepair,
      description: dmgNote || `${codeItem?.vietnameseName || dmgCode} tại ${locItem?.vietnameseName || dmgLocation}`,
      severity: dmgSeverity,
      lengthMm: parseFloat(dmgLength) || 0,
      widthMm: parseFloat(dmgWidth) || 0,
      quantity: parseInt(dmgQty, 10) || 1,
      createdBy: surveyor,
      createdAt: new Date().toISOString().substring(0, 16).replace('T', ' ')
    };

    setDamages((prev) => [...prev, newRecord]);
    setCondition('DM');
    setActionRequired('SEND_TO_REPAIR');
    setDmgNote('');
  };

  // Remove damage
  const handleRemoveDamage = (id: string) => {
    setDamages((prev) => prev.filter((d) => d.id !== id));
  };

  // Khu vực có hư hỏng tự "Không Đạt" theo danh mục Vị trí (checklistZone) — server cũng chặn khu vực có hư hỏng mà Đạt.
  useEffect(() => {
    if (locations.length === 0) return;
    setChecklist((prev) => recomputeChecklistFromDamages(prev, damages, locations));
  }, [damages, locations, checklistTemplate]);

  // Toggle checklist status
  const handleToggleChecklist = (zoneKey: InspectionZoneKey, status: ZoneCheckStatus) => {
    setChecklist((prev) =>
      prev.map((item) => (item.zoneKey === zoneKey ? { ...item, status } : item))
    );
  };

  // Save submission
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (targetStatus: SurveyStatus, openImmediately = false) => {
    if (isSaving) return;
    if (!containerNo.trim()) {
      setValidationError('Vui lòng nhập Số Container!');
      setActiveTab('CONTAINER');
      return;
    }
    // Container được Tiếp Nhận Cổng ngay khi lưu — kiểm tra đủ dữ liệu Gate-In trước, thay vì để backend
    // từ chối rồi mất công nhập lại.
    const missing =
      !(validationResult.isValidFormat && validationResult.isCheckDigitCorrect) ? ['CONTAINER', validationResult.message || 'Số container không hợp lệ (ISO 6346).'] :
      !shippingLine ? ['CONTAINER', 'Chọn Hãng Tàu.'] :
      !sizeType ? ['CONTAINER', 'Chọn Kích Cỡ / Quy Cách container.'] :
      !(tareWeightKg > 0) ? ['CONTAINER', 'Nhập Tare Weight (kg) — loại container này chưa khai báo trọng lượng trong DM Loại Container.'] :
      !(payloadKg > 0) ? ['CONTAINER', 'Nhập Max Payload (kg) — loại container này chưa khai báo trọng lượng trong DM Loại Container.'] :
      !truckPlate.trim() ? ['OPERATION', 'Nhập Biển Số Xe đầu kéo.'] :
      !driverName.trim() ? ['OPERATION', 'Nhập Họ Tên Tài Xế.'] :
      !driverPhone.trim() ? ['OPERATION', 'Nhập Số Điện Thoại Tài Xế.'] : null;
    if (missing) {
      setValidationError(missing[1]);
      setActiveTab(missing[0] as typeof activeTab);
      return;
    }
    if (!standard) {
      setValidationError('Chọn Tiêu Chuẩn Giám Định Áp Dụng.');
      setActiveTab('GRADING');
      return;
    }
    if (!condition) {
      setValidationError('Chọn Đánh Giá Phân Loại Tình Trạng Ban Đầu (AV / CL / DM).');
      setActiveTab('GRADING');
      return;
    }

    const cleanCont = containerNo.trim().toUpperCase();

    const newRecord: SurveyItemRecord = {
      id: 'SURV-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      surveyNo: `SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      containerNo: cleanCont,
      isoCode,
      size: sizeType,
      type: containerTypeName,
      // Chủ vỏ = hãng tàu quản lý (form không còn ô nhập riêng, giống Tiếp Nhận Cổng).
      owner: shippingLineOptions.find((l) => l.code === shippingLine)?.name || '',
      shippingLine,
      isReefer,
      gateInTime: surveyDate,
      surveyDate,
      surveyor,
      shift,
      status: targetStatus,
      standard,
      standardNotes,
      condition,

      // Physical specs
      tareWeightKg,
      maxGrossWeightKg: tareWeightKg + payloadKg,
      payloadKg,
      material,
      floorType,

      // Operations
      truckPlate,
      trailerPlate,
      driverName,
      driverPhone,
      driverLicense,
      sealNo,
      customsSealNo,
      cargoStatus,

      // Reefer
      ...(isReefer
        ? {
            reeferBrand,
            reeferModel,
            setTemperature,
            ptiStatus,
            compressorHours,
            humidityPercent,
            ventilationCmh
          }
        : {}),

      // Grading details
      // Hạng lưu theo lựa chọn thật (trước chỉ gửi khi AV nên chọn hạng C/D cho cont hư hỏng bị mất).
      ...(qualityGrade ? { qualityGrade } : {}),
      ...(condition === 'CL'
        ? {
            cleaningReason: cleaningReasons,
            cleaningMethod,
            cleaningRemarks,
            cleaningEstimatedCost,
            cleaningTotalCost: cleaningEstimatedCost,
            cleaningItems: selectedCleaningCodes.map((code) => {
              const tariff = cleaningTariffs.find((t) => t.cleaningCode === code);
              const unitPrice = tariff ? getTariffCost(tariff) : 0;
              return {
                id: 'CLN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                cleaningCode: code,
                cleaningName: tariff?.vietnameseName || tariff?.name || code,
                category: tariff?.category || 'WATER_PRESSURE',
                chemicalRequired: !!tariff?.chemicalRequired,
                chemicalName: tariff?.chemicalRequired || undefined,
                quantity: 1,
                unitPrice,
                totalPrice: unitPrice,
                responsibleParty: cleaningResponsibleParty,
                status: 'REQUIRED' as const,
                notes: cleaningRemarks
              };
            })
          }
        : {}),

      // Damages & Checklist & Photos
      damages,
      checklist,
      photos,
      remarks,
      ...(actionRequired ? { actionRequired } : {})
    };

    setIsSaving(true);
    setValidationError(null);
    try {
      const ok = await onSaveSurvey(newRecord, openImmediately);
      if (ok === false) {
        setValidationError('Chưa lưu được — xem thông báo lỗi, sửa lại rồi bấm lưu lần nữa.');
        return;
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 tracking-wide">
                  Thêm Mới Phiếu Giám Định Container
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập đầy đủ thông số vỏ, phương tiện giao nhận, tiêu chuẩn IICL, phân loại AV/CL/DM, tổn thất và ảnh hiện trường.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto select-none">
          {[
            { id: 'CONTAINER', label: '1. Thông Số Vỏ & Hãng Tàu', icon: Boxes },
            { id: 'OPERATION', label: '2. Vận Hành & Phương Tiện', icon: Truck },
            { id: 'GRADING', label: '3. Tiêu Chuẩn & Đánh Giá', icon: ShieldCheck },
            { id: 'DAMAGES_PHOTOS', label: '4. Tổn Thất, Checklist & Ảnh', icon: Camera }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 font-semibold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'DAMAGES_PHOTOS' && damages.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold">
                    {damages.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Form Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {validationError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* TAB 1: CONTAINER SPECS */}
          {activeTab === 'CONTAINER' && (
            // Cùng bộ ô với "1. Thông Tin Vỏ Container" ở Tiếp Nhận Cổng — lưu là tạo luôn hồ sơ Gate-In.
            <div className="space-y-4">
              {/* Số container + nhãn ISO + kiểm tra check digit */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Số Container (ISO 6346)*</span>
                    <span className="text-[10px] text-rose-400 font-mono">Bắt buộc</span>
                  </label>
                  {containerNo.trim().length === 11 && (
                    validationResult.isCheckDigitCorrect ? (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">✓ Check Digit Valid</span>
                    ) : (
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">✗ Sai Check Digit</span>
                    )
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={containerNo}
                    onChange={(e) => {
                      setContainerNo(e.target.value.toUpperCase());
                      setValidationError(null);
                    }}
                    placeholder="VD: MSCU7729104"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base sm:text-lg font-mono font-black text-slate-900 focus:outline-none focus:border-blue-500 tracking-widest uppercase shadow-sm"
                  />
                  {isoCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="px-2 py-0.5 text-[11px] font-bold font-mono bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {isoCode}
                      </span>
                    </div>
                  )}
                </div>
                {containerNo.length >= 4 && !validationResult.isValidFormat && (
                  <p className="mt-1.5 text-[11px] text-slate-500">{validationResult.message}</p>
                )}
              </div>

              {/* Loại container — nút chọn nhanh từ DM Loại Container */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kích Thước &amp; Loại Container*</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {containerTypeOptions.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      title={`${t.typeCode} • ISO ${t.isoCode} • ${t.name || t.vietnameseName}`}
                      onClick={() => handleSizeTypeChange(t.typeCode)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer border ${
                        sizeType === t.typeCode
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-black text-sm">{t.typeCode}</div>
                      <div className="text-[10px] opacity-80 truncate">{t.name || t.vietnameseName}</div>
                    </button>
                  ))}
                </div>
                {/* Trọng lượng vỏ: điền sẵn theo DM Loại Container, sửa được theo số in trên cửa container. */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tare Weight (kg)*</label>
                    <input
                      type="number"
                      min={0}
                      value={tareWeightKg || ''}
                      onChange={(e) => setTareWeightKg(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 text-xs font-mono text-slate-900 rounded-xl focus:outline-none focus:border-sky-500 min-h-[40px] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Payload (kg)*</label>
                    <input
                      type="number"
                      min={0}
                      value={payloadKg || ''}
                      onChange={(e) => setPayloadKg(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 text-xs font-mono text-slate-900 rounded-xl focus:outline-none focus:border-sky-500 min-h-[40px] shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Hãng tàu + Số seal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hãng Tàu Quản Lý (Shipping Line)*</label>
                  <select
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl font-bold focus:outline-none focus:border-blue-500 min-h-[42px] shadow-sm"
                  >
                    <option value="">-- Chọn hãng tàu --</option>
                    {shippingLineOptions.map((l) => (
                      <option key={l.code} value={l.code}>{l.code} - {l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Số Niêm Phong Lúc Hạ (Seal No.)</label>
                  <input
                    type="text"
                    value={sealNo}
                    onChange={(e) => setSealNo(e.target.value)}
                    placeholder="ML-SEAL-88912"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl font-mono focus:border-blue-500 focus:outline-none min-h-[42px] shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATION & LOGISTICS */}
          {activeTab === 'OPERATION' && (
            <div className="space-y-4">
              {/* Các ô Loại nghiệp vụ / Số phiếu / Thời gian giám định / Thời gian Gate-In / Giám định viên trước đây
                  đều không được lưu: backend tự ghi giờ Gate-In + giờ giám định, lấy giám định viên theo tài khoản đăng nhập. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Giám Định Viên</label>
                  <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 min-h-[42px]">{surveyor || '—'}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ca Trực Hiện Trường</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 cursor-pointer"
                  >
                    <option value="Ca 1 (06:00 - 14:00)">Ca 1 (06:00 - 14:00)</option>
                    <option value="Ca 2 (14:00 - 22:00)">Ca 2 (14:00 - 22:00)</option>
                    <option value="Ca 3 / Ca Đêm (22:00 - 06:00)">Ca 3 / Ca Đêm (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              {/* Truck & Driver Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Phương Tiện Vận Chuyển &amp; Tài Xế Giao Nhận</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Biển Số Xe Đầu Kéo</label>
                    <input
                      type="text"
                      value={truckPlate}
                      onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                      placeholder="VD: 51C-982.34"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Biển Số Rơ-moóc</label>
                    <input
                      type="text"
                      value={trailerPlate}
                      onChange={(e) => setTrailerPlate(e.target.value.toUpperCase())}
                      placeholder="VD: 51R-089.12"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Tên Tài Xế</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Họ và tên tài xế"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">SĐT Tài Xế</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="0908..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                </div>

                {/* Không có ô vị trí bãi: lúc giám định container đang đậu ở khu giám định, vị trí bãi do xe nâng
                    ghi nhận khi hạ bãi sau giám định. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Trạng Thái Hàng Hóa</label>
                    <select
                      value={cargoStatus}
                      onChange={(e) => setCargoStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="EMPTY">Vỏ Rỗng (Empty Container)</option>
                      <option value="FULL_IMPORT">Hàng Nhập Khẩu (Full Import)</option>
                      <option value="FULL_EXPORT">Hàng Xuất Khẩu (Full Export)</option>
                      <option value="LCL">Hàng Ghép LCL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Số Seal Hải Quan</label>
                    <input
                      type="text"
                      value={customsSealNo}
                      onChange={(e) => setCustomsSealNo(e.target.value)}
                      placeholder="VN-CUST-4412"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRADING & STANDARDS */}
          {activeTab === 'GRADING' && (
            <div className="space-y-5">
              {/* Standard Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Tiêu Chuẩn Giám Định Áp Dụng*</label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Chọn tiêu chuẩn --</option>
                    {activeStandards.map((st) => (
                      <option key={st.id} value={st.standardCode}>
                        {st.standardName}{!st.standardName.includes(st.standardCode) ? ` (${st.standardCode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ghi Chú Hạn Mức Tiêu Chuẩn</label>
                  <input
                    type="text"
                    value={standardNotes}
                    onChange={(e) => setStandardNotes(e.target.value)}
                    placeholder="Ghi chú dung sai / hạn mức áp dụng..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
              </div>

              {/* Phân loại tình trạng: 3 giá trị cố định mà backend nhận (AV→A, CL→B, DM→C) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Đánh Giá Phân Loại Tình Trạng Ban Đầu (Condition)*
                </label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'AV', label: 'AV · Đạt chuẩn', action: 'AVAILABLE_FOR_DISPATCH', on: 'bg-emerald-600 border-emerald-600 text-white' },
                    { id: 'CL', label: 'CL · Cần vệ sinh', action: 'SEND_TO_WASHING', on: 'bg-amber-500 border-amber-500 text-white' },
                    { id: 'DM', label: 'DM · Hư hỏng', action: 'SEND_TO_REPAIR', on: 'bg-rose-600 border-rose-600 text-white' }
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setCondition(opt.id);
                        setActionRequired(opt.action);
                        setValidationError(null);
                      }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        condition === opt.id ? opt.on : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${condition === opt.id ? 'bg-white' : 'bg-slate-300'}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hạng chất lượng — lấy từ DM Hạng (Grade), chọn thêm nếu cần */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Hạng Chất Lượng (Grade)</label>
                {activeGrades.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có hạng nào trong DM Hạng.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeGrades.map((grade) => {
                      const isSelected = qualityGrade === grade.gradeCode;
                      return (
                        <button
                          key={grade.id}
                          type="button"
                          title={grade.description || grade.gradeCode}
                          onClick={() => setQualityGrade(isSelected ? '' : grade.gradeCode)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                          {grade.gradeName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Conditional Sub-panels */}

              {/* IF CL: Cleaning Reasons & Master Tariffs with Direct Pricing */}
              {condition === 'CL' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <h4 className="font-bold text-amber-700 flex items-center gap-2 text-sm">
                      <Droplets className="w-4 h-4 text-cyan-700" />
                      <span>Chọn Danh Mục Vệ Sinh &amp; Bảng Giá Tự Động (Cleaning Master Tariff)</span>
                    </h4>
                    <span className="text-[11px] text-amber-800/80">
                      Đơn giá tự động khớp theo kích cỡ <span className="font-bold text-sky-700">{sizeType}</span> ({isReefer ? 'Cont Lạnh' : 'Cont Khô'})
                    </span>
                  </div>

                  {/* Lý do vệ sinh */}
                  <div>
                    <label className="block text-[11px] text-slate-700 font-semibold mb-1.5">
                      1. Hiện Trạng / Lý Do Cần Vệ Sinh
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'DUST', label: 'Bụi Bẩn Bám Vách / Sàn' },
                        { id: 'OIL_GREASE', label: 'Dầu Nhớt / Mỡ Bôi Trơn' },
                        { id: 'CHEMICAL_SMELL', label: 'Mùi Hôi Hóa Chất Nồng' },
                        { id: 'CARGO_RESIDUE', label: 'Dư Lượng Hàng Cũ Bám Dính' },
                        { id: 'TRASH_DUNNAGE', label: 'Rác Thải / Gỗ Chèn Lót' },
                        { id: 'FLOOR_DIRTY', label: 'Sàn Dơ / Ẩm Ướt Đọng Nước' }
                      ].map((item) => {
                        const isSelected = cleaningReasons.includes(item.id as any);
                        return (
                          <label
                            key={item.id}
                            className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer text-xs transition ${
                              isSelected
                                ? 'bg-amber-100 border-amber-500 text-amber-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCleaningReasons([...cleaningReasons, item.id as any]);
                                } else {
                                  setCleaningReasons(cleaningReasons.filter((r) => r !== item.id));
                                }
                              }}
                              className="accent-amber-500 rounded cursor-pointer"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Master Tariff Selection Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-slate-700 font-bold">
                        2. Chọn Các Hạng Mục Dịch Vụ Vệ Sinh (Kèm Đơn Giá Master Data)
                      </label>
                      <span className="text-[11px] text-cyan-700 font-mono font-semibold">
                        Đã chọn: {selectedCleaningCodes.length} dịch vụ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {cleaningTariffs.filter((t) => t.status === 'ACTIVE').map((tariff) => {
                        const isSelected = selectedCleaningCodes.includes(tariff.cleaningCode);
                        const price = getTariffCost(tariff);
                        return (
                          <div
                            key={tariff.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCleaningCodes(selectedCleaningCodes.filter((c) => c !== tariff.cleaningCode));
                              } else {
                                setSelectedCleaningCodes([...selectedCleaningCodes, tariff.cleaningCode]);
                              }
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-amber-100 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <div className="mt-0.5">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-amber-700 flex-shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[11px] text-cyan-700">
                                    {tariff.cleaningCode}
                                  </span>
                                  {tariff.chemicalRequired && (
                                    <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-700 rounded text-[9px] font-semibold">
                                      {tariff.chemicalRequired}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                                  {tariff.vietnameseName || tariff.name}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Thời gian: {tariff.estimatedDurationMin} phút {tariff.equipmentUsed ? `• Dụng cụ: ${tariff.equipmentUsed}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-mono font-bold text-amber-700">
                                {price.toLocaleString('vi-VN')} đ
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">
                                /{sizeType}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Responsible Party & Cost Calculation Summary */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                        Bên Chịu Phí Vệ Sinh
                      </label>
                      <div className="flex items-center gap-2">
                        {[
                          { id: 'U', label: 'Khách Hàng (User)' },
                          { id: 'O', label: 'Hãng Tàu (Owner)' },
                          { id: 'T', label: 'Nhà Xe (Trucker)' }
                        ].map((party) => (
                          <button
                            key={party.id}
                            type="button"
                            onClick={() => setCleaningResponsibleParty(party.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              cleaningResponsibleParty === party.id
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-white text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            {party.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                        Tổng Chi Phí Ước Tính (Chưa VAT)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={cleaningEstimatedCost}
                          onChange={(e) => setCleaningEstimatedCost(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-amber-700 font-mono font-bold text-xs"
                        />
                        <span className="text-xs text-slate-500 font-semibold">VNĐ</span>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                      <div className="text-[11px] text-slate-500">
                        Tổng thanh toán (VAT {Math.round(cleaningVatRate * 1000) / 10}% theo biểu phí):
                      </div>
                      <div className="text-base font-mono font-black text-emerald-700">
                        {Math.round(cleaningEstimatedCost * (1 + cleaningVatRate)).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Ghi Chú Vệ Sinh Hiện Trường</label>
                    <input
                      type="text"
                      value={cleaningRemarks}
                      onChange={(e) => setCleaningRemarks(e.target.value)}
                      placeholder="Mô tả vị trí bám bẩn trên sàn/vách hoặc hướng dẫn riêng cho đội xịt rửa..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* IF REEFER: Machinery specs */}
              {isReefer && (
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl space-y-3">
                  <h4 className="font-bold text-cyan-700 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    <span>Thông Số Kiểm Tra Cụm Máy Lạnh (Reefer Machinery Inspection)</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Hãng Máy Lạnh</label>
                      <select
                        value={reeferBrand}
                        onChange={(e) => setReeferBrand(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                      >
                        <option value="CARRIER">Carrier Transicold</option>
                        <option value="THERMO_KING">Thermo King</option>
                        <option value="DAIKIN">Daikin Reefer</option>
                        <option value="STAR_COOL">Star Cool (Maersk)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Nhiệt Độ Cài Đặt (°C)</label>
                      <input
                        type="number"
                        value={setTemperature}
                        onChange={(e) => setSetTemperature(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-cyan-700 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Kết Quả Kiểm Tra PTI</label>
                      <select
                        value={ptiStatus}
                        onChange={(e) => setPtiStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                      >
                        <option value="PASSED">Passed (Đạt Chuẩn Lạnh)</option>
                        <option value="PENDING">Pending (Chờ Cắm Điện Test)</option>
                        <option value="FAILED">Failed (Lỗi Cần Sửa Chữa)</option>
                        <option value="NOT_REQUIRED">Not Required</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Số Giờ Chạy Máy Nén</label>
                      <input
                        type="number"
                        value={compressorHours}
                        onChange={(e) => setCompressorHours(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Next Action Recommendation */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Hướng Xử Lý Tiếp Theo (Next Action)</label>
                <select
                  value={actionRequired}
                  onChange={(e) => setActionRequired(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">-- Tự theo phân loại tình trạng --</option>
                  <option value="AVAILABLE_FOR_DISPATCH">Sẵn Sàng Cấp Phát Đóng Hàng (Available for Dispatch)</option>
                  <option value="SEND_TO_WASHING">Chuyển Khu Vực Rửa &amp; Vệ Sinh (Send to Washing)</option>
                  <option value="SEND_TO_REPAIR">Chuyển Xưởng Sửa Chữa M&amp;R (Send to Repair Shop)</option>
                  <option value="HOLD_FOR_SURVEYOR_REVIEW">Tạm Giữ Chờ Hãng Tàu Giám Định Lại (Hold for Review)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: DAMAGES, CHECKLIST & PHOTOS */}
          {activeTab === 'DAMAGES_PHOTOS' && (
            <div className="space-y-5">
              {/* Quick Inline Damage Entry */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-rose-400" />
                    <span>Ghi Nhận Tổn Thất Hiện Trường (Tùy chọn)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Đã ghi nhận {damages.length} vị trí hư hỏng
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Vị Trí Cấu Kiện</label>
                    <select
                      value={dmgLocation}
                      onChange={(e) => setDmgLocation(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="">-- Chọn vị trí --</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.code}>
                          {loc.code} - {loc.vietnameseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Mã Hư Hỏng IICL</label>
                    <select
                      value={dmgCode}
                      onChange={(e) => setDmgCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="">-- Chọn mã hư hỏng --</option>
                      {damageCodes.map((code) => (
                        <option key={code.id} value={code.code}>
                          {code.code} - {code.vietnameseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Phương Án Sửa Chữa</label>
                    <select
                      value={dmgRepair}
                      onChange={(e) => setDmgRepair(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="">-- Chọn phương án --</option>
                      {repairCodes.map((rep) => (
                        <option key={rep.id} value={rep.repairCode}>
                          {rep.repairCode} - {rep.vietnameseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Mức Độ Nghiêm Trọng</label>
                    <select
                      value={dmgSeverity}
                      onChange={(e) => setDmgSeverity(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                    >
                      <option value="LOW">Thấp (Low)</option>
                      <option value="MEDIUM">Trung bình (Medium)</option>
                      <option value="HIGH">Nặng (High)</option>
                      <option value="CRITICAL">Nguy hiểm (Critical)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Dài (mm)</label>
                    <input
                      type="number"
                      value={dmgLength}
                      onChange={(e) => setDmgLength(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Rộng (mm)</label>
                    <input
                      type="number"
                      value={dmgWidth}
                      onChange={(e) => setDmgWidth(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">Ghi Chú Tổn Thất</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dmgNote}
                        onChange={(e) => setDmgNote(e.target.value)}
                        placeholder="Mô tả vị trí tổn thất..."
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddInlineDamage}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Hư Hỏng</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Damage List Table */}
                {damages.length > 0 && (
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-white text-slate-500 uppercase text-[10px]">
                          <th className="p-2">Vị Trí</th>
                          <th className="p-2">Mã Hư Hỏng</th>
                          <th className="p-2">Phương Án Sửa</th>
                          <th className="p-2">Kích Thước (mm)</th>
                          <th className="p-2">Mức Độ</th>
                          <th className="p-2 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {damages.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-100">
                            <td className="p-2 font-mono font-bold text-amber-400">{d.locationName}</td>
                            <td className="p-2 text-slate-900">{d.damageName}</td>
                            <td className="p-2 text-blue-700">{d.repairName}</td>
                            <td className="p-2 font-mono text-slate-700">
                              {d.lengthMm} x {d.widthMm}
                            </td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-700 rounded font-bold text-[10px]">
                                {d.severity}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveDamage(d.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Checklist 9 Zones */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Checklist Kiểm Tra {checklist.length} Khu Vực Cấu Kiện</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Đánh dấu Pass / Fail / NA</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {checklist.map((item) => (
                    <div
                      key={item.zoneKey}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-xs text-slate-700 truncate">
                        {item.zoneName}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleChecklist(item.zoneKey, 'PASS')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            item.status === 'PASS'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleToggleChecklist(item.zoneKey, 'FAIL');
                            setCondition('DM');
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            item.status === 'FAIL'
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos Attachment */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
                  <div>
                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-sky-400" />
                      <span>Hình Ảnh Hiện Trường Đính Kèm ({photos.length} ảnh)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Quy chuẩn IICL: Tối thiểu 01 ảnh toàn cảnh + 01 ảnh chi tiết vị trí hư hỏng/bẩn kèm thời gian ghi nhận (Timestamp).
                    </p>
                  </div>
                </div>

                {photos.length === 0 ? (
                  <div className="py-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 space-y-1">
                    <Camera className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-semibold">Chưa có ảnh đính kèm</p>
                    <p className="text-[11px] text-slate-500">
                      Ảnh hiện trường được chụp & tải lên thật ở bước Giám Định chi tiết sau khi tạo phiếu (cần có hồ sơ container thật để lưu ảnh).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((ph) => (
                      <div
                        key={ph.id}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md"
                      >
                        <div className="relative">
                          <img
                            src={ph.url}
                            alt={ph.caption}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[8px] font-mono text-amber-700 rounded flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{ph.uploadedAt || surveyDate}</span>
                          </div>
                        </div>
                        <div className="p-1.5 text-[10px] text-slate-700 truncate">
                          {ph.caption}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((p) => p.id !== ph.id))}
                          className="absolute top-1 right-1 p-1 bg-slate-50 text-rose-400 rounded-md hover:bg-rose-600 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* General Remarks */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Ghi Chú Tổng Hợp &amp; Kết Luận Giám Định</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Ghi nhận các đặc điểm bất thường hoặc lưu ý khác..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="font-bold text-slate-900">{containerNo || '(Chưa nhập số vỏ)'}</span>
            {shippingLine && (
              <>
                <span>•</span>
                <span className="text-amber-700 font-semibold">{shippingLine}</span>
              </>
            )}
            {sizeType && (
              <>
                <span>•</span>
                <span className="text-sky-700 font-semibold">{sizeType}</span>
              </>
            )}
            <span>•</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                condition === 'AV'
                  ? 'bg-emerald-500/20 text-emerald-700'
                  : condition === 'CL'
                  ? 'bg-amber-500/20 text-amber-700'
                  : condition === 'DM'
                  ? 'bg-rose-500/20 text-rose-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {condition || 'Chưa phân loại'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={() => handleSave('NEW', false)}
              disabled={isSaving}
              className="disabled:opacity-50 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-amber-400 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Lưu Chờ Giám Định
            </button>

            <button
              type="button"
              onClick={() => handleSave('IN_PROGRESS', true)}
              disabled={isSaving}
              className="disabled:opacity-50 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Lưu &amp; Mở Giám Định Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
