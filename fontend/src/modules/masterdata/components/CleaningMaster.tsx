import React, { useState, useEffect, useMemo } from 'react';
import { CleaningTariffMasterItem, CleaningCategoryType, ContainerTypeMasterItem } from '../../survey/types';
import { INITIAL_CONTAINER_TYPES } from '../../survey/mockData';
import {
  Sparkles,
  Droplets,
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
  Clock,
  Flame,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  Check,
  X,
  LayoutGrid,
  List,
  Table,
  SlidersHorizontal,
  ChevronDown,
  Printer,
  Sparkle,
  Container as ContainerIcon
} from 'lucide-react';

export interface CleaningMasterProps {
  cleaningTariffs: CleaningTariffMasterItem[];
  onUpdateCleaningTariffs: (updated: CleaningTariffMasterItem[]) => void;
  containerTypes?: ContainerTypeMasterItem[];
}

export const CleaningMaster: React.FC<CleaningMasterProps> = ({
  cleaningTariffs,
  onUpdateCleaningTariffs,
  containerTypes = INITIAL_CONTAINER_TYPES
}) => {
  const [tariffs, setTariffs] = useState<CleaningTariffMasterItem[]>(cleaningTariffs);

  // `cleaningTariffs` tới từ `MasterDataPage` qua fetch API bất đồng bộ, chỉ có dữ liệu thật SAU khi
  // component này đã mount xong (màn này là tab mặc định của Master Data, nên gần như luôn mount trước
  // khi API kịp trả về). `useState(cleaningTariffs)` ở trên chỉ đọc giá trị prop MỘT LẦN DUY NHẤT lúc
  // khởi tạo — nếu không có effect này, `tariffs` sẽ mãi mãi là mảng rỗng dù `cleaningTariffs` sau đó
  // đã có dữ liệu thật từ database, khiến màn hình luôn trống cho tới khi người dùng đổi tab rồi quay
  // lại (ép component unmount/remount). Effect này đồng bộ lại `tariffs` mỗi khi prop thật sự đổi.
  useEffect(() => {
    setTariffs(cleaningTariffs);
  }, [cleaningTariffs]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [containerTypeFilter, setContainerTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [responsibleFilter, setResponsibleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'MATRIX' | 'CARD' | 'SHIPPING_LINE'>('MATRIX');
  const [selectedShippingLine, setSelectedShippingLine] = useState<string>('MAERSK');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTariff, setEditingTariff] = useState<CleaningTariffMasterItem | null>(null);
  const [viewDetailItem, setViewDetailItem] = useState<CleaningTariffMasterItem | null>(null);
  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState<boolean>(false);
  const [bulkPercent, setBulkPercent] = useState<number>(5);
  const [bulkApplyCategory, setBulkApplyCategory] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState<Partial<CleaningTariffMasterItem>>({
    cleaningCode: '',
    cedexCode: '',
    name: '',
    vietnameseName: '',
    category: 'GENERAL_SWEEP',
    description: '',
    applicableSizes: ['20', '40', '45'],
    price20DC: 150000,
    price40DC: 220000,
    price40HC: 250000,
    price45HC: 300000,
    price20RF: 180000,
    price40HR: 260000,
    currency: 'VND',
    estimatedDurationMin: 30,
    waterUsageLiters: 50,
    chemicalRequired: 'Không dùng hóa chất',
    equipmentUsed: 'Chổi cước & súng xịt áp lực',
    responsiblePartyDefault: 'U',
    vatPercent: 8,
    status: 'ACTIVE',
    sortOrder: 1
  });

  const updateList = (newTariffs: CleaningTariffMasterItem[]) => {
    setTariffs(newTariffs);
    onUpdateCleaningTariffs(newTariffs);
  };

  // Helper format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Filtered Tariffs
  const filteredTariffs = useMemo(() => {
    return tariffs.filter((item) => {
      const matchSearch =
        item.cleaningCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cedexCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vietnameseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.chemicalRequired.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchType =
        containerTypeFilter === 'ALL' ||
        !item.applicableContainerTypes ||
        item.applicableContainerTypes.length === 0 ||
        item.applicableContainerTypes.includes(containerTypeFilter);
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchResp = responsibleFilter === 'ALL' || item.responsiblePartyDefault === responsibleFilter;

      return matchSearch && matchCat && matchType && matchStatus && matchResp;
    });
  }, [tariffs, searchTerm, categoryFilter, containerTypeFilter, statusFilter, responsibleFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tariffs.length;
    const active = tariffs.filter((t) => t.status === 'ACTIVE').length;
    const avg20 = total > 0 ? Math.round(tariffs.reduce((sum, t) => sum + t.price20DC, 0) / total) : 0;
    const avg40 = total > 0 ? Math.round(tariffs.reduce((sum, t) => sum + t.price40HC, 0) / total) : 0;
    const chemicalCount = tariffs.filter((t) => t.category === 'CHEMICAL_WASH' || t.category === 'SPECIAL_TREATMENT' || t.category === 'DEODORIZATION').length;
    const reeferCount = tariffs.filter((t) => t.category === 'REEFER_SANITATION' || t.price20RF > 0).length;

    return { total, active, avg20, avg40, chemicalCount, reeferCount };
  }, [tariffs]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTariff(null);
    setFormData({
      cleaningCode: `CLN_SVC_${Math.floor(100 + Math.random() * 900)}`,
      cedexCode: 'CW',
      name: '',
      vietnameseName: '',
      category: 'GENERAL_SWEEP',
      description: '',
      applicableSizes: ['20', '40', '45'],
      price20DC: 150000,
      price40DC: 220000,
      price40HC: 250000,
      price45HC: 300000,
      price20RF: 200000,
      price40HR: 300000,
      currency: 'VND',
      estimatedDurationMin: 30,
      waterUsageLiters: 100,
      chemicalRequired: 'Chất tẩy rửa chuyên dụng',
      equipmentUsed: 'Máy xịt nước áp lực cao',
      responsiblePartyDefault: 'U',
      vatPercent: 8,
      status: 'ACTIVE',
      sortOrder: tariffs.length + 1
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: CleaningTariffMasterItem) => {
    setEditingTariff(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Duplicate Item
  const handleDuplicate = (item: CleaningTariffMasterItem) => {
    const newItem: CleaningTariffMasterItem = {
      ...item,
      id: 'CLN-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      cleaningCode: `${item.cleaningCode}_COPY`,
      name: `${item.name} (Bản sao)`,
      vietnameseName: `${item.vietnameseName} (Bản sao)`,
      sortOrder: tariffs.length + 1
    };
    updateList([...tariffs, newItem]);
  };

  // Delete Item
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa biểu phí "${name}" không?`)) {
      updateList(tariffs.filter((t) => t.id !== id));
    }
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    const updated = tariffs.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const)) } : t
    );
    updateList(updated);
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cleaningCode || !formData.vietnameseName) {
      alert('Vui lòng nhập đầy đủ Mã dịch vụ và Tên tiếng Việt!');
      return;
    }

    if (editingTariff) {
      const updated = tariffs.map((t) =>
        t.id === editingTariff.id ? ({ ...t, ...formData } as CleaningTariffMasterItem) : t
      );
      updateList(updated);
    } else {
      const newItem: CleaningTariffMasterItem = {
        ...(formData as CleaningTariffMasterItem),
        id: 'CLN-' + Math.random().toString(36).substring(2, 6).toUpperCase()
      };
      updateList([...tariffs, newItem]);
    }
    setIsModalOpen(false);
  };

  // Apply Quick Template
  const handleApplyPreset = (presetKey: string) => {
    const presets: Record<string, Partial<CleaningTariffMasterItem>> = {
      SWEEP: {
        cleaningCode: 'CLN_SWEEP_CUSTOM',
        cedexCode: 'SW',
        name: 'Dry Sweeping & Debris Clearance',
        vietnameseName: 'Quét dọn rác, bổi dăm gỗ & xịt khí nén',
        category: 'GENERAL_SWEEP',
        description: 'Quét dọn sạch sẽ rác, gỗ chèn dunnage, đinh sắt và xịt bụi khô toàn bộ thùng cont.',
        price20DC: 120000,
        price40DC: 180000,
        price40HC: 200000,
        price45HC: 250000,
        price20RF: 150000,
        price40HR: 220000,
        estimatedDurationMin: 20,
        waterUsageLiters: 0,
        chemicalRequired: 'Không dùng (Khô)',
        equipmentUsed: 'Chổi cước, máy xịt khí nén',
        responsiblePartyDefault: 'U'
      },
      WATER_200: {
        cleaningCode: 'CLN_WASH_200B_CUSTOM',
        cedexCode: 'WW',
        name: 'Cold Water High Pressure Jet (200 Bar)',
        vietnameseName: 'Rửa nước lạnh áp lực 200 Bar',
        category: 'WATER_PRESSURE',
        description: 'Xịt rửa trôi đất cát, bùn dơ bám dính thành vách và sàn gỗ.',
        price20DC: 250000,
        price40DC: 380000,
        price40HC: 420000,
        price45HC: 480000,
        price20RF: 300000,
        price40HR: 450000,
        estimatedDurationMin: 35,
        waterUsageLiters: 150,
        chemicalRequired: 'Nước sạch tinh khiết',
        equipmentUsed: 'Máy bơm cao áp Karcher 200 Bar',
        responsiblePartyDefault: 'U'
      },
      HOT_WASH: {
        cleaningCode: 'CLN_HOT_WASH_CUSTOM',
        cedexCode: 'HW',
        name: 'Hot Water 80°C Degreasing Wash',
        vietnameseName: 'Xịt rửa nước nóng 80°C tẩy dầu mỡ',
        category: 'HOT_WATER_WASH',
        description: 'Rửa nước nóng 80°C làm tan màng mỡ bôi trơn, váng dầu thực vật và tiệt trùng vi sinh.',
        price20DC: 350000,
        price40DC: 520000,
        price40HC: 580000,
        price45HC: 650000,
        price20RF: 420000,
        price40HR: 620000,
        estimatedDurationMin: 45,
        waterUsageLiters: 180,
        chemicalRequired: 'Nước nóng gia nhiệt Boiler 80°C',
        equipmentUsed: 'Hệ thống lò hơi Diesel cao áp',
        responsiblePartyDefault: 'U'
      },
      CHEMICAL: {
        cleaningCode: 'CLN_CHEM_DEGREASE',
        cedexCode: 'CW',
        name: 'Heavy Chemical Degreasing & Solvent Wash',
        vietnameseName: 'Tẩy rửa hóa chất kiềm D-30 dầu nhớt công nghiệp',
        category: 'CHEMICAL_WASH',
        description: 'Phun dung dịch kiềm bọt tuyết bẻ gãy dầu khoáng, cọ rửa sàn và trung hòa pH xả thải.',
        price20DC: 480000,
        price40DC: 720000,
        price40HC: 800000,
        price45HC: 920000,
        price20RF: 580000,
        price40HR: 850000,
        estimatedDurationMin: 60,
        waterUsageLiters: 220,
        chemicalRequired: 'Hóa chất Eco-Degreaser D-30 (Đạt ISO 14001)',
        equipmentUsed: 'Bình bọt tuyết Foam Lance & máy chà sàn xoay',
        responsiblePartyDefault: 'U'
      },
      OZONE: {
        cleaningCode: 'CLN_OZONE_DEODOR',
        cedexCode: 'DO',
        name: 'Ozone Gas Deodorization & Thermal Fogging',
        vietnameseName: 'Xông khí Ozone & Khử mùi tanh nồng hải sản',
        category: 'DEODORIZATION',
        description: 'Xông khí Ozone phá vỡ phân tử mùi tôm cá, gia vị nồng, hạt tiêu, phân bón đạt chuẩn Grade A.',
        price20DC: 550000,
        price40DC: 800000,
        price40HC: 880000,
        price45HC: 990000,
        price20RF: 650000,
        price40HR: 950000,
        estimatedDurationMin: 90,
        waterUsageLiters: 50,
        chemicalRequired: 'Khí Ozone O3 20g/h & Tinh dầu Biosmell',
        equipmentUsed: 'Máy sục khí Ozone & máy phun khói nhiệt',
        responsiblePartyDefault: 'U'
      },
      STICKER: {
        cleaningCode: 'CLN_STICKER_REMOVE',
        cedexCode: 'SR',
        name: 'Old Placard & DG Sticker Heat Scraping',
        vietnameseName: 'Bóc tẩy tem cước cũ & Nhãn cảnh báo nguy hiểm DG',
        category: 'STICKER_REMOVAL',
        description: 'Thổi nhiệt làm mềm keo dính và tẩy sạch 100% tem nhãn IMO DG, tem cước bám dính ngoài vỏ.',
        price20DC: 150000,
        price40DC: 220000,
        price40HC: 250000,
        price45HC: 300000,
        price20RF: 180000,
        price40HR: 260000,
        estimatedDurationMin: 25,
        waterUsageLiters: 10,
        chemicalRequired: 'Dung môi tẩy keo 3M Adhesive Remover',
        equipmentUsed: 'Súng thổi nhiệt 600°C & dao cạo lưỡi nhựa',
        responsiblePartyDefault: 'U'
      },
      REEFER_FDA: {
        cleaningCode: 'CLN_REEFER_FDA_SAN',
        cedexCode: 'RF',
        name: 'Reefer FDA Sanitization & T-Floor Clean',
        vietnameseName: 'Khử trùng khoang lạnh chuẩn FDA thực phẩm',
        category: 'REEFER_SANITATION',
        description: 'Khử trùng thanh nhôm sàn T-Floor, máng nước ngưng evaporator bằng cồn thực phẩm và Clo hoạt tính.',
        price20DC: 400000,
        price40DC: 600000,
        price40HC: 680000,
        price45HC: 780000,
        price20RF: 750000,
        price40HR: 1150000,
        estimatedDurationMin: 75,
        waterUsageLiters: 160,
        chemicalRequired: 'Cồn thực phẩm 70% & Clorin 200ppm',
        equipmentUsed: 'Súng phun Nano sương & que thử vi sinh ATP',
        responsiblePartyDefault: 'O'
      },
      FLOOR_SAND: {
        cleaningCode: 'CLN_FLOOR_GRINDING',
        cedexCode: 'FS',
        name: 'Floorboard Sanding & Stain Removal',
        vietnameseName: 'Chà nhám đánh bóng sàn gỗ tẩy vệt đen',
        category: 'FLOOR_TREATMENT',
        description: 'Chà nhám bề mặt ván ép 0.5mm xóa vệt ố đen, phủ dung dịch chống ẩm bảo vệ gỗ đạt chuẩn Grade A.',
        price20DC: 700000,
        price40DC: 1100000,
        price40HC: 1250000,
        price45HC: 1400000,
        price20RF: 800000,
        price40HR: 1300000,
        estimatedDurationMin: 90,
        waterUsageLiters: 0,
        chemicalRequired: 'Sáp phủ bảo dưỡng Plywood Sealant',
        equipmentUsed: 'Máy chà nhám đĩa xoay 400mm & máy hút bụi HEPA',
        responsiblePartyDefault: 'U'
      }
    };

    if (presets[presetKey]) {
      setFormData((prev) => ({ ...prev, ...presets[presetKey] }));
    }
  };

  // Bulk Price Adjustment
  const handleApplyBulkAdjust = () => {
    const factor = 1 + bulkPercent / 100;
    const updated = tariffs.map((t) => {
      if (bulkApplyCategory === 'ALL' || t.category === bulkApplyCategory) {
        return {
          ...t,
          price20DC: Math.round((t.price20DC * factor) / 1000) * 1000,
          price40DC: Math.round((t.price40DC * factor) / 1000) * 1000,
          price40HC: Math.round((t.price40HC * factor) / 1000) * 1000,
          price45HC: Math.round((t.price45HC * factor) / 1000) * 1000,
          price20RF: Math.round((t.price20RF * factor) / 1000) * 1000,
          price40HR: Math.round((t.price40HR * factor) / 1000) * 1000
        };
      }
      return t;
    });

    updateList(updated);
    setIsBulkAdjustOpen(false);
    alert(`Đã cập nhật điều chỉnh ${bulkPercent >= 0 ? '+' : ''}${bulkPercent}% đơn giá thành công!`);
  };

  // Category Badges helper
  const getCategoryBadge = (cat: CleaningCategoryType) => {
    switch (cat) {
      case 'GENERAL_SWEEP':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold">Quét Khô &amp; Rác</span>;
      case 'WATER_PRESSURE':
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-[10px] font-bold">Xịt Nước 200 Bar</span>;
      case 'HOT_WATER_WASH':
        return <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-md text-[10px] font-bold">Nước Nóng 80°C</span>;
      case 'CHEMICAL_WASH':
        return <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md text-[10px] font-bold">Tẩy Hóa Chất D-30</span>;
      case 'DEODORIZATION':
        return <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-bold">Khử Mùi Ozone O3</span>;
      case 'STICKER_REMOVAL':
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-md text-[10px] font-bold">Bóc Tem Nhãn DG</span>;
      case 'REEFER_SANITATION':
        return <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md text-[10px] font-bold">Khử Trùng Reefer FDA</span>;
      case 'FLOOR_TREATMENT':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold">Chà Nhám Sàn Gỗ</span>;
      case 'SPECIAL_TREATMENT':
        return <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md text-[10px] font-bold">Xử Lý Nấm Mốc</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-bold">{cat}</span>;
    }
  };

  const getResponsiblePartyBadge = (party: 'O' | 'U' | 'T') => {
    switch (party) {
      case 'O':
        return <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-md text-[10px] font-bold">Owner (Hãng tàu)</span>;
      case 'U':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold">User (Chủ hàng)</span>;
      case 'T':
        return <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md text-[10px] font-bold">Transporter (Nhà xe)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Tổng Danh Mục</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white">{stats.total}</div>
          <span className="text-[10px] text-emerald-400 font-bold">{stats.active} Đang Áp Dụng</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Đơn Giá TB Cont 20'</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-black text-emerald-400 font-mono">{formatVND(stats.avg20)}</div>
          <span className="text-[10px] text-slate-400">20DC / 20GP Khô</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Đơn Giá TB Cont 40'</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-black text-indigo-400 font-mono">{formatVND(stats.avg40)}</div>
          <span className="text-[10px] text-slate-400">40DC / 40HC Cao</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Tẩy Rửa Hóa Chất</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400">{stats.chemicalCount}</div>
          <span className="text-[10px] text-slate-400">Khử Mùi &amp; Dầu Mỡ</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Cont Lạnh Reefer</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400">{stats.reeferCount}</div>
          <span className="text-[10px] text-slate-400">Chuẩn FDA / HACCP</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Thuế Suất VAT</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">8%</div>
          <span className="text-[10px] text-slate-400">Cộng Hóa Đơn EIR</span>
        </div>
      </div>

      {/* Main Header & Toolbar */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>DANH MỤC BIỂU PHÍ VỆ SINH CONTAINER (CLEANING TARIFF MASTER)</span>
              </h2>
              <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold rounded-full">
                CEDEX / IICL-6 / ISO 14001
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bảng giá tiêu chuẩn các phương pháp làm sạch vỏ container theo kích cỡ 20DC, 40DC, 40HC, 45HC, 20RF, 40HR và cước thỏa thuận hãng tàu.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsBulkAdjustOpen(true)}
              className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Điều Chỉnh Giá Hàng Loạt</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Thêm Dịch Vụ Vệ Sinh Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã CLN, tên tiếng Việt, hóa chất, CEDEX..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Container Type Filter (From Container Types Master) */}
          <div>
            <select
              value={containerTypeFilter}
              onChange={(e) => setContainerTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tất cả Loại Cont ({containerTypes.length})</option>
              {containerTypes.map((ct) => (
                <option key={ct.id || ct.typeCode} value={ct.typeCode}>
                  {ct.typeCode} ({ct.isoCode}) - {ct.vietnameseName.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Tất cả nhóm phương pháp ({tariffs.length})</option>
              <option value="GENERAL_SWEEP">Quét dọn khô &amp; Rác dunnage</option>
              <option value="WATER_PRESSURE">Xịt nước áp lực 200 Bar</option>
              <option value="HOT_WATER_WASH">Xịt rửa nước nóng 80°C</option>
              <option value="CHEMICAL_WASH">Tẩy rửa hóa chất kiềm / Dầu mỡ</option>
              <option value="DEODORIZATION">Khử mùi tanh hải sản / Khí Ozone</option>
              <option value="STICKER_REMOVAL">Bóc tem nhãn cước / Nhãn DG</option>
              <option value="REEFER_SANITATION">Khử trùng Reefer chuẩn FDA</option>
              <option value="FLOOR_TREATMENT">Chà nhám / Xử lý sàn gỗ</option>
              <option value="SPECIAL_TREATMENT">Xử lý nấm mốc ẩm</option>
            </select>
          </div>

          {/* Responsible Party Filter */}
          <div>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Bên chịu phí (Tất cả)</option>
              <option value="U">User (Chủ hàng)</option>
              <option value="O">Owner (Hãng tàu)</option>
              <option value="T">Transporter (Tài xế)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('MATRIX')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                viewMode === 'MATRIX' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Ma Trận</span>
            </button>
            <button
              onClick={() => setViewMode('CARD')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                viewMode === 'CARD' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Thẻ</span>
            </button>
            <button
              onClick={() => setViewMode('SHIPPING_LINE')}
              className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                viewMode === 'SHIPPING_LINE' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hãng Tàu</span>
            </button>
          </div>
        </div>

        {/* View 1: Price Matrix Table */}
        {viewMode === 'MATRIX' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/90 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Mã Vệ Sinh &amp; CEDEX</th>
                  <th className="py-3 px-4 min-w-[220px]">Tên Dịch Vụ Làm Sạch</th>
                  <th className="py-3 px-3">Phân Nhóm</th>
                  <th className="py-3 px-3 text-right text-sky-400">20DC (GP)</th>
                  <th className="py-3 px-3 text-right text-indigo-400">40DC (GP)</th>
                  <th className="py-3 px-3 text-right text-indigo-300">40HC (Cao)</th>
                  <th className="py-3 px-3 text-right text-purple-400">45HC</th>
                  <th className="py-3 px-3 text-right text-cyan-400">20RF Lạnh</th>
                  <th className="py-3 px-3 text-right text-cyan-300">40HR Lạnh</th>
                  <th className="py-3 px-3 text-center">Bên Chịu Phí</th>
                  <th className="py-3 px-3 text-center">Thời Gian</th>
                  <th className="py-3 px-3 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTariffs.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-slate-500">
                      Không tìm thấy biểu phí vệ sinh nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTariffs.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-cyan-400">{item.cleaningCode}</span>
                          <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 font-mono text-[10px] rounded border border-slate-700">
                            {item.cedexCode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{item.vietnameseName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[260px]">{item.name}</div>
                      </td>
                      <td className="py-3 px-3">{getCategoryBadge(item.category)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-sky-400">
                        {formatVND(item.price20DC)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-400">
                        {formatVND(item.price40DC)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-indigo-300 bg-indigo-950/20">
                        {formatVND(item.price40HC)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-400">
                        {formatVND(item.price45HC)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400">
                        {formatVND(item.price20RF)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-cyan-300 bg-cyan-950/20">
                        {formatVND(item.price40HR)}
                      </td>
                      <td className="py-3 px-3 text-center">{getResponsiblePartyBadge(item.responsiblePartyDefault)}</td>
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {item.estimatedDurationMin}'
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {item.status === 'ACTIVE' ? 'Đang Dùng' : 'Tạm Khóa'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Chỉnh sửa đơn giá & quy trình"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(item)}
                            title="Nhân bản dịch vụ"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.vietnameseName)}
                            title="Xóa khỏi biểu cước"
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg transition cursor-pointer"
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
        )}

        {/* View 2: Detailed Cards View */}
        {viewMode === 'CARD' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTariffs.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-4 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs rounded-md">
                          {item.cleaningCode}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded">
                          CEDEX: {item.cedexCode}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{item.vietnameseName}</h4>
                      <p className="text-[11px] text-slate-400">{item.name}</p>
                    </div>
                    {getCategoryBadge(item.category)}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{item.description}</p>

                  {/* Chemical & Equipment */}
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold block">Hóa chất chỉ định:</span>
                      <span className="font-semibold text-rose-300">{item.chemicalRequired}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Thiết bị thi công:</span>
                      <span className="text-slate-300">{item.equipmentUsed}</span>
                    </div>
                  </div>

                  {/* Price Matrix Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-bold">20DC</span>
                      <span className="text-xs font-black text-sky-400 font-mono">{formatVND(item.price20DC)}</span>
                    </div>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-bold">40HC</span>
                      <span className="text-xs font-black text-indigo-400 font-mono">{formatVND(item.price40HC)}</span>
                    </div>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-bold">40HR (Lạnh)</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">{formatVND(item.price40HR)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {item.estimatedDurationMin} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      {item.waterUsageLiters}L
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 3: Shipping Lines Custom Pricing */}
        {viewMode === 'SHIPPING_LINE' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['MAERSK', 'MSC', 'CMA-CGM', 'ONE', 'COSCO', 'EVERGREEN', 'YANGMING', 'WAN HAI'].map((line) => (
                <button
                  key={line}
                  onClick={() => setSelectedShippingLine(line)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedShippingLine === line
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {line}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Đơn giá thỏa thuận riêng cho Hãng Tàu: <span className="text-cyan-400 font-black">{selectedShippingLine}</span>
                </span>
                <span className="text-[11px] text-slate-400">Tự động áp dụng khi lập phiếu giám định và xuất e-EIR</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="py-2.5 px-3">Mã Dịch Vụ</th>
                      <th className="py-2.5 px-3">Tên Dịch Vụ Vệ Sinh</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá Gốc 20DC</th>
                      <th className="py-2.5 px-3 text-right text-cyan-400">Đơn Giá Riêng ({selectedShippingLine}) 20DC</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá Gốc 40HC</th>
                      <th className="py-2.5 px-3 text-right text-cyan-400">Đơn Giá Riêng ({selectedShippingLine}) 40HC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredTariffs.map((item) => {
                      const override = item.shippingLinePricing?.find((s) => s.shippingLine === selectedShippingLine);
                      const price20 = override ? override.price20 : item.price20DC;
                      const price40 = override ? override.price40 : item.price40HC;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{item.cleaningCode}</td>
                          <td className="py-2.5 px-3 font-medium text-white">{item.vietnameseName}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatVND(item.price20DC)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatVND(price20)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatVND(item.price40HC)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatVND(price40)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Add / Edit Cleaning Tariff Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-2xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTariff ? 'CHỈNH SỬA BIỂU PHÍ VỆ SINH' : 'THÊM MỚI DỊCH VỤ VỆ SINH CONTAINER'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cấu hình chi tiết mã CEDEX, đơn giá theo từng loại cont, hóa chất và bên chịu chi phí
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
            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Quick Template Presets */}
              {!editingTariff && (
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkle className="w-3.5 h-3.5 text-cyan-400" />
                      Mẫu Điền Nhanh Chuẩn Quy Trình (1-Click Presets):
                    </span>
                    <span className="text-[10px] text-slate-400">Nhấp để tự động điền toàn bộ thông số &amp; đơn giá</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: 'SWEEP', label: 'Quét dọn khô & rác' },
                      { key: 'WATER_200', label: 'Xịt nước 200 Bar' },
                      { key: 'HOT_WASH', label: 'Nước nóng 80°C tẩy mỡ' },
                      { key: 'CHEMICAL', label: 'Hóa chất kiềm D-30' },
                      { key: 'OZONE', label: 'Khử mùi Ozone O3' },
                      { key: 'STICKER', label: 'Bóc tem nhãn DG' },
                      { key: 'REEFER_FDA', label: 'Khử trùng Reefer FDA' },
                      { key: 'FLOOR_SAND', label: 'Chà nhám sàn gỗ' }
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.key}
                        onClick={() => handleApplyPreset(p.key)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-600 hover:text-slate-950 text-cyan-300 border border-cyan-700/50 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        + {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 1: General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Mã Dịch Vụ (Cleaning Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cleaningCode || ''}
                    onChange={(e) => setFormData({ ...formData, cleaningCode: e.target.value.toUpperCase() })}
                    placeholder="CLN_WASH_200BAR"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-mono font-bold text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Mã Quốc Tế CEDEX
                  </label>
                  <input
                    type="text"
                    value={formData.cedexCode || ''}
                    onChange={(e) => setFormData({ ...formData, cedexCode: e.target.value.toUpperCase() })}
                    placeholder="WW / CW / HW / DO..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Phân Loại Phương Pháp *
                  </label>
                  <select
                    value={formData.category || 'GENERAL_SWEEP'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="GENERAL_SWEEP">Quét dọn khô &amp; Rác dunnage</option>
                    <option value="WATER_PRESSURE">Xịt rửa nước áp lực 200 Bar</option>
                    <option value="HOT_WATER_WASH">Xịt rửa nước nóng 80°C</option>
                    <option value="CHEMICAL_WASH">Tẩy rửa hóa chất kiềm D-30</option>
                    <option value="DEODORIZATION">Khử mùi tanh nồng bằng khí Ozone</option>
                    <option value="STICKER_REMOVAL">Bóc tem nhãn cước cũ &amp; Nhãn DG</option>
                    <option value="REEFER_SANITATION">Khử trùng diệt khuẩn khoang lạnh FDA</option>
                    <option value="FLOOR_TREATMENT">Chà nhám &amp; Xử lý bề mặt sàn gỗ</option>
                    <option value="SPECIAL_TREATMENT">Xử lý nấm mốc chuyên sâu</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Tên Dịch Vụ (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vietnameseName || ''}
                    onChange={(e) => setFormData({ ...formData, vietnameseName: e.target.value })}
                    placeholder="Xịt rửa nước áp lực cao 200 Bar..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Tên Tiếng Anh (English Name)
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="High Pressure Water Wash..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Group 2: Container Types from Master Data & Pricing */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ContainerIcon className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white">
                      Danh Mục Loại Container Áp Dụng (Lấy Từ Danh Mục Chuẩn ISO-6346)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          applicableContainerTypes: containerTypes.map((c) => c.typeCode)
                        })
                      }
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    >
                      Chọn tất cả ({containerTypes.length})
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          applicableContainerTypes: ['20DC', '40DC', '40HC', '45HC', '20RF', '40HR']
                        })
                      }
                      className="text-[10px] text-slate-400 hover:text-slate-200 font-bold underline cursor-pointer"
                    >
                      Mặc định (6 loại phổ biến)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {containerTypes.map((ct) => {
                    const isSelected =
                      (formData.applicableContainerTypes || ['20DC', '40DC', '40HC', '45HC', '20RF', '40HR']).includes(
                        ct.typeCode
                      );

                    return (
                      <button
                        key={ct.id || ct.typeCode}
                        type="button"
                        onClick={() => {
                          const current = formData.applicableContainerTypes || [
                            '20DC',
                            '40DC',
                            '40HC',
                            '45HC',
                            '20RF',
                            '40HR'
                          ];
                          const updated = isSelected
                            ? current.filter((c) => c !== ct.typeCode)
                            : [...current, ct.typeCode];
                          setFormData({ ...formData, applicableContainerTypes: updated });
                        }}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/60 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-bold text-cyan-300 text-xs">{ct.typeCode}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{ct.isoCode}</div>
                        </div>
                        {isSelected ? (
                          <div className="w-4 h-4 bg-cyan-500 text-slate-950 rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-slate-700 rounded-full shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Price Matrix Configuration */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Cấu Hình Bảng Đơn Giá Theo Loại / Kích Cỡ Container (VNĐ)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold">Chưa bao gồm VAT 8%</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[10px] text-sky-400 font-bold mb-1">Cont 20' Khô (20DC)</label>
                    <input
                      type="number"
                      step={5000}
                      value={formData.price20DC || 0}
                      onChange={(e) => setFormData({ ...formData, price20DC: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sky-400 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-indigo-400 font-bold mb-1">Cont 40' Thường (40DC)</label>
                    <input
                      type="number"
                      step={5000}
                      value={formData.price40DC || 0}
                      onChange={(e) => setFormData({ ...formData, price40DC: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-indigo-400 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-indigo-300 font-bold mb-1">Cont 40' Cao (40HC)</label>
                    <input
                      type="number"
                      step={5000}
                      value={formData.price40HC || 0}
                      onChange={(e) => setFormData({ ...formData, price40HC: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-indigo-300 font-mono font-black text-xs ring-1 ring-indigo-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-purple-400 font-bold mb-1">Cont 45' Cao (45HC)</label>
                    <input
                      type="number"
                      step={5000}
                      value={formData.price45HC || 0}
                      onChange={(e) => setFormData({ ...formData, price45HC: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-purple-400 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-cyan-400 font-bold mb-1">Cont Lạnh 20RF</label>
                    <input
                      type="number"
                      step={5000}
                      value={formData.price20RF || 0}
                      onChange={(e) => setFormData({ ...formData, price20RF: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-cyan-400 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-cyan-300 font-bold mb-1">Cont Lạnh 40HR</label>
                    <input
                      type="number"
                      step={5000}
                      value={formData.price40HR || 0}
                      onChange={(e) => setFormData({ ...formData, price40HR: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-cyan-300 font-mono font-black text-xs ring-1 ring-cyan-500/40"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Technical Specifications & Chemicals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Bên Chịu Phí Mặc Định
                  </label>
                  <select
                    value={formData.responsiblePartyDefault || 'U'}
                    onChange={(e) => setFormData({ ...formData, responsiblePartyDefault: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="U">User (Chủ Hàng Đóng Hàng)</option>
                    <option value="O">Owner (Chủ Vỏ / Hãng Tàu)</option>
                    <option value="T">Transporter (Nhà Xe Vận Tải)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Thời Gian Xử Lý (Phút)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDurationMin || 30}
                    onChange={(e) => setFormData({ ...formData, estimatedDurationMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Lượng Nước Tiêu Thụ (Lít)
                  </label>
                  <input
                    type="number"
                    value={formData.waterUsageLiters || 0}
                    onChange={(e) => setFormData({ ...formData, waterUsageLiters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Trạng Thái Áp Dụng
                  </label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE - Đang Áp Dụng</option>
                    <option value="INACTIVE">INACTIVE - Tạm Khóa</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Hóa Chất Yêu Cầu Chỉ Định
                  </label>
                  <input
                    type="text"
                    value={formData.chemicalRequired || ''}
                    onChange={(e) => setFormData({ ...formData, chemicalRequired: e.target.value })}
                    placeholder="Chất tẩy rửa Eco Degreaser D-30 / Khí Ozone O3..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-300 text-xs font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Thiết Bị Chuyên Dụng
                  </label>
                  <input
                    type="text"
                    value={formData.equipmentUsed || ''}
                    onChange={(e) => setFormData({ ...formData, equipmentUsed: e.target.value })}
                    placeholder="Máy bơm áp lực 200 Bar / Máy chà sàn đĩa xoay..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Mô Tả Quy Trình Thi Công Làm Sạch (SOP)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả các bước thực hiện, tiêu chuẩn sạch đạt được..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTariff ? 'Lưu Thay Đổi' : 'Thêm Vào Biểu Phí'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Bulk Price Adjustment */}
      {isBulkAdjustOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <span>Điều Chỉnh Đơn Giá Hàng Loạt</span>
              </h3>
              <button onClick={() => setIsBulkAdjustOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Áp dụng tỷ lệ tăng/giảm giá tự động cho tất cả các loại container trong danh mục vệ sinh.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nhóm Dịch Vụ Áp Dụng:
                </label>
                <select
                  value={bulkApplyCategory}
                  onChange={(e) => setBulkApplyCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="ALL">Tất cả các nhóm ({tariffs.length} dịch vụ)</option>
                  <option value="GENERAL_SWEEP">Quét dọn khô &amp; Rác</option>
                  <option value="WATER_PRESSURE">Xịt nước 200 Bar</option>
                  <option value="HOT_WATER_WASH">Nước nóng 80°C</option>
                  <option value="CHEMICAL_WASH">Tẩy hóa chất kiềm D-30</option>
                  <option value="DEODORIZATION">Khử mùi Ozone O3</option>
                  <option value="REEFER_SANITATION">Khử trùng Reefer FDA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tỷ Lệ Điều Chỉnh (%):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={1}
                    value={bulkPercent}
                    onChange={(e) => setBulkPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-indigo-400 font-mono font-black text-sm"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {[-10, -5, 5, 10, 15].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => setBulkPercent(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        bulkPercent === pct
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pct >= 0 ? `+${pct}%` : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBulkAdjustOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyBulkAdjust}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                Xác Nhận Áp Dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
