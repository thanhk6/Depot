import { ContainerRecord } from '../../../services/mockDataStore';
import { WorkOrderRecord, WorkOrderRepairItem, RepairPhoto } from '../types/repair';

export const COMMON_DEPOT_MATERIALS = [
  { code: 'MAT-ST-01', name: 'Thép tấm tôn vách rãnh IICL 2.0mm', unit: 'Tấm' },
  { code: 'MAT-ST-02', name: 'Thép dập nóc rãnh 1.6mm', unit: 'Tấm' },
  { code: 'MAT-FL-01', name: 'Gỗ ván sàn ép Apitong 28mm (19 lớp)', unit: 'Tấm' },
  { code: 'MAT-WL-01', name: 'Que hàn điện chịu lực E7018 (3.2mm)', unit: 'Kg' },
  { code: 'MAT-WL-02', name: 'Dây hàn Mig CO2 mạ đồng 1.2mm', unit: 'Cuộn' },
  { code: 'MAT-PT-01', name: 'Sơn lót epoxy kẽm chống rỉ xám', unit: 'Lít' },
  { code: 'MAT-PT-02', name: 'Sơn phủ ngoại thất Polyurethane chuẩn RAL', unit: 'Lít' },
  { code: 'MAT-GK-01', name: 'Ron cao su cánh cửa EPDM chữ J', unit: 'Mét' },
  { code: 'MAT-SL-01', name: 'Keo trám khe hở Polyurethane Sikaflex', unit: 'Tuýp' },
  { code: 'MAT-SC-01', name: 'Vít bắn sàn tự khoan mạ kẽm M8x45', unit: 'Hộp (100 con)' },
  { code: 'MAT-LK-01', name: 'Chốt bản lề cửa inox 304', unit: 'Cái' }
];

export const SAMPLE_AFTER_PHOTOS = [
  {
    title: 'Hàn đắp & nắn phẳng tôn vách chuẩn IICL',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Sơn lót & phủ 2 lớp chống ăn mòn bề mặt',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Thay thế thanh sàn gỗ Apitong 28mm mới phẳng tuyệt đối',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Hoàn thiện mối hàn góc trụ Corner Post mài bóng',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
  }
];

