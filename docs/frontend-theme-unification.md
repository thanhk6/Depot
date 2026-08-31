# Đồng bộ giao diện toàn app theo mẫu "THÔNG BÁO & ZALO GATEWAY"

Theo yêu cầu người dùng ngày 2026-08-24: lấy đúng phong cách banner của
`fontend/src/modules/notifications/components/NotificationHeader.tsx` (màn "THÔNG BÁO & ZALO GATEWAY")
làm chuẩn, áp dụng cho toàn bộ banner đầu trang của các màn khác trong app. Người dùng đã xác nhận 2 quyết
định quan trọng — **đọc kỹ trước khi sửa tiếp**:

1. **Cách làm:** tự sửa tuần tự từng đợt qua nhiều lượt hội thoại (không dùng Workflow đa-agent).
2. **Bảng màu chuẩn:** giữ nguyên **y hệt** 2 tầng màu của trang tham chiếu — banner trên cùng nền
   **trắng** (`bg-white`) với icon logo trong khối gradient **xanh dương → sky → chàm**
   (`bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600`), dải sub-tab ngay bên dưới đổi hẳn sang
   nền **tối** (`slate-800/900`). Kể cả 1 lỗi tương phản nhỏ có sẵn trong trang tham chiếu (dải tab dùng
   chữ sáng `text-slate-400`/hover `bg-slate-800/40` nhưng nằm ngay dưới banner trắng, và dòng trạng thái
   kết nối dùng `text-emerald-400` hơi khó đọc trên nền `bg-slate-50` gần trắng) — **không tự ý sửa các
   lỗi này**, chỉ nhân bản đúng y hệt sang các màn khác.

## Khuôn mẫu chuẩn (copy đúng cấu trúc này, chỉ đổi icon/tiêu đề/nút hành động/danh sách tab riêng từng màn)

```tsx
<div className="bg-white border-b border-slate-200 -mt-3 -mx-3 sm:-mt-4 sm:-mx-4 md:-mt-6 md:-mx-6 mb-6 px-4 sm:px-6 pt-5 pb-0 shadow-sm">
  {/* Top Banner (nền trắng) */}
  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
          <IconRiêngCủaMàn className="w-6 h-6 text-sky-400" />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">TIÊU ĐỀ MÀN</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">Badge phụ</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Mô tả ngắn chức năng màn</p>
      </div>
    </div>
    {/* Nút hành động / trạng thái riêng của màn — giữ nguyên màu nghiệp vụ (emerald=thành công,
        rose=nguy hiểm, amber=cảnh báo...), chỉ đổi khung bố cục cho khớp */}
    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
      ...
    </div>
  </div>

  {/* Navigation Sub-Tabs (nền tối) */}
  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2 mt-1">
    {tabs.map((tab) => {
      const isActive = ...;
      return (
        <button className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border-b-2 ${
          isActive ? 'bg-slate-800/80 text-white border-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
        }`}>
          {tab.icon}<span>{tab.label}</span>
          {tab.badge && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>{tab.badge}</span>
          )}
        </button>
      );
    })}
  </div>
