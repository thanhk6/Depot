# 02 — Sơ Đồ Vòng Đời Nghiệp Vụ (Workflow)

Menu: `workflow` → không phải route riêng, mở modal `BusinessWorkflowModal`
(`fontend/src/modules/system/components/BusinessWorkflowModal.tsx`) từ `App.tsx`
(`handleSelectTab`: tab `workflow` không set `activeTab`, chỉ `setIsWorkflowModalOpen(true)`).

## Frontend gọi gì

```ts
workflowApi.getDefinition()   // GET /workflow/definition — ĐANG DÙNG
workflowApi.getSummary()      // GET /workflow/summary    — khai báo ở workflow.api.ts nhưng
                               //   KHÔNG có nơi nào trong frontend gọi (đã grep toàn bộ `src`)
```

`BusinessWorkflowModal` có sẵn 15 bước workflow **hard-code cứng ở frontend** (id, number, title,
summary, details, nextSteps, icon, color...). Khi mount, gọi `getDefinition()`, nếu backend trả về
step nào trùng `id` thì **override phần business metadata** (`number, title, moduleTarget, summary,
details, nextSteps`) của step đó, giữ nguyên `icon/color/bg/borderColor` từ frontend — đúng như
comment trong code: `// UI owns icons/colors; backend owns workflow business metadata.`
Nếu API lỗi (catch) → chỉ `console.warn`, UI vẫn chạy bình thường với dữ liệu tĩnh của frontend.

## Đối chiếu backend

`WorkflowController` (`GET api/workflow/definition`, `GET api/workflow/summary`), phụ thuộc
`IDepotJobService` (đã đăng ký DI từ trước, không phải service mới).

- `GetDefinition()` trả `List<WorkflowStepDto>` hard-code 14 bước (`Depot.ViewModels/WorkflowViewModels.cs`
  — field `Id, Number, Title, ModuleTarget, Summary, Details, NextSteps`, camelCase tự động) — khớp
  đúng field mà `BusinessWorkflowModal` đọc để merge theo `id`.
- `GetSummary()` trả `WorkflowSummaryDto` (đếm `DepotJob` theo từng `Status` qua
  `IDepotJobService.GetAllJobsAsync()`) — khớp đúng field interface `WorkflowSummaryDto` khai báo ở
  `workflow.api.ts`, nhưng **hiện chưa có UI nào tiêu thụ** (dead endpoint, không phải bug — giữ
  nguyên, có thể dùng sau nếu thêm UI thống kê workflow).

## Bug đã sửa (lần 2, 2026-08-23) — lỗi build frontend, phát hiện khi chạy `tsc --noEmit` toàn dự án

Lần rà đầu (mục trên) chỉ build backend (`dotnet build`) mà chưa chạy typecheck frontend
(`npm run lint` = `tsc --noEmit`). Khi chạy typecheck toàn bộ `fontend` (trong lúc rà lại màn
Dashboard), phát hiện **màn `workflow` build lỗi 29 dòng TS**, gốc rễ:

- `fontend/src/api/index.ts` (file facade export API) thiếu `export type { WorkflowStepDto,
  WorkflowSummaryDto }` từ `./workflow.api` — trong khi `BusinessWorkflowModal.tsx` import
  `type WorkflowStepDto` thẳng từ `'../../../api'`. Thiếu export này khiến TS coi
  `WorkflowStepViewModel extends WorkflowStepDto` là mở rộng từ type rỗng/không tồn tại, kéo theo
  toàn bộ property (`id, number, title, summary, details...`) bị báo "does not exist".
- Sau khi thêm export, còn 1 lỗi: `response.statusCode` không tồn tại trên `ApiResponse<T>` (đúng
  như ghi chú ở [00-quy-tac-backend.md](00-quy-tac-backend.md) mục 2 — type `ApiResponse<T>` khai
  báo lý thuyết, không khớp hình dạng thật `{statusCode, message, data}`). Toàn bộ nơi khác trong
  codebase đều né lỗi này bằng cách gõ tay `.then((response: any) => ...)`; `BusinessWorkflowModal`
  là nơi duy nhất gọi mà không cast, nên lỗi chỉ lộ ra ở đây. Đã sửa theo đúng pattern đang dùng ở
  các file khác (thêm `: any` cho callback), **không** đổi type `ApiResponse<T>` dùng chung (đổi
  type chung phải sửa đồng bộ 24 file, cần hỏi trước theo mục 7).

Đã chạy `npm run lint` (tsc --noEmit) toàn bộ `fontend` sau khi sửa: 0 lỗi.

## Bug đã sửa (lần 1)

`GetDefinition()` chỉ liệt kê 14/15 bước — thiếu step `INTEGRATION` (bước cuối cùng, số 15, mà
frontend có sẵn trong danh sách tĩnh). Vì tài liệu ghi rõ "backend owns workflow business metadata",
đây là thiếu sót nội dung (không phải lỗi runtime — frontend vẫn hoạt động nhờ fallback tĩnh, nhưng
backend không hoàn chỉnh theo đúng vai trò của nó). Đã bổ sung:

```csharp
new() { Id = "BILLING", ..., NextSteps = new() { "INTEGRATION" } },  // trước đó NextSteps rỗng
new() { Id = "INTEGRATION", Number = "15", Title = "INTEGRATION – ĐỒNG BỘ EDI/API/WEBHOOK",
    ModuleTarget = "system", Summary = "Đồng bộ dữ liệu thời gian thực với hãng tàu, cảng biển và ngân hàng.",
    Details = new() { "Chuẩn EDI hàng hải: CODECO, COARRI, WESTIM.",
        "RESTful API/Webhook: VietQR, hải quan điện tử.", "Giám sát nhật ký đồng bộ hệ thống." },
    NextSteps = new() }
```

## Trạng thái: ✅ Xong

- [x] Đối chiếu `getDefinition()` — field khớp, merge theo `id` hoạt động đúng
- [x] Đối chiếu `getSummary()` — field khớp (endpoint hiện chưa có UI dùng, không phải lỗi)
- [x] Bổ sung bước `INTEGRATION` còn thiếu trong `GetDefinition()` + nối `NextSteps` của `BILLING`
- [x] Build lại `Depot.BackendApi`: 0 lỗi (5 warning nullable có sẵn từ trước, không liên quan)
- [x] Sửa lỗi build frontend (`api/index.ts` thiếu export `WorkflowStepDto` + cast `any` thiếu ở
      `BusinessWorkflowModal.tsx`) — `npm run lint` (tsc --noEmit) toàn bộ frontend: 0 lỗi
- [x] Đã chạy thử backend + frontend dev server thật để xác nhận API phản hồi đúng (xem
      [01-dashboard.md](01-dashboard.md) mục "Rà lại lần 2") — chưa chụp được screenshot UI do môi
      trường không có trình lái trình duyệt (`chromium-cli`/Playwright)
