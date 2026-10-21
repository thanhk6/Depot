import React, { useState, useRef, useEffect } from 'react';
import {
  SurveyItemRecord,
  CleaningReasonType,
  CleaningTariffMasterItem,
  SurveyCleaningItemRecord,
  InspectionZoneKey,
  InspectionChecklistItem,
  ZoneCheckStatus,
  DamageRecord,
  SurveyPhoto,
  DamageLocationMasterItem,
  DamageCodeMasterItem,
  RepairCodeMasterItem,
  GradeMasterItem,
  InspectionStandardMasterItem
} from '../types';
import { DamageListTable } from './DamageListTable';
import { DamageFormModal } from './DamageFormModal';
import { recomputeChecklistFromDamages, mergeChecklistWithTemplate } from '../utils/checklistSync';
import { useSurveyChecklistTemplate } from '../../masterdata/utils/checklistCatalog';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';
import { priceForContainer, TariffPriceResult } from '../../masterdata/utils/tariffPricing';
import { asPricedTariff } from '../../masterdata/utils/cleaningTariffCatalog';
import { depotFileApi } from '../../../api';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Camera,
  ArrowLeft,
  Plus,
  Trash2,
  Maximize2,
  Tag,
  Zap,
  Droplets,
  Receipt,
  Clock
} from 'lucide-react';

interface SurveyDetailFormProps {

  survey: SurveyItemRecord;
  locations: DamageLocationMasterItem[];
  damageCodes: DamageCodeMasterItem[];
  repairCodes: RepairCodeMasterItem[];
  grades: GradeMasterItem[];
  standards: InspectionStandardMasterItem[];
  cleaningTariffs: CleaningTariffMasterItem[];
  currentUser: string;
  onBack: () => void;
  // Trả về Promise để các nút Hoàn Tất/Phát Hành phía dưới có thể `await` và biết chắc
  // đã lưu xuống SQL Server thành công hay chưa trước khi báo "thành công" cho người dùng.
  onSaveSurvey: (updated: SurveyItemRecord, isDraft?: boolean) => Promise<void>;
  /** Gọi sau khi Hoàn Tất Giám Định lưu thành công — trang cha báo thông báo và quay về danh sách. */
  onCompleted?: (completed: SurveyItemRecord) => void;
  /** Mở từ tab Lịch sử: chỉ xem — không sửa, không lưu, không nộp / chuyển vệ sinh, không tải lên / xoá ảnh. */
  readOnly?: boolean;
  /** Nhãn trạng thái hồ sơ hiện tại hiện ở dải "chế độ chỉ xem". */
  readOnlyStatusLabel?: string;
}

