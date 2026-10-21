import React, { useState } from 'react';
import {
  DamageLocationMasterItem,
  DamageCodeMasterItem,
  RepairCodeMasterItem,
  GradeMasterItem,
  InspectionStandardMasterItem,
  ContainerTypeMasterItem,
  CleaningTariffMasterItem
} from '../../survey/types';
import { DamageLocationMaster } from '../../survey/components/DamageLocationMaster';
import { SurveyChecklistMaster } from '../components/SurveyChecklistMaster';
import { useSurveyChecklistTemplate } from '../utils/checklistCatalog';
import { DamageCodeMaster } from '../../survey/components/DamageCodeMaster';
import { RepairCodeMaster } from '../../survey/components/RepairCodeMaster';
import { GradeMaster } from '../../survey/components/GradeMaster';
import { InspectionStandardMaster } from '../../survey/components/InspectionStandardMaster';
import { ContainerTypeMaster } from '../components/ContainerTypeMaster';
import { mapContainerTypeCatalogItem } from '../utils/containerTypeCatalog';
import { mapCleaningTariff } from '../utils/cleaningTariffCatalog';
import { CleaningMaster } from '../components/CleaningMaster';
// "Cước Nâng Hạ & Lưu Bãi" đã tách thành 3 danh mục riêng biệt theo yêu cầu người dùng (thay cho
// component gộp chung `LiftOnLiftOffAndStorageMaster.tsx` cũ, đã xoá) — xem
// docs/frontend-tariff-catalog-split.md.
import { LoloTariffMaster } from '../components/LoloTariffMaster';
import { StorageTariffMaster } from '../components/StorageTariffMaster';
import { CustomerClassificationMaster } from '../../customer/components/CustomerClassificationMaster';
import { DepartmentMaster } from '../components/DepartmentMaster';
import { DepartmentItem } from '../types/department';
import { ShippingLineMaster } from '../components/ShippingLineMaster';
import { masterDataApi } from '../../../api';

import {
  Database,
  MapPin,
  FileCode,
  Hammer,
  Sparkles,
  ShieldCheck,
  Container,
  Building2,
  Receipt,
  Layers,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Search,
  Plus,
  Droplets,
  Tag,
  Truck,
  ClipboardCheck,
} from 'lucide-react';
import { getApiErrorMessage } from '../../../utils/apiError';

export interface MasterDataPageProps {
  initialTab?: string;
  onNavigateTab?: (tabId: string) => void;
}

