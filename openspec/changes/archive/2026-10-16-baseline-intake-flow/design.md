# Design

## Context

Xem proposal.md — Why. Hành vi được đối chiếu trực tiếp từ code đang chạy:
- Gate-In, Giám định, Phiếu dịch vụ, Thanh toán, Xe nâng: `DepotJobService` (Depot.Application).
- Vệ sinh: `CleaningService`.
- Hàng đợi lệnh Xe nâng: được suy ra ở frontend (`fontend/src/modules/forklift/pages/ForkliftPage.tsx`) từ trạng thái hồ sơ + nhật ký (CLEANING_HANDOVER, FORKLIFT_MOVE_COMPLETED, QC_PASSED); backend chỉ giữ khoá nhận lệnh và vị trí bãi.

Đã có 5 đặc tả chính (nhánh Báo giá → QC). `container-lifecycle` đã chứa các chuyển trạng thái xuyên công đoạn.

## Goals / Non-Goals

**Goals:**
- Mỗi requirement kiểm chứng được bằng một thao tác trên giao diện hoặc API local.
- Không trùng lặp với `container-lifecycle`: đặc tả công đoạn chỉ ghi phần riêng, chuyển trạng thái chung thì trỏ sang.

**Non-Goals:**
- Không sửa hành vi nào, kể cả chỗ có thể chưa đúng ý nghiệp vụ (xem Open Questions).
- Không mô tả chi tiết giao diện (bố cục, màu, nút) — chỉ hành vi nghiệp vụ.

## Decisions

- **Ghi đúng hiện trạng, không ghi mong muốn.** Đặc tả nền là mốc so sánh; nếu ghi hành vi mong muốn thì đặc tả sai ngay từ đầu và change sửa sau không có MODIFIED rõ ràng. Phương án khác — sửa luôn các điểm lệch trong change này — bị loại vì trộn ghi tài liệu với đổi code, khó duyệt.
- **Tách 6 capability theo công đoạn / menu** thay vì gộp (ví dụ `service-order` + `payment` thành `billing`): mỗi màn có người phụ trách riêng (Khai thác, Thu ngân), change sau thường chỉ chạm một bên.
- **Hàng đợi Xe nâng ghi ở mức hành vi**, không ghi cách suy ra ở frontend — nếu sau này chuyển phần suy ra xuống backend, đặc tả không phải đổi.
- **Không ghi mã định danh nội bộ** (định dạng JOB-/SRV-/CL-/SO-/INV-) vì không phải hành vi người dùng dựa vào; chỉ ghi "hệ thống sinh số".

## Risks / Trade-offs

- [Đặc tả ghi cả hành vi có thể là lỗi] → liệt kê ở Open Questions để làm change riêng; khi sửa sẽ dùng MODIFIED Requirements.
- [Code đổi trong lúc chờ duyệt] → task rà soát lại các điểm chặn chính trước khi archive.

## Migration Plan

Không có. Chỉ thêm file đặc tả; archive tạo `openspec/specs/` cho 6 capability. Rollback = xoá thư mục đặc tả vừa tạo.

## Open Questions

Các điểm code hiện tại có thể chưa đúng ý nghiệp vụ — mỗi điểm nên là một change riêng nếu muốn đổi, không ảnh hưởng đặc tả nền này:
1. **Giám định nộp lại khi đã qua bước:** nộp phiếu chỉ bị chặn ở READY_FOR_OUT / GATE_OUT; hồ sơ đang CLEANING / ESTIMATING vẫn nộp lại được và bị đưa về CLEANING. Cũng không kiểm tra người nộp có đang giữ khoá nhận phiếu hay không.
2. **Hạ bãi không kiểm tra người nhận lệnh:** bắt đầu / huỷ lệnh chỉ cho người giữ khoá, nhưng hạ bãi thì ai cũng ghi được.
3. **Webhook VietQR dò cả hồ sơ đã Gate-Out:** khớp theo số container trong nội dung chuyển khoản trên mọi hồ sơ, có thể khớp nhầm hồ sơ cũ của cùng container.
4. **Nhật ký phiếu dịch vụ** ghi người thao tác là "Operation" thay vì để trống cho AuditActorInterceptor điền tài khoản thật — cần kiểm tra interceptor có ghi đè giá trị đã có hay không.
5. **Chuyển khoản tại quầy không bắt buộc mã giao dịch** — có đúng quy định thu ngân không.
6. **Người bàn giao vệ sinh không hiện ở màn Xe nâng** (phát hiện khi đối chiếu 2.1): lệnh "từ KHU VỆ SINH" có tạo ghi chú "Vệ sinh xong (bàn giao: …)" nhưng không màn nào hiển thị ghi chú này.
7. **Nhật ký thu bị từ chối vì sai hình thức thiếu số container** (phát hiện khi đối chiếu 1.5): dòng nhật ký có mã hồ sơ nhưng không có số container / số hồ sơ, nên lọc theo từ khoá số container không thấy dòng đó.
