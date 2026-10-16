import React, { useEffect, useState } from 'react';
import { yardApi } from '../../yard/services/yardApi';
import { ForkliftJob, YardCoordinate } from '../types';
import { MapPin, AlertTriangle, CheckCircle2, X, Navigation, Info, ArrowRight } from 'lucide-react';

interface ConfirmDropModalProps {
  job: ForkliftJob;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    actualLocation: YardCoordinate,
    isDeviated: boolean,
    deviationReason?: string,
    driverNote?: string
  ) => void;
}

export const ConfirmDropModal: React.FC<ConfirmDropModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirm
}) => {
  // Block bãi thật (YardBlockLayouts qua /api/yard/overview) — trước đây gõ cứng Block A–D với mã 'A'..'D',
  // không khớp mã block backend (BLOCK_A...) nên xác nhận thả container vào block đó bị từ chối.
  const [yardBlocks, setYardBlocks] = useState<Array<{ blockCode: string; blockName?: string }>>([]);
  useEffect(() => {
    yardApi.getYardOverview().then((data: any) => setYardBlocks(data?.blocks || [])).catch(() => setYardBlocks([]));
  }, []);
  const [block, setBlock] = useState<string>('A');
  const [bay, setBay] = useState<string>('01');
  const [row, setRow] = useState<string>('01');
  const [tier, setTier] = useState<string>('01');
  const [deviationReason, setDeviationReason] = useState<string>('');
  const [driverNote, setDriverNote] = useState<string>('');

  React.useEffect(() => {
    if (job?.plannedLocation) {
      setBlock(job.plannedLocation.block || '');
      setBay(job.plannedLocation.bay || '');
      setRow(job.plannedLocation.row || '');
      setTier(job.plannedLocation.tier || '');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const isDeviated =
    block !== job.plannedLocation.block ||
    bay !== job.plannedLocation.bay ||
    row !== job.plannedLocation.row ||
    tier !== job.plannedLocation.tier;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(
      { block, bay, row, tier },
      isDeviated,
      isDeviated ? deviationReason || 'Hạ bãi vị trí lân cận theo thực tế hiện trường' : undefined,
      driverNote
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-600 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-200 text-[11px] font-mono font-bold">
                  BƯỚC 3: XÁC NHẬN ĐÃ HẠ
                </span>
                <span className="text-xs text-slate-500 font-mono">Job #{job.jobNo}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Xác Nhận Vị Trí Hạ Bãi Thực Tế (Actual Yard Location)</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Container Card Overview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Container Number</div>
              <div className="text-xl font-black font-mono text-cyan-600 tracking-wider">
                {job.containerNo}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {job.shippingLine} &bull; {job.size} &bull; Phân loại:{' '}
                <span
                  className={`font-bold ${
                    job.condition === 'AV'
                      ? 'text-emerald-600'
                      : job.condition === 'CL'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {job.condition}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Xe Nâng &amp; Tài Xế</div>
              <div className="text-sm font-mono font-bold text-amber-700">
                {job.assignedForkliftCode || 'FL-001'}
              </div>
              <div className="text-xs text-slate-700">
                {job.claimedByOperatorName || 'Tài xế nhận lệnh'}
              </div>
            </div>
          </div>

          {/* Planned vs Actual Comparison */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Planned Location (Read-only) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Vị Trí Bãi Dự Kiến (Planned)</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-center">
                  <div className="text-xs text-slate-500">Hệ Thống Đề Xuất:</div>
                  <div className="text-base font-black text-blue-600 mt-1">
                    {job.plannedLocation.block || '—'} &bull; BAY {job.plannedLocation.bay} &bull; ROW {job.plannedLocation.row} &bull; TIER {job.plannedLocation.tier}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Vị trí được tính toán theo quy tắc xếp bãi tối ưu theo Hãng tàu &amp; Phân loại.
                </p>
              </div>

              {/* Box 2: Actual Location (Editable) */}
              <div className={`p-4 rounded-2xl border space-y-2 transition ${
                isDeviated ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-xs font-bold text-teal-600 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>2. Vị Trí Hạ Thực Tế (Actual)</span>
                  </span>
                  {isDeviated && (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                      LỆCH TỌA ĐỘ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Block</label>
                    <select
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">-- Chọn block --</option>
                      {yardBlocks.map((b) => (
                        <option key={b.blockCode} value={b.blockCode}>{b.blockName || b.blockCode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Bay</label>
                    <select
                      value={bay}
                      onChange={(e) => setBay(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                    >
                      {['01', '02', '03', '04', '05', '06'].map((b) => (
                        <option key={b} value={b}>Bay {b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Row</label>
                    <select
                      value={row}
                      onChange={(e) => setRow(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                    >
                      {['01', '02', '03', '04'].map((r) => (
                        <option key={r} value={r}>Row {r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tier (Tầng)</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                    >
                      {['01', '02', '03', '04'].map((t) => (
                        <option key={t} value={t}>Tier {t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-xl border border-slate-200 text-center font-mono text-xs font-bold text-emerald-600">
                  Tọa độ ghi nhận: BLOCK {block}-{bay}-{row}-{tier}
                </div>
              </div>
            </div>

            {/* Deviation Alert & Reason Form */}
            {isDeviated && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Quy tắc Vị trí: Vị trí thực tế khác vị trí dự kiến ban đầu!</span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Hệ thống sẽ cập nhật sơ đồ Yard 2D theo đúng <strong>Vị trí Thực Tế ({block}-{bay}-{row}-{tier})</strong> và ghi nhận nhật ký vận hành.
                </p>

                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-amber-700 mb-1">
                    Lý do thay đổi vị trí hạ bãi:*
                  </label>
                  <select
                    value={deviationReason}
                    onChange={(e) => setDeviationReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn lý do chuyển vị trí --</option>
                    <option value="Ô bãi dự kiến đang bị xe khác hoặc chướng ngại vật chiếm lối">
                      Ô bãi dự kiến đang bị xe khác hoặc chướng ngại vật chiếm lối
                    </option>
                    <option value="Hạ tầng 1 thay vì tầng cao để chuẩn bị bàn giao ngay">
                      Hạ tầng 1 thay vì tầng cao để chuẩn bị bàn giao ngay
                    </option>
                    <option value="Thay đổi theo điều động khẩn của Giám sát bãi">
                      Thay đổi theo điều động khẩn của Giám sát bãi
                    </option>
                    <option value="Khu vực dự kiến đang cẩu sửa chữa EMR">
                      Khu vực dự kiến đang cẩu sửa chữa EMR
                    </option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>
              </div>
            )}

            {/* Driver Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú thêm của Tài xế xe nâng (Tùy chọn):
              </label>
              <input
                type="text"
                value={driverNote}
                onChange={(e) => setDriverNote(e.target.value)}
                placeholder="VD: Đã khóa gù an toàn, cẩn thận vách trước..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Hủy / Xem Lại
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg  transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Đã Hạ &amp; Cập Nhật Sơ Đồ Yard</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
