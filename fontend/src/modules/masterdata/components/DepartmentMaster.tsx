import React, { useState, useEffect, useMemo } from 'react';
import { DepartmentItem } from '../types/department';
import { DIVISION_CATEGORIES } from '../data/departmentMockData';
import { DepartmentModal } from './DepartmentModal';
import {
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Briefcase,
  LayoutGrid,
  List,
  GitFork,
  Download,
  Sparkles,
  Tag,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface DepartmentMasterProps {
  departments?: DepartmentItem[];
  onUpdateDepartments?: (departments: DepartmentItem[]) => void;
}

export const DepartmentMaster: React.FC<DepartmentMasterProps> = ({
  departments: propDepartments,
  onUpdateDepartments
}) => {
  // Chỉ hiển thị phòng ban thật từ backend (catalog DEPARTMENT) — không còn dữ liệu mẫu làm khung chờ.
  const [departments, setDepartments] = useState<DepartmentItem[]>(propDepartments || []);

  // `propDepartments` tới từ MasterDataPage qua fetch bất đồng bộ — `useState` chỉ đọc prop 1 lần nên cần
  // effect đồng bộ lại khi dữ liệu thật về (xem docs/backend-progress/23-master-data.md "Bug thật thứ 4").
  useEffect(() => {
    setDepartments(propDepartments || []);
  }, [propDepartments]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'TREE'>('GRID');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with parent when state changes
  const updateDepartmentsList = (newList: DepartmentItem[]) => {
    setDepartments(newList);
    if (onUpdateDepartments) {
      onUpdateDepartments(newList);
    }
  };

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // KPI Calculations
  const totalDepts = departments.length;
  const activeDepts = departments.filter((d) => d.status === 'ACTIVE').length;
  const totalHeadcount = departments.reduce((sum, d) => sum + d.headcount, 0);
  const shift247Count = departments.filter((d) => d.operatingHours.toLowerCase().includes('24/7')).length;

  // Filtered List
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.managerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.costCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDivision = selectedDivision === 'ALL' || d.division === selectedDivision;
      const matchStatus = selectedStatus === 'ALL' || d.status === selectedStatus;

      return matchSearch && matchDivision && matchStatus;
    });
  }, [departments, searchTerm, selectedDivision, selectedStatus]);

  // Group by Division for Tree View
  const groupedByDivision = useMemo(() => {
    const map: Record<string, { title: string; items: DepartmentItem[] }> = {
      EXECUTIVE: { title: 'Khối Điều Hành & Quản Trị Cấp Cao', items: [] },
      OPERATIONS: { title: 'Khối Khai Thác, Cổng & Bãi (Operations)', items: [] },
      TECHNICAL: { title: 'Khối Kỹ Thuật, Sửa Chữa M&R & QC', items: [] },
      FINANCE: { title: 'Khối Tài Chính, Kế Toán & Thu Ngân', items: [] },
      LOGISTICS_IT: { title: 'Khối Hậu Cần Kho Bãi & Công Nghệ EDI', items: [] }
    };

    filteredDepartments.forEach((dept) => {
      if (map[dept.division]) {
        map[dept.division].items.push(dept);
      } else {
        if (!map.OTHER) map.OTHER = { title: 'Khối Phòng Ban Khác', items: [] };
        map.OTHER.items.push(dept);
      }
    });

    return Object.entries(map).filter(([_, group]) => group.items.length > 0);
  }, [filteredDepartments]);

  // Handle Save
  const handleSaveDepartment = (
    deptData: Omit<DepartmentItem, 'id'> & { id?: string }
  ) => {
    if (deptData.id) {
      // Edit
      const updated = departments.map((d) =>
        d.id === deptData.id ? ({ ...d, ...deptData } as DepartmentItem) : d
      );
      updateDepartmentsList(updated);
      showToast(`🎉 Đã cập nhật thông tin phòng ban "${deptData.name}" thành công!`);
    } else {
      // Create
      const newDept: DepartmentItem = {
        ...deptData,
        id: `DEPT-${Date.now().toString().slice(-4)}`
      } as DepartmentItem;
      updateDepartmentsList([newDept, ...departments]);
      showToast(`🎉 Đã thêm mới phòng ban "${newDept.name}" (${newDept.code}) vào danh mục!`);
    }

    setIsModalOpen(false);
    setEditingDepartment(null);
  };

  // Toggle Active/Inactive
  const handleToggleStatus = (dept: DepartmentItem) => {
    const newStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = departments.map((d) =>
      d.id === dept.id ? { ...d, status: newStatus as 'ACTIVE' | 'INACTIVE' } : d
    );
    updateDepartmentsList(updated);
    showToast(
      newStatus === 'ACTIVE'
        ? `🟢 Đã kích hoạt phòng ban "${dept.shortName}"`
        : `⚪ Đã tạm dừng hoạt động phòng ban "${dept.shortName}"`
    );
  };

  // Delete
  const handleDeleteDepartment = (dept: DepartmentItem) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa phòng ban "${dept.name}" (${dept.code}) khỏi danh mục hệ thống?`
      )
    ) {
      const updated = departments.filter((d) => d.id !== dept.id);
      updateDepartmentsList(updated);
      showToast(`🗑️ Đã xóa phòng ban "${dept.shortName}" khỏi danh mục.`);
    }
  };


  // Export JSON
  const handleExportJSON = () => {
    const exportData = {
      departments,
      exportedAt: new Date().toISOString(),
      totalDepartments: departments.length,
      totalHeadcount
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DANH-MUC-PHONG-BAN-DEPOT-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    showToast('📥 Đã xuất dữ liệu Danh Mục Phòng Ban ra file JSON!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-white border-2 border-indigo-500 rounded-2xl flex items-center justify-between text-xs text-indigo-200 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-500 hover:text-slate-900 p-1">
            &times;
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                DANH MỤC PHÒNG BAN &amp; CƠ CẤU TỔ CHỨC (ORGANIZATIONAL DEPARTMENTS)
              </h2>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Depot Core Structure</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Quản lý danh mục các khối phòng ban nghiệp vụ, trưởng bộ phận, định biên nhân sự, vị trí tại bãi bãi/tòa nhà, trung tâm chi phí và vai trò phân quyền RBAC tương ứng.
            </p>
          </div>
        </div>

        {/* Top Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            title="Xuất file JSON danh mục phòng ban"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất JSON</span>
          </button>

          <button
            onClick={() => {
              setEditingDepartment(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg "
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mới Phòng Ban</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Tổng Số Phòng Ban</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalDepts}</div>
          <span className="text-[10px] text-slate-500">Thuộc 5 khối chuyên trách</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Định Biên Nhân Sự</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{totalHeadcount}</div>
          <span className="text-[10px] text-slate-500">Cán bộ &amp; Công nhân viên</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Đơn Vị Trực Ca 24/7</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-600 font-mono">{shift247Count} Đơn vị</div>
          <span className="text-[10px] text-slate-500">Cổng, Giám định, Xe nâng, IT</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Tỷ Lệ Hoạt Động (Active)</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {Math.round((activeDepts / (totalDepts || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-slate-500">{activeDepts}/{totalDepts} phòng ban hoạt động</span>
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo mã, tên phòng ban, trưởng bộ phận, vị trí, tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Division Filter */}
          <div className="w-full lg:w-64">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
            >
              {DIVISION_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">🟢 Đang Hoạt Động</option>
              <option value="INACTIVE">⚪ Tạm Dừng</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem dạng Lưới Thẻ Chi Tiết"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới Thẻ</span>
            </button>

            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem dạng Bảng Dữ Liệu"
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng Tổng Hợp</span>
            </button>

            <button
              onClick={() => setViewMode('TREE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TREE'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem Cơ Cấu Phân Cấp Khối"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Sơ Đồ Khối</span>
            </button>
          </div>
        </div>

        {/* Search Info Bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
          <span>
            Tìm thấy <strong className="text-slate-900">{filteredDepartments.length}</strong> phòng ban phù hợp
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: GRID CARDS VIEW */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => {
            const is247 = dept.operatingHours.includes('24/7');

            return (
              <div
                key={dept.id}
                className="p-5 bg-white border border-slate-200 hover:border-indigo-200 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl transition group duration-200"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  {/* Division Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold">
                      {dept.divisionName}
                    </span>

                    <div className="flex items-center gap-2">
                      {dept.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 font-mono">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Code & Title */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-mono font-bold text-[11px]">
                        {dept.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{dept.costCenter}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug group-hover:text-indigo-700 transition">
                      {dept.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  {/* Manager & Contact */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[10px] font-bold uppercase">Trưởng Bộ Phận:</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-600" />
                        {dept.managerName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1 truncate" title={dept.managerPhone}>
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{dept.managerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate" title={dept.managerEmail}>
                        <Mail className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="truncate">{dept.managerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Meta Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate" title={dept.location}>{dept.location}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${is247 ? 'text-cyan-600' : 'text-slate-500'}`} />
                        <span className={is247 ? 'text-cyan-700 font-bold font-mono' : ''}>
                          {dept.operatingHours}
                        </span>
                      </div>

                      <div className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono font-bold text-[10px]">
                        {dept.headcount} Nhân sự
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="text-purple-700 font-medium truncate">{dept.primaryRole}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {dept.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-md text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(dept)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      dept.status === 'ACTIVE'
                        ? 'bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {dept.status === 'ACTIVE' ? 'Tạm Dừng' : 'Kích Hoạt'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingDepartment(dept);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition cursor-pointer"
                      title="Chỉnh sửa phòng ban"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteDepartment(dept)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer"
                      title="Xóa phòng ban"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'TABLE' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Mã &amp; Phòng Ban</th>
                  <th className="p-4">Khối Nghiệp Vụ</th>
                  <th className="p-4">Trưởng Bộ Phận &amp; Liên Hệ</th>
                  <th className="p-4">Vị Trí Làm Việc</th>
                  <th className="p-4">Định Biên</th>
                  <th className="p-4">Giờ Làm Việc</th>
                  <th className="p-4">Vai Trò RBAC</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-850 transition duration-150">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {dept.code.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{dept.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span className="text-indigo-600 font-bold">{dept.code}</span>
                            <span>&bull;</span>
                            <span>{dept.costCenter}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-medium">
                        {dept.divisionName}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{dept.managerName}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {dept.managerPhone} &bull; {dept.managerEmail}
                      </div>
                    </td>

                    <td className="p-4 text-slate-700 max-w-[200px]">
                      <div className="truncate" title={dept.location}>{dept.location}</div>
                    </td>

                    <td className="p-4 font-mono font-bold text-slate-900 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded">
                        {dept.headcount}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-700">
                      {dept.operatingHours}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-mono font-bold">
                        {dept.primaryRoleCode}
                      </span>
                    </td>

                    <td className="p-4">
                      {dept.status === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Hoạt Động</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 font-mono">
                          <span>Tạm Dừng</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingDepartment(dept);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition cursor-pointer"
                          title="Sửa phòng ban"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition cursor-pointer"
                          title="Xóa phòng ban"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ORGANIZATIONAL TREE VIEW */}
      {viewMode === 'TREE' && (
        <div className="space-y-6 animate-fade-in">
          {groupedByDivision.map(([divisionKey, group]) => (
            <div
              key={divisionKey}
              className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{group.title}</h3>
                    <span className="text-[11px] text-slate-500">
                      Gồm {group.items.length} phòng ban &bull; Tổng định biên:{' '}
                      {group.items.reduce((s, i) => s + i.headcount, 0)} nhân sự
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-indigo-200 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-mono font-bold text-[10px]">
                        {dept.code}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">
                        {dept.headcount} Nhân sự
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{dept.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Trưởng bộ phận: <strong className="text-slate-700">{dept.managerName}</strong>
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span className="truncate">{dept.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create/Edit Department */}
      {isModalOpen && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDepartment(null);
          }}
          onSaveDepartment={handleSaveDepartment}
        />
      )}
    </div>
  );
};
