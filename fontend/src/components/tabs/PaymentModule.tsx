import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import {
  CreditCard,
  QrCode,
  Banknote,
  Building2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Receipt,
  FileCheck2,
  Check
} from 'lucide-react';

export const PaymentModule: React.FC = () => {
  const { jobs, processPayment } = useDepot();

  const pendingPaymentJobs = jobs.filter(
    (j) => j.status === 'PAYMENT_PENDING' || j.payment?.status === 'PENDING' || j.payment?.status === 'PAID'
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(
    pendingPaymentJobs[0]?.id || jobs[0]?.id || ''
  );

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'BANK_TRANSFER' | 'CASH'>('VIETQR');
  const [simulatedTxRef, setSimulatedTxRef] = useState(`FT26${Date.now().toString().slice(-6)}`);
  const [simulatedAmount, setSimulatedAmount] = useState<number>(
    activeJob?.payment?.amount || 0
  );
  const [isSimulatingBank, setIsSimulatingBank] = useState(false);

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    const target = jobs.find((j) => j.id === id);
    if (target?.payment) {
      setSimulatedAmount(target.payment.amount);
    }
  };

  const handleSimulateAutoReconciliation = () => {
    if (!activeJob) return;

    setIsSimulatingBank(true);
    setTimeout(() => {
      processPayment(activeJob.id, paymentMethod, simulatedTxRef, simulatedAmount);
      setIsSimulatingBank(false);
    }, 1200);
  };

  const handleCashPayment = () => {
    if (!activeJob) return;

    processPayment(activeJob.id, 'CASH', `CASH-${Date.now().toString().slice(-6)}`, activeJob.payment?.amount);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-700/50 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/30">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">3. Thanh Toán & Tự Động Khớp Ngân Hàng (Payment)</h2>
            <p className="text-xs text-emerald-200/80">
              Thanh toán tiền mặt, Quét mã VietQR hoặc Khớp API Ngân hàng tự động theo mã Phiếu Dịch Vụ
            </p>
          </div>
        </div>

        {/* Container Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-emerald-200 whitespace-nowrap">Chọn Container:</label>
          <select
            value={selectedJobId}
            onChange={(e) => handleSelectJob(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-emerald-600/50 rounded-xl text-xs text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 min-w-[220px]"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.containerNo} ({j.isoSize} - {j.payment?.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thu tiền'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Payment Status & Receipt Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Thông Tin Phiếu Thu</span>
                <span className="font-mono text-slate-400">
                  {activeJob.payment?.paymentTicketNo || `PT-2026-${activeJob.id.split('-')?.[2] || activeJob.id}`}
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Container:</span>
                  <strong className="text-white font-mono">{activeJob.containerNo}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Khách hàng:</span>
                  <strong className="text-slate-200 truncate max-w-[180px]">
                    {activeJob.operation?.customer?.customerName || 'Khách vãng lai'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã Số Thuế:</span>
                  <span className="font-mono text-slate-300">
                    {activeJob.operation?.customer?.taxCode || '0312984511'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Trạng Thái Thu:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      activeJob.payment?.status === 'PAID'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : activeJob.payment?.status === 'MISMATCHED'
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700/60'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-700/60 animate-pulse'
                    }`}
                  >
                    {activeJob.payment?.status === 'PAID'
                      ? 'ĐÃ THANH TOÁN'
                      : activeJob.payment?.status === 'MISMATCHED'
                      ? 'SAI LỆCH CẦN KIỂM TRA'
                      : 'CHỜ THANH TOÁN'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1">Số Tiền Phải Thu:</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {(activeJob.payment?.amount || activeJob.operation?.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>

                {activeJob.payment?.status === 'PAID' && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl space-y-1 text-[11px]">
                    <div className="flex justify-between text-emerald-300">
                      <span>Mã Giao Dịch Ngân Hàng:</span>
                      <strong className="font-mono">{activeJob.payment.transactionRef}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Thời Gian Thu:</span>
                      <strong className="font-mono">{activeJob.payment.paidDate}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Người Xác Nhận:</span>
                      <strong>{activeJob.payment.cashierName}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                Hình Thức Thanh Toán
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VIETQR')}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'VIETQR'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>VietQR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Chuyển Khoản</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Tiền Mặt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Bank API Auto Reconciliation Simulation */}
          <div className="lg:col-span-2 space-y-4">
            {paymentMethod === 'VIETQR' || paymentMethod === 'BANK_TRANSFER' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Mã Thanh Toán VietQR Tự Động Khớp Lệnh Ngân Hàng</span>
                  </h3>
                  <span className="text-xs text-slate-400">Vietcombank / Napas247</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  {/* QR Code Graphic Box */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-lg text-slate-900">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STK_9901238491_NOIDUNG_DEPOT_${activeJob.id}`}
                      alt="VietQR Code"
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                    <div className="text-center mt-2 space-y-0.5">
                      <div className="font-bold text-xs">NGÂN HÀNG VIETCOMBANK</div>
                      <div className="font-mono text-xs font-semibold text-blue-600">
                        Số TK: 9901238491 (DEPOT CONTAINER JSC)
                      </div>
                      <div className="font-mono text-xs text-rose-600 font-extrabold">
                        Nội dung CK: DEPOT {activeJob.id}
                      </div>
                    </div>
                  </div>

                  {/* Bank API Auto-Reconciliation Simulation Form */}
                  <div className="space-y-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-700 pb-2">
                      <Building2 className="w-4 h-4" />
                      <span>Mô Phỏng Webhook API Ngân Hàng (Bank Auto Match)</span>
                    </div>

                    <p className="text-slate-300 text-[11px]">
                      Hệ thống kết nối trực tiếp API Vietcombank/ACB. Khi khách hàng chuyển khoản khớp đúng nội dung{' '}
                      <strong className="text-white font-mono">DEPOT {activeJob.id}</strong>, hệ thống tự động xác nhận đã thu tiền mà không cần kế toán thao tác thủ công.
                    </p>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">
                        Mã Giao Dịch Ngân Hàng Tự Động Sinh (TxnRef)
                      </label>
                      <input
                        type="text"
                        value={simulatedTxRef}
                        onChange={(e) => setSimulatedTxRef(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">
                        Số Tiền Khách Đã Chuyển Đáo Hạn (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={simulatedAmount}
                        onChange={(e) => setSimulatedAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm font-bold text-emerald-400"
                      />
                    </div>

                    <button
                      onClick={handleSimulateAutoReconciliation}
                      disabled={isSimulatingBank || activeJob.payment?.status === 'PAID'}
                      className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSimulatingBank ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang Kết Nối API Ngân Hàng Đối Chiếu...</span>
                        </>
                      ) : activeJob.payment?.status === 'PAID' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Đã Khớp Ngân Hàng & Lập Hóa Đơn</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Mô Phỏng Giao Dịch & Khớp Tự Động</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Cash Payment Box */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Thu Tiền Mặt Trực Tiếp Tại Quầy Thu Ngân</span>
                  </h3>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-xl space-y-3 text-xs border border-slate-700">
                  <div className="flex justify-between items-center text-slate-200">
                    <span>Số Tiền Cần Thu:</span>
                    <strong className="text-xl font-mono text-emerald-400">
                      {(activeJob.payment?.amount || activeJob.operation?.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                    </strong>
                  </div>

                  <p className="text-slate-300">
                    Thu ngân kiểm tra đếm đủ tiền mặt từ lái xe / đại diện khách hàng, sau đó bấm nút "Xác Nhận Đã Thu Tiền Mặt" để phát hành Phiếu thu điện tử.
                  </p>

                  <button
                    onClick={handleCashPayment}
                    disabled={activeJob.payment?.status === 'PAID'}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Xác Nhận Thu Tiền Mặt & Xuất Hóa Đơn</span>
                  </button>
                </div>
              </div>
            )}

            {/* Official Payment Receipt Document Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span>Chứng Từ Phiếu Thu Điện Tử</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">DEPOT-FINANCE-OFFICIAL</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                <div className="text-center font-bold text-white text-sm pb-1 border-b border-slate-800">
                  CÔNG TY CỔ PHẦN LOGISTICS & DEPOT CONTAINER
                </div>
                <div className="text-center text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                  PHIẾU THU TIỀN DỊCH VỤ DEPOT (OFFICIAL PAYMENT RECEIPT)
                </div>
                <div className="flex justify-between pt-1">
                  <span>Mã Phiếu Thu:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeJob.payment?.paymentTicketNo || `PT-2026-${activeJob.id.split('-')?.[2] || activeJob.id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số Container:</span>
                  <span className="text-white">{activeJob.containerNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Khách Hàng:</span>
                  <span className="text-slate-200">{activeJob.operation?.customer?.customerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-white">
                  <span>Số Tiền Đã Thu:</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    {(activeJob.payment?.amount || activeJob.operation?.totalAmount || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
