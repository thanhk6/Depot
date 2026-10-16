import React, { useState } from 'react';
import { useEffect } from 'react';
import { masterDataApi, warehouseApi } from '../../../api';
import {
  Material,
  StockBalance,
  StockTransaction,
  WorkOrderMaterial,
  MaterialReceipt,
  MaterialIssue,
  MaterialReturn,
  StockAdjustment,
  Stocktake,
  MaterialDamage,
  MaterialGroup,
  Supplier,
  WarehouseKPIs
} from '../types';

import { WarehouseHeader } from '../components/WarehouseHeader';
import { StockBalanceTab } from '../components/StockBalanceTab';
import { MaterialReceiptTab } from '../components/MaterialReceiptTab';
import { MaterialIssueTab } from '../components/MaterialIssueTab';
import { StockTransactionsTab } from '../components/StockTransactionsTab';
import { MaterialCatalogTab } from '../components/MaterialCatalogTab';

// Modals
import { CreateMaterialModal } from '../components/modals/CreateMaterialModal';
import { CreateReceiptModal } from '../components/modals/CreateReceiptModal';
import { CreateIssueModal } from '../components/modals/CreateIssueModal';
import { MaterialStockCardModal } from '../components/modals/MaterialStockCardModal';
import { getApiErrorMessage } from '../../../utils/apiError';
import { LoadErrorBanner } from '../../../components/common/LoadErrorBanner';

