# Proposal

## Why

Kiểm thử lại tab *Lịch Sử & Nhật Ký Giám Định (Survey Audit History)* ngày 18/10/2026 trên local:
- DB có 3 phiếu giám định đã nộp (SUDU3070783 đang sửa, BMOU1675248 chờ QC, WHLU4254283 đang vệ sinh);
- màn hình lại báo **"Hiển thị 0 kết quả lịch sử"**.

Nguyên nhân và các lỗi đi kèm, đều đã xác nhận bằng code:
1. Bảng lịch sử dùng chung danh sách với hàng chờ giám định (`containerApi.getAll({ status: 'SURVEYING' })`), nên chỉ thấy container **chưa** giám định. Giám định xong là biến mất khỏi "lịch sử".
2. Container chưa có phiếu bị gán **ngày giám định = giờ hiện tại** (`new Date()`), số phiếu = số hồ sơ, người giám định = người đang đăng nhập. Đây đều là dữ liệu bịa.
3. Hai ô *Từ ngày / Đến ngày* không được dùng trong bộ lọc.
4. Nút xuất Excel / CSV chỉ bật `alert("Đã xuất…")`, không tải file nào.
5. Nút *Chuyển Khai Thác* hiện ở mọi dòng. Bấm vào là nộp lại phiếu chính thức và tự bịa số e-EIR bằng `Math.random()`.

Người dùng chốt: lịch sử **chỉ hiện phiếu đã nộp chính thức**.

## What Changes

- **Nguồn dữ liệu riêng cho lịch sử:**
  - tải mọi hồ sơ (`GET /api/DepotJobs`, không lọc trạng thái, API không phân trang mặc định);
  - giữ hồ sơ **có phiếu giám định và đã rời trạng thái SURVEYING**, tức phiếu đã nộp chính thức, vì nộp phiếu luôn chuyển hồ sơ sang vệ sinh. Phiếu nháp không hiện;
  - mọi cột lấy từ phiếu thật: số phiếu, ngày giám định, người giám định, tình trạng, số hư hỏng, hãng tàu. Không còn giá trị dựng tạm;
  - hàng chờ giám định giữ nguyên nguồn cũ.
- **Thêm cột *Trạng thái hồ sơ hiện tại*** (Đang vệ sinh, Chờ báo giá, Đang sửa, Chờ QC, Sẵn sàng xuất, Đã ra cổng…), theo nhãn trạng thái tiếng Việt đang dùng trong app.
- **Cột e-EIR** dùng số e-EIR nhập thật của hồ sơ (`gateInEirNo`); không có thì để trống.
- **Lọc ngày** theo ngày giám định (giờ Việt Nam), tính cả ngày đầu và ngày cuối.
- **Xuất CSV thật:** tải file `lich-su-giam-dinh-<ngày>.csv` gồm đúng các dòng **đang lọc** (mọi trang, không chỉ trang đang xem), có BOM UTF-8 để Excel đọc đúng tiếng Việt. Không có dòng nào thì báo không có dữ liệu để xuất.
- **Bỏ nút *Chuyển Khai Thác*** khỏi bảng lịch sử. Phiếu ở đây đã nộp; nút hiện tại nộp lại phiếu và bịa số e-EIR.
- **Dòng báo trống** khi không có kết quả: "Chưa có phiếu giám định đã nộp" hoặc "Không có phiếu khớp bộ lọc".
- Mở tab lịch sử thì tải lại dữ liệu, để phiếu vừa nộp hiện ngay.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `container-survey`: thêm requirement về lịch sử giám định (chỉ phiếu đã nộp, dữ liệu thật, trạng thái hồ sơ hiện tại, không có thao tác nộp lại) và về lọc / xuất lịch sử.

## Impact

- **Frontend (`fontend/`):**
  - `modules/survey/pages/SurveyModulePage.tsx`: state + hàm tải lịch sử riêng; bỏ truyền `onTransferToOperation` vào bảng lịch sử; ánh xạ phiếu không dùng giá trị tạm;
  - `modules/survey/components/SurveyHistoryTable.tsx`: lọc ngày, xuất CSV, cột trạng thái hồ sơ, dòng báo trống, bỏ nút chuyển khai thác;
  - `modules/survey/types` nếu cần thêm trường (`jobStatus`, `gateInEirNo`).
- **Backend / DB:** không đổi.
- **Ngoài phạm vi:**
  - hàm `handleTransferToOperation` vẫn bịa số e-EIR nhưng chỉ còn dùng ngoài bảng lịch sử (nếu còn chỗ gọi). Sẽ rà khi làm và báo nếu còn nơi dùng;
  - nhật ký thao tác chi tiết từng lần lưu nháp / nộp (`SURVEY_DRAFT_SAVED` / `SURVEY_SUBMITTED`), chưa hiện trong bảng này.
