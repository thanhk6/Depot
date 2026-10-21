import { test, expect } from '@playwright/test';
import { admin, call, gateInTestContainer } from '../support/api';
import { fixtureApprovedRepair, withDb } from '../support/db';
import { createTestShippingLine } from '../support/storage';

// Spec: openspec/changes/depot-fullstack-shipping-line-ar-fix/specs/shipping-line-ar/spec.md.
// Chỉ dùng hãng tàu test QA_T_SL… và container QATS…; chỉ đồng bộ đúng JobNo test (không đụng hồ sơ thật).

const vnToday = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const vnTomorrow = () => new Date(Date.now() + 31 * 3600_000).toISOString().slice(0, 10);

async function debtFor(opts: { total?: number; approved?: number; authCode?: string; line?: string } = {}) {
  const line = opts.line ?? await createTestShippingLine();
  const job = await gateInTestContainer('40HC', line);
  const fx = await fixtureApprovedRepair(job.id, { total: opts.total ?? 151200, approved: opts.approved ?? 120000, authCode: opts.authCode ?? 'AUTH-QA-1', qcStatus: 'PASSED' });
  const r = await call(admin(), 'POST', '/billing/sync', { jobNos: [fx.jobNo] });
  expect(r.status, r.msg).toBe(200);
  expect(r.data).toHaveLength(1);
  return { line, job, jobNo: fx.jobNo, debt: r.data[0] as any };
}
const payment = (line: string, amount: number, allocations: { debtCode: string; amount: number }[], over: Record<string, unknown> = {}) => ({
  shippingLineCode: line, paymentAmount: amount, paymentMethod: 'BANK_TRANSFER', referenceNo: 'QA', paymentDate: vnToday(),
  allocations: allocations.map((a) => ({ ...a, containerNo: '', quotationNo: '' })), ...over
});
const period = async (line: string) => ((await call(admin(), 'GET', `/billing/periods?shippingLineCode=${line}`)).data as any[]);
const debts = async (line: string) => ((await call(admin(), 'GET', `/billing/debts?shippingLineCode=${line}`)).data as any[]);
const audits = (jobNo: string, action: string) => withDb(async (db) =>
  (await db.query(`select "User","Details" from "AuditLogs" where "JobNo" = $1 and "Action" = $2 order by "Id"`, [jobNo, action])).rows as { User: string; Details: string }[]);

test.describe('shipping-line-ar › Ghi nợ sửa chữa sau QC đạt theo số tiền hãng duyệt', () => {
  test('Chưa QC đạt không có trong ứng viên; QC đạt → nợ = số tiền duyệt, mã duyệt của hãng; đồng bộ lặp không tạo thêm', async () => {
    const line = await createTestShippingLine();
    const pending = await gateInTestContainer('40HC', line);
    const fxPending = await fixtureApprovedRepair(pending.id, { total: 151200, approved: 120000, qcStatus: 'PENDING' });
    const candidates = (await call(admin(), 'GET', '/billing/sync-candidates')).data as any[];
    expect(candidates.map((c) => c.jobNo)).not.toContain(fxPending.jobNo);
    const none = await call(admin(), 'POST', '/billing/sync', { jobNos: [fxPending.jobNo] });
    expect(none.data).toHaveLength(0);

    const { debt, jobNo } = await debtFor({ line });
    expect(Number(debt.totalAmountVnd)).toBe(120000);
    expect(debt.approvalRef).toBe('AUTH-QA-1');
    expect(debt.debtPeriodCode).toBe(`${line}-${vnToday().slice(0, 7).replace('-', '')}`);
    expect(String(debt.dueDate).slice(0, 10)).toBe(new Date(Date.parse(vnToday()) + 30 * 86400_000).toISOString().slice(0, 10));
    const again = await call(admin(), 'POST', '/billing/sync', { jobNos: [jobNo] });
    expect(again.data).toHaveLength(0);
    expect(await debts(line)).toHaveLength(1);
    const p = (await period(line))[0];
    expect([Number(p.periodDebitVnd), Number(p.closingBalanceVnd), p.periodCode]).toEqual([120000, 120000, vnToday().slice(0, 7)]);
    expect((await audits(jobNo, 'DEBT_SYNCED')).length).toBe(1);
  });
});

