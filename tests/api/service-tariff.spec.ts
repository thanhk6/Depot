import { test, expect } from '@playwright/test';
import { admin, call } from '../support/api';
import { createTestTariff } from '../support/serviceOrder';

// Spec: openspec/specs/service-tariff/spec.md — Dữ liệu biểu cước hợp lệ, Đơn giá theo từng loại container (chỉ dùng biểu cước test QA_T_*).
test.describe('service-tariff › Dữ liệu biểu cước hợp lệ', () => {
  test('Giá trị lạ bị từ chối (phân loại, ca, tiền tệ, đơn vị tính)', async () => {
    const t = await createTestTariff();
    for (const [field, value, message] of [
      ['serviceCategory', 'ABC', /Phân loại 'ABC'/],
      ['applicableShift', 'XYZ', /Ca áp dụng 'XYZ'/],
      ['currency', 'EUR', /VND/],
      ['unit', '', /Đơn vị tính/]
    ] as const) {
      const r = await call(admin(), 'PUT', `/MasterData/service-tariffs/${t.id}`, { ...t.body, [field]: value });
      expect(r.status, `${field}=${value}`).toBe(400);
      expect(r.msg).toMatch(message);
    }
    const created = await call(admin(), 'POST', '/MasterData/service-tariffs', { ...t.body, code: `${t.code}_X`, currency: 'USD' });
    expect(created.status).toBe(400);
  });

  test('Đổi mã bị từ chối, mã giữ nguyên', async () => {
    const t = await createTestTariff();
    const r = await call(admin(), 'PUT', `/MasterData/service-tariffs/${t.id}`, { ...t.body, code: `${t.code}2` });
    expect(r.status).toBe(400);
    expect(r.msg).toMatch(/Không đổi mã/);
    const all = (await call(admin(), 'GET', '/MasterData/service-tariffs?includeInactive=true')).data as any[];
    expect(all.find((x) => String(x.id) === t.id)?.code).toBe(t.code);
  });

  test('VAT ngoài khoảng bị từ chối', async () => {
    const t = await createTestTariff();
    expect((await call(admin(), 'PUT', `/MasterData/service-tariffs/${t.id}`, { ...t.body, vatPercent: 150 })).status).toBe(400);
  });
});

test.describe('service-tariff › Đơn giá theo từng loại container', () => {
  test('Giá sai bị từ chối: âm, loại không có trong DM, trùng loại', async () => {
    const t = await createTestTariff();
    const put = (prices: unknown[]) => call(admin(), 'PUT', `/MasterData/service-tariffs/${t.id}`, { ...t.body, prices });
    const negative = await put([{ containerTypeCode: '40HC', price: -1 }]);
    expect(negative.status).toBe(400);
    expect(negative.msg).toMatch(/không được âm/);
    const unknown = await put([{ containerTypeCode: '99ZZ', price: 100000 }]);
    expect(unknown.status).toBe(400);
    expect(unknown.msg).toContain("'99ZZ'");
    const duplicated = await put([{ containerTypeCode: '40HC', price: 1 }, { containerTypeCode: '40hc', price: 2 }]);
    expect(duplicated.status).toBe(400);
    expect(duplicated.msg).toMatch(/Trùng loại container/);
  });

  test('Lưu = thay toàn bộ danh sách giá; giá 0 là chưa có giá', async () => {
    const t = await createTestTariff();
    const r = await call(admin(), 'PUT', `/MasterData/service-tariffs/${t.id}`, { ...t.body, prices: [{ containerTypeCode: '40HC', price: 999000 }, { containerTypeCode: '20HC', price: 0 }] });
    expect(r.status, r.msg).toBe(200);
    expect(r.data.prices.map((p: any) => `${p.containerTypeCode}=${p.price}`)).toEqual(['40HC=999000']);
  });
});
