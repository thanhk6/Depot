# Đồng bộ giao diện toàn app theo chuẩn "Dashboard ERP Tổng Quan"

> **HOÀN TẤT 2026-09-07.** Toàn bộ ~40 màn thật (mọi thứ App.tsx render được qua Sidebar) đã chuyển từ
> theme tối `slate-900/950` sang theme sáng theo chuẩn `dashboard/pages/DashboardPage.tsx`. Chi tiết quá
> trình + phát hiện quan trọng ở cuối file.

## Chuẩn tham chiếu (rút ra trực tiếp từ `DashboardPage.tsx`)

### Banner đầu trang

```tsx
<div className="p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div className="space-y-2 relative z-10">
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200 text-xs font-bold font-mono">
      <IconRiêngCủaMàn className="w-3.5 h-3.5" />
      <span>NHÃN PHỤ VIẾT HOA</span>
    </div>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">TIÊU ĐỀ MÀN</h2>
    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">Mô tả ngắn chức năng màn.</p>
  </div>
  <div className="flex items-center gap-3 relative z-10">
    <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer">...</button>
    <button className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 shadow-sm transition flex items-center gap-2 cursor-pointer">...</button>
  </div>
</div>
```

Áp dụng đầy đủ cho các màn làm **tay** (Gate-In, Gate-Out, Survey, Operation, Notification/Zalo,
Warehouse). Các màn làm bằng **bulk sed** (xem phương pháp bên dưới) giữ nguyên bố cục banner gốc của
từng màn, chỉ đổi màu nền/chữ/viền — không ép về đúng khuôn JSX này, vì khối lượng quá lớn để viết lại
tay từng banner. Kết quả vẫn đạt đúng mục tiêu "toàn bộ nội dung nền sáng", chỉ khác đôi chỗ về bố cục
banner chi tiết so với khuôn mẫu ở trên.

### Nội dung bên trong

- Panel: `bg-slate-900/950` → `bg-white`/`bg-slate-50`; border: `border-slate-800/700` → `border-slate-200`
- Chữ: `text-white` → `text-slate-900` **CHỈ trên nền sáng** — KHÔNG đổi trên nút nền màu bão hòa
  (`bg-blue-600`, gradient...)
- Badge 3 lớp: `bg-{color}-950 text-{color}-300 border-{color}-800` → `bg-{color}-50 text-{color}-700
  border-{color}-200`
- Icon giữ nguyên độ đậm `-400/-500`; chữ số liệu chính tăng từ `-400` lên `-600/-700`
- **2 ngoại lệ giữ tối ở MỌI màn:** backdrop modal (`bg-slate-900/70 backdrop-blur-sm`) và overlay/badge
  nằm trên ảnh chụp thật (`bg-black/70`, `bg-slate-950/80`) — không đổi theo theme sáng.
- **Sidebar chính** (`components/layout/Sidebar.tsx`, nền `#0B2A43` xanh navy đậm) là **ngoại lệ cố ý**,
  không thuộc phạm vi dự án này — đây là thanh điều hướng thương hiệu cố định, thiết kế "sidebar tối +
  nội dung sáng" là chủ đích, không phải tàn dư theme cũ.

## Phương pháp (2 giai đoạn)

**Giai đoạn 1 (Gate-In, Gate-Out, Notification/Zalo banner, Warehouse banner, Survey/Operation banner):**
sửa tay từng khối JSX bằng `Edit`, viết lại đúng khuôn banner chuẩn ở trên. Phù hợp khi cần bố cục banner
đẹp, nhất quán tuyệt đối — nhưng chậm, không khả thi cho ~120 file còn lại.

**Giai đoạn 2 (toàn bộ phần còn lại — Warehouse content, Customer, Master Data, System, Billing, Report,
Cleaning, Payment, Container, Yard, Forklift, Estimate, Repair, QC, Shipping API, Notification pages con,
Zalo pages con):** dùng script bulk `sed` (`light-theme-convert.sh`, xem quy tắc dưới) áp cho từng thư
mục module, sau đó `tsc --noEmit` + `grep` quét lại để bắt lỗi, sửa tay các trường hợp sót.

