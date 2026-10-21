# Bộ test SolutionDepot

Test tự động cho API backend và giao diện, chạy bằng [Playwright Test](https://playwright.dev). **Chỉ chạy trên máy local**: địa chỉ web và DB không phải `127.0.0.1` / `localhost` thì bộ test dừng ngay.

## Cấu trúc

```
tests/
├── api/                 # Test API (gọi /api qua frontend local)
├── e2e/                 # Test giao diện trên trình duyệt
├── support/
│   ├── env.ts           # Đọc tests/.env, chốt chỉ-chạy-local, tiền tố dữ liệu test
│   ├── api.ts           # Đăng nhập, gọi API, tạo container test (Gate-In)
│   ├── survey.ts        # Dựng phiếu giám định từ danh mục DB thật
│   ├── ui.ts            # Thao tác giao diện dùng chung
│   ├── db.ts            # Tạo tài khoản tạm, dọn dữ liệu test theo tiền tố
│   ├── global-setup.ts  # Kiểm tra local + server đang chạy, dọn dữ liệu sót
│   └── global-teardown.ts
├── playwright.config.ts # 2 project: api, e2e — chạy tuần tự (dùng chung DB)
└── .env.example
```

## Chạy lần đầu

```bash
cd tests
npm install
cp .env.example .env          # điền TEST_ADMIN_PASSWORD, TEST_DB_URL của máy local
```

Bật backend (`Depot.BackendApi`, `Depot.FileServer`) và frontend (`cd fontend && npm run dev`) trước khi chạy.

## Lệnh

| Lệnh | Việc |
| :--- | :--- |
| `npm test` | Chạy toàn bộ (api + e2e) |
| `npm run test:api` | Chỉ test API |
| `npm run test:e2e` | Chỉ test giao diện |
| `npx playwright test -g "Checklist"` | Chạy test có tên khớp |
| `npm run report` | Mở báo cáo HTML lần chạy gần nhất |
| `npm run cleanup` | Dọn tay dữ liệu test nếu lần chạy bị dừng giữa chừng |

## Dữ liệu test

- Mỗi test tự tạo dữ liệu riêng: container `QATS…` (số hợp lệ ISO 6346), tài khoản `qa_t_…`, mã danh mục `QA_T_…`.
- Trước và sau mỗi lần chạy, `support/db.ts` xoá **mọi** bản ghi mang các tiền tố này: hồ sơ, phiếu, hư hỏng, checklist, lệnh vệ sinh, phiếu dịch vụ, nhật ký, ảnh (xoá qua API để xoá cả file vật lý).
- Test **không sửa / xoá** dữ liệu thật. Thao tác ghi lên danh mục chỉ dùng mã `QA_T_…`; khu vực / vị trí thật chỉ dùng cho thao tác phải bị từ chối.

## Quy ước viết test

- Tên `describe` = `<capability> › <tên Requirement>` đúng như trong `openspec/specs/<capability>/spec.md`; tên `test` theo tên Scenario. Nhờ vậy tra được ngược từ test về đặc tả.
- Lấy mã danh mục (khu vực, vị trí…) từ DB qua API, không gõ cứng giá trị có thể đổi.
- Mỗi change OpenSpec có hành vi mới nên thêm / sửa test ở đây trong nhóm task *Kiểm thử*, và chạy `npm test` trước khi archive.

## Đang có

| File | Requirement (container-survey) |
| :--- | :--- |
| `api/container-survey.checklist.spec.ts` | Checklist khu vực đúng theo danh mục · Khu vực checklist khớp hư hỏng · Mã vị trí hư hỏng thuộc danh mục |
| `api/survey-checklist-catalog.spec.ts` | Quản lý danh mục khu vực Checklist · Giữ toàn vẹn khi tạm ngưng hoặc xoá khu vực |
| `e2e/survey-history-readonly.spec.ts` | Xem phiếu từ lịch sử ở chế độ chỉ xem |
| `e2e/survey-checklist-sync.spec.ts` | Khu vực checklist khớp hư hỏng (form) · Khu vực Vệ sinh không hạ phân loại DM |
