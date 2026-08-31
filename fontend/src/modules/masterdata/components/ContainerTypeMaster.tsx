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

const PRESETS_20FT: Partial<ContainerTypeMasterItem>[] = [
  {
    typeCode: '20DC',
    isoCode: '22G1',
    vietnameseName: 'Container Khô 20 Feet Thường (20DC / 20GP)',
    name: '20ft Dry General Purpose Container',
    size: '20',
    category: 'DRY',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2393,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 33.2,
    tareWeightKg: 2230,
    maxPayloadKg: 28250,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Quy cách chuẩn phổ biến nhất đóng hàng bách hóa tổng hợp, nông sản, vật liệu xây dựng.'
  },
  {
    typeCode: '20HC',
    isoCode: '25G1',
    vietnameseName: 'Container Khô 20 Feet Cao (20HC / 20HQ)',
    name: '20ft High Cube Dry Container (9ft 6in)',
    size: '20',
    category: 'DRY',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2896,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2698,
    doorWidthMm: 2340,
    doorHeightMm: 2585,
    cbm: 37.4,
    tareWeightKg: 2380,
    maxPayloadKg: 28100,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Phiên bản 20ft tăng chiều cao lên 2.896m (9ft 6in), tăng dung tích chứa hàng thêm 13%.'
  },
  {
    typeCode: '20RF',
    isoCode: '22R1',
    vietnameseName: 'Container Lạnh 20 Feet (20RF)',
    name: '20ft Reefer Refrigerated Container',
    size: '20',
    category: 'REEFER',
    isReefer: true,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5444,
    internalWidthMm: 2294,
    internalHeightMm: 2276,
    doorWidthMm: 2290,
    doorHeightMm: 2264,
    cbm: 28.3,
    tareWeightKg: 2950,
    maxPayloadKg: 27530,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    tempRangeMin: -30,
    tempRangeMax: 30,
    material: 'STAINLESS_STEEL',
    floorType: 'ALUMINUM_T_FLOOR',
    description: 'Trang bị máy nén lạnh Thermo King / Carrier, vách foam cách nhiệt, sàn chữ T luân chuyển khí lạnh.'
  },
  {
    typeCode: '20HR',
    isoCode: '25R1',
    vietnameseName: 'Container Lạnh 20 Feet Cao (20HR / 20RH)',
    name: '20ft High Cube Refrigerated Container',
    size: '20',
    category: 'REEFER',
    isReefer: true,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2896,
    internalLengthMm: 5444,
    internalWidthMm: 2294,
    internalHeightMm: 2560,
    doorWidthMm: 2290,
    doorHeightMm: 2540,
    cbm: 32.5,
    tareWeightKg: 3100,
    maxPayloadKg: 27380,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    tempRangeMin: -35,
    tempRangeMax: 30,
    material: 'STAINLESS_STEEL',
    floorType: 'ALUMINUM_T_FLOOR',
    description: 'Container bảo ôn lạnh 20ft chiều cao 2.896m, bảo quản hàng đông lạnh mật độ cao, kem, thịt bò, dược phẩm.'
  },
  {
    typeCode: '20OT',
    isoCode: '22U1',
    vietnameseName: 'Container Mở Nóc 20 Feet (20OT)',
    name: '20ft Open Top Container (Soft Top)',
    size: '20',
    category: 'OPEN_TOP',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2348,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 32.0,
    tareWeightKg: 2350,
    maxPayloadKg: 28130,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Nóc hở phủ bạt Tarpaulin kéo rút, đà ngang xà nóc tháo lắp được, phục vụ cẩu tải hàng máy móc quá khổ.'
  },
  {
    typeCode: '20HT',
    isoCode: '22U6',
    vietnameseName: 'Container Mở Nóc Cứng 20 Feet (20HT / Hard Top)',
    name: '20ft Hard Top Open Top Container',
    size: '20',
    category: 'OPEN_TOP',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2348,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 32.2,
    tareWeightKg: 2680,
    maxPayloadKg: 27800,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Nắp nóc bằng tôn thép dập sóng tháo rời được bằng cẩu bốc xếp, an toàn và kín nước như cont khô.'
  },
  {
    typeCode: '20FR',
    isoCode: '22P1',
    vietnameseName: 'Container Mặt Bằng 20 Feet (20FR)',
    name: '20ft Flat Rack Container (Collapsible Ends)',
    size: '20',
    category: 'FLAT_RACK',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5940,
    internalWidthMm: 2380,
    internalHeightMm: 2233,
    doorWidthMm: 0,
    doorHeightMm: 0,
    cbm: 31.0,
    tareWeightKg: 2750,
    maxPayloadKg: 32250,
    maxGrossWeightKg: 35000,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Không vách bên và nóc, 2 đầu thành gập phẳng xếp chồng, sàn chịu tải cực cao cho xe cơ giới, máy xúc.'
  },
  {
    typeCode: '20TK',
    isoCode: '22T1',
    vietnameseName: 'Container Bồn Xitec 20 Feet (20TK / ISO Tank)',
    name: '20ft ISO Tank Container (UN T11/T14)',
    size: '20',
    category: 'TANK',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5850,
    internalWidthMm: 2300,
    internalHeightMm: 2300,
    doorWidthMm: 0,
    doorHeightMm: 0,
    cbm: 26.0,
    tareWeightKg: 3420,
    maxPayloadKg: 32580,
    maxGrossWeightKg: 36000,
    teuRatio: 1.0,
    material: 'STAINLESS_STEEL',
    floorType: 'STEEL',
    description: 'Bồn thép không gỉ 316L, có lớp cách nhiệt và ống gia nhiệt hơi nước Steam Coil, vận chuyển hóa chất lỏng, dầu nhớt.'
  },
  {
    typeCode: '20VH',
    isoCode: '22V0',
    vietnameseName: 'Container Thông Gió 20 Feet (20VH / Coffee Cont)',
    name: '20ft Ventilated Coffee Container',
    size: '20',
    category: 'VENTILATED',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2393,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 33.0,
    tareWeightKg: 2320,
    maxPayloadKg: 28160,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Có hệ thống khe thoát ẩm thông gió tự nhiên dọc xà trên và xà dưới, chống ngưng tụ mồ hôi cho hạt cà phê, ca cao.'
  },
  {
    typeCode: '20BK',
    isoCode: '22B0',
    vietnameseName: 'Container Chở Hàng Rời 20 Feet (20BK / Bulk)',
    name: '20ft Dry Bulk Container (Top Loading Hatch)',
    size: '20',
    category: 'BULK',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2393,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 32.8,
    tareWeightKg: 2450,
    maxPayloadKg: 28030,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'STEEL',
    description: 'Có cửa nạp liệu trên nóc (Manholes) và cửa xả góc dưới cửa sau, dùng vận chuyển ngũ cốc, hạt nhựa, xi măng.'
  },
  {
    typeCode: '20OS',
    isoCode: '22S1',
    vietnameseName: 'Container Mở Vách Hông 20 Feet (20OS / Side Door)',
    name: '20ft Full Side Access / Open Side Container',
    size: '20',
    category: 'SPECIAL',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2280,
    internalHeightMm: 2300,
    doorWidthMm: 5700,
    doorHeightMm: 2180,
    cbm: 31.0,
    tareWeightKg: 3180,
    maxPayloadKg: 27300,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Toàn bộ một bên vách hông mở 4 cánh cửa dạng xếp, cho phép xe nâng bốc dỡ pallet trực tiếp từ cạnh bên.'
  },
  {
    typeCode: '20DD',
    isoCode: '22G9',
    vietnameseName: 'Container Mở 2 Đầu Cửa 20 Feet (20DD / Tunnel)',
    name: '20ft Double Door / Tunnel Container',
    size: '20',
    category: 'SPECIAL',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5840,
    internalWidthMm: 2352,
    internalHeightMm: 2393,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 32.8,
    tareWeightKg: 2400,
    maxPayloadKg: 28080,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'CORTEN_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Thiết kế 2 bộ cửa mở ở cả hai đầu container, thuận tiện bốc dỡ hàng theo nguyên tắc FIFO hoặc ngăn vách đôi.'
  },
  {
    typeCode: '20IC',
    isoCode: '22H0',
    vietnameseName: 'Container Cách Nhiệt Bảo Ôn 20 Feet (20IC / Insulated)',
    name: '20ft Insulated Thermal Container',
    size: '20',
    category: 'SPECIAL',
    isReefer: false,
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5740,
    internalWidthMm: 2270,
    internalHeightMm: 2270,
    doorWidthMm: 2260,
    doorHeightMm: 2210,
    cbm: 29.5,
    tareWeightKg: 2550,
    maxPayloadKg: 27930,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    material: 'STAINLESS_STEEL',
    floorType: 'WOOD_PLYWOOD',
    description: 'Vách cách nhiệt Polyurethane bảo vệ hàng hóa nhạy cảm với sốc nhiệt mà không cần máy lạnh cơ học.'
  }
];

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
    lengthMm: 6058,
    widthMm: 2438,
    heightMm: 2591,
    internalLengthMm: 5898,
    internalWidthMm: 2352,
    internalHeightMm: 2393,
    doorWidthMm: 2340,
    doorHeightMm: 2280,
    cbm: 33.2,
    tareWeightKg: 2200,
    maxPayloadKg: 28280,
    maxGrossWeightKg: 30480,
    teuRatio: 1.0,
    tempRangeMin: -30,
    tempRangeMax: 30,
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
      id: `CT-${String(types.length + 1).padStart(2, '0')}`,
      typeCode: '',
      isoCode: '',
      name: '',
      vietnameseName: '',
      size: '20',
      category: 'DRY',
      isReefer: false,
      lengthMm: 6058,
      widthMm: 2438,
      heightMm: 2591,
      internalLengthMm: 5898,
      internalWidthMm: 2352,
      internalHeightMm: 2393,
      doorWidthMm: 2340,
      doorHeightMm: 2280,
      cbm: 33.2,
      tareWeightKg: 2200,
      maxPayloadKg: 28280,
      maxGrossWeightKg: 30480,
      teuRatio: 1.0,
      tempRangeMin: -30,
      tempRangeMax: 30,
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

  // Handle Duplicate
  const handleDuplicate = (item: ContainerTypeMasterItem) => {
    const newItem: ContainerTypeMasterItem = {
      ...item,
      id: `CT-${Date.now().toString().slice(-4)}`,
      typeCode: `${item.typeCode}_COPY`,
      isoCode: `${item.isoCode}_C`,
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
        name: formData.name || formData.vietnameseName,
        vietnameseName: formData.vietnameseName,
        size: formData.size || '20',
        category: formData.category || 'DRY',
        isReefer: formData.category === 'REEFER' || !!formData.isReefer,
        lengthMm: Number(formData.lengthMm) || 6058,
        widthMm: Number(formData.widthMm) || 2438,
        heightMm: Number(formData.heightMm) || 2591,
        internalLengthMm: Number(formData.internalLengthMm) || 5898,
        internalWidthMm: Number(formData.internalWidthMm) || 2352,
        internalHeightMm: Number(formData.internalHeightMm) || 2393,
        doorWidthMm: Number(formData.doorWidthMm) || 2340,
        doorHeightMm: Number(formData.doorHeightMm) || 2280,
        cbm: Number(formData.cbm) || 33.2,
        tareWeightKg: Number(formData.tareWeightKg) || 2200,
        maxPayloadKg: payloadKg > 0 ? payloadKg : Number(formData.maxPayloadKg) || 28280,
        maxGrossWeightKg: Number(formData.maxGrossWeightKg) || 30480,
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
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'REEFER':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'OPEN_TOP':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'FLAT_RACK':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'TANK':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'VENTILATED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'BULK':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
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
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
            <Container className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Tổng Loại Vỏ</span>
            <span className="text-lg font-bold text-white">{stats.total} loại</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Cont Khô (Dry)</span>
            <span className="text-lg font-bold text-blue-400">{stats.dryCount} loại</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Cont Lạnh (Reefer)</span>
            <span className="text-lg font-bold text-teal-400">{stats.reeferCount} loại</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Loại Đặc Biệt</span>
            <span className="text-lg font-bold text-amber-400">{stats.specialCount} loại</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-lg col-span-2 sm:col-span-1">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Đang Áp Dụng</span>
            <span className="text-lg font-bold text-emerald-400">{stats.activeCount} active</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã loại (20DC, 40HC, 40HR), mã ISO (22G1, 45R1), tên quy cách..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Xuất Excel/CSV</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'TABLE' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Dạng Bảng Chi Tiết"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'GRID' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Dạng Thẻ Blueprint"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Loại Container</span>
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-400" /> Lọc nhanh:
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
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
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

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Size Filter */}
          <div className="flex items-center gap-1">
            {['ALL', '20', '40', '45', '10'].map((sz) => (
              <button
                key={sz}
                onClick={() => setSizeFilter(sz)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sizeFilter === sz
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {sz === 'ALL' ? 'Tất cả cỡ' : `${sz} Feet`}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider">
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
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
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
                      className="hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => setViewingDetailType(item)}
                    >
                      {/* Type Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-950 text-white font-mono font-bold rounded-lg border border-slate-800 text-xs shadow-sm">
                            {item.typeCode}
                          </span>
                          {item.isReefer && (
                            <span title="Container Lạnh">
                              <ThermometerSnowflake className="w-3.5 h-3.5 text-teal-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ISO Code */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/50">
                          {item.isoCode}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-white block">{item.vietnameseName}</span>
                          <span className="text-[11px] text-slate-400 block">{item.name}</span>
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
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
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
                      <td className="py-3.5 px-3 font-semibold text-white">
                        <span className="px-2 py-0.5 bg-slate-950 rounded font-mono text-cyan-300 border border-slate-800">
                          {item.cbm} m³
                        </span>
                      </td>

                      {/* Tare Weight */}
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {item.tareWeightKg.toLocaleString()} kg
                      </td>

                      {/* Max Gross */}
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        {item.maxGrossWeightKg.toLocaleString()} kg
                      </td>

                      {/* TEU */}
                      <td className="py-3.5 px-3 font-mono text-indigo-300 font-bold">
                        {item.teuRatio} TEU
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
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
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-950/50 rounded-lg transition"
                            title="Xem chi tiết Blueprint"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/50 rounded-lg transition"
                            title="Chỉnh sửa thông số"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(item)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/50 rounded-lg transition"
                            title="Tạo bản sao"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition"
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
              className="p-5 bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl space-y-4 shadow-xl transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-950 text-white font-mono font-bold text-sm rounded-xl border border-slate-800 shadow">
                      {item.typeCode}
                    </span>
                    <span className="px-2 py-0.5 bg-sky-950/60 text-sky-400 font-mono font-bold text-xs rounded-lg border border-sky-800/60">
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
                  <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition">
                    {item.vietnameseName}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                </div>

                {/* Specs Box */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Kích thước (DxRxC mm):</span>
                    <span className="font-mono text-slate-200 text-[11px]">
                      {item.lengthMm} x {item.widthMm} x {item.heightMm}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Thể tích chứa hàng:</span>
                    <span className="font-mono font-bold text-cyan-300">{item.cbm} CBM (m³)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Trọng lượng bì (Tare):</span>
                    <span className="font-mono text-slate-300">{item.tareWeightKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Max Gross Weight:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {item.maxGrossWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                className="flex items-center justify-between pt-3 border-t border-slate-800/80"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    item.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.status === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm ngưng'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/50 rounded-lg transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/50 rounded-lg transition"
                    title="Sao chép"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-600/20 text-sky-400 rounded-2xl border border-sky-500/30">
                  <Container className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingType ? `Chỉnh Sửa Loại Container: ${editingType.typeCode}` : 'Thêm Mới Loại Container (ISO 6346)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cấu hình kích thước kỹ thuật, thể tích chứa, tải trọng quy chuẩn và đặc tính vận hành.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Basic Identifiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>1. Thông Tin Nhận Diện &amp; Tiêu Chuẩn Quốc Tế</span>
                  </h4>
                </div>

                {/* Quick 20ft Preset Bar */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chọn nhanh mẫu quy chuẩn <strong>20 Feet (1.0 TEU)</strong> theo Phân nhóm:</span>
                    </span>
                    <span className="text-[10px] text-slate-500 italic">Tự động điền kích thước, tải trọng &amp; thông số ISO</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESETS_20FT.map((p) => (
                      <button
                        key={p.typeCode}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            ...p,
                            id: prev.id || `CT-${Date.now().toString().slice(-4)}`
                          }));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer border ${
                          formData.typeCode === p.typeCode
                            ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                        }`}
                        title={`${p.vietnameseName} (${p.category})`}
                      >
                        <span>{p.typeCode}</span>
                        <span className="text-[9px] text-slate-400">({p.category})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mã Loại Container (Type Code)*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 20DC, 40HC, 40HR"
                      value={formData.typeCode || ''}
                      onChange={(e) => setFormData({ ...formData, typeCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mã ISO (ISO 6346 Code)*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 22G1, 45G1, 45R1"
                      value={formData.isoCode || ''}
                      onChange={(e) => setFormData({ ...formData, isoCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sky-300 font-mono font-bold text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="20">20 Feet (1.0 TEU)</option>
                      <option value="40">40 Feet (2.0 TEU)</option>
                      <option value="45">45 Feet (2.25 TEU)</option>
                      <option value="10">10 Feet (0.5 TEU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-sky-500"
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tên Tiếng Việt Quy Cách*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Container Khô 40 Feet Cao (40HC)"
                      value={formData.vietnameseName || ''}
                      onChange={(e) => setFormData({ ...formData, vietnameseName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tên Tiếng Anh Quốc Tế
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 40ft High Cube Dry Container"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dimensions */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>2. Kích Thước Kỹ Thuật (Kích Thước mm)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* External */}
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-white block">Kích Thước Phủ Bì Ngoài (External)</span>
                    <div>
                      <label className="block text-[10px] text-slate-400">Chiều Dài (mm)</label>
                      <input
                        type="number"
                        value={formData.lengthMm || 0}
                        onChange={(e) => setFormData({ ...formData, lengthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Chiều Rộng (mm)</label>
                      <input
                        type="number"
                        value={formData.widthMm || 0}
                        onChange={(e) => setFormData({ ...formData, widthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Chiều Cao (mm)</label>
                      <input
                        type="number"
                        value={formData.heightMm || 0}
                        onChange={(e) => setFormData({ ...formData, heightMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Internal */}
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-white block">Kích Thước Lọt Lòng Trong (Internal)</span>
                    <div>
                      <label className="block text-[10px] text-slate-400">Chiều Dài Trong (mm)</label>
                      <input
                        type="number"
                        value={formData.internalLengthMm || 0}
                        onChange={(e) => setFormData({ ...formData, internalLengthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Chiều Rộng Trong (mm)</label>
                      <input
                        type="number"
                        value={formData.internalWidthMm || 0}
                        onChange={(e) => setFormData({ ...formData, internalWidthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Chiều Cao Trong (mm)</label>
                      <input
                        type="number"
                        value={formData.internalHeightMm || 0}
                        onChange={(e) => setFormData({ ...formData, internalHeightMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Door Opening & CBM */}
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-white block">Kích Thước Khung Cửa &amp; Thể Tích</span>
                    <div>
                      <label className="block text-[10px] text-slate-400">Rộng Mở Cửa (mm)</label>
                      <input
                        type="number"
                        value={formData.doorWidthMm || 0}
                        onChange={(e) => setFormData({ ...formData, doorWidthMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">Cao Mở Cửa (mm)</label>
                      <input
                        type="number"
                        value={formData.doorHeightMm || 0}
                        onChange={(e) => setFormData({ ...formData, doorHeightMm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-cyan-300 font-bold">Thể Tích Chứa Hàng (CBM m³)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.cbm || 0}
                        onChange={(e) => setFormData({ ...formData, cbm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-cyan-300 font-mono font-bold text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Weights & Payload */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>3. Tải Trọng &amp; Trọng Lượng Quy Chuẩn (kg)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tải Trọng Hàng Hóa (Max Payload kg)
                    </label>
                    <input
                      type="number"
                      value={formData.maxPayloadKg || 0}
                      onChange={(e) => setFormData({ ...formData, maxPayloadKg: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Material & Specifications */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>4. Cấu Trúc Vật Liệu &amp; Mô Tả Vận Hành</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Vật Liệu Vỏ Chế Tạo (Material)
                    </label>
                    <select
                      value={formData.material || 'CORTEN_STEEL'}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    >
                      <option value="CORTEN_STEEL">Thép Chống Ăn Mòn Corten Steel (SPA-H)</option>
                      <option value="STAINLESS_STEEL">Thép Không Gỉ Inox 304/316L</option>
                      <option value="ALUMINUM">Hợp Kim Nhôm Aluminium</option>
                      <option value="FRP">Nhựa Composite Cốt Sợi Thủy Tinh (FRP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Loại Ván Sàn (Floor Type)
                    </label>
                    <select
                      value={formData.floorType || 'WOOD_PLYWOOD'}
                      onChange={(e) => setFormData({ ...formData, floorType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    >
                      <option value="WOOD_PLYWOOD">Ván Ép Gỗ Dầu Cứng Plywood 28mm (IICL)</option>
                      <option value="BAMBOO">Ván Ép Tre Ép Khối (Bamboo Floorboard)</option>
                      <option value="ALUMINUM_T_FLOOR">Sàn Nhôm Rãnh Chữ T (Reefer T-Floor)</option>
                      <option value="STEEL">Sàn Thép Tấm Chống Trượt (Steel Floor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Trạng Thái Áp Dụng
                    </label>
                    <select
                      value={formData.status || 'ACTIVE'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold text-xs focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE - Đang Áp Dụng Hệ Thống</option>
                      <option value="INACTIVE">INACTIVE - Tạm Ngưng Sử Dụng</option>
                    </select>
                  </div>

                  {formData.category === 'REEFER' && (
                    <div className="sm:col-span-3 p-3 bg-teal-950/40 border border-teal-800/60 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-teal-300 mb-1">
                          Nhiệt Độ Thấp Nhất (°C)
                        </label>
                        <input
                          type="number"
                          value={formData.tempRangeMin || -30}
                          onChange={(e) => setFormData({ ...formData, tempRangeMin: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-950 border border-teal-800/80 rounded-xl text-teal-200 font-mono text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-teal-300 mb-1">
                          Nhiệt Độ Cao Nhất (°C)
                        </label>
                        <input
                          type="number"
                          value={formData.tempRangeMax || 30}
                          onChange={(e) => setFormData({ ...formData, tempRangeMax: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-slate-950 border border-teal-800/80 rounded-xl text-teal-200 font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mô Tả Ứng Dụng Hàng Hóa &amp; Hướng Dẫn Vận Hành
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ghi chú về nhóm hàng hóa đóng phù hợp, lưu ý xếp dỡ..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-600/20 text-sky-400 rounded-2xl border border-sky-500/30">
                  <Container className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">{viewingDetailType.typeCode}</span>
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 font-mono text-xs font-bold rounded-lg">
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
                  <p className="text-xs text-slate-400 mt-0.5">{viewingDetailType.vietnameseName}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDetailType(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Blueprint Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Description */}
              <p className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 leading-relaxed">
                {viewingDetailType.description}
              </p>

              {/* Dimensions Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
                  <h5 className="font-bold text-sky-400 flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4" /> Kích Thước Phủ Bì Ngoài (External)
                  </h5>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chiều dài:</span>
                      <span className="font-mono font-bold text-white">{viewingDetailType.lengthMm.toLocaleString()} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chiều rộng:</span>
                      <span className="font-mono font-bold text-white">{viewingDetailType.widthMm.toLocaleString()} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chiều cao:</span>
                      <span className="font-mono font-bold text-white">{viewingDetailType.heightMm.toLocaleString()} mm</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5">
                  <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Box className="w-4 h-4" /> Kích Thước Lọt Lòng Trong (Internal)
                  </h5>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chiều dài trong:</span>
                      <span className="font-mono font-bold text-white">
                        {viewingDetailType.internalLengthMm.toLocaleString()} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chiều rộng trong:</span>
                      <span className="font-mono font-bold text-white">
                        {viewingDetailType.internalWidthMm.toLocaleString()} mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chiều cao trong:</span>
                      <span className="font-mono font-bold text-white">
                        {viewingDetailType.internalHeightMm.toLocaleString()} mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight & Capacity Table */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <h5 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" /> Tải Trọng &amp; Dung Tích Xếp Hàng
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Thể Tích (CBM)</span>
                    <span className="text-base font-bold font-mono text-cyan-300">{viewingDetailType.cbm} m³</span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Trọng Lượng Bì (Tare)</span>
                    <span className="text-base font-bold font-mono text-white">
                      {viewingDetailType.tareWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Tải Trọng Hàng Max</span>
                    <span className="text-base font-bold font-mono text-white">
                      {viewingDetailType.maxPayloadKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Max Gross Weight</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {viewingDetailType.maxGrossWeightKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Material & Reefer info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Chất liệu vỏ:</span>
                  <span className="font-semibold text-white">{viewingDetailType.material}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Chất liệu sàn:</span>
                  <span className="font-semibold text-white">{viewingDetailType.floorType}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Quy đổi TEU:</span>
                  <span className="font-semibold text-indigo-300 font-mono">{viewingDetailType.teuRatio} TEU</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingDetailType(null);
                  handleOpenEdit(viewingDetailType);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
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
