import { Estimate } from '../types';

// Dữ liệu gửi backend (EstimateViewModel) từ 1 báo giá trên màn hình — dùng chung cho form lập 1 container và
// form lập nhiều container. Server tự tính lại công / vật tư / VAT theo AEMS, số tổng gửi lên chỉ để đối chiếu.
export const buildEstimatePayload = (est: Estimate) => ({
  estimateNo: est.estimateNo,
  totalLaborCost: est.laborCost || 0,
  totalMaterialCost: est.materialCost || 0,
  totalTax: est.vatAmount,
  grandTotal: est.totalAmount,
  currency: est.currency,
  notes: est.notes || null,
  laborRate: est.laborRate || 0,
  surveyReference: est.surveyReference || null,
  inspectionPhotos: (est.inspectionPhotos || []).filter(Boolean),
  repairMode: est.repairMode || null,
  cause: est.cause || null,
  shopCode: est.shopCode || null,
  vendorRefNo: est.vendorRefNo || null,
  preparationHours: est.preparationHours || 0,
  ordinaryHours: est.ordinaryHours || 0,
  ot1Hours: est.ot1Hours || 0,
  ot2Hours: est.ot2Hours || 0,
  ot3Hours: est.ot3Hours || 0,
  items: est.items.map((item) => ({
    itemDescription: item.description || item.repairMethod,
    locationCode: item.damageLocationCode || null,
    locationName: item.damageLocationName || null,
    damageCode: item.damageCode || null,
    damageName: item.damageName || null,
    repairCode: item.repairCode || null,
    repairMethod: item.repairMethod || null,
    unit: item.unit || null,
    vatPercent: Math.round((est.vatRate ?? item.vatRate ?? 0) * 10000) / 100,
    tpi: item.tpi || null,
    manHoursPerPiece: item.manHoursPerPiece || 0,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.amount
  }))
});

/** Mã báo giá theo ngày giờ địa phương: EST-yyyymmdd-xxxxx. */
export const newEstimateNo = (): string => {
  const now = new Date();
  const d = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `EST-${d}-${Math.floor(10000 + Math.random() * 90000)}`;
};
