import React, { useState, useEffect } from 'react';
import { ShippingLineDebt, PaymentAllocation } from '../types';
import {
  X,
  DollarSign,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Zap,
  RotateCcw,
  Scale,
  Sparkles
} from 'lucide-react';

interface PaymentAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: ShippingLineDebt[];
  defaultCarrierId?: string;
  /** Hãng tàu thật (masterDataApi.getShippingLines) — id = mã hãng tàu. */
  shippingLines?: Array<{ id: string; name: string }>;
  defaultDebtId?: string;
  onSubmitPayment: (
    shippingLineId: string,
    paymentAmount: number,
    paymentMethod: 'BANK_TRANSFER' | 'SWIFT' | 'CASH' | 'VIETQR' | 'CREDIT_CARD',
    bankName: string,
    referenceNo: string,
    paymentDate: string,
    notes: string,
    allocations: { debtId: string; containerNo: string; quotationNo: string; amount: number }[]
  ) => void;
  currency: 'VND' | 'USD';
}

export const PaymentAllocationModal: React.FC<PaymentAllocationModalProps> = ({
  isOpen,
  onClose,
  debts,
  defaultCarrierId = '',
  shippingLines = [],
  defaultDebtId,
  onSubmitPayment,
  currency
}) => {
  const [shippingLineId, setShippingLineId] = useState<string>(defaultCarrierId);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'BANK_TRANSFER' | 'SWIFT' | 'CASH' | 'VIETQR' | 'CREDIT_CARD'
  >('BANK_TRANSFER');
  // Chưa có danh mục tài khoản ngân hàng ở backend — nhập tay (trước đây là 5 ngân hàng/tài khoản mẫu).
  const [bankName, setBankName] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Allocation state: map debtId -> allocated amount
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  // Filter debts for the selected shipping line that have remaining debt > 0
  const carrierDebts = (debts || []).filter(
    (d) => d.shippingLineId === shippingLineId && d.remainingAmount > 0 && d.status !== 'CANCELLED'
  );

  // Initialize or pre-fill defaultDebt if provided
  useEffect(() => {
    if (defaultDebtId) {
      const targetDebt = (debts || []).find((d) => d.id === defaultDebtId);
      if (targetDebt) {
        setShippingLineId(targetDebt.shippingLineId);
        setPaymentAmount(targetDebt.remainingAmount);
        setAllocations({ [targetDebt.id]: targetDebt.remainingAmount });
      }
    } else {
      setAllocations({});
    }
  }, [defaultDebtId, defaultCarrierId, debts]);

  if (!isOpen) return null;

  // When shippingLineId changes, clear allocations
  const handleCarrierChange = (newCarrier: string) => {
    setShippingLineId(newCarrier);
    setAllocations({});
    setPaymentAmount(0);
  };

  const handleAllocationChange = (debtId: string, value: number, maxAllowed: number) => {
    const safeVal = Math.max(0, Math.min(value || 0, maxAllowed));
    setAllocations((prev) => ({
      ...prev,
      [debtId]: safeVal
    }));
  };

  const handlePayFullSingleCont = (debt: ShippingLineDebt) => {
    setAllocations((prev) => ({
      ...prev,
      [debt.id]: debt.remainingAmount
    }));
  };

  // Helper: Auto-allocate FIFO (Oldest debts first)
  const handleAutoAllocateFIFO = () => {
    if (paymentAmount <= 0) return;

    let remainingFund = paymentAmount;
    const newAllocations: Record<string, number> = {};

    // Sort carrierDebts by date asc (oldest first)
    const sorted = [...carrierDebts].sort((a, b) => (a.debtDate > b.debtDate ? 1 : -1));

    for (const d of sorted) {
      if (remainingFund <= 0) {
        newAllocations[d.id] = 0;
        continue;
      }
      const canPay = Math.min(d.remainingAmount, remainingFund);
      newAllocations[d.id] = canPay;
      remainingFund -= canPay;
    }

    setAllocations(newAllocations);
  };

  // Helper: Equal distribution
  const handleAutoAllocateEqual = () => {
    if (paymentAmount <= 0 || carrierDebts.length === 0) return;
    const perCont = Math.floor(paymentAmount / carrierDebts.length);
    const newAllocations: Record<string, number> = {};
    carrierDebts.forEach((d) => {
      newAllocations[d.id] = Math.min(d.remainingAmount, perCont);
    });
    setAllocations(newAllocations);
  };

  // Helper: Clear allocations
  const handleClearAllocations = () => {
    setAllocations({});
  };

  // Calculations
  const totalAllocated = Object.values(allocations).reduce((sum, v) => sum + (v || 0), 0);
  const remainingFund = paymentAmount - totalAllocated;
  const isOverAllocated = totalAllocated > paymentAmount;
  const isValid =
    paymentAmount > 0 &&
    totalAllocated > 0 &&
    !isOverAllocated &&
    referenceNo.trim() !== '';

  const formatMoney = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + (currency === 'VND' ? ' đ' : ' $');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const allocationList = Object.entries(allocations)
      .filter(([_, amount]) => amount > 0)
      .map(([debtId, amount]) => {
        const d = carrierDebts.find((item) => item.id === debtId);
        return {
          debtId,
          containerNo: d?.containerNo || '',
          quotationNo: d?.quotationNo || '',
          amount
        };
      });

    onSubmitPayment(
      shippingLineId,
      paymentAmount,
      paymentMethod,
      bankName,
      referenceNo,
      paymentDate,
      notes,
      allocationList
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Xác Nhận & Phân Bổ Thanh Toán Công Nợ
              </h2>
              <p className="text-xs text-slate-500">
                Ghi nhận số tiền thanh toán từ Hãng tàu và phân bổ trừ công nợ cho từng Container
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Thông tin thanh toán */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-600" />
              <span>1. Thông tin giao dịch thanh toán</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Chọn Hãng tàu */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Hãng tàu thanh toán <span className="text-rose-600">*</span>
                </label>
                <select
                  value={shippingLineId}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-bold"
                >
                  <option value="">{shippingLines.length === 0 ? '— Chưa có hãng tàu —' : '— Chọn hãng tàu —'}</option>
                  {shippingLines.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Số tiền thanh toán */}
              <div>
                <label className="block text-[11px] font-semibold text-emerald-600 mb-1">
                  Số tiền thanh toán (VNĐ) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Nhập số tiền..."
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-sm text-emerald-700 font-mono font-bold focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              {/* Ngày thanh toán */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ngày thanh toán <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                  required
                />
              </div>

              {/* Phương thức */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="BANK_TRANSFER">Ủy nhiệm chi (Bank Transfer)</option>
                  <option value="SWIFT">Điện chuyển tiền Quốc tế (SWIFT)</option>
                  <option value="VIETQR">Quét mã VietQR Ngân hàng</option>
                  <option value="CASH">Tiền mặt tại quỹ (Cash)</option>
                  <option value="CREDIT_CARD">Thẻ tín dụng / Thẻ doanh nghiệp</option>
                </select>
              </div>

              {/* Ngân hàng nhận */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Tài khoản Ngân hàng Depot
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Tên ngân hàng / số tài khoản nhận tiền"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Mã tham chiếu / UNC */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Mã giao dịch / Số UNC <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="VD: VCB-UNC-2026-9901"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Ghi chú thanh toán
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Thanh toán đợt 1 tiền sửa chữa container..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Section 2: Danh sách Container đang nợ & Bảng Phân bổ */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-600" />
                <span>
                  2. Phân bổ thanh toán cho từng Container ({carrierDebts.length} cont đang nợ)
                </span>
              </div>

              {/* Smart allocation buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoAllocateFIFO}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-200 transition cursor-pointer"
                  title="Tự động phân bổ theo thứ tự cont nợ trước trả trước (FIFO)"
                >
                  <Zap className="w-3 h-3 text-sky-600" />
                  <span>Tự động FIFO (Nợ cũ trước)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoAllocateEqual}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition cursor-pointer"
                  title="Chia đều số tiền thanh toán cho tất cả cont"
                >
                  <span>Chia đều</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAllocations}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  title="Xóa phân bổ"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Container Allocation Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">CONTAINER</th>
                      <th className="py-2.5 px-3">BÁO GIÁ</th>
                      <th className="py-2.5 px-3 text-right">TỔNG NỢ</th>
                      <th className="py-2.5 px-3 text-right">ĐÃ TRẢ</th>
                      <th className="py-2.5 px-3 text-right">CÒN NỢ</th>
                      <th className="py-2.5 px-3 text-right w-44">TIỀN PHÂN BỔ</th>
                      <th className="py-2.5 px-3 text-center">TRẢ HẾT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {carrierDebts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Hãng tàu {shippingLineId} hiện không có container nào còn dư nợ.
                        </td>
                      </tr>
                    ) : (
                      carrierDebts.map((d) => {
                        const allocatedVal = allocations[d.id] || 0;
                        const isFullyPaidByAlloc = allocatedVal === d.remainingAmount;

                        return (
                          <tr key={d.id} className="hover:bg-white transition-colors">
                            {/* Container No */}
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {d.containerNo}
                            </td>

                            {/* Quotation No */}
                            <td className="py-2.5 px-3 font-mono text-slate-700">
                              {d.quotationNo}
                            </td>

                            {/* Total Amount */}
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {formatMoney(d.totalAmount)}
                            </td>

                            {/* Paid Amount */}
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                              {formatMoney(d.paidAmount)}
                            </td>

                            {/* Remaining Amount */}
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-sky-600">
                              {formatMoney(d.remainingAmount)}
                            </td>

                            {/* Allocation Input */}
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                max={d.remainingAmount}
                                step="1000"
                                value={allocatedVal || ''}
                                onChange={(e) =>
                                  handleAllocationChange(
                                    d.id,
                                    parseFloat(e.target.value) || 0,
                                    d.remainingAmount
                                  )
                                }
                                placeholder="0"
                                className="w-36 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-sky-500"
                              />
                            </td>

                            {/* Trả hết nút */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handlePayFullSingleCont(d)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                  isFullyPaidByAlloc
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isFullyPaidByAlloc ? 'Đã gán hết' : 'Gán hết'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Allocation Summary Calculation Bar */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-slate-500">Tổng thanh toán: </span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatMoney(paymentAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Đã phân bổ: </span>
                  <span className="font-mono font-bold text-sky-600">
                    {formatMoney(totalAllocated)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Còn lại chưa phân bổ: </span>
                  <span
                    className={`font-mono font-bold ${
                      isOverAllocated
                        ? 'text-rose-600'
                        : remainingFund === 0
                        ? 'text-emerald-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {formatMoney(remainingFund)}
                  </span>
                </div>
              </div>

              {isOverAllocated && (
                <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs animate-bounce">
                  <AlertCircle className="w-4 h-4" />
                  <span>Tổng phân bổ vượt quá số tiền thanh toán!</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={!isValid}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg ${
                isValid
                  ? 'bg-sky-600 hover:bg-sky-500 text-white '
                  : 'bg-slate-100 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Thanh Toán & Trừ Công Nợ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
