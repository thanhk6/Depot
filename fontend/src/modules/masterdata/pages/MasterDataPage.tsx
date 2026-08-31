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
import {
} from '../../survey/mockData';
import { DamageLocationMaster } from '../../survey/components/DamageLocationMaster';
import { DamageCodeMaster } from '../../survey/components/DamageCodeMaster';
import { RepairCodeMaster } from '../../survey/components/RepairCodeMaster';
import { GradeMaster } from '../../survey/components/GradeMaster';
import { InspectionStandardMaster } from '../../survey/components/InspectionStandardMaster';
import { ContainerTypeMaster } from '../components/ContainerTypeMaster';
import { CleaningMaster } from '../components/CleaningMaster';
// "Cước Nâng Hạ & Lưu Bãi" đã tách thành 3 danh mục riêng biệt theo yêu cầu người dùng (thay cho
// component gộp chung `LiftOnLiftOffAndStorageMaster.tsx` cũ, đã xoá) — xem
// docs/frontend-tariff-catalog-split.md.
import { LoloTariffMaster } from '../components/LoloTariffMaster';
import { StorageTariffMaster } from '../components/StorageTariffMaster';
import { TariffCalculatorPage } from '../components/TariffCalculatorPage';
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
  Calculator
} from 'lucide-react';

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
      .catch((error) => setMasterDataError(error instanceof Error ? error.message : 'Không thể tải Master Data từ backend.'));
  }, []);

  React.useEffect(() => {
    const readJson = (value: unknown): Record<string, any> => {
      try { return JSON.parse(String(value || '{}')); } catch { return {}; }
    };
    const load = async () => {
      const [locationResponse, damageResponse, repairResponse, gradeResponse, standardResponse, departmentResponse] = await Promise.all([
        masterDataApi.getCatalog('DAMAGE_LOCATION'), masterDataApi.getCatalog('DAMAGE_CODE'),
        masterDataApi.getCatalog('REPAIR_CODE'), masterDataApi.getCatalog('GRADE'),
        masterDataApi.getCatalog('INSPECTION_STANDARD'), masterDataApi.getCatalog('DEPARTMENT')
      ]);
      const mapItems = (response: any) => response?.data || [];
      setLocations(mapItems(locationResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', category: readJson(item.jsonData).category || 'STRUCTURE', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setDamageCodes(mapItems(damageResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.name, vietnameseName: item.nameVi || item.name, damageType: readJson(item.jsonData).damageType || 'OTHER', description: item.description || '', severity: readJson(item.jsonData).severity || 'MEDIUM', standard: readJson(item.jsonData).standard || 'UNIVERSAL', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setRepairCodes(mapItems(repairResponse).map((item: any) => ({ id: item.id, repairCode: item.code, stsCode: readJson(item.jsonData).stsCode || item.code, name: item.name, vietnameseName: item.nameVi || item.name, description: item.description || '', repairType: readJson(item.jsonData).repairType || 'STRAIGHTEN', labourRate: readJson(item.jsonData).labourRate || 0, labourHours: readJson(item.jsonData).labourHours || 0, materialEstimatedCost: readJson(item.jsonData).materialEstimatedCost || 0, status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setGrades(mapItems(gradeResponse).map((item: any) => ({ id: item.id, gradeCode: item.code, gradeName: item.nameVi || item.name, description: item.description || '', shippingLine: readJson(item.jsonData).shippingLine || 'ALL', customer: readJson(item.jsonData).customer || 'ALL', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder })));
      setStandards(mapItems(standardResponse).map((item: any) => ({ id: item.id, standardCode: item.code, standardName: item.name, shippingLine: readJson(item.jsonData).shippingLine || 'ALL', containerType: readJson(item.jsonData).containerType || 'ALL', containerSize: readJson(item.jsonData).containerSize || 'ALL', version: readJson(item.jsonData).version || '', effectiveDate: readJson(item.jsonData).effectiveDate || '', description: item.description || '', status: item.isActive ? 'ACTIVE' : 'INACTIVE' })));
      setDepartments(mapItems(departmentResponse).map((item: any) => ({ id: item.id, code: item.code, name: item.nameVi || item.name, shortName: readJson(item.jsonData).shortName || item.code, managerName: readJson(item.jsonData).managerName || '', managerPhone: readJson(item.jsonData).managerPhone || '', managerEmail: readJson(item.jsonData).managerEmail || '', location: readJson(item.jsonData).location || '', headcount: readJson(item.jsonData).headcount || 0, primaryRole: readJson(item.jsonData).primaryRole || item.name, primaryRoleCode: readJson(item.jsonData).primaryRoleCode || item.code, status: item.isActive ? 'ACTIVE' : 'INACTIVE', operatingHours: readJson(item.jsonData).operatingHours || '', costCenter: readJson(item.jsonData).costCenter || '', division: readJson(item.jsonData).division || 'OPERATIONS', divisionName: readJson(item.jsonData).divisionName || '', description: item.description || '', tags: readJson(item.jsonData).tags || [] })));
    };
    load().catch((error) => setMasterDataError(error instanceof Error ? error.message : 'Không thể tải catalog kỹ thuật từ backend.'));
  }, []);

  React.useEffect(() => {
    const readJson = (value: unknown): Record<string, any> => {
      try { return JSON.parse(String(value || '{}')); } catch { return {}; }
    };
    Promise.all([
      masterDataApi.getCatalog('CONTAINER_TYPE'),
      masterDataApi.getCatalog('CLEANING_TARIFF')
    ]).then(([containerResponse, cleaningResponse]: any[]) => {
      const containersFromApi = (containerResponse.data || []).map((item: any) => {
        const data = readJson(item.jsonData);
        return {
          id: item.id, typeCode: item.code, isoCode: data.isoCode || item.code, name: item.name,
          vietnameseName: item.nameVi || item.name, size: data.size || '20', category: data.category || 'DRY',
          isReefer: Boolean(data.isReefer), lengthMm: data.lengthMm || 0, widthMm: data.widthMm || 0,
          heightMm: data.heightMm || 0, internalLengthMm: data.internalLengthMm || 0, internalWidthMm: data.internalWidthMm || 0,
          internalHeightMm: data.internalHeightMm || 0, doorWidthMm: data.doorWidthMm || 0, doorHeightMm: data.doorHeightMm || 0,
          cbm: data.cbm || 0, tareWeightKg: data.tareWeightKg || 0, maxPayloadKg: data.maxPayloadKg || 0,
          maxGrossWeightKg: data.maxGrossWeightKg || 0, teuRatio: data.teuRatio || 1, material: data.material || 'CORTEN_STEEL',
          floorType: data.floorType || 'WOOD_PLYWOOD', description: item.description || '', status: item.isActive ? 'ACTIVE' : 'INACTIVE', sortOrder: item.sortOrder
        } as ContainerTypeMasterItem;
      });
      const cleaningFromApi = (cleaningResponse.data || []).map((item: any) => {
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
      });
      setContainerTypes(containersFromApi);
      setCleaningTariffs(cleaningFromApi);
    }).catch((error) => setMasterDataError(error instanceof Error ? error.message : 'Không thể tải catalog từ backend.'));
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
          color: 'text-sky-400',
          bg: 'bg-sky-500/10'
        },
        {
          id: 'damage_locations',
          label: 'Vị Trí Cấu Kiện (Locations)',
          desc: '18 vị trí cấu kiện container tiêu chuẩn',
          icon: MapPin,
          count: locations.length,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10'
        },
        {
          id: 'damage_codes',
          label: 'Mã Hư Hỏng (Damage Codes)',
          desc: 'Mã tổn thất chuẩn IICL-6 & CEDEX',
          icon: FileCode,
          count: damageCodes.length,
          color: 'text-rose-400',
          bg: 'bg-rose-500/10'
        },
        {
          id: 'repair_codes',
          label: 'Mã Sửa Chữa (Repair Codes)',
          desc: 'Phương án kỹ thuật STS & Đơn vị tính',
          icon: Hammer,
          count: repairCodes.length,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10'
        },
        {
          id: 'grades',
          label: 'Phân Hạng Vỏ (Quality Grades)',
          desc: 'Grade A, Food Grade, General, Scrap',
          icon: Sparkles,
          count: grades.length,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10'
        },
        {
          id: 'standards',
          label: 'Tiêu Chuẩn Giám Định (Standards)',
          desc: 'IICL-6, MCIC, MRIC, Carrier Rules',
          icon: ShieldCheck,
          count: standards.length,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10'
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
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10'
        },
        {
          id: 'cleaning_tariffs',
          label: 'Biểu Phí Vệ Sinh Container (Cleaning)',
          desc: '10 phương pháp xịt rửa, hóa chất, khử mùi & bảng giá',
          icon: Droplets,
          count: cleaningTariffs.length,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10'
        },
        {
          id: 'shipping_lines',
          label: 'Danh Mục Hãng Tàu Khai Thác',
          desc: `${shippingLines.length} hãng tàu từ SQL Server`,
          icon: Building2,
          count: shippingLines.length,
          color: 'text-sky-400',
          bg: 'bg-sky-500/10'
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
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10'
        },
        {
          id: 'tariff_storage',
          label: 'Cước Lưu Bãi (Storage)',
          desc: 'Free time và biểu phí lưu bãi lũy tiến theo hãng tàu',
          icon: Layers,
          count: storageTariffCount,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10'
        },
        {
          id: 'tariff_calculator',
          label: 'Máy Tính Cước Nâng Hạ & Lưu Bãi',
          desc: 'Công cụ mô phỏng tính tổng chi phí Nâng Hạ + Lưu Bãi + VAT',
          icon: Calculator,
          count: loloTariffCount + storageTariffCount,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10'
        },
        {
          id: 'customer_classifications',
          label: 'Phân Loại Khách Hàng',
          desc: 'Danh mục nhóm phân loại khách hàng, nhà xe, forwarder và mô tả chi tiết',
          icon: Tag,
          count: 5,
          color: 'text-pink-400',
          bg: 'bg-pink-500/10'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl shadow-lg">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                DANH MỤC HỆ THỐNG &amp; MASTER DATA
              </h1>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold rounded-full">
                IICL-6 / ISO-6346 / CEDEX
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
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
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Xuất JSON Master</span>
          </button>

          <button
            onClick={() => alert('Dữ liệu Master Data đã được đồng bộ chuẩn IICL-6 mới nhất!')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Đồng Bộ IICL Chuẩn</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-xl">
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
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-800 text-slate-400'
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
        {masterDataError && <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-300 text-xs">{masterDataError}</div>}
        {/* Container Types Master (ISO 6346) */}
        {(activeMasterTab === 'container_types' || activeMasterTab === 'iso_types') && (
          <ContainerTypeMaster
            containerTypes={containerTypes}
            onUpdateContainerTypes={(updated) => { setContainerTypes(updated); void persistCatalog('CONTAINER_TYPE', containerTypes, updated, 'typeCode'); }}
          />
        )}

        {activeMasterTab === 'damage_locations' && (
          <DamageLocationMaster
            locations={locations}
            onUpdateLocations={(updated) => { setLocations(updated); void persistCatalog('DAMAGE_LOCATION', locations, updated, 'code'); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'damage_codes' && (
          <DamageCodeMaster
            damageCodes={damageCodes}
            onUpdateDamageCodes={(updated) => { setDamageCodes(updated); void persistCatalog('DAMAGE_CODE', damageCodes, updated, 'code'); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'repair_codes' && (
          <RepairCodeMaster
            repairCodes={repairCodes}
            onUpdateRepairCodes={(updated) => { setRepairCodes(updated); void persistCatalog('REPAIR_CODE', repairCodes, updated, 'repairCode'); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'grades' && (
          <GradeMaster
            grades={grades}
            onUpdateGrades={(updated) => { setGrades(updated); void persistCatalog('GRADE', grades, updated, 'gradeCode'); }}
            persistedToBackend
          />
        )}

        {activeMasterTab === 'standards' && (
          <InspectionStandardMaster
            standards={standards}
            onUpdateStandards={(updated) => { setStandards(updated); void persistCatalog('INSPECTION_STANDARD', standards, updated, 'standardCode'); }}
            persistedToBackend
          />
        )}

        {/* Cleaning Tariff Master */}
        {activeMasterTab === 'cleaning_tariffs' && (
          <CleaningMaster
            cleaningTariffs={cleaningTariffs}
            onUpdateCleaningTariffs={(updated) => { setCleaningTariffs(updated); void persistCatalog('CLEANING_TARIFF', cleaningTariffs, updated, 'cleaningCode'); }}
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
        {activeMasterTab === 'tariff_calculator' && (
          <TariffCalculatorPage />
        )}

        {/* Customer Classifications Master */}
        {(activeMasterTab === 'customer_classifications' || activeMasterTab === 'master_customers') && (
          <CustomerClassificationMaster />
        )}

        {/* Departments Master Data */}
        {(activeMasterTab === 'departments' || activeMasterTab === 'master_departments') && (
          <DepartmentMaster
            departments={departments}
            onUpdateDepartments={(updated) => { setDepartments(updated); void persistCatalog('DEPARTMENT', departments, updated, 'code'); }}
          />
        )}
      </div>
    </div>
  );
};
