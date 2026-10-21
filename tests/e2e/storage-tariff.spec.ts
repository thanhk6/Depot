import { test, expect, type Page } from '@playwright/test';
import { admin, call, gateInTestContainer, getCatalog } from '../support/api';
import { setTestJob } from '../support/db';
import { createTestShippingLine, storageRuleBody, createStorageRule } from '../support/storage';
import { loginUI, main, openSidebarItem } from '../support/ui';

// Spec: storage-tariff (Màn Cước Lưu Bãi theo DM) + gate-out (Hiện phí lưu bãi khi cấp vỏ).
// Chỉ dùng hãng tàu test QA_T_SL…, quy tắc QA_T_STO… và container QATS….
const openStorageMaster = async (page: Page) => {
  await loginUI(page);
  await openSidebarItem(page, 'Cước Lưu Bãi (Storage)');
};
const ruleCard = (page: Page, code: string) => main(page).getByTestId('storage-rule-card').filter({ hasText: code });

test.describe('storage-tariff › Màn Cước Lưu Bãi theo DM', () => {
  test('Cột giá = loại đang dùng của DM; ô giá mỗi bậc theo DM; không đổi mã khi sửa', async ({ page }) => {
    const activeTypes = (await getCatalog('CONTAINER_TYPE')).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((t) => t.name as string);
    const line = await createTestShippingLine();
    const rule = await createStorageRule(storageRuleBody(line, 5, [
      { fromDay: 6, toDay: 10, prices: { '40HC': 60000 } }, { fromDay: 11, toDay: null, prices: { '40HC': 100000 } }
    ]));
    await openStorageMaster(page);
    const card = ruleCard(page, rule.body.code);
    await expect(card.getByTestId('storage-price-col')).toHaveCount(activeTypes.length);
    expect((await card.getByTestId('storage-price-col').allInnerTexts()).map((h) => h.trim())).toEqual(activeTypes);
    await expect(card).toContainText('60.000');
    await expect(card).toContainText('Miễn phí 5 ngày');

    await card.locator('button[title="Sửa quy tắc lưu bãi"]').click();
    await expect(page.getByTestId('storage-code')).toBeDisabled();
    await expect(page.getByTestId('storage-tier')).toHaveCount(2);
    for (const code of activeTypes) await expect(page.getByTestId(`storage-price-0-${code.toUpperCase()}`)).toHaveCount(1);
    await expect(page.getByTestId('storage-price-1-40HC')).toHaveValue('100000');
    await expect(page.getByTestId('storage-price-1-20HC')).toHaveValue('');
  });

  test('Tạm ngưng qua form → vẫn hiện "Tạm Ngưng" sau khi tải lại', async ({ page }) => {
    const line = await createTestShippingLine();
    const rule = await createStorageRule(storageRuleBody(line, 3, [{ fromDay: 4, toDay: null, prices: { '40HC': 50000 } }]));
    await openStorageMaster(page);
    await ruleCard(page, rule.body.code).locator('button[title="Sửa quy tắc lưu bãi"]').click();
    await page.getByTestId('storage-status').selectOption('INACTIVE');
    await page.locator('button', { hasText: 'Lưu Quy Tắc Lưu Bãi' }).click();
    await expect(ruleCard(page, rule.body.code)).toContainText('Tạm Ngưng');
    await page.reload({ waitUntil: 'networkidle' });
    await openSidebarItem(page, 'Cước Lưu Bãi (Storage)');
    await expect(ruleCard(page, rule.body.code)).toContainText('Tạm Ngưng');
    const saved = ((await call(admin(), 'GET', '/MasterData/storage-tariffs?includeInactive=true')).data as any[]).find((r) => r.code === rule.body.code);
    expect(saved.isActive).toBe(false);
  });
});

test.describe('gate-out › Hiện phí lưu bãi khi cấp vỏ', () => {
  test('Hộp cấp vỏ hiện từng bậc và tổng phí lưu bãi do server tính', async ({ page }) => {
    const line = await createTestShippingLine();
    await createStorageRule(storageRuleBody(line, 5, [
      { fromDay: 6, toDay: 10, prices: { '40HC': 60000 } }, { fromDay: 11, toDay: null, prices: { '40HC': 100000 } }
    ]));
    const job = await gateInTestContainer('40HC', line);
    await setTestJob(job.id, { gateInDaysAgo: 11, status: 'READY_FOR_OUT' });

    await loginUI(page);
    await openSidebarItem(page, '1. Vỏ Chờ Cấp (Ready In Yard)');
    await main(page).locator('tr', { hasText: job.containerNo }).locator('button', { hasText: 'Cho Cấp Vỏ' }).click();
    const panel = page.getByTestId('gateout-storage-fee');
    await expect(panel).toContainText('12 ngày');
    await expect(panel.locator('tbody tr')).toHaveCount(2);
    await expect(page.getByTestId('gateout-storage-fee-total')).toContainText('540.000');
  });
});
