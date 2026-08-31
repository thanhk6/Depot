import React, { useEffect, useRef, useState } from 'react';
import { SHIPPING_LINES, TRUCKING_CUSTOMERS } from '../../../constants/container';
import { ContainerRecord } from '../../../services/mockDataStore';
import { containerApi, masterDataApi } from '../../../api';
import { useDepot } from '../../../context/DepotContext';
import {
  LogIn,
  LogOut,
  Truck,
  CheckCircle2,
  QrCode,
  Scan,
  ShieldAlert,
  Building2,
  Ship,
  FileText,
  Clock,
  Printer,
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
  MapPin,
  Camera,
  Check,
  Eye,
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
  onAddGateIn?: (newContainer: {
    containerNo: string;
    isoCode: string;
    size: string;
    type: string;
    shippingLine: string;
    licensePlate: string;
    driverName: string;
    driverPhone: string;
  }) => void;
  onNavigateTab: (tabId: string) => void;
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
  yardBlock: string;
  surveyBay?: string;
  condition?: 'EMPTY' | 'FULL';
}

const INITIAL_GATE_LANES: GateLaneRecord[] = [
  {
    id: 'G-101',
    lane: 'LÀN 01 (CỔNG NHẬP)',
    type: 'GATE_IN',
    containerNo: 'MSCU7729104',
    shippingLine: 'MSK',
    size: '40HC',
    licensePlate: '51C-882.19',
    driverName: 'Nguyễn Văn Thành',
    driverPhone: '0908123456',
    truckingName: 'Công Ty Vận Tải Á Châu',
    arrivalTime: '10 phút trước',
    status: 'WAITING_FORKLIFT',
    eirNo: 'EIR-IN-882109',
    yardBlock: 'BLOCK A-02-03-2',
    surveyBay: 'BỆ 01 (Giám Định Nhanh)',
    condition: 'EMPTY'
  },
  {
    id: 'G-102',
    lane: 'LÀN 02 (CỔNG NHẬP)',
    type: 'GATE_IN',
    containerNo: 'CMAU9918231',
    shippingLine: 'CMA',
    size: '20DC',
    licensePlate: '51D-334.82',
    driverName: 'Lê Hoàng Nam',
    driverPhone: '0912345678',
    truckingName: 'Logistics Tân Cảng SG',
    arrivalTime: '3 phút trước',
    status: 'CHECKING',
    eirNo: 'EIR-IN-882110',
    yardBlock: 'BLOCK B-01-01-1',
    surveyBay: 'BỆ 03 (IICL-6 Tiêu Chuẩn)',
    condition: 'EMPTY'
  },
  {
    id: 'G-103',
    lane: 'LÀN 03 (CỔNG XUẤT CẤP VỎ)',
    type: 'GATE_OUT',
    containerNo: 'TCKU2019482',
    shippingLine: 'MSK',
    size: '40HC',
    licensePlate: '50H-918.23',
    driverName: 'Phạm Quốc Hùng',
    driverPhone: '0987654321',
    truckingName: 'Vận Tải Miền Nam Corp',
    arrivalTime: '15 phút trước',
    status: 'COMPLETED',
    eirNo: 'EIR-OUT-991042',
    yardBlock: 'BLOCK A-01-02-3',
    condition: 'EMPTY'
  }
];

// Fallback khi chưa tải được danh mục "DM Loại Container (ISO)" thật (MasterData catalog CONTAINER_TYPE).
const DEFAULT_CONTAINER_TYPES: Array<{ code: string; name: string; iso: string }> = [
  { code: '40HC', name: '40 High Cube', iso: '45G1' },
  { code: '20DC', name: '20 Standard', iso: '22G1' },
  { code: '40DC', name: '40 Standard', iso: '42G1' },
  { code: '45HC', name: '45 High Cube', iso: '45G1' },
];

const EMPTY_GATE_IN_FORM = {
  containerNo: '',
  isoCode: '40HC',
  size: '40HC',
  type: 'Dry High Cube',
  shippingLine: SHIPPING_LINES[0]?.code || 'MAEU',
  truckingCompany: 'LOG-TC',
  licensePlate: '',
  trailerPlate: '',
  driverName: '',
  driverPhone: '',
  sealNo: '',
  bookingNo: '',
  condition: 'EMPTY' as 'EMPTY',
  tareWeight: 3850,
  maxPayload: 28650,
  yardBlock: 'BLOCK_A',
  surveyBay: 'BAY_01',
  remarks: ''
};


