import { test, expect } from '@playwright/test';
import { admin, call, gateInTestContainer } from '../support/api';
import { setTestJob, lastAudit } from '../support/db';
import { createTestShippingLine, storageRuleBody, createStorageRule, storageFee } from '../support/storage';
import { jobReadyForServiceOrder, orderItem, createServiceOrder } from '../support/serviceOrder';

// Spec: openspec/changes/depot-fullstack-storage-tariff-pricing/specs (storage-tariff, gate-out, service-order).
// Chỉ dùng hãng tàu test QA_T_SL…, quy tắc QA_T_STO… và container QATS…; quy tắc thật (STOR_DRY_STANDARD) chỉ đọc.

const STD = (line: string, over: Record<string, unknown> = {}) =>
  storageRuleBody(line, 5, [
    { fromDay: 6, toDay: 10, prices: { '40HC': 60000, '20HC': 35000 } },
    { fromDay: 11, toDay: null, prices: { '40HC': 100000, '20HC': 50000 } }
  ], over);

test.describe('storage-tariff › Quy tắc lưu bãi hợp lệ', () => {
  test('Hãng tàu lạ, quy tắc đang dùng trùng hãng, đổi mã → 400; VAT 0 giữ 0; tên hãng lấy từ DM', async () => {
    const line = await createTestShippingLine();
    const unknown = await call(admin(), 'POST', '/MasterData/storage-tariffs', STD('QA_T_NOLINE'));
    expect(unknown.status).toBe(400);
    expect(unknown.msg).toMatch(/không có trong DM Hãng Tàu/);

    const rule = await createStorageRule(STD(line, { vatPercent: 0 }));
    expect(Number(rule.data.vatPercent)).toBe(0);
    expect(rule.data.shippingLineName).toBe(`Hãng test ${line}`);

    const dup = await call(admin(), 'POST', '/MasterData/storage-tariffs', STD(line));
    expect(dup.status).toBe(400);
    expect(dup.msg).toContain(rule.body.code);
    // Quy tắc tạm ngưng thì được trùng hãng
    const inactive = await call(admin(), 'POST', '/MasterData/storage-tariffs', STD(line, { isActive: false }));
    expect(inactive.status, inactive.msg).toBe(200);

    const rename = await call(admin(), 'PUT', `/MasterData/storage-tariffs/${rule.id}`, { ...rule.body, code: `${rule.body.code}X` });
    expect(rename.status).toBe(400);
    expect(rename.msg).toMatch(/Không đổi mã/);
  });

  test('Bậc trong ngày miễn phí / hở / chồng / bậc cuối có hạn, loại lạ, giá âm → 400', async () => {
    const line = await createTestShippingLine();
    const bad: [string, ReturnType<typeof storageRuleBody>][] = [
      ['bậc đầu trong ngày miễn phí', storageRuleBody(line, 5, [{ fromDay: 1, toDay: null, prices: { '40HC': 1 } }])],
      ['hở ngày', storageRuleBody(line, 5, [{ fromDay: 6, toDay: 10, prices: {} }, { fromDay: 12, toDay: null, prices: {} }])],
      ['chồng ngày', storageRuleBody(line, 5, [{ fromDay: 6, toDay: 10, prices: {} }, { fromDay: 9, toDay: null, prices: {} }])],
      ['bậc cuối có hạn', storageRuleBody(line, 5, [{ fromDay: 6, toDay: 10, prices: {} }])],
      ['loại lạ', storageRuleBody(line, 5, [{ fromDay: 6, toDay: null, prices: { '99XX': 1000 } }])],
      ['giá âm', storageRuleBody(line, 5, [{ fromDay: 6, toDay: null, prices: { '40HC': -1 } }])]
    ];
    for (const [label, body] of bad) {
      const r = await call(admin(), 'POST', '/MasterData/storage-tariffs', body);
      expect(r.status, label).toBe(400);
    }
    const first = await call(admin(), 'POST', '/MasterData/storage-tariffs', bad[0][1]);
    expect(first.msg).toMatch(/bắt đầu ngày 6/);
  });

  test('Tạm ngưng vẫn hiện khi includeInactive; xoá = xoá mềm (biến mất)', async () => {
    const line = await createTestShippingLine();
    const rule = await createStorageRule(STD(line));
    const off = await call(admin(), 'PUT', `/MasterData/storage-tariffs/${rule.id}`, { ...rule.body, isActive: false });
    expect(off.status, off.msg).toBe(200);
    const list = async (inactive: boolean) =>
      ((await call(admin(), 'GET', `/MasterData/storage-tariffs${inactive ? '?includeInactive=true' : ''}`)).data as any[]).map((x) => x.code);
    expect(await list(true)).toContain(rule.body.code);
    expect(await list(false)).not.toContain(rule.body.code);
    const del = await call(admin(), 'DELETE', `/MasterData/storage-tariffs/${rule.id}`);
    expect(del.status).toBe(200);
    expect(await list(true)).not.toContain(rule.body.code);
  });
});

