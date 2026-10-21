# Proposal

## Why

Kiểm tra *Quản Lý Công Nợ Hãng Tàu (Shipping Line AR)* (20/10/2026) — bảng công nợ / kỳ / thu tiền đang trống nên chưa sai số thật, nhưng sẽ sai ngay khi dùng:
- **Số gõ cứng:** "hôm nay" = `2026-08-18` khi tính nợ quá hạn (thẻ KPI + bảng theo hãng); bộ lọc ngày mặc định 01–31/08/2026 và không lọc gì; số hoá đơn tự bịa `HDDT-2026-08-<ngẫu nhiên>`.
- **Sai nguồn tiền:** đồng bộ công nợ lấy `GrandTotal` báo giá thay vì số tiền hãng duyệt (nhập tay ở bước Ghi nhận hãng tàu duyệt); "mã duyệt hãng" ghi tên nhân viên depot; ghi nợ khi sửa xong chưa chờ QC đạt; hồ sơ có > 1 lệnh sửa chữa làm lỗi 500.
- **Thu tiền không kiểm ở server:** phân bổ âm / vượt nợ còn lại / vào khoản đã thu đủ hoặc huỷ / khoản của hãng khác đều lọt; tổng phân bổ không khớp số thu.
- **Người thao tác do trình duyệt gửi** ("Kế toán AR", "Kế toán trưởng"), không ghi nhật ký; huỷ thu / khoá sổ không chạy trong 1 transaction.
- **Kỳ công nợ sai:** kỳ 15 ngày từ ngày đồng bộ đầu (UTC); nợ / thu luôn vào kỳ đang mở, huỷ thu kỳ đã khoá trừ vào kỳ mở; khoá sổ được cả kỳ chưa hết.
- **Tuổi nợ:** ngày UTC; nhóm "0–30" gộp cả khoản chưa đến hạn.
- **Hoá đơn:** ghi đè được số hoá đơn cũ, không kiểm tra.

Người dùng quyết định (20/10/2026):
- tiền công nợ = **số tiền hãng duyệt nhập tay** (không gửi API hãng tàu);
- ghi nợ **sau khi QC đạt**;
- kỳ công nợ **theo tháng**;
- **chỉ sửa đúng các lỗi trên cho công nợ sửa chữa** (không thêm lưu bãi / nâng hạ / vệ sinh).

## What Changes

- **Đồng bộ công nợ:** chỉ báo giá đã duyệt + lệnh sửa chữa **QC đạt**; số tiền = `ApprovedAmount` (số tiền hãng duyệt), mã duyệt = mã duyệt / số WO của hãng; ngày nợ = lúc QC đạt, hạn = +30 ngày; mỗi hồ sơ một khoản nợ (lấy lệnh sửa chữa / báo giá mới nhất), không lỗi khi có nhiều lệnh.
- **Kỳ công nợ theo tháng** (giờ Việt Nam), mỗi hãng mỗi tháng một kỳ: nợ vào kỳ của tháng QC đạt, thu vào kỳ của tháng ngày thu; kỳ đã khoá thì không ghi thêm (nợ chuyển vào kỳ tháng hiện tại, thu / huỷ thu vào kỳ đã khoá bị từ chối hoặc ghi vào kỳ hiện tại — xem design); số dư đầu kỳ = số dư cuối kỳ trước, tính lại khi có phát sinh; chỉ khoá kỳ cũ nhất đang mở và đã hết tháng.
- **Thu tiền:** server kiểm tra phân bổ > 0, không vượt nợ còn lại, khoản đúng hãng và chưa thu đủ / chưa huỷ, tổng phân bổ = số tiền thu, ngày thu không ở tương lai.
- **Người thao tác + nhật ký:** ghi thu, huỷ thu, khoá sổ, đồng bộ, gắn hoá đơn lấy người từ tài khoản đăng nhập (bỏ trường người thao tác client gửi); ghi `JobAuditLog` cho hồ sơ liên quan (khoá sổ ghi `SystemAuditLogs`). Huỷ thu, khoá sổ, ghi thu chạy trong 1 transaction.
- **Tuổi nợ:** ngày Việt Nam; thêm nhóm "Chưa đến hạn", các nhóm 1–30 / 31–60 / 61–90 / > 90 ngày là số ngày quá hạn.
- **Hoá đơn:** bắt buộc số hoá đơn; khoản đã có hoá đơn thì không ghi đè; một số hoá đơn chỉ dùng cho khoản cùng hãng.
- **Màn hình:** bỏ ngày gõ cứng — nợ quá hạn lấy từ báo cáo tuổi nợ của server; bộ lọc ngày mặc định tháng hiện tại và lọc thật theo ngày nợ; ô số hoá đơn để trống; bỏ gửi tên người thao tác.

## Capabilities

### New Capabilities

- `shipping-line-ar`: công nợ hãng tàu cho sửa chữa — ghi nợ sau QC đạt theo số tiền hãng duyệt, kỳ công nợ theo tháng, thu tiền và phân bổ, huỷ thu, hoá đơn, tuổi nợ.

### Modified Capabilities

(không)

## Impact

- **Màn hình:** *Công Nợ Hãng Tàu (AR)* — `BillingPage`, `DebtDashboardKPI`, `ShippingLineSummaryTab`, `ContainerDebtLedgerTab`, `DebtAgingReportTab`, `IssueInvoiceModal`, `SyncDebtModal`, `PaymentAllocationModal`; `api/billing.api.ts`.
- **API** (`/billing/*`, quyền `billing`): `sync-candidates`, `sync`, `payments` (POST), `payments/{code}/reverse`, `periods/{code}/close`, `debts/{code}/invoice`, `aging` — đổi kiểm tra / kết quả; bỏ `recordedBy` / `closedBy` / `reversedBy` / `performedBy` trong request (bỏ qua nếu gửi).
- **Dữ liệu:** không cần migration (thêm trường DTO tuổi nợ). Bảng công nợ / kỳ / thu đang trống — không sửa dữ liệu cũ.
- **Ngoài phạm vi:** công nợ lưu bãi / nâng hạ / vệ sinh; gửi số liệu cho hãng qua API (AEMS); xuất hoá đơn điện tử thật; đổi cách sinh mã chứng từ.
