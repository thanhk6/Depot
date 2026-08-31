import React, { useState } from 'react';
import {
  Droplets,
  CheckCircle2,
  Clock,
  Camera,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Filter,
  Search,
  Building,
  Check,
  AlertTriangle,
  Flame,
  Gauge,
  FileText,
  Printer,
  Calendar,
  Layers,
  Container as ContainerIcon,
  RefreshCw,
  Phone
} from 'lucide-react';
import { ContainerRecord } from '../../../services/mockDataStore';
import { CleaningExecutionRecord, CleaningWorkItem } from '../types';

interface CleaningExecutionPageProps {
  containers?: ContainerRecord[];
  onCompleteCleaning?: (
    containerId: string,
    cleaningData: {
      qualityGrade: 'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE';
      cleaningStaff: string;
      notes: string;
      totalCost: number;
    }
  ) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const CleaningExecutionPage: React.FC<CleaningExecutionPageProps> = ({
  containers = [],
  onCompleteCleaning,
  onNavigateTab
}) => {
  const [cleaningOrders, setCleaningOrders] = useState<CleaningExecutionRecord[]>(() => containers
    .filter((container) => container.condition === 'CL')
    .map((container: any) => ({
      id: String(container.id), containerId: String(container.id), containerNo: container.containerNo, isoCode: container.isoCode,
      size: container.size, type: container.type, shippingLine: container.shippingLine, owner: container.shippingLine,
      surveyNo: '', eeirNo: '', cleaningBay: '', status: 'PENDING_CLEANING', surveyCondition: 'CL', cleaningStaff: '',
      waterPressureBar: 0, targetQualityGrade: 'GRADE_A', beforeCleaningPhoto: '', beforePhotoTimestamp: '',
      afterCleaningPhoto: '', afterPhotoTimestamp: '', items: [], totalCost: 0
    })) as CleaningExecutionRecord[]);

  // Filter and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_CLEANING' | 'IN_CLEANING' | 'CLEANED' | 'HANDOVER_TO_OPERATION'>('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    cleaningOrders[0]?.id || ''
  );

  // Form State for Active Cleaning Work
  const selectedOrder = cleaningOrders.find((o) => o.id === selectedOrderId) || cleaningOrders[0];

