import React, { useState } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  Container,
  AlertCircle,
  FileCheck,
  Info,
  Check,
  Ban
} from 'lucide-react';

export interface ContainerQualityGrade {
  id: string;
  code: string;
  gradeName: string;
  groupType: 'DRY_STANDARD' | 'FOOD_GRADE' | 'SPECIAL_GARMENT' | 'REEFER_PREMIUM' | 'DAMAGED_OFFHIRE';
  colorTag: 'emerald' | 'blue' | 'yellow' | 'red' | 'purple' | 'cyan';
  targetCargo: string;
  iiclStandard: string;
  cleanlinessLevel: string;
  allowExport: boolean;
  repairRequired: boolean;
  description: string;
  activeStatus: boolean;
}

const INITIAL_QUALITY_GRADES: ContainerQualityGrade[] = [
  {
    id: 'GRD-01',
    code: 'GRADE_A',
    gradeName: 'Grade A - Food Grade (Thực Phẩm & Y Tế Cao Cấp)',
    groupType: 'FOOD_GRADE',
    colorTag: 'emerald',
    targetCargo: 'Thực phẩm, sữa bột, dược phẩm, y tế, đồ uống, bao bì thực phẩm',
    iiclStandard: 'Kín sáng & kín nước 100%. Vách nhẵn sạch, sàn gỗ mài phẳng láng bóng, không rỉ sét.',
    cleanlinessLevel: 'Khô sạch 100%, không vết ố dầu mỡ, không mùi hôi.',
    allowExport: true,
    repairRequired: false,
    description: 'Vỏ chất lượng cao nhất Depot, đạt kiểm định vệ sinh an toàn thực phẩm. Sẵn sàng cấp xuất tàu ngay.',
    activeStatus: true
  },
  {
    id: 'GRD-02',
    code: 'GRADE_B',
    gradeName: 'Grade B - Cargo Worthy / CW (Bách Hóa Tiêu Chuẩn)',
    groupType: 'DRY_STANDARD',
    colorTag: 'blue',
    targetCargo: 'Bách hóa tổng hợp, nông sản đóng bao, bao bì, hạt nhựa, pallet hàng hóa',
    iiclStandard: 'Đạt chuẩn IICL-5. Kết cấu vách xà khung chắc chắn, kín nước kín sáng WWT.',
    cleanlinessLevel: 'Khô sạch tiêu chuẩn, cho phép vết bám bụi khô nhẹ không ảnh hưởng hàng.',
    allowExport: true,
    repairRequired: false,
    description: 'Loại vỏ phổ biến nhất phục vụ đóng hàng xuất khẩu bách hóa. Vị trí móp nhẹ đã qua xử lý nắn phẳng.',
    activeStatus: true
  },
  {
    id: 'GRD-03',
    code: 'GRADE_C',
    gradeName: 'Grade C - General Cargo (Hàng Thô / Nội Địa)',
    groupType: 'DRY_STANDARD',
    colorTag: 'yellow',
    targetCargo: 'Sắt thép, kim loại, gỗ kiện, đá cuội, thức ăn chăn nuôi, gạch men, hàng thô đóng bao',
    iiclStandard: 'Kín nước WWT. Có vết rỉ bề mặt bám dính, xước xát vách hông hoặc móp nhẹ.',
    cleanlinessLevel: 'Cho phép bám bẩn nhẹ bề mặt. Khuyến cáo xịt rửa trước khi đóng hàng nhạy cảm.',
    allowExport: true,
    repairRequired: false,
    description: 'Dùng chuyên đóng hàng thô nội địa hoặc xuất khẩu hàng không nhạy cảm với vết xước xát.',
    activeStatus: true
  },
  {
    id: 'GRD-04',
    code: 'GRADE_D',
    gradeName: 'Grade D - Heavy Damage (Hư Hỏng nặng / Off-Hire)',
    groupType: 'DAMAGED_OFFHIRE',
    colorTag: 'red',
    targetCargo: 'Không cho phép cấp vỏ đóng hàng (Chờ sửa chữa)',
    iiclStandard: 'Không đạt tiêu chuẩn IICL-5. Thủng lỗ vách/mái, biến dạng khung xà, sàn nứt gãy.',
    cleanlinessLevel: 'Dính dầu mỡ hoặc rác thải / Thủng lỗ lọt sáng lọt nước.',
    allowExport: false,
    repairRequired: true,
    description: 'Container bị hư hỏng kết cấu hoặc lọt nước. Bắt buộc lập Báo giá Estimate & Sửa chữa nghiệm thu QC trước khi hạ Grade.',
    activeStatus: true
  },
  {
    id: 'GRD-05',
    code: 'GRADE_GARMENT',
    gradeName: 'Grade Garment - GOH (May Mặc Treo Hanger)',
    groupType: 'SPECIAL_GARMENT',
    colorTag: 'purple',
    targetCargo: 'Quần áo may mặc treo Hanger (GOH), vải vóc cao cấp, hàng thời trang dệt may',
    iiclStandard: 'Kín nước kín ẩm 100%. Lót bạt vách trong, đai xà treo chắc chắn, vách tuyệt đối nhẵn.',
    cleanlinessLevel: 'Sạch khô tuyệt đối, mài bóng sàn, không đinh nhọn hay gờ sắc bén.',
    allowExport: true,
    repairRequired: false,
    description: 'Container chuyên dụng trang bị dàn xà đai treo quần áo xuất khẩu đi Châu Âu, Mỹ.',
    activeStatus: true
  },
  {
    id: 'GRD-06',
    code: 'GRADE_REEFER_A',
    gradeName: 'Grade Reefer A - Premium Reefer (Container Lạnh Cấp A)',
    groupType: 'REEFER_PREMIUM',
    colorTag: 'cyan',
    targetCargo: 'Thủy hải sản đông lạnh, thịt tươi xuất khẩu, trái cây nhạy cảm nhiệt độ (-30°C đến +30°C)',
    iiclStandard: 'Đạt kiểm định chạy lạnh PTI (Pre-Trip Inspection) 100%. Cách nhiệt PU kín khít.',
    cleanlinessLevel: 'Khử trùng y tế, sàn nhôm T-bar sáng bóng sạch sẽ.',
    allowExport: true,
    repairRequired: false,
    description: 'Container lạnh chất lượng cao, máy lạnh Carrier/Daikin/ThermoKing hoạt động hoàn hảo.',
    activeStatus: true
  }
];

