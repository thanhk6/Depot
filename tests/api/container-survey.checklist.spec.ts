import { test, expect } from '@playwright/test';
import { gateInTestContainer, getJob } from '../support/api';
import { loadSurveyCatalogs, checklistFrom, damageAt, claimSurvey, submitSurvey } from '../support/survey';

// Spec: openspec/specs/container-survey/spec.md — các requirement về Checklist khu vực (server kiểm tra).
let cat: Awaited<ReturnType<typeof loadSurveyCatalogs>>;
test.beforeAll(async () => { cat = await loadSurveyCatalogs(); });

/** Gate-In + nhận phiếu một container test mới. */
async function newSurveyingJob() {
  const job = await gateInTestContainer();
  await claimSurvey(job.id);
  return job;
}

/** Bị từ chối 400 và không lưu phiếu nào, hồ sơ vẫn SURVEYING. */
async function expectRejected(jobId: string, body: Record<string, unknown>, message?: RegExp) {
  const r = await submitSurvey(jobId, body);
  expect(r.status, `${r.msg} ${JSON.stringify(r.data)}`).toBe(400);
  if (message) expect(String(r.data ?? r.msg)).toMatch(message);
  const job = await getJob(jobId);
  expect(job.survey).toBeFalsy();
  expect(job.status).toBe('SURVEYING');
}

const savedChecklist = async (jobId: string) =>
  Object.fromEntries(((await getJob(jobId)).survey?.checklistItems || []).map((c: any) => [c.zoneKey, c]));

test.describe('container-survey › Checklist khu vực đúng theo danh mục', () => {
  test('Thiếu, thừa hoặc trùng khu vực bị từ chối', async () => {
    const all = checklistFrom(cat.zones);
    const job = await newSurveyingJob();
    await expectRejected(job.id, { checklist: [] }, /thiếu khu vực/);
    await expectRejected(job.id, { checklist: all.slice(0, 3) }, /thiếu khu vực/);
    await expectRejected(job.id, { checklist: [...all, { ...all[0], zoneKey: 'XYZ' }] }, /'XYZ'/);
    await expectRejected(job.id, { checklist: [...all, { ...all[0], status: 'FAIL' }] }, /trùng khu vực/);
  });

  test('Trạng thái lạ bị từ chối', async () => {
    const job = await newSurveyingJob();
    await expectRejected(job.id, { checklist: checklistFrom(cat.zones, { [cat.zones[0].code]: { status: 'BAD' } }) }, /PASS, FAIL hoặc NA/);
  });

  test('Checklist đủ và hợp lệ: lưu với tên khu vực theo danh mục', async () => {
    const job = await newSurveyingJob();
    const r = await submitSurvey(job.id, { checklist: checklistFrom(cat.zones) });
    expect(r.status, r.msg).toBe(200);
    const saved = await savedChecklist(job.id);
    expect(Object.keys(saved)).toHaveLength(cat.zones.length);
    for (const z of cat.zones) expect(saved[z.code].zoneName).toBe(z.nameVi);
  });
});

test.describe('container-survey › Khu vực checklist khớp hư hỏng', () => {
  test('Hư hỏng ở Nóc nhưng khu vực Nóc Đạt / N/A bị từ chối', async () => {
    const job = await newSurveyingJob();
    const damages = [damageAt(cat.locationOf('ROOF'))];
    await expectRejected(job.id, { damages, checklist: checklistFrom(cat.zones) }, /phải là Không Đạt/);
    await expectRejected(job.id, { damages, checklist: checklistFrom(cat.zones, { ROOF: { status: 'NA' } }) }, /phải là Không Đạt/);
  });

  test('Số lỗi do server tính, không lấy số trình duyệt gửi', async () => {
    const job = await newSurveyingJob();
    const r = await submitSurvey(job.id, {
      damages: [damageAt(cat.locationOf('ROOF'))],
      checklist: checklistFrom(cat.zones, { ROOF: { status: 'FAIL', damageCount: 9 }, FRONT_WALL: { damageCount: -5 } })
    });
    expect(r.status, r.msg).toBe(200);
    const saved = await savedChecklist(job.id);
    expect([saved.ROOF.status, saved.ROOF.damageCount]).toEqual(['FAIL', 1]);
    expect(saved.FRONT_WALL.damageCount).toBe(0);
  });

  test('Đánh dấu tay Không Đạt khi không có hư hỏng vẫn hợp lệ', async () => {
    const job = await newSurveyingJob();
    const r = await submitSurvey(job.id, { checklist: checklistFrom(cat.zones, { UNDERSTRUCTURE: { status: 'FAIL' } }) });
    expect(r.status, r.msg).toBe(200);
    const saved = await savedChecklist(job.id);
    expect([saved.UNDERSTRUCTURE.status, saved.UNDERSTRUCTURE.damageCount]).toEqual(['FAIL', 0]);
  });

  test('Nộp chính thức nhiều hư hỏng cùng khu vực: đếm đúng, chuyển CLEANING', async () => {
    const job = await newSurveyingJob();
    const doors = cat.locations.filter((l) => l.zone === 'DOOR').slice(0, 2).map((l) => damageAt(l.code));
    test.skip(doors.length < 2, 'Danh mục cần ít nhất 2 vị trí gắn khu vực Cửa');
    const r = await submitSurvey(job.id, { isDraft: false, damages: doors, checklist: checklistFrom(cat.zones, { DOOR: { status: 'FAIL' } }) });
    expect(r.status, r.msg).toBe(200);
    expect((await savedChecklist(job.id)).DOOR.damageCount).toBe(2);
    expect((await getJob(job.id)).status).toBe('CLEANING');
  });
});

test.describe('container-survey › Mã vị trí hư hỏng thuộc danh mục', () => {
  test('Mã vị trí không có trong danh mục bị từ chối (cả nháp lẫn nộp)', async () => {
    const job = await newSurveyingJob();
    const body = { damages: [damageAt('RIGHT_W')], checklist: checklistFrom(cat.zones, { RIGHT_WALL: { status: 'FAIL' } }) };
    await expectRejected(job.id, body, /'RIGHT_W'/);
    await expectRejected(job.id, { ...body, isDraft: false }, /'RIGHT_W'/);
  });
});
