import React, { useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { Estimate, RepairItem } from '../types';
import { AemsLineItems, AemsHours, blankAemsItem, calcAemsTotals, normalizeAemsItem } from './AemsLineItems';
import { useDepot } from '../../../context/DepotContext';
import {
  Send,
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
  onSave: (estimate: Estimate, sendAfter?: boolean) => void;
  containers: ContainerRecord[];
  editEstimate?: Estimate | null;
  /** Container chọn sẵn (mở từ danh sách "đã thu tiền – chờ lập báo giá"). */
  initialContainerId?: string;
  /** Hãng tàu đã cấu hình API hay chưa — quyết định nút "Lưu & Gửi Hãng Tàu" / "Lưu & Xác Nhận". */
  canSendApi?: (shippingLine?: string) => boolean;
}

export const CreateEstimateModal: React.FC<CreateEstimateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  containers = [],
  editEstimate,
  initialContainerId,
  canSendApi
}) => {
  const { loggedInUserProfile } = useDepot();
  // Chỉ container đang chờ báo giá (ESTIMATING) VÀ đã thu tiền phiếu dịch vụ mới được lập báo giá (backend cũng
  // chặn). Trước đây ô chọn liệt kê toàn bộ container, kể cả chưa giám định / chưa thu tiền.
  const eligibleContainers = (containers || []).filter(
    (c) => c.status === 'ESTIMATING' && c.paymentStatus === 'PAID'
  );

  const editingContainer = editEstimate
    ? (containers || []).find((c) => c.id === editEstimate.containerId || c.containerNo === editEstimate.containerNo)
    : undefined;
  const selectableContainers = editingContainer ? [editingContainer] : eligibleContainers;
  const initialCont = editingContainer
    || eligibleContainers.find((c) => c.id === initialContainerId)
    || eligibleContainers[0];

  const [selectedContId, setSelectedContId] = useState<string>(initialCont?.id || '');

  const selectedContainer = selectableContainers.find((c) => c.id === selectedContId) || initialCont;

  const [repairSummary, setRepairSummary] = useState<string>(
    editEstimate?.repairSummary || ''
  );
  const [vatRate, setVatRate] = useState<number>(editEstimate?.vatRate ?? 0.08);
  const [notes, setNotes] = useState<string>(editEstimate?.notes || '');
  const [surveyRef, setSurveyRef] = useState<string>(
    // Không tự bịa số tham chiếu — để trống cho người báo giá nhập (hoặc giữ số đã lưu khi sửa).
    editEstimate?.surveyReference || ''
  );
  const [photos, setPhotos] = useState<string[]>(
    (editEstimate?.inspectionPhotos || []).filter(Boolean)
  );
  const [newPhotoInput, setNewPhotoInput] = useState('');
  // AEMS: đơn giá giờ công, Mode, Cause (giữ giá trị đã lưu khi sửa).
  const [laborRate, setLaborRate] = useState<number>(editEstimate?.laborRate || 0);
  const [repairMode, setRepairMode] = useState<string>(editEstimate?.repairMode || '');
  const [cause, setCause] = useState<string>(editEstimate?.cause || '');
  const [shopCode, setShopCode] = useState<string>(editEstimate?.shopCode || '');
  const [vendorRefNo, setVendorRefNo] = useState<string>(editEstimate?.vendorRefNo || '');
  const [hours, setHours] = useState<AemsHours>({
    preparationHours: editEstimate?.preparationHours || 0,
    ordinaryHours: editEstimate?.ordinaryHours || 0,
    ot1Hours: editEstimate?.ot1Hours || 0,
    ot2Hours: editEstimate?.ot2Hours || 0,
    ot3Hours: editEstimate?.ot3Hours || 0
  });

  // Line items state
  const [items, setItems] = useState<RepairItem[]>(() =>
    editEstimate && editEstimate.items.length > 0 ? editEstimate.items : [blankAemsItem(editEstimate?.vatRate ?? 0.08)]
  );

  if (!isOpen) return null;

  // Tổng tiền theo AEMS: công (tổng giờ × đơn giá giờ) + vật tư (Σ PCS × vật tư/PC) + VAT.
  const totals = calcAemsTotals(items, laborRate, vatRate, hours.preparationHours);
  const { subtotal, vatAmount, totalAmount } = totals;

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEstimate(false);
  };

  // sendAfter = true: lưu xong gửi luôn báo giá tới API hãng tàu.
  const submitEstimate = (sendAfter: boolean) => {

    if (!selectedContainer) {
      alert('Chưa có container nào đã thu tiền và đang chờ báo giá.');
      return;
    }

    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất 01 dòng sửa chữa.');
      return;
    }
    const badLine = items.findIndex((i) => !(i.quantity > 0) || i.unitPrice < 0 || (i.manHoursPerPiece ?? 0) < 0 || !(i.description?.trim() || i.repairCode));
    if (badLine >= 0) {
      alert(`Dòng ${badLine + 1}: cần Description (hoặc Repair code), PCS > 0, giờ công và vật tư không âm.`);
      return;
    }
    if (items.some((i) => (i.manHoursPerPiece ?? 0) > 0) && !(laborRate > 0)) {
      alert('Có giờ công nhưng chưa nhập đơn giá giờ công (VND/giờ).');
      return;
    }

    const now = new Date();
    // Ngày theo giờ địa phương (toISOString là UTC → trước 7h sáng mã báo giá bị lùi 1 ngày).
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const estimateNo = editEstimate?.estimateNo || `EST-${dateStr}-${randomSeq}`;

    // Generate summary if empty
    const summary =
      repairSummary ||
      items.map((i) => i.description || i.repairMethod).filter(Boolean).join(', ');

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
      createdBy: editEstimate?.createdBy || loggedInUserProfile?.fullName || loggedInUserProfile?.username || '',
      createdById: editEstimate?.createdById || String(loggedInUserProfile?.id ?? ''),
      createdAt: editEstimate?.createdAt || now.toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: now.toISOString().replace('T', ' ').substring(0, 16),
      repairSummary: summary,
      items: items.map((i) => normalizeAemsItem(i, laborRate, vatRate)),
      laborRate,
      repairMode,
      cause,
      shopCode,
      vendorRefNo,
      ...hours,
      totalManHours: totals.totalManHours,
      laborCost: totals.laborCost,
      materialCost: totals.materialCost,
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

    onSave(newEstimate, sendAfter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-mono font-bold">
                  {editEstimate ? 'CHỈNH SỬA BÁO GIÁ' : 'LẬP BÁO GIÁ SỬA CHỮA MỚI (NEW ESTIMATE)'}
                </span>
                {editEstimate && (
                  <span className="text-xs font-mono text-cyan-600">{editEstimate.estimateNo}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Biểu Phí Dự Toán Sửa Chữa Container EMR &bull; Chuẩn CEDEX / IICL-6
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Container & Basic Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>1. Thông Tin Container Giám Định</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Container đã thu tiền chờ báo giá: {eligibleContainers.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn Container (đã thu tiền · chờ báo giá):*
                </label>
                {selectableContainers.length === 0 ? (
                  <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
                    Chưa có container nào đã thu tiền và đang chờ báo giá.
                  </div>
                ) : (
                  <select
                    value={selectedContainer?.id || ''}
                    onChange={(e) => setSelectedContId(e.target.value)}
                    disabled={!!editEstimate}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    {selectableContainers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.containerNo} — {c.shippingLine} ({c.size}){c.condition ? ` [${c.condition}]` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vendor Ref No. (tuỳ chọn):
                </label>
                <input
                  type="text"
                  value={vendorRefNo}
                  onChange={(e) => setVendorRefNo(e.target.value)}
                  className="w-full mb-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                />
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã Giám Định / Tham Chiếu e-EIR:
                </label>
                <input
                  type="text"
                  value={surveyRef}
                  onChange={(e) => setSurveyRef(e.target.value)}
                  placeholder="EIR-SURVEY-..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-cyan-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thuế Suất VAT Áp Dụng:
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value);
                    setVatRate(newRate);
                    // update items VAT
                    setItems(items.map((i) => normalizeAemsItem(i, laborRate, newRate)));
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-amber-700 focus:outline-none focus:border-amber-500"
                >
                  <option value={0.08}>VAT 8% (Chính sách ưu đãi thuế EMR)</option>
                  <option value={0.1}>VAT 10% (Thuế chuẩn dịch vụ vận tải)</option>
                  <option value={0.0}>VAT 0% (Miễn thuế / Hãng tàu chỉ định)</option>
                </select>
              </div>
            </div>

            {/* Container Details Highlight Box */}
            {selectedContainer && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <div>
                  <span className="text-slate-500">Container:</span>{' '}
                  <strong className="text-slate-900 font-mono text-sm">{selectedContainer.containerNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Hãng Tàu:</span>{' '}
                  <strong className="text-blue-600 font-mono">{selectedContainer.shippingLine}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Kích Thước:</span>{' '}
                  <strong className="text-amber-700 font-mono">{selectedContainer.size} ({selectedContainer.isoCode || '45G1'})</strong>
                </div>
                <div>
                  <span className="text-slate-500">Phân Loại:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded font-bold font-mono ${
                      selectedContainer.condition === 'DM'
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {selectedContainer.condition} ({selectedContainer.condition === 'DM' ? 'Hư Hỏng EMR' : 'Cần Vệ Sinh'})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Repair Line Items — cấu trúc Work Order Maersk AEMS */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="border-b border-slate-200/80 pb-2">
              <h4 className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1.5">
                <Wrench className="w-4 h-4" />
                <span>2. Repair Line Items (chuẩn Maersk AEMS)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Item total = PCS &times; Mat. cost/PC &bull; Labor = Tổng giờ công &times; đơn giá giờ &bull; Tổng = Labor + Material + VAT
              </p>
            </div>
            <AemsLineItems
              items={items}
              onItemsChange={setItems}
              laborRate={laborRate}
              onLaborRateChange={setLaborRate}
              vatRate={vatRate}
              repairMode={repairMode}
              onRepairModeChange={setRepairMode}
              cause={cause}
              onCauseChange={setCause}
              shippingLine={selectedContainer?.shippingLine}
              shopCode={shopCode}
              onShopCodeChange={setShopCode}
              surveyContainerNo={selectedContainer?.containerNo}
              hours={hours}
              onHoursChange={setHours}
            />
          </div>

          {/* Section 3: Notes & Photos */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-600" />
              <span>3. Ghi Chú &amp; Hình Ảnh Giám Định Hiện Trường</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú nội dung sửa chữa / Đề xuất hãng tàu:
              </label>
              <textarea
                rows={2}
                value={notes}
                maxLength={255}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please indicate general condition of box, main damage consists, wear and tear share of repair, repair in other mode required."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Photos preview & add URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Hình ảnh giám định đính kèm ({photos.length}):
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white">
                    <img src={url} alt={`Inspection ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-white p-1 rounded text-rose-600 hover:text-slate-900 transition"
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
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 w-60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoInput) {
                        setPhotos([...photos, newPhotoInput]);
                        setNewPhotoInput('');
                      }
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    + Thêm Ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Hệ thống sẽ sinh mã Estimate duy nhất dạng <strong className="text-amber-600 font-mono">EST-YYYYMMDD-XXXXX</strong>.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Báo Giá</span>
              </button>

              <button
                type="button"
                onClick={() => submitEstimate(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                title="Lưu rồi chốt luôn báo giá (gửi API nếu hãng tàu đã cấu hình)"
              >
                <Send className="w-4 h-4" />
                <span>{canSendApi?.(selectedContainer?.shippingLine) ? 'Lưu & Gửi Hãng Tàu' : 'Lưu & Xác Nhận'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