export const ContainerQualityGradeModule: React.FC = () => {
  const [grades, setGrades] = useState<ContainerQualityGrade[]>(INITIAL_QUALITY_GRADES);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<ContainerQualityGrade | null>(null);
  const [viewingGrade, setViewingGrade] = useState<ContainerQualityGrade | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ContainerQualityGrade, 'id'>>({
    code: '',
    gradeName: '',
    groupType: 'DRY_STANDARD',
    colorTag: 'blue',
    targetCargo: '',
    iiclStandard: '',
    cleanlinessLevel: '',
    allowExport: true,
    repairRequired: false,
    description: '',
    activeStatus: true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      gradeName: '',
      groupType: 'DRY_STANDARD',
      colorTag: 'emerald',
      targetCargo: '',
      iiclStandard: '',
      cleanlinessLevel: '',
      allowExport: true,
      repairRequired: false,
      description: '',
      activeStatus: true
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (grd: ContainerQualityGrade) => {
    setEditingGrade(grd);
    setFormData({
      code: grd.code,
      gradeName: grd.gradeName,
      groupType: grd.groupType,
      colorTag: grd.colorTag,
      targetCargo: grd.targetCargo,
      iiclStandard: grd.iiclStandard,
      cleanlinessLevel: grd.cleanlinessLevel,
      allowExport: grd.allowExport,
      repairRequired: grd.repairRequired,
      description: grd.description,
      activeStatus: grd.activeStatus
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.gradeName.trim()) {
      alert('Vui lòng nhập Mã cấp vỏ và Tên cấp chất lượng!');
      return;
    }

    const newGrade: ContainerQualityGrade = {
      id: `GRD-${String(grades.length + 1).padStart(2, '0')}`,
      ...formData,
      code: formData.code.toUpperCase().trim()
    };

    setGrades([newGrade, ...grades]);
    showToast(`Đã thêm mới danh mục Phân loại Cấp vỏ ${newGrade.code}`);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    setGrades((prev) =>
      prev.map((g) =>
        g.id === editingGrade.id
          ? {
              ...g,
              ...formData,
              code: formData.code.toUpperCase().trim()
            }
          : g
      )
    );

    showToast(`Đã cập nhật tiêu chuẩn Phân loại ${formData.code}`);
    setEditingGrade(null);
  };

  const handleDelete = (id: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== id));
    showToast('Đã xóa phân loại chất lượng khỏi danh mục');
    setDeletingId(null);
  };

  const filteredGrades = grades.filter((g) => {
    const matchesSearch =
      g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.gradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.targetCargo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup =
      groupFilter === 'ALL' ||
      g.groupType === groupFilter ||
      (groupFilter === 'EXPORTABLE' && g.allowExport) ||
      (groupFilter === 'REPAIR_REQ' && g.repairRequired);

    return matchesSearch && matchesGroup;
  });

  const getColorClass = (tag: ContainerQualityGrade['colorTag']) => {
    switch (tag) {
      case 'emerald':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'blue':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'yellow':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'red':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'purple':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'cyan':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>DANH MỤC TIÊU CHUẨN KỸ THUẬT</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>Phân Loại Chất Lượng Container (Quality Grade Classification)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Quản lý bảng quy chuẩn chất lượng vỏ container (Grade A, B, C, D, Garment, Reefer) theo chuẩn giám định IICL-5 & quy định hãng tàu để phục vụ cấp vỏ đóng hàng.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap border border-indigo-400/30 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Mới Cấp Chất Lượng</span>
        </button>
      </div>

      {/* Metrics Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Đủ ĐK Cấp Xuất</div>
            <div className="text-lg font-black text-emerald-400">
              {grades.filter((g) => g.allowExport).length} / {grades.length} Grade
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Tiêu Chuẩn Giám Định</div>
            <div className="text-sm font-bold text-slate-200">Chuẩn IICL-5 & WWT</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Bắt Buộc Sửa Chữa</div>
            <div className="text-lg font-black text-rose-400">
              {grades.filter((g) => g.repairRequired).length} Grade (D)
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Chuyên Dụng Cao Cấp</div>
            <div className="text-lg font-black text-purple-300">
              {grades.filter((g) => g.groupType === 'FOOD_GRADE' || g.groupType === 'SPECIAL_GARMENT' || g.groupType === 'REEFER_PREMIUM').length} Cấp
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar & Search Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã Grade, tên cấp vỏ, loại hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lọc:</span>
          </span>

          {[
            { id: 'ALL', label: 'Tất Cả' },
            { id: 'EXPORTABLE', label: 'Cho Phép Cấp Xuất' },
            { id: 'REPAIR_REQ', label: 'Cần Sửa Chữa (Grade D)' },
            { id: 'FOOD_GRADE', label: 'Food Grade' },
            { id: 'SPECIAL_GARMENT', label: 'Garment / GOH' },
            { id: 'REEFER_PREMIUM', label: 'Reefer Lạnh' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setGroupFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                groupFilter === f.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Mã Grade / Tên Cấp Chất Lượng</th>
                <th className="p-4">Loại Hàng Thích Hợp</th>
                <th className="p-4">Tiêu Chuẩn IICL-5 & Độ Sạch</th>
                <th className="p-4 text-center">Cấp Vỏ Xuất Khẩu</th>
                <th className="p-4 text-center">Yêu Cầu Sửa Chữa</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Không tìm thấy dữ liệu phân loại chất lượng container phù hợp.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black border ${getColorClass(g.colorTag)}`}>
                            {g.code}
                          </span>
                          <span className="font-bold text-white text-xs">{g.gradeName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{g.description}</p>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="text-slate-200 font-semibold text-xs leading-relaxed">
                        {g.targetCargo}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="space-y-1 text-[11px]">
                        <div className="text-slate-300">
                          <strong className="text-indigo-400">IICL:</strong> {g.iiclStandard}
                        </div>
                        <div className="text-slate-400">
                          <strong className="text-emerald-400">Vệ sinh:</strong> {g.cleanlinessLevel}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {g.allowExport ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>ĐƯỢC CẤP</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          <Ban className="w-3 h-3 text-rose-400" />
                          <span>CẤM CẤP</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {g.repairRequired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>BẮT BUỘC</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          Không
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingGrade(g)}
                          title="Xem Chi Tiết"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(g)}
                          title="Chỉnh Sửa"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-900/50 text-blue-400 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingId(g.id)}
                          title="Xóa"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingGrade) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <span>{editingGrade ? 'Chỉnh Sửa Tiêu Chuẩn Cấp Chất Lượng' : 'Thêm Mới Cấp Chất Lượng Container'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingGrade(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingGrade ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã Grade (Cấp Vỏ) *</label>
                  <input
                    type="text"
                    placeholder="VD: GRADE_A, GRADE_B, GOH..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên Gọi Đầy Đủ *</label>
                  <input
                    type="text"
                    placeholder="VD: Grade A - Food Grade (Thực phẩm)..."
                    value={formData.gradeName}
                    onChange={(e) => setFormData({ ...formData, gradeName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhóm Phân Loại</label>
                  <select
                    value={formData.groupType}
                    onChange={(e) => setFormData({ ...formData, groupType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DRY_STANDARD">Khô Tiêu Chuẩn (Dry Standard)</option>
                    <option value="FOOD_GRADE">Thực Phẩm & Y Tế (Food Grade)</option>
                    <option value="SPECIAL_GARMENT">May Mặc Hanger (Garment GOH)</option>
                    <option value="REEFER_PREMIUM">Container Lạnh (Reefer Premium)</option>
                    <option value="DAMAGED_OFFHIRE">Hư Hỏng / Cần Sửa Chữa (Off-Hire)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Màu Nhãn Thẻ Tag</label>
                  <select
                    value={formData.colorTag}
                    onChange={(e) => setFormData({ ...formData, colorTag: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="emerald">Emerald (Xanh lá - Grade A / Food)</option>
                    <option value="blue">Blue (Xanh dương - Grade B / Standard)</option>
                    <option value="yellow">Yellow (Vàng - Grade C / Heavy Cargo)</option>
                    <option value="red">Red (Đỏ - Grade D / Damaged)</option>
                    <option value="purple">Purple (Tím - Garment / Special)</option>
                    <option value="cyan">Cyan (Xanh ngọc - Reefer Reefer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Loại Hàng Phù Hợp Đóng Vỏ</label>
                <input
                  type="text"
                  placeholder="VD: Hàng thực phẩm, bách hóa, may mặc..."
                  value={formData.targetCargo}
                  onChange={(e) => setFormData({ ...formData, targetCargo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tiêu Chuẩn Giám Định IICL-5</label>
                  <textarea
                    rows={2}
                    placeholder="Quy định độ kín nước WWT, vách hông, sàn gỗ..."
                    value={formData.iiclStandard}
                    onChange={(e) => setFormData({ ...formData, iiclStandard: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tiêu Chuẩn Vệ Sinh Sạch Sẽ</label>
                  <textarea
                    rows={2}
                    placeholder="Mức độ sạch, không mùi, khử trùng..."
                    value={formData.cleanlinessLevel}
                    onChange={(e) => setFormData({ ...formData, cleanlinessLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Cho Phép Cấp Vỏ Đóng Hàng Xuất Khẩu</span>
                  <input
                    type="checkbox"
                    checked={formData.allowExport}
                    onChange={(e) => setFormData({ ...formData, allowExport: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-300 font-semibold">Bắt Buộc Lập Estimate & Sửa Chữa (Grade D)</span>
                  <input
                    type="checkbox"
                    checked={formData.repairRequired}
                    onChange={(e) => setFormData({ ...formData, repairRequired: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi Chú Hướng Dẫn Kỹ Thuật</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chi tiết hướng dẫn nhân viên giám định..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGrade(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
                >
                  {editingGrade ? 'Cập Nhật Dữ Liệu' : 'Lưu Cấp Chất Lượng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingGrade && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${getColorClass(viewingGrade.colorTag)}`}>
                  {viewingGrade.code}
                </span>
                <h3 className="font-bold text-white text-sm">{viewingGrade.gradeName}</h3>
              </div>

              <button
                onClick={() => setViewingGrade(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Loại Hàng Thích Hợp</span>
                <span className="text-slate-200 font-bold">{viewingGrade.targetCargo}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-indigo-400 block font-semibold text-[10px] uppercase">Tiêu Chuẩn IICL-5</span>
                  <span className="text-slate-300">{viewingGrade.iiclStandard}</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-emerald-400 block font-semibold text-[10px] uppercase">Mức Độ Vệ Sinh</span>
                  <span className="text-slate-300">{viewingGrade.cleanlinessLevel}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Cấp Vỏ Đóng Hàng Xuất Khẩu:</span>
                  {viewingGrade.allowExport ? (
                    <span className="text-emerald-400 font-bold">Được Cho Phép</span>
                  ) : (
                    <span className="text-rose-400 font-bold">Cấm Cấp Vỏ</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
                  <span>Yêu Cầu Sửa Chữa Nghiệm Thu:</span>
                  {viewingGrade.repairRequired ? (
                    <span className="text-rose-400 font-bold">Bắt Buộc Sửa Chữa (Grade D)</span>
                  ) : (
                    <span className="text-slate-400">Không Yêu Cầu</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-400 leading-relaxed">
                <strong className="text-slate-200 block mb-1">Mô Tả Quy Định:</strong>
                {viewingGrade.description}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setViewingGrade(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">Xác Nhận Xóa Cấp Chất Lượng?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hành động này sẽ xóa phân loại chất lượng container khỏi danh mục hệ thống.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-lg"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
