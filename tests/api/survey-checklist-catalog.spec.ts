import { test, expect } from '@playwright/test';
import { admin, call, getCatalog, login, gateInTestContainer } from '../support/api';
import { loadSurveyCatalogs, checklistFrom, claimSurvey, submitSurvey } from '../support/survey';
import { createTempUser } from '../support/db';
import { TEST_PREFIX, env } from '../support/env';

// Spec: openspec/specs/container-survey/spec.md — Quản lý danh mục khu vực Checklist + Giữ toàn vẹn khi tạm ngưng / xoá.
// Mọi thao tác ghi chỉ dùng khu vực / vị trí test riêng (QA_T_*); khu vực thật chỉ dùng cho thao tác bị từ chối (đổi mã).
const CODE = `${TEST_PREFIX.catalog}ZONE_API`;
const zoneRequest = (over: Record<string, unknown> = {}) => ({
  catalogType: 'SURVEY_CHECKLIST', code: CODE, name: 'QA zone', nameVi: 'Khu vực test', description: '',
  jsonData: '{"defaultStatus":"NA"}', isActive: true, sortOrder: 999, ...over
});
const zoneByCode = async (code: string) => (await getCatalog('SURVEY_CHECKLIST', true)).find((z) => z.code === code);

test.describe('container-survey › Quản lý danh mục khu vực Checklist', () => {
  test('Thêm khu vực mới, tạm ngưng rồi bật lại, xoá khi chưa dùng', async () => {
    const created = await call(admin(), 'POST', '/MasterData/catalog', zoneRequest());
    expect(created.status, created.msg).toBe(200);
    const id = created.data.id;
    const off = await call(admin(), 'PUT', `/MasterData/catalog/${id}`, zoneRequest({ isActive: false }));
    const on = await call(admin(), 'PUT', `/MasterData/catalog/${id}`, zoneRequest({ isActive: true, nameVi: 'Khu vực test đổi tên' }));
    expect([off.status, off.data?.isActive, on.status, on.data?.isActive, on.data?.nameVi])
      .toEqual([200, false, 200, true, 'Khu vực test đổi tên']);
    const del = await call(admin(), 'DELETE', `/MasterData/catalog/${id}`);
    expect(del.status, del.msg).toBe(200);
  });

  test('Mã sai ký tự hoặc mặc định Không Đạt bị từ chối', async () => {
    const badCode = await call(admin(), 'POST', '/MasterData/catalog', zoneRequest({ code: 'qa-t zone' }));
    expect(badCode.status).toBe(400);
    expect(badCode.msg).toMatch(/chữ in hoa, số và dấu gạch dưới/);
    const badDefault = await call(admin(), 'POST', '/MasterData/catalog', zoneRequest({ jsonData: '{"defaultStatus":"FAIL"}' }));
    expect(badDefault.status).toBe(400);
    expect(badDefault.msg).toMatch(/Đạt \(PASS\) hoặc N\/A/);
  });

  test('Đổi mã khu vực đã có bị từ chối', async () => {
    const roof = await zoneByCode('ROOF');
    const r = await call(admin(), 'PUT', `/MasterData/catalog/${roof.id}`, {
      catalogType: 'SURVEY_CHECKLIST', code: 'ROOF2', name: roof.name, nameVi: roof.nameVi, description: roof.description,
      jsonData: roof.jsonData, isActive: roof.isActive, sortOrder: roof.sortOrder
    });
    expect(r.status).toBe(400);
    expect((await zoneByCode('ROOF'))?.id).toBe(roof.id);
  });

  test('Người không có quyền danh mục bị từ chối 403', async () => {
    const gateUser = await createTempUser('gate', 3); // vai trò GATE_OP
    await login(gateUser, env.adminPassword);
    const r = await call(gateUser, 'POST', '/MasterData/catalog', zoneRequest({ code: `${TEST_PREFIX.catalog}ZONE_GATE` }));
    expect(r.status).toBe(403);
  });
});

test.describe('container-survey › Giữ toàn vẹn khi tạm ngưng hoặc xoá khu vực', () => {
  test('Khu vực còn vị trí gắn: không tạm ngưng / xoá được, nêu mã vị trí', async () => {
    const zoneCode = `${TEST_PREFIX.catalog}ZONE_LINKED`;
    const locCode = `${TEST_PREFIX.catalog}LOC`;
    const zone = await call(admin(), 'POST', '/MasterData/catalog', zoneRequest({ code: zoneCode }));
    expect(zone.status, zone.msg).toBe(200);
    try {
      const loc = await call(admin(), 'POST', '/MasterData/catalog', {
        catalogType: 'DAMAGE_LOCATION', code: locCode, name: 'QA location', nameVi: 'Vị trí test', description: '',
        jsonData: JSON.stringify({ checklistZone: zoneCode }), isActive: true, sortOrder: 999
      });
      expect(loc.status, loc.msg).toBe(200);
      const off = await call(admin(), 'PUT', `/MasterData/catalog/${zone.data.id}`, zoneRequest({ code: zoneCode, isActive: false }));
      expect(off.status).toBe(400);
      expect(off.msg).toContain(locCode);
      const del = await call(admin(), 'DELETE', `/MasterData/catalog/${zone.data.id}`);
      expect(del.status).toBe(400);
      expect(del.msg).toContain(locCode);
    } finally {
      // Gỡ vị trí test để khu vực test không còn bị giữ (dọn hẳn ở global teardown).
      const loc = (await getCatalog('DAMAGE_LOCATION', true)).find((l) => l.code === locCode);
      if (loc) await call(admin(), 'DELETE', `/MasterData/catalog/${loc.id}`);
      await call(admin(), 'PUT', `/MasterData/catalog/${zone.data.id}`, zoneRequest({ code: zoneCode, isActive: false }));
    }
  });

  test('Khu vực đã có trong phiếu giám định: không xoá được, gợi ý tạm ngưng', async () => {
    const zoneCode = `${TEST_PREFIX.catalog}ZONE_USED`;
    const zone = await call(admin(), 'POST', '/MasterData/catalog', zoneRequest({ code: zoneCode }));
    expect(zone.status, zone.msg).toBe(200);
    try {
      const job = await gateInTestContainer();
      await claimSurvey(job.id);
      const { zones } = await loadSurveyCatalogs();
      expect(zones.map((z) => z.code)).toContain(zoneCode);
      const saved = await submitSurvey(job.id, { checklist: checklistFrom(zones) });
      expect(saved.status, saved.msg).toBe(200);
      const del = await call(admin(), 'DELETE', `/MasterData/catalog/${zone.data.id}`);
      expect(del.status).toBe(400);
      expect(del.msg).toMatch(/Tạm ngưng/);
    } finally {
      // Tạm ngưng để các test sau không phải gửi khu vực test này (dọn hẳn ở global teardown).
      await call(admin(), 'PUT', `/MasterData/catalog/${zone.data.id}`, zoneRequest({ code: zoneCode, isActive: false }));
    }
  });
});
