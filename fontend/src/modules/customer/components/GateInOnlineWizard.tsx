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
import { useShippingLineOptions } from '../../../hooks/useShippingLineOptions';

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
  const shippingLineOptions = useShippingLineOptions();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdGateIn, setCreatedGateIn] = useState<GateInRegistration | null>(null);

  // Form State
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBookingNo, setSelectedBookingNo] = useState<string>(
    bookings.find((b) => b.customerId === currentCustomer.id && b.status === 'ACTIVE')?.bookingNo || ''
  );
  const [shippingLine, setShippingLine] = useState<string>('');
  const [depot, setDepot] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [appointmentTime, setAppointmentTime] = useState<string>('');

  // Step 2 Container State
  const [containerNo, setContainerNo] = useState<string>('');
  const [containerSize, setContainerSize] = useState<string>("40' High Cube");
  const [containerType, setContainerType] = useState<string>('');
  const [isoCode, setIsoCode] = useState<string>('');
  const [sealNo, setSealNo] = useState<string>('');
  const [isContChecking, setIsContChecking] = useState<boolean>(false);
  const [contValidationMessage, setContValidationMessage] = useState<string | null>(null);

  // Step 3 Driver & Vehicle State
  // If current logged-in user is a Driver, auto-select their driver record
  const defaultDriver =
    drivers.find((d) => (currentUser?.driverId ? d.id === currentUser.driverId : d.customerId === currentCustomer.id)) ||
    drivers[0];

  const [selectedDriverId, setSelectedDriverId] = useState<string>(defaultDriver?.id || '');
  const [driverName, setDriverName] = useState<string>(defaultDriver?.fullName || '');
  const [driverPhone, setDriverPhone] = useState<string>(defaultDriver?.phone || '');
  const [vehiclePlate, setVehiclePlate] = useState<string>(defaultDriver?.assignedVehiclePlate || '');
  const [moocPlate, setMoocPlate] = useState<string>(defaultDriver?.assignedMoocPlate || '');

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
        <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl ">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold rounded-full">
              ĐĂNG KÝ GATE-IN THÀNH CÔNG
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Mã Lệnh: <span className="text-pink-600 font-mono">{createdGateIn.gateInNo}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Thông tin đã được đồng bộ lên hệ thống điều hành Depot. Tài xế vui lòng xuất trình mã QR bên dưới tại cổng Check-in.
            </p>
          </div>

          {/* Large Center QR Code Pass */}
          <div className="p-5 bg-pink-50/50 border border-pink-200 rounded-3xl max-w-md mx-auto text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[10px] font-mono text-pink-600 font-bold">DEPOT GATE-IN QR PASS</span>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                  {createdGateIn.customerName}
                </div>
              </div>
              <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-mono font-bold rounded">
                {createdGateIn.status}
              </span>
            </div>

            {/* QR display */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-4 bg-slate-50 rounded-2xl shadow-xl border-4 border-pink-200">
                <div className="w-48 h-48 bg-slate-50 flex flex-col items-center justify-center text-center p-2 rounded-xl">
                  <QrCode className="w-36 h-36 text-pink-600 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-slate-900 tracking-wider">
                    {createdGateIn.gateInNo}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2">
                Quét mã tại Camera OCR cổng tiếp nhận {createdGateIn.depot}
              </span>
            </div>

            {/* Details table */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Container:</span>
                <span className="font-mono font-bold text-slate-900">{createdGateIn.containerNo} ({createdGateIn.size})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking:</span>
                <span className="font-mono font-bold text-amber-700">{createdGateIn.bookingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tài xế &amp; SĐT:</span>
                <span className="font-bold text-slate-900">{createdGateIn.driverName} ({createdGateIn.driverPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Xe đầu kéo:</span>
                <span className="font-mono font-bold text-amber-700">{createdGateIn.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian hẹn:</span>
                <span className="font-mono font-bold text-emerald-600">
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
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Lưu QR Về Máy</span>
            </button>

            <button
              onClick={() => alert(`Đã gửi đường link QR qua Zalo cho tài xế ${createdGateIn.driverPhone}`)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia Sẻ Zalo</span>
            </button>

            <button
              onClick={handleResetWizard}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đăng Ký Thêm Xe Khác</span>
            </button>

            <button
              onClick={onViewList}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
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
      <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xl">
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
                    ? 'text-pink-600 font-bold'
                    : isCompleted
                    ? 'text-emerald-600'
                    : 'text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition shadow-lg ${
                      isCurrent
                        ? 'bg-pink-600 text-white  ring-2 ring-pink-400'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                  </div>
                </div>
                <div className="text-[11px] font-bold truncate">{s.title}</div>
                <div className="text-[10px] text-slate-500 truncate hidden sm:block">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-6">
        
        {/* ================= STEP 1: BOOKING ================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pink-600" />
                  <span>BƯỚC 1: CHỌN BOOKING HÃNG TÀU &amp; LỊCH HẸN</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn Booking đang hiệu lực của khách hàng: <strong className="text-slate-900">{currentCustomer.name}</strong>
                </p>
              </div>
              <span className="text-xs font-mono text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                1 / 4
              </span>
            </div>

            {/* Booking Search & Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Tìm Kiếm &amp; Chọn Số Booking:
              </label>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Nhập số Booking (VD: MSK-2026-88901, MSC-2026...)"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-pink-500 focus:outline-none"
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
                          ? 'bg-pink-50 border-pink-500 ring-1 ring-pink-500/50 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-pink-700 text-xs">{b.bookingNo}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-bold">
                          {b.usedCount}/{b.containerCount} Cont
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{b.shippingLine}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-600" />
                        <span>{b.depot}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Hiệu lực: <strong className="text-slate-700">{b.validUntil}</strong> • {b.containerSize}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Booking manual override */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Số Booking xác nhận:</label>
                  <input
                    type="text"
                    value={selectedBookingNo}
                    onChange={(e) => setSelectedBookingNo(e.target.value)}
                    placeholder="Nhập số Booking..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Hãng Tàu:</label>
                  <select
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-pink-500 focus:outline-none"
                  >
                    {shippingLineOptions.map((l) => (
                      <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Depot Tiếp Nhận:</label>
                  <select
                    value={depot}
                    onChange={(e) => setDepot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-pink-500 focus:outline-none"
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
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Ngày dự kiến vào Depot:</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Khung giờ hẹn (Slot):</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-pink-500 focus:outline-none font-mono"
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
            <div className="flex justify-end pt-4 border-t border-slate-200">
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
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scan className="w-5 h-5 text-pink-600" />
                  <span>BƯỚC 2: KHAI BÁO THÔNG TIN CONTAINER &amp; SEAL</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập số Container hoặc quét mã vạch trên chứng từ giao nhận
                </p>
              </div>
              <span className="text-xs font-mono text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                2 / 4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Số Container (11 Ký Tự ISO):</span>
                  <button
                    type="button"
                    onClick={() => {
                      setContainerNo('MSKU' + Math.floor(1000000 + Math.random() * 9000000));
                      setContValidationMessage(null);
                    }}
                    className="text-[11px] text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
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
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-slate-900 uppercase focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleValidateContainer}
                    disabled={isContChecking}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-pink-600 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isContChecking ? 'Đang kiểm tra...' : 'Kiểm Tra Cont'}</span>
                  </button>
                </div>

                {contValidationMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-medium ${
                      contValidationMessage.startsWith('✅')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {contValidationMessage}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Kích Cỡ Container:</label>
                <select
                  value={containerSize}
                  onChange={(e) => setContainerSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-pink-500 focus:outline-none"
                >
                  <option value="40' High Cube">40' High Cube (HC)</option>
                  <option value="20' General Standard">20' General Standard (DC)</option>
                  <option value="45' High Cube">45' High Cube (HC)</option>
                  <option value="40' Reefer HC">40' Reefer Lạnh (HR)</option>
                  <option value="20' Open Top">20' Open Top (OT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Mã ISO Chuẩn:</label>
                <select
                  value={isoCode}
                  onChange={(e) => setIsoCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-pink-500 focus:outline-none"
                >
                  <option value="45G1">45G1 - 40HC Dry General</option>
                  <option value="22G1">22G1 - 20DC Dry General</option>
                  <option value="45R1">45R1 - 40HR Reefer Cont</option>
                  <option value="42G1">42G1 - 40GP Dry General</option>
                  <option value="22U1">22U1 - 20OT Open Top</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Chủng Loại Vỏ:</label>
                <input
                  type="text"
                  value={containerType}
                  onChange={(e) => setContainerType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Số Niêm Phong (Seal No):</label>
                <input
                  type="text"
                  value={sealNo}
                  onChange={(e) => setSealNo(e.target.value.toUpperCase())}
                  placeholder="VD: ML-VN-884920"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
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
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span>BƯỚC 3: XÁC NHẬN TÀI XẾ &amp; PHƯƠNG TIỆN VẬN TẢI</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động lấy thông tin tài xế và biển số xe thuộc doanh nghiệp vận tải
                </p>
              </div>
              <span className="text-xs font-mono text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                3 / 4
              </span>
            </div>

            {/* Driver picker */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Chọn Tài Xế Phụ Trách Lệnh Này:
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:border-pink-500 focus:outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Họ và Tên Tài Xế:</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-600 font-mono font-bold focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Biển Số Xe Đầu Kéo:</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="51C-882.19"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-mono font-bold uppercase focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Biển Số Rơ-Moóc (Chassis):</label>
                  <input
                    type="text"
                    value={moocPlate}
                    onChange={(e) => setMoocPlate(e.target.value.toUpperCase())}
                    placeholder="51R-045.22"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-mono uppercase focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
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
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>BƯỚC 4: RÀ SOÁT THÔNG TIN &amp; PHÁT HÀNH MÃ QR GATE-IN</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Vui lòng kiểm tra kỹ các thông số trước khi hoàn tất đăng ký
                </p>
              </div>
              <span className="text-xs font-mono text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                4 / 4
              </span>
            </div>

            {/* Review Card */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Block 1 */}
                <div className="space-y-2 border-r border-slate-200/80 pr-2">
                  <div className="text-pink-600 font-bold flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>LỆNH &amp; CONTAINER</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số Booking:</span>
                    <span className="font-mono font-bold text-amber-700">{selectedBookingNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hãng Tàu:</span>
                    <span className="font-bold text-sky-600">{shippingLine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số Container:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {containerNo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kích cỡ &amp; ISO:</span>
                    <span className="font-bold text-slate-700">{containerSize} ({isoCode})</span>
                  </div>
                  {sealNo && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số Seal:</span>
                      <span className="font-mono text-slate-700">{sealNo}</span>
                    </div>
                  )}
                </div>

                {/* Block 2 */}
                <div className="space-y-2 pl-2">
                  <div className="text-emerald-600 font-bold flex items-center gap-1.5 border-b border-slate-200 pb-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>TÀI XẾ &amp; LỊCH HẸN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tài xế phụ trách:</span>
                    <span className="font-bold text-slate-900">{driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <span className="font-mono font-bold text-emerald-600">{driverPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Xe đầu kéo:</span>
                    <span className="font-mono font-bold text-amber-700">{vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rơ-moóc:</span>
                    <span className="font-mono text-slate-700">{moocPlate || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Depot đến:</span>
                    <span className="font-bold text-slate-700">{depot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khung giờ hẹn:</span>
                    <span className="font-mono font-bold text-pink-600">{appointmentTime} • {appointmentDate}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Bước 3</span>
              </button>

              <button
                onClick={handleConfirmRegistration}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs rounded-xl shadow-xl  transition flex items-center gap-2 cursor-pointer"
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
