import React, { useState } from 'react';
import { containerApi, surveyApi, masterDataApi } from '../../../api';
import { useDepot } from '../../../context/DepotContext';
import {
  SurveyItemRecord,
  DamageLocationMasterItem,
  DamageCodeMasterItem,
  RepairCodeMasterItem,
  GradeMasterItem,
  InspectionStandardMasterItem,
  CleaningTariffMasterItem
} from '../types';
import { INITIAL_CHECKLIST_TEMPLATE } from '../mockData';
import { BACKEND_ISO_SIZE_MAP, BACKEND_SHIPPING_LINE_MAP, isReeferSizeCode } from '../utils/containerValidator';
import { SurveyQueueTable } from '../components/SurveyQueueTable';
import { SurveyDetailForm } from '../components/SurveyDetailForm';
import { DamageLocationMaster } from '../components/DamageLocationMaster';
import { DamageCodeMaster } from '../components/DamageCodeMaster';
import { RepairCodeMaster } from '../components/RepairCodeMaster';
import { GradeMaster } from '../components/GradeMaster';
import { InspectionStandardMaster } from '../components/InspectionStandardMaster';
import { SurveyPhotoGallery } from '../components/SurveyPhotoGallery';
import { SurveyHistoryTable } from '../components/SurveyHistoryTable';
import { ContainerSearchModal } from '../components/ContainerSearchModal';
import { EEIRModal } from '../components/EEIRModal';
import { CreateSurveyModal } from '../components/CreateSurveyModal';
import { CleaningMaster } from '../../masterdata/components/CleaningMaster';

import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  History,
  FileCode,
  MapPin,
  Hammer,
  Sparkles,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Search,
  PlusCircle,
  Layers,
  ChevronRight,
  Plus,
  Droplets
} from 'lucide-react';

interface SurveyModulePageProps {
  initialSubTab?: string;
  onNavigateTab?: (tabId: string) => void;
  onSyncContainer?: (
    containerId: string,
    condition: 'AV' | 'CL' | 'DM',
    damages: any[],
    containerData?: any
  ) => void;
}

