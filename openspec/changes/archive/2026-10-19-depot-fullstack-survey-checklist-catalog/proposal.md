# Proposal

## Why

Danh sách khu vực Checklist giám định (danh mục `SURVEY_CHECKLIST`, hiện 11 khu vực IICL-6) chỉ được tạo sẵn khi hệ thống khởi động, nên không có màn nào để admin đổi tên, thêm / bớt khu vực hay đổi trạng thái mặc định. Từ change `depot-fullstack-survey-checklist-sync`, server bắt mọi phiếu phải có đúng các khu vực đang dùng của danh mục và vị trí hư hỏng gắn vào khu vực. Vì vậy sửa danh mục này cần có quy tắc, để không làm hỏng vị trí đang gắn hay các phiếu đang dở.

## What Changes

- **Màn mới "DM Khu Vực Checklist Giám Định"**:
  - nằm ở sidebar nhóm **DANH MỤC MASTER DATA** và trong trang *Tất Cả Danh Mục* (nhóm *Danh mục khai thác & kỹ thuật vỏ*);
  - bảng: thứ tự, mã, tên tiếng Việt, tên tiếng Anh, trạng thái mặc định, số vị trí đang gắn, trạng thái;
  - thêm / sửa / tạm ngưng / bật lại / xoá; mỗi thao tác lưu riêng dòng đó.
- **Quy tắc ở backend**, chỉ áp cho danh mục `SURVEY_CHECKLIST`, trả 400 kèm lý do:
  - mã chỉ gồm chữ in hoa, số, gạch dưới; **không đổi mã** sau khi tạo;
  - trạng thái mặc định chỉ nhận Đạt (PASS) hoặc N/A (NA);
  - không tạm ngưng / xoá khu vực đang có vị trí hư hỏng gắn vào; không tạm ngưng / xoá khu vực đang dùng cuối cùng;
  - không xoá khu vực đã có trong phiếu giám định (chỉ được tạm ngưng).
- **Phiếu đang giám định dở** (nháp): khi mở, form tự thêm khu vực mới (theo trạng thái mặc định) và bỏ khu vực đã tạm ngưng, để lưu không bị server từ chối. Phiếu đã nộp giữ nguyên.
- Tiêu đề "Checklist 11 Khu Vực" ở form giám định và "9 Khu Vực" ở màn *Thêm mới giám định* đổi theo số khu vực thật của danh mục.
- Ô chọn khu vực ở màn *DM Vị Trí Cấu Kiện* tự cập nhật sau khi danh mục khu vực đổi.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `container-survey`: thêm yêu cầu quản lý danh mục khu vực Checklist (quy tắc sửa / tạm ngưng / xoá) và đồng bộ khu vực cho phiếu nháp khi danh mục đổi.

## Impact

- **Màn hình:**
  - mới: *DM Khu Vực Checklist Giám Định* (`MasterDataPage`, sidebar *DANH MỤC MASTER DATA*);
  - sửa: form giám định (tiêu đề + đồng bộ khu vực khi mở nháp), *Thêm mới giám định* (tiêu đề), *DM Vị Trí Cấu Kiện* (danh sách khu vực tải lại).
- **API:** dùng lại `POST / PUT / DELETE /MasterData/catalog…` sẵn có (quyền `masterdata`). Không thêm endpoint. `MasterDataService` thêm kiểm tra riêng cho `SURVEY_CHECKLIST`.
- **Phân quyền:**
  - menu mới `survey_checklist` → quyền `masterdata` trong `menuPermissions.ts`;
  - `RolePermissions` không đổi vì API dùng chung quyền `MasterData`.
- **Dữ liệu:** không migration EF Core, không sửa dữ liệu cũ. 11 khu vực hiện có giữ nguyên.
- **Ngoài phạm vi:**
  - không sửa phiếu đã nộp;
  - không đổi ý nghĩa đặc biệt của mã `CLEANING` (khu vực Vệ sinh → phân loại CL);
  - không làm màn cho danh mục `QC_CHECKLIST`;
  - không sửa lỗi màn danh mục cũ lưu lại cả loạt dòng (`persistCatalog`); màn mới không dùng hàm đó.
