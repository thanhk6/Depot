import { test, expect, type Page } from '@playwright/test';
import { gateInTestContainer } from '../support/api';
import { loadSurveyCatalogs } from '../support/survey';
import { loginUI, main, openSurveyTab, rowButton, checklistTab } from '../support/ui';

// Spec: openspec/specs/container-survey/spec.md — Khu vực checklist khớp hư hỏng, Mã vị trí hư hỏng thuộc danh mục,
// Khu vực Vệ sinh không hạ phân loại DM. Không nộp phiếu (chỉ thao tác trên form).
const TAB_DAMAGES = 'Nhập & Quản Lý Mã Lỗi Tổn Thất';

const condition = async (page: Page) =>
  ((await main(page).innerText()).replace(/\s+/g, ' ').match(/\b(AV|CL|DM) • (ĐẠT CHUẨN|CẦN VỆ SINH|HƯ HỎNG)/) || [])[1];
const zoneCard = (page: Page, zoneName: string) => main(page).locator('div.grid > div.rounded-2xl', { hasText: zoneName }).first();
const setZone = (page: Page, zoneName: string, label: 'Đạt' | 'Không Đạt' | 'N/A') =>
  zoneCard(page, zoneName).locator('button', { hasText: new RegExp(`^${label}$`) }).click();
const expectZone = async (page: Page, zoneName: string, fail: boolean, errors: number) => {
  await expect(zoneCard(page, zoneName)).toHaveClass(fail ? /rose/ : /emerald/);
  if (errors > 0) await expect(zoneCard(page, zoneName)).toContainText(`${errors} lỗi`);
  else await expect(zoneCard(page, zoneName)).not.toContainText('lỗi');
};

test.describe('container-survey › Khu vực checklist khớp hư hỏng (form)', () => {
  test('Thêm / xoá hư hỏng tự đổi khu vực; ô Vị trí lưu đúng mã đang hiện; Vệ sinh không hạ DM', async ({ page }) => {
    const cat = await loadSurveyCatalogs();
    const roofLoc = cat.locationOf('ROOF');
    const roofName = cat.zones.find((z) => z.code === 'ROOF')!.nameVi;
    const cleaningName = cat.zones.find((z) => z.code === 'CLEANING')!.nameVi;
    const job = await gateInTestContainer();

    await loginUI(page);
    await openSurveyTab(page, 'Chờ Giám định');
    await rowButton(page, job.containerNo, 'Mở màn hình giám định chi tiết').click();
    await expect(main(page)).toContainText('Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh');

    // AV + Vệ sinh Không Đạt → CL; đổi lại Đạt không tự đổi phân loại
    expect(await condition(page)).toBe('AV');
    await checklistTab(page).click();
    await setZone(page, cleaningName, 'Không Đạt');
    expect(await condition(page)).toBe('CL');
    await setZone(page, cleaningName, 'Đạt');
    expect(await condition(page)).toBe('CL');

    // Thêm nhanh không đổi ô Vị trí → hư hỏng mang đúng mã đang hiện; không còn nút mẫu gõ cứng
    await main(page).locator('button', { hasText: TAB_DAMAGES }).first().click();
    const form = main(page).locator('form').filter({ has: page.locator('button', { hasText: '+ Thêm Mã Lỗi' }) });
    const location = form.locator('select').first();
    const shown = await location.inputValue();
    expect(shown).not.toBe('');
    await expect(main(page)).not.toContainText('1-Click Presets');
    await form.locator('button[type="submit"]').click();
    await expect(main(page).locator('tbody tr')).toHaveCount(1);
    await expect(main(page).locator('tbody tr').first()).toContainText(`[${shown}]`);

    // Thêm hư hỏng ở vị trí Nóc → khu vực Nóc Không Đạt 1 lỗi (nếu mã đầu không phải chính vị trí Nóc)
    await location.selectOption(roofLoc);
    await form.locator('button[type="submit"]').click();
    await checklistTab(page).click();
    await expectZone(page, roofName, true, shown === roofLoc ? 2 : 1);
    expect(await condition(page)).toBe('DM');

    // DM + Vệ sinh Không Đạt → vẫn DM
    await setZone(page, cleaningName, 'Không Đạt');
    expect(await condition(page)).toBe('DM');

    // Xoá hết hư hỏng ở Nóc → khu vực Nóc về Đạt
    await main(page).locator('button', { hasText: TAB_DAMAGES }).first().click();
    page.on('dialog', (d) => d.accept());
    const roofRows = main(page).locator('tbody tr', { hasText: `[${roofLoc}]` });
    while (await roofRows.count()) await roofRows.first().locator('button[title="Xóa tổn thất"]').click();
    await checklistTab(page).click();
    await expectZone(page, roofName, false, 0);

    await main(page).locator('button', { hasText: 'Đóng Lại' }).first().click();
  });
});
