# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Đồng bộ công nợ: ứng viên = báo giá APPROVED mới nhất + lệnh sửa chữa mới nhất QC đạt, chưa có nợ hiệu lực; tiền = `ApprovedAmount`, mã duyệt = mã / WO của hãng, ngày nợ = lúc QC đạt. Kiểm tra: build không lỗi.
- [x] 1.2 Kỳ công nợ theo tháng giờ VN (`GetOrCreatePeriodAsync`, `RecalculateBalancesAsync`); khoá sổ chỉ kỳ cũ nhất đang mở và đã hết tháng, không tự tạo kỳ kế tiếp. Kiểm tra: build không lỗi.
- [x] 1.3 Ghi thu / huỷ thu: kiểm tra phân bổ, hãng, tổng = số thu, ngày thu, kỳ đã khoá; transaction; huỷ trừ đúng kỳ chứa khoản thu. Kiểm tra: build không lỗi.
- [x] 1.4 Người thao tác lấy từ tài khoản đăng nhập (controller → service) cho đồng bộ / thu / huỷ / hoá đơn / khoá sổ; nhật ký `DEBT_SYNCED`, `AR_PAYMENT_RECORDED`, `AR_PAYMENT_REVERSED`, `DEBT_INVOICE_ISSUED`, `AR_PERIOD_CLOSED`. Kiểm tra: build không lỗi.
- [x] 1.5 Hoá đơn: bắt buộc, không ghi đè, không dùng chung giữa hãng. Tuổi nợ: ngày VN, nhóm "Chưa đến hạn" + `OverdueTotal`. Kiểm tra: build không lỗi.
- [x] 1.6 Test API (`tests/api/shipping-line-ar.spec.ts`, hãng test `QA_T_SL…`, container `QATS…`; dựng báo giá duyệt + QC cho hồ sơ test bằng helper DB):
  - chưa QC đạt không có trong ứng viên; QC đạt → nợ = số tiền duyệt; đồng bộ lặp không tạo thêm;
  - thu: vượt nợ / tổng lệch / khác hãng / ngày tương lai → 400; hợp lệ → nợ và kỳ đúng; người ghi = tài khoản đăng nhập dù gửi tên khác; nhật ký có;
  - huỷ thu hoàn nợ, trừ kỳ; huỷ lần 2 → 400;
  - khoá kỳ tháng hiện tại → 400; hoá đơn ghi đè → 400;
  - tuổi nợ: khoản chưa đến hạn ở nhóm "Chưa đến hạn".
  - Kiểm tra: `npm run test:api` đạt.

## 2. Frontend (`fontend/`)

- [x] 2.1 `BillingPage`: bỏ `2026-08-18` — nợ quá hạn từ `/billing/aging`; bộ lọc ngày mặc định tháng hiện tại, lọc theo ngày nợ (truyền vào `ContainerDebtLedgerTab`); bỏ gửi `recordedBy` / `closedBy` / `reversedBy` / `performedBy` (`billing.api.ts`). Kiểm tra: `npx tsc --noEmit -p .` không lỗi.
- [x] 2.2 `IssueInvoiceModal` ô số hoá đơn để trống; `DebtAgingReportTab` thêm cột "Chưa đến hạn"; kỳ hiển thị theo tháng. Kiểm tra: type-check không lỗi.
- [x] 2.3 Test giao diện (`tests/e2e/shipping-line-ar.spec.ts`): thẻ nợ quá hạn khớp `/billing/aging`; ô số hoá đơn trống khi mở; bộ lọc ngày mặc định tháng hiện tại. Kiểm tra: `npm test` đạt.

## 3. Kiểm thử & dữ liệu (http://127.0.0.1:3000, admin)

- [x] 3.1 `cd tests && npm test` toàn bộ đạt; dọn dữ liệu test (`support/db.ts` thêm công nợ / kỳ / thu / phân bổ của hãng `QA_T_`); dữ liệu thật không đổi (so DB trước / sau).
- [x] 3.2 Tài liệu: `docs/quy-trinh-van-hanh-depot.md` (bước công nợ hãng tàu sau QC) + tài liệu menu Công Nợ Hãng Tàu: số tiền = số hãng duyệt nhập tay, ghi nợ sau QC đạt, kỳ theo tháng, quy tắc thu / huỷ / khoá sổ.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fullstack-shipping-line-ar-fix` (tạo spec `shipping-line-ar`).
- Trước deploy VPS: kiểm tra 4 bảng công nợ trên VPS có dữ liệu không; có thì báo người dùng trước.
