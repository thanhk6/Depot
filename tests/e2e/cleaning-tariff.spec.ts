import { test, expect, type Page } from '@playwright/test';
import { admin, call, getCatalog } from '../support/api';
import { jobReadyForServiceOrder } from '../support/serviceOrder';
import { loginUI, main, openSidebarItem } from '../support/ui';
import { TEST_PREFIX } from '../support/env';

// Spec: openspec/specs/cleaning-tariff/spec.md (Màn Biểu Phí Vệ Sinh theo DM Loại Container) +
//       service-order (Dòng vệ sinh trên phiếu dịch vụ theo từng dịch vụ). Chỉ dùng biểu phí test QA_T_*.
let seq = 0;
async function createCleaningTariff(code: string, prices: Record<string, number>, over: Record<string, unknown> = {}) {
  const r = await call(admin(), 'POST', '/MasterData/cleaning-tariffs', {
    code, nameVi: `Vệ sinh test ${code.slice(-1)}`, nameEn: 'QA', category: 'GENERAL_SWEEP', vatPercent: 8, currency: 'VND',
    responsiblePartyDefault: 'U', isActive: true, sortOrder: 990 + seq++, ...over,
    prices: Object.entries(prices).map(([containerTypeCode, price]) => ({ containerTypeCode, price }))
  });
  expect(r.status, r.msg).toBe(200);
  return { id: String(r.data.id), code };
}
const openCleaningMaster = async (page: Page) => {
  await loginUI(page);
  await openSidebarItem(page, 'Biểu Phí Vệ Sinh Container');
};

test.describe('cleaning-tariff › Màn Biểu Phí Vệ Sinh theo DM Loại Container', () => {
  test('Đúng 1 cột / ô giá cho mỗi loại đang dùng của DM; không còn mục giá theo hãng tàu', async ({ page }) => {
    const activeTypes = (await getCatalog('CONTAINER_TYPE')).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((t) => t.name as string);
    const t = await createCleaningTariff(`${TEST_PREFIX.catalog}CLNUI_${Date.now() % 100000}`, { '40HC': 333000 });
    await openCleaningMaster(page);
    await expect(main(page).getByTestId('cleaning-price-col')).toHaveCount(activeTypes.length);
    expect((await main(page).getByTestId('cleaning-price-col').allInnerTexts()).map((h) => h.trim())).toEqual(activeTypes);
    await expect(main(page)).not.toContainText('Đơn giá thỏa thuận riêng cho Hãng Tàu');
    await main(page).locator('input[placeholder="Tìm theo mã, tên dịch vụ vệ sinh..."]').fill(t.code);
    const row = main(page).locator('tbody tr', { hasText: t.code });
    await expect(row).toContainText('333.000');
    await row.locator('button[title="Chỉnh sửa biểu phí"]').click();
    await expect(page.getByTestId('cleaning-code')).toBeDisabled();
    await expect(page.getByTestId('cleaning-price-40HC')).toHaveValue('333000');
    await expect(page.getByTestId('cleaning-price-20HC')).toHaveValue('');
  });

  test('Điều chỉnh % chỉ áp biểu phí đang dùng trong bộ lọc', async ({ page }) => {
    const group = `${TEST_PREFIX.catalog}CLNB${Date.now() % 100000}`;
    const a = await createCleaningTariff(`${group}_A`, { '40HC': 400000 });
    const b = await createCleaningTariff(`${group}_B`, { '40HC': 200000 });
    const c = await createCleaningTariff(`${group}_C`, { '40HC': 100000 }, { isActive: false });
    const dialogs: string[] = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); void d.accept(); });
    await openCleaningMaster(page);
    await main(page).locator('input[placeholder="Tìm theo mã, tên dịch vụ vệ sinh..."]').fill(group);
    await main(page).locator('button', { hasText: 'Điều Chỉnh % Đơn Giá' }).click();
    await expect(page.getByTestId('cleaning-bulk-target-count')).toContainText('Áp dụng cho 2 biểu phí');
    await page.locator('input[type="number"]').last().fill('10');
    await page.locator('button', { hasText: 'Áp Dụng Cập Nhật' }).click();
    await expect.poll(async () => {
      const all = ((await call(admin(), 'GET', '/MasterData/cleaning-tariffs?includeInactive=true')).data || []) as any[];
      const price = (id: string) => Number(all.find((x) => String(x.id) === id)?.prices?.find((p: any) => p.containerTypeCode === '40HC')?.price);
      return [price(a.id), price(b.id), price(c.id)];
    }).toEqual([440000, 220000, 100000]);
    expect(dialogs[0]).toMatch(/2 biểu phí đang dùng/);
  });
});

test.describe('service-order › Dòng vệ sinh trên phiếu dịch vụ theo từng dịch vụ (form)', () => {
  test('Lệnh vệ sinh 3 dịch vụ → 3 dòng vệ sinh riêng, khoá đơn giá / VAT, không có dòng gộp', async ({ page }) => {
    const group = `${TEST_PREFIX.catalog}CLNS${Date.now() % 100000}`;
    const codes = [];
    for (const [suffix, price] of [['A', 111000], ['B', 222000], ['C', 333000]] as const)
      codes.push((await createCleaningTariff(`${group}_${suffix}`, { '40HC': price })).code);
    const job = await jobReadyForServiceOrder('40HC', codes);

    await loginUI(page);
    await openSidebarItem(page, '4. Khai Thác Gate-In (Tariff)');
    await main(page).locator('button', { hasText: '+ Lập Phiếu Dịch Vụ Mới' }).first().click();
    const modal = page.locator('form').filter({ hasText: '3. Các Khoản Thu Dịch Vụ Theo Biểu Giá Tariff' });
    await modal.locator('select').first().selectOption(job.containerNo);
    for (const [i, code] of codes.entries()) {
      const name = `Vệ sinh test ${code.slice(-1)}`;
      const row = modal.locator('tbody tr').filter({ has: page.locator(`input[value="${name}"]`) });
      await expect(row, code).toHaveCount(1);
      const numbers = row.locator('input[type="number"]');
      await expect(numbers.nth(1)).toBeDisabled();
      await expect(numbers.nth(1)).toHaveValue(String([111000, 222000, 333000][i]));
      await expect(numbers.nth(2)).toBeDisabled();
    }
    await expect(modal.locator('tbody tr').filter({ has: page.locator('input[value="Vệ sinh tổng quát"]') })).toHaveCount(0);
  });
});
