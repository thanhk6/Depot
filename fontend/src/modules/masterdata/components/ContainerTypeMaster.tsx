import React, { useState, useEffect, useMemo } from 'react';
import { ContainerTypeMasterItem, ContainerCategoryType, ContainerSizeCategory } from '../../survey/types';
import {
  Container,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Info,
  Maximize2,
  ThermometerSnowflake,
  Layers,
  Box,
  Scale,
  Shield,
  FileSpreadsheet,
  X,
  Check,
  LayoutGrid,
  List,
  Sparkles
} from 'lucide-react';

export interface ContainerTypeMasterProps {
  containerTypes: ContainerTypeMasterItem[];
  onUpdateContainerTypes: (updated: ContainerTypeMasterItem[]) => void;
}


export const ContainerTypeMaster: React.FC<ContainerTypeMasterProps> = ({
  containerTypes,
  onUpdateContainerTypes
}) => {
  const [types, setTypes] = useState<ContainerTypeMasterItem[]>(containerTypes);

  // `containerTypes` tới từ `MasterDataPage` qua fetch API bất đồng bộ. `useState(containerTypes)` ở
  // trên chỉ đọc prop MỘT LẦN lúc khởi tạo — nếu màn này mount trước khi API kịp trả về (vd vào thẳng
  // qua sidebar "Tất Cả Danh Mục"), `types` sẽ mãi mãi là mảng rỗng dù `containerTypes` sau đó đã có đủ
  // 20 loại thật từ database, cho tới khi người dùng đổi tab rồi quay lại. Effect này đồng bộ lại khi
  // prop thật sự đổi.
  useEffect(() => {
    setTypes(containerTypes);
  }, [containerTypes]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingType, setEditingType] = useState<ContainerTypeMasterItem | null>(null);
  const [viewingDetailType, setViewingDetailType] = useState<ContainerTypeMasterItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ContainerTypeMasterItem>>({
    typeCode: '',
    isoCode: '',
    name: '',
    vietnameseName: '',
    size: '20',
    category: 'DRY',
    isReefer: false,
    lengthMm: 0,
    widthMm: 0,
    heightMm: 0,
    internalLengthMm: 0,
    internalWidthMm: 0,
    internalHeightMm: 0,
    doorWidthMm: 0,
    doorHeightMm: 0,
    cbm: 0,
    tareWeightKg: 0,
    maxPayloadKg: 0,
    maxGrossWeightKg: 0,
    teuRatio: 1.0,
    tempRangeMin: undefined,
    tempRangeMax: undefined,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: '',
    status: 'ACTIVE',
    sortOrder: 1
  });

  // Sync back to parent
  const updateList = (newTypes: ContainerTypeMasterItem[]) => {
    setTypes(newTypes);
    onUpdateContainerTypes(newTypes);
  };

  // Filtered list
  const filteredTypes = useMemo(() => {
    return types.filter((item) => {
      const matchSearch =
        item.typeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.isoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchSize = sizeFilter === 'ALL' || item.size === sizeFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchCat && matchSize && matchStatus;
    });
  }, [types, searchTerm, categoryFilter, sizeFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = types.length;
    const dryCount = types.filter((t) => t.category === 'DRY').length;
    const reeferCount = types.filter((t) => t.category === 'REEFER' || t.isReefer).length;
    const specialCount = types.filter((t) => !['DRY', 'REEFER'].includes(t.category)).length;
    const activeCount = types.filter((t) => t.status === 'ACTIVE').length;
    return { total, dryCount, reeferCount, specialCount, activeCount };
  }, [types]);

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({
      id: `CT-${Date.now()}`,
      typeCode: '',
      isoCode: '',
      name: '',
      vietnameseName: '',
      size: '20',
      category: 'DRY',
      isReefer: false,
      lengthMm: 0,
      widthMm: 0,
      heightMm: 0,
      internalLengthMm: 0,
      internalWidthMm: 0,
      internalHeightMm: 0,
      doorWidthMm: 0,
      doorHeightMm: 0,
      cbm: 0,
      tareWeightKg: 0,
      maxPayloadKg: 0,
      maxGrossWeightKg: 0,
      teuRatio: 1.0,
      tempRangeMin: undefined,
      tempRangeMax: undefined,
      material: 'CORTEN_STEEL',
      floorType: 'WOOD_PLYWOOD',
      description: '',
      status: 'ACTIVE',
      sortOrder: types.length + 1
    });
    setIsModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (item: ContainerTypeMasterItem) => {
    setEditingType(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Mã ISO là khóa `Code` duy nhất của catalog trên DB, mã loại là `Name` mà Gate-In dò theo — cả 2
  // đều phải duy nhất trong danh mục (trùng ISO thì persistCatalog sẽ ghi đè lên dòng có sẵn).
  const findDuplicate = (typeCode: string, isoCode: string, excludeId?: string) =>
    types.find(
      (t) =>
        t.id !== excludeId &&
        (t.typeCode.toUpperCase() === typeCode.toUpperCase() || t.isoCode.toUpperCase() === isoCode.toUpperCase())
    );

  const nextFreeCode = (base: string, suffix: string, taken: (code: string) => boolean) => {
    let candidate = `${base}${suffix}`;
    for (let n = 2; taken(candidate); n++) candidate = `${base}${suffix}${n}`;
    return candidate;
  };

  // Handle Duplicate
  const handleDuplicate = (item: ContainerTypeMasterItem) => {
    const newItem: ContainerTypeMasterItem = {
      ...item,
      id: `CT-${Date.now()}`,
      typeCode: nextFreeCode(item.typeCode, '_COPY', (c) => types.some((t) => t.typeCode.toUpperCase() === c)),
      isoCode: nextFreeCode(item.isoCode, '_C', (c) => types.some((t) => t.isoCode.toUpperCase() === c)),
      vietnameseName: `${item.vietnameseName} (Bản sao)`,
      sortOrder: types.length + 1
    };
    const updated = [...types, newItem];
    updateList(updated);
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại container này khỏi danh mục hệ thống?')) {
      const updated = types.filter((t) => t.id !== id);
      updateList(updated);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = (id: string) => {
    const updated = types.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as any } : t
    );
    updateList(updated);
  };

  // Handle Save (Create / Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.typeCode || !formData.isoCode || !formData.vietnameseName) {
      alert('Vui lòng nhập đầy đủ Mã loại container, Mã ISO và Tên tiếng Việt!');
      return;
    }
    const duplicate = findDuplicate(formData.typeCode, formData.isoCode, editingType?.id);
    if (duplicate) {
      alert(`Mã loại hoặc mã ISO đã được dùng bởi "${duplicate.typeCode} / ${duplicate.isoCode}". Mỗi loại container phải có mã loại và mã ISO riêng.`);
      return;
    }

    const payloadKg = (formData.maxGrossWeightKg || 0) - (formData.tareWeightKg || 0);

    if (editingType) {
      const updated = types.map((t) =>
        t.id === editingType.id
          ? ({
              ...t,
              ...formData,
              maxPayloadKg: payloadKg > 0 ? payloadKg : formData.maxPayloadKg
            } as ContainerTypeMasterItem)
          : t
      );
      updateList(updated);
    } else {
      const newItem: ContainerTypeMasterItem = {
        id: formData.id || `CT-${Date.now().toString().slice(-4)}`,
        typeCode: formData.typeCode.toUpperCase(),
        isoCode: formData.isoCode.toUpperCase(),
        name: formData.name || '',
        vietnameseName: formData.vietnameseName,
        size: formData.size || '20',
        category: formData.category || 'DRY',
        isReefer: formData.category === 'REEFER' || !!formData.isReefer,
        lengthMm: Number(formData.lengthMm) || 0,
        widthMm: Number(formData.widthMm) || 0,
        heightMm: Number(formData.heightMm) || 0,
        internalLengthMm: Number(formData.internalLengthMm) || 0,
        internalWidthMm: Number(formData.internalWidthMm) || 0,
        internalHeightMm: Number(formData.internalHeightMm) || 0,
        doorWidthMm: Number(formData.doorWidthMm) || 0,
        doorHeightMm: Number(formData.doorHeightMm) || 0,
        cbm: Number(formData.cbm) || 0,
        tareWeightKg: Number(formData.tareWeightKg) || 0,
        maxPayloadKg: payloadKg > 0 ? payloadKg : Number(formData.maxPayloadKg) || 0,
        maxGrossWeightKg: Number(formData.maxGrossWeightKg) || 0,
        teuRatio: formData.size === '20' ? 1.0 : formData.size === '40' ? 2.0 : formData.size === '45' ? 2.25 : 0.5,
        tempRangeMin: formData.tempRangeMin,
        tempRangeMax: formData.tempRangeMax,
        material: formData.material || 'CORTEN_STEEL',
        floorType: formData.floorType || 'WOOD_PLYWOOD',
        description: formData.description || '',
        status: (formData.status as any) || 'ACTIVE',
        sortOrder: Number(formData.sortOrder) || types.length + 1
      };
      updateList([...types, newItem]);
    }

    setIsModalOpen(false);
  };

  // Helper Badge Color
  const getCategoryBadge = (category: ContainerCategoryType) => {
    switch (category) {
      case 'DRY':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'REEFER':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'OPEN_TOP':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FLAT_RACK':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TANK':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'VENTILATED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'BULK':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-200 text-slate-700 border-slate-600';
    }
  };

  // Helper Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã Loại (TypeCode)',
      'Mã ISO',
      'Tên Tiếng Việt',
      'Tên Tiếng Anh',
      'Kích Thước (Size)',
      'Phân Loại (Category)',
      'Cont Lạnh (IsReefer)',
      'Dài Ngoài (mm)',
      'Rộng Ngoài (mm)',
      'Cao Ngoài (mm)',
      'Dài Trong (mm)',
      'Rộng Trong (mm)',
      'Cao Trong (mm)',
      'Thể Tích (CBM)',
      'Trọng Lượng Bì (Tare kg)',
      'Tải Trọng Hàng (Payload kg)',
      'Max Gross (kg)',
      'Hệ Số TEU',
      'Vật Liệu Vỏ',
      'Loại Sàn',
      'Trạng Thái'
    ];

    const rows = filteredTypes.map((t) => [
      `"${t.typeCode}"`,
      `"${t.isoCode}"`,
      `"${t.vietnameseName}"`,
      `"${t.name}"`,
      `"${t.size}ft"`,
      `"${t.category}"`,
      `"${t.isReefer ? 'Có' : 'Không'}"`,
      t.lengthMm,
      t.widthMm,
      t.heightMm,
      t.internalLengthMm,
      t.internalWidthMm,
      t.internalHeightMm,
      t.cbm,
      t.tareWeightKg,
      t.maxPayloadKg,
      t.maxGrossWeightKg,
      t.teuRatio,
      `"${t.material}"`,
      `"${t.floorType}"`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DANH-MUC-LOAI-CONTAINER-ISO-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Container className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Tổng Loại Vỏ</span>
            <span className="text-lg font-bold text-slate-900">{stats.total} loại</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Cont Khô (Dry)</span>
            <span className="text-lg font-bold text-blue-600">{stats.dryCount} loại</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Cont Lạnh (Reefer)</span>
            <span className="text-lg font-bold text-teal-600">{stats.reeferCount} loại</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Loại Đặc Biệt</span>
            <span className="text-lg font-bold text-amber-600">{stats.specialCount} loại</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-lg col-span-2 sm:col-span-1">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Đang Áp Dụng</span>
            <span className="text-lg font-bold text-emerald-600">{stats.activeCount} active</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã loại (20DC, 40HC, 40HR), mã ISO (22G1, 45R1), tên quy cách..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel/CSV</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'TABLE' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng Bảng Chi Tiết"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'GRID' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng Thẻ Blueprint"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg "
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Loại Container</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-200/80 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-600" /> Lọc nhanh:
          </span>

          {/* Category Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {['ALL', 'DRY', 'REEFER', 'OPEN_TOP', 'FLAT_RACK', 'TANK', 'VENTILATED', 'BULK', 'SPECIAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200'
                }`}
              >
                {cat === 'ALL'
                  ? 'Tất cả nhóm'
                  : cat === 'DRY'
                  ? 'Cont Khô'
                  : cat === 'REEFER'
                  ? 'Cont Lạnh'
                  : cat === 'OPEN_TOP'
                  ? 'Mở Nóc (OT)'
                  : cat === 'FLAT_RACK'
                  ? 'Mặt Bằng (FR)'
                  : cat === 'TANK'
                  ? 'Bồn (Tank)'
                  : cat === 'VENTILATED'
                  ? 'Thông Gió'
                  : cat === 'BULK'
                  ? 'Hàng Rời'
                  : 'Chuyên Dụng (Special)'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-100 mx-1 hidden sm:block" />

          {/* Size Filter */}
          <div className="flex items-center gap-1">
            {['ALL', '20', '40', '45', '10'].map((sz) => (
              <button
                key={sz}
                onClick={() => setSizeFilter(sz)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sizeFilter === sz
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200'
                }`}
              >
                {sz === 'ALL' ? 'Tất cả cỡ' : `${sz} Feet`}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-100 mx-1 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200'
                }`}
              >
                {st === 'ALL' ? 'Tất cả trạng thái' : st === 'ACTIVE' ? 'Đang dùng' : 'Tạm ngưng'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'TABLE' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Loại</th>
                  <th className="py-3.5 px-3">Mã ISO</th>
                  <th className="py-3.5 px-4">Tên Quy Cách / Chủng Loại</th>
                  <th className="py-3.5 px-3">Phân Loại</th>
                  <th className="py-3.5 px-4">Kích Thước Dài x Rộng x Cao (mm)</th>
                  <th className="py-3.5 px-3">Thể Tích (CBM)</th>
                  <th className="py-3.5 px-3">Trọng Lượng Bì (Tare)</th>
                  <th className="py-3.5 px-3">Max Gross</th>
                  <th className="py-3.5 px-3">Hệ Số TEU</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-slate-700">
                {filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      Không tìm thấy loại container nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-100 transition group cursor-pointer"
                      onClick={() => setViewingDetailType(item)}
                    >
                      {/* Type Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-900 font-mono font-bold rounded-lg border border-slate-200 text-xs shadow-sm">
                            {item.typeCode}
                          </span>
                          {item.isReefer && (
                            <span title="Container Lạnh">
                              <ThermometerSnowflake className="w-3.5 h-3.5 text-teal-600" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ISO Code */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/50">
                          {item.isoCode}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{item.vietnameseName}</span>
                          <span className="text-[11px] text-slate-500 block">{item.name}</span>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadge(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Dimensions Ext */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        <span>
                          {item.lengthMm.toLocaleString()} x {item.widthMm.toLocaleString()} x{' '}
                          {item.heightMm.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Trong: {item.internalLengthMm.toLocaleString()} x {item.internalWidthMm.toLocaleString()} x{' '}
                          {item.internalHeightMm.toLocaleString()}
                        </span>
                      </td>

                      {/* CBM */}
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-50 rounded font-mono text-cyan-700 border border-slate-200">
                          {item.cbm} m³
                        </span>
                      </td>

                      {/* Tare Weight */}
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {item.tareWeightKg.toLocaleString()} kg
                      </td>

                      {/* Max Gross */}
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                        {item.maxGrossWeightKg.toLocaleString()} kg
                      </td>

                      {/* TEU */}
                      <td className="py-3.5 px-3 font-mono text-indigo-700 font-bold">
                        {item.teuRatio} TEU
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {item.status === 'ACTIVE' ? (
                            <>
                              <Check className="w-3 h-3" /> Áp dụng
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Tạm ngưng
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingDetailType(item)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                            title="Xem chi tiết Blueprint"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Chỉnh sửa thông số"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(item)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Tạo bản sao"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa loại container"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map((item) => (
            <div
              key={item.id}
              onClick={() => setViewingDetailType(item)}
              className="p-5 bg-white border border-slate-200 hover:border-sky-200 rounded-3xl space-y-4 shadow-xl transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-50 text-slate-900 font-mono font-bold text-sm rounded-xl border border-slate-200 shadow">
                      {item.typeCode}
                    </span>
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-600 font-mono font-bold text-xs rounded-lg border border-sky-200/60">
                      {item.isoCode}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadge(
                      item.category
                    )}`}
                  >
                    {item.category} &bull; {item.size}ft
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-700 transition">
                    {item.vietnameseName}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                </div>

                {/* Specs Box */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Kích thước (DxRxC mm):</span>
                    <span className="font-mono text-slate-700 text-[11px]">
                      {item.lengthMm} x {item.widthMm} x {item.heightMm}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Thể tích chứa hàng:</span>
                    <span className="font-mono font-bold text-cyan-700">{item.cbm} CBM (m³)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Trọng lượng bì (Tare):</span>
                    <span className="font-mono text-slate-700">{item.tareWeightKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Max Gross Weight:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {item.maxGrossWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                className="flex items-center justify-between pt-3 border-t border-slate-200/80"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    item.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {item.status === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm ngưng'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                    title="Sao chép"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT CONTAINER TYPE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-sky-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-200">
                  <Container className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingType ? `Chỉnh Sửa Loại Container: ${editingType.typeCode}` : 'Thêm Mới Loại Container (ISO 6346)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình kích thước kỹ thuật, thể tích chứa, tải trọng quy chuẩn và đặc tính vận hành.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Basic Identifiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>1. Thông Tin Nhận Diện &amp; Tiêu Chuẩn Quốc Tế</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã Loại Container (Type Code)*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 20DC, 40HC, 40HR"
                      value={formData.typeCode || ''}
                      onChange={(e) => setFormData({ ...formData, typeCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã ISO (ISO 6346 Code)*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 22G1, 45G1, 45R1"
                      value={formData.isoCode || ''}
                      onChange={(e) => setFormData({ ...formData, isoCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sky-700 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kích Cỡ Chiều Dài (Size Feet)*
                    </label>
                    <select
                      value={formData.size || '20'}
                      onChange={(e) => {
                        const newSize = e.target.value as ContainerSizeCategory;
                        setFormData({
                          ...formData,
                          size: newSize,
                          teuRatio: newSize === '20' ? 1.0 : newSize === '40' ? 2.0 : newSize === '45' ? 2.25 : 0.5
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="20">20 Feet (1.0 TEU)</option>
                      <option value="40">40 Feet (2.0 TEU)</option>
                      <option value="45">45 Feet (2.25 TEU)</option>
                      <option value="10">10 Feet (0.5 TEU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phân Nhóm Chủng Loại (Category)*
                    </label>
                    <select
                      value={formData.category || 'DRY'}
                      onChange={(e) => {
                        const cat = e.target.value as ContainerCategoryType;
                        setFormData({
                          ...formData,
                          category: cat,
                          isReefer: cat === 'REEFER'
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="DRY">DRY - Container Khô Tiêu Chuẩn</option>
                      <option value="REEFER">REEFER - Container Bảo Ôn Lạnh</option>
                      <option value="OPEN_TOP">OPEN_TOP - Container Mở Nóc (OT)</option>
                      <option value="FLAT_RACK">FLAT_RACK - Container Mặt Bằng (FR)</option>
                      <option value="TANK">TANK - Container Bồn Xitec</option>
                      <option value="VENTILATED">VENTILATED - Container Thông Gió Nông Sản</option>
                      <option value="BULK">BULK - Container Hàng Rời</option>
                      <option value="SPECIAL">SPECIAL - Thiết Kế Chuyên Dụng Khác</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên Tiếng Việt Quy Cách*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Container Khô 40 Feet Cao (40HC)"
                      value={formData.vietnameseName || ''}
                      onChange={(e) => setFormData({ ...formData, vietnameseName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên Tiếng Anh Quốc Tế
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 40ft High Cube Dry Container"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dimensions */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80">
                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>2. Kích Thước Kỹ Thuật (Kích Thước mm)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* External */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Kích Thước Phủ Bì Ngoài (External)</span>
                    <div>
                      <label className="block text-[10px] text-slate-500">Chiều Dài (mm)</label>
                      <input
                        type="number"
                        value={formData.lengthMm || 0}
                        onChange={(e) => setFormData({ ...formData, lengthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Chiều Rộng (mm)</label>
                      <input
                        type="number"
                        value={formData.widthMm || 0}
                        onChange={(e) => setFormData({ ...formData, widthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Chiều Cao (mm)</label>
                      <input
                        type="number"
                        value={formData.heightMm || 0}
                        onChange={(e) => setFormData({ ...formData, heightMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Internal */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Kích Thước Lọt Lòng Trong (Internal)</span>
                    <div>
                      <label className="block text-[10px] text-slate-500">Chiều Dài Trong (mm)</label>
                      <input
                        type="number"
                        value={formData.internalLengthMm || 0}
                        onChange={(e) => setFormData({ ...formData, internalLengthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Chiều Rộng Trong (mm)</label>
                      <input
                        type="number"
                        value={formData.internalWidthMm || 0}
                        onChange={(e) => setFormData({ ...formData, internalWidthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Chiều Cao Trong (mm)</label>
                      <input
                        type="number"
                        value={formData.internalHeightMm || 0}
                        onChange={(e) => setFormData({ ...formData, internalHeightMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Door Opening & CBM */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-slate-900 block">Kích Thước Khung Cửa &amp; Thể Tích</span>
                    <div>
                      <label className="block text-[10px] text-slate-500">Rộng Mở Cửa (mm)</label>
                      <input
                        type="number"
                        value={formData.doorWidthMm || 0}
                        onChange={(e) => setFormData({ ...formData, doorWidthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Cao Mở Cửa (mm)</label>
                      <input
                        type="number"
                        value={formData.doorHeightMm || 0}
                        onChange={(e) => setFormData({ ...formData, doorHeightMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-cyan-700 font-bold">Thể Tích Chứa Hàng (CBM m³)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.cbm || 0}
                        onChange={(e) => setFormData({ ...formData, cbm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-cyan-700 font-mono font-bold text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Weights & Payload */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>3. Tải Trọng &amp; Trọng Lượng Quy Chuẩn (kg)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Trọng Lượng Bì (Tare Weight kg)*
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.tareWeightKg || 0}
                      onChange={(e) => {
                        const tare = Number(e.target.value);
                        const maxG = formData.maxGrossWeightKg || 0;
                        setFormData({
                          ...formData,
                          tareWeightKg: tare,
                          maxPayloadKg: maxG - tare > 0 ? maxG - tare : formData.maxPayloadKg
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tổng Trọng Tải Tối Đa (Max Gross kg)*
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.maxGrossWeightKg || 0}
                      onChange={(e) => {
                        const maxG = Number(e.target.value);
                        const tare = formData.tareWeightKg || 0;
                        setFormData({
                          ...formData,
                          maxGrossWeightKg: maxG,
                          maxPayloadKg: maxG - tare > 0 ? maxG - tare : formData.maxPayloadKg
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-emerald-600 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tải Trọng Hàng Hóa (Max Payload kg)
                    </label>
                    <input
                      type="number"
                      value={formData.maxPayloadKg || 0}
                      onChange={(e) => setFormData({ ...formData, maxPayloadKg: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Material & Specifications */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80">
                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>4. Cấu Trúc Vật Liệu &amp; Mô Tả Vận Hành</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vật Liệu Vỏ Chế Tạo (Material)
                    </label>
                    <select
                      value={formData.material || 'CORTEN_STEEL'}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none"
                    >
                      <option value="CORTEN_STEEL">Thép Chống Ăn Mòn Corten Steel (SPA-H)</option>
                      <option value="STAINLESS_STEEL">Thép Không Gỉ Inox 304/316L</option>
                      <option value="ALUMINUM">Hợp Kim Nhôm Aluminium</option>
                      <option value="FRP">Nhựa Composite Cốt Sợi Thủy Tinh (FRP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Loại Ván Sàn (Floor Type)
                    </label>
                    <select
                      value={formData.floorType || 'WOOD_PLYWOOD'}
                      onChange={(e) => setFormData({ ...formData, floorType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none"
                    >
                      <option value="WOOD_PLYWOOD">Ván Ép Gỗ Dầu Cứng Plywood 28mm (IICL)</option>
                      <option value="BAMBOO">Ván Ép Tre Ép Khối (Bamboo Floorboard)</option>
                      <option value="ALUMINUM_T_FLOOR">Sàn Nhôm Rãnh Chữ T (Reefer T-Floor)</option>
                      <option value="STEEL">Sàn Thép Tấm Chống Trượt (Steel Floor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Trạng Thái Áp Dụng
                    </label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-emerald-600 font-bold text-xs focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE - Đang Áp Dụng Hệ Thống</option>
                      <option value="INACTIVE">INACTIVE - Tạm Ngưng Sử Dụng</option>
                    </select>
                  </div>

                  {formData.category === 'REEFER' && (
                    <div className="sm:col-span-3 p-3 bg-teal-50 border border-teal-200/60 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-teal-700 mb-1">
                          Nhiệt Độ Thấp Nhất (°C)
                        </label>
                        <input
                          type="number"
                          value={formData.tempRangeMin ?? -30}
                          onChange={(e) => setFormData({ ...formData, tempRangeMin: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-teal-200/80 rounded-xl text-teal-800 font-mono text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-700 mb-1">
                          Nhiệt Độ Cao Nhất (°C)
                        </label>
                        <input
                          type="number"
                          value={formData.tempRangeMax ?? 30}
                          onChange={(e) => setFormData({ ...formData, tempRangeMax: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-teal-200/80 rounded-xl text-teal-800 font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô Tả Ứng Dụng Hàng Hóa &amp; Hướng Dẫn Vận Hành
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ghi chú về nhóm hàng hóa đóng phù hợp, lưu ý xếp dỡ..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg  transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingType ? 'Cập Nhật Loại Container' : 'Lưu Vào Master Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TECHNICAL BLUEPRINT SPEC VIEWER */}
      {viewingDetailType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-sky-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-200">
                  <Container className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 font-mono">{viewingDetailType.typeCode}</span>
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-mono text-xs font-bold rounded-lg">
                      ISO: {viewingDetailType.isoCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadge(
                        viewingDetailType.category
                      )}`}
                    >
                      {viewingDetailType.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{viewingDetailType.vietnameseName}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDetailType(null)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Blueprint Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Description */}
              <p className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 leading-relaxed">
                {viewingDetailType.description}
              </p>

              {/* Dimensions Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <h5 className="font-bold text-sky-600 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4" /> Kích Thước Phủ Bì Ngoài (External)
                  </h5>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chiều dài:</span>
                      <span className="font-mono font-bold text-slate-900">{viewingDetailType.lengthMm.toLocaleString()} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chiều rộng:</span>
                      <span className="font-mono font-bold text-slate-900">{viewingDetailType.widthMm.toLocaleString()} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chiều cao:</span>
                      <span className="font-mono font-bold text-slate-900">{viewingDetailType.heightMm.toLocaleString()} mm</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <h5 className="font-bold text-amber-600 flex items-center gap-1.5">
                    <Box className="w-4 h-4" /> Kích Thước Lọt Lòng Trong (Internal)
                  </h5>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chiều dài trong:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {viewingDetailType.internalLengthMm.toLocaleString()} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chiều rộng trong:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {viewingDetailType.internalWidthMm.toLocaleString()} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chiều cao trong:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {viewingDetailType.internalHeightMm.toLocaleString()} mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight & Capacity Table */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h5 className="font-bold text-emerald-600 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Tải Trọng &amp; Dung Tích Xếp Hàng
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Thể Tích (CBM)</span>
                    <span className="text-base font-bold font-mono text-cyan-700">{viewingDetailType.cbm} m³</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Trọng Lượng Bì (Tare)</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {viewingDetailType.tareWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Tải Trọng Hàng Max</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {viewingDetailType.maxPayloadKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Max Gross Weight</span>
                    <span className="text-base font-bold font-mono text-emerald-600">
                      {viewingDetailType.maxGrossWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Material & Reefer info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Chất liệu vỏ:</span>
                  <span className="font-semibold text-slate-900">{viewingDetailType.material}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Chất liệu sàn:</span>
                  <span className="font-semibold text-slate-900">{viewingDetailType.floorType}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Quy đổi TEU:</span>
                  <span className="font-semibold text-indigo-700 font-mono">{viewingDetailType.teuRatio} TEU</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingDetailType(null);
                  handleOpenEdit(viewingDetailType);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Chỉnh Sửa Loại Này</span>
              </button>

              <button
                onClick={() => setViewingDetailType(null)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
