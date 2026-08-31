import React, { useState, useEffect } from 'react';
import { useDepot } from '../../context/DepotContext';
import {
  ContainerSize,
  DamageItem,
  DepotJob,
  SurveyPhoto,
  YardLocation
} from '../../types/depot';
import {
  MASTER_DAMAGE_CODES,
  MASTER_COMPONENTS,
  SHIPPING_LINES
} from '../../data/depotMasterData';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  MapPin,
  Truck,
  Warehouse,
  Pencil,
  Save,
  RotateCcw,
  Layers
} from 'lucide-react';

interface SurveyModuleProps {
  onNavigateTab?: (tab: string) => void;
}

export const SurveyModule: React.FC<SurveyModuleProps> = ({ onNavigateTab }) => {
  const { jobs, saveSurvey, updateJob, setSelectedJobId, showToast } = useDepot();

  // Selected container to survey
  const pendingSurveyJobs = jobs.filter(
    (j) => j.status === 'GATE_IN' || j.status === 'SURVEYING' || j.status === 'SURVEYED' || j.status === 'YARD_STORED'
  );

  const [selectedJobId, setLocalSelectedJobId] = useState<string>(
    pendingSurveyJobs[0]?.id || jobs[0]?.id || ''
  );

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  // Container Specs Edit Form State
  const [editContainerNo, setEditContainerNo] = useState(activeJob?.containerNo || '');
  const [editIsoSize, setEditIsoSize] = useState<ContainerSize>(activeJob?.isoSize || '20GP');
  const [editShippingLine, setEditShippingLine] = useState(activeJob?.shippingLine || 'MAERSK LINE');
  const [editTareWeight, setEditTareWeight] = useState<number>(activeJob?.tareWeightKg || 2200);
  const [editMaxPayload, setEditMaxPayload] = useState<number>(activeJob?.maxPayloadKg || 28200);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);

  // Form State
  const [conditionRating, setConditionRating] = useState<'A' | 'B' | 'C' | 'D'>(
    activeJob?.survey?.conditionRating || 'C'
  );
  const [surveyorName, setSurveyorName] = useState(
    activeJob?.survey?.surveyorName || 'Phạm Quốc Bảo (Giám Định Viên)'
  );
  const [generalNotes, setGeneralNotes] = useState(
    activeJob?.survey?.generalNotes || 'Container kết cấu tổng thể bình thường, có một số hư hỏng nhẹ do va quệt tàu.'
  );

  // Damage items list for active job
  const [damages, setDamages] = useState<DamageItem[]>(
    activeJob?.survey?.damages || []
  );

  // Photos
  const [photos, setPhotos] = useState<SurveyPhoto[]>(
    activeJob?.survey?.photos || [
      { id: 'P1', angle: 'LEFT', angleVi: 'Mặt bên trái', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', timestamp: new Date().toISOString().substring(0, 16) },
      { id: 'P2', angle: 'BACK', angleVi: 'Cửa sau', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80', timestamp: new Date().toISOString().substring(0, 16) }
    ]
  );

  // New damage entry state
  const [newComponent, setNewComponent] = useState(MASTER_COMPONENTS[0]);
  const [newDamageCode, setNewDamageCode] = useState(MASTER_DAMAGE_CODES[0].code);
  const [newLocationCode, setNewLocationCode] = useState('L1');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newSeverity, setNewSeverity] = useState<'LIGHT' | 'MEDIUM' | 'HEAVY'>('MEDIUM');
  const [newNotes, setNewNotes] = useState('');

  // Sync state if selected job changes
  useEffect(() => {
    if (activeJob) {
      setEditContainerNo(activeJob.containerNo);
      setEditIsoSize(activeJob.isoSize);
      setEditShippingLine(activeJob.shippingLine);
      setEditTareWeight(activeJob.tareWeightKg || 2200);
      setEditMaxPayload(activeJob.maxPayloadKg || 28200);

      if (activeJob.survey) {
        setConditionRating(activeJob.survey.conditionRating);
        setDamages(activeJob.survey.damages || []);
        setPhotos(activeJob.survey.photos || []);
        setGeneralNotes(activeJob.survey.generalNotes || '');
        if (activeJob.survey.surveyorName) setSurveyorName(activeJob.survey.surveyorName);
      } else {
        setDamages([]);
      }
    }
  }, [activeJob?.id]);

  const handleSelectJob = (id: string) => {
    setLocalSelectedJobId(id);
    const target = jobs.find((j) => j.id === id);
    if (target) {
      setEditContainerNo(target.containerNo);
      setEditIsoSize(target.isoSize);
      setEditShippingLine(target.shippingLine);
      setEditTareWeight(target.tareWeightKg || 2200);
      setEditMaxPayload(target.maxPayloadKg || 28200);
      if (target.survey) {
        setConditionRating(target.survey.conditionRating);
        setDamages(target.survey.damages || []);
        setPhotos(target.survey.photos || []);
        setGeneralNotes(target.survey.generalNotes || '');
      } else {
        setDamages([]);
      }
    }
  };

  const handleSaveContainerSpecs = () => {
    if (!activeJob) return;
    const cleanedContainerNo = editContainerNo.trim().toUpperCase() || activeJob.containerNo;
    updateJob(activeJob.id, {
      containerNo: cleanedContainerNo,
      isoSize: editIsoSize,
      shippingLine: editShippingLine,
      tareWeightKg: Number(editTareWeight) || activeJob.tareWeightKg,
      maxPayloadKg: Number(editMaxPayload) || activeJob.maxPayloadKg
    });
    setIsEditingSpecs(false);
    showToast(`Đã cập nhật thông tin vỏ Container [${cleanedContainerNo}] thành công!`, 'success', 'Cập Nhật Thông Tin Vỏ');
  };

  const handleAddDamage = () => {
    const matchedMaster = MASTER_DAMAGE_CODES.find((m) => m.code === newDamageCode) || MASTER_DAMAGE_CODES[0];
    const laborHours = newSeverity === 'LIGHT' ? 1.0 : newSeverity === 'MEDIUM' ? 2.0 : 3.5;
    const laborRate = matchedMaster.unitPriceLabor;
    const materialCost = matchedMaster.unitPriceMaterial;
    const totalCost = laborHours * laborRate + materialCost;

    const newItem: DamageItem = {
      id: `DMG-${Date.now().toString().slice(-5)}`,
      component: newComponent,
      damageCode: matchedMaster.code,
      damageNameVi: matchedMaster.nameVi,
      locationCode: newLocationCode,
      repairCode: matchedMaster.defaultRepair,
      repairNameVi: matchedMaster.defaultRepairVi,
      quantity: newQuantity,
      unit: 'vị trí',
      laborHours,
      laborRate,
      materialCost,
      totalCost,
      severity: newSeverity,
      notes: newNotes
    };

    setDamages([...damages, newItem]);
    setNewNotes('');
    showToast(`Đã thêm vị trí hư hỏng [${matchedMaster.nameVi}] thành công!`, 'success', 'Thêm Hư Hỏng');
  };

  const handleRemoveDamage = (id: string) => {
    setDamages(damages.filter((d) => d.id !== id));
    showToast('Đã xóa vị trí hư hỏng khỏi danh sách!', 'info', 'Đã Xóa Hư Hỏng');
  };

  const handleAddSamplePhoto = (angleVi: string) => {
    const newPhoto = {
      id: `P-${Date.now()}`,
      angle: 'FRONT' as const,
      angleVi,
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
      timestamp: new Date().toISOString().substring(0, 16)
    };
    setPhotos([...photos, newPhoto]);
    showToast(`Đã đính kèm ảnh giám định [${angleVi}] thành công!`, 'success', 'Đính Kèm Ảnh');
  };

  const handleCompleteSurvey = () => {
    if (!activeJob) {
      showToast('Vui lòng chọn container trước khi lưu giám định!', 'error', 'Chưa Chọn Container');
      return;
    }

    const cleanedContainerNo = editContainerNo.trim().toUpperCase() || activeJob.containerNo;
    updateJob(activeJob.id, {
      containerNo: cleanedContainerNo,
      isoSize: editIsoSize,
      shippingLine: editShippingLine,
      tareWeightKg: Number(editTareWeight) || activeJob.tareWeightKg,
      maxPayloadKg: Number(editMaxPayload) || activeJob.maxPayloadKg
    });

    saveSurvey(
      activeJob.id,
      {
        surveyorId: 'NV-GD01',
        surveyorName,
        conditionRating,
        damages,
        photos,
        generalNotes
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-amber-900/60 to-slate-900 border border-amber-700/50 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600 rounded-xl text-white shadow-lg shadow-amber-600/30">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">1. Công Đoạn Giám Định Hiện Trạng (Survey)</h2>
            <p className="text-xs text-amber-200/80">
              Kiểm tra & nhập thông tin container, hư hỏng hòm vỏ & hạ container lưu bãi
            </p>
          </div>
        </div>

        {/* Container Selector dropdown & Category Menu Shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('categories')}
              className="px-3 py-2 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-600/80 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              title="Mở Danh Mục Kích Thước Container"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Menu Danh Mục Kích Thước ISO</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-amber-200 whitespace-nowrap">Chọn Container:</label>
            <select
              value={selectedJobId}
              onChange={(e) => handleSelectJob(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-amber-600/50 rounded-xl text-xs text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 min-w-[200px]"
            >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.containerNo} ({j.isoSize} - {j.status})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

      {activeJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Container Specs & Inspector Form */}
          <div className="lg:col-span-1 space-y-4">
            {/* Card: Container Info & Input Form */}
            <div className="bg-slate-900 border border-amber-600/40 rounded-2xl p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Nhập Thông Tin Vỏ Container (Giám Định)</span>
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                  {activeJob?.id}
                </span>
              </div>

              {/* Form inputs for container specs directly editable */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Số Container (Container No.):</span>
                    <span className="text-[10px] text-amber-400/80 font-normal">Định dạng 4 chữ + 7 số</span>
                  </label>
                  <input
                    type="text"
                    value={editContainerNo}
                    onChange={(e) => setEditContainerNo(e.target.value.toUpperCase())}
                    placeholder="VD: MSKU1234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-600/60 rounded-xl text-sm font-mono font-bold text-amber-300 focus:ring-2 focus:ring-amber-500 tracking-wider shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Kích thước ISO (Type):
                    </label>
                    <select
                      value={editIsoSize}
                      onChange={(e) => setEditIsoSize(e.target.value as ContainerSize)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:border-amber-500"
                    >
                      <option value="20GP">20GP (20 Feet Khô)</option>
                      <option value="40GP">40GP (40 Feet Khô)</option>
                      <option value="40HC">40HC (40 Feet Cao)</option>
                      <option value="45HC">45HC (45 Feet Cao)</option>
                      <option value="20RF">20RF (20 Feet Lạnh)</option>
                      <option value="40RH">40RH (40 Feet Lạnh)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Hãng Tàu Owner:
                    </label>
                    <select
                      value={editShippingLine}
                      onChange={(e) => setEditShippingLine(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:border-amber-500"
                    >
                      {SHIPPING_LINES.map((sl) => (
                        <option key={sl} value={sl}>
                          {sl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Bì Vỏ Tare (kg):
                    </label>
                    <input
                      type="number"
                      value={editTareWeight}
                      onChange={(e) => setEditTareWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tải Trọng Max (kg):
                    </label>
                    <input
                      type="number"
                      value={editMaxPayload}
                      onChange={(e) => setEditMaxPayload(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Thời gian hạ Gate-In: <strong className="text-slate-200 font-mono">{activeJob.gateInDate}</strong></span>
                  <button
                    type="button"
                    onClick={handleSaveContainerSpecs}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Cập Nhật Thông Tin Vỏ</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phân Loại Chất Lượng Vỏ Container (Rating)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['A', 'B', 'C', 'D'] as const).map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setConditionRating(grade)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        conditionRating === grade
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Loại {grade}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Loại A: Hoàn hảo • Loại B: Hư hỏng nhẹ • Loại C: Cần sửa chữa • Loại D: Hư hỏng nặng
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Giám Định Viên</label>
                <input
                  type="text"
                  value={surveyorName}
                  onChange={(e) => setSurveyorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú Tổng Quan Giám Định</label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            {/* Card: Add Damage Item Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Thêm Vị Trí Hư Hỏng Mới</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Bộ Phận Bị Hư Hỏng</label>
                  <select
                    value={newComponent}
                    onChange={(e) => setNewComponent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    {MASTER_COMPONENTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Mã Hư Hỏng (Damage)</label>
                    <select
                      value={newDamageCode}
                      onChange={(e) => setNewDamageCode(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    >
                      {MASTER_DAMAGE_CODES.map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.code} - {m.nameVi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Vị Trí Tọa Độ</label>
                    <input
                      type="text"
                      placeholder="VD: L1, R3, T2"
                      value={newLocationCode}
                      onChange={(e) => setNewLocationCode(e.target.value.toUpperCase())}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Mức Độ Hư Hỏng</label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="LIGHT">Nhẹ (Light)</option>
                      <option value="MEDIUM">Trung bình (Medium)</option>
                      <option value="HEAVY">Nặng (Heavy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Số Lượng / Điểm</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Ghi Chú Chi Tiết Hư Hỏng</label>
                  <input
                    type="text"
                    placeholder="VD: Móp sâu 2cm, thủng góc..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddDamage}
                  className="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ghi Nhận Vị Trí Hư Hỏng Vào Bảng</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Damages Table & Photos & Finish Button */}
          <div className="lg:col-span-2 space-y-4">
            {/* Damages Table Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Danh Sách Hư Hỏng Đã Ghi Nhận ({damages.length})</span>
                </h3>
                <span className="text-xs text-amber-300 font-mono">
                  Tổng ước tính sơ bộ: {damages.reduce((sum, d) => sum + d.totalCost, 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>

              {damages.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-400 text-xs">
                  <AlertTriangle className="w-8 h-8 text-amber-400/60 mx-auto mb-2" />
                  Container hiện chưa ghi nhận hư hỏng nào.
                  <br />
                  Nếu container nguyên vẹn (Grade A), bấm "Hoàn Thành Giám Định" bên dưới.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold">
                        <th className="p-2.5">Bộ Phận</th>
                        <th className="p-2.5">Damage Code</th>
                        <th className="p-2.5">Vị Trí</th>
                        <th className="p-2.5">Mã Sửa Chữa</th>
                        <th className="p-2.5 text-center">Mức Độ</th>
                        <th className="p-2.5 text-right">Ước Tính (VNĐ)</th>
                        <th className="p-2.5 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {damages.map((dmg) => (
                        <tr key={dmg.id} className="hover:bg-slate-800/50 transition">
                          <td className="p-2.5 font-medium text-slate-200">{dmg.component}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 font-mono font-bold border border-amber-800/50">
                              {dmg.damageCode}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{dmg.damageNameVi}</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-300">{dmg.locationCode}</td>
                          <td className="p-2.5">
                            <span className="text-blue-400 font-medium">{dmg.repairCode}</span>
                            <span className="text-[10px] text-slate-400 block">{dmg.repairNameVi}</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                dmg.severity === 'LIGHT'
                                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50'
                                  : dmg.severity === 'MEDIUM'
                                  ? 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
                                  : 'bg-rose-900/40 text-rose-300 border border-rose-800/50'
                              }`}
                            >
                              {dmg.severity === 'LIGHT' ? 'Nhẹ' : dmg.severity === 'MEDIUM' ? 'T.Bình' : 'Nặng'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                            {dmg.totalCost.toLocaleString('vi-VN')}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => handleRemoveDamage(dmg.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Photos & Camera Capture Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>Hình Ảnh Chụp Hiện Trạng Container ({photos.length})</span>
                </h3>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddSamplePhoto('Góc vách bên')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Chụp Thêm Ảnh</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={photo.url} alt={photo.angleVi} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center text-[10px] text-white">
                      {photo.angleVi} ({photo.timestamp})
                    </div>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] font-semibold text-slate-300">
                      {photo.angleVi}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Survey Button Bar */}
            <div className="bg-slate-900 border border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900">
              <div className="text-xs text-slate-300">
                ✔️ Hoàn thành giám định sẽ tự động cập nhật phân loại Grade <strong>{conditionRating}</strong>, lưu danh sách hư hỏng & hình ảnh, sau đó chuyển container sang trạng thái <strong>ĐÃ GIÁM ĐỊNH (SURVEYED)</strong> cho Bộ phận Khai thác tiếp nhận.
              </div>

              <button
                onClick={handleCompleteSurvey}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/30 transition flex items-center justify-center gap-2 border border-amber-400/30 whitespace-nowrap cursor-pointer"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Hoàn Thành Giám Định & Chuyển Khai Thác</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