### Quy tắc sed (rút ra qua nhiều lần vấp lỗi thật, xem lịch sử bug bên dưới)

```
KEEP_WHITE = cursor-pointer | bg-gradient | bg-(ACCENT_COLOR)-[6-9]00   # ACCENT_COLOR KHÔNG gồm slate/gray/zinc/neutral/stone!

1. Trên dòng có bg-slate-900|950  → LUÔN đổi text-white thành text-slate-900 (bất kể có cursor-pointer)
2. Trên các dòng còn lại          → chỉ đổi text-white thành text-slate-900 nếu KHÔNG khớp KEEP_WHITE
3. bg-slate-900 → bg-white ; bg-slate-950 → bg-slate-50 ; bg-slate-800/700 → bg-slate-100/200
4. border-slate-800/700 → border-slate-200 ; divide-slate-800 → divide-slate-200
5. text-slate-300 → text-slate-700 ; text-slate-400 → text-slate-500 ; text-slate-200 → text-slate-700
6. Badge màu (không phải slate): -950→-50, -900→-100, -300→-700, -400→-600 (giữ nguyên tên màu)
7. shadow-{màu}-nnn (glow tối) → xoá hẳn
```

**Sau MỖI module bắt buộc:**
1. `cd fontend && npx tsc --noEmit` — phải 0 lỗi.
2. `grep` quét lại `bg-white.*text-white|text-white.*bg-white` (và biến thể `bg-slate-50`) — bắt các ô
   `<select>`/input có `cursor-pointer` mà KEEP_WHITE lỡ giữ nhầm `text-white` trên nền đã sáng (bug lặp
   lại 3 lần: `StaffRealtimeReportTab.tsx`, `MoveContainerModal.tsx`/`ForkliftDispatchModal.tsx`,
   `StockTransactionsTab.tsx`/`StockBalanceTab.tsx` — luôn là `<select>` có class
   `bg-white border border-slate-200 rounded-xl ... cursor-pointer` bị hiểu nhầm là nút solid).
3. `grep` quét lại toàn bộ token tối còn sót (`bg-slate-900|950|800`, `border-slate-800|700`) — vá thêm
   nếu sed bỏ sót biến thể lạ.

## Phát hiện quan trọng: 1 cây thư mục lớn là DEAD CODE, đã loại khỏi phạm vi

Khi quét lần cuối `src/components/`, phát hiện **`src/components/tabs/*` (18 file) + toàn bộ
`src/features/*` (16 file `index.ts` chỉ re-export từ `components/tabs/`)** hoàn toàn KHÔNG được
`App.tsx` import — đây là 1 bản triển khai cũ/song song, đã bị thay thế hoàn toàn bởi `src/modules/*`
nhưng chưa từng bị xoá. Đã xác nhận qua `grep` tìm import trong `App.tsx` và toàn bộ `src/modules/`,
không có bất kỳ tham chiếu nào. **Không đụng vào các file này** — chuyển màu cho code không ai nhìn thấy
là lãng phí công sức, không mang lại giá trị gì cho người dùng.

Cùng nhóm "orphaned, không đổi màu" (đã xác nhận qua grep, không ai import): `components/Sidebar.tsx`
(bản trùng tên với `components/layout/Sidebar.tsx` — file `layout/` mới là bản thật đang chạy),
`AccessDeniedScreen.tsx`, `RoleBanner.tsx` (đã ghi nhận từ trước, xem `project-backend-audit`),
`Button/Button.tsx`, `Card/Card.tsx`, `Modal/Modal.tsx` (bản gốc, khác `common/Modal/Modal.tsx`),
`common/FileUpload/FileUpload.tsx`, `HeaderNavbar.tsx`, `ToolbarSubheader.tsx`, `JobLifecycleBar.tsx`,
`layout/UserMenu.tsx`, `layout/Breadcrumb.tsx`, `common/Drawer/Drawer.tsx`, `common/EmptyState/EmptyState.tsx`.

