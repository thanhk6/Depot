import React, { useEffect, useRef, useState } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { containerApi, masterDataApi, customerApi } from '../../../api';
import { validateContainerNumber } from '../../survey/utils/containerValidator';
import { useDepot } from '../../../context/DepotContext';
import { GateTariffReference } from '../components/GateTariffReference';
import {
  LogIn,
  Truck,
  CheckCircle2,
  QrCode,
  Scan,
  ShieldAlert,
  Building2,
  Ship,
  Clock,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowRight,
  Boxes,
  Plus,
  Trash2,
  CreditCard,
  Sparkles,
  Camera,
  Check,
  AlertCircle,
  Zap,
  Gauge,
  Barcode,
  Share2,
  Phone,
  UserCheck,
  CheckCheck,
  ChevronRight
} from 'lucide-react';

interface GateInPageProps {
  containers?: ContainerRecord[];
  // Chỉ báo lại `id` thật (DepotJob.Id vừa Gate-In xong) — App.tsx tự `containerApi.getById(id)` để
  // lấy đúng dữ liệu thật từ Postgres (status thật là "SURVEYING", không phải "GATE_IN") thay vì tạo
  // 1 ContainerRecord đoán mò cục bộ với id giả `CONT-${Date.now()}` không khớp id thật ở bất kỳ chỗ
  // nào khác trong app.
  onAddGateIn?: (realId: string) => void;
  // Gate-In xong tự chuyển sang màn Giám Định — App.tsx chỉ truyền khi tài khoản được mở màn đó;
  // không truyền thì ở lại Gate-In và hiện phiếu e-EIR như cũ.
  onNavigateToSurvey?: () => void;
}

export interface GateLaneRecord {
  id: string;
  lane: string;
  type: 'GATE_IN' | 'GATE_OUT';
  containerNo: string;
  shippingLine: string;
  size: string;
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  truckingName: string;
  arrivalTime: string;
  status: 'CHECKING' | 'WAITING_FORKLIFT' | 'COMPLETED' | 'HOLD';
  eirNo: string;
  condition?: 'EMPTY' | 'FULL';
}

// Một loại container lấy từ danh mục "DM Loại Container (ISO)" (catalog CONTAINER_TYPE) —
// `code` = cột Name (mã loại, vd 40HC), `iso` = cột Code (mã ISO 6346, vd 45G1).
type ContainerTypeOption = { code: string; name: string; iso: string; tareWeightKg: number; maxPayloadKg: number };

// Loại container, mã ISO và tải trọng KHÔNG có giá trị mặc định cứng — điền từ loại đầu tiên của
// danh mục backend khi tải xong, hoặc từ loại người dùng bấm chọn.
const EMPTY_GATE_IN_FORM = {
  containerNo: '',
  isoCode: '',
  size: '',
  type: '',
  shippingLine: '',
  truckingCompany: '',
  licensePlate: '',
  trailerPlate: '',
  driverName: '',
  driverPhone: '',
  sealNo: '',
  bookingNo: '',
  condition: 'EMPTY' as 'EMPTY',
  tareWeight: 0,
  maxPayload: 0,
  remarks: ''
};


