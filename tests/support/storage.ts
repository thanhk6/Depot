import { expect } from '@playwright/test';
import { admin, call } from './api';
import { TEST_PREFIX } from './env';

// Dữ liệu test cước lưu bãi: hãng tàu test QA_T_SL… (DM Hãng Tàu) + quy tắc QA_T_STO… của hãng đó — không đụng quy tắc thật
// (mỗi hãng chỉ 1 quy tắc đang dùng, quy tắc "ALL" thật giữ nguyên).
let seq = 0;
const uniq = () => `${Date.now() % 100000}${seq++}`;

export async function createTestShippingLine() {
  const code = `${TEST_PREFIX.catalog}SL${uniq()}`;
  const r = await call(admin(), 'POST', '/MasterData/shipping-lines', { code, name: `Hãng test ${code}` });
  expect(r.status, r.msg).toBe(200);
  return code;
}

export type TierDef = { fromDay: number; toDay: number | null; prices: Record<string, number>; tierName?: string };

export const storageRuleBody = (lineCode: string, freeDays: number, tiers: TierDef[], over: Record<string, unknown> = {}) => ({
  code: `${TEST_PREFIX.catalog}STO${uniq()}`, shippingLineCode: lineCode, defaultFreeDays: freeDays, vatPercent: 8,
  notes: 'QA', isActive: true, sortOrder: 990,
  tiers: tiers.map((t, i) => ({
    tierName: t.tierName ?? `Bậc ${i + 1}`, fromDay: t.fromDay, toDay: t.toDay, sortOrder: i + 1,
    prices: Object.entries(t.prices).map(([containerTypeCode, price]) => ({ containerTypeCode, price }))
  })),
  ...over
});

export async function createStorageRule(body: ReturnType<typeof storageRuleBody>) {
  const r = await call(admin(), 'POST', '/MasterData/storage-tariffs', body);
  expect(r.status, r.msg).toBe(200);
  return { id: String(r.data.id), data: r.data, body };
}

export const storageFee = async (jobId: string) => {
  const r = await call(admin(), 'GET', `/DepotJobs/${jobId}/storage-fee`);
  expect(r.status, r.msg).toBe(200);
  return r.data as any;
};
