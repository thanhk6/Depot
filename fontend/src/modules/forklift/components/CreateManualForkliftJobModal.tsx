import React, { useEffect, useState } from 'react';
import { yardApi } from '../../yard/services/yardApi';
import { useContainerTypeOptions } from '../../masterdata/utils/containerTypeCatalog';
import {
  X,
  Truck,
  Plus,
  ArrowRight,
  MapPin,
  FileSpreadsheet,
  Boxes,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ForkliftJob, JobPriority, YardCoordinate } from '../types';
import { ContainerRecord } from '../../../services/mockDataStore';

interface CreateManualForkliftJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  containers: ContainerRecord[];
  onCreateJob: (job: ForkliftJob) => void;
}

export const CreateManualForkliftJobModal: React.FC<CreateManualForkliftJobModalProps> = ({
  isOpen,
  onClose,
  containers,
  onCreateJob
}) => {
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');
  const [customContainerNo, setCustomContainerNo] = useState<string>('');
  const [shippingLine, setShippingLine] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [condition, setCondition] = useState<'AV' | 'CL' | 'DM'>('AV');
  const [jobType, setJobType] = useState<string>('MOVE_YARD_TO_REPAIR');
  const [fromLocation, setFromLocation] = useState<string>('');
  const [block, setBlock] = useState<string>('');
  const [bay, setBay] = useState<string>('');
  const [row, setRow] = useState<string>('');
  const [tier, setTier] = useState<string>('');
  // Loại container + block bãi thật từ DB (DM Loại Container, bảng YardBlockLayouts qua /api/yard/overview).
  // Trước đây gõ cứng 3 cỡ và Block A–D kèm mô tả — mã 'A' còn không khớp mã block backend dùng ('BLOCK_A').
  const containerTypeOptions = useContainerTypeOptions();
  const [yardBlocks, setYardBlocks] = useState<Array<{ blockCode: string; blockName?: string }>>([]);
  useEffect(() => {
    yardApi.getYardOverview().then((data: any) => setYardBlocks(data?.blocks || [])).catch(() => setYardBlocks([]));
  }, []);
  const [priority, setPriority] = useState<JobPriority>('HIGH');
  const [operationNote, setOperationNote] = useState<string>('');

  if (!isOpen) return null;

  // Preset location templates based on job type
  const handleJobTypeChange = (type: string) => {
    setJobType(type);
    if (type === 'MOVE_CLEANING_TO_YARD') {
      setFromLocation('KHU VỆ SINH');
      setOperationNote('Vệ sinh xong / Thanh toán hoàn tất -> Đưa vào Bãi lưu trữ tiêu chuẩn');
    } else if (type === 'MOVE_YARD_TO_REPAIR') {
      const selectedCont = containers.find((c) => c.id === selectedContainerId);
      if (selectedCont?.yardLocation) {
        setFromLocation(`BÃI BLOCK ${selectedCont.yardLocation.block}-${selectedCont.yardLocation.bay}-${selectedCont.yardLocation.row}`);
      } else {
        setFromLocation('BÃI LƯU TRỮ');
      }
      setOperationNote('Chuyển container từ bãi về XƯỞNG SỬA CHỮA (EMR WORKSHOP) để thợ thi công');
    } else if (type === 'MOVE_REPAIR_TO_YARD') {
      setFromLocation('XƯỞNG SỬA CHỮA CONTAINER (EMR BAY)');
      setOperationNote('Sửa chữa & QC hoàn tất -> Xe nâng đưa từ khu sửa chữa ra vị trí bãi lưu container AV');
    } else if (type === 'MOVE_GATE_TO_YARD') {
      setFromLocation('CỔNG GATE-IN (HẠ TẠM)');
      setOperationNote('Container qua cổng -> Hạ bãi tạm chờ xử lý');
    } else if (type === 'CUSTOM') {
      setFromLocation('VỊ TRÍ BÃI TÙY CHỈNH');
      setOperationNote('Lệnh điều xe nâng thủ công phát sinh theo điều động bãi');
    }
  };

  const handleContainerSelect = (contId: string) => {
    setSelectedContainerId(contId);
    const cont = containers.find((c) => c.id === contId);
    if (cont) {
      setCustomContainerNo(cont.containerNo);
      setShippingLine(cont.shippingLine);
      setSize(cont.size);
      setCondition(cont.condition);
      if (cont.yardLocation) {
        setFromLocation(`BÃI BLOCK ${cont.yardLocation.block}-${cont.yardLocation.bay}-${cont.yardLocation.row}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const containerNo = customContainerNo.trim() || `CONT${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newJob: ForkliftJob = {
      id: `JOB-${Date.now().toString().slice(-4)}`,
      jobNo: `JOB-MANUAL-${Date.now().toString().slice(-4)}`,
      containerId: selectedContainerId || `CONT-MAN-${Date.now()}`,
      containerNo: containerNo.toUpperCase(),
      isoCode: size.includes('40') ? '45G1' : '22G1',
      size: size,
      shippingLine: shippingLine,
      condition: condition,
      cargoStatus: 'EMPTY',
      fromLocation: fromLocation,
      plannedLocation: { block, bay, row, tier },
      status: 'WAITING',
      priority: priority,
      waitingSince: new Date().toISOString().replace('T', ' ').substring(0, 16),
      waitingDurationMinutes: 0,
      operationNote: operationNote || 'Lệnh điều xe nâng tạo thủ công từ điều độ bãi'
    };

    onCreateJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a1128] border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#070d1f] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Tạo Lệnh Điều Xe Nâng Thủ Công</h3>
              <p className="text-xs text-slate-500">
                Lập lệnh cẩu chuyển vị trí (Từ Vệ sinh → Bãi, Từ Bãi → Xưởng sửa chữa, Từ Sửa chữa → Bãi)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {/* Quick Scenario Preset */}
          <div>
            <label className="block text-xs font-bold text-sky-600 mb-2 uppercase tracking-wide">
              Kịch Bản Điều Chuyển Container:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleJobTypeChange('MOVE_CLEANING_TO_YARD')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  jobType === 'MOVE_CLEANING_TO_YARD'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-200'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 shrink-0 mt-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Vệ Sinh Xong → Đưa Vào Bãi</div>
                  <div className="text-[10px] text-slate-500">Thanh toán xong từ khu vệ sinh đưa vào bãi</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleJobTypeChange('MOVE_YARD_TO_REPAIR')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  jobType === 'MOVE_YARD_TO_REPAIR'
                    ? 'bg-rose-50 border-rose-500 text-rose-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-200'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 shrink-0 mt-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Từ Bãi → Đưa Về Khu Sửa Chữa</div>
                  <div className="text-[10px] text-slate-500">Xe nâng lấy container từ bãi đưa về thợ EMR</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleJobTypeChange('MOVE_REPAIR_TO_YARD')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  jobType === 'MOVE_REPAIR_TO_YARD'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-200'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Sửa Xong → Đưa Ra Bãi Lưu Vỏ</div>
                  <div className="text-[10px] text-slate-500">Xe nâng lại khu sửa chữa đặt vào vị trí bãi</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleJobTypeChange('CUSTOM')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  jobType === 'CUSTOM'
                    ? 'bg-amber-50 border-amber-500 text-amber-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-200'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Lệnh Đảo Chuyển Tùy Chỉnh</div>
                  <div className="text-[10px] text-slate-500">Đảo chuyển nội bộ theo yêu cầu bãi</div>
                </div>
              </button>
            </div>
          </div>

          {/* Container Selection */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              1. Chọn Container Hiện Hữu Trong Depot Hoặc Nhập Số Cont:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 mb-1">Từ danh sách Depot:</span>
                <select
                  value={selectedContainerId}
                  onChange={(e) => handleContainerSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Chọn Container có sẵn --</option>
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.containerNo} ({c.shippingLine} - {c.size} - {c.condition})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] text-slate-500 mb-1">Số Container:*</span>
                <input
                  type="text"
                  value={customContainerNo}
                  onChange={(e) => setCustomContainerNo(e.target.value)}
                  placeholder="Ví dụ: CMAU7712390"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-[10px] text-slate-500 mb-1">Hãng Tàu:</span>
                <input
                  type="text"
                  value={shippingLine}
                  onChange={(e) => setShippingLine(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-1">Kích cỡ (Size):</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                >
                  <option value="">-- Chọn loại --</option>
                  {containerTypeOptions.map((t) => (
                    <option key={t.id} value={t.typeCode}>{t.typeCode} - {t.name || t.vietnameseName}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-1">Phân hạng (Condition):</span>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-bold"
                >
                  <option value="AV">AV (Available - Tốt)</option>
                  <option value="CL">CL (Cleaning - Cần Rửa)</option>
                  <option value="DM">DM (Damaged - Hỏng)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Locations Routing */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              2. Lộ Trình Di Chuyển Container (Vị Trí Lấy → Vị Trí Đặt Dự Kiến):
            </label>

            <div>
              <span className="block text-[11px] text-slate-500 mb-1">Vị trí LẤY Container (Cố định theo quy trình hoặc chọn tay):</span>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-amber-700 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-[11px] text-slate-500 mb-1">
                Vị trí ĐẶT Container Dự Kiến (Xe nâng có thể tự chọn đặt vị trí khác khi thao tác thực tế):
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="block text-[10px] text-slate-500 mb-0.5">Block</span>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900"
                  >
                    <option value="">--</option>
                    {yardBlocks.map((b) => (
                      <option key={b.blockCode} value={b.blockCode}>{b.blockName || b.blockCode}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 mb-0.5">Bay</span>
                  <select
                    value={bay}
                    onChange={(e) => setBay(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900"
                  >
                    {['01', '02', '03', '04', '05', '06'].map((b) => (
                      <option key={b} value={b}>Bay {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 mb-0.5">Row</span>
                  <select
                    value={row}
                    onChange={(e) => setRow(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900"
                  >
                    {['01', '02', '03', '04'].map((r) => (
                      <option key={r} value={r}>Row {r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 mb-0.5">Tier (Tầng)</span>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900"
                  >
                    {['01', '02', '03', '04'].map((t) => (
                      <option key={t} value={t}>Tier {t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <span className="block text-[11px] text-slate-500 mb-1">Ghi chú điều động bãi:</span>
              <input
                type="text"
                value={operationNote}
                onChange={(e) => setOperationNote(e.target.value)}
                placeholder="Ghi chú điều xe nâng..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#070d1f] border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg  transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Phát Lệnh Cho Xe Nâng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