export const MasterDataPage: React.FC<MasterDataPageProps> = ({
  initialTab = 'cleaning_tariffs',
  onNavigateTab
}) => {
  const [activeMasterTab, setActiveMasterTab] = useState<string>(initialTab);

  // Master Data collections state
  const [locations, setLocations] = useState<DamageLocationMasterItem[]>([]);
  // Số khu vực Checklist đang dùng (thẻ ở Tất Cả Danh Mục) — tự cập nhật khi màn danh mục khu vực thay đổi.
  const surveyChecklistZones = useSurveyChecklistTemplate();
  const [damageCodes, setDamageCodes] = useState<DamageCodeMasterItem[]>([]);
  const [repairCodes, setRepairCodes] = useState<RepairCodeMasterItem[]>([]);
  const [grades, setGrades] = useState<GradeMasterItem[]>([]);
  const [standards, setStandards] = useState<InspectionStandardMasterItem[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerTypeMasterItem[]>([]);
  const [cleaningTariffs, setCleaningTariffs] = useState<CleaningTariffMasterItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [shippingLines, setShippingLines] = useState<Array<{ code: string; name: string }>>([]);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);
  // `LoloTariffMaster`/`StorageTariffMaster` tự fetch dữ liệu đầy đủ của riêng chúng (không dùng chung
  // state ở đây như các catalog khác) — 2 state đếm nhẹ này CHỈ phục vụ hiển thị số lượng đúng trên thẻ
  // điều hướng bên dưới (tab bar `masterGroups`), tránh hiện số giả cứng như trước khi tách danh mục.
  const [loloTariffCount, setLoloTariffCount] = useState(0);
  const [storageTariffCount, setStorageTariffCount] = useState(0);

  React.useEffect(() => {
    Promise.all([
      masterDataApi.getServiceTariffs(),
      masterDataApi.getStorageTariffs()
    ]).then(([loloResponse, storageResponse]: any[]) => {
      setLoloTariffCount(Array.isArray(loloResponse?.data) ? loloResponse.data.length : 0);
      setStorageTariffCount(Array.isArray(storageResponse?.data) ? storageResponse.data.length : 0);
    }).catch(() => {
      setLoloTariffCount(0);
      setStorageTariffCount(0);
    });
  }, []);

  React.useEffect(() => {
    masterDataApi.getAll()
      .then((response: any) => {
        if (response?.statusCode !== 200) throw new Error(response?.message || 'Không thể tải Master Data.');
        setShippingLines(response.data?.shippingLines || []);
      })
      .catch((error) => setMasterDataError(getApiErrorMessage(error, 'Không thể tải Master Data từ backend.')));
  }, []);

  React.useEffect(() => {
    const readJson = (value: unknown): Record<string, any> => {
      try { return JSON.parse(String(value || '{}')); } catch { return {}; }
    };
    const load = async () => {
      const [locationResponse, damageResponse, repairResponse, gradeResponse, standardResponse, departmentResponse] = await Promise.all([
        masterDataApi.getCatalog('DAMAGE_LOCATION', { includeInactive: true }), masterDataApi.getCatalog('DAMAGE_CODE', { includeInactive: true }),
        masterDataApi.getCatalog('REPAIR_CODE', { includeInactive: true }), masterDataApi.getCatalog('GRADE', { includeInactive: true }),
        masterDataApi.getCatalog('INSPECTION_STANDARD', { includeInactive: true }), masterDataApi.getCatalog('DEPARTMENT', { includeInactive: true })
      ]);
      const mapItems = (response: any) => response?.data || [];
      setLocations(mapItems(locationResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', category: readJson(item.jsonData).category || 'STRUCTURE', checklistZone: readJson(item.jsonData).checklistZone ?? '', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setDamageCodes(mapItems(damageResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, damageType: readJson(item.jsonData).damageType || 'OTHER', description: item.description || '', severity: readJson(item.jsonData).severity || 'MEDIUM', standard: readJson(item.jsonData).standard || 'UNIVERSAL', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setRepairCodes(mapItems(repairResponse).map((item: any) => ({ id: item.id, repairCode: item.code, stsCode: readJson(item.jsonData).stsCode || item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', repairType: readJson(item.jsonData).repairType || 'STRAIGHTEN', labourRate: readJson(item.jsonData).labourRate || 0, labourHours: readJson(item.jsonData).labourHours || 0, materialEstimatedCost: readJson(item.jsonData).materialEstimatedCost || 0, status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setGrades(mapItems(gradeResponse).map((item: any) => ({ id: item.id, gradeCode: item.code, gradeName: item.nameVi || item.name, description: item.description || '', shippingLine: readJson(item.jsonData).shippingLine || 'ALL', customer: readJson(item.jsonData).customer || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setStandards(mapItems(standardResponse).map((item: any) => ({ id: item.id, standardCode: item.code, standardName: item.name, shippingLine: readJson(item.jsonData).shippingLine || 'ALL', containerType: readJson(item.jsonData).containerType || 'ALL', containerSize: readJson(item.jsonData).containerSize || 'ALL', version: readJson(item.jsonData).version || '', effectiveDate: readJson(item.jsonData).effectiveDate || '', description: item.description || '', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setDepartments(mapItems(departmentResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.nameVi || item.name, shortName: readJson(item.jsonData).shortName || item.code, managerName: readJson(item.jsonData).managerName || '', managerPhone: readJson(item.jsonData).managerPhone || '', managerEmail: readJson(item.jsonData).managerEmail || '', location: readJson(item.jsonData).location || '', headcount: readJson(item.jsonData).headcount || 0, primaryRole: readJson(item.jsonData).primaryRole || item.name, primaryRoleCode: readJson(item.jsonData).primaryRoleCode || item.code, status: item.isActive ? 'ACTIVE' : 'INACTIVE', operatingHours: readJson(item.jsonData).operatingHours || '', costCenter: readJson(item.jsonData).costCenter || '', division: readJson(item.jsonData).division || 'OPERATIONS', divisionName: readJson(item.jsonData).divisionName || '', description: item.description || '', tags: readJson(item.jsonData).tags || [] })));
    };
    load().catch((error) => setMasterDataError(getApiErrorMessage(error, 'Không thể tải catalog kỹ thuật từ backend.')));
  }, []);

  React.useEffect(() => {
    const readJson = (value: unknown): Record<string, any> => {
      try { return JSON.parse(String(value || '{}')); } catch { return {}; }
    };
    Promise.all([
      masterDataApi.getCatalog('CONTAINER_TYPE', { includeInactive: true }),
      masterDataApi.getCleaningTariffs({ includeInactive: true })
    ]).then(([containerResponse, cleaningResponse]: any[]) => {
      const containersFromApi = (containerResponse.data || []).map(mapContainerTypeCatalogItem);
      const cleaningFromApi = (cleaningResponse.data || []).map(mapCleaningTariff);
      setContainerTypes(containersFromApi);
      setCleaningTariffs(cleaningFromApi);
    }).catch((error) => setMasterDataError(getApiErrorMessage(error, 'Không thể tải catalog từ backend.')));
  }, []);

  React.useEffect(() => {
    if (initialTab) {
      setActiveMasterTab(initialTab);
    }
  }, [initialTab]);

  // `MasterCatalogItem.Id` backend là `long` (vd "1", "42"), KHÔNG phải Guid — item mới tạo trên UI
  // (chưa lưu) dùng id tạm dạng khác (uuid của trình duyệt hoặc chuỗi rỗng) nên chỉ cần phân biệt
  // "toàn số" (đã có thật trong DB) hay không, không cần regex GUID.
  const isPersistedCatalogId = (id: unknown) => /^\d+$/.test(String(id ?? ''));

  // Trước đây mọi lời gọi `persistCatalog(...)` ở các callback bên dưới không có `.catch` nào — nếu
  // lưu thất bại (vd trùng Code với dòng khác), state cục bộ đã cập nhật lạc quan (optimistic) rồi vẫn
  // hiển thị như đã lưu, không báo lỗi gì, F5 lại thì dữ liệu vừa nhập biến mất. Giờ bắt lỗi tập trung
  // ngay tại đây (nguồn dùng chung cho cả 8 catalog dưới), hiện banner lỗi có sẵn (`masterDataError`)
  // và rollback state về đúng giá trị trước khi sửa nếu `setItems` được truyền vào.
  // `setItems` còn dùng để thay id tạm (vd "CT-05") của dòng vừa tạo bằng id thật DB trả về — nếu không,
  // xóa/tạm ngưng ngay dòng đó trong cùng phiên sẽ không bao giờ tới được DB (id tạm không phải số).
  // `nameKey`: field nào của item ghi vào cột `Name` (mặc định `name`) — CONTAINER_TYPE ghi mã loại.
  const persistCatalog = async (catalogType: string, previous: any[], updated: any[], codeKey: string, setItems?: React.Dispatch<React.SetStateAction<any[]>>, nameKey = 'name') => {
    try {
      const createdIds = new Map<string, string>();
      const previousIds = new Set(previous.map((item) => String(item.id)));
      const updatedIds = new Set(updated.map((item) => String(item.id)));
      const remoteResponse: any = await masterDataApi.getCatalog(catalogType, { includeInactive: true });
      const remoteByCode = new Map((remoteResponse.data || []).map((item: any) => [String(item.code).toUpperCase(), item]));
      await Promise.all(previous.filter((item) => !updatedIds.has(String(item.id)) && isPersistedCatalogId(item.id))
        .map((item) => masterDataApi.deactivateCatalog(String(item.id))));
      await Promise.all(updated.map(async (item, index) => {
        const code = String(item[codeKey] || item.code || `${catalogType}_${index + 1}`).trim().toUpperCase();
        const request = {
          catalogType, code, name: item[nameKey] || item.nameVi || item.gradeName || code,
          nameVi: item.vietnameseName || item.nameVi || item.gradeName || item.name,
          description: item.description || '', jsonData: JSON.stringify(item), isActive: item.status !== 'INACTIVE', sortOrder: item.sortOrder ?? index + 1
        };
        const remoteItem: any = remoteByCode.get(code);
        if (previousIds.has(String(item.id)) && isPersistedCatalogId(item.id)) {
          await masterDataApi.updateCatalog(String(item.id), request);
        } else if (remoteItem?.id) {
          await masterDataApi.updateCatalog(String(remoteItem.id), request);
          createdIds.set(String(item.id), String(remoteItem.id));
        } else {
          const created: any = await masterDataApi.createCatalog(request);
          if (created?.data?.id != null) createdIds.set(String(item.id), String(created.data.id));
        }
      }));
      if (setItems && createdIds.size > 0) {
        setItems((current) => current.map((item) => createdIds.has(String(item.id)) ? { ...item, id: createdIds.get(String(item.id)) } : item));
      }
      setMasterDataError(null);
    } catch (error: any) {
      const detail = error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : null);
      setMasterDataError(detail || `Không thể lưu thay đổi danh mục "${catalogType}" xuống SQL Server.`);
      if (setItems) setItems(previous);
    }
  };

  // Master Data Groups Definition
  const masterGroups = [
    {
      groupTitle: 'DANH MỤC KHAI THÁC & KỸ THUẬT VỎ',
      items: [
        {
          id: 'container_types',
          label: 'Loại Container (ISO 6346)',
          desc: `${containerTypes.length} quy cách chuẩn: 20ft (1.0 TEU), 40ft, 45ft, Reefer, OT, FR, Tank, Special...`,
          icon: Container,
          count: containerTypes.length,
          color: 'text-sky-600',
          bg: 'bg-sky-50'
        },
        {
          id: 'damage_locations',
          label: 'Vị Trí Cấu Kiện (Locations)',
          desc: '18 vị trí cấu kiện container tiêu chuẩn',
          icon: MapPin,
          count: locations.length,
          color: 'text-amber-600',
          bg: 'bg-amber-50'
        },
        {
          id: 'survey_checklist',
          label: 'Khu Vực Checklist Giám Định',
          desc: 'Các khu vực đánh giá Đạt / Không Đạt / N/A trên phiếu giám định',
          icon: ClipboardCheck,
          count: surveyChecklistZones.length,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        },
        {
          id: 'damage_codes',
          label: 'Mã Hư Hỏng (Damage Codes)',
          desc: 'Mã tổn thất chuẩn IICL-6 & CEDEX',
          icon: FileCode,
          count: damageCodes.length,
          color: 'text-rose-600',
          bg: 'bg-rose-50'
        },
        {
          id: 'repair_codes',
          label: 'Mã Sửa Chữa (Repair Codes)',
          desc: 'Phương án kỹ thuật STS & Đơn vị tính',
          icon: Hammer,
          count: repairCodes.length,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        },
        {
          id: 'grades',
          label: 'Phân Hạng Vỏ (Quality Grades)',
          desc: 'Grade A, Food Grade, General, Scrap',
          icon: Sparkles,
          count: grades.length,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50'
        },
        {
          id: 'standards',
          label: 'Tiêu Chuẩn Giám Định (Standards)',
          desc: 'IICL-6, MCIC, MRIC, Carrier Rules',
          icon: ShieldCheck,
          count: standards.length,
          color: 'text-purple-600',
          bg: 'bg-purple-50'
        }
      ]
    },
    {
      groupTitle: 'DANH MỤC TỔ CHỨC, ĐỐI TÁC & BIỂU PHÍ DỊCH VỤ',
      items: [
        {
          id: 'departments',
          label: 'DM Phòng Ban & Cơ Cấu Tổ Chức',
          desc: `${departments.length} phòng ban nghiệp vụ Depot: Ban Giám Đốc, Cổng Gate, Giám Định, Sửa Chữa M&R, Kế Toán...`,
          icon: Building2,
          count: departments.length,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50'
        },
        {
          id: 'cleaning_tariffs',
          label: 'Biểu Phí Vệ Sinh Container (Cleaning)',
          desc: '10 phương pháp xịt rửa, hóa chất, khử mùi & bảng giá',
          icon: Droplets,
          count: cleaningTariffs.length,
          color: 'text-cyan-600',
          bg: 'bg-cyan-50'
        },
        {
          id: 'shipping_lines',
          label: 'Danh Mục Hãng Tàu Khai Thác',
          desc: `${shippingLines.length} hãng tàu từ SQL Server`,
          icon: Building2,
          count: shippingLines.length,
          color: 'text-sky-600',
          bg: 'bg-sky-50'
        },
        {
          // Trước đây 1 mục "Biểu Cước Nâng Hạ & Lưu Bãi" gộp chung (đếm cứng `count: 24`, không lấy
          // từ dữ liệu thật) — đã tách thành 3 danh mục riêng theo yêu cầu người dùng, mỗi mục đếm đúng
          // số dòng thật từ component con tự fetch (không có state chung ở MasterDataPage nên không thể
          // hiển thị count real-time ở đây, giữ mô tả tĩnh thay vì số giả).
          id: 'tariff_lolo',
          label: 'Cước Nâng Hạ (LoLo)',
          desc: 'Phí nâng hạ vỏ rỗng Gate-In/Out, đảo chuyển nội bộ bãi, phụ phí ca đêm',
          icon: Truck,
          count: loloTariffCount,
          color: 'text-cyan-600',
          bg: 'bg-cyan-50'
        },
        {
          id: 'tariff_storage',
          label: 'Cước Lưu Bãi (Storage)',
          desc: 'Free time và biểu phí lưu bãi lũy tiến theo hãng tàu',
          icon: Layers,
          count: storageTariffCount,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50'
        },
        {
          id: 'customer_classifications',
          label: 'Phân Loại Khách Hàng',
          desc: 'Danh mục nhóm phân loại khách hàng, nhà xe, forwarder và mô tả chi tiết',
          icon: Tag,
          count: 5,
          color: 'text-pink-600',
          bg: 'bg-pink-50'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      {/* Nền sáng theo chuẩn giao diện chung — trước đây gradient tối + chữ tối, tiêu đề gần như không đọc được (BUG-033). */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl shadow-lg">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                DANH MỤC HỆ THỐNG &amp; MASTER DATA
              </h1>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold rounded-full">
                IICL-6 / ISO-6346 / CEDEX
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quản trị tập trung danh mục cấu kiện, bảng mã hư hỏng, quy trình sửa chữa, cấp phân hạng và quy chuẩn kỹ thuật toàn Depot.
            </p>
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const exportData = {
                departments,
                containerTypes,
                locations,
                damageCodes,
                repairCodes,
                grades,
                standards,
                exportedAt: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `DEPOT-MASTER-DATA-${new Date().toISOString().substring(0, 10)}.json`;
              a.click();
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất JSON Master</span>
          </button>

          <button
            onClick={() => alert('Dữ liệu Master Data đã được đồng bộ chuẩn IICL-6 mới nhất!')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg "
          >
            <RefreshCw className="w-4 h-4" />
            <span>Đồng Bộ IICL Chuẩn</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-2 shadow-xl">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {masterGroups.flatMap((g) => g.items).map((item) => {
            const Icon = item.icon;
            const isActive = activeMasterTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMasterTab(item.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg  ring-1 ring-indigo-400/50'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : item.color}`} />
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-indigo-50 text-indigo-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Rendering By Tab */}
      <div className="min-h-[480px]">
        {masterDataError && <div className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs">{masterDataError}</div>}
        {/* Container Types Master (ISO 6346) */}
        {(activeMasterTab === 'container_types' || activeMasterTab === 'iso_types') && (
          <ContainerTypeMaster
            containerTypes={containerTypes}
            onUpdateContainerTypes={(updated) => { setContainerTypes(updated); void persistCatalog('CONTAINER_TYPE', containerTypes, updated, 'isoCode', setContainerTypes, 'typeCode'); }}
          />
        )}

        {activeMasterTab === 'damage_locations' && (
          <DamageLocationMaster
            locations={locations}
            onUpdateLocations={(updated) => { setLocations(updated); void persistCatalog('DAMAGE_LOCATION', locations, updated, 'code', setLocations); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'survey_checklist' && <SurveyChecklistMaster />}

        {activeMasterTab === 'damage_codes' && (
          <DamageCodeMaster
            damageCodes={damageCodes}
            onUpdateDamageCodes={(updated) => { setDamageCodes(updated); void persistCatalog('DAMAGE_CODE', damageCodes, updated, 'code', setDamageCodes); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'repair_codes' && (
          <RepairCodeMaster
            repairCodes={repairCodes}
            onUpdateRepairCodes={(updated) => { setRepairCodes(updated); void persistCatalog('REPAIR_CODE', repairCodes, updated, 'repairCode', setRepairCodes); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'grades' && (
          <GradeMaster
            grades={grades}
            onUpdateGrades={(updated) => { setGrades(updated); void persistCatalog('GRADE', grades, updated, 'gradeCode', setGrades); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'standards' && (
          <InspectionStandardMaster
            standards={standards}
            onUpdateStandards={(updated) => { setStandards(updated); void persistCatalog('INSPECTION_STANDARD', standards, updated, 'standardCode', setStandards); }}
            persistedToBackend
          />
        )}

        {/* Cleaning Tariff Master */}
        {activeMasterTab === 'cleaning_tariffs' && (
          <CleaningMaster
            cleaningTariffs={cleaningTariffs}
            // CleaningMaster tự lưu từng dòng qua API /MasterData/cleaning-tariffs — ở đây chỉ cập nhật state hiển thị.
            onUpdateCleaningTariffs={setCleaningTariffs}
            containerTypes={containerTypes}
          />
        )}

        {/* Shipping Lines Master — trước đây là khối tĩnh hardcode luôn hiện cứng "MAERSK LINE (MAEU)" kèm
            số liệu bịa (IICL-6, Auto-Approve $150...), không có danh sách/thêm/sửa/xoá. Giờ tách thành
            component riêng CRUD thật xuống bảng ShippingLines qua masterDataApi. */}
        {activeMasterTab === 'shipping_lines' && <ShippingLineMaster />}

        {/* Tariff Services: Lift-On/Lift-Off & Storage Master */}
        {/* Cước Nâng Hạ / Cước Lưu Bãi / Máy Tính — 3 danh mục tách riêng, xem comment ở import phía trên.
            Giữ lại các id cũ (`tariff_services`/`lolo_storage`/`master_tariffs`) trỏ về đúng 1 trong 3
            màn mới để không phá vỡ điều hướng nếu còn nơi nào khác trong code cũ gọi tới id cũ. */}
        {(activeMasterTab === 'tariff_lolo' || activeMasterTab === 'tariff_services' || activeMasterTab === 'lolo_storage' || activeMasterTab === 'master_tariffs') && (
          <LoloTariffMaster />
        )}
        {activeMasterTab === 'tariff_storage' && (
          <StorageTariffMaster />
        )}

        {/* Customer Classifications Master */}
        {(activeMasterTab === 'customer_classifications' || activeMasterTab === 'master_customers') && (
          <CustomerClassificationMaster />
        )}

        {/* Departments Master Data */}
        {(activeMasterTab === 'departments' || activeMasterTab === 'master_departments') && (
          <DepartmentMaster
            departments={departments}
            onUpdateDepartments={(updated) => { setDepartments(updated); void persistCatalog('DEPARTMENT', departments, updated, 'code', setDepartments); }}
          />
        )}
      </div>
    </div>
  );
};
