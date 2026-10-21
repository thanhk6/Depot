import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ContainerRecord } from './services/mockDataStore';
import { containerApi, estimateApi } from './api';
import { authApi } from './api/auth.api';
import { AuthProvider } from './app/providers/AuthProvider';
import { ChevronRight, Lock, Menu } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { UserAccountMenu } from './components/UserAccountMenu';
import { ScreenErrorBoundary } from './components/ScreenErrorBoundary';
import { UserAccountProfile } from './data/roleMenuConfig';
import { DepotProvider, useDepot } from './context/DepotContext';
import { MENU_PERMISSION, canAccessMenu } from './constants/menuPermissions';
import { sessionService } from './services/session.service';
import { tokenService } from './services/token.service';

// Modules
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { GateInPage } from './modules/gate/pages/GateInPage';
import { SurveyModulePage } from './modules/survey/pages/SurveyModulePage';
import { CleaningModulePage } from './modules/cleaning/pages/CleaningModulePage';
import { OperationPage } from './modules/operation/pages/OperationPage';
import { PaymentPage } from './modules/payment/pages/PaymentPage';
import { ContainerListPage } from './modules/container/pages/ContainerListPage';
import { YardMapPage } from './modules/yard/pages/YardMapPage';
import { YardBlocksPage } from './modules/yard/pages/YardBlocksPage';
import { ForkliftPage } from './modules/forklift/pages/ForkliftPage';
import { EstimatePage } from './modules/estimate/pages/EstimatePage';
import { EstimateCatalogPage, ESTIMATE_CATALOG_MENUS } from './modules/estimate/pages/EstimateCatalogPage';
import { ApprovalPage } from './modules/approval/pages/ApprovalPage';
import { RepairPage } from './modules/repair/pages/RepairPage';
import { QCPage } from './modules/qc/pages/QCPage';
import { ShippingApiPage } from './modules/shipping_api/pages/ShippingApiPage';
import { GateOutPage } from './modules/gate_out/pages/GateOutPage';
import { GateOutSettingsPage } from './modules/gate_out/pages/GateOutSettingsPage';
import { WarehousePage } from './modules/warehouse/pages/WarehousePage';
import { BillingPage } from './modules/billing/pages/BillingPage';
import { ReportPage } from './modules/report/pages/ReportPage';
import { MasterDataPage } from './modules/masterdata/pages/MasterDataPage';
import { SystemPage } from './modules/system/pages/SystemPage';
import { CustomerPage } from './modules/customer/pages/CustomerPage';
import { NotificationModule } from './modules/notifications/NotificationModule';
// `ZaloModule`/`ZaloHeader` (màn "ZALO GATEWAY & CHAT" riêng) đã bị xoá — gộp chung vào
// `NotificationModule` (hub "THÔNG BÁO & ZALO GATEWAY") theo yêu cầu người dùng, xem case
// 'zalo_overview'..'zalo_logs' bên dưới đều trỏ vào NotificationModule.
import { BusinessWorkflowModal } from './modules/system/components/BusinessWorkflowModal';
import { getApiErrorMessage } from './utils/apiError';

interface AppContentProps {
  onLogout: () => void;
}

