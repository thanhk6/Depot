import React, { useState, useEffect } from 'react';
import { useDepot } from '../../context/DepotContext';
import { CustomerInfo, DepotServiceItem, DepotJob, YardLocation } from '../../types/depot';
import { STANDARD_DEPOT_TARIFF, FORKLIFT_UNITS } from '../../data/depotMasterData';
import {
  FileText,
  UserCheck,
  Truck,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  Receipt,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Printer,
  X,
  Boxes,
  Lock,
  Calendar,
  AlertTriangle,
  QrCode,
  MapPin
} from 'lucide-react';

export const OperationModule: React.FC = () => {
  const { jobs, createOperationTicket, processGateOut, createForkliftMove, updateJob, showToast } = useDepot();

  const [operationTab, setOperationTab] = useState<'GATE_IN' | 'GATE_OUT'>('GATE_IN');

  // --- GATE IN STATE ---
  const pendingOpJobs = jobs.filter(
    (j) => j.status === 'OPERATION_PENDING' || j.status === 'SURVEYED' || j.status === 'GATE_IN'
  );

  const [selectedGateInJobId, setSelectedGateInJobId] = useState<string>(
    pendingOpJobs[0]?.id || jobs[0]?.id || ''
  );

  const activeGateInJob = jobs.find((j) => j.id === selectedGateInJobId);

  const [customerName, setCustomerName] = useState(
    activeGateInJob?.operation?.customer?.customerName || 'Công ty TNHH Vận Tải Quốc Tế Á Châu'
  );
  const [taxCode, setTaxCode] = useState(
    activeGateInJob?.operation?.customer?.taxCode || '0318902831'
  );
  const [phone, setPhone] = useState(
    activeGateInJob?.operation?.customer?.phone || '0909123888'
  );
  const [driverName, setDriverName] = useState(
    activeGateInJob?.operation?.customer?.driverName || 'Nguyễn Văn Hùng'
  );
  const [licensePlate, setLicensePlate] = useState(
    activeGateInJob?.operation?.customer?.licensePlate || '51C-992.10'
  );
  const [trailerPlate, setTrailerPlate] = useState(
    activeGateInJob?.operation?.customer?.trailerPlate || '51R-881.02'
  );
  const [bookingNo, setBookingNo] = useState(
    activeGateInJob?.operation?.customer?.bookingNo || 'BK-2026-088192'
  );

  const [selectedServices, setSelectedServices] = useState<DepotServiceItem[]>(
    activeGateInJob?.operation?.services || [
      STANDARD_DEPOT_TARIFF[0],
      STANDARD_DEPOT_TARIFF[1]
    ]
  );

  // Yard Location Assignment State for Gate In
  const [opBlock, setOpBlock] = useState<'BLOCK_A' | 'BLOCK_B' | 'BLOCK_C' | 'BLOCK_R' | 'BLOCK_Q'>(
    activeGateInJob?.currentLocation?.block || 'BLOCK_A'
  );
  const [opBay, setOpBay] = useState<number>(activeGateInJob?.currentLocation?.bay || 1);
  const [opRow, setOpRow] = useState<number>(activeGateInJob?.currentLocation?.row || 1);
  const [opTier, setOpTier] = useState<number>(activeGateInJob?.currentLocation?.tier || 1);
  const [opForkliftDriver, setOpForkliftDriver] = useState<string>('Nguyễn Văn Nâng (Xe Nâng FL-01)');

  useEffect(() => {
    if (activeGateInJob?.currentLocation) {
      setOpBlock(activeGateInJob.currentLocation.block || 'BLOCK_A');
      setOpBay(activeGateInJob.currentLocation.bay || 1);
      setOpRow(activeGateInJob.currentLocation.row || 1);
      setOpTier(activeGateInJob.currentLocation.tier || 1);
    }
  }, [activeGateInJob?.id]);

  // Sync Gate In selection
  const handleSelectGateInJob = (id: string) => {
    setSelectedGateInJobId(id);
    const target = jobs.find((j) => j.id === id);
    if (target?.operation) {
      setCustomerName(target.operation.customer.customerName);
      setTaxCode(target.operation.customer.taxCode);
      setPhone(target.operation.customer.phone);
      setDriverName(target.operation.customer.driverName || '');
      setLicensePlate(target.operation.customer.licensePlate || '');
      setTrailerPlate(target.operation.customer.trailerPlate || '');
      setBookingNo(target.operation.customer.bookingNo || '');
      setSelectedServices(target.operation.services);
    }
    if (target?.currentLocation) {
      setOpBlock(target.currentLocation.block || 'BLOCK_A');
      setOpBay(target.currentLocation.bay || 1);
      setOpRow(target.currentLocation.row || 1);
      setOpTier(target.currentLocation.tier || 1);
    }
  };

  const handleAddTariffItem = (item: DepotServiceItem) => {
    const exists = selectedServices.find((s) => s.id === item.id);
    if (exists) {
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === item.id
            ? { ...s, quantity: s.quantity + 1, totalPrice: (s.quantity + 1) * s.unitPrice }
            : s
        )
      );
    } else {
      setSelectedServices([...selectedServices, { ...item }]);
    }
  };

  const handleRemoveTariffItem = (id: string) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== id));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty <= 0) return;
    setSelectedServices(
      selectedServices.map((s) =>
        s.id === id ? { ...s, quantity: qty, totalPrice: qty * s.unitPrice } : s
      )
    );
  };

  const subtotal = selectedServices.reduce((sum, s) => sum + s.totalPrice, 0);
  const vatAmount = Math.round(subtotal * 0.08);
  const totalAmount = subtotal + vatAmount;

  const handleIssueTicket = () => {
    if (!activeGateInJob) return;

    const customer: CustomerInfo = {
      customerName,
      taxCode,
      phone,
      driverName,
      licensePlate,
      trailerPlate,
      bookingNo
    };

    const targetLocation: YardLocation = {
      block: opBlock,
      bay: opBay,
      row: opRow,
      tier: opTier
    };

    createOperationTicket(activeGateInJob.id, customer, selectedServices);

    // Issue forklift move order and update container yard location
    createForkliftMove(
      activeGateInJob.id,
      targetLocation,
      opForkliftDriver.includes('FL-02') ? 'FL-02' : opForkliftDriver.includes('FL-03') ? 'FL-03' : 'FL-01',
      'YARD_STORAGE'
    );

    updateJob(activeGateInJob.id, {
      currentLocation: targetLocation,
      status: 'YARD_STORED'
    });
  };

  // --- GATE OUT STATE ---
  const gateOutAvailableJobs = jobs.filter(
    (j) => j.status === 'YARD_STORED' || j.status === 'QC_PASSED' || j.status === 'PAID'
  );

  const [selectedGateOutJobId, setSelectedGateOutJobId] = useState<string>(
    gateOutAvailableJobs[0]?.id || jobs[0]?.id || ''
  );

  const activeGateOutJob = jobs.find((j) => j.id === selectedGateOutJobId);

  const [outReleaseOrderNo, setOutReleaseOrderNo] = useState('RO-2026-990812');
  const [outCustomerName, setOutCustomerName] = useState('Công ty CP Logistics Nam Hải');
  const [outDriverName, setOutDriverName] = useState('Lê Hoàng Nam');
  const [outLicensePlate, setOutLicensePlate] = useState('51D-448.19');
  const [outTrailerPlate, setOutTrailerPlate] = useState('51R-002.99');
  const [outSealNo, setOutSealNo] = useState('MSK-SEAL-88391');
  const [selectedForkliftId, setSelectedForkliftId] = useState('FN-01');

  const [showEirModal, setShowEirModal] = useState(false);
  const [eirTicketData, setEirTicketData] = useState<any>(null);

  const handleGateOutSubmit = () => {
    if (!activeGateOutJob) return;

    // Dispatch Forklift Move Order to Gate Delivery Zone
    createForkliftMove(
      activeGateOutJob.id,
      { block: 'BLOCK_A', bay: 1, row: 1, tier: 1 },
      selectedForkliftId,
      'GATE_OUT'
    );

    // Process Gate Out
    processGateOut(activeGateOutJob.id);

    const ticket = {
      ticketNo: `EIR-OUT-${Date.now().toString().slice(-6)}`,
      containerNo: activeGateOutJob.containerNo,
      isoSize: activeGateOutJob.isoSize,
      shippingLine: activeGateOutJob.shippingLine,
      jobId: activeGateOutJob.id,
      releaseOrderNo: outReleaseOrderNo,
      customerName: outCustomerName,
      driverName: outDriverName,
      licensePlate: outLicensePlate,
      trailerPlate: outTrailerPlate,
      sealNo: outSealNo,
      gateOutDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      forkliftId: selectedForkliftId,
      locationFrom: `Block ${activeGateOutJob.currentLocation.block.replace('BLOCK_', '')}-B${activeGateOutJob.currentLocation.bay}-R${activeGateOutJob.currentLocation.row}-T${activeGateOutJob.currentLocation.tier}`
    };

    setEirTicketData(ticket);
    setShowEirModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation Sub-Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Quản Lý Phân Hệ Khai Thác Cổng (Depot Gate Operations)</h2>
            <p className="text-xs text-slate-400">
              Quy trình tiếp nhận Nhập vỏ (Gate In / Hạ vỏ) & giao nhận Xuất vỏ (Gate Out / Cấp vỏ)
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setOperationTab('GATE_IN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              operationTab === 'GATE_IN'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>1. Nhập Vỏ (Gate In / Hạ Vỏ)</span>
          </button>

          <button
            onClick={() => setOperationTab('GATE_OUT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              operationTab === 'GATE_OUT'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>2. Xuất Vỏ (Gate Out / Cấp Vỏ)</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODE 1: GATE IN (NHẬP VỎ / HẠ VỎ) */}
      {/* ========================================== */}
      {operationTab === 'GATE_IN' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-700/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-blue-200">
              📌 <strong>Phân Hệ Nhập Vỏ (Gate In):</strong> Tiếp nhận xe container hạ bãi, ghi nhận thông tin vận tải & dịch vụ nâng hạ cố định.
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-blue-200 whitespace-nowrap">Chọn Job Container:</label>
              <select
                value={selectedGateInJobId}
                onChange={(e) => handleSelectGateInJob(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-blue-600/50 rounded-xl text-xs text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 min-w-[220px]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.containerNo} ({j.isoSize} - {j.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeGateInJob && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Customer & Vehicle Information Form */}
              <div className="lg:col-span-1 space-y-4">
                {/* Customer Info Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Thông Tin Khách Hàng / Đơn Vị</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Tên Khách Hàng / Công Ty <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Mã Số Thuế</label>
                        <input
                          type="text"
                          value={taxCode}
                          onChange={(e) => setTaxCode(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Số Điện Thoại</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Số Booking / B/L No.</label>
                      <input
                        type="text"
                        value={bookingNo}
                        onChange={(e) => setBookingNo(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle & Driver Info Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Thông Tin Xe & Tài Xế Vận Chuyển</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Họ Tên Tài Xế</label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Biển Số Đầu Kéo</label>
                        <input
                          type="text"
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Biển Số Rơ-moóc</label>
                        <input
                          type="text"
                          value={trailerPlate}
                          onChange={(e) => setTrailerPlate(e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yard Location & Stacking Card (Khai Thác Chỉ Định Vị Trí Bãi) */}
                <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>Chỉ Định Vị Trí Hạ Bãi Lưu Container</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold">
                      HẠ BÃI DEPOT
                    </span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Phân Khu Bãi (Block)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'BLOCK_A', label: 'Block A (Khô 20ft)' },
                          { id: 'BLOCK_B', label: 'Block B (Khô 40/45ft)' },
                          { id: 'BLOCK_C', label: 'Block C (Lạnh Reefer)' },
                          { id: 'BLOCK_R', label: 'Block R (Sửa Chữa)' },
                          { id: 'BLOCK_Q', label: 'Block Q (Khu QC)' }
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setOpBlock(b.id as any)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold text-left truncate border transition cursor-pointer ${
                              opBlock === b.id
                                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Dãy (Bay)</label>
                        <select
                          value={opBay}
                          onChange={(e) => setOpBay(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>Bay {n}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Hàng (Row)</label>
                        <select
                          value={opRow}
                          onChange={(e) => setOpRow(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold"
                        >
                          {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>Row {n}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tầng (Tier)</label>
                        <select
                          value={opTier}
                          onChange={(e) => setOpTier(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono font-bold"
                        >
                          {Array.from({ length: 4 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>Tier {n}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Xe Nâng Thực Hiện Hạ Bãi</span>
                      </label>
                      <select
                        value={opForkliftDriver}
                        onChange={(e) => setOpForkliftDriver(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="Nguyễn Văn Nâng (Xe Nâng FL-01)">FL-01 - Nguyễn Văn Nâng</option>
                        <option value="Trần Văn Cẩu (Xe Nâng FL-02)">FL-02 - Trần Văn Cẩu</option>
                        <option value="Lê Hoàng Hải (Xe Nâng FL-03)">FL-03 - Lê Hoàng Hải</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Tariff Selection & Service Ticket Preview */}
              <div className="lg:col-span-2 space-y-4">
                {/* Tariff Catalog Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>Bảng Giá Dịch Vụ Cố Định Depot</span>
                    <span className="text-[11px] text-slate-400">Bấm nút + để thêm dịch vụ</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STANDARD_DEPOT_TARIFF.map((tariff) => (
                      <button
                        key={tariff.id}
                        onClick={() => handleAddTariffItem(tariff)}
                        className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl transition text-left flex items-center justify-between text-xs cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{tariff.nameVi}</div>
                          <div className="text-[11px] text-blue-400 font-mono">
                            {tariff.unitPrice.toLocaleString('vi-VN')} VNĐ
                          </div>
                        </div>
                        <div className="p-1 rounded-lg bg-blue-600/20 text-blue-400">
                          <Plus className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Services Invoice Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Phiếu Chi Tiết Dịch Vụ Lập Cho {activeGateInJob?.containerNo || 'N/A'}</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">PDV-2026-{activeGateInJob?.id ? activeGateInJob.id.split('-')?.[2] || activeGateInJob.id : ''}</span>
                  </div>

                  {selectedServices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
                      Chưa chọn dịch vụ nào. Hãy chọn từ Bảng Giá Dịch Vụ ở trên.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold">
                            <th className="p-2.5">Mã Dịch Vụ</th>
                            <th className="p-2.5">Tên Dịch Vụ Depot</th>
                            <th className="p-2.5 text-right">Đơn Giá (VNĐ)</th>
                            <th className="p-2.5 text-center">S.Lượng</th>
                            <th className="p-2.5 text-right">Thành Tiền</th>
                            <th className="p-2.5 text-center">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {selectedServices.map((srv) => (
                            <tr key={srv.id} className="hover:bg-slate-800/50 transition">
                              <td className="p-2.5 font-mono text-slate-400">{srv.code}</td>
                              <td className="p-2.5 font-medium text-slate-200">{srv.nameVi}</td>
                              <td className="p-2.5 text-right font-mono text-slate-300">
                                {srv.unitPrice.toLocaleString('vi-VN')}
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={srv.quantity}
                                  onChange={(e) => handleQuantityChange(srv.id, Number(e.target.value))}
                                  className="w-14 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-xs font-mono text-white"
                                />
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                                {srv.totalPrice.toLocaleString('vi-VN')}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => handleRemoveTariffItem(srv.id)}
                                  className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Financial Calculation summary */}
                  <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40 font-mono">
                      <span className="flex items-center gap-1 font-sans text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Vị Trí Hạ Bãi Chỉ Định:
                      </span>
                      <span className="font-bold">
                        Block {opBlock.replace('BLOCK_', '')} - B{opBay} - R{opRow} - T{opTier}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Tiền Dịch Vụ Chưa Thừa VAT:</span>
                      <span className="font-mono text-slate-100">{subtotal.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Thuế VAT (8%):</span>
                      <span className="font-mono text-slate-300">{vatAmount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                      <span>TỔNG TIỀN THANH TOÁN:</span>
                      <span className="font-mono text-emerald-400 text-base">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    💡 Hệ thống sẽ lập Phiếu Dịch Vụ, đồng thời phát lệnh cho xe nâng hạ vỏ vào bãi vị trí <strong>Block {opBlock.replace('BLOCK_', '')}-B{opBay}-R{opRow}-T{opTier}</strong>.
                  </div>

                  <button
                    onClick={handleIssueTicket}
                    disabled={selectedServices.length === 0}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border border-emerald-400/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lập Phiếu & Hạ Container Vào Bãi</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* MODE 2: GATE OUT (XUẤT VỎ / CẤP VỎ) */}
      {/* ========================================== */}
      {operationTab === 'GATE_OUT' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-700/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-emerald-200">
              📌 <strong>Phân Hệ Xuất Vỏ (Gate Out):</strong> Kiểm tra điều kiện xuất bãi, điều xe nâng gắp container & phát hành Phiếu Giao Nhận EIR.
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-emerald-200 whitespace-nowrap">Chọn Container Xuất Bãi:</label>
              <select
                value={selectedGateOutJobId}
                onChange={(e) => setSelectedGateOutJobId(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-emerald-600/50 rounded-xl text-xs text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 min-w-[240px]"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.containerNo} ({j.isoSize} - {j.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeGateOutJob && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: 5-Point Mandatory Gate-Out Conditions Checklist */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>3.2 Kiểm Tra 5 Điều Kiện Xuất Bãi</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] border border-emerald-800">
                      Auto Check
                    </span>
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    {/* Condition 1 */}
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">1. Đang có mặt tại Bãi Depot</div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          Block {activeGateOutJob.currentLocation.block.replace('BLOCK_', '')} - B{activeGateOutJob.currentLocation.bay}-R{activeGateOutJob.currentLocation.row}-T{activeGateOutJob.currentLocation.tier}
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>

                    {/* Condition 2 */}
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">2. Trạng thái sẵn sàng cấp (Grade A/B)</div>
                        <div className="text-[11px] text-slate-400">
                          {activeGateOutJob.status === 'GATE_OUT' ? (
                            <span className="text-slate-400">Đã xuất khỏi bãi</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">Đạt QC Nghiệm Thu / Đã Lưu Bãi</span>
                          )}
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>

                    {/* Condition 3 */}
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">3. Không bị khóa nợ/giữ hàng</div>
                        <div className="text-[11px] text-emerald-400 font-medium">Hãng tàu {activeGateOutJob.shippingLine} mở khóa</div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>

                    {/* Condition 4 */}
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">4. Không có lệnh thi công dở dang</div>
                        <div className="text-[11px] text-emerald-400">Tất cả lệnh sửa chữa đã đóng</div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>

                    {/* Condition 5 */}
                    <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">5. Nghĩa vụ phí Depot</div>
                        <div className="text-[11px] text-emerald-400 font-medium">Đã quyết toán phí hạ/lưu bãi</div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Gate Out Reception & Dispatch Form */}
              <div className="lg:col-span-2 space-y-4">
                {/* 3.1 Delivery Order Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>3.1 Tiếp Nhận Yêu Cầu Cấp Container (Release Order)</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{activeGateOutJob?.containerNo || ''}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Số Lệnh Cấp / Booking No. <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        value={outReleaseOrderNo}
                        onChange={(e) => setOutReleaseOrderNo(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Đơn Vị Nhận Container <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        value={outCustomerName}
                        onChange={(e) => setOutCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Họ Tên Tài Xế Đến Nhận</label>
                      <input
                        type="text"
                        value={outDriverName}
                        onChange={(e) => setOutDriverName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Biển Xe Đầu Kéo</label>
                        <input
                          type="text"
                          value={outLicensePlate}
                          onChange={(e) => setOutLicensePlate(e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Biển Rơ-Moóc</label>
                        <input
                          type="text"
                          value={outTrailerPlate}
                          onChange={(e) => setOutTrailerPlate(e.target.value.toUpperCase())}
                          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Số Chì Niêm (Seal No.)</label>
                      <input
                        type="text"
                        value={outSealNo}
                        onChange={(e) => setOutSealNo(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Phân Công Xe Nâng Gắp Cont</label>
                      <select
                        value={selectedForkliftId}
                        onChange={(e) => setSelectedForkliftId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        {FORKLIFT_UNITS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.driver} - {f.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    💡 Khi bấm xác nhận xuất bãi, hệ thống sẽ phát lệnh xe nâng gắp container, chuyển trạng thái Job sang <strong>Completed (GATE_OUT)</strong> và xuất phiếu EIR.
                  </div>

                  <button
                    onClick={handleGateOutSubmit}
                    disabled={activeGateOutJob?.status === 'GATE_OUT'}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Xác Nhận Xuất Bãi & In Phiếu EIR</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* EIR DELIVERY TICKET MODAL VIEW */}
      {/* ========================================== */}
      {showEirModal && eirTicketData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-emerald-950/80 border-b border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Receipt className="w-5 h-5" />
                <span>PHIẾU GIAO NHẬN CONTAINER XUẤT BÃI (EQUIPMENT INTERCHANGE RECEIPT - EIR)</span>
              </div>
              <button
                onClick={() => setShowEirModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Printable Layout Body */}
            <div className="p-6 space-y-5 text-xs bg-slate-900">
              {/* Header Company Info */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">CÔNG TY CỔ PHẦN CẢNG & DEPOT CONTAINER QUỐC TẾ</h2>
                  <p className="text-[11px] text-slate-400">Địa chỉ: Đường số 3, KCN Cát Lái, P. Thạnh Mỹ Lợi, TP. Thủ Đức, TP.HCM</p>
                  <p className="text-[11px] text-slate-400">Hotline Cổng: (028) 3899 9888 • Email: gate@depot-container.vn</p>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-sm">{eirTicketData.ticketNo}</div>
                  <div className="text-[11px] text-slate-400">{eirTicketData.gateOutDate}</div>
                </div>
              </div>

              {/* Barcode & QR code area */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-300">MÃ BARCODE XUẤT CỔNG:</div>
                  <div className="font-mono text-lg font-black tracking-widest text-white mt-1">
                    * {eirTicketData.containerNo} *
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg">
                  <QrCode className="w-12 h-12 text-black" />
                </div>
              </div>

              {/* Two Column Grid Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-emerald-400 border-b border-slate-700 pb-1 uppercase text-[11px]">THÔNG TIN CONTAINER</div>
                  <div>Số Container: <strong className="font-mono text-white text-sm">{eirTicketData.containerNo}</strong></div>
                  <div>Kích thước ISO: <strong className="font-mono text-blue-300">{eirTicketData.isoSize}</strong></div>
                  <div>Hãng tàu: <strong className="text-slate-200">{eirTicketData.shippingLine}</strong></div>
                  <div>Vị trí lưu bãi trước xuất: <strong className="font-mono text-emerald-300">{eirTicketData.locationFrom}</strong></div>
                  <div>Số Chì Niêm (Seal): <strong className="font-mono text-amber-300">{eirTicketData.sealNo}</strong></div>
                </div>

                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-emerald-400 border-b border-slate-700 pb-1 uppercase text-[11px]">THÔNG TIN GIAO NHẬN</div>
                  <div>Số Lệnh Cấp (RO): <strong className="font-mono text-amber-300">{eirTicketData.releaseOrderNo}</strong></div>
                  <div>Đơn vị nhận: <strong className="text-slate-200">{eirTicketData.customerName}</strong></div>
                  <div>Tài xế tiếp nhận: <strong className="text-white">{eirTicketData.driverName}</strong></div>
                  <div>Biển xe đầu kéo: <strong className="font-mono text-blue-300">{eirTicketData.licensePlate}</strong></div>
                  <div>Biển rơ-moóc: <strong className="font-mono text-slate-300">{eirTicketData.trailerPlate}</strong></div>
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-4 border-t border-slate-800">
                <div>
                  <div className="font-bold text-slate-300">TÀI XẾ NHẬN HÀNG</div>
                  <div className="h-12"></div>
                  <div className="text-slate-400 font-medium">{eirTicketData.driverName}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-300">NHÂN VIÊN CỔNG (GATE OUT)</div>
                  <div className="h-12"></div>
                  <div className="text-slate-400 font-medium">Trần Văn Cường</div>
                </div>
                <div>
                  <div className="font-bold text-slate-300">THỦ KHO / ĐIỀU HÀNH BÃI</div>
                  <div className="h-12"></div>
                  <div className="text-emerald-400 font-bold">Xác Nhận Đã Xuất</div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
              <span className="text-xs text-slate-400">💡 Hồ sơ Depot Job đã hoàn thành quy trình xuất bãi (Completed).</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu EIR</span>
                </button>
                <button
                  onClick={() => setShowEirModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
