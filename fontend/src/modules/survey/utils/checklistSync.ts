import { DamageLocationMasterItem, DamageRecord, InspectionChecklistItem } from '../types';

// Tính lại Checklist khu vực từ danh sách hư hỏng, theo khu vực gắn ở danh mục Vị trí hư hỏng
// (DAMAGE_LOCATION.checklistZone) — trước đây là bảng ánh xạ gõ cứng mã mẫu cũ (ROOF, FRONT_W...) không khớp
// mã thật trong DB (RF1, FW1...), nên thêm hư hỏng không làm khu vực nào "Không Đạt" (depot-fullstack-survey-checklist-sync).
// Khu vực có hư hỏng → FAIL kèm số lỗi; khu vực do hệ thống đặt FAIL (số lỗi > 0) mà hết hư hỏng → về PASS;
// khu vực giám định viên tự tick FAIL (số lỗi 0) giữ nguyên. Server cũng tự đếm lại khi lưu.
export const recomputeChecklistFromDamages = (
  checklist: InspectionChecklistItem[],
  damages: DamageRecord[],
  locations: DamageLocationMasterItem[]
): InspectionChecklistItem[] => {
  const zoneOf = new Map(locations.map((l) => [l.code, l.checklistZone]));
  return checklist.map((zone) => {
    const count = damages.filter((d) => zoneOf.get(d.locationCode) === zone.zoneKey).length;
    if (count > 0) return { ...zone, status: 'FAIL', damageCount: count };
    return zone.damageCount > 0
      ? { ...zone, status: zone.status === 'FAIL' ? 'PASS' : zone.status, damageCount: 0 }
      : zone;
  });
};

// Phiếu nháp lưu theo danh mục khu vực cũ: giữ trạng thái các khu vực còn trong danh mục, thêm khu vực mới (theo
// trạng thái mặc định), bỏ khu vực đã tạm ngưng / xoá, sắp theo thứ tự danh mục — để lần lưu sau khớp đúng tập khu vực
// server yêu cầu (depot-fullstack-survey-checklist-catalog). Danh mục chưa tải xong (rỗng) thì giữ nguyên.
export const mergeChecklistWithTemplate = (
  saved: InspectionChecklistItem[],
  template: InspectionChecklistItem[]
): InspectionChecklistItem[] => {
  if (template.length === 0) return saved;
  const byKey = new Map(saved.map((z) => [z.zoneKey, z]));
  return template.map((t) => {
    const old = byKey.get(t.zoneKey);
    return old ? { ...old, zoneName: t.zoneName } : { ...t };
  });
};