function AppContent({ onLogout }: AppContentProps) {
  // Theo yêu cầu người dùng: đăng nhập xong phải vào thẳng Dashboard ERP. `AppContent` mount lại từ đầu
  // mỗi lần đăng nhập (App.tsx chuyển hẳn nhánh JSX từ LoginScreen sang AppContent), nên chỉ cần đổi
  // giá trị khởi tạo state — trước đây để nhầm 'notifications' (không phải Dashboard).
  // Vai trò không có quyền Dashboard (vd tài xế xe nâng) thì vào mục menu đầu tiên được phép.
  const { loggedInUserProfile } = useDepot();
  const allowedTabs = loggedInUserProfile?.allowedTabs;
  const firstAllowedTab = Object.keys(MENU_PERMISSION).find((id) => id !== 'workflow' && canAccessMenu(allowedTabs, id)) || 'dashboard';
  const [activeTab, setActiveTab] = useState<string>(() => canAccessMenu(allowedTabs, 'dashboard') ? 'dashboard' : firstAllowedTab);
  const [containers, setContainers] = useState<ContainerRecord[]>([]);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Nguồn chân lý duy nhất cho việc quy đổi DepotJobDto (backend) → ContainerRecord (local) — dùng
  // chung cho cả fetch toàn bộ danh sách lúc mount lẫn refetch 1 container sau mỗi hành động nghiệp vụ
  // (`refreshContainer` bên dưới), để không có 2 nơi tự đoán mò 2 kiểu khác nhau.
  const mapJobToContainerRecord = (job: any): ContainerRecord => ({
    id: String(job.id),
    containerNo: job.containerNo,
    isoCode: job.isoSize,
    size: job.isoSize,
    type: job.isoSize?.includes('RF') || job.isoSize?.includes('RH') ? 'Reefer' : 'Dry High Cube',
    shippingLine: job.shippingLineCode,
    // 'B' = cấp CL (cần vệ sinh, xem DepotJobService.SubmitSurveyAsync) — thiếu nhánh này khiến mọi
    // container CL bị hiện nhầm thành DM (Cần Sửa Chữa) sau F5, biến mất khỏi hàng đợi Tổ Vệ Sinh
    // (CleaningModulePage lọc `condition === 'CL'`) vì luôn rơi vào nhánh else.
    // `Survey.ConditionRating` chỉ ghi 1 LẦN lúc giám định và không bao giờ bị Cleaning/Repair/QC
    // đụng tới sau đó — nên trước đây container đã vệ sinh/sửa chữa xong (job.Status đã lên
    // READY_FOR_OUT/GATE_OUT) vẫn hiện `condition: 'CL'`/`'DM'` mãi mãi, khiến KPI "Container CL/DM"
    // trên Dashboard đếm nhầm cả những container đã xong việc từ lâu, và dễ gây hiểu lầm "giám định
    // đã chuyển qua vệ sinh nhưng sao Cleaning bay không thấy" khi thực ra job đó đã được xử lý xong.
    // job.Status đạt READY_FOR_OUT/GATE_OUT là trạng thái chốt duy nhất cho cả 2 nhánh Cleaning
    // (CleaningService.HandoverAsync) và Repair→QC (SubmitQcAsync khi Passed) nên dùng nó ưu tiên hơn.
    condition: job.status === 'READY_FOR_OUT' || job.status === 'GATE_OUT'
      ? 'AV'
      // Chưa có phiếu giám định → để trống (trước đây mặc định 'AV' nên container chưa giám định bị
      // hiện "Sẵn sàng" và bị đếm vào KPI AV trên Dashboard).
      : job.survey?.conditionRating === 'A' ? 'AV' : job.survey?.conditionRating === 'B' ? 'CL' : job.survey ? 'DM' : undefined,
    status: job.status,
    gateInDate: job.gateInDate,
    gateOutDate: job.gateOutDate,
    // Xe/tài xế lúc Gate-In — trước đây không map nên màn Vòng Đời Container luôn hiện "—" dù DB có dữ liệu.
    paymentStatus: job.payment?.status === 'PAID' ? 'PAID' : 'UNPAID',
    licensePlate: job.gateInTruckPlate || undefined,
    driverName: job.gateInDriverName || undefined,
    driverPhone: job.gateInDriverPhone || undefined,
    // Báo giá thật của hồ sơ (màn Phê duyệt hãng tàu, QC). DRAFT = đã lưu nhưng người báo giá chưa xác nhận;
    // PENDING = đã xác nhận / đã gửi, chờ hãng tàu duyệt.
    estimateDetails: job.estimate ? {
      estimateNo: job.estimate.estimateNo,
      createdAt: job.estimate.createdAt,
      labourHours: job.estimate.totalManHours || 0,
      labourCost: job.estimate.totalLaborCost || 0,
      materialCost: job.estimate.totalMaterialCost || 0,
      totalCost: job.estimate.grandTotal || 0,
      approvalStatus: job.estimate.status === 'APPROVED' ? 'APPROVED'
        : job.estimate.status === 'REJECTED' ? 'REJECTED'
        : job.estimate.confirmedAt ? 'PENDING' : 'DRAFT',
      rejectReason: (job.auditLogs || []).filter((l: any) => l.action === 'ESTIMATE_REJECTED')
        .sort((a: any, b: any) => String(a.timestamp).localeCompare(String(b.timestamp))).pop()?.details || undefined,
      confirmedAt: job.estimate.confirmedAt || undefined,
      confirmedBy: job.estimate.confirmedBy || undefined,
      approvedAt: job.estimate.approvedAt || undefined,
      approvedBy: job.estimate.approvedBy || undefined,
      carrierWorkOrderNo: job.estimate.carrierWorkOrderNo || undefined,
      carrierAuthCode: job.estimate.carrierAuthCode || undefined,
      approvedAmount: job.estimate.approvedAmount ?? undefined,
      items: (job.estimate.items || []).map((i: any) => ({
        damageCode: i.damageCode || '',
        repairCode: i.repairCode || '',
        description: i.itemDescription || i.repairMethod || '',
        locationCode: i.locationCode || '',
        locationName: i.locationName || '',
        tpi: i.tpi || '',
        quantity: Number(i.quantity) || 0,
        manHoursPerPiece: Number(i.manHoursPerPiece) || 0
      }))
    } : undefined,
    // Lệnh sửa chữa thật (RepairOrder) — có nghĩa là thợ đã nhận / bắt đầu sửa.
    workOrderDetails: job.repairOrder ? {
      workOrderNo: job.jobNo,
      technician: job.repairOrder.technicianName || '',
      assignedAt: job.repairOrder.startedAt || job.repairOrder.createdAt || '',
      materialsIssued: [],
      status: job.repairOrder.completedAt ? 'COMPLETED' : job.repairOrder.startedAt ? 'IN_PROGRESS' : 'PENDING'
    } : undefined,
    yardLocation: job.blockCode ? {
      block: job.blockCode,
      bay: String(job.bay),
      row: String(job.row),
      tier: String(job.tier)
    } : undefined,
    timeline: (job.auditLogs || []).map((log: any) => ({
      status: log.action,
      time: log.timestamp,
      actor: log.user,
      note: log.details
    })),
    forkliftClaim: job.forkliftClaimedByOperatorId ? {
      operatorId: job.forkliftClaimedByOperatorId,
      operatorName: job.forkliftClaimedByOperatorName,
      vehicleCode: job.forkliftAssignedVehicleCode,
      claimedAt: job.forkliftClaimedAt,
      startedAt: job.forkliftStartedAt
    } : undefined
  });

  // Database là nguồn dữ liệu container duy nhất. Trước đây chỉ tải 1 lần lúc đăng nhập → bước do người
  // khác làm (kế toán thu tiền ở máy khác, vệ sinh bàn giao...) không hiện ở màn sau cho tới khi F5,
  // vd container đã thanh toán không xuất hiện ở "chờ lập báo giá". Nay tải lại mỗi lần chuyển màn
  // và khi quay lại cửa sổ trình duyệt.
  const loadContainers = React.useCallback(() => {
    containerApi.getAll()
      .then((response: any) => {
        if (response?.statusCode !== 200 || !Array.isArray(response.data)) return;
        setContainers(response.data.map(mapJobToContainerRecord));
      })
      .catch((error) => console.warn('Không thể tải container từ Backend SQL:', error));
  }, []);

  useEffect(() => {
    loadContainers();
  }, [activeTab, loadContainers]);

  useEffect(() => {
    const onFocus = () => loadContainers();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadContainers]);

  // Đọc lại đúng dữ liệu THẬT của 1 container từ Postgres sau khi 1 hành động nghiệp vụ (thanh toán,
  // điều độ xe nâng, hoàn tất sửa chữa, QC, Gate-Out...) thành công — thay vì tự đoán `status`/`condition`
  // mới ở phía frontend. Nhiều service backend đặt status khác hẳn (hoặc không đổi status nào cả) so với
  // giá trị trước đây bị đoán cứng ở đây, gây lệch dữ liệu ngay khi F5 (xem [[project-backend-audit]]).
  const refreshContainer = async (id: string) => {
    try {
      const response: any = await containerApi.getById(id);
      if (response?.statusCode !== 200 || !response.data) return;
      const updated = mapJobToContainerRecord(response.data);
      setContainers((prev) => {
        const exists = prev.some((c) => c.id === updated.id);
        return exists ? prev.map((c) => (c.id === updated.id ? updated : c)) : [updated, ...prev];
      });
    } catch (error) {
      console.warn(`Không thể tải lại container ${id} từ Backend SQL:`, error);
    }
  };

  // Tab Breadcrumb Map
  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard ERP Tổng Quan',
    workflow: 'Sơ Đồ Vòng Đời Nghiệp Vụ',
    gate: '1. Tiếp Nhận Cổng (Gate-In)',
    survey: '2. Giám Định e-EIR (IICL-6)',
    cleaning: 'Danh Sách Cần Vệ Sinh Container',
    cleaning_history: 'Lịch Sử Đã Vệ Sinh Container',
    operation: '4. Khai Thác Gate-In & Biểu Cước Tariff',
    payment: '5. Thanh Toán Dịch Vụ VietQR',
    container: 'Danh Sách Quản Lý Container',
    yard_map: 'Sơ Đồ Bãi 2D (Konva)',
    yard_blocks: 'Quản Lý Vị Trí Block',
    forklift: 'Lệnh Điều Độ Xe Nâng',
    estimate: 'Lập Báo Giá MNR (Estimate)',
    est_damage_codes: 'Danh Mục Báo Giá · Mã Hư Hỏng',
    est_repair_codes: 'Danh Mục Báo Giá · Mã Sửa Chữa',
    est_repair_locations: 'Danh Mục Báo Giá · Vị Trí Sửa Chữa',
    est_labor_rates: 'Danh Mục Báo Giá · Đơn Giá Giờ Công',
    est_misc_codes: 'Danh Mục Báo Giá · TPI · Cause · Mode · Shop Code',
    approval: 'Phê Duyệt Báo Giá Hãng Tàu',
    repair: '8. Lệnh Sửa Chữa Work Order',
    qc: '9. QC Nghiệm Thu Chất Lượng AV',
    shipping_api: '10. Cổng Truyền Dữ Liệu API Hãng Tàu (API Gateway)',
    gate_out: '11. Tổng Quan & Điều Độ Cổng Xuất (Gate-Out Dashboard)',
    gate_out_ready: '1. Vỏ Sẵn Sàng Cấp (Ready In Yard)',
    gate_out_lane: '2. Tiếp Nhận Làn Cổng Xuất',
    gate_out_history: '3. Nhật Ký Xuất & Phiếu e-EIR',
    warehouse: 'Kho Vật Tư Sửa Chữa EMR',
    billing: 'Công Nợ & Billing Hãng Tàu',
    master_data: 'Danh Mục Master Data',
    departments: 'Danh Mục Phòng Ban & Cơ Cấu Tổ Chức',
    tariff_lolo: 'Cước Nâng Hạ (LoLo)',
    tariff_storage: 'Cước Lưu Bãi (Storage)',
    cleaning_tariffs: 'Biểu Phí Vệ Sinh Container',
    container_types: 'DM Loại Container (ISO 6346)',
    damage_locations: 'DM Vị Trí Cấu Kiện (Locations)',
    damage_codes: 'DM Mã Hư Hỏng IICL',
    repair_codes: 'DM Phương Án Sửa Chữa',
    grades: 'DM Phân Hạng Vỏ (Quality Grades)',
    standards: 'DM Tiêu Chuẩn Giám Định',
    customer_list: 'Khách Hàng (Trucking & Forwarder)',
    customer_classifications: 'Danh Mục Phân Loại Khách Hàng',
    shipping_lines: 'Hãng Tàu Khai Thác (Maersk Line)',
    zalo_overview: 'Tổng Quan Zalo OA Gateway',
    zalo_simulator: 'Zalo Simulator & Chat Khách Hàng',
    zalo_templates: 'Mẫu Tin Zalo ZNS & OA',
    zalo_settings: 'Cấu Hình Zalo OA & API Token',
    zalo_logs: 'Nhật Ký Giao Dịch Zalo & Webhook',
    notifications: 'Dashboard Thông Báo Toàn Hệ Thống',
    notifications_send: 'Gửi Thông Báo Mới',
    notifications_employees: 'Thông Báo Nhân Viên',
    notifications_customers: 'Thông Báo Khách Hàng',
    notifications_templates: 'Mẫu Thông Báo',
    notifications_history: 'Lịch Sử Gửi Thông Báo',
    notifications_queue: 'Hàng Đợi Gửi Thông Báo',
    report_staff_realtime: '⚡ Báo Cáo Công Việc Từng Người (Real-Time)',
    report: 'Báo Cáo Tổng Quan & Thông Lượng Bãi',
    report_emr: 'Báo Cáo Năng Suất Sửa Chữa EMR',
    report_dwell_time: 'Báo Cáo Thời Gian Lưu Bãi (Dwell Time)',
    report_revenue: 'Báo Cáo Doanh Thu & Cước Nâng Hạ',
    system: 'Phân Quyền & Hệ Thống RBAC'
  };

  const handleSelectTab = (tabId: string) => {
    if (tabId === 'workflow') {
      setIsWorkflowModalOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const renderContent = () => {
    // Màn có thể được mở qua onNavigateTab từ màn khác (không chỉ từ Sidebar đã lọc) — chặn ở đây luôn,
    // không mount màn để khỏi gọi API chắc chắn bị 403.
    if (!canAccessMenu(allowedTabs, activeTab)) {
      return (
        <div className="max-w-xl mx-auto mt-10 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 text-center shadow-sm space-y-3">
          <Lock className="w-8 h-8 mx-auto text-[#DC2626]" />
          <h2 className="text-base font-bold text-[#1F2937]">Không có quyền truy cập</h2>
          <p className="text-sm text-[#64748B]">
            Vai trò của bạn không được phép mở màn "{tabTitles[activeTab] || activeTab}". Liên hệ quản trị viên nếu cần cấp quyền.
          </p>
          <button
            onClick={() => setActiveTab(firstAllowedTab)}
            className="px-4 py-2 rounded-xl bg-[#1677FF] text-white text-sm font-semibold hover:bg-[#0958D9] transition cursor-pointer"
          >
            Về màn được phép
          </button>
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'gate':
        return (
          <GateInPage
            containers={containers}
            onAddGateIn={(realId) => {
              void refreshContainer(realId);
            }}
            onNavigateToSurvey={canAccessMenu(allowedTabs, 'survey') ? () => setActiveTab('survey') : undefined}
          />
        );
      case 'survey':
        return <SurveyModulePage onNavigateTab={setActiveTab} />;
      case 'cleaning':
        return (
          <CleaningModulePage
            initialTab="PENDING"
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'cleaning_history':
        return (
          <CleaningModulePage
            initialTab="COMPLETED"
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'operation':
        return (
          <OperationPage
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'payment':
        return (
          <PaymentPage
            containers={containers}
            onConfirmPayment={(containerId) => {
              // ProcessPaymentAsync KHÔNG đổi DepotJob.Status (chỉ đổi ServiceOrder/Payment.Status —
              // PaymentPage tự theo dõi 2 field đó qua state riêng), nên trước đây gán cứng
              // `status: 'PAYMENT_SUCCESS'` ở đây là bịa 1 giá trị chưa từng tồn tại thật ở backend.
              void refreshContainer(containerId);
            }}
            onNavigateTab={setActiveTab}
          />
        );
      case 'container':
        return (
          <ContainerListPage
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'yard_map':
        return (
          <YardMapPage
            containers={containers}
            onSelectContainer={(_c) => {
              setActiveTab('container');
            }}
          />
        );
      case 'yard_blocks':
        return (
          <YardBlocksPage
            containers={containers}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'forklift':
        return (
          <ForkliftPage
            containers={containers}
            onRefreshContainer={(id) => void refreshContainer(id)}
            onConfirmMove={(id) => {
              // CompleteForkliftMoveAsync cố ý KHÔNG còn ghi đè DepotJob.Status = "IN_YARD" nữa (xem
              // docs/backend-progress/11-forklift.md) — di chuyển có thể xảy ra ở bất kỳ giai đoạn nào
              // (đang sửa chữa, đã READY_FOR_OUT...), gán cứng ở đây từng xoá mất status thật, tái tạo
              // đúng bug đã sửa ở backend. Đọc lại BlockCode/Bay/Row/Tier thật từ Postgres thay vì tự ghép.
              void refreshContainer(id);
            }}
            onNavigateTab={setActiveTab}
          />
        );
      case 'est_damage_codes':
      case 'est_repair_codes':
      case 'est_repair_locations':
      case 'est_labor_rates':
      case 'est_misc_codes':
        return ESTIMATE_CATALOG_MENUS[activeTab] ? <EstimateCatalogPage menuId={activeTab} /> : null;
      case 'estimate':
        return (
          <EstimatePage
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'approval':
        return (
          <ApprovalPage
            containers={containers}
            // Ghi nhận quyết định hãng tàu (nhập tay khi chưa có API). Trả về lỗi (nếu có) để màn hình báo đúng,
            // rồi đọc lại hồ sơ thật từ DB thay vì tự gán trạng thái.
            onApproveEstimate={async (id, authData) => {
              try {
                const response: any = await estimateApi.approveEstimate(id, authData);
                if (response?.statusCode !== 200) return response?.message || 'Phê duyệt thất bại.';
                return null;
              } catch (error) {
                return getApiErrorMessage(error, 'Phê duyệt thất bại.');
              } finally {
                void refreshContainer(id);
              }
            }}
            onRejectEstimate={async (id, reason, rejectCode) => {
              try {
                const response: any = await estimateApi.rejectEstimate(id, reason, rejectCode || 'Hãng tàu');
                if (response?.statusCode !== 200) return response?.message || 'Từ chối thất bại.';
                return null;
              } catch (error) {
                return getApiErrorMessage(error, 'Từ chối thất bại.');
              } finally {
                void refreshContainer(id);
              }
            }}
            onNavigateTab={setActiveTab}
          />
        );
      case 'repair':
        return (
          <RepairPage
            containers={containers}
            onCompleteRepair={(id) => {
              // CompleteRepairAsync đặt status thật là "QC_PENDING", không phải "WAITING_QC" từng gán
              // cứng ở đây — lệch tên khiến container biến mất khỏi hàng đợi QC ngay sau F5.
              void refreshContainer(id);
            }}
            onNavigateTab={setActiveTab}
          />
        );
      case 'qc':
        return (
          <QCPage
            containers={containers}
            onQCResult={(id) => {
              // CompleteQcInspectionAsync đặt status thật là "READY_FOR_OUT" (hoặc "CLEANING" nếu còn
              // lệnh vệ sinh đang mở) khi ĐẠT, "REPAIRING" khi KHÔNG ĐẠT — không có "READY_FOR_USE" nào
              // ở backend, và service không đụng tới field condition (condition suy ra ở client từ
              // Survey.ConditionRating, xem mapJobToContainerRecord).
              void refreshContainer(id);
            }}
            onNavigateTab={setActiveTab}
          />
        );
      case 'shipping_api':
        return (
          <ShippingApiPage
            containers={containers}
            onNavigateTab={setActiveTab}
          />
        );
      case 'gate_out':
      case 'gate_out_ready':
      case 'gate_out_lane':
      case 'gate_out_history': {
        const subTabMap: Record<string, 'OVERVIEW' | 'READY_LIST' | 'GATE_LANE' | 'HISTORY'> = {
          gate_out: 'OVERVIEW',
          gate_out_ready: 'READY_LIST',
          gate_out_lane: 'GATE_LANE',
          gate_out_history: 'HISTORY'
        };
        return (
          <GateOutPage
            containers={containers}
            initialSubTab={subTabMap[activeTab] || 'OVERVIEW'}
            onNavigateTab={setActiveTab}
            onUpdateContainerStatus={(realId) => {
              // GateOutAsync đổi GateOutDate/GateOutTruckPlate/... + giải phóng YardPosition thật —
              // đọc lại từ Postgres thay vì tự đoán, trước đây còn phải dò khớp id qua nhiều định dạng
              // (containerNo/`CONT-*`/`GO-PROP-*`) vì id giả từ Gate-In không khớp id thật ở đâu cả.
              void refreshContainer(realId);
            }}
          />
        );
      }
      case 'warehouse':
        return <WarehousePage />;
      case 'billing':
        return <BillingPage />;
      case 'zalo_overview':
        return <NotificationModule initialSubTab="zalo_overview" onNavigateTab={setActiveTab} />;
      case 'zalo_simulator':
        return <NotificationModule initialSubTab="zalo_simulator" onNavigateTab={setActiveTab} />;
      case 'zalo_templates':
        return <NotificationModule initialSubTab="zalo_templates" onNavigateTab={setActiveTab} />;
      case 'zalo_settings':
        return <NotificationModule initialSubTab="zalo_settings" onNavigateTab={setActiveTab} />;
      case 'zalo_logs':
        return <NotificationModule initialSubTab="zalo_logs" onNavigateTab={setActiveTab} />;
      case 'notifications':
        return <NotificationModule initialSubTab="dashboard" onNavigateTab={setActiveTab} />;
      case 'notifications_send':
        return <NotificationModule initialSubTab="send" onNavigateTab={setActiveTab} />;
      case 'notifications_employees':
        return <NotificationModule initialSubTab="employees" onNavigateTab={setActiveTab} />;
      case 'notifications_customers':
        return <NotificationModule initialSubTab="customers" onNavigateTab={setActiveTab} />;
      case 'notifications_templates':
        return <NotificationModule initialSubTab="templates" onNavigateTab={setActiveTab} />;
      case 'notifications_history':
        return <NotificationModule initialSubTab="history" onNavigateTab={setActiveTab} />;
      case 'notifications_queue':
        return <NotificationModule initialSubTab="queue" onNavigateTab={setActiveTab} />;
      case 'report_staff_realtime':
        return <ReportPage containers={containers} initialTab="staff_realtime" onNavigateTab={setActiveTab} />;
      case 'report':
        return <ReportPage containers={containers} initialTab="overview" onNavigateTab={setActiveTab} />;
      case 'report_emr':
        return <ReportPage containers={containers} initialTab="emr_damage" onNavigateTab={setActiveTab} />;
      case 'report_dwell_time':
        return <ReportPage containers={containers} initialTab="dwell_time" onNavigateTab={setActiveTab} />;
      case 'report_revenue':
        return <ReportPage containers={containers} initialTab="revenue" onNavigateTab={setActiveTab} />;
      case 'customer_list':
        return <CustomerPage />;
      case 'customer_classifications':
        return <MasterDataPage initialTab="customer_classifications" />;
      case 'departments':
        return <MasterDataPage initialTab="departments" />;
      case 'master_data':
      case 'tariff_lolo':
      case 'tariff_storage':
      case 'cleaning_tariffs':
      case 'container_types':
      case 'damage_locations':
      case 'survey_checklist':
      case 'damage_codes':
      case 'repair_codes':
      case 'grades':
      case 'standards':
      case 'shipping_lines':
        return <MasterDataPage initialTab={activeTab === 'master_data' ? 'container_types' : activeTab} />;
      case 'gate_out_settings':
        return <GateOutSettingsPage />;
      case 'system':
        return <SystemPage />;
      default:
        return <MasterDataPage initialTab="customer_classifications" />;
    }
  };

  return (

    <div className="flex h-[100dvh] w-full bg-[#F4F7FA] text-[#1F2937] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden bg-[#F4F7FA]">
        {/* Top Header Breadcrumb Bar */}
        <header className="h-14 px-3 sm:px-6 border-b border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FFFFFF] text-[#1F2937] hover:bg-[#F4F7FA] border border-[#E2E8F0] transition cursor-pointer shrink-0 shadow-sm"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#64748B] min-w-0">
              <span className="hidden sm:inline hover:text-[#1F2937] cursor-pointer font-medium text-[#64748B]">Depot System</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-[#E2E8F0] shrink-0" />
              <span className="text-[#1677FF] font-bold tracking-wide truncate max-w-[180px] sm:max-w-none">
                {tabTitles[activeTab] || 'Vận Hành Depot'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex px-2.5 sm:px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-[10px] sm:text-[11px] font-mono font-bold items-center gap-1.5">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              Live Server
            </div>
            <UserAccountMenu onLogout={onLogout} />
          </div>
        </header>

        {/* Dynamic Main Body with smooth touch scrolling and bottom safe padding */}

        <main className="flex-1 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 pb-16 sm:pb-8 bg-[#F4F7FA] touch-pan-y">
          <ScreenErrorBoundary screenKey={activeTab}>{renderContent()}</ScreenErrorBoundary>
        </main>
      </div>

      {/* Business Workflow Modal */}
      <BusinessWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        onNavigateTab={(tab) => {
          setIsWorkflowModalOpen(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default function App() {
  // Coi là đã đăng nhập chỉ khi có CẢ cờ giao diện lẫn JWT — cờ `depot_logged_user_id` một mình tự đặt
  // được trong devtools. (Đây chỉ là cổng giao diện; dữ liệu thật luôn do backend chặn bằng JWT.)
  const hasSession = () => !!localStorage.getItem('depot_logged_user_id') && !!tokenService.getAccessToken();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => hasSession());

  useEffect(() => {
    const syncLoginState = () => {
      setIsLoggedIn(hasSession());
    };

    window.addEventListener('storage', syncLoginState);
    return () => window.removeEventListener('storage', syncLoginState);
  }, []);

  const handleLoginSuccess = (_user: UserAccountProfile) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Thu hồi token ở backend (BUG-011) — không chờ kết quả: mạng lỗi thì vẫn đăng xuất phía trình duyệt.
    const token = tokenService.getAccessToken();
    if (token) void authApi.logout(token).catch(() => {});
    // Xoá cả JWT — trước đây đăng xuất chỉ xoá cờ giao diện, token vẫn nằm trong localStorage.
    sessionService.clear();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <DepotProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </DepotProvider>
    );
  }

  return (
    <AuthProvider>
      <DepotProvider>
        <AppContent onLogout={handleLogout} />
      </DepotProvider>
    </AuthProvider>
  );
}
