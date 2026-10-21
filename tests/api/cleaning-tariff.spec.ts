import { test, expect } from '@playwright/test';
import { admin, call, gateInTestContainer, getJob } from '../support/api';
import { loadSurveyCatalogs, checklistFrom, claimSurvey, submitSurvey } from '../support/survey';
import { jobReadyForServiceOrder, orderItem, createServiceOrder } from '../support/serviceOrder';
import { TEST_PREFIX } from '../support/env';

// Spec: openspec/specs/cleaning-tariff/spec.md, container-survey / container-cleaning / service-order (giá vệ sinh do server tra).
// Chỉ dùng biểu phí vệ sinh test QA_T_* và container QATS*.
let seq = 0;
async function createCleaningTariff(over: Record<string, unknown> & { prices?: Record<string, number> } = {}) {
  const code = String(over.code ?? `${TEST_PREFIX.catalog}CLN_${Date.now() % 100000}_${seq++}`);
  const { prices, ...rest } = over;
  const priceMap = prices ?? { '40HC': 450000, '40GP': 420000, '45HC': 480000, '20HC': 280000 };
  const body = {
    code, nameVi: 'Vệ sinh hoá chất test', nameEn: 'QA chemical', category: 'CHEMICAL_WASH', vatPercent: 8, currency: 'VND',
    responsiblePartyDefault: 'U', isActive: true, sortOrder: 999, ...rest, code,
    prices: Object.entries(priceMap).filter(([, p]) => p !== 0).map(([containerTypeCode, price]) => ({ containerTypeCode, price }))
  };
  const r = await call(admin(), 'POST', '/MasterData/cleaning-tariffs', body);
  expect(r.status, r.msg).toBe(200);
  return { id: String(r.data.id), code, body, data: r.data };
}
const cleaningLine = (code: string, over: Record<string, unknown> = {}) =>
  ({ cleaningCode: code, cleaningName: 'tên bịa', category: 'GENERAL', quantity: 1, unitPrice: 1, totalPrice: 1, ...over });

test.describe('cleaning-tariff › Dữ liệu biểu phí vệ sinh hợp lệ', () => {
  test('Giá trị sai bị từ chối (VAT, tiền tệ, tên, nhóm, bên chịu phí)', async () => {
    const t = await createCleaningTariff();
    for (const [field, value] of [['vatPercent', 150], ['currency', 'USD'], ['nameVi', ''], ['category', 'ABC'], ['responsiblePartyDefault', 'X']] as const) {
      const r = await call(admin(), 'PUT', `/MasterData/cleaning-tariffs/${t.id}`, { ...t.body, [field]: value });
      expect(r.status, `${field}=${value}`).toBe(400);
    }
  });

  test('Đổi mã bị từ chối', async () => {
    const t = await createCleaningTariff();
    const r = await call(admin(), 'PUT', `/MasterData/cleaning-tariffs/${t.id}`, { ...t.body, code: `${t.code}2` });
    expect(r.status).toBe(400);
    expect(r.msg).toMatch(/Không đổi mã/);
  });

  test('Sửa một dòng chỉ đổi đúng dòng đó', async () => {
    const a = await createCleaningTariff();
    const b = await createCleaningTariff();
    const r = await call(admin(), 'PUT', `/MasterData/cleaning-tariffs/${a.id}`, { ...a.body, nameVi: 'Đã sửa' });
    expect(r.status, r.msg).toBe(200);
    const all = ((await call(admin(), 'GET', '/MasterData/cleaning-tariffs?includeInactive=true')).data || []) as any[];
    expect(all.find((x) => String(x.id) === a.id)?.nameVi).toBe('Đã sửa');
    expect(all.find((x) => String(x.id) === b.id)?.lastModifiedAt ?? null).toBe(b.data.lastModifiedAt ?? null);
  });
});

test.describe('cleaning-tariff › Đơn giá vệ sinh theo từng loại container', () => {
  test('Giá sai bị từ chối: âm, loại không có trong DM, trùng loại', async () => {
    const t = await createCleaningTariff();
    const put = (prices: unknown[]) => call(admin(), 'PUT', `/MasterData/cleaning-tariffs/${t.id}`, { ...t.body, prices });
    expect((await put([{ containerTypeCode: '40HC', price: -1 }])).status).toBe(400);
    expect((await put([{ containerTypeCode: '99ZZ', price: 1 }])).msg).toContain("'99ZZ'");
    expect((await put([{ containerTypeCode: '40HC', price: 1 }, { containerTypeCode: '40hc', price: 2 }])).status).toBe(400);
  });
});

