import { test, expect, type Page } from '@playwright/test';
import { jobReadyForServiceOrder, createTestTariff } from '../support/serviceOrder';
import { admin, call } from '../support/api';
import { loginUI, main, openSidebarItem } from '../support/ui';

// Spec: openspec/specs/service-order/spec.md — Đơn giá biểu cước nâng hạ do server tra (Form khoá giá, Dòng nâng hạ tự thêm);
//       openspec/specs/service-tariff/spec.md — Đơn giá theo từng loại container, Màn Cước Nâng Hạ theo DM.
// Biểu cước test nhóm Nâng hạ vỏ rỗng có SortOrder -1 để đứng trước biểu cước thật → form tự chọn đúng biểu cước test.

let tariff: Awaited<ReturnType<typeof createTestTariff>>;
// Mỗi test một biểu cước riêng, tạm ngưng khi xong — để không còn biểu cước test nào đứng trước ở lần chạy sau.
test.beforeEach(async () => {
  tariff = await createTestTariff({ sortOrder: -1, prices: { '40HC': 433000, '45HC': 0 } });
});
test.afterEach(async () => {
  await call(admin(), 'PUT', `/MasterData/service-tariffs/${tariff.id}`, { ...tariff.body, isActive: false });
});

/** Dòng hạng mục có ô tên dịch vụ = name (tên nằm trong ô nhập nên không lọc theo text được). */
const rowByService = (modal: ReturnType<Page['locator']>, name: string) =>
  modal.locator('tbody tr').filter({ has: modal.page().locator(`input[value="${name}"]`) });

async function openServiceOrderForm(page: Page, containerNo: string) {
  await loginUI(page);
  await openSidebarItem(page, '4. Khai Thác Gate-In (Tariff)');
  await main(page).locator('button', { hasText: '+ Lập Phiếu Dịch Vụ Mới' }).first().click();
  const modal = page.locator('form').filter({ hasText: '3. Các Khoản Thu Dịch Vụ Theo Biểu Giá Tariff' });
  await modal.locator('select').first().selectOption(containerNo);
  return modal;
}

test.describe('service-order › Đơn giá biểu cước nâng hạ do server tra (form)', () => {
  test('Dòng nâng hạ tự thêm đúng biểu cước vỏ rỗng, giá theo cỡ, ô đơn giá / VAT bị khoá', async ({ page }) => {
    const job = await jobReadyForServiceOrder('40HC');
    const modal = await openServiceOrderForm(page, job.containerNo);
    const row = rowByService(modal, 'Nâng hạ test');
    await expect(row).toHaveCount(1);
    const numbers = row.locator('input[type="number"]');
    await expect(numbers.nth(0)).toBeEnabled();                 // số lượng
    await expect(numbers.nth(1)).toBeDisabled();                // đơn giá
    await expect(numbers.nth(1)).toHaveValue('433000');
    await expect(numbers.nth(2)).toBeDisabled();                // VAT
    await expect(modal.getByTestId('pricing-warning')).toHaveCount(0);
  });

  test('Cỡ chưa có giá: không thêm dòng nâng hạ, báo chưa có giá', async ({ page }) => {
    const job = await jobReadyForServiceOrder('45HC');
    const modal = await openServiceOrderForm(page, job.containerNo);
    await expect(modal.getByTestId('pricing-warning')).toContainText(`Biểu cước ${tariff.code} chưa có giá cho loại 45HC`);
    await expect(rowByService(modal, 'Nâng hạ test')).toHaveCount(0);
  });
});

test.describe('service-tariff › Không còn Máy tính cước', () => {
  test('Sidebar, Tất Cả Danh Mục và tab biểu phí ở Khai thác không còn Máy tính cước', async ({ page }) => {
    await loginUI(page);
    await expect(page.locator('aside:visible').first()).not.toContainText('Máy Tính Cước');
    await openSidebarItem(page, 'Tất Cả Danh Mục');
    await expect(main(page)).toContainText('Cước Nâng Hạ (LoLo)');
    await expect(main(page)).not.toContainText('Máy Tính Cước');
    await openSidebarItem(page, '4. Khai Thác Gate-In (Tariff)');
    await main(page).locator('button', { hasText: 'Biểu Phí Tariff Niêm Yết' }).click();
    await expect(main(page)).toContainText('BIỂU CƯỚC NÂNG HẠ VỎ RỖNG');
    await expect(main(page)).not.toContainText('Máy Tính Cước');
  });
});