test.describe('shipping-line-ar › Thu tiền và phân bổ kiểm tra ở server', () => {
  test('Vượt nợ / tổng lệch / khác hãng / ngày tương lai / phân bổ âm → 400', async () => {
    const a = await debtFor();
    const b = await debtFor();
    const bad: [string, unknown][] = [
      ['vượt nợ', payment(a.line, 150000, [{ debtCode: a.debt.code, amount: 150000 }])],
      ['tổng lệch', payment(a.line, 200000, [{ debtCode: a.debt.code, amount: 100000 }])],
      ['khác hãng', payment(a.line, 50000, [{ debtCode: b.debt.code, amount: 50000 }])],
      ['ngày tương lai', payment(a.line, 50000, [{ debtCode: a.debt.code, amount: 50000 }], { paymentDate: vnTomorrow() })],
      ['phân bổ âm', payment(a.line, 0, [{ debtCode: a.debt.code, amount: -1 }])]
    ];
    for (const [label, body] of bad) {
      const r = await call(admin(), 'POST', '/billing/payments', body);
      expect(r.status, label).toBe(400);
    }
    expect(Number((await debts(a.line))[0].remainingAmountVnd)).toBe(120000);
  });

  test('Thu hợp lệ: nợ, kỳ đúng; người ghi = tài khoản đăng nhập dù gửi tên khác; huỷ hoàn nợ, huỷ lần 2 → 400', async () => {
    const { line, debt, jobNo } = await debtFor();
    const r = await call(admin(), 'POST', '/billing/payments', { ...payment(line, 50000, [{ debtCode: debt.code, amount: 50000 }]), recordedBy: 'Kế toán AR' });
    expect(r.status, r.msg).toBe(200);
    expect(r.data.recordedBy).not.toBe('Kế toán AR');
    const d1 = (await debts(line))[0];
    expect([Number(d1.paidAmountVnd), Number(d1.remainingAmountVnd), d1.status]).toEqual([50000, 70000, 'PARTIAL']);
    const p1 = (await period(line))[0];
    expect([Number(p1.periodCreditVnd), Number(p1.closingBalanceVnd)]).toEqual([50000, 70000]);
    const logs = await audits(jobNo, 'AR_PAYMENT_RECORDED');
    expect(logs).toHaveLength(1);
    expect(logs[0].User).toContain(r.data.recordedBy);

    const rev = await call(admin(), 'POST', `/billing/payments/${r.data.code}/reverse`, { reason: 'QA huỷ', reversedBy: 'Kế toán trưởng' });
    expect(rev.status, rev.msg).toBe(200);
    expect(rev.data.reversedBy).not.toBe('Kế toán trưởng');
    const d2 = (await debts(line))[0];
    expect([Number(d2.paidAmountVnd), Number(d2.remainingAmountVnd), d2.status]).toEqual([0, 120000, 'UNPAID']);
    const p2 = (await period(line))[0];
    expect([Number(p2.periodCreditVnd), Number(p2.closingBalanceVnd)]).toEqual([0, 120000]);
    expect(await audits(jobNo, 'AR_PAYMENT_REVERSED')).toHaveLength(1);
    const again = await call(admin(), 'POST', `/billing/payments/${r.data.code}/reverse`, { reason: 'lần 2' });
    expect(again.status).toBe(400);
  });
});

test.describe('shipping-line-ar › Kỳ công nợ, hoá đơn, tuổi nợ', () => {
  test('Khoá kỳ tháng hiện tại → 400', async () => {
    const { line } = await debtFor();
    const p = (await period(line))[0];
    const r = await call(admin(), 'POST', `/billing/periods/${p.code}/close`, { closingNotes: 'QA' });
    expect(r.status).toBe(400);
    expect(r.msg).toMatch(/chưa kết thúc/);
  });

  test('Hoá đơn bắt buộc, không ghi đè; tuổi nợ: khoản chưa đến hạn ở nhóm "Chưa đến hạn"', async () => {
    const { line, debt, jobNo } = await debtFor();
    expect((await call(admin(), 'POST', `/billing/debts/${debt.code}/invoice`, { invoiceNo: '  ' })).status).toBe(400);
    const ok = await call(admin(), 'POST', `/billing/debts/${debt.code}/invoice`, { invoiceNo: 'QA-HD-0001' });
    expect(ok.status, ok.msg).toBe(200);
    const over = await call(admin(), 'POST', `/billing/debts/${debt.code}/invoice`, { invoiceNo: 'QA-HD-0002' });
    expect(over.status).toBe(400);
    expect((await debts(line))[0].invoiceNo).toBe('QA-HD-0001');
    expect(await audits(jobNo, 'DEBT_INVOICE_ISSUED')).toHaveLength(1);

    const aging = ((await call(admin(), 'GET', '/billing/aging')).data as any[]).find((x) => x.shippingLineCode === line);
    expect([Number(aging.bucketNotDue), Number(aging.overdueTotal), Number(aging.totalReceivable)]).toEqual([120000, 0, 120000]);
  });
});
