import React, { useState, useEffect } from 'react';
import {
  SurveyItemRecord,
  SurveyType,
  SurveyStatus,
  ContainerConditionGrade,
  QualityGradeType,
  CleaningReasonType,
  CleaningMethodType,
  CleaningTariffMasterItem,
  SurveyCleaningItemRecord,
  InspectionZoneKey,
  ZoneCheckStatus,
  DamageRecord,
  SurveyPhoto,
  DamageLocationMasterItem,
  DamageCodeMasterItem,
  RepairCodeMasterItem,
  GradeMasterItem
} from '../types';
import {
  validateContainerNumber,
  CONTAINER_TYPE_PRESETS,
  calculateIsoCheckDigit
} from '../utils/containerValidator';
import { INITIAL_CHECKLIST_TEMPLATE } from '../mockData';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Sparkles,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  Truck,
  Ship,
  Calendar,
  User,
  MapPin,
  FileText,
  Boxes,
  Thermometer,
  Layers,
  Zap,
  Info,
  Check,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkle,
  Droplets,
  DollarSign,
  Flame,
  CheckSquare,
  Square
} from 'lucide-react';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSurvey: (newSurvey: SurveyItemRecord, openImmediately?: boolean) => void;
  locations: DamageLocationMasterItem[];
  damageCodes: DamageCodeMasterItem[];
  repairCodes: RepairCodeMasterItem[];
  grades: GradeMasterItem[];
  cleaningTariffs: CleaningTariffMasterItem[];
  currentUser?: string;
  initialContainerNo?: string;
  initialShippingLine?: string;
  initialSize?: string;
  initialIsPreSurvey?: boolean;
}

