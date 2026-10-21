import { test, expect } from '@playwright/test';
import { admin, call, gateInTestContainer } from '../support/api';
import { fixtureApprovedRepair } from '../support/db';
import { createTestShippingLine } from '../support/storage';
import { loginUI, main, openSidebarItem } from '../support/ui';

// Spec: shipping-line-ar (Tuổi nợ và nợ quá hạn theo ngày thật; Gắn hoá đơn — màn hình không tự điền số).
// Chỉ dùng hãng tàu test QA_T_SL… và container QATS….
const monthRange = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ym = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  return { from: `${ym}-01`, to: `${ym}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}` };
};

test.describe('shipping-line-ar › Màn Công Nợ Hãng Tàu', () => {
  test('Nợ quá hạn khớp /billing/aging; bộ lọc ngày mặc định tháng hiện tại; ô số hoá đơn trống khi mở', async ({ page }) => {
    const line = await createTestShippingLine();
    const job = await gateInTestContainer('40HC', line);
    const fx = await fixtureApprovedRepair(job.id, { total: 151200, approved: 120000, authCode: 'AUTH-QA-UI', qcStatus: 'PASSED' });
    expect((await call(admin(), 'POST', '/billing/sync', { jobNos: [fx.jobNo] })).status).toBe(200);
    const aging = (await call(admin(), 'GET', '/billing/aging')).data as any[];
    const overdue = aging.reduce((s, b) => s + Number(b.overdueTotal || 0), 0);

    await loginUI(page);
    await openSidebarItem(page, 'Công Nợ Hãng Tàu (AR)');
    await expect(main(page).getByTestId('billing-overdue-kpi')).toContainText(overdue.toLocaleString('vi-VN'));
    const { from, to } = monthRange();
    await expect(main(page).getByTestId('billing-from-date')).toHaveValue(from);
    await expect(main(page).getByTestId('billing-to-date')).toHaveValue(to);

    const row = main(page).locator('tr', { hasText: job.containerNo });
    await expect(row).toContainText('120.000');
    await row.locator('button[title="Gắn hóa đơn tài chính cho container này"]').click();
    await expect(page.getByTestId('invoice-no-input')).toHaveValue('');
  });
});