test.describe('storage-tariff › Tính phí lưu bãi ở server', () => {
  test('Trong ngày miễn phí → 0; quá hạn → số ngày × giá theo bậc, VAT theo quy tắc', async () => {
    const line = await createTestShippingLine();
    const rule = await createStorageRule(STD(line));
    const job = await gateInTestContainer('40HC', line);

    await setTestJob(job.id, { gateInDaysAgo: 2 });
    const free = await storageFee(job.id);
    expect(free.ok, free.message).toBe(true);
    expect([free.totalDays, free.chargeableDays, Number(free.total)]).toEqual([3, 0, 0]);

    // vào 11 ngày trước → 12 ngày: ngày 6–10 × 60.000 + ngày 11–12 × 100.000 = 500.000, VAT 8% = 40.000
    await setTestJob(job.id, { gateInDaysAgo: 11 });
    const fee = await storageFee(job.id);
    expect(fee.ok, fee.message).toBe(true);
    expect(fee.ruleCode).toBe(rule.body.code);
    expect([fee.totalDays, fee.freeDays, fee.chargeableDays]).toEqual([12, 5, 7]);
    expect(fee.lines.map((l: any) => [l.fromDay, l.toDay, l.days, Number(l.unitPrice)])).toEqual([[6, 10, 5, 60000], [11, 12, 2, 100000]]);
    expect([Number(fee.subtotal), Number(fee.vatAmount), Number(fee.total)]).toEqual([500000, 40000, 540000]);
  });

  test('Ưu tiên quy tắc của hãng; hãng không có quy tắc dùng quy tắc "Mọi hãng"', async () => {
    const line = await createTestShippingLine();
    const rule = await createStorageRule(STD(line));
    const own = await gateInTestContainer('40HC', line);
    expect((await storageFee(own.id)).ruleCode).toBe(rule.body.code);

    const otherLine = await createTestShippingLine();
    const other = await gateInTestContainer('40HC', otherLine);
    const all = ((await call(admin(), 'GET', '/MasterData/storage-tariffs')).data as any[]).find((r) => r.shippingLineCode === 'ALL');
    const fee = await storageFee(other.id);
    if (all) expect(fee.ruleCode).toBe(all.code);
    else expect(fee.ok).toBe(false);
  });

  test('Bậc có ngày tính tiền mà chưa có giá loại container → ok=false, không có tiền', async () => {
    const line = await createTestShippingLine();
    await createStorageRule(STD(line));
    const job = await gateInTestContainer('45HC', line);
    await setTestJob(job.id, { gateInDaysAgo: 7 });
    const fee = await storageFee(job.id);
    expect(fee.ok).toBe(false);
    expect(fee.message).toMatch(/chưa có giá 45HC/);
    expect(Number(fee.total)).toBe(0);
    expect(fee.lines).toHaveLength(0);
  });
});

test.describe('gate-out › Hiện phí lưu bãi khi cấp vỏ', () => {
  test('Gate-Out ghi số ngày + tổng phí lưu bãi vào nhật ký GATE_OUT', async () => {
    const line = await createTestShippingLine();
    await createStorageRule(STD(line));
    const job = await gateInTestContainer('40HC', line);
    await setTestJob(job.id, { gateInDaysAgo: 11, status: 'READY_FOR_OUT' });
    const r = await call(admin(), 'POST', `/DepotJobs/${job.id}/gate-out`, {
      withoutBooking: true, noBookingReason: 'OFF_HIRE', truckPlate: '51C-TS9.99', driverName: 'Tai Xe Test'
    });
    expect(r.status, r.msg).toBe(200);
    const details = await lastAudit(job.id, 'GATE_OUT');
    expect(details).toMatch(/Lưu bãi 12 ngày \(miễn phí 5, tính 7\) — 540[.,]000 đ/);
  });
});

test.describe('service-order › Không lập phí lưu bãi trên phiếu dịch vụ', () => {
  test('Hạng mục nhóm STORAGE / mã bậc lưu bãi cũ → 400', async () => {
    const job = await jobReadyForServiceOrder('40HC');
    for (const item of [
      orderItem('QA_T_ANY', { category: 'STORAGE', serviceName: 'Lưu bãi tay' }),
      orderItem('STOR_DRY_STANDARD_T1', { category: 'OTHER', serviceName: 'Lưu bãi STOR_DRY_STANDARD' })
    ]) {
      const r = await createServiceOrder(job, [item]);
      expect(r.status).toBe(400);
      expect(String(r.msg ?? '') + String(r.data ?? '')).toMatch(/tính khi Gate-Out/);
    }
  });
});
