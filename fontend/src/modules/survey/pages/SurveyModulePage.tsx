import React, { useState, useEffect } from 'react';
import { containerApi, surveyApi, masterDataApi, toPublicFileUrl } from '../../../api';
import { useDepot } from '../../../context/DepotContext';
import {
  SurveyItemRecord,
  DamageLocationMasterItem,
  DamageCodeMasterItem,
  RepairCodeMasterItem,
  GradeMasterItem,
  InspectionStandardMasterItem,
  CleaningTariffMasterItem,
  ContainerTypeMasterItem
} from '../types';
import { fetchSurveyChecklistTemplate } from '../../masterdata/utils/checklistCatalog';
import { SurveyQueueTable } from '../components/SurveyQueueTable';
import { SurveyDetailForm } from '../components/SurveyDetailForm';
import { DamageLocationMaster } from '../components/DamageLocationMaster';
import { DamageCodeMaster } from '../components/DamageCodeMaster';
import { RepairCodeMaster } from '../components/RepairCodeMaster';
import { GradeMaster } from '../components/GradeMaster';
import { InspectionStandardMaster } from '../components/InspectionStandardMaster';
import { SurveyPhotoGallery } from '../components/SurveyPhotoGallery';
import { SurveyHistoryTable, jobStatusLabel } from '../components/SurveyHistoryTable';
import { ContainerSearchModal } from '../components/ContainerSearchModal';
import { EEIRModal } from '../components/EEIRModal';
import { CreateSurveyModal } from '../components/CreateSurveyModal';
import { CleaningMaster } from '../../masterdata/components/CleaningMaster';
import { fetchContainerTypes } from '../../masterdata/utils/containerTypeCatalog';

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
  Plus,
  Droplets
} from 'lucide-react';
import { getApiErrorMessage } from '../../../utils/apiError';
import { mapCleaningTariff } from '../../masterdata/utils/cleaningTariffCatalog';

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
  // Checklist mẫu (danh mục SURVEY_CHECKLIST trong DB) — nạp cùng lúc với danh sách hồ sơ ở refreshSurveys.
  const surveyChecklistTemplateRef = React.useRef<SurveyItemRecord['checklist']>([]);
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
  // DM Loại Container thật cho tab Biểu Phí Vệ Sinh (cột giá theo loại container).
  const [containerTypes, setContainerTypes] = useState<ContainerTypeMasterItem[]>([]);
  useEffect(() => {
    fetchContainerTypes().then(setContainerTypes).catch(() => setContainerTypes([]));
  }, []);
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
        masterDataApi.getCatalog('INSPECTION_STANDARD'), masterDataApi.getCleaningTariffs()
      ]);
      const mapItems = (response: any) => response?.data || [];
      setLocations(mapItems(locationResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', category: readJson(item.jsonData).category || 'STRUCTURE', checklistZone: readJson(item.jsonData).checklistZone ?? '', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setDamageCodes(mapItems(damageResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, damageType: readJson(item.jsonData).damageType || 'OTHER', description: item.description || '', severity: readJson(item.jsonData).severity || 'MEDIUM', standard: readJson(item.jsonData).standard || 'UNIVERSAL', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setRepairCodes(mapItems(repairResponse).map((item: any) => ({ id: item.id, repairCode: item.code, stsCode: readJson(item.jsonData).stsCode || item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', repairType: readJson(item.jsonData).repairType || 'STRAIGHTEN', labourRate: readJson(item.jsonData).labourRate || 0, labourHours: readJson(item.jsonData).labourHours || 0, materialEstimatedCost: readJson(item.jsonData).materialEstimatedCost || 0, status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setGrades(mapItems(gradeResponse).map((item: any) => ({ id: item.id, gradeCode: item.code, gradeName: item.nameVi || item.name, description: item.description || '', shippingLine: readJson(item.jsonData).shippingLine || 'ALL', customer: readJson(item.jsonData).customer || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setStandards(mapItems(standardResponse).map((item: any) => ({ id: item.id, standardCode: item.code, standardName: item.name, shippingLine: readJson(item.jsonData).shippingLine || 'ALL', containerType: readJson(item.jsonData).containerType || 'ALL', containerSize: readJson(item.jsonData).containerSize || 'ALL', version: readJson(item.jsonData).version || '', effectiveDate: readJson(item.jsonData).effectiveDate || '', description: item.description || '', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      // Biểu Phí Vệ Sinh: bảng riêng CleaningTariffs, giá theo từng loại container (depot-fullstack-cleaning-tariff-pricing).
      setCleaningTariffs(mapItems(cleaningResponse).map(mapCleaningTariff));
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
  // Mở từ tab Lịch sử → form chỉ xem (không khoá phiếu, không lưu / nộp).
  const [selectedReadOnly, setSelectedReadOnly] = useState(false);

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
    // SurveyNo giờ backend tự sinh thật (xem SubmitSurveyAsync) — trước đây tạm dùng survey.id
    // (khóa nội bộ, không phải số phiếu nghiệp vụ) vì chưa có cột nào lưu số phiếu thật.
    surveyNo: job.survey?.surveyNo || job.jobNo,
    containerNo: job.containerNo,
    isoCode: job.isoSize,
    size: job.isoSize,
    type: job.survey?.containerTypeName || (job.isoSize?.includes('RF') || job.isoSize?.includes('RH') ? 'Reefer' : 'Dry High Cube'),
    owner: job.survey?.owner || job.shippingLineCode,
    shippingLine: job.shippingLineCode,
    isReefer: job.isoSize?.includes('RF') || job.isoSize?.includes('RH'),
    gateInTime: job.gateInDate,
    surveyDate: job.survey?.surveyDate || new Date().toISOString(),
    surveyor: job.survey?.surveyorName || currentUser,
    status: job.status === 'SURVEYING' ? 'NEW' : 'IN_PROGRESS',
    standard: job.survey?.standard || 'IICL-6',
    condition: job.survey ? conditionFromRating(job.survey.conditionRating) : 'AV',
    qualityGrade: job.survey?.qualityGrade || (job.survey?.conditionRating === 'A' ? 'GRADE_A' : 'GENERAL_CARGO'),
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
        : surveyChecklistTemplateRef.current.map((item) => ({ ...item })),
    photos: (job.survey?.photos || []).map((p: any) => ({
      id: String(p.id),
      url: toPublicFileUrl(p.url),
      type: p.type,
      caption: p.caption,
      surveyor: p.surveyorName,
      uploadedAt: p.uploadedAt,
      fileSizeKb: p.fileSizeKb
    })),
    surveyClaimedByStaffId: job.surveyClaimedByStaffId ?? undefined,
    surveyClaimedByName: job.surveyClaimedByName ?? undefined,
    surveyClaimedAt: job.surveyClaimedAt ?? undefined,
    // Không tự điền câu hệ thống làm ghi chú giám định (trước đây lưu ngược "Job ... từ Gate-In SQL Server" vào DB).
    remarks: job.survey?.overallNotes || '',
    // Round-trip đúng các field đã thêm cột lưu ở Survey/DepotJob — trước đây backend không trả lại
    // field nào trong nhóm này nên F5 xong màn Chi Tiết luôn hiện trống dù đã nhập lúc tạo phiếu.
    truckPlate: job.gateInTruckPlate,
    trailerPlate: job.gateInTrailerPlate,
    driverName: job.gateInDriverName,
    driverPhone: job.gateInDriverPhone,
    sealNo: job.gateInSealNo,
    driverLicense: job.gateInDriverLicense,
    customsSealNo: job.gateInCustomsSealNo,
    manufactureMonthYear: job.survey?.manufactureMonthYear,
    maxGrossWeightKg: job.survey?.maxGrossWeightKg,
    material: job.survey?.material,
    floorType: job.survey?.floorType,
    cscPlateNo: job.survey?.cscPlateNo,
    standardNotes: job.survey?.standardNotes,
    actionRequired: job.survey?.actionRequired,
    shift: job.survey?.shift,
    yardLocation: job.survey?.yardLocationNote,
    cargoStatus: job.survey?.cargoStatus,
    reeferBrand: job.survey?.reeferBrand,
    reeferModel: job.survey?.reeferModel,
    setTemperature: job.survey?.reeferSetTemperatureC,
    ptiStatus: job.survey?.ptiStatus,
    compressorHours: job.survey?.compressorHours,
    humidityPercent: job.survey?.humidityPercent,
    ventilationCmh: job.survey?.ventilationCmh
  });

  const refreshSurveys = React.useCallback(() => {
    return Promise.all([containerApi.getAll({ status: 'SURVEYING' }), fetchSurveyChecklistTemplate()])
      .then(([response, checklistTemplate]: [any, SurveyItemRecord['checklist']]) => {
        surveyChecklistTemplateRef.current = checklistTemplate;
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

  // Lịch sử giám định: nguồn RIÊNG, khác hàng chờ. Trước đây tab Lịch sử dùng chung danh sách SURVEYING (container
  // chưa giám định) nên giám định xong là biến mất khỏi "lịch sử". Giờ lấy mọi hồ sơ, giữ hồ sơ có phiếu và đã rời
  // SURVEYING = phiếu đã nộp chính thức (nộp luôn chuyển sang CLEANING; lưu nháp giữ SURVEYING).
  const [historySurveys, setHistorySurveys] = useState<SurveyItemRecord[]>([]);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const mapJobToHistory = (job: any): SurveyItemRecord => ({
    ...mapJobToSurvey(job),
    // Chỉ dữ liệu thật của phiếu — không lấy số hồ sơ / giờ hiện tại / người đang đăng nhập làm giá trị tạm.
    surveyNo: job.survey?.surveyNo || '',
    surveyDate: job.survey?.surveyDate || '',
    surveyor: job.survey?.surveyorName || '',
    eeirNo: job.gateInEirNo || undefined,
    jobStatus: job.status
  });
  const refreshSurveyHistory = React.useCallback(() => {
    setHistoryLoadError(null);
    return containerApi.getAll()
      .then((response: any) => {
        if (response?.statusCode !== 200 || !Array.isArray(response.data)) {
          throw new Error(response?.message || 'Không thể tải lịch sử giám định.');
        }
        setHistorySurveys(response.data.filter((job: any) => job?.survey && job.status !== 'SURVEYING').map(mapJobToHistory));
      })
      .catch((error) => {
        setHistoryLoadError(error instanceof Error ? error.message : 'Không thể tải lịch sử giám định.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mở tab Lịch sử là tải lại → phiếu vừa nộp hiện ngay.
  React.useEffect(() => {
    if (activeTab === 'history') refreshSurveyHistory();
  }, [activeTab, refreshSurveyHistory]);

  // Mở phiếu giám định: với hồ sơ thật từ Gate-In còn đang chờ (status NEW), phải "nhận" (khóa) trước
  // qua backend để chặn 2 surveyor cùng mở 1 container — hồ sơ đang/đã giám định (đã có người nhận từ trước, kể cả chính mình) thì mở thẳng, không cần khóa lại.
  const handleOpenSurvey = async (survey: SurveyItemRecord) => {
    setSelectedReadOnly(false);
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
    if (selectedReadOnly) {
      // Chỉ xem: không có khoá để nhả; activeTab vẫn là 'history' nên quay về đúng tab Lịch sử.
      setSelectedReadOnly(false);
      setSelectedSurvey(null);
      return;
    }
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

  // Phiếu đã nộp mở từ Lịch sử: chỉ xem — không đi qua handleOpenSurvey nên không bao giờ gọi khoá phiếu.
  const openHistorySurvey = (survey: SurveyItemRecord) => {
    setSelectedReadOnly(true);
    setSelectedSurvey(survey);
  };

  // Hoàn tất giám định thành công: thông báo bước tiếp theo (theo đúng quy tắc SubmitSurveyAsync ở backend)
  // rồi quay về danh sách giám định.
  const handleSurveyCompleted = (record: SurveyItemRecord) => {
    const damageCount = (record.damages || []).length;
    const next = 'Đã tạo lệnh vệ sinh — container chuyển sang Tổ Vệ Sinh.'
      + (damageCount > 0 ? ` Có ${damageCount} hư hỏng: sau vệ sinh → Khai thác → thu tiền → lập báo giá sửa chữa.` : '');
    showToast(
      `Container ${record.containerNo}${record.eeirNo ? ` · e-EIR ${record.eeirNo}` : ''}. ${next}`,
      'success',
      'Hoàn tất giám định'
    );
    setSelectedSurvey(null);
    setActiveTab('queue');
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
    // `id: String(job.id)` cho job thật. Regex GUID cũ luôn false với id thật, khiến handleSaveSurvey chỉ cập nhật
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
            laborRate: rep?.labourRate ?? 0,
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
        isDraft,
        // CreateSurveyModal thu thập đủ các field dưới đây qua 4 tab nhưng trước đây không gửi lên nên
        // mất trắng ngay sau khi nộp phiếu — giờ gửi đủ để lưu thật xuống Postgres.
        owner: updated.owner,
        containerTypeName: updated.type,
        manufactureMonthYear: updated.manufactureMonthYear,
        maxGrossWeightKg: updated.maxGrossWeightKg,
        material: updated.material,
        floorType: updated.floorType,
        cscPlateNo: updated.cscPlateNo,
        standard: updated.standard,
        standardNotes: updated.standardNotes,
        qualityGrade: updated.qualityGrade,
        actionRequired: updated.actionRequired,
        shift: updated.shift,
        yardLocationNote: updated.yardLocation,
        cargoStatus: updated.cargoStatus,
        reeferBrand: updated.reeferBrand,
        reeferModel: updated.reeferModel,
        reeferSetTemperatureC: updated.setTemperature,
        ptiStatus: updated.ptiStatus,
        compressorHours: updated.compressorHours,
        humidityPercent: updated.humidityPercent,
        ventilationCmh: updated.ventilationCmh
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
  // sinh/checklist/ảnh. Giờ tự động Gate-In trước để có DepotJob thật, rồi nộp luôn phiếu giám định vào job đó — tái dùng đúng handleSaveSurvey.
  // Trả về true khi đã lưu xong để CreateSurveyModal chỉ đóng form khi thành công (lỗi thì giữ form + báo lỗi).
  const handleCreateNewSurvey = async (newRecord: SurveyItemRecord, openImmediately: boolean = true): Promise<boolean> => {
    // Bước 1: Tiếp nhận cổng — tạo hồ sơ DepotJob thật. Loại container + hãng tàu là mã thật từ DB.
    // Lỗi thì KHÔNG thêm bản ghi tạm "SURV-..." vào hàng đợi như trước (trông như đã lưu nhưng F5 là mất).
    let realId: string;
    try {
      const gateInResponse: any = await containerApi.createGateIn({
        containerNo: newRecord.containerNo,
        isoSize: newRecord.size,
        shippingLine: newRecord.shippingLine,
        tareWeightKg: newRecord.tareWeightKg,
        maxPayloadKg: newRecord.payloadKg,
        truckPlate: newRecord.truckPlate,
        driverName: newRecord.driverName,
        driverPhone: newRecord.driverPhone,
        trailerPlate: newRecord.trailerPlate,
        sealNo: newRecord.sealNo,
        driverLicense: newRecord.driverLicense,
        customsSealNo: newRecord.customsSealNo,
        remarks: newRecord.remarks,
        gateInStaffId: currentUserStaffId
      });
      if (gateInResponse?.statusCode !== 200 || !gateInResponse.data?.id) {
        throw new Error(gateInResponse?.message || 'Không thể tạo hồ sơ Gate-In cho container này.');
      }
      realId = String(gateInResponse.data.id);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Không thể tạo hồ sơ Gate-In cho container này.'), 'error', 'Tiếp Nhận Cổng Thất Bại');
      return false;
    }

    const realRecord: SurveyItemRecord = { ...newRecord, id: realId };
    setSurveys((prev) => [realRecord, ...prev]);
    if (openImmediately) {
      setSelectedSurvey(realRecord);
    }

    // Bước 2: lưu NHÁP phiếu giám định. 2 nút của form là "Lưu Chờ Giám Định" / "Lưu & Mở Giám Định Ngay" —
    // giám định chưa làm xong. Trước đây nộp luôn phiếu chính thức với hạng mặc định AV nên container vừa
    // tạo nhảy thẳng READY_FOR_OUT (sẵn sàng cấp vỏ) dù chưa hề giám định.
    try {
      await handleSaveSurvey(realRecord, true);
      showToast(
        `Đã tiếp nhận cổng container ${realRecord.containerNo} và lưu tạm phiếu giám định.`,
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
    return true;
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
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{surveyLoadError}</span>
        </div>
      )}
      {masterCatalogError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{masterCatalogError}</span>
        </div>
      )}
      {/* Đồng bộ đúng chuẩn "Dashboard ERP Tổng Quan" (dashboard/pages/DashboardPage.tsx) theo yêu cầu
          người dùng 2026-09-06 — xem docs/frontend-theme-unification.md. Banner nền gradient sáng
          (blue-50→white→indigo-50), KHÔNG còn hộp icon gradient tối và KHÔNG còn dải sub-tab nền tối như
          chuẩn cũ. Dải tab chuyển sang nền sáng (card slate-50, tab active bg-blue-600 text-white). Giữ
          nguyên nút hành động màu nghiệp vụ (amber) và toàn bộ danh sách 12 tab/badge có sẵn. */}
      <div className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
        {/* Top Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-bold font-mono">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>IICL-6 SURVEY &amp; e-EIR</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Giám Định Container (Survey &amp; e-EIR)
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Tiếp nhận giám định, ghi nhận hư hỏng và phát hành biên bản e-EIR theo chuẩn IICL-6.
            </p>
          </div>

          {/* Nút hành động — giữ nguyên màu nghiệp vụ (amber) của module Survey */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={() => triggerOpenCreateModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tạo Mới Giám Định Đầy Đủ</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs (nền sáng) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !selectedSurvey;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedSurvey(null);
                  setSelectedReadOnly(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 bg-white/60 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
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
          standards={standards}
          cleaningTariffs={cleaningTariffs}
          currentUser={currentUser}
          onBack={handleBackFromDetail}
          onSaveSurvey={selectedReadOnly ? async () => {} : handleSaveSurvey}
          onCompleted={selectedReadOnly ? undefined : handleSurveyCompleted}
          readOnly={selectedReadOnly}
          readOnlyStatusLabel={selectedReadOnly ? jobStatusLabel(selectedSurvey.jobStatus) : undefined}
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
              surveys={historySurveys}
              loadError={historyLoadError}
              onSelectSurvey={openHistorySurvey}
              onOpenEEIR={(s) => setEeirSurvey(s)}
            />
          )}

          {activeTab === 'cleaning_tariffs' && (
            <CleaningMaster
              cleaningTariffs={cleaningTariffs}
              containerTypes={containerTypes}
              onUpdateCleaningTariffs={setCleaningTariffs}
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

      {/* Full Create Survey Modal — chỉ mount khi mở: form giữ state nội bộ, nếu mount sẵn thì số container
          điền từ màn Tra Cứu không được nhận và dữ liệu lần nhập trước còn sót lại khi mở lần sau. */}
      {isCreateModalOpen && (
        <CreateSurveyModal
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
          onSaveSurvey={handleCreateNewSurvey}
          currentUser={currentUser}
          locations={locations}
          damageCodes={damageCodes}
          repairCodes={repairCodes}
          grades={grades}
          standards={standards}
          cleaningTariffs={cleaningTariffs}
          initialContainerNo={createPrefillContNo}
        />
      )}

      {/* Search & Non-Gate-In Modal */}
      <ContainerSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        existingSurveys={surveys}
        onOpenSurvey={handleOpenSurvey}
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
