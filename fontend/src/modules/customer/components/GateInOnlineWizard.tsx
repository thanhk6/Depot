import React, { useState } from 'react';
import {
  FileText,
  Truck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Search,
  Scan,
  AlertCircle,
  Building2,
  ArrowRight,
  ArrowLeft,
  Share2,
  Download,
  Printer,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import {
  CustomerCompany,
  CustomerBooking,
  DriverRecord,
  VehicleRecord,
  GateInRegistration,
  CustomerUser
} from '../types/customerPortal';

interface GateInOnlineWizardProps {
  currentCustomer: CustomerCompany;
  currentUser?: CustomerUser;
  bookings: CustomerBooking[];
  drivers: DriverRecord[];
  vehicles: VehicleRecord[];
  onCompleteGateIn: (newGateIn: GateInRegistration) => void;
  onViewList: () => void;
  onOpenQR: (gateIn: GateInRegistration) => void;
}

export const GateInOnlineWizard: React.FC<GateInOnlineWizardProps> = ({
  currentCustomer,
  currentUser,
  bookings,
  drivers,
  vehicles,
  onCompleteGateIn,
  onViewList,
  onOpenQR
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdGateIn, setCreatedGateIn] = useState<GateInRegistration | null>(null);

  // Form State
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBookingNo, setSelectedBookingNo] = useState<string>(
    bookings.find((b) => b.customerId === currentCustomer.id && b.status === 'ACTIVE')?.bookingNo || ''
  );
  const [shippingLine, setShippingLine] = useState<string>('MAERSK LINE');
  const [depot, setDepot] = useState<string>('DEPOT CÁT LÁI - KHU B');
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-08-16');
  const [appointmentTime, setAppointmentTime] = useState<string>('14:30');

  // Step 2 Container State
  const [containerNo, setContainerNo] = useState<string>('MSKU9988776');
  const [containerSize, setContainerSize] = useState<string>("40' High Cube");
  const [containerType, setContainerType] = useState<string>('40HC Dry General');
  const [isoCode, setIsoCode] = useState<string>('45G1');
  const [sealNo, setSealNo] = useState<string>('ML-VN-990011');
  const [isContChecking, setIsContChecking] = useState<boolean>(false);
  const [contValidationMessage, setContValidationMessage] = useState<string | null>(null);

  // Step 3 Driver & Vehicle State
  // If current logged-in user is a Driver, auto-select their driver record
  const defaultDriver =
    drivers.find((d) => (currentUser?.driverId ? d.id === currentUser.driverId : d.customerId === currentCustomer.id)) ||
    drivers[0];

  const [selectedDriverId, setSelectedDriverId] = useState<string>(defaultDriver?.id || '');
  const [driverName, setDriverName] = useState<string>(defaultDriver?.fullName || 'Nguyễn Văn Hùng');
  const [driverPhone, setDriverPhone] = useState<string>(defaultDriver?.phone || '0903.112.233');
  const [vehiclePlate, setVehiclePlate] = useState<string>(defaultDriver?.assignedVehiclePlate || '51C-882.19');
  const [moocPlate, setMoocPlate] = useState<string>(defaultDriver?.assignedMoocPlate || '51R-045.22');

  // When driver selection changes
  const handleDriverChange = (driverId: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    if (drv) {
      setSelectedDriverId(drv.id);
      setDriverName(drv.fullName);
      setDriverPhone(drv.phone);
      if (drv.assignedVehiclePlate) setVehiclePlate(drv.assignedVehiclePlate);
      if (drv.assignedMoocPlate) setMoocPlate(drv.assignedMoocPlate);
    }
  };

  // Check container ISO standard
  const handleValidateContainer = () => {
    setIsContChecking(true);
    setTimeout(() => {
      setIsContChecking(false);
      const cleanCont = containerNo.trim().toUpperCase();
      if (!cleanCont || cleanCont.length < 10) {
        setContValidationMessage('❌ Số container không đúng định dạng chuẩn BIC/ISO 6346 (4 chữ cái + 7 chữ số)');
      } else {
        setContValidationMessage('✅ Container hợp lệ, không có nợ cước hay lệnh giữ vỏ từ Hãng tàu');
      }
    }, 400);
  };

  // Submit
  const handleConfirmRegistration = () => {
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const gateInNo = `GI-20260816-${randomSeq}`;
    const qrData = `DEPOT:${gateInNo}|CONT:${containerNo}|DRV:${driverPhone}|TRK:${vehiclePlate.replace(/[^a-zA-Z0-9]/g, '')}|DEP:${depot}`;

    const newRecord: GateInRegistration = {
      id: `GI-${Date.now()}`,
      gateInNo,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      bookingNo: selectedBookingNo || 'BKG-DIRECT-2026',
      shippingLine,
      containerNo: containerNo.toUpperCase(),
      isoCode,
      size: containerSize,
      type: containerType,
      sealNo: sealNo || undefined,
      driverId: selectedDriverId,
      driverName,
      driverPhone,
      vehiclePlate,
      moocPlate: moocPlate || undefined,
      depot,
      appointmentDate,
      appointmentTime,
      status: 'CONFIRMED',
      qrCodeData: qrData,
      createdAt: '2026-08-16 ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      notes: 'Đăng ký Gate-In trực tuyến qua Customer Portal 2026',
      timeline: [
        {
          status: 'PENDING',
          label: 'Đăng Ký Online Thành Công',
          time: '2026-08-16 ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          actor: `${driverName} (${driverPhone})`,
          note: `Khai báo hạ bãi vỏ ${containerNo} theo Booking ${selectedBookingNo}`
        },
        {
          status: 'CONFIRMED',
          label: 'Cấp Thẻ QR Vào Cổng E-Gate',
          time: '2026-08-16 ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          actor: 'Hệ Thống Tự Động Depot',
          note: `Lịch hẹn dự kiến ${appointmentTime} ngày ${appointmentDate}. Barie tự động cấp luồng.`
        }
      ]
    };

    setCreatedGateIn(newRecord);
    setIsSuccess(true);
    onCompleteGateIn(newRecord);
  };

  const handleResetWizard = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setCreatedGateIn(null);
    setContainerNo('MSKU' + Math.floor(1000000 + Math.random() * 9000000));
    setSealNo('ML-VN-' + Math.floor(100000 + Math.random() * 900000));
    setContValidationMessage(null);
  };

  // Filter Bookings by current customer and search text
  const filteredBookings = bookings
    .filter((b) => b.customerId === currentCustomer.id)
    .filter((b) =>
      bookingSearch
        ? b.bookingNo.toLowerCase().includes(bookingSearch.toLowerCase()) ||
          b.shippingLine.toLowerCase().includes(bookingSearch.toLowerCase())
        : true
    );

  // SUCCESS SCREEN
  if (isSuccess && createdGateIn) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
        {/* Success Banner */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold rounded-full">
              ĐĂNG KÝ GATE-IN THÀNH CÔNG
            </span>
            <h2 className="text-2xl font-black text-white mt-2">
              Mã Lệnh: <span className="text-pink-400 font-mono">{createdGateIn.gateInNo}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Thông tin đã được đồng bộ lên hệ thống điều hành Depot. Tài xế vui lòng xuất trình mã QR bên dưới tại cổng Check-in.
            </p>
          </div>

          {/* Large Center QR Code Pass */}
          <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/60 border border-pink-500/40 rounded-3xl max-w-md mx-auto text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono text-pink-400 font-bold">DEPOT GATE-IN QR PASS</span>
                <div className="text-xs font-bold text-white truncate max-w-[200px]">
                  {createdGateIn.customerName}
                </div>
              </div>
              <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-800 text-[10px] font-mono font-bold rounded">
                {createdGateIn.status}
              </span>
            </div>

            {/* QR display */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 bg-slate-950 rounded-2xl shadow-xl border-4 border-pink-500/30">
                <div className="w-48 h-48 bg-slate-950 flex flex-col items-center justify-center text-center p-2 rounded-xl">
                  <QrCode className="w-36 h-36 text-pink-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-white tracking-wider">
                    {createdGateIn.gateInNo}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                Quét mã tại Camera OCR cổng tiếp nhận {createdGateIn.depot}
              </span>
            </div>

            {/* Details table */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Container:</span>
                <span className="font-mono font-bold text-white">{createdGateIn.containerNo} ({createdGateIn.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Booking:</span>
                <span className="font-mono font-bold text-amber-300">{createdGateIn.bookingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tài xế &amp; SĐT:</span>
                <span className="font-bold text-white">{createdGateIn.driverName} ({createdGateIn.driverPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Xe đầu kéo:</span>
                <span className="font-mono font-bold text-amber-300">{createdGateIn.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian hẹn:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {createdGateIn.appointmentTime} ngày {createdGateIn.appointmentDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={() => onOpenQR(createdGateIn)}
              className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Xem Thẻ QR Độc Lập</span>
            </button>

            <button
              onClick={() => alert(`Đã lưu ảnh mã QR ${createdGateIn.gateInNo} về máy điện thoại`)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Lưu QR Về Máy</span>
            </button>

            <button
              onClick={() => alert(`Đã gửi đường link QR qua Zalo cho tài xế ${createdGateIn.driverPhone}`)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia Sẻ Zalo</span>
            </button>

            <button
              onClick={handleResetWizard}
              className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đăng Ký Thêm Xe Khác</span>
            </button>

            <button
              onClick={onViewList}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Về Danh Sách Gate-In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WIZARD STEPS 1-4
  return (
    <div className="space-y-6">
      
      {/* Wizard Progress Stepper */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto">
          {[
            { step: 1, title: 'Bước 1', desc: 'Chọn Booking' },
            { step: 2, title: 'Bước 2', desc: 'Khai Báo Container' },
            { step: 3, title: 'Bước 3', desc: 'Tài Xế & Phương Tiện' },
            { step: 4, title: 'Bước 4', desc: 'Xác Nhận & Cấp QR' }
          ].map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step);
                }}
                className={`flex-1 text-center cursor-pointer transition ${
                  isCurrent
                    ? 'text-pink-400 font-bold'
                    : isCompleted
                    ? 'text-emerald-400'
                    : 'text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition shadow-lg ${
                      isCurrent
                        ? 'bg-pink-600 text-white shadow-pink-500/30 ring-2 ring-pink-400'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                  </div>
                </div>
                <div className="text-[11px] font-bold truncate">{s.title}</div>
                <div className="text-[10px] text-slate-400 truncate hidden sm:block">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        
        {/* ================= STEP 1: BOOKING ================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-400" />
                  <span>BƯỚC 1: CHỌN BOOKING HÃNG TÀU &amp; LỊCH HẸN</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Chọn Booking đang hiệu lực của khách hàng: <strong className="text-white">{currentCustomer.name}</strong>
                </p>
              </div>
              <span className="text-xs font-mono text-pink-400 font-bold bg-pink-950/60 px-2.5 py-1 rounded-lg border border-pink-800">
                1 / 4
              </span>
            </div>

            {/* Booking Search & Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Tìm Kiếm &amp; Chọn Số Booking:
              </label>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Nhập số Booking (VD: MSK-2026-88901, MSC-2026...)"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Bookings Table / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {filteredBookings.map((b) => {
                  const isSelected = selectedBookingNo === b.bookingNo;
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBookingNo(b.bookingNo);
                        setShippingLine(b.shippingLine);
                        setDepot(b.depot);
                        setContainerSize(b.containerSize);
                        setContainerType(b.containerType);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition text-left space-y-1.5 ${
                        isSelected
                          ? 'bg-pink-950/40 border-pink-500 ring-1 ring-pink-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-pink-300 text-xs">{b.bookingNo}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-bold">
                          {b.usedCount}/{b.containerCount} Cont
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">{b.shippingLine}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-400" />
                        <span>{b.depot}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Hiệu lực: <strong className="text-slate-200">{b.validUntil}</strong> • {b.containerSize}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Booking manual override */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Số Booking xác nhận:</label>
                  <input
                    type="text"
                    value={selectedBookingNo}
                    onChange={(e) => setSelectedBookingNo(e.target.value)}
                    placeholder="Nhập số Booking..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Hãng Tàu:</label>
                  <select
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="MAERSK LINE">MAERSK LINE</option>
                    <option value="MSC MEDITERRANEAN">MSC MEDITERRANEAN</option>
                    <option value="CMA CGM GROUP">CMA CGM GROUP</option>
                    <option value="OCEAN NETWORK EXPRESS (ONE)">OCEAN NETWORK EXPRESS (ONE)</option>
                    <option value="COSCO SHIPPING">COSCO SHIPPING</option>
                    <option value="EVERGREEN LINE">EVERGREEN LINE</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Depot Tiếp Nhận:</label>
                  <select
                    value={depot}
                    onChange={(e) => setDepot(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="DEPOT CÁT LÁI - KHU B">DEPOT CÁT LÁI - KHU B</option>
                    <option value="DEPOT CÁT LÁI - KHU A">DEPOT CÁT LÁI - KHU A</option>
                    <option value="DEPOT CÁT LÁI - KHU C">DEPOT CÁT LÁI - KHU C</option>
                    <option value="DEPOT CÁI MÉP - VŨNG TÀU">DEPOT CÁI MÉP - VŨNG TÀU</option>
                  </select>
                </div>
              </div>

              {/* Appointment Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Ngày dự kiến vào Depot:</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Khung giờ hẹn (Slot):</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none font-mono"
                  >
                    <option value="08:00 - 09:30">08:00 - 09:30 (Sáng sớm)</option>
                    <option value="10:00 - 11:30">10:00 - 11:30 (Cao điểm sáng)</option>
                    <option value="13:30 - 15:00">13:30 - 15:00 (Đầu giờ chiều)</option>
                    <option value="15:30 - 17:00">15:30 - 17:00 (Chiều muộn)</option>
                    <option value="18:00 - 20:00">18:00 - 20:00 (Ca đêm)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  if (!selectedBookingNo) {
                    alert('Vui lòng chọn hoặc nhập số Booking!');
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>Tiếp Tục Sang Bước 2 (Container)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CONTAINER ================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scan className="w-5 h-5 text-pink-400" />
                  <span>BƯỚC 2: KHAI BÁO THÔNG TIN CONTAINER &amp; SEAL</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Nhập số Container hoặc quét mã vạch trên chứng từ giao nhận
                </p>
              </div>
              <span className="text-xs font-mono text-pink-400 font-bold bg-pink-950/60 px-2.5 py-1 rounded-lg border border-pink-800">
                2 / 4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Số Container (11 Ký Tự ISO):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setContainerNo('MSKU' + Math.floor(1000000 + Math.random() * 9000000));
                      setContValidationMessage(null);
                    }}
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tạo số ngẫu nhiên</span>
                  </button>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={containerNo}
                    onChange={(e) => {
                      setContainerNo(e.target.value.toUpperCase());
                      setContValidationMessage(null);
                    }}
                    placeholder="VD: MSKU1234567"
                    maxLength={11}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-white uppercase focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleValidateContainer}
                    disabled={isContChecking}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-pink-400 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isContChecking ? 'Đang kiểm tra...' : 'Kiểm Tra Cont'}</span>
                  </button>
                </div>

                {contValidationMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium ${
                      contValidationMessage.startsWith('✅')
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {contValidationMessage}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Kích Cỡ Container:</label>
                <select
                  value={containerSize}
                  onChange={(e) => setContainerSize(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                >
                  <option value="40' High Cube">40' High Cube (HC)</option>
                  <option value="20' General Standard">20' General Standard (DC)</option>
                  <option value="45' High Cube">45' High Cube (HC)</option>
                  <option value="40' Reefer HC">40' Reefer Lạnh (HR)</option>
                  <option value="20' Open Top">20' Open Top (OT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Mã ISO Chuẩn:</label>
                <select
                  value={isoCode}
                  onChange={(e) => setIsoCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-pink-500 focus:outline-none"
                >
                  <option value="45G1">45G1 - 40HC Dry General</option>
                  <option value="22G1">22G1 - 20DC Dry General</option>
                  <option value="45R1">45R1 - 40HR Reefer Cont</option>
                  <option value="42G1">42G1 - 40GP Dry General</option>
                  <option value="22U1">22U1 - 20OT Open Top</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Chủng Loại Vỏ:</label>
                <input
                  type="text"
                  value={containerType}
                  onChange={(e) => setContainerType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Số Niêm Phong (Seal No):</label>
                <input
                  type="text"
                  value={sealNo}
                  onChange={(e) => setSealNo(e.target.value.toUpperCase())}
                  placeholder="VD: ML-VN-884920"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Bước 1</span>
              </button>

              <button
                onClick={() => {
                  if (!containerNo || containerNo.length < 5) {
                    alert('Vui lòng nhập số Container hợp lệ!');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>Tiếp Tục Sang Bước 3 (Tài Xế &amp; Xe)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DRIVER & VEHICLE ================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <span>BƯỚC 3: XÁC NHẬN TÀI XẾ &amp; PHƯƠNG TIỆN VẬN TẢI</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tự động lấy thông tin tài xế và biển số xe thuộc doanh nghiệp vận tải
                </p>
              </div>
              <span className="text-xs font-mono text-pink-400 font-bold bg-pink-950/60 px-2.5 py-1 rounded-lg border border-pink-800">
                3 / 4
              </span>
            </div>

            {/* Driver picker */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Chọn Tài Xế Phụ Trách Lệnh Này:
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:border-pink-500 focus:outline-none"
                >
                  {drivers
                    .filter((d) => d.customerId === currentCustomer.id)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} • {d.phone} • Xe: {d.assignedVehiclePlate} (GPLX: {d.licenseGrade})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Họ và Tên Tài Xế:</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Biển Số Xe Đầu Kéo:</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="51C-882.19"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold uppercase focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Biển Số Rơ-Moóc (Chassis):</label>
                  <input
                    type="text"
                    value={moocPlate}
                    onChange={(e) => setMoocPlate(e.target.value.toUpperCase())}
                    placeholder="51R-045.22"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono uppercase focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Bước 2</span>
              </button>

              <button
                onClick={() => {
                  if (!driverName || !vehiclePlate) {
                    alert('Vui lòng điền đầy đủ tên tài xế và biển số xe!');
                    return;
                  }
                  setCurrentStep(4);
                }}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>Tiếp Tục Sang Bước 4 (Xác Nhận)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: CONFIRM ================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>BƯỚC 4: RÀ SOÁT THÔNG TIN &amp; PHÁT HÀNH MÃ QR GATE-IN</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Vui lòng kiểm tra kỹ các thông số trước khi hoàn tất đăng ký
                </p>
              </div>
              <span className="text-xs font-mono text-pink-400 font-bold bg-pink-950/60 px-2.5 py-1 rounded-lg border border-pink-800">
                4 / 4
              </span>
            </div>

            {/* Review Card */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Block 1 */}
                <div className="space-y-2 border-r border-slate-800/80 pr-2">
                  <div className="text-pink-400 font-bold flex items-center gap-1.5 border-b border-slate-800 pb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>LỆNH &amp; CONTAINER</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số Booking:</span>
                    <span className="font-mono font-bold text-amber-300">{selectedBookingNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hãng Tàu:</span>
                    <span className="font-bold text-sky-400">{shippingLine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số Container:</span>
                    <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {containerNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kích cỡ &amp; ISO:</span>
                    <span className="font-bold text-slate-200">{containerSize} ({isoCode})</span>
                  </div>
                  {sealNo && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số Seal:</span>
                      <span className="font-mono text-slate-300">{sealNo}</span>
                    </div>
                  )}
                </div>

                {/* Block 2 */}
                <div className="space-y-2 pl-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5 border-b border-slate-800 pb-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>TÀI XẾ &amp; LỊCH HẸN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tài xế phụ trách:</span>
                    <span className="font-bold text-white">{driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-mono font-bold text-emerald-400">{driverPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Xe đầu kéo:</span>
                    <span className="font-mono font-bold text-amber-300">{vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rơ-moóc:</span>
                    <span className="font-mono text-slate-300">{moocPlate || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Depot đến:</span>
                    <span className="font-bold text-slate-200">{depot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khung giờ hẹn:</span>
                    <span className="font-mono font-bold text-pink-400">{appointmentTime} • {appointmentDate}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Bước 3</span>
              </button>

              <button
                onClick={handleConfirmRegistration}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs rounded-xl shadow-xl shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                <span>XÁC NHẬN ĐĂNG KÝ &amp; NHẬN MÃ QR</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
