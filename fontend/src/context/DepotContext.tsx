import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import {
  DepotJob,
  RoleType,
  JobStatus,
  SurveyInfo,
  OperationInfo,
  CustomerInfo,
  DepotServiceItem,
  PaymentInfo,
  RepairEstimate,
  RepairWorkOrder,
  QCInspection,
  YardLocation,
  ForkliftMoveOrder,
  AuditLogEntry,
  DamageItem,
  ContainerSize
} from '../types/depot';
// Kiểu dữ liệu danh mục trong context — trước đây mượn `typeof` từ data/depotMasterData.ts (mảng dữ liệu mẫu gõ
// cứng, đã xoá). Dữ liệu thật nạp từ backend.
type DamageCodeOption = { code: string; nameVi: string; defaultRepair: string; defaultRepairVi: string; unitPriceLabor: number; unitPriceMaterial: number };
type ForkliftUnit = { id: string; name: string; driver: string; status: string };
import { USER_ACCOUNT_PROFILES, UserAccountProfile } from '../data/roleMenuConfig';
import { authFetch } from '../api/authFetch';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  title?: string;
}

interface DepotContextType {
  jobs: DepotJob[];
  shippingLines: string[];
  damageCodes: DamageCodeOption[];
  masterComponents: string[];
  tariffs: DepotServiceItem[];
  forklifts: ForkliftUnit[];
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
  userProfiles: UserAccountProfile[];
  // Hồ sơ tài khoản THẬT đang đăng nhập (set 1 lần lúc đăng nhập thành công từ dữ liệu backend trả về,
  // KHÔNG phải đoán theo `activeRole` như `userProfiles`) — persist qua localStorage để refresh trang
  // không mất thông tin ai đang đăng nhập. Null khi chưa đăng nhập.
  loggedInUserProfile: UserAccountProfile | null;
  setLoggedInUserProfile: (profile: UserAccountProfile | null) => void;
  updateRoleTabs: (profileId: string, allowedTabs: string[]) => void;
  addUserAccount: (newProfile: UserAccountProfile) => void;
  resetPermissionsToDefault: () => void;
  selectedJob: DepotJob | null;
  setSelectedJobId: (id: string | null) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: JobStatus | 'ALL';
  setStatusFilter: (status: JobStatus | 'ALL') => void;
  shippingLineFilter: string | 'ALL';
  setShippingLineFilter: (line: string | 'ALL') => void;

  // Toast System
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;

  // Actions
  createGateInJob: (
    containerNo: string,
    isoSize: ContainerSize,
    shippingLine: string,
    tareWeightKg: number,
    maxPayloadKg: number
  ) => DepotJob;

  updateJob: (
    jobId: string,
    updates: Partial<DepotJob>
  ) => void;

  deleteJob: (
    jobId: string
  ) => void;

  saveSurvey: (
    jobId: string,
    surveyData: Partial<SurveyInfo>,
    yardLocation?: YardLocation,
    forkliftDriver?: string
  ) => void;

  createOperationTicket: (
    jobId: string,
    customer: CustomerInfo,
    services: DepotServiceItem[]
  ) => void;

  processPayment: (
    jobId: string,
    method: 'BANK_TRANSFER' | 'CASH' | 'VIETQR',
    transactionRef?: string,
    amountPaid?: number
  ) => void;

  createEstimate: (
    jobId: string,
    damages: DamageItem[],
    notes?: string
  ) => void;

  approveEstimateByShippingLine: (
    jobId: string,
    approvedBy: string
  ) => void;

  rejectEstimateByShippingLine: (
    jobId: string,
    reason: string
  ) => void;

  assignRepairWorkOrder: (
    jobId: string,
    team: string,
    workers: string[],
    materials: { itemCode: string; itemName: string; quantity: number; unit: string }[]
  ) => void;

  completeRepairWorkOrder: (
    jobId: string,
    postRepairPhotos: string[]
  ) => void;

