import React, { useState, useEffect } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { WorkOrderRecord } from '../types/repair';
import { repairApi } from '../../../api';
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

  // Handler to update a work order locally
  const handleUpdateWorkOrder = (updated: WorkOrderRecord) => {
    setWorkOrders((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  // Handler when Work Order is finished and sent to QC
  const handleCompleteWorkOrder = (workOrderId: string, containerId: string) => {
    const workOrder = workOrders.find((item) => item.id === workOrderId);
    if (!workOrder) return;
    repairApi.completeWorkOrder(containerId, workOrder.items.flatMap((item) => item.photos.map((photo) => photo.url)))
      .then((response: any) => {
        if (response?.statusCode !== 200) throw new Error(response?.message || 'Backend không thể hoàn tất sửa chữa.');
        onCompleteRepair(containerId);
      })
      .catch((error) => console.error(error));
  };

  const handleStartWorkOrder = (workOrder: WorkOrderRecord) => {
    repairApi.startWorkOrder(workOrder.containerId, 'TECH-DEPOT', workOrder.leadTechnician || 'Kỹ thuật viên Depot')
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
