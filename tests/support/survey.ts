import { admin, call, getCatalog, readJson, login } from './api';
import { TEST_PREFIX } from './env';

// Dựng phiếu giám định cho test — khu vực / vị trí lấy từ danh mục DB thật, không gõ cứng.
export interface ZoneDef { code: string; nameVi: string; defaultStatus: string }

export async function loadSurveyCatalogs() {
  const zones: ZoneDef[] = (await getCatalog('SURVEY_CHECKLIST')).map((z) => ({
    code: z.code, nameVi: z.nameVi || z.name, defaultStatus: readJson(z.jsonData).defaultStatus || 'PASS'
  }));
  const locations = (await getCatalog('DAMAGE_LOCATION')).map((l) => ({ code: l.code as string, zone: readJson(l.jsonData).checklistZone as string | undefined }));
  /** Mã vị trí đầu tiên gắn vào khu vực (vd 'ROOF' → 'RF1'). */
  const locationOf = (zone: string) => {
    const loc = locations.find((l) => l.zone === zone);
    if (!loc) throw new Error(`Danh mục vị trí không có vị trí nào gắn khu vực ${zone}`);
    return loc.code;
  };
  return { zones, locations, locationOf };
}

export type ChecklistOverride = Record<string, Partial<{ status: string; damageCount: number }>>;

export const checklistFrom = (zones: ZoneDef[], over: ChecklistOverride = {}) =>
  zones.map((z) => ({ zoneKey: z.code, zoneName: 'tên gửi từ trình duyệt', status: z.defaultStatus, damageCount: 0, ...(over[z.code] || {}) }));

export const damageAt = (locationCode: string) => ({
  component: locationCode, locationCode, damageCode: 'DENT', repairCode: 'ST', quantity: 1, unit: 'PCS',
  laborHours: 1, laborRate: 100000, materialCost: 50000, severity: 'MEDIUM'
});

// Dịch vụ vệ sinh mặc định của phiếu test: biểu phí vệ sinh test riêng (QA_T_CLN_STD) có giá 50.000 đ cho mọi loại container
// đang có — server chỉ nhận dịch vụ thuộc Biểu Phí Vệ Sinh (depot-fullstack-cleaning-tariff-pricing). Dọn ở global teardown.
export const TEST_CLEANING_CODE = `${TEST_PREFIX.catalog}CLN_STD`;
let testCleaningReady: Promise<void> | null = null;
export const ensureTestCleaningTariff = () => (testCleaningReady ??= (async () => {
  const existing = ((await call(admin(), 'GET', '/MasterData/cleaning-tariffs?includeInactive=true')).data || []) as any[];
  if (existing.some((t) => t.code === TEST_CLEANING_CODE)) return;
  const types = (await getCatalog('CONTAINER_TYPE', true)).map((t) => t.name as string).filter((n) => n && n.length <= 20);
  const r = await call(admin(), 'POST', '/MasterData/cleaning-tariffs', {
    code: TEST_CLEANING_CODE, nameVi: 'Vệ sinh test', nameEn: 'QA cleaning', category: 'GENERAL_SWEEP', vatPercent: 8, currency: 'VND',
    responsiblePartyDefault: 'U', isActive: true, sortOrder: 999, prices: types.map((containerTypeCode) => ({ containerTypeCode, price: 50000 }))
  });
  if (r.status !== 200) throw new Error(`Tạo biểu phí vệ sinh test lỗi: ${r.status} ${r.msg}`);
})());
const cleaningItem = { cleaningCode: TEST_CLEANING_CODE, cleaningName: 'Vệ sinh test', category: 'GENERAL', quantity: 1, unitPrice: 1, totalPrice: 1 };

export async function claimSurvey(jobId: string) {
  const r = await call(admin(), 'POST', `/DepotJobs/${jobId}/survey/claim`, {});
  if (r.status !== 200) throw new Error(`Nhận phiếu ${jobId} lỗi: ${r.status} ${r.msg}`);
}

export async function releaseSurvey(jobId: string) {
  const me = await login();
  await call(admin(), 'POST', `/DepotJobs/${jobId}/survey/release?staffId=${me.id}`, {});
}

/** Lưu nháp / nộp phiếu. Mặc định: nháp, hạng C, 1 dịch vụ vệ sinh, không hư hỏng. */
export const submitSurvey = async (jobId: string, body: Record<string, unknown>) => {
  await ensureTestCleaningTariff();
  return call(admin(), 'POST', `/DepotJobs/${jobId}/survey`, {
    conditionRating: 'C', isDraft: true, cleaningReason: [], cleaningItems: [cleaningItem], photos: [], damages: [], ...body
  });
};