  recordQCResult: (
    jobId: string,
    result: 'PASSED' | 'FAILED',
    checklist: { item: string; passed: boolean; note?: string }[],
    comments?: string
  ) => void;

  createForkliftMove: (
    jobId: string,
    toLocation: YardLocation,
    forkliftId: string,
    purpose: ForkliftMoveOrder['purpose']
  ) => void;

  completeForkliftMove: (
    moveId: string
  ) => void;

  processGateOut: (
    jobId: string
  ) => void;

  resetToDefaultData: () => void;
}

const DepotContext = createContext<DepotContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'depot_container_jobs_v1';

export const DepotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<DepotJob[]>([]);

  // Master Data state loaded dynamically from Backend API
  // Empty until SQL Server master-data APIs return records. No frontend seed fallback.
  const [shippingLines, setShippingLines] = useState<string[]>([]);
  const [damageCodes, setDamageCodes] = useState<DamageCodeOption[]>([]);
  const [masterComponents, setMasterComponents] = useState<string[]>([]);
  const [tariffs, setTariffs] = useState<DepotServiceItem[]>([]);
  const [forklifts, setForklifts] = useState<ForkliftUnit[]>([]);

  // Hồ sơ tài khoản thật đang đăng nhập — đọc từ localStorage trước để refresh trang không mất, và để
  // `activeRole` khởi tạo đúng vai trò của người đã đăng nhập thay vì luôn reset về DEPOT_MANAGER.
  const [loggedInUserProfile, setLoggedInUserProfileState] = useState<UserAccountProfile | null>(() => {
    const saved = localStorage.getItem('depot_logged_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse logged-in user profile', e);
      }
    }
    return null;
  });

  const setLoggedInUserProfile = (profile: UserAccountProfile | null) => {
    setLoggedInUserProfileState(profile);
    if (profile) {
      localStorage.setItem('depot_logged_user_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('depot_logged_user_profile');
    }
  };

  const [activeRole, setActiveRole] = useState<RoleType>(loggedInUserProfile?.role || 'DEPOT_MANAGER');
  const [userProfiles, setUserProfiles] = useState<UserAccountProfile[]>(() => {
    const savedProfiles = localStorage.getItem('depot_user_profiles_v1');
    if (savedProfiles) {
      try {
        return JSON.parse(savedProfiles);
      } catch (e) {
        console.error('Failed to parse user profiles', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('depot_user_profiles_v1', JSON.stringify(userProfiles));
  }, [userProfiles]);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `TOAST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const defaultTitle = type === 'success' ? 'Thành Công' : type === 'error' ? 'Thất Bại' : 'Thông Báo';
    const toastItem: ToastNotification = {
      id,
      message,
      type,
      title: title || defaultTitle
    };
    setToasts((prev) => [...prev.slice(-4), toastItem]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'error' ? 4500 : 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateRoleTabs = (profileId: string, allowedTabs: string[]) => {
    setUserProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, allowedTabs } : p))
    );
    showToast('Cập nhật phân quyền truy cập menu tài khoản thành công!', 'success', 'Thành Công');
  };

  const addUserAccount = (newProfile: UserAccountProfile) => {
    setUserProfiles((prev) => [newProfile, ...prev]);
    showToast(`Đã thêm tài khoản mới [${newProfile.username}] thành công!`, 'success', 'Thành Công');
  };

  const resetPermissionsToDefault = () => {
    localStorage.removeItem('depot_user_profiles_v1');
    setUserProfiles(USER_ACCOUNT_PROFILES);
    showToast('Đã khôi phục phân quyền mặc định hệ thống thành công!', 'success', 'Thành Công');
  };

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [shippingLineFilter, setShippingLineFilter] = useState<string | 'ALL'>('ALL');

  const isApiSuccess = (payload: any) => payload?.statusCode === 200 || payload?.status === 'SUCCESS';

  const normalizeJob = (job: any): DepotJob => ({
    ...job,
    id: String(job?.id || job?.jobNo || ''),
    shippingLine: job?.shippingLine || job?.shippingLineCode || '',
    currentLocation: job?.currentLocation || {
      block: job?.blockCode || 'BLOCK_A',
      bay: job?.bay || 1,
      row: job?.row || 1,
      tier: job?.tier || 1
    },
    moveHistory: Array.isArray(job?.moveHistory) ? job.moveHistory : [],
    auditLogs: Array.isArray(job?.auditLogs) ? job.auditLogs : []
  });

  useEffect(() => {
    // Fetch initial jobs directly and exclusively from Backend SQL API
    authFetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (isApiSuccess(data) && Array.isArray(data.data)) {
          setJobs(data.data.map(normalizeJob));
        }
      })
      .catch((err) => {
        console.warn('Error fetching jobs from Backend SQL API:', err);
      });

    // These two master tables are persisted in SQL Server. Other UI catalogs
    // remain local until their dedicated backend tables are introduced.
    Promise.all([
      authFetch('/api/MasterData/shipping-lines').then((res) => res.json()),
      authFetch('/api/MasterData/materials').then((res) => res.json())
    ])
      .then(([shippingLineResponse, materialResponse]) => {
        if (isApiSuccess(shippingLineResponse) && Array.isArray(shippingLineResponse.data)) {
          setShippingLines(shippingLineResponse.data.map((line: any) => line.name || line.code));
        }
        if (isApiSuccess(materialResponse) && Array.isArray(materialResponse.data)) {
          setMasterComponents(materialResponse.data.map((material: any) => material.name || material.code));
        }
      })
      .catch((err) => console.warn('Error fetching SQL Server master data:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;

  // Helper to add audit log
  const createAuditLog = (
    role: RoleType,
    userName: string,
    action: string,
    details: string
  ): AuditLogEntry => ({
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    role,
    userName,
    action,
    details
  });

  // Action 1: Create Gate-In Job
  const createGateInJob = (
    containerNo: string,
    isoSize: ContainerSize,
    shippingLine: string,
    tareWeightKg: number,
    maxPayloadKg: number
  ): DepotJob => {
    const newId = `JOB-2026-${String(jobs.length + 101).padStart(4, '0')}`;
    const initialLocation: YardLocation = { block: 'BLOCK_Q', bay: 1, row: 1, tier: 1 };
    
    const newJob: DepotJob = {
      id: newId,
      containerNo: containerNo.toUpperCase().trim(),
      isoSize,
      shippingLine,
      tareWeightKg,
      maxPayloadKg,
      gateInDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'GATE_IN',
      currentLocation: initialLocation,
      moveHistory: [],
      auditLogs: [
        createAuditLog(
          activeRole,
          'Thủ tục Cổng Depot',
          'GATE_IN',
          `Tiếp nhận Container ${containerNo} (${isoSize}) hãng tàu ${shippingLine}`
        )
      ]
    };

    // Sync with backend API
    authFetch('/api/jobs/gate-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        containerNo,
        isoSize,
        shippingLine,
        tareWeightKg,
        maxPayloadKg
      })
    }).then((res) => res.json()).then((data) => {
      if (isApiSuccess(data) && data.data) {
        const persistedJob = normalizeJob(data.data);
        setJobs((prev) => [persistedJob, ...prev.filter((job) => job.id !== newId)]);
        setSelectedJobId(persistedJob.id);
      }
    }).catch((err) => console.warn('Failed to post gate-in job to backend API', err));

    setJobs((prev) => [newJob, ...prev]);
    setSelectedJobId(newId);
    showToast(`Tiếp nhận thành công Container ${containerNo.toUpperCase().trim()} (${isoSize}) hãng tàu ${shippingLine}!`, 'success', 'Tiếp Nhận Cổng (Gate-In)');
    return newJob;
  };

  const updateJob = (jobId: string, updates: Partial<DepotJob>) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        const updated = {
          ...job,
          ...updates,
          moveHistory: Array.isArray(updates.moveHistory) ? updates.moveHistory : (job.moveHistory || []),
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              activeRole,
              'Cập nhật hồ sơ',
              'JOB_UPDATED',
              `Cập nhật thông tin chi tiết container ${updates.containerNo || job.containerNo}`
            )
          ]
        };
        return updated;
      })
    );
    showToast('Cập nhật thông tin hồ sơ container thành công!', 'success', 'Cập Nhật Hồ Sơ');
  };

  const deleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    if (selectedJob?.id === jobId) {
      setSelectedJobId(null);
    }
    showToast('Đã xóa hồ sơ container thành công!', 'success', 'Xóa Hồ Sơ');
  };

  // Action 2: Save Survey & Receive Container Into Yard Immediately
  const saveSurvey = (
    jobId: string,
    surveyData: Partial<SurveyInfo>,
    yardLocation?: YardLocation,
    forkliftDriver?: string
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const updatedSurvey: SurveyInfo = {
          surveyorId: surveyData.surveyorId || 'NV-GD01',
          surveyorName: surveyData.surveyorName || 'Nhân viên Giám định',
          surveyDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          conditionRating: surveyData.conditionRating || 'B',
          damages: surveyData.damages || [],
          photos: surveyData.photos || [],
          generalNotes: surveyData.generalNotes || '',
          isCompleted: true
        };

        const targetLocation: YardLocation = yardLocation || job.currentLocation || {
          block: 'BLOCK_Q',
          bay: 1,
          row: 1,
          tier: 1
        };

        const newStatus: JobStatus = yardLocation ? 'YARD_STORED' : 'SURVEYED';

        let moveHistory = job.moveHistory || [];
        if (yardLocation) {
          const moveOrder: ForkliftMoveOrder = {
            id: `MOVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            jobId: job.id,
            containerNo: job.containerNo,
            forkliftId: 'FL-01',
            driverName: forkliftDriver || '',
            fromLocation: { ...job.currentLocation },
            toLocation: { ...targetLocation },
            requestedBy: updatedSurvey.surveyorName,
            requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'COMPLETED',
            purpose: 'YARD_STORAGE'
          };
          moveHistory = [...moveHistory, moveOrder];
        }

        return {
          ...job,
          status: newStatus,
          survey: updatedSurvey,
          currentLocation: targetLocation,
          moveHistory,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'SURVEYOR',
              updatedSurvey.surveyorName,
              'SURVEY_SAVED',
              yardLocation
                ? `Hoàn thành giám định & Nhận container ${job.containerNo} VÀO BÃI LƯU (Block ${targetLocation.block.replace('BLOCK_', '')}, Bay ${targetLocation.bay}-Row ${targetLocation.row}-Tier ${targetLocation.tier}).`
                : `Hoàn thành giám định hiện trạng container ${job.containerNo}. Phân loại Loại ${updatedSurvey.conditionRating}. Đã chuyển sang bộ phận Khai thác.`
            )
          ]
        };
      })
    );
    showToast('Hoàn tất lưu biên bản giám định container thành công!', 'success', 'Giám Định Vỏ Container');
  };

  // Action 3: Create Operation Service Ticket
  const createOperationTicket = (
    jobId: string,
    customer: CustomerInfo,
    services: DepotServiceItem[]
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const subtotal = services.reduce((sum, s) => sum + s.totalPrice, 0);
        const vatAmount = Math.round(subtotal * 0.08); // 8% VAT
        const totalAmount = subtotal + vatAmount;

        const idSuffix = job.id.split('-')?.[2] || job.id;
        const ticketNo = `PDV-2026-${idSuffix}`;
        const paymentNo = `PT-2026-${idSuffix}`;

        const operationInfo: OperationInfo = {
          operatorId: 'NV-KT01',
          operatorName: 'Nhân viên Khai thác',
          createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          customer,
          services,
          subtotal,
          vatAmount,
          totalAmount,
          serviceTicketNo: ticketNo
        };

        const paymentInfo: PaymentInfo = {
          paymentTicketNo: paymentNo,
          method: 'VIETQR',
          status: 'PENDING',
          amount: totalAmount,
          qrCodeUrl: ''
        };

        return {
          ...job,
          status: 'PAYMENT_PENDING',
          operation: operationInfo,
          payment: paymentInfo,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'OPERATOR',
              'Nhân viên Khai thác',
              'SERVICE_TICKET_CREATED',
              `Lập phiếu dịch vụ ${ticketNo} tổng tiền ${totalAmount.toLocaleString('vi-VN')} VNĐ`
            )
          ]
        };
      })
    );
    showToast('Tạo phiếu dịch vụ khai thác depot thành công!', 'success', 'Tạo Phiếu Khai Thác');
  };

  // Action 4: Process Payment
  const processPayment = (
    jobId: string,
    method: 'BANK_TRANSFER' | 'CASH' | 'VIETQR',
    transactionRef?: string,
    amountPaid?: number
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || !job.payment) return job;

        const isExact = !amountPaid || amountPaid === job.payment.amount;
        const newPaymentStatus = isExact ? 'PAID' : 'MISMATCHED';

        const updatedPayment: PaymentInfo = {
          ...job.payment,
          method,
          status: newPaymentStatus,
          transactionRef: transactionRef || `FT${Date.now().toString().slice(-8)}`,
          bankName: method === 'CASH' ? 'Thu Ngân Tiền Mặt' : 'Vietcombank / VietQR API',
          paidDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          cashierName: 'Hệ thống Khớp tự động / Thu ngân'
        };

        const hasDamages = (job.survey?.damages?.length || 0) > 0;
        let nextStatus: JobStatus = job.status;

        if (isExact) {
          if (hasDamages) {
            nextStatus = 'ESTIMATE_PENDING_APPROVAL';
          } else {
            nextStatus = 'YARD_STORED';
          }
        }

        return {
          ...job,
          status: nextStatus,
          payment: updatedPayment,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'ACCOUNTANT',
              'Thu Ngân / Bank API',
              'PAYMENT_CONFIRMED',
              `Thanh toán ${updatedPayment.amount.toLocaleString('vi-VN')} VNĐ thành công qua ${method}`
            )
          ]
        };
      })
    );
    showToast('Thanh toán hóa đơn dịch vụ depot thành công!', 'success', 'Thanh Toán Thành Công');
  };

  // Action 5: Create Estimate Sheet
  const createEstimate = (jobId: string, damages: DamageItem[], notes?: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const totalLaborCost = damages.reduce((sum, d) => sum + d.laborHours * d.laborRate, 0);
        const totalMaterialCost = damages.reduce((sum, d) => sum + d.materialCost, 0);
        const subtotal = totalLaborCost + totalMaterialCost;
        const vatAmount = Math.round(subtotal * 0.08);
        const grandTotal = subtotal + vatAmount;

        const estimateNo = `EST-2026-${job.id.split('-')?.[2] || job.id}`;

        const estimate: RepairEstimate = {
          estimateNo,
          estimatorName: 'Nhân viên Báo giá Depot',
          createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          damages,
          totalLaborCost,
          totalMaterialCost,
          subtotal,
          vatAmount,
          grandTotal,
          approvalStatus: 'PENDING'
        };

        return {
          ...job,
          status: 'ESTIMATE_PENDING_APPROVAL',
          estimate,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'ESTIMATOR',
              'Nhân viên Báo Giá',
              'ESTIMATE_CREATED',
              `Lập và gửi báo giá sửa chữa ${estimateNo} tổng tiền ${grandTotal.toLocaleString('vi-VN')} VNĐ cho ${job.shippingLine}`
            )
          ]
        };
      })
    );
    showToast('Lập và gửi báo giá sửa chữa thành công!', 'success', 'Báo Giá Sửa Chữa');
  };

  // Action 6: Approve Estimate by Shipping Line
  const approveEstimateByShippingLine = (jobId: string, approvedBy: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || !job.estimate) return job;

        const updatedEstimate: RepairEstimate = {
          ...job.estimate,
          approvalStatus: 'APPROVED',
          approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          approvedBy
        };

        return {
          ...job,
          status: 'ESTIMATE_APPROVED',
          estimate: updatedEstimate,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'SHIPPING_LINE',
              approvedBy,
              'ESTIMATE_APPROVED',
              `Hãng tàu ${job.shippingLine} đã phê duyệt báo giá ${job.estimate.estimateNo}`
            )
          ]
        };
      })
    );
    showToast('Hãng tàu đã phê duyệt báo giá sửa chữa thành công!', 'success', 'Phê Duyệt Báo Giá');
  };

  // Action 7: Reject Estimate by Shipping Line
  const rejectEstimateByShippingLine = (jobId: string, reason: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || !job.estimate) return job;

        const updatedEstimate: RepairEstimate = {
          ...job.estimate,
          approvalStatus: 'REJECTED',
          approvalDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          rejectionReason: reason
        };

        return {
          ...job,
          status: 'ESTIMATE_REJECTED',
          estimate: updatedEstimate,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'SHIPPING_LINE',
              'Đại diện Hãng Tàu',
              'ESTIMATE_REJECTED',
              `Hãng tàu từ chối báo giá. Lý do: ${reason}`
            )
          ]
        };
      })
    );
    showToast('Đã ghi nhận từ chối báo giá sửa chữa!', 'error', 'Từ Chối Báo Giá');
  };

  // Action 8: Assign Repair Work Order
  const assignRepairWorkOrder = (
    jobId: string,
    team: string,
    workers: string[],
    materials: { itemCode: string; itemName: string; quantity: number; unit: string }[]
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const workOrderNo = `WO-2026-${job.id.split('-')?.[2] || job.id}`;

        const repairOrder: RepairWorkOrder = {
          workOrderNo,
          repairTeam: team,
          assignedWorkers: workers,
          issuedMaterials: materials,
          startDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          preRepairPhotos: job.survey?.photos?.map((p) => p.url) || [],
          postRepairPhotos: [],
          status: 'IN_PROGRESS'
        };

        return {
          ...job,
          status: 'REPAIRING',
          repairOrder,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'REPAIR_TECH',
              'Quản lý Đội Sửa Chữa',
              'REPAIR_WORK_ORDER_ASSIGNED',
              `Phân công lệnh sửa chữa ${workOrderNo} cho ${team} (${workers.join(', ')})`
            )
          ]
        };
      })
    );
    showToast('Phân công lệnh sửa chữa cho đội kỹ thuật thành công!', 'success', 'Phân Công Sửa Chữa');
  };

  // Action 9: Complete Repair Work Order
  const completeRepairWorkOrder = (jobId: string, postPhotos: string[]) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId || !job.repairOrder) return job;

        const updatedRepairOrder: RepairWorkOrder = {
          ...job.repairOrder,
          status: 'COMPLETED',
          completedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          postRepairPhotos: postPhotos
        };

        const initialQC: QCInspection = {
          inspectorName: '',
          result: 'PENDING',
          checklist: [
            { item: 'Kiểm tra độ kín nước/ánh sáng (Light-tightness)', passed: true },
            { item: 'Kiểm tra độ phẳng mạ hàn vách', passed: true },
            { item: 'Sơn phủ chống rỉ đạt màu sơn hãng tàu', passed: true },
            { item: 'Vệ sinh dọn dẹp phoi mạt trong lòng hòm', passed: true }
          ]
        };

        return {
          ...job,
          status: 'QC_PENDING',
          repairOrder: updatedRepairOrder,
          qcInspection: initialQC,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'REPAIR_TECH',
              job.repairOrder.repairTeam,
              'REPAIR_COMPLETED',
              `Hoàn tất sửa chữa container. Chuyển sang chờ kiểm tra QC.`
            )
          ]
        };
      })
    );
    showToast('Báo cáo hoàn thành sửa chữa container thành công!', 'success', 'Hoàn Thành Sửa Chữa');
  };

  // Action 10: Record QC Result
  const recordQCResult = (
    jobId: string,
    result: 'PASSED' | 'FAILED',
    checklist: { item: string; passed: boolean; note?: string }[],
    comments?: string
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const qc: QCInspection = {
          inspectorName: '',
          inspectionDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          result,
          checklist,
          comments
        };

        const newStatus: JobStatus = result === 'PASSED' ? 'YARD_STORED' : 'QC_FAILED';

        return {
          ...job,
          status: newStatus,
          qcInspection: qc,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'QC_INSPECTOR',
              qc.inspectorName,
              result === 'PASSED' ? 'QC_PASSED' : 'QC_FAILED',
              `Kết quả kiểm tra chất lượng (QC): ${result === 'PASSED' ? 'ĐẠT tiêu chuẩn' : 'KHÔNG ĐẠT - Yêu cầu làm lại'}`
            )
          ]
        };
      })
    );
    if (result === 'PASSED') {
      showToast('Nghiệm thu chất lượng QC ĐẠT tiêu chuẩn thành công!', 'success', 'QC Đạt');
    } else {
      showToast('Chất lượng KHÔNG ĐẠT nghiệm thu QC, chuyển container sửa chữa lại!', 'error', 'QC Không Đạt');
    }
  };

  // Action 11: Create Forklift Move Order
  const createForkliftMove = (
    jobId: string,
    toLocation: YardLocation,
    forkliftId: string,
    purpose: ForkliftMoveOrder['purpose']
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const forklift = forklifts.find((f) => f.id === forkliftId);

        const moveOrder: ForkliftMoveOrder = {
          id: `MOV-${Date.now().toString().slice(-6)}`,
          jobId,
          containerNo: job.containerNo,
          fromLocation: { ...job.currentLocation },
          toLocation,
          forkliftId,
          driverName: forklift?.driver || '',
          requestedBy: 'Điều hành bãi Depot',
          requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'PENDING',
          purpose
        };

        return {
          ...job,
          moveHistory: [moveOrder, ...(job.moveHistory || [])],
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'FORKLIFT_DRIVER',
              'Điều hành bãi',
              'FORKLIFT_MOVE_REQUESTED',
              `Phát lệnh xe nâng ${forklift.name} di chuyển container sang Block ${toLocation.block} Bay ${toLocation.bay}`
            )
          ]
        };
      })
    );
    showToast('Phát lệnh di chuyển xe nâng thành công!', 'success', 'Lệnh Xe Nâng');
  };

  // Action 12: Complete Forklift Move Order
  const completeForkliftMove = (moveId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        const moveHistory = Array.isArray(job.moveHistory) ? job.moveHistory : [];
        const moveIndex = moveHistory.findIndex((m) => m.id === moveId);
        if (moveIndex === -1) return job;

        const targetMove = moveHistory[moveIndex];
        const updatedMoveHistory = [...moveHistory];
        updatedMoveHistory[moveIndex] = {
          ...targetMove,
          status: 'COMPLETED',
          completedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        return {
          ...job,
          currentLocation: targetMove.toLocation,
          moveHistory: updatedMoveHistory,
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'FORKLIFT_DRIVER',
              targetMove.driverName,
              'FORKLIFT_MOVED',
              `Tài xế ${targetMove.driverName} đã hoàn tất hạ container vào vị trí Block ${targetMove.toLocation.block} - Bay ${targetMove.toLocation.bay} - Row ${targetMove.toLocation.row} - Tier ${targetMove.toLocation.tier}`
            )
          ]
        };
      })
    );
    showToast('Tài xế xe nâng đã hoàn tất hạ container vào bãi!', 'success', 'Hạ Container Bãi');
  };

  // Action 13: Process Gate Out
  const processGateOut = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        return {
          ...job,
          status: 'GATE_OUT',
          gateOutDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          auditLogs: [
            ...(job.auditLogs || []),
            createAuditLog(
              'OPERATOR',
              'Thủ tục Cổng Depot',
              'GATE_OUT',
              `Xác nhận Container ${job.containerNo} đã xuất khỏi Depot`
            )
          ]
        };
      })
    );
    showToast('Thủ tục xuất cổng (Gate-Out) hoàn tất thành công!', 'success', 'Xuất Cổng Thành Công');
  };

  // Action 14: Reset data by re-fetching from Backend SQL API
  const resetToDefaultData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    authFetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (isApiSuccess(data) && Array.isArray(data.data)) {
          setJobs(data.data.map(normalizeJob));
        } else {
          setJobs([]);
        }
        showToast('Đã khôi phục dữ liệu ban đầu thành công!', 'success', 'Khôi Phục Dữ Liệu');
      })
      .catch(() => {
        setJobs([]);
        showToast('Đã khôi phục dữ liệu ban đầu!', 'info', 'Khôi Phục Dữ Liệu');
      });
  };

  return (
    <DepotContext.Provider
      value={{
        jobs,
        shippingLines,
        damageCodes,
        masterComponents,
        tariffs,
        forklifts,
        activeRole,
        setActiveRole: (role) => {
          setActiveRole(role);
          showToast(`Đã chuyển sang vai trò: ${USER_ACCOUNT_PROFILES.find((u) => u.role === role)?.badgeText || role}`, 'info', 'Đổi Vai Trò');
        },
        userProfiles,
        loggedInUserProfile,
        setLoggedInUserProfile,
        updateRoleTabs,
        addUserAccount,
        resetPermissionsToDefault,
        selectedJob,
        setSelectedJobId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        shippingLineFilter,
        setShippingLineFilter,
        toasts,
        showToast,
        removeToast,
        createGateInJob,
        updateJob,
        deleteJob,
        saveSurvey,
        createOperationTicket,
        processPayment,
        createEstimate,
        approveEstimateByShippingLine,
        rejectEstimateByShippingLine,
        assignRepairWorkOrder,
        completeRepairWorkOrder,
        recordQCResult,
        createForkliftMove,
        completeForkliftMove,
        processGateOut,
        resetToDefaultData
      }}
    >
      {children}

      {/* Global Floating Popup Toast Container */}
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto transition-all duration-300 transform scale-100 hover:scale-[1.02] rounded-2xl p-4 flex items-start gap-3.5 shadow-2xl backdrop-blur-2xl border-2 ${
              toast.type === 'success'
                ? 'bg-slate-900/98 border-emerald-500 text-white shadow-emerald-500/20 ring-1 ring-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-slate-900/98 border-rose-500 text-white shadow-rose-500/20 ring-1 ring-rose-500/50'
                : 'bg-slate-900/98 border-blue-500 text-white shadow-blue-500/20 ring-1 ring-blue-500/50'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/80 text-rose-400'
                  : 'bg-blue-950/90 border-blue-500/80 text-blue-400'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 animate-bounce" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    toast.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : toast.type === 'error'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {toast.type === 'success' ? 'Thành công' : toast.type === 'error' ? 'Thất bại' : 'Thông báo'}
                </span>
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    toast.type === 'success'
                      ? 'text-emerald-400'
                      : toast.type === 'error'
                      ? 'text-rose-400'
                      : 'text-blue-400'
                  }`}
                >
                  {toast.title}
                </h4>
              </div>
              <p className="text-xs text-slate-100 mt-1.5 leading-relaxed font-semibold">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </DepotContext.Provider>
  );
};

export const useDepot = () => {
  const context = useContext(DepotContext);
  if (!context) {
    throw new Error('useDepot must be used within a DepotProvider');
  }
  return context;
};
