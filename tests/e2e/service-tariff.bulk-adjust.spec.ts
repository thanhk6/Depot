import { test, expect } from '@playwright/test';
import { admin, call } from '../support/api';
import { createTestTariff, priceOfType } from '../support/serviceOrder';
import { loginUI, main, openSidebarItem } from '../support/ui';
import { TEST_PREFIX } from '../support/env';

// Spec: openspec/specs/service-tariff/spec.md — Điều chỉnh giá hàng loạt.
// Lọc bảng theo tiền tố QA_T_ nên chỉ biểu cước test bị đổi giá, biểu cước thật không bị ảnh hưởng.
test.describe('service-tariff › Điều chỉnh giá hàng loạt', () => {
  test('Chỉ đổi giá biểu cước đang dùng trong bộ lọc, bỏ qua biểu cước tạm ngưng', async ({ page }) => {
    // Tiền tố riêng của lần chạy: các test khác cũng tạo biểu cước QA_T_* đang dùng (chỉ dọn ở cuối).
    const group = `${TEST_PREFIX.catalog}BULK${Date.now() % 100000}`;
    const activeA = await createTestTariff({ code: `${group}_A`, prices: { '40HC': 400000, '20HC': 200000 } });
    const activeB = await createTestTariff({ code: `${group}_B`, prices: { '40HC': 200000 } });
    const inactive = await createTestTariff({ code: `${group}_C`, prices: { '40HC': 100000 }, isActive: false });

    const dialogs: string[] = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); void d.accept(); });
    await loginUI(page);
    await openSidebarItem(page, 'Cước Nâng Hạ (LoLo)');
    await main(page).locator('input[placeholder="Tìm theo mã, tên biểu cước..."]').fill(group);
    await main(page).locator('button', { hasText: 'Điều Chỉnh % Biểu Giá' }).click();
    await expect(page.getByTestId('bulk-target-count')).toContainText('Áp dụng cho 2 biểu cước');
    await page.locator('input[type="number"]').last().fill('10');
    await page.locator('button', { hasText: 'Áp Dụng Cập Nhật' }).click();

    await expect.poll(async () => {
      const all = ((await call(admin(), 'GET', '/MasterData/service-tariffs?includeInactive=true')).data || []) as any[];
      const tariff = (id: string) => all.find((t) => String(t.id) === id);
      return [priceOfType(tariff(activeA.id), '40HC'), priceOfType(tariff(activeA.id), '20HC'), priceOfType(tariff(activeB.id), '40HC'), priceOfType(tariff(inactive.id), '40HC')];
    }).toEqual([440000, 220000, 220000, 100000]);
    expect(dialogs[0]).toMatch(/2 biểu cước đang dùng/);
  });
});
