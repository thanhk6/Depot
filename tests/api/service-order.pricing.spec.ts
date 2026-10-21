import { test, expect } from '@playwright/test';
import { admin, call } from '../support/api';
import { jobReadyForServiceOrder, createTestTariff, orderItem, createServiceOrder } from '../support/serviceOrder';

// Spec: openspec/specs/service-order/spec.md — Đơn giá biểu cước nâng hạ do server tra;
//       openspec/specs/service-tariff/spec.md — Tra đơn giá theo cỡ container.
// Mỗi test dùng hồ sơ QATS* riêng (mỗi hồ sơ chỉ lập được 1 phiếu) và biểu cước test QA_T_*.

const lineOf = (order: any, code: string) => (order.items || []).find((i: any) => i.serviceCode === code);

test.describe('service-order › Đơn giá biểu cước nâng hạ do server tra', () => {
  test('Trình duyệt gửi giá khác biểu cước: lưu theo giá + VAT biểu cước, tiền tính theo đó', async () => {
    const tariff = await createTestTariff();
    const job = await jobReadyForServiceOrder('40GP');
    const r = await createServiceOrder(job, [orderItem(tariff.code, { quantity: 2 })]);
    expect(r.status, r.msg).toBe(200);
    const line = lineOf(r.data, tariff.code);
    expect([Number(line.unitPrice), Number(line.vatPercent), Number(line.amount), Number(line.total)]).toEqual([400000, 8, 800000, 864000]);
    expect(line.serviceName).toBe('Nâng hạ test');
  });

  test('Cỡ chưa có giá: từ chối, không tạo phiếu', async () => {
    const tariff = await createTestTariff({ prices: { '45HC': 0 } });
    const job = await jobReadyForServiceOrder('45HC');
    const r = await createServiceOrder(job, [orderItem(tariff.code)]);
    expect(r.status).toBe(400);
    expect(r.msg).toContain(`Biểu cước ${tariff.code} chưa có giá cho loại 45HC`);
    const orders = ((await call(admin(), 'GET', '/service-orders')).data || []) as any[];
    expect(orders.some((o) => o.containerNo === job.containerNo)).toBe(false);
  });

  test('Biểu cước tạm ngưng: từ chối', async () => {
    const tariff = await createTestTariff({ isActive: false });
    const job = await jobReadyForServiceOrder('40HC');
    const r = await createServiceOrder(job, [orderItem(tariff.code)]);
    expect(r.status).toBe(400);
    expect(r.msg).toMatch(/tạm ngưng/);
  });

  test('Cỡ container theo hồ sơ, không theo cỡ trình duyệt gửi', async () => {
    const tariff = await createTestTariff();
    const job = await jobReadyForServiceOrder('40GP');
    const r = await createServiceOrder(job, [orderItem(tariff.code)], '20HC');
    expect(r.status, r.msg).toBe(200);
    expect(Number(lineOf(r.data, tariff.code).unitPrice)).toBe(400000);
    expect(r.data.size).toBe('40GP');
  });

  test('Sửa phiếu cũng tra lại giá biểu cước', async () => {
    const tariff = await createTestTariff();
    const job = await jobReadyForServiceOrder('40RH');
    const created = await createServiceOrder(job, [orderItem(tariff.code)]);
    expect(created.status, created.msg).toBe(200);
    const updated = await call(admin(), 'PUT', `/service-orders/${created.data.id}`, { items: [orderItem(tariff.code, { unitPrice: 5, vatPercent: 50 })] });
    expect(updated.status, updated.msg).toBe(200);
    const line = lineOf(updated.data, tariff.code);
    expect([Number(line.unitPrice), Number(line.vatPercent)]).toEqual([510000, 8]);
  });
});

test.describe('service-tariff › Đơn giá theo từng loại container (phiếu dịch vụ)', () => {
  // 40HC và 40GP cùng cỡ 40' khô nhưng giá khác nhau → mỗi loại một giá riêng.
  for (const [isoSize, expected] of [['20HC', 210000], ['40HC', 410000], ['40GP', 400000], ['45HC', 450000], ['20RF', 310000], ['40OT', 610000]] as const) {
    test(`Loại ${isoSize} → ${expected.toLocaleString('vi-VN')} đ`, async () => {
      const tariff = await createTestTariff();
      const job = await jobReadyForServiceOrder(isoSize);
      const r = await createServiceOrder(job, [orderItem(tariff.code)]);
      expect(r.status, r.msg).toBe(200);
      expect(Number(lineOf(r.data, tariff.code).unitPrice)).toBe(expected);
    });
  }

  test('Loại chưa nhập giá (20HR) bị chặn, không lấy giá 20RF cùng nhóm lạnh', async () => {
    const tariff = await createTestTariff();
    const job = await jobReadyForServiceOrder('20HR');
    const r = await createServiceOrder(job, [orderItem(tariff.code)]);
    expect(r.status).toBe(400);
    expect(r.msg).toContain(`chưa có giá cho loại 20HR`);
  });
});