export const SurveyModulePage: React.FC<SurveyModulePageProps> = ({
  initialSubTab = 'queue',
  onNavigateTab,
  onSyncContainer
}) => {
  // Global survey module state
  const [surveys, setSurveys] = useState<SurveyItemRecord[]>([]);
  const [surveyLoadError, setSurveyLoadError] = useState<string | null>(null);
  // 6 danh mục dưới đây trước đây seed bằng mock cục bộ (INITIAL_DAMAGE_LOCATIONS...) và không hề gọi
  // API — tách rời hoàn toàn khỏi trang "Danh Mục Hệ Thống & Master Data" (MasterDataPage) vốn đã lưu
  // thật xuống bảng MasterCatalogItem qua masterDataApi. Sửa Grade/Mã lỗi... ở trang Master Data thật
  // không hề phản ánh vào đây và ngược lại. Giờ fetch/lưu chung 1 nguồn thật với MasterDataPage.
  const [locations, setLocations] = useState<DamageLocationMasterItem[]>([]);
  const [damageCodes, setDamageCodes] = useState<DamageCodeMasterItem[]>([]);
  const [repairCodes, setRepairCodes] = useState<RepairCodeMasterItem[]>([]);
  const [grades, setGrades] = useState<GradeMasterItem[]>([]);
  const [standards, setStandards] = useState<InspectionStandardMasterItem[]>([]);
  const [cleaningTariffs, setCleaningTariffs] = useState<CleaningTariffMasterItem[]>([]);
  const [masterCatalogError, setMasterCatalogError] = useState<string | null>(null);

  // Fetch 6 danh mục dùng chung với MasterDataPage — cùng mapping JsonData -> field như bên đó (xem
  // MasterDataPage.tsx `load()`) để 2 nơi luôn đọc/ghi đúng 1 dữ liệu thật.
  React.useEffect(() => {
    const readJson = (value: unknown): Record<string, any> => {
      try { return JSON.parse(String(value || '{}')); } catch { return {}; }
    };
    const load = async () => {
      const [locationResponse, damageResponse, repairResponse, gradeResponse, standardResponse, cleaningResponse] = await Promise.all([
        masterDataApi.getCatalog('DAMAGE_LOCATION'), masterDataApi.getCatalog('DAMAGE_CODE'),
        masterDataApi.getCatalog('REPAIR_CODE'), masterDataApi.getCatalog('GRADE'),
        masterDataApi.getCatalog('INSPECTION_STANDARD'), masterDataApi.getCatalog('CLEANING_TARIFF')
      ]);
      const mapItems = (response: any) => response?.data || [];
      setLocations(mapItems(locationResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', category: readJson(item.jsonData).category || 'STRUCTURE', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setDamageCodes(mapItems(damageResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, damageType: readJson(item.jsonData).damageType || 'OTHER', description: item.description || '', severity: readJson(item.jsonData).severity || 'MEDIUM', standard: readJson(item.jsonData).standard || 'UNIVERSAL', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setRepairCodes(mapItems(repairResponse).map((item: any) => ({ id: item.id, repairCode: item.code, stsCode: readJson(item.jsonData).stsCode || item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', repairType: readJson(item.jsonData).repairType || 'STRAIGHTEN', labourRate: readJson(item.jsonData).labourRate || 0, labourHours: readJson(item.jsonData).labourHours || 0, materialEstimatedCost: readJson(item.jsonData).materialEstimatedCost || 0, status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setGrades(mapItems(gradeResponse).map((item: any) => ({ id: item.id, gradeCode: item.code, gradeName: item.nameVi || item.name, description: item.description || '', shippingLine: readJson(item.jsonData).shippingLine || 'ALL', customer: readJson(item.jsonData).customer || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setStandards(mapItems(standardResponse).map((item: any) => ({ id: item.id, standardCode: item.code, standardName: item.name, shippingLine: readJson(item.jsonData).shippingLine || 'ALL', containerType: readJson(item.jsonData).containerType || 'ALL', containerSize: readJson(item.jsonData).containerSize || 'ALL', version: readJson(item.jsonData).version || '', effectiveDate: readJson(item.jsonData).effectiveDate || '', description: item.description || '', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setCleaningTariffs(mapItems(cleaningResponse).map((item: any) => {
        const data = readJson(item.jsonData);
        return {
          id: item.id, cleaningCode: item.code, cedexCode: data.cedexCode || '', name: item.name,
          vietnameseName: item.nameVi || item.name, category: data.category || 'GENERAL_SWEEP', description: item.description || '',
          applicableSizes: data.applicableSizes || ['20', '40', '45'], price20DC: data.price20DC || 0, price40DC: data.price40DC || 0,
          price40HC: data.price40HC || 0, price45HC: data.price45HC || 0, price20RF: data.price20RF || 0, price40HR: data.price40HR || 0,
          currency: data.currency || 'VND', estimatedDurationMin: data.estimatedDurationMin || 0, waterUsageLiters: data.waterUsageLiters || 0,
          chemicalRequired: data.chemicalRequired || '', equipmentUsed: data.equipmentUsed || '', responsiblePartyDefault: data.responsiblePartyDefault || 'U',
          vatPercent: data.vatPercent || 8, status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder
        } as CleaningTariffMasterItem;
      }));
    };
    load().catch((error) => setMasterCatalogError(error instanceof Error ? error.message : 'Không thể tải danh mục kỹ thuật từ backend.'));
  }, []);

  // `MasterCatalogItem.Id` backend là `long`, KHÔNG phải Guid — item mới tạo trên UI (chưa lưu) dùng id
  // tạm nên chỉ cần phân biệt "toàn số" (đã có thật trong DB) hay không (xem MasterDataPage.tsx).
  const isPersistedCatalogId = (id: unknown) => /^\d+$/.test(String(id ?? ''));

  const persistCatalog = async (catalogType: string, previous: any[], updated: any[], codeKey: string) => {
    const previousIds = new Set(previous.map((item) => String(item.id)));
    const updatedIds = new Set(updated.map((item) => String(item.id)));
    const remoteResponse: any = await masterDataApi.getCatalog(catalogType);
    const remoteByCode = new Map((remoteResponse.data || []).map((item: any) => [String(item.code).toUpperCase(), item]));
    await Promise.all(previous.filter((item) => !updatedIds.has(String(item.id)) && isPersistedCatalogId(item.id))
      .map((item) => masterDataApi.deactivateCatalog(String(item.id))));
    await Promise.all(updated.map(async (item, index) => {
      const code = String(item[codeKey] || item.code || `${catalogType}_${index + 1}`).trim().toUpperCase();
      const request = {
        catalogType, code, name: item.name || item.nameVi || item.gradeName || code,
        nameVi: item.vietnameseName || item.nameVi || item.gradeName || item.name,
        description: item.description || '', jsonData: JSON.stringify(item), isActive: item.status !== 'INACTIVE', sortOrder: item.sortOrder ?? index + 1
      };
      const remoteItem: any = remoteByCode.get(code);
      if (previousIds.has(String(item.id)) && isPersistedCatalogId(item.id)) {
        await masterDataApi.updateCatalog(String(item.id), request);
      } else if (remoteItem?.id) {
        await masterDataApi.updateCatalog(String(remoteItem.id), request);
      } else {
        await masterDataApi.createCatalog(request);
      }
    }));
  };

  // Active view
  const [activeTab, setActiveTab] = useState<string>(initialSubTab === 'dashboard' ? 'queue' : initialSubTab);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyItemRecord | null>(null);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab === 'dashboard' ? 'queue' : initialSubTab);
    }
  }, [initialSubTab]);

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPrefillContNo, setCreatePrefillContNo] = useState('');
  const [eeirSurvey, setEeirSurvey] = useState<SurveyItemRecord | null>(null);

  // Giám định viên lấy tự động theo tài khoản đang đăng nhập thật (không cho nhập tay) — backend sẽ
  // tự tra Users.Id để lấy đúng họ tên thật, currentUser ở đây chỉ dùng hiển thị tạm khi chưa gửi lên.
  const { loggedInUserProfile, showToast } = useDepot();
  const currentUser = loggedInUserProfile?.fullName || 'Chưa đăng nhập';
  const currentUserStaffId = loggedInUserProfile ? Number(loggedInUserProfile.id) : undefined;

  // Round-trip ngược đúng chiều với handleSaveSurvey bên dưới (AV=A, CL=B, DM=C/D).
  const conditionFromRating = (rating?: string): 'AV' | 'CL' | 'DM' =>
    rating === 'A' ? 'AV' : rating === 'B' ? 'CL' : rating ? 'DM' : 'AV';

  const mapJobToSurvey = (job: any): SurveyItemRecord => ({
    id: String(job.id),
    surveyNo: job.survey?.id || job.jobNo,
    containerNo: job.containerNo,
    isoCode: job.isoSize,
    size: job.isoSize,
    type: job.isoSize?.includes('RF') || job.isoSize?.includes('RH') ? 'Reefer' : 'Dry High Cube',
    owner: job.shippingLineCode,
    shippingLine: job.shippingLineCode,
    isReefer: job.isoSize?.includes('RF') || job.isoSize?.includes('RH'),
    gateInTime: job.gateInDate,
    surveyDate: job.survey?.surveyDate || new Date().toISOString(),
    surveyor: job.survey?.surveyorName || currentUser,
    status: job.status === 'SURVEYING' ? 'NEW' : 'IN_PROGRESS',
    standard: 'IICL-6',
    condition: job.survey ? conditionFromRating(job.survey.conditionRating) : 'AV',
    qualityGrade: job.survey?.conditionRating === 'A' ? 'GRADE_A' : 'GENERAL_CARGO',
    damages: (job.survey?.damages || []).map((damage: any) => ({
      id: String(damage.id),
      locationCode: damage.locationCode,
      locationName: damage.component,
      damageCode: damage.damageCode,
      damageName: damage.damageNameVi || damage.damageCode,
      repairCode: damage.repairCode,
      repairName: damage.repairNameVi || damage.repairCode,
      description: damage.notes || '',
      severity: (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(damage.severity) ? damage.severity : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      quantity: damage.quantity,
      // Trước đây kích thước + ảnh hiện trường không được gửi lên backend nên luôn mất khi F5 dù đã
      // nhập ở form Add Damage — giờ backend đã lưu thật (DamageItem.LengthMm/WidthMm/PhotoUrl) nên map
      // ngược lại đây.
      lengthMm: damage.lengthMm != null ? Number(damage.lengthMm) : undefined,
      widthMm: damage.widthMm != null ? Number(damage.widthMm) : undefined,
      photoUrl: damage.photoUrl || undefined,
      createdBy: damage.createdBy || currentUser,
      createdAt: damage.createdAt || job.gateInDate
    })),
    // Trước đây 3 nhóm dữ liệu này chỉ có ở state React (INITIAL_CHECKLIST_TEMPLATE cứng + mảng rỗng),
    // không hề đọc lại từ backend — giờ backend đã lưu thật (SurveyCleaningItem/ChecklistItem/PhotoItem)
    // nên phải map ngược lại đây, nếu không F5 xong dữ liệu tưởng đã lưu vẫn hiện trống như cũ.
    cleaningReason: job.survey?.cleaningReason ? job.survey.cleaningReason.split(',').filter(Boolean) : undefined,
    cleaningMethod: job.survey?.cleaningMethod || undefined,
    cleaningRemarks: job.survey?.cleaningRemarks || undefined,
    cleaningItems: (job.survey?.cleaningItems || []).map((c: any) => ({
      id: String(c.id),
      cleaningCode: c.cleaningCode,
      cleaningName: c.cleaningName,
      category: c.category,
      chemicalRequired: c.chemicalRequired,
      chemicalName: c.chemicalName,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      totalPrice: c.totalPrice,
      responsibleParty: c.responsibleParty,
      status: c.status,
      notes: c.notes,
      washerName: c.washerName,
      completedAt: c.completedAt
    })),
    cleaningTotalCost: (job.survey?.cleaningItems || []).reduce((sum: number, c: any) => sum + (c.totalPrice || 0), 0),
    checklist:
      job.survey?.checklistItems?.length > 0
        ? job.survey.checklistItems.map((c: any) => ({
            zoneKey: c.zoneKey,
            zoneName: c.zoneName,
            status: c.status,
            notes: c.notes,
            damageCount: c.damageCount
          }))
        : INITIAL_CHECKLIST_TEMPLATE.map((item) => ({ ...item })),
    photos: (job.survey?.photos || []).map((p: any) => ({
      id: String(p.id),
      url: p.url,
      type: p.type,
      caption: p.caption,
      surveyor: p.surveyorName,
      uploadedAt: p.uploadedAt,
      fileSizeKb: p.fileSizeKb
    })),
    surveyClaimedByStaffId: job.surveyClaimedByStaffId ?? undefined,
    surveyClaimedByName: job.surveyClaimedByName ?? undefined,
    surveyClaimedAt: job.surveyClaimedAt ?? undefined,
    remarks: job.survey?.overallNotes || `Job ${job.jobNo} từ Gate-In SQL Server`
  });

  const refreshSurveys = React.useCallback(() => {
    return containerApi.getAll({ status: 'SURVEYING' })
      .then((response: any) => {
        if (response?.statusCode !== 200 || !Array.isArray(response.data)) {
          throw new Error(response?.message || 'Không thể tải Survey Queue từ SQL Server.');
        }
        setSurveys(response.data.map(mapJobToSurvey));
      })
      .catch((error) => {
        setSurveyLoadError(error instanceof Error ? error.message : 'Không thể tải Survey Queue từ SQL Server.');
      });
  }, []);

  React.useEffect(() => {
    refreshSurveys();
  }, [refreshSurveys]);

  // Mở phiếu giám định: với hồ sơ thật từ Gate-In còn đang chờ (status NEW), phải "nhận" (khóa) trước
  // qua backend để chặn 2 surveyor cùng mở 1 container — record Pre-Survey local (id "SURV-...") hoặc
  // hồ sơ đang/đã giám định (đã có người nhận từ trước, kể cả chính mình) thì mở thẳng, không cần khóa lại.
  const handleOpenSurvey = async (survey: SurveyItemRecord) => {
    const isBackendJob = /^\d+$/.test(survey.id);
    if (!isBackendJob || survey.status !== 'NEW') {
      setSelectedSurvey(survey);
      return;
    }

    if (!currentUserStaffId) {
      showToast('Không xác định được tài khoản đăng nhập, vui lòng đăng nhập lại.', 'error');
      return;
    }

    try {
      const response: any = await surveyApi.claimSurvey(survey.id, currentUserStaffId);
      if (response?.statusCode !== 200) {
        throw new Error(response?.message || 'Không thể nhận giám định container này.');
      }
      const claimed: SurveyItemRecord = {
        ...survey,
        surveyClaimedByStaffId: currentUserStaffId,
        surveyClaimedByName: currentUser
      };
      setSurveys((prev) => prev.map((s) => (s.id === survey.id ? claimed : s)));
      setSelectedSurvey(claimed);
    } catch (error: any) {
      const message = error?.response?.data?.data || error?.response?.data?.message
        || (error instanceof Error ? error.message : 'Không thể nhận giám định container này.');
      showToast(message, 'error', 'Container đang được giám định');
      // Đồng bộ lại danh sách để hiển thị đúng ai đang giữ khóa hiện tại (tránh nút vẫn tưởng đang mở).
      refreshSurveys();
    }
  };

  // Quay lại danh sách: nếu đang giữ khóa 1 hồ sơ thật, tự động nhả khóa để người khác nhận được thay vì
  // kẹt tới khi hết hạn (30 phút). Trước đây còn check thêm `status === 'NEW'` — nhưng handleSaveDraft
  // đổi status cục bộ sang 'IN_PROGRESS' ngay sau lần Lưu Tạm đầu tiên dù backend vẫn giữ nguyên khóa
  // (job vẫn SURVEYING), nên điều kiện đó luôn sai và khóa bị bỏ quên không nhả sau khi đã lưu nháp ít
  // nhất 1 lần. Chỉ dựa vào chính chủ khóa (surveyClaimedByStaffId) — release vô hại nếu khóa đã được
  // backend tự giải phóng từ trước (nộp phiếu thật), vì backend chỉ 400 âm thầm khi không còn là chủ khóa.
  const handleBackFromDetail = () => {
    if (
      selectedSurvey &&
      /^\d+$/.test(selectedSurvey.id) &&
      selectedSurvey.surveyClaimedByStaffId === currentUserStaffId &&
      currentUserStaffId
    ) {
      surveyApi.releaseSurveyClaim(selectedSurvey.id, currentUserStaffId).catch(() => {});
      setSurveys((prev) =>
        prev.map((s) =>
          s.id === selectedSurvey.id
            ? { ...s, surveyClaimedByStaffId: undefined, surveyClaimedByName: undefined }
            : s
        )
      );
    }
    setSelectedSurvey(null);
  };

  // Menu items specification from requirements
  const menuItems = [
    { id: 'queue', label: 'Chờ Giám định', icon: Clock, badge: surveys.filter((s) => s.status === 'NEW' || s.status === 'ASSIGNED').length },
    { id: 'in_progress', label: 'Đang Giám định', icon: ClipboardCheck, badge: surveys.filter((s) => s.status === 'IN_PROGRESS').length },
    { id: 'completed', label: 'Hoàn tất Giám định', icon: CheckCircle2, badge: surveys.filter((s) => s.status === 'COMPLETED' || s.status === 'EEIR_ISSUED').length },
    { id: 'history', label: 'Lịch sử Giám định', icon: History, badge: null },
    { id: 'cleaning_tariffs', label: 'Biểu Phí Vệ Sinh (Cleaning)', icon: Droplets, badge: cleaningTariffs.length },
    { id: 'damage_locations', label: 'Danh mục Damage Location', icon: MapPin, badge: locations.length },
    { id: 'damage_codes', label: 'Danh mục Damage Code', icon: FileCode, badge: damageCodes.length },
    { id: 'repair_codes', label: 'Danh mục Repair Code', icon: Hammer, badge: repairCodes.length },
    { id: 'grades', label: 'Danh mục Grade', icon: Sparkles, badge: grades.length },
    { id: 'standards', label: 'Danh mục Tiêu chuẩn', icon: ShieldCheck, badge: standards.length },
    { id: 'photos', label: 'Quản lý Hình ảnh', icon: ImageIcon, badge: null },
    { id: 'eeir_list', label: 'Chứng từ e-EIR', icon: FileText, badge: null }
  ];

  // Save / Update Survey handler
  const handleSaveSurvey = async (updated: SurveyItemRecord, isDraft: boolean = false) => {
    // `DepotJob.Id` backend là `long` (vd "42"), KHÔNG phải Guid — `mapJobToSurvey` set
    // `id: String(job.id)` cho job thật, còn record Pre-Survey tạo tại chỗ (handleStartSurvey) dùng id
    // giả dạng "SURV-XXXXX". Regex GUID cũ luôn false với id thật, khiến handleSaveSurvey chỉ cập nhật
    // state React cục bộ mà KHÔNG BAO GIỜ gọi `surveyApi.submitSurvey` cho container đã Gate-In thật —
    // dữ liệu giám định nhập vào không lưu xuống Postgres, mất khi F5.
    const isBackendJob = /^\d+$/.test(updated.id);

    if (isBackendJob) {
      // response giữ kiểu `any` như phần còn lại của codebase — `ApiResponse<T>` khai báo field
      // `success`/`message` nhưng backend thật trả về `statusCode`/`message` (ResponseSingleContentModel),
      // lệch nhau ở tầng rộng hơn ngoài phạm vi module Survey nên không sửa ở đây.
      let response: any;
      try {
        response = await surveyApi.submitSurvey(updated.id, {
        surveyorName: currentUser,
        // Giám định viên thật lấy theo Users.Id của tài khoản đang đăng nhập — backend tự tra ngược
        // ra họ tên thật và ghi đè surveyorName ở trên, không cho nhập tay.
        surveyorStaffId: currentUserStaffId,
        conditionRating: updated.condition === 'AV' ? 'A' : updated.condition === 'CL' ? 'B' : 'C',
        notes: updated.remarks || '',
        damages: (updated.damages || []).map((damage) => {
          // Định mức nhân công/vật tư tra theo đúng Repair Code đã chọn trong danh mục — trước đây gán
          // cứng 1h/150.000đ/0đ cho MỌI lỗi bất kể mã sửa chữa thật (VD RP_FLOOR_SCT 2.5h + 1.400.000đ
          // vật tư), khiến chi phí lưu xuống SQL Server luôn sai lệch với con số đã hiển thị cho surveyor
          // trên form Add Damage.
          const rep = repairCodes.find((r) => r.repairCode === damage.repairCode);
          return {
            component: damage.locationName,
            locationCode: damage.locationCode,
            damageCode: damage.damageCode,
            repairCode: damage.repairCode,
            quantity: damage.quantity || 1,
            unit: 'vị trí',
            laborHours: rep?.labourHours ?? 1,
            laborRate: rep?.labourRate ?? 150000,
            materialCost: rep?.materialEstimatedCost ?? 0,
            severity: damage.severity,
            notes: damage.description,
            // Kích thước + ảnh hiện trường của từng lỗi — trước đây không gửi lên nên mất khi F5.
            lengthMm: damage.lengthMm,
            widthMm: damage.widthMm,
            photoUrl: damage.photoUrl
          };
        }),
        // Trước đây 3 nhóm dữ liệu này (dịch vụ vệ sinh + giá, checklist 11 khu vực, ảnh hiện trường)
        // KHÔNG được gửi lên backend nên mất trắng mỗi khi F5 — giờ gửi đủ để lưu thật xuống Postgres.
        cleaningMethod: updated.cleaningMethod,
        cleaningRemarks: updated.cleaningRemarks,
        cleaningReason: updated.cleaningReason || [],
        cleaningItems: (updated.cleaningItems || []).map((item) => ({
          cleaningCode: item.cleaningCode,
          cleaningName: item.cleaningName,
          category: item.category,
          chemicalRequired: !!item.chemicalRequired,
          chemicalName: item.chemicalName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          responsibleParty: item.responsibleParty,
          status: item.status || 'REQUIRED',
          notes: item.notes,
          washerName: item.washerName
        })),
        checklist: (updated.checklist || []).map((item) => ({
          zoneKey: item.zoneKey,
          zoneName: item.zoneName,
          status: item.status,
          notes: item.notes,
          damageCount: item.damageCount || 0
        })),
        photos: (updated.photos || []).map((photo) => ({
          url: photo.url,
          type: photo.type,
          caption: photo.caption,
          surveyorName: photo.surveyor,
          uploadedAt: photo.uploadedAt,
          fileSizeKb: photo.fileSizeKb
        })),
        // true = "Lưu Tạm": backend giữ nguyên job ở SURVEYING thay vì chuyển ESTIMATING/READY_FOR_OUT,
        // để job không bị rớt khỏi mọi tab hàng đợi (vốn chỉ fetch container status=SURVEYING) chỉ vì
        // surveyor lưu tiến độ giữa chừng thay vì nộp phiếu thật.
        isDraft
        });
      } catch (err: any) {
        // Backend trả HTTP 400/500 thật (không phải 200 kèm statusCode lỗi trong body) khi submit thất
        // bại — axios tự throw trước khi tới được check `response?.statusCode !== 200` bên dưới, nên
        // trước đây người dùng chỉ thấy thông báo Axios chung chung ("Request failed with status code
        // 400") thay vì lý do thật ("Thiếu giám định viên...", "Mã công việc không tồn tại..."). Backend
        // trả lý do chi tiết trong `data`, còn `message` chỉ là tên nhóm lỗi chung.
        const body = err?.response?.data;
        const detail = [body?.message, body?.data].filter((v) => typeof v === 'string' && v).join(': ');
        throw new Error(detail || 'Không thể lưu giám định vào SQL Server.');
      }

      if (response?.statusCode !== 200) {
        throw new Error(response?.message || 'Không thể lưu giám định vào SQL Server.');
      }
    }

    // Nộp phiếu thật (không phải nháp) thì backend đã tự giải phóng khóa "nhận giám định" (xem
    // SubmitSurveyAsync) — phải xóa theo ở state cục bộ, nếu không handleBackFromDetail vẫn tưởng đang
    // giữ khóa và cứ gọi release lại (vô hại nhưng thừa), còn SurveyQueueTable vẫn hiện nhầm badge khóa.
    const persisted: SurveyItemRecord =
      isBackendJob && !isDraft
        ? { ...updated, surveyClaimedByStaffId: undefined, surveyClaimedByName: undefined, surveyClaimedAt: undefined }
        : updated;

    setSurveys((prev) => {
      const exists = prev.some((s) => s.id === persisted.id);
      if (exists) {
        return prev.map((s) => (s.id === persisted.id ? persisted : s));
      }
      return [persisted, ...prev];
    });
    setSelectedSurvey(persisted);

    if (onSyncContainer) {
      onSyncContainer(
        updated.containerNo,
        updated.condition as 'AV' | 'CL' | 'DM',
        updated.damages || [],
        {
          size: updated.size,
          type: updated.type,
          shippingLine: updated.shippingLine,
          surveyNo: updated.surveyNo,
          eeirNo: updated.eeirNo,
          grade: updated.qualityGrade
        }
      );
    }
  };

  // Full create new survey handler — CreateSurveyModal luôn build 1 record với id giả "SURV-xxx" (container
  // nhập từ đầu, độc lập hoàn toàn với luồng Gate-In thật). Trước đây record này chỉ tồn tại trong state
  // React của phiên làm việc, KHÔNG BAO GIỜ lưu xuống backend — F5 là mất trắng dù đã nhập đủ hư hỏng/vệ
  // sinh/checklist/ảnh. Giờ với container coi như "đã ở trong bãi" (không phải Pre-Survey), tự động Gate-In
  // trước để có DepotJob thật, rồi nộp luôn phiếu giám định vào job đó — tái dùng đúng handleSaveSurvey.
  const handleCreateNewSurvey = async (newRecord: SurveyItemRecord, openImmediately: boolean = true) => {
    // Pre-Survey nghĩa là container CHƯA thật sự vào cổng — không thể tự Gate-In hộ (sẽ tạo dữ liệu xe/
    // tài xế giả và chặn luôn lượt Gate-In thật sau này vì backend không cho 2 job hoạt động cùng 1
    // container). Giữ nguyên hành vi cũ: chỉ lưu tạm trong phiên cho tới khi xe thật vào cổng.
    if (newRecord.isPreSurveyBeforeGateIn) {
      setSurveys((prev) => [newRecord, ...prev]);
      if (openImmediately) setSelectedSurvey(newRecord);
      return;
    }

    const backendIsoSize = BACKEND_ISO_SIZE_MAP[newRecord.size];
    const backendShippingLine = BACKEND_SHIPPING_LINE_MAP[newRecord.shippingLine];
    if (!backendIsoSize || !backendShippingLine || !newRecord.truckPlate || !newRecord.driverName || !newRecord.driverPhone) {
      showToast(
        !backendIsoSize
          ? `Loại container "${newRecord.size}" chưa được hệ thống hỗ trợ Gate-In tự động qua màn này — vui lòng dùng chức năng Gate-In thủ công.`
          : !backendShippingLine
          ? `Hãng tàu "${newRecord.shippingLine}" chưa có trong danh mục ShippingLine của hệ thống nên không thể tạo hồ sơ Gate-In tự động.`
          : 'Thiếu biển số xe / tên tài xế / SĐT tài xế — không thể tạo hồ sơ Gate-In.',
        'error',
        'Không thể lưu giám định xuống hệ thống'
      );
      setSurveys((prev) => [newRecord, ...prev]);
      if (openImmediately) setSelectedSurvey(newRecord);
      return;
    }

    let realId: string;
    try {
      const gateInResponse: any = await containerApi.createGateIn({
        containerNo: newRecord.containerNo,
        isoSize: backendIsoSize,
        shippingLine: backendShippingLine,
        tareWeightKg: newRecord.tareWeightKg || 3820,
        maxPayloadKg: newRecord.payloadKg || 28680,
        truckPlate: newRecord.truckPlate,
        driverName: newRecord.driverName,
        driverPhone: newRecord.driverPhone,
        trailerPlate: newRecord.trailerPlate,
        sealNo: newRecord.sealNo,
        remarks: newRecord.remarks,
        gateInStaffId: currentUserStaffId
      });
      if (gateInResponse?.statusCode !== 200 || !gateInResponse.data?.id) {
        throw new Error(gateInResponse?.message || 'Không thể tạo hồ sơ Gate-In cho container này.');
      }
      realId = String(gateInResponse.data.id);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Không thể tạo hồ sơ Gate-In cho container này.',
        'error',
        'Tạo Giám Định Thất Bại'
      );
      setSurveys((prev) => [newRecord, ...prev]);
      if (openImmediately) setSelectedSurvey(newRecord);
      return;
    }

    const realRecord: SurveyItemRecord = { ...newRecord, id: realId };
    setSurveys((prev) => [realRecord, ...prev]);
    if (openImmediately) {
      setSelectedSurvey(realRecord);
    }

    try {
      await handleSaveSurvey(realRecord, false);
      showToast(
        `Đã tạo hồ sơ Gate-In & lưu giám định container ${realRecord.containerNo} xuống hệ thống thành công.`,
        'success',
        'Tạo Giám Định Thành Công'
      );
    } catch (error) {
      showToast(
        (error instanceof Error ? error.message : 'Đã tạo hồ sơ Gate-In nhưng chưa lưu được nội dung giám định.') +
          ' Mở lại hồ sơ trong hàng đợi để lưu lại.',
        'error',
        'Lưu Nội Dung Giám Định Thất Bại'
      );
    }
  };

  // Start new survey for non-gate-in or searched container
  const handleStartSurvey = (containerNo: string, isPreSurvey: boolean, shippingLine: string, size: string) => {
    const existing = surveys.find((s) => s.containerNo === containerNo);
    if (existing) {
      // Container tìm thấy qua Tra Cứu / Pre-Survey có thể là 1 job thật đang SURVEYING — trước đây mở
      // thẳng bằng setSelectedSurvey, bỏ qua hoàn toàn bước "nhận giám định" (claim) nên 2 surveyor vẫn
      // mở trùng được cùng 1 container qua đường này dù đã khóa ở màn Danh Sách Chờ.
      handleOpenSurvey(existing);
      return;
    }

    const newRecord: SurveyItemRecord = {
      id: 'SURV-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      surveyNo: `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      containerNo,
      isoCode: size.startsWith('20') ? '22G1' : '45G1',
      size,
      // `.includes('R')` cũ khớp nhầm cả Flat Rack (FR) thành Reefer — dùng isReeferSizeCode để chỉ khớp
      // đúng token Reefer (RF/RH/HR).
      type: isReeferSizeCode(size) ? 'Reefer High Cube' : 'Dry High Cube',
      owner: shippingLine + ' Marine Transport',
      shippingLine,
      isReefer: isReeferSizeCode(size),
      isPreSurveyBeforeGateIn: isPreSurvey,
      gateInTime: isPreSurvey ? 'Chưa Gate-In (Đang ngoài cổng)' : new Date().toISOString().replace('T', ' ').substring(0, 16),
      surveyDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      surveyor: currentUser,
      status: 'IN_PROGRESS',
      standard: shippingLine === 'COSCO' ? 'MCIC' : 'IICL-6',
      condition: 'AV',
      qualityGrade: 'GRADE_A',
      damages: [],
      checklist: INITIAL_CHECKLIST_TEMPLATE.map((c) => ({ ...c })),
      photos: [],
      remarks: isPreSurvey ? 'Phiếu Pre-Survey lập trước khi vào cổng bãi.' : 'Tiếp nhận giám định tại làn kiểm tra.'
    };

    setSurveys((prev) => [newRecord, ...prev]);
    setSelectedSurvey(newRecord);
  };

  const triggerOpenCreateModal = (contNo: string = '') => {
    setCreatePrefillContNo(contNo);
    setIsCreateModalOpen(true);
  };

  // Transfer to Operation (Khai thác Gate-In & Lập phiếu dịch vụ Tariff)
  // Trước đây gọi handleSaveSurvey (async, gọi API thật) mà không await/bắt lỗi rồi điều hướng sang
  // tab Khai Thác ngay lập tức — nếu lưu thất bại (mất phiên đăng nhập, lỗi mạng...), người dùng vẫn
  // bị chuyển trang như thể mọi thứ đã lưu xong, trong khi dữ liệu giám định thực ra chưa lưu.
  const handleTransferToOperation = async (record: SurveyItemRecord) => {
    const updatedRecord: SurveyItemRecord = {
      ...record,
      status: 'EEIR_ISSUED',
      eeirNo: record.eeirNo || `EIR-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      eeirIssuedAt: record.eeirIssuedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      await handleSaveSurvey(updatedRecord);
      if (onNavigateTab) {
        onNavigateTab('operation');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Không thể lưu giám định trước khi chuyển sang Khai Thác.',
        'error',
        'Chuyển Khai Thác thất bại'
      );
    }
  };

  return (
    <div className="space-y-6">
      {surveyLoadError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
          <span>{surveyLoadError}</span>
        </div>
      )}
      {masterCatalogError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
          <span>{masterCatalogError}</span>
        </div>
      )}
      {/* Đồng bộ đúng khuôn giao diện "THÔNG BÁO & ZALO GATEWAY"
          (notifications/components/NotificationHeader.tsx) theo yêu cầu người dùng — xem
          docs/frontend-theme-unification.md (hạng mục #5). Banner nền TRẮNG với icon logo trong khối
          gradient xanh dương→sky→chàm (giữ nguyên y hệt, không đổi theo màu nghiệp vụ), dải sub-tab bên
          dưới đổi hẳn sang nền TỐI. Giữ nguyên nút hành động màu nghiệp vụ (amber) và toàn bộ danh sách
          12 tab/badge có sẵn, chỉ đổi khung/bố cục banner + style dải tab cho khớp trang tham chiếu. */}
      <div className="bg-white border-b border-slate-200 -mt-3 -mx-3 sm:-mt-4 sm:-mx-4 md:-mt-6 md:-mx-6 mb-6 px-4 sm:px-6 pt-5 pb-0 shadow-sm">
        {/* Top Banner (nền trắng) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  GIÁM ĐỊNH CONTAINER (SURVEY &amp; e-EIR)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                  IICL-6
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tiếp nhận giám định, ghi nhận hư hỏng và phát hành biên bản e-EIR theo chuẩn IICL-6
              </p>
            </div>
          </div>

          {/* Nút hành động — giữ nguyên màu nghiệp vụ (amber) của module Survey */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <button
              onClick={() => triggerOpenCreateModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tạo Mới Giám Định Đầy Đủ</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs (nền tối) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 mt-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedSurvey;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedSurvey(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
                  isActive
                    ? 'bg-slate-800/80 text-white border-blue-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {selectedSurvey ? (
        <SurveyDetailForm
          survey={selectedSurvey}
          locations={locations}
          damageCodes={damageCodes}
          repairCodes={repairCodes}
          grades={grades}
          cleaningTariffs={cleaningTariffs}
          currentUser={currentUser}
          onBack={handleBackFromDetail}
          onSaveSurvey={handleSaveSurvey}
          onOpenEEIR={(s) => setEeirSurvey(s)}
          onTransferToOperation={handleTransferToOperation}
        />
      ) : (
        <>
          {activeTab === 'queue' && (
            <SurveyQueueTable
              title="Danh Sách Container Chờ Giám Định (Survey Queue)"
              subtitle="Tất cả container vừa Gate-in hoặc được phân công cần Surveyor tiếp nhận kiểm tra hiện trường."
              surveys={surveys}
              statusFilterTab="WAITING"
              currentUserStaffId={currentUserStaffId}
              onSelectSurvey={handleOpenSurvey}
              onOpenEEIR={(s) => setEeirSurvey(s)}
              onTransferToOperation={handleTransferToOperation}
              onSearchNonGateIn={() => setIsSearchModalOpen(true)}
              onCreateNewSurvey={() => triggerOpenCreateModal()}
            />
          )}

          {activeTab === 'in_progress' && (
            <SurveyQueueTable
              title="Container Đang Giám Định Tại Bãi (In Progress)"
              subtitle="Các vỏ container đang được Surveyor kiểm tra, ghim sơ đồ 2D hoặc chụp ảnh tổn thất."
              surveys={surveys}
              statusFilterTab="IN_PROGRESS"
              currentUserStaffId={currentUserStaffId}
              onSelectSurvey={handleOpenSurvey}
              onOpenEEIR={(s) => setEeirSurvey(s)}
              onTransferToOperation={handleTransferToOperation}
              onSearchNonGateIn={() => setIsSearchModalOpen(true)}
              onCreateNewSurvey={() => triggerOpenCreateModal()}
            />
          )}

          {activeTab === 'completed' && (
            <SurveyQueueTable
              title="Container Đã Hoàn Tất Giám Định (Completed Surveys)"
              subtitle="Danh sách vỏ đã nghiệm thu chuẩn IICL, phân loại AV/CL/DM và sẵn sàng phát hành e-EIR."
              surveys={surveys}
              statusFilterTab="COMPLETED"
              currentUserStaffId={currentUserStaffId}
              onSelectSurvey={handleOpenSurvey}
              onOpenEEIR={(s) => setEeirSurvey(s)}
              onTransferToOperation={handleTransferToOperation}
              onSearchNonGateIn={() => setIsSearchModalOpen(true)}
              onCreateNewSurvey={() => triggerOpenCreateModal()}
            />
          )}

          {activeTab === 'history' && (
            <SurveyHistoryTable
              surveys={surveys}
              onSelectSurvey={handleOpenSurvey}
              onOpenEEIR={(s) => setEeirSurvey(s)}
              onTransferToOperation={handleTransferToOperation}
            />
          )}

          {activeTab === 'cleaning_tariffs' && (
            <CleaningMaster
              cleaningTariffs={cleaningTariffs}
              onUpdateCleaningTariffs={(tariffs) => { setCleaningTariffs(tariffs); void persistCatalog('CLEANING_TARIFF', cleaningTariffs, tariffs, 'cleaningCode'); }}
            />
          )}

          {activeTab === 'damage_locations' && (
            <DamageLocationMaster
              locations={locations}
              onUpdateLocations={(locs) => { setLocations(locs); void persistCatalog('DAMAGE_LOCATION', locations, locs, 'code'); }}
              persistedToBackend
            />
          )}

          {activeTab === 'damage_codes' && (
            <DamageCodeMaster
              damageCodes={damageCodes}
              onUpdateDamageCodes={(codes) => { setDamageCodes(codes); void persistCatalog('DAMAGE_CODE', damageCodes, codes, 'code'); }}
              persistedToBackend
            />
          )}

          {activeTab === 'repair_codes' && (
            <RepairCodeMaster
              repairCodes={repairCodes}
              onUpdateRepairCodes={(reps) => { setRepairCodes(reps); void persistCatalog('REPAIR_CODE', repairCodes, reps, 'repairCode'); }}
              persistedToBackend
            />
          )}

          {activeTab === 'grades' && (
            <GradeMaster
              grades={grades}
              onUpdateGrades={(grds) => { setGrades(grds); void persistCatalog('GRADE', grades, grds, 'gradeCode'); }}
              persistedToBackend
            />
          )}

          {activeTab === 'standards' && (
            <InspectionStandardMaster
              standards={standards}
              onUpdateStandards={(stds) => { setStandards(stds); void persistCatalog('INSPECTION_STANDARD', standards, stds, 'standardCode'); }}
              persistedToBackend
            />
          )}

          {activeTab === 'photos' && (
            <SurveyPhotoGallery surveys={surveys} />
          )}

          {activeTab === 'eeir_list' && (
            <SurveyQueueTable
              title="Quản Lý Chứng Từ &amp; Biên Bản Giao Nhận Điện Tử (e-EIR Hub)"
              subtitle="Tra cứu và in ấn các chứng từ e-EIR điện tử đã cấp cho tài xế và hãng tàu."
              surveys={surveys.filter((s) => s.status === 'COMPLETED' || s.status === 'EEIR_ISSUED')}
              statusFilterTab="COMPLETED"
              currentUserStaffId={currentUserStaffId}
              onSelectSurvey={handleOpenSurvey}
              onOpenEEIR={(s) => setEeirSurvey(s)}
              onTransferToOperation={handleTransferToOperation}
              onSearchNonGateIn={() => setIsSearchModalOpen(true)}
              onCreateNewSurvey={() => triggerOpenCreateModal()}
            />
          )}
        </>
      )}

      {/* Full Create Survey Modal */}
      <CreateSurveyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveSurvey={handleCreateNewSurvey}
        currentUser={currentUser}
        locations={locations}
        damageCodes={damageCodes}
        repairCodes={repairCodes}
        grades={grades}
        cleaningTariffs={cleaningTariffs}
        initialContainerNo={createPrefillContNo}
      />

      {/* Search & Non-Gate-In Modal */}
      <ContainerSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        existingSurveys={surveys}
        onStartSurvey={handleStartSurvey}
        onOpenFullCreateModal={(contNo) => triggerOpenCreateModal(contNo)}
      />

      {/* e-EIR Preview Modal */}
      {eeirSurvey && (
        <EEIRModal
          isOpen={!!eeirSurvey}
          onClose={() => setEeirSurvey(null)}
          survey={eeirSurvey}
          onTransferToOperation={handleTransferToOperation}
          onProceedToOperation={(s) => {
            handleTransferToOperation(s);
          }}
        />
      )}
    </div>
  );
};
