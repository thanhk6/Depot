import React, { useState, useEffect } from 'react';
import { Material, StockBalance, WorkOrderMaterial } from '../../types';
import { X, ArrowUpFromLine, Plus, Trash2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatVND } from '../../../../utils/format';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  stockBalances: StockBalance[];
  workOrderMaterials: WorkOrderMaterial[];
  onConfirmIssue: (
    workOrderId: string,
    workOrderNo: string,
    containerId: string,
    containerNo: string,
    shippingLine: string,
    recipientName: string,
    note: string,
    items: { materialId: number; quantity: number; note?: string }[]
  ) => { success: boolean; error?: string };
}

interface IssueItemRow {
  materialId: number;
  quantity: number;
  note?: string;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  materials = [],
  stockBalances = [],
  workOrderMaterials = [],
  onConfirmIssue
}) => {
  // Preset list of Work Orders
  const availableWorkOrders = [
    { woNo: 'WO-20260816-00001', contNo: 'MSKU1234567', shippingLine: 'MAERSK LINE', defaultTech: 'Nguyễn Văn Hùng (Thợ gò hàn EMR)' },
    { woNo: 'WO-20260816-00002', contNo: 'MSKU7654321', shippingLine: 'MAERSK LINE', defaultTech: 'Lê Văn Tuấn (Thợ sửa cửa EMR)' },
    { woNo: 'WO-20260816-00003', contNo: 'MSKU8888999', shippingLine: 'MAERSK LINE', defaultTech: 'Vũ Đình Hải (Thợ sàn gỗ EMR)' },
    { woNo: 'WO-20260816-00004', contNo: 'MAEU4419208', shippingLine: 'MAERSK LINE', defaultTech: 'Nguyễn Văn Hùng (Thợ gò hàn EMR)' },
    { woNo: 'WO-20260817-00005', contNo: 'MSKU9920112', shippingLine: 'MAERSK LINE', defaultTech: 'Trần Văn Sơn (Thợ sơn EMR)' },
    { woNo: 'WO-20260817-00006', contNo: 'MAEU1109482', shippingLine: 'MAERSK LINE', defaultTech: 'Lê Văn Tuấn (Thợ sửa cửa EMR)' }
  ];

  const [selectedWO, setSelectedWO] = useState<string>(availableWorkOrders[0].woNo);
  const [recipientName, setRecipientName] = useState<string>(availableWorkOrders[0].defaultTech);
  const [note, setNote] = useState<string>('Xuất vật tư thi công sửa chữa container theo lệnh Work Order');
  const [items, setItems] = useState<IssueItemRow[]>([
    {
      materialId: materials[0]?.id || 1,
      quantity: 1,
      note: ''
    }
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const matched = availableWorkOrders.find((w) => w.woNo === selectedWO);
    if (matched) {
      setRecipientName(matched.defaultTech);
    }
  }, [selectedWO]);

  useEffect(() => {
    setErrorMessage(null);
  }, [isOpen, items]);

  if (!isOpen) return null;

  const currentWO = availableWorkOrders.find((w) => w.woNo === selectedWO) || availableWorkOrders[0];

  const handleAddItem = () => {
    const defaultMat = materials[0];
    setItems((prev) => [
      ...prev,
      {
        materialId: defaultMat?.id || 1,
        quantity: 1,
        note: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof IssueItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Stock check calculation for each row
  const rowValidations = items.map((row) => {
    const balance = stockBalances.find((b) => b.materialId === row.materialId);
    const available = balance ? balance.availableQuantity : 0;
    // Also include reserved for this WO
    const woMat = workOrderMaterials.find(
      (w) => w.workOrderNo === selectedWO && w.materialId === row.materialId
    );
    const reservedForThisWO = woMat ? woMat.reservedQuantity : 0;
    const effectiveAvailable = available + reservedForThisWO;
    const isSufficient = effectiveAvailable >= Number(row.quantity || 0);

    return {
      materialId: row.materialId,
      balance,
      available,
      reservedForThisWO,
      effectiveAvailable,
      isSufficient,
      shortage: Math.max(0, Number(row.quantity || 0) - effectiveAvailable)
    };
  });

  const hasAnyShortage = rowValidations.some((v) => !v.isSufficient);

  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const estimatedCost = items.reduce((sum, item) => {
    const b = stockBalances.find((sb) => sb.materialId === item.materialId);
    return sum + Number(item.quantity || 0) * (b?.averageCost || 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (hasAnyShortage) {
      const firstShortage = rowValidations.find((v) => !v.isSufficient);
      setErrorMessage(
        `KHÔNG THỂ XUẤT KHO!\n\nVật tư: ${firstShortage?.balance?.materialName}\nTồn khả dụng: ${firstShortage?.effectiveAvailable} ${firstShortage?.balance?.unit}\nYêu cầu: ${items.find((i) => i.materialId === firstShortage?.materialId)?.quantity} ${firstShortage?.balance?.unit}\nThiếu: ${firstShortage?.shortage} ${firstShortage?.balance?.unit}`
      );
      return;
    }

    const result = onConfirmIssue(
      `WO-${currentWO.woNo.slice(-6)}`,
      currentWO.woNo,
      `CONT-${currentWO.contNo}`,
      currentWO.contNo,
      currentWO.shippingLine,
      recipientName,
      note,
      items.map((i) => ({ ...i, quantity: Number(i.quantity) }))
    );

    if (!result.success) {
      setErrorMessage(result.error || 'Xuất kho thất bại do lỗi dữ liệu tồn kho.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lập Phiếu Xuất Kho Vật Tư Sửa Chữa (PXK)</h2>
              <p className="text-xs text-slate-400">
                Xuất từ: <span className="text-amber-400 font-semibold">KHO VẬT TƯ SỬA CHỮA EMR</span> • Kiểm tra tồn khả dụng tự động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/80 border border-rose-600/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="whitespace-pre-line font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Lệnh Sửa Chữa & Container <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedWO}
                onChange={(e) => setSelectedWO(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-semibold focus:border-amber-500 focus:outline-none"
              >
                {availableWorkOrders.map((wo) => (
                  <option key={wo.woNo} value={wo.woNo}>
                    {wo.woNo} • {wo.contNo} ({wo.shippingLine})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Thợ / Nhân Viên Nhận Vật Tư <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Ghi Chú Thi Công</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Xuất vật tư cho thợ gò hàn thay ván sàn và nắn vách..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span>Danh Sách Vật Tư Xuất</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px]">
                  {items.length} dòng
                </span>
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg flex items-center gap-1.5 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm vật tư</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Vật Tư</th>
                    <th className="px-3 py-2 w-28 text-center">Tồn Khả Dụng</th>
                    <th className="px-3 py-2 w-28 text-center">Số Lượng Xuất</th>
                    <th className="px-3 py-2 w-32 text-right">Đơn Giá TB</th>
                    <th className="px-3 py-2 w-32 text-right">Thành Tiền</th>
                    <th className="px-2 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((row, idx) => {
                    const val = rowValidations[idx];
                    const balance = val?.balance;
                    const rowCost = Number(row.quantity || 0) * (balance?.averageCost || 0);

                    return (
                      <tr
                        key={idx}
                        className={`transition ${!val.isSufficient ? 'bg-rose-950/30' : 'hover:bg-slate-900/40'}`}
                      >
                        <td className="px-3 py-2">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleItemChange(idx, 'materialId', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white focus:border-amber-500 focus:outline-none"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.materialCode}] {m.materialName} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="font-mono">
                            <span
                              className={`font-bold ${
                                val.effectiveAvailable === 0
                                  ? 'text-rose-400'
                                  : val.effectiveAvailable <= (balance?.reorderLevel || 10)
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {val.effectiveAvailable}
                            </span>
                            <span className="text-slate-400 text-[10px] ml-1">{balance?.unit}</span>
                          </div>
                          {val.reservedForThisWO > 0 && (
                            <span className="text-[10px] text-sky-400 block font-medium">
                              (Đã giữ: {val.reservedForThisWO})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className={`w-full bg-slate-900 border rounded-lg px-2 py-1.5 text-center font-mono font-bold ${
                              !val.isSufficient
                                ? 'border-rose-500 text-rose-300 bg-rose-950/50'
                                : 'border-slate-700 text-white'
                            }`}
                          />
                          {!val.isSufficient && (
                            <p className="text-[10px] text-rose-400 font-bold mt-0.5">
                              Thiếu {val.shortage} {balance?.unit}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-300">
                          {formatVND(balance?.averageCost || 0)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-amber-300">
                          {formatVND(rowCost)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            disabled={items.length <= 1}
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validation Notice */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {hasAnyShortage ? (
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Cảnh báo: Có vật tư không đủ tồn khả dụng! Vui lòng điều chỉnh số lượng.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tồn khả dụng đáp ứng 100% số lượng yêu cầu xuất.</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-slate-400 mr-2">Tổng chi phí vật tư:</span>
              <span className="text-sm font-bold text-amber-400 font-mono">{formatVND(estimatedCost)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={hasAnyShortage}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>Xác Nhận Xuất Kho (Deduct Stock)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