**2 component chung THẬT SỰ có dùng** (đã kiểm tra qua `App.tsx`/`src/modules` import): `layout/Sidebar.tsx`
(cố ý giữ tối, xem trên), `LoginScreen.tsx` + `UserAccountMenu.tsx` (đã sạch, không có token tối thật —
chỉ vài icon `-400` hợp lệ), `common/WorkflowDiagram/GateInSurveyWorkflowDiagram.tsx` (dùng trong
Dashboard, đã sạch), `common/ImageViewer/ImageViewer.tsx` (dùng trong `ContainerDetailPage.tsx` — **cố ý
giữ chrome tối** vì đây là lightbox xem ảnh, cùng quy tắc "overlay trên ảnh thật giữ tối"),
`common/DataTable/DataTable.tsx` (dùng trong `ContainerListPage.tsx`, đã sạch).

## Bảng tiến độ cuối cùng — 100% các màn thật đã xong

| Nhóm | Màn | Phương pháp | Ghi chú |
|---|---|---|---|
| — | Dashboard | Chuẩn gốc | Không đổi |
| Thông Báo/Zalo | Dashboard, 6 tab Thông Báo con, 5 trang Zalo, `NotificationHeader` | Tay (banner) + sed (nội dung) | Phát hiện: chỉ banner + Dashboard tab đã sáng sẵn, 15 trang con còn lại vẫn tối — đã sed xong toàn bộ |
| Warehouse | Header + 5 tab + ~19 modal (24 file) | Tay (banner) + sed (24 file nội dung) | Module lớn thứ 2, đã xong trọn vẹn |
| Survey | 13 file | Đã xong từ dự án trước (`project-survey-full-light-theme`) | Chỉ làm lại banner lần này |
| Operation | 6 file | Đã xong từ dự án trước | Chỉ làm lại banner lần này |
| Gate-In | 1 file (1795 dòng) | Tay hoàn toàn | Banner + 5 sub-tab + 2 modal |
| Gate-Out | 3 file (~1600 dòng) | Tay hoàn toàn | Banner + 4 tab + 2 modal, giữ nguyên "chứng từ in ấn" nền trắng gốc |
| Cleaning | 5 file | Sed | |
| Payment | 1 file | Sed | |
| Container | 2 file | Sed | |
| Yard | 15 file | Sed | Canvas Konva (`YardCanvasKonva.tsx`) dùng `fill` hex riêng, không phải Tailwind — giữ nguyên nền tối cố ý cho hiệu ứng bản đồ, ngoài phạm vi sed |
| Forklift | 5 file | Sed | |
| Estimate | 5 file | Sed | |
| Approval | 1 file | Không cần đổi | Đã sáng sẵn từ trước |
| Repair | 7 file | Sed | 2 modal ảnh (`CaptureAfterPhotoModal`, `PhotoCompareModal`) giữ nguyên overlay tối trên ảnh |
| QC | 4 file | Sed | |
| Shipping API | 2 file | Sed | |
| Billing | 12 file | Sed | |
| Report | 3 file | Sed | |
| Customer | 27 file | Sed | Module lớn nhất (1175 chỗ ban đầu) |
| Master Data | 9 file | Sed | 5 file khác (Damage/Grade/Standard/RepairCode Master) đã sáng sẵn từ dự án Survey |
| System | 7 file | Sed | |

`tsc --noEmit` toàn dự án: **0 lỗi** sau khi hoàn tất tất cả các module trên.

## Nếu cần làm tiếp trong tương lai

Không còn màn thật nào cần đổi. Nếu muốn nâng cấp thêm:
1. Đưa banner của các màn làm bằng sed (Cleaning, Payment, Yard...) về đúng khuôn JSX chuẩn Dashboard ở
   đầu file này (hiện chúng chỉ đổi màu, chưa đổi bố cục banner) — việc này KHÔNG bắt buộc, chỉ để đồng
   bộ tuyệt đối 100% bố cục.
2. Nếu người dùng xác nhận `src/components/tabs/*` + `src/features/*` thật sự không cần giữ lại nữa, có
   thể xoá hẳn (đã xác nhận orphaned qua grep, nhưng KHÔNG tự ý xoá khi chưa hỏi — xem quy tắc an toàn
   chung của phiên làm việc).
