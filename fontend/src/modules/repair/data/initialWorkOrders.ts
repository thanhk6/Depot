import { ContainerRecord } from '../../../services/mockDataStore';
import { WorkOrderRecord, WorkOrderRepairItem, RepairPhoto } from '../types/repair';

// Dựng Work Order từ dữ liệu container THẬT (hồ sơ giám định + lệnh sửa chữa). Trước đây hàm này tự bịa
// mã sửa chữa (R01/F03), vật tư, giờ công, thợ, mốc thời gian, độ ưu tiên, hạn SLA và 1 hạng mục mẫu khi
// container không có hư hỏng — giờ trường nào không có nguồn thật thì để trống.
export const generateWorkOrdersFromContainers = (containers: ContainerRecord[]): WorkOrderRecord[] => {
  return containers
    // Chỉ container hãng tàu ĐÃ DUYỆT báo giá (backend ApproveEstimateAsync → REPAIRING) hoặc đang chờ QC sau sửa
    // (CompleteRepairAsync → QC_PENDING). Trước đây lọc cả mọi container có condition 'DM' — container còn ở bước
    // báo giá (ESTIMATING, chưa duyệt) cũng hiện bên Sửa chữa.
    .filter((c) => c.status === 'REPAIRING' || c.status === 'QC_PENDING' || c.status === 'WAITING_QC')
    .map((c) => {
      const woNumber = c.workOrderDetails?.workOrderNo || '';
      const technician = c.workOrderDetails?.technician || '';

      let status: WorkOrderRecord['status'] = 'WAITING';
      if (c.status === 'QC_PENDING' || c.status === 'WAITING_QC') {
        status = 'QC_PENDING';
      } else if (c.status === 'READY_FOR_USE' && c.condition === 'AV') {
        status = 'QC_PASSED';
      } else if (c.status === 'REPAIRING') {
        // Hãng tàu đã duyệt nhưng thợ chưa bắt đầu (chưa có RepairOrder) → Chờ sửa; đã bắt đầu → Đang sửa.
        status = c.workOrderDetails ? 'IN_PROGRESS' : 'WAITING';
      }

      // Hạng mục sửa chữa = các dòng của BÁO GIÁ hãng tàu đã duyệt (Damage / Repair code, Rep. loc, PCS — chuẩn AEMS),
      // vì thợ phải sửa đúng phạm vi hãng tàu đã duyệt. Hồ sơ cũ chưa có dòng báo giá thì lấy hư hỏng của phiếu giám định.
      const estimateLines = c.estimateDetails?.approvalStatus === 'APPROVED' ? c.estimateDetails.items || [] : [];
      const fromEstimate: WorkOrderRepairItem[] = estimateLines.map((line, idx) => ({
        id: `ITEM-${c.containerNo}-${idx + 1}`,
        itemNo: idx + 1,
        componentCode: line.locationCode,
        componentNameVi: line.locationName || line.locationCode,
        locationCode: line.locationCode,
        locationVi: line.locationName || line.locationCode,
        damageCode: line.damageCode,
        damageNameVi: '',
        repairCode: line.repairCode,
        repairNameVi: line.description,
        description: line.description,
        quantity: line.quantity,
        unit: 'PCS',
        status: status === 'QC_PENDING' || status === 'QC_PASSED' ? 'COMPLETED' : 'PENDING',
        technician: technician || undefined,
        materialsUsed: [],
        photos: []
      }));

      const items: WorkOrderRepairItem[] = fromEstimate.length > 0 ? fromEstimate : (c.surveyDetails?.damages || []).map((dmg, dIdx) => {
        const itemId = `ITEM-${c.containerNo}-${dIdx + 1}`;
        const photos: RepairPhoto[] = dmg.image
          ? [{
              id: `P-BEF-${c.containerNo}-${dIdx + 1}`,
              containerNo: c.containerNo,
              workOrderNo: woNumber,
              repairItemId: itemId,
              // Ảnh giám định chỉ để đối chiếu — KHÔNG tính là ảnh trước sửa (thợ phải tự chụp khi bắt tay vào sửa).
              type: 'ADDITIONAL',
              url: dmg.image,
              photographer: c.surveyDetails?.surveyorName || '',
              timestamp: c.surveyDetails?.surveyDate || '',
              description: `Ảnh giám định: ${dmg.description}`
            }]
          : [];

        return {
          id: itemId,
          itemNo: dIdx + 1,
          componentCode: '',
          componentNameVi: dmg.location || '',
          locationCode: '',
          locationVi: dmg.location || '',
          damageCode: dmg.code || '',
          damageNameVi: dmg.description || '',
          repairCode: '',
          repairNameVi: '',
          description: dmg.description,
          quantity: 1,
          unit: '',
          status: status === 'QC_PENDING' || status === 'QC_PASSED' ? 'COMPLETED' : 'PENDING',
          technician: technician || undefined,
          materialsUsed: [],
          photos
        };
      });

      return {
        id: `WO-REC-${c.id}`,
        workOrderNo: woNumber,
        containerId: c.id,
        containerNo: c.containerNo,
        estimateNo: c.estimateDetails?.estimateNo || '',
        shippingLine: c.shippingLine,
        isoCode: c.isoCode || '',
        size: c.size || '',
        type: c.type || '',
        yardLocation: c.yardLocation || { block: '', bay: '', row: '', tier: '' },
        priority: 'NORMAL',
        status,
        assignedTeam: '',
        leadTechnician: technician,
        assignedAt: c.workOrderDetails?.assignedAt || '',
        deadline: '',
        items,
        additionalReports: [],
        totalEstimatedHours: c.estimateDetails?.labourHours || 0
      };
    });
};