export const GateInPage: React.FC<GateInPageProps> = ({
  containers = [],
  onAddGateIn,
  onNavigateToSurvey
}) => {
  const { showToast, loggedInUserProfile } = useDepot();
  const [activeSubTab, setActiveSubTab] = useState<'gate_in' | 'tariffs'>('gate_in');
  // Hãng tàu + đơn vị vận tải lấy từ backend (MasterData ShippingLines / CustomerCompanies) — không còn danh
  // sách mẫu trong constants/container.ts.
  const [shippingLineOptions, setShippingLineOptions] = useState<Array<{ code: string; name: string }>>([]);
  const [truckingOptions, setTruckingOptions] = useState<Array<{ code: string; name: string }>>([]);
  useEffect(() => {
    customerApi.getAll()
      .then((response: any) => setTruckingOptions((response?.data || []).filter((c: any) => c && c.code).map((c: any) => ({ code: String(c.code), name: String(c.name || c.code) }))))
      .catch(() => setTruckingOptions([]));
  }, []);
  const [containerTypeOptions, setContainerTypeOptions] = useState<ContainerTypeOption[]>([]);
  const [containerTypeError, setContainerTypeError] = useState<string | null>(null);

  // State của form Gate-In — chỉ tập trung riêng cho khâu Tiếp Nhận Container (Hạ Vỏ Rỗng)
  const [formData, setFormData] = useState(EMPTY_GATE_IN_FORM);

  const [gateLanes, setGateLanes] = useState<GateLaneRecord[]>([]);
  const [createdEir, setCreatedEir] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmittingGateIn, setIsSubmittingGateIn] = useState(false);
  const [gateInError, setGateInError] = useState<string | null>(null);
  const [gateInFieldErrors, setGateInFieldErrors] = useState<Partial<Record<'containerNo' | 'shippingLine' | 'licensePlate' | 'driverName' | 'driverPhone' | 'tareWeight' | 'maxPayload', string>>>({});
  const containerNoRef = useRef<HTMLInputElement | null>(null);
  const shippingLineRef = useRef<HTMLSelectElement | null>(null);
  const licensePlateRef = useRef<HTMLInputElement | null>(null);
  const driverNameRef = useRef<HTMLInputElement | null>(null);
  const driverPhoneRef = useRef<HTMLInputElement | null>(null);

  const focusFirstGateInError = (errors: Partial<Record<'containerNo' | 'shippingLine' | 'licensePlate' | 'driverName' | 'driverPhone' | 'tareWeight' | 'maxPayload', string>>) => {
    const orderedFields: Array<keyof typeof errors> = ['containerNo', 'shippingLine', 'licensePlate', 'driverName', 'driverPhone', 'tareWeight', 'maxPayload'];
    const firstField = orderedFields.find((field) => Boolean(errors[field]));

    if (firstField === 'containerNo') containerNoRef.current?.focus();
    if (firstField === 'shippingLine') shippingLineRef.current?.focus();
    if (firstField === 'licensePlate') licensePlateRef.current?.focus();
    if (firstField === 'driverName') driverNameRef.current?.focus();
    if (firstField === 'driverPhone') driverPhoneRef.current?.focus();
  };

  const setFieldError = (field: keyof typeof gateInFieldErrors, message: string | null) => {
    setGateInFieldErrors((prev) => ({
      ...prev,
      [field]: message || undefined
    }));
  };

  const clearGateInErrors = () => {
    setGateInError(null);
    setGateInFieldErrors({});
  };

  // Xoá trắng form sau Gate-In thành công — hãng tàu và loại container quay về mục đầu tiên của danh mục
  // (giống lúc mới mở màn), các ô xe / tài xế / seal / ghi chú để trống cho container kế tiếp.
  const resetGateInForm = () => {
    const firstType = containerTypeOptions[0];
    setFormData({
      ...EMPTY_GATE_IN_FORM,
      shippingLine: shippingLineOptions[0]?.code || '',
      ...(firstType ? { size: firstType.code, type: firstType.name, isoCode: firstType.iso, tareWeight: firstType.tareWeightKg, maxPayload: firstType.maxPayloadKg } : {})
    });
    clearGateInErrors();
  };

  const validateGateInField = (field: 'containerNo' | 'shippingLine' | 'licensePlate' | 'driverName' | 'driverPhone' | 'tareWeight' | 'maxPayload') => {
    const value = field === 'containerNo'
      ? formData.containerNo
      : field === 'shippingLine'
        ? formData.shippingLine
        : field === 'licensePlate'
          ? formData.licensePlate
          : field === 'driverName'
            ? formData.driverName
            : field === 'driverPhone'
              ? formData.driverPhone
              : field === 'tareWeight'
                ? String(formData.tareWeight)
                : String(formData.maxPayload);

    let message: string | null = null;

    if (field === 'containerNo' && !value.trim()) message = 'Thiếu số container.';
    if (field === 'shippingLine' && !value.trim()) message = 'Thiếu hãng tàu.';
    if (field === 'licensePlate' && !value.trim()) message = 'Thiếu biển số đầu kéo.';
    if (field === 'driverName' && !value.trim()) message = 'Thiếu họ tên bác tài.';
    if (field === 'driverPhone' && !value.trim()) message = 'Thiếu số điện thoại bác tài.';
    if (field === 'tareWeight' && Number(value) <= 0) message = 'Tare weight phải lớn hơn 0.';
    if (field === 'maxPayload' && Number(value) <= 0) message = 'Max payload phải lớn hơn 0.';

    setFieldError(field, message);
    return message;
  };

  const validateGateInFields = () => {
    const nextErrors: Partial<Record<'containerNo' | 'shippingLine' | 'licensePlate' | 'driverName' | 'driverPhone' | 'tareWeight' | 'maxPayload', string>> = {};

    if (!formData.containerNo.trim()) nextErrors.containerNo = 'Thiếu số container.';
    if (!formData.shippingLine.trim()) nextErrors.shippingLine = 'Thiếu hãng tàu.';
    if (!formData.licensePlate.trim()) nextErrors.licensePlate = 'Thiếu biển số đầu kéo.';
    if (!formData.driverName.trim()) nextErrors.driverName = 'Thiếu họ tên bác tài.';
    if (!formData.driverPhone.trim()) nextErrors.driverPhone = 'Thiếu số điện thoại bác tài.';
    if (Number(formData.tareWeight) <= 0) nextErrors.tareWeight = 'Tare weight phải lớn hơn 0.';
    if (Number(formData.maxPayload) <= 0) nextErrors.maxPayload = 'Max payload phải lớn hơn 0.';

    setGateInFieldErrors(nextErrors);
    return nextErrors;
  };

  const mapBackendGateInErrorToField = (message: string) => {
    if (/container|số container/i.test(message)) return 'containerNo';
    if (/hãng tàu|shipping line/i.test(message)) return 'shippingLine';
    if (/biển số|license plate/i.test(message)) return 'licensePlate';
    if (/bác tài|họ tên|driver name/i.test(message)) return 'driverName';
    if (/số điện thoại|phone/i.test(message)) return 'driverPhone';
    if (/tare/i.test(message)) return 'tareWeight';
    if (/payload|max payload/i.test(message)) return 'maxPayload';
    return null;
  };

  useEffect(() => {
    let cancelled = false;

    masterDataApi.getShippingLines()
      .then((response: any) => {
        if (cancelled) return;
        if (response?.statusCode === 200 && Array.isArray(response.data) && response.data.length > 0) {
          const nextOptions = response.data
            .filter((line: any) => line && (line.code || line.name))
            .map((line: any) => ({
              code: String(line.code || line.name).trim(),
              name: String(line.name || line.code).trim()
            }))
            .filter((line: { code: string; name: string }) => Boolean(line.code));

          if (nextOptions.length > 0) {
            setShippingLineOptions(nextOptions);
            setFormData((prev) => {
              const currentValid = nextOptions.some((line) => line.code === prev.shippingLine);
              return currentValid ? prev : { ...prev, shippingLine: nextOptions[0].code };
            });
          }
        }
      })
      .catch(() => {
        setShippingLineOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Danh mục "Kích Thước & Loại Container" lấy 100% từ backend (catalog CONTAINER_TYPE, các dòng đang
  // áp dụng) — không lọc whitelist, không danh sách dự phòng hardcode. Backend Gate-In cũng kiểm tra
  // `isoSize` theo chính danh mục này (DepotJobService.CreateGateInJobAsync), nên loại nào hiện ở đây
  // thì nộp được. Tare/payload điền sẵn theo thông số của loại trong danh mục.
  const applyContainerType = (item: ContainerTypeOption) => {
    setFormData((prev) => ({
      ...prev,
      size: item.code,
      type: item.name,
      isoCode: item.iso,
      tareWeight: item.tareWeightKg,
      maxPayload: item.maxPayloadKg
    }));
  };

  useEffect(() => {
    let cancelled = false;

    masterDataApi.getCatalog('CONTAINER_TYPE')
      .then((response: any) => {
        if (cancelled) return;
        if (response?.statusCode !== 200 || !Array.isArray(response.data)) {
          throw new Error(response?.message || 'Không tải được danh mục loại container.');
        }
        const nextOptions: ContainerTypeOption[] = response.data
          .filter((item: any) => item && item.name)
          .map((item: any) => {
            let jsonData: any = {};
            try { jsonData = JSON.parse(item.jsonData || '{}'); } catch { jsonData = {}; }
            return {
              code: String(item.name).trim(),
              name: String(item.nameVi || item.name).trim(),
              iso: String(item.code).trim(),
              tareWeightKg: Number(jsonData.tareWeightKg) || 0,
              maxPayloadKg: Number(jsonData.maxPayloadKg) || 0
            };
          });
        setContainerTypeOptions(nextOptions);
        setContainerTypeError(nextOptions.length === 0 ? 'Danh mục "DM Loại Container (ISO)" chưa có loại nào đang áp dụng.' : null);
        if (nextOptions.length > 0) {
          setFormData((prev) => (prev.size ? prev : {
            ...prev,
            size: nextOptions[0].code,
            type: nextOptions[0].name,
            isoCode: nextOptions[0].iso,
            tareWeight: nextOptions[0].tareWeightKg,
            maxPayload: nextOptions[0].maxPayloadKg
          }));
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setContainerTypeOptions([]);
        setContainerTypeError(error instanceof Error ? error.message : 'Không tải được danh mục loại container từ backend.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Xử lý submit Gate-In (chỉ riêng khâu Tiếp Nhận Container)
  const handleGateInSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearGateInErrors();

    const nextErrors = validateGateInFields();
    if (Object.keys(nextErrors).length > 0) {
      focusFirstGateInError(nextErrors);
      const missingLabels = [
        nextErrors.containerNo,
        nextErrors.shippingLine,
        nextErrors.licensePlate,
        nextErrors.driverName,
        nextErrors.driverPhone,
        nextErrors.tareWeight,
        nextErrors.maxPayload
      ].filter(Boolean) as string[];
      const detailMessage = `Thiếu thông tin bắt buộc: ${missingLabels.join(' ')}`;
      setGateInError(detailMessage);
      showToast(detailMessage, 'error', 'Gate-In thiếu dữ liệu');
      return;
    }

    // Chặn sớm ở frontend cho trải nghiệm mượt hơn — dù backend cũng tự chặn lại lần nữa
    // (xem ValidateGateInRequest trong DepotJobService.cs) nếu request lọt qua được bước này.
    if (!formData.size) {
      const detailMessage = 'Chưa chọn Kích Thước & Loại Container (danh mục lấy từ DM Loại Container).';
      setGateInError(detailMessage);
      showToast(detailMessage, 'error', 'Gate-In thiếu dữ liệu');
      return;
    }

    if (!loggedInUserProfile) {
      const detailMessage = 'Không xác định được nhân viên tiếp nhận. Vui lòng đăng nhập lại.';
      setGateInError(detailMessage);
      showToast(detailMessage, 'error', 'Phiên đăng nhập không hợp lệ');
      return;
    }

    setIsSubmittingGateIn(true);

    try {
      // JobNo, EIR, trạng thái và mốc thời gian đều do backend tự sinh — giao diện chỉ gửi
      // dữ liệu phiếu tiếp nhận rồi hiển thị lại đúng kết quả thật trả về từ Postgres.
      const response: any = await containerApi.createGateIn({
        containerNo: formData.containerNo,
        isoSize: formData.size,
        shippingLine: formData.shippingLine,
        tareWeightKg: formData.tareWeight,
        maxPayloadKg: formData.maxPayload,
        truckPlate: formData.licensePlate,
        driverName: formData.driverName,
        driverPhone: formData.driverPhone,
        trailerPlate: formData.trailerPlate || undefined,
        sealNo: formData.sealNo || undefined,
        bookingNo: formData.bookingNo || undefined,
        truckingCompany: formData.truckingCompany || undefined,
        remarks: formData.remarks || undefined,
        // Nhân viên tiếp nhận lấy tự động theo tài khoản đang đăng nhập (Users.Id thật), không cho chọn tay.
        gateInStaffId: loggedInUserProfile ? Number(loggedInUserProfile.id) : undefined
      });

      if (response?.statusCode !== 200 || !response.data) {
        throw new Error(response?.data || response?.message || 'Backend không thể ghi nhận Gate-In.');
      }

      const persistedJob = response.data;
      if (onAddGateIn) {
        onAddGateIn(String(persistedJob.id));
      }

    const newEir = {
      id: persistedJob.id,
      jobNo: persistedJob.jobNo,
      eirNo: persistedJob.gateInEirNo,
      type: 'GATE_IN (HẠ VỎ RỖNG)',
      containerNo: formData.containerNo,
      isoCode: formData.isoCode,
      size: formData.size,
      shippingLine: formData.shippingLine,
      licensePlate: formData.licensePlate,
      trailerPlate: formData.trailerPlate,
      driverName: formData.driverName,
      driverPhone: formData.driverPhone,
      truckingCompany: formData.truckingCompany,
      sealNo: formData.sealNo,
      bookingNo: formData.bookingNo,
      remarks: formData.remarks,
      condition: 'Hạ Vỏ Rỗng (Empty Return)',
      createdAt: new Date().toLocaleString('vi-VN'),
      status: persistedJob.status === 'SURVEYING'
        ? 'TIẾP NHẬN THÀNH CÔNG • CHỜ GIÁM ĐỊNH'
        : persistedJob.status
    };

    const newLaneRecord: GateLaneRecord = {
      id: `G-${Date.now().toString().slice(-3)}`,
      lane: 'LÀN 01 (CỔNG NHẬP)',
      type: 'GATE_IN',
      containerNo: formData.containerNo,
      shippingLine: formData.shippingLine,
      size: formData.size,
      licensePlate: formData.licensePlate,
      driverName: formData.driverName,
      driverPhone: formData.driverPhone,
      truckingName: formData.truckingCompany,
      arrivalTime: 'Vừa xong',
      status: 'WAITING_FORKLIFT',
      eirNo: newEir.eirNo,
      condition: 'EMPTY'
    };

    setGateLanes((prev) => [newLaneRecord, ...prev]);
    setCreatedEir(newEir);
    resetGateInForm();

      if (onNavigateToSurvey) {
        showToast(
          `Đã tiếp nhận container ${persistedJob.containerNo} (${persistedJob.gateInEirNo}) — chuyển sang Giám Định.`,
          'success',
          'Gate-In thành công'
        );
        onNavigateToSurvey();
      } else {
        showToast(
          `Đã tiếp nhận container ${persistedJob.containerNo} và sinh ${persistedJob.gateInEirNo}.`,
          'success',
          'Gate-In thành công'
        );
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      const backendError = error as any;
      const message =
        backendError?.response?.data?.data ||
        backendError?.response?.data?.message ||
        backendError?.message ||
        'Không thể kết nối Backend.';
      setGateInError(message);
      const field = mapBackendGateInErrorToField(message);
      if (field) {
        setFieldError(field, message);
      }
      showToast(message, 'error', 'Gate-In thất bại');
    } finally {
      setIsSubmittingGateIn(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP HERO BANNER & REAL-TIME KPI STRIP — đồng bộ đúng chuẩn "Dashboard ERP Tổng Quan"
          (dashboard/pages/DashboardPage.tsx) theo yêu cầu người dùng 2026-09-06, xem
          docs/frontend-theme-unification.md. */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-200 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cổng Tiếp Nhận Hạ Vỏ Rỗng (Gate-In)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              Tự động kiểm tra container, định tuyến bệ giám định IICL-6 và cấp phiếu điện tử e-EIR tức thì.
            </p>
          </div>

        </div>

        {/* Real-time KPI Metric Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-blue-100 relative z-10">
          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Hạ Vỏ Hôm Nay</div>
                <div className="text-sm sm:text-base font-mono font-black text-slate-900">
                  {gateLanes.filter((lane) => lane.type === 'GATE_IN').length} Cont{' '}
                  <span className="text-[10px] text-emerald-600 font-sans font-bold">Live</span>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Xe Tại Làn Cổng</div>
              <div className="text-sm sm:text-base font-mono font-black text-slate-900">
                {gateLanes.length} Xe <span className="text-[10px] text-sky-600 font-sans">Đang phục vụ</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Xử Lý Trung Bình</div>
              <div className="text-sm sm:text-base font-mono font-black text-slate-900">
                {'--'}{' '}
                <span className="text-[10px] text-amber-600 font-sans font-bold">
                  {gateLanes.length > 0 ? 'Live' : 'Chưa có dữ liệu'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">Loại Hình Tiếp Nhận</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-600 truncate">100% Vỏ Rỗng (Empty)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB TABS NAVIGATION (nền sáng) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200 touch-pan-x overscroll-x-contain scrollbar-thin select-none">
        <button
          onClick={() => setActiveSubTab('gate_in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'gate_in'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white bg-slate-50 border border-slate-200 shadow-sm'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>1. Tiếp Nhận Hạ Vỏ Rỗng (Gate-In)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tariffs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'tariffs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white bg-slate-50 border border-slate-200 shadow-sm'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. Biểu Phí Dịch Vụ Cổng</span>
        </button>
      </div>

      {/* TAB 1: GATE-IN FORM (TIẾP NHẬN HẠ VỎ RỖNG CHUYÊN SÂU) */}



      {activeSubTab === 'gate_in' && (
        <form onSubmit={(e) => handleGateInSubmit(e)} className="space-y-4 sm:space-y-6">
          {gateInError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{gateInError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* LEFT COLUMN: CONTAINER DETAILS & OCR SCANNER (7 COLS) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              
              {/* Card 1: Container ISO & Shipping Line info */}
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Scan className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        1. Thông Tin Vỏ Container (Hạ Vỏ)
                      </h3>
                      <span className="text-[10px] text-slate-500">Quy chuẩn ISO 6346 & Tiêu chuẩn Hãng Tàu</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Container No Big Input with Live Status Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>Số Container (ISO 6346)*</span>
                        <span className="text-[10px] text-rose-400 font-mono">Bắt buộc</span>
                      </label>
                      {formData.containerNo.trim().length === 11 && (
                        validateContainerNumber(formData.containerNo).isCheckDigitCorrect ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">✓ Check Digit Valid</span>
                        ) : (
                          <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">✗ Sai Check Digit</span>
                        )
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        ref={containerNoRef}
                        value={formData.containerNo}
                        onChange={(e) => {
                          setFormData({ ...formData, containerNo: e.target.value.toUpperCase() });
                          if (gateInFieldErrors.containerNo) setFieldError('containerNo', null);
                        }}
                        onBlur={() => validateGateInField('containerNo')}
                        placeholder="VD: MSCU7729104"
                        className={`w-full px-4 py-3 bg-white rounded-xl text-base sm:text-lg font-mono font-black text-slate-900 focus:outline-none tracking-widest uppercase transition shadow-sm border ${gateInFieldErrors.containerNo ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[11px] font-bold font-mono bg-blue-50 text-blue-700 rounded border border-blue-200">
                          {formData.isoCode}
                        </span>
                      </div>
                    </div>
                    {gateInFieldErrors.containerNo && (
                      <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.containerNo}</p>
                    )}
                  </div>

                  {/* Size Quick Buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kích Thước & Loại Container
                    </label>
                    {containerTypeError && (
                      <p className="mb-2 text-[11px] font-semibold text-rose-600">{containerTypeError}</p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {containerTypeOptions.map((item) => (
                        <button
                          key={`${item.code}-${item.iso}`}
                          type="button"
                          title={`${item.code} • ISO ${item.iso} • ${item.name}`}
                          onClick={() => applyContainerType(item)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer border ${
                            formData.size === item.code
                                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-black text-sm">{item.code}</div>
                          <div className="text-[10px] opacity-80 truncate">{item.name}</div>
                        </button>
                      ))}
                    </div>
                    {/* Trọng lượng vỏ: điền sẵn theo DM Loại Container, sửa được theo số in trên cửa container. Trước đây
                        không có ô nhập — loại chưa khai báo trọng lượng (vd 40HC) bị kẹt ở lỗi "Tare weight phải lớn hơn 0". */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tare Weight (kg)*</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.tareWeight || ''}
                          onChange={(e) => {
                            setFormData({ ...formData, tareWeight: Number(e.target.value) || 0 });
                            if (gateInFieldErrors.tareWeight) setFieldError('tareWeight', null);
                          }}
                          onBlur={() => validateGateInField('tareWeight')}
                          className={`w-full px-3 py-2 bg-white text-xs font-mono text-slate-900 rounded-xl focus:outline-none min-h-[40px] shadow-sm border ${gateInFieldErrors.tareWeight ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'}`}
                        />
                        {gateInFieldErrors.tareWeight && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.tareWeight}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Max Payload (kg)*</label>
                        <input
                          type="number"
                          min={0}
                          value={formData.maxPayload || ''}
                          onChange={(e) => {
                            setFormData({ ...formData, maxPayload: Number(e.target.value) || 0 });
                            if (gateInFieldErrors.maxPayload) setFieldError('maxPayload', null);
                          }}
                          onBlur={() => validateGateInField('maxPayload')}
                          className={`w-full px-3 py-2 bg-white text-xs font-mono text-slate-900 rounded-xl focus:outline-none min-h-[40px] shadow-sm border ${gateInFieldErrors.maxPayload ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'}`}
                        />
                        {gateInFieldErrors.maxPayload && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.maxPayload}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Line & Seal No */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Hãng Tàu Quản Lý (Shipping Line)*
                      </label>
                      <select
                        ref={shippingLineRef}
                        value={formData.shippingLine}
                        onChange={(e) => {
                          setFormData({ ...formData, shippingLine: e.target.value });
                          if (gateInFieldErrors.shippingLine) setFieldError('shippingLine', null);
                        }}
                        onBlur={() => validateGateInField('shippingLine')}
                        className={`w-full px-3.5 py-2.5 bg-white text-xs text-slate-900 rounded-xl font-bold focus:outline-none min-h-[42px] shadow-sm border ${gateInFieldErrors.shippingLine ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`}
                      >
                        {shippingLineOptions.map((line) => (
                          <option key={line.code} value={line.code}>
                            {line.code} - {line.name}
                          </option>
                        ))}
                      </select>
                      {gateInFieldErrors.shippingLine && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.shippingLine}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Số Niêm Phong Lúc Hạ (Seal No.)
                      </label>
                      <input
                        type="text"
                        value={formData.sealNo}
                        onChange={(e) => setFormData({ ...formData, sealNo: e.target.value })}
                        placeholder="ML-SEAL-88912"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl font-mono focus:border-blue-500 focus:outline-none min-h-[42px] shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Fixed Condition: 100% Hạ Vỏ Rỗng Badge */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-emerald-200">
                        <CheckCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                          Mục Đích: Tiếp Nhận Hạ Vỏ Rỗng (Empty Return)
                        </div>
                        <div className="text-[11px] text-emerald-600">
                          Chuyên biệt cho khâu tiếp nhận hạ rỗng, vệ sinh & giám định vỏ IICL
                        </div>
                      </div>
                    </div>
                    <span className="hidden sm:inline px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white text-emerald-700 border border-emerald-200">
                      100% DEPOT
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: TRUCKING & DRIVER INFO + SUBMISSION (5 COLS) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5 flex flex-col justify-between">
              
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                        2. Xe Vận Tải & Tài Xế
                      </h3>
                      <span className="text-[10px] text-slate-500">Nhà xe vận chuyển giao vỏ rỗng</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                    GPS Check-In
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Trucking partner selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Đơn Vị Vận Tải / Nhà Xe*
                    </label>
                    <select
                      value={formData.truckingCompany}
                      onChange={(e) => setFormData({ ...formData, truckingCompany: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl font-bold focus:border-sky-500 focus:outline-none min-h-[42px] shadow-sm"
                    >
                      <option value="">{truckingOptions.length === 0 ? '— Chưa có khách hàng/nhà xe —' : '— Chọn đơn vị vận tải —'}</option>
                      {truckingOptions.map((cust) => (
                        <option key={cust.code} value={cust.code}>
                          [{cust.code}] {cust.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plates Grid with Stylized Vietnamese Plate Badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Biển Số Đầu Kéo*
                      </label>
                      <input
                        type="text"
                        required
                        ref={licensePlateRef}
                        value={formData.licensePlate}
                        onChange={(e) => {
                          setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() });
                          if (gateInFieldErrors.licensePlate) setFieldError('licensePlate', null);
                        }}
                        onBlur={() => validateGateInField('licensePlate')}
                        placeholder="51C-992.10"
                        className={`w-full px-3 py-2 bg-white text-xs font-mono font-black text-amber-700 rounded-xl focus:outline-none tracking-wider min-h-[40px] shadow-sm border ${gateInFieldErrors.licensePlate ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'}`}
                      />
                      {gateInFieldErrors.licensePlate && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.licensePlate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Biển Rơ-moóc
                      </label>
                      <input
                        type="text"
                        value={formData.trailerPlate}
                        onChange={(e) => setFormData({ ...formData, trailerPlate: e.target.value.toUpperCase() })}
                        placeholder="51R-881.02"
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 rounded-xl focus:border-sky-500 focus:outline-none tracking-wider min-h-[40px] shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Nhân viên tiếp nhận: hệ thống tự lấy theo tài khoản đang đăng nhập (Users.Id thật),
                      không cho chọn/nhập tay để đảm bảo đúng người chịu trách nhiệm ghi vào audit log. */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nhân Viên Tiếp Nhận
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loggedInUserProfile?.fullName || 'Chưa đăng nhập'}
                        readOnly
                        disabled
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl min-h-[40px] shadow-sm cursor-not-allowed"
                      />
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Tự động lấy theo tài khoản đang đăng nhập, không thể chỉnh sửa.</p>
                  </div>

                  {/* Driver Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ Tên Bác Tài
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          ref={driverNameRef}
                          value={formData.driverName}
                          onChange={(e) => {
                            setFormData({ ...formData, driverName: e.target.value });
                            if (gateInFieldErrors.driverName) setFieldError('driverName', null);
                          }}
                          onBlur={() => validateGateInField('driverName')}
                          placeholder="Nguyễn Văn Tiến"
                          className={`w-full pl-8 pr-3 py-2 bg-white text-xs text-slate-900 rounded-xl focus:outline-none min-h-[40px] shadow-sm border ${gateInFieldErrors.driverName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'}`}
                        />
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {gateInFieldErrors.driverName && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.driverName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        SĐT Nhận e-EIR SMS
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          ref={driverPhoneRef}
                          value={formData.driverPhone}
                          onChange={(e) => {
                            setFormData({ ...formData, driverPhone: e.target.value });
                            if (gateInFieldErrors.driverPhone) setFieldError('driverPhone', null);
                          }}
                          onBlur={() => validateGateInField('driverPhone')}
                          placeholder="0909123456"
                          className={`w-full pl-8 pr-3 py-2 bg-white text-xs font-mono text-slate-900 rounded-xl focus:outline-none min-h-[40px] shadow-sm border ${gateInFieldErrors.driverPhone ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-sky-500'}`}
                        />
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      {gateInFieldErrors.driverPhone && (
                        <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{gateInFieldErrors.driverPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ghi Chú Tiếp Nhận Tại Cổng
                    </label>
                    <input
                      type="text"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Container nguyên niêm phong, không móp méo..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-700 rounded-xl focus:border-sky-500 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Box */}
              <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
                <button
                  type="submit"
                  disabled={isSubmittingGateIn}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ring-1 ring-blue-200"
                >
                  <Boxes className="w-5 h-5" />
                  <span>{isSubmittingGateIn ? 'ĐANG GHI SQL SERVER...' : 'XÁC NHẬN TIẾP NHẬN'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </form>
      )}

      {/* TAB 5: TARIFFS REFERENCE */}
      {activeSubTab === 'tariffs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Quy Định & Biểu Phí Tham Khảo (Depot Tariffs Reference)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Biểu phí đang áp dụng, đọc trực tiếp từ Danh mục. Phí được tính và thu tại bước Khai thác dịch vụ sau khi giám định vỏ.
            </p>
          </div>

          <GateTariffReference />
        </div>
      )}

      {/* SUCCESS MODAL / EIR PREVIEW */}
      {isSuccessModalOpen && createdEir && (
        // Backdrop LUÔN giữ tối theo quy ước (bg-slate-900/70) dù panel bên trong đã chuyển sáng.
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">TIẾP NHẬN CONTAINER THÀNH CÔNG!</h3>
              <p className="text-xs text-slate-500">
                Mã chứng từ e-EIR: <span className="font-mono font-bold text-emerald-700">{createdEir.eirNo}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Số Container:</span>
                <span className="font-mono font-bold text-sky-600">{createdEir.containerNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Hãng Tàu & Kích Thước:</span>
                <span className="font-bold text-slate-900">{createdEir.shippingLine} ({createdEir.size})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Phương Tiện / Bác Tài:</span>
                <span className="font-mono text-slate-900">{createdEir.licensePlate} • {createdEir.driverName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Mục Đích:</span>
                <span className="font-bold text-emerald-700">{createdEir.condition}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full sm:flex-1 py-3 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
