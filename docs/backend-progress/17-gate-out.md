# 17-20 — Nhóm CỔNG XUẤT & GATE-OUT (gộp 1 file)

4 tab menu (`gate_out` Tổng Quan, `gate_out_ready` Vỏ Chờ Cấp, `gate_out_lane` Tiếp Nhận Làn Cổng Xuất,
`gate_out_history` Nhật Ký Xuất & Phiếu e-EIR) đều render **cùng 1 component** `GateOutPage.tsx`
(`App.tsx` chỉ đổi `initialSubTab`: `OVERVIEW` / `READY_LIST` / `GATE_LANE` / `HISTORY`) → gộp audit
vào 1 file duy nhất theo đúng ghi chú ở `INDEX.md` (không tạo file rỗng cho từng tab).

## Frontend gọi gì

```ts
containerApi.getById(targetCont.containerNo)          // tra Job SQL trước khi Gate-Out
apiClient.post(`/DepotJobs/${jobId}/gate-out`, {...})  // POST trực tiếp, không qua wrapper containerApi
```

Đây là **lệnh gọi backend thật duy nhất** trong toàn bộ 4 tab (đã `grep` cả module `gate_out`). Danh
sách "Vỏ Chờ Cấp" (`readyContainers`) chỉ lọc lại `containers` prop đã tải sẵn từ `App.tsx`, không gọi
API riêng.

## Đối chiếu backend

- `POST /api/DepotJobs/{id}/gate-out` → `GateOutAsync`: yêu cầu `Job.Status == "READY_FOR_OUT"` (đúng
  giá trị QC pass set ở màn 15), `TruckPlate`/`DriverName` không rỗng → cập nhật `GateOutTruckPlate/
  DriverName/TrailerPlate/SealNo`, sinh `GateOutEirNo`, giải phóng `YardPosition` đang chiếm bởi
  container này. Field request (`truckPlate`, `driverName`, `trailerPlate`, `sealNo`) khớp đúng
  `GateOutRequest`. ✅

## Bug đã sửa

1. **Container đã QC đạt biến mất khỏi danh sách "Vỏ Chờ Cấp" sau khi tải lại trang.**
   `readyContainers` (dùng cho tab `gate_out_ready`) lọc `containers` theo danh sách trạng thái
   `['READY_FOR_USE', 'REPAIRED', 'QC_PASSED', 'APPROVED', 'IN_YARD']` — **thiếu đúng giá trị backend
   thật sự set khi QC đạt** (`CompleteQcInspectionAsync` ở màn 15 set `Job.Status = "READY_FOR_OUT"`,
   không phải `"READY_FOR_USE"`). Trong cùng phiên làm việc, bug bị che khuất vì `App.tsx` cập nhật lạc
   quan cục bộ bằng đúng nhãn sai `'READY_FOR_USE'` (xem ghi chú "nit" ở 15-qc.md) — nhưng ngay khi tải
   lại trang (containers nạp thật từ `GET /api/DepotJobs`, trả `status: "READY_FOR_OUT"`), container đủ
   điều kiện xuất cổng hoàn toàn biến mất khỏi danh sách, chặn hẳn luồng nghiệp vụ Gate-Out.
   - Sửa `GateOutPage.tsx`: thêm `c.status === 'READY_FOR_OUT'` vào điều kiện lọc `readyContainers`,
     giữ nguyên các giá trị khác để không phá luồng optimistic-update hiện tại.

## Trạng thái: ✅ Xong

- [x] `POST /api/DepotJobs/{id}/gate-out` — khớp, không cần sửa
- [x] Sửa bug lọc sai status ở `readyContainers` (`gate_out_ready`)
- [x] Không cần build lại backend (chỉ sửa frontend, TypeScript, không có bước build riêng bắt buộc)
