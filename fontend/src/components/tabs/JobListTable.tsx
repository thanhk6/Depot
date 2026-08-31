import React, { useState } from 'react';
import { useDepot } from '../../context/DepotContext';
import { JobStatus, DepotJob, ContainerSize } from '../../types/depot';
import { SHIPPING_LINES } from '../../data/depotMasterData';
import {
  Boxes,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Container,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

interface JobListTableProps {
  onSelectJob: (jobId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const JobListTable: React.FC<JobListTableProps> = ({ onSelectJob, onNavigateTab }) => {
  const {
    jobs,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    shippingLineFilter,
    setShippingLineFilter,
    activeRole,
    processGateOut,
    createGateInJob,
    updateJob,
    deleteJob,
    showToast
  } = useDepot();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<DepotJob | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    containerNo: '',
    isoSize: '40HC' as ContainerSize,
    shippingLine: SHIPPING_LINES[0] || 'MAERSK',
    tareWeightKg: 3800,
    maxPayloadKg: 28680
  });

  const handleOpenAddModal = () => {
    setFormData({
      containerNo: '',
      isoSize: '40HC',
      shippingLine: SHIPPING_LINES[0] || 'MAERSK',
      tareWeightKg: 3800,
      maxPayloadKg: 28680
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (job: DepotJob) => {
    setEditingJob(job);
    setFormData({
      containerNo: job.containerNo,
      isoSize: job.isoSize,
      shippingLine: job.shippingLine,
      tareWeightKg: job.tareWeightKg,
      maxPayloadKg: job.maxPayloadKg
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.containerNo.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin số Container!', 'error', 'Thiếu Thông Tin');
      return;
    }
    createGateInJob(
      formData.containerNo,
      formData.isoSize,
      formData.shippingLine,
      Number(formData.tareWeightKg),
      Number(formData.maxPayloadKg)
    );
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    if (!formData.containerNo.trim()) {
      showToast('Số Container không được để trống!', 'error', 'Thiếu Thông Tin');
      return;
    }
    updateJob(editingJob.id, {
      containerNo: formData.containerNo.trim().toUpperCase(),
      isoSize: formData.isoSize,
      shippingLine: formData.shippingLine,
      tareWeightKg: Number(formData.tareWeightKg),
      maxPayloadKg: Number(formData.maxPayloadKg)
    });
    setEditingJob(null);
  };

  const handleConfirmDelete = () => {
    if (deletingJobId) {
      deleteJob(deletingJobId);
      setDeletingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchQuery =
      searchQuery === '' ||
      (job.containerNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.shippingLine || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchShippingLine = shippingLineFilter === 'ALL' || job.shippingLine === shippingLineFilter;

    return matchQuery && matchStatus && matchShippingLine;
  });

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'GATE_IN':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Gate In</span>;
      case 'SURVEYING':
      case 'SURVEYED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">1. Giám Định</span>;
      case 'OPERATION_PENDING':
      case 'PAYMENT_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 animate-pulse">2. Khai Thác / Thu Tiền</span>;
      case 'PAID':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">Đã Thanh Toán</span>;
      case 'ESTIMATE_PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">3. Chờ Duyệt Báo Giá</span>;
      case 'ESTIMATE_APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60">Báo Giá Đã Duyệt</span>;
      case 'ESTIMATE_REJECTED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-700/60">Báo Giá Bị Từ Chối</span>;
      case 'REPAIRING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-950/80 text-orange-300 border border-orange-700/60">4. Đang Sửa Chữa</span>;
      case 'QC_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-950/80 text-teal-300 border border-teal-700/60">5. Chờ QC Nghiệm Thu</span>;
      case 'QC_PASSED':
      case 'YARD_STORED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">Lưu Bãi / Đạt QC</span>;
      case 'GATE_OUT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Đã Xuất Bãi</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  const handleRoleJumpAction = (job: DepotJob) => {
    onSelectJob(job.id);
    if (job.status === 'GATE_IN' || job.status === 'SURVEYING') {
      onNavigateTab('survey');
    } else if (job.status === 'SURVEYED' || job.status === 'OPERATION_PENDING') {
      onNavigateTab('operation');
    } else if (job.status === 'PAYMENT_PENDING') {
      onNavigateTab('payment');
    } else if (job.status === 'ESTIMATE_PENDING_APPROVAL' || job.status === 'PAID') {
      onNavigateTab('estimate');
    } else if (job.status === 'REPAIRING' || job.status === 'ESTIMATE_APPROVED') {
      onNavigateTab('repair');
    } else if (job.status === 'QC_PENDING') {
      onNavigateTab('repair');
    } else {
      onNavigateTab('yard');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter & Create Action Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Lọc Hồ Sơ Container ({filteredJobs.length} Kết quả)</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">-- Tất cả trạng thái --</option>
            <option value="GATE_IN">Mới tiếp nhận (Gate In)</option>
            <option value="SURVEYING">Đang Giám Định</option>
            <option value="OPERATION_PENDING">Khai Thác Lập Phiếu</option>
            <option value="PAYMENT_PENDING">Chờ Thanh Toán</option>
            <option value="ESTIMATE_PENDING_APPROVAL">Chờ Hãng Tàu Duyệt Báo Giá</option>
            <option value="REPAIRING">Đang Sửa Chữa</option>
            <option value="QC_PENDING">Chờ Kiểm Tra QC</option>
            <option value="YARD_STORED">Đã Lưu Bãi</option>
            <option value="GATE_OUT">Đã Xuất Cổng</option>
          </select>

          {/* Shipping Line Filter Dropdown */}
          <select
            value={shippingLineFilter}
            onChange={(e) => setShippingLineFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">-- Tất cả hãng tàu --</option>
            {SHIPPING_LINES.map((line) => (
              <option key={line} value={line}>{line}</option>
            ))}
          </select>

          {/* Create Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tiếp Nhận Container Gate-In</span>
          </button>
        </div>
      </div>

      {/* Main Container Jobs Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700 font-semibold tracking-wider uppercase text-[11px]">
                <th className="p-3">Job ID & Số Container</th>
                <th className="p-3">Kích Thước ISO</th>
                <th className="p-3">Hãng Tàu</th>
                <th className="p-3">Trạng Thái Nghiệp Vụ</th>
                <th className="p-3">Vị Trí Bãi Depot</th>
                <th className="p-3 text-right">Chi Phí / Hóa Đơn</th>
                <th className="p-3 text-center">Thao Tác Tác Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Không tìm thấy hồ sơ container nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const serviceAmount = job.operation?.totalAmount || 0;
                  const repairAmount = job.estimate?.grandTotal || 0;

                  return (
                    <tr key={job.id} className="hover:bg-slate-800/50 transition">
                      {/* Job ID & Container No */}
                      <td className="p-3">
                        <div className="font-mono font-black text-sm text-white tracking-wider">
                          {job.containerNo}
                        </div>
                        <div className="text-[11px] font-mono text-blue-400">
                          {job.id} • Vào: {job.gateInDate}
                        </div>
                      </td>

                      {/* ISO Size */}
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 font-mono font-bold border border-slate-700">
                          {job.isoSize}
                        </span>
                      </td>

                      {/* Shipping Line */}
                      <td className="p-3 font-semibold text-slate-200">
                        {job.shippingLine}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        {getStatusBadge(job.status)}
                      </td>

                      {/* Yard Location */}
                      <td className="p-3 font-mono text-emerald-400 font-medium">
                        Block {job.currentLocation.block.replace('BLOCK_', '')}-B{job.currentLocation.bay}-R{job.currentLocation.row}-T{job.currentLocation.tier}
                      </td>

                      {/* Financial info */}
                      <td className="p-3 text-right font-mono">
                        {serviceAmount > 0 && (
                          <div className="text-slate-200">
                            DV: {serviceAmount.toLocaleString('vi-VN')} VNĐ
                          </div>
                        )}
                        {repairAmount > 0 && (
                          <div className="text-indigo-400 font-bold">
                            SC: {repairAmount.toLocaleString('vi-VN')} VNĐ
                          </div>
                        )}
                        {serviceAmount === 0 && repairAmount === 0 && (
                          <span className="text-slate-500">Chưa lập giá</span>
                        )}
                      </td>

                      {/* Action buttons (View, Edit, Delete, Process, Gate Out) */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => onSelectJob(job.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded border border-slate-700 transition inline-flex items-center gap-1 cursor-pointer"
                          title="Xem toàn bộ hồ sơ Depot Job"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-semibold rounded border border-amber-800 transition inline-flex items-center gap-1 cursor-pointer"
                          title="Sửa thông tin container"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        <button
                          onClick={() => setDeletingJobId(job.id)}
                          className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-semibold rounded border border-rose-800 transition inline-flex items-center gap-1 cursor-pointer"
                          title="Xóa hồ sơ container"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>

                        <button
                          onClick={() => handleRoleJumpAction(job)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition inline-flex items-center gap-1 shadow cursor-pointer"
                          title="Chuyển đến công đoạn tiếp theo"
                        >
                          <span>Xử Lý</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {job.status === 'YARD_STORED' && (
                          <button
                            onClick={() => {
                              processGateOut(job.id);
                              alert(`✅ Container ${job.containerNo} đã được làm thủ tục Xuất Cổng (Gate-Out)!`);
                            }}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded transition inline-flex items-center gap-1 cursor-pointer"
                            title="Thủ tục xuất bãi"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Out</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Tiếp Nhận Gate-In Container Mới</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Số Container (VD: MSCU1234567)</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số Container..."
                  value={formData.containerNo}
                  onChange={(e) => setFormData({ ...formData, containerNo: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kích Thước ISO</label>
                  <select
                    value={formData.isoSize}
                    onChange={(e) => setFormData({ ...formData, isoSize: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="20GP">20GP (Dry Van)</option>
                    <option value="40GP">40GP (Dry Van)</option>
                    <option value="40HC">40HC (High Cube)</option>
                    <option value="45HC">45HC (High Cube)</option>
                    <option value="20RF">20RF (Reefer Lạnh)</option>
                    <option value="40RH">40RH (Reefer High)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hãng Tàu Khai Thác</label>
                  <select
                    value={formData.shippingLine}
                    onChange={(e) => setFormData({ ...formData, shippingLine: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    {SHIPPING_LINES.map((line) => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trọng Lượng Vỏ (Tare - Kg)</label>
                  <input
                    type="number"
                    value={formData.tareWeightKg}
                    onChange={(e) => setFormData({ ...formData, tareWeightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tải Trọng Tối Đa (Max Payload - Kg)</label>
                  <input
                    type="number"
                    value={formData.maxPayloadKg}
                    onChange={(e) => setFormData({ ...formData, maxPayloadKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Xác Nhận Gate-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <span>Chỉnh Sửa Thông Tin Container ({editingJob.id})</span>
              </h3>
              <button onClick={() => setEditingJob(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Số Container</label>
                <input
                  type="text"
                  required
                  value={formData.containerNo}
                  onChange={(e) => setFormData({ ...formData, containerNo: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kích Thước ISO</label>
                  <select
                    value={formData.isoSize}
                    onChange={(e) => setFormData({ ...formData, isoSize: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="20GP">20GP</option>
                    <option value="40GP">40GP</option>
                    <option value="40HC">40HC</option>
                    <option value="45HC">45HC</option>
                    <option value="20RF">20RF</option>
                    <option value="40RH">40RH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hãng Tàu</label>
                  <select
                    value={formData.shippingLine}
                    onChange={(e) => setFormData({ ...formData, shippingLine: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {SHIPPING_LINES.map((line) => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trọng Lượng Vỏ (Tare - Kg)</label>
                  <input
                    type="number"
                    value={formData.tareWeightKg}
                    onChange={(e) => setFormData({ ...formData, tareWeightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tải Trọng Tối Đa (Max Payload - Kg)</label>
                  <input
                    type="number"
                    value={formData.maxPayloadKg}
                    onChange={(e) => setFormData({ ...formData, maxPayloadKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingJobId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-rose-950 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Xác Nhận Xóa Hồ Sơ Container?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hành động này sẽ xóa hoàn toàn hồ sơ công việc <span className="font-mono text-rose-400">{deletingJobId}</span> và mọi nhật ký giám định khỏi hệ thống.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingJobId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
