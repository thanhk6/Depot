import React, { useState, useEffect } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { WorkOrderRecord, RepairPhoto } from '../types/repair';
import { repairApi } from '../../../api';
import { useDepot } from '../../../context/DepotContext';
import { parseRepairPhoto } from '../../../api/repair.api';
import { DepotFileDto } from '../../../api/depotFile.api';
import { generateWorkOrdersFromContainers } from '../data/initialWorkOrders';
import { WorkOrderList } from '../components/WorkOrderList';
import { WorkOrderDetailView } from '../components/WorkOrderDetailView';

interface RepairPageProps {
  containers: ContainerRecord[];
  onCompleteRepair: (containerId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const RepairPage: React.FC<RepairPageProps> = ({
  containers,
  onCompleteRepair,
  onNavigateTab
}) => {
  // Initialize Work Orders from containers
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>(() =>
    generateWorkOrdersFromContainers(containers)
  );

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);
  const { loggedInUserProfile } = useDepot();

  // Sync when containers update (e.g. when an estimate gets approved)
  useEffect(() => {
    setWorkOrders((prev) => {
      const regenerated = generateWorkOrdersFromContainers(containers);
      // Merge with existing local edits if any
      return regenerated.map((rg) => {
        const existing = prev.find((p) => p.id === rg.id || p.containerNo === rg.containerNo);
        if (existing) {
          // Keep existing items progress if user worked on it
          return {
            ...rg,
            status: existing.status !== 'WAITING' ? existing.status : rg.status,
            items: existing.items,
            additionalReports: existing.additionalReports
          };
        }
        return rg;
      });
    });
  }, [containers]);

  const selectedWorkOrder = workOrders.find((w) => w.id === selectedWorkOrderId);

  // Ảnh trước / sau sửa là dữ liệu thật trên backend (DepotFiles gắn RepairOrder) — mỗi lần mở 1 Work Order thì
  // nạp lại và thay toàn bộ ảnh BEFORE + AFTER của từng hạng mục theo loại + số hạng mục ghi trong tên file.
  const selectedContainerId = selectedWorkOrder?.containerId;
  useEffect(() => {
    if (!selectedWorkOrderId || !selectedContainerId) return;
    let cancelled = false;
    repairApi.getRepairPhotos(selectedContainerId)
      .then((response: any) => {
        if (cancelled || response?.statusCode !== 200 || !Array.isArray(response.data)) return;
        const files = (response.data as DepotFileDto[])
          .map((f) => ({ file: f, parsed: parseRepairPhoto(f.name) }))
          .filter((x): x is { file: DepotFileDto; parsed: NonNullable<ReturnType<typeof parseRepairPhoto>> } => x.parsed !== null);
        setWorkOrders((prev) => prev.map((wo) => {
          if (wo.id !== selectedWorkOrderId) return wo;
          return {
            ...wo,
            items: wo.items.map((item) => ({
              ...item,
              photos: [
                ...item.photos.filter((p) => p.type !== 'AFTER' && p.type !== 'BEFORE'),
                ...files
                  .filter(({ parsed }) => parsed.itemNo === item.itemNo)
                  .map(({ file: f, parsed }): RepairPhoto => ({
                    id: `FILE-${f.id}`,
                    containerNo: wo.containerNo,
                    workOrderNo: wo.workOrderNo,
                    repairItemId: item.id,
                    type: parsed.kind,
                    url: f.url,
                    photographer: item.technician || wo.leadTechnician,
                    timestamp: new Date(f.createdAt).toLocaleString('vi-VN'),
                    description: `Ảnh ${parsed.kind === 'BEFORE' ? 'trước' : 'sau'} sửa hạng mục #${item.itemNo}`
                  }))
              ]
            }))
          };
        }));
      })
      .catch((error) => console.error('Không tải được ảnh lệnh sửa:', error));
    return () => { cancelled = true; };
  }, [selectedWorkOrderId, selectedContainerId]);

  // Handler to update a work order locally
  const handleUpdateWorkOrder = (updated: WorkOrderRecord) => {
    setWorkOrders((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  // Handler when Work Order is finished and sent to QC
  // Trả về null khi backend chấp nhận, ngược lại là lý do (vd hạng mục thiếu ảnh trước / sau sửa) để màn hiện ra.
  const handleCompleteWorkOrder = async (workOrderId: string, containerId: string): Promise<string | null> => {
    const workOrder = workOrders.find((item) => item.id === workOrderId);
    if (!workOrder) return 'Không tìm thấy lệnh sửa chữa.';
    try {
      const response: any = await repairApi.completeWorkOrder(containerId, workOrder.items.flatMap((item) => item.photos.map((photo) => photo.url)));
      if (response?.statusCode !== 200) return String(response?.data || response?.message || 'Backend không thể hoàn tất sửa chữa.');
      onCompleteRepair(containerId);
      return null;
    } catch (error: any) {
      const detail = error?.response?.data?.data || error?.response?.data?.message || (error instanceof Error ? error.message : null);
      return typeof detail === 'string' && detail ? detail : 'Không hoàn tất được lệnh sửa chữa.';
    }
  };

  const handleStartWorkOrder = (workOrder: WorkOrderRecord) => {
    // Thợ bắt đầu = người đang đăng nhập (trước đây gửi thợ giả 'TECH-DEPOT' / 'Kỹ thuật viên Depot').
    repairApi.startWorkOrder(
      workOrder.containerId,
      loggedInUserProfile ? String(loggedInUserProfile.id) : '',
      workOrder.leadTechnician || loggedInUserProfile?.fullName || ''
    )
      .catch((error) => console.error(error));
  };

  return (
    <div className="space-y-6">
      {selectedWorkOrder ? (
        <WorkOrderDetailView
          workOrder={selectedWorkOrder}
          onBack={() => setSelectedWorkOrderId(null)}
          onUpdateWorkOrder={handleUpdateWorkOrder}
          onCompleteWorkOrder={handleCompleteWorkOrder}
          onStartWorkOrder={handleStartWorkOrder}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <WorkOrderList
          workOrders={workOrders}
          onSelectWorkOrder={(wo) => setSelectedWorkOrderId(wo.id)}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
