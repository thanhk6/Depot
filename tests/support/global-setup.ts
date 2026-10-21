import { assertLocalOnly, env } from './env';
import { login } from './api';
import { cleanupTestData } from './db';

// Trước khi chạy: chặn nếu không phải local, kiểm tra frontend/backend đang chạy, dọn dữ liệu test sót lần trước.
export default async function globalSetup() {
  assertLocalOnly();
  const r = await fetch(`${env.baseUrl}/api/health`).catch(() => null);
  if (!r || r.status !== 200)
    throw new Error(`Không gọi được ${env.baseUrl}/api/health — bật frontend (npm run dev) và Depot.BackendApi trước khi chạy test.`);
  await login();
  await cleanupTestData();
}