</div>
```

Ghi chú: `-mt-3 -mx-3 sm:-mt-4 sm:-mx-4 md:-mt-6 md:-mx-6` là margin âm để banner tràn sát mép layout cha
(bù lại padding của khung `<main>` bên ngoài) — chỉ copy đúng nếu component khác cũng nằm trực tiếp trong
cùng 1 kiểu layout cha như `NotificationModule.tsx`/`ZaloModule.tsx` (`<div className="space-y-6">` phẳng,
không lồng thêm padding riêng). Nếu màn đích có layout cha khác, kiểm tra lại margin âm cho khớp trước khi
copy y nguyên.

## Tiến độ (cập nhật mỗi lần "làm tiếp")

Ký hiệu: ✅ Xong · 🔜 Chưa làm

| # | Component / file | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | `notifications/components/NotificationHeader.tsx` | ✅ | Đây là trang **chuẩn tham chiếu**, không cần đổi. |
| 1 | ~~`zalo/components/ZaloHeader.tsx`~~ | ✅ | Đã đổi màu 2026-08-24, sau đó **gộp hẳn vào `NotificationHeader.tsx`** cùng ngày theo yêu cầu người dùng (2 màn Zalo Gateway trùng lặp) — file đã bị xoá, không còn tồn tại. Xem `docs/frontend-zalo-notifications-merge.md`. |
| 2 | `warehouse/components/WarehouseHeader.tsx` | ✅ | Đã đổi 2026-08-24. Giữ nguyên 3 nút hành động màu nghiệp vụ (emerald/amber/sky). |
| 3 | `gate/pages/GateInPage.tsx` (banner nội tuyến, không phải component Header riêng) | 🔜 | Banner + dải sub-tab viết thẳng trong file trang (không tách Header riêng như các màn khác) — cần đọc kỹ trước khi tách sửa. |
| 4 | `gate_out/pages/GateOutPage.tsx` | 🔜 | |
| 5 | `survey/pages/SurveyModulePage.tsx` | ✅ | Đã đổi 2026-08-26. Banner nội tuyến (không tách Header riêng, giống Gate-In). Giữ nguyên 12 tab + badge và nút "+ Tạo Mới Giám Định Đầy Đủ" (amber). |
| 6 | `cleaning/pages/CleaningModulePage.tsx` | 🔜 | |
| 7 | `operation/pages/OperationPage.tsx` | ✅ | Đã đổi 2026-08-27 — làm luôn TOÀN BỘ nội dung (không chỉ banner) sang nền trắng theo yêu cầu người dùng "giống Giám Định", cùng phạm vi với dự án nền trắng riêng ở Survey. Đổi cả 5 component con: `GateInQueueTable.tsx`, `QuickQrModal.tsx`, `ServiceOrderListTable.tsx`, `ServiceOrderDetailModal.tsx`, `ServiceOrderFormModal.tsx`. |
| 8 | `payment/pages/PaymentPage.tsx` | 🔜 | |
| 9 | `container/pages/ContainerListPage.tsx` | 🔜 | |
| 10 | `yard/pages/YardMapPage.tsx` (`yard_map`) + `yard/pages/YardBlocksPage.tsx` (`yard_blocks`) | 🔜 | 2 file riêng biệt, sửa cả 2. |
| 11 | `forklift/pages/ForkliftPage.tsx` | 🔜 | |
| 12 | `estimate/pages/EstimatePage.tsx` | 🔜 | |
| 13 | `approval/pages/ApprovalPage.tsx` | 🔜 | |
| 14 | `repair/pages/RepairPage.tsx` | 🔜 | |
| 15 | `qc/pages/QCPage.tsx` | 🔜 | |
| 16 | `shipping_api/pages/ShippingApiPage.tsx` | 🔜 | |
| 17 | `billing/pages/BillingPage.tsx` | 🔜 | |
| 18 | `report/pages/ReportPage.tsx` | 🔜 | |
| 19 | `customer/pages/CustomerPage.tsx` | 🔜 | |
| 20 | `masterdata/pages/MasterDataPage.tsx` | 🔜 | Dùng chung cho 10 tab con Master Data. |
| 21 | `system/pages/SystemPage.tsx` | 🔜 | |
| 22 | `dashboard/pages/DashboardPage.tsx` | 🔜 | |

**Cách tiếp tục ở lượt sau:** mở file này, tìm dòng 🔜 đầu tiên, đọc file component tương ứng, áp khuôn
mẫu ở trên (giữ nguyên icon/tiêu đề/nút hành động/danh sách tab riêng của màn đó), chạy `tsc --noEmit` xác
nhận 0 lỗi, rồi đánh dấu ✅ + ghi chú ngắn gọn tương tự các dòng đã xong.
