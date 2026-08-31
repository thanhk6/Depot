import React, { useEffect, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { Estimate, RepairItem } from '../types';
import { masterDataApi } from '../../../api';
import { formatVND } from '../../../utils/format';
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  X, 
  Calculator, 
  Camera, 
  AlertCircle,
  HelpCircle,
  Layers,
  Wrench,
  Percent
} from 'lucide-react';

interface CreateEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (estimate: Estimate) => void;
  containers: ContainerRecord[];
  editEstimate?: Estimate | null;
}

export const CreateEstimateModal: React.FC<CreateEstimateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  containers = [],
  editEstimate
}) => {
  // Filter eligible containers (DM or CL, or any container)
  const eligibleContainers = (containers || []).filter(
    (c) => c.condition === 'DM' || c.condition === 'CL'
  );

  const initialCont = editEstimate
    ? (containers || []).find((c) => c.id === editEstimate.containerId || c.containerNo === editEstimate.containerNo)
    : eligibleContainers[0] || containers[0];

  const [selectedContId, setSelectedContId] = useState<string>(
    initialCont?.id || (containers[0]?.id ?? '')
  );

  const selectedContainer = (containers || []).find((c) => c.id === selectedContId) || initialCont;

  const [repairSummary, setRepairSummary] = useState<string>(
    editEstimate?.repairSummary || ''
  );
  const [vatRate, setVatRate] = useState<number>(editEstimate?.vatRate ?? 0.08);
  const [notes, setNotes] = useState<string>(editEstimate?.notes || '');
  const [surveyRef, setSurveyRef] = useState<string>(
    editEstimate?.surveyReference || `EIR-SURVEY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`
  );
  const [photos, setPhotos] = useState<string[]>(
    editEstimate?.inspectionPhotos || [
      ''
    ]
  );
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [cedexLocations, setCedexLocations] = useState<any[]>([]);
  const [cedexDamages, setCedexDamages] = useState<any[]>([]);
  const [cedexRepairs, setCedexRepairs] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      masterDataApi.getCatalog('DAMAGE_LOCATION'),
      masterDataApi.getCatalog('DAMAGE_CODE'),
      masterDataApi.getCatalog('REPAIR_CODE')
    ]).then(([locations, damages, repairs]: any[]) => {
      setCedexLocations((locations.data || []).map((item: any) => ({ code: item.code, name: item.nameVi || item.name })));
      setCedexDamages((damages.data || []).map((item: any) => ({ code: item.code, name: item.nameVi || item.name })));
      setCedexRepairs((repairs.data || []).map((item: any) => ({ code: item.code, name: item.nameVi || item.name, defaultUnit: 'Lần', defaultUnitPrice: 0 })));
    }).catch((error) => console.error('Không thể tải catalog Estimate:', error));
  }, []);

  // Line items state
  const [items, setItems] = useState<RepairItem[]>(() => {
    if (editEstimate && editEstimate.items.length > 0) {
      return editEstimate.items;
    }
    // Default 1 line item
    const loc = cedexLocations[0];
    const dmg = cedexDamages[0];
    const rep = cedexRepairs[0];
    if (!loc || !dmg || !rep) return [];
    const qty = 1;
    const price = rep.defaultUnitPrice;
    const amount = qty * price;
    const vatAmt = amount * vatRate;

    return [
      {
        id: `ITEM-${Date.now()}-1`,
        damageLocationCode: loc.code,
        damageLocationName: loc.name,
        damageCode: dmg.code,
        damageName: dmg.name,
        repairCode: rep.code,
        repairMethod: rep.name,
        description: 'Móp méo sóng vách hông cần nắn nguội định hình',
        quantity: qty,
        unit: rep.defaultUnit,
        unitPrice: price,
        amount,
        vatRate,
        vatAmount: vatAmt,
        totalAmount: amount + vatAmt,
        cedexCode: `${loc.code}-${dmg.code}-${rep.code}`
      }
    ];
  });

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const vatAmount = subtotal * vatRate;
  const totalAmount = subtotal + vatAmount;

  // Add new line item
  const handleAddItem = () => {
    const loc = cedexLocations[0];
    const dmg = cedexDamages[0];
    const rep = cedexRepairs[0];
    if (!loc || !dmg || !rep) return;
    const qty = 1;
    const price = rep.defaultUnitPrice;
    const amount = qty * price;
    const vatAmt = amount * vatRate;

    const newItem: RepairItem = {
      id: `ITEM-${Date.now()}-${items.length + 1}`,
      damageLocationCode: loc.code,
      damageLocationName: loc.name,
      damageCode: dmg.code,
      damageName: dmg.name,
      repairCode: rep.code,
      repairMethod: rep.name,
      description: 'Hư hỏng cần xử lý theo quy chuẩn IICL-6',
      quantity: qty,
      unit: rep.defaultUnit,
      unitPrice: price,
      amount,
      vatRate,
      vatAmount: vatAmt,
      totalAmount: amount + vatAmt,
      cedexCode: `${loc.code}-${dmg.code}-${rep.code}`
    };

    setItems([...items, newItem]);
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      alert('Báo giá phải có ít nhất 01 hạng mục sửa chữa!');
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  };

  // Update line item property
  const handleUpdateItem = (id: string, updates: Partial<RepairItem>) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };

          // Recalculate amount
          const qty = updated.quantity || 0;
          const price = updated.unitPrice || 0;
          const amount = qty * price;
          const currentVatRate = updated.vatRate ?? vatRate;
          const vatAmt = amount * currentVatRate;

          return {
            ...updated,
            amount,
            vatAmount: vatAmt,
            totalAmount: amount + vatAmt,
            cedexCode: `${updated.damageLocationCode}-${updated.damageCode}-${updated.repairCode}`
          };
        }
        return item;
      })
    );
  };

  // Quick CEDEX selection changes
  const handleLocationChange = (itemId: string, code: string) => {
    const loc = cedexLocations.find((l) => l.code === code);
    if (loc) {
      handleUpdateItem(itemId, {
        damageLocationCode: loc.code,
        damageLocationName: loc.name
      });
    }
  };

  const handleDamageChange = (itemId: string, code: string) => {
    const dmg = cedexDamages.find((d) => d.code === code);
    if (dmg) {
      handleUpdateItem(itemId, {
        damageCode: dmg.code,
        damageName: dmg.name
      });
    }
  };

  const handleRepairChange = (itemId: string, code: string) => {
    const rep = cedexRepairs.find((r) => r.code === code);
    if (rep) {
      handleUpdateItem(itemId, {
        repairCode: rep.code,
        repairMethod: rep.name,
        unit: rep.defaultUnit,
        unitPrice: rep.defaultUnitPrice
      });
    }
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContainer) {
      alert('Vui lòng chọn Container cần lập báo giá.');
      return;
    }

    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 01 hạng mục sửa chữa.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const estimateNo = editEstimate?.estimateNo || `EST-${dateStr}-${randomSeq}`;

    // Generate summary if empty
    const summary =
      repairSummary ||
      items.map((i) => `${i.damageLocationName} (${i.damageName}) - ${i.repairMethod}`).join(', ');

    const newEstimate: Estimate = {
      id: editEstimate?.id || `EST-ID-${Date.now()}`,
      estimateNo,
      containerId: selectedContainer.id,
      containerNo: selectedContainer.containerNo,
      isoCode: selectedContainer.isoCode || '45G1',
      size: selectedContainer.size,
      type: selectedContainer.type || 'Dry High Cube',
      shippingLine: selectedContainer.shippingLine,
      condition: (selectedContainer.condition === 'CL' ? 'CL' : 'DM'),
      createdBy: editEstimate?.createdBy || 'Trần Hải Đăng (Báo Giá EMR)',
      createdById: editEstimate?.createdById || 'EMP-EST-01',
      createdAt: editEstimate?.createdAt || now.toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: now.toISOString().replace('T', ' ').substring(0, 16),
      repairSummary: summary,
      items,
      subtotal,
      vatRate,
      vatAmount,
      totalAmount,
      currency: 'VND',
      status: editEstimate?.status === 'SUBMITTED' ? 'SUBMITTED' : 'READY',
      surveyReference: surveyRef,
      inspectionPhotos: photos,
      notes,
      lastApiStatus: editEstimate?.lastApiStatus || 'NOT_SENT',
      lastApiResponse: editEstimate?.lastApiResponse,
      apiTransactionHistory: editEstimate?.apiTransactionHistory || []
    };

    onSave(newEstimate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-mono font-bold">
                  {editEstimate ? 'CHỈNH SỬA BÁO GIÁ' : 'LẬP BÁO GIÁ SỬA CHỮA MỚI (NEW ESTIMATE)'}
                </span>
                {editEstimate && (
                  <span className="text-xs font-mono text-cyan-400">{editEstimate.estimateNo}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Biểu Phí Dự Toán Sửa Chữa Container EMR &bull; Chuẩn CEDEX / IICL-6
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Container & Basic Info */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>1. Thông Tin Container Giám Định</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Số lượng Container CL/DM chờ báo giá: {eligibleContainers.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn Container (Condition CL / DM):*
                </label>
                <select
                  value={selectedContId}
                  onChange={(e) => setSelectedContId(e.target.value)}
                  disabled={!!editEstimate}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.containerNo} — {c.shippingLine} ({c.size}) [{c.condition}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mã Giám Định / Tham Chiếu e-EIR:
                </label>
                <input
                  type="text"
                  value={surveyRef}
                  onChange={(e) => setSurveyRef(e.target.value)}
                  placeholder="EIR-SURVEY-..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Thuế Suất VAT Áp Dụng:
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value);
                    setVatRate(newRate);
                    // update items VAT
                    setItems(
                      items.map((i) => {
                        const vatAmt = i.amount * newRate;
                        return {
                          ...i,
                          vatRate: newRate,
                          vatAmount: vatAmt,
                          totalAmount: i.amount + vatAmt
                        };
                      })
                    );
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                >
                  <option value={0.08}>VAT 8% (Chính sách ưu đãi thuế EMR)</option>
                  <option value={0.1}>VAT 10% (Thuế chuẩn dịch vụ vận tải)</option>
                  <option value={0.0}>VAT 0% (Miễn thuế / Hãng tàu chỉ định)</option>
                </select>
              </div>
            </div>

            {/* Container Details Highlight Box */}
            {selectedContainer && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                <div>
                  <span className="text-slate-400">Container:</span>{' '}
                  <strong className="text-white font-mono text-sm">{selectedContainer.containerNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Hãng Tàu:</span>{' '}
                  <strong className="text-blue-400 font-mono">{selectedContainer.shippingLine}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Kích Thước:</span>{' '}
                  <strong className="text-amber-300 font-mono">{selectedContainer.size} ({selectedContainer.isoCode || '45G1'})</strong>
                </div>
                <div>
                  <span className="text-slate-400">Phân Loại:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded font-bold font-mono ${
                      selectedContainer.condition === 'DM'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {selectedContainer.condition} ({selectedContainer.condition === 'DM' ? 'Hư Hỏng EMR' : 'Cần Vệ Sinh'})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Repair Line Items (Dynamic Table with CEDEX Codes) */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" />
                  <span>2. Bảng Hạng Mục Sửa Chữa (CEDEX Damage &amp; Repair Breakdown)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Thành tiền = Số lượng &times; Đơn giá &bull; Tổng báo giá = Tổng các hạng mục + VAT
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Hạng Mục</span>
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900 rounded-2xl border border-slate-800/90 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        CEDEX: [{item.cedexCode}]
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition cursor-pointer"
                      title="Xóa hạng mục này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3 CEDEX Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Vị trí hư hỏng */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Vị trí hư hỏng (Location):
                      </label>
                      <select
                        value={item.damageLocationCode}
                        onChange={(e) => handleLocationChange(item.id, e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      >
                        {cedexLocations.map((loc) => (
                          <option key={loc.code} value={loc.code}>
                            {loc.code} - {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mã hư hỏng */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Mã hư hỏng (Damage Code):
                      </label>
                      <select
                        value={item.damageCode}
                        onChange={(e) => handleDamageChange(item.id, e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      >
                        {cedexDamages.map((dmg) => (
                          <option key={dmg.code} value={dmg.code}>
                            {dmg.code} - {dmg.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phương pháp sửa chữa */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Phương pháp sửa chữa (Repair Code):
                      </label>
                      <select
                        value={item.repairCode}
                        onChange={(e) => handleRepairChange(item.id, e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      >
                        {cedexRepairs.map((rep) => (
                          <option key={rep.code} value={rep.code}>
                            {rep.code} - {rep.name} ({rep.defaultUnit})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description & Cost calculation */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    {/* Description */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Mô tả chi tiết vị trí &amp; kích thước hư hỏng:
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                        placeholder="VD: Móp sâu 30mm x 250mm sóng thứ 2 vách trái..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Số lượng ({item.unit}):
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none text-right"
                        required
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Đơn giá (VNĐ):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none text-right"
                        required
                      />
                    </div>

                    {/* Line Amount (Auto calculated) */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Thành tiền (Chưa VAT):
                      </label>
                      <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-black text-amber-300 text-right">
                        {formatVND(item.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary Box */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-slate-300">
                <div>Tổng số hạng mục: <strong className="text-white">{items.length}</strong></div>
                <div>Thuế suất: <strong className="text-amber-400">{(vatRate * 100).toFixed(0)}%</strong> ({formatVND(vatAmount)})</div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs text-slate-400">
                  Tạm tính (Subtotal): <span className="font-mono text-slate-200">{formatVND(subtotal)}</span>
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  TỔNG BÁO GIÁ: {formatVND(totalAmount)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Photos */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>3. Ghi Chú &amp; Hình Ảnh Giám Định Hiện Trường</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghi chú nội dung sửa chữa / Đề xuất hãng tàu:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Hư hỏng do va quẹt cẩu bốc xếp. Đề xuất Hãng Tàu phê duyệt thay thế theo quy chuẩn IICL-6..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Photos preview & add URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Hình ảnh giám định đính kèm ({photos.length}):
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img src={url} alt={`Inspection ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-slate-900/80 p-1 rounded text-rose-400 hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Dán link ảnh đính kèm..."
                    value={newPhotoInput}
                    onChange={(e) => setNewPhotoInput(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white w-60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoInput) {
                        setPhotos([...photos, newPhotoInput]);
                        setNewPhotoInput('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    + Thêm Ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Hệ thống sẽ sinh mã Estimate duy nhất dạng <strong className="text-amber-400 font-mono">EST-YYYYMMDD-XXXXX</strong>.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Báo Giá</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