export const WarehousePage: React.FC = () => {
  // Default to stock balance (Nhập - Xuất - Tồn)
  const [activeSubTab, setActiveSubTab] = useState<string>('stock_balance');

  // State loaded from backend (warehouseApi)
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stockBalances, setStockBalances] = useState<StockBalance[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [workOrderMaterials, setWorkOrderMaterials] = useState<WorkOrderMaterial[]>([]);
  const [receipts, setReceipts] = useState<MaterialReceipt[]>([]);
  const [issues, setIssues] = useState<MaterialIssue[]>([]);
  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Map Material entity thật (backend PascalCase -> camelCase) sang type frontend đầy đủ 17 field.
  const mapMaterialDto = (item: any): Material => ({
    id: item.id,
    materialCode: item.code,
    materialName: item.name,
    materialGroupId: item.materialGroupCode || 'OTHER',
    materialType: item.materialType || 'MATERIAL',
    unit: item.unit,
    specification: item.specification || '',
    brand: item.brand || '',
    manufacturer: item.manufacturer || '',
    barcode: item.barcode || '',
    minimumStock: item.minimumStock || 0,
    maximumStock: item.maximumStock || 0,
    reorderLevel: item.reorderLevel || 0,
    averageCost: item.averageCost || item.unitPrice || 0,
    lastPurchaseCost: item.lastPurchaseCost || item.unitPrice || 0,
    isActive: item.isActive !== false,
    createdAt: item.createdAt || '',
    updatedAt: item.lastModifiedAt || item.createdAt || ''
  });

  const mapTransactionDto = (t: any): StockTransaction => ({
    id: t.id,
    materialId: 0,
    materialCode: t.materialCode,
    materialName: t.materialCode,
    unit: t.unit || 'PCS',
    transactionType: t.transactionType,
    quantity: t.quantity,
    unitCost: t.unitCost,
    totalCost: t.totalCost,
    beforeQuantity: t.beforeQuantity,
    afterQuantity: t.afterQuantity,
    referenceType: t.referenceType,
    referenceId: t.referenceId,
    workOrderNo: t.workOrderNo || undefined,
    containerNo: t.containerNo || undefined,
    performedBy: t.performedBy,
    performedAt: t.performedAt,
    note: t.note || ''
  });

  const mapStockBalanceDto = (b: any): StockBalance => ({
    id: b.materialId,
    materialId: b.materialId,
    materialCode: b.materialCode,
    materialName: b.materialName,
    materialGroup: b.materialGroup || 'OTHER',
    unit: b.unit,
    quantity: b.quantity,
    reservedQuantity: b.reservedQuantity,
    damagedQuantity: b.damagedQuantity,
    availableQuantity: b.availableQuantity,
    averageCost: b.averageCost,
    totalValue: b.totalValue,
    reorderLevel: b.reorderLevel,
    minimumStock: b.minimumStock,
    maximumStock: b.maximumStock,
    stockStatus: b.stockStatus,
    lastUpdatedAt: b.lastUpdatedAt
  });

  const mapMaterialGroupDto = (g: any): MaterialGroup => ({
    id: g.id,
    code: g.code,
    name: g.name,
    description: g.description || ''
  });

  const mapSupplierDto = (s: any): Supplier => ({
    id: s.id,
    supplierCode: s.code,
    supplierName: s.name,
    taxCode: s.taxCode || '',
    phone: s.phone || '',
    email: s.email || '',
    address: s.address || '',
    contactPerson: s.contactPerson || '',
    rating: s.rating || 5,
    isActive: s.isActive !== false,
    notes: s.notes || undefined
  });

  const mapDocumentDto = (d: any): any => ({
    id: d.documentNo,
    receiptNo: d.documentNo,
    issueNo: d.documentNo,
    receiptDate: (d.documentDate || '').substring(0, 10),
    issueDate: (d.documentDate || '').substring(0, 10),
    supplierId: d.supplierCode,
    supplierName: suppliers.find((s) => s.supplierCode === d.supplierCode)?.supplierName || d.supplierCode || 'Không xác định',
    workOrderId: d.workOrderNo || '',
    workOrderNo: d.workOrderNo || '',
    containerId: d.containerNo || '',
    containerNo: d.containerNo || '',
    recipientName: d.performedBy,
    note: d.note || '',
    totalAmount: d.totalAmount,
    totalQuantity: d.totalQuantity,
    status: d.status,
    createdBy: d.performedBy,
    createdAt: d.documentDate,
    details: (d.details || []).map((line: any, idx: number) => ({
      id: idx,
      materialCode: line.materialCode,
      materialName: line.materialName,
      unit: line.unit,
      quantity: line.quantity,
      unitCost: line.unitCost,
      totalCost: line.totalCost,
      note: line.note || undefined
    }))
  });

  // BUG-016: trước đây lỗi tải (mất mạng, 403...) chỉ ghi console, màn hiện như kho rỗng.
  const [loadError, setLoadError] = useState<string | null>(null);

  const reloadWarehouseData = () => {
    setLoadError(null);
    masterDataApi.getMaterials().then((response: any) => {
      if (response?.statusCode === 200) setMaterials((response.data || []).map(mapMaterialDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải vật tư kho.')));

    warehouseApi.getTransactions().then((response: any) => {
      if (response?.statusCode === 200) setTransactions((response.data || []).map(mapTransactionDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải giao dịch kho.')));

    warehouseApi.getStockBalances().then((response: any) => {
      if (response?.statusCode === 200) setStockBalances((response.data || []).map(mapStockBalanceDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải tồn kho.')));

    warehouseApi.getMaterialGroups().then((response: any) => {
      if (response?.statusCode === 200) setMaterialGroups((response.data || []).map(mapMaterialGroupDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải nhóm vật tư.')));

    warehouseApi.getSuppliers().then((response: any) => {
      if (response?.statusCode === 200) setSuppliers((response.data || []).map(mapSupplierDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải nhà cung cấp.')));

    warehouseApi.getReceipts().then((response: any) => {
      if (response?.statusCode === 200) setReceipts((response.data || []).map(mapDocumentDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải phiếu nhập kho.')));

    warehouseApi.getIssues().then((response: any) => {
      if (response?.statusCode === 200) setIssues((response.data || []).map(mapDocumentDto));
    }).catch((error) => setLoadError((prev) => prev ?? getApiErrorMessage(error, 'Không thể tải phiếu xuất kho.')));
  };

  useEffect(() => {
    reloadWarehouseData();
  }, []);

  // Modal States
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);

  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);

  // Detail Modal States
  const [stockCardMaterialId, setStockCardMaterialId] = useState<number | null>(null);
  const [isStockCardOpen, setIsStockCardOpen] = useState(false);

  // HANDLERS
  // 1. Save Material — tạo mới hoặc cập nhật tuỳ có editMaterial.id hay không (trước đây luôn gọi
  // createMaterial kể cả lúc sửa, và chỉ gửi 5/17 field).
  const handleSaveMaterial = async (matData: Partial<Material>): Promise<{ success: boolean; error?: string }> => {
    const payload = {
      code: matData.materialCode,
      name: matData.materialName,
      unit: matData.unit,
      unitPrice: matData.averageCost || 0,
      stockQuantity: matData.id ? undefined : 0,
      materialGroupCode: matData.materialGroupId,
      materialType: matData.materialType,
      specification: matData.specification,
      brand: matData.brand,
      manufacturer: matData.manufacturer,
      barcode: matData.barcode,
      minimumStock: matData.minimumStock || 0,
      maximumStock: matData.maximumStock || 0,
      reorderLevel: matData.reorderLevel || 0,
      averageCost: matData.averageCost || 0,
      lastPurchaseCost: matData.lastPurchaseCost || matData.averageCost || 0,
      isActive: matData.isActive !== false
    };
    // Trước đây gọi API kiểu fire-and-forget (void request.then/catch) — lỗi trùng mã vật tư/validate
    // chỉ log console.error, modal đã đóng ngay nên người dùng không hề biết vật tư KHÔNG được lưu.
    // Đợi kết quả thật, trả {success,error} để CreateMaterialModal quyết định đóng hay báo lỗi.
    try {
      const response: any = matData.id
        ? await masterDataApi.updateMaterial(matData.id, payload)
        : await masterDataApi.createMaterial(payload);
      if (response?.statusCode !== 200) {
        return { success: false, error: response?.message || 'Backend từ chối lưu vật tư.' };
      }
      await reloadWarehouseData();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Lỗi kết nối khi lưu vật tư.' };
    }
  };

  // 2. Receipt (Nhập kho -> Tự động cộng tồn kho)
  // Trước đây hàm này không async, gọi API kiểu bắn-rồi-quên và modal đóng ngay không chờ kết quả —
  // nếu backend từ chối (vật tư không tồn tại, dữ liệu sai...), phiếu vẫn "coi như đã nhập kho" trên UI
  // trong khi tồn kho thật không hề đổi. Giờ trả về Promise kết quả thật để modal chờ và hiển thị lỗi.
  const handleConfirmReceipt = async (
    supplierId: number,
    receiptDate: string,
    note: string,
    items: { materialId: number; quantity: number; unitCost: number; note?: string }[]
  ): Promise<{ success: boolean; error?: string }> => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    try {
      const responses: any[] = await Promise.all(items.map((item) => {
        const material = materials.find((candidate) => candidate.id === item.materialId);
        return warehouseApi.recordTransaction({
          materialCode: material?.materialCode,
          transactionType: 'RECEIPT',
          quantity: item.quantity,
          unitCost: item.unitCost,
          referenceType: 'RECEIPT',
          referenceId: `RECEIPT-${receiptDate}-${supplierId}`,
          supplierCode: supplier?.supplierCode,
          performedBy: 'Warehouse User',
          note
        });
      }));
      const failed = responses.find((r) => r?.statusCode !== 200);
      if (failed) {
        return { success: false, error: failed?.message || failed?.data || 'Backend từ chối phiếu nhập kho.' };
      }
      reloadWarehouseData();
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : null);
      return { success: false, error: detail || 'Không thể ghi nhận nhập kho — lỗi kết nối backend.' };
    }
  };

  // 3. Issue (Xuất kho -> Tự động trừ tồn kho)
  // Trước đây trả `{ success: true }` NGAY LẬP TỨC, trước khi Promise.all gọi API thật chạy xong — modal
  // luôn đóng và luôn báo thành công dù backend từ chối (hết tồn kho, vật tư không tồn tại), khiến tồn
  // kho hiển thị sai lệch với thực tế cho tới khi F5. Giờ trả về Promise, chỉ báo thành công sau khi toàn
  // bộ giao dịch đã ghi nhận thật ở backend.
  const handleConfirmIssue = async (
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    recipientName: string,
    note: string,
    items: { materialId: number; quantity: number; note?: string }[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const responses: any[] = await Promise.all(items.map((item) => {
        const material = materials.find((candidate) => candidate.id === item.materialId);
        return warehouseApi.recordTransaction({ materialCode: material?.materialCode, transactionType: 'ISSUE', quantity: item.quantity, unitCost: material?.averageCost || 0, referenceType: 'WORK_ORDER', referenceId: workOrderNo, workOrderNo, containerNo, performedBy: recipientName, note });
      }));
      const failed = responses.find((r) => r?.statusCode !== 200);
      if (failed) {
        return { success: false, error: failed?.message || failed?.data || 'Backend từ chối phiếu xuất kho (có thể do không đủ tồn kho).' };
      }
      reloadWarehouseData();
      return { success: true };
    } catch (error: any) {
      const detail = error?.response?.data?.message || error?.response?.data?.data || (error instanceof Error ? error.message : null);
      return { success: false, error: detail || 'Không thể ghi nhận xuất kho — lỗi kết nối backend.' };
    }
  };

  // Stock Card Open
  const handleOpenStockCard = (materialId: number) => {
    setStockCardMaterialId(materialId);
    setIsStockCardOpen(true);
  };

  // Edit Material Open
  const handleOpenEditMaterial = (mat: Material) => {
    setEditMaterial(mat);
    setIsCreateMaterialOpen(true);
  };

  const currentStockCardMat = materials.find((m) => m.id === stockCardMaterialId) || materials[0];
  const currentStockCardBalance = stockBalances.find((b) => b.materialId === stockCardMaterialId) || stockBalances[0];

  return (
    <div className="space-y-6 pb-12">
      {loadError && <LoadErrorBanner message={loadError} onRetry={reloadWarehouseData} />}
      {/* Header & Sub-tab navigation */}
      <WarehouseHeader
        activeSubTab={activeSubTab}
        onSelectSubTab={setActiveSubTab}
        onOpenCreateReceipt={() => setIsCreateReceiptOpen(true)}
        onOpenCreateIssue={() => setIsCreateIssueOpen(true)}
        onOpenCreateMaterial={() => {
          setEditMaterial(null);
          setIsCreateMaterialOpen(true);
        }}
      />

      {/* Sub Tabs Switching */}
      {activeSubTab === 'stock_balance' && (
        <StockBalanceTab
          stockBalances={stockBalances}
          materialGroups={materialGroups}
          transactions={transactions}
          onOpenStockCard={handleOpenStockCard}
          onOpenIssue={() => setIsCreateIssueOpen(true)}
          onOpenReceipt={() => setIsCreateReceiptOpen(true)}
          onOpenCreateMaterial={() => {
            setEditMaterial(null);
            setIsCreateMaterialOpen(true);
          }}
        />
      )}

      {activeSubTab === 'receipts' && (
        <MaterialReceiptTab
          receipts={receipts}
          onOpenCreateReceipt={() => setIsCreateReceiptOpen(true)}
        />
      )}

      {activeSubTab === 'issues' && (
        <MaterialIssueTab
          issues={issues}
          onOpenCreateIssue={() => setIsCreateIssueOpen(true)}
        />
      )}

      {activeSubTab === 'transactions' && (
        <StockTransactionsTab
          transactions={transactions}
          onOpenReceipt={() => setIsCreateReceiptOpen(true)}
          onOpenIssue={() => setIsCreateIssueOpen(true)}
        />
      )}

      {activeSubTab === 'catalog' && (
        <MaterialCatalogTab
          materials={materials}
          materialGroups={materialGroups}
          onOpenCreateMaterial={() => {
            setEditMaterial(null);
            setIsCreateMaterialOpen(true);
          }}
          onEditMaterial={handleOpenEditMaterial}
        />
      )}

      {/* MODALS */}
      <CreateMaterialModal
        isOpen={isCreateMaterialOpen}
        onClose={() => {
          setIsCreateMaterialOpen(false);
          setEditMaterial(null);
        }}
        onSave={handleSaveMaterial}
        editMaterial={editMaterial}
      />

      <CreateReceiptModal
        isOpen={isCreateReceiptOpen}
        onClose={() => setIsCreateReceiptOpen(false)}
        materials={materials}
        suppliers={suppliers}
        onConfirmReceipt={handleConfirmReceipt}
      />

      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        materials={materials}
        stockBalances={stockBalances}
        workOrderMaterials={workOrderMaterials}
        onConfirmIssue={handleConfirmIssue}
      />

      {/* Stock Card Modal */}
      {currentStockCardMat && currentStockCardBalance && (
        <MaterialStockCardModal
          isOpen={isStockCardOpen}
          onClose={() => setIsStockCardOpen(false)}
          material={currentStockCardMat}
          stockBalance={currentStockCardBalance}
          transactions={transactions.filter((t) => t.materialCode === currentStockCardMat.materialCode)}
        />
      )}
    </div>
  );
};