test.describe('container-survey › Giá dịch vụ vệ sinh trên phiếu giám định do server tra', () => {
  test('Trình duyệt gửi giá khác: phiếu và lệnh vệ sinh lưu giá biểu phí theo loại (40HC ≠ 40GP)', async () => {
    const t = await createCleaningTariff();
    const { zones } = await loadSurveyCatalogs();
    for (const [iso, expected] of [['40HC', 450000], ['40GP', 420000]] as const) {
      const job = await gateInTestContainer(iso);
      await claimSurvey(job.id);
      const r = await submitSurvey(job.id, { isDraft: false, checklist: checklistFrom(zones), cleaningItems: [cleaningLine(t.code, { quantity: 2 })] });
      expect(r.status, r.msg).toBe(200);
      const item = (await getJob(job.id)).survey.cleaningItems.find((c: any) => c.cleaningCode === t.code);
      expect([Number(item.unitPrice), Number(item.totalPrice), item.cleaningName]).toEqual([expected, expected * 2, 'Vệ sinh hoá chất test']);
      const record = (((await call(admin(), 'GET', '/cleaning')).data || []) as any[]).find((x) => x.containerNo === job.containerNo);
      const work = (record.items || record.workItems || []).find((w: any) => w.cleaningCode === t.code);
      expect(Number(work.unitPrice)).toBe(expected);
    }
  });

  test('Loại chưa có giá / mã không có trong danh mục / tạm ngưng: từ chối, không lưu', async () => {
    const noPrice = await createCleaningTariff({ prices: { '40HC': 450000 } });
    const inactive = await createCleaningTariff({ isActive: false });
    const { zones } = await loadSurveyCatalogs();
    const job = await gateInTestContainer('45HC');
    await claimSurvey(job.id);
    for (const [code, message] of [[noPrice.code, `chưa có giá cho loại 45HC`], ['CL-XYZ', 'CL-XYZ'], [inactive.code, 'tạm ngưng']] as const) {
      const r = await submitSurvey(job.id, { checklist: checklistFrom(zones), cleaningItems: [cleaningLine(code)] });
      expect(r.status, code).toBe(400);
      expect(String(r.data ?? r.msg)).toContain(message);
    }
    expect((await getJob(job.id)).survey).toBeFalsy();
  });
});

test.describe('container-cleaning › Giá lệnh vệ sinh thủ công do server tra', () => {
  test('Đơn giá gửi lên 0đ → lưu theo biểu phí; chưa có giá → từ chối', async () => {
    const t = await createCleaningTariff();
    const job = await gateInTestContainer('40GP');
    const r = await call(admin(), 'POST', '/cleaning', { containerNo: job.containerNo, items: [{ cleaningCode: t.code, cleaningName: 'x', unitPrice: 0 }] });
    expect(r.status, r.msg).toBe(200);
    const record = (((await call(admin(), 'GET', '/cleaning')).data || []) as any[]).find((x) => x.containerNo === job.containerNo);
    expect(Number((record.items || record.workItems)[0].unitPrice)).toBe(420000);
    const noPrice = await createCleaningTariff({ prices: { '40HC': 1 } });
    const job2 = await gateInTestContainer('40GP');
    const r2 = await call(admin(), 'POST', '/cleaning', { containerNo: job2.containerNo, items: [{ cleaningCode: noPrice.code, cleaningName: 'x', unitPrice: 999 }] });
    expect(r2.status).toBe(400);
  });
});

test.describe('service-order › Dòng vệ sinh trên phiếu dịch vụ theo từng dịch vụ', () => {
  test('Dòng vệ sinh: giá + VAT theo biểu phí, bỏ qua giá gửi lên; tạm ngưng → từ chối', async () => {
    const t = await createCleaningTariff({ vatPercent: 10 });
    const job = await jobReadyForServiceOrder('40HC');
    const r = await createServiceOrder(job, [orderItem(t.code, { category: 'CLEANING', unitPrice: 1, vatPercent: 0 })]);
    expect(r.status, r.msg).toBe(200);
    const line = r.data.items.find((i: any) => i.serviceCode === t.code);
    expect([Number(line.unitPrice), Number(line.vatPercent), line.category]).toEqual([450000, 10, 'CLEANING']);

    const off = await createCleaningTariff({ isActive: false });
    const job2 = await jobReadyForServiceOrder('40HC');
    const r2 = await createServiceOrder(job2, [orderItem(off.code, { category: 'CLEANING' })]);
    expect(r2.status).toBe(400);
    expect(r2.msg).toMatch(/tạm ngưng/);
  });
});
