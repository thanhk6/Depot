import React, { useState, useMemo } from 'react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { shippingApi } from '../../../api';
import {
  Send,
  Server,
  Globe,
  Radio,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code,
  Terminal,
  ShieldCheck,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Ship,
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  Eye,
  CheckSquare,
  Square,
  Wrench,
  Award
} from 'lucide-react';
import { QCInspectionRecord } from '../../qc/types/qc';
import {
  CarrierApiEndpointConfig,
  CarrierApiLogRecord
} from '../types/shippingApi';
import {
  CARRIER_API_CONFIGS,
  INITIAL_API_LOGS,
  buildCarrierApiRequest,
  simulateCarrierApiResponse
} from '../data/carrierApiConfigs';
import { ApiLogDetailModal } from '../components/ApiLogDetailModal';

interface ShippingApiPageProps {
  containers: ContainerRecord[];
  onNavigateTab: (tabId: string) => void;
}

export const ShippingApiPage: React.FC<ShippingApiPageProps> = ({
  containers,
  onNavigateTab
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'QUEUED' | 'CONSOLE' | 'LOGS' | 'CONFIGS'>('QUEUED');
  const [selectedCarrierFilter, setSelectedCarrierFilter] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedContainerIds, setSelectedContainerIds] = useState<string[]>([]);

  // Gateway configurations
  const [gateways, setGateways] = useState<CarrierApiEndpointConfig[]>(CARRIER_API_CONFIGS);

  // API Transmission logs
  const [apiLogs, setApiLogs] = useState<CarrierApiLogRecord[]>(INITIAL_API_LOGS);
  const [inspectingLog, setInspectingLog] = useState<CarrierApiLogRecord | null>(null);

  // Live Console state
  const [consoleCarrierCode, setConsoleCarrierCode] = useState<string>('MAERSK');
  const [consoleEnvironment, setConsoleEnvironment] = useState<'PRODUCTION' | 'SANDBOX'>('PRODUCTION');
  const [consoleSimulateError, setConsoleSimulateError] = useState<boolean>(false);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transmissionProgress, setTransmissionProgress] = useState<number>(0);

  // Console result
  const [lastApiResult, setLastApiResult] = useState<{
    txRef: string;
    statusCode: number;
    statusText: string;
    payload: any;
    ackRef: string;
    latencyMs: number;
    headers: Record<string, string>;
    requestPayload: any;
    timestamp: string;
  } | null>(null);

  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Build simulated QC-passed container records from the app state
  const qcPassedRecords: QCInspectionRecord[] = useMemo(() => {
    return containers
      .filter((c) => c.condition === 'AV' || c.status === 'READY_FOR_USE' || c.status === 'IN_YARD' || c.qcDetails?.result === 'PASS')
      .map((c, idx) => {
        const isLogged = apiLogs.some((l) => l.containerNos.includes(c.containerNo));
        return {
          id: `QC-${c.id}`,
          containerId: c.id,
          containerNo: c.containerNo,
          isoCode: c.isoCode,
          size: c.size,
          type: c.type,
          shippingLine: c.shippingLine,
          workOrderNo: c.workOrderDetails?.workOrderNo || `WO-${c.containerNo.slice(-4)}`,
          estimateNo: c.estimateDetails?.estimateNo || `EST-${c.containerNo.slice(-4)}`,
          technicianName: c.workOrderDetails?.technician || 'Hoàng Văn Sơn (Tổ EMR)',
          yardLocation: c.yardLocation || { block: 'C', bay: '04', row: '02', tier: '2' },
          repairedAt: c.workOrderDetails?.assignedAt || '2026-08-16 08:30',
          inspectedAt: c.qcDetails?.inspectedAt || '2026-08-16 09:15',
          inspectorName: c.qcDetails?.inspector || 'Vũ Quốc Việt (IICL Certified)',
          certificateNo: `QC-CERT-${c.containerNo}-2026`,
          checkItems: [],
          beforePhotos: [
            {
              url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
              label: 'Ảnh hư hỏng trước sửa',
              location: 'Vách trái / Xà đáy'
            }
          ],
          afterPhotos: [
            {
              url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
              label: 'Ảnh sau thi công hàn & sơn phủ',
              location: 'Vách trái / Xà đáy hoàn thiện'
            }
          ],
          qcResult: 'PASS',
          inspectorComments: 'Nghiệm thu đạt chuẩn IICL-6, cấp vỏ sạch AV.',
          releasedGrade: 'GRADE_A',
          shippingDispatch: isLogged
            ? {
                status: 'TRANSMITTED',
                transmittedAt: '2026-08-16 09:30',
                transmittedMethod: 'API_WEBHOOK',
                transmissionRefNo: `TX-API-${c.containerNo.slice(-4)}`
              }
            : {
                status: 'PENDING_TRANSMISSION'
              }
        };
      });
  }, [containers, apiLogs]);

  // Filtered queue
  const filteredQueue = useMemo(() => {
    return qcPassedRecords.filter((r) => {
      const matchCarrier =
        selectedCarrierFilter === 'ALL' ||
        r.shippingLine.toUpperCase().includes(selectedCarrierFilter.toUpperCase()) ||
        (selectedCarrierFilter === 'MAERSK' && r.shippingLine.includes('Maersk')) ||
        (selectedCarrierFilter === 'ONE' && r.shippingLine.includes('ONE')) ||
        (selectedCarrierFilter === 'CMA CGM' && r.shippingLine.includes('CMA')) ||
        (selectedCarrierFilter === 'MSC' && r.shippingLine.includes('MSC')) ||
        (selectedCarrierFilter === 'COSCO' && r.shippingLine.includes('COSCO'));

      const matchSearch =
        searchKeyword.trim() === '' ||
        r.containerNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.workOrderNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        r.shippingLine.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchCarrier && matchSearch;
    });
  }, [qcPassedRecords, selectedCarrierFilter, searchKeyword]);

  const pendingQueueCount = qcPassedRecords.filter(
    (r) => r.shippingDispatch?.status !== 'TRANSMITTED'
  ).length;

  const transmittedCount = apiLogs.reduce((acc, l) => acc + (l.status === 'SUCCESS' ? l.containerCount : 0), 0);

  // Toggle selection
  const toggleSelectContainer = (containerId: string) => {
    setSelectedContainerIds((prev) =>
      prev.includes(containerId) ? prev.filter((id) => id !== containerId) : [...prev, containerId]
    );
  };

  const toggleSelectAll = () => {
    const unSentIds = filteredQueue
      .filter((r) => r.shippingDispatch?.status !== 'TRANSMITTED')
      .map((r) => r.containerId);

    if (selectedContainerIds.length === unSentIds.length && unSentIds.length > 0) {
      setSelectedContainerIds([]);
    } else {
      setSelectedContainerIds(unSentIds);
    }
  };

  // Execute Real-Time API Dispatch
  const executeApiDispatch = (
    carrierCode: string,
    recordsToSend: QCInspectionRecord[],
    forceError: boolean = false
  ) => {
    if (recordsToSend.length === 0) return;

    const carrier =
      gateways.find((g) => g.carrierCode === carrierCode) ||
      gateways[0];

    const { txRef, headers, payload } = buildCarrierApiRequest(carrier, recordsToSend);

    setIsTransmitting(true);
    setTransmissionProgress(15);

    const timer1 = setTimeout(() => setTransmissionProgress(55), 250);
    const timer2 = setTimeout(() => setTransmissionProgress(85), 500);

    setTimeout(() => {
      void (async () => {
        try {
          if (!forceError) {
            const backendResults = await Promise.all(
              recordsToSend.map((record) => shippingApi.syncJob(record.containerId, carrier.carrierCode, 'QC_PASSED'))
            );

            const backendFailure = backendResults.find((result: any) => result?.statusCode !== 200);
            if (backendFailure) {
              throw new Error(backendFailure?.message || 'Không thể đồng bộ hãng tàu.');
            }
          }

          const { statusCode, statusText, payload: respPayload, ackRef, latencyMs } =
            simulateCarrierApiResponse(carrier, txRef, recordsToSend, forceError);

          setTransmissionProgress(100);
          setIsTransmitting(false);

          const isSuccess = statusCode >= 200 && statusCode < 300;

          const newLog: CarrierApiLogRecord = {
            id: `LOG-${Date.now()}`,
            transactionRef: txRef,
            carrierCode: carrier.carrierCode,
            carrierName: carrier.carrierName,
            endpointUrl: carrier.endpointUrl,
            httpMethod: 'POST',
            containerCount: recordsToSend.length,
            containerNos: recordsToSend.map((r) => r.containerNo),
            requestHeaders: headers,
            requestPayload: payload,
            responseStatusCode: statusCode,
            responseStatusText: statusText,
            responsePayload: respPayload,
            ackReferenceNo: isSuccess ? ackRef : undefined,
            latencyMs,
            status: isSuccess ? 'SUCCESS' : 'FAILED',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            triggeredBy: 'Vũ Quốc Việt (QC Manager)',
            errorMessage: isSuccess ? undefined : respPayload.message
          };

          setApiLogs((prev) => [newLog, ...prev]);

          setLastApiResult({
            txRef,
            statusCode,
            statusText,
            payload: respPayload,
            ackRef,
            latencyMs,
            headers,
            requestPayload: payload,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
          });

          if (isSuccess) {
            setToastMessage(
              `🚀 Truyền API thành công tới ${carrier.carrierName}! Mã xác nhận (ACK): ${ackRef} (${recordsToSend.length} Cont, ${latencyMs}ms)`
            );
            setSelectedContainerIds([]);
          } else {
            setToastMessage(
              `⚠️ Phản hồi API [HTTP ${statusCode} ${statusText}]: ${respPayload.message}`
            );
          }
        } catch (error) {
          setTransmissionProgress(100);
          setIsTransmitting(false);
          setToastMessage(
            error instanceof Error ? error.message : 'Không thể đồng bộ hãng tàu qua backend.'
          );
        } finally {
          setTimeout(() => setToastMessage(null), 8000);
        }
      })();
    }, 850);
  };

  // Handle single send
  const handleSingleSend = (record: QCInspectionRecord) => {
    // Detect carrier code
    const line = record.shippingLine.toUpperCase();
    const carrier =
      gateways.find((g) => line.includes(g.carrierCode.toUpperCase())) ||
      gateways[0];

    executeApiDispatch(carrier.carrierCode, [record]);
  };

  // Handle bulk send
  const handleBulkSend = () => {
    const selectedRecords = qcPassedRecords.filter((r) =>
      selectedContainerIds.includes(r.containerId)
    );
    if (selectedRecords.length === 0) return;

    // Detect carrier or use selected filter
    const carrierCode =
      selectedCarrierFilter !== 'ALL' ? selectedCarrierFilter : 'MAERSK';

    executeApiDispatch(carrierCode, selectedRecords);
  };

  // Copy JSON Response
  const handleCopyResponse = () => {
    if (!lastApiResult) return;
    navigator.clipboard.writeText(JSON.stringify(lastApiResult.payload, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const selectedConsoleCarrier = gateways.find((g) => g.carrierCode === consoleCarrierCode) || gateways[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                10. CỔNG TRUYỀN DỮ LIỆU API HÃNG TÀU (SHIPPING LINE API GATEWAY)
              </h2>
              <span className="px-2.5 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>REST API v3 / JSON</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gửi dữ liệu nghiệm thu sửa chữa hoàn thành (QC AV Release) trực tiếp qua API RESTful / Webhook tới máy chủ các Hãng Tàu quốc tế &amp; nhận phản hồi (Response Payload / ACK Token) theo thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('qc')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>&larr; Bước 9: Kỹ Thuật QC</span>
          </button>
          <button
            onClick={() => onNavigateTab('gate_out')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
          >
            <span>Bước 11: Cổng Xuất &amp; Cấp Vỏ (Gate-Out) &rarr;</span>
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="p-4 bg-slate-900/95 border-2 border-blue-500 rounded-2xl flex items-center justify-between text-xs text-slate-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Carrier Gateway Real-time Health Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {gateways.map((g) => (
          <div
            key={g.carrierCode}
            onClick={() => {
              setConsoleCarrierCode(g.carrierCode);
              setSelectedCarrierFilter(g.carrierCode);
            }}
            className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              consoleCarrierCode === g.carrierCode
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">{g.carrierCode}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">200 OK</span>
              <span>~480ms</span>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Container Chờ Gửi API</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{pendingQueueCount}</div>
          <span className="text-[10px] text-slate-500">Đã QC Đạt &bull; Sẵn sàng đóng gói JSON</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Giao Dịch API Thành Công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {transmittedCount}
          </div>
          <span className="text-[10px] text-slate-500">HTTP 200/201 &bull; Nhận mã ACK chấp thuận</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Độ Trễ Trung Bình (Latency)</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">542 ms</div>
          <span className="text-[10px] text-slate-500">Cổng REST / TLS 1.3 bảo mật cao</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Tỷ Lệ Chấp Thuận</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">100.0%</div>
          <span className="text-[10px] text-slate-500">Đối soát tự động với hợp đồng M&amp;R</span>
        </div>
      </div>

      {/* Main Module Tabs */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveMainTab('QUEUED')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'QUEUED'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>1. Danh Sách Chờ Truyền API ({pendingQueueCount})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('CONSOLE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'CONSOLE'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>2. Trình Thử Nghiệm API &amp; Xem Kết Quả Trả Về (API Console)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('LOGS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'LOGS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>3. Nhật Ký Giao Dịch &amp; Phản Hồi Server ({apiLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('CONFIGS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'CONFIGS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>4. Cấu Hình Cổng API Hãng Tàu ({gateways.length})</span>
          </button>
        </div>

        {/* Filter bar for QUEUED tab */}
        {activeMainTab === 'QUEUED' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs pt-2">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm container, số lệnh Work Order, mã dự toán Estimate..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedCarrierFilter}
                onChange={(e) => setSelectedCarrierFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl focus:outline-none"
              >
                <option value="ALL">Tất cả Hãng Tàu</option>
                {gateways.map((g) => (
                  <option key={g.carrierCode} value={g.carrierCode}>
                    {g.carrierName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: QUEUED CONTAINERS */}
      {activeMainTab === 'QUEUED' && (
        <div className="space-y-4">
          {/* Multi-selection Bulk Action Bar */}
          {selectedContainerIds.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-950 to-indigo-950 border-2 border-blue-500 rounded-3xl flex items-center justify-between flex-wrap gap-3 shadow-xl animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/30 text-blue-300 rounded-xl border border-blue-500/40">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">
                    Đã chọn {selectedContainerIds.length} container sẵn sàng truyền API
                  </span>
                  <p className="text-[11px] text-blue-200">
                    Hệ thống sẽ tự động đóng gói payload JSON chuẩn M&amp;R và gọi POST Endpoint hãng tàu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedContainerIds([])}
                  className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
                >
                  Bỏ Chọn
                </button>

                <button
                  disabled={isTransmitting}
                  onClick={handleBulkSend}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-950 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isTransmitting
                      ? 'Đang Truyền Dữ Liệu...'
                      : `GỬI API ĐỒNG LOẠT (${selectedContainerIds.length} CONT)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-300 uppercase tracking-wider">
                  Danh Sách Container Nghiệm Thu Đạt Cần Truyền API ({filteredQueue.length})
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Chọn tất cả chưa gửi</span>
                </button>
              </div>

              <span className="text-slate-500 font-mono text-[11px]">
                Giao thức: <strong>HTTPS RESTful JSON / OAuth2 Token</strong>
              </span>
            </div>

            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Ship className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Không tìm thấy container phù hợp</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Các container sau khi được giám định QC đạt chuẩn AV ở Bước 9 sẽ tự động xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4 w-10 text-center">
                        <span className="sr-only">Chọn</span>
                      </th>
                      <th className="p-4">Container No &amp; Loại Vỏ</th>
                      <th className="p-4">Hãng Tàu &amp; Endpoint</th>
                      <th className="p-4">Lệnh WO / Estimate</th>
                      <th className="p-4">Hạng Cấp (Grade)</th>
                      <th className="p-4">Trạng Thái API</th>
                      <th className="p-4 text-right">Thao Tác Gửi API</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {filteredQueue.map((r) => {
                      const isSelected = selectedContainerIds.includes(r.containerId);
                      const isTransmitted = r.shippingDispatch?.status === 'TRANSMITTED';

                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-slate-850 transition duration-150 ${
                            isSelected ? 'bg-blue-950/30' : ''
                          }`}
                        >
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelectContainer(r.containerId)}
                              className="text-slate-400 hover:text-blue-400 transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          </td>

                          <td className="p-4">
                            <div className="font-mono font-black text-white text-sm">
                              {r.containerNo}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {r.size} {r.type} ({r.isoCode})
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 font-mono font-bold rounded text-[11px]">
                              {r.shippingLine}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              POST /depot-operations/v3/mnr
                            </div>
                          </td>

                          <td className="p-4 font-mono">
                            <div className="text-amber-400 font-bold">{r.workOrderNo}</div>
                            <div className="text-slate-400 text-[11px]">{r.estimateNo}</div>
                          </td>

                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                              {r.releasedGrade || 'GRADE_A'}
                            </span>
                          </td>

                          <td className="p-4">
                            {isTransmitted ? (
                              <div className="space-y-0.5">
                                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 font-mono">
                                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                                  <span>200 OK ACCEPTED</span>
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Đã nhận mã ACK &bull; Đã mở khóa AV
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Chờ Gửi API</span>
                                </span>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Sẵn sàng truyền
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setConsoleCarrierCode(
                                    r.shippingLine.toUpperCase().includes('ONE')
                                      ? 'ONE'
                                      : r.shippingLine.toUpperCase().includes('CMA')
                                      ? 'CMA CGM'
                                      : 'MAERSK'
                                  );
                                  setActiveMainTab('CONSOLE');
                                }}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                                title="Xem trước Payload JSON trong Console"
                              >
                                <Code className="w-3.5 h-3.5 text-blue-400" />
                                <span>Xem JSON</span>
                              </button>

                              <button
                                disabled={isTransmitting}
                                onClick={() => handleSingleSend(r)}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow shadow-blue-950 disabled:opacity-50"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Gửi API Ngay</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE API CONSOLE & TESTER */}
      {activeMainTab === 'CONSOLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: API Request Config & JSON Payload */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Thiết Lập Yêu Cầu Gửi API (HTTP POST Request)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConsoleEnvironment((prev) => (prev === 'PRODUCTION' ? 'SANDBOX' : 'PRODUCTION'))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                      consoleEnvironment === 'PRODUCTION'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    Env: {consoleEnvironment}
                  </button>
                </div>
              </div>

              {/* Endpoint selection */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-bold block">Chọn Cổng API Hãng Tàu Đích:</label>
                <select
                  value={consoleCarrierCode}
                  onChange={(e) => setConsoleCarrierCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl font-medium focus:outline-none focus:border-blue-500"
                >
                  {gateways.map((g) => (
                    <option key={g.carrierCode} value={g.carrierCode}>
                      {g.carrierName} ({g.endpointUrl})
                    </option>
                  ))}
                </select>
              </div>

              {/* HTTP Request URL Bar */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-black rounded text-[11px]">
                    POST
                  </span>
                  <span className="text-slate-300 break-all">{selectedConsoleCarrier.endpointUrl}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold shrink-0">TLS 1.3 / OAuth2</span>
              </div>

              {/* Error Simulation Toggle */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 block">Thử Nghiệm Phản Hồi Lỗi (Simulate Error 422):</span>
                  <span className="text-[11px] text-slate-400">
                    Bật tùy chọn này để xem hệ thống xử lý khi Hãng tàu trả mã từ chối hợp lệ.
                  </span>
                </div>
                <button
                  onClick={() => setConsoleSimulateError(!consoleSimulateError)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    consoleSimulateError ? 'bg-rose-600 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="bg-slate-200 w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* Request Payload Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">Request Body Payload (JSON):</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Đóng gói {filteredQueue.slice(0, 2).length} Containers
                  </span>
                </div>
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-blue-300 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto select-all scrollbar-thin">
                  {JSON.stringify(
                    buildCarrierApiRequest(selectedConsoleCarrier, filteredQueue.slice(0, 2)).payload,
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Action Button */}
              <button
                disabled={isTransmitting}
                onClick={() =>
                  executeApiDispatch(
                    selectedConsoleCarrier.carrierCode,
                    filteredQueue.slice(0, 2),
                    consoleSimulateError
                  )
                }
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-950 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isTransmitting
                    ? `Đang Gọi API Tới ${selectedConsoleCarrier.carrierName}... (${transmissionProgress}%)`
                    : `GỬI YÊU CẦU POST API (${selectedConsoleCarrier.carrierCode})`}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: API Response Result Viewer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Kết Quả API Trả Về (Server Response)
                  </h3>
                </div>

                {lastApiResult && (
                  <button
                    onClick={handleCopyResponse}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResponse ? 'Đã Sao Chép' : 'Sao Chép JSON'}</span>
                  </button>
                )}
              </div>

              {lastApiResult ? (
                <div className="space-y-4 flex-1 flex flex-col font-mono text-xs">
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-2 ${
                      lastApiResult.statusCode === 200
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {lastApiResult.statusCode === 200 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <div>
                        <span className="font-bold text-sm">
                          HTTP {lastApiResult.statusCode} {lastApiResult.statusText}
                        </span>
                        <div className="text-[11px] opacity-80">
                          ACK Ref: <strong>{lastApiResult.ackRef}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      <div className="text-amber-400 font-bold">Latency: {lastApiResult.latencyMs} ms</div>
                      <div className="text-slate-400">{lastApiResult.timestamp}</div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {lastApiResult.statusCode === 200 && (
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Trạng Thái Vỏ Cập Nhật:</span>
                        <span className="text-emerald-400 font-bold">AV (AVAILABLE FOR EXPORT)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lệnh Cấp Ra Cảng:</span>
                        <span className="text-blue-400 font-bold">ĐÃ MỞ KHÓA (GATE-OUT UNLOCKED)</span>
                      </div>
                    </div>
                  )}

                  {/* Raw JSON viewer */}
                  <div className="flex-1 flex flex-col space-y-1">
                    <span className="text-slate-400 font-bold text-[11px]">Response JSON Payload:</span>
                    <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400 leading-relaxed overflow-y-auto flex-1 select-all scrollbar-thin max-h-96">
                      {JSON.stringify(lastApiResult.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500 space-y-3">
                  <Terminal className="w-12 h-12 text-slate-700" />
                  <p className="text-xs max-w-sm">
                    Chưa có giao dịch nào được thực hiện trong phiên này. Hãy chọn cổng API và nhấn <strong>"GỬI YÊU CẦU POST API"</strong> để xem dữ liệu phản hồi trực tiếp.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API TRANSMISSION LOGS */}
      {activeMainTab === 'LOGS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Nhật Ký Tất Cả Giao Dịch API &amp; Mã Phản Hồi Server ({apiLogs.length})
              </span>
            </div>

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(apiLogs, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `API-LOGS-${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất File JSON Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4">Mã Giao Dịch (Ref)</th>
                  <th className="p-4">Hãng Tàu</th>
                  <th className="p-4">Containers</th>
                  <th className="p-4">Status Code</th>
                  <th className="p-4">Độ Trễ</th>
                  <th className="p-4">Mã Xác Nhận (ACK)</th>
                  <th className="p-4 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {apiLogs.map((log) => {
                  const isSuccess = log.responseStatusCode >= 200 && log.responseStatusCode < 300;
                  return (
                    <tr key={log.id} className="hover:bg-slate-850 transition duration-150">
                      <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="p-4 font-bold text-blue-400 whitespace-nowrap">
                        {log.transactionRef}
                      </td>

                      <td className="p-4 text-white font-bold whitespace-nowrap">
                        {log.carrierName}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {log.containerNos.map((no) => (
                            <span
                              key={no}
                              className="px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 text-[10px]"
                            >
                              {no}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] border ${
                            isSuccess
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          HTTP {log.responseStatusCode} {log.responseStatusText}
                        </span>
                      </td>

                      <td className="p-4 text-amber-400">{log.latencyMs} ms</td>

                      <td className="p-4 text-emerald-400 font-bold whitespace-nowrap">
                        {log.ackReferenceNo || '-'}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Xem Payload</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: API GATEWAY CONFIGS */}
      {activeMainTab === 'CONFIGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gateways.map((g) => (
            <div
              key={g.carrierCode}
              className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${g.logoColor}`}>
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{g.carrierName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Mã Hãng: <strong>{g.carrierCode}</strong>
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CONNECTED</span>
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 break-all">
                  <span className="text-blue-400 font-bold block text-[10px]">REST API ENDPOINT:</span>
                  {g.endpointUrl}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Xác Thực (Auth):</span>
                    <span className="text-purple-400 font-bold">{g.authType}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Giao Thức:</span>
                    <span className="text-emerald-400 font-bold">{g.protocol}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Tự động truyền khi QC Đạt:</span>
                <button
                  onClick={() => {
                    setGateways((prev) =>
                      prev.map((item) =>
                        item.carrierCode === g.carrierCode
                          ? { ...item, autoTransmitOnQcPass: !item.autoTransmitOnQcPass }
                          : item
                      )
                    );
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                    g.autoTransmitOnQcPass
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {g.autoTransmitOnQcPass ? 'Đang Bật (Auto)' : 'Thủ Công (Manual)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal View Log Detail */}
      {inspectingLog && (
        <ApiLogDetailModal log={inspectingLog} onClose={() => setInspectingLog(null)} />
      )}
    </div>
  );
};
