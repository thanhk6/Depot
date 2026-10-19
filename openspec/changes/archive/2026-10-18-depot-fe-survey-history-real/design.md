# Design

## Context

Hiện trạng ngày 18/10/2026:

- **`SurveyModulePage`:**
  - giữ một state `surveys`, nạp từ `containerApi.getAll({ status: 'SURVEYING' })` (hàng chờ giám định) và truyền **cùng** danh sách đó cho cả tab hàng chờ lẫn tab *Lịch sử* (`SurveyHistoryTable`);
  - `mapJobToSurvey` dựng giá trị tạm khi hồ sơ chưa có phiếu: `surveyNo = job.jobNo`, `surveyDate = new Date()`, `surveyor = currentUser`, `condition = 'AV'`;
  - hàm này cũng dùng cho hàng chờ / form giám định, nên không sửa các giá trị tạm đó cho hàng chờ.
- **`SurveyHistoryTable`:**
  - có `dateFrom` / `dateTo` nhưng `filtered` không dùng tới;
  - `handleExportCSV` chỉ `alert`;
  - nút *Chuyển Khai Thác* gọi `handleTransferToOperation`: gán `eeirNo` ngẫu nhiên rồi `handleSaveSurvey`, tức nộp phiếu chính thức;
  - không có dòng báo trống;
  - cột e-EIR đọc `survey.eeirNo`, mà `mapJobToSurvey` không bao giờ điền trường này.
- **Backend:**
  - `GET /api/DepotJobs` không lọc trạng thái, không phân trang mặc định, trả kèm `survey` (`surveyNo`, `surveyDate`, `surveyorName`, `conditionRating`, `damages`) và `gateInEirNo`;
  - phiếu nháp và phiếu đã nộp cùng nằm ở bảng `Surveys`, không có cột phân biệt;
  - nộp chính thức luôn đưa hồ sơ ra khỏi `SURVEYING` (sang `CLEANING`), lưu nháp giữ `SURVEYING`.

## Goals / Non-Goals

**Goals:** lịch sử đúng phiếu đã nộp, dữ liệu thật, có trạng thái hồ sơ; lọc ngày và xuất CSV hoạt động thật; bỏ thao tác nộp lại.

**Non-Goals:** không đổi backend; không đổi hàng chờ / form giám định; không hiện nhật ký từng lần lưu.

## Decisions

- **State riêng `historySurveys`** và hàm `refreshSurveyHistory()`:
  - gọi `containerApi.getAll()` không truyền trạng thái;
  - lọc `job.survey && job.status !== 'SURVEYING'`.
  - Gọi khi mở tab *history* và sau khi nộp phiếu thành công.
  - Không gộp vào `surveys`, để hàng chờ không đổi hành vi.
- **Hàm ánh xạ riêng `mapJobToHistory(job)`:**
  - chỉ dùng cho hồ sơ đã có phiếu;
  - lấy thẳng `survey.surveyNo`, `survey.surveyDate`, `survey.surveyorName`, tình trạng theo `conditionFromRating(survey.conditionRating)`, `damages`;
  - thêm `jobStatus = job.status`, `eeirNo = job.gateInEirNo`;
  - không có nhánh giá trị tạm. Thiếu số phiếu (dữ liệu cũ) thì để trống, không lấy số hồ sơ.
  - Vẫn trả `SurveyItemRecord` (thêm trường tuỳ chọn `jobStatus`) để `handleOpenSurvey` và e-EIR modal dùng được như cũ.
- **Nhãn trạng thái hồ sơ:** dùng bảng nhãn trạng thái tiếng Việt sẵn có trong app, nếu có (sẽ tìm khi làm, ví dụ trong `modules/container`); không có thì khai báo một map nhỏ cạnh bảng.
- **Lọc ngày:**
  - so `YYYY-MM-DD` của `surveyDate` theo giờ Việt Nam (`toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' })`) với giá trị ô date;
  - đổi ngày thì về trang 1.
- **Xuất CSV:**
  - tạo `Blob` với `'﻿' + csv`;
  - cột: Số phiếu, Container, Hãng tàu, Ngày giám định (dd/MM/yyyy HH:mm, giờ VN), Người giám định, Tình trạng, Số hư hỏng, Trạng thái hồ sơ, e-EIR;
  - escape dấu phẩy, ngoặc kép, xuống dòng;
  - tên file `lich-su-giam-dinh-YYYYMMDD.csv`; dùng `filtered`, không dùng `paginated`.
- **Bỏ nút chuyển khai thác:** không truyền `onTransferToOperation` vào `SurveyHistoryTable`, và xoá prop cùng nút trong bảng.
  - `handleTransferToOperation` không còn chỗ gọi nào khác thì xoá luôn (không để code chết bịa số e-EIR). Còn chỗ khác dùng thì giữ và báo lại.

## Risks / Trade-offs

- **Tải toàn bộ hồ sơ mỗi lần mở tab:** hiện vài chục hồ sơ, chấp nhận được. Khi dữ liệu lớn nên thêm endpoint lịch sử phân trang ở backend (để sau).
- **Phiếu đã nộp rồi bị giám định lại** (hồ sơ quay về SURVEYING, nếu có luồng này) sẽ tạm không hiện tới khi nộp lại. Hiện không có luồng đưa hồ sơ về SURVEYING sau khi nộp; chấp nhận.
- **Hồ sơ đã xoá mềm** không có trong `GET /DepotJobs`, nên phiếu của chúng không hiện; đúng ý nghĩa xoá.
