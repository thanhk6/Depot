import { cleanupTestData } from './db';

// Sau khi chạy: dọn sạch dữ liệu test và báo nếu còn sót.
export default async function globalTeardown() {
  const left = await cleanupTestData();
  if (left.jobs || left.catalog || left.users)
    console.warn(`[tests] Còn sót dữ liệu test sau khi dọn: ${JSON.stringify(left)}`);
}
