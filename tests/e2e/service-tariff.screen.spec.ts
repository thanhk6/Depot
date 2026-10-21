import { test, expect } from '@playwright/test';
import { getCatalog } from '../support/api';
import { createTestTariff } from '../support/serviceOrder';
import { loginUI, main, openSidebarItem } from '../support/ui';

// Spec: openspec/specs/service-tariff/spec.md — Màn Cước Nâng Hạ theo DM Loại Container.
test.describe('service-tariff › Màn Cước Nâng Hạ theo DM Loại Container', () => {
  test('Bảng và form có đúng 1 cột / ô giá cho mỗi loại đang dùng của DM, theo thứ tự DM; giá thiếu hiện "Chưa có giá"', async ({ page }) => {
    const activeTypes = (await getCatalog('CONTAINER_TYPE')).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((t) => t.name as string);
    const tariff = await createTestTariff({ prices: { '40HC': 425000, '20HC': 0 } });
    const others = await createTestTariff();
    expect(others.id).not.toBe(tariff.id);

    await loginUI(page);
    await openSidebarItem(page, 'Cước Nâng Hạ (LoLo)');
    // Chờ DM Loại Container tải xong (cột dựng theo danh mục) rồi mới đọc tiêu đề.
    await expect(main(page).getByTestId('lolo-price-col')).toHaveCount(activeTypes.length);
    const headers = await main(page).getByTestId('lolo-price-col').allInnerTexts();
    expect(headers.map((h) => h.trim())).toEqual(activeTypes);

    await main(page).locator('input[placeholder="Tìm theo mã, tên biểu cước..."]').fill(tariff.code);
    const row = main(page).locator('tbody tr', { hasText: tariff.code });
    await expect(row).toContainText('425.000');
    await expect(row).toContainText('Chưa có giá');

    await row.locator('button[title="Chỉnh sửa đơn giá"]').click();
    for (const code of activeTypes) await expect(page.getByTestId(`lolo-price-${code.toUpperCase()}`)).toHaveCount(1);
    await expect(page.getByTestId('lolo-price-40HC')).toHaveValue('425000');
    await expect(page.getByTestId('lolo-price-20HC')).toHaveValue('');
  });
});
