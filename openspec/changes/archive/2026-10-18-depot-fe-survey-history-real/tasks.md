# Tasks

## 1. Backend (`SolutionDepot/`)

- [x] 1.1 Không sửa backend. Xác nhận `GET /api/DepotJobs` (không lọc) trả kèm `survey` và `gateInEirNo` cho hồ sơ đã nộp phiếu.

## 2. Frontend (`fontend/`)

- [x] 2.1 `SurveyModulePage`:
  - state `historySurveys` + `refreshSurveyHistory()` (mọi hồ sơ, giữ `survey && status !== 'SURVEYING'`);
  - `mapJobToHistory` không dùng giá trị tạm, thêm `jobStatus`, `eeirNo = gateInEirNo`;
  - tải khi mở tab Lịch sử và sau khi nộp phiếu;
  - truyền vào `SurveyHistoryTable`, bỏ `onTransferToOperation`.
  - Kiểm tra: type-check không lỗi.
- [x] 2.2 `SurveyHistoryTable`:
  - cột *Trạng thái hồ sơ* (nhãn tiếng Việt);
  - lọc Từ ngày / Đến ngày theo ngày giám định giờ VN;
  - dòng báo trống;
  - bỏ prop + nút *Chuyển Khai Thác*.
  - Kiểm tra: type-check không lỗi.
- [x] 2.3 Xuất CSV thật theo `filtered` (BOM UTF-8, escape, tên `lich-su-giam-dinh-YYYYMMDD.csv`); không có dòng thì báo không có dữ liệu để xuất.
- [x] 2.4 Rà chỗ gọi `handleTransferToOperation`: không còn thì xoá; còn thì giữ và ghi lại trong báo cáo. Kiểm tra: `npx tsc --noEmit -p .` không lỗi.

## 3. Kiểm thử (giao diện http://127.0.0.1:3000, admin)

- [x] 3.1 Mở tab Lịch sử:
  - hiện đủ phiếu đã nộp trên local (SUDU3070783, BMOU1675248, WHLU4254283) với đúng số phiếu, ngày, người giám định, trạng thái hồ sơ;
  - không có nút *Chuyển Khai Thác*;
  - đây là dữ liệu thật, chỉ xem, không bấm thao tác thay đổi.
- [x] 3.2 Tạo 1 container test `QASH…` Gate-In (đang chờ giám định, chưa nộp) và lưu nháp phiếu cho nó qua API: container này **không** xuất hiện trong lịch sử.
- [x] 3.3 Lọc ngày 17/10/2026–17/10/2026: chỉ còn 2 phiếu ngày 17/10. Lọc 18/10: chỉ phiếu ngày 18/10. Xoá lọc: đủ lại.
- [x] 3.4 Xuất CSV khi đang lọc: tải được file, đúng số dòng đang lọc, tiêu đề tiếng Việt đọc được (kiểm BOM + nội dung). Lọc không khớp gì rồi bấm xuất: báo không có dữ liệu, không tải file.
- [x] 3.5 Dọn dữ liệu test: xoá hồ sơ / phiếu nháp / nhật ký của `QASH…`; xác nhận DB không còn bản ghi test và 3 hồ sơ thật không đổi.

## Workflow follow-up

- Archive bằng `/opsx:archive depot-fe-survey-history-real`.
