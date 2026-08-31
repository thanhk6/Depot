import React, { useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { yardApi } from '../../../api';
import { ForkliftJob, ForkliftOperator, ForkliftVehicle, YardCoordinate, ForkliftHistoryRecord } from '../types';
import { FORKLIFT_OPERATORS, FORKLIFT_VEHICLES } from '../mockData';
import { ForkliftJobCard } from '../components/ForkliftJobCard';
import { ConfirmDropModal } from '../components/ConfirmDropModal';
import { ClaimCollisionSimulationModal } from '../components/ClaimCollisionSimulationModal';
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
}

export const ForkliftPage: React.FC<ForkliftPageProps> = ({
  containers,
  onConfirmMove,
  onNavigateTab
}) => {
  // Active Logged-in Operator & Forklift Vehicle (Tablet profile)
  const [activeOperator, setActiveOperator] = useState<ForkliftOperator>(FORKLIFT_OPERATORS[0]);
  const [activeVehicle, setActiveVehicle] = useState<ForkliftVehicle>(FORKLIFT_VEHICLES[0]);

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
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
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
  React.useEffect(() => {
    containers.forEach((cont) => {
      // Check if job already exists
      const existingJob = jobs.find((j) => j.containerNo === cont.containerNo || j.containerId === cont.id);
      
      if (!existingJob) {
        if (cont.status === 'PAYMENT_SUCCESS' || cont.status === 'WAITING_FORKLIFT') {
          // Case 1: After payment/cleaning -> Move from Cleaning/Gate to Yard
          const fromLoc = cont.condition === 'CL' ? 'KHU VỆ SINH CLEANING BAY #01' : 'CỔNG GATE-IN (HẠ TẠM)';
          const plannedBlock = cont.condition === 'DM' ? 'A' : cont.type.includes('Reefer') || cont.size.includes('R') ? 'C' : 'B';
          
          const newJob: ForkliftJob = {
            id: `JOB-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
            jobNo: `JOB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
            containerId: cont.id,
            containerNo: cont.containerNo,
            isoCode: cont.isoCode || '22G1',
            size: cont.size,
            shippingLine: cont.shippingLine,
            condition: cont.condition,
            cargoStatus: 'EMPTY',
            fromLocation: fromLoc,
            plannedLocation: { block: plannedBlock, bay: '02', row: '02', tier: '01' },
            status: 'WAITING',
            priority: 'HIGH',
            waitingSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
            waitingDurationMinutes: 1,
            operationNote: 'Thanh toán hoàn tất. Xe nâng lấy từ khu vệ sinh đưa vào bãi lưu trữ.'
          };
          setJobs((prev) => [newJob, ...prev]);
        } else if (cont.status === 'REPAIRING' || cont.status === 'APPROVED') {
          // Case 2: Repair initiated -> Move from Yard to Repair Area
          const fromLoc = cont.yardLocation 
            ? `BÃI BLOCK ${cont.yardLocation.block}-${cont.yardLocation.bay}-${cont.yardLocation.row}`
            : 'BÃI LƯU TRỮ CONTAINER BLOCK B';

          const newJob: ForkliftJob = {
            id: `JOB-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
            jobNo: `JOB-EMR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
            containerId: cont.id,
            containerNo: cont.containerNo,
            isoCode: cont.isoCode || '22G1',
            size: cont.size,
            shippingLine: cont.shippingLine,
            condition: 'DM',
            cargoStatus: 'EMPTY',
            fromLocation: fromLoc,
            plannedLocation: { block: 'A', bay: '01', row: '01', tier: '01' },
            status: 'WAITING',
            priority: 'URGENT',
            waitingSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
            waitingDurationMinutes: 1,
            operationNote: 'Nhận sửa chữa: Xe nâng lấy từ bãi đưa về XƯỞNG SỬA CHỮA (EMR Bay).'
          };
          setJobs((prev) => [newJob, ...prev]);
        } else if (cont.status === 'READY_FOR_USE') {
          // Case 3: Sửa chữa & QC hoàn tất -> Xe nâng lấy từ Xưởng sửa chữa đặt lại vào bãi
          const newJob: ForkliftJob = {
            id: `JOB-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
            jobNo: `JOB-QC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
            containerId: cont.id,
            containerNo: cont.containerNo,
            isoCode: cont.isoCode || '22G1',
            size: cont.size,
            shippingLine: cont.shippingLine,
            condition: 'AV',
            cargoStatus: 'EMPTY',
            fromLocation: 'XƯỞNG SỬA CHỮA CONTAINER (EMR BAY)',
            plannedLocation: { block: 'B', bay: '03', row: '02', tier: '01' },
            status: 'WAITING',
            priority: 'HIGH',
            waitingSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
            waitingDurationMinutes: 1,
            operationNote: 'Sửa chữa xong: Xe nâng lại khu sửa chữa lấy container đặt vào vị trí bãi.'
          };
          setJobs((prev) => [newJob, ...prev]);
        }
      }
    });
  }, [containers, jobs]);

  // =========================================================================
  // CORE BUSINESS LOGIC 1: CLAIM CONTAINER (ATOMIC LOCKING)
  // =========================================================================
  const handleAttemptClaim = (
    jobId: string,
    operator: ForkliftOperator,
    vehicle: ForkliftVehicle
  ): { success: boolean; message: string } => {
    const targetJob = jobs.find((j) => j.id === jobId);

    if (!targetJob) {
      return { success: false, message: 'Lệnh không tồn tại trên hệ thống.' };
    }

    // STRICT CONCURRENCY CHECK: Must be WAITING
    if (targetJob.status !== 'WAITING') {
      const lockHolder = targetJob.claimedByOperatorName || 'nhân viên khác';
      return {
        success: false,
        message: `Container đã được nhân viên khác nhận (${lockHolder} - Xe ${targetJob.assignedForkliftCode || ''}).`
      };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // ATOMIC ASSIGNMENT & LOCK
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

    return {
      success: true,
      message: `Đã khóa và nhận lệnh thành công cho Container ${targetJob.containerNo}.`
    };
  };

  const handleClaimJob = (job: ForkliftJob) => {
    const result = handleAttemptClaim(job.id, activeOperator, activeVehicle);
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
  const handleStartExecution = (job: ForkliftJob) => {
    if (job.claimedByOperatorId !== activeOperator.id) {
      showToast('Bạn không thể thao tác trên container do người khác đang xử lý!', 'error');
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
    showToast(`Đang thực hiện cẩu gắp Container ${job.containerNo} từ "${job.fromLocation}"`, 'warning');
  };

  // =========================================================================
  // CORE BUSINESS LOGIC 3: CANCEL CLAIM
  // =========================================================================
  const handleCancelClaim = (job: ForkliftJob) => {
    if (job.claimedByOperatorId !== activeOperator.id) {
      showToast('Bạn chỉ có thể hủy lệnh do chính mình đã nhận!', 'error');
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
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-200'
              : 'bg-amber-950/95 border-amber-500 text-amber-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER: TABLET COCKPIT & OPERATOR PROFILE SWITCHER */}
      {/* ========================================================================= */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-2xl">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-orange-950 text-orange-400 border border-orange-800 text-[11px] font-bold">
                  ĐIỀU ĐỘ XE NÂNG (FORKLIFT DISPATCH)
                </span>
                <span className="text-xs text-slate-400 font-mono">Tự Động &amp; Tạo Lệnh Thủ Công</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Màn Hình Tablet Tài Xế Xe Nâng &amp; Luân Chuyển Bãi Depot
              </h2>
            </div>
          </div>

          {/* Quick Action Navigation & Create Job */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsCreateManualModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo Lệnh Xe Nâng</span>
            </button>

            <button
              onClick={() => setIsSimulationOpen(true)}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer"
              title="Thử nghiệm bảo vệ xung đột khi 2 xe nâng cùng nhận một container"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Test Xung Đột Nhận Lệnh</span>
            </button>

            <button
              onClick={() => onNavigateTab('yard_map')}
              className="px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 font-bold text-xs rounded-xl border border-teal-500/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-teal-400" />
              <span>Sơ Đồ Bãi Yard 2D</span>
            </button>
          </div>
        </div>

        {/* Dynamic Vòng Đời Guide Banner */}
        <div className="p-3.5 bg-[#070d1f] rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Droplets className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-cyan-300">1. Vệ sinh &amp; Thanh toán:</span>
              <p className="text-[11px] text-slate-400">Lấy từ khu Vệ Sinh → Đưa vào Bãi lưu trữ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-rose-300">2. Sửa chữa Work Order:</span>
              <p className="text-[11px] text-slate-400">Lấy từ Bãi → Đưa về Xưởng sửa chữa (EMR)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-emerald-300">3. Sửa xong &amp; QC đạt:</span>
              <p className="text-[11px] text-slate-400">Lấy từ Xưởng sửa chữa → Đặt vị trí bãi (Tự chọn vị trí)</p>
            </div>
          </div>
        </div>

        {/* Profile Switcher: Operator & Vehicle Simulator Bar */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Operator selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Tài Xế Đang Đăng Nhập:</span>
              </span>
              <select
                value={activeOperator.id}
                onChange={(e) => {
                  const op = FORKLIFT_OPERATORS.find((o) => o.id === e.target.value);
                  if (op) {
                    setActiveOperator(op);
                    showToast(`Đã chuyển phiên đăng nhập: Tài xế ${op.name}`, 'warning');
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl focus:outline-none"
              >
                {FORKLIFT_OPERATORS.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} ({op.badgeNo}) - {op.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Forklift Vehicle selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Xe Nâng:</span>
              </span>
              <select
                value={activeVehicle.id}
                onChange={(e) => {
                  const veh = FORKLIFT_VEHICLES.find((v) => v.id === e.target.value);
                  if (veh) {
                    setActiveVehicle(veh);
                    showToast(`Đã chọn phương tiện: ${veh.code} (${veh.name})`, 'warning');
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 rounded-xl focus:outline-none font-mono"
              >
                {FORKLIFT_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} - {v.name} ({v.capacityTon}T)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-400 font-bold">KẾT NỐI ONLINE SÓNG DEPOT GPS/WIFI</span>
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
              ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. Hàng Đợi Chờ Hạ Bãi (Waiting)
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {countWaiting} <span className="text-xs font-normal text-slate-400">Container</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tất cả xe nâng tự do nhận lệnh</div>
          </div>
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl font-black text-lg">
            {countWaiting}
          </div>
        </div>

        <div
          onClick={() => setViewTab('MY_JOBS')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            viewTab === 'MY_JOBS'
              ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/20 ring-1 ring-purple-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              2. Công Việc Của Tôi (My Active)
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {countMyActive} <span className="text-xs font-normal text-slate-400">Container</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Tài xế {activeOperator.name?.split(' ').slice(-2).join(' ') || activeOperator.name || ''} đã nhận
            </div>
          </div>
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-2xl font-black text-lg">
            {countMyActive}
          </div>
        </div>

        <div
          onClick={() => setViewTab('HISTORY')}
          className={`p-4 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            viewTab === 'HISTORY'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. Lịch Sử Đã Hạ Bãi (Completed)
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {countCompletedToday} <span className="text-xs font-normal text-slate-400">Lượt</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đã cập nhật tọa độ Yard 2D</div>
          </div>
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl font-black text-lg">
            {countCompletedToday}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewTab('QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'QUEUE'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hàng Đợi Chờ Hạ ({countWaiting})
          </button>
          <button
            onClick={() => setViewTab('MY_JOBS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'MY_JOBS'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Việc Của Tôi ({countMyActive})
          </button>
          <button
            onClick={() => setViewTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewTab === 'HISTORY'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
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
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã Container, Hãng tàu, Nơi lấy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-52"
              />
            </div>

            {/* Condition */}
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
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
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
            >
              <option value="ALL">Tất cả Block Bãi</option>
              <option value="A">Block A (EMR)</option>
              <option value="B">Block B (AV Standard)</option>
              <option value="C">Block C (Reefer)</option>
            </select>

            {/* Size */}
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
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
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
              <h3 className="text-base font-bold text-white">
                {viewTab === 'MY_JOBS'
                  ? `Tài xế ${activeOperator.name} chưa nhận container nào!`
                  : 'Hiện không có container nào đang chờ hạ bãi!'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                Nhật Ký Hạ Bãi &amp; Ghi Nhận Tọa Độ Thực Tế
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Tổng số lượt hoàn tất: <strong className="text-emerald-400">{historyList.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {historyList.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-black text-sm text-white font-mono">{hist.containerNo}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{hist.jobNo} &bull; {hist.size}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{hist.operatorName}</div>
                      <div className="text-[11px] text-cyan-400 font-mono font-bold">{hist.forkliftCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-amber-300 text-xs">
                      {hist.fromLocation}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {hist.plannedLocation}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={hist.isDeviated ? 'text-amber-400' : 'text-emerald-400'}>
                          {hist.actualLocation}
                        </span>
                        {hist.isDeviated && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[9px] font-sans font-bold">
                            LỆCH VỊ TRÍ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      <div>{hist.completedAt}</div>
                      <div className="text-slate-500 font-sans">({hist.durationMinutes} phút)</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-slate-300 max-w-xs truncate">
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

      {/* ========================================================================= */}
      {/* MODAL 3: CONFLICT SIMULATION TEST */}
      {/* ========================================================================= */}
      <ClaimCollisionSimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        jobs={jobs}
        onAttemptClaim={handleAttemptClaim}
      />
    </div>
  );
};
