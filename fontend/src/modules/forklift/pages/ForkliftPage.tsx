import React, { useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { yardApi } from '../../../api';
import { ForkliftJob, ForkliftOperator, ForkliftVehicle, YardCoordinate, ForkliftHistoryRecord } from '../types';
import { useDepot } from '../../../context/DepotContext';
import { ForkliftJobCard } from '../components/ForkliftJobCard';
import { ConfirmDropModal } from '../components/ConfirmDropModal';
import { CreateManualForkliftJobModal } from '../components/CreateManualForkliftJobModal';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Search, 
  Filter, 
  Layers, 
  Navigation, 
  UserCheck, 
  RefreshCw, 
  AlertCircle,
  Flame,
  CheckCircle,
  FileSpreadsheet,
  Grid,
  Plus,
  ArrowRight,
  Wrench,
  Droplets
} from 'lucide-react';

interface ForkliftPageProps {
  containers: ContainerRecord[];
  onConfirmMove: (containerId: string, block: string, bay: string, row: string, tier: string) => void;
  onNavigateTab: (tabId: string) => void;
  onRefreshContainer?: (id: string) => void;
}

export const ForkliftPage: React.FC<ForkliftPageProps> = ({
  containers,
  onConfirmMove,
  onNavigateTab,
  onRefreshContainer
}) => {
  // Tài xế = tài khoản đang đăng nhập thật (trước đây chọn từ danh sách tài xế mẫu). Chưa có danh mục xe
  // nâng ở backend nên mã xe nâng do tài xế tự nhập.
  const { loggedInUserProfile } = useDepot();
  const activeOperator = useMemo<ForkliftOperator>(() => ({
    id: loggedInUserProfile ? String(loggedInUserProfile.id) : '',
    name: loggedInUserProfile?.fullName || loggedInUserProfile?.username || '',
    badgeNo: loggedInUserProfile?.username || '',
    grade: '', phone: '', shift: ''
  }), [loggedInUserProfile]);
  const [vehicleCode, setVehicleCode] = useState('');
  const activeVehicle = useMemo<ForkliftVehicle>(() => ({
    id: vehicleCode, code: vehicleCode, name: vehicleCode, type: 'REACH_STACKER',
    capacityTon: 0, assignedArea: '', fuelLevel: 0, status: 'ACTIVE'
  }), [vehicleCode]);

  // Main navigation tab within forklift module
  const [viewTab, setViewTab] = useState<'QUEUE' | 'MY_JOBS' | 'HISTORY'>('QUEUE');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [filterSize, setFilterSize] = useState<string>('ALL');

  // History records
  const [historyList, setHistoryList] = useState<ForkliftHistoryRecord[]>([]);

  // Modals state
  const [dropModalJob, setDropModalJob] = useState<ForkliftJob | null>(null);
  const [isCreateManualModalOpen, setIsCreateManualModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Jobs are derived from backend-loaded containers; no bundled queue data.
  const [jobs, setJobs] = useState<ForkliftJob[]>([]);

  // Dynamically sync containers from App state according to the full depot lifecycle:
  // 1. PAYMENT_SUCCESS / CLEANING FINISHED -> From Cleaning Bay to Yard Block
  // 2. REPAIRING / APPROVED -> From Yard to Repair Workshop
  // 3. READY_FOR_USE / WAITING_QC -> From Repair Workshop back to Yard Block
  //
  // Đọc đúng trạng thái "đã nhận lệnh" THẬT từ backend (cont.forkliftClaim, xem DepotJob.ForkliftClaimed*)
  // khi lần đầu phát hiện job — trước đây LUÔN khởi tạo status: 'WAITING' bất kể thực tế, vì việc "nhận
  // lệnh" hoàn toàn cục bộ trên trình duyệt. Giờ nếu container đã được 1 tài xế (trên tablet khác) nhận
  // từ trước, tablet này mở lên cũng phải thấy đúng CLAIMED/IN_PROGRESS, không hiện lại WAITING cho nhận trùng.
  const buildClaimFields = (cont: ContainerRecord) => {
    const claim = cont.forkliftClaim;
    if (!claim) return {} as Partial<ForkliftJob>;
    return {
      status: (claim.startedAt ? 'IN_PROGRESS' : 'CLAIMED') as ForkliftJob['status'],
      claimedByOperatorId: claim.operatorId,
      claimedByOperatorName: claim.operatorName,
      assignedForkliftId: claim.vehicleCode,
      assignedForkliftCode: claim.vehicleCode,
      claimedAt: claim.claimedAt,
      startedAt: claim.startedAt
    };
  };

  // Mốc thời gian gần nhất của 1 bước trong nhật ký hồ sơ (JobAuditLog thật từ DB); 0 nếu chưa có.
  const lastStepAt = (cont: ContainerRecord, action: string) =>
    (cont.timeline || [])
      .filter((t) => t.status === action)
      .reduce((max, t) => Math.max(max, Date.parse(t.time) || 0), 0);

  React.useEffect(() => {
    containers.forEach((cont) => {
      // Check if job already exists
      const existingJob = jobs.find((j) => j.containerNo === cont.containerNo || j.containerId === cont.id);

      // Bỏ qua job đã COMPLETED/CANCELLED cục bộ — 1 container có thể phát sinh nhiều lệnh xe nâng kế
      // tiếp nhau trong vòng đời (Vệ sinh->Bãi, rồi sau đó Bãi->Xưởng sửa...), lệnh cũ giữ nguyên để hiện
      // đúng lịch sử, không đồng bộ ngược claim fields (đã bị backend xoá sau khi hoàn tất) đè lên nó.
      if (existingJob && existingJob.status !== 'COMPLETED' && existingJob.status !== 'CANCELLED') {
        // Đồng bộ lại trạng thái nhận lệnh THẬT mỗi khi `containers` refresh (sau khi tablet này gọi
        // onRefreshContainer, kể cả lúc chính mình bị 409 từ chối) — trước đây job đã tồn tại trong state
        // cục bộ thì KHÔNG BAO GIỜ được cập nhật lại claim fields nữa, khiến hàng đợi hiện sai (WAITING)
        // dù backend đã có người khác nhận, cho tới khi F5 lại trang.
        const freshClaim = buildClaimFields(cont);
        const claimChanged = existingJob.claimedByOperatorId !== freshClaim.claimedByOperatorId
          || existingJob.startedAt !== freshClaim.startedAt;
        if (claimChanged) {
          setJobs((prev) => prev.map((j) => (j.id === existingJob.id ? {
            ...j,
            status: freshClaim.status ?? 'WAITING',
            claimedByOperatorId: freshClaim.claimedByOperatorId,
            claimedByOperatorName: freshClaim.claimedByOperatorName,
            assignedForkliftId: freshClaim.assignedForkliftId,
            assignedForkliftCode: freshClaim.assignedForkliftCode,
            claimedAt: freshClaim.claimedAt,
            startedAt: freshClaim.startedAt
          } : j)));
        }
      }

      if (!existingJob) {
        // Case 1: Tổ Vệ Sinh đã bàn giao (CLEANING_HANDOVER) nhưng chưa hạ bãi → container đang nằm ở KHU VỆ SINH,
        // xe nâng đưa vào bãi. Trước đây điều kiện là status PAYMENT_SUCCESS/WAITING_FORKLIFT — 2 trạng thái
        // backend không bao giờ đặt, nên container vệ sinh xong không bao giờ hiện ở màn Xe nâng.
        const handoverAt = lastStepAt(cont, 'CLEANING_HANDOVER');
        const movedAt = lastStepAt(cont, 'FORKLIFT_MOVE_COMPLETED');
        const qcPassedAt = lastStepAt(cont, 'QC_PASSED');
        const inCleaningArea = handoverAt > 0 && movedAt < handoverAt && !cont.yardLocation
          && cont.status !== 'GATE_OUT' && cont.status !== 'CLEANING';
        if (inCleaningArea) {
          const fromLoc = 'KHU VỆ SINH';
          const handoverLog = (cont.timeline || []).filter((t) => t.status === 'CLEANING_HANDOVER').pop();
          
          const newJob: ForkliftJob = {
            id: `FL-${cont.id}-TO_YARD`,
            jobNo: `JOB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
            containerId: cont.id,
            containerNo: cont.containerNo,
            isoCode: cont.isoCode || '',
            size: cont.size,
            shippingLine: cont.shippingLine,
            condition: cont.condition,
            cargoStatus: 'EMPTY',
            fromLocation: fromLoc,
            plannedLocation: cont.yardLocation ? { block: cont.yardLocation.block, bay: cont.yardLocation.bay, row: cont.yardLocation.row, tier: cont.yardLocation.tier } : { block: '', bay: '', row: '', tier: '' },
            status: 'WAITING',
            priority: 'HIGH',
            // Định dạng "yyyy-mm-dd hh:mm" giờ địa phương (thẻ lệnh cắt ký tự 11-16 để hiện giờ).
            waitingSince: new Date(handoverAt - new Date(handoverAt).getTimezoneOffset() * 60000).toISOString().replace('T', ' ').substring(0, 16),
            waitingDurationMinutes: Math.max(0, Math.round((Date.now() - handoverAt) / 60000)),
            operationNote: `Vệ sinh xong${handoverLog?.actor ? ` (bàn giao: ${handoverLog.actor})` : ''} — xe nâng lấy container tại KHU VỆ SINH đưa vào bãi lưu trữ.`,
            ...buildClaimFields(cont)
          };
          // Không thêm trùng: effect có thể chạy lại trước khi state cập nhật (đọc `jobs` cũ).
          setJobs((prev) => (prev.some((j) => j.id === newJob.id) ? prev : [newJob, ...prev]));
        } else if (cont.status === 'REPAIRING' || cont.status === 'APPROVED') {
          // Case 2: Repair initiated -> Move from Yard to Repair Area
          const fromLoc = cont.yardLocation 
            ? `BÃI BLOCK ${cont.yardLocation.block}-${cont.yardLocation.bay}-${cont.yardLocation.row}`
            : 'BÃI (chưa ghi nhận vị trí)';

          const newJob: ForkliftJob = {
            id: `FL-${cont.id}-TO_REPAIR`,
            jobNo: `JOB-EMR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
            containerId: cont.id,
            containerNo: cont.containerNo,
            isoCode: cont.isoCode || '',
            size: cont.size,
            shippingLine: cont.shippingLine,
            condition: 'DM',
            cargoStatus: 'EMPTY',
            fromLocation: fromLoc,
            plannedLocation: cont.yardLocation ? { block: cont.yardLocation.block, bay: cont.yardLocation.bay, row: cont.yardLocation.row, tier: cont.yardLocation.tier } : { block: '', bay: '', row: '', tier: '' },
            status: 'WAITING',
            priority: 'URGENT',
            waitingSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
            waitingDurationMinutes: 0,
            operationNote: 'Nhận sửa chữa: Xe nâng lấy từ bãi đưa về XƯỞNG SỬA CHỮA (EMR Bay).',
            ...buildClaimFields(cont)
          };
          // Không thêm trùng: effect có thể chạy lại trước khi state cập nhật (đọc `jobs` cũ).
          setJobs((prev) => (prev.some((j) => j.id === newJob.id) ? prev : [newJob, ...prev]));
        } else if (cont.status === 'READY_FOR_OUT' && qcPassedAt > 0 && movedAt < qcPassedAt) {
          // Chỉ container vừa QC đạt sau sửa chữa (chưa hạ bãi lại) — trước đây mọi container READY_FOR_OUT
          // (kể cả container sạch vừa vệ sinh, đã nằm trong bãi) đều sinh lệnh "từ xưởng sửa chữa" bịa.
          // Backend thật (CompleteQcInspectionAsync) đặt "READY_FOR_OUT" khi QC ĐẠT, không có
          // "READY_FOR_USE" nào cả — App.tsx trước đây tự bịa giá trị này nên điều kiện dưới đây từng
          // khớp; giờ App.tsx đọc lại đúng dữ liệu thật từ Postgres nên phải sửa theo cho khớp.
          // Case 3: Sửa chữa & QC hoàn tất -> Xe nâng lấy từ Xưởng sửa chữa đặt lại vào bãi
          const newJob: ForkliftJob = {
            id: `FL-${cont.id}-AFTER_QC`,
            jobNo: `JOB-QC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
            containerId: cont.id,
            containerNo: cont.containerNo,
            isoCode: cont.isoCode || '',
            size: cont.size,
            shippingLine: cont.shippingLine,
            condition: 'AV',
            cargoStatus: 'EMPTY',
            fromLocation: 'XƯỞNG SỬA CHỮA CONTAINER (EMR BAY)',
            plannedLocation: cont.yardLocation ? { block: cont.yardLocation.block, bay: cont.yardLocation.bay, row: cont.yardLocation.row, tier: cont.yardLocation.tier } : { block: '', bay: '', row: '', tier: '' },
            status: 'WAITING',
            priority: 'HIGH',
            waitingSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
            waitingDurationMinutes: 0,
            operationNote: 'Sửa chữa xong: Xe nâng lại khu sửa chữa lấy container đặt vào vị trí bãi.',
            ...buildClaimFields(cont)
          };
          // Không thêm trùng: effect có thể chạy lại trước khi state cập nhật (đọc `jobs` cũ).
          setJobs((prev) => (prev.some((j) => j.id === newJob.id) ? prev : [newJob, ...prev]));
        }
      }
    });
  }, [containers, jobs]);

  // =========================================================================
  // CORE BUSINESS LOGIC 1: CLAIM CONTAINER (ATOMIC LOCKING)
  // =========================================================================
  // Trước đây "nhận lệnh" chỉ là setJobs() cục bộ trên trình duyệt — mỗi tablet giữ 1 bản state React
  // riêng, không đồng bộ với ai cả. 2 tài xế mở 2 tablet khác nhau CÙNG bấm nhận 1 container thì CẢ HAI
  // đều thấy "thành công" (mỗi tablet tự khóa trên state của chính nó), dẫn tới 2 xe nâng cùng đi lấy 1
  // container. Giờ gọi thật API DepotJobs/{id}/forklift/claim — backend dùng ExecuteUpdateAsync có điều
  // kiện WHERE (xem ClaimForkliftJobAsync) để chỉ đúng 1 request thắng cuộc, y hệt pattern đã áp dụng cho
  // ClaimSurveyAsync.
  const handleAttemptClaim = async (
    jobId: string,
    operator: ForkliftOperator,
    vehicle: ForkliftVehicle
  ): Promise<{ success: boolean; message: string }> => {
    const targetJob = jobs.find((j) => j.id === jobId);

    if (!targetJob) {
      return { success: false, message: 'Lệnh không tồn tại trên hệ thống.' };
    }

    try {
      const response: any = await yardApi.claimForkliftJob(targetJob.containerId, operator.id, operator.name, vehicle.code);
      if (response?.statusCode !== 200) {
        // Bị từ chối vì tài xế khác (trên tablet khác) đã nhận trước — đồng bộ lại ngay để hàng đợi cục
        // bộ hiện đúng trạng thái CLAIMED thật, tránh việc bấm nhận lại nhiều lần vô ích trên container
        // đã có người giữ (trước đây chỉ báo lỗi qua toast, thẻ container vẫn hiện WAITING mãi tới khi
        // F5 lại trang).
        onRefreshContainer?.(targetJob.containerId);
        return { success: false, message: response?.message || 'Không thể nhận lệnh xe nâng.' };
      }
    } catch (error: any) {
      onRefreshContainer?.(targetJob.containerId);
      const message = error?.response?.data?.data || error?.response?.data?.message
        || (error instanceof Error ? error.message : 'Không thể nhận lệnh xe nâng.');
      return { success: false, message };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'CLAIMED',
            claimedByOperatorId: operator.id,
            claimedByOperatorName: operator.name,
            assignedForkliftId: vehicle.id,
            assignedForkliftCode: vehicle.code,
            claimedAt: now
          };
        }
        return j;
      })
    );
    onRefreshContainer?.(targetJob.containerId);

    return {
      success: true,
      message: `Đã khóa và nhận lệnh thành công cho Container ${targetJob.containerNo}.`
    };
  };

  const handleClaimJob = async (job: ForkliftJob) => {
    if (!activeOperator.id) {
      showToast('Không xác định được tài xế đang đăng nhập — đăng nhập lại.', 'error');
      return;
    }
    if (!vehicleCode.trim()) {
      showToast('Nhập mã xe nâng trước khi nhận lệnh.', 'error');
      return;
    }
    const result = await handleAttemptClaim(job.id, activeOperator, activeVehicle);
    if (result.success) {
      showToast(`[ĐÃ KHÓA CONTAINER] Tài xế ${activeOperator.name} (${activeVehicle.code}) đã nhận Container ${job.containerNo}!`, 'success');
      setViewTab('MY_JOBS');
    } else {
      showToast(result.message, 'error');
    }
  };

  // =========================================================================
  // CORE BUSINESS LOGIC 2: START EXECUTION
  // =========================================================================
  const handleStartExecution = async (job: ForkliftJob) => {
    if (job.claimedByOperatorId !== activeOperator.id) {
      showToast('Bạn không thể thao tác trên container do người khác đang xử lý!', 'error');
      return;
    }

    try {
      const response: any = await yardApi.startForkliftExecution(job.containerId, activeOperator.id);
      if (response?.statusCode !== 200) {
        showToast(response?.message || 'Không thể bắt đầu thực hiện.', 'error');
        return;
      }
    } catch (error: any) {
      const message = error?.response?.data?.data || error?.response?.data?.message
        || (error instanceof Error ? error.message : 'Không thể bắt đầu thực hiện.');
      showToast(message, 'error');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          return {
            ...j,
            status: 'IN_PROGRESS',
            startedAt: now
          };
        }
        return j;
      })
    );
    onRefreshContainer?.(job.containerId);
    showToast(`Đang thực hiện cẩu gắp Container ${job.containerNo} từ "${job.fromLocation}"`, 'warning');
  };

  // =========================================================================
  // CORE BUSINESS LOGIC 3: CANCEL CLAIM
  // =========================================================================
  const handleCancelClaim = async (job: ForkliftJob) => {
    if (job.claimedByOperatorId !== activeOperator.id) {
      showToast('Bạn chỉ có thể hủy lệnh do chính mình đã nhận!', 'error');
      return;
    }

    try {
      const response: any = await yardApi.cancelForkliftClaim(job.containerId, activeOperator.id);
      if (response?.statusCode !== 200) {
        showToast(response?.message || 'Không thể hủy nhận lệnh.', 'error');
        return;
      }
    } catch (error: any) {
      const message = error?.response?.data?.data || error?.response?.data?.message
        || (error instanceof Error ? error.message : 'Không thể hủy nhận lệnh.');
      showToast(message, 'error');
      return;
    }

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === job.id) {
          return {
            ...j,
            status: 'WAITING',
            claimedByOperatorId: undefined,
            claimedByOperatorName: undefined,
            assignedForkliftId: undefined,
            assignedForkliftCode: undefined,
            claimedAt: undefined,
            startedAt: undefined
          };
        }
        return j;
      })
    );
    onRefreshContainer?.(job.containerId);
    showToast(`Đã hủy nhận lệnh cho Container ${job.containerNo}. Container quay lại hàng đợi chờ.`, 'warning');
  };

  // =========================================================================
  // CORE BUSINESS LOGIC 4: CONFIRM DROP & UPDATE ACTUAL LOCATION
  // =========================================================================
  const handleConfirmDrop = async (
    actualLocation: YardCoordinate,
    isDeviated: boolean,
    deviationReason?: string,
    driverNote?: string
  ) => {
    if (!dropModalJob) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetJob = dropModalJob;

    try {
      const response: any = await yardApi.forkliftMove(
        targetJob.containerId,
        actualLocation.block,
        Number(actualLocation.bay),
        Number(actualLocation.row),
        Number(actualLocation.tier),
        targetJob.claimedByOperatorName || activeOperator.name,
        targetJob.assignedForkliftCode || activeVehicle.code
      );
      if (response?.statusCode !== 200) throw new Error(response?.message || 'Backend không xác nhận được hạ bãi.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu hạ bãi vào backend.', 'error');
      return;
    }

    // 1. Update job in local list
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === targetJob.id) {
          return {
            ...j,
            status: 'COMPLETED',
            actualLocation,
            isLocationDeviated: isDeviated,
            deviationReason,
            driverNote,
            completedAt: now
          };
        }
        return j;
      })
    );

    // 2. Call Parent Handler to update Yard 2D and Container State
    onConfirmMove(
      targetJob.containerId,
      actualLocation.block,
      actualLocation.bay,
      actualLocation.row,
      actualLocation.tier
    );

    // 3. Append to History Audit Log
    const newHistoryItem: ForkliftHistoryRecord = {
      id: `HIST-${Date.now().toString().slice(-4)}`,
      jobNo: targetJob.jobNo,
      containerNo: targetJob.containerNo,
      size: targetJob.size,
      shippingLine: targetJob.shippingLine,
      condition: targetJob.condition,
      forkliftCode: targetJob.assignedForkliftCode || activeVehicle.code,
      operatorName: targetJob.claimedByOperatorName || activeOperator.name,
      fromLocation: targetJob.fromLocation,
      plannedLocation: `BLOCK ${targetJob.plannedLocation.block} - BAY ${targetJob.plannedLocation.bay} - ROW ${targetJob.plannedLocation.row} - TIER ${targetJob.plannedLocation.tier}`,
      actualLocation: `BLOCK ${actualLocation.block} - BAY ${actualLocation.bay} - ROW ${actualLocation.row} - TIER ${actualLocation.tier}`,
      isDeviated,
      claimedAt: targetJob.claimedAt || now,
      startedAt: targetJob.startedAt || now,
      completedAt: now,
      durationMinutes: 8,
      status: 'COMPLETED',
      note: isDeviated ? `Lệch tọa độ: ${deviationReason}` : driverNote || 'Tài xế tự chọn vị trí hạ và xác nhận vào hệ thống.'
    };

    setHistoryList((prev) => [newHistoryItem, ...prev]);
    setDropModalJob(null);

    showToast(
      `[HẠ BÃI THÀNH CÔNG] Đã lưu Container ${targetJob.containerNo} tại BLOCK ${actualLocation.block} - BAY ${actualLocation.bay} - ROW ${actualLocation.row} - TIER ${actualLocation.tier}! Sơ đồ Yard 2D đã cập nhật.`,
      'success'
    );
  };

  // Handler when a manual job is created
  const handleCreateManualJob = (newJob: ForkliftJob) => {
    setJobs((prev) => [newJob, ...prev]);
    showToast(`Đã tạo lệnh điều xe nâng thành công cho Container ${newJob.containerNo}!`, 'success');
  };

  // Filtered list
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Tab check
      if (viewTab === 'MY_JOBS') {
        if (j.claimedByOperatorId !== activeOperator.id) return false;
      }

      // Search
      if (
        searchTerm &&
        !j.containerNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !j.shippingLine.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !j.fromLocation.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Condition filter
      if (filterCondition !== 'ALL' && j.condition !== filterCondition) {
        return false;
      }

      // Block filter
      if (filterBlock !== 'ALL' && j.plannedLocation.block !== filterBlock) {
        return false;
      }

      // Size filter
      if (filterSize !== 'ALL') {
        if (filterSize === '20' && !j.size.includes('20')) return false;
        if (filterSize === '40' && !j.size.includes('40')) return false;
      }

      return true;
    });
  }, [jobs, viewTab, activeOperator.id, searchTerm, filterCondition, filterBlock, filterSize]);

  // Summary counts
  const countWaiting = jobs.filter((j) => j.status === 'WAITING').length;
  const countMyActive = jobs.filter(
    (j) => j.claimedByOperatorId === activeOperator.id && (j.status === 'CLAIMED' || j.status === 'IN_PROGRESS')
  ).length;
  const countCompletedToday = historyList.filter((h) => h.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-500 text-rose-200'
              : 'bg-amber-50 border-amber-500 text-amber-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: TABLET COCKPIT & OPERATOR PROFILE SWITCHER */}
      {/* ========================================================================= */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-2xl">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200 text-[11px] font-bold">
                  ĐIỀU ĐỘ XE NÂNG (FORKLIFT DISPATCH)
                </span>
                <span className="text-xs text-slate-500 font-mono">Tự Động &amp; Tạo Lệnh Thủ Công</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Màn Hình Tablet Tài Xế Xe Nâng &amp; Luân Chuyển Bãi Depot
              </h2>
            </div>
          </div>

          {/* Quick Action Navigation & Create Job */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCreateManualModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo Lệnh Xe Nâng</span>
            </button>

            <button
              onClick={() => onNavigateTab('yard_map')}
              className="px-3.5 py-2 bg-teal-50 hover:bg-teal-50 text-teal-700 font-bold text-xs rounded-xl border border-teal-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-teal-600" />
              <span>Sơ Đồ Bãi Yard 2D</span>
            </button>
          </div>
        </div>

        {/* Dynamic Vòng Đời Guide Banner */}
        <div className="p-3.5 bg-[#070d1f] rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 shrink-0">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-cyan-700">1. Vệ sinh &amp; Thanh toán:</span>
              <p className="text-[11px] text-slate-500">Lấy từ khu Vệ Sinh → Đưa vào Bãi lưu trữ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-rose-700">2. Sửa chữa Work Order:</span>
              <p className="text-[11px] text-slate-500">Lấy từ Bãi → Đưa về Xưởng sửa chữa (EMR)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-emerald-700">3. Sửa xong &amp; QC đạt:</span>
              <p className="text-[11px] text-slate-500">Lấy từ Xưởng sửa chữa → Đặt vị trí bãi (Tự chọn vị trí)</p>
            </div>
          </div>
        </div>

        {/* Profile Switcher: Operator & Vehicle Simulator Bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Operator selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Tài Xế Đang Đăng Nhập:</span>
              </span>
              <span className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-900 rounded-xl">
                {activeOperator.name || 'Chưa đăng nhập'}
              </span>
            </div>

            {/* Forklift Vehicle selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-cyan-600" />
                <span>Xe Nâng:</span>
              </span>
              <input
                type="text"
                value={vehicleCode}
                onChange={(e) => setVehicleCode(e.target.value.toUpperCase())}
                placeholder="Mã xe nâng (vd RS-02)"
                className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold text-cyan-700 rounded-xl focus:outline-none font-mono w-40"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-600 font-bold">KẾT NỐI ONLINE SÓNG DEPOT GPS/WIFI</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATS & METRICS OVERVIEW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setViewTab('QUEUE')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            viewTab === 'QUEUE'
              ? 'bg-amber-50 border-amber-500 shadow-lg  ring-1 ring-amber-500/40'
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              1. Hàng Đợi Chờ Hạ Bãi (Waiting)
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {countWaiting} <span className="text-xs font-normal text-slate-500">Container</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tất cả xe nâng tự do nhận lệnh</div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl font-black text-lg">
            {countWaiting}
          </div>
        </div>

        <div
          onClick={() => setViewTab('MY_JOBS')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            viewTab === 'MY_JOBS'
              ? 'bg-purple-50 border-purple-500 shadow-lg  ring-1 ring-purple-500/40'
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              2. Công Việc Của Tôi (My Active)
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {countMyActive} <span className="text-xs font-normal text-slate-500">Container</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Tài xế {activeOperator.name?.split(' ').slice(-2).join(' ') || activeOperator.name || ''} đã nhận
            </div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-2xl font-black text-lg">
            {countMyActive}
          </div>
        </div>

        <div
          onClick={() => setViewTab('HISTORY')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            viewTab === 'HISTORY'
              ? 'bg-emerald-50 border-emerald-500 shadow-lg  ring-1 ring-emerald-500/40'
              : 'bg-white border-slate-200 hover:border-slate-200'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              3. Lịch Sử Đã Hạ Bãi (Completed)
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {countCompletedToday} <span className="text-xs font-normal text-slate-500">Lượt</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Đã cập nhật tọa độ Yard 2D</div>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl font-black text-lg">
            {countCompletedToday}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setViewTab('QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'QUEUE'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Hàng Đợi Chờ Hạ ({countWaiting})
          </button>
          <button
            onClick={() => setViewTab('MY_JOBS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'MY_JOBS'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Việc Của Tôi ({countMyActive})
          </button>
          <button
            onClick={() => setViewTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'HISTORY'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Lịch Sử Hạ Bãi ({historyList.length})
          </button>
        </div>

        {/* Filters */}
        {viewTab !== 'HISTORY' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã Container, Hãng tàu, Nơi lấy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-orange-500 w-52"
              />
            </div>

            {/* Condition */}
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả Phân Loại</option>
              <option value="AV">AV (Sẵn sàng)</option>
              <option value="CL">CL (Vệ sinh)</option>
              <option value="DM">DM (Hư hỏng EMR)</option>
            </select>

            {/* Block */}
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả Block Bãi</option>
              {Array.from(new Set(jobs.map((j) => j.plannedLocation?.block).filter(Boolean))).sort().map((b) => (
                <option key={b} value={b}>{String(b).replace('BLOCK_', 'Block ')}</option>
              ))}
            </select>

            {/* Size */}
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả Kích Thước</option>
              <option value="20">20 Feet (1.0 TEU)</option>
              <option value="40">40 / 45 Feet (2.0 TEU)</option>
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW CONTENT 1 & 2: JOB QUEUE & MY ACTIVE JOBS */}
      {/* ========================================================================= */}
      {viewTab !== 'HISTORY' && (
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-slate-900">
                {viewTab === 'MY_JOBS'
                  ? `Tài xế ${activeOperator.name} chưa nhận container nào!`
                  : 'Hiện không có container nào đang chờ hạ bãi!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {viewTab === 'MY_JOBS'
                  ? 'Hãy chuyển sang tab "Hàng Đợi Chờ Hạ" để chọn và nhận lệnh container mong muốn.'
                  : 'Tất cả container đã thanh toán hoặc hoàn tất đều đã được các xe nâng gắp hạ vào bãi an toàn.'}
              </p>
              {viewTab === 'MY_JOBS' && (
                <button
                  onClick={() => setViewTab('QUEUE')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Đến Danh Sách Chờ Hạ Bãi
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <ForkliftJobCard
                key={job.id}
                job={job}
                activeOperator={activeOperator}
                activeVehicle={activeVehicle}
                onClaim={handleClaimJob}
                onStartExecution={handleStartExecution}
                onOpenDropModal={(targetJob) => setDropModalJob(targetJob)}
                onCancelClaim={handleCancelClaim}
                onViewYard={() => onNavigateTab('yard_map')}
              />
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW CONTENT 3: HISTORY AUDIT LOG TABLE */}
      {/* ========================================================================= */}
      {viewTab === 'HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Nhật Ký Hạ Bãi &amp; Ghi Nhận Tọa Độ Thực Tế
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Tổng số lượt hoàn tất: <strong className="text-emerald-600">{historyList.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã Lệnh / Cont</th>
                  <th className="py-3 px-4">Tài Xế &amp; Xe Nâng</th>
                  <th className="py-3 px-4">Nơi Lấy (From)</th>
                  <th className="py-3 px-4">Vị Trí Dự Kiến</th>
                  <th className="py-3 px-4">Vị Trí Thực Tế (Hạ)</th>
                  <th className="py-3 px-4">Thời Gian Hoàn Tất</th>
                  <th className="py-3 px-4">Ghi Chú Vận Hành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-mono text-slate-700">
                {historyList.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-black text-sm text-slate-900 font-mono">{hist.containerNo}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{hist.jobNo} &bull; {hist.size}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-700">{hist.operatorName}</div>
                      <div className="text-[11px] text-cyan-600 font-mono font-bold">{hist.forkliftCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-amber-700 text-xs">
                      {hist.fromLocation}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {hist.plannedLocation}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={hist.isDeviated ? 'text-amber-600' : 'text-emerald-600'}>
                          {hist.actualLocation}
                        </span>
                        {hist.isDeviated && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-sans font-bold">
                            LỆCH VỊ TRÍ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      <div>{hist.completedAt}</div>
                      <div className="text-slate-500 font-sans">({hist.durationMinutes} phút)</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-700 max-w-xs truncate">
                      {hist.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIRM DROP & LOCATION CHECK-IN */}
      {/* ========================================================================= */}
      {dropModalJob && (
        <ConfirmDropModal
          job={dropModalJob}
          isOpen={!!dropModalJob}
          onClose={() => setDropModalJob(null)}
          onConfirm={handleConfirmDrop}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL FORKLIFT JOB CREATION */}
      {/* ========================================================================= */}
      <CreateManualForkliftJobModal
        isOpen={isCreateManualModalOpen}
        onClose={() => setIsCreateManualModalOpen(false)}
        containers={containers}
        onCreateJob={handleCreateManualJob}
      />
    </div>
  );
};
