import {
  MaterialGroup,
  Supplier,
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
  WarehouseKPIs,
  ContainerMaterialCostReport,
  ShippingLineMaterialSummaryReport
} from '../types';
import {
  INITIAL_MATERIAL_GROUPS,
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_STOCK_BALANCES,
  INITIAL_WORK_ORDER_MATERIALS,
  INITIAL_RECEIPTS,
  INITIAL_ISSUES,
  INITIAL_RETURNS,
  INITIAL_ADJUSTMENTS,
  INITIAL_STOCKTAKES,
  INITIAL_DAMAGES,
  INITIAL_STOCK_TRANSACTIONS
} from '../mockData';

class WarehouseService {
  private materialGroups: MaterialGroup[] = [...INITIAL_MATERIAL_GROUPS];
  private suppliers: Supplier[] = [...INITIAL_SUPPLIERS];
  private materials: Material[] = [...INITIAL_MATERIALS];
  private stockBalances: StockBalance[] = [...INITIAL_STOCK_BALANCES];
  private workOrderMaterials: WorkOrderMaterial[] = [...INITIAL_WORK_ORDER_MATERIALS];
  private receipts: MaterialReceipt[] = [...INITIAL_RECEIPTS];
  private issues: MaterialIssue[] = [...INITIAL_ISSUES];
  private returns: MaterialReturn[] = [...INITIAL_RETURNS];
  private adjustments: StockAdjustment[] = [...INITIAL_ADJUSTMENTS];
  private stocktakes: Stocktake[] = [...INITIAL_STOCKTAKES];
  private damages: MaterialDamage[] = [...INITIAL_DAMAGES];
  private transactions: StockTransaction[] = [...INITIAL_STOCK_TRANSACTIONS];

  // Helper to recompute stock balance fields
  private refreshBalance(balance: StockBalance): StockBalance {
    const available = Math.max(0, balance.quantity - balance.reservedQuantity - balance.damagedQuantity);
    let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (available === 0) {
      status = 'OUT_OF_STOCK';
    } else if (available <= balance.reorderLevel) {
      status = 'LOW_STOCK';
    }
    return {
      ...balance,
      availableQuantity: available,
      totalValue: balance.quantity * balance.averageCost,
      stockStatus: status,
      lastUpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
  }

  // GETTERS
  getMaterialGroups(): MaterialGroup[] {
    return this.materialGroups.map((g) => ({
      ...g,
      materialCount: this.materials.filter((m) => m.materialGroupId === g.code).length
    }));
  }

  getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  getMaterials(): Material[] {
    return [...this.materials];
  }

  getStockBalances(): StockBalance[] {
    return this.stockBalances.map((b) => this.refreshBalance(b));
  }

  getStockTransactions(): StockTransaction[] {
    return [...this.transactions].sort((a, b) => b.id - a.id);
  }

  getWorkOrderMaterials(): WorkOrderMaterial[] {
    return [...this.workOrderMaterials];
  }

  getReceipts(): MaterialReceipt[] {
    return [...this.receipts].sort((a, b) => b.id - a.id);
  }

  getIssues(): MaterialIssue[] {
    return [...this.issues].sort((a, b) => b.id - a.id);
  }

  getReturns(): MaterialReturn[] {
    return [...this.returns].sort((a, b) => b.id - a.id);
  }

  getAdjustments(): StockAdjustment[] {
    return [...this.adjustments].sort((a, b) => b.id - a.id);
  }

  getStocktakes(): Stocktake[] {
    return [...this.stocktakes].sort((a, b) => b.id - a.id);
  }

  getDamages(): MaterialDamage[] {
    return [...this.damages].sort((a, b) => b.id - a.id);
  }

  // KPIs
  getKPIs(): WarehouseKPIs {
    const balances = this.getStockBalances();
    const today = new Date().toISOString().substring(0, 10);

    const totalMaterials = this.materials.filter((m) => m.isActive).length;
    const totalStockQuantity = balances.reduce((sum, b) => sum + b.quantity, 0);
    const totalStockValue = balances.reduce((sum, b) => sum + b.totalValue, 0);
    const totalReservedQuantity = balances.reduce((sum, b) => sum + b.reservedQuantity, 0);
    const totalDamagedQuantity = balances.reduce((sum, b) => sum + b.damagedQuantity, 0);
    const totalAvailableQuantity = balances.reduce((sum, b) => sum + b.availableQuantity, 0);
    const lowStockCount = balances.filter((b) => b.stockStatus === 'LOW_STOCK').length;
    const outOfStockCount = balances.filter((b) => b.stockStatus === 'OUT_OF_STOCK').length;

    const todayReceipts = this.receipts.filter((r) => r.receiptDate === today);
    const todayReceiptCount = todayReceipts.length;
    const todayReceiptValue = todayReceipts.reduce((sum, r) => sum + r.totalAmount, 0);

    const todayIssues = this.issues.filter((i) => i.issueDate === today);
    const todayIssueCount = todayIssues.length;
    const todayIssueValue = todayIssues.reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalMaterials,
      totalStockQuantity,
      totalStockValue,
      totalReservedQuantity,
      totalDamagedQuantity,
      totalAvailableQuantity,
      lowStockCount,
      outOfStockCount,
      todayReceiptCount,
      todayReceiptValue,
      todayIssueCount,
      todayIssueValue
    };
  }