const EMPTY_GATE_OUT_FORM = {
  releaseOrderNo: '',
  bookingNo: '',
  shippingLine: 'MSK',
  size: '40HC',
  selectedContainerNo: '',
  truckingCompany: 'Công Ty Vận Tải Quốc Tế Á Châu',
  licensePlate: '',
  trailerPlate: '',
  driverName: '',
  driverPhone: '',
  newSealNo: '',
  destinationPort: ''
};

export const GateInPage: React.FC<GateInPageProps> = ({
  containers = [],
  onAddGateIn,
  onNavigateTab
}) => {
  const { showToast, loggedInUserProfile } = useDepot();
  const [activeSubTab, setActiveSubTab] = useState<'gate_in' | 'gate_out' | 'live_queue' | 'eir_list' | 'tariffs'>('gate_in');
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [shippingLineOptions, setShippingLineOptions] = useState<Array<{ code: string; name: string }>>(SHIPPING_LINES);
  const [containerTypeOptions, setContainerTypeOptions] = useState<Array<{ code: string; name: string; iso: string }>>(DEFAULT_CONTAINER_TYPES);
  const availableGateOutContainers = containers.filter(
    (container) => container.status === 'READY_FOR_OUT' || container.status === 'READY_FOR_USE' || container.condition === 'AV'
  );

  // State của form Gate-In — chỉ tập trung riêng cho khâu Tiếp Nhận Container (Hạ Vỏ Rỗng)
  const [formData, setFormData] = useState(EMPTY_GATE_IN_FORM);

  // State của form Gate-Out (Cấp Vỏ / Xuất Cổng)
  const [gateOutData, setGateOutData] = useState(EMPTY_GATE_OUT_FORM);

  const [gateLanes, setGateLanes] = useState<GateLaneRecord[]>([]);
  const [createdEir, setCreatedEir] = useState<any>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedEirModal, setSelectedEirModal] = useState<any>(null);
  const [isSubmittingGateIn, setIsSubmittingGateIn] = useState(false);
  const [gateInError, setGateInError] = useState<string | null>(null);
  const [gateInFieldErrors, setGateInFieldErrors] = useState<Partial<Record<'containerNo' | 'shippingLine' | 'licensePlate' | 'driverName' | 'driverPhone' | 'tareWeight' | 'maxPayload', string>>>({});
  const [isSubmittingGateOut, setIsSubmittingGateOut] = useState(false);
  const [gateOutError, setGateOutError] = useState<string | null>(null);
  const [gateOutFieldErrors, setGateOutFieldErrors] = useState<Partial<Record<'selectedContainerNo' | 'licensePlate' | 'driverName', string>>>({});
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
        setShippingLineOptions(SHIPPING_LINES);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Danh mục "Kích Thước & Loại Container" — trước đây hardcode cứng 4 mục, không đồng bộ với
  // màn Master Data > DM Loại Container (ISO) (catalog CONTAINER_TYPE lưu Postgres thật). Catalog
  // đầy đủ có ~20 quy cách (kể cả Tank/Flat Rack/Open Top...) nhưng Gate-In (hạ vỏ rỗng) chỉ nhận 6
  // loại theo đúng whitelist backend (`ValidateGateInRequest.validSizes` trong DepotJobService.cs) —
  // lọc lại ở đây để không hiện nút mà submit chắc chắn bị backend từ chối.
  const GATE_IN_ACCEPTED_ISO_SIZES = new Set(['20GP', '40GP', '40HC', '45HC', '20RF', '40RH']);

  useEffect(() => {
    let cancelled = false;

    masterDataApi.getCatalog('CONTAINER_TYPE')
      .then((response: any) => {
        if (cancelled) return;
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          const nextOptions = response.data
            .filter((item: any) => item && item.isActive !== false && (item.name || item.code))
            .map((item: any) => {
              let jsonData: any = {};
              try { jsonData = JSON.parse(item.jsonData || '{}'); } catch { jsonData = {}; }
              return {
                code: String(item.name || item.code).trim(),
                name: String(item.nameVi || item.name || item.code).trim(),
                iso: String(jsonData.isoCode || item.code).trim()
              };
            })
            .filter((item: { code: string; name: string; iso: string }) => Boolean(item.code) && GATE_IN_ACCEPTED_ISO_SIZES.has(item.code.toUpperCase()));

          if (nextOptions.length > 0) {
            setContainerTypeOptions(nextOptions);
          }
        }
      })
      .catch(() => {
        setContainerTypeOptions(DEFAULT_CONTAINER_TYPES);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Tự sinh nhanh dữ liệu mẫu để demo (giả lập quét OCR biển số/số cont)
  const handleSimulateOCR = () => {
    setIsScanningOCR(true);
    setTimeout(() => {
      const prefixes = ['MSCU', 'MAEU', 'CMAU', 'ONEY', 'TGHU', 'COSU'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomNum = Math.floor(1000000 + Math.random() * 900000);
      const randomPlates = ['51C-774.20', '60C-912.83', '50H-118.99', '72C-554.12'];
      const randomDrivers = ['Trần Quốc Bảo', 'Lê Hữu Đạt', 'Vũ Đình Toàn', 'Nguyễn Tấn Dũng'];

      setFormData(prev => ({
        ...prev,
        containerNo: `${randomPrefix}${randomNum}`,
        sealNo: `SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
        licensePlate: randomPlates[Math.floor(Math.random() * randomPlates.length)],
        driverName: randomDrivers[Math.floor(Math.random() * randomDrivers.length)]
      }));
      setIsScanningOCR(false);
    }, 600);
  };

  // Xử lý submit Gate-In (chỉ riêng khâu Tiếp Nhận Container)
  const handleGateInSubmit = async (e?: React.FormEvent, redirectToSurvey = false) => {
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
        isoSize: formData.size === '20DC' ? '20GP' : formData.size === '40DC' ? '40GP' : formData.size,
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
        onAddGateIn({
          containerNo: persistedJob.containerNo,
          isoCode: persistedJob.isoSize,
          size: persistedJob.isoSize,
          type: formData.type,
          shippingLine: persistedJob.shippingLineCode || formData.shippingLine,
          licensePlate: formData.licensePlate,
          driverName: formData.driverName,
          driverPhone: formData.driverPhone
        });
      }

    const bayLabelMap: Record<string, string> = {
      BAY_01: 'BỆ 01 (Bệ Giám Định Cont Khô)',
      BAY_02: 'BỆ 02 (Bệ Giám Định Cont Lạnh & PTI)',
      BAY_03: 'BỆ 03 (Bệ Giám Định IICL-6 Tiêu Chuẩn)',
      BAY_04: 'BỆ 04 (Bệ Giám Định Cơ Khí & M&R)'
    };

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
      yardLocation: `${formData.yardBlock}-B02-R01-T2`,
      surveyBay: bayLabelMap[formData.surveyBay] || 'BỆ 01 (Giám Định)',
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
      yardBlock: newEir.yardLocation,
      surveyBay: newEir.surveyBay,
      condition: 'EMPTY'
    };

    setGateLanes((prev) => [newLaneRecord, ...prev]);
    setCreatedEir(newEir);
    showToast(
      `Đã tiếp nhận container ${persistedJob.containerNo} và sinh ${persistedJob.gateInEirNo}.`,
      'success',
      'Gate-In thành công'
    );

      if (redirectToSurvey) {
        onNavigateTab('survey');
      } else {
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






  

  // Xử lý submit Gate-Out (Cấp Vỏ / Xuất Cổng) — ghi thật xuống backend qua
  // POST /DepotJobs/{id}/gate-out, dùng đúng contract mà phân hệ Gate-Out thật
  // (menu "CỔNG XUẤT & GATE-OUT") đang dùng: container phải ở trạng thái
  // READY_FOR_OUT, backend chỉ nhận truckPlate/driverName/trailerPlate/sealNo.
  const validateGateOutFields = () => {
    const nextErrors: Partial<Record<'selectedContainerNo' | 'licensePlate' | 'driverName', string>> = {};
    if (!gateOutData.selectedContainerNo.trim()) nextErrors.selectedContainerNo = 'Thiếu container cần cấp vỏ.';
    if (!gateOutData.licensePlate.trim()) nextErrors.licensePlate = 'Thiếu biển số xe đầu kéo.';
    if (!gateOutData.driverName.trim()) nextErrors.driverName = 'Thiếu họ tên tài xế nhận vỏ.';
    setGateOutFieldErrors(nextErrors);
    return nextErrors;
  };

  const handleGateOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateOutError(null);

    const nextErrors = validateGateOutFields();
    if (Object.keys(nextErrors).length > 0) {
      const detailMessage = `Thiếu thông tin bắt buộc: ${Object.values(nextErrors).join(' ')}`;
      setGateOutError(detailMessage);
      showToast(detailMessage, 'error', 'Gate-Out thiếu dữ liệu');
      return;
    }

    setIsSubmittingGateOut(true);
    try {
      const jobResponse: any = await containerApi.getById(gateOutData.selectedContainerNo);
      if (jobResponse?.statusCode !== 200 || !jobResponse.data?.id) {
        throw new Error(jobResponse?.message || `Không tìm thấy hồ sơ container ${gateOutData.selectedContainerNo} trong hệ thống.`);
      }
      const job = jobResponse.data;

      const gateOutResponse: any = await containerApi.gateOut(job.id, {
        truckPlate: gateOutData.licensePlate,
        driverName: gateOutData.driverName,
        trailerPlate: gateOutData.trailerPlate || undefined,
        sealNo: gateOutData.newSealNo || undefined
      });

      if (gateOutResponse?.statusCode !== 200) {
        throw new Error(gateOutResponse?.data || gateOutResponse?.message || 'Backend không thể Gate-Out container.');
      }

      // Đọc lại job để lấy đúng gateOutEirNo/status đã persist thật trong Postgres,
      // thay vì tự sinh số phiếu giả ở client.
      const refreshed: any = await containerApi.getById(gateOutData.selectedContainerNo).catch(() => null);
      const persistedJob = refreshed?.data || job;

      const newEir = {
        id: persistedJob.id,
        jobNo: persistedJob.jobNo,
        eirNo: persistedJob.gateOutEirNo || `EIR-OUT-${persistedJob.jobNo}`,
        type: 'GATE_OUT (CẤP VỎ)',
        containerNo: persistedJob.containerNo || gateOutData.selectedContainerNo,
        isoCode: persistedJob.isoSize || '45G1',
        size: gateOutData.size,
        shippingLine: persistedJob.shippingLineCode || gateOutData.shippingLine,
        licensePlate: gateOutData.licensePlate,
        trailerPlate: gateOutData.trailerPlate,
        driverName: gateOutData.driverName,
        driverPhone: gateOutData.driverPhone,
        truckingCompany: gateOutData.truckingCompany,
        sealNo: gateOutData.newSealNo,
        bookingNo: gateOutData.bookingNo,
        releaseOrderNo: gateOutData.releaseOrderNo,
        destinationPort: gateOutData.destinationPort,
        yardLocation: persistedJob.blockCode || 'BLOCK_A',
        createdAt: new Date().toLocaleString('vi-VN'),
        status: 'ĐÃ CẤP VỎ XUẤT CỔNG'
      };

      const newLaneRecord: GateLaneRecord = {
        id: `G-${Date.now().toString().slice(-3)}`,
        lane: 'LÀN 03 (CỔNG XUẤT)',
        type: 'GATE_OUT',
        containerNo: newEir.containerNo,
        shippingLine: newEir.shippingLine,
        size: gateOutData.size,
        licensePlate: gateOutData.licensePlate,
        driverName: gateOutData.driverName,
        driverPhone: gateOutData.driverPhone,
        truckingName: gateOutData.truckingCompany,
        arrivalTime: 'Vừa xong',
        status: 'COMPLETED',
        eirNo: newEir.eirNo,
        yardBlock: newEir.yardLocation,
        condition: 'EMPTY'
      };

      setGateLanes((prev) => [newLaneRecord, ...prev]);
      setCreatedEir(newEir);
      setGateOutData(EMPTY_GATE_OUT_FORM);
      showToast(`Đã cấp vỏ container ${newEir.containerNo} và sinh ${newEir.eirNo}.`, 'success', 'Gate-Out thành công');
      setIsSuccessModalOpen(true);
    } catch (error) {
      const backendError = error as any;
      const message =
        backendError?.response?.data?.data ||
        backendError?.response?.data?.message ||
        backendError?.message ||
        'Không thể kết nối Backend.';
      setGateOutError(message);
      showToast(message, 'error', 'Gate-Out thất bại');
    } finally {
      setIsSubmittingGateOut(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP HERO BANNER & REAL-TIME KPI STRIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow backdrop decorative spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-cyan-950/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 p-0.5 flex items-center justify-center shadow-sm border border-emerald-500/30 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black">
                <LogIn className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-mono font-extrabold text-emerald-300 uppercase tracking-wider bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  DEPOT GATE SYSTEM • BƯỚC 1 TIẾP NHẬN
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  3 Làn Hoạt Động
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white mt-1 tracking-tight">
                Cổng Tiếp Nhận Hạ Vỏ Rỗng (Gate-In)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                Tự động kiểm tra container, định tuyến bệ giám định IICL-6 và cấp phiếu điện tử e-EIR tức thì.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onNavigateTab('survey')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
            >
              <Boxes className="w-4 h-4" />
              <span>Chuyển Sang Giám Định Vỏ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('operation')}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Khai Thác Gate-In</span>
            </button>
            <button
              onClick={() => onNavigateTab('yard_map')}
              className="hidden sm:flex px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Sơ Đồ Bãi 2D</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Hạ Vỏ Hôm Nay</div>
                <div className="text-sm sm:text-base font-mono font-black text-white">
                  {gateLanes.filter((lane) => lane.type === 'GATE_IN').length} Cont{' '}
                  <span className="text-[10px] text-emerald-400 font-sans font-bold">Live</span>
                </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Xe Tại Làn Cổng</div>
              <div className="text-sm sm:text-base font-mono font-black text-white">
                {gateLanes.length} Xe <span className="text-[10px] text-sky-600 font-sans">Đang phục vụ</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Xử Lý Trung Bình</div>
              <div className="text-sm sm:text-base font-mono font-black text-white">
                {gateLanes.length > 0 ? '3.5 Phút' : '--'}{' '}
                <span className="text-[10px] text-amber-400 font-sans font-bold">
                  {gateLanes.length > 0 ? 'Live' : 'Chưa có dữ liệu'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Loại Hình Tiếp Nhận</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 truncate">100% Vỏ Rỗng (Empty)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-800 touch-pan-x overscroll-x-contain scrollbar-thin select-none">
        <button
          onClick={() => setActiveSubTab('gate_in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'gate_in'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-950 border border-slate-800 shadow-sm'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>1. Tiếp Nhận Hạ Vỏ Rỗng (Gate-In)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gate_out')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'gate_out'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-950 border border-slate-800 shadow-sm'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>2. Cấp Vỏ & Xuất Cổng (Gate-Out)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('live_queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'live_queue'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-950 border border-slate-800 shadow-sm'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Hàng Đợi & Làn Cổng</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
            {gateLanes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('eir_list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'eir_list'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-950 border border-slate-800 shadow-sm'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>4. Lịch Sử e-EIR</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tariffs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
            activeSubTab === 'tariffs'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-300/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-950 border border-slate-800 shadow-sm'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>5. Biểu Phí Dịch Vụ Cổng</span>
        </button>
      </div>

      {/* TAB 1: GATE-IN FORM (TIẾP NHẬN HẠ VỎ RỖNG CHUYÊN SÂU) */}



      {activeSubTab === 'gate_in' && (
        <form onSubmit={(e) => handleGateInSubmit(e, true)} className="space-y-4 sm:space-y-6">
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

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateOCR}
                      disabled={isScanningOCR}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Mô phỏng quét camera AI OCR nhận diện số container tự động"
                    >
                      <Camera className={`w-3.5 h-3.5 ${isScanningOCR ? 'animate-spin' : ''}`} />
                      <span>{isScanningOCR ? 'Đang Quét OCR...' : 'Quét Camera OCR'}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          condition: 'EMPTY',
                          containerNo: 'MSCU' + Math.floor(1000000 + Math.random() * 9000000),
                          sealNo: 'ML-SEAL-' + Math.floor(100000 + Math.random() * 900000)
                        }));
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition cursor-pointer shadow-sm"
                      title="Sinh số ngẫu nhiên mới"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
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
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        ✓ Check Digit Valid
                      </span>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {containerTypeOptions.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              size: item.code,
                              type: item.name,
                              isoCode: item.iso
                            });
                          }}
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
                      {TRUCKING_CUSTOMERS.map((cust) => (
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
                  <span>{isSubmittingGateIn ? 'ĐANG GHI SQL SERVER...' : 'XÁC NHẬN TIẾP NHẬN & CHUYỂN GIÁM ĐỊNH'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </form>
      )}

      {/* TAB 2: GATE-OUT (CẤP VỎ / XUẤT CỔNG) */}
      {activeSubTab === 'gate_out' && (
        <form onSubmit={handleGateOutSubmit} className="space-y-6">
          {gateOutError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-800 bg-rose-950/60 px-4 py-3 text-xs text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <span>{gateOutError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
                <LogOut className="w-4 h-4" />
                <span>1. Lệnh Cấp Vỏ (Release Order)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số Lệnh Cấp Vỏ (RO No.)*
                  </label>
                  <input
                    type="text"
                    required
                    value={gateOutData.releaseOrderNo}
                    onChange={(e) => setGateOutData({ ...gateOutData, releaseOrderNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số Booking Xuất Khẩu*
                  </label>
                  <input
                    type="text"
                    required
                    value={gateOutData.bookingNo}
                    onChange={(e) => setGateOutData({ ...gateOutData, bookingNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hãng Tàu Cấp Vỏ
                  </label>
                  <select
                    value={gateOutData.shippingLine}
                    onChange={(e) => setGateOutData({ ...gateOutData, shippingLine: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-xs text-white rounded-xl font-bold"
                  >
                    <option value="MSK">MAERSK LINE (Đủ điều kiện cấp)</option>
                    <option value="CMA">CMA CGM</option>
                    <option value="ONE">OCEAN NETWORK EXPRESS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
                <Boxes className="w-4 h-4" />
                <span>2. Chọn Container Chuẩn AV (Available)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Container Đã QC Pass Tại Bãi
                  </label>
                  <select
                    value={gateOutData.selectedContainerNo}
                    onChange={(e) => {
                      setGateOutData({ ...gateOutData, selectedContainerNo: e.target.value });
                      if (gateOutFieldErrors.selectedContainerNo) setGateOutFieldErrors((prev) => ({ ...prev, selectedContainerNo: undefined }));
                    }}
                    className={`w-full px-3 py-2.5 bg-slate-950 text-xs font-mono font-bold text-emerald-400 rounded-xl border ${gateOutFieldErrors.selectedContainerNo ? 'border-rose-500' : 'border-slate-700'}`}
                    required
                  >
                    <option value="">-- Chọn container khả dụng --</option>
                    {availableGateOutContainers.map((container) => (
                      <option key={container.id} value={container.containerNo}>
                        {container.containerNo} - {container.size} ({container.shippingLine})
                      </option>
                    ))}
                  </select>
                  {gateOutFieldErrors.selectedContainerNo && (
                    <p className="mt-1.5 text-[11px] font-semibold text-rose-400">{gateOutFieldErrors.selectedContainerNo}</p>
                  )}
                  {availableGateOutContainers.length === 0 && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Chưa có container nào đủ điều kiện Gate-Out (cần trạng thái READY_FOR_OUT — đã QC đạt).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số Niêm Phong Mới Cấp (New Seal)
                  </label>
                  <input
                    type="text"
                    value={gateOutData.newSealNo}
                    onChange={(e) => setGateOutData({ ...gateOutData, newSealNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cảng Giao Hàng Dự Kiến
                  </label>
                  <input
                    type="text"
                    value={gateOutData.destinationPort}
                    onChange={(e) => setGateOutData({ ...gateOutData, destinationPort: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-xs text-white rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Truck className="w-4 h-4" />
                  <span>3. Phương Tiện Nhận Vỏ</span>
                </h3>

                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Biển Số Xe Đầu Kéo*
                    </label>
                    <input
                      type="text"
                      required
                      value={gateOutData.licensePlate}
                      onChange={(e) => {
                        setGateOutData({ ...gateOutData, licensePlate: e.target.value.toUpperCase() });
                        if (gateOutFieldErrors.licensePlate) setGateOutFieldErrors((prev) => ({ ...prev, licensePlate: undefined }));
                      }}
                      className={`w-full px-3 py-2 bg-slate-950 text-xs font-mono font-bold text-white rounded-xl border ${gateOutFieldErrors.licensePlate ? 'border-rose-500' : 'border-slate-700'}`}
                    />
                    {gateOutFieldErrors.licensePlate && (
                      <p className="mt-1.5 text-[11px] font-semibold text-rose-400">{gateOutFieldErrors.licensePlate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Họ Tên & SĐT Tài Xế
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={gateOutData.driverName}
                        onChange={(e) => {
                          setGateOutData({ ...gateOutData, driverName: e.target.value });
                          if (gateOutFieldErrors.driverName) setGateOutFieldErrors((prev) => ({ ...prev, driverName: undefined }));
                        }}
                        className={`px-3 py-2 bg-slate-950 text-xs text-white rounded-xl border ${gateOutFieldErrors.driverName ? 'border-rose-500' : 'border-slate-700'}`}
                      />
                      <input
                        type="text"
                        value={gateOutData.driverPhone}
                        onChange={(e) => setGateOutData({ ...gateOutData, driverPhone: e.target.value })}
                        className="px-3 py-2 bg-slate-950 border border-slate-700 text-xs font-mono text-white rounded-xl"
                      />
                    </div>
                    {gateOutFieldErrors.driverName && (
                      <p className="mt-1.5 text-[11px] font-semibold text-rose-400">{gateOutFieldErrors.driverName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingGateOut}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:cursor-wait disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isSubmittingGateOut ? 'ĐANG GHI SQL SERVER...' : 'Cấp Vỏ & Xuất Lệnh Gate-Out'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: LIVE QUEUE (LÀN CỔNG & HÀNG ĐỢI) */}
      {activeSubTab === 'live_queue' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Giám Sát Làn Cổng & Hàng Đợi Check-In (Live Gate Queue)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Theo dõi xe check-in tiếp nhận vỏ, phân luồng bệ giám định và điều phối xe nâng bãi.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
                3 Làn Đang Mở
              </span>
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg">
                TB: 3.2 Phút / Xe
              </span>
            </div>
          </div>

          <div className="overflow-x-auto touch-pan-x overscroll-x-contain pb-2 scrollbar-thin">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">LÀN CỔNG</th>
                  <th className="p-3">LOẠI NGHIỆP VỤ</th>
                  <th className="p-3">SỐ CONTAINER</th>
                  <th className="p-3">HÃNG TÀU / SIZE</th>
                  <th className="p-3">BIỂN SỐ / TÀI XẾ</th>
                  <th className="p-3">VỊ TRÍ YARD / BỆ GĐ</th>
                  <th className="p-3">TRẠNG THÁI</th>
                  <th className="p-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {gateLanes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      {item.lane}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type === 'GATE_IN'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {item.type === 'GATE_IN' ? 'TIẾP NHẬN HẠ VỎ' : 'CẤP VỎ (GATE-OUT)'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-sky-400">{item.containerNo}</td>
                    <td className="p-3">
                      <span className="font-bold text-white">{item.shippingLine}</span> • {item.size}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-white">{item.licensePlate}</div>
                      <div className="text-[11px] text-slate-400">{item.driverName}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-teal-400">{item.yardBlock}</div>
                      {item.surveyBay && (
                        <div className="text-[10px] text-purple-300">{item.surveyBay}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'WAITING_FORKLIFT'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {item.status === 'COMPLETED'
                          ? 'Đã Hạ Bãi Xong'
                          : item.status === 'WAITING_FORKLIFT'
                          ? 'Chờ Xe Nâng & Giám Định'
                          : 'Đang Tiếp Nhận'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.type === 'GATE_IN' && (
                          <button
                            onClick={() => onNavigateTab('survey')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1 cursor-pointer"
                            title="Chuyển sang phân hệ giám định container này"
                          >
                            <Boxes className="w-3 h-3" />
                            <span>Giám Định</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedEirModal(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition cursor-pointer"
                        >
                          Xem e-EIR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {gateLanes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-400">
              Chưa có xe nào trong hàng đợi. Dữ liệu phát sinh từ Gate-In/Gate-Out sẽ hiển thị tại đây.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EIR LIST */}
      {activeSubTab === 'eir_list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Danh Sách Chứng Từ Tiếp Nhận Điện Tử (Electronic EIR)</span>
              </h3>
              <p className="text-xs text-slate-400">Tra cứu và in lại phiếu EIR phát hành tại cổng tiếp nhận Depot.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gateLanes.map((eir) => (
              <div
                key={eir.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400">{eir.eirNo}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                    Tiếp Nhận Hợp Lệ
                  </span>
                </div>
                <div>
                  <div className="text-sm font-mono font-black text-white">{eir.containerNo}</div>
                  <div className="text-xs text-slate-400">
                    {eir.shippingLine} • {eir.size} • Xe: {eir.licensePlate}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Vị trí: {eir.yardBlock}</span>
                  <button
                    onClick={() => setSelectedEirModal(eir)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Chi Tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
          {gateLanes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-400">
              Chưa phát hành e-EIR nào. Khi tiếp nhận hoặc cấp vỏ, chứng từ sẽ xuất hiện ở đây.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TARIFFS REFERENCE */}
      {activeSubTab === 'tariffs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Quy Định & Biểu Phí Tham Khảo (Depot Tariffs Reference)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Lưu ý: Biểu phí được tính và thu tập trung tại bước Giám định & Khai thác dịch vụ sau khi kiểm tra vỏ cont.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('operation')}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>Đến Khai Thác Gate-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-400 uppercase">1. Biểu Cước Nâng Hạ Tiêu Chuẩn (Lift-on / Lift-off)</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Hạ bãi vỏ rỗng 20ft (Lift-off 20DC)</span>
                  <span className="font-mono font-bold text-white">260.000 đ</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Hạ bãi vỏ rỗng 40ft/45ft (Lift-off 40HC)</span>
                  <span className="font-mono font-bold text-white">385.000 đ</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Nâng cấp vỏ rỗng 20ft (Lift-on 20DC)</span>
                  <span className="font-mono font-bold text-white">260.000 đ</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Nâng cấp vỏ rỗng 40ft/45ft (Lift-on 40HC)</span>
                  <span className="font-mono font-bold text-white">385.000 đ</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase">2. Phí Lưu Bãi & Dịch Vụ Phụ (Storage & Surcharges)</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Lưu bãi miễn phí (Free-days)</span>
                  <span className="font-mono font-bold text-emerald-400">07 Ngày Đầu</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Lưu bãi cont 20ft (từ ngày thứ 8)</span>
                  <span className="font-mono font-bold text-white">35.000 đ / ngày</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">Lưu bãi cont 40ft (từ ngày thứ 8)</span>
                  <span className="font-mono font-bold text-white">65.000 đ / ngày</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Phí cắm điện chạy lạnh PTI</span>
                  <span className="font-mono font-bold text-white">180.000 đ / block 8h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL / EIR PREVIEW */}
      {isSuccessModalOpen && createdEir && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">TIẾP NHẬN CONTAINER THÀNH CÔNG!</h3>
              <p className="text-xs text-slate-400">
                Mã chứng từ e-EIR: <span className="font-mono font-bold text-emerald-400">{createdEir.eirNo}</span>
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Số Container:</span>
                <span className="font-mono font-bold text-sky-400">{createdEir.containerNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Hãng Tàu & Kích Thước:</span>
                <span className="font-bold text-white">{createdEir.shippingLine} ({createdEir.size})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Phương Tiện / Bác Tài:</span>
                <span className="font-mono text-white">{createdEir.licensePlate} • {createdEir.driverName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Mục Đích:</span>
                <span className="font-bold text-emerald-400">{createdEir.condition}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Bệ Giám Định Chỉ Định:</span>
                <span className="font-bold text-purple-300">{createdEir.surveyBay}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Vị Trí Dự Kiến Bãi:</span>
                <span className="font-mono font-bold text-teal-400">{createdEir.yardLocation}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full sm:flex-1 py-3 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onNavigateTab('survey');
                }}
                className="w-full sm:flex-1 py-3 sm:py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Chuyển Sang Giám Định</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL EIR MODAL */}
      {selectedEirModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Chi Tiết Phiếu Tiếp Nhận e-EIR</span>
              </h3>
              <button
                onClick={() => setSelectedEirModal(null)}
                className="text-slate-400 hover:text-white text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Số Phiếu EIR:</span>
                <span className="font-mono font-bold text-sky-400">{selectedEirModal.eirNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số Container:</span>
                <span className="font-mono font-bold text-white">{selectedEirModal.containerNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hãng Tàu:</span>
                <span className="font-bold text-white">{selectedEirModal.shippingLine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kích Thước:</span>
                <span className="font-mono text-white">{selectedEirModal.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phương Tiện / Bác Tài:</span>
                <span className="font-mono text-white">
                  {selectedEirModal.licensePlate} ({selectedEirModal.driverName || 'N/A'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời Gian Check-In:</span>
                <span className="text-slate-300">{selectedEirModal.arrivalTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vị Trí Hạ Bãi:</span>
                <span className="font-mono text-teal-400 font-bold">{selectedEirModal.yardBlock}</span>
              </div>
              {selectedEirModal.surveyBay && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bệ Giám Định:</span>
                  <span className="text-purple-300 font-bold">{selectedEirModal.surveyBay}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setSelectedEirModal(null)}
                className="w-full sm:flex-1 py-3 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSelectedEirModal(null);
                }}
                className="w-full sm:flex-1 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> In Phiếu EIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