export const SurveyDetailForm: React.FC<SurveyDetailFormProps> = ({
  survey,
  locations,
  damageCodes,
  repairCodes,
  grades,
  standards,
  cleaningTariffs,
  currentUser,
  onBack,
  onSaveSurvey,
  onCompleted,
  readOnly = false,
  readOnlyStatusLabel
}) => {
  // Form working states - Default tab is directly DAMAGES
  const [formData, setFormData] = useState<SurveyItemRecord>({ ...survey });
  // Mở phiếu (nháp cũ có thể lưu checklist lệch danh mục / lệch hư hỏng): ghép theo danh mục khu vực mới nhất (thêm khu
  // vực mới, bỏ khu vực đã tạm ngưng) rồi đồng bộ theo danh mục vị trí, để lần lưu kế tiếp không bị server từ chối.
  // Chế độ chỉ xem giữ nguyên đúng checklist đã lưu.
  const checklistTemplate = useSurveyChecklistTemplate();
  useEffect(() => {
    if (readOnly) return;
    setFormData((prev) => {
      let checklist = mergeChecklistWithTemplate(prev.checklist || [], checklistTemplate);
      if (locations.length > 0) checklist = recomputeChecklistFromDamages(checklist, prev.damages || [], locations);
      return { ...prev, checklist };
    });
  }, [locations, checklistTemplate, readOnly]);
  const [activeTab, setActiveTab] = useState<'DAMAGES' | 'CHECKLIST' | 'CLEANING' | 'PHOTOS'>(
    survey.condition === 'CL' ? 'CLEANING' : 'DAMAGES'
  );

  // 3 thẻ AV/CL/DM giờ lấy tên + mô tả trực tiếp từ Danh Mục Grade thật trong SQL — trước đây "Chọn
  // Phân Hạng Chất Lượng" bên trong thẻ AV gán cứng 4 lựa chọn "Grade A/Food Grade/General Cargo/Scrap
  // Grade" hoàn toàn không liên quan tới danh mục Grade thật (A/B/C/D) đang quản trị ở Master Data. Ánh
  // xạ theo đúng thứ tự sortOrder, khớp với round-trip có sẵn với backend (conditionFromRating trong
  // SurveyModulePage: A→AV, B→CL, C/D→DM) — hạng thứ 4 trở đi (VD "Thanh lý") không có chỗ tương ứng
  // trong 3 nhánh AV/CL/DM nên không hiển thị.
  const activeGrades = grades.filter((g) => g.status === 'ACTIVE').sort((a, b) => a.sortOrder - b.sortOrder);
  // Grade thật trong SQL (A/B/C/D...) không có field phân loại AV/CL/DM tường minh — chia theo vị trí
  // sortOrder, khớp đúng ý nghĩa 4 hạng thật đang có (A = còn dùng được ngay, B = cần vệ sinh trước khi
  // dùng lại, C/D = cần sửa chữa/thanh lý). Số thẻ = số Grade ACTIVE trong SQL, không còn cố định 1-1
  // như trước — thêm/xóa Grade ở Master Data là thêm/bớt thẻ ngay.
  // BUG ĐÃ SỬA: bản trước chỉ chia nhị phân AV/DM (`index < ceil(total/2) ? AV : DM`), dù chính comment
  // ngay phía trên đã ghi rõ ý định "A→AV, B→CL, C/D→DM" — hạng thứ 2 (B) luôn rơi vào nhánh AV thay vì
  // CL. Hậu quả: KHÔNG CÓ nút nào trên UI Giám Định có thể chọn ra kết quả "CL - Cần Vệ Sinh" cả — giám
  // định viên không có cách nào chuyển container qua Tổ Vệ Sinh dù cả backend lẫn module Cleaning đã sẵn
  // sàng nhận. Giờ chia 3 nhánh đúng theo comment: hạng đầu = AV, hạng thứ 2 = CL, các hạng còn lại = DM.
  const gradeBucket = (index: number, total: number): 'AV' | 'CL' | 'DM' => {
    if (total <= 1) return 'AV';
    if (total === 2) return index === 0 ? 'AV' : 'DM';
    if (index === 0) return 'AV';
    if (index === 1) return 'CL';
    return 'DM';
  };

  // Giá dịch vụ vệ sinh theo đúng loại container của hồ sơ (DM Loại Container) — cùng quy tắc với server, server tra lại khi
  // lưu (depot-fullstack-cleaning-tariff-pricing). Trước đây đoán theo chuỗi cỡ (20/45/HC) và tự lấy 40HC khi thiếu cỡ.
  const containerTypeOptions = useContainerTypeOptions();
  const [cleaningPriceWarning, setCleaningPriceWarning] = useState<string | null>(null);
  const getTariffCost = (tariff: CleaningTariffMasterItem): TariffPriceResult =>
    priceForContainer(asPricedTariff(tariff), formData.sizeType || '', containerTypeOptions);

  const handleAddCleaningItem = (tariff: CleaningTariffMasterItem) => {
    // Thẻ dịch vụ đã bấm rồi hiện badge "✓ Đã có" nhưng trước đây chỉ là trang trí — onClick vẫn chạy
    // bình thường, bấm lại thẻ cũ là thêm 1 dòng trùng, nhân đôi chi phí vệ sinh trong tổng tiền.
    if ((formData.cleaningItems || []).some((item) => item.cleaningCode === tariff.cleaningCode)) {
      return;
    }
    const priced = getTariffCost(tariff);
    if (!priced.ok) {
      setCleaningPriceWarning(`${priced.reason} — nhập giá ở DANH MỤC MASTER DATA → Biểu Phí Vệ Sinh Container.`);
      return;
    }
    setCleaningPriceWarning(null);
    const unitPrice = priced.price;
    const newItem: SurveyCleaningItemRecord = {
      id: 'CLN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      cleaningCode: tariff.cleaningCode,
      cleaningName: tariff.vietnameseName || tariff.name,
      category: tariff.category,
      chemicalRequired: !!tariff.chemicalRequired,
      chemicalName: tariff.chemicalRequired || undefined,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      responsibleParty: tariff.responsiblePartyDefault || 'U',
      status: 'REQUIRED',
      notes: ''
    };

    setFormData((prev) => {
      const currentList = prev.cleaningItems || [];
      const updatedList = [...currentList, newItem];
      const newTotal = updatedList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      return {
        ...prev,
        // Container đang có hư hỏng (DM) thì thêm dịch vụ vệ sinh KHÔNG được hạ cấp xuống CL — trước
        // đây gán cứng 'CL' ở đây khiến container hư hỏng bị đưa thẳng vào bãi rửa thay vì hàng sửa
        // chữa (EEIRModal định tuyến theo condition). Vẫn giữ danh sách dịch vụ vệ sinh + chi phí bình
        // thường, chỉ không đổi condition khi vẫn còn damage.
        condition: (prev.damages && prev.damages.length > 0) ? 'DM' : 'CL',
        cleaningItems: updatedList,
        cleaningTotalCost: newTotal,
        cleaningEstimatedCost: newTotal
      };
    });
    setSaveSuccessMessage(`Đã thêm dịch vụ vệ sinh "${tariff.vietnameseName || tariff.name}" (${unitPrice.toLocaleString('vi-VN')} đ)`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Trước đây `cleaningReason` chỉ set được 1 lần lúc TẠO phiếu (CreateSurveyModal) và validateForm bắt
  // buộc phải có khi hoàn tất CL, nhưng màn giám định thật (đổi condition giữa chừng khi khảo sát hiện
  // trường) không có ô nào để sửa — surveyor bị validate chặn hoặc phiếu lưu lại lý do vệ sinh cũ/sai.
  const handleToggleCleaningReason = (reason: CleaningReasonType) => {
    setFormData((prev) => {
      const current = prev.cleaningReason || [];
      const updated = current.includes(reason)
        ? current.filter((r) => r !== reason)
        : [...current, reason];
      return { ...prev, cleaningReason: updated };
    });
  };

  const handleRemoveCleaningItem = (id: string) => {
    setFormData((prev) => {
      const updatedList = (prev.cleaningItems || []).filter((item) => item.id !== id);
      const newTotal = updatedList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      return {
        ...prev,
        cleaningItems: updatedList,
        cleaningTotalCost: newTotal,
        cleaningEstimatedCost: newTotal,
        condition: updatedList.length > 0 ? 'CL' : prev.damages?.length ? 'DM' : 'AV'
      };
    });
  };

  const handleToggleCleaningStatus = (id: string) => {
    setFormData((prev) => {
      const updatedList: SurveyCleaningItemRecord[] = (prev.cleaningItems || []).map((item) => {
        if (item.id === id) {
          const nextStatus: 'REQUIRED' | 'IN_PROGRESS' | 'COMPLETED' =
            item.status === 'COMPLETED'
              ? 'REQUIRED'
              : item.status === 'IN_PROGRESS'
              ? 'COMPLETED'
              : 'IN_PROGRESS';
          return {
            ...item,
            status: nextStatus,
            completedAt:
              nextStatus === 'COMPLETED'
                ? new Date().toISOString().replace('T', ' ').substring(0, 16)
                : undefined
          };
        }
        return item;
      });
      return { ...prev, cleaningItems: updatedList };
    });
  };

  const handleUpdateCleaningParty = (id: string, party: 'O' | 'U' | 'T') => {
    setFormData((prev) => {
      const updatedList = (prev.cleaningItems || []).map((item) =>
        item.id === id ? { ...item, responsibleParty: party } : item
      );
      return { ...prev, cleaningItems: updatedList };
    });
  };

  // Damage modal state
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [editingDamage, setEditingDamage] = useState<DamageRecord | null>(null);
  const [selectedLocationCode, setSelectedLocationCode] = useState<string>('');
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');

  // Quick Damage Direct Entry Inline State
  // Mặc định = dòng đầu của danh mục DB khi tải xong; trước đây gõ cứng RIGHT_W / BENT / RP_STR_PANEL (mã mẫu cũ,
  // RIGHT_W không có trong danh mục) nên ô chọn hiện dòng đầu nhưng lưu mã gõ cứng (depot-fullstack-survey-checklist-sync).
  const [quickLocation, setQuickLocation] = useState<string>('');
  const [quickDamageCode, setQuickDamageCode] = useState<string>('');
  const [quickRepairCode, setQuickRepairCode] = useState<string>('');
  useEffect(() => {
    if (locations.length && !locations.some((l) => l.code === quickLocation)) setQuickLocation(locations[0].code);
    if (damageCodes.length && !damageCodes.some((d) => d.code === quickDamageCode)) setQuickDamageCode(damageCodes[0].code);
    if (repairCodes.length && !repairCodes.some((r) => r.repairCode === quickRepairCode)) setQuickRepairCode(repairCodes[0].repairCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, damageCodes, repairCodes]);
  const [quickSeverity, setQuickSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [quickLength, setQuickLength] = useState<string>('');
  const [quickWidth, setQuickWidth] = useState<string>('');
  const [quickQuantity] = useState<string>('1');
  const [quickNote, setQuickNote] = useState<string>('');

  // Photo viewer modal
  const [photoViewerUrl, setPhotoViewerUrl] = useState<{ url: string; caption: string } | null>(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  // Trước đây các nút Lưu Tạm/Hoàn Tất/Phát Hành gọi onSaveSurvey (async, gọi API thật) mà KHÔNG
  // await và không bắt lỗi — nếu backend từ chối (vd mất phiên đăng nhập, mất mạng) thì Promise bị
  // reject âm thầm (chỉ log lỗi ẩn trong console) trong khi UI vẫn hiển thị "Đã lưu ... thành công",
  // khiến giám định viên tưởng dữ liệu đã lưu nhưng thực ra mất trắng. saveErrorMessage hiển thị đúng
  // lỗi thật khi lưu thất bại, thay vì luôn báo thành công.
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Nút "Hoàn Tất" nằm cả ở thanh dưới cùng (sticky) lẫn thanh trên — nhưng box lỗi validate luôn render
  // ở đầu trang. Bấm từ thanh dưới khi đang cuộn sâu (VD đang ở tab Vệ Sinh) thì box lỗi hiện ra ngoài
  // vùng nhìn thấy, giám định viên tưởng nút không phản hồi dù thực ra thiếu lý do/dịch vụ vệ sinh bắt
  // buộc. Tự cuộn lên và focus vào box lỗi ngay khi validate thất bại để không bị bỏ sót.
  const validationErrorsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (validationErrors.length > 0) {
      validationErrorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [validationErrors]);

  // Upload ảnh thật: đẩy file lên Depot.FileServer qua depotFileApi (lưu vật lý + ghi metadata bảng
  // DepotFiles), rồi gắn URL thật trả về vào formData.photos. Trước đây 2 hàm này chỉ mô phỏng — luôn gán
  // cứng vài link ảnh Unsplash cố định bất kể người dùng chọn file gì, không có input chọn file thật nào.
  // Dùng DepotJob.Id (formData.id) làm IdTable vì tại thời điểm upload, Survey CHƯA được lưu xuống DB
  // (chỉ tạo khi bấm Hoàn Tất/Lưu Tạm) nên chưa có Survey.Id thật để gắn vào.
  const overviewFileInputRef = useRef<HTMLInputElement | null>(null);
  const detailFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  const handlePhotoFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'OVERVIEW' | 'DETAIL'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (readOnly || !file) return;

    const jobId = Number(formData.id);
    if (!Number.isFinite(jobId) || jobId <= 0) {
      setPhotoUploadError('Container chưa Gate-In thật (chưa có mã hồ sơ thật) nên chưa thể upload ảnh lúc này.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadError(null);
    try {
      const response = await depotFileApi.upload(file, jobId, 'DepotJob', 1);
      const uploaded = response.data;
      if (!uploaded) throw new Error('Upload không trả về dữ liệu file.');

      const newPhoto: SurveyPhoto = {
        id: 'PH-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        url: uploaded.url,
        type,
        caption:
          type === 'OVERVIEW'
            ? `Ảnh toàn cảnh vỏ ${formData.containerNo}`
            : 'Ảnh chụp cận cảnh tổn thất hiện trường',
        surveyor: currentUser,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        fileSizeKb: Math.round(file.size / 1024)
      };

      setFormData((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), newPhoto]
      }));
    } catch (error: any) {
      const detail = error?.response?.data?.data || error?.response?.data?.message;
      setPhotoUploadError(typeof detail === 'string' && detail ? detail : (error instanceof Error ? error.message : 'Không thể upload ảnh.'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (readOnly) return;
    setFormData((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p.id !== photoId)
    }));
  };

  // Checklist status toggle
  const handleToggleChecklistStatus = (zoneKey: InspectionZoneKey, status: ZoneCheckStatus) => {
    setFormData((prev) => {
      const updatedChecklist = prev.checklist.map((item) =>
        item.zoneKey === zoneKey ? { ...item, status } : item
      );

      // "Không Đạt" ở khu vực Vệ sinh chỉ nâng AV → CL, không hạ DM xuống CL; khu vực khác → DM.
      // Đổi về Đạt / N/A không tự đổi phân loại (giám định viên tự chọn lại nếu cần).
      let autoCondition = prev.condition;
      if (status === 'FAIL') {
        if (zoneKey !== 'CLEANING') autoCondition = 'DM';
        else if (prev.condition === 'AV') autoCondition = 'CL';
      }

      return {
        ...prev,
        checklist: updatedChecklist,
        condition: autoCondition
      };
    });
  };

  // Damage handlers
  const handleOpenAddDamage = (locCode?: string, locName?: string) => {
    setEditingDamage(null);
    if (locCode) setSelectedLocationCode(locCode);
    if (locName) setSelectedLocationName(locName);
    setIsDamageModalOpen(true);
  };

  const handleSaveDamage = (record: DamageRecord) => {
    if (readOnly) return;
    setFormData((prev) => {
      const existing = prev.damages || [];
      const updatedDamages = editingDamage
        ? existing.map((d) => (d.id === record.id ? record : d))
        : [...existing, record];

      return {
        ...prev,
        damages: updatedDamages,
        condition: 'DM', // Automatic DM when damage is added
        checklist: recomputeChecklistFromDamages(prev.checklist, updatedDamages, locations)
      };
    });
  };

  // Quick Direct Add Handler
  const handleQuickAddDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLocation || !quickDamageCode || !quickRepairCode) return;
    const loc = locations.find((l) => l.code === quickLocation);
    const dmg = damageCodes.find((d) => d.code === quickDamageCode);
    const rep = repairCodes.find((r) => r.repairCode === quickRepairCode);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newRecord: DamageRecord = {
      id: 'DMG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      locationCode: quickLocation,
      locationName: loc?.vietnameseName || quickLocation,
      damageCode: quickDamageCode,
      damageName: dmg?.vietnameseName || quickDamageCode,
      repairCode: quickRepairCode,
      repairName: rep?.vietnameseName || quickRepairCode,
      description: quickNote || `${dmg?.vietnameseName || quickDamageCode} tại ${loc?.vietnameseName || quickLocation}`,
      severity: quickSeverity,
      lengthMm: Number(quickLength) || 0,
      widthMm: Number(quickWidth) || 0,
      quantity: Number(quickQuantity) || 1,
      photoUrl: '',
      createdBy: currentUser,
      createdAt: now
    };

    handleSaveDamage(newRecord);
    setQuickNote('');
    setSaveSuccessMessage(`Đã thêm mã lỗi ${quickDamageCode} (${loc?.vietnameseName}) thành công!`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleDeleteDamage = (id: string) => {
    if (readOnly) return;
    setFormData((prev) => {
      const updatedDamages = (prev.damages || []).filter((d) => d.id !== id);
      return {
        ...prev,
        damages: updatedDamages,
        condition: updatedDamages.length > 0 ? 'DM' : 'AV',
        checklist: recomputeChecklistFromDamages(prev.checklist, updatedDamages, locations)
      };
    });
  };

  // Validation Logic
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.containerNo || formData.containerNo.length < 10) {
      errors.push('Số Container không hợp lệ (cần đúng 11 ký tự ISO chuẩn quốc tế).');
    }

    if (!formData.surveyor) {
      errors.push('Chưa chỉ định Giám Định Viên thực hiện.');
    }

    if (formData.condition === 'CL') {
      if (!formData.cleaningReason || formData.cleaningReason.length === 0) {
        errors.push('Vui lòng chọn ít nhất 01 lý do cần vệ sinh khi phân loại CL (Bụi bẩn, Rác, Mùi, Dầu mỡ...).');
      }
      // Trước đây chỉ bắt buộc lý do vệ sinh — có thể hoàn tất/phát e-EIR với 0 dịch vụ vệ sinh nào được
      // chọn, container bị đưa vào bãi rửa mà không có hạng mục nào để tính phí.
    }
    // Mọi container sau giám định đều chuyển Tổ Vệ Sinh (backend cũng chặn) — bắt buộc có dịch vụ vệ sinh.
    if (!formData.cleaningItems || formData.cleaningItems.length === 0) {
      errors.push('Vui lòng chọn ít nhất 01 dịch vụ vệ sinh (kèm đơn giá) ở tab Vệ Sinh — mọi container sau giám định đều chuyển Tổ Vệ Sinh.');
    }

    if (formData.condition === 'DM') {
      if (!formData.damages || formData.damages.length === 0) {
        errors.push('Phân loại DM (Damaged) bắt buộc phải ghi nhận ít nhất 01 tổn thất (Damage Record).');
      }
    }

    // Required photos: at least 1 overview
    const overviewPhoto = (formData.photos || []).find((p) => p.type === 'OVERVIEW');
    if (!overviewPhoto) {
      errors.push('Quy chuẩn bắt buộc phải có ít nhất 01 Ảnh Toàn Cảnh (Overview Photo) trước khi hoàn tất.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleCompleteSurvey = async () => {
    if (readOnly) return;
    if (!validateForm()) {
      return;
    }

    const completedRecord: SurveyItemRecord = {
      ...formData,
      status: 'COMPLETED',
      eeirNo: formData.eeirNo || `EIR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      eeirIssuedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setFormData(completedRecord);
    try {
      await onSaveSurvey(completedRecord);
      setSaveErrorMessage(null);
      if (onCompleted) {
        onCompleted(completedRecord);
        return;
      }
      setSaveSuccessMessage('Đã hoàn tất giám định và tự động sinh số e-EIR thành công!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (error) {
      setSaveErrorMessage(error instanceof Error ? error.message : 'Không thể hoàn tất giám định xuống hệ thống.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black font-mono text-amber-600">
                {formData.containerNo}
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  formData.condition === 'AV'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : formData.condition === 'CL'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {formData.condition} &bull;{' '}
                {formData.condition === 'AV' ? 'ĐẠT CHUẨN' : formData.condition === 'CL' ? 'CẦN VỆ SINH' : 'HƯ HỎNG'}
              </span>
              <span className="text-xs text-slate-500 font-mono">[{formData.surveyNo}]</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formData.shippingLine} &bull; {formData.size} {formData.type} &bull; Gate-In:{' '}
              {formData.gateInTime}
            </p>
          </div>
        </div>

        {/* Top Control Buttons */}
        {!readOnly && (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCompleteSurvey}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh</span>
          </button>
        </div>
        )}
      </div>

      {readOnly && (
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-2xl flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span className="font-bold">Phiếu đã nộp — chế độ chỉ xem</span>
          <span className="font-mono text-slate-500">[{formData.surveyNo}]</span>
          {readOnlyStatusLabel && <span>&bull; Hồ sơ hiện tại: <strong>{readOnlyStatusLabel}</strong></span>}
          <span className="text-slate-500">&bull; Không sửa / nộp lại từ Lịch sử.</span>
        </div>
      )}

      {/* Success Alert Banner */}
      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-700 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{saveSuccessMessage}</span>
          </div>
          <button onClick={() => setSaveSuccessMessage(null)} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Save Error Alert Banner — hiện khi gọi API lưu/hoàn tất/phát hành e-EIR thất bại thật sự */}
      {saveErrorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-700 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span className="font-bold">{saveErrorMessage}</span>
          </div>
          <button onClick={() => setSaveErrorMessage(null)} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>
      )}

      {/* Validation Errors Alert Box */}
      {validationErrors.length > 0 && (
        <div ref={validationErrorsRef} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-700 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Vui lòng hoàn thiện các tiêu chuẩn giám định sau trước khi tiếp tục:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2 text-rose-800">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Container Information & Standards Header Panel */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Hãng Tàu (Carrier)</span>
            <strong className="text-slate-900 font-bold text-sm block mt-0.5">{formData.shippingLine}</strong>
            <span className="text-[10px] text-slate-500 truncate block">{formData.owner}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Kích Cỡ &amp; ISO Code</span>
            <strong className="text-slate-900 font-bold text-sm block mt-0.5">{formData.size} {formData.type}</strong>
            <span className="text-[10px] font-mono text-slate-500">ISO: {formData.isoCode}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tiêu Chuẩn Giám Định</span>
            <select
              value={formData.standard}
              onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
              disabled={readOnly}
              className="mt-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-bold text-xs focus:outline-none focus:border-blue-500 w-full"
            >
              {/* Lấy từ DM Tiêu Chuẩn Giám Định (trước gõ cứng 4 tiêu chuẩn không có trong danh mục). Giữ giá trị
                  đang lưu nếu nó không còn trong danh mục để không tự đổi tiêu chuẩn của phiếu cũ. */}
              <option value="">-- Chọn tiêu chuẩn --</option>
              {formData.standard && !standards.some((st) => st.standardCode === formData.standard) && (
                <option value={formData.standard}>{formData.standard}</option>
              )}
              {standards.filter((st) => st.status === 'ACTIVE').map((st) => (
                <option key={st.id} value={st.standardCode}>
                  {st.standardName}{!st.standardName.includes(st.standardCode) ? ` (${st.standardCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Giám Định Viên (Surveyor)</span>
            {/* Lấy tự động theo tài khoản đang đăng nhập, không cho sửa — backend cũng tự tra lại
                theo Users.Id nên dù có sửa ở đây, dữ liệu lưu xuống DB vẫn là người đăng nhập thật. */}
            <input
              type="text"
              value={formData.surveyor}
              readOnly
              disabled
              className="mt-1 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-slate-500 text-xs focus:outline-none w-full cursor-not-allowed"
            />
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Thời Điểm Gate-In</span>
            <span className="text-slate-700 font-mono text-xs block mt-1.5">{formData.gateInTime}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Trạng Thái Survey</span>
            <span className="mt-1 inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 text-[11px]">
              {formData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Grading & Condition Interactive Selector Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Phân Loại Tình Trạng Vỏ Container (Grading &amp; Condition Classification)*</span>
        </h3>

        {/* Chỉ hiện tên + nút chọn nhỏ (chip) — bỏ mô tả dài và thẻ to trước đây theo yêu cầu. */}
        <div className="flex flex-wrap gap-2">
          {activeGrades.map((grade, index) => {
            const bucket = gradeBucket(index, activeGrades.length);
            const isSelected = formData.condition === bucket && formData.qualityGrade === grade.gradeCode;
            const selectedClasses =
              bucket === 'AV'
                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                : bucket === 'CL'
                ? 'bg-amber-500 border-amber-400 text-slate-950'
                : 'bg-rose-500 border-rose-400 text-white';
            return (
              <button
                key={grade.id}
                type="button"
                disabled={readOnly}
                onClick={() => setFormData({ ...formData, condition: bucket, qualityGrade: grade.gradeCode as any })}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected ? selectedClasses : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white/80' : 'bg-slate-300'}`} />
                {grade.gradeName}
                <span className="opacity-70 font-mono text-[10px]">({bucket})</span>
              </button>
            );
          })}
        </div>

        {formData.condition === 'DM' && !readOnly && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-rose-700 font-bold">{formData.damages?.length || 0} mục tổn thất đã ghi</span>
            <button
              type="button"
              onClick={() => handleOpenAddDamage()}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[11px] shadow cursor-pointer"
            >
              + Thêm Lỗi
            </button>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs - Focused on Fast Code Entry */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('DAMAGES')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'DAMAGES'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'bg-white text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Nhập &amp; Quản Lý Mã Lỗi Tổn Thất</span>
          <span className="px-2 py-0.5 bg-slate-50 rounded-full font-mono text-[10px]">
            {formData.damages?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CLEANING')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'CLEANING'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-white text-slate-500 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span>Hạng Mục Vệ Sinh &amp; Bảng Giá</span>
          <span className="px-2 py-0.5 bg-slate-50 rounded-full font-mono text-[10px] text-amber-700">
            {formData.cleaningItems?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('CHECKLIST')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'CHECKLIST'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-slate-500 hover:text-slate-900'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Checklist {formData.checklist.length} Khu Vực Khảo Sát</span>
        </button>

        <button
          onClick={() => setActiveTab('PHOTOS')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'PHOTOS'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white text-slate-500 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Hình Ảnh Hiện Trường ({formData.photos?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Fast Damage Codes Input & Table */}
      {activeTab === 'DAMAGES' && (
        <div className="space-y-5">
          {/* Quick Direct Code Input Bar */}
          {!readOnly && (
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-600/20 border border-rose-500/30 text-rose-400 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Nhập Nhanh Mã Lỗi Hiện Trường (Fast Damage Code Entry)</span>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-700 font-mono text-[10px] font-bold rounded-full">
                      Surveyor Tool
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhân viên nhập trực tiếp mã vị trí, mã hư hỏng IICL và phương án sửa chữa STS.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenAddDamage()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-rose-400" />
                <span>Mở Form Chi Tiết Đầy Đủ</span>
              </button>
            </div>

            {/* Inline Fast Input Form */}
            <form onSubmit={handleQuickAddDamage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  1. Vị Trí (Location)*
                </label>
                <select
                  value={quickLocation}
                  onChange={(e) => setQuickLocation(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs focus:outline-none focus:border-rose-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.code}>
                      {loc.code} - {loc.vietnameseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  2. Mã Lỗi (Damage)*
                </label>
                <select
                  value={quickDamageCode}
                  onChange={(e) => setQuickDamageCode(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-rose-700 font-mono font-bold text-xs focus:outline-none focus:border-rose-500"
                >
                  {damageCodes.map((dmg) => (
                    <option key={dmg.id} value={dmg.code}>
                      {dmg.code} &bull; {dmg.vietnameseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  3. Mã Sửa (Repair/STS)*
                </label>
                <select
                  value={quickRepairCode}
                  onChange={(e) => setQuickRepairCode(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-blue-700 font-mono font-bold text-xs focus:outline-none focus:border-rose-500"
                >
                  {repairCodes.map((rep) => (
                    <option key={rep.id} value={rep.repairCode}>
                      {rep.repairCode} &bull; {rep.vietnameseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  4. Mức Độ (Severity)
                </label>
                <select
                  value={quickSeverity}
                  onChange={(e) => setQuickSeverity(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="LOW">LOW (Nhẹ)</option>
                  <option value="MEDIUM">MEDIUM (Vừa)</option>
                  <option value="HIGH">HIGH (Nặng)</option>
                  <option value="CRITICAL">CRITICAL (Thủng/Nát)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  5. Kích Thước (LxW mm)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={quickLength}
                    onChange={(e) => setQuickLength(e.target.value)}
                    placeholder="Dài"
                    className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none"
                  />
                  <span className="text-slate-500">x</span>
                  <input
                    type="number"
                    value={quickWidth}
                    onChange={(e) => setQuickWidth(e.target.value)}
                    placeholder="Rộng"
                    className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!quickLocation || !quickDamageCode || !quickRepairCode}
                  className="w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Mã Lỗi</span>
                </button>
              </div>
            </form>
          </div>
          )}

          {/* Damages List Table */}
          <DamageListTable
            damages={formData.damages || []}
            onAddDamage={() => handleOpenAddDamage()}
            onEditDamage={(d) => {
              setEditingDamage(d);
              setIsDamageModalOpen(true);
            }}
            onDeleteDamage={handleDeleteDamage}
            onViewPhoto={(url, caption) => setPhotoViewerUrl({ url, caption })}
            readOnly={readOnly}
          />
        </div>
      )}

      {/* Tab 2: Cleaning Tariffs & Specifications Management */}
      {activeTab === 'CLEANING' && (
        <fieldset disabled={readOnly} className="contents">
        <div className="space-y-5">
          {/* Header Summary Card */}
          <div className="p-5 bg-gradient-to-r from-amber-50 via-white to-white border border-amber-200 rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
                  <Droplets className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Hạng Mục Vệ Sinh &amp; Biểu Phí (Cleaning Services &amp; Tariffs)</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 font-mono text-xs font-bold rounded-lg">
                      {formData.containerNo}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Áp dụng đơn giá theo quy cách <strong className="text-amber-700">{formData.sizeType || `${formData.size}${formData.type}`}</strong> &bull; Hãng tàu <strong className="text-sky-700">{formData.shippingLine}</strong>
                  </p>
                </div>
              </div>

              {/* Financial Quick Metrics */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Chưa VAT</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    {(formData.cleaningTotalCost || formData.cleaningEstimatedCost || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-100" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">VAT (8%)</span>
                  <span className="font-mono font-bold text-slate-700 text-sm">
                    {Math.round((formData.cleaningTotalCost || formData.cleaningEstimatedCost || 0) * 0.08).toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-100" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Tổng Thanh Toán</span>
                  <span className="font-mono font-black text-emerald-700 text-base">
                    {Math.round((formData.cleaningTotalCost || formData.cleaningEstimatedCost || 0) * 1.08).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Lý do cần vệ sinh — bắt buộc chọn ít nhất 1 khi hoàn tất phân loại CL (xem validateForm) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Hiện Trạng / Lý Do Cần Vệ Sinh*
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { id: 'DUST', label: 'Bụi Bẩn Bám Vách / Sàn' },
                  { id: 'OIL_GREASE', label: 'Dầu Nhớt / Mỡ Bôi Trơn' },
                  { id: 'CHEMICAL_SMELL', label: 'Mùi Hôi Hóa Chất Nồng' },
                  { id: 'CARGO_RESIDUE', label: 'Dư Lượng Hàng Cũ Bám Dính' },
                  { id: 'TRASH_DUNNAGE', label: 'Rác Thải / Gỗ Chèn Lót' },
                  { id: 'FLOOR_DIRTY', label: 'Sàn Dơ / Ẩm Ướt Đọng Nước' },
                  { id: 'STICKER_LABEL', label: 'Tem Nhãn Cước Cũ Còn Dán' },
                  { id: 'MOLD_MOISTURE', label: 'Nấm Mốc / Ẩm Thấp' },
                  { id: 'OTHER', label: 'Khác' }
                ] as { id: CleaningReasonType; label: string }[]).map((item) => {
                  const isSelected = (formData.cleaningReason || []).includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer text-xs transition ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 text-amber-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCleaningReason(item.id)}
                        className="accent-amber-500 rounded cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quick Add from Master Tariffs Grid */}
            <div className={readOnly ? 'hidden' : 'space-y-2'}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chọn Thêm Dịch Vụ Vệ Sinh Từ Master Tariff ({cleaningTariffs.filter((t) => t.status === 'ACTIVE').length} dịch vụ tiêu chuẩn)</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Bấm vào thẻ bên dưới để thêm ngay vào phiếu giám định:
                </span>
              </div>

              {cleaningPriceWarning && (
                <div data-testid="cleaning-price-warning" className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">{cleaningPriceWarning}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {/* cleaningTariffs lấy thật từ backend (/MasterData/cleaning-tariffs) — sửa / thêm / xoá dịch vụ ở màn
                    Master Data sẽ phản ánh ngay tại đây. Dịch vụ chưa có giá cho loại container của hồ sơ thì báo, không thêm. */}
                {cleaningTariffs.filter((t) => t.status === 'ACTIVE').map((tariff) => {
                  const priced = getTariffCost(tariff);
                  const isAlreadyAdded = (formData.cleaningItems || []).some(
                    (item) => item.cleaningCode === tariff.cleaningCode
                  );
                  return (
                    <button
                      key={tariff.id}
                      type="button"
                      onClick={() => {
                        // Trước đây bấm lại thẻ đã chọn không có tác dụng gì (handleAddCleaningItem tự
                        // return sớm để tránh thêm trùng) — người dùng không có cách nào bỏ chọn dịch vụ
                        // ngoài việc bấm nút Xoá ở bảng danh sách bên dưới. Giờ bấm lại = bỏ tích (toggle).
                        if (isAlreadyAdded) {
                          const existing = (formData.cleaningItems || []).find(
                            (item) => item.cleaningCode === tariff.cleaningCode
                          );
                          if (existing) handleRemoveCleaningItem(existing.id);
                        } else {
                          handleAddCleaningItem(tariff);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isAlreadyAdded
                          ? 'bg-amber-50 border-amber-500/40 text-amber-800'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[10px] text-cyan-700">
                            {tariff.cleaningCode}
                          </span>
                          {isAlreadyAdded && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 font-bold rounded text-[9px]">
                              ✓ Đã có
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                          {tariff.vietnameseName || tariff.name}
                        </div>
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{tariff.estimatedDurationMin}p</span>
                        <span className="font-mono font-bold text-amber-700 text-xs">
                          {priced.ok ? `${priced.price.toLocaleString('vi-VN')} đ` : <span className="font-sans font-normal text-[10px] text-amber-700">Chưa có giá</span>}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cleaning Items List Table */}
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Danh Sách Dịch Vụ Vệ Sinh Được Yêu Cầu ({formData.cleaningItems?.length || 0})</span>
              </h4>
            </div>

            {(!formData.cleaningItems || formData.cleaningItems.length === 0) ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <Droplets className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Chưa có dịch vụ vệ sinh nào được chọn</p>
                <p className="text-[11px] text-slate-500">
                  Chọn một hoặc nhiều dịch vụ từ bảng biểu phí phía trên để áp dụng giá tự động.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-3">Mã Dịch Vụ</th>
                      <th className="py-3 px-3">Tên Phương Pháp Vệ Sinh</th>
                      <th className="py-3 px-3">Hóa Chất</th>
                      <th className="py-3 px-3 text-center">Bên Trả Phí</th>
                      <th className="py-3 px-3 text-right">Đơn Giá</th>
                      <th className="py-3 px-3 text-right">Thành Tiền</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {formData.cleaningItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-100 transition">
                        <td className="py-3 px-3 font-mono font-bold text-cyan-700">
                          {item.cleaningCode}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{item.cleaningName}</div>
                          {item.notes && <div className="text-[10px] text-slate-500">{item.notes}</div>}
                        </td>
                        <td className="py-3 px-3">
                          {item.chemicalRequired ? (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-700 rounded font-semibold text-[10px]">
                              {item.chemicalName || 'Hóa chất kiềm'}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            {[
                              { id: 'U', label: 'User' },
                              { id: 'O', label: 'Owner' },
                              { id: 'T', label: 'Truck' }
                            ].map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleUpdateCleaningParty(item.id, p.id as any)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                  item.responsibleParty === p.id
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                          {(item.unitPrice || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          {(item.totalPrice || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCleaningStatus(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              item.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                                : item.status === 'IN_PROGRESS'
                                ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-500/30'
                                : 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                            }`}
                          >
                            {item.status === 'COMPLETED'
                              ? '✓ Đã Rửa Xong'
                              : item.status === 'IN_PROGRESS'
                              ? '⏳ Đang Rửa'
                              : 'Chờ Xử Lý'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!readOnly && <button
                            type="button"
                            onClick={() => handleRemoveCleaningItem(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </fieldset>
      )}

      {/* Tab 3: Checklist các khu vực khảo sát (danh mục SURVEY_CHECKLIST) — trước đây nút bấm chuyển tab được nhưng không có
          bất kỳ nội dung nào render ra (thiếu hẳn khối JSX cho activeTab === 'CHECKLIST'), khiến
          giám định viên bấm vào thấy màn hình trắng trơn dù handleToggleChecklistStatus đã có sẵn. */}
      {activeTab === 'CHECKLIST' && (
        <fieldset disabled={readOnly} className="contents">
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-400" />
              <span>Checklist {formData.checklist.length} Khu Vực Khảo Sát Theo Chuẩn {formData.standard}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Đánh giá Đạt / Không Đạt / Không Áp Dụng cho từng khu vực kết cấu container. Chọn "Không Đạt" sẽ tự
              chuyển phân loại vỏ sang CL (khu vực Vệ Sinh) hoặc DM (các khu vực còn lại).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {formData.checklist.map((item) => (
              <div
                key={item.zoneKey}
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  item.status === 'FAIL'
                    ? 'bg-rose-50 border-rose-200'
                    : item.status === 'NA'
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{item.zoneName}</span>
                  {item.damageCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-700 font-mono text-[10px] font-bold rounded-full shrink-0">
                      {item.damageCount} lỗi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {(['PASS', 'FAIL', 'NA'] as ZoneCheckStatus[]).map((st) => {
                    // Khu vực đang có hư hỏng thật (damageCount > 0, đồng bộ tự động từ tab Tổn Thất) thì
                    // khóa "Đạt"/"N/A" — trước đây cho đổi tay tự do, tạo trạng thái mâu thuẫn (badge
                    // "Đạt" xanh nhưng vẫn hiện "X lỗi" đỏ), rồi hễ sửa 1 hư hỏng liên quan là bị tính lại
                    // và âm thầm nhảy ngược về "Không Đạt", xóa mất lựa chọn tay của giám định viên mà
                    // không báo gì. Phải xóa/sửa hết hư hỏng ở khu vực đó trong tab Tổn Thất trước.
                    const disabled = item.damageCount > 0 && st !== 'FAIL';
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleToggleChecklistStatus(item.zoneKey, st)}
                        title={disabled ? 'Còn hư hỏng ghi nhận tại khu vực này — xóa/sửa trong tab Tổn Thất trước' : undefined}
                        className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${
                          disabled
                            ? 'bg-slate-50 text-slate-700 border border-slate-100 cursor-not-allowed'
                            : 'cursor-pointer'
                        } ${
                          !disabled && item.status === st
                            ? st === 'PASS'
                              ? 'bg-emerald-500 text-slate-950'
                              : st === 'FAIL'
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-500 text-white'
                            : !disabled
                            ? 'bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200'
                            : ''
                        }`}
                      >
                        {st === 'PASS' ? 'Đạt' : st === 'FAIL' ? 'Không Đạt' : 'N/A'}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        </fieldset>
      )}

      {/* Tab 4: Photos Management */}
      {activeTab === 'PHOTOS' && (
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Quản Lý Hình Ảnh Giám Định Hiện Trường (Survey Photos)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Bắt buộc tối thiểu 01 Ảnh Toàn Cảnh (Overview) và các ảnh chụp chi tiết tổn thất.
              </p>
            </div>

            {/* Quick Upload Buttons — chọn file thật, upload qua Depot.FileServer */}
            <div className={readOnly ? 'hidden' : 'flex items-center gap-2 flex-wrap'}>
              <input
                type="file"
                accept="image/*"
                ref={overviewFileInputRef}
                className="hidden"
                onChange={(e) => handlePhotoFileSelected(e, 'OVERVIEW')}
              />
              <input
                type="file"
                accept="image/*"
                ref={detailFileInputRef}
                className="hidden"
                onChange={(e) => handlePhotoFileSelected(e, 'DETAIL')}
              />

              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => overviewFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 border border-blue-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? 'Đang tải lên...' : '+ Ảnh Toàn Cảnh'}</span>
              </button>

              <button
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => detailFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-rose-700 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? 'Đang tải lên...' : '+ Ảnh Chi Tiết Lỗi'}</span>
              </button>
            </div>
          </div>

          {photoUploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{photoUploadError}</span>
            </div>
          )}

          {/* Photo Cards Grid */}
          {(!formData.photos || formData.photos.length === 0) ? (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <Camera className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Chưa có hình ảnh nào được tải lên</h4>
              <p className="text-xs text-slate-500">
                Vui lòng nhấn "+ Bộ Ảnh Chuẩn" hoặc "+ Ảnh Toàn Cảnh" để hoàn tất yêu cầu kiểm định.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden group space-y-2 p-3 shadow-lg"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-white">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {/* 2 badge này đè trực tiếp lên ảnh chụp thật (không phải panel nền app) nên luôn giữ
                        nền tối trong suốt + chữ sáng để đọc được bất kể ảnh nền sáng/tối thế nào — không
                        đổi theo theme sáng của trang. */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white font-mono text-[9px] rounded font-bold">
                      {photo.type}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/85 text-amber-300 font-mono text-[9px] rounded font-bold flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {photo.uploadedAt || '2026-08-14 09:00'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-700 line-clamp-1">{photo.caption}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{photo.surveyor}</span>
                      <span>{photo.uploadedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPhotoViewerUrl({ url: photo.url, caption: photo.caption })}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Xem lớn
                    </button>
                    {!readOnly && <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-xs text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* General Remarks / Notes */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2">
        <label className="block text-xs font-bold text-slate-900 uppercase">
          Ghi Chú Tổng Quan Của Surveyor &amp; Chỉ Đạo Khai Thác Bãi
        </label>
        <textarea
          rows={2}
          value={formData.remarks || ''}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          disabled={readOnly}
          placeholder="Nhập ghi chú tình trạng đặc biệt, yêu cầu chuyển bãi sửa chữa EMR hoặc lưu ý khi cấp vỏ cho khách..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs focus:outline-none resize-none"
        />
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg sticky bottom-4 z-40">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Chế độ kiểm định trực tiếp tại bãi &bull; Surveyor: <strong className="text-slate-900">{formData.surveyor}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Đóng Lại
          </button>
          {!readOnly && <button
            onClick={handleCompleteSurvey}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh</span>
          </button>}
        </div>
      </div>

      {/* Damage Add/Edit Modal */}
      <DamageFormModal
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
        onSave={handleSaveDamage}
        initialData={editingDamage}
        defaultLocationCode={selectedLocationCode}
        defaultLocationName={selectedLocationName}
        locations={locations}
        damageCodes={damageCodes}
        repairCodes={repairCodes}
        currentUser={currentUser}
      />

      {/* Image Lightbox Viewer Modal — overlay toàn màn hình giữ nền tối mờ (không đổi theo theme sáng
          của trang) để tách bạch modal khỏi nền, đúng quy ước UX chuẩn cho lightbox xem ảnh. */}
      {photoViewerUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-3xl w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900">{photoViewerUrl.caption}</h4>
              <button
                onClick={() => setPhotoViewerUrl(null)}
                className="text-slate-500 hover:text-slate-900 font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 rounded-2xl max-h-[70vh] flex items-center justify-center overflow-hidden">
              <img
                src={photoViewerUrl.url}
                alt={photoViewerUrl.caption}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
