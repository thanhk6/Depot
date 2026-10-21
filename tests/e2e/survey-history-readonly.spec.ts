import { test, expect } from '@playwright/test';
import { gateInTestContainer } from '../support/api';
import { loadSurveyCatalogs, checklistFrom, damageAt, claimSurvey, submitSurvey } from '../support/survey';
import { loginUI, main, openSurveyTab, rowButton } from '../support/ui';

// Spec: openspec/specs/container-survey/spec.md — Xem phiếu từ lịch sử ở chế độ chỉ xem.
const WRITE_LABEL = /Lưu|Hoàn Tất|Thêm|Xoá|Xóa|Tải ảnh|Tải lên|Chụp|Phát Hành|Chuyển/i;
const PAGE_NAV = /^(Chờ Giám định|Đang Giám định|Hoàn tất Giám định|Lịch sử Giám định)\s*\d*$/;
const FORM_TABS = ['Nhập & Quản Lý Mã Lỗi Tổn Thất', 'Hạng Mục Vệ Sinh & Bảng Giá', /Checklist \d+ Khu Vực Khảo Sát/, 'Hình Ảnh Hiện Trường'];

let submitted: { id: string; containerNo: string };
let queued: { id: string; containerNo: string };

test.beforeAll(async () => {
  // Một phiếu đã nộp chính thức (có hư hỏng) để xem từ Lịch sử, và một container còn ở hàng chờ.
  const cat = await loadSurveyCatalogs();
  submitted = await gateInTestContainer();
  await claimSurvey(submitted.id);
  const r = await submitSurvey(submitted.id, {
    isDraft: false, damages: [damageAt(cat.locationOf('ROOF'))], checklist: checklistFrom(cat.zones, { ROOF: { status: 'FAIL' } })
  });
  expect(r.status, r.msg).toBe(200);
  queued = await gateInTestContainer();
});

test.describe('container-survey › Xem phiếu từ lịch sử ở chế độ chỉ xem', () => {
  test('Mở phiếu từ lịch sử: chỉ xem, không sửa được, quay lại về Lịch sử, không gửi request ghi', async ({ page }) => {
    await loginUI(page);
    await openSurveyTab(page, 'Lịch sử Giám định');
    const writes: string[] = [];
    page.on('request', (r) => { if (r.method() !== 'GET' && r.url().includes('/api/')) writes.push(`${r.method()} ${r.url()}`); });

    await rowButton(page, submitted.containerNo, 'Xem lại chi tiết giám định').click();
    await expect(main(page)).toContainText('Phiếu đã nộp — chế độ chỉ xem');
    await expect(main(page)).not.toContainText('Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh');

    for (const tab of FORM_TABS) {
      await main(page).locator('button', { hasText: tab }).first().click();
      const problems = await main(page).evaluate((root, [writeSrc, navSrc]) => {
        const write = new RegExp(writeSrc, 'i'), nav = new RegExp(navSrc);
        const visible = (el: Element) => !!((el as HTMLElement).offsetWidth || (el as HTMLElement).offsetHeight);
        const buttons = [...root.querySelectorAll('button')].filter(visible)
          .filter((b) => !b.matches(':disabled') && !nav.test((b as HTMLElement).innerText.trim()))
          .map((b) => (b as HTMLElement).innerText.trim() + ((b as HTMLElement).title ? ` [${(b as HTMLElement).title}]` : ''))
          .filter((t) => write.test(t));
        const inputs = [...root.querySelectorAll('input, select, textarea')].filter(visible)
          .filter((i) => !i.matches(':disabled')).map((i) => `${i.tagName}:${(i as HTMLInputElement).placeholder || ''}`);
        return { buttons, inputs };
      }, [WRITE_LABEL.source, PAGE_NAV.source]);
      expect(problems, `tab ${tab}`).toEqual({ buttons: [], inputs: [] });
    }

    await main(page).locator('button', { hasText: 'Đóng Lại' }).first().click();
    await expect(main(page)).toContainText('kết quả lịch sử');
    await expect(main(page)).not.toContainText('chế độ chỉ xem');
    expect(writes).toEqual([]);
  });

  test('Hàng chờ vẫn sửa được (kể cả sau khi vừa xem lịch sử rồi bấm sang tab khác)', async ({ page }) => {
    await loginUI(page);
    await openSurveyTab(page, 'Lịch sử Giám định');
    await rowButton(page, submitted.containerNo, 'Xem lại chi tiết giám định').click();
    await expect(main(page)).toContainText('chế độ chỉ xem');
    await page.locator('button', { hasText: 'Chờ Giám định' }).first().click();
    await rowButton(page, queued.containerNo, 'Mở màn hình giám định chi tiết').click();
    await expect(main(page)).toContainText('Hoàn Tất Giám Định - Chuyển Qua Vệ Sinh');
    await expect(main(page)).not.toContainText('chế độ chỉ xem');
    await main(page).locator('button', { hasText: 'Đóng Lại' }).first().click();
  });
});