export const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  isOpen,
  onClose,
  onSaveSurvey,
  locations,
  damageCodes,
  repairCodes,
  grades,
  cleaningTariffs,
  currentUser = 'Lê Hoàng Nam (SV-04)',
  initialContainerNo = '',
  initialShippingLine = 'MAERSK',
  initialSize = '40HC',
  initialIsPreSurvey = false
}) => {
  // Active wizard / section tab
  const [activeTab, setActiveTab] = useState<'CONTAINER' | 'OPERATION' | 'GRADING' | 'DAMAGES_PHOTOS'>('CONTAINER');

  // Form State
  const [surveyType, setSurveyType] = useState<SurveyType>(initialIsPreSurvey ? 'PRE_SURVEY' : 'GATE_IN');
  const [surveyNo, setSurveyNo] = useState<string>(() => `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [containerNo, setContainerNo] = useState<string>(initialContainerNo);
  const [shippingLine, setShippingLine] = useState<string>(initialShippingLine);
  const [owner, setOwner] = useState<string>('MAERSK A/S Denmark');
  const [sizeType, setSizeType] = useState<string>(initialSize);
  const [isoCode, setIsoCode] = useState<string>('45G1');
  const [containerTypeName, setContainerTypeName] = useState<string>('Dry High Cube');
  const [isReefer, setIsReefer] = useState<boolean>(false);
  const [manufactureYearMonth, setManufactureYearMonth] = useState<string>('08/2021');
  const [tareWeightKg, setTareWeightKg] = useState<number>(3900);
  const [maxGrossWeightKg, setMaxGrossWeightKg] = useState<number>(32500);
  const [payloadKg, setPayloadKg] = useState<number>(28600);
  const [material, setMaterial] = useState<string>('Thép Corten Steel chống ăn mòn');
  const [floorType, setFloorType] = useState<string>('Gỗ dán Plywood (28mm)');
  const [cscPlateNo, setCscPlateNo] = useState<string>('CSC-BV-2021-9876');

  // Operations & Logistics
  const [isPreSurvey, setIsPreSurvey] = useState<boolean>(initialIsPreSurvey);
  const [gateInTime, setGateInTime] = useState<string>(
    initialIsPreSurvey
      ? 'Chưa Gate-In (Đang chờ ngoài cổng)'
      : new Date().toISOString().substring(0, 16).replace('T', ' ')
  );
  const [surveyDate, setSurveyDate] = useState<string>(new Date().toISOString().substring(0, 16).replace('T', ' '));
  const [surveyor, setSurveyor] = useState<string>(currentUser);
  const [shift, setShift] = useState<string>('Ca 1 (06:00 - 14:00)');
  const [truckPlate, setTruckPlate] = useState<string>('51C-982.45');
  const [trailerPlate, setTrailerPlate] = useState<string>('51R-089.12');
  const [driverName, setDriverName] = useState<string>('Trần Văn Bình');
  const [driverPhone, setDriverPhone] = useState<string>('0908123456');
  const [driverLicense, setDriverLicense] = useState<string>('FC-79012345');
  const [yardLocation, setYardLocation] = useState<string>('B02-08-03-2');
  const [sealNo, setSealNo] = useState<string>('MSK-892104');
  const [customsSealNo, setCustomsSealNo] = useState<string>('VN-CUST-4412');
  const [cargoStatus, setCargoStatus] = useState<'EMPTY' | 'FULL_IMPORT' | 'FULL_EXPORT' | 'LCL'>('EMPTY');

  // Grading & Standards
  const [standard, setStandard] = useState<'IICL-6' | 'MCIC' | 'MRIC' | 'CARRIER_CUSTOM'>('IICL-6');
  const [standardNotes, setStandardNotes] = useState<string>('Áp dụng hạn mức IICL-6 tiêu chuẩn hãng tàu');
  const [condition, setCondition] = useState<ContainerConditionGrade>('AV');
  const [qualityGrade, setQualityGrade] = useState<QualityGradeType>('GRADE_A');
  // Thẻ Grade động lấy tên + mô tả trực tiếp từ Danh Mục Grade thật trong SQL — số thẻ AV/DM = số Grade
  // ACTIVE, không cố định. Xem giải thích đầy đủ ở SurveyDetailForm.tsx (chia theo vị trí sortOrder:
  // nửa đầu = AV, nửa sau = DM). CL không có Grade tương ứng nên giữ là 1 thẻ cố định riêng.
  const activeGrades = grades.filter((g) => g.status === 'ACTIVE').sort((a, b) => a.sortOrder - b.sortOrder);
  const gradeBucket = (index: number, total: number): 'AV' | 'DM' => (index < Math.ceil(total / 2) ? 'AV' : 'DM');
  const [cleaningReasons, setCleaningReasons] = useState<CleaningReasonType[]>(['DUST', 'FLOOR_DIRTY']);
  const [cleaningMethod, setCleaningMethod] = useState<CleaningMethodType>('WATER_PRESSURE');
  const [cleaningRemarks, setCleaningRemarks] = useState<string>('Bụi bám vách trong và vết đất dơ trên sàn sau trả hàng.');
  const [selectedCleaningCodes, setSelectedCleaningCodes] = useState<string[]>(['CLN_WASH_200BAR']);
  const [cleaningResponsibleParty, setCleaningResponsibleParty] = useState<'O' | 'U' | 'T'>('U');
  const [cleaningEstimatedCost, setCleaningEstimatedCost] = useState<number>(420000);

  // Helper to calculate price of a cleaning tariff for current container size & type
  const getTariffCost = (tariff: CleaningTariffMasterItem): number => {
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
      setCleaningEstimatedCost(sum > 0 ? sum : 250000);
    }
  }, [selectedCleaningCodes, sizeType, isReefer, condition, cleaningTariffs]);

  // Reefer Specs
  const [reeferBrand, setReeferBrand] = useState<'CARRIER' | 'THERMO_KING' | 'DAIKIN' | 'STAR_COOL'>('CARRIER');
  const [reeferModel, setReeferModel] = useState<string>('ThinLINE 69NT40');
  const [setTemperature, setSetTemperature] = useState<number>(-18);
  const [ptiStatus, setPtiStatus] = useState<'PASSED' | 'PENDING' | 'FAILED' | 'NOT_REQUIRED'>('PASSED');
  const [compressorHours, setCompressorHours] = useState<number>(12450);
  const [humidityPercent, setHumidityPercent] = useState<number>(85);
  const [ventilationCmh, setVentilationCmh] = useState<number>(15);

  // Checklist & Damages & Photos
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST_TEMPLATE.map((c) => ({ ...c })));
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [photos, setPhotos] = useState<SurveyPhoto[]>([]);
  const [remarks, setRemarks] = useState<string>('Container tiếp nhận nguyên vẹn, đáp ứng tiêu chuẩn kiểm định IICL.');
  const [actionRequired, setActionRequired] = useState<'AVAILABLE_FOR_DISPATCH' | 'SEND_TO_WASHING' | 'SEND_TO_REPAIR' | 'HOLD_FOR_SURVEYOR_REVIEW'>('AVAILABLE_FOR_DISPATCH');

  // Quick Damage Entry in Modal
  const [dmgLocation, setDmgLocation] = useState<string>('RIGHT_W');
  const [dmgCode, setDmgCode] = useState<string>('DENT');
  // Mã 'RP_STR_PANEL' (Straighten Corrugation) — 'RP_STRAIGHT' không tồn tại trong INITIAL_REPAIR_CODES
  // nên dropdown "Phương Án Sửa Chữa" hiển thị lệch với state ngay từ lần render đầu tiên.
  const [dmgRepair, setDmgRepair] = useState<string>('RP_STR_PANEL');
  const [dmgSeverity, setDmgSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [dmgLength, setDmgLength] = useState<string>('120');
  const [dmgWidth, setDmgWidth] = useState<string>('50');
  const [dmgQty, setDmgQty] = useState<string>('1');
  const [dmgNote, setDmgNote] = useState<string>('');

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);

  // ISO Check calculation state
  const validationResult = validateContainerNumber(containerNo);

  // Synchronize when sizeType changes
  const handleSizeTypeChange = (selectedSize: string) => {
    setSizeType(selectedSize);
    const preset = CONTAINER_TYPE_PRESETS[selectedSize];
    if (preset) {
      setIsoCode(preset.isoCode);
      setContainerTypeName(preset.type);
      setIsReefer(preset.isReefer);
      setTareWeightKg(preset.tareWeightKg);
      setMaxGrossWeightKg(preset.maxGrossWeightKg);
      setPayloadKg(preset.payloadKg);
      setFloorType(preset.floorType);
      setMaterial(preset.material);
    }
  };

  // Sync owner based on carrier
  const handleShippingLineChange = (line: string) => {
    setShippingLine(line);
    const ownerMap: Record<string, string> = {
      MAERSK: 'MAERSK A/S Denmark',
      MSC: 'Mediterranean Shipping Company S.A.',
      ONE: 'Ocean Network Express Pte. Ltd.',
      'CMA-CGM': 'CMA CGM Group France',
      COSCO: 'COSCO Shipping Lines Co., Ltd.',
      EVERGREEN: 'Evergreen Marine Corp.',
      'YANG-MING': 'Yang Ming Marine Transport',
      'HAPAG-LLOYD': 'Hapag-Lloyd AG Germany',
      'WAN-HAI': 'Wan Hai Lines Ltd.',
      ZIM: 'ZIM Integrated Shipping',
      SITC: 'SITC Container Lines',
      KMTC: 'Korea Marine Transport Co.'
    };
    if (ownerMap[line]) {
      setOwner(ownerMap[line]);
    }
    if (line === 'COSCO') {
      setStandard('MCIC');
    }
  };

  // Auto calculate payload when Gross or Tare changes
  const handleTareChange = (val: number) => {
    setTareWeightKg(val);
    setPayloadKg(Math.max(0, maxGrossWeightKg - val));
  };
  const handleGrossChange = (val: number) => {
    setMaxGrossWeightKg(val);
    setPayloadKg(Math.max(0, val - tareWeightKg));
  };

  // Preset autofills for quick testing
  const handleApplyPreset = (presetType: 'AV_FOOD' | 'CL_OIL' | 'DM_CUT' | 'RF_REEFER') => {
    if (presetType === 'AV_FOOD') {
      setContainerNo('MAEU1238904');
      setShippingLine('MAERSK');
      setOwner('MAERSK A/S Denmark');
      handleSizeTypeChange('40HC');
      setCondition('AV');
      setQualityGrade('FOOD_GRADE');
      setRemarks('Vỏ đạt tiêu chuẩn xuất xưởng Grade Food, sàn khô ráo sạch mùi, sẵn sàng cấp phát đóng hàng nông sản.');
      setActionRequired('AVAILABLE_FOR_DISPATCH');
      setDamages([]);
    } else if (presetType === 'CL_OIL') {
      setContainerNo('MSCU5566778');
      setShippingLine('MSC');
      setOwner('Mediterranean Shipping Company');
      handleSizeTypeChange('20DC');
      setCondition('CL');
      setCleaningReasons(['OIL_GREASE', 'CHEMICAL_SMELL']);
      setCleaningMethod('CHEMICAL_WASH');
      setCleaningRemarks('Sàn dính vệt dầu nhớt xe nâng diện tích 1.2m x 0.8m, mùi hôi nồng cần tẩy hóa chất.');
      setCleaningEstimatedCost(250000);
      setRemarks('Chuyển khu vực bồn rửa áp lực cao để xử lý tẩy dầu hóa chất trước khi hạ bãi AV.');
      setActionRequired('SEND_TO_WASHING');
      setDamages([]);
    } else if (presetType === 'DM_CUT') {
      setContainerNo('ONEY9081234');
      setShippingLine('ONE');
      setOwner('Ocean Network Express');
      handleSizeTypeChange('40HC');
      setCondition('DM');
      setRemarks('Phát hiện rách tôn vách hông phải và cong vênh xà nóc do va quẹt cẩu giàn. Cần lập báo giá sửa chữa.');
      setActionRequired('SEND_TO_REPAIR');
      
      const newDmg: DamageRecord = {
        id: 'DMG-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        locationCode: 'RIGHT_W',
        locationName: 'Vách hông phải (Right Side Wall)',
        damageCode: 'CUT',
        damageName: 'Rách / Thủng tôn (Cut/Tear)',
        repairCode: 'RP_PATCH_S', // Mã đúng trong INITIAL_REPAIR_CODES — 'RP_PATCH' không tồn tại, sẽ khiến báo giá EMR không tra được đơn giá nhân công/vật tư của mã sửa chữa này.
        repairName: 'Vá tôn theo chuẩn IICL (Patch)',
        description: 'Vết rách dài 180mm trên sóng tôn thứ 4 vách phải',
        severity: 'HIGH',
        lengthMm: 180,
        widthMm: 45,
        quantity: 1,
        createdBy: surveyor,
        createdAt: new Date().toISOString().substring(0, 16).replace('T', ' ')
      };
      setDamages([newDmg]);
    } else if (presetType === 'RF_REEFER') {
      setContainerNo('CMAU7788990');
      setShippingLine('CMA-CGM');
      setOwner('CMA CGM Group France');
      handleSizeTypeChange('40HR');
      setIsReefer(true);
      setReeferBrand('CARRIER');
      setSetTemperature(-20);
      setPtiStatus('PASSED');
      setCondition('AV');
      setQualityGrade('GRADE_A');
      setRemarks('Container lạnh 40HR đạt test PTI lạnh sâu -20°C, máy nén Carrier vận hành êm ái, gioăng cửa kín khít.');
      setActionRequired('AVAILABLE_FOR_DISPATCH');
      setDamages([]);
    }
  };

  // Add Damage Record
  const handleAddInlineDamage = () => {
    const locItem = locations.find((l) => l.code === dmgLocation);
    const codeItem = damageCodes.find((d) => d.code === dmgCode);
    const repItem = repairCodes.find((r) => r.repairCode === dmgRepair);

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

  // Add photo sample
  const handleAddSamplePhoto = (type: 'OVERVIEW' | 'DETAIL' | 'DOOR_SEAL' | 'INTERIOR_FLOOR' | 'REEFER_PANEL') => {
    const sampleUrls: Record<string, string> = {
      OVERVIEW: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=60',
      DETAIL: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60',
      DOOR_SEAL: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=60',
      INTERIOR_FLOOR: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=60',
      REEFER_PANEL: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60'
    };

    const captions: Record<string, string> = {
      OVERVIEW: `Ảnh toàn cảnh góc 45° vỏ ${containerNo || 'Container'}`,
      DETAIL: 'Ảnh cận cảnh chi tiết tổn thất hiện trường',
      DOOR_SEAL: 'Ảnh kiểm tra gioăng cao su cánh cửa và khóa camlock',
      INTERIOR_FLOOR: 'Ảnh kiểm tra sàn gỗ và vách trong',
      REEFER_PANEL: 'Ảnh màn hình hiển thị nhiệt độ cụm máy lạnh'
    };

    const newPhoto: SurveyPhoto = {
      id: 'PH-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      url: sampleUrls[type] || sampleUrls.OVERVIEW,
      type,
      caption: captions[type] || 'Ảnh chụp hiện trường',
      surveyor,
      uploadedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
      fileSizeKb: Math.floor(750 + Math.random() * 850)
    };

    setPhotos((prev) => [...prev, newPhoto]);
  };

  // Add standard minimum photo set (1 Overview + 1 Detail + Timestamp)
  const handleAddStandardPhotoSet = () => {
    const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const overviewPhoto: SurveyPhoto = {
      id: 'PH-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=60',
      type: 'OVERVIEW',
      caption: `[01/02] Ảnh toàn cảnh góc 45° vỏ ${containerNo || 'Container'}`,
      surveyor,
      uploadedAt: timestamp,
      fileSizeKb: 890
    };

    const detailPhoto: SurveyPhoto = {
      id: 'PH-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60',
      type: 'DETAIL',
      caption: `[02/02] Ảnh cận cảnh vị trí ${condition === 'CL' ? 'cần vệ sinh' : 'hư hỏng'}`,
      surveyor,
      uploadedAt: timestamp,
      fileSizeKb: 920
    };

    setPhotos((prev) => [...prev, overviewPhoto, detailPhoto]);
  };

  // Toggle checklist status
  const handleToggleChecklist = (zoneKey: InspectionZoneKey, status: ZoneCheckStatus) => {
    setChecklist((prev) =>
      prev.map((item) => (item.zoneKey === zoneKey ? { ...item, status } : item))
    );
  };

  // Save submission
  const handleSave = (targetStatus: SurveyStatus, openImmediately = false) => {
    if (!containerNo.trim()) {
      setValidationError('Vui lòng nhập Số Container!');
      setActiveTab('CONTAINER');
      return;
    }

    const cleanCont = containerNo.trim().toUpperCase();

    const newRecord: SurveyItemRecord = {
      id: 'SURV-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      surveyNo: surveyNo.trim() || `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      containerNo: cleanCont,
      isoCode,
      size: sizeType,
      type: containerTypeName,
      owner,
      shippingLine,
      isReefer,
      isPreSurveyBeforeGateIn: isPreSurvey,
      surveyType,
      gateInTime: isPreSurvey ? 'Chưa Gate-In (Đang chờ ngoài cổng)' : gateInTime,
      surveyDate,
      surveyor,
      shift,
      status: targetStatus,
      standard,
      standardNotes,
      condition,

      // Physical specs
      manufactureMonthYear: manufactureYearMonth,
      tareWeightKg,
      maxGrossWeightKg,
      payloadKg,
      material,
      floorType,
      cscPlateNo,

      // Operations
      truckPlate,
      trailerPlate,
      driverName,
      driverPhone,
      driverLicense,
      yardLocation,
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
      ...(condition === 'AV' ? { qualityGrade } : {}),
      ...(condition === 'CL'
        ? {
            cleaningReason: cleaningReasons,
            cleaningMethod,
            cleaningRemarks,
            cleaningEstimatedCost,
            cleaningTotalCost: cleaningEstimatedCost,
            cleaningItems: selectedCleaningCodes.map((code) => {
              const tariff = cleaningTariffs.find((t) => t.cleaningCode === code);
              const unitPrice = tariff ? getTariffCost(tariff) : 250000;
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
      actionRequired
    };

    onSaveSurvey(newRecord, openImmediately);
    onClose();
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
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold rounded-lg">
                  {surveyNo}
                </span>
                {isPreSurvey && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-700 border border-blue-500/30 text-[11px] font-bold rounded-md">
                    Pre-Survey (Trước Gate-in)
                  </span>
                )}
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

        {/* Preset Quick Fill Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 flex items-center gap-1.5 whitespace-nowrap font-medium">
            <Sparkle className="w-3.5 h-3.5 text-amber-400" />
            <span>Mẫu Điền Nhanh:</span>
          </span>
          <div className="flex items-center gap-2 flex-nowrap">
            <button
              type="button"
              onClick={() => handleApplyPreset('AV_FOOD')}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded-lg whitespace-nowrap transition cursor-pointer text-[11px] font-semibold"
            >
              ✓ Cont Khô Đạt Chuẩn (Grade A Food)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('CL_OIL')}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 rounded-lg whitespace-nowrap transition cursor-pointer text-[11px] font-semibold"
            >
              🚿 Cont Cần Vệ Sinh (Tẩy dầu sàn)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('DM_CUT')}
              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/30 rounded-lg whitespace-nowrap transition cursor-pointer text-[11px] font-semibold"
            >
              ⚠ Cont Hư Hỏng (Rách vách IICL)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('RF_REEFER')}
              className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 rounded-lg whitespace-nowrap transition cursor-pointer text-[11px] font-semibold"
            >
              ❄ Cont Lạnh 40HR (Carrier PTI Đạt)
            </button>
          </div>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Container Number & ISO Check */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-amber-400" />
                      <span>Số Container (4 chữ cái + 7 chữ số)*</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">Chuẩn ISO 6346</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={containerNo}
                    onChange={(e) => {
                      setContainerNo(e.target.value.toUpperCase());
                      setValidationError(null);
                    }}
                    placeholder="VD: MSCU1234567, MAEU8899001..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-400 font-mono font-bold text-base tracking-wider uppercase focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  {/* Realtime Check Digit Validation Helper */}
                  {containerNo.length >= 4 && (
                    <div className="flex items-center gap-2 pt-1">
                      {validationResult.isCheckDigitCorrect ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 rounded text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{validationResult.message}</span>
                        </span>
                      ) : validationResult.isValidFormat ? (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-700 border border-rose-500/30 rounded text-[11px] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>{validationResult.message}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {validationResult.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Shipping Line Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Ship className="w-4 h-4 text-sky-400" />
                    <span>Hãng Tàu (Shipping Line)*</span>
                  </label>
                  <select
                    value={shippingLine}
                    onChange={(e) => handleShippingLineChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="MAERSK">MAERSK Line</option>
                    <option value="MSC">MSC Shipping</option>
                    <option value="ONE">ONE Network Express</option>
                    <option value="CMA-CGM">CMA CGM Group</option>
                    <option value="COSCO">COSCO Shipping</option>
                    <option value="EVERGREEN">EVERGREEN Marine</option>
                    <option value="YANG-MING">YANG MING Line</option>
                    <option value="HAPAG-LLOYD">HAPAG-LLOYD</option>
                    <option value="WAN-HAI">WAN HAI Lines</option>
                    <option value="ZIM">ZIM Integrated</option>
                    <option value="SITC">SITC Container Lines</option>
                    <option value="KMTC">KMTC Korea</option>
                  </select>
                </div>
              </div>

              {/* Size & Type Selection with Auto Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Kích Cỡ / Quy Cách*</label>
                  <select
                    value={sizeType}
                    onChange={(e) => handleSizeTypeChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-400 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="20DC">20DC - 20' Dry Standard (22G1)</option>
                    <option value="40DC">40DC - 40' Dry Standard (42G1)</option>
                    <option value="40HC">40HC - 40' High Cube Dry (45G1)</option>
                    <option value="45HC">45HC - 45' High Cube Dry (L5G1)</option>
                    <option value="20RF">20RF - 20' Reefer Lạnh (22R1)</option>
                    <option value="40HR">40HR - 40' Reefer High Cube (45R1)</option>
                    <option value="20OT">20OT - 20' Open Top Mở nóc (22U1)</option>
                    <option value="40OT">40OT - 40' Open Top High Cube (45U1)</option>
                    <option value="20FR">20FR - 20' Flat Rack Mặt bằng (22P1)</option>
                    <option value="40FR">40FR - 40' Flat Rack High Cube (45P1)</option>
                    <option value="20TK">20TK - 20' ISO Tank Bồn lỏng (22T1)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Mã ISO 6346</label>
                  <input
                    type="text"
                    value={isoCode}
                    onChange={(e) => setIsoCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sky-400 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Chủ Vỏ / Đơn Vị Cho Thuê</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="VD: MAERSK A/S, TRITON, TEXTAINER..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Physical Weight & Construction Parameters */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>Thông Số Kỹ Thuật &amp; Tải Trọng Vỏ (Weight &amp; Material)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Tự động tính toán theo quy cách ISO</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Năm/Tháng Sản Xuất</label>
                    <input
                      type="text"
                      value={manufactureYearMonth}
                      onChange={(e) => setManufactureYearMonth(e.target.value)}
                      placeholder="MM/YYYY"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Trọng Lượng Bì (Tare Kg)</label>
                    <input
                      type="number"
                      value={tareWeightKg}
                      onChange={(e) => handleTareChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Max Gross Weight (Kg)</label>
                    <input
                      type="number"
                      value={maxGrossWeightKg}
                      onChange={(e) => handleGrossChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Tải Trọng Hàng (Payload)</label>
                    <input
                      type="number"
                      readOnly
                      value={payloadKg}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Vật Liệu Cấu Trúc Vỏ</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Loại Sàn Lót (Floor Type)</label>
                    <input
                      type="text"
                      value={floorType}
                      onChange={(e) => setFloorType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Số Bảng Đồng CSC Safety Plate</label>
                    <input
                      type="text"
                      value={cscPlateNo}
                      onChange={(e) => setCscPlateNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATION & LOGISTICS */}
          {activeTab === 'OPERATION' && (
            <div className="space-y-4">
              {/* Survey Type & Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Loại Nghiệp Vụ Giám Định*</label>
                  <select
                    value={surveyType}
                    onChange={(e) => {
                      const st = e.target.value as SurveyType;
                      setSurveyType(st);
                      if (st === 'PRE_SURVEY') {
                        setIsPreSurvey(true);
                      } else {
                        setIsPreSurvey(false);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-400 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="GATE_IN">Giám Định Cổng Vào (Gate-In Survey)</option>
                    <option value="PRE_SURVEY">Giám Định Tiền Trạm (Pre-Survey Ngoài Cổng)</option>
                    <option value="GATE_OUT">Giám Định Xuất Bãi (Gate-Out Survey)</option>
                    <option value="YARD_PERIODIC">Giám Định Định Kỳ Bãi (Yard Periodic)</option>
                    <option value="POST_REPAIR">Giám Định Sau Sửa Chữa (Post-Repair QA)</option>
                    <option value="ON_HIRE">Giám Định Thuê Vỏ (On-Hire Survey)</option>
                    <option value="OFF_HIRE">Giám Định Trả Vỏ (Off-Hire Survey)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Số Phiếu Giám Định (Survey No)</label>
                  <input
                    type="text"
                    value={surveyNo}
                    onChange={(e) => setSurveyNo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Thời Gian Giám Định</label>
                  <input
                    type="text"
                    value={surveyDate}
                    onChange={(e) => setSurveyDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Gate In Status & Surveyor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Thời Gian Gate-In</label>
                    <label className="flex items-center gap-1 text-[11px] text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPreSurvey}
                        onChange={(e) => {
                          setIsPreSurvey(e.target.checked);
                          if (e.target.checked) {
                            setGateInTime('Chưa Gate-In (Đang chờ ngoài cổng)');
                          } else {
                            setGateInTime(new Date().toISOString().substring(0, 16).replace('T', ' '));
                          }
                        }}
                        className="rounded accent-amber-500"
                      />
                      <span>Chưa Gate-In</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    disabled={isPreSurvey}
                    value={gateInTime}
                    onChange={(e) => setGateInTime(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl font-mono ${
                      isPreSurvey
                        ? 'bg-slate-50 text-blue-700 border border-blue-500/30'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Giám Định Viên Tiếp Nhận</label>
                  <input
                    type="text"
                    value={surveyor}
                    onChange={(e) => setSurveyor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
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
                    <label className="block text-[11px] text-slate-500 mb-1">SĐT Tài Xế / GPLX</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="0908..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Vị Trí Bãi Hạ (Yard Slot)</label>
                    <input
                      type="text"
                      value={yardLocation}
                      onChange={(e) => setYardLocation(e.target.value.toUpperCase())}
                      placeholder="Block-Bay-Row-Tier (B02-08-03-2)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-amber-400 font-mono font-bold"
                    />
                  </div>

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
                    <label className="block text-[11px] text-slate-500 mb-1">Số Seal Hãng Tàu</label>
                    <input
                      type="text"
                      value={sealNo}
                      onChange={(e) => setSealNo(e.target.value)}
                      placeholder="MSK-982104"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                    />
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
                    onChange={(e) => setStandard(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-400 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="IICL-6">IICL-6 (Tiêu chuẩn quốc tế cao nhất - Viện IICL)</option>
                    <option value="MCIC">MCIC (Tiêu chuẩn giám định hãng COSCO / OOCL)</option>
                    <option value="MRIC">MRIC (Tiêu chuẩn bảo trì &amp; sửa chữa container)</option>
                    <option value="CARRIER_CUSTOM">Tiêu Chuẩn Đặc Thù Của Hãng Tàu (Carrier Custom)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Ghi Chú Hạn Mức Tiêu Chuẩn</label>
                  <input
                    type="text"
                    value={standardNotes}
                    onChange={(e) => setStandardNotes(e.target.value)}
                    placeholder="Áp dụng hạn mức dung sai IICL-6..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
              </div>

              {/* Primary Condition Selector: AV / CL / DM */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Đánh Giá Phân Loại Tình Trạng Ban Đầu (Condition)*
                </label>
                {/* Chỉ hiện tên + nút chọn nhỏ (chip) — bỏ mô tả dài và thẻ to trước đây theo yêu cầu. */}
                <div className="flex flex-wrap gap-2">
                  {activeGrades.map((grade, index) => {
                    const bucket = gradeBucket(index, activeGrades.length);
                    const isAv = bucket === 'AV';
                    const isSelected = condition === bucket && qualityGrade === (grade.gradeCode as any);
                    return (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={() => {
                          setCondition(bucket);
                          setQualityGrade(grade.gradeCode as any);
                          setActionRequired(isAv ? 'AVAILABLE_FOR_DISPATCH' : 'SEND_TO_REPAIR');
                        }}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? isAv
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'bg-rose-500 border-rose-400 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isSelected ? (isAv ? 'bg-slate-50' : 'bg-white') : 'bg-slate-300'}`} />
                        {grade.gradeName}
                      </button>
                    );
                  })}

                  {/* Nút CL cố định — "Cần vệ sinh" là 1 trục nghiệp vụ khác (tình trạng vệ sinh vật lý),
                      không phải hạng chất lượng nên không có Grade thật nào tương ứng để lấy động. */}
                  <button
                    type="button"
                    onClick={() => {
                      setCondition('CL');
                      setActionRequired('SEND_TO_WASHING');
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      condition === 'CL'
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${condition === 'CL' ? 'bg-slate-50' : 'bg-slate-300'}`} />
                    Cleaning
                  </button>
                </div>
              </div>

              {/* Conditional Sub-panels */}

              {/* IF CL: Cleaning Reasons & Master Tariffs with Direct Pricing */}
              {condition === 'CL' && (
                <div className="p-4 bg-amber-950/20 border border-amber-200 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <h4 className="font-bold text-amber-700 flex items-center gap-2 text-sm">
                      <Droplets className="w-4 h-4 text-cyan-400" />
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
                                ? 'bg-amber-900/40 border-amber-500 text-amber-800 font-bold'
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
                      <span className="text-[11px] text-cyan-400 font-mono font-semibold">
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
                                ? 'bg-amber-950/50 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2 min-w-0">
                              <div className="mt-0.5">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[11px] text-cyan-400">
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
                              <div className="text-xs font-mono font-bold text-amber-400">
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
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-amber-400 font-mono font-bold text-xs"
                        />
                        <span className="text-xs text-slate-500 font-semibold">VNĐ</span>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                      <div className="text-[11px] text-slate-500">Tổng thanh toán (VAT 8%):</div>
                      <div className="text-base font-mono font-black text-emerald-400">
                        {Math.round(cleaningEstimatedCost * 1.08).toLocaleString('vi-VN')} đ
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
                <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-2xl space-y-3">
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-cyan-400 font-mono font-bold"
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
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-amber-400 font-bold focus:outline-none cursor-pointer"
                >
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
                        <span>+ Thêm Hư Hỏng</span>
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
                    <span>Checklist Kiểm Tra 9 Khu Vực Cấu Kiện</span>
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

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleAddStandardPhotoSet}
                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-700 border border-emerald-500/40 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>+ Bộ Ảnh Chuẩn (Toàn cảnh + Cận cảnh)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('OVERVIEW')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    >
                      + Toàn cảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('DETAIL')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    >
                      + Cận cảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('DOOR_SEAL')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    >
                      + Ron cửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSamplePhoto('INTERIOR_FLOOR')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                    >
                      + Sàn gỗ
                    </button>
                    {isReefer && (
                      <button
                        type="button"
                        onClick={() => handleAddSamplePhoto('REEFER_PANEL')}
                        className="px-2 py-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-800 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                      >
                        + Máy lạnh
                      </button>
                    )}
                  </div>
                </div>

                {photos.length === 0 ? (
                  <div className="py-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 space-y-1">
                    <Camera className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-semibold">Chưa có ảnh đính kèm</p>
                    <p className="text-[11px] text-slate-500">
                      Bấm nút "+ Bộ Ảnh Chuẩn" hoặc các nút phía trên để chụp/thêm ảnh hiện trường có timestamp
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
            <span>•</span>
            <span className="text-amber-700 font-semibold">{shippingLine}</span>
            <span>•</span>
            <span className="text-sky-700 font-semibold">{sizeType}</span>
            <span>•</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                condition === 'AV'
                  ? 'bg-emerald-500/20 text-emerald-700'
                  : condition === 'CL'
                  ? 'bg-amber-500/20 text-amber-700'
                  : 'bg-rose-500/20 text-rose-700'
              }`}
            >
              {condition}
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
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-amber-400 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Lưu Chờ Giám Định
            </button>

            <button
              type="button"
              onClick={() => handleSave('IN_PROGRESS', true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
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
