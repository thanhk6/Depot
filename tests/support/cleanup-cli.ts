import { cleanupTestData } from './db';

// npm run cleanup — dọn tay dữ liệu test (QATS*, qa_t_*, QA_T_*) khi một lần chạy bị dừng giữa chừng.
const left = await cleanupTestData();
console.log('Đã dọn dữ liệu test. Còn lại:', left);