  // ACTIONS

  // 1. Add / Update Material
  saveMaterial(matData: Partial<Material>): Material {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (matData.id) {
      // Update
      this.materials = this.materials.map((m) =>
        m.id === matData.id ? ({ ...m, ...matData, updatedAt: now } as Material) : m
      );
      // Sync stock balance info
      this.stockBalances = this.stockBalances.map((b) => {
        if (b.materialId === matData.id) {
          return this.refreshBalance({
            ...b,
            materialCode: matData.materialCode || b.materialCode,
            materialName: matData.materialName || b.materialName,
            materialGroup: matData.materialGroupId || b.materialGroup,
            unit: matData.unit || b.unit,
            reorderLevel: matData.reorderLevel ?? b.reorderLevel,
            minimumStock: matData.minimumStock ?? b.minimumStock,
            maximumStock: matData.maximumStock ?? b.maximumStock,
            averageCost: matData.averageCost ?? b.averageCost
          });
        }
        return b;
      });
      return this.materials.find((m) => m.id === matData.id)!;
    } else {
      // Create new
      const newId = Math.max(0, ...this.materials.map((m) => m.id)) + 1;
      const newMat: Material = {
        id: newId,
        materialCode: matData.materialCode || `MAT-NEW-${newId.toString().padStart(3, '0')}`,
        materialName: matData.materialName || 'Vật tư mới',
        materialGroupId: matData.materialGroupId || 'OTHER',
        materialType: matData.materialType || 'MATERIAL',
        unit: matData.unit || 'PCS',
        specification: matData.specification || '',
        brand: matData.brand || 'EMR Spec',
        manufacturer: matData.manufacturer || 'OEM',
        barcode: matData.barcode || `893600101${newId.toString().padStart(4, '0')}`,
        minimumStock: matData.minimumStock || 5,
        maximumStock: matData.maximumStock || 50,
        reorderLevel: matData.reorderLevel || 10,
        averageCost: matData.averageCost || 100000,
        lastPurchaseCost: matData.lastPurchaseCost || matData.averageCost || 100000,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      this.materials.push(newMat);

      // Create empty stock balance
      const newBalance: StockBalance = {
        id: Math.max(0, ...this.stockBalances.map((b) => b.id)) + 1,
        materialId: newId,
        materialCode: newMat.materialCode,
        materialName: newMat.materialName,
        materialGroup: newMat.materialGroupId,
        unit: newMat.unit,
        quantity: 0,
        reservedQuantity: 0,
        damagedQuantity: 0,
        availableQuantity: 0,
        averageCost: newMat.averageCost,
        totalValue: 0,
        reorderLevel: newMat.reorderLevel,
        minimumStock: newMat.minimumStock,
        maximumStock: newMat.maximumStock,
        stockStatus: 'OUT_OF_STOCK',
        lastUpdatedAt: now
      };
      this.stockBalances.push(newBalance);
      return newMat;
    }
  }

  // 2. Nhập kho (Material Receipt)
  createReceipt(
    supplierId: number,
    receiptDate: string,
    note: string,
    items: { materialId: number; quantity: number; unitCost: number; note?: string }[],
    createdBy: string = 'Trần Văn Mạnh (Thủ kho EMR)'
  ): MaterialReceipt {
    const supplier = this.suppliers.find((s) => s.id === supplierId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const receiptId = Math.max(0, ...this.receipts.map((r) => r.id)) + 1;
    const receiptNo = `PNK-2026-${receiptId.toString().padStart(4, '0')}`;

    let totalAmount = 0;
    let totalQuantity = 0;

    const details = items.map((item, idx) => {
      const mat = this.materials.find((m) => m.id === item.materialId);
      const cost = item.quantity * item.unitCost;
      totalAmount += cost;
      totalQuantity += item.quantity;

      // Update StockBalance
      const balanceIdx = this.stockBalances.findIndex((b) => b.materialId === item.materialId);
      if (balanceIdx >= 0) {
        const current = this.stockBalances[balanceIdx];
        const oldQty = current.quantity;
        const newQty = oldQty + item.quantity;
        // Moving weighted average cost calculation
        const newAvgCost = Math.round(
          (oldQty * current.averageCost + item.quantity * item.unitCost) / Math.max(1, newQty)
        );

        this.stockBalances[balanceIdx] = this.refreshBalance({
          ...current,
          quantity: newQty,
          averageCost: newAvgCost
        });

        // Update material lastPurchaseCost
        this.materials = this.materials.map((m) =>
          m.id === item.materialId ? { ...m, lastPurchaseCost: item.unitCost, averageCost: newAvgCost } : m
        );

        // Record Transaction
        this.transactions.push({
          id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
          materialId: item.materialId,
          materialCode: mat?.materialCode || '',
          materialName: mat?.materialName || '',
          unit: mat?.unit || 'PCS',
          transactionType: 'RECEIPT',
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: cost,
          beforeQuantity: oldQty,
          afterQuantity: newQty,
          referenceType: 'RECEIPT',
          referenceId: receiptNo,
          performedBy: createdBy,
          performedAt: now,
          note: `Nhập kho theo ${receiptNo} từ ${supplier?.supplierName || 'NCC'}`
        });
      }

      return {
        id: idx + 1,
        receiptId,
        materialId: item.materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: cost,
        note: item.note
      };
    });

    const newReceipt: MaterialReceipt = {
      id: receiptId,
      receiptNo,
      receiptDate: receiptDate || now.substring(0, 10),
      supplierId,
      supplierName: supplier?.supplierName || 'Nhà cung cấp',
      note,
      totalAmount,
      totalQuantity,
      status: 'COMPLETED',
      createdBy,
      approvedBy: 'Vũ Đức Nam (Trưởng bộ phận EMR)',
      createdAt: now,
      details
    };

    this.receipts.unshift(newReceipt);
    return newReceipt;
  }

  // 3. Xuất kho (Material Issue) - STRICT: Không cho phép âm kho!
  createIssue(
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    recipientName: string,
    note: string,
    items: { materialId: number; quantity: number; note?: string }[],
    createdBy: string = 'Trần Văn Mạnh (Thủ kho EMR)'
  ): { success: boolean; issue?: MaterialIssue; error?: string } {
    // Validate stock for all items first
    for (const item of items) {
      const balance = this.stockBalances.find((b) => b.materialId === item.materialId);
      const available = balance ? Math.max(0, balance.quantity - balance.reservedQuantity - balance.damagedQuantity) : 0;

      // Also check if this work order has reserved this item (if reserved, we allow drawing from reserve)
      const woMat = this.workOrderMaterials.find(
        (w) => w.workOrderNo === workOrderNo && w.materialId === item.materialId
      );
      const reservedForThisWO = woMat ? woMat.reservedQuantity : 0;
      const effectiveAvailable = available + reservedForThisWO;

      if (!balance || effectiveAvailable < item.quantity) {
        const matName = balance?.materialName || `Mã #${item.materialId}`;
        const shortage = item.quantity - effectiveAvailable;
        return {
          success: false,
          error: `KHÔNG ĐỦ TỒN KHO!\n\nVật tư: ${matName}\nTồn khả dụng hiện tại: ${effectiveAvailable} ${balance?.unit || 'PCS'}\nSố lượng yêu cầu xuất: ${item.quantity} ${balance?.unit || 'PCS'}\nThiếu: ${shortage} ${balance?.unit || 'PCS'}`
        };
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const issueId = Math.max(0, ...this.issues.map((i) => i.id)) + 1;
    const issueNo = `PXK-2026-${issueId.toString().padStart(4, '0')}`;

    let totalAmount = 0;
    let totalQuantity = 0;

    const details = items.map((item, idx) => {
      const mat = this.materials.find((m) => m.id === item.materialId);
      const balanceIdx = this.stockBalances.findIndex((b) => b.materialId === item.materialId);
      const current = this.stockBalances[balanceIdx];
      const unitCost = current.averageCost;
      const totalCost = item.quantity * unitCost;

      totalAmount += totalCost;
      totalQuantity += item.quantity;

      const oldQty = current.quantity;
      const newQty = oldQty - item.quantity;

      // Reduce reservation if work order had reserved this material
      const woMatIdx = this.workOrderMaterials.findIndex(
        (w) => w.workOrderNo === workOrderNo && w.materialId === item.materialId
      );

      let releaseReservedQty = 0;
      if (woMatIdx >= 0) {
        const woMat = this.workOrderMaterials[woMatIdx];
        releaseReservedQty = Math.min(woMat.reservedQuantity, item.quantity);
        this.workOrderMaterials[woMatIdx] = {
          ...woMat,
          reservedQuantity: Math.max(0, woMat.reservedQuantity - releaseReservedQty),
          issuedQuantity: woMat.issuedQuantity + item.quantity,
          issuedTo: recipientName,
          status: 'ISSUED',
          updatedAt: now
        };
      } else {
        // Create new WorkOrderMaterial entry if not previously registered
        this.workOrderMaterials.push({
          id: Math.max(0, ...this.workOrderMaterials.map((w) => w.id)) + 1,
          workOrderId,
          workOrderNo,
          containerId,
          containerNo,
          shippingLine,
          materialId: item.materialId,
          materialCode: mat?.materialCode || '',
          materialName: mat?.materialName || '',
          unit: mat?.unit || 'PCS',
          requiredQuantity: item.quantity,
          reservedQuantity: 0,
          issuedQuantity: item.quantity,
          usedQuantity: 0,
          returnedQuantity: 0,
          damagedQuantity: 0,
          unitCost,
          totalCost,
          status: 'ISSUED',
          requestedBy: createdBy,
          issuedTo: recipientName,
          createdAt: now,
          updatedAt: now
        });
      }

      // Update Stock Balance: reduce physical Quantity and release reserved
      this.stockBalances[balanceIdx] = this.refreshBalance({
        ...current,
        quantity: newQty,
        reservedQuantity: Math.max(0, current.reservedQuantity - releaseReservedQty)
      });

      // Record Transaction
      this.transactions.push({
        id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
        materialId: item.materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        transactionType: 'ISSUE',
        quantity: item.quantity,
        unitCost,
        totalCost,
        beforeQuantity: oldQty,
        afterQuantity: newQty,
        referenceType: 'ISSUE',
        referenceId: issueNo,
        workOrderId,
        workOrderNo,
        containerId,
        containerNo,
        performedBy: createdBy,
        performedAt: now,
        note: `Xuất kho thi công sửa chữa ${containerNo} (${workOrderNo}) cho thợ ${recipientName}`
      });

      return {
        id: idx + 1,
        issueId,
        materialId: item.materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        quantity: item.quantity,
        unitCost,
        totalCost,
        note: item.note
      };
    });

    const newIssue: MaterialIssue = {
      id: issueId,
      issueNo,
      issueDate: now.substring(0, 10),
      workOrderId,
      workOrderNo,
      containerId,
      containerNo,
      shippingLine,
      recipientName,
      note,
      totalAmount,
      totalQuantity,
      status: 'COMPLETED',
      createdBy,
      approvedBy: 'Vũ Đức Nam (Trưởng bộ phận EMR)',
      createdAt: now,
      details
    };

    this.issues.unshift(newIssue);
    return { success: true, issue: newIssue };
  }

  // 4. Trả vật tư (Material Return)
  createReturn(
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    returnedBy: string,
    receivedBy: string,
    note: string,
    items: { materialId: number; quantity: number; condition: 'GOOD' | 'DAMAGED'; damageReason?: string }[]
  ): MaterialReturn {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const returnId = Math.max(0, ...this.returns.map((r) => r.id)) + 1;
    const returnNo = `PTK-2026-${returnId.toString().padStart(4, '0')}`;

    let totalAmount = 0;
    let totalQuantity = 0;
    let goodQuantity = 0;
    let damagedQuantity = 0;

    const details = items.map((item, idx) => {
      const mat = this.materials.find((m) => m.id === item.materialId);
      const balanceIdx = this.stockBalances.findIndex((b) => b.materialId === item.materialId);
      const current = this.stockBalances[balanceIdx];
      const unitCost = current ? current.averageCost : 0;
      const totalCost = item.quantity * unitCost;

      totalAmount += totalCost;
      totalQuantity += item.quantity;

      if (item.condition === 'GOOD') {
        goodQuantity += item.quantity;
        // GOOD condition: add back to Quantity and Available
        const oldQty = current.quantity;
        const newQty = oldQty + item.quantity;

        this.stockBalances[balanceIdx] = this.refreshBalance({
          ...current,
          quantity: newQty
        });

        // Record Transaction
        this.transactions.push({
          id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
          materialId: item.materialId,
          materialCode: mat?.materialCode || '',
          materialName: mat?.materialName || '',
          unit: mat?.unit || 'PCS',
          transactionType: 'RETURN',
          quantity: item.quantity,
          unitCost,
          totalCost,
          beforeQuantity: oldQty,
          afterQuantity: newQty,
          referenceType: 'RETURN',
          referenceId: returnNo,
          workOrderId,
          workOrderNo,
          containerId,
          containerNo,
          performedBy: receivedBy,
          performedAt: now,
          note: `Hoàn kho vật tư tốt từ lệnh ${workOrderNo} (${containerNo}) do thợ ${returnedBy} trả lại`
        });
      } else {
        damagedQuantity += item.quantity;
        // DAMAGED condition: add to DamagedQuantity (does NOT increase available stock)
        const oldDamaged = current.damagedQuantity;
        const newDamaged = oldDamaged + item.quantity;

        this.stockBalances[balanceIdx] = this.refreshBalance({
          ...current,
          damagedQuantity: newDamaged
        });

        // Create MaterialDamage entry
        const damageId = Math.max(0, ...this.damages.map((d) => d.id)) + 1;
        this.damages.unshift({
          id: damageId,
          damageNo: `PHG-2026-${damageId.toString().padStart(4, '0')}`,
          materialId: item.materialId,
          materialCode: mat?.materialCode || '',
          materialName: mat?.materialName || '',
          unit: mat?.unit || 'PCS',
          quantity: item.quantity,
          unitCost,
          totalCost,
          reportedDate: now.substring(0, 10),
          workOrderId,
          workOrderNo,
          containerNo,
          reportedBy: returnedBy,
          reason: item.damageReason || 'Vật tư trả về bị biến dạng / hỏng trong quá trình thi công',
          resolution: 'PENDING_SURVEY',
          lossAmount: totalCost,
          createdAt: now
        });

        // Record Transaction
        this.transactions.push({
          id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
          materialId: item.materialId,
          materialCode: mat?.materialCode || '',
          materialName: mat?.materialName || '',
          unit: mat?.unit || 'PCS',
          transactionType: 'DAMAGE',
          quantity: item.quantity,
          unitCost,
          totalCost,
          beforeQuantity: current.quantity,
          afterQuantity: current.quantity,
          referenceType: 'RETURN',
          referenceId: returnNo,
          workOrderId,
          workOrderNo,
          containerId,
          containerNo,
          performedBy: receivedBy,
          performedAt: now,
          note: `Vật tư hỏng cách ly từ ${workOrderNo} (${containerNo}): ${item.damageReason || 'Hỏng khi thi công'}`
        });
      }

      // Update WorkOrderMaterial returned / damaged
      const woMatIdx = this.workOrderMaterials.findIndex(
        (w) => w.workOrderNo === workOrderNo && w.materialId === item.materialId
      );
      if (woMatIdx >= 0) {
        const woMat = this.workOrderMaterials[woMatIdx];
        this.workOrderMaterials[woMatIdx] = {
          ...woMat,
          returnedQuantity: woMat.returnedQuantity + (item.condition === 'GOOD' ? item.quantity : 0),
          damagedQuantity: woMat.damagedQuantity + (item.condition === 'DAMAGED' ? item.quantity : 0),
          usedQuantity: Math.max(0, woMat.issuedQuantity - (woMat.returnedQuantity + item.quantity)),
          updatedAt: now
        };
      }

      return {
        id: idx + 1,
        returnId,
        materialId: item.materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        quantity: item.quantity,
        unitCost,
        totalCost,
        condition: item.condition,
        damageReason: item.damageReason
      };
    });

    const newReturn: MaterialReturn = {
      id: returnId,
      returnNo,
      returnDate: now.substring(0, 10),
      workOrderId,
      workOrderNo,
      containerId,
      containerNo,
      shippingLine,
      returnedBy,
      receivedBy,
      note,
      totalQuantity,
      goodQuantity,
      damagedQuantity,
      totalAmount,
      createdAt: now,
      details
    };

    this.returns.unshift(newReturn);
    return newReturn;
  }

  // 5. Điều chỉnh tồn kho (Stock Adjustment)
  createAdjustment(
    reasonType: 'INVENTORY_DIFFERENCE' | 'BROKEN' | 'LOST' | 'OTHER',
    reason: string,
    items: { materialId: number; type: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'; quantity: number; note?: string }[],
    adjustedBy: string = 'Trần Văn Mạnh (Thủ kho EMR)'
  ): StockAdjustment {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const adjustmentId = Math.max(0, ...this.adjustments.map((a) => a.id)) + 1;
    const adjustmentNo = `PDC-2026-${adjustmentId.toString().padStart(4, '0')}`;

    let totalDifferenceValue = 0;

    const details = items.map((item, idx) => {
      const mat = this.materials.find((m) => m.id === item.materialId);
      const balanceIdx = this.stockBalances.findIndex((b) => b.materialId === item.materialId);
      const current = this.stockBalances[balanceIdx];
      const oldQty = current.quantity;
      const delta = item.type === 'ADJUSTMENT_IN' ? item.quantity : -item.quantity;
      const newQty = Math.max(0, oldQty + delta);
      const unitCost = current.averageCost;
      const totalCost = Math.abs(delta) * unitCost;

      totalDifferenceValue += delta * unitCost;

      // Update Stock Balance
      this.stockBalances[balanceIdx] = this.refreshBalance({
        ...current,
        quantity: newQty
      });

      // Record Transaction
      this.transactions.push({
        id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
        materialId: item.materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        transactionType: item.type,
        quantity: item.quantity,
        unitCost,
        totalCost,
        beforeQuantity: oldQty,
        afterQuantity: newQty,
        referenceType: 'ADJUSTMENT',
        referenceId: adjustmentNo,
        performedBy: adjustedBy,
        performedAt: now,
        note: `Điều chỉnh tồn kho (${reasonType}): ${reason} - ${item.note || ''}`
      });

      return {
        id: idx + 1,
        adjustmentId,
        materialId: item.materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        type: item.type,
        beforeQuantity: oldQty,
        adjustedQuantity: item.quantity,
        afterQuantity: newQty,
        unitCost,
        totalCost,
        note: item.note
      };
    });

    const newAdjustment: StockAdjustment = {
      id: adjustmentId,
      adjustmentNo,
      adjustmentDate: now.substring(0, 10),
      reasonType,
      reason,
      status: 'APPROVED',
      adjustedBy,
      approvedBy: 'Vũ Đức Nam (Trưởng bộ phận EMR)',
      totalItems: items.length,
      totalDifferenceValue,
      createdAt: now,
      details
    };

    this.adjustments.unshift(newAdjustment);
    return newAdjustment;
  }

  // 6. Kiểm kê kho (Stocktake Workflow: DRAFT -> COUNTING -> REVIEW -> APPROVED -> POSTED)
  createStocktake(
    title: string,
    notes: string,
    countedBy: string = 'Trần Văn Mạnh (Thủ kho EMR)',
    materialGroupFilter?: string
  ): Stocktake {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const stocktakeId = Math.max(0, ...this.stocktakes.map((s) => s.id)) + 1;
    const stocktakeNo = `STK-2026-${stocktakeId.toString().padStart(5, '0')}`;

    let targetBalances = this.getStockBalances();
    if (materialGroupFilter && materialGroupFilter !== 'ALL') {
      targetBalances = targetBalances.filter((b) => b.materialGroup === materialGroupFilter);
    }

    let totalSystemQty = 0;

    const details = targetBalances.map((b, idx) => {
      totalSystemQty += b.quantity;
      return {
        id: idx + 1,
        stocktakeId,
        materialId: b.materialId,
        materialCode: b.materialCode,
        materialName: b.materialName,
        materialGroup: b.materialGroup,
        unit: b.unit,
        systemQuantity: b.quantity,
        actualQuantity: b.quantity, // Default to system quantity initially
        difference: 0,
        unitCost: b.averageCost,
        differenceValue: 0,
        reason: 'Khớp sổ sách ban đầu'
      };
    });

    const newStocktake: Stocktake = {
      id: stocktakeId,
      stocktakeNo,
      title,
      stocktakeDate: now.substring(0, 10),
      status: 'DRAFT',
      countedBy,
      notes,
      totalSystemQty,
      totalActualQty: totalSystemQty,
      totalDifferenceQty: 0,
      totalDifferenceValue: 0,
      createdAt: now,
      details
    };

    this.stocktakes.unshift(newStocktake);
    return newStocktake;
  }

  updateStocktakeCounts(
    stocktakeId: number,
    counts: { detailId: number; actualQuantity: number; reason?: string }[],
    status: Stocktake['status'] = 'COUNTING'
  ): Stocktake | undefined {
    const stocktake = this.stocktakes.find((s) => s.id === stocktakeId);
    if (!stocktake) return undefined;

    let totalActualQty = 0;
    let totalDifferenceQty = 0;
    let totalDifferenceValue = 0;

    const updatedDetails = stocktake.details.map((d) => {
      const update = counts.find((c) => c.detailId === d.id);
      const actual = update !== undefined ? update.actualQuantity : d.actualQuantity;
      const diff = actual - d.systemQuantity;
      const diffVal = diff * d.unitCost;
      const reason = update?.reason || d.reason || (diff === 0 ? 'Khớp 100%' : 'Chờ đối soát');

      totalActualQty += actual;
      totalDifferenceQty += diff;
      totalDifferenceValue += diffVal;

      return {
        ...d,
        actualQuantity: actual,
        difference: diff,
        differenceValue: diffVal,
        reason
      };
    });

    const updated: Stocktake = {
      ...stocktake,
      status,
      totalActualQty,
      totalDifferenceQty,
      totalDifferenceValue,
      details: updatedDetails
    };

    this.stocktakes = this.stocktakes.map((s) => (s.id === stocktakeId ? updated : s));
    return updated;
  }

  // POST Stocktake -> Updates physical stock balances and creates StockAdjustment
  postStocktake(stocktakeId: number, approvedBy: string = 'Nguyễn Thị Thu (Kế toán trưởng)'): Stocktake | undefined {
    const stocktake = this.stocktakes.find((s) => s.id === stocktakeId);
    if (!stocktake || stocktake.status === 'POSTED') return stocktake;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Apply adjustments for any item with difference != 0
    const diffItems = stocktake.details.filter((d) => d.difference !== 0);
    if (diffItems.length > 0) {
      const adjustmentItems = diffItems.map((d) => ({
        materialId: d.materialId,
        type: (d.difference > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT') as 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT',
        quantity: Math.abs(d.difference),
        note: `Khớp số liệu kiểm kê theo ${stocktake.stocktakeNo}: ${d.reason}`
      }));

      this.createAdjustment(
        'INVENTORY_DIFFERENCE',
        `Tự động cập nhật tồn thực tế theo biên bản kiểm kê ${stocktake.stocktakeNo}`,
        adjustmentItems,
        stocktake.countedBy
      );
    }

    const posted: Stocktake = {
      ...stocktake,
      status: 'POSTED',
      approvedBy,
      postedAt: now
    };

    this.stocktakes = this.stocktakes.map((s) => (s.id === stocktakeId ? posted : s));
    return posted;
  }

  // 7. Reserve / Release Material for Work Order
  reserveForWorkOrder(
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    materialId: number,
    quantity: number,
    repairItemName?: string,
    requestedBy: string = 'Hệ thống tự động'
  ): { success: boolean; error?: string } {
    const balanceIdx = this.stockBalances.findIndex((b) => b.materialId === materialId);
    if (balanceIdx < 0) return { success: false, error: 'Không tìm thấy vật tư!' };

    const current = this.stockBalances[balanceIdx];
    const available = Math.max(0, current.quantity - current.reservedQuantity - current.damagedQuantity);

    if (available < quantity) {
      return {
        success: false,
        error: `Không đủ tồn khả dụng để Reserve!\nVật tư: ${current.materialName}\nTồn khả dụng: ${available}\nYêu cầu: ${quantity}`
      };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Increase reserved quantity on stock balance
    this.stockBalances[balanceIdx] = this.refreshBalance({
      ...current,
      reservedQuantity: current.reservedQuantity + quantity
    });

    // Add or update WorkOrderMaterial
    const woMatIdx = this.workOrderMaterials.findIndex(
      (w) => w.workOrderNo === workOrderNo && w.materialId === materialId
    );

    if (woMatIdx >= 0) {
      const woMat = this.workOrderMaterials[woMatIdx];
      this.workOrderMaterials[woMatIdx] = {
        ...woMat,
        reservedQuantity: woMat.reservedQuantity + quantity,
        status: 'RESERVED',
        updatedAt: now
      };
    } else {
      const mat = this.materials.find((m) => m.id === materialId);
      this.workOrderMaterials.push({
        id: Math.max(0, ...this.workOrderMaterials.map((w) => w.id)) + 1,
        workOrderId,
        workOrderNo,
        containerId,
        containerNo,
        shippingLine,
        materialId,
        materialCode: mat?.materialCode || '',
        materialName: mat?.materialName || '',
        unit: mat?.unit || 'PCS',
        requiredQuantity: quantity,
        reservedQuantity: quantity,
        issuedQuantity: 0,
        usedQuantity: 0,
        returnedQuantity: 0,
        damagedQuantity: 0,
        unitCost: current.averageCost,
        totalCost: quantity * current.averageCost,
        status: 'RESERVED',
        requestedBy,
        repairItemName,
        createdAt: now,
        updatedAt: now
      });
    }

    // Record Transaction
    this.transactions.push({
      id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
      materialId,
      materialCode: current.materialCode,
      materialName: current.materialName,
      unit: current.unit,
      transactionType: 'RESERVE',
      quantity,
      unitCost: current.averageCost,
      totalCost: quantity * current.averageCost,
      beforeQuantity: current.quantity,
      afterQuantity: current.quantity,
      referenceType: 'WORK_ORDER',
      referenceId: workOrderNo,
      workOrderId,
      workOrderNo,
      containerId,
      containerNo,
      performedBy: requestedBy,
      performedAt: now,
      note: `Tạm giữ ${quantity} ${current.unit} cho Lệnh sửa chữa ${workOrderNo} (${containerNo})`
    });

    return { success: true };
  }

  // 8. Báo cáo Vật tư hỏng trực tiếp
  reportDirectDamage(
    materialId: number,
    quantity: number,
    reason: string,
    resolution: MaterialDamage['resolution'] = 'PENDING_SURVEY',
    reportedBy: string = 'Trần Văn Mạnh (Thủ kho EMR)',
    workOrderNo?: string,
    containerNo?: string
  ): MaterialDamage {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const balanceIdx = this.stockBalances.findIndex((b) => b.materialId === materialId);
    const current = this.stockBalances[balanceIdx];
    const mat = this.materials.find((m) => m.id === materialId);
    const unitCost = current ? current.averageCost : 0;
    const totalCost = quantity * unitCost;

    // Update DamagedQuantity
    if (balanceIdx >= 0) {
      this.stockBalances[balanceIdx] = this.refreshBalance({
        ...current,
        damagedQuantity: current.damagedQuantity + quantity
      });
    }

    const damageId = Math.max(0, ...this.damages.map((d) => d.id)) + 1;
    const newDamage: MaterialDamage = {
      id: damageId,
      damageNo: `PHG-2026-${damageId.toString().padStart(4, '0')}`,
      materialId,
      materialCode: mat?.materialCode || '',
      materialName: mat?.materialName || '',
      unit: mat?.unit || 'PCS',
      quantity,
      unitCost,
      totalCost,
      reportedDate: now.substring(0, 10),
      workOrderNo,
      containerNo,
      reportedBy,
      reason,
      resolution,
      lossAmount: totalCost,
      createdAt: now
    };

    this.damages.unshift(newDamage);

    // Record Transaction
    this.transactions.push({
      id: Math.max(0, ...this.transactions.map((t) => t.id)) + 1,
      materialId,
      materialCode: mat?.materialCode || '',
      materialName: mat?.materialName || '',
      unit: mat?.unit || 'PCS',
      transactionType: 'DAMAGE',
      quantity,
      unitCost,
      totalCost,
      beforeQuantity: current?.quantity || 0,
      afterQuantity: current?.quantity || 0,
      referenceType: 'DAMAGE',
      referenceId: newDamage.damageNo,
      performedBy: reportedBy,
      performedAt: now,
      note: `Ghi nhận vật tư hỏng: ${reason}`
    });

    return newDamage;
  }

  // 9. Báo cáo Chi phí vật tư theo từng Container (Container Material Cost)
  getContainerMaterialCostReports(): ContainerMaterialCostReport[] {
    const contMap = new Map<string, ContainerMaterialCostReport>();

    this.workOrderMaterials.forEach((w) => {
      if (!w.containerNo) return;
      const key = `${w.containerNo}_${w.workOrderNo}`;
      if (!contMap.has(key)) {
        contMap.set(key, {
          containerNo: w.containerNo,
          workOrderNo: w.workOrderNo,
          shippingLine: w.shippingLine,
          completedDate: w.updatedAt.substring(0, 10),
          technicianName: w.issuedTo || 'Tổ sửa chữa EMR',
          materialItems: [],
          totalMaterialCost: 0
        });
      }

      const report = contMap.get(key)!;
      const actualQty = w.usedQuantity > 0 ? w.usedQuantity : w.issuedQuantity;
      const cost = actualQty * w.unitCost;

      report.materialItems.push({
        materialCode: w.materialCode,
        materialName: w.materialName,
        quantity: actualQty,
        unit: w.unit,
        unitCost: w.unitCost,
        totalCost: cost
      });

      report.totalMaterialCost += cost;
    });

    return Array.from(contMap.values()).sort((a, b) => b.totalMaterialCost - a.totalMaterialCost);
  }

  // 10. Báo cáo Chi phí vật tư theo Hãng tàu (Shipping Line Summary)
  getShippingLineMaterialSummaries(): ShippingLineMaterialSummaryReport[] {
    const lineMap = new Map<
      string,
      { totalContainers: Set<string>; totalWorkOrders: Set<string>; totalCost: number; matConsumptions: Map<string, number> }
    >();

    this.workOrderMaterials.forEach((w) => {
      const line = w.shippingLine || 'MAERSK LINE';
      if (!lineMap.has(line)) {
        lineMap.set(line, {
          totalContainers: new Set(),
          totalWorkOrders: new Set(),
          totalCost: 0,
          matConsumptions: new Map()
        });
      }

      const entry = lineMap.get(line)!;
      entry.totalContainers.add(w.containerNo);
      entry.totalWorkOrders.add(w.workOrderNo);

      const actualQty = w.usedQuantity > 0 ? w.usedQuantity : w.issuedQuantity;
      const cost = actualQty * w.unitCost;
      entry.totalCost += cost;

      const currentQty = entry.matConsumptions.get(w.materialName) || 0;
      entry.matConsumptions.set(w.materialName, currentQty + actualQty);
    });

    return Array.from(lineMap.entries()).map(([line, val]) => {
      let topMat = 'Chưa có';
      let maxQty = 0;
      val.matConsumptions.forEach((qty, name) => {
        if (qty > maxQty) {
          maxQty = qty;
          topMat = `${name} (${qty})`;
        }
      });

      return {
        shippingLine: line,
        totalContainers: val.totalContainers.size,
        totalWorkOrders: val.totalWorkOrders.size,
        totalMaterialCost: val.totalCost,
        topConsumedMaterial: topMat
      };
    });
  }
}

export const warehouseService = new WarehouseService();
