import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Đọc tests/.env (KEY=VALUE) — biến môi trường đặt sẵn được ưu tiên. Không dùng thư viện ngoài.
const envFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Thiếu ${key} — chép tests/.env.example thành tests/.env và điền giá trị local.`);
  return value;
};

export const env = {
  baseUrl: (process.env.TEST_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, ''),
  adminUser: process.env.TEST_ADMIN_USER || 'admin',
  get adminPassword() { return required('TEST_ADMIN_PASSWORD'); },
  get dbUrl() { return required('TEST_DB_URL'); }
};

export const apiUrl = `${env.baseUrl}/api`;

// Chốt an toàn: bộ test tạo / xoá dữ liệu nên CHỈ được chạy trên máy local, không bao giờ trỏ VPS.
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);
export const assertLocalOnly = () => {
  const web = new URL(env.baseUrl).hostname;
  const db = new URL(env.dbUrl).hostname;
  if (!LOCAL_HOSTS.has(web) || !LOCAL_HOSTS.has(db))
    throw new Error(`Bộ test chỉ chạy trên local (TEST_BASE_URL=${web}, TEST_DB_URL=${db}). Dừng để tránh đụng dữ liệu thật.`);
};

/** Tiền tố dữ liệu test — dọn theo tiền tố sau mỗi lần chạy (support/db.ts). */
export const TEST_PREFIX = { container: 'QATS', user: 'qa_t_', catalog: 'QA_T_' } as const;
