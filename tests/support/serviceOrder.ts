import { admin, call, gateInTestContainer, getJob } from './api';
import { loadSurveyCatalogs, checklistFrom, claimSurvey, submitSurvey } from './survey';
import { TEST_PREFIX } from './env';

// Dựng dữ liệu cho test phiếu dịch vụ: hồ sơ đã giám định + vệ sinh xong (lập được phiếu), biểu cước test QA_T_*.

/** Gate-In → nộp giám định → hoàn tất vệ sinh + bàn giao Khai thác. Trả hồ sơ sẵn sàng lập phiếu dịch vụ. */
/** cleaningCodes: dịch vụ vệ sinh trên phiếu giám định (mặc định 1 dịch vụ test QA_T_CLN_STD). */
export async function jobReadyForServiceOrder(isoSize = '40HC', cleaningCodes?: string[]) {
  const job = await gateInTestContainer(isoSize);
  await claimSurvey(job.id);
  const { zones } = await loadSurveyCatalogs();
  const cleaningItems = cleaningCodes?.map((code) => ({ cleaningCode: code, cleaningName: code, category: 'GENERAL', quantity: 1, unitPrice: 1, totalPrice: 1 }));
  const submitted = await submitSurvey(job.id, { isDraft: false, checklist: checklistFrom(zones), ...(cleaningItems ? { cleaningItems } : {}) });
  if (submitted.status !== 200) throw new Error(`Nộp giám định lỗi: ${submitted.status} ${submitted.msg}`);
  const records = ((await call(admin(), 'GET', '/cleaning')).data || []) as any[];
  const record = records.find((r) => r.containerNo === job.containerNo);
  if (!record) throw new Error(`Không thấy lệnh vệ sinh của ${job.containerNo}`);
  const done = await call(admin(), 'PATCH', `/cleaning/${record.id}/items/complete-all`, { performedBy: 'QA' });
  const handover = await call(admin(), 'POST', `/cleaning/${record.id}/handover`, { handoverActor: 'QA' });
  if (done.status !== 200 || handover.status !== 200) throw new Error(`Vệ sinh lỗi: ${done.status}/${handover.status} ${handover.msg}`);
  const detail = await getJob(job.id);
  return { ...job, jobNo: detail.jobNo as string, isoSize };
}

let seq = 0;
/** Giá mặc định của biểu cước test theo loại container (DM Loại Container); 40HC và 40GP cố ý khác nhau. */
export const DEFAULT_TEST_PRICES: Record<string, number> = {
  '20HC': 210000, '40HC': 410000, '40GP': 400000, '45HC': 450000, '20RF': 310000, '40RH': 510000, '40OT': 610000
};
/** { mã loại → giá } → danh sách `prices` của API (giá 0 = bỏ, tức chưa có giá). */
export const pricesBody = (map: Record<string, number>) =>
  Object.entries(map).filter(([, p]) => p !== 0).map(([containerTypeCode, price]) => ({ containerTypeCode, price }));
/** Giá của 1 loại trong biểu cước trả về từ API (0 = chưa có giá). */
export const priceOfType = (tariff: any, typeCode: string) =>
  Number((tariff?.prices || []).find((p: any) => p.containerTypeCode === typeCode)?.price ?? 0);

/** Tạo biểu cước nâng hạ test (mặc định nhóm vỏ rỗng, giá theo DEFAULT_TEST_PRICES; `prices` ghi đè từng loại, 0 = chưa có giá). */
export async function createTestTariff(over: Record<string, unknown> & { prices?: Record<string, number> } = {}) {
  const code = String(over.code ?? `${TEST_PREFIX.catalog}LOLO_${Date.now() % 100000}_${seq++}`);
  const { prices: priceOverride, ...rest } = over;
  const body = {
    code, serviceCategory: 'LIFT_EMPTY', nameVi: 'Nâng hạ test', nameEn: '', unit: 'Lần / Cont',
    vatPercent: 8, currency: 'VND', applicableShift: 'ALL', description: '', isActive: true, sortOrder: 999, ...rest, code,
    prices: pricesBody({ ...DEFAULT_TEST_PRICES, ...(priceOverride || {}) })
  };
  const r = await call(admin(), 'POST', '/MasterData/service-tariffs', body);
  if (r.status !== 200) throw new Error(`Tạo biểu cước test lỗi: ${r.status} ${r.msg}`);
  return { id: String(r.data.id), code, body };
}

/** Hạng mục phiếu dịch vụ — đơn giá / VAT gửi lên cố ý sai để kiểm tra server tự tra giá. */
export const orderItem = (serviceCode: string, over: Record<string, unknown> = {}) => ({
  serviceCode, serviceName: 'tên gửi từ trình duyệt', category: 'LOLO', quantity: 1, unit: 'x', unitPrice: 1, vatPercent: 0, remarks: '', ...over
});

export const createServiceOrder = (job: { jobNo: string; containerNo: string }, items: unknown[], size?: string) =>
  call(admin(), 'POST', '/service-orders', {
    jobNo: job.jobNo, containerNo: job.containerNo, shippingLineCode: 'MSCU', size, customerName: 'Khách test', items
  });