export const generateWorkOrdersFromContainers = (containers: ContainerRecord[]): WorkOrderRecord[] => {
  return containers
    .filter((c) => c.status === 'REPAIRING' || c.status === 'APPROVED' || c.status === 'WAITING_QC' || c.condition === 'DM' || c.workOrderDetails)
    .map((c, index) => {
      const woNumber = c.workOrderDetails?.workOrderNo || `WO-20260816-0000${index + 1}`;
      const estNumber = c.estimateDetails?.estimateNo || `EST-${c.shippingLine}-${100 + index}`;
      
      let status: WorkOrderRecord['status'] = 'WAITING';
      if (c.status === 'WAITING_QC') {
        status = 'QC_PENDING';
      } else if (c.status === 'READY_FOR_USE' && c.condition === 'AV') {
        status = 'QC_PASSED';
      } else if (c.status === 'REPAIRING') {
        status = 'IN_PROGRESS';
      } else if (c.status === 'APPROVED') {
        status = 'WAITING';
      }

      // Generate repair items from survey damages or standard items
      const damages = c.surveyDetails?.damages || [];
      const items: WorkOrderRepairItem[] = damages.length > 0
        ? damages.map((dmg, dIdx) => {
            const isFirst = dIdx === 0;
            const itemStatus = status === 'QC_PENDING' || status === 'QC_PASSED'
              ? 'COMPLETED'
              : status === 'IN_PROGRESS' && isFirst
              ? 'IN_PROGRESS'
              : 'PENDING';

            const beforePhoto: RepairPhoto = {
              id: `P-BEF-${c.containerNo}-${dIdx + 1}`,
              containerNo: c.containerNo,
              workOrderNo: woNumber,
              repairItemId: `ITEM-${dIdx + 1}`,
              type: 'BEFORE',
              url: dmg.image || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
              photographer: c.surveyDetails?.surveyorName || 'Giám định viên e-EIR',
              timestamp: c.surveyDetails?.surveyDate || '2026-08-15 08:30',
              description: `Ảnh hiện trường trước sửa: ${dmg.description}`
            };

            const photos: RepairPhoto[] = [beforePhoto];

            // If completed or QC pending, add after photo
            if (itemStatus === 'COMPLETED' || status === 'QC_PENDING' || status === 'QC_PASSED') {
              photos.push({
                id: `P-AFT-${c.containerNo}-${dIdx + 1}`,
                containerNo: c.containerNo,
                workOrderNo: woNumber,
                repairItemId: `ITEM-${dIdx + 1}`,
                type: 'AFTER',
                url: SAMPLE_AFTER_PHOTOS[dIdx % SAMPLE_AFTER_PHOTOS.length].url,
                photographer: c.workOrderDetails?.technician || 'Hoàng Văn Sơn (Tổ EMR)',
                timestamp: '2026-08-15 11:30',
                description: `Ảnh sau hoàn tất thi công hạng mục ${dIdx + 1}`
              });
            }

            return {
              id: `ITEM-${c.containerNo}-${dIdx + 1}`,
              itemNo: dIdx + 1,
              componentCode: dIdx === 0 ? 'SPL' : 'FLR',
              componentNameVi: dmg.location || 'Vách Panel Trái',
              locationCode: dIdx === 0 ? 'PL' : 'FL',
              locationVi: dmg.location || 'Bên Trái Ngoài',
              damageCode: dmg.code || 'CUT',
              damageNameVi: dmg.description || 'Rách/Móp méo theo chuẩn IICL',
              repairCode: dIdx === 0 ? 'R01' : 'F03',
              repairNameVi: dIdx === 0 ? 'Cắt nắn ghép tôn sóng 2.0mm (Insert Panel)' : 'Thay ván sàn Apitong 28mm (Section replacement)',
              description: dmg.description,
              quantity: 1,
              unit: dIdx === 0 ? 'Tấm' : 'Thanh',
              status: itemStatus,
              startedAt: itemStatus !== 'PENDING' ? '2026-08-15 09:00' : undefined,
              completedAt: itemStatus === 'COMPLETED' ? '2026-08-15 11:30' : undefined,
              technician: c.workOrderDetails?.technician || 'Hoàng Văn Sơn (Tổ EMR)',
              executionNotes: itemStatus === 'COMPLETED' ? 'Đã hoàn tất cắt ghép nắn chuẩn sóng và sơn lót epoxy.' : undefined,
              actualHours: itemStatus === 'COMPLETED' ? 2.5 : undefined,
              materialsUsed: itemStatus === 'COMPLETED'
                ? [
                    { id: 'M-1', materialCode: 'MAT-ST-01', materialName: 'Thép tấm tôn vách rãnh IICL 2.0mm', quantity: 1, unit: 'Tấm' },
                    { id: 'M-2', materialCode: 'MAT-PT-01', materialName: 'Sơn lót epoxy kẽm chống rỉ xám', quantity: 0.5, unit: 'Lít' }
                  ]
                : [],
              photos
            };
          })
        : [
            {
              id: `ITEM-${c.containerNo}-1`,
              itemNo: 1,
              componentCode: 'SPL',
              componentNameVi: 'Vách hông trái (Side Panel Left)',
              locationCode: 'PL',
              locationVi: 'Vách Trái',
              damageCode: 'DENT',
              damageNameVi: 'Móp lõm sâu >50mm',
              repairCode: 'R01',
              repairNameVi: 'Nắn ép thủy lực & hàn gia cường (Straighten & Weld)',
              description: 'Nắn ép vách tôn rãnh sâu 55mm, hàn đắp mép móp',
              quantity: 1,
              unit: 'Vết',
              status: status === 'QC_PENDING' ? 'COMPLETED' : 'PENDING',
              photos: [
                {
                  id: `P-BEF-${c.containerNo}-1`,
                  containerNo: c.containerNo,
                  workOrderNo: woNumber,
                  repairItemId: `ITEM-${c.containerNo}-1`,
                  type: 'BEFORE',
                  url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
                  photographer: 'Phạm Thanh Tuấn (Giám định)',
                  timestamp: '2026-08-15 08:30',
                  description: 'Ảnh hiện trạng trước sửa chữa'
                }
              ],
              materialsUsed: []
            }
          ];

      const priorities: WorkOrderRecord['priority'][] = ['NORMAL', 'HIGH', 'URGENT', 'NORMAL'];
      const priority = priorities[index % priorities.length];

      return {
        id: `WO-REC-${c.id}`,
        workOrderNo: woNumber,
        containerId: c.id,
        containerNo: c.containerNo,
        estimateNo: estNumber,
        shippingLine: c.shippingLine,
        isoCode: c.isoCode || '45G1',
        size: c.size || '40HC',
        type: c.type || 'Dry High Cube',
        yardLocation: c.yardLocation || { block: 'A', bay: '01', row: '01', tier: '01' },
        priority,
        status,
        assignedTeam: 'Tổ Thợ Cơ Khí EMR #01 (Ca Ngày)',
        leadTechnician: c.workOrderDetails?.technician || 'Hoàng Văn Sơn (Trưởng ca EMR)',
        assignedAt: c.workOrderDetails?.assignedAt || '2026-08-15 08:00',
        deadline: '2026-08-16 17:00 (SLA 24h)',
        items,
        additionalReports: [],
        totalEstimatedHours: items.length * 2.5
      };
    });
};
