import { apiUrl, env, TEST_PREFIX } from './env';

// Gọi API backend qua frontend local (/api). Trả nguyên status HTTP + envelope {statusCode, message, data}.
export interface ApiResult<T = any> { status: number; msg?: string; data?: T; }

const tokens = new Map<string, { token: string; id: number }>();

export async function login(username = env.adminUser, password = env.adminPassword) {
  const cached = tokens.get(username);
  if (cached) return cached;
  const r = await fetch(`${apiUrl}/Users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const j: any = await r.json().catch(() => ({}));
  if (!j.data?.accessToken) throw new Error(`Đăng nhập ${username} thất bại: HTTP ${r.status} ${j.message ?? ''}`);
  const session = { token: j.data.accessToken as string, id: Number(j.data.id) };
  tokens.set(username, session);
  return session;
}

export async function call<T = any>(user: string, method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  const { token } = await login(user, env.adminPassword);
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const r = await fetch(apiUrl + path, { method, headers, body: payload });
  const text = await r.text();
  let j: any = null;
  try { j = JSON.parse(text); } catch { /* không phải JSON */ }
  return { status: r.status, msg: j?.message, data: j?.data ?? (j ? undefined : text) };
}

export const admin = () => env.adminUser;

/** Số container hợp lệ ISO 6346 (có số kiểm tra) với tiền tố test QATS — số ngẫu nhiên (mỗi file test chạy ở
 *  tiến trình riêng nên bộ đếm tuần tự sẽ trùng giữa các file). */
export function testContainerNo(): string {
  const s = TEST_PREFIX.container + String(100000 + Math.floor(Math.random() * 900000));
  const map: Record<string, number> = {};
  let v = 10;
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') { if (v % 11 === 0) v++; map[ch] = v++; }
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += (/\d/.test(s[i]) ? Number(s[i]) : map[s[i]]) * 2 ** i;
  return s + ((sum % 11) % 10);
}

/** Gate-In một container test (nhà xe vãng lai), trả id hồ sơ + số container. */
export async function gateInTestContainer(isoSize = '40HC', shippingLine = 'MSCU') {
  const me = await login();
  for (let attempt = 0; attempt < 5; attempt++) {
    const containerNo = testContainerNo();
    const r = await call(admin(), 'POST', '/DepotJobs/gate-in', {
      containerNo, isoSize, shippingLine, tareWeightKg: 3800, maxPayloadKg: 28000,
      truckPlate: '51C-TS1.23', driverName: 'Tai Xe Test', driverPhone: '0900000099', gateInStaffId: me.id, truckingMode: 'WALK_IN'
    });
    if (r.status === 200) return { id: String(r.data.id), containerNo };
    if (r.status !== 409) throw new Error(`Gate-In ${containerNo} lỗi: ${r.status} ${r.msg} ${JSON.stringify(r.data)}`);
  }
  throw new Error('Gate-In: trùng số container 5 lần liên tiếp');
}

export const getJob = async (id: string) => (await call(admin(), 'GET', `/DepotJobs/${id}`)).data;

export const getCatalog = async (type: string, includeInactive = false) =>
  ((await call(admin(), 'GET', `/MasterData/catalog/${type}${includeInactive ? '?includeInactive=true' : ''}`)).data || []) as any[];

export const readJson = (value: unknown): Record<string, any> => {
  try { return JSON.parse(String(value || '{}')); } catch { return {}; }
};