  const [activeItems, setActiveItems] = useState<CleaningWorkItem[]>(selectedOrder?.items || []);
  const [staffName, setStaffName] = useState(selectedOrder?.cleaningStaff || '');
  const [pressureBar, setPressureBar] = useState(selectedOrder?.waterPressureBar || 0);
  const [chemicalName, setChemicalName] = useState(selectedOrder?.chemicalUsed || '');
  const [chemicalVolume, setChemicalVolume] = useState(selectedOrder?.chemicalVolumeLiters || 0);
  const [targetGrade, setTargetGrade] = useState<'GRADE_A' | 'FOOD_GRADE' | 'GENERAL_CARGO' | 'SCRAP_GRADE'>(
    selectedOrder?.targetQualityGrade || 'GRADE_A'
  );
  const [notes, setNotes] = useState(selectedOrder?.cleaningNotes || '');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    selectedOrder?.afterCleaningPhoto ||
      ''
  );
  const [afterPhotoTime, setAfterPhotoTime] = useState(
    selectedOrder?.afterPhotoTimestamp || ''
  );

  // Success modal state
  const [completedSuccessModal, setCompletedSuccessModal] = useState<CleaningExecutionRecord | null>(null);

  // When selected order changes, sync form state
  const handleSelectOrder = (order: CleaningExecutionRecord) => {
    setSelectedOrderId(order.id);
    setActiveItems(order.items);
    setStaffName(order.cleaningStaff);
    setPressureBar(order.waterPressureBar || 0);
    setChemicalName(order.chemicalUsed || '');
    setChemicalVolume(order.chemicalVolumeLiters || 0);
    setTargetGrade(order.targetQualityGrade || 'GRADE_A');
    setNotes(order.cleaningNotes || '');
    setAfterPhotoUrl(
      order.afterCleaningPhoto || ''
    );
    setAfterPhotoTime(order.afterPhotoTimestamp || '');
  };

  // Toggle single checklist item
  const handleToggleItem = (itemId: string) => {
    const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    setActiveItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStatus = !item.isCompleted;
          return {
            ...item,
            isCompleted: newStatus,
            completedAt: newStatus ? timestamp : undefined,
            completedBy: newStatus ? staffName : undefined
          };
        }
        return item;
      })
    );
  };

  // Mark all items as done
  const handleCompleteAllItems = () => {
    const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    setActiveItems((prev) =>
      prev.map((item) => ({
        ...item,
        isCompleted: true,
        completedAt: timestamp,
        completedBy: staffName
      }))
    );
  };

  // Complete Cleaning and Handover to Operation
  const handleFinalizeAndHandover = () => {
    if (!selectedOrder) return;

    const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const updatedOrder: CleaningExecutionRecord = {
      ...selectedOrder,
      status: 'HANDOVER_TO_OPERATION',
      items: activeItems,
      cleaningStaff: staffName,
      waterPressureBar: pressureBar,
      chemicalUsed: chemicalName,
      chemicalVolumeLiters: chemicalVolume,
      targetQualityGrade: targetGrade,
      cleaningNotes: notes,
      afterCleaningPhoto: afterPhotoUrl,
      afterPhotoTimestamp: timestamp,
      completedAt: timestamp,
      handoverToOperationDate: timestamp,
      handoverActor: staffName
    };

    // Update local state
    setCleaningOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o))
    );

    // Trigger parent callback to sync global container state from CL to AV & READY_FOR_USE
    if (onCompleteCleaning) {
      onCompleteCleaning(selectedOrder.containerId || selectedOrder.containerNo, {
        qualityGrade: targetGrade,
        cleaningStaff: staffName,
        notes: notes || `Hoàn tất vệ sinh theo danh mục e-EIR ${selectedOrder.eeirNo}. Đã chuyển sang AV sẵn sàng khai thác.`,
        totalCost: selectedOrder.totalCost
      });
    }

    setCompletedSuccessModal(updatedOrder);
  };

  // Filtered orders list
  const filteredOrders = cleaningOrders.filter((order) => {
    const matchesSearch =
      order.containerNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.eeirNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const allItemsCompleted = activeItems.length > 0 && activeItems.every((it) => it.isCompleted);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-gradient-to-tr from-amber-500/30 to-amber-600/20 border border-amber-500/40 text-amber-400 rounded-2xl shadow-inner">
            <Droplets className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Vệ Sinh Container Theo Danh Mục Giám Định (Cleaning Bay)
              </h2>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded-full border border-amber-500/30">
                Nghiệp Vụ 2: Vệ Sinh &rarr; Khai Thác
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Nhân viên vệ sinh thực hiện đúng theo các hạng mục do Giám định (Surveyor) chỉ định trên e-EIR &bull; Nghiệm thu chuyển vỏ sang <strong className="text-emerald-400">AV (Available)</strong> sẵn sàng cấp trả.
            </p>
          </div>
        </div>

        {/* Quick Bay Status Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Hệ Thống Nước Áp Lực:</span>
            <strong className="text-emerald-400 font-mono">200 Bar (Sẵn Sàng)</strong>
          </div>
          <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="text-slate-400">Nước Nóng &amp; Sấy Khô:</span>
            <strong className="text-amber-400 font-mono">80°C (Active)</strong>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Chờ &amp; Đang Vệ Sinh</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {cleaningOrders.filter((o) => o.status === 'PENDING_CLEANING' || o.status === 'IN_CLEANING').length}
            </span>
            <Droplets className="w-5 h-5 text-amber-500/60" />
          </div>
          <span className="text-[10px] text-slate-500">Tại các bệ rửa Bay 01 &bull; 02 &bull; 03</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Đã Vệ Sinh Xong</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {cleaningOrders.filter((o) => o.status === 'CLEANED').length}
            </span>
            <Sparkles className="w-5 h-5 text-cyan-500/60" />
          </div>
          <span className="text-[10px] text-slate-500">Đã sạch sẽ &bull; Sẵn sàng bàn giao</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Đã Chuyển Khai Thác (AV)</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {cleaningOrders.filter((o) => o.status === 'HANDOVER_TO_OPERATION').length}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
          </div>
          <span className="text-[10px] text-slate-500">Sẵn sàng cấp cho chủ hàng đóng xuất</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Doanh Thu Vệ Sinh Hôm Nay</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white font-mono">
              {cleaningOrders.reduce((acc, curr) => acc + curr.totalCost, 0).toLocaleString('vi-VN')} đ
            </span>
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] text-slate-500">Theo biểu cước Tariff tiêu chuẩn</span>
        </div>
      </div>

      {/* 3. Main Workspace: Left Queue + Right Execution Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Container Queue at Cleaning Bay (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ContainerIcon className="w-4 h-4 text-cyan-400" />
                <span>Hàng Đợi Vệ Sinh Bệ Rửa ({filteredOrders.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Bay 1-3</span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm số Container, e-EIR, hãng tàu..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                {[
                  { id: 'ALL', label: 'Tất Cả' },
                  { id: 'PENDING_CLEANING', label: 'Chờ Làm' },
                  { id: 'IN_CLEANING', label: 'Đang Rửa' },
                  { id: 'CLEANED', label: 'Đã Rửa' },
                  { id: 'HANDOVER_TO_OPERATION', label: 'Đã Bàn Giao (AV)' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-cyan-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Container Items */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl space-y-2">
                  <Droplets className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">Không tìm thấy container phù hợp</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = order.id === selectedOrder?.id;
                  const completedCount = order.items.filter((i) => i.isCompleted).length;
                  const totalCount = order.items.length;

                  return (
                    <div
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black font-mono text-white tracking-wider">
                              {order.containerNo}
                            </span>
                            <span className="px-1.5 py-0.2 bg-slate-800 text-cyan-300 font-mono text-[9px] rounded font-bold">
                              {order.size} {order.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {order.shippingLine} &bull; <span className="font-mono text-slate-500">{order.eeirNo}</span>
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {order.status === 'HANDOVER_TO_OPERATION' ? (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>AV (Khai Thác)</span>
                            </span>
                          ) : order.status === 'CLEANED' ? (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-md text-[10px] font-bold">
                              Đã Sạch
                            </span>
                          ) : order.status === 'IN_CLEANING' ? (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-bold animate-pulse">
                              Đang Rửa
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-bold">
                              Chờ Rửa
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items Progress & Bay */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {order.cleaningBay}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-slate-400">Hạng mục:</span>
                          <strong className={completedCount === totalCount ? 'text-emerald-400' : 'text-amber-400'}>
                            {completedCount}/{totalCount}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Cleaning Execution Form & Handover Panel (7 Cols) */}
        {selectedOrder ? (
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
              {/* Top Container Header in Execution Form */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white font-mono">
                      {selectedOrder.containerNo}
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold font-mono">
                      CL &rarr; AV
                    </span>
                    <span className="text-xs text-slate-400">
                      ({selectedOrder.size} {selectedOrder.type} - {selectedOrder.shippingLine})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Mã e-EIR: <strong className="text-cyan-400 font-mono">{selectedOrder.eeirNo}</strong> &bull; Vị trí: <strong className="text-slate-200">{selectedOrder.cleaningBay}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-950 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono font-bold">
                    Tổng Cước: <strong className="text-amber-400">{selectedOrder.totalCost.toLocaleString('vi-VN')} đ</strong>
                  </span>
                </div>
              </div>

              {/* SECTION A: SURVEY CLEANING SPECIFICATIONS (Danh mục giám định quy định) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span>1. Danh Mục Vệ Sinh Giám Định Chỉ Định (Survey Specifications)*</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Nhân viên vệ sinh tích chọn từng hạng mục sau khi hoàn tất thi công thực tế:
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompleteAllItems}
                    className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Hoàn Tất Tất Cả</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {activeItems.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        item.isCompleted
                          ? 'bg-emerald-950/30 border-emerald-600/60 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                            item.isCompleted
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'bg-slate-900 border-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-cyan-400 text-[11px]">
                              [{item.cleaningCode}]
                            </span>
                            <span className={`font-bold ${item.isCompleted ? 'text-white' : 'text-slate-200'}`}>
                              {item.cleaningName}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            {item.chemicalRequired && (
                              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-semibold text-[10px]">
                                {item.chemicalName || 'Hóa chất kiềm'}
                              </span>
                            )}
                            <span>Thời gian định mức: {item.estimatedDurationMin} phút</span>
                            <span>Đơn giá: {item.totalPrice.toLocaleString('vi-VN')} đ</span>
                          </div>

                          {item.notes && (
                            <p className="text-[10px] text-amber-300 italic">
                              Ghi chú kỹ thuật: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 text-[10px] font-mono">
                        {item.isCompleted ? (
                          <span className="text-emerald-400 font-bold block">
                            ✓ {item.completedAt ? `Xong lúc ${item.completedAt}` : 'Đã thực hiện'}
                          </span>
                        ) : (
                          <span className="text-slate-500 block">Chưa làm</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: TECHNICAL LOGS & STAFF DETAILS */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>2. Thông Số Thi Công &amp; Nhân Viên Phụ Trách</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Nhân Viên Vệ Sinh Phụ Trách*
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="Họ tên nhân viên vệ sinh"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Áp Lực Xịt Rửa Thực Tế (Bar)
                    </label>
                    <select
                      value={pressureBar}
                      onChange={(e) => setPressureBar(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono font-bold text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value={150}>150 Bar - Xịt rửa bụi nhẹ</option>
                      <option value={180}>180 Bar - Áp lực tiêu chuẩn</option>
                      <option value={200}>200 Bar - Xịt rửa áp lực cao cặn bẩn bám dính</option>
                      <option value={250}>250 Bar - Tẩy rỉ sét bề mặt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Hóa Chất / Dung Môi Đã Dùng
                    </label>
                    <input
                      type="text"
                      value={chemicalName}
                      onChange={(e) => setChemicalName(e.target.value)}
                      placeholder="Tên hóa chất (VD: Alkaline D-30, Khử trùng FDA...)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Lượng Hóa Chất Sử Dụng (Lít)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={chemicalVolume}
                      onChange={(e) => setChemicalVolume(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: BEFORE & AFTER PHOTOS WITH TIMESTAMP */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>3. Ảnh Minh Chứng Trước &amp; Sau Khi Vệ Sinh (Timestamped Photos)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">IICL-6 / QC Compliant</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-bold">[01] TRƯỚC KHI VỆ SINH:</span>
                      <span className="text-[10px] font-mono text-slate-400">{selectedOrder.beforePhotoTimestamp}</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden h-36 bg-slate-900 border border-slate-800">
                      <img
                        src={selectedOrder.beforeCleaningPhoto}
                        alt="Trước vệ sinh"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-amber-300 font-mono text-[9px] rounded font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{selectedOrder.beforePhotoTimestamp}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">Hiện trạng dơ bẩn / tanh mỡ lúc Gate-In</p>
                  </div>

                  {/* After Photo */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold">[02] SAU KHI VỆ SINH XONG:</span>
                      <span className="text-[10px] font-mono text-slate-400">{afterPhotoTime}</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden h-36 bg-slate-900 border border-slate-800">
                      <img
                        src={afterPhotoUrl}
                        alt="Sau vệ sinh"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-emerald-300 font-mono text-[9px] rounded font-bold flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{afterPhotoTime}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">Vỏ sạch sáng 100%, sàn khô ráo đạt chuẩn</p>
                  </div>
                </div>
              </div>

              {/* SECTION D: QUALITY GRADE ASSIGNMENT & REMARKS */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>4. Nghiệm Thu &amp; Cấp Phân Hạng Chất Lượng (Quality Grading)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Phân Hạng Chất Lượng Sau Vệ Sinh (Grade)*
                    </label>
                    <select
                      value={targetGrade}
                      onChange={(e) => setTargetGrade(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="GRADE_A">Grade A - Đóng Hàng Xuất Khẩu Cao Cấp / Điện Tử</option>
                      <option value="FOOD_GRADE">Food Grade - Đóng Nông Sản, Cà Phê, Thực Phẩm</option>
                      <option value="GENERAL_CARGO">General Cargo - Đóng Bách Hóa Tiêu Chuẩn</option>
                      <option value="SCRAP_GRADE">Scrap Grade - Hàng Nặng / Phế Liệu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Ghi Chú Nghiệm Thu Của Nhân Viên Vệ Sinh
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ghi chú kết quả hoàn thành..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION E: PRIMARY ACTION BUTTONS */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {allItemsCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Tất cả {activeItems.length} hạng mục giám định đã hoàn thành!
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Còn {activeItems.filter((i) => !i.isCompleted).length} hạng mục chưa tick hoàn tất.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeAndHandover}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>HOÀN TẤT VỆ SINH &amp; CHUYỂN QUA KHAI THÁC (AV)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
            <Droplets className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">Chưa chọn container nào</h4>
            <p className="text-xs text-slate-400">
              Vui lòng chọn một container từ danh sách hàng đợi bên trái để thực hiện quy trình vệ sinh.
            </p>
          </div>
        )}
      </div>

      {/* 4. Success Handover Modal (Chuyển Thành Công Sang Khai Thác) */}
      {completedSuccessModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-scale-up text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">
                HOÀN TẤT VỆ SINH &amp; ĐÃ CHUYỂN SANG KHAI THÁC!
              </h3>
              <p className="text-xs text-slate-300">
                Container <strong className="font-mono text-emerald-400 text-sm">{completedSuccessModal.containerNo}</strong> đã thực hiện đầy đủ {completedSuccessModal.items.length} hạng mục giám định quy định và chuyển sang trạng thái:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-950 border border-emerald-700/80 rounded-xl text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AV (AVAILABLE / ĐẠT CHUẨN CẤP TRẢ) &bull; {completedSuccessModal.targetQualityGrade.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Mã e-EIR:</span>
                <span className="font-mono font-bold text-white">{completedSuccessModal.eeirNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nhân viên vệ sinh:</span>
                <span className="font-bold text-white">{completedSuccessModal.cleaningStaff}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời điểm bàn giao:</span>
                <span className="font-mono text-emerald-400">{completedSuccessModal.completedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chỉ định khu bãi:</span>
                <span className="font-bold text-blue-400">AV Area (Khu Container Sạch Sẵn Sàng Cấp)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletedSuccessModal(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Tiếp Tục Vệ Sinh Cont Khác
              </button>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    setCompletedSuccessModal(null);
                    onNavigateTab('gate');
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Chuyển Sang Cổng Khai Thác</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
