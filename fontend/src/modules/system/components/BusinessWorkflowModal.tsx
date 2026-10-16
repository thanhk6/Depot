import React, { useEffect, useState } from 'react';
import { workflowApi, type WorkflowStepDto } from '../../../api';
import {
  GitBranch,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Sparkles,
  ClipboardCheck,
  Receipt,
  QrCode,
  Truck,
  Grid3X3,
  Calculator,
  CheckSquare,
  Wrench,
  Droplets,
  Warehouse,
  ShieldCheck,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Send,
  Database,
  X,
  ChevronRight,
  Info,
  Clock,
  Check,
  RefreshCw,
  Building2,
  Container,
  Flame,
  FileCode,
  Hammer,
  Radio
} from 'lucide-react';

interface BusinessWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string) => void;
}

interface WorkflowStepViewModel extends WorkflowStepDto {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  borderColor: string;
}

export const BusinessWorkflowModal: React.FC<BusinessWorkflowModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<string>('GATE_IN');
  const [selectedTab, setSelectedTab] = useState<'FLOW' | 'MODULES' | 'MASTER_DATA'>('FLOW');
  const [backendSteps, setBackendSteps] = useState<WorkflowStepDto[]>([]);

  useEffect(() => {
    workflowApi.getDefinition()
      .then((response: any) => {
        if (response?.statusCode === 200 && Array.isArray(response.data)) {
          setBackendSteps(response.data);
        }
      })
      .catch((error) => console.warn('Không thể tải workflow definition từ Backend:', error));
  }, []);

  if (!isOpen) return null;

  const workflowSteps: WorkflowStepViewModel[] = [
    {
      id: 'GATE_IN',
      number: '01',
      title: 'GATE-IN (Tiếp Nhận Container)',
      moduleTarget: 'gate',
      icon: LogIn,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      summary: 'Tiếp nhận xe đầu kéo, ghi nhận số cont, số xe, tài xế, hãng tàu, phát sinh Service Ticket theo Tariff.',
      details: [
        'Nhận diện số cont theo chuẩn ISO 6346 (Check digit tự động).',
        'Khởi tạo phiếu tiếp nhận và kiểm tra quyền hạn hãng tàu.',
        'Lập Service Ticket / Service Invoice thu phí nâng hạ, lưu bãi, cắm điện lạnh theo biểu cước Tariff.'
      ],
      nextSteps: ['SURVEY']
    },
    {
      id: 'SURVEY',
      number: '02',
      title: 'SURVEY – GIÁM ĐỊNH TÌNH TRẠNG VỎ',
      moduleTarget: 'survey',
      icon: ClipboardCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      summary: 'Surveyor kiểm tra container theo Inspection Standard (IICL-6 / MCIC / MRIC) và ghi nhận hư hỏng.',
      details: [
        'Kiểm tra theo Checklist 10 điểm: Mái (Roof), Vách (Walls), Cửa (Door), Sàn (Floor), Khung gầm, Góc đúc...',
        'Ghi nhận Damage Location + Damage Code + Repair Code + Tối thiểu 02 hình ảnh (toàn cảnh + chi tiết).',
        'Xuất chứng từ điện tử giao nhận e-EIR kèm chữ ký số.'
      ],
      nextSteps: ['GRADING']
    },
    {
      id: 'GRADING',
      number: '03',
      title: 'GRADING – PHÂN LOẠI 3 TRẠNG THÁI CHÍNH',
      moduleTarget: 'survey',
      icon: Layers,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      borderColor: 'border-sky-200',
      summary: 'Phân loại tình trạng thành AV (Sẵn sàng), CL (Cần vệ sinh) hoặc DM (Cần sửa chữa).',
      details: [
        'AV (Available): Container đạt chuẩn, sạch sẽ, không hư hỏng, sẵn sàng cấp trả ngay.',
        'CL (Cleaning Required): Kết cấu nguyên vẹn nhưng sàn/vách dơ bẩn, dính dầu mỡ, rác, mùi hôi → Chuyển khu Cleaning Bay.',
        'DM (Damaged / Pending Repair): Bị cong vênh, thủng, rách, hỏng thiết bị lạnh → Chuyển khu EMR Damaged Area để lập Estimate.'
      ],
      nextSteps: ['CLEANING', 'ESTIMATE', 'YARD_AV']
    },
    {
      id: 'PAYMENT',
      number: '04',
      title: 'INSTANT PAYMENT – THANH TOÁN TỨC THỜI',
      moduleTarget: 'payment',
      icon: QrCode,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      summary: 'Khách hàng quét mã VietQR động, Webhook API tự động gạch nợ và kích hoạt lệnh điều xe nâng.',
      details: [
        'Tạo mã QR động VietQR chứa đúng số tiền và cú pháp mã phiếu thu.',
        'Ngân hàng đẩy thông báo Webhook API tức thì (< 2 giây).',
        'Hệ thống tự động Auto-Reconciliation và chuyển trạng thái PAID để cấp lệnh cho xe nâng.'
      ],
      nextSteps: ['FORKLIFT_DISPATCH']
    },
    {
      id: 'FORKLIFT_DISPATCH',
      number: '05',
      title: 'FORKLIFT DISPATCH – ĐIỀU PHỐI XE NÂNG',
      moduleTarget: 'forklift',
      icon: Truck,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      borderColor: 'border-orange-200',
      summary: 'Điều phối lệnh nâng hạ container tự động đến Tablet buồng lái xe nâng với chu trình 6 bước.',
      details: [
        'Chu trình trạng thái: WAITING → ASSIGNED → ACCEPTED → MOVING → DROPPED → COMPLETED.',
        'Chỉ định xe nâng gần nhất và tối ưu hóa quãng đường di chuyển.',
        'Cập nhật tọa độ vị trí bãi (Block - Bay - Row - Tier) thời gian thực.'
      ],
      nextSteps: ['YARD_MANAGEMENT']
    },
    {
      id: 'CLEANING',
      number: '06',
      title: 'CLEANING – VỆ SINH THEO DANH MỤC GIÁM ĐỊNH',
      moduleTarget: 'cleaning',
      icon: Droplets,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      summary: 'Nhân viên vệ sinh đi vệ sinh theo danh mục giám định quy định trên e-EIR xong chuyển qua khai thác (AV).',
      details: [
        'Nhân viên tiếp nhận container tại Cleaning Bay và mở danh mục dịch vụ do Surveyor chỉ định.',
        'Thi công và tick chọn hoàn thành: Quét dọn, xịt nước 200 Bar, tẩy hóa chất kiềm, xông nhiệt khử mùi, sấy sàn gỗ.',
        'Đóng dấu ảnh trước/sau vệ sinh, nghiệm thu phân hạng Grade A / Food Grade và chuyển ngay qua Khai Thác (AV sẵn sàng cấp trả).'
      ],
      nextSteps: ['YARD_AV', 'GATE_OUT']
    },
    {
      id: 'ESTIMATE',
      number: '07',
      title: 'ESTIMATE – LẬP BÁO GIÁ SỬA CHỮA EMR',
      moduleTarget: 'estimate',
      icon: Calculator,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      summary: 'Tính toán chi phí sửa chữa theo Labour Rate, số giờ công IICL, vật tư và chi phí phát sinh.',
      details: [
        'Tự động kết xuất chi phí = (Labour Rate × Hours) + Vật Tư (Material) + Vệ Sinh + Sơn.',
        'Phân loại bên chịu trách nhiệm (O - Hãng tàu, U - Khách hàng, T - Nhà xe, I - Bảo hiểm).',
        'Tạo bản nháp báo giá EMR (DRAFT) sẵn sàng gửi hãng tàu.'
      ],
      nextSteps: ['APPROVAL']
    },
    {
      id: 'APPROVAL',
      number: '08',
      title: 'APPROVAL GATEWAY – PHÊ DUYỆT BÁO GIÁ',
      moduleTarget: 'approval',
      icon: CheckSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      summary: 'Cổng gửi nhận phê duyệt với Hãng tàu / Khách hàng: DRAFT → SUBMITTED → PENDING → APPROVED.',
      details: [
        'Gửi thông báo điện tử qua EDI WESTIM / Email / Portal cho đại diện hãng tàu.',
        'Ghi nhận phản hồi: Duyệt toàn phần (APPROVED), Duyệt giảm trừ (REVISED), hoặc Từ chối (REJECTED).',
        'Khi được Approved → Tự động tạo Lệnh sửa chữa Work Order.'
      ],
      nextSteps: ['REPAIR']
    },
    {
      id: 'REPAIR',
      number: '09',
      title: 'REPAIR – SỬA CHỮA & XUẤT KHO VẬT TƯ',
      moduleTarget: 'repair',
      icon: Wrench,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      borderColor: 'border-rose-200',
      summary: 'Phân công kỹ thuật viên thực hiện hàn vách, thay ván sàn, nắn góc đúc, sửa máy lạnh và trừ kho phụ tùng.',
      details: [
        'Tạo Work Order giao việc cho tổ thợ cơ khí / điện lạnh.',
        'Tự động xuất kho vật tư phụ tùng (Material Request) và giảm trừ tồn kho Warehouse.',
        'Cập nhật tiến độ sửa chữa theo thời gian thực.'
      ],
      nextSteps: ['QC']
    },
    {
      id: 'QC',
      number: '10',
      title: 'QC – KIỂM TRA CHẤT LƯỢNG NGHIỆM THU',
      moduleTarget: 'qc',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      summary: 'Kiểm tra chất lượng sau Sửa chữa / Vệ sinh theo QC Checklist: PASS → chuyển về AV; FAIL → Xử lý lại.',
      details: [
        'Kiểm tra độ kín sáng, kiểm tra đường hàn, kiểm tra độ ẩm sàn gỗ, test độ lạnh máy Reefer.',
        'Nếu PASS: Tự động đổi trạng thái Container từ DM / CL thành AV (Available - Sẵn sàng cấp trả).',
        'Nếu FAIL: Chụp ảnh khuyết tật, yêu cầu thợ chụp lại ảnh khi sửa xong & nghiệm thu lại.'
      ],
      nextSteps: ['SHIPPING_API', 'YARD_MANAGEMENT']
    },
    {
      id: 'SHIPPING_API',
      number: '10',
      title: 'API GATEWAY – TRUYỀN DỮ LIỆU HÃNG TÀU',
      moduleTarget: 'shipping_api',
      icon: Radio,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      borderColor: 'border-sky-200',
      summary: 'Gửi dữ liệu nghiệm thu qua REST API / Webhook tới Maersk, ONE, CMA CGM... và nhận kết quả phản hồi tự động.',
      details: [
        'Đóng gói JSON Payload chuẩn M&R quốc tế: Container No, ISO Code, Grade A, Work Order No, kèm ảnh trước/sau và chữ ký giám định viên.',
        'Gọi POST API trực tiếp đến máy chủ Hãng Tàu với mã hóa Token/OAuth2/TLS 1.3.',
        'Nhận phản hồi HTTP 200 OK kèm mã xác thực ACK Reference No và Token mở khóa cấp vỏ ra cảng (Gate-out Release).'
      ],
      nextSteps: ['GATE_OUT', 'YARD_MANAGEMENT']
    },
    {
      id: 'GATE_OUT',
      number: '11',
      title: 'GATE-OUT – CẤP VỎ CONTAINER KHI XE ĐẾN LẤY',
      moduleTarget: 'gate_out',
      icon: LogOut,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      summary: 'Danh sách các container đã báo hãng tàu sửa chữa thành công; chỉ khi có xe đến lấy mới thực hiện cấp vỏ & xuất bãi.',
      details: [
        'Lọc danh sách các container đạt chuẩn AV đã nhận mã xác thực ACK & Release Token từ Hãng Tàu.',
        'Tiếp nhận xe đầu kéo đến xuất trình lệnh Booking / Delivery Order của chủ hàng.',
        'Khớp thông tin xe: Biển số đầu kéo, rơ-moóc, tài xế, cấp chì niêm phong (Lead Seal) và phát lệnh xe nâng gắp cont.',
        'In phiếu e-EIR Xuất Bãi (Equipment Interchange Receipt Out) có mã QR tra cứu song ngữ Anh - Việt.'
      ],
      nextSteps: ['YARD_MANAGEMENT', 'BILLING']
    },
    {
      id: 'YARD_MANAGEMENT',
      number: '12',
      title: 'YARD MANAGEMENT – QUẢN LÝ VỊ TRÍ BÃI',
      moduleTarget: 'yard_map',
      icon: Grid3X3,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      borderColor: 'border-teal-200',
      summary: 'Sắp xếp phân khu Block → Bay → Row → Tier; trực quan hóa 2D/3D sơ đồ bãi.',
      details: [
        'Phân khu bãi chuyên biệt: Khu AV Area (Hàng xuất), Khu Cleaning Bay (Bệ rửa), Khu EMR Damaged Area.',
        'Quản lý sức chứa, tầng chất xếp an toàn (Stacking Tier) và lịch sử di chuyển vỏ container.'
      ],
      nextSteps: ['BILLING']
    },
    {
      id: 'BILLING',
      number: '13',
      title: 'CARRIER BILLING – CÔNG NỢ HÃNG TÀU',
      moduleTarget: 'billing',
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      summary: 'Tổng hợp chi phí EMR, nâng hạ, lưu bãi thành hóa đơn định kỳ gửi Hãng tàu đối soát.',
      details: [
        'Tổng hợp toàn bộ Work Order sửa chữa đã hoàn thành theo từng Shipping Line.',
        'Theo dõi Aging Debt (30 - 60 - 90 ngày), kỳ hạn thanh toán và xuất file đối soát hóa đơn.'
      ],
      nextSteps: ['INTEGRATION']
    },
    {
      id: 'INTEGRATION',
      number: '14',
      title: 'INTEGRATION – ĐỒNG BỘ EDI / API / WEBHOOK',
      moduleTarget: 'system',
      icon: Send,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      borderColor: 'border-pink-200',
      summary: 'Truyền nhận dữ liệu thời gian thực với Hãng Tàu, Cảng biển và Hệ thống Ngân Hàng.',
      details: [
        'Chuẩn EDI Hàng hải: CODECO (Gate Move), COARRI (Bốc dỡ), WESTIM (Báo giá EMR).',
        'RESTful API & Webhook: Tích hợp VietQR, Hải quan điện tử và ứng dụng Mobile cho tài xế xe nâng.'
      ],
      nextSteps: []
    }
  ];

  // UI owns icons/colors; backend owns workflow business metadata.
  const resolvedWorkflowSteps: WorkflowStepViewModel[] = workflowSteps.map((step) => {
    const backendStep = backendSteps.find((item) => item.id === step.id) as Partial<WorkflowStepViewModel> | undefined;
    return backendStep ? { ...step, ...backendStep } as WorkflowStepViewModel : step;
  });

  const currentStep: WorkflowStepViewModel = resolvedWorkflowSteps.find((s) => s.id === activeWorkflowStep) || resolvedWorkflowSteps[0];

  const masterDataList = [
    { code: '01', name: 'Shipping Line', desc: 'Danh mục Hãng tàu (Maersk, MSC, CMA CGM, ONE, Cosco...)', tab: 'shipping_lines' },
    { code: '02', name: 'Owner', desc: 'Chủ sở hữu Container & Hãng tàu liên quan', tab: 'shipping_lines' },
    { code: '03', name: 'Container Type', desc: 'Loại container: Dry, Reefer, Open Top, Flat Rack, Tank', tab: 'master_types' },
    { code: '04', name: 'Container Size', desc: 'Kích thước: 20FT, 40FT, 45FT, High Cube (HC)', tab: 'master_types' },
    { code: '05', name: 'Inspection Standard', desc: 'Tiêu chuẩn giám định: IICL-6, MCIC, MRIC, Carrier Standard', tab: 'master_standards' },
    { code: '06', name: 'Inspection Checklist', desc: '10 Hạng mục điểm kiểm tra: Mái, Vách, Sàn, Cửa, Góc đúc...', tab: 'master_standards' },
    { code: '07', name: 'Damage Location', desc: '18 Vị trí cấu kiện container tiêu chuẩn quốc tế', tab: 'master_locations' },
    { code: '08', name: 'Damage Code', desc: 'Mã hư hỏng chuẩn IICL (Móp méo, Thủng rách, Gỉ sét...)', tab: 'master_damages' },
    { code: '09', name: 'Repair Code / STS', desc: 'Mã công việc sửa chữa, đơn giá nhân công & số giờ công', tab: 'master_repairs' },
    { code: '10', name: 'Grading (AV/CL/DM)', desc: '3 Trạng thái chính: AV (Đạt chuẩn), CL (Cần rửa), DM (Hỏng)', tab: 'master_grades' },
    { code: '11', name: 'Grade Cấp Chất Lượng', desc: 'Phân cấp vỏ: Grade A, Food Grade, Scrap Grade...', tab: 'master_grades' },
    { code: '12', name: 'Cleaning Tariff & Type', desc: '10 Phương pháp làm sạch & Biểu cước xịt rửa, khử mùi Ozone', tab: 'master_cleaning' },
    { code: '13', name: 'Yard Area', desc: 'Phân khu chức năng: AV Area, Cleaning Bay, EMR Area', tab: 'yard_manage' },
    { code: '14', name: 'Yard Location', desc: 'Tọa độ lưu kho bãi: Block → Bay → Row → Tier', tab: 'yard_manage' },
    { code: '15', name: 'Service Type', desc: 'Loại dịch vụ: Nâng hạ, Lưu bãi, Cắm điện, Vệ sinh, Sửa chữa', tab: 'operation' },
    { code: '16', name: 'Tariff Biểu Cước', desc: 'Bảng giá dịch vụ theo hãng tàu, kích cỡ và khách hàng', tab: 'operation' },
    { code: '17', name: 'Payment Method', desc: 'Phương thức thanh toán: VietQR, Chuyển khoản, Tiền mặt', tab: 'payment' },
    { code: '18', name: 'Bank Account & QR', desc: 'Tài khoản ngân hàng & Cấu hình Webhook tự động gạch nợ', tab: 'payment' },
    { code: '19', name: 'Forklift', desc: 'Danh sách xe nâng, tải trọng, vị trí hiện tại', tab: 'forklift' },
    { code: '20', name: 'Forklift Driver', desc: 'Tài xế xe nâng, mã nhân viên, tablet phân công', tab: 'forklift' },
    { code: '21', name: 'Repair Type', desc: 'Loại sửa chữa: Sửa kết cấu, Sửa cửa, Sửa sàn, Hàn, Sơn, Lạnh', tab: 'repair' },
    { code: '22', name: 'Material & Warehouse', desc: 'Vật tư phụ tùng, Tồn kho Min/Max, Mã kho', tab: 'warehouse' },
    { code: '23', name: 'QC Checklist', desc: 'Checklist kiểm tra nghiệm thu chất lượng sau sửa chữa/rửa', tab: 'qc' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg ">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>KIẾN TRÚC NGHIỆP VỤ &amp; VÒNG ĐỜI CONTAINER TRONG DEPOT</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full">
                  15 Phân Hệ &bull; 23 Master Data
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình chuẩn khép kín: Gate-In → Survey → Grading (AV/CL/DM) → Cleaning / Estimate → Repair → QC → Yard → Gate-Out
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setSelectedTab('FLOW')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  selectedTab === 'FLOW' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sơ Đồ Vòng Đời
              </button>
              <button
                onClick={() => setSelectedTab('MASTER_DATA')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  selectedTab === 'MASTER_DATA' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                23 Master Data Nền
              </button>
              <button
                onClick={() => setSelectedTab('MODULES')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  selectedTab === 'MODULES' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                15 Phân Hệ Chi Tiết
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SƠ ĐỒ VÒNG ĐỜI TƯƠNG TÁC */}
          {selectedTab === 'FLOW' && (
            <div className="space-y-6">
              {/* Visual Workflow Map (Horizontal Clickable Pipeline) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    Bấm vào từng bước trong quy trình để xem chi tiết nghiệp vụ &amp; chuyển nhanh đến màn hình chức năng:
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">BƯỚC: {currentStep.number}/14</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {resolvedWorkflowSteps.map((step) => {
                    const Icon = step.icon;
                    const isSelected = step.id === activeWorkflowStep;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveWorkflowStep(step.id)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-lg  ring-1 ring-blue-500/50'
                            : 'bg-white border-slate-200 hover:border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-500">{step.number}</span>
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">{step.title.split('(')[0]}</div>
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-slate-500">
                          {isSelected ? '✓ Đang xem' : 'Xem chi tiết →'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Detail Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${currentStep.bg} ${currentStep.color} ${currentStep.borderColor}`}>
                        <currentStep.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          BƯỚC {currentStep.number} TRONG QUY TRÌNH DEPOT
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{currentStep.title}</h3>
                      </div>
                    </div>

                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          onNavigateTab(currentStep.moduleTarget);
                          onClose();
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg "
                      >
                        <span>Mở Màn Hình Này</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{currentStep.summary}</p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      CÁC QUY TẮC &amp; NGHIỆP VỤ XỬ LÝ CHÍNH:
                    </h4>
                    <div className="space-y-2">
                      {currentStep.details.map((detail: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grading Decision Logic Box */}
                <div className="p-6 bg-indigo-50/40 border border-indigo-200 rounded-3xl space-y-4">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    QUY LUẬT PHÂN NHÁNH GRADING
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-700 flex items-center justify-between">
                        <span>1. AV (Available)</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 rounded">Sạch &amp; Đạt Chuẩn</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Vỏ nguyên vẹn, sàn sạch, không cần xử lý → Chuyển sang khu AV Area để sẵn sàng cấp trả.
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                      <div className="font-bold text-amber-700 flex items-center justify-between">
                        <span>2. CL (Cleaning Req.)</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 rounded">Cần Vệ Sinh</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Chuyển Cleaning Bay → Xịt rửa theo Tariff (nước nóng, hóa chất, Ozone) → Sau khi QC Pass chuyển thành AV.
                      </p>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                      <div className="font-bold text-rose-700 flex items-center justify-between">
                        <span>3. DM (Damaged)</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 rounded">Cần Sửa Chữa</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Lập Estimate IICL → Chờ Approval Hãng tàu → Thực hiện Work Order sửa chữa → QC Pass chuyển thành AV.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 23 MASTER DATA NỀN TẢNG */}
          {selectedTab === 'MASTER_DATA' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200/40 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    23 DANH MỤC CẤU HÌNH BAN ĐẦU (MASTER DATA / CONFIGURATION)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dữ liệu nền tảng vận hành toàn bộ vòng đời container. Tuyệt đối không hard-code trong chương trình.
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab('master_data');
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <span>Quản Lý Master Data</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {masterDataList.map((m) => (
                  <div
                    key={m.code}
                    onClick={() => {
                      if (onNavigateTab) {
                        onNavigateTab(m.tab);
                        onClose();
                      }
                    }}
                    className="p-3.5 bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-2xl cursor-pointer transition flex items-start gap-3 hover:bg-slate-100 group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-indigo-600 group-hover:bg-indigo-600 group-hover:text-slate-900 transition">
                      {m.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                        <span>{m.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-600 transition" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 15 PHÂN HỆ CHI TIẾT */}
          {selectedTab === 'MODULES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: '01. MASTER DATA / CONFIGURATION',
                    desc: '23 Danh mục cấu hình nền: Hãng tàu, Owner, Tiêu chuẩn IICL, Cấu kiện, Mã hư hỏng, Mã sửa chữa, Tariff...',
                    tab: 'master_data',
                    icon: Database,
                    color: 'text-indigo-600'
                  },
                  {
                    title: '02. SURVEY (GIÁM ĐỊNH)',
                    desc: 'Tiếp nhận giám định IICL-6, phân loại AV/CL/DM, ghi nhận Damage và phát hành chứng từ e-EIR.',
                    tab: 'survey',
                    icon: ClipboardCheck,
                    color: 'text-amber-600'
                  },
                  {
                    title: '03. OPERATION / GATE-IN',
                    desc: 'Tiếp nhận xe vào cổng, lập Service Ticket / Invoice dịch vụ theo Tariff.',
                    tab: 'operation',
                    icon: Receipt,
                    color: 'text-cyan-600'
                  },
                  {
                    title: '04. PAYMENT (THANH TOÁN)',
                    desc: 'Thanh toán tức thời VietQR động, Webhook gạch nợ tự động chuyển trạng thái PAID.',
                    tab: 'payment',
                    icon: QrCode,
                    color: 'text-purple-600'
                  },
                  {
                    title: '05. FORKLIFT DISPATCH',
                    desc: 'Điều phối xe nâng theo chu trình 6 bước, tối ưu lộ trình và quản lý qua Tablet.',
                    tab: 'forklift',
                    icon: Truck,
                    color: 'text-orange-600'
                  },
                  {
                    title: '06. YARD MANAGEMENT',
                    desc: 'Quản lý bãi theo Block-Bay-Row-Tier, phân khu AV Area, Cleaning Bay, EMR Area và sơ đồ 2D.',
                    tab: 'yard_map',
                    icon: Grid3X3,
                    color: 'text-teal-600'
                  },
                  {
                    title: '07. ESTIMATE (BÁO GIÁ EMR)',
                    desc: 'Lập báo giá sửa chữa IICL: Đơn giá nhân công × Giờ công + Vật tư + Vệ sinh.',
                    tab: 'estimate',
                    icon: Calculator,
                    color: 'text-amber-600'
                  },
                  {
                    title: '08. APPROVAL GATEWAY',
                    desc: 'Cổng gửi nhận duyệt báo giá với hãng tàu DRAFT → SUBMITTED → PENDING → APPROVED.',
                    tab: 'approval',
                    icon: CheckSquare,
                    color: 'text-purple-600'
                  },
                  {
                    title: '09. REPAIR (SỬA CHỮA)',
                    desc: 'Lệnh sửa chữa Work Order cho tổ thợ cơ khí, hàn, sơn, điện lạnh và theo dõi tiến độ.',
                    tab: 'repair',
                    icon: Wrench,
                    color: 'text-rose-600'
                  },
                  {
                    title: '10. CLEANING (VỆ SINH)',
                    desc: '10 Phương pháp làm sạch theo Master Tariff: Xịt nước 200 Bar, hóa chất D-30, khử mùi Ozone.',
                    tab: 'master_cleaning',
                    icon: Droplets,
                    color: 'text-cyan-600'
                  },
                  {
                    title: '11. INVENTORY (KHO VẬT TƯ)',
                    desc: 'Xuất kho vật tư phụ tùng theo Work Order, quản lý tồn kho tối thiểu / tối đa.',
                    tab: 'warehouse',
                    icon: Warehouse,
                    color: 'text-yellow-600'
                  },
                  {
                    title: '12. QC (KIỂM TRA CHẤT LƯỢNG)',
                    desc: 'Nghiệm thu sau sửa chữa/rửa: Đạt Pass → Chuyển trạng thái về AV; Fail → Yêu cầu làm lại.',
                    tab: 'qc',
                    icon: ShieldCheck,
                    color: 'text-emerald-600'
                  },
                  {
                    title: '13. CARRIER BILLING',
                    desc: 'Hóa đơn công nợ Hãng tàu định kỳ, theo dõi Aging Debt và kỳ hạn thanh toán.',
                    tab: 'billing',
                    icon: FileSpreadsheet,
                    color: 'text-blue-600'
                  },
                  {
                    title: '14. GATE-OUT (CẤP TRẢ)',
                    desc: 'Cấp cont theo Booking Release của hãng tàu, thuật toán FIFO chọn cont AV đạt chuẩn.',
                    tab: 'gate',
                    icon: LogOut,
                    color: 'text-emerald-600'
                  },
                  {
                    title: '15. INTEGRATION (EDI/API)',
                    desc: 'Đồng bộ EDI hàng hải CODECO, COARRI, WESTIM và Webhook ngân hàng thời gian thực.',
                    tab: 'system',
                    icon: Send,
                    color: 'text-pink-600'
                  }
                ].map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (onNavigateTab) {
                          onNavigateTab(mod.tab);
                          onClose();
                        }
                      }}
                      className="p-5 bg-slate-50 border border-slate-200 hover:border-blue-200 rounded-2xl cursor-pointer transition flex flex-col justify-between hover:bg-slate-100 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Icon className={`w-5 h-5 ${mod.color}`} />
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{mod.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{mod.desc}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200/80 text-[10px] font-mono text-blue-600 font-bold">
                        Mở phân hệ →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Hệ Thống Quản Lý Depot Container Tuân Thủ Chuẩn IICL-6 &amp; CEDEX Quốc Tế</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
